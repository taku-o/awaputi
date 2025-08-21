/**
 * 国際化パフォーマンス監視システム
 * 
 * 翻訳処理、言語切り替え、レンダリング性能の
 * リアルタイム監視と最適化提案を提供
 */

import { getErrorHandler  } from '../../utils/ErrorHandler.js';

// 型定義
export interface PerformanceMeasurement { duration: number,
    timestamp: number;
   , success: boolean ,}

export interface TranslationMeasurement { id: string;
    startTime: number;
    key: string;
   , language: string }

export interface LanguageSwitchResult { result: any;
   , duration: number }

export interface RenderingResult { result: any;
   , duration: number }

export interface MemoryInfo { used: number;
    total: number;
    limit: number;
   , timestamp: number }

export interface NetworkInfo { effectiveType: string;
    downlink: number;
    rtt: number;
   , timestamp: number }

export interface PerformanceMetrics { translationTimes: Map<string, PerformanceMeasurement[]>,
    languageSwitchTimes: Map<string, PerformanceMeasurement[]>,
    renderingTimes: Map<string, PerformanceMeasurement[]>,
    memoryUsage: Map<number, MemoryInfo>,
    cachePerformance: Map<string, any>,
    networkPerformance: Map<number, NetworkInfo>, }

export interface PerformanceThresholds { translationTime: number,
    languageSwitchTime: number;
    renderingTime: number;
    memoryGrowth: number;
    cacheHitRate: number;
   , networkTimeout: number ,}

export interface PerformanceAlert { type: string;
    details: any;
    timestamp: number;
   , severity: AlertSeverity
    }

export interface AlertCategories { performance: PerformanceAlert[];
    memory: PerformanceAlert[];
   , network: PerformanceAlert[]
    }

export interface PerformanceStatistics { startTime: number;
    totalTranslations: number;
    totalLanguageSwitches: number;
    totalRenders: number;
    performanceIssues: number;
   , optimizations: number;
    uptime?: number;
    avgTranslationsPerMinute?: number;
    avgSwitchesPerMinute?: number; }

export interface AutoOptimizationConfig { enabled: boolean,
    adaptiveThresholds: boolean;
    memoryCleanup: boolean;
   , cacheOptimization: boolean ,}

export interface TranslationPerformanceAnalysis { totalTranslations: number;
    averageTime: number;
    slowTranslations: number;
    fastestLanguage: LanguagePerformance | null;
   , slowestLanguage: LanguagePerformance | null }

export interface LanguagePerformance { language: string;
   , averageTime: number }

export interface LanguageSwitchPerformanceAnalysis { totalSwitches: number;
    averageTime: number;
    slowSwitches: number;
   , commonSwitchPatterns: SwitchPattern[]
    }

export interface SwitchPattern { pattern: string;
    count: number;
   , percentage: number }

export interface RenderingPerformanceAnalysis { totalRenders: number;
    averageTime: number;
    averageFPS: number;
   , droppedFrames: number }
';

export interface MemoryTrendAnalysis {;
    trend: 'increasing' | 'decreasing' | 'insufficient_data';
    changeRate?: number;
    currentUsage?: number;
    maxUsage?: number;
    minUsage?: number; }

export interface PerformanceAnalysis { translationPerformance: TranslationPerformanceAnalysis,
    languageSwitchPerformance: LanguageSwitchPerformanceAnalysis;
    renderingPerformance: RenderingPerformanceAnalysis;
    memoryTrends: MemoryTrendAnalysis;
   , recommendations: PerformanceRecommendation[]
    ,}

export interface PerformanceRecommendation { type: RecommendationType;
    severity: AlertSeverity;
    message: string;
   , action: OptimizationAction
    }

export interface PerformanceReport { timestamp: number;
    uptime: number;
    statistics: PerformanceStatistics;
    analysis: PerformanceAnalysis;
    alerts: AlertCategories;
    thresholds: PerformanceThresholds;
   , autoOptimization: AutoOptimizationConfig
    }

export interface LanguageStats { totalTime: number;
   , count: number }

export interface PerformanceIssueDetails { key?: string;
    language?: string;
    duration?: number;
    threshold?: number;
    from?: string;
    to?: string;
    error?: string;
    fps?: number;
    current?: number;
    previous?: number;
    growth?: number;
    effectiveType?: string;
    downlink?: number;
    rtt?: number; }

