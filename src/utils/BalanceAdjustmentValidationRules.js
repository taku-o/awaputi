/**
 * BalanceAdjustmentValidationRules - Main Controller for balance validation system
 * Refactored to use the Main Controller Pattern with sub-components
 * ゲームバランス調整時の検証ルールを定義し、変更の妥当性と影響を評価するルールエンジン。
 */

import { getErrorHandler } from './ErrorHandler.js';
import { ValidationRuleEngine } from './balance-validation/ValidationRuleEngine.js';
import { ValidationRuleDefinitions } from './balance-validation/ValidationRuleDefinitions.js';
import { ValidationResultProcessor } from './balance-validation/ValidationResultProcessor.js';

export class BalanceAdjustmentValidationRules {
    constructor() {
        this.errorHandler = getErrorHandler();
        
        // Initialize sub-components with dependency injection
        this.ruleEngine = new ValidationRuleEngine(this);
        this.ruleDefinitions = new ValidationRuleDefinitions(this);
        this.resultProcessor = new ValidationResultProcessor(this);
        
        // Legacy compatibility properties - delegated to sub-components
        this.ruleCategories = this.ruleDefinitions.ruleCategories;
        this.rules = new Map(); // Will be synced from sub-components
        
        // Initialize the validation system
        this.initialize();
        
        console.log('[BalanceAdjustmentValidationRules] Main controller initialized successfully');
    }
    
    /**
     * Initialize the validation system
     */
    initialize() {
        try {
            // Initialize rule definitions
            this.ruleDefinitions.initializeRules();
            
            // Sync legacy properties for backward compatibility
            this.syncLegacyProperties();
            
            console.log(`[BalanceAdjustmentValidationRules] Validation system initialized with ${this.rules.size} rules`);
        } catch (error) {
            this.errorHandler.handleError(error, 'VALIDATION_SYSTEM_INIT');
            console.error('[BalanceAdjustmentValidationRules] Failed to initialize validation system');
        }
    }
    
    /**
     * Sync legacy properties for backward compatibility
     */
    syncLegacyProperties() {
        // Sync rules from definitions
        this.rules = this.ruleDefinitions.rules;
        
        // Sync rule categories
        this.ruleCategories = this.ruleDefinitions.ruleCategories;
    }
    
