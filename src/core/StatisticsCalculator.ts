/**
 * StatisticsCalculator.ts
 * 統計計算・分析機能を担当するクラス
 * データ分析、トレンド計算、詳細統計の算出を提供
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';

/**
 * 統計計算クラス
 */
export class StatisticsCalculator {
    private trendPeriods: any;

    constructor() {
        this.trendPeriods = {
            daily: 1,
            weekly: 7,
            monthly: 30
        };
    }

    /**
     * 詳細統計データを取得
     * @param {Object} statistics - 統計データ
     * @param {Object} sessionStats - セッション統計
     * @returns {Object} 詳細統計
     */
    getDetailedStatistics(statistics: any, sessionStats: any): any {
        try {
            const basic = this.calculateBasicStats(statistics);
            const advanced = this.calculateAdvancedStats(statistics);
            const trends = this.calculateTrends(statistics);
            const efficiency = this.calculateEfficiencyMetrics(statistics);
            const rankings = this.calculateRankings(statistics);
            
            return {
                basic,
                advanced,
                trends,
                efficiency,
                rankings,
                session: sessionStats,
                summary: this.generateSummary(statistics, sessionStats)
            };
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsCalculator', 'getDetailedStatistics');
            return this.getEmptyDetailedStats();
        }
    }

    /**
     * 基本統計を計算
     * @param {Object} statistics - 統計データ
     * @returns {Object} 基本統計
     */
    calculateBasicStats(statistics: any): any {
        return {
            games: {
                total: statistics.totalGamesPlayed || 0,
                completed: statistics.stagesCompleted || 0,
                failed: statistics.stagesFailed || 0,
                completionRate: this.calculateCompletionRate(statistics)
            },
            score: {
                total: statistics.totalScore || 0,
                highest: statistics.highestScore || 0,
                average: statistics.averageScore || 0,
                distribution: statistics.scoreDistribution || {}
            },
            bubbles: {
                popped: statistics.totalBubblesPopped || 0,
                missed: statistics.totalBubblesMissed || 0,
                accuracy: statistics.bubbleAccuracy || 0,
                typeStats: statistics.bubbleTypeStats || {}
            },
            time: {
                total: statistics.totalPlayTime || 0,
                average: statistics.averageSessionLength || 0,
                longest: statistics.longestSession || 0,
                shortest: statistics.shortestSession === Infinity ? 0 : statistics.shortestSession
            },
            combos: {
                total: statistics.totalCombos || 0,
                highest: statistics.highestCombo || 0,
                average: statistics.averageCombo || 0,
                breaks: statistics.comboBreaks || 0
            }
        };
    }

    /**
     * 高度統計を計算
     * @param {Object} statistics - 統計データ
     * @returns {Object} 高度統計
     */
    calculateAdvancedStats(statistics: any): any {
        return {
            efficiency: this.calculateDetailedEfficiency(statistics),
            reactionTime: this.calculateReactionTimeAnalysis(statistics),
            performance: this.calculatePerformanceMetrics(statistics),
            behavior: this.calculateBehaviorAnalysis(statistics),
            consistency: this.calculateConsistencyMetrics(statistics)
        };
    }

    /**
     * 完了率を計算
     * @param {Object} statistics - 統計データ
     * @returns {number} 完了率
     */
    calculateCompletionRate(statistics: any): number {
        const total = statistics.totalGamesPlayed || 0;
        const completed = statistics.stagesCompleted || 0;
        return total > 0 ? (completed / total) * 100 : 0;
    }

    /**
     * 詳細効率を計算
     * @param {Object} statistics - 統計データ
     * @returns {Object} 効率メトリクス
     */
    calculateDetailedEfficiency(statistics: any): any {
        const effStats = statistics.efficiencyStats || {};
        const totalTime = statistics.totalPlayTime || 0;
        const totalBubbles = statistics.totalBubblesPopped || 0;
        
        return {
            bubblesPerMinute: effStats.bubblesPerMinute || 0,
            bubblesPerSecond: effStats.bubblesPerSecond || 0,
            peakEfficiency: effStats.peakEfficiency || 0,
            currentTrend: this.calculateEfficiencyTrend(effStats.efficiencyTrend || []),
            scorePerMinute: totalTime > 0 ? (statistics.totalScore || 0) / (totalTime / 60000) : 0,
            timeUtilization: this.calculateTimeUtilization(statistics),
            improvementRate: this.calculateImprovementRate(effStats.efficiencyTrend || [])
        };
    }

