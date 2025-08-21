/**
 * ErrorLogger - Handles error logging and log management
 * Part of the ErrorHandler split implementation
 */

// Type definitions for error logging system
interface ErrorInfo { id: string,
    timestamp: string;
    context: string;
    message: string,
    name: string;
    stack?: string;
    metadata?: Record<string, any>;
    recovered?: boolean; }

interface ErrorStats { total: number,
    byType: Map<string, number>;
    byContext: Map<string, number>;
    critical: number,
    recovered: number ,}

interface MainController { isBrowser?: boolean;
    isNode?: boolean;
    determineSeverity?: (error: ErrorInfo) => string ,}
}

interface LogEntry { level: string;
    timestamp: string;
    id: string;
    context: string,
    message: string;
    stack?: string;
    metadata?: Record<string, any>;
    [key: string]: any, }

interface ExportOptions { format?: 'json' | 'csv';
    includeStack?: boolean;
    timeRange?: {
        start: number,
    end: number ,} | null;
    severityFilter?: string | null;
    contextFilter?: string | null;
}

interface HealthMetrics { totalErrors: number,
    recentErrorsCount: number;
    criticalErrorsCount: number;
    logSizeUsage: number;
    recoveryRate: number,
    lastErrorTime: string | null ,}

interface ArchivedLogData { rotatedAt: string;
    errorCount: number;
    statistics: ErrorStats,
    errors: ErrorInfo[]
    }

interface ExportData { exportedAt: string;
    errorCount: number;
    statistics: ErrorStats,
    errors: Array<{
        i;d: string;
        timestamp: string;
        context: string;
        message: string,
    name: string;
        metadata?: Record<string, any>;
        recovered?: boolean;
        stack?: string; }>;
}

interface LoggerConfig { maxLogSize?: number; }

export class ErrorLogger {
    private mainController: MainController;
    private errorLog: ErrorInfo[];
    private maxLogSize: number;
    private, errorStats: ErrorStats;
    constructor(mainController: MainController) {

        this.mainController = mainController;
        
        // Error logging configuration
        this.errorLog = [];
        this.maxLogSize = 100;
        
        // Error statistics
        this.errorStats = {
            total: 0,
    byType: new Map(),
            byContext: new Map(''
    ,}''
        console.log('[ErrorLogger] Error, logging component, initialized'), }'
    }
    
