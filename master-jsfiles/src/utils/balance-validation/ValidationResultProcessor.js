/**
 * ValidationResultProcessor - Result processing and validation outcome handling
 * Part of the BalanceAdjustmentValidationRules split implementation
 */

export class ValidationResultProcessor {
    constructor(mainController) {
        this.mainController = mainController;
        
        // Result processing configuration
        this.config = {
            enableDetailedReports: true,
            includePerformanceMetrics: true,
            maxSuggestions: 10,
            autoFixThreshold: 'medium' // Only auto-fix issues below this severity
        };
        
        // Result history for analytics
        this.resultHistory = [];
        this.maxHistorySize = 50;
        
        console.log('[ValidationResultProcessor] Result processor component initialized');
    }
    
    /**
     * Process validation results from rule execution
     * @param {Array} ruleResults - Array of rule execution results
     * @param {*} oldValue - Original value
     * @param {*} newValue - New value
     * @param {Object} context - Validation context
     * @returns {Object} Processed validation result
     */
    processResults(ruleResults, oldValue, newValue, context) {
        const startTime = performance.now();
        
        try {
            const processedResult = {
                valid: true,
                errors: [],
                warnings: [],
                suggestions: [],
                autoFixAvailable: false,
                autoFixedValue: newValue,
                rulesApplied: [],
                metadata: {
                    originalValue: oldValue,
                    requestedValue: newValue,
                    context: this.sanitizeContext(context),
                    processingTime: 0,
                    timestamp: Date.now()
                }
            };
            
            // Process each rule result
            for (const ruleResult of ruleResults) {
                if (ruleResult.skipped) {
                    continue;
                }
                
                this.processRuleResult(ruleResult, processedResult, context);
            }
            
            // Determine overall validity
            processedResult.valid = processedResult.errors.length === 0;
            
            // Process auto-fix if available and applicable
            if (this.shouldApplyAutoFix(processedResult)) {
                processedResult.autoFixedValue = this.processAutoFix(processedResult, oldValue, newValue, context);
            }
            
            // Generate summary
            processedResult.summary = this.generateSummary(processedResult, ruleResults);
            
            // Add performance metrics
            const endTime = performance.now();
            processedResult.metadata.processingTime = endTime - startTime;
            
            // Store in history
            this.addToHistory(processedResult);
            
            return processedResult;
            
        } catch (error) {
            console.error('[ValidationResultProcessor] Error processing results:', error);
            
            return {
                valid: false,
                errors: [{
                    rule: 'system',
                    message: `Result processing failed: ${error.message}`,
                    severity: 'high',
                    category: 'system'
                }],
                warnings: [],
                suggestions: [],
                autoFixAvailable: false,
                autoFixedValue: newValue,
                rulesApplied: [],
                metadata: {
                    originalValue: oldValue,
                    requestedValue: newValue,
                    processingTime: performance.now() - startTime,
                    error: error.message,
                    timestamp: Date.now()
                }
            };
        }
    }
    
    /**
     * Process individual rule result
     * @param {Object} ruleResult - Rule execution result
     * @param {Object} processedResult - Accumulated processed result
     * @param {Object} context - Validation context
     */
    processRuleResult(ruleResult, processedResult, context) {
        // Record rule application
        processedResult.rulesApplied.push({
            name: ruleResult.ruleName,
            category: ruleResult.category,
            result: ruleResult.valid ? 'passed' : 'failed',
            executionTime: ruleResult.executionTime,
            error: ruleResult.error || false
        });
        
        if (!ruleResult.valid) {
            const issue = {
                rule: ruleResult.ruleName,
                message: ruleResult.message || 'Validation failed',
                severity: ruleResult.severity || 'medium',
                category: ruleResult.category || 'general',
                executionTime: ruleResult.executionTime
            };
            
            // Classify as error or warning
            if (this.isWarningLevel(issue.severity)) {
                processedResult.warnings.push(issue);
            } else {
                processedResult.errors.push(issue);
            }
            
            // Add suggestion if available
            if (ruleResult.suggestion) {
                processedResult.suggestions.push({
                    rule: ruleResult.ruleName,
                    suggestion: ruleResult.suggestion,
                    severity: issue.severity
                });
            }
            
            // Check auto-fix availability
            if (this.isAutoFixEligible(ruleResult, issue)) {
                processedResult.autoFixAvailable = true;
            }
        }
        
        // Handle execution errors
        if (ruleResult.error) {
            processedResult.warnings.push({
                rule: ruleResult.ruleName,
                message: ruleResult.message || 'Rule execution error',
                severity: 'warning',
                category: 'system',
                originalError: ruleResult.originalError
            });
        }
    }
    
