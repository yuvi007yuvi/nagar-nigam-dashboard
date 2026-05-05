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
    lastCovered?: any;
    vehicleId?: string;
    imageUrl?: string;
}

export const getPOIs = async (ward?: string, zone?: string) => {
    try {
        // Attempt to fetch from Firestore
        const poiCollection = collection(db, 'households');
        let q = query(poiCollection);
        
        if (ward && ward !== 'All') {
            q = query(poiCollection, where('ward', '==', ward));
        }
        
        const querySnapshot = await getDocs(q);
        const firestorePOIs: POI[] = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            firestorePOIs.push({
                id: doc.id,
                lat: data.lat,
                lng: data.lng,
                address: data.address,
                ward: data.ward,
                ownerName: data.ownerName,
                houseNumber: data.houseNumber,
                status: data.status,
                lastCovered: data.lastCovered,
                vehicleId: data.vehicleId,
                imageUrl: data.imageUrl
            });
        });

        if (firestorePOIs.length > 0) {
            return { success: true, data: firestorePOIs };
        }

        // Fallback to mock data if Firestore is empty or fails
        const mockPOIs: POI[] = [];

        // Ward 35 - Bankhandi Area
        const w01RoadNodes = [
            [27.5002, 77.6698], [27.5015, 77.6712], [27.5028, 77.6725], [27.5042, 77.6738], [27.5055, 77.6752], [27.5068, 77.6765]
        ];
        w01RoadNodes.forEach((node, i) => {
            for (let j = 0; j < 10; j++) {
                const id = i * 10 + j + 1;
                mockPOIs.push({
                    id: `w35-h${id}`,
                    lat: node[0] + (Math.random() * 0.0005) - 0.00025,
                    lng: node[1] + (Math.random() * 0.0005) - 0.00025,
                    address: `House No. ${id}, Bankhandi Area, Vrindavan`,
                    ward: '35-Bankhandi',
                    ownerName: `Owner ${id}`, houseNumber: `H-${100 + id}`,
                    status: id > 45 ? 'pending' : 'covered',
                    lastCovered: id <= 45 ? Timestamp.now() : undefined,
                    vehicleId: 'UP85AG0770',
                    imageUrl: `https://picsum.photos/seed/h${id}/200/200`
                });
            }
        });

        // Ward 65 - Holi Gali
        const w02RoadNodes = [[27.4975, 77.6642], [27.4985, 77.6660], [27.4995, 77.6680]];
        w02RoadNodes.forEach((node, i) => {
            for (let j = 0; j < 5; j++) {
                const id = i * 5 + j + 1;
                mockPOIs.push({
                    id: `w65-h${id}`,
                    lat: node[0] + (Math.random() * 0.0003),
                    lng: node[1] + (Math.random() * 0.0003),
                    address: `Building ${id}, Holi Gali, Mathura`, ward: '65-Holi Gali',
                    ownerName: `Customer ${id}`, houseNumber: `R-${id}`, status: 'covered',
                    lastCovered: Timestamp.now(), vehicleId: 'UP85ET 7839',
                    imageUrl: `https://picsum.photos/seed/h65${id}/200/200`
                });
            }
        });

        // Ward 56 - Mandi Ramdas
        [[27.5050, 77.6800], [27.5065, 77.6820]].forEach((node, i) => {
            mockPOIs.push({
                id: `w56-h${i}`, lat: node[0] + 0.0001, lng: node[1] + 0.0001,
                address: `Mandi Ramdas Street House ${i}`, ward: '56-Mandi Ramdas',
                ownerName: `Owner ${i}`, houseNumber: `P-${i}`, status: 'pending'
            });
        });

        // Ward 30 - Krishna Nagar
        mockPOIs.push({ id: 'w30-1', lat: 27.4850, lng: 77.6600, address: 'Krishna Nagar Sector 1', ward: '30-Krishna Nagar', ownerName: 'Vikas', houseNumber: 'KN-1', status: 'covered', vehicleId: 'UP14PT7717' });
        mockPOIs.push({ id: 'w42-1', lat: 27.4750, lng: 77.6500, address: 'Laxmi Nagar Area', ward: '42-Laxmi Nagar', ownerName: 'Suresh', houseNumber: 'LN-1', status: 'pending' });

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
        '35-Bankhandi': {
            'W35R1': {
                plannedRoute: [[27.5002, 77.6698], [27.5015, 77.6712], [27.5028, 77.6725], [27.5042, 77.6738], [27.5055, 77.6752], [27.5068, 77.6765]],
                gpsHistory: [[27.5002, 77.6698], [27.5015, 77.6712], [27.5028, 77.6725]]
            }
        },
        '65-Holi Gali': {
            'W65R1': {
                plannedRoute: [[27.4975, 77.6642], [27.4982, 77.6655], [27.4988, 77.6668], [27.4995, 77.6680]],
                gpsHistory: [[27.4975, 77.6642], [27.4982, 77.6655]]
            }
        },
        '56-Mandi Ramdas': {
            'W56R1': {
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
        '35-Bankhandi': ['W35R1', 'W35R2'],
        '65-Holi Gali': ['W65R1', 'W65R2'],
        '56-Mandi Ramdas': ['W56R1'],
        '30-Krishna Nagar': ['W30R1'],
        '42-Laxmi Nagar': ['W42R1']
    };

    const data = ward && ward !== 'All' ? wardRoutesMap[ward] || [] : [];
    return { success: true, data };
};

export const getWardRoads = async (ward?: string) => {
    const roadNetwork: Record<string, any> = {
        '35-Bankhandi': [
            [[27.5000, 77.6690], [27.5020, 77.6715], [27.5040, 77.6740], [27.5060, 77.6760]],
            [[27.5010, 77.6700], [27.5015, 77.6720], [27.5020, 77.6745]]
        ],
        '65-Holi Gali': [
            [[27.4970, 77.6630], [27.4985, 77.6660], [27.5000, 77.6685]],
            [[27.4980, 77.6650], [27.4975, 77.6670]]
        ]
    };

    const data = (ward && ward !== 'All') ? roadNetwork[ward] || [] : [];
    return { success: true, data };
};

export const getCoverageStats = async (date: Date = new Date()) => {
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
