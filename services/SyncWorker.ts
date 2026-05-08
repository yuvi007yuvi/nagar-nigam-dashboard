import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { getDatabase, ref, set } from 'firebase/database';

// Firebase Config (Hardcoded defaults from firebaseConfig.ts for Node compatibility)
const firebaseConfig = {
  apiKey: "AIzaSyBa045D5Pw81eKyCvXUfs56GUz9U2SpvXs",
  authDomain: "nnmv-dashboard.firebaseapp.com",
  projectId: "nnmv-dashboard",
  storageBucket: "nnmv-dashboard.firebasestorage.app",
  messagingSenderId: "82429336836",
  appId: "1:82429336836:web:9c7933cbfe46c3cae14451"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const rtdb = getDatabase(app);

// GPS API Configuration
const GPS_FETCH_INTERVAL = 60000; // 1 minute
const HISTORY_SNAPSHOT_INTERVAL = 300000; // 5 minutes
const API_PRIMARY = 'https://nagarnigam.naturegreen.in/naturegreen.php?key=09C5E59F150AFA8481F39ADCF9405858&cmd=ALL,*';
const API_SECONDARY = 'https://nagarnigam.naturegreen.in/naturegreen.php?key=162814E902A9896655663D59F9BE98D5&cmd=ALL,*';

async function runWorker() {
    console.log('🚀 persistent GPS Background Sync Worker Started (24/7 Mode)');
    console.log('Monitoring vehicle movements every 60 seconds...');
    
    let lastHistorySnapshot = 0;

    while (true) {
        try {
            // 1. Fetch Live GPS Data from External APIs
            const [resp1, resp2] = await Promise.all([
                fetch(API_PRIMARY).then(r => r.json()).catch(() => ({ data: [] })),
                fetch(API_SECONDARY).then(r => r.json()).catch(() => ({ data: [] }))
            ]);

            const allGpsData = [...(resp1.data || []), ...(resp2.data || [])];
            
            if (allGpsData.length > 0) {
                // 2. Update Realtime Database for Live Dashboard View
                const locationsRef = ref(rtdb, 'locations');
                const updates: any = {};
                allGpsData.forEach((v: any) => {
                    updates[v.imei] = { 
                        ...v, 
                        lastUpdated: Date.now() 
                    };
                });
                await set(locationsRef, updates);

                // 3. Save History Snapshot (Every 5 mins)
                const now = Date.now();
                if (now - lastHistorySnapshot > HISTORY_SNAPSHOT_INTERVAL) {
                    const snapshotsCol = collection(db, 'vehicle_history_snapshots');
                    const day = new Date().toISOString().split('T')[0];
                    
                    await addDoc(snapshotsCol, {
                        day,
                        timestamp: new Date().toISOString(),
                        vehicles: allGpsData,
                        createdAt: serverTimestamp(),
                        isBackgroundWorker: true
                    });
                    
                    lastHistorySnapshot = now;
                    console.log(`[${new Date().toLocaleTimeString()}] ✅ Saved history snapshot for ${allGpsData.length} vehicles`);
                }
            }

        } catch (error) {
            console.error('❌ Worker Error:', error);
        }

        // Wait for next interval
        await new Promise(resolve => setTimeout(resolve, GPS_FETCH_INTERVAL));
    }
}

runWorker();
