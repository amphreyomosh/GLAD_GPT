# 🔥 Quick Firebase Setup for Google Sign-In

## ⚡ 5-Minute Setup

### 1. Create Firebase Project
1. Go to: https://console.firebase.google.com/
2. Click **"Create a project"**
3. Name: `glad-gpt` (or your choice)
4. Click **"Create project"**

### 2. Enable Google Authentication
1. Go to **Authentication** → **Sign-in method**
2. Click **Google** provider
3. **Enable** the toggle
4. Select your **support email**
5. Click **Save**

### 3. Get Frontend Config
1. Go to **Project Settings** (gear icon)
2. Scroll to **"Your apps"**
3. Click **Web icon** `</>`
4. App name: `glad-gpt-client`
5. **Copy the config object**

### 4. Update Frontend Environment
Create/update `client/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5006/api

# Replace these with your Firebase config values:
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=glad-gpt-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=glad-gpt-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=glad-gpt-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 5. Get Backend Service Account (Optional)
1. Go to **Project Settings** → **Service accounts**
2. Click **"Generate new private key"**
3. Download JSON file
4. Add to root `.env`:
```env
FIREBASE_PROJECT_ID=glad-gpt-xxxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@glad-gpt-xxxxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----"
```

### 6. Restart Servers
```bash
# Stop current servers (Ctrl+C)
# Then restart:

# Backend
cd server
npm run dev

# Frontend  
cd client
npm run dev -- --port 4000
```

### 7. Test Google Sign-In
1. Go to http://localhost:4000
2. Click **"Continue with Google"** (should now be enabled)
3. Sign in with your Google account
4. Should redirect to chat page

## ✅ Success Indicators
- Frontend console: "Firebase initialized successfully"
- Google button shows: "Continue with Google" (not "Requires Firebase")
- Google sign-in popup works
- User gets redirected to chat after signing in

## 🚨 Troubleshooting
- **Button still disabled?** Check frontend console for Firebase errors
- **Popup blocked?** Allow popups for localhost
- **Auth domain error?** Make sure localhost is in authorized domains
- **Invalid config?** Double-check all environment variables

## 🎯 What You Get
- ✅ Google Sign-In working
- ✅ Users can sign in with Google account
- ✅ Automatic account creation
- ✅ Seamless chat access
- ✅ No more "Requires Firebase" message
