/**
 * 設定システム専用デバッグ機能
 * 
 * 設定値の使用状況追跡機能を実装し、
 * デバッグモードでの詳細情報表示を提供します。
 */

import { getLoggingSystem } from './LoggingSystem';

/**
 * 使用状況追跡データ
 */
interface UsageTracking {
    accessCount: Map<string, number>;
    accessHistory: AccessRecord[];
    accessPatterns: Map<string, AccessPattern>;
    hotKeys: Set<string>;
    unusedKeys: Set<string>;
    lastAccess: Map<string, number>;
}

/**
 * アクセス記録
 */
interface AccessRecord {
    timestamp: number;
    category: string;
    key: string;
    fullKey: string;
    value: any;
    source: string;
    accessTime: number;
    fromCache: boolean;
}

/**
 * アクセスパターン
 */
interface AccessPattern {
    count: number;
    firstAccess: number;
    lastAccess: number;
    intervals: number[];
}

/**
 * パフォーマンス追跡データ
 */
interface PerformanceTracking {
    accessTimes: Map<string, number[]>;
    slowAccesses: SlowAccessRecord[];
    cacheHitRates: Map<string, CacheHitRate>;
    validationTimes: Map<string, number>;
}

/**
 * 遅いアクセス記録
 */
interface SlowAccessRecord {
    timestamp: number;
    fullKey: string;
    accessTime: number;
    fromCache: boolean;
}

/**
 * キャッシュヒット率
 */
interface CacheHitRate {
    total: number;
    hits: number;
}

/**
 * エラー追跡データ
 */
interface ErrorTracking {
    errorsByKey: Map<string, ErrorRecord[]>;
    errorPatterns: Map<string, number>;
    recoverySuccess: Map<string, RecoveryStats>;
    criticalErrors: CriticalErrorRecord[];
}

/**
 * エラー記録
 */
interface ErrorRecord {
    timestamp: number;
    errorType: string;
    errorMessage: string;
    recovered: boolean;
}

/**
 * 復旧統計
 */
interface RecoveryStats {
    total: number;
    recovered: number;
}

/**
 * 重要なエラー記録
 */
interface CriticalErrorRecord {
    timestamp: number;
    fullKey: string;
    errorType: string;
    errorMessage: string;
    recovered: boolean;
}

/**
 * デバッグ設定
 */
interface DebugConfig {
    enabled: boolean;
    trackUsage: boolean;
    trackPerformance: boolean;
    trackErrors: boolean;
    maxHistorySize: number;
    slowAccessThreshold: number;
    hotKeyThreshold: number;
    reportInterval: number;
}

/**
 * 統計情報
 */
interface Statistics {
    totalAccesses: number;
    uniqueKeys: number;
    averageAccessTime: number;
    errorRate: number;
    cacheHitRate: number;
    lastReset: number;
}

/**
 * レポートオプション
 */
export interface ReportOptions {
    includeUsage?: boolean;
    includePerformance?: boolean;
    includeErrors?: boolean;
    includeStatistics?: boolean;
    topN?: number;
}

/**
 * キー詳細情報
 */
export interface KeyDetails {
    fullKey: string;
    accessCount: number;
    lastAccess: number | undefined;
    isHotKey: boolean;
    isUnused: boolean;
    errors: ErrorRecord[];
    averageAccessTime: number;
    cacheHitRate: number;
}

export class ConfigurationDebugger {
    private usageTracking: UsageTracking;
    private performanceTracking: PerformanceTracking;
    private errorTracking: ErrorTracking;
    private debugConfig: DebugConfig;
    private statistics: Statistics;
    private logger: any;
    private reportTimer: NodeJS.Timeout | null = null;

    constructor() {
        // 使用状況追跡
        this.usageTracking = {
            accessCount: new Map(),
            accessHistory: [],
            accessPatterns: new Map(),
            hotKeys: new Set(),
            unusedKeys: new Set(),
            lastAccess: new Map()
        };
        
        // パフォーマンス追跡
        this.performanceTracking = {
            accessTimes: new Map(),
            slowAccesses: [],
            cacheHitRates: new Map(),
            validationTimes: new Map()
        };
        
        // エラー追跡
        this.errorTracking = {
            errorsByKey: new Map(),
            errorPatterns: new Map(),
            recoverySuccess: new Map(),
            criticalErrors: []
        };
        
        // デバッグ設定
        this.debugConfig = {
            enabled: this._isDebugMode(),
            trackUsage: true,
            trackPerformance: true,
            trackErrors: true,
            maxHistorySize: 1000,
            slowAccessThreshold: 10, // ms
            hotKeyThreshold: 10, // アクセス回数
            reportInterval: 60000 // 1分間隔
        };
        
        // 統計情報
        this.statistics = {
            totalAccesses: 0,
            uniqueKeys: 0,
            averageAccessTime: 0,
            errorRate: 0,
            cacheHitRate: 0,
            lastReset: Date.now()
        };
        
        // ロギングシステム
        this.logger = getLoggingSystem();
        
        // 初期化
        this._initialize();
    }
    