    /**
     * Check if severity level should be treated as warning
     * @param {string} severity - Severity level
     * @returns {boolean} Whether it's a warning level
     */
    isWarningLevel(severity) {
        return ['warning', 'low'].includes(severity);
    }
    
    /**
     * Check if rule result is eligible for auto-fix
     * @param {Object} ruleResult - Rule execution result
     * @param {Object} issue - Processed issue
     * @returns {boolean} Whether auto-fix is eligible
     */
    isAutoFixEligible(ruleResult, issue) {
        // Must have auto-fix function
        if (!ruleResult.autoFix || !ruleResult.autoFixFn) {
            return false;
        }
        
        // Check severity threshold
        const severityLevels = ['low', 'medium', 'high', 'critical'];
        const thresholdIndex = severityLevels.indexOf(this.config.autoFixThreshold);
        const issueSeverityIndex = severityLevels.indexOf(issue.severity);
        
        return issueSeverityIndex <= thresholdIndex;
    }
    
    /**
     * Determine if auto-fix should be applied
     * @param {Object} processedResult - Processed result
     * @returns {boolean} Whether to apply auto-fix
     */
    shouldApplyAutoFix(processedResult) {
        return processedResult.autoFixAvailable && 
               processedResult.errors.length === 0; // Only auto-fix warnings, not errors
    }
    
    /**
     * Process auto-fix for applicable issues
     * @param {Object} processedResult - Processed result
     * @param {*} oldValue - Original value
     * @param {*} newValue - New value
     * @param {Object} context - Validation context
     * @returns {*} Auto-fixed value
     */
    processAutoFix(processedResult, oldValue, newValue, context) {
        let fixedValue = newValue;
        const appliedFixes = [];
        
        try {
            // Get rules that contributed to warnings and have auto-fix
            const autoFixableIssues = processedResult.warnings.filter(warning => {
                const ruleApplied = processedResult.rulesApplied.find(r => r.name === warning.rule);
                return ruleApplied && this.isAutoFixEligible({ autoFix: true }, warning);
            });
            
            // Apply auto-fixes in order of severity (less severe first)
            const sortedIssues = autoFixableIssues.sort((a, b) => {
                const severityOrder = { 'low': 0, 'warning': 1, 'medium': 2, 'high': 3, 'critical': 4 };
                return severityOrder[a.severity] - severityOrder[b.severity];
            });
            
            for (const issue of sortedIssues) {
                // Find the corresponding rule with auto-fix function
                const rule = this.mainController.ruleDefinitions?.getRule(issue.rule);
                if (rule && rule.autoFix && rule.autoFixFn) {
                    try {
                        const previousValue = fixedValue;
                        fixedValue = rule.autoFixFn(oldValue, fixedValue, context);
                        
                        if (fixedValue !== previousValue) {
                            appliedFixes.push({
                                rule: issue.rule,
                                originalValue: previousValue,
                                fixedValue: fixedValue,
                                issue: issue.message
                            });
                        }
                    } catch (fixError) {
                        console.warn(`[ValidationResultProcessor] Auto-fix failed for rule ${issue.rule}:`, fixError);
                    }
                }
            }
            
            // Add fix information to metadata
            if (appliedFixes.length > 0) {
                processedResult.metadata.appliedFixes = appliedFixes;
                console.log(`[ValidationResultProcessor] Applied ${appliedFixes.length} auto-fixes`);
            }
            
        } catch (error) {
            console.error('[ValidationResultProcessor] Error applying auto-fix:', error);
        }
        
        return fixedValue;
    }
    
