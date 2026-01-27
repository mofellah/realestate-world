/**
 * Jest Setup File
 * Configure test environment
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/boilerplate_test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-for-testing-only';
process.env.JWT_EXPIRATION = '900';
process.env.JWT_REFRESH_EXPIRATION = '604800';
process.env.FRONTEND_URL = 'http://localhost:5173';

// Mock fetch for global
if (!global.fetch) {
  global.fetch = jest.fn();
}
