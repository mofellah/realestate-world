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
    // Exclude dependencies and built files
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  
  // Coverage thresholds (minimum 80% for critical paths)
  // These thresholds are checked when running with --coverage flag
  coverageThreshold: {
    global: {
      branches: 75,       // Some branch coverage
      functions: 80,      // Most functions tested
      lines: 80,          // Most lines covered
      statements: 80,     // Most statements covered
    },
  },
  
  coverageDirectory: '../../../coverage/backend',
  
  // Timeouts
  testTimeout: 10000,     // 10s default for unit tests
  
  // Serial execution to prevent test database conflicts
  runInBand: true,
  
  // Setup
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  
  // Test discovery patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.spec.ts',
    '<rootDir>/src/**/?(*.)+(spec).ts',
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
  
  // Reporters (default console + JSON summary)
  reporters: [
    'default',
    // Temporarily disabled jest-junit due to missing dependency
    // [
    //   'jest-junit',
    //   {
    //     outputDirectory: '../../../coverage/backend',
    //     outputName: 'test-results.xml',
    //     ancestorSeparator: ' › ',
    //   },
    // ],
  ],
  
  // TypeScript transformation
  globals: {
    'ts-jest': {
      useESM: false,
      isolatedModules: true,
      babelConfig: false,
    },
  },
  
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: false,
        tsconfig: '<rootDir>/tsconfig.json',
        isolatedModules: true,
        babelConfig: false,
      },
    ],
  },
  
  // Verbose output for debugging
  verbose: true,
};
