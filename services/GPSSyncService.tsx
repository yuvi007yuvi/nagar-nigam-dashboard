import React, { useEffect, useState, useRef } from 'react';
import { fetchVehicleData, updateLiveTracking, saveHistorySnapshot } from './vehicleService';
import { getAllAdminData } from './databaseService';
import { rtdb, db } from './firebaseConfig';
import { ref, get, set } from 'firebase/database';
import { collection, addDoc, serverTimestamp, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useData } from './DataContext';

// Helper to calculate distance between two coordinates in meters
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
};

const GPS_FETCH_INTERVAL = 60000; // Fetch every 60 seconds (1 min) for better granularity
const HISTORY_SNAPSHOT_INTERVAL = 120000; // Save to Firestore every 2 minutes
const MASTER_TIMEOUT = 30000; // 30 seconds
const MOVEMENT_THRESHOLD = 0.0001; // ~10 meters in lat/lng delta - capture even slow movement

// Generate a unique ID for this tab/session
const myClientId = Math.random().toString(36).substring(7);

export const GPSSyncService: React.FC = () => {
    const [isMaster, setIsMaster] = useState(false);
    const lastPositionsRef = useRef<Map<string, { lat: number, lng: number }>>(new Map());
    const vehicleConfigsRef = useRef<any[]>([]);
    const lastConfigFetchRef = useRef<number>(0);
    const quotaExceededRef = useRef<boolean>(false);
    const { customers, coverageRecords, refreshData } = useData();
    const sessionCoveredTodayRef = useRef<Set<string>>(new Set());
    const [lastRefreshTime, setLastRefreshTime] = useState(0);

    // Sync sessionCoveredToday with actual coverageRecords on mount/refresh
    useEffect(() => {
        const today = new Date().toDateString();
        const covered = new Set<string>();
        coverageRecords.forEach(r => {
            const rDate = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
            if (rDate.toDateString() === today) {
                covered.add(r.customerId);
            }
        });
        sessionCoveredTodayRef.current = covered;
    }, [coverageRecords]);

    useEffect(() => {
        let lastHistorySnapshot = 0;

        const checkMaster = async () => {
            const masterRef = ref(rtdb, 'sync_master');
            try {
                const snapshot = await get(masterRef);
                const data = snapshot.val();
                
                if (!data || data.clientId === myClientId || (Date.now() - data.lastSeen > MASTER_TIMEOUT)) {
                    await set(masterRef, { 
                        clientId: myClientId, 
                        lastSeen: Date.now(),
                        active: true 
                    });
                    setIsMaster(true);
                    return true;
                }
                setIsMaster(false);
                return false;
            } catch (e: any) {
                // If we get permission denied here, we can't even check master
                if (e.message?.includes('Permission denied')) {
                    console.warn('RTDB Permission Denied: Please update your rules.');
                }
                return false;
            }
        };

        const sync = async () => {
            const amIMaster = await checkMaster();
            if (!amIMaster) return;

            try {
                // 1. Fetch/Refresh Vehicle Master Config (Only once every 10 mins or if empty)
                const now = Date.now();
                if (vehicleConfigsRef.current.length === 0 || (now - lastConfigFetchRef.current > 600000)) {
                    const configResult = await getAllAdminData('vehicles');
                    if (configResult.success) {
                        vehicleConfigsRef.current = configResult.data as any[];
                        lastConfigFetchRef.current = now;
                    }
                }
                
                const vehicleConfigs = vehicleConfigsRef.current;
                const trackingEnabledMap = new Map();
                const historyEnabledMap = new Map();
                
                vehicleConfigs.forEach(config => {
                    trackingEnabledMap.set(config.imei, config.isTrackingEnabled !== false);
                    historyEnabledMap.set(config.imei, config.isHistoryLoggingEnabled !== false);
                });

                // 2. Fetch Live Data
                const rawData = await fetchVehicleData();
                if (rawData && rawData.length > 0) {
                    
                    // Update movement status for all vehicles
                    rawData.forEach(v => {
                        const lat = parseFloat(v.lat);
                        const lng = parseFloat(v.lng);
                        if (!isNaN(lat) && !isNaN(lng)) {
                            lastPositionsRef.current.set(v.imei, { lat, lng });
                        }
                    });

                    const liveTrackingData = rawData.filter(v => {
                        return trackingEnabledMap.get(v.imei) !== false;
                    });

                    const historyData = rawData.filter(v => {
                        return historyEnabledMap.get(v.imei) !== false;
                    });

                    // 3. Update Live Tracking (RTDB)
                    if (liveTrackingData.length > 0) {
                        await updateLiveTracking(liveTrackingData);
                    }

                    // 4. Throttled History Snapshots (Firestore) - Only if quota not exceeded
                    const timestamp = Date.now();
                    if (!quotaExceededRef.current && (timestamp - lastHistorySnapshot >= HISTORY_SNAPSHOT_INTERVAL)) {
                        if (historyData.length > 0) {
                            try {
                                await saveHistorySnapshot(historyData);
                                lastHistorySnapshot = timestamp;
                            } catch (error: any) {
                                if (error.message?.includes('quota-exceeded') || error.code === 'resource-exhausted') {
                                    console.error('Firestore Quota Exceeded. Stopping history writes for today.');
                                    quotaExceededRef.current = true;
                                }
                            }
                        }
                    }

                    // 5. LIVE COVERAGE MATCHING
                    if (liveTrackingData.length > 0 && customers.length > 0) {
                        let newCoverageCreated = false;

                        for (const vehicle of liveTrackingData) {
                            const vLat = parseFloat(vehicle.lat);
                            const vLng = parseFloat(vehicle.lng);
                            if (isNaN(vLat) || isNaN(vLng)) continue;

                            // Find vehicle config for assigned route
                            const config = vehicleConfigs.find(c => c.imei === vehicle.imei);
                            const assignedRoute = config?.assignedRouteId;
                            if (!assignedRoute) continue;

                            // Filter POIs on this route that are NOT covered today
                            const routePOIs = customers.filter(p => 
                                p.routeId === assignedRoute && 
                                !sessionCoveredTodayRef.current.has(p.customerId || p.id)
                            );

                            for (const poi of routePOIs) {
                                if (!poi.lat || !poi.lng) continue;

                                const dist = calculateDistance(vLat, vLng, poi.lat, poi.lng);
                                if (dist <= 50) { // 50 meter threshold
                                    try {
                                        // Create coverage record
                                        await addDoc(collection(db, 'coverageRecords'), {
                                            customerId: poi.customerId || poi.id,
                                            customerName: poi.name || poi.ownerName || 'Unknown',
                                            vehicleId: config.plateNumber || config.name || vehicle.imei,
                                            ward: poi.ward || config.ward || '',
                                            zone: poi.zone || config.zone || '',
                                            routeId: assignedRoute,
                                            status: 'Visited',
                                            createdAt: serverTimestamp(),
                                            source: 'Live Tracking'
                                        });
                                        
                                        sessionCoveredTodayRef.current.add(poi.customerId || poi.id);
                                        newCoverageCreated = true;
                                        console.log(`Live Coverage Captured: ${poi.name} by ${config.plateNumber}`);
                                    } catch (e) {
                                        console.error('Error creating live coverage record:', e);
                                    }
                                }
                            }
                        }

                        if (newCoverageCreated) {
                            // Data updated, trigger refresh for UI if enough time passed
                            const now = Date.now();
                            if (now - lastRefreshTime > 10000) {
                                refreshData();
                                setLastRefreshTime(now);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('GPS Sync Error:', error);
            }
        };

        sync();
        const interval = setInterval(sync, GPS_FETCH_INTERVAL);
        return () => clearInterval(interval);
    }, [customers, coverageRecords, refreshData, lastRefreshTime]);

    return null; 
};
