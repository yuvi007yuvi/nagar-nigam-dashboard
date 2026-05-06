import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const seedPropertyTypes = async () => {
    const types = ['Commercial', 'Industrial', 'Institutional', 'Residential'];
    const propertyTypesRef = collection(db, 'property_types');

    for (const type of types) {
        // Check if exists
        const q = query(propertyTypesRef, where('name', '==', type));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            await addDoc(propertyTypesRef, {
                name: type,
                createdAt: new Date().toISOString()
            });
            console.log(`Added: ${type}`);
        } else {
            console.log(`Exists: ${type}`);
        }
    }
    console.log('Seeding complete.');
};

seedPropertyTypes();
