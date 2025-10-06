"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signInAnonymously } from "firebase/auth";
import { auth, googleProvider, isFirebaseEnabled } from "@/lib/firebase";
import { loginWithEmail, loginAsDemo } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function doGoogle() {
    if (!isFirebaseEnabled) {
      setError("Google sign-in is not available. Please use email/password or demo login.");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await signInWithPopup(auth, googleProvider);
      router.push("/chat");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function doEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (isFirebaseEnabled) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Use backend authentication
        await loginWithEmail(email, password);
      }
      
      router.push("/chat");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function doGuest() {
    try {
      setLoading(true);
      setError(null);
      
      if (isFirebaseEnabled) {
        await signInAnonymously(auth);
      } else {
        // Use backend demo authentication
        await loginAsDemo();
      }
      
      router.push("/chat");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Remove the Firebase configuration check - we'll use fallback auth

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 relative">
      {/* Simplified Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-2xl font-bold text-white">G</span>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              GLAD GPT
            </span>
          </Link>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-white/70 text-lg">
            Sign in to continue your conversations
          </p>
        </div>

        {/* Auth Form */}
        <div className="glass-card p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <button
            onClick={doGoogle}
            disabled={loading || !isFirebaseEnabled}
            className="w-full mb-6 p-4 glass-button text-white font-medium hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 rounded-xl shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isFirebaseEnabled ? 'Continue with Google' : 'Google Sign-in (Requires Firebase)'}
          </button>

          {!isFirebaseEnabled && (
            <div className="mb-4 p-3 bg-yellow-900/50 border border-yellow-700 rounded-lg text-yellow-200 text-sm text-center">
              <strong>Demo Mode:</strong> Firebase not configured. Use email/password or demo login below.
            </div>
          )}

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 glass-dark text-white/80 rounded-full">or</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={doEmailAuth} className="space-y-5">
            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                disabled={loading}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {loading ? 'Please wait...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <Link
              href="/signup"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Don't have an account? Sign up
            </Link>
          </div>

          {/* Guest Access */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <button
              onClick={doGuest}
              disabled={loading}
              className="w-full p-4 glass-button hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-all duration-300 text-white/90 hover:text-white shadow-lg"
            >
              Continue as Guest (1 free chats)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link href="/" className="inline-flex items-center text-white/70 hover:text-white transition-colors font-medium">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
