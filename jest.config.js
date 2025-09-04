// Minimal Jest configuration for Health Bridge
module.exports = {
  projects: [
    {
      displayName: 'backend',
      testMatch: ['<rootDir>/apps/backend/src/**/*.(test|spec).ts'],
      preset: 'ts-jest',
      testEnvironment: 'node',
      rootDir: '.',
      moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/apps/backend/src/$1'
      },
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
    }
  ],
  passWithNoTests: true
};