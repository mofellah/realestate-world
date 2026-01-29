/**
 * Mock Auth Service
 * Provides mock implementations of authentication methods for testing
 */

class AuthServiceMock {
  login = jest.fn();
  logout = jest.fn();
  refreshToken = jest.fn();
  isAuthenticated = jest.fn();
  getRefreshToken = jest.fn();
}

export const authService = new AuthServiceMock();
