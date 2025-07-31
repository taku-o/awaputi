import { LoggingSystem } from '../LoggingSystem.js';
import { ErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * ヘルプ効果測定・分析ツール
 * HelpAnalyticsとHelpFeedbackSystemのデータを統合分析し、
 * ヘルプコンテンツの効果を包括的に測定
 */
export class HelpEffectivenessAnalyzer {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // 分析対象システムの参照
        this.helpAnalytics = null;
        this.helpFeedbackSystem = null;
        
        // 分析設定
        this.config = {
            minDataThreshold: 5,          // 最小データ数の閾値
            effectivenessThreshold: 0.7,  // 効果性判定閾値（70%）
            trendAnalysisPeriod: 30,      // トレンド分析期間（日）
            improvementThreshold: 0.1,    // 改善提案閾値（10%）
            reportCacheTimeout: 300000    // レポートキャッシュ有効期限（5分）
        };
        
        // 分析結果キャッシュ
        this.analysisCache = new Map();
        this.reportCache = new Map();
        this.lastAnalysisTime = 0;
        
        // 効果測定指標
        this.metrics = {
            // 使用率指標
            usage: {
                totalSessions: 0,
                uniqueUsers: 0,
                averageSessionDuration: 0,
                pageViewsPerSession: 0,
                searchUsageRate: 0,
                returnUserRate: 0
            },
            
            // エンゲージメント指標
            engagement: {
                timeSpentPerTopic: new Map(),
                interactionRate: 0,
                searchSuccessRate: 0,
                navigationPatterns: new Map(),
                exitPoints: new Map()
            },
            
            // 満足度指標
            satisfaction: {
                averageRating: 0,
                helpfulnessRate: 0,
                feedbackVolume: 0,
                sentimentScore: 0,
                improvementRequests: []
            },
            
            // 効果性指標
            effectiveness: {
                problemSolvingRate: 0,
                contentUtilization: new Map(),
                userSuccessRate: 0,
                knowledgeGapIdentification: new Map(),
                contentQualityScore: 0
            }
        };
        
        this.initialize();
    }
    
    /**
     * 初期化処理
     */
    initialize() {
        try {
            // 依存システムの取得
            this.initializeDependentSystems();
            
            // 定期分析の開始
            this.startPeriodicAnalysis();
            
            this.loggingSystem.info('HelpEffectivenessAnalyzer', 'Help effectiveness analyzer initialized');
        } catch (error) {
            this.loggingSystem.error('HelpEffectivenessAnalyzer', 'Failed to initialize analyzer', error);
            ErrorHandler.handle(error, 'HelpEffectivenessAnalyzer.initialize');
        }
    }
    
    /**
     * 依存システムの初期化
     */
    async initializeDependentSystems() {
        try {
            // HelpAnalyticsの取得
            if (this.gameEngine.helpAnalytics) {
                this.helpAnalytics = this.gameEngine.helpAnalytics;
            }
            
            // HelpFeedbackSystemの取得
            if (this.gameEngine.helpFeedbackSystem) {
                this.helpFeedbackSystem = this.gameEngine.helpFeedbackSystem;
            }
            
            this.loggingSystem.debug('HelpEffectivenessAnalyzer', 'Dependent systems initialized');
        } catch (error) {
            this.loggingSystem.error('HelpEffectivenessAnalyzer', 'Failed to initialize dependent systems', error);
        }
    }
    
    /**
     * 包括的効果分析の実行
     * @param {Object} options - 分析オプション
     * @returns {Object} 効果分析結果
     */
    async analyzeEffectiveness(options = {}) {
        try {
            const analysisOptions = {
                period: options.period || 'all',
                includeTrends: options.includeTrends !== false,
                includeRecommendations: options.includeRecommendations !== false,
                detailLevel: options.detailLevel || 'comprehensive',
                ...options
            };
            
            // キャッシュの確認
            const cacheKey = this.generateCacheKey('effectiveness', analysisOptions);
            if (this.isCacheValid(cacheKey)) {
                return this.analysisCache.get(cacheKey);
            }
            
            this.loggingSystem.info('HelpEffectivenessAnalyzer', 'Starting comprehensive effectiveness analysis');
            
            // 1. データ収集と検証
            const rawData = await this.collectRawData(analysisOptions.period);
            if (!this.validateDataQuality(rawData)) {
                throw new Error('Insufficient data quality for analysis');
            }
            
            // 2. 使用率分析
            const usageAnalysis = this.analyzeUsageMetrics(rawData);
            
            // 3. エンゲージメント分析
            const engagementAnalysis = this.analyzeEngagementMetrics(rawData);
            
            // 4. 満足度分析
            const satisfactionAnalysis = this.analyzeSatisfactionMetrics(rawData);
            
            // 5. 効果性スコア計算
            const effectivenessScore = this.calculateEffectivenessScore({
                usage: usageAnalysis,
                engagement: engagementAnalysis,
                satisfaction: satisfactionAnalysis
            });
            
            // 6. トレンド分析（オプション）
            let trendAnalysis = null;
            if (analysisOptions.includeTrends) {
                trendAnalysis = await this.analyzeTrends(rawData, analysisOptions.period);
            }
            
            // 7. 改善提案生成（オプション）
            let recommendations = null;
            if (analysisOptions.includeRecommendations) {
                recommendations = this.generateRecommendations({
                    usage: usageAnalysis,
                    engagement: engagementAnalysis,
                    satisfaction: satisfactionAnalysis,
                    effectivenessScore: effectivenessScore,
                    trends: trendAnalysis
                });
            }
            
            // 8. 統合分析結果の構築
            const analysisResult = {
                timestamp: Date.now(),
                period: analysisOptions.period,
                dataQuality: this.assessDataQuality(rawData),
                
                // 主要指標
                overallEffectivenessScore: effectivenessScore.overall,
                keyMetrics: {
                    usage: usageAnalysis.summary,
                    engagement: engagementAnalysis.summary,
                    satisfaction: satisfactionAnalysis.summary
                },
                
                // 詳細分析
                detailedAnalysis: {
                    usage: usageAnalysis,
                    engagement: engagementAnalysis,
                    satisfaction: satisfactionAnalysis,
                    effectiveness: effectivenessScore
                },
                
                // 追加分析
                trends: trendAnalysis,
                recommendations: recommendations,
                
                // メタデータ
                metadata: {
                    analysisOptions: analysisOptions,
                    dataVolume: this.calculateDataVolume(rawData),
                    confidenceLevel: this.calculateConfidenceLevel(rawData)
                }
            };
            
            // キャッシュに保存
            this.analysisCache.set(cacheKey, analysisResult);
            this.lastAnalysisTime = Date.now();
            
            this.loggingSystem.info('HelpEffectivenessAnalyzer', 
                `Effectiveness analysis completed. Overall score: ${effectivenessScore.overall.toFixed(2)}`);
            
            return analysisResult;
            
        } catch (error) {
            this.loggingSystem.error('HelpEffectivenessAnalyzer', 'Failed to analyze effectiveness', error);
            throw error;
        }
    }
    
    /**
     * 生データの収集
     * @param {string} period - 分析期間
     * @returns {Object} 収集されたデータ
     */
    async collectRawData(period) {
        const rawData = {
            analytics: null,
            feedback: null,
            sessions: [],
            interactions: [],
            timestamp: Date.now()
        };
        
        try {
            // アナリティクスデータの収集
            if (this.helpAnalytics) {
                rawData.analytics = this.helpAnalytics.generateReport('detailed', { period });
                rawData.sessions = Array.from(this.helpAnalytics.sessions.values());
            }
            
            // フィードバックデータの収集
            if (this.helpFeedbackSystem) {
                rawData.feedback = this.helpFeedbackSystem.getFeedbackStatistics();
                rawData.interactions = Array.from(this.helpFeedbackSystem.feedbacks.entries());
            }
            
            this.loggingSystem.debug('HelpEffectivenessAnalyzer', `Raw data collected for period: ${period}`);
            return rawData;
            
        } catch (error) {
            this.loggingSystem.error('HelpEffectivenessAnalyzer', 'Failed to collect raw data', error);
            throw error;
        }
    }
    
    /**
     * データ品質の検証
     * @param {Object} rawData - 生データ
     * @returns {boolean} データ品質が十分かどうか
     */
    validateDataQuality(rawData) {
        try {
            // 最小データ数の確認
            const sessionCount = rawData.sessions ? rawData.sessions.length : 0;
            const feedbackCount = rawData.interactions ? rawData.interactions.length : 0;
            
            if (sessionCount < this.config.minDataThreshold && feedbackCount < this.config.minDataThreshold) {
                this.loggingSystem.warn('HelpEffectivenessAnalyzer', 
                    `Insufficient data: sessions=${sessionCount}, feedback=${feedbackCount}`);
                return false;
            }
            
            // データの整合性確認
            if (rawData.analytics && rawData.analytics.error) {
                this.loggingSystem.warn('HelpEffectivenessAnalyzer', 'Analytics data contains errors');
                return false;
            }
            
            return true;
            
        } catch (error) {
            this.loggingSystem.error('HelpEffectivenessAnalyzer', 'Data quality validation failed', error);
            return false;
        }
    }
    
    /**
     * 使用率指標の分析
     * @param {Object} rawData - 生データ
     * @returns {Object} 使用率分析結果
     */
    analyzeUsageMetrics(rawData) {
        try {
            const analysis = {
                summary: {},
                details: {},
                insights: []
            };
            
            if (rawData.analytics && rawData.analytics.data) {
                const analyticsData = rawData.analytics.data;
                
                // 基本使用統計
                analysis.summary = {
                    totalSessions: analyticsData.overview?.totalHelpSessions || 0,
                    uniqueUsers: analyticsData.overview?.uniqueUsers || 0,
                    averageSessionDuration: analyticsData.overview?.averageSessionDuration || 0,
                    pageViewsPerSession: this.calculatePageViewsPerSession(rawData.sessions),
                    searchUsageRate: this.calculateSearchUsageRate(rawData.sessions),
                    returnUserRate: this.calculateReturnUserRate(rawData.sessions)
                };
                
                // 詳細分析
                analysis.details = {
                    topCategories: analyticsData.topContent?.categories || [],
                    topTopics: analyticsData.topContent?.topics || [],
                    searchQueries: analyticsData.topContent?.searchQueries || [],
                    sessionDistribution: this.analyzeSessionDistribution(rawData.sessions),
                    usagePatterns: this.analyzeUsagePatterns(rawData.sessions)
                };
                
                // インサイト生成
                analysis.insights = this.generateUsageInsights(analysis.summary, analysis.details);
            }
            
            return analysis;
            
        } catch (error) {
            this.loggingSystem.error('HelpEffectivenessAnalyzer', 'Failed to analyze usage metrics', error);
            return { summary: {}, details: {}, insights: [] };
        }
    }
    
    /**
     * エンゲージメント指標の分析
     * @param {Object} rawData - 生データ
     * @returns {Object} エンゲージメント分析結果
     */
    analyzeEngagementMetrics(rawData) {
        try {
            const analysis = {
                summary: {},
                details: {},
                insights: []
            };
            
            // エンゲージメント指標の計算
            analysis.summary = {
                averageTimePerTopic: this.calculateAverageTimePerTopic(rawData.sessions),
                interactionRate: this.calculateInteractionRate(rawData.sessions, rawData.interactions),
                searchSuccessRate: this.calculateSearchSuccessRate(rawData.sessions),
                navigationEfficiency: this.calculateNavigationEfficiency(rawData.sessions),
                contentCompletionRate: this.calculateContentCompletionRate(rawData.sessions)
            };
            
            // 詳細エンゲージメント分析
            analysis.details = {
                topicEngagement: this.analyzeTopicEngagement(rawData.sessions),
                searchBehavior: this.analyzeSearchBehavior(rawData.sessions),
                navigationPatterns: this.analyzeNavigationPatterns(rawData.sessions),
                dropoffPoints: this.identifyDropoffPoints(rawData.sessions),
                peakUsageTimes: this.analyzePeakUsageTimes(rawData.sessions)
            };
            
            // エンゲージメントインサイト
            analysis.insights = this.generateEngagementInsights(analysis.summary, analysis.details);
            
            return analysis;
            
        } catch (error) {
            this.loggingSystem.error('HelpEffectivenessAnalyzer', 'Failed to analyze engagement metrics', error);
            return { summary: {}, details: {}, insights: [] };
        }
    }
    
    /**
     * 満足度指標の分析
     * @param {Object} rawData - 生データ
     * @returns {Object} 満足度分析結果
     */
    analyzeSatisfactionMetrics(rawData) {
        try {
            const analysis = {
                summary: {},
                details: {},
                insights: []
            };
            
            if (rawData.feedback) {
                // 基本満足度指標
                analysis.summary = {
                    averageRating: rawData.feedback.averageRating || 0,
                    helpfulnessRate: rawData.feedback.helpfulPercentage || 0,
                    totalFeedbacks: rawData.feedback.totalFeedbacks || 0,
                    ratingDistribution: rawData.feedback.ratingDistribution || {},
                    sentimentScore: this.calculateSentimentScore(rawData.interactions)
                };
                
                // 詳細満足度分析
                analysis.details = {
                    topRatedContent: rawData.feedback.topRatedContent || [],
                    lowRatedContent: rawData.feedback.lowRatedContent || [],
                    feedbackCategories: rawData.feedback.commonCategories || new Map(),
                    improvementAreas: this.identifyImprovementAreas(rawData.interactions),
                    userSentiments: this.analyzeUserSentiments(rawData.interactions)
                };
                
                // 満足度インサイト
                analysis.insights = this.generateSatisfactionInsights(analysis.summary, analysis.details);
            }
            
            return analysis;
            
        } catch (error) {
            this.loggingSystem.error('HelpEffectivenessAnalyzer', 'Failed to analyze satisfaction metrics', error);
            return { summary: {}, details: {}, insights: [] };
        }
    }
    
    /**
     * 効果性スコアの計算
     * @param {Object} analysisData - 分析データ
     * @returns {Object} 効果性スコア
     */
    calculateEffectivenessScore(analysisData) {
        try {
            const weights = {
                usage: 0.25,
                engagement: 0.35,
                satisfaction: 0.40
            };
            
            // 各指標のスコア計算（0-1の範囲）
            const usageScore = this.calculateUsageScore(analysisData.usage);
            const engagementScore = this.calculateEngagementScore(analysisData.engagement);
            const satisfactionScore = this.calculateSatisfactionScore(analysisData.satisfaction);
            
            // 総合効果性スコア
            const overallScore = (
                usageScore * weights.usage +
                engagementScore * weights.engagement +
                satisfactionScore * weights.satisfaction
            );
            
            return {
                overall: overallScore,
                breakdown: {
                    usage: {
                        score: usageScore,
                        weight: weights.usage,
                        contribution: usageScore * weights.usage
                    },
                    engagement: {
                        score: engagementScore,
                        weight: weights.engagement,
                        contribution: engagementScore * weights.engagement
                    },
                    satisfaction: {
                        score: satisfactionScore,
                        weight: weights.satisfaction,
                        contribution: satisfactionScore * weights.satisfaction
                    }
                },
                classification: this.classifyEffectiveness(overallScore),
                benchmark: this.getBenchmarkComparison(overallScore)
            };
            
        } catch (error) {
            this.loggingSystem.error('HelpEffectivenessAnalyzer', 'Failed to calculate effectiveness score', error);
            return { overall: 0, breakdown: {}, classification: 'insufficient_data' };
        }
    }
    
    /**
     * トレンド分析
     * @param {Object} rawData - 生データ
     * @param {string} period - 分析期間
     * @returns {Object} トレンド分析結果
     */
    async analyzeTrends(rawData, period) {
        try {
            const trends = {
                usage: this.calculateUsageTrends(rawData.sessions),
                satisfaction: this.calculateSatisfactionTrends(rawData.interactions),
                content: this.calculateContentTrends(rawData.sessions),
                predictions: this.generateTrendPredictions(rawData)
            };
            
            return trends;
            
        } catch (error) {
            this.loggingSystem.error('HelpEffectivenessAnalyzer', 'Failed to analyze trends', error);
            return null;
        }
    }
    
    /**
     * 改善提案の生成
     * @param {Object} analysisResults - 分析結果
     * @returns {Array} 改善提案のリスト
     */
    generateRecommendations(analysisResults) {
        const recommendations = [];
        
        try {
            // 使用率関連の提案
            recommendations.push(...this.generateUsageRecommendations(analysisResults.usage));
            
            // エンゲージメント関連の提案
            recommendations.push(...this.generateEngagementRecommendations(analysisResults.engagement));
            
            // 満足度関連の提案
            recommendations.push(...this.generateSatisfactionRecommendations(analysisResults.satisfaction));
            
            // 効果性スコアに基づく総合提案
            recommendations.push(...this.generateOverallRecommendations(analysisResults.effectivenessScore));
            
            // 優先度順にソート
            recommendations.sort((a, b) => {
                const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            });
            
            return recommendations.slice(0, 10); // 上位10個の提案を返す
            
        } catch (error) {
            this.loggingSystem.error('HelpEffectivenessAnalyzer', 'Failed to generate recommendations', error);
            return [];
        }
    }
    
    /**
     * 効果測定レポートの生成
     * @param {string} reportType - レポートタイプ
     * @param {Object} options - オプション
     * @returns {Object} 効果測定レポート
     */
    async generateEffectivenessReport(reportType = 'comprehensive', options = {}) {
        try {
            const cacheKey = this.generateCacheKey('report', { reportType, ...options });
            
            // キャッシュの確認
            if (this.isCacheValid(cacheKey, this.config.reportCacheTimeout)) {
                return this.reportCache.get(cacheKey);
            }
            
            // 効果分析の実行
            const analysisResult = await this.analyzeEffectiveness(options);
            
            // レポートタイプに応じた内容生成
            let report;
            switch (reportType) {
                case 'executive':
                    report = this.generateExecutiveReport(analysisResult);
                    break;
                case 'detailed':
                    report = this.generateDetailedReport(analysisResult);
                    break;
                case 'actionable':
                    report = this.generateActionableReport(analysisResult);
                    break;
                case 'comprehensive':
                default:
                    report = this.generateComprehensiveReport(analysisResult);
                    break;
            }
            
            // レポートにメタデータを追加
            report.metadata.reportType = reportType;
            report.metadata.generatedAt = Date.now();
            report.metadata.cacheKey = cacheKey;
            
            // キャッシュに保存
            this.reportCache.set(cacheKey, report);
            
            this.loggingSystem.info('HelpEffectivenessAnalyzer', `${reportType} report generated successfully`);
            return report;
            
        } catch (error) {
            this.loggingSystem.error('HelpEffectivenessAnalyzer', `Failed to generate ${reportType} report`, error);
            throw error;
        }
    }
    
    /**
     * 定期分析の開始
     */
    startPeriodicAnalysis() {
        // 1時間ごとに分析を実行
        setInterval(async () => {
            try {
                await this.analyzeEffectiveness({
                    period: 'recent',
                    detailLevel: 'summary'
                });
                this.loggingSystem.debug('HelpEffectivenessAnalyzer', 'Periodic analysis completed');
            } catch (error) {
                this.loggingSystem.error('HelpEffectivenessAnalyzer', 'Periodic analysis failed', error);
            }
        }, 3600000); // 1時間
    }
    
    /**
     * ユーティリティメソッド群
     */
    
    generateCacheKey(type, options) {
        return `${type}_${JSON.stringify(options)}_${Math.floor(Date.now() / 60000)}`; // 1分単位
    }
    
    isCacheValid(cacheKey, timeout = 300000) {
        const cached = this.analysisCache.get(cacheKey) || this.reportCache.get(cacheKey);
        if (!cached) return false;
        
        return (Date.now() - cached.timestamp) < timeout;
    }
    
    calculatePageViewsPerSession(sessions) {
        if (!sessions || sessions.length === 0) return 0;
        
        const totalPageViews = sessions.reduce((sum, session) => {
            return sum + (session.pageViews ? session.pageViews.length : 0);
        }, 0);
        
        return totalPageViews / sessions.length;
    }
    
    calculateSearchUsageRate(sessions) {
        if (!sessions || sessions.length === 0) return 0;
        
        const sessionsWithSearch = sessions.filter(session => 
            session.searchQueries && session.searchQueries.length > 0
        ).length;
        
        return sessionsWithSearch / sessions.length;
    }
    
    calculateReturnUserRate(sessions) {
        if (!sessions || sessions.length === 0) return 0;
        
        // 簡単な実装: 同じentryPointを持つセッションの比率で推定
        const entryPoints = new Map();
        sessions.forEach(session => {
            const count = entryPoints.get(session.entryPoint) || 0;
            entryPoints.set(session.entryPoint, count + 1);
        });
        
        const returningSessions = Array.from(entryPoints.values()).filter(count => count > 1).length;
        return returningSessions / entryPoints.size;
    }
    
    classifyEffectiveness(score) {
        if (score >= 0.8) return 'excellent';
        if (score >= 0.6) return 'good';
        if (score >= 0.4) return 'fair';
        if (score >= 0.2) return 'poor';
        return 'critical';
    }
    
    getBenchmarkComparison(score) {
        const benchmarks = {
            industry_average: 0.65,
            good_practice: 0.75,
            excellent: 0.85
        };
        
        return {
            industry_average: score - benchmarks.industry_average,
            good_practice: score - benchmarks.good_practice,
            excellent: score - benchmarks.excellent
        };
    }
    
    assessDataQuality(rawData) {
        const sessionCount = rawData.sessions ? rawData.sessions.length : 0;
        const feedbackCount = rawData.interactions ? rawData.interactions.length : 0;
        
        let quality = 0;
        if (sessionCount >= 50) quality += 0.4;
        else if (sessionCount >= 20) quality += 0.3;
        else if (sessionCount >= 5) quality += 0.2;
        
        if (feedbackCount >= 20) quality += 0.4;
        else if (feedbackCount >= 10) quality += 0.3;
        else if (feedbackCount >= 3) quality += 0.2;
        
        if (rawData.analytics && !rawData.analytics.error) quality += 0.2;
        
        return Math.min(quality, 1.0);
    }
    
    calculateDataVolume(rawData) {
        return {
            sessions: rawData.sessions ? rawData.sessions.length : 0,
            feedback: rawData.interactions ? rawData.interactions.length : 0,
            analytics_events: rawData.analytics ? 
                (rawData.analytics.data?.overview?.totalPageViews || 0) : 0
        };
    }
    
    calculateConfidenceLevel(rawData) {
        const dataQuality = this.assessDataQuality(rawData);
        const dataVolume = this.calculateDataVolume(rawData);
        
        // データ量とデータ品質から信頼度を計算
        let confidence = dataQuality * 0.6;
        
        // セッション数による信頼度調整
        if (dataVolume.sessions >= 100) confidence += 0.3;
        else if (dataVolume.sessions >= 50) confidence += 0.2;
        else if (dataVolume.sessions >= 20) confidence += 0.1;
        
        // フィードバック数による信頼度調整
        if (dataVolume.feedback >= 50) confidence += 0.1;
        
        return Math.min(confidence, 1.0);
    }
    
    /**
     * 詳細計算メソッド群
     */
    
    // 使用率スコア計算
    calculateUsageScore(usageAnalysis) {
        if (!usageAnalysis.summary) return 0;
        
        const s = usageAnalysis.summary;
        let score = 0;
        
        // セッション数による評価（0-0.3）
        if (s.totalSessions >= 100) score += 0.3;
        else if (s.totalSessions >= 50) score += 0.2;
        else if (s.totalSessions >= 20) score += 0.1;
        
        // セッション時間による評価（0-0.3）
        if (s.averageSessionDuration >= 300) score += 0.3; // 5分以上
        else if (s.averageSessionDuration >= 120) score += 0.2; // 2分以上
        else if (s.averageSessionDuration >= 60) score += 0.1; // 1分以上
        
        // ページビュー率による評価（0-0.2）
        if (s.pageViewsPerSession >= 5) score += 0.2;
        else if (s.pageViewsPerSession >= 3) score += 0.15;
        else if (s.pageViewsPerSession >= 2) score += 0.1;
        
        // 検索利用率による評価（0-0.2）
        if (s.searchUsageRate >= 0.5) score += 0.2;
        else if (s.searchUsageRate >= 0.3) score += 0.15;
        else if (s.searchUsageRate >= 0.1) score += 0.1;
        
        return Math.min(score, 1.0);
    }
    
    // エンゲージメントスコア計算
    calculateEngagementScore(engagementAnalysis) {
        if (!engagementAnalysis.summary) return 0;
        
        const s = engagementAnalysis.summary;
        let score = 0;
        
        // トピック滞在時間による評価（0-0.4）
        if (s.averageTimePerTopic >= 180) score += 0.4; // 3分以上
        else if (s.averageTimePerTopic >= 120) score += 0.3; // 2分以上
        else if (s.averageTimePerTopic >= 60) score += 0.2; // 1分以上
        
        // インタラクション率による評価（0-0.3）
        if (s.interactionRate >= 0.7) score += 0.3;
        else if (s.interactionRate >= 0.5) score += 0.2;
        else if (s.interactionRate >= 0.3) score += 0.1;
        
        // 検索成功率による評価（0-0.3）
        if (s.searchSuccessRate >= 0.8) score += 0.3;
        else if (s.searchSuccessRate >= 0.6) score += 0.2;
        else if (s.searchSuccessRate >= 0.4) score += 0.1;
        
        return Math.min(score, 1.0);
    }
    
    // 満足度スコア計算
    calculateSatisfactionScore(satisfactionAnalysis) {
        if (!satisfactionAnalysis.summary) return 0;
        
        const s = satisfactionAnalysis.summary;
        let score = 0;
        
        // 平均評価による評価（0-0.5）
        if (s.averageRating >= 4.5) score += 0.5;
        else if (s.averageRating >= 4.0) score += 0.4;
        else if (s.averageRating >= 3.5) score += 0.3;
        else if (s.averageRating >= 3.0) score += 0.2;
        
        // 有用性率による評価（0-0.3）
        if (s.helpfulnessRate >= 80) score += 0.3;
        else if (s.helpfulnessRate >= 60) score += 0.2;
        else if (s.helpfulnessRate >= 40) score += 0.1;
        
        // フィードバック量による評価（0-0.2）
        if (s.totalFeedbacks >= 50) score += 0.2;
        else if (s.totalFeedbacks >= 20) score += 0.15;
        else if (s.totalFeedbacks >= 10) score += 0.1;
        
        return Math.min(score, 1.0);
    }
    
    // 基本計算メソッド群
    calculateAverageTimePerTopic(sessions) {
        if (!sessions || sessions.length === 0) return 0;
        
        let totalTime = 0;
        let topicCount = 0;
        
        sessions.forEach(session => {
            if (session.pageViews) {
                session.pageViews.forEach(pageView => {
                    if (pageView.timeSpent) {
                        totalTime += pageView.timeSpent;
                        topicCount++;
                    }
                });
            }
        });
        
        return topicCount > 0 ? totalTime / topicCount / 1000 : 0; // 秒単位
    }
    
    calculateInteractionRate(sessions, interactions) {
        if (!sessions || sessions.length === 0) return 0;
        
        const interactionCount = interactions ? interactions.length : 0;
        return interactionCount / sessions.length;
    }
    
    calculateSearchSuccessRate(sessions) {
        if (!sessions || sessions.length === 0) return 0;
        
        let totalSearches = 0;
        let successfulSearches = 0;
        
        sessions.forEach(session => {
            if (session.searchQueries) {
                session.searchQueries.forEach(query => {
                    totalSearches++;
                    if (query.resultCount > 0) {
                        successfulSearches++;
                    }
                });
            }
        });
        
        return totalSearches > 0 ? successfulSearches / totalSearches : 0;
    }
    
    calculateNavigationEfficiency(sessions) {
        // ナビゲーション効率の簡単な実装
        if (!sessions || sessions.length === 0) return 0;
        
        let totalNavigations = 0;
        let efficientNavigations = 0;
        
        sessions.forEach(session => {
            if (session.pageViews && session.pageViews.length > 1) {
                totalNavigations++;
                // 直帰率が低い場合を効率的とみなす
                if (session.pageViews.length >= 3) {
                    efficientNavigations++;
                }
            }
        });
        
        return totalNavigations > 0 ? efficientNavigations / totalNavigations : 0;
    }
    
    calculateContentCompletionRate(sessions) {
        // コンテンツ完了率の推定
        if (!sessions || sessions.length === 0) return 0;
        
        let completedSessions = 0;
        
        sessions.forEach(session => {
            if (session.duration && session.duration > 120000) { // 2分以上
                completedSessions++;
            }
        });
        
        return completedSessions / sessions.length;
    }
    
    calculateSentimentScore(interactions) {
        if (!interactions || interactions.length === 0) return 0.5;
        
        let positiveCount = 0;
        let totalCount = 0;
        
        interactions.forEach(([contentId, feedback]) => {
            if (feedback.helpful !== null) {
                totalCount++;
                if (feedback.helpful) {
                    positiveCount++;
                }
            }
        });
        
        return totalCount > 0 ? positiveCount / totalCount : 0.5;
    }
    
    // 分析メソッド群の基本実装
    analyzeSessionDistribution(sessions) {
        const distribution = {
            byDuration: { short: 0, medium: 0, long: 0 },
            byPageViews: { few: 0, moderate: 0, many: 0 },
            byTime: new Map()
        };
        
        sessions.forEach(session => {
            // 時間別分布
            if (session.duration) {
                if (session.duration < 60000) distribution.byDuration.short++;
                else if (session.duration < 300000) distribution.byDuration.medium++;
                else distribution.byDuration.long++;
            }
            
            // ページビュー分布
            const pageViews = session.pageViews ? session.pageViews.length : 0;
            if (pageViews < 3) distribution.byPageViews.few++;
            else if (pageViews < 7) distribution.byPageViews.moderate++;
            else distribution.byPageViews.many++;
        });
        
        return distribution;
    }
    
    analyzeUsagePatterns(sessions) {
        const patterns = {
            peakHours: new Map(),
            commonJourneys: new Map(),
            entryPoints: new Map()
        };
        
        sessions.forEach(session => {
            // エントリーポイント分析
            const entry = session.entryPoint || 'unknown';
            patterns.entryPoints.set(entry, (patterns.entryPoints.get(entry) || 0) + 1);
            
            // 時間帯分析
            if (session.startTime) {
                const hour = new Date(session.startTime).getHours();
                patterns.peakHours.set(hour, (patterns.peakHours.get(hour) || 0) + 1);
            }
        });
        
        return patterns;
    }
    
    generateUsageInsights(summary, details) {
        const insights = [];
        
        if (summary.averageSessionDuration < 60) {
            insights.push({
                type: 'usage_concern',
                message: 'セッション時間が短く、ユーザーが求める情報を見つけにくい可能性があります',
                severity: 'medium'
            });
        }
        
        if (summary.searchUsageRate > 0.6) {
            insights.push({
                type: 'usage_positive',
                message: '検索機能がよく利用されており、ユーザーの能動的な情報探索が見られます',
                severity: 'low'
            });
        }
        
        return insights;
    }
    
    // 簡略化された分析メソッド
    analyzeTopicEngagement(sessions) { return {}; }
    analyzeSearchBehavior(sessions) { return {}; }
    analyzeNavigationPatterns(sessions) { return {}; }
    identifyDropoffPoints(sessions) { return []; }
    analyzePeakUsageTimes(sessions) { return {}; }
    generateEngagementInsights(summary, details) { return []; }
    identifyImprovementAreas(interactions) { return []; }
    analyzeUserSentiments(interactions) { return {}; }
    generateSatisfactionInsights(summary, details) { return []; }
    calculateUsageTrends(sessions) { return {}; }
    calculateSatisfactionTrends(interactions) { return {}; }
    calculateContentTrends(sessions) { return {}; }
    generateTrendPredictions(rawData) { return {}; }
    generateUsageRecommendations(usage) { return []; }
    generateEngagementRecommendations(engagement) { return []; }
    generateSatisfactionRecommendations(satisfaction) { return []; }
    generateOverallRecommendations(effectivenessScore) { return []; }
    generateExecutiveReport(analysis) { return { ...analysis, type: 'executive' }; }
    generateDetailedReport(analysis) { return { ...analysis, type: 'detailed' }; }
    generateActionableReport(analysis) { return { ...analysis, type: 'actionable' }; }
    generateComprehensiveReport(analysis) { return { ...analysis, type: 'comprehensive' }; }
    
    /**
     * クリーンアップ処理
     */
    cleanup() {
        try {
            // キャッシュのクリア
            this.analysisCache.clear();
            this.reportCache.clear();
            
            this.loggingSystem.info('HelpEffectivenessAnalyzer', 'Help effectiveness analyzer cleaned up');
        } catch (error) {
            this.loggingSystem.error('HelpEffectivenessAnalyzer', 'Failed to cleanup analyzer', error);
        }
    }
}

