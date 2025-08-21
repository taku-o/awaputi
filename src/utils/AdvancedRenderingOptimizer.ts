import { getErrorHandler  } from './ErrorHandler.js';
import { getConfigurationManager  } from '../core/ConfigurationManager.js';
import { BasicDirtyRegionManager  } from './rendering/BasicDirtyRegionManager.js';
import { BasicViewportCuller  } from './rendering/BasicViewportCuller.js';
import { BasicLayerManager  } from './rendering/BasicLayerManager.js';
import { RenderingPerformanceMonitor  } from './rendering/RenderingPerformanceMonitor.js';
import { QuadTree  } from './rendering/QuadTree.js';

// Type definitions
interface RenderingConfig { enabled: boolean,
    dirtyRegionEnabled: boolean,
    viewportCullingEnabled: boolean,
    layerCachingEnabled: boolean,
    targetFPS: number,
    maxRenderTime: number,
    performanceThreshold: number,
    optimizationLevel: 'conservative' | 'balanced' | 'aggressive',
    adaptiveOptimization: boolean,
    debugMode: boolean,
    showDirtyRegions: boolean,
    showCulledObjects: boolean,
    showLayerComposition: boolean  }

interface RenderObject { x: number,
    y: number,
    width: number,
    height: number,
    layer?: number,
    zIndex?: number,
    material?: string,
    renderPriority?: number,
    [key: string]: any }

interface Camera { x: number,
    y: number,
    zoom: number,
    offsetX: number,
    offsetY: number  }

interface RenderResult { success: boolean,
    renderTime?: number,
    objectsRendered?: number,
    objectsCulled?: number,
    dirtyRegions?: number,
    performanceGain?: number,
    error?: string }

interface DirtyRegion { x: number,
    y: number,
    width: number,
    height: number,
    full?: boolean  }

interface LayerRenderResult { layersRendered: number,
    objectsRendered: number,
    dirtyRegionsProcessed: number }

interface ObjectBounds { x: number,
    y: number,
    width: number,
    height: number }

interface Layer { name: string,
    enabled: boolean,
    visible: boolean,
    cacheable?: boolean,
    dirty?: boolean }

interface RenderingPipeline { enabled: boolean,
    stages: string[],
    currentStage: string,
    batching: {
        enable,d: boolean,
        batchSize: number,
        currentBatch: any[],
    batchBuffer: Map<string, any>,
        textureAtlasing: boolean  };
    drawCallOptimization: { enabled: boolean,
        maxDrawCalls: number,
        currentDrawCalls: number,
        instancedRendering: boolean,
    stateBatching: boolean };
    stageTimings: Map<string, number>;
    totalRenderTime: number,
    frameCount: number;
}

interface SpatialOptimizer { enabled: boolean,
    quadTree: QuadTree | null,
    spatialHash: Map<string, any>,

    partitioning: {''
        metho,d: 'grid' | 'quadtree' | 'octree',
        maxDepth: number,
        maxObjectsPerNode: number,
    minNodeSize: number  };
    occlusionCulling: { enabled: boolean,
        occluders: Set<any>,
        occlusionQueries: Map<string, any> }

interface OptimizerConfig { rendering?: Partial<RenderingConfig>,
    dirtyRegions?: any,
    culling?: any,
    layers?: any,
    performance?: any }

interface OptimizerStats { dirtyRegions: any,
    culling: any,
    layers: any,
    performance: any,
    pipeline: {
        stageTiming,s: Record<string, number>,
        currentStage: string  }

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
    private readonly errorHandler: any,
    private readonly configManager: any,
    private readonly canvas: HTMLCanvasElement,
    private readonly ctx: CanvasRenderingContext2D,
    // Configuration
    private renderingConfig: RenderingConfig,
    // Component managers
    private readonly, dirtyRegionManager: BasicDirtyRegionManager,
    private readonly viewportCuller: BasicViewportCuller,
    private readonly layerManager: BasicLayerManager,
    private readonly performanceMonitor: RenderingPerformanceMonitor,
    // Rendering pipeline optimization
    private renderingPipeline: RenderingPipeline,
    // Spatial optimization
    private, spatialOptimizer: SpatialOptimizer,
    constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    ',

