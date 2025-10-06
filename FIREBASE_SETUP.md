# ===========================================
# FIREBASE SETUP GUIDE FOR GLAD GPT
# ===========================================

## Quick Setup (5 minutes)

### 1. Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Create a project" or "Add project"
3. Enter project name: "glad-gpt" (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication
1. In Firebase console, go to "Authentication" > "Sign-in method"
2. Enable "Email/Password" provider
3. Enable "Google" provider (optional)
   - Add your domain: localhost:4000 to authorized domains

### 3. Create Firestore Database
1. Go to "Firestore Database" > "Create database"
2. Choose "Start in test mode" (we'll deploy rules later)
3. Select your preferred location

### 4. Get Configuration Keys
1. Go to "Project Settings" (gear icon)
2. Scroll to "Your apps" section
3. Click "Web app" icon (</>)
4. Register app name: "glad-gpt-client"
5. Copy the config object

### 5. Update Environment Files

#### Backend (.env):
`
# Add these to your existing .env file
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR-PRIVATE-KEY\n-----END PRIVATE KEY-----"
`

#### Frontend (client/.env.local):
`
NEXT_PUBLIC_API_URL=http://localhost:5006/api

# Firebase Client Config
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
`

### 6. Get Service Account Key (for backend)
1. Go to "Project Settings" > "Service accounts"
2. Click "Generate new private key"
3. Download the JSON file
4. Copy the values to your .env file

### 7. Deploy Firestore Rules
`ash
npm install -g firebase-tools
firebase login
firebase use --add  # Select your project
firebase deploy --only firestore:rules
`

## Current Status
- ✅ Firebase config files created
- ✅ Firestore rules configured for chat app
- ⚠️  Need to add your Firebase project credentials
- ⚠️  Need to deploy rules to Firebase

## Without Firebase
The app works perfectly without Firebase using backend authentication:
- ✅ Email/password signup/login
- ✅ Demo/guest access
- ❌ Google OAuth (requires Firebase)
