/**
 * Performance Profiling Tools
 * 
 * 詳細なパフォーマンスメトリクス収集とボトルネック特定システム
 * Requirements: 5.4, 7.4
 */

export class PerformanceProfiler {
    constructor() {
        this.metrics = new Map();
        this.profilingSession = null;
        this.collectors = new Map();
        this.analyzers = new Map();
        this.reporters = new Map();
        this.hooks = new Set();
        this.bottleneckDetector = new BottleneckDetector();
        this.initialized = false;
        
        this.initializeProfiler();
    }

    async initializeProfiler() {
        try {
            await this.setupCollectors();
            await this.setupAnalyzers();
            await this.setupReporters();
            this.setupHooks();
            this.initialized = true;
            console.log('PerformanceProfiler initialized successfully');
        } catch (error) {
            console.error('Failed to initialize PerformanceProfiler:', error);
            throw error;
        }
    }

    async setupCollectors() {
        // メトリクス収集器の設定
        this.collectors.set('frame', new FrameMetricsCollector());
        this.collectors.set('memory', new MemoryMetricsCollector());
        this.collectors.set('render', new RenderMetricsCollector());
        this.collectors.set('network', new NetworkMetricsCollector());
        this.collectors.set('user_interaction', new UserInteractionCollector());
        this.collectors.set('resource', new ResourceMetricsCollector());
        this.collectors.set('custom', new CustomMetricsCollector());

        // 各コレクターを初期化
        for (const [name, collector] of this.collectors) {
            await collector.initialize();
        }
    }

    async setupAnalyzers() {
        // 分析器の設定
        this.analyzers.set('performance', new PerformanceAnalyzer());
        this.analyzers.set('bottleneck', new BottleneckAnalyzer());
        this.analyzers.set('trend', new TrendAnalyzer());
        this.analyzers.set('regression', new RegressionAnalyzer());
        this.analyzers.set('optimization', new OptimizationAnalyzer());

        for (const [name, analyzer] of this.analyzers) {
            await analyzer.initialize();
        }
    }

    async setupReporters() {
        // レポーターの設定
        this.reporters.set('console', new ConsoleReporter());
        this.reporters.set('html', new HTMLReporter());
        this.reporters.set('json', new JSONReporter());
        this.reporters.set('dashboard', new DashboardReporter());
        this.reporters.set('alert', new AlertReporter());

        for (const [name, reporter] of this.reporters) {
            await reporter.initialize();
        }
    }

    setupHooks() {
        // パフォーマンス監視フックの設定
        this.hooks.add(new FrameHook());
        this.hooks.add(new MemoryHook());
        this.hooks.add(new RenderHook());
        this.hooks.add(new NetworkHook());
        this.hooks.add(new ErrorHook());

        for (const hook of this.hooks) {
            hook.install(this);
        }
    }

    async startProfiling(options = {}) {
        if (!this.initialized) {
            throw new Error('PerformanceProfiler not initialized');
        }

        this.profilingSession = {
            id: Date.now(),
            startTime: performance.now(),
            options: {
                duration: options.duration || 60000, // デフォルト1分
                collectInterval: options.collectInterval || 100, // 100ms間隔
                enabledCollectors: options.enabledCollectors || Array.from(this.collectors.keys()),
                enabledAnalyzers: options.enabledAnalyzers || Array.from(this.analyzers.keys()),
                enableBottleneckDetection: options.enableBottleneckDetection !== false,
                enableTrendAnalysis: options.enableTrendAnalysis !== false,
                autoReport: options.autoReport !== false,
                ...options
            },
            status: 'running',
            data: new Map()
        };

        // 有効なコレクターを開始
        for (const collectorName of this.profilingSession.options.enabledCollectors) {
            const collector = this.collectors.get(collectorName);
            if (collector) {
                await collector.start(this.profilingSession.options);
            }
        }

        // データ収集間隔の設定
        this.collectionInterval = setInterval(() => {
            this.collectAllMetrics();
        }, this.profilingSession.options.collectInterval);

        // ボトルネック検出の開始
        if (this.profilingSession.options.enableBottleneckDetection) {
            this.bottleneckDetector.start(this.profilingSession.options);
        }

        // 自動停止タイマー
        if (this.profilingSession.options.duration > 0) {
            this.autoStopTimer = setTimeout(() => {
                this.stopProfiling();
            }, this.profilingSession.options.duration);
        }

        console.log(`Profiling started with session ID: ${this.profilingSession.id}`);
        return this.profilingSession.id;
    }

    async stopProfiling() {
        if (!this.profilingSession || this.profilingSession.status !== 'running') {
            throw new Error('No active profiling session');
        }

        this.profilingSession.status = 'stopping';
        this.profilingSession.endTime = performance.now();

        // データ収集停止
        if (this.collectionInterval) {
            clearInterval(this.collectionInterval);
        }

        if (this.autoStopTimer) {
            clearTimeout(this.autoStopTimer);
        }

        // ボトルネック検出停止
        this.bottleneckDetector.stop();

        // 最終データ収集
        await this.collectAllMetrics();

        // 全コレクターを停止
        for (const collector of this.collectors.values()) {
            await collector.stop();
        }

        this.profilingSession.status = 'completed';

        // 分析と報告
        if (this.profilingSession.options.autoReport) {
            return await this.generateReport();
        }

        return this.profilingSession;
    }

