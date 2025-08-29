/**
 * Advanced Performance Monitor
 * 既存のPerformanceOptimizerを拡張した高度なパフォーマンス監視システム
 */

export class AdvancedPerformanceMonitor {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.performanceOptimizer = gameEngine.performanceOptimizer;
        
        // メトリクス収集
        this.metrics = new MetricsCollector(this);
        this.analyzer = new PerformanceAnalyzer(this);
        this.profiler = new DetailedProfiler(this);
        
        // 閾値管理
        this.thresholds = {
            fps: { warning: 30, critical: 20 },
            frameTime: { warning: 33, critical: 50 }, // ms
            memory: { warning: 80, critical: 90 }, // %
            gcFrequency: { warning: 10, critical: 20 }, // per minute
            drawCalls: { warning: 100, critical: 200 },
            updateTime: { warning: 10, critical: 16 } // ms
        };
        
        // アラート管理
        this.alerts = new Map();
        this.alertCallbacks = new Set();
        
        // 履歴管理
        this.historySize = 1000;
        this.metricsHistory = [];
        
        // ビジュアライゼーション
        this.charts = new Map();
        this.chartUpdateInterval = 100; // ms
        
        // 状態
        this.isMonitoring = false;
        this.isProfiling = false;
        this.updateTimer = null;
        
