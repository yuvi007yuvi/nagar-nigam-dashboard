// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBa045D5Pw81eKyCvXUfs56GUz9U2SpvXs",
  authDomain: "nnmv-dashboard.firebaseapp.com",
  projectId: "nnmv-dashboard",
  storageBucket: "nnmv-dashboard.firebasestorage.app",
  messagingSenderId: "82429336836",
  appId: "1:82429336836:web:9c7933cbfe46c3cae14451",
  measurementId: "G-M74RW1CY9Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Conditionally initialize Analytics only in browser environments
let analytics;
if (typeof window !== 'undefined') {
  import('firebase/analytics').then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  }).catch((error) => {
    console.log('Analytics not available in this environment');
  });
}

export default app;