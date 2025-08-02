import { getErrorHandler } from './ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';
import { DirtyRegionManager } from './rendering/DirtyRegionManager.js';
import { ViewportCuller } from './rendering/ViewportCuller.js';
import { LayerManager } from './rendering/LayerManager.js';
import { RenderingPerformanceMonitor } from './rendering/RenderingPerformanceMonitor.js';
import { QuadTree } from './rendering/QuadTree.js';

/**
 * Advanced Rendering Optimization System
 * 高度レンダリング最適化システム - ダーティリージョン管理とビューポートカリング最適化
 * 
 * 主要機能:
 * - インテリジェントダーティリージョン計算
 * - 最適リージョンマージングアルゴリズム
 * - ダーティリージョンサイズ最適化
 * - 拡張ビューポートカリングアルゴリズム
 * - インテリジェントレイヤー合成最適化
 * - 静的レイヤーキャッシングシステム
 */
export class AdvancedRenderingOptimizer {
    constructor(canvas, context) {
        this.errorHandler = getErrorHandler();
        this.configManager = getConfigurationManager();
        
        this.canvas = canvas;
        this.ctx = context;
        
        // Rendering optimization configuration
        this.renderingConfig = {
            enabled: true,
            dirtyRegionEnabled: true,
            viewportCullingEnabled: true,
            layerCachingEnabled: true,
            
            // Performance targets
            targetFPS: 60,
            maxRenderTime: 16.67, // ms per frame
            performanceThreshold: 0.85, // 85% efficiency target
            
            // Optimization levels
            optimizationLevel: 'balanced', // 'conservative', 'balanced', 'aggressive'
            adaptiveOptimization: true,
            
            // Debug options
            debugMode: false,
            showDirtyRegions: false,
            showCulledObjects: false,
            showLayerComposition: false
        };
        
        // Initialize component managers
        this.dirtyRegionManager = new DirtyRegionManager();
        this.viewportCuller = new ViewportCuller(canvas);
        this.layerManager = new LayerManager(canvas);
        this.performanceMonitor = new RenderingPerformanceMonitor();
        
        // Rendering pipeline optimization
        this.renderingPipeline = {
            enabled: true,
            stages: [
                'prepare', 'cull', 'sort', 'batch', 'render', 'compose'
            ],
            currentStage: 'idle',
            
            // Batching system
            batching: {
                enabled: true,
                batchSize: 100,
                currentBatch: [],
                batchBuffer: new Map(),
                textureAtlasing: true
            },
            
            // Draw call optimization
            drawCallOptimization: {
                enabled: true,
                maxDrawCalls: 1000,
                currentDrawCalls: 0,
                instancedRendering: true,
                stateBatching: true
            },
            
            // Timing tracking
            stageTimings: new Map(),
            totalRenderTime: 0,
            frameCount: 0
        };
        
        // Spatial optimization
        this.spatialOptimizer = {
            enabled: true,
            quadTree: null,
            spatialHash: new Map(),
            
            // Spatial partitioning
            partitioning: {
                method: 'quadtree', // 'grid', 'quadtree', 'octree'
                maxDepth: 8,
                maxObjectsPerNode: 10,
                minNodeSize: 32
            },
            
            // Occlusion culling
            occlusionCulling: {
                enabled: false, // Advanced feature
                occluders: new Set(),
                occlusionQueries: new Map()
            }
        };
        
        this.initializeRenderingOptimizer();
        
        console.log('[AdvancedRenderingOptimizer] Advanced rendering optimization system initialized');
    }
    
    /**
     * Initialize the rendering optimizer
     */
    initializeRenderingOptimizer() {
        // Initialize spatial structures
        this.initializeSpatialStructures();
        
        // Start performance monitoring
        this.performanceMonitor.startPerformanceMonitoring();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Create baseline measurements
        this.performanceMonitor.establishPerformanceBaseline();
    }
    
    /**
     * Initialize spatial data structures
     */
    initializeSpatialStructures() {
        // Initialize quadtree if enabled
        if (this.spatialOptimizer.partitioning.method === 'quadtree') {
            this.initializeQuadTree();
        }
        
        console.log('[AdvancedRenderingOptimizer] Spatial structures initialized');
    }
    
    /**
     * Initialize QuadTree for spatial partitioning
     */
    initializeQuadTree() {
        const viewport = this.viewportCuller.config.viewport;
        const margin = this.viewportCuller.config.cullingMargin * 2;
        
        this.spatialOptimizer.quadTree = new QuadTree({
            x: viewport.x - margin,
            y: viewport.y - margin,
            width: viewport.width + margin * 2,
            height: viewport.height + margin * 2
        }, this.spatialOptimizer.partitioning.maxObjectsPerNode, this.spatialOptimizer.partitioning.maxDepth);
    }
    
