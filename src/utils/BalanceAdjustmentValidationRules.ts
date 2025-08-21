/**
 * BalanceAdjustmentValidationRules - Main Controller for balance validation system
 * Refactored to use the Main Controller Pattern with sub-components
 * ゲームバランス調整時の検証ルールを定義し、変更の妥当性と影響を評価するルールエンジン。
 */

import { getErrorHandler, ErrorHandler  } from './ErrorHandler.js';
import { ValidationRuleEngine  } from './balance-validation/ValidationRuleEngine.js';
import { ValidationRuleDefinitions  } from './balance-validation/ValidationRuleDefinitions.js';
import { ValidationResultProcessor  } from './balance-validation/ValidationResultProcessor.js';

// Type definitions
interface ValidationContext { configKey?: string,
    bubbleType?: string;
    propertyType?: string;
    gameMode?: string;
    difficultyLevel?: string;
    player?: any;
    stage?: any;
    [key: string]: any;

interface ValidationError { rule: string,
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    context?: any;

interface ValidationWarning { rule: string,
    message: string;
    severity: 'low' | 'medium' | 'high';
    category: string;
    context?: any;

interface ValidationSuggestion { rule: string,
    message: string;
    recommendedValue?: any;
    action?: string;
    category: string;

interface ValidationResult { valid: boolean,
    errors: ValidationError[];
    warnings: ValidationWarning[];
    suggestions: ValidationSuggestion[];
    autoFixAvailable: boolean;
    autoFixedValue: any;
    rulesApplied: string[];
    timestamp: number;
    engineSummary?: any;

interface ValidationRule { name: string,
    category: string;
    enabled: boolean;
    priority: number;
    validator: (oldValue: any, newValue: any, context: ValidationContext) => ValidationResult;
    description?: string;
    applicableContexts?: string[],  }
}

interface RuleFilters { category?: string,
    enabled?: boolean;
    priority?: number;
    [key: string]: any;

interface BubbleHealthLimits { min: number,
    max: number;
    default: number;

interface ScoreLimits { min: number,
    max: number;
    default: number;

interface ValidationAnalytics { totalValidations: number,
    successRate: number;
    errorRate: number;
    warningRate: number;
    mostCommonErrors: string[];
    averageExecutionTime: number;

interface EngineMetrics { totalExecutions: number,
    averageExecutionTime: number;
    rulesExecuted: number;
    errorsEncountered: number;

interface EngineStatistics { rulesCount: number,
    activeRules: number;
    disabledRules: number;
    categoryCounts: Record<string, number> }

interface ExecutionHistoryEntry { timestamp: number,
    ruleCount: number;
    executionTime: number;
    result: ValidationResult;
    context: ValidationContext;

interface EngineConfig { maxExecutionTime?: number,
    enableProfiling?: boolean;
    [key: string]: any;

interface ProcessorConfig { enableAnalytics?: boolean,
    maxHistorySize?: number;
    [key: string]: any;

interface SystemConfig { engine?: EngineConfig,
    processor?: ProcessorConfig;

interface ComponentHealth { status: string,
    metrics?: any;
    ruleCount?: number;
    statistics?: any;
    analytics?: any;

interface SystemHealth { engine: ComponentHealth,
    definitions: ComponentHealth;
    processor: ComponentHealth;
    overall: {
        initialize,d: boolean,
        totalRules: number,
    lastSyncTime: number,

interface ComponentReferences { engine: ValidationRuleEngine,
    definitions: ValidationRuleDefinitions;
    processor: ValidationResultProcessor;

export class BalanceAdjustmentValidationRules {
    private errorHandler: ErrorHandler;
    private ruleEngine: ValidationRuleEngine;
    private ruleDefinitions: ValidationRuleDefinitions;
    private resultProcessor: ValidationResultProcessor;
    // Legacy compatibility properties
    public, ruleCategories: Record<string, any>,
    public rules: Map<string, ValidationRule>;

    constructor() {

        this.errorHandler = getErrorHandler();
        
        // Initialize sub-components with dependency injection
        this.ruleEngine = new ValidationRuleEngine(this);
        this.ruleDefinitions = new ValidationRuleDefinitions(this);
        this.resultProcessor = new ValidationResultProcessor(this);
        
        // Legacy compatibility properties - delegated to sub-components
        this.ruleCategories = this.ruleDefinitions.ruleCategories;
        this.rules = new Map(); // Will be synced from sub-components
        ,
        // Initialize the validation system
        this.initialize() }

    }

        console.log('[BalanceAdjustmentValidationRules] Main, controller initialized, successfully'); }'
    }
    
    /**
     * Initialize the validation system
     */
    private initialize(): void { try {
            // Initialize rule definitions
            this.ruleDefinitions.initializeRules(),
            
            // Sync legacy properties for backward compatibility
            this.syncLegacyProperties() }
            console.log(`[BalanceAdjustmentValidationRules] Validation, system initialized, with ${this.rules.size} rules`});
        } catch (error) {
            this.errorHandler.handleError(error, 'VALIDATION_SYSTEM_INIT'),
            console.error('[BalanceAdjustmentValidationRules] Failed, to initialize, validation system') }'
    }
    
