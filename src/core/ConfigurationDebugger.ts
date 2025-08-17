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

class ConfigurationDebugger {
    private usageTracking: UsageTracking;
    private performanceTracking: PerformanceTracking;
    private errorTracking: ErrorTracking;
    private debugConfig: DebugConfig;
    private statistics: Statistics;
    private logger: any;

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
     * 設定アクセスを追跡
     */
    trackAccess(
        category: string, 
        key: string, 
        value: any, 
        source: string = 'unknown', 
        accessTime: number = 0, 
        fromCache: boolean = false
    ): void {
        if (!this.debugConfig.enabled || !this.debugConfig.trackUsage) {
            return;
        }
        
        try {
            const fullKey = `${category}.${key}`;
            const timestamp = Date.now();
            
            // アクセス回数を更新
            const currentCount = this.usageTracking.accessCount.get(fullKey) || 0;
            this.usageTracking.accessCount.set(fullKey, currentCount + 1);
            
            // アクセス履歴を記録
            const accessRecord: AccessRecord = {
                timestamp,
                category,
                key,
                fullKey,
                value,
                source,
                accessTime,
                fromCache
            };
            
            this.usageTracking.accessHistory.push(accessRecord);
            
            // 履歴サイズを制限
            if (this.usageTracking.accessHistory.length > this.debugConfig.maxHistorySize) {
                this.usageTracking.accessHistory.splice(0, 100);
            }
            
            // 最後のアクセス時刻を更新
            this.usageTracking.lastAccess.set(fullKey, timestamp);
            
            // ホットキーを更新
            if (currentCount + 1 >= this.debugConfig.hotKeyThreshold) {
                this.usageTracking.hotKeys.add(fullKey);
            }
            
            // 未使用キーから削除
            this.usageTracking.unusedKeys.delete(fullKey);
            
            // アクセスパターンを更新
            this._updateAccessPattern(fullKey, source, timestamp);
            
            // パフォーマンス追跡
            if (this.debugConfig.trackPerformance) {
                this._trackPerformance(fullKey, accessTime, fromCache);
            }
            
            // 統計を更新
            this.statistics.totalAccesses++;
            this.statistics.uniqueKeys = this.usageTracking.accessCount.size;
            
            // デバッグログ出力
            if (this._isVerboseMode()) {
                this.logger.debug(`設定アクセス: ${fullKey}`, {
                    value,
                    source,
                    accessTime,
                    fromCache,
                    accessCount: currentCount + 1
                }, 'ConfigurationDebugger');
            }
            
        } catch (error) {
            this.logger.error('設定アクセス追跡エラー', {
                error: (error as Error).message,
                category,
                key
            }, 'ConfigurationDebugger');
        }
    }
    
    /**
     * エラーを追跡
     */
    trackError(
        category: string, 
        key: string, 
        errorType: string, 
        errorMessage: string, 
        recovered: boolean = false
    ): void {
        if (!this.debugConfig.enabled || !this.debugConfig.trackErrors) {
            return;
        }
        
        try {
            const fullKey = `${category}.${key}`;
            const timestamp = Date.now();
            
            // キー別エラーを記録
            if (!this.errorTracking.errorsByKey.has(fullKey)) {
                this.errorTracking.errorsByKey.set(fullKey, []);
            }
            
            const errorRecord: ErrorRecord = {
                timestamp,
                errorType,
                errorMessage,
                recovered
            };
            
            this.errorTracking.errorsByKey.get(fullKey)!.push(errorRecord);
            
            // エラーパターンを更新
            const patternKey = `${errorType}_${fullKey}`;
            const currentCount = this.errorTracking.errorPatterns.get(patternKey) || 0;
            this.errorTracking.errorPatterns.set(patternKey, currentCount + 1);
            
            // 復旧成功率を更新
            if (!this.errorTracking.recoverySuccess.has(fullKey)) {
                this.errorTracking.recoverySuccess.set(fullKey, { total: 0, recovered: 0 });
            }
            
            const recoveryStats = this.errorTracking.recoverySuccess.get(fullKey)!;
            recoveryStats.total++;
            if (recovered) {
                recoveryStats.recovered++;
            }
            
            // 重要なエラーを記録
            if (this._isCriticalError(errorType)) {
                this.errorTracking.criticalErrors.push({
                    timestamp,
                    fullKey,
                    errorType,
                    errorMessage,
                    recovered
                });
                
                // 重要なエラーは最大100件まで保持
                if (this.errorTracking.criticalErrors.length > 100) {
                    this.errorTracking.criticalErrors.splice(0, 10);
                }
            }
            
            this.logger.warn(`設定エラー追跡: ${fullKey}`, {
                errorType,
                errorMessage,
                recovered
            }, 'ConfigurationDebugger');
            
        } catch (error) {
            this.logger.error('エラー追跡エラー', {
                error: (error as Error).message,
                category,
                key
            }, 'ConfigurationDebugger');
        }
    }
    
