import { db } from './firebaseConfig';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';

export interface POI {
    id: string;
    lat: number;
    lng: number;
    address: string;
    ward: string;
    ownerName: string;
    houseNumber: string;
    status: 'covered' | 'pending';
    lastCovered?: Timestamp;
    vehicleId?: string;
}

export const getPOIs = async (ward?: string) => {
    try {
        // Mock data for demonstration - in a real app, fetch from Firestore
        const mockPOIs: POI[] = [
            { id: '1', lat: 27.4924, lng: 77.6737, address: 'Sector 1, Vrindavan', ward: 'Ward 1', ownerName: 'Rajesh Kumar', houseNumber: 'H-101', status: 'covered', lastCovered: Timestamp.now(), vehicleId: 'TRUCK-001' },
            { id: '2', lat: 27.4950, lng: 77.6750, address: 'Sector 2, Vrindavan', ward: 'Ward 1', ownerName: 'Suresh Singh', houseNumber: 'H-202', status: 'pending' },
            { id: '3', lat: 27.4910, lng: 77.6710, address: 'Main Road, Vrindavan', ward: 'Ward 2', ownerName: 'Amit Sharma', houseNumber: 'H-303', status: 'covered', lastCovered: Timestamp.now(), vehicleId: 'TRUCK-002' },
            { id: '4', lat: 27.4980, lng: 77.6780, address: 'Old City, Vrindavan', ward: 'Ward 3', ownerName: 'Vikas Gupta', houseNumber: 'H-404', status: 'pending' },
            { id: '5', lat: 27.4890, lng: 77.6690, address: 'Gali No. 5, Vrindavan', ward: 'Ward 1', ownerName: 'Priya Verma', houseNumber: 'H-505', status: 'covered', lastCovered: Timestamp.now(), vehicleId: 'TRUCK-001' },
        ];

        let filteredPOIs = mockPOIs;
        if (ward) {
            filteredPOIs = mockPOIs.filter(p => p.ward === ward);
        }

        return { success: true, data: filteredPOIs };
    } catch (error: any) {
        console.error('Error getting POIs:', error);
        return { success: false, error: error.message };
    }
};

export const getCoverageStats = async (date: Date = new Date()) => {
    // Return summary stats
    return {
        success: true,
        data: {
            totalPOIs: 1250,
            coveredToday: 845,
            coveragePercentage: 67.6,
            activeVehicles: 12,
            pendingPOIs: 405
        }
    };
};
