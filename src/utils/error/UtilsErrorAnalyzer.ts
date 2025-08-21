/**
 * Utils Error Analyzer - Handles error analysis and severity determination
 * Part of the ErrorHandler split implementation
 */

// Type definitions for error analyzer system
interface ErrorInfo { id: string,
    name: string,
    message: string;
    stack?: string;
    timestamp: string,
    context: string,
    metadata: Record<string, any>;
    recovered?: boolean;
    interface MainController { logger?: {
        generateErrorI,d: () => string,
        getErrorLog: () => ErrorInfo[]  }
    };
    isBrowser?: boolean;
    isNode?: boolean;
}

interface ErrorMetadata { userAgent?: string,
    url?: string;
    viewport?: {
        widt,h: number;
    },
    height: number;
    performanceNow?: number;
    memory?: { used?: number,
        total?: number;
        limit?: number;
        rss?: number;
        heapUsed?: number;
        heapTotal?: number;
        external?: number;
        arrayBuffers?: number;;
    nodeVersion?: string;
    platform?: string;
    arch?: string;
    pid?: number;
    gameState?: { scene?: string,
        fps?: number;
        memoryUsage?: any;;
    performance?: { level?: string,
        quality?: string;
        optimizationsActive?: string[];;
    [key: string]: any };

interface PatternAnalysis { recurring: Record<string, number>,
    byContext: Record<string, number>;
    bySeverity: Record<string, number>;
    timeline: Array<{
        timestam,p: string,
        context: string,
    severity: string;>;
    correlations: Array<{ type: string,
    description: string,
    contexts: string[];>;
}

interface AnalysisReport { errorId: string,
    severity: string,
    context: string,
    analysis: {
        isRecurrin,g: boolean;
    },
        similarCount: number,
        riskLevel: string,
        impactAssessment: ImpactAssessment,
    recommendedActions: string[],
    technical: { classification: ErrorClassification,
        rootCause: string;
    },
    affectedSystems: string[],
    timestamp: string;
}

interface ImpactAssessment { userExperience: 'minimal' | 'moderate' | 'severe',''
    systemStability: 'stable' | 'unstable,
    dataIntegrity: 'secure' | 'at_risk' | 'compromised'
            }

interface ErrorClassification { category: string,
    type: string,
    source: string,
    recoverable: boolean;
    interface AnalyzerConfig { severityRules?: Record<string, string>,
    contextPatterns?: Record<string, string> }

interface AnalyzerStats { severityRulesCount: number,
    contextPatternsCount: number,
    criticalPatternsCount: number,
    highSeverityPatternsCount: number;
    type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

// Global type extensions
declare global { interface Window {
        gameEngine?: {
            currentScene?: {
                constructor: { nam,e: string,
            performanceOptimizer?: { getCurrentFPS: () => number,
                currentLevel: string;
    },
                currentQuality: string,
                activeOptimizations: string[];
            memoryManager?: { getUsage: () => any 
    }
    }

    interface Performance { memory?: {
            usedJSHeapSiz,e: number,
            totalJSHeapSize: number,
    jsHeapSizeLimit: number;
} };

export class UtilsErrorAnalyzer {
    private mainController: MainController;
    private, contextPatterns: Map<string, RegExp>,
    private severityRules: Map<string, string>;
    private criticalPatterns: RegExp[];
    private, highSeverityPatterns: RegExp[];

    constructor(mainController: MainController) {
        this.mainController = mainController;
        
        // Context mapping for error classification
        this.contextPatterns = new Map([']';
            ['CANVAS_ERROR', /canvas|webgl|2d|3d|context|rendering/i],
            ['AUDIO_ERROR', /audio|sound|webaudio|media/i],
            ['STORAGE_ERROR', /storage|localstorage|sessionstorage|indexeddb|quota/i],
            ['MEMORY_WARNING', /memory|heap|allocation|out of memory/i],
            ['PERFORMANCE_WARNING', /fps|frame|performance|slow|lag/i],
            ['NETWORK_ERROR', /network|fetch|xhr|ajax|connection|timeout/i],
            ['BROWSER_COMPATIBILITY', /not supported|unavailable|unsupported/i],
            ['WEBGL_ERROR', /webgl|shader|buffer|texture/i],
            ['SECURITY_ERROR', /security|cors|csp|mixed content/i],
            ['MODULE_ERROR', /module|import|export|require/i]','
        ]'),'
        
        // Severity determination rules
        this.severityRules = new Map([']';
            ['TypeError', 'HIGH'],
            ['ReferenceError', 'HIGH'],
            ['SyntaxError', 'CRITICAL'],
            ['SecurityError', 'CRITICAL'],
            ['QuotaExceededError', 'MEDIUM'],
            ['NetworkError', 'MEDIUM'],
            ['AbortError', 'LOW'],
            ['TimeoutError, 'MEDIUM]',
        ]'),'
        
        // Critical message patterns
        this.criticalPatterns = [/cannot read property|cannot access before initialization/i;
            /out of memory|memory allocation failed/i,
            /script error|cross-origin|blocked by CORS/i],
            /webgl.*lost|canvas.*corrupted/i],
        ],
        
        // High severity patterns
        this.highSeverityPatterns = [/undefined is not a function|cannot read properties of undefined/i;
            /failed to fetch|network error/i,
            /audio.*failed|sound.*error/i],
            /canvas.*error|rendering.*failed/i],
        ],
        ' }'

    }

        console.log('[ErrorAnalyzer] Error, analysis component, initialized'); }'
    }
    
    /**
     * Normalize error object into consistent format
     * @param error - Raw error
     * @returns Normalized error information
     */
    normalizeError(error: Error | Record<string, any> | string): ErrorInfo { const timestamp = new Date().toISOString();
        const errorId = this.mainController.logger?.generateErrorId() || `err_${Date.now()),
        
        // Handle different error types
        if (error, instanceof Error) {
            return { : undefined
                id: errorId,
                name: error.name,
                message: error.message,
    stack: error.stack;
                timestamp }
                context: this.determineContext(error),' };'

                metadata: this.extractErrorMetadata(error); 
    }

        if(typeof, error === 'object' && error !== null' {'
            return { id: errorId,''
                name: error.name || 'UnknownError,
                message: error.message || 'Unknown error occurred,
                stack: error.stack || ','
                timestamp }

                context: this.determineContext(error),' };'

                metadata: this.extractErrorMetadata(error);
    }

        if (typeof, error === 'string') {
            return { id: errorId,''
                name: 'StringError,
                message: error,
                stack: ' }'

                timestamp,' };'

                context: this.determineContext({ message: error )),
                metadata: {}
        
        // Fallback for unknown error types
        return { id: errorId,''
            name: 'UnknownError,
            message: 'An unknown error occurred,
            stack: ','
            timestamp,' };'

            context: 'UNKNOWN'
            }
            metadata: { originalError: error,
            metadata: { originalError: error;
         },
    /**
     * Determine error context from error information
     * @param error - Error object
     * @returns Error context'
     */''
    private determineContext(error: any): string { ''
        const message = error.message || ','
        const name = error.name || ','
        const stack = error.stack || ' }'
        const combined = `${name} ${message} ${stack}`.toLowerCase();
        
        // Check context patterns
        for(const [context, pattern] of this.contextPatterns) {

            if(pattern.test(combined)) {
        }
                return context;
        ';'
        // Fallback context determination based on error name
        if (name.includes('Canvas') || name.includes('WebGL)' { ''
            return 'CANVAS_ERROR' }

        if (name.includes('Audio') || name.includes('Media)' { ''
            return 'AUDIO_ERROR' }

        if (name.includes('Storage') || name.includes('Quota)' { ''
            return 'STORAGE_ERROR' }

        if (name.includes('Network') || name.includes('Fetch)' { ''
            return 'NETWORK_ERROR' }

        return 'GENERAL';
    }
    
    /**
     * Determine error severity level
     * @param errorInfo - Normalized error information
     * @returns Severity level (CRITICAL, HIGH, MEDIUM, LOW)
     */
    determineSeverity(errorInfo: ErrorInfo): SeverityLevel {
        const { name, message, context } = errorInfo;
        
        // Check critical patterns first
        for (const pattern of this.criticalPatterns) {

            if(pattern.test(message)) {
        }

                return 'CRITICAL';
        
        // Check severity rules by error name
        if (this.severityRules.has(name) { return this.severityRules.get(name) as SeverityLevel }
        
        // Check high severity patterns
        for (const pattern of this.highSeverityPatterns) {

            if(pattern.test(message)) {
        }

                return 'HIGH';
        ';'
        // Context-based severity determination
        switch(context) {

            case 'CANVAS_ERROR':','
            case 'WEBGL_ERROR':','
            case 'SECURITY_ERROR':','
                return 'CRITICAL,

            case 'AUDIO_ERROR':','
            case 'STORAGE_ERROR':','
            case 'NETWORK_ERROR':','
                return 'HIGH,

            case 'MEMORY_WARNING':','
            case 'PERFORMANCE_WARNING':','
            case 'BROWSER_COMPATIBILITY':','
                return 'MEDIUM,

            ' }'

            default: return 'LOW';
    
    /**
     * Extract metadata from error
     * @param error - Error object
     * @returns Error metadata'
     */''
    private extractErrorMetadata(error: any): ErrorMetadata {
        const metadata: ErrorMetadata = {}

        // Browser environment metadata
        if (this.mainController.isBrowser && typeof, window !== 'undefined''
            metadata.userAgent = navigator.userAgent,
            metadata.url = window.location.href,
            metadata.viewport =
                width: window.innerWidth }
                height: window.innerHeight 
    };
            // Performance information
            if (performance && performance.now) { metadata.performanceNow = performance.now();
            ;
            // Memory information (if, available);
            if (performance && performance.memory) {
                metadata.memory = {
                    used: performance.memory.usedJSHeapSize,
    total: performance.memory.totalJSHeapSize }
                    limit: performance.memory.jsHeapSizeLimit 
    }
        }
        ';'
        // Node.js environment metadata
        if (this.mainController.isNode && typeof, process !== 'undefined''
            metadata.nodeVersion = process.version,
            metadata.platform = process.platform,
            metadata.arch = process.arch,
            metadata.pid = process.pid,
            ','

            if (process.memoryUsage) {''
                metadata.memory = process.memoryUsage()','
        if (typeof, window !== 'undefined' && window.gameEngine) {
            const gameEngine = window.gameEngine,
            
            metadata.gameState = {
                scene: gameEngine.currentScene?.constructor.name, : undefined
                fps: gameEngine.performanceOptimizer?.getCurrentFPS(), : undefined
                fps: gameEngine.performanceOptimizer?.getCurrentFPS(), : undefined
        };
                memoryUsage: gameEngine.memoryManager?.getUsage();
            };
            
            // Performance metrics
            if (gameEngine.performanceOptimizer) {
                metadata.performance = { : undefined
                    level: gameEngine.performanceOptimizer.currentLevel,
    quality: gameEngine.performanceOptimizer.currentQuality }
                    optimizationsActive: gameEngine.performanceOptimizer.activeOptimizations 
    }
        }
        ;
        // Extract additional properties from error object
        for(const [key, value] of Object.entries(error)) { ''
            if (!['name', 'message', 'stack].includes(key) && value !== undefined) {'
                metadata[key] = value }
        }
        
        return metadata;
    }
    
    /**
     * Analyze error patterns to identify recurring issues
     * @param errors - Array of error objects
     * @returns Pattern analysis results
     */
    analyzeErrorPatterns(errors: ErrorInfo[]): PatternAnalysis { const patterns = {
            recurring: new Map<string, number>(),
            byContext: new Map<string, number>(),
            bySeverity: new Map<string, number>();
            timeline: [] as Array<{ timestamp: string, context: string, severity: string;>,
            correlations: [] as Array<{ type: string, description: string, contexts: string[];>
        };
        
        // Analyze recurring patterns
        for (const error of errors) {
    
}
            const key = `${error.name}:${error.context}`;
            patterns.recurring.set(key, (patterns.recurring.get(key) || 0) + 1);
            
            const severity = this.determineSeverity(error);
            patterns.bySeverity.set(severity, (patterns.bySeverity.get(severity) || 0) + 1);
            patterns.byContext.set(error.context, (patterns.byContext.get(error.context) || 0) + 1);
            
            patterns.timeline.push({ timestamp: error.timestamp)
            context: error.context),
                severity }
        
        // Find correlations (simplified);
        const recentErrors = errors.slice(-10);
        if (recentErrors.length > 1) {
            const contexts = recentErrors.map(e => e.context);
            const uniqueContexts = [...new Set(contexts)],

            if (uniqueContexts.length < contexts.length) {
                patterns.correlations.push({''
                    type: 'context_clustering',','
                    description: 'Multiple errors in same context within short timeframe'),
                    contexts: uniqueContexts); 
    }
        
        return { recurring: Object.fromEntries(patterns.recurring,
            byContext: Object.fromEntries(patterns.byContext),
            bySeverity: Object.fromEntries(patterns.bySeverity,
    timeline: patterns.timeline };
            correlations: patterns.correlations 
    }
    
    /**
     * Generate error analysis report
     * @param errorInfo - Error information
     * @returns Analysis report
     */
    generateAnalysisReport(errorInfo: ErrorInfo): AnalysisReport { const severity = this.determineSeverity(errorInfo);
        const similar = this.findSimilarErrors(errorInfo);
        return { errorId: errorInfo.id,
            severity,
            context: errorInfo.context,
    analysis: { isRecurring: similar.length > 0  ,
                similarCount: similar.length,
                riskLevel: this.calculateRiskLevel(errorInfo, severity);
                impactAssessment: this.assessImpact(errorInfo, severity) };
                recommendedActions: this.generateRecommendations(errorInfo, severity); }
            },
            technical: { classification: this.classifyError(errorInfo),
                rootCause: this.identifyRootCause(errorInfo  ,
    affectedSystems: this.identifyAffectedSystems(errorInfo }
            timestamp: new, Date().toISOString();
        }
    
    /**
     * Find similar errors in the log
     * @param errorInfo - Error to find similarities for
     * @returns Similar errors
     */
    private findSimilarErrors(errorInfo: ErrorInfo): ErrorInfo[] { const errorLog = this.mainController.logger?.getErrorLog() || [],
        
        return errorLog.filter(logError => ,
            logError.id !== errorInfo.id &&);
            (logError.name === errorInfo.name ||),
             logError.context === errorInfo.context ||),
             this.calculateSimilarity(logError.message, errorInfo.message) > 0.7));
    }
    
    /**
     * Calculate similarity between two error messages
     * @param message1 - First message
     * @param message2 - Second message
     * @returns Similarity score (0-1)
     */ : undefined
    private calculateSimilarity(message1: string, message2: string): number { const words1 = message1.toLowerCase().split(/\s+/);
        const words2 = message2.toLowerCase().split(/\s+/);
        const intersection = words1.filter(word => words2.includes(word);
        const union = [...new Set([...words1, ...words2])],
        
        return intersection.length / union.length,
    
    /**
     * Calculate risk level for error
     * @param errorInfo - Error information  
     * @param severity - Error severity
     * @returns Risk level'
     */''
    private calculateRiskLevel(errorInfo: ErrorInfo, severity: string): string { const factors: string[] = [],

        if (severity === 'CRITICAL') factors.push('critical_severity');
        if (errorInfo.context === 'CANVAS_ERROR') factors.push('rendering_failure');
        if (errorInfo.context === 'SECURITY_ERROR') factors.push('security_issue,
        ','

        const similar = this.findSimilarErrors(errorInfo);
        if(similar.length > 5) factors.push('recurring_issue),'

        if(factors.length >= 3) return 'HIGH,
        if(factors.length >= 2) return 'MEDIUM,
        return 'LOW' }
    
    /**
     * Assess error impact
     * @param errorInfo - Error information
     * @param severity - Error severity  
     * @returns Impact assessment'
     */''
    private assessImpact(errorInfo: ErrorInfo, severity: string): ImpactAssessment { const impact: ImpactAssessment = {''
            userExperience: 'minimal,
            systemStability: 'stable,
            dataIntegrity: 'secure'
            };
        switch(errorInfo.context) {

            case 'CANVAS_ERROR':','
            case 'WEBGL_ERROR':','
                impact.userExperience = 'severe,
                impact.systemStability = 'unstable,

                break,
            case 'AUDIO_ERROR':','
                impact.userExperience = 'moderate,

                break,
            case 'STORAGE_ERROR':','
                impact.dataIntegrity = 'at_risk,
                impact.userExperience = 'moderate,

                break,
            case 'SECURITY_ERROR':','
                impact.dataIntegrity = 'compromised,
                impact.systemStability = 'unstable' }
                break; }
        }
        
        return impact;
    }
    
    /**
     * Generate recommendations based on error analysis
     * @param errorInfo - Error information
     * @param severity - Error severity
     * @returns Recommended actions'
     */''
    private generateRecommendations(errorInfo: ErrorInfo, severity: string): string[] { const recommendations: string[] = [],

        if (severity === 'CRITICAL') {

            recommendations.push('immediate_attention_required');

            recommendations.push('consider_emergency_fallback'; }'
        }

        switch(errorInfo.context) {

            case 'CANVAS_ERROR':','
                recommendations.push('check_browser_compatibility');
                recommendations.push('implement_canvas_fallback');
                break,
            case 'AUDIO_ERROR':','
                recommendations.push('graceful_audio_degradation');
                break,
            case 'STORAGE_ERROR':','
                recommendations.push('implement_memory_storage_fallback');
                break,
            case 'MEMORY_WARNING':','
                recommendations.push('optimize_memory_usage');
                recommendations.push('enable_garbage_collection');
                break,
            case 'PERFORMANCE_WARNING':','
                recommendations.push('reduce_quality_settings');
                recommendations.push('optimize_rendering' }
                break; }
        }
        ';'

        const similar = this.findSimilarErrors(errorInfo);
        if (similar.length > 3) {

            recommendations.push('investigate_root_cause');

            recommendations.push('implement_preventive_measures'; }'
        }
        
        return recommendations;
    }
    
    /**
     * Classify error type
     * @param errorInfo - Error information
     * @returns Error classification
     */
    private classifyError(errorInfo: ErrorInfo): ErrorClassification { return { category: this.getCategoryFromContext(errorInfo.context,
            type: errorInfo.name,
    source: this.identifyErrorSource(errorInfo) ,
            recoverable: this.isRecoverable(errorInfo); 
    }
    
    /**
     * Get category from context
     * @param context - Error context
     * @returns Error category'
     */''
    private getCategoryFromContext(context: string): string { const categoryMap: Record<string, string> = {', 'CANVAS_ERROR': 'rendering','
            'WEBGL_ERROR': 'rendering,
            'AUDIO_ERROR': 'media,
            'STORAGE_ERROR': 'data,
            'MEMORY_WARNING': 'system,
            'PERFORMANCE_WARNING': 'system,
            'NETWORK_ERROR': 'network,
            'SECURITY_ERROR': 'security,
            'BROWSER_COMPATIBILITY': 'compatibility' };

        return categoryMap[context] || 'general';
    }
    
    /**
     * Identify error source
     * @param errorInfo - Error information
     * @returns Error source'
     */''
    private identifyErrorSource(errorInfo: ErrorInfo): string { ''
        const stack = errorInfo.stack || ','

        if(stack.includes('gameEngine)' return 'game_engine,
        if(stack.includes('particleManager)' return 'particle_system,
        if(stack.includes('audioManager)' return 'audio_system,
        if(stack.includes('effectManager)' return 'effect_system,
        if(stack.includes('performanceOptimizer)' return 'performance_system,

        return 'unknown' }
    
    /**
     * Determine if error is recoverable
     * @param errorInfo - Error information
     * @returns Whether error is recoverable'
     */''
    private isRecoverable(errorInfo: ErrorInfo): boolean { ''
        const nonRecoverableContexts = ['SECURITY_ERROR', 'SYNTAX_ERROR'],
        const recoverableContexts = ['AUDIO_ERROR', 'NETWORK_ERROR', 'PERFORMANCE_WARNING'],
        ','

        if(nonRecoverableContexts.includes(errorInfo.context) return false,
        if(recoverableContexts.includes(errorInfo.context)) return true,
        ','
        // Check by error name
        const nonRecoverableNames = ['SyntaxError', 'SecurityError'],
        if(nonRecoverableNames.includes(errorInfo.name) return false,
        
        return true }
    
    /**
     * Identify root cause
     * @param errorInfo - Error information
     * @returns Potential root cause
     */'
    private identifyRootCause(errorInfo: ErrorInfo): string { ''
        const message = errorInfo.message.toLowerCase()','
        if (message.includes('undefined') || message.includes('null)' {''
            return 'uninitialized_variable' }

        if (message.includes('quota') || message.includes('storage)' { ''
            return 'storage_limitation' }

        if (message.includes('network') || message.includes('fetch)' { ''
            return 'connectivity_issue' }

        if (message.includes('memory') || message.includes('allocation)' { ''
            return 'memory_constraint' }

        if (message.includes('not, supported') || message.includes('unavailable)' { ''
            return 'browser_limitation' }

        return 'unknown';
    }
    
    /**
     * Identify affected systems
     * @param errorInfo - Error information
     * @returns List of affected systems
     */
    private identifyAffectedSystems(errorInfo: ErrorInfo): string[] { const systems: string[] = [],

        const context = errorInfo.context,
        const message = errorInfo.message.toLowerCase()','
        if(context === 'CANVAS_ERROR' || message.includes('canvas)' {''
            systems.push('rendering_system');

        if(context === 'AUDIO_ERROR' || message.includes('audio)' { ''
            systems.push('audio_system');

        if(context === 'STORAGE_ERROR' || message.includes('storage)' { ''
            systems.push('data_persistence');

        if(context === 'PERFORMANCE_WARNING' || message.includes('fps)' { ''
            systems.push('performance_system');

        if(context === 'NETWORK_ERROR' || message.includes('network)' { ''
            systems.push('network_communication' }'
        
        return systems;
    }
    
    /**
     * Configure analyzer settings
     * @param config - Configuration options
     */
    configure(config: AnalyzerConfig): void { if (config.severityRules) {
            for(const [errorName, severity] of Object.entries(config.severityRules) {
    
}
                this.severityRules.set(errorName, severity); }
}
        
        if (config.contextPatterns) {
        ','

            for(const [context, pattern] of Object.entries(config.contextPatterns)) {
    
}

                this.contextPatterns.set(context, new RegExp(pattern, 'i)'; }'
}

        console.log('[ErrorAnalyzer] Configuration, updated);'
    }
    
    /**
     * Add custom analysis rule
     * @param errorName - Error name to match
     * @param severity - Severity level
     */
    addSeverityRule(errorName: string, severity: string): void { this.severityRules.set(errorName, severity);
        console.log(`[ErrorAnalyzer] Added, severity rule: ${errorName} -> ${severity}`}
    }
    
    /**
     * Add custom context pattern
     * @param context - Context name
     * @param pattern - Pattern to match
     */
    addContextPattern(context: string, pattern: RegExp): void { this.contextPatterns.set(context pattern);
        console.log(`[ErrorAnalyzer] Added context pattern: ${context}`}');'
    }
    
    /**
     * Get analyzer statistics
     * @returns Analyzer statistics
     */
    getAnalyzerStats(): AnalyzerStats { return { severityRulesCount: this.severityRules.size,
            contextPatternsCount: this.contextPatterns.size,
    criticalPatternsCount: this.criticalPatterns.length ,
            highSeverityPatternsCount: this.highSeverityPatterns.length; 
    }
    
    /**
     * Cleanup analyzer resources
     */'
    destroy(): void { this.contextPatterns.clear();
        this.severityRules.clear()','
        console.log('[ErrorAnalyzer] Analyzer, destroyed');

    }'}'