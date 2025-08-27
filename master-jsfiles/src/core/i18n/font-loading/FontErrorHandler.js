export class FontErrorHandler {
    constructor(config = {}) {
        this.config = config;
        this.errorCounts = new Map();
        this.suppressedErrors = new Set();
        this.errorHistory = new Map();
        this.suppressionRules = this._initializeSuppressionRules();
    }

    _initializeSuppressionRules() {
        return {
            repeatSuppression: {
                enabled: this.config.suppressRepeated !== false,
                timeWindow: this.config.suppressionTimeWindow || 60000,
                maxOccurrences: this.config.maxErrorsPerSource || 3
            },
            sourceBasedSuppression: {
                'local': {
                    'FileNotFoundError': 'suppress',
                    'TimeoutError': 'warn_once'
                },
                'google': {
                    'NetworkError': 'warn_once',
                    'TimeoutError': 'warn_once'
                },
                'system': {
                    'FileNotFoundError': 'warn_once',  // システムフォント不在は一度だけ警告
                    'ConfigurationError': 'error'
                }
            }
        };
    }

    handleFontError(error, context) {
        const errorInfo = this._categorizeError(error, context);
        const errorKey = `${context.source}:${errorInfo.type}:${context.fontFamily || 'unknown'}`;
        
        // warn_once チェック
        const shouldSuppress = this.shouldSuppressError(errorInfo.type, context.source);
        
        if (shouldSuppress === 'warn_once') {
            if (this.suppressedErrors.has(errorKey)) {
                return false; // 既に警告済みなので抑制
            }
            this.suppressedErrors.add(errorKey);
        } else if (shouldSuppress === 'suppress') {
            return false;
        }

        const logLevel = this._getLogLevel(shouldSuppress, errorInfo.type, context);
        this.logFontError(error, logLevel, context);

        this._updateErrorHistory(errorInfo, context);
        return true;
    }

    _categorizeError(error, context) {
        const errorMessage = error.message || error.toString().toLowerCase();
        
        if (errorMessage.includes('network') || 
            errorMessage.includes('fetch') || 
            errorMessage.includes('cors') ||
            context.source === 'google' && errorMessage.includes('failed')) {
            return { type: 'NetworkError', severity: 'warn' };
        }

        if (errorMessage.includes('not found') || 
            errorMessage.includes('404') ||
            errorMessage.includes('file') && errorMessage.includes('not') ||
            context.source === 'local' && errorMessage.includes('failed')) {
            return { type: 'FileNotFoundError', severity: 'warn' };
        }

        if (errorMessage.includes('timeout') || 
            errorMessage.includes('time out')) {
            return { type: 'TimeoutError', severity: 'warn' };
        }

        if (errorMessage.includes('config') || 
            errorMessage.includes('setting')) {
            return { type: 'ConfigurationError', severity: 'error' };
        }

        return { type: 'UnknownError', severity: 'warn' };
    }

    shouldSuppressError(errorType, source) {
        const sourceRules = this.suppressionRules.sourceBasedSuppression[source];
        if (sourceRules && sourceRules[errorType]) {
            return sourceRules[errorType];
        }

        if (this.suppressionRules.repeatSuppression.enabled) {
            const errorKey = `${source}:${errorType}`;
            const history = this.errorHistory.get(errorKey);
            
            if (history) {
                const now = Date.now();
                const recentErrors = history.filter(timestamp => 
                    now - timestamp < this.suppressionRules.repeatSuppression.timeWindow
                );

                if (recentErrors.length >= this.suppressionRules.repeatSuppression.maxOccurrences) {
                    return 'suppress';
                }
            }
        }

        return false;
    }

    _getLogLevel(suppressionType, errorType, context = {}) {
        if (suppressionType === 'warn_once') {
            return 'warn';
        }
        
        if (errorType === 'ConfigurationError') {
            return 'error';
        }

        // システムフォントエラーは一般的により低いログレベルに
        if (context.source === 'system' && errorType === 'FileNotFoundError') {
            return 'info';
        }

        return this.config.logLevel || 'warn';
    }

    logFontError(error, level = 'warn', context = {}) {
        const message = this._formatErrorMessage(error, context);

        if (this.config.development?.verboseLogging) {
            this._logDetailedError(error, context, level);
        } else {
            this._logSimpleError(message, level);
        }
    }

    _formatErrorMessage(error, context) {
        const fontFamily = context.fontFamily || 'unknown';
        const source = context.source || 'unknown';
        const suggestion = this._getSuggestion(error, context);

        return `Font loading failed: ${fontFamily} from ${source}. ${suggestion}`;
    }

    _getSuggestion(error, context) {
        const errorMessage = error.message || error.toString().toLowerCase();
        
        if (context.source === 'google' && errorMessage.includes('network')) {
            return 'Check network connectivity or consider using local fonts as fallback.';
        }

        if (context.source === 'local' && errorMessage.includes('not found')) {
            return `Ensure font file exists at '/fonts/${context.fontFamily}.woff2' or disable local font loading.`;
        }

        if (errorMessage.includes('timeout')) {
            return 'Font loading is taking too long. Using system fonts as fallback.';
        }

        // システムフォントが見つからない場合は、より一般的なメッセージ
        if (context.source === 'system') {
            return 'Using system fallback fonts.';
        }

        return 'Using fallback fonts. Check font configuration.';
    }

    _logDetailedError(error, context, level) {
        const details = {
            fontFamily: context.fontFamily,
            source: context.source,
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            suggestion: this._getSuggestion(error, context)
        };

        console[level]('[FontErrorHandler] Detailed font loading error:', details);
    }

    _logSimpleError(message, level) {
        // debugレベルは本番環境では表示しない
        if (level === 'debug' && !this.config.development?.verboseLogging) {
            return;
        }
        
        // consoleにdebugメソッドがない場合はlogを使用
        const logMethod = console[level] || console.log;
        logMethod(`[FontErrorHandler] ${message}`);
    }

    _updateErrorHistory(errorInfo, context) {
        const errorKey = `${context.source}:${errorInfo.type}`;
        const history = this.errorHistory.get(errorKey) || [];
        
        history.push(Date.now());
        
        const maxHistoryLength = 10;
        if (history.length > maxHistoryLength) {
            history.splice(0, history.length - maxHistoryLength);
        }
        
        this.errorHistory.set(errorKey, history);
    }

    clearErrorHistory() {
        this.errorHistory.clear();
        this.suppressedErrors.clear();
        this.errorCounts.clear();
    }

    getErrorStats() {
        const stats = {};
        
        for (const [errorKey, history] of this.errorHistory.entries()) {
            const [source, type] = errorKey.split(':');
            if (!stats[source]) {
                stats[source] = {};
            }
            stats[source][type] = history.length;
        }

        return stats;
    }
}