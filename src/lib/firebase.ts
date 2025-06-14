// This file initializes Firebase.
// Ensure your .env file has the correct NEXT_PUBLIC_FIREBASE_... variables set.

import {
  getApp,
  getApps,
  initializeApp,
  type FirebaseOptions
} from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage'; // If you use Firebase Storage
// import { getAnalytics } from "firebase/analytics"; // If you use Firebase Analytics
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Firebase configuration sourced from environment variables
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Optional
};

// Validate that all required Firebase config values are present
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId ||
  !firebaseConfig.storageBucket ||
  !firebaseConfig.messagingSenderId ||
  !firebaseConfig.appId
) {
  console.error(
    'Firebase configuration is missing. Ensure all NEXT_PUBLIC_FIREBASE_ environment variables are set in your .env file.'
  );
  // You might want to throw an error here or handle this case more gracefully
  // For now, we'll log an error. The app might not function correctly.
}

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
// const storage = getStorage(app); // If using storage
// const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null; // If using analytics

export { app, auth, db }; // Add storage, analytics if used