    /**
     * 反応時間分析を計算
     * @param {Object} statistics - 統計データ
     * @returns {Object} 反応時間分析
     */
    calculateReactionTimeAnalysis(statistics: any): any {
        const reactionStats = statistics.reactionTimeStats || {};
        
        return {
            average: reactionStats.average || 0,
            fastest: reactionStats.fastest === Infinity ? 0 : reactionStats.fastest || 0,
            slowest: reactionStats.slowest || 0,
            distribution: reactionStats.distribution || {},
            consistency: this.calculateReactionConsistency(reactionStats.recentTimes || []),
            percentile: this.calculatePercentiles(reactionStats.recentTimes || [])
        };
    }

    /**
     * パフォーマンスメトリクスを計算
     * @param {Object} statistics - 統計データ
     * @returns {Object} パフォーマンスメトリクス
     */
    calculatePerformanceMetrics(statistics: any): any {
        return {
            overallRating: this.calculateOverallRating(statistics),
            skillLevel: this.determineSkillLevel(statistics),
            strengths: this.identifyStrengths(statistics),
            improvements: this.identifyImprovements(statistics),
            progression: this.calculateProgression(statistics)
        };
    }

    /**
     * 行動分析を計算
     * @param {Object} statistics - 統計データ
     * @returns {Object} 行動分析
     */
    calculateBehaviorAnalysis(statistics: any): any {
        const behavior = statistics.playerBehaviorStats || {};
        
        return {
            playStyle: this.determinePlayStyle(statistics),
            aggression: this.calculateAggression(statistics),
            patience: this.calculatePatience(statistics),
            adaptability: this.calculateAdaptability(statistics),
            riskTaking: this.calculateRiskTaking(statistics),
            learning: this.calculateLearningPattern(statistics)
        };
    }

    /**
     * 一貫性メトリクスを計算
     * @param {Object} statistics - 統計データ
     * @returns {Object} 一貫性メトリクス
     */
    calculateConsistencyMetrics(statistics: any): any {
        return {
            scoreConsistency: this.calculateScoreConsistency(statistics),
            timeConsistency: this.calculateTimeConsistency(statistics),
            accuracyConsistency: this.calculateAccuracyConsistency(statistics),
            performanceVariability: this.calculatePerformanceVariability(statistics),
            reliabilityIndex: this.calculateReliabilityIndex(statistics)
        };
    }

    /**
     * トレンドを計算
     * @param {Object} statistics - 統計データ
     * @returns {Object} トレンド分析
     */
    calculateTrends(statistics: any): any {
        return {
            score: this.calculateScoreTrend(statistics),
            efficiency: this.calculateEfficiencyTrend(statistics.efficiencyStats?.efficiencyTrend || []),
            accuracy: this.calculateAccuracyTrend(statistics),
            playTime: this.calculatePlayTimeTrend(statistics),
            overall: this.calculateOverallTrend(statistics)
        };
    }

    /**
     * 効率メトリクスを計算
     * @param {Object} statistics - 統計データ
     * @returns {Object} 効率メトリクス
     */
    calculateEfficiencyMetrics(statistics: any): any {
        return {
            timeEfficiency: this.calculateTimeEfficiency(statistics),
            actionEfficiency: this.calculateActionEfficiency(statistics),
            resourceEfficiency: this.calculateResourceEfficiency(statistics),
            learningEfficiency: this.calculateLearningEfficiency(statistics)
        };
    }

