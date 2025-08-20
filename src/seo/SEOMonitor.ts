/**
 * SEOMonitor - SEOパフォーマンス監視システム（メインコントローラー）
 * 
 * Main Controller Patternにより、専門化されたコンポーネントを統制します。
 * Google Search Console統合準備、ソーシャルメディア分析、
 * SEOパフォーマンスダッシュボード、自動健全性チェックを提供
 */

import { seoLogger } from './SEOLogger';''
import { seoErrorHandler } from './SEOErrorHandler';''
import { SEOMonitoringEngine } from './seo-monitor/SEOMonitoringEngine';''
import { SocialEngagementAnalyzer } from './seo-monitor/SocialEngagementAnalyzer';''
import { SearchConsoleIntegrator } from './seo-monitor/SearchConsoleIntegrator';''
import { HealthChecker } from './seo-monitor/HealthChecker';''
import { MetaTagAnalyzer } from './seo-monitor/MetaTagAnalyzer';

// 監視データインターフェース
interface MonitoringData { lighthouseScores: LighthouseScore[],
    coreWebVitals: CoreWebVitalsData[],
    socialEngagement: SocialEngagementData[],
    searchConsoleMetrics: SearchConsoleMetrics[],
    alerts: Alert[],
    healthChecks: HealthCheckResult[],
    lighthouse?: LighthouseScore[];
    lastCheck?: string; }
}

// Lighthouseスコアインターフェース
interface LighthouseScore { performance: number,
    accessibility: number,
    bestPractices: number,
    seo: number,
    timestamp: string; }
}

// Core Web Vitalsデータインターフェース
interface CoreWebVitalsData { LCP: number; // Largest Contentful Paint
    FID: number; // First Input Delay
    CLS: number; // Cumulative Layout Shift
    timestamp: string; }
}

// ソーシャルエンゲージメントデータインターフェース
interface SocialEngagementData { platform: string,
    metrics: Record<string, number>;
    timestamp: string; }
}

// Search Consoleメトリクスインターフェース
interface SearchConsoleMetrics { impressions: number,
    clicks: number,
    position: number,
    ctr: number,
    timestamp: string; }
}

// アラートインターフェース'
interface Alert { type: string,''
    severity: 'critical' | 'warning' | 'info',
    metric?: string;
    current?: number;
    threshold?: number;
    message: string,
    timestamp: string,
    metadata?: Record<string, any>; }
}

// ヘルスチェック結果インターフェース'
interface HealthCheckResult { ''
    status: 'healthy' | 'warning' | 'critical',
    checks: Record<string, boolean>;
    issues: string[],
    timestamp: string; }
}

// 監視設定インターフェース
interface MonitoringConfig { monitoringEnabled: boolean,
    interval: number,
    lighthouseThreshold: number,
    performanceThreshold: number,
    alertsEnabled: boolean,
    healthCheckInterval: number,
    includeLighthouse?: boolean;
    includeCoreWebVitals?: boolean;
    includeMetaTags?: boolean;
    includeSocialMedia?: boolean;
    includeSearchConsole?: boolean;
    enableAlerts?: boolean; }
}

// 閾値設定インターフェース
interface Thresholds { lighthouse: {
        performance: number,
        accessibility: number,
        bestPractices: number,
        seo: number }
    },
    coreWebVitals: { LCP: number,
        FID: number,
        CLS: number }
    },
    metaTags: {
        titleLength: { min: number; max: number },
        descriptionLength: { min: number; max: number }
    };
}

// 監視統計インターフェース
interface MonitoringStats { totalChecks: number,
    totalAlerts: number,
    alertsByType: Record<string, number>;
    alertsBySeverity: Record<string, number>;
    averageScores: Record<string, number>;
    isMonitoring: boolean,
    lastCheck?: string; }
}

// レポートインターフェース
interface MonitoringReport { summary: MonitoringStats,
    }
    data: MonitoringData & { isMonitoring: boolean; thresholds: Thresholds },
    generatedAt: string,
}

