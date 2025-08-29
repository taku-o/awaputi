/**
 * ValidationRuleEngine - Core validation logic and rule execution functionality
 * Part of the BalanceAdjustmentValidationRules split implementation
 */

export class ValidationRuleEngine {
    constructor(mainController) {
        this.mainController = mainController;
        
        // Rule execution state
        this.executionHistory = [];
        this.maxHistorySize = 100;
        
        // Performance tracking
        this.performanceMetrics = {
            totalExecutions: 0,
            totalExecutionTime: 0,
            averageExecutionTime: 0,
            slowRules: new Map()
        };
        
        console.log('[ValidationRuleEngine] Rule engine component initialized');
    }
    
    /**
     * Execute validation rule
     * @param {Object} rule - Rule definition
     * @param {*} oldValue - Old value
     * @param {*} newValue - New value
     * @param {Object} context - Validation context
     * @returns {Object} Rule execution result
     */
    executeRule(rule, oldValue, newValue, context) {
        const startTime = performance.now();
        let executionResult;
        
        try {
            // Validate rule structure
            if (!this.validateRuleStructure(rule)) {
                return {
                    valid: false,
                    message: `Invalid rule structure: ${rule.name || 'unknown'}`,
                    executionTime: 0,
                    error: true
                };
            }
            
            // Execute rule check function
            const ruleResult = rule.check(oldValue, newValue, context);
            
            // Validate result structure
            const validatedResult = this.validateRuleResult(ruleResult);
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            // Record execution metrics
            this.recordExecution(rule, executionTime, validatedResult.valid);
            
            executionResult = {
                ...validatedResult,
                executionTime,
                error: false
            };
            
        } catch (error) {
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            console.error(`[ValidationRuleEngine] Rule execution error: ${rule.name}`, error);
            
            // Record failed execution
            this.recordExecution(rule, executionTime, false, error);
            
            executionResult = {
                valid: false,
                message: `Rule execution failed: ${error.message}`,
                executionTime,
                error: true,
                originalError: error
            };
        }
        
        // Add execution history
        this.addToHistory({
            ruleName: rule.name,
            oldValue,
            newValue,
            context: this.sanitizeContext(context),
            result: executionResult,
            timestamp: Date.now()
        });
        
        return executionResult;
    }
    
    /**
     * Execute multiple rules in sequence
     * @param {Array} rules - Array of rule definitions
     * @param {*} oldValue - Old value
     * @param {*} newValue - New value
     * @param {Object} context - Validation context
     * @returns {Array} Array of rule execution results
     */
    executeRules(rules, oldValue, newValue, context) {
        const results = [];
        let totalExecutionTime = 0;
        
        for (const rule of rules) {
            if (!rule.enabled) {
                results.push({
                    ruleName: rule.name,
                    skipped: true,
                    reason: 'Rule disabled'
                });
                continue;
            }
            
            const result = this.executeRule(rule, oldValue, newValue, context);
            
            results.push({
                ruleName: rule.name,
                category: rule.category,
                severity: rule.severity,
                ...result
            });
            
            totalExecutionTime += result.executionTime || 0;
            
            // Early termination for critical failures
            if (result.error && rule.severity === 'critical') {
                console.warn(`[ValidationRuleEngine] Critical rule failure, terminating: ${rule.name}`);
                break;
            }
        }
        
        return {
            results,
            summary: {
                totalRules: rules.length,
                executed: results.filter(r => !r.skipped).length,
                skipped: results.filter(r => r.skipped).length,
                passed: results.filter(r => r.valid === true).length,
                failed: results.filter(r => r.valid === false).length,
                errors: results.filter(r => r.error === true).length,
                totalExecutionTime
            }
        };
    }
    
    /**
     * Validate rule structure
     * @param {Object} rule - Rule to validate
     * @returns {boolean} Validation result
     */
    validateRuleStructure(rule) {
        if (!rule || typeof rule !== 'object') {
            return false;
        }
        
        // Required fields
        const requiredFields = ['name', 'check'];
        for (const field of requiredFields) {
            if (!rule[field]) {
                console.error(`[ValidationRuleEngine] Missing required field: ${field}`);
                return false;
            }
        }
        
        // Validate check function
        if (typeof rule.check !== 'function') {
            console.error(`[ValidationRuleEngine] Check must be a function: ${rule.name}`);
            return false;
        }
        
        // Validate optional fields
        if (rule.severity && !['low', 'medium', 'high', 'critical', 'warning'].includes(rule.severity)) {
            console.warn(`[ValidationRuleEngine] Invalid severity: ${rule.severity}`);
        }
        
        if (rule.autoFix && rule.autoFixFn && typeof rule.autoFixFn !== 'function') {
            console.error(`[ValidationRuleEngine] AutoFixFn must be a function: ${rule.name}`);
            return false;
        }
        
        return true;
    }
    
