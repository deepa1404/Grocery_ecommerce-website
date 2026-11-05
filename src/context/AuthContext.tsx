import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useToast } from './ToastContext.tsx';

interface AuthContextValue {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (emailOrMobile: string, pass: string) => Promise<boolean>;
  register: (data: { name: string; email: string; mobile: string; password: string; confirmPassword?: string }) => Promise<boolean>;
  logout: () => void;
  quickLogin: (role: 'admin' | 'customer') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('freshcart_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const { showToast } = useToast();

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('freshcart_token');
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        localStorage.removeItem('freshcart_token');
        setToken(null);
        setUser(null);
      }
    } catch {
      localStorage.removeItem('freshcart_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (emailOrMobile: string, pass: string): Promise<boolean> => {
    try {
      const res = await api.login({ emailOrMobile, password: pass });
      if (res.success && res.token) {
        localStorage.setItem('freshcart_token', res.token);
        setToken(res.token);
        setUser(res.user);
        closeAuthModal();
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
      return false;
    }
  };

  const register = async (data: { name: string; email: string; mobile: string; password: string; confirmPassword?: string }): Promise<boolean> => {
    try {
      const res = await api.register(data);
      if (res.success && res.token) {
        localStorage.setItem('freshcart_token', res.token);
        setToken(res.token);
        setUser(res.user);
        closeAuthModal();
        showToast('Registration successful! Welcome to FreshCart.', 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('freshcart_token');
    setToken(null);
    setUser(null);
    showToast('You have been logged out safely.', 'info');
  };

  const quickLogin = async (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      await login('admin@freshcart.com', 'Admin@123');
    } else {
      await login('customer@freshcart.com', 'Customer@123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        quickLogin,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