// アラートコールバック型
type AlertCallback = (alert: Alert) => void;

export class SEOMonitor {
    private monitoringData: MonitoringData;
    private monitoringInterval: ReturnType<typeof setInterval> | null;
    private config: MonitoringConfig;
    private alertCallbacks: AlertCallback[];
    private isMonitoring: boolean;
    private lastHealthCheck: HealthCheckResult | null;
    private thresholds: Thresholds;
    // 専門化されたコンポーネント
    private monitoringEngine: SEOMonitoringEngine;
    private socialAnalyzer: SocialEngagementAnalyzer;
    private searchConsoleIntegrator: SearchConsoleIntegrator;
    private healthChecker: HealthChecker;
    private metaTagAnalyzer: MetaTagAnalyzer;
    constructor() {
    
        this.monitoringData = {
            lighthouseScores: [],
            coreWebVitals: [],
            socialEngagement: [],
            searchConsoleMetrics: [],
            alerts: [],
    
    }
    }
            healthChecks: [] }
        },
        this.monitoringInterval = null;
        this.config = { monitoringEnabled: true,
            interval: 300000, // 5分間隔;
            lighthouseThreshold: 90,
            performanceThreshold: 75,
            alertsEnabled: true,
            healthCheckInterval: 60000 // 1分間隔 }
        },
        this.alertCallbacks = [];
        this.isMonitoring = false;
        this.lastHealthCheck = null;
        
        // 既存実装との互換性のため
        this.thresholds = { lighthouse: {
                performance: 90,
                accessibility: 90,
                bestPractices: 85,
                seo: 95 }
            },
            coreWebVitals: { LCP: 2500,    // ms
                FID: 100,     // ms;
                CLS: 0.1      // score }
            },
            metaTags: {
                titleLength: { min: 10, max: 60 },
                descriptionLength: { min: 50, max: 160 }
            }
        };
        
        // 専門化されたコンポーネントを初期化
        this.monitoringEngine = new SEOMonitoringEngine(this.config, this.monitoringData);
        this.socialAnalyzer = new SocialEngagementAnalyzer(this.config, this.monitoringData);
        this.searchConsoleIntegrator = new SearchConsoleIntegrator(this.config, this.monitoringData);
        this.healthChecker = new HealthChecker(this.config, this.monitoringData, seoLogger, this.alertCallbacks);
        this.metaTagAnalyzer = new MetaTagAnalyzer(this.thresholds);
        
        this._initialize();
    }
    
    /**
     * 初期化処理'
     */''
    private _initialize('')';
            if(typeof window !== 'undefined' && 'PerformanceObserver' in window) {'
                '';
                this.monitoringEngine.setupPerformanceObserver('')';
            if (typeof document !== 'undefined'') {''
                document.addEventListener('visibilitychange', () => { 
            }
                    if (document.hidden) { }
                        this.pauseMonitoring(); }'
                    } else {  ''
                        this.resumeMonitoring('') }'
            seoLogger.info('SEOMonitor initialized successfully');' }'
        } catch (error') { ''
            seoErrorHandler.handle(error as Error, 'seoMonitorInit'); }
        }
    }
    
    /**
     * SEO monitoring システムを開始
     */
    async startMonitoring(options: Partial<MonitoringConfig> = {}): Promise<void> { try { }
            this.config = { ...this.config, ...options };'
            '';
            if(this.isMonitoring') {'
                '';
                seoLogger.warn('SEO monitoring is already running'');
            }
                return; }
            }'
