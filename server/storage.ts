// Import types from the shared schema
import type {
  User,
  UpsertUser,
  Conversation,
  InsertConversation,
  Message,
  InsertMessage,
  FileUpload,
  InsertFileUpload,
  ConversationWithMessages,
  MessageWithFiles
} from "../shared/schema.js";

// Import database and schema
import { db } from "./db.js";
import { users, conversations, messages, fileUploads } from "../shared/schema.js";
import { eq, desc, and, or, ilike } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Conversation operations
  getConversations(userId: string): Promise<Conversation[]>;
  getConversation(id: string, userId: string): Promise<ConversationWithMessages | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, updates: Partial<InsertConversation>): Promise<Conversation>;
  deleteConversation(id: string, userId: string): Promise<boolean>;
  
  // Message operations
  getMessages(conversationId: string): Promise<MessageWithFiles[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  searchMessages(userId: string, query: string): Promise<MessageWithFiles[]>;
  
  // File operations
  createFileUpload(fileUpload: InsertFileUpload): Promise<FileUpload>;
  getFileUpload(id: string): Promise<FileUpload | undefined>;
  deleteFileUpload(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    if (db === null) throw new Error('Database not available');
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (db === null) throw new Error('Database not available');
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (db === null) throw new Error('Database not available');
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Conversation operations
  async getConversations(userId: string): Promise<Conversation[]> {
    if (db === null) throw new Error('Database not available');
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  }

  async getConversation(id: string, userId: string): Promise<ConversationWithMessages | undefined> {
    if (db === null) throw new Error('Database not available');
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
    
    if (!conversation) return undefined;

    const conversationMessages = await this.getMessages(id);
    
    return {
      ...conversation,
      messages: conversationMessages,
    };
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    if (db === null) throw new Error('Database not available');
    const [created] = await db
      .insert(conversations)
      .values(conversation)
      .returning();
    return created;
  }

  async updateConversation(id: string, updates: Partial<InsertConversation>): Promise<Conversation> {
    if (db === null) throw new Error('Database not available');
    const [updated] = await db
      .update(conversations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return updated;
  }

  async deleteConversation(id: string, userId: string): Promise<boolean> {
    if (db === null) throw new Error('Database not available');
    const result = await db
      .delete(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  // Message operations
  async getMessages(conversationId: string): Promise<MessageWithFiles[]> {
    if (db === null) throw new Error('Database not available');
    const messagesResult = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    // Get file uploads for each message
    const messagesWithFiles = await Promise.all(
      messagesResult.map(async (message) => {
        const files = await db!
          .select()
          .from(fileUploads)
          .where(eq(fileUploads.messageId, message.id));
        
        return {
          ...message,
          fileUploads: files,
        };
      })
    );

    return messagesWithFiles;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    if (db === null) throw new Error('Database not available');
    const [created] = await db
      .insert(messages)
      .values(message)
      .returning();
    return created;
  }

  async searchMessages(userId: string, query: string): Promise<MessageWithFiles[]> {
    if (db === null) throw new Error('Database not available');
    const userConversations = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(eq(conversations.userId, userId));

    const conversationIds = userConversations.map(c => c.id);
    
    if (conversationIds.length === 0) return [];

    const searchResults = await db
      .select()
      .from(messages)
      .where(
        and(
          or(...conversationIds.map(id => eq(messages.conversationId, id))),
          ilike(messages.content, `%${query}%`)
        )
      )
      .orderBy(desc(messages.createdAt));

    // Get file uploads for each message
    const messagesWithFiles = await Promise.all(
      searchResults.map(async (message) => {
        const files = await db!
          .select()
          .from(fileUploads)
          .where(eq(fileUploads.messageId, message.id));
        
        return {
          ...message,
          fileUploads: files,
        };
      })
    );

    return messagesWithFiles;
  }

  // File operations
  async createFileUpload(fileUpload: InsertFileUpload): Promise<FileUpload> {
    if (db === null) throw new Error('Database not available');
    const [created] = await db
      .insert(fileUploads)
      .values(fileUpload)
      .returning();
    return created;
  }

  async getFileUpload(id: string): Promise<FileUpload | undefined> {
    if (db === null) throw new Error('Database not available');
    const [file] = await db
      .select()
      .from(fileUploads)
      .where(eq(fileUploads.id, id));
    return file;
  }

  async deleteFileUpload(id: string): Promise<boolean> {
    if (db === null) throw new Error('Database not available');
    const result = await db
      .delete(fileUploads)
      .where(eq(fileUploads.id, id));
    return (result.rowCount || 0) > 0;
  }
}

// Mock storage for development without database
export class MockStorage implements IStorage {
  private users = new Map<string, User>();
  private conversations = new Map<string, Conversation>();
  private messages = new Map<string, Message[]>();
  private fileUploads = new Map<string, FileUpload>();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of Array.from(this.users.values())) {
      if (user.email === email) return user;
    }
    return undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      id: userData.id || `user_${Date.now()}`,
      email: userData.email || null,
      password: userData.password || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(c => c.userId === userId)
      .sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
  }

  async getConversation(id: string, userId: string): Promise<ConversationWithMessages | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation || conversation.userId !== userId) return undefined;
    
    const conversationMessages = this.messages.get(id) || [];
    return {
      ...conversation,
      messages: conversationMessages.map(msg => ({ ...msg, fileUploads: [] })),
    };
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const created: Conversation = {
      id: `conv_${Date.now()}`,
      title: conversation.title || "New Chat",
      userId: conversation.userId,
      aiMode: conversation.aiMode || "chat",
      isPrivate: conversation.isPrivate || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.conversations.set(created.id, created);
    this.messages.set(created.id, []);
    return created;
  }

  async updateConversation(id: string, updates: Partial<InsertConversation>): Promise<Conversation> {
    const conversation = this.conversations.get(id);
    if (!conversation) throw new Error('Conversation not found');

    const updated = { ...conversation, updatedAt: new Date() };
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        (updated as any)[key] = value;
      }
    }
    this.conversations.set(id, updated);
    return updated;
  }

  async deleteConversation(id: string, userId: string): Promise<boolean> {
    const conversation = this.conversations.get(id);
    if (!conversation || conversation.userId !== userId) return false;
    
    this.conversations.delete(id);
    this.messages.delete(id);
    return true;
  }

  async getMessages(conversationId: string): Promise<MessageWithFiles[]> {
    const msgs = this.messages.get(conversationId) || [];
    return msgs.map(msg => ({ ...msg, fileUploads: [] }));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const created: Message = {
      id: `msg_${Date.now()}`,
      conversationId: message.conversationId,
      role: message.role,
      content: message.content,
      attachments: message.attachments,
      createdAt: new Date(),
    };
    
    const msgs = this.messages.get(message.conversationId) || [];
    msgs.push(created);
    this.messages.set(message.conversationId, msgs);
    return created;
  }

  async searchMessages(userId: string, query: string): Promise<MessageWithFiles[]> {
    const results: MessageWithFiles[] = [];
    for (const [convId, msgs] of Array.from(this.messages.entries())) {
      const conversation = this.conversations.get(convId);
      if (conversation?.userId === userId) {
        const matching = msgs.filter((msg: Message) =>
          msg.content && msg.content.toLowerCase().includes(query.toLowerCase())
        );
        results.push(...matching.map((msg: Message) => ({ ...msg, fileUploads: [] })));
      }
    }
    return results.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createFileUpload(fileUpload: InsertFileUpload): Promise<FileUpload> {
    const created: FileUpload = {
      id: `file_${Date.now()}`,
      userId: fileUpload.userId,
      filename: fileUpload.filename,
      originalName: fileUpload.originalName,
      mimeType: fileUpload.mimeType,
      size: fileUpload.size,
      path: fileUpload.path,
      messageId: fileUpload.messageId || null,
      createdAt: new Date(),
    };
    this.fileUploads.set(created.id, created);
    return created;
  }

  async getFileUpload(id: string): Promise<FileUpload | undefined> {
    return this.fileUploads.get(id);
  }

  async deleteFileUpload(id: string): Promise<boolean> {
    return this.fileUploads.delete(id);
  }
}

// Use database storage when available, otherwise mock storage
export const storage = db ? new DatabaseStorage() : new MockStorage();
