# Firebase Environment Variables Template

## Frontend Environment (client/.env.local)
Copy this template and replace with your actual Firebase values:

```
NEXT_PUBLIC_API_URL=http://localhost:5006/api

# Firebase Client Config - Replace with your values from Firebase Console
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Backend Environment (root/.env)
Add these to your existing .env file:

```
# Your existing variables...
OPENAI_API_KEY=your-openai-key
PORT=5006
WS_PORT=5007
CORS_ORIGIN=http://localhost:4000

# Firebase Admin Config - Get from Service Account JSON
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR-PRIVATE-KEY-HERE\n-----END PRIVATE KEY-----"
```

## How to Get These Values:

### Frontend Values (from Firebase Console):
1. Go to Project Settings → General tab
2. Scroll to "Your apps" section
3. Find your web app and copy the config object
4. Replace the values in client/.env.local

### Backend Values (Service Account):
1. Go to Project Settings → Service accounts tab
2. Click "Generate new private key"
3. Download the JSON file
4. Copy projectId, client_email, and private_key to root/.env

## Test Firebase Connection:
After setting up, restart both servers and check the console for:
- "Firebase initialized successfully" (frontend)
- "Firebase Admin initialized" (backend)
