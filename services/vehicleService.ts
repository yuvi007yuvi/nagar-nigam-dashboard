import { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
        console.log('Fetching vehicle data from:', API_PRIMARY);

        // Fetch from both APIs in parallel with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const [response1, response2] = await Promise.all([
            fetch(API_PRIMARY, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            }),
            fetch(API_SECONDARY, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            })
        ]);

        clearTimeout(timeoutId);

        console.log('Response 1 status:', response1.status);
        console.log('Response 2 status:', response2.status);

        // Check if responses are OK
        if (!response1.ok) {
            console.error('API 1 failed with status:', response1.status);
        }
        if (!response2.ok) {
            console.error('API 2 failed with status:', response2.status);
        }

        const contentType1 = response1.headers.get('content-type');
        const contentType2 = response2.headers.get('content-type');

        console.log('Content-Type 1:', contentType1);
        console.log('Content-Type 2:', contentType2);

        // Check if response is JSON
        if (contentType1 && contentType1.includes('application/json')) {
            const data1 = await response1.json();
            const vehiclesFn1 = data1.data || [];

            if (contentType2 && contentType2.includes('application/json')) {
                const data2 = await response2.json();
                const vehiclesFn2 = data2.data || [];

                return [...vehiclesFn1, ...vehiclesFn2];
            } else {
                return vehiclesFn1;
            }
        } else {
            console.warn('Response is not JSON. Content-Type:', contentType1);
            const text = await response1.text();
            console.warn('Response body (first 500 chars):', text.substring(0, 500));
            return [];
        }
    } catch (error: any) {
        console.error('Error fetching vehicle data:', error);
        console.error('Error details:', error.message);
        return [];
    }
};

// Hook for easy usage

// Function to save history snapshots to Firestore
export const saveHistorySnapshot = async (vehicles: VehicleData[]) => {
    if (!vehicles || vehicles.length === 0) return;

    try {
        const historyCol = collection(db, 'vehicle_history');
        const day = new Date().toISOString().split('T')[0];
        const timestamp = new Date().toISOString();

        // Save each vehicle as a document
        const promises = vehicles.map(v => 
            addDoc(historyCol, {
                ...v,
                day,
                timestamp,
                createdAt: serverTimestamp()
            })
        );

        await Promise.all(promises);
        console.log(`Saved history snapshot for ${vehicles.length} vehicles`);
    } catch (error) {
        console.error('Error saving history snapshot:', error);
    }
};

// Hook for easy usage
export const useVehicleData = (refreshInterval = 5000) => {
    const [vehicles, setVehicles] = useState<VehicleData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastSnapshot, setLastSnapshot] = useState<number>(0);

    const fetchData = async () => {
        try {
            const data = await fetchVehicleData();
            setVehicles(data);
            setLoading(false);

            // Trigger history snapshot every 5 seconds (5,000 ms) for high-resolution tracking
            const now = Date.now();
            if (now - lastSnapshot > 5000) {
                saveHistorySnapshot(data);
                setLastSnapshot(now);
            }
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, refreshInterval);
        return () => clearInterval(interval);
    }, [refreshInterval, lastSnapshot]);

    return { vehicles, loading, error, refetch: fetchData };
};