    /**
     * 未使用キーを登録
     */
    registerUnusedKey(category: string, key: string): void {
        if (!this.debugConfig.enabled) {
            return;
        }
        
        const fullKey = `${category}.${key}`;
        if (!this.usageTracking.accessCount.has(fullKey)) {
            this.usageTracking.unusedKeys.add(fullKey);
        }
    }
    
    /**
     * デバッグレポートを生成
     */
    generateReport(options: ReportOptions = {}): any {
        const {
            includeUsage = true,
            includePerformance = true,
            includeErrors = true,
            includeStatistics = true,
            topN = 10
        } = options;
        
        const report: any = {
            timestamp: new Date().toISOString(),
            debugConfig: { ...this.debugConfig }
        };
        
        if (includeStatistics) {
            report.statistics = this._generateStatistics();
        }
        
        if (includeUsage) {
            report.usage = this._generateUsageReport(topN);
        }
        
        if (includePerformance) {
            report.performance = this._generatePerformanceReport(topN);
        }
        
        if (includeErrors) {
            report.errors = this._generateErrorReport(topN);
        }
        
        return report;
    }
    
    /**
     * デバッグ情報を表示
     */
    displayDebugInfo(options: ReportOptions = {}): void {
        if (!this.debugConfig.enabled) {
            console.log('デバッグモードが無効です');
            return;
        }
        
        const report = this.generateReport(options);
        
        console.group('🔧 Configuration Debug Report');
        
        // 統計情報
        if (report.statistics) {
            console.group('📊 統計情報');
            console.table(report.statistics);
            console.groupEnd();
        }
        
        // 使用状況
        if (report.usage) {
            console.group('📈 使用状況');
            console.log('ホットキー (頻繁にアクセス):', report.usage.hotKeys);
            console.log('未使用キー:', report.usage.unusedKeys);
            console.table(report.usage.topAccessed);
            console.groupEnd();
        }
        
        // パフォーマンス
        if (report.performance) {
            console.group('⚡ パフォーマンス');
            console.table(report.performance.slowAccesses);
            console.log('キャッシュヒット率:', report.performance.cacheHitRates);
            console.groupEnd();
        }
        
        // エラー
        if (report.errors) {
            console.group('❌ エラー');
            console.table(report.errors.errorPatterns);
            console.log('重要なエラー:', report.errors.criticalErrors);
            console.groupEnd();
        }
        
        console.groupEnd();
    }
    
    /**
     * 設定値の詳細情報を取得
     */
    getKeyDetails(category: string, key: string): KeyDetails {
        const fullKey = `${category}.${key}`;
        
        return {
            fullKey,
            accessCount: this.usageTracking.accessCount.get(fullKey) || 0,
            lastAccess: this.usageTracking.lastAccess.get(fullKey),
            isHotKey: this.usageTracking.hotKeys.has(fullKey),
            isUnused: this.usageTracking.unusedKeys.has(fullKey),
            errors: this.errorTracking.errorsByKey.get(fullKey) || [],
            averageAccessTime: this.performanceTracking.accessTimes.get(fullKey)?.reduce((a, b) => a + b, 0) / 
                              (this.performanceTracking.accessTimes.get(fullKey)?.length || 1) || 0,
            cacheHitRate: (() => {
                const rate = this.performanceTracking.cacheHitRates.get(fullKey);
                return rate ? (rate.hits / rate.total) : 0;
            })()
        };
    }
    
    /**
     * デバッグ設定を更新
     */
    updateConfig(newConfig: Partial<DebugConfig>): void {
        Object.assign(this.debugConfig, newConfig);
        
        if (this.debugConfig.enabled && !this._isDebugMode()) {
            this.logger.warn('デバッグモードが無効ですが、デバッガーは有効です', null, 'ConfigurationDebugger');
        }
    }
    
    /**
     * 統計をリセット
     */
    resetStatistics(): void {
        this.usageTracking.accessCount.clear();
        this.usageTracking.accessHistory = [];
        this.usageTracking.accessPatterns.clear();
        this.usageTracking.hotKeys.clear();
        this.usageTracking.lastAccess.clear();
        
        this.performanceTracking.accessTimes.clear();
        this.performanceTracking.slowAccesses = [];
        this.performanceTracking.cacheHitRates.clear();
        
        this.errorTracking.errorsByKey.clear();
        this.errorTracking.errorPatterns.clear();
        this.errorTracking.recoverySuccess.clear();
        this.errorTracking.criticalErrors = [];
        
        this.statistics = {
            totalAccesses: 0,
            uniqueKeys: 0,
            averageAccessTime: 0,
            errorRate: 0,
            cacheHitRate: 0,
            lastReset: Date.now()
        };
        
        this.logger.info('デバッグ統計をリセット', null, 'ConfigurationDebugger');
    }
    
    /**
     * アクセスパターンを更新
     */
    private _updateAccessPattern(fullKey: string, source: string, timestamp: number): void {
        const patternKey = `${fullKey}_${source}`;
        
        if (!this.usageTracking.accessPatterns.has(patternKey)) {
            this.usageTracking.accessPatterns.set(patternKey, {
                count: 0,
                firstAccess: timestamp,
                lastAccess: timestamp,
                intervals: []
            });
        }
        
        const pattern = this.usageTracking.accessPatterns.get(patternKey)!;
        pattern.count++;
        
        if (pattern.lastAccess) {
            const interval = timestamp - pattern.lastAccess;
            pattern.intervals.push(interval);
            
            // 最大100個のインターバルを保持
            if (pattern.intervals.length > 100) {
                pattern.intervals.splice(0, 10);
            }
        }
        
        pattern.lastAccess = timestamp;
    }
    
    /**
     * パフォーマンスを追跡
     */
    private _trackPerformance(fullKey: string, accessTime: number, fromCache: boolean): void {
        // アクセス時間を記録
        if (!this.performanceTracking.accessTimes.has(fullKey)) {
            this.performanceTracking.accessTimes.set(fullKey, []);
        }
        
        const times = this.performanceTracking.accessTimes.get(fullKey)!;
        times.push(accessTime);
        
        // 最大100個の時間を保持
        if (times.length > 100) {
            times.splice(0, 10);
        }
        
        // 遅いアクセスを記録
        if (accessTime > this.debugConfig.slowAccessThreshold) {
            this.performanceTracking.slowAccesses.push({
                timestamp: Date.now(),
                fullKey,
                accessTime,
                fromCache
            });
            
            // 最大50個の遅いアクセスを保持
            if (this.performanceTracking.slowAccesses.length > 50) {
                this.performanceTracking.slowAccesses.splice(0, 10);
            }
        }
        
        // キャッシュヒット率を更新
        if (!this.performanceTracking.cacheHitRates.has(fullKey)) {
            this.performanceTracking.cacheHitRates.set(fullKey, { total: 0, hits: 0 });
        }
        
        const hitRate = this.performanceTracking.cacheHitRates.get(fullKey)!;
        hitRate.total++;
        if (fromCache) {
            hitRate.hits++;
        }
    }
    
    /**
     * 統計情報を生成
     */
    private _generateStatistics(): any {
        const totalErrors = Array.from(this.errorTracking.errorsByKey.values())
            .reduce((sum, errors) => sum + errors.length, 0);
        
        const totalCacheAccesses = Array.from(this.performanceTracking.cacheHitRates.values())
            .reduce((sum, rate) => sum + rate.total, 0);
        
        const totalCacheHits = Array.from(this.performanceTracking.cacheHitRates.values())
            .reduce((sum, rate) => sum + rate.hits, 0);
        
        const allAccessTimes = Array.from(this.performanceTracking.accessTimes.values())
            .flat();
        
        const averageAccessTime = allAccessTimes.length > 0
            ? allAccessTimes.reduce((sum, time) => sum + time, 0) / allAccessTimes.length
            : 0;
        
        return {
            totalAccesses: this.statistics.totalAccesses,
            uniqueKeys: this.statistics.uniqueKeys,
            hotKeys: this.usageTracking.hotKeys.size,
            unusedKeys: this.usageTracking.unusedKeys.size,
            totalErrors: totalErrors,
            errorRate: this.statistics.totalAccesses > 0 
                ? (totalErrors / this.statistics.totalAccesses * 100).toFixed(2) + '%'
                : '0%',
            averageAccessTime: averageAccessTime.toFixed(2) + 'ms',
            cacheHitRate: totalCacheAccesses > 0
                ? (totalCacheHits / totalCacheAccesses * 100).toFixed(2) + '%'
                : '0%',
            uptime: this._formatDuration(Date.now() - this.statistics.lastReset)
        };
    }
    
    /**
     * 使用状況レポートを生成
     */
    private _generateUsageReport(topN: number): any {
        const topAccessed = Array.from(this.usageTracking.accessCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, topN)
            .map(([key, count]) => ({
                key,
                accessCount: count,
                lastAccess: new Date(this.usageTracking.lastAccess.get(key) || 0).toISOString()
            }));
        
        return {
            hotKeys: Array.from(this.usageTracking.hotKeys),
            unusedKeys: Array.from(this.usageTracking.unusedKeys),
            topAccessed,
            recentAccesses: this.usageTracking.accessHistory
                .slice(-10)
                .map(access => ({
                    key: access.fullKey,
                    source: access.source,
                    timestamp: new Date(access.timestamp).toISOString()
                }))
        };
    }
    
    /**
     * パフォーマンスレポートを生成
     */
    private _generatePerformanceReport(topN: number): any {
        const slowAccesses = this.performanceTracking.slowAccesses
            .slice(-topN)
            .map(access => ({
                key: access.fullKey,
                accessTime: access.accessTime + 'ms',
                fromCache: access.fromCache,
                timestamp: new Date(access.timestamp).toISOString()
            }));
        
        const cacheHitRates = Array.from(this.performanceTracking.cacheHitRates.entries())
            .map(([key, rate]) => ({
                key,
                hitRate: rate.total > 0 ? (rate.hits / rate.total * 100).toFixed(2) + '%' : '0%',
                totalAccesses: rate.total
            }))
            .sort((a, b) => parseFloat(b.hitRate) - parseFloat(a.hitRate))
            .slice(0, topN);
        
        return {
            slowAccesses,
            cacheHitRates
        };
    }
    
    /**
     * エラーレポートを生成
     */
    private _generateErrorReport(topN: number): any {
        const errorPatterns = Array.from(this.errorTracking.errorPatterns.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, topN)
            .map(([pattern, count]) => ({
                pattern,
                count
            }));
        
        const criticalErrors = this.errorTracking.criticalErrors
            .slice(-topN)
            .map(error => ({
                key: error.fullKey,
                errorType: error.errorType,
                recovered: error.recovered,
                timestamp: new Date(error.timestamp).toISOString()
            }));
        
        const recoveryRates = Array.from(this.errorTracking.recoverySuccess.entries())
            .map(([key, stats]) => ({
                key,
                recoveryRate: stats.total > 0 ? (stats.recovered / stats.total * 100).toFixed(2) + '%' : '0%',
                totalErrors: stats.total
            }))
            .filter(item => item.totalErrors > 0)
            .sort((a, b) => parseFloat(a.recoveryRate) - parseFloat(b.recoveryRate))
            .slice(0, topN);
        
        return {
            errorPatterns,
            criticalErrors,
            recoveryRates
        };
    }
    
    /**
     * 定期レポートを設定
     */
    private _setupPeriodicReporting(): void {
        if (this.debugConfig.reportInterval > 0) {
            setInterval(() => {
                if (this._isVerboseMode()) {
                    const report = this.generateReport({ topN: 5 });
                    this.logger.debug('定期デバッグレポート', report, 'ConfigurationDebugger');
                }
            }, this.debugConfig.reportInterval);
        }
    }
    
    /**
     * パフォーマンス監視を設定
     */
    private _setupPerformanceMonitoring(): void {
        // メモリ使用量の監視
        if (typeof window !== 'undefined' && window.performance && (window.performance as any).memory) {
            setInterval(() => {
                const memory = (window.performance as any).memory;
                const usedMB = memory.usedJSHeapSize / 1024 / 1024;
                
                if (usedMB > 100) { // 100MB以上の場合
                    this.logger.warn('高いメモリ使用量を検出', {
                        usedMB: Math.round(usedMB),
                        totalMB: Math.round(memory.totalJSHeapSize / 1024 / 1024)
                    }, 'ConfigurationDebugger');
                }
            }, 30000); // 30秒ごと
        }
    }
    
    /**
     * 重要なエラーかどうかを判定
     */
    private _isCriticalError(errorType: string): boolean {
        const criticalTypes = [
            'CONFIGURATION_ACCESS',
            'DEPENDENCY_ERROR',
            'VALIDATION_FAILURE',
            'CACHE_ERROR'
        ];
        
        return criticalTypes.includes(errorType);
    }
    
    /**
     * デバッグモード判定
     */
    private _isDebugMode(): boolean {
        try {
            if (typeof window !== 'undefined' && window.location) {
                return new URLSearchParams(window.location.search).has('debug') ||
                       (typeof localStorage !== 'undefined' && localStorage.getItem('debugMode') === 'true');
            }
            return false;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * 詳細モード判定
     */
    private _isVerboseMode(): boolean {
        try {
            if (typeof window !== 'undefined' && window.location) {
                return new URLSearchParams(window.location.search).has('verbose') ||
                       (typeof localStorage !== 'undefined' && localStorage.getItem('verboseMode') === 'true');
            }
            return false;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * 期間をフォーマット
     */
    private _formatDuration(ms: number): string {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}時間${minutes % 60}分`;
        } else if (minutes > 0) {
            return `${minutes}分${seconds % 60}秒`;
        } else {
            return `${seconds}秒`;
        }
    }
}

// シングルトンインスタンス
let instance: ConfigurationDebugger | null = null;

/**
 * ConfigurationDebuggerのシングルトンインスタンスを取得
 */
function getConfigurationDebugger(): ConfigurationDebugger {
    if (!instance) {
        instance = new ConfigurationDebugger();
    }
    return instance;
}

export {
    ConfigurationDebugger,
    getConfigurationDebugger
};