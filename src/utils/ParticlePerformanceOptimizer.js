import { getErrorHandler } from './ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';

/**
 * Particle Effect Performance Optimization System
 * パーティクルエフェクト パフォーマンス最適化システム - インテリジェントカリングとレンダリングパイプライン最適化
 * 
 * 主要機能:
 * - パーティクル重要度スコアリングシステム
 * - 品質ベースパーティクル削減
 * - パーティクルエフェクト パフォーマンス監視
 * - バッチパーティクルレンダリング
 * - パーティクルエフェクト品質スケーリング
 * - パーティクルシステム パフォーマンス制御
 */
export class ParticlePerformanceOptimizer {
    constructor() {
        this.errorHandler = getErrorHandler();
        this.configManager = getConfigurationManager();
        
        // Particle optimization configuration
        this.particleConfig = {
            enabled: true,
            cullingEnabled: true,
            batchingEnabled: true,
            qualityScalingEnabled: true,
            
            // Performance targets
            targetFPS: 50, // Minimum FPS to maintain with particles
            maxParticles: 5000, // Global particle limit
            maxParticlesPerEffect: 500, // Per-effect particle limit
            
            // Quality levels
            qualityLevel: 'high', // 'ultra', 'high', 'medium', 'low', 'minimal'
            adaptiveQuality: true,
            
            // Performance thresholds
            performanceThresholds: {
                criticalFPS: 30,
                warningFPS: 45,
                optimalFPS: 55,
                excellentFPS: 60
            },
            
            // Culling parameters
            culling: {
                distanceCulling: true,
                frustumCulling: true,
                occlusionCulling: false,
                importanceCulling: true,
                ageCulling: true
            }
        };
        
        // Particle management
        this.particleManager = {
            activeParticles: new Set(),
            particlePool: new Map(), // Type -> Pool of particles
            particleSystems: new Map(),
            
            // Tracking
            totalParticleCount: 0,
            activeEffectCount: 0,
            
            // Spatial partitioning for culling
            spatialGrid: new Map(),
            gridSize: 128,
            
            // Performance tracking
            frameParticleCount: 0,
            averageParticleCount: 0,
            peakParticleCount: 0
        };
        
        // Importance scoring system
        this.importanceScoring = {
            enabled: true,
            
            // Scoring factors and weights
            factors: {
                distance: { weight: 0.25, inverted: true }, // Closer = more important
                size: { weight: 0.15, inverted: false }, // Larger = more important
                opacity: { weight: 0.15, inverted: false }, // More opaque = more important
                velocity: { weight: 0.10, inverted: false }, // Faster = more important
                age: { weight: 0.10, inverted: true }, // Newer = more important
                screenArea: { weight: 0.20, inverted: false }, // Larger screen area = more important
                effectPriority: { weight: 0.05, inverted: false } // Higher priority = more important
            },
            
            // Caching for performance
            scoreCache: new Map(),
            cacheValidFrames: 3, // Cache scores for 3 frames
            
            // Score thresholds
            thresholds: {
                veryHigh: 0.8,
                high: 0.6,
                medium: 0.4,
                low: 0.2,
                veryLow: 0.1
            }
        };
        
        // Quality scaling system
        this.qualityScaling = {
            enabled: true,
            currentLevel: 1.0, // 0.0 to 1.0
            targetLevel: 1.0,
            transitionSpeed: 0.1, // How fast to change quality
            
            // Quality level definitions
            levels: {
                'ultra': {
                    scale: 1.2,
                    density: 1.5,
                    complexity: 1.3,
                    effects: ['bloom', 'distortion', 'lighting'],
                    maxParticles: 8000
                },
                'high': {
                    scale: 1.0,
                    density: 1.0,
                    complexity: 1.0,
                    effects: ['bloom', 'lighting'],
                    maxParticles: 5000
                },
                'medium': {
                    scale: 0.8,
                    density: 0.7,
                    complexity: 0.8,
                    effects: ['lighting'],
                    maxParticles: 3000
                },
                'low': {
                    scale: 0.6,
                    density: 0.5,
                    complexity: 0.6,
                    effects: [],
                    maxParticles: 1500
                },
                'minimal': {
                    scale: 0.4,
                    density: 0.3,
                    complexity: 0.4,
                    effects: [],
                    maxParticles: 500
                }
            }
        };
        
        // Batch rendering system
        this.batchRenderer = {
            enabled: true,
            batches: new Map(), // Material/Texture -> Batch
            maxBatchSize: 1000,
            
            // Vertex buffer optimization
            vertexBuffers: new Map(),
            bufferSize: 4096, // Vertices per buffer
            
            // Instance rendering
            instancedRendering: true,
            instanceBuffer: null,
            maxInstances: 2000,
            
            // Texture atlasing
            textureAtlas: null,
            atlasSize: 2048,
            atlasSlots: new Map(),
            
            // Statistics
            stats: {
                batchCount: 0,
                particlesBatched: 0,
                drawCalls: 0,
                verticesRendered: 0
            }
        };
        
        // Performance monitoring
        this.performanceMonitor = {
            enabled: true,
            
            // Frame timing
            frameStart: 0,
            particleRenderTime: 0,
            cullingTime: 0,
            batchingTime: 0,
            
            // Performance history
            performanceHistory: [],
            historySize: 60, // 1 second at 60fps
            
            // FPS tracking
            currentFPS: 60,
            averageFPS: 60,
            minFPS: 60,
            
            // Particle performance metrics
            particlesPerFrame: 0,
            particlesPerSecond: 0,
            culledParticles: 0,
            cullingEfficiency: 0,
            
            // Memory tracking
            particleMemoryUsage: 0,
            poolMemoryUsage: 0,
            
            // Adaptive optimization
            adaptiveMode: true,
            optimizationTrigger: 45, // FPS threshold for optimization
            qualityReductionRate: 0.1, // How much to reduce quality each frame
            qualityRecoveryRate: 0.05 // How much to recover quality each frame
        };
        
        // Culling system
        this.cullingSystem = {
            enabled: true,
            
            // Frustum culling
            frustum: {
                left: 0, right: 0, top: 0, bottom: 0,
                near: 0, far: 1000
            },
            
            // Distance culling
            maxRenderDistance: 2000,
            fadeDistance: 1800,
            
            // Occlusion culling (advanced)
            occlusionEnabled: false,
            occluders: new Set(),
            
            // LOD (Level of Detail) system
            lodEnabled: true,
            lodDistances: [100, 300, 600, 1000], // Distance thresholds
            lodQualityMultipliers: [1.0, 0.8, 0.6, 0.4, 0.2],
            
            // Culling statistics
            stats: {
                totalParticles: 0,
                frustumCulled: 0,
                distanceCulled: 0,
                occlusionCulled: 0,
                importanceCulled: 0,
                ageCulled: 0,
                finalCount: 0
            }
        };
        
        // Effect system integration
        this.effectSystem = {
            registeredEffects: new Map(),
            activeEffects: new Set(),
            
            // Effect categories
            categories: {
                'critical': { priority: 5, qualityMultiplier: 1.2 },
                'important': { priority: 4, qualityMultiplier: 1.0 },
                'normal': { priority: 3, qualityMultiplier: 0.8 },
                'background': { priority: 2, qualityMultiplier: 0.6 },
                'ambient': { priority: 1, qualityMultiplier: 0.4 }
            },
            
            // Performance budgets per category
            budgets: {
                'critical': 1000,
                'important': 800,
                'normal': 600,
                'background': 400,
                'ambient': 200
            }
        };
        
        this.initializeParticleOptimizer();
        
        console.log('[ParticlePerformanceOptimizer] Particle performance optimization system initialized');
    }
    