    /**
     * Validate rule result structure
     * @param {*} result - Rule execution result
     * @returns {Object} Validated result
     */
    validateRuleResult(result) {
        // Handle simple boolean result
        if (typeof result === 'boolean') {
            return { valid: result };
        }
        
        // Handle object result
        if (result && typeof result === 'object') {
            const validatedResult = {
                valid: result.valid === true,
                message: result.message || '',
                severity: result.severity || undefined,
                suggestion: result.suggestion || undefined,
                metadata: result.metadata || undefined
            };
            
            // Remove undefined values
            Object.keys(validatedResult).forEach(key => {
                if (validatedResult[key] === undefined) {
                    delete validatedResult[key];
                }
            });
            
            return validatedResult;
        }
        
        // Fallback for invalid result
        console.warn('[ValidationRuleEngine] Invalid rule result format, treating as failure');
        return {
            valid: false,
            message: 'Rule returned invalid result format'
        };
    }
    
    /**
     * Record rule execution metrics
     * @param {Object} rule - Rule definition
     * @param {number} executionTime - Execution time in milliseconds
     * @param {boolean} success - Whether execution was successful
     * @param {Error} error - Optional error object
     */
    recordExecution(rule, executionTime, success, error = null) {
        this.performanceMetrics.totalExecutions++;
        this.performanceMetrics.totalExecutionTime += executionTime;
        this.performanceMetrics.averageExecutionTime = 
            this.performanceMetrics.totalExecutionTime / this.performanceMetrics.totalExecutions;
        
        // Track slow rules (>10ms)
        if (executionTime > 10) {
            const slowRuleData = this.performanceMetrics.slowRules.get(rule.name) || {
                count: 0,
                totalTime: 0,
                averageTime: 0,
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
            console.warn(`[ValidationRuleEngine] Slow rule execution: ${rule.name} (${executionTime.toFixed(2)}ms)`);
        }
        
        // Log errors
        if (error) {
            console.error(`[ValidationRuleEngine] Rule execution error: ${rule.name}`, {
                executionTime,
                error: error.message,
                stack: error.stack
            });
        }
    }
    
    /**
     * Add execution to history
     * @param {Object} execution - Execution record
     */
    addToHistory(execution) {
        this.executionHistory.push(execution);
        
        // Maintain history size limit
        if (this.executionHistory.length > this.maxHistorySize) {
            this.executionHistory.shift();
        }
    }
    
    /**
     * Sanitize context for history storage
     * @param {Object} context - Original context
     * @returns {Object} Sanitized context
     */
    sanitizeContext(context) {
        if (!context || typeof context !== 'object') {
            return {};
        }
        
        // Remove potentially large or sensitive data
        const sanitized = { ...context };
        
        // Remove functions
        Object.keys(sanitized).forEach(key => {
            if (typeof sanitized[key] === 'function') {
                delete sanitized[key];
            }
        });
        
        // Limit relatedValues size
        if (sanitized.relatedValues && typeof sanitized.relatedValues === 'object') {
            const keys = Object.keys(sanitized.relatedValues);
            if (keys.length > 20) {
                sanitized.relatedValues = Object.keys(sanitized.relatedValues).slice(0, 20)
                    .reduce((obj, key) => {
                        obj[key] = sanitized.relatedValues[key];
                        return obj;
                    }, {});
            }
        }
        
        return sanitized;
    }
    
    /**
     * Get applicable rules based on context
     * @param {Array} allRules - All available rules
     * @param {Object} context - Validation context
     * @returns {Array} Filtered applicable rules
     */
    getApplicableRules(allRules, context) {
        const applicableRules = [];
        
        for (const rule of allRules) {
            if (!rule.enabled) continue;
            
            // Apply context-based filters
            if (this.isRuleApplicable(rule, context)) {
                applicableRules.push(rule);
            }
        }
        
        // Sort by priority (higher priority first)
        applicableRules.sort((a, b) => (b.priority || 1) - (a.priority || 1));
        
        return applicableRules;
    }
    
    /**
     * Check if rule is applicable to current context
     * @param {Object} rule - Rule definition
     * @param {Object} context - Validation context
     * @returns {boolean} Whether rule is applicable
     */
    isRuleApplicable(rule, context) {
        // Bubble type specific rules
        if (rule.name.includes('boss_') && context.bubbleType !== 'boss') {
            return false;
        }
        
        if (rule.name.includes('electric_') && context.bubbleType !== 'electric') {
            return false;
        }
        
        if (rule.name.includes('rainbow_') && context.bubbleType !== 'rainbow') {
            return false;
        }
        
        if (rule.name.includes('golden_') && context.bubbleType !== 'golden') {
            return false;
        }
        
        // Property type specific rules
        if (rule.name.includes('health_') && context.propertyType !== 'health') {
            return false;
        }
        
        if (rule.name.includes('score_') && context.propertyType !== 'score') {
            return false;
        }
        
        if (rule.name.includes('size_') && context.propertyType !== 'size') {
            return false;
        }
        
        if (rule.name.includes('time_') && 
            !['maxAge', 'duration'].includes(context.propertyType) &&
            !context.propertyType.includes('Time')) {
            return false;
        }
        
        // Category-based applicability
        if (rule.category === this.mainController.ruleCategories?.PERFORMANCE && 
            !context.checkPerformance) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Get execution history
     * @param {Object} filters - Optional filters
     * @returns {Array} Execution history
     */
    getExecutionHistory(filters = {}) {
        let history = [...this.executionHistory];
        
        if (filters.ruleName) {
            history = history.filter(h => h.ruleName === filters.ruleName);
        }
        
        if (filters.success !== undefined) {
            history = history.filter(h => h.result.valid === filters.success);
        }
        
        if (filters.timeRange) {
            history = history.filter(h => 
                h.timestamp >= filters.timeRange.start && 
                h.timestamp <= filters.timeRange.end
            );
        }
        
        if (filters.limit) {
            history = history.slice(-filters.limit);
        }
        
        return history;
    }
    
    /**
     * Get performance metrics
     * @returns {Object} Performance metrics
     */
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            slowRules: Object.fromEntries(this.performanceMetrics.slowRules),
            historySize: this.executionHistory.length
        };
    }
    
