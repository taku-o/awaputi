/**
 * Effect Profiler
 * エフェクトパフォーマンスプロファイリングとメモリ追跡ツール
 */

// Type definitions for profiling data structures
interface FrameMetric { timestamp: number,
    fps: number,
    particleCount: number,
    effectCount: number,
    memoryUsage: number,
    renderTime: number }
}

interface MemorySnapshot { timestamp: number,
    used: number,
    total: number,
    limit: number }
}

interface RenderingMetric { name: string,
    duration: number,
    startTime: number,
    timestamp: number }
}

interface ParticlePerformanceMetric { effectType: string,
    particleCount: number,
    duration: number,
    memoryDelta: number,
    timestamp: number }
}

interface EffectPerformanceMetric { effectType: string,
    duration: number,
    memoryDelta: number,
    timestamp: number }
}

interface ProfilingData { particlePerformance: Map<string, ParticlePerformanceMetric[]>;
    effectPerformance: Map<string, EffectPerformanceMetric[]>;
    memorySnapshots: MemorySnapshot[],
    frameMetrics: FrameMetric[],
    renderingMetrics: RenderingMetric[]
    }
}

interface PerformanceThresholds { fps: {
        excellent: number,
        good: number,
        acceptable: number,
        poor: number }
    },
    memory: { low: number,
        medium: number,
        high: number,
        critical: number }
    },
    renderTime: { excellent: number,
        good: number,
        acceptable: number,
        poor: number }
    };
}

type PerformanceRating = 'excellent' | 'good' | 'acceptable' | 'poor';

interface FrameAnalysis { averageFPS: number,
    minFPS: number,
    maxFPS: number,
    fpsStdDev: number,
    averageRenderTime: number,
    maxRenderTime: number,
    frameDrops: number,
    fpsRating: PerformanceRating,
    renderTimeRating: PerformanceRating
    }
}

interface MemoryAnalysis { averageMemory: number,
    minMemory: number,
    maxMemory: number,
    memoryDelta: number,
    memoryGrowthRate: number,
    memoryRating: PerformanceRating,
    hasMemoryLeak: boolean }
}

interface ParticleEffectAnalysis { sampleCount: number,
    averageDuration: number,
    maxDuration: number,
    averageMemoryImpact: number,
    rating: PerformanceRating
    }
}

interface EffectAnalysis { sampleCount: number,
    averageDuration: number,
    maxDuration: number,
    averageMemoryImpact: number,
    rating: PerformanceRating
    }
}

interface ProfileAnalysis { overall: number,
    frame: FrameAnalysis | null,
    memory: MemoryAnalysis | null,
    particles: Record<string, ParticleEffectAnalysis>;
    effects: Record<string, EffectAnalysis> }
}'
'';
type OptimizationType = 'performance' | 'memory' | 'memory_leak' | 'particle_optimization' | 'rendering';''
type OptimizationPriority = 'critical' | 'high' | 'medium' | 'low';''
type OptimizationAction = 'reduce_quality' | 'optimize_memory' | 'fix_memory_leak' | 'optimize_particles' | 'optimize_rendering';

interface OptimizationSuggestion { type: OptimizationType,
    priority: OptimizationPriority,
    message: string,
    action: OptimizationAction,
    effectType?: string }
}

interface ProfilerExportData { timestamp: string,
    analysis: ProfileAnalysis,
    suggestions: OptimizationSuggestion[],
    rawData: ProfilingData
    }
}

interface ProfilerResult { analysis: ProfileAnalysis,
    suggestions: OptimizationSuggestion[],
    rawData: ProfilingData
    }
}

// Game engine interface (minimal required interface);
interface GameEngineInterface { performanceOptimizer?: {
        getCurrentFPS(): number;
        getAverageRenderTime(): number; }
    };
    enhancedParticleManager?: { getActiveParticleCount(): number; }
    };
    enhancedEffectManager?: { getActiveEffectCount(): number; }
    };
}

// Browser performance memory interface
interface PerformanceMemory { usedJSHeapSize: number,
    totalJSHeapSize: number,
    jsHeapSizeLimit: number }
}

// Extended Performance interface
interface ExtendedPerformance extends Performance { memory?: PerformanceMemory;
    }
}

