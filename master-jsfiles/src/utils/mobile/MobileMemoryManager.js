/**
 * MobileMemoryManager.js
 * モバイルメモリ管理システム
 * MobilePerformanceOptimizerから分離されたメモリ管理機能
 */

import { getErrorHandler } from '../ErrorHandler.js';
import { getConfigurationManager } from '../../core/ConfigurationManager.js';

export class MobileMemoryManager {
    constructor() {
        this.errorHandler = getErrorHandler();
        this.configManager = getConfigurationManager();
        
        // Memory management configuration
        this.memoryConfig = {
            enabled: true,
            
            // Memory limits and thresholds
            limits: {
                maxMemoryMB: 512,
                warningThreshold: 0.8,
                criticalThreshold: 0.95,
                gcTriggerThreshold: 0.85,
                emergencyThreshold: 0.98
            },
            
            // Garbage collection settings
            garbageCollection: {
                enabled: true,
                aggressiveMode: false,
                intervalMs: 30000, // 30 seconds
                forceGCOnPressure: true,
                preventMemoryLeaks: true
            },
            
            // Memory pressure detection
            pressureDetection: {
                enabled: true,
                currentPressure: 'normal', // 'normal', 'moderate', 'severe', 'critical'
                pressureLevels: ['normal', 'moderate', 'severe', 'critical'],
                thresholds: {
                    moderate: 0.70,
                    severe: 0.85,
                    critical: 0.95
                },
                warningCallbacks: new Set(),
                criticalCallbacks: new Set()
            },
            
            // Object pool management
            poolManagement: {
                enabled: true,
                objectPools: new Map(),
                maxPoolSize: 1000,
                poolReuse: true,
                poolCleanupInterval: 30000,
                autoCleanup: true
            },
            
            // Platform-specific optimizations
            platformOptimizations: {
                ios: {
                    memoryWarningHandling: true,
                    backgroundAppRefresh: false,
                    autoreleasePoolOptimization: true
                },
                android: {
                    lowMemoryKiller: true,
                    compactHeap: true,
                    trimMemoryOptimization: true
                },
                web: {
                    webWorkerMemoryLimit: 256, // MB
                    offscreenCanvasLimit: 128,
                    serviceWorkerCaching: true
                }
            }
        };
        
        // Memory monitoring state
        this.memoryMonitoring = {
            enabled: true,
            
            // Current memory usage
            usage: {
                jsHeapSize: 0,
                jsHeapSizeLimit: 0,
                totalJSHeapSize: 0,
                textureMemory: 0,
                bufferMemory: 0,
                domNodes: 0,
                eventListeners: 0
            },
            
            // Memory history for trend analysis
            history: {
                usageHistory: [],
                pressureHistory: [],
                gcHistory: [],
                maxHistorySize: 100,
                samplingInterval: 5000 // 5 seconds
            },
            
            // Leak detection
            leakDetection: {
                enabled: true,
                trackingEnabled: true,
                leakThreshold: 50, // MB
                suspiciousGrowthRate: 10, // MB/minute
                detectedLeaks: [],
                monitoringInterval: 15000,
                baselineMemory: 0,
                consistentGrowthCount: 0
            },
            
            // Performance impact tracking
            performanceImpact: {
                gcPauses: [],
                memoryAllocations: 0,
                memoryDeallocations: 0,
                averageGCTime: 0,
                lastGCTime: 0
            }
        };
        
        // Initialize memory manager
        this.initializeMemoryManager();
    }
    
    /**
     * Initialize memory management system
     */
    initializeMemoryManager() {
        console.log('[MobileMemoryManager] Initializing memory management...');
        
        try {
            this.setupMemoryMonitoring();
            this.setupObjectPools();
            this.setupPlatformOptimizations();
            this.startMemoryTracking();
            this.setupLeakDetection();
            
            console.log('[MobileMemoryManager] Memory management initialized successfully');
        } catch (error) {
            this.errorHandler.handleError(error, 'MobileMemoryManager.initializeMemoryManager');
        }
    }
    