    /**
     * Optimize rule execution order
     * @param {Array} rules - Rules to optimize
     * @returns {Array} Optimized rule order
     */
    optimizeRuleOrder(rules) {
        // Sort rules by execution characteristics for optimal performance
        return rules.sort((a, b) => {
            // Fast rules first
            const aSlowData = this.performanceMetrics.slowRules.get(a.name);
            const bSlowData = this.performanceMetrics.slowRules.get(b.name);
            
            const aAvgTime = aSlowData?.averageTime || 0;
            const bAvgTime = bSlowData?.averageTime || 0;
            
            // Critical rules first
            if (a.severity === 'critical' && b.severity !== 'critical') return -1;
            if (b.severity === 'critical' && a.severity !== 'critical') return 1;
            
            // High priority rules first
            const aPriority = a.priority || 1;
            const bPriority = b.priority || 1;
            if (aPriority !== bPriority) return bPriority - aPriority;
            
            // Faster rules first
            return aAvgTime - bAvgTime;
        });
    }
    
    /**
     * Clear execution history
     */
    clearHistory() {
        this.executionHistory = [];
        console.log('[ValidationRuleEngine] Execution history cleared');
    }
    
    /**
     * Reset performance metrics
     */
    resetMetrics() {
        this.performanceMetrics = {
            totalExecutions: 0,
            totalExecutionTime: 0,
            averageExecutionTime: 0,
            slowRules: new Map()
        };
        console.log('[ValidationRuleEngine] Performance metrics reset');
    }
    
    /**
     * Configure engine settings
     * @param {Object} config - Configuration options
     */
    configure(config) {
        if (config.maxHistorySize !== undefined) {
            this.maxHistorySize = Math.max(10, Math.min(1000, config.maxHistorySize));
        }
        
        console.log('[ValidationRuleEngine] Configuration updated');
    }
    
    /**
     * Get engine statistics
     * @returns {Object} Engine statistics
     */
    getStatistics() {
        const metrics = this.getPerformanceMetrics();
        
        return {
            executionHistory: {
                size: this.executionHistory.length,
                maxSize: this.maxHistorySize
            },
            performance: {
                totalExecutions: metrics.totalExecutions,
                averageExecutionTime: metrics.averageExecutionTime,
                slowRulesCount: Object.keys(metrics.slowRules).length
            },
            rules: {
                slowestRule: this.getSlowgestRule(),
                fastestRule: this.getFastestRule()
            }
        };
    }
    
    /**
     * Get slowest rule
     * @returns {Object|null} Slowest rule data
     */
    getSlowgestRule() {
        let slowest = null;
        let maxTime = 0;
        
        for (const [ruleName, data] of this.performanceMetrics.slowRules) {
            if (data.maxTime > maxTime) {
                maxTime = data.maxTime;
                slowest = { name: ruleName, ...data };
            }
        }
        
        return slowest;
    }
    
    /**
     * Get fastest rule (among rules with execution data)
     * @returns {Object|null} Fastest rule data
     */
    getFastestRule() {
        let fastest = null;
        let minTime = Infinity;
        
        for (const [ruleName, data] of this.performanceMetrics.slowRules) {
            if (data.averageTime < minTime) {
                minTime = data.averageTime;
                fastest = { name: ruleName, ...data };
            }
        }
        
        return fastest;
    }
    
    /**
     * Cleanup engine resources
     */
    destroy() {
        this.clearHistory();
        this.resetMetrics();
        console.log('[ValidationRuleEngine] Engine destroyed');
    }
}