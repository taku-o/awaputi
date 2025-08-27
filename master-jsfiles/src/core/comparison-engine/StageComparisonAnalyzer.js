/**
 * StageComparisonAnalyzer - ステージ特化比較分析
 * 
 * ComparisonEngineから分離されたステージ特化比較専用コンポーネント
 * - ステージ別パフォーマンス比較
 * - 難易度調整済みメトリクス計算
 * - ステージ統計分析
 * - 個別ステージ比較
 */

export class StageComparisonAnalyzer {
    constructor(statisticalAnalyzer) {
        this.statisticalAnalyzer = statisticalAnalyzer;
        
        // ステージ設定
        this.stageConfig = {
            difficultyLevels: ['easy', 'normal', 'hard', 'expert'],
            performanceMetrics: ['score', 'time', 'accuracy', 'efficiency'],
            minimumPlaysForAnalysis: 3
        };
        
        // 難易度調整係数
        this.difficultyAdjustments = {
            easy: 0.7,
            normal: 1.0,
            hard: 1.3,
            expert: 1.6
        };
    }

    /**
     * ステージパフォーマンス比較を実行
     * @param {object} stageData - ステージデータ
     * @param {object} options - 比較オプション
     * @returns {object} ステージ比較結果
     */
    compareStagePerformance(stageData, options = {}) {
        const results = {
            timestamp: new Date().toISOString(),
            stageSummary: {},
            individualComparisons: {},
            overallTrends: {},
            recommendations: []
        };

        try {
            // 各ステージの統計を計算
            const stageStats = this.calculateStageStatistics(stageData);
            results.stageSummary = stageStats;

            // 個別ステージ比較
            const stageIds = Object.keys(stageData);
            if (stageIds.length >= 2) {
                results.individualComparisons = this.compareIndividualStages(stageData, stageStats);
            }

            // パフォーマンスメトリクス計算
            results.performanceMetrics = this.calculateStagePerformanceMetrics(stageData, stageStats);

            // 難易度調整済みメトリクス
            results.difficultyAdjustedMetrics = this.calculateDifficultyAdjustedMetrics(stageData, stageStats);

            // 全体的なトレンド分析
            results.overallTrends = this.analyzeOverallTrends(stageStats);

            // 推奨事項生成
            results.recommendations = this.generateStageRecommendations(results);

            return results;

        } catch (error) {
            console.error('Error in stage performance comparison:', error);
            return {
                error: error.message,
                timestamp: new Date().toISOString(),
                stageSummary: {},
                individualComparisons: {},
                overallTrends: {},
                recommendations: []
            };
        }
    }

    /**
     * ステージ統計を計算
     * @param {object} stageData - ステージデータ
     * @returns {object} ステージ統計
     */
    calculateStageStatistics(stageData) {
        const statistics = {};

        for (const [stageId, plays] of Object.entries(stageData)) {
            if (!Array.isArray(plays) || plays.length === 0) {
                statistics[stageId] = this.createEmptyStageStats(stageId);
                continue;
            }

            // 各メトリクスの統計計算
            const scoreData = plays.map(play => play.score || 0).filter(s => s > 0);
            const timeData = plays.map(play => play.completionTime || 0).filter(t => t > 0);
            const accuracyData = plays.map(play => play.accuracy || 0).filter(a => a >= 0);

            statistics[stageId] = {
                stageId,
                playCount: plays.length,
                scores: this.statisticalAnalyzer.calculateBasicStatistics(scoreData),
                times: this.statisticalAnalyzer.calculateBasicStatistics(timeData),
                accuracy: this.statisticalAnalyzer.calculateBasicStatistics(accuracyData),
                difficultyLevel: this.getDifficultyLevel(stageId),
                lastPlayed: this.getLastPlayedDate(plays),
                improvementTrend: this.calculateImprovementTrend(plays),
                consistency: this.calculateConsistency(plays),
                performanceRating: this.calculatePerformanceRating(plays)
            };
        }

        return statistics;
    }