        this.initialize();
    }

    initialize() {
        this.setupDefaultThresholds();
        this.startMonitoring();
    }

    /**
     * 監視の開始
     */
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.updateTimer = setInterval(() => {
            this.collectMetrics();
            this.analyzePerformance();
            this.checkThresholds();
        }, this.chartUpdateInterval);
    }

    /**
     * 監視の停止
     */
    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        this.isMonitoring = false;
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }

    /**
     * メトリクスの収集
     */
    collectMetrics() {
        const metrics = this.metrics.collect();
        
        // 履歴に追加
        this.metricsHistory.push(metrics);
        if (this.metricsHistory.length > this.historySize) {
            this.metricsHistory.shift();
        }
        
        // チャートの更新
        this.updateCharts(metrics);
        
        return metrics;
    }

    /**
     * パフォーマンス分析
     */
    analyzePerformance() {
        const analysis = this.analyzer.analyze(this.metricsHistory);
        
        // 問題のパターンを検出
        if (analysis.issues.length > 0) {
            this.handlePerformanceIssues(analysis.issues);
        }
        
        // 改善提案を生成
        if (analysis.suggestions.length > 0) {
            this.generateSuggestions(analysis.suggestions);
        }
        
        return analysis;
    }

    /**
     * プロファイリングの開始
     */
    startProfiling(component, options = {}) {
        return this.profiler.start(component, options);
    }

    /**
     * プロファイリングの停止
     */
    stopProfiling() {
        return this.profiler.stop();
    }

    /**
     * プロファイリング結果の取得
     */
    getProfilingResults() {
        return this.profiler.getResults();
    }

    /**
     * 閾値のチェック
     */
    checkThresholds() {
        const currentMetrics = this.getCurrentMetrics();
        
        for (const [metric, value] of Object.entries(currentMetrics)) {
            const threshold = this.thresholds[metric];
            if (!threshold) continue;
            
            if (value > threshold.critical) {
                this.triggerAlert(metric, 'critical', value);
            } else if (value > threshold.warning) {
                this.triggerAlert(metric, 'warning', value);
            } else {
                this.clearAlert(metric);
            }
        }
    }

    /**
     * アラートのトリガー
     */
    triggerAlert(metric, level, value) {
        const alertKey = `${metric}_${level}`;
        
        if (!this.alerts.has(alertKey)) {
            const alert = {
                metric,
                level,
                value,
                timestamp: Date.now(),
                message: this.generateAlertMessage(metric, level, value)
            };
            
            this.alerts.set(alertKey, alert);
            this.notifyAlertCallbacks(alert);
        }
    }

    /**
     * アラートのクリア
     */
    clearAlert(metric) {
        const warningKey = `${metric}_warning`;
        const criticalKey = `${metric}_critical`;
        
        this.alerts.delete(warningKey);
        this.alerts.delete(criticalKey);
    }

    /**
     * 現在のメトリクスを取得
     */
    getCurrentMetrics() {
        if (this.metricsHistory.length === 0) {
            return this.metrics.collect();
        }
        return this.metricsHistory[this.metricsHistory.length - 1];
    }

    /**
     * チャートの更新
     */
    updateCharts(metrics) {
        for (const [name, chart] of this.charts) {
            if (chart.update) {
                chart.update(metrics);
            }
        }
    }

    /**
     * パフォーマンス問題の処理
     */
    handlePerformanceIssues(issues) {
        for (const issue of issues) {
            console.warn(`Performance issue detected: ${issue.type} - ${issue.description}`);
            
            // 自動修正が可能な場合
            if (issue.autoFix && this.performanceOptimizer) {
                this.performanceOptimizer.applyOptimization(issue.autoFix);
            }
        }
    }

    /**
     * 改善提案の生成
     */
    generateSuggestions(suggestions) {
        for (const suggestion of suggestions) {
            console.log(`Performance suggestion: ${suggestion.description}`);
        }
    }

    /**
     * アラートメッセージの生成
     */
    generateAlertMessage(metric, level, value) {
        const messages = {
            fps: {
                warning: `FPS が低下しています: ${value.toFixed(1)} FPS`,
                critical: `FPS が危険な水準です: ${value.toFixed(1)} FPS`
            },
            frameTime: {
                warning: `フレーム時間が長くなっています: ${value.toFixed(1)}ms`,
                critical: `フレーム時間が危険な水準です: ${value.toFixed(1)}ms`
            },
            memory: {
                warning: `メモリ使用率が高くなっています: ${value.toFixed(1)}%`,
                critical: `メモリ使用率が危険な水準です: ${value.toFixed(1)}%`
            }
        };
        
        return messages[metric]?.[level] || `${metric} が ${level} レベルです: ${value}`;
    }

    /**
     * アラートコールバックの通知
     */
    notifyAlertCallbacks(alert) {
        for (const callback of this.alertCallbacks) {
            try {
                callback(alert);
            } catch (error) {
                console.error('Error in alert callback:', error);
            }
        }
    }

    /**
     * デフォルト閾値の設定
     */
    setupDefaultThresholds() {
        // デバイスによって動的に調整
        if (this.gameEngine.deviceDetector) {
            const deviceType = this.gameEngine.deviceDetector.getDeviceType();
            
            if (deviceType === 'mobile') {
                this.thresholds.fps.warning = 25;
                this.thresholds.fps.critical = 15;
            }
        }
    }

    // パブリックAPI

    /**
     * 閾値の設定
     */
    setThreshold(metric, warning, critical) {
        this.thresholds[metric] = { warning, critical };
    }

    /**
     * アラートコールバックの登録
     */
    addAlertCallback(callback) {
        this.alertCallbacks.add(callback);
    }

    /**
     * アラートコールバックの削除
     */
    removeAlertCallback(callback) {
        this.alertCallbacks.delete(callback);
    }

    /**
     * メトリクス履歴の取得
     */
    getMetricsHistory() {
        return [...this.metricsHistory];
    }

    /**
     * 現在のアラートの取得
     */
    getCurrentAlerts() {
        return Array.from(this.alerts.values());
    }

    /**
     * チャートの登録
     */
    registerChart(name, chart) {
        this.charts.set(name, chart);
    }

    /**
     * チャートの削除
     */
    unregisterChart(name) {
        this.charts.delete(name);
    }

    /**
     * 統計情報の取得
     */
    getStatistics() {
        return this.analyzer.getStatistics(this.metricsHistory);
    }

    /**
     * クリーンアップ
     */
    destroy() {
        this.stopMonitoring();
        this.stopProfiling();
        
        this.alerts.clear();
        this.alertCallbacks.clear();
        this.charts.clear();
        this.metricsHistory = [];
    }
}

