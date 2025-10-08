"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginWithEmail, loginAsDemo } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  async function doEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Always use backend authentication for consistency
      await loginWithEmail(email, password);
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

      console.log('Using backend demo authentication');
      await loginAsDemo();
      router.push("/chat");
    } catch (e: any) {
      console.error('Guest authentication failed:', e);
      let errorMessage = 'Guest sign-in failed. ';

      if (e.message.includes('network') || e.message.includes('fetch')) {
        errorMessage += 'Network error. Please check your connection and try again.';
      } else {
        errorMessage += e.message || 'Please try again or contact support.';
      }

      setError(errorMessage);
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

          {/* Simplified Authentication Notice */}
          <div className="mb-6 p-4 bg-blue-900/50 border border-blue-700 rounded-lg text-blue-200 text-sm text-center">
            <strong>Simplified Authentication:</strong> Using secure session-based login for better reliability.
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
