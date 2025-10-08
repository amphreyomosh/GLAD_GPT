# GLAD GPT - AI Chat Application

A modern AI chat application built with Next.js and Express, featuring session-based authentication and real-time messaging.

## Features

- **AI Chat Interface** - Clean, modern chat UI with real-time messaging
- **Simple Authentication** - Email/password and demo mode
- **User Management** - Registration, login, and profile management
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Dark/Light Mode** - Toggle between themes
- **Chat History** - Persistent conversation storage
- **Production Ready** - Deployed on Render

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling

### Backend
- **Express.js** - Node.js web framework
- **TypeScript** - Type-safe server development
- **Session-based Auth** - Secure authentication
- **OpenAI API** - AI chat functionality

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- OpenAI API key

### 1. Clone and Install
```bash
git clone <repository-url>
cd GrokClone
npm install
cd client && npm install && cd ..
```

### 2. Environment Setup
Copy the example environment files:
```bash
cp .env.example .env
cp client/.env.local.example client/.env.local
```

### 3. Configure Environment Variables

#### Backend (.env)
```env
# Required
OPENAI_API_KEY=your-openai-api-key-here
SESSION_SECRET=your-session-secret-change-in-production

# Development
NODE_ENV=development
PORT=5006
BASE_URL=http://localhost:5006
CORS_ORIGIN=http://localhost:3000
USE_MOCK_STORAGE=true

# Optional - Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional - Firebase Admin (for enhanced features)
# FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR-PRIVATE-KEY\n-----END PRIVATE KEY-----"
```

#### Frontend (client/.env.local)
```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:5006

# Optional - Firebase Client (for enhanced features)
# NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

### 4. Run the Application
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

Visit http://localhost:3000 to use the application.

## Authentication

The application uses session-based authentication with these options:

1. **Demo/Guest Mode** - Quick access for testing
2. **Email/Password** - Traditional registration and login
3. **Google OAuth** - Sign in with Google (optional)

Firebase authentication is optional and can be enabled by setting the Firebase environment variables.

## Deployment

### Render Deployment
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set environment variables in Render dashboard:
   - `OPENAI_API_KEY`
   - `SESSION_SECRET`
   - `NODE_ENV=production`
   - `CORS_ORIGIN=https://your-frontend-url.vercel.app`
4. Deploy automatically on git push

## Project Structure

```
GrokClone/
├── client/                 # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   └── lib/              # Utilities and API calls
├── server/                # Express backend
│   ├── auth.ts           # Authentication logic
│   ├── routes.ts         # API routes
│   ├── openai.ts         # AI integration
│   └── storage.ts        # Data persistence
└── shared/               # Shared types and schemas
```

## Troubleshooting

### Common Issues

1. **500 Error on Chat** - Check that `OPENAI_API_KEY` is set correctly
2. **401 Authentication Error** - Clear browser cookies and try demo login
3. **CORS Errors** - Ensure `CORS_ORIGIN` matches your frontend URL

### Firebase Setup (Optional)

If you want to enable Firebase features:
1. Create a Firebase project
2. Generate service account credentials
3. Add Firebase environment variables to both client and server
4. Restart the application

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
