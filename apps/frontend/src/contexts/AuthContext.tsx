/**
 * Authentication Context
 * Manages user authentication state, token storage, and auth guards
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth-service';
import { tokenStorage } from '@/utils/token-storage';
import type { LoginResponse } from '@boilerplate/types';

interface AuthContextType {
  user: LoginResponse['user'] | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; passwordConfirmation: string; name?: string }) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginResponse['user'] | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = tokenStorage.getAccessToken();
      if (accessToken) {
        try {
          // Fetch user profile from backend
          const userData = await fetch('/api/users/me', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }).then(res => res.json());
          
          setUser(userData);
        } catch (error) {
          // Token invalid or expired, clear it
          console.warn('Session validation failed, clearing tokens');
          tokenStorage.clearTokens();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response.user);
    navigate('/dashboard');
  };

  const register = async (data: { email: string; password: string; passwordConfirmation: string; name?: string }) => {
    const response = await authService.register(data);
    setUser(response.user);
    navigate('/dashboard');
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    tokenStorage.clearTokens();
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