    /**
     * Setup memory monitoring
     */
    setupMemoryMonitoring() {
        if (typeof performance !== 'undefined' && performance.memory) {
            this.updateMemoryUsage();
            
            // Set up periodic memory monitoring
            setInterval(() => {
                this.updateMemoryUsage();
                this.analyzeMemoryPressure();
                this.checkForMemoryLeaks();
            }, this.memoryMonitoring.history.samplingInterval);
            
            console.log('[MobileMemoryManager] Memory monitoring enabled');
        } else {
            console.warn('[MobileMemoryManager] Performance.memory API not available');
        }
    }
    
    /**
     * Update memory usage statistics
     */
    updateMemoryUsage() {
        const usage = this.memoryMonitoring.usage;
        
        if (typeof performance !== 'undefined' && performance.memory) {
            usage.jsHeapSize = performance.memory.usedJSHeapSize / (1024 * 1024); // MB
            usage.jsHeapSizeLimit = performance.memory.jsHeapSizeLimit / (1024 * 1024); // MB
            usage.totalJSHeapSize = performance.memory.totalJSHeapSize / (1024 * 1024); // MB
        }
        
        // Estimate DOM nodes and event listeners
        if (typeof document !== 'undefined') {
            usage.domNodes = document.querySelectorAll('*').length;
        }
        
        // Add to history
        this.addMemoryToHistory(usage);
        
        // Check memory pressure
        this.updateMemoryPressure();
    }
    
    /**
     * Add memory data to history
     */
    addMemoryToHistory(usage) {
        const history = this.memoryMonitoring.history;
        const timestamp = Date.now();
        
        // Add usage to history
        history.usageHistory.push({
            timestamp,
            jsHeapSize: usage.jsHeapSize,
            totalMemory: usage.jsHeapSize + usage.textureMemory + usage.bufferMemory,
            domNodes: usage.domNodes
        });
        
        // Maintain history size
        if (history.usageHistory.length > history.maxHistorySize) {
            history.usageHistory.shift();
        }
    }
    
    /**
     * Update memory pressure
     */
    updateMemoryPressure() {
        const usage = this.memoryMonitoring.usage;
        const config = this.memoryConfig.pressureDetection;
        const limits = this.memoryConfig.limits;
        
        const totalUsage = usage.jsHeapSize + usage.textureMemory + usage.bufferMemory;
        const usageRatio = totalUsage / limits.maxMemoryMB;
        
        let newPressure = 'normal';
        
        if (usageRatio >= config.thresholds.critical) {
            newPressure = 'critical';
        } else if (usageRatio >= config.thresholds.severe) {
            newPressure = 'severe';
        } else if (usageRatio >= config.thresholds.moderate) {
            newPressure = 'moderate';
        }
        
        if (newPressure !== config.currentPressure) {
            this.handleMemoryPressureChange(config.currentPressure, newPressure);
            config.currentPressure = newPressure;
        }
    }
    
    /**
     * Handle memory pressure state changes
     */
    handleMemoryPressureChange(oldPressure, newPressure) {
        console.log(`[MobileMemoryManager] Memory pressure changed: ${oldPressure} → ${newPressure}`);
        
        const config = this.memoryConfig.pressureDetection;
        
        // Add to pressure history
        this.memoryMonitoring.history.pressureHistory.push({
            timestamp: Date.now(),
            oldPressure,
            newPressure,
            memoryUsage: this.getCurrentMemoryUsage()
        });
        
        // Execute callbacks
        switch (newPressure) {
            case 'critical':
                this.handleCriticalMemoryPressure();
                this.notifyCallbacks(config.criticalCallbacks, newPressure);
                break;
                
            case 'severe':
                this.handleSevereMemoryPressure();
                this.notifyCallbacks(config.warningCallbacks, newPressure);
                break;
                
            case 'moderate':
                this.handleModerateMemoryPressure();
                this.notifyCallbacks(config.warningCallbacks, newPressure);
                break;
                
            case 'normal':
                this.handleNormalMemoryPressure();
                break;
        }
    }
    
    /**
     * Handle critical memory pressure
     */
    handleCriticalMemoryPressure() {
        console.error('[MobileMemoryManager] Critical memory pressure - emergency cleanup');
        
        // Emergency memory cleanup
        this.performEmergencyCleanup();
        
        // Force garbage collection
        this.forceGarbageCollection();
        
        // Clear all object pools
        this.clearAllObjectPools();
        
        // Enable aggressive mode
        this.memoryConfig.garbageCollection.aggressiveMode = true;
    }
    
