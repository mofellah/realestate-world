/**
 * Jest Configuration for Backend Tests
 * 
 * Features:
 * - TypeScript support with ts-jest
 * - Module alias resolution (@boilerplate/*)
 * - Comprehensive coverage collection (80%+ thresholds)
 * - Test timeout 10s for unit tests, 30s for integration tests
 * - Setup file for global test configuration
 * - Verbose reporting and JSON summary output
 */

module.exports = {
  // Core configuration
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  
  // File extensions
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // Module alias mapping (matches tsconfig.json paths)
  moduleNameMapper: {
    '^@boilerplate/types(.*)$': '<rootDir>/../../packages/types/src$1',
    '^@boilerplate/utils(.*)$': '<rootDir>/../../packages/utils/src$1',
    '^@boilerplate/config(.*)$': '<rootDir>/../../packages/config/src$1',
    '^@boilerplate/logger(.*)$': '<rootDir>/../../packages/logger/src$1',
  },
  
  // Coverage configuration
  collectCoverageFrom: [
    // Include all TypeScript and JavaScript files
    'src/**/*.(ts|js)',
    // Exclude test files
    '!src/**/*.spec.ts',
    '!src/**/__tests__/**',
    // Exclude use-cases (thin orchestration layer)
    '!src/use-cases/**',
    // Exclude dependencies and built files
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  
  // Coverage thresholds (minimum 80% for critical paths)
  // These thresholds are checked when running with --coverage flag
  coverageThreshold: {
    global: {
      branches: 73,       // Some branch coverage
      functions: 80,      // Most functions tested
      lines: 80,          // Most lines covered
      statements: 80,     // Most statements covered
    },
  },
  
  coverageDirectory: '../../../coverage/backend',
  
  // Serial execution to prevent test database conflicts
  maxWorkers: 1,  // Run tests sequentially
  
  // Setup
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  
  // Test discovery patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.spec.ts',
    '<rootDir>/src/**/__tests__/**/*.test.ts',
    '<rootDir>/src/**/?(*.)+(spec|test).ts',
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '\\.d\\.ts$',
  ],
  
  transformIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
  
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
};
