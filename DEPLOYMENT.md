# Deployment Guide

## Environment Variables Setup

### For Vercel (Client/Frontend)
Set these environment variables in your Vercel dashboard:

```
NEXT_PUBLIC_API_URL=https://your-render-app-url.onrender.com
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

### Firebase Admin Credentials (REQUIRED for Firebase Authentication)
**CRITICAL:** These are required for the server to validate Firebase ID tokens!

1. **Go to Firebase Console** → Your Project → **Project Settings** → **Service accounts**
2. **Click "Generate new private key"** → Download the JSON file
3. **Add these to Render environment variables:**

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR-PRIVATE-KEY-CONTENT\n-----END PRIVATE KEY-----"
```

**Note:** Copy the entire private key including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines, and replace literal `\n` with actual newlines if needed.

## Getting Firebase Configuration

### Step-by-Step Firebase Setup:

1. **Create/Access Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select existing one

2. **Enable Authentication:**
   - Go to **Authentication** → **Sign-in method**
   - Find **Anonymous** in the provider list
   - Click on it and toggle **Enable**
   - Click **Save**

3. **Get Firebase Configuration:**
   - Go to **Project Settings** (gear icon) → **General**
   - Scroll down to "Your apps" section
   - If no app exists, click "Add app" → Web app (</>) → Register app
   - Copy the config values from the SDK setup

4. **Verify Configuration:**
   - Run `node test-firebase-config.cjs` locally to verify config
   - Check that all environment variables are set in Vercel

### Important: Anonymous Authentication
The "auth/admin-restricted-operation" error occurs when:
- Anonymous authentication is **not enabled** in Firebase Console
- Firebase environment variables are missing in Vercel
- The Firebase project has domain restrictions

**Solution:** Ensure anonymous auth is enabled in Firebase Console → Authentication → Sign-in method.

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

### "Failed to fetch" or "Chat request failed" or 404 errors
- **CRITICAL:** Set NEXT_PUBLIC_API_URL in Vercel to: `https://your-render-app.onrender.com` (NO `/api` at the end!)
- **Current Issue:** If you see `domain.com/api/api/chat/session` (double `/api/`), your Vercel NEXT_PUBLIC_API_URL still has `/api` at the end
- Verify the Render server is running and accessible
- Check that OPENAI_API_KEY is set in Render
- Verify the API key has access to GPT models
- Check server logs for detailed error messages
- Ensure CORS_ORIGIN in Render matches your Vercel domain
- Redeploy Vercel after changing environment variables

### "Failed to validate chat attempts" or "Invalid or expired Firebase ID token"
- **CRITICAL:** Firebase Admin credentials are missing in Render
- **Solution:** Add Firebase service account credentials to Render (see Firebase Admin Credentials section above)
- This is required for the server to validate Firebase authentication tokens

### "Firebase: Error (auth/admin-restricted-operation)"
- **Most Common Cause:** Anonymous authentication is NOT enabled in Firebase Console
- **Solution:** Go to Firebase Console → Authentication → Sign-in method → Enable "Anonymous"
- Ensure all NEXT_PUBLIC_FIREBASE_* variables are set in Vercel
- Verify Firebase project is properly configured
- Check browser console for detailed error messages
- The app will automatically fallback to backend authentication if Firebase fails

### Guest mode not working
- Firebase anonymous authentication must be enabled
- All Firebase config variables must be set correctly
- Check browser console for detailed error messages