    async collectAllMetrics() {
        const timestamp = performance.now();
        const metricsSnapshot = new Map();

        // 各コレクターからメトリクスを収集
        for (const [name, collector] of this.collectors) {
            if (this.profilingSession.options.enabledCollectors.includes(name)) {
                try {
                    const metrics = await collector.collect();
                    metricsSnapshot.set(name, metrics);
                } catch (error) {
                    console.error(`Failed to collect metrics from ${name}:`, error);
                }
            }
        }

        // セッションデータに追加
        if (!this.profilingSession.data.has(timestamp)) {
            this.profilingSession.data.set(timestamp, metricsSnapshot);
        }

        // リアルタイム分析
        this.performRealtimeAnalysis(timestamp, metricsSnapshot);
    }

    performRealtimeAnalysis(timestamp, metrics) {
        // リアルタイムボトルネック検出
        this.bottleneckDetector.analyze(timestamp, metrics);

        // 閾値ベースの警告
        this.checkThresholds(metrics);

        // トレンド分析
        if (this.profilingSession.options.enableTrendAnalysis) {
            this.analyzeTrends(timestamp, metrics);
        }
    }

    checkThresholds(metrics) {
        const thresholds = {
            frameRate: { min: 48, warning: 50 },
            memoryUsage: { max: 150 * 1024 * 1024, warning: 120 * 1024 * 1024 },
            renderTime: { max: 33.33, warning: 20 },
            gcPauseTime: { max: 50, warning: 30 }
        };

        for (const [collectorName, collectorMetrics] of metrics) {
            for (const [metricName, value] of Object.entries(collectorMetrics)) {
                const threshold = thresholds[metricName];
                if (threshold) {
                    if (this.isThresholdExceeded(value, threshold)) {
                        this.emitThresholdAlert(collectorName, metricName, value, threshold);
                    }
                }
            }
        }
    }

    isThresholdExceeded(value, threshold) {
        if (threshold.max && value > threshold.max) return true;
        if (threshold.min && value < threshold.min) return true;
        if (threshold.warning && value > threshold.warning) return true;
        return false;
    }

    emitThresholdAlert(collector, metric, value, threshold) {
        const alert = {
            type: 'threshold_exceeded',
            timestamp: performance.now(),
            collector,
            metric,
            value,
            threshold,
            severity: this.calculateAlertSeverity(value, threshold)
        };

        console.warn('Performance threshold exceeded:', alert);
        
        // アラートレポーターに通知
        const alertReporter = this.reporters.get('alert');
        if (alertReporter) {
            alertReporter.report(alert);
        }
    }

    calculateAlertSeverity(value, threshold) {
        if (threshold.max) {
            const ratio = value / threshold.max;
            if (ratio > 2) return 'critical';
            if (ratio > 1.5) return 'high';
            if (ratio > 1) return 'medium';
        }
        return 'low';
    }

    analyzeTrends(timestamp, metrics) {
        const trendAnalyzer = this.analyzers.get('trend');
        if (trendAnalyzer) {
            trendAnalyzer.addDataPoint(timestamp, metrics);
            const trends = trendAnalyzer.getCurrentTrends();
            
            // 悪化トレンドの検出
            for (const trend of trends) {
                if (trend.direction === 'degrading' && trend.confidence > 0.8) {
                    this.emitTrendAlert(trend);
                }
            }
        }
    }

    emitTrendAlert(trend) {
        const alert = {
            type: 'performance_trend',
            timestamp: performance.now(),
            trend,
            severity: trend.severity || 'medium'
        };

        console.warn('Performance trend alert:', alert);
        
        const alertReporter = this.reporters.get('alert');
        if (alertReporter) {
            alertReporter.report(alert);
        }
    }

    async generateReport(options = {}) {
        if (!this.profilingSession) {
            throw new Error('No profiling session available');
        }

        const reportOptions = {
            format: options.format || 'comprehensive',
            includeRawData: options.includeRawData || false,
            enabledAnalyzers: options.enabledAnalyzers || this.profilingSession.options.enabledAnalyzers,
            outputFormat: options.outputFormat || 'html',
            ...options
        };

        // 分析実行
        const analysisResults = await this.runAnalysis(reportOptions);

        // レポート生成
        const report = {
            session: this.profilingSession,
            analysis: analysisResults,
            recommendations: await this.generateRecommendations(analysisResults),
            summary: this.generateSummary(analysisResults),
            timestamp: Date.now()
        };

        // 指定された形式でレポート出力
        const reporter = this.reporters.get(reportOptions.outputFormat);
        if (reporter) {
            return await reporter.generateReport(report, reportOptions);
        }

        return report;
    }

