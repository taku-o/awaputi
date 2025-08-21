/**
 * Enhanced Performance Monitoring and Diagnostics System
 * 
 * 詳細なパフォーマンスメトリクス収集とリアルタイムダッシュボード
 * Requirements: 7.1, 7.3
 */

import { getErrorHandler  } from '../core/ErrorHandler.js';
import { RealTimePerformanceMonitor  } from './performance-monitoring/RealTimePerformanceMonitor.js';
import { PerformanceDataAnalyzer  } from './performance-monitoring/PerformanceDataAnalyzer.js';
import { PerformanceDashboard, 
    PerformanceDataGatherer, ;
    PerformanceHistoryTracker, ;
    PerformanceAlertManager, ;
    MetricsRegistry,

    RealtimeMetricsStream '  }'

} from './performance-monitoring/PerformanceLegacyComponents.js';

// Type definitions
interface ErrorHandler { ''
    handleError(error: Error, context: any): void ,}

interface MetricConfig { id: string,
    name: string;
    category: string;
    unit: string,
    target: number;
    min?: number;
    max?: number;
    warning_min?: number;
    warning_max?: number; ,}

interface MonitoringConfig { interval?: number;
    enableDashboard?: boolean;
    enableHistory?: boolean;
    enableAlerts?: boolean;
    enableRealtimeStream?: boolean;
    metricsFilter?: string[];
    retention?: number;
    [key: string]: any, }

interface PerformanceMetrics extends Map<string, any> {}

interface DataPoint { timestamp: number,
    value: number ,}

interface MetricStats { current: number;
    average: number,
    min: number,
    max: number,
    trend: 'stable' | 'increasing' | 'decreasing';
    variance: number,
    samplesCount: number ,}

interface TimeRange { startTime: number;
    endTime: number,
    duration: number }

interface Alert { metricId: string;
    threshold: number;
    condition: string,
    timestamp: number;
    [key: string]: any, }

interface PerformanceEvent { type: string,
    timestamp: number;
    [key: string]: any, }

interface AnalysisResults { [key: string]: any, }

interface MonitoringStats { [key: string]: any, }

interface ReportSummary { totalMetrics: number,
    healthyMetrics: number,
    warningMetrics: number,
    criticalMetrics: number,
    overallHealth: 'healthy' | 'warning' | 'critical' | 'unknown' ,}

interface PerformanceReport { timeRange: TimeRange,
    metrics: Map<string, MetricStats>;
    summary: ReportSummary;
    alerts: Alert[];
    analysisResults: AnalysisResults;
    performanceEvents: PerformanceEvent[],
    timestamp: number ,}

interface MonitoringStatus { active: boolean;
    config: MonitoringConfig | null;
    metricsCount: number;
    dataPoints: number;
    activeAlerts: number;
    realTimeStats: MonitoringStats,
    analysisResults: AnalysisResults
    }

interface TrendData { [key: string]: any, }

interface PerformanceInsight { [key: string]: any, }

// Legacy component interfaces
interface PerformanceDashboard { initialize(): Promise<void>;
    show(): Promise<void>;
    hide(): Promise<void>;
    toggle(): Promise<void>;
    updateMetrics(metrics: PerformanceMetrics): void, }

interface PerformanceDataGatherer { initialize(): Promise<void>;
    start(config: MonitoringConfig): Promise<void>,
    stop(): Promise<void>;
    collectAllMetrics(): Promise<PerformanceMetrics>;
    }

interface PerformanceHistoryTracker { initialize(): Promise<void>;
    start(config: MonitoringConfig): Promise<void>,
    stop(): Promise<void>;
    addDataPoint(timestamp: number, metrics: PerformanceMetrics): void,
    getHistory(metricId: string, timeRange: number): DataPoint[],
    getAggregated(metricId: string, timeRange: number, aggregation: string): any,
    getDataPointCount(): number }

interface PerformanceAlertManager { initialize(): Promise<void>;
    start(config: MonitoringConfig): Promise<void>,
    stop(): Promise<void>;
    checkThresholds(metrics: PerformanceMetrics): void,
    handlePerformanceEvent(eventType: string, event: PerformanceEvent): void,
    addAlert(metricId: string, threshold: number, condition: string, callback?: Function): any;
    getActiveAlerts(): Alert[];
    getAlertsInRange(startTime: number, endTime: number): Alert[]
    ,}

