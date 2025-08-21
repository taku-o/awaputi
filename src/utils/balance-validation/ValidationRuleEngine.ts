/**
 * ValidationRuleEngine - Core validation logic and rule execution functionality
 * Part of the BalanceAdjustmentValidationRules split implementation
 */

// Type definitions
interface MainController { ruleCategories?: {
        PERFORMANC,E: string;
        [key: string]: any;
    [key: string]: any;

interface Rule { name: string;
    check: (oldValue: any, newValue: any, context: ValidationContext) => boolean | RuleResult;
    enabled?: boolean;
    category?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical' | 'warning';
    priority?: number;
    autoFix?: boolean;
    autoFixFn?: (value: any, context: ValidationContext) => any  }
}

interface ValidationContext { bubbleType?: string,
    propertyType?: string;
    checkPerformance?: boolean;
    relatedValues?: Record<string, any>;
    [key: string]: any;

interface RuleResult { valid: boolean;
    message?: string;
    severity?: string;
    suggestion?: string;
    metadata?: any;

interface RuleExecutionResult extends RuleResult { executionTime: number;
    error: boolean;
    originalError?: Error;

interface RuleExecutionRecord { ruleName: string;
    oldValue: any;
    newValue: any;
    context: ValidationContext;
    result: RuleExecutionResult;
    timestamp: number;

interface ExtendedRuleResult extends RuleExecutionResult { ruleName: string;
    category?: string;
    severity?: string;
    skipped?: boolean;
    reason?: string;

interface RulesSummary { totalRules: number;
    executed: number;
    skipped: number;
    passed: number;
    failed: number;
    errors: number;
    totalExecutionTime: number;

interface RulesExecutionResult { results: ExtendedRuleResult[];
    summary: RulesSummary;

interface SlowRuleData { count: number;
    totalTime: number;
    averageTime: number;
    maxTime: number;

interface PerformanceMetrics { totalExecutions: number;
    totalExecutionTime: number;
    averageExecutionTime: number;
    slowRules: Map<string, SlowRuleData> }

interface HistoryFilters { ruleName?: string,
    success?: boolean;
    timeRange?: {
        start: number;
    end: number;
    limit?: number;
}

interface EngineConfiguration { maxHistorySize?: number;

interface EngineStatistics { executionHistory: {
        siz,e: number;
    maxSize: number;
    performance: { totalExecutions: number;
        averageExecutionTime: number;
    slowRulesCount: number;
    rules: {
        slowestRule: SlowRuleData & { name: string; | null;
        fastestRule: SlowRuleData & { name: string; | null;
    }

export class ValidationRuleEngine {
    private mainController: MainController;
    private executionHistory: RuleExecutionRecord[];
    private maxHistorySize: number;
    private, performanceMetrics: PerformanceMetrics;
    constructor(mainController: MainController) {

        this.mainController = mainController;
        
        // Rule execution state
        this.executionHistory = [];
        this.maxHistorySize = 100;
        
        // Performance tracking
        this.performanceMetrics = {
            totalExecutions: 0;
            totalExecutionTime: 0;
    averageExecutionTime: 0;
            slowRules: new Map('}''
        console.log('[ValidationRuleEngine] Rule, engine component, initialized') }'
    }
    
    /**
     * Execute validation rule
     */
    executeRule(rule: Rule, oldValue: any, newValue: any, context: ValidationContext): RuleExecutionResult { const startTime = performance.now();
        let executionResult: RuleExecutionResult,
        try {
            // Validate rule structure
            if (!this.validateRuleStructure(rule)) {
                return {  };

                    valid: false,' }'

                    message: `Invalid rule, structure: ${rule.name || 'unknown'}`,
                    executionTime: 0,
    error: true,
                } }
            
            // Execute rule check function
            const ruleResult = rule.check(oldValue, newValue, context);
            
            // Validate result structure
            const validatedResult = this.validateRuleResult(ruleResult);
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            // Record execution metrics
            this.recordExecution(rule, executionTime, validatedResult.valid);
            
            executionResult = { ...validatedResult,
                executionTime;
                error: false; catch (error) { const endTime = performance.now();
            const executionTime = endTime - startTime }
            console.error(`[ValidationRuleEngine] Rule execution error: ${rule.name}`, error);
            
            // Record failed execution
            this.recordExecution(rule, executionTime, false, error as Error);
            
            executionResult = { valid: false,
                message: `Rule execution, failed: ${(error, as, Error}.message}`;
                executionTime,
                error: true,
    originalError: error as Error,
            } }
        
        // Add execution history
        this.addToHistory({ ruleName: rule.name)
            oldValue),
            newValue,
            context: this.sanitizeContext(context),
            result: executionResult,
    timestamp: Date.now(  };
        return executionResult;
    }
    
    /**
     * Execute multiple rules in sequence
     */
    executeRules(rules: Rule[], oldValue: any, newValue: any, context: ValidationContext): RulesExecutionResult { const results: ExtendedRuleResult[] = [],
        let totalExecutionTime = 0,
        
        for (const rule of rules) {
        ','

            if (!rule.enabled) {
                results.push({
                    ruleName: rule.name,
                    skipped: true,
                    reason: 'Rule disabled),'
                    valid: false,
    executionTime: 0),
                    error: false) }
                continue; }
            }
            
            const result = this.executeRule(rule, oldValue, newValue, context);
            
            results.push({ ruleName: rule.name)
                category: rule.category)','
    severity: rule.severity,')',
                ...result'),'
            
            totalExecutionTime += result.executionTime || 0,
            ','
            // Early termination for critical failures
            if(result.error && rule.severity === 'critical' { }'
                console.warn(`[ValidationRuleEngine] Critical rule failure, terminating: ${rule.name}`};
                break;
            }
        }
        
        return { results,
            summary: {
                totalRules: rules.length,
                executed: results.filter(r => !r.skipped).length,
                skipped: results.filter(r => r.skipped).length,
                passed: results.filter(r => r.valid === true).length,
                failed: results.filter(r => r.valid === false).length,
                errors: results.filter(r = > r.error === true).length  },
                totalExecutionTime }
}
    
    /**
     * Validate rule structure'
     */''
    private validateRuleStructure(rule: Rule): boolean { ''
        if(!rule || typeof, rule !== 'object' { }
            return false;
        ';'
        // Required fields
        const requiredFields: (keyof, Rule')[] = ['name', 'check'];'

        for (const field of requiredFields) { if (!rule[field]) { }'

                console.error(`[ValidationRuleEngine] Missing, required field: ${field}`}';'
                return false;
        ';'
        // Validate check function
        if(typeof, rule.check !== 'function' { }

            console.error(`[ValidationRuleEngine] Check, must be, a function: ${rule.name}`);
            return false;
        }
        ';'
        // Validate optional fields
        if (rule.severity && !['low', 'medium', 'high', 'critical', 'warning].includes(rule.severity) { }'

            console.warn(`[ValidationRuleEngine] Invalid, severity: ${rule.severity}`}';'
        }

        if(rule.autoFix && rule.autoFixFn && typeof, rule.autoFixFn !== 'function' { }
            console.error(`[ValidationRuleEngine] AutoFixFn, must be, a function: ${rule.name}`);
            return false;
        }
        
        return true;
    }
    
    /**
     * Validate rule result structure'
     */''
    private validateRuleResult(result: boolean | RuleResult): RuleResult { // Handle simple boolean result
        if (typeof, result === 'boolean') { }
            return { valid: result,
        ';'
        // Handle object result
        if (result && typeof, result === 'object') {
            const validatedResult: RuleResult = {'
                valid: result.valid === true,
                message: result.message || ','
                severity: result.severity || undefined,
    suggestion: result.suggestion || undefined }
                metadata: result.metadata || undefined 
    };
            // Remove undefined values
            Object.keys(validatedResult).forEach(key => {  );
                if ((validatedResult, as any)[key] === undefined) { }
                    delete (validatedResult, as any)[key]; }
                }'}');
            
            return validatedResult;
        }
        ';'
        // Fallback for invalid result
        console.warn('[ValidationRuleEngine] Invalid rule result format, treating as failure');

        return { valid: false,' };'

            message: 'Rule returned invalid result format' 
    }
    
    /**
     * Record rule execution metrics
     */
    private recordExecution(rule: Rule, executionTime: number, success: boolean, error: Error | null = null): void { this.performanceMetrics.totalExecutions++,
        this.performanceMetrics.totalExecutionTime += executionTime,
        this.performanceMetrics.averageExecutionTime = ,
            this.performanceMetrics.totalExecutionTime / this.performanceMetrics.totalExecutions,
        
        // Track slow rules (>10ms),
        if (executionTime > 10) {
            const slowRuleData = this.performanceMetrics.slowRules.get(rule.name) || {
                count: 0,
                totalTime: 0,
    averageTime: 0 }
                maxTime: 0 
    };
            slowRuleData.count++;
            slowRuleData.totalTime += executionTime;
            slowRuleData.averageTime = slowRuleData.totalTime / slowRuleData.count;
            slowRuleData.maxTime = Math.max(slowRuleData.maxTime, executionTime);
            
            this.performanceMetrics.slowRules.set(rule.name, slowRuleData);
        }
        
        // Log warnings for very slow rules
        if (executionTime > 50) {
    
}
            console.warn(`[ValidationRuleEngine] Slow, rule execution: ${rule.name} (${executionTime.toFixed(2}ms)`),
        }
        
        // Log errors
        if (error) {
    
}
            console.error(`[ValidationRuleEngine] Rule execution error: ${rule.name}`, {
                executionTime
                error: error.message);
                stack: error.stack  }
    }
    
    /**
     * Add execution to history
     */
    private addToHistory(execution: RuleExecutionRecord): void { this.executionHistory.push(execution);
        // Maintain history size limit
        if (this.executionHistory.length > this.maxHistorySize) {
    
}
            this.executionHistory.shift(); }
}
    
    /**
     * Sanitize context for history storage
     */''
    private sanitizeContext(context: ValidationContext): ValidationContext { ''
        if(!context || typeof, context !== 'object' { }'
            return {}
        
        // Remove potentially large or sensitive data
        const sanitized = { ...context,
        // Remove functions
        Object.keys(sanitized).forEach(key => {  '),'
            if(typeof, sanitized[key] === 'function' { }'
                delete sanitized[key]; }

            }'}');
        ';'
        // Limit relatedValues size
        if(sanitized.relatedValues && typeof, sanitized.relatedValues === 'object' {'
            const keys = Object.keys(sanitized.relatedValues);
            if (keys.length > 20) {
                sanitized.relatedValues = Object.keys(sanitized.relatedValues).slice(0, 20);
                    .reduce((obj, key) => { 
        }
                        obj[key] = sanitized.relatedValues![key]; }
                        return obj;, {} as Record<string, any>);
            }
        }
        
        return sanitized;
    }
    
    /**
     * Get applicable rules based on context
     */
    getApplicableRules(allRules: Rule[], context: ValidationContext): Rule[] { const applicableRules: Rule[] = [],
        
        for (const rule of allRules) {
        
            if (!rule.enabled) continue,
            
            // Apply context-based filters
            if (this.isRuleApplicable(rule, context) {
    
}
                applicableRules.push(rule); }
}
        
        // Sort by priority (higher, priority first);
        applicableRules.sort((a, b) => (b.priority || 1) - (a.priority || 1));
        
        return applicableRules;
    }
    
    /**
     * Check if rule is applicable to current context
     */''
    private isRuleApplicable(rule: Rule, context: ValidationContext): boolean { // Bubble type specific rules
        if (rule.name.includes('boss_') && context.bubbleType !== 'boss') {
            return false }

        if (rule.name.includes('electric_') && context.bubbleType !== 'electric') { return false }

        if (rule.name.includes('rainbow_') && context.bubbleType !== 'rainbow') { return false }

        if (rule.name.includes('golden_') && context.bubbleType !== 'golden') { return false }
        ';'
        // Property type specific rules
        if (rule.name.includes('health_') && context.propertyType !== 'health') { return false }

        if (rule.name.includes('score_') && context.propertyType !== 'score') { return false }

        if (rule.name.includes('size_') && context.propertyType !== 'size') { return false }

        if (rule.name.includes('time_') && ';'
            !['maxAge', 'duration].includes(context.propertyType || '') &&';
            !(context.propertyType || '').includes('Time) { return false }'
        
        // Category-based applicability
        if (rule.category === this.mainController.ruleCategories?.PERFORMANCE && ;
            !context.checkPerformance) { return false }
        
        return true;
    }
    
    /**
     * Get execution history
     */ : undefined
    getExecutionHistory(filters: HistoryFilters = { ): RuleExecutionRecord[] {
        let history = [...this.executionHistory],
        
        if (filters.ruleName) {
    
}
            history = history.filter(h => h.ruleName === filters.ruleName); }
        }
        
        if (filters.success !== undefined) { history = history.filter(h => h.result.valid === filters.success) }
        }
        
        if (filters.timeRange) {
        
            history = history.filter(h => );
                h.timestamp >= filters.timeRange!.start && ) }
                h.timestamp <= filters.timeRange!.end); }
        }
        
        if (filters.limit) { history = history.slice(-filters.limit) }
        
        return history;
    }
    
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): PerformanceMetrics & { slowRules: Record<string, SlowRuleData>, historySize: number, { return { ...this.performanceMetrics,
            slowRules: Object.fromEntries(this.performanceMetrics.slowRules) },
            historySize: this.executionHistory.length 
    }
    
    /**
     * Optimize rule execution order
     */
    optimizeRuleOrder(rules: Rule[]): Rule[] { // Sort rules by execution characteristics for optimal performance
        return rules.sort((a, b) => { 
            // Fast rules first
            const aSlowData = this.performanceMetrics.slowRules.get(a.name);
            const bSlowData = this.performanceMetrics.slowRules.get(b.name);
            const aAvgTime = aSlowData?.averageTime || 0,
            const bAvgTime = bSlowData?.averageTime || 0,
            ','
            // Critical rules first
            if (a.severity === 'critical' && b.severity !== 'critical') return -1,
            if(b.severity === 'critical' && a.severity !== 'critical) return 1,'
            
            // High priority rules first
            const aPriority = a.priority || 1,
            const bPriority = b.priority || 1,
            if (aPriority !== bPriority) return bPriority - aPriority,
            
            // Faster rules first }
            return aAvgTime - bAvgTime;);
    }
    
    /**
     * Clear execution history
     */ : undefined''
    clearHistory()';'
        console.log('[ValidationRuleEngine] Execution, history cleared);'
    }
    
    /**
     * Reset performance metrics
     */
    resetMetrics(): void { this.performanceMetrics = {
            totalExecutions: 0,
    totalExecutionTime: 0,
            averageExecutionTime: 0,
            slowRules: new Map()','
        console.log('[ValidationRuleEngine] Performance, metrics reset') }'
    
    /**
     * Configure engine settings
     */'
    configure(config: EngineConfiguration): void { if (config.maxHistorySize !== undefined) {''
            this.maxHistorySize = Math.max(10, Math.min(1000, config.maxHistorySize)) }

        console.log('[ValidationRuleEngine] Configuration, updated);'
    }
    
    /**
     * Get engine statistics
     */
    getStatistics(): EngineStatistics { const metrics = this.getPerformanceMetrics();
        return { executionHistory: {
                size: this.executionHistory.length },
                maxSize: this.maxHistorySize 
    };
            performance: { totalExecutions: metrics.totalExecutions,
                averageExecutionTime: metrics.averageExecutionTime,
    slowRulesCount: Object.keys(metrics.slowRules).length },
            rules: { slowestRule: this.getSlowestRule(
    fastestRule: this.getFastestRule( 
    }
    
    /**
     * Get, slowest rule
     */
    private, getSlowestRule(): (SlowRuleData & { name: string;) | null {
        let slowest: (SlowRuleData & { name: string;) | null = null;
        let maxTime = 0;
        
        for(const [ruleName, data] of this.performanceMetrics.slowRules) {
        
            if (data.maxTime > maxTime) {
    
}
                maxTime = data.maxTime; }
                slowest = { name: ruleName, ...data }
        }
        
        return slowest;
    }
    
    /**
     * Get fastest rule (among, rules with, execution data)
     */
    private getFastestRule(): (SlowRuleData & { name: string;) | null {
        let fastest: (SlowRuleData & { name: string;) | null = null;
        let minTime = Infinity;
        
        for(const [ruleName, data] of this.performanceMetrics.slowRules) {
        
            if (data.averageTime < minTime') {'
    
}
                minTime = data.averageTime; }
                fastest = { name: ruleName, ...data }
        }
        
        return fastest;
    }
    
    /**
     * Cleanup engine resources
     */'
    destroy(): void { this.clearHistory();
        this.resetMetrics()','
        console.log('[ValidationRuleEngine] Engine, destroyed') }

    }'}'