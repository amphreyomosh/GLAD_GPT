/**
 * Firebase Configuration Test Script
 * Run this to check if your Firebase environment variables are properly set
 */

const path = require('path');
const fs = require('fs');

console.log('🔥 Firebase Configuration Test');
console.log('==============================\n');

// Check if .env.local exists
const envLocalPath = path.join(__dirname, 'client', '.env.local');
const envExists = fs.existsSync(envLocalPath);

console.log('📁 Environment file check:');
console.log(`client/.env.local exists: ${envExists ? '✅' : '❌'}`);

if (envExists) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const lines = envContent.split('\n');
  
  console.log('\n🔍 Firebase environment variables:');
  
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];
  
  const foundVars = {};
  
  lines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && requiredVars.includes(key.trim())) {
      foundVars[key.trim()] = value ? value.trim() : '';
    }
  });
  
  requiredVars.forEach(varName => {
    const value = foundVars[varName];
    const status = value && value.length > 0 ? '✅' : '❌';
    const preview = value ? (value.length > 20 ? value.substring(0, 20) + '...' : value) : 'Not set';
    console.log(`${status} ${varName}: ${preview}`);
  });
  
  // Check for placeholder values
  console.log('\n🚨 Checking for placeholder values:');
  const placeholders = [
    'your-firebase-api-key-here',
    'your-project.firebaseapp.com',
    'your-project-id',
    'your-actual-firebase-api-key',
    'your-actual-project-id'
  ];
  
  let hasPlaceholders = false;
  Object.entries(foundVars).forEach(([key, value]) => {
    placeholders.forEach(placeholder => {
      if (value && value.includes(placeholder)) {
        console.log(`❌ ${key} contains placeholder: ${placeholder}`);
        hasPlaceholders = true;
      }
    });
  });
  
  if (!hasPlaceholders) {
    console.log('✅ No placeholder values detected');
  }
  
  // Validation summary
  console.log('\n📊 Configuration Summary:');
  const hasApiKey = foundVars['NEXT_PUBLIC_FIREBASE_API_KEY'] && foundVars['NEXT_PUBLIC_FIREBASE_API_KEY'].length > 10;
  const hasAuthDomain = foundVars['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'] && foundVars['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'].includes('.');
  const hasProjectId = foundVars['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] && foundVars['NEXT_PUBLIC_FIREBASE_PROJECT_ID'].length > 3;
  
  console.log(`API Key valid: ${hasApiKey ? '✅' : '❌'}`);
  console.log(`Auth Domain valid: ${hasAuthDomain ? '✅' : '❌'}`);
  console.log(`Project ID valid: ${hasProjectId ? '✅' : '❌'}`);
  
  const isConfigValid = hasApiKey && hasAuthDomain && hasProjectId && !hasPlaceholders;
  console.log(`\n🎯 Overall Firebase Config: ${isConfigValid ? '✅ VALID' : '❌ INVALID'}`);
  
  if (isConfigValid) {
    console.log('\n🎉 Your Firebase configuration looks good!');
    console.log('Google sign-in should work properly.');
  } else {
    console.log('\n⚠️  Firebase configuration issues detected.');
    console.log('This is why Google sign-in is disabled.');
    console.log('\n🔧 To fix:');
    console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
    console.log('2. Select your project');
    console.log('3. Go to Project Settings > General');
    console.log('4. Scroll down to "Your apps" and copy the config values');
    console.log('5. Update your client/.env.local file with the real values');
  }
  
} else {
  console.log('\n❌ client/.env.local file not found!');
  console.log('\n🔧 To fix:');
  console.log('1. Copy client/.env.local.example to client/.env.local');
  console.log('2. Fill in your actual Firebase configuration values');
  console.log('3. Or run: node setup-env.js');
}

console.log('\n📖 For detailed setup instructions, see ENVIRONMENT_SETUP_GUIDE.md');
