import { useState, useEffect } from 'react';

// API Endpoints
const API_PRIMARY = '/api/vehicle?key=09C5E59F150AFA8481F39ADCF9405858&cmd=ALL,*';
const API_SECONDARY = '/api/vehicle?key=162814E902A9896655663D59F9BE98D5&cmd=ALL,*';

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
        // Fetch from both APIs in parallel
        const [response1, response2] = await Promise.all([
            fetch(API_PRIMARY),
            fetch(API_SECONDARY)
        ]);

        const data1 = await response1.json();
        const data2 = await response2.json();

        // Combine data from both APIs
        // Assuming both return { data: [...] } structure
        const vehiclesFn1 = data1.data || [];
        const vehiclesFn2 = data2.data || [];

        // Combine and remove duplicates based on IMEI if necessary
        // For now, just concatenating
        return [...vehiclesFn1, ...vehiclesFn2];
    } catch (error) {
        console.error('Error fetching vehicle data:', error);
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
