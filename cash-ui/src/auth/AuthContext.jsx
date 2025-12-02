import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

// Helper: decode JWT and check expiration (simple, not verifying signature)
function isTokenValid(token) {
  if (!token) return false;
  try {
    const [, payload] = token.split('.');
    if (!payload) return false;
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    );
    if (!decoded.exp) return false;
    // exp is in seconds
    return Date.now() < decoded.exp * 1000;
  } catch (e) {
    return false;
  }
}

import { logoutUser } from '../services/auth';

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: async () => {},
  refresh: () => {},
  loading: false,
});

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check token validity and set user info
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (isTokenValid(token)) {
      setIsAuthenticated(true);
      setUser({
        id: localStorage.getItem('userId'),
        username: localStorage.getItem('username'),
        email: localStorage.getItem('email'),
        firstName: localStorage.getItem('firstName'),
        lastName: localStorage.getItem('lastName'),
      });
    } else {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('access_token');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
    const handler = () => checkAuth();
    window.addEventListener('auth-changed', handler);
    return () => window.removeEventListener('auth-changed', handler);
  }, [checkAuth]);

  const login = useCallback(() => {
    checkAuth();
    window.dispatchEvent(new Event('auth-changed'));
  }, [checkAuth]);

  const logout = useCallback(async () => {
    const jwt = localStorage.getItem('access_token');
    const userId = localStorage.getItem('userId');
    await logoutUser(jwt, userId); // always try, even if fails, clear local
    // Remove all user-related localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('activeBidItemId');
    setIsAuthenticated(false);
    setUser(null);
    window.dispatchEvent(new Event('auth-changed'));
  }, []);

  const refresh = checkAuth;

  if (loading) {
    return <div></div>;
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, refresh, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
