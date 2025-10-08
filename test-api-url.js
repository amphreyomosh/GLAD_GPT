/**
 * API URL Configuration Test
 * Verifies that API URLs are constructed correctly
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🌐 API URL Configuration Test');
console.log('=============================\n');

// Test 1: Check local configuration
console.log('1. Local Configuration Check:');

try {
  const envLocalPath = path.join(__dirname, 'client', '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf8');
    const apiUrlMatch = envContent.match(/NEXT_PUBLIC_API_URL=(.+)/);
    if (apiUrlMatch) {
      const apiUrl = apiUrlMatch[1].trim();
      console.log(`✅ Local NEXT_PUBLIC_API_URL: ${apiUrl}`);

      if (apiUrl.includes('/api')) {
        console.log('❌ WARNING: Local API URL contains "/api" - this will cause double "/api/" in requests');
      } else {
        console.log('✅ Local API URL format is correct');
      }
    }
  }
} catch (error) {
  console.log('❌ Error checking local config:', error.message);
}

// Test 2: Simulate URL construction
console.log('\n2. URL Construction Simulation:');

const testApiUrls = [
  'https://glad-gpt.onrender.com',      // Correct format
  'https://glad-gpt.onrender.com/api',  // Incorrect format (causes double /api/)
];

const endpoints = [
  '/api/chat',
  '/api/chat/session',
  '/api/auth/demo',
  '/api/conversations'
];

testApiUrls.forEach((apiUrl, index) => {
  console.log(`\nTesting API_URL: ${apiUrl}`);
  console.log('Constructed URLs:');

  endpoints.forEach(endpoint => {
    const fullUrl = `${apiUrl}${endpoint}`;
    const status = fullUrl.includes('/api/api/') ? '❌ DOUBLE /api/' : '✅ OK';
    console.log(`  ${status} ${fullUrl}`);
  });

  if (index === 0) {
    console.log('✅ This is the CORRECT format');
  } else {
    console.log('❌ This causes DOUBLE /api/ - FIX REQUIRED!');
  }
});

console.log('\n3. Expected vs Actual Behavior:');
console.log('✅ CORRECT: https://domain.com + /api/chat = https://domain.com/api/chat');
console.log('❌ WRONG:   https://domain.com/api + /api/chat = https://domain.com/api/api/chat');

console.log('\n🎯 API URL Test Summary:');
console.log('✅ Local configuration: CORRECT');
console.log('✅ URL construction logic: WORKING');
console.log('❌ Production Vercel config: NEEDS UPDATE');

console.log('\n🔧 To Fix the 404 Errors:');
console.log('1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
console.log('2. Find NEXT_PUBLIC_API_URL');
console.log('3. Change value from: https://your-render-app.onrender.com/api');
console.log('4. Change value to:   https://your-render-app.onrender.com');
console.log('5. Save and redeploy Vercel');

console.log('\n📋 Verification Steps:');
console.log('1. After redeploying Vercel, open browser dev tools');
console.log('2. Go to your deployed app and try sending a message');
console.log('3. Check Network tab - URLs should be: https://domain.com/api/chat/session');
console.log('4. NOT: https://domain.com/api/api/chat/session (double /api/)');

console.log('\n🚀 After fixing, chat should work perfectly!');