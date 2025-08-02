/**
 * Proactive Cleanup Management System
 * プロアクティブクリーンアップ管理システム - インテリジェントなメモリクリーンアップとスケジューリング
 */
export class ProactiveCleanupManager {
    constructor(config = {}) {
        // Configuration
        this.enabled = config.enabled !== undefined ? config.enabled : true;
        this.mode = config.mode || 'adaptive'; // 'conservative', 'adaptive', 'aggressive'
        
        // Cleanup tracking
        this.lastCleanup = 0;
        this.nextCleanup = config.baseInterval || 30000;
        this.cleanupEfficiency = 1.0;
        
        // Intelligent scheduling
        this.scheduling = {
            baseInterval: config.baseInterval || 30000,
            minInterval: config.minInterval || 5000,
            maxInterval: config.maxInterval || 120000,
            pressureMultiplier: config.pressureMultiplier || 0.5,
            idleMultiplier: config.idleMultiplier || 2.0
        };
        
        // Performance tracking
        this.performanceHistory = [];
        this.cleanupStrategies = new Map();
        this.lastPerformanceCheck = 0;
        
        // Cleanup targets and strategies
        this.cleanupTargets = {
            timers: new Set(),
            eventListeners: new Map(),
            canvasContexts: new Set(),
            imageCache: new Map(),
            audioCache: new Map(),
            customCleanups: new Map()
        };
        
        // Statistics
        this.stats = {
            cleanupCount: 0,
            totalMemoryFreed: 0,
            averageCleanupTime: 0,
            efficiency: 1.0,
            strategiesUsed: new Map(),
            lastCleanupResults: null
        };
        
        // Resource limits for caches
        this.limits = {
            imageCache: config.imageCacheLimit || 50,
            audioCache: config.audioCacheLimit || 20,
            maxCacheAge: config.maxCacheAge || 300000, // 5 minutes
            maxMemoryPressure: config.maxMemoryPressure || 0.8
        };
    }
    
    /**
     * Perform intelligent cleanup based on current conditions
     * @param {object} context - Current system context
     * @returns {object} Cleanup results
     */
    performIntelligentCleanup(context = {}) {
        if (!this.enabled) {
            return { performed: false, reason: 'Cleanup disabled' };
        }
        
        const now = Date.now();
        if (now - this.lastCleanup < this.scheduling.minInterval) {
            return { performed: false, reason: 'Too frequent' };
        }
        
        const startTime = performance.now();
        const memoryBefore = this._getMemoryUsage();
        
        try {
            // Determine cleanup strategy based on context
            const strategy = this._determineCleanupStrategy(context);
            
            // Execute cleanup strategy
            const results = this._executeCleanupStrategy(strategy, context);
            
            // Track performance
            const endTime = performance.now();
            const memoryAfter = this._getMemoryUsage();
            const cleanupTime = endTime - startTime;
            const memoryFreed = Math.max(0, memoryBefore - memoryAfter);
            
            // Update statistics
            this._updateCleanupStats(cleanupTime, memoryFreed, strategy);
            
            // Schedule next cleanup
            this._scheduleNextCleanup(context, results);
            
            this.lastCleanup = now;
            
            const finalResults = {
                performed: true,
                strategy: strategy.name,
                memoryFreed,
                cleanupTime,
                efficiency: memoryFreed / Math.max(1, cleanupTime),
                actions: results.actions,
                nextCleanup: this.nextCleanup
            };
            
            this.stats.lastCleanupResults = finalResults;
            
            return finalResults;
            
        } catch (error) {
            console.error('[ProactiveCleanupManager] Cleanup failed:', error);
            return { performed: false, error: error.message };
        }
    }
    
    /**
     * Register a timer for cleanup tracking
     * @param {number} timerId - Timer ID
     * @param {string} type - Timer type ('timeout', 'interval')
     */
    registerTimer(timerId, type = 'timeout') {
        this.cleanupTargets.timers.add({ id: timerId, type, created: Date.now() });
    }
    
    /**
     * Register an event listener for cleanup tracking
     * @param {EventTarget} target - Event target
     * @param {string} event - Event name
     * @param {Function} listener - Event listener
     */
    registerEventListener(target, event, listener) {
        const key = `${target.constructor.name}_${event}`;
        if (!this.cleanupTargets.eventListeners.has(key)) {
            this.cleanupTargets.eventListeners.set(key, []);
        }
        this.cleanupTargets.eventListeners.get(key).push({
            target, event, listener, created: Date.now()
        });
    }
    