    /**
     * ステージパフォーマンスメトリクスを計算
     * @param {object} stageData - ステージデータ
     * @param {object} stageStats - ステージ統計
     * @returns {object} パフォーマンスメトリクス
     */
    calculateStagePerformanceMetrics(stageData, stageStats) {
        const metrics = {};

        for (const [stageId, stats] of Object.entries(stageStats)) {
            if (stats.playCount < this.stageConfig.minimumPlaysForAnalysis) {
                metrics[stageId] = { insufficient_data: true };
                continue;
            }

            const plays = stageData[stageId] || [];
            
            metrics[stageId] = {
                // 効率性メトリクス
                scorePerSecond: this.calculateScorePerSecond(plays),
                accuracyConsistency: this.calculateAccuracyConsistency(plays),
                timeConsistency: this.calculateTimeConsistency(plays),
                
                // 学習・改善メトリクス
                learningRate: this.calculateLearningRate(plays),
                masteryLevel: this.calculateMasteryLevel(plays),
                plateauDetection: this.detectPerformancePlateau(plays),
                
                // 相対的パフォーマンス
                relativePerformance: this.calculateRelativePerformance(stats, stageStats),
                strengthAreas: this.identifyStrengthAreas(stats),
                weaknessAreas: this.identifyWeaknessAreas(stats),
                
                // 時系列分析
                recentTrend: this.analyzeRecentTrend(plays),
                seasonalPatterns: this.detectSeasonalPatterns(plays)
            };
        }

        return metrics;
    }

    /**
     * 難易度調整済みメトリクスを計算
     * @param {object} stageData - ステージデータ
     * @param {object} stageStats - ステージ統計
     * @returns {object} 難易度調整済みメトリクス
     */
    calculateDifficultyAdjustedMetrics(stageData, stageStats) {
        const adjustedMetrics = {};

        for (const [stageId, stats] of Object.entries(stageStats)) {
            const difficultyLevel = stats.difficultyLevel;
            const adjustmentFactor = this.difficultyAdjustments[difficultyLevel] || 1.0;

            adjustedMetrics[stageId] = {
                adjustedScore: stats.scores.mean / adjustmentFactor,
                adjustedTime: stats.times.mean * adjustmentFactor,
                adjustedAccuracy: stats.accuracy.mean,
                difficultyAdjustmentFactor: adjustmentFactor,
                normalizedPerformance: this.calculateNormalizedPerformance(stats, adjustmentFactor),
                skillLevel: this.calculateSkillLevel(stats, adjustmentFactor)
            };
        }

        return adjustedMetrics;
    }

    /**
     * 個別ステージ比較を実行
     * @param {object} stageData - ステージデータ
     * @param {object} stageStats - ステージ統計
     * @returns {object} 個別ステージ比較結果
     */
    compareIndividualStages(stageData, stageStats) {
        const comparisons = {};
        const stageIds = Object.keys(stageStats);

        for (let i = 0; i < stageIds.length; i++) {
            for (let j = i + 1; j < stageIds.length; j++) {
                const stage1Id = stageIds[i];
                const stage2Id = stageIds[j];
                const comparisonKey = `${stage1Id}_vs_${stage2Id}`;

                comparisons[comparisonKey] = this.compareStages(
                    stage1Id, stage2Id, stageData, stageStats
                );
            }
        }

        return comparisons;
    }

    /**
     * 2つのステージを比較
     * @param {string} stage1Id - ステージ1のID
     * @param {string} stage2Id - ステージ2のID
     * @param {object} stageData - ステージデータ
     * @param {object} stageStats - ステージ統計
     * @returns {object} 比較結果
     */
    compareStages(stage1Id, stage2Id, stageData, stageStats) {
        const stage1Stats = stageStats[stage1Id];
        const stage2Stats = stageStats[stage2Id];
        const stage1Plays = stageData[stage1Id] || [];
        const stage2Plays = stageData[stage2Id] || [];

        // スコア比較
        const scoreComparison = this.statisticalAnalyzer.performSignificanceTest(
            stage1Plays.map(p => p.score || 0),
            stage2Plays.map(p => p.score || 0)
        );

        // 時間比較
        const timeComparison = this.statisticalAnalyzer.performSignificanceTest(
            stage1Plays.map(p => p.completionTime || 0),
            stage2Plays.map(p => p.completionTime || 0)
        );

        // 精度比較
        const accuracyComparison = this.statisticalAnalyzer.performSignificanceTest(
            stage1Plays.map(p => p.accuracy || 0),
            stage2Plays.map(p => p.accuracy || 0)
        );

        return {
            stage1: { id: stage1Id, stats: stage1Stats },
            stage2: { id: stage2Id, stats: stage2Stats },
            comparisons: {
                score: scoreComparison,
                time: timeComparison,
                accuracy: accuracyComparison
            },
            summary: this.generateComparisonSummary(stage1Id, stage2Id, {
                score: scoreComparison,
                time: timeComparison,
                accuracy: accuracyComparison
            }),
            recommendations: this.generatePairwiseRecommendations(stage1Id, stage2Id, stage1Stats, stage2Stats)
        };
    }

