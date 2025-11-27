# Complete Setup Guide for GLAD GPT

## 🚨 IMPORTANT: Required Setup Steps

Follow these steps **in order** to get your GLAD GPT chat working:

---

## Step 1: Set Up OpenAI API Key

You need to add your OpenAI API key to the **client** directory.

### Create `.env.local` file

1. Navigate to the `client` folder:
   ```bash
   cd client
   ```

2. Create a file named `.env.local` (if it doesn't exist)

3. Add your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   ```

### How to Get Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in to your OpenAI account
3. Click "Create new secret key"
4. Copy the key (it starts with `sk-`)
5. Paste it in the `.env.local` file

---

## Step 2: Install Dependencies (if needed)

Make sure all dependencies are installed:

```bash
cd client
npm install
```

---

## Step 3: Start the Development Server

```bash
cd client
npm run dev
```

The application should start on `http://localhost:3000`

---

## Step 4: Test the Chat

1. Open your browser to `http://localhost:3000`
2. Click on the chat or navigate to `/chat`
3. Send a test message like "Hello!"
4. You should see an AI response

---

## Troubleshooting

### Error: "Authentication required"

**Solution**: This error should now be fixed. The chat no longer requires backend authentication.

### Error: "OpenAI API key not configured"

**Cause**: The API key is missing or not in the right location.

**Solution**:
1. Make sure you created `.env.local` in the `client` folder (NOT the root folder)
2. The file should contain: `OPENAI_API_KEY=sk-your-key-here`
3. Restart the dev server after adding the key

### Error: "Could not fetch" or Network errors

**Possible causes**:
1. **Invalid API key**: Double-check your OpenAI API key
2. **No internet connection**: Check your internet
3. **OpenAI API is down**: Check https://status.openai.com/
4. **Insufficient credits**: Check your OpenAI account balance

### Error: "No available AI models found"

**Cause**: Your OpenAI API key doesn't have access to the models.

**Solution**:
1. Make sure you have credits in your OpenAI account
2. Try using a different model by checking your OpenAI account permissions

---

## File Structure

Your project should look like this:

```
GrokClone/
├── client/
│   ├── .env.local          ← ADD YOUR API KEY HERE
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       ├── route.ts
│   │   │       └── session/
│   │   │           └── route.ts
│   │   ├── chat/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   └── openai.ts
│   └── package.json
├── OPENAI_SETUP.md
└── README.md
```

---

## Verification Checklist

- [ ] Created `.env.local` in the `client` folder
- [ ] Added `OPENAI_API_KEY=sk-...` to `.env.local`
- [ ] Ran `npm install` in the client folder
- [ ] Started dev server with `npm run dev`
- [ ] Opened browser to `http://localhost:3000`
- [ ] Navigated to the chat page
- [ ] Sent a test message
- [ ] Received an AI response

---

## Expected Console Output

When everything is working correctly, you should see in the browser console (F12):

```
POST /api/chat/session - Request received
Using AI mode: auto
🔄 Attempting to use model: gpt-4o-mini
✅ Successfully used model: gpt-4o-mini
✅ OpenAI response received, length: 234
```

---

## Still Having Issues?

If you're still experiencing problems:

1. **Check the browser console** (Press F12) for error messages
2. **Check the terminal** where you ran `npm run dev` for server errors
3. **Verify your API key** is correct and has credits
4. **Restart the dev server** after making any changes to `.env.local`

---

## Notes

- The authentication system has been simplified for easier setup
- You no longer need a backend server for basic chat functionality
- All chat processing happens through Next.js API routes
- Your OpenAI API key is only used server-side (secure)

---

## Next Steps

Once the chat is working:

1. Explore different AI modes (fast, auto, expert)
2. Test the dark/light mode toggle
3. Try creating multiple chat sessions
4. Customize the UI colors and styling as needed

Enjoy using GLAD GPT! 🚀