/**
 * メトリクス収集クラス
 */
class MetricsCollector {
    constructor(monitor) {
        this.monitor = monitor;
        this.gameEngine = monitor.gameEngine;
        
        // パフォーマンス測定
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.gcCount = 0;
        this.lastGCCheck = Date.now();
    }

    /**
     * メトリクスの収集
     */
    collect() {
        const now = performance.now();
        const metrics = {
            timestamp: now,
            fps: this.calculateFPS(),
            frameTime: this.calculateFrameTime(),
            memory: this.getMemoryUsage(),
            gcFrequency: this.calculateGCFrequency(),
            drawCalls: this.getDrawCalls(),
            updateTime: this.getUpdateTime(),
            renderTime: this.getRenderTime(),
            particleCount: this.getParticleCount(),
            effectCount: this.getEffectCount(),
            entityCount: this.getEntityCount(),
            textureMemory: this.getTextureMemory(),
            audioNodes: this.getAudioNodeCount()
        };
        
        return metrics;
    }

    calculateFPS() {
        if (this.gameEngine.performanceOptimizer) {
            return this.gameEngine.performanceOptimizer.getCurrentFPS() || 0;
        }
        return 0;
    }

    calculateFrameTime() {
        const now = performance.now();
        const frameTime = now - this.lastFrameTime;
        this.lastFrameTime = now;
        return frameTime;
    }

    getMemoryUsage() {
        if (performance.memory) {
            const used = performance.memory.usedJSHeapSize;
            const total = performance.memory.jsHeapSizeLimit;
            return (used / total) * 100;
        }
        return 0;
    }

    calculateGCFrequency() {
        // GC頻度の推定（メモリの急激な減少を検出）
        const now = Date.now();
        const timeDiff = (now - this.lastGCCheck) / 1000 / 60; // 分単位
        
        if (timeDiff > 0) {
            const frequency = this.gcCount / timeDiff;
            this.lastGCCheck = now;
            this.gcCount = 0;
            return frequency;
        }
        
        return 0;
    }

    getDrawCalls() {
        // レンダラーから描画呼び出し数を取得
        let drawCalls = 0;
        
        if (this.gameEngine.renderOptimizer) {
            drawCalls = this.gameEngine.renderOptimizer.getDrawCallCount() || 0;
        }
        
        return drawCalls;
    }

    getUpdateTime() {
        if (this.gameEngine.performanceOptimizer) {
            return this.gameEngine.performanceOptimizer.getAverageUpdateTime() || 0;
        }
        return 0;
    }

    getRenderTime() {
        if (this.gameEngine.performanceOptimizer) {
            return this.gameEngine.performanceOptimizer.getAverageRenderTime() || 0;
        }
        return 0;
    }

    getParticleCount() {
        let count = 0;
        if (this.gameEngine.enhancedParticleManager) {
            count = this.gameEngine.enhancedParticleManager.getActiveParticleCount() || 0;
        }
        return count;
    }

    getEffectCount() {
        let count = 0;
        if (this.gameEngine.enhancedEffectManager) {
            count = this.gameEngine.enhancedEffectManager.getActiveEffectCount() || 0;
        }
        return count;
    }

    getEntityCount() {
        let count = 0;
        if (this.gameEngine.bubbleManager) {
            count = this.gameEngine.bubbleManager.getBubbleCount() || 0;
        }
        return count;
    }

    getTextureMemory() {
        // テクスチャメモリの推定
        return 0; // 実装は後で追加
    }

    getAudioNodeCount() {
        let count = 0;
        if (this.gameEngine.audioManager) {
            count = this.gameEngine.audioManager.getActiveNodeCount() || 0;
        }
        return count;
    }
}

/**
 * パフォーマンス分析クラス
 */
class PerformanceAnalyzer {
    constructor(monitor) {
        this.monitor = monitor;
        
        // 分析設定
        this.analysisWindow = 100; // 最新N個のメトリクスを分析
        this.trendThreshold = 0.1; // 10%の変化でトレンドとみなす
    }

