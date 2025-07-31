import {
  users,
  conversations,
  messages,
  fileUploads,
  type User,
  type UpsertUser,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type FileUpload,
  type InsertFileUpload,
  type ConversationWithMessages,
  type MessageWithFiles,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
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
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
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
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  }

  async getConversation(id: string, userId: string): Promise<ConversationWithMessages | undefined> {
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
    const [created] = await db
      .insert(conversations)
      .values(conversation)
      .returning();
    return created;
  }

  async updateConversation(id: string, updates: Partial<InsertConversation>): Promise<Conversation> {
    const [updated] = await db
      .update(conversations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return updated;
  }

  async deleteConversation(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  // Message operations
  async getMessages(conversationId: string): Promise<MessageWithFiles[]> {
    const messagesResult = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    // Get file uploads for each message
    const messagesWithFiles = await Promise.all(
      messagesResult.map(async (message) => {
        const files = await db
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
    const [created] = await db
      .insert(messages)
      .values(message)
      .returning();
    return created;
  }

  async searchMessages(userId: string, query: string): Promise<MessageWithFiles[]> {
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
        const files = await db
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
    const [created] = await db
      .insert(fileUploads)
      .values(fileUpload)
      .returning();
    return created;
  }

  async getFileUpload(id: string): Promise<FileUpload | undefined> {
    const [file] = await db
      .select()
      .from(fileUploads)
      .where(eq(fileUploads.id, id));
    return file;
  }

  async deleteFileUpload(id: string): Promise<boolean> {
    const result = await db
      .delete(fileUploads)
      .where(eq(fileUploads.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