    /**
     * Add error to log
     * @param errorInfo - Normalized error information
     */
    addToErrorLog(errorInfo: ErrorInfo): void { this.errorLog.push(errorInfo);
        
        // Maintain log size limit
        if(this.errorLog.length > this.maxLogSize) {
            
        }
            this.errorLog.shift(); }
}
    
    /**
     * Update error statistics
     * @param errorInfo - Error information
     */
    updateErrorStats(errorInfo: ErrorInfo): void { this.errorStats.total++;
        
        // Statistics by type
        const type = errorInfo.name;
        this.errorStats.byType.set(type, (this.errorStats.byType.get(type) || 0) + 1);
        
        // Statistics by context
        const context = errorInfo.context;
        this.errorStats.byContext.set(context, (this.errorStats.byContext.get(context) || 0) + 1); }
    
    /**
     * Log error to console with appropriate severity
     * @param errorInfo - Error information
     * @param severity - Error severity level
     */''
    logError(errorInfo: ErrorInfo, severity: string): void { ''
        const logMethod = severity === 'CRITICAL' ? 'error' : '';
                         severity === 'HIGH' ? 'warn' : 'log';
         }
        console[logMethod as keyof Console](`[${severity}] ${errorInfo.context}: ${errorInfo.message}`, { id: errorInfo.id,
            timestamp: errorInfo.timestamp;
            metadata: errorInfo.metadata),
    stack: errorInfo.stack ,});
    }
    
    /**
     * Log error with structured format
     * @param errorInfo - Error information
     * @param severity - Error severity
     * @param additionalData - Additional logging data
     */
    logStructuredError(errorInfo: ErrorInfo, severity: string, additionalData: Record<string, any> = { ): void {
        const logEntry: LogEntry = {
            level: severity;
            timestamp: errorInfo.timestamp;
            id: errorInfo.id;
            context: errorInfo.context;
            message: errorInfo.message;
            stack: errorInfo.stack,
    metadata: errorInfo.metadata;
            ...additionalData;
        
        // Enhanced logging for different environments
        if (this.mainController.isBrowser) { this.logBrowserError(logEntry, severity); } else if (this.mainController.isNode) { this.logNodeError(logEntry, severity); } else { this.logGenericError(logEntry, severity); }
    }
    
    /**
     * Log error in browser environment
     * @param logEntry - Structured log entry
     * @param severity - Error severity
     */''
    private logBrowserError(logEntry: LogEntry, severity: string): void { const styles: Record<string, string> = {''
            CRITICAL: 'color: white; background-color: red; font-weight: bold;, padding: 2px 6px;',''
            HIGH: 'color: white; background-color: orange; font-weight: bold;, padding: 2px 6px;',''
            MEDIUM: 'color: white; background-color: #ff9900;, padding: 2px 6px;',''
            LOW: 'color: #666;, padding: 2px 6px;' ,};
        ';

        console.log()'';
            `%c[${severity}]%c ${logEntry.context}: ${ logEntry.message'}`,

            styles[severity] || styles.LOW,
            'color: inherit;',
            logEntry }';
    }
    
    /**
     * Log error in Node.js environment
     * @param logEntry - Structured log entry
     * @param severity - Error severity'
     */''
    private logNodeError(logEntry: LogEntry, severity: string): void { const colors: Record<string, string> = {''
            CRITICAL: '\x1b[41m\x1b[37m', // White text on red background;
            HIGH: '\x1b[43m\x1b[30m',    // Black text on yellow background;
            MEDIUM: '\x1b[33m',          // Yellow text;
            LOW: '\x1b[90m',             // Bright black(gray) text'';
            RESET: '\x1b[0m'             // Reset color ,}]
        ];
        const color = colors[severity] || colors.LOW;
        console.log();
            `${color}[${severity}]${colors.RESET} ${logEntry.context}: ${ logEntry.message}`,
            JSON.stringify(logEntry, null, 2});
    }
    
    /**
     * Log error in generic environment
     * @param logEntry - Structured log entry
     * @param severity - Error severity
     */
    private logGenericError(logEntry: LogEntry, severity: string): void {
        console.log(`[${severity}] ${logEntry.context}: ${logEntry.message}`, logEntry});
    }
    
    /**
     * Generate error ID
     * @returns Unique error ID
     */
    generateErrorId(): string {
        return `err_${Date.now())_${Math.random().toString(36).substr(2, 9})`;
    }
    
    /**
     * Get error statistics
     * @returns Error statistics
     */
    getErrorStats(): ErrorStats { return this.errorStats; }
    
    /**
     * Get error log
     * @returns Copy of error log
     */
    getErrorLog(): ErrorInfo[] { return [...this.errorLog];
    
    /**
     * Get recent errors
     * @param count - Number of recent errors to return
     * @returns Recent errors
     */
    getRecentErrors(count: number = 10): ErrorInfo[] { return this.errorLog.slice(-count); }
    
    /**
     * Get errors by severity level
     * @param severity - Severity level
     * @returns Filtered errors
     */
    getErrorsBySeverity(severity: string): ErrorInfo[] { return this.errorLog.filter(error => { );
            const errorSeverity = this.mainController.determineSeverity?.(error); }
            return errorSeverity === severity;);
    }
    
    /**
     * Get errors by context
     * @param context - Error context
     * @returns Filtered errors
     */ : undefined
    getErrorsByContext(context: string): ErrorInfo[] { return this.errorLog.filter(error => error.context === context);
    
    /**
     * Get errors within time range
     * @param startTime - Start timestamp
     * @param endTime - End timestamp
     * @returns Filtered errors
     */
    getErrorsByTimeRange(startTime: number, endTime: number): ErrorInfo[] { return this.errorLog.filter(error => { );
            const errorTime = new Date(error.timestamp).getTime(); ,}
            return errorTime >= startTime && errorTime <= endTime;);
    }
    
    /**
     * Export error log data
     * @param options - Export options
     * @returns Exported data
     */''
    exportErrorLog(options: ExportOptions = { )): ExportData | string {'
        const {;
            format = 'json',
            includeStack = false,
            timeRange = null,
            severityFilter = null,
            contextFilter = null } = options;
        
        let filteredErrors = [...this.errorLog];
        
        // Apply filters
        if (timeRange) { filteredErrors = this.getErrorsByTimeRange(timeRange.start, timeRange.end); }
        
        if(severityFilter) {
        
            filteredErrors = filteredErrors.filter(error => { );
        
        }
                const severity = this.mainController.determineSeverity?.(error); }
                return severity === severityFilter;);
        }
        
        if (contextFilter) { filteredErrors = filteredErrors.filter(error => error.context === contextFilter); }
        }
        
        // Format data : undefined
        const exportData: ExportData = { exportedAt: new Date().toISOString(),
            errorCount: filteredErrors.length;
            statistics: this.getErrorStats(),
    errors: filteredErrors.map(error => ({
                id: error.id;
                timestamp: error.timestamp;
                context: error.context;
                message: error.message);
                name: error.name),
    metadata: error.metadata,);
                recovered: error.recovered);
                ...(includeStack && { stack: error.stack ),' }'

            }');
        };

        if(format === 'csv) { return this.convertToCSV(exportData.errors); }'
        
        return exportData;
    }
    
    /**
     * Convert error data to CSV format
     * @param errors - Error data
     * @returns CSV formatted data
     */'
    private convertToCSV(errors: Array<Record<string, any>>): string { ''
        if(errors.length === 0) return '';

        const headers = Object.keys(errors[0]).filter(key => key !== 'metadata'');''
        const csvRows = [headers.join(',)];
        
        for(const, error of, errors) {
        ';

            const row = headers.map(header => { ')', '
        }

                let value = error[header]');' }

                if (typeof, value === 'string'') {' }

                    value = `"${value.replace(/"/g, '""''}'"`;""
                } else if (value === null || value === undefined") { ""
                    value = ''; }

                return value;''
            }');''
            csvRows.push(row.join(',)';
        }

        return csvRows.join('\n';
    }
    
    /**
     * Clear error log'
     */''
    clearErrorLog()';
        console.log('[ErrorLogger] Error, log cleared);
    }
    
    /**
     * Clear error statistics
     */
    clearErrorStats(): void { this.errorStats = {
            total: 0,
            byType: new Map(),
            byContext: new Map()';
        console.log('[ErrorLogger] Error, statistics cleared'), }'
    
    /**
     * Configure logger settings
     * @param config - Configuration options
     */'
    configure(config: LoggerConfig): void { if (config.maxLogSize !== undefined) {''
            this.maxLogSize = Math.max(10, Math.min(1000, config.maxLogSize)); }

        console.log('[ErrorLogger] Configuration, updated);
    }
    
    /**
     * Log rotation - archive old logs and start fresh
     * @returns Archived log data
     */
    rotateLog(): ArchivedLogData { const archived: ArchivedLogData = {
            rotatedAt: new Date().toISOString(),
    errorCount: this.errorLog.length }
            statistics: { ...this.getErrorStats();
            errors: [...this.errorLog]; this.clearErrorLog();
        
        console.log(`[ErrorLogger] Log rotated: ${archived.errorCount,} errors archived`}');
        return archived;
    }
    
    /**
     * Get log health metrics
     * @returns Health metrics
     */'
    getHealthMetrics(): HealthMetrics { ''
        const recentErrors = this.getRecentErrors(10);''
        const criticalErrors = this.getErrorsBySeverity('CRITICAL);
        
        return { totalErrors: this.errorStats.total,
            recentErrorsCount: recentErrors.length;
            criticalErrorsCount: criticalErrors.length;
            logSizeUsage: (this.errorLog.length / this.maxLogSize) * 100;
            recoveryRate: this.errorStats.total > 0 ? undefined : undefined
                (this.errorStats.recovered / this.errorStats.total) * 100 : 0;
            lastErrorTime: this.errorLog.length > 0 ? undefined : undefined ,};
                this.errorLog[this.errorLog.length - 1].timestamp : null 
    },
    }
    
    /**
     * Cleanup logger resources
     */
    destroy(): void { this.errorLog = [];

        this.errorStats.byType.clear();''
        this.errorStats.byContext.clear()';
        console.log('[ErrorLogger] Logger, destroyed''); }

    }''
}