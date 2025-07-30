/**
 * Advanced Performance Monitor
 * 既存のPerformanceOptimizerを拡張した高度なパフォーマンス監視システム
 */

import { getPerformanceConfig } from '../config/PerformanceConfig.js';
import { getErrorHandler } from '../utils/ErrorHandler.js';
import { DetailedMetricsCollector } from './DetailedMetricsCollector.js';

export class AdvancedPerformanceMonitor {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.performanceConfig = getPerformanceConfig();
        this.errorHandler = getErrorHandler();
        
        // 既存のPerformanceOptimizerとの統合
        this.performanceOptimizer = gameEngine?.performanceOptimizer;
        
        // メトリクス収集システム
        this.metricsCollector = new MetricsCollector(this);
        this.detailedMetricsCollector = new DetailedMetricsCollector(this);
        this.performanceAnalyzer = new PerformanceAnalyzer(this);
        this.detailedProfiler = new DetailedProfiler(this);
        
        // メトリクス管理
        this.metrics = {
            frame: new FrameMetrics(),
            memory: new MemoryMetrics(),
            render: new RenderMetrics(),
            game: new GameMetrics(),
            system: new SystemMetrics()
        };
        
        // 履歴データ管理
        this.historyManager = {
            maxSize: 1000,
            retentionTime: 5 * 60 * 1000, // 5分
            data: {
                fps: [],
                frameTime: [],
                memory: [],
                renderTime: [],
                updateTime: [],
                gameMetrics: []
            }
        };
        
        // 監視設定
        this.monitoring = {
            enabled: true,
            interval: 100, // 100ms間隔
            intervalId: null,
            profiling: false,
            profilingData: new Map()
        };
        
        // 分析結果
        this.analysis = {
            trends: new Map(),
            patterns: new Map(),
            anomalies: [],
            predictions: new Map(),
            recommendations: []
        };
        
        // 統計情報
        this.statistics = {
            totalSamples: 0,
            monitoringStartTime: Date.now(),
            lastUpdateTime: null,
            averageUpdateTime: 0,
            collectionOverhead: 0
        };
        