declare const performance: ExtendedPerformance,
export class EffectProfiler {
    private gameEngine: GameEngineInterface;
    private isActive: boolean = false;
    // プロファイリングデータ
    private profilingData: ProfilingData;
    // パフォーマンス閾値
    private readonly thresholds: PerformanceThresholds = {
        fps: {
            excellent: 60,
            good: 45,
            acceptable: 30,
            poor: 15 }
        },
        memory: { low: 50,    // MB
            medium: 100,
            high: 200,
            critical: 500 }
        },
        renderTime: { excellent: 16.67, // ~60fps
            good: 22.22,      // ~45fps;
            acceptable: 33.33, // ~30fps;
            poor: 66.67       // ~15fps }
        }
    },
    
    // オプティマイゼーション提案
    private optimizationSuggestions: OptimizationSuggestion[] = [];
    // Performance monitoring intervals
    private memoryMonitorInterval: number | null = null;
    private frameMetricsInterval: number | null = null;
    private performanceObserver: PerformanceObserver | null = null;
    constructor(gameEngine: GameEngineInterface) {

        this.gameEngine = gameEngine;
        
        // プロファイリングデータ
        this.profilingData = {
            particlePerformance: new Map(),
            effectPerformance: new Map(),
            memorySnapshots: [],
            frameMetrics: [],

    }
    }
            renderingMetrics: [] }
        },
        
        this.initialize();
    }

    private initialize(): void { this.setupPerformanceObserver();
        this.setupMemoryMonitoring(); }
    }
'';
    private setupPerformanceObserver()';
        if('PerformanceObserver' in window) {
            try {
                this.performanceObserver = new PerformanceObserver((list) => { '
                    const entries = list.getEntries();''
                    entries.forEach(entry => {');'
        }'
                        if (entry.entryType === 'measure') { }
                            this.recordRenderingMetric(entry as PerformanceMeasure); }
                        }'
                    });''
                }');'
                '';
                this.performanceObserver.observe({ entryTypes: ['measure'] ),' }'
            } catch (error) { ''
                console.warn('PerformanceObserver not supported:', error) }
            }
        }
    }

    private setupMemoryMonitoring(): void { // メモリ監視の設定
        this.memoryMonitorInterval = window.setInterval(() => { 
            if (this.isActive) { }
                this.captureMemorySnapshot(); }
            }
        }, 1000); // 1秒毎
    }
