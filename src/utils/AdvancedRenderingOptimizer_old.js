import { getErrorHandler } from './ErrorHandler.js';
import { getConfigurationManager } from '../core/ConfigurationManager.js';

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
        
        // Dirty region management
        this.dirtyRegionManager = {
            enabled: true,
            regions: new Set(),
            mergedRegions: [],
            frameRegions: new Map(),
            
            // Region optimization parameters
            minRegionSize: 32, // Minimum size for a dirty region
            maxRegionCount: 8, // Maximum number of regions per frame
            mergeThreshold: 0.3, // Merge regions if overlap > 30%
            expansionFactor: 1.1, // Expand regions by 10% to reduce edge effects
            
            // Region tracking
            regionHistory: [],
            historySize: 30, // 30 frames of history
            hotspots: new Map(), // Frequently dirty areas
            
            // Optimization statistics
            stats: {
                totalRegions: 0,
                mergedRegions: 0,
                skippedRedraws: 0,
                pixelsSaved: 0,
                performanceGain: 0
            }
        };
        
        // Viewport culling system
        this.viewportCuller = {
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
        
        // Layer management system
        this.layerManager = {
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
        
        // Performance monitoring
        this.performanceMonitor = {
            enabled: true,
            metrics: {
                frameTime: 0,
                renderTime: 0,
                cullTime: 0,
                compositionTime: 0,
                dirtyRegionTime: 0,
                
                // Efficiency metrics
                renderEfficiency: 1.0,
                cullingEfficiency: 1.0,
                cacheEfficiency: 1.0,
                overallEfficiency: 1.0
            },
            
            // Performance history
            history: [],
            historySize: 60, // 1 second at 60fps
            
            // Adaptive optimization
            adaptiveMode: true,
            performanceTarget: 16.67, // 60fps target
            optimizationTrigger: 20.0, // Trigger optimization at 50fps
            
            // Benchmarking
            baseline: {
                renderTime: 16.67,
                drawCalls: 500,
                pixelsRendered: 0
            }
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
        // Setup viewport
        this.updateViewport();
        
        // Initialize spatial structures
        this.initializeSpatialStructures();
        
        // Setup layer management
        this.initializeLayerManagement();
        
        // Start performance monitoring
        this.startPerformanceMonitoring();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Create baseline measurements
        this.establishPerformanceBaseline();
    }
    
    /**
     * Update viewport dimensions and culling frustum
     */
    updateViewport() {
        const viewport = this.viewportCuller.viewport;
        viewport.width = this.canvas.width;
        viewport.height = this.canvas.height;
        viewport.x = 0;
        viewport.y = 0;
        
        // Update frustum
        const frustum = this.viewportCuller.frustum;
        frustum.left = viewport.x - this.viewportCuller.cullingMargin;
        frustum.right = viewport.x + viewport.width + this.viewportCuller.cullingMargin;
        frustum.top = viewport.y - this.viewportCuller.cullingMargin;
        frustum.bottom = viewport.y + viewport.height + this.viewportCuller.cullingMargin;
        
        console.log('[AdvancedRenderingOptimizer] Viewport updated:', viewport);
    }
    
    /**
     * Initialize spatial data structures
     */
    initializeSpatialStructures() {
        // Initialize spatial grid for culling
        this.rebuildSpatialGrid();
        
        // Initialize quadtree if enabled
        if (this.spatialOptimizer.partitioning.method === 'quadtree') {
            this.initializeQuadTree();
        }
        
        console.log('[AdvancedRenderingOptimizer] Spatial structures initialized');
    }
    
    /**
     * Rebuild spatial grid for viewport culling
     */
    rebuildSpatialGrid() {
        this.viewportCuller.spatialGrid.clear();
        
        const gridSize = this.viewportCuller.gridSize;
        const viewport = this.viewportCuller.viewport;
        
        // Create grid cells covering viewport area + margin
        const margin = this.viewportCuller.cullingMargin * 2;
        const startX = Math.floor((viewport.x - margin) / gridSize) * gridSize;
        const startY = Math.floor((viewport.y - margin) / gridSize) * gridSize;
        const endX = Math.ceil((viewport.x + viewport.width + margin) / gridSize) * gridSize;
        const endY = Math.ceil((viewport.y + viewport.height + margin) / gridSize) * gridSize;
        
        for (let x = startX; x < endX; x += gridSize) {
            for (let y = startY; y < endY; y += gridSize) {
                const key = `${x},${y}`;
                this.viewportCuller.spatialGrid.set(key, new Set());
            }
        }
    }
    
    /**
     * Initialize QuadTree for spatial partitioning
     */
    initializeQuadTree() {
        const viewport = this.viewportCuller.viewport;
        const margin = this.viewportCuller.cullingMargin * 2;
        
        this.spatialOptimizer.quadTree = new QuadTree({
            x: viewport.x - margin,
            y: viewport.y - margin,
            width: viewport.width + margin * 2,
            height: viewport.height + margin * 2
        }, this.spatialOptimizer.partitioning.maxObjectsPerNode, this.spatialOptimizer.partitioning.maxDepth);
    }
    
    /**
     * Initialize layer management system
     */
    initializeLayerManagement() {
        // Create default layers
        this.createLayer('background', 0, { static: true, cacheable: true });
        this.createLayer('game', 1, { static: false, cacheable: false });
        this.createLayer('ui', 2, { static: true, cacheable: true });
        this.createLayer('overlay', 3, { static: false, cacheable: false });
        
        console.log('[AdvancedRenderingOptimizer] Layer management initialized');
    }
    
    /**
     * Create a rendering layer
     * @param {string} name - Layer name
     * @param {number} order - Rendering order (lower = rendered first)
     * @param {object} properties - Layer properties
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
        
        this.layerManager.layers.set(name, layer);
        this.layerManager.layerOrder.push(name);
        this.layerManager.layerOrder.sort((a, b) => 
            this.layerManager.layers.get(a).order - this.layerManager.layers.get(b).order);
        
        // Track layer type
        if (layer.static) {
            this.layerManager.staticLayers.add(name);
        } else {
            this.layerManager.dynamicLayers.add(name);
        }
        
        console.log(`[AdvancedRenderingOptimizer] Layer created: ${name} (order: ${order})`);
    }
    
    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        if (!this.performanceMonitor.enabled) return;
        
        // Monitor rendering performance every frame
        this.performanceInterval = setInterval(() => {
            this.updatePerformanceMetrics();
            this.optimizeBasedOnPerformance();
        }, 16); // ~60fps monitoring
        
        console.log('[AdvancedRenderingOptimizer] Performance monitoring started');
    }
    
    /**
     * Establish performance baseline
     */
    establishPerformanceBaseline() {
        // This would normally run a series of benchmark tests
        // For now, we'll use reasonable defaults
        
        const baseline = this.performanceMonitor.baseline;
        baseline.renderTime = 10.0; // 10ms baseline render time
        baseline.drawCalls = 300; // 300 draw calls baseline
        baseline.pixelsRendered = this.canvas.width * this.canvas.height;
        
        console.log('[AdvancedRenderingOptimizer] Performance baseline established:', baseline);
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
            const visibleObjects = this.performViewportCulling(preparedObjects);
            
            // 3. Calculate dirty regions
            this.renderingPipeline.currentStage = 'sort';
            const dirtyRegions = this.calculateDirtyRegions(visibleObjects);
            
            // 4. Optimize layer composition
            this.renderingPipeline.currentStage = 'batch';
            const layerBatches = this.optimizeLayerComposition(visibleObjects);
            
            // 5. Execute optimized rendering
            this.renderingPipeline.currentStage = 'render';
            const renderResult = this.executeOptimizedRendering(layerBatches, dirtyRegions);
            
            // 6. Final composition
            this.renderingPipeline.currentStage = 'compose';
            this.performFinalComposition(renderResult);
            
            // Update performance metrics
            const totalTime = performance.now() - startTime;
            this.updateRenderingPerformance(totalTime, renderObjects.length);
            
            this.renderingPipeline.currentStage = 'idle';
            
            return {
                success: true,
                renderTime: totalTime,
                objectsRendered: visibleObjects.length,
                objectsCulled: renderObjects.length - visibleObjects.length,
                dirtyRegions: dirtyRegions.length,
                performanceGain: this.calculatePerformanceGain()
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
                preparedObj.screenX = obj.x - camera.x;
                preparedObj.screenY = obj.y - camera.y;
                preparedObj.screenScale = obj.scale * camera.zoom;
            } else {
                preparedObj.screenX = obj.x;
                preparedObj.screenY = obj.y;
                preparedObj.screenScale = obj.scale || 1;
            }
            
            // Calculate bounding box
            preparedObj.bounds = this.calculateObjectBounds(preparedObj);
            
            // Assign to layer
            preparedObj.layer = obj.layer || 'game';
            
            // Calculate render priority
            preparedObj.priority = this.calculateRenderPriority(preparedObj);
            
            return preparedObj;
        });
        
        // Sort by render priority (depth, layer, material, etc.)
        prepared.sort((a, b) => a.priority - b.priority);
        
        const stageTime = performance.now() - stageStart;
        this.renderingPipeline.stageTimings.set('prepare', stageTime);
        
        return prepared;
    }
    
    /**
     * Calculate object bounding box
     * @param {object} obj - Render object
     * @returns {object} Bounding box
     */
    calculateObjectBounds(obj) {
        const width = (obj.width || 32) * obj.screenScale;
        const height = (obj.height || 32) * obj.screenScale;
        
        return {
            x: obj.screenX - width / 2,
            y: obj.screenY - height / 2,
            width: width,
            height: height,
            right: obj.screenX + width / 2,
            bottom: obj.screenY + height / 2
        };
    }
    
    /**
     * Calculate render priority for sorting
     * @param {object} obj - Render object
     * @returns {number} Priority value (lower = rendered first)
     */
    calculateRenderPriority(obj) {
        const layer = this.layerManager.layers.get(obj.layer);
        const layerPriority = layer ? layer.order * 1000 : 1000;
        const depthPriority = (obj.depth || 0) * 100;
        const materialPriority = this.getMaterialPriority(obj.material || 'default');
        
        return layerPriority + depthPriority + materialPriority;
    }
    
    /**
     * Get material priority for batching optimization
     * @param {string} material - Material type
     * @returns {number} Material priority
     */
    getMaterialPriority(material) {
        const priorities = {
            'default': 0,
            'sprite': 1,
            'particle': 2,
            'ui': 3,
            'text': 4
        };
        
        return priorities[material] || 0;
    }
    
    /**
     * Perform viewport culling on objects
     * @param {Array} objects - Prepared render objects
     * @returns {Array} Visible objects after culling
     */
    performViewportCulling(objects) {
        const cullStart = performance.now();
        
        if (!this.viewportCuller.enabled) {
            return objects;
        }
        
        const frustum = this.viewportCuller.frustum;
        const visibleObjects = [];
        const culledObjects = [];
        
        // Clear previous spatial grid assignments
        this.viewportCuller.spatialGrid.forEach(cell => cell.clear());
        
        for (const obj of objects) {
            const bounds = obj.bounds;
            
            // Frustum culling test
            const isVisible = this.isObjectInFrustum(bounds, frustum);
            
            if (isVisible) {
                visibleObjects.push(obj);
                
                // Add to spatial grid
                this.addObjectToSpatialGrid(obj);
                
                // Update visibility cache
                this.viewportCuller.visibilityCache.set(obj.id, true);
            } else {
                culledObjects.push(obj);
                this.viewportCuller.visibilityCache.set(obj.id, false);
            }
        }
        
        // Update culling statistics
        const stats = this.viewportCuller.stats;
        stats.totalObjects = objects.length;
        stats.culledObjects = culledObjects.length;
        stats.cullingEfficiency = culledObjects.length / objects.length;
        stats.processingTime = performance.now() - cullStart;
        
        this.renderingPipeline.stageTimings.set('cull', stats.processingTime);
        
        console.log(`[AdvancedRenderingOptimizer] Culling: ${culledObjects.length}/${objects.length} objects culled (${(stats.cullingEfficiency * 100).toFixed(1)}%)`);
        
        return visibleObjects;
    }
    
    /**
     * Test if object bounds are within frustum
     * @param {object} bounds - Object bounding box
     * @param {object} frustum - View frustum
     * @returns {boolean} True if object is visible
     */
    isObjectInFrustum(bounds, frustum) {
        return !(bounds.right < frustum.left || 
                 bounds.x > frustum.right || 
                 bounds.bottom < frustum.top || 
                 bounds.y > frustum.bottom);
    }
    
    /**
     * Add object to spatial grid for fast lookup
     * @param {object} obj - Render object
     */
    addObjectToSpatialGrid(obj) {
        const gridSize = this.viewportCuller.gridSize;
        const bounds = obj.bounds;
        
        // Calculate grid cells the object overlaps
        const startX = Math.floor(bounds.x / gridSize) * gridSize;
        const endX = Math.floor(bounds.right / gridSize) * gridSize;
        const startY = Math.floor(bounds.y / gridSize) * gridSize;
        const endY = Math.floor(bounds.bottom / gridSize) * gridSize;
        
        for (let x = startX; x <= endX; x += gridSize) {
            for (let y = startY; y <= endY; y += gridSize) {
                const key = `${x},${y}`;
                const cell = this.viewportCuller.spatialGrid.get(key);
                if (cell) {
                    cell.add(obj);
                }
            }
        }
    }
    
    /**
     * Calculate dirty regions for optimized rendering
     * @param {Array} objects - Visible objects
     * @returns {Array} Dirty regions to render
     */
    calculateDirtyRegions(objects) {
        const regionStart = performance.now();
        
        if (!this.dirtyRegionManager.enabled) {
            // Return full screen as single dirty region
            return [{
                x: 0, y: 0,
                width: this.canvas.width,
                height: this.canvas.height,
                full: true
            }];
        }
        
        // Clear previous regions
        this.dirtyRegionManager.regions.clear();
        
        // Calculate regions from object movement and changes
        this.calculateObjectDirtyRegions(objects);
        
        // Add user-defined dirty regions
        this.addUserDirtyRegions();
        
        // Merge overlapping regions
        const mergedRegions = this.mergeOverlappingRegions();
        
        // Optimize region sizes
        const optimizedRegions = this.optimizeDirtyRegionSizes(mergedRegions);
        
        // Update statistics
        this.updateDirtyRegionStats(optimizedRegions);
        
        const regionTime = performance.now() - regionStart;
        this.renderingPipeline.stageTimings.set('dirtyRegions', regionTime);
        
        console.log(`[AdvancedRenderingOptimizer] Dirty regions: ${optimizedRegions.length} regions calculated`);
        
        return optimizedRegions;
    }
    
    /**
     * Calculate dirty regions from object changes
     * @param {Array} objects - Visible objects
     */
    calculateObjectDirtyRegions(objects) {
        for (const obj of objects) {
            // Check if object has moved or changed
            if (this.hasObjectChanged(obj)) {
                // Add previous position as dirty (to clear old render)
                const prevBounds = this.getPreviousObjectBounds(obj);
                if (prevBounds) {
                    this.addDirtyRegion(prevBounds);
                }
                
                // Add current position as dirty (to render new position)
                this.addDirtyRegion(obj.bounds);
                
                // Update object tracking
                this.updateObjectTracking(obj);
            }
        }
    }
    
    /**
     * Check if object has changed since last frame
     * @param {object} obj - Render object
     * @returns {boolean} True if object changed
     */
    hasObjectChanged(obj) {
        const tracking = this.dirtyRegionManager.frameRegions.get(obj.id);
        
        if (!tracking) {
            // First time seeing this object
            return true;
        }
        
        const bounds = obj.bounds;
        const prevBounds = tracking.bounds;
        
        // Check position, size, or visual properties
        return bounds.x !== prevBounds.x ||
               bounds.y !== prevBounds.y ||
               bounds.width !== prevBounds.width ||
               bounds.height !== prevBounds.height ||
               obj.rotation !== tracking.rotation ||
               obj.alpha !== tracking.alpha ||
               obj.frame !== tracking.frame;
    }
    
    /**
     * Get previous object bounds
     * @param {object} obj - Render object
     * @returns {object|null} Previous bounds
     */
    getPreviousObjectBounds(obj) {
        const tracking = this.dirtyRegionManager.frameRegions.get(obj.id);
        return tracking ? tracking.bounds : null;
    }
    
    /**
     * Add a dirty region
     * @param {object} bounds - Region bounds
     */
    addDirtyRegion(bounds) {
        const minSize = this.dirtyRegionManager.minRegionSize;
        
        // Ensure minimum size
        const width = Math.max(bounds.width, minSize);
        const height = Math.max(bounds.height, minSize);
        
        // Expand region slightly to reduce edge artifacts
        const expansion = this.dirtyRegionManager.expansionFactor;
        const expandedWidth = width * expansion;
        const expandedHeight = height * expansion;
        
        const region = {
            x: Math.max(0, bounds.x - (expandedWidth - width) / 2),
            y: Math.max(0, bounds.y - (expandedHeight - height) / 2),
            width: Math.min(expandedWidth, this.canvas.width),
            height: Math.min(expandedHeight, this.canvas.height)
        };
        
        region.right = region.x + region.width;
        region.bottom = region.y + region.height;
        
        this.dirtyRegionManager.regions.add(region);
    }
    
    /**
     * Add user-defined dirty regions
     */
    addUserDirtyRegions() {
        // This would be called by external systems to mark regions as dirty
        // For now, we'll check for any manually marked regions
        
        // Example: UI updates, particle effects, etc. could add regions here
    }
    
    /**
     * Merge overlapping dirty regions
     * @returns {Array} Merged regions
     */
    mergeOverlappingRegions() {
        const regions = Array.from(this.dirtyRegionManager.regions);
        const merged = [];
        const threshold = this.dirtyRegionManager.mergeThreshold;
        
        for (const region of regions) {
            let wasMerged = false;
            
            // Try to merge with existing merged regions
            for (const mergedRegion of merged) {
                if (this.shouldMergeRegions(region, mergedRegion, threshold)) {
                    this.mergeRegions(mergedRegion, region);
                    wasMerged = true;
                    break;
                }
            }
            
            if (!wasMerged) {
                merged.push({ ...region });
            }
        }
        
        // Update statistics
        this.dirtyRegionManager.stats.totalRegions = regions.length;
        this.dirtyRegionManager.stats.mergedRegions = regions.length - merged.length;
        
        return merged;
    }
    
    /**
     * Determine if two regions should be merged
     * @param {object} region1 - First region
     * @param {object} region2 - Second region
     * @param {number} threshold - Merge threshold
     * @returns {boolean} True if regions should be merged
     */
    shouldMergeRegions(region1, region2, threshold) {
        // Calculate overlap area
        const overlapX = Math.max(0, Math.min(region1.right, region2.right) - Math.max(region1.x, region2.x));
        const overlapY = Math.max(0, Math.min(region1.bottom, region2.bottom) - Math.max(region1.y, region2.y));
        const overlapArea = overlapX * overlapY;
        
        // Calculate combined area if merged
        const mergedX = Math.min(region1.x, region2.x);
        const mergedY = Math.min(region1.y, region2.y);
        const mergedRight = Math.max(region1.right, region2.right);
        const mergedBottom = Math.max(region1.bottom, region2.bottom);
        const mergedArea = (mergedRight - mergedX) * (mergedBottom - mergedY);
        
        // Calculate individual areas
        const area1 = region1.width * region1.height;
        const area2 = region2.width * region2.height;
        const combinedArea = area1 + area2;
        
        // Merge if the efficiency gain is above threshold
        const efficiency = combinedArea / mergedArea;
        
        return efficiency >= threshold;
    }
    
    /**
     * Merge two regions into the first region
     * @param {object} target - Target region to expand
     * @param {object} source - Source region to merge in
     */
    mergeRegions(target, source) {
        const newX = Math.min(target.x, source.x);
        const newY = Math.min(target.y, source.y);
        const newRight = Math.max(target.right, source.right);
        const newBottom = Math.max(target.bottom, source.bottom);
        
        target.x = newX;
        target.y = newY;
        target.width = newRight - newX;
        target.height = newBottom - newY;
        target.right = newRight;
        target.bottom = newBottom;
    }
    
    /**
     * Optimize dirty region sizes
     * @param {Array} regions - Merged regions
     * @returns {Array} Optimized regions
     */
    optimizeDirtyRegionSizes(regions) {
        const maxRegions = this.dirtyRegionManager.maxRegionCount;
        
        // If too many regions, merge the smallest ones
        if (regions.length > maxRegions) {
            regions.sort((a, b) => (a.width * a.height) - (b.width * b.height));
            
            while (regions.length > maxRegions) {
                const smallest = regions.shift();
                const secondSmallest = regions.shift();
                
                this.mergeRegions(secondSmallest, smallest);
                regions.push(secondSmallest);
                regions.sort((a, b) => (a.width * a.height) - (b.width * b.height));
            }
        }
        
        // Clamp regions to canvas bounds
        return regions.map(region => ({
            x: Math.max(0, Math.floor(region.x)),
            y: Math.max(0, Math.floor(region.y)),
            width: Math.min(region.width, this.canvas.width - Math.max(0, Math.floor(region.x))),
            height: Math.min(region.height, this.canvas.height - Math.max(0, Math.floor(region.y)))
        })).filter(region => region.width > 0 && region.height > 0);
    }
    
    /**
     * Update object tracking for dirty region calculation
     * @param {object} obj - Render object
     */
    updateObjectTracking(obj) {
        this.dirtyRegionManager.frameRegions.set(obj.id, {
            bounds: { ...obj.bounds },
            rotation: obj.rotation || 0,
            alpha: obj.alpha || 1,
            frame: obj.frame || 0,
            timestamp: Date.now()
        });
    }
    
    /**
     * Update dirty region statistics
     * @param {Array} regions - Final optimized regions
     */
    updateDirtyRegionStats(regions) {
        const stats = this.dirtyRegionManager.stats;
        
        // Calculate pixels saved
        const totalCanvasPixels = this.canvas.width * this.canvas.height;
        const dirtyPixels = regions.reduce((sum, region) => sum + region.width * region.height, 0);
        stats.pixelsSaved = Math.max(0, totalCanvasPixels - dirtyPixels);
        
        // Calculate performance gain
        stats.performanceGain = stats.pixelsSaved / totalCanvasPixels;
        
        // Track skipped redraws
        if (regions.length === 0) {
            stats.skippedRedraws++;
        }
    }
    
    /**
     * Optimize layer composition
     * @param {Array} objects - Visible objects
     * @returns {Map} Layer batches organized for optimal rendering
     */
    optimizeLayerComposition(objects) {
        const batchStart = performance.now();
        
        // Group objects by layer
        const layerBatches = new Map();
        
        for (const obj of objects) {
            const layerName = obj.layer || 'game';
            
            if (!layerBatches.has(layerName)) {
                layerBatches.set(layerName, []);
            }
            
            layerBatches.get(layerName).push(obj);
        }
        
        // Optimize each layer batch
        for (const [layerName, objects] of layerBatches) {
            const layer = this.layerManager.layers.get(layerName);
            
            if (layer) {
                // Sort objects within layer for optimal rendering
                objects.sort((a, b) => a.priority - b.priority);
                
                // Apply batching optimizations
                this.optimizeLayerBatch(layer, objects);
                
                // Update layer statistics
                this.updateLayerStats(layer, objects);
            }
        }
        
        const batchTime = performance.now() - batchStart;
        this.renderingPipeline.stageTimings.set('batch', batchTime);
        
        return layerBatches;
    }
    
    /**
     * Optimize rendering batch for a specific layer
     * @param {object} layer - Layer information
     * @param {Array} objects - Objects in layer
     */
    optimizeLayerBatch(layer, objects) {
        // Check if layer needs cache update
        if (layer.cacheable && (layer.dirty || !layer.canvas)) {
            this.updateLayerCache(layer, objects);
        }
        
        // Apply draw call batching
        if (this.renderingPipeline.batching.enabled) {
            this.batchDrawCalls(objects);
        }
    }
    
    /**
     * Update layer cache
     * @param {object} layer - Layer to cache
     * @param {Array} objects - Objects in layer
     */
    updateLayerCache(layer, objects) {
        if (!layer.canvas) return;
        
        const ctx = layer.context;
        ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        
        // Render objects to layer cache
        for (const obj of objects) {
            this.renderObjectToContext(obj, ctx);
        }
        
        layer.dirty = false;
        
        // Update cache statistics
        this.layerManager.stats.cachedLayers++;
        
        console.log(`[AdvancedRenderingOptimizer] Layer cached: ${layer.name}`);
    }
    
    /**
     * Batch draw calls for efficiency
     * @param {Array} objects - Objects to batch
     */
    batchDrawCalls(objects) {
        const batches = new Map();
        
        // Group objects by material/texture for batching
        for (const obj of objects) {
            const batchKey = `${obj.material || 'default'}_${obj.texture || 'default'}`;
            
            if (!batches.has(batchKey)) {
                batches.set(batchKey, []);
            }
            
            batches.get(batchKey).push(obj);
        }
        
        // Store batch information for rendering
        objects.batchInfo = batches;
    }
    
    /**
     * Execute optimized rendering
     * @param {Map} layerBatches - Organized layer batches
     * @param {Array} dirtyRegions - Dirty regions to render
     * @returns {object} Render result
     */
    executeOptimizedRendering(layerBatches, dirtyRegions) {
        const renderStart = performance.now();
        
        // Clear dirty regions only
        this.clearDirtyRegions(dirtyRegions);
        
        let totalObjectsRendered = 0;
        let totalDrawCalls = 0;
        
        // Render layers in order
        for (const layerName of this.layerManager.layerOrder) {
            const layer = this.layerManager.layers.get(layerName);
            const objects = layerBatches.get(layerName) || [];
            
            if (!layer.enabled || !layer.visible || objects.length === 0) {
                continue;
            }
            
            const layerRenderStart = performance.now();
            
            // Render layer
            const renderResult = this.renderLayer(layer, objects, dirtyRegions);
            totalObjectsRendered += renderResult.objectsRendered;
            totalDrawCalls += renderResult.drawCalls;
            
            // Update layer render time
            layer.renderTime = performance.now() - layerRenderStart;
        }
        
        const renderTime = performance.now() - renderStart;
        this.renderingPipeline.stageTimings.set('render', renderTime);
        
        // Update draw call statistics
        this.renderingPipeline.drawCallOptimization.currentDrawCalls = totalDrawCalls;
        
        return {
            objectsRendered: totalObjectsRendered,
            drawCalls: totalDrawCalls,
            renderTime: renderTime
        };
    }
    
    /**
     * Clear only the dirty regions
     * @param {Array} dirtyRegions - Regions to clear
     */
    clearDirtyRegions(dirtyRegions) {
        if (dirtyRegions.length === 0) return;
        
        for (const region of dirtyRegions) {
            if (region.full) {
                // Clear entire canvas
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            } else {
                // Clear specific region
                this.ctx.clearRect(region.x, region.y, region.width, region.height);
            }
        }
    }
    
    /**
     * Render a specific layer
     * @param {object} layer - Layer to render
     * @param {Array} objects - Objects in layer
     * @param {Array} dirtyRegions - Dirty regions
     * @returns {object} Layer render result
     */
    renderLayer(layer, objects, dirtyRegions) {
        let objectsRendered = 0;
        let drawCalls = 0;
        
        // Use cached layer if available and clean
        if (layer.cacheable && layer.canvas && !layer.dirty) {
            // Render cached layer to main canvas
            for (const region of dirtyRegions) {
                this.ctx.drawImage(
                    layer.canvas,
                    region.x, region.y, region.width, region.height,
                    region.x, region.y, region.width, region.height
                );
            }
            drawCalls += dirtyRegions.length;
            objectsRendered = objects.length; // All objects in cache
        } else {
            // Render objects individually
            for (const obj of objects) {
                if (this.shouldRenderObject(obj, dirtyRegions)) {
                    this.renderObjectToContext(obj, this.ctx);
                    objectsRendered++;
                    drawCalls++;
                }
            }
        }
        
        return { objectsRendered, drawCalls };
    }
    
    /**
     * Check if object should be rendered based on dirty regions
     * @param {object} obj - Object to check
     * @param {Array} dirtyRegions - Dirty regions
     * @returns {boolean} True if object should be rendered
     */
    shouldRenderObject(obj, dirtyRegions) {
        // If no dirty regions, render everything
        if (dirtyRegions.length === 0) return true;
        
        // Check if object intersects any dirty region
        for (const region of dirtyRegions) {
            if (this.intersectsRegion(obj.bounds, region)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check if bounds intersect with region
     * @param {object} bounds - Object bounds
     * @param {object} region - Dirty region
     * @returns {boolean} True if they intersect
     */
    intersectsRegion(bounds, region) {
        return !(bounds.right < region.x || 
                 bounds.x > region.x + region.width || 
                 bounds.bottom < region.y || 
                 bounds.y > region.y + region.height);
    }
    
    /**
     * Render object to specific context
     * @param {object} obj - Object to render
     * @param {CanvasRenderingContext2D} ctx - Target context
     */
    renderObjectToContext(obj, ctx) {
        // This is a simplified render function
        // In practice, this would dispatch to specific renderers based on object type
        
        ctx.save();
        
        // Apply transformations
        ctx.translate(obj.screenX, obj.screenY);
        if (obj.rotation) {
            ctx.rotate(obj.rotation);
        }
        if (obj.screenScale !== 1) {
            ctx.scale(obj.screenScale, obj.screenScale);
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
     * @param {CanvasRenderingContext2D} ctx - Render context
     */
    renderSprite(obj, ctx) {
        if (obj.image) {
            const width = obj.width || obj.image.width;
            const height = obj.height || obj.image.height;
            ctx.drawImage(obj.image, -width/2, -height/2, width, height);
        }
    }
    
    /**
     * Render text object
     * @param {object} obj - Text object
     * @param {CanvasRenderingContext2D} ctx - Render context
     */
    renderText(obj, ctx) {
        ctx.fillStyle = obj.color || '#000000';
        ctx.font = obj.font || '16px Arial';
        ctx.textAlign = obj.textAlign || 'center';
        ctx.textBaseline = obj.textBaseline || 'middle';
        ctx.fillText(obj.text || '', 0, 0);
    }
    
    /**
     * Render shape object
     * @param {object} obj - Shape object
     * @param {CanvasRenderingContext2D} ctx - Render context
     */
    renderShape(obj, ctx) {
        ctx.fillStyle = obj.color || '#ff0000';
        
        switch (obj.shape) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(0, 0, obj.radius || 16, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'rectangle':
                const width = obj.width || 32;
                const height = obj.height || 32;
                ctx.fillRect(-width/2, -height/2, width, height);
                break;
        }
    }
    
    /**
     * Render default object
     * @param {object} obj - Default object
     * @param {CanvasRenderingContext2D} ctx - Render context
     */
    renderDefault(obj, ctx) {
        // Render as colored rectangle
        ctx.fillStyle = obj.color || '#00ff00';
        const width = obj.width || 32;
        const height = obj.height || 32;
        ctx.fillRect(-width/2, -height/2, width, height);
    }
    
    /**
     * Perform final composition
     * @param {object} renderResult - Result from main rendering
     */
    performFinalComposition(renderResult) {
        const composeStart = performance.now();
        
        // Apply any post-processing effects
        this.applyPostProcessingEffects();
        
        // Update composition statistics
        const composeTime = performance.now() - composeStart;
        this.renderingPipeline.stageTimings.set('compose', composeTime);
        this.layerManager.stats.compositionTime = composeTime;
    }
    
    /**
     * Apply post-processing effects
     */
    applyPostProcessingEffects() {
        // This would apply effects like bloom, blur, color grading, etc.
        // For now, we'll just track that this step occurred
        
        if (this.renderingConfig.debugMode && this.renderingConfig.showDirtyRegions) {
            this.debugRenderDirtyRegions();
        }
    }
    
    /**
     * Debug render dirty regions
     */
    debugRenderDirtyRegions() {
        this.ctx.strokeStyle = '#ff00ff';
        this.ctx.lineWidth = 2;
        
        for (const region of this.dirtyRegionManager.mergedRegions) {
            this.ctx.strokeRect(region.x, region.y, region.width, region.height);
        }
    }
    
    /**
     * Update rendering performance metrics
     * @param {number} renderTime - Total render time
     * @param {number} totalObjects - Total objects processed
     */
    updateRenderingPerformance(renderTime, totalObjects) {
        const metrics = this.performanceMonitor.metrics;
        
        metrics.frameTime = renderTime;
        metrics.renderTime = renderTime;
        
        // Calculate stage times
        metrics.cullTime = this.renderingPipeline.stageTimings.get('cull') || 0;
        metrics.compositionTime = this.renderingPipeline.stageTimings.get('compose') || 0;
        metrics.dirtyRegionTime = this.renderingPipeline.stageTimings.get('dirtyRegions') || 0;
        
        // Calculate efficiency metrics
        metrics.renderEfficiency = Math.min(1, this.performanceMonitor.baseline.renderTime / renderTime);
        metrics.cullingEfficiency = this.viewportCuller.stats.cullingEfficiency;
        metrics.cacheEfficiency = this.calculateCacheEfficiency();
        metrics.overallEfficiency = (metrics.renderEfficiency + metrics.cullingEfficiency + metrics.cacheEfficiency) / 3;
        
        // Add to history
        this.performanceMonitor.history.push({
            timestamp: Date.now(),
            ...metrics
        });
        
        // Keep history size manageable
        if (this.performanceMonitor.history.length > this.performanceMonitor.historySize) {
            this.performanceMonitor.history.shift();
        }
        
        this.renderingPipeline.frameCount++;
    }
    
    /**
     * Calculate cache efficiency
     * @returns {number} Cache efficiency (0-1)
     */
    calculateCacheEfficiency() {
        const stats = this.layerManager.stats;
        const totalLayers = this.layerManager.layers.size;
        
        if (totalLayers === 0) return 1;
        
        return stats.cachedLayers / totalLayers;
    }
    
    /**
     * Calculate overall performance gain
     * @returns {number} Performance gain percentage
     */
    calculatePerformanceGain() {
        const metrics = this.performanceMonitor.metrics;
        const baseline = this.performanceMonitor.baseline;
        
        // Calculate gain from various optimizations
        const renderGain = Math.max(0, 1 - metrics.renderTime / baseline.renderTime);
        const pixelGain = this.dirtyRegionManager.stats.performanceGain;
        const cullGain = metrics.cullingEfficiency;
        
        return (renderGain + pixelGain + cullGain) / 3;
    }
    
    /**
     * Update performance metrics and optimize based on performance
     */
    updatePerformanceMetrics() {
        // This runs every frame to monitor performance
        
        const metrics = this.performanceMonitor.metrics;
        const history = this.performanceMonitor.history;
        
        if (history.length === 0) return;
        
        // Calculate recent averages
        const recentFrames = history.slice(-10);
        const avgRenderTime = recentFrames.reduce((sum, frame) => sum + frame.renderTime, 0) / recentFrames.length;
        
        // Update current metrics
        metrics.renderTime = avgRenderTime;
    }
    
    /**
     * Optimize based on current performance
     */
    optimizeBasedOnPerformance() {
        if (!this.performanceMonitor.adaptiveMode) return;
        
        const metrics = this.performanceMonitor.metrics;
        const target = this.performanceMonitor.performanceTarget;
        const trigger = this.performanceMonitor.optimizationTrigger;
        
        // Check if performance is below target
        if (metrics.renderTime > trigger) {
            this.triggerPerformanceOptimizations();
        } else if (metrics.renderTime < target * 0.8) {
            // Performance is very good, can increase quality
            this.relaxOptimizations();
        }
    }
    
    /**
     * Trigger performance optimizations
     */
    triggerPerformanceOptimizations() {
        console.log('[AdvancedRenderingOptimizer] Performance below target, triggering optimizations');
        
        // Increase optimization aggressiveness
        if (this.renderingConfig.optimizationLevel === 'conservative') {
            this.renderingConfig.optimizationLevel = 'balanced';
        } else if (this.renderingConfig.optimizationLevel === 'balanced') {
            this.renderingConfig.optimizationLevel = 'aggressive';
        }
        
        // Enable more aggressive culling
        this.viewportCuller.cullingMargin = Math.max(25, this.viewportCuller.cullingMargin - 10);
        
        // Reduce dirty region sensitivity
        this.dirtyRegionManager.mergeThreshold = Math.max(0.2, this.dirtyRegionManager.mergeThreshold - 0.1);
        
        // Increase layer caching
        this.layerManager.cacheEnabled = true;
    }
    
    /**
     * Relax optimizations when performance is good
     */
    relaxOptimizations() {
        // Reduce optimization aggressiveness for better quality
        if (this.renderingConfig.optimizationLevel === 'aggressive') {
            this.renderingConfig.optimizationLevel = 'balanced';
        } else if (this.renderingConfig.optimizationLevel === 'balanced') {
            this.renderingConfig.optimizationLevel = 'conservative';
        }
        
        // Relax culling margins
        this.viewportCuller.cullingMargin = Math.min(100, this.viewportCuller.cullingMargin + 5);
        
        // Increase dirty region sensitivity
        this.dirtyRegionManager.mergeThreshold = Math.min(0.5, this.dirtyRegionManager.mergeThreshold + 0.05);
    }
    
    /**
     * Update layer statistics
     * @param {object} layer - Layer object
     * @param {Array} objects - Objects in layer
     */
    updateLayerStats(layer, objects) {
        const stats = this.layerManager.stats;
        
        stats.totalLayers = this.layerManager.layers.size;
        
        if (layer.cacheable && layer.canvas) {
            stats.cachedLayers++;
        }
        
        // Calculate cache hit rate
        const totalCacheable = Array.from(this.layerManager.layers.values())
            .filter(l => l.cacheable).length;
        
        if (totalCacheable > 0) {
            stats.cacheHitRate = stats.cachedLayers / totalCacheable;
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for canvas resize
        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(() => {
                this.handleCanvasResize();
            });
            resizeObserver.observe(this.canvas);
        }
        
        // Listen for visibility changes
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
        console.log('[AdvancedRenderingOptimizer] Canvas resized, updating viewport');
        
        // Update viewport
        this.updateViewport();
        
        // Rebuild spatial structures
        this.rebuildSpatialGrid();
        
        // Update layer canvases
        for (const layer of this.layerManager.layers.values()) {
            if (layer.canvas) {
                layer.canvas.width = this.canvas.width;
                layer.canvas.height = this.canvas.height;
                layer.dirty = true; // Force re-cache
            }
        }
        
        // Clear dirty regions (everything is dirty after resize)
        this.dirtyRegionManager.regions.clear();
        this.addDirtyRegion({
            x: 0, y: 0,
            width: this.canvas.width,
            height: this.canvas.height
        });
    }
    
    /**
     * Pause optimizations when not visible
     */
    pauseOptimizations() {
        this.renderingConfig.enabled = false;
        console.log('[AdvancedRenderingOptimizer] Optimizations paused');
    }
    
    /**
     * Resume optimizations when visible
     */
    resumeOptimizations() {
        this.renderingConfig.enabled = true;
        console.log('[AdvancedRenderingOptimizer] Optimizations resumed');
    }
    
    // Public API methods
    
    /**
     * Mark region as dirty for next frame
     * @param {object} bounds - Region bounds
     */
    markDirtyRegion(bounds) {
        this.addDirtyRegion(bounds);
    }
    
    /**
     * Mark layer as dirty
     * @param {string} layerName - Layer name
     */
    markLayerDirty(layerName) {
        const layer = this.layerManager.layers.get(layerName);
        if (layer) {
            layer.dirty = true;
        }
    }
    
    /**
     * Get rendering statistics
     * @returns {object} Comprehensive statistics
     */
    getStats() {
        return {
            rendering: {
                frameCount: this.renderingPipeline.frameCount,
                avgRenderTime: this.performanceMonitor.metrics.renderTime,
                efficiency: this.performanceMonitor.metrics.overallEfficiency,
                performanceGain: this.calculatePerformanceGain()
            },
            dirtyRegions: this.dirtyRegionManager.stats,
            culling: this.viewportCuller.stats,
            layers: this.layerManager.stats,
            pipeline: {
                currentStage: this.renderingPipeline.currentStage,
                stageTimings: Object.fromEntries(this.renderingPipeline.stageTimings),
                drawCalls: this.renderingPipeline.drawCallOptimization.currentDrawCalls
            }
        };
    }
    
    /**
     * Configure rendering optimizer
     * @param {object} config - Configuration options
     */
    configure(config) {
        if (config.rendering) {
            Object.assign(this.renderingConfig, config.rendering);
        }
        
        if (config.dirtyRegions) {
            Object.assign(this.dirtyRegionManager, config.dirtyRegions);
        }
        
        if (config.culling) {
            Object.assign(this.viewportCuller, config.culling);
        }
        
        if (config.layers) {
            Object.assign(this.layerManager, config.layers);
        }
        
        console.log('[AdvancedRenderingOptimizer] Configuration updated');
    }
    
    /**
     * Enable or disable debug mode
     * @param {boolean} enabled - Debug mode enabled
     */
    setDebugMode(enabled) {
        this.renderingConfig.debugMode = enabled;
        this.renderingConfig.showDirtyRegions = enabled;
        this.renderingConfig.showCulledObjects = enabled;
        this.renderingConfig.showLayerComposition = enabled;
        
        console.log(`[AdvancedRenderingOptimizer] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Cleanup rendering optimizer
     */
    destroy() {
        // Clear intervals
        if (this.performanceInterval) {
            clearInterval(this.performanceInterval);
        }
        
        // Clear spatial structures
        this.viewportCuller.spatialGrid.clear();
        this.dirtyRegionManager.regions.clear();
        
        // Clear layer caches
        for (const layer of this.layerManager.layers.values()) {
            if (layer.canvas) {
                layer.canvas.width = 0;
                layer.canvas.height = 0;
            }
        }
        
        console.log('[AdvancedRenderingOptimizer] Rendering optimizer destroyed');
    }
}

/**
 * Simple QuadTree implementation for spatial partitioning
 */
class QuadTree {
    constructor(bounds, maxObjects = 10, maxLevels = 5, level = 0) {
        this.bounds = bounds;
        this.maxObjects = maxObjects;
        this.maxLevels = maxLevels;
        this.level = level;
        this.objects = [];
        this.nodes = [];
    }
    
    clear() {
        this.objects = [];
        this.nodes = [];
    }
    
    split() {
        const subWidth = this.bounds.width / 2;
        const subHeight = this.bounds.height / 2;
        const x = this.bounds.x;
        const y = this.bounds.y;
        
        this.nodes[0] = new QuadTree({
            x: x + subWidth,
            y: y,
            width: subWidth,
            height: subHeight
        }, this.maxObjects, this.maxLevels, this.level + 1);
        
        this.nodes[1] = new QuadTree({
            x: x,
            y: y,
            width: subWidth,
            height: subHeight
        }, this.maxObjects, this.maxLevels, this.level + 1);
        
        this.nodes[2] = new QuadTree({
            x: x,
            y: y + subHeight,
            width: subWidth,
            height: subHeight
        }, this.maxObjects, this.maxLevels, this.level + 1);
        
        this.nodes[3] = new QuadTree({
            x: x + subWidth,
            y: y + subHeight,
            width: subWidth,
            height: subHeight
        }, this.maxObjects, this.maxLevels, this.level + 1);
    }
    
    getIndex(bounds) {
        let index = -1;
        const verticalMidpoint = this.bounds.x + (this.bounds.width / 2);
        const horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);
        
        const topQuadrant = bounds.y < horizontalMidpoint && bounds.y + bounds.height < horizontalMidpoint;
        const bottomQuadrant = bounds.y > horizontalMidpoint;
        
        if (bounds.x < verticalMidpoint && bounds.x + bounds.width < verticalMidpoint) {
            if (topQuadrant) {
                index = 1;
            } else if (bottomQuadrant) {
                index = 2;
            }
        } else if (bounds.x > verticalMidpoint) {
            if (topQuadrant) {
                index = 0;
            } else if (bottomQuadrant) {
                index = 3;
            }
        }
        
        return index;
    }
    
    insert(object) {
        if (this.nodes.length > 0) {
            const index = this.getIndex(object.bounds);
            
            if (index !== -1) {
                this.nodes[index].insert(object);
                return;
            }
        }
        
        this.objects.push(object);
        
        if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
            if (this.nodes.length === 0) {
                this.split();
            }
            
            let i = 0;
            while (i < this.objects.length) {
                const index = this.getIndex(this.objects[i].bounds);
                if (index !== -1) {
                    this.nodes[index].insert(this.objects.splice(i, 1)[0]);
                } else {
                    i++;
                }
            }
        }
    }
    
    retrieve(bounds) {
        const returnObjects = this.objects.slice();
        
        if (this.nodes.length > 0) {
            const index = this.getIndex(bounds);
            
            if (index !== -1) {
                returnObjects.push(...this.nodes[index].retrieve(bounds));
            } else {
                for (const node of this.nodes) {
                    returnObjects.push(...node.retrieve(bounds));
                }
            }
        }
        
        return returnObjects;
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