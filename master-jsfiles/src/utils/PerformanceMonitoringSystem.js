/**
 * Enhanced Performance Monitoring and Diagnostics System
 * 
 * 詳細なパフォーマンスメトリクス収集とリアルタイムダッシュボード
 * Requirements: 7.1, 7.3
 */

import { getErrorHandler } from '../core/ErrorHandler.js';
import { RealTimePerformanceMonitor } from './performance-monitoring/RealTimePerformanceMonitor.js';
import { PerformanceDataAnalyzer } from './performance-monitoring/PerformanceDataAnalyzer.js';
import { 
    PerformanceDashboard, 
    PerformanceDataGatherer, 
    PerformanceHistoryTracker, 
    PerformanceAlertManager, 
    MetricsRegistry, 
    RealtimeMetricsStream 
} from './performance-monitoring/PerformanceLegacyComponents.js';

export class PerformanceMonitoringSystem {
    constructor() {
        this.errorHandler = getErrorHandler();
        
        // Initialize sub-components using dependency injection
        this.realTimeMonitor = new RealTimePerformanceMonitor(this);
        this.dataAnalyzer = new PerformanceDataAnalyzer(this);
        
        // Legacy components (maintained for backward compatibility)
        this.dashboard = new PerformanceDashboard();
        this.dataGatherer = new PerformanceDataGatherer();
        this.historyTracker = new PerformanceHistoryTracker();
        this.alertManager = new PerformanceAlertManager();
        this.metricsRegistry = new MetricsRegistry();
        this.realtimeStream = new RealtimeMetricsStream();
        
        // Monitoring state
        this.monitoring = false;
        this.monitoringConfig = null;
        
        this.initializeMonitoring();
        
        console.log('[PerformanceMonitoringSystem] Initialized with Main Controller Pattern');
    }