    /**
     * Main rendering optimization entry point
     * @param {Array} renderObjects - Objects to render
     * @param {object} camera - Camera/viewport information
     */
    optimizeRendering(renderObjects, camera = null) {
        const startTime = performance.now();
        
        try {
            // Update pipeline stage
            this.renderingPipeline.currentStage = 'prepare';
            
            // 1. Prepare rendering data
            const preparedObjects = this.prepareRenderingData(renderObjects, camera);
            
            // 2. Perform viewport culling
            this.renderingPipeline.currentStage = 'cull';
            const visibleObjects = this.viewportCuller.performViewportCulling(preparedObjects);
            
            // 3. Calculate dirty regions
            this.renderingPipeline.currentStage = 'sort';
            const dirtyRegions = this.dirtyRegionManager.calculateDirtyRegions(visibleObjects);
            
            // 4. Optimize layer composition
            this.renderingPipeline.currentStage = 'batch';
            const layerBatches = this.layerManager.optimizeLayerComposition(visibleObjects);
            
            // 5. Execute optimized rendering
            this.renderingPipeline.currentStage = 'render';
            const renderResult = this.executeOptimizedRendering(layerBatches, dirtyRegions);
            
            // 6. Final composition
            this.renderingPipeline.currentStage = 'compose';
            this.performFinalComposition(renderResult);
            
            // Update performance metrics
            const totalTime = performance.now() - startTime;
            this.performanceMonitor.updateRenderingPerformance(totalTime, renderObjects.length);
            
            this.renderingPipeline.currentStage = 'idle';
            
            return {
                success: true,
                renderTime: totalTime,
                objectsRendered: visibleObjects.length,
                objectsCulled: renderObjects.length - visibleObjects.length,
                dirtyRegions: dirtyRegions.length,
                performanceGain: this.performanceMonitor.calculatePerformanceGain()
            };
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'AdvancedRenderingOptimizer.optimizeRendering'
            });
            
            this.renderingPipeline.currentStage = 'idle';
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Prepare rendering data and sort objects
     * @param {Array} renderObjects - Raw render objects
     * @param {object} camera - Camera information
     * @returns {Array} Prepared render objects
     */
    prepareRenderingData(renderObjects, camera) {
        const stageStart = performance.now();
        
        // Transform objects to screen space if camera provided
        const prepared = renderObjects.map(obj => {
            const preparedObj = { ...obj };
            
            if (camera) {
                // Apply camera transformation
                preparedObj.x = (obj.x - camera.x) * camera.zoom + camera.offsetX;
                preparedObj.y = (obj.y - camera.y) * camera.zoom + camera.offsetY;
                preparedObj.width = obj.width * camera.zoom;
                preparedObj.height = obj.height * camera.zoom;
            }
            
            // Calculate render priority
            preparedObj.renderPriority = this.calculateRenderPriority(preparedObj);
            
            return preparedObj;
        });
        
        // Sort by render priority (layer, z-index, material)
        prepared.sort((a, b) => {
            if (a.layer !== b.layer) {
                return (a.layer || 0) - (b.layer || 0);
            }
            if (a.zIndex !== b.zIndex) {
                return (a.zIndex || 0) - (b.zIndex || 0);
            }
            return a.renderPriority - b.renderPriority;
        });
        
        this.renderingPipeline.stageTimings.set('prepare', performance.now() - stageStart);
        return prepared;
    }
    
    /**
     * Calculate render priority for object
     * @param {object} obj - Object to calculate priority for
     * @returns {number} Render priority
     */
    calculateRenderPriority(obj) {
        let priority = 0;
        
        // Layer priority (0-1000)
        priority += (obj.layer || 0) * 1000;
        
        // Z-index priority (0-100)
        priority += (obj.zIndex || 0) * 100;
        
        // Material priority (0-10)
        priority += this.getMaterialPriority(obj.material);
        
        return priority;
    }
    
    /**
     * Get material priority for batching
     * @param {string} material - Material name
     * @returns {number} Material priority
     */
    getMaterialPriority(material) {
        const priorities = {
            'default': 0,
            'opaque': 1,
            'transparent': 2,
            'additive': 3,
            'multiply': 4
        };
        
        return priorities[material] || 0;
    }
    
