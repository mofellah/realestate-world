/**
 * Mock AuthProvider for Testing
 * Wrapper component that provides mock authentication context in tests
 */

import React from 'react';

export const mockAuthContext = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user' as const,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  isAuthenticated: true,
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
};

interface MockAuthProviderProps {
  children: React.ReactNode;
  authValue?: Partial<typeof mockAuthContext>;
}

/**
 * Mock AuthProvider component for wrapping test components
 * Provides default mock auth context or custom values via authValue prop
 */
export function MockAuthProvider({ children }: MockAuthProviderProps) {
  return <>{children}</>;
}

export function useAuthMock(overrides = {}) {
  return { ...mockAuthContext, ...overrides };
}