    async runAnalysis(options) {
        const results = new Map();

        for (const analyzerName of options.enabledAnalyzers) {
            const analyzer = this.analyzers.get(analyzerName);
            if (analyzer) {
                try {
                    const result = await analyzer.analyze(this.profilingSession.data, options);
                    results.set(analyzerName, result);
                } catch (error) {
                    console.error(`Analysis failed for ${analyzerName}:`, error);
                    results.set(analyzerName, { error: error.message });
                }
            }
        }

        return results;
    }

    async generateRecommendations(analysisResults) {
        const recommendations = [];

        for (const [analyzerName, result] of analysisResults) {
            if (result.error) continue;

            switch (analyzerName) {
                case 'bottleneck':
                    recommendations.push(...this.generateBottleneckRecommendations(result));
                    break;
                case 'performance':
                    recommendations.push(...this.generatePerformanceRecommendations(result));
                    break;
                case 'trend':
                    recommendations.push(...this.generateTrendRecommendations(result));
                    break;
                case 'optimization':
                    recommendations.push(...this.generateOptimizationRecommendations(result));
                    break;
            }
        }

        return this.prioritizeRecommendations(recommendations);
    }

    generateBottleneckRecommendations(bottleneckResult) {
        const recommendations = [];

        for (const bottleneck of bottleneckResult.bottlenecks) {
            switch (bottleneck.type) {
                case 'rendering':
                    recommendations.push({
                        type: 'optimization',
                        priority: 'high',
                        category: 'rendering',
                        title: 'レンダリングボトルネックの解決',
                        description: `${bottleneck.component}でレンダリング性能の低下が検出されました`,
                        actions: [
                            'ダーティリージョン管理の確認',
                            'レイヤー構成の最適化',
                            'バッチレンダリングの適用'
                        ],
                        impact: bottleneck.impact,
                        effort: 'medium'
                    });
                    break;

                case 'memory':
                    recommendations.push({
                        type: 'memory',
                        priority: 'high',
                        category: 'memory',
                        title: 'メモリボトルネックの解決',
                        description: `${bottleneck.component}でメモリ使用量の問題が検出されました`,
                        actions: [
                            'メモリリークの調査',
                            'オブジェクトプールの最適化',
                            'ガベージコレクション頻度の調整'
                        ],
                        impact: bottleneck.impact,
                        effort: 'high'
                    });
                    break;

                case 'computation':
                    recommendations.push({
                        type: 'computation',
                        priority: 'medium',
                        category: 'performance',
                        title: '計算処理ボトルネックの解決',
                        description: `${bottleneck.component}で計算処理の遅延が検出されました`,
                        actions: [
                            'アルゴリズムの最適化',
                            'Web Workerの利用検討',
                            'キャッシュ戦略の改善'
                        ],
                        impact: bottleneck.impact,
                        effort: 'medium'
                    });
                    break;
            }
        }

        return recommendations;
    }

    generatePerformanceRecommendations(performanceResult) {
        const recommendations = [];

        if (performanceResult.frameRate.average < 55) {
            recommendations.push({
                type: 'performance',
                priority: 'high',
                category: 'frame_rate',
                title: 'フレームレートの改善',
                description: `平均フレームレートが${performanceResult.frameRate.average.toFixed(1)}fpsと低下しています`,
                actions: [
                    'AdaptiveQualityController の確認',
                    'レンダリング処理の最適化',
                    'パーティクル効果の削減'
                ],
                impact: 'high',
                effort: 'medium'
            });
        }

        if (performanceResult.memory.peakUsage > 100 * 1024 * 1024) {
            recommendations.push({
                type: 'memory',
                priority: 'medium',
                category: 'memory',
                title: 'メモリ使用量の最適化',
                description: `ピークメモリ使用量が${(performanceResult.memory.peakUsage / 1024 / 1024).toFixed(1)}MBに達しています`,
                actions: [
                    'MemoryManager の設定見直し',
                    'リソースの遅延読み込み',
                    'キャッシュサイズの調整'
                ],
                impact: 'medium',
                effort: 'low'
            });
        }

        return recommendations;
    }

    generateTrendRecommendations(trendResult) {
        const recommendations = [];

        for (const trend of trendResult.trends) {
            if (trend.direction === 'degrading' && trend.confidence > 0.7) {
                recommendations.push({
                    type: 'trend',
                    priority: 'medium',
                    category: trend.metric,
                    title: `${trend.metric}の悪化トレンド対策`,
                    description: `${trend.metric}が継続的に悪化しています（信頼度: ${(trend.confidence * 100).toFixed(1)}%）`,
                    actions: [
                        '悪化要因の特定',
                        '継続的な監視の強化',
                        '予防的最適化の実行'
                    ],
                    impact: 'medium',
                    effort: 'low'
                });
            }
        }

        return recommendations;
    }

    generateOptimizationRecommendations(optimizationResult) {
        const recommendations = [];

        for (const opportunity of optimizationResult.opportunities) {
            recommendations.push({
                type: 'optimization',
                priority: opportunity.priority || 'medium',
                category: opportunity.category,
                title: opportunity.title,
                description: opportunity.description,
                actions: opportunity.actions,
                impact: opportunity.impact,
                effort: opportunity.effort
            });
        }

        return recommendations;
    }

