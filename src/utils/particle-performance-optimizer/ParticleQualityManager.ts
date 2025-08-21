/**
 * Particle Quality Manager
 * パーティクル品質管理システム - 動的品質調整とパフォーマンス制御
 */

// Quality level interfaces
interface QualityLevel { particleMultiplier: number,
    maxParticles: number,
    enablePhysics: boolean,
    enableCollisions: boolean,
    enableTrails: boolean,
    enableGlow: boolean,
    textureQuality: number,
    updateFrequency: number  }

interface QualityLevels { minimal: QualityLevel,
    low: QualityLevel,
    medium: QualityLevel,
    high: QualityLevel,
    ultra: QualityLevel
    }

type QualityLevelName = keyof | QualityLevels;

interface QualityConfig { enabled: boolean,
    adaptiveQuality: boolean,
    currentLevel: QualityLevelName,
    levels: QualityLevels
     }

// Performance monitoring interfaces
interface PerformanceThresholds { downgrade: number,
    upgrade: number,
    critical: number }

interface PerformanceMonitor { enabled: boolean,
    targetFPS: number,
    minFPS: number,
    maxFPS: number,
    thresholds: PerformanceThresholds,
    fpsHistory: number[],
    historySize: number,
    averageFPS: number,
    lastAdaptation: number,
    adaptationCooldown: number,
    stabilityFrames: number,
    requiredStability: number }

// Scaling system interfaces
interface ScalingFactors { particleCount: number,
    particleSize: number,
    updateRate: number,
    effectIntensity: number,
    textureDetail: number,
    physicsAccuracy: number }

interface ScalingPresets { battery_saving: ScalingFactors,
    performance: ScalingFactors,
    balanced: ScalingFactors,
    quality: ScalingFactors
    }

type ScalingPresetName = keyof | ScalingPresets;

interface ScalingSystem { enabled: boolean,
    factors: ScalingFactors,
    scalingSpeed: number,
    targetFactors: ScalingFactors,
    presets: ScalingPresets
     }

// Statistics interface
interface QualityStats { qualityAdjustments: number,
    automaticDowngrades: number,
    automaticUpgrades: number,
    emergencyReductions: number,
    particlesReduced: number,
    effectsDisabled: number,
    performanceGain: number,
    currentQualityScore: number,
    adaptationActive: boolean,
    lastAdaptationReason: string }

// Particle interfaces for quality management
interface ParticlePhysics { enabled: boolean,
    gravity?: number,
    friction?: number,
    bounce?: number }

interface ParticleCollision { enabled: boolean,
    radius?: number,
    response?: string }

interface ParticleTrail { enabled: boolean,
    length?: number,
    opacity?: number,
    color?: string }

interface ParticleGlow { enabled: boolean,
    radius?: number,
    intensity?: number,
    color?: string }

interface ParticleVelocity { x: number,
    y: number  }

interface QualityManagedParticle { x: number,
    y: number,
    size?: number,
    opacity?: number,
    textureDetail?: number,
    physics?: ParticlePhysics,
    collision?: ParticleCollision,
    trail?: ParticleTrail,
    glow?: ParticleGlow,
    velocity?: ParticleVelocity }

// Configuration interface
interface ParticleQualityManagerConfig { enabled?: boolean,
    adaptiveQuality?: boolean,
    initialLevel?: QualityLevelName,
    performanceMonitoring?: boolean,
    targetFPS?: number,
    minFPS?: number,
    maxFPS?: number,
    downgradeThreshold?: number,
    upgradeThreshold?: number,
    criticalThreshold?: number,
    historySize?: number,
    adaptationCooldown?: number,
    requiredStability?: number,
    scalingSpeed?: number }