interface MetricsRegistry { register(metric: MetricConfig): any,
    get(metricId: string): MetricConfig | undefined,
    getCount(): number;
    getAllIds(): string[]; }

interface RealtimeMetricsStream { initialize(): Promise<void>;
    start(config: MonitoringConfig): Promise<void>,
    stop(): Promise<void>;
    send(timestamp: number, metrics: PerformanceMetrics): void ,}

interface RealTimePerformanceMonitor { startMonitoring(config: MonitoringConfig): Promise<void>,
    stopMonitoring(): Promise<void>;
    getMonitoringStats(): MonitoringStats;
    getEventsHistory(timeRange: number): PerformanceEvent[],
    subscribeToStream(callback: Function): Function,
    configure(config: any): void,
    destroy(): void }

interface PerformanceDataAnalyzer { analyzePerformanceData(timestamp: number, metrics: PerformanceMetrics): Promise<void>,
    getAnalysisResults(): AnalysisResults;
    getTrendData(metricId: string): TrendData,
    getRecentInsights(category?: string | null): PerformanceInsight[];
    configure(config: any): void,
    destroy(): void }

export class PerformanceMonitoringSystem {
    private errorHandler: ErrorHandler;
    private realTimeMonitor: RealTimePerformanceMonitor;
    private dataAnalyzer: PerformanceDataAnalyzer;
    private dashboard: PerformanceDashboard;
    private dataGatherer: PerformanceDataGatherer;
    private historyTracker: PerformanceHistoryTracker;
    private alertManager: PerformanceAlertManager;
    private metricsRegistry: MetricsRegistry;
    private realtimeStream: RealtimeMetricsStream;
    private monitoring: boolean;
    private, monitoringConfig: MonitoringConfig | null;
    private monitoringInterval?: NodeJS.Timeout;

    constructor() {

        this.errorHandler = getErrorHandler();
        
        // Initialize sub-components using dependency injection
        this.realTimeMonitor = new RealTimePerformanceMonitor(this);
        this.dataAnalyzer = new PerformanceDataAnalyzer(this);
        
        // Legacy components (maintained, for backward, compatibility);
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
    }

