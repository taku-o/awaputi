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
  
  // Transform configuration for ES modules
  extensionsToTreatAsEsm: ['.js'],
  transform: {},
  
  // Jest globals for ES modules
  globals: {
    'jest': true
  },
  
  // Transform ignore patterns for ES modules
  transformIgnorePatterns: [
    "node_modules/(?!(.*\\.mjs$))"
  ],
  
  // Module path mapping
  moduleFileExtensions: ['js', 'json'],
  
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
  
  // Test match patterns - all tests except E2E
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],
  
  // Exclude E2E and Playwright tests
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/coverage/',
    '<rootDir>/tests/e2e/',
    '<rootDir>/playwright-tests/',
    '/tests/**/*e2e*.test.js'
  ],
  
  // Coverage configuration
  collectCoverage: false, // Disable by default for performance
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/main.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
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
  runInBand: false, // Allow parallel execution
  
  // Force exit after tests complete
  forceExit: false,
  detectOpenHandles: true,
  
  // Verbose output
  verbose: false,
  
  // Error handling
  errorOnDeprecated: false,
  
  // Cache configuration
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/test-results',
        outputName: 'test-results.xml',
        suiteName: 'All Tests (Unit + Performance)'
      }
    ]
  ],
  
  // Display name
  displayName: {
    name: 'All Tests',
    color: 'cyan'
  }
};