    /**
     * パフォーマンスの分析
     */
    analyze(metricsHistory) {
        if (metricsHistory.length < 2) {
            return { issues: [], suggestions: [], trends: {} };
        }
        
        const recentMetrics = metricsHistory.slice(-this.analysisWindow);
        
        const analysis = {
            issues: this.detectIssues(recentMetrics),
            suggestions: this.generateSuggestions(recentMetrics),
            trends: this.analyzeTrends(recentMetrics),
            bottlenecks: this.identifyBottlenecks(recentMetrics),
            patterns: this.detectPatterns(recentMetrics)
        };
        
        return analysis;
    }

    /**
     * 問題の検出
     */
    detectIssues(metrics) {
        const issues = [];
        
        // FPS低下の検出
        const avgFPS = this.calculateAverage(metrics, 'fps');
        if (avgFPS < 30) {
            issues.push({
                type: 'low_fps',
                severity: avgFPS < 20 ? 'critical' : 'warning',
                description: `平均FPSが低下しています: ${avgFPS.toFixed(1)} FPS`,
                autoFix: 'reduce_quality'
            });
        }
        
        // メモリリークの可能性
        const memoryTrend = this.calculateTrend(metrics, 'memory');
        if (memoryTrend > 0.1) { // 10%以上の増加傾向
            issues.push({
                type: 'memory_leak',
                severity: 'warning',
                description: 'メモリ使用量が継続的に増加しています',
                autoFix: 'force_gc'
            });
        }
        
        // 高い描画負荷
        const avgDrawCalls = this.calculateAverage(metrics, 'drawCalls');
        if (avgDrawCalls > 100) {
            issues.push({
                type: 'high_draw_calls',
                severity: avgDrawCalls > 200 ? 'critical' : 'warning',
                description: `描画呼び出しが多すぎます: ${avgDrawCalls.toFixed(0)}`,
                autoFix: 'enable_batching'
            });
        }
        
        return issues;
    }

    /**
     * 改善提案の生成
     */
    generateSuggestions(metrics) {
        const suggestions = [];
        
        // パーティクル数に基づく提案
        const avgParticles = this.calculateAverage(metrics, 'particleCount');
        if (avgParticles > 1000) {
            suggestions.push({
                type: 'reduce_particles',
                description: 'パーティクル数を削減することでパフォーマンスが改善される可能性があります',
                impact: 'high'
            });
        }
        
        // レンダリング時間に基づく提案
        const avgRenderTime = this.calculateAverage(metrics, 'renderTime');
        if (avgRenderTime > 10) {
            suggestions.push({
                type: 'optimize_rendering',
                description: 'レンダリング最適化を有効にすることを推奨します',
                impact: 'medium'
            });
        }
        
        return suggestions;
    }

    /**
     * トレンドの分析
     */
    analyzeTrends(metrics) {
        const trends = {};
        const keys = ['fps', 'memory', 'frameTime', 'drawCalls'];
        
        for (const key of keys) {
            const trend = this.calculateTrend(metrics, key);
            const direction = trend > this.trendThreshold ? 'increasing' :
                           trend < -this.trendThreshold ? 'decreasing' : 'stable';
            
            trends[key] = {
                value: trend,
                direction,
                percentage: trend * 100
            };
        }
        
        return trends;
    }

    /**
     * ボトルネックの特定
     */
    identifyBottlenecks(metrics) {
        const latest = metrics[metrics.length - 1];
        const bottlenecks = [];
        
        // レンダリング vs アップデート
        if (latest.renderTime > latest.updateTime * 2) {
            bottlenecks.push({
                type: 'rendering',
                ratio: latest.renderTime / latest.updateTime,
                description: 'レンダリングがボトルネックになっています'
            });
        } else if (latest.updateTime > latest.renderTime * 2) {
            bottlenecks.push({
                type: 'game_logic',
                ratio: latest.updateTime / latest.renderTime,
                description: 'ゲームロジックがボトルネックになっています'
            });
        }
        
        return bottlenecks;
    }