    /**
     * ランキングを計算
     * @param {Object} statistics - 統計データ
     * @returns {Object} ランキング情報
     */
    calculateRankings(statistics: any): any {
        return {
            scoreRank: this.calculateScoreRank(statistics),
            efficiencyRank: this.calculateEfficiencyRank(statistics),
            accuracyRank: this.calculateAccuracyRank(statistics),
            consistencyRank: this.calculateConsistencyRank(statistics),
            overallRank: this.calculateOverallRank(statistics)
        };
    }

    /**
     * 効率トレンドを計算
     * @param {Array} efficiencyData - 効率データ配列
     * @returns {string} トレンド ('improving', 'declining', 'stable')
     */
    calculateEfficiencyTrend(efficiencyData: number[]): string {
        if (!efficiencyData || efficiencyData.length < 3) {
            return 'stable';
        }
        
        const recent = efficiencyData.slice(-5);
        const earlier = efficiencyData.slice(-10, -5);
        
        if(earlier.length === 0) return 'stable';
        
        const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
        const earlierAvg = earlier.reduce((sum, val) => sum + val, 0) / earlier.length;
        
        const improvementThreshold = 0.05; // 5%
        
        if(recentAvg > earlierAvg * (1 + improvementThreshold)) {
            return 'improving';
        } else if(recentAvg < earlierAvg * (1 - improvementThreshold)) {
            return 'declining';
        } else {
            return 'stable';
        }
    }

    /**
     * 反応一貫性を計算
     * @param {Array} reactionTimes - 反応時間配列
     * @returns {number} 一貫性スコア (0-100)
     */
    calculateReactionConsistency(reactionTimes: number[]): number {
        if (!reactionTimes || reactionTimes.length < 3) {
            return 0;
        }
        
        const mean = reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length;
        const variance = reactionTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / reactionTimes.length;
        const standardDeviation = Math.sqrt(variance);
        
        // 一貫性スコア: 低い標準偏差ほど高いスコア
        const coefficientOfVariation = mean > 0 ? standardDeviation / mean : 1;
        return Math.max(0, 100 - (coefficientOfVariation * 100));
    }

    /**
     * パーセンタイルを計算
     * @param {Array} values - 値の配列
     * @returns {Object} パーセンタイル情報
     */
    calculatePercentiles(values: number[]): any {
        if (!values || values.length === 0) {
            return { p25: 0, p50: 0, p75: 0, p90: 0, p95: 0 };
        }
        
        const sorted = [...values].sort((a, b) => a - b);
        const len = sorted.length;
        
        return {
            p25: this.getPercentile(sorted, 25),
            p50: this.getPercentile(sorted, 50), // median
            p75: this.getPercentile(sorted, 75),
            p90: this.getPercentile(sorted, 90),
            p95: this.getPercentile(sorted, 95)
        };
    }

    /**
     * 指定パーセンタイルの値を取得
     * @param {Array} sortedArray - ソートされた配列
     * @param {number} percentile - パーセンタイル (0-100)
     * @returns {number} パーセンタイル値
     */
    getPercentile(sortedArray: number[], percentile: number): number {
        const index = (percentile / 100) * (sortedArray.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index % 1;
        
        if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1];
        if (lower < 0) return sortedArray[0];
        
        return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
    }

    /**
     * 総合評価を計算
     * @param {Object} statistics - 統計データ
     * @returns {number} 総合評価 (0-100)
     */
    calculateOverallRating(statistics: any): number {
        const factors = {
            accuracy: Math.min(100, statistics.bubbleAccuracy || 0) * 0.25,
            efficiency: Math.min(100, (statistics.efficiencyStats?.bubblesPerMinute || 0) / 2) * 0.25,
            consistency: this.calculateScoreConsistency(statistics) * 0.2,
            completion: this.calculateCompletionRate(statistics) * 0.15,
            improvement: this.calculateImprovementRate(statistics.efficiencyStats?.efficiencyTrend || []) * 0.15
        };
        
        return Object.values(factors).reduce((sum, factor) => sum + factor, 0);
    }

