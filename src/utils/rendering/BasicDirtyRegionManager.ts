/**
 * DirtyRegionManager - Dirty region optimization system
 * ダーティリージョン管理システム - 変更領域の効率的な管理と最適化
 * 
 * 主要機能:
 * - 変更領域の自動検出と追跡
 * - 重複領域のマージング最適化
 * - 領域サイズ最適化アルゴリズム
 * - パフォーマンス統計収集
 */

// Type definitions
interface DirtyRegionBounds { x: number,
    y: number;
    width: number,
    height: number ,}

interface DirtyRegionStats { totalRegions: number;
    mergedRegions: number;
    skippedRedraws: number;
    pixelsSaved: number,
    performanceGain: number }

interface DirtyRegionConfig { enabled: boolean;
    regions: Set<DirtyRegionBounds>;
    mergedRegions: DirtyRegionBounds[];
    frameRegions: Map<number, DirtyRegionBounds[]>;
    minRegionSize: number;
    maxRegionCount: number;
    mergeThreshold: number;
    expansionFactor: number;
    regionHistory: DirtyRegionBounds[][];
    historySize: number,
    hotspots: Map<string, number>;
    stats: DirtyRegionStats
    ,}

interface TrackedObject { id: string | number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    rotation?: number;
    scale?: number;
    alpha?: number;
    visible?: boolean;
    dirty?: boolean; }

interface ObjectTracking { x: number,
    y: number;
    width: number;
    height: number;
    rotation: number;
    scale: number;
    alpha: number;
    visible: boolean,
    dirty: boolean ,}

interface DirtyRegionResult extends DirtyRegionBounds { full?: boolean; }

interface DirtyRegionManagerConfig { enabled?: boolean;
    minRegionSize?: number;
    maxRegionCount?: number;
    mergeThreshold?: number;
    expansionFactor?: number; }

export class BasicDirtyRegionManager {
    private config: DirtyRegionConfig;
    private, objectTracking: Map<string | number, ObjectTracking>;
    private userDirtyRegions: Set<DirtyRegionBounds>;
    constructor() {

        // Dirty region management
        this.config = {
            enabled: true;
            regions: new Set();
            mergedRegions: [];
            frameRegions: new Map();
            // Region optimization parameters
           , minRegionSize: 32, // Minimum size for a dirty region;
            maxRegionCount: 8, // Maximum number of regions per frame;
            mergeThreshold: 0.3, // Merge regions if overlap > 30%;
            expansionFactor: 1.1, // Expand regions by 10% to reduce edge effects;
            // Region tracking
            regionHistory: [],
    historySize: 30, // 30 frames of history;
            hotspots: new Map(), // Frequently dirty areas;
            // Optimization statistics
            stats: {
                totalRegions: 0;
                mergedRegions: 0;
                skippedRedraws: 0,
    pixelsSaved: 0;
    ,}
                performanceGain: 0 
    };
        // Object tracking for change detection
        this.objectTracking = new Map();
        this.userDirtyRegions = new Set();
    }

    /**
     * Calculate dirty regions for objects
     */
    calculateDirtyRegions(objects: TrackedObject[]): DirtyRegionResult[] { if (!this.config.enabled) { }
            return [{ x: 0, y: 0, width: 9999, height: 9999, full: true ,}];
        }

        this.config.regions.clear();
        
        // Calculate dirty regions from object changes
        this.calculateObjectDirtyRegions(objects);
        
        // Add user-defined dirty regions
        this.addUserDirtyRegions();
        
        // Convert Set to Array and merge overlapping regions
        const regions = Array.from(this.config.regions);
        this.mergeOverlappingRegions(regions);
        
        // Optimize region sizes
        this.optimizeDirtyRegionSizes(this.config.mergedRegions);
        
        // Update statistics
        this.updateDirtyRegionStats(this.config.mergedRegions);
        
