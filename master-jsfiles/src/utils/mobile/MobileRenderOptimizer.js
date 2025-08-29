/**
 * MobileRenderOptimizer.js
 * モバイルレンダリング最適化システム
 * MobilePerformanceOptimizerから分離されたレンダリング最適化機能
 */

import { getErrorHandler } from '../ErrorHandler.js';
import { getConfigurationManager } from '../../core/ConfigurationManager.js';

export class MobileRenderOptimizer {
    constructor() {
        this.errorHandler = getErrorHandler();
        this.configManager = getConfigurationManager();
        
        // Rendering optimization configuration
        this.renderConfig = {
            enabled: true,
            
            // Quality settings
            quality: {
                currentLevel: 'auto', // 'low', 'medium', 'high', 'ultra', 'auto'
                autoAdjustment: true,
                dynamicQuality: true,
                qualityLevels: {
                    low: {
                        resolution: 0.5,
                        textureQuality: 0.3,
                        effectsQuality: 0.2,
                        shadersSimplified: true,
                        cullingAggressive: true
                    },
                    medium: {
                        resolution: 0.75,
                        textureQuality: 0.6,
                        effectsQuality: 0.5,
                        shadersSimplified: false,
                        cullingAggressive: true
                    },
                    high: {
                        resolution: 1.0,
                        textureQuality: 0.8,
                        effectsQuality: 0.8,
                        shadersSimplified: false,
                        cullingAggressive: false
                    },
                    ultra: {
                        resolution: 1.0,
                        textureQuality: 1.0,
                        effectsQuality: 1.0,
                        shadersSimplified: false,
                        cullingAggressive: false
                    }
                }
            },
            
            // Rendering optimizations
            optimizations: {
                reducedResolution: false,
                simplifiedShaders: false,
                cullAggressive: true,
                lodBias: 1.0, // Level of detail bias for mobile
                drawCallReduction: true,
                textureCompression: true,
                mipmapOptimization: true,
                frustumCulling: true,
                occlusionCulling: false,
                batchingEnabled: true,
                instancingEnabled: true
            },
            
            // Frame rate control
            frameRate: {
                target: 60,
                adaptive: true,
                vsyncEnabled: true,
                frameSkipping: false,
                dynamicFrameRate: true,
                throttleOnBattery: true
            },
            
            // Viewport and scaling
            viewport: {
                autoResize: true,
                pixelRatio: 1.0,
                adaptivePixelRatio: true,
                maxPixelRatio: 2.0,
                minPixelRatio: 0.5
            }
        };
        
        // Render performance monitoring
        this.renderMonitoring = {
            enabled: true,
            
            // Frame statistics
            frameStats: {
                fps: 60,
                frameTime: 16.67,
                averageFrameTime: 16.67,
                frameVariance: 0,
                droppedFrames: 0,
                totalFrames: 0
            },
            
            // Render statistics
            renderStats: {
                drawCalls: 0,
                triangles: 0,
                vertices: 0,
                textureBinds: 0,
                shaderChanges: 0,
                bufferUpdates: 0
            },
            
            // Performance thresholds
            thresholds: {
                targetFrameTime: 16.67, // 60 FPS
                maxFrameTime: 33.33,    // 30 FPS minimum
                criticalFrameTime: 50,   // 20 FPS critical
                maxDroppedFrames: 5      // Per second
            },
            
            // Quality adjustment history
            qualityHistory: {
                adjustments: [],
                lastAdjustment: 0,
                adjustmentCooldown: 2000 // 2 seconds
            }
        };
        
        // Initialize render optimizer
        this.initializeRenderOptimizer();
    }
    
    /**
     * Initialize render optimization system
     */
    initializeRenderOptimizer() {
        console.log('[MobileRenderOptimizer] Initializing render optimization...');
        
        try {
            this.setupRenderMonitoring();
            this.applyInitialOptimizations();
            this.startFrameMonitoring();
            
            console.log('[MobileRenderOptimizer] Render optimization initialized successfully');
        } catch (error) {
            this.errorHandler.handleError(error, 'MobileRenderOptimizer.initializeRenderOptimizer');
        }
    }
    
    /**
     * Setup render performance monitoring
     */
    setupRenderMonitoring() {
        // Initialize frame time tracking
        this.lastFrameTime = performance.now();
        this.frameTimeBuffer = [];
        this.frameTimeBufferSize = 60; // Track last 60 frames
        
        console.log('[MobileRenderOptimizer] Render monitoring setup complete');
    }
    
