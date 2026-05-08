import { db } from '../services/firebaseConfig';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

async function checkHistoryStart() {
    const today = new Date().toISOString().split('T')[0];
    const q = query(
        collection(db, 'vehicle_history_snapshots'),
        where('day', '==', today),
        orderBy('timestamp', 'asc'),
        limit(1)
    );
    
    const snap = await getDocs(q);
    if (!snap.empty) {
        const first = snap.docs[0].data();
        console.log('First snapshot of the day:', first.timestamp?.toDate?.() || first.timestamp);
    } else {
        console.log('No snapshots found for today yet.');
    }
}

checkHistoryStart();
