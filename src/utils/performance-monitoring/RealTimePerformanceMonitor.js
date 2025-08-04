/**
 * RealTimePerformanceMonitor - Real-time performance data collection component
 * Handles real-time performance data collection, continuous monitoring, data streaming, and performance event detection
 */

import { getErrorHandler } from '../../core/ErrorHandler.js';

export class RealTimePerformanceMonitor {
    constructor(performanceMonitoringSystem) {
        this.performanceMonitoringSystem = performanceMonitoringSystem;
        this.errorHandler = getErrorHandler();
        
        // Real-time monitoring configuration
        this.monitoringConfig = {
            interval: 1000, // 1秒間隔
            enableDashboard: true,
            enableHistory: true,
            enableAlerts: true,
            enableRealtimeStream: true,
            metricsFilter: [], // 空の場合は全メトリクス
            retention: 24 * 60 * 60 * 1000, // 24時間
            bufferSize: 1000, // データポイント数
            samplingRate: 1.0 // 100%サンプリング
        };
        
        // Monitoring state
        this.monitoring = false;
        this.monitoringInterval = null;
        
        // Real-time data collection components
        this.frameDataCollector = new FrameDataCollector();
        this.memoryDataCollector = new MemoryDataCollector();
        this.renderDataCollector = new RenderDataCollector();
        this.networkDataCollector = new NetworkDataCollector();
        this.interactionDataCollector = new InteractionDataCollector();
        this.batteryDataCollector = new BatteryDataCollector();
        
        // Data streaming
        this.realtimeStream = null;
        this.streamBuffer = [];
        this.streamSubscribers = new Set();
        
        // Performance event detection
        this.eventDetectors = new Map();
        this.detectedEvents = [];
        this.eventThresholds = new Map();
        
        this.initializeCollectors();
        this.setupEventDetectors();
        
        console.log('[RealTimePerformanceMonitor] Real-time performance monitoring component initialized');
    }
    
