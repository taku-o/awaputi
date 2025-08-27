/**
 * Cache Statistics Component
 * 
 * キャッシュのパフォーマンスメトリクスと統計機能を担当
 * AudioCacheManager のサブコンポーネント
 */

import { getErrorHandler } from '../../utils/ErrorHandler.js';

export class CacheStatistics {
    constructor(mainController) {
        this.mainController = mainController;
        
        // 統計収集設定
        this.statsConfig = {
            maxHistorySize: 1000,
            aggregationInterval: 60000, // 1分
            enableDetailedTracking: true
        };
        
        // 統計データ
        this.statistics = {
            totalRequests: 0,
            hitRatio: 0,
            averageLoadTime: 0,
            memoryEfficiency: 0,
            operationCounts: {
                gets: 0,
                sets: 0,
                deletes: 0,
                evictions: 0,
                cleanups: 0
            },
            timeSeriesData: {
                hitRates: [],
                memoryUsage: [],
                loadTimes: [],
                requestCounts: []
            },
            categoryStats: {
                audioBuffers: { count: 0, totalSize: 0, hitRate: 0 },
                metadata: { count: 0, totalSize: 0, hitRate: 0 },
                chunks: { count: 0, totalSize: 0, hitRate: 0 }
            }
        };
        
        // パフォーマンス監視
        this.performanceMonitor = {
            intervalId: null,
            lastAggregation: Date.now(),
            snapshots: []
        };
        
        this.startPerformanceMonitoring();
    }
    
