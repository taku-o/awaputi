import { getErrorHandler } from './ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';
import { DirtyRegionManager } from './advanced-rendering-optimizer/DirtyRegionManager.js';
import { ViewportCuller } from './advanced-rendering-optimizer/ViewportCuller.js';
import { LayerManager } from './advanced-rendering-optimizer/LayerManager.js';

/**
 * Advanced Rendering Optimization System (Refactored)
 * 高度レンダリング最適化システム - メインコントローラー
 * 
 * サブコンポーネント化により責任を分離し、保守性を向上
 * - DirtyRegionManager: ダーティリージョン管理
 * - ViewportCuller: ビューポートカリング
 * - LayerManager: レイヤー管理とキャッシング
 */
export class AdvancedRenderingOptimizer {
    constructor(canvas, context) {
        this.errorHandler = getErrorHandler();
        this.configManager = getConfigurationManager();
        
        this.canvas = canvas;
        this.ctx = context;
        
        // Main configuration
        this.renderingConfig = {
            enabled: true,
            dirtyRegionEnabled: true,
            viewportCullingEnabled: true,
            layerCachingEnabled: true,
            
            // Performance targets
            targetFPS: 60,
            maxRenderTime: 16.67, // ms per frame
            performanceThreshold: 0.85,
            
            // Optimization levels
            optimizationLevel: 'balanced', // 'conservative', 'balanced', 'aggressive'
            adaptiveOptimization: true,
            
            // Debug options
            debugMode: false,
            showDirtyRegions: false,
            showCulledObjects: false,
            showLayerComposition: false
        };
        
        // Initialize sub-components
        this._initializeSubComponents();
        
        // Performance monitoring
        this.performanceMonitor = {
            enabled: true,
            frameMetrics: [],
            maxHistory: 120, // 2 seconds at 60fps
            currentFrame: 0,
            
            // Performance statistics
            stats: {
                averageFPS: 60,
                averageRenderTime: 16.67,
                droppedFrames: 0,
                optimizationCount: 0,
                effectivenessScore: 1.0
            }
        };
        
        console.log('[AdvancedRenderingOptimizer] Initialized with sub-components');
    }
    
    /**
     * Initialize sub-component systems
     * @private
     */
    _initializeSubComponents() {
        try {
            // Initialize dirty region manager
            this.dirtyRegionManager = new DirtyRegionManager({
                enabled: this.renderingConfig.dirtyRegionEnabled,
                minRegionSize: 32,
                maxRegionCount: 8,
                mergeThreshold: 0.3,
                expansionFactor: 1.1
            });
            
            // Initialize viewport culler
            this.viewportCuller = new ViewportCuller({
                enabled: this.renderingConfig.viewportCullingEnabled,
                cullingMargin: 50,
                gridSize: 128
            });
            
            // Initialize layer manager
            this.layerManager = new LayerManager(this.canvas, {
                cachingEnabled: this.renderingConfig.layerCachingEnabled,
                maxLayers: 16,
                cacheThreshold: 100,
                enableBlending: true
            });
            
            // Set initial viewport
            this.updateViewport(0, 0, this.canvas.width, this.canvas.height);
            
            // Create default layers
            this._createDefaultLayers();
            
        } catch (error) {
            this.errorHandler.logError('Failed to initialize sub-components', error);
        }
    }
    
    /**
     * Create default rendering layers
     * @private
     */
    _createDefaultLayers() {
        this.layerManager.createLayer('background', 0, { static: true, cacheable: true });
        this.layerManager.createLayer('game', 1, { static: false, cacheable: false });
        this.layerManager.createLayer('ui', 2, { static: true, cacheable: true });
        this.layerManager.createLayer('overlay', 3, { static: false, cacheable: false });
    }
    
    /**
     * Update viewport dimensions and position
     * @param {number} x - Viewport X position
     * @param {number} y - Viewport Y position
     * @param {number} width - Viewport width
     * @param {number} height - Viewport height
     */
    updateViewport(x, y, width, height) {
        this.viewportCuller.setViewport(x, y, width, height);
    }
    
