module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  moduleFileExtensions: ['ts', 'js', 'json'],
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
  testMatch: ['**/__tests__/**/*.spec.ts', '**/?(*.)+(spec).ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '\\.d\\.ts$'],
  transformIgnorePatterns: ['/node_modules/', '/dist/'],
  globals: {
    'ts-jest': {
      useESM: false,
      tsconfig: {
        jsx: 'react',
      },
    },
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: false,
      tsconfig: {
        module: 'commonjs',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        target: 'ES2021',
        lib: ['ES2021'],
        strict: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        resolveJsonModule: true,
        skipLibCheck: true,
        skipDefaultLibCheck: true,
      },
      isolatedModules: true,
      babelConfig: false,
    }],
  },
};