// シングルトンインスタンス管理
let helpEffectivenessAnalyzerInstance = null;

/**
 * HelpEffectivenessAnalyzerのシングルトンインスタンスを取得
 * @param {GameEngine} gameEngine - ゲームエンジンインスタンス
 * @returns {HelpEffectivenessAnalyzer} HelpEffectivenessAnalyzerインスタンス
 */
export function getHelpEffectivenessAnalyzer(gameEngine) {
    if (!helpEffectivenessAnalyzerInstance && gameEngine) {
        helpEffectivenessAnalyzerInstance = new HelpEffectivenessAnalyzer(gameEngine);
    }
    return helpEffectivenessAnalyzerInstance;
}

/**
 * HelpEffectivenessAnalyzerインスタンスを再初期化
 * @param {GameEngine} gameEngine - ゲームエンジンインスタンス
 * @returns {HelpEffectivenessAnalyzer} 新しいHelpEffectivenessAnalyzerインスタンス
 */
export function reinitializeHelpEffectivenessAnalyzer(gameEngine) {
    if (helpEffectivenessAnalyzerInstance) {
        helpEffectivenessAnalyzerInstance.cleanup();
    }
    helpEffectivenessAnalyzerInstance = gameEngine ? new HelpEffectivenessAnalyzer(gameEngine) : null;
    return helpEffectivenessAnalyzerInstance;
}