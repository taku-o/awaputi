// Type definitions
interface PerformanceMetrics {
    frameTime: number;
    renderTime: number;
    cullTime: number;
    compositionTime: number;
    dirtyRegionTime: number;
    renderEfficiency: number;
    cullingEfficiency: number;
    cacheEfficiency: number;
    overallEfficiency: number;
    performanceGain?: number;
}

interface PerformanceBaseline {
    renderTime: number;
    drawCalls: number;
    pixelsRendered: number;
}

interface PerformanceFrameData {
    timestamp: number;
    renderTime: number;
    totalObjects: number;
    efficiency: number;
}

interface PerformanceConfig {
    enabled: boolean;
    metrics: PerformanceMetrics;
    history: PerformanceFrameData[];
    historySize: number;
    adaptiveMode: boolean;
    performanceTarget: number;
    optimizationTrigger: number;
    baseline: PerformanceBaseline;
}

interface PerformanceStats extends PerformanceMetrics {
    uptime: number;
    totalFrames: number;
    avgFPS: number;
    baseline: PerformanceBaseline;
    optimizationLevel: string;
}

type OptimizationLevel = 'conservative' | 'balanced' | 'aggressive';
type PerformanceTrend = 'improving' | 'stable' | 'degrading';
type OperationType = 'cull' | 'composition' | 'dirtyRegion';

interface PerformanceConfigUpdate {
    enabled?: boolean;
    historySize?: number;
    adaptiveMode?: boolean;
    performanceTarget?: number;
    optimizationTrigger?: number;
    baseline?: Partial<PerformanceBaseline>;
}

/**
 * RenderingPerformanceMonitor - Rendering performance monitoring and optimization
 * レンダリングパフォーマンス監視システム - 描画性能の計測と自動最適化
 * 
 * 主要機能:
 * - フレームレート・レンダリング時間の監視
 * - 適応的品質調整
 * - パフォーマンス履歴の管理
 * - 自動最適化トリガー
 */
export class RenderingPerformanceMonitor {
    private config: PerformanceConfig;
    private performanceInterval: NodeJS.Timeout | null;
    private monitoringStartTime: number;
    private optimizationLevel?: OptimizationLevel;

    constructor() {
        // Performance monitoring
        this.config = {
            enabled: true,
            metrics: {
                frameTime: 0,
                renderTime: 0,
                cullTime: 0,
                compositionTime: 0,
                dirtyRegionTime: 0,
                // Efficiency metrics
                renderEfficiency: 1.0,
                cullingEfficiency: 1.0,
                cacheEfficiency: 1.0,
                overallEfficiency: 1.0
            },
            // Performance history
            history: [],
            historySize: 60, // 1 second at 60fps
            // Adaptive optimization
            adaptiveMode: true,
            performanceTarget: 16.67, // 60fps target
            optimizationTrigger: 20.0, // Trigger optimization at 50fps
            // Benchmarking
            baseline: {
                renderTime: 16.67,
                drawCalls: 500,
                pixelsRendered: 0
            }
        };
        // Performance intervals
        this.performanceInterval = null;
        this.monitoringStartTime = performance.now();

        this.establishPerformanceBaseline();
    }

    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring(): void {
        if (!this.config.enabled || this.performanceInterval) return;
        
        // Monitor rendering performance every frame
        this.performanceInterval = setInterval(() => {
            this.updatePerformanceMetrics();
            this.optimizeBasedOnPerformance();
        }, 16); // ~60fps monitoring
        
        this.monitoringStartTime = performance.now();
    }

    /**
     * Stop performance monitoring
     */
    stopPerformanceMonitoring(): void {
        if (this.performanceInterval) {
            clearInterval(this.performanceInterval);
            this.performanceInterval = null;
        }
    }

