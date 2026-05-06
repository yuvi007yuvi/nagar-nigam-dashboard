import React, { useEffect, useState, useRef } from 'react';
import { fetchVehicleData, updateLiveTracking, saveHistorySnapshot } from './vehicleService';
import { getAllAdminData } from './databaseService';
import { rtdb } from './firebaseConfig';
import { ref, get, set } from 'firebase/database';

const GPS_FETCH_INTERVAL = 180000; // Fetch every 3 minutes (180s) to save quota
const HISTORY_SNAPSHOT_INTERVAL = 180000; // Save to Firestore every 3 minutes
const MASTER_TIMEOUT = 30000; // 30 seconds
const MOVEMENT_THRESHOLD = 0.0003; // ~30 meters in lat/lng delta

// Generate a unique ID for this tab/session
const myClientId = Math.random().toString(36).substring(7);

export const GPSSyncService: React.FC = () => {
    const [isMaster, setIsMaster] = useState(false);
    const lastPositionsRef = useRef<Map<string, { lat: number, lng: number }>>(new Map());
    const vehicleConfigsRef = useRef<any[]>([]);
    const lastConfigFetchRef = useRef<number>(0);
    const quotaExceededRef = useRef<boolean>(false);

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

        const hasMovedSignificantly = (imei: string, lat: number, lng: number) => {
            const last = lastPositionsRef.current.get(imei);
            if (!last) return true; // New vehicle, always sync

            const deltaLat = Math.abs(last.lat - lat);
            const deltaLng = Math.abs(last.lng - lng);
            
            return deltaLat > MOVEMENT_THRESHOLD || deltaLng > MOVEMENT_THRESHOLD;
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
                    
                    // Filter for movement and master config
                    const movedVehicles = rawData.filter(v => {
                        const lat = parseFloat(v.lat);
                        const lng = parseFloat(v.lng);
                        const moved = hasMovedSignificantly(v.imei, lat, lng);
                        
                        if (moved) {
                            lastPositionsRef.current.set(v.imei, { lat, lng });
                        }
                        return moved;
                    });

                    const liveTrackingData = movedVehicles.filter(v => {
                        return trackingEnabledMap.get(v.imei) !== false;
                    });

                    const historyData = movedVehicles.filter(v => {
                        return historyEnabledMap.get(v.imei) !== false;
                    });

                    // 3. Update Live Tracking (RTDB)
                    if (liveTrackingData.length > 0) {
                        await updateLiveTracking(liveTrackingData);
                    }

                    // 4. Throttled History Snapshots (Firestore) - Only if quota not exceeded
                    const now = Date.now();
                    if (!quotaExceededRef.current && (now - lastHistorySnapshot >= HISTORY_SNAPSHOT_INTERVAL)) {
                        if (historyData.length > 0) {
                            try {
                                await saveHistorySnapshot(historyData);
                                lastHistorySnapshot = now;
                            } catch (error: any) {
                                if (error.message?.includes('quota-exceeded') || error.code === 'resource-exhausted') {
                                    console.error('Firestore Quota Exceeded. Stopping history writes for today.');
                                    quotaExceededRef.current = true;
                                }
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
    }, []);

    return null; 
};

