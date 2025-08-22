/**
 * LayerManager - Rendering layer management system
 * レイヤー管理システム - レンダリングレイヤーの効率的な管理と合成
 * 
 * 主要機能:
 * - レイヤー作成・削除・順序管理
 * - 静的レイヤーのキャッシング
 * - レイヤー合成最適化
 * - バッチレンダリング対応
 */

// Type definitions
interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Layer {
    name: string;
    order: number;
    enabled: boolean;
    visible: boolean;
    opacity: number;
    blendMode: string;
    canvas: HTMLCanvasElement | null;
    context: CanvasRenderingContext2D | null;
    static: boolean;
    cacheable: boolean;
    dirty: boolean;
    objects: Set<string>;
    boundingBox: BoundingBox;
    renderTime: number;
    complexity: number;
}

interface LayerProperties {
    static?: boolean;
    cacheable?: boolean;
}

interface LayerStats {
    totalLayers: number;
    cachedLayers: number;
    compositedLayers: number;
    cacheHitRate: number;
    compositionTime: number;
}

interface LayerManagerConfig {
    enabled: boolean;
    layers: Map<string, Layer>;
    layerOrder: string[];
    staticLayers: Set<string>;
    dynamicLayers: Set<string>;
    layerCache: Map<string, any>;
    cacheEnabled: boolean;
    maxCacheSize: number;
    currentCacheSize: number;
    compositionMode: 'simple' | 'smart' | 'advanced';
    blendOptimization: boolean;
    layerFusion: boolean;
    layerProperties: Map<string, LayerProperties>;
    stats: LayerStats;
}

interface RenderObject {
    type?: string;
    layer?: string;
    material?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    scale?: number;
    alpha?: number;
    image?: HTMLImageElement;
    text?: string;
    font?: string;
    color?: string;
    align?: string;
    shape?: string;
}

interface DirtyRegion {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ConfigurationOptions {
    enabled?: boolean;
    cacheEnabled?: boolean;
    maxCacheSize?: number;
    compositionMode?: 'simple' | 'smart' | 'advanced';
    blendOptimization?: boolean;
    layerFusion?: boolean;
}

export class BasicLayerManager {
    private canvas: HTMLCanvasElement;
    private config: LayerManagerConfig;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        
        // Layer management system
        this.config = {
            enabled: true,
            layers: new Map(),
            layerOrder: [],
            staticLayers: new Set(),
            dynamicLayers: new Set(),
            
            // Layer caching
            layerCache: new Map(),
            cacheEnabled: true,
            maxCacheSize: 50,
            currentCacheSize: 0,
            compositionMode: 'smart', // 'simple', 'smart', 'advanced'
            blendOptimization: true,
            layerFusion: true, // Merge compatible layers
            
            // Layer properties
            layerProperties: new Map(),
            
            // Statistics
            stats: {
                totalLayers: 0,
                cachedLayers: 0,
                compositedLayers: 0,
                cacheHitRate: 0,
                compositionTime: 0
            }
        };
        
        this.initializeDefaultLayers();
    }

    /**
     * Initialize default layers
     */
    private initializeDefaultLayers(): void {
        this.createLayer('background', 0, { static: true, cacheable: true });
        this.createLayer('game', 1, { static: false, cacheable: false });
        this.createLayer('ui', 2, { static: true, cacheable: true });
        this.createLayer('overlay', 3, { static: false, cacheable: false });
    }

    /**
     * Create a rendering layer
     * @param name - Layer name
     * @param order - Rendering order (lower = rendered first)
     * @param properties - Layer properties
     * @returns Created layer
     */
    createLayer(name: string, order: number, properties: LayerProperties = {}): Layer {
        const layer: Layer = {
            name,
            order,
            enabled: true,
            visible: true,
            opacity: 1.0,
            blendMode: 'source-over',
            
            // Layer canvas for caching
            canvas: null,
            context: null,
            
            // Properties
            static: properties.static || false,
            cacheable: properties.cacheable || false,
            dirty: true,
            
            // Content tracking
            objects: new Set(),
            boundingBox: { x: 0, y: 0, width: 0, height: 0 },
            
            // Performance tracking
            renderTime: 0,
            complexity: 0
        };
        
        // Create layer canvas if cacheable
        if (layer.cacheable) {
            layer.canvas = document.createElement('canvas');
            layer.canvas.width = this.canvas.width;
            layer.canvas.height = this.canvas.height;
            layer.context = layer.canvas.getContext('2d');
        }
        
        this.config.layers.set(name, layer);
        this.config.layerOrder.push(name);
        this.config.layerOrder.sort((a, b) => {
            const layerA = this.config.layers.get(a);
            const layerB = this.config.layers.get(b);
            return (layerA?.order || 0) - (layerB?.order || 0);
        });
        
        // Track layer type
        if (layer.static) {
            this.config.staticLayers.add(name);
        } else {
            this.config.dynamicLayers.add(name);
        }
        
        this.config.stats.totalLayers = this.config.layers.size;
        
        return layer;
    }