'';
            seoLogger.info('Starting SEO monitoring system', this.config);

            // 初回健全性チェック
            await this.runHealthCheck();

            // 定期監視の開始
            if (this.config.monitoringEnabled) { this.monitoringInterval = setInterval(async () => {  }
                    await this.performMonitoringCycle(); }
                }, this.config.interval);
            }

            // 健全性チェックの定期実行'
            setInterval(async () => { await this.runHealthCheck();' }'
            }, this.config.healthCheckInterval');
';
            this.isMonitoring = true;''
            seoLogger.info('SEO monitoring system started successfully');'
'';
        } catch (error') { ''
            seoErrorHandler.handle(error as Error, 'startMonitoring');
            throw error; }
        }
    }
    
    /**
     * 監視の停止
     */'
    stopMonitoring(): void { try {''
            if(!this.isMonitoring') {'
                '';
                seoLogger.warn('SEO monitoring is not running');
            }
                return; }
            }
            
            if(this.monitoringInterval) {
            ';
                '';
                clearInterval(this.monitoringInterval');
            
            }
                this.monitoringInterval = null; }
            }
            ';
            this.isMonitoring = false;''
            seoLogger.info('SEO monitoring stopped');'
            '';
        } catch (error') { ''
            seoErrorHandler.handle(error as Error, 'stopMonitoring'); }
        }
    }
    
    /**
     * 監視の一時停止
     */'
    pauseMonitoring(): void { ''
        if(this.isMonitoring') {'
            this.isMonitoring = false;'
        }'
            seoLogger.info('SEO monitoring paused'); }
        }
    }
    
    /**
     * 監視の再開
     */'
    resumeMonitoring(): void { ''
        if(!this.isMonitoring && this.monitoringInterval') {'
            this.isMonitoring = true;'
        }'
            seoLogger.info('SEO monitoring resumed'); }
        }
    }
    
    /**
     * 監視サイクルの実行'
     */''
    async performMonitoringCycle('')';
            seoLogger.debug('Starting monitoring cycle');

            // Lighthouse SEOスコア監視
            if (this.config.includeLighthouse) { await this.monitorLighthouseScore(); }
            }

            // Core Web Vitals追跡
            await this.trackCoreWebVitals();

            // ソーシャルメディア分析
            if (this.config.includeSocialMedia) { await this.analyzeSocialEngagement(); }
            }

            // Search Console データ準備
            if(this.config.includeSearchConsole) {'
                '';
                await this.prepareSearchConsoleIntegration('');'
            seoLogger.debug('Monitoring cycle completed');
            }'
