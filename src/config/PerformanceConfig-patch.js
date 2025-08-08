// Emergency patch for PerformanceConfig getOptimizationConfig
// This patches the targetFPS undefined error
const originalPerformanceConfig = window.PerformanceConfig;

if (originalPerformanceConfig) {
    const originalGetOptimizationConfig = originalPerformanceConfig.prototype.getOptimizationConfig;
    
    originalPerformanceConfig.prototype.getOptimizationConfig = function() {
        try {
            // Check if configManager is properly initialized
            if (!this.configManager) {
                console.warn('[PerformanceConfig] ConfigurationManager not initialized, using fallback');
                return {
                    targetFPS: 60,
                    adaptiveMode: true,
                    optimizationInterval: 1000,
                    maxHistorySize: 30,
                    performanceLevel: 'high',
                    maxBubbles: 20,
                    maxParticles: 500,
                    workloadDistribution: true,
                    maxTimePerFrame: 8
                };
            }
            
            // Try original method first
            return originalGetOptimizationConfig.call(this);
        } catch (error) {
            console.error('[PerformanceConfig] Error in getOptimizationConfig, using fallback:', error);
            return {
                targetFPS: 60,
                adaptiveMode: true,
                optimizationInterval: 1000,
                maxHistorySize: 30,
                performanceLevel: 'high',
                maxBubbles: 20,
                maxParticles: 500,
                workloadDistribution: true,
                maxTimePerFrame: 8
            };
        }
    };
}