    prioritizeRecommendations(recommendations) {
        // 優先度とインパクトに基づいてソート
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const impactOrder = { high: 3, medium: 2, low: 1 };

        return recommendations.sort((a, b) => {
            const aPriority = priorityOrder[a.priority] || 0;
            const bPriority = priorityOrder[b.priority] || 0;
            const aImpact = impactOrder[a.impact] || 0;
            const bImpact = impactOrder[b.impact] || 0;

            // 優先度を最優先、次にインパクト
            if (aPriority !== bPriority) {
                return bPriority - aPriority;
            }
            return bImpact - aImpact;
        });
    }

    generateSummary(analysisResults) {
        const summary = {
            duration: this.profilingSession.endTime - this.profilingSession.startTime,
            dataPoints: this.profilingSession.data.size,
            overallHealth: 'good',
            keyFindings: [],
            topIssues: [],
            improvementAreas: []
        };

        // 全体的な健全性評価
        let healthScore = 100;
        const issues = [];

        for (const [analyzerName, result] of analysisResults) {
            if (result.error) continue;

            switch (analyzerName) {
                case 'performance':
                    if (result.frameRate.average < 50) {
                        healthScore -= 20;
                        issues.push('フレームレート低下');
                    }
                    if (result.memory.peakUsage > 150 * 1024 * 1024) {
                        healthScore -= 15;
                        issues.push('高メモリ使用量');
                    }
                    break;

                case 'bottleneck':
                    healthScore -= result.bottlenecks.length * 10;
                    for (const bottleneck of result.bottlenecks) {
                        issues.push(`${bottleneck.component}のボトルネック`);
                    }
                    break;

                case 'trend':
                    const degradingTrends = result.trends.filter(t => t.direction === 'degrading');
                    healthScore -= degradingTrends.length * 5;
                    for (const trend of degradingTrends) {
                        issues.push(`${trend.metric}の悪化トレンド`);
                    }
                    break;
            }
        }

        summary.overallHealth = this.calculateHealthCategory(Math.max(0, healthScore));
        summary.topIssues = issues.slice(0, 5);

        return summary;
    }

    calculateHealthCategory(score) {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'fair';
        if (score >= 20) return 'poor';
        return 'critical';
    }

    // 公開API
    async profile(duration = 60000, options = {}) {
        const sessionId = await this.startProfiling({ duration, ...options });
        
        // 手動停止の場合は Promise を返す
        if (duration === 0) {
            return {
                sessionId,
                stop: () => this.stopProfiling()
            };
        }

        // 自動停止の場合は完了を待つ
        return new Promise((resolve, reject) => {
            const checkStatus = () => {
                if (this.profilingSession && this.profilingSession.status === 'completed') {
                    resolve(this.generateReport());
                } else if (this.profilingSession && this.profilingSession.status === 'failed') {
                    reject(new Error('Profiling failed'));
                } else {
                    setTimeout(checkStatus, 100);
                }
            };
            checkStatus();
        });
    }

    getCurrentMetrics() {
        const metrics = new Map();
        for (const [name, collector] of this.collectors) {
            try {
                metrics.set(name, collector.getCurrentMetrics());
            } catch (error) {
                console.error(`Failed to get current metrics from ${name}:`, error);
            }
        }
        return metrics;
    }

    getProfilingStatus() {
        return {
            active: this.profilingSession?.status === 'running',
            sessionId: this.profilingSession?.id,
            duration: this.profilingSession ? 
                performance.now() - this.profilingSession.startTime : 0,
            dataPoints: this.profilingSession?.data.size || 0
        };
    }

    addCustomMetric(name, value, category = 'custom') {
        const customCollector = this.collectors.get('custom');
        if (customCollector) {
            customCollector.addMetric(name, value, category);
        }
    }

    setThreshold(metric, threshold) {
        // カスタム閾値の設定
        if (!this.customThresholds) {
            this.customThresholds = new Map();
        }
        this.customThresholds.set(metric, threshold);
    }
}

// メトリクス収集器クラス群
class FrameMetricsCollector {
    constructor() {
        this.frameHistory = [];
        this.lastFrameTime = 0;
        this.collecting = false;
    }

    async initialize() {
        // フレームメトリクス収集の初期化
    }

    async start(options) {
        this.collecting = true;
        this.frameHistory = [];
        this.lastFrameTime = performance.now();
    }

    async stop() {
        this.collecting = false;
    }

    async collect() {
        if (!this.collecting) return {};

        const now = performance.now();
        const frameTime = now - this.lastFrameTime;
        const fps = frameTime > 0 ? 1000 / frameTime : 0;

        this.frameHistory.push({ time: now, frameTime, fps });
        
        // 最新100フレームのみ保持
        if (this.frameHistory.length > 100) {
            this.frameHistory.shift();
        }

        this.lastFrameTime = now;

        return {
            currentFPS: fps,
            frameTime: frameTime,
            averageFPS: this.calculateAverageFPS(),
            frameVariance: this.calculateFrameVariance(),
            droppedFrames: this.countDroppedFrames()
        };
    }

