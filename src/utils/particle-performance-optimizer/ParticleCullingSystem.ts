/**
 * Particle Culling System
 * パーティクルカリングシステム - インテリジェントなパーティクル可視性判定
 */

// Configuration interfaces
interface CullingConfig { distanceCulling: boolean,
    frustumCulling: boolean,
    occlusionCulling: boolean,
    importanceCulling: boolean,
    ageCulling: boolean,
    maxCullingDistance: number,
    nearCullingDistance: number,
    maxAge: number,
    ageBasedCulling: boolean;
    interface ImportanceFactors {
    distance: { weigh,t: number, inverted: boolean,
    size: { weight: number, inverted: boolean,
    opacity: { weight: number, inverted: boolean,
    velocity: { weight: number, inverted: boolean,
    age: { weight: number, inverted: boolean,
    screenArea: { weight: number, inverted: boolean,
    effectPriority: { weight: number, inverted: boolean,
    effectPriority: { weight: number, inverted: boolean;
         },
interface ImportanceThresholds { veryHigh: number,
    high: number,
    medium: number,
    low: number,
    veryLow: number,
    veryLow: number;
        };
interface ImportanceScoring { enabled: boolean,
    factors: ImportanceFactors,
    scoreCache: Map<string, number>;
    cacheValidFrames: number,
    currentFrame: number,
    thresholds: ImportanceThresholds,
    thresholds: ImportanceThresholds;
        };
interface CullingStats { totalParticles: number,
    culledByDistance: number,
    culledByFrustum: number,
    culledByOcclusion: number,
    culledByImportance: number,
    culledByAge: number,
    finalCount: number,
    cullingEfficiency: number,
    cullingTime: number,
    averageCullingTime: number,
    scoringTime: number,
    scoringTime: number;
        };
interface OcclusionSystem { enabled: boolean,
    occluders: Set<OccluderBounds>,
    occlusionMap: Map<string, boolean>;
    raycastGrid: Map<string, any>;
    gridSize: number,
    gridSize: number;
        };
interface OccluderBounds { x: number,
    y: number,
    width: number,
    height: number,
    height: number;
        };
interface CameraInfo { x: number,
    y: number,
    width: number,
    height: number,
    height: number;
        };
interface ParticleVelocity { x: number,
    y: number,
    y: number;
        };
interface CullableParticle { x: number,
    y: number;
    size?: number;
    birthTime?: number;
    opacity?: number;
    velocity?: ParticleVelocity;
    priority?: number;
    id?: string;
    type?: string;
    interface ParticleCullingSystemConfig { distanceCulling?: boolean,
    frustumCulling?: boolean;
    occlusionCulling?: boolean;
    importanceCulling?: boolean;
    ageCulling?: boolean;
    maxCullingDistance?: number;
    nearCullingDistance?: number;
    maxAge?: number;
    ageBasedCulling?: boolean;
    importanceEnabled?: boolean;
    export class ParticleCullingSystem {
    private cullingConfig: CullingConfig;
    private importanceScoring: ImportanceScoring;
    private stats: CullingStats;
    private, occlusionSystem: OcclusionSystem;
    constructor(config: ParticleCullingSystemConfig = {) {

        // Culling configuration
        this.cullingConfig = {
            distanceCulling: config.distanceCulling !== undefined ? config.distanceCulling : true,
    frustumCulling: config.frustumCulling !== undefined ? config.frustumCulling : true,
    occlusionCulling: config.occlusionCulling !== undefined ? config.occlusionCulling : false,
    importanceCulling: config.importanceCulling !== undefined ? config.importanceCulling : true,
    ageCulling: config.ageCulling !== undefined ? config.ageCulling : true;
            // Distance thresholds
            maxCullingDistance: config.maxCullingDistance || 1500,
    nearCullingDistance: config.nearCullingDistance || 50;
            // Age thresholds
            maxAge: config.maxAge || 10.0, // seconds
    };
            ageBasedCulling: config.ageBasedCulling || true 
    };
        // Importance scoring system
        this.importanceScoring = { enabled: config.importanceEnabled !== undefined ? config.importanceEnabled : true;
            
            // Scoring factors and weights
            factors: { distance: { weight: 0.25, inverted: true,
                size: { weight: 0.15, inverted: false,
                opacity: { weight: 0.15, inverted: false,
                velocity: { weight: 0.10, inverted: false,
                age: { weight: 0.10, inverted: true,
                screenArea: { weight: 0.20, inverted: false,
                effectPriority: { weight: 0.05, inverted: false,
                effectPriority: { weight: 0.05, inverted: false;
         },
            // Score cache
            scoreCache: new Map<string, number>();
            cacheValidFrames: 3,
            currentFrame: 0;
            // Score thresholds
            thresholds: { veryHigh: 0.8,
                high: 0.6  ,
                medium: 0.4,
                low: 0.2,
    veryLow: 0.1 
    };
        // Culling statistics
        this.stats = { totalParticles: 0,
            culledByDistance: 0,
            culledByFrustum: 0,
            culledByOcclusion: 0,
            culledByImportance: 0,
            culledByAge: 0,
            finalCount: 0,
            cullingEfficiency: 0;
            // Performance tracking
            cullingTime: 0,
            averageCullingTime: 0,
    scoringTime: 0  };
        // Occlusion system
        this.occlusionSystem = { enabled: this.cullingConfig.occlusionCulling,
            occluders: new Set<OccluderBounds>(),
            occlusionMap: new Map<string, boolean>();
            raycastGrid: new Map<string, any>();
            gridSize: 64  }
    
    /**
     * Perform comprehensive particle culling
     * @param particles - All particles to cull
     * @param camera - Camera/viewport information
     * @returns Visible particles after culling
     */
    performParticleCulling(particles: CullableParticle[], camera?: CameraInfo): CullableParticle[] { const cullingStart = performance.now();
        // Reset statistics
        this.stats.totalParticles = particles.length,
        this.stats.culledByDistance = 0,
        this.stats.culledByFrustum = 0,
        this.stats.culledByOcclusion = 0,
        this.stats.culledByImportance = 0,
        this.stats.culledByAge = 0,
        
        let visibleParticles = [...particles],
        
        // Distance culling
        if (this.cullingConfig.distanceCulling && camera) {
    
}
            visibleParticles = this.performDistanceCulling(visibleParticles, camera); }
        }
        
        // Frustum culling
        if (this.cullingConfig.frustumCulling && camera) { visibleParticles = this.performFrustumCulling(visibleParticles, camera);
        
        // Age-based culling
        if (this.cullingConfig.ageCulling) { visibleParticles = this.performAgeCulling(visibleParticles);
        
        // Occlusion culling
        if (this.cullingConfig.occlusionCulling && camera) { visibleParticles = this.performOcclusionCulling(visibleParticles, camera);
        
        // Importance-based culling (for, performance);
        if (this.cullingConfig.importanceCulling && camera) { visibleParticles = this.performImportanceCulling(visibleParticles, camera);
        
        // Update statistics
        this.stats.finalCount = visibleParticles.length;
        this.stats.cullingEfficiency = this.stats.totalParticles > 0 ? undefined : undefined
            (this.stats.totalParticles - this.stats.finalCount) / this.stats.totalParticles: 0;
        
        const cullingTime = performance.now() - cullingStart;
        this.stats.cullingTime = cullingTime;
        this.stats.averageCullingTime = (this.stats.averageCullingTime + cullingTime) / 2;
        
        // Increment frame counter for cache management
        this.importanceScoring.currentFrame++;
        
        return visibleParticles;
    }
    
    /**
     * Perform distance-based culling
     * @param particles - Particles to cull
     * @param camera - Camera information
     * @returns Particles within distance range
     */
    private performDistanceCulling(particles: CullableParticle[], camera: CameraInfo): CullableParticle[] { const maxDistance = this.cullingConfig.maxCullingDistance;
        const nearDistance = this.cullingConfig.nearCullingDistance,
        
        return particles.filter(particle => { )
            const dx = particle.x - camera.x)
            const dy = particle.y - camera.y),
            const distance = Math.sqrt(dx * dx + dy * dy);
            const isVisible = distance >= nearDistance && distance <= maxDistance,
            if (!isVisible) { }
                this.stats.culledByDistance++; }
            }
            
            return isVisible;
        }
    }
    
    /**
     * Perform frustum culling
     * @param particles - Particles to cull
     * @param camera - Camera information
     * @returns Particles within view frustum
     */
    private performFrustumCulling(particles: CullableParticle[], camera: CameraInfo): CullableParticle[] { const margin = 50, // Extra margin for particles partially visible
        const left = camera.x - camera.width / 2 - margin,
        const right = camera.x + camera.width / 2 + margin,
        const top = camera.y - camera.height / 2 - margin,
        const bottom = camera.y + camera.height / 2 + margin,
        
        return particles.filter(particle => { 
            const, size = particle.size || 10,
            const, isVisible = particle.x + size >= left && ,
                             particle.x - size <= right && );
                             particle.y + size >= top && ),
                             particle.y - size <= bottom),
            if (!isVisible) { }
                this.stats.culledByFrustum++; }
            }
            
            return isVisible;
        }
    }
    
    /**
     * Perform age-based culling
     * @param particles - Particles to cull
     * @returns Particles within age limits
     */
    private performAgeCulling(particles: CullableParticle[]): CullableParticle[] { const maxAge = this.cullingConfig.maxAge;
        const currentTime = Date.now() / 1000,
        
        return particles.filter(particle => { );
            const age = currentTime - (particle.birthTime || 0),
            const isAlive = age <= maxAge,
            
            if (!isAlive) { }
                this.stats.culledByAge++; }
            }
            
            return isAlive;
        }
    }
    
    /**
     * Perform occlusion culling
     * @param particles - Particles to cull
     * @param camera - Camera information
     * @returns Non-occluded particles
     */
    private performOcclusionCulling(particles: CullableParticle[], camera: CameraInfo): CullableParticle[] { if (!this.occlusionSystem.enabled || this.occlusionSystem.occluders.size === 0) {
            return particles }
        
        return particles.filter(particle => {  );
            const isOccluded = this.checkParticleOcclusion(particle, camera);
            if (isOccluded) { }
                this.stats.culledByOcclusion++; }
            }
            return !isOccluded;
        }
    }
    
    /**
     * Perform importance-based culling
     * @param particles - Particles to cull
     * @param camera - Camera information
     * @returns Important particles
     */
    private performImportanceCulling(particles: CullableParticle[], camera: CameraInfo): CullableParticle[] { if (!this.importanceScoring.enabled) {
            return particles }
        
        // Calculate importance scores
        const scoredParticles = particles.map(particle => ({ )
            particle,
            score: this.calculateImportanceScore(particle, camera };
        
        // Sort by importance score (highest, first);
        scoredParticles.sort((a, b) => b.score - a.score);
        
        // Keep top percentage based on performance needs
        const keepPercentage = this.calculateKeepPercentage();
        const keepCount = Math.floor(scoredParticles.length * keepPercentage);
        
        const culledCount = scoredParticles.length - keepCount;
        this.stats.culledByImportance += culledCount;
        
        return scoredParticles.slice(0, keepCount).map(item => item.particle);
    }
    
    /**
     * Calculate importance score for a particle
     * @param particle - Particle to score
     * @param camera - Camera information
     * @returns Importance score (0-1)
     */
    private calculateImportanceScore(particle: CullableParticle, camera: CameraInfo): number {
        const particleId = particle.id || `${particle.x}_${particle.y}_${particle.type}`;
        const cacheKey = `${particleId}_${this.importanceScoring.currentFrame}`;
        
        // Check cache first
        if (this.importanceScoring.scoreCache.has(cacheKey) { return this.importanceScoring.scoreCache.get(cacheKey)! }
        
        let totalScore = 0;
        const factors = this.importanceScoring.factors;
        
        // Distance factor
        if (camera) {
            const dx = particle.x - camera.x,
            const dy = particle.y - camera.y,
            const distance = Math.sqrt(dx * dx + dy * dy);
            const normalizedDistance = Math.min(1, distance / this.cullingConfig.maxCullingDistance);
            const distanceScore = factors.distance.inverted ? undefined : undefined
                (1 - normalizedDistance) : normalizedDistance;
            totalScore += distanceScore * factors.distance.weight; }
        }
        
        // Size factor
        const size = particle.size || 10;
        const normalizedSize = Math.min(1, size / 50); // Assume max size of 50
        const sizeScore = factors.size.inverted ? (1 - normalizedSize) : normalizedSize;
        totalScore += sizeScore * factors.size.weight;
        
        // Opacity factor
        const opacity = particle.opacity !== undefined ? particle.opacity: 1;
        const opacityScore = factors.opacity.inverted ? (1 - opacity) : opacity;
        totalScore += opacityScore * factors.opacity.weight;
        
        // Velocity factor
        const velocity = particle.velocity ? undefined : undefined
            Math.sqrt(particle.velocity.x * particle.velocity.x + particle.velocity.y * particle.velocity.y) : 0;
        const normalizedVelocity = Math.min(1, velocity / 300); // Assume max velocity of 300
        const velocityScore = factors.velocity.inverted ? (1 - normalizedVelocity) : normalizedVelocity;
        totalScore += velocityScore * factors.velocity.weight;
        
        // Age factor
        const currentTime = Date.now() / 1000;
        const age = currentTime - (particle.birthTime || currentTime);
        const normalizedAge = Math.min(1, age / this.cullingConfig.maxAge);
        const ageScore = factors.age.inverted ? (1 - normalizedAge) : normalizedAge;
        totalScore += ageScore * factors.age.weight;
        
        // Screen area factor (simplified);
        const screenArea = camera ? Math.min(1, (size * size) / (camera.width * camera.height * 0.01)) : 0.5;
        const screenAreaScore = factors.screenArea.inverted ? (1 - screenArea) : screenArea;
        totalScore += screenAreaScore * factors.screenArea.weight;
        
        // Effect priority factor
        const effectPriority = particle.priority || 0.5;
        const effectPriorityScore = factors.effectPriority.inverted ? (1 - effectPriority) : effectPriority;
        totalScore += effectPriorityScore * factors.effectPriority.weight;
        
        // Clamp final score
        const finalScore = Math.max(0, Math.min(1, totalScore);
        
        // Cache the score
        this.importanceScoring.scoreCache.set(cacheKey, finalScore);
        
        // Clean old cache entries
        this.cleanScoreCache();
        
        return finalScore;
    }
    
    /**
     * Check if particle is occluded
     * @param particle - Particle to check
     * @param camera - Camera information
     * @returns True if occluded
     */
    private checkParticleOcclusion(particle: CullableParticle, camera: CameraInfo): boolean { // Simplified occlusion check
        for (const occluder of this.occlusionSystem.occluders) {
            if (this.isPointInBounds(particle.x, particle.y, occluder) {
        }
                return true;
        return false;
    }
    
    /**
     * Check if point is within bounds
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param bounds - Bounds object
     * @returns True if within bounds
     */
    private isPointInBounds(x: number, y: number, bounds: OccluderBounds): boolean { return x >= bounds.x && 
               x <= bounds.x + bounds.width && ,
               y >= bounds.y && ,
               y <= bounds.y + bounds.height }
    
    /**
     * Calculate what percentage of particles to keep based on performance
     * @returns Keep percentage (0-1)
     */
    private calculateKeepPercentage(): number { // This would ideally be connected to a performance monitor
        // For now, return a conservative value
        return 0.8 }
    
    /**
     * Clean old score cache entries
     */
    private cleanScoreCache(): void { if (this.importanceScoring.scoreCache.size > 1000) {
            const cutoffFrame = this.importanceScoring.currentFrame - this.importanceScoring.cacheValidFrames,
            
            for(const [key, _] of this.importanceScoring.scoreCache) {
            
                const frameNumber = parseInt(key.split('_'.pop() || '0'),
                if (frameNumber < cutoffFrame) {
    
}
                    this.importanceScoring.scoreCache.delete(key);     }
}
    }
    
    /**
     * Add occlusion occluder
     * @param occluder - Occluder bounds
     */
    addOccluder(occluder: OccluderBounds): void { this.occlusionSystem.occluders.add(occluder);
    
    /**
     * Remove occlusion occluder
     * @param occluder - Occluder bounds
     */
    removeOccluder(occluder: OccluderBounds): void { this.occlusionSystem.occluders.delete(occluder);
    
    /**
     * Get culling statistics
     * @returns Statistics
     */
    getStats(): CullingStats {
        return { ...this.stats }
    
    /**
     * Reset statistics'
     */''
    resetStats();