    /**
     * Sync legacy properties for backward compatibility
     */
    private syncLegacyProperties(): void { // Sync rules from definitions
        this.rules = this.ruleDefinitions.rules;
        
        // Sync rule categories
        this.ruleCategories = this.ruleDefinitions.ruleCategories }
    
    /**
     * Validate configuration value change - Main orchestration method
     */
    public validate(oldValue: any, newValue: any, context: ValidationContext = { ): ValidationResult {
        try {
            // Get applicable rules using the engine
            const allRules = this.ruleDefinitions.getRules(),
            const applicableRules = this.ruleEngine.getApplicableRules(allRules, context),
            
            // Execute rules using the engine
            const engineResult = this.ruleEngine.executeRules(applicableRules, oldValue, newValue, context),
            
            // Process results using the processor
            const processedResult = this.resultProcessor.processResults(
                engineResult.results ),
                oldValue,
                newValue),
                context,
            
            // Add engine summary to processed result
            processedResult.engineSummary = engineResult.summary,
            
            return processedResult,
            ' }'

        } catch (error) {
            this.errorHandler.handleError(error, 'VALIDATION_PROCESS', {)
                oldValue,
                newValue,','
                context',' }'

            }');'
            
            return { valid: false,

                errors: [{ };

                    rule: 'system', ' }'

                    message: `Validation process, failed: ${error, instanceof Error ? error.message : String(error'}'`;
                    severity: 'high',]';'
                    category: 'system'],
                }],
                warnings: [];
                suggestions: [];
                autoFixAvailable: false;
                autoFixedValue: newValue;
                rulesApplied: [],
    timestamp: Date.now();
    }
    
    // ===== DELEGATED METHODS - Maintain backward compatibility =====
    
    /**
     * Add validation rule - delegated to rule definitions
     */
    public addRule(name: string, rule: ValidationRule): void { try {
            this.ruleDefinitions.addRule(name, rule),
            this.syncLegacyProperties(),' }'

        } catch (error) { }

            this.errorHandler.handleError(error, 'VALIDATION_RULE_ADD', { name, rule });
        }
    }
    
