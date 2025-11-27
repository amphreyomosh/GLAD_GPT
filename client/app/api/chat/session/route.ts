// Session-based chat endpoint
// Handles POST requests - simplified version without strict authentication
// Route: /api/chat/session

import { NextRequest, NextResponse } from 'next/server';
import { enhancedOpenAIService } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/chat/session - Request received');

    // Parse request body
    const { message, mode, fileAnalyses } = await req.json();

    if (!message || typeof message !== 'string') {
      console.error('Invalid message in request body');
      return NextResponse.json({ message: 'Message is required' }, { status: 400 });
    }

    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not configured');
      return NextResponse.json({ 
        message: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your .env.local file.' 
      }, { status: 500 });
    }

    console.log('Processing chat request...');

    // Prepare messages for OpenAI
    const messages = [{ role: 'user' as const, content: message }];

    // Use the specified mode or default to 'auto'
    const selectedMode = mode || 'auto';
    console.log('Using AI mode:', selectedMode);

    // Generate AI response
    const response = await enhancedOpenAIService.generateResponse(messages, selectedMode, fileAnalyses);
    const aiReply = response.mainResponse;

    console.log('✅ OpenAI response received, length:', aiReply?.length || 0);

    return NextResponse.json({
      reply: aiReply,
      metadata: { mode: selectedMode }
    });

  } catch (error: any) {
    console.error('❌ POST /api/chat/session error:', error);
    return NextResponse.json(
      {
        message: 'Failed to process chat request',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}