        this.initialize();
    }

    initialize() {
        this.startMonitoring();
        this.setupPerformanceObserver();
        this.setupIntegrationWithOptimizer();
        
        console.log('[AdvancedPerformanceMonitor] Initialized with enhanced monitoring capabilities');
    }

    /**
     * 監視開始
     */
    startMonitoring() {
        if (this.monitoring.intervalId) {
            clearInterval(this.monitoring.intervalId);
        }

        this.monitoring.intervalId = setInterval(() => {
            if (this.monitoring.enabled) {
                this.collectMetrics();
            }
        }, this.monitoring.interval);

        console.log(`[AdvancedPerformanceMonitor] Monitoring started (interval: ${this.monitoring.interval}ms)`);
    }

    /**
     * 監視停止
     */
    stopMonitoring() {
        if (this.monitoring.intervalId) {
            clearInterval(this.monitoring.intervalId);
            this.monitoring.intervalId = null;
        }

        console.log('[AdvancedPerformanceMonitor] Monitoring stopped');
    }

    /**
     * メトリクス収集
     */
    collectMetrics() {
        const startTime = performance.now();

        try {
            // 基本メトリクスの収集
            this.metricsCollector.collectAll();
            
            // 詳細メトリクスの収集
            this.detailedMetricsCollector.collectDetailedMetrics();
            
            // 履歴データの更新
            this.updateHistoryData();
            
            // 分析の実行
            this.performAnalysis();
            
            // 統計の更新
            this.updateStatistics(startTime);

        } catch (error) {
            this.errorHandler.handleError(error, 'AdvancedPerformanceMonitor.collectMetrics');
        }
    }

    /**
     * 履歴データの更新
     */
    updateHistoryData() {
        const timestamp = Date.now();
        const maxSize = this.historyManager.maxSize;

        // FPS履歴
        this.historyManager.data.fps.push({
            timestamp,
            value: this.metrics.frame.currentFPS,
            variance: this.metrics.frame.fpsVariance
        });

        // フレーム時間履歴
        this.historyManager.data.frameTime.push({
            timestamp,
            value: this.metrics.frame.frameTime,
            target: this.metrics.frame.targetFrameTime,
            deviation: this.metrics.frame.frameTimeDeviation
        });

        // メモリ履歴
        this.historyManager.data.memory.push({
            timestamp,
            used: this.metrics.memory.usedMemory,
            total: this.metrics.memory.totalMemory,
            pressure: this.metrics.memory.pressureLevel,
            gcEvents: this.metrics.memory.gcEventCount
        });

        // レンダリング時間履歴
        this.historyManager.data.renderTime.push({
            timestamp,
            value: this.metrics.render.renderTime,
            drawCalls: this.metrics.render.drawCalls,
            vertexCount: this.metrics.render.vertexCount
        });

        // アップデート時間履歴
        this.historyManager.data.updateTime.push({
            timestamp,
            value: this.metrics.game.updateTime,
            entityCount: this.metrics.game.entityCount,
            collisionChecks: this.metrics.game.collisionChecks
        });

        // ゲームメトリクス履歴
        this.historyManager.data.gameMetrics.push({
            timestamp,
            bubbleCount: this.metrics.game.bubbleCount,
            particleCount: this.metrics.game.particleCount,
            effectCount: this.metrics.game.effectCount,
            score: this.metrics.game.currentScore
        });

        // サイズ制限
        for (const [key, data] of Object.entries(this.historyManager.data)) {
            if (data.length > maxSize) {
                data.splice(0, data.length - maxSize);
            }
        }

        // 古いデータの削除
        this.cleanupOldData();
    }

    /**
     * 古いデータのクリーンアップ
     */
    cleanupOldData() {
        const cutoffTime = Date.now() - this.historyManager.retentionTime;

        for (const [key, data] of Object.entries(this.historyManager.data)) {
            const validData = data.filter(item => item.timestamp > cutoffTime);
            this.historyManager.data[key] = validData;
        }
    }

    /**
     * パフォーマンス分析の実行
     */
    performAnalysis() {
        this.performanceAnalyzer.analyzePerformance();
        this.detectAnomalies();
        this.generatePredictions();
        this.generateRecommendations();
    }

    /**
     * 異常検出
     */
    detectAnomalies() {
        const anomalies = [];
        const currentTime = Date.now();

        // FPS異常の検出
        if (this.metrics.frame.currentFPS < 30) {
            anomalies.push({
                type: 'fps_critical',
                severity: 'critical',
                message: `Critical FPS drop: ${this.metrics.frame.currentFPS.toFixed(1)}`,
                timestamp: currentTime,
                metrics: { fps: this.metrics.frame.currentFPS }
            });
        } else if (this.metrics.frame.currentFPS < 45) {
            anomalies.push({
                type: 'fps_warning',
                severity: 'warning',
                message: `FPS below target: ${this.metrics.frame.currentFPS.toFixed(1)}`,
                timestamp: currentTime,
                metrics: { fps: this.metrics.frame.currentFPS }
            });
        }

        // メモリ異常の検出
        if (this.metrics.memory.pressureLevel > 0.8) {
            anomalies.push({
                type: 'memory_pressure',
                severity: 'critical',
                message: `High memory pressure: ${(this.metrics.memory.pressureLevel * 100).toFixed(1)}%`,
                timestamp: currentTime,
                metrics: { pressure: this.metrics.memory.pressureLevel }
            });
        }

        // フレーム時間の分散異常
        if (this.metrics.frame.fpsVariance > 10) {
            anomalies.push({
                type: 'frame_variance',
                severity: 'warning',
                message: `High frame time variance: ${this.metrics.frame.fpsVariance.toFixed(2)}ms`,
                timestamp: currentTime,
                metrics: { variance: this.metrics.frame.fpsVariance }
            });
        }

        // 古い異常の削除（1分以上前）
        this.analysis.anomalies = this.analysis.anomalies.filter(
            anomaly => currentTime - anomaly.timestamp < 60000
        );

        // 新しい異常の追加
        this.analysis.anomalies.push(...anomalies);
    }

    /**
     * 予測生成
     */
    generatePredictions() {
        const fpsHistory = this.historyManager.data.fps.slice(-10);
        const memoryHistory = this.historyManager.data.memory.slice(-10);

        if (fpsHistory.length >= 3) {
            // FPS トレンド予測
            const fpsTrend = this.calculateTrend(fpsHistory.map(h => h.value));
            this.analysis.predictions.set('fps_trend', {
                direction: fpsTrend > 0.1 ? 'improving' : fpsTrend < -0.1 ? 'degrading' : 'stable',
                confidence: Math.min(0.9, Math.abs(fpsTrend) + 0.3),
                predictedValue: fpsHistory[fpsHistory.length - 1].value + fpsTrend,
                timeframe: '10s'
            });
        }

        if (memoryHistory.length >= 3) {
            // メモリ使用量トレンド予測
            const memoryTrend = this.calculateTrend(memoryHistory.map(h => h.used));
            this.analysis.predictions.set('memory_trend', {
                direction: memoryTrend > 1 ? 'increasing' : memoryTrend < -1 ? 'decreasing' : 'stable',
                confidence: Math.min(0.8, Math.abs(memoryTrend) / 10 + 0.2),
                predictedValue: memoryHistory[memoryHistory.length - 1].used + memoryTrend,
                timeframe: '10s'
            });
        }
    }

    /**
     * トレンド計算
     */
    calculateTrend(values) {
        if (values.length < 2) return 0;

        const n = values.length;
        const sumX = (n * (n + 1)) / 2;
        const sumY = values.reduce((a, b) => a + b, 0);
        const sumXY = values.reduce((sum, y, i) => sum + (i + 1) * y, 0);
        const sumXX = (n * (n + 1) * (2 * n + 1)) / 6;

        return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    }

    /**
     * 推奨事項生成
     */
    generateRecommendations() {
        this.analysis.recommendations = [];

        // FPS改善推奨
        if (this.metrics.frame.currentFPS < 45) {
            this.analysis.recommendations.push({
                type: 'performance',
                priority: 'high',
                title: 'FPS最適化',
                description: 'フレームレートが低下しています',
                actions: [
                    'パーティクル数を削減',
                    'エフェクト品質を下げる',
                    'レンダリング最適化を有効化'
                ]
            });
        }

        // メモリ最適化推奨
        if (this.metrics.memory.pressureLevel > 0.7) {
            this.analysis.recommendations.push({
                type: 'memory',
                priority: 'medium',
                title: 'メモリ最適化',
                description: 'メモリ使用量が高くなっています',
                actions: [
                    '不要なオブジェクトを解放',
                    'テクスチャキャッシュをクリア',
                    'ガベージコレクションを実行'
                ]
            });
        }

        // レンダリング最適化推奨
        if (this.metrics.render.drawCalls > 100) {
            this.analysis.recommendations.push({
                type: 'rendering',
                priority: 'low',
                title: 'レンダリング最適化',
                description: 'ドローコール数が多くなっています',
                actions: [
                    'バッチ処理を使用',
                    'テクスチャアトラスを活用',
                    'インスタンス化を検討'
                ]
            });
        }
    }

    /**
     * 統計の更新
     */
    updateStatistics(startTime) {
        const endTime = performance.now();
        const collectionTime = endTime - startTime;

        this.statistics.totalSamples++;
        this.statistics.lastUpdateTime = Date.now();
        this.statistics.collectionOverhead = 
            (this.statistics.collectionOverhead * (this.statistics.totalSamples - 1) + collectionTime) / 
            this.statistics.totalSamples;
        
        this.statistics.averageUpdateTime = 
            (this.statistics.averageUpdateTime * (this.statistics.totalSamples - 1) + collectionTime) / 
            this.statistics.totalSamples;
    }

    /**
     * Performance Observer の設定
     */
    setupPerformanceObserver() {
        if (typeof PerformanceObserver === 'undefined') return;

        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.entryType === 'measure') {
                        this.processPerfomanceMeasure(entry);
                    } else if (entry.entryType === 'navigation') {
                        this.processNavigationTiming(entry);
                    }
                });
            });

            observer.observe({ entryTypes: ['measure', 'navigation'] });
            console.log('[AdvancedPerformanceMonitor] PerformanceObserver setup complete');

        } catch (error) {
            console.warn('[AdvancedPerformanceMonitor] PerformanceObserver not supported:', error);
        }
    }

    /**
     * PerformanceOptimizerとの統合設定
     */
    setupIntegrationWithOptimizer() {
        if (!this.performanceOptimizer) return;

        // フレーム完了通知の受け取り
        if (typeof this.performanceOptimizer.onFrameComplete === 'function') {
            const originalOnFrameComplete = this.performanceOptimizer.onFrameComplete.bind(this.performanceOptimizer);
            this.performanceOptimizer.onFrameComplete = (frameData) => {
                originalOnFrameComplete(frameData);
                this.onOptimizerFrameComplete(frameData);
            };
        }
    }

    /**
     * PerformanceOptimizerからのフレーム完了通知処理
     */
    onOptimizerFrameComplete(frameData) {
        // フレームデータをメトリクスに反映
        if (frameData) {
            this.metrics.frame.updateFromOptimizer(frameData);
        }
    }

    // パブリック API

    /**
     * 現在のメトリクス取得
     */
    getCurrentMetrics() {
        return {
            frame: this.metrics.frame.toJSON(),
            memory: this.metrics.memory.toJSON(),
            render: this.metrics.render.toJSON(),
            game: this.metrics.game.toJSON(),
            system: this.metrics.system.toJSON()
        };
    }

    /**
     * 詳細メトリクス取得
     */
    getDetailedMetrics() {
        return this.detailedMetricsCollector.getExtendedMetrics();
    }

    /**
     * プロファイリングデータ取得
     */
    getProfilingData() {
        return this.detailedMetricsCollector.getProfilingData();
    }

    /**
     * 収集統計取得
     */
    getCollectionStatistics() {
        return {
            basic: this.getStatistics(),
            detailed: this.detailedMetricsCollector.getCollectionStatistics()
        };
    }

    /**
     * 履歴データ取得
     */
    getHistoryData(type = null, timeRange = null) {
        if (type && this.historyManager.data[type]) {
            let data = this.historyManager.data[type];
            
            if (timeRange) {
                const cutoffTime = Date.now() - timeRange;
                data = data.filter(item => item.timestamp > cutoffTime);
            }
            
            return data;
        }

        // 全データの取得
        const result = {};
        for (const [key, data] of Object.entries(this.historyManager.data)) {
            result[key] = timeRange 
                ? data.filter(item => item.timestamp > Date.now() - timeRange)
                : data;
        }
        
        return result;
    }

    /**
     * 分析結果取得
     */
    getAnalysisResults() {
        return {
            trends: Object.fromEntries(this.analysis.trends),
            patterns: Object.fromEntries(this.analysis.patterns),
            anomalies: this.analysis.anomalies,
            predictions: Object.fromEntries(this.analysis.predictions),
            recommendations: this.analysis.recommendations
        };
    }

    /**
     * 統計情報取得
     */
    getStatistics() {
        return {
            ...this.statistics,
            uptime: Date.now() - this.statistics.monitoringStartTime,
            samplesPerSecond: this.statistics.totalSamples / ((Date.now() - this.statistics.monitoringStartTime) / 1000),
            overheadPercentage: (this.statistics.collectionOverhead / this.monitoring.interval) * 100
        };
    }

    /**
     * プロファイリング開始
     */
    startProfiling(component) {
        this.detailedProfiler.startProfiling(component);
    }

    /**
     * プロファイリング停止
     */
    stopProfiling() {
        return this.detailedProfiler.stopProfiling();
    }

    /**
     * プロファイリング結果取得
     */
    getProfilingResults() {
        return this.detailedProfiler.getResults();
    }

    /**
     * レポート生成
     */
    generateReport() {
        return this.performanceAnalyzer.generateReport();
    }

    /**
     * 設定更新
     */
    updateSettings(settings) {
        if (settings.interval && settings.interval !== this.monitoring.interval) {
            this.monitoring.interval = settings.interval;
            if (this.monitoring.intervalId) {
                this.startMonitoring(); // 再起動
            }
        }

        if (settings.historySize) {
            this.historyManager.maxSize = settings.historySize;
        }

        if (settings.retentionTime) {
            this.historyManager.retentionTime = settings.retentionTime;
        }
    }

    /**
     * リセット
     */
    reset() {
        // 履歴データのクリア
        for (const key of Object.keys(this.historyManager.data)) {
            this.historyManager.data[key] = [];
        }

        // 分析結果のクリア
        this.analysis.trends.clear();
        this.analysis.patterns.clear();
        this.analysis.anomalies = [];
        this.analysis.predictions.clear();
        this.analysis.recommendations = [];

        // 統計のリセット
        this.statistics.totalSamples = 0;
        this.statistics.monitoringStartTime = Date.now();
        this.statistics.averageUpdateTime = 0;
        this.statistics.collectionOverhead = 0;

        console.log('[AdvancedPerformanceMonitor] Reset complete');
    }

    /**
     * クリーンアップ
     */
    destroy() {
        this.stopMonitoring();
        
        // メトリクス収集システムの破棄
        if (this.metricsCollector) {
            this.metricsCollector.destroy();
        }
        
        if (this.detailedMetricsCollector) {
            this.detailedMetricsCollector.destroy();
        }
        
        if (this.performanceAnalyzer) {
            this.performanceAnalyzer.destroy();
        }
        
        if (this.detailedProfiler) {
            this.detailedProfiler.destroy();
        }

        console.log('[AdvancedPerformanceMonitor] Destroyed');
    }
}

