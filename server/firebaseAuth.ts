import type { Request, Response, NextFunction, RequestHandler } from "express";
import { getAdminAuth, getAdminDb } from "./firebaseAdmin.js";
import type { Transaction } from "firebase-admin/firestore";

export interface UserProfileDoc {
  uid: string;
  email?: string | null;
  attempts: number;
  lastActive: any;
}

export const verifyFirebaseToken: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing Authorization: Bearer <token>" });
    }
    const idToken = authHeader.substring("Bearer ".length);
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    (req as any).firebaseUser = decoded;
    next();
  } catch (err) {
    console.error("verifyFirebaseToken error:", err);
    return res.status(401).json({ message: "Invalid or expired Firebase ID token" });
  }
};

export async function getOrCreateUserProfile(uid: string, email?: string | null): Promise<UserProfileDoc> {
  const ref = getAdminDb().collection("users").doc(uid);
  const snap = await ref.get();
  if (!snap.exists) {
    const doc: UserProfileDoc = {
      uid,
      email: email || null,
      attempts: 0,
      lastActive: new Date(),
    };
    await ref.set(doc, { merge: true });
    return doc;
  }
  const data = snap.data() as UserProfileDoc;
  // Backfill missing fields
  const merged: UserProfileDoc = {
    uid,
    email: data?.email ?? (email || null),
    attempts: data?.attempts ?? 0,
    lastActive: new Date(),
  };
  await ref.set(merged, { merge: true });
  return merged;
}

export const enforceChatAttempts: RequestHandler = async (req, res, next) => {
  try {
    const firebaseUser = (req as any).firebaseUser as { uid: string; email?: string } | undefined;
    if (!firebaseUser) return res.status(401).json({ message: "Unauthorized" });

    const uid = firebaseUser.uid;
    const email = firebaseUser.email || null;

    const profile = await getOrCreateUserProfile(uid, email);

    // Anonymous users (no email) get only 3 free attempts
    if (!profile.email && profile.attempts >= 3) {
      return res.status(403).json({
        code: "ATTEMPTS_EXCEEDED",
        message: "You've used your 3 free chats. Please sign up to continue.",
      });
    }

    (req as any).userProfile = profile;
    (req as any).isAnonymous = !profile.email;

    next();
  } catch (err) {
    console.error("enforceChatAttempts error:", err);
    return res.status(500).json({ message: "Failed to validate chat attempts" });
  }
};

export async function incrementAnonymousAttempt(uid: string): Promise<void> {
  const db = getAdminDb();
  const ref = db.collection("users").doc(uid);
  await db.runTransaction(async (tx: Transaction) => {
    const snap = await tx.get(ref);
    const current = (snap.data() as UserProfileDoc | undefined) || { attempts: 0 } as any;
    tx.set(ref, { attempts: (current.attempts || 0) + 1, lastActive: new Date() }, { merge: true });
  });
}

export async function recordChat(uid: string, prompt: string, response: string, mode?: string) {
  try {
    if (process.env.STORE_CHAT_HISTORY !== "true") return;
    const ref = getAdminDb().collection("users").doc(uid).collection("chats").doc();
    await ref.set({
      prompt,
      response,
      mode: mode || "auto",
      createdAt: new Date(),
    });
  } catch (e) {
    console.warn("recordChat failed:", e);
  }
}