    /**
     * Remove a layer
     * @param name - Layer name
     */
    removeLayer(name: string): void {
        const layer = this.config.layers.get(name);
        if (!layer) return;

        // Clean up layer canvas
        if (layer.canvas) {
            layer.canvas = null;
            layer.context = null;
        }

        // Remove from tracking sets
        this.config.staticLayers.delete(name);
        this.config.dynamicLayers.delete(name);
        
        // Remove from cache
        this.config.layerCache.delete(name);
        
        // Remove from collections
        this.config.layers.delete(name);
        const index = this.config.layerOrder.indexOf(name);
        if (index !== -1) {
            this.config.layerOrder.splice(index, 1);
        }

        this.config.stats.totalLayers = this.config.layers.size;
    }

    /**
     * Get layer by name
     * @param name - Layer name
     * @returns Layer object or null
     */
    getLayer(name: string): Layer | null {
        return this.config.layers.get(name) || null;
    }

    /**
     * Set layer visibility
     * @param name - Layer name
     * @param visible - Visibility state
     */
    setLayerVisibility(name: string, visible: boolean): void {
        const layer = this.config.layers.get(name);
        if (layer) {
            layer.visible = visible;
        }
    }

    /**
     * Set layer opacity
     * @param name - Layer name
     * @param opacity - Opacity (0-1)
     */
    setLayerOpacity(name: string, opacity: number): void {
        const layer = this.config.layers.get(name);
        if (layer) {
            layer.opacity = Math.max(0, Math.min(1, opacity));
        }
    }

    /**
     * Mark layer as dirty
     * @param name - Layer name
     */
    markLayerDirty(name: string): void {
        const layer = this.config.layers.get(name);
        if (layer) {
            layer.dirty = true;
        }
    }

    /**
     * Optimize layer composition for objects
     * @param objects - Objects to render
     * @returns Layer batches organized by layer
     */
    optimizeLayerComposition(objects: RenderObject[]): Map<string, RenderObject[]> {
        const layerBatches = new Map<string, RenderObject[]>();
        
        // Group objects by layer
        for (const obj of objects) {
            const layerName = obj.layer || 'game';
            if (!layerBatches.has(layerName)) {
                layerBatches.set(layerName, []);
            }
            layerBatches.get(layerName)!.push(obj);
        }
        
        // Optimize each layer batch
        for (const [layerName, objects] of layerBatches) {
            const layer = this.config.layers.get(layerName);
            if (layer) {
                this.optimizeLayerBatch(layer, objects);
            }
        }
        
        return layerBatches;
    }

    /**
     * Optimize individual layer batch
     * @param layer - Layer to optimize
     * @param objects - Objects in layer
     */
    private optimizeLayerBatch(layer: Layer, objects: RenderObject[]): void {
        // Update layer cache if needed
        if (layer.cacheable && (layer.dirty || !layer.canvas)) {
            this.updateLayerCache(layer, objects);
        }
        
        // Batch objects for efficient rendering
        if (this.config.compositionMode !== 'simple') {
            this.batchDrawCalls(objects);
        }
    }

    /**
     * Update layer cache
     * @param layer - Layer to cache
     * @param objects - Objects to render to cache
     */
    private updateLayerCache(layer: Layer, objects: RenderObject[]): void {
        if (!layer.canvas || !layer.context) return;

        // Clear canvas
        layer.context.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        
        // Render objects to layer canvas
        for (const obj of objects) {
            this.renderObjectToLayerContext(obj, layer.context);
        }
        
        layer.dirty = false;
        this.config.stats.cachedLayers++;
    }

    /**
     * Render object to layer context
     * @param obj - Object to render
     * @param ctx - Context to render to
     */
    private renderObjectToLayerContext(obj: RenderObject, ctx: CanvasRenderingContext2D): void {
        ctx.save();
        
        // Apply object transformations
        if (obj.rotation) {
            const centerX = obj.x + obj.width / 2;
            const centerY = obj.y + obj.height / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(obj.rotation);
            ctx.translate(-centerX, -centerY);
        }
        
        if (obj.scale !== undefined && obj.scale !== 1) {
            ctx.scale(obj.scale, obj.scale);
        }
        
        if (obj.alpha !== undefined && obj.alpha !== 1) {
            ctx.globalAlpha = obj.alpha;
        }
        
        // Render based on object type
        switch(obj.type) {
            case 'sprite':
                this.renderSprite(obj, ctx);
                break;
            case 'text':
                this.renderText(obj, ctx);
                break;
            case 'shape':
                this.renderShape(obj, ctx);
                break;
            default:
                this.renderDefault(obj, ctx);
                break;
        }
        
        ctx.restore();
    }

    /**
     * Render sprite object
     * @param obj - Sprite object
     * @param ctx - Rendering context
     */
    private renderSprite(obj: RenderObject, ctx: CanvasRenderingContext2D): void {
        if (obj.image) {
            ctx.drawImage(obj.image, obj.x, obj.y, obj.width, obj.height);
        }
    }

