/**
 * Cache Statistics Component
 * 
 * キャッシュのパフォーマンスメトリクスと統計機能を担当
 * AudioCacheManager のサブコンポーネント
 */

import { getErrorHandler  } from '../../utils/ErrorHandler';

/**
 * Operation counts interface
 */
export interface OperationCounts { gets: number;
    sets: number;
    deletes: number;
    evictions: number;
    cleanups: number;
/**
 * Category statistics interface
 */
export interface CategoryStats { count: number;
    totalSize: number;
    hitRate: number;
/**
 * Time series data point interfaces
 */
export interface HitRateDataPoint { timestamp: number;
    hitRate: number;
export interface MemoryUsageDataPoint { timestamp: number;
    usage: number;
    ratio: number;
export interface LoadTimeDataPoint { timestamp: number;
    avgLoadTime: number;
export interface RequestCountDataPoint { timestamp: number;
    requests: number;
/**
 * Time series data interface
 */
export interface TimeSeriesData { hitRates: HitRateDataPoint[];
    memoryUsage: MemoryUsageDataPoint[];
    loadTimes: LoadTimeDataPoint[];
    requestCounts: RequestCountDataPoint[];
/**
 * Statistics interface
 */
export interface Statistics { totalRequests: number;
    hitRatio: number;
    averageLoadTime: number;
    memoryEfficiency: number;
    operationCounts: OperationCounts;
    timeSeriesData: TimeSeriesData;
    categoryStats: {
        audioBuffer,s: CategoryStats;
        metadata: CategoryStats;
    chunks: CategoryStats;
    chunks: CategoryStats;
        };
/**
 * Performance snapshot interface
 */
export interface PerformanceSnapshot { timestamp: number;
    audioBuffer: any;
    metadata: any;
    chunk: any;
    memory: {
        tota,l?: number;
        max?: number;
        ratio?: number,  };
    loader: { averageLoadTime?: number;
    overall: { totalHits: number;
        totalMisses: number;
        totalEvictions: number;
        totalMemoryUsage: number;
    memoryEfficiency: number;
    memoryEfficiency: number;
        };
/**
 * Trend analysis result interface
 */'
export interface TrendAnalysis {,
    status: 'success' | 'insufficient_data' | 'error';
    period?: {,
        start: number;
    end: number;
    trends?: { hitRate: TrendInfo;
        memoryUsage: TrendInfo;
    loadTime: TrendInfo;
    loadTime: TrendInfo;
        };
/**
 * Trend info interface
 */
export interface TrendInfo { start: number;

    end: number;
    change: 'improving' | 'stable' | 'degrading'
            }
/**
 * Recommendation interface
 */'
export interface Recommendation { type: string,''
    priority: 'high' | 'medium' | 'low';
    message: string;
/**
 * Statistics summary interface
 */
export interface StatisticsSummary { overview: {
        totalRequest,s: number;
        hitRatio: number;
        averageLoadTime: number;
    memoryEfficiency: number;
    operations: OperationCounts;
    categories: { audioBuffers: CategoryStats;
        metadata: CategoryStats;
    chunks: CategoryStats;
    performance: { ''
        trends: Partial<TrendAnalysis['trends]>,'
        recommendations: Recommendation[];
    lastUpdated: number;
}
/**
 * Main controller interface
 */
interface MainController { audioBufferCache: {
        getStats(): any;;
    metadataCache: { getStats(): any;
    chunkCache: { getStats(): any;
    memoryManager?: { getCurrentMemoryUsage(): any,
        performanceStats: {
            cleanupOperations: number;
    dataLoader?: { getLoaderStats(): any;

export class CacheStatistics {
    private readonly mainController: MainController;
    // 統計収集設定
    private readonly statsConfig = {
        maxHistorySize: 1000;
    aggregationInterval: 60000, // 1分;
        enableDetailedTracking: true;
    // 統計データ
    private statistics: Statistics;
    // パフォーマンス監視
    private, performanceMonitor: { intervalId: NodeJS.Timeout | null
        lastAggregation: number;
    snapshots: PerformanceSnapshot[];
    snapshots: PerformanceSnapshot[];
        };
    constructor(mainController: MainController) {

        this.mainController = mainController;
        
        // 統計データ
        this.statistics = {
            totalRequests: 0;
            hitRatio: 0;
            averageLoadTime: 0;
            memoryEfficiency: 0;
    operationCounts: {
                gets: 0;
                sets: 0;
                deletes: 0;
    evictions: 0
}
                cleanups: 0 ;
    },
            timeSeriesData: { hitRates: [];
                memoryUsage: [];
                loadTimes: [];
    requestCounts: [] 
};
            categoryStats: {
                audioBuffers: { count: 0, totalSize: 0, hitRate: 0  };
                metadata: { count: 0, totalSize: 0, hitRate: 0  };
                chunks: { count: 0, totalSize: 0, hitRate: 0  }
        };
        
        // パフォーマンス監視
        this.performanceMonitor = { intervalId: null;
            lastAggregation: Date.now(
    snapshots: [] 
 };
        this.startPerformanceMonitoring();
    }
    
    /**
     * パフォーマンス監視を開始
     */
    startPerformanceMonitoring(): void { try {
            if (this.performanceMonitor.intervalId) {
    
}
                clearInterval(this.performanceMonitor.intervalId); }
            this.performanceMonitor.intervalId = setInterval(() => {  this.collectPerformanceSnapshot() }
                this.aggregateStatistics();' }'

            }, this.statsConfig.aggregationInterval';'

            console.log('Cache statistics monitoring started');

        } catch (error') { getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {''
                operation: 'startPerformanceMonitoring',')';
                component: 'CacheStatistics'
            };
        }
    /**
     * パフォーマンスのスナップショットを収集
     */
    collectPerformanceSnapshot(): void { try {
            const timestamp = Date.now();
            
            // 各キャッシュの統計を取得
            const audioBufferStats = this.mainController.audioBufferCache.getStats();
            const metadataStats = this.mainController.metadataCache.getStats();
            const chunkStats = this.mainController.chunkCache.getStats();
            
            // メモリ使用量を取得 }
            const memoryUsage = this.mainController.memoryManager?.getCurrentMemoryUsage() || {};
            
            // ローダー統計を取得
            const loaderStats = this.mainController.dataLoader?.getLoaderStats() || {};
             : undefined
            const snapshot: PerformanceSnapshot = { timestamp,
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
    memoryEfficiency: this.calculateMemoryEfficiency(memoryUsage  }
            };
            
            this.performanceMonitor.snapshots.push(snapshot);
            
            // 履歴サイズ制限
            if (this.performanceMonitor.snapshots.length > this.statsConfig.maxHistorySize) { this.performanceMonitor.snapshots.shift() } catch (error) { getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {''
                operation: 'collectPerformanceSnapshot',')';
                component: 'CacheStatistics'
            };
        }
    /**
     * 統計データを集約
     */
    aggregateStatistics(): void { try {
            if (this.performanceMonitor.snapshots.length === 0) {
    
}
                return; }
            const latestSnapshot = this.performanceMonitor.snapshots[this.performanceMonitor.snapshots.length - 1];
            
            // 全体統計の更新
            this.updateOverallStatistics(latestSnapshot);
            
            // 時系列データの更新
            this.updateTimeSeriesData(latestSnapshot);
            
            // カテゴリ別統計の更新
            this.updateCategoryStatistics(latestSnapshot);
            
            this.performanceMonitor.lastAggregation = Date.now();
            ';'

        } catch (error) { getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {''
                operation: 'aggregateStatistics',')';
                component: 'CacheStatistics'
            };
        }
    /**
     * 全体統計を更新
     * @param snapshot - パフォーマンススナップショット
     */
    updateOverallStatistics(snapshot: PerformanceSnapshot): void { const overall = snapshot.overall,
        
        this.statistics.totalRequests = overall.totalHits + overall.totalMisses;
        this.statistics.hitRatio = this.statistics.totalRequests > 0 ;
            ? overall.totalHits / this.statistics.totalRequests: 0,
        
        this.statistics.averageLoadTime = snapshot.loader.averageLoadTime || 0;
        this.statistics.memoryEfficiency = overall.memoryEfficiency;
        
        // 操作カウントの更新
        this.statistics.operationCounts = {
            gets: overall.totalHits + overall.totalMisses,
            sets: this.estimateSetOperations(snapshot),
            deletes: this.estimateDeleteOperations(snapshot),
            evictions: overall.totalEvictions,
    cleanups: this.mainController.memoryManager?.performanceStats.cleanupOperations || 0 
 }
    
    /**
     * 時系列データを更新
     * @param snapshot - パフォーマンススナップショット
     */ : undefined
    updateTimeSeriesData(snapshot: PerformanceSnapshot): void { const timestamp = snapshot.timestamp,
        
        // ヒット率の時系列
        this.statistics.timeSeriesData.hitRates.push({)
            timestamp);
            hitRate: this.statistics.hitRatio),
        // メモリ使用量の時系列
        this.statistics.timeSeriesData.memoryUsage.push({)
            timestamp;
            usage: snapshot.memory.total || 0),
            ratio: snapshot.memory.ratio || 0),
        // ロード時間の時系列
        this.statistics.timeSeriesData.loadTimes.push({)
            timestamp);
            avgLoadTime: snapshot.loader.averageLoadTime || 0),
        // リクエスト数の時系列
        this.statistics.timeSeriesData.requestCounts.push({)
            timestamp);
            requests: this.statistics.totalRequests),
        // 各時系列データのサイズ制限
        Object.keys(this.statistics.timeSeriesData).forEach(key => { )
            const data = this.statistics.timeSeriesData[key as keyof TimeSeriesData]);
            if (data.length > this.statsConfig.maxHistorySize) {  }
                data.shift(); }
        };
    }
    
    /**
     * カテゴリ別統計を更新
     * @param snapshot - パフォーマンススナップショット  
     */
    updateCategoryStatistics(snapshot: PerformanceSnapshot): void { // AudioBuffer統計
        this.statistics.categoryStats.audioBuffers = {
            count: snapshot.audioBuffer.entryCount,
            totalSize: snapshot.audioBuffer.currentSize,
    hitRate: snapshot.audioBuffer.hitRate 
};
        // メタデータ統計
        this.statistics.categoryStats.metadata = { count: snapshot.metadata.entryCount,
            totalSize: snapshot.metadata.currentSize,
    hitRate: snapshot.metadata.hitRate 
 };
        // チャンク統計
        this.statistics.categoryStats.chunks = { count: snapshot.chunk.entryCount,
            totalSize: snapshot.chunk.currentSize,
    hitRate: snapshot.chunk.hitRate 
 }
    
    /**
     * メモリ効率を計算
     * @param memoryUsage - メモリ使用量情報
     * @returns メモリ効率（0-1）
     */
    calculateMemoryEfficiency(memoryUsage: { total?: number, max?: number ): number {
        if (!memoryUsage.total || !memoryUsage.max) {
    
}
            return 0;
        const utilizationRatio = memoryUsage.total / memoryUsage.max;
        const hitRatio = this.statistics.hitRatio;
        
        // 使用率とヒット率の組み合わせで効率を計算
        return Math.min(utilizationRatio * hitRatio * 2, 1);
    }
    
    /**
     * Set操作数を推定
     * @param snapshot - パフォーマンススナップショット
     * @returns 推定Set操作数
     */
    estimateSetOperations(snapshot: PerformanceSnapshot): number { // エントリ数から推定（簡略化）
        return snapshot.audioBuffer.entryCount + ;
               snapshot.metadata.entryCount + ;
               snapshot.chunk.entryCount }
    /**
     * Delete操作数を推定
     * @param snapshot - パフォーマンススナップショット
     * @returns 推定Delete操作数
     */
    estimateDeleteOperations(snapshot: PerformanceSnapshot): number { // 削除操作数は直接取得できないため、削除とクリーンアップから推定
        return snapshot.overall.totalEvictions + ;
               (this.mainController.memoryManager?.performanceStats.cleanupOperations || 0) }
    /**
     * パフォーマンス傾向を分析
     * @param timeRangeMs - 分析期間（ミリ秒）
     * @returns 傾向分析結果
     */ : undefined
    analyzeTrends(timeRangeMs: number = 3600000): TrendAnalysis { // デフォルト1時間
        try {
            const cutoffTime = Date.now() - timeRangeMs;
            const recentSnapshots = this.performanceMonitor.snapshots.filter();
                snapshot => snapshot.timestamp >= cutoffTime);

            if (recentSnapshots.length < 2) { }'

                return { status: 'insufficient_data' }
            const first = recentSnapshots[0];
            const last = recentSnapshots[recentSnapshots.length - 1];
            ';'

            return { };

                status: 'success',
}
                period: { start: first.timestamp, end: last.timestamp  },
                trends: { hitRate: {'
                        start: first.overall.totalHits / (first.overall.totalHits + first.overall.totalMisses,
                        end: last.overall.totalHits / (last.overall.totalHits + last.overall.totalMisses,
                        change: this.calculateTrendDirection('hitRate', recentSnapshots },
                    memoryUsage: { start: first.memory.total || 0,
    end: last.memory.total || 0,
                        change: this.calculateTrendDirection('memoryUsage', recentSnapshots },
                    loadTime: { start: first.loader.averageLoadTime || 0,
    end: last.loader.averageLoadTime || 0,
                        change: this.calculateTrendDirection('loadTime', recentSnapshots }
} catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {''
                operation: 'analyzeTrends',')';
                component: 'CacheStatistics'),' }'

            }');'
            return { status: 'error' },
    
    /**
     * トレンド方向を計算
     * @param metric - メトリクス名'
     * @param snapshots - スナップショット配列''
     * @returns トレンド方向 ('improving', 'stable', 'degrading')
     */'
    calculateTrendDirection()';'
        metric: 'hitRate' | 'memoryUsage' | 'loadTime')';'
    snapshots: PerformanceSnapshot[]';'
    '): 'improving' | 'stable' | 'degrading' { ''
        if (snapshots.length < 3) {', ' }

            return 'stable'
            }
        let values: number[] = [],

        snapshots.forEach(snapshot => {  );
            switch(metric) {

                case 'hitRate':';'
                    const total = snapshot.overall.totalHits + snapshot.overall.totalMisses;
                    values.push(total > 0 ? snapshot.overall.totalHits / total: 0,
                    break;
                case 'memoryUsage':';'
                    values.push(snapshot.memory.total || 0);

                    break;
                case 'loadTime': }
                    values.push(snapshot.loader.averageLoadTime || 0); }
                    break; }
        };
        
        // 線形回帰の傾きを計算（簡略化）
        const n = values.length;
        const x = Array.from({ length: n ), (_, i) => i),
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = values.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        
        // しきい値で判定
        const threshold = Math.abs(sumY / n) * 0.1, // 平均値の10%

        if (slope > threshold) { }

            return metric === 'hitRate' ? 'improving' : 'degrading'; 
    } else if (slope < -threshold) { ''
            return metric === 'hitRate' ? 'degrading' : 'improving', else { }

            return 'stable';
    
    /**
     * 統計サマリーを生成
     * @returns 統計サマリー
     */
    generateSummary(): StatisticsSummary { const trends = this.analyzeTrends();
        return { overview: {
                totalRequests: this.statistics.totalRequests,
                hitRatio: this.statistics.hitRatio,
    averageLoadTime: this.statistics.averageLoadTime },
                memoryEfficiency: this.statistics.memoryEfficiency ,
    },
            operations: { ...this.statistics.operationCounts,
            categories: { ...this.statistics.categoryStats,
            performance: {
                trends: trends.trends || {},
                recommendations: this.generateRecommendations(trends),
            },
            lastUpdated: this.performanceMonitor.lastAggregation,
        } }
    
    /**
     * パフォーマンス改善の推奨事項を生成
     * @param trends - トレンド分析結果
     * @returns 推奨事項配列
     */
    generateRecommendations(trends: TrendAnalysis): Recommendation[] { const recommendations: Recommendation[] = [],

        if (this.statistics.hitRatio < 0.7) {
            recommendations.push({''
                type: 'hit_ratio',';'
                priority: 'high',' }'

                message: 'Cache hit ratio is low. Consider increasing cache size or reviewing access patterns.'),
    }

        if (this.statistics.memoryEfficiency < 0.5) {
            recommendations.push({''
                type: 'memory_efficiency',';'
                priority: 'medium',' }'

                message: 'Memory efficiency is low. Consider optimizing cache eviction policies.')'); '
    }

        if (trends.trends?.loadTime?.change === 'degrading') {
            recommendations.push({ : undefined''
                type: 'load_time',';'
                priority: 'high',' }'

                message: 'Load times are increasing. Check for performance bottlenecks.')'); '
    }

        if (trends.trends?.memoryUsage?.change === 'degrading') {
            recommendations.push({ : undefined''
                type: 'memory_usage',';'
                priority: 'medium',' }'

                message: 'Memory usage is growing. Consider more aggressive cleanup policies.')'); }'
        return recommendations;
    }
    
    /**'
     * 統計データをエクスポート''
     * @param format - エクスポート形式 ('json', 'csv')
     * @returns エクスポートデータ'
     */''
    exportStatistics(format: 'json' | 'csv' = 'json): string | null { try {'
            const data = {
                summary: this.generateSummary(),
                timeSeriesData: this.statistics.timeSeriesData,
    rawSnapshots: this.performanceMonitor.snapshots.slice(-100) // 最新100件 
};
            switch(format) {

                case 'json':';'
                    return JSON.stringify(data, null, 2);

                case 'csv':;
                    return this.convertToCSV(data) }
                default:  ,
}
                    throw new Error(`Unsupported, export format: ${format}`} } catch (error) { getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {''
                operation: 'exportStatistics')','
                format,')';
                component: 'CacheStatistics'
            }';'
            return null;
    /**
     * データをCSV形式に変換
     * @param data - 統計データ
     * @returns CSV文字列'
     */''
    convertToCSV(data: any): string { ''
        const headers = ['timestamp', 'hitRate', 'memoryUsage', 'loadTime', 'requests'];
        const rows = [headers.join(')];'
        
        const maxLength = Math.max(
            data.timeSeriesData.hitRates.length);
            data.timeSeriesData.memoryUsage.length);
            data.timeSeriesData.loadTimes.length);
            data.timeSeriesData.requestCounts.length);

        for(let, i = 0, i < maxLength, i++) {
            const row = [']';
                data.timeSeriesData.hitRates[i]?.timestamp || ';'
                data.timeSeriesData.hitRates[i]?.hitRate || ';'
                data.timeSeriesData.memoryUsage[i]?.usage || ';'
                data.timeSeriesData.loadTimes[i]?.avgLoadTime || ';'
                data.timeSeriesData.requestCounts[i]?.requests || '';
            ] }

            rows.push(row.join(')'; }'
        }

        return rows.join('\n);'
    }
    
    /**
     * リソースの解放
     */ : undefined
    dispose(): void { try {
            if (this.performanceMonitor.intervalId) {

                clearInterval(this.performanceMonitor.intervalId) }
                this.performanceMonitor.intervalId = null; }
            this.performanceMonitor.snapshots = [];
            this.statistics.timeSeriesData = { hitRates: [],
                memoryUsage: [],
                loadTimes: [],
    requestCounts: [] 
 };
            console.log('CacheStatistics, disposed';

        } catch (error') {'
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {''
                operation: 'dispose',')';
                component: 'CacheStatistics'),' }'

            }');'
        }

    }'}'