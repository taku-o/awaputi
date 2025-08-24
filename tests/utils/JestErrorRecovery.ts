/**
 * Jest Error Recovery - Handles Jest configuration errors and provides fallback implementations
 * Provides error recovery utilities for Jest-related issues in ES Modules environment
 */

import { jest } from '@jest/globals';

export class JestErrorRecovery {
  private errorLog: any[];
  private recoveryStrategies: Map<string, any>;
  private fallbackImplementations: Map<string, any>;
  private validationResults: Map<string, any>;

  constructor() {
    this.errorLog = [];
    this.recoveryStrategies = new Map();
    this.fallbackImplementations = new Map();
    this.validationResults = new Map();
    
    this.initializeRecoveryStrategies();
    this.setupFallbackImplementations();
  }

  /**
   * Initialize recovery strategies for different types of Jest errors
   */
  initializeRecoveryStrategies() {
    // Jest undefined error recovery
    this.recoveryStrategies.set('jest_undefined', {
      detect: (error: any) => error.message?.includes('jest is not defined'),
      recover: () => this.handleJestUndefinedError(),
      description: 'Jest functions not available in ES Modules context'
    });

    // ES Modules setup error recovery
    this.recoveryStrategies.set('es_modules_setup', {
      detect: (error: any) => error.message?.includes('extensionsToTreatAsEsm'),
      recover: () => this.handleESModulesSetupError(),
      description: 'ES Modules configuration issues'
    });

    // Mock creation error recovery
    this.recoveryStrategies.set('mock_creation', {
      detect: (error: any) => error.message?.includes('Cannot create property') ||
                        error.message?.includes('jest.fn is not a function'),
      recover: () => this.handleMockCreationError(),
      description: 'Mock function creation failures'
    });

    // Global setup error recovery
    this.recoveryStrategies.set('global_setup', {
      detect: (error: any) => error.message?.includes('setupFilesAfterEnv') ||
                        error.message?.includes('globalSetup'),
      recover: () => this.handleGlobalSetupError(),
      description: 'Jest global setup configuration issues'
    });

    // Test environment error recovery
    this.recoveryStrategies.set('test_environment', {
      detect: (error: any) => error.message?.includes('testEnvironment') ||
                        error.message?.includes('jsdom'),
      recover: () => this.handleTestEnvironmentError(),
      description: 'Test environment configuration problems'
    });
  }

  /**
   * Setup fallback implementations for Jest functions
   */
  setupFallbackImplementations() {
    // Fallback jest.fn implementation
    this.fallbackImplementations.set('jest.fn', () => {
      const mockFn = function(...args: any[]) {
        mockFn.mock.calls.push(args);
        mockFn.mock.instances.push(this);
        if (mockFn.mock.implementation) {
          return mockFn.mock.implementation.apply(this, args);
        }
        
        if (mockFn.mock.returnValue !== undefined) {
          return mockFn.mock.returnValue;
        }
        
        return undefined;
      };

      mockFn.mock = {
        calls: [],
        instances: [],
        contexts: [],
        results: [],
        invocationCallOrder: [],
        implementation: null,
        returnValue: undefined,
        lastCall: null
      };

      // Mock function methods
      mockFn.mockImplementation = (fn: any) => {
        mockFn.mock.implementation = fn;
        return mockFn;
      };

      mockFn.mockReturnValue = (value: any) => {
        mockFn.mock.returnValue = value;
        return mockFn;
      };

      mockFn.mockReturnValueOnce = (value: any) => {
        if (!mockFn.mock.returnValues) {
          mockFn.mock.returnValues = [];
        }
        mockFn.mock.returnValues.push({ type: 'return', value });
        return mockFn;
      };

      mockFn.mockResolvedValue = (value: any) => {
        mockFn.mock.implementation = () => Promise.resolve(value);
        return mockFn;
      };

      mockFn.mockRejectedValue = (value: any) => {
        mockFn.mock.implementation = () => Promise.reject(value);
        return mockFn;
      };

      mockFn.mockClear = () => {
        mockFn.mock.calls = [];
        mockFn.mock.instances = [];
        mockFn.mock.contexts = [];
        mockFn.mock.results = [];
        return mockFn;
      };

      mockFn.mockReset = () => {
        mockFn.mockClear();
        mockFn.mock.implementation = null;
        mockFn.mock.returnValue = undefined;
        return mockFn;
      };

      mockFn.mockRestore = () => {
        // Fallback restore implementation
        return mockFn;
      };

      return mockFn;
    });

    // Fallback jest.spyOn implementation
    this.fallbackImplementations.set('jest.spyOn', (object: any, method: string) => {
      const original = object[method];
      const spy = this.fallbackImplementations.get('jest.fn')();
      
      spy.mockImplementation((...args: any[]) => {
        return original?.apply(object, args);
      });
      
      spy.mockRestore = () => {
        object[method] = original;
      };
      
      object[method] = spy;
      return spy;
    });

    // Fallback jest.mock implementation
    this.fallbackImplementations.set('jest.mock', (moduleName: string, factory?: any) => {
      console.warn(`Jest.mock fallback for ${moduleName} - module mocking may not work as expected`);
      return factory?.() || {};
    });
  }

