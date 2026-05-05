import { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests (from Vercel Cron)
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Fetch live data from the proxy/source
    // In Vercel environment, we call the absolute URL or the direct API
    const response = await fetch('https://oempowersupply.in/naturegreen.php?key=09C5E59F150AFA8481F39ADCF9405858&cmd=ALL,*');
    const rawData = await response.text();
    
    // Parse the custom format
    const lines = rawData.split('\n').filter(line => line.trim());
    const snapshots = lines.map(line => {
      const parts = line.split(',');
      if (parts.length < 15) return null;

      return {
        imei: parts[1],
        name: parts[2],
        lat: parts[3],
        lng: parts[4],
        speed: parts[5],
        angle: parts[6],
        timestamp: new Date().toISOString(),
        day: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp()
      };
    }).filter(s => s !== null);

    if (snapshots.length === 0) {
      return res.status(200).json({ message: 'No data to sync' });
    }

    // Save to Firestore as a single snapshot document
    const snapshotsCol = collection(db, 'vehicle_history_snapshots');
    await addDoc(snapshotsCol, {
      day: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      vehicles: snapshots, // Save all as array
      createdAt: serverTimestamp()
    });

    return res.status(200).json({ 
      message: 'Sync successful', 
      count: snapshots.length,
      timestamp: new Date().toISOString()
    });


  } catch (error: any) {
    console.error('Sync Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
