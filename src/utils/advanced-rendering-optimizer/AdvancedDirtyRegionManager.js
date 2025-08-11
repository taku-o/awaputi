import { getErrorHandler } from '../ErrorHandler.js';

/**
 * Dirty Region Management System
 * ダーティリージョン管理システム - 効率的な部分再描画のための領域管理
 */
export class AdvancedDirtyRegionManager {
    constructor(config = {}) {
        this.errorHandler = getErrorHandler();
        
        // Region management state
        this.enabled = config.enabled !== undefined ? config.enabled : true;
        this.regions = new Set();
        this.mergedRegions = [];
        this.frameRegions = new Map();
        
        // Region optimization parameters
        this.minRegionSize = config.minRegionSize || 32;
        this.maxRegionCount = config.maxRegionCount || 8;
        this.mergeThreshold = config.mergeThreshold || 0.3;
        this.expansionFactor = config.expansionFactor || 1.1;
        
        // Region tracking
        this.regionHistory = [];
        this.historySize = config.historySize || 30;
        this.hotspots = new Map();
        
        // Optimization statistics
        this.stats = {
            totalRegions: 0,
            mergedRegions: 0,
            skippedRedraws: 0,
            pixelsSaved: 0,
            performanceGain: 0
        };
    }
    
    /**
     * Add dirty region to be redrawn
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate  
     * @param {number} width - Width of region
     * @param {number} height - Height of region
     */
    addDirtyRegion(x, y, width, height) {
        if (!this.enabled) return;
        
        try {
            // Expand region by expansion factor to reduce edge effects
            const expandedWidth = Math.ceil(width * this.expansionFactor);
            const expandedHeight = Math.ceil(height * this.expansionFactor);
            const expandedX = Math.floor(x - (expandedWidth - width) / 2);
            const expandedY = Math.floor(y - (expandedHeight - height) / 2);
            
            // Ensure minimum region size
            const finalWidth = Math.max(expandedWidth, this.minRegionSize);
            const finalHeight = Math.max(expandedHeight, this.minRegionSize);
            
            const region = {
                x: expandedX,
                y: expandedY,
                width: finalWidth,
                height: finalHeight,
                timestamp: Date.now(),
                frame: this._getCurrentFrame()
            };
            
            this.regions.add(region);
            this.stats.totalRegions++;
            
            // Track hotspots
            this._trackHotspot(expandedX, expandedY, finalWidth, finalHeight);
            
        } catch (error) {
            this.errorHandler.logError('Failed to add dirty region', error);
        }
    }
    
    /**
     * Merge overlapping dirty regions
     * @returns {Array} Array of merged regions
     */
    mergeRegions() {
        if (!this.enabled || this.regions.size === 0) {
            return [];
        }
        
        try {
            const regionsArray = Array.from(this.regions);
            const merged = [];
            const processed = new Set();
            
            for (let i = 0; i < regionsArray.length; i++) {
                if (processed.has(i)) continue;
                
                let currentRegion = { ...regionsArray[i] };
                processed.add(i);
                
                // Find overlapping regions
                for (let j = i + 1; j < regionsArray.length; j++) {
                    if (processed.has(j)) continue;
                    
                    const overlap = this._calculateOverlap(currentRegion, regionsArray[j]);
                    const unionArea = this._calculateUnionArea(currentRegion, regionsArray[j]);
                    const overlapRatio = overlap / unionArea;
                    
                    if (overlapRatio > this.mergeThreshold) {
                        currentRegion = this._mergeRegions(currentRegion, regionsArray[j]);
                        processed.add(j);
                        this.stats.mergedRegions++;
                    }
                }
                
                merged.push(currentRegion);
                
                // Limit number of regions
                if (merged.length >= this.maxRegionCount) {
                    break;
                }
            }
            
            this.mergedRegions = merged;
            return merged;
            
        } catch (error) {
            this.errorHandler.logError('Failed to merge regions', error);
            return Array.from(this.regions);
        }
    }
    