    /**
     * Handle severe memory pressure
     */
    handleSevereMemoryPressure() {
        console.warn('[MobileMemoryManager] Severe memory pressure - aggressive cleanup');
        
        // Aggressive memory cleanup
        this.performAggressiveCleanup();
        
        // Force garbage collection
        this.forceGarbageCollection();
        
        // Clear half of object pools
        this.clearObjectPools(0.5);
    }
    
    /**
     * Handle moderate memory pressure
     */
    handleModerateMemoryPressure() {
        console.warn('[MobileMemoryManager] Moderate memory pressure - standard cleanup');
        
        // Standard memory cleanup
        this.performStandardCleanup();
        
        // Trigger garbage collection
        this.triggerGarbageCollection();
    }
    
    /**
     * Handle normal memory pressure
     */
    handleNormalMemoryPressure() {
        console.log('[MobileMemoryManager] Normal memory pressure restored');
        
        // Disable aggressive mode
        this.memoryConfig.garbageCollection.aggressiveMode = false;
    }
    
    /**
     * Analyze memory pressure trends
     */
    analyzeMemoryPressure() {
        const history = this.memoryMonitoring.history;
        
        if (history.usageHistory.length < 10) return;
        
        // Calculate memory growth rate
        const recent = history.usageHistory.slice(-10);
        const oldest = recent[0];
        const newest = recent[recent.length - 1];
        const timeDiff = (newest.timestamp - oldest.timestamp) / 60000; // minutes
        const memoryDiff = newest.totalMemory - oldest.totalMemory;
        const growthRate = timeDiff > 0 ? memoryDiff / timeDiff : 0;
        
        // Check for concerning growth patterns
        if (growthRate > 5) { // 5MB per minute
            console.warn(`[MobileMemoryManager] High memory growth rate detected: ${growthRate.toFixed(2)} MB/min`);
            this.investigateMemoryGrowth();
        }
    }
    
    /**
     * Setup object pools
     */
    setupObjectPools() {
        const poolConfig = this.memoryConfig.poolManagement;
        
        if (!poolConfig.enabled) return;
        
        // Initialize common object pools
        this.createObjectPool('Vector2', () => ({ x: 0, y: 0 }));
        this.createObjectPool('Vector3', () => ({ x: 0, y: 0, z: 0 }));
        this.createObjectPool('Rectangle', () => ({ x: 0, y: 0, width: 0, height: 0 }));
        this.createObjectPool('Color', () => ({ r: 0, g: 0, b: 0, a: 1 }));
        
        // Set up pool cleanup
        if (poolConfig.autoCleanup) {
            setInterval(() => {
                this.cleanupObjectPools();
            }, poolConfig.poolCleanupInterval);
        }
        
        console.log('[MobileMemoryManager] Object pools initialized');
    }
    
    /**
     * Create object pool
     */
    createObjectPool(name, factory, initialSize = 10) {
        const poolConfig = this.memoryConfig.poolManagement;
        
        const pool = {
            name,
            factory,
            available: [],
            inUse: new Set(),
            totalCreated: 0,
            totalReused: 0
        };
        
        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            pool.available.push(factory());
            pool.totalCreated++;
        }
        
        poolConfig.objectPools.set(name, pool);
        
