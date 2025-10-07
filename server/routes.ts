import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage.js";
import { setupAuth, isAuthenticated } from "./auth.js";
import { enhancedOpenAIService } from "./openai.js";
import { insertConversationSchema, insertMessageSchema } from "../shared/schema.js";
import multer from "multer";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from 'node:url';
import { verifyFirebaseToken, enforceChatAttempts, incrementAnonymousAttempt, recordChat } from "./firebaseAuth.js";

// Simple in-memory storage for demo user chat sessions (in production, use a database)
const demoUserChatSessions = new Map<string, Set<string>>();

// Middleware to enforce chat limits for session-based authentication
const enforceSessionChatAttempts = (req: any, res: any, next: any) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Only limit demo users (guest users) - but allow unlimited messages within their first chat
  if (user.id === 'demo_user') {
    // For chat messages, we don't limit - guests can chat as much as they want in their first session
    // The limit will be enforced when creating new chats in the frontend
    console.log('Demo user chatting - unlimited messages allowed within first chat session');
  }

  next();
};

// Get the current file's directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File upload configuration
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not supported"));
    }
  },
});

interface WebSocketClient extends WebSocket {
  userId?: string;
  conversationId?: string;
}

export async function registerRoutes(app: Express): Promise<void> {
  // Auth middleware - properly await the setup
  try {
    await setupAuth(app);
    console.log('Auth setup completed successfully');
  } catch (err) {
    console.error('Failed to set up auth:', err);
  }

  // Simple health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // WebSocket setup
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Map<string, WebSocketClient>();
  
  // Start the WebSocket server on a different port
  const wsPort = parseInt(process.env.WS_PORT || '5002', 10);
  httpServer.listen(wsPort, '0.0.0.0', () => {
    console.log(`WebSocket server running on ws://localhost:${wsPort}/ws`);
  });

  wss.on('connection', (ws: WebSocketClient, req) => {
    console.log('WebSocket client connected');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'join':
            ws.userId = message.userId;
            ws.conversationId = message.conversationId;
            clients.set(message.userId, ws);
            break;
            
          case 'typing':
            // Broadcast typing indicator to other users in the same conversation
            clients.forEach((client, userId) => {
              if (client !== ws && client.conversationId === ws.conversationId && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'typing',
                  userId: ws.userId,
                  isTyping: message.isTyping
                }));
              }
            });
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (ws.userId) {
        clients.delete(ws.userId);
      }
    });
  });

  // Auth routes are now handled in auth.ts

  // Firebase-secured chat proxy
  app.post('/api/chat', verifyFirebaseToken, enforceChatAttempts, async (req: any, res) => {
    try {
      const { message, mode, fileAnalyses } = req.body || {};
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: 'Message is required' });
      }

      const uid: string = req.firebaseUser.uid;
      const isAnonymous: boolean = !!req.isAnonymous;

      const messages = [
        { role: 'user' as const, content: message }
      ];

      const response = await enhancedOpenAIService.generateResponse(messages, mode || 'auto', fileAnalyses);
      const ai = response.mainResponse;

      // Record chat (optional)
      await recordChat(uid, message, ai, mode);

      // Increment attempts if anonymous
      if (isAnonymous) {
        await incrementAnonymousAttempt(uid);
      }

      return res.json({ reply: ai, metadata: { mode: mode || 'auto' } });
    } catch (err) {
      console.error('POST /api/chat error:', err);
      return res.status(500).json({ message: 'Failed to process chat' });
    }
  });

  // Session-based chat endpoint for backend authentication
  app.post('/api/chat/session', isAuthenticated, enforceSessionChatAttempts, async (req: any, res) => {
    try {
      const { message, mode, fileAnalyses } = req.body || {};
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: 'Message is required' });
      }

      const user = req.user;
      const uid: string = user.id;
      const isAnonymous: boolean = user.id === 'demo_user';

      const messages = [
        { role: 'user' as const, content: message }
      ];

      // Use faster model for simple queries to improve response time
      const selectedMode = mode || 'fast'; // Default to fast mode for better response times
      const response = await enhancedOpenAIService.generateResponse(messages, selectedMode, fileAnalyses);
      const ai = response.mainResponse;

      // Record chat (optional) - skip if Firebase not configured
      try {
        await recordChat(uid, message, ai, mode);
      } catch (error) {
        console.log('Chat recording skipped (Firebase not configured)');
      }

      // For demo users, we don't increment per message - they can chat unlimited within their first session
      if (isAnonymous) {
        console.log('Demo user message processed - no limits on messages within first chat');
        
        // Still try Firebase tracking if available (for analytics)
        try {
          await incrementAnonymousAttempt(uid);
        } catch (error) {
          console.log('Firebase attempt tracking skipped (not configured)');
        }
      }

      return res.json({ reply: ai, metadata: { mode: mode || 'auto' } });
    } catch (err) {
      console.error('POST /api/chat/session error:', err);
      return res.status(500).json({ message: 'Failed to process chat' });
    }
  });

  // Conversation routes
  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/conversations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const conversationId = req.params.id;
      const conversation = await storage.getConversation(conversationId, userId);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.post('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertConversationSchema.parse({
        ...req.body,
        userId,
      });
      
      const conversation = await storage.createConversation(validatedData);
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.patch('/api/conversations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const conversationId = req.params.id;
      
      // Verify ownership
      const existing = await storage.getConversation(conversationId, userId);
      if (!existing) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      const conversation = await storage.updateConversation(conversationId, req.body);
      res.json(conversation);
    } catch (error) {
      console.error("Error updating conversation:", error);
      res.status(500).json({ message: "Failed to update conversation" });
    }
  });

  app.delete('/api/conversations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const conversationId = req.params.id;
      
      const deleted = await storage.deleteConversation(conversationId, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ message: "Failed to delete conversation" });
    }
  });

  // Message routes
  app.post('/api/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const conversationId = req.params.id;
      
      // Verify conversation ownership
      const conversation = await storage.getConversation(conversationId, userId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const { content, role, fileAnalyses } = req.body;
      
      // Create user message
      const userMessage = await storage.createMessage({
        conversationId,
        role: role || 'user',
        content,
        attachments: fileAnalyses || null,
      });

      // Generate AI response if user message
      if (role !== 'assistant') {
        // Broadcast typing indicator
        clients.forEach((client) => {
          if (client.userId !== userId && client.conversationId === conversationId && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'ai_typing',
              isTyping: true
            }));
          }
        });

        try {
          // Get conversation history for context
          const messages = conversation.messages.slice(-10).map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          }));

          // Add the new user message
          messages.push({ role: 'user', content });

          // Generate AI response
          const enhancedResponse = await enhancedOpenAIService.generateResponse(
            messages,
            conversation.aiMode as any,
            fileAnalyses
          );
          
          const aiResponse = enhancedResponse.mainResponse;

          // Create AI message
          const aiMessage = await storage.createMessage({
            conversationId,
            role: 'assistant',
            content: aiResponse,
          });

          // Update conversation title if this is the first exchange
          if (conversation.messages.length === 0) {
            const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
            await storage.updateConversation(conversationId, { title });
          }

          // Stop typing indicator
          clients.forEach((client) => {
            if (client.userId !== userId && client.conversationId === conversationId && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'ai_typing',
                isTyping: false
              }));
              
              // Send new message
              client.send(JSON.stringify({
                type: 'new_message',
                message: aiMessage
              }));
            }
          });

          res.json({ userMessage, aiMessage });
        } catch (aiError) {
          // Stop typing indicator on error
          clients.forEach((client) => {
            if (client.userId !== userId && client.conversationId === conversationId && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'ai_typing',
                isTyping: false
              }));
            }
          });
          
          console.error("AI response error:", aiError);
          
          // Create a fallback response instead of failing completely
          const fallbackResponse = "I apologize, but I'm currently experiencing technical difficulties with my AI models. Please check your OpenAI API key has access to at least one of these models: gpt-4.1-nano-2025-04-14, gpt-4.1-mini-2025-04-14, or contact support for assistance.";
          
          try {
            const aiMessage = await storage.createMessage({
              conversationId,
              role: 'assistant',
              content: fallbackResponse,
            });

            // Send fallback message via WebSocket
            clients.forEach((client) => {
              if (client.userId !== userId && client.conversationId === conversationId && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'new_message',
                  message: aiMessage
                }));
              }
            });

            res.json({ userMessage, aiMessage });
          } catch (fallbackError) {
            console.error("Fallback message creation failed:", fallbackError);
            res.status(500).json({ 
              message: "Failed to generate AI response",
              userMessage 
            });
          }
        }
      } else {
        res.json({ message: userMessage });
      }
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // File upload routes
  app.post('/api/upload', isAuthenticated, upload.array('files', 5), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadedFiles = [];
      const fileAnalyses = [];

      for (const file of files) {
        // Save file info to database
        const fileUpload = await storage.createFileUpload({
          userId,
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: file.path,
        });

        uploadedFiles.push(fileUpload);

        // Analyze file content for AI context
        try {
          let content = '';
          
          if (file.mimetype.startsWith('text/')) {
            content = await fs.readFile(file.path, 'utf-8');
          } else if (file.mimetype.startsWith('image/')) {
            const imageBuffer = await fs.readFile(file.path);
            const base64Image = imageBuffer.toString('base64');
            const imageAnalysis = await enhancedOpenAIService.analyzeImage(base64Image);
            content = imageAnalysis.mainResponse;
          } else if (file.mimetype === 'application/pdf' || file.mimetype.includes('document')) {
            // For PDFs and documents, we'd normally use a PDF parser
            // For now, we'll indicate it's a document that needs processing
            content = `Document file: ${file.originalname} (${file.mimetype}) - Content extraction would require additional PDF/document parsing libraries.`;
          }

          fileAnalyses.push({
            filename: file.originalname,
            content,
            mimeType: file.mimetype,
          });
        } catch (analysisError) {
          console.error("File analysis error:", analysisError);
          fileAnalyses.push({
            filename: file.originalname,
            content: `Error analyzing file: ${file.originalname}`,
            mimeType: file.mimetype,
          });
        }
      }

      res.json({ 
        files: uploadedFiles,
        analyses: fileAnalyses 
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ message: "Failed to upload files" });
    }
  });

  // Search messages
  app.get('/api/search', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const query = req.query.q as string;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const results = await storage.searchMessages(userId, query);
      res.json(results);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });
}