    /**
     * パターンの検出
     */
    detectPatterns(metrics) {
        const patterns = [];
        
        // 周期的なパフォーマンス低下
        const fpsValues = metrics.map(m => m.fps);
        const periodicDrop = this.detectPeriodicPattern(fpsValues);
        
        if (periodicDrop) {
            patterns.push({
                type: 'periodic_performance_drop',
                period: periodicDrop.period,
                description: `約${periodicDrop.period}フレーム毎にパフォーマンスが低下しています`
            });
        }
        
        return patterns;
    }

    /**
     * 平均値の計算
     */
    calculateAverage(metrics, key) {
        const values = metrics.map(m => m[key]).filter(v => v !== undefined);
        if (values.length === 0) return 0;
        
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    /**
     * トレンドの計算（線形回帰）
     */
    calculateTrend(metrics, key) {
        const values = metrics.map((m, i) => ({ x: i, y: m[key] }))
                             .filter(v => v.y !== undefined);
        
        if (values.length < 2) return 0;
        
        // 簡単な線形回帰
        const n = values.length;
        const sumX = values.reduce((sum, v) => sum + v.x, 0);
        const sumY = values.reduce((sum, v) => sum + v.y, 0);
        const sumXY = values.reduce((sum, v) => sum + v.x * v.y, 0);
        const sumX2 = values.reduce((sum, v) => sum + v.x * v.x, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const avgY = sumY / n;
        
        // 正規化（平均値に対する割合）
        return avgY !== 0 ? slope / avgY : 0;
    }

    /**
     * 周期的パターンの検出
     */
    detectPeriodicPattern(values) {
        // 簡単な周期検出アルゴリズム
        // 実装は後で詳細化
        return null;
    }

    /**
     * 統計情報の取得
     */
    getStatistics(metricsHistory) {
        if (metricsHistory.length === 0) {
            return {};
        }
        
        const stats = {};
        const keys = ['fps', 'frameTime', 'memory', 'drawCalls'];
        
        for (const key of keys) {
            const values = metricsHistory.map(m => m[key]).filter(v => v !== undefined);
            
            if (values.length > 0) {
                stats[key] = {
                    min: Math.min(...values),
                    max: Math.max(...values),
                    avg: this.calculateAverage(metricsHistory, key),
                    current: values[values.length - 1]
                };
            }
        }
        
        return stats;
    }
}

/**
 * 詳細プロファイラークラス
 */
class DetailedProfiler {
    constructor(monitor) {
        this.monitor = monitor;
        this.gameEngine = monitor.gameEngine;
        
        // プロファイリング状態
        this.isRunning = false;
        this.currentProfile = null;
        this.profiles = new Map();
        
        // 測定設定
        this.sampleRate = 1; // 全フレーム測定
        this.maxSamples = 1000;
    }

    /**
     * プロファイリングの開始
     */
    start(component, options = {}) {
        if (this.isRunning) {
            console.warn('Profiling is already running');
            return false;
        }
        
        this.isRunning = true;
        this.currentProfile = {
            component,
            startTime: performance.now(),
            samples: [],
            options: {
                sampleRate: this.sampleRate,
                maxSamples: this.maxSamples,
                ...options
            }
        };
        
        // プロファイリングフックの設定
        this.setupProfilingHooks(component);
        
        console.log(`Profiling started for ${component}`);
        return true;
    }

    /**
     * プロファイリングの停止
     */
    stop() {
        if (!this.isRunning) {
            return null;
        }
        
        this.isRunning = false;
        
        if (this.currentProfile) {
            this.currentProfile.endTime = performance.now();
            this.currentProfile.duration = this.currentProfile.endTime - this.currentProfile.startTime;
            
            // プロファイリングフックの削除
            this.removeProfilingHooks(this.currentProfile.component);
            
            // 結果の保存
            this.profiles.set(this.currentProfile.component, this.currentProfile);
            
            console.log(`Profiling stopped for ${this.currentProfile.component}`);
            
            const results = this.analyzeProfile(this.currentProfile);
            this.currentProfile = null;
            
            return results;
        }
        
        return null;
    }

    /**
     * プロファイリングフックの設定
     */
    setupProfilingHooks(component) {
        // コンポーネントに応じたフックを設定
        switch (component) {
            case 'rendering':
                this.hookRenderingFunctions();
                break;
            case 'update':
                this.hookUpdateFunctions();
                break;
            case 'particles':
                this.hookParticleFunctions();
                break;
            case 'collision':
                this.hookCollisionFunctions();
                break;
            default:
                this.hookGenericFunctions(component);
        }
    }

    /**
     * プロファイリングフックの削除
     */
    removeProfilingHooks(component) {
        // フックの削除処理
        // 実装は各フック関数で行う
    }

    /**
     * レンダリング関数のフック
     */
    hookRenderingFunctions() {
        // GameEngineのrender関数をラップ
        const originalRender = this.gameEngine.render;
        this.gameEngine.render = (ctx) => {
            const start = performance.now();
            originalRender.call(this.gameEngine, ctx);
            const end = performance.now();
            
            this.recordSample('render', end - start);
        };
    }

    /**
     * サンプルの記録
     */
    recordSample(operation, duration) {
        if (!this.isRunning || !this.currentProfile) return;
        
        const sample = {
            operation,
            duration,
            timestamp: performance.now() - this.currentProfile.startTime,
            memory: performance.memory ? performance.memory.usedJSHeapSize : 0
        };
        
        this.currentProfile.samples.push(sample);
        
        // サンプル数の制限
        if (this.currentProfile.samples.length > this.currentProfile.options.maxSamples) {
            this.currentProfile.samples.shift();
        }
    }

    /**
     * プロファイルの分析
     */
    analyzeProfile(profile) {
        const operations = {};
        
        // 操作ごとに集計
        for (const sample of profile.samples) {
            if (!operations[sample.operation]) {
                operations[sample.operation] = {
                    count: 0,
                    totalTime: 0,
                    minTime: Infinity,
                    maxTime: 0,
                    avgTime: 0
                };
            }
            
            const op = operations[sample.operation];
            op.count++;
            op.totalTime += sample.duration;
            op.minTime = Math.min(op.minTime, sample.duration);
            op.maxTime = Math.max(op.maxTime, sample.duration);
        }
        
        // 平均時間の計算
        for (const op of Object.values(operations)) {
            op.avgTime = op.totalTime / op.count;
        }
        
        return {
            component: profile.component,
            duration: profile.duration,
            sampleCount: profile.samples.length,
            operations,
            timeline: this.generateTimeline(profile)
        };
    }

    /**
     * タイムラインの生成
     */
    generateTimeline(profile) {
        // タイムラインデータの生成
        const timeline = [];
        const bucketSize = 100; // 100ms毎のバケット
        
        for (let i = 0; i < profile.duration; i += bucketSize) {
            const bucket = {
                start: i,
                end: i + bucketSize,
                samples: profile.samples.filter(s => 
                    s.timestamp >= i && s.timestamp < i + bucketSize
                )
            };
            
            if (bucket.samples.length > 0) {
                bucket.avgDuration = bucket.samples.reduce((sum, s) => sum + s.duration, 0) / bucket.samples.length;
                timeline.push(bucket);
            }
        }
        
        return timeline;
    }

    /**
     * 結果の取得
     */
    getResults() {
        if (this.isRunning && this.currentProfile) {
            // 実行中の場合は中間結果を返す
            return this.analyzeProfile(this.currentProfile);
        }
        
        // 保存されたプロファイルを返す
        const results = {};
        for (const [component, profile] of this.profiles) {
            results[component] = this.analyzeProfile(profile);
        }
        
        return results;
    }

    /**
     * プロファイルのクリア
     */
    clearProfiles() {
        this.profiles.clear();
    }
}

// デフォルトエクスポート
export default AdvancedPerformanceMonitor;