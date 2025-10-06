# Environment Variables Setup Guide

## Quick Start (Minimum Required)

### 1. Backend Server (.env)
`ash
# Copy the example file
cp .env.example .env

# Edit .env and add your OpenAI API key:
OPENAI_API_KEY=sk-your-actual-openai-key-here
`

### 2. Frontend Client (client/.env.local)
`ash
# Copy the example file
cp client/.env.local.example client/.env.local

# The default settings should work for local development
# NEXT_PUBLIC_API_URL=http://localhost:5001/api
`

## File Structure
`
├── .env                     # Backend server config (REQUIRED)
├── .env.example            # Backend template
├── client/
│   ├── .env.local          # Frontend config (REQUIRED)
│   └── .env.local.example  # Frontend template
`

## What Each File Does

- **.env** (root): Backend server configuration - OpenAI API key, Firebase admin, CORS settings
- **client/.env.local**: Frontend configuration - API URL, Firebase client config (optional)

## Firebase Setup (Optional)

Firebase is optional. If not configured:
- ✅ Email/password authentication works via backend
- ✅ Demo/guest login works
- ❌ Google OAuth disabled (requires Firebase)

To enable Firebase:
1. Create a Firebase project
2. Add Firebase config to both .env files
3. Enable Authentication providers in Firebase console
