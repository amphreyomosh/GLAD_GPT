# Firebase Setup Guide for Google OAuth

## Overview

Your application now supports **both** authentication methods:

1. **Session-based Authentication** (Always works)
   - Email/password registration and login
   - Demo/guest mode
   - Works without any Firebase configuration

2. **Google OAuth via Firebase** (Optional)
   - Sign in with Google accounts
   - Requires Firebase configuration
   - Provides enhanced user experience

## How It Works

### **Without Firebase Configuration**
- Google sign-in button shows "Google Sign-in (Not Available)"
- Users can still use email/password and demo login
- Chat functionality works perfectly with session authentication
- No Firebase-related errors

### **With Firebase Configuration**
- Google sign-in button shows "Continue with Google"
- Users can sign in with Google accounts
- Firebase users get ID tokens for enhanced authentication
- Automatic fallback to session auth if Firebase admin isn't configured on server

## Firebase Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select existing project
3. Enable Google Analytics (optional)
4. Wait for project creation

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Google** provider
3. Click **Enable**
4. Set your project's public-facing name
5. Choose a support email
6. Click **Save**

### 3. Configure Web App

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click **Web app** icon (`</>`)
4. Register your app with a nickname
5. Copy the Firebase configuration object

### 4. Add Domain Authorization

1. In **Authentication** → **Settings** → **Authorized domains**
2. Add your domains:
   - `localhost` (for development)
   - Your production domain (e.g., `your-app.vercel.app`)

### 5. Configure Environment Variables

#### Client-side (.env.local)
```env
# Required for Google OAuth
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

#### Server-side (.env) - Optional for Enhanced Features
```env
# Optional - for server-side Firebase features
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR-PRIVATE-KEY\n-----END PRIVATE KEY-----"
```

### 6. Get Service Account (Optional)

For server-side Firebase features:

1. Go to **Project Settings** → **Service accounts**
2. Click **Generate new private key**
3. Download the JSON file
4. Extract the values for environment variables:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

## Testing

### Development
1. Set environment variables in `client/.env.local`
2. Restart the development server
3. Visit login page - Google button should be enabled
4. Test Google sign-in

### Production
1. Set environment variables in your hosting platform
2. Ensure domains are authorized in Firebase
3. Deploy and test

## Troubleshooting

### Google Sign-in Not Available
- Check that all `NEXT_PUBLIC_FIREBASE_*` variables are set
- Verify Firebase project has Google authentication enabled
- Ensure domains are authorized

### "Firebase Admin Not Configured" Errors
- This is normal if you haven't set up server-side Firebase
- The app will automatically fall back to session authentication
- Users can still chat normally

### Authentication Errors
- Clear browser cookies and localStorage
- Check Firebase Console for error logs
- Verify environment variables are correct

## Benefits of Firebase Setup

✅ **Google OAuth** - Users can sign in with Google accounts  
✅ **Better UX** - Familiar Google sign-in flow  
✅ **Enhanced Security** - Firebase ID tokens for authentication  
✅ **Automatic Fallback** - Still works if server Firebase isn't configured  
✅ **Optional** - App works perfectly without Firebase  

## Summary

Firebase setup is **completely optional**. Your app works great without it using session-based authentication. Adding Firebase just enables Google OAuth for a better user experience.
