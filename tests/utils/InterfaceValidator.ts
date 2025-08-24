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
  static validateAPIConsistency(implementation: any, expectedMethods: string[], className: string = 'Unknown') {
    const implementedMethods: string[] = [];
    const missingMethods: string[] = [];
    const extraMethods: string[] = [];
    
    // Get all methods from implementation (including prototype)
    const allMethods = new Set<string>();
    
    // Check instance methods
    if (implementation) {
      Object.getOwnPropertyNames(implementation).forEach(name => {
        if (typeof implementation[name] === 'function') {
          allMethods.add(name);
        }
      });
      
      // Check prototype methods
      if (implementation.constructor && implementation.constructor.prototype) {
        Object.getOwnPropertyNames(implementation.constructor.prototype).forEach(name => {
          if (name !== 'constructor' && typeof implementation.constructor.prototype[name] === 'function') {
            allMethods.add(name);
          }
        });
      }
      
      // Check if implementation is a constructor function
      if (typeof implementation === 'function') {
        Object.getOwnPropertyNames(implementation.prototype || {}).forEach(name => {
          if (name !== 'constructor' && typeof implementation.prototype[name] === 'function') {
            allMethods.add(name);
          }
        });
      }
    }
    
    // Check each expected method
    expectedMethods.forEach(methodName => {
      if (allMethods.has(methodName) || 
          (implementation && typeof implementation[methodName] === 'function')) {
        implementedMethods.push(methodName);
      } else {
        missingMethods.push(methodName);
      }
    });
    
    // Find extra methods (implemented but not expected)
    allMethods.forEach(methodName => {
      if (!expectedMethods.includes(methodName)) {
        extraMethods.push(methodName);
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
  static generateMissingMethodsReport(className: string, missingMethods: string[]): string {
    if (missingMethods.length === 0) {
      return `✅ ${className}: All expected methods are implemented`;
    }
    
    let report = `❌ ${className}: Missing ${missingMethods.length} method(s):\n`;
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
  static generateValidationReport(className: string, results: any): string {
    const { implementedMethods, expectedMethods, missingMethods, extraMethods, isValid } = results;
    
    let report = `\n=== API Consistency Report for ${className} ===\n`;
    report += `Status: ${isValid ? '✅ VALID' : '❌ INVALID'}\n`;
    report += `Coverage: ${implementedMethods.length}/${expectedMethods.length} (${Math.round((implementedMethods.length / expectedMethods.length) * 100)}%)\n\n`;
    
    if (implementedMethods.length > 0) {
      report += `✅ Implemented Methods (${implementedMethods.length}):\n`;
      implementedMethods.forEach((method: string) => {
        report += `  - ${method}()\n`;
      });
      report += '\n';
    }
    
    if (missingMethods.length > 0) {
      report += `❌ Missing Methods (${missingMethods.length}):\n`;
      missingMethods.forEach((method: string) => {
        report += `  - ${method}()\n`;
      });
      report += '\n';
    }
    
    if (extraMethods.length > 0) {
      report += `ℹ️  Extra Methods (${extraMethods.length}):\n`;
      extraMethods.slice(0, 10).forEach((method: string) => {
        report += `  - ${method}()\n`;
      });
      if (extraMethods.length > 10) {
        report += `  ... and ${extraMethods.length - 10} more\n`;
      }
      report += '\n';
    }
    
    if (missingMethods.length > 0) {
      report += '💡 Suggested Implementation:\n';
      missingMethods.forEach((method: string) => {
        report += `  ${method}() {\n    // TODO: Implement ${method}\n    throw new Error('Method ${method} not implemented');\n  }\n\n`;
      });
    }
    
    report += '='.repeat(50) + '\n';
    
    return report;
  }

  /**
   * Creates a mock implementation for missing methods
   * @param {Object} implementation - The implementation to patch
   * @param {Array<string>} missingMethods - Methods to add as mocks
   * @returns {Object} Patched implementation
   */
  static patchMissingMethods(implementation: any, missingMethods: string[]): any {
    missingMethods.forEach(methodName => {
      if (!implementation[methodName]) {
        implementation[methodName] = jest.fn().mockImplementation(() => {
          console.warn(`Mock called: ${methodName} - This method needs implementation`);
          return undefined;
        });
      }
    });
    
    return implementation;
  }

  /**
   * Validates that an object matches an expected interface structure
   * @param {Object} obj - Object to validate
   * @param {Object} expectedStructure - Expected structure definition
   * @returns {Object} Validation results
   */
  static validateStructure(obj: any, expectedStructure: any): any {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    function checkStructure(current: any, expected: any, path: string = ''): void {
      if (expected === null || expected === undefined) {
        return;
      }
      
      if (typeof expected === 'object' && !Array.isArray(expected)) {
        Object.keys(expected).forEach(key => {
          const fullPath = path ? `${path}.${key}` : key;
          
          if (!(key in current)) {
            errors.push(`Missing property: ${fullPath}`);
            return;
          }
          
          const currentValue = current[key];
          const expectedValue = expected[key];
          
          if (typeof expectedValue === 'string') {
            // Type checking
            const actualType = Array.isArray(currentValue) ? 'array' : typeof currentValue;
            if (actualType !== expectedValue && expectedValue !== 'any') {
              errors.push(`Type mismatch at ${fullPath}: expected ${expectedValue}, got ${actualType}`);
            }
          } else if (typeof expectedValue === 'object') {
            // Nested structure
            checkStructure(currentValue, expectedValue, fullPath);
          }
        });
        
        // Check for extra properties
        Object.keys(current).forEach(key => {
          if (!(key in expected)) {
            warnings.push(`Extra property found: ${path ? `${path}.${key}` : key}`);
          }
        });
      }
    }
    
    checkStructure(obj, expectedStructure);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      report: this.generateStructureReport(obj, expectedStructure, errors, warnings)
    };
  }

  /**
   * Generates a structure validation report
   * @param {Object} obj - The validated object
   * @param {Object} expectedStructure - Expected structure
   * @param {Array<string>} errors - Validation errors
   * @param {Array<string>} warnings - Validation warnings
   * @returns {string} Formatted report
   */
  static generateStructureReport(obj: any, expectedStructure: any, errors: string[], warnings: string[]): string {
    let report = '\n=== Structure Validation Report ===\n';
    report += `Status: ${errors.length === 0 ? '✅ VALID' : '❌ INVALID'}\n\n`;
    
    if (errors.length > 0) {
      report += `❌ Errors (${errors.length}):\n`;
      errors.forEach(error => {
        report += `  - ${error}\n`;
      });
      report += '\n';
    }
    
    if (warnings.length > 0) {
      report += `⚠️  Warnings (${warnings.length}):\n`;
      warnings.forEach(warning => {
        report += `  - ${warning}\n`;
      });
      report += '\n';
    }
    
    if (errors.length === 0 && warnings.length === 0) {
      report += '✅ Structure matches expected interface perfectly\n';
    }
    
    return report;
  }

  /**
   * Batch validate multiple implementations
   * @param {Array<Object>} validations - Array of validation configs
   * @returns {Object} Batch validation results
   */
  static batchValidate(validations: Array<{implementation: any, expectedMethods: string[], className: string}>): any {
    const results = validations.map(config => 
      this.validateAPIConsistency(config.implementation, config.expectedMethods, config.className)
    );
    
    const allValid = results.every(r => r.isValid);
    const totalMissing = results.reduce((sum, r) => sum + r.missingMethods.length, 0);
    
    let batchReport = '\n=== BATCH VALIDATION REPORT ===\n';
    batchReport += `Total Classes: ${validations.length}\n`;
    batchReport += `Valid Classes: ${results.filter(r => r.isValid).length}\n`;
    batchReport += `Total Missing Methods: ${totalMissing}\n`;
    batchReport += `Overall Status: ${allValid ? '✅ ALL VALID' : '❌ SOME INVALID'}\n\n`;
    
    results.forEach(result => {
      if (!result.isValid) {
        batchReport += result.report + '\n';
      }
    });
    
    return {
      allValid,
      results,
      totalMissing,
      report: batchReport
    };
  }
}