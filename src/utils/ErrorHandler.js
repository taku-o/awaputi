/**
 * ErrorHandler - Main Controller for error handling system
 * Refactored to use the Main Controller Pattern with sub-components
 * グレースフルデグラデーション、入力値検証、異常状態からの復旧処理を提供
 */

import { ErrorLogger } from './error/ErrorLogger.js';
import { ErrorReporter } from './error/ErrorReporter.js';
import { ErrorRecovery } from './error/ErrorRecovery.js';
import { ErrorAnalyzer } from './error/ErrorAnalyzer.js';

class ErrorHandler {
    constructor() {
        // Environment detection
        this.isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
        this.isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
        
        // Main controller state
        this.isInitialized = false;
        
        // Initialize sub-components with dependency injection
        this.logger = new ErrorLogger(this);
        this.reporter = new ErrorReporter(this);
        this.recovery = new ErrorRecovery(this);
        this.analyzer = new ErrorAnalyzer(this);
        
        // Legacy compatibility properties - delegated to sub-components
        this.errorLog = [];
        this.maxLogSize = 100;
        this.criticalErrors = new Set();
        this.recoveryAttempts = new Map();
        this.maxRecoveryAttempts = 3;
        this.fallbackModes = new Map();
        this.errorStats = {
            total: 0,
            byType: new Map(),
            byContext: new Map(),
            critical: 0,
            recovered: 0
        };
        
        // Delegated properties from sub-components
        this.recoveryStrategies = new Map();
        this.fallbackState = {
            audioDisabled: false,
            canvasDisabled: false,
            storageDisabled: false,
            reducedEffects: false,
            safeMode: false
        };
        
        this.initialize();
    }
    
    /**
     * Initialize error handler
     */
    initialize() {
        if (this.isInitialized) return;
        
        try {
            this.setupGlobalErrorHandlers();
            this.setupPerformanceMonitoring();
            this.isInitialized = true;
            console.log('[ErrorHandler] Main controller initialized successfully');
        } catch (error) {
            console.error('[ErrorHandler] Failed to initialize:', error);
            // Fallback to safe mode
            this.enableSafeMode();
        }
    }
    