    /**
     * Register a canvas context for cleanup
     * @param {CanvasRenderingContext2D} context - Canvas context
     * @param {HTMLCanvasElement} canvas - Canvas element
     */
    registerCanvasContext(context, canvas) {
        this.cleanupTargets.canvasContexts.add({
            context, canvas, created: Date.now()
        });
    }
    
    /**
     * Add item to image cache with size tracking
     * @param {string} key - Cache key
     * @param {HTMLImageElement} image - Image element
     * @param {number} estimatedSize - Estimated size in bytes
     */
    addToImageCache(key, image, estimatedSize = 0) {
        // Remove oldest items if cache is full
        if (this.cleanupTargets.imageCache.size >= this.limits.imageCache) {
            this._evictOldestCacheItems('imageCache', 5);
        }
        
        this.cleanupTargets.imageCache.set(key, {
            image,
            size: estimatedSize,
            accessed: Date.now(),
            created: Date.now()
        });
    }
    
    /**
     * Add item to audio cache with size tracking
     * @param {string} key - Cache key
     * @param {HTMLAudioElement} audio - Audio element
     * @param {number} estimatedSize - Estimated size in bytes
     */
    addToAudioCache(key, audio, estimatedSize = 0) {
        // Remove oldest items if cache is full
        if (this.cleanupTargets.audioCache.size >= this.limits.audioCache) {
            this._evictOldestCacheItems('audioCache', 3);
        }
        
        this.cleanupTargets.audioCache.set(key, {
            audio,
            size: estimatedSize,
            accessed: Date.now(),
            created: Date.now()
        });
    }
    
    /**
     * Register custom cleanup function
     * @param {string} name - Cleanup name
     * @param {Function} cleanupFn - Cleanup function
     * @param {number} priority - Priority (0-10, higher = more important)
     */
    registerCustomCleanup(name, cleanupFn, priority = 5) {
        this.cleanupTargets.customCleanups.set(name, {
            cleanup: cleanupFn,
            priority,
            lastRun: 0,
            runCount: 0
        });
    }
    
    /**
     * Remove custom cleanup function
     * @param {string} name - Cleanup name
     */
    unregisterCustomCleanup(name) {
        this.cleanupTargets.customCleanups.delete(name);
    }
    
    /**
     * Get cleanup statistics
     * @returns {object} Statistics
     */
    getStats() {
        return {
            ...this.stats,
            registeredTimers: this.cleanupTargets.timers.size,
            registeredListeners: Array.from(this.cleanupTargets.eventListeners.values())
                .reduce((sum, arr) => sum + arr.length, 0),
            imageCacheSize: this.cleanupTargets.imageCache.size,
            audioCacheSize: this.cleanupTargets.audioCache.size,
            customCleanups: this.cleanupTargets.customCleanups.size,
            nextCleanupIn: Math.max(0, this.nextCleanup - (Date.now() - this.lastCleanup))
        };
    }
    
    /**
     * Force immediate cleanup with specified strategy
     * @param {string} strategyName - Strategy name
     * @param {object} context - Context information
     * @returns {object} Cleanup results
     */
    forceCleanup(strategyName = 'comprehensive', context = {}) {
        const strategy = this._getCleanupStrategy(strategyName);
        return this._executeCleanupStrategy(strategy, context);
    }
    
    // Private methods
    
    /**
     * Determine optimal cleanup strategy based on context
     * @private
     */
    _determineCleanupStrategy(context) {
        const memoryPressure = context.memoryPressure || this._calculateMemoryPressure();
        const timeSinceLastCleanup = Date.now() - this.lastCleanup;
        const recentEfficiency = this.cleanupEfficiency;
        
        // Select strategy based on conditions
        if (memoryPressure > 0.9) {
            return this._getCleanupStrategy('emergency');
        } else if (memoryPressure > 0.7 || recentEfficiency < 0.5) {
            return this._getCleanupStrategy('aggressive');
        } else if (this.mode === 'aggressive' || timeSinceLastCleanup > this.scheduling.maxInterval) {
            return this._getCleanupStrategy('comprehensive');
        } else if (memoryPressure < 0.3 && recentEfficiency > 0.8) {
            return this._getCleanupStrategy('minimal');
        } else {
            return this._getCleanupStrategy('standard');
        }
    }
    
