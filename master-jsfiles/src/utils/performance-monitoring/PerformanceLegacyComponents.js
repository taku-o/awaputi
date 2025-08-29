/**
 * PerformanceLegacyComponents - Legacy monitoring components
 * Contains legacy classes maintained for backward compatibility
 */

import { getErrorHandler } from '../../core/ErrorHandler.js';

// パフォーマンスダッシュボード
export class PerformanceDashboard {
    constructor() {
        this.container = null;
        this.widgets = new Map();
        this.visible = false;
        this.updateInterval = null;
        this.charts = new Map();
    }

    async initialize() {
        console.log('PerformanceDashboard initialized');
    }

    async show() {
        if (this.visible) return;
        
        this.createDashboard();
        this.visible = true;
        this.startUpdates();
        console.log('PerformanceDashboard shown');
    }

    async hide() {
        if (!this.visible) return;
        
        this.stopUpdates();
        this.removeDashboard();
        this.visible = false;
        console.log('PerformanceDashboard hidden');
    }

    toggle() {
        return this.visible ? this.hide() : this.show();
    }

    createDashboard() {
        // Create dashboard UI elements
        this.container = document.createElement('div');
        this.container.id = 'performance-dashboard';
        this.container.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
        `;
        document.body.appendChild(this.container);
    }

    removeDashboard() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
            this.container = null;
        }
    }

    updateMetrics(metrics) {
        if (!this.container || !this.visible) return;
        
        let html = '<h3>Performance Dashboard</h3>';
        for (const [key, value] of metrics) {
            html += `<div>${key}: ${this.formatValue(value)}</div>`;
        }
        this.container.innerHTML = html;
    }

    formatValue(value) {
        if (typeof value === 'number') {
            return value.toFixed(2);
        }
        return String(value);
    }

    startUpdates() {
        this.updateInterval = setInterval(() => {
            // Update dashboard periodically
        }, 1000);
    }

    stopUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

// パフォーマンスデータ収集器
export class PerformanceDataGatherer {
    constructor() {
        this.collectors = new Map();
        this.collecting = false;
    }

    async initialize() {
        console.log('PerformanceDataGatherer initialized');
    }

    async start(config) {
        this.collecting = true;
        console.log('PerformanceDataGatherer started');
    }

    async stop() {
        this.collecting = false;
        console.log('PerformanceDataGatherer stopped');
    }

    async collectAllMetrics() {
        const metrics = new Map();
        
        // Collect basic performance metrics
        metrics.set('fps', this.calculateFPS());
        metrics.set('memory_used', this.getMemoryUsage());
        metrics.set('frame_time', this.getFrameTime());
        
        return metrics;
    }

    calculateFPS() {
        return Math.random() * 60; // Simulated FPS
    }

    getMemoryUsage() {
        return performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : Math.random() * 100;
    }

    getFrameTime() {
        return Math.random() * 30 + 10; // Simulated frame time
    }
}

// パフォーマンス履歴追跡
export class PerformanceHistoryTracker {
    constructor() {
        this.history = new Map();
        this.maxDataPoints = 1000;
    }

    async initialize() {
        console.log('PerformanceHistoryTracker initialized');
    }

    async start(config) {
        console.log('PerformanceHistoryTracker started');
    }

    async stop() {
        console.log('PerformanceHistoryTracker stopped');
    }

    addDataPoint(timestamp, metrics) {
        for (const [metricId, value] of metrics) {
            if (!this.history.has(metricId)) {
                this.history.set(metricId, []);
            }
            
            const dataPoints = this.history.get(metricId);
            dataPoints.push({ timestamp, value });
            
            // Keep history size manageable
            if (dataPoints.length > this.maxDataPoints) {
                dataPoints.shift();
            }
        }
    }

    getHistory(metricId, timeRange) {
        const dataPoints = this.history.get(metricId) || [];
        const now = Date.now();
        return dataPoints.filter(point => now - point.timestamp < timeRange);
    }

    getAggregated(metricId, timeRange, aggregation) {
        const history = this.getHistory(metricId, timeRange);
        if (history.length === 0) return null;
        
        const values = history.map(h => h.value);
        
        switch (aggregation) {
            case 'average':
                return values.reduce((sum, val) => sum + val, 0) / values.length;
            case 'min':
                return Math.min(...values);
            case 'max':
                return Math.max(...values);
            default:
                return values[values.length - 1];
        }
    }

    getDataPointCount() {
        let total = 0;
        for (const dataPoints of this.history.values()) {
            total += dataPoints.length;
        }
        return total;
    }
}

// パフォーマンスアラート管理
export class PerformanceAlertManager {
    constructor() {
        this.alerts = new Map();
        this.activeAlerts = [];
        this.alertHistory = [];
    }

    async initialize() {
        console.log('PerformanceAlertManager initialized');
    }

    async start(config) {
        console.log('PerformanceAlertManager started');
    }

    async stop() {
        console.log('PerformanceAlertManager stopped');
    }

    addAlert(metricId, threshold, condition, callback) {
        const alert = {
            metricId,
            threshold,
            condition,
            callback,
            id: `alert_${Date.now()}_${Math.random()}`
        };
        
        this.alerts.set(alert.id, alert);
        return alert.id;
    }

    checkThresholds(metrics) {
        for (const [alertId, alert] of this.alerts) {
            const value = metrics.get(alert.metricId);
            if (value === undefined) continue;
            
            let triggered = false;
            switch (alert.condition) {
                case 'above':
                    triggered = value > alert.threshold;
                    break;
                case 'below':
                    triggered = value < alert.threshold;
                    break;
                case 'equal':
                    triggered = value === alert.threshold;
                    break;
            }
            
            if (triggered) {
                this.triggerAlert(alert, value);
            }
        }
    }

    triggerAlert(alert, value) {
        const alertEvent = {
            alertId: alert.id,
            metricId: alert.metricId,
            value,
            threshold: alert.threshold,
            condition: alert.condition,
            timestamp: Date.now()
        };
        
        this.activeAlerts.push(alertEvent);
        this.alertHistory.push(alertEvent);
        
        if (alert.callback) {
            alert.callback(alertEvent);
        }
        
        console.log(`Alert triggered: ${alert.metricId} ${alert.condition} ${alert.threshold} (current: ${value})`);
    }

    getActiveAlerts() {
        return [...this.activeAlerts];
    }

    getAlertsInRange(startTime, endTime) {
        return this.alertHistory.filter(alert => 
            alert.timestamp >= startTime && alert.timestamp <= endTime
        );
    }

    handlePerformanceEvent(eventType, event) {
        console.log(`PerformanceAlertManager handling ${eventType} event: ${event.type}`);
    }
}

// メトリクス登録管理
export class MetricsRegistry {
    constructor() {
        this.metrics = new Map();
    }

    register(metricConfig) {
        this.metrics.set(metricConfig.id, metricConfig);
        console.log(`Metric registered: ${metricConfig.id}`);
        return metricConfig.id;
    }

    get(metricId) {
        return this.metrics.get(metricId);
    }

    getCount() {
        return this.metrics.size;
    }

    getAllIds() {
        return Array.from(this.metrics.keys());
    }
}

// リアルタイムメトリクスストリーム
export class RealtimeMetricsStream {
    constructor() {
        this.subscribers = new Set();
        this.streaming = false;
        this.buffer = [];
    }

    async initialize() {
        console.log('RealtimeMetricsStream initialized');
    }

    async start(config) {
        this.streaming = true;
        console.log('RealtimeMetricsStream started');
    }

    async stop() {
        this.streaming = false;
        console.log('RealtimeMetricsStream stopped');
    }

    send(timestamp, metrics) {
        if (!this.streaming) return;
        
        const dataPoint = {
            timestamp,
            metrics: Object.fromEntries(metrics)
        };
        
        this.buffer.push(dataPoint);
        
        // Keep buffer size manageable
        if (this.buffer.length > 100) {
            this.buffer.shift();
        }
        
        // Notify subscribers
        for (const subscriber of this.subscribers) {
            try {
                subscriber(dataPoint);
            } catch (error) {
                console.warn('RealtimeMetricsStream subscriber error:', error);
            }
        }
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }
}