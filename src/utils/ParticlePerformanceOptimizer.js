import { getErrorHandler } from './ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';
import { ParticleCullingSystem } from './particle-performance-optimizer/ParticleCullingSystem.js';
import { ParticleBatchRenderer } from './particle-performance-optimizer/ParticleBatchRenderer.js';
import { ParticleQualityManager } from './particle-performance-optimizer/ParticleQualityManager.js';

/**
 * Particle Performance Optimizer (Refactored)
 * パーティクルパフォーマンス最適化システム - メインコントローラー
 * 
 * サブコンポーネント化により責任を分離し、保守性を向上
 * - ParticleCullingSystem: インテリジェントカリングとスコアリング
 * - ParticleBatchRenderer: バッチレンダリングとテクスチャ最適化
 * - ParticleQualityManager: 動的品質調整とパフォーマンス監視
 */
export class ParticlePerformanceOptimizer {
    constructor() {
        this.errorHandler = getErrorHandler();
        this.configManager = getConfigurationManager();
        
        // Main configuration
        this.particleConfig = {
            enabled: true,
            targetFPS: 50,
            maxParticles: 5000,
            maxParticlesPerEffect: 500,
            qualityLevel: 'high',
            adaptiveQuality: true,
            
            // Performance thresholds
            performanceThresholds: {
                criticalFPS: 30,
                warningFPS: 45,
                optimalFPS: 55,
                excellentFPS: 60
            }
        };
        
        // Initialize sub-components
        this._initializeSubComponents();
        
        // Particle management
        this.particleManager = {
            activeParticles: new Set(),
            particlePool: new Map(),
            particleSystems: new Map(),
            totalParticleCount: 0,
            activeEffectCount: 0,
            frameParticleCount: 0,
            averageParticleCount: 0,
            peakParticleCount: 0
        };
        
        // Effect system
        this.effectSystem = {
            registeredEffects: new Map(),
            activeEffects: new Set(),
            effectPool: new Map(),
            maxActiveEffects: 20,
            effectPriorities: new Map()
        };
        
        // Performance monitoring
        this.performanceMonitor = {
            enabled: true,
            frameStart: 0,
            cullingTime: 0,
            batchingTime: 0,
            renderingTime: 0,
            totalTime: 0,
            averageTime: 0,
            
            // Frame metrics
            frameMetrics: [],
            maxHistory: 60,
            currentFrame: 0
        };
        
        // Start monitoring
        this.monitoringInterval = null;
        this.initializeParticleOptimizer();
        
        console.log('[ParticlePerformanceOptimizer] Initialized with sub-components');
    }
    
    /**
     * Initialize sub-component systems
     * @private
     */
    _initializeSubComponents() {
        try {
            // Initialize culling system
            this.cullingSystem = new ParticleCullingSystem({
                distanceCulling: true,
                frustumCulling: true,
                occlusionCulling: false,
                importanceCulling: true,
                ageCulling: true,
                maxCullingDistance: 1500,
                nearCullingDistance: 50,
                maxAge: 10.0
            });
            
            // Initialize batch renderer
            this.batchRenderer = new ParticleBatchRenderer({
                enabled: true,
                maxBatchSize: 1000,
                maxInstances: 2000,
                sortByTexture: true,
                sortByBlendMode: true,
                atlasOptimization: true
            });
            
            // Initialize quality manager
            this.qualityManager = new ParticleQualityManager({
                enabled: true,
                adaptiveQuality: true,
                initialLevel: this.particleConfig.qualityLevel,
                targetFPS: this.particleConfig.targetFPS,
                downgradeThreshold: this.particleConfig.performanceThresholds.warningFPS,
                upgradeThreshold: this.particleConfig.performanceThresholds.optimalFPS
            });
            
        } catch (error) {
            this.errorHandler.logError('Failed to initialize particle optimizer sub-components', error);
        }
    }
    
