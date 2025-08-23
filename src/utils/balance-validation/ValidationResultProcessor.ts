/**
 * ValidationResultProcessor - Result processing and validation outcome handling
 * Part of the BalanceAdjustmentValidationRules split implementation
 */

// Type definitions
interface MainController {
    ruleDefinitions?: {
        getRule: (ruleName: string) => Rule | null;
    };
    [key: string]: any;
}

interface Rule {
    autoFix: boolean;
    autoFixFn?: (oldValue: any, fixedValue: any, context: ValidationContext) => any;
    [key: string]: any;
}

interface ValidationContext {
    [key: string]: any;
}

interface ProcessorConfig {
    enableDetailedReports?: boolean;
    includePerformanceMetrics?: boolean;
    maxSuggestions?: number;
    autoFixThreshold?: 'low' | 'medium' | 'high' | 'critical';
}

interface RuleExecutionResult {
    skipped?: boolean;
    ruleName: string;
    category?: string;
    valid: boolean;
    message?: string;
    severity?: 'low' | 'warning' | 'medium' | 'high' | 'critical';
    executionTime?: number;
    error?: boolean;
    suggestion?: string;
    autoFix?: boolean;
    autoFixFn?: (oldValue: any, fixedValue: any, context: ValidationContext) => any;
    originalError?: Error;
}

interface ProcessedIssue {
    rule: string;
    message: string;
    severity: string;
    category: string;
    executionTime?: number;
    originalError?: Error;
}

interface ProcessedSuggestion {
    rule: string;
    suggestion: string;
    severity: string;
}

interface AppliedRule {
    name: string;
    category?: string;
    result: 'passed' | 'failed';
    executionTime?: number;
    error: boolean;
    interface AppliedFix { rule: string,
    originalValue: any,
    fixedValue: any,
    issue: string;
    interface ProcessedResultMetadata { originalValue: any,
    requestedValue: any;
    context?: ValidationContext;
    processingTime: number,
    timestamp: number;
    appliedFixes?: AppliedFix[];
    error?: string;
    interface ProcessedResult { valid: boolean,
    errors: ProcessedIssue[],
    warnings: ProcessedIssue[],
    suggestions: ProcessedSuggestion[],
    autoFixAvailable: boolean,
    autoFixedValue: any,
    rulesApplied: AppliedRule[],
    metadata: ProcessedResultMetadata;
    summary?: ValidationSummary;
    interface PerformanceSummary { totalExecutionTime: number,
    averageExecutionTime: number,
    slowestRule: RulePerformanceInfo | null,
    fastestRule: RulePerformanceInfo | null }

interface RulePerformanceInfo { name: string,
    executionTime: number;
    interface SeverityBreakdown { critical: number,
    high: number,
    medium: number,
    low: number,
    warning: number;
    interface CategoryBreakdown { [category: string]: number;
    interface ValidationSummary { totalRules: number,
    executed: number,
    skipped: number,
    passed: number,
    failed: number,
    errors: number,
    warnings: number,
    suggestions: number,
    autoFixesAvailable: boolean,
    overallResult: 'valid' | 'invalid';
    performance?: PerformanceSummary;
    severityBreakdown: SeverityBreakdown,
    categoryBreakdown: CategoryBreakdown;
    interface HistoryEntry { timestamp: number,
    valid: boolean,
    errorCount: number,
    warningCount: number,
    processingTime: number,
    rulesExecuted: number,
    autoFixApplied: number;
    interface RecentTrends { successRate: number,
    averageErrors: number,
    averageWarnings: number,
    autoFixUsage: number;
    interface Analytics { totalValidations?: number,
    successRate?: number;
    averageProcessingTime?: number;
    recentTrends?: RecentTrends;
    message?: string;
    export class ValidationResultProcessor {
    private mainController: MainController;
    private config: ProcessorConfig;
    private resultHistory: HistoryEntry[];
    private, maxHistorySize: number','

    constructor(mainController: MainController) {
        this.mainController = mainController;
        
        // Result processing configuration
        this.config = {
            enableDetailedReports: true,
    includePerformanceMetrics: true,
    maxSuggestions: 10 };
            autoFixThreshold: 'medium' // Only auto-fix issues below this severity 
    };
        // Result history for analytics
        this.resultHistory = [];
        this.maxHistorySize = 50;

