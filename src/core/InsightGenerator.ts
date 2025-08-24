export enum InsightType {
    PERFORMANCE = 'performance',
    TREND = 'trend',
    ANOMALY = 'anomaly',
    OPPORTUNITY = 'opportunity',
    WARNING = 'warning',
    ACHIEVEMENT = 'achievement',
    PATTERN = 'pattern',
    RECOMMENDATION = 'recommendation'
}

export enum PriorityLevel {
    CRITICAL = 'critical',
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low',
    INFORMATIONAL = 'informational'
}

export interface InsightConfig {
    thresholds: {
        significant_change: number;
        concerning_decline: number;
        excellent_improvement: number;
        volatility_warning: number;
        streak_achievement: number;
    };
    patterns: {
        min_data_points: number;
        trend_consistency: number;
        cycle_detection_window: number;
        outlier_threshold: number;
    };
    recommendations: {
        max_recommendations: number;
        action_confidence_threshold: number;
    };
    priority_scoring_weights: {
        impact: number;
        urgency: number;
        feasibility: number;
    };
}

export interface Insight {
    id: string;
    type: string;
    title: string;
    description: string;
    priority: string;
    timestamp: number;
    context: Record<string, any>;
    confidence: number;
}

export interface Recommendation {
    id: string;
    type: string;
    title: string;
    description: string;
    actionItems: string[];
    priority: string;
    estimatedImpact: string;
    timeToImplement: string;
}

export interface StatisticsData {
    basic?: any;
    bubbles?: any;
    combos?: any;
    health?: any;
    playstyle?: any;
    timeStats?: any;
    progress?: any;
    timeSeries?: any;
    session?: any;
}

export interface InsightResult {
    generationId: string;
    timestamp: number;
    dataSource: string;
    insights: Insight[];
    recommendations: Recommendation[];
    summary: any;
    metadata: {
        totalInsights: number;
        criticalInsights: number;
        dataQuality: any;
        analysisConfidence: number;
    };
}

/**
 * 洞察生成クラス
 * 統計データから意味のある洞察、推奨事項、アクションアイテムを生成する
 */
export class InsightGenerator {
    private insightTypes: typeof InsightType;
    private priorityLevels: typeof PriorityLevel;
    private insightConfigs: InsightConfig;
    private insightTemplates: Record<string, any>;

    constructor() {
        this.insightTypes = InsightType;

        this.priorityLevels = PriorityLevel;

        this.insightConfigs = {
            thresholds: {
                significant_change: 0.15, // 15%
                concerning_decline: -0.20, // -20%
                excellent_improvement: 0.30, // 30%
                volatility_warning: 0.40, // 40%
                streak_achievement: 5 // 5連続
            },
            patterns: {
                min_data_points: 3,
                trend_consistency: 0.7, // 70%
                cycle_detection_window: 7, // 7日
                outlier_threshold: 2.0 // 標準偏差の2倍
            },
            recommendations: {
                max_recommendations: 5,
                action_confidence_threshold: 0.6 // 60%
            },
            priority_scoring_weights: {
                impact: 0.4, // 40%
                urgency: 0.3, // 30%
                feasibility: 0.3 // 30%
            }
        };

        this.insightTemplates = this.initializeInsightTemplates();
    }

    /**
     * 洞察テンプレートを初期化
     */
    private initializeInsightTemplates(): Record<string, any> {
        return {
            performance: {
                improvement: {
                    title: "パフォーマンス向上",
                    description: "最近のスコアが改善されています",
                    priority: PriorityLevel.MEDIUM
                },
                decline: {
                    title: "パフォーマンス低下",
                    description: "最近のスコアが低下しています",
                    priority: PriorityLevel.HIGH
                }
            },
            trend: {
                upward: {
                    title: "上昇トレンド",
                    description: "継続的な改善が見られます",
                    priority: PriorityLevel.MEDIUM
                },
                downward: {
                    title: "下降トレンド",
                    description: "継続的な低下が見られます",
                    priority: PriorityLevel.HIGH
                }
            },
            anomaly: {
                outlier: {
                    title: "異常値検出",
                    description: "通常とは異なるパフォーマンスが検出されました",
                    priority: PriorityLevel.MEDIUM
                }
            },
            achievement: {
                streak: {
                    title: "連続記録達成",
                    description: "素晴らしい連続記録を達成しました",
                    priority: PriorityLevel.LOW
                },
                milestone: {
                    title: "マイルストーン達成",
                    description: "重要なマイルストーンを達成しました",
                    priority: PriorityLevel.MEDIUM
                }
            }
        };
    }