    /**
     * Validate configuration value change - Main orchestration method
     * @param {*} oldValue - Old value
     * @param {*} newValue - New value
     * @param {Object} context - Validation context
     * @returns {Object} Validation result
     */
    validate(oldValue, newValue, context = {}) {
        try {
            // Get applicable rules using the engine
            const allRules = this.ruleDefinitions.getRules();
            const applicableRules = this.ruleEngine.getApplicableRules(allRules, context);
            
            // Execute rules using the engine
            const engineResult = this.ruleEngine.executeRules(applicableRules, oldValue, newValue, context);
            
            // Process results using the processor
            const processedResult = this.resultProcessor.processResults(
                engineResult.results, 
                oldValue, 
                newValue, 
                context
            );
            
            // Add engine summary to processed result
            processedResult.engineSummary = engineResult.summary;
            
            return processedResult;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'VALIDATION_PROCESS', {
                oldValue,
                newValue,
                context
            });
            
            return {
                valid: false,
                errors: [{ 
                    rule: 'system', 
                    message: `Validation process failed: ${error.message}`, 
                    severity: 'high',
                    category: 'system'
                }],
                warnings: [],
                suggestions: [],
                autoFixAvailable: false,
                autoFixedValue: newValue,
                rulesApplied: [],
                timestamp: Date.now()
            };
        }
    }
    
    // ===== DELEGATED METHODS - Maintain backward compatibility =====
    
    /**
     * Add validation rule - delegated to rule definitions
     * @param {string} name - Rule name
     * @param {Object} rule - Rule definition
     */
    addRule(name, rule) {
        try {
            this.ruleDefinitions.addRule(name, rule);
            this.syncLegacyProperties();
        } catch (error) {
            this.errorHandler.handleError(error, 'VALIDATION_RULE_ADD', { name, rule });
        }
    }
    
    /**
     * Remove validation rule - delegated to rule definitions
     * @param {string} name - Rule name
     * @returns {boolean} Success flag
     */
    removeRule(name) {
        try {
            const result = this.ruleDefinitions.removeRule(name);
            this.syncLegacyProperties();
            return result;
        } catch (error) {
            this.errorHandler.handleError(error, 'VALIDATION_RULE_REMOVE', { name });
            return false;
        }
    }
    
    /**
     * Get rule statistics - delegated to rule definitions
     * @returns {Object} Rule statistics
     */
    getRuleStatistics() {
        return this.ruleDefinitions.getStatistics();
    }
    
    /**
     * Enable/disable rule - delegated to rule definitions
     * @param {string} ruleName - Rule name
     * @param {boolean} enabled - Enable flag
     * @returns {boolean} Success flag
     */
    setRuleEnabled(ruleName, enabled) {
        try {
            const result = this.ruleDefinitions.setRuleEnabled(ruleName, enabled);
            this.syncLegacyProperties();
            return result;
        } catch (error) {
            this.errorHandler.handleError(error, 'VALIDATION_RULE_TOGGLE', { ruleName, enabled });
            return false;
        }
    }
    
    /**
     * Enable/disable rules by category - delegated to rule definitions
     * @param {string} category - Category
     * @param {boolean} enabled - Enable flag
     * @returns {number} Number of changed rules
     */
    setCategoryEnabled(category, enabled) {
        try {
            const result = this.ruleDefinitions.setCategoryEnabled(category, enabled);
            this.syncLegacyProperties();
            return result;
        } catch (error) {
            this.errorHandler.handleError(error, 'VALIDATION_CATEGORY_TOGGLE', { category, enabled });
            return 0;
        }
    }
    
    /**
     * Get validation rules - delegated to rule definitions
     * @param {Object} filters - Filter conditions
     * @returns {Array} Rule list
     */
    getRules(filters = {}) {
        try {
            return this.ruleDefinitions.getRules(filters);
        } catch (error) {
            this.errorHandler.handleError(error, 'VALIDATION_GET_RULES', { filters });
            return [];
        }
    }
    
    // ===== LEGACY HELPER METHODS - Maintained for compatibility =====
    
    /**
     * Get applicable rules based on context - delegated to engine
     * @param {Object} context - Validation context
     * @returns {Array} Applicable rules
     */
    _getApplicableRules(context) {
        const allRules = this.ruleDefinitions.getRules();
        return this.ruleEngine.getApplicableRules(allRules, context);
    }
    
    /**
     * Get bubble health limits - delegated to rule definitions
     * @param {string} bubbleType - Bubble type
     * @returns {Object} Limits
     */
    _getBubbleHealthLimits(bubbleType) {
        return this.ruleDefinitions.getBubbleHealthLimits(bubbleType);
    }
    
    /**
     * Get score limits - delegated to rule definitions
     * @param {string} bubbleType - Bubble type
     * @returns {Object} Limits
     */
    _getScoreLimits(bubbleType) {
        return this.ruleDefinitions.getScoreLimits(bubbleType);
    }
    
    /**
     * Get change threshold - delegated to rule definitions
     * @param {string} bubbleType - Bubble type
     * @param {string} propertyType - Property type
     * @returns {number} Threshold ratio
     */
    _getChangeThreshold(bubbleType, propertyType) {
        return this.ruleDefinitions.getChangeThreshold(bubbleType, propertyType);
    }
    
    // ===== LEGACY RULE INITIALIZATION METHODS - Maintained for compatibility =====
    
    /**
     * Initialize rules - delegated to rule definitions
     */
    _initializeRules() {
        this.ruleDefinitions.initializeRules();
        this.syncLegacyProperties();
    }
    
    /**
     * Add bubble health rules - delegated to rule definitions
     */
    _addBubbleHealthRules() {
        this.ruleDefinitions.addBubbleHealthRules();
        this.syncLegacyProperties();
    }
    
    /**
     * Add score rules - delegated to rule definitions
     */
    _addScoreRules() {
        this.ruleDefinitions.addScoreRules();
        this.syncLegacyProperties();
    }
    
    /**
     * Add size rules - delegated to rule definitions
     */
    _addSizeRules() {
        this.ruleDefinitions.addSizeRules();
        this.syncLegacyProperties();
    }
    
    /**
     * Add time rules - delegated to rule definitions
     */
    _addTimeRules() {
        this.ruleDefinitions.addTimeRules();
        this.syncLegacyProperties();
    }
    
    /**
     * Add special effect rules - delegated to rule definitions
     */
    _addSpecialEffectRules() {
        this.ruleDefinitions.addSpecialEffectRules();
        this.syncLegacyProperties();
    }
    
    /**
     * Add system rules - delegated to rule definitions
     */
    _addSystemRules() {
        this.ruleDefinitions.addSystemRules();
        this.syncLegacyProperties();
    }
    
    // ===== PUBLIC API METHODS - Enhanced with sub-component functionality =====
    
    /**
     * Generate detailed validation report
     * @param {Object} validationResult - Validation result
     * @returns {string} Detailed report
     */
    generateDetailedReport(validationResult) {
        return this.resultProcessor.generateDetailedReport(validationResult);
    }
    
    /**
     * Get validation analytics
     * @returns {Object} Analytics data
     */
    getValidationAnalytics() {
        return this.resultProcessor.getAnalytics();
    }
    
    /**
     * Get engine performance metrics
     * @returns {Object} Performance metrics
     */
    getEngineMetrics() {
        return this.ruleEngine.getPerformanceMetrics();
    }
    
    /**
     * Get engine statistics
     * @returns {Object} Engine statistics
     */
    getEngineStatistics() {
        return this.ruleEngine.getStatistics();
    }
    
    /**
     * Get execution history
     * @param {Object} filters - Optional filters
     * @returns {Array} Execution history
     */
    getExecutionHistory(filters = {}) {
        return this.ruleEngine.getExecutionHistory(filters);
    }
    
    /**
     * Configure validation components
     * @param {Object} config - Configuration options
     */
    configure(config) {
        if (config.engine) {
            this.ruleEngine.configure(config.engine);
        }
        
        if (config.processor) {
            this.resultProcessor.configure(config.processor);
        }
        
        console.log('[BalanceAdjustmentValidationRules] Configuration updated');
    }
    
    /**
     * Clear all history and metrics
     */
    clearHistory() {
        this.ruleEngine.clearHistory();
        this.resultProcessor.clearHistory();
        console.log('[BalanceAdjustmentValidationRules] All history cleared');
    }
    
    /**
     * Reset all metrics
     */
    resetMetrics() {
        this.ruleEngine.resetMetrics();
        console.log('[BalanceAdjustmentValidationRules] All metrics reset');
    }
    
    /**
     * Get component references for advanced usage
     */
    getComponents() {
        return {
            engine: this.ruleEngine,
            definitions: this.ruleDefinitions,
            processor: this.resultProcessor
        };
    }
    
    /**
     * Get system health status
     * @returns {Object} Health status
     */
    getSystemHealth() {
        return {
            engine: {
                status: 'active',
                metrics: this.ruleEngine.getStatistics()
            },
            definitions: {
                status: 'active',
                ruleCount: this.ruleDefinitions.rules.size,
                statistics: this.ruleDefinitions.getStatistics()
            },
            processor: {
                status: 'active',
                analytics: this.resultProcessor.getAnalytics()
            },
            overall: {
                initialized: true,
                totalRules: this.rules.size,
                lastSyncTime: Date.now()
            }
        };
    }
    
    /**
     * Destroy validation system
     */
    destroy() {
        try {
            // Destroy sub-components
            this.ruleEngine.destroy();
            this.ruleDefinitions.destroy();
            this.resultProcessor.destroy();
            
            // Clear legacy properties
            this.rules.clear();
            
            console.log('[BalanceAdjustmentValidationRules] Main controller destroyed');
        } catch (error) {
            this.errorHandler.handleError(error, 'VALIDATION_SYSTEM_DESTROY');
        }
    }
}

// Singleton instance
let validationRulesInstance = null;

/**
 * Get BalanceAdjustmentValidationRules singleton instance
 * @returns {BalanceAdjustmentValidationRules} Rule engine instance
 */
export function getBalanceAdjustmentValidationRules() {
    if (!validationRulesInstance) {
        validationRulesInstance = new BalanceAdjustmentValidationRules();
    }
    return validationRulesInstance;
}

export default BalanceAdjustmentValidationRules;