import { db } from '../services/firebaseConfig';
import { collection, getDocs, limit, query } from 'firebase/firestore';

async function inspectVehicles() {
    try {
        const q = query(collection(db, 'vehicles'), limit(5));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Vehicle Samples:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

inspectVehicles();
