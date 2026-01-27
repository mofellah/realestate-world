module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: {
    '^@boilerplate/types(.*)$': '<rootDir>/../../../packages/types/src$1',
    '^@boilerplate/utils(.*)$': '<rootDir>/../../../packages/utils/src$1',
    '^@boilerplate/config(.*)$': '<rootDir>/../../../packages/config/src$1',
    '^@boilerplate/logger(.*)$': '<rootDir>/../../../packages/logger/src$1',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.ts',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  coverageDirectory: '../../../coverage/backend',
  testTimeout: 10000,
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
};