    /**
     * Establish performance baseline
     */
    establishPerformanceBaseline(): void {
        // For now, we'll use reasonable defaults
        
        const baseline = this.config.baseline;
        baseline.renderTime = 10.0; // 10ms baseline render time
        baseline.drawCalls = 300; // 300 draw calls baseline
        baseline.pixelsRendered = 1920 * 1080; // Full HD baseline
    }

    /**
     * Update rendering performance metrics
     */
    updateRenderingPerformance(renderTime: number, totalObjects: number): void {
        const metrics = this.config.metrics;
        
        // Update basic metrics
        metrics.frameTime = renderTime;
        metrics.renderTime = renderTime;
        
        // Calculate efficiency metrics
        metrics.renderEfficiency = Math.min(1.0, this.config.baseline.renderTime / renderTime);
        
        // Update performance history
        this.config.history.push({
            timestamp: performance.now(),
            renderTime,
            totalObjects,
            efficiency: metrics.renderEfficiency
        });
        
        // Limit history size
        if (this.config.history.length > this.config.historySize) {
            this.config.history.shift();
        }
        
        // Update overall efficiency
        this.updatePerformanceMetrics();
    }

    /**
     * Update comprehensive performance metrics
     */
    updatePerformanceMetrics(): void {
        const metrics = this.config.metrics;
        const history = this.config.history;
        
        if (history.length === 0) return;
        
        // Calculate averages from recent history
        const recentFrames = history.slice(-10); // Last 10 frames
        const avgRenderTime = recentFrames.reduce((sum, frame) => sum + frame.renderTime, 0) / recentFrames.length;
        const avgEfficiency = recentFrames.reduce((sum, frame) => sum + frame.efficiency, 0) / recentFrames.length;
        
        // Update metrics
        metrics.renderTime = avgRenderTime;
        metrics.renderEfficiency = avgEfficiency;
        
        // Calculate cache and culling efficiency
        metrics.cacheEfficiency = this.calculateCacheEfficiency();
        metrics.cullingEfficiency = this.calculateCullingEfficiency();
        
        // Calculate overall efficiency
        metrics.overallEfficiency = (
            metrics.renderEfficiency * 0.4 +
            metrics.cacheEfficiency * 0.3 +
            metrics.cullingEfficiency * 0.3
        );
        
        // Calculate performance gain
        const performanceGain = this.calculatePerformanceGain();
        metrics.performanceGain = performanceGain;
    }

    /**
     * Calculate cache efficiency
     */
    calculateCacheEfficiency(): number {
        // This would normally check actual cache hit rates
        // For now, return a reasonable estimate based on render time
        const renderTime = this.config.metrics.renderTime;
        const baseline = this.config.baseline.renderTime;
        
        if (renderTime <= baseline * 0.5) {
            return 1.0; // Excellent caching
        } else if (renderTime <= baseline) {
            return 0.8; // Good caching
        } else {
            return 0.5; // Poor caching
        }
    }

    /**
     * Calculate culling efficiency
     */
    calculateCullingEfficiency(): number {
        // This would normally check actual culling statistics
        // For now, return a reasonable estimate
        return 0.7; // Assume 70% culling efficiency
    }

    /**
     * Calculate performance gain percentage
     */
    calculatePerformanceGain(): number {
        const currentRenderTime = this.config.metrics.renderTime;
        const baselineRenderTime = this.config.baseline.renderTime;
        
        if (baselineRenderTime <= 0) return 0;
        
        const gain = ((baselineRenderTime - currentRenderTime) / baselineRenderTime) * 100;
        return Math.max(0, gain);
    }

    /**
     * Optimize based on current performance
     */
    optimizeBasedOnPerformance(): void {
        if (!this.config.adaptiveMode) return;
        
        const metrics = this.config.metrics;
        const trigger = this.config.optimizationTrigger;
        
        // Check if optimization is needed
        if (metrics.renderTime > trigger) {
            this.triggerPerformanceOptimizations();
        } else if (metrics.renderTime < this.config.performanceTarget) {
            this.relaxOptimizations();
        }
    }

