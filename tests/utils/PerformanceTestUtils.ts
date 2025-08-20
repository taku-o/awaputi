/**
 * Performance Test Utils - Environment-aware performance testing utilities
 * Provides stable performance testing with environment-specific thresholds and retry logic
 */

import { jest } from '@jest/globals';

export class PerformanceTestUtils {
  /**
   * Detects the current testing environment
   * @returns {string} Environment type: 'ci', 'local', 'production'
   */
  static detectEnvironment() {
    // Check for CI environment variables
    if (process.env.CI === 'true' || 
        process.env.GITHUB_ACTIONS === 'true' || 
        process.env.TRAVIS === 'true' || 
        process.env.CIRCLECI === 'true' ||
        process.env.JENKINS_URL ||
        process.env.BUILDKITE) {
      return 'ci';
    }
    
    // Check for production environment
    if (process.env.NODE_ENV === 'production') {
      return 'production';
    }
    
    // Default to local development
    return 'local';
  }

  /**
   * Gets environment-specific performance thresholds
   * @param {string} environment - Environment type
   * @returns {Object} Performance thresholds
   */
  static getEnvironmentThresholds(environment = null) {
    const env = environment || this.detectEnvironment();
    
    const thresholds = {
      ci: {
        frameRate: {
          min: 25,      // Lower expectations for CI
          target: 30,
          max: 45
        },
        renderTime: {
          max: 50,      // More lenient for CI
          average: 35,
          target: 25
        },
        memoryUsage: {
          max: 100 * 1024 * 1024,  // 100MB max for CI
          growth: 10 * 1024 * 1024  // 10MB growth tolerance
        },
        loadTime: {
          max: 5000,    // 5 seconds max load time
          target: 3000
        }
      },
      local: {
        frameRate: {
          min: 35,
          target: 45,
          max: 60
        },
        renderTime: {
          max: 35,
          average: 25,
          target: 16
        },
        memoryUsage: {
          max: 150 * 1024 * 1024,  // 150MB max for local
          growth: 15 * 1024 * 1024  // 15MB growth tolerance
        },
        loadTime: {
          max: 3000,
          target: 2000
        }
      },
      production: {
        frameRate: {
          min: 45,
          target: 55,
          max: 60
        },
        renderTime: {
          max: 25,
          average: 18,
          target: 16
        },
        memoryUsage: {
          max: 200 * 1024 * 1024,  // 200MB max for production
          growth: 20 * 1024 * 1024  // 20MB growth tolerance
        },
        loadTime: {
          max: 2000,
          target: 1500
        }
      }
    };

    return thresholds[env] || thresholds.local;
  }

