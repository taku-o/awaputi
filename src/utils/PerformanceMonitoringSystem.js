/**
 * Enhanced Performance Monitoring and Diagnostics System
 * 
 * 詳細なパフォーマンスメトリクス収集とリアルタイムダッシュボード
 * Requirements: 7.1, 7.3
 */

export class PerformanceMonitoringSystem {
    constructor() {
        this.dashboard = new PerformanceDashboard();
        this.dataGatherer = new PerformanceDataGatherer();
        this.historyTracker = new PerformanceHistoryTracker();
        this.alertManager = new PerformanceAlertManager();
        this.metricsRegistry = new MetricsRegistry();
        this.realtimeStream = new RealtimeMetricsStream();
        this.monitoring = false;
        this.monitoringConfig = null;
        
        this.initializeMonitoring();
    }

    async initializeMonitoring() {
        try {
            await this.setupMetricsRegistry();
            await this.dashboard.initialize();
            await this.dataGatherer.initialize();
            await this.historyTracker.initialize();
            await this.alertManager.initialize();
            await this.realtimeStream.initialize();
            
            console.log('PerformanceMonitoringSystem initialized successfully');
        } catch (error) {
            console.error('Failed to initialize PerformanceMonitoringSystem:', error);
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
            console.warn('Monitoring is already active');
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

        console.log('Performance monitoring started');
    }

    async stopMonitoring() {
        if (!this.monitoring) {
            console.warn('Monitoring is not active');
            return;
        }

        this.monitoring = false;

        // 定期収集停止
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        // 各コンポーネント停止
        await this.dataGatherer.stop();
        await this.historyTracker.stop();
        await this.alertManager.stop();
        await this.realtimeStream.stop();

        // ダッシュボード非表示
        if (this.monitoringConfig.enableDashboard) {
            await this.dashboard.hide();
        }

        console.log('Performance monitoring stopped');
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

        } catch (error) {
            console.error('Failed to collect and process metrics:', error);
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
            activeAlerts: this.alertManager.getActiveAlerts().length
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
}

// パフォーマンスダッシュボード
class PerformanceDashboard {
    constructor() {
        this.container = null;
        this.widgets = new Map();
        this.visible = false;
        this.updateInterval = null;
    }

    async initialize() {
        this.createDashboardContainer();
        this.setupDefaultWidgets();
        this.setupEventListeners();
    }

    createDashboardContainer() {
        // ダッシュボードのHTML要素を作成
        this.container = document.createElement('div');
        this.container.id = 'performance-dashboard';
        this.container.className = 'performance-dashboard hidden';
        
        this.container.innerHTML = `
            <div class="dashboard-header">
                <h3>Performance Monitor</h3>
                <div class="dashboard-controls">
                    <button id="dashboard-minimize" title="Minimize">−</button>
                    <button id="dashboard-close" title="Close">×</button>
                </div>
            </div>
            <div class="dashboard-content">
                <div class="metrics-grid" id="metrics-grid"></div>
                <div class="dashboard-footer">
                    <span id="last-update">Last updated: --</span>
                    <span id="monitoring-status">Status: Stopped</span>
                </div>
            </div>
        `;

        // スタイル適用
        this.injectStyles();
        
        // ドキュメントに追加
        document.body.appendChild(this.container);
    }

    injectStyles() {
        const styleId = 'performance-dashboard-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .performance-dashboard {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 400px;
                min-height: 300px;
                background: rgba(0, 0, 0, 0.9);
                border: 1px solid #444;
                border-radius: 8px;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 12px;
                color: #fff;
                z-index: 10000;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(10px);
            }

            .performance-dashboard.hidden {
                display: none;
            }

            .performance-dashboard.minimized .dashboard-content {
                display: none;
            }

            .dashboard-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 15px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 8px 8px 0 0;
                cursor: move;
            }

            .dashboard-header h3 {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
            }

            .dashboard-controls button {
                background: none;
                border: none;
                color: #fff;
                cursor: pointer;
                font-size: 16px;
                padding: 2px 6px;
                margin-left: 5px;
                border-radius: 3px;
                transition: background-color 0.2s;
            }

            .dashboard-controls button:hover {
                background-color: rgba(255, 255, 255, 0.2);
            }

            .dashboard-content {
                padding: 15px;
            }

            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 10px;
                margin-bottom: 15px;
            }

            .metric-widget {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                padding: 10px;
                transition: all 0.3s ease;
            }

            .metric-widget:hover {
                background: rgba(255, 255, 255, 0.08);
                transform: translateY(-1px);
            }