    /**
     * 統計データから洞察を生成
     */
    async generateInsights(statisticsData: StatisticsData, options: any = {}): Promise<InsightResult> {
        try {
            const generationId = this.generateId();
            const insights: Insight[] = [];
            const recommendations: Recommendation[] = [];

            // パフォーマンス分析
            const performanceInsights = await this.analyzePerformance(statisticsData);
            insights.push(...performanceInsights);

            // トレンド分析
            const trendInsights = await this.analyzeTrends(statisticsData);
            insights.push(...trendInsights);

            // 異常値検出
            const anomalyInsights = await this.detectAnomalies(statisticsData);
            insights.push(...anomalyInsights);

            // パターン認識
            const patternInsights = await this.recognizePatterns(statisticsData);
            insights.push(...patternInsights);

            // 達成分析
            const achievementInsights = await this.analyzeAchievements(statisticsData);
            insights.push(...achievementInsights);

            // 推奨事項生成
            const generatedRecommendations = await this.generateRecommendations(insights, statisticsData);
            recommendations.push(...generatedRecommendations);

            // 優先度順にソート
            insights.sort((a, b) => this.comparePriority(a.priority, b.priority));
            recommendations.sort((a, b) => this.comparePriority(a.priority, b.priority));

            // 結果の構築
            const result: InsightResult = {
                generationId,
                timestamp: Date.now(),
                dataSource: options.dataSource || 'statistics',
                insights,
                recommendations,
                summary: this.generateSummary(insights, recommendations),
                metadata: {
                    totalInsights: insights.length,
                    criticalInsights: insights.filter(i => i.priority === PriorityLevel.CRITICAL).length,
                    dataQuality: this.assessDataQuality(statisticsData),
                    analysisConfidence: this.calculateAnalysisConfidence(insights)
                }
            };

            return result;

        } catch (error) {
            console.error('Error generating insights:', error);
            throw error;
        }
    }

    /**
     * パフォーマンス分析
     */
    private async analyzePerformance(data: StatisticsData): Promise<Insight[]> {
        const insights: Insight[] = [];

        if (!data.basic) return insights;

        try {
            // スコアの変化を分析
            if (data.basic.currentScore && data.basic.previousScore) {
                const change = (data.basic.currentScore - data.basic.previousScore) / data.basic.previousScore;

                if (change >= this.insightConfigs.thresholds.excellent_improvement) {
                    insights.push(this.createInsight(
                        InsightType.PERFORMANCE,
                        'performance.improvement',
                        `スコアが${(change * 100).toFixed(1)}%向上`,
                        PriorityLevel.MEDIUM,
                        { change, currentScore: data.basic.currentScore, previousScore: data.basic.previousScore }
                    ));
                } else if (change <= this.insightConfigs.thresholds.concerning_decline) {
                    insights.push(this.createInsight(
                        InsightType.PERFORMANCE,
                        'performance.decline',
                        `スコアが${Math.abs(change * 100).toFixed(1)}%低下`,
                        PriorityLevel.HIGH,
                        { change, currentScore: data.basic.currentScore, previousScore: data.basic.previousScore }
                    ));
                }
            }

            // 精度の分析
            if (data.basic.accuracy !== undefined) {
                if (data.basic.accuracy < 0.5) {
                    insights.push(this.createInsight(
                        InsightType.WARNING,
                        'accuracy.low',
                        `精度が低下しています (${(data.basic.accuracy * 100).toFixed(1)}%)`,
                        PriorityLevel.HIGH,
                        { accuracy: data.basic.accuracy }
                    ));
                } else if (data.basic.accuracy > 0.9) {
                    insights.push(this.createInsight(
                        InsightType.ACHIEVEMENT,
                        'accuracy.excellent',
                        `優秀な精度を達成 (${(data.basic.accuracy * 100).toFixed(1)}%)`,
                        PriorityLevel.LOW,
                        { accuracy: data.basic.accuracy }
                    ));
                }
            }

        } catch (error) {
            console.error('Error in performance analysis:', error);
        }

        return insights;
    }

