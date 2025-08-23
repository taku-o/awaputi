// Test file to verify LocalModeErrorHandler syntax fixes
// Mock imports to avoid dependency issues
const LocalExecutionErrorHandler = {} as any;
const DeveloperGuidanceSystem = {} as any;

// Type definitions
interface ErrorStats {
    totalErrors: number;
    errorsByType: Map<string, number>;
    errorsByComponent: Map<string, number>;
    recoveredErrors: number;
    unrecoverableErrors: number;
}

interface ErrorMetadata {
    [key: string]: any;
    feature?: string;
    policy?: string;
    component?: string;
    config?: any;
    resource?: string;
    localModeContext?: boolean;
    timestamp?: string;
}

interface ErrorStatsOutput {
    mainErrorHandler: any;
    localErrorHandler: any;
    localMode: {
        totalErrors: number;
        errorsByType: Record<string, number>;
        errorsByComponent: Record<string, number>;
        recoveredErrors: number;
        unrecoverableErrors: number;
        recoveryRate: number;
    };
}

interface InitializationErrorConfig {
    enableDeveloperGuidance?: boolean;
    [key: string]: any;
}

interface InitializationGuidanceOptions {
    component: string;
    error: string;
    suggestions: string[];
}

interface ErrorInfo {
    error: string;
    stack?: string;
    context: string;
    metadata: ErrorMetadata;
    timestamp: string;
}

export default class LocalModeErrorHandler {
    /**
     * エラー統計
     */
    private static _errorStats: ErrorStats = {
        totalErrors: 0,
        errorsByType: new Map(),
        errorsByComponent: new Map(),
        recoveredErrors: 0,
        unrecoverableErrors: 0
    };

    static handleError(error: Error, context: string = 'GENERAL', metadata: ErrorMetadata = {}): void {
        this._errorStats.totalErrors++;
        this._updateErrorStats('type', error.name || 'UnknownError');
        this._updateErrorStats('component', context);
        
        try {
            if ((LocalExecutionErrorHandler as any).isInitialized) {
                this._delegateToLocalExecutionErrorHandler(error, context, metadata);
            } else {
                this._handleErrorLocally(error, context, metadata);
            }
            
            if (this._isRecoverableError(error)) {
                this._errorStats.recoveredErrors++;
            } else {
                this._errorStats.unrecoverableErrors++;
            }

        } catch (handlingError) {
            console.error('Error in error handling:', handlingError);
            this._errorStats.unrecoverableErrors++;
        }
    }

    static handleCompatibilityError(error: Error, feature: string): boolean {
        this.handleError(error, 'COMPATIBILITY', { feature });
        try {
            if ((LocalExecutionErrorHandler as any).isInitialized) {
                (LocalExecutionErrorHandler as any).handleCompatibilityError(error, feature);
            }
            
            this._applyCompatibilityFallback(feature);
            return true;
            
        } catch (fallbackError) {
            console.error(`Compatibility error handling failed for ${feature}:`, fallbackError);
            return false;
        }
    }

    static handleSecurityError(error: Error, policy: string): void {
        this.handleError(error, 'SECURITY', { policy });
        try {
            if ((LocalExecutionErrorHandler as any).isInitialized) {
                (LocalExecutionErrorHandler as any).handleSecurityError(error, policy);
            }
            
            this._mitigateSecurityIssue(policy);
            
        } catch (mitigationError) {
            console.error(`Security error mitigation failed for ${policy}:`, mitigationError);
        }
    }

    static handleInitializationError(error: Error, component: string, config: InitializationErrorConfig): void {
        this.handleError(error, 'INITIALIZATION', { component, config });
        try {
            this._applyInitializationFallback(component, error);
            
            if (config.enableDeveloperGuidance) {
                const guidanceOptions: InitializationGuidanceOptions = {
                    component,
                    error: error.message,
                    suggestions: this._getInitializationSuggestions(component, error)
                };
                
                (DeveloperGuidanceSystem as any).showInitializationError?.(guidanceOptions);
            }
            
        } catch (fallbackError) {
            console.error(`Initialization error handling failed for ${component}:`, fallbackError);
        }
    }

    static getErrorStats(): ErrorStatsOutput {
        return {
            mainErrorHandler: this._getMainErrorHandlerStats(),
            localErrorHandler: this._getLocalErrorHandlerStats(),
            localMode: {
                totalErrors: this._errorStats.totalErrors,
                errorsByType: Object.fromEntries(this._errorStats.errorsByType),
                errorsByComponent: Object.fromEntries(this._errorStats.errorsByComponent),
                recoveredErrors: this._errorStats.recoveredErrors,
                unrecoverableErrors: this._errorStats.unrecoverableErrors,
                recoveryRate: this._calculateRecoveryRate()
            }
        };
    }

