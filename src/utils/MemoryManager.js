/**
 * Intelligent Memory Management System
 * 高度なメモリリーク検出とプロアクティブクリーンアップ機能を提供
 * 
 * 新機能:
 * - 高度メモリリーク検出アルゴリズム
 * - プロアクティブガベージコレクション管理
 * - メモリ使用パターン解析
 * - インテリジェントクリーンアップスケジューリング
 */
export class MemoryManager {
    constructor() {
        this.trackedObjects = new WeakMap();
        this.timers = new Set();
        this.eventListeners = new Map();
        this.canvasContexts = new Set();
        this.imageCache = new Map();
        this.audioCache = new Map();
        
        // Enhanced memory tracking
        this.memoryUsageHistory = [];
        this.leakSuspects = new Map();
        this.memoryPressureEvents = [];
        this.objectCreationPatterns = new Map();
        this.memorySnapshots = [];
        
        // Advanced leak detection
        this.leakDetection = {
            enabled: true,
            sensitivity: 'medium', // 'low', 'medium', 'high'
            thresholds: {
                suspiciousGrowth: 0.05, // 5% growth per check
                criticalGrowth: 0.15,   // 15% growth per check
                memoryPressure: 0.8,    // 80% usage threshold
                leakConfidence: 0.7     // 70% confidence for leak reporting
            },
            analysisWindow: 60000, // 1 minute analysis window
            lastAnalysis: 0
        };
        
        // Proactive cleanup management
        this.proactiveCleanup = {
            enabled: true,
            mode: 'adaptive', // 'conservative', 'adaptive', 'aggressive'
            lastCleanup: 0,
            nextCleanup: 30000, // 30 seconds default
            cleanupEfficiency: 1.0,
            
            // Intelligent scheduling
            scheduling: {
                baseInterval: 30000,
                minInterval: 5000,
                maxInterval: 120000,
                pressureMultiplier: 0.5, // Reduce interval under pressure
                idleMultiplier: 2.0      // Increase interval when idle
            }
        };
        
        // Memory usage patterns
        this.usagePatterns = {
            growthRate: 0,
            peakUsage: 0,
            averageUsage: 0,
            volatility: 0, // How much memory usage fluctuates
            trendDirection: 'stable', // 'growing', 'shrinking', 'stable'
            lastTrendAnalysis: 0
        };
        
        this.stats = {
            objectsCreated: 0,
            objectsDestroyed: 0,
            timersCreated: 0,
            timersCleared: 0,
            listenersAdded: 0,
            listenersRemoved: 0,
            
            // Enhanced statistics
            memoryLeaksDetected: 0,
            memoryLeaksSuspected: 0,
            proactiveCleanups: 0,
            memoryPressureEvents: 0,
            gcTriggered: 0,
            cleanupEfficiency: 1.0,
            
            // Current state
            currentMemoryPressure: 0,
            leakRiskLevel: 'low', // 'low', 'medium', 'high', 'critical'
            memoryHealthScore: 1.0 // 0-1, higher is better
        };
        
        // Enhanced cleanup interval with intelligent scheduling
        this.cleanupInterval = setInterval(() => {
            this.performIntelligentCleanup();
        }, this.proactiveCleanup.nextCleanup);
        
        this.bindMethods();
        this.initializeMemoryMonitoring();
        
        console.log('[MemoryManager] Intelligent memory management system initialized');
    }
    
    /**
     * Initialize advanced memory monitoring
     */
    initializeMemoryMonitoring() {
        // Take initial memory snapshot
        this.takeMemorySnapshot();
        
        // Start continuous monitoring
        this.monitoringInterval = setInterval(() => {
            this.performMemoryAnalysis();
        }, 5000); // Every 5 seconds
        
        // Performance observer for memory pressure
        if ('PerformanceObserver' in window) {
            try {
                this.performanceObserver = new PerformanceObserver((list) => {
                    this.handlePerformanceEntries(list.getEntries());
                });
                this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
            } catch (error) {
                console.warn('[MemoryManager] PerformanceObserver not available');
            }
        }
        
        // Memory pressure event listener
        if ('memory' in performance) {
            // Set up memory pressure monitoring
            this.setupMemoryPressureDetection();
        }
    }
    
    /**
     * Take memory snapshot for analysis
     */
    takeMemorySnapshot() {
        const snapshot = this.getCurrentMemoryState();
        
        this.memorySnapshots.push({
            timestamp: Date.now(),
            ...snapshot
        });
        
        // Keep only recent snapshots (last 50)
        if (this.memorySnapshots.length > 50) {
            this.memorySnapshots.shift();
        }
        
        // Update usage patterns
        this.updateUsagePatterns(snapshot);
    }
    
    /**
     * Get current memory state
     * @returns {object} Current memory state
     */
    getCurrentMemoryState() {
        const state = {
            usedMemory: 0,
            totalMemory: 0,
            limitMemory: 0,
            pressure: 0
        };
        
        if (performance.memory) {
            state.usedMemory = performance.memory.usedJSHeapSize;
            state.totalMemory = performance.memory.totalJSHeapSize;
            state.limitMemory = performance.memory.jsHeapSizeLimit;
            state.pressure = state.limitMemory > 0 ? state.usedMemory / state.limitMemory : 0;
        }
        
        return state;
    }
    
    /**
     * Update memory usage patterns
     * @param {object} snapshot - Memory snapshot
     */
    updateUsagePatterns(snapshot) {
        const now = Date.now();
        
        // Update peak usage
        if (snapshot.usedMemory > this.usagePatterns.peakUsage) {
            this.usagePatterns.peakUsage = snapshot.usedMemory;
        }
        
        // Calculate average usage
        const recentSnapshots = this.memorySnapshots.slice(-10);
        if (recentSnapshots.length > 0) {
            this.usagePatterns.averageUsage = 
                recentSnapshots.reduce((sum, s) => sum + s.usedMemory, 0) / recentSnapshots.length;
        }
        
        // Calculate volatility (standard deviation)
        if (recentSnapshots.length > 2) {
            const mean = this.usagePatterns.averageUsage;
            const variance = recentSnapshots.reduce((sum, s) => 
                sum + Math.pow(s.usedMemory - mean, 2), 0) / recentSnapshots.length;
            this.usagePatterns.volatility = Math.sqrt(variance);
        }
        
        // Update current memory pressure
        this.stats.currentMemoryPressure = snapshot.pressure;
    }
    
