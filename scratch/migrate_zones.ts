
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBa045D5Pw81eKyCvXUfs56GUz9U2SpvXs",
  authDomain: "nnmv-dashboard.firebaseapp.com",
  projectId: "nnmv-dashboard",
  storageBucket: "nnmv-dashboard.firebasestorage.app",
  messagingSenderId: "82429336836",
  appId: "1:82429336836:web:9c7933cbfe46c3cae14451"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ZONE_MAP: Record<string, string> = {
    "1": "Z1-C1",
    "2": "Z2-C1",
    "3": "Z3-C1",
    "4": "Z4-C1"
};

async function migrate() {
    console.log("Starting Migration...");

    // 1. Update Zones
    const zonesSnap = await getDocs(collection(db, 'zones'));
    console.log(`Found ${zonesSnap.size} zones.`);
    
    for (const d of zonesSnap.docs) {
        const data = d.data();
        if (ZONE_MAP[data.name]) {
            console.log(`Updating Zone: ${data.name} -> ${ZONE_MAP[data.name]}`);
            await updateDoc(doc(db, 'zones', d.id), {
                name: ZONE_MAP[data.name]
            });
        }
    }

    // 2. Update Wards
    const wardsSnap = await getDocs(collection(db, 'wards'));
    console.log(`Found ${wardsSnap.size} wards.`);
    
    for (const d of wardsSnap.docs) {
        const data = d.data();
        if (ZONE_MAP[data.zoneName]) {
            console.log(`Updating Ward ${data.name}: Zone ${data.zoneName} -> ${ZONE_MAP[data.zoneName]}`);
            await updateDoc(doc(db, 'wards', d.id), {
                zoneName: ZONE_MAP[data.zoneName]
            });
        }
    }

    // 3. Update Customers (optional but good for consistency)
    const custSnap = await getDocs(collection(db, 'customers'));
    console.log(`Found ${custSnap.size} customers.`);
    for (const d of custSnap.docs) {
        const data = d.data();
        let needsUpdate = false;
        const updates: any = {};
        
        if (ZONE_MAP[data.zone]) {
            updates.zone = ZONE_MAP[data.zone];
            needsUpdate = true;
        }
        
        if (needsUpdate) {
            console.log(`Updating Customer ${data.name}`);
            await updateDoc(doc(db, 'customers', d.id), updates);
        }
    }

    console.log("Migration Complete!");
    process.exit(0);
}

migrate().catch(err => {
    console.error("Migration failed:", err);
    process.exit(1);
});