    /**
     * Add object to optimization system
     * @param {string} id - Object ID
     * @param {object} bounds - Object bounds
     * @param {string} layer - Layer name
     * @param {object} metadata - Additional metadata
     */
    addRenderableObject(id, bounds, layer = 'game', metadata = {}) {
        // Add to viewport culler
        this.viewportCuller.addObject(id, bounds, metadata);
        
        // Add to layer
        this.layerManager.addObjectToLayer(layer, id, bounds);
    }
    
    /**
     * Remove object from optimization system
     * @param {string} id - Object ID
     */
    removeRenderableObject(id) {
        this.viewportCuller.removeObject(id);
        
        // Remove from all layers (brute force approach for simplicity)
        for (const layer of this.layerManager.layers.values()) {
            layer.objects.delete(id);
        }
    }
    
    /**
     * Update object bounds
     * @param {string} id - Object ID
     * @param {object} newBounds - New bounds
     */
    updateObjectBounds(id, newBounds) {
        this.viewportCuller.updateObject(id, newBounds);
    }
    
    /**
     * Mark region as dirty for re-rendering
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} width - Width
     * @param {number} height - Height
     */
    markDirtyRegion(x, y, width, height) {
        this.dirtyRegionManager.addDirtyRegion(x, y, width, height);
    }
    
    /**
     * Mark layer as dirty
     * @param {string} layerName - Layer name
     */
    markLayerDirty(layerName) {
        this.layerManager.markLayerDirty(layerName);
    }
    
    /**
     * Start frame rendering process
     * @returns {object} Rendering context information
     */
    startFrame() {
        const frameStart = performance.now();
        
        // Perform viewport culling
        const visibleObjects = this.viewportCuller.cullObjects();
        
        // Merge dirty regions
        const dirtyRegions = this.dirtyRegionManager.mergeRegions();
        
        // Prepare frame context
        const frameContext = {
            visibleObjects,
            dirtyRegions,
            timestamp: frameStart,
            frameNumber: this.performanceMonitor.currentFrame++
        };
        
        return frameContext;
    }
    
    /**
     * Render optimized frame
     * @param {object} frameContext - Frame context from startFrame
     * @param {function} renderCallback - Custom render function
     */
    renderFrame(frameContext, renderCallback) {
        const renderStart = performance.now();
        
        try {
            if (this.renderingConfig.enabled) {
                // Render with optimizations
                this._renderOptimized(frameContext, renderCallback);
            } else {
                // Fallback to direct rendering
                this._renderDirect(renderCallback);
            }
            
            // Track performance
            this._trackFramePerformance(renderStart, frameContext);
            
        } catch (error) {
            this.errorHandler.logError('Failed to render optimized frame', error);
            // Fallback to direct rendering
            this._renderDirect(renderCallback);
        }
    }
    
    /**
     * Complete frame rendering
     */
    endFrame() {
        // Clear dirty regions for next frame
        this.dirtyRegionManager.clearRegions();
        
        // Update adaptive optimization if enabled
        if (this.renderingConfig.adaptiveOptimization) {
            this._updateAdaptiveOptimization();
        }
    }
    
    /**
     * Get comprehensive performance statistics
     * @returns {object} Performance statistics
     */
    getPerformanceStats() {
        return {
            overall: { ...this.performanceMonitor.stats },
            dirtyRegions: this.dirtyRegionManager.getStats(),
            culling: this.viewportCuller.getStats(),
            layers: this.layerManager.getStats(),
            config: { ...this.renderingConfig }
        };
    }
    
    /**
     * Enable or disable debug visualization
     * @param {boolean} enabled - Debug state
     * @param {object} options - Debug options
     */
    setDebugMode(enabled, options = {}) {
        this.renderingConfig.debugMode = enabled;
        this.renderingConfig.showDirtyRegions = options.showDirtyRegions || false;
        this.renderingConfig.showCulledObjects = options.showCulledObjects || false;
        this.renderingConfig.showLayerComposition = options.showLayerComposition || false;
    }
    
    // Private methods
    
