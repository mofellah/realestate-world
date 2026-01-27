module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/apps', '<rootDir>/packages'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'apps/**/*.ts',
    'packages/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@boilerplate/types(.*)$': '<rootDir>/packages/types/src$1',
    '^@boilerplate/utils(.*)$': '<rootDir>/packages/utils/src$1',
    '^@boilerplate/config(.*)$': '<rootDir>/packages/config/src$1',
    '^@boilerplate/logger(.*)$': '<rootDir>/packages/logger/src$1',
  },
};
