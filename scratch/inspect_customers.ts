import { db } from '../services/firebaseConfig';
import { collection, getDocs, limit, query } from 'firebase/firestore';

async function inspectCustomers() {
    try {
        const q = query(collection(db, 'customers'), limit(5));
        const snapshot = await getDocs(q);
        console.log('Total customers found (limit 5):', snapshot.size);
        snapshot.forEach(doc => {
            console.log('ID:', doc.id, 'Data:', JSON.stringify(doc.data()));
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

inspectCustomers();