/**
 * メトリクス収集システム
 */
class MetricsCollector {
    constructor(monitor) {
        this.monitor = monitor;
        this.gameEngine = monitor.gameEngine;
        this.performanceOptimizer = monitor.performanceOptimizer;
    }

    collectAll() {
        this.collectFrameMetrics();
        this.collectMemoryMetrics();
        this.collectRenderMetrics();
        this.collectGameMetrics();
        this.collectSystemMetrics();
    }

    collectFrameMetrics() {
        const metrics = this.monitor.metrics.frame;
        
        if (this.performanceOptimizer) {
            metrics.currentFPS = this.performanceOptimizer.getCurrentFPS() || 0;
            metrics.averageFPS = this.performanceOptimizer.getAverageFPS() || 0;
            metrics.frameTime = this.performanceOptimizer.getAverageFrameTime() || 16.67;
            metrics.droppedFrames = this.performanceOptimizer.stats?.droppedFrames || 0;
            metrics.fpsVariance = this.performanceOptimizer.stats?.frameTimeVariance || 0;
        } else {
            // フォールバック実装
            metrics.currentFPS = this.estimateFPS();
            metrics.frameTime = 1000 / metrics.currentFPS;
        }

        metrics.targetFrameTime = 16.67; // 60 FPS target
        metrics.frameTimeDeviation = Math.abs(metrics.frameTime - metrics.targetFrameTime);
        metrics.timestamp = Date.now();
    }

