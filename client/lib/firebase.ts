import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'demo-app-id',
};

// Check if config is valid (not using demo values)
const isValidConfig = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                     process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'demo-key' &&
                     process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'your_api_key';

let app: FirebaseApp | null = null;
let auth: any = null;
let googleProvider: any = null;
let isFirebaseEnabled = false;

if (isValidConfig) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0]!;
    }
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    isFirebaseEnabled = true;
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
    isFirebaseEnabled = false;
  }
} else {
  console.warn('Firebase not configured - using fallback authentication');
  isFirebaseEnabled = false;
}

export { auth, googleProvider, isFirebaseEnabled };
