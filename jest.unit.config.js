/**
 * Jest configuration for unit and integration tests
 * Separated from performance and E2E tests for better organization
 */

export default {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Module type for ES Modules support
  preset: null,
  
  // Transform configuration for ES modules
  extensionsToTreatAsEsm: ['.js'],
  transform: {},
  
  // Global setup
  setupFilesAfterEnv: [
    '<rootDir>/tests/jest-globals.js',
    '<rootDir>/tests/setup.js'
  ],
  
  // Test file patterns - unit and integration tests only
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],
  
  // Explicitly exclude performance and E2E tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/e2e/',
    '/tests/performance/',
    '/tests/**/*performance*.test.js',
    '/tests/**/*e2e*.test.js',
    '/playwright-tests/'
  ],
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json'],
  
  // Module name mapping for path resolution
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
  
  // Coverage configuration
  collectCoverage: false, // Enable only when needed to avoid performance overhead
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/test/**',
    '!src/examples/**',
    '!src/deprecated/**'
  ],
  coverageDirectory: '<rootDir>/coverage/unit',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Test timeout
  testTimeout: 15000, // 15 seconds for unit/integration tests
  
  // Globals
  globals: {
    'jest': true
  },
  
  // Verbose output for better debugging
  verbose: false, // Set to true for detailed output
  
  // Error handling
  errorOnDeprecated: false, // Allow deprecated features for compatibility
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  resetMocks: false, // Keep manual mocks
  
  // Test result processor
  testResultsProcessor: undefined,
  
  // Custom matchers and utilities
  setupFiles: [
    '<rootDir>/tests/jest-globals.js'
  ],
  
  // Module directories
  moduleDirectories: [
    'node_modules',
    '<rootDir>/src',
    '<rootDir>/tests'
  ],
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(es6-module-to-transform)/)'
  ],
  
  // Resolver configuration
  resolver: undefined,
  
  // Watch mode configuration
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/',
    '/build/',
    '/tests/e2e/',
    '/playwright-tests/'
  ],
  
  // Max workers for parallel execution
  maxWorkers: '50%', // Use 50% of available cores
  
  // Test execution configuration
  randomize: false, // Maintain test order for consistency
  runInBand: false, // Allow parallel execution
  
  // Reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/test-results/unit',
        outputName: 'unit-test-results.xml',
        suiteName: 'Unit and Integration Tests'
      }
    ]
  ],
  
  // Cache configuration
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache/unit',
  
  // Notify configuration
  notify: false,
  notifyMode: 'failure-change',
  
  // Bail configuration
  bail: 0, // Don't stop on first failure
  
  // Force exit after tests complete
  forceExit: false,
  detectOpenHandles: true,
  
  // Test name pattern (can be overridden via CLI)
  testNamePattern: undefined,
  
  // Projects configuration (for multi-project setup)
  projects: undefined,
  
  // Custom environment options
  testEnvironmentOptions: {
    url: 'http://localhost'
  },
  
  // Display name for this configuration
  displayName: {
    name: 'Unit & Integration Tests',
    color: 'blue'
  }
};