export interface NetworkConnection { effectiveType: string,
    downlink: number;
   , rtt: number ,}

// Navigator型拡張
declare global { interface Navigator {
        connection?: NetworkConnection;
    }
    ';

    interface Window { ''
        gc?: (') => void; }'
    }
    
    interface Performance { memory?: {
            usedJSHeapSiz;e: number;
            totalJSHeapSize: number;
           , jsHeapSizeLimit: number ,}
}

export type AlertSeverity = 'low' | 'medium' | 'high';''
export type RecommendationType = 'translation' | 'language_switch' | 'rendering' | 'memory';''
export type OptimizationAction = 'enable_translation_cache' | 'enable_language_preload' | 'optimize_rendering' | 'memory_cleanup';

export class I18nPerformanceMonitor {
    // 監視対象のメトリクス
    private metrics: PerformanceMetrics;
    // パフォーマンス閾値
    private thresholds: PerformanceThresholds;
    // アラート設定
    private alerts: AlertCategories;
    // 統計データ
    private statistics: PerformanceStatistics;
    // 自動最適化設定
    private, autoOptimization: AutoOptimizationConfig;
    // 監視インターバル
    private monitoringInterval?: number;
    private memoryMonitoringInterval?: number;
    private networkMonitoringInterval?: number;

    constructor() {

        // 監視対象のメトリクス
        this.metrics = {
            translationTimes: new Map<string, PerformanceMeasurement[]>(),    // 翻訳処理時間;
            languageSwitchTimes: new Map<string, PerformanceMeasurement[]>(), // 言語切り替え時間;
            renderingTimes: new Map<string, PerformanceMeasurement[]>(),      // レンダリング時間;
            memoryUsage: new Map<number, MemoryInfo>(),         // メモリ使用量;
            cachePerformance: new Map<string, any>(),    // キャッシュ性能
    }
            networkPerformance: new Map<number, NetworkInfo>()   // ネットワーク性能 }
        };
        
        // パフォーマンス閾値
        this.thresholds = { translationTime: 10,      // 10ms以内
            languageSwitchTime: 500,  // 500ms以内;
            renderingTime: 16.67,     // 60FPS (16.67ms);
            memoryGrowth: 20,         // 20%以内の増加;
            cacheHitRate: 80,         // 80%以上;
            networkTimeout: 5000      // 5秒以内 ,};
        // アラート設定
        this.alerts = { performance: [],
            memory: [];
           , network: [] ,};
        // 統計データ
        this.statistics = { startTime: Date.now(),
            totalTranslations: 0;
            totalLanguageSwitches: 0;
            totalRenders: 0;
            performanceIssues: 0;
           , optimizations: 0 ,};
        // 自動最適化設定
        this.autoOptimization = { enabled: true,
            adaptiveThresholds: true;
            memoryCleanup: true;
           , cacheOptimization: true ,};
        // 監視開始
        this.startMonitoring();
    }
    
    /**
     * 監視開始
     */''
    private startMonitoring()';
        console.log('I18n, Performance Monitor, started);
        
        // 定期的な統計収集
        this.monitoringInterval = window.setInterval(() => {  this.collectSystemMetrics();
            this.analyzePerformance(); }
            this.optimizeIfNeeded(); }
        }, 5000); // 5秒間隔
        
        // メモリ監視
        if (performance.memory) { this.memoryMonitoringInterval = window.setInterval(() => {  }
                this.monitorMemoryUsage(); }
            }, 1000); // 1秒間隔
        }
        
        // ネットワーク監視
        this.networkMonitoringInterval = window.setInterval(() => { this.monitorNetworkPerformance(); }, 2000); // 2秒間隔
    }
    
    /**
     * 翻訳性能の測定開始
     */
    startTranslationMeasurement(key: string, language: string): TranslationMeasurement {
        const measurementId = `${key}_${language}_${Date.now(})`;
        return { id: measurementId,
            startTime: performance.now();
            key, };
            language }
        }
    
    /**
     * 翻訳性能の測定終了
     */
    endTranslationMeasurement(measurement: TranslationMeasurement, success: boolean = true): number { const endTime = performance.now();
        const duration = endTime - measurement.startTime;
        
        // メトリクス記録 }
        const key = `${measurement.language}:${measurement.key}`;
        if(!this.metrics.translationTimes.has(key) { this.metrics.translationTimes.set(key, []); }
        
        this.metrics.translationTimes.get(key)!.push({ )
            duration);
            timestamp: Date.now();
            success });
        
        // 統計更新
        this.statistics.totalTranslations++;
        // 閾値チェック
        if(duration > this.thresholds.translationTime') {'

            this.recordPerformanceIssue('translation', {
                key: measurement.key);
               , language: measurement.language);
                duration,);
        }
                threshold: this.thresholds.translationTime); }
        }
        
        // デバッグログ
        if(duration > this.thresholds.translationTime * 2) {
            
        }
            console.warn(`Slow, translation detected: ${measurement.key} (${duration.toFixed(2})ms)`);
        }
        
        return duration;
    }
    
    /**
     * 言語切り替え性能の測定
     */
    async measureLanguageSwitch<T>(fromLanguage: string, toLanguage: string, callback: () => Promise<T>): Promise<LanguageSwitchResult> { return new Promise(async (resolve, reject) => {  }
            const startTime = performance.now(); }
            const measurementId = `switch_${fromLanguage}_${toLanguage}_${Date.now(})`;
            
            try { const result = await callback();
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                // メトリクス記録 }
                const switchKey = `${fromLanguage}->${toLanguage}`;
                if(!this.metrics.languageSwitchTimes.has(switchKey) { this.metrics.languageSwitchTimes.set(switchKey, []); }
                
                this.metrics.languageSwitchTimes.get(switchKey)!.push({ )
                    duration);
                    timestamp: Date.now();
                   , success: true });
                // 統計更新
                this.statistics.totalLanguageSwitches++;
                // 閾値チェック
                if(duration > this.thresholds.languageSwitchTime) {'

                    this.recordPerformanceIssue('languageSwitch', {
                        from: fromLanguage);
                       , to: toLanguage);
                        duration,);
                }
                        threshold: this.thresholds.languageSwitchTime); }
                }
                
                resolve({ result, duration );
                 }

            } catch (error) {
                const endTime = performance.now(''';
                this.recordPerformanceIssue('languageSwitchError', {)
                    from: fromLanguage);
                   , to: toLanguage,);
                    duration);
                    error: (error, as Error).message ,});
                reject(error);
            }
        });
    }
    
    /**
     * レンダリング性能の測定
     */
    async measureRenderingPerformance<T>(renderCallback: () => Promise<T>): Promise<RenderingResult> { return new Promise(async (resolve, reject) => { 
            const startTime = performance.now();
            
            try {
                const result = await renderCallback();''
                const endTime = performance.now()';
                const renderKey = 'ui_update';)
                if(!this.metrics.renderingTimes.has(renderKey) { }
                    this.metrics.renderingTimes.set(renderKey, []); }
                }
                
                this.metrics.renderingTimes.get(renderKey)!.push({ )
                    duration);
                    timestamp: Date.now();
                   , success: true });
                // 統計更新
                this.statistics.totalRenders++;
                // 60FPS チェック
                if(duration > this.thresholds.renderingTime) {'

                    this.recordPerformanceIssue('rendering', {)
                        duration,);
                        threshold: this.thresholds.renderingTime);
                ,}
                        fps: Math.round(1000 / duration); }
                    });
                }
                
                resolve({ result, duration );

                ' }'

            } catch (error) {
                this.recordPerformanceIssue('renderingError', {);
                    error: (error, as Error).message ,});
                reject(error);
            }
        });
    }
    
    /**
     * システムメトリクスの収集
     */
    private collectSystemMetrics(): void { const now = Date.now();
        
        // メモリ使用量
        if(performance.memory) {
            const memoryInfo: MemoryInfo = {
                used: performance.memory.usedJSHeapSize;
                total: performance.memory.totalJSHeapSize;
               , limit: performance.memory.jsHeapSizeLimit;
        }
                timestamp: now }
            };
            this.metrics.memoryUsage.set(now, memoryInfo);
            
            // 古いデータの削除（1時間以上前）
            const oneHourAgo = now - 3600000;
            for(const [timestamp] of, this.metrics.memoryUsage) {
                if (timestamp < oneHourAgo) {
            }
                    this.metrics.memoryUsage.delete(timestamp); }
}
        }
        
        // パフォーマンス統計の更新
        this.updatePerformanceStatistics();
    }
    
    /**
     * メモリ使用量の監視
     */
    private monitorMemoryUsage(): void { if (!performance.memory) return;
        
        const currentMemory = performance.memory.usedJSHeapSize;
        const memoryHistory = Array.from(this.metrics.memoryUsage.values();
        
        if(memoryHistory.length > 1) {
        
            const previousMemory = memoryHistory[memoryHistory.length - 2].used;
            const memoryGrowth = ((currentMemory - previousMemory) / previousMemory) * 100;

            if(memoryGrowth > this.thresholds.memoryGrowth) {''
                this.recordPerformanceIssue('memoryGrowth', {
                    current: currentMemory);
                    previous: previousMemory);
                   , growth: memoryGrowth, }
                    threshold: this.thresholds.memoryGrowth); }
}
    }
    
    /**
     * ネットワーク性能の監視
     */
    private monitorNetworkPerformance(): void { if (navigator.connection) {
            const connection = navigator.connection;
            const networkInfo: NetworkInfo = {
                effectiveType: connection.effectiveType;
                downlink: connection.downlink;
                rtt: connection.rtt;
               , timestamp: Date.now( };

            this.metrics.networkPerformance.set(Date.now(), networkInfo');
            ';
            // ネットワーク品質の評価
            if(connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g'') { '

                this.recordPerformanceIssue('slowNetwork', {)
                    effectiveType: connection.effectiveType);
                   , downlink: connection.downlink, }
                    rtt: connection.rtt); }
}
    }
    
    /**
     * パフォーマンス分析
     */
    analyzePerformance(): PerformanceAnalysis { const analysis: PerformanceAnalysis = {
            translationPerformance: this.analyzeTranslationPerformance();
            languageSwitchPerformance: this.analyzeLanguageSwitchPerformance();
            renderingPerformance: this.analyzeRenderingPerformance();
            memoryTrends: this.analyzeMemoryTrends();
           , recommendations: [] };
        // 推奨事項の生成
        this.generateRecommendations(analysis);
        
        return analysis;
    }
    
    /**
     * 翻訳性能の分析
     */
    private analyzeTranslationPerformance(): TranslationPerformanceAnalysis { const analysis: TranslationPerformanceAnalysis = {
            totalTranslations: 0;
            averageTime: 0;
            slowTranslations: 0;
            fastestLanguage: null;
           , slowestLanguage: null };
        let totalTime = 0;
        let totalCount = 0;
        const languageAverages = new Map<string, LanguageStats>();

        for(const [key, measurements] of this.metrics.translationTimes) {'

            const [language] = key.split(':);
            const validMeasurements = measurements.filter(m => m.success);
            
            if (validMeasurements.length === 0) continue;
            
            const avgTime = validMeasurements.reduce((sum, m) => sum + m.duration, 0) / validMeasurements.length;
            const slowCount = validMeasurements.filter(m => m.duration > this.thresholds.translationTime).length;
            
            totalTime += avgTime * validMeasurements.length;
            totalCount += validMeasurements.length;
            analysis.slowTranslations += slowCount;
            
            // 言語別平均の更新
            if(!languageAverages.has(language) {
        }
                languageAverages.set(language, { totalTime: 0, count: 0 ,}
            const langStats = languageAverages.get(language)!;
            langStats.totalTime += avgTime * validMeasurements.length;
            langStats.count += validMeasurements.length;
        }
        
        if(totalCount > 0) {
        
            analysis.totalTranslations = totalCount;
        
        }
            analysis.averageTime = totalTime / totalCount; }
        }
        
        // 最速・最遅言語の特定
        let fastestTime = Infinity;
        let slowestTime = 0;
        
        for(const [language, stats] of languageAverages) {
        
            const avgTime = stats.totalTime / stats.count;
            
            if (avgTime < fastestTime) {
        
        }
                fastestTime = avgTime; }
                analysis.fastestLanguage = { language, averageTime: avgTime ,}
            
            if (avgTime > slowestTime) { slowestTime = avgTime; }
                analysis.slowestLanguage = { language, averageTime: avgTime ,}
        }
        
        return analysis;
    }
    
    /**
     * 言語切り替え性能の分析
     */
    private analyzeLanguageSwitchPerformance(): LanguageSwitchPerformanceAnalysis { const analysis: LanguageSwitchPerformanceAnalysis = {
            totalSwitches: 0;
            averageTime: 0;
            slowSwitches: 0;
           , commonSwitchPatterns: [] };
        let totalTime = 0;
        let totalCount = 0;
        const switchCounts = new Map<string, number>();
        
        for(const [switchKey, measurements] of this.metrics.languageSwitchTimes) {
        
            const validMeasurements = measurements.filter(m => m.success);
            
            if (validMeasurements.length === 0) continue;
            
            const avgTime = validMeasurements.reduce((sum, m) => sum + m.duration, 0) / validMeasurements.length;
            const slowCount = validMeasurements.filter(m => m.duration > this.thresholds.languageSwitchTime).length;
            
            totalTime += avgTime * validMeasurements.length;
            totalCount += validMeasurements.length;
            analysis.slowSwitches += slowCount;
            
            // 切り替えパターンの記録
        
        }
            switchCounts.set(switchKey, validMeasurements.length); }
        }
        
        if(totalCount > 0) {
        
            analysis.totalSwitches = totalCount;
        
        }
            analysis.averageTime = totalTime / totalCount; }
        }
        
        // 一般的な切り替えパターン
        const sortedSwitches = Array.from(switchCounts.entries();
            .sort(([,a], [,b]) => b - a);
            .slice(0, 5);
        
        analysis.commonSwitchPatterns = sortedSwitches.map(([pattern, count]) => ({ pattern,
            count);
            percentage: (count / totalCount) * 100 ,});
        return analysis;
    }
    
    /**
     * レンダリング性能の分析
     */''
    private analyzeRenderingPerformance()';
        const renderMeasurements = this.metrics.renderingTimes.get('ui_update) || [];
        const validMeasurements = renderMeasurements.filter(m => m.success);
        
        if (validMeasurements.length === 0) { return analysis; }
        
        const totalTime = validMeasurements.reduce((sum, m) => sum + m.duration, 0);
        const droppedFrames = validMeasurements.filter(m => m.duration > this.thresholds.renderingTime).length;
        
        analysis.totalRenders = validMeasurements.length;
        analysis.averageTime = totalTime / validMeasurements.length;
        analysis.averageFPS = 1000 / analysis.averageTime;
        analysis.droppedFrames = droppedFrames;
        
        return analysis;
    }
    
    /**
     * メモリトレンドの分析
     */
    private analyzeMemoryTrends(): MemoryTrendAnalysis { const memoryData = Array.from(this.metrics.memoryUsage.values();

        if(memoryData.length < 2) {' }'

            return { trend: 'insufficient_data' }

        const recent = memoryData.slice(-10); // 最新10データポイント
        const initial = recent[0].used;
        const final = recent[recent.length - 1].used;

        const trend = final > initial ? 'increasing' : 'decreasing';
        const changeRate = ((final - initial) / initial) * 100;
        
        return { trend,
            changeRate: Math.abs(changeRate);
            currentUsage: final;
           , maxUsage: Math.max(...recent.map(d = > d.used ,};
            minUsage: Math.min(...recent.map(d => d.used); }
        }
    
    /**
     * 推奨事項の生成
     */
    private generateRecommendations(analysis: PerformanceAnalysis): PerformanceRecommendation[] { const recommendations: PerformanceRecommendation[] = [],
        // 翻訳性能の推奨事項
        if(analysis.translationPerformance.averageTime > this.thresholds.translationTime) {'
            recommendations.push({''
                type: 'translation',
                severity: 'medium',)';
                message: 'Translation performance is below threshold. Consider caching frequently used translations.',' }

                action: 'enable_translation_cache'); }
        }
        ';
        // 言語切り替え性能の推奨事項
        if(analysis.languageSwitchPerformance.averageTime > this.thresholds.languageSwitchTime) { '
            recommendations.push({''
                type: 'language_switch',
                severity: 'high',)';
                message: 'Language switching is slow. Consider preloading common languages.',' }

                action: 'enable_language_preload'); }
        }
        ';
        // レンダリング性能の推奨事項
        if(analysis.renderingPerformance.averageFPS < 60) { '
            recommendations.push({''
                type: 'rendering',
                severity: 'high',)';
                message: 'Rendering performance is below 60 FPS. Optimize UI updates.',' }

                action: 'optimize_rendering')'); }
        }
        ';
        // メモリ使用量の推奨事項
        if(analysis.memoryTrends.trend === 'increasing' && analysis.memoryTrends.changeRate && analysis.memoryTrends.changeRate > 10) { '
            recommendations.push({''
                type: 'memory',
                severity: 'medium',)';
                message: 'Memory usage is increasing. Consider garbage collection.',' }

                action: 'memory_cleanup'); }
        }
        
        analysis.recommendations = recommendations;
        return recommendations;
    }
    
    /**
     * 自動最適化の実行
     */
    private optimizeIfNeeded(): void { if (!this.autoOptimization.enabled) return;
        
        const analysis = this.analyzePerformance();
        
        for(const, recommendation of, analysis.recommendations) {
        
            if(this.shouldAutoOptimize(recommendation) {
        
        }
                this.executeOptimization(recommendation); }
}
    }
    
    /**
     * 自動最適化の判定'
     */''
    private shouldAutoOptimize(recommendation: PerformanceRecommendation): boolean { // 高い重要度のもののみ自動実行
        if (recommendation.severity !== 'high'') return false;
        ';
        // メモリクリーンアップは自動実行
        if(recommendation.action === 'memory_cleanup' && this.autoOptimization.memoryCleanup) {
            
        }
            return true;
        ';
        // キャッシュ最適化は自動実行
        if (recommendation.action === 'enable_translation_cache' && this.autoOptimization.cacheOptimization) { return true; }
        
        return false;
    }
    
    /**
     * 最適化の実行
     */
    private executeOptimization(recommendation: PerformanceRecommendation): void { console.log(`Executing, auto-optimization: ${recommendation.action)`),

        try {'
            switch(recommendation.action) {'

                case 'memory_cleanup':'';
                    this.performMemoryCleanup()';
                case 'enable_translation_cache':};
                    this.optimizeTranslationCache(};
                    break;
            }
                default: }
                    console.warn(`Unknown, optimization action: ${recommendation.action}`});
            }
            
            this.statistics.optimizations++;
            
        } catch (error) {
            console.error(`Optimization failed: ${recommendation.action}`, error);
        }
    }
    
    /**
     * メモリクリーンアップの実行
     */
    private performMemoryCleanup(): void { // ガベージコレクションのヒント
        if(window.gc) {
            
        }
            window.gc(); }
        }
        
        // 古いメトリクスデータの削除
        const oneHourAgo = Date.now() - 3600000;
        
        for(const, metricMap of, Object.values(this.metrics) {
        
            if (metricMap, instanceof Map) {
                for (const [key, value] of metricMap) {
                    if(Array.isArray(value) {
                        // 配列データの場合、古いエントリを削除
                        const recentEntries = value.filter(entry => );
                            !entry.timestamp || entry.timestamp > oneHourAgo);

        }

                        metricMap.set(key, recentEntries); }
}
            }
        }

        console.log('Memory, cleanup completed');
    }
    
    /**
     * 翻訳キャッシュの最適化'
     */''
    private optimizeTranslationCache()';
        console.log('Translation, cache optimization, completed);
    }
    
    /**
     * パフォーマンス問題の記録
     */
    private recordPerformanceIssue(type: string, details: PerformanceIssueDetails): void { const issue: PerformanceAlert = {
            type,
            details,
            timestamp: Date.now();
           , severity: this.calculateSeverity(type, details };
        
        this.alerts.performance.push(issue);
        this.statistics.performanceIssues++;
        
        // アラートの最大数制限
        if(this.alerts.performance.length > 100') {
            ';

        }

            this.alerts.performance = this.alerts.performance.slice(-50); }
        }
        ';
        // 重要な問題はコンソールに出力
        if(issue.severity === 'high) {'
            
        }
            console.warn(`Performance issue detected: ${type}`, details});
        }
    }
    
    /**
     * 重要度の計算
     */'
    private calculateSeverity(type: string, details: PerformanceIssueDetails): AlertSeverity { ''
        switch(type) {'

            case 'languageSwitch':'';
                return details.duration && details.duration > this.thresholds.languageSwitchTime * 2 ? 'high' : 'medium';''
            case 'rendering':'';
                return details.fps && details.fps < 30 ? 'high' : 'medium';''
            case 'memoryGrowth':'';
                return details.growth && details.growth > this.thresholds.memoryGrowth * 2 ? 'high' : 'medium';''
            case 'slowNetwork':'';
                return details.effectiveType === 'slow-2g' ? 'high' : 'medium';

        }

            default: return 'low';
    
    /**
     * パフォーマンス統計の更新
     */
    private updatePerformanceStatistics(): void { const uptime = Date.now() - this.statistics.startTime;
        
        this.statistics.uptime = uptime;
        this.statistics.avgTranslationsPerMinute = ;
            (this.statistics.totalTranslations / (uptime / 60000)) || 0;
        this.statistics.avgSwitchesPerMinute = ;
            (this.statistics.totalLanguageSwitches / (uptime / 60000)) || 0; }
    
    /**
     * パフォーマンスレポートの生成
     */
    generatePerformanceReport(): PerformanceReport { const analysis = this.analyzePerformance();
        
        return { timestamp: Date.now(),
            uptime: Date.now() - this.statistics.startTime;
           , statistics: this.statistics;
            analysis,
            alerts: this.alerts;
           , thresholds: this.thresholds, };
            autoOptimization: this.autoOptimization }
        }
    
    /**
     * 閾値の動的調整
     */
    adjustThresholds(newThresholds: Partial<PerformanceThresholds> = { ): void {
        if(this.autoOptimization.adaptiveThresholds) {
            // 履歴データに基づく閾値の自動調整
            const analysis = this.analyzePerformance();
            
            // 翻訳時間の閾値調整
            if (analysis.translationPerformance.averageTime > 0) {
                const suggestedThreshold = analysis.translationPerformance.averageTime * 1.2;
                if (suggestedThreshold > this.thresholds.translationTime) {
        }
                    this.thresholds.translationTime = Math.min(suggestedThreshold, 50); // 最大50ms }
}
        }
        ;
        // 手動設定の適用
        Object.assign(this.thresholds, newThresholds);

        console.log('Performance thresholds updated:', this.thresholds);
    }
    
    /**
     * 設定を更新
     */'
    updateConfiguration(config: Partial<AutoOptimizationConfig>): void { ''
        Object.assign(this.autoOptimization, config);''
        console.log('Performance monitor configuration updated:', config }
    
    /**
     * 統計情報を取得
     */
    getStatistics(): PerformanceStatistics {
        return { ...this.statistics;
    }
    
    /**
     * メトリクス情報を取得
     */
    getMetrics(): PerformanceMetrics { return { translationTimes: new Map(this.metrics.translationTimes),
            languageSwitchTimes: new Map(this.metrics.languageSwitchTimes);
            renderingTimes: new Map(this.metrics.renderingTimes);
            memoryUsage: new Map(this.metrics.memoryUsage);
           , cachePerformance: new Map(this.metrics.cachePerformance), };
            networkPerformance: new Map(this.metrics.networkPerformance); }
        }
    
    /**
     * 監視の停止
     */
    stopMonitoring(): void { if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = undefined; }
        
        if(this.memoryMonitoringInterval) {
        
            clearInterval(this.memoryMonitoringInterval);
        
        }
            this.memoryMonitoringInterval = undefined; }
        }
        
        if(this.networkMonitoringInterval) {
        ';

            clearInterval(this.networkMonitoringInterval);
        
        }
            this.networkMonitoringInterval = undefined; }
        }

        console.log('I18n, Performance Monitor, stopped);
    }
    
    /**
     * クリーンアップ
     */
    cleanup(): void { this.stopMonitoring();
        
        // データのクリア
        for(const, metricMap of, Object.values(this.metrics') {
            ';

        }

            metricMap.clear(') }'