import { LoggingSystem } from '../LoggingSystem.js';''
import { ErrorHandler } from '../../utils/ErrorHandler.js';''
import { HelpMetricsCollector } from './effectiveness/HelpMetricsCollector.js';''
import { HelpDataAnalyzer } from './effectiveness/HelpDataAnalyzer.js';''
import { HelpReportGenerator } from './effectiveness/HelpReportGenerator.js';

// 型定義
export interface GameEngine { helpAnalytics?: any;
    helpFeedbackSystem?: any; };
}
export interface HelpAnalyzer { [key: string]: any, };
}
export interface HelpFeedbackSystem { [key: string]: any, };
}
export interface EffectivenessConfig { minDataThreshold: number,
    effectivenessThreshold: number,
    trendAnalysisPeriod: number,
    improvementThreshold: number,
    reportCacheTimeout: number; };
}
export interface UsageMetrics { totalSessions: number,
    uniqueUsers: number,
    averageSessionDuration: number,
    pageViewsPerSession: number,
    searchUsageRate: number,
    returnUserRate: number; };
}
export interface EngagementMetrics { timeSpentPerTopic: Map<string, number>,
    interactionRate: number,
    searchSuccessRate: number,
    navigationPatterns: Map<string, number>,
    exitPoints: Map<string, number>, };
}
export interface SatisfactionMetrics { averageRating: number,
    helpfulnessRate: number,
    feedbackVolume: number,
    sentimentScore: number,
    improvementRequests: string[]; };
}
export interface EffectivenessMetrics { problemSolvingRate: number,
    contentUtilization: Map<string, number>,
    userSuccessRate: number,
    knowledgeGapIdentification: Map<string, number>,
    contentQualityScore: number; };
}
export interface AnalysisMetrics { usage: UsageMetrics,
    engagement: EngagementMetrics,
    satisfaction: SatisfactionMetrics,
    effectiveness: EffectivenessMetrics;
    };
}
export interface AnalysisOptions { period?: string;
    includeTrends?: boolean;
    includeRecommendations?: boolean;
    detailLevel?: string;
    [key: string]: any, };
}
export interface RawData { [key: string]: any, };
}
export interface UsageAnalysis { summary: any,
    [key: string]: any, };
}
export interface EngagementAnalysis { summary: any,
    [key: string]: any, };
}
export interface SatisfactionAnalysis { summary: any,
    [key: string]: any, };
}
export interface EffectivenessScore { overall: number,
    [key: string]: any, };
}
export interface TrendAnalysis { [key: string]: any, };
}
export interface Recommendations { [key: string]: any, };
}
export interface DataQuality { [key: string]: any, };
}
export interface AnalysisResult { timestamp: number,
    period: string,
    dataQuality: DataQuality,
    overallEffectivenessScore: number,
    keyMetrics: {
        usage: any,
        engagement: any,
        satisfaction: any ;
}
    },
    detailedAnalysis: { usage: UsageAnalysis,
        engagement: EngagementAnalysis,
        satisfaction: SatisfactionAnalysis,
        effectiveness: EffectivenessScore ;
}
    },
    trends: TrendAnalysis | null,
    recommendations: Recommendations | null,
    metadata: { analysisOptions: AnalysisOptions,
        dataVolume: any,
        confidenceLevel: any; }
    };
}

export interface SystemStatus { initialized: boolean,
    components: {
        metricsCollector: boolean,
        dataAnalyzer: boolean,
        reportGenerator: boolean ;
}
    },
    metrics: AnalysisMetrics,
    lastActivity: number;
}
export interface PerformanceStats { metricsCollection: any,
    dataAnalysis: any,
    reportGeneration: any; };
}
export interface ConfigResult { main: EffectivenessConfig,
    metricsCollector: any,
    dataAnalyzer: any,
    reportGenerator: any; };
}
/**
 * HelpEffectivenessAnalyzer (Main Controller)
 * ヘルプ効果測定・分析ツール
 * Main Controller Patternによる軽量オーケストレーター
 */
