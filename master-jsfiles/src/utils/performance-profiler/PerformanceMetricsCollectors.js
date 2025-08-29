/**
 * Performance Metrics Collectors
 * パフォーマンスメトリクス収集システム - 各種パフォーマンス指標の収集
 */

/**
 * Frame Metrics Collector
 * フレームメトリクス収集器 - フレームレートとレンダリング性能の収集
 */
export class FrameMetricsCollector {
    constructor() {
        this.frameHistory = [];
        this.maxHistorySize = 1000;
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.collecting = false;
        this.callbacks = [];
    }

    async initialize() {
        console.log('Frame Metrics Collector initialized');
        this.collecting = true;
        this.startCollection();
    }

    startCollection() {
        const collectFrame = () => {
            if (!this.collecting) return;

            const currentTime = performance.now();
            const frameTime = currentTime - this.lastFrameTime;
            const fps = 1000 / frameTime;

            const frameMetrics = {
                frameNumber: this.frameCount++,
                timestamp: currentTime,
                frameTime,
                fps,
                jank: frameTime > 16.67 ? frameTime - 16.67 : 0
            };

            this.frameHistory.push(frameMetrics);
            if (this.frameHistory.length > this.maxHistorySize) {
                this.frameHistory.shift();
            }

            this.lastFrameTime = currentTime;
            this.notifyCallbacks('frame', frameMetrics);

            requestAnimationFrame(collectFrame);
        };

        requestAnimationFrame(collectFrame);
    }

    getMetrics() {
        if (this.frameHistory.length === 0) return null;

        const recent = this.frameHistory.slice(-60); // Last second at 60fps
        const totalFrameTime = recent.reduce((sum, f) => sum + f.frameTime, 0);
        const averageFrameTime = totalFrameTime / recent.length;
        const averageFPS = 1000 / averageFrameTime;

        const jankFrames = recent.filter(f => f.jank > 0);
        const jankPercentage = (jankFrames.length / recent.length) * 100;

        return {
            current: {
                fps: recent[recent.length - 1]?.fps || 0,
                frameTime: recent[recent.length - 1]?.frameTime || 0
            },
            average: {
                fps: averageFPS,
                frameTime: averageFrameTime
            },
            performance: {
                jankPercentage,
                jankFrames: jankFrames.length,
                smoothFrames: recent.length - jankFrames.length
            },
            history: this.frameHistory.slice(-10) // Last 10 frames for detailed analysis
        };
    }

    onMetrics(callback) {
        this.callbacks.push(callback);
    }

    notifyCallbacks(type, data) {
        this.callbacks.forEach(callback => {
            try {
                callback(type, data);
            } catch (error) {
                console.error('Frame metrics callback error:', error);
            }
        });
    }

    stop() {
        this.collecting = false;
    }
}

/**
 * Memory Metrics Collector
 * メモリメトリクス収集器 - メモリ使用量とガベージコレクションの追跡
 */
export class MemoryMetricsCollector {
    constructor() {
        this.memoryHistory = [];
        this.maxHistorySize = 200;
        this.collecting = false;
        this.collectionInterval = null;
        this.callbacks = [];
    }

    async initialize() {
        console.log('Memory Metrics Collector initialized');
        this.collecting = true;
        this.startCollection();
    }

    startCollection() {
        this.collectionInterval = setInterval(() => {
            if (!this.collecting) return;

            const memoryMetrics = this.collectMemoryMetrics();
            if (memoryMetrics) {
                this.memoryHistory.push(memoryMetrics);
                if (this.memoryHistory.length > this.maxHistorySize) {
                    this.memoryHistory.shift();
                }
                this.notifyCallbacks('memory', memoryMetrics);
            }
        }, 1000); // Collect every second
    }

    collectMemoryMetrics() {
        if (!performance.memory) {
            return null;
        }

        const timestamp = Date.now();
        const used = performance.memory.usedJSHeapSize;
        const total = performance.memory.totalJSHeapSize;
        const limit = performance.memory.jsHeapSizeLimit;

        // Detect potential GC events
        const previousMetrics = this.memoryHistory[this.memoryHistory.length - 1];
        let gcDetected = false;
        let gcReclaimed = 0;

        if (previousMetrics && used < previousMetrics.used * 0.9) {
            gcDetected = true;
            gcReclaimed = previousMetrics.used - used;
        }

        return {
            timestamp,
            used,
            total,
            limit,
            pressure: used / limit,
            available: limit - used,
            gc: {
                detected: gcDetected,
                reclaimed: gcReclaimed
            }
        };
    }