    /**
     * Initialize data collectors
     */
    async initializeCollectors() {
        try {
            await this.frameDataCollector.initialize();
            await this.memoryDataCollector.initialize();
            await this.renderDataCollector.initialize();
            await this.networkDataCollector.initialize();
            await this.interactionDataCollector.initialize();
            await this.batteryDataCollector.initialize();
            
            console.log('[RealTimePerformanceMonitor] Data collectors initialized');
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'RealTimePerformanceMonitor.initializeCollectors'
            });
        }
    }
    
    /**
     * Setup performance event detectors
     */
    setupEventDetectors() {
        // Frame rate drop detector
        this.eventDetectors.set('fps_drop', {
            threshold: 45,
            duration: 3000, // 3秒間
            condition: (value, threshold) => value < threshold,
            active: false,
            startTime: null
        });
        
        // Memory leak detector
        this.eventDetectors.set('memory_leak', {
            threshold: 10, // 10MB/min growth
            samples: 10,
            condition: (values) => this.detectMemoryLeak(values),
            active: false,
            history: []
        });
        
        // Frame time spike detector
        this.eventDetectors.set('frame_spike', {
            threshold: 50, // 50ms
            condition: (value, threshold) => value > threshold,
            active: false
        });
        
        // Network latency spike detector
        this.eventDetectors.set('network_spike', {
            threshold: 500, // 500ms
            condition: (value, threshold) => value > threshold,
            active: false
        });
        
        // Input lag detector
        this.eventDetectors.set('input_lag', {
            threshold: 100, // 100ms
            condition: (value, threshold) => value > threshold,
            active: false
        });
    }
    
    /**
     * Start real-time monitoring
     * @param {object} config - Monitoring configuration
     */
    async startMonitoring(config = {}) {
        if (this.monitoring) {
            console.warn('[RealTimePerformanceMonitor] Monitoring is already active');
            return;
        }
        
        // Update configuration
        Object.assign(this.monitoringConfig, config);
        
        this.monitoring = true;
        
        try {
            // Start data collection interval
            this.monitoringInterval = setInterval(() => {
                this.collectRealTimeData();
            }, this.monitoringConfig.interval);
            
            // Initialize real-time stream
            if (this.monitoringConfig.enableRealtimeStream) {
                this.initializeStream();
            }
            
            console.log('[RealTimePerformanceMonitor] Real-time monitoring started');
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'RealTimePerformanceMonitor.startMonitoring'
            });
            this.monitoring = false;
        }
    }
    
    /**
     * Stop real-time monitoring
     */
    async stopMonitoring() {
        if (!this.monitoring) {
            console.warn('[RealTimePerformanceMonitor] Monitoring is not active');
            return;
        }
        
        this.monitoring = false;
        
        try {
            // Clear monitoring interval
            if (this.monitoringInterval) {
                clearInterval(this.monitoringInterval);
                this.monitoringInterval = null;
            }
            
            // Stop real-time stream
            this.stopStream();
            
            console.log('[RealTimePerformanceMonitor] Real-time monitoring stopped');
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'RealTimePerformanceMonitor.stopMonitoring'
            });
        }
    }
    
    /**
     * Collect real-time performance data
     */
    async collectRealTimeData() {
        if (!this.monitoring) return;
        
        try {
            const timestamp = performance.now();
            
            // Collect data from all collectors
            const frameData = await this.frameDataCollector.collect();
            const memoryData = await this.memoryDataCollector.collect();
            const renderData = await this.renderDataCollector.collect();
            const networkData = await this.networkDataCollector.collect();
            const interactionData = await this.interactionDataCollector.collect();
            const batteryData = await this.batteryDataCollector.collect();
            
            // Combine all metrics
            const metrics = new Map([
                ...frameData,
                ...memoryData,
                ...renderData,
                ...networkData,
                ...interactionData,
                ...batteryData
            ]);
            
            // Apply sampling rate
            if (Math.random() > this.monitoringConfig.samplingRate) {
                return;
            }
            
            // Filter metrics if specified
            const filteredMetrics = this.filterMetrics(metrics);
            
            // Detect performance events
            this.detectEvents(filteredMetrics, timestamp);
            
            // Stream data
            if (this.monitoringConfig.enableRealtimeStream) {
                this.streamData(timestamp, filteredMetrics);
            }
            
            // Notify monitoring system
            if (this.performanceMonitoringSystem && this.performanceMonitoringSystem.onRealTimeData) {
                this.performanceMonitoringSystem.onRealTimeData(timestamp, filteredMetrics);
            }
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'RealTimePerformanceMonitor.collectRealTimeData'
            });
        }
    }
    
    /**
     * Filter metrics based on configuration
     * @param {Map} metrics - Raw metrics
     * @returns {Map} Filtered metrics
     */
    filterMetrics(metrics) {
        if (!this.monitoringConfig.metricsFilter || this.monitoringConfig.metricsFilter.length === 0) {
            return metrics;
        }
        
        const filtered = new Map();
        for (const metricId of this.monitoringConfig.metricsFilter) {
            if (metrics.has(metricId)) {
                filtered.set(metricId, metrics.get(metricId));
            }
        }
        return filtered;
    }
    
    /**
     * Detect performance events
     * @param {Map} metrics - Current metrics
     * @param {number} timestamp - Current timestamp
     */
    detectEvents(metrics, timestamp) {
        for (const [eventType, detector] of this.eventDetectors) {
            try {
                const detected = this.checkEventCondition(eventType, detector, metrics, timestamp);
                
                if (detected && !detector.active) {
                    // Event started
                    detector.active = true;
                    detector.startTime = timestamp;
                    this.onEventDetected(eventType, metrics, timestamp);
                    
                } else if (!detected && detector.active) {
                    // Event ended
                    detector.active = false;
                    this.onEventResolved(eventType, metrics, timestamp, detector.startTime);
                }
                
            } catch (error) {
                console.warn(`[RealTimePerformanceMonitor] Event detection failed for ${eventType}:`, error);
            }
        }
    }
    
    /**
     * Check event condition
     * @param {string} eventType - Event type
     * @param {object} detector - Event detector configuration
     * @param {Map} metrics - Current metrics
     * @param {number} timestamp - Current timestamp
     * @returns {boolean} True if event condition is met
     */
    checkEventCondition(eventType, detector, metrics, timestamp) {
        switch (eventType) {
            case 'fps_drop':
                return this.checkFPSDropEvent(detector, metrics, timestamp);
            case 'memory_leak':
                return this.checkMemoryLeakEvent(detector, metrics, timestamp);
            case 'frame_spike':
                return this.checkFrameSpikeEvent(detector, metrics);
            case 'network_spike':
                return this.checkNetworkSpikeEvent(detector, metrics);
            case 'input_lag':
                return this.checkInputLagEvent(detector, metrics);
            default:
                return false;
        }
    }
    
    /**
     * Check FPS drop event
     * @param {object} detector - FPS drop detector
     * @param {Map} metrics - Current metrics
     * @param {number} timestamp - Current timestamp
     * @returns {boolean} True if FPS drop detected
     */
    checkFPSDropEvent(detector, metrics, timestamp) {
        const fps = metrics.get('fps');
        if (fps === undefined) return false;
        
        const isBelow = detector.condition(fps, detector.threshold);
        
        if (isBelow && !detector.active) {
            detector.startTime = timestamp;
        } else if (!isBelow) {
            detector.startTime = null;
        }
        
        // Check if condition persists for required duration
        return isBelow && detector.startTime && 
               (timestamp - detector.startTime) >= detector.duration;
    }
    
    /**
     * Check memory leak event
     * @param {object} detector - Memory leak detector
     * @param {Map} metrics - Current metrics
     * @param {number} timestamp - Current timestamp
     * @returns {boolean} True if memory leak detected
     */
    checkMemoryLeakEvent(detector, metrics, timestamp) {
        const memoryUsed = metrics.get('memory_used');
        if (memoryUsed === undefined) return false;
        
        // Add to history
        detector.history.push({ value: memoryUsed, timestamp });
        
        // Keep only required samples
        if (detector.history.length > detector.samples) {
            detector.history.shift();
        }
        
        // Need enough samples to detect trend
        if (detector.history.length < detector.samples) {
            return false;
        }
        
        return detector.condition(detector.history);
    }
    
    /**
     * Check frame spike event
     * @param {object} detector - Frame spike detector
     * @param {Map} metrics - Current metrics
     * @returns {boolean} True if frame spike detected
     */
    checkFrameSpikeEvent(detector, metrics) {
        const frameTime = metrics.get('frame_time');
        if (frameTime === undefined) return false;
        
        return detector.condition(frameTime, detector.threshold);
    }
    
    /**
     * Check network spike event
     * @param {object} detector - Network spike detector
     * @param {Map} metrics - Current metrics
     * @returns {boolean} True if network spike detected
     */
    checkNetworkSpikeEvent(detector, metrics) {
        const networkLatency = metrics.get('network_latency');
        if (networkLatency === undefined) return false;
        
        return detector.condition(networkLatency, detector.threshold);
    }
    
    /**
     * Check input lag event
     * @param {object} detector - Input lag detector
     * @param {Map} metrics - Current metrics
     * @returns {boolean} True if input lag detected
     */
    checkInputLagEvent(detector, metrics) {
        const inputLag = metrics.get('input_lag');
        if (inputLag === undefined) return false;
        
        return detector.condition(inputLag, detector.threshold);
    }
    
    /**
     * Detect memory leak from history
     * @param {Array} history - Memory usage history
     * @returns {boolean} True if memory leak detected
     */
    detectMemoryLeak(history) {
        if (history.length < 3) return false;
        
        // Calculate memory growth rate
        const first = history[0];
        const last = history[history.length - 1];
        const timeSpan = (last.timestamp - first.timestamp) / 1000 / 60; // minutes
        const memoryGrowth = last.value - first.value; // MB
        const growthRate = memoryGrowth / timeSpan; // MB/min
        
        return growthRate > 10; // 10MB/min threshold
    }
    
    /**
     * Handle event detected
     * @param {string} eventType - Event type
     * @param {Map} metrics - Current metrics
     * @param {number} timestamp - Event timestamp
     */
    onEventDetected(eventType, metrics, timestamp) {
        const event = {
            type: eventType,
            detected: timestamp,
            metrics: new Map(metrics),
            severity: this.calculateEventSeverity(eventType, metrics)
        };
        
        this.detectedEvents.push(event);
        
        // Keep events history manageable
        if (this.detectedEvents.length > 100) {
            this.detectedEvents.shift();
        }
        
        // Notify monitoring system
        if (this.performanceMonitoringSystem && this.performanceMonitoringSystem.onPerformanceEvent) {
            this.performanceMonitoringSystem.onPerformanceEvent('detected', event);
        }
        
        console.log(`[RealTimePerformanceMonitor] Performance event detected: ${eventType}`);
    }
    
    /**
     * Handle event resolved
     * @param {string} eventType - Event type
     * @param {Map} metrics - Current metrics
     * @param {number} timestamp - Resolution timestamp
     * @param {number} startTime - Event start time
     */
    onEventResolved(eventType, metrics, timestamp, startTime) {
        const event = {
            type: eventType,
            resolved: timestamp,
            duration: timestamp - startTime,
            metrics: new Map(metrics)
        };
        
        // Update the corresponding detected event
        const detectedEvent = this.detectedEvents.find(e => 
            e.type === eventType && !e.resolved
        );
        
        if (detectedEvent) {
            detectedEvent.resolved = timestamp;
            detectedEvent.duration = event.duration;
        }
        
        // Notify monitoring system
        if (this.performanceMonitoringSystem && this.performanceMonitoringSystem.onPerformanceEvent) {
            this.performanceMonitoringSystem.onPerformanceEvent('resolved', event);
        }
        
        console.log(`[RealTimePerformanceMonitor] Performance event resolved: ${eventType} (duration: ${event.duration}ms)`);
    }
    
    /**
     * Calculate event severity
     * @param {string} eventType - Event type
     * @param {Map} metrics - Current metrics
     * @returns {string} Severity level
     */
    calculateEventSeverity(eventType, metrics) {
        switch (eventType) {
            case 'fps_drop':
                const fps = metrics.get('fps');
                if (fps < 20) return 'critical';
                if (fps < 30) return 'high';
                return 'medium';
                
            case 'memory_leak':
                const memoryGrowth = metrics.get('memory_growth');
                if (memoryGrowth > 20) return 'critical';
                if (memoryGrowth > 15) return 'high';
                return 'medium';
                
            case 'frame_spike':
                const frameTime = metrics.get('frame_time');
                if (frameTime > 100) return 'critical';
                if (frameTime > 75) return 'high';
                return 'medium';
                
            case 'network_spike':
                const latency = metrics.get('network_latency');
                if (latency > 1000) return 'critical';
                if (latency > 750) return 'high';
                return 'medium';
                
            case 'input_lag':
                const inputLag = metrics.get('input_lag');
                if (inputLag > 200) return 'critical';
                if (inputLag > 150) return 'high';
                return 'medium';
                
            default:
                return 'low';
        }
    }
    
    /**
     * Initialize real-time data stream
     */
    initializeStream() {
        this.realtimeStream = {
            active: true,
            buffer: [],
            bufferSize: this.monitoringConfig.bufferSize,
            lastFlush: Date.now()
        };
        
        console.log('[RealTimePerformanceMonitor] Real-time stream initialized');
    }
    
    /**
     * Stream performance data
     * @param {number} timestamp - Data timestamp
     * @param {Map} metrics - Performance metrics
     */
    streamData(timestamp, metrics) {
        if (!this.realtimeStream || !this.realtimeStream.active) return;
        
        const dataPoint = {
            timestamp,
            metrics: Object.fromEntries(metrics),
            events: this.getActiveEvents()
        };
        
        // Add to stream buffer
        this.realtimeStream.buffer.push(dataPoint);
        
        // Keep buffer size manageable
        if (this.realtimeStream.buffer.length > this.realtimeStream.bufferSize) {
            this.realtimeStream.buffer.shift();
        }
        
        // Notify subscribers
        this.notifyStreamSubscribers(dataPoint);
    }
    
    /**
     * Stop real-time data stream
     */
    stopStream() {
        if (this.realtimeStream) {
            this.realtimeStream.active = false;
            this.realtimeStream.buffer = [];
        }
        
        console.log('[RealTimePerformanceMonitor] Real-time stream stopped');
    }
    
    /**
     * Subscribe to real-time data stream
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribeToStream(callback) {
        this.streamSubscribers.add(callback);
        
        return () => {
            this.streamSubscribers.delete(callback);
        };
    }
    
    /**
     * Notify stream subscribers
     * @param {object} dataPoint - Stream data point
     */
    notifyStreamSubscribers(dataPoint) {
        for (const callback of this.streamSubscribers) {
            try {
                callback(dataPoint);
            } catch (error) {
                console.warn('[RealTimePerformanceMonitor] Stream subscriber error:', error);
            }
        }
    }
    
    /**
     * Get currently active events
     * @returns {Array} Active events
     */
    getActiveEvents() {
        return Array.from(this.eventDetectors.entries())
            .filter(([, detector]) => detector.active)
            .map(([type]) => type);
    }
    
    /**
     * Get detected events history
     * @param {number} timeRange - Time range in milliseconds
     * @returns {Array} Events history
     */
    getEventsHistory(timeRange = 3600000) {
        const now = Date.now();
        return this.detectedEvents.filter(event => 
            now - event.detected < timeRange
        );
    }
    
    /**
     * Get real-time stream buffer
     * @returns {Array} Stream buffer
     */
    getStreamBuffer() {
        return this.realtimeStream ? [...this.realtimeStream.buffer] : [];
    }
    
    /**
     * Configure event detector
     * @param {string} eventType - Event type
     * @param {object} config - Detector configuration
     */
    configureEventDetector(eventType, config) {
        const detector = this.eventDetectors.get(eventType);
        if (detector) {
            Object.assign(detector, config);
            console.log(`[RealTimePerformanceMonitor] Event detector configured: ${eventType}`);
        }
    }
    
    /**
     * Get monitoring statistics
     * @returns {object} Monitoring statistics
     */
    getMonitoringStats() {
        return {
            monitoring: this.monitoring,
            config: this.monitoringConfig,
            streamActive: this.realtimeStream?.active || false,
            streamBufferSize: this.realtimeStream?.buffer.length || 0,
            subscribersCount: this.streamSubscribers.size,
            activeEvents: this.getActiveEvents().length,
            totalEventsDetected: this.detectedEvents.length,
            eventDetectors: Object.fromEntries(
                Array.from(this.eventDetectors.entries()).map(([type, detector]) => [
                    type, 
                    { 
                        active: detector.active, 
                        threshold: detector.threshold 
                    }
                ])
            )
        };
    }
    
    /**
     * Cleanup monitoring resources
     */
    destroy() {
        this.stopMonitoring();
        this.stopStream();
        this.streamSubscribers.clear();
        this.detectedEvents = [];
        this.eventDetectors.clear();
        
        console.log('[RealTimePerformanceMonitor] Monitor destroyed');
    }
}