'';
    startProfiling()';
        console.log('Effect profiling started');
        this.startFrameMetrics();
    }

    stopProfiling(): ProfilerResult { this.isActive = false;
        this.stopFrameMetrics();
        ';'
        const analysis = this.analyzeProfilingData();''
        this.generateOptimizationSuggestions(analysis');'
        '';
        console.log('Effect profiling stopped');
        return { analysis,
            suggestions: this.optimizationSuggestions, };
            rawData: this.profilingData }
        },
    }

    private startFrameMetrics(): void { this.frameMetricsInterval = window.setInterval(() => { 
            if (this.isActive) { }
                this.captureFrameMetric(); }
            }
        }, 16); // ~60fps
    }

    private stopFrameMetrics(): void { if (this.frameMetricsInterval) {
            clearInterval(this.frameMetricsInterval);
            this.frameMetricsInterval = null; }
        }
    }

    private captureFrameMetric(): void { const timestamp = performance.now();
        const fps = this.gameEngine? .performanceOptimizer?.getCurrentFPS() || 0;
        const particleCount = this.getParticleCount();
        const effectCount = this.getEffectCount();
        const memoryUsage = this.getCurrentMemoryUsage();

        this.profilingData.frameMetrics.push({
            timestamp,
            fps);
            particleCount);
            effectCount,);
            memoryUsage); : undefined
            renderTime: this.getLastRenderTime() }
        });

        // データサイズ制限（最新1000フレーム）
        if (this.profilingData.frameMetrics.length > 1000) { this.profilingData.frameMetrics.shift(); }
        }
    }

    private captureMemorySnapshot(): void { const memoryInfo = this.getDetailedMemoryInfo();
        const timestamp = performance.now();

        this.profilingData.memorySnapshots.push({)
            ...memoryInfo,);
            timestamp);

        // データサイズ制限（最新100スナップショット）
        if(this.profilingData.memorySnapshots.length > 100) {
            
        }
            this.profilingData.memorySnapshots.shift(); }
        }
    }

    private recordRenderingMetric(entry: PerformanceMeasure): void { this.profilingData.renderingMetrics.push({)
            name: entry.name);
            duration: entry.duration,);
            startTime: entry.startTime),
            timestamp: performance.now() }
        });

        // データサイズ制限
        if (this.profilingData.renderingMetrics.length > 500) { this.profilingData.renderingMetrics.shift(); }
        }
    }

    profileParticleEffect(effectType: string, particleCount: number, duration: number): Promise<ParticlePerformanceMetric>,
        const startTime = performance.now();
        const startMemory = this.getCurrentMemoryUsage();
        
        // エフェクト実行の測定
        return new Promise((resolve) => {  setTimeout(() => {
                const endTime = performance.now();
                const endMemory = this.getCurrentMemoryUsage();
                
                const metric: ParticlePerformanceMetric = {
                    effectType,
                    particleCount,
                    duration: endTime - startTime,
                    memoryDelta: endMemory - startMemory, }
                    timestamp: endTime }
                },

                if(!this.profilingData.particlePerformance.has(effectType) { this.profilingData.particlePerformance.set(effectType, []); }
                }
                this.profilingData.particlePerformance.get(effectType)!.push(metric);

                resolve(metric);
            }, duration);
        });
    }

    profileScreenEffect(effectType: string, duration: number): Promise<EffectPerformanceMetric>,
        const startTime = performance.now();
        const startMemory = this.getCurrentMemoryUsage();
        
        return new Promise((resolve) => {  setTimeout(() => {
                const endTime = performance.now();
                const endMemory = this.getCurrentMemoryUsage();
                
                const metric: EffectPerformanceMetric = {
                    effectType,
                    duration: endTime - startTime,
                    memoryDelta: endMemory - startMemory, }
                    timestamp: endTime }
                },

                if(!this.profilingData.effectPerformance.has(effectType) { this.profilingData.effectPerformance.set(effectType, []); }
                }
                this.profilingData.effectPerformance.get(effectType)!.push(metric);

                resolve(metric);
            }, duration);
        });
    }

    private getParticleCount(): number { return this.gameEngine? .enhancedParticleManager?.getActiveParticleCount() || 0; }
    }
 : undefined;
    private getEffectCount(): number { return this.gameEngine? .enhancedEffectManager?.getActiveEffectCount() || 0; }
    }
 : undefined;
    private getCurrentMemoryUsage(): number { if (performance.memory) {
            return performance.memory.usedJSHeapSize / 1024 / 1024; // MB }
        }
        return 0;
    }

    private getDetailedMemoryInfo(): MemorySnapshot { if (performance.memory) {
            return { timestamp: 0, // Will be set by caller
                used: performance.memory.usedJSHeapSize / 1024 / 1024,
                total: performance.memory.totalJSHeapSize / 1024 / 1024, };
                limit: performance.memory.jsHeapSizeLimit / 1024 / 1024 }
            },
        }
        return { timestamp: 0, used: 0, total: 0, limit: 0 }
    }

    private getLastRenderTime(): number { return this.gameEngine? .performanceOptimizer?.getAverageRenderTime() || 0; }
    }
 : undefined;
    private analyzeProfilingData(): ProfileAnalysis { const frameAnalysis = this.analyzeFrameMetrics();
        const memoryAnalysis = this.analyzeMemoryUsage();
        const particleAnalysis = this.analyzeParticlePerformance();
        const effectAnalysis = this.analyzeEffectPerformance();

        return { overall: this.calculateOverallScore(frameAnalysis, memoryAnalysis),
            frame: frameAnalysis,
            memory: memoryAnalysis,
            particles: particleAnalysis, };
            effects: effectAnalysis }
        },
    }

    private analyzeFrameMetrics(): FrameAnalysis | null { const metrics = this.profilingData.frameMetrics;
        if (metrics.length === 0) return null;

        const fpsSamples = metrics.map(m => m.fps).filter(fps => fps > 0);
        const renderTimeSamples = metrics.map(m => m.renderTime).filter(rt => rt > 0);

        return { averageFPS: this.calculateAverage(fpsSamples),
            minFPS: Math.min(...fpsSamples),
            maxFPS: Math.max(...fpsSamples),
            fpsStdDev: this.calculateStandardDeviation(fpsSamples),
            averageRenderTime: this.calculateAverage(renderTimeSamples),
            maxRenderTime: Math.max(...renderTimeSamples),
            frameDrops: fpsSamples.filter(fps => fps < 30).length,
            fpsRating: this.rateFPS(this.calculateAverage(fpsSamples), };
            renderTimeRating: this.rateRenderTime(this.calculateAverage(renderTimeSamples); }
        };
    }

    private analyzeMemoryUsage(): MemoryAnalysis | null { const snapshots = this.profilingData.memorySnapshots;
        if (snapshots.length === 0) return null;

        const usedMemorySamples = snapshots.map(s => s.used);
        const memoryDelta = usedMemorySamples[usedMemorySamples.length - 1] - usedMemorySamples[0];

        return { averageMemory: this.calculateAverage(usedMemorySamples),
            minMemory: Math.min(...usedMemorySamples),
            maxMemory: Math.max(...usedMemorySamples),
            memoryDelta: memoryDelta,
            memoryGrowthRate: memoryDelta / (snapshots.length * 1000), // MB/s;
            memoryRating: this.rateMemoryUsage(this.calculateAverage(usedMemorySamples), };
            hasMemoryLeak: this.detectMemoryLeak(usedMemorySamples); }
        };
    }

    private analyzeParticlePerformance(): Record<string, ParticleEffectAnalysis> {
        const analysis: Record<string, ParticleEffectAnalysis> = {};
        
        for(const [effectType, metrics] of this.profilingData.particlePerformance) {
        
            const durations = metrics.map(m => m.duration);
            const memoryDeltas = metrics.map(m => m.memoryDelta);
            
            analysis[effectType] = {
                sampleCount: metrics.length,
                averageDuration: this.calculateAverage(durations),
                maxDuration: Math.max(...durations),
                averageMemoryImpact: this.calculateAverage(memoryDeltas),
        
        }
                rating: this.rateParticlePerformance(this.calculateAverage(durations); }
            };
        }
        
        return analysis;
    }

    private analyzeEffectPerformance(): Record<string, EffectAnalysis> {
        const analysis: Record<string, EffectAnalysis> = {};
        
        for(const [effectType, metrics] of this.profilingData.effectPerformance) {
        
            const durations = metrics.map(m => m.duration);
            const memoryDeltas = metrics.map(m => m.memoryDelta);
            
            analysis[effectType] = {
                sampleCount: metrics.length,
                averageDuration: this.calculateAverage(durations),
                maxDuration: Math.max(...durations),
                averageMemoryImpact: this.calculateAverage(memoryDeltas),
        
        }
                rating: this.rateEffectPerformance(this.calculateAverage(durations); }
            };
        }
        
        return analysis;
    }

    private generateOptimizationSuggestions(analysis: ProfileAnalysis): void { this.optimizationSuggestions = [];
;
        // FPSベースの提案
        if(analysis.frame && analysis.frame.averageFPS < this.thresholds.fps.acceptable') {'
            this.optimizationSuggestions.push({')'
                type: 'performance',')
        }'
                priority: 'high'),' }'
                message: `Average FPS (${analysis.frame.averageFPS.toFixed(1})}') is below acceptable threshold. Consider reducing particle counts or effect quality.`,''
                action: 'reduce_quality';
            }),
        }