    /**
     * Trigger performance optimizations
     */
    triggerPerformanceOptimizations(): void {
        // This would normally trigger various optimizations
        // Based on the current optimization level
        
        const renderTime = this.config.metrics.renderTime;

        if (renderTime > 25.0) {
            // < 40fps - aggressive optimization
            this.setOptimizationLevel('aggressive');
        } else if (renderTime > 20.0) {
            // < 50fps - balanced optimization
            this.setOptimizationLevel('balanced');
        } else {
            this.setOptimizationLevel('conservative');
        }
    }

    /**
     * Relax optimizations when performance is good
     */
    relaxOptimizations(): void {
        const renderTime = this.config.metrics.renderTime;

        if (renderTime < 12.0) {
            // > 80fps - can relax optimizations
            this.setOptimizationLevel('conservative');
        }
    }

    /**
     * Set optimization level
     */
    setOptimizationLevel(level: OptimizationLevel): void {
        // This would normally adjust various optimization parameters
        // For now, just track the level
        this.optimizationLevel = level;
    }

    /**
     * Get performance statistics
     */
    getStats(): PerformanceStats {
        const uptime = (performance.now() - this.monitoringStartTime) / 1000;
        const totalFrames = this.config.history.length;
        const avgFPS = totalFrames > 0 ? totalFrames / (uptime || 1) : 0;
        
        return {
            ...this.config.metrics,
            uptime,
            totalFrames,
            avgFPS,
            baseline: { ...this.config.baseline },
            optimizationLevel: this.optimizationLevel || 'balanced'
        };
    }

    /**
     * Record timing for specific operation
     */
    recordTiming(operation: OperationType, time: number): void {
        switch(operation) {
            case 'cull':
                this.config.metrics.cullTime = time;
                break;
            case 'composition':
                this.config.metrics.compositionTime = time;
                break;
            case 'dirtyRegion':
                this.config.metrics.dirtyRegionTime = time;
                break;
        }
    }

    /**
     * Get performance trend
     */
    getPerformanceTrend(): PerformanceTrend {
        const history = this.config.history;
        if(history.length < 10) return 'stable';
        
        const recent = history.slice(-5);
        const older = history.slice(-10, -5);
        const recentAvg = recent.reduce((sum, frame) => sum + frame.renderTime, 0) / recent.length;
        const olderAvg = older.reduce((sum, frame) => sum + frame.renderTime, 0) / older.length;
        
        const change = (recentAvg - olderAvg) / olderAvg;

        if(change < -0.05) return 'improving';
        if(change > 0.05) return 'degrading';
        return 'stable';
    }

    /**
     * Configure performance monitor
     */
    configure(config: PerformanceConfigUpdate): void {
        if (config.enabled !== undefined) this.config.enabled = config.enabled;
        if (config.historySize !== undefined) this.config.historySize = config.historySize;
        if (config.adaptiveMode !== undefined) this.config.adaptiveMode = config.adaptiveMode;
        if (config.performanceTarget !== undefined) this.config.performanceTarget = config.performanceTarget;
        if (config.optimizationTrigger !== undefined) this.config.optimizationTrigger = config.optimizationTrigger;
        
        if (config.baseline) {
            Object.assign(this.config.baseline, config.baseline);
        }
    }

    /**
     * Reset performance monitor
     */
    reset(): void {
        this.config.history = [];
        this.config.metrics = {
            frameTime: 0,
            renderTime: 0,
            cullTime: 0,
            compositionTime: 0,
            dirtyRegionTime: 0,
            renderEfficiency: 1.0,
            cullingEfficiency: 1.0,
            cacheEfficiency: 1.0,
            overallEfficiency: 1.0
        };
        this.monitoringStartTime = performance.now();
    }

    /**
     * Destroy performance monitor
     */
    destroy(): void {
        this.stopPerformanceMonitoring();
        this.reset();
    }
}