        console.log(`[MobileMemoryManager] Object pool created: ${name} (initial size: ${initialSize})`);
    }
    
    /**
     * Get object from pool
     */
    getFromPool(poolName) {
        const poolConfig = this.memoryConfig.poolManagement;
        const pool = poolConfig.objectPools.get(poolName);
        
        if (!pool) {
            console.warn(`[MobileMemoryManager] Pool not found: ${poolName}`);
            return null;
        }
        
        let obj;
        if (pool.available.length > 0) {
            obj = pool.available.pop();
            pool.totalReused++;
        } else {
            obj = pool.factory();
            pool.totalCreated++;
        }
        
        pool.inUse.add(obj);
        return obj;
    }
    
    /**
     * Return object to pool
     */
    returnToPool(poolName, obj) {
        const poolConfig = this.memoryConfig.poolManagement;
        const pool = poolConfig.objectPools.get(poolName);
        
        if (!pool || !pool.inUse.has(obj)) {
            return false;
        }
        
        pool.inUse.delete(obj);
        
        // Reset object properties if needed
        this.resetObject(obj);
        
        // Return to pool if not at capacity
        if (pool.available.length < poolConfig.maxPoolSize) {
            pool.available.push(obj);
        }
        
        return true;
    }
    
    /**
     * Reset object to default state
     */
    resetObject(obj) {
        // Reset common object types
        if (obj.hasOwnProperty('x') && obj.hasOwnProperty('y')) {
            obj.x = 0;
            obj.y = 0;
            if (obj.hasOwnProperty('z')) obj.z = 0;
        }
        
        if (obj.hasOwnProperty('width') && obj.hasOwnProperty('height')) {
            obj.width = 0;
            obj.height = 0;
        }
        
        if (obj.hasOwnProperty('r') && obj.hasOwnProperty('g') && obj.hasOwnProperty('b')) {
            obj.r = 0;
            obj.g = 0;
            obj.b = 0;
            if (obj.hasOwnProperty('a')) obj.a = 1;
        }
    }
    
    /**
     * Clear object pools
     */
    clearObjectPools(ratio = 1.0) {
        const poolConfig = this.memoryConfig.poolManagement;
        
        poolConfig.objectPools.forEach((pool, name) => {
            const clearCount = Math.floor(pool.available.length * ratio);
            pool.available.splice(0, clearCount);
            
            console.log(`[MobileMemoryManager] Cleared ${clearCount} objects from pool: ${name}`);
        });
    }
    
    /**
     * Clear all object pools
     */
    clearAllObjectPools() {
        this.clearObjectPools(1.0);
    }
    
    /**
     * Cleanup object pools
     */
    cleanupObjectPools() {
        const poolConfig = this.memoryConfig.poolManagement;
        
        poolConfig.objectPools.forEach((pool, name) => {
            // Remove excess objects if pool is over capacity
            const maxSize = Math.floor(poolConfig.maxPoolSize * 0.8);
            if (pool.available.length > maxSize) {
                const excess = pool.available.length - maxSize;
                pool.available.splice(0, excess);
                
                console.log(`[MobileMemoryManager] Pool cleanup: removed ${excess} excess objects from ${name}`);
            }
        });
    }
    
    /**
     * Setup platform-specific optimizations
     */
    setupPlatformOptimizations() {
        const userAgent = navigator.userAgent.toLowerCase();
        
        if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
            this.setupIOSOptimizations();
        } else if (userAgent.includes('android')) {
            this.setupAndroidOptimizations();
        } else {
            this.setupWebOptimizations();
        }
    }
    
    /**
     * Setup iOS-specific optimizations
     */
    setupIOSOptimizations() {
        const iosConfig = this.memoryConfig.platformOptimizations.ios;
        
        if (iosConfig.memoryWarningHandling) {
            // Listen for memory warnings (if available)
            window.addEventListener('pagehide', () => {
                this.handleMemoryWarning();
            });
        }
        
        console.log('[MobileMemoryManager] iOS optimizations enabled');
    }
    
    /**
     * Setup Android-specific optimizations
     */
    setupAndroidOptimizations() {
        const androidConfig = this.memoryConfig.platformOptimizations.android;
        
        if (androidConfig.lowMemoryKiller) {
            // More aggressive cleanup for Android
            this.memoryConfig.garbageCollection.intervalMs = 20000; // 20 seconds
        }
        
        console.log('[MobileMemoryManager] Android optimizations enabled');
    }
    
    /**
     * Setup web-specific optimizations
     */
    setupWebOptimizations() {
        const webConfig = this.memoryConfig.platformOptimizations.web;
        
        // Set up visibility change handling
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handlePageHidden();
            }
        });
        
        console.log('[MobileMemoryManager] Web optimizations enabled');
    }
    
    /**
     * Start memory tracking
     */
    startMemoryTracking() {
        // Regular memory monitoring
        setInterval(() => {
            this.updateMemoryUsage();
        }, this.memoryMonitoring.history.samplingInterval);
        
        // Garbage collection monitoring
        if (this.memoryConfig.garbageCollection.enabled) {
            setInterval(() => {
                this.monitorGarbageCollection();
            }, this.memoryConfig.garbageCollection.intervalMs);
        }
        
        console.log('[MobileMemoryManager] Memory tracking started');
    }
    
    /**
     * Setup leak detection
     */
    setupLeakDetection() {
        const leakConfig = this.memoryMonitoring.leakDetection;
        
        if (!leakConfig.enabled) return;
        
        // Set baseline memory
        leakConfig.baselineMemory = this.getCurrentMemoryUsage();
        
        // Start leak monitoring
        setInterval(() => {
            this.checkForMemoryLeaks();
        }, leakConfig.monitoringInterval);
        
        console.log('[MobileMemoryManager] Leak detection enabled');
    }
    
    /**
     * Check for memory leaks
     */
    checkForMemoryLeaks() {
        const leakConfig = this.memoryMonitoring.leakDetection;
        const currentMemory = this.getCurrentMemoryUsage();
        const memoryGrowth = currentMemory - leakConfig.baselineMemory;
        
        // Check for significant memory growth
        if (memoryGrowth > leakConfig.leakThreshold) {
            leakConfig.consistentGrowthCount++;
            
            if (leakConfig.consistentGrowthCount >= 3) {
                this.reportMemoryLeak(memoryGrowth);
                leakConfig.consistentGrowthCount = 0;
                leakConfig.baselineMemory = currentMemory; // Reset baseline
            }
        } else {
            leakConfig.consistentGrowthCount = 0;
        }
    }
    
    /**
     * Report memory leak
     */
    reportMemoryLeak(memoryGrowth) {
        const leak = {
            timestamp: Date.now(),
            memoryGrowth,
            currentMemory: this.getCurrentMemoryUsage(),
            stackTrace: new Error().stack
        };
        
        this.memoryMonitoring.leakDetection.detectedLeaks.push(leak);
        
        console.error(`[MobileMemoryManager] Memory leak detected: ${memoryGrowth.toFixed(2)} MB growth`);
        
        // Trigger cleanup
        this.performAggressiveCleanup();
    }
    
    /**
     * Get current memory usage
     */
    getCurrentMemoryUsage() {
        const usage = this.memoryMonitoring.usage;
        return usage.jsHeapSize + usage.textureMemory + usage.bufferMemory;
    }
    
    /**
     * Perform different levels of cleanup
     */
    performEmergencyCleanup() {
        console.log('[MobileMemoryManager] Performing emergency cleanup');
        this.clearAllObjectPools();
        this.forceGarbageCollection();
    }
    
    performAggressiveCleanup() {
        console.log('[MobileMemoryManager] Performing aggressive cleanup');
        this.clearObjectPools(0.7);
        this.forceGarbageCollection();
    }
    
    performStandardCleanup() {
        console.log('[MobileMemoryManager] Performing standard cleanup');
        this.clearObjectPools(0.3);
        this.triggerGarbageCollection();
    }
    
    /**
     * Force garbage collection
     */
    forceGarbageCollection() {
        if (typeof window !== 'undefined' && window.gc) {
            const startTime = performance.now();
            window.gc();
            const gcTime = performance.now() - startTime;
            
            this.recordGarbageCollection(gcTime, true);
        } else {
            this.triggerGarbageCollection();
        }
    }
    
    /**
     * Trigger garbage collection
     */
    triggerGarbageCollection() {
        // Create temporary objects to trigger GC
        const temp = [];
        for (let i = 0; i < 1000; i++) {
            temp.push(new Array(1000));
        }
        temp.length = 0;
        
        this.recordGarbageCollection(0, false);
    }
    
    /**
     * Record garbage collection event
     */
    recordGarbageCollection(duration, forced) {
        const gcEvent = {
            timestamp: Date.now(),
            duration,
            forced,
            memoryBefore: this.getCurrentMemoryUsage()
        };
        
        this.memoryMonitoring.history.gcHistory.push(gcEvent);
        this.memoryMonitoring.performanceImpact.gcPauses.push(duration);
        
        // Update average GC time
        const gcPauses = this.memoryMonitoring.performanceImpact.gcPauses;
        if (gcPauses.length > 0) {
            const sum = gcPauses.reduce((a, b) => a + b, 0);
            this.memoryMonitoring.performanceImpact.averageGCTime = sum / gcPauses.length;
        }
        
        // Limit history size
        if (gcPauses.length > 50) {
            gcPauses.shift();
        }
    }
    
    /**
     * Monitor garbage collection
     */
    monitorGarbageCollection() {
        if (this.memoryConfig.garbageCollection.aggressiveMode) {
            this.forceGarbageCollection();
        }
    }
    
    /**
     * Handle memory warning
     */
    handleMemoryWarning() {
        console.warn('[MobileMemoryManager] Memory warning received');
        this.performAggressiveCleanup();
    }
    
    /**
     * Handle page hidden event
     */
    handlePageHidden() {
        console.log('[MobileMemoryManager] Page hidden - performing cleanup');
        this.performStandardCleanup();
    }
    
    /**
     * Investigate memory growth
     */
    investigateMemoryGrowth() {
        console.log('[MobileMemoryManager] Investigating memory growth patterns');
        
        // This would typically include more sophisticated analysis
        this.performAggressiveCleanup();
    }
    
    /**
     * Notify callbacks
     */
    notifyCallbacks(callbacks, pressure) {
        callbacks.forEach(callback => {
            try {
                callback(pressure);
            } catch (error) {
                console.error('[MobileMemoryManager] Error in pressure callback:', error);
            }
        });
    }
    
    /**
     * Add memory pressure callback
     */
    addMemoryPressureCallback(callback, type = 'warning') {
        const config = this.memoryConfig.pressureDetection;
        
        if (type === 'critical') {
            config.criticalCallbacks.add(callback);
        } else {
            config.warningCallbacks.add(callback);
        }
    }
    
    /**
     * Remove memory pressure callback
     */
    removeMemoryPressureCallback(callback, type = 'warning') {
        const config = this.memoryConfig.pressureDetection;
        
        if (type === 'critical') {
            config.criticalCallbacks.delete(callback);
        } else {
            config.warningCallbacks.delete(callback);
        }
    }
    
    /**
     * Get memory statistics
     */
    getMemoryStatistics() {
        return {
            usage: this.memoryMonitoring.usage,
            pressure: this.memoryConfig.pressureDetection.currentPressure,
            pools: this.getPoolStatistics(),
            leaks: this.memoryMonitoring.leakDetection.detectedLeaks,
            performance: this.memoryMonitoring.performanceImpact,
            history: {
                usage: this.memoryMonitoring.history.usageHistory.slice(-10),
                pressure: this.memoryMonitoring.history.pressureHistory.slice(-10),
                gc: this.memoryMonitoring.history.gcHistory.slice(-10)
            }
        };
    }
    
    /**
     * Get pool statistics
     */
    getPoolStatistics() {
        const poolConfig = this.memoryConfig.poolManagement;
        const stats = {};
        
        poolConfig.objectPools.forEach((pool, name) => {
            stats[name] = {
                available: pool.available.length,
                inUse: pool.inUse.size,
                totalCreated: pool.totalCreated,
                totalReused: pool.totalReused,
                reuseRatio: pool.totalCreated > 0 ? pool.totalReused / pool.totalCreated : 0
            };
        });
        
        return stats;
    }
    
    /**
     * Dispose memory manager
     */
    dispose() {
        try {
            // Clear all object pools
            this.clearAllObjectPools();
            
            // Clear monitoring data
            this.memoryMonitoring.history.usageHistory = [];
            this.memoryMonitoring.history.pressureHistory = [];
            this.memoryMonitoring.history.gcHistory = [];
            this.memoryMonitoring.leakDetection.detectedLeaks = [];
            this.memoryMonitoring.performanceImpact.gcPauses = [];
            
            // Clear callbacks
            this.memoryConfig.pressureDetection.warningCallbacks.clear();
            this.memoryConfig.pressureDetection.criticalCallbacks.clear();
            
            console.log('[MobileMemoryManager] Memory manager disposed');
        } catch (error) {
            this.errorHandler.handleError(error, 'MobileMemoryManager.dispose');
        }
    }
}