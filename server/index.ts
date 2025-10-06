import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction, type Express } from "express";
import { registerRoutes } from "./routes.js";
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { setupAuth } from "./auth.js";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple logger for development
const log = (message: string, source = 'express') => {
  const formattedTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
};

const app: Express = express();
// CORS for frontend on Vercel or local dev
const allowedOrigins = (process.env.CORS_ORIGIN || "*")
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Serve static files from the client/dist directory in production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(process.cwd(), 'client', 'dist');
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    log(`Serving static files from ${clientDistPath}`);
  } else {
    log(`Warning: Client build directory not found at ${clientDistPath}`, 'warn');
  }
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Register all API routes
registerRoutes(app);

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Only send response if headers haven't been sent already
  if (!res.headersSent) {
    res.status(status).json({ message });
  }
  
  console.error("Express error handler:", err);
});

// In development, we'll use Vite's dev server for the frontend
// In production, we'll serve the built frontend files
if (process.env.NODE_ENV === 'production') {
  // In production, serve the built frontend
  app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'client', 'dist', 'index.html'));
  });
} else {
  // In development, just return a simple message
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Development Server</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 2rem;
              }
              h1 { color: #2c3e50; }
              pre {
                background: #f5f5f5;
                padding: 1rem;
                border-radius: 4px;
                overflow-x: auto;
              }
              a { color: #3498db; text-decoration: none; }
              a:hover { text-decoration: underline; }
            </style>
          </head>
          <body>
            <h1>GLAD GPT Development Server</h1>
            <p>Welcome to the GLAD GPT backend server. The API is running and ready to handle requests.</p>
            
            <h2>Available Endpoints</h2>
            <ul>
              <li><code>GET /api/health</code> - Check server status</li>
              <li><code>POST /api/chat</code> - Send a chat message</li>
              <li><code>GET /api/conversations</code> - List conversations</li>
            </ul>
            
            <h2>Frontend Development</h2>
            <p>To run the frontend development server, open a new terminal and run:</p>
            <pre>cd client && npm install && npm run dev</pre>
            <p>Then open <a href="http://localhost:3000" target="_blank">http://localhost:3000</a> in your browser.</p>
            
            <h2>API Documentation</h2>
            <p>For detailed API documentation, check the project's README or source code.</p>
          </body>
        </html>
      `);
    } else {
      res.status(404).json({ message: 'Not Found' });
    }
  });
}

// Start the server
const port = parseInt(process.env.PORT || '5000', 10);
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Using ${process.env.USE_MOCK_STORAGE === 'true' ? 'mock' : 'database'} storage`);
});

// Handle server errors
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Consider restarting the server or handling the error appropriately
});