export class ParticleQualityManager {
    private qualityConfig: QualityConfig,
    private performanceMonitor: PerformanceMonitor,
    private scalingSystem: ScalingSystem,
    private, stats: QualityStats,
    constructor(config: ParticleQualityManagerConfig = {) {

        // Quality configuration
        this.qualityConfig = {
            enabled: config.enabled !== undefined ? config.enabled : true,
            adaptiveQuality: config.adaptiveQuality !== undefined ? config.adaptiveQuality : true,
            currentLevel: config.initialLevel || 'high',
            // Quality levels
           , levels: {
                minimal: {
                    particleMultiplier: 0.25,
                    maxParticles: 500,
                    enablePhysics: false,
                    enableCollisions: false,
                    enableTrails: false,
                    enableGlow: false,
    textureQuality: 0.5 }
                    updateFrequency: 0.5 
    };
                low: { particleMultiplier: 0.5,
                    maxParticles: 1000,
                    enablePhysics: true,
                    enableCollisions: false,
                    enableTrails: false,
                    enableGlow: false,
                    textureQuality: 0.7,
    updateFrequency: 0.7 };
                medium: { particleMultiplier: 0.75,
                    maxParticles: 2500,
                    enablePhysics: true,
                    enableCollisions: true,
                    enableTrails: false,
                    enableGlow: false,
                    textureQuality: 0.85,
    updateFrequency: 0.85 };
                high: { particleMultiplier: 1.0,
                    maxParticles: 5000,
                    enablePhysics: true,
                    enableCollisions: true,
                    enableTrails: true,
                    enableGlow: true,
                    textureQuality: 1.0,
    updateFrequency: 1.0 };
                ultra: { particleMultiplier: 1.5,
                    maxParticles: 10000,
                    enablePhysics: true,
                    enableCollisions: true,
                    enableTrails: true,
                    enableGlow: true,
                    textureQuality: 1.0,
    updateFrequency: 1.0 
    };
        // Performance monitoring
        this.performanceMonitor = { enabled: config.performanceMonitoring !== undefined ? config.performanceMonitoring : true,
            
            // Performance targets
            targetFPS: config.targetFPS || 50,
            minFPS: config.minFPS || 30,
            maxFPS: config.maxFPS || 60,
            // Adaptation thresholds
           , thresholds: {
                downgrade: config.downgradeThreshold || 35,  // FPS below this triggers downgrade,
                upgrade: config.upgradeThreshold || 55,      // FPS above this allows upgrade,
                critical: config.criticalThreshold || 25    // Emergency quality reduction  };
            // Performance history
            fpsHistory: [],
    historySize: config.historySize || 60, // 1 second at 60fps;
            averageFPS: 60;
            // Adaptation state
            lastAdaptation: 0,
    adaptationCooldown: config.adaptationCooldown || 2000, // 2 seconds;
            stabilityFrames: 0,
    requiredStability: config.requiredStability || 30 // 30 frames of stability;
        },
        
        // Quality scaling system
        this.scalingSystem = { enabled: true,
            
            // Scaling factors
            factors: {
                particleCount: 1.0,
                particleSize: 1.0,
                updateRate: 1.0,
                effectIntensity: 1.0,
                textureDetail: 1.0,
    physicsAccuracy: 1.0  };
            // Gradual scaling
            scalingSpeed: config.scalingSpeed || 0.1,
    targetFactors: { particleCount: 1.0,
                particleSize: 1.0,
                updateRate: 1.0,
                effectIntensity: 1.0,
                textureDetail: 1.0,
    physicsAccuracy: 1.0 };
            // Quality presets for different scenarios
            presets: { battery_saving: {
                    particleCount: 0.3,
                    particleSize: 0.8,
                    updateRate: 0.5,
                    effectIntensity: 0.6,
                    textureDetail: 0.5,
    physicsAccuracy: 0.7 };
                performance: { particleCount: 0.6,
                    particleSize: 0.9,
                    updateRate: 0.8,
                    effectIntensity: 0.8,
                    textureDetail: 0.8,
    physicsAccuracy: 0.9 };
                balanced: { particleCount: 0.8,
                    particleSize: 1.0,
                    updateRate: 0.9,
                    effectIntensity: 0.9,
                    textureDetail: 0.9,
    physicsAccuracy: 1.0 };
                quality: { particleCount: 1.0,
                    particleSize: 1.0,
                    updateRate: 1.0,
                    effectIntensity: 1.0,
                    textureDetail: 1.0,
    physicsAccuracy: 1.0 
    };
        // Statistics
        this.stats = { qualityAdjustments: 0,
            automaticDowngrades: 0,
            automaticUpgrades: 0,
            emergencyReductions: 0,
            // Performance impact
            particlesReduced: 0,
            effectsDisabled: 0,
            performanceGain: 0,
            // Current state
            currentQualityScore: 1.0,
    adaptationActive: false,
            lastAdaptationReason: 'none'
            };
        // Initialize current factors from level
        this.updateScalingFactorsFromLevel();
    }
    
    /**
     * Apply quality scaling to particles
     * @param particles - Particles to scale
     * @returns Quality-scaled particles
     */
    applyQualityScaling(particles: QualityManagedParticle[]): QualityManagedParticle[] { if (!this.qualityConfig.enabled) {
            return particles }
        
        const currentLevel = this.getCurrentQualityLevel();
        const scaledParticles: QualityManagedParticle[] = [],
        
        // Apply particle count reduction
        const maxParticles = Math.floor(currentLevel.maxParticles * this.scalingSystem.factors.particleCount);
        const particleStep = Math.max(1, Math.floor(particles.length / maxParticles);
        
        for(let, i = 0; i < particles.length && scaledParticles.length < maxParticles; i += particleStep) {
    
}
            const particle = { ...particles[i],
            
            // Apply quality-based modifications
            this.applyQualityModifications(particle, currentLevel),
            
            scaledParticles.push(particle) }
        
        // Update statistics
        this.stats.particlesReduced += particles.length - scaledParticles.length;
        
        return scaledParticles;
    }
    
    /**
     * Apply quality modifications to individual particle
     * @param particle - Particle to modify
     * @param qualityLevel - Current quality level
     */
    private applyQualityModifications(particle: QualityManagedParticle, qualityLevel: QualityLevel): void { const factors = this.scalingSystem.factors,
        
        // Scale particle size
        if(particle.size) {
    
}
            particle.size *= factors.particleSize; }
        }
        
        // Modify effect properties based on quality level
        if (!qualityLevel.enablePhysics && particle.physics) { delete particle.physics }
            particle.velocity = { x: 0, y: 0  }
        
        if (!qualityLevel.enableCollisions && particle.collision) { delete particle.collision }
        
        if (!qualityLevel.enableTrails && particle.trail) { delete particle.trail }
        
        if (!qualityLevel.enableGlow && particle.glow) { delete particle.glow }
        
        // Scale effect intensity
        if (particle.opacity !== undefined) { particle.opacity *= factors.effectIntensity }
        
        // Apply texture quality scaling
        if (particle.textureDetail !== undefined) { particle.textureDetail *= factors.textureDetail }
    }
    
    /**
     * Update performance metrics and adapt quality
     * @param currentFPS - Current frame rate
     * @param frameTime - Frame processing time
     */
    updatePerformanceMetrics(currentFPS: number, frameTime: number = 0): void { if (!this.performanceMonitor.enabled) return,
        
        // Update FPS history
        this.performanceMonitor.fpsHistory.push(currentFPS),
        if(this.performanceMonitor.fpsHistory.length > this.performanceMonitor.historySize) {
    
}
            this.performanceMonitor.fpsHistory.shift(); }
        }
        
        // Calculate average FPS
        const history = this.performanceMonitor.fpsHistory;
        this.performanceMonitor.averageFPS = history.reduce((sum, fps) => sum + fps, 0) / history.length;
        
        // Check for adaptive quality adjustment
        if (this.qualityConfig.adaptiveQuality) { this.checkQualityAdaptation() }
    }
    
    /**
     * Check if quality adaptation is needed
     */
    private checkQualityAdaptation(): void { const now = Date.now(),
        const timeSinceLastAdaptation = now - this.performanceMonitor.lastAdaptation,
        
        // Check cooldown period
        if(timeSinceLastAdaptation < this.performanceMonitor.adaptationCooldown) {
    
}
            return; }
        }
        
        const avgFPS = this.performanceMonitor.averageFPS;
        const thresholds = this.performanceMonitor.thresholds;
        
        // Emergency quality reduction
        if(avgFPS < thresholds.critical) {
            this.emergencyQualityReduction() }
            return; }
        }
        
        // Check for stability before adapting
        const recentFPS = this.performanceMonitor.fpsHistory.slice(-10);
        const isStable = this.checkPerformanceStability(recentFPS);
        
        if(!isStable) {
        
            this.performanceMonitor.stabilityFrames = 0 }
            return; }
        }
        
        this.performanceMonitor.stabilityFrames++;
        
        // Require stability before making changes
        if (this.performanceMonitor.stabilityFrames < this.performanceMonitor.requiredStability) { return }
        
        // Downgrade quality if performance is poor
        if (avgFPS < thresholds.downgrade) { this.downgradeQuality() }
        // Upgrade quality if performance allows
        else if (avgFPS > thresholds.upgrade) { this.upgradeQuality() }
    }
    
    /**
     * Check performance stability
     * @param recentFPS - Recent FPS measurements
     * @returns True if performance is stable
     */
    private checkPerformanceStability(recentFPS: number[]): boolean { if (recentFPS.length < 5) return false,
        
        const average = recentFPS.reduce((sum, fps) => sum + fps, 0) / recentFPS.length,
        const variance = recentFPS.reduce((sum, fps) => sum + Math.pow(fps - average, 2), 0) / recentFPS.length,
        const standardDeviation = Math.sqrt(variance),
        
        // Consider stable if standard deviation is low relative to average
        return standardDeviation < average * 0.1,
    
    /**
     * Emergency quality reduction for critical performance
     */''
    private emergencyQualityReduction()',
        console.warn('[ParticleQualityManager] Emergency, quality reduction, triggered'),

        this.setQualityLevel('minimal'),
        this.applyScalingPreset('battery_saving'),
        ',

        this.stats.emergencyReductions++,
        this.stats.lastAdaptationReason = 'emergency',
        this.performanceMonitor.lastAdaptation = Date.now() }
    
    /**
     * Downgrade quality level
     */
    private downgradeQuality(): void { const currentLevel = this.qualityConfig.currentLevel,
        const levels = Object.keys(this.qualityConfig.levels) as QualityLevelName[],
        const currentIndex = levels.indexOf(currentLevel),
        
        if(currentIndex > 0) {
        
            const newLevel = levels[currentIndex - 1],
            this.setQualityLevel(newLevel) }

            ' }'

            console.log(`[ParticleQualityManager] Quality, downgraded: ${currentLevel} -> ${newLevel}`}';
            ';

            this.stats.automaticDowngrades++;
            this.stats.lastAdaptationReason = 'performance';
        } else {  // Already at minimum, apply additional scaling }
            this.reduceScalingFactors(); }
        }
        
        this.performanceMonitor.lastAdaptation = Date.now();
        this.performanceMonitor.stabilityFrames = 0;
    }
    
    /**
     * Upgrade quality level
     */
    private upgradeQuality(): void { const currentLevel = this.qualityConfig.currentLevel,
        const levels = Object.keys(this.qualityConfig.levels) as QualityLevelName[],
        const currentIndex = levels.indexOf(currentLevel),
        
        if(currentIndex < levels.length - 1) {
        
            const newLevel = levels[currentIndex + 1],
            this.setQualityLevel(newLevel) }
            ' }'

            console.log(`[ParticleQualityManager] Quality, upgraded: ${currentLevel} -> ${newLevel}`}';
            ';

            this.stats.automaticUpgrades++;
            this.stats.lastAdaptationReason = 'headroom';
        } else {  // Already at maximum, can increase scaling factors }
            this.increaseScalingFactors(); }
        }
        
        this.performanceMonitor.lastAdaptation = Date.now();
        this.performanceMonitor.stabilityFrames = 0;
    }
    
    /**
     * Set quality level
     * @param level - Quality level name
     */
    setQualityLevel(level: QualityLevelName): void { if (!this.qualityConfig.levels[level]) { }
            console.warn(`[ParticleQualityManager] Unknown, quality level: ${level}`});
            return;
        }
        
        this.qualityConfig.currentLevel = level;
        this.updateScalingFactorsFromLevel();
        this.stats.qualityAdjustments++;
        
        console.log(`[ParticleQualityManager] Quality, level set, to: ${level}`});
    }
    
    /**
     * Apply scaling preset
     * @param preset - Preset name
     */
    applyScalingPreset(preset: ScalingPresetName): void { if (!this.scalingSystem.presets[preset]) { }
            console.warn(`[ParticleQualityManager] Unknown, preset: ${preset}`});
            return;
        }
        
        const presetFactors = this.scalingSystem.presets[preset];
        Object.assign(this.scalingSystem.factors, presetFactors);
        
        console.log(`[ParticleQualityManager] Applied, scaling preset: ${preset}`});
    }
    
    /**
     * Get current quality level configuration
     * @returns Quality level configuration
     */
    getCurrentQualityLevel(): QualityLevel { return this.qualityConfig.levels[this.qualityConfig.currentLevel] }
    
    /**
     * Update scaling factors from current quality level
     */
    private updateScalingFactorsFromLevel(): void { const level = this.getCurrentQualityLevel(),
        
        // Update scaling factors based on level
        this.scalingSystem.factors.particleCount = level.particleMultiplier,
        this.scalingSystem.factors.updateRate = level.updateFrequency,
        this.scalingSystem.factors.textureDetail = level.textureQuality }
    
    /**
     * Reduce scaling factors for additional performance
     */
    private reduceScalingFactors(): void { const factors = this.scalingSystem.factors,
        const reduction = 0.9, // 10% reduction
        
        factors.particleCount *= reduction,
        factors.particleSize *= reduction,
        factors.updateRate *= reduction,
        factors.effectIntensity *= reduction,
        
        // Clamp to minimum values
        factors.particleCount = Math.max(0.1, factors.particleCount),
        factors.particleSize = Math.max(0.5, factors.particleSize),
        factors.updateRate = Math.max(0.3, factors.updateRate),
        factors.effectIntensity = Math.max(0.2, factors.effectIntensity),

        console.log('[ParticleQualityManager] Scaling, factors reduced') }'
    
    /**
     * Increase scaling factors when performance allows
     */
    private increaseScalingFactors(): void { const factors = this.scalingSystem.factors,
        const increase = 1.1, // 10% increase
        
        factors.particleCount = Math.min(1.5, factors.particleCount * increase),
        factors.particleSize = Math.min(1.2, factors.particleSize * increase),
        factors.updateRate = Math.min(1.0, factors.updateRate * increase),
        factors.effectIntensity = Math.min(1.0, factors.effectIntensity * increase),

        console.log('[ParticleQualityManager] Scaling, factors increased') }'
    
    /**
     * Calculate current quality score
     * @returns Quality score (0-1)
     */
    calculateQualityScore(): number { const factors = this.scalingSystem.factors,
        const weights = {
            particleCount: 0.3,
            particleSize: 0.2,
            updateRate: 0.2,
            effectIntensity: 0.15,
            textureDetail: 0.1,
    physicsAccuracy: 0.05 };
        let score = 0;
        for(const [factor, value] of Object.entries(factors) {
            if (weights[factor, as keyof, ScalingFactors]) {
        }
                score += value * weights[factor as keyof ScalingFactors]; }
}
        
        this.stats.currentQualityScore = Math.max(0, Math.min(1, score);
        return this.stats.currentQualityScore;
    }
    
    /**
     * Get quality management statistics
     * @returns Statistics
     */
    getStats(): object { return { ...this.stats };
            currentLevel: this.qualityConfig.currentLevel }
            scalingFactors: { ...this.scalingSystem.factors,
            averageFPS: this.performanceMonitor.averageFPS,
    qualityScore: this.calculateQualityScore() }
    
    /**
     * Reset statistics'
     */''
    resetStats('';
        this.stats.lastAdaptationReason = 'none';
        
        this.performanceMonitor.fpsHistory = [];
        this.performanceMonitor.stabilityFrames = 0;

    }' }