    /**
     * スキルレベルを判定
     * @param {Object} statistics - 統計データ
     * @returns {string} スキルレベル
     */
    determineSkillLevel(statistics: any): string {
        const rating = this.calculateOverallRating(statistics);
        
        if(rating >= 90) return 'Expert';
        if(rating >= 75) return 'Advanced';
        if(rating >= 60) return 'Intermediate';
        if(rating >= 40) return 'Beginner';
        
        return 'Novice';
    }

    /**
     * 強みを特定
     * @param {Object} statistics - 統計データ
     * @returns {Array} 強みリスト
     */
    identifyStrengths(statistics: any): string[] {
        const strengths: string[] = [];
        
        if ((statistics.bubbleAccuracy || 0) >= 85) {
            strengths.push('High Accuracy');
        }
        
        if ((statistics.efficiencyStats?.bubblesPerMinute || 0) >= 120) {
            strengths.push('Fast Execution');
        }
        
        if (this.calculateScoreConsistency(statistics) >= 80) {
            strengths.push('Consistent Performance');
        }
        
        if ((statistics.highestCombo || 0) >= 50) {
            strengths.push('Combo Mastery');
        }
        
        if (this.calculateCompletionRate(statistics) >= 90) {
            strengths.push('High Completion Rate');
        }
        
        return strengths;
    }

    /**
     * 改善点を特定
     * @param {Object} statistics - 統計データ
     * @returns {Array} 改善点リスト
     */
    identifyImprovements(statistics: any): string[] {
        const improvements: string[] = [];
        
        if ((statistics.bubbleAccuracy || 0) < 70) {
            improvements.push('Improve Accuracy');
        }
        
        if ((statistics.efficiencyStats?.bubblesPerMinute || 0) < 80) {
            improvements.push('Increase Speed');
        }
        
        if (this.calculateScoreConsistency(statistics) < 60) {
            improvements.push('Be More Consistent');
        }
        
        if ((statistics.averageCombo || 0) < 10) {
            improvements.push('Build Longer Combos');
        }
        
        if (this.calculateCompletionRate(statistics) < 70) {
            improvements.push('Focus on Completion');
        }
        
        return improvements;
    }

    /**
     * スコア一貫性を計算
     * @param {Object} statistics - 統計データ
     * @returns {number} 一貫性スコア (0-100)
     */
    calculateScoreConsistency(statistics: any): number {
        // 実装簡素化版 - 実際にはより詳細な計算が必要
        const avgScore = statistics.averageScore || 0;
        const highScore = statistics.highestScore || 0;
        
        if (highScore === 0) return 0;
        
        const consistency = (avgScore / highScore) * 100;
        return Math.min(100, consistency);
    }

    /**
     * 改善率を計算
     * @param {Array} trendData - トレンドデータ
     * @returns {number} 改善率 (0-100)
     */
    calculateImprovementRate(trendData: number[]): number {
        if (!trendData || trendData.length < 5) return 50;
        
        const early = trendData.slice(0, Math.floor(trendData.length / 2));
        const late = trendData.slice(Math.floor(trendData.length / 2));
        const earlyAvg = early.reduce((sum, val) => sum + val, 0) / early.length;
        const lateAvg = late.reduce((sum, val) => sum + val, 0) / late.length;
        
        if (earlyAvg === 0) return 50;
        
        const improvement = ((lateAvg - earlyAvg) / earlyAvg) * 100;
        return Math.max(0, Math.min(100, 50 + improvement));
    }

    /**
     * 時間効率を計算
     * @param {Object} statistics - 統計データ
     * @returns {number} 時間効率スコア
     */
    calculateTimeEfficiency(statistics: any): number {
        const totalTime = statistics.totalPlayTime || 0;
        const totalScore = statistics.totalScore || 0;
        
        return totalTime > 0 ? totalScore / (totalTime / 60000) : 0; // スコア/分
    }