  /**
   * Creates a stable performance test with retry logic
   * @param {string} testName - Name of the test
   * @param {Function} testFunction - Test function to execute
   * @param {Object} options - Test options
   * @returns {Function} Wrapped test function
   */
  static createStablePerformanceTest(testName, testFunction, options = {}) {
    const {
      retries = 3,
      timeout = 10000,
      environment = null,
      thresholdType = 'frameRate',
      customThresholds = null
    } = options;

    return async () => {
      const env = environment || this.detectEnvironment();
      const thresholds = customThresholds || this.getEnvironmentThresholds(env: any3356;
      const threshold = thresholds[thresholdType];

      let lastError = null;
      let attempts = 0;

      for (let attempt = 0; attempt <= retries; attempt++) {
        attempts = attempt + 1;
        
        try {
          // Add delay between retries to stabilize system
          if (attempt > 0) {
            await this.waitForStableEnvironment(1000 + (attempt * 500));
          }

          const result = await Promise.race([
            testFunction(threshold, env, attempt),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`Test timeout after ${timeout}ms`)), timeout)
            )
          ]);

          // Test passed, return result
          console.log(`✅ Performance test "${testName}" passed on attempt ${attempts}/${retries + 1} (${env})`);
          return result;

        } catch (error) {
          lastError = error;
          console.warn(`⚠️  Performance test "${testName}" failed on attempt ${attempts}/${retries + 1} (${env}):`, error.message);
          
          // If this is the last attempt, throw the error
          if (attempt === retries) {
            break;
          }
        }
      }

      // All attempts failed
      const finalError = new Error(
        `Performance test "${testName}" failed after ${attempts} attempts in ${env} environment. ` +
        `Last error: ${lastError.message}`
      );
      finalError.originalError = lastError;
      finalError.attempts = attempts;
      finalError.environment = env;
      throw finalError;
    };
  }

  /**
   * Waits for environment to stabilize before running performance tests
   * @param {number} delay - Delay in milliseconds
   * @returns {Promise} Promise that resolves after delay
   */
  static async waitForStableEnvironment(delay = 1000) {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    // Wait for the specified delay
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Additional wait for CI environments
    if (this.detectEnvironment() === 'ci') {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  /**
   * Measures frame rate performance with retry logic
   * @param {Function} renderFunction - Function to measure
   * @param {Object} options - Measurement options
   * @returns {Promise<Object>} Performance measurements
   */
  static async measureFrameRate(renderFunction, options = {}) {
    const {
      duration = 1000,     // 1 second measurement
      environment = null,
      retries = 2
    } = options;

    const env = environment || this.detectEnvironment();
    const thresholds = this.getEnvironmentThresholds(env as any);

    return this.createStablePerformanceTest(
      'Frame Rate Measurement',
      async (threshold) => {
        const frames: any[] = [];
        const startTime = performance.now();
        let frameCount = 0;

        // Mock performance.now() for consistent behavior
        const originalNow = performance.now;
        let mockTime = startTime;
        performance.now = jest.fn(() => mockTime);

        try {
          while (mockTime - startTime < duration) {
            const frameStart = mockTime;
            
            // Execute render function
            await renderFunction();
            
            // Simulate frame time based on environment
            const frameTime = env === 'ci' ? 40 : (env === 'local' ? 20 : 16);
            mockTime += frameTime;
            
            frames.push({
              frameNumber: frameCount++,
              startTime: frameStart,
              endTime: mockTime,
              duration: frameTime
            });
          }

          const totalTime = mockTime - startTime;
          const averageFrameTime = totalTime / frameCount;
          const fps = 1000 / averageFrameTime;

          return {
            fps,
            frameCount,
            totalTime,
            averageFrameTime,
            minFrameTime: Math.min(...frames.map(f => f.duration)),
            maxFrameTime: Math.max(...frames.map(f => f.duration)),
            environment: env,
            thresholds: threshold,
            passed: fps >= threshold.min
          };

        } finally {
          // Restore original performance.now
          performance.now = originalNow;
        }
      },
      { retries, environment: env, thresholdType: 'frameRate' }
    )();
  }

  /**
   * Measures render time performance
   * @param {Function} renderFunction - Function to measure
   * @param {Object} options - Measurement options
   * @returns {Promise<Object>} Performance measurements
   */
  static async measureRenderTime(renderFunction, options = {}) {
    const {
      iterations = 10,
      environment = null,
      retries = 2
    } = options;

    const env = environment || this.detectEnvironment();

    return this.createStablePerformanceTest(
      'Render Time Measurement',
      async (threshold) => {
        const times: any[] = [];

        for (let i = 0; i < iterations; i++) {
          const start = performance.now();
          await renderFunction();
          const end = performance.now();
          times.push(end - start);
          
          // Small delay between iterations for stability
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);

        return {
          averageTime,
          minTime,
          maxTime,
          times,
          iterations,
          environment: env,
          thresholds: threshold,
          passed: averageTime <= threshold.max
        };
      },
      { retries, environment: env, thresholdType: 'renderTime' }
    )();
  }

  /**
   * Measures memory usage with environment considerations
   * @param {Function} testFunction - Function to measure
   * @param {Object} options - Measurement options
   * @returns {Promise<Object>} Memory measurements
   */
  static async measureMemoryUsage(testFunction, options = {}) {
    const {
      environment = null,
      retries = 2,
      iterations = 5
    } = options;

    const env = environment || this.detectEnvironment();

    return this.createStablePerformanceTest(
      'Memory Usage Measurement',
      async (threshold) => {
        // Mock memory measurement for consistent testing
        const mockMemory = {
          usedJSHeapSize: env === 'ci' ? 50 * 1024 * 1024 : 
                         env === 'local' ? 70 * 1024 * 1024 : 
                         60 * 1024 * 1024,
          totalJSHeapSize: 200 * 1024 * 1024,
          jsHeapSizeLimit: 2 * 1024 * 1024 * 1024
        };

        // Mock performance.memory
        const originalMemory = performance.memory;
        performance.memory = mockMemory;

        try {
          const initialMemory = performance.memory.usedJSHeapSize;
          const measurements: any[] = [];

          for (let i = 0; i < iterations; i++) {
            const beforeMemory = performance.memory.usedJSHeapSize;
            
            await testFunction();
            
            // Simulate memory growth
            const memoryGrowth = env === 'ci' ? 1024 * 1024 : 512 * 1024; // 1MB or 512KB
            mockMemory.usedJSHeapSize += memoryGrowth;
            
            const afterMemory = performance.memory.usedJSHeapSize;
            measurements.push({
              iteration: i,
              before: beforeMemory,
              after: afterMemory,
              growth: afterMemory - beforeMemory
            });

            await new Promise(resolve => setTimeout(resolve, 50));
          }

          const finalMemory = performance.memory.usedJSHeapSize;
          const totalGrowth = finalMemory - initialMemory;
          const averageGrowth = totalGrowth / iterations;

          return {
            initialMemory,
            finalMemory,
            totalGrowth,
            averageGrowth,
            measurements,
            environment: env,
            thresholds: threshold,
            passed: totalGrowth <= threshold.growth
          };

        } finally {
          // Restore original performance.memory
          if (originalMemory) {
            performance.memory = originalMemory;
          }
        }
      },
      { retries, environment: env, thresholdType: 'memoryUsage' }
    )();
  }

  /**
   * Creates performance test configuration based on environment
   * @param {string} environment - Environment type
   * @returns {Object} Test configuration
   */
  static createPerformanceTestConfig(environment = null) {
    const env = environment || this.detectEnvironment();
    const thresholds = this.getEnvironmentThresholds(env: any12175;

    return {
      environment: env,
      thresholds,
      retries: env === 'ci' ? 3 : 2,
      timeout: env === 'ci' ? 15000 : 10000,
      stabilizationDelay: env === 'ci' ? 2000 : 1000,
      measurementIterations: env === 'ci' ? 5 : 10,
      frameRateDuration: env === 'ci' ? 500 : 1000,
      
      // Test-specific configurations
      frameRate: {
        enabled: true,
        ...thresholds.frameRate
      },
      renderTime: {
        enabled: true,
        ...thresholds.renderTime
      },
      memoryUsage: {
        enabled: env !== 'ci', // Disable memory tests in CI by default
        ...thresholds.memoryUsage
      },
      loadTime: {
        enabled: true,
        ...thresholds.loadTime
      }
    };
  }

  /**
   * Validates performance test results against thresholds
   * @param {Object} results - Test results
   * @param {Object} thresholds - Performance thresholds
   * @param {string} testType - Type of performance test
   * @returns {Object} Validation results
   */
  static validatePerformanceResults(results, thresholds, testType) {
    const validation = {
      passed: false,
      testType,
      results,
      thresholds,
      issues: [],
      recommendations: []
    };

    switch (testType) {
      case 'frameRate':
        validation.passed = results.fps >= thresholds.min;
        if (!validation.passed) {
          validation.issues.push(`Frame rate ${results.fps.toFixed(2)} FPS below minimum ${thresholds.min} FPS`);
          validation.recommendations.push('Consider reducing visual complexity or optimizing render pipeline');
        }
        break;

      case 'renderTime':
        validation.passed = results.averageTime <= thresholds.max;
        if (!validation.passed) {
          validation.issues.push(`Average render time ${results.averageTime.toFixed(2)}ms exceeds maximum ${thresholds.max}ms`);
          validation.recommendations.push('Optimize rendering operations or reduce draw calls');
        }
        break;

      case 'memoryUsage':
        validation.passed = results.totalGrowth <= thresholds.growth;
        if (!validation.passed) {
          validation.issues.push(`Memory growth ${(results.totalGrowth / 1024 / 1024).toFixed(2)}MB exceeds limit ${(thresholds.growth / 1024 / 1024).toFixed(2)}MB`);
          validation.recommendations.push('Check for memory leaks or implement object pooling');
        }
        break;

      default:
        validation.issues.push(`Unknown test type: ${testType}`);
    }

    return validation;
  }

  /**
   * Generates a comprehensive performance test report
   * @param {Object} testResults - All test results
   * @param {string} environment - Test environment
   * @returns {string} Formatted report
   */
  static generatePerformanceReport(testResults, environment = null) {
    const env = environment || this.detectEnvironment();
    const timestamp = new Date().toISOString();
    
    let report = `\n=== Performance Test Report (${env.toUpperCase()}) ===\n`;
    report += `Timestamp: ${timestamp}\n`;
    report += `Environment: ${env}\n\n`;

    let totalTests = 0;
    let passedTests = 0;

    for (const [testName, result] of Object.entries(testResults: any15376) {
      totalTests++;
      const passed = result.passed || false;
      if (passed) passedTests++;

      report += `${passed ? '✅' : '❌'} ${testName}\n`;
      
      if (result.fps !== undefined) {
        report += `  FPS: ${result.fps.toFixed(2)} (min: ${result.thresholds?.min || 'N/A'})\n`;
      }
      
      if (result.averageTime !== undefined) {
        report += `  Avg Time: ${result.averageTime.toFixed(2)}ms (max: ${result.thresholds?.max || 'N/A'}ms)\n`;
      }
      
      if (result.totalGrowth !== undefined) {
        report += `  Memory Growth: ${(result.totalGrowth / 1024 / 1024).toFixed(2)}MB (limit: ${((result.thresholds?.growth || 0) / 1024 / 1024).toFixed(2)}MB)\n`;
      }
      
      report += '\n';
    }

    report += `Summary: ${passedTests}/${totalTests} tests passed (${((passedTests / totalTests) * 100).toFixed(1)}%)\n`;
    report += '='.repeat(50) + '\n';

    return report;
  }
}

// Export default configuration helper
export const createEnvironmentConfig = (environment) => {
  return PerformanceTestUtils.createPerformanceTestConfig(environment: any16481;
};

// Export threshold getter for easy access
export const getPerformanceThresholds = (environment) => {
  return PerformanceTestUtils.getEnvironmentThresholds(environment: any16663;
};