    /**
     * トレンド分析
     */
    private async analyzeTrends(data: StatisticsData): Promise<Insight[]> {
        const insights: Insight[] = [];

        if (!data.timeSeries || !Array.isArray(data.timeSeries)) return insights;

        try {
            const scores = data.timeSeries.map((item: any) => item.score).filter((score: any) => score != null);
            
            if (scores.length < this.insightConfigs.patterns.min_data_points) {
                return insights;
            }

            // 線形回帰によるトレンド検出
            const trend = this.calculateLinearTrend(scores);
            
            if (Math.abs(trend.slope) > 0.1) {
                const trendType = trend.slope > 0 ? 'upward' : 'downward';
                const priority = trend.slope > 0 ? PriorityLevel.MEDIUM : PriorityLevel.HIGH;
                
                insights.push(this.createInsight(
                    InsightType.TREND,
                    `trend.${trendType}`,
                    `${trendType === 'upward' ? '上昇' : '下降'}トレンドを検出`,
                    priority,
                    { slope: trend.slope, confidence: trend.confidence }
                ));
            }

        } catch (error) {
            console.error('Error in trend analysis:', error);
        }

        return insights;
    }

    /**
     * 異常値検出
     */
    private async detectAnomalies(data: StatisticsData): Promise<Insight[]> {
        const insights: Insight[] = [];

        if (!data.timeSeries || !Array.isArray(data.timeSeries)) return insights;

        try {
            const scores = data.timeSeries.map((item: any) => item.score).filter((score: any) => score != null);
            
            if (scores.length < this.insightConfigs.patterns.min_data_points) {
                return insights;
            }

            const stats = this.calculateStatistics(scores);
            const outliers = scores.filter(score => 
                Math.abs((score - stats.mean) / stats.standardDeviation) > this.insightConfigs.patterns.outlier_threshold
            );

            if (outliers.length > 0) {
                insights.push(this.createInsight(
                    InsightType.ANOMALY,
                    'anomaly.outlier',
                    `${outliers.length}個の異常値を検出`,
                    PriorityLevel.MEDIUM,
                    { outliers, mean: stats.mean, standardDeviation: stats.standardDeviation }
                ));
            }

        } catch (error) {
            console.error('Error in anomaly detection:', error);
        }

        return insights;
    }

    /**
     * パターン認識
     */
    private async recognizePatterns(data: StatisticsData): Promise<Insight[]> {
        const insights: Insight[] = [];

        try {
            // プレイスタイルパターンの分析
            if (data.playstyle) {
                const patterns = this.analyzePlaystylePatterns(data.playstyle);
                insights.push(...patterns);
            }

            // 時間パターンの分析
            if (data.timeStats) {
                const timePatterns = this.analyzeTimePatterns(data.timeStats);
                insights.push(...timePatterns);
            }

        } catch (error) {
            console.error('Error in pattern recognition:', error);
        }

        return insights;
    }

    /**
     * 達成分析
     */
    private async analyzeAchievements(data: StatisticsData): Promise<Insight[]> {
        const insights: Insight[] = [];

        try {
            // 連続記録の確認
            if (data.session && data.session.streak) {
                if (data.session.streak >= this.insightConfigs.thresholds.streak_achievement) {
                    insights.push(this.createInsight(
                        InsightType.ACHIEVEMENT,
                        'achievement.streak',
                        `${data.session.streak}連続の記録を達成`,
                        PriorityLevel.LOW,
                        { streak: data.session.streak }
                    ));
                }
            }

            // マイルストーンの確認
            if (data.progress) {
                const milestones = this.checkMilestones(data.progress);
                insights.push(...milestones);
            }

        } catch (error) {
            console.error('Error in achievement analysis:', error);
        }

        return insights;
    }