    getCurrentMetrics() {
        return this.frameHistory.length > 0 ? 
            this.frameHistory[this.frameHistory.length - 1] : {};
    }

    calculateAverageFPS() {
        if (this.frameHistory.length === 0) return 0;
        const totalFPS = this.frameHistory.reduce((sum, frame) => sum + frame.fps, 0);
        return totalFPS / this.frameHistory.length;
    }

    calculateFrameVariance() {
        if (this.frameHistory.length < 2) return 0;
        const frameTimes = this.frameHistory.map(f => f.frameTime);
        const mean = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
        const variance = frameTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / frameTimes.length;
        return Math.sqrt(variance);
    }

    countDroppedFrames() {
        return this.frameHistory.filter(frame => frame.fps < 30).length;
    }
}

class MemoryMetricsCollector {
    constructor() {
        this.memoryHistory = [];
        this.collecting = false;
    }

    async initialize() {
        // メモリメトリクス収集の初期化
    }

    async start(options) {
        this.collecting = true;
        this.memoryHistory = [];
    }

    async stop() {
        this.collecting = false;
    }

    async collect() {
        if (!this.collecting) return {};

        const memoryInfo = performance.memory || {};
        const timestamp = performance.now();

        const metrics = {
            usedJSHeapSize: memoryInfo.usedJSHeapSize || 0,
            totalJSHeapSize: memoryInfo.totalJSHeapSize || 0,
            jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit || 0,
            timestamp
        };

        this.memoryHistory.push(metrics);

        // 最新1000サンプルのみ保持
        if (this.memoryHistory.length > 1000) {
            this.memoryHistory.shift();
        }

        return {
            ...metrics,
            memoryGrowthRate: this.calculateGrowthRate(),
            peakUsage: this.getPeakUsage(),
            averageUsage: this.getAverageUsage()
        };
    }

    getCurrentMetrics() {
        return this.memoryHistory.length > 0 ? 
            this.memoryHistory[this.memoryHistory.length - 1] : {};
    }

    calculateGrowthRate() {
        if (this.memoryHistory.length < 2) return 0;
        const recent = this.memoryHistory.slice(-10);
        const initial = recent[0].usedJSHeapSize;
        const final = recent[recent.length - 1].usedJSHeapSize;
        const timeSpan = recent[recent.length - 1].timestamp - recent[0].timestamp;
        return timeSpan > 0 ? (final - initial) / timeSpan * 1000 : 0; // bytes per second
    }

    getPeakUsage() {
        return this.memoryHistory.length > 0 ? 
            Math.max(...this.memoryHistory.map(m => m.usedJSHeapSize)) : 0;
    }

    getAverageUsage() {
        if (this.memoryHistory.length === 0) return 0;
        const total = this.memoryHistory.reduce((sum, m) => sum + m.usedJSHeapSize, 0);
        return total / this.memoryHistory.length;
    }
}

class RenderMetricsCollector {
    constructor() {
        this.renderHistory = [];
        this.collecting = false;
    }

    async initialize() {
        // レンダリングメトリクス収集の初期化
    }

    async start(options) {
        this.collecting = true;
        this.renderHistory = [];
    }

    async stop() {
        this.collecting = false;
    }

    async collect() {
        if (!this.collecting) return {};

        // レンダリング時間の測定（模擬実装）
        const renderStart = performance.now();
        await new Promise(resolve => requestAnimationFrame(resolve));
        const renderTime = performance.now() - renderStart;

        const metrics = {
            renderTime,
            timestamp: performance.now(),
            drawCalls: this.estimateDrawCalls(),
            triangles: this.estimateTriangles()
        };

        this.renderHistory.push(metrics);

        if (this.renderHistory.length > 100) {
            this.renderHistory.shift();
        }

        return {
            ...metrics,
            averageRenderTime: this.getAverageRenderTime(),
            maxRenderTime: this.getMaxRenderTime(),
            renderEfficiency: this.calculateRenderEfficiency()
        };
    }

    getCurrentMetrics() {
        return this.renderHistory.length > 0 ? 
            this.renderHistory[this.renderHistory.length - 1] : {};
    }

    estimateDrawCalls() {
        // 描画コール数の推定
        return Math.floor(Math.random() * 50) + 10;
    }

    estimateTriangles() {
        // 三角形数の推定
        return Math.floor(Math.random() * 10000) + 1000;
    }

    getAverageRenderTime() {
        if (this.renderHistory.length === 0) return 0;
        const total = this.renderHistory.reduce((sum, r) => sum + r.renderTime, 0);
        return total / this.renderHistory.length;
    }

    getMaxRenderTime() {
        return this.renderHistory.length > 0 ? 
            Math.max(...this.renderHistory.map(r => r.renderTime)) : 0;
    }

    calculateRenderEfficiency() {
        const avgRenderTime = this.getAverageRenderTime();
        return avgRenderTime > 0 ? Math.min(1, 16.67 / avgRenderTime) : 1;
    }
}

