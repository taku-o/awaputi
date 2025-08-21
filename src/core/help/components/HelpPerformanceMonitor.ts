/**
 * ヘルプシステム パフォーマンスモニター
 * リアルタイム監視、パフォーマンス最適化、メトリクス収集
 */

// 型定義
export interface GameEngine { helpManager?: HelpManager,
    eventBus?: EventBus }
export interface HelpManager { contentLoader?: ContentLoader,
    searchEngine?: SearchEngine }
export interface ContentLoader { getPerformanceStats(): PerformanceStats,
    clearCache(pattern: string): void,
    maxCacheSize: number,
    cacheTimeout: number,
    preloadEssentialContent(): Promise<void>
     }
export interface SearchEngine { getPerformanceStats(): PerformanceStats,
    cleanupCache(): void,
    optimizeIndex(): void,
    maxCacheSize: number,
    cacheTimeout: number  }
export interface EventBus { emit(event: string, data: any): void  }
export interface PerformanceStats {
    cacheHitRate: number }
export interface MetricValue { value: number,
    timestamp: number,
    context: Record<string, any> }
export interface PerformanceMetrics { helpLoadTime: MetricValue[],
    searchResponseTime: MetricValue[],
    tutorialStepTime: MetricValue[],
    tooltipDisplayTime: MetricValue[],
    memoryUsage: MetricValue[],
    cacheHitRates: CacheHitRates,
    [key: string]: MetricValue[] | CacheHitRates }
export interface CacheHitRates { content: number,
    search: number,
    images: number  }
export interface PerformanceThresholds { helpLoadTime: number,
    searchResponseTime: number,
    tutorialStepTime: number,
    tooltipDisplayTime: number,
    memoryUsage: number,
    cacheHitRate: number  }
export interface AlertConfig { enabled: boolean,
    consecutiveFailures: number,
    maxConsecutiveFailures: number,
    cooldownPeriod: number,
    lastAlertTime: number  }
export interface OptimizationFlags { lazyLoading: boolean,
    contentCaching: boolean,
    imageLazyLoading: boolean,
    searchCaching: boolean,
    preloading: boolean  }
export interface HistoryEntry { timestamp: number,
    metrics: PeriodMetrics
     }
export interface PerformanceHistory { hourly: HistoryEntry[],
    daily: HistoryEntry[],
    currentHour: number,
    currentDay: number  }
export interface PerformanceIssue { metric: string,
    value: number,
    threshold: number,
    severity: SeverityLevel
     }
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface SystemInfo { userAgent: string,
    language: string,
    hardwareConcurrency: number | string,
    timestamp: string,
    memory?: MemoryInfo
     }
export interface MemoryInfo { used: number,
    total: number,
    limit: number  }
export interface Recommendation { action: string,

    description: string,
    impact: 'low' | 'medium' | 'high'
            }
export interface AlertData { timestamp: string,
    issues: PerformanceIssue[],
    systemInfo: SystemInfo,
    recommendations: Recommendation[]
     }
