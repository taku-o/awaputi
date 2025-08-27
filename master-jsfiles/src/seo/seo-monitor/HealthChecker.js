/**
 * HealthChecker - SEO健全性チェックシステム
 * 
 * SEOシステム健全性チェック、アラート管理、ダッシュボードデータ生成を専門的に管理します
 */
export class HealthChecker {
    constructor(config, monitoringData, seoLogger, alertCallbacks) {
        this.config = config;
        this.monitoringData = monitoringData;
        this.seoLogger = seoLogger;
        this.alertCallbacks = alertCallbacks;
        this.lastHealthCheck = null;
    }
    
    /**
     * 健全性チェックの実行
     */
    async runHealthCheck() {
        try {
            const healthCheck = {
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
                this.createAlert('health_check_critical', 'critical', 
                    `Health check failed: ${healthCheck.issues.join(', ')}`);
            }

            // データサイズ制限
            if (this.monitoringData.healthChecks.length > 50) {
                this.monitoringData.healthChecks = this.monitoringData.healthChecks.slice(-50);
            }

            console.log('Health check completed', healthCheck);
            return healthCheck;

        } catch (error) {
            console.error('Health check failed', error);
            this.createAlert('health_check_error', 'critical', error.message);
            return {
                timestamp: Date.now(),
                status: 'error',
                error: error.message
            };
        }
    }
    
    /**
     * SEOパフォーマンスダッシュボードデータの生成
     */
    generateDashboardData() {
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
                    lighthouseScores: this.getRecentData('lighthouseScores', weekAgo),
                    coreWebVitals: this.getRecentData('coreWebVitals', dayAgo),
                    trends: this.calculateTrends()
                },
                social: {
                    totalShares: this.getTotalSocialShares(),
                    platformBreakdown: this.getSocialPlatformBreakdown(),
                    engagementTrend: this.getSocialEngagementTrend()
                },
                health: {
                    recentChecks: this.getRecentData('healthChecks', dayAgo),
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
                error: error.message,
                timestamp: Date.now()
            };
        }
    }
    
    /**
     * アラートの作成
     */
    createAlert(type, severity, message, metadata = {}) {
        const alert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            severity, // 'info', 'warning', 'critical'
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
        if (this.monitoringData.alerts.length > 200) {
            this.monitoringData.alerts = this.monitoringData.alerts.slice(-200);
        }

        return alert;
    }
    
    /**
     * 最近のSEOエラーの取得
     */
    getRecentSEOErrors() {
        try {
            const errorLog = JSON.parse(localStorage.getItem('seo_error_log') || '[]');
            const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
            return errorLog.filter(error => error.timestamp >= dayAgo);
        } catch (error) {
            return [];
        }
    }
    
    /**
     * 推奨事項の取得
     */
    getRecommendation(checkType) {
        const recommendations = {
            titleTag: 'Add a title tag to improve SEO',
            descriptionTag: 'Add a meta description tag',
            ogTags: 'Add Open Graph meta tags for social sharing',
            twitterCard: 'Add Twitter Card meta tags',
            structuredData: 'Add structured data markup'
        };
        return recommendations[checkType] || 'Review SEO configuration';
    }
    
    // ユーティリティメソッド
    getCurrentSEOScore() {
        const scores = this.monitoringData.lighthouseScores;
        return scores.length > 0 ? scores[scores.length - 1].score : 0;
    }

    getRecentData(type, since) {
        return this.monitoringData[type].filter(item => item.timestamp >= since);
    }

    getRecentAlerts(since) {
        return this.monitoringData.alerts.filter(alert => alert.timestamp >= since);
    }

    getTotalSocialShares() {
        return this.monitoringData.socialEngagement.reduce((total, data) => total + data.totalShares, 0);
    }
    
    calculateTrends() { return {}; }
    getSocialPlatformBreakdown() { return {}; }
    getSocialEngagementTrend() { return []; }
    getSystemStatus() { return 'operational'; }
    getActiveRecommendations() { return []; }
    
    getAlertsByType() { 
        const types = {};
        this.monitoringData.alerts.forEach(alert => {
            types[alert.type] = (types[alert.type] || 0) + 1;
        });
        return types;
    }
    
    getAlertsBySeverity() { 
        const severities = {};
        this.monitoringData.alerts.forEach(alert => {
            severities[alert.severity] = (severities[alert.severity] || 0) + 1;
        });
        return severities;
    }
}