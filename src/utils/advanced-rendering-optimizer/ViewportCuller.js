import { getErrorHandler } from '../ErrorHandler.js';

/**
 * Viewport Culling System
 * ビューポートカリングシステム - 画面外オブジェクトの描画スキップによる最適化
 */
export class ViewportCuller {
    constructor(config = {}) {
        this.errorHandler = getErrorHandler();
        
        // Culling state
        this.enabled = config.enabled !== undefined ? config.enabled : true;
        this.viewport = { x: 0, y: 0, width: 0, height: 0 };
        this.cullingMargin = config.cullingMargin || 50;
        
        // Spatial optimization
        this.spatialGrid = new Map();
        this.gridSize = config.gridSize || 128;
        
        // Object tracking
        this.renderableObjects = new Set();
        this.culledObjects = new Set();
        this.visibilityCache = new Map();
        
        // Frustum culling
        this.frustum = {
            left: 0, right: 0, top: 0, bottom: 0,
            near: 0, far: 1000
        };
        
        // Statistics
        this.stats = {
            totalObjects: 0,
            culledObjects: 0,
            cullingEfficiency: 0,
            renderTime: 0,
            cullingTime: 0
        };
        
        // Performance tracking
        this.performanceHistory = [];
        this.historySize = config.historySize || 60;
    }
    
    /**
     * Set viewport dimensions and position
     * @param {number} x - Viewport X position
     * @param {number} y - Viewport Y position
     * @param {number} width - Viewport width
     * @param {number} height - Viewport height
     */
    setViewport(x, y, width, height) {
        try {
            this.viewport = { x, y, width, height };
            
            // Update frustum
            this.frustum = {
                left: x - this.cullingMargin,
                right: x + width + this.cullingMargin,
                top: y - this.cullingMargin,
                bottom: y + height + this.cullingMargin,
                near: 0,
                far: 1000
            };
            
            // Clear visibility cache when viewport changes
            this.visibilityCache.clear();
            
            // Update spatial grid
            this._updateSpatialGrid();
            
        } catch (error) {
            this.errorHandler.logError('Failed to set viewport', error);
        }
    }
    
    /**
     * Add object to culling system
     * @param {string} id - Object ID
     * @param {object} bounds - Object bounds {x, y, width, height}
     * @param {object} metadata - Additional object metadata
     */
    addObject(id, bounds, metadata = {}) {
        if (!this.enabled) return;
        
        try {
            const object = {
                id,
                bounds: { ...bounds },
                metadata,
                visible: false,
                lastCullCheck: 0,
                gridCells: new Set()
            };
            
            this.renderableObjects.set(id, object);
            this._assignToGrid(object);
            
        } catch (error) {
            this.errorHandler.logError('Failed to add object to culler', error);
        }
    }
    
    /**
     * Remove object from culling system
     * @param {string} id - Object ID
     */
    removeObject(id) {
        try {
            const object = this.renderableObjects.get(id);
            if (object) {
                this._removeFromGrid(object);
                this.renderableObjects.delete(id);
                this.culledObjects.delete(id);
                this.visibilityCache.delete(id);
            }
        } catch (error) {
            this.errorHandler.logError('Failed to remove object from culler', error);
        }
    }
    
    /**
     * Update object bounds
     * @param {string} id - Object ID
     * @param {object} newBounds - New bounds {x, y, width, height}
     */
    updateObject(id, newBounds) {
        try {
            const object = this.renderableObjects.get(id);
            if (object) {
                this._removeFromGrid(object);
                object.bounds = { ...newBounds };
                this._assignToGrid(object);
                
                // Invalidate cached visibility
                this.visibilityCache.delete(id);
            }
        } catch (error) {
            this.errorHandler.logError('Failed to update object in culler', error);
        }
    }
    
