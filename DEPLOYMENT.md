# Deployment Guide

## Environment Variables Setup

### For Vercel (Client/Frontend)
Set these environment variables in your Vercel dashboard:

```
NEXT_PUBLIC_API_URL=https://your-render-app-url.onrender.com/api
NEXT_PUBLIC_WS_URL=wss://your-render-app-url.onrender.com
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### For Render (Server/Backend)
Set these environment variables in your Render dashboard:

```
OPENAI_API_KEY=your-openai-api-key
NODE_ENV=production
BASE_URL=https://your-render-app-url.onrender.com
CORS_ORIGIN=https://your-vercel-app-url.vercel.app
USE_MOCK_STORAGE=false
```

### Optional Firebase Admin (Server-side)
If you want server-side Firebase operations:

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR-PRIVATE-KEY\n-----END PRIVATE KEY-----"
```

## Getting Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > General
4. Scroll down to "Your apps" and copy the config values
5. For service account key, go to Project Settings > Service accounts > Generate new private key

## Getting OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-`)

## Troubleshooting

### "Chat request failed"
- Check that OPENAI_API_KEY is set in Render
- Verify the API key has access to GPT models
- Check server logs for detailed error messages

### "Firebase: Error (auth/admin-restricted-operation)"
- Ensure all NEXT_PUBLIC_FIREBASE_* variables are set in Vercel
- Verify Firebase project is properly configured
- Check that anonymous authentication is enabled in Firebase Console > Authentication > Sign-in method

### Guest mode not working
- Firebase anonymous authentication must be enabled
- All Firebase config variables must be set correctly
- Check browser console for detailed error messages