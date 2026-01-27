/**
 * Mock API Client
 * Provides mock HTTP methods for testing
 */

export const apiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

export const mockApiError = {
  status: 401,
  message: 'Unauthorized',
};
