/**
 * Jest configuration for BubblePop game tests
 */

export default {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Transform configuration - use default for ES modules
  transform: {},
  
  // Setup files
  // setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Module name mapping for ES6 imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Test match patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/main.js',
    '!src/**/*.test.js'
  ],
  
  // Coverage thresholds (lowered for initial run)
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary'
  ],
  
  // Test timeout
  testTimeout: 10000,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/coverage/'
  ],
  
  // Force exit after tests complete
  forceExit: true,
  
  // Disable open handles detection for faster execution
  detectOpenHandles: false
};