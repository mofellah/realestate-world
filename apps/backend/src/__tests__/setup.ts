/**
 * Jest Global Setup File
 * 
 * Configures the test environment before any tests run.
 * Handles:
 * - Environment variables for testing
 * - Global mocks and stubs
 * - Test error suppression
 * - Logging configuration
 * - Correlation ID generation
 */

// ============================================================================
// Environment Variables
// ============================================================================

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/boilerplate_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-testing-only-with-minimum-32-characters-required';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
process.env.PORT = '3001';
process.env.HOST = '0.0.0.0';
process.env.LOG_LEVEL = 'warn';

// ============================================================================
// Global Mocks
// ============================================================================

// Mock fetch (not always available in Node)
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Suppress expected console errors in tests
// These are errors we expect during error handling tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  // Suppress specific expected errors during tests
  console.error = jest.fn((...args) => {
    const errorMessage = args[0]?.toString?.() || '';
    
    // Allow these error patterns through
    const expectedPatterns = [
      'Environment validation failed',
      'Invalid backend environment',
      'ENOENT',
      'Cannot find module',
    ];
    
    const isExpected = expectedPatterns.some(pattern => errorMessage.includes(pattern));
    
    if (!isExpected) {
      originalError.call(console, ...args);
    }
  });
  
  console.warn = jest.fn((...args) => {
    const warnMessage = args[0]?.toString?.() || '';
    const isExpected = warnMessage.includes('deprecation');
    
    if (!isExpected) {
      originalWarn.call(console, ...args);
    }
  });
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// ============================================================================
// Test Timeout Configuration
// ============================================================================

// Default timeout is 10s (set in jest.config.js)
// For integration tests, use: jest.setTimeout(30000)

// ============================================================================
// Global Test Hooks
// ============================================================================

/**
 * Generate a correlation ID for test requests
 * Used to track request flow through logs
 */
export function generateTestCorrelationId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(7);
  return `test-${timestamp}-${random}`;
}

/**
 * Before each test: Reset all mocks and set up test context
 */
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset any global state if needed
  jest.restoreAllMocks();
});

/**
 * After each test: Cleanup and reset
 */
afterEach(() => {
  // Clear all mocks after each test
  jest.clearAllMocks();
});

// ============================================================================
// Global Test Utilities (accessible in all tests)
// ============================================================================

declare global {
  let testCorrelationId: string;
  let testContext: {
    correlationId: string;
    userId?: string;
    timestamp: Date;
  };
}

// Initialize global test context
globalThis.testCorrelationId = generateTestCorrelationId();
globalThis.testContext = {
  correlationId: generateTestCorrelationId(),
  timestamp: new Date(),
};

// ============================================================================
// Suppress Specific Warnings
// ============================================================================

// Suppress Prisma warnings if needed
process.on('warning', (warning) => {
  // Only log unexpected warnings
  if (!warning.message.includes('DeprecationWarning')) {
    console.warn(warning);
  }
});
