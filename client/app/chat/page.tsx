"use client";
import { useEffect, useState } from "react";
import { auth, isFirebaseEnabled } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { callChat, logout, getCurrentUser } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Msg { role: "user" | "ai"; content: string; id: string }
interface ChatSession { id: string; title: string; messages: Msg[] }

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [input, setInput] = useState("");
  const [currentChat, setCurrentChat] = useState<ChatSession | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hasUsedDemoChat, setHasUsedDemoChat] = useState(false);

  // Random welcome messages
  const welcomeMessages = [
    "Ready to explore ideas together?",
    "What's on your mind today?",
    "Let's dive into something interesting!",
    "Ready to get creative?",
    "What would you like to discover?",
    "Let's start something amazing!",
    "Ready to brainstorm?",
    "What can I help you with today?",
    "Let's make something happen!",
    "Ready for an adventure in ideas?"
  ];

  const getRandomWelcomeMessage = () => {
    return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
  };

  useEffect(() => {
    const initializeAuth = async () => {
      if (isFirebaseEnabled && auth) {
        // Use Firebase authentication if available
        console.log('Initializing Firebase authentication...');
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
          console.log('Firebase auth state changed:', firebaseUser?.uid, firebaseUser?.isAnonymous);
          
          if (firebaseUser) {
            // Firebase user is logged in
            setUser(firebaseUser);
            setAuthChecked(true);
            
            if (chatSessions.length === 0) {
              const initialChat: ChatSession = {
                id: Date.now().toString(),
                title: "New Chat",
                messages: []
              };
              setChatSessions([initialChat]);
              setCurrentChat(initialChat);
            }
          } else {
            // No Firebase user, check backend session
            console.log('No Firebase user, checking backend session...');
            try {
              const userData = await getCurrentUser();
              
              if (userData) {
                console.log('Backend authentication successful:', userData.id);
                const backendUser = {
                  uid: userData.id,
                  email: userData.email,
                  displayName: userData.firstName ? `${userData.firstName} ${userData.lastName}` : userData.email,
                  isAnonymous: userData.id === 'demo_user'
                } as User;
                
                setUser(backendUser);
                setAuthChecked(true);
                
                if (chatSessions.length === 0) {
                  const initialChat: ChatSession = {
                    id: Date.now().toString(),
                    title: "New Chat",
                    messages: []
                  };
                  setChatSessions([initialChat]);
                  setCurrentChat(initialChat);
                }
              } else {
                // No authentication found, redirect to login
                console.log('No authentication found, redirecting to login');
                setAuthChecked(true);
                router.push("/login");
              }
            } catch (error) {
              console.error("Failed to get current user:", error);
              setAuthChecked(true);
              router.push("/login");
            }
          }
        });
        
        return unsubscribe;
      } else {
        // Firebase not available, use backend authentication only
        console.log('Firebase not available, using backend authentication...');
        
        try {
          const userData = await getCurrentUser();
          
          if (userData) {
            console.log('Backend authentication successful:', userData.id);
            const backendUser = {
              uid: userData.id,
              email: userData.email,
              displayName: userData.firstName ? `${userData.firstName} ${userData.lastName}` : userData.email,
              isAnonymous: userData.id === 'demo_user'
            } as User;
            
            setUser(backendUser);
            setAuthChecked(true);
            
            if (chatSessions.length === 0) {
              const initialChat: ChatSession = {
                id: Date.now().toString(),
                title: "New Chat",
                messages: []
              };
              setChatSessions([initialChat]);
              setCurrentChat(initialChat);
            }
          } else {
            // User not authenticated, redirect to login
            console.log('No backend session found, redirecting to login');
            setAuthChecked(true);
            router.push("/login");
          }
        } catch (error) {
          console.error("Failed to get current user:", error);
          setAuthChecked(true);
          router.push("/login");
        }
      }
    };

    initializeAuth();
  }, [chatSessions.length, router]);

  const createNewChat = () => {
    // Check if demo user is trying to create a second chat
    if (user?.isAnonymous && hasUsedDemoChat) {
      setError("You've used your free chat as a guest. Please sign up to create more chats!");
      setTimeout(() => {
        router.push("/signup");
      }, 2000);
      return;
    }

    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: []
    };
    setChatSessions(prev => [newChat, ...prev]);
    setCurrentChat(newChat);
  };

  const selectChat = (chat: ChatSession) => {
    setCurrentChat(chat);
  };

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the chat when clicking delete
    setChatSessions(prev => prev.filter(chat => chat.id !== chatId));
    
    // If we're deleting the current chat, switch to another one or create new
    if (currentChat?.id === chatId) {
      const remainingChats = chatSessions.filter(chat => chat.id !== chatId);
      if (remainingChats.length > 0) {
        setCurrentChat(remainingChats[0]);
      } else {
        // Create a new chat if no chats remain
        const newChat: ChatSession = {
          id: Date.now().toString(),
          title: "New Chat",
          messages: []
        };
        setChatSessions([newChat]);
        setCurrentChat(newChat);
      }
    }
  };

  const updateChatTitle = (chatId: string, firstMessage: string) => {
    const title = firstMessage.slice(0, 30) + (firstMessage.length > 30 ? "..." : "");
    setChatSessions(prev => 
      prev.map(chat => 
        chat.id === chatId ? { ...chat, title } : chat
      )
    );
  };

  async function send() {
    if (!currentChat) return;
    
    setError(null);
    const text = input.trim();
    if (!text) return;

    const userMsg: Msg = { role: "user", content: text, id: Date.now().toString() };
    const updatedMessages = [...currentChat.messages, userMsg];
    
    // Update current chat with user message
    const updatedChat = { ...currentChat, messages: updatedMessages };
    setCurrentChat(updatedChat);
    setChatSessions(prev => 
      prev.map(chat => chat.id === currentChat.id ? updatedChat : chat)
    );
    
    // Update title if this is the first message
    if (currentChat.messages.length === 0) {
      updateChatTitle(currentChat.id, text);
    }
    
    setInput("");
    
    try {
      setBusy(true);
      
      let reply: string;
      
      // Check if user is from Firebase and has getIdToken method
      if (isFirebaseEnabled && user && typeof (user as any).getIdToken === 'function') {
        // Firebase user - try to get token first, fallback to session
        try {
          console.log('Firebase user detected, attempting to get ID token...');
          const idToken = await (user as any).getIdToken();
          console.log('Got Firebase ID token, making authenticated request');
          reply = await callChat(text, idToken);
        } catch (tokenError) {
          console.error('Failed to get Firebase ID token, falling back to session:', tokenError);
          console.log('Using session-based authentication as fallback');
          reply = await callChat(text);
        }
      } else {
        // Backend user or no Firebase - use session-based authentication
        console.log('Using session-based authentication');
        reply = await callChat(text);
      }
      
      const aiMsg: Msg = { role: "ai", content: reply, id: (Date.now() + 1).toString() };
      
      const finalMessages = [...updatedMessages, aiMsg];
      const finalChat = { ...currentChat, messages: finalMessages };
      
      setCurrentChat(finalChat);
      setChatSessions(prev => 
        prev.map(chat => chat.id === currentChat.id ? finalChat : chat)
      );

      // Mark that demo user has used their chat session (only on first message)
      if (user?.isAnonymous && currentChat.messages.length === 0) {
        setHasUsedDemoChat(true);
      }
    } catch (e: any) {
      console.error('Send message error:', e);
      setError(e?.message || "Failed to send chat");
    } finally {
      setBusy(false);
    }
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"></div>
        <div className="text-center relative z-10">
          <div className="glass-card p-12 rounded-3xl max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white">Loading...</h2>
            <p className="text-white/70">Checking authentication</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center relative">
        {/* Simplified Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"></div>
        
        <div className="text-center relative z-10">
          <div className="glass-card p-12 rounded-3xl max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-white">Please sign in to continue</h2>
            <p className="text-white/70 mb-6">Access your chat history and enjoy unlimited conversations</p>
            <Link href="/login" className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-r flex flex-col overflow-hidden`}>
        {/* Sidebar Header */}
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={createNewChat}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 ${isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200' : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'} border rounded-lg font-medium transition-all duration-200 text-sm`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New chat
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-2">
          {chatSessions.map((chat) => (
            <div
              key={chat.id}
              className={`relative group mb-1 rounded-lg transition-all duration-200 ${
                currentChat?.id === chat.id
                  ? isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-900'
                  : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <button
                onClick={() => selectChat(chat)}
                className="w-full text-left p-3 pr-10"
              >
                <div className="font-medium truncate text-sm">{chat.title}</div>
              </button>
              <button
                onClick={(e) => deleteChat(chat.id, e)}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'}`}
                title="Delete chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* User Profile */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {user.isAnonymous ? 'G' : (user.email?.[0]?.toUpperCase() || 'U')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div 
                  className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}
                  title={user.isAnonymous ? 'Guest User' : (user.email || 'User')}
                >
                  {user.isAnonymous ? 'Guest User' : (
                    user.email && user.email.length > 20 
                      ? `${user.email.substring(0, 18)}...` 
                      : (user.email || 'User')
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={async () => {
                try {
                  // Handle both Firebase and backend logout
                  if (isFirebaseEnabled && auth && user && typeof (user as any).getIdToken === 'function') {
                    console.log('Logging out Firebase user');
                    await signOut(auth);
                  } else {
                    console.log('Logging out backend user');
                    await logout();
                  }
                  router.push("/login");
                } catch (error) {
                  console.error("Logout error:", error);
                  router.push("/login");
                }
              }}
              className={`p-1.5 rounded-md transition-all duration-200 ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              title="Sign out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>GLAD GPT</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          {currentChat?.messages.length === 0 ? (
            /* Welcome Screen */
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="text-center max-w-md">
                <h2 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {getRandomWelcomeMessage()}
                </h2>
                <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Ask me anything or try one of these suggestions
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    "Help me write a professional email",
                    "Explain quantum computing simply", 
                    "Create a workout plan for beginners",
                    "Suggest a recipe for dinner tonight"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(suggestion)}
                      className={`p-3 text-left border rounded-lg transition-all duration-200 text-sm ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300' : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'}`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="max-w-3xl mx-auto p-6 space-y-6">
              {currentChat?.messages.map((msg) => (
                <div key={msg.id} className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user' 
                        ? 'bg-green-500' 
                        : 'bg-purple-500'
                    }`}>
                      <span className="text-sm font-bold text-white">
                        {msg.role === 'user' ? 'U' : 'AI'}
                      </span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {msg.role === 'user' ? 'You' : 'GLAD GPT'}
                      </div>
                      <div className={`whitespace-pre-wrap leading-relaxed ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {busy && (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-white">AI</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>GLAD GPT</div>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`} style={{animationDelay: '0.1s'}}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`} style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-6 py-2">
            <div className={`px-4 py-3 rounded-lg text-sm ${isDarkMode ? 'bg-red-900/50 border border-red-800 text-red-200' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              {error}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className={`border-t p-4 ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className={`flex items-center border rounded-2xl p-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <button
                  type="button"
                  className={`p-2 transition-colors ${isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Ask anything..."
                  disabled={busy}
                  className={`flex-1 px-3 py-2 bg-transparent border-0 focus:outline-none disabled:opacity-50 ${isDarkMode ? 'text-gray-100 placeholder-gray-500' : 'text-gray-900 placeholder-gray-500'}`}
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || busy}
                  className={`p-2 rounded-lg transition-all duration-200 disabled:cursor-not-allowed ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
            <div className={`text-xs text-center mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              GLAD GPT can make mistakes. Consider checking important information.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