    getMetrics() {
        if (this.memoryHistory.length === 0) return null;

        const current = this.memoryHistory[this.memoryHistory.length - 1];
        const recent = this.memoryHistory.slice(-30); // Last 30 seconds

        // Calculate growth rate
        const first = recent[0];
        const last = recent[recent.length - 1];
        const timeSpan = last.timestamp - first.timestamp;
        const growthRate = timeSpan > 0 ? 
            ((last.used - first.used) / timeSpan) * 1000 : 0; // bytes per second

        // Calculate GC frequency
        const gcEvents = recent.filter(m => m.gc.detected);
        const gcFrequency = gcEvents.length;
        const totalReclaimed = gcEvents.reduce((sum, m) => sum + m.gc.reclaimed, 0);

        return {
            current: {
                used: current.used,
                total: current.total,
                pressure: current.pressure,
                available: current.available
            },
            trends: {
                growthRate,
                peakUsage: Math.max(...recent.map(m => m.used)),
                averageUsage: recent.reduce((sum, m) => sum + m.used, 0) / recent.length
            },
            gc: {
                frequency: gcFrequency,
                totalReclaimed,
                averageReclaimed: gcFrequency > 0 ? totalReclaimed / gcFrequency : 0
            },
            history: this.memoryHistory.slice(-10)
        };
    }

    onMetrics(callback) {
        this.callbacks.push(callback);
    }

    notifyCallbacks(type, data) {
        this.callbacks.forEach(callback => {
            try {
                callback(type, data);
            } catch (error) {
                console.error('Memory metrics callback error:', error);
            }
        });
    }

    stop() {
        this.collecting = false;
        if (this.collectionInterval) {
            clearInterval(this.collectionInterval);
            this.collectionInterval = null;
        }
    }
}

/**
 * Render Metrics Collector
 * レンダーメトリクス収集器 - レンダリングパフォーマンスの詳細収集
 */
export class RenderMetricsCollector {
    constructor() {
        this.renderHistory = [];
        this.maxHistorySize = 500;
        this.renderStartTime = null;
        this.callbacks = [];
        this.paintObserver = null;
    }

    async initialize() {
        console.log('Render Metrics Collector initialized');
        this.setupPaintObserver();
    }

    setupPaintObserver() {
        if ('PerformanceObserver' in window) {
            this.paintObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    this.handlePaintEntry(entry);
                });
            });

            try {
                this.paintObserver.observe({ entryTypes: ['paint', 'measure'] });
            } catch (error) {
                console.warn('Paint observer setup failed:', error);
            }
        }
    }

    handlePaintEntry(entry) {
        const renderMetrics = {
            timestamp: Date.now(),
            type: entry.entryType,
            name: entry.name,
            startTime: entry.startTime,
            duration: entry.duration
        };

        this.renderHistory.push(renderMetrics);
        if (this.renderHistory.length > this.maxHistorySize) {
            this.renderHistory.shift();
        }

        this.notifyCallbacks('render', renderMetrics);
    }

    markRenderStart(label = 'render') {
        this.renderStartTime = performance.now();
        performance.mark(`${label}-start`);
    }

    markRenderEnd(label = 'render') {
        if (this.renderStartTime) {
            const endTime = performance.now();
            const duration = endTime - this.renderStartTime;
            
            performance.mark(`${label}-end`);
            performance.measure(label, `${label}-start`, `${label}-end`);
            
            const renderMetrics = {
                timestamp: Date.now(),
                type: 'custom',
                name: label,
                startTime: this.renderStartTime,
                endTime,
                duration
            };

            this.renderHistory.push(renderMetrics);
            if (this.renderHistory.length > this.maxHistorySize) {
                this.renderHistory.shift();
            }

            this.notifyCallbacks('render', renderMetrics);
            this.renderStartTime = null;
        }
    }

    getMetrics() {
        if (this.renderHistory.length === 0) return null;

        const recent = this.renderHistory.slice(-50);
        const paintEvents = recent.filter(r => r.type === 'paint');
        const customMeasures = recent.filter(r => r.type === 'custom');

        const totalDuration = recent.reduce((sum, r) => sum + (r.duration || 0), 0);
        const averageDuration = totalDuration / recent.length;

        return {
            recent: recent.slice(-5),
            statistics: {
                totalRenders: recent.length,
                paintEvents: paintEvents.length,
                customMeasures: customMeasures.length,
                averageDuration,
                maxDuration: Math.max(...recent.map(r => r.duration || 0)),
                minDuration: Math.min(...recent.map(r => r.duration || 0))
            }
        };
    }

    onMetrics(callback) {
        this.callbacks.push(callback);
    }

    notifyCallbacks(type, data) {
        this.callbacks.forEach(callback => {
            try {
                callback(type, data);
            } catch (error) {
                console.error('Render metrics callback error:', error);
            }
        });
    }

    stop() {
        if (this.paintObserver) {
            this.paintObserver.disconnect();
            this.paintObserver = null;
        }
    }
}

