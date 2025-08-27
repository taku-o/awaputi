/**
 * Performance Retry Handler - Advanced retry logic for performance tests
 * Implements statistical validation, trend monitoring, and detailed error reporting
 */

import { jest } from '@jest/globals';
import { getPerformanceThresholds, validatePerformanceResult } from '../config/performance-thresholds.js';

export class PerformanceRetryHandler {
  constructor(options = {}) {
    this.options = {
      maxRetries: 3,
      statisticalSamples: 5,
      confidenceLevel: 0.95,
      trendAnalysisWindow: 10,
      backoffStrategy: 'exponential', // 'linear', 'exponential', 'fixed'
      baseDelay: 1000,
      maxDelay: 10000,
      enableTrendMonitoring: true,
      enableStatisticalValidation: true,
      enableDetailedReporting: true,
      ...options
    };
    
    this.testHistory = new Map();
    this.performanceMetrics = new Map();
    this.failurePatterns = new Map();
  }

  /**
   * Executes a performance test with advanced retry logic
   * @param {string} testName - Name of the test
   * @param {Function} testFunction - Test function to execute
   * @param {Object} options - Test-specific options
   * @returns {Promise<Object>} Test results with retry information
   */
  async executeWithRetry(testName, testFunction, options = {}) {
    const testOptions = { ...this.options, ...options };
    const testId = this.generateTestId(testName);
    
    const executionContext = {
      testId,
      testName,
      startTime: Date.now(),
      attempts: [],
      environment: process.env.NODE_ENV || 'test',
      retryStrategy: testOptions.backoffStrategy,
      maxRetries: testOptions.maxRetries
    };

    try {
      // Initialize test history
      if (!this.testHistory.has(testName)) {
        this.testHistory.set(testName, []);
      }

      const result = await this.performRetriesWithAnalysis(
        testFunction, 
        executionContext, 
        testOptions
      );

      // Store successful result
      this.recordTestExecution(testName, executionContext, result, true);
      
      return {
        success: true,
        result,
        executionContext,
        retryInfo: this.buildRetryInfo(executionContext),
        statisticalAnalysis: this.performStatisticalAnalysis(testName, result),
        trendAnalysis: testOptions.enableTrendMonitoring ? 
          this.performTrendAnalysis(testName) : null
      };

    } catch (error) {
      // Store failed result
      this.recordTestExecution(testName, executionContext, error, false);
      
      const enhancedError = this.enhanceErrorWithRetryInfo(
        error, 
        executionContext, 
        testOptions
      );
      
      throw enhancedError;
    }
  }

  /**
   * Performs retries with statistical analysis and trend monitoring
   */
  async performRetriesWithAnalysis(testFunction, executionContext, options) {
    let lastError = null;
    let results = [];

    for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
      const attemptInfo = {
        attemptNumber: attempt + 1,
        startTime: Date.now(),
        environment: executionContext.environment
      };

      try {
        // Apply backoff delay for retries
        if (attempt > 0) {
          const delay = this.calculateBackoffDelay(attempt, options);
          await this.waitWithStabilization(delay);
          
          // Environmental stabilization for consistent results
          await this.stabilizeTestEnvironment();
        }

        // Execute the test function
        const result = await this.executeTestWithTimeout(
          testFunction, 
          options.timeout || 10000
        );

        attemptInfo.endTime = Date.now();
        attemptInfo.duration = attemptInfo.endTime - attemptInfo.startTime;
        attemptInfo.result = result;
        attemptInfo.success = true;

        executionContext.attempts.push(attemptInfo);
        results.push(result);

        // Statistical validation for consistent results
        if (options.enableStatisticalValidation && attempt >= options.statisticalSamples - 1) {
          const validationResult = await this.validateStatisticalConsistency(
            results, 
            options
          );
          
          if (validationResult.isConsistent) {
            // Results are statistically consistent, return success
            return this.aggregateResults(results, validationResult);
          } else if (attempt < options.maxRetries) {
            // Results inconsistent, continue retrying
            console.warn(`Statistical inconsistency detected in ${executionContext.testName}, continuing retries...`);
            continue;
          }
        }

        // If we reach here and have multiple results, aggregate them
        if (results.length > 1) {
          return this.aggregateResults(results);
        }

        return result;

      } catch (error) {
        attemptInfo.endTime = Date.now();
        attemptInfo.duration = attemptInfo.endTime - attemptInfo.startTime;
        attemptInfo.error = error;
        attemptInfo.success = false;

        executionContext.attempts.push(attemptInfo);
        lastError = error;

        // Analyze failure pattern
        this.analyzeFailurePattern(executionContext.testName, error, attempt);

        // Log retry attempt
        console.warn(
          `Performance test "${executionContext.testName}" failed on attempt ${attempt + 1}/${options.maxRetries + 1}: ${error.message}`
        );
      }
    }

