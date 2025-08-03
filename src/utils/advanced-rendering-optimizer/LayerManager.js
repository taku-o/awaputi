import { getErrorHandler } from '../ErrorHandler.js';

/**
 * Layer Management System
 * レイヤー管理システム - 効率的なレイヤー合成とキャッシング
 */
export class LayerManager {
    constructor(mainCanvas, config = {}) {
        this.errorHandler = getErrorHandler();
        this.mainCanvas = mainCanvas;
        
        // Layer management state
        this.layers = new Map();
        this.layerOrder = [];
        this.staticLayers = new Set();
        this.dynamicLayers = new Set();
        
        // Caching system
        this.cachingEnabled = config.cachingEnabled !== undefined ? config.cachingEnabled : true;
        this.cachedLayers = new Map();
        this.cacheInvalidation = new Set();
        
        // Composition settings
        this.globalAlpha = config.globalAlpha || 1.0;
        this.globalCompositeOperation = config.globalCompositeOperation || 'source-over';
        
        // Performance tracking
        this.stats = {
            totalLayers: 0,
            activeLayers: 0,
            cachedLayers: 0,
            renderTime: 0,
            compositionTime: 0,
            cacheHitRatio: 0
        };
        
        // Configuration
        this.config = {
            maxLayers: config.maxLayers || 16,
            cacheThreshold: config.cacheThreshold || 100, // ms
            invalidationThreshold: config.invalidationThreshold || 10, // frames
            enableBlending: config.enableBlending !== undefined ? config.enableBlending : true
        };
    }
    
    /**
     * Create a new rendering layer
     * @param {string} name - Layer name
     * @param {number} order - Rendering order (lower = rendered first)
     * @param {object} properties - Layer properties
     */
    createLayer(name, order, properties = {}) {
        try {
            if (this.layers.has(name)) {
                throw new Error(`Layer '${name}' already exists`);
            }
            
            if (this.layers.size >= this.config.maxLayers) {
                throw new Error(`Maximum layer count (${this.config.maxLayers}) exceeded`);
            }
            
            const layer = {
                name,
                order,
                enabled: true,
                visible: true,
                opacity: properties.opacity || 1.0,
                blendMode: properties.blendMode || 'source-over',
                
                // Layer canvas for caching
                canvas: null,
                context: null,
                
                // Properties
                static: properties.static || false,
                cacheable: properties.cacheable || false,
                dirty: true,
                lastModified: Date.now(),
                
                // Content tracking
                objects: new Set(),
                boundingBox: { x: 0, y: 0, width: 0, height: 0 },
                
                // Performance tracking
                renderTime: 0,
                complexity: 0,
                cacheHits: 0,
                cacheMisses: 0
            };
            
            // Create layer canvas if cacheable
            if (layer.cacheable && this.cachingEnabled) {
                layer.canvas = document.createElement('canvas');
                layer.canvas.width = this.mainCanvas.width;
                layer.canvas.height = this.mainCanvas.height;
                layer.context = layer.canvas.getContext('2d');
            }
            
            this.layers.set(name, layer);
            this._updateLayerOrder(name);
            
            // Track layer type
            if (layer.static) {
                this.staticLayers.add(name);
            } else {
                this.dynamicLayers.add(name);
            }
            
            this.stats.totalLayers = this.layers.size;
            
            console.log(`[LayerManager] Layer created: ${name} (order: ${order})`);
            return layer;
            
        } catch (error) {
            this.errorHandler.logError('Failed to create layer', error);
            return null;
        }
    }
    