';
        // メモリベースの提案
        if(analysis.memory && analysis.memory.averageMemory > this.thresholds.memory.high') {'
            this.optimizationSuggestions.push({')'
                type: 'memory',')
        }'
                priority: 'high'),' }'
                message: `High memory usage (${analysis.memory.averageMemory.toFixed(1})}MB'). Implement object pooling and cleanup unused effects.`,''
                action: 'optimize_memory';
            }),
        }
';
        // メモリリーク検出
        if(analysis.memory && analysis.memory.hasMemoryLeak') {'
            this.optimizationSuggestions.push({''
                type: 'memory_leak','';
                priority: 'critical',')';
                message: 'Potential memory leak detected. Check for unreleased resources and event listeners.',')
        }'
                action: 'fix_memory_leak'); }
        }
';'
        // パーティクルパフォーマンス提案
        for(const [effectType, metrics] of Object.entries(analysis.particles ||) {'
            )') {''
            if (metrics.rating === 'poor'') {'
                this.optimizationSuggestions.push({''
                    type: 'particle_optimization','
        }'
                    priority: 'medium', }'
                    message: `${effectType} particle effect shows poor performance. Consider optimizing particle count or rendering method.`,')'
                    action: 'optimize_particles',);
                    effectType);
            }
        }
';
        // レンダリング時間提案
        if(analysis.frame && analysis.frame.maxRenderTime > this.thresholds.renderTime.poor') {'
            this.optimizationSuggestions.push({')'
                type: 'rendering',')
        }'
                priority: 'medium'),' }'
                message: `High render times detected (max: ${analysis.frame.maxRenderTime.toFixed(2})}ms'). Consider optimizing draw calls or using requestAnimationFrame throttling.`,''
                action: 'optimize_rendering';
            }),
        }
    }

    // ユーティリティメソッド
    private calculateAverage(values: number[]): number { return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length: 0, }
    }

    private calculateStandardDeviation(values: number[]): number { const avg = this.calculateAverage(values);
        const squareDiffs = values.map(value => Math.pow(value - avg, 2);
        return Math.sqrt(this.calculateAverage(squareDiffs); }
    }
';'
    private rateFPS(fps: number): PerformanceRating { ''
        if (fps >= this.thresholds.fps.excellent') return 'excellent';''
        if (fps >= this.thresholds.fps.good') return 'good';''
        if (fps >= this.thresholds.fps.acceptable') return 'acceptable';''
        return 'poor'; }
    }
';'
    private rateRenderTime(renderTime: number): PerformanceRating { ''
        if (renderTime <= this.thresholds.renderTime.excellent') return 'excellent';''
        if (renderTime <= this.thresholds.renderTime.good') return 'good';''
        if (renderTime <= this.thresholds.renderTime.acceptable') return 'acceptable';''
        return 'poor'; }
    }
';'
    private rateMemoryUsage(memory: number): PerformanceRating { ''
        if (memory <= this.thresholds.memory.low') return 'excellent';''
        if (memory <= this.thresholds.memory.medium') return 'good';''
        if (memory <= this.thresholds.memory.high') return 'acceptable';''
        return 'poor'; }
    }
';'
    private rateParticlePerformance(duration: number): PerformanceRating { ''
        if (duration <= 5') return 'excellent';''
        if (duration <= 10') return 'good';''
        if (duration <= 20') return 'acceptable';''
        return 'poor'; }
    }
';'
    private rateEffectPerformance(duration: number): PerformanceRating { ''
        if (duration <= 2') return 'excellent';''
        if (duration <= 5') return 'good';''
        if (duration <= 10') return 'acceptable';''
        return 'poor'; }
    }

    private detectMemoryLeak(memorySamples: number[]): boolean { if (memorySamples.length < 10) return false;
        
        // 線形回帰で傾きを計算
        const n = memorySamples.length;
        const sumX = n * (n - 1) / 2;
        const sumY = memorySamples.reduce((a, b) => a + b, 0);
        const sumXY = memorySamples.reduce((sum, y, x) => sum + x * y, 0);
        const sumX2 = n * (n - 1) * (2 * n - 1) / 6;
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        
        // 1MB/分以上の増加をリークと判定
        return slope > 1 / 60; }
    }

    private calculateOverallScore(frameAnalysis: FrameAnalysis | null, memoryAnalysis: MemoryAnalysis | null): number { let score = 100;
        
        if(frameAnalysis) {
        ';'
            '';
            switch (frameAnalysis.fpsRating') {''
                case 'poor': score -= 40; break;''
                case 'acceptable': score -= 20; break;'
        
        }'
                case 'good': score -= 10; break; }
            }
        }
        
        if(memoryAnalysis) {
        ';'
            '';
            switch (memoryAnalysis.memoryRating') {''
                case 'poor': score -= 30; break;''
                case 'acceptable': score -= 15; break;'
        
        }'
                case 'good': score -= 5; break; }
            }
            
            if (memoryAnalysis.hasMemoryLeak) { score -= 20; }
            }
        }
        
        return Math.max(0, score);
    }

    exportProfilingData(): ProfilerExportData { return { timestamp: new Date().toISOString(),
            analysis: this.analyzeProfilingData(),
            suggestions: this.optimizationSuggestions, };
            rawData: this.profilingData }
        },
    }

    destroy(): void { this.isActive = false;
        
        if(this.memoryMonitorInterval) {
        
            
        
        }
            clearInterval(this.memoryMonitorInterval); }
        }
        
        if (this.frameMetricsInterval) { clearInterval(this.frameMetricsInterval); }
        }
        
        if (this.performanceObserver) { this.performanceObserver.disconnect(); }
        }
    }
}
';
// グローバルアクセス用（デバッグ目的）
(window as any').EffectProfiler = EffectProfiler;