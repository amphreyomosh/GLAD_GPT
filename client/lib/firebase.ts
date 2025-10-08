import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInAnonymously, connectAuthEmulator } from "firebase/auth";

// Check if we have valid Firebase configuration
const hasValidFirebaseConfig = () => {
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  ];
  
  return requiredVars.every(varName => {
    const value = process.env[varName];
    return value && 
           value !== 'demo-key' && 
           value !== 'your-firebase-api-key-here' &&
           value !== 'your-project.firebaseapp.com' &&
           value !== 'your-project-id';
  });
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: any = null;
let googleProvider: any = null;
let isFirebaseEnabled = false;

const isValidConfig = hasValidFirebaseConfig();

if (isValidConfig) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0]!;
    }
    auth = getAuth(app);
    
    // Enable anonymous authentication
    googleProvider = new GoogleAuthProvider();
    isFirebaseEnabled = true;
    console.log('Firebase initialized successfully with project:', firebaseConfig.projectId);
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
    isFirebaseEnabled = false;
  }
} else {
  console.warn('Firebase not configured properly - using backend authentication fallback');
  console.warn('Missing or invalid Firebase environment variables. Please check your .env.local file.');
  isFirebaseEnabled = false;
}

// Helper function to sign in anonymously
export const signInAsGuest = async () => {
  if (!auth || !isFirebaseEnabled) {
    throw new Error('Firebase not configured for anonymous authentication');
  }
  
  try {
    const result = await signInAnonymously(auth);
    console.log('Anonymous sign-in successful:', result.user.uid);
    return result.user;
  } catch (error: any) {
    console.error('Anonymous sign-in failed:', error);
    throw new Error(`Anonymous sign-in failed: ${error.message}`);
  }
};

export { auth, googleProvider, isFirebaseEnabled };
