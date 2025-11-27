# OpenAI API Key Setup Guide

## Important: API Key Configuration

Your OpenAI API needs to be configured in **TWO** places:

### 1. Backend Configuration (Root Directory)

Create or update `.env` file in the **root directory** (`c:\Users\GLAD\Desktop\GrokClone\.env`):

```env
# OpenAI Configuration
OPENAI_API_KEY=your-actual-openai-api-key-here

# Other configurations...
NODE_ENV=development
PORT=4000
SESSION_SECRET=your-session-secret
```

### 2. Frontend Configuration (Client Directory)

Create or update `.env.local` file in the **client directory** (`c:\Users\GLAD\Desktop\GrokClone\client\.env.local`):

```env
# OpenAI Configuration (for Next.js API routes)
OPENAI_API_KEY=your-actual-openai-api-key-here

# Firebase Configuration (if using)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-key
# ... other Firebase config
```

## How to Get Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in to your OpenAI account
3. Click "Create new secret key"
4. Copy the key (it starts with `sk-`)
5. Paste it in both `.env` files as shown above

## Verify the Setup

After adding your API key, restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd client
npm run dev
```

## Troubleshooting

### "Could not fetch" Error
- **Cause**: Missing or invalid API key
- **Solution**: Double-check that the API key is set in both `.env` files

### "Invalid API key" Error
- **Cause**: The API key is incorrect or expired
- **Solution**: Generate a new API key from OpenAI platform

### "Network error" 
- **Cause**: Internet connection or firewall blocking OpenAI API
- **Solution**: Check your internet connection and firewall settings

## Testing the API Connection

Once configured, try sending a message in the chat. You should see:
- ✅ "OpenAI client initialized successfully" in the console
- AI responses appearing in the chat

If you see errors, check the browser console (F12) for detailed error messages.
