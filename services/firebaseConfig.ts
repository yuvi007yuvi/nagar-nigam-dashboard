// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBa045D5Pw81eKyCvXUfs56GUz9U2SpvXs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nnmv-dashboard.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nnmv-dashboard",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nnmv-dashboard.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "82429336836",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:82429336836:web:9c7933cbfe46c3cae14451",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-M74RW1CY9Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Conditionally initialize Analytics only in browser environments
let analytics;
if (typeof window !== 'undefined' && import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
  import('firebase/analytics').then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  }).catch((error) => {
    console.log('Analytics not available in this environment');
  });
}

export default app;