    /**
     * Render with all optimizations enabled
     * @private
     */
    _renderOptimized(frameContext, renderCallback) {
        // Use layer-based rendering
        this.layerManager.renderLayers(this.ctx, {
            visibleObjects: frameContext.visibleObjects,
            dirtyRegions: frameContext.dirtyRegions
        });
        
        // Apply custom rendering if provided
        if (renderCallback) {
            renderCallback(frameContext);
        }
        
        // Debug visualization
        if (this.renderingConfig.debugMode) {
            this._renderDebugOverlay(frameContext);
        }
    }
    
    /**
     * Direct rendering fallback
     * @private
     */
    _renderDirect(renderCallback) {
        if (renderCallback) {
            renderCallback({
                visibleObjects: Array.from(this.viewportCuller.renderableObjects.keys()),
                dirtyRegions: [],
                optimized: false
            });
        }
    }
    
    /**
     * Track frame performance metrics
     * @private
     */
    _trackFramePerformance(renderStart, frameContext) {
        const renderTime = performance.now() - renderStart;
        const frameTime = performance.now() - frameContext.timestamp;
        
        const metrics = {
            frameNumber: frameContext.frameNumber,
            renderTime,
            frameTime,
            visibleObjects: frameContext.visibleObjects.length,
            dirtyRegions: frameContext.dirtyRegions.length,
            timestamp: frameContext.timestamp
        };
        
        this.performanceMonitor.frameMetrics.push(metrics);
        
        // Maintain history size
        if (this.performanceMonitor.frameMetrics.length > this.performanceMonitor.maxHistory) {
            this.performanceMonitor.frameMetrics.shift();
        }
        
        // Update running statistics
        this._updatePerformanceStats();
    }
    
    /**
     * Update performance statistics
     * @private
     */
    _updatePerformanceStats() {
        const metrics = this.performanceMonitor.frameMetrics;
        if (metrics.length === 0) return;
        
        const recent = metrics.slice(-60); // Last second at 60fps
        const avgRenderTime = recent.reduce((sum, m) => sum + m.renderTime, 0) / recent.length;
        const avgFrameTime = recent.reduce((sum, m) => sum + m.frameTime, 0) / recent.length;
        
        this.performanceMonitor.stats.averageRenderTime = avgRenderTime;
        this.performanceMonitor.stats.averageFPS = Math.round(1000 / avgFrameTime);
        
        // Calculate effectiveness score
        const targetFrameTime = 1000 / this.renderingConfig.targetFPS;
        this.performanceMonitor.stats.effectivenessScore = 
            Math.min(1.0, targetFrameTime / avgFrameTime);
    }
    
    /**
     * Update adaptive optimization settings
     * @private
     */
    _updateAdaptiveOptimization() {
        const stats = this.performanceMonitor.stats;
        
        // Adjust optimization level based on performance
        if (stats.averageFPS < this.renderingConfig.targetFPS * 0.9) {
            // Performance below target, increase optimization
            if (this.renderingConfig.optimizationLevel === 'conservative') {
                this.renderingConfig.optimizationLevel = 'balanced';
            } else if (this.renderingConfig.optimizationLevel === 'balanced') {
                this.renderingConfig.optimizationLevel = 'aggressive';
            }
        } else if (stats.averageFPS > this.renderingConfig.targetFPS * 1.1) {
            // Performance above target, can reduce optimization
            if (this.renderingConfig.optimizationLevel === 'aggressive') {
                this.renderingConfig.optimizationLevel = 'balanced';
            } else if (this.renderingConfig.optimizationLevel === 'balanced') {
                this.renderingConfig.optimizationLevel = 'conservative';
            }
        }
    }
    
    /**
     * Render debug overlay
     * @private
     */
    _renderDebugOverlay(frameContext) {
        const ctx = this.ctx;
        
        // Show dirty regions
        if (this.renderingConfig.showDirtyRegions) {
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.lineWidth = 2;
            for (const region of frameContext.dirtyRegions) {
                ctx.strokeRect(region.x, region.y, region.width, region.height);
            }
        }
        
        // Show culled objects (placeholder)
        if (this.renderingConfig.showCulledObjects) {
            ctx.strokeStyle = 'rgba(0, 0, 255, 0.3)';
            ctx.lineWidth = 1;
            // Additional debug rendering would go here
        }
    }
}

// Export for backward compatibility
export default AdvancedRenderingOptimizer;