    /**
     * 全体トレンドを分析
     * @param {object} stageStats - ステージ統計
     * @returns {object} 全体トレンド
     */
    analyzeOverallTrends(stageStats) {
        const stageIds = Object.keys(stageStats);
        
        if (stageIds.length === 0) {
            return { insufficient_data: true };
        }

        // 平均パフォーマンス
        const avgScores = stageIds.map(id => stageStats[id].scores.mean);
        const avgTimes = stageIds.map(id => stageStats[id].times.mean);
        const avgAccuracy = stageIds.map(id => stageStats[id].accuracy.mean);

        return {
            overallPerformance: {
                averageScore: this.statisticalAnalyzer.calculateBasicStatistics(avgScores),
                averageTime: this.statisticalAnalyzer.calculateBasicStatistics(avgTimes),
                averageAccuracy: this.statisticalAnalyzer.calculateBasicStatistics(avgAccuracy)
            },
            consistencyAcrossStages: this.calculateCrossStageConsistency(stageStats),
            strongestStages: this.identifyStrongestStages(stageStats),
            weakestStages: this.identifyWeakestStages(stageStats),
            improvementOpportunities: this.identifyImprovementOpportunities(stageStats),
            masteryProgression: this.analyzeMasteryProgression(stageStats)
        };
    }

    /**
     * ステージ推奨事項を生成
     * @param {object} results - 分析結果
     * @returns {Array} 推奨事項配列
     */
    generateStageRecommendations(results) {
        const recommendations = [];
        const { stageSummary, performanceMetrics, difficultyAdjustedMetrics, overallTrends } = results;

        // 練習不足のステージ
        for (const [stageId, stats] of Object.entries(stageSummary)) {
            if (stats.playCount < this.stageConfig.minimumPlaysForAnalysis) {
                recommendations.push({
                    type: 'practice_more',
                    priority: 'medium',
                    stage: stageId,
                    message: `${stageId}はプレイ回数が少ないです。より多く練習することで正確な分析が可能になります。`
                });
            }
        }

        // 改善が停滞しているステージ
        for (const [stageId, metrics] of Object.entries(performanceMetrics)) {
            if (metrics.plateauDetection?.isOnPlateau) {
                recommendations.push({
                    type: 'break_plateau',
                    priority: 'high',
                    stage: stageId,
                    message: `${stageId}でパフォーマンスが停滞しています。練習方法を変えることを推奨します。`
                });
            }
        }

        // 弱点ステージ
        if (overallTrends.weakestStages) {
            overallTrends.weakestStages.slice(0, 3).forEach(stage => {
                recommendations.push({
                    type: 'focus_weak_areas',
                    priority: 'high',
                    stage: stage.id,
                    message: `${stage.id}は相対的にパフォーマンスが低いです。重点的な練習を推奨します。`
                });
            });
        }

        // 得意ステージの活用
        if (overallTrends.strongestStages) {
            overallTrends.strongestStages.slice(0, 2).forEach(stage => {
                recommendations.push({
                    type: 'leverage_strengths',
                    priority: 'low',
                    stage: stage.id,
                    message: `${stage.id}は得意分野です。この強みを他のステージにも活かしましょう。`
                });
            });
        }

        return recommendations;
    }

    // ヘルパーメソッド群

    createEmptyStageStats(stageId) {
        return {
            stageId,
            playCount: 0,
            scores: this.statisticalAnalyzer.createEmptyStatistics(),
            times: this.statisticalAnalyzer.createEmptyStatistics(),
            accuracy: this.statisticalAnalyzer.createEmptyStatistics(),
            difficultyLevel: 'unknown',
            lastPlayed: null,
            improvementTrend: 'insufficient_data',
            consistency: 0,
            performanceRating: 0
        };
    }