    /**
     * Setup global error handlers
     */
    setupGlobalErrorHandlers() {
        // Browser environment only
        if (!this.isBrowser) {
            console.log('[ErrorHandler] Skipping global error handlers in non-browser environment');
            return;
        }
        
        // Unhandled JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleError(event.error, 'GLOBAL_ERROR', {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                message: event.message
            });
        });
        
        // Unhandled Promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'PROMISE_REJECTION', {
                promise: event.promise
            });
            event.preventDefault(); // Prevent default console output
        });
        
        // Resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleError(new Error(`Resource load failed: ${event.target.src || event.target.href}`), 'RESOURCE_ERROR', {
                    element: event.target.tagName,
                    source: event.target.src || event.target.href
                });
            }
        }, true);
    }
    
    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Browser environment only
        if (!this.isBrowser) {
            console.log('[ErrorHandler] Skipping performance monitoring in non-browser environment');
            return;
        }
        
        // Memory usage monitoring
        if (window.performance && window.performance.memory) {
            setInterval(() => {
                const memory = window.performance.memory;
                const usedMB = memory.usedJSHeapSize / 1024 / 1024;
                const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
                
                // Memory usage over 80%
                if (usedMB / limitMB > 0.8) {
                    this.handleError(new Error(`High memory usage: ${Math.round(usedMB)}MB / ${Math.round(limitMB)}MB`), 'MEMORY_WARNING', {
                        usedMB: Math.round(usedMB),
                        limitMB: Math.round(limitMB),
                        percentage: Math.round((usedMB / limitMB) * 100)
                    });
                }
            }, 10000); // Every 10 seconds
        }
        
        // Frame rate monitoring
        let frameCount = 0;
        let lastTime = performance.now();
        
        const monitorFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = frameCount;
                frameCount = 0;
                lastTime = currentTime;
                
                // FPS below 30
                if (fps < 30) {
                    this.handleError(new Error(`Low FPS detected: ${fps}`), 'PERFORMANCE_WARNING', {
                        fps: fps,
                        timestamp: currentTime
                    });
                }
            }
            
            requestAnimationFrame(monitorFPS);
        };
        
        requestAnimationFrame(monitorFPS);
    }
    
    /**
     * Handle error - Main orchestration method
     * @param {Error} error - Error object
     * @param {string} context - Error context
     * @param {Object} metadata - Additional metadata
     */
    handleError(error, context = 'UNKNOWN', metadata = {}) {
        try {
            // Normalize error using analyzer
            const errorInfo = this.analyzer.normalizeError(error, context, metadata);
            
            // Add to error log using logger
            this.logger.addToErrorLog(errorInfo);
            
            // Update statistics using logger
            this.logger.updateErrorStats(errorInfo);
            
            // Determine severity using analyzer
            const severity = this.analyzer.determineSeverity(errorInfo);
            
            // Log error using logger
            this.logger.logStructuredError(errorInfo, severity);
            
            // Attempt recovery using recovery system
            if (severity !== 'LOW') {
                this.recovery.attemptRecovery(errorInfo);
            }
            
            // Notify user using reporter (for critical errors)
            if (severity === 'CRITICAL') {
                this.reporter.notifyUser(errorInfo);
            }
            
            // Update legacy compatibility properties
            this.syncLegacyProperties();
            
        } catch (handlerError) {
            // Error handler itself failed
            console.error('[ErrorHandler] Error in error handler:', handlerError);
            console.error('[ErrorHandler] Original error:', error);
            this.enableSafeMode();
        }
    }
    
    /**
     * Sync legacy properties for backward compatibility
     */
    syncLegacyProperties() {
        // Sync errorLog
        this.errorLog = this.logger.getErrorLog();
        
        // Sync errorStats
        this.errorStats = this.logger.getErrorStats();
        
        // Sync fallbackState
        this.fallbackState = this.recovery.getFallbackState();
        
        // Sync recoveryStrategies
        this.recoveryStrategies = this.recovery.recoveryStrategies;
    }
    
    // ===== DELEGATED METHODS - Maintain backward compatibility =====
    
    /**
     * Normalize error - delegated to analyzer
     */
    normalizeError(error, context, metadata) {
        return this.analyzer.normalizeError(error, context, metadata);
    }
    
    /**
     * Generate error ID - delegated to logger
     */
    generateErrorId() {
        return this.logger.generateErrorId();
    }
    
    /**
     * Add to error log - delegated to logger
     */
    addToErrorLog(errorInfo) {
        this.logger.addToErrorLog(errorInfo);
        this.syncLegacyProperties();
    }
    
    /**
     * Update error statistics - delegated to logger
     */
    updateErrorStats(errorInfo) {
        this.logger.updateErrorStats(errorInfo);
        this.syncLegacyProperties();
    }
    
    /**
     * Determine severity - delegated to analyzer
     */
    determineSeverity(errorInfo) {
        return this.analyzer.determineSeverity(errorInfo);
    }
    
    /**
     * Log error - delegated to logger
     */
    logError(errorInfo, severity) {
        this.logger.logError(errorInfo, severity);
    }
    
    /**
     * Attempt recovery - delegated to recovery
     */
    attemptRecovery(errorInfo) {
        const result = this.recovery.attemptRecovery(errorInfo);
        this.syncLegacyProperties();
        return result;
    }
    
    /**
     * Notify user - delegated to reporter
     */
    notifyUser(errorInfo) {
        this.reporter.notifyUser(errorInfo);
    }
    
    /**
     * Should notify user - delegated to reporter
     */
    shouldNotifyUser(errorInfo) {
        return this.reporter.shouldNotifyUser(errorInfo);
    }
    
    /**
     * Show error notification - delegated to reporter
     */
    showErrorNotification(errorInfo) {
        this.reporter.showErrorNotification(errorInfo);
    }
    
    /**
     * Get user friendly message - delegated to reporter
     */
    getUserFriendlyMessage(errorInfo) {
        return this.reporter.getUserFriendlyMessage(errorInfo);
    }
    
    /**
     * Show fallback UI - delegated to reporter
     */
    showFallbackUI() {
        this.reporter.showFallbackUI();
    }
    
    /**
     * Use memory storage - delegated to recovery
     */
    useMemoryStorage() {
        this.recovery.useMemoryStorage();
        this.syncLegacyProperties();
    }
    
    /**
     * Reduce effects - delegated to recovery
     */
    reduceEffects() {
        this.recovery.reduceEffects();
        this.syncLegacyProperties();
    }
    
    /**
     * Perform garbage collection - delegated to recovery
     */
    performGarbageCollection() {
        this.recovery.performGarbageCollection();
    }
    
    /**
     * Optimize performance - delegated to recovery
     */
    optimizePerformance() {
        this.recovery.optimizePerformance();
        this.syncLegacyProperties();
    }
    
    /**
     * Enable safe mode - delegated to recovery
     */
    enableSafeMode() {
        this.recovery.enableSafeMode();
        this.syncLegacyProperties();
    }
    
    /**
     * Setup recovery strategies - delegated to recovery
     */
    setupRecoveryStrategies() {
        this.recovery.setupRecoveryStrategies();
        this.syncLegacyProperties();
    }
    
    // ===== INPUT VALIDATION METHODS - Maintained for compatibility =====
    
    /**
     * Validate input
     * @param {*} value - Value to validate
     * @param {string} type - Expected type
     * @param {Object} constraints - Constraint conditions
     * @returns {Object} Validation result
     */
    validateInput(value, type, constraints = {}) {
        const result = {
            isValid: true,
            errors: [],
            sanitizedValue: value
        };
        
        try {
            // null/undefined check
            if (constraints.required && (value === null || value === undefined)) {
                result.isValid = false;
                result.errors.push('Value is required');
                return result;
            }
            
            if (value === null || value === undefined) {
                return result; // null/undefined allowed if not required
            }
            
            // Type checking
            switch (type) {
                case 'string':
                    result.sanitizedValue = this.validateString(value, constraints, result);
                    break;
                case 'number':
                    result.sanitizedValue = this.validateNumber(value, constraints, result);
                    break;
                case 'boolean':
                    result.sanitizedValue = this.validateBoolean(value, constraints, result);
                    break;
                case 'object':
                    result.sanitizedValue = this.validateObject(value, constraints, result);
                    break;
                case 'array':
                    result.sanitizedValue = this.validateArray(value, constraints, result);
                    break;
                case 'function':
                    result.sanitizedValue = this.validateFunction(value, constraints, result);
                    break;
                default:
                    result.errors.push(`Unknown type: ${type}`);
                    result.isValid = false;
            }
            
        } catch (error) {
            result.isValid = false;
            result.errors.push(`Validation error: ${error.message}`);
            this.handleError(error, 'VALIDATION_ERROR', { value, type, constraints });
        }
        
        return result;
    }
    
    /**
     * Validate string
     */
    validateString(value, constraints, result) {
        if (typeof value !== 'string') {
            try {
                value = String(value);
            } catch (error) {
                result.isValid = false;
                result.errors.push('Cannot convert to string');
                return value;
            }
        }
        
        // Length check
        if (constraints.minLength && value.length < constraints.minLength) {
            result.isValid = false;
            result.errors.push(`String too short (min: ${constraints.minLength})`);
        }
        
        if (constraints.maxLength && value.length > constraints.maxLength) {
            result.isValid = false;
            result.errors.push(`String too long (max: ${constraints.maxLength})`);
            value = value.substring(0, constraints.maxLength);
        }
        
        // Pattern check
        if (constraints.pattern && !constraints.pattern.test(value)) {
            result.isValid = false;
            result.errors.push('String does not match required pattern');
        }
        
        // HTML escaping
        if (constraints.escapeHtml) {
            value = value
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;');
        }
        
        return value;
    }
    
    /**
     * Validate number
     */
    validateNumber(value, constraints, result) {
        if (typeof value !== 'number') {
            const converted = Number(value);
            if (isNaN(converted)) {
                result.isValid = false;
                result.errors.push('Cannot convert to number');
                return value;
            }
            value = converted;
        }
        
        // NaN/Infinity check
        if (isNaN(value)) {
            result.isValid = false;
            result.errors.push('Value is NaN');
            return 0;
        }
        
        if (!isFinite(value)) {
            result.isValid = false;
            result.errors.push('Value is not finite');
            return constraints.max || constraints.min || 0;
        }
        
        // Range check
        if (constraints.min !== undefined && value < constraints.min) {
            result.isValid = false;
            result.errors.push(`Number too small (min: ${constraints.min})`);
            value = constraints.min;
        }
        
        if (constraints.max !== undefined && value > constraints.max) {
            result.isValid = false;
            result.errors.push(`Number too large (max: ${constraints.max})`);
            value = constraints.max;
        }
        
        // Integer check
        if (constraints.integer && !Number.isInteger(value)) {
            result.isValid = false;
            result.errors.push('Number must be integer');
            value = Math.round(value);
        }
        
        return value;
    }
    
    /**
     * Validate boolean
     */
    validateBoolean(value, constraints, result) {
        if (typeof value !== 'boolean') {
            if (value === 'true' || value === 1 || value === '1') {
                value = true;
            } else if (value === 'false' || value === 0 || value === '0') {
                value = false;
            } else {
                result.isValid = false;
                result.errors.push('Cannot convert to boolean');
                return false;
            }
        }
        
        return value;
    }
    
    /**
     * Validate object
     */
    validateObject(value, constraints, result) {
        if (typeof value !== 'object' || value === null) {
            result.isValid = false;
            result.errors.push('Value is not an object');
            return {};
        }
        
        // Property validation
        if (constraints.properties) {
            const validatedObject = {};
            
            for (const [key, propConstraints] of Object.entries(constraints.properties)) {
                const propResult = this.validateInput(value[key], propConstraints.type, propConstraints);
                
                if (!propResult.isValid) {
                    result.isValid = false;
                    result.errors.push(`Property '${key}': ${propResult.errors.join(', ')}`);
                }
                
                validatedObject[key] = propResult.sanitizedValue;
            }
            
            return validatedObject;
        }
        
        return value;
    }
    
    /**
     * Validate array
     */
    validateArray(value, constraints, result) {
        if (!Array.isArray(value)) {
            result.isValid = false;
            result.errors.push('Value is not an array');
            return [];
        }
        
        // Length check
        if (constraints.minLength && value.length < constraints.minLength) {
            result.isValid = false;
            result.errors.push(`Array too short (min: ${constraints.minLength})`);
        }
        
        if (constraints.maxLength && value.length > constraints.maxLength) {
            result.isValid = false;
            result.errors.push(`Array too long (max: ${constraints.maxLength})`);
            value = value.slice(0, constraints.maxLength);
        }
        
        // Element validation
        if (constraints.itemType) {
            const validatedArray = [];
            
            for (let i = 0; i < value.length; i++) {
                const itemResult = this.validateInput(value[i], constraints.itemType, constraints.itemConstraints || {});
                
                if (!itemResult.isValid) {
                    result.isValid = false;
                    result.errors.push(`Item ${i}: ${itemResult.errors.join(', ')}`);
                }
                
                validatedArray.push(itemResult.sanitizedValue);
            }
            
            return validatedArray;
        }
        
        return value;
    }
    
    /**
     * Validate function
     */
    validateFunction(value, constraints, result) {
        if (typeof value !== 'function') {
            result.isValid = false;
            result.errors.push('Value is not a function');
            return () => {};
        }
        
        return value;
    }
    
    // ===== PUBLIC API METHODS - Maintained for compatibility =====
    
    /**
     * Get error statistics
     */
    getErrorStats() {
        return this.logger.getErrorStats();
    }
    
    /**
     * Get error log
     */
    getErrorLog() {
        return this.logger.getErrorLog();
    }
    
    /**
     * Get fallback state
     */
    getFallbackState() {
        return this.recovery.getFallbackState();
    }
    
    /**
     * Reset error handler
     */
    reset() {
        this.logger.clearErrorLog();
        this.logger.clearErrorStats();
        this.recovery.resetAllRecoveryAttempts();
        this.syncLegacyProperties();
        console.log('[ErrorHandler] Main controller reset');
    }
    
    /**
     * Configure components
     * @param {object} config - Configuration options
     */
    configure(config) {
        if (config.logger) {
            this.logger.configure(config.logger);
        }
        
        if (config.reporter) {
            this.reporter.configure(config.reporter);
        }
        
        if (config.recovery) {
            this.recovery.configure(config.recovery);
        }
        
        if (config.analyzer) {
            this.analyzer.configure(config.analyzer);
        }
        
        console.log('[ErrorHandler] Configuration updated');
    }
    
    /**
     * Get component references for advanced usage
     */
    getComponents() {
        return {
            logger: this.logger,
            reporter: this.reporter,
            recovery: this.recovery,
            analyzer: this.analyzer
        };
    }
    
    /**
     * Destroy error handler
     */
    destroy() {
        // Remove event listeners
        if (this.isBrowser) {
            window.removeEventListener('error', this.handleError);
            window.removeEventListener('unhandledrejection', this.handleError);
        }
        
        // Destroy sub-components
        this.logger.destroy();
        this.reporter.destroy();
        this.recovery.destroy();
        this.analyzer.destroy();
        
        // Clear legacy properties
        this.errorLog = [];
        this.recoveryStrategies.clear();
        this.fallbackModes.clear();
        
        this.isInitialized = false;
        console.log('[ErrorHandler] Main controller destroyed');
    }
}

// Singleton instance (lazy initialization)
let _errorHandler = null;

function getErrorHandler() {
    if (!_errorHandler) {
        _errorHandler = new ErrorHandler();
    }
    return _errorHandler;
}

// Static methods for backward compatibility
ErrorHandler.handleError = (error, context, metadata) => {
    return getErrorHandler().handleError(error, context, metadata);
};

ErrorHandler.validateInput = (value, type, constraints) => {
    return getErrorHandler().validateInput(value, type, constraints);
};

ErrorHandler.getErrorStats = () => {
    return getErrorHandler().getErrorStats();
};

ErrorHandler.getErrorLog = () => {
    return getErrorHandler().getErrorLog();
};

ErrorHandler.reset = () => {
    return getErrorHandler().reset();
};

// Backward compatibility
const errorHandler = getErrorHandler;

// Global exposure (for debugging)
if (typeof window !== 'undefined') {
    window.errorHandler = errorHandler;
}

export { ErrorHandler, getErrorHandler, errorHandler };