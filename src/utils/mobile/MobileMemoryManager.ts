/**
 * MobileMemoryManager.ts
 * モバイルメモリ管理システム
 * MobilePerformanceOptimizerから分離されたメモリ管理機能
 */

import { getErrorHandler } from '../ErrorHandler.js';
import { getConfigurationManager } from '../../core/ConfigurationManager.js';

// Type definitions
interface ErrorHandler {
    handleError(error: Error, context: string): void;
}

interface ConfigurationManager {
    [key: string]: any;
}

interface MemoryLimits {
    maxMemoryMB: number;
    warningThreshold: number;
    criticalThreshold: number;
    gcTriggerThreshold: number;
    emergencyThreshold: number;
}

interface GarbageCollectionConfig {
    enabled: boolean;
    aggressiveMode: boolean;
    intervalMs: number;
    forceGCOnPressure: boolean;
    preventMemoryLeaks: boolean;
}

interface PressureThresholds {
    moderate: number;
    severe: number;
    critical: number;
}

interface PressureDetectionConfig {
    enabled: boolean;
    currentPressure: 'normal' | 'moderate' | 'severe' | 'critical';
    pressureLevels: string[];
    thresholds: PressureThresholds;
    warningCallbacks: Set<(pressure: string) => void>;
    criticalCallbacks: Set<(pressure: string) => void>;
}

interface ObjectPool {
    name: string;
    factory: () => any;
    available: any[];
    inUse: Set<any>;
    totalCreated: number;
    totalReused: number;
}

interface PoolManagementConfig {
    enabled: boolean;
    objectPools: Map<string, ObjectPool>;
    maxPoolSize: number;
    poolReuse: boolean;
    poolCleanupInterval: number;
    autoCleanup: boolean;
}

interface PlatformOptimizations {
    ios: {
        memoryWarningHandling: boolean;
        backgroundAppRefresh: boolean;
        autoreleasePoolOptimization: boolean;
    };
    android: {
        lowMemoryKiller: boolean;
        compactHeap: boolean;
        trimMemoryOptimization: boolean;
    };
    web: {
        webWorkerMemoryLimit: number;
        offscreenCanvasLimit: number;
        serviceWorkerCaching: boolean;
    };
}

interface MemoryConfig {
    enabled: boolean;
    limits: MemoryLimits;
    garbageCollection: GarbageCollectionConfig;
    pressureDetection: PressureDetectionConfig;
    poolManagement: PoolManagementConfig;
    platformOptimizations: PlatformOptimizations;
}

interface MemoryUsage {
    jsHeapSize: number;
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    textureMemory: number;
    bufferMemory: number;
    domNodes: number;
    eventListeners: number;
}

interface MemoryUsageHistoryEntry {
    timestamp: number;
    jsHeapSize: number;
    totalMemory: number;
    domNodes: number;
}

interface PressureHistoryEntry {
    timestamp: number;
    oldPressure: string;
    newPressure: string;
    memoryUsage: number;
}

interface GCHistoryEntry {
    timestamp: number;
    duration: number;
    forced: boolean;
    memoryBefore: number;
}

interface MemoryHistory {
    usageHistory: MemoryUsageHistoryEntry[];
    pressureHistory: PressureHistoryEntry[];
    gcHistory: GCHistoryEntry[];
    maxHistorySize: number;
    samplingInterval: number;
}

interface MemoryLeak {
    timestamp: number;
    memoryGrowth: number;
    currentMemory: number;
    stackTrace?: string;
}

interface LeakDetectionConfig {
    enabled: boolean;
    trackingEnabled: boolean;
    leakThreshold: number;
    suspiciousGrowthRate: number;
    detectedLeaks: MemoryLeak[];
    monitoringInterval: number;
    baselineMemory: number;
    consistentGrowthCount: number;
}

interface PerformanceImpact {
    gcPauses: number[];
    memoryAllocations: number;
    memoryDeallocations: number;
    averageGCTime: number;
    lastGCTime: number;
}

interface MemoryMonitoring {
    enabled: boolean;
    usage: MemoryUsage;
    history: MemoryHistory;
    leakDetection: LeakDetectionConfig;
    performanceImpact: PerformanceImpact;
}

interface PoolStatistics {
    [poolName: string]: {
        available: number;
        inUse: number;
        totalCreated: number;
        totalReused: number;
        reuseRatio: number;
    };
}

