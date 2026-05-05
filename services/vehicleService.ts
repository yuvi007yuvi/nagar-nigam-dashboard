import { useState, useEffect } from 'react';
import { db, rtdb } from './firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, set, onValue } from 'firebase/database';

// API Endpoints - Using proxied URLs to avoid CORS issues
const API_PRIMARY = '/gps-api/naturegreen.php?key=09C5E59F150AFA8481F39ADCF9405858&cmd=ALL,*';
const API_SECONDARY = '/gps-api/naturegreen.php?key=162814E902A9896655663D59F9BE98D5&cmd=ALL,*';

export interface VehicleData {
    imei: string;
    name: string;
    dt_tracker: string;
    lat: string;
    lng: string;
    altitude: string;
    angle: string;
    speed: string;
}

export const fetchVehicleData = async (): Promise<VehicleData[]> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const [response1, response2] = await Promise.all([
            fetch(API_PRIMARY, {
                method: 'GET',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                signal: controller.signal
            }),
            fetch(API_SECONDARY, {
                method: 'GET',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                signal: controller.signal
            })
        ]);

        clearTimeout(timeoutId);

        if (response1.ok) {
            const data1 = await response1.json();
            const vehiclesFn1 = data1.data || [];
            
            if (response2.ok) {
                const data2 = await response2.json();
                const vehiclesFn2 = data2.data || [];
                return [...vehiclesFn1, ...vehiclesFn2];
            }
            return vehiclesFn1;
        }
        return [];
    } catch (error: any) {
        console.error('Error fetching vehicle data:', error);
        return [];
    }
};

// Update Live Status in Realtime Database (Cheap/Fast)
export const updateLiveTracking = async (vehicles: VehicleData[]) => {
    if (!vehicles || vehicles.length === 0) return;
    
    try {
        const locationsRef = ref(rtdb, 'locations');
        const updates: any = {};
        
        vehicles.forEach(v => {
            updates[v.imei] = {
                ...v,
                lastUpdated: Date.now()
            };
        });
        
        await set(locationsRef, updates);
    } catch (error) {
        console.error('Error updating locations in RTDB:', error);
    }
};

// Function to save history snapshots to Firestore (Expensive/Throttled)
export const saveHistorySnapshot = async (vehicles: VehicleData[]) => {
    if (!vehicles || vehicles.length === 0) return;

    try {
        const snapshotsCol = collection(db, 'vehicle_history_snapshots');
        const day = new Date().toISOString().split('T')[0];
        
        await addDoc(snapshotsCol, {
            day,
            timestamp: new Date().toISOString(),
            vehicles: vehicles, 
            createdAt: serverTimestamp()
        });
        
        console.log(`Saved history snapshot for ${vehicles.length} vehicles`);
    } catch (error) {
        // Error handling moved to GPSSyncService for quota detection
        throw error; 
    }
};


// --- Master Sync Election Logic ---
export const tryToBecomeSyncMaster = async (clientId: string) => {
    const masterRef = ref(rtdb, 'sync_master');
    try {
        const now = Date.now();
        await set(masterRef, {
            clientId,
            lastSeen: now
        });
        return true;
    } catch (e) {
        return false;
    }
};

// Hook to listen to Live Tracking from RTDB
export const useLiveTracking = () => {
    const [vehicles, setVehicles] = useState<VehicleData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const locationsRef = ref(rtdb, 'locations');
        
        const unsubscribe = onValue(locationsRef, (snapshot) => {
            try {
                const data = snapshot.val();
                if (data) {
                    const vehicleArray = Object.values(data) as VehicleData[];
                    setVehicles(vehicleArray);
                }
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return { vehicles, loading, error, refetch: () => {} };
};


// Legacy support for useVehicleData (now uses RTDB reader)
export const useVehicleData = (refreshInterval = 5000) => {
    return useLiveTracking();
};



