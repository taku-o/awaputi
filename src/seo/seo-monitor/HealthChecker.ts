/**
 * HealthChecker - SEO健全性チェックシステム
 * 
 * SEOシステム健全性チェック、アラート管理、ダッシュボードデータ生成を専門的に管理します
 */

// 健全性チェック結果インターフェース
interface HealthCheck {
    timestamp: number;
    status: 'healthy' | 'warning' | 'critical' | 'error';
    checks: Record<string, boolean>;
    issues: string[];
    recommendations: string[];
    error?: string;
}

// アラートインターフェース
interface Alert {
    id: string;
    type: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    metadata: Record<string, any>;
    timestamp: number;
    resolved: boolean;
}

// 設定インターフェース
interface HealthCheckerConfig {
    alertsEnabled: boolean;
    checkInterval?: number;
    maxHealthChecks?: number;
    maxAlerts?: number;
}

// モニタリングデータインターフェース
interface MonitoringData {
    healthChecks: HealthCheck[];
    alerts: Alert[];
    lighthouseScores: LighthouseScore[];
    coreWebVitals: CoreWebVitals[];
    socialEngagement: SocialEngagementData[];
}

// Lighthouseスコアインターフェース
interface LighthouseScore {
    timestamp: number;
    score: number;
    category?: string;
    details?: Record<string, any>;
}

// Core Web Vitalsインターフェース
interface CoreWebVitals {
    timestamp: number;
    fcp: number; // First Contentful Paint
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
}

// ソーシャルエンゲージメントデータインターフェース
interface SocialEngagementData {
    timestamp: number;
    totalShares: number;
    platform: string;
    engagement: number;
}

// ダッシュボードデータインターフェース
interface DashboardData {
    overview: OverviewData;
    performance: PerformanceData;
    social: SocialData;
    health: HealthData;
    alerts: AlertsData;
    error?: string;
    timestamp?: number;
}

// 概要データインターフェース
interface OverviewData {
    currentSEOScore: number;
    healthStatus: string;
    totalAlerts: number;
    criticalAlerts: number;
    lastUpdate: number;
}

// パフォーマンスデータインターフェース
interface PerformanceData {
    lighthouseScores: LighthouseScore[];
    coreWebVitals: CoreWebVitals[];
    trends: Record<string, any>;
}

// ソーシャルデータインターフェース
interface SocialData {
    totalShares: number;
    platformBreakdown: Record<string, any>;
    engagementTrend: any[];
}

// 健康データインターフェース
interface HealthData {
    recentChecks: HealthCheck[];
    systemStatus: string;
    recommendations: string[];
}

// アラートデータインターフェース
interface AlertsData {
    recent: Alert[];
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
}

// SEOエラーログインターフェース
interface SEOError {
    timestamp: number;
    message: string;
    type: string;
    severity: string;
}

// アラートコールバック関数型
type AlertCallback = (alert: Alert) => void;

// ログ用インターフェース
interface SEOLogger {
    info(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, error: Error): void;
}

// グローバルウィンドウ拡張
declare global {
    interface Window {
        seoMetaManager?: any;
        structuredDataEngine?: any;
        socialMediaOptimizer?: any;
    }
}

export class HealthChecker {
    private config: HealthCheckerConfig;
    private monitoringData: MonitoringData;
    private seoLogger: SEOLogger;
    private alertCallbacks: AlertCallback[];
    private lastHealthCheck: HealthCheck | null;
    
    constructor(
        config: HealthCheckerConfig,
        monitoringData: MonitoringData,
        seoLogger: SEOLogger,
        alertCallbacks: AlertCallback[]
    ) {
        this.config = config;
        this.monitoringData = monitoringData;
        this.seoLogger = seoLogger;
        this.alertCallbacks = alertCallbacks;
        this.lastHealthCheck = null;
    }
    