    collectMemoryMetrics() {
        const metrics = this.monitor.metrics.memory;
        
        if (performance.memory) {
            metrics.usedMemory = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
            metrics.totalMemory = performance.memory.totalJSHeapSize / 1024 / 1024; // MB
            metrics.memoryLimit = performance.memory.jsHeapSizeLimit / 1024 / 1024; // MB
            metrics.pressureLevel = metrics.usedMemory / metrics.memoryLimit;
        }

        // GC イベント数の推定
        metrics.gcEventCount = this.estimateGCEvents();
        metrics.timestamp = Date.now();
    }

    collectRenderMetrics() {
        const metrics = this.monitor.metrics.render;
        
        // レンダリング時間の推定
        if (this.performanceOptimizer) {
            metrics.renderTime = this.performanceOptimizer.stats?.renderTime || 0;
        }

        // WebGL コンテキストからの情報取得
        const canvas = this.gameEngine?.canvas;
        if (canvas) {
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                // WebGL統計の収集
                metrics.drawCalls = this.estimateDrawCalls();
                metrics.vertexCount = this.estimateVertexCount();
                metrics.textureCount = this.estimateTextureCount();
            }
        }

        metrics.timestamp = Date.now();
    }

    collectGameMetrics() {
        const metrics = this.monitor.metrics.game;
        
        // ゲーム固有メトリクスの収集
        if (this.gameEngine) {
            metrics.updateTime = this.estimateUpdateTime();
            metrics.entityCount = this.getEntityCount();
            metrics.bubbleCount = this.getBubbleCount();
            metrics.particleCount = this.getParticleCount();
            metrics.effectCount = this.getEffectCount();
            metrics.collisionChecks = this.getCollisionChecks();
            metrics.currentScore = this.getCurrentScore();
        }

        metrics.timestamp = Date.now();
    }

    collectSystemMetrics() {
        const metrics = this.monitor.metrics.system;
        
        // システムレベルの情報
        metrics.userAgent = navigator.userAgent;
        metrics.platform = navigator.platform;
        metrics.hardwareConcurrency = navigator.hardwareConcurrency || 1;
        metrics.deviceMemory = navigator.deviceMemory || 'unknown';
        metrics.connection = this.getConnectionInfo();
        
        metrics.timestamp = Date.now();
    }

    // ヘルパーメソッド
    estimateFPS() {
        // 簡易FPS推定
        const now = performance.now();
        if (this.lastFrameTime) {
            const delta = now - this.lastFrameTime;
            this.lastFrameTime = now;
            return Math.min(60, 1000 / delta);
        }
        this.lastFrameTime = now;
        return 60;
    }

    estimateGCEvents() {
        // メモリ使用量の急激な減少をGCイベントとして推定
        const current = this.monitor.metrics.memory.usedMemory;
        const history = this.monitor.historyManager.data.memory.slice(-5);
        
        let gcEvents = 0;
        for (let i = 1; i < history.length; i++) {
            if (history[i].used < history[i - 1].used - 5) { // 5MB以上の減少
                gcEvents++;
            }
        }
        
        return gcEvents;
    }

    estimateDrawCalls() {
        // ドローコール数の推定（ゲームオブジェクト数から）
        const bubbleCount = this.getBubbleCount();
        const particleCount = this.getParticleCount();
        const effectCount = this.getEffectCount();
        
        return Math.ceil(bubbleCount / 10) + Math.ceil(particleCount / 50) + effectCount;
    }

    estimateVertexCount() {
        // 頂点数の推定
        const bubbleCount = this.getBubbleCount();
        const particleCount = this.getParticleCount();
        
        return bubbleCount * 4 + particleCount * 4; // 各オブジェクト4頂点と仮定
    }

    estimateTextureCount() {
        // 使用テクスチャ数の推定
        return 10; // 基本的なテクスチャ数
    }

    estimateUpdateTime() {
        // アップデート時間の推定
        return this.monitor.metrics.frame.frameTime * 0.3; // フレーム時間の30%と仮定
    }

    getEntityCount() {
        return this.getBubbleCount() + this.getParticleCount();
    }

    getBubbleCount() {
        if (this.gameEngine?.bubbleManager) {
            return this.gameEngine.bubbleManager.getActiveBubbleCount?.() || 0;
        }
        return 0;
    }

    getParticleCount() {
        if (this.gameEngine?.enhancedParticleManager) {
            return this.gameEngine.enhancedParticleManager.getActiveParticleCount?.() || 0;
        }
        return 0;
    }

    getEffectCount() {
        if (this.gameEngine?.enhancedEffectManager) {
            return this.gameEngine.enhancedEffectManager.getActiveEffectCount?.() || 0;
        }
        return 0;
    }

    getCollisionChecks() {
        // 衝突検出回数の推定
        const bubbleCount = this.getBubbleCount();
        return bubbleCount * (bubbleCount - 1) / 2; // 総当たりと仮定
    }

    getCurrentScore() {
        if (this.gameEngine?.scoreManager) {
            return this.gameEngine.scoreManager.getScore?.() || 0;
        }
        return 0;
    }

    getConnectionInfo() {
        if (navigator.connection) {
            return {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            };
        }
        return null;
    }

    destroy() {
        // クリーンアップ
    }
}

