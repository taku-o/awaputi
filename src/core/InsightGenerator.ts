export interface InsightType { PERFORMANCE: 'performance',''
    TREND: 'trend,
    ANOMALY: 'anomaly,
    OPPORTUNITY: 'opportunity,
    WARNING: 'warning,
    ACHIEVEMENT: 'achievement,
    PATTERN: 'pattern,
    RECOMMENDATION: 'recommendation'
            };
';'

export interface PriorityLevel {;
    CRITICAL: 'critical,
    HIGH: 'high,
    MEDIUM: 'medium,
    LOW: 'low,
    INFORMATIONAL: 'informational'
            };
export interface InsightConfig { thresholds: { significant_chang,e: number,
        concerning_decline: number,
        excellent_improvement: number,
        volatility_warning: number,
    streak_achievement: number,
    patterns: { min_data_points: number,
        trend_consistency: number;
    },
        cycle_detection_window: number,
    outlier_threshold: number,
    recommendations: { max_recommendations: number,
        action_confidence_threshold: number;
    },
    priority_scoring_weights: { impact: number;
    },
            urgency: number,
    feasibility: number;
}

export interface Insight { id: string,
    type: string,
    title: string,
    description: string,
    priority: string,
    timestamp: number,
    context: Record<string, any>;
    confidence: number;
    export interface Recommendation { id: string,
    type: string,
    title: string,
    description: string,
    actionItems: string[],
    priority: string,
    estimatedImpact: string,
    timeToImplement: string;
    export interface StatisticsData { basic?: any,
    bubbles?: any;
    combos?: any;
    health?: any;
    playstyle?: any;
    timeStats?: any;
    progress?: any;
    timeSeries?: any;
    session?: any;
    export interface InsightResult { generationId: string,
    timestamp: number,
    dataSource: string,
    insights: Insight[],
    recommendations: Recommendation[],
    summary: any,
    metadata: {
        totalInsight,s: number;
    },
        criticalInsights: number,
        dataQuality: any,
    analysisConfidence: number,
    analysisConfidence: number;
        };
/**
 * 洞察生成クラス
 * 統計データから意味のある洞察、推奨事項、アクションアイテムを生成する
 */
export class InsightGenerator {
    private insightTypes: InsightType;
    private priorityLevels: PriorityLevel;
    private insightConfigs: InsightConfig;
    private, insightTemplates: Record<string, any>;