    /**
     * 健全性チェックの実行
     */
    async runHealthCheck(): Promise<HealthCheck> {
        try {
            const healthCheck: HealthCheck = {
                timestamp: Date.now(),
                status: 'healthy',
                checks: {},
                issues: [],
                recommendations: []
            };
            
            // SEOシステムコンポーネントの確認
            healthCheck.checks.seoMetaManager = !!window.seoMetaManager;
            healthCheck.checks.structuredDataEngine = !!window.structuredDataEngine;
            healthCheck.checks.socialMediaOptimizer = !!window.socialMediaOptimizer;
            
            // 重要なメタタグの確認
            healthCheck.checks.titleTag = !!document.querySelector('title');
            healthCheck.checks.descriptionTag = !!document.querySelector('meta[name="description"]');
            healthCheck.checks.ogTags = document.querySelectorAll('meta[property^="og:"]').length > 0;
            healthCheck.checks.twitterCard = !!document.querySelector('meta[name="twitter:card"]');
            
            // 構造化データの確認
            const structuredDataScripts = document.querySelectorAll('script[type="application/ld+json"]');
            healthCheck.checks.structuredData = structuredDataScripts.length > 0;
            
            // 問題の特定
            Object.entries(healthCheck.checks).forEach(([check, passed]) => {
                if (!passed) {
                    healthCheck.status = 'warning';
                    healthCheck.issues.push(`Failed check: ${check}`);
                    healthCheck.recommendations.push(this.getRecommendation(check));
                }
            });
            
            // エラーログの確認
            const recentErrors = this.getRecentSEOErrors();
            if (recentErrors.length > 0) {
                healthCheck.status = 'critical';
                healthCheck.issues.push(`${recentErrors.length} recent SEO errors`);
                healthCheck.recommendations.push('Check SEO error logs and resolve issues');
            }
            
            this.monitoringData.healthChecks.push(healthCheck);
            this.lastHealthCheck = healthCheck;
            
            // 重要な問題がある場合はアラートを作成
            if (healthCheck.status === 'critical') {
                this.createAlert(
                    'health_check_critical',
                    'critical',
                    `Health check failed: ${healthCheck.issues.join(', ')}`
                );
            }
            
            // データサイズ制限
            const maxHealthChecks = this.config.maxHealthChecks || 50;
            if (this.monitoringData.healthChecks.length > maxHealthChecks) {
                this.monitoringData.healthChecks = this.monitoringData.healthChecks.slice(-maxHealthChecks);
            }
            
            console.log('Health check completed', healthCheck);
            return healthCheck;
            
        } catch (error) {
            console.error('Health check failed', error);
            this.createAlert('health_check_error', 'critical', (error as Error).message);
            
            return {
                timestamp: Date.now(),
                status: 'error',
                checks: {},
                issues: [],
                recommendations: [],
                error: (error as Error).message
            };
        }
    }
    
    /**
     * SEOパフォーマンスダッシュボードデータの生成
     */
    generateDashboardData(): DashboardData {
        try {
            const now = Date.now();
            const dayAgo = now - (24 * 60 * 60 * 1000);
            const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
            
            return {
                overview: {
                    currentSEOScore: this.getCurrentSEOScore(),
                    healthStatus: this.lastHealthCheck?.status || 'unknown',
                    totalAlerts: this.monitoringData.alerts.length,
                    criticalAlerts: this.monitoringData.alerts.filter(a => a.severity === 'critical').length,
                    lastUpdate: now
                },
                performance: {
                    lighthouseScores: this.getRecentData('lighthouseScores', weekAgo) as LighthouseScore[],
                    coreWebVitals: this.getRecentData('coreWebVitals', dayAgo) as CoreWebVitals[],
                    trends: this.calculateTrends()
                },
                social: {
                    totalShares: this.getTotalSocialShares(),
                    platformBreakdown: this.getSocialPlatformBreakdown(),
                    engagementTrend: this.getSocialEngagementTrend()
                },
                health: {
                    recentChecks: this.getRecentData('healthChecks', dayAgo) as HealthCheck[],
                    systemStatus: this.getSystemStatus(),
                    recommendations: this.getActiveRecommendations()
                },
                alerts: {
                    recent: this.getRecentAlerts(dayAgo),
                    byType: this.getAlertsByType(),
                    bySeverity: this.getAlertsBySeverity()
                }
            };
        } catch (error) {
            console.error('Failed to generate dashboard data', error);
            return {
                overview: {
                    currentSEOScore: 0,
                    healthStatus: 'error',
                    totalAlerts: 0,
                    criticalAlerts: 0,
                    lastUpdate: Date.now()
                },
                performance: {
                    lighthouseScores: [],
                    coreWebVitals: [],
                    trends: {}
                },
                social: {
                    totalShares: 0,
                    platformBreakdown: {},
                    engagementTrend: []
                },
                health: {
                    recentChecks: [],
                    systemStatus: 'error',
                    recommendations: []
                },
                alerts: {
                    recent: [],
                    byType: {},
                    bySeverity: {}
                },
                error: (error as Error).message,
                timestamp: Date.now()
            };
        }
    }
    
    /**
     * アラートの作成
     */
    createAlert(type: string, severity: 'info' | 'warning' | 'critical', message: string, metadata: Record<string, any> = {}): Alert {
        const alert: Alert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            severity,
            message,
            metadata,
            timestamp: Date.now(),
            resolved: false
        };
        
        this.monitoringData.alerts.push(alert);
        
        // アラートコールバックの実行
        if (this.config.alertsEnabled) {
            this.alertCallbacks.forEach(callback => {
                try {
                    callback(alert);
                } catch (error) {
                    console.error('Alert callback failed', error);
                }
            });
        }
        
        console.warn(`SEO Alert [${severity}]: ${message}`, alert);
        
        // データサイズ制限
        const maxAlerts = this.config.maxAlerts || 200;
        if (this.monitoringData.alerts.length > maxAlerts) {
            this.monitoringData.alerts = this.monitoringData.alerts.slice(-maxAlerts);
        }
        
