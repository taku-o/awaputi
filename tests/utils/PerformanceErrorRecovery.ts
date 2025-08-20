/**
 * Performance Error Recovery - Handles performance test failures and provides analysis/recovery
 * Provides error recovery utilities for performance-related test issues with intelligent analysis
 */

import { jest } from '@jest/globals';
import { crossEnvironmentManager } from './CrossEnvironmentManager';

export class PerformanceErrorRecovery {
  constructor() {
    this.errorLog = [];
    this.performanceStrategies = new Map();
    this.failurePatterns = new Map();
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2
    };
    this.analysisResults = new Map();
    
    this.initializePerformanceStrategies();
    this.initializeFailurePatterns();
  }

  /**
   * Initialize performance error recovery strategies
   */
  initializePerformanceStrategies() {
    // Frame rate test failures
    this.performanceStrategies.set('frame_rate_failure', {
      detect: (error) => error.message?.includes('frame rate') ||
                        error.message?.includes('fps') ||
                        error.message?.includes('FPS'),
      analyze: (error, context) => this.analyzeFrameRateFailure(error, context),
      recover: (analysis) => this.recoverFromFrameRateFailure(analysis: any1246,
      description: 'Frame rate performance test failures'
    });

    // Memory usage test failures
    this.performanceStrategies.set('memory_usage_failure', {
      detect: (error) => error.message?.includes('memory') ||
                        error.message?.includes('heap') ||
                        error.message?.includes('Memory'),
      analyze: (error, context) => this.analyzeMemoryUsageFailure(error, context),
      recover: (analysis) => this.recoverFromMemoryUsageFailure(analysis: any1753,
      description: 'Memory usage performance test failures'
    });

    // Render time test failures
    this.performanceStrategies.set('render_time_failure', {
      detect: (error) => error.message?.includes('render time') ||
                        error.message?.includes('rendering') ||
                        error.message?.includes('draw'),
      analyze: (error, context) => this.analyzeRenderTimeFailure(error, context),
      recover: (analysis) => this.recoverFromRenderTimeFailure(analysis: any2266,
      description: 'Render time performance test failures'
    });

    // Performance threshold failures
    this.performanceStrategies.set('threshold_failure', {
      detect: (error) => error.message?.includes('threshold') ||
                        error.message?.includes('expected') ||
                        error.message?.includes('exceed'),
      analyze: (error, context) => this.analyzeThresholdFailure(error, context),
      recover: (analysis) => this.recoverFromThresholdFailure(analysis: any2778,
      description: 'Performance threshold exceeded failures'
    });

    // Timeout and async test failures
    this.performanceStrategies.set('timeout_failure', {
      detect: (error) => error.message?.includes('timeout') ||
                        error.message?.includes('Timeout') ||
                        error.message?.includes('async'),
      analyze: (error, context) => this.analyzeTimeoutFailure(error, context),
      recover: (analysis) => this.recoverFromTimeoutFailure(analysis: any3283,
      description: 'Performance test timeout failures'
    });

    // Environment-specific performance failures
    this.performanceStrategies.set('environment_failure', {
      detect: (error) => error.message?.includes('environment') ||
                        error.message?.includes('CI') ||
                        error.message?.includes('node'),
      analyze: (error, context) => this.analyzeEnvironmentFailure(error, context),
      recover: (analysis) => this.recoverFromEnvironmentFailure(analysis: any3802,
      description: 'Environment-specific performance failures'
    });
  }

  /**
   * Initialize failure pattern detection
   */
  initializeFailurePatterns() {
    this.failurePatterns.set('consistent_failure', {
      detect: (history) => history.length >= 3 && 
                          history.slice(-3).every(result => !result.success),
      description: 'Consistent failure across multiple attempts',
      severity: 'high'
    });

    this.failurePatterns.set('intermittent_failure', {
      detect: (history) => history.length >= 5 && 
                          history.filter(result => !result.success).length >= 2 &&
                          history.filter(result => result.success).length >= 1,
      description: 'Intermittent failures with some successes',
      severity: 'medium'
    });

    this.failurePatterns.set('environment_degradation', {
      detect: (history) => {
        if (history.length < 5) return false;
        const recent = history.slice(-5);
        const older = history.slice(-10, -5);
        const recentSuccessRate = recent.filter(r => r.success).length / recent.length;
        const olderSuccessRate = older.filter(r => r.success).length / older.length;
        return recentSuccessRate < olderSuccessRate - 0.3;
      },
      description: 'Performance degradation over time',
      severity: 'high'
    });

    this.failurePatterns.set('threshold_sensitivity', {
      detect: (history) => history.length >= 3 && 
                          history.filter(result => 
                            result.error?.includes('threshold') || 
                            result.error?.includes('expected')
                          ).length >= 2,
      description: 'Repeated threshold sensitivity issues',
      severity: 'medium'
    });
  }

  /**
   * Analyze frame rate test failures
   * @param {Error} error - The error object
   * @param {Object} context - Test context
   * @returns {Object} Analysis result
   */
  analyzeFrameRateFailure(error, context = {}) {
    const analysis = {
      type: 'frame_rate_failure',
      severity: 'medium',
      causes: [],
      recommendations: [],
      environmentFactors: []
    };

    // Extract frame rate values from error message
    const frameRateMatch = error.message.match(/(\d+\.?\d*)\s*fps/i);
    const expectedMatch = error.message.match(/expected.*?(\d+\.?\d*)/i);
    const actualFrameRate = frameRateMatch ? parseFloat(frameRateMatch[1]) : null;
    const expectedFrameRate = expectedMatch ? parseFloat(expectedMatch[1]) : null;

    if (actualFrameRate && expectedFrameRate) {
      const performance = actualFrameRate / expectedFrameRate;
      
      if (performance < 0.5) {
        analysis.severity = 'high';
        analysis.causes.push('Severe performance degradation (< 50% of expected)');
        analysis.recommendations.push('Check for resource-intensive operations');
        analysis.recommendations.push('Consider reducing test complexity');
      } else if (performance < 0.8) {
        analysis.severity = 'medium';
        analysis.causes.push('Moderate performance degradation (< 80% of expected)');
        analysis.recommendations.push('Review rendering optimizations');
      }
    }

    // Environment analysis
    const environment = crossEnvironmentManager.getEnvironmentConfig();
    if (environment.type === 'node') {
      analysis.environmentFactors.push('Node.js environment may have different performance characteristics');
      analysis.recommendations.push('Consider using browser-specific thresholds');
    }

    if (process.env.CI) {
      analysis.environmentFactors.push('CI environment may have limited resources');
      analysis.recommendations.push('Use CI-specific performance thresholds');
    }

    // Check system load indicators
    if (context.systemLoad && context.systemLoad > 0.8) {
      analysis.causes.push('High system load detected');
      analysis.recommendations.push('Retry test when system load is lower');
    }

    return analysis;
  }

  /**
   * Analyze memory usage test failures
   * @param {Error} error - The error object
   * @param {Object} context - Test context
   * @returns {Object} Analysis result
   */
  analyzeMemoryUsageFailure(error, context = {}) {
    const analysis = {
      type: 'memory_usage_failure',
      severity: 'medium',
      causes: [],
      recommendations: [],
      environmentFactors: []
    };

    // Extract memory values from error message
    const memoryMatch = error.message.match(/(\d+\.?\d*)\s*(MB|KB|bytes)/i);
    const actualMemory = memoryMatch ? parseFloat(memoryMatch[1]) : null;
    const unit = memoryMatch ? memoryMatch[2].toLowerCase() : null;

    if (actualMemory) {
      // Convert to MB for analysis
      let memoryMB = actualMemory;
      if (unit === 'kb') memoryMB = actualMemory / 1024;
      if (unit === 'bytes') memoryMB = actualMemory / (1024 * 1024);

      if (memoryMB > 100) {
        analysis.severity = 'high';
        analysis.causes.push('Excessive memory usage detected');
        analysis.recommendations.push('Check for memory leaks');
        analysis.recommendations.push('Review object pooling strategies');
      } else if (memoryMB > 50) {
        analysis.severity = 'medium';
        analysis.causes.push('High memory usage detected');
        analysis.recommendations.push('Consider memory optimization');
      }
    }

    // Check for memory leak patterns
    if (error.message.includes('leak') || error.message.includes('growth')) {
      analysis.severity = 'high';
      analysis.causes.push('Memory leak pattern detected');
      analysis.recommendations.push('Implement proper cleanup in tests');
      analysis.recommendations.push('Use memory profiling tools');
    }

    // Environment-specific analysis
    if (process.platform === 'darwin') {
      analysis.environmentFactors.push('macOS environment may have different memory behavior');
    }

    return analysis;
  }

  /**
   * Analyze render time test failures
   * @param {Error} error - The error object
   * @param {Object} context - Test context
   * @returns {Object} Analysis result
   */
  analyzeRenderTimeFailure(error, context = {}) {
    const analysis = {
      type: 'render_time_failure',
      severity: 'medium',
      causes: [],
      recommendations: [],
      environmentFactors: []
    };

    // Extract timing values
    const timeMatch = error.message.match(/(\d+\.?\d*)\s*(ms|milliseconds)/i);
    const actualTime = timeMatch ? parseFloat(timeMatch[1]) : null;

    if (actualTime) {
      if (actualTime > 100) {
        analysis.severity = 'high';
        analysis.causes.push('Very slow rendering detected (> 100ms)');
        analysis.recommendations.push('Profile rendering bottlenecks');
        analysis.recommendations.push('Consider render optimization');
      } else if (actualTime > 50) {
        analysis.severity = 'medium';
        analysis.causes.push('Slow rendering detected (> 50ms)');
        analysis.recommendations.push('Review rendering pipeline');
      }
    }

    // Check for specific rendering issues
    if (error.message.includes('canvas') || error.message.includes('draw')) {
      analysis.causes.push('Canvas rendering performance issue');
      analysis.recommendations.push('Optimize canvas drawing operations');
      analysis.recommendations.push('Use requestAnimationFrame properly');
    }

    return analysis;
  }

  /**
   * Analyze threshold failure patterns
   * @param {Error} error - The error object
   * @param {Object} context - Test context
   * @returns {Object} Analysis result
   */
  analyzeThresholdFailure(error, context = {}) {
    const analysis = {
      type: 'threshold_failure',
      severity: 'low',
      causes: [],
      recommendations: [],
      environmentFactors: []
    };

    // Check if threshold is too strict
    if (error.message.includes('expected') && error.message.includes('received')) {
      analysis.causes.push('Performance threshold may be too strict for current environment');
      analysis.recommendations.push('Consider environment-specific thresholds');
      analysis.recommendations.push('Use statistical validation instead of hard thresholds');
    }

    // Environment-specific threshold adjustments
    const environment = crossEnvironmentManager.getEnvironmentConfig();
    if (environment.type === 'node') {
      analysis.environmentFactors.push('Node.js environment may need different thresholds');
      analysis.recommendations.push('Apply Node.js-specific threshold adjustments');
    }

    if (process.env.CI) {
      analysis.environmentFactors.push('CI environment may need relaxed thresholds');
      analysis.recommendations.push('Use CI-specific threshold configuration');
    }

    return analysis;
  }

  /**
   * Analyze timeout failure patterns
   * @param {Error} error - The error object
   * @param {Object} context - Test context
   * @returns {Object} Analysis result
   */
  analyzeTimeoutFailure(error, context = {}) {
    const analysis = {
      type: 'timeout_failure',
      severity: 'medium',
      causes: [],
      recommendations: [],
      environmentFactors: []
    };

    // Extract timeout value
    const timeoutMatch = error.message.match(/(\d+)\s*(ms|milliseconds|seconds)/i);
    const timeoutValue = timeoutMatch ? parseFloat(timeoutMatch[1]) : null;
    const unit = timeoutMatch ? timeoutMatch[2] : null;

    if (timeoutValue) {
      let timeoutMs = timeoutValue;
      if (unit && unit.includes('second')) {
        timeoutMs = timeoutValue * 1000;
      }

      if (timeoutMs < 5000) {
        analysis.causes.push('Timeout may be too short for performance tests');
        analysis.recommendations.push('Increase timeout for performance tests');
      }
    }

    // Check for async operation issues
    if (error.message.includes('async') || error.message.includes('Promise')) {
      analysis.causes.push('Async operation timeout in performance test');
      analysis.recommendations.push('Review async operation timing');
      analysis.recommendations.push('Add proper await/Promise handling');
    }

    return analysis;
  }

  /**
   * Analyze environment-specific failures
   * @param {Error} error - The error object
   * @param {Object} context - Test context
   * @returns {Object} Analysis result
   */
  analyzeEnvironmentFailure(error, context = {}) {
    const analysis = {
      type: 'environment_failure',
      severity: 'medium',
      causes: [],
      recommendations: [],
      environmentFactors: []
    };

    const environment = crossEnvironmentManager.getEnvironmentConfig();
    
    // Environment-specific analysis
    if (environment.type === 'node') {
      analysis.environmentFactors.push('Node.js environment limitations');
      analysis.recommendations.push('Use Node.js-appropriate performance testing');
      analysis.recommendations.push('Consider browser environment for UI performance tests');
    }

    if (process.env.CI) {
      analysis.environmentFactors.push('CI environment resource constraints');
      analysis.recommendations.push('Use CI-optimized performance thresholds');
      analysis.recommendations.push('Consider retry strategies for CI');
    }

    // Platform-specific considerations
    if (process.platform === 'darwin') {
      analysis.environmentFactors.push('macOS-specific performance characteristics');
    } else if (process.platform === 'linux') {
      analysis.environmentFactors.push('Linux-specific performance characteristics');
    }

    return analysis;
  }

  /**
   * Recovery strategy implementations
   */
  recoverFromFrameRateFailure(analysis: any15465 {
    return {
      success: true,
      message: 'Frame rate failure recovery applied',
      adjustments: {
        thresholdReduction: analysis.severity === 'high' ? 0.3 : 0.1,
        retryWithBackoff: true,
        environmentSpecificThresholds: true
      },
      guidance: analysis.recommendations
    };
  }

  recoverFromMemoryUsageFailure(analysis: any15833 {
    return {
      success: true,
      message: 'Memory usage failure recovery applied',
      adjustments: {
        memoryThresholdIncrease: analysis.severity === 'high' ? 0.5 : 0.2,
        enableGarbageCollection: true,
        memoryMonitoring: true
      },
      guidance: analysis.recommendations
    };
  }

  recoverFromRenderTimeFailure(analysis: any16201 {
    return {
      success: true,
      message: 'Render time failure recovery applied',
      adjustments: {
        timeoutIncrease: analysis.severity === 'high' ? 2.0 : 1.5,
        renderOptimization: true,
        frameSkipping: analysis.severity === 'high'
      },
      guidance: analysis.recommendations
    };
  }

  recoverFromThresholdFailure(analysis: any16575 {
    return {
      success: true,
      message: 'Threshold failure recovery applied',
      adjustments: {
        dynamicThresholds: true,
        statisticalValidation: true,
        environmentAdjustment: true
      },
      guidance: analysis.recommendations
    };
  }

  recoverFromTimeoutFailure(analysis: any16898 {
    return {
      success: true,
      message: 'Timeout failure recovery applied',
      adjustments: {
        timeoutExtension: 2.0,
        asyncOptimization: true,
        sequentialExecution: true
      },
      guidance: analysis.recommendations
    };
  }

  recoverFromEnvironmentFailure(analysis: any17215 {
    return {
      success: true,
      message: 'Environment failure recovery applied',
      adjustments: {
        environmentSpecificConfig: true,
        adaptiveThresholds: true,
        resourceMonitoring: true
      },
      guidance: analysis.recommendations
    };
  }

  /**
   * Handle performance test failure with analysis and recovery
   * @param {Error} error - The error object
   * @param {Object} context - Test context
   * @returns {Object} Recovery result
   */
  handlePerformanceTestFailure(error, context = {}) {
    console.log('PerformanceErrorRecovery: Handling performance test failure...', error.message);

    // Log the error
    const errorEntry = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      context: context,
      recoveryAttempted: false
    };
    this.errorLog.push(errorEntry: any18099;

    // Find appropriate strategy
    for (const [strategyName, strategy] of this.performanceStrategies) {
      if (strategy.detect(error: any18252) {
        console.log(`PerformanceErrorRecovery: Using strategy "${strategyName}"`);
        
        const analysis = strategy.analyze(error, context);
        const recovery = strategy.recover(analysis: any18462;
        
        // Update error log
        errorEntry.recoveryAttempted = true;
        errorEntry.recoveryStrategy = strategyName;
        errorEntry.analysis = analysis;
        errorEntry.recoveryResult = recovery;
        
        // Store analysis
        this.analysisResults.set(strategyName, analysis);
        
        return {
          strategy: strategyName,
          description: strategy.description,
          analysis: analysis,
          recovery: recovery
        };
      }
    }

    // No specific strategy found
    const generalRecovery = {
      success: false,
      message: 'No specific recovery strategy available',
      guidance: [
        'Review performance test configuration',
        'Check environment-specific settings',
        'Consider test complexity reduction',
        'Verify system resources'
      ]
    };

    errorEntry.recoveryAttempted = true;
    errorEntry.recoveryStrategy = 'general';
    errorEntry.recoveryResult = generalRecovery;

    return {
      strategy: 'general',
      description: 'General performance failure guidance',
      analysis: { type: 'unknown', severity: 'medium', causes: [], recommendations: [] },
      recovery: generalRecovery
    };
  }

  /**
   * Retry performance test with backoff strategy
   * @param {Function} testFunction - Test function to retry
   * @param {Object} options - Retry options
   * @returns {Promise<Object>} Retry result
   */
  async retryPerformanceTest(testFunction, options = {}) {
    const config = { ...this.retryConfig, ...options };
    const results: any[] = [];
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        console.log(`PerformanceErrorRecovery: Attempt ${attempt + 1}/${config.maxRetries + 1}`);
        
        const startTime = Date.now();
        const result = await testFunction();
        const endTime = Date.now();
        
        const success = {
          success: true,
          attempt: attempt + 1,
          result: result,
          duration: endTime - startTime,
          timestamp: new Date().toISOString()
        };
        
        results.push(success as any);
        console.log(`PerformanceErrorRecovery: Test succeeded on attempt ${attempt + 1}`);
        return success;
        
      } catch (error) {
        const failure = {
          success: false,
          attempt: attempt + 1,
          error: error.message,
          timestamp: new Date().toISOString()
        };
        
        results.push(failure as any);
        
        if (attempt < config.maxRetries) {
          const delay = Math.min(
            config.baseDelay * Math.pow(config.backoffFactor, attempt),
            config.maxDelay
          );
          
          console.log(`PerformanceErrorRecovery: Attempt ${attempt + 1} failed, retrying in ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.log(`PerformanceErrorRecovery: All attempts failed`);
        }
      }
    }

    return {
      success: false,
      attempts: results.length,
      results: results,
      message: 'All retry attempts failed'
    };
  }

  /**
   * Detect failure patterns from error history
   * @param {Array} errorHistory - History of error results
   * @returns {Array} Detected patterns
   */
  detectFailurePatterns(errorHistory = this.errorLog) {
    const detectedPatterns: any[] = [];
    
    for (const [patternName, pattern] of this.failurePatterns) {
      if (pattern.detect(errorHistory: any22003) {
        detectedPatterns.push({
          name: patternName,
          description: pattern.description,
          severity: pattern.severity,
          occurrences: errorHistory.length
        });
      }
    }
    
    return detectedPatterns;
  }

  /**
   * Get comprehensive error report with analysis
   * @returns {Object} Error report
   */
  getErrorReport() {
    const patterns = this.detectFailurePatterns();
    
    return {
      timestamp: new Date().toISOString(),
      totalErrors: this.errorLog.length,
      recoveryAttempts: this.errorLog.filter(log => log.recoveryAttempted).length,
      successfulRecoveries: this.errorLog.filter(log => 
        log.recoveryAttempted && log.recoveryResult?.success
      ).length,
      errors: this.errorLog,
      detectedPatterns: patterns,
      analysisResults: Object.fromEntries(this.analysisResults),
      availableStrategies: Array.from(this.performanceStrategies.keys()),
      recommendations: this.generateRecommendations(patterns: any23021
    };
  }

  /**
   * Generate recommendations based on error patterns and analysis
   * @param {Array} patterns - Detected failure patterns
   * @returns {Array<string>} Recommendations
   */
  generateRecommendations(patterns = []) {
    const recommendations: any[] = [];
    
    // Pattern-based recommendations
    for (const pattern of patterns) {
      switch (pattern.name) {
        case 'consistent_failure':
          recommendations.push('Consider adjusting performance thresholds permanently');
          recommendations.push('Review test environment configuration');
          break;
        case 'intermittent_failure':
          recommendations.push('Implement retry strategies for flaky performance tests');
          recommendations.push('Use statistical validation instead of hard thresholds');
          break;
        case 'environment_degradation':
          recommendations.push('Monitor system resources during test execution');
          recommendations.push('Consider test isolation improvements');
          break;
        case 'threshold_sensitivity':
          recommendations.push('Use environment-adaptive thresholds');
          recommendations.push('Implement coefficient of variation validation');
          break;
      }
    }

    // General recommendations based on error types
    const frameRateErrors = this.errorLog.filter(log => log.analysis?.type === 'frame_rate_failure').length;
    const memoryErrors = this.errorLog.filter(log => log.analysis?.type === 'memory_usage_failure').length;
    const renderErrors = this.errorLog.filter(log => log.analysis?.type === 'render_time_failure').length;

    if (frameRateErrors > 0) {
      recommendations.push('Consider frame rate optimization strategies');
      recommendations.push('Use environment-specific FPS thresholds');
    }

    if (memoryErrors > 0) {
      recommendations.push('Implement memory usage monitoring');
      recommendations.push('Review object pooling and garbage collection');
    }

    if (renderErrors > 0) {
      recommendations.push('Profile rendering pipeline performance');
      recommendations.push('Consider render optimization techniques');
    }

    if (this.errorLog.length === 0) {
      recommendations.push('No performance errors detected - test stability is good');
    }

    return recommendations;
  }

  /**
   * Reset error recovery state
   */
  reset() {
    this.errorLog = [];
    this.analysisResults.clear();
    console.log('PerformanceErrorRecovery: State reset completed');
  }
}

// Export singleton instance
export const performanceErrorRecovery = new PerformanceErrorRecovery();

// Export helper functions
export const handlePerformanceTestFailure = (error, context) => 
  performanceErrorRecovery.handlePerformanceTestFailure(error, context);
export const retryPerformanceTest = (testFunction, options) => 
  performanceErrorRecovery.retryPerformanceTest(testFunction, options);
export const getPerformanceErrorReport = () => performanceErrorRecovery.getErrorReport();