    // All retries exhausted
    const aggregatedError = this.createAggregatedError(
      executionContext, 
      lastError, 
      results
    );
    throw aggregatedError;
  }

  /**
   * Validates statistical consistency of test results
   */
  async validateStatisticalConsistency(results, options) {
    if (results.length < 2) {
      return { isConsistent: true, analysis: 'Insufficient data for statistical analysis' };
    }

    const metrics = this.extractMetricsFromResults(results);
    const statisticalTests = {};

    // Coefficient of Variation test for each metric
    for (const [metricName, values] of Object.entries(metrics)) {
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const standardDeviation = Math.sqrt(variance);
      const coefficientOfVariation = standardDeviation / mean;

      statisticalTests[metricName] = {
        mean,
        standardDeviation,
        coefficientOfVariation,
        isConsistent: coefficientOfVariation < 0.2, // 20% threshold
        values
      };
    }

    const overallConsistency = Object.values(statisticalTests).every(test => test.isConsistent);

    return {
      isConsistent: overallConsistency,
      confidence: options.confidenceLevel,
      tests: statisticalTests,
      sampleSize: results.length,
      analysis: this.generateStatisticalAnalysisReport(statisticalTests)
    };
  }

  /**
   * Extracts numeric metrics from test results for statistical analysis
   */
  extractMetricsFromResults(results) {
    const metrics = {};
    
    results.forEach((result, index) => {
      // Extract common performance metrics
      const extractableMetrics = {
        fps: result.fps,
        averageTime: result.averageTime,
        minTime: result.minTime,
        maxTime: result.maxTime,
        totalTime: result.totalTime,
        memoryUsage: result.finalMemory || result.totalGrowth,
        frameCount: result.frameCount
      };

      for (const [key, value] of Object.entries(extractableMetrics)) {
        if (typeof value === 'number' && !isNaN(value)) {
          if (!metrics[key]) metrics[key] = [];
          metrics[key].push(value);
        }
      }
    });

    return metrics;
  }

  /**
   * Aggregates multiple test results into a single comprehensive result
   */
  aggregateResults(results, statisticalValidation = null) {
    if (results.length === 1) {
      return { ...results[0], aggregated: false };
    }

    const metrics = this.extractMetricsFromResults(results);
    const aggregated = {
      aggregated: true,
      sampleSize: results.length,
      rawResults: results
    };

    // Calculate aggregated metrics
    for (const [metricName, values] of Object.entries(metrics)) {
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const median = this.calculateMedian(values);

      aggregated[metricName] = mean;
      aggregated[`${metricName}Stats`] = {
        mean,
        min,
        max,
        median,
        values,
        standardDeviation: this.calculateStandardDeviation(values)
      };
    }

    if (statisticalValidation) {
      aggregated.statisticalValidation = statisticalValidation;
    }

    return aggregated;
  }

  /**
   * Calculates backoff delay based on strategy
   */
  calculateBackoffDelay(attempt, options) {
    const { backoffStrategy, baseDelay, maxDelay } = options;
    
    let delay;
    switch (backoffStrategy) {
      case 'exponential':
        delay = baseDelay * Math.pow(2, attempt - 1);
        break;
      case 'linear':
        delay = baseDelay * attempt;
        break;
      case 'fixed':
      default:
        delay = baseDelay;
        break;
    }

    return Math.min(delay, maxDelay);
  }

  /**
   * Waits for specified delay with environment-specific adjustments
   */
  async waitWithStabilization(delay) {
    // Additional delay for CI environments
    const environment = process.env.NODE_ENV || 'test';
    const adjustedDelay = environment === 'ci' ? delay * 1.5 : delay;
    
    await new Promise(resolve => setTimeout(resolve, adjustedDelay));
  }

  /**
   * Stabilizes test environment before retry
   */
  async stabilizeTestEnvironment() {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    // Clear any pending timers or intervals
    // (In a real implementation, you might want to clear specific timers)
    
    // Wait for system stabilization
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /**
   * Executes test function with timeout protection
   */
  async executeTestWithTimeout(testFunction, timeout) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Test execution timeout after ${timeout}ms`));
      }, timeout);

      Promise.resolve(testFunction())
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Analyzes failure patterns to identify recurring issues
   */
  analyzeFailurePattern(testName, error, attemptNumber) {
    if (!this.failurePatterns.has(testName)) {
      this.failurePatterns.set(testName, {
        totalFailures: 0,
        errorTypes: new Map(),
        failuresByAttempt: new Map(),
        lastFailures: []
      });
    }

    const pattern = this.failurePatterns.get(testName);
    pattern.totalFailures++;

    // Track error types
    const errorType = error.constructor.name;
    pattern.errorTypes.set(errorType, (pattern.errorTypes.get(errorType) || 0) + 1);

    // Track failures by attempt number
    pattern.failuresByAttempt.set(attemptNumber, (pattern.failuresByAttempt.get(attemptNumber) || 0) + 1);

    // Keep recent failures for trend analysis
    pattern.lastFailures.push({
      timestamp: Date.now(),
      error: error.message,
      attemptNumber,
      errorType
    });

    // Keep only recent failures (last 20)
    if (pattern.lastFailures.length > 20) {
      pattern.lastFailures.shift();
    }
  }

  /**
   * Performs trend analysis on test performance over time
   */
  performTrendAnalysis(testName) {
    const history = this.testHistory.get(testName) || [];
    
    if (history.length < 3) {
      return {
        trend: 'insufficient_data',
        message: 'Not enough historical data for trend analysis'
      };
    }

    const recentResults = history.slice(-this.options.trendAnalysisWindow);
    const successRate = recentResults.filter(r => r.success).length / recentResults.length;
    
    // Analyze performance trends
    const performanceMetrics = recentResults
      .filter(r => r.success && r.result)
      .map(r => r.result);

    if (performanceMetrics.length < 2) {
      return {
        trend: 'insufficient_success_data',
        successRate,
        message: 'Not enough successful results for performance trend analysis'
      };
    }

    const trends = {};
    const metrics = this.extractMetricsFromResults(performanceMetrics);

    for (const [metricName, values] of Object.entries(metrics)) {
      trends[metricName] = this.calculateTrend(values);
    }

    return {
      trend: 'analyzed',
      successRate,
      performanceTrends: trends,
      sampleSize: performanceMetrics.length,
      analysisWindow: recentResults.length,
      recommendation: this.generateTrendRecommendation(trends, successRate)
    };
  }

  /**
   * Calculates trend direction and strength for a metric
   */
  calculateTrend(values) {
    if (values.length < 2) return { direction: 'unknown', strength: 0 };

    // Simple linear regression to determine trend
    const n = values.length;
    const xValues = Array.from({ length: n }, (_, i) => i);
    const xSum = xValues.reduce((sum, x) => sum + x, 0);
    const ySum = values.reduce((sum, y) => sum + y, 0);
    const xySum = xValues.reduce((sum, x, i) => sum + x * values[i], 0);
    const xxSum = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
    const correlation = this.calculateCorrelation(xValues, values);

    return {
      direction: slope > 0 ? 'improving' : slope < 0 ? 'degrading' : 'stable',
      slope,
      correlation,
      strength: Math.abs(correlation),
      confidence: correlation > 0.5 ? 'high' : correlation > 0.3 ? 'medium' : 'low'
    };
  }

  /**
   * Calculates correlation coefficient between two arrays
   */
  calculateCorrelation(x, y) {
    const n = x.length;
    const xMean = x.reduce((sum, val) => sum + val, 0) / n;
    const yMean = y.reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let xVariance = 0;
    let yVariance = 0;

    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - xMean;
      const yDiff = y[i] - yMean;
      numerator += xDiff * yDiff;
      xVariance += xDiff * xDiff;
      yVariance += yDiff * yDiff;
    }

    const denominator = Math.sqrt(xVariance * yVariance);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Generates recommendation based on trend analysis
   */
  generateTrendRecommendation(trends, successRate) {
    const recommendations = [];

    if (successRate < 0.8) {
      recommendations.push('Low success rate detected. Consider reviewing test conditions or implementation.');
    }

    const degradingMetrics = Object.entries(trends)
      .filter(([_, trend]) => trend.direction === 'degrading' && trend.confidence === 'high')
      .map(([metric, _]) => metric);

    if (degradingMetrics.length > 0) {
      recommendations.push(`Performance degradation detected in: ${degradingMetrics.join(', ')}. Investigation recommended.`);
    }

    const improvingMetrics = Object.entries(trends)
      .filter(([_, trend]) => trend.direction === 'improving' && trend.confidence === 'high')
      .map(([metric, _]) => metric);

    if (improvingMetrics.length > 0) {
      recommendations.push(`Performance improvements detected in: ${improvingMetrics.join(', ')}.`);
    }

    return recommendations.length > 0 ? recommendations : ['Performance trends appear stable.'];
  }

  /**
   * Records test execution in history
   */
  recordTestExecution(testName, executionContext, result, success) {
    const history = this.testHistory.get(testName) || [];
    
    history.push({
      timestamp: Date.now(),
      success,
      result: success ? result : null,
      error: success ? null : result,
      executionTime: Date.now() - executionContext.startTime,
      attempts: executionContext.attempts.length,
      environment: executionContext.environment
    });

    // Keep only recent history (last 50 executions)
    if (history.length > 50) {
      history.shift();
    }

    this.testHistory.set(testName, history);
  }

  /**
   * Enhances error with comprehensive retry information
   */
  enhanceErrorWithRetryInfo(originalError, executionContext, options) {
    const retryInfo = this.buildRetryInfo(executionContext);
    const failurePattern = this.failurePatterns.get(executionContext.testName);
    const trendAnalysis = options.enableTrendMonitoring ? 
      this.performTrendAnalysis(executionContext.testName) : null;

    const enhancedError = new Error(
      `Performance test "${executionContext.testName}" failed after ${executionContext.attempts.length} attempts. ` +
      `Original error: ${originalError.message}`
    );

    enhancedError.originalError = originalError;
    enhancedError.retryInfo = retryInfo;
    enhancedError.failurePattern = failurePattern;
    enhancedError.trendAnalysis = trendAnalysis;
    enhancedError.executionContext = executionContext;
    enhancedError.recommendations = this.generateFailureRecommendations(
      originalError, 
      retryInfo, 
      failurePattern,
      trendAnalysis
    );

    return enhancedError;
  }

  /**
   * Builds comprehensive retry information
   */
  buildRetryInfo(executionContext) {
    const totalDuration = Date.now() - executionContext.startTime;
    const successfulAttempts = executionContext.attempts.filter(a => a.success).length;
    const failedAttempts = executionContext.attempts.filter(a => !a.success).length;

    return {
      totalAttempts: executionContext.attempts.length,
      successfulAttempts,
      failedAttempts,
      totalDuration,
      averageAttemptDuration: executionContext.attempts.length > 0 ? 
        executionContext.attempts.reduce((sum, a) => sum + a.duration, 0) / executionContext.attempts.length : 0,
      retryStrategy: executionContext.retryStrategy,
      maxRetries: executionContext.maxRetries,
      environment: executionContext.environment,
      attempts: executionContext.attempts
    };
  }

  /**
   * Generates specific recommendations based on failure analysis
   */
  generateFailureRecommendations(error, retryInfo, failurePattern, trendAnalysis) {
    const recommendations = [];

    // Retry-specific recommendations
    if (retryInfo.failedAttempts === retryInfo.totalAttempts) {
      recommendations.push('All retry attempts failed. Consider increasing retry count or adjusting test conditions.');
    }

    // Pattern-based recommendations
    if (failurePattern) {
      const mostCommonError = Array.from(failurePattern.errorTypes.entries())
        .sort(([,a], [,b]) => b - a)[0];
      
      if (mostCommonError && mostCommonError[1] > failurePattern.totalFailures * 0.6) {
        recommendations.push(`Recurring error pattern detected: ${mostCommonError[0]}. Specific investigation needed.`);
      }
    }

    // Trend-based recommendations
    if (trendAnalysis && trendAnalysis.successRate < 0.7) {
      recommendations.push('Low historical success rate. Consider reviewing test implementation or environment setup.');
    }

    // Error-specific recommendations
    if (error.message.includes('timeout')) {
      recommendations.push('Timeout errors detected. Consider increasing timeout values or optimizing test performance.');
    }

    if (error.message.includes('memory')) {
      recommendations.push('Memory-related errors detected. Check for memory leaks or increase memory limits.');
    }

    return recommendations.length > 0 ? recommendations : ['No specific recommendations available.'];
  }

  // Utility methods
  generateTestId(testName) {
    return `${testName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? 
      (sorted[mid - 1] + sorted[mid]) / 2 : 
      sorted[mid];
  }

  calculateStandardDeviation(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  generateStatisticalAnalysisReport(statisticalTests) {
    const consistentMetrics = Object.entries(statisticalTests)
      .filter(([_, test]) => test.isConsistent)
      .map(([name, _]) => name);

    const inconsistentMetrics = Object.entries(statisticalTests)
      .filter(([_, test]) => !test.isConsistent)
      .map(([name, test]) => `${name} (CV: ${(test.coefficientOfVariation * 100).toFixed(1)}%)`);

    let report = `Statistical Analysis: ${consistentMetrics.length}/${Object.keys(statisticalTests).length} metrics consistent\n`;
    
    if (consistentMetrics.length > 0) {
      report += `Consistent metrics: ${consistentMetrics.join(', ')}\n`;
    }
    
    if (inconsistentMetrics.length > 0) {
      report += `Inconsistent metrics: ${inconsistentMetrics.join(', ')}\n`;
    }

    return report;
  }

  performStatisticalAnalysis(testName, result) {
    const history = this.testHistory.get(testName) || [];
    const recentSuccesses = history
      .filter(h => h.success && h.result)
      .slice(-10)
      .map(h => h.result);

    if (recentSuccesses.length < 2) {
      return {
        analysis: 'insufficient_data',
        message: 'Not enough historical data for statistical analysis'
      };
    }

    // Add current result for comparison
    recentSuccesses.push(result);
    
    const metrics = this.extractMetricsFromResults(recentSuccesses);
    const analysis = {};

    for (const [metricName, values] of Object.entries(metrics)) {
      analysis[metricName] = {
        currentValue: values[values.length - 1],
        historicalMean: values.slice(0, -1).reduce((sum, val) => sum + val, 0) / (values.length - 1),
        historicalStdDev: this.calculateStandardDeviation(values.slice(0, -1)),
        isOutlier: this.isStatisticalOutlier(values[values.length - 1], values.slice(0, -1))
      };
    }

    return {
      analysis: 'completed',
      sampleSize: recentSuccesses.length,
      metrics: analysis,
      summary: this.generateStatisticalSummary(analysis)
    };
  }

  isStatisticalOutlier(value, historicalValues) {
    if (historicalValues.length < 3) return false;
    
    const mean = historicalValues.reduce((sum, val) => sum + val, 0) / historicalValues.length;
    const stdDev = this.calculateStandardDeviation(historicalValues);
    const zScore = Math.abs((value - mean) / stdDev);
    
    return zScore > 2; // 2 standard deviations threshold
  }

  generateStatisticalSummary(analysis) {
    const outliers = Object.entries(analysis)
      .filter(([_, data]) => data.isOutlier)
      .map(([metric, _]) => metric);

    if (outliers.length > 0) {
      return `Statistical outliers detected in: ${outliers.join(', ')}`;
    }

    return 'Performance metrics within expected statistical range';
  }
}

// Export helper functions
export const createRetryHandler = (options) => new PerformanceRetryHandler(options);

export const executePerformanceTestWithRetry = async (testName, testFunction, options = {}) => {
  const handler = new PerformanceRetryHandler(options);
  return handler.executeWithRetry(testName, testFunction, options);
};