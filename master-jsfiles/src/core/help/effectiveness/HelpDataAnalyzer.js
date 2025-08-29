/**
 * HelpDataAnalyzer
 * 統計分析、トレンド分析、効果性スコア計算を担当
 */
export class HelpDataAnalyzer {
    constructor(helpEffectivenessAnalyzer) {
        this.helpEffectivenessAnalyzer = helpEffectivenessAnalyzer;
        this.gameEngine = helpEffectivenessAnalyzer.gameEngine;
        this.loggingSystem = helpEffectivenessAnalyzer.loggingSystem;
        
        // 分析設定
        this.config = {
            effectivenessThreshold: 0.7,  // 効果性判定閾値（70%）
            trendAnalysisPeriod: 30,      // トレンド分析期間（日）
            improvementThreshold: 0.1     // 改善提案閾値（10%）
        };
        
        // 分析結果キャッシュ
        this.analysisCache = new Map();
        this.lastAnalysisTime = 0;
        
        console.log('[HelpDataAnalyzer] Component initialized');
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
            this.loggingSystem.error('HelpDataAnalyzer', 'Failed to calculate effectiveness score', error);
            return { overall: 0, breakdown: {}, classification: 'insufficient_data' };
        }
    }
    
    /**
     * 使用率スコア計算
     * @param {Object} usageAnalysis - 使用率分析結果
     * @returns {number} 使用率スコア (0-1)
     */
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
    
    /**
     * エンゲージメントスコア計算
     * @param {Object} engagementAnalysis - エンゲージメント分析結果
     * @returns {number} エンゲージメントスコア (0-1)
     */
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
    
    /**
     * 満足度スコア計算
     * @param {Object} satisfactionAnalysis - 満足度分析結果
     * @returns {number} 満足度スコア (0-1)
     */
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
    
    /**
     * 効果性の分類
     * @param {number} score - 効果性スコア
     * @returns {string} 分類結果
     */
    classifyEffectiveness(score) {
        if (score >= 0.8) return 'excellent';
        if (score >= 0.6) return 'good';
        if (score >= 0.4) return 'fair';
        if (score >= 0.2) return 'poor';
        return 'critical';
    }
    
    /**
     * ベンチマーク比較
     * @param {number} score - 効果性スコア
     * @returns {Object} ベンチマーク比較結果
     */
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
            this.loggingSystem.error('HelpDataAnalyzer', 'Failed to analyze trends', error);
            return null;
        }
    }
    
    /**
     * 使用率トレンドの計算
     * @param {Array} sessions - セッションデータ
     * @returns {Object} 使用率トレンド
     */
    calculateUsageTrends(sessions) {
        if (!sessions || sessions.length === 0) return {};
        
        const trends = {
            sessionGrowth: this.calculateSessionGrowthTrend(sessions),
            durationTrend: this.calculateDurationTrend(sessions),
            searchTrend: this.calculateSearchTrend(sessions)
        };
        
        return trends;
    }
    
    /**
     * 満足度トレンドの計算
     * @param {Array} interactions - インタラクションデータ
     * @returns {Object} 満足度トレンド
     */
    calculateSatisfactionTrends(interactions) {
        if (!interactions || interactions.length === 0) return {};
        
        const trends = {
            ratingTrend: this.calculateRatingTrend(interactions),
            helpfulnessTrend: this.calculateHelpfulnessTrend(interactions),
            feedbackVolumeTrend: this.calculateFeedbackVolumeTrend(interactions)
        };
        
        return trends;
    }
    
    /**
     * コンテンツトレンドの計算
     * @param {Array} sessions - セッションデータ
     * @returns {Object} コンテンツトレンド
     */
    calculateContentTrends(sessions) {
        if (!sessions || sessions.length === 0) return {};
        
        const trends = {
            popularityTrend: this.calculateContentPopularityTrend(sessions),
            accessPatternTrend: this.calculateAccessPatternTrend(sessions),
            completionTrend: this.calculateCompletionTrend(sessions)
        };
        
        return trends;
    }
    
    /**
     * トレンド予測の生成
     * @param {Object} rawData - 生データ
     * @returns {Object} トレンド予測
     */
    generateTrendPredictions(rawData) {
        try {
            const predictions = {
                usagePrediction: this.predictUsageTrend(rawData.sessions),
                satisfactionPrediction: this.predictSatisfactionTrend(rawData.interactions),
                riskAssessment: this.assessTrendRisks(rawData)
            };
            
            return predictions;
            
        } catch (error) {
            this.loggingSystem.error('HelpDataAnalyzer', 'Failed to generate trend predictions', error);
            return {};
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
            this.loggingSystem.error('HelpDataAnalyzer', 'Failed to generate recommendations', error);
            return [];
        }
    }
    
    /**
     * 使用率に関する改善提案
     * @param {Object} usage - 使用率分析結果
     * @returns {Array} 使用率改善提案
     */
    generateUsageRecommendations(usage) {
        const recommendations = [];
        
        if (!usage.summary) return recommendations;
        
        if (usage.summary.averageSessionDuration < 120) {
            recommendations.push({
                type: 'usage_improvement',
                category: 'session_duration',
                priority: 'high',
                title: 'セッション時間の改善',
                description: 'ユーザーのセッション時間が短いため、コンテンツの魅力度向上が必要です',
                actions: [
                    'より詳細で実用的なコンテンツの追加',
                    'インタラクティブな要素の導入',
                    'ユーザーの興味を引く関連コンテンツの表示'
                ],
                expectedImpact: 'medium'
            });
        }
        
        if (usage.summary.searchUsageRate < 0.3) {
            recommendations.push({
                type: 'usage_improvement',
                category: 'search_usage',
                priority: 'medium',
                title: '検索機能の改善',
                description: '検索機能の利用率が低いため、検索体験の向上が必要です',
                actions: [
                    '検索機能の視認性向上',
                    '検索サジェスト機能の追加',
                    '検索結果の関連性向上'
                ],
                expectedImpact: 'medium'
            });
        }
        
        return recommendations;
    }
    
    /**
     * エンゲージメントに関する改善提案
     * @param {Object} engagement - エンゲージメント分析結果
     * @returns {Array} エンゲージメント改善提案
     */
    generateEngagementRecommendations(engagement) {
        const recommendations = [];
        
        if (!engagement.summary) return recommendations;
        
        if (engagement.summary.interactionRate < 0.5) {
            recommendations.push({
                type: 'engagement_improvement',
                category: 'interaction',
                priority: 'high',
                title: 'ユーザーインタラクションの促進',
                description: 'ユーザーのインタラクション率が低いため、参加促進施策が必要です',
                actions: [
                    'フィードバック機能の改善',
                    'コメント・評価機能の追加',
                    'ソーシャル要素の導入'
                ],
                expectedImpact: 'high'
            });
        }
        
        return recommendations;
    }
    
    /**
     * 満足度に関する改善提案
     * @param {Object} satisfaction - 満足度分析結果
     * @returns {Array} 満足度改善提案
     */
    generateSatisfactionRecommendations(satisfaction) {
        const recommendations = [];
        
        if (!satisfaction.summary) return recommendations;
        
        if (satisfaction.summary.averageRating < 4.0) {
            recommendations.push({
                type: 'satisfaction_improvement',
                category: 'content_quality',
                priority: 'high',
                title: 'コンテンツ品質の向上',
                description: 'ユーザー評価が低いため、コンテンツ品質の改善が急務です',
                actions: [
                    '低評価コンテンツの見直し',
                    'ユーザーフィードバックの詳細分析',
                    '専門家によるコンテンツレビュー'
                ],
                expectedImpact: 'high'
            });
        }
        
        return recommendations;
    }
    
    /**
     * 総合的な改善提案
     * @param {Object} effectivenessScore - 効果性スコア
     * @returns {Array} 総合改善提案
     */
    generateOverallRecommendations(effectivenessScore) {
        const recommendations = [];
        
        if (!effectivenessScore) return recommendations;
        
        if (effectivenessScore.overall < this.config.effectivenessThreshold) {
            recommendations.push({
                type: 'overall_improvement',
                category: 'comprehensive',
                priority: 'high',
                title: '包括的ヘルプシステム改善',
                description: `総合効果性スコア（${(effectivenessScore.overall * 100).toFixed(1)}%）が目標値を下回っています`,
                actions: [
                    'ユーザー体験の全面的見直し',
                    'データ分析に基づく改善計画の策定',
                    '段階的改善の実施とモニタリング'
                ],
                expectedImpact: 'high'
            });
        }
        
        return recommendations;
    }
    
    // ========== トレンド計算ヘルパーメソッド ==========
    
    calculateSessionGrowthTrend(sessions) {
        // セッション数の成長トレンドを計算
        return { trend: 'stable', rate: 0 };
    }
    
    calculateDurationTrend(sessions) {
        // セッション時間のトレンドを計算
        return { trend: 'stable', change: 0 };
    }
    
    calculateSearchTrend(sessions) {
        // 検索利用トレンドを計算
        return { trend: 'stable', change: 0 };
    }
    
    calculateRatingTrend(interactions) {
        // 評価トレンドを計算
        return { trend: 'stable', change: 0 };
    }
    
    calculateHelpfulnessTrend(interactions) {
        // 有用性トレンドを計算
        return { trend: 'stable', change: 0 };
    }
    
    calculateFeedbackVolumeTrend(interactions) {
        // フィードバック量トレンドを計算
        return { trend: 'stable', change: 0 };
    }
    
    calculateContentPopularityTrend(sessions) {
        // コンテンツ人気度トレンドを計算
        return { trend: 'stable', changes: {} };
    }
    
    calculateAccessPatternTrend(sessions) {
        // アクセスパターントレンドを計算
        return { trend: 'stable', patterns: {} };
    }
    
    calculateCompletionTrend(sessions) {
        // 完了率トレンドを計算
        return { trend: 'stable', rate: 0 };
    }
    
    predictUsageTrend(sessions) {
        // 使用率予測
        return { prediction: 'stable', confidence: 0.7 };
    }
    
    predictSatisfactionTrend(interactions) {
        // 満足度予測
        return { prediction: 'stable', confidence: 0.7 };
    }
    
    assessTrendRisks(rawData) {
        // トレンドリスク評価
        return { level: 'low', factors: [] };
    }
    
    /**
     * 分析統計の取得
     * @returns {Object} 分析統計
     */
    getAnalysisStats() {
        return {
            cacheSize: this.analysisCache.size,
            lastAnalysisTime: this.lastAnalysisTime,
            config: { ...this.config }
        };
    }
    
    /**
     * コンポーネントクリーンアップ
     */
    destroy() {
        this.analysisCache.clear();
        this.lastAnalysisTime = 0;
        
        console.log('[HelpDataAnalyzer] Component destroyed');
    }
}