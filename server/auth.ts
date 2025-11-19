import type { Express, RequestHandler } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcrypt";
import { storage } from "./storage.js";
import pg from "pg";
import connectPg from "connect-pg-simple";

// Initialize connect-pg-simple with pg
const pgSession = connectPg(session);

// Import the User type from the shared schema
import type { User } from "../shared/schema.ts";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Use memory store for development, PostgreSQL for production
  let sessionStore;
  if (process.env.DATABASE_URL && process.env.NODE_ENV === "production") {
    const pgStore = connectPg(session);
    sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      ttl: sessionTtl,
      tableName: "sessions",
    });
  }

  return session({
    secret: process.env.SESSION_SECRET || "your-session-secret-change-in-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: true, // Allow saving uninitialized sessions for demo auth
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // ✅ UPDATED - Auto-detect HTTPS
      sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax', // ✅ UPDATED - Allow cross-origin
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1); // ✅ Important for Render/proxy setups
  app.use(getSession());

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport serialization
  passport.serializeUser((user: any, done) => {
    console.log('Serializing user:', user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      console.log('Deserializing user:', id);
      const user = await storage.getUser(id);
      console.log('Deserialized user:', user);
      done(null, user);
    } catch (error) {
      console.error('Deserialize error:', error);
      done(error, null);
    }
  });

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log('Setting up Google OAuth strategy');
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google OAuth profile:', profile);
        const email = profile.emails?.[0]?.value;
        if (!email) {
          console.error('No email found in Google profile');
          return done(new Error('No email found in Google profile'), false);
        }
  
        console.log('Looking up user by email:', email);
        // Check if user exists
        let user = await storage.getUserByEmail(email);
  
        if (!user) {
          console.log('Creating new Google user');
          // Create new user
          user = await storage.upsertUser({
            id: `google_${profile.id}`,
            email,
            password: null, // Google users don't need passwords
            firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User',
            lastName: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '',
            profileImageUrl: profile.photos?.[0]?.value,
          });
          console.log('Created user:', user);
        } else {
          console.log('Found existing user:', user);
        }
  
        return done(null, user);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, false);
      }
    }));
  }

  // Simple demo authentication - creates a user session
  app.post('/api/auth/demo', async (req, res) => {
    try {
      console.log('Demo login request received');
      console.log('Session before demo login:', {
        sessionId: (req.session as any).id,
        userId: (req.session as any).userId,
        cookie: req.session.cookie
      });

      const demoUser = await storage.upsertUser({
        id: 'demo_user',
        email: 'demo@gladgpt.com',
        firstName: 'Demo',
        lastName: 'User',
      });

      // Set user in session
      (req.session as any).userId = demoUser.id;
      req.user = demoUser;

      // Ensure session is saved
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Session save error:', saveErr);
          return res.status(500).json({ message: 'Session save failed' });
        }

        console.log('Demo login successful, session after:', {
          sessionId: (req.session as any).id,
          userId: (req.session as any).userId,
          cookie: req.session.cookie
        });

        res.json({ user: demoUser, success: true });
      });
    } catch (error) {
      console.error('Demo login error:', error);
      res.status(500).json({ message: 'Demo login failed' });
    }
  });

  // Email/password signup
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const user = await storage.upsertUser({
        id: `user_${Date.now()}`,
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });

      // Set user in session
      (req.session as any).userId = user.id;
      req.user = user;

      // Ensure session is saved
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Session save error:', saveErr);
          return res.status(500).json({ message: 'Session save failed' });
        }

        res.json({ user, success: true });
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Signup failed' });
    }
  });

  // Simple email/password login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await storage.getUserByEmail(email);

      if (!user || !user.password) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Set user in session
      (req.session as any).userId = user.id;
      req.user = user;

      // Ensure session is saved
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Session save error:', saveErr);
          return res.status(500).json({ message: 'Session save failed' });
        }

        res.json({ user, success: true });
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ success: true });
    });
  });

  app.get('/api/auth/user', isAuthenticated, (req, res) => {
    res.json(req.user);
  });

  // Google OAuth routes
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    app.get('/api/auth/google',
      passport.authenticate('google', { scope: ['profile', 'email'] })
    );

    app.get('/api/auth/google/callback',
      passport.authenticate('google', { failureRedirect: '/signin' }),
      (req, res) => {
        console.log('Google OAuth callback successful, user:', req.user);
        console.log('Session ID:', (req.session as any).id);
        console.log('Session userId:', (req.session as any).userId);
        // Successful authentication, redirect to chat
        res.redirect('/chat');
      }
    );
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  console.log('Authentication check for:', req.path);
  console.log('Session data:', {
    sessionId: (req.session as any)?.id,
    userId: (req.session as any)?.userId,
    passportUser: (req.session as any)?.passport?.user,
    cookie: req.session?.cookie
  });
  
  // Check for userId set by our auth methods (demo, email/password)
  let userId = (req.session as any)?.userId;

  // If not found, check for passport's session user
  if (!userId && (req.session as any)?.passport?.user) {
    userId = (req.session as any).passport.user;
  }

  if (!userId) {
    console.log('No userId found in session - authentication required');
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    console.log('Looking up user:', userId);
    const user = await storage.getUser(userId);
    if (!user) {
      console.log('User not found in storage:', userId);
      return res.status(401).json({ message: "User not found" });
    }

    console.log('Authentication successful for user:', user.id);
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: "Authentication failed" });
  }
};