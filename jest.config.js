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
    'apps/backend/src/app.controller.spec.ts',
    'tests/e2e/'
  ],
  collectCoverageFrom: [
    'apps/**/*.{ts,js}',
    '!apps/**/*.d.ts',
    '!apps/**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  passWithNoTests: true
};