    /**
     * Execute optimized rendering
     * @param {Map} layerBatches - Layer batches
     * @param {Array} dirtyRegions - Dirty regions
     * @returns {object} Render result
     */
    executeOptimizedRendering(layerBatches, dirtyRegions) {
        const stageStart = performance.now();
        
        // Clear dirty regions
        this.clearDirtyRegions(dirtyRegions);
        
        // Render each layer in order
        for (const layerName of this.layerManager.config.layerOrder) {
            const objects = layerBatches.get(layerName) || [];
            const layer = this.layerManager.getLayer(layerName);
            
            if (!layer || !layer.enabled || !layer.visible || objects.length === 0) {
                continue;
            }
            
            this.renderLayer(layer, objects, dirtyRegions);
        }
        
        // Apply post-processing effects
        this.applyPostProcessingEffects();
        
        this.renderingPipeline.stageTimings.set('render', performance.now() - stageStart);
        
        return {
            layersRendered: Array.from(layerBatches.keys()).length,
            objectsRendered: Array.from(layerBatches.values()).flat().length,
            dirtyRegionsProcessed: dirtyRegions.length
        };
    }
    
    /**
     * Clear dirty regions
     * @param {Array} dirtyRegions - Regions to clear
     */
    clearDirtyRegions(dirtyRegions) {
        for (const region of dirtyRegions) {
            if (region.full) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                break;
            } else {
                this.ctx.clearRect(region.x, region.y, region.width, region.height);
            }
        }
    }
    
    /**
     * Render layer with objects
     * @param {object} layer - Layer to render
     * @param {Array} objects - Objects to render
     * @param {Array} dirtyRegions - Dirty regions
     */
    renderLayer(layer, objects, dirtyRegions) {
        // Use layer manager to render layer
        this.layerManager.renderLayerToContext(layer.name, this.ctx, dirtyRegions);
        
        // Render objects that are not cached
        if (!layer.cacheable || layer.dirty) {
            for (const obj of objects) {
                if (this.shouldRenderObject(obj, dirtyRegions)) {
                    this.renderObjectToContext(obj, this.ctx);
                }
            }
        }
    }
    
    /**
     * Check if object should be rendered based on dirty regions
     * @param {object} obj - Object to check
     * @param {Array} dirtyRegions - Dirty regions
     * @returns {boolean} Whether object should be rendered
     */
    shouldRenderObject(obj, dirtyRegions) {
        if (dirtyRegions.length === 0) return true;
        
        const bounds = this.calculateObjectBounds(obj);
        for (const region of dirtyRegions) {
            if (this.intersectsRegion(bounds, region)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check if bounds intersect with region
     * @param {object} bounds - Object bounds
     * @param {object} region - Dirty region
     * @returns {boolean} Whether they intersect
     */
    intersectsRegion(bounds, region) {
        return !(
            bounds.x + bounds.width < region.x ||
            bounds.x > region.x + region.width ||
            bounds.y + bounds.height < region.y ||
            bounds.y > region.y + region.height
        );
    }
    
    /**
     * Calculate object bounds
     * @param {object} obj - Object to calculate bounds for
     * @returns {object} Object bounds
     */
    calculateObjectBounds(obj) {
        return this.dirtyRegionManager.calculateObjectBounds(obj);
    }
    
    /**
     * Render object to context
     * @param {object} obj - Object to render
     * @param {CanvasRenderingContext2D} ctx - Rendering context
     */
    renderObjectToContext(obj, ctx) {
        this.layerManager.renderObjectToLayerContext(obj, ctx);
    }
    
    /**
     * Perform final composition
     * @param {object} renderResult - Render result
     */
    performFinalComposition(renderResult) {
        const stageStart = performance.now();
        
        // Apply any final composition effects
        // (This is where post-processing would happen)
        
        this.renderingPipeline.stageTimings.set('compose', performance.now() - stageStart);
    }
    
    /**
     * Apply post-processing effects
     */
    applyPostProcessingEffects() {
        // Debug rendering
        if (this.renderingConfig.debugMode && this.renderingConfig.showDirtyRegions) {
            this.debugRenderDirtyRegions();
        }
    }
    
    /**
     * Debug render dirty regions
     */
    debugRenderDirtyRegions() {
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 2;
        
        for (const region of this.dirtyRegionManager.config.mergedRegions) {
            this.ctx.strokeRect(region.x, region.y, region.width, region.height);
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Handle canvas resize
        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(() => {
                this.handleCanvasResize();
            });
            resizeObserver.observe(this.canvas);
        }
        
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseOptimizations();
            } else {
                this.resumeOptimizations();
            }
        });
    }
    
    /**
     * Handle canvas resize
     */
    handleCanvasResize() {
        // Update viewport culler
        this.viewportCuller.handleCanvasResize();
        
        // Update layer manager
        this.layerManager.handleCanvasResize();
        
        // Reinitialize spatial structures
        this.initializeSpatialStructures();
    }
    
    /**
     * Pause optimizations
     */
    pauseOptimizations() {
        this.performanceMonitor.stopPerformanceMonitoring();
    }
    
    /**
     * Resume optimizations
     */
    resumeOptimizations() {
        this.performanceMonitor.startPerformanceMonitoring();
    }
    
    /**
     * Mark dirty region
     * @param {object} bounds - Region bounds
     */
    markDirtyRegion(bounds) {
        this.dirtyRegionManager.markDirtyRegion(bounds);
    }
    
    /**
     * Mark layer dirty
     * @param {string} layerName - Layer name
     */
    markLayerDirty(layerName) {
        this.layerManager.markLayerDirty(layerName);
    }
    
    /**
     * Get comprehensive statistics
     * @returns {object} Combined statistics
     */
    getStats() {
        return {
            dirtyRegions: this.dirtyRegionManager.getStats(),
            culling: this.viewportCuller.getStats(),
            layers: this.layerManager.getStats(),
            performance: this.performanceMonitor.getStats(),
            pipeline: {
                stageTimings: Object.fromEntries(this.renderingPipeline.stageTimings),
                currentStage: this.renderingPipeline.currentStage
            }
        };
    }
    
    /**
     * Configure the rendering optimizer
     * @param {object} config - Configuration object
     */
    configure(config) {
        if (config.rendering) {
            Object.assign(this.renderingConfig, config.rendering);
        }
        
        if (config.dirtyRegions) {
            this.dirtyRegionManager.configure(config.dirtyRegions);
        }
        
        if (config.culling) {
            this.viewportCuller.configure(config.culling);
        }
        
        if (config.layers) {
            this.layerManager.configure(config.layers);
        }
        
        if (config.performance) {
            this.performanceMonitor.configure(config.performance);
        }
    }
    
    /**
     * Set debug mode
     * @param {boolean} enabled - Whether debug mode is enabled
     */
    setDebugMode(enabled) {
        this.renderingConfig.debugMode = enabled;
        this.renderingConfig.showDirtyRegions = enabled;
        this.renderingConfig.showCulledObjects = enabled;
        this.renderingConfig.showLayerComposition = enabled;
    }
    
    /**
     * Destroy the rendering optimizer
     */
    destroy() {
        // Stop performance monitoring
        this.performanceMonitor.destroy();
        
        // Clear event listeners
        // (ResizeObserver automatically disconnects when element is removed)
        
        // Clear spatial structures
        if (this.spatialOptimizer.quadTree) {
            this.spatialOptimizer.quadTree.clear();
        }
    }
}