        console.log('[PerformanceMonitoringSystem] Initialized, with Main, Controller Pattern'); }'
    }

    async initializeMonitoring(): Promise<void> { try {
            await this.setupMetricsRegistry();
            await this.dashboard.initialize();
            await this.dataGatherer.initialize();
            await this.historyTracker.initialize();

            await this.alertManager.initialize();''
            await this.realtimeStream.initialize();

            console.log('[PerformanceMonitoringSystem] Monitoring, system initialized, successfully');' }

        } catch (error) { this.errorHandler.handleError(error as Error, {)'
                context: 'PerformanceMonitoringSystem.initializeMonitoring' ,}';
            throw error;
        }
    }

    async setupMetricsRegistry('''
            { id: 'fps', name: 'Frame Rate', category: 'rendering', unit: 'fps', target: 60, min: 30 ,},''
            { id: 'frame_time', name: 'Frame Time', category: 'rendering', unit: 'ms', target: 16.67, max: 33.33 ,},''
            { id: 'frame_variance', name: 'Frame Variance', category: 'rendering', unit: 'ms', target: 0, max: 5 ,},
            // メモリメトリクス
            { id: 'memory_used', name: 'Memory Used', category: 'memory', unit: 'MB', target: 50, max: 150 ,},''
            { id: 'memory_growth', name: 'Memory Growth Rate', category: 'memory', unit: 'MB/s', target: 0, max: 1 ,},''
            { id: 'gc_frequency', name: 'GC Frequency', category: 'memory', unit: 'Hz', target: 0.1, max: 1 ,},
            // レンダリングメトリクス
            { id: 'render_time', name: 'Render Time', category: 'rendering', unit: 'ms', target: 10, max: 20 ,},''
            { id: 'draw_calls', name: 'Draw Calls', category: 'rendering', unit: 'count', target: 20, max: 100 ,},''
            { id: 'triangles', name: 'Triangle Count', category: 'rendering', unit: 'count', target: 5000, max: 50000 ,},
            // ネットワークメトリクス
            { id: 'network_latency', name: 'Network Latency', category: 'network', unit: 'ms', target: 50, max: 200 ,},''
            { id: 'bandwidth', name: 'Bandwidth Usage', category: 'network', unit: 'KB/s', target: 100, max: 1000 ,},''
            { id: 'error_rate', name: 'Network Error Rate', category: 'network', unit: '%', target: 0, max: 5 ,},
            // ユーザーインタラクション
            { id: 'input_lag', name: 'Input Lag', category: 'interaction', unit: 'ms', target: 10, max: 50 ,},''
            { id: 'response_time', name: 'Response Time', category: 'interaction', unit: 'ms', target: 100, max: 500 ,}''
            // バッテリー（モバイル）
            { id: 'power_consumption', name: 'Power Consumption', category: 'battery', unit: 'mW', target: 200, max: 800 ,},''
            { id: 'thermal_state', name: 'Thermal State', category: 'battery', unit: 'level', target: 0, max: 2 ,}
        ];

        for (const, metric of, standardMetrics) { this.metricsRegistry.register(metric); }
    }
';

    async startMonitoring(config: MonitoringConfig = { ): Promise<void> {''
        if(this.monitoring) {'

            console.warn('[PerformanceMonitoringSystem] Monitoring, is already, active);
        }
            return; }
        }

        this.monitoringConfig = { interval: config.interval || 1000, // 1秒間隔
            enableDashboard: config.enableDashboard !== false;
            enableHistory: config.enableHistory !== false;
            enableAlerts: config.enableAlerts !== false;
            enableRealtimeStream: config.enableRealtimeStream !== false,
    metricsFilter: config.metricsFilter || [] // 空の場合は全メトリクス;
            retention: config.retention || 24 * 60 * 60 * 1000 // 24時間;
            ...config;

        this.monitoring = true;

        try { // Start real-time monitoring
            await this.realTimeMonitor.startMonitoring(this.monitoringConfig);

            // データ収集開始
            await this.dataGatherer.start(this.monitoringConfig);

            // ダッシュボード表示
            if(this.monitoringConfig.enableDashboard) {
                
            }
                await this.dashboard.show(); }
            }

            // 履歴追跡開始
            if (this.monitoringConfig.enableHistory) { await this.historyTracker.start(this.monitoringConfig); }

            // アラート管理開始
            if (this.monitoringConfig.enableAlerts) { await this.alertManager.start(this.monitoringConfig); }

            // リアルタイムストリーム開始
            if (this.monitoringConfig.enableRealtimeStream) { await this.realtimeStream.start(this.monitoringConfig'); }

            // 定期データ収集
            this.monitoringInterval = setInterval(() => { this.collectAndProcessMetrics();' }'

            }, this.monitoringConfig.interval';

            console.log('[PerformanceMonitoringSystem] Performance, monitoring started);

        } catch (error) { this.monitoring = false;

            this.errorHandler.handleError(error as Error, {')'
                context: 'PerformanceMonitoringSystem.startMonitoring' ,}';
            throw error;
        }
    }
';

    async stopMonitoring(): Promise<void> { ''
        if(!this.monitoring) {'

            console.warn('[PerformanceMonitoringSystem] Monitoring is not active);
        }
            return; }
        }

        this.monitoring = false;

        try { // 定期収集停止
            if(this.monitoringInterval) {
                
            }
                clearInterval(this.monitoringInterval); }
            }

            // Stop real-time monitoring
            await this.realTimeMonitor.stopMonitoring();

            // 各コンポーネント停止
            await this.dataGatherer.stop();
            await this.historyTracker.stop();
            await this.alertManager.stop();
            await this.realtimeStream.stop();

            // ダッシュボード非表示
            if(this.monitoringConfig?.enableDashboard) {

                await this.dashboard.hide();

            console.log('[PerformanceMonitoringSystem] Performance, monitoring stopped');
            }

' }'

        } catch (error) { this.errorHandler.handleError(error as Error, { : undefined)'
                context: 'PerformanceMonitoringSystem.stopMonitoring' ,});
        }
    }

    async collectAndProcessMetrics(): Promise<void> { try {
            // 全メトリクスを収集
            const metrics = await this.dataGatherer.collectAllMetrics();
            const timestamp = performance.now();

            // フィルタリング
            const filteredMetrics = this.filterMetrics(metrics);

            // 履歴に追加
            if(this.monitoringConfig?.enableHistory) {
                
            }
                this.historyTracker.addDataPoint(timestamp, filteredMetrics); }
            }

            // ダッシュボード更新
            if (this.monitoringConfig?.enableDashboard) { this.dashboard.updateMetrics(filteredMetrics); }

            // アラートチェック
            if (this.monitoringConfig?.enableAlerts) { this.alertManager.checkThresholds(filteredMetrics); }

            // リアルタイムストリーム送信
            if (this.monitoringConfig?.enableRealtimeStream) { this.realtimeStream.send(timestamp, filteredMetrics); }

            // データ分析
            await this.dataAnalyzer.analyzePerformanceData(timestamp, filteredMetrics);

        } catch (error) { this.errorHandler.handleError(error as Error, { : undefined)'
                context: 'PerformanceMonitoringSystem.collectAndProcessMetrics' ,});
        }
    }

    private filterMetrics(metrics: PerformanceMetrics): PerformanceMetrics { if (!this.monitoringConfig?.metricsFilter || this.monitoringConfig.metricsFilter.length === 0) {
            return metrics; }

        const filtered = new Map();
        for(const, metricId of, this.monitoringConfig.metricsFilter) {
            if(metrics.has(metricId) {
        }
                filtered.set(metricId, metrics.get(metricId); }
}
        return filtered;
    }

    /**
     * Handle real-time data from monitor
     */ : undefined
    onRealTimeData(timestamp: number, metrics: PerformanceMetrics): void { // Process real-time data if needed 
        console.log(`[PerformanceMonitoringSystem] Real-time, data received: ${metrics.size} metrics`});
    }

    /**
     * Handle performance events from monitor
     */
    onPerformanceEvent(eventType: string, event: PerformanceEvent): void {
        console.log(`[PerformanceMonitoringSystem] Performance, event ${eventType}: ${ event.type)`};
        
        // Forward to alert manager if needed
        if (this.alertManager} { }
            this.alertManager.handlePerformanceEvent(eventType, event});
        }
    }

    // 履歴データへのアクセス
    getMetricsHistory(metricId: string, timeRange: number = 3600000): DataPoint[] { // デフォルト1時間
        return this.historyTracker.getHistory(metricId, timeRange); }

    getAggregatedMetrics(metricId: string, timeRange: number = 3600000, aggregation: string = 'average): any { return this.historyTracker.getAggregated(metricId, timeRange, aggregation); }'

    // カスタムメトリクス追加
    addCustomMetric(metricConfig: MetricConfig): any { ''
        return this.metricsRegistry.register(metricConfig); }
';
    // アラート設定
    setAlert(metricId: string, threshold: number, condition: string = 'above', callback: Function | null = null): any { return this.alertManager.addAlert(metricId, threshold, condition, callback); }

    // ダッシュボード表示切り替え
    toggleDashboard(): Promise<void> { return this.dashboard.toggle(); }

    // 現在の監視状態
    getMonitoringStatus(): MonitoringStatus { return { active: this.monitoring,
            config: this.monitoringConfig;
            metricsCount: this.metricsRegistry.getCount();
            dataPoints: this.historyTracker.getDataPointCount();
            activeAlerts: this.alertManager.getActiveAlerts().length,
    realTimeStats: this.realTimeMonitor.getMonitoringStats(), };
            analysisResults: this.dataAnalyzer.getAnalysisResults(); 
    }

    // パフォーマンスレポート生成
    async generateReport(timeRange: number = 3600000): Promise<PerformanceReport> { const endTime = Date.now();
        const startTime = endTime - timeRange;

        const report: PerformanceReport = { }
            timeRange: { startTime, endTime, duration: timeRange ,},
            metrics: new Map(),
    summary: {} as ReportSummary;
            alerts: this.alertManager.getAlertsInRange(startTime, endTime),
            analysisResults: this.dataAnalyzer.getAnalysisResults();
            performanceEvents: this.realTimeMonitor.getEventsHistory(timeRange),
    timestamp: endTime;
        },

        // 各メトリクスの統計情報を計算
        for(const, metricId of, this.metricsRegistry.getAllIds() {
            const history = this.getMetricsHistory(metricId, timeRange);
            if (history.length > 0) {
                report.metrics.set(metricId, {)
                    current: history[history.length - 1].value);
                    average: this.calculateAverage(history);
                    min: Math.min(...history.map(h => h.value);
                    max: Math.max(...history.map(h => h.value);
                    trend: this.calculateTrend(history);
                    variance: this.calculateVariance(history.map(h = > h.value) ,}
                    samplesCount: history.length 
    });
            }
        }

        // サマリー生成
        report.summary = this.generateReportSummary(report.metrics);

        return report;
    }

    private calculateAverage(history: DataPoint[]): number { return history.reduce((sum, h) => sum + h.value, 0) / history.length;

    private calculateTrend(history: DataPoint[]): 'stable' | 'increasing' | 'decreasing' { ''
        if(history.length < 2) return 'stable';
        
        const first = history[0].value;
        const last = history[history.length - 1].value;
        const change = (last - first) / first;

        if (Math.abs(change) < 0.05) return 'stable';
        return change > 0 ? 'increasing' : 'decreasing'; ,}

    private calculateVariance(values: number[]): number { const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;

    private generateReportSummary(metrics: Map<string, MetricStats>): ReportSummary { let healthy = 0;
        let warning = 0;
        let critical = 0;

        for(const [metricId, stats] of metrics) {

            const config = this.metricsRegistry.get(metricId);

            if (config) {''
                const status = this.evaluateMetricHealth(stats.current, config);''
                if (status === 'healthy'') healthy++;''
                else if(status === 'warning) warning++;

        }
                else critical++; }
}

        return { totalMetrics: metrics.size,
            healthyMetrics: healthy;
            warningMetrics: warning,
    criticalMetrics: critical, };
            overallHealth: this.calculateOverallHealth(healthy, warning, critical); }
        }

    private evaluateMetricHealth(value: number, config: MetricConfig): 'healthy' | 'warning' | 'critical' { ''
        if(config.max && value > config.max) return 'critical';
        if(config.min && value < config.min) return 'critical';
        if(config.warning_max && value > config.warning_max) return 'warning';
        if(config.warning_min && value < config.warning_min) return 'warning';
        return 'healthy'; }

    private calculateOverallHealth(healthy: number, warning: number, critical: number): 'healthy' | 'warning' | 'critical' | 'unknown' { const total = healthy + warning + critical;''
        if(total === 0) return 'unknown';
        
        const healthyRatio = healthy / total;
        const criticalRatio = critical / total;

        if(criticalRatio > 0.2) return 'critical';
        if(criticalRatio > 0.1 || healthyRatio < 0.7) return 'warning';
        return 'healthy'; }

    /**
     * Get trend analysis data
     */
    getTrendData(metricId: string): TrendData { return this.dataAnalyzer.getTrendData(metricId); }

    /**
     * Get performance insights
     */
    getPerformanceInsights(category: string | null = null): PerformanceInsight[] { return this.dataAnalyzer.getRecentInsights(category); }

    /**
     * Subscribe to real-time data stream
     */
    subscribeToRealTimeData(callback: Function): Function { return this.realTimeMonitor.subscribeToStream(callback); }

    /**
     * Configure monitoring system
     */
    configure(config: any): void { // Update real-time monitor configuration
        if(config.realTimeMonitor) {
            
        }
            this.realTimeMonitor.configure(config.realTimeMonitor); }
        }

        // Update data analyzer configuration
        if(config.dataAnalyzer) {
            ';

        }

            this.dataAnalyzer.configure(config.dataAnalyzer); }
        }

        console.log('[PerformanceMonitoringSystem] Configuration, updated);
    }

    /**
     * Cleanup monitoring system
     */
    destroy(): void { this.stopMonitoring();
        
        // Destroy sub-components
        if(this.realTimeMonitor) {
            
        }
            this.realTimeMonitor.destroy(); }
        }
        
        if(this.dataAnalyzer') {
        ';

            this.dataAnalyzer.destroy();
        }

        console.log('[PerformanceMonitoringSystem] Monitoring, system destroyed''); }
}

export { PerformanceMonitoringSystem  };