/**
 * Network Metrics Collector
 * ネットワークメトリクス収集器 - ネットワークパフォーマンスの監視
 */
export class NetworkMetricsCollector {
    constructor() {
        this.networkHistory = [];
        this.maxHistorySize = 100;
        this.callbacks = [];
        this.resourceObserver = null;
    }

    async initialize() {
        console.log('Network Metrics Collector initialized');
        this.setupResourceObserver();
    }

    setupResourceObserver() {
        if ('PerformanceObserver' in window) {
            this.resourceObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    this.handleResourceEntry(entry);
                });
            });

            try {
                this.resourceObserver.observe({ entryTypes: ['resource'] });
            } catch (error) {
                console.warn('Resource observer setup failed:', error);
            }
        }
    }

    handleResourceEntry(entry) {
        const networkMetrics = {
            timestamp: Date.now(),
            name: entry.name,
            type: this.getResourceType(entry.name),
            startTime: entry.startTime,
            duration: entry.duration,
            transferSize: entry.transferSize || 0,
            encodedBodySize: entry.encodedBodySize || 0,
            decodedBodySize: entry.decodedBodySize || 0,
            timing: {
                dns: entry.domainLookupEnd - entry.domainLookupStart,
                tcp: entry.connectEnd - entry.connectStart,
                ssl: entry.secureConnectionStart > 0 ? 
                    entry.connectEnd - entry.secureConnectionStart : 0,
                request: entry.responseStart - entry.requestStart,
                response: entry.responseEnd - entry.responseStart,
                total: entry.responseEnd - entry.startTime
            }
        };

        this.networkHistory.push(networkMetrics);
        if (this.networkHistory.length > this.maxHistorySize) {
            this.networkHistory.shift();
        }

        this.notifyCallbacks('network', networkMetrics);
    }

    getResourceType(url) {
        const extension = url.split('.').pop().toLowerCase();
        const typeMap = {
            'js': 'script',
            'css': 'stylesheet',
            'png': 'image',
            'jpg': 'image',
            'jpeg': 'image',
            'gif': 'image',
            'svg': 'image',
            'woff': 'font',
            'woff2': 'font',
            'ttf': 'font',
            'mp3': 'audio',
            'mp4': 'video',
            'json': 'xhr'
        };
        return typeMap[extension] || 'other';
    }

    getMetrics() {
        if (this.networkHistory.length === 0) return null;

        const recent = this.networkHistory.slice(-20);
        const totalTransfer = recent.reduce((sum, n) => sum + n.transferSize, 0);
        const averageDuration = recent.reduce((sum, n) => sum + n.duration, 0) / recent.length;

        // Group by resource type
        const byType = {};
        recent.forEach(entry => {
            if (!byType[entry.type]) {
                byType[entry.type] = { count: 0, totalSize: 0, totalTime: 0 };
            }
            byType[entry.type].count++;
            byType[entry.type].totalSize += entry.transferSize;
            byType[entry.type].totalTime += entry.duration;
        });

        return {
            recent: recent.slice(-5),
            summary: {
                totalRequests: recent.length,
                totalTransfer,
                averageDuration,
                byType
            },
            timing: {
                averageDNS: recent.reduce((sum, n) => sum + n.timing.dns, 0) / recent.length,
                averageTCP: recent.reduce((sum, n) => sum + n.timing.tcp, 0) / recent.length,
                averageRequest: recent.reduce((sum, n) => sum + n.timing.request, 0) / recent.length,
                averageResponse: recent.reduce((sum, n) => sum + n.timing.response, 0) / recent.length
            }
        };
    }

    onMetrics(callback) {
        this.callbacks.push(callback);
    }

    notifyCallbacks(type, data) {
        this.callbacks.forEach(callback => {
            try {
                callback(type, data);
            } catch (error) {
                console.error('Network metrics callback error:', error);
            }
        });
    }

    stop() {
        if (this.resourceObserver) {
            this.resourceObserver.disconnect();
            this.resourceObserver = null;
        }
    }
}