/**
 * フレームメトリクス
 */
class FrameMetrics {
    constructor() {
        this.currentFPS = 60;
        this.averageFPS = 60;
        this.frameTime = 16.67;
        this.targetFrameTime = 16.67;
        this.frameTimeDeviation = 0;
        this.droppedFrames = 0;
        this.fpsVariance = 0;
        this.timestamp = Date.now();
    }

    updateFromOptimizer(frameData) {
        if (frameData.fps !== undefined) this.currentFPS = frameData.fps;
        if (frameData.frameTime !== undefined) this.frameTime = frameData.frameTime;
        if (frameData.droppedFrames !== undefined) this.droppedFrames = frameData.droppedFrames;
    }

    toJSON() {
        return { ...this };
    }
}

/**
 * メモリメトリクス
 */
class MemoryMetrics {
    constructor() {
        this.usedMemory = 0;
        this.totalMemory = 0;
        this.memoryLimit = 0;
        this.pressureLevel = 0;
        this.gcEventCount = 0;
        this.timestamp = Date.now();
    }

    toJSON() {
        return { ...this };
    }
}

/**
 * レンダーメトリクス
 */
class RenderMetrics {
    constructor() {
        this.renderTime = 0;
        this.drawCalls = 0;
        this.vertexCount = 0;
        this.textureCount = 0;
        this.shaderSwitches = 0;
        this.timestamp = Date.now();
    }

