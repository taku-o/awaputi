/**
 * Jest configuration for BubblePop game tests
 */

export default {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Module name mapping for ES6 imports
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Transform configuration
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json'],
  
  // Test match patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/main.js',
    '!src/**/*.test.js',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Specific thresholds for critical files
    './src/core/GameEngine.js': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/bubbles/Bubble.js': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],
  
  // Coverage directory
  coverageDirectory: 'coverage',
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Error on deprecated features
  errorOnDeprecated: true,
  
  // Notify mode (for watch mode)
  notify: true,
  notifyMode: 'failure-change',
  
  // Globals
  globals: {
    __DEV__: true,
    __VERSION__: '1.0.0'
  },
  
  // Test results processor
  testResultsProcessor: '<rootDir>/tests/results-processor.js',
  
  // Reporters
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './test-results',
      filename: 'jest-report.html',
      expand: true
    }],
    ['jest-junit', {
      outputDirectory: './test-results',
      outputName: 'jest-results.xml'
    }]
  ],
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  
  // Max workers for parallel execution
  maxWorkers: '50%',
  
  // Cache directory
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/coverage/'
  ],
  
  // Module paths to ignore
  modulePathIgnorePatterns: [
    '<rootDir>/dist/'
  ],
  
  // Snapshot serializers
  snapshotSerializers: [],
  
  // Custom matchers
  setupFiles: [],
  
  // Force exit after tests complete
  forceExit: false,
  
  // Detect open handles
  detectOpenHandles: true,
  
  // Detect leaks
  detectLeaks: false
};