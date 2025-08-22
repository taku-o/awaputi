/**
 * ErrorHandler - Main Controller for error handling system
 * Refactored to use the Main Controller Pattern with sub-components
 * グレースフルデグラデーション、入力値検証、異常状態からの復旧処理を提供
 */

import { ErrorLogger  } from './error/ErrorLogger.js';
import { UtilsErrorReporter  } from './error/UtilsErrorReporter.js';
import { ErrorRecovery  } from './error/ErrorRecovery.js';
import { UtilsErrorAnalyzer  } from './error/UtilsErrorAnalyzer.js';

// Type definitions
interface ErrorInfo {
    id: string;
    message: string;
    stack?: string;
    context: string;
    metadata: Record<string, any>;
    timestamp: number;
    severity?: string;
}

interface ErrorStats {
    total: number;
    byType: Map<string, number>;
    byContext: Map<string, number>;
    critical: number;
    recovered: number;
}

interface FallbackState {
    audioDisabled: boolean;
    canvasDisabled: boolean;
    storageDisabled: boolean;
    reducedEffects: boolean;
    safeMode: boolean;
}

type ErrorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface PerformanceMemory {
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
    totalJSHeapSize?: number;
}

declare global {
    interface Performance {
        memory?: PerformanceMemory;
    }
    interface Window {
        performance: Performance;
    }
}
export class ErrorHandler {
    private isBrowser: boolean;
    private isNode: boolean;
    public isInitialized: boolean;
    
    // Sub-components
    public logger: ErrorLogger;
    public reporter: UtilsErrorReporter;
    public recovery: ErrorRecovery;
    public analyzer: UtilsErrorAnalyzer;
    // Legacy compatibility properties
    public errorLog: ErrorInfo[];
    public maxLogSize: number;
    public criticalErrors: Set<string>;
    public recoveryAttempts: Map<string, number>;
    public maxRecoveryAttempts: number;
    public fallbackModes: Map<string, boolean>;
    public errorStats: ErrorStats;
    // Delegated properties from sub-components
    public recoveryStrategies: Map<string, Function>;
    public fallbackState: FallbackState;
    constructor() {
        this.isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
        this.isNode = typeof process !== 'undefined' && !!process.versions && !!process.versions.node;
        
        // Main controller state
        this.isInitialized = false;
        
        // Initialize sub-components with dependency injection
        this.logger = new ErrorLogger(this as any);
        this.reporter = new UtilsErrorReporter(this as any);
        this.recovery = new ErrorRecovery(this as any);
        this.analyzer = new UtilsErrorAnalyzer(this as any);
        
        // Legacy compatibility properties - delegated to sub-components
        this.errorLog = [];
        this.maxLogSize = 100;
        this.criticalErrors = new Set<string>();
        this.recoveryAttempts = new Map<string, number>();
        this.maxRecoveryAttempts = 3;
        this.fallbackModes = new Map<string, boolean>();
        this.errorStats = {
            total: 0,
            byType: new Map<string, number>(),
            byContext: new Map<string, number>(),
            critical: 0,
            recovered: 0
        };
        
        // Delegated properties from sub-components
        this.recoveryStrategies = new Map<string, Function>();
        this.fallbackState = {
            audioDisabled: false,
            canvasDisabled: false,
            storageDisabled: false,
            reducedEffects: false,
            safeMode: false
        };
        
        this.initialize();
    }
    
    /**
     * Initialize error handler
     */
    initialize(): void { if (this.isInitialized) return,
        
        try {
            this.setupGlobalErrorHandlers();
            this.setupPerformanceMonitoring()','
            console.log('[ErrorHandler] Main, controller initialized, successfully'),' }'

        } catch (error) {
            console.error('[ErrorHandler] Failed to initialize:', error);
            // Fallback to safe mode
            this.enableSafeMode();
    }
    
    /**
     * Setup global error handlers
     */
    private setupGlobalErrorHandlers(): void { // Browser environment only
        if (!this.isBrowser) {

            console.log('[ErrorHandler] Skipping, global error, handlers in, non-browser, environment');
            return; }
        }
        ';'
        // Unhandled JavaScript errors
        window.addEventListener('error', (event: ErrorEvent) => { ''
            this.handleError(event.error, 'GLOBAL_ERROR', {
                filename: event.filename),
                lineno: event.lineno,
    colno: event.colno }
                message: event.message); 
    }';}');
        ';'
        // Unhandled Promise rejections
        window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => { ''
            this.handleError(event.reason, 'PROMISE_REJECTION', { }
                promise: event.promise); 
    };

