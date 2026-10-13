import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api } from '@/lib/api';
import type { User, AuthResponse, ApiResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pb_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Verify session on mount
  useEffect(() => {
    const token = localStorage.getItem('pb_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    api.get<ApiResponse<User>>('/auth/me')
      .then((res) => {
        setUser(res.data.data);
        localStorage.setItem('pb_user', JSON.stringify(res.data.data));
      })
      .catch(() => {
        localStorage.removeItem('pb_token');
        localStorage.removeItem('pb_user');
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
    const { token, user: u } = res.data.data;
    localStorage.setItem('pb_token', token);
    localStorage.setItem('pb_user', JSON.stringify(u));
    setUser(u);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', { name, email, password });
    const { token, user: u } = res.data.data;
    localStorage.setItem('pb_token', token);
    localStorage.setItem('pb_user', JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch { /* best effort */ }
    localStorage.removeItem('pb_token');
    localStorage.removeItem('pb_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