// Data collector classes (simplified implementations)
class FrameDataCollector {
    async initialize() {
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.frameTimes = [];
    }
    
    async collect() {
        const now = performance.now();
        const frameTime = now - this.lastFrameTime;
        this.lastFrameTime = now;
        this.frameCount++;
        
        this.frameTimes.push(frameTime);
        if (this.frameTimes.length > 60) {
            this.frameTimes.shift();
        }
        
        const fps = this.frameTimes.length > 0 ? 1000 / (this.frameTimes.reduce((a, b) => a + b) / this.frameTimes.length) : 60;
        const variance = this.calculateVariance(this.frameTimes);
        
        return new Map([
            ['fps', Math.min(fps, 60)],
            ['frame_time', frameTime],
            ['frame_variance', variance]
        ]);
    }
    
    calculateVariance(values) {
        if (values.length < 2) return 0;
        const mean = values.reduce((a, b) => a + b) / values.length;
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    }
}

class MemoryDataCollector {
    async initialize() {
        this.baselineMemory = performance.memory?.usedJSHeapSize || 0;
        this.lastMemoryCheck = Date.now();
    }
    
    async collect() {
        const memory = performance.memory;
        if (!memory) return new Map();
        
        const now = Date.now();
        const timeDelta = (now - this.lastMemoryCheck) / 1000; // seconds
        const memoryUsed = memory.usedJSHeapSize / 1024 / 1024; // MB
        const memoryGrowth = timeDelta > 0 ? (memoryUsed - this.baselineMemory) / timeDelta : 0;
        
        this.lastMemoryCheck = now;
        
        return new Map([
            ['memory_used', memoryUsed],
            ['memory_growth', memoryGrowth],
            ['gc_frequency', 0] // Simplified
        ]);
    }
}