    /**
     * 初期化処理
     */
    private _initialize(): void {
        if (this.debugConfig.enabled) {
            this._setupPeriodicReporting();
            this._setupPerformanceMonitoring();
            this.logger.info('ConfigurationDebugger initialized', {
                config: this.debugConfig
            }, 'ConfigurationDebugger');
        }
    }
    
    /**
     * デバッグモードの判定
     */
    private _isDebugMode(): boolean {
        return process?.env?.NODE_ENV === 'development' ||
               typeof window !== 'undefined' && window.location.search.includes('debug=true') ||
               localStorage.getItem('configDebug') === 'true';
    }
    
    /**
     * 定期レポートの設定
     */
    private _setupPeriodicReporting(): void {
        if (this.debugConfig.reportInterval > 0) {
            this.reportTimer = setInterval(() => {
                this.generatePerformanceReport();
            }, this.debugConfig.reportInterval);
        }
    }
    
    /**
     * パフォーマンス監視の設定
     */
    private _setupPerformanceMonitoring(): void {
        // ブラウザのパフォーマンス監視
        if (typeof window !== 'undefined' && window.performance) {
            // パフォーマンス観察を設定
            this._observePerformance();
        }
    }
    
    /**
     * パフォーマンス観察
     */
    private _observePerformance(): void {
        try {
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    for (const entry of entries) {
                        if (entry.name.includes('config')) {
                            this._recordPerformanceEntry(entry);
                        }
                    }
                });
                observer.observe({ entryTypes: ['measure'] });
            }
        } catch (error) {
            this.logger.warn('Performance observation setup failed', error, 'ConfigurationDebugger');
        }
    }
    
    /**
     * パフォーマンスエントリの記録
     */
    private _recordPerformanceEntry(entry: PerformanceEntry): void {
        const duration = entry.duration;
        if (duration > this.debugConfig.slowAccessThreshold) {
            this.performanceTracking.slowAccesses.push({
                timestamp: Date.now(),
                fullKey: entry.name,
                accessTime: duration,
                fromCache: false
            });
        }
    }
    
    /**
     * アクセスの記録
     */
    recordAccess(category: string, key: string, value: any, accessTime: number, fromCache: boolean = false): void {
        if (!this.debugConfig.enabled || !this.debugConfig.trackUsage) return;
        
        const fullKey = `${category}.${key}`;
        const timestamp = Date.now();
        
        // アクセス回数の更新
        const currentCount = this.usageTracking.accessCount.get(fullKey) || 0;
        this.usageTracking.accessCount.set(fullKey, currentCount + 1);
        
        // 最後のアクセス時刻の更新
        this.usageTracking.lastAccess.set(fullKey, timestamp);
        
        // アクセス履歴の追加
        const accessRecord: AccessRecord = {
            timestamp,
            category,
            key,
            fullKey,
            value,
            source: fromCache ? 'cache' : 'source',
            accessTime,
            fromCache
        };
        
        this.usageTracking.accessHistory.push(accessRecord);
        
        // 履歴サイズの制限
        if (this.usageTracking.accessHistory.length > this.debugConfig.maxHistorySize) {
            this.usageTracking.accessHistory.shift();
        }
        
        // アクセスパターンの更新
        this._updateAccessPattern(fullKey, timestamp);
        
        // パフォーマンスデータの記録
        if (this.debugConfig.trackPerformance) {
            this._recordPerformance(fullKey, accessTime, fromCache);
        }
        
        // ホットキーの更新
        if (currentCount + 1 >= this.debugConfig.hotKeyThreshold) {
            this.usageTracking.hotKeys.add(fullKey);
        }
        
        // 統計の更新
        this._updateStatistics();
    }
    
    /**
     * アクセスパターンの更新
     */
    private _updateAccessPattern(fullKey: string, timestamp: number): void {
        let pattern = this.usageTracking.accessPatterns.get(fullKey);
        
        if (!pattern) {
            pattern = {
                count: 0,
                firstAccess: timestamp,
                lastAccess: timestamp,
                intervals: []
            };
            this.usageTracking.accessPatterns.set(fullKey, pattern);
        }
        
        // インターバルの記録
        if (pattern.count > 0) {
            const interval = timestamp - pattern.lastAccess;
            pattern.intervals.push(interval);
        }
        
        pattern.count++;
        pattern.lastAccess = timestamp;
    }
    
    /**
     * パフォーマンスの記録
     */
    private _recordPerformance(fullKey: string, accessTime: number, fromCache: boolean): void {
        // アクセス時間の記録
        let times = this.performanceTracking.accessTimes.get(fullKey);
        if (!times) {
            times = [];
            this.performanceTracking.accessTimes.set(fullKey, times);
        }
        times.push(accessTime);
        
        // 遅いアクセスの記録
        if (accessTime > this.debugConfig.slowAccessThreshold) {
            this.performanceTracking.slowAccesses.push({
                timestamp: Date.now(),
                fullKey,
                accessTime,
                fromCache
            });
        }
        
        // キャッシュヒット率の更新
        this._updateCacheHitRate(fullKey, fromCache);
    }
    
    /**
     * キャッシュヒット率の更新
     */
    private _updateCacheHitRate(fullKey: string, fromCache: boolean): void {
        let hitRate = this.performanceTracking.cacheHitRates.get(fullKey);
        if (!hitRate) {
            hitRate = { total: 0, hits: 0 };
            this.performanceTracking.cacheHitRates.set(fullKey, hitRate);
        }
        
        hitRate.total++;
        if (fromCache) {
            hitRate.hits++;
        }
    }
    
    /**
     * エラーの記録
     */
    recordError(fullKey: string, errorType: string, errorMessage: string, recovered: boolean = false): void {
        if (!this.debugConfig.enabled || !this.debugConfig.trackErrors) return;
        
        const errorRecord: ErrorRecord = {
            timestamp: Date.now(),
            errorType,
            errorMessage,
            recovered
        };
        
        // エラーの記録
        let errors = this.errorTracking.errorsByKey.get(fullKey);
        if (!errors) {
            errors = [];
            this.errorTracking.errorsByKey.set(fullKey, errors);
        }
        errors.push(errorRecord);
        
        // エラーパターンの更新
        const currentCount = this.errorTracking.errorPatterns.get(errorType) || 0;
        this.errorTracking.errorPatterns.set(errorType, currentCount + 1);
        
        // 復旧統計の更新
        this._updateRecoveryStats(fullKey, recovered);
        
        // 重要なエラーの記録
        if (errorType === 'critical' || errorType === 'validation_failed') {
            this.errorTracking.criticalErrors.push({
                timestamp: Date.now(),
                fullKey,
                errorType,
                errorMessage,
                recovered
            });
        }
        
        this.logger.error('Configuration error recorded', {
            fullKey,
            errorType,
            errorMessage,
            recovered
        }, 'ConfigurationDebugger');
    }
    
    /**
     * 復旧統計の更新
     */
    private _updateRecoveryStats(fullKey: string, recovered: boolean): void {
        let stats = this.errorTracking.recoverySuccess.get(fullKey);
        if (!stats) {
            stats = { total: 0, recovered: 0 };
            this.errorTracking.recoverySuccess.set(fullKey, stats);
        }
        
        stats.total++;
        if (recovered) {
            stats.recovered++;
        }
    }
    
    /**
     * 統計情報の更新
     */
    private _updateStatistics(): void {
        this.statistics.totalAccesses++;
        this.statistics.uniqueKeys = this.usageTracking.accessCount.size;
        
        // 平均アクセス時間の計算
        let totalTime = 0;
        let totalCount = 0;
        this.performanceTracking.accessTimes.forEach((times) => {
            totalTime += times.reduce((sum, time) => sum + time, 0);
            totalCount += times.length;
        });
        this.statistics.averageAccessTime = totalCount > 0 ? totalTime / totalCount : 0;
        
        // エラー率の計算
        const totalErrors = Array.from(this.errorTracking.errorsByKey.values())
            .reduce((sum, errors) => sum + errors.length, 0);
        this.statistics.errorRate = this.statistics.totalAccesses > 0 ? 
            totalErrors / this.statistics.totalAccesses : 0;
        
        // キャッシュヒット率の計算
        let totalHits = 0;
        let totalRequests = 0;
        this.performanceTracking.cacheHitRates.forEach((hitRate) => {
            totalHits += hitRate.hits;
            totalRequests += hitRate.total;
        });
        this.statistics.cacheHitRate = totalRequests > 0 ? totalHits / totalRequests : 0;
    }
    
    /**
     * キーの詳細情報を取得
     */
    getKeyDetails(fullKey: string): KeyDetails | null {
        const accessCount = this.usageTracking.accessCount.get(fullKey) || 0;
        if (accessCount === 0) return null;
        
        const lastAccess = this.usageTracking.lastAccess.get(fullKey);
        const isHotKey = this.usageTracking.hotKeys.has(fullKey);
        const isUnused = this.usageTracking.unusedKeys.has(fullKey);
        const errors = this.errorTracking.errorsByKey.get(fullKey) || [];
        
        // 平均アクセス時間の計算
        const accessTimes = this.performanceTracking.accessTimes.get(fullKey) || [];
        const averageAccessTime = accessTimes.length > 0 ?
            accessTimes.reduce((sum, time) => sum + time, 0) / accessTimes.length : 0;
        
        // キャッシュヒット率の計算
        const hitRate = this.performanceTracking.cacheHitRates.get(fullKey);
        const cacheHitRate = hitRate ? hitRate.hits / hitRate.total : 0;
        
        return {
            fullKey,
            accessCount,
            lastAccess,
            isHotKey,
            isUnused,
            errors,
            averageAccessTime,
            cacheHitRate
        };
    }
    
    /**
     * レポートの生成
     */
    generateReport(options: ReportOptions = {}): any {
        const report: any = {
            timestamp: new Date().toISOString(),
            debugConfig: this.debugConfig
        };
        
        if (options.includeStatistics !== false) {
            report.statistics = { ...this.statistics };
        }
        
        if (options.includeUsage !== false) {
            report.usage = this._generateUsageReport(options.topN);
        }
        
        if (options.includePerformance !== false) {
            report.performance = this._generatePerformanceReport(options.topN);
        }
        
        if (options.includeErrors !== false) {
            report.errors = this._generateErrorReport(options.topN);
        }
        
        return report;
    }
    
    /**
     * 使用状況レポートの生成
     */
    private _generateUsageReport(topN: number = 10): any {
        const sortedAccess = Array.from(this.usageTracking.accessCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, topN);
        
        return {
            totalKeys: this.usageTracking.accessCount.size,
            hotKeys: Array.from(this.usageTracking.hotKeys),
            unusedKeys: Array.from(this.usageTracking.unusedKeys),
            mostAccessed: sortedAccess.map(([key, count]) => ({ key, count })),
            recentAccesses: this.usageTracking.accessHistory.slice(-10)
        };
    }
    
    /**
     * パフォーマンスレポートの生成
     */
    private _generatePerformanceReport(topN: number = 10): any {
        const slowest = Array.from(this.performanceTracking.accessTimes.entries())
            .map(([key, times]) => ({
                key,
                averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
                maxTime: Math.max(...times),
                accessCount: times.length
            }))
            .sort((a, b) => b.averageTime - a.averageTime)
            .slice(0, topN);
        
        const cacheStats = Array.from(this.performanceTracking.cacheHitRates.entries())
            .map(([key, rate]) => ({
                key,
                hitRate: rate.hits / rate.total,
                totalRequests: rate.total
            }))
            .sort((a, b) => a.hitRate - b.hitRate);
        
        return {
            slowestKeys: slowest,
            recentSlowAccesses: this.performanceTracking.slowAccesses.slice(-10),
            cachePerformance: cacheStats,
            averageAccessTime: this.statistics.averageAccessTime,
            cacheHitRate: this.statistics.cacheHitRate
        };
    }
    
    /**
     * エラーレポートの生成
     */
    private _generateErrorReport(topN: number = 10): any {
        const errorByKey = Array.from(this.errorTracking.errorsByKey.entries())
            .map(([key, errors]) => ({
                key,
                errorCount: errors.length,
                latestError: errors[errors.length - 1]
            }))
            .sort((a, b) => b.errorCount - a.errorCount)
            .slice(0, topN);
        
        const errorPatterns = Array.from(this.errorTracking.errorPatterns.entries())
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count);
        
        return {
            totalErrors: Array.from(this.errorTracking.errorsByKey.values())
                .reduce((sum, errors) => sum + errors.length, 0),
            errorsByKey: errorByKey,
            errorPatterns: errorPatterns,
            criticalErrors: this.errorTracking.criticalErrors.slice(-10),
            recoveryStats: Array.from(this.errorTracking.recoverySuccess.entries())
                .map(([key, stats]) => ({
                    key,
                    successRate: stats.recovered / stats.total
                }))
        };
    }
    
    /**
     * パフォーマンスレポートの生成（定期実行用）
     */
    generatePerformanceReport(): void {
        if (!this.debugConfig.enabled) return;
        
        const report = this.generateReport({ includeStatistics: true, topN: 5 });
        this.logger.info('Performance Report', report, 'ConfigurationDebugger');
        
        // アラートの確認
        this._checkPerformanceAlerts();
    }
    
    /**
     * パフォーマンスアラートの確認
     */
    private _checkPerformanceAlerts(): void {
        // 遅いアクセスのアラート
        const recentSlowAccesses = this.performanceTracking.slowAccesses
            .filter(access => Date.now() - access.timestamp < 60000); // 1分以内
        
        if (recentSlowAccesses.length > 5) {
            this.logger.warn('High number of slow accesses detected', {
                count: recentSlowAccesses.length,
                accesses: recentSlowAccesses
            }, 'ConfigurationDebugger');
        }
        
        // エラー率のアラート
        if (this.statistics.errorRate > 0.1) { // 10%以上
            this.logger.warn('High error rate detected', {
                errorRate: this.statistics.errorRate,
                totalAccesses: this.statistics.totalAccesses
            }, 'ConfigurationDebugger');
        }
        
        // キャッシュヒット率のアラート
        if (this.statistics.cacheHitRate < 0.5) { // 50%以下
            this.logger.warn('Low cache hit rate detected', {
                cacheHitRate: this.statistics.cacheHitRate
            }, 'ConfigurationDebugger');
        }
    }
    
    /**
     * 設定の更新
     */
    updateConfig(newConfig: Partial<DebugConfig>): void {
        Object.assign(this.debugConfig, newConfig);
        
        // タイマーの再設定
        if (this.reportTimer) {
            clearInterval(this.reportTimer);
            this.reportTimer = null;
        }
        
        if (this.debugConfig.enabled && this.debugConfig.reportInterval > 0) {
            this._setupPeriodicReporting();
        }
        
        this.logger.info('Debug config updated', this.debugConfig, 'ConfigurationDebugger');
    }
    
    /**
     * データのリセット
     */
    reset(): void {
        // 使用状況データのリセット
        this.usageTracking.accessCount.clear();
        this.usageTracking.accessHistory = [];
        this.usageTracking.accessPatterns.clear();
        this.usageTracking.hotKeys.clear();
        this.usageTracking.unusedKeys.clear();
        this.usageTracking.lastAccess.clear();
        
        // パフォーマンスデータのリセット
        this.performanceTracking.accessTimes.clear();
        this.performanceTracking.slowAccesses = [];
        this.performanceTracking.cacheHitRates.clear();
        this.performanceTracking.validationTimes.clear();
        
        // エラーデータのリセット
        this.errorTracking.errorsByKey.clear();
        this.errorTracking.errorPatterns.clear();
        this.errorTracking.recoverySuccess.clear();
        this.errorTracking.criticalErrors = [];
        
        // 統計のリセット
        this.statistics.totalAccesses = 0;
        this.statistics.uniqueKeys = 0;
        this.statistics.averageAccessTime = 0;
        this.statistics.errorRate = 0;
        this.statistics.cacheHitRate = 0;
        this.statistics.lastReset = Date.now();
        
        this.logger.info('Debug data reset', null, 'ConfigurationDebugger');
    }
    
    /**
     * クリーンアップ
     */
    destroy(): void {
        if (this.reportTimer) {
            clearInterval(this.reportTimer);
            this.reportTimer = null;
        }
        
        this.reset();
        
        this.logger.info('ConfigurationDebugger destroyed', null, 'ConfigurationDebugger');
    }
}

// シングルトンインスタンス
let debuggerInstance: ConfigurationDebugger | null = null;

/**
 * デバッガーインスタンスを取得
 */
export function getConfigurationDebugger(): ConfigurationDebugger {
    if (!debuggerInstance) {
        debuggerInstance = new ConfigurationDebugger();
    }
    return debuggerInstance;
}