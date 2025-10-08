import admin from "firebase-admin";

let isInitialized = false;
let initializationError: string | null = null;

function ensureInitialized() {
  if (isInitialized) return;
  if (admin.apps.length) {
    isInitialized = true;
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    initializationError = "Firebase Admin not configured: missing FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY env vars.";
    console.warn(initializationError);
    return;
  }

  try {
    // Normalize private key: remove surrounding quotes and convert literal \n to real newlines
    privateKey = privateKey.trim();
    if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
      privateKey = privateKey.slice(1, -1);
    }
    if (privateKey.includes("\\n")) {
      privateKey = privateKey.replace(/\\n/g, "\n");
    }

    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
    
    isInitialized = true;
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    initializationError = `Firebase Admin initialization failed: ${error}`;
    console.error(initializationError);
  }
}

export function isFirebaseAdminAvailable(): boolean {
  ensureInitialized();
  return isInitialized && admin.apps.length > 0;
}

export function getAdminApp() {
  ensureInitialized();
  if (!isFirebaseAdminAvailable()) {
    throw new Error(initializationError || "Firebase Admin is not initialized");
  }
  return admin.app();
}

export function getAdminAuth() {
  ensureInitialized();
  if (!isFirebaseAdminAvailable()) {
    throw new Error(initializationError || "Firebase Admin is not initialized");
  }
  return admin.auth();
}

export function getAdminDb() {
  ensureInitialized();
  if (!isFirebaseAdminAvailable()) {
    throw new Error(initializationError || "Firebase Admin is not initialized");
  }
  return admin.firestore();
}
