import React, { createContext, useContext, useEffect, useState } from 'react';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname.includes('localhost')
    ? 'http://localhost:5000/api'
    : 'https://khao-gully-survey.onrender.com/api');

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const storedSession = localStorage.getItem('auth_session');
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession);
          console.log('✅ Stored session found, user:', session.user?.email);
          setUser(session.user);
        } catch (error) {
          console.error('❌ Error parsing stored session:', error);
          localStorage.removeItem('auth_session');
        }
      } else {
        console.log('ℹ️ No stored session found');
      }
      setLoading(false);
    };

    // look for session or error in query string
    const params = new URLSearchParams(window.location.search);
    const sessionParam = params.get('session');
    const errorParam = params.get('error');
    const errorDetails = params.get('details');

    console.log('🔍 URL Check:', { 
      hasSessionParam: !!sessionParam, 
      hasErrorParam: !!errorParam,
      error: errorParam,
      details: errorDetails
    });

    if (sessionParam || errorParam) {
      console.log('🧹 Cleaning up URL');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (errorParam) {
      console.error('❌ OAuth error from callback:', errorParam, errorDetails);
      let msg = `Authentication failed: ${errorParam}`;
      if (errorParam === 'unauthorized_domain') {
        msg = 'Only KIIT/KIMS email addresses may sign in.';
      } else if (errorParam === 'no_code') {
        msg = 'OAuth code not received from Google. Please try again.';
      } else if (errorParam === 'no_session') {
        msg = 'Session not created. Please try again.';
      }
      if (errorDetails) {
        msg += ` (${errorDetails})`;
      }
      alert(msg);
      setLoading(false);
    } else if (sessionParam) {
      console.log('📦 Processing session from URL...');
      try {
        const session = JSON.parse(decodeURIComponent(sessionParam));
        console.log('✅ Session parsed successfully, user:', session.user?.email);
        localStorage.setItem('auth_session', JSON.stringify(session));
        setUser(session.user);
      } catch (error) {
        console.error('❌ Error parsing session from URL:', error);
        alert('Failed to parse authentication session. Please try again.');
      }
      setLoading(false);
    } else {
      console.log('📂 Checking stored session...');
      checkSession();
    }
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log('🔐 Frontend: Initiating Google sign-in...');
      console.log('📡 API URL:', `${API_BASE_URL}/auth/oauth/google`);
      const response = await fetch(`${API_BASE_URL}/auth/oauth/google`);
      
      console.log('📬 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to initiate Google sign-in:', response.status, errorText);
        throw new Error('Failed to initiate Google sign-in');
      }
      
      const data = await response.json();
      console.log('📦 OAuth response:', { status: data.status, hasUrl: !!data.data?.url });
      
      if (data.status === 'success' && data.data.url) {
        console.log('✅ OAuth URL received, redirecting to Google...');
        // Redirect to Google OAuth
        window.location.href = data.data.url;
      } else {
        console.error('❌ No OAuth URL received');
        throw new Error('No OAuth URL received');
      }
    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
      });
      
      localStorage.removeItem('auth_session');
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
