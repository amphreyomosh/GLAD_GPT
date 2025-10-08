# Environment Variables Setup Guide

This guide will help you set up the required environment variables to fix the Firebase authentication and messaging issues.

## Issues Fixed

✅ **Firebase `admin-restricted-operation` error**  
✅ **Firebase `invalid-credential` error**  
✅ **"Failed to fetch" messaging error**  
✅ **Anonymous authentication support**  

## Required Environment Variables

### 1. Client Environment Variables (`.env.local`)

Create or update `client/.env.local` with the following variables:

```bash
# ===========================================
# FRONTEND ENVIRONMENT VARIABLES
# ===========================================

# Frontend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5002

# Firebase Configuration - Get these from Firebase Console
NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-actual-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### 2. Server Environment Variables (`.env`)

Create or update the root `.env` file with:

```bash
# ===========================================
# BACKEND ENVIRONMENT VARIABLES
# ===========================================

# Server Configuration
PORT=5000
WS_PORT=5002
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-in-production

# OpenAI Configuration (Required for chat functionality)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Firebase Admin SDK Configuration (for server-side Firebase)
FIREBASE_PROJECT_ID=your-actual-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----"

# Optional: Chat History Storage
STORE_CHAT_HISTORY=true

# Optional: Database (if using PostgreSQL instead of mock storage)
# DATABASE_URL=postgresql://username:password@localhost:5432/gladgpt
USE_MOCK_STORAGE=true
```

## How to Get Firebase Configuration

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select existing project
3. Enable Authentication and Firestore Database

### Step 2: Get Client Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Web app" icon or add a new web app
4. Copy the configuration values:
   - `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`

### Step 3: Enable Authentication Methods

1. Go to Authentication → Sign-in method
2. Enable "Anonymous" authentication
3. Enable "Email/Password" authentication
4. (Optional) Enable "Google" authentication

### Step 4: Get Admin SDK Configuration

1. Go to Project Settings → Service accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract these values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the \n characters)

### Step 5: Update Firestore Rules

The Firestore rules have been updated to support anonymous authentication. Deploy them:

```bash
firebase deploy --only firestore:rules
```

## Testing the Setup

### Option 1: With Firebase (Recommended)

1. Set up all Firebase environment variables as described above
2. Start the servers:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend  
   cd client
   npm run dev
   ```
3. Go to http://localhost:3000
4. Click "Continue as Guest" - should work without errors
5. Send a message - should get AI response

### Option 2: Without Firebase (Fallback)

If you don't want to set up Firebase:

1. Only set these required variables in `.env`:
   ```bash
   PORT=5000
   OPENAI_API_KEY=sk-your-openai-api-key-here
   SESSION_SECRET=your-session-secret
   USE_MOCK_STORAGE=true
   ```

2. In `client/.env.local`, set:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

3. The app will automatically use backend authentication fallback

## Troubleshooting

### "Firebase: Error (auth/admin-restricted-operation)"
- ✅ **Fixed**: Enable Anonymous authentication in Firebase Console
- ✅ **Fixed**: Updated Firestore security rules

### "Firebase: Error (auth/invalid-credential)"  
- ✅ **Fixed**: Proper environment variable validation
- ✅ **Fixed**: Fallback to backend authentication when Firebase not configured

### "Failed to fetch" when sending messages
- ✅ **Fixed**: Proper token handling for Firebase authentication
- ✅ **Fixed**: Fallback to session-based authentication
- ✅ **Fixed**: Better error handling and logging

### Chat not responding
- Ensure `OPENAI_API_KEY` is set correctly
- Check server logs for OpenAI API errors
- Verify the API key has sufficient credits

## What's Been Fixed

1. **Firebase Configuration**: Added proper validation and fallback handling
2. **Anonymous Authentication**: Enabled guest users to chat without signup
3. **Token Management**: Fixed Firebase ID token retrieval and usage
4. **Error Handling**: Better error messages and fallback mechanisms
5. **Security Rules**: Updated Firestore rules to support anonymous users
6. **API Integration**: Fixed chat API calls with proper authentication

## Next Steps

1. Set up your environment variables using this guide
2. Test the chat functionality
3. Deploy Firestore rules if using Firebase
4. The chat should now work properly for both guest and authenticated users!