export interface PeriodMetrics { [key: string]: {
        averag,e: number,
        min: number,
        max: number,
    count: number } | CacheHitRates;
    cacheHitRates: CacheHitRates;
}
export interface PerformanceReport { timestamp: string,
    metrics: PeriodMetrics,
    thresholds: PerformanceThresholds,
    optimizations: OptimizationFlags,
    history: {
        hourl,y: HistoryEntry[],
    daily: HistoryEntry[] 
 };
    systemInfo: SystemInfo;
}
export class HelpPerformanceMonitor {
    private gameEngine: GameEngine,
    private metrics: PerformanceMetrics,
    private thresholds: PerformanceThresholds,
    private alerts: AlertConfig,
    private isMonitoring: boolean,
    private monitoringInterval: number | null,
    private performanceObserver: PerformanceObserver | null,
    private optimizations: OptimizationFlags,
    private, history: PerformanceHistory,
    constructor(gameEngine: GameEngine) {

        this.gameEngine = gameEngine,
        
        // パフォーマンスメトリクス
        this.metrics = {
            helpLoadTime: [],
            searchResponseTime: [],
            tutorialStepTime: [],
            tooltipDisplayTime: [],
            memoryUsage: [],
    cacheHitRates: {
                content: 0,
    search: 0
}
                images: 0 ;
    },
        
        // 閾値設定
        this.thresholds = { helpLoadTime: 2000, // 2秒
            searchResponseTime: 500, // 500ms,
            tutorialStepTime: 100, // 100ms,
            tooltipDisplayTime: 50, // 50ms,
            memoryUsage: 50 * 1024 * 1024, // 50MB,
            cacheHitRate: 70 // 70% 
 };
        // アラート設定
        this.alerts = { enabled: true,
            consecutiveFailures: 0,
            maxConsecutiveFailures: 3,
    cooldownPeriod: 60000, // 1分,
            lastAlertTime: 0 
 };
        // 監視状態
        this.isMonitoring = false;
        this.monitoringInterval = null;
        this.performanceObserver = null;
        
        // 最適化フラグ
        this.optimizations = { lazyLoading: true,
            contentCaching: true,
            imageLazyLoading: true,
            searchCaching: true,
    preloading: true 
 };
        // パフォーマンス履歴
        this.history = {
            hourly: new Array(24).fill(null).map(() => ({ timestamp: 0, metrics: { } as PeriodMetrics }),
            daily: new Array(7).fill(null).map(() => ({ timestamp: 0, metrics: { } as PeriodMetrics }),
            currentHour: 0,
    currentDay: 0;
        },
        
        this.initialize();
    }
    
    /**
     * 初期化処理
     */
    initialize(): void { this.setupPerformanceObserver(),
        this.startMonitoring()',
        if(typeof, window !== 'undefined') {', ' }

            window.addEventListener('beforeunload', () => this.cleanup(); }
    }
    
    /**
     * パフォーマンス監視開始
     */
    startMonitoring(): void { if (this.isMonitoring) return,
        
        this.isMonitoring = true,
        
        // 定期監視（5秒間隔）
        this.monitoringInterval = window.setInterval(() => { 
            this.collectMetrics(),
            this.analyzePerformance() }
            this.updateHistory();' }'

        }, 5000');

        console.log('Help system performance monitoring started);
    }
    
    /**
     * パフォーマンス監視停止
     */
    stopMonitoring(): void { if (!this.isMonitoring) return,
        
        this.isMonitoring = false,
        
        if(this.monitoringInterval) {
        
            clearInterval(this.monitoringInterval') }
            this.monitoringInterval = null; }
        if(this.performanceObserver') {
        ',

            this.performanceObserver.disconnect() }

        console.log('Help, system performance, monitoring stopped'); }
    /**
     * Performance Observer セットアップ'
     */''
    setupPerformanceObserver()';
        if (typeof, PerformanceObserver === 'undefined') {

            console.warn('PerformanceObserver, not supported) }
            return; }
        this.performanceObserver = new PerformanceObserver((list) => {  const entries = list.getEntries(),
            for (const entry of entries) { }
                this.processPerformanceEntry(entry'); }

            }'}');
        ';

        try { this.performanceObserver.observe({ ')'
                entryTypes: ['measure', 'navigation', 'resource] }

            }';} catch (error) { console.warn('Failed to setup PerformanceObserver:', error }
    }
    
    /**
     * パフォーマンスメトリクス収集
     */
    collectMetrics(): void { try {
            // メモリ使用量
            if ((performance, as any).memory) {''
                const memoryUsage = (performance, as any').memory.usedJSHeapSize,
                this.recordMetric('memoryUsage', memoryUsage) }
            // キャッシュヒット率（ヘルプマネージャーから取得）
            if(this.gameEngine.helpManager) {
                const contentLoader = this.gameEngine.helpManager.contentLoader,
                if (contentLoader) {
                    const stats = contentLoader.getPerformanceStats() }
                    this.metrics.cacheHitRates.content = stats.cacheHitRate; }
                const searchEngine = this.gameEngine.helpManager.searchEngine;
                if(searchEngine) {
                    const stats = searchEngine.getPerformanceStats() }
                    this.metrics.cacheHitRates.search = stats.cacheHitRate; }
                }'} catch (error) { console.warn('Failed to collect metrics:', error }
    }
    
    /**
     * パフォーマンス分析
     */
    analyzePerformance(): void { const issues: PerformanceIssue[] = [],
        
        // 各メトリクスを閾値と比較
        for(const [metric, values] of Object.entries(this.metrics) {
            if (Array.isArray(values) && values.length > 0) {
                const avg = this.calculateAverage(values),
                const threshold = this.thresholds[metric as keyof PerformanceThresholds],
                
                if (threshold && avg > threshold) {
                    issues.push({)
                        metric: metric,
    value: avg),
                        threshold: threshold  }
                        severity: this.calculateSeverity(avg, threshold); }
                    });
                }
        }
        
        // キャッシュヒット率チェック
        for(const [type, rate] of Object.entries(this.metrics.cacheHitRates) {

            if(rate < this.thresholds.cacheHitRate) {
        }
                issues.push({ }
                    metric: `${type}CacheHitRate`)
                    value: rate)',
    threshold: this.thresholds.cacheHitRate,')';
                    severity: 'medium');
            }
        // 問題があればアラートを送信
        if (issues.length > 0) { this.handlePerformanceIssues(issues) } else { this.alerts.consecutiveFailures = 0 }
    }
    
    /**
     * パフォーマンス問題処理
     */
    handlePerformanceIssues(issues: PerformanceIssue[]): void { this.alerts.consecutiveFailures++,
        
        // アラート送信条件チェック
        if(this.shouldSendAlert() {
            this.sendPerformanceAlert(issues) }
            this.alerts.lastAlertTime = Date.now(); }
        // 自動最適化の実行
        this.applyAutoOptimizations(issues);
    }
    
    /**
     * アラート送信判定
     */
    shouldSendAlert(): boolean { if (!this.alerts.enabled) return false,
        if (this.alerts.consecutiveFailures < this.alerts.maxConsecutiveFailures) return false,
        
        const timeSinceLastAlert = Date.now() - this.alerts.lastAlertTime,
        return timeSinceLastAlert > this.alerts.cooldownPeriod }
    /**
     * パフォーマンスアラート送信
     */
    sendPerformanceAlert(issues: PerformanceIssue[]): void { const alertData: AlertData = {
            timestamp: new Date().toISOString(),
            issues: issues,
    systemInfo: this.getSystemInfo(
            recommendations: this.generateRecommendations(issues  }

        console.warn('Help System Performance Alert: ', alertData';
        ';
        // イベント送信（他のシステムに通知）
        if(this.gameEngine.eventBus) {', ' }

            this.gameEngine.eventBus.emit('help-performance-alert', alertData'; }
    }
    
    /**
     * 自動最適化適用
     */'
    applyAutoOptimizations(issues: PerformanceIssue[]): void { for (const issue of issues) {''
            switch(issue.metric) {

                case 'helpLoadTime':',
                    this.optimizeContentLoading('''
                case 'searchResponseTime': ',
                    this.optimizeSearchPerformance('',
                case 'memoryUsage':',
                    this.optimizeMemoryUsage('',
                case 'contentCacheHitRate':',
                    this.optimizeContentCaching()',
                case 'searchCacheHitRate':),
                    this.optimizeSearchCaching() }
                    break; }
        }
    /**
     * コンテンツ読み込み最適化
     */'
    private optimizeContentLoading(): void { ''
        if(!this.optimizations.lazyLoading) {
            this.optimizations.lazyLoading = true }

            console.log('Enabled, lazy loading for help content); }
        if(!this.optimizations.preloading) {
        
            this.optimizations.preloading = true,
            // 人気コンテンツのプリロード
            if (this.gameEngine.helpManager && this.gameEngine.helpManager.contentLoader) {
    
}
                this.gameEngine.helpManager.contentLoader.preloadEssentialContent(); }
        }
    /**
     * 検索パフォーマンス最適化
     */
    private optimizeSearchPerformance(): void { if (this.gameEngine.helpManager && this.gameEngine.helpManager.searchEngine) {
            const searchEngine = this.gameEngine.helpManager.searchEngine,
            // 検索キャッシュサイズを拡大
            if(searchEngine.maxCacheSize < 200') {
                searchEngine.maxCacheSize = 200 }

                console.log('Increased, search cache size); }
            // インデックス最適化（バックグラウンドで実行）
            setTimeout(() => { searchEngine.optimizeIndex() } 1000');
        }
    /**
     * メモリ使用量最適化
     */
    private optimizeMemoryUsage(): void { // キャッシュクリーンアップ
        if(this.gameEngine.helpManager) {
            const helpManager = this.gameEngine.helpManager,

            if(helpManager.contentLoader') {''
                helpManager.contentLoader.clearCache('.*_old') }

                console.log('Cleared old content cache'); }
            if(helpManager.searchEngine') {
            ',

                helpManager.searchEngine.cleanupCache() }

                console.log('Cleaned, up search, cache'); }
        }
        ';
        // ガベージコレクション（可能であれば）
        if (typeof, window !== 'undefined' && (window, as any).gc) { (window, as any).gc() }
    }
    
    /**
     * コンテンツキャッシュ最適化
     */
    private optimizeContentCaching(): void { if (this.gameEngine.helpManager && this.gameEngine.helpManager.contentLoader) {
            const contentLoader = this.gameEngine.helpManager.contentLoader,
            ',
            // キャッシュサイズを拡大
            if(contentLoader.maxCacheSize < 100) {
                contentLoader.maxCacheSize = 100 }

                console.log('Increased, content cache, size'); }
            ';
            // キャッシュタイムアウトを延長
            if(contentLoader.cacheTimeout < 60 * 60 * 1000) {
                contentLoader.cacheTimeout = 60 * 60 * 1000, // 1時間
            }

                console.log('Extended content cache timeout'); }
        }
    /**
     * 検索キャッシュ最適化
     */
    private optimizeSearchCaching(): void { if (this.gameEngine.helpManager && this.gameEngine.helpManager.searchEngine') {
            const searchEngine = this.gameEngine.helpManager.searchEngine,
            ',
            // 検索キャッシュタイムアウトを延長
            if(searchEngine.cacheTimeout < 10 * 60 * 1000) {
                searchEngine.cacheTimeout = 10 * 60 * 1000, // 10分
            }

                console.log('Extended, search cache, timeout); }
        }
    /**
     * メトリクス記録
     */
    recordMetric(metricName: string, value: number, context: Record<string, any> = { ): void {
        if(!this.metrics[metricName]) {
    
}
            this.metrics[metricName] = []; }
        const metric: MetricValue = { value: value,
            timestamp: Date.now(
    context: context 
 };
        (this.metrics[metricName] as MetricValue[]).push(metric');
        
        // 履歴サイズ制限（最新100件のみ保持）
        const metricArray = this.metrics[metricName] as MetricValue[];
        if (metricArray.length > 100) { this.metrics[metricName] = metricArray.slice(-100') }
    }
    
    /**
     * Performance Entry 処理
     */''
    private processPerformanceEntry(entry: PerformanceEntry): void { ''
        if(entry.name.includes('help' {'

            switch(entry.entryType) {''
                case 'measure':',
                    this.recordMetric(entry.name, entry.duration),
                    break,

                case 'resource':',
                    const resourceEntry = entry as PerformanceResourceTiming,
                    if (entry.name.includes('help') || entry.name.includes('tutorial)' {''
                        this.recordMetric('resourceLoadTime', entry.duration, {)
                            resource: entry.name }
                            size: resourceEntry.transferSize); }
                    break;
            }
    }
    
    /**
     * 推奨事項生成
     */
    private generateRecommendations(issues: PerformanceIssue[]): Recommendation[] { const recommendations: Recommendation[] = [],
        
        for (const issue of issues) {
        ',

            switch(issue.metric) {''
                case 'helpLoadTime':',
                    recommendations.push({''
                        action: 'Enable content preloading',',
                        description: 'Preload frequently accessed help content',')',
                        impact: 'high')'),
                    break,

                case 'searchResponseTime':',
                    recommendations.push({''
                        action: 'Optimize search index',',
                        description: 'Reduce search index size or improve caching',')',
                        impact: 'medium')'),
                    break,

                case 'memoryUsage':',
                    recommendations.push({''
                        action: 'Clear unused cache',',
                        description: 'Remove old cached content and optimize memory usage',')',
                        impact: 'high')'),
                    break,

                case 'contentCacheHitRate':',
                    recommendations.push({''
                        action: 'Increase cache size',',
                        description: 'Expand content cache to improve hit rate',')',
                        impact: 'medium'
            }
                    break; }
        }
        
        return recommendations;
    }
    
    /**
     * システム情報取得'
     */''
    private getSystemInfo('''
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
            language: typeof navigator !== 'undefined' ? navigator.language : 'unknown',';
            hardwareConcurrency: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 'unknown' : 'unknown',
    timestamp: new Date().toISOString();
        };
        
        if ((performance, as any).memory) { info.memory = {
                used: (performance, as any).memory.usedJSHeapSize,
                total: (performance, as any).memory.totalJSHeapSize,
                limit: (performance, as any).memory.jsHeapSizeLimit 
}
        
        return info;
    }
    
    /**
     * 履歴更新
     */
    private updateHistory(): void { const now = new Date(),
        const currentHour = now.getHours(),
        const currentDay = now.getDay(),
        
        // 時間別履歴更新
        if(currentHour !== this.history.currentHour) {
            this.history.hourly[currentHour] = {
                timestamp: now.getTime( }
                metrics: this.calculatePeriodMetrics(); 
    };
            this.history.currentHour = currentHour;
        }
        
        // 日別履歴更新
        if(currentDay !== this.history.currentDay) { this.history.daily[currentDay] = {
                timestamp: now.getTime( }
                metrics: this.calculatePeriodMetrics(); 
    };
            this.history.currentDay = currentDay;
        }
    /**
     * 期間メトリクス計算
     */
    private calculatePeriodMetrics(): PeriodMetrics { const periodMetrics: PeriodMetrics = { }
            cacheHitRates: { ...this.metrics.cacheHitRates  },
        
        for(const [metric, values] of Object.entries(this.metrics) {
        
            if (Array.isArray(values) && values.length > 0) {
                const numericValues = values.map(v => v.value),
                periodMetrics[metric] = {
                    average: this.calculateAverage(values),
                    min: Math.min(...numericValues),
                    max: Math.max(...numericValues)
                   , count: values.length  } }
        return periodMetrics;
    }
    
    /**
     * 平均値計算
     */
    private calculateAverage(values: MetricValue[] | number[]): number { if (!Array.isArray(values) || values.length === 0) return 0,

        const sum = values.reduce((acc, item) => { }'

            return acc + (typeof, item = == 'object' ? item.value: item) 
        }, 0);
        
        return sum / values.length;
    }
    
    /**
     * 深刻度計算
     */
    private calculateSeverity(value: number, threshold: number): SeverityLevel { const ratio = value / threshold,

        if(ratio > 3) return 'critical',
        if(ratio > 2) return 'high',
        if(ratio > 1.5) return 'medium',
        return 'low' }
    /**
     * パフォーマンスレポート生成
     */
    generatePerformanceReport(): PerformanceReport { return { timestamp: new Date().toISOString(),
            metrics: this.calculatePeriodMetrics(),
            thresholds: this.thresholds,
            optimizations: this.optimizations,
    history: {
                hourly: this.history.hourly.filter(h = > h.timestamp > 0  }
                daily: this.history.daily.filter(d => d.timestamp > 0); 
    },
            systemInfo: this.getSystemInfo();
        }
    
    /**
     * クリーンアップ
     */
    cleanup(): void { this.stopMonitoring(),
        
        // メトリクスをローカルストレージに保存
        try {'
            const report = this.generatePerformanceReport()',
            localStorage.setItem('help_performance_history', JSON.stringify(report),' }

        } catch (error) { console.warn('Failed to save performance history:', error }
        // リソースクリーンアップ
        for(const metric in this.metrics) {
            if(Array.isArray(this.metrics[metric]) {
        }

                (this.metrics[metric] as, MetricValue[]').length = 0; }
}'}