    /**
     * Generate validation summary
     * @param {Object} processedResult - Processed result
     * @param {Array} ruleResults - Original rule results
     * @returns {Object} Validation summary
     */
    generateSummary(processedResult, ruleResults) {
        const summary = {
            totalRules: ruleResults.length,
            executed: processedResult.rulesApplied.length,
            skipped: ruleResults.filter(r => r.skipped).length,
            passed: processedResult.rulesApplied.filter(r => r.result === 'passed').length,
            failed: processedResult.rulesApplied.filter(r => r.result === 'failed').length,
            errors: processedResult.errors.length,
            warnings: processedResult.warnings.length,
            suggestions: processedResult.suggestions.length,
            autoFixesAvailable: processedResult.autoFixAvailable,
            overallResult: processedResult.valid ? 'valid' : 'invalid'
        };
        
        // Performance summary
        const executionTimes = processedResult.rulesApplied
            .filter(r => r.executionTime !== undefined)
            .map(r => r.executionTime);
        
        if (executionTimes.length > 0) {
            summary.performance = {
                totalExecutionTime: executionTimes.reduce((sum, time) => sum + time, 0),
                averageExecutionTime: executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length,
                slowestRule: this.findSlowestRule(processedResult.rulesApplied),
                fastestRule: this.findFastestRule(processedResult.rulesApplied)
            };
        }
        
        // Severity breakdown
        summary.severityBreakdown = {
            critical: this.countBySeverity(processedResult.errors, 'critical'),
            high: this.countBySeverity([...processedResult.errors, ...processedResult.warnings], 'high'),
            medium: this.countBySeverity([...processedResult.errors, ...processedResult.warnings], 'medium'),
            low: this.countBySeverity(processedResult.warnings, 'low'),
            warning: this.countBySeverity(processedResult.warnings, 'warning')
        };
        
        // Category breakdown
        summary.categoryBreakdown = this.getCategoryBreakdown([...processedResult.errors, ...processedResult.warnings]);
        
        return summary;
    }
    
    /**
     * Find slowest rule
     * @param {Array} rulesApplied - Applied rules
     * @returns {Object|null} Slowest rule info
     */
    findSlowestRule(rulesApplied) {
        let slowest = null;
        let maxTime = 0;
        
        for (const rule of rulesApplied) {
            if (rule.executionTime && rule.executionTime > maxTime) {
                maxTime = rule.executionTime;
                slowest = { name: rule.name, executionTime: rule.executionTime };
            }
        }
        
        return slowest;
    }
    
    /**
     * Find fastest rule
     * @param {Array} rulesApplied - Applied rules
     * @returns {Object|null} Fastest rule info
     */
    findFastestRule(rulesApplied) {
        let fastest = null;
        let minTime = Infinity;
        
        for (const rule of rulesApplied) {
            if (rule.executionTime && rule.executionTime < minTime) {
                minTime = rule.executionTime;
                fastest = { name: rule.name, executionTime: rule.executionTime };
            }
        }
        
        return fastest;
    }
    
    /**
     * Count issues by severity
     * @param {Array} issues - Issues array
     * @param {string} severity - Severity level
     * @returns {number} Count
     */
    countBySeverity(issues, severity) {
        return issues.filter(issue => issue.severity === severity).length;
    }
    
    /**
     * Get category breakdown
     * @param {Array} issues - Issues array
     * @returns {Object} Category breakdown
     */
    getCategoryBreakdown(issues) {
        const breakdown = {};
        
        for (const issue of issues) {
            const category = issue.category || 'general';
            breakdown[category] = (breakdown[category] || 0) + 1;
        }
        
        return breakdown;
    }
    
    /**
     * Sanitize context for storage
     * @param {Object} context - Original context
     * @returns {Object} Sanitized context
     */
    sanitizeContext(context) {
        if (!context || typeof context !== 'object') {
            return {};
        }
        
        const sanitized = { ...context };
        
        // Remove functions
        Object.keys(sanitized).forEach(key => {
            if (typeof sanitized[key] === 'function') {
                delete sanitized[key];
            }
        });
        
        // Limit data size
        if (sanitized.relatedValues && typeof sanitized.relatedValues === 'object') {
            const keys = Object.keys(sanitized.relatedValues);
            if (keys.length > 10) {
                sanitized.relatedValues = keys.slice(0, 10).reduce((obj, key) => {
                    obj[key] = sanitized.relatedValues[key];
                    return obj;
                }, {});
            }
        }
        
        return sanitized;
    }
    
    /**
     * Add result to history
     * @param {Object} result - Validation result
     */
    addToHistory(result) {
        this.resultHistory.push({
            timestamp: result.metadata.timestamp,
            valid: result.valid,
            errorCount: result.errors.length,
            warningCount: result.warnings.length,
            processingTime: result.metadata.processingTime,
            rulesExecuted: result.rulesApplied.length,
            autoFixApplied: result.metadata.appliedFixes?.length || 0
        });
        
        // Maintain history size
        if (this.resultHistory.length > this.maxHistorySize) {
            this.resultHistory.shift();
        }
    }
    
