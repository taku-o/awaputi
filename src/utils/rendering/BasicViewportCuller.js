/**
 * ViewportCuller - Viewport culling optimization system
 * ビューポートカリングシステム - 画面外オブジェクトの効率的な除外処理
 * 
 * 主要機能:
 * - フラスタムカリング（視野範囲外の除外）
 * - 空間グリッドによる高速衝突判定
 * - 可視性キャッシュによる性能最適化
 * - 詳細なカリング統計収集
 */
export class BasicViewportCuller {
    constructor(canvas) {
        this.canvas = canvas;
        
        // Viewport culling system
        this.config = {
            enabled: true,
            viewport: { x: 0, y: 0, width: 0, height: 0 },
            cullingMargin: 50, // Extra margin around viewport
            
            // Culling optimization
            spatialGrid: new Map(), // Spatial partitioning grid
            gridSize: 128, // Grid cell size
            
            // Object tracking
            renderableObjects: new Set(),
            culledObjects: new Set(),
            visibilityCache: new Map(),
            
            // Frustum culling
            frustum: {
                left: 0, right: 0, top: 0, bottom: 0,
                near: 0, far: 1000
            },
            
            // Statistics
            stats: {
                totalObjects: 0,
                culledObjects: 0,
                cullingEfficiency: 0,
                processingTime: 0
            }
        };

        this.updateViewport();
        this.rebuildSpatialGrid();
    }

    /**
     * Update viewport dimensions and culling frustum
     */
    updateViewport() {
        const viewport = this.config.viewport;
        viewport.width = this.canvas.width;
        viewport.height = this.canvas.height;
        viewport.x = 0;
        viewport.y = 0;
        
        // Update frustum
        const frustum = this.config.frustum;
        frustum.left = viewport.x - this.config.cullingMargin;
        frustum.right = viewport.x + viewport.width + this.config.cullingMargin;
        frustum.top = viewport.y - this.config.cullingMargin;
        frustum.bottom = viewport.y + viewport.height + this.config.cullingMargin;
    }

    /**
     * Rebuild spatial grid for viewport culling
     */
    rebuildSpatialGrid() {
        this.config.spatialGrid.clear();
        
        const gridSize = this.config.gridSize;
        const viewport = this.config.viewport;
        
        // Create grid cells covering viewport area + margin
        const margin = this.config.cullingMargin * 2;
        const startX = Math.floor((viewport.x - margin) / gridSize) * gridSize;
        const startY = Math.floor((viewport.y - margin) / gridSize) * gridSize;
        const endX = Math.ceil((viewport.x + viewport.width + margin) / gridSize) * gridSize;
        const endY = Math.ceil((viewport.y + viewport.height + margin) / gridSize) * gridSize;
        
        for (let x = startX; x < endX; x += gridSize) {
            for (let y = startY; y < endY; y += gridSize) {
                const key = `${x},${y}`;
                this.config.spatialGrid.set(key, new Set());
            }
        }
    }

    /**
     * Perform viewport culling on objects
     * @param {Array} objects - Objects to cull
     * @returns {Array} Visible objects after culling
     */
    performViewportCulling(objects) {
        const startTime = performance.now();
        
        if (!this.config.enabled) {
            return objects;
        }

        this.config.renderableObjects.clear();
        this.config.culledObjects.clear();
        
        for (const obj of objects) {
            const bounds = this.calculateObjectBounds(obj);
            
            const isVisible = this.isObjectInFrustum(bounds, this.config.frustum);
            
            if (isVisible) {
                this.config.renderableObjects.add(obj);
                this.addObjectToSpatialGrid(obj);
            } else {
                this.config.culledObjects.add(obj);
            }
            
            // Update visibility cache
            this.config.visibilityCache.set(obj.id, isVisible);
        }

        // Update statistics
        this.config.stats.totalObjects = objects.length;
        this.config.stats.culledObjects = this.config.culledObjects.size;
        this.config.stats.cullingEfficiency = 
            (this.config.stats.culledObjects / this.config.stats.totalObjects) * 100;
        this.config.stats.processingTime = performance.now() - startTime;

        return Array.from(this.config.renderableObjects);
    }

    /**
     * Check if object bounds intersect with frustum
     * @param {object} bounds - Object bounds
     * @param {object} frustum - Frustum bounds
     * @returns {boolean} Whether object is visible
     */
    isObjectInFrustum(bounds, frustum) {
        return !(
            bounds.x + bounds.width < frustum.left ||
            bounds.x > frustum.right ||
            bounds.y + bounds.height < frustum.top ||
            bounds.y > frustum.bottom
        );
    }