    /**
     * 統計サマリーを生成
     * @param {Object} statistics - 統計データ
     * @param {Object} sessionStats - セッション統計
     * @returns {Object} サマリー
     */
    generateSummary(statistics: any, sessionStats: any): any {
        return {
            level: this.determineSkillLevel(statistics),
            rating: this.calculateOverallRating(statistics),
            playTime: this.formatTime(statistics.totalPlayTime || 0),
            totalGames: statistics.totalGamesPlayed || 0,
            bestScore: statistics.highestScore || 0,
            accuracy: Math.round((statistics.bubbleAccuracy || 0) * 10) / 10,
            favoriteStage: this.getFavoriteStage(statistics),
            recentTrend: this.calculateEfficiencyTrend(statistics.efficiencyStats?.efficiencyTrend || [])
        };
    }

    /**
     * お気に入りステージを取得
     * @param {Object} statistics - 統計データ
     * @returns {string} お気に入りステージ
     */
    getFavoriteStage(statistics: any): string {
        const stageStats = statistics.stageStats || {};
        
        let maxPlays = 0;
        let favoriteStage = 'None';
        
        for(const [stageId, stats] of Object.entries(stageStats)) {
            if ((stats as any).gamesPlayed > maxPlays) {
                maxPlays = (stats as any).gamesPlayed;
                favoriteStage = stageId;
            }
        }
        
        return favoriteStage;
    }

    /**
     * 時間をフォーマット
     * @param {number} milliseconds - ミリ秒
     * @returns {string} フォーマットされた時間
     */
    formatTime(milliseconds: number): string {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    /**
     * 空の詳細統計を取得
     * @returns {Object} 空の統計オブジェクト
     */
    getEmptyDetailedStats(): any {
        return {
            basic: {},
            advanced: {},
            trends: {},
            efficiency: {},
            rankings: {},
            session: {},
            summary: {}
        };
    }

    // プレースホルダーメソッド（実装の完全性のため）
    calculateTimeConsistency(statistics: any): number { return 75; }
    calculateAccuracyConsistency(statistics: any): number { return 80; }
    calculatePerformanceVariability(statistics: any): number { return 15; }
    calculateReliabilityIndex(statistics: any): number { return 85; }
    calculateScoreTrend(statistics: any): string { return 'improving'; }
    calculateAccuracyTrend(statistics: any): string { return 'stable'; }
    calculatePlayTimeTrend(statistics: any): string { return 'stable'; }
    calculateOverallTrend(statistics: any): string { return 'improving'; }
    calculateActionEfficiency(statistics: any): number { return 75; }
    calculateResourceEfficiency(statistics: any): number { return 80; }
    calculateLearningEfficiency(statistics: any): number { return 70; }
    calculateScoreRank(statistics: any): string { return 'A'; }
    calculateEfficiencyRank(statistics: any): string { return 'B+'; }
    calculateAccuracyRank(statistics: any): string { return 'A-'; }
    calculateConsistencyRank(statistics: any): string { return 'B'; }
    calculateOverallRank(statistics: any): string { return 'A-'; }
    determinePlayStyle(statistics: any): string { return 'Balanced'; }
    calculateAggression(statistics: any): number { return 60; }
    calculatePatience(statistics: any): number { return 70; }
    calculateAdaptability(statistics: any): number { return 75; }
    calculateRiskTaking(statistics: any): number { return 50; }
    calculateLearningPattern(statistics: any): string { return 'Steady'; }
    calculateProgression(statistics: any): string { return 'Good'; }
    calculateTimeUtilization(statistics: any): number { return 85; }
}

// シングルトンインスタンス管理
let statisticsCalculatorInstance: StatisticsCalculator | null = null;

/**
 * StatisticsCalculatorのシングルトンインスタンスを取得
 * @returns {StatisticsCalculator} シングルトンインスタンス
 */
export function getStatisticsCalculator(): StatisticsCalculator {
    if (!statisticsCalculatorInstance) {
        statisticsCalculatorInstance = new StatisticsCalculator();
    }
    return statisticsCalculatorInstance;
}

/**
 * StatisticsCalculatorのシングルトンインスタンスを再初期化
 * @returns {StatisticsCalculator} 新しいシングルトンインスタンス
 */
export function reinitializeStatisticsCalculator(): StatisticsCalculator {
    statisticsCalculatorInstance = new StatisticsCalculator();
    return statisticsCalculatorInstance;
}