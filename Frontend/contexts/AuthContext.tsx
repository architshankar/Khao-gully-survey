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
    // Check for hash fragment from Supabase OAuth redirect
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    if (accessToken) {
      // Parse user data from hash
      const tokenParts = accessToken.split('.');
      if (tokenParts.length === 3) {
        try {
          const payload = JSON.parse(atob(tokenParts[1]));
          const userData = {
            id: payload.sub,
            email: payload.email,
            user_metadata: payload.user_metadata || {}
          };
          
          // Store session
          const session = {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: userData
          };
          
          localStorage.setItem('auth_session', JSON.stringify(session));
          setUser(userData);
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Error parsing token:', error);
        }
      }
      setLoading(false);
    } else {
      // Check localStorage for existing session
      const storedSession = localStorage.getItem('auth_session');
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession);
          setUser(session.user);
        } catch (error) {
          console.error('Error parsing stored session:', error);
          localStorage.removeItem('auth_session');
        }
      }
      setLoading(false);
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
