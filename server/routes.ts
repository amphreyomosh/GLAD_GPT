import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { openaiService } from "./openai";
import { insertConversationSchema, insertMessageSchema } from "@shared/schema";
import multer from "multer";
import fs from "fs/promises";
import path from "path";

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

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // WebSocket setup
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Map<string, WebSocketClient>();

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

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Conversation routes
  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/conversations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
          const aiResponse = await openaiService.generateResponse(
            messages,
            conversation.aiMode as any,
            fileAnalyses
          );

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
          res.status(500).json({ 
            message: "Failed to generate AI response",
            userMessage 
          });
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
      const userId = req.user.claims.sub;
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
            content = await openaiService.analyzeImage(base64Image);
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
      const userId = req.user.claims.sub;
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

  return httpServer;
}