    /**
     * Get cleanup strategy configuration
     * @private
     */
    _getCleanupStrategy(name) {
        const strategies = {
            minimal: {
                name: 'minimal',
                priority: 1,
                actions: ['cleanup_old_timers', 'evict_expired_cache'],
                memoryThreshold: 0.3,
                timeLimit: 10
            },
            standard: {
                name: 'standard',
                priority: 2,
                actions: ['cleanup_timers', 'cleanup_listeners', 'evict_cache', 'custom_cleanups'],
                memoryThreshold: 0.6,
                timeLimit: 50
            },
            comprehensive: {
                name: 'comprehensive',
                priority: 3,
                actions: ['cleanup_all_timers', 'cleanup_all_listeners', 'cleanup_contexts', 'evict_all_cache', 'custom_cleanups', 'force_gc'],
                memoryThreshold: 0.8,
                timeLimit: 100
            },
            aggressive: {
                name: 'aggressive',
                priority: 4,
                actions: ['emergency_timer_cleanup', 'emergency_listener_cleanup', 'purge_all_cache', 'emergency_custom_cleanups', 'force_gc'],
                memoryThreshold: 1.0,
                timeLimit: 200
            },
            emergency: {
                name: 'emergency',
                priority: 5,
                actions: ['clear_all_timers', 'clear_all_listeners', 'clear_all_cache', 'clear_all_contexts', 'emergency_gc'],
                memoryThreshold: 1.0,
                timeLimit: 500
            }
        };
        
        return strategies[name] || strategies.standard;
    }
    
    /**
     * Execute cleanup strategy
     * @private
     */
    _executeCleanupStrategy(strategy, context) {
        const results = {
            strategy: strategy.name,
            actions: [],
            timersCleared: 0,
            listenersRemoved: 0,
            cacheItemsEvicted: 0,
            contextsCleared: 0,
            customCleanupsRun: 0,
            memoryFreed: 0
        };
        
        const startTime = performance.now();
        
        for (const action of strategy.actions) {
            if (performance.now() - startTime > strategy.timeLimit) {
                results.actions.push(`${action}_timeout`);
                break;
            }
            
            try {
                const actionResult = this._executeCleanupAction(action, context);
                results.actions.push(action);
                
                // Aggregate results
                if (actionResult.timersCleared) results.timersCleared += actionResult.timersCleared;
                if (actionResult.listenersRemoved) results.listenersRemoved += actionResult.listenersRemoved;
                if (actionResult.cacheItemsEvicted) results.cacheItemsEvicted += actionResult.cacheItemsEvicted;
                if (actionResult.contextsCleared) results.contextsCleared += actionResult.contextsCleared;
                if (actionResult.customCleanupsRun) results.customCleanupsRun += actionResult.customCleanupsRun;
                
            } catch (error) {
                results.actions.push(`${action}_error`);
                console.error(`[ProactiveCleanupManager] Action failed: ${action}`, error);
            }
        }
        
        return results;
    }
    
    /**
     * Execute specific cleanup action
     * @private
     */
    _executeCleanupAction(action, context) {
        const result = { action };
        
        switch (action) {
            case 'cleanup_old_timers':
                result.timersCleared = this._cleanupTimers(300000); // 5 minutes old
                break;
            case 'cleanup_timers':
                result.timersCleared = this._cleanupTimers(60000); // 1 minute old
                break;
            case 'cleanup_all_timers':
                result.timersCleared = this._cleanupTimers(0); // All timers
                break;
            case 'emergency_timer_cleanup':
            case 'clear_all_timers':
                result.timersCleared = this._clearAllTimers();
                break;
                
            case 'cleanup_listeners':
                result.listenersRemoved = this._cleanupEventListeners(300000);
                break;
            case 'cleanup_all_listeners':
                result.listenersRemoved = this._cleanupEventListeners(0);
                break;
            case 'emergency_listener_cleanup':
            case 'clear_all_listeners':
                result.listenersRemoved = this._clearAllEventListeners();
                break;
                
            case 'evict_expired_cache':
                result.cacheItemsEvicted = this._evictExpiredCacheItems();
                break;
            case 'evict_cache':
                result.cacheItemsEvicted = this._evictLRUCacheItems(0.3); // 30% of cache
                break;
            case 'evict_all_cache':
                result.cacheItemsEvicted = this._evictLRUCacheItems(0.7); // 70% of cache
                break;
            case 'purge_all_cache':
            case 'clear_all_cache':
                result.cacheItemsEvicted = this._clearAllCache();
                break;
                
            case 'cleanup_contexts':
                result.contextsCleared = this._cleanupCanvasContexts();
                break;
            case 'clear_all_contexts':
                result.contextsCleared = this._clearAllCanvasContexts();
                break;
                
            case 'custom_cleanups':
                result.customCleanupsRun = this._runCustomCleanups(false);
                break;
            case 'emergency_custom_cleanups':
                result.customCleanupsRun = this._runCustomCleanups(true);
                break;
                
            case 'force_gc':
                this._requestGarbageCollection();
                break;
            case 'emergency_gc':
                this._forceGarbageCollection();
                break;
        }
        
        return result;
    }
    
