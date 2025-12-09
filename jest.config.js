module.exports = {
  preset: 'ts-jest',

  // Projects for different test environments
  projects: [
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/src/main/**/*.test.ts',
        '<rootDir>/src/main/**/*.spec.ts',
      ],
      transform: {
        '^.+\\.ts$': ['ts-jest', {
          tsconfig: {
            types: ['node', 'jest'],
          },
          isolatedModules: true,
        }],
      },
    },
    {
      displayName: 'jsdom',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/src/renderer/**/*.test.ts',
        '<rootDir>/src/renderer/**/*.test.tsx',
        '<rootDir>/src/renderer/**/*.spec.ts',
        '<rootDir>/src/renderer/**/*.spec.tsx',
      ],
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
          tsconfig: {
            types: ['node', 'jest'],
            jsx: 'react',
          },
          isolatedModules: true,
        }],
      },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      moduleNameMapper: {
        '\\.(css|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
      },
    },
  ],

  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.tsx',
    '!src/**/*.test.tsx',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
};