    /**
     * Apply initial rendering optimizations
     */
    applyInitialOptimizations() {
        const quality = this.detectOptimalQuality();
        this.setQualityLevel(quality);
        
        // Apply device-specific optimizations
        this.applyDeviceSpecificOptimizations();
        
        console.log(`[MobileRenderOptimizer] Initial optimizations applied - Quality: ${quality}`);
    }
    
    /**
     * Detect optimal quality level based on device capabilities
     */
    detectOptimalQuality() {
        // This would typically use device detection results
        // For now, we'll use a simple heuristic
        
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            return 'low';
        }
        
        // Check GPU capabilities
        const renderer = gl.getParameter(gl.RENDERER);
        const vendor = gl.getParameter(gl.VENDOR);
        
        // Simple device classification (would be more sophisticated in practice)
        if (renderer.includes('Mali') || renderer.includes('Adreno')) {
            // Mobile GPUs
            return 'medium';
        } else if (renderer.includes('Intel')) {
            return 'medium';
        } else {
            return 'high';
        }
    }
    
    /**
     * Set rendering quality level
     */
    setQualityLevel(level) {
        if (!this.renderConfig.quality.qualityLevels[level]) {
            console.warn(`[MobileRenderOptimizer] Invalid quality level: ${level}`);
            return;
        }
        
        const qualitySettings = this.renderConfig.quality.qualityLevels[level];
        this.renderConfig.quality.currentLevel = level;
        
        // Apply quality settings
        this.applyQualitySettings(qualitySettings);
        
        // Log quality change
        this.renderMonitoring.qualityHistory.adjustments.push({
            timestamp: Date.now(),
            level: level,
            reason: 'manual'
        });
        
        console.log(`[MobileRenderOptimizer] Quality level set to: ${level}`);
    }
    
    /**
     * Apply quality settings to renderer
     */
    applyQualitySettings(settings) {
        const opts = this.renderConfig.optimizations;
        
        // Update optimization settings based on quality
        opts.reducedResolution = settings.resolution < 1.0;
        opts.simplifiedShaders = settings.shadersSimplified;
        opts.cullAggressive = settings.cullingAggressive;
        opts.textureCompression = settings.textureQuality < 0.8;
        
        // Apply viewport settings
        if (settings.resolution !== 1.0) {
            this.setRenderResolution(settings.resolution);
        }
        
        // Update LOD bias
        opts.lodBias = 2.0 - settings.textureQuality;
        
        console.log(`[MobileRenderOptimizer] Quality settings applied - Resolution: ${settings.resolution}, Texture Quality: ${settings.textureQuality}`);
    }
    
    /**
     * Set render resolution
     */
    setRenderResolution(scale) {
        this.renderConfig.viewport.pixelRatio = Math.max(
            this.renderConfig.viewport.minPixelRatio,
            Math.min(this.renderConfig.viewport.maxPixelRatio, scale)
        );
        
        console.log(`[MobileRenderOptimizer] Render resolution set to: ${scale}`);
    }
    
    /**
     * Apply device-specific optimizations
     */
    applyDeviceSpecificOptimizations() {
        const userAgent = navigator.userAgent.toLowerCase();
        
        if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
            this.applyIOSOptimizations();
        } else if (userAgent.includes('android')) {
            this.applyAndroidOptimizations();
        } else {
            this.applyWebOptimizations();
        }
    }
    
    /**
     * Apply iOS-specific optimizations
     */
    applyIOSOptimizations() {
        const opts = this.renderConfig.optimizations;
        
        // iOS devices benefit from specific optimizations
        opts.mipmapOptimization = true;
        opts.textureCompression = true;
        opts.batchingEnabled = true;
        
        console.log('[MobileRenderOptimizer] iOS optimizations applied');
    }
    
    /**
     * Apply Android-specific optimizations
     */
    applyAndroidOptimizations() {
        const opts = this.renderConfig.optimizations;
        
        // Android devices have varied capabilities
        opts.cullAggressive = true;
        opts.drawCallReduction = true;
        opts.instancingEnabled = false; // Some Android devices have issues
        
        console.log('[MobileRenderOptimizer] Android optimizations applied');
    }
    
    /**
     * Apply web-specific optimizations
     */
    applyWebOptimizations() {
        const opts = this.renderConfig.optimizations;
        
        // Web browsers have good WebGL support
        opts.instancingEnabled = true;
        opts.occlusionCulling = false; // Usually not worth it on web
        
        console.log('[MobileRenderOptimizer] Web optimizations applied');
    }
    
    /**
     * Start frame performance monitoring
     */
    startFrameMonitoring() {
        if (!this.renderMonitoring.enabled) return;
        
        // Monitor frame performance
        setInterval(() => {
            this.updateFrameStatistics();
            this.checkPerformanceThresholds();
            this.adjustQualityIfNeeded();
        }, 1000); // Check every second
        
        console.log('[MobileRenderOptimizer] Frame monitoring started');
    }
    
    /**
     * Update frame on each render
     */
    updateFrame() {
        const currentTime = performance.now();
        const frameTime = currentTime - this.lastFrameTime;
        
        // Update frame statistics
        this.updateFrameTime(frameTime);
        
        // Update render statistics (would be called by actual renderer)
        this.updateRenderStatistics();
        
        this.lastFrameTime = currentTime;
        this.renderMonitoring.frameStats.totalFrames++;
    }
    
    /**
     * Update frame time statistics
     */
    updateFrameTime(frameTime) {
        const stats = this.renderMonitoring.frameStats;
        
        // Add to buffer
        this.frameTimeBuffer.push(frameTime);
        if (this.frameTimeBuffer.length > this.frameTimeBufferSize) {
            this.frameTimeBuffer.shift();
        }
        
        // Calculate statistics
        stats.frameTime = frameTime;
        stats.fps = 1000 / frameTime;
        
        // Calculate average frame time
        const sum = this.frameTimeBuffer.reduce((a, b) => a + b, 0);
        stats.averageFrameTime = sum / this.frameTimeBuffer.length;
        
        // Calculate variance
        const avgFrameTime = stats.averageFrameTime;
        const variance = this.frameTimeBuffer.reduce((acc, time) => {
            return acc + Math.pow(time - avgFrameTime, 2);
        }, 0) / this.frameTimeBuffer.length;
        stats.frameVariance = Math.sqrt(variance);
        
        // Check for dropped frames
        if (frameTime > this.renderMonitoring.thresholds.maxFrameTime) {
            stats.droppedFrames++;
        }
    }
    
    /**
     * Update frame statistics
     */
    updateFrameStatistics() {
        const stats = this.renderMonitoring.frameStats;
        
        // Reset dropped frames counter every second
        stats.droppedFrames = 0;
    }
    
    /**
     * Update render statistics (mock implementation)
     */
    updateRenderStatistics() {
        // This would be updated by the actual rendering system
        const stats = this.renderMonitoring.renderStats;
        
        // Mock values for now
        stats.drawCalls = Math.floor(Math.random() * 100) + 50;
        stats.triangles = Math.floor(Math.random() * 10000) + 5000;
        stats.vertices = stats.triangles * 3;
        stats.textureBinds = Math.floor(Math.random() * 20) + 10;
        stats.shaderChanges = Math.floor(Math.random() * 10) + 5;
        stats.bufferUpdates = Math.floor(Math.random() * 30) + 15;
    }
    
    /**
     * Check performance thresholds and respond
     */
    checkPerformanceThresholds() {
        const stats = this.renderMonitoring.frameStats;
        const thresholds = this.renderMonitoring.thresholds;
        
        // Check for performance issues
        const isPerformancePoor = stats.averageFrameTime > thresholds.maxFrameTime ||
                                 stats.droppedFrames > thresholds.maxDroppedFrames;
        
        if (isPerformancePoor) {
            console.warn('[MobileRenderOptimizer] Performance threshold exceeded');
            this.handlePerformanceIssue();
        }
    }
    
    /**
     * Handle performance issues
     */
    handlePerformanceIssue() {
        const currentQuality = this.renderConfig.quality.currentLevel;
        const qualityLevels = ['ultra', 'high', 'medium', 'low'];
        const currentIndex = qualityLevels.indexOf(currentQuality);
        
        // Reduce quality if possible
        if (currentIndex < qualityLevels.length - 1) {
            const newQuality = qualityLevels[currentIndex + 1];
            console.log(`[MobileRenderOptimizer] Reducing quality from ${currentQuality} to ${newQuality}`);
            this.setQualityLevel(newQuality);
            
            // Record adjustment
            this.renderMonitoring.qualityHistory.adjustments.push({
                timestamp: Date.now(),
                level: newQuality,
                reason: 'performance'
            });
        }
    }
    
    /**
     * Adjust quality based on performance if auto-adjustment is enabled
     */
    adjustQualityIfNeeded() {
        if (!this.renderConfig.quality.autoAdjustment) return;
        
        const now = Date.now();
        const lastAdjustment = this.renderMonitoring.qualityHistory.lastAdjustment;
        
        // Respect cooldown period
        if (now - lastAdjustment < this.renderMonitoring.qualityHistory.adjustmentCooldown) {
            return;
        }
        
        const stats = this.renderMonitoring.frameStats;
        const targetFrameTime = this.renderMonitoring.thresholds.targetFrameTime;
        
        // Check if we can increase quality
        if (stats.averageFrameTime < targetFrameTime * 0.8) {
            this.considerQualityIncrease();
        }
        // Check if we need to decrease quality
        else if (stats.averageFrameTime > targetFrameTime * 1.3) {
            this.considerQualityDecrease();
        }
    }
    
    /**
     * Consider increasing quality
     */
    considerQualityIncrease() {
        const currentQuality = this.renderConfig.quality.currentLevel;
        const qualityLevels = ['low', 'medium', 'high', 'ultra'];
        const currentIndex = qualityLevels.indexOf(currentQuality);
        
        if (currentIndex > 0) {
            const newQuality = qualityLevels[currentIndex - 1];
            console.log(`[MobileRenderOptimizer] Increasing quality from ${currentQuality} to ${newQuality}`);
            this.setQualityLevel(newQuality);
            this.renderMonitoring.qualityHistory.lastAdjustment = Date.now();
        }
    }
    
    /**
     * Consider decreasing quality
     */
    considerQualityDecrease() {
        const currentQuality = this.renderConfig.quality.currentLevel;
        const qualityLevels = ['low', 'medium', 'high', 'ultra'];
        const currentIndex = qualityLevels.indexOf(currentQuality);
        
        if (currentIndex < qualityLevels.length - 1) {
            const newQuality = qualityLevels[currentIndex + 1];
            console.log(`[MobileRenderOptimizer] Decreasing quality from ${currentQuality} to ${newQuality}`);
            this.setQualityLevel(newQuality);
            this.renderMonitoring.qualityHistory.lastAdjustment = Date.now();
        }
    }
    
    /**
     * Get render optimization statistics
     */
    getRenderStatistics() {
        return {
            frameStats: this.renderMonitoring.frameStats,
            renderStats: this.renderMonitoring.renderStats,
            qualityLevel: this.renderConfig.quality.currentLevel,
            optimizations: this.renderConfig.optimizations,
            viewport: this.renderConfig.viewport,
            qualityHistory: this.renderMonitoring.qualityHistory.adjustments.slice(-10) // Last 10 adjustments
        };
    }
    
    /**
     * Set target frame rate
     */
    setTargetFrameRate(fps) {
        this.renderConfig.frameRate.target = fps;
        this.renderMonitoring.thresholds.targetFrameTime = 1000 / fps;
        
        console.log(`[MobileRenderOptimizer] Target frame rate set to: ${fps} FPS`);
    }
    
    /**
     * Enable or disable specific optimizations
     */
    setOptimization(name, enabled) {
        if (this.renderConfig.optimizations.hasOwnProperty(name)) {
            this.renderConfig.optimizations[name] = enabled;
            console.log(`[MobileRenderOptimizer] ${name} optimization ${enabled ? 'enabled' : 'disabled'}`);
        }
    }
    
    /**
     * Get current optimization settings
     */
    getOptimizationSettings() {
        return {
            quality: this.renderConfig.quality,
            optimizations: this.renderConfig.optimizations,
            frameRate: this.renderConfig.frameRate,
            viewport: this.renderConfig.viewport
        };
    }
    
    /**
     * Dispose render optimizer
     */
    dispose() {
        try {
            // Clear frame time buffer
            this.frameTimeBuffer = [];
            
            console.log('[MobileRenderOptimizer] Render optimizer disposed');
        } catch (error) {
            this.errorHandler.handleError(error, 'MobileRenderOptimizer.dispose');
        }
    }
}