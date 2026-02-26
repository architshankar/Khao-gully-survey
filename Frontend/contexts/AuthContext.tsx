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
  authError: string | null;       // <-- new: holds domain rejection message
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ALLOWED_DOMAIN = 'kiit.ac.in';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);   // <-- new

  useEffect(() => {
    const hashParams  = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    // Always clean up the URL first so tokens don't linger
    if (accessToken) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (accessToken) {
      const tokenParts = accessToken.split('.');
      if (tokenParts.length === 3) {
        try {
          const payload  = JSON.parse(atob(tokenParts[1]));
          const email: string = payload.email ?? '';

          // ---- THE JUGAAD ----
          if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
            // Reject — don't store anything, show error
            setAuthError(
              `Only @${ALLOWED_DOMAIN} accounts are allowed. You signed in with ${email || 'an unknown email'}.`
            );
            setLoading(false);
            return;   // bail out, user stays null
          }
          // --------------------

          const userData: User = {
            id: payload.sub,
            email,
            user_metadata: payload.user_metadata || {},
          };

          const session = { access_token: accessToken, refresh_token: refreshToken, user: userData };
          localStorage.setItem('auth_session', JSON.stringify(session));
          setUser(userData);
          setAuthError(null);
        } catch (error) {
          console.error('Error parsing token:', error);
        }
      }
      setLoading(false);
    } else {
      // No redirect hash — check stored session
      const storedSession = localStorage.getItem('auth_session');
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession);
          // Extra safety: re-validate domain on every load
          if (session.user?.email?.endsWith(`@${ALLOWED_DOMAIN}`)) {
            setUser(session.user);
          } else {
            localStorage.removeItem('auth_session');
          }
        } catch (error) {
          console.error('Error parsing stored session:', error);
          localStorage.removeItem('auth_session');
        }
      }
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);   // clear any previous error before a new attempt
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`);
      if (!response.ok) throw new Error('Failed to initiate Google sign-in');

      const data = await response.json();
      if (data.status === 'success' && data.data.url) {
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
      await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      localStorage.removeItem('auth_session');
      setUser(null);
      setAuthError(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, authError, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
