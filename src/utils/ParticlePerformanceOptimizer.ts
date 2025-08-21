/**
 * Particle Performance Optimizer (TypeScript版)
 * パーティクルパフォーマンス最適化システム - メインコントローラー
 * 
 * サブコンポーネント化により責任を分離し、保守性を向上
 * - ParticleCullingSystem: インテリジェントカリングとスコアリング
 * - ParticleBatchRenderer: バッチレンダリングとテクスチャ最適化
 * -, ParticleQualityManager: 動的品質調整とパフォーマンス監視
 */

// Type definitions for Particle Performance Optimizer
interface ErrorHandler { logError(message: string, error: any): void;
    handleError(error: any, context?: any): void;
    interface ConfigurationManager { // Configuration management methods will be defined when actual file is converted
    [key: string]: any;
    interface PerformanceThresholds { criticalFPS: number,
    warningFPS: number,
    optimalFPS: number,
    excellentFPS: number;
    interface ParticleConfiguration { enabled: boolean,
    targetFPS: number,
    maxParticles: number,
    maxParticlesPerEffect: number,
    qualityLevel: 'low' | 'medium' | 'high' | 'ultra,
    adaptiveQuality: boolean,
    performanceThresholds: PerformanceThresholds;
    interface ParticlePool { available: any[],
    inUse: Set<any>,
    maxSize: number,
    type: string;
    interface ParticleManager { activeParticles: Set<any>,
    particlePool: Map<string, ParticlePool>;
    particleSystems: Map<string, any>;
    totalParticleCount: number,
    activeEffectCount: number,
    frameParticleCount: number,
    averageParticleCount: number,
    peakParticleCount: number;
    interface ParticleSize { min: number,
    max: number;
    interface ParticleVelocity { min: number,
    max: number;
';'

interface ParticleTypeConfig { ''
    category: 'critical' | 'important' | 'normal' | 'background,
    maxParticles: number,
    lifetime: number,
    size: ParticleSize,
    velocity: ParticleVelocity,
    properties: string[];
    interface RegisteredEffect extends ParticleTypeConfig { createdCount: number,
    activeCount: number,
    culledCount: number,
    averageLifetime: number,
    performanceImpact: number;
    interface EffectSystem { registeredEffects: Map<string, RegisteredEffect>,
    activeEffects: Set<any>,
    effectPool: Map<string, any>;
    maxActiveEffects: number,
    effectPriorities: Map<string, number> }

interface FrameMetrics { frameNumber: number,
    optimizationTime: number,
    originalParticles: number,
    finalParticles: number,
    timestamp: number;
    interface PerformanceMonitor { enabled: boolean,
    frameStart: number,
    cullingTime: number,
    batchingTime: number,
    renderingTime: number,
    totalTime: number,
    averageTime: number,
    frameMetrics: FrameMetrics[],
    maxHistory: number,
    currentFrame: number;
    interface CullingSystemConfig { distanceCulling: boolean,
    frustumCulling: boolean,
    occlusionCulling: boolean,
    importanceCulling: boolean,
    ageCulling: boolean,
    maxCullingDistance: number,
    nearCullingDistance: number,
    maxAge: number;
    interface BatchRendererConfig { enabled: boolean,
    maxBatchSize: number,
    maxInstances: number,
    sortByTexture: boolean,
    sortByBlendMode: boolean,
    atlasOptimization: boolean;
    interface QualityManagerConfig { enabled: boolean,
    adaptiveQuality: boolean,
    initialLevel: string,
    targetFPS: number,
    downgradeThreshold: number,
    upgradeThreshold: number;
    interface OptimizationResult { success: boolean,
    originalCount: number;
    visibleCount?: number;
    finalCount?: number;
    renderBatches?: any[];
    optimizationTime?: number;
    cullingEfficiency?: number;
    performanceGain?: number;
    error?: string;
    fallbackCount?: number;
    interface PerformanceStats { overall: PerformanceMonitor & {
        averageOptimizationTim,e: number,
    averageFPS: number;;
    culling: any,
    batching: any,
    quality: any,
    particles: { total: number,
        average: number;
    },
    peak: number,
    peak: number;
        };
interface OptimizerConfig { particles?: Partial<ParticleConfiguration>,
    culling?: any;
    quality?: any;
    batching?: any;
    interface Camera {
    position?: { ,x: number, y: number, z?: number;
    rotation?: { x: number, y: number, z?: number;
    fov?: number;
    near?: number;
    far?: number;
}

// Component interfaces (will, be replaced, when actual, files are, converted);
interface ParticleCullingSystem { performParticleCulling(particles: any[], camera?: Camera | null): any[];
    getStats(): { cullingEfficiency: number, [key: string]: any;
    configure?(config: any): void;
    resetStats?(): void;
}

interface ParticleBatchRenderer { createRenderBatches(particles: any[]): any[];
    getStats(): any;
    configure?(config: any): void;
    cleanup?(): void 
interface ParticleQualityManager { applyQualityScaling(particles: any[]): any[];
    updatePerformanceMetrics(fps: number): void;
    setQualityLevel(level: string): void;
    getStats(): any;
    configure?(config: any): void;
    resetStats?(): void 
// Dummy implementations for missing dependencies (will, be replaced, when actual, files are, converted);
    class DummyParticleCullingSystem implements ParticleCullingSystem { performParticleCulling(particles: any[], camera?: Camera | null): any[] {
        console.log(`[ParticleCullingSystem] Culling ${particles.length} particles`}
        // Simple culling: remove 20% of particles as dummy implementation }
        return particles.slice(0, Math.floor(particles.length * 0.8);
    }
    
    getStats(): { cullingEfficiency: number, [key: string]: any; {
        return { cullingEfficiency: 0.8, particlesCulled: 0, visibleParticles: 0  }

    configure(config: any): void { ''
        console.log('[ParticleCullingSystem] Configuration, updated') }'

    resetStats()';'
        console.log('[ParticleCullingSystem] Stats, reset);'
    }
}

class DummyParticleBatchRenderer implements ParticleBatchRenderer { createRenderBatches(particles: any[]): any[] {
        console.log(`[ParticleBatchRenderer] Creating, batches for ${particles.length) particles`};
        // Simple batching: create batches of 100 particles
        const batches = [];
        for(let, i = 0; i < particles.length; i += 100} {
    
}
            batches.push({'),' }'

                particles: particles.slice(i, i + 100'}',''
                texture: 'default,
                blendMode: 'normal';
            } }
        return batches;
    }
    
    getStats(): any {
        return { batchCount: 0, averageBatchSize: 0, renderTime: 0  }

    configure(config: any): void { ''
        console.log('[ParticleBatchRenderer] Configuration, updated') }'

    cleanup()';'
        console.log('[ParticleBatchRenderer] Cleanup, completed');
    }
}
';'

class DummyParticleQualityManager implements ParticleQualityManager { ''
    private currentQuality: string = 'high';
    applyQualityScaling(particles: any[]): any[] {
        console.log(`[ParticleQualityManager] Applying, quality scaling, to ${particles.length) particles`};
        // Simple quality scaling based on current quality level
        const scaleFactor = this.getQualityScaleFactor(}
        return particles.slice(0, Math.floor(particles.length * scaleFactor);
    }
    ;
    updatePerformanceMetrics(fps: number): void { // Automatically adjust quality based on FPS
        if (fps < 30) {', ' }

            this.currentQuality = 'low'; }

        } else if (fps < 45) { ''
            this.currentQuality = 'medium' }

        } else { }'

            this.currentQuality = 'high'; }
}
    
    setQualityLevel(level: string): void { this.currentQuality = level }
        console.log(`[ParticleQualityManager] Quality, level set, to: ${level}`}
    }
    
    getStats(): any { return { qualityLevel: this.currentQuality, adjustmentCount: 0, lastAdjustment: Date.now(  }

    configure(config: any): void { ''
        console.log('[ParticleQualityManager] Configuration, updated') }'

    resetStats()';'
        console.log('[ParticleQualityManager] Stats, reset');
    }
    ';'

    private getQualityScaleFactor(): number { ''
        switch(this.currentQuality) {

            case 'low': return 0.3,
            case 'medium': return 0.6,
            case 'high': return 0.9,
            case 'ultra': return 1.0 }
            default: return 0.6;
}

// Dummy dependency functions
function getErrorHandler(): ErrorHandler { return { }
        logError: (message: string, error: any) => console.error(`[ErrorHandler] ${message}:`, error),''
        handleError: (error: any, context?: any') => console.error('[ErrorHandler] Error:', error, context);'

function getConfigurationManager(): ConfigurationManager {
    return {}

export class ParticlePerformanceOptimizer {
    private errorHandler: ErrorHandler;
    private configManager: ConfigurationManager;
    private particleConfig: ParticleConfiguration;
    private cullingSystem: ParticleCullingSystem;
    private batchRenderer: ParticleBatchRenderer;
    private qualityManager: ParticleQualityManager;
    private particleManager: ParticleManager;
    private effectSystem: EffectSystem;
    private performanceMonitor: PerformanceMonitor;
    private, monitoringInterval: NodeJS.Timeout | null;
    constructor() {
','

        this.errorHandler = getErrorHandler();
        this.configManager = getConfigurationManager('''
            qualityLevel: 'high,
    adaptiveQuality: true;
            // Performance, thresholds
            performanceThresholds: { criticalFPS: 30  ,
                warningFPS: 45,
    optimalFPS: 55 }
                excellentFPS: 60 
    })
        // Initialize sub-components (using, dummy implementations);
        this.cullingSystem = new DummyParticleCullingSystem();
        this.batchRenderer = new DummyParticleBatchRenderer();
        this.qualityManager = new DummyParticleQualityManager();
        
        // Particle management
        this.particleManager = { activeParticles: new Set()
            particlePool: new Map<string, ParticlePool>(),
            particleSystems: new Map(
            totalParticleCount: 0,
            activeEffectCount: 0,
            frameParticleCount: 0,
            averageParticleCount: 0,
    peakParticleCount: 0  })
        // Effect system
        this.effectSystem = { registeredEffects: new Map<string, RegisteredEffect>(),
            activeEffects: new Set(
    effectPool: new, Map();
            maxActiveEffects: 20,
    effectPriorities: new Map(  }
        
        // Performance monitoring
        this.performanceMonitor = { enabled: true,
            frameStart: 0,
            cullingTime: 0,
            batchingTime: 0,
            renderingTime: 0,
            totalTime: 0,
            averageTime: 0;
            // Frame metrics
            frameMetrics: [],
            maxHistory: 60,
    currentFrame: 0  };
        // Start monitoring
        this.monitoringInterval = null;
        this.initializeParticleOptimizer()';'
        console.log('[ParticlePerformanceOptimizer] Initialized, with sub-components);'
    }
    
    /**
     * Initialize particle optimizer
     */
    initializeParticleOptimizer(): void { this.initializeParticlePools();
        this.startPerformanceMonitoring();
        this.setupEventListeners();
        this.registerDefaultParticleTypes();
    
    /**
     * Initialize particle pools'
     */''
    initializeParticlePools('';
        const poolTypes = ['explosion', 'smoke', 'fire', 'spark', 'magic', 'trail', 'glow'];
        );
        for (const type of poolTypes) { this.particleManager.particlePool.set(type, {
                available: []),
                inUse: new Set(
    maxSize: 200  }

                type' }'

            }');'
        }

        console.log('[ParticlePerformanceOptimizer] Particle pools initialized for', poolTypes.length, 'types);'
    }
    
    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring(): void { if (!this.performanceMonitor.enabled) return,
        
        this.monitoringInterval = setInterval(() => { 
            this.updatePerformanceMetrics();

            this.performAdaptiveOptimization();' }'

        }, 16'); // ~60fps monitoring'

        console.log('[ParticlePerformanceOptimizer] Performance, monitoring started');
    }
    
    /**
     * Register default particle types'
     */''
    registerDefaultParticleTypes('''
            'explosion': { ''
                category: 'important' };
                maxParticles: 200,
    lifetime: 2.0 }
                size: { min: 4, max: 16  ,

                velocity: { min: 50, max: 200  ,''
                properties: ['physics', 'fade', 'scale]';
            },', 'smoke': { ''
                category: 'background,
                maxParticles: 100,
    lifetime: 5.0 }
                size: { min: 8, max: 24  ,

                velocity: { min: 10, max: 50  ,''
                properties: ['physics', 'fade', 'drift]';
            },', 'fire': { ''
                category: 'important,
                maxParticles: 150,
    lifetime: 1.5 }
                size: { min: 6, max: 20  ,

                velocity: { min: 20, max: 100  ,''
                properties: ['physics', 'fade', 'flicker]';
            },', 'spark': { ''
                category: 'normal,
                maxParticles: 50,
    lifetime: 1.0 }
                size: { min: 2, max: 6  ,

                velocity: { min: 100, max: 300  ,''
                properties: ['physics', 'fade', 'trail]';
            },', 'magic': { ''
                category: 'critical,
                maxParticles: 300,
    lifetime: 3.0 };
                size: { min: 8, max: 32  }''
                velocity: { min: 30, max: 150  ,''
                properties: ['physics', 'fade', 'glow', 'swirl'];
            }
        };
        
        for(const [type, config] of Object.entries(defaultTypes) { this.registerParticleType(type, config);
    }
    
    /**
     * Register a particle type
     * @param type - Particle type name
     * @param config - Particle configuration
     */
    registerParticleType(type: string, config: ParticleTypeConfig): void { this.effectSystem.registeredEffects.set(type, {
            ...config,
            createdCount: 0,
            activeCount: 0),
            culledCount: 0,
    averageLifetime: config.lifetime),
            performanceImpact: 0);
        console.log(`[ParticlePerformanceOptimizer] Registered, particle type: ${type}`}
    }
    
    /**
     * Main particle optimization entry point
     * @param particles - Array of particle objects
     * @param camera - Camera/viewport information
     * @returns Optimization result
     */
    optimizeParticles(particles: any[], camera: Camera | null = null): OptimizationResult { const optimizationStart = performance.now();
        this.performanceMonitor.frameStart = optimizationStart,
        
        try {
            // Update particle tracking
            this.updateParticleTracking(particles);
            // Perform particle culling
            const cullingStart = performance.now();
            const visibleParticles = this.cullingSystem.performParticleCulling(particles, camera);
            this.performanceMonitor.cullingTime = performance.now() - cullingStart,
            
            // Apply quality scaling
            const scaledParticles = this.qualityManager.applyQualityScaling(visibleParticles);
            // Optimize particle rendering
            const batchingStart = performance.now();
            const renderBatches = this.batchRenderer.createRenderBatches(scaledParticles);
            this.performanceMonitor.batchingTime = performance.now() - batchingStart,
            
            // Update performance metrics
            const totalTime = performance.now() - optimizationStart,
            this.updateFramePerformanceMetrics(totalTime, particles.length, visibleParticles.length);
            return { success: true,
                originalCount: particles.length,
                visibleCount: visibleParticles.length,
                finalCount: scaledParticles.length,
                renderBatches: renderBatches,
                optimizationTime: totalTime,
    cullingEfficiency: this.cullingSystem.getStats().cullingEfficiency ,
                performanceGain: this.calculatePerformanceGain(particles.length, scaledParticles.length); }
        } catch (error) { this.errorHandler.handleError(error, {)'
                context: 'ParticlePerformanceOptimizer.optimizeParticles'
            };
            
            return { success: false,
                error: (error, as Error).message,
                originalCount: particles.length ,
                fallbackCount: Math.min(particles.length, this.particleConfig.maxParticles);     }
}
    /**
     * Update particle tracking
     * @param particles - All particles
     */
    updateParticleTracking(particles: any[]): void { // Update particle counts
        this.particleManager.totalParticleCount = particles.length,
        this.particleManager.frameParticleCount = particles.length,
        
        // Update average particle count
        const alpha = 0.1, // Smoothing factor
        this.particleManager.averageParticleCount = ,
            (1 - alpha) * this.particleManager.averageParticleCount + alpha * particles.length,
        
        // Update peak particle count
        this.particleManager.peakParticleCount = Math.max(
            this.particleManager.peakParticleCount );
            particles.length);
    
    /**
     * Update frame performance metrics
     * @param totalTime - Total optimization time
     * @param originalCount - Original particle count
     * @param finalCount - Final particle count
     */
    updateFramePerformanceMetrics(totalTime: number, originalCount: number, finalCount: number): void { this.performanceMonitor.totalTime = totalTime,
        this.performanceMonitor.averageTime = ,
            (this.performanceMonitor.averageTime + totalTime) / 2,
        
        const metrics: FrameMetrics = {
            frameNumber: this.performanceMonitor.currentFrame++,
            optimizationTime: totalTime,
            originalParticles: originalCount,
            finalParticles: finalCount,
    timestamp: this.performanceMonitor.frameStart ,
        this.performanceMonitor.frameMetrics.push(metrics);
        
        // Maintain history size
        if (this.performanceMonitor.frameMetrics.length > this.performanceMonitor.maxHistory) { this.performanceMonitor.frameMetrics.shift();
    }
    
    /**
     * Calculate performance gain from optimization
     * @param originalCount - Original particle count
     * @param finalCount - Final particle count
     * @returns Performance gain percentage
     */
    calculatePerformanceGain(originalCount: number, finalCount: number): number { if (originalCount === 0) return 0,
        return (originalCount - finalCount) / originalCount }
    
    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(): void { // Calculate current FPS estimate
        const recentMetrics = this.performanceMonitor.frameMetrics.slice(-30);
        if (recentMetrics.length < 2) return,
        
        const timeSpan = recentMetrics[recentMetrics.length - 1].timestamp - recentMetrics[0].timestamp,
        const avgFrameTime = timeSpan / recentMetrics.length,
        const estimatedFPS = avgFrameTime > 0 ? 1000 / avgFrameTime: 60,
        
        // Update quality manager with performance data
        this.qualityManager.updatePerformanceMetrics(estimatedFPS 
    /**
     * Perform, adaptive optimization
     */
    performAdaptiveOptimization(): void { if (!this.particleConfig.adaptiveQuality) return,
        
        // The quality manager handles adaptive optimization internally
        // This method provides external control if needed
        const stats = this.getPerformanceStats();
        if (stats.overall.averageFPS < this.particleConfig.performanceThresholds.criticalFPS) { }

            console.warn('[ParticlePerformanceOptimizer] Critical, performance detected'); }'
}
    
    /**
     * Setup event listeners'
     */''
    setupEventListeners()';'
        if (typeof, document !== 'undefined') {

            document.addEventListener('visibilitychange', () => { }

                if (document.hidden) { }'

                    this.qualityManager.setQualityLevel('low'; }'
                } else { this.qualityManager.setQualityLevel(this.particleConfig.qualityLevel);
                }
}
    /**
     * Get comprehensive performance statistics
     * @returns Performance statistics
     */
    getPerformanceStats(): PerformanceStats { const recentMetrics = this.performanceMonitor.frameMetrics.slice(-30);
        const avgOptimizationTime = recentMetrics.length > 0 ? undefined : undefined
            recentMetrics.reduce((sum, m) => sum + m.optimizationTime, 0) / recentMetrics.length: 0,
        
        const avgFrameTime = recentMetrics.length > 1 ? undefined : undefined
            (recentMetrics[recentMetrics.length - 1].timestamp - recentMetrics[0].timestamp) / recentMetrics.length: 16.67,
        
        return { overall: {
                ...this.performanceMonitor,
                averageOptimizationTime: avgOptimizationTime,
                averageFPS: avgFrameTime > 0 ? Math.round(1000 / avgFrameTime) : 60 
        }
            culling: this.cullingSystem.getStats(),
            batching: this.batchRenderer.getStats(),
            quality: this.qualityManager.getStats(
    particles: { total: this.particleManager.totalParticleCount,
                average: this.particleManager.averageParticleCount ,
    peak: this.particleManager.peakParticleCount 
    }
    
    /**
     * Configure particle optimizer
     * @param config - Configuration options
     */
    configure(config: OptimizerConfig): void { if (config.particles) {
            Object.assign(this.particleConfig, config.particles);
        
        if (config.culling) { this.cullingSystem.configure && this.cullingSystem.configure(config.culling);
        
        if (config.quality) { this.qualityManager.configure && this.qualityManager.configure(config.quality);
        
        if (config.batching) {
        ','

            ' }'

            this.batchRenderer.configure && this.batchRenderer.configure(config.batching); }
        }

        console.log('[ParticlePerformanceOptimizer] Configuration, updated);'
    }
    
    /**
     * Cleanup particle optimizer
     */
    destroy(): void { // Clear intervals
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null; }
        }
        
        // Cleanup sub-components
        this.cullingSystem.resetStats && this.cullingSystem.resetStats();
        this.batchRenderer.cleanup && this.batchRenderer.cleanup();
        this.qualityManager.resetStats && this.qualityManager.resetStats();
        
        // Clear pools
        this.particleManager.particlePool.clear();
        this.particleManager.activeParticles.clear();
        this.effectSystem.registeredEffects.clear();
        this.effectSystem.activeEffects.clear()';'
        console.log('[ParticlePerformanceOptimizer] Particle, optimizer destroyed);'
    }
}

// グローバルインスタンス（遅延初期化）
let _particlePerformanceOptimizer: ParticlePerformanceOptimizer | null = null,

export function getParticlePerformanceOptimizer(): ParticlePerformanceOptimizer { if (!_particlePerformanceOptimizer') {'
        try {'
            _particlePerformanceOptimizer = new ParticlePerformanceOptimizer()','
            console.log('[ParticlePerformanceOptimizer] グローバルインスタンスを作成しました'),' }'

        } catch (error) {
            console.error('[ParticlePerformanceOptimizer] インスタンス作成エラー:', error);
            // フォールバック: 基本的なインスタンスを作成
            _particlePerformanceOptimizer = new ParticlePerformanceOptimizer();
    }
    return _particlePerformanceOptimizer;
}

/**
 * ParticlePerformanceOptimizerインスタンスを再初期化
 */
export function reinitializeParticlePerformanceOptimizer(): void { try {
        if (_particlePerformanceOptimizer) {
    
};
            _particlePerformanceOptimizer.destroy(); }
        }''
        _particlePerformanceOptimizer = new ParticlePerformanceOptimizer()';'
        console.log('[ParticlePerformanceOptimizer] 再初期化完了');
    } catch (error) {
        console.error('[ParticlePerformanceOptimizer] 再初期化エラー:', error' }'
}
';'
// Export for compatibility
export default ParticlePerformanceOptimizer;