    toJSON() {
        return { ...this };
    }
}

/**
 * ゲームメトリクス
 */
class GameMetrics {
    constructor() {
        this.updateTime = 0;
        this.entityCount = 0;
        this.bubbleCount = 0;
        this.particleCount = 0;
        this.effectCount = 0;
        this.collisionChecks = 0;
        this.currentScore = 0;
        this.timestamp = Date.now();
    }

    toJSON() {
        return { ...this };
    }
}

/**
 * システムメトリクス
 */
class SystemMetrics {
    constructor() {
        this.userAgent = '';
        this.platform = '';
        this.hardwareConcurrency = 1;
        this.deviceMemory = 'unknown';
        this.connection = null;
        this.timestamp = Date.now();
    }

    toJSON() {
        return { ...this };
    }
}

/**
 * パフォーマンス分析器
 */
class PerformanceAnalyzer {
    constructor(monitor) {
        this.monitor = monitor;
    }

    analyzePerformance() {
        this.analyzeTrends();
        this.detectPatterns();
    }

    analyzeTrends() {
        // トレンド分析の実装
        const fpsHistory = this.monitor.historyManager.data.fps.slice(-20);
        if (fpsHistory.length >= 5) {
            const trend = this.calculateTrend(fpsHistory.map(h => h.value));
            this.monitor.analysis.trends.set('fps', {
                direction: trend > 0.1 ? 'improving' : trend < -0.1 ? 'degrading' : 'stable',
                slope: trend,
                confidence: Math.min(0.9, Math.abs(trend) / 10 + 0.1)
            });
        }
    }