    /**
     * パフォーマンス監視を開始
     */
    startPerformanceMonitoring() {
        try {
            if (this.performanceMonitor.intervalId) {
                clearInterval(this.performanceMonitor.intervalId);
            }
            
            this.performanceMonitor.intervalId = setInterval(() => {
                this.collectPerformanceSnapshot();
                this.aggregateStatistics();
            }, this.statsConfig.aggregationInterval);
            
            console.log('Cache statistics monitoring started');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'startPerformanceMonitoring',
                component: 'CacheStatistics'
            });
        }
    }
    
    /**
     * パフォーマンスのスナップショットを収集
     */
    collectPerformanceSnapshot() {
        try {
            const timestamp = Date.now();
            
            // 各キャッシュの統計を取得
            const audioBufferStats = this.mainController.audioBufferCache.getStats();
            const metadataStats = this.mainController.metadataCache.getStats();
            const chunkStats = this.mainController.chunkCache.getStats();
            
            // メモリ使用量を取得
            const memoryUsage = this.mainController.memoryManager?.getCurrentMemoryUsage() || {};
            
            // ローダー統計を取得
            const loaderStats = this.mainController.dataLoader?.getLoaderStats() || {};
            
            const snapshot = {
                timestamp,
                audioBuffer: audioBufferStats,
                metadata: metadataStats,
                chunk: chunkStats,
                memory: memoryUsage,
                loader: loaderStats,
                overall: {
                    totalHits: audioBufferStats.hits + metadataStats.hits + chunkStats.hits,
                    totalMisses: audioBufferStats.misses + metadataStats.misses + chunkStats.misses,
                    totalEvictions: audioBufferStats.evictions + metadataStats.evictions + chunkStats.evictions,
                    totalMemoryUsage: memoryUsage.total || 0,
                    memoryEfficiency: this.calculateMemoryEfficiency(memoryUsage)
                }
            };
            
            this.performanceMonitor.snapshots.push(snapshot);
            
            // 履歴サイズ制限
            if (this.performanceMonitor.snapshots.length > this.statsConfig.maxHistorySize) {
                this.performanceMonitor.snapshots.shift();
            }
            
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'collectPerformanceSnapshot',
                component: 'CacheStatistics'
            });
        }
    }
    
    /**
     * 統計データを集約
     */
    aggregateStatistics() {
        try {
            if (this.performanceMonitor.snapshots.length === 0) {
                return;
            }
            
            const latestSnapshot = this.performanceMonitor.snapshots[this.performanceMonitor.snapshots.length - 1];
            
            // 全体統計の更新
            this.updateOverallStatistics(latestSnapshot);
            
            // 時系列データの更新
            this.updateTimeSeriesData(latestSnapshot);
            
            // カテゴリ別統計の更新
            this.updateCategoryStatistics(latestSnapshot);
            
            this.performanceMonitor.lastAggregation = Date.now();
            
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'aggregateStatistics',
                component: 'CacheStatistics'
            });
        }
    }
    
    /**
     * 全体統計を更新
     * @param {Object} snapshot - パフォーマンススナップショット
     */
    updateOverallStatistics(snapshot) {
        const overall = snapshot.overall;
        
        this.statistics.totalRequests = overall.totalHits + overall.totalMisses;
        this.statistics.hitRatio = this.statistics.totalRequests > 0 
            ? overall.totalHits / this.statistics.totalRequests 
            : 0;
        
        this.statistics.averageLoadTime = snapshot.loader.averageLoadTime || 0;
        this.statistics.memoryEfficiency = overall.memoryEfficiency;
        
        // 操作カウントの更新
        this.statistics.operationCounts = {
            gets: overall.totalHits + overall.totalMisses,
            sets: this.estimateSetOperations(snapshot),
            deletes: this.estimateDeleteOperations(snapshot),
            evictions: overall.totalEvictions,
            cleanups: this.mainController.memoryManager?.performanceStats.cleanupOperations || 0
        };
    }
    
    /**
     * 時系列データを更新
     * @param {Object} snapshot - パフォーマンススナップショット
     */
    updateTimeSeriesData(snapshot) {
        const timestamp = snapshot.timestamp;
        
        // ヒット率の時系列
        this.statistics.timeSeriesData.hitRates.push({
            timestamp,
            hitRate: this.statistics.hitRatio
        });
        
        // メモリ使用量の時系列
        this.statistics.timeSeriesData.memoryUsage.push({
            timestamp,
            usage: snapshot.memory.total || 0,
            ratio: snapshot.memory.ratio || 0
        });
        
        // ロード時間の時系列
        this.statistics.timeSeriesData.loadTimes.push({
            timestamp,
            avgLoadTime: snapshot.loader.averageLoadTime || 0
        });
        
        // リクエスト数の時系列
        this.statistics.timeSeriesData.requestCounts.push({
            timestamp,
            requests: this.statistics.totalRequests
        });
        
        // 各時系列データのサイズ制限
        Object.keys(this.statistics.timeSeriesData).forEach(key => {
            const data = this.statistics.timeSeriesData[key];
            if (data.length > this.statsConfig.maxHistorySize) {
                data.shift();
            }
        });
    }
    
    /**
     * カテゴリ別統計を更新
     * @param {Object} snapshot - パフォーマンススナップショット  
     */
    updateCategoryStatistics(snapshot) {
        // AudioBuffer統計
        this.statistics.categoryStats.audioBuffers = {
            count: snapshot.audioBuffer.entryCount,
            totalSize: snapshot.audioBuffer.currentSize,
            hitRate: snapshot.audioBuffer.hitRate
        };
        
        // メタデータ統計
        this.statistics.categoryStats.metadata = {
            count: snapshot.metadata.entryCount,
            totalSize: snapshot.metadata.currentSize,
            hitRate: snapshot.metadata.hitRate
        };
        
        // チャンク統計
        this.statistics.categoryStats.chunks = {
            count: snapshot.chunk.entryCount,
            totalSize: snapshot.chunk.currentSize,
            hitRate: snapshot.chunk.hitRate
        };
    }
    
    /**
     * メモリ効率を計算
     * @param {Object} memoryUsage - メモリ使用量情報
     * @returns {number} メモリ効率（0-1）
     */
    calculateMemoryEfficiency(memoryUsage) {
        if (!memoryUsage.total || !memoryUsage.max) {
            return 0;
        }
        
        const utilizationRatio = memoryUsage.total / memoryUsage.max;
        const hitRatio = this.statistics.hitRatio;
        
        // 使用率とヒット率の組み合わせで効率を計算
        return Math.min(utilizationRatio * hitRatio * 2, 1);
    }
    
    /**
     * Set操作数を推定
     * @param {Object} snapshot - パフォーマンススナップショット
     * @returns {number} 推定Set操作数
     */
    estimateSetOperations(snapshot) {
        // エントリ数から推定（簡略化）
        return snapshot.audioBuffer.entryCount + 
               snapshot.metadata.entryCount + 
               snapshot.chunk.entryCount;
    }
    
    /**
     * Delete操作数を推定
     * @param {Object} snapshot - パフォーマンススナップショット
     * @returns {number} 推定Delete操作数
     */
    estimateDeleteOperations(snapshot) {
        // 削除操作数は直接取得できないため、削除とクリーンアップから推定
        return snapshot.overall.totalEvictions + 
               (this.mainController.memoryManager?.performanceStats.cleanupOperations || 0);
    }
    
    /**
     * パフォーマンス傾向を分析
     * @param {number} timeRangeMs - 分析期間（ミリ秒）
     * @returns {Object} 傾向分析結果
     */
    analyzeTrends(timeRangeMs = 3600000) { // デフォルト1時間
        try {
            const cutoffTime = Date.now() - timeRangeMs;
            const recentSnapshots = this.performanceMonitor.snapshots.filter(
                snapshot => snapshot.timestamp >= cutoffTime
            );
            
            if (recentSnapshots.length < 2) {
                return { status: 'insufficient_data' };
            }
            
            const first = recentSnapshots[0];
            const last = recentSnapshots[recentSnapshots.length - 1];
            
            return {
                status: 'success',
                period: { start: first.timestamp, end: last.timestamp },
                trends: {
                    hitRate: {
                        start: first.overall.totalHits / (first.overall.totalHits + first.overall.totalMisses),
                        end: last.overall.totalHits / (last.overall.totalHits + last.overall.totalMisses),
                        change: this.calculateTrendDirection('hitRate', recentSnapshots)
                    },
                    memoryUsage: {
                        start: first.memory.total || 0,
                        end: last.memory.total || 0,
                        change: this.calculateTrendDirection('memoryUsage', recentSnapshots)
                    },
                    loadTime: {
                        start: first.loader.averageLoadTime || 0,
                        end: last.loader.averageLoadTime || 0,
                        change: this.calculateTrendDirection('loadTime', recentSnapshots)
                    }
                }
            };
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'analyzeTrends',
                component: 'CacheStatistics'
            });
            return { status: 'error' };
        }
    }
    
    /**
     * トレンド方向を計算
     * @param {string} metric - メトリクス名
     * @param {Array} snapshots - スナップショット配列
     * @returns {string} トレンド方向 ('improving', 'stable', 'degrading')
     */
    calculateTrendDirection(metric, snapshots) {
        if (snapshots.length < 3) {
            return 'stable';
        }
        
        let values = [];
        
        snapshots.forEach(snapshot => {
            switch (metric) {
                case 'hitRate':
                    const total = snapshot.overall.totalHits + snapshot.overall.totalMisses;
                    values.push(total > 0 ? snapshot.overall.totalHits / total : 0);
                    break;
                case 'memoryUsage':
                    values.push(snapshot.memory.total || 0);
                    break;
                case 'loadTime':
                    values.push(snapshot.loader.averageLoadTime || 0);
                    break;
            }
        });
        
        // 線形回帰の傾きを計算（簡略化）
        const n = values.length;
        const x = Array.from({ length: n }, (_, i) => i);
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = values.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        
        // しきい値で判定
        const threshold = Math.abs(sumY / n) * 0.1; // 平均値の10%
        
        if (slope > threshold) {
            return metric === 'hitRate' ? 'improving' : 'degrading';
        } else if (slope < -threshold) {
            return metric === 'hitRate' ? 'degrading' : 'improving';
        } else {
            return 'stable';
        }
    }
    
    /**
     * 統計サマリーを生成
     * @returns {Object} 統計サマリー
     */
    generateSummary() {
        const trends = this.analyzeTrends();
        
        return {
            overview: {
                totalRequests: this.statistics.totalRequests,
                hitRatio: this.statistics.hitRatio,
                averageLoadTime: this.statistics.averageLoadTime,
                memoryEfficiency: this.statistics.memoryEfficiency
            },
            operations: { ...this.statistics.operationCounts },
            categories: { ...this.statistics.categoryStats },
            performance: {
                trends: trends.trends || {},
                recommendations: this.generateRecommendations(trends)
            },
            lastUpdated: this.performanceMonitor.lastAggregation
        };
    }
    
    /**
     * パフォーマンス改善の推奨事項を生成
     * @param {Object} trends - トレンド分析結果
     * @returns {Array} 推奨事項配列
     */
    generateRecommendations(trends) {
        const recommendations = [];
        
        if (this.statistics.hitRatio < 0.7) {
            recommendations.push({
                type: 'hit_ratio',
                priority: 'high',
                message: 'Cache hit ratio is low. Consider increasing cache size or reviewing access patterns.'
            });
        }
        
        if (this.statistics.memoryEfficiency < 0.5) {
            recommendations.push({
                type: 'memory_efficiency',
                priority: 'medium',
                message: 'Memory efficiency is low. Consider optimizing cache eviction policies.'
            });
        }
        
        if (trends.trends?.loadTime?.change === 'degrading') {
            recommendations.push({
                type: 'load_time',
                priority: 'high',
                message: 'Load times are increasing. Check for performance bottlenecks.'
            });
        }
        
        if (trends.trends?.memoryUsage?.change === 'degrading') {
            recommendations.push({
                type: 'memory_usage',
                priority: 'medium',
                message: 'Memory usage is growing. Consider more aggressive cleanup policies.'
            });
        }
        
        return recommendations;
    }
    
    /**
     * 統計データをエクスポート
     * @param {string} format - エクスポート形式 ('json', 'csv')
     * @returns {string} エクスポートデータ
     */
    exportStatistics(format = 'json') {
        try {
            const data = {
                summary: this.generateSummary(),
                timeSeriesData: this.statistics.timeSeriesData,
                rawSnapshots: this.performanceMonitor.snapshots.slice(-100) // 最新100件
            };
            
            switch (format) {
                case 'json':
                    return JSON.stringify(data, null, 2);
                    
                case 'csv':
                    return this.convertToCSV(data);
                    
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'exportStatistics',
                format,
                component: 'CacheStatistics'
            });
            return null;
        }
    }
    
    /**
     * データをCSV形式に変換
     * @param {Object} data - 統計データ
     * @returns {string} CSV文字列
     */
    convertToCSV(data) {
        const headers = ['timestamp', 'hitRate', 'memoryUsage', 'loadTime', 'requests'];
        const rows = [headers.join(',')];
        
        const maxLength = Math.max(
            data.timeSeriesData.hitRates.length,
            data.timeSeriesData.memoryUsage.length,
            data.timeSeriesData.loadTimes.length,
            data.timeSeriesData.requestCounts.length
        );
        
        for (let i = 0; i < maxLength; i++) {
            const row = [
                data.timeSeriesData.hitRates[i]?.timestamp || '',
                data.timeSeriesData.hitRates[i]?.hitRate || '',
                data.timeSeriesData.memoryUsage[i]?.usage || '',
                data.timeSeriesData.loadTimes[i]?.avgLoadTime || '',
                data.timeSeriesData.requestCounts[i]?.requests || ''
            ];
            rows.push(row.join(','));
        }
        
        return rows.join('\n');
    }
    
    /**
     * リソースの解放
     */
    dispose() {
        try {
            if (this.performanceMonitor.intervalId) {
                clearInterval(this.performanceMonitor.intervalId);
                this.performanceMonitor.intervalId = null;
            }
            
            this.performanceMonitor.snapshots = [];
            this.statistics.timeSeriesData = {
                hitRates: [],
                memoryUsage: [],
                loadTimes: [],
                requestCounts: []
            };
            
            console.log('CacheStatistics disposed');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'dispose',
                component: 'CacheStatistics'
            });
        }
    }
}