    /**
     * 推奨事項生成
     */
    private async generateRecommendations(insights: Insight[], data: StatisticsData): Promise<Recommendation[]> {
        const recommendations: Recommendation[] = [];

        try {
            // 高優先度の洞察から推奨事項を生成
            const highPriorityInsights = insights.filter(insight => 
                insight.priority === PriorityLevel.CRITICAL || insight.priority === PriorityLevel.HIGH
            );

            for (const insight of highPriorityInsights) {
                const recommendation = this.createRecommendationFromInsight(insight, data);
                if (recommendation) {
                    recommendations.push(recommendation);
                }
            }

            // 一般的な改善提案
            const generalRecommendations = this.generateGeneralRecommendations(data);
            recommendations.push(...generalRecommendations);

        } catch (error) {
            console.error('Error in recommendation generation:', error);
        }

        return recommendations.slice(0, this.insightConfigs.recommendations.max_recommendations);
    }

    // ヘルパーメソッド
    private generateId(): string {
        return `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private createInsight(type: InsightType, templateKey: string, description: string, priority: PriorityLevel, context: any): Insight {
        return {
            id: this.generateId(),
            type,
            title: templateKey,
            description,
            priority,
            timestamp: Date.now(),
            context,
            confidence: 0.8 // デフォルト信頼度
        };
    }

    private createRecommendationFromInsight(insight: Insight, data: StatisticsData): Recommendation | null {
        // 洞察に基づいた推奨事項の生成ロジック
        const baseRecommendation = {
            id: this.generateId(),
            type: 'improvement',
            priority: insight.priority,
            estimatedImpact: 'medium',
            timeToImplement: 'short'
        };

        switch (insight.type) {
            case InsightType.PERFORMANCE:
                return {
                    ...baseRecommendation,
                    title: 'パフォーマンス改善',
                    description: 'スコア向上のための練習を行う',
                    actionItems: ['基礎練習を増やす', '弱点分析を行う', '定期的な練習計画を立てる']
                };
            case InsightType.WARNING:
                return {
                    ...baseRecommendation,
                    title: '問題解決',
                    description: '警告事項への対処',
                    actionItems: ['原因の特定', '修正アクションの実行', '進捗モニタリング']
                };
            default:
                return null;
        }
    }

    private generateGeneralRecommendations(data: StatisticsData): Recommendation[] {
        // 一般的な推奨事項の生成
        return [];
    }

    private comparePriority(a: string, b: string): number {
        const priorityOrder = ['critical', 'high', 'medium', 'low', 'informational'];
        return priorityOrder.indexOf(a) - priorityOrder.indexOf(b);
    }

    private generateSummary(insights: Insight[], recommendations: Recommendation[]): any {
        return {
            totalInsights: insights.length,
            totalRecommendations: recommendations.length,
            priorityBreakdown: {
                critical: insights.filter(i => i.priority === PriorityLevel.CRITICAL).length,
                high: insights.filter(i => i.priority === PriorityLevel.HIGH).length,
                medium: insights.filter(i => i.priority === PriorityLevel.MEDIUM).length,
                low: insights.filter(i => i.priority === PriorityLevel.LOW).length
            }
        };
    }

    private assessDataQuality(data: StatisticsData): any {
        return { score: 0.8, completeness: 0.9, freshness: 0.8 };
    }

    private calculateAnalysisConfidence(insights: Insight[]): number {
        if (insights.length === 0) return 0;
        const totalConfidence = insights.reduce((sum, insight) => sum + insight.confidence, 0);
        return totalConfidence / insights.length;
    }

    private calculateLinearTrend(values: number[]): { slope: number; confidence: number } {
        if (values.length < 2) return { slope: 0, confidence: 0 };
        
        const n = values.length;
        const x = Array.from({ length: n }, (_, i) => i);
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = values.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const confidence = Math.min(1, Math.abs(slope) / Math.max(...values) * 10); // 簡易信頼度計算
        
        return { slope, confidence };
    }

    private calculateStatistics(values: number[]): { mean: number; standardDeviation: number } {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
        return { mean, standardDeviation: Math.sqrt(variance) };
    }

    private analyzePlaystylePatterns(playstyle: any): Insight[] {
        // プレイスタイルパターン分析の実装
        return [];
    }

    private analyzeTimePatterns(timeStats: any): Insight[] {
        // 時間パターン分析の実装
        return [];
    }

    private checkMilestones(progress: any): Insight[] {
        // マイルストーンチェックの実装
        return [];
    }
}