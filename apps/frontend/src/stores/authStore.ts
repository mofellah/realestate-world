// Authentication store with mock data
import { create } from 'zustand';
import { User, UserRole } from '../types';
import mockDatabase from '../mocks/mockData';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    
    // Mock login - find user by email or use first user
    setTimeout(() => {
      const user = mockDatabase.users.find(u => u.email === email) || mockDatabase.users[0];
      
      // Store in localStorage
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_token', 'mock_token_' + Date.now());
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
    }, 500);
  },

  logout: () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    set({ user: null, isAuthenticated: false });
  },

  register: async (email: string, password: string, firstName: string, lastName: string) => {
    set({ isLoading: true });
    
    // Mock registration
    setTimeout(() => {
      const newUser: User = {
        id: 'user_new_' + Date.now(),
        email,
        role: UserRole.USER,
        isActive: true,
        country_code: 'BE',
        avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
        personId: 'person_new_' + Date.now(),
        person: {
          id: 'person_new_' + Date.now(),
          email,
          phone: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        physicalPerson: {
          id: 'phys_new_' + Date.now(),
          personId: 'person_new_' + Date.now(),
          person: {} as any,
          firstName,
          lastName,
          nationality: undefined,
          idVerified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      mockDatabase.users.push(newUser);
      localStorage.setItem('auth_user', JSON.stringify(newUser));
      localStorage.setItem('auth_token', 'mock_token_' + Date.now());
      
      set({ 
        user: newUser, 
        isAuthenticated: true, 
        isLoading: false 
      });
    }, 500);
  },

  checkAuth: () => {
    const userStr = localStorage.getItem('auth_user');
    const token = localStorage.getItem('auth_token');
    
    if (userStr && token) {
      const user = JSON.parse(userStr);
      set({ user, isAuthenticated: true });
    }
  },
}));
