import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setToken, removeToken, getToken } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTechnical: boolean;
  isMediaPoster: boolean;
  isStudent: boolean;
  hasPermission: (permission: string) => boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message: string; user?: User }>;
  signup: (data: { name: string; usn: string; email?: string; password: string; branch?: string; semester?: string }) => Promise<{ success: boolean; message: string }>;
  setupTechnicalAdmin: (data: { name: string; usn: string; email?: string; password: string; confirmPassword: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('anvaya_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const currentToken = getToken();
      if (currentToken) {
        try {
          const res = await api.auth.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('anvaya_auth_user', JSON.stringify(res.user));
          }
        } catch {
          // Token expired or invalid
          removeToken();
          setUser(null);
          setTokenState(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await api.auth.login({ identifier, password });
      if (res.success && res.token) {
        setToken(res.token);
        setTokenState(res.token);
        setUser(res.user);
        localStorage.setItem('anvaya_auth_user', JSON.stringify(res.user));
        return { success: true, message: res.message || 'Login successful.', user: res.user };
      }
      return { success: false, message: res.message || 'Authentication failed.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to authenticate.' };
    }
  };

  const signup = async (data: { name: string; usn: string; email?: string; password: string; branch?: string; semester?: string }) => {
    try {
      const res = await api.auth.registerStudent(data);
      if (res.success && res.token) {
        setToken(res.token);
        setTokenState(res.token);
        setUser(res.user);
        localStorage.setItem('anvaya_auth_user', JSON.stringify(res.user));
        return { success: true, message: res.message || 'Registration successful.' };
      }
      return { success: false, message: res.message || 'Registration failed.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to register account.' };
    }
  };

  const setupTechnicalAdmin = async (data: { name: string; usn: string; email?: string; password: string; confirmPassword: string }) => {
    try {
      const res = await api.auth.setup(data);
      if (res.success && res.token) {
        setToken(res.token);
        setTokenState(res.token);
        setUser(res.user);
        localStorage.setItem('anvaya_auth_user', JSON.stringify(res.user));
        return { success: true, message: res.message || 'Setup successful.' };
      }
      return { success: false, message: res.message || 'Setup failed.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to complete technical setup.' };
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setTokenState(null);
  };

  const isAuthenticated = !!token && !!user;
  const isTechnical = user?.role === 'technical' || user?.role === 'admin';
  const isMediaPoster = user?.role === 'media-poster' || isTechnical || (user?.permissions?.includes('manage_gallery') ?? false);
  const isStudent = user?.role === 'student' || (!isTechnical && !isMediaPoster);

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (isTechnical) return true;
    return !!user.permissions?.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin: isTechnical,
        isTechnical,
        isMediaPoster,
        isStudent,
        hasPermission,
        login,
        signup,
        setupTechnicalAdmin,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