    /**
     * Cleanup old timers
     * @private
     */
    _cleanupTimers(maxAge) {
        const now = Date.now();
        let cleared = 0;
        
        this.cleanupTargets.timers.forEach(timer => {
            if (now - timer.created > maxAge) {
                try {
                    if (timer.type === 'interval') {
                        clearInterval(timer.id);
                    } else {
                        clearTimeout(timer.id);
                    }
                    this.cleanupTargets.timers.delete(timer);
                    cleared++;
                } catch (error) {
                    // Timer might already be cleared
                }
            }
        });
        
        return cleared;
    }
    
    /**
     * Clear all timers
     * @private
     */
    _clearAllTimers() {
        let cleared = 0;
        
        this.cleanupTargets.timers.forEach(timer => {
            try {
                if (timer.type === 'interval') {
                    clearInterval(timer.id);
                } else {
                    clearTimeout(timer.id);
                }
                cleared++;
            } catch (error) {
                // Timer might already be cleared
            }
        });
        
        this.cleanupTargets.timers.clear();
        return cleared;
    }
    
    /**
     * Cleanup old event listeners
     * @private
     */
    _cleanupEventListeners(maxAge) {
        const now = Date.now();
        let removed = 0;
        
        for (const [key, listeners] of this.cleanupTargets.eventListeners) {
            const filteredListeners = listeners.filter(listener => {
                if (now - listener.created > maxAge) {
                    try {
                        listener.target.removeEventListener(listener.event, listener.listener);
                        removed++;
                        return false;
                    } catch (error) {
                        // Listener might already be removed
                        return false;
                    }
                }
                return true;
            });
            
            if (filteredListeners.length === 0) {
                this.cleanupTargets.eventListeners.delete(key);
            } else {
                this.cleanupTargets.eventListeners.set(key, filteredListeners);
            }
        }
        
        return removed;
    }
    
    /**
     * Clear all event listeners
     * @private
     */
    _clearAllEventListeners() {
        let removed = 0;
        
        for (const listeners of this.cleanupTargets.eventListeners.values()) {
            for (const listener of listeners) {
                try {
                    listener.target.removeEventListener(listener.event, listener.listener);
                    removed++;
                } catch (error) {
                    // Listener might already be removed
                }
            }
        }
        
        this.cleanupTargets.eventListeners.clear();
        return removed;
    }
    
    /**
     * Evict expired cache items
     * @private
     */
    _evictExpiredCacheItems() {
        const now = Date.now();
        let evicted = 0;
        
        // Evict from image cache
        for (const [key, item] of this.cleanupTargets.imageCache) {
            if (now - item.accessed > this.limits.maxCacheAge) {
                this.cleanupTargets.imageCache.delete(key);
                evicted++;
            }
        }
        
        // Evict from audio cache
        for (const [key, item] of this.cleanupTargets.audioCache) {
            if (now - item.accessed > this.limits.maxCacheAge) {
                this.cleanupTargets.audioCache.delete(key);
                evicted++;
            }
        }
        
        return evicted;
    }
    
    /**
     * Evict LRU cache items
     * @private
     */
    _evictLRUCacheItems(percentage) {
        let evicted = 0;
        
        // Evict from image cache
        const imageItems = Array.from(this.cleanupTargets.imageCache.entries())
            .sort(([,a], [,b]) => a.accessed - b.accessed);
        const imageEvictCount = Math.floor(imageItems.length * percentage);
        
        for (let i = 0; i < imageEvictCount; i++) {
            this.cleanupTargets.imageCache.delete(imageItems[i][0]);
            evicted++;
        }
        
        // Evict from audio cache
        const audioItems = Array.from(this.cleanupTargets.audioCache.entries())
            .sort(([,a], [,b]) => a.accessed - b.accessed);
        const audioEvictCount = Math.floor(audioItems.length * percentage);
        
        for (let i = 0; i < audioEvictCount; i++) {
            this.cleanupTargets.audioCache.delete(audioItems[i][0]);
            evicted++;
        }
        
        return evicted;
    }
    
    /**
     * Clear all cache
     * @private
     */
    _clearAllCache() {
        const total = this.cleanupTargets.imageCache.size + this.cleanupTargets.audioCache.size;
        this.cleanupTargets.imageCache.clear();
        this.cleanupTargets.audioCache.clear();
        return total;
    }
    