        return alert;
    }
    
    /**
     * 最近のSEOエラーの取得
     */
    getRecentSEOErrors(): SEOError[] {
        try {
            const errorLog = JSON.parse(localStorage.getItem('seo_error_log') || '[]');
            const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
            return errorLog.filter((error: SEOError) => error.timestamp >= dayAgo);
        } catch (error) {
            return [];
        }
    }
    
    /**
     * 推奨事項の取得
     */
    getRecommendation(checkType: string): string {
        const recommendations: Record<string, string> = {
            titleTag: 'Add a title tag to improve SEO',
            descriptionTag: 'Add a meta description tag',
            ogTags: 'Add Open Graph meta tags for social sharing',
            twitterCard: 'Add Twitter Card meta tags',
            structuredData: 'Add structured data markup',
            seoMetaManager: 'SEO Meta Manager is not initialized',
            structuredDataEngine: 'Structured Data Engine is not initialized',
            socialMediaOptimizer: 'Social Media Optimizer is not initialized'
        };
        
        return recommendations[checkType] || 'Review SEO configuration';
    }
    
    // ユーティリティメソッド
    getCurrentSEOScore(): number {
        const scores = this.monitoringData.lighthouseScores;
        return scores.length > 0 ? scores[scores.length - 1].score : 0;
    }
    
    getRecentData(type: keyof MonitoringData, since: number): (HealthCheck | Alert | LighthouseScore | CoreWebVitals | SocialEngagementData)[] {
        return this.monitoringData[type].filter((item: any) => item.timestamp >= since);
    }
    
    getRecentAlerts(since: number): Alert[] {
        return this.monitoringData.alerts.filter(alert => alert.timestamp >= since);
    }
    
    getTotalSocialShares(): number {
        return this.monitoringData.socialEngagement.reduce((total, data) => total + data.totalShares, 0);
    }
    
    calculateTrends(): Record<string, any> {
        // 実装予定：トレンド計算ロジック
        return {};
    }
    
    getSocialPlatformBreakdown(): Record<string, any> {
        // 実装予定：プラットフォーム別分析
        const breakdown: Record<string, number> = {};
        this.monitoringData.socialEngagement.forEach(data => {
            breakdown[data.platform] = (breakdown[data.platform] || 0) + data.totalShares;
        });
        return breakdown;
    }
    
    getSocialEngagementTrend(): any[] {
        // 実装予定：エンゲージメントトレンド
        return this.monitoringData.socialEngagement.slice(-30); // 直近30件
    }
    
    getSystemStatus(): string {
        if (this.lastHealthCheck) {
            switch (this.lastHealthCheck.status) {
                case 'healthy':
                    return 'operational';
                case 'warning':
                    return 'degraded';
                case 'critical':
                    return 'critical';
                case 'error':
                    return 'error';
                default:
                    return 'unknown';
            }
        }
        return 'unknown';
    }
    
    getActiveRecommendations(): string[] {
        if (this.lastHealthCheck) {
            return this.lastHealthCheck.recommendations;
        }
        return [];
    }
    
    getAlertsByType(): Record<string, number> {
        const types: Record<string, number> = {};
        this.monitoringData.alerts.forEach(alert => {
            types[alert.type] = (types[alert.type] || 0) + 1;
        });
        return types;
    }
    
    getAlertsBySeverity(): Record<string, number> {
        const severities: Record<string, number> = {};
        this.monitoringData.alerts.forEach(alert => {
            severities[alert.severity] = (severities[alert.severity] || 0) + 1;
        });
        return severities;
    }
    
    /**
     * アラートの解決
     */
    resolveAlert(alertId: string): boolean {
        const alert = this.monitoringData.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.resolved = true;
            return true;
        }
        return false;
    }
    
    /**
     * 全健全性チェック履歴の取得
     */
    getHealthCheckHistory(limit?: number): HealthCheck[] {
        if (limit) {
            return this.monitoringData.healthChecks.slice(-limit);
        }
        return [...this.monitoringData.healthChecks];
    }
    
    /**
     * 特定期間のアラート取得
     */
    getAlertsInRange(start: number, end: number): Alert[] {
        return this.monitoringData.alerts.filter(
            alert => alert.timestamp >= start && alert.timestamp <= end
        );
    }
    
    /**
     * 健全性スコアの計算
     */
    calculateHealthScore(): number {
        if (!this.lastHealthCheck) return 0;
        
        const totalChecks = Object.keys(this.lastHealthCheck.checks).length;
        const passedChecks = Object.values(this.lastHealthCheck.checks).filter(Boolean).length;
        
        if (totalChecks === 0) return 0;
        
        const baseScore = (passedChecks / totalChecks) * 100;
        
        // 重要な問題がある場合はスコアを調整
        if (this.lastHealthCheck.status === 'critical') {
            return Math.min(baseScore * 0.5, 50);
        } else if (this.lastHealthCheck.status === 'warning') {
            return Math.min(baseScore * 0.8, 80);
        }
        
        return Math.round(baseScore);
    }
    
    /**
     * 初期化状態の取得
     */
    getInitializationStatus(): Record<string, boolean> {
        return {
            seoMetaManager: !!window.seoMetaManager,
            structuredDataEngine: !!window.structuredDataEngine,
            socialMediaOptimizer: !!window.socialMediaOptimizer
        };
    }
    
    /**
     * リソースのクリーンアップ
     */
    cleanup(): void {
        this.alertCallbacks = [];
        console.log('HealthChecker cleaned up');
    }
}