    /**
     * Remove a layer
     * @param {string} name - Layer name
     */
    removeLayer(name) {
        try {
            const layer = this.layers.get(name);
            if (!layer) return false;
            
            // Clean up canvas
            if (layer.canvas) {
                layer.canvas = null;
                layer.context = null;
            }
            
            // Remove from tracking sets
            this.staticLayers.delete(name);
            this.dynamicLayers.delete(name);
            this.cachedLayers.delete(name);
            this.cacheInvalidation.delete(name);
            
            // Remove from order
            this.layerOrder = this.layerOrder.filter(layerName => layerName !== name);
            
            this.layers.delete(name);
            this.stats.totalLayers = this.layers.size;
            
            console.log(`[LayerManager] Layer removed: ${name}`);
            return true;
            
        } catch (error) {
            this.errorHandler.logError('Failed to remove layer', error);
            return false;
        }
    }
    
    /**
     * Get layer by name
     * @param {string} name - Layer name
     * @returns {object|null} Layer object
     */
    getLayer(name) {
        return this.layers.get(name) || null;
    }
    
    /**
     * Set layer visibility
     * @param {string} name - Layer name
     * @param {boolean} visible - Visibility state
     */
    setLayerVisibility(name, visible) {
        const layer = this.layers.get(name);
        if (layer) {
            layer.visible = visible;
            this._markLayerDirty(name);
        }
    }
    
    /**
     * Set layer opacity
     * @param {string} name - Layer name
     * @param {number} opacity - Opacity value (0-1)
     */
    setLayerOpacity(name, opacity) {
        const layer = this.layers.get(name);
        if (layer) {
            layer.opacity = Math.max(0, Math.min(1, opacity));
            this._markLayerDirty(name);
        }
    }
    
    /**
     * Set layer blend mode
     * @param {string} name - Layer name
     * @param {string} blendMode - Blend mode
     */
    setLayerBlendMode(name, blendMode) {
        const layer = this.layers.get(name);
        if (layer) {
            layer.blendMode = blendMode;
            this._markLayerDirty(name);
        }
    }
    
    /**
     * Mark layer as dirty for re-rendering
     * @param {string} name - Layer name
     */
    markLayerDirty(name) {
        this._markLayerDirty(name);
    }
    
    /**
     * Add object to layer
     * @param {string} layerName - Layer name
     * @param {string} objectId - Object ID
     * @param {object} bounds - Object bounds
     */
    addObjectToLayer(layerName, objectId, bounds = null) {
        const layer = this.layers.get(layerName);
        if (layer) {
            layer.objects.add(objectId);
            
            if (bounds) {
                this._updateLayerBounds(layer, bounds);
            }
            
            this._markLayerDirty(layerName);
        }
    }
    
    /**
     * Remove object from layer
     * @param {string} layerName - Layer name
     * @param {string} objectId - Object ID
     */
    removeObjectFromLayer(layerName, objectId) {
        const layer = this.layers.get(layerName);
        if (layer) {
            layer.objects.delete(objectId);
            this._markLayerDirty(layerName);
        }
    }
    
    /**
     * Render all layers to main canvas
     * @param {CanvasRenderingContext2D} mainContext - Main canvas context
     * @param {object} viewport - Viewport information
     */
    renderLayers(mainContext, viewport = null) {
        const startTime = performance.now();
        
        try {
            let activeLayers = 0;
            
            // Render layers in order
            for (const layerName of this.layerOrder) {
                const layer = this.layers.get(layerName);
                
                if (!layer || !layer.enabled || !layer.visible || layer.opacity <= 0) {
                    continue;
                }
                
                activeLayers++;
                
                // Apply layer settings
                const originalAlpha = mainContext.globalAlpha;
                const originalOperation = mainContext.globalCompositeOperation;
                
                mainContext.globalAlpha = originalAlpha * layer.opacity;
                if (this.config.enableBlending) {
                    mainContext.globalCompositeOperation = layer.blendMode;
                }
                
                // Render layer
                if (layer.cacheable && this._shouldUseCache(layer)) {
                    this._renderCachedLayer(mainContext, layer, viewport);
                } else {
                    this._renderLayerDirect(mainContext, layer, viewport);
                }
                
                // Restore context settings
                mainContext.globalAlpha = originalAlpha;
                mainContext.globalCompositeOperation = originalOperation;
            }
            
            this.stats.activeLayers = activeLayers;
            this.stats.renderTime = performance.now() - startTime;
            
        } catch (error) {
            this.errorHandler.logError('Failed to render layers', error);
        }
    }
    