    /**
     * Remove validation rule - delegated to rule definitions
     */
    public removeRule(name: string): boolean { try {
            const result = this.ruleDefinitions.removeRule(name),
            this.syncLegacyProperties(),

            return result,' }'

        } catch (error) { }

            this.errorHandler.handleError(error, 'VALIDATION_RULE_REMOVE', { name });
            return false;
    
    /**
     * Get rule statistics - delegated to rule definitions
     */
    public getRuleStatistics(): any { return this.ruleDefinitions.getStatistics() }
    
    /**
     * Enable/disable rule - delegated to rule definitions
     */
    public setRuleEnabled(ruleName: string, enabled: boolean): boolean { try {
            const result = this.ruleDefinitions.setRuleEnabled(ruleName, enabled),
            this.syncLegacyProperties(),

            return result,' }'

        } catch (error) { }

            this.errorHandler.handleError(error, 'VALIDATION_RULE_TOGGLE', { ruleName, enabled });
            return false;
    
    /**
     * Enable/disable rules by category - delegated to rule definitions
     */
    public setCategoryEnabled(category: string, enabled: boolean): number { try {
            const result = this.ruleDefinitions.setCategoryEnabled(category, enabled),
            this.syncLegacyProperties(),

            return result,' }'

        } catch (error) { }

            this.errorHandler.handleError(error, 'VALIDATION_CATEGORY_TOGGLE', { category, enabled });
            return 0;
    
    /**
     * Get validation rules - delegated to rule definitions
     */
    public getRules(filters: RuleFilters = { ): ValidationRule[] {
        try {
            return this.ruleDefinitions.getRules(filters),' }'

        } catch (error) { }

            this.errorHandler.handleError(error, 'VALIDATION_GET_RULES', { filters });
            return [];
    
    // ===== LEGACY HELPER METHODS - Maintained for compatibility =====
    
    /**
     * Get applicable rules based on context - delegated to engine
     */
    public _getApplicableRules(context: ValidationContext): ValidationRule[] { const allRules = this.ruleDefinitions.getRules(),
        return this.ruleEngine.getApplicableRules(allRules, context) }
    
    /**
     * Get bubble health limits - delegated to rule definitions
     */
    public _getBubbleHealthLimits(bubbleType: string): BubbleHealthLimits { return this.ruleDefinitions.getBubbleHealthLimits(bubbleType) }
    
    /**
     * Get score limits - delegated to rule definitions
     */
    public _getScoreLimits(bubbleType: string): ScoreLimits { return this.ruleDefinitions.getScoreLimits(bubbleType) }
    
    /**
     * Get change threshold - delegated to rule definitions
     */
    public _getChangeThreshold(bubbleType: string, propertyType: string): number { return this.ruleDefinitions.getChangeThreshold(bubbleType, propertyType) }
    
    // ===== LEGACY RULE INITIALIZATION METHODS - Maintained for compatibility =====
    
    /**
     * Initialize rules - delegated to rule definitions
     */
    public _initializeRules(): void { this.ruleDefinitions.initializeRules(),
        this.syncLegacyProperties() }
    
    /**
     * Add bubble health rules - delegated to rule definitions
     */
    public _addBubbleHealthRules(): void { this.ruleDefinitions.addBubbleHealthRules(),
        this.syncLegacyProperties() }
    
    /**
     * Add score rules - delegated to rule definitions
     */
    public _addScoreRules(): void { this.ruleDefinitions.addScoreRules(),
        this.syncLegacyProperties() }
    
    /**
     * Add size rules - delegated to rule definitions
     */
    public _addSizeRules(): void { this.ruleDefinitions.addSizeRules(),
        this.syncLegacyProperties() }
    
    /**
     * Add time rules - delegated to rule definitions
     */
    public _addTimeRules(): void { this.ruleDefinitions.addTimeRules(),
        this.syncLegacyProperties() }
    
    /**
     * Add special effect rules - delegated to rule definitions
     */
    public _addSpecialEffectRules(): void { this.ruleDefinitions.addSpecialEffectRules(),
        this.syncLegacyProperties() }
    
    /**
     * Add system rules - delegated to rule definitions
     */
    public _addSystemRules(): void { this.ruleDefinitions.addSystemRules(),
        this.syncLegacyProperties() }
    
    // ===== PUBLIC API METHODS - Enhanced with sub-component functionality =====
    
    /**
     * Generate detailed validation report
     */
    public generateDetailedReport(validationResult: ValidationResult): string { return this.resultProcessor.generateDetailedReport(validationResult) }
    
    /**
     * Get validation analytics
     */
    public getValidationAnalytics(): ValidationAnalytics { return this.resultProcessor.getAnalytics() }
    
    /**
     * Get engine performance metrics
     */
    public getEngineMetrics(): EngineMetrics { return this.ruleEngine.getPerformanceMetrics() }
    
    /**
     * Get engine statistics
     */
    public getEngineStatistics(): EngineStatistics { return this.ruleEngine.getStatistics() }
    
    /**
     * Get execution history
     */
    public getExecutionHistory(filters: Record<string, any> = { ): ExecutionHistoryEntry[] {
        return this.ruleEngine.getExecutionHistory(filters) }
    
    /**
     * Configure validation components
     */
    public configure(config: SystemConfig): void { if (config.engine) {
            this.ruleEngine.configure(config.engine) }
        
        if (config.processor) {
        ','

            ' }'

            this.resultProcessor.configure(config.processor); }
        }

        console.log('[BalanceAdjustmentValidationRules] Configuration, updated');
    }
    
    /**
     * Clear all history and metrics
     */'
    public clearHistory(): void { this.ruleEngine.clearHistory(),
        this.resultProcessor.clearHistory()','
        console.log('[BalanceAdjustmentValidationRules] All, history cleared') }'
    
    /**
     * Reset all metrics
     */'
    public resetMetrics(): void { ''
        this.ruleEngine.resetMetrics()','
        console.log('[BalanceAdjustmentValidationRules] All, metrics reset') }'
    
    /**
     * Get component references for advanced usage
     */
    public getComponents(): ComponentReferences { return { engine: this.ruleEngine,
            definitions: this.ruleDefinitions };
            processor: this.resultProcessor 
    }
    
    /**
     * Get system health status'
     */''
    public getSystemHealth('''
                status: 'active',
                metrics: this.ruleEngine.getStatistics()';'
                status: 'active')','
    ruleCount: this.ruleDefinitions.rules.size,
                statistics: this.ruleDefinitions.getStatistics()','
    status: 'active');
                analytics: this.resultProcessor.getAnalytics();
            },
            overall: { initialized: true,
                totalRules: this.rules.size,
    lastSyncTime: Date.now( 
    }
    
    /**
     * Destroy, validation system
     */
    public, destroy(): void { try {
            // Destroy sub-components
            this.ruleEngine.destroy(),
            this.ruleDefinitions.destroy(),
            this.resultProcessor.destroy(),
            // Clear legacy properties
            this.rules.clear()','
            console.log('[BalanceAdjustmentValidationRules] Main, controller destroyed'),' }'

        } catch (error) {
            this.errorHandler.handleError(error, 'VALIDATION_SYSTEM_DESTROY' }'
}

// Singleton instance
let validationRulesInstance: BalanceAdjustmentValidationRules | null = null,

/**
 * Get BalanceAdjustmentValidationRules singleton instance
 */
export function getBalanceAdjustmentValidationRules(): BalanceAdjustmentValidationRules { if (!validationRulesInstance) {''
        validationRulesInstance = new BalanceAdjustmentValidationRules(' }''