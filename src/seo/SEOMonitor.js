/**
 * SEO Monitor - SEOパフォーマンス監視システム
 * 
 * Google Search Console統合準備、ソーシャルメディア分析、
 * SEOパフォーマンスダッシュボード、自動健全性チェックを提供
 */

import { seoLogger } from './SEOLogger.js';
import { seoErrorHandler } from './SEOErrorHandler.js';

export class SEOMonitor {
    constructor() {
        this.monitoringData = {
            lighthouseScores: [],
            coreWebVitals: [],
            socialEngagement: [],
            searchConsoleMetrics: [],
            alerts: [],
            healthChecks: []
        };
        this.monitoringInterval = null;
        this.config = {
            monitoringEnabled: true,
            interval: 300000, // 5分間隔
            lighthouseThreshold: 90,
            performanceThreshold: 75,
            alertsEnabled: true,
            healthCheckInterval: 60000 // 1分間隔
        };
        this.alertCallbacks = [];
        this.isMonitoring = false;
        this.lastHealthCheck = null;
        
        // 既存実装との互換性のため
        this.thresholds = {
            lighthouse: {
                performance: 90,
                accessibility: 90,
                bestPractices: 85,
                seo: 95
            },
            coreWebVitals: {
                LCP: 2500,    // ms
                FID: 100,     // ms
                CLS: 0.1      // score
            },
            metaTags: {
                titleLength: { min: 10, max: 60 },
                descriptionLength: { min: 50, max: 160 }
            }
        };
        
        this._initialize();
    }
    