' }'
        } catch (error') { ''
            seoLogger.error('Error in monitoring cycle', error as Error');''
            this.createAlert('monitoring_cycle_error', 'critical', (error as Error).message); }
        }
    }
    
    /**
     * 監視チェックの実行（レガシー互換性）
     */
    private async _performMonitoringCheck(options: MonitoringConfig): Promise<void> { try {
            const checkResults = {
                timestamp: new Date().toISOString(,
                lighthouse: null as LighthouseScore | null,
                coreWebVitals: null as CoreWebVitalsData | null,
                metaTags: null as any,
                alerts: [] as Alert[] })
            })
            // Lighthouseスコア監視)
            if(options.includeLighthouse) {
                checkResults.lighthouse = await this.monitoringEngine.checkLighthouseScore();
                this.monitoringData.lighthouse = this.monitoringData.lighthouse || [];
                this.monitoringData.lighthouse.push(checkResults.lighthouse);
                
                if (options.enableAlerts) {
            }
                    this._checkLighthouseAlerts(checkResults.lighthouse, checkResults.alerts); }
                }
            }
            
            // Core Web Vitals監視
            if(options.includeCoreWebVitals) {
                checkResults.coreWebVitals = await this.monitoringEngine.checkCoreWebVitals();
                this.monitoringData.coreWebVitals.push(checkResults.coreWebVitals);
                
                if (options.enableAlerts) {
            }
                    this._checkCoreWebVitalsAlerts(checkResults.coreWebVitals, checkResults.alerts); }
                }
            }
            
            // メタタグ監視
            if(options.includeMetaTags) {
                checkResults.metaTags = await this.metaTagAnalyzer.checkMetaTags();
                
                if (options.enableAlerts) {
            }
                    this.metaTagAnalyzer.checkMetaTagAlerts(checkResults.metaTags, checkResults.alerts); }
                }
            }
            
            // アラートの処理
            if(checkResults.alerts.length > 0) {
                this.monitoringData.alerts.push(...checkResults.alerts);
            }
                await this._processAlerts(checkResults.alerts); }
            }
            
            this.monitoringData.lastCheck = checkResults.timestamp;
            ';
            // データの保持期間制限（最大100エントリ）''
            this._limitDataRetention(''';
            seoLogger.info('SEO monitoring check completed', { lighthouseScore: checkResults.lighthouse? .seo, : undefined)
                coreWebVitals: checkResults.coreWebVitals,);
                alertCount: checkResults.alerts.length),';
            ' }'
        } catch (error') { ''
            seoErrorHandler.handle(error as Error, '_performMonitoringCheck', options); }
        }
    }
    
    /**
     * Lighthouseアラートのチェック
     */
    private _checkLighthouseAlerts(lighthouseScore: LighthouseScore, alerts: Alert[]): void { if (!lighthouseScore) return;
        
        Object.entries(this.thresholds.lighthouse).forEach(([metric, threshold]) => { '
            const score = lighthouseScore[metric as keyof LighthouseScore] as number;''
            if(score < threshold') {'
                alerts.push({''
                    type: 'lighthouse','';
                    severity: 'warning',);
                    metric: metric);
            }
                    current: score,) }
                    threshold: threshold), }
                    message: `Lighthouse ${metric} score (${score}) is below threshold(${ threshold)`, }
                    timestamp: new Date().toISOString(}),
                };
            }
        };
    }
    
    /**
     * Core Web Vitalsアラートのチェック
     */
    private _checkCoreWebVitalsAlerts(coreWebVitals: CoreWebVitalsData, alerts: Alert[]): void { if (!coreWebVitals) return;
        
        Object.entries(this.thresholds.coreWebVitals).forEach(([metric, threshold]) => { '
            const value = coreWebVitals[metric as keyof CoreWebVitalsData];''
            if(value > threshold') {'
                '';
                const severity: 'critical' | 'warning' = value > threshold * 1.5 ? 'critical' : 'warning',';
                alerts.push({''
                    type: 'coreWebVitals',
                    severity: severity,);
                    metric: metric);
            }
                    current: value,) }
                    threshold: threshold), }
                    message: `Core Web Vital ${metric} (${ value) exceeds threshold(${threshold)`, }
                    timestamp: new Date().toISOString(}),
                };
            }
        };
    }
    
    /**
     * アラートの処理
     */
    private async _processAlerts(alerts: Alert[]): Promise<void> { try {
            for(const alert of alerts) {
                // アラートコールバックの実行
                this.alertCallbacks.forEach(callback => { )
            }
                    try {); }'
                        callback(alert);' }'
                    } catch (error') { ''
                        seoLogger.error('Alert callback error', error as Error); }'
                    }''
                }');
                ';
                // アラートのログ出力''
                const logLevel = alert.severity === 'critical' ? 'error' : 'warn';'
                (seoLogger as any)[logLevel](`SEO Alert: ${alert.message}`, alert);''
            } catch (error') { ''
            seoErrorHandler.handle(error as Error, '_processAlerts', alerts); }
        }
    }
    
    /**
     * データ保持期間の制限
     */
    private _limitDataRetention(): void { const maxEntries = 100;
        
        if(this.monitoringData.lighthouse && this.monitoringData.lighthouse.length > maxEntries) {
        
            
        
        }
            this.monitoringData.lighthouse = this.monitoringData.lighthouse.slice(-maxEntries); }
        }
        
        if (this.monitoringData.coreWebVitals.length > maxEntries) { this.monitoringData.coreWebVitals = this.monitoringData.coreWebVitals.slice(-maxEntries); }
        }
        
        if (this.monitoringData.alerts.length > maxEntries) { this.monitoringData.alerts = this.monitoringData.alerts.slice(-maxEntries); }
        }
    }
    
    // パブリックAPI - 専門コンポーネントへのデリゲート
    
    /**
     * Lighthouse SEOスコア監視
     */
    async monitorLighthouseScore(): Promise<any> { return await this.monitoringEngine.monitorLighthouseScore(); }
    }
    
    /**
     * Core Web Vitals追跡
     */
    async trackCoreWebVitals(): Promise<any> { return await this.monitoringEngine.trackCoreWebVitals(); }
    }
    
    /**
     * ソーシャルメディア分析
     */
    async analyzeSocialEngagement(): Promise<any> { return await this.socialAnalyzer.analyzeSocialEngagement(); }
    }
    
    /**
     * Google Search Console統合準備
     */
    async prepareSearchConsoleIntegration(): Promise<any> { return await this.searchConsoleIntegrator.prepareSearchConsoleIntegration(); }
    }
    
    /**
     * 健全性チェックの実行
     */
    async runHealthCheck(): Promise<HealthCheckResult> { const result = await this.healthChecker.runHealthCheck();
        this.lastHealthCheck = result;
        return result; }
    }
    
    /**
     * SEOパフォーマンスダッシュボードデータの生成
     */'
    generateDashboardData(): any { ''
        return this.healthChecker.generateDashboardData('')';
    createAlert(type: string, severity: 'critical' | 'warning' | 'info', message: string, metadata: Record<string, any> = {): Alert {
        return this.healthChecker.createAlert(type, severity, message, metadata); }
    }
    
    /**
     * アラートコールバックの追加'
     */''
    addAlertCallback(callback: AlertCallback'): void { ''
        if(typeof callback === 'function') {'
            '';
            this.alertCallbacks.push(callback');'
        }'
            seoLogger.info('Alert callback added''); }'
        } else {  ' }'
            throw new Error('Alert callback must be a function'); }
        }
    }
    
    /**
     * アラートコールバックの削除
     */
    removeAlertCallback(callback: AlertCallback): void { const index = this.alertCallbacks.indexOf(callback);
        if(index !== -1) {'
            '';
            this.alertCallbacks.splice(index, 1');'
        }'
            seoLogger.info('Alert callback removed'); }
        }
    }
    
    /**
     * 閾値の設定'
     */''
    setThresholds(newThresholds: Partial<Thresholds>'): void { try { }'
            this.thresholds = { ...this.thresholds, ...newThresholds };''
            seoLogger.info('SEO monitoring thresholds updated', this.thresholds);''
        } catch (error') { ''
            seoErrorHandler.handle(error as Error, 'setThresholds', newThresholds); }
        }
    }
    
    /**
     * 監視データの取得
     */
    getMonitoringData(): MonitoringData & { isMonitoring: boolean; thresholds: Thresholds } { return { ...this.monitoringData,
            isMonitoring: this.isMonitoring, };
            thresholds: this.thresholds }
        },
    }
    
    /**
     * 監視統計の取得
     */
    getMonitoringStats(): MonitoringStats { const stats: MonitoringStats = {
            totalChecks: this.monitoringData.lighthouse? .length || 0, : undefined;
            totalAlerts: this.monitoringData.alerts.length, }
            alertsByType: {}
            alertsBySeverity: {}
            averageScores: {},
            isMonitoring: this.isMonitoring,
            lastCheck: this.monitoringData.lastCheck;
        },
        
        // アラート統計
        this.monitoringData.alerts.forEach(alert => {  );
            stats.alertsByType[alert.type] = (stats.alertsByType[alert.type] || 0) + 1; }
            stats.alertsBySeverity[alert.severity] = (stats.alertsBySeverity[alert.severity] || 0) + 1; }
        };
        
        // 平均スコア計算
        if(this.monitoringData.lighthouse && this.monitoringData.lighthouse.length > 0) {
            
        }
            const totals = { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 }
            this.monitoringData.lighthouse.forEach(score => {  );
                Object.keys(totals).forEach(key => {) }
                    totals[key as keyof typeof totals] += score[key as keyof LighthouseScore] || 0); }
                };
            };
            ';
            Object.keys(totals).forEach(key => {  );' }'
                stats.averageScores[key] = Math.round(totals[key as keyof typeof totals] / this.monitoringData.lighthouse!.length'); }
            };
        }
        
        return stats;
    }
    
    /**
     * 監視レポートの生成'
     */''
    generateReport(format: 'json' | 'html' = 'json'): string { const data = this.getMonitoringData();
        const stats = this.getMonitoringStats();
        
        const report: MonitoringReport = {
            summary: stats,
            data: data,
            generatedAt: new Date().toISOString(); }
        };'
        '';
        switch(format') {'
            '';
            case 'json':'';
                return JSON.stringify(report, null, 2');'
            '';
            case 'html':;
                return this._generateHTMLReport(report);
            
        }
            default: }
                throw new Error(`Unsupported report format: ${format)`}),
        }
    }
    
    /**
     * HTMLレポートの生成'
     */''
    private _generateHTMLReport(report: MonitoringReport'): string { return `
<!DOCTYPE html>;
<html>;
<head>;
    <title>SEO Monitoring Report</title>;
    <style> }
        body { font-family: Arial, sans-serif; margin: 20px, }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px, }
        .chart { background: white; border: 1px solid #ddd; padding: 20px; margin: 20px 0, }
        .alert { padding: 10px; margin: 5px 0; border-radius: 3px, }
        .alert.critical { background: #ffebee; border-left: 4px solid #f44336, }
        .alert.warning { background: #fff3e0; border-left: 4px solid #ff9800, }
        .score { display: inline-block; margin: 10px; padding: 15px; border-radius: 5px; text-align: center, }
        .score.good { background: #e8f5e8; color: #2e7d32, }
        .score.needs-improvement { background: #fff3e0; color: #f57c00, }
        .score.poor { background: #ffebee; color: #d32f2f, }
    </style>;
</head>;
<body>';
    <h1>SEO Monitoring Report</h1>'';
    <div class="summary">;
        <h2>Summary</h2>;
        <p>Generated: ${report.generatedAt}</p>
        <p>Total Checks: ${report.summary.totalChecks}</p>"
        <p>Total Alerts: ${report.summary.totalAlerts}</p>""
        <p>Monitoring Status: ${report.summary.isMonitoring ? 'Active' : 'Inactive'}</p>''
        <p>Last Check: ${report.summary.lastCheck || 'Never'}</p>
    </div>';
    '';
    <div class="chart">";
        <h3>Average Lighthouse Scores</h3>"";
        ${Object.entries(report.summary.averageScores).map(([metric, score]"}) => {  " }"
            const className = score >= 90 ? 'good' : score >= 70 ? 'needs-improvement' : 'poor';' }'
            return `<div class="score ${className}"><strong>${metric}</strong><br>${score}</div>`;""
        }").join(''')}
    </div>';
    '';
    <div class="chart">";
        <h3>Recent Alerts</h3>"";
        ${report.data.alerts.slice(-10"}).map(alert => `""
        <div class="alert ${alert.severity}">)
            <strong>${alert.type}</strong>: ${alert.message})
            <br><small>${ alert.timestamp)</small>"
        </div>" }"
        `").join(''})}
    </div>;
</body>;
</html>`;
    }
    
    /**
     * リソースのクリーンアップ
     */
    cleanup(): void { this.stopMonitoring();
        this.alertCallbacks.length = 0;
        this.monitoringData = {
            lighthouseScores: [],
            coreWebVitals: [],
            socialEngagement: [],
            searchConsoleMetrics: [],
            alerts: [],
            healthChecks: [] }
        },
        
        // 専門コンポーネントのクリーンアップ
        if(this.monitoringEngine) {'
            '';
            this.monitoringEngine.destroy('');
        }'
        seoLogger.info('SEOMonitor cleaned up'); }
    }
}

// シングルトンインスタンス
let seoMonitorInstance: SEOMonitor | null = null,
';
export function getSEOMonitor(): SEOMonitor { if (!seoMonitorInstance) {''
        seoMonitorInstance = new SEOMonitor(' })