    /**
     * Add object to spatial grid
     * @param {object} obj - Object to add
     */
    addObjectToSpatialGrid(obj) {
        const bounds = this.calculateObjectBounds(obj);
        const gridSize = this.config.gridSize;
        
        const startX = Math.floor(bounds.x / gridSize) * gridSize;
        const startY = Math.floor(bounds.y / gridSize) * gridSize;
        const endX = Math.floor((bounds.x + bounds.width) / gridSize) * gridSize;
        const endY = Math.floor((bounds.y + bounds.height) / gridSize) * gridSize;
        
        for (let x = startX; x <= endX; x += gridSize) {
            for (let y = startY; y <= endY; y += gridSize) {
                const key = `${x},${y}`;
                const cell = this.config.spatialGrid.get(key);
                if (cell) {
                    cell.add(obj);
                }
            }
        }
    }

    /**
     * Calculate object bounds
     * @param {object} obj - Object to calculate bounds for
     * @returns {object} Object bounds
     */
    calculateObjectBounds(obj) {
        const bounds = {
            x: obj.x || 0,
            y: obj.y || 0,
            width: obj.width || 0,
            height: obj.height || 0
        };

        // Account for rotation and scaling
        if (obj.rotation || obj.scale !== 1) {
            const centerX = bounds.x + bounds.width / 2;
            const centerY = bounds.y + bounds.height / 2;
            const scale = obj.scale || 1;
            
            // Simple bounding box expansion for rotation/scale
            const maxDimension = Math.max(bounds.width, bounds.height) * scale;
            const expansion = (maxDimension - Math.min(bounds.width, bounds.height)) / 2;
            
            bounds.x -= expansion;
            bounds.y -= expansion;
            bounds.width += expansion * 2;
            bounds.height += expansion * 2;
        }

        return bounds;
    }

    /**
     * Query objects in spatial grid near given bounds
     * @param {object} bounds - Query bounds
     * @returns {Set} Objects near the bounds
     */
    queryNearbyObjects(bounds) {
        const result = new Set();
        const gridSize = this.config.gridSize;
        
        const startX = Math.floor(bounds.x / gridSize) * gridSize;
        const startY = Math.floor(bounds.y / gridSize) * gridSize;
        const endX = Math.floor((bounds.x + bounds.width) / gridSize) * gridSize;
        const endY = Math.floor((bounds.y + bounds.height) / gridSize) * gridSize;
        
        for (let x = startX; x <= endX; x += gridSize) {
            for (let y = startY; y <= endY; y += gridSize) {
                const key = `${x},${y}`;
                const cell = this.config.spatialGrid.get(key);
                if (cell) {
                    for (const obj of cell) {
                        result.add(obj);
                    }
                }
            }
        }
        
        return result;
    }

    /**
     * Check if object is currently visible
     * @param {object} obj - Object to check
     * @returns {boolean} Whether object is visible
     */
    isObjectVisible(obj) {
        return this.config.visibilityCache.get(obj.id) || false;
    }

    /**
     * Get culling statistics
     * @returns {object} Statistics object
     */
    getStats() {
        return { ...this.config.stats };
    }

    /**
     * Configure viewport culler
     * @param {object} config - Configuration object
     */
    configure(config) {
        if (config.enabled !== undefined) this.config.enabled = config.enabled;
        if (config.cullingMargin !== undefined) this.config.cullingMargin = config.cullingMargin;
        if (config.gridSize !== undefined) {
            this.config.gridSize = config.gridSize;
            this.rebuildSpatialGrid();
        }
        
        if (config.viewport) {
            Object.assign(this.config.viewport, config.viewport);
            this.updateViewport();
        }
    }

    /**
     * Reset viewport culler
     */
    reset() {
        this.config.renderableObjects.clear();
        this.config.culledObjects.clear();
        this.config.visibilityCache.clear();
        this.rebuildSpatialGrid();
        this.config.stats = {
            totalObjects: 0,
            culledObjects: 0,
            cullingEfficiency: 0,
            processingTime: 0
        };
    }

    /**
     * Handle canvas resize
     */
    handleCanvasResize() {
        this.updateViewport();
        this.rebuildSpatialGrid();
    }
}