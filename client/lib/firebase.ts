import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInAnonymously, connectAuthEmulator } from "firebase/auth";

// Check if we have valid Firebase configuration
const hasValidFirebaseConfig = () => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  
  // Strict validation - only enable Firebase if all required values are properly set
  return !!(apiKey && authDomain && projectId && 
           apiKey.length > 20 && // Firebase API keys are typically longer
           authDomain.includes('.firebaseapp.com') && 
           projectId.length > 3 &&
           !apiKey.includes('your-') &&
           !authDomain.includes('your-project') &&
           !projectId.includes('your-project'));
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

console.log('Firebase configuration check:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  isValidConfig
});

if (isValidConfig) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0]!;
    }
    auth = getAuth(app);
    
    // Enable anonymous authentication and Google provider
    googleProvider = new GoogleAuthProvider();
    // Add additional scopes if needed
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
    
    isFirebaseEnabled = true;
    console.log('✅ Firebase initialized successfully with project:', firebaseConfig.projectId);
    console.log('✅ Google authentication provider configured');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    isFirebaseEnabled = false;
  }
} else {
  console.warn('⚠️ Firebase not configured properly - using backend authentication fallback');
  console.warn('Missing or invalid Firebase environment variables:');
  console.warn('- NEXT_PUBLIC_FIREBASE_API_KEY:', firebaseConfig.apiKey ? '✅ Set' : '❌ Missing');
  console.warn('- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', firebaseConfig.authDomain ? '✅ Set' : '❌ Missing');
  console.warn('- NEXT_PUBLIC_FIREBASE_PROJECT_ID:', firebaseConfig.projectId ? '✅ Set' : '❌ Missing');
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
