/**
 * ErrorLogger - Handles error logging and log management
 * Part of the ErrorHandler split implementation
 */

export class ErrorLogger {
    constructor(mainController) {
        this.mainController = mainController;
        
        // Error logging configuration
        this.errorLog = [];
        this.maxLogSize = 100;
        
        // Error statistics
        this.errorStats = {
            total: 0,
            byType: new Map(),
            byContext: new Map(),
            critical: 0,
            recovered: 0
        };
        
        console.log('[ErrorLogger] Error logging component initialized');
    }
    
    /**
     * Add error to log
     * @param {object} errorInfo - Normalized error information
     */
    addToErrorLog(errorInfo) {
        this.errorLog.push(errorInfo);
        
        // Maintain log size limit
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }
    }
    
    /**
     * Update error statistics
     * @param {object} errorInfo - Error information
     */
    updateErrorStats(errorInfo) {
        this.errorStats.total++;
        
        // Statistics by type
        const type = errorInfo.name;
        this.errorStats.byType.set(type, (this.errorStats.byType.get(type) || 0) + 1);
        
        // Statistics by context
        const context = errorInfo.context;
        this.errorStats.byContext.set(context, (this.errorStats.byContext.get(context) || 0) + 1);
    }
    
    /**
     * Log error to console with appropriate severity
     * @param {object} errorInfo - Error information
     * @param {string} severity - Error severity level
     */
    logError(errorInfo, severity) {
        const logMethod = severity === 'CRITICAL' ? 'error' : 
                         severity === 'HIGH' ? 'warn' : 'log';
        
        console[logMethod](`[${severity}] ${errorInfo.context}: ${errorInfo.message}`, {
            id: errorInfo.id,
            timestamp: errorInfo.timestamp,
            metadata: errorInfo.metadata,
            stack: errorInfo.stack
        });
    }
    
    /**
     * Log error with structured format
     * @param {object} errorInfo - Error information
     * @param {string} severity - Error severity
     * @param {object} additionalData - Additional logging data
     */
    logStructuredError(errorInfo, severity, additionalData = {}) {
        const logEntry = {
            level: severity,
            timestamp: errorInfo.timestamp,
            id: errorInfo.id,
            context: errorInfo.context,
            message: errorInfo.message,
            stack: errorInfo.stack,
            metadata: errorInfo.metadata,
            ...additionalData
        };
        
        // Enhanced logging for different environments
        if (this.mainController.isBrowser) {
            this.logBrowserError(logEntry, severity);
        } else if (this.mainController.isNode) {
            this.logNodeError(logEntry, severity);
        } else {
            this.logGenericError(logEntry, severity);
        }
    }
    
    /**
     * Log error in browser environment
     * @param {object} logEntry - Structured log entry
     * @param {string} severity - Error severity
     */
    logBrowserError(logEntry, severity) {
        const styles = {
            CRITICAL: 'color: white; background-color: red; font-weight: bold; padding: 2px 6px;',
            HIGH: 'color: white; background-color: orange; font-weight: bold; padding: 2px 6px;',
            MEDIUM: 'color: white; background-color: #ff9900; padding: 2px 6px;',
            LOW: 'color: #666; padding: 2px 6px;'
        };
        
        console.log(
            `%c[${severity}]%c ${logEntry.context}: ${logEntry.message}`,
            styles[severity] || styles.LOW,
            'color: inherit;',
            logEntry
        );
    }
    
    /**
     * Log error in Node.js environment
     * @param {object} logEntry - Structured log entry
     * @param {string} severity - Error severity
     */
    logNodeError(logEntry, severity) {
        const colors = {
            CRITICAL: '\x1b[41m\x1b[37m', // White text on red background
            HIGH: '\x1b[43m\x1b[30m',    // Black text on yellow background
            MEDIUM: '\x1b[33m',          // Yellow text
            LOW: '\x1b[90m',             // Bright black (gray) text
            RESET: '\x1b[0m'             // Reset color
        };
        
        const color = colors[severity] || colors.LOW;
        console.log(
            `${color}[${severity}]${colors.RESET} ${logEntry.context}: ${logEntry.message}`,
            JSON.stringify(logEntry, null, 2)
        );
    }
    
    /**
     * Log error in generic environment
     * @param {object} logEntry - Structured log entry
     * @param {string} severity - Error severity
     */
    logGenericError(logEntry, severity) {
        console.log(`[${severity}] ${logEntry.context}: ${logEntry.message}`, logEntry);
    }
    
    /**
     * Generate error ID
     * @returns {string} Unique error ID
     */
    generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Get error statistics
     * @returns {object} Error statistics
     */
    getErrorStats() {
        return {
            ...this.errorStats,
            byType: Object.fromEntries(this.errorStats.byType),
            byContext: Object.fromEntries(this.errorStats.byContext)
        };
    }
    
    /**
     * Get error log
     * @returns {Array} Copy of error log
     */
    getErrorLog() {
        return [...this.errorLog];
    }
    
    /**
     * Get recent errors
     * @param {number} count - Number of recent errors to return
     * @returns {Array} Recent errors
     */
    getRecentErrors(count = 10) {
        return this.errorLog.slice(-count);
    }
    
    /**
     * Get errors by severity level
     * @param {string} severity - Severity level
     * @returns {Array} Filtered errors
     */
    getErrorsBySeverity(severity) {
        return this.errorLog.filter(error => {
            const errorSeverity = this.mainController.determineSeverity?.(error);
            return errorSeverity === severity;
        });
    }
    
    /**
     * Get errors by context
     * @param {string} context - Error context
     * @returns {Array} Filtered errors
     */
    getErrorsByContext(context) {
        return this.errorLog.filter(error => error.context === context);
    }
    
    /**
     * Get errors within time range
     * @param {number} startTime - Start timestamp
     * @param {number} endTime - End timestamp
     * @returns {Array} Filtered errors
     */
    getErrorsByTimeRange(startTime, endTime) {
        return this.errorLog.filter(error => {
            const errorTime = new Date(error.timestamp).getTime();
            return errorTime >= startTime && errorTime <= endTime;
        });
    }
    
    /**
     * Export error log data
     * @param {object} options - Export options
     * @returns {object} Exported data
     */
    exportErrorLog(options = {}) {
        const {
            format = 'json',
            includeStack = false,
            timeRange = null,
            severityFilter = null,
            contextFilter = null
        } = options;
        
        let filteredErrors = [...this.errorLog];
        
        // Apply filters
        if (timeRange) {
            filteredErrors = this.getErrorsByTimeRange(timeRange.start, timeRange.end);
        }
        
        if (severityFilter) {
            filteredErrors = filteredErrors.filter(error => {
                const severity = this.mainController.determineSeverity?.(error);
                return severity === severityFilter;
            });
        }
        
        if (contextFilter) {
            filteredErrors = filteredErrors.filter(error => error.context === contextFilter);
        }
        
        // Format data
        const exportData = {
            exportedAt: new Date().toISOString(),
            errorCount: filteredErrors.length,
            statistics: this.getErrorStats(),
            errors: filteredErrors.map(error => ({
                id: error.id,
                timestamp: error.timestamp,
                context: error.context,
                message: error.message,
                name: error.name,
                metadata: error.metadata,
                recovered: error.recovered,
                ...(includeStack && { stack: error.stack })
            }))
        };
        
        if (format === 'csv') {
            return this.convertToCSV(exportData.errors);
        }
        
        return exportData;
    }
    
    /**
     * Convert error data to CSV format
     * @param {Array} errors - Error data
     * @returns {string} CSV formatted data
     */
    convertToCSV(errors) {
        if (errors.length === 0) return '';
        
        const headers = Object.keys(errors[0]).filter(key => key !== 'metadata');
        const csvRows = [headers.join(',')];
        
        for (const error of errors) {
            const row = headers.map(header => {
                let value = error[header];
                if (typeof value === 'string') {
                    value = `"${value.replace(/"/g, '""')}"`;
                } else if (value === null || value === undefined) {
                    value = '';
                }
                return value;
            });
            csvRows.push(row.join(','));
        }
        
        return csvRows.join('\n');
    }
    
    /**
     * Clear error log
     */
    clearErrorLog() {
        this.errorLog = [];
        console.log('[ErrorLogger] Error log cleared');
    }
    
    /**
     * Clear error statistics
     */
    clearErrorStats() {
        this.errorStats = {
            total: 0,
            byType: new Map(),
            byContext: new Map(),
            critical: 0,
            recovered: 0
        };
        console.log('[ErrorLogger] Error statistics cleared');
    }
    
    /**
     * Configure logger settings
     * @param {object} config - Configuration options
     */
    configure(config) {
        if (config.maxLogSize !== undefined) {
            this.maxLogSize = Math.max(10, Math.min(1000, config.maxLogSize));
        }
        
        console.log('[ErrorLogger] Configuration updated');
    }
    
    /**
     * Log rotation - archive old logs and start fresh
     * @returns {object} Archived log data
     */
    rotateLog() {
        const archived = {
            rotatedAt: new Date().toISOString(),
            errorCount: this.errorLog.length,
            statistics: { ...this.getErrorStats() },
            errors: [...this.errorLog]
        };
        
        this.clearErrorLog();
        
        console.log(`[ErrorLogger] Log rotated: ${archived.errorCount} errors archived`);
        return archived;
    }
    
    /**
     * Get log health metrics
     * @returns {object} Health metrics
     */
    getHealthMetrics() {
        const recentErrors = this.getRecentErrors(10);
        const criticalErrors = this.getErrorsBySeverity('CRITICAL');
        
        return {
            totalErrors: this.errorStats.total,
            recentErrorsCount: recentErrors.length,
            criticalErrorsCount: criticalErrors.length,
            logSizeUsage: (this.errorLog.length / this.maxLogSize) * 100,
            recoveryRate: this.errorStats.total > 0 ? 
                (this.errorStats.recovered / this.errorStats.total) * 100 : 0,
            lastErrorTime: this.errorLog.length > 0 ? 
                this.errorLog[this.errorLog.length - 1].timestamp : null
        };
    }
    
    /**
     * Cleanup logger resources
     */
    destroy() {
        this.errorLog = [];
        this.errorStats.byType.clear();
        this.errorStats.byContext.clear();
        console.log('[ErrorLogger] Logger destroyed');
    }
}