    /**
     * Generate detailed report
     * @param {Object} result - Validation result
     * @returns {string} Detailed report
     */
    generateDetailedReport(result) {
        if (!this.config.enableDetailedReports) {
            return 'Detailed reporting is disabled';
        }
        
        const lines = [];
        lines.push('=== Validation Report ===');
        lines.push(`Overall Result: ${result.valid ? 'VALID' : 'INVALID'}`);
        lines.push(`Timestamp: ${new Date(result.metadata.timestamp).toISOString()}`);
        lines.push('');
        
        // Summary
        if (result.summary) {
            lines.push('Summary:');
            lines.push(`  Rules: ${result.summary.executed}/${result.summary.totalRules} executed`);
            lines.push(`  Passed: ${result.summary.passed}, Failed: ${result.summary.failed}`);
            lines.push(`  Errors: ${result.summary.errors}, Warnings: ${result.summary.warnings}`);
            lines.push('');
        }
        
        // Errors
        if (result.errors.length > 0) {
            lines.push('Errors:');
            result.errors.forEach((error, index) => {
                lines.push(`  ${index + 1}. [${error.severity.toUpperCase()}] ${error.rule}: ${error.message}`);
            });
            lines.push('');
        }
        
        // Warnings
        if (result.warnings.length > 0) {
            lines.push('Warnings:');
            result.warnings.forEach((warning, index) => {
                lines.push(`  ${index + 1}. [${warning.severity.toUpperCase()}] ${warning.rule}: ${warning.message}`);
            });
            lines.push('');
        }
        
        // Suggestions
        if (result.suggestions.length > 0) {
            lines.push('Suggestions:');
            result.suggestions.forEach((suggestion, index) => {
                lines.push(`  ${index + 1}. ${suggestion.rule}: ${suggestion.suggestion}`);
            });
            lines.push('');
        }
        
        // Auto-fixes
        if (result.metadata.appliedFixes && result.metadata.appliedFixes.length > 0) {
            lines.push('Applied Auto-fixes:');
            result.metadata.appliedFixes.forEach((fix, index) => {
                lines.push(`  ${index + 1}. ${fix.rule}: ${fix.originalValue} → ${fix.fixedValue}`);
                lines.push(`     Issue: ${fix.issue}`);
            });
            lines.push('');
        }
        
        // Performance
        if (result.summary?.performance) {
            lines.push('Performance:');
            lines.push(`  Total execution time: ${result.summary.performance.totalExecutionTime.toFixed(2)}ms`);
            lines.push(`  Average per rule: ${result.summary.performance.averageExecutionTime.toFixed(2)}ms`);
            if (result.summary.performance.slowestRule) {
                lines.push(`  Slowest rule: ${result.summary.performance.slowestRule.name} (${result.summary.performance.slowestRule.executionTime.toFixed(2)}ms)`);
            }
        }
        
        return lines.join('\n');
    }
    
    /**
     * Get result history analytics
     * @returns {Object} Analytics data
     */
    getAnalytics() {
        if (this.resultHistory.length === 0) {
            return { message: 'No validation history available' };
        }
        
        const recent = this.resultHistory.slice(-20); // Last 20 results
        
        const analytics = {
            totalValidations: this.resultHistory.length,
            successRate: (this.resultHistory.filter(r => r.valid).length / this.resultHistory.length) * 100,
            averageProcessingTime: this.resultHistory.reduce((sum, r) => sum + r.processingTime, 0) / this.resultHistory.length,
            recentTrends: {
                successRate: (recent.filter(r => r.valid).length / recent.length) * 100,
                averageErrors: recent.reduce((sum, r) => sum + r.errorCount, 0) / recent.length,
                averageWarnings: recent.reduce((sum, r) => sum + r.warningCount, 0) / recent.length,
                autoFixUsage: (recent.filter(r => r.autoFixApplied > 0).length / recent.length) * 100
            }
        };
        
        return analytics;
    }
    
    /**
     * Configure processor
     * @param {Object} config - Configuration options
     */
    configure(config) {
        Object.assign(this.config, config);
        
        if (config.maxHistorySize !== undefined) {
            this.maxHistorySize = Math.max(10, Math.min(200, config.maxHistorySize));
        }
        
        console.log('[ValidationResultProcessor] Configuration updated');
    }
    
    /**
     * Clear result history
     */
    clearHistory() {
        this.resultHistory = [];
        console.log('[ValidationResultProcessor] History cleared');
    }
    
    /**
     * Cleanup processor resources
     */
    destroy() {
        this.clearHistory();
        console.log('[ValidationResultProcessor] Processor destroyed');
    }
}