  /**
   * Handle Jest undefined error with fallback implementations
   * @returns {Object} Recovery result
   */
  handleJestUndefinedError() {
    console.log('JestErrorRecovery: Handling jest undefined error...');
    
    try {
      // Ensure Jest globals are available
      if (typeof (global as any).jest === 'undefined') {
        (global as any).jest = {
          fn: this.fallbackImplementations.get('jest.fn'),
          spyOn: this.fallbackImplementations.get('jest.spyOn'),
          mock: this.fallbackImplementations.get('jest.mock'),
          clearAllMocks: () => console.warn('jest.clearAllMocks fallback'),
          resetAllMocks: () => console.warn('jest.resetAllMocks fallback'),
          restoreAllMocks: () => console.warn('jest.restoreAllMocks fallback')
        };
      }

      // Ensure window.jest is available if window exists
      if (typeof window !== 'undefined' && typeof (window as any).jest === 'undefined') {
        (window as any).jest = (global as any).jest;
      }

      return {
        success: true,
        message: 'Jest fallback implementations activated',
        fallbacksApplied: ['jest.fn', 'jest.spyOn', 'jest.mock'],
        guidance: [
          'Jest global functions are now available via fallback implementations',
          'Some advanced Jest features may not work as expected',
          'Consider updating Jest configuration for better ES Modules support'
        ]
      };

    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to apply Jest fallback implementations',
        error: error.message,
        guidance: [
          'Manual Jest setup may be required',
          'Check Jest configuration and ES Modules setup',
          'Verify setupFilesAfterEnv configuration'
        ]
      };
    }
  }

  /**
   * Handle ES Modules setup errors
   * @returns {Object} Recovery result
   */
  handleESModulesSetupError() {
    console.log('JestErrorRecovery: Handling ES Modules setup error...');
    
    const validation = this.validateESModulesSetup();
    
    return {
      success: validation.isValid,
      message: validation.isValid ? 
        'ES Modules setup validated successfully' : 
        'ES Modules setup validation failed',
      issues: validation.issues,
      guidance: [
        'Remove extensionsToTreatAsEsm configuration if present',
        'Ensure "type": "module" is set in package.json',
        'Use NODE_OPTIONS="--experimental-vm-modules" for Jest',
        'Import Jest functions from @jest/globals'
      ],
      recommendations: validation.recommendations
    };
  }

  /**
   * Handle mock creation errors
   * @returns {Object} Recovery result
   */
  handleMockCreationError() {
    console.log('JestErrorRecovery: Handling mock creation error...');
    
    try {
      // Ensure mock functions are available
      if (typeof jest === 'undefined' || typeof jest.fn !== 'function') {
        const fallbackFn = this.fallbackImplementations.get('jest.fn');
        if (typeof (global as any).jest === 'undefined') {
          (global as any).jest = {};
        }
        
        (global as any).jest.fn = fallbackFn;
        
        if (typeof window !== 'undefined') {
          if (typeof (window as any).jest === 'undefined') {
            (window as any).jest = {};
          }
          (window as any).jest.fn = fallbackFn;
        }
      }

      return {
        success: true,
        message: 'Mock creation fallbacks activated',
        fallbacksApplied: ['jest.fn'],
        guidance: [
          'Mock functions are now available via fallback implementation',
          'Basic mocking functionality should work',
          'Advanced Jest mock features may be limited'
        ]
      };

    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to apply mock creation fallbacks',
        error: error.message,
        guidance: [
          'Check Jest import statements',
          'Verify @jest/globals import',
          'Consider manual mock implementations'
        ]
      };
    }
  }

  /**
   * Handle global setup errors
   * @returns {Object} Recovery result
   */
  handleGlobalSetupError() {
    console.log('JestErrorRecovery: Handling global setup error...');
    
    return {
      success: true,
      message: 'Global setup error guidance provided',
      guidance: [
        'Check setupFilesAfterEnv configuration in jest.config.js',
        'Ensure setup files use proper ES Modules imports',
        'Verify globalSetup and globalTeardown file paths',
        'Consider using setupFiles instead of setupFilesAfterEnv if needed'
      ],
      recommendations: [
        'Use relative paths for setup files',
        'Import Jest globals explicitly in setup files',
        'Avoid mixing CommonJS and ES Modules syntax'
      ]
    };
  }

  /**
   * Handle test environment errors
   * @returns {Object} Recovery result
   */
  handleTestEnvironmentError() {
    console.log('JestErrorRecovery: Handling test environment error...');
    
    return {
      success: true,
      message: 'Test environment error guidance provided',
      guidance: [
        'Check testEnvironment configuration in jest.config.js',
        'Ensure jest-environment-jsdom is installed if using jsdom',
        'Consider using "node" environment for server-side tests',
        'Verify environment-specific setup files'
      ],
      recommendations: [
        'Use testEnvironment: "jsdom" for DOM tests',
        'Use testEnvironment: "node" for pure JavaScript tests',
        'Install required environment packages'
      ]
    };
  }

  /**
   * Validate ES Modules setup for Jest
   * @returns {Object} Validation result
   */
  validateESModulesSetup() {
    const validation = {
      isValid: true,
      issues: [] as string[],
      recommendations: [] as string[]
    };

    try {
      // Check if jest is available via import
      if (typeof jest === 'undefined') {
        validation.issues.push('Jest functions not available via ES Modules import');
        validation.recommendations.push('Import jest from @jest/globals');
        validation.isValid = false;
      }

      // Check if NODE_OPTIONS includes experimental-vm-modules
      const nodeOptions = process.env.NODE_OPTIONS || '';
      if (!nodeOptions.includes('--experimental-vm-modules')) {
        validation.issues.push('NODE_OPTIONS missing --experimental-vm-modules flag');
        validation.recommendations.push('Add --experimental-vm-modules to NODE_OPTIONS');
      }

      // Check package.json type field
      try {
        const fs = require('fs');
        const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
        if (packageJson.type !== 'module') {
          validation.issues.push('package.json "type" field not set to "module"');
          validation.recommendations.push('Set "type": "module" in package.json');
        }
      } catch (error) {
        validation.issues.push('Could not read package.json');
      }

      // Store validation results
      this.validationResults.set('es_modules_setup', validation);

    } catch (error: any) {
      validation.isValid = false;
      validation.issues.push(`Validation error: ${error.message}`);
    }

    return validation;
  }

  /**
   * Recover from Jest error automatically
   * @param {Error} error - The error to recover from
   * @returns {Object} Recovery result
   */
  recoverFromJestError(error: any) {
    console.log('JestErrorRecovery: Attempting automatic recovery...', error.message);
    
    // Log the error
    this.errorLog.push({
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      recoveryAttempted: false
    });

    // Find appropriate recovery strategy
    for (const [strategyName, strategy] of this.recoveryStrategies) {
      if (strategy.detect(error)) {
        console.log(`JestErrorRecovery: Using strategy "${strategyName}"`);
        
        const result = strategy.recover();
        
        // Update error log
        this.errorLog[this.errorLog.length - 1].recoveryAttempted = true;
        this.errorLog[this.errorLog.length - 1].recoveryStrategy = strategyName;
        this.errorLog[this.errorLog.length - 1].recoveryResult = result;
        
        return {
          strategy: strategyName,
          description: strategy.description,
          result: result
        };
      }
    }

    // No specific strategy found, provide general guidance
    const generalResult = {
      success: false,
      message: 'No specific recovery strategy available',
      guidance: [
        'Check Jest configuration files',
        'Verify ES Modules setup',
        'Review setup files and imports',
        'Consider manual error resolution'
      ]
    };

    this.errorLog[this.errorLog.length - 1].recoveryAttempted = true;
    this.errorLog[this.errorLog.length - 1].recoveryStrategy = 'general';
    this.errorLog[this.errorLog.length - 1].recoveryResult = generalResult;

    return {
      strategy: 'general',
      description: 'General Jest error guidance',
      result: generalResult
    };
  }

  /**
   * Get detailed error logging and guidance for Jest issues
   * @returns {Object} Error report
   */
  getErrorReport() {
    return {
      timestamp: new Date().toISOString(),
      totalErrors: this.errorLog.length,
      recoveryAttempts: this.errorLog.filter(log => log.recoveryAttempted).length,
      successfulRecoveries: this.errorLog.filter(log => 
        log.recoveryAttempted && log.recoveryResult?.success).length,
      errors: this.errorLog,
      validationResults: Object.fromEntries(this.validationResults),
      availableStrategies: Array.from(this.recoveryStrategies.keys()),
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Generate recommendations based on error patterns
   * @returns {Array<string>} Recommendations
   */
  generateRecommendations() {
    const recommendations: string[] = [];
    
    // Analyze error patterns
    const jestUndefinedErrors = this.errorLog.filter(log => 
      log.error.includes('jest is not defined')).length;
    
    const esModulesErrors = this.errorLog.filter(log => 
      log.error.includes('extensionsToTreatAsEsm')).length;
    
    const mockErrors = this.errorLog.filter(log => 
      log.error.includes('jest.fn') || log.error.includes('Cannot create property')).length;

    if (jestUndefinedErrors > 0) {
      recommendations.push('Consider using import { jest } from "@jest/globals" in test files');
      recommendations.push('Ensure Jest globals are properly configured in setup files');
    }

    if (esModulesErrors > 0) {
      recommendations.push('Remove extensionsToTreatAsEsm configuration from Jest config');
      recommendations.push('Use NODE_OPTIONS="--experimental-vm-modules" for ES Modules support');
    }

    if (mockErrors > 0) {
      recommendations.push('Import Jest functions explicitly in test files');
      recommendations.push('Use MockFactory for standardized mock creation');
    }

    if (this.errorLog.length === 0) {
      recommendations.push('No Jest errors detected - configuration appears healthy');
    }

    return recommendations;
  }

  /**
   * Clear error log and reset recovery state
   */
  reset() {
    this.errorLog = [];
    this.validationResults.clear();
    console.log('JestErrorRecovery: State reset completed');
  }
}

// Export singleton instance
export const jestErrorRecovery = new JestErrorRecovery();

// Export helper functions
export const recoverFromJestError = (error: any) => jestErrorRecovery.recoverFromJestError(error);
export const validateESModulesSetup = () => jestErrorRecovery.validateESModulesSetup();
export const getJestErrorReport = () => jestErrorRecovery.getErrorReport();