import { getErrorHandler  } from '../ErrorHandler.js';

// Type definitions
interface ViewportCullerConfig { enabled?: boolean,
    cullingMargin?: number,
    gridSize?: number,
    historySize?: number }

interface Viewport { x: number,
    y: number,
    width: number,
    height: number  }

interface Frustum { left: number,
    right: number,
    top: number,
    bottom: number,
    near: number,
    far: number }

interface ObjectBounds { x: number,
    y: number,
    width: number,
    height: number }

interface RenderableObject { id: string,
    bounds: ObjectBounds,
    metadata: Record<string, any>,
    visible: boolean,
    lastCullCheck: number,
    gridCells: Set<string>
     }

interface CullingStats { totalObjects: number,
    culledObjects: number,
    cullingEfficiency: number,
    renderTime: number,
    cullingTime: number }

interface PerformanceEntry { timestamp: number,
    cullingTime: number,
    cullingEfficiency: number,
    totalObjects: number,
    culledObjects: number }

interface VisibleObjectData { id: string,
    bounds: ObjectBounds,
    metadata: Record<string, any> }

/**
 * Viewport Culling System
 * ビューポートカリングシステム - 画面外オブジェクトの描画スキップによる最適化
 */
export class AdvancedViewportCuller {
    private errorHandler: any,
    private enabled: boolean,
    private viewport: Viewport,
    private cullingMargin: number,
    private, spatialGrid: Map<string, Set<string>>,
    private gridSize: number,
    private, renderableObjects: Map<string, RenderableObject>,
    private culledObjects: Set<string>,
    private visibilityCache: Map<string, boolean>,
    private frustum: Frustum,
    private stats: CullingStats,
    private performanceHistory: PerformanceEntry[],
    private, historySize: number,
    constructor(config: ViewportCullerConfig = {) {

        this.errorHandler = getErrorHandler(),
        
        // Culling state

     }
        this.enabled = config.enabled !== undefined ? config.enabled: true 
        this.viewport = { x: 0, y: 0, width: 0, height: 0  }
        this.cullingMargin = config.cullingMargin || 50;
        
        // Spatial optimization
        this.spatialGrid = new Map<string, Set<string>>();
        this.gridSize = config.gridSize || 128;
        
        // Object tracking
        this.renderableObjects = new Map<string, RenderableObject>();
        this.culledObjects = new Set<string>();
        this.visibilityCache = new Map<string, boolean>();
        
        // Frustum culling
        this.frustum = { left: 0, right: 0, top: 0, bottom: 0,
            near: 0, far: 1000  };
        
        // Statistics
        this.stats = { totalObjects: 0,
            culledObjects: 0,
            cullingEfficiency: 0,
            renderTime: 0,
    cullingTime: 0  };
        // Performance tracking
        this.performanceHistory = [];
        this.historySize = config.historySize || 60;
    }
    