    /**
     * Initialize particle optimizer
     */
    initializeParticleOptimizer() {
        // Initialize particle pools
        this.initializeParticlePools();
        
        // Setup spatial partitioning
        this.initializeSpatialPartitioning();
        
        // Initialize batch renderer
        this.initializeBatchRenderer();
        
        // Start performance monitoring
        this.startPerformanceMonitoring();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Register default particle types
        this.registerDefaultParticleTypes();
    }
    
    /**
     * Initialize particle pools for efficient memory management
     */
    initializeParticlePools() {
        const poolTypes = [
            'basic', 'sprite', 'trail', 'explosion', 'smoke', 'fire', 'water', 'spark', 'magic', 'debris'
        ];
        
        for (const type of poolTypes) {
            this.particleManager.particlePool.set(type, {
                available: [],
                inUse: new Set(),
                maxSize: 1000,
                created: 0,
                recycled: 0
            });
        }
        
        console.log('[ParticlePerformanceOptimizer] Particle pools initialized for', poolTypes.length, 'types');
    }
    
    /**
     * Initialize spatial partitioning for efficient culling
     */
    initializeSpatialPartitioning() {
        this.particleManager.spatialGrid.clear();
        
        // This would normally be based on world size, using defaults for now
        const worldSize = 4096;
        const gridSize = this.particleManager.gridSize;
        
        for (let x = -worldSize; x < worldSize; x += gridSize) {
            for (let y = -worldSize; y < worldSize; y += gridSize) {
                const key = `${x},${y}`;
                this.particleManager.spatialGrid.set(key, new Set());
            }
        }
        
        console.log('[ParticlePerformanceOptimizer] Spatial partitioning initialized');
    }
    
    /**
     * Initialize batch renderer for efficient particle rendering
     */
    initializeBatchRenderer() {
        if (!this.batchRenderer.enabled) return;
        
        // Initialize vertex buffers
        this.createVertexBuffers();
        
        // Initialize texture atlas
        this.createTextureAtlas();
        
        // Setup instance rendering
        this.setupInstanceRendering();
        
        console.log('[ParticlePerformanceOptimizer] Batch renderer initialized');
    }
    