interface MemoryStatistics {
    usage: MemoryUsage;
    pressure: string;
    pools: PoolStatistics;
    leaks: MemoryLeak[];
    performance: PerformanceImpact;
    history: {
        usage: MemoryUsageHistoryEntry[];
        pressure: PressureHistoryEntry[];
        gc: GCHistoryEntry[];
    };
}

export class MobileMemoryManager {
    private errorHandler: ErrorHandler;
    private configManager: ConfigurationManager;
    private memoryConfig: MemoryConfig;
    private memoryMonitoring: MemoryMonitoring;

    constructor() {
        this.errorHandler = getErrorHandler();
        this.configManager = getConfigurationManager();

        // Initialize memory configuration
        this.memoryConfig = {
            enabled: true,
            limits: {
                maxMemoryMB: 512,
                warningThreshold: 0.75,
                criticalThreshold: 0.90,
                gcTriggerThreshold: 0.80,
                emergencyThreshold: 0.95
            },
            garbageCollection: {
                enabled: true,
                aggressiveMode: false,
                intervalMs: 30000,
                forceGCOnPressure: true,
                preventMemoryLeaks: true
            },
            pressureDetection: {
                enabled: true,
                currentPressure: 'normal',
                pressureLevels: ['normal', 'moderate', 'severe', 'critical'],
                thresholds: {
                    moderate: 0.70,
                    severe: 0.85,
                    critical: 0.95
                },
                warningCallbacks: new Set(),
                criticalCallbacks: new Set()
            },
            poolManagement: {
                enabled: true,
                objectPools: new Map(),
                maxPoolSize: 1000,
                poolReuse: true,
                poolCleanupInterval: 30000,
                autoCleanup: true
            },
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
            usage: {
                jsHeapSize: 0,
                jsHeapSizeLimit: 0,
                totalJSHeapSize: 0,
                textureMemory: 0,
                bufferMemory: 0,
                domNodes: 0,
                eventListeners: 0
            },
            history: {
                usageHistory: [],
                pressureHistory: [],
                gcHistory: [],
                maxHistorySize: 100,
                samplingInterval: 5000 // 5 seconds
            },
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
    initializeMemoryManager(): void {
        console.log('[MobileMemoryManager] Initializing memory management...');
        
        try {
            this.setupMemoryMonitoring();
            this.setupObjectPools();
            this.setupPlatformOptimizations();
            this.startMemoryTracking();
            this.setupLeakDetection();
            console.log('[MobileMemoryManager] Memory management initialized successfully');
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'MobileMemoryManager.initializeMemoryManager');
        }
    }
    
    /**
     * Setup memory monitoring
     */
    setupMemoryMonitoring(): void {
        if (typeof performance !== 'undefined' && (performance as any).memory) {
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
    updateMemoryUsage(): void {
        if (typeof performance !== 'undefined' && (performance as any).memory) {
            const memory = (performance as any).memory;
            const usage = this.memoryMonitoring.usage;
            usage.jsHeapSize = memory.usedJSHeapSize / (1024 * 1024); // MB
            usage.jsHeapSizeLimit = memory.jsHeapSizeLimit / (1024 * 1024); // MB
            usage.totalJSHeapSize = memory.totalJSHeapSize / (1024 * 1024); // MB
        }
        
        // Estimate DOM nodes and event listeners
        if (typeof document !== 'undefined') {
            this.memoryMonitoring.usage.domNodes = document.querySelectorAll('*').length;
        }
        
        // Add to history
        this.addMemoryToHistory(this.memoryMonitoring.usage);
        
        // Check memory pressure
        this.updateMemoryPressure();
    }
    
    /**
     * Add memory data to history
     */
    addMemoryToHistory(usage: MemoryUsage): void {
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
    updateMemoryPressure(): void {
        const config = this.memoryConfig.pressureDetection;
        const usage = this.memoryMonitoring.usage;
        const usageRatio = usage.jsHeapSize / usage.jsHeapSizeLimit;
        let newPressure: 'normal' | 'moderate' | 'severe' | 'critical' = 'normal';

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
    handleMemoryPressureChange(oldPressure: string, newPressure: string): void {
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
        switch(newPressure) {
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
    handleCriticalMemoryPressure(): void {
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
    handleSevereMemoryPressure(): void {
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
    handleModerateMemoryPressure(): void {
        console.warn('[MobileMemoryManager] Moderate memory pressure - standard cleanup');
        
        // Standard memory cleanup
        this.performStandardCleanup();
        
        // Trigger garbage collection
        this.triggerGarbageCollection();
    }
    
    /**
     * Handle normal memory pressure
     */
    handleNormalMemoryPressure(): void {
        console.log('[MobileMemoryManager] Normal memory pressure restored');
        
        // Disable aggressive mode
        this.memoryConfig.garbageCollection.aggressiveMode = false;
    }
    
    /**
     * Analyze memory pressure trends
     */
    analyzeMemoryPressure(): void {
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
    setupObjectPools(): void {
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
    createObjectPool(name: string, factory: () => any, initialSize: number = 10): void {
        const poolConfig = this.memoryConfig.poolManagement;
        
        const pool: ObjectPool = {
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
    getFromPool(poolName: string): any {
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
    returnToPool(poolName: string, obj: any): boolean {
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
    resetObject(obj: any): void {
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
    clearObjectPools(ratio: number = 1.0): void {
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
    clearAllObjectPools(): void {
        this.clearObjectPools(1.0);
    }
    
    /**
     * Cleanup object pools
     */
    cleanupObjectPools(): void {
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
    setupPlatformOptimizations(): void {
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
    setupIOSOptimizations(): void {
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
    setupAndroidOptimizations(): void {
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
    setupWebOptimizations(): void {
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
    startMemoryTracking(): void {
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
    setupLeakDetection(): void {
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
    checkForMemoryLeaks(): void {
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
    reportMemoryLeak(memoryGrowth: number): void {
        const leak: MemoryLeak = {
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
    getCurrentMemoryUsage(): number {
        const usage = this.memoryMonitoring.usage;
        return usage.jsHeapSize + usage.textureMemory + usage.bufferMemory;
    }
    
    /**
     * Perform different levels of cleanup
     */
    performEmergencyCleanup(): void {
        console.log('[MobileMemoryManager] Performing emergency cleanup');
        this.clearAllObjectPools();
        this.forceGarbageCollection();
    }

    performAggressiveCleanup(): void {
        console.log('[MobileMemoryManager] Performing aggressive cleanup');
        this.clearObjectPools(0.7);
        this.forceGarbageCollection();
    }

    performStandardCleanup(): void {
        console.log('[MobileMemoryManager] Performing standard cleanup');
        this.clearObjectPools(0.3);
        this.triggerGarbageCollection();
    }
    
    /**
     * Force garbage collection
     */
    forceGarbageCollection(): void {
        if (typeof window !== 'undefined' && (window as any).gc) {
            const startTime = performance.now();
            (window as any).gc();
            const gcTime = performance.now() - startTime;
            this.recordGarbageCollection(gcTime, true);
        } else {
            this.triggerGarbageCollection();
        }
    }
    
    /**
     * Trigger garbage collection
     */
    triggerGarbageCollection(): void {
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
    recordGarbageCollection(duration: number, forced: boolean): void {
        const gcEvent: GCHistoryEntry = {
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
    monitorGarbageCollection(): void {
        if (this.memoryConfig.garbageCollection.aggressiveMode) {
            this.forceGarbageCollection();
        }
    }
    
    /**
     * Handle memory warning
     */
    handleMemoryWarning(): void {
        console.warn('[MobileMemoryManager] Memory warning received');
        this.performAggressiveCleanup();
    }
    
    /**
     * Handle page hidden event
     */
    handlePageHidden(): void {
        console.log('[MobileMemoryManager] Page hidden - performing cleanup');
        this.performStandardCleanup();
    }
    
    /**
     * Investigate memory growth
     */
    investigateMemoryGrowth(): void {
        console.log('[MobileMemoryManager] Investigating memory growth patterns');
        
        // This would typically include more sophisticated analysis
        this.performAggressiveCleanup();
    }
    
    /**
     * Notify callbacks
     */
    notifyCallbacks(callbacks: Set<(pressure: string) => void>, pressure: string): void {
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
    addMemoryPressureCallback(callback: (pressure: string) => void, type: 'warning' | 'critical' = 'warning'): void {
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
    removeMemoryPressureCallback(callback: (pressure: string) => void, type: 'warning' | 'critical' = 'warning'): void {
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
    getMemoryStatistics(): MemoryStatistics {
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
    getPoolStatistics(): PoolStatistics {
        const poolConfig = this.memoryConfig.poolManagement;
        const stats: PoolStatistics = {};
        
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
    dispose(): void {
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
            this.errorHandler.handleError(error as Error, 'MobileMemoryManager.dispose');
        }
    }
}