/**
 * User Interaction Collector
 * ユーザーインタラクション収集器 - ユーザー操作の応答性測定
 */
export class UserInteractionCollector {
    constructor() {
        this.interactionHistory = [];
        this.maxHistorySize = 200;
        this.callbacks = [];
        this.eventListeners = new Map();
    }

    async initialize() {
        console.log('User Interaction Collector initialized');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const events = ['click', 'keydown', 'scroll', 'touchstart'];
        
        events.forEach(eventType => {
            const listener = (event) => this.handleInteraction(eventType, event);
            document.addEventListener(eventType, listener, { passive: true });
            this.eventListeners.set(eventType, listener);
        });
    }

    handleInteraction(type, event) {
        const timestamp = Date.now();
        const startTime = performance.now();
        
        // Measure time to next frame (rough responsiveness metric)
        requestAnimationFrame(() => {
            const responseTime = performance.now() - startTime;
            
            const interactionMetrics = {
                timestamp,
                type,
                target: event.target.tagName.toLowerCase(),
                responseTime,
                coordinates: this.getCoordinates(event)
            };

            this.interactionHistory.push(interactionMetrics);
            if (this.interactionHistory.length > this.maxHistorySize) {
                this.interactionHistory.shift();
            }

            this.notifyCallbacks('interaction', interactionMetrics);
        });
    }

    getCoordinates(event) {
        if (event.type === 'scroll') {
            return { x: window.scrollX, y: window.scrollY };
        }
        if (event.clientX !== undefined) {
            return { x: event.clientX, y: event.clientY };
        }
        if (event.touches && event.touches[0]) {
            return { x: event.touches[0].clientX, y: event.touches[0].clientY };
        }
        return null;
    }

    getMetrics() {
        if (this.interactionHistory.length === 0) return null;

        const recent = this.interactionHistory.slice(-50);
        const totalResponseTime = recent.reduce((sum, i) => sum + i.responseTime, 0);
        const averageResponseTime = totalResponseTime / recent.length;

        // Group by interaction type
        const byType = {};
        recent.forEach(interaction => {
            if (!byType[interaction.type]) {
                byType[interaction.type] = { count: 0, totalResponseTime: 0 };
            }
            byType[interaction.type].count++;
            byType[interaction.type].totalResponseTime += interaction.responseTime;
        });

        // Calculate average response time by type
        Object.keys(byType).forEach(type => {
            byType[type].averageResponseTime = 
                byType[type].totalResponseTime / byType[type].count;
        });

        return {
            recent: recent.slice(-10),
            summary: {
                totalInteractions: recent.length,
                averageResponseTime,
                maxResponseTime: Math.max(...recent.map(i => i.responseTime)),
                minResponseTime: Math.min(...recent.map(i => i.responseTime)),
                byType
            }
        };
    }

    onMetrics(callback) {
        this.callbacks.push(callback);
    }

    notifyCallbacks(type, data) {
        this.callbacks.forEach(callback => {
            try {
                callback(type, data);
            } catch (error) {
                console.error('Interaction metrics callback error:', error);
            }
        });
    }

    stop() {
        this.eventListeners.forEach((listener, eventType) => {
            document.removeEventListener(eventType, listener);
        });
        this.eventListeners.clear();
    }
}

/**
 * Resource Metrics Collector
 * リソースメトリクス収集器 - リソース使用量の監視
 */
export class ResourceMetricsCollector {
    constructor() {
        this.resourceHistory = [];
        this.maxHistorySize = 100;
        this.callbacks = [];
        this.collectionInterval = null;
    }

    async initialize() {
        console.log('Resource Metrics Collector initialized');
        this.startCollection();
    }

    startCollection() {
        this.collectionInterval = setInterval(() => {
            const resourceMetrics = this.collectResourceMetrics();
            if (resourceMetrics) {
                this.resourceHistory.push(resourceMetrics);
                if (this.resourceHistory.length > this.maxHistorySize) {
                    this.resourceHistory.shift();
                }
                this.notifyCallbacks('resource', resourceMetrics);
            }
        }, 5000); // Collect every 5 seconds
    }

