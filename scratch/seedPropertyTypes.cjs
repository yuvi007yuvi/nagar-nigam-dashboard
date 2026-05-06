const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBa045D5Pw81eKyCvXUfs56GUz9U2SpvXs",
  authDomain: "nnmv-dashboard.firebaseapp.com",
  projectId: "portal-buddy-mvnn", // Using the one from MCP list
  storageBucket: "nnmv-dashboard.firebasestorage.app",
  messagingSenderId: "82429336836",
  appId: "1:82429336836:web:9c7933cbfe46c3cae14451"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const seedPropertyTypes = async () => {
    const types = ['Commercial', 'Industrial', 'Institutional', 'Residential'];
    const propertyTypesRef = collection(db, 'property_types');

    for (const type of types) {
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
    process.exit(0);
};

seedPropertyTypes().catch(err => {
    console.error(err);
    process.exit(1);
});