    /**
     * Set viewport dimensions and position
     */
    setViewport(x: number, y: number, width: number, height: number): void { try { }
            this.viewport = { x, y, width, height };
            
            // Update frustum
            this.frustum = { left: x - this.cullingMargin,
                right: x + width + this.cullingMargin,
                top: y - this.cullingMargin,
                bottom: y + height + this.cullingMargin,
                near: 0,
    far: 1000  };
            // Clear visibility cache when viewport changes
            this.visibilityCache.clear();
            
            // Update spatial grid
            this._updateSpatialGrid();

        } catch (error) {
            this.errorHandler.logError('Failed to set viewport', error) }
    }
    
    /**
     * Add object to culling system
     */
    addObject(id: string, bounds: ObjectBounds, metadata: Record<string, any> = {}): void { if (!this.enabled) return,
        
        try {
            const object: RenderableObject = {
                id }
                bounds: { ...bounds
                metadata,
                visible: false,
                lastCullCheck: 0,
    gridCells: new Set<string>() };
            
            this.renderableObjects.set(id, object);
            this._assignToGrid(object);

        } catch (error) {
            this.errorHandler.logError('Failed to add object to culler', error) }
    }
    
    /**
     * Remove object from culling system
     */
    removeObject(id: string): void { try {
            const object = this.renderableObjects.get(id),
            if(object) {
                this._removeFromGrid(object),
                this.renderableObjects.delete(id),
                this.culledObjects.delete(id) }

                this.visibilityCache.delete(id);' }'

            } catch (error) {
            this.errorHandler.logError('Failed to remove object from culler', error) }
    }
    
    /**
     * Update object bounds
     */
    updateObject(id: string, newBounds: ObjectBounds): void { try {
            const object = this.renderableObjects.get(id),
            if(object) {
    
}
                this._removeFromGrid(object); }
                object.bounds = { ...newBounds,
                this._assignToGrid(object),
                
                // Invalidate cached visibility
                this.visibilityCache.delete(id),'} catch (error) {
            this.errorHandler.logError('Failed to update object in culler', error) }
    }
    
    /**
     * Perform culling for current frame
     */
    cullObjects(): string[] { if (!this.enabled) {
            return Array.from(this.renderableObjects.keys() }
        
        const startTime = performance.now();
        const visibleObjects: string[] = [],
        
        try { this.culledObjects.clear(),
            
            // Use spatial grid for efficient culling
            const relevantCells = this._getRelevantGridCells(),
            const objectsToCheck = new Set<string>(),
            
            // Collect objects from relevant grid cells
            for (const cellKey of relevantCells) {
                const cell = this.spatialGrid.get(cellKey),
                if (cell) {
                    for (const objectId of cell) {
            }
                        objectsToCheck.add(objectId); }
}
            }
            
            // Perform visibility test on collected objects
            for (const objectId of objectsToCheck) {
                const object = this.renderableObjects.get(objectId),
                if(object && this._isVisible(object) {
                    object.visible = true }
                    visibleObjects.push(objectId); }
                } else if (object) { object.visible = false,
                    this.culledObjects.add(objectId) }
            }
            
            // Update statistics
            this.stats.totalObjects = this.renderableObjects.size;
            this.stats.culledObjects = this.culledObjects.size;
            this.stats.cullingEfficiency = this.stats.totalObjects > 0 ? undefined : undefined
                this.stats.culledObjects / this.stats.totalObjects: 0,
            
            const endTime = performance.now();
            this.stats.cullingTime = endTime - startTime;
            
            // Track performance history
            this._trackPerformance();
            
            return visibleObjects;

        } catch (error) {
            this.errorHandler.logError('Failed to cull objects', error),
            return Array.from(this.renderableObjects.keys(),
    
    /**
     * Check if specific object is visible
     */
    isObjectVisible(id: string): boolean { const object = this.renderableObjects.get(id),
        return object ? object.visible: false 
    /**
     * Get all visible objects
     */
    getVisibleObjects(): VisibleObjectData[] { const visible: VisibleObjectData[] = [],
        for(const [id, object] of this.renderableObjects) {
            if (object.visible) {
        }
                visible.push({ id, bounds: object.bounds, metadata: object.metadata  }
        }
        return visible;
    }
    
    /**
     * Get culling statistics
     */
    getStats(): CullingStats {
        return { ...this.stats }
    
    /**
     * Reset culling statistics
     */
    resetStats(): void { this.stats = {
            totalObjects: 0,
            culledObjects: 0,
            cullingEfficiency: 0,
            renderTime: 0,
    cullingTime: 0 };
        this.performanceHistory = [];
    }
    
    // Private methods
    
    /**
     * Test if object is visible within frustum
     */
    private _isVisible(object: RenderableObject): boolean { const bounds = object.bounds,
        
        // Check frustum intersection
        return !(bounds.x + bounds.width < this.frustum.left ||,
                bounds.x > this.frustum.right ||,
                bounds.y + bounds.height < this.frustum.top ||,
                bounds.y > this.frustum.bottom) }
    
    /**
     * Assign object to spatial grid cells
     */
    private _assignToGrid(object: RenderableObject): void { const bounds = object.bounds,
        const startX = Math.floor(bounds.x / this.gridSize),
        const startY = Math.floor(bounds.y / this.gridSize),
        const endX = Math.floor((bounds.x + bounds.width) / this.gridSize),
        const endY = Math.floor((bounds.y + bounds.height) / this.gridSize),
        
        for(let, x = startX, x <= endX, x++) {
    
}
            for (let, y = startY; y <= endY; y++) { }
                const cellKey = `${x},${y}`;
                
                if(!this.spatialGrid.has(cellKey) { this.spatialGrid.set(cellKey, new Set<string>() }
                
                this.spatialGrid.get(cellKey)!.add(object.id);
                object.gridCells.add(cellKey);
            }
}
    
    /**
     * Remove object from spatial grid cells
     */
    private _removeFromGrid(object: RenderableObject): void { for (const cellKey of object.gridCells) {
            const cell = this.spatialGrid.get(cellKey),
            if(cell) {
                cell.delete(object.id),
                if (cell.size === 0) {
            }
                    this.spatialGrid.delete(cellKey); }
}
        }
        object.gridCells.clear();
    }
    
    /**
     * Get grid cells relevant to current viewport
     */
    private _getRelevantGridCells(): Set<string> { const cells = new Set<string>(),
        const viewport = this.frustum,
        
        const startX = Math.floor(viewport.left / this.gridSize),
        const startY = Math.floor(viewport.top / this.gridSize),
        const endX = Math.floor(viewport.right / this.gridSize),
        const endY = Math.floor(viewport.bottom / this.gridSize),
        
        for(let, x = startX, x <= endX, x++) {
    
}
            for (let, y = startY; y <= endY; y++) { }
                cells.add(`${x},${y}`});
            }
        }
        
        return cells;
    }
    
    /**
     * Update spatial grid when viewport changes
     */
    private _updateSpatialGrid(): void { // Grid is dynamically managed, no need to pre-populate }
    
    /**
     * Track performance metrics
     */
    private _trackPerformance(): void { const entry: PerformanceEntry = {
            timestamp: Date.now(),
            cullingTime: this.stats.cullingTime,
            cullingEfficiency: this.stats.cullingEfficiency,
            totalObjects: this.stats.totalObjects,
    culledObjects: this.stats.culledObjects };
        this.performanceHistory.push(entry);
        
        if(this.performanceHistory.length > this.historySize) {
        ',

            ' }

            this.performanceHistory.shift() }'