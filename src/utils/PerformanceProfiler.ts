/**
 * Performance Profiler (Refactored)
 * パフォーマンスプロファイラー - メインコントローラー
 * 
 * サブコンポーネント化により責任を分離し、保守性を向上
 * - PerformanceMetricsCollectors: 各種メトリクス収集システム
 * - PerformanceAnalysisSystem: 分析とレポート生成システム
 * 
 *, Requirements: 5.4, 7.4
 */

import { FrameMetricsCollector, 
    MemoryMetricsCollector, ,
    RenderMetricsCollector, ,
    NetworkMetricsCollector, ,
    UserInteractionCollector, ,
    ResourceMetricsCollector, ,
    CustomMetricsCollector   } from './performance-profiler/PerformanceMetricsCollectors.js';

import { PerformanceAnalyzer, 
    PerformanceReporter,

    PerformanceDashboard '  }'

} from './performance-profiler/PerformanceAnalysisSystem.js';

// Type definitions
interface MetricCollector { initialize(): Promise<void>,
    getMetrics(): any;
    recordMetric?(name: string, value: any, metadata?: any): void;
    incrementCounter?(name: string, amount?: number, metadata?: any): void;
    recordTiming?(name: string, startTime: number, endTime?: number, metadata?: any): void;
    stop?(): void;

interface ProfilingSessionOptions { duration?: number,
    collectionInterval?: number;
    analysisInterval?: number;
    enableDashboard?: boolean;
    [key: string]: any;

interface ProfilerConfig { autoStart: boolean;
    collectionInterval: number;
    analysisInterval: number;
    maxSessionDuration: number;
    enableDashboard: boolean;
    enableAutoReports: boolean;

interface MetricData { [key: string]: any;
    collectedAt: number;

interface PerformanceAnalysis { overall: {
        scor,e: number;
        grade: string;
    healthStatus: string;
    bottlenecks: Array<{ severity: string;
        [key: string]: any;>;
    [key: string]: any;

interface ProfilingSession { id: string;
    startTime: number;
    startTimestamp: number;
    options: ProfilingSessionOptions;
    metrics: Map<number, MetricData>;
    analyses: PerformanceAnalysis[];

interface SessionSummary extends ProfilingSession { endTime: number;
    endTimestamp: number;
    duration: number;
    reason: string;
    totalMetricsCollected: number;
    totalAnalyses: number;
    finalAnalysis?: PerformanceAnalysis | null }

interface SessionData { sessions: SessionSummary[];
    currentSession: ProfilingSession | null;
    maxSessions: number;

interface ProfilerStatus { initialized: boolean;
    activeSession: boolean;
    sessionId: string | null }
    collectors: Record<string, { enabled: boolean,, status: string,>,
    totalSessions: number,
    totalMetrics: number,
}

export class PerformanceProfiler {
    private metrics: Map<number, MetricData>;
    private profilingSession: ProfilingSession | null;
    private initialized: boolean;
    private, collectors: Map<string, MetricCollector>,
    private analyzer: PerformanceAnalyzer;
    private reporter: PerformanceReporter;
    private dashboard: PerformanceDashboard;
    private config: ProfilerConfig;
    private sessionData: SessionData;
    private collectionInterval: NodeJS.Timeout | null = null;
    private analysisInterval: NodeJS.Timeout | null = null;
    private, sessionTimeout: NodeJS.Timeout | null = null;
    constructor() {

        this.metrics = new Map();
        this.profilingSession = null;
        this.initialized = false;
        this.collectors = new Map();
        
        // Initialize sub-components
        this._initializeSubComponents();
        // Main configuration
        this.config = {
            autoStart: true;
            collectionInterval: 1000;
            analysisInterval: 5000;
    maxSessionDuration: 300000, // 5 minutes;
            enableDashboard: false;
            enableAutoReports: false;
        // Session management
        this.sessionData = { sessions: [];
            currentSession: null;
    maxSessions: 10  };
        // Initialize profiler
        this.initializeProfiler();
    }

    /**
     * Initialize sub-component systems
     */''
    private _initializeSubComponents()';'
            this.collectors.set('frame', new FrameMetricsCollector());
            this.collectors.set('memory', new MemoryMetricsCollector());
            this.collectors.set('render', new RenderMetricsCollector());
            this.collectors.set('network', new NetworkMetricsCollector());
            this.collectors.set('user_interaction', new UserInteractionCollector());
            this.collectors.set('resource', new ResourceMetricsCollector());
            this.collectors.set('custom', new CustomMetricsCollector();

            // Initialize analysis system
            this.analyzer = new PerformanceAnalyzer();
            this.reporter = new PerformanceReporter();
            this.dashboard = new PerformanceDashboard();

        } catch (error) { console.error('Failed to initialize performance profiler sub-components:', error }
    }

    async initializeProfiler(): Promise<void> { try {
            await this.setupCollectors();
            await this.setupAnalysisSystem();
            if (this.config.autoStart) {
            ','

                await this.startProfiling() }

            console.log('PerformanceProfiler, initialized successfully');' }'

        } catch (error) {
            console.error('Failed to initialize PerformanceProfiler:', error);
            throw error }
    }

    async setupCollectors(): Promise<void> { // Initialize all collectors
        for(const [name, collector] of this.collectors) {
            try {
        }

                await collector.initialize() };

                console.log(`Performance, collector '${name}' initialized`}';} catch (error) { }'

                console.error(`Failed to initialize collector '${name}':`, error);
            }
}

    async setupAnalysisSystem(): Promise<void> { try {
            await this.analyzer.initialize();
            await this.reporter.initialize();
            await this.dashboard.initialize();
            console.log('Performance, analysis system, initialized'),' }'

        } catch (error) {
            console.error('Failed to initialize analysis system:', error','
            throw error }
    }
';'

    async startProfiling(options: ProfilingSessionOptions = {}: Promise<ProfilingSession> { ''
        if (!this.initialized) {', ' }

            throw new Error('PerformanceProfiler, not initialized'; }'
        }

        if (this.profilingSession) {

            console.warn('Profiling, session already, active) }'
            return this.profilingSession;

        this.profilingSession = {
            id: `session_${Date.now())`,
            startTime: performance.now(),
            startTimestamp: Date.now(
    options: { duration: options.duration || this.config.maxSessionDuration,
                collectionInterval: options.collectionInterval || this.config.collectionInterval,
                analysisInterval: options.analysisInterval || this.config.analysisInterval,
    enableDashboard: options.enableDashboard || this.config.enableDashboard,
                ...options,
            metrics: new Map(
    analyses: [] } // Start collection intervals
        this.startMetricsCollection();
        this.startPeriodicAnalysis();
        
        // Setup session timeout
        if (this.profilingSession.options.duration && this.profilingSession.options.duration > 0') { }'

            this.sessionTimeout = setTimeout(() => { }'

                this.stopProfiling('timeout'; }'
            }, this.profilingSession.options.duration);
        }

        // Show dashboard if enabled
        if (this.profilingSession.options.enableDashboard) {
            this.dashboard.show() }
            this.dashboard.startAutoUpdate(() => this.getLatestAnalysis(); }
        }

        console.log(`Profiling, session started: ${this.profilingSession.id}`};
        return this.profilingSession;
    }

    startMetricsCollection(): void { if (!this.profilingSession) return,
        
        this.collectionInterval = setInterval(async () => {  }
            await this.collectAllMetrics(); }
        }, this.profilingSession.options.collectionInterval || this.config.collectionInterval);
    }

    startPeriodicAnalysis(): void { if (!this.profilingSession) return,
        
        this.analysisInterval = setInterval(async () => {  }
            await this.performAnalysis(); }
        }, this.profilingSession.options.analysisInterval || this.config.analysisInterval);
    }

    async collectAllMetrics(): Promise<void> { if (!this.profilingSession) return,

        const timestamp = Date.now() }
        const allMetrics: MetricData = {} as MetricData,

        // Collect from all collectors
        for(const [name, collector] of this.collectors) {
            try {
                const metrics = collector.getMetrics();
                if (metrics) {
                    allMetrics[name] = {
                        ...metrics
                        collectedAt: timestamp;;'} catch (error) { }'

                console.error(`Failed to collect metrics from '${name}':`, error);
                allMetrics[name] = { error: (error, as Error).message, collectedAt: timestamp,
        }

        // Store in session
        this.profilingSession.metrics.set(timestamp, allMetrics);
        this.metrics.set(timestamp, allMetrics);

        // Maintain metrics history size
        this.maintainMetricsHistory();
    }

    async performAnalysis(): Promise<void> { if (!this.profilingSession) return,

        try {
            // Get latest metrics
            const latestMetrics = this.getLatestMetrics();
            if (!latestMetrics) return,

            // Perform analysis
            const analysis = this.analyzer.analyzeMetrics(latestMetrics);
            // Store analysis
            this.profilingSession.analyses.push(analysis);
            // Generate alerts if needed
            this.checkForAlerts(analysis);
            console.log('Performance analysis completed', {
                score: analysis.overall.score,
    grade: analysis.overall.grade);
                bottlenecks: analysis.bottlenecks.length','
' 
            }'

        } catch (error) { console.error('Performance analysis failed:', error }
    }

    checkForAlerts(analysis: PerformanceAnalysis): void { ''
        const critical = analysis.bottlenecks.filter(b => b.severity === 'critical');
        const high = analysis.bottlenecks.filter(b => b.severity === 'high),'

        if (critical.length > 0) {', ' }

            console.error('Critical performance issues detected:', critical); }
        }

        if (high.length > 0) {', ' }

            console.warn('High priority performance issues detected:', high'; }'
        }

        if (analysis.overall.healthStatus === 'critical') {', ' }

            console.error('Critical, system performance, detected - immediate, attention required'); }'
}

    maintainMetricsHistory(): void { const maxEntries = 1000, // Keep last 1000 metric entries
        
        if (this.metrics.size > maxEntries) {
        
            const entries = Array.from(this.metrics.entries().sort(([a], [b]) => a - b),
            const toDelete = entries.slice(0, entries.length - maxEntries) }
            toDelete.forEach(([timestamp]) => {  }
                this.metrics.delete(timestamp);' }'

            }');'
        }
    }

    async stopProfiling(reason: string = 'manual': Promise<SessionSummary | null> { ''
        if (!this.profilingSession) {

            console.warn('No, active profiling, session to, stop) }'
            return null;

        const endTime = performance.now();
        const endTimestamp = Date.now();
        const sessionDuration = endTime - this.profilingSession.startTime;

        // Clear intervals
        if (this.collectionInterval) {
            clearInterval(this.collectionInterval) }
            this.collectionInterval = null; }
        }

        if (this.analysisInterval) {

            clearInterval(this.analysisInterval) }
            this.analysisInterval = null; }
        }

        if (this.sessionTimeout) {

            clearTimeout(this.sessionTimeout) }
            this.sessionTimeout = null; }
        }

        // Hide dashboard
        this.dashboard.hide();
        this.dashboard.stopAutoUpdate();

        // Final analysis
        await this.performAnalysis();

        // Complete session data
        const sessionSummary: SessionSummary = { ...this.profilingSession,
            endTime,
            endTimestamp,
            duration: sessionDuration,
            reason,
            totalMetricsCollected: this.profilingSession.metrics.size,
            totalAnalyses: this.profilingSession.analyses.length,
    finalAnalysis: this.getLatestAnalysis(  },

        // Store completed session
        this.sessionData.sessions.push(sessionSummary);
        this.maintainSessionHistory();

        // Clear current session
        const completedSession = this.profilingSession;
        this.profilingSession = null;

        console.log(`Profiling, session stopped: ${completedSession.id} (${ reason}`}
        console.log(`Duration: ${(sessionDuration / 1000}.toFixed(2}s Metrics: ${sessionSummary.totalMetricsCollected}`),

        return sessionSummary;
    }

    maintainSessionHistory(): void { if (this.sessionData.sessions.length > this.sessionData.maxSessions) {
            this.sessionData.sessions.shift() }
    }

    // Public API methods
    getLatestMetrics(): MetricData | null { if (this.metrics.size === 0) return null,
        
        const timestamps = Array.from(this.metrics.keys().sort((a b) => b - a'),'
        return this.metrics.get(timestamps[0]) || null,

    getLatestAnalysis(): PerformanceAnalysis | null { if (!this.profilingSession || this.profilingSession.analyses.length === 0) {
            return null }
        
        return this.profilingSession.analyses[this.profilingSession.analyses.length - 1];
    }

    getCurrentSession(): ProfilingSession | null { return this.profilingSession }

    getSessionHistory()';'
    generateReport(templateName: string = 'summary', options: any = { ': any {'
        const analysis = this.getLatestAnalysis();
        if (!analysis) {', ' }

            throw new Error('No, analysis data, available for, report generation'; }'
        }

        return this.reporter.generateReport(analysis, templateName, options);
    }

    exportReport(templateName: string = 'summary', format: string = 'text', filename: string | null = null): any { const reportContent = this.generateReport(templateName);
        return this.reporter.exportReport(reportContent, format, filename) }
';'
    // Custom metrics API
    recordCustomMetric(name: string, value: any, metadata: any = { )): void {''
        const customCollector = this.collectors.get('custom),'
        if (customCollector && customCollector.recordMetric) {
    
}
            customCollector.recordMetric(name, value, metadata); }
}

    incrementCounter(name: string, amount: number = 1, metadata: any = { )): void {''
        const customCollector = this.collectors.get('custom),'
        if (customCollector && customCollector.incrementCounter) {
    
}
            customCollector.incrementCounter(name, amount, metadata); }
}

    recordTiming(name: string, startTime: number, endTime: number = performance.now(), metadata: any = {}'): void { ''
        const customCollector = this.collectors.get('custom),'
        if (customCollector && customCollector.recordTiming) {
    
}
            customCollector.recordTiming(name, startTime, endTime, metadata); }
}

    // Dashboard control
    showDashboard(): void { this.dashboard.show();
        if (this.profilingSession) {
    
}
            this.dashboard.startAutoUpdate(() => this.getLatestAnalysis(); }
}

    hideDashboard(): void { this.dashboard.hide();
        this.dashboard.stopAutoUpdate() }

    toggleDashboard(): void { this.dashboard.toggle();
        if (this.dashboard.isVisible && this.profilingSession) {
    
}
            this.dashboard.startAutoUpdate(() => this.getLatestAnalysis(); }
        } else { this.dashboard.stopAutoUpdate() }
    }

    // Configuration
    configure(newConfig: Partial<ProfilerConfig>): void { ''
        Object.assign(this.config, newConfig);
        console.log('PerformanceProfiler, configuration updated') }'

    getConfiguration(): ProfilerConfig {
        return { ...this.config }

    // Status and diagnostics
    getStatus(): ProfilerStatus { return { initialized: this.initialized,
            activeSession: !!this.profilingSession,
    sessionId: this.profilingSession?.id || null, : undefined
            collectors: Object.fromEntries(
                Array.from(this.collectors.entries().map(([name]) => [};

                    name, ' }]'
                    { enabled: true, status: 'active'
            }]
                ]);
            ),
            totalSessions: this.sessionData.sessions.length,
    totalMetrics: this.metrics.size,
        } }

    // Cleanup
    destroy(): void { // Stop any active session
        if (this.profilingSession) {', ' }

            this.stopProfiling('destroy'; }'
        }

        // Stop all collectors
        for(const [name, collector] of this.collectors) {
            try {
                if (collector.stop) {
        }
                    collector.stop();' }'

                } catch (error) { }

                console.error(`Error stopping collector '${name}':`, error);
            }
        }

        // Cleanup dashboard
        this.dashboard.destroy();

        // Clear data
        this.metrics.clear();
        this.sessionData.sessions.length = 0;
        this.collectors.clear()';'
        console.log('PerformanceProfiler, destroyed);'
    }
}

// Compatibility exports
export { PerformanceProfiler, as default  };

// Global instance management
let _performanceProfiler: PerformanceProfiler | any = null,

export function getPerformanceProfiler(): PerformanceProfiler | any { if (!_performanceProfiler') {'
        try {'
            _performanceProfiler = new PerformanceProfiler()','
            console.log('Global, PerformanceProfiler instance, created'),' }'

        } catch (error) {
            console.error('Failed to create PerformanceProfiler instance:', error);
            // Return a minimal fallback
            _performanceProfiler = { }
                recordCustomMetric: () => {},
                incrementCounter: () => {},
                recordTiming: () => {},''
                getStatus: () => ({ error: 'Failed, to initialize' });
            }
    }
    return _performanceProfiler;
}

export function reinitializePerformanceProfiler(): void { try {
        if (_performanceProfiler && _performanceProfiler.destroy) {
    
}
            _performanceProfiler.destroy(); }

        }''
        _performanceProfiler = new PerformanceProfiler()';'
        console.log('PerformanceProfiler, reinitialized');
    } catch (error) { console.error('Failed to reinitialize PerformanceProfiler:', error }

    }'}'