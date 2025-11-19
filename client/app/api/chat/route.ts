// Firebase-authenticated chat endpoint
// Handles POST requests for Firebase users with ID token authentication
// Route: /api/chat

import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken, isFirebaseAdminAvailable } from '@/lib/admin';
import { enhancedOpenAIService } from '@/lib/openai';

// Firebase user profile interface
interface UserProfile {
  uid: string;
  email?: string | null;
  attempts: number;
  lastActive: Date;
}

// In-memory storage for user profiles (in production, use database)
const userProfiles = new Map<string, UserProfile>();

// Get or create user profile
async function getOrCreateUserProfile(uid: string, email?: string | null): Promise<UserProfile> {
  let profile = userProfiles.get(uid);

  if (!profile) {
    profile = {
      uid,
      email: email || null,
      attempts: 0,
      lastActive: new Date(),
    };
    userProfiles.set(uid, profile);
  }

  // Update last active
  profile.lastActive = new Date();
  return profile;
}

// Increment anonymous user attempts
function incrementAnonymousAttempt(uid: string): void {
  const profile = userProfiles.get(uid);
  if (profile) {
    profile.attempts += 1;
  }
}

// Record chat interaction (simplified)
async function recordChat(uid: string, prompt: string, response: string, mode?: string): Promise<void> {
  // In production, store in database
  console.log(`Chat recorded for user ${uid}: ${prompt.slice(0, 50)}...`);
}

export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/chat - Firebase authentication request received');

    // Check if Firebase Admin is configured
    if (!isFirebaseAdminAvailable()) {
      console.error('Firebase Admin not configured');
      return NextResponse.json(
        { message: "Firebase authentication not configured", code: "FIREBASE_ADMIN_NOT_CONFIGURED" },
        { status: 503 }
      );
    }

    // Extract and verify Firebase ID token
    const authHeader = req.headers.get('authorization') || "";
    if (!authHeader.startsWith("Bearer ")) {
      console.error('Missing or invalid Authorization header');
      return NextResponse.json(
        { message: "Missing Authorization: Bearer <token>" },
        { status: 401 }
      );
    }

    const idToken = authHeader.substring("Bearer ".length);

    let firebaseUser;
    try {
      firebaseUser = await verifyFirebaseToken(idToken);
      console.log('Firebase token verified for user:', firebaseUser.uid);
    } catch (error) {
      console.error('Firebase token verification failed:', error);
      return NextResponse.json(
        { message: "Invalid or expired Firebase ID token" },
        { status: 401 }
      );
    }

    // Parse request body
    const { message, mode, fileAnalyses } = await req.json();

    if (!message || typeof message !== 'string') {
      console.error('Invalid message in request body');
      return NextResponse.json({ message: 'Message is required' }, { status: 400 });
    }

    const uid = firebaseUser.uid;
    const email = firebaseUser.email || null;

    // Get or create user profile for rate limiting
    const profile = await getOrCreateUserProfile(uid, email);

    // Rate limiting for anonymous users (no email)
    if (!profile.email && profile.attempts >= 3) {
      console.log('Anonymous user exceeded attempt limit:', uid);
      return NextResponse.json({
        code: "ATTEMPTS_EXCEEDED",
        message: "You've used your 3 free chats. Please sign up to continue.",
      }, { status: 403 });
    }

    const isAnonymous = !profile.email;
    console.log('Processing chat for user:', { uid, isAnonymous, attempts: profile.attempts });

    // Prepare messages for OpenAI
    const messages = [{ role: 'user' as const, content: message }];

    // Generate AI response
    console.log('Calling OpenAI service...');
    const response = await enhancedOpenAIService.generateResponse(messages, mode || 'auto', fileAnalyses);
    const aiReply = response.mainResponse;

    // Record the chat interaction
    await recordChat(uid, message, aiReply, mode);

    // Increment attempts for anonymous users
    if (isAnonymous) {
      incrementAnonymousAttempt(uid);
    }

    console.log('Chat request completed successfully for user:', uid);
    return NextResponse.json({
      reply: aiReply,
      metadata: { mode: mode || 'auto' }
    });

  } catch (error: any) {
    console.error('POST /api/chat error:', error);
    return NextResponse.json(
      {
        message: 'Failed to process chat request',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}