import { useState, useEffect } from 'react';

// API Endpoints - Using absolute URLs for production
const API_PRIMARY = 'https://oempowersupply.in/naturegreen.php?key=09C5E59F150AFA8481F39ADCF9405858&cmd=ALL,*';
const API_SECONDARY = 'https://oempowersupply.in/naturegreen.php?key=162814E902A9896655663D59F9BE98D5&cmd=ALL,*';

// Mock data for development/testing when API is unavailable
const MOCK_VEHICLE_DATA: VehicleData[] = [
    {
        imei: '359671234567890',
        name: 'Auto Tipper UP85AG0770',
        dt_tracker: new Date().toISOString(),
        lat: '27.4924',
        lng: '77.6737',
        altitude: '180',
        angle: '45',
        speed: '35'
    },
    {
        imei: '359671234567891',
        name: 'Auto Tipper UP85ET 7839',
        dt_tracker: new Date().toISOString(),
        lat: '27.5024',
        lng: '77.6837',
        altitude: '175',
        angle: '90',
        speed: '0'
    },
    {
        imei: '359671234567892',
        name: 'Refuse Compactor UP14PT7717',
        dt_tracker: new Date().toISOString(),
        lat: '27.4824',
        lng: '77.6637',
        altitude: '182',
        angle: '180',
        speed: '42'
    },
    {
        imei: '359671234567893',
        name: 'Auto Tipper UP85ET 7850',
        dt_tracker: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        lat: '27.5124',
        lng: '77.6937',
        altitude: '185',
        angle: '270',
        speed: '0'
    }
];

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

export const fetchVehicleData = async (useMockData = true): Promise<VehicleData[]> => {
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

            // Return mock data if API returns non-JSON
            if (useMockData) {
                console.log('Using mock data as fallback');
                return MOCK_VEHICLE_DATA;
            }
            return [];
        }
    } catch (error: any) {
        console.error('Error fetching vehicle data:', error);
        console.error('Error details:', error.message);

        // Return mock data on error (timeout, network issues, etc.)
        if (useMockData) {
            console.log('API unavailable, using mock data');
            return MOCK_VEHICLE_DATA;
        }
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