    /**
     * Get rendering statistics
     * @returns {object} Performance statistics
     */
    getStats() {
        this.stats.cachedLayers = this.cachedLayers.size;
        return { ...this.stats };
    }
    
    /**
     * Clear all layer caches
     */
    clearCaches() {
        for (const layer of this.layers.values()) {
            if (layer.canvas && layer.context) {
                layer.context.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
            }
        }
        this.cachedLayers.clear();
        this.cacheInvalidation.clear();
    }
    
    // Private methods
    
    /**
     * Update layer order array
     * @private
     */
    _updateLayerOrder(layerName) {
        const layer = this.layers.get(layerName);
        if (!layer) return;
        
        // Remove if already exists
        this.layerOrder = this.layerOrder.filter(name => name !== layerName);
        
        // Insert at correct position
        let inserted = false;
        for (let i = 0; i < this.layerOrder.length; i++) {
            const otherLayer = this.layers.get(this.layerOrder[i]);
            if (otherLayer && layer.order < otherLayer.order) {
                this.layerOrder.splice(i, 0, layerName);
                inserted = true;
                break;
            }
        }
        
        if (!inserted) {
            this.layerOrder.push(layerName);
        }
    }
    
    /**
     * Mark layer as dirty
     * @private
     */
    _markLayerDirty(name) {
        const layer = this.layers.get(name);
        if (layer) {
            layer.dirty = true;
            layer.lastModified = Date.now();
            this.cachedLayers.delete(name);
        }
    }
    
    /**
     * Update layer bounding box
     * @private
     */
    _updateLayerBounds(layer, objectBounds) {
        if (layer.objects.size === 1) {
            layer.boundingBox = { ...objectBounds };
        } else {
            const bounds = layer.boundingBox;
            const right = Math.max(bounds.x + bounds.width, objectBounds.x + objectBounds.width);
            const bottom = Math.max(bounds.y + bounds.height, objectBounds.y + objectBounds.height);
            
            bounds.x = Math.min(bounds.x, objectBounds.x);
            bounds.y = Math.min(bounds.y, objectBounds.y);
            bounds.width = right - bounds.x;
            bounds.height = bottom - bounds.y;
        }
    }
    
    /**
     * Check if layer should use cache
     * @private
     */
    _shouldUseCache(layer) {
        if (!layer.cacheable || !this.cachingEnabled) return false;
        if (layer.dirty) return false;
        if (!this.cachedLayers.has(layer.name)) return false;
        
        return layer.renderTime > this.config.cacheThreshold;
    }
    
    /**
     * Render cached layer
     * @private
     */
    _renderCachedLayer(mainContext, layer, viewport) {
        if (layer.canvas) {
            mainContext.drawImage(layer.canvas, 0, 0);
            layer.cacheHits++;
        }
    }
    
    /**
     * Render layer directly
     * @private
     */
    _renderLayerDirect(mainContext, layer, viewport) {
        const startTime = performance.now();
        
        // If layer is cacheable, render to layer canvas first
        const targetContext = (layer.cacheable && layer.context) ? layer.context : mainContext;
        
        if (layer.cacheable && layer.context) {
            // Clear layer canvas
            layer.context.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        }
        
        // Custom rendering logic would go here
        // This is a placeholder for actual layer content rendering
        
        layer.renderTime = performance.now() - startTime;
        
        // If rendered to layer canvas, now composite to main canvas
        if (layer.cacheable && layer.context && targetContext !== mainContext) {
            mainContext.drawImage(layer.canvas, 0, 0);
            
            // Mark as cached if render time exceeds threshold
            if (layer.renderTime > this.config.cacheThreshold) {
                this.cachedLayers.set(layer.name, Date.now());
                layer.dirty = false;
            }
        }
        
        layer.cacheMisses++;
    }
}