    async initializeMonitoring() {
        try {
            await this.setupMetricsRegistry();
            await this.dashboard.initialize();
            await this.dataGatherer.initialize();
            await this.historyTracker.initialize();
            await this.alertManager.initialize();
            await this.realtimeStream.initialize();
            
            console.log('[PerformanceMonitoringSystem] Monitoring system initialized successfully');
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceMonitoringSystem.initializeMonitoring'
            });
            throw error;
        }
    }

    async setupMetricsRegistry() {
        // 標準メトリクスの登録
        const standardMetrics = [
            // フレームレートメトリクス
            { id: 'fps', name: 'Frame Rate', category: 'rendering', unit: 'fps', target: 60, min: 30 },
            { id: 'frame_time', name: 'Frame Time', category: 'rendering', unit: 'ms', target: 16.67, max: 33.33 },
            { id: 'frame_variance', name: 'Frame Variance', category: 'rendering', unit: 'ms', target: 0, max: 5 },
            
            // メモリメトリクス
            { id: 'memory_used', name: 'Memory Used', category: 'memory', unit: 'MB', target: 50, max: 150 },
            { id: 'memory_growth', name: 'Memory Growth Rate', category: 'memory', unit: 'MB/s', target: 0, max: 1 },
            { id: 'gc_frequency', name: 'GC Frequency', category: 'memory', unit: 'Hz', target: 0.1, max: 1 },
            
            // レンダリングメトリクス
            { id: 'render_time', name: 'Render Time', category: 'rendering', unit: 'ms', target: 10, max: 20 },
            { id: 'draw_calls', name: 'Draw Calls', category: 'rendering', unit: 'count', target: 20, max: 100 },
            { id: 'triangles', name: 'Triangle Count', category: 'rendering', unit: 'count', target: 5000, max: 50000 },
            
            // ネットワークメトリクス
            { id: 'network_latency', name: 'Network Latency', category: 'network', unit: 'ms', target: 50, max: 200 },
            { id: 'bandwidth', name: 'Bandwidth Usage', category: 'network', unit: 'KB/s', target: 100, max: 1000 },
            { id: 'error_rate', name: 'Network Error Rate', category: 'network', unit: '%', target: 0, max: 5 },
            
            // ユーザーインタラクション
            { id: 'input_lag', name: 'Input Lag', category: 'interaction', unit: 'ms', target: 10, max: 50 },
            { id: 'response_time', name: 'Response Time', category: 'interaction', unit: 'ms', target: 100, max: 500 },
            
            // バッテリー（モバイル）
            { id: 'power_consumption', name: 'Power Consumption', category: 'battery', unit: 'mW', target: 200, max: 800 },
            { id: 'thermal_state', name: 'Thermal State', category: 'battery', unit: 'level', target: 0, max: 2 }
        ];

        for (const metric of standardMetrics) {
            this.metricsRegistry.register(metric);
        }
    }

    async startMonitoring(config = {}) {
        if (this.monitoring) {
            console.warn('[PerformanceMonitoringSystem] Monitoring is already active');
            return;
        }

        this.monitoringConfig = {
            interval: config.interval || 1000, // 1秒間隔
            enableDashboard: config.enableDashboard !== false,
            enableHistory: config.enableHistory !== false,
            enableAlerts: config.enableAlerts !== false,
            enableRealtimeStream: config.enableRealtimeStream !== false,
            metricsFilter: config.metricsFilter || [], // 空の場合は全メトリクス
            retention: config.retention || 24 * 60 * 60 * 1000, // 24時間
            ...config
        };

        this.monitoring = true;

        try {
            // Start real-time monitoring
            await this.realTimeMonitor.startMonitoring(this.monitoringConfig);

            // データ収集開始
            await this.dataGatherer.start(this.monitoringConfig);

            // ダッシュボード表示
            if (this.monitoringConfig.enableDashboard) {
                await this.dashboard.show();
            }

            // 履歴追跡開始
            if (this.monitoringConfig.enableHistory) {
                await this.historyTracker.start(this.monitoringConfig);
            }

            // アラート管理開始
            if (this.monitoringConfig.enableAlerts) {
                await this.alertManager.start(this.monitoringConfig);
            }

            // リアルタイムストリーム開始
            if (this.monitoringConfig.enableRealtimeStream) {
                await this.realtimeStream.start(this.monitoringConfig);
            }

            // 定期データ収集
            this.monitoringInterval = setInterval(() => {
                this.collectAndProcessMetrics();
            }, this.monitoringConfig.interval);

            console.log('[PerformanceMonitoringSystem] Performance monitoring started');

        } catch (error) {
            this.monitoring = false;
            this.errorHandler.handleError(error, {
                context: 'PerformanceMonitoringSystem.startMonitoring'
            });
            throw error;
        }
    }

    async stopMonitoring() {
        if (!this.monitoring) {
            console.warn('[PerformanceMonitoringSystem] Monitoring is not active');
            return;
        }

        this.monitoring = false;

        try {
            // 定期収集停止
            if (this.monitoringInterval) {
                clearInterval(this.monitoringInterval);
            }

            // Stop real-time monitoring
            await this.realTimeMonitor.stopMonitoring();

            // 各コンポーネント停止
            await this.dataGatherer.stop();
            await this.historyTracker.stop();
            await this.alertManager.stop();
            await this.realtimeStream.stop();

            // ダッシュボード非表示
            if (this.monitoringConfig.enableDashboard) {
                await this.dashboard.hide();
            }

            console.log('[PerformanceMonitoringSystem] Performance monitoring stopped');

        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceMonitoringSystem.stopMonitoring'
            });
        }
    }

    async collectAndProcessMetrics() {
        try {
            // 全メトリクスを収集
            const metrics = await this.dataGatherer.collectAllMetrics();
            const timestamp = performance.now();

            // フィルタリング
            const filteredMetrics = this.filterMetrics(metrics);

            // 履歴に追加
            if (this.monitoringConfig.enableHistory) {
                this.historyTracker.addDataPoint(timestamp, filteredMetrics);
            }

            // ダッシュボード更新
            if (this.monitoringConfig.enableDashboard) {
                this.dashboard.updateMetrics(filteredMetrics);
            }

            // アラートチェック
            if (this.monitoringConfig.enableAlerts) {
                this.alertManager.checkThresholds(filteredMetrics);
            }

            // リアルタイムストリーム送信
            if (this.monitoringConfig.enableRealtimeStream) {
                this.realtimeStream.send(timestamp, filteredMetrics);
            }

            // データ分析
            await this.dataAnalyzer.analyzePerformanceData(timestamp, filteredMetrics);

        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'PerformanceMonitoringSystem.collectAndProcessMetrics'
            });
        }
    }

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
     * Handle real-time data from monitor
     * @param {number} timestamp - Data timestamp
     * @param {Map} metrics - Performance metrics
     */
    onRealTimeData(timestamp, metrics) {
        // Process real-time data if needed
        console.log(`[PerformanceMonitoringSystem] Real-time data received: ${metrics.size} metrics`);
    }

    /**
     * Handle performance events from monitor
     * @param {string} eventType - Event type ('detected' or 'resolved')
     * @param {object} event - Event data
     */
    onPerformanceEvent(eventType, event) {
        console.log(`[PerformanceMonitoringSystem] Performance event ${eventType}: ${event.type}`);
        
        // Forward to alert manager if needed
        if (this.alertManager) {
            this.alertManager.handlePerformanceEvent(eventType, event);
        }
    }

    // 履歴データへのアクセス
    getMetricsHistory(metricId, timeRange = 3600000) { // デフォルト1時間
        return this.historyTracker.getHistory(metricId, timeRange);
    }

    getAggregatedMetrics(metricId, timeRange = 3600000, aggregation = 'average') {
        return this.historyTracker.getAggregated(metricId, timeRange, aggregation);
    }

    // カスタムメトリクス追加
    addCustomMetric(metricConfig) {
        return this.metricsRegistry.register(metricConfig);
    }

    // アラート設定
    setAlert(metricId, threshold, condition = 'above', callback = null) {
        return this.alertManager.addAlert(metricId, threshold, condition, callback);
    }

    // ダッシュボード表示切り替え
    toggleDashboard() {
        return this.dashboard.toggle();
    }

    // 現在の監視状態
    getMonitoringStatus() {
        return {
            active: this.monitoring,
            config: this.monitoringConfig,
            metricsCount: this.metricsRegistry.getCount(),
            dataPoints: this.historyTracker.getDataPointCount(),
            activeAlerts: this.alertManager.getActiveAlerts().length,
            realTimeStats: this.realTimeMonitor.getMonitoringStats(),
            analysisResults: this.dataAnalyzer.getAnalysisResults()
        };
    }

    // パフォーマンスレポート生成
    async generateReport(timeRange = 3600000) {
        const endTime = Date.now();
        const startTime = endTime - timeRange;

        const report = {
            timeRange: { startTime, endTime, duration: timeRange },
            metrics: new Map(),
            summary: {},
            alerts: this.alertManager.getAlertsInRange(startTime, endTime),
            analysisResults: this.dataAnalyzer.getAnalysisResults(),
            performanceEvents: this.realTimeMonitor.getEventsHistory(timeRange),
            timestamp: endTime
        };

        // 各メトリクスの統計情報を計算
        for (const metricId of this.metricsRegistry.getAllIds()) {
            const history = this.getMetricsHistory(metricId, timeRange);
            if (history.length > 0) {
                report.metrics.set(metricId, {
                    current: history[history.length - 1].value,
                    average: this.calculateAverage(history),
                    min: Math.min(...history.map(h => h.value)),
                    max: Math.max(...history.map(h => h.value)),
                    trend: this.calculateTrend(history),
                    variance: this.calculateVariance(history.map(h => h.value)),
                    samplesCount: history.length
                });
            }
        }

        // サマリー生成
        report.summary = this.generateReportSummary(report.metrics);

        return report;
    }

    calculateAverage(history) {
        return history.reduce((sum, h) => sum + h.value, 0) / history.length;
    }

    calculateTrend(history) {
        if (history.length < 2) return 'stable';
        
        const first = history[0].value;
        const last = history[history.length - 1].value;
        const change = (last - first) / first;
        
        if (Math.abs(change) < 0.05) return 'stable';
        return change > 0 ? 'increasing' : 'decreasing';
    }

    calculateVariance(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    }

    generateReportSummary(metrics) {
        let healthy = 0;
        let warning = 0;
        let critical = 0;

        for (const [metricId, stats] of metrics) {
            const config = this.metricsRegistry.get(metricId);
            if (config) {
                const status = this.evaluateMetricHealth(stats.current, config);
                if (status === 'healthy') healthy++;
                else if (status === 'warning') warning++;
                else critical++;
            }
        }

        return {
            totalMetrics: metrics.size,
            healthyMetrics: healthy,
            warningMetrics: warning,
            criticalMetrics: critical,
            overallHealth: this.calculateOverallHealth(healthy, warning, critical)
        };
    }

    evaluateMetricHealth(value, config) {
        if (config.max && value > config.max) return 'critical';
        if (config.min && value < config.min) return 'critical';
        if (config.warning_max && value > config.warning_max) return 'warning';
        if (config.warning_min && value < config.warning_min) return 'warning';
        return 'healthy';
    }

    calculateOverallHealth(healthy, warning, critical) {
        const total = healthy + warning + critical;
        if (total === 0) return 'unknown';
        
        const healthyRatio = healthy / total;
        const criticalRatio = critical / total;
        
        if (criticalRatio > 0.2) return 'critical';
        if (criticalRatio > 0.1 || healthyRatio < 0.7) return 'warning';
        return 'healthy';
    }

    /**
     * Get trend analysis data
     * @param {string} metricId - Metric ID
     * @returns {object} Trend data
     */
    getTrendData(metricId) {
        return this.dataAnalyzer.getTrendData(metricId);
    }

    /**
     * Get performance insights
     * @param {string} category - Insight category filter
     * @returns {Array} Performance insights
     */
    getPerformanceInsights(category = null) {
        return this.dataAnalyzer.getRecentInsights(category);
    }

    /**
     * Subscribe to real-time data stream
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribeToRealTimeData(callback) {
        return this.realTimeMonitor.subscribeToStream(callback);
    }

    /**
     * Configure monitoring system
     * @param {object} config - Configuration options
     */
    configure(config) {
        // Update real-time monitor configuration
        if (config.realTimeMonitor) {
            this.realTimeMonitor.configure(config.realTimeMonitor);
        }

        // Update data analyzer configuration
        if (config.dataAnalyzer) {
            this.dataAnalyzer.configure(config.dataAnalyzer);
        }

        console.log('[PerformanceMonitoringSystem] Configuration updated');
    }

    /**
     * Cleanup monitoring system
     */
    destroy() {
        this.stopMonitoring();
        
        // Destroy sub-components
        if (this.realTimeMonitor) {
            this.realTimeMonitor.destroy();
        }
        
        if (this.dataAnalyzer) {
            this.dataAnalyzer.destroy();
        }

        console.log('[PerformanceMonitoringSystem] Monitoring system destroyed');
    }
}

export { PerformanceMonitoringSystem };