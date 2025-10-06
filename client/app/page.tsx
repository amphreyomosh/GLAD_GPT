import React from "react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 right-0 z-50 px-6 py-6">
        <div className="flex gap-4">
          <Link href="/login" className="px-6 py-2 text-white hover:text-blue-400 transition-colors font-medium">
            Login
          </Link>
          <Link href="/signup" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center space-y-6 pt-20">
          <div className="inline-block px-4 py-2 bg-slate-900 rounded-full text-sm font-medium mb-4 border border-slate-700">
            🚀 Powered by Advanced AI Technology
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-400 bg-clip-text text-transparent">
            GLAD GPT
          </h1>
          
          <p className="text-2xl text-gray-300 max-w-3xl mx-auto mb-4">
            Your intelligent AI companion for productivity, creativity, and learning
          </p>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Experience powerful conversational AI with custom models, real-time responses, and seamless integration. 
            Transform the way you work, create, and solve problems with GLAD GPT.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl">
              Get Started Free
            </Link>
            <Link href="#features" className="px-8 py-4 bg-slate-900 bg-opacity-50 hover:bg-opacity-70 text-white rounded-lg font-semibold text-lg border border-slate-800 hover:border-slate-600 transition-all duration-300">
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
          Why Choose GLAD GPT?
        </h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Discover the features that make GLAD GPT the perfect AI assistant for your daily tasks and creative projects
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-blue-500 transition-all duration-300 hover:shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-blue-900 rounded-lg flex items-center justify-center mb-4 text-2xl">
              💬
            </div>
            <h3 className="text-xl font-semibold mb-3">Natural Conversations</h3>
            <p className="text-gray-400">
              Engage in human-like dialogue with advanced natural language understanding and context awareness that remembers your conversation history.
            </p>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-purple-500 transition-all duration-300 hover:shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-purple-900 rounded-lg flex items-center justify-center mb-4 text-2xl">
              ⚡
            </div>
            <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
            <p className="text-gray-400">
              Get instant responses powered by custom OpenAI models optimized for speed and accuracy. No waiting, just results.
            </p>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-green-500 transition-all duration-300 hover:shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-green-900 rounded-lg flex items-center justify-center mb-4 text-2xl">
              🔒
            </div>
            <h3 className="text-xl font-semibold mb-3">Secure & Private</h3>
            <p className="text-gray-400">
              Your data is encrypted and protected with enterprise-grade security. We prioritize your privacy and never share your information.
            </p>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-yellow-500 transition-all duration-300 hover:shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-yellow-900 rounded-lg flex items-center justify-center mb-4 text-2xl">
              🧠
            </div>
            <h3 className="text-xl font-semibold mb-3">Smart Learning</h3>
            <p className="text-gray-400">
              Advanced AI that learns from context and adapts to your communication style for increasingly personalized assistance.
            </p>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-red-500 transition-all duration-300 hover:shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-red-900 rounded-lg flex items-center justify-center mb-4 text-2xl">
              🎯
            </div>
            <h3 className="text-xl font-semibold mb-3">Multi-Purpose</h3>
            <p className="text-gray-400">
              From writing and coding to research and brainstorming, handle any task with specialized AI modes for different use cases.
            </p>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-indigo-500 transition-all duration-300 hover:shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-indigo-900 rounded-lg flex items-center justify-center mb-4 text-2xl">
              🌐
            </div>
            <h3 className="text-xl font-semibold mb-3">Always Available</h3>
            <p className="text-gray-400">
              Access your AI assistant 24/7 from anywhere. Cloud-based infrastructure ensures reliability and consistent performance.
            </p>
          </div>
        </div>
      </div>

      {/* AI Models Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-12 border border-slate-700">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Powered by Custom AI Models
          </h2>
          <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
            GLAD GPT uses specialized OpenAI models optimized for different types of tasks and complexity levels
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-600">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <h3 className="text-xl font-semibold text-green-400">Fast Mode</h3>
              </div>
              <p className="text-gray-300 mb-3">
                <strong>Model:</strong> gpt-4.1-nano-2025-04-14
              </p>
              <p className="text-gray-400">
                Optimized for quick responses to general queries, casual conversations, and simple tasks. Perfect for everyday interactions.
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-600">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <h3 className="text-xl font-semibold text-purple-400">Expert Mode</h3>
              </div>
              <p className="text-gray-300 mb-3">
                <strong>Model:</strong> gpt-4.1-mini-2025-04-14
              </p>
              <p className="text-gray-400">
                Advanced model for complex reasoning, detailed analysis, research tasks, and professional work requiring deep understanding.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
          Endless Possibilities
        </h2>
        <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          Discover how GLAD GPT can transform your workflow across multiple domains and industries
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {[
            "Creative writing and storytelling",
            "Code generation and debugging", 
            "Research and data analysis",
            "Language translation and localization",
            "Task automation and planning",
            "Learning and education support",
            "Business strategy and planning",
            "Content creation and marketing",
            "Problem-solving and brainstorming"
          ].map((useCase, index) => (
            <div key={index} className="flex items-center gap-3 p-4 bg-slate-900 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                ✓
              </div>
              <span className="text-gray-200">{useCase}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Authentication Options */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-slate-900 rounded-2xl p-12 border border-slate-800 text-center">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Multiple Ways to Get Started
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Choose the authentication method that works best for you. All options provide full access to GLAD GPT's capabilities.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                📧
              </div>
              <h3 className="text-lg font-semibold mb-2">Email & Password</h3>
              <p className="text-gray-400 text-sm">Create a secure account with your email address</p>
            </div>
            
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                🔍
              </div>
              <h3 className="text-lg font-semibold mb-2">Google OAuth</h3>
              <p className="text-gray-400 text-sm">Quick sign-in with your Google account</p>
            </div>
            
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                👤
              </div>
              <h3 className="text-lg font-semibold mb-2">Guest Access</h3>
              <p className="text-gray-400 text-sm">Try it out with 3 free conversations</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl">
              Create Account
            </Link>
            <Link href="/login" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-lg border border-slate-700 hover:border-slate-600 transition-all duration-300">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                GLAD GPT
              </span>
            </div>
            <p className="text-gray-400 text-center">&copy; 2025 GLAD GPT. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}