    constructor('''
            PERFORMANCE: 'performance,
            TREND: 'trend,
            ANOMALY: 'anomaly,
            OPPORTUNITY: 'opportunity,
            WARNING: 'warning,
            ACHIEVEMENT: 'achievement,
            PATTERN: 'pattern,
            RECOMMENDATION: 'recommendation'
            };
        ';'

        this.priorityLevels = {;
            CRITICAL: 'critical,
            HIGH: 'high,
            MEDIUM: 'medium,
            LOW: 'low,
            INFORMATIONAL: 'informational'
            };
        this.insightConfigs = { // 洞察生成の閾値
            thresholds: { significant_change: 15,      // 15%以上の変化で有意な変化  },
                concerning_decline: -10,     // 10%以上の低下で警告;
                excellent_improvement: 25,   // 25%以上の向上で優秀;
                volatility_warning: 30,      // 変動係数30%以上で不安定;
                streak_achievement: 7        // 7日連続で実績 
 };
            // パターン検出設定
            patterns: { min_data_points: 5,
                trend_consistency: 0.7  ,
                cycle_detection_window: 14,
    outlier_threshold: 2.5 
};
            // 推奨事項生成設定
            recommendations: { max_recommendations: 5,
                action_confidence_threshold: 0.6  ,
    priority_scoring_weights: { impact: 0.4  ,
                    urgency: 0.3,
    feasibility: 0.3 
    })
        // 洞察テンプレート
        this.insightTemplates = this.initializeInsightTemplates();
    }
    
    /**
     * メインの洞察生成メソッド
     */
    generate(statisticsData: StatisticsData, options: Partial<InsightConfig> = { ): InsightResult { }
        const config = { ...this.insightConfigs, ...options,
        
        if (!statisticsData || Object.keys(statisticsData).length === 0) { return this.createEmptyInsights();
        const insights = [];
        
        // 各カテゴリの分析
        insights.push(...this.analyzeBasicStatistics(statisticsData.basic);
        insights.push(...this.analyzeBubblePerformance(statisticsData.bubbles);
        insights.push(...this.analyzeComboPerformance(statisticsData.combos);
        insights.push(...this.analyzeHealthManagement(statisticsData.health);
        insights.push(...this.analyzePlayStyle(statisticsData.playstyle);
        insights.push(...this.analyzeTimePatterns(statisticsData.timeStats);
        insights.push(...this.analyzeProgress(statisticsData.progress);
        
        // 時系列データがある場合の追加分析
        if (statisticsData.timeSeries && statisticsData.timeSeries.available) { insights.push(...this.analyzeTimeSeriesInsights(statisticsData.timeSeries);
        // クロス分析（複数指標の関連性）
        insights.push(...this.performCrossAnalysis(statisticsData);
        
        // 洞察のフィルタリングと優先順位付け
        const filteredInsights = this.filterAndPrioritizeInsights(insights, config);
        
        // 推奨事項の生成
        const recommendations = this.generateRecommendations(filteredInsights, statisticsData);
        
        // 要約の生成
        const summary = this.generateInsightSummary(filteredInsights);
        
        return { generationId: this.generateInsightId(
            timestamp: Date.now(),
            dataSource: this.identifyDataSource(statisticsData),
            // 洞察結果
            insights: filteredInsights,
            recommendations: recommendations,
            summary: summary,
            // メタデータ
            metadata: {
                totalInsights: filteredInsights.length ,
                criticalInsights: filteredInsights.filter(i => i.priority === this.priorityLevels.CRITICAL).length,
                dataQuality: this.assessDataQuality(statisticsData) ,
                analysisConfidence: this.calculateAnalysisConfidence(statisticsData, filteredInsights); }
        }
    
    /**
     * 基本統計の分析
     */
    private analyzeBasicStatistics(basicStats: any): Insight[] { const insights: Insight[] = [],
        
        if (!basicStats) return insights;
        
        // プレイ頻度の分析
        if (basicStats.totalGamesPlayed > 0) {

            if (basicStats.averageSessionLength > 600000) { // 10分以上
                insights.push(this.createInsight();
                    this.insightTypes.PERFORMANCE,') }'

                    'Long Session Player')' }'

                    `あなたは集中力が高く、平均${this.formatTime(basicStats.averageSessionLength'}'の長いセッションでプレイしています。`;

                    this.priorityLevels.INFORMATIONAL;
                    { metric: 'session_length', value: basicStats.averageSessionLength  }
                ';'
            }
            ';'
            // 完了率の分析
            if (basicStats.completionRate > 80) {
                insights.push(this.createInsight()';'
                    this.insightTypes.ACHIEVEMENT,') }'

                    'High Completion Rate')' }'

                    `完了率${basicStats.completionRate.toFixed(1'}'%は優秀です！ゲームの理解度が高いことを示しています。`;

                    this.priorityLevels.MEDIUM;
                    { metric: 'completion_rate', value: basicStats.completionRate  }

                ';} else if (basicStats.completionRate < 40) { insights.push(this.createInsight()'
                    this.insightTypes.WARNING,')';
                    'Low Completion Rate')' }'

                    `完了率${basicStats.completionRate.toFixed(1'}'%が低めです。難易度調整や戦略見直しを検討してみてください。`;

                    this.priorityLevels.HIGH;
                    { metric: 'completion_rate', value: basicStats.completionRate  }
                );
            }
        return insights;
    }
    
    /**
     * バブル関連パフォーマンスの分析
     */
    private analyzeBubblePerformance(bubbleStats: any): Insight[] { const insights: Insight[] = [],
        
        if (!bubbleStats) return insights,
        
        // 精度の分析
        const accuracy = parseFloat(bubbleStats.accuracy);
        if (accuracy > 85) {
            insights.push(this.createInsight()','
                this.insightTypes.ACHIEVEMENT,') }'

                'Excellent Accuracy')' }'

                `バブル精度${accuracy.toFixed(1'}'%は非常に優秀です！正確な判断力と集中力を持っています。,

                this.priorityLevels.MEDIUM,
                { metric: 'accuracy', value: accuracy,

            ';} else if (accuracy < 60) { insights.push(this.createInsight()'
                this.insightTypes.OPPORTUNITY,'),
                'Accuracy Improvement Opportunity')' }'

                `バブル精度${accuracy.toFixed(1'}'%に改善の余地があります。落ち着いてタイミングを見極めることで向上できます。,

                this.priorityLevels.HIGH,
                { metric: 'accuracy', value: accuracy,
            );
        }
        
        // 反応時間の分析
        const reactionTime = parseFloat(bubbleStats.averageReactionTime);
        if (reactionTime < 300) {
            insights.push(this.createInsight()','
                this.insightTypes.ACHIEVEMENT,') }'

                'Lightning Fast Reflexes')' }'

                `平均反応時間${reactionTime.toFixed(0'}'msは非常に速いです！優れた反射神経を持っています。,

                this.priorityLevels.MEDIUM,
                { metric: 'reaction_time', value: reactionTime,

            ';} else if (reactionTime > 800) { insights.push(this.createInsight()'
                this.insightTypes.OPPORTUNITY,'),
                'Reaction Time Improvement')' }'

                `反応時間${reactionTime.toFixed(0'}'msをもう少し短縮できれば、さらに高いスコアが期待できます。,

                this.priorityLevels.MEDIUM,
                { metric: 'reaction_time', value: reactionTime,
            );
        }
        
        // 効率統計の分析
        if (bubbleStats.efficiencyStats) {
            const efficiency = bubbleStats.efficiencyStats.bubblesPerMinute,
            if (efficiency > 50) {
                insights.push(this.createInsight()','
                    this.insightTypes.PERFORMANCE,') }'

                    'High Efficiency Player')' }'

                    `毎分${efficiency.toFixed(1'}'個のバブル処理は高効率です。安定したペースを維持できています。,

                    this.priorityLevels.INFORMATIONAL,
                    { metric: 'efficiency', value: efficiency,
                ';'
            }
        ';'
        // お気に入りバブルタイプの分析
        if (bubbleStats.favoriteType) {
            const favType = bubbleStats.favoriteType.type,
            insights.push(this.createInsight(','
                this.insightTypes.PATTERN }

                'Bubble Type Preference'
            }''
                `${favType}バブルを最も多く処理しています。特定タイプへの適応力が高いようです。`,')'
                this.priorityLevels.INFORMATIONAL'';
                { metric: 'favorite_bubble', value: favType );
        return insights;
    }
    
    /**
     * コンボパフォーマンスの分析
     */
    private analyzeComboPerformance(comboStats: any): Insight[] { const insights: Insight[] = [],
        
        if (!comboStats) return insights,
        ','
        // 最高コンボの分析
        if (comboStats.highestCombo > 20) {
            insights.push(this.createInsight(','
                this.insightTypes.ACHIEVEMENT }

                'Combo Master'
            }''
                `最高コンボ${comboStats.highestCombo}は素晴らしい集中力の証です！`,')'
                this.priorityLevels.MEDIUM'';
                { metric: 'highest_combo', value: comboStats.highestCombo '','
            }

        } else if (comboStats.highestCombo < 5) { insights.push(this.createInsight('
                this.insightTypes.OPPORTUNITY,','
                'Combo Building Opportunity')','
                `コンボ継続に注力することで、より高いスコアが期待できます。,')',
                this.priorityLevels.HIGH',
                { metric: 'highest_combo', value: comboStats.highestCombo );
        // コンボ成功率の分析
        const successRate = parseFloat(comboStats.comboSuccessRate);
        if (successRate > 80) {
            insights.push(this.createInsight()','
                this.insightTypes.PERFORMANCE,') }'

                'Consistent Combo Performance')' }'

                `コンボ成功率${successRate.toFixed(1'}'%は安定した技術力を示しています。,

                this.priorityLevels.MEDIUM,
                { metric: 'combo_success_rate', value: successRate,
            );
        }
        
        return insights;
    }
    
    /**
     * 健康管理の分析
     */
    private analyzeHealthManagement(healthStats: any): Insight[] { const insights: Insight[] = [],
        
        if (!healthStats) return insights,
        
        // 生存率の分析
        const survivalRate = parseFloat(healthStats.survivalRate);
        if (survivalRate > 90) {
            insights.push(this.createInsight()','
                this.insightTypes.ACHIEVEMENT,') }'

                'Excellent Survival Skills')' }'

                `生存率${survivalRate.toFixed(1'}'%は優れた危機管理能力を示しています。,

                this.priorityLevels.MEDIUM,
                { metric: 'survival_rate', value: survivalRate,

            ';} else if (survivalRate < 50) { insights.push(this.createInsight()'
                this.insightTypes.WARNING,'),
                'Health Management Needed')' }'

                `生存率${survivalRate.toFixed(1'}'%が低いです。防御的な戦略を検討してみてください。,

                this.priorityLevels.HIGH,
                { metric: 'survival_rate', value: survivalRate,
            ';'
        }
        ';'
        // 復活回数の分析
        if (healthStats.timesRevived > 10) { insights.push(this.createInsight(','
                this.insightTypes.OPPORTUNITY,','
                'Resilience Indicator')','
                `復活回数が多いです。諦めない精神力がありますが、予防策も重要です。,')',
                this.priorityLevels.MEDIUM',
                { metric: 'times_revived', value: healthStats.timesRevived  }
            ); }
        return insights;
    }
    
    /**
     * プレイスタイルの分析
     */
    private analyzePlayStyle(playstyleStats: any): Insight[] { const insights: Insight[] = [],
        
        if (!playstyleStats) return insights,
        ','
        // パーフェクトゲーム分析
        if (playstyleStats.perfectGames > 0) {
            insights.push(this.createInsight(','
                this.insightTypes.ACHIEVEMENT }

                'Perfectionist'
            }''
                `${playstyleStats.perfectGames}回のパーフェクトゲーム達成は素晴らしい技術力です！`,')'
                this.priorityLevels.MEDIUM'';
                { metric: 'perfect_games', value: playstyleStats.perfectGames '
            }
        ';'
        // クリック効率の分析
        if (playstyleStats.clicksPerMinute > 100) {
            insights.push(this.createInsight(','
                this.insightTypes.PATTERN }

                'High Activity Player'
            }''
                `毎分${playstyleStats.clicksPerMinute}回のクリックは積極的なプレイスタイルです。`,')'
                this.priorityLevels.INFORMATIONAL'';
                { metric: 'clicks_per_minute', value: playstyleStats.clicksPerMinute '
            }
        ';'
        // ドラッグ操作分析
        if (playstyleStats.dragOperations > 0) { insights.push(this.createInsight(','
                this.insightTypes.PATTERN,','
                'Strategic Player')','
                `ドラッグ操作を活用する戦略的なプレイスタイルです。,')',
                this.priorityLevels.INFORMATIONAL',
                { metric: 'drag_operations', value: playstyleStats.dragOperations  }
            ); }
        return insights;
    }
    
    /**
     * 時間パターンの分析
     */
    private analyzeTimePatterns(timeStats: any): Insight[] { const insights: Insight[] = [],
        
        if (!timeStats || !timeStats.peakPlayingTimes) return insights,
        
        const peakHour = timeStats.peakPlayingTimes.peakHour,
        const peakDay = timeStats.peakPlayingTimes.peakDay,
        ','
        // ピーク時間の分析
        if (peakHour.hour >= 6 && peakHour.hour <= 9) {
            insights.push(this.createInsight(','
                this.insightTypes.PATTERN }

                'Morning Player'
            }''
                `朝の時間帯（${peakHour.name}）にプレイすることが多いです。集中力が高い時間を活用していますね。`,')'
                this.priorityLevels.INFORMATIONAL'';
                { metric: 'peak_hour', value: peakHour.hour '','
            }

        } else if (peakHour.hour >= 22 || peakHour.hour <= 2) { insights.push(this.createInsight('
                this.insightTypes.PATTERN,
                'Night Owl Player'
            }''
                `夜遅い時間（${peakHour.name}）にプレイすることが多いです。`,')'
                this.priorityLevels.INFORMATIONAL'';
                { metric: 'peak_hour', value: peakHour.hour '
            }
        ';'
        // 曜日パターンの分析
        if (peakDay.day === 0 || peakDay.day === 6) {
            // 日曜日または土曜日
            insights.push(this.createInsight(
                this.insightTypes.PATTERN }

                'Weekend Player'
            }''
                `週末（${peakDay.name}）にプレイすることが多いです。リラックス時間を楽しんでいますね。`,')'
                this.priorityLevels.INFORMATIONAL'';
                { metric: 'peak_day', value: peakDay.day );
        return insights;
    }
    
    /**
     * 進歩の分析
     */
    private analyzeProgress(progressStats: any): Insight[] { const insights: Insight[] = [],
        
        if (!progressStats) return insights,
        
        // AP効率の分析
        const efficiency = parseFloat(progressStats.efficiency);
        if (efficiency > 100) {
            insights.push(this.createInsight(','
                this.insightTypes.PERFORMANCE }

                'High AP Efficiency'
            }''
                `APあたり${efficiency}点のスコア効率は優秀です。効率的なプレイができています。`,')'
                this.priorityLevels.MEDIUM'';
                { metric: 'ap_efficiency', value: efficiency '
            }
        ';'
        // 実績解除数の分析
        if (progressStats.achievementsUnlocked > 10) {
            insights.push(this.createInsight(','
                this.insightTypes.ACHIEVEMENT }

                'Achievement Hunter'
            }''
                `${progressStats.achievementsUnlocked}個の実績解除は素晴らしい探求心の表れです！`,')'
                this.priorityLevels.MEDIUM'';
                { metric: 'achievements_unlocked', value: progressStats.achievementsUnlocked );
        return insights;
    }
    
    /**
     * 時系列洞察の分析
     */
    private analyzeTimeSeriesInsights(timeSeriesData: any): Insight[] { const insights: Insight[] = [],

        if(!timeSeriesData.growthTrends) return insights,
        
        // スコアトレンドの分析
        const scoreTrend = timeSeriesData.growthTrends.score,
        if (scoreTrend && scoreTrend.overall.trend === 'improving') {
            insights.push(this.createInsight(','
                this.insightTypes.TREND,','
                'Improving Performance')','
                `スコアが継続的に向上しています。成長が見られる素晴らしいトレンドです！,')',
                this.priorityLevels.HIGH',
                { metric: 'score_trend', value: scoreTrend.overall.changePercent '}'

            '); }'

        } else if (scoreTrend && scoreTrend.overall.trend === 'declining') { insights.push(this.createInsight('
                this.insightTypes.WARNING,','
                'Performance Decline')','
                `最近スコアが低下傾向にあります。休息や戦略見直しを検討してみてください。,')',
                this.priorityLevels.HIGH',
                { metric: 'score_trend', value: scoreTrend.overall.changePercent '''
            '}'
        // 効率トレンドの分析
        const efficiencyTrend = timeSeriesData.growthTrends.efficiency;
        if (efficiencyTrend && efficiencyTrend.overall.trend === 'improving') { insights.push(this.createInsight(','
                this.insightTypes.TREND,','
                'Efficiency Growth')','
                `プレイ効率が向上しています。技術の上達が見られます。,')',
                this.priorityLevels.MEDIUM',
                { metric: 'efficiency_trend', value: efficiencyTrend.overall.changePercent  }
            ); }
        return insights;
    }
    
    /**
     * クロス分析（複数指標の関連性）
     */
    private performCrossAnalysis(statisticsData: StatisticsData): Insight[] { const insights: Insight[] = [],
        
        // 精度とスコアの関係分析
        if (statisticsData.bubbles && statisticsData.basic) {
            const accuracy = parseFloat(statisticsData.bubbles.accuracy);
            const avgScore = statisticsData.basic.averageScore,

            if (accuracy > 80 && avgScore > 5000) {
                insights.push(this.createInsight(','
                    this.insightTypes.PATTERN,','
                    'Accuracy-Score Correlation')','
                    `高い精度と高スコアが連動しています。安定した技術力を持っています。,')',
                    this.priorityLevels.MEDIUM',
                    { metrics: ['accuracy', 'average_score'], correlation: 'positive'
            }
                ); }
        }
        