    /**
     * Create vertex buffers for efficient rendering
     */
    createVertexBuffers() {
        const bufferTypes = ['position', 'color', 'texture', 'size', 'rotation'];
        
        for (const type of bufferTypes) {
            this.batchRenderer.vertexBuffers.set(type, {
                data: new Float32Array(this.batchRenderer.bufferSize * 4), // Quad vertices
                index: 0,
                dirty: false
            });
        }
    }
    
    /**
     * Create texture atlas for batch rendering
     */
    createTextureAtlas() {
        // This would create a real texture atlas in a full implementation
        this.batchRenderer.textureAtlas = {
            canvas: document.createElement('canvas'),
            context: null,
            slots: new Map(),
            nextSlot: 0,
            size: this.batchRenderer.atlasSize
        };
        
        this.batchRenderer.textureAtlas.canvas.width = this.batchRenderer.atlasSize;
        this.batchRenderer.textureAtlas.canvas.height = this.batchRenderer.atlasSize;
        this.batchRenderer.textureAtlas.context = this.batchRenderer.textureAtlas.canvas.getContext('2d');
    }
    
    /**
     * Setup instance rendering for particle batches
     */
    setupInstanceRendering() {
        if (!this.batchRenderer.instancedRendering) return;
        
        this.batchRenderer.instanceBuffer = {
            transforms: new Float32Array(this.batchRenderer.maxInstances * 16), // 4x4 matrices
            colors: new Float32Array(this.batchRenderer.maxInstances * 4), // RGBA
            uvs: new Float32Array(this.batchRenderer.maxInstances * 4), // UV coordinates
            count: 0
        };
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
            const visibleParticles = this.performParticleCulling(particles, camera);
            this.performanceMonitor.cullingTime = performance.now() - cullingStart;
            
            // Apply quality scaling
            const scaledParticles = this.applyQualityScaling(visibleParticles);
            
            // Optimize particle rendering
            const batchingStart = performance.now();
            const renderBatches = this.createRenderBatches(scaledParticles);
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
                cullingEfficiency: this.cullingSystem.stats.finalCount / this.cullingSystem.stats.totalParticles,
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
     * Update particle tracking and spatial partitioning
     * @param {Array} particles - All particles
     */
    updateParticleTracking(particles) {
        // Clear spatial grid
        this.particleManager.spatialGrid.forEach(cell => cell.clear());
        
        // Update particle counts
        this.particleManager.totalParticleCount = particles.length;
        this.particleManager.frameParticleCount = particles.length;
        
        // Update spatial partitioning
        for (const particle of particles) {
            this.addParticleToSpatialGrid(particle);
        }
        
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
     * Add particle to spatial grid
     * @param {object} particle - Particle object
     */
    addParticleToSpatialGrid(particle) {
        const gridSize = this.particleManager.gridSize;
        const gridX = Math.floor(particle.x / gridSize) * gridSize;
        const gridY = Math.floor(particle.y / gridSize) * gridSize;
        const key = `${gridX},${gridY}`;
        
        const cell = this.particleManager.spatialGrid.get(key);
        if (cell) {
            cell.add(particle);
        }
    }
    
    /**
     * Perform intelligent particle culling
     * @param {Array} particles - All particles
     * @param {object} camera - Camera information
     * @returns {Array} Visible particles after culling
     */
    performParticleCulling(particles, camera) {
        if (!this.particleConfig.cullingEnabled) {
            return particles;
        }
        
        // Initialize culling stats
        const stats = this.cullingSystem.stats;
        stats.totalParticles = particles.length;
        stats.frustumCulled = 0;
        stats.distanceCulled = 0;
        stats.occlusionCulled = 0;
        stats.importanceCulled = 0;
        stats.ageCulled = 0;
        
        let visibleParticles = particles;
        
        // Frustum culling
        if (this.particleConfig.culling.frustumCulling && camera) {
            visibleParticles = this.performFrustumCulling(visibleParticles, camera);
            stats.frustumCulled = particles.length - visibleParticles.length;
        }
        
        // Distance culling
        if (this.particleConfig.culling.distanceCulling && camera) {
            const beforeDistance = visibleParticles.length;
            visibleParticles = this.performDistanceCulling(visibleParticles, camera);
            stats.distanceCulled = beforeDistance - visibleParticles.length;
        }
        
        // Age culling (remove very old or very young particles based on importance)
        if (this.particleConfig.culling.ageCulling) {
            const beforeAge = visibleParticles.length;
            visibleParticles = this.performAgeCulling(visibleParticles);
            stats.ageCulled = beforeAge - visibleParticles.length;
        }
        
        // Importance-based culling (most important step)
        if (this.particleConfig.culling.importanceCulling) {
            const beforeImportance = visibleParticles.length;
            visibleParticles = this.performImportanceCulling(visibleParticles);
            stats.importanceCulled = beforeImportance - visibleParticles.length;
        }
        
        // Final count
        stats.finalCount = visibleParticles.length;
        
        // Update culling efficiency
        this.performanceMonitor.culledParticles = particles.length - visibleParticles.length;
        this.performanceMonitor.cullingEfficiency = this.performanceMonitor.culledParticles / particles.length;
        
        console.log(`[ParticlePerformanceOptimizer] Culling: ${particles.length} → ${visibleParticles.length} particles (${(this.performanceMonitor.cullingEfficiency * 100).toFixed(1)}% culled)`);
        
        return visibleParticles;
    }
    
    /**
     * Perform frustum culling
     * @param {Array} particles - Particles to cull
     * @param {object} camera - Camera information
     * @returns {Array} Particles within frustum
     */
    performFrustumCulling(particles, camera) {
        // Update frustum bounds
        this.updateFrustum(camera);
        
        const frustum = this.cullingSystem.frustum;
        
        return particles.filter(particle => {
            return particle.x >= frustum.left &&
                   particle.x <= frustum.right &&
                   particle.y >= frustum.top &&
                   particle.y <= frustum.bottom;
        });
    }
    
    /**
     * Update frustum bounds based on camera
     * @param {object} camera - Camera information
     */
    updateFrustum(camera) {
        const margin = 100; // Extra margin for particles near edge
        
        this.cullingSystem.frustum = {
            left: camera.x - camera.width / 2 - margin,
            right: camera.x + camera.width / 2 + margin,
            top: camera.y - camera.height / 2 - margin,
            bottom: camera.y + camera.height / 2 + margin,
            near: 0,
            far: this.cullingSystem.maxRenderDistance
        };
    }
    
    /**
     * Perform distance culling
     * @param {Array} particles - Particles to cull
     * @param {object} camera - Camera information
     * @returns {Array} Particles within render distance
     */
    performDistanceCulling(particles, camera) {
        const maxDistance = this.cullingSystem.maxRenderDistance;
        const fadeDistance = this.cullingSystem.fadeDistance;
        
        return particles.filter(particle => {
            const dx = particle.x - camera.x;
            const dy = particle.y - camera.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > maxDistance) {
                return false;
            }
            
            // Apply fade for particles near max distance
            if (distance > fadeDistance) {
                const fadeRatio = 1 - (distance - fadeDistance) / (maxDistance - fadeDistance);
                particle.opacity = (particle.opacity || 1.0) * fadeRatio;
            }
            
            return true;
        });
    }
    
    /**
     * Perform age-based culling
     * @param {Array} particles - Particles to cull
     * @returns {Array} Particles within age limits
     */
    performAgeCulling(particles) {
        return particles.filter(particle => {
            const age = particle.age || 0;
            const lifetime = particle.lifetime || 1;
            const ageRatio = age / lifetime;
            
            // Cull particles that are too young (just created, may not be visible yet)
            if (ageRatio < 0.01) {
                return false;
            }
            
            // Cull particles that are too old (nearly dead, very transparent)
            if (ageRatio > 0.98) {
                return false;
            }
            
            return true;
        });
    }
    
    /**
     * Perform importance-based culling
     * @param {Array} particles - Particles to cull
     * @returns {Array} Most important particles
     */
    performImportanceCulling(particles) {
        // If we're under the limit, no need to cull
        if (particles.length <= this.particleConfig.maxParticles) {
            return particles;
        }
        
        // Calculate importance scores
        const particlesWithScores = particles.map(particle => ({
            particle,
            importance: this.calculateParticleImportance(particle)
        }));
        
        // Sort by importance (highest first)
        particlesWithScores.sort((a, b) => b.importance - a.importance);
        
        // Take only the most important particles
        const culledCount = particles.length - this.particleConfig.maxParticles;
        const importantParticles = particlesWithScores
            .slice(0, this.particleConfig.maxParticles)
            .map(item => item.particle);
        
        console.log(`[ParticlePerformanceOptimizer] Importance culling: ${culledCount} particles removed`);
        
        return importantParticles;
    }
    
    /**
     * Calculate particle importance score
     * @param {object} particle - Particle to score
     * @returns {number} Importance score (0-1)
     */
    calculateParticleImportance(particle) {
        // Check cache first
        const cacheKey = `${particle.id}_${this.performanceMonitor.frameStart}`;
        if (this.importanceScoring.scoreCache.has(cacheKey)) {
            return this.importanceScoring.scoreCache.get(cacheKey);
        }
        
        let totalScore = 0;
        const factors = this.importanceScoring.factors;
        
        // Distance factor (closer = more important)
        const distance = particle.distanceToCamera || 1000;
        const distanceScore = factors.distance.inverted ? 
            1 - Math.min(1, distance / 1000) : 
            Math.min(1, distance / 1000);
        totalScore += distanceScore * factors.distance.weight;
        
        // Size factor (larger = more important)
        const size = particle.size || 10;
        const sizeScore = Math.min(1, size / 50);
        totalScore += sizeScore * factors.size.weight;
        
        // Opacity factor (more opaque = more important)
        const opacity = particle.opacity || 1.0;
        totalScore += opacity * factors.opacity.weight;
        
        // Velocity factor (faster = more important for motion blur etc.)
        const velocity = Math.sqrt((particle.vx || 0) ** 2 + (particle.vy || 0) ** 2);
        const velocityScore = Math.min(1, velocity / 200);
        totalScore += velocityScore * factors.velocity.weight;
        
        // Age factor (newer particles often more important)
        const age = particle.age || 0;
        const lifetime = particle.lifetime || 1;
        const ageScore = factors.age.inverted ? 
            1 - (age / lifetime) : 
            (age / lifetime);
        totalScore += ageScore * factors.age.weight;
        
        // Screen area factor
        const screenSize = (particle.screenSize || particle.size || 10);
        const screenAreaScore = Math.min(1, screenSize / 100);
        totalScore += screenAreaScore * factors.screenArea.weight;
        
        // Effect priority factor
        const effectType = particle.type || 'normal';
        const effectConfig = this.effectSystem.registeredEffects.get(effectType);
        const priority = effectConfig ? 
            this.effectSystem.categories[effectConfig.category]?.priority || 3 : 3;
        const priorityScore = priority / 5; // Normalize to 0-1
        totalScore += priorityScore * factors.effectPriority.weight;
        
        // Clamp final score
        const finalScore = Math.max(0, Math.min(1, totalScore));
        
        // Cache the score
        this.importanceScoring.scoreCache.set(cacheKey, finalScore);
        
        // Clean old cache entries periodically
        if (this.importanceScoring.scoreCache.size > 10000) {
            this.cleanImportanceCache();
        }
        
        return finalScore;
    }
    
    /**
     * Clean old importance cache entries
     */
    cleanImportanceCache() {
        const currentFrame = this.performanceMonitor.frameStart;
        const maxAge = this.importanceScoring.cacheValidFrames * 16; // Convert frames to ms
        
        for (const [key, timestamp] of this.importanceScoring.scoreCache.entries()) {
            if (currentFrame - timestamp > maxAge) {
                this.importanceScoring.scoreCache.delete(key);
            }
        }
    }
    
    /**
     * Apply quality scaling to particles
     * @param {Array} particles - Particles to scale
     * @returns {Array} Quality-scaled particles
     */
    applyQualityScaling(particles) {
        if (!this.qualityScaling.enabled) {
            return particles;
        }
        
        const currentLevel = this.qualityScaling.currentLevel;
        const qualityConfig = this.qualityScaling.levels[this.particleConfig.qualityLevel];
        
        // Apply quality scaling to particle properties
        const scaledParticles = particles.map(particle => {
            const scaledParticle = { ...particle };
            
            // Scale size
            scaledParticle.size = (particle.size || 10) * qualityConfig.scale * currentLevel;
            
            // Scale complexity (reduce particle properties)
            if (currentLevel < 1.0) {
                // Remove expensive effects at low quality
                if (currentLevel < 0.6) {
                    delete scaledParticle.glow;
                    delete scaledParticle.trail;
                    delete scaledParticle.distortion;
                }
                
                if (currentLevel < 0.4) {
                    delete scaledParticle.rotation;
                    delete scaledParticle.spin;
                    scaledParticle.opacity = Math.min(scaledParticle.opacity || 1.0, 0.8);
                }
            }
            
            return scaledParticle;
        });
        
        // Apply density scaling (remove particles based on quality)
        const targetCount = Math.floor(particles.length * qualityConfig.density * currentLevel);
        
        if (scaledParticles.length > targetCount) {
            // Remove least important particles
            const particlesWithImportance = scaledParticles.map(particle => ({
                particle,
                importance: this.calculateParticleImportance(particle)
            }));
            
            particlesWithImportance.sort((a, b) => b.importance - a.importance);
            
            return particlesWithImportance
                .slice(0, targetCount)
                .map(item => item.particle);
        }
        
        return scaledParticles;
    }
    
    /**
     * Create render batches for efficient particle rendering
     * @param {Array} particles - Particles to batch
     * @returns {Map} Render batches organized by material/texture
     */
    createRenderBatches(particles) {
        if (!this.batchRenderer.enabled) {
            return new Map([['default', particles]]);
        }
        
        const batches = new Map();
        
        // Clear previous batch statistics
        this.batchRenderer.stats = {
            batchCount: 0,
            particlesBatched: 0,
            drawCalls: 0,
            verticesRendered: 0
        };
        
        // Group particles by render properties
        for (const particle of particles) {
            const batchKey = this.getBatchKey(particle);
            
            if (!batches.has(batchKey)) {
                batches.set(batchKey, {
                    particles: [],
                    material: particle.material || 'default',
                    texture: particle.texture || 'default',
                    blendMode: particle.blendMode || 'normal',
                    renderOrder: particle.renderOrder || 0
                });
            }
            
            batches.get(batchKey).particles.push(particle);
        }
        
        // Optimize batch sizes
        const optimizedBatches = this.optimizeBatchSizes(batches);
        
        // Update batch statistics
        this.batchRenderer.stats.batchCount = optimizedBatches.size;
        this.batchRenderer.stats.particlesBatched = particles.length;
        this.batchRenderer.stats.drawCalls = optimizedBatches.size;
        
        console.log(`[ParticlePerformanceOptimizer] Created ${optimizedBatches.size} render batches for ${particles.length} particles`);
        
        return optimizedBatches;
    }
    
    /**
     * Get batch key for particle grouping
     * @param {object} particle - Particle object
     * @returns {string} Batch key
     */
    getBatchKey(particle) {
        const material = particle.material || 'default';
        const texture = particle.texture || 'default';
        const blendMode = particle.blendMode || 'normal';
        
        return `${material}_${texture}_${blendMode}`;
    }
    
    /**
     * Optimize batch sizes for rendering efficiency
     * @param {Map} batches - Initial batches
     * @returns {Map} Optimized batches
     */
    optimizeBatchSizes(batches) {
        const optimizedBatches = new Map();
        const maxBatchSize = this.batchRenderer.maxBatchSize;
        
        for (const [key, batch] of batches) {
            const particles = batch.particles;
            
            if (particles.length <= maxBatchSize) {
                // Batch is already optimal size
                optimizedBatches.set(key, batch);
            } else {
                // Split large batch into smaller batches
                for (let i = 0; i < particles.length; i += maxBatchSize) {
                    const subBatch = {
                        ...batch,
                        particles: particles.slice(i, i + maxBatchSize)
                    };
                    
                    optimizedBatches.set(`${key}_${Math.floor(i / maxBatchSize)}`, subBatch);
                }
            }
        }
        
        return optimizedBatches;
    }
    
    /**
     * Update frame performance metrics
     * @param {number} optimizationTime - Time spent optimizing
     * @param {number} originalCount - Original particle count
     * @param {number} finalCount - Final particle count
     */
    updateFramePerformanceMetrics(optimizationTime, originalCount, finalCount) {
        const monitor = this.performanceMonitor;
        
        // Update timing metrics
        monitor.particleRenderTime = optimizationTime;
        
        // Update particle metrics
        monitor.particlesPerFrame = finalCount;
        monitor.particlesPerSecond = finalCount * (monitor.currentFPS || 60);
        
        // Calculate performance gain
        const performanceGain = this.calculatePerformanceGain(originalCount, finalCount);
        
        // Add to performance history
        monitor.performanceHistory.push({
            timestamp: Date.now(),
            originalCount,
            finalCount,
            optimizationTime,
            cullingTime: monitor.cullingTime,
            batchingTime: monitor.batchingTime,
            performanceGain,
            fps: monitor.currentFPS
        });
        
        // Keep history size manageable
        if (monitor.performanceHistory.length > monitor.historySize) {
            monitor.performanceHistory.shift();
        }
    }
    
    /**
     * Calculate performance gain from optimization
     * @param {number} originalCount - Original particle count
     * @param {number} finalCount - Final particle count
     * @returns {number} Performance gain (0-1)
     */
    calculatePerformanceGain(originalCount, finalCount) {
        if (originalCount === 0) return 0;
        
        // Simple estimation: performance gain is roughly proportional to particle reduction
        const reductionRatio = (originalCount - finalCount) / originalCount;
        
        // Account for batching efficiency
        const batchingGain = this.batchRenderer.enabled ? 0.2 : 0;
        
        // Account for culling efficiency
        const cullingGain = this.performanceMonitor.cullingEfficiency * 0.3;
        
        return Math.min(1, reductionRatio * 0.5 + batchingGain + cullingGain);
    }
    
    /**
     * Update performance metrics
     */
    updatePerformanceMetrics() {
        // This would integrate with actual FPS measurement
        // For now, we'll estimate based on performance history
        
        const history = this.performanceMonitor.performanceHistory;
        if (history.length === 0) return;
        
        // Calculate recent average metrics
        const recentFrames = history.slice(-10);
        const avgOptimizationTime = recentFrames.reduce((sum, frame) => sum + frame.optimizationTime, 0) / recentFrames.length;
        
        // Estimate current FPS based on particle load
        const particleLoad = this.particleManager.averageParticleCount / this.particleConfig.maxParticles;
        const estimatedFPS = Math.max(30, 60 - (particleLoad * 20));
        
        this.performanceMonitor.currentFPS = estimatedFPS;
        this.performanceMonitor.averageFPS = recentFrames.reduce((sum, frame) => sum + (frame.fps || 60), 0) / recentFrames.length;
    }
    
    /**
     * Perform adaptive optimization based on performance
     */
    performAdaptiveOptimization() {
        if (!this.performanceMonitor.adaptiveMode) return;
        
        const currentFPS = this.performanceMonitor.currentFPS;
        const targetFPS = this.particleConfig.targetFPS;
        const optimizationTrigger = this.performanceMonitor.optimizationTrigger;
        
        // Check if we need to reduce quality
        if (currentFPS < optimizationTrigger) {
            this.reduceParticleQuality();
        } else if (currentFPS > targetFPS + 10) {
            // Performance is good, try to increase quality
            this.increaseParticleQuality();
        }
    }
    
    /**
     * Reduce particle quality for better performance
     */
    reduceParticleQuality() {
        const reductionRate = this.performanceMonitor.qualityReductionRate;
        const newLevel = Math.max(0.1, this.qualityScaling.currentLevel - reductionRate);
        
        if (newLevel !== this.qualityScaling.currentLevel) {
            this.qualityScaling.currentLevel = newLevel;
            
            // Also reduce particle limits
            const newLimit = Math.max(100, this.particleConfig.maxParticles * 0.9);
            this.particleConfig.maxParticles = Math.floor(newLimit);
            
            console.log(`[ParticlePerformanceOptimizer] Quality reduced: ${(newLevel * 100).toFixed(1)}%, limit: ${this.particleConfig.maxParticles}`);
        }
    }
    
    /**
     * Increase particle quality when performance allows
     */
    increaseParticleQuality() {
        const recoveryRate = this.performanceMonitor.qualityRecoveryRate;
        const newLevel = Math.min(1.0, this.qualityScaling.currentLevel + recoveryRate);
        
        if (newLevel !== this.qualityScaling.currentLevel) {
            this.qualityScaling.currentLevel = newLevel;
            
            // Gradually restore particle limits
            const targetLimit = this.qualityScaling.levels[this.particleConfig.qualityLevel].maxParticles;
            const newLimit = Math.min(targetLimit, this.particleConfig.maxParticles * 1.05);
            this.particleConfig.maxParticles = Math.floor(newLimit);
            
            console.log(`[ParticlePerformanceOptimizer] Quality increased: ${(newLevel * 100).toFixed(1)}%, limit: ${this.particleConfig.maxParticles}`);
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for quality change requests
        document.addEventListener('particleQualityChange', (event) => {
            this.handleQualityChange(event.detail);
        });
        
        // Listen for performance warnings
        document.addEventListener('performanceWarning', (event) => {
            this.handlePerformanceWarning(event.detail);
        });
        
        // Listen for visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseParticleOptimization();
            } else {
                this.resumeParticleOptimization();
            }
        });
    }
    
    /**
     * Handle quality change requests
     * @param {object} details - Quality change details
     */
    handleQualityChange(details) {
        if (details.level && this.qualityScaling.levels[details.level]) {
            this.particleConfig.qualityLevel = details.level;
            this.qualityScaling.targetLevel = 1.0; // Reset to full quality for new level
            
            console.log(`[ParticlePerformanceOptimizer] Quality level changed to: ${details.level}`);
        }
    }
    
    /**
     * Handle performance warnings
     * @param {object} warning - Performance warning details
     */
    handlePerformanceWarning(warning) {
        if (warning.type === 'critical' || warning.source === 'particles') {
            // Immediate quality reduction for critical warnings
            this.qualityScaling.currentLevel = Math.max(0.3, this.qualityScaling.currentLevel * 0.7);
            this.particleConfig.maxParticles = Math.floor(this.particleConfig.maxParticles * 0.5);
            
            console.log('[ParticlePerformanceOptimizer] Critical warning: Emergency particle optimization activated');
        }
    }
    
    /**
     * Pause particle optimization
     */
    pauseParticleOptimization() {
        this.particleConfig.enabled = false;
        console.log('[ParticlePerformanceOptimizer] Particle optimization paused');
    }
    
    /**
     * Resume particle optimization
     */
    resumeParticleOptimization() {
        this.particleConfig.enabled = true;
        console.log('[ParticlePerformanceOptimizer] Particle optimization resumed');
    }
    
    // Public API methods
    
    /**
     * Create a particle effect
     * @param {string} type - Effect type
     * @param {object} config - Effect configuration
     * @returns {object} Created effect
     */
    createEffect(type, config) {
        const effectConfig = this.effectSystem.registeredEffects.get(type);
        if (!effectConfig) {
            console.warn(`[ParticlePerformanceOptimizer] Unknown effect type: ${type}`);
            return null;
        }
        
        const effect = {
            id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            config: { ...effectConfig, ...config },
            particles: [],
            active: true,
            createdAt: Date.now()
        };
        
        this.effectSystem.activeEffects.add(effect);
        
        console.log(`[ParticlePerformanceOptimizer] Created effect: ${type} (${effect.id})`);
        return effect;
    }
    
    /**
     * Get particle from pool
     * @param {string} type - Particle type
     * @returns {object} Pooled particle
     */
    getParticleFromPool(type) {
        const pool = this.particleManager.particlePool.get(type);
        if (!pool) {
            console.warn(`[ParticlePerformanceOptimizer] No pool for particle type: ${type}`);
            return this.createNewParticle(type);
        }
        
        if (pool.available.length > 0) {
            const particle = pool.available.pop();
            pool.inUse.add(particle);
            pool.recycled++;
            return particle;
        }
        
        // Create new particle if pool is empty
        if (pool.inUse.size < pool.maxSize) {
            const particle = this.createNewParticle(type);
            pool.inUse.add(particle);
            pool.created++;
            return particle;
        }
        
        console.warn(`[ParticlePerformanceOptimizer] Pool exhausted for type: ${type}`);
        return null;
    }
    
    /**
     * Return particle to pool
     * @param {object} particle - Particle to return
     */
    returnParticleToPool(particle) {
        const type = particle.type;
        const pool = this.particleManager.particlePool.get(type);
        
        if (pool && pool.inUse.has(particle)) {
            pool.inUse.delete(particle);
            
            // Reset particle properties
            this.resetParticle(particle);
            
            pool.available.push(particle);
        }
    }
    
    /**
     * Create new particle
     * @param {string} type - Particle type
     * @returns {object} New particle
     */
    createNewParticle(type) {
        return {
            id: `particle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            x: 0, y: 0, z: 0,
            vx: 0, vy: 0, vz: 0,
            size: 10,
            opacity: 1.0,
            age: 0,
            lifetime: 1.0,
            active: true
        };
    }
    
    /**
     * Reset particle properties
     * @param {object} particle - Particle to reset
     */
    resetParticle(particle) {
        particle.x = 0;
        particle.y = 0;
        particle.z = 0;
        particle.vx = 0;
        particle.vy = 0;
        particle.vz = 0;
        particle.age = 0;
        particle.opacity = 1.0;
        particle.active = false;
        
        // Remove temporary properties
        delete particle.distanceToCamera;
        delete particle.screenSize;
        delete particle.importance;
    }
    
    /**
     * Set particle quality level
     * @param {string} level - Quality level
     */
    setQualityLevel(level) {
        if (this.qualityScaling.levels[level]) {
            this.particleConfig.qualityLevel = level;
            this.qualityScaling.targetLevel = 1.0;
            
            const levelConfig = this.qualityScaling.levels[level];
            this.particleConfig.maxParticles = levelConfig.maxParticles;
            
            console.log(`[ParticlePerformanceOptimizer] Quality level set to: ${level}`);
        }
    }
    
    /**
     * Enable or disable adaptive optimization
     * @param {boolean} enabled - Whether to enable adaptive optimization
     */
    setAdaptiveOptimization(enabled) {
        this.performanceMonitor.adaptiveMode = enabled;
        console.log(`[ParticlePerformanceOptimizer] Adaptive optimization ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Get comprehensive statistics
     * @returns {object} Particle performance statistics
     */
    getStats() {
        return {
            particles: {
                total: this.particleManager.totalParticleCount,
                active: this.particleManager.activeParticles.size,
                average: Math.round(this.particleManager.averageParticleCount),
                peak: this.particleManager.peakParticleCount
            },
            performance: {
                currentFPS: Math.round(this.performanceMonitor.currentFPS),
                averageFPS: Math.round(this.performanceMonitor.averageFPS),
                renderTime: this.performanceMonitor.particleRenderTime,
                cullingTime: this.performanceMonitor.cullingTime,
                batchingTime: this.performanceMonitor.batchingTime
            },
            culling: this.cullingSystem.stats,
            batching: this.batchRenderer.stats,
            quality: {
                level: this.particleConfig.qualityLevel,
                currentScale: this.qualityScaling.currentLevel,
                adaptiveMode: this.performanceMonitor.adaptiveMode
            },
            pools: Object.fromEntries(
                Array.from(this.particleManager.particlePool.entries()).map(([type, pool]) => [
                    type,
                    {
                        available: pool.available.length,
                        inUse: pool.inUse.size,
                        created: pool.created,
                        recycled: pool.recycled
                    }
                ])
            )
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
            Object.assign(this.cullingSystem, config.culling);
        }
        
        if (config.quality) {
            Object.assign(this.qualityScaling, config.quality);
        }
        
        if (config.batching) {
            Object.assign(this.batchRenderer, config.batching);
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
        
        // Clear pools
        this.particleManager.particlePool.clear();
        this.particleManager.activeParticles.clear();
        
        // Clear spatial grid
        this.particleManager.spatialGrid.clear();
        
        // Clear caches
        this.importanceScoring.scoreCache.clear();
        
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

// 後方互換性のため
export const particlePerformanceOptimizer = getParticlePerformanceOptimizer;