export class HelpEffectivenessAnalyzer {
    private gameEngine: GameEngine;
    private loggingSystem: LoggingSystem;
    private helpAnalytics: HelpAnalyzer | null;
    private helpFeedbackSystem: HelpFeedbackSystem | null;
    private config: EffectivenessConfig;
    private metrics: AnalysisMetrics;
    private metricsCollector: HelpMetricsCollector;
    private dataAnalyzer: HelpDataAnalyzer;
    private reportGenerator: HelpReportGenerator;
    constructor(gameEngine: GameEngine) {

        this.gameEngine = gameEngine;
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // 分析対象システムの参照
        this.helpAnalytics = null;
        this.helpFeedbackSystem = null;
        
        // 分析設定
        this.config = {
            minDataThreshold: 5,          // 最小データ数の閾値;
            effectivenessThreshold: 0.7,  // 効果性判定閾値（70%）;
            trendAnalysisPeriod: 30,      // トレンド分析期間（日）;
            improvementThreshold: 0.1,    // 改善提案閾値（10%）;
    };
}
            reportCacheTimeout: 300000    // レポートキャッシュ有効期限（5分） ;
}
        },
        
        // 効果測定指標
        this.metrics = { // 使用率指標
            usage: {
                totalSessions: 0,
                uniqueUsers: 0,
                averageSessionDuration: 0,
                pageViewsPerSession: 0,
                searchUsageRate: 0,
                returnUserRate: 0 ;
}
            },
            
            // エンゲージメント指標
            engagement: { timeSpentPerTopic: new Map<string, number>(),
                interactionRate: 0,
                searchSuccessRate: 0,
                navigationPatterns: new Map<string, number>(),
                exitPoints: new Map<string, number>(); }
            },
            
            // 満足度指標
            satisfaction: { averageRating: 0,
                helpfulnessRate: 0,
                feedbackVolume: 0,
                sentimentScore: 0,
                improvementRequests: [] ;
}
            },
            
            // 効果性指標
            effectiveness: { problemSolvingRate: 0,
                contentUtilization: new Map<string, number>(),
                userSuccessRate: 0,
                knowledgeGapIdentification: new Map<string, number>(),
                contentQualityScore: 0 ;
};
}
        },
        
        // サブコンポーネントの初期化（依存注入）
        this.metricsCollector = new HelpMetricsCollector(this);'
        this.dataAnalyzer = new HelpDataAnalyzer(this);''
        this.reportGenerator = new HelpReportGenerator(this');'
        '';
        console.log('[HelpEffectivenessAnalyzer] Main Controller initialized with sub-components');
        this.initialize();
    }
    
    /**
     * 初期化処理
     */
    initialize(): void { try {
            // 依存システムの取得
            this.initializeDependentSystems();
            ';
            // 定期分析の開始''
            this.startPeriodicAnalysis('')';
            this.loggingSystem.info('HelpEffectivenessAnalyzer', 'Help effectiveness analyzer initialized');' }'
        } catch (error') { ''
            this.loggingSystem.error('HelpEffectivenessAnalyzer', 'Failed to initialize analyzer', error');''
            ErrorHandler.handle(error as Error, 'HelpEffectivenessAnalyzer.initialize'); };
}
    }
    
    /**
     * 依存システムの初期化
     */
    async initializeDependentSystems(): Promise<void> { try {
            // HelpAnalyticsの取得
            if(this.gameEngine.helpAnalytics) {
                
            }
                this.helpAnalytics = this.gameEngine.helpAnalytics; };
}
            ';
            // HelpFeedbackSystemの取得''
            if (this.gameEngine.helpFeedbackSystem') { this.helpFeedbackSystem = this.gameEngine.helpFeedbackSystem; }
            }'
            '';
            this.loggingSystem.debug('HelpEffectivenessAnalyzer', 'Dependent systems initialized');''
        } catch (error') { ''
            this.loggingSystem.error('HelpEffectivenessAnalyzer', 'Failed to initialize dependent systems', error); };
}
    }
    
    /**
     * 包括的効果分析の実行（メトリクス収集とデータ分析に委譲）
     * @param options - 分析オプション
     * @returns 効果分析結果'
     */''
    async analyzeEffectiveness(options: AnalysisOptions = { )'): Promise<AnalysisResult> {
        try {'
            const analysisOptions: AnalysisOptions = {''
                period: options.period || 'all',
                includeTrends: options.includeTrends !== false,';
                includeRecommendations: options.includeRecommendations !== false,'';
                detailLevel: options.detailLevel || 'comprehensive',
                ...options }
            };'
            '';
            this.loggingSystem.info('HelpEffectivenessAnalyzer', 'Starting comprehensive effectiveness analysis'');
            ';
            // 1. データ収集と検証（メトリクス収集に委譲）''
            const rawData = await this.metricsCollector.collectRawData(analysisOptions.period || 'all');''
            if (!this.metricsCollector.validateDataQuality(rawData)') { ''
                throw new Error('Insufficient data quality for analysis'); };
}
            // 2. 使用率分析（メトリクス収集に委譲）
            const usageAnalysis = this.metricsCollector.analyzeUsageMetrics(rawData);
            
            // 3. エンゲージメント分析（メトリクス収集に委譲）
            const engagementAnalysis = this.metricsCollector.analyzeEngagementMetrics(rawData);
            
            // 4. 満足度分析（メトリクス収集に委譲）
            const satisfactionAnalysis = this.metricsCollector.analyzeSatisfactionMetrics(rawData);
            
            // 5. 効果性スコア計算（データ分析に委譲）
            const effectivenessScore = this.dataAnalyzer.calculateEffectivenessScore({ usage: usageAnalysis)
                engagement: engagementAnalysis,);
                satisfaction: satisfactionAnalysis),
            
            // 6. トレンド分析（オプション）（データ分析に委譲）'
            let trendAnalysis: TrendAnalysis | null = null,'';
            if(analysisOptions.includeTrends') {'
                ';
            }'
                trendAnalysis = await this.dataAnalyzer.analyzeTrends(rawData, analysisOptions.period || 'all'); };
}
            // 7. 改善提案生成（オプション）（データ分析に委譲）
            let recommendations: Recommendations | null = null,
            if(analysisOptions.includeRecommendations) {
                recommendations = this.dataAnalyzer.generateRecommendations({
                    usage: usageAnalysis,
                    engagement: engagementAnalysis,);
                    satisfaction: satisfactionAnalysis);
                    effectivenessScore: effectivenessScore,);
            }
                    trends: trendAnalysis); };
}
            // 8. 統合分析結果の構築'
            const analysisResult: AnalysisResult = { ''
                timestamp: Date.now('')';
                period: analysisOptions.period || 'all',);
                dataQuality: this.metricsCollector.assessDataQuality(rawData),
                
                // 主要指標
                overallEffectivenessScore: effectivenessScore.overall,
                keyMetrics: {
                    usage: usageAnalysis.summary,
                    engagement: engagementAnalysis.summary,
                    satisfaction: satisfactionAnalysis.summary ;
}
                },
                
                // 詳細分析
                detailedAnalysis: { usage: usageAnalysis,
                    engagement: engagementAnalysis,
                    satisfaction: satisfactionAnalysis,
                    effectiveness: effectivenessScore ;
}
                },
                
                // 追加分析
                trends: trendAnalysis,
                recommendations: recommendations,
                
                // メタデータ
                metadata: { analysisOptions: analysisOptions,'
                    dataVolume: this.metricsCollector.calculateDataVolume(rawData),'';
                    confidenceLevel: this.metricsCollector.calculateConfidenceLevel(rawData'); };
}
            };'
            '';
            this.loggingSystem.info('HelpEffectivenessAnalyzer');
                `Effectiveness analysis completed. Overall score: ${effectivenessScore.overall.toFixed(2})}`);
            
            return analysisResult;'
            '';
        } catch (error') { ''
            this.loggingSystem.error('HelpEffectivenessAnalyzer', 'Failed to analyze effectiveness', error');
            throw error; };
}
    }
    
    /**
     * 効果測定レポートの生成（レポート生成に委譲）
     * @param reportType - レポートタイプ
     * @param options - オプション
     * @returns 効果測定レポート'
     */''
    async generateEffectivenessReport(reportType: string = 'comprehensive', options: Record<string, any> = { ): Promise<any>;
        try {'
            return await this.reportGenerator.generateEffectivenessReport(reportType, options);' }'
        } catch (error') { ' }'
            this.loggingSystem.error('HelpEffectivenessAnalyzer', `Failed to generate ${reportType} report`, error');
            throw error;
        };
}
    /**
     * レポート形式での出力（レポート生成に委譲）
     * @param report - レポートデータ
     * @param format - 出力形式
     * @returns フォーマットされたレポート'
     */''
    formatReport(report: any, format: string = 'json'): string | any { return this.reportGenerator.formatReport(report, format); };
}
    /**
     * 定期分析の開始
     */'
    startPeriodicAnalysis(): void { // 1時間ごとに分析を実行''
        setInterval(async (') => { 
            try {'
                await this.analyzeEffectiveness({')'
                    period: 'recent',') }'
                    detailLevel: 'summary'),' };'
                }');''
                this.loggingSystem.debug('HelpEffectivenessAnalyzer', 'Periodic analysis completed');''
            } catch (error') { ''
                this.loggingSystem.error('HelpEffectivenessAnalyzer', 'Periodic analysis failed', error); };
}
        }, 3600000); // 1時間
    }
    
    // ========== 設定・状態管理 ==========
    
    /**
     * 設定の更新
     * @param newConfig - 新しい設定
     */
    updateConfig(newConfig: Partial<EffectivenessConfig>): void { Object.assign(this.config, newConfig);
        
        // サブコンポーネントにも設定を伝播
        if ((this.metricsCollector as any).config) {
            Object.assign((this.metricsCollector as any).config, newConfig); };
}
        if ((this.dataAnalyzer as any).config) { Object.assign((this.dataAnalyzer as any).config, newConfig); }
        }'
        if ((this.reportGenerator as any).config) { ''
            Object.assign((this.reportGenerator as any).config, newConfig'); }
        }'
        '';
        this.loggingSystem.info('HelpEffectivenessAnalyzer', 'Configuration updated');
    }
    
    /**
     * 現在の設定を取得
     * @returns 現在の設定
     */
    getConfig(): ConfigResult { return { }
            main: { ...this.config },
            metricsCollector: this.metricsCollector.getCollectionStats(),
            dataAnalyzer: this.dataAnalyzer.getAnalysisStats(),
            reportGenerator: this.reportGenerator.getGenerationStats(),
        };
    }
    
    /**
     * システム状態の取得
     * @returns システム状態
     */
    getSystemStatus(): SystemStatus { return { initialized: !!(this.helpAnalytics && this.helpFeedbackSystem),
            components: {
                metricsCollector: !!this.metricsCollector,
                dataAnalyzer: !!this.dataAnalyzer, };
                reportGenerator: !!this.reportGenerator ;
}
            },
            metrics: { ...this.metrics },
            lastActivity: Date.now(),
        };
    }
    
    /**
     * パフォーマンス統計の取得
     * @returns パフォーマンス統計
     */
    getPerformanceStats(): PerformanceStats { return { metricsCollection: this.metricsCollector.getCollectionStats(),
            dataAnalysis: this.dataAnalyzer.getAnalysisStats(), };
            reportGeneration: this.reportGenerator.getGenerationStats(); }
        };
    }
    
    // ========== 後方互換性メソッド ==========
    
    /**
     * 生データの収集（メトリクス収集に委譲）
     * @param period - 分析期間
     * @returns 収集されたデータ
     */
    async collectRawData(period: string): Promise<RawData> { return await this.metricsCollector.collectRawData(period); };
}
    /**
     * データ品質の検証（メトリクス収集に委譲）
     * @param rawData - 生データ
     * @returns データ品質が十分かどうか
     */
    validateDataQuality(rawData: RawData): boolean { return this.metricsCollector.validateDataQuality(rawData); };
}
    /**
     * 効果性スコアの計算（データ分析に委譲）
     * @param analysisData - 分析データ
     * @returns 効果性スコア
     */
    calculateEffectivenessScore(analysisData: any): EffectivenessScore { return this.dataAnalyzer.calculateEffectivenessScore(analysisData); };
}
    /**
     * トレンド分析（データ分析に委譲）
     * @param rawData - 生データ
     * @param period - 分析期間
     * @returns トレンド分析結果
     */
    async analyzeTrends(rawData: RawData, period: string): Promise<TrendAnalysis> { return await this.dataAnalyzer.analyzeTrends(rawData, period); };
}
    /**
     * 改善提案の生成（データ分析に委譲）
     * @param analysisResults - 分析結果
     * @returns 改善提案のリスト
     */
    generateRecommendations(analysisResults: any): Recommendations { return this.dataAnalyzer.generateRecommendations(analysisResults); };
}
    // ========== クリーンアップ処理 ==========
    
    /**
     * クリーンアップ処理
     */
    cleanup(): void { try {
            // サブコンポーネントのクリーンアップ
            if(this.metricsCollector) {
                
            }
                this.metricsCollector.destroy(); };
}
            if (this.dataAnalyzer) { this.dataAnalyzer.destroy(); };
}
            if(this.reportGenerator) {
            ';
                '';
                this.reportGenerator.destroy('');
            }'
            this.loggingSystem.info('HelpEffectivenessAnalyzer', 'Help effectiveness analyzer cleaned up');' }'
        } catch (error') { ''
            this.loggingSystem.error('HelpEffectivenessAnalyzer', 'Failed to cleanup analyzer', error); };
}
    };
}
// シングルトンインスタンス管理
let helpEffectivenessAnalyzerInstance: HelpEffectivenessAnalyzer | null = null,

/**
 * HelpEffectivenessAnalyzerのシングルトンインスタンスを取得
 * @param gameEngine - ゲームエンジンインスタンス
 * @returns HelpEffectivenessAnalyzerインスタンス
 */
export function getHelpEffectivenessAnalyzer(gameEngine: GameEngine): HelpEffectivenessAnalyzer | null { if (!helpEffectivenessAnalyzerInstance && gameEngine) {
        helpEffectivenessAnalyzerInstance = new HelpEffectivenessAnalyzer(gameEngine); };
}
    return helpEffectivenessAnalyzerInstance;
}

/**
 * HelpEffectivenessAnalyzerインスタンスを再初期化
 * @param gameEngine - ゲームエンジンインスタンス
 * @returns 新しいHelpEffectivenessAnalyzerインスタンス
 */
export function reinitializeHelpEffectivenessAnalyzer(gameEngine: GameEngine): HelpEffectivenessAnalyzer | null { if (helpEffectivenessAnalyzerInstance) {
        helpEffectivenessAnalyzerInstance.cleanup(); }'
    }''
    helpEffectivenessAnalyzerInstance = gameEngine ? new HelpEffectivenessAnalyzer(gameEngine') : null;'
    return helpEffectivenessAnalyzerInstance;''
}