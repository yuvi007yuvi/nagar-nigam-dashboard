import { db } from '../services/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

async function checkCollections() {
    try {
        const wardsSnap = await getDocs(collection(db, 'wards'));
        console.log(`Wards Count: ${wardsSnap.size}`);
        if (wardsSnap.size > 0) {
            console.log('Sample Ward:', wardsSnap.docs[0].data());
        }

        const zonesSnap = await getDocs(collection(db, 'zones'));
        console.log(`Zones Count: ${zonesSnap.size}`);
        if (zonesSnap.size > 0) {
            console.log('Sample Zone:', zonesSnap.docs[0].data());
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

checkCollections();