    /**
     * Perform comprehensive memory analysis
     */
    performMemoryAnalysis() {
        try {
            // Take memory snapshot
            this.takeMemorySnapshot();
            
            // Perform leak detection if enough data is available
            if (this.memorySnapshots.length >= 5) {
                const leakAnalysis = this.detectMemoryLeaks();
                
                // Handle critical memory situations
                if (leakAnalysis.riskLevel === 'critical') {
                    this.handleCriticalMemoryState(leakAnalysis);
                }
            }
            
            // Update memory pressure events
            this.trackMemoryPressureEvents();
            
        } catch (error) {
            console.error('[MemoryManager] Error during memory analysis:', error);
        }
    }
    
    /**
     * Handle critical memory state
     * @param {object} leakAnalysis - Leak analysis results
     */
    handleCriticalMemoryState(leakAnalysis) {
        console.warn('[MemoryManager] Critical memory state detected!', leakAnalysis);
        
        // Immediate emergency cleanup
        const emergencyStrategy = {
            mode: 'emergency',
            aggressiveness: 1.0,
            priorities: ['gc', 'caches', 'timers', 'listeners', 'objects'],
            maxAge: 30000, // 30 seconds
            forceGC: true
        };
        
        this.executeCleanupStrategy(emergencyStrategy);
        
        // Record the event
        this.stats.memoryPressureEvents++;
        this.memoryPressureEvents.push({
            timestamp: Date.now(),
            type: 'critical',
            analysis: leakAnalysis,
            actionTaken: 'emergency_cleanup'
        });
        
        // Notify about critical state
        this.notifyCriticalMemoryState(leakAnalysis);
    }
    
    /**
     * Track memory pressure events
     */
    trackMemoryPressureEvents() {
        const currentPressure = this.stats.currentMemoryPressure;
        const lastEvent = this.memoryPressureEvents[this.memoryPressureEvents.length - 1];
        
        // Check for significant pressure changes
        if (currentPressure > 0.8 && (!lastEvent || lastEvent.pressure < 0.8)) {
            this.memoryPressureEvents.push({
                timestamp: Date.now(),
                type: 'high_pressure',
                pressure: currentPressure,
                duration: 0
            });
            
            console.warn(`[MemoryManager] High memory pressure detected: ${(currentPressure * 100).toFixed(1)}%`);
        }
        
        // Update ongoing pressure event duration
        if (lastEvent && lastEvent.type === 'high_pressure' && currentPressure > 0.8) {
            lastEvent.duration = Date.now() - lastEvent.timestamp;
        }
        
        // Keep only recent pressure events (last 20)
        if (this.memoryPressureEvents.length > 20) {
            this.memoryPressureEvents.shift();
        }
    }
    
    /**
     * Setup memory pressure detection
     */
    setupMemoryPressureDetection() {
        // Use performance.memory for pressure detection
        if (!performance.memory) return;
        
        setInterval(() => {
            const pressure = this.stats.currentMemoryPressure;
            
            if (pressure > 0.9) {
                // Critical pressure - immediate action
                this.handleCriticalMemoryPressure();
            } else if (pressure > 0.7) {
                // High pressure - proactive cleanup
                this.handleHighMemoryPressure();
            }
        }, 2000); // Check every 2 seconds
    }
    
    /**
     * Handle critical memory pressure
     */
    handleCriticalMemoryPressure() {
        console.error('[MemoryManager] CRITICAL memory pressure - emergency measures activated');
        
        // Force immediate garbage collection
        this.forceGarbageCollection();
        
        // Emergency cleanup with maximum aggressiveness
        const beforeCleanup = this.getCurrentMemoryState();
        this.executeCleanupStrategy({
            mode: 'emergency',
            aggressiveness: 1.0,
            priorities: ['gc', 'caches', 'timers', 'listeners', 'objects'],
            maxAge: 10000, // 10 seconds
            forceGC: true
        });
        
        // Measure effectiveness
        const afterCleanup = this.getCurrentMemoryState();
        const memoryFreed = beforeCleanup.usedMemory - afterCleanup.usedMemory;
        
        console.log(`[MemoryManager] Emergency cleanup freed ${(memoryFreed / 1024 / 1024).toFixed(2)}MB`);
    }
    
    /**
     * Handle high memory pressure
     */
    handleHighMemoryPressure() {
        console.warn('[MemoryManager] High memory pressure - initiating proactive cleanup');
        
        // Proactive cleanup with high aggressiveness
        this.executeCleanupStrategy({
            mode: 'proactive',
            aggressiveness: 0.8,
            priorities: ['caches', 'timers', 'listeners'],
            maxAge: 60000, // 1 minute
            forceGC: false
        });
    }
    
    /**
     * Handle performance entries from PerformanceObserver
     * @param {Array} entries - Performance entries
     */
    handlePerformanceEntries(entries) {
        entries.forEach(entry => {
            if (entry.entryType === 'measure' && entry.name.includes('memory')) {
                // Handle memory-related performance measures
                console.log('[MemoryManager] Performance measure:', entry.name, entry.duration);
            }
        });
    }
    
    /**
     * Notify about critical memory state
     * @param {object} leakAnalysis - Leak analysis results
     */
    notifyCriticalMemoryState(leakAnalysis) {
        // This could be extended to show user notifications
        console.error('[MemoryManager] CRITICAL MEMORY STATE', {
            riskLevel: leakAnalysis.riskLevel,
            confidence: leakAnalysis.confidence,
            leaksDetected: leakAnalysis.leaks.length,
            recommendations: leakAnalysis.recommendations
        });
    }
    
    /**
     * メソッドをバインド
     */
    bindMethods() {
        // オリジナルのsetTimeout/setIntervalを保存
        this.originalSetTimeout = window.setTimeout;
        this.originalSetInterval = window.setInterval;
        this.originalClearTimeout = window.clearTimeout;
        this.originalClearInterval = window.clearInterval;
        
        // ラップされたタイマー関数を作成
        window.setTimeout = this.wrappedSetTimeout.bind(this);
        window.setInterval = this.wrappedSetInterval.bind(this);
        window.clearTimeout = this.wrappedClearTimeout.bind(this);
        window.clearInterval = this.wrappedClearInterval.bind(this);
    }
    