// グローバルインスタンス（遅延初期化）
let _advancedRenderingOptimizer = null;

export function getAdvancedRenderingOptimizer(canvas, context) {
    if (!_advancedRenderingOptimizer && canvas && context) {
        try {
            _advancedRenderingOptimizer = new AdvancedRenderingOptimizer(canvas, context);
            console.log('[AdvancedRenderingOptimizer] グローバルインスタンスを作成しました');
        } catch (error) {
            console.error('[AdvancedRenderingOptimizer] インスタンス作成エラー:', error);
            // フォールバック: 基本的なインスタンスを作成
            _advancedRenderingOptimizer = new AdvancedRenderingOptimizer(canvas, context);
        }
    }
    return _advancedRenderingOptimizer;
}

/**
 * AdvancedRenderingOptimizerインスタンスを再初期化
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {CanvasRenderingContext2D} context - Rendering context
 */
export function reinitializeAdvancedRenderingOptimizer(canvas, context) {
    try {
        if (_advancedRenderingOptimizer) {
            _advancedRenderingOptimizer.destroy();
        }
        _advancedRenderingOptimizer = new AdvancedRenderingOptimizer(canvas, context);
        console.log('[AdvancedRenderingOptimizer] 再初期化完了');
    } catch (error) {
        console.error('[AdvancedRenderingOptimizer] 再初期化エラー:', error);
    }
}

// 後方互換性のため
export const advancedRenderingOptimizer = getAdvancedRenderingOptimizer;