    /**
     * Render text object
     * @param obj - Text object
     * @param ctx - Rendering context
     */
    private renderText(obj: RenderObject, ctx: CanvasRenderingContext2D): void {
        ctx.font = obj.font || '16px Arial';
        ctx.fillStyle = obj.color || '#000000';
        ctx.textAlign = (obj.align || 'left') as CanvasTextAlign;
        
        if (obj.text) {
            ctx.fillText(obj.text, obj.x, obj.y);
        }
    }

    /**
     * Render shape object
     * @param obj - Shape object
     * @param ctx - Rendering context
     */
    private renderShape(obj: RenderObject, ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = obj.color || '#000000';

        switch(obj.shape) {
            case 'rect':
                ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
                break;
            case 'circle':
                ctx.beginPath();
                ctx.arc(obj.x + obj.width/2, obj.y + obj.height/2, obj.width/2, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
    }

    /**
     * Render default object
     * @param obj - Object to render
     * @param ctx - Rendering context
     */
    private renderDefault(obj: RenderObject, ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = obj.color || '#ff0000';
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    }

    /**
     * Batch draw calls for efficiency
     * @param objects - Objects to batch
     * @returns Batched draw calls
     */
    private batchDrawCalls(objects: RenderObject[]): Map<string, RenderObject[]> {
        const batches = new Map<string, RenderObject[]>();
        
        for (const obj of objects) {
            const batchKey = this.getBatchKey(obj);
            if (!batches.has(batchKey)) {
                batches.set(batchKey, []);
            }
            batches.get(batchKey)!.push(obj);
        }
        
        return batches;
    }

    /**
     * Get batch key for object
     * @param obj - Object to get key for
     * @returns Batch key
     */
    private getBatchKey(obj: RenderObject): string {
        return `${obj.type || 'default'}_${obj.material || 'default'}`;
    }

    /**
     * Render layer to main context
     * @param layerName - Layer name
     * @param mainCtx - Main rendering context
     * @param dirtyRegions - Dirty regions to update
     */
    renderLayerToContext(layerName: string, mainCtx: CanvasRenderingContext2D, dirtyRegions: DirtyRegion[] = []): void {
        const layer = this.config.layers.get(layerName);
        if (!layer || !layer.enabled || !layer.visible) return;

        mainCtx.save();
        
        // Apply layer properties
        if (layer.opacity !== 1) {
            mainCtx.globalAlpha = layer.opacity;
        }

        if (layer.blendMode !== 'source-over') {
            mainCtx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;
        }
        
        // Render layer content
        if (layer.cacheable && layer.canvas && !layer.dirty) {
            // Use cached layer
            if (dirtyRegions.length > 0) {
                // Only update dirty regions
                for (const region of dirtyRegions) {
                    mainCtx.drawImage(
                        layer.canvas,
                        region.x, region.y, region.width, region.height,
                        region.x, region.y, region.width, region.height
                    );
                }
            } else {
                // Render full layer
                mainCtx.drawImage(layer.canvas, 0, 0);
            }
        }
        
        mainCtx.restore();
    }

    /**
     * Get layer statistics
     * @returns Statistics object
     */
    getStats(): LayerStats {
        this.config.stats.cacheHitRate = this.config.stats.cachedLayers > 0 ?
            (this.config.stats.cachedLayers / this.config.stats.totalLayers) * 100 : 0;
        return { ...this.config.stats };
    }

    /**
     * Configure layer manager
     * @param config - Configuration object
     */
    configure(config: ConfigurationOptions): void {
        if (config.enabled !== undefined) this.config.enabled = config.enabled;
        if (config.cacheEnabled !== undefined) this.config.cacheEnabled = config.cacheEnabled;
        if (config.maxCacheSize !== undefined) this.config.maxCacheSize = config.maxCacheSize;
        if (config.compositionMode !== undefined) this.config.compositionMode = config.compositionMode;
        if (config.blendOptimization !== undefined) this.config.blendOptimization = config.blendOptimization;
        if (config.layerFusion !== undefined) this.config.layerFusion = config.layerFusion;
    }

    /**
     * Handle canvas resize
     */
    handleCanvasResize(): void {
        // Resize all layer canvases
        for (const layer of this.config.layers.values()) {
            if (layer.canvas) {
                layer.canvas.width = this.canvas.width;
                layer.canvas.height = this.canvas.height;
                layer.dirty = true; // Mark for re-render
            }
        }
    }

    /**
     * Clear all layers
     */
    clearAllLayers(): void {
        for (const layer of this.config.layers.values()) {
            if (layer.canvas && layer.context) {
                layer.context.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
            }
            layer.dirty = true;
        }
    }

    /**
     * Reset layer manager
     */
    reset(): void {
        this.clearAllLayers();
        this.config.layerCache.clear();
    }
}