import { db } from './firebaseConfig';
import { collection, getDocs, query, where, Timestamp, getCountFromServer } from 'firebase/firestore';

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
    zone?: string;
    routeId?: string;
    lastVisited?: string;
}

export const getPOIs = async (ward?: string, zone?: string) => {
    try {
        const poiCollection = collection(db, 'customers');
        let q = query(poiCollection);
        
        if (ward && ward !== 'All') {
            q = query(q, where('ward', '==', ward));
        }
        
        if (zone && zone !== 'All') {
            q = query(q, where('zone', '==', zone));
        }
        
        const querySnapshot = await getDocs(q);
        const firestorePOIs: POI[] = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            firestorePOIs.push({
                id: doc.id,
                lat: data.lat || 0,
                lng: data.lng || 0,
                address: data.address || '',
                ward: data.ward || '',
                ownerName: data.name || data.ownerName || 'Unknown Owner',
                houseNumber: data.houseNumber || 'N/A',
                status: data.status || 'pending',
                lastCovered: data.lastCovered,
                vehicleId: data.vehicleId || 'N/A',
                imageUrl: data.imageUrl || '',
                zone: data.zone || '',
                routeId: data.routeId || '',
                lastVisited: data.lastVisited || ''
            });
        });

        return { success: true, data: firestorePOIs };
    } catch (error: any) {
        console.error('Error getting POIs:', error);
        return { success: false, error: error.message };
    }
};

export const getRouteData = async (id: string) => {
    try {
        const { getLargeDocument } = await import('./databaseService');
        const result = await getLargeDocument('ward_routes', id, 'data');
        if (result.success) {
            const data = result.data.data;
            return { success: true, data: typeof data === 'string' ? JSON.parse(data) : data };
        }
        return result;
    } catch (error: any) {
        console.error('Error getting route data:', error);
        return { success: false, error: error.message };
    }
};

export const getWardRoutes = async (ward?: string) => {
    try {
        const { getAllAdminData } = await import('./databaseService');
        const result = await getAllAdminData('ward_routes');
        if (result.success) {
            let routes = result.data;
            if (ward && ward !== 'All') {
                routes = routes.filter((r: any) => r.ward === ward);
            }
            return { success: true, data: routes };
        }
        return result;
    } catch (error: any) {
        console.error('Error getting ward routes:', error);
        return { success: false, error: error.message, data: [] };
    }
};

export const getWardRoads = async (ward?: string) => {
    try {
        // Road networks should come from GIS/GeoJSON services
        return { success: true, data: [] };
    } catch (error: any) {
        console.error('Error getting ward roads:', error);
        return { success: false, error: error.message };
    }
};

export const getCoverageStats = async (ward?: string, zone?: string, date: Date = new Date()) => {
    try {
        const poiCollection = collection(db, 'customers');
        let totalQ = query(poiCollection);
        let coveredQ = query(poiCollection, where('status', '==', 'covered'));

        if (ward && ward !== 'All') {
            totalQ = query(totalQ, where('ward', '==', ward));
            coveredQ = query(coveredQ, where('ward', '==', ward));
        }
        if (zone && zone !== 'All') {
            totalQ = query(totalQ, where('zone', '==', zone));
            coveredQ = query(coveredQ, where('zone', '==', zone));
        }

        const totalSnapshot = await getCountFromServer(totalQ);
        const totalCount = totalSnapshot.data().count;

        const coveredSnapshot = await getCountFromServer(coveredQ);
        const coveredCount = coveredSnapshot.data().count;

        // Fallback: If no status field is used, we check today's coverageRecords
        let actualCovered = coveredCount;
        if (coveredCount === 0 && totalCount > 0) {
            const { getRecentDocuments } = await import('./databaseService');
            const recordsResult = await getRecentDocuments('coverageRecords', 3000);
            if (recordsResult.success) {
                const today = date.toDateString();
                const todayScans = recordsResult.data.filter((r: any) => {
                    const rDate = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
                    const matchesWard = !ward || ward === 'All' || r.ward === ward;
                    const matchesZone = !zone || zone === 'All' || r.zone === zone;
                    return rDate.toDateString() === today && matchesWard && matchesZone;
                });
                actualCovered = new Set(todayScans.map((s: any) => s.customerId)).size;
            }
        }

        const coveragePercentage = totalCount > 0 ? (actualCovered / totalCount) * 100 : 0;

        return {
            success: true,
            data: {
                totalPOIs: totalCount,
                coveredToday: actualCovered,
                coveragePercentage: parseFloat(coveragePercentage.toFixed(1)),
                activeVehicles: 0, 
                pendingPOIs: Math.max(0, totalCount - actualCovered)
            }
        };
    } catch (error: any) {
        console.error('Error getting coverage stats:', error);
        return {
            success: true,
            data: {
                totalPOIs: 0,
                coveredToday: 0,
                coveragePercentage: 0,
                activeVehicles: 0,
                pendingPOIs: 0
            }
        };
    }
};