    collectResourceMetrics() {
        const timestamp = Date.now();
        
        // Basic resource metrics
        const resources = {
            timestamp,
            dom: {
                nodes: document.querySelectorAll('*').length,
                images: document.images.length,
                scripts: document.scripts.length,
                stylesheets: document.styleSheets.length
            },
            storage: this.getStorageMetrics(),
            cache: this.getCacheMetrics()
        };

        return resources;
    }

    getStorageMetrics() {
        const storage = {};
        
        try {
            storage.localStorage = {
                used: JSON.stringify(localStorage).length,
                available: 'unknown' // Browser-dependent
            };
        } catch (error) {
            storage.localStorage = { error: 'Access denied' };
        }

        try {
            storage.sessionStorage = {
                used: JSON.stringify(sessionStorage).length,
                available: 'unknown'
            };
        } catch (error) {
            storage.sessionStorage = { error: 'Access denied' };
        }

        return storage;
    }

    getCacheMetrics() {
        // Simplified cache metrics (would need more specific implementation)
        return {
            estimated: 'unknown',
            // Could add specific cache measurements here
        };
    }

    getMetrics() {
        if (this.resourceHistory.length === 0) return null;

        const current = this.resourceHistory[this.resourceHistory.length - 1];
        const recent = this.resourceHistory.slice(-10);

        return {
            current,
            trends: {
                domGrowth: recent.length > 1 ? 
                    current.dom.nodes - recent[0].dom.nodes : 0,
                storageGrowth: recent.length > 1 ? 
                    current.storage.localStorage.used - recent[0].storage.localStorage.used : 0
            },
            history: recent
        };
    }

    onMetrics(callback) {
        this.callbacks.push(callback);
    }

    notifyCallbacks(type, data) {
        this.callbacks.forEach(callback => {
            try {
                callback(type, data);
            } catch (error) {
                console.error('Resource metrics callback error:', error);
            }
        });
    }

    stop() {
        if (this.collectionInterval) {
            clearInterval(this.collectionInterval);
            this.collectionInterval = null;
        }
    }
}

/**
 * Custom Metrics Collector
 * カスタムメトリクス収集器 - アプリケーション固有のメトリクス収集
 */
export class CustomMetricsCollector {
    constructor() {
        this.customMetrics = new Map();
        this.callbacks = [];
    }

    async initialize() {
        console.log('Custom Metrics Collector initialized');
    }

    recordMetric(name, value, metadata = {}) {
        const timestamp = Date.now();
        const metric = {
            timestamp,
            name,
            value,
            metadata
        };

        if (!this.customMetrics.has(name)) {
            this.customMetrics.set(name, []);
        }

        const history = this.customMetrics.get(name);
        history.push(metric);

        // Keep only last 100 entries per metric
        if (history.length > 100) {
            history.shift();
        }

        this.notifyCallbacks('custom', metric);
    }

    incrementCounter(name, amount = 1, metadata = {}) {
        const current = this.getLatestValue(name) || 0;
        this.recordMetric(name, current + amount, { 
            type: 'counter', 
            increment: amount,
            ...metadata 
        });
    }

    recordTiming(name, startTime, endTime = performance.now(), metadata = {}) {
        const duration = endTime - startTime;
        this.recordMetric(name, duration, { 
            type: 'timing', 
            startTime, 
            endTime,
            ...metadata 
        });
    }

    getLatestValue(name) {
        const history = this.customMetrics.get(name);
        return history && history.length > 0 ? 
            history[history.length - 1].value : null;
    }

    getMetrics() {
        const summary = {};
        
        for (const [name, history] of this.customMetrics) {
            const recent = history.slice(-10);
            const values = recent.map(m => m.value);
            
            summary[name] = {
                current: values[values.length - 1],
                count: history.length,
                recent: recent,
                statistics: {
                    min: Math.min(...values),
                    max: Math.max(...values),
                    average: values.reduce((sum, v) => sum + v, 0) / values.length,
                    sum: values.reduce((sum, v) => sum + v, 0)
                }
            };
        }

        return summary;
    }

    onMetrics(callback) {
        this.callbacks.push(callback);
    }

    notifyCallbacks(type, data) {
        this.callbacks.forEach(callback => {
            try {
                callback(type, data);
            } catch (error) {
                console.error('Custom metrics callback error:', error);
            }
        });
    }

    clearMetric(name) {
        this.customMetrics.delete(name);
    }

    clearAllMetrics() {
        this.customMetrics.clear();
    }

    stop() {
        // Custom metrics don't need active stopping
        console.log('Custom Metrics Collector stopped');
    }
}