    static clearErrorHistory(): void {
        this._errorStats = {
            totalErrors: 0,
            errorsByType: new Map(),
            errorsByComponent: new Map(),
            recoveredErrors: 0,
            unrecoverableErrors: 0
        };
    }

    private static _delegateToLocalExecutionErrorHandler(error: Error, context: string, metadata: ErrorMetadata): void {
        const enhancedMetadata: ErrorMetadata = {
            ...metadata,
            localModeContext: true,
            timestamp: new Date().toISOString()
        };

        if (context.includes('RESOURCE')) {
            (LocalExecutionErrorHandler as any).handleResourceError(error, metadata.resource || 'unknown');
        } else if (context.includes('COMPATIBILITY')) {
            (LocalExecutionErrorHandler as any).handleCompatibilityError(error, metadata.feature || 'unknown');
        } else if (context.includes('SECURITY')) {
            (LocalExecutionErrorHandler as any).handleSecurityError(error, metadata.policy || 'unknown');
        } else {
            (LocalExecutionErrorHandler as any).handleResourceError(error, context, enhancedMetadata);
        }
    }

    private static _handleErrorLocally(error: Error, context: string, metadata: ErrorMetadata): void {
        const errorInfo: ErrorInfo = {
            error: error.message,
            stack: error.stack,
            context,
            metadata,
            timestamp: new Date().toISOString()
        };

        console.group(`🚨 LocalMode Error (${context})`);
        console.error('Error:', error.message);
        console.error('Context:', context);
        console.error('Metadata:', metadata);
        if (error.stack) {
            console.error('Stack:', error.stack);
        }
        console.groupEnd();
    }

    private static _updateErrorStats(category: 'type' | 'component', key: string): void {
        const statsMap = category === 'type' ? this._errorStats.errorsByType : this._errorStats.errorsByComponent;
        statsMap.set(key, (statsMap.get(key) || 0) + 1);
    }

    private static _isRecoverableError(error: Error): boolean {
        const recoverableTypes: string[] = [
            'NetworkError',
            'TimeoutError',
            'TypeError',
            'ReferenceError'
        ];

        return recoverableTypes.includes(error.name) ||
               error.message.includes('CORS') ||
               error.message.includes('loading');
    }

    private static _applyCompatibilityFallback(feature: string): void {
        const fallbacks: Record<string, () => void> = {
            canvas: () => console.warn('Canvas API not available, using SVG fallback'),
            localStorage: () => console.warn('localStorage not available, using memory storage'),
            modules: () => console.warn('ES6 modules not supported, using legacy loading')
        };
        
        const fallback = fallbacks[feature];
        if (fallback) {
            fallback();
        }
    }

    private static _mitigateSecurityIssue(policy: string): void {
        const mitigations: Record<string, () => void> = {
            'X-Frame-Options': () => {
                console.warn('X-Frame-Options policy detected, optimizing for local execution');
            },
            'Content-Security-Policy': () => {
                console.warn('CSP policy detected, applying local execution adjustments');
            }
        };
        
        const mitigation = mitigations[policy];
        if (mitigation) {
            mitigation();
        }
    }

    private static _applyInitializationFallback(component: string, error: Error): void {
        const fallbacks: Record<string, () => void> = {
            'faviconGenerator': () => {
                console.warn('Favicon generation failed, continuing without favicons');
            },
            'metaTagOptimizer': () => {
                console.warn('Meta tag optimization failed, using default tags');
            },
            'developerGuidance': () => {
                console.warn('Developer guidance system failed, continuing silently');
            }
        };
        
        const fallback = fallbacks[component];
        if (fallback) {
            fallback();
        }
    }

    private static _getInitializationSuggestions(component: string, error: Error): string[] {
        const suggestions: Record<string, string[]> = {
            'faviconGenerator': [
                'Check if Canvas API is supported in this browser',
                'Verify localStorage permissions for caching',
                'Try running with a local server instead of file://'
            ],
            'metaTagOptimizer': [
                'Check if DOM manipulation permissions are available',
                'Verify document.head access',
                'Try refreshing the page'
            ]
        };

        return suggestions[component] || ['Try refreshing the page', 'Check browser console for details'];
    }

    private static _getMainErrorHandlerStats(): any {
        try {
            return (LocalExecutionErrorHandler as any).errorHandlerInstance?.getErrorStats?.() || {};
        } catch (error) {
            return { error: 'Stats unavailable' };
        }
    }

    private static _getLocalErrorHandlerStats(): any {
        try {
            return (LocalExecutionErrorHandler as any).getDebugInfo?.() || {};
        } catch (error) {
            return { error: 'Debug info unavailable' };
        }
    }

    private static _calculateRecoveryRate(): number {
        const total = this._errorStats.totalErrors;

        if (total === 0) return 0;
        return Math.round((this._errorStats.recoveredErrors / total) * 100);
    }
}