    detectPatterns() {
        // パターン検出の実装
        // 例：定期的なフレーム低下パターンの検出
    }

    calculateTrend(values) {
        if (values.length < 2) return 0;

        const n = values.length;
        const sumX = (n * (n + 1)) / 2;
        const sumY = values.reduce((a, b) => a + b, 0);
        const sumXY = values.reduce((sum, y, i) => sum + (i + 1) * y, 0);
        const sumXX = (n * (n + 1) * (2 * n + 1)) / 6;

        return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    }

    generateReport() {
        const metrics = this.monitor.getCurrentMetrics();
        const analysis = this.monitor.getAnalysisResults();
        const statistics = this.monitor.getStatistics();

        return {
            timestamp: Date.now(),
            summary: {
                overallHealth: this.calculateOverallHealth(metrics),
                criticalIssues: analysis.anomalies.filter(a => a.severity === 'critical').length,
                recommendations: analysis.recommendations.length
            },
            metrics,
            analysis,
            statistics
        };
    }

    calculateOverallHealth(metrics) {
        let score = 100;
        
        // FPS スコア
        if (metrics.frame.currentFPS < 30) score -= 40;
        else if (metrics.frame.currentFPS < 45) score -= 20;
        else if (metrics.frame.currentFPS < 55) score -= 10;

        // メモリスコア
        if (metrics.memory.pressureLevel > 0.8) score -= 30;
        else if (metrics.memory.pressureLevel > 0.6) score -= 15;

        // フレーム安定性スコア
        if (metrics.frame.fpsVariance > 10) score -= 20;
        else if (metrics.frame.fpsVariance > 5) score -= 10;

        return Math.max(0, score);
    }