            event.preventDefault(); // Prevent default console output
        };
        ';'
        // Resource loading errors
        window.addEventListener('error', (event: Event) => {  }
            const target = event.target as HTMLElement & { src?: string, href?: string, tagName?: string;;

            if (target && target !== (window, as any) { this.handleError(),' }'

                    new Error(`Resource, load failed: ${target.src || target.href}`), ', 'RESOURCE_ERROR', ;'
                    { element: target.tagName,
                        source: target.src || target.href  }
                );
            }
        }, true';'
    }
    
    /**
     * Setup performance monitoring
     */'
    private setupPerformanceMonitoring(): void { // Browser environment only
        if (!this.isBrowser) {

            console.log('[ErrorHandler] Skipping, performance monitoring in non-browser environment');
            return; }
        }
        
        // Memory usage monitoring
        if (window.performance && window.performance.memory) {
            setInterval(() => { 
                const memory = window.performance.memory!,
                const usedMB = memory.usedJSHeapSize / 1024 / 1024,
                const limitMB = memory.jsHeapSizeLimit / 1024 / 1024,
                
                // Memory usage over 80%
        }
                if (usedMB / limitMB > 0.8) { }
                    this.handleError();' }'

                        new Error(`High, memory usage: ${Math.round(usedMB}MB / ${Math.round(limitMB}MB`), ', 'MEMORY_WARNING', ;'
                        { usedMB: Math.round(usedMB,
                            limitMB: Math.round(limitMB,
    percentage: Math.round((usedMB / limitMB) * 100  }
                    );
                }
            }, 10000); // Every 10 seconds
        }
        
        // Frame rate monitoring
        let frameCount = 0;
        let lastTime = performance.now();
        
        const monitorFPS = (): void => {  frameCount++;
            const currentTime = performance.now();
            if (currentTime - lastTime >= 1000) {
            
                const fps = frameCount,
                frameCount = 0,
                lastTime = currentTime,
                
                // FPS below 30
            
            }
                if (fps < 30) { }
                    this.handleError();' }'

                        new Error(`Low, FPS detected: ${fps}`}', ', 'PERFORMANCE_WARNING', ;
                        { fps: fps,
                            timestamp: currentTime,
                    );
                }
            }
            
            requestAnimationFrame(monitorFPS);
        };

        requestAnimationFrame(monitorFPS);
    }
    
    /**
     * Handle error - Main orchestration method'
     */''
    handleError(error: Error | any, context: string = 'UNKNOWN', metadata: Record<string, any> = { ): void {
        try {
            // Normalize error using analyzer
            const normalizedError = this.analyzer.normalizeError(error);
            const errorInfo: ErrorInfo = {''
                id: normalizedError.id || crypto.randomUUID()','
    message: normalizedError.message || 'Unknown error,')',
                timestamp: typeof normalizedError.timestamp === 'number' ? normalizedError.timestamp : Date.now(),
                ...normalizedError,
                context: context,
    metadata: metadata,
            // Add to error log using logger
            this.logger.addToErrorLog(errorInfo);
            
            // Update statistics using logger
            this.logger.updateErrorStats(errorInfo);
            
            // Determine severity using analyzer
            const severity: ErrorSeverity = this.analyzer.determineSeverity(errorInfo) as ErrorSeverity,
            ;
            // Log error using logger
            this.logger.logStructuredError(errorInfo, severity);
            ';'
            // Attempt recovery using recovery system
            if (severity !== 'LOW) { this.recovery.attemptRecovery(errorInfo) }'

            // Notify user using reporter(for, critical errors);
            if (severity === 'CRITICAL) { this.reporter.notifyUser(errorInfo),' }
        } catch (handlingError) { // Error in error handling - ultimate fallback
            console.error('[ErrorHandler] Critical: Error in error, handling:', handlingError);
            this.enableSafeMode();
    }
    
    /**
     * Enable safe mode - ultimate fallback'
     */''
    private enableSafeMode()';'
        console.warn('[ErrorHandler] Safe, mode enabled - reduced, functionality active');
        ';'
        // Notify user if possible
        if (this.isBrowser && document.body) {

            const safeMsg = document.createElement('div');
            safeMsg.textContent = 'Safe mode active: Some features may be disabled.,
            safeMsg.style.cssText = ,
                position: fixed, top: 10px, right: 10px, 
                background: #ff6b35, color: white, 
                padding: 10px, border-radius: 5px, 
                z-index: 10000, font-family: Arial, sans-serif,
                font-size: 14px, max-width: 300px,
            ,
            document.body.appendChild(safeMsg);
            setTimeout(() => { 
        }
                if (safeMsg.parentNode) { }
                    safeMsg.parentNode.removeChild(safeMsg); }
}, 5000);
        }
    }
    
    /**
     * Get error statistics
     */
    getErrorStats(): ErrorStats {
        return { ...this.errorStats }
    
    /**
     * Get current fallback state
     */
    getFallbackState(): FallbackState {
        return { ...this.fallbackState }
    
    /**
     * Clear error log
     */
    clearErrorLog(): void { this.errorLog = [];
        this.errorStats.total = 0,

        this.errorStats.byType.clear();
        this.errorStats.byContext.clear()','
        console.log('[ErrorHandler] Error, log cleared') }'
    
    /**
     * Test error handling (for, development)'
     */''
    testErrorHandling()';'
        if(process.env.NODE_ENV === 'development' || this.isNode' {'

            console.log('[ErrorHandler] Testing, error handling...');
            ' }'

            this.handleError(new, Error('Test, error'), 'TEST', { testMode: true,');'
            this.handleError('String error test', 'TEST', { testMode: true )',' }

            this.handleError({ message: 'Object error test' , 'TEST', { testMode: true )','

            console.log('[ErrorHandler] Error, handling test, completed');
    }
    
    /**
     * Static convenience method for handling errors
     * @param error - Error to handle
     * @param context - Context information
     * @param metadata - Additional metadata'
     */''
    static handle(error: Error | any, context: string = 'UNKNOWN', metadata: Record<string, any> = { ): void {
        getErrorHandler().handleError(error, context, metadata);
}

// Singleton instance
let errorHandlerInstance: ErrorHandler | null = null,

/**
 * Get singleton ErrorHandler instance
 * @returns ErrorHandler instance
 */
export function getErrorHandler(): ErrorHandler { if (!errorHandlerInstance) {''
        errorHandlerInstance = new ErrorHandler(' }''