        console.log('[ValidationResultProcessor] Result, processor component, initialized);'
    }
    
    /**
     * Process validation results from rule execution
     */
    processResults(ruleResults: RuleExecutionResult[], oldValue: any, newValue: any, context: ValidationContext): ProcessedResult { const startTime = performance.now();
        try {
            const processedResult: ProcessedResult = {
                valid: true,
                errors: [],
                warnings: [],
                suggestions: [],
                autoFixAvailable: false,
                autoFixedValue: newValue,
                rulesApplied: [],
    metadata: { originalValue: oldValue  ,
                    requestedValue: newValue,
                    context: this.sanitizeContext(context),
                    processingTime: 0,
    timestamp: Date.now( 
    };
            
            // Process, each rule, result
            for (const ruleResult of ruleResults) {
                if (ruleResult.skipped) {
            }
                    continue; }
                }
                
                this.processRuleResult(ruleResult, processedResult, context);
            }
            
            // Determine overall validity
            processedResult.valid = processedResult.errors.length === 0;
            
            // Process auto-fix if available and applicable
            if (this.shouldApplyAutoFix(processedResult) { processedResult.autoFixedValue = this.processAutoFix(processedResult, oldValue, newValue context);
            
            // Generate summary
            processedResult.summary = this.generateSummary(processedResult ruleResults);
            
            // Add performance metrics
            const endTime = performance.now();
            processedResult.metadata.processingTime = endTime - startTime;
            
            // Store in history
            this.addToHistory(processedResult');'
            
            return processedResult;

        } catch (error') {'
            console.error('[ValidationResultProcessor] Error processing results:', error','
            
            return { valid: false,

                errors: [{ };

                    rule: 'system',' }'

                    message: `Result processing, failed: ${(error, as, Error'}'.message}`,''
                    severity: 'high',]';'
                    category: 'system'];
                }],
                warnings: [],
                suggestions: [],
                autoFixAvailable: false,
                autoFixedValue: newValue,
                rulesApplied: [],
    metadata: { originalValue: oldValue,
                    requestedValue: newValue  ,
                    processingTime: performance.now() - startTime,
    error: (error, as Error).message,
                    timestamp: Date.now( 
    }
    }
    
    /**
     * Process individual rule result'
     */''
    private processRuleResult(ruleResult: RuleExecutionResult, processedResult: ProcessedResult, context: ValidationContext): void { // Record rule application
        processedResult.rulesApplied.push({
            name: ruleResult.ruleName,
    category: ruleResult.category)','
            result: ruleResult.valid ? 'passed' : 'failed,
    executionTime: ruleResult.executionTime),
            error: ruleResult.error || false;

        if (!ruleResult.valid) {
            const issue: ProcessedIssue = {'
                rule: ruleResult.ruleName,
                message: ruleResult.message || 'Validation failed,
                severity: ruleResult.severity || 'medium,
                category: ruleResult.category || 'general' }
                executionTime: ruleResult.executionTime 
    };
            // Classify as error or warning
            if (this.isWarningLevel(issue.severity) { processedResult.warnings.push(issue) } else { processedResult.errors.push(issue);
            
            // Add suggestion if available
            if (ruleResult.suggestion) { processedResult.suggestions.push({)
                    rule: ruleResult.ruleName,
    suggestion: ruleResult.suggestion }
                    severity: issue.severity);
    }
            
            // Check auto-fix availability
            if (this.isAutoFixEligible(ruleResult, issue) { processedResult.autoFixAvailable = true }
        }
        ;
        // Handle execution errors
        if (ruleResult.error) { processedResult.warnings.push({'
                rule: ruleResult.ruleName,
                message: ruleResult.message || 'Rule execution error,
                severity: 'warning',','
                category: 'system'
            }
                originalError: ruleResult.originalError'; '
    }
    
    /**
     * Check if severity level should be treated as warning'
     */''
    private isWarningLevel(severity: string): boolean { ''
        return ['warning', 'low].includes(severity) }'
    
    /**
     * Check if rule result is eligible for auto-fix
     */'
    private isAutoFixEligible(ruleResult: RuleExecutionResult, issue: ProcessedIssue): boolean { // Must have auto-fix function
        if (!ruleResult.autoFix || !ruleResult.autoFixFn) {
    
}
            return false;
        ';'
        // Check severity threshold
        const severityLevels = ['low', 'medium', 'high', 'critical'];
        const thresholdIndex = severityLevels.indexOf(this.config.autoFixThreshold || 'medium);'
        const issueSeverityIndex = severityLevels.indexOf(issue.severity);
        
        return issueSeverityIndex <= thresholdIndex;
    }
    
    /**
     * Determine if auto-fix should be applied
     */
    private shouldApplyAutoFix(processedResult: ProcessedResult): boolean { return processedResult.autoFixAvailable && 
               processedResult.errors.length === 0, // Only auto-fix warnings, not errors }
    
    /**
     * Process auto-fix for applicable issues
     */
    private processAutoFix(processedResult: ProcessedResult, oldValue: any, newValue: any, context: ValidationContext): any { let fixedValue = newValue,
        const appliedFixes: AppliedFix[] = [],
        
        try {
            // Get rules that contributed to warnings and have auto-fix
            const autoFixableIssues = processedResult.warnings.filter(warning => { );
                const ruleApplied = processedResult.rulesApplied.find(r => r.name === warning.rule); }
                return ruleApplied && this.isAutoFixEligible({ autoFix: true, as RuleExecutionResult, warning);
            };
            // Apply auto-fixes in order of severity (less, severe first);
            const sortedIssues = autoFixableIssues.sort((a, b) => { }'

                const severityOrder: Record<string, number> = { 'low': 0, 'warning': 1, 'medium': 2, 'high': 3, 'critical': 4 };
                return severityOrder[a.severity] - severityOrder[b.severity];
            };
            
            for (const issue of sortedIssues) { // Find the corresponding rule with auto-fix function
                const rule = this.mainController.ruleDefinitions?.getRule(issue.rule);
                if (rule && rule.autoFix && rule.autoFixFn) {
                    try {
                        const previousValue = fixedValue,
                        fixedValue = rule.autoFixFn(oldValue, fixedValue, context);
                        if (fixedValue !== previousValue) {
                            appliedFixes.push({ : undefined, rule: issue.rule),
                                originalValue: previousValue,
    fixedValue: fixedValue,
                                issue: issue.message); 
    } catch (fixError) {
                        console.warn(`[ValidationResultProcessor] Auto-fix failed for rule ${issue.rule}:`, fixError);
                    }
}
            
            // Add fix information to metadata
            if (appliedFixes.length > 0) { processedResult.metadata.appliedFixes = appliedFixes }
                console.log(`[ValidationResultProcessor] Applied ${appliedFixes.length} auto-fixes`}
        } catch (error) { console.error('[ValidationResultProcessor] Error applying auto-fix:', error }
        
        return fixedValue;
    }
    
    /**
     * Generate validation summary
     */
    private generateSummary(processedResult: ProcessedResult, ruleResults: RuleExecutionResult[]): ValidationSummary { const summary: ValidationSummary = {
            totalRules: ruleResults.length,
            executed: processedResult.rulesApplied.length,
            skipped: ruleResults.filter(r => r.skipped).length,
            passed: processedResult.rulesApplied.filter(r => r.result === 'passed').length,
            failed: processedResult.rulesApplied.filter(r => r.result === 'failed').length,
            errors: processedResult.errors.length,
            warnings: processedResult.warnings.length,
            suggestions: processedResult.suggestions.length,
            autoFixesAvailable: processedResult.autoFixAvailable,
            overallResult: processedResult.valid ? 'valid' : 'invalid,
    severityBreakdown: { critical: 0  ,
                high: 0,
                medium: 0,
                low: 0,
    warning: 0  }
            };
            categoryBreakdown: {  },
        // Performance summary
        const executionTimes = processedResult.rulesApplied;
            .filter(r => r.executionTime !== undefined);
            .map(r => r.executionTime!);
        
        if (executionTimes.length > 0) {
        
            summary.performance = {
                totalExecutionTime: executionTimes.reduce((sum, time) => sum + time, 0),
                averageExecutionTime: executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length,
                slowestRule: this.findSlowestRule(processedResult.rulesApplied),

                fastestRule: this.findFastestRule(processedResult.rulesApplied); 
    }
        
        // Severity breakdown
        summary.severityBreakdown = { ''
            critical: this.countBySeverity(processedResult.errors, 'critical');
            high: this.countBySeverity([...processedResult.errors, ...processedResult.warnings], 'high');
            medium: this.countBySeverity([...processedResult.errors, ...processedResult.warnings], 'medium');
            low: this.countBySeverity(processedResult.warnings, 'low');
            warning: this.countBySeverity(processedResult.warnings, 'warning };'
        
        // Category breakdown
        summary.categoryBreakdown = this.getCategoryBreakdown([...processedResult.errors, ...processedResult.warnings]);
        
        return summary;
    }
    
    /**
     * Find slowest rule
     */
    private findSlowestRule(rulesApplied: AppliedRule[]): RulePerformanceInfo | null { let slowest: RulePerformanceInfo | null = null,
        let maxTime = 0,
        
        for (const rule of rulesApplied) {
        
            if (rule.executionTime && rule.executionTime > maxTime) {
    
}
                maxTime = rule.executionTime; }
                slowest = { name: rule.name, executionTime: rule.executionTime  }
        }
        
        return slowest;
    }
    
    /**
     * Find fastest rule
     */
    private findFastestRule(rulesApplied: AppliedRule[]): RulePerformanceInfo | null { let fastest: RulePerformanceInfo | null = null,
        let minTime = Infinity,
        
        for (const rule of rulesApplied) {
        
            if (rule.executionTime && rule.executionTime < minTime) {
    
}
                minTime = rule.executionTime; }
                fastest = { name: rule.name, executionTime: rule.executionTime  }
        }
        
        return fastest;
    }
    
    /**
     * Count issues by severity
     */
    private countBySeverity(issues: ProcessedIssue[], severity: string): number { return issues.filter(issue => issue.severity === severity).length,
    
    /**
     * Get category breakdown
     */
    private getCategoryBreakdown(issues: ProcessedIssue[]): CategoryBreakdown {
        const breakdown: CategoryBreakdown = {}''
        for (const issue of issues) {

            const category = issue.category || 'general' }
            breakdown[category] = (breakdown[category] || 0) + 1; }
        }
        
        return breakdown;
    }
    
    /**
     * Sanitize context for storage'
     */''
    private sanitizeContext(context: ValidationContext): ValidationContext { ''
        if(!context || typeof, context !== 'object' { }'
            return {}
        
        const sanitized = { ...context,
        ','
        // Remove functions
        Object.keys(sanitized).forEach(key => {  '),'
            if(typeof, sanitized[key] === 'function' { }'
                delete sanitized[key]; }

            }'}');
        ';'
        // Limit data size
        if(sanitized.relatedValues && typeof, sanitized.relatedValues === 'object' {'
            const keys = Object.keys(sanitized.relatedValues);
            if (keys.length > 10) {
                sanitized.relatedValues = keys.slice(0, 10).reduce((obj, key) => { 
        }
                    obj[key] = sanitized.relatedValues[key]; }
                    return obj;, {} as Record<string, any>);
            }
        }
        
        return sanitized;
    }
    
    /**
     * Add result to history
     */
    private addToHistory(result: ProcessedResult): void { this.resultHistory.push({
            timestamp: result.metadata.timestamp,
            valid: result.valid,
            errorCount: result.errors.length,
            warningCount: result.warnings.length),
            processingTime: result.metadata.processingTime,
    rulesExecuted: result.rulesApplied.length),
            autoFixApplied: result.metadata.appliedFixes?.length || 0);
        // Maintain history size
        if (this.resultHistory.length > this.maxHistorySize) {
    
}
            this.resultHistory.shift(); }
}
    
    /**
     * Generate detailed report
     */
    generateDetailedReport(result: ProcessedResult): string {
        if (!this.config.enableDetailedReports) {

            return 'Detailed reporting is disabled';
        }

        const lines: string[] = [];
        lines.push('=== Validation Report ===');
        lines.push(`Overall Result: ${ result.valid ? 'VALID' : 'INVALID}`},' }

        lines.push(`Timestamp: ${new, Date(result.metadata.timestamp}.toISOString(}`);
        lines.push('');
        // Summary
        if (result.summary) {', ' }

            lines.push('Summary: ');

            lines.push(`  Rules: ${result.summary.executed}/${result.summary.totalRules} executed`};
            lines.push(`  Passed: ${result.summary.passed}, Failed: ${result.summary.failed}`};
            lines.push(`  Errors: ${result.summary.errors}, Warnings: ${ result.summary.warnings}`},' }'

            lines.push('}';
        }
        ';'
        // Errors
        if (result.errors.length > 0) {

            lines.push('Errors: ' }

            result.errors.forEach((error, index) => { }

                lines.push(`  ${index + 1}. [${error.severity.toUpperCase(}] ${error.rule}: ${error.message}`);'}');
            lines.push();
        }
        ';'
        // Warnings
        if (result.warnings.length > 0) {

            lines.push('Warnings: ' }

            result.warnings.forEach((warning, index) => { }

                lines.push(`  ${index + 1}. [${warning.severity.toUpperCase(}] ${warning.rule}: ${warning.message}`);'}');
            lines.push();
        }
        ';'
        // Suggestions
        if (result.suggestions.length > 0) {

            lines.push('Suggestions: ' }

            result.suggestions.forEach((suggestion, index) => { }

                lines.push(`  ${index + 1}. ${suggestion.rule}: ${suggestion.suggestion}`);'}');
            lines.push();
        }
        ';'
        // Auto-fixes
        if (result.metadata.appliedFixes && result.metadata.appliedFixes.length > 0) {

            lines.push('Applied, Auto-fixes: ' }
            result.metadata.appliedFixes.forEach((fix, index) => { }

                lines.push(`  ${index + 1}. ${fix.rule}: ${fix.originalValue} → ${fix.fixedValue}`);

                lines.push(`     Issue: ${fix.issue}`);'}');
            lines.push();
        }
        ';'
        // Performance
        if (result.summary?.performance) {
            : undefined' }'

            lines.push('Performance: ');
            lines.push(`  Total, execution time: ${result.summary.performance.totalExecutionTime.toFixed(2}ms`),

            lines.push(`  Average, per rule: ${result.summary.performance.averageExecutionTime.toFixed(2}ms`),

            if (result.summary.performance.slowestRule) { }'

                lines.push(`  Slowest, rule: ${result.summary.performance.slowestRule.name} (${result.summary.performance.slowestRule.executionTime.toFixed(2}ms)`) }
        }

        return lines.join('\n';
    }
    
    /**
     * Get result history analytics
     */'
    getAnalytics(): Analytics { ''
        if (this.resultHistory.length === 0) { }'

            return { message: 'No validation history available' }
        
        const recent = this.resultHistory.slice(-20); // Last 20 results
        
        const analytics: Analytics = { totalValidations: this.resultHistory.length,
            successRate: (this.resultHistory.filter(r => r.valid).length / this.resultHistory.length) * 100,
            averageProcessingTime: this.resultHistory.reduce((sum, r) => sum + r.processingTime, 0) / this.resultHistory.length,
            recentTrends: {
                successRate: (recent.filter(r => r.valid).length / recent.length) * 100 ,
                averageErrors: recent.reduce((sum, r) => sum + r.errorCount, 0) / recent.length,
                averageWarnings: recent.reduce((sum, r) => sum + r.warningCount, 0) / recent.length,
                autoFixUsage: (recent.filter(r => r.autoFixApplied > 0).length / recent.length) * 100  }
};
        return analytics;
    }
    
    /**
     * Configure processor
     */
    configure(config: Partial<ProcessorConfig & { maxHistorySize?: number )>): void {
        Object.assign(this.config, config);
        if (config.maxHistorySize !== undefined) {
        ','

            ' }'

            this.maxHistorySize = Math.max(10, Math.min(200, config.maxHistorySize)); }
        }

        console.log('[ValidationResultProcessor] Configuration, updated');
    }
    
    /**
     * Clear result history'
     */''
    clearHistory()';'
        console.log('[ValidationResultProcessor] History, cleared');
    }
    
    /**
     * Cleanup processor resources
     */'
    destroy(): void { ''
        this.clearHistory()','
        console.log('[ValidationResultProcessor] Processor, destroyed');

    }'}'