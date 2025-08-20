/**
 * Interface Validator utility for checking API method consistency
 * Ensures test expectations match actual implementation methods
 */

import { jest } from '@jest/globals';

export class InterfaceValidator {
  /**
   * Validates that all expected methods exist in the implementation
   * @param {Object} implementation - The actual class instance or constructor
   * @param {Array<string>} expectedMethods - Array of method names expected by tests
   * @param {string} className - Name of the class for reporting
   * @returns {Object} Validation results with missing methods and report
   */
  static validateAPIConsistency(implementation, expectedMethods, className = 'Unknown') {
    const implementedMethods: any[] = [];
    const missingMethods: any[] = [];
    const extraMethods: any[] = [];
    
    // Get all methods from implementation (including prototype)
    const allMethods = new Set();
    
    // Check instance methods
    if (implementation) {
      Object.getOwnPropertyNames(implementation.forEach(name => {
        if (typeof implementation[name] === 'function') {
          allMethods.add(name;
        }
      });
      
      // Check prototype methods
      if (implementation.constructor && implementation.constructor.prototype) {
        Object.getOwnPropertyNames(implementation.constructor.prototype).forEach(name => {
          if (name !== 'constructor' && typeof implementation.constructor.prototype[name] === 'function') {
            allMethods.add(name;
          }
        });
      }
      
      // Check if implementation is a constructor function
      if (typeof implementation === 'function') {
        Object.getOwnPropertyNames(implementation.prototype || {}).forEach(name => {
          if (name !== 'constructor' && typeof implementation.prototype[name] === 'function') {
            allMethods.add(name;
          }
        });
      }
    }
    
    // Check each expected method
    expectedMethods.forEach(methodName => {
      if (allMethods.has(methodName || 
          (implementation && typeof implementation[methodName] === 'function')) {
        implementedMethods.push(methodName;
      } else {
        missingMethods.push(methodName;
      }
    });
    
    // Find extra methods (implemented but not expected)
    allMethods.forEach(methodName => {
      if (!expectedMethods.includes(methodName) {
        extraMethods.push(methodName;
      }
    });
    
    const isValid = missingMethods.length === 0;
    
    return {
      isValid,
      className,
      implementedMethods,
      expectedMethods,
      missingMethods,
      extraMethods,
      coverage: implementedMethods.length / expectedMethods.length,
      report: this.generateValidationReport(className, {
        implementedMethods,
        expectedMethods,
        missingMethods,
        extraMethods,
        isValid
      })
    };
  }

  /**
   * Generates a detailed report of missing methods
   * @param {string} className - Name of the class
   * @param {Array<string>} missingMethods - Array of missing method names
   * @returns {string} Formatted report
   */
  static generateMissingMethodsReport(className, missingMethods) {
    if (missingMethods.length === 0) {
      return `✅ ${className}: All expected methods are implemented`;
    }
    
    let report = `❌ ${className}: Missing ${missingMethods.length} method(s: any):\n`;
    missingMethods.forEach(method => {
      report += `  - ${method}()\n`;
    });
    
    report += '\nSuggested implementation:\n';
    missingMethods.forEach(method => {
      report += `  ${method}() {\n    // TODO: Implement ${method}\n    throw new Error('Method ${method} not implemented');\n  }\n\n`;
    });
    
    return report;
  }

  /**
   * Generates a comprehensive validation report
   * @param {string} className - Name of the class
   * @param {Object} results - Validation results
   * @returns {string} Formatted report
   */
  static generateValidationReport(className, results) {
    const { implementedMethods, expectedMethods, missingMethods, extraMethods, isValid } = results;
    
    let report = `\n=== API Consistency Report for ${className} ===\n`;
    report += `Status: ${isValid ? '✅ VALID' : '❌ INVALID'}\n`;
    report += `Coverage: ${implementedMethods.length}/${expectedMethods.length} (${Math.round((implementedMethods.length / expectedMethods.length) * 100)}%)\n\n`;
    
    if (implementedMethods.length > 0) {
      report += `✅ Implemented Methods (${implementedMethods.length}):\n`;
      implementedMethods.forEach(method => {
        report += `  - ${method}()\n`;
      });
      report += '\n';
    }
    
    if (missingMethods.length > 0) {
      report += `❌ Missing Methods (${missingMethods.length}):\n`;
      missingMethods.forEach(method => {
        report += `  - ${method}()\n`;
      });
      report += '\n';
    }
    
    if (extraMethods.length > 0) {
      report += `ℹ️  Extra Methods (${extraMethods.length}):\n`;
      extraMethods.slice(0, 10).forEach(method => {
        report += `  - ${method}()\n`;
      });
      if (extraMethods.length > 10) {
        report += `  ... and ${extraMethods.length - 10} more\n`;
      }
      report += '\n';
    }
    
    if (missingMethods.length > 0) {
      report += '💡 Suggested Implementation:\n';
      missingMethods.forEach(method => {
        report += `  ${method}() {\n    // TODO: Implement ${method}\n    throw new Error('Method ${method} not implemented');\n  }\n\n`;
      });
    }
    
    report += '='.repeat(50) + '\n';
    
    return report;
  }

  /**
   * Scans test files for expected API methods
   * @param {string} testContent - Content of test file
   * @param {string} objectName - Name of the object being tested (e.g., 'audioManager', 'analyticsAPI')
   * @returns {Array<string>} Array of method names found in tests
   */
  static scanTestFileForExpectedMethods(testContent, objectName) {
    const methods = new Set();
    
    // Pattern to match method calls like: objectName.methodName(
    const methodCallPattern = new RegExp(`${objectName}\\.([a-zA-Z][a-zA-Z0-9_]*?)\\s*\\(`, 'g'));
    
    let match as any);
    while ((match = methodCallPattern.exec(testContent) !== null) {
      const methodName = match[1];
      // Filter out common non-method patterns
      if (!['length', 'constructor', 'prototype', 'then', 'catch', 'finally'].includes(methodName) {
        methods.add(methodName;
      }
    }
    
    return Array.from(methods.sort();
  }

  /**
   * Validates specific API implementations commonly tested
   */
  static validateCommonAPIs() {
    const results: Record<string, any> = {};
    
    // AudioManager expected methods (based on common test patterns)
    const audioManagerExpectedMethods = [
      'playSound', 'playSoundEffect', 'playBackgroundMusic', 'stopSound', 'stopAllSounds',
      'setVolume', 'setMasterVolume', 'setSoundEffectVolume', 'setBackgroundMusicVolume',
      'getVolume', 'getMasterVolume', 'getStatus', 'isEnabled', 'enable', 'disable',
      'loadAudio', 'preloadSounds', 'unloadSounds', 'configure', 'reset'
    ];
    
    // AnalyticsAPI expected methods (based on common test patterns)
    const analyticsAPIExpectedMethods = [
      'track', 'trackEvent', 'trackPage', 'trackError', 'collect', 'collectMetrics',
      'collectUserData', 'configure', 'initialize', 'reset', 'evaluateCondition',
      'isEnabled', 'getStatus', 'setConsent', 'hasConsent', 'flush'
    ];
    
    // Performance API expected methods
    const performanceExpectedMethods = [
      'now', 'mark', 'measure', 'getEntriesByType', 'getEntriesByName',
      'clearMarks', 'clearMeasures', 'getFrameRate', 'getRenderTime', 'getMemoryUsage'
    ];
    
    // Store expected methods for reference
    results.expectedMethods = {
      AudioManager: audioManagerExpectedMethods,
      AnalyticsAPI: analyticsAPIExpectedMethods,
      Performance: performanceExpectedMethods
    };
    
    return results;
  }

  /**
   * Creates a mock implementation with all expected methods for testing
   * @param {Array<string>} expectedMethods - Array of method names
   * @param {string} className - Name of the class for logging
   * @returns {Object} Mock implementation with all methods
   */
  static createCompleteMock(expectedMethods, className = 'MockClass') {
    const mock: Record<string, any> = {};
    
    expectedMethods.forEach(methodName => {
      mock[methodName] = jest.fn(() => {
        // Return appropriate default values based on method name
        if (methodName.startsWith('is') || methodName.startsWith('has')) {
          return true;
        } else if (methodName.startsWith('get')) {
          if (methodName.includes('Status')) {
            return { initialized: true, enabled: true };
          } else if (methodName.includes('Volume')) {
            return 0.8;
          }
          return null;
        } else if (methodName.includes('initialize') || methodName.includes('load')) {
          return Promise.resolve();
        }
        return undefined;
      });
    });
    
    // Add common properties
    mock.constructor = { name: className };
    
    return mock;
  }

  /**
   * Runs validation tests for all expected APIs
   * @returns {Object} Comprehensive validation results
   */
  static runComprehensiveValidation() {
    const commonAPIs = this.validateCommonAPIs();
    const results = {
      timestamp: new Date().toISOString(),
      summary: {
        totalAPIs: 0,
        validAPIs: 0,
        invalidAPIs: 0
      },
      details: {},
      recommendations: []
    };
    
    // Note: Actual implementation validation would require importing the real classes
    // This method provides the framework for comprehensive validation
    
    results.recommendations.push(
      'Import actual implementation classes to perform live validation',
      'Run validation as part of CI/CD pipeline',
      'Update implementations when validation fails',
      'Use createCompleteMock() for testing when implementations are incomplete'
    );
    
    return results;
  }
}

// Export additional utilities
export const APIExpectedMethods = {
  AudioManager: [
    'playSound', 'playSoundEffect', 'playBackgroundMusic', 'stopSound', 'stopAllSounds',
    'setVolume', 'setMasterVolume', 'setSoundEffectVolume', 'setBackgroundMusicVolume',
    'getVolume', 'getMasterVolume', 'getStatus', 'isEnabled', 'enable', 'disable',
    'loadAudio', 'preloadSounds', 'unloadSounds', 'configure', 'reset'
  ],
  
  AnalyticsAPI: [
    'track', 'trackEvent', 'trackPage', 'trackError', 'collect', 'collectMetrics',
    'collectUserData', 'configure', 'initialize', 'reset', 'evaluateCondition',
    'isEnabled', 'getStatus', 'setConsent', 'hasConsent', 'flush'
  ],
  
  Performance: [
    'now', 'mark', 'measure', 'getEntriesByType', 'getEntriesByName',
    'clearMarks', 'clearMeasures', 'getFrameRate', 'getRenderTime', 'getMemoryUsage'
  ]
};