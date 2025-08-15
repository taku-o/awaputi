/**
 * Jest configuration for BubblePop game tests (Default - All Tests)
 * This configuration runs all tests except E2E tests
 * For specific test types, use jest.unit.config.js or jest.performance.config.js
 */

export default {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Enable ES modules support
  preset: null,
  
  // Transform configuration for ES modules and TypeScript
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
      tsconfig: 'tsconfig.test.json'
    }],
    '^.+\\.js$': 'ts-jest'
  },
  
  // Jest globals for ES modules
  globals: {
    'jest': true
  },
  
  // Transform ignore patterns for ES modules
  transformIgnorePatterns: [
    "node_modules/(?!(.*\\.mjs$))"
  ],
  
  // Module path mapping - include TypeScript extensions
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // Setup files - add global Jest setup
  setupFilesAfterEnv: [
    '<rootDir>/tests/jest-globals.js',
    '<rootDir>/tests/setup.js'
  ],
  
  // Enhanced module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@scenes/(.*)$': '<rootDir>/src/scenes/$1',
    '^@effects/(.*)$': '<rootDir>/src/effects/$1',
    '^@audio/(.*)$': '<rootDir>/src/audio/$1',
    '^@ui/(.*)$': '<rootDir>/src/ui/$1'
  },
  
  // Test match patterns - all tests except E2E (include TypeScript)
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js',
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.spec.ts'
  ],
  
  // Exclude E2E and Playwright tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/tests/e2e/',
    '/playwright-tests/',
    'e2e.*\\.test\\.js$'
  ],
  
  // Coverage configuration
  collectCoverage: false, // Disable by default for performance
  collectCoverageFrom: [
    'src/**/*.js',
    'src/**/*.ts',
    '!src/main.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/test/**',
    '!src/examples/**',
    '!src/deprecated/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 65,
      lines: 70,
      statements: 70
    }
  },
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html'
  ],
  coverageDirectory: '<rootDir>/coverage',
  
  // Test timeout - balanced for unit and performance tests
  testTimeout: 15000,
  
  // Mock handling
  clearMocks: true,
  restoreMocks: true,
  resetMocks: false,
  
  // Execution configuration
  maxWorkers: '50%', // Use 50% of available cores
  
  // Force exit after tests complete (enhanced for Issue #106)
  forceExit: true,
  detectOpenHandles: false,
  
  // Verbose output
  verbose: false,
  
  // Error handling
  errorOnDeprecated: false,
  
  // Cache configuration
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Reporters
  reporters: [
    'default'
  ],
  
  // Display name
  displayName: {
    name: 'All Tests',
    color: 'cyan'
  }
};