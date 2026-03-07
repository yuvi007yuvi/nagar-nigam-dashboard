import { useState, useEffect } from 'react';

// API Endpoints - Using absolute URLs for production
const API_PRIMARY = 'https://oempowersupply.in/naturegreen.php?key=09C5E59F150AFA8481F39ADCF9405858&cmd=ALL,*';
const API_SECONDARY = 'https://oempowersupply.in/naturegreen.php?key=162814E902A9896655663D59F9BE98D5&cmd=ALL,*';

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
        
        // Fetch from both APIs in parallel
        const [response1, response2] = await Promise.all([
            fetch(API_PRIMARY, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }),
            fetch(API_SECONDARY, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
        ]);

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
            console.error('Response is not JSON. Content-Type:', contentType1);
            const text = await response1.text();
            console.error('Response body (first 500 chars):', text.substring(0, 500));
            return [];
        }
    } catch (error: any) {
        console.error('Error fetching vehicle data:', error);
        console.error('Error details:', error.message);
        return [];
    }
};

// Hook for easy usage
export const useVehicleData = (refreshInterval = 30000) => {
    const [vehicles, setVehicles] = useState<VehicleData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const data = await fetchVehicleData();
            setVehicles(data);
            setLoading(false);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, refreshInterval);
        return () => clearInterval(interval);
    }, [refreshInterval]);

    return { vehicles, loading, error, refetch: fetchData };
};