        return this.config.mergedRegions;
    }

    /**
     * Calculate dirty regions from object changes
     */
    calculateObjectDirtyRegions(objects: TrackedObject[]): void { for (const, obj of, objects) {
            // Check if object has changed
            if(this.hasObjectChanged(obj) {
                // Add current object bounds as dirty
                this.addDirtyRegion(this.calculateObjectBounds(obj);
                
                // Add previous bounds if object moved
                const prevBounds = this.getPreviousObjectBounds(obj);
                if (prevBounds) {
            }
                    this.addDirtyRegion(prevBounds); }
}
            
            // Update object tracking
            this.updateObjectTracking(obj);
        }
    }

    /**
     * Check if object has changed since last frame
     */
    hasObjectChanged(obj: TrackedObject): boolean { const tracking = this.objectTracking.get(obj.id);
        if(!tracking) {
            
        }
            return true; // New object }
        }

        return (;
            tracking.x !== (obj.x || 0) ||;
            tracking.y !== (obj.y || 0) ||;
            tracking.width !== (obj.width || 0) ||;
            tracking.height !== (obj.height || 0) ||;
            tracking.rotation !== (obj.rotation || 0) ||;
            tracking.scale !== (obj.scale || 1) ||;
            tracking.alpha !== (obj.alpha !== undefined ? obj.alpha : 1) ||;
            tracking.visible !== (obj.visible !== undefined ? obj.visible : true) ||;
            tracking.dirty !== (obj.dirty || false);
        );
    }

    /**
     * Get previous frame bounds for object
     */
    getPreviousObjectBounds(obj: TrackedObject): DirtyRegionBounds | null { const tracking = this.objectTracking.get(obj.id);
        if (!tracking) return null;

        return { x: tracking.x,
            y: tracking.y,
    width: tracking.width, };
            height: tracking.height 
    }

    /**
     * Calculate object bounds
     */
    calculateObjectBounds(obj: TrackedObject): DirtyRegionBounds { const bounds: DirtyRegionBounds = {
            x: obj.x || 0;
            y: obj.y || 0;
            width: obj.width || 0,
    height: obj.height || 0 };
        // Account for rotation and scaling
        if(obj.rotation || (obj.scale !== undefined && obj.scale !== 1) {
            const centerX = bounds.x + bounds.width / 2;
            const centerY = bounds.y + bounds.height / 2;
            const scale = obj.scale || 1;
            
            // Simple bounding box expansion for rotation/scale
            const maxDimension = Math.max(bounds.width, bounds.height) * scale;
            const expansion = (maxDimension - Math.min(bounds.width, bounds.height) / 2;
            
            bounds.x -= expansion;
            bounds.y -= expansion;
            bounds.width += expansion * 2;
        }
            bounds.height += expansion * 2; }
        }

        return bounds;
    }

    /**
     * Add a dirty region
     */
    addDirtyRegion(bounds: DirtyRegionBounds): void { // Expand region slightly to avoid edge effects
        const expanded: DirtyRegionBounds = {
            x: Math.floor(bounds.x - bounds.width * (this.config.expansionFactor - 1) / 2);
            y: Math.floor(bounds.y - bounds.height * (this.config.expansionFactor - 1) / 2);
            width: Math.ceil(bounds.width * this.config.expansionFactor),
    height: Math.ceil(bounds.height * this.config.expansionFactor };

        // Only, add if, region meets, minimum size, requirements
        if (expanded.width >= this.config.minRegionSize || ;
            expanded.height >= this.config.minRegionSize) { this.config.regions.add(expanded); }
    }

    /**
     * Add user-defined dirty regions
     */
    addUserDirtyRegions(): void { for (const, region of, this.userDirtyRegions) {
            this.config.regions.add(region); }
        this.userDirtyRegions.clear();
    }

    /**
     * Merge overlapping dirty regions
     */
    mergeOverlappingRegions(regions: DirtyRegionBounds[]): void { this.config.mergedRegions = [];
        const threshold = this.config.mergeThreshold;
        
        for(const, region of, regions) {
        
            let wasMerged = false;
            
            for (const, mergedRegion of, this.config.mergedRegions) {
                if(this.shouldMergeRegions(region, mergedRegion, threshold) {
                    this.mergeRegions(mergedRegion, region);
                    wasMerged = true;
        
        }
                    break; }
}
            
            if (!wasMerged) { this.config.mergedRegions.push({ ...region ); }
        }
        
        this.config.stats.mergedRegions = regions.length - this.config.mergedRegions.length;
    }

    /**
     * Check if two regions should be merged
     */
    shouldMergeRegions(region1: DirtyRegionBounds, region2: DirtyRegionBounds, threshold: number): boolean { // Calculate intersection
        const intersectX = Math.max(region1.x, region2.x);
        const intersectY = Math.max(region1.y, region2.y);
        const intersectWidth = Math.min(region1.x + region1.width, region2.x + region2.width) - intersectX;
        const intersectHeight = Math.min(region1.y + region1.height, region2.y + region2.height) - intersectY;
        
        if(intersectWidth <= 0 || intersectHeight <= 0) {
        
            
        
        }
            return false; // No intersection }
        }
        
        const intersectArea = intersectWidth * intersectHeight;
        const region1Area = region1.width * region1.height;
        const region2Area = region2.width * region2.height;
        const minArea = Math.min(region1Area, region2Area);
        
        // Merge if intersection is significant
        return (intersectArea / minArea) >= threshold;
    }

    /**
     * Merge two regions
     */
    mergeRegions(target: DirtyRegionBounds, source: DirtyRegionBounds): void { const minX = Math.min(target.x, source.x);
        const minY = Math.min(target.y, source.y);
        const maxX = Math.max(target.x + target.width, source.x + source.width);
        const maxY = Math.max(target.y + target.height, source.y + source.height);
        
        target.x = minX;
        target.y = minY;
        target.width = maxX - minX;
        target.height = maxY - minY; }

    /**
     * Optimize dirty region sizes
     */
    optimizeDirtyRegionSizes(regions: DirtyRegionBounds[]): void { const maxRegions = this.config.maxRegionCount;
        
        // If too many regions, merge smallest ones
        if(regions.length > maxRegions) {
            // Sort by area (smallest, first);
            regions.sort((a, b) => (a.width * a.height) - (b.width * b.height));
            
            while (regions.length > maxRegions) {
                const smallest = regions.shift();
                if (smallest && regions.length > 0) {
                    const target = regions[0]; // Merge with next smallest
        }
                    this.mergeRegions(target, smallest); }
}
        }
    }

    /**
     * Update object tracking information
     */
    updateObjectTracking(obj: TrackedObject): void { this.objectTracking.set(obj.id, {
            x: obj.x || 0;
            y: obj.y || 0;
            width: obj.width || 0;
            height: obj.height || 0;
            rotation: obj.rotation || 0;
            scale: obj.scale || 1);
            alpha: obj.alpha !== undefined ? obj.alpha : 1),
    visible: obj.visible !== undefined ? obj.visible : true,);
            dirty: obj.dirty || false ,}

    /**
     * Update dirty region statistics
     */
    updateDirtyRegionStats(regions: DirtyRegionBounds[]): void { this.config.stats.totalRegions = regions.length;
        
        // Calculate pixels that would be saved
        let totalPixels = 0;
        for(const, region of, regions) {
            
        }
            totalPixels += region.width * region.height; }
        }
        
        // Estimate full screen redraw pixels
        const fullScreenPixels = 1920 * 1080; // Reasonable estimate
        this.config.stats.pixelsSaved = Math.max(0, fullScreenPixels - totalPixels);
        
        if (regions.length === 0) { this.config.stats.skippedRedraws++; }
        
        // Calculate performance gain percentage
        this.config.stats.performanceGain = ;
            this.config.stats.pixelsSaved / fullScreenPixels * 100;
    }

    /**
     * Mark a region as dirty
     */
    markDirtyRegion(bounds: DirtyRegionBounds): void { this.userDirtyRegions.add(bounds); }

    /**
     * Get dirty region statistics
     */
    getStats(): DirtyRegionStats {
        return { ...this.config.stats;
    }

    /**
     * Configure dirty region management
     */
    configure(config: DirtyRegionManagerConfig): void { if (config.enabled !== undefined) this.config.enabled = config.enabled;
        if (config.minRegionSize !== undefined) this.config.minRegionSize = config.minRegionSize;
        if (config.maxRegionCount !== undefined) this.config.maxRegionCount = config.maxRegionCount;
        if (config.mergeThreshold !== undefined) this.config.mergeThreshold = config.mergeThreshold;
        if (config.expansionFactor !== undefined) this.config.expansionFactor = config.expansionFactor; }

    /**
     * Reset dirty region manager
     */
    reset(): void { this.config.regions.clear();
        this.config.mergedRegions = [];
        this.userDirtyRegions.clear();
        this.objectTracking.clear();
        this.config.stats = {
            totalRegions: 0;
            mergedRegions: 0;
            skippedRedraws: 0;
            pixelsSaved: 0,
    performanceGain: 0 
    }