    /**
     * ラップされたsetTimeout
     */
    wrappedSetTimeout(callback, delay, ...args) {
        const timerId = this.originalSetTimeout.call(window, () => {
            this.timers.delete(timerId);
            callback(...args);
        }, delay);
        
        this.timers.add(timerId);
        this.stats.timersCreated++;
        return timerId;
    }
    
    /**
     * ラップされたsetInterval
     */
    wrappedSetInterval(callback, delay, ...args) {
        const timerId = this.originalSetInterval.call(window, callback, delay, ...args);
        this.timers.add(timerId);
        this.stats.timersCreated++;
        return timerId;
    }
    
    /**
     * ラップされたclearTimeout
     */
    wrappedClearTimeout(timerId) {
        this.timers.delete(timerId);
        this.stats.timersCleared++;
        return this.originalClearTimeout.call(window, timerId);
    }
    
    /**
     * ラップされたclearInterval
     */
    wrappedClearInterval(timerId) {
        this.timers.delete(timerId);
        this.stats.timersCleared++;
        return this.originalClearInterval.call(window, timerId);
    }
    
    /**
     * オブジェクトを追跡
     * @param {object} obj - 追跡するオブジェクト
     * @param {string} type - オブジェクトタイプ
     */
    trackObject(obj, type = 'unknown') {
        this.trackedObjects.set(obj, {
            type: type,
            createdAt: Date.now(),
            size: this.estimateObjectSize(obj)
        });
        this.stats.objectsCreated++;
    }
    
    /**
     * オブジェクトの追跡を解除
     * @param {object} obj - 追跡解除するオブジェクト
     */
    untrackObject(obj) {
        if (this.trackedObjects.has(obj)) {
            this.trackedObjects.delete(obj);
            this.stats.objectsDestroyed++;
        }
    }
    
    /**
     * イベントリスナーを追加（追跡付き）
     * @param {Element} element - 要素
     * @param {string} event - イベント名
     * @param {Function} handler - ハンドラー
     * @param {object} options - オプション
     */
    addEventListener(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        
        const key = `${element.constructor.name}_${event}`;
        if (!this.eventListeners.has(key)) {
            this.eventListeners.set(key, []);
        }
        
        this.eventListeners.get(key).push({
            element: element,
            event: event,
            handler: handler,
            options: options
        });
        
        this.stats.listenersAdded++;
    }
    
    /**
     * イベントリスナーを削除
     * @param {Element} element - 要素
     * @param {string} event - イベント名
     * @param {Function} handler - ハンドラー
     */
    removeEventListener(element, event, handler) {
        element.removeEventListener(event, handler);
        
        const key = `${element.constructor.name}_${event}`;
        const listeners = this.eventListeners.get(key);
        
        if (listeners) {
            const index = listeners.findIndex(l => 
                l.element === element && 
                l.event === event && 
                l.handler === handler
            );
            
            if (index !== -1) {
                listeners.splice(index, 1);
                this.stats.listenersRemoved++;
                
                if (listeners.length === 0) {
                    this.eventListeners.delete(key);
                }
            }
        }
    }
    
