import { auth } from "./firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://glad-gpt.onrender.com';

// API_URL configured from environment

export async function sendMessage(message: string, token?: string) {
  const response = await fetch(`${API_URL}/api/chat`, {
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
  const response = await fetch(`${API_URL}/api/chat/session`, {
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
  const response = await fetch(`${API_URL}/api/conversations`, {
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
  const response = await fetch(`${API_URL}/api/auth/login`, {
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
  const response = await fetch(`${API_URL}/api/auth/signup`, {
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
  const response = await fetch(`${API_URL}/api/auth/demo`, {
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
  const response = await fetch(`${API_URL}/api/auth/logout`, {
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
  const response = await fetch(`${API_URL}/api/auth/user`, {
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

// Simplified chat function - always uses session-based authentication
export async function callChat(message: string) {
  console.log('Making session-based chat request...');
  
  const response = await fetch(`${API_URL}/api/chat/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Chat request failed' }));
    throw new Error(error.message || 'Chat request failed');
  }

  const result = await response.json();
  return result.reply || result; // Return just the reply text
}
