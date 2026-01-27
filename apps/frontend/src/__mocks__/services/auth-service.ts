/**
 * Mock Auth Service
 * Provides mock implementations of authentication methods for testing
 */

import type { LoginResponse, RegisterResponse } from '@boilerplate/types';

const defaultLoginResponse: LoginResponse = {
  accessToken: 'token',
  refreshToken: 'refresh',
};

const defaultRegisterResponse: RegisterResponse = {
  accessToken: 'token',
  refreshToken: 'refresh',
  expiresIn: 900,
  user: {
    id: 'user-id',
    email: 'test@example.com',
    name: 'Test User',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

class AuthServiceMock {
  login = jest.fn().mockResolvedValue(defaultLoginResponse);
  register = jest.fn().mockResolvedValue(defaultRegisterResponse);
  logout = jest.fn().mockResolvedValue(undefined);
  refreshToken = jest.fn().mockResolvedValue(defaultLoginResponse.accessToken);
  isAuthenticated = jest.fn().mockReturnValue(false);
  getRefreshToken = jest.fn().mockReturnValue(defaultLoginResponse.refreshToken);
}

export const authService = new AuthServiceMock();