    /**
     * Run custom cleanup functions
     * @private
     */
    _runCustomCleanups(emergency = false) {
        let run = 0;
        const now = Date.now();
        
        // Sort by priority (highest first)
        const cleanups = Array.from(this.cleanupTargets.customCleanups.entries())
            .sort(([,a], [,b]) => b.priority - a.priority);
        
        for (const [name, cleanup] of cleanups) {
            try {
                if (emergency || now - cleanup.lastRun > 30000) { // 30 seconds cooldown
                    cleanup.cleanup();
                    cleanup.lastRun = now;
                    cleanup.runCount++;
                    run++;
                }
            } catch (error) {
                console.error(`[ProactiveCleanupManager] Custom cleanup failed: ${name}`, error);
            }
        }
        
        return run;
    }
    
    /**
     * Get current memory usage
     * @private
     */
    _getMemoryUsage() {
        if (performance.memory) {
            return performance.memory.usedJSHeapSize;
        }
        return 0;
    }
    
    /**
     * Calculate memory pressure
     * @private
     */
    _calculateMemoryPressure() {
        if (performance.memory) {
            return performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
        }
        return 0;
    }
    
    /**
     * Request garbage collection
     * @private
     */
    _requestGarbageCollection() {
        // Modern browsers don't expose direct GC control
        // This is a placeholder for potential GC hints
        if (window.gc) {
            window.gc();
        }
    }
    
    /**
     * Force garbage collection (emergency)
     * @private
     */
    _forceGarbageCollection() {
        // Emergency GC attempts
        this._requestGarbageCollection();
        
        // Create memory pressure to encourage GC
        if (performance.memory && performance.memory.usedJSHeapSize > performance.memory.jsHeapSizeLimit * 0.9) {
            // Last resort: create temporary objects to trigger GC
            const temp = new Array(1000).fill(0).map(() => new Array(1000).fill(0));
            temp.length = 0;
        }
    }
    
    /**
     * Update cleanup statistics
     * @private
     */
    _updateCleanupStats(cleanupTime, memoryFreed, strategy) {
        this.stats.cleanupCount++;
        this.stats.totalMemoryFreed += memoryFreed;
        this.stats.averageCleanupTime = 
            (this.stats.averageCleanupTime + cleanupTime) / 2;
        
        // Update efficiency
        const currentEfficiency = memoryFreed / Math.max(1, cleanupTime);
        this.cleanupEfficiency = (this.cleanupEfficiency + currentEfficiency) / 2;
        this.stats.efficiency = this.cleanupEfficiency;
        
        // Track strategy usage
        const strategyCount = this.stats.strategiesUsed.get(strategy.name) || 0;
        this.stats.strategiesUsed.set(strategy.name, strategyCount + 1);
    }
    
    /**
     * Schedule next cleanup based on results
     * @private
     */
    _scheduleNextCleanup(context, results) {
        const memoryPressure = context.memoryPressure || this._calculateMemoryPressure();
        let nextInterval = this.scheduling.baseInterval;
        
        // Adjust based on memory pressure
        if (memoryPressure > 0.8) {
            nextInterval *= this.scheduling.pressureMultiplier;
        } else if (memoryPressure < 0.3) {
            nextInterval *= this.scheduling.idleMultiplier;
        }
        
        // Adjust based on cleanup efficiency
        if (this.cleanupEfficiency < 0.5) {
            nextInterval *= 0.8; // Clean more frequently if inefficient
        } else if (this.cleanupEfficiency > 1.5) {
            nextInterval *= 1.2; // Clean less frequently if very efficient
        }
        
        // Apply bounds
        this.nextCleanup = Math.max(
            this.scheduling.minInterval,
            Math.min(this.scheduling.maxInterval, nextInterval)
        );
    }
    
    /**
     * Evict oldest cache items
     * @private
     */
    _evictOldestCacheItems(cacheType, count) {
        const cache = this.cleanupTargets[cacheType];
        if (!cache || cache.size === 0) return 0;
        
        const items = Array.from(cache.entries())
            .sort(([,a], [,b]) => a.accessed - b.accessed);
        
        const evictCount = Math.min(count, items.length);
        for (let i = 0; i < evictCount; i++) {
            cache.delete(items[i][0]);
        }
        
        return evictCount;
    }
    
    /**
     * Cleanup canvas contexts
     * @private
     */
    _cleanupCanvasContexts() {
        // Canvas contexts don't need explicit cleanup in most cases
        // This is a placeholder for context-specific cleanup
        return 0;
    }
    
    /**
     * Clear all canvas contexts
     * @private
     */
    _clearAllCanvasContexts() {
        const count = this.cleanupTargets.canvasContexts.size;
        this.cleanupTargets.canvasContexts.clear();
        return count;
    }
}