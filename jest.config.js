// Minimal Jest configuration for Health Bridge
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.(ts|js)',
    '**/*.(test|spec).(ts|js)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.next/',
    '/coverage/',
    'tests/e2e/'
  ],
  collectCoverageFrom: [
    'apps/**/*.{ts,js}',
    '!apps/**/*.d.ts',
    '!apps/**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  passWithNoTests: true,
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', {
      tsconfig: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        useDefineForClassFields: false,
        esModuleInterop: true
      }
    }]
  }
};