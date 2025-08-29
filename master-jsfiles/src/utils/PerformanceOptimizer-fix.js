/**
 * PerformanceOptimizer _initializeFromConfig method fix
 * Apply null safety to prevent targetFPS undefined errors
 */

_initializeFromConfig() {
    try {
        const optimizationConfig = this.performanceConfig.getOptimizationConfig();
        const qualityConfig = this.performanceConfig.getQualityConfig();
        
        // Add null safety for optimizationConfig
        if (!optimizationConfig || typeof optimizationConfig !== 'object') {
            console.warn("[PerformanceOptimizer] Invalid optimization config, using fallback values");
            this._useDefaultConfig();
            return;
        }
        
        if (!qualityConfig || typeof qualityConfig !== 'object') {
            console.warn("[PerformanceOptimizer] Invalid quality config, using fallback values");
            this._useDefaultConfig();
            return;
        }
        
        // Safe property access with fallback values
        this.targetFPS = optimizationConfig.targetFPS || 60;
        this.targetFrameTime = 1000 / this.targetFPS;
        this.maxHistorySize = optimizationConfig.maxHistorySize || 30;
        this.performanceLevel = optimizationConfig.performanceLevel || "high";
        this.adaptiveMode = optimizationConfig.adaptiveMode !== undefined ? optimizationConfig.adaptiveMode : true;
        this.optimizationInterval = optimizationConfig.optimizationInterval || 1000;
        
        this.settings = {
            maxBubbles: optimizationConfig.maxBubbles || 20,
            maxParticles: optimizationConfig.maxParticles || 500,
            renderQuality: qualityConfig.renderQuality || 1.0,
            particleQuality: qualityConfig.particleQuality || 1.0,
            effectQuality: qualityConfig.effectQuality || 1.0,
            audioQuality: qualityConfig.audioQuality || 1.0,
            workloadDistribution: optimizationConfig.workloadDistribution !== undefined ? optimizationConfig.workloadDistribution : true,
            maxTimePerFrame: optimizationConfig.maxTimePerFrame || 8
        };
        
        console.log("[PerformanceOptimizer] Configuration loaded successfully:", {
            targetFPS: this.targetFPS,
            performanceLevel: this.performanceLevel
        });
        
    } catch (error) {
        console.error("[PerformanceOptimizer] Error initializing from config:", error);
        this._useDefaultConfig();
    }
}

/**
 * Use default configuration when config loading fails
 * @private  
 */
_useDefaultConfig() {
    console.warn("[PerformanceOptimizer] Using default configuration due to initialization error");
    
    this.targetFPS = 60;
    this.targetFrameTime = 1000 / 60;
    this.maxHistorySize = 30;
    this.performanceLevel = "high";
    this.adaptiveMode = true;
    this.optimizationInterval = 1000;
    
    this.settings = {
        maxBubbles: 20,
        maxParticles: 500,
        renderQuality: 1.0,
        particleQuality: 1.0,
        effectQuality: 1.0,
        audioQuality: 1.0,
        workloadDistribution: true,
        maxTimePerFrame: 8
    };
}