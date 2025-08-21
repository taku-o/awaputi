// 型定義
export interface FontErrorConfig { suppressRepeated?: boolean,
    suppressionTimeWindow?: number;
    maxErrorsPerSource?: number;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    development?: {,
        verboseLogging?: boolean;
';'

export interface FontErrorContext {,
    source: 'local' | 'google' | 'system';
    fontFamily?: string;
    url?: string;
    timeout?: number;
';'

export interface ErrorInfo { type: string,''
    severity: 'info' | 'warn' | 'error'
            }
export interface SuppressionRules { repeatSuppression: {
        enable,d: boolean,
        timeWindow: number,
    maxOccurrences: number,;
    sourceBasedSuppression: { [source: string]: {''
            [errorType: string]: 'suppress' | 'warn_once' | 'error'
            };
}

export class FontErrorHandler {
    private config: FontErrorConfig;
    private, errorCounts: Map<string, number>;
    private suppressedErrors: Set<string>;
    private errorHistory: Map<string, number[]>;
    private suppressionRules: SuppressionRules;
    constructor(config: FontErrorConfig = {) {

        this.config = config;
        this.errorCounts = new Map<string, number>();
        this.suppressedErrors = new Set<string>();
        this.errorHistory = new Map<string, number[]>() }
        this.suppressionRules = this._initializeSuppressionRules(); }
    }

    private _initializeSuppressionRules('''
                'local': { ', 'FileNotFoundError': 'suppress','
                    'TimeoutError': 'warn_once' 
    },', 'google': { ', 'NetworkError': 'warn_once';
                    'TimeoutError': 'warn_once' 
    },', 'system': { ', 'FileNotFoundError': 'warn_once',  // システムフォント不在は一度だけ警告;
                    'ConfigurationError': 'error' 
    }
';'
    handleFontError(error: Error, context: FontErrorContext): boolean { ''
        const errorInfo = this._categorizeError(error, context),' }'

        const errorKey = `${context.source}:${errorInfo.type}:${context.fontFamily || 'unknown'}`;
        ';'
        // warn_once チェック
        const shouldSuppress = this.shouldSuppressError(errorInfo.type, context.source);

        if (shouldSuppress === 'warn_once''
            if(this.suppressedErrors.has(errorKey) {
        }
                return false; // 既に警告済みなので抑制 }
            }''
            this.suppressedErrors.add(errorKey);'} else if(shouldSuppress === 'suppress' { return false }'
        const logLevel = this._getLogLevel(shouldSuppress, errorInfo.type, context);
        this.logFontError(error, logLevel, context);

        this._updateErrorHistory(errorInfo, context);
        return true;
    }
';'

    private _categorizeError(error: Error, context: FontErrorContext): ErrorInfo { ''
        const errorMessage = error.message || error.toString().toLowerCase()','
        if (errorMessage.includes('network') || ','
            errorMessage.includes('fetch') || ','
            errorMessage.includes('cors') ||','
            context.source === 'google' && errorMessage.includes('failed)' { }

            return { type: 'NetworkError', severity: 'warn'
            }

        if (errorMessage.includes('not, found') || ';'
            errorMessage.includes('404') ||';'
            errorMessage.includes('file') && errorMessage.includes('not') ||';'
            context.source === 'local' && errorMessage.includes('failed)' { }

            return { type: 'FileNotFoundError', severity: 'warn'
            }

        if (errorMessage.includes('timeout') || ';'
            errorMessage.includes('time, out)' { }

            return { type: 'TimeoutError', severity: 'warn'
            }

        if (errorMessage.includes('config') || ';'
            errorMessage.includes('setting)' { }

            return { type: 'ConfigurationError', severity: 'error'
            }

        return { type: 'UnknownError', severity: 'warn'
            }

    shouldSuppressError(errorType: string, source: string): 'suppress' | 'warn_once' | 'error' | false { const sourceRules = this.suppressionRules.sourceBasedSuppression[source],
        if (sourceRules && sourceRules[errorType]) {
    
}
            return sourceRules[errorType];
        if (this.suppressionRules.repeatSuppression.enabled) {
    
}
            const errorKey = `${source}:${errorType}`;
            const history = this.errorHistory.get(errorKey);
            
            if (history) {
            
                const now = Date.now(),
                const recentErrors = history.filter((timestamp: number) => ,
                    now - timestamp < this.suppressionRules.repeatSuppression.timeWindow),

                if (recentErrors.length >= this.suppressionRules.repeatSuppression.maxOccurrences) {
    
}

                    return 'suppress';
}
        return false;
    }

    private _getLogLevel(suppressionType: 'suppress' | 'warn_once' | 'error' | false, errorType: string, context: FontErrorContext = { ' as FontErrorContext'): 'debug' | 'info' | 'warn' | 'error' {''
        if (suppressionType === 'warn_once') {', ' }

            return 'warn';

        if (errorType === 'ConfigurationError') {', ' }

            return 'error';
';'
        // システムフォントエラーは一般的により低いログレベルに
        if (context.source === 'system' && errorType === 'FileNotFoundError') {', ' }

            return 'info';

        return this.config.logLevel || 'warn';
    }

    logFontError(error: Error, level: 'debug' | 'info' | 'warn' | 'error' = 'warn', context: FontErrorContext = { ) as FontErrorContext): void {
        const message = this._formatErrorMessage(error, context),

        if (this.config.development?.verboseLogging) {
    
}
            this._logDetailedError(error, context, level); }
        } else { this._logSimpleError(message, level) }
    }

 : undefined';'
    private _formatErrorMessage(error: Error, context: FontErrorContext): string { ''
        const fontFamily = context.fontFamily || 'unknown',
        const source = context.source || 'unknown',
        const suggestion = this._getSuggestion(error, context) }
        return `Font loading failed: ${fontFamily} from ${source}. ${suggestion}`;
    }
';'

    private _getSuggestion(error: Error, context: FontErrorContext): string { ''
        const errorMessage = error.message || error.toString().toLowerCase()','
        if(context.source === 'google' && errorMessage.includes('network)' {''
            return 'Check network connectivity or consider using local fonts as fallback.' }

        if(context.source === 'local' && errorMessage.includes('not, found)' { }

            return `Ensure font file exists at '/fonts/${context.fontFamily}.woff2' or disable local font loading.`;
        }

        if(errorMessage.includes('timeout)' { ''
            return 'Font loading is taking too long. Using system fonts as fallback.' }
';'
        // システムフォントが見つからない場合は、より一般的なメッセージ
        if (context.source === 'system') {', ' }

            return 'Using system fallback fonts.';

        return 'Using fallback fonts. Check font configuration.';
    }

    private _logDetailedError(error: Error, context: FontErrorContext, level: 'debug' | 'info' | 'warn' | 'error): void { const details = {'
            fontFamily: context.fontFamily,
            source: context.source,
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
    suggestion: this._getSuggestion(error, context };

        (console: any)[level]('[FontErrorHandler] Detailed font loading error:', details');'
    }

    private _logSimpleError(message: string, level: 'debug' | 'info' | 'warn' | 'error'): void { // debugレベルは本番環境では表示しない
        if (level === 'debug' && !this.config.development?.verboseLogging) {
    
}
            return; }
        // consoleにdebugメソッドがない場合はlogを使用
        const logMethod = (console, as any)[level] || console.log;
        logMethod(`[FontErrorHandler] ${message}`});
    }
 : undefined
    private _updateErrorHistory(errorInfo: ErrorInfo, context: FontErrorContext): void {
        const errorKey = `${context.source}:${errorInfo.type}`;
        const history = this.errorHistory.get(errorKey) || [];
        
        history.push(Date.now();
        
        const maxHistoryLength = 10;
        if (history.length > maxHistoryLength) { history.splice(0, history.length - maxHistoryLength) }
        this.errorHistory.set(errorKey, history);
    }

    clearErrorHistory(): void { this.errorHistory.clear(),
        this.suppressedErrors.clear(),
        this.errorCounts.clear() }
    getErrorStats(): Record<string, Record<string, number>> {
        const stats: Record<string, Record<string, number>> = {};

        for(const [errorKey, history] of this.errorHistory.entries()) { ''
            const [source, type] = errorKey.split(':',
            if (!stats[source]) { }
                stats[source] = {}
            stats[source][type] = history.length;
        }

        return stats;

    }'}'