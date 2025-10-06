# GLAD GPT – Client/Server Chat App

Modern AI chat app split into:

- `client/` – Next.js (Vercel) with Firebase Auth
- `server/` – Express (Render) proxying OpenAI and verifying Firebase tokens

## Features

- **Auth**: Firebase (Google, Email/Password, Guest)
- **Chat**: Frontend calls backend `/api/chat` only
- **Limits**: 3 free chats for anonymous users (stored in Firestore)
- **Optional**: Firestore chat history

## Tech Stack

- Frontend: Next.js 14, React 18, Firebase
- Backend: Node.js, Express, `openai`
- Database: Firebase Firestore
- Deploy: Vercel (client) + Render (server)

## Structure

```
├── client/                 # Next.js app
│   ├── app/                # /, /login, /chat
│   ├── lib/                # firebase.ts, api.ts
│   └── .env.local.example
├── server/                 # Express app
│   ├── index.ts            # entry
│   ├── routes.ts           # /api/health, /api/chat
│   ├── openai.ts           # uses gpt-4.1-nano/mini models
│   ├── firebaseAdmin.ts    # lazy admin init
│   └── firebaseAuth.ts     # token verify + attempts
├── Procfile                # web: node server/dist/index.js
├── .env.example            # backend env template
└── package.json            # root scripts build server
```

## Env Setup

### Frontend (client/.env.local)

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=https://your-render-backend.com/api
```

### Backend (root .env)

```
NODE_ENV=production
PORT=5200
OPENAI_API_KEY=sk-xxx
FIREBASE_PROJECT_ID=xxx
FIREBASE_CLIENT_EMAIL=xxx@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nxxx\n-----END PRIVATE KEY-----\n"
CORS_ORIGIN=https://your-frontend.vercel.app,http://localhost:3000
STORE_CHAT_HISTORY=false
```

## API

- `GET /api/health` – Healthcheck
- `POST /api/chat` – Body `{ message: string }` with `Authorization: Bearer <Firebase ID token>`

Anonymous users are limited to 3 chats; after that the server returns `{ code: "ATTEMPTS_EXCEEDED" }`.

## Firebase

- Enable Auth providers (Google, Email/Password, Anonymous)
- Firestore structure:

```
users/{uid}: { uid, email, attempts, lastActive }
users/{uid}/chats/{autoId}: { prompt, response, mode, createdAt }
```

Security rules: `firebase/firestore.rules`

## Development

Backend:

```
npm install
npm run dev
```

Client:

```
cd client
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:5000/api` for local dev.

## Build & Deploy

Backend (Render):

- Build: `npm run build` (root)
- Start: Procfile `web: node server/dist/index.js`

Frontend (Vercel):

- Root: `client/`
- Build: `npm run build`
- Output: `.next`

## Cleanup

✅ **CLEANED UP**: Removed legacy assets and updated to use Next.js 13+ app directory structure:
- ✅ Using `client/app/` directory (not `src`)
- ✅ Removed empty `src` directory
- ✅ Updated Tailwind config to match app structure
- ✅ All components now in proper `app/` structure

## OpenAI Models

- fast: `gpt-4.1-nano-2025-04-14`
- auto/expert/heavy: `gpt-4.1-mini-2025-04-14`

Used in `server/openai.ts` by `EnhancedOpenAIService`.
# GLAD_GPT
