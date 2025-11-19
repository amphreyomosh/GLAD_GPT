// Session-based chat endpoint
// Handles POST requests for backend-authenticated users (fallback from Firebase)
// Route: /api/chat/session

import { NextRequest, NextResponse } from 'next/server';
import { enhancedOpenAIService } from '@/lib/openai';

// In-memory storage for demo user chat sessions (in production, use database)
const demoUserChatSessions = new Map<string, Set<string>>();

// Get session from request - simplified for Next.js API routes
async function getUserFromSession(req: NextRequest) {
  // In a real implementation, you'd use NextAuth.js or similar
  // For now, we'll use a simple session check
  // This is a placeholder - you'd need to implement proper session management

  // Check for session cookie or header
  const sessionId = req.cookies.get('session')?.value;
  const authHeader = req.headers.get('authorization');

  if (!sessionId && !authHeader) {
    return null;
  }

  // Mock user lookup - in production, validate session from database
  if (sessionId === 'demo_session' || authHeader?.includes('demo')) {
    return { id: 'demo_user', email: 'demo@gladgpt.com', isAnonymous: true };
  }

  // For other sessions, you'd validate against your session store
  // For now, return null to indicate no valid session
  return null;
}

// Enforce chat attempt limits for demo users
function enforceSessionChatAttempts(user: any): boolean {
  if (user.id !== 'demo_user') {
    return true; // Allow unlimited for non-demo users
  }

  // For demo users, we don't limit messages within their first chat session
  // The limit would be enforced at the frontend level when creating new chats
  console.log('Demo user chatting - unlimited messages allowed within first chat session');
  return true;
}

// Record chat interaction (simplified)
async function recordChat(uid: string, prompt: string, response: string, mode?: string): Promise<void> {
  // In production, store in database
  console.log(`Chat recorded for session user ${uid}: ${prompt.slice(0, 50)}...`);
}

export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/chat/session - Session authentication request received');

    // Get user from session
    const user = await getUserFromSession(req);
    if (!user) {
      console.error('No valid session found');
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Check chat attempt limits
    if (!enforceSessionChatAttempts(user)) {
      return NextResponse.json(
        { message: "Chat limit exceeded" },
        { status: 403 }
      );
    }

    // Parse request body
    const { message, mode, fileAnalyses } = await req.json();

    if (!message || typeof message !== 'string') {
      console.error('Invalid message in request body');
      return NextResponse.json({ message: 'Message is required' }, { status: 400 });
    }

    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return NextResponse.json({ message: 'OpenAI API key not configured' }, { status: 500 });
    }

    const uid = user.id;
    const isAnonymous = user.id === 'demo_user';

    console.log('Processing session-based chat for user:', { uid, isAnonymous });

    // Prepare messages for OpenAI
    const messages = [{ role: 'user' as const, content: message }];

    // Use faster model for session-based auth
    const selectedMode = mode || 'fast';
    console.log('Calling OpenAI service with mode:', selectedMode);

    // Generate AI response
    const response = await enhancedOpenAIService.generateResponse(messages, selectedMode, fileAnalyses);
    const aiReply = response.mainResponse;

    console.log('OpenAI response received, length:', aiReply?.length || 0);

    // Record the chat interaction
    await recordChat(uid, message, aiReply, mode);

    console.log('Session-based chat request completed successfully for user:', uid);
    return NextResponse.json({
      reply: aiReply,
      metadata: { mode: selectedMode }
    });

  } catch (error: any) {
    console.error('POST /api/chat/session error:', error);
    return NextResponse.json(
      {
        message: 'Failed to process chat request',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}