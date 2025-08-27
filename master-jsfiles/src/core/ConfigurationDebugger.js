/**
 * 設定システム専用デバッグ機能
 * 
 * 設定値の使用状況追跡機能を実装し、
 * デバッグモードでの詳細情報表示を提供します。
 */

import { getLoggingSystem } from './LoggingSystem.js';

class ConfigurationDebugger {
    constructor() {
        // 使用状況追跡
        this.usageTracking = {
            accessCount: new Map(), // キー別アクセス回数
            accessHistory: [], // アクセス履歴
            accessPatterns: new Map(), // アクセスパターン
            hotKeys: new Set(), // 頻繁にアクセスされるキー
            unusedKeys: new Set(), // 未使用キー
            lastAccess: new Map() // 最後のアクセス時刻
        };
        
        // パフォーマンス追跡
        this.performanceTracking = {
            accessTimes: new Map(), // アクセス時間
            slowAccesses: [], // 遅いアクセス
            cacheHitRates: new Map(), // キャッシュヒット率
            validationTimes: new Map() // 検証時間
        };
        
        // エラー追跡
        this.errorTracking = {
            errorsByKey: new Map(), // キー別エラー
            errorPatterns: new Map(), // エラーパターン
            recoverySuccess: new Map(), // 復旧成功率
            criticalErrors: [] // 重要なエラー
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
     * @private
     */
    _initialize() {
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
     * @param {string} category - 設定カテゴリ
     * @param {string} key - 設定キー
     * @param {*} value - アクセスされた値
     * @param {string} source - アクセス元
     * @param {number} accessTime - アクセス時間（ms）
     * @param {boolean} fromCache - キャッシュからの取得かどうか
     */
    trackAccess(category, key, value, source = 'unknown', accessTime = 0, fromCache = false) {
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
            const accessRecord = {
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
                error: error.message,
                category,
                key
            }, 'ConfigurationDebugger');
        }
    }
    
    /**
     * エラーを追跡
     * @param {string} category - 設定カテゴリ
     * @param {string} key - 設定キー
     * @param {string} errorType - エラータイプ
     * @param {string} errorMessage - エラーメッセージ
     * @param {boolean} recovered - 復旧したかどうか
     */
    trackError(category, key, errorType, errorMessage, recovered = false) {
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
            
            const errorRecord = {
                timestamp,
                errorType,
                errorMessage,
                recovered
            };
            
            this.errorTracking.errorsByKey.get(fullKey).push(errorRecord);
            
            // エラーパターンを更新
            const patternKey = `${errorType}_${fullKey}`;
            const currentCount = this.errorTracking.errorPatterns.get(patternKey) || 0;
            this.errorTracking.errorPatterns.set(patternKey, currentCount + 1);
            
            // 復旧成功率を更新
            if (!this.errorTracking.recoverySuccess.has(fullKey)) {
                this.errorTracking.recoverySuccess.set(fullKey, { total: 0, recovered: 0 });
            }
            
            const recoveryStats = this.errorTracking.recoverySuccess.get(fullKey);
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
                error: error.message,
                category,
                key
            }, 'ConfigurationDebugger');
        }
    }
    
    /**
     * 未使用キーを登録
     * @param {string} category - 設定カテゴリ
     * @param {string} key - 設定キー
     */
    registerUnusedKey(category, key) {
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
     * @param {Object} options - レポートオプション
     * @returns {Object} デバッグレポート
     */
    generateReport(options = {}) {
        const {
            includeUsage = true,
            includePerformance = true,
            includeErrors = true,
            includeStatistics = true,
            topN = 10
        } = options;
        
        const report = {
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
     * @param {Object} options - 表示オプション
     */
    displayDebugInfo(options = {}) {
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
     * @param {string} category - 設定カテゴリ
     * @param {string} key - 設定キー
     * @returns {Object} 詳細情報
     */
    getKeyDetails(category, key) {
        const fullKey = `${category}.${key}`;
        
        return {
            fullKey,
            accessCount: this.usageTracking.accessCount.get(fullKey) || 0,
            lastAccess: this.usageTracking.lastAccess.get(fullKey),
            isHotKey: this.usageTracking.hotKeys.has(fullKey),
            isUnused: this.usageTracking.unusedKeys.has(fullKey),
            errors: this.errorTracking.errorsByKey.get(fullKey) || [],
            averageAccessTime: this.performanceTracking.accessTimes.get(fullKey) || 0,
            cacheHitRate: this.performanceTracking.cacheHitRates.get(fullKey) || 0
        };
    }
    
    /**
     * デバッグ設定を更新
     * @param {Object} newConfig - 新しい設定
     */
    updateConfig(newConfig) {
        Object.assign(this.debugConfig, newConfig);
        
        if (this.debugConfig.enabled && !this._isDebugMode()) {
            this.logger.warn('デバッグモードが無効ですが、デバッガーは有効です', null, 'ConfigurationDebugger');
        }
    }
    
    /**
     * 統計をリセット
     */
    resetStatistics() {
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
     * @param {string} fullKey - 完全なキー名
     * @param {string} source - アクセス元
     * @param {number} timestamp - タイムスタンプ
     * @private
     */
    _updateAccessPattern(fullKey, source, timestamp) {
        const patternKey = `${fullKey}_${source}`;
        
        if (!this.usageTracking.accessPatterns.has(patternKey)) {
            this.usageTracking.accessPatterns.set(patternKey, {
                count: 0,
                firstAccess: timestamp,
                lastAccess: timestamp,
                intervals: []
            });
        }
        
        const pattern = this.usageTracking.accessPatterns.get(patternKey);
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
     * @param {string} fullKey - 完全なキー名
     * @param {number} accessTime - アクセス時間
     * @param {boolean} fromCache - キャッシュからの取得かどうか
     * @private
     */
    _trackPerformance(fullKey, accessTime, fromCache) {
        // アクセス時間を記録
        if (!this.performanceTracking.accessTimes.has(fullKey)) {
            this.performanceTracking.accessTimes.set(fullKey, []);
        }
        
        const times = this.performanceTracking.accessTimes.get(fullKey);
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
        
        const hitRate = this.performanceTracking.cacheHitRates.get(fullKey);
        hitRate.total++;
        if (fromCache) {
            hitRate.hits++;
        }
    }
    
    /**
     * 統計情報を生成
     * @returns {Object} 統計情報
     * @private
     */
    _generateStatistics() {
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
     * @param {number} topN - 上位N件
     * @returns {Object} 使用状況レポート
     * @private
     */
    _generateUsageReport(topN) {
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
     * @param {number} topN - 上位N件
     * @returns {Object} パフォーマンスレポート
     * @private
     */
    _generatePerformanceReport(topN) {
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
     * @param {number} topN - 上位N件
     * @returns {Object} エラーレポート
     * @private
     */
    _generateErrorReport(topN) {
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
     * @private
     */
    _setupPeriodicReporting() {
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
     * @private
     */
    _setupPerformanceMonitoring() {
        // メモリ使用量の監視
        if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
            setInterval(() => {
                const memory = window.performance.memory;
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
     * @param {string} errorType - エラータイプ
     * @returns {boolean} 重要なエラーかどうか
     * @private
     */
    _isCriticalError(errorType) {
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
     * @returns {boolean} デバッグモードフラグ
     * @private
     */
    _isDebugMode() {
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
     * @returns {boolean} 詳細モードフラグ
     * @private
     */
    _isVerboseMode() {
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
     * @param {number} ms - ミリ秒
     * @returns {string} フォーマットされた期間
     * @private
     */
    _formatDuration(ms) {
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
let instance = null;

/**
 * ConfigurationDebuggerのシングルトンインスタンスを取得
 * @returns {ConfigurationDebugger} インスタンス
 */
function getConfigurationDebugger() {
    if (!instance) {
        instance = new ConfigurationDebugger();
    }
    return instance;
}

export {
    ConfigurationDebugger,
    getConfigurationDebugger
};