            .metric-widget.warning {
                border-color: #ffa726;
                background: rgba(255, 167, 38, 0.1);
            }

            .metric-widget.critical {
                border-color: #ef5350;
                background: rgba(239, 83, 80, 0.1);
            }

            .metric-title {
                font-size: 11px;
                color: #bbb;
                margin-bottom: 5px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .metric-value {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 3px;
            }

            .metric-unit {
                font-size: 10px;
                color: #888;
                margin-left: 2px;
            }

            .metric-trend {
                font-size: 10px;
                display: flex;
                align-items: center;
                gap: 3px;
            }

            .trend-icon {
                width: 0;
                height: 0;
            }

            .trend-up {
                border-left: 3px solid transparent;
                border-right: 3px solid transparent;
                border-bottom: 5px solid #4caf50;
            }

            .trend-down {
                border-left: 3px solid transparent;
                border-right: 3px solid transparent;
                border-top: 5px solid #f44336;
            }

            .trend-stable {
                width: 6px;
                height: 2px;
                background: #9e9e9e;
            }

            .dashboard-footer {
                display: flex;
                justify-content: space-between;
                font-size: 10px;
                color: #888;
                padding-top: 10px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }

            #monitoring-status.active {
                color: #4caf50;
            }

            #monitoring-status.inactive {
                color: #f44336;
            }
        `;

        document.head.appendChild(style);
    }

    setupDefaultWidgets() {
        const defaultWidgets = [
            { id: 'fps', title: 'Frame Rate', unit: 'fps' },
            { id: 'memory_used', title: 'Memory', unit: 'MB' },
            { id: 'render_time', title: 'Render Time', unit: 'ms' },
            { id: 'input_lag', title: 'Input Lag', unit: 'ms' },
            { id: 'network_latency', title: 'Network', unit: 'ms' },
            { id: 'power_consumption', title: 'Power', unit: 'mW' }
        ];

        const metricsGrid = this.container.querySelector('#metrics-grid');
        
        for (const widget of defaultWidgets) {
            const widgetElement = this.createMetricWidget(widget);
            metricsGrid.appendChild(widgetElement);
            this.widgets.set(widget.id, widgetElement);
        }
    }

    createMetricWidget(config) {
        const widget = document.createElement('div');
        widget.className = 'metric-widget';
        widget.id = `widget-${config.id}`;
        
        widget.innerHTML = `
            <div class="metric-title">${config.title}</div>
            <div class="metric-value">
                <span class="value">--</span>
                <span class="metric-unit">${config.unit}</span>
            </div>
            <div class="metric-trend">
                <span class="trend-icon"></span>
                <span class="trend-text">--</span>
            </div>
        `;

        return widget;
    }

    setupEventListeners() {
        // ダッシュボードコントロール
        this.container.querySelector('#dashboard-close').addEventListener('click', () => {
            this.hide();
        });

        this.container.querySelector('#dashboard-minimize').addEventListener('click', () => {
            this.toggle();
        });

        // ドラッグ機能
        this.makeDraggable();
    }

    makeDraggable() {
        const header = this.container.querySelector('.dashboard-header');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        header.addEventListener('mousedown', (e) => {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target === header || header.contains(e.target)) {
                isDragging = true;
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;

                xOffset = currentX;
                yOffset = currentY;

                this.container.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    async show() {
        this.container.classList.remove('hidden');
        this.visible = true;
        
        // 定期更新開始
        this.updateInterval = setInterval(() => {
            this.updateLastUpdateTime();
        }, 1000);

        this.updateMonitoringStatus(true);
    }

    async hide() {
        this.container.classList.add('hidden');
        this.visible = false;
        
        // 定期更新停止
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        this.updateMonitoringStatus(false);
    }

    toggle() {
        if (this.visible) {
            this.container.classList.toggle('minimized');
        }
    }

    updateMetrics(metrics) {
        if (!this.visible) return;

        for (const [metricId, value] of metrics) {
            const widget = this.widgets.get(metricId);
            if (widget) {
                this.updateWidget(widget, value, metricId);
            }
        }

        this.updateLastUpdateTime();
    }

    updateWidget(widget, value, metricId) {
        const valueElement = widget.querySelector('.value');
        const trendIcon = widget.querySelector('.trend-icon');
        const trendText = widget.querySelector('.trend-text');

        // 値の更新
        const formattedValue = this.formatValue(value, metricId);
        valueElement.textContent = formattedValue;

        // 前の値と比較してトレンドを計算
        const previousValue = widget.dataset.previousValue;
        if (previousValue !== undefined) {
            const trend = this.calculateTrend(parseFloat(previousValue), value);
            this.updateTrendIndicator(trendIcon, trendText, trend);
        }

        // 健康状態の評価
        const health = this.evaluateHealth(value, metricId);
        widget.className = `metric-widget ${health}`;

        // 前の値を保存
        widget.dataset.previousValue = value.toString();
    }

    formatValue(value, metricId) {
        if (typeof value !== 'number') return '--';

        switch (metricId) {
            case 'fps':
                return value.toFixed(1);
            case 'memory_used':
                return (value / 1024 / 1024).toFixed(1);
            case 'render_time':
            case 'input_lag':
            case 'network_latency':
                return value.toFixed(1);
            case 'power_consumption':
                return Math.round(value);
            default:
                return value.toFixed(2);
        }
    }

    calculateTrend(previous, current) {
        const change = current - previous;
        const threshold = Math.abs(previous) * 0.05; // 5% change threshold

        if (Math.abs(change) < threshold) return 'stable';
        return change > 0 ? 'up' : 'down';
    }

    updateTrendIndicator(icon, text, trend) {
        icon.className = `trend-icon trend-${trend}`;
        
        switch (trend) {
            case 'up':
                text.textContent = 'Rising';
                break;
            case 'down':
                text.textContent = 'Falling';
                break;
            default:
                text.textContent = 'Stable';
        }
    }

    evaluateHealth(value, metricId) {
        // 簡易的な健康状態評価
        const thresholds = {
            fps: { warning: 50, critical: 30 },
            memory_used: { warning: 100 * 1024 * 1024, critical: 150 * 1024 * 1024 },
            render_time: { warning: 20, critical: 33.33 },
            input_lag: { warning: 30, critical: 50 },
            network_latency: { warning: 100, critical: 200 },
            power_consumption: { warning: 500, critical: 800 }
        };

        const threshold = thresholds[metricId];
        if (!threshold) return '';

        if (metricId === 'fps') {
            if (value < threshold.critical) return 'critical';
            if (value < threshold.warning) return 'warning';
        } else {
            if (value > threshold.critical) return 'critical';
            if (value > threshold.warning) return 'warning';
        }

        return '';
    }

    updateLastUpdateTime() {
        const lastUpdateElement = this.container.querySelector('#last-update');
        lastUpdateElement.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    }

    updateMonitoringStatus(active) {
        const statusElement = this.container.querySelector('#monitoring-status');
        statusElement.textContent = `Status: ${active ? 'Active' : 'Stopped'}`;
        statusElement.className = active ? 'active' : 'inactive';
    }
}

// パフォーマンスデータ収集器
class PerformanceDataGatherer {
    constructor() {
        this.collectors = new Map();
        this.collecting = false;
    }

    async initialize() {
        // 各種コレクターを初期化
        this.collectors.set('frame', new FrameDataCollector());
        this.collectors.set('memory', new MemoryDataCollector());
        this.collectors.set('render', new RenderDataCollector());
        this.collectors.set('network', new NetworkDataCollector());
        this.collectors.set('interaction', new InteractionDataCollector());
        this.collectors.set('battery', new BatteryDataCollector());

        for (const collector of this.collectors.values()) {
            await collector.initialize();
        }
    }

    async start(config) {
        this.collecting = true;
        for (const collector of this.collectors.values()) {
            await collector.start(config);
        }
    }

    async stop() {
        this.collecting = false;
        for (const collector of this.collectors.values()) {
            await collector.stop();
        }
    }

    async collectAllMetrics() {
        if (!this.collecting) {
            throw new Error('Data gathering is not active');
        }

        const allMetrics = new Map();

        for (const [category, collector] of this.collectors) {
            try {
                const metrics = await collector.collect();
                for (const [key, value] of Object.entries(metrics)) {
                    allMetrics.set(key, value);
                }
            } catch (error) {
                console.error(`Failed to collect ${category} metrics:`, error);
            }
        }

        return allMetrics;
    }
}

// 基本データコレクター実装
class FrameDataCollector {
    constructor() {
        this.frameHistory = [];
        this.lastFrameTime = 0;
    }

    async initialize() {}

    async start(config) {
        this.frameHistory = [];
        this.lastFrameTime = performance.now();
    }

    async stop() {}

    async collect() {
        const now = performance.now();
        const frameTime = now - this.lastFrameTime;
        const fps = frameTime > 0 ? 1000 / frameTime : 0;

        this.frameHistory.push(frameTime);
        if (this.frameHistory.length > 60) { // 最新60フレーム
            this.frameHistory.shift();
        }

        this.lastFrameTime = now;

        const variance = this.calculateVariance(this.frameHistory);

        return {
            fps: fps,
            frame_time: frameTime,
            frame_variance: Math.sqrt(variance)
        };
    }

    calculateVariance(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    }
}

class MemoryDataCollector {
    constructor() {
        this.memoryHistory = [];
    }

    async initialize() {}

    async start(config) {
        this.memoryHistory = [];
    }

    async stop() {}

    async collect() {
        const memoryInfo = performance.memory || {};
        const used = memoryInfo.usedJSHeapSize || 0;
        
        this.memoryHistory.push({ timestamp: performance.now(), used });
        if (this.memoryHistory.length > 100) {
            this.memoryHistory.shift();
        }

        const growthRate = this.calculateGrowthRate();
        const gcFrequency = this.estimateGCFrequency();

        return {
            memory_used: used,
            memory_growth: growthRate,
            gc_frequency: gcFrequency
        };
    }

    calculateGrowthRate() {
        if (this.memoryHistory.length < 2) return 0;
        const recent = this.memoryHistory.slice(-10);
        const timeSpan = recent[recent.length - 1].timestamp - recent[0].timestamp;
        const memoryChange = recent[recent.length - 1].used - recent[0].used;
        return timeSpan > 0 ? (memoryChange / timeSpan) * 1000 : 0; // bytes per second
    }

    estimateGCFrequency() {
        // GC頻度の推定（簡易実装）
        if (this.memoryHistory.length < 10) return 0;
        
        let gcEvents = 0;
        for (let i = 1; i < this.memoryHistory.length; i++) {
            const current = this.memoryHistory[i].used;
            const previous = this.memoryHistory[i - 1].used;
            
            // 大幅なメモリ減少をGCとみなす
            if (previous - current > 1024 * 1024) { // 1MB以上の減少
                gcEvents++;
            }
        }
        
        const timeSpan = this.memoryHistory[this.memoryHistory.length - 1].timestamp - this.memoryHistory[0].timestamp;
        return timeSpan > 0 ? (gcEvents / timeSpan) * 1000 : 0; // events per second
    }
}

class RenderDataCollector {
    async initialize() {}
    async start(config) {}
    async stop() {}

    async collect() {
        // レンダリング時間の測定（模擬実装）
        const renderStart = performance.now();
        await new Promise(resolve => requestAnimationFrame(resolve));
        const renderTime = performance.now() - renderStart;

        return {
            render_time: renderTime,
            draw_calls: Math.floor(Math.random() * 50) + 10,
            triangles: Math.floor(Math.random() * 10000) + 1000
        };
    }
}

class NetworkDataCollector {
    async initialize() {}
    async start(config) {}
    async stop() {}

    async collect() {
        return {
            network_latency: Math.random() * 100 + 10,
            bandwidth: Math.random() * 1000 + 100,
            error_rate: Math.random() * 5
        };
    }
}

class InteractionDataCollector {
    async initialize() {}
    async start(config) {}
    async stop() {}

    async collect() {
        return {
            input_lag: Math.random() * 30 + 5,
            response_time: Math.random() * 200 + 50
        };
    }
}

class BatteryDataCollector {
    async initialize() {}
    async start(config) {}
    async stop() {}

    async collect() {
        return {
            power_consumption: Math.random() * 600 + 200,
            thermal_state: Math.floor(Math.random() * 3)
        };
    }
}

// パフォーマンス履歴追跡
class PerformanceHistoryTracker {
    constructor() {
        this.history = new Map();
        this.maxRetention = 24 * 60 * 60 * 1000; // 24時間
    }

    async initialize() {}

    async start(config) {
        this.maxRetention = config.retention || this.maxRetention;
    }

    async stop() {}

    addDataPoint(timestamp, metrics) {
        for (const [metricId, value] of metrics) {
            if (!this.history.has(metricId)) {
                this.history.set(metricId, []);
            }

            const metricHistory = this.history.get(metricId);
            metricHistory.push({ timestamp, value });

            // 古いデータを削除
            const cutoff = timestamp - this.maxRetention;
            while (metricHistory.length > 0 && metricHistory[0].timestamp < cutoff) {
                metricHistory.shift();
            }
        }
    }

    getHistory(metricId, timeRange) {
        const metricHistory = this.history.get(metricId);
        if (!metricHistory) return [];

        const cutoff = performance.now() - timeRange;
        return metricHistory.filter(point => point.timestamp >= cutoff);
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
            case 'median':
                const sorted = values.slice().sort((a, b) => a - b);
                const mid = Math.floor(sorted.length / 2);
                return sorted.length % 2 === 0 ? 
                    (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
            default:
                return null;
        }
    }

    getDataPointCount() {
        let total = 0;
        for (const history of this.history.values()) {
            total += history.length;
        }
        return total;
    }
}

// パフォーマンスアラート管理
class PerformanceAlertManager {
    constructor() {
        this.alerts = new Map();
        this.activeAlerts = new Set();
        this.alertHistory = [];
    }

    async initialize() {}

    async start(config) {}

    async stop() {}

    addAlert(metricId, threshold, condition = 'above', callback = null) {
        const alertId = `${metricId}_${condition}_${threshold}`;
        this.alerts.set(alertId, {
            metricId,
            threshold,
            condition,
            callback,
            created: Date.now()
        });
        return alertId;
    }

    removeAlert(alertId) {
        this.alerts.delete(alertId);
        this.activeAlerts.delete(alertId);
    }

    checkThresholds(metrics) {
        for (const [alertId, alert] of this.alerts) {
            const value = metrics.get(alert.metricId);
            if (value === undefined) continue;

            const triggered = this.evaluateCondition(value, alert.threshold, alert.condition);
            const wasActive = this.activeAlerts.has(alertId);

            if (triggered && !wasActive) {
                // アラート発火
                this.triggerAlert(alertId, alert, value);
            } else if (!triggered && wasActive) {
                // アラート解除
                this.clearAlert(alertId, alert, value);
            }
        }
    }

    evaluateCondition(value, threshold, condition) {
        switch (condition) {
            case 'above':
                return value > threshold;
            case 'below':
                return value < threshold;
            case 'equals':
                return value === threshold;
            default:
                return false;
        }
    }

    triggerAlert(alertId, alert, value) {
        this.activeAlerts.add(alertId);
        
        const alertEvent = {
            id: alertId,
            type: 'triggered',
            metric: alert.metricId,
            value,
            threshold: alert.threshold,
            condition: alert.condition,
            timestamp: Date.now()
        };

        this.alertHistory.push(alertEvent);
        
        // コールバック実行
        if (alert.callback) {
            try {
                alert.callback(alertEvent);
            } catch (error) {
                console.error('Alert callback error:', error);
            }
        }

        console.warn('Performance alert triggered:', alertEvent);
    }

    clearAlert(alertId, alert, value) {
        this.activeAlerts.delete(alertId);
        
        const alertEvent = {
            id: alertId,
            type: 'cleared',
            metric: alert.metricId,
            value,
            threshold: alert.threshold,
            condition: alert.condition,
            timestamp: Date.now()
        };

        this.alertHistory.push(alertEvent);
        
        console.info('Performance alert cleared:', alertEvent);
    }

    getActiveAlerts() {
        return Array.from(this.activeAlerts);
    }

    getAlertsInRange(startTime, endTime) {
        return this.alertHistory.filter(alert => 
            alert.timestamp >= startTime && alert.timestamp <= endTime
        );
    }
}

// メトリクス登録管理
class MetricsRegistry {
    constructor() {
        this.metrics = new Map();
    }

    register(metricConfig) {
        this.metrics.set(metricConfig.id, metricConfig);
        return metricConfig.id;
    }

    get(metricId) {
        return this.metrics.get(metricId);
    }

    getAllIds() {
        return Array.from(this.metrics.keys());
    }

    getByCategory(category) {
        return Array.from(this.metrics.values()).filter(m => m.category === category);
    }

    getCount() {
        return this.metrics.size;
    }
}

// リアルタイムメトリクスストリーム
class RealtimeMetricsStream {
    constructor() {
        this.subscribers = new Set();
        this.streaming = false;
    }

    async initialize() {}

    async start(config) {
        this.streaming = true;
    }

    async stop() {
        this.streaming = false;
    }

    send(timestamp, metrics) {
        if (!this.streaming) return;

        const data = { timestamp, metrics: Object.fromEntries(metrics) };
        
        for (const subscriber of this.subscribers) {
            try {
                subscriber(data);
            } catch (error) {
                console.error('Stream subscriber error:', error);
            }
        }
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }
}

export { PerformanceMonitoringSystem };