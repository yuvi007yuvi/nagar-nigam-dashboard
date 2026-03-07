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

export const getPOIs = async (ward?: string, zone?: string) => {
    try {
        const mockPOIs: POI[] = [];

        // Ward 01 - Bhaktivedanta Swami Marg Area (Real on-road alignment)
        const w01RoadNodes = [
            [27.5002, 77.6698], [27.5015, 77.6712], [27.5028, 77.6725], [27.5042, 77.6738], [27.5055, 77.6752], [27.5068, 77.6765]
        ];
        w01RoadNodes.forEach((node, i) => {
            for (let j = 0; j < 10; j++) {
                const id = i * 10 + j + 1;
                mockPOIs.push({
                    id: `w01-h${id}`,
                    lat: node[0] + (Math.random() * 0.0005) - 0.00025,
                    lng: node[1] + (Math.random() * 0.0005) - 0.00025,
                    address: `House No. ${id}, Bhaktivedanta Swami Marg, Vrindavan`,
                    ward: 'Ward 01',
                    ownerName: `Owner ${id}`, houseNumber: `H-${100 + id}`,
                    status: id > 45 ? 'pending' : 'covered',
                    lastCovered: id <= 45 ? Timestamp.now() : undefined,
                    vehicleId: 'TIPPER-001'
                });
            }
        });

        // Ward 02 - Raman Reti Road alignment
        const w02RoadNodes = [[27.4975, 77.6642], [27.4985, 77.6660], [27.4995, 77.6680]];
        w02RoadNodes.forEach((node, i) => {
            for (let j = 0; j < 5; j++) {
                const id = i * 5 + j + 1;
                mockPOIs.push({
                    id: `w02-h${id}`,
                    lat: node[0] + (Math.random() * 0.0003),
                    lng: node[1] + (Math.random() * 0.0003),
                    address: `Building ${id}, Raman Reti, Vrindavan`, ward: 'Ward 02',
                    ownerName: `Customer ${id}`, houseNumber: `R-${id}`, status: 'covered',
                    lastCovered: Timestamp.now(), vehicleId: 'TIPPER-002'
                });
            }
        });

        // Ward 03 - Parikrama Marg alignment
        [[27.5050, 77.6800], [27.5065, 77.6820]].forEach((node, i) => {
            mockPOIs.push({
                id: `w03-h${i}`, lat: node[0] + 0.0001, lng: node[1] + 0.0001,
                address: `Parikrama Marg House ${i}`, ward: 'Ward 03',
                ownerName: `Owner ${i}`, houseNumber: `P-${i}`, status: 'pending'
            });
        });

        // Wards 04 & 05
        mockPOIs.push({ id: 'w04-1', lat: 27.4850, lng: 77.6600, address: 'Prem Mandir Area', ward: 'Ward 04', ownerName: 'Vikas', houseNumber: 'PM-1', status: 'covered', vehicleId: 'TIPPER-004' });
        mockPOIs.push({ id: 'w05-1', lat: 27.4750, lng: 77.6500, address: 'Mathura Road', ward: 'Ward 05', ownerName: 'Suresh', houseNumber: 'MR-1', status: 'pending' });

        let filteredPOIs = mockPOIs;
        if (ward && ward !== 'All') {
            filteredPOIs = filteredPOIs.filter(p => p.ward === ward);
        }

        return { success: true, data: filteredPOIs };
    } catch (error: any) {
        console.error('Error getting POIs:', error);
        return { success: false, error: error.message };
    }
};

export const getRouteData = async (ward?: string, routeId?: string) => {
    const routes: Record<string, any> = {
        'Ward 01': {
            'W01R1': {
                plannedRoute: [[27.5002, 77.6698], [27.5015, 77.6712], [27.5028, 77.6725], [27.5042, 77.6738], [27.5055, 77.6752], [27.5068, 77.6765]],
                gpsHistory: [[27.5002, 77.6698], [27.5015, 77.6712], [27.5028, 77.6725]]
            },
            'W01R2': {
                plannedRoute: [[27.5000, 77.6690], [27.5010, 77.6700], [27.5020, 77.6710]],
                gpsHistory: [[27.5000, 77.6690]]
            }
        },
        'Ward 02': {
            'W02R1': {
                plannedRoute: [[27.4975, 77.6642], [27.4982, 77.6655], [27.4988, 77.6668], [27.4995, 77.6680]],
                gpsHistory: [[27.4975, 77.6642], [27.4982, 77.6655]]
            }
        },
        'Ward 03': {
            'W03R1': {
                plannedRoute: [[27.5045, 77.6795], [27.5052, 77.6805], [27.5058, 77.6815]],
                gpsHistory: [[27.5045, 77.6795]]
            }
        }
    };

    const data = (ward && ward !== 'All') ? (routes[ward]?.[routeId || ''] || Object.values(routes[ward] || {})[0] || null) : null;
    return { success: true, data };
};

export const getWardRoutes = async (ward?: string) => {
    const wardRoutesMap: Record<string, string[]> = {
        'Ward 01': ['W01R1', 'W01R2', 'W01R3'],
        'Ward 02': ['W02R1', 'W02R2'],
        'Ward 03': ['W03R1'],
        'Ward 04': ['W04R1'],
        'Ward 05': ['W05R1']
    };

    const data = ward && ward !== 'All' ? wardRoutesMap[ward] || [] : [];
    return { success: true, data };
};

export const getWardRoads = async (ward?: string) => {
    // Mock road network for Vrindavan wards
    const roadNetwork: Record<string, any> = {
        'Ward 01': [
            // Major Road (Bhaktivedanta Swami Marg)
            [[27.5000, 77.6690], [27.5020, 77.6715], [27.5040, 77.6740], [27.5060, 77.6760]],
            // Secondary Road 1
            [[27.5010, 77.6700], [27.5015, 77.6720], [27.5020, 77.6745]],
            // Parallel Alley
            [[27.5005, 77.6695], [27.5025, 77.6720]]
        ],
        'Ward 02': [
            // Raman Reti Road network
            [[27.4970, 77.6630], [27.4985, 77.6660], [27.5000, 77.6685]],
            [[27.4980, 77.6650], [27.4975, 77.6670]]
        ]
    };

    const data = (ward && ward !== 'All') ? roadNetwork[ward] || [] : [];
    return { success: true, data };
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