    /**
     * Perform culling for current frame
     * @returns {Array} Array of visible object IDs
     */
    cullObjects() {
        if (!this.enabled) {
            return Array.from(this.renderableObjects.keys());
        }
        
        const startTime = performance.now();
        const visibleObjects = [];
        
        try {
            this.culledObjects.clear();
            
            // Use spatial grid for efficient culling
            const relevantCells = this._getRelevantGridCells();
            const objectsToCheck = new Set();
            
            // Collect objects from relevant grid cells
            for (const cellKey of relevantCells) {
                const cell = this.spatialGrid.get(cellKey);
                if (cell) {
                    for (const objectId of cell) {
                        objectsToCheck.add(objectId);
                    }
                }
            }
            
            // Perform visibility test on collected objects
            for (const objectId of objectsToCheck) {
                const object = this.renderableObjects.get(objectId);
                if (object && this._isVisible(object)) {
                    object.visible = true;
                    visibleObjects.push(objectId);
                } else if (object) {
                    object.visible = false;
                    this.culledObjects.add(objectId);
                }
            }
            
            // Update statistics
            this.stats.totalObjects = this.renderableObjects.size;
            this.stats.culledObjects = this.culledObjects.size;
            this.stats.cullingEfficiency = this.stats.totalObjects > 0 ? 
                this.stats.culledObjects / this.stats.totalObjects : 0;
            
            const endTime = performance.now();
            this.stats.cullingTime = endTime - startTime;
            
            // Track performance history
            this._trackPerformance();
            
            return visibleObjects;
            
        } catch (error) {
            this.errorHandler.logError('Failed to cull objects', error);
            return Array.from(this.renderableObjects.keys());
        }
    }
    
    /**
     * Check if specific object is visible
     * @param {string} id - Object ID
     * @returns {boolean} True if visible
     */
    isObjectVisible(id) {
        const object = this.renderableObjects.get(id);
        return object ? object.visible : false;
    }
    
    /**
     * Get all visible objects
     * @returns {Array} Array of visible object data
     */
    getVisibleObjects() {
        const visible = [];
        for (const [id, object] of this.renderableObjects) {
            if (object.visible) {
                visible.push({ id, bounds: object.bounds, metadata: object.metadata });
            }
        }
        return visible;
    }
    
    /**
     * Get culling statistics
     * @returns {object} Performance statistics
     */
    getStats() {
        return { ...this.stats };
    }
    
    /**
     * Reset culling statistics
     */
    resetStats() {
        this.stats = {
            totalObjects: 0,
            culledObjects: 0,
            cullingEfficiency: 0,
            renderTime: 0,
            cullingTime: 0
        };
        this.performanceHistory = [];
    }
    
    // Private methods
    
    /**
     * Test if object is visible within frustum
     * @private
     */
    _isVisible(object) {
        const bounds = object.bounds;
        
        // Check frustum intersection
        return !(bounds.x + bounds.width < this.frustum.left ||
                bounds.x > this.frustum.right ||
                bounds.y + bounds.height < this.frustum.top ||
                bounds.y > this.frustum.bottom);
    }
    
    /**
     * Assign object to spatial grid cells
     * @private
     */
    _assignToGrid(object) {
        const bounds = object.bounds;
        const startX = Math.floor(bounds.x / this.gridSize);
        const startY = Math.floor(bounds.y / this.gridSize);
        const endX = Math.floor((bounds.x + bounds.width) / this.gridSize);
        const endY = Math.floor((bounds.y + bounds.height) / this.gridSize);
        
        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                const cellKey = `${x},${y}`;
                
                if (!this.spatialGrid.has(cellKey)) {
                    this.spatialGrid.set(cellKey, new Set());
                }
                
                this.spatialGrid.get(cellKey).add(object.id);
                object.gridCells.add(cellKey);
            }
        }
    }
    
    /**
     * Remove object from spatial grid cells
     * @private
     */
    _removeFromGrid(object) {
        for (const cellKey of object.gridCells) {
            const cell = this.spatialGrid.get(cellKey);
            if (cell) {
                cell.delete(object.id);
                if (cell.size === 0) {
                    this.spatialGrid.delete(cellKey);
                }
            }
        }
        object.gridCells.clear();
    }
    
    /**
     * Get grid cells relevant to current viewport
     * @private
     */
    _getRelevantGridCells() {
        const cells = new Set();
        const viewport = this.frustum;
        
        const startX = Math.floor(viewport.left / this.gridSize);
        const startY = Math.floor(viewport.top / this.gridSize);
        const endX = Math.floor(viewport.right / this.gridSize);
        const endY = Math.floor(viewport.bottom / this.gridSize);
        
        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                cells.add(`${x},${y}`);
            }
        }
        
        return cells;
    }
    
    /**
     * Update spatial grid when viewport changes
     * @private
     */
    _updateSpatialGrid() {
        // Grid is dynamically managed, no need to pre-populate
    }
    
    /**
     * Track performance metrics
     * @private
     */
    _trackPerformance() {
        const entry = {
            timestamp: Date.now(),
            cullingTime: this.stats.cullingTime,
            cullingEfficiency: this.stats.cullingEfficiency,
            totalObjects: this.stats.totalObjects,
            culledObjects: this.stats.culledObjects
        };
        
        this.performanceHistory.push(entry);
        
        if (this.performanceHistory.length > this.historySize) {
            this.performanceHistory.shift();
        }
    }
}