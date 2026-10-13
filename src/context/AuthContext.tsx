import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { STORAGE_KEYS } from '@/config/constants';
import api from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User, rememberMe?: boolean) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const clearStoredAuth = () => {
  [localStorage, sessionStorage].forEach((storage) => {
    storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    storage.removeItem(STORAGE_KEYS.USER);
    storage.removeItem('pb_token');
    storage.removeItem('pb_user');
  });
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    const token =
      localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ||
      sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

    if (!token) {
      clearStoredAuth();
      setIsLoading(false);
      return () => {
        isActive = false;
      };
    }

    api.get('/auth/me')
      .then((response) => {
        if (!isActive) return;
        const currentUser = response.data.data as User;
        setUser(currentUser);
        const storage = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
          ? localStorage
          : sessionStorage;
        storage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
        localStorage.removeItem('pb_token');
        localStorage.removeItem('pb_user');
        sessionStorage.removeItem('pb_token');
        sessionStorage.removeItem('pb_user');
      })
      .catch((error) => {
        if (!isActive) return;
        console.error('Failed to restore authentication:', error);
        clearStoredAuth();
        setUser(null);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const login = (token: string, userData: User, rememberMe = false) => {
    clearStoredAuth();
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    storage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
    
    // Call logout API
    api.post('/auth/logout').catch(() => {
      // Ignore errors on logout
    });
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    const storage = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      ? localStorage
      : sessionStorage;
    storage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
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