        // セッション長とパフォーマンスの関係
        if (statisticsData.basic && statisticsData.session) { const sessionLength = statisticsData.basic.averageSessionLength,
            const sessionAvgScore = statisticsData.session.averageScoreThisSession,

            if (sessionLength > 300000 && sessionAvgScore > 3000) { // 5分以上のセッション
                insights.push(this.createInsight(
                    this.insightTypes.PATTERN)','
                    'Endurance Performance')','
                    `長時間プレイでも高いパフォーマンスを維持できています。集中力に優れています。,')',
                    this.priorityLevels.MEDIUM',
                    { metrics: ['session_length', 'session_score'], pattern: 'endurance'
            }
                ); }
        }
        
        return insights;
    }
    
    /**
     * 推奨事項の生成
     */
    private generateRecommendations(insights: Insight[], statisticsData: StatisticsData): Recommendation[] { const recommendations: Recommendation[] = [],
        
        // 洞察から推奨事項を導出
        insights.forEach(insight => { )
            if (insight.type === this.insightTypes.OPPORTUNITY || ),
                insight.type === this.insightTypes.WARNING) {
                
                const recommendation = this.createRecommendationFromInsight(insight, statisticsData);
                if (recommendation) { }
                    recommendations.push(recommendation); }
};
        
        // 一般的な推奨事項
        if (statisticsData.bubbles && parseFloat(statisticsData.bubbles.accuracy) < 70) { recommendations.push({);
                id: this.generateRecommendationId(',
    type: 'skill_improvement,
                title: '精度向上のための練習,
                description: '短時間の集中練習セッションで精度を向上させましょう。,
                actionItems: [','
                    '5分間の精度重視プレイ,
                    '特定バブルタイプに特化した練習',]','
                    '反応時間の測定と改善']);
                ]','
                priority: this.priorityLevels.HIGH,
                estimatedImpact: 'medium,
                timeToImplement: 'short'
            }
        }
        
        return recommendations.slice(0, this.insightConfigs.recommendations.max_recommendations);
    }
    
    /**
     * ヘルパーメソッド群
     */
    private createInsight(type: string, title: string, description: string, priority: string, context: Record<string, any> = { ): Insight {
        return { id: this.generateInsightId(
            type: type,
            title: title,
            description: description,
            priority: priority,
            timestamp: Date.now(
    context: context,
            confidence: this.calculateInsightConfidence(context) }

    private createRecommendationFromInsight(insight: Insight, statisticsData: StatisticsData): Recommendation | null { // 簡略化された実装
        if(insight.context.metric === 'accuracy' && insight.context.value < 60' {'
            return { ''
                id: this.generateRecommendationId(',
    type: 'accuracy_improvement,
                title: '精度向上のための集中練習,
                description: '短時間の練習で精度を改善しましょう。,
                actionItems: ['ゆっくりと正確にクリック', '画面の中央に集中],'
                priority: insight.priority }

                estimatedImpact: 'high',' };'

                timeToImplement: 'short' });
        return null;
    }
    );
    private filterAndPrioritizeInsights(insights: Insight[], config: InsightConfig): Insight[] { // 重複除去と優先順位付け
        const filtered = insights,
            .filter(insight => insight.confidence > 0.5);
            .sort((a, b) => { 
                const priorityOrder = {
                    [this.priorityLevels.CRITICAL]: 5,
                    [this.priorityLevels.HIGH]: 4,
                    [this.priorityLevels.MEDIUM]: 3,
                    [this.priorityLevels.LOW]: 2 }
                    [this.priorityLevels.INFORMATIONAL]: 1 
    };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            };
        
        return filtered.slice(0, 20); // 最大20個の洞察
    }
    
    private generateInsightSummary(insights: Insight[]): any {
        const categories = {};
        const priorities = {};
        
        insights.forEach(insight => {  );
            categories[insight.type] = (categories[insight.type] || 0) + 1 }
            priorities[insight.priority] = (priorities[insight.priority] || 0) + 1; }
        };
        
        return { totalInsights: insights.length,
            byCategory: categories,
            byPriority: priorities,
    topInsight: insights[0] || null ,
            keyTakeaways: this.extractKeyTakeaways(insights); 
    }
    
    private extractKeyTakeaways(insights: Insight[]): string[] { // 上位3つの重要な洞察をキーテイクアウェイとして抽出
        return insights,
            .filter(insight => );
                insight.priority === this.priorityLevels.CRITICAL || ),
                insight.priority === this.priorityLevels.HIGH),
            .slice(0, 3);
            .map(insight => insight.description);
    private formatTime(milliseconds: number): string { const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        return `${minutes}分${seconds}秒`;
    }
    
    private calculateInsightConfidence(context: Record<string, any>): number { // 簡易的な信頼度計算
        return 0.8 }
    private generateInsightId(): string {
        return `insight_${Date.now())_${Math.random().toString(36).substr(2, 9}`;
    }
    
    private generateRecommendationId(): string {
        return `rec_${Date.now())_${Math.random().toString(36).substr(2, 9}`;
    }

    private identifyDataSource(statisticsData: StatisticsData): string { ''
        return 'bubble_pop_game' }
    private assessDataQuality(statisticsData: StatisticsData): any {
        return { score: 0.9, issues: []  }
    private calculateAnalysisConfidence(statisticsData: StatisticsData, insights: Insight[]): number { return 0.85 }
    private createEmptyInsights(): InsightResult { return { insights: [] ,
            recommendations: [] }
            summary: { totalInsights: 0 ,
            metadata: { totalInsights: 0 
}

    private initializeInsightTemplates();