    /**
     * すべてのイベントリスナーを削除
     */
    removeAllEventListeners() {
        this.eventListeners.forEach((listeners, key) => {
            listeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
                this.stats.listenersRemoved++;
            });
        });
        
        this.eventListeners.clear();
    }
    
    /**
     * Canvasコンテキストを追跡
     * @param {CanvasRenderingContext2D} context - コンテキスト
     */
    trackCanvasContext(context) {
        this.canvasContexts.add(context);
    }
    
    /**
     * 画像をキャッシュ
     * @param {string} src - 画像ソース
     * @param {HTMLImageElement} image - 画像要素
     */
    cacheImage(src, image) {
        this.imageCache.set(src, {
            image: image,
            lastUsed: Date.now(),
            useCount: 1
        });
    }
    
    /**
     * キャッシュされた画像を取得
     * @param {string} src - 画像ソース
     * @returns {HTMLImageElement|null} 画像要素
     */
    getCachedImage(src) {
        const cached = this.imageCache.get(src);
        if (cached) {
            cached.lastUsed = Date.now();
            cached.useCount++;
            return cached.image;
        }
        return null;
    }
    
    /**
     * 音声をキャッシュ
     * @param {string} src - 音声ソース
     * @param {HTMLAudioElement} audio - 音声要素
     */
    cacheAudio(src, audio) {
        this.audioCache.set(src, {
            audio: audio,
            lastUsed: Date.now(),
            useCount: 1
        });
    }
    
    /**
     * キャッシュされた音声を取得
     * @param {string} src - 音声ソース
     * @returns {HTMLAudioElement|null} 音声要素
     */
    getCachedAudio(src) {
        const cached = this.audioCache.get(src);
        if (cached) {
            cached.lastUsed = Date.now();
            cached.useCount++;
            return cached.audio;
        }
        return null;
    }
    
    /**
     * オブジェクトサイズを推定
     * @param {object} obj - オブジェクト
     * @returns {number} 推定サイズ（バイト）
     */
    estimateObjectSize(obj) {
        if (obj === null || obj === undefined) return 0;
        
        const type = typeof obj;
        
        switch (type) {
            case 'boolean':
                return 1;
            case 'number':
                return 8;
            case 'string':
                return obj.length * 2; // UTF-16
            case 'object':
                if (Array.isArray(obj)) {
                    return obj.reduce((size, item) => size + this.estimateObjectSize(item), 0);
                } else {
                    return Object.keys(obj).reduce((size, key) => {
                        return size + this.estimateObjectSize(key) + this.estimateObjectSize(obj[key]);
                    }, 0);
                }
            default:
                return 0;
        }
    }
    
    /**
     * Intelligent cleanup with adaptive scheduling
     */
    performIntelligentCleanup() {
        const now = Date.now();
        const startTime = performance.now();
        
        try {
            // Analyze current memory state before cleanup
            const beforeCleanup = this.getCurrentMemoryState();
            
            // Determine cleanup strategy based on current conditions
            const strategy = this.determineCleanupStrategy();
            
            // Execute cleanup based on strategy
            this.executeCleanupStrategy(strategy);
            
            // Measure cleanup effectiveness
            const afterCleanup = this.getCurrentMemoryState();
            const efficiency = this.calculateCleanupEfficiency(beforeCleanup, afterCleanup);
            
            // Update cleanup statistics
            this.updateCleanupStats(efficiency, performance.now() - startTime);
            
            // Adjust next cleanup interval based on effectiveness
            this.adjustCleanupSchedule(efficiency);
            
            console.log(`[MemoryManager] Intelligent cleanup completed (${strategy.mode}, ${efficiency.toFixed(2)} efficiency)`);
            
        } catch (error) {
            console.error('[MemoryManager] Error during intelligent cleanup:', error);
        }
    }
    
    /**
     * Determine optimal cleanup strategy
     * @returns {object} Cleanup strategy configuration
     */
    determineCleanupStrategy() {
        const memoryState = this.getCurrentMemoryState();
        const pressure = this.stats.currentMemoryPressure;
        const leakRisk = this.stats.leakRiskLevel;
        
        if (pressure > 0.9 || leakRisk === 'critical') {
            return {
                mode: 'emergency',
                aggressiveness: 1.0,
                priorities: ['timers', 'listeners', 'caches', 'objects', 'gc'],
                maxAge: 60000, // 1 minute
                forceGC: true
            };
        } else if (pressure > 0.7 || leakRisk === 'high') {
            return {
                mode: 'aggressive',
                aggressiveness: 0.8,
                priorities: ['caches', 'timers', 'listeners', 'objects'],
                maxAge: 180000, // 3 minutes
                forceGC: true
            };
        } else if (pressure > 0.5 || leakRisk === 'medium') {
            return {
                mode: 'proactive',
                aggressiveness: 0.6,
                priorities: ['caches', 'timers', 'listeners'],
                maxAge: 300000, // 5 minutes
                forceGC: false
            };
        } else {
            return {
                mode: 'maintenance',
                aggressiveness: 0.3,
                priorities: ['caches'],
                maxAge: 600000, // 10 minutes
                forceGC: false
            };
        }
    }
    
    /**
     * Execute cleanup strategy
     * @param {object} strategy - Cleanup strategy
     */
    executeCleanupStrategy(strategy) {
        const now = Date.now();
        let itemsCleaned = 0;
        
        for (const priority of strategy.priorities) {
            switch (priority) {
                case 'caches':
                    itemsCleaned += this.cleanupCaches(strategy.maxAge, strategy.aggressiveness);
                    break;
                case 'timers':
                    itemsCleaned += this.cleanupStalledTimers();
                    break;
                case 'listeners':
                    itemsCleaned += this.cleanupOrphanedListeners();
                    break;
                case 'objects':
                    itemsCleaned += this.cleanupTrackedObjects(strategy.aggressiveness);
                    break;
                case 'gc':
                    if (strategy.forceGC) {
                        this.forceGarbageCollection();
                    }
                    break;
            }
        }
        
        return itemsCleaned;
    }
    
    /**
     * Clean up cached resources
     * @param {number} maxAge - Maximum age for cached items
     * @param {number} aggressiveness - Cleanup aggressiveness (0-1)
     * @returns {number} Number of items cleaned
     */
    cleanupCaches(maxAge, aggressiveness) {
        const now = Date.now();
        let cleaned = 0;
        
        // Clean image cache
        this.imageCache.forEach((cached, src) => {
            const age = now - cached.lastUsed;
            const shouldClean = age > maxAge || 
                (aggressiveness > 0.5 && cached.useCount < 3) ||
                (aggressiveness > 0.8 && cached.useCount < 10);
            
            if (shouldClean) {
                this.imageCache.delete(src);
                cleaned++;
            }
        });
        
        // Clean audio cache
        this.audioCache.forEach((cached, src) => {
            const age = now - cached.lastUsed;
            const shouldClean = age > maxAge || 
                (aggressiveness > 0.5 && cached.useCount < 2) ||
                (aggressiveness > 0.8 && cached.useCount < 5);
            
            if (shouldClean) {
                cached.audio.pause();
                cached.audio.src = '';
                this.audioCache.delete(src);
                cleaned++;
            }
        });
        
        return cleaned;
    }
    
    /**
     * Clean up stalled timers
     * @returns {number} Number of timers cleaned
     */
    cleanupStalledTimers() {
        let cleaned = 0;
        const stalledTimers = new Set();
        
        // Identify potentially stalled timers (this is limited by browser APIs)
        this.timers.forEach(timerId => {
            // Check if timer is still active (limited detection capability)
            try {
                // This is a heuristic approach as we can't directly check timer status
                if (typeof timerId !== 'number' || timerId < 0) {
                    stalledTimers.add(timerId);
                }
            } catch (error) {
                stalledTimers.add(timerId);
            }
        });
        
        // Clear stalled timers
        stalledTimers.forEach(timerId => {
            this.timers.delete(timerId);
            cleaned++;
        });
        
        return cleaned;
    }
    
    /**
     * Clean up orphaned event listeners
     * @returns {number} Number of listeners cleaned
     */
    cleanupOrphanedListeners() {
        let cleaned = 0;
        
        this.eventListeners.forEach((listeners, key) => {
            const validListeners = listeners.filter(listener => {
                try {
                    // Check if element is still in the DOM
                    return listener.element.parentNode !== null || 
                           document.contains(listener.element);
                } catch (error) {
                    return false;
                }
            });
            
            const orphanedCount = listeners.length - validListeners.length;
            if (orphanedCount > 0) {
                this.eventListeners.set(key, validListeners);
                cleaned += orphanedCount;
                this.stats.listenersRemoved += orphanedCount;
            }
            
            if (validListeners.length === 0) {
                this.eventListeners.delete(key);
            }
        });
        
        return cleaned;
    }
    
    /**
     * Clean up tracked objects
     * @param {number} aggressiveness - Cleanup aggressiveness
     * @returns {number} Number of objects cleaned
     */
    cleanupTrackedObjects(aggressiveness) {
        // WeakMap cleanup happens automatically, but we can clean up our tracking data
        let cleaned = 0;
        
        // Clean up leak suspects that may have been resolved
        this.leakSuspects.forEach((suspect, key) => {
            if (aggressiveness > 0.7 && suspect.confidence < 0.5) {
                this.leakSuspects.delete(key);
                cleaned++;
            }
        });
        
        // Clean up old memory snapshots
        const maxSnapshots = aggressiveness > 0.5 ? 10 : 20;
        if (this.memorySnapshots.length > maxSnapshots) {
            const excess = this.memorySnapshots.length - maxSnapshots;
            this.memorySnapshots.splice(0, excess);
            cleaned += excess;
        }
        
        return cleaned;
    }
    
    /**
     * Force garbage collection if available
     */
    forceGarbageCollection() {
        if (window.gc && typeof window.gc === 'function') {
            try {
                window.gc();
                this.stats.gcTriggered++;
                console.log('[MemoryManager] Forced garbage collection');
            } catch (error) {
                console.warn('[MemoryManager] Failed to force GC:', error);
            }
        }
    }
    
    /**
     * Calculate cleanup efficiency
     * @param {object} before - Memory state before cleanup
     * @param {object} after - Memory state after cleanup
     * @returns {number} Efficiency score (0-1)
     */
    calculateCleanupEfficiency(before, after) {
        if (!before.usedMemory || !after.usedMemory) return 0.5;
        
        const memoryFreed = before.usedMemory - after.usedMemory;
        const potentialFreeable = before.usedMemory * 0.1; // Assume 10% could be freed
        
        if (potentialFreeable <= 0) return 1.0;
        
        const efficiency = Math.min(1.0, Math.max(0, memoryFreed / potentialFreeable));
        return efficiency;
    }
    
    /**
     * Update cleanup statistics
     * @param {number} efficiency - Cleanup efficiency
     * @param {number} duration - Cleanup duration in ms
     */
    updateCleanupStats(efficiency, duration) {
        this.stats.proactiveCleanups++;
        this.stats.cleanupEfficiency = (this.stats.cleanupEfficiency * 0.9) + (efficiency * 0.1);
        this.proactiveCleanup.cleanupEfficiency = efficiency;
        this.proactiveCleanup.lastCleanup = Date.now();
    }
    
    /**
     * Adjust cleanup schedule based on effectiveness
     * @param {number} efficiency - Recent cleanup efficiency
     */
    adjustCleanupSchedule(efficiency) {
        const scheduling = this.proactiveCleanup.scheduling;
        const currentPressure = this.stats.currentMemoryPressure;
        
        let multiplier = 1.0;
        
        // Adjust based on efficiency
        if (efficiency < 0.3) {
            multiplier *= 1.5; // Less frequent if not effective
        } else if (efficiency > 0.8) {
            multiplier *= 0.8; // More frequent if very effective
        }
        
        // Adjust based on memory pressure
        if (currentPressure > 0.8) {
            multiplier *= scheduling.pressureMultiplier;
        } else if (currentPressure < 0.3) {
            multiplier *= scheduling.idleMultiplier;
        }
        
        // Calculate new interval
        const newInterval = Math.max(
            scheduling.minInterval,
            Math.min(scheduling.maxInterval, scheduling.baseInterval * multiplier)
        );
        
        // Update cleanup interval
        if (Math.abs(newInterval - this.proactiveCleanup.nextCleanup) > 1000) {
            clearInterval(this.cleanupInterval);
            this.proactiveCleanup.nextCleanup = newInterval;
            this.cleanupInterval = setInterval(() => {
                this.performIntelligentCleanup();
            }, newInterval);
            
            console.log(`[MemoryManager] Adjusted cleanup interval to ${(newInterval/1000).toFixed(1)}s`);
        }
    }
    
    /**
     * Legacy cleanup method (maintained for compatibility)
     */
    performCleanup() {
        const now = Date.now();
        const maxAge = 5 * 60 * 1000; // 5分
        
        // 古い画像キャッシュを削除
        this.imageCache.forEach((cached, src) => {
            if (now - cached.lastUsed > maxAge && cached.useCount < 5) {
                this.imageCache.delete(src);
            }
        });
        
        // 古い音声キャッシュを削除
        this.audioCache.forEach((cached, src) => {
            if (now - cached.lastUsed > maxAge && cached.useCount < 5) {
                cached.audio.pause();
                cached.audio.src = '';
                this.audioCache.delete(src);
            }
        });
        
        // ガベージコレクションの強制実行（利用可能な場合）
        if (window.gc && typeof window.gc === 'function') {
            window.gc();
        }
        
        console.log('Memory cleanup performed');
    }
    
    /**
     * メモリ使用量を取得
     * @returns {object} メモリ情報
     */
    getMemoryUsage() {
        const info = {
            trackedObjects: this.stats.objectsCreated - this.stats.objectsDestroyed,
            activeTimers: this.timers.size,
            eventListeners: Array.from(this.eventListeners.values()).reduce((total, listeners) => total + listeners.length, 0),
            imageCache: this.imageCache.size,
            audioCache: this.audioCache.size,
            canvasContexts: this.canvasContexts.size
        };
        
        if (performance.memory) {
            info.jsHeapSize = {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        
        return info;
    }
    
    /**
     * Advanced memory leak detection with pattern analysis
     * @returns {object} Comprehensive leak analysis
     */
    detectMemoryLeaks() {
        const analysis = {
            leaks: [],
            suspects: [],
            patterns: [],
            recommendations: [],
            confidence: 0,
            riskLevel: 'low'
        };
        
        try {
            // Perform basic leak detection
            const basicIssues = this.performBasicLeakDetection();
            analysis.leaks.push(...basicIssues);
            
            // Perform advanced pattern analysis
            const patterns = this.analyzeMemoryPatterns();
            analysis.patterns.push(...patterns);
            
            // Analyze memory growth trends
            const growthAnalysis = this.analyzeMemoryGrowthTrends();
            if (growthAnalysis.risk > 0.5) {
                analysis.suspects.push(growthAnalysis);
            }
            
            // Detect object creation anomalies
            const creationAnomalies = this.detectObjectCreationAnomalies();
            analysis.suspects.push(...creationAnomalies);
            
            // Analyze timer and listener patterns
            const resourceLeaks = this.analyzeResourceLeakPatterns();
            analysis.leaks.push(...resourceLeaks);
            
            // Calculate overall confidence and risk level
            this.calculateLeakConfidence(analysis);
            
            // Generate recommendations
            analysis.recommendations = this.generateLeakRecommendations(analysis);
            
            // Update internal tracking
            this.updateLeakDetectionStats(analysis);
            
        } catch (error) {
            console.error('[MemoryManager] Error during leak detection:', error);
            analysis.leaks.push('Error during leak detection - system may be unstable');
        }
        
        return analysis;
    }
    
    /**
     * Perform basic memory leak detection (legacy functionality)
     * @returns {string[]} Basic issues found
     */
    performBasicLeakDetection() {
        const issues = [];
        const usage = this.getMemoryUsage();
        
        if (usage.trackedObjects > 1000) {
            issues.push(`High number of tracked objects: ${usage.trackedObjects}`);
        }
        
        if (usage.activeTimers > 100) {
            issues.push(`High number of active timers: ${usage.activeTimers}`);
        }
        
        if (usage.eventListeners > 500) {
            issues.push(`High number of event listeners: ${usage.eventListeners}`);
        }
        
        if (usage.jsHeapSize && usage.jsHeapSize.used > usage.jsHeapSize.limit * 0.8) {
            issues.push(`High heap usage: ${usage.jsHeapSize.used}MB / ${usage.jsHeapSize.limit}MB`);
        }
        
        // Timer leak detection
        const timerLeakThreshold = this.stats.timersCreated - this.stats.timersCleared;
        if (timerLeakThreshold > 50) {
            issues.push(`Potential timer leak: ${timerLeakThreshold} uncleaned timers`);
        }
        
        // Event listener leak detection
        const listenerLeakThreshold = this.stats.listenersAdded - this.stats.listenersRemoved;
        if (listenerLeakThreshold > 100) {
            issues.push(`Potential listener leak: ${listenerLeakThreshold} unremoved listeners`);
        }
        
        return issues;
    }
    
    /**
     * Analyze memory usage patterns for leak indicators
     * @returns {Array} Detected patterns
     */
    analyzeMemoryPatterns() {
        const patterns = [];
        const recentSnapshots = this.memorySnapshots.slice(-10);
        
        if (recentSnapshots.length < 5) {
            return patterns;
        }
        
        // Analyze consistent memory growth
        const growthPattern = this.detectConsistentGrowth(recentSnapshots);
        if (growthPattern.detected) {
            patterns.push({
                type: 'consistent_growth',
                description: 'Memory usage consistently increasing',
                rate: growthPattern.rate,
                confidence: growthPattern.confidence,
                severity: growthPattern.rate > 0.1 ? 'high' : 'medium'
            });
        }
        
        // Analyze memory spikes
        const spikePattern = this.detectMemorySpikes(recentSnapshots);
        if (spikePattern.detected) {
            patterns.push({
                type: 'memory_spikes',
                description: 'Irregular memory spikes detected',
                frequency: spikePattern.frequency,
                amplitude: spikePattern.amplitude,
                confidence: spikePattern.confidence,
                severity: spikePattern.amplitude > 0.2 ? 'high' : 'medium'
            });
        }
        
        // Analyze object creation patterns
        const creationPattern = this.analyzeObjectCreationPatterns();
        if (creationPattern.anomalous) {
            patterns.push({
                type: 'object_creation_anomaly',
                description: 'Unusual object creation pattern',
                details: creationPattern.details,
                confidence: creationPattern.confidence,
                severity: 'medium'
            });
        }
        
        return patterns;
    }
    
    /**
     * Detect consistent memory growth pattern
     * @param {Array} snapshots - Memory snapshots
     * @returns {object} Growth pattern analysis
     */
    detectConsistentGrowth(snapshots) {
        if (snapshots.length < 3) {
            return { detected: false };
        }
        
        const growthRates = [];
        for (let i = 1; i < snapshots.length; i++) {
            const current = snapshots[i].usedMemory;
            const previous = snapshots[i - 1].usedMemory;
            if (previous > 0) {
                growthRates.push((current - previous) / previous);
            }
        }
        
        if (growthRates.length === 0) {
            return { detected: false };
        }
        
        // Check if growth is consistently positive
        const positiveGrowths = growthRates.filter(rate => rate > 0.01); // 1% threshold
        const consistencyRatio = positiveGrowths.length / growthRates.length;
        const averageGrowth = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
        
        const detected = consistencyRatio > 0.7 && averageGrowth > 0.02; // 70% consistency, 2% average growth
        
        return {
            detected,
            rate: averageGrowth,
            consistency: consistencyRatio,
            confidence: detected ? Math.min(1.0, consistencyRatio * 1.2) : 0
        };
    }
    
    /**
     * Detect memory spike patterns
     * @param {Array} snapshots - Memory snapshots
     * @returns {object} Spike pattern analysis
     */
    detectMemorySpikes(snapshots) {
        if (snapshots.length < 4) {
            return { detected: false };
        }
        
        const memoryValues = snapshots.map(s => s.usedMemory);
        const mean = memoryValues.reduce((sum, val) => sum + val, 0) / memoryValues.length;
        const stdDev = Math.sqrt(
            memoryValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / memoryValues.length
        );
        
        const spikes = memoryValues.filter(val => Math.abs(val - mean) > stdDev * 2);
        const spikeFrequency = spikes.length / memoryValues.length;
        const maxSpike = Math.max(...spikes.map(spike => Math.abs(spike - mean) / mean));
        
        const detected = spikeFrequency > 0.2; // More than 20% of samples are spikes
        
        return {
            detected,
            frequency: spikeFrequency,
            amplitude: maxSpike,
            confidence: detected ? Math.min(1.0, spikeFrequency * 2) : 0
        };
    }
    
    /**
     * Analyze object creation patterns for anomalies
     * @returns {object} Creation pattern analysis
     */
    analyzeObjectCreationPatterns() {
        const patterns = [];
        let totalAnomalies = 0;
        
        this.objectCreationPatterns.forEach((count, type) => {
            const rate = count / (Date.now() - (this.stats.startTime || Date.now() - 300000)); // per ms
            const normalRate = this.getNormalCreationRate(type);
            
            if (rate > normalRate * 3) { // 3x normal rate
                patterns.push(`High creation rate for ${type}: ${rate.toFixed(6)}/ms`);
                totalAnomalies++;
            }
        });
        
        return {
            anomalous: totalAnomalies > 0,
            details: patterns,
            confidence: Math.min(1.0, totalAnomalies / 5), // Up to 5 types
            totalAnomalies
        };
    }
    
    /**
     * Get normal creation rate for object type
     * @param {string} type - Object type
     * @returns {number} Normal creation rate per ms
     */
    getNormalCreationRate(type) {
        // These are heuristic values - could be learned over time
        const normalRates = {
            'bubble': 0.01,
            'particle': 0.1,
            'effect': 0.005,
            'ui': 0.001,
            'audio': 0.0001,
            'default': 0.001
        };
        
        return normalRates[type] || normalRates.default;
    }
    
    /**
     * Analyze memory growth trends
     * @returns {object} Growth trend analysis
     */
    analyzeMemoryGrowthTrends() {
        const snapshots = this.memorySnapshots.slice(-20); // Last 20 snapshots
        
        if (snapshots.length < 5) {
            return { risk: 0, trend: 'insufficient_data' };
        }
        
        // Calculate linear trend
        const trend = this.calculateLinearTrend(snapshots.map(s => s.usedMemory));
        
        // Calculate risk based on trend slope and current usage
        const currentUsage = snapshots[snapshots.length - 1];
        const memoryPressure = currentUsage.totalMemory > 0 ? 
            currentUsage.usedMemory / currentUsage.totalMemory : 0;
        
        let risk = 0;
        if (trend.slope > 0 && memoryPressure > 0.6) {
            risk = Math.min(1.0, (trend.slope * 100) + memoryPressure);
        }
        
        return {
            risk,
            trend: trend.slope > 0.01 ? 'growing' : trend.slope < -0.01 ? 'shrinking' : 'stable',
            slope: trend.slope,
            confidence: trend.correlation,
            memoryPressure
        };
    }
    
    /**
     * Calculate linear trend for data series
     * @param {Array} data - Data points
     * @returns {object} Trend analysis
     */
    calculateLinearTrend(data) {
        const n = data.length;
        if (n < 2) return { slope: 0, correlation: 0 };
        
        const xSum = (n * (n - 1)) / 2; // 0 + 1 + 2 + ... + (n-1)
        const ySum = data.reduce((sum, val) => sum + val, 0);
        const xySum = data.reduce((sum, val, index) => sum + (val * index), 0);
        const xxSum = (n * (n - 1) * (2 * n - 1)) / 6; // Sum of squares
        
        const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
        
        // Calculate correlation coefficient
        const yMean = ySum / n;
        const xMean = xSum / n;
        const ssxy = data.reduce((sum, val, index) => sum + ((index - xMean) * (val - yMean)), 0);
        const ssxx = data.reduce((sum, val, index) => sum + Math.pow(index - xMean, 2), 0);
        const ssyy = data.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
        
        const correlation = ssxx > 0 && ssyy > 0 ? Math.abs(ssxy / Math.sqrt(ssxx * ssyy)) : 0;
        
        return { slope, correlation };
    }
    
    /**
     * Detect object creation anomalies
     * @returns {Array} Creation anomalies
     */
    detectObjectCreationAnomalies() {
        const anomalies = [];
        const currentTime = Date.now();
        
        // Analyze creation rates over time windows
        const timeWindows = [60000, 300000, 900000]; // 1min, 5min, 15min
        
        timeWindows.forEach(window => {
            const recentCreations = this.getObjectCreationsInWindow(currentTime - window, currentTime);
            const rate = recentCreations.total / (window / 1000); // per second
            
            if (rate > 10) { // More than 10 objects per second
                anomalies.push({
                    type: 'high_creation_rate',
                    window: window / 1000,
                    rate: rate,
                    total: recentCreations.total,
                    details: recentCreations.byType,
                    severity: rate > 50 ? 'critical' : rate > 25 ? 'high' : 'medium'
                });
            }
        });
        
        return anomalies;
    }
    
    /**
     * Get object creations in time window
     * @param {number} startTime - Start timestamp
     * @param {number} endTime - End timestamp
     * @returns {object} Creation statistics
     */
    getObjectCreationsInWindow(startTime, endTime) {
        // This is a simplified implementation
        // In a real scenario, we'd track object creation timestamps
        const total = this.stats.objectsCreated * 0.1; // Estimate recent creations
        
        return {
            total,
            byType: {
                unknown: total
            }
        };
    }
    
    /**
     * Analyze resource leak patterns (timers, listeners)
     * @returns {Array} Resource leak issues
     */
    analyzeResourceLeakPatterns() {
        const leaks = [];
        
        // Analyze timer patterns
        const timerGrowth = this.stats.timersCreated - this.stats.timersCleared;
        if (timerGrowth > 50) {
            const severity = timerGrowth > 200 ? 'critical' : timerGrowth > 100 ? 'high' : 'medium';
            leaks.push({
                type: 'timer_leak',
                count: timerGrowth,
                description: `${timerGrowth} timers created but not cleared`,
                severity,
                confidence: 0.9
            });
        }
        
        // Analyze listener patterns
        const listenerGrowth = this.stats.listenersAdded - this.stats.listenersRemoved;
        if (listenerGrowth > 100) {
            const severity = listenerGrowth > 500 ? 'critical' : listenerGrowth > 250 ? 'high' : 'medium';
            leaks.push({
                type: 'listener_leak',
                count: listenerGrowth,
                description: `${listenerGrowth} event listeners added but not removed`,
                severity,
                confidence: 0.8
            });
        }
        
        return leaks;
    }
    
    /**
     * Calculate overall leak detection confidence
     * @param {object} analysis - Leak analysis results
     */
    calculateLeakConfidence(analysis) {
        let totalConfidence = 0;
        let itemCount = 0;
        
        // Weight different types of evidence
        analysis.leaks.forEach(leak => {
            if (leak.confidence !== undefined) {
                totalConfidence += leak.confidence * 1.0; // Full weight for confirmed leaks
                itemCount++;
            }
        });
        
        analysis.suspects.forEach(suspect => {
            if (suspect.confidence !== undefined) {
                totalConfidence += suspect.confidence * 0.7; // Reduced weight for suspects
                itemCount++;
            }
        });
        
        analysis.patterns.forEach(pattern => {
            if (pattern.confidence !== undefined) {
                totalConfidence += pattern.confidence * 0.8; // Medium weight for patterns
                itemCount++;
            }
        });
        
        analysis.confidence = itemCount > 0 ? totalConfidence / itemCount : 0;
        
        // Determine risk level
        if (analysis.confidence > 0.8) {
            analysis.riskLevel = 'critical';
        } else if (analysis.confidence > 0.6) {
            analysis.riskLevel = 'high';
        } else if (analysis.confidence > 0.4) {
            analysis.riskLevel = 'medium';
        } else {
            analysis.riskLevel = 'low';
        }
    }
    
    /**
     * Generate leak remediation recommendations
     * @param {object} analysis - Leak analysis results
     * @returns {Array} Recommendations
     */
    generateLeakRecommendations(analysis) {
        const recommendations = [];
        
        // Recommendations based on leak types
        analysis.leaks.forEach(leak => {
            switch (leak.type) {
                case 'timer_leak':
                    recommendations.push('Review timer usage and ensure all timers are properly cleared');
                    recommendations.push('Consider using WeakRef for timer callbacks');
                    break;
                case 'listener_leak':
                    recommendations.push('Audit event listener registration and removal');
                    recommendations.push('Use AbortController for automatic listener cleanup');
                    break;
                case 'high_creation_rate':
                    recommendations.push('Investigate rapid object creation patterns');
                    recommendations.push('Consider object pooling for frequently created objects');
                    break;
            }
        });
        
        // Recommendations based on patterns
        analysis.patterns.forEach(pattern => {
            switch (pattern.type) {
                case 'consistent_growth':
                    recommendations.push('Memory usage is growing consistently - investigate for leaks');
                    recommendations.push('Enable more aggressive cleanup modes');
                    break;
                case 'memory_spikes':
                    recommendations.push('Memory spikes detected - review large object allocations');
                    recommendations.push('Consider implementing progressive loading');
                    break;
            }
        });
        
        // General recommendations based on risk level
        if (analysis.riskLevel === 'critical') {
            recommendations.push('CRITICAL: Immediate memory cleanup recommended');
            recommendations.push('Consider forcing garbage collection');
            recommendations.push('Reduce application complexity temporarily');
        } else if (analysis.riskLevel === 'high') {
            recommendations.push('Increase cleanup frequency');
            recommendations.push('Monitor memory usage more closely');
        }
        
        // Remove duplicates
        return [...new Set(recommendations)];
    }
    
    /**
     * Update leak detection statistics
     * @param {object} analysis - Leak analysis results
     */
    updateLeakDetectionStats(analysis) {
        this.stats.memoryLeaksDetected += analysis.leaks.length;
        this.stats.memoryLeaksSuspected += analysis.suspects.length;
        this.stats.leakRiskLevel = analysis.riskLevel;
        
        // Update memory health score
        this.stats.memoryHealthScore = Math.max(0, 1 - (analysis.confidence * 0.8));
        
        // Store leak suspects for tracking
        analysis.suspects.forEach((suspect, index) => {
            const key = `${suspect.type}_${Date.now()}_${index}`;
            this.leakSuspects.set(key, {
                ...suspect,
                timestamp: Date.now(),
                tracked: true
            });
        });
        
        this.leakDetection.lastAnalysis = Date.now();
    }
    
    /**
     * 強制的なメモリクリーンアップ
     */
    forceCleanup() {
        // すべてのタイマーをクリア
        this.timers.forEach(timerId => {
            this.originalClearTimeout(timerId);
            this.originalClearInterval(timerId);
        });
        this.timers.clear();
        
        // すべてのイベントリスナーを削除
        this.removeAllEventListeners();
        
        // キャッシュをクリア
        this.imageCache.clear();
        this.audioCache.forEach(cached => {
            cached.audio.pause();
            cached.audio.src = '';
        });
        this.audioCache.clear();
        
        // Canvasコンテキストをクリア
        this.canvasContexts.forEach(context => {
            if (context.canvas) {
                context.clearRect(0, 0, context.canvas.width, context.canvas.height);
            }
        });
        
        this.performCleanup();
        
        console.log('Force cleanup completed');
    }
    
    /**
     * 統計情報を取得
     * @returns {object} 統計情報
     */
    getStats() {
        return {
            ...this.stats,
            memoryUsage: this.getMemoryUsage(),
            detectedIssues: this.detectMemoryLeaks()
        };
    }
    
    /**
     * メモリマネージャーを破棄
     */
    destroy() {
        clearInterval(this.cleanupInterval);
        this.forceCleanup();
        
        // オリジナルの関数を復元
        window.setTimeout = this.originalSetTimeout;
        window.setInterval = this.originalSetInterval;
        window.clearTimeout = this.originalClearTimeout;
        window.clearInterval = this.originalClearInterval;
    }
}

/**
 * WeakRefを使用したリソース管理
 */
export class WeakResourceManager {
    constructor() {
        this.resources = new Map();
        this.registry = new FinalizationRegistry((key) => {
            console.log(`Resource ${key} was garbage collected`);
            this.resources.delete(key);
        });
    }
    
    /**
     * リソースを登録
     * @param {string} key - キー
     * @param {object} resource - リソース
     */
    register(key, resource) {
        const weakRef = new WeakRef(resource);
        this.resources.set(key, weakRef);
        this.registry.register(resource, key);
    }
    
    /**
     * リソースを取得
     * @param {string} key - キー
     * @returns {object|null} リソース
     */
    get(key) {
        const weakRef = this.resources.get(key);
        if (weakRef) {
            const resource = weakRef.deref();
            if (resource) {
                return resource;
            } else {
                this.resources.delete(key);
            }
        }
        return null;
    }
    
    /**
     * リソースを削除
     * @param {string} key - キー
     */
    delete(key) {
        this.resources.delete(key);
    }
    
    /**
     * 利用可能なリソース数を取得
     * @returns {number} リソース数
     */
    size() {
        // 生きているリソースのみをカウント
        let count = 0;
        this.resources.forEach((weakRef, key) => {
            if (weakRef.deref()) {
                count++;
            } else {
                this.resources.delete(key);
            }
        });
        return count;
    }
}

// グローバルインスタンス（遅延初期化）
let _memoryManager = null;

export function getMemoryManager() {
    if (!_memoryManager) {
        _memoryManager = new MemoryManager();
    }
    return _memoryManager;
}

// 後方互換性のため
export const memoryManager = getMemoryManager;