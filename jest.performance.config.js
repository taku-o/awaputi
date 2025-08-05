/**
 * Jest configuration for performance tests
 * Specialized configuration with longer timeouts and performance-specific settings
 */

export default {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Module type for ES Modules support
  preset: null,
  
  // Transform configuration for ES modules
  extensionsToTreatAsEsm: ['.js'],
  transform: {},
  
  // Global setup with performance-specific utilities
  setupFilesAfterEnv: [
    '<rootDir>/tests/jest-globals.js',
    '<rootDir>/tests/setup.js'
  ],
  
  // Test file patterns - performance tests only
  testMatch: [
    '<rootDir>/tests/performance/**/*.test.js',
    '<rootDir>/tests/performance/**/*.spec.js',
    '<rootDir>/tests/**/*performance*.test.js',
    '<rootDir>/tests/**/*Performance*.test.js'
  ],
  
  // Exclude non-performance tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/e2e/',
    '/playwright-tests/',
    // Exclude unit tests that don't have 'performance' in the name
    '<rootDir>/tests/unit/',
    '<rootDir>/tests/integration/',
    '<rootDir>/tests/mocks/',
    '<rootDir>/tests/utils/',
    '<rootDir>/tests/config/'
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
    '^@ui/(.*)$': '<rootDir>/src/ui/$1',
    '^@performance/(.*)$': '<rootDir>/tests/utils/$1'
  },
  
  // Coverage configuration - disabled for performance tests to avoid overhead
  collectCoverage: false,
  
  // Extended timeout for performance tests
  testTimeout: 30000, // 30 seconds for performance tests
  
  // Globals with performance-specific settings
  globals: {
    'jest': true,
    '__PERFORMANCE_MODE__': true,
    '__TEST_TIMEOUT__': 30000
  },
  
  // Verbose output for performance analysis
  verbose: true, // Enable detailed output for performance tests
  
  // Error handling
  errorOnDeprecated: false,
  
  // Mock handling - more conservative for performance tests
  clearMocks: true,
  restoreMocks: true,
  resetMocks: false,
  
  // Custom setup for performance testing
  setupFiles: [
    '<rootDir>/tests/jest-globals.js'
  ],
  
  // Module directories
  moduleDirectories: [
    'node_modules',
    '<rootDir>/src',
    '<rootDir>/tests',
    '<rootDir>/tests/utils'
  ],
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(es6-module-to-transform)/)'
  ],
  
  // Watch mode configuration
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/',
    '/build/',
    '/tests/e2e/',
    '/playwright-tests/',
    '/tests/unit/',
    '/tests/integration/'
  ],
  
  // Sequential execution for consistent performance measurements
  maxWorkers: 1, // Run performance tests sequentially to avoid interference
  runInBand: true, // Force sequential execution
  
  // Test execution configuration
  randomize: false, // Maintain test order for consistent results
  
  // Reporters with performance-specific output
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/test-results/performance',
        outputName: 'performance-test-results.xml',
        suiteName: 'Performance Tests'
      }
    ]
  ],
  
  // Cache configuration
  cache: false, // Disable cache for fresh performance measurements
  
  // Notify configuration
  notify: false,
  notifyMode: 'failure-change',
  
  // Bail on first failure for performance tests
  bail: 1, // Stop on first failure to save time
  
  // Force exit after tests complete
  forceExit: true, // Ensure clean exit for performance tests
  detectOpenHandles: true,
  
  // Test name pattern (can be overridden via CLI)
  testNamePattern: undefined,
  
  // Custom environment options with performance considerations
  testEnvironmentOptions: {
    url: 'http://localhost',
    // Additional options for performance testing
    runScripts: 'dangerously',
    resources: 'usable'
  },
  
  // Display name for this configuration
  displayName: {
    name: 'Performance Tests',
    color: 'yellow'
  },
  
  // Performance-specific Jest options
  logHeapUsage: true, // Log heap usage for memory performance analysis
  
  // Retry configuration for flaky performance tests
  retryTimes: 2, // Retry failed tests up to 2 times
  
  // Silent mode to reduce noise during performance testing
  silent: false, // Keep console output for performance debugging
  
  // Test environment setup for performance testing
  globalSetup: undefined,
  globalTeardown: undefined,
  
  // Custom resolver for performance test utilities
  resolver: undefined,
  
  // Additional configuration for performance monitoring
  extraGlobals: [
    'performance',
    'PerformanceObserver',
    'PerformanceMark',
    'PerformanceMeasure'
  ]
};