    destroy() {
        // クリーンアップ
    }
}

/**
 * 詳細プロファイラー
 */
class DetailedProfiler {
    constructor(monitor) {
        this.monitor = monitor;
        this.isActive = false;
        this.currentProfile = null;
        this.profiles = new Map();
    }

    startProfiling(component) {
        if (this.isActive) {
            this.stopProfiling();
        }

        this.isActive = true;
        this.currentProfile = {
            component,
            startTime: performance.now(),
            markers: [],
            measurements: new Map()
        };

        console.log(`[DetailedProfiler] Started profiling: ${component}`);
    }

    stopProfiling() {
        if (!this.isActive || !this.currentProfile) {
            return null;
        }

        this.currentProfile.endTime = performance.now();
        this.currentProfile.duration = this.currentProfile.endTime - this.currentProfile.startTime;
        
        this.profiles.set(this.currentProfile.component, this.currentProfile);
        
        const result = { ...this.currentProfile };
        this.currentProfile = null;
        this.isActive = false;

        console.log(`[DetailedProfiler] Stopped profiling: ${result.component} (${result.duration.toFixed(2)}ms)`);
        return result;
    }

    mark(name) {
        if (!this.isActive) return;

        this.currentProfile.markers.push({
            name,
            timestamp: performance.now(),
            relativeTime: performance.now() - this.currentProfile.startTime
        });
    }

    measure(name, value) {
        if (!this.isActive) return;

        this.currentProfile.measurements.set(name, {
            value,
            timestamp: performance.now(),
            relativeTime: performance.now() - this.currentProfile.startTime
        });
    }

    getResults() {
        return {
            current: this.currentProfile,
            profiles: Object.fromEntries(this.profiles)
        };
    }

    destroy() {
        this.isActive = false;
        this.currentProfile = null;
        this.profiles.clear();
    }
}

// デフォルトエクスポート
export default AdvancedPerformanceMonitor;