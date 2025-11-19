import * as admin from 'firebase-admin';

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  } else {
    console.warn('Firebase Admin credentials not set, using application default');
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
}

export function isFirebaseAdminAvailable(): boolean {
  return admin.apps.length > 0;
}

export function getAdminAuth() {
  if (!isFirebaseAdminAvailable()) {
    throw new Error("Firebase Admin not initialized");
  }
  return admin.auth();
}

export function getAdminDb() {
  if (!isFirebaseAdminAvailable()) {
    throw new Error("Firebase Admin not initialized");
  }
  return admin.firestore();
}

export default admin;