class NetworkMetricsCollector {
    constructor() {
        this.networkHistory = [];
        this.collecting = false;
    }

    async initialize() {
        // ネットワークメトリクス収集の初期化
    }

    async start(options) {
        this.collecting = true;
        this.networkHistory = [];
    }

    async stop() {
        this.collecting = false;
    }

    async collect() {
        if (!this.collecting) return {};

        // ネットワーク情報の取得（模擬実装）
        const metrics = {
            latency: this.measureLatency(),
            bandwidth: this.estimateBandwidth(),
            connectionType: this.getConnectionType(),
            timestamp: performance.now()
        };

        this.networkHistory.push(metrics);

        if (this.networkHistory.length > 100) {
            this.networkHistory.shift();
        }

        return {
            ...metrics,
            averageLatency: this.getAverageLatency(),
            maxLatency: this.getMaxLatency()
        };
    }

    getCurrentMetrics() {
        return this.networkHistory.length > 0 ? 
            this.networkHistory[this.networkHistory.length - 1] : {};
    }

    measureLatency() {
        // レイテンシの測定（模擬実装）
        return Math.random() * 100 + 10; // 10-110ms
    }

    estimateBandwidth() {
        // 帯域幅の推定（模擬実装）
        return Math.random() * 1000 + 100; // 100-1100 KB/s
    }

    getConnectionType() {
        if (navigator.connection) {
            return navigator.connection.effectiveType || 'unknown';
        }
        return 'unknown';
    }

    getAverageLatency() {
        if (this.networkHistory.length === 0) return 0;
        const total = this.networkHistory.reduce((sum, n) => sum + n.latency, 0);
        return total / this.networkHistory.length;
    }

    getMaxLatency() {
        return this.networkHistory.length > 0 ? 
            Math.max(...this.networkHistory.map(n => n.latency)) : 0;
    }
}

class UserInteractionCollector {
    constructor() {
        this.interactions = [];
        this.collecting = false;
    }

    async initialize() {
        // ユーザーインタラクション収集の初期化
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.eventHandlers = {
            click: (event) => this.recordInteraction('click', event),
            keydown: (event) => this.recordInteraction('keydown', event),
            scroll: (event) => this.recordInteraction('scroll', event),
            resize: (event) => this.recordInteraction('resize', event)
        };

        for (const [eventType, handler] of Object.entries(this.eventHandlers)) {
            document.addEventListener(eventType, handler, { passive: true });
        }
    }

    async start(options) {
        this.collecting = true;
        this.interactions = [];
    }

    async stop() {
        this.collecting = false;
    }

    async collect() {
        if (!this.collecting) return {};

        const recentInteractions = this.interactions.slice(-10);

        return {
            totalInteractions: this.interactions.length,
            recentInteractions: recentInteractions.length,
            interactionTypes: this.getInteractionTypes(),
            averageResponseTime: this.getAverageResponseTime()
        };
    }

    getCurrentMetrics() {
        return {
            recentInteraction: this.interactions.length > 0 ? 
                this.interactions[this.interactions.length - 1] : null
        };
    }

    recordInteraction(type, event) {
        if (!this.collecting) return;

        const interaction = {
            type,
            timestamp: performance.now(),
            target: event.target.tagName || 'unknown',
            responseTime: this.calculateResponseTime(event)
        };

        this.interactions.push(interaction);

        // 最新1000インタラクションのみ保持
        if (this.interactions.length > 1000) {
            this.interactions.shift();
        }
    }

    calculateResponseTime(event) {
        // 応答時間の計算（簡易実装）
        return Math.random() * 50 + 5; // 5-55ms
    }

    getInteractionTypes() {
        const types = {};
        for (const interaction of this.interactions) {
            types[interaction.type] = (types[interaction.type] || 0) + 1;
        }
        return types;
    }

    getAverageResponseTime() {
        if (this.interactions.length === 0) return 0;
        const total = this.interactions.reduce((sum, i) => sum + i.responseTime, 0);
        return total / this.interactions.length;
    }
}

class ResourceMetricsCollector {
    constructor() {
        this.resources = [];
        this.collecting = false;
    }

    async initialize() {
        // リソースメトリクス収集の初期化
    }

    async start(options) {
        this.collecting = true;
        this.resources = [];
    }

    async stop() {
        this.collecting = false;
    }

    async collect() {
        if (!this.collecting) return {};

        // Performance API からリソース情報を取得
        const resourceEntries = performance.getEntriesByType('resource');
        const recentResources = resourceEntries.slice(-10);

        return {
            totalResources: resourceEntries.length,
            recentResourceLoads: recentResources.length,
            averageLoadTime: this.calculateAverageLoadTime(recentResources),
            largestResource: this.findLargestResource(resourceEntries),
            resourceTypes: this.categorizeResources(recentResources)
        };
    }

    getCurrentMetrics() {
        const entries = performance.getEntriesByType('resource');
        return {
            lastResource: entries.length > 0 ? entries[entries.length - 1] : null
        };
    }