    getDifficultyLevel(stageId) {
        // ステージIDから難易度を推定（実装は要カスタマイズ）
        if (stageId.includes('easy') || stageId.includes('tutorial')) return 'easy';
        if (stageId.includes('hard') || stageId.includes('expert')) return 'hard';
        if (stageId.includes('expert') || stageId.includes('master')) return 'expert';
        return 'normal';
    }

    getLastPlayedDate(plays) {
        if (plays.length === 0) return null;
        const dates = plays.map(p => new Date(p.timestamp || p.date || Date.now()));
        return new Date(Math.max(...dates));
    }

    calculateImprovementTrend(plays) {
        if (plays.length < 3) return 'insufficient_data';
        
        const recentPlays = plays.slice(-Math.min(10, plays.length));
        const scores = recentPlays.map(p => p.score || 0);
        
        // 簡易的な線形回帰でトレンド計算
        const n = scores.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += scores[i];
            sumXY += i * scores[i];
            sumXX += i * i;
        }
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        
        if (slope > 50) return 'improving';
        if (slope < -50) return 'declining';
        return 'stable';
    }

    calculateConsistency(plays) {
        if (plays.length < 2) return 0;
        
        const scores = plays.map(p => p.score || 0);
        const stats = this.statisticalAnalyzer.calculateBasicStatistics(scores);
        
        if (stats.mean === 0) return 0;
        
        // CV (変動係数) の逆数として一貫性を計算
        const cv = stats.standardDeviation / stats.mean;
        return Math.max(0, 1 - cv);
    }

    calculatePerformanceRating(plays) {
        if (plays.length === 0) return 0;
        
        const avgScore = plays.reduce((sum, p) => sum + (p.score || 0), 0) / plays.length;
        const avgTime = plays.reduce((sum, p) => sum + (p.completionTime || 0), 0) / plays.length;
        const avgAccuracy = plays.reduce((sum, p) => sum + (p.accuracy || 0), 0) / plays.length;
        
        // 正規化された総合評価（0-100）
        const scoreComponent = Math.min(100, avgScore / 1000 * 100);
        const timeComponent = avgTime > 0 ? Math.max(0, 100 - avgTime / 300 * 100) : 0;
        const accuracyComponent = avgAccuracy * 100;
        
        return (scoreComponent * 0.4 + timeComponent * 0.3 + accuracyComponent * 0.3);
    }

    calculateScorePerSecond(plays) {
        const validPlays = plays.filter(p => p.score > 0 && p.completionTime > 0);
        if (validPlays.length === 0) return 0;
        
        const efficiency = validPlays.map(p => p.score / p.completionTime);
        return this.statisticalAnalyzer.calculateBasicStatistics(efficiency);
    }

    calculateAccuracyConsistency(plays) {
        const accuracyData = plays.map(p => p.accuracy || 0);
        const stats = this.statisticalAnalyzer.calculateBasicStatistics(accuracyData);
        return 1 - (stats.standardDeviation / 100); // 正規化された一貫性
    }

    calculateTimeConsistency(plays) {
        const timeData = plays.map(p => p.completionTime || 0).filter(t => t > 0);
        if (timeData.length === 0) return 0;
        
        const stats = this.statisticalAnalyzer.calculateBasicStatistics(timeData);
        const cv = stats.mean > 0 ? stats.standardDeviation / stats.mean : 1;
        return Math.max(0, 1 - cv);
    }

    calculateLearningRate(plays) {
        if (plays.length < 3) return 0;
        
        const scores = plays.map(p => p.score || 0);
        const improvements = [];
        
        for (let i = 1; i < scores.length; i++) {
            improvements.push(scores[i] - scores[i-1]);
        }
        
        return this.statisticalAnalyzer.calculateBasicStatistics(improvements).mean;
    }

    calculateMasteryLevel(plays) {
        if (plays.length === 0) return 0;
        
        const recentPlays = plays.slice(-5); // 最新5プレイ
        const avgAccuracy = recentPlays.reduce((sum, p) => sum + (p.accuracy || 0), 0) / recentPlays.length;
        const consistency = this.calculateConsistency(recentPlays);
        
        return (avgAccuracy + consistency) / 2;
    }

    detectPerformancePlateau(plays) {
        if (plays.length < 10) return { isOnPlateau: false, confidence: 0 };
        
        const recent = plays.slice(-10);
        const scores = recent.map(p => p.score || 0);
        const stats = this.statisticalAnalyzer.calculateBasicStatistics(scores);
        
        // 変動係数が小さく、改善トレンドがない場合は停滞と判定
        const cv = stats.mean > 0 ? stats.standardDeviation / stats.mean : 0;
        const isLowVariation = cv < 0.1;
        const trend = this.calculateImprovementTrend(recent);
        
        return {
            isOnPlateau: isLowVariation && trend === 'stable',
            confidence: isLowVariation ? 0.8 : 0.3,
            variationCoefficient: cv,
            trend
        };
    }

    calculateRelativePerformance(stageStats, allStageStats) {
        const allStages = Object.values(allStageStats);
        const avgScores = allStages.map(s => s.scores.mean);
        const overallAvg = avgScores.reduce((sum, score) => sum + score, 0) / avgScores.length;
        
        return {
            relativeScore: overallAvg > 0 ? stageStats.scores.mean / overallAvg : 0,
            percentileRank: this.calculatePercentileRank(stageStats.scores.mean, avgScores)
        };
    }

    calculatePercentileRank(value, allValues) {
        const sortedValues = allValues.sort((a, b) => a - b);
        const rank = sortedValues.filter(v => v <= value).length;
        return (rank / sortedValues.length) * 100;
    }

    identifyStrengthAreas(stats) {
        const strengths = [];
        
        if (stats.scores.mean > 5000) strengths.push('高スコア');
        if (stats.accuracy.mean > 0.9) strengths.push('高精度');
        if (stats.consistency > 0.8) strengths.push('安定性');
        if (stats.improvementTrend === 'improving') strengths.push('継続的改善');
        
        return strengths;
    }

    identifyWeaknessAreas(stats) {
        const weaknesses = [];
        
        if (stats.scores.mean < 1000) weaknesses.push('低スコア');
        if (stats.accuracy.mean < 0.6) weaknesses.push('低精度');
        if (stats.consistency < 0.4) weaknesses.push('不安定');
        if (stats.times.mean > 300) weaknesses.push('時間効率');
        
        return weaknesses;
    }

    analyzeRecentTrend(plays) {
        const recentPlays = plays.slice(-5);
        if (recentPlays.length < 3) return 'insufficient_data';
        
        return this.calculateImprovementTrend(recentPlays);
    }

    detectSeasonalPatterns(plays) {
        // 簡易的な季節パターン検出（実装は要カスタマイズ）
        return { detected: false, pattern: 'none' };
    }

    calculateNormalizedPerformance(stats, adjustmentFactor) {
        return {
            score: stats.scores.mean / adjustmentFactor,
            time: stats.times.mean * adjustmentFactor,
            accuracy: stats.accuracy.mean,
            overall: (stats.scores.mean / adjustmentFactor + stats.accuracy.mean * 100) / 2
        };
    }

    calculateSkillLevel(stats, adjustmentFactor) {
        const normalizedPerformance = this.calculateNormalizedPerformance(stats, adjustmentFactor);
        const overall = normalizedPerformance.overall;
        
        if (overall >= 80) return 'expert';
        if (overall >= 60) return 'advanced';
        if (overall >= 40) return 'intermediate';
        if (overall >= 20) return 'beginner';
        return 'novice';
    }

    generateComparisonSummary(stage1Id, stage2Id, comparisons) {
        const summary = [];
        
        if (comparisons.score.significant) {
            const better = comparisons.score.meanDifference > 0 ? stage1Id : stage2Id;
            summary.push(`スコア: ${better}が有意に優秀`);
        }
        
        if (comparisons.time.significant) {
            const faster = comparisons.time.meanDifference < 0 ? stage1Id : stage2Id;
            summary.push(`時間: ${faster}が有意に高速`);
        }
        
        if (comparisons.accuracy.significant) {
            const accurate = comparisons.accuracy.meanDifference > 0 ? stage1Id : stage2Id;
            summary.push(`精度: ${accurate}が有意に正確`);
        }
        
        return summary.length > 0 ? summary : ['有意な差は検出されませんでした'];
    }

    generatePairwiseRecommendations(stage1Id, stage2Id, stage1Stats, stage2Stats) {
        const recommendations = [];
        
        // スコア比較による推奨
        if (stage1Stats.scores.mean < stage2Stats.scores.mean * 0.8) {
            recommendations.push(`${stage1Id}のスコア向上に注力してください`);
        }
        
        // 時間比較による推奨
        if (stage1Stats.times.mean > stage2Stats.times.mean * 1.2) {
            recommendations.push(`${stage1Id}の時間効率を改善してください`);
        }
        
        return recommendations;
    }

    calculateCrossStageConsistency(stageStats) {
        const performanceRatings = Object.values(stageStats).map(s => s.performanceRating);
        const stats = this.statisticalAnalyzer.calculateBasicStatistics(performanceRatings);
        return stats.mean > 0 ? 1 - (stats.standardDeviation / stats.mean) : 0;
    }

    identifyStrongestStages(stageStats) {
        return Object.entries(stageStats)
            .map(([id, stats]) => ({ id, rating: stats.performanceRating }))
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 3);
    }

    identifyWeakestStages(stageStats) {
        return Object.entries(stageStats)
            .filter(([id, stats]) => stats.playCount >= this.stageConfig.minimumPlaysForAnalysis)
            .map(([id, stats]) => ({ id, rating: stats.performanceRating }))
            .sort((a, b) => a.rating - b.rating)
            .slice(0, 3);
    }

    identifyImprovementOpportunities(stageStats) {
        const opportunities = [];
        
        for (const [stageId, stats] of Object.entries(stageStats)) {
            if (stats.playCount < this.stageConfig.minimumPlaysForAnalysis) continue;
            
            if (stats.improvementTrend === 'declining') {
                opportunities.push({ stage: stageId, type: 'declining_performance', priority: 'high' });
            }
            
            if (stats.consistency < 0.5) {
                opportunities.push({ stage: stageId, type: 'inconsistent_performance', priority: 'medium' });
            }
            
            if (stats.accuracy.mean < 0.7) {
                opportunities.push({ stage: stageId, type: 'low_accuracy', priority: 'high' });
            }
        }
        
        return opportunities;
    }

    analyzeMasteryProgression(stageStats) {
        const masteryLevels = Object.entries(stageStats)
            .filter(([id, stats]) => stats.playCount >= this.stageConfig.minimumPlaysForAnalysis)
            .map(([id, stats]) => ({
                stage: id,
                mastery: this.calculateMasteryLevel([{ accuracy: stats.accuracy.mean }]),
                difficulty: stats.difficultyLevel
            }));
        
        return {
            overallMastery: masteryLevels.reduce((sum, m) => sum + m.mastery, 0) / masteryLevels.length,
            masteryByDifficulty: this.groupMasteryByDifficulty(masteryLevels),
            progressionRate: this.calculateProgressionRate(masteryLevels)
        };
    }

    groupMasteryByDifficulty(masteryLevels) {
        const grouped = {};
        
        for (const level of masteryLevels) {
            if (!grouped[level.difficulty]) {
                grouped[level.difficulty] = [];
            }
            grouped[level.difficulty].push(level.mastery);
        }
        
        // 各難易度の平均マスタリーレベル計算
        for (const [difficulty, masteries] of Object.entries(grouped)) {
            grouped[difficulty] = masteries.reduce((sum, m) => sum + m, 0) / masteries.length;
        }
        
        return grouped;
    }

    calculateProgressionRate(masteryLevels) {
        // 難易度順でのマスタリー進歩率を計算
        const difficultyOrder = ['easy', 'normal', 'hard', 'expert'];
        const progression = [];
        
        for (let i = 0; i < difficultyOrder.length - 1; i++) {
            const current = masteryLevels.filter(m => m.difficulty === difficultyOrder[i]);
            const next = masteryLevels.filter(m => m.difficulty === difficultyOrder[i + 1]);
            
            if (current.length > 0 && next.length > 0) {
                const currentAvg = current.reduce((sum, m) => sum + m.mastery, 0) / current.length;
                const nextAvg = next.reduce((sum, m) => sum + m.mastery, 0) / next.length;
                progression.push(nextAvg - currentAvg);
            }
        }
        
        return progression.length > 0 
            ? progression.reduce((sum, p) => sum + p, 0) / progression.length 
            : 0;
    }
}