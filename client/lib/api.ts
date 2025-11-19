 // Normalize the public API URL to ensure we don't end up with /api/api
function normalizeBaseUrl(url: string) {
  let base = (url || '').trim();
  if (!base) return 'https://glad-gpt.onrender.com';
  // remove trailing slash
  if (base.endsWith('/')) base = base.slice(0, -1);
  // remove trailing /api (case-insensitive)
  if (base.toLowerCase().endsWith('/api')) base = base.slice(0, -4);
  return base;
}

const BASE_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL || 'https://glad-gpt.onrender.com');

// API_URL configured from environment

export async function sendMessage(message: string, token?: string) {
  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: 'include',
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send message');
  }

  return response.json();
}

export async function sendSessionMessage(message: string, mode?: string) {
  const response = await fetch(`${BASE_URL}/api/chat/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ message, mode }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send message');
  }

  return response.json();
}

export async function getConversations(token?: string) {
  const response = await fetch(`${BASE_URL}/api/conversations`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get conversations');
  }

  return response.json();
}

// Backend authentication functions
export async function loginWithEmail(email: string, password: string) {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  return response.json();
}

export async function signupWithEmail(firstName: string, lastName: string, email: string, password: string) {
  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ firstName, lastName, email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Signup failed');
  }

  return response.json();
}

export async function loginAsDemo() {
  const response = await fetch(`${BASE_URL}/api/auth/demo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || 'Demo login failed');
  }

  return response.json();
}

export async function logout() {
  const response = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Logout failed');
  }

  return response.json();
}

export async function getCurrentUser() {
  const response = await fetch(`${BASE_URL}/api/auth/user`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    return null; // User not authenticated
  }

  return response.json();
}

// Smart chat function - implements Firebase auth priority with session fallback
export async function callChat(message: string, token?: string) {
  // Firebase authentication flow: Try /api/chat with Bearer token first
  if (token) {
    try {
      console.log('Attempting Firebase-authenticated chat request to /api/chat...');
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Firebase ID token
        },
        credentials: 'include',
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        const result = await response.json();
        return result.reply || result;
      }

      // Check if Firebase admin is not configured on backend
      const error = await response.json().catch(() => ({}));
      if (error.code === 'FIREBASE_ADMIN_NOT_CONFIGURED' || response.status === 503) {
        console.log('Firebase admin not configured on backend, falling back to session auth');
        // Fall through to session-based auth
      } else {
        throw new Error(error.message || 'Firebase chat request failed');
      }
    } catch (err: any) {
      if (err.message.includes('FIREBASE_ADMIN_NOT_CONFIGURED')) {
        console.log('Firebase admin not configured, falling back to session auth');
        // Fall through to session-based auth
      } else {
        throw err;
      }
    }
  }

  // Session-based authentication fallback: Use /api/chat/session
  console.log('Using session-based authentication, making request to /api/chat/session...');
  const response = await fetch(`${BASE_URL}/api/chat/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Sends session cookies
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Chat request failed' }));
    throw new Error(error.message || 'Chat request failed');
  }

  const result = await response.json();
  return result.reply || result; // Return just the reply text
}