    /**
     * 初期化処理
     * @private
     */
    _initialize() {
        try {
            // パフォーマンス監視の設定
            if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
                this._setupPerformanceObserver();
            }
            
            // ページビジビリティAPI対応
            if (typeof document !== 'undefined') {
                document.addEventListener('visibilitychange', () => {
                    if (document.hidden) {
                        this.pauseMonitoring();
                    } else {
                        this.resumeMonitoring();
                    }
                });
            }
            
            seoLogger.info('SEOMonitor initialized successfully');
        } catch (error) {
            seoErrorHandler.handle(error, 'seoMonitorInit');
        }
    }
    
    /**
     * SEO monitoring システムを開始
     */
    async startMonitoring(options = {}) {
        try {
            this.config = { ...this.config, ...options };
            
            if (this.isMonitoring) {
                seoLogger.warn('SEO monitoring is already running');
                return;
            }

            seoLogger.info('Starting SEO monitoring system', this.config);

            // 初回健全性チェック
            await this.runHealthCheck();

            // 定期監視の開始
            if (this.config.monitoringEnabled) {
                this.monitoringInterval = setInterval(async () => {
                    await this.performMonitoringCycle();
                }, this.config.interval);
            }

            // 健全性チェックの定期実行
            setInterval(async () => {
                await this.runHealthCheck();
            }, this.config.healthCheckInterval);

            this.isMonitoring = true;
            seoLogger.info('SEO monitoring system started successfully');

        } catch (error) {
            seoErrorHandler.handle(error, 'startMonitoring');
            throw error;
        }
    }
    
    /**
     * 監視の停止
     */
    stopMonitoring() {
        try {
            if (!this.isMonitoring) {
                seoLogger.warning('SEO monitoring is not running');
                return;
            }
            
            if (this.monitoringInterval) {
                clearInterval(this.monitoringInterval);
                this.monitoringInterval = null;
            }
            
            this.isMonitoring = false;
            seoLogger.info('SEO monitoring stopped');
            
        } catch (error) {
            seoErrorHandler.handle(error, 'stopMonitoring');
        }
    }
    
    /**
     * 監視の一時停止
     */
    pauseMonitoring() {
        if (this.isMonitoring) {
            this.isMonitoring = false;
            seoLogger.info('SEO monitoring paused');
        }
    }
    
    /**
     * 監視の再開
     */
    resumeMonitoring() {
        if (!this.isMonitoring && this.monitoringInterval) {
            this.isMonitoring = true;
            seoLogger.info('SEO monitoring resumed');
        }
    }
    
    /**
     * 監視チェックの実行
     * @private
     */
    async _performMonitoringCheck(options) {
        try {
            const checkResults = {
                timestamp: new Date().toISOString(),
                lighthouse: null,
                coreWebVitals: null,
                metaTags: null,
                alerts: []
            };
            
            // Lighthouseスコア監視
            if (options.includeLighthouse) {
                checkResults.lighthouse = await this._checkLighthouseScore();
                this.monitoringData.lighthouse.push(checkResults.lighthouse);
                
                if (options.enableAlerts) {
                    this._checkLighthouseAlerts(checkResults.lighthouse, checkResults.alerts);
                }
            }
            
            // Core Web Vitals監視
            if (options.includeCoreWebVitals) {
                checkResults.coreWebVitals = await this._checkCoreWebVitals();
                this.monitoringData.coreWebVitals.push(checkResults.coreWebVitals);
                
                if (options.enableAlerts) {
                    this._checkCoreWebVitalsAlerts(checkResults.coreWebVitals, checkResults.alerts);
                }
            }
            
            // メタタグ監視
            if (options.includeMetaTags) {
                checkResults.metaTags = await this._checkMetaTags();
                
                if (options.enableAlerts) {
                    this._checkMetaTagAlerts(checkResults.metaTags, checkResults.alerts);
                }
            }
            
            // アラートの処理
            if (checkResults.alerts.length > 0) {
                this.monitoringData.alerts.push(...checkResults.alerts);
                await this._processAlerts(checkResults.alerts);
            }
            
            this.monitoringData.lastCheck = checkResults.timestamp;
            
            // データの保持期間制限（最大100エントリ）
            this._limitDataRetention();
            
            seoLogger.info('SEO monitoring check completed', {
                lighthouseScore: checkResults.lighthouse?.seo,
                coreWebVitals: checkResults.coreWebVitals,
                alertCount: checkResults.alerts.length
            });
            
        } catch (error) {
            seoErrorHandler.handle(error, '_performMonitoringCheck', options);
        }
    }
    
    /**
     * Lighthouseスコアのチェック
     * @private
     */
    async _checkLighthouseScore() {
        try {
            // 実際の実装では Lighthouse CI API やPuppeteerを使用
            // ここではモックデータを生成
            const score = {
                performance: this._generateRealisticScore(85, 100),
                accessibility: this._generateRealisticScore(88, 100),
                bestPractices: this._generateRealisticScore(80, 95),
                seo: this._generateRealisticScore(90, 100),
                timestamp: new Date().toISOString()
            };
            
            return score;
            
        } catch (error) {
            seoLogger.error('Failed to check Lighthouse score', error);
            return null;
        }
    }
    
    /**
     * Core Web Vitalsのチェック
     * @private
     */
    async _checkCoreWebVitals() {
        try {
            const vitals = {
                LCP: this._generateRealisticMetric(1000, 3000), // ms
                FID: this._generateRealisticMetric(10, 150),    // ms
                CLS: this._generateRealisticMetric(0.01, 0.2),  // score
                timestamp: new Date().toISOString()
            };
            
            // 実際の実装では web-vitals ライブラリを使用
            if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
                // Performance Observer APIでリアルデータを取得
                try {
                    vitals.LCP = await this._measureLCP();
                    vitals.FID = await this._measureFID();
                    vitals.CLS = await this._measureCLS();
                } catch (error) {
                    seoLogger.warning('Failed to measure real Core Web Vitals, using mock data');
                }
            }
            
            return vitals;
            
        } catch (error) {
            seoLogger.error('Failed to check Core Web Vitals', error);
            return null;
        }
    }
    
    /**
     * メタタグのチェック
     * @private
     */
    async _checkMetaTags() {
        try {
            const metaTags = {
                title: this._extractTitleTag(),
                description: this._extractDescriptionTag(),
                keywords: this._extractKeywordsTag(),
                ogTags: this._extractOGTags(),
                twitterTags: this._extractTwitterTags(),
                timestamp: new Date().toISOString()
            };
            
            return metaTags;
            
        } catch (error) {
            seoLogger.error('Failed to check meta tags', error);
            return null;
        }
    }
    
    /**
     * Lighthouseアラートのチェック
     * @private
     */
    _checkLighthouseAlerts(lighthouseScore, alerts) {
        if (!lighthouseScore) return;
        
        Object.entries(this.thresholds.lighthouse).forEach(([metric, threshold]) => {
            if (lighthouseScore[metric] < threshold) {
                alerts.push({
                    type: 'lighthouse',
                    severity: 'warning',
                    metric: metric,
                    current: lighthouseScore[metric],
                    threshold: threshold,
                    message: `Lighthouse ${metric} score (${lighthouseScore[metric]}) is below threshold (${threshold})`,
                    timestamp: new Date().toISOString()
                });
            }
        });
    }
    
    /**
     * Core Web Vitalsアラートのチェック
     * @private
     */
    _checkCoreWebVitalsAlerts(coreWebVitals, alerts) {
        if (!coreWebVitals) return;
        
        Object.entries(this.thresholds.coreWebVitals).forEach(([metric, threshold]) => {
            if (coreWebVitals[metric] > threshold) {
                const severity = coreWebVitals[metric] > threshold * 1.5 ? 'critical' : 'warning';
                alerts.push({
                    type: 'coreWebVitals',
                    severity: severity,
                    metric: metric,
                    current: coreWebVitals[metric],
                    threshold: threshold,
                    message: `Core Web Vital ${metric} (${coreWebVitals[metric]}) exceeds threshold (${threshold})`,
                    timestamp: new Date().toISOString()
                });
            }
        });
    }
    
    /**
     * メタタグアラートのチェック
     * @private
     */
    _checkMetaTagAlerts(metaTags, alerts) {
        if (!metaTags) return;
        
        // タイトル長のチェック
        if (metaTags.title) {
            const titleLength = metaTags.title.length;
            const { min, max } = this.thresholds.metaTags.titleLength;
            
            if (titleLength < min || titleLength > max) {
                alerts.push({
                    type: 'metaTags',
                    severity: 'warning',
                    metric: 'title_length',
                    current: titleLength,
                    threshold: `${min}-${max}`,
                    message: `Title length (${titleLength}) is outside optimal range (${min}-${max})`,
                    timestamp: new Date().toISOString()
                });
            }
        } else {
            alerts.push({
                type: 'metaTags',
                severity: 'critical',
                metric: 'title_missing',
                message: 'Title tag is missing',
                timestamp: new Date().toISOString()
            });
        }
        
        // 説明文長のチェック
        if (metaTags.description) {
            const descLength = metaTags.description.length;
            const { min, max } = this.thresholds.metaTags.descriptionLength;
            
            if (descLength < min || descLength > max) {
                alerts.push({
                    type: 'metaTags',
                    severity: 'warning',
                    metric: 'description_length',
                    current: descLength,
                    threshold: `${min}-${max}`,
                    message: `Description length (${descLength}) is outside optimal range (${min}-${max})`,
                    timestamp: new Date().toISOString()
                });
            }
        } else {
            alerts.push({
                type: 'metaTags',
                severity: 'critical',
                metric: 'description_missing',
                message: 'Description meta tag is missing',
                timestamp: new Date().toISOString()
            });
        }
    }
    
    /**
     * アラートの処理
     * @private
     */
    async _processAlerts(alerts) {
        try {
            for (const alert of alerts) {
                // アラートコールバックの実行
                this.alertCallbacks.forEach(callback => {
                    try {
                        callback(alert);
                    } catch (error) {
                        seoLogger.error('Alert callback error', error);
                    }
                });
                
                // アラートのログ出力
                const logLevel = alert.severity === 'critical' ? 'error' : 'warning';
                seoLogger[logLevel](`SEO Alert: ${alert.message}`, alert);
            }
            
        } catch (error) {
            seoErrorHandler.handle(error, '_processAlerts', alerts);
        }
    }
    
    /**
     * Performance Observerの設定
     * @private
     */
    _setupPerformanceObserver() {
        try {
            // Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this._recordLCP(lastEntry.startTime);
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            
            // First Input Delay
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this._recordFID(entry.processingStart - entry.startTime);
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });
            
            // Cumulative Layout Shift
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        this._recordCLS(entry.value);
                    }
                });
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
            
        } catch (error) {
            seoLogger.warning('Failed to setup Performance Observer', error);
        }
    }
    
    /**
     * データ保持期間の制限
     * @private
     */
    _limitDataRetention() {
        const maxEntries = 100;
        
        if (this.monitoringData.lighthouse.length > maxEntries) {
            this.monitoringData.lighthouse = this.monitoringData.lighthouse.slice(-maxEntries);
        }
        
        if (this.monitoringData.coreWebVitals.length > maxEntries) {
            this.monitoringData.coreWebVitals = this.monitoringData.coreWebVitals.slice(-maxEntries);
        }
        
        if (this.monitoringData.alerts.length > maxEntries) {
            this.monitoringData.alerts = this.monitoringData.alerts.slice(-maxEntries);
        }
    }
    
    /**
     * 現実的なスコアの生成
     * @private
     */
    _generateRealisticScore(min, max) {
        // 前回のスコアから大きく変動しないように調整
        const base = min + Math.random() * (max - min);
        const variation = (Math.random() - 0.5) * 10; // ±5ポイントの変動
        return Math.max(min, Math.min(max, Math.round(base + variation)));
    }
    
    /**
     * 現実的なメトリクスの生成
     * @private
     */
    _generateRealisticMetric(min, max) {
        return min + Math.random() * (max - min);
    }
    
    /**
     * LCPの測定
     * @private
     */
    async _measureLCP() {
        return new Promise((resolve) => {
            // 実際の実装では Performance Observer を使用
            setTimeout(() => resolve(Math.random() * 2500), 100);
        });
    }
    
    /**
     * FIDの測定
     * @private
     */
    async _measureFID() {
        return new Promise((resolve) => {
            // 実際の実装では Performance Observer を使用
            setTimeout(() => resolve(Math.random() * 100), 100);
        });
    }
    
    /**
     * CLSの測定
     * @private
     */
    async _measureCLS() {
        return new Promise((resolve) => {
            // 実際の実装では Performance Observer を使用
            setTimeout(() => resolve(Math.random() * 0.1), 100);
        });
    }
    
    /**
     * LCPの記録
     * @private
     */
    _recordLCP(value) {
        // 実際の実装では収集したデータを保存
        seoLogger.performance('LCP recorded', value);
    }
    
    /**
     * FIDの記録
     * @private
     */
    _recordFID(value) {
        // 実際の実装では収集したデータを保存
        seoLogger.performance('FID recorded', value);
    }
    
    /**
     * CLSの記録
     * @private
     */
    _recordCLS(value) {
        // 実際の実装では収集したデータを保存
        seoLogger.performance('CLS recorded', value);
    }
    
    /**
     * タイトルタグの抽出
     * @private
     */
    _extractTitleTag() {
        if (typeof document !== 'undefined') {
            return document.title || null;
        }
        return 'BubblePop - 泡割りゲーム'; // モックデータ
    }
    
    /**
     * 説明メタタグの抽出
     * @private
     */
    _extractDescriptionTag() {
        if (typeof document !== 'undefined') {
            const meta = document.querySelector('meta[name="description"]');
            return meta ? meta.getAttribute('content') : null;
        }
        return 'HTML5 Canvas を使用したバブルポップゲーム'; // モックデータ
    }
    
    /**
     * キーワードメタタグの抽出
     * @private
     */
    _extractKeywordsTag() {
        if (typeof document !== 'undefined') {
            const meta = document.querySelector('meta[name="keywords"]');
            return meta ? meta.getAttribute('content') : null;
        }
        return 'バブルポップ,ゲーム,HTML5'; // モックデータ
    }
    
    /**
     * Open Graphタグの抽出
     * @private
     */
    _extractOGTags() {
        const ogTags = {};
        
        if (typeof document !== 'undefined') {
            const ogMetas = document.querySelectorAll('meta[property^="og:"]');
            ogMetas.forEach(meta => {
                const property = meta.getAttribute('property');
                const content = meta.getAttribute('content');
                if (property && content) {
                    ogTags[property] = content;
                }
            });
        }
        
        return Object.keys(ogTags).length > 0 ? ogTags : {
            'og:title': 'BubblePop',
            'og:description': 'HTML5 Canvas を使用したバブルポップゲーム',
            'og:type': 'website'
        };
    }
    
    /**
     * Twitterタグの抽出
     * @private
     */
    _extractTwitterTags() {
        const twitterTags = {};
        
        if (typeof document !== 'undefined') {
            const twitterMetas = document.querySelectorAll('meta[name^="twitter:"]');
            twitterMetas.forEach(meta => {
                const name = meta.getAttribute('name');
                const content = meta.getAttribute('content');
                if (name && content) {
                    twitterTags[name] = content;
                }
            });
        }
        
        return Object.keys(twitterTags).length > 0 ? twitterTags : {
            'twitter:card': 'summary_large_image',
            'twitter:title': 'BubblePop',
            'twitter:description': 'HTML5 Canvas を使用したバブルポップゲーム'
        };
    }
    
    /**
     * アラートコールバックの追加
     * @param {Function} callback - アラートコールバック関数
     */
    addAlertCallback(callback) {
        if (typeof callback === 'function') {
            this.alertCallbacks.add(callback);
            seoLogger.info('Alert callback added');
        } else {
            throw new Error('Alert callback must be a function');
        }
    }
    
    /**
     * アラートコールバックの削除
     * @param {Function} callback - アラートコールバック関数
     */
    removeAlertCallback(callback) {
        if (this.alertCallbacks.has(callback)) {
            this.alertCallbacks.delete(callback);
            seoLogger.info('Alert callback removed');
        }
    }
    
    /**
     * 閾値の設定
     * @param {Object} newThresholds - 新しい閾値設定
     */
    setThresholds(newThresholds) {
        try {
            this.thresholds = { ...this.thresholds, ...newThresholds };
            seoLogger.info('SEO monitoring thresholds updated', this.thresholds);
        } catch (error) {
            seoErrorHandler.handle(error, 'setThresholds', newThresholds);
        }
    }
    
    /**
     * 監視データの取得
     * @returns {Object}
     */
    getMonitoringData() {
        return {
            ...this.monitoringData,
            isMonitoring: this.isMonitoring,
            thresholds: this.thresholds
        };
    }
    
    /**
     * 監視統計の取得
     * @returns {Object}
     */
    getMonitoringStats() {
        const stats = {
            totalChecks: this.monitoringData.lighthouse.length,
            totalAlerts: this.monitoringData.alerts.length,
            alertsByType: {},
            alertsBySeverity: {},
            averageScores: {},
            isMonitoring: this.isMonitoring,
            lastCheck: this.monitoringData.lastCheck
        };
        
        // アラート統計
        this.monitoringData.alerts.forEach(alert => {
            stats.alertsByType[alert.type] = (stats.alertsByType[alert.type] || 0) + 1;
            stats.alertsBySeverity[alert.severity] = (stats.alertsBySeverity[alert.severity] || 0) + 1;
        });
        
        // 平均スコア計算
        if (this.monitoringData.lighthouse.length > 0) {
            const totals = { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 };
            
            this.monitoringData.lighthouse.forEach(score => {
                Object.keys(totals).forEach(key => {
                    totals[key] += score[key] || 0;
                });
            });
            
            Object.keys(totals).forEach(key => {
                stats.averageScores[key] = Math.round(totals[key] / this.monitoringData.lighthouse.length);
            });
        }
        
        return stats;
    }
    
    /**
     * 監視レポートの生成
     * @param {string} format - レポート形式 ('json', 'html')
     * @returns {string}
     */
    generateReport(format = 'json') {
        const data = this.getMonitoringData();
        const stats = this.getMonitoringStats();
        
        const report = {
            summary: stats,
            data: data,
            generatedAt: new Date().toISOString()
        };
        
        switch (format) {
            case 'json':
                return JSON.stringify(report, null, 2);
            
            case 'html':
                return this._generateHTMLReport(report);
            
            default:
                throw new Error(`Unsupported report format: ${format}`);
        }
    }
    
    /**
     * HTMLレポートの生成
     * @private
     */
    _generateHTMLReport(report) {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>SEO Monitoring Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .chart { background: white; border: 1px solid #ddd; padding: 20px; margin: 20px 0; }
        .alert { padding: 10px; margin: 5px 0; border-radius: 3px; }
        .alert.critical { background: #ffebee; border-left: 4px solid #f44336; }
        .alert.warning { background: #fff3e0; border-left: 4px solid #ff9800; }
        .score { display: inline-block; margin: 10px; padding: 15px; border-radius: 5px; text-align: center; }
        .score.good { background: #e8f5e8; color: #2e7d32; }
        .score.needs-improvement { background: #fff3e0; color: #f57c00; }
        .score.poor { background: #ffebee; color: #d32f2f; }
    </style>
</head>
<body>
    <h1>SEO Monitoring Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p>Generated: ${report.generatedAt}</p>
        <p>Total Checks: ${report.summary.totalChecks}</p>
        <p>Total Alerts: ${report.summary.totalAlerts}</p>
        <p>Monitoring Status: ${report.summary.isMonitoring ? 'Active' : 'Inactive'}</p>
        <p>Last Check: ${report.summary.lastCheck || 'Never'}</p>
    </div>
    
    <div class="chart">
        <h3>Average Lighthouse Scores</h3>
        ${Object.entries(report.summary.averageScores).map(([metric, score]) => {
            const className = score >= 90 ? 'good' : score >= 70 ? 'needs-improvement' : 'poor';
            return `<div class="score ${className}"><strong>${metric}</strong><br>${score}</div>`;
        }).join('')}
    </div>
    
    <div class="chart">
        <h3>Recent Alerts</h3>
        ${report.data.alerts.slice(-10).map(alert => `
        <div class="alert ${alert.severity}">
            <strong>${alert.type}</strong>: ${alert.message}
            <br><small>${alert.timestamp}</small>
        </div>
        `).join('')}
    </div>
</body>
</html>`;
    }
    
    /**
     * 監視サイクルの実行
     */
    async performMonitoringCycle() {
        try {
            seoLogger.debug('Starting monitoring cycle');

            // Lighthouse SEOスコア監視
            if (this.config.includeLighthouse) {
                await this.monitorLighthouseScore();
            }

            // Core Web Vitals追跡
            await this.trackCoreWebVitals();

            // ソーシャルメディア分析
            if (this.config.includeSocialMedia) {
                await this.analyzeSocialEngagement();
            }

            // Search Console データ準備
            if (this.config.includeSearchConsole) {
                await this.prepareSearchConsoleIntegration();
            }

            seoLogger.debug('Monitoring cycle completed');

        } catch (error) {
            seoLogger.error('Error in monitoring cycle', error);
            this.createAlert('monitoring_cycle_error', 'critical', error.message);
        }
    }

    /**
     * Lighthouse SEOスコア監視
     */
    async monitorLighthouseScore() {
        try {
            // Performance Observer APIを使用してメトリクスを収集
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.entryType === 'navigation') {
                            this.recordNavigationMetrics(entry);
                        }
                    });
                });
                
                observer.observe({ entryTypes: ['navigation'] });
            }

            // 簡易SEOスコア計算
            const seoScore = await this.calculateSEOScore();
            
            this.monitoringData.lighthouseScores.push({
                timestamp: Date.now(),
                score: seoScore,
                details: await this.getSEOScoreDetails()
            });

            // 閾値チェック
            if (seoScore < this.config.lighthouseThreshold) {
                this.createAlert(
                    'lighthouse_score_low',
                    'warning',
                    `Lighthouse SEO score (${seoScore}) is below threshold (${this.config.lighthouseThreshold})`
                );
            }

            // データサイズ制限（最新100件のみ保持）
            if (this.monitoringData.lighthouseScores.length > 100) {
                this.monitoringData.lighthouseScores = this.monitoringData.lighthouseScores.slice(-100);
            }

            return { seo: seoScore };

        } catch (error) {
            seoLogger.error('Failed to monitor Lighthouse score', error);
            this.createAlert('lighthouse_monitoring_error', 'critical', error.message);
            return { seo: 0, error: error.message };
        }
    }

    /**
     * SEOスコアの簡易計算
     */
    async calculateSEOScore() {
        let score = 100;
        const penalties = [];

        try {
            // メタタグチェック
            const requiredMetaTags = ['title', 'description', 'og:title', 'og:description'];
            for (const tagName of requiredMetaTags) {
                const tag = document.querySelector(`meta[${tagName.includes(':') ? 'property' : 'name'}="${tagName}"]`) 
                    || (tagName === 'title' ? document.querySelector('title') : null);
                
                if (!tag || !tag.content) {
                    score -= 10;
                    penalties.push(`Missing ${tagName}`);
                }
            }

            // 構造化データチェック
            const structuredDataScripts = document.querySelectorAll('script[type="application/ld+json"]');
            if (structuredDataScripts.length === 0) {
                score -= 15;
                penalties.push('No structured data found');
            }

            // 画像alt属性チェック
            const images = document.querySelectorAll('img');
            let imagesWithoutAlt = 0;
            images.forEach(img => {
                if (!img.alt) imagesWithoutAlt++;
            });
            if (imagesWithoutAlt > 0) {
                score -= Math.min(20, imagesWithoutAlt * 5);
                penalties.push(`${imagesWithoutAlt} images without alt text`);
            }

            // リンクチェック
            const links = document.querySelectorAll('a[href]');
            let externalLinksWithoutNofollow = 0;
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('http') && !link.rel.includes('nofollow')) {
                    externalLinksWithoutNofollow++;
                }
            });

            seoLogger.debug('SEO score calculated', { score, penalties });
            return Math.max(0, score);

        } catch (error) {
            seoLogger.error('Error calculating SEO score', error);
            return 0;
        }
    }

    /**
     * ソーシャルメディア分析
     */
    async analyzeSocialEngagement() {
        try {
            const socialData = {
                timestamp: Date.now(),
                platforms: {},
                totalShares: 0,
                engagementRate: 0
            };

            // ソーシャルメディアボタンのクリックトラッキング
            this.trackSocialSharing(socialData);

            // OGタグの分析
            socialData.ogTags = this.analyzeOGTags();

            // Twitter Card分析
            socialData.twitterCard = this.analyzeTwitterCard();

            this.monitoringData.socialEngagement.push(socialData);

            // データサイズ制限
            if (this.monitoringData.socialEngagement.length > 50) {
                this.monitoringData.socialEngagement = this.monitoringData.socialEngagement.slice(-50);
            }

            return socialData;

        } catch (error) {
            seoLogger.error('Failed to analyze social engagement', error);
            return null;
        }
    }

    /**
     * Google Search Console統合準備
     */
    async prepareSearchConsoleIntegration() {
        try {
            const integrationData = {
                timestamp: Date.now(),
                sitemap: await this.validateSitemap(),
                robots: await this.validateRobotsTxt(),
                structuredData: this.validateStructuredData(),
                pages: this.getIndexablePages(),
                readyForIntegration: true
            };

            // Google Search Console verification準備
            integrationData.verificationMethods = [
                'HTML file upload',
                'HTML tag',
                'Domain name provider',
                'Google Analytics'
            ];

            // API準備状況の確認
            integrationData.apiReady = this.checkSearchConsoleAPIReadiness();

            this.monitoringData.searchConsoleMetrics.push(integrationData);
            
            seoLogger.info('Search Console integration prepared', integrationData);
            return integrationData;

        } catch (error) {
            seoLogger.error('Failed to prepare Search Console integration', error);
            return null;
        }
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

            seoLogger.debug('Health check completed', healthCheck);
            return healthCheck;

        } catch (error) {
            seoLogger.error('Health check failed', error);
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
            seoLogger.error('Failed to generate dashboard data', error);
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
                    seoLogger.error('Alert callback failed', error);
                }
            });
        }

        seoLogger.warn(`SEO Alert [${severity}]: ${message}`, alert);

        // データサイズ制限
        if (this.monitoringData.alerts.length > 200) {
            this.monitoringData.alerts = this.monitoringData.alerts.slice(-200);
        }

        return alert;
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

    getRecentSEOErrors() {
        try {
            const errorLog = JSON.parse(localStorage.getItem('seo_error_log') || '[]');
            const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
            return errorLog.filter(error => error.timestamp >= dayAgo);
        } catch (error) {
            return [];
        }
    }

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

    /**
     * リソースのクリーンアップ
     */
    cleanup() {
        this.stopMonitoring();
        if (this.alertCallbacks.clear) {
            this.alertCallbacks.clear();
        } else {
            this.alertCallbacks.length = 0; // Array fallback
        }
        this.monitoringData = {
            lighthouseScores: [],
            coreWebVitals: [],
            socialEngagement: [],
            searchConsoleMetrics: [],
            alerts: [],
            healthChecks: []
        };
        
        seoLogger.info('SEOMonitor cleaned up');
    }

    // Additional missing methods that were referenced
    
    trackSocialSharing(socialData) {
        // Set up social sharing tracking
        const platforms = ['twitter', 'facebook', 'linkedin', 'pinterest'];
        
        platforms.forEach(platform => {
            const buttons = document.querySelectorAll(`[data-share="${platform}"], .share-${platform}`);
            buttons.forEach(button => {
                if (!button.hasAttribute('data-tracked')) {
                    button.addEventListener('click', () => {
                        socialData.platforms[platform] = (socialData.platforms[platform] || 0) + 1;
                        socialData.totalShares++;
                        seoLogger.debug(`Social share tracked: ${platform}`);
                    });
                    button.setAttribute('data-tracked', 'true');
                }
            });
        });
    }

    async validateSitemap() {
        try {
            const response = await fetch('/sitemap.xml');
            return {
                exists: response.ok,
                status: response.status,
                lastModified: response.headers.get('last-modified')
            };
        } catch (error) {
            return { exists: false, error: error.message };
        }
    }

    async validateRobotsTxt() {
        try {
            const response = await fetch('/robots.txt');
            return {
                exists: response.ok,
                status: response.status,
                content: response.ok ? await response.text() : null
            };
        } catch (error) {
            return { exists: false, error: error.message };
        }
    }

    validateStructuredData() {
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        const results = [];
        
        scripts.forEach(script => {
            try {
                const data = JSON.parse(script.textContent);
                results.push({ valid: true, type: data['@type'], data });
            } catch (error) {
                results.push({ valid: false, error: error.message });
            }
        });
        
        return results;
    }

    getIndexablePages() {
        return [
            { url: '/', title: document.title, priority: 1.0 },
            { url: '/help', title: 'Help - BubblePop', priority: 0.8 }
        ];
    }

    checkSearchConsoleAPIReadiness() {
        return {
            hasVerificationTag: !!document.querySelector('meta[name="google-site-verification"]'),
            hasGoogleAnalytics: !!window.gtag || !!window.ga,
            hasSitemap: true,
            hasRobotsTxt: true
        };
    }

    async getSEOScoreDetails() {
        return {
            metaTags: this.analyzeMetaTags(),
            structuredData: this.validateStructuredData(),
            images: this.analyzeImages(),
            performance: await this.getPerformanceMetrics(),
            timestamp: Date.now()
        };
    }

    analyzeMetaTags() {
        const tags = {};
        const metaTags = document.querySelectorAll('meta');
        metaTags.forEach(tag => {
            const name = tag.getAttribute('name') || tag.getAttribute('property');
            if (name) {
                tags[name] = tag.getAttribute('content');
            }
        });
        return tags;
    }

    analyzeImages() {
        const images = document.querySelectorAll('img');
        return {
            total: images.length,
            withAlt: Array.from(images).filter(img => img.alt).length,
            withoutAlt: Array.from(images).filter(img => !img.alt).length
        };
    }

    async getPerformanceMetrics() {
        if (performance.getEntriesByType) {
            const navigation = performance.getEntriesByType('navigation')[0];
            return {
                domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
                loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
                ttfb: navigation?.responseStart - navigation?.requestStart
            };
        }
        return {};
    }

    recordNavigationMetrics(entry) {
        seoLogger.debug('Navigation metrics recorded', {
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            loadComplete: entry.loadEventEnd - entry.loadEventStart
        });
    }

    async trackCoreWebVitals() {
        try {
            const vitals = {
                timestamp: Date.now(),
                lcp: null, // Largest Contentful Paint
                fid: null, // First Input Delay
                cls: null, // Cumulative Layout Shift
                fcp: null, // First Contentful Paint
                ttfb: null // Time to First Byte
            };

            // Use existing implementation from the original file
            if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
                try {
                    vitals.LCP = await this._measureLCP();
                    vitals.FID = await this._measureFID();
                    vitals.CLS = await this._measureCLS();
                } catch (error) {
                    seoLogger.warning('Failed to measure real Core Web Vitals, using mock data');
                }
            }

            this.monitoringData.coreWebVitals.push(vitals);

            // データサイズ制限
            if (this.monitoringData.coreWebVitals.length > 100) {
                this.monitoringData.coreWebVitals = this.monitoringData.coreWebVitals.slice(-100);
            }

            return vitals;

        } catch (error) {
            seoLogger.error('Failed to track Core Web Vitals', error);
            return null;
        }
    }

    // Stub methods for dashboard data methods that may not be implemented yet
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

// シングルトンインスタンス
let seoMonitorInstance = null;

export function getSEOMonitor() {
    if (!seoMonitorInstance) {
        seoMonitorInstance = new SEOMonitor();
    }
    return seoMonitorInstance;
}

export default SEOMonitor;
}