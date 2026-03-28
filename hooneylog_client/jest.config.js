/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-var-requires */
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@App/(.*)$': '<rootDir>/src/$1',
    '^components/(.*)$': '<rootDir>/src/components/$1',
    'pages/(.*)$': '<rootDir>/src/pages/$1',
    '^hooks/(.*)$': '<rootDir>/src/hooks/$1',
    'redux/(.*)$': '<rootDir>/src/redux/$1',
    '^ts(.*)$': '<rootDir>/src/ts/$1',
    'util/(.*)$': '<rootDir>/src/util/$1',
    'mock/(.*)$': '<rootDir>/src/mock/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
