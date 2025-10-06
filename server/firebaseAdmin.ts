import admin from "firebase-admin";

function ensureInitialized() {
  if (admin.apps.length) return;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      "Firebase Admin not initialized: missing FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY env vars."
    );
    return;
  }

  if (privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

export function getAdminApp() {
  ensureInitialized();
  if (!admin.apps.length) throw new Error("Firebase Admin is not initialized");
  return admin.app();
}

export function getAdminAuth() {
  ensureInitialized();
  if (!admin.apps.length) throw new Error("Firebase Admin is not initialized");
  return admin.auth();
}

export function getAdminDb() {
  ensureInitialized();
  if (!admin.apps.length) throw new Error("Firebase Admin is not initialized");
  return admin.firestore();
}