class RenderDataCollector {
    async initialize() {
        this.lastRenderTime = performance.now();
    }
    
    async collect() {
        const now = performance.now();
        const renderTime = Math.random() * 15 + 5; // Simulated render time
        
        return new Map([
            ['render_time', renderTime],
            ['draw_calls', Math.floor(Math.random() * 50) + 10],
            ['triangles', Math.floor(Math.random() * 10000) + 1000]
        ]);
    }
}

class NetworkDataCollector {
    async initialize() {
        this.connection = navigator.connection;
    }
    
    async collect() {
        const latency = Math.random() * 100 + 20; // Simulated latency
        const bandwidth = this.connection?.downlink || 10; // Mbps
        
        return new Map([
            ['network_latency', latency],
            ['bandwidth', bandwidth * 125], // Convert to KB/s
            ['error_rate', Math.random() * 2]
        ]);
    }
}

class InteractionDataCollector {
    async initialize() {
        this.lastInputTime = Date.now();
    }
    
    async collect() {
        const inputLag = Math.random() * 30 + 5; // Simulated input lag
        const responseTime = Math.random() * 200 + 50; // Simulated response time
        
        return new Map([
            ['input_lag', inputLag],
            ['response_time', responseTime]
        ]);
    }
}

class BatteryDataCollector {
    async initialize() {
        this.battery = navigator.battery || navigator.getBattery?.();
    }
    
    async collect() {
        const powerConsumption = Math.random() * 400 + 200; // Simulated power consumption
        const thermalState = Math.floor(Math.random() * 3); // 0-2 thermal levels
        
        return new Map([
            ['power_consumption', powerConsumption],
            ['thermal_state', thermalState]
        ]);
    }
}