    /**
     * Initialize particle optimizer
     */
    initializeParticleOptimizer() {
        this.initializeParticlePools();
        this.startPerformanceMonitoring();
        this.setupEventListeners();
        this.registerDefaultParticleTypes();
    }
    
    /**
     * Initialize particle pools
     */
    initializeParticlePools() {
        const poolTypes = ['explosion', 'smoke', 'fire', 'spark', 'magic', 'trail', 'glow'];
        
        for (const type of poolTypes) {
            this.particleManager.particlePool.set(type, {
                available: [],
                inUse: new Set(),
                maxSize: 200,
                type
            });
        }
        
        console.log('[ParticlePerformanceOptimizer] Particle pools initialized for', poolTypes.length, 'types');
    }
    
    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        if (!this.performanceMonitor.enabled) return;
        
        this.monitoringInterval = setInterval(() => {
            this.updatePerformanceMetrics();
            this.performAdaptiveOptimization();
        }, 16); // ~60fps monitoring
        
        console.log('[ParticlePerformanceOptimizer] Performance monitoring started');
    }
    
    /**
     * Register default particle types
     */
    registerDefaultParticleTypes() {
        const defaultTypes = {
            'explosion': {
                category: 'important',
                maxParticles: 200,
                lifetime: 2.0,
                size: { min: 4, max: 16 },
                velocity: { min: 50, max: 200 },
                properties: ['physics', 'fade', 'scale']
            },
            'smoke': {
                category: 'background',
                maxParticles: 100,
                lifetime: 5.0,
                size: { min: 8, max: 24 },
                velocity: { min: 10, max: 50 },
                properties: ['physics', 'fade', 'drift']
            },
            'fire': {
                category: 'important',
                maxParticles: 150,
                lifetime: 1.5,
                size: { min: 6, max: 20 },
                velocity: { min: 20, max: 100 },
                properties: ['physics', 'fade', 'flicker']
            },
            'spark': {
                category: 'normal',
                maxParticles: 50,
                lifetime: 1.0,
                size: { min: 2, max: 6 },
                velocity: { min: 100, max: 300 },
                properties: ['physics', 'fade', 'trail']
            },
            'magic': {
                category: 'critical',
                maxParticles: 300,
                lifetime: 3.0,
                size: { min: 8, max: 32 },
                velocity: { min: 30, max: 150 },
                properties: ['physics', 'fade', 'glow', 'swirl']
            }
        };
        
        for (const [type, config] of Object.entries(defaultTypes)) {
            this.registerParticleType(type, config);
        }
    }
    
    /**
     * Register a particle type
     * @param {string} type - Particle type name
     * @param {object} config - Particle configuration
     */
    registerParticleType(type, config) {
        this.effectSystem.registeredEffects.set(type, {
            ...config,
            createdCount: 0,
            activeCount: 0,
            culledCount: 0,
            averageLifetime: config.lifetime,
            performanceImpact: 0
        });
        
        console.log(`[ParticlePerformanceOptimizer] Registered particle type: ${type}`);
    }
    
    /**
     * Main particle optimization entry point
     * @param {Array} particles - Array of particle objects
     * @param {object} camera - Camera/viewport information
     * @returns {object} Optimization result
     */
    optimizeParticles(particles, camera = null) {
        const optimizationStart = performance.now();
        this.performanceMonitor.frameStart = optimizationStart;
        
        try {
            // Update particle tracking
            this.updateParticleTracking(particles);
            
            // Perform particle culling
            const cullingStart = performance.now();
            const visibleParticles = this.cullingSystem.performParticleCulling(particles, camera);
            this.performanceMonitor.cullingTime = performance.now() - cullingStart;
            
            // Apply quality scaling
            const scaledParticles = this.qualityManager.applyQualityScaling(visibleParticles);
            
            // Optimize particle rendering
            const batchingStart = performance.now();
            const renderBatches = this.batchRenderer.createRenderBatches(scaledParticles);
            this.performanceMonitor.batchingTime = performance.now() - batchingStart;
            
            // Update performance metrics
            const totalTime = performance.now() - optimizationStart;
            this.updateFramePerformanceMetrics(totalTime, particles.length, visibleParticles.length);
            
            return {
                success: true,
                originalCount: particles.length,
                visibleCount: visibleParticles.length,
                finalCount: scaledParticles.length,
                renderBatches: renderBatches,
                optimizationTime: totalTime,
                cullingEfficiency: this.cullingSystem.getStats().cullingEfficiency,
                performanceGain: this.calculatePerformanceGain(particles.length, scaledParticles.length)
            };
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'ParticlePerformanceOptimizer.optimizeParticles'
            });
            
            return {
                success: false,
                error: error.message,
                originalCount: particles.length,
                fallbackCount: Math.min(particles.length, this.particleConfig.maxParticles)
            };
        }
    }
    
    /**
     * Update particle tracking
     * @param {Array} particles - All particles
     */
    updateParticleTracking(particles) {
        // Update particle counts
        this.particleManager.totalParticleCount = particles.length;
        this.particleManager.frameParticleCount = particles.length;
        
        // Update average particle count
        const alpha = 0.1; // Smoothing factor
        this.particleManager.averageParticleCount = 
            (1 - alpha) * this.particleManager.averageParticleCount + alpha * particles.length;
        
        // Update peak particle count
        this.particleManager.peakParticleCount = Math.max(
            this.particleManager.peakParticleCount, 
            particles.length
        );
    }
    
    /**
     * Update frame performance metrics
     * @param {number} totalTime - Total optimization time
     * @param {number} originalCount - Original particle count
     * @param {number} finalCount - Final particle count
     */
    updateFramePerformanceMetrics(totalTime, originalCount, finalCount) {
        this.performanceMonitor.totalTime = totalTime;
        this.performanceMonitor.averageTime = 
            (this.performanceMonitor.averageTime + totalTime) / 2;
        
        const metrics = {
            frameNumber: this.performanceMonitor.currentFrame++,
            optimizationTime: totalTime,
            originalParticles: originalCount,
            finalParticles: finalCount,
            timestamp: this.performanceMonitor.frameStart
        };
        
        this.performanceMonitor.frameMetrics.push(metrics);
        
        // Maintain history size
        if (this.performanceMonitor.frameMetrics.length > this.performanceMonitor.maxHistory) {
            this.performanceMonitor.frameMetrics.shift();
        }
    }
    
    /**
     * Calculate performance gain from optimization
     * @param {number} originalCount - Original particle count
     * @param {number} finalCount - Final particle count
     * @returns {number} Performance gain percentage
     */
    calculatePerformanceGain(originalCount, finalCount) {
        if (originalCount === 0) return 0;
        return (originalCount - finalCount) / originalCount;
    }
    
    /**
     * Update performance metrics
     */
    updatePerformanceMetrics() {
        // Calculate current FPS estimate
        const recentMetrics = this.performanceMonitor.frameMetrics.slice(-30);
        if (recentMetrics.length < 2) return;
        
        const timeSpan = recentMetrics[recentMetrics.length - 1].timestamp - recentMetrics[0].timestamp;
        const avgFrameTime = timeSpan / recentMetrics.length;
        const estimatedFPS = avgFrameTime > 0 ? 1000 / avgFrameTime : 60;
        
        // Update quality manager with performance data
        this.qualityManager.updatePerformanceMetrics(estimatedFPS);
    }
    
    /**
     * Perform adaptive optimization
     */
    performAdaptiveOptimization() {
        if (!this.particleConfig.adaptiveQuality) return;
        
        // The quality manager handles adaptive optimization internally
        // This method provides external control if needed
        const stats = this.getPerformanceStats();
        
        if (stats.averageFPS < this.particleConfig.performanceThresholds.criticalFPS) {
            console.warn('[ParticlePerformanceOptimizer] Critical performance detected');
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for visibility changes to adjust quality
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.qualityManager.setQualityLevel('low');
                } else {
                    this.qualityManager.setQualityLevel(this.particleConfig.qualityLevel);
                }
            });
        }
    }
    
    /**
     * Get comprehensive performance statistics
     * @returns {object} Performance statistics
     */
    getPerformanceStats() {
        const recentMetrics = this.performanceMonitor.frameMetrics.slice(-30);
        const avgOptimizationTime = recentMetrics.length > 0 ? 
            recentMetrics.reduce((sum, m) => sum + m.optimizationTime, 0) / recentMetrics.length : 0;
        
        const avgFrameTime = recentMetrics.length > 1 ? 
            (recentMetrics[recentMetrics.length - 1].timestamp - recentMetrics[0].timestamp) / recentMetrics.length : 16.67;
        
        return {
            overall: {
                ...this.performanceMonitor,
                averageOptimizationTime: avgOptimizationTime,
                averageFPS: avgFrameTime > 0 ? Math.round(1000 / avgFrameTime) : 60
            },
            culling: this.cullingSystem.getStats(),
            batching: this.batchRenderer.getStats(),
            quality: this.qualityManager.getStats(),
            particles: {
                total: this.particleManager.totalParticleCount,
                average: this.particleManager.averageParticleCount,
                peak: this.particleManager.peakParticleCount
            }
        };
    }
    
    /**
     * Configure particle optimizer
     * @param {object} config - Configuration options
     */
    configure(config) {
        if (config.particles) {
            Object.assign(this.particleConfig, config.particles);
        }
        
        if (config.culling) {
            this.cullingSystem.configure && this.cullingSystem.configure(config.culling);
        }
        
        if (config.quality) {
            this.qualityManager.configure && this.qualityManager.configure(config.quality);
        }
        
        if (config.batching) {
            this.batchRenderer.configure && this.batchRenderer.configure(config.batching);
        }
        
        console.log('[ParticlePerformanceOptimizer] Configuration updated');
    }
    
    /**
     * Cleanup particle optimizer
     */
    destroy() {
        // Clear intervals
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        // Cleanup sub-components
        this.cullingSystem.resetStats && this.cullingSystem.resetStats();
        this.batchRenderer.cleanup && this.batchRenderer.cleanup();
        this.qualityManager.resetStats && this.qualityManager.resetStats();
        
        // Clear pools
        this.particleManager.particlePool.clear();
        this.particleManager.activeParticles.clear();
        this.effectSystem.registeredEffects.clear();
        this.effectSystem.activeEffects.clear();
        
        console.log('[ParticlePerformanceOptimizer] Particle optimizer destroyed');
    }
}

// グローバルインスタンス（遅延初期化）
let _particlePerformanceOptimizer = null;

export function getParticlePerformanceOptimizer() {
    if (!_particlePerformanceOptimizer) {
        try {
            _particlePerformanceOptimizer = new ParticlePerformanceOptimizer();
            console.log('[ParticlePerformanceOptimizer] グローバルインスタンスを作成しました');
        } catch (error) {
            console.error('[ParticlePerformanceOptimizer] インスタンス作成エラー:', error);
            // フォールバック: 基本的なインスタンスを作成
            _particlePerformanceOptimizer = new ParticlePerformanceOptimizer();
        }
    }
    return _particlePerformanceOptimizer;
}

/**
 * ParticlePerformanceOptimizerインスタンスを再初期化
 */
export function reinitializeParticlePerformanceOptimizer() {
    try {
        if (_particlePerformanceOptimizer) {
            _particlePerformanceOptimizer.destroy();
        }
        _particlePerformanceOptimizer = new ParticlePerformanceOptimizer();
        console.log('[ParticlePerformanceOptimizer] 再初期化完了');
    } catch (error) {
        console.error('[ParticlePerformanceOptimizer] 再初期化エラー:', error);
    }
}

// Export for compatibility
export default ParticlePerformanceOptimizer;