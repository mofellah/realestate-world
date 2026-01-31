/**
 * Frontend Jest Configuration
 * Unit and integration testing for React components and hooks
 */

module.exports = {
  displayName: 'frontend',
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/src/**/?(*.)+(spec|test).{ts,tsx}',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
      useESM: true,
    }],
  },
  setupFilesAfterEnv: ['<rootDir>/src/setup-tests.ts'],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  globals: {
    'import.meta': {
      env: {
        VITE_API_URL: 'http://localhost:3000',
        MODE: 'test',
      },
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@boilerplate/types(.*)$': '<rootDir>/../../packages/types/src$1',
    '^@boilerplate/utils(.*)$': '<rootDir>/../../packages/utils/src$1',
    '^@boilerplate/config(.*)$': '<rootDir>/../../packages/config/src$1',
    '^@boilerplate/logger(.*)$': '<rootDir>/../../packages/logger/src$1',

    // Mock CSS imports
    '\\.(css|scss|sass)$': '<rootDir>/src/__mocks__/styleMock.js',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/__mocks__/**',
    '!src/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
};
