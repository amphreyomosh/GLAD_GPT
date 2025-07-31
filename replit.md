# AI Chat Application with React and Express

## Overview

This is a full-stack AI chat application built with a React frontend and Express backend. The application provides a Grok-like AI assistant interface with support for multiple AI modes, file uploads, real-time messaging via WebSockets, and user authentication through Replit Auth.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and production builds
- **UI Library**: Radix UI components with Tailwind CSS styling using shadcn/ui design system
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom CSS variables for theming (dark Grok-inspired design)

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **API Design**: RESTful endpoints with WebSocket support for real-time features
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL storage

### Database Design
- **ORM**: Drizzle ORM for type-safe database interactions
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema**: 
  - Users table for authentication
  - Conversations table for chat sessions
  - Messages table for chat history
  - File uploads table for attachment management
  - Sessions table for authentication state

## Key Components

### Authentication System
- **Strategy**: OpenID Connect via Replit Auth
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Security**: HTTP-only cookies, CSRF protection, secure session handling
- **User Management**: Automatic user creation/updates on login

### AI Integration
- **Provider**: OpenAI API with GPT-4o and GPT-4o-mini models
- **AI Modes**: 
  - Fast (gpt-4o-mini for quick responses)
  - Auto (intelligent mode selection)
  - Expert (detailed analysis with gpt-4o)
  - Heavy (comprehensive multi-expert approach)
- **Conversation Context**: Maintains chat history for contextual responses

### File Upload System
- **Storage**: Local filesystem with Multer middleware
- **Supported Types**: PDF, Word documents, plain text, images (PNG, JPEG, GIF)
- **Size Limits**: 10MB per file
- **Analysis**: AI-powered file content analysis and summarization

### Real-time Communication
- **Technology**: WebSocket server for bi-directional communication
- **Features**: 
  - Typing indicators
  - Real-time message delivery
  - Connection status monitoring
  - Room-based messaging (per conversation)

## Data Flow

1. **User Authentication**: 
   - User initiates login via Replit Auth
   - OIDC flow validates credentials
   - Session created and stored in PostgreSQL
   - User data upserted to database

2. **Chat Interaction**:
   - User creates/joins conversation
   - WebSocket connection established
   - Messages sent via REST API and broadcast via WebSocket
   - AI responses generated based on selected mode
   - Chat history persisted to database

3. **File Processing**:
   - Files uploaded via multipart form data
   - Stored locally with metadata in database
   - AI analysis performed on file content
   - Analysis results returned to user

## External Dependencies

### Core Technologies
- **React Ecosystem**: React Query, React Hook Form, Wouter
- **UI Components**: Radix UI primitives, Lucide React icons
- **Backend**: Express, Passport, WebSocket
- **Database**: Drizzle ORM, Neon PostgreSQL driver
- **AI Services**: OpenAI API
- **Development**: Vite, TypeScript, Tailwind CSS

### Authentication
- **Replit Auth**: OpenID Connect integration
- **Session Management**: connect-pg-simple for PostgreSQL session store

### File Handling
- **Multer**: Multi-part form data parsing
- **File System**: Node.js fs/promises for async file operations

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite dev server with Express API proxy
- **Hot Reload**: Full-stack hot reloading with Vite HMR
- **Environment**: Separate client and server processes
- **Database**: Development connection to Neon PostgreSQL

### Production Build
- **Frontend**: Vite builds optimized React bundle
- **Backend**: esbuild bundles server code for Node.js
- **Assets**: Static files served from Express
- **Database**: Production PostgreSQL connection
- **Session Storage**: Persistent session store in database

### Configuration Requirements
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API access token
- `SESSION_SECRET`: Session encryption key
- `REPLIT_DOMAINS`: Allowed authentication domains
- `ISSUER_URL`: OIDC issuer endpoint (defaults to Replit)

### Replit-Specific Features
- **Cartographer**: Development-only Replit integration plugin
- **Runtime Error Overlay**: Enhanced error reporting in development
- **Banner Integration**: Replit development environment indicators