        this.errorHandler = getErrorHandler(),
        this.configManager = getConfigurationManager('''
            optimizationLevel: 'balanced', // 'conservative', 'balanced', 'aggressive',
            adaptiveOptimization: true,
            // Debug options
            debugMode: false,
            showDirtyRegions: false,
    showCulledObjects: false }
            showLayerComposition: false }))
        // Initialize component managers
        this.dirtyRegionManager = new BasicDirtyRegionManager();
        this.viewportCuller = new BasicViewportCuller(canvas);
        this.layerManager = new BasicLayerManager(canvas);
        this.performanceMonitor = new RenderingPerformanceMonitor('';
                'prepare', 'cull', 'sort', 'batch', 'render', 'compose'],
            currentStage: 'idle';
            // Batching system
           , batching: { enabled: true,
                batchSize: 100),
                currentBatch: [],
    batchBuffer: new Map<string, any>(),
                textureAtlasing: true  };
            // Draw call optimization
            drawCallOptimization: { enabled: true,
                maxDrawCalls: 1000,
                currentDrawCalls: 0,
                instancedRendering: true,
    stateBatching: true };
            // Timing tracking
            stageTimings: new Map<string, number>(),
            totalRenderTime: 0,
    frameCount: 0;
        },
        
        // Spatial optimization
        this.spatialOptimizer = { enabled: true,
            quadTree: null,
            spatialHash: new Map<string, any>(),
            
            // Spatial partitioning
            partitioning: {''
                method: 'quadtree', // 'grid', 'quadtree', 'octree',
                maxDepth: 8,
                maxObjectsPerNode: 10,
    minNodeSize: 32  };
            // Occlusion culling
            occlusionCulling: { enabled: false, // Advanced feature
                occluders: new Set<any>(),
                occlusionQueries: new Map<string, any>( }
        };

        this.initializeRenderingOptimizer()';
        console.log('[AdvancedRenderingOptimizer] Advanced rendering optimization system initialized);
    }
    
    /**
     * Initialize the rendering optimizer
     */
    private initializeRenderingOptimizer(): void { // Initialize spatial structures
        this.initializeSpatialStructures(),
        
        // Start performance monitoring
        this.performanceMonitor.startPerformanceMonitoring(),
        
        // Setup event listeners
        this.setupEventListeners(),
        
        // Create baseline measurements
        this.performanceMonitor.establishPerformanceBaseline() }
    
    /**
     * Initialize spatial data structures
     */''
    private initializeSpatialStructures()';
        if(this.spatialOptimizer.partitioning.method === 'quadtree' {'

            this.initializeQuadTree() }

        console.log('[AdvancedRenderingOptimizer] Spatial, structures initialized'); }'
    }
    
    /**
     * Initialize QuadTree for spatial partitioning
     */
    private initializeQuadTree(): void { const viewport = this.viewportCuller.config.viewport,
        const margin = this.viewportCuller.config.cullingMargin * 2,
        
        this.spatialOptimizer.quadTree = new QuadTree({
            x: viewport.x - margin,
            y: viewport.y - margin),
            width: viewport.width + margin * 2,
    height: viewport.height + margin * 2), this.spatialOptimizer.partitioning.maxObjectsPerNode, this.spatialOptimizer.partitioning.maxDepth) }
    
    /**
     * Main rendering optimization entry point
     */'
    optimizeRendering(renderObjects: RenderObject[], camera: Camera | null = null): RenderResult { ''
        const startTime = performance.now('',
            this.renderingPipeline.currentStage = 'prepare',
            ',
            // 1. Prepare rendering data')'
            const preparedObjects = this.prepareRenderingData(renderObjects, camera),
            ',
            // 2. Perform viewport culling
            this.renderingPipeline.currentStage = 'cull',
            const visibleObjects = this.viewportCuller.performViewportCulling(preparedObjects),
            ',
            // 3. Calculate dirty regions
            this.renderingPipeline.currentStage = 'sort',
            const dirtyRegions = this.dirtyRegionManager.calculateDirtyRegions(visibleObjects),
            ',
            // 4. Optimize layer composition
            this.renderingPipeline.currentStage = 'batch',
            const layerBatches = this.layerManager.optimizeLayerComposition(visibleObjects),
            ',
            // 5. Execute optimized rendering
            this.renderingPipeline.currentStage = 'render',
            const renderResult = this.executeOptimizedRendering(layerBatches, dirtyRegions),
            ',
            // 6. Final composition
            this.renderingPipeline.currentStage = 'compose',
            this.performFinalComposition(renderResult),
            
            // Update performance metrics
            const totalTime = performance.now() - startTime,
            this.performanceMonitor.updateRenderingPerformance(totalTime, renderObjects.length),

            this.renderingPipeline.currentStage = 'idle',
            
            return { success: true,
                renderTime: totalTime,
                objectsRendered: visibleObjects.length,
                objectsCulled: renderObjects.length - visibleObjects.length,
    dirtyRegions: dirtyRegions.length };
                performanceGain: this.performanceMonitor.calculatePerformanceGain(); 
    } catch (error) {
            this.errorHandler.handleError(error, 'ADVANCED_RENDERING_ERROR', {''
                context: 'AdvancedRenderingOptimizer.optimizeRendering',' }

            }');

            this.renderingPipeline.currentStage = 'idle';
            return { success: false };
                error: (error, as Error).message  }
            }
    }
    
    /**
     * Prepare rendering data and sort objects
     */
    private prepareRenderingData(renderObjects: RenderObject[], camera: Camera | null): RenderObject[] { const stageStart = performance.now(),
        
        // Transform objects to screen space if camera provided
        const prepared = renderObjects.map(obj => { ),
            const preparedObj = { ...obj ),
            
            if(camera) {
            
                // Apply camera transformation
                preparedObj.x = (obj.x - camera.x) * camera.zoom + camera.offsetX,
                preparedObj.y = (obj.y - camera.y) * camera.zoom + camera.offsetY }
                preparedObj.width = obj.width * camera.zoom; }
                preparedObj.height = obj.height * camera.zoom; }
            }
            
            // Calculate render priority
            preparedObj.renderPriority = this.calculateRenderPriority(preparedObj);
            
            return preparedObj;
        });
        
        // Sort by render priority (layer, z-index, material);
        prepared.sort((a, b) => {  if (a.layer !== b.layer) { }
                return (a.layer || 0) - (b.layer || 0);
            if (a.zIndex !== b.zIndex) { return (a.zIndex || 0) - (b.zIndex || 0) }
            return (a.renderPriority || 0) - (b.renderPriority || 0);}');

        this.renderingPipeline.stageTimings.set('prepare', performance.now() - stageStart);
        return prepared;
    }
    
    /**
     * Calculate render priority for object
     */
    private calculateRenderPriority(obj: RenderObject): number { let priority = 0,
        
        // Layer priority (0-1000),
        priority += (obj.layer || 0) * 1000,
        
        // Z-index priority (0-100),
        priority += (obj.zIndex || 0) * 100,
        
        // Material priority (0-10),
        priority += this.getMaterialPriority(obj.material),
        
        return priority }
    
    /**
     * Get material priority for batching
     */''
    private getMaterialPriority(material?: string): number { const priorities: Record<string, number> = {', 'default': 0,
            'opaque': 1,
            'transparent': 2,
            'additive': 3,
            'multiply': 4 };

        return priorities[material || 'default] || 0;
    }
    
    /**
     * Execute optimized rendering
     */
    private executeOptimizedRendering(layerBatches: Map<string, RenderObject[]>, dirtyRegions: DirtyRegion[]): LayerRenderResult { const stageStart = performance.now(),
        
        // Clear dirty regions
        this.clearDirtyRegions(dirtyRegions),
        
        // Render each layer in order
        for (const layerName of this.layerManager.config.layerOrder) {
            const objects = layerBatches.get(layerName) || [],
            const layer = this.layerManager.getLayer(layerName),
            
            if (!layer || !layer.enabled || !layer.visible || objects.length === 0) {
        }
                continue; }
            }
            
            this.renderLayer(layer, objects, dirtyRegions);
        }
        ;
        // Apply post-processing effects
        this.applyPostProcessingEffects()';
        this.renderingPipeline.stageTimings.set('render', performance.now() - stageStart);
        
        return { layersRendered: Array.from(layerBatches.keys().length,
            objectsRendered: Array.from(layerBatches.values().flat().length };
            dirtyRegionsProcessed: dirtyRegions.length 
    }
    
    /**
     * Clear dirty regions
     */
    private clearDirtyRegions(dirtyRegions: DirtyRegion[]): void { for (const region of dirtyRegions) {
            if(region.full) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height) }
                break; }
            } else { this.ctx.clearRect(region.x, region.y, region.width, region.height) }
}
    
    /**
     * Render layer with objects
     */
    private renderLayer(layer: Layer, objects: RenderObject[], dirtyRegions: DirtyRegion[]): void { // Use layer manager to render layer
        this.layerManager.renderLayerToContext(layer.name, this.ctx, dirtyRegions),
        
        // Render objects that are not cached
        if(!layer.cacheable || layer.dirty) {
            for (const obj of objects) {
                if(this.shouldRenderObject(obj, dirtyRegions) {
        }
                    this.renderObjectToContext(obj, this.ctx); }
}
        }
    }
    
    /**
     * Check if object should be rendered based on dirty regions
     */
    private shouldRenderObject(obj: RenderObject, dirtyRegions: DirtyRegion[]): boolean { if (dirtyRegions.length === 0) return true,
        
        const bounds = this.calculateObjectBounds(obj),
        for (const region of dirtyRegions) {
            if(this.intersectsRegion(bounds, region) {
        }
                return true;
        
        return false;
    }
    
    /**
     * Check if bounds intersect with region
     */
    private intersectsRegion(bounds: ObjectBounds, region: DirtyRegion): boolean { return !(
            bounds.x + bounds.width < region.x ||,
            bounds.x > region.x + region.width ||,
            bounds.y + bounds.height < region.y ||,
            bounds.y > region.y + region.height) }
    
    /**
     * Calculate object bounds
     */
    private calculateObjectBounds(obj: RenderObject): ObjectBounds { return this.dirtyRegionManager.calculateObjectBounds(obj) }
    
    /**
     * Render object to context
     */
    private renderObjectToContext(obj: RenderObject, ctx: CanvasRenderingContext2D): void { this.layerManager.renderObjectToLayerContext(obj, ctx) }
    
    /**
     * Perform final composition
     */
    private performFinalComposition(renderResult: LayerRenderResult): void { const stageStart = performance.now(),
        // Apply any final composition effects
        // (This, is where, post-processing, would happen')'
        ,
        this.renderingPipeline.stageTimings.set('compose', performance.now() - stageStart) }
    
    /**
     * Apply post-processing effects
     */
    private applyPostProcessingEffects(): void { // Debug rendering
        if(this.renderingConfig.debugMode && this.renderingConfig.showDirtyRegions) {
    
}
            this.debugRenderDirtyRegions(); }
}
    
    /**
     * Debug render dirty regions
     */''
    private debugRenderDirtyRegions('';
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 2;
        );
        for (const region of this.dirtyRegionManager.config.mergedRegions) { this.ctx.strokeRect(region.x, region.y, region.width, region.height) }
    }
    
    /**
     * Setup event listeners'
     */''
    private setupEventListeners()';
        if(typeof, ResizeObserver !== 'undefined) { const resizeObserver = new ResizeObserver(() => {  }'
                this.handleCanvasResize(); }

            });
            resizeObserver.observe(this.canvas);
        }
        ';
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {  if (document.hidden) { }
                this.pauseOptimizations(); }
            } else { this.resumeOptimizations() }
        });
    }
    
    /**
     * Handle canvas resize
     */
    private handleCanvasResize(): void { // Update viewport culler
        this.viewportCuller.handleCanvasResize(),
        
        // Update layer manager
        this.layerManager.handleCanvasResize(),
        
        // Reinitialize spatial structures
        this.initializeSpatialStructures() }
    
    /**
     * Pause optimizations
     */
    private pauseOptimizations(): void { this.performanceMonitor.stopPerformanceMonitoring() }
    
    /**
     * Resume optimizations
     */
    private resumeOptimizations(): void { this.performanceMonitor.startPerformanceMonitoring() }
    
    /**
     * Mark dirty region
     */
    markDirtyRegion(bounds: ObjectBounds): void { this.dirtyRegionManager.markDirtyRegion(bounds) }
    
    /**
     * Mark layer dirty
     */
    markLayerDirty(layerName: string): void { this.layerManager.markLayerDirty(layerName) }
    
    /**
     * Get comprehensive statistics
     */
    getStats(): OptimizerStats { return { dirtyRegions: this.dirtyRegionManager.getStats(
            culling: this.viewportCuller.getStats(),
            layers: this.layerManager.getStats(),
            performance: this.performanceMonitor.getStats(
    pipeline: {
                stageTimings: Object.fromEntries(this.renderingPipeline.stageTimings) };
                currentStage: this.renderingPipeline.currentStage 
    }
    
    /**
     * Configure the rendering optimizer
     */
    configure(config: OptimizerConfig): void { if (config.rendering) {
            Object.assign(this.renderingConfig, config.rendering) }
        
        if (config.dirtyRegions) { this.dirtyRegionManager.configure(config.dirtyRegions) }
        
        if (config.culling) { this.viewportCuller.configure(config.culling) }
        
        if (config.layers) { this.layerManager.configure(config.layers) }
        
        if (config.performance) { this.performanceMonitor.configure(config.performance) }
    }
    
    /**
     * Set debug mode
     */
    setDebugMode(enabled: boolean): void { this.renderingConfig.debugMode = enabled,
        this.renderingConfig.showDirtyRegions = enabled,
        this.renderingConfig.showCulledObjects = enabled,
        this.renderingConfig.showLayerComposition = enabled }
    
    /**
     * Destroy the rendering optimizer
     */
    destroy(): void { // Stop performance monitoring
        this.performanceMonitor.destroy(),
        
        // Clear event listeners
        // (ResizeObserver, automatically disconnects, when element, is removed)
        
        // Clear spatial structures
        if(this.spatialOptimizer.quadTree) {
    
}
            this.spatialOptimizer.quadTree.clear(); }
}
}

// グローバルインスタンス（遅延初期化）
let _advancedRenderingOptimizer: AdvancedRenderingOptimizer | null = null,

export function getAdvancedRenderingOptimizer(canvas?: HTMLCanvasElement, context?: CanvasRenderingContext2D): AdvancedRenderingOptimizer | null { if (!_advancedRenderingOptimizer && canvas && context) {
        try {'
            _advancedRenderingOptimizer = new AdvancedRenderingOptimizer(canvas, context),
            console.log('[AdvancedRenderingOptimizer] グローバルインスタンスを作成しました'),' }

        } catch (error) {
            console.error('[AdvancedRenderingOptimizer] インスタンス作成エラー:', error),
            // フォールバック: 基本的なインスタンスを作成
            _advancedRenderingOptimizer = new AdvancedRenderingOptimizer(canvas, context) }
    }
    return _advancedRenderingOptimizer;
}

/**
 * AdvancedRenderingOptimizerインスタンスを再初期化
 */
export function reinitializeAdvancedRenderingOptimizer(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void { try {
        if(_advancedRenderingOptimizer) {
    
}
            _advancedRenderingOptimizer.destroy(); }
        }''
        _advancedRenderingOptimizer = new AdvancedRenderingOptimizer(canvas, context);
        console.log('[AdvancedRenderingOptimizer] 再初期化完了');
    } catch (error) {
        console.error('[AdvancedRenderingOptimizer] 再初期化エラー:', error' }
}
';
// 後方互換性のため
export const advancedRenderingOptimizer = getAdvancedRenderingOptimizer;