    /**
     * Clear all dirty regions
     */
    clearRegions() {
        try {
            // Store regions in history
            if (this.regions.size > 0) {
                this.regionHistory.push({
                    frame: this._getCurrentFrame(),
                    regions: Array.from(this.regions),
                    timestamp: Date.now()
                });
                
                // Limit history size
                if (this.regionHistory.length > this.historySize) {
                    this.regionHistory.shift();
                }
            }
            
            this.regions.clear();
            this.mergedRegions = [];
            
        } catch (error) {
            this.errorHandler.logError('Failed to clear regions', error);
        }
    }
    
    /**
     * Get current dirty regions
     * @returns {Array} Current dirty regions
     */
    getCurrentRegions() {
        return Array.from(this.regions);
    }
    
    /**
     * Get merged regions
     * @returns {Array} Merged regions
     */
    getMergedRegions() {
        return this.mergedRegions;
    }
    
    /**
     * Check if point is in any dirty region
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} True if point is dirty
     */
    isPointDirty(x, y) {
        for (const region of this.regions) {
            if (x >= region.x && x < region.x + region.width &&
                y >= region.y && y < region.y + region.height) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Get performance statistics
     * @returns {object} Performance stats
     */
    getStats() {
        return { ...this.stats };
    }
    
    /**
     * Get hotspot information
     * @returns {Array} Hotspot regions
     */
    getHotspots() {
        return Array.from(this.hotspots.entries()).map(([key, count]) => {
            const [x, y] = key.split(',').map(Number);
            return { x, y, count };
        });
    }
    
    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            totalRegions: 0,
            mergedRegions: 0,
            skippedRedraws: 0,
            pixelsSaved: 0,
            performanceGain: 0
        };
    }
    
    // Private methods
    
    /**
     * Calculate overlap area between two regions
     * @private
     */
    _calculateOverlap(region1, region2) {
        const x1 = Math.max(region1.x, region2.x);
        const y1 = Math.max(region1.y, region2.y);
        const x2 = Math.min(region1.x + region1.width, region2.x + region2.width);
        const y2 = Math.min(region1.y + region1.height, region2.y + region2.height);
        
        if (x2 <= x1 || y2 <= y1) return 0;
        return (x2 - x1) * (y2 - y1);
    }
    
    /**
     * Calculate union area of two regions
     * @private
     */
    _calculateUnionArea(region1, region2) {
        const area1 = region1.width * region1.height;
        const area2 = region2.width * region2.height;
        const overlap = this._calculateOverlap(region1, region2);
        return area1 + area2 - overlap;
    }
    
    /**
     * Merge two regions into one
     * @private
     */
    _mergeRegions(region1, region2) {
        const x = Math.min(region1.x, region2.x);
        const y = Math.min(region1.y, region2.y);
        const right = Math.max(region1.x + region1.width, region2.x + region2.width);
        const bottom = Math.max(region1.y + region1.height, region2.y + region2.height);
        
        return {
            x,
            y,
            width: right - x,
            height: bottom - y,
            timestamp: Math.max(region1.timestamp, region2.timestamp),
            frame: Math.max(region1.frame, region2.frame)
        };
    }
    
    /**
     * Track frequently dirty areas (hotspots)
     * @private
     */
    _trackHotspot(x, y, width, height) {
        const gridSize = 64; // Grid size for hotspot tracking
        const gridX = Math.floor(x / gridSize) * gridSize;
        const gridY = Math.floor(y / gridSize) * gridSize;
        const key = `${gridX},${gridY}`;
        
        this.hotspots.set(key, (this.hotspots.get(key) || 0) + 1);
    }
    
    /**
     * Get current frame number
     * @private
     */
    _getCurrentFrame() {
        // Simple frame counter
        return Math.floor(Date.now() / 16.67); // Approximate frame at 60fps
    }
}