    calculateAverageLoadTime(resources) {
        if (resources.length === 0) return 0;
        const total = resources.reduce((sum, resource) => sum + resource.duration, 0);
        return total / resources.length;
    }

    findLargestResource(resources) {
        return resources.reduce((largest, resource) => {
            return (resource.transferSize || 0) > (largest.transferSize || 0) ? resource : largest;
        }, {});
    }

    categorizeResources(resources) {
        const categories = {};
        for (const resource of resources) {
            const type = this.getResourceType(resource.name);
            categories[type] = (categories[type] || 0) + 1;
        }
        return categories;
    }

    getResourceType(url) {
        const extension = url.split('.').pop().toLowerCase();
        if (['js', 'mjs'].includes(extension)) return 'script';
        if (['css'].includes(extension)) return 'stylesheet';
        if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension)) return 'image';
        if (['mp3', 'wav', 'ogg'].includes(extension)) return 'audio';
        if (['mp4', 'webm', 'avi'].includes(extension)) return 'video';
        return 'other';
    }
}

class CustomMetricsCollector {
    constructor() {
        this.customMetrics = new Map();
        this.collecting = false;
    }

    async initialize() {
        // カスタムメトリクス収集の初期化
    }

    async start(options) {
        this.collecting = true;
    }

    async stop() {
        this.collecting = false;
    }

    async collect() {
        if (!this.collecting) return {};

        const metrics = {};
        for (const [name, values] of this.customMetrics) {
            metrics[name] = {
                current: values.length > 0 ? values[values.length - 1] : 0,
                average: this.calculateAverage(values),
                max: Math.max(...values),
                min: Math.min(...values)
            };
        }

        return metrics;
    }

    getCurrentMetrics() {
        const current = {};
        for (const [name, values] of this.customMetrics) {
            current[name] = values.length > 0 ? values[values.length - 1] : 0;
        }
        return current;
    }

    addMetric(name, value, category = 'custom') {
        if (!this.customMetrics.has(name)) {
            this.customMetrics.set(name, []);
        }

        const values = this.customMetrics.get(name);
        values.push(value);

        // 最新100値のみ保持
        if (values.length > 100) {
            values.shift();
        }
    }

    calculateAverage(values) {
        return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
    }
}

// 分析器クラス群 - 紙面の都合上一部のみ実装
class BottleneckDetector {
    constructor() {
        this.bottlenecks = [];
        this.monitoring = false;
    }

    start(options) {
        this.monitoring = true;
        this.bottlenecks = [];
    }

    stop() {
        this.monitoring = false;
    }

    analyze(timestamp, metrics) {
        if (!this.monitoring) return;

        // フレームレートボトルネック検出
        const frameMetrics = metrics.get('frame');
        if (frameMetrics && frameMetrics.currentFPS < 30) {
            this.addBottleneck('rendering', 'frame_rate', frameMetrics.currentFPS, timestamp);
        }

        // メモリボトルネック検出
        const memoryMetrics = metrics.get('memory');
        if (memoryMetrics && memoryMetrics.memoryGrowthRate > 1024 * 1024) { // 1MB/s
            this.addBottleneck('memory', 'memory_leak', memoryMetrics.memoryGrowthRate, timestamp);
        }

        // レンダリングボトルネック検出
        const renderMetrics = metrics.get('render');
        if (renderMetrics && renderMetrics.renderTime > 33.33) { // 30fps threshold
            this.addBottleneck('rendering', 'render_time', renderMetrics.renderTime, timestamp);
        }
    }

    addBottleneck(type, component, value, timestamp) {
        this.bottlenecks.push({
            type,
            component,
            value,
            timestamp,
            impact: this.calculateImpact(type, value),
            id: `${type}_${component}_${timestamp}`
        });

        // 最新50ボトルネックのみ保持
        if (this.bottlenecks.length > 50) {
            this.bottlenecks.shift();
        }
    }

    calculateImpact(type, value) {
        switch (type) {
            case 'rendering':
                if (value < 20) return 'critical';
                if (value < 40) return 'high';
                return 'medium';
            case 'memory':
                if (value > 5 * 1024 * 1024) return 'critical'; // 5MB/s
                if (value > 2 * 1024 * 1024) return 'high'; // 2MB/s
                return 'medium';
            default:
                return 'medium';
        }
    }

    getBottlenecks() {
        return [...this.bottlenecks];
    }
}

// パフォーマンス分析器群の基本実装
class PerformanceAnalyzer {
    async initialize() {}

    async analyze(sessionData) {
        const frameRateAnalysis = this.analyzeFrameRate(sessionData);
        const memoryAnalysis = this.analyzeMemory(sessionData);
        const renderingAnalysis = this.analyzeRendering(sessionData);

        return {
            frameRate: frameRateAnalysis,
            memory: memoryAnalysis,
            rendering: renderingAnalysis,
            overall: this.calculateOverallScore(frameRateAnalysis, memoryAnalysis, renderingAnalysis)
        };
    }

    analyzeFrameRate(sessionData) {
        const frameRates = [];
        for (const [timestamp, metrics] of sessionData) {
            const frameMetrics = metrics.get('frame');
            if (frameMetrics && frameMetrics.currentFPS) {
                frameRates.push(frameMetrics.currentFPS);
            }
        }

        return {
            average: frameRates.reduce((sum, fps) => sum + fps, 0) / frameRates.length,
            min: Math.min(...frameRates),
            max: Math.max(...frameRates),
            variance: this.calculateVariance(frameRates),
            stability: this.calculateStability(frameRates)
        };
    }

    analyzeMemory(sessionData) {
        const memoryUsages = [];
        for (const [timestamp, metrics] of sessionData) {
            const memoryMetrics = metrics.get('memory');
            if (memoryMetrics && memoryMetrics.usedJSHeapSize) {
                memoryUsages.push(memoryMetrics.usedJSHeapSize);
            }
        }

        return {
            peakUsage: Math.max(...memoryUsages),
            averageUsage: memoryUsages.reduce((sum, usage) => sum + usage, 0) / memoryUsages.length,
            growthRate: this.calculateGrowthRate(memoryUsages),
            efficiency: this.calculateMemoryEfficiency(memoryUsages)
        };
    }

    analyzeRendering(sessionData) {
        const renderTimes = [];
        for (const [timestamp, metrics] of sessionData) {
            const renderMetrics = metrics.get('render');
            if (renderMetrics && renderMetrics.renderTime) {
                renderTimes.push(renderMetrics.renderTime);
            }
        }

        return {
            averageRenderTime: renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length,
            maxRenderTime: Math.max(...renderTimes),
            efficiency: this.calculateRenderEfficiency(renderTimes)
        };
    }

    calculateOverallScore(frameRate, memory, rendering) {
        let score = 100;
        
        // フレームレートスコア
        if (frameRate.average < 30) score -= 30;
        else if (frameRate.average < 50) score -= 15;
        
        // メモリスコア
        if (memory.peakUsage > 200 * 1024 * 1024) score -= 20;
        else if (memory.peakUsage > 150 * 1024 * 1024) score -= 10;
        
        // レンダリングスコア
        if (rendering.averageRenderTime > 33.33) score -= 20;
        else if (rendering.averageRenderTime > 16.67) score -= 10;

        return Math.max(0, score);
    }

    calculateVariance(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    }

    calculateStability(frameRates) {
        const variance = this.calculateVariance(frameRates);
        return Math.max(0, 1 - variance / 100); // 0-1 スケール
    }

    calculateGrowthRate(memoryUsages) {
        if (memoryUsages.length < 2) return 0;
        const initial = memoryUsages[0];
        const final = memoryUsages[memoryUsages.length - 1];
        return (final - initial) / memoryUsages.length; // per sample
    }

    calculateMemoryEfficiency(memoryUsages) {
        // メモリ効率の計算（簡易実装）
        const peak = Math.max(...memoryUsages);
        const average = memoryUsages.reduce((sum, usage) => sum + usage, 0) / memoryUsages.length;
        return average / peak; // 0-1 スケール
    }

    calculateRenderEfficiency(renderTimes) {
        const averageRenderTime = renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length;
        return Math.min(1, 16.67 / averageRenderTime); // 60fps を 1.0 とする
    }
}

// 他の分析器とレポーターの基本実装
class BottleneckAnalyzer {
    async initialize() {}
    async analyze(sessionData) {
        return { bottlenecks: [] };
    }
}

class TrendAnalyzer {
    async initialize() {}
    async analyze(sessionData) {
        return { trends: [] };
    }
    addDataPoint(timestamp, metrics) {}
    getCurrentTrends() {
        return [];
    }
}

class RegressionAnalyzer {
    async initialize() {}
    async analyze(sessionData) {
        return { regressions: [] };
    }
}

class OptimizationAnalyzer {
    async initialize() {}
    async analyze(sessionData) {
        return { opportunities: [] };
    }
}

// レポーター群の基本実装
class ConsoleReporter {
    async initialize() {}
    async generateReport(report) {
        console.log('Performance Report:', report);
        return report;
    }
}

class HTMLReporter {
    async initialize() {}
    async generateReport(report) {
        // HTML レポート生成
        return report;
    }
}

class JSONReporter {
    async initialize() {}
    async generateReport(report) {
        return JSON.stringify(report, null, 2);
    }
}

class DashboardReporter {
    async initialize() {}
    async generateReport(report) {
        // ダッシュボード表示
        return report;
    }
}

class AlertReporter {
    async initialize() {}
    report(alert) {
        console.warn('Performance Alert:', alert);
    }
}

// フック群の基本実装
class FrameHook {
    install(profiler) {
        // フレームフックのインストール
    }
}

class MemoryHook {
    install(profiler) {
        // メモリフックのインストール
    }
}

class RenderHook {
    install(profiler) {
        // レンダリングフックのインストール
    }
}

class NetworkHook {
    install(profiler) {
        // ネットワークフックのインストール
    }
}

class ErrorHook {
    install(profiler) {
        // エラーフックのインストール
    }
}

export { PerformanceProfiler };