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
export class BasicLayerManager {
    constructor(canvas) {
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
            maxCacheSize: 64 * 1024 * 1024, // 64MB cache limit
            currentCacheSize: 0,
            
            // Composition optimization
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
    initializeDefaultLayers() {
        // Create default layers
        this.createLayer('background', 0, { static: true, cacheable: true });
        this.createLayer('game', 1, { static: false, cacheable: false });
        this.createLayer('ui', 2, { static: true, cacheable: true });
        this.createLayer('overlay', 3, { static: false, cacheable: false });
    }

    /**
     * Create a rendering layer
     * @param {string} name - Layer name
     * @param {number} order - Rendering order (lower = rendered first)
     * @param {object} properties - Layer properties
     * @returns {object} Created layer
     */
    createLayer(name, order, properties = {}) {
        const layer = {
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
        this.config.layerOrder.sort((a, b) => 
            this.config.layers.get(a).order - this.config.layers.get(b).order);
        
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
     * @param {string} name - Layer name
     */
    removeLayer(name) {
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
     * @param {string} name - Layer name
     * @returns {object|null} Layer object or null
     */
    getLayer(name) {
        return this.config.layers.get(name) || null;
    }

    /**
     * Set layer visibility
     * @param {string} name - Layer name
     * @param {boolean} visible - Visibility state
     */
    setLayerVisibility(name, visible) {
        const layer = this.config.layers.get(name);
        if (layer) {
            layer.visible = visible;
        }
    }

    /**
     * Set layer opacity
     * @param {string} name - Layer name
     * @param {number} opacity - Opacity (0-1)
     */
    setLayerOpacity(name, opacity) {
        const layer = this.config.layers.get(name);
        if (layer) {
            layer.opacity = Math.max(0, Math.min(1, opacity));
        }
    }

    /**
     * Mark layer as dirty
     * @param {string} name - Layer name
     */
    markLayerDirty(name) {
        const layer = this.config.layers.get(name);
        if (layer) {
            layer.dirty = true;
        }
    }

    /**
     * Optimize layer composition for objects
     * @param {Array} objects - Objects to render
     * @returns {Map} Layer batches organized by layer
     */
    optimizeLayerComposition(objects) {
        const layerBatches = new Map();
        
        // Group objects by layer
        for (const obj of objects) {
            const layerName = obj.layer || 'game';
            if (!layerBatches.has(layerName)) {
                layerBatches.set(layerName, []);
            }
            layerBatches.get(layerName).push(obj);
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
     * @param {object} layer - Layer to optimize
     * @param {Array} objects - Objects in layer
     */
    optimizeLayerBatch(layer, objects) {
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
     * @param {object} layer - Layer to cache
     * @param {Array} objects - Objects to render to cache
     */
    updateLayerCache(layer, objects) {
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
     * @param {object} obj - Object to render
     * @param {CanvasRenderingContext2D} ctx - Context to render to
     */
    renderObjectToLayerContext(obj, ctx) {
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
        switch (obj.type) {
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
     * @param {object} obj - Sprite object
     * @param {CanvasRenderingContext2D} ctx - Rendering context
     */
    renderSprite(obj, ctx) {
        if (obj.image) {
            ctx.drawImage(obj.image, obj.x, obj.y, obj.width, obj.height);
        }
    }

    /**
     * Render text object
     * @param {object} obj - Text object
     * @param {CanvasRenderingContext2D} ctx - Rendering context
     */
    renderText(obj, ctx) {
        ctx.font = obj.font || '16px Arial';
        ctx.fillStyle = obj.color || '#000000';
        ctx.textAlign = obj.align || 'left';
        ctx.fillText(obj.text, obj.x, obj.y);
    }

    /**
     * Render shape object
     * @param {object} obj - Shape object
     * @param {CanvasRenderingContext2D} ctx - Rendering context
     */
    renderShape(obj, ctx) {
        ctx.fillStyle = obj.color || '#000000';
        
        switch (obj.shape) {
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
     * @param {object} obj - Object to render
     * @param {CanvasRenderingContext2D} ctx - Rendering context
     */
    renderDefault(obj, ctx) {
        ctx.fillStyle = obj.color || '#ff0000';
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    }

    /**
     * Batch draw calls for efficiency
     * @param {Array} objects - Objects to batch
     * @returns {Map} Batched draw calls
     */
    batchDrawCalls(objects) {
        const batches = new Map();
        
        for (const obj of objects) {
            const batchKey = this.getBatchKey(obj);
            if (!batches.has(batchKey)) {
                batches.set(batchKey, []);
            }
            batches.get(batchKey).push(obj);
        }
        
        return batches;
    }

    /**
     * Get batch key for object
     * @param {object} obj - Object to get key for
     * @returns {string} Batch key
     */
    getBatchKey(obj) {
        return `${obj.type || 'default'}_${obj.material || 'default'}`;
    }

    /**
     * Render layer to main context
     * @param {string} layerName - Layer name
     * @param {CanvasRenderingContext2D} mainCtx - Main rendering context
     * @param {Array} dirtyRegions - Dirty regions to update
     */
    renderLayerToContext(layerName, mainCtx, dirtyRegions = []) {
        const layer = this.config.layers.get(layerName);
        if (!layer || !layer.enabled || !layer.visible) return;

        mainCtx.save();
        
        // Apply layer properties
        if (layer.opacity !== 1) {
            mainCtx.globalAlpha = layer.opacity;
        }
        
        if (layer.blendMode !== 'source-over') {
            mainCtx.globalCompositeOperation = layer.blendMode;
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
     * @returns {object} Statistics object
     */
    getStats() {
        this.config.stats.cacheHitRate = this.config.stats.cachedLayers > 0 ?
            (this.config.stats.cachedLayers / this.config.stats.totalLayers) * 100 : 0;
            
        return { ...this.config.stats };
    }

    /**
     * Configure layer manager
     * @param {object} config - Configuration object
     */
    configure(config) {
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
    handleCanvasResize() {
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
    clearAllLayers() {
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
    reset() {
        this.clearAllLayers();
        this.config.layerCache.clear();
        this.config.stats = {
            totalLayers: this.config.layers.size,
            cachedLayers: 0,
            compositedLayers: 0,
            cacheHitRate: 0,
            compositionTime: 0
        };
    }
}