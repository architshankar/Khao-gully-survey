import React, { createContext, useContext, useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
          setUser(session.user);
        } catch (error) {
          console.error('Error parsing session:', error);
          localStorage.removeItem('auth_session');
        }
      }
      setLoading(false);
    };

    // look for session or error in query string
    const params = new URLSearchParams(window.location.search);
    const sessionParam = params.get('session');
    const errorParam = params.get('error');

    if (sessionParam || errorParam) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (errorParam) {
      console.error('OAuth error:', errorParam);
      const msg = errorParam === 'unauthorized_domain'
        ? 'Only KIIT/KIMS email addresses may sign in.'
        : `Authentication failed: ${errorParam}`;
      alert(msg);
      setLoading(false);
    } else if (sessionParam) {
      try {
        const session = JSON.parse(decodeURIComponent(sessionParam));
        localStorage.setItem('auth_session', JSON.stringify(session));
        setUser(session.user);
      } catch (error) {
        console.error('Error processing session:', error);
      }
      setLoading(false);
    } else {
      checkSession();
    }
  }, []);

  const signInWithGoogle = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`);
      
      if (!response.ok) {
        throw new Error('Failed to initiate Google sign-in');
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && data.data.url) {
        // Redirect to Google OAuth
        window.location.href = data.data.url;
      } else {
        throw new Error('No OAuth URL received');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
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
