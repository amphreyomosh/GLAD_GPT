import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema.ts";

// This is needed for ES modules
const WebSocket = globalThis.WebSocket || ws;

// Check if we should use mock storage
const useMockStorage = process.env.USE_MOCK_STORAGE === 'true' || !process.env.DATABASE_URL;

if (!useMockStorage) {
  // Configure Neon for serverless environments
  if (typeof WebSocket === 'undefined') {
    neonConfig.webSocketConstructor = ws;
  }

  if (!process.env.DATABASE_URL) {
    console.warn(
      "DATABASE_URL not set. Using mock storage. To use a real database, set DATABASE_URL in your .env file.",
    );
  }
}

export const pool = !useMockStorage && process.env.DATABASE_URL 
  ? new Pool({ connectionString: process.env.DATABASE_URL }) 
  : null;

export const db = pool ? drizzle({ client: pool, schema }) : null;