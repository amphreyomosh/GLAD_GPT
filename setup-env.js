#!/usr/bin/env node

/**
 * Quick Environment Setup Script for GLAD GPT
 * This script helps you set up the required environment variables
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🚀 GLAD GPT Environment Setup');
  console.log('=====================================\n');

  console.log('This script will help you set up the required environment variables.');
  console.log('You can skip Firebase setup and use backend authentication only.\n');

  // Check if user wants Firebase or backend-only setup
  const setupType = await question('Do you want to set up Firebase? (y/n, default: n): ');
  const useFirebase = setupType.toLowerCase() === 'y' || setupType.toLowerCase() === 'yes';

  console.log('\n📝 Setting up environment variables...\n');

  // Required variables
  const openaiKey = await question('Enter your OpenAI API Key (required): ');
  if (!openaiKey) {
    console.log('❌ OpenAI API Key is required for chat functionality!');
    process.exit(1);
  }

  // Server environment variables
  const serverEnv = `# ===========================================
# BACKEND ENVIRONMENT VARIABLES
# ===========================================

# Server Configuration
PORT=5000
WS_PORT=5002
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Session Configuration
SESSION_SECRET=${generateRandomSecret()}

# OpenAI Configuration
OPENAI_API_KEY=${openaiKey}

# Storage Configuration
USE_MOCK_STORAGE=true
STORE_CHAT_HISTORY=true

${useFirebase ? `# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your-actual-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYour-Private-Key-Here\\n-----END PRIVATE KEY-----"` : '# Firebase disabled - using backend authentication'}
`;

  // Client environment variables
  let clientEnv = `# ===========================================
# FRONTEND ENVIRONMENT VARIABLES
# ===========================================

# Frontend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5002

`;

  if (useFirebase) {
    console.log('\n🔥 Firebase Configuration:');
    const firebaseApiKey = await question('Firebase API Key: ');
    const firebaseAuthDomain = await question('Firebase Auth Domain (your-project.firebaseapp.com): ');
    const firebaseProjectId = await question('Firebase Project ID: ');
    const firebaseStorageBucket = await question('Firebase Storage Bucket (optional): ');
    const firebaseMessagingSenderId = await question('Firebase Messaging Sender ID (optional): ');
    const firebaseAppId = await question('Firebase App ID (optional): ');

    clientEnv += `# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=${firebaseApiKey}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${firebaseAuthDomain}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${firebaseProjectId}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${firebaseStorageBucket}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${firebaseMessagingSenderId}
NEXT_PUBLIC_FIREBASE_APP_ID=${firebaseAppId}
`;
  } else {
    clientEnv += `# Firebase disabled - using backend authentication fallback
# NEXT_PUBLIC_FIREBASE_API_KEY=
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=
`;
  }

  // Write files
  try {
    fs.writeFileSync('.env', serverEnv);
    console.log('✅ Created .env file');

    fs.writeFileSync(path.join('client', '.env.local'), clientEnv);
    console.log('✅ Created client/.env.local file');

    console.log('\n🎉 Environment setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the backend server: cd server && npm run dev');
    console.log('2. Start the frontend server: cd client && npm run dev');
    console.log('3. Open http://localhost:3000 in your browser');
    console.log('4. Click "Continue as Guest" to test the chat');

    if (useFirebase) {
      console.log('\n🔥 Firebase Setup Reminders:');
      console.log('- Enable Anonymous authentication in Firebase Console');
      console.log('- Enable Email/Password authentication');
      console.log('- Deploy Firestore rules: firebase deploy --only firestore:rules');
      console.log('- Update Firebase Admin SDK credentials in .env file');
    }

    console.log('\n📖 For detailed setup instructions, see ENVIRONMENT_SETUP_GUIDE.md');

  } catch (error) {
    console.error('❌ Error writing environment files:', error.message);
    process.exit(1);
  }

  rl.close();
}

function generateRandomSecret() {
  return require('crypto').randomBytes(32).toString('hex');
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Setup cancelled');
  rl.close();
  process.exit(0);
});

main().catch(console.error);
