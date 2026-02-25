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
    const initialize = async () => {
      // Check for hash fragment from Supabase OAuth redirect
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken) {
        // Validate token with backend before accepting
        try {
          const res = await fetch(`${API_BASE_URL}/auth/session`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          const result = await res.json();
          if (res.ok && result.status === 'success' && result.data.user) {
            const userData = result.data.user;
            const session = { access_token: accessToken, refresh_token: refreshToken, user: userData };
            localStorage.setItem('auth_session', JSON.stringify(session));
            setUser(userData);
          } else {
            alert('Account not permitted. Use KIIT/KIMS email only.');
          }
        } catch (err) {
          console.error('Validation error:', err);
        }
        window.history.replaceState({}, document.title, window.location.pathname);
        setLoading(false);
        return;
      }

      // Check localStorage for existing session and revalidate
      const storedSession = localStorage.getItem('auth_session');
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession);
          const token = session.access_token;
          const res = await fetch(`${API_BASE_URL}/auth/session`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const result = await res.json();
          if (res.ok && result.status === 'success' && result.data.user) {
            setUser(result.data.user);
          } else {
            localStorage.removeItem('auth_session');
          }
        } catch (error) {
          console.error('Error validating stored session:', error);
          localStorage.removeItem('auth_session');
        }
      }
      setLoading(false);
    };

    initialize();
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
