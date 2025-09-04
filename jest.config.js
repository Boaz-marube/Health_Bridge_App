module.exports = {
  projects: [
    // Backend testing configuration
    {
      displayName: 'backend',
      testMatch: ['<rootDir>/apps/backend/**/*.spec.ts', '<rootDir>/apps/backend/**/*.test.ts'],
      testPathIgnorePatterns: [
        '<rootDir>/apps/backend/src/app.controller.spec.ts', // Ignore NestJS generated test for now
      ],
      preset: 'ts-jest',
      testEnvironment: 'node',
      rootDir: '.',
      collectCoverageFrom: [
        'apps/backend/src/**/*.ts',
        '!apps/backend/src/**/*.spec.ts',
        '!apps/backend/src/**/*.test.ts',
        '!apps/backend/src/main.ts',
      ],
      coverageDirectory: 'coverage/backend',
      coverageReporters: ['text', 'lcov', 'html'],
      setupFilesAfterEnv: ['<rootDir>/apps/backend/test/setup.ts'],
    },
    // Frontend testing configuration
    {
      displayName: 'frontend',
      testMatch: ['<rootDir>/apps/frontend/**/*.test.{js,jsx,ts,tsx}'],
      testEnvironment: 'jsdom',
      rootDir: '.',
      setupFilesAfterEnv: ['<rootDir>/apps/frontend/jest.setup.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/apps/frontend/src/$1',
      },
      collectCoverageFrom: [
        'apps/frontend/src/**/*.{js,jsx,ts,tsx}',
        '!apps/frontend/src/**/*.test.{js,jsx,ts,tsx}',
        '!apps/frontend/src/**/*.d.ts',
      ],
      coverageDirectory: 'coverage/frontend',
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
      },
    },
  ],
  // Global coverage thresholds for Health Bridge
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};