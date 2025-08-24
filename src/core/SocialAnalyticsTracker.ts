/**
 * SocialAnalyticsTracker.ts
 * ソーシャル機能の分析追跡機能
 * SocialSharingManagerから分離された分析・統計・監視機能
 */

interface PlatformStats {
    requests: number;
    successes: number;
    failures: number;
}

interface PerformanceStats {
    shareRequests: number;
    successfulShares: number;
    failedShares: number;
    averageResponseTime: number;
    platformBreakdown: Record<string, PlatformStats>;
}

interface ErrorStats {
    total: number;
    byType: Record<string, number>;
    byPlatform: Record<string, number>;
    recent: ErrorRecord[];
}

interface ErrorRecord {
    type: string;
    timestamp: number;
    data: any;
}

interface UserBehaviorStats {
    sharePromptViews: number;
    sharePromptAccepts: number;
    sharePromptDismissals: number;
    screenshotCaptures: number;
    averageTimeToShare: number;
}

interface I18nStats {
    languageUsage: Map<string, number>;
    regionUsage: Map<string, number>;
    translationRequests: number;
    translationErrors: number;
    cachedTranslations: number;
}

interface Timestamps {
    sessionStart: number;
    lastShareAttempt: number | null;
    lastSuccessfulShare: number | null;
}

interface EventData {
    action: string;
    timestamp: number;
    data: any;
    sessionTime?: number;
}

export class SocialAnalyticsTracker {
    private performanceStats: PerformanceStats;
    private errorStats: ErrorStats;
    private userBehaviorStats: UserBehaviorStats;
    private i18nStats: I18nStats;
    private timestamps: Timestamps;
    private eventHistory: EventData[];
    private maxHistorySize: number;

    constructor() {
        // パフォーマンス統計
        this.performanceStats = {
            shareRequests: 0,
            successfulShares: 0,
            failedShares: 0,
            averageResponseTime: 0,
            platformBreakdown: {
                twitter: { requests: 0, successes: 0, failures: 0 },
                facebook: { requests: 0, successes: 0, failures: 0 },
                webShare: { requests: 0, successes: 0, failures: 0 }
            }
        };

        // エラー統計
        this.errorStats = {
            total: 0,
            byType: {},
            byPlatform: {},
            recent: []
        };

        // ユーザー行動統計
        this.userBehaviorStats = {
            sharePromptViews: 0,
            sharePromptAccepts: 0,
            sharePromptDismissals: 0,
            screenshotCaptures: 0,
            averageTimeToShare: 0
        };

        // 国際化統計
        this.i18nStats = {
            languageUsage: new Map(),
            regionUsage: new Map(),
            translationRequests: 0,
            translationErrors: 0,
            cachedTranslations: 0
        };

        // タイムスタンプ記録
        this.timestamps = {
            sessionStart: Date.now(),
            lastShareAttempt: null,
            lastSuccessfulShare: null
        };

        // イベント履歴（最新100件）
        this.eventHistory = [];
        this.maxHistorySize = 100;
    }

    /**
     * 共有イベントの記録
     * @param {string} action - アクション種別
     * @param {Object} data - イベントデータ
     */
    trackShareEvent(action: string, data: any = {}): void {
        const timestamp = Date.now();
        const event: EventData = {
            action,
            timestamp,
            data: { ...data },
            sessionTime: timestamp - this.timestamps.sessionStart
        };

        this.addToHistory(event);
        this.updatePerformanceStats(action, data);
        
        // プラットフォーム別統計
        if (data.platform) {
            this.updatePlatformStats(data.platform, action, data);
        }
    }

    /**
     * エラーイベントの記録
     * @param {string} errorType - エラー種別
     * @param {Object} errorData - エラーデータ
     */
    trackError(errorType: string, errorData: any = {}): void {
        this.errorStats.total++;
        
        // エラー種別別カウント
        if (!this.errorStats.byType[errorType]) {
            this.errorStats.byType[errorType] = 0;
        }
        this.errorStats.byType[errorType]++;
        
        // プラットフォーム別エラー
        if (errorData.platform) {
            if (!this.errorStats.byPlatform[errorData.platform]) {
                this.errorStats.byPlatform[errorData.platform] = 0;
            }
            this.errorStats.byPlatform[errorData.platform]++;
        }

        // 最近のエラー履歴
        const errorRecord: ErrorRecord = {
            type: errorType,
            timestamp: Date.now(),
            data: errorData
        };
        
        this.errorStats.recent.push(errorRecord);
        if (this.errorStats.recent.length > 50) {
            this.errorStats.recent.shift();
        }

        this.addToHistory({
            action: 'error',
            timestamp: errorRecord.timestamp,
            data: errorRecord
        });
    }

    /**
     * ユーザー行動の記録
     * @param {string} behavior - 行動種別
     * @param {Object} data - 行動データ
     */
    trackUserBehavior(behavior: string, data: any = {}): void {
        switch(behavior) {
            case 'sharePromptView':
                this.userBehaviorStats.sharePromptViews++;
                break;
            case 'sharePromptAccept':
                this.userBehaviorStats.sharePromptAccepts++;
                break;
            case 'sharePromptDismiss':
                this.userBehaviorStats.sharePromptDismissals++;
                break;
            case 'screenshotCapture':
                this.userBehaviorStats.screenshotCaptures++;
                break;
        }

        this.addToHistory({
            action: behavior,
            timestamp: Date.now(),
            data
        });
    }

    /**
     * 国際化関連の統計記録
     * @param {string} action - アクション
     * @param {Object} data - データ
     */
    trackI18nEvent(action: string, data: any = {}): void {
        switch(action) {
            case 'language_request':
                const language = data.language || 'unknown';
                this.i18nStats.languageUsage.set(
                    language,
                    (this.i18nStats.languageUsage.get(language) || 0) + 1
                );
                break;

            case 'region_request':
                const region = data.region || 'unknown';
                this.i18nStats.regionUsage.set(
                    region,
                    (this.i18nStats.regionUsage.get(region) || 0) + 1
                );
                break;

            case 'translation_request':
                this.i18nStats.translationRequests++;
                break;

            case 'translation_error':
                this.i18nStats.translationErrors++;
                break;

            case 'cache_hit':
                this.i18nStats.cachedTranslations++;
                break;
        }

        this.addToHistory({
            action: `i18n_${action}`,
            timestamp: Date.now(),
            data
        });
    }

    /**
     * パフォーマンス統計の更新
     * @param {string} action - アクション
     * @param {Object} data - データ
     */
    updatePerformanceStats(action: string, data: any = {}): void {
        const startTime = data.startTime;
        const endTime = data.endTime || Date.now();
        
        switch(action) {
            case 'share_request':
                this.performanceStats.shareRequests++;
                this.timestamps.lastShareAttempt = endTime;
                break;

            case 'share_success':
                this.performanceStats.successfulShares++;
                this.timestamps.lastSuccessfulShare = endTime;
                
                // レスポンス時間の計算
                if (startTime) {
                    const responseTime = endTime - startTime;
                    this.updateAverageResponseTime(responseTime);
                }
                break;

            case 'share_failure':
                this.performanceStats.failedShares++;
                break;
        }
    }

    /**
     * プラットフォーム別統計の更新
     * @param {string} platform - プラットフォーム
     * @param {string} action - アクション
     * @param {Object} data - データ
     */
    updatePlatformStats(platform: string, action: string, data: any): void {
        if (!this.performanceStats.platformBreakdown[platform]) {
            this.performanceStats.platformBreakdown[platform] = {
                requests: 0,
                successes: 0,
                failures: 0
            };
        }

        const stats = this.performanceStats.platformBreakdown[platform];

        switch(action) {
            case 'share_request':
                stats.requests++;
                break;
            case 'share_success':
                stats.successes++;
                break;
            case 'share_failure':
                stats.failures++;
                break;
        }
    }

    /**
     * 平均レスポンス時間の更新
     * @param {number} responseTime - レスポンス時間
     */
    updateAverageResponseTime(responseTime: number): void {
        const currentAverage = this.performanceStats.averageResponseTime;
        const totalSuccesses = this.performanceStats.successfulShares;
        
        if (totalSuccesses === 1) {
            this.performanceStats.averageResponseTime = responseTime;
        } else {
            this.performanceStats.averageResponseTime = 
                ((currentAverage * (totalSuccesses - 1)) + responseTime) / totalSuccesses;
        }
    }

    /**
     * イベント履歴への追加
     * @param {Object} event - イベント
     */
    addToHistory(event: EventData): void {
        this.eventHistory.push(event);
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
    }

    /**
     * パフォーマンス統計の取得
     * @returns {Object} パフォーマンス統計
     */
    getPerformanceStats(): any {
        const totalRequests = this.performanceStats.shareRequests;
        const successRate = totalRequests > 0 ? 
            (this.performanceStats.successfulShares / totalRequests) * 100 : 0;

        return {
            ...this.performanceStats,
            successRate: Math.round(successRate * 100) / 100,
            sessionDuration: Date.now() - this.timestamps.sessionStart,
            timestamps: { ...this.timestamps }
        };
    }

    /**
     * エラー統計の取得
     * @returns {Object} エラー統計
     */
    getErrorStats(): any {
        return {
            ...this.errorStats,
            errorRate: this.performanceStats.shareRequests > 0 ? 
                (this.errorStats.total / this.performanceStats.shareRequests) * 100 : 0
        };
    }

    /**
     * ユーザー行動統計の取得
     * @returns {Object} ユーザー行動統計
     */
    getUserBehaviorStats(): any {
        const totalPrompts = this.userBehaviorStats.sharePromptViews;
        const acceptanceRate = totalPrompts > 0 ? 
            (this.userBehaviorStats.sharePromptAccepts / totalPrompts) * 100 : 0;
        
        return {
            ...this.userBehaviorStats,
            acceptanceRate: Math.round(acceptanceRate * 100) / 100
        };
    }

    /**
     * 国際化統計の取得
     * @returns {Object} 国際化統計
     */
    getI18nStats(): any {
        return {
            languageUsage: Object.fromEntries(this.i18nStats.languageUsage),
            regionUsage: Object.fromEntries(this.i18nStats.regionUsage),
            translationRequests: this.i18nStats.translationRequests,
            translationErrors: this.i18nStats.translationErrors,
            cachedTranslations: this.i18nStats.cachedTranslations,
            cacheHitRate: this.i18nStats.translationRequests > 0 ? 
                (this.i18nStats.cachedTranslations / this.i18nStats.translationRequests) * 100 : 0
        };
    }

    /**
     * 包括的なレポート生成
     * @returns {Object} 包括レポート
     */
    generateReport(): any {
        return {
            summary: {
                sessionStart: new Date(this.timestamps.sessionStart),
                sessionDuration: Date.now() - this.timestamps.sessionStart,
                totalEvents: this.eventHistory.length
            },
            performance: this.getPerformanceStats(),
            errors: this.getErrorStats(),
            userBehavior: this.getUserBehaviorStats(),
            i18n: this.getI18nStats(),
            recentEvents: this.eventHistory.slice(-10)
        };
    }

    /**
     * 分析データのエクスポート
     * @returns {Object} エクスポート用データ
     */
    exportAnalyticsData(): any {
        return {
            metadata: {
                exportDate: new Date().toISOString(),
                sessionStart: new Date(this.timestamps.sessionStart).toISOString(),
                sessionDuration: Date.now() - this.timestamps.sessionStart,
                version: '1.0'
            },
            data: this.generateReport(),
            rawEvents: this.eventHistory
        };
    }

    /**
     * 統計のリセット
     */
    resetStats(): void {
        this.performanceStats = {
            shareRequests: 0,
            successfulShares: 0,
            failedShares: 0,
            averageResponseTime: 0,
            platformBreakdown: {}
        };
        
        this.errorStats = {
            total: 0,
            byType: {},
            byPlatform: {},
            recent: []
        };
        
        this.userBehaviorStats = {
            sharePromptViews: 0,
            sharePromptAccepts: 0,
            sharePromptDismissals: 0,
            screenshotCaptures: 0,
            averageTimeToShare: 0
        };
        
        this.i18nStats = {
            languageUsage: new Map(),
            regionUsage: new Map(),
            translationRequests: 0,
            translationErrors: 0,
            cachedTranslations: 0
        };
        
        this.eventHistory = [];
        this.timestamps.sessionStart = Date.now();
    }

    /**
     * デバッグ情報の取得
     * @returns {Object} デバッグ情報
     */
    getDebugInfo(): any {
        return {
            performance: this.getPerformanceStats(),
            errors: this.getErrorStats(),
            userBehavior: this.getUserBehaviorStats(),
            i18n: this.getI18nStats()
        };
    }
}