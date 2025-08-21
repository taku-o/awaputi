/**
 * StageComparisonAnalyzer - ステージ特化比較分析
 * 
 * ComparisonEngineから分離されたステージ特化比較専用コンポーネント
 * - ステージ別パフォーマンス比較
 * - 難易度調整済みメトリクス計算
 * - ステージ統計分析
 * - 個別ステージ比較
 */

import { StatisticalAnalyzer, BasicStatistics, SignificanceTestResult  } from './StatisticalAnalyzer.js';

// 型定義
export interface StageConfig { difficultyLevels: DifficultyLevel[],
    performanceMetrics: PerformanceMetricType[];
    minimumPlaysForAnalysis: number;
    maxStagesForComparison: number;
    trendAnalysisWindow: number;
export interface PlayData { score?: number,
    completionTime?: number;
    accuracy?: number;
    timestamp?: string | number;
    date?: string | number;
    difficulty?: DifficultyLevel;
    metadata?: PlayMetadata;
export interface PlayMetadata { gameMode?: string,
    playerLevel?: number;
    attempts?: number;
    powerUpsUsed?: string[];
    achievements?: string[];
    sessionId?: string;
export interface StageData { [stageId: string]: PlayData[];
export interface StageStatistics { stageId: string,
    playCount: number;
    scores: BasicStatistics;
    times: BasicStatistics;
    accuracy: BasicStatistics;
    difficultyLevel: DifficultyLevel;
    lastPlayed: Date | null;
    improvementTrend: ImprovementTrend;
    consistency: number;
    performanceRating: number;
    masteryLevel?: number;
    skillLevel?: SkillLevel;
     }
export interface StagePerformanceMetrics { [stageId: string]: {
        insufficient_dat,a?: boolean;
        // 効率性メトリクス
        scorePerSecond?: BasicStatistics;
        accuracyConsistency?: number;
        timeConsistency?: number;
        // 学習・改善メトリクス
        learningRate?: number;
        masteryLevel?: number;
        plateauDetection?: PlateauDetection;
        // 相対的パフォーマンス
        relativePerformance?: RelativePerformance;
        strengthAreas?: string[];
        weaknessAreas?: string[];
        // 時系列分析
        recentTrend?: ImprovementTrend;
        seasonalPatterns?: SeasonalPattern;

export interface DifficultyAdjustedMetrics { [stageId: string]: {
        adjustedScor,e: number,
        adjustedTime: number,
        adjustedAccuracy: number,
        difficultyAdjustmentFactor: number,
        normalizedPerformance: NormalizedPerformance,
    skillLevel: SkillLevel,

export interface StageComparisonResult { timestamp: string,
    stageSummary: { [stageId: string]: StageStatistics,;
    individualComparisons: { [key: string]: PairwiseComparison,;
    performanceMetrics: StagePerformanceMetrics,
    difficultyAdjustedMetrics: DifficultyAdjustedMetrics,
    overallTrends: OverallTrends,
    recommendations: StageRecommendation[],
    error?: string;
}

export interface PairwiseComparison { stage1: StageInfo,
    stage2: StageInfo;
    comparisons: {
        scor,e: SignificanceTestResult,
        time: SignificanceTestResult,
    accuracy: SignificanceTestResult,;
    summary: string[],
    recommendations: string[],
    effectSizes?: { score: number,
        time: number,
    accuracy: number,

export interface StageInfo { id: string,
    stats: StageStatistics;
export interface OverallTrends { insufficient_data?: boolean,
    overallPerformance?: {,
        averageScore: BasicStatistics,
        averageTime: BasicStatistics,
    averageAccuracy: BasicStatistics,;
    consistencyAcrossStages?: number;
    strongestStages?: StageRanking[];
    weakestStages?: StageRanking[];
    improvementOpportunities?: ImprovementOpportunity[];
    masteryProgression?: MasteryProgression;
    }

export interface StageRanking { id: string,
    rating: number;
    relativeScore?: number;
    percentileRank?: number,  }
export interface ImprovementOpportunity { stage: string,
    type: ImprovementType;
    priority: Priority;
    description?: string;
    estimatedImpact?: number,  }
export interface MasteryProgression { overallMastery: number,
    masteryByDifficulty: { [difficulty: string]: number,;
    progressionRate: number,
    nextMilestone?: string;
}

export interface StageRecommendation { type: RecommendationType,
    priority: Priority;
    stage: string;
    message: string;
    actionItems?: string[];
    expectedOutcome?: string;
    timeframe?: string,  }
export interface PlateauDetection { isOnPlateau: boolean,
    confidence: number;
    variationCoefficient?: number;
    trend?: ImprovementTrend;
    plateauDuration?: number;
    breakoutStrategy?: string,  }
export interface RelativePerformance { relativeScore: number,
    percentileRank: number;
    standardizedScore?: number;
    rankingPosition?: number,  }
export interface NormalizedPerformance { score: number,
    time: number;
    accuracy: number;
    overall: number;
    efficiency?: number;
export interface SeasonalPattern { detected: boolean,
    pattern: SeasonalPatternType;
    confidence?: number;
    description?: string,  }
;
// 列挙型
export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'expert' | 'master' | 'unknown';
export type SkillLevel = 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
export type ImprovementTrend = 'improving' | 'declining' | 'stable' | 'insufficient_data' | 'volatile';
export type PerformanceMetricType = 'score' | 'time' | 'accuracy' | 'efficiency' | 'consistency';

export type RecommendationType = ';'
    | 'practice_more' | 'break_plateau' | 'focus_weak_areas' | 'leverage_strengths'';'
    | 'improve_consistency' | 'optimize_time' | 'increase_accuracy' | 'try_different_strategy';

export type ImprovementType = ';'
    | 'declining_performance' | 'inconsistent_performance' | 'low_accuracy', ';'
    | 'slow_completion' | 'plateau_detected' | 'skill_gap';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type SeasonalPatternType = 'none' | 'daily' | 'weekly' | 'monthly' | 'session_based';

// 定数
export const DEFAULT_STAGE_CONFIG: StageConfig = {,
    difficultyLevels: ['easy', 'normal', 'hard', 'expert'],
    performanceMetrics: ['score', 'time', 'accuracy', 'efficiency'],
    minimumPlaysForAnalysis: 3,
    maxStagesForComparison: 50,
    trendAnalysisWindow: 10 
 };
export const DEFAULT_DIFFICULTY_ADJUSTMENTS: Record<DifficultyLevel, number> = { easy: 0.7,
    normal: 1.0,
    hard: 1.3,
    expert: 1.6,
    master: 2.0,
    unknown: 1.0 
 };
export const PERFORMANCE_THRESHOLDS = { highScore: 5000,
    highAccuracy: 0.9,
    highConsistency: 0.8,
    lowScore: 1000,
    lowAccuracy: 0.6,
    lowConsistency: 0.4,
    slowTime: 300,
    plateauVariation: 0.1 
 } as const;
export const SKILL_LEVEL_THRESHOLDS = { expert: 80,
    advanced: 60,
    intermediate: 40,
    beginner: 20,
    novice: 0 
 } as const;
export const TREND_SLOPE_THRESHOLDS = { improving: 50,
    declining: -50 
 } as const;
';'
// ユーティリティ関数
export function isValidPlayData(play: any): play is PlayData {,
    return play && typeof play === 'object' }
export function extractValidPlays(plays: any[]): PlayData[] { return plays.filter(isValidPlayData) }
export function getPlayScore(play: PlayData): number { return play.score || 0 }
export function getPlayTime(play: PlayData): number { return play.completionTime || 0 }
export function getPlayAccuracy(play: PlayData): number { return play.accuracy || 0 }
';'

export function getPlayTimestamp(play: PlayData): number {,
    if (play.timestamp) {', ' }

        return typeof play.timestamp === 'string' ? new Date(play.timestamp).getTime() : play.timestamp;
    if (play.date) {', ' }

        return typeof play.date === 'string' ? new Date(play.date).getTime() : play.date;
    return Date.now();
}

export function calculateEfficiency(play: PlayData): number { const score = getPlayScore(play),
    const time = getPlayTime(play),
    return time > 0 ? score / time: 0 }
';'

export function normalizeDifficultyLevel(level: string): DifficultyLevel {,
    const normalized = level.toLowerCase()','
    if(['easy', 'tutorial].some(keyword => normalized.includes(keyword)) return 'easy','
    if(['hard].some(keyword => normalized.includes(keyword)) return 'hard','
    if(['expert', 'master].some(keyword => normalized.includes(keyword)) return 'expert','
    return 'normal',

export function createEmptyStageStatistics(stageId: string): StageStatistics { return { stageId };
        playCount: 0;
}
        scores: { count: 0, sum: 0, mean: 0, variance: 0, standardDeviation: 0, minimum: 0, maximum: 0, median: 0, q1: 0, q3: 0, range: 0, iqr: 0, skewness: 0, kurtosis: 0  },
        times: { count: 0, sum: 0, mean: 0, variance: 0, standardDeviation: 0, minimum: 0, maximum: 0, median: 0, q1: 0, q3: 0, range: 0, iqr: 0, skewness: 0, kurtosis: 0  },

        accuracy: { count: 0, sum: 0, mean: 0, variance: 0, standardDeviation: 0, minimum: 0, maximum: 0, median: 0, q1: 0, q3: 0, range: 0, iqr: 0, skewness: 0, kurtosis: 0  },''
        difficultyLevel: 'unknown',
        lastPlayed: null,
        improvementTrend: 'insufficient_data';
        consistency: 0,
    performanceRating: 0;
    } }

export class StageComparisonAnalyzer {
    private statisticalAnalyzer: StatisticalAnalyzer;
    private stageConfig: StageConfig;
    private, difficultyAdjustments: Record<DifficultyLevel, number>,

    constructor(
        statisticalAnalyzer: StatisticalAnalyzer;)
        config: Partial<StageConfig> = {})
        difficultyAdjustments: Partial<Record<DifficultyLevel, number>> = { ) {
        this.statisticalAnalyzer = statisticalAnalyzer }
        this.stageConfig = { ...DEFAULT_STAGE_CONFIG, ...config,
        this.difficultyAdjustments = { ...DEFAULT_DIFFICULTY_ADJUSTMENTS, ...difficultyAdjustments }

    /**
     * ステージパフォーマンス比較を実行
     */
    compareStagePerformance(stageData: StageData, options: Record<string, any> = { ): StageComparisonResult {
        const results: StageComparisonResult = {
            timestamp: new Date().toISOString(  }
            stageSummary: {};
            individualComparisons: {};
            performanceMetrics: {};
            difficultyAdjustedMetrics: {};
            overallTrends: {};
            recommendations: [];
        },

        try { // 各ステージの統計を計算
            const stageStats = this.calculateStageStatistics(stageData),
            results.stageSummary = stageStats,

            // 個別ステージ比較
            const stageIds = Object.keys(stageData),
            if (stageIds.length >= 2) {
    
}
                results.individualComparisons = this.compareIndividualStages(stageData, stageStats); }
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
            console.error('Error in stage performance comparison:', error','

            return { ''
                error: error instanceof Error ? error.message : 'Unknown error'
            };
                timestamp: new Date().toISOString();
}
                stageSummary: {};
                individualComparisons: {};
                performanceMetrics: {};
                difficultyAdjustedMetrics: {};
                overallTrends: {};
                recommendations: [],
            } }
    /**
     * ステージ統計を計算
     */
    calculateStageStatistics(stageData: StageData): { [stageId: string]: StageStatistics; {
        const statistics: { [stageId: string]: StageStatistics, = {}
        for(const [stageId, plays] of Object.entries(stageData) {
            const validPlays = extractValidPlays(plays),
            
            if (validPlays.length === 0) {
                statistics[stageId] = createEmptyStageStatistics(stageId) }
                continue; }
            // 各メトリクスの統計計算
            const scoreData = validPlays.map(getPlayScore).filter(s => s > 0);
            const timeData = validPlays.map(getPlayTime).filter(t => t > 0);
            const accuracyData = validPlays.map(getPlayAccuracy).filter(a => a >= 0);

            statistics[stageId] = { stageId,
                playCount: validPlays.length,
                scores: this.statisticalAnalyzer.calculateBasicStatistics(scoreData),
                times: this.statisticalAnalyzer.calculateBasicStatistics(timeData),
                accuracy: this.statisticalAnalyzer.calculateBasicStatistics(accuracyData),
                difficultyLevel: this.getDifficultyLevel(stageId),
                lastPlayed: this.getLastPlayedDate(validPlays),
                improvementTrend: this.calculateImprovementTrend(validPlays),
                consistency: this.calculateConsistency(validPlays),
                performanceRating: this.calculatePerformanceRating(validPlays,
    masteryLevel: this.calculateMasteryLevel(validPlays  }

        return statistics
    }

    /**
     * ステージパフォーマンスメトリクスを計算
     */
    calculateStagePerformanceMetrics(stageData: StageData, stageStats: { [stageId: string]: StageStatistics ): StagePerformanceMetrics { }
        const metrics: StagePerformanceMetrics = {}
        for(const [stageId, stats] of Object.entries(stageStats) { if (stats.playCount < this.stageConfig.minimumPlaysForAnalysis) { }
                metrics[stageId] = { insufficient_data: true,
                continue;
            }

            const plays = extractValidPlays(stageData[stageId] || []);
            
            metrics[stageId] = { // 効率性メトリクス
                scorePerSecond: this.calculateScorePerSecond(plays),
                accuracyConsistency: this.calculateAccuracyConsistency(plays),
                timeConsistency: this.calculateTimeConsistency(plays),
                // 学習・改善メトリクス
                learningRate: this.calculateLearningRate(plays),
                masteryLevel: this.calculateMasteryLevel(plays),
                plateauDetection: this.detectPerformancePlateau(plays),
                // 相対的パフォーマンス
               , relativePerformance: this.calculateRelativePerformance(stats, stageStats),
                strengthAreas: this.identifyStrengthAreas(stats),
                weaknessAreas: this.identifyWeaknessAreas(stats),
                // 時系列分析
                recentTrend: this.analyzeRecentTrend(plays,
    seasonalPatterns: this.detectSeasonalPatterns(plays  }

        return metrics
    }

    /**
     * 難易度調整済みメトリクスを計算
     */
    calculateDifficultyAdjustedMetrics(stageData: StageData, stageStats: { [stageId: string]: StageStatistics ): DifficultyAdjustedMetrics { }
        const adjustedMetrics: DifficultyAdjustedMetrics = {}
        for(const [stageId, stats] of Object.entries(stageStats) {
            const difficultyLevel = stats.difficultyLevel,
            const adjustmentFactor = this.difficultyAdjustments[difficultyLevel],

            adjustedMetrics[stageId] = {
                adjustedScore: stats.scores.mean / adjustmentFactor,
                adjustedTime: stats.times.mean * adjustmentFactor,
                adjustedAccuracy: stats.accuracy.mean,
                difficultyAdjustmentFactor: adjustmentFactor,
    normalizedPerformance: this.calculateNormalizedPerformance(stats, adjustmentFactor) }
                skillLevel: this.calculateSkillLevel(stats, adjustmentFactor); }
            }

        return adjustedMetrics;
    }

    /**
     * 個別ステージ比較を実行
     */
    compareIndividualStages(stageData: StageData, stageStats: { [stageId: string]: StageStatistics ): { [key: string]: PairwiseComparison; {
        const comparisons: { [key: string]: PairwiseComparison, = {}
        const stageIds = Object.keys(stageStats).slice(0, this.stageConfig.maxStagesForComparison);

        for(let, i = 0; i < stageIds.length; i++) {

            for (let, j = i + 1, j < stageIds.length, j++) {
                const stage1Id = stageIds[i] }
                const stage2Id = stageIds[j]; }
                const comparisonKey = `${stage1Id}_vs_${stage2Id}`;

                comparisons[comparisonKey] = this.compareStages();
                    stage1Id, stage2Id, stageData, stageStats);
            }
        return comparisons;
    }

    /**
     * 2つのステージを比較
     */
    compareStages(stage1Id: string, stage2Id: string, stageData: StageData, stageStats: { [stageId: string]: StageStatistics ): PairwiseComparison {
        const stage1Stats = stageStats[stage1Id],
        const stage2Stats = stageStats[stage2Id],
        const stage1Plays = extractValidPlays(stageData[stage1Id] || []),
        const stage2Plays = extractValidPlays(stageData[stage2Id] || []),

        // スコア比較
        const scoreComparison = this.statisticalAnalyzer.performSignificanceTest(),
            stage1Plays.map(getPlayScore),
            stage2Plays.map(getPlayScore),

        // 時間比較
        const timeComparison = this.statisticalAnalyzer.performSignificanceTest(),
            stage1Plays.map(getPlayTime),
            stage2Plays.map(getPlayTime),

        // 精度比較
        const accuracyComparison = this.statisticalAnalyzer.performSignificanceTest(),
            stage1Plays.map(getPlayAccuracy),
            stage2Plays.map(getPlayAccuracy),

        return { }
            stage1: { id: stage1Id, stats: stage1Stats,,
            stage2: { id: stage2Id, stats: stage2Stats,,
            comparisons: { score: scoreComparison,
                time: timeComparison,
    accuracy: accuracyComparison,;
            summary: this.generateComparisonSummary(stage1Id, stage2Id, { score: scoreComparison)
               , time: timeComparison),
                accuracy: accuracyComparison,
    recommendations: this.generatePairwiseRecommendations(stage1Id, stage2Id, stage1Stats, stage2Stats }

    /**
     * 全体トレンドを分析
     */
    analyzeOverallTrends(stageStats: { [stageId: string]: StageStatistics ): OverallTrends {
        const stageIds = Object.keys(stageStats),
        
        if (stageIds.length === 0) { }
            return { insufficient_data: true,
        // 平均パフォーマンス
        const avgScores = stageIds.map(id => stageStats[id].scores.mean);
        const avgTimes = stageIds.map(id => stageStats[id].times.mean);
        const avgAccuracy = stageIds.map(id => stageStats[id].accuracy.mean);

        return { overallPerformance: {
                averageScore: this.statisticalAnalyzer.calculateBasicStatistics(avgScores,
    averageTime: this.statisticalAnalyzer.calculateBasicStatistics(avgTimes) };
                averageAccuracy: this.statisticalAnalyzer.calculateBasicStatistics(avgAccuracy), 
    },
            consistencyAcrossStages: this.calculateCrossStageConsistency(stageStats),
            strongestStages: this.identifyStrongestStages(stageStats),
            weakestStages: this.identifyWeakestStages(stageStats),
            improvementOpportunities: this.identifyImprovementOpportunities(stageStats,
    masteryProgression: this.analyzeMasteryProgression(stageStats),
        }

    /**
     * ステージ推奨事項を生成
     */
    generateStageRecommendations(results: StageComparisonResult): StageRecommendation[] { const recommendations: StageRecommendation[] = [] }
        const { stageSummary, performanceMetrics, overallTrends } = results;

        // 練習不足のステージ
        for(const [stageId, stats] of Object.entries(stageSummary) { if (stats.playCount < this.stageConfig.minimumPlaysForAnalysis) {
                recommendations.push({''
                    type: 'practice_more',','
                    priority: 'medium'
            }
                    stage: stageId;

                    message: `${stageId}はプレイ回数が少ないです。より多く練習することで正確な分析が可能になります。`,''
                    actionItems: ['追加のプレイセッションを計画', '定期的な練習スケジュールの設定],'
                    expectedOutcome: '分析精度の向上',')';
                    timeframe: '1-2週間');
            }
        // 改善が停滞しているステージ
        for(const [stageId, metrics] of Object.entries(performanceMetrics) { if (metrics.plateauDetection?.isOnPlateau) {
                recommendations.push({ : undefined''
                    type: 'break_plateau',','
                    priority: 'high'
            }
                    stage: stageId;

                    message: `${stageId}でパフォーマンスが停滞しています。練習方法を変えることを推奨します。`,''
                    actionItems: ['新しい戦略の試行', '休憩後の再挑戦', '類似ステージでの練習],'
                    expectedOutcome: 'パフォーマンスの向上',')';
                    timeframe: '即時');
            }
        // 弱点ステージ
        if (overallTrends.weakestStages) {

            overallTrends.weakestStages.slice(0, 3).forEach(stage => { '
                recommendations.push({''
                    type: 'focus_weak_areas' }''
                    priority: 'high') ;
}
                    stage: stage.id }

                    message: `${stage.id}は相対的にパフォーマンスが低いです。重点的な練習を推奨します。`,''
                    actionItems: ['集中練習セッション', '基本スキルの見直し', '上級者のプレイ動画参考],'
                    expectedOutcome: '弱点の改善',')';
                    timeframe: '2-4週間');
            });
        }

        // 得意ステージの活用
        if (overallTrends.strongestStages) {

            overallTrends.strongestStages.slice(0, 2).forEach(stage => { '
                recommendations.push({''
                    type: 'leverage_strengths' }''
                    priority: 'low') ;
}
                    stage: stage.id }

                    message: `${stage.id}は得意分野です。この強みを他のステージにも活かしましょう。`,''
                    actionItems: ['成功パターンの分析', '他ステージへの応用', 'コンフィデンス向上],'
                    expectedOutcome: '全体的なスキル向上',')';
                    timeframe: '継続的');
            });
        }

        return recommendations;
    }

    // ヘルパーメソッド群

    private getDifficultyLevel(stageId: string): DifficultyLevel { return normalizeDifficultyLevel(stageId) }
    private getLastPlayedDate(plays: PlayData[]): Date | null { if (plays.length === 0) return null,
        const timestamps = plays.map(getPlayTimestamp),
        return new Date(Math.max(...timestamps),
','

    private calculateImprovementTrend(plays: PlayData[]): ImprovementTrend { ''
        if(plays.length < 3) return 'insufficient_data',
        
        const recentPlays = plays.slice(-Math.min(this.stageConfig.trendAnalysisWindow, plays.length),
        const scores = recentPlays.map(getPlayScore),
        
        // 簡易的な線形回帰でトレンド計算
        const n = scores.length,
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0,
        
        for(let, i = 0, i < n, i++) {
        
            sumX += i,
            sumY += scores[i],
            sumXY += i * scores[i] }
            sumXX += i * i; }
        ';'

        const denominator = n * sumXX - sumX * sumX;
        if(denominator === 0) return 'stable';
        
        const slope = (n * sumXY - sumX * sumY) / denominator;

        if(slope > TREND_SLOPE_THRESHOLDS.improving) return 'improving';
        if(slope < TREND_SLOPE_THRESHOLDS.declining) return 'declining';
        return 'stable';
    }

    private calculateConsistency(plays: PlayData[]): number { if (plays.length < 2) return 0,
        
        const scores = plays.map(getPlayScore),
        const stats = this.statisticalAnalyzer.calculateBasicStatistics(scores),
        
        if (stats.mean === 0) return 0,
        
        // CV (変動係数) の逆数として一貫性を計算
        const cv = stats.standardDeviation / stats.mean,
        return Math.max(0, 1 - cv) }
    private calculatePerformanceRating(plays: PlayData[]): number { if (plays.length === 0) return 0,
        
        const avgScore = plays.reduce((sum, p) => sum + getPlayScore(p), 0) / plays.length,
        const avgTime = plays.reduce((sum, p) => sum + getPlayTime(p), 0) / plays.length,
        const avgAccuracy = plays.reduce((sum, p) => sum + getPlayAccuracy(p), 0) / plays.length,
        
        // 正規化された総合評価（0-100）
        const scoreComponent = Math.min(100, avgScore / 1000 * 100),
        const timeComponent = avgTime > 0 ? Math.max(0, 100 - avgTime / 300 * 100) : 0,
        const accuracyComponent = avgAccuracy * 100,
        
        return (scoreComponent * 0.4 + timeComponent * 0.3 + accuracyComponent * 0.3),
    private calculateMasteryLevel(plays: PlayData[]): number { if (plays.length === 0) return 0,
        
        const recentPlays = plays.slice(-5), // 最新5プレイ
        const avgAccuracy = recentPlays.reduce((sum, p) => sum + getPlayAccuracy(p), 0) / recentPlays.length,
        const consistency = this.calculateConsistency(recentPlays),
        
        return (avgAccuracy + consistency) / 2,
    private calculateScorePerSecond(plays: PlayData[]): BasicStatistics { const validPlays = plays.filter(p => getPlayScore(p) > 0 && getPlayTime(p) > 0),
        if (validPlays.length === 0) {
    
}
            return this.statisticalAnalyzer.calculateBasicStatistics([]);
        const efficiency = validPlays.map(p => getPlayScore(p) / getPlayTime(p);
        return this.statisticalAnalyzer.calculateBasicStatistics(efficiency);
    }

    private calculateAccuracyConsistency(plays: PlayData[]): number { const accuracyData = plays.map(getPlayAccuracy),
        const stats = this.statisticalAnalyzer.calculateBasicStatistics(accuracyData),
        return 1 - (stats.standardDeviation / 100), // 正規化された一貫性 }
    private calculateTimeConsistency(plays: PlayData[]): number { const timeData = plays.map(getPlayTime).filter(t => t > 0),
        if (timeData.length === 0) return 0,
        
        const stats = this.statisticalAnalyzer.calculateBasicStatistics(timeData),
        const cv = stats.mean > 0 ? stats.standardDeviation / stats.mean: 1,
        return Math.max(0, 1 - cv) }
    private calculateLearningRate(plays: PlayData[]): number { if (plays.length < 3) return 0,
        
        const scores = plays.map(getPlayScore),
        const improvements: number[] = [],
        
        for(let, i = 1, i < scores.length, i++) {
    
}
            improvements.push(scores[i] - scores[i-1]); }
        return this.statisticalAnalyzer.calculateBasicStatistics(improvements).mean;
    }

    private detectPerformancePlateau(plays: PlayData[]): PlateauDetection {
        if (plays.length < 10) return { isOnPlateau: false, confidence: 0  }
        const recent = plays.slice(-10);
        const scores = recent.map(getPlayScore);
        const stats = this.statisticalAnalyzer.calculateBasicStatistics(scores);
        
        // 変動係数が小さく、改善トレンドがない場合は停滞と判定
        const cv = stats.mean > 0 ? stats.standardDeviation / stats.mean: 0,
        const isLowVariation = cv < PERFORMANCE_THRESHOLDS.plateauVariation;
        const trend = this.calculateImprovementTrend(recent);
        ';'

        return { ''
            isOnPlateau: isLowVariation && trend === 'stable',
            confidence: isLowVariation ? 0.8 : 0.3,
    variationCoefficient: cv,
            trend,' };'

            breakoutStrategy: isLowVariation && trend === 'stable' ? 'try_different_approach' : undefined;

    private calculateRelativePerformance(stageStats: StageStatistics, allStageStats: { [stageId: string]: StageStatistics ): RelativePerformance {
        const allStages = Object.values(allStageStats),
        const avgScores = allStages.map(s => s.scores.mean),
        const overallAvg = avgScores.reduce((sum, score) => sum + score, 0) / avgScores.length,
        
        return { relativeScore: overallAvg > 0 ? stageStats.scores.mean / overallAvg : 0 };
            percentileRank: this.calculatePercentileRank(stageStats.scores.mean, avgScores); }
        }

    private calculatePercentileRank(value: number, allValues: number[]): number { const sortedValues = allValues.slice().sort((a, b) => a - b),
        const rank = sortedValues.filter(v => v <= value).length,
        return (rank / sortedValues.length) * 100,
    private identifyStrengthAreas(stats: StageStatistics): string[] { const strengths: string[] = [],

        if(stats.scores.mean > PERFORMANCE_THRESHOLDS.highScore) strengths.push('高スコア',
        if(stats.accuracy.mean > PERFORMANCE_THRESHOLDS.highAccuracy) strengths.push('高精度',
        if(stats.consistency > PERFORMANCE_THRESHOLDS.highConsistency) strengths.push('安定性'),
        if (stats.improvementTrend === 'improving') strengths.push('継続的改善),'
        
        return strengths }
    private identifyWeaknessAreas(stats: StageStatistics): string[] { const weaknesses: string[] = [],

        if(stats.scores.mean < PERFORMANCE_THRESHOLDS.lowScore) weaknesses.push('低スコア',
        if(stats.accuracy.mean < PERFORMANCE_THRESHOLDS.lowAccuracy) weaknesses.push('低精度',
        if(stats.consistency < PERFORMANCE_THRESHOLDS.lowConsistency) weaknesses.push('不安定',
        if(stats.times.mean > PERFORMANCE_THRESHOLDS.slowTime) weaknesses.push('時間効率',
        
        return weaknesses }
';'

    private analyzeRecentTrend(plays: PlayData[]): ImprovementTrend { const recentPlays = plays.slice(-5),
        if(recentPlays.length < 3) return 'insufficient_data',
        
        return this.calculateImprovementTrend(recentPlays) }

    private detectSeasonalPatterns(plays: PlayData[]): SeasonalPattern { // 簡易的な季節パターン検出（実装は要カスタマイズ）' }'

        return { detected: false, pattern: 'none'
            }
    private calculateNormalizedPerformance(stats: StageStatistics, adjustmentFactor: number): NormalizedPerformance { const normalizedScore = stats.scores.mean / adjustmentFactor,
        const normalizedTime = stats.times.mean * adjustmentFactor,
        const normalizedAccuracy = stats.accuracy.mean,
        
        return { score: normalizedScore,
            time: normalizedTime,
            accuracy: normalizedAccuracy,
    overall: (normalizedScore / 1000 + normalizedAccuracy * 100) / 2 };
            efficiency: normalizedTime > 0 ? normalizedScore / normalizedTime : 0 ;
    } }

    private calculateSkillLevel(stats: StageStatistics, adjustmentFactor: number): SkillLevel { const normalizedPerformance = this.calculateNormalizedPerformance(stats, adjustmentFactor),
        const overall = normalizedPerformance.overall,

        if(overall >= SKILL_LEVEL_THRESHOLDS.expert) return 'expert',
        if(overall >= SKILL_LEVEL_THRESHOLDS.advanced) return 'advanced',
        if(overall >= SKILL_LEVEL_THRESHOLDS.intermediate) return 'intermediate',
        if(overall >= SKILL_LEVEL_THRESHOLDS.beginner) return 'beginner',
        return 'novice' }
    private generateComparisonSummary(stage1Id: string, stage2Id: string, comparisons: { score: SignificanceTestResult, time: SignificanceTestResult,  accuracy: SignificanceTestResult ): string[] {
        const summary: string[] = [],
        
        if (comparisons.score.significant && comparisons.score.testStatistic !== null) {
    
}
            const better = comparisons.score.testStatistic > 0 ? stage1Id: stage2Id 
            summary.push(`スコア: ${better}が有意に優秀`});
        }
        
        if (comparisons.time.significant && comparisons.time.testStatistic !== null) { const faster = comparisons.time.testStatistic < 0 ? stage1Id: stage2Id 
            summary.push(`時間: ${faster}が有意に高速`});
        }
        ';'

        if (comparisons.accuracy.significant && comparisons.accuracy.testStatistic !== null) { const accurate = comparisons.accuracy.testStatistic > 0 ? stage1Id: stage2Id,', '
            summary.push(`精度: ${accurate}が有意に正確`}';'
        }

        return summary.length > 0 ? summary: ['有意な差は検出されませんでした],'
    
    private generatePairwiseRecommendations(stage1Id: string, stage2Id: string, stage1Stats: StageStatistics, stage2Stats: StageStatistics): string[] { const recommendations: string[] = [],
        
        // スコア比較による推奨
        if (stage1Stats.scores.mean < stage2Stats.scores.mean * 0.8) { }
            recommendations.push(`${stage1Id}のスコア向上に注力してください`});
        }
        
        // 時間比較による推奨
        if (stage1Stats.times.mean > stage2Stats.times.mean * 1.2) {
    
}
            recommendations.push(`${stage1Id}の時間効率を改善してください`});
        }
        
        // 精度比較による推奨
        if (stage1Stats.accuracy.mean < stage2Stats.accuracy.mean * 0.9) {
    
}
            recommendations.push(`${stage1Id}の精度向上が必要です`});
        }
        
        return recommendations;
    }

    private calculateCrossStageConsistency(stageStats: { [stageId: string]: StageStatistics ): number {
        const performanceRatings = Object.values(stageStats).map(s => s.performanceRating),
        const stats = this.statisticalAnalyzer.calculateBasicStatistics(performanceRatings),
        return stats.mean > 0 ? 1 - (stats.standardDeviation / stats.mean) : 0,
    private identifyStrongestStages(stageStats: { [stageId: string]: StageStatistics ): StageRanking[] {
        return Object.entries(stageStats),
            .map(([id, stats]) => ({ 
                id, 
                rating: stats.performanceRating,
    percentileRank: this.calculatePercentileRank(stats.performanceRating, Object.values(stageStats).map(s => s.performanceRating) }
            });
            .sort((a, b) => b.rating - a.rating);
            .slice(0, 3);
    }

    private identifyWeakestStages(stageStats: { [stageId: string]: StageStatistics ): StageRanking[] {
        return Object.entries(stageStats),
            .filter(([id, stats]) => stats.playCount >= this.stageConfig.minimumPlaysForAnalysis),
            .map(([id, stats]) => ({ 
                id, 
                rating: stats.performanceRating,
    percentileRank: this.calculatePercentileRank(stats.performanceRating, Object.values(stageStats).map(s => s.performanceRating) }
            });
            .sort((a, b) => a.rating - b.rating);
            .slice(0, 3);
    }

    private identifyImprovementOpportunities(stageStats: { [stageId: string]: StageStatistics ): ImprovementOpportunity[] {
        const opportunities: ImprovementOpportunity[] = [],
        
        for(const [stageId, stats] of Object.entries(stageStats) {
        ','

            if(stats.playCount < this.stageConfig.minimumPlaysForAnalysis) continue,

            if (stats.improvementTrend === 'declining') {
                opportunities.push({ '
                    stage: stageId,
                    type: 'declining_performance',
                    priority: 'high',','
                    description: 'パフォーマンスが低下傾向にあります'
            }
                    estimatedImpact: 0.8); 
    }

            if (stats.consistency < 0.5) { opportunities.push({ '
                    stage: stageId,
                    type: 'inconsistent_performance',
                    priority: 'medium',','
                    description: 'パフォーマンスが不安定です'
            }
                    estimatedImpact: 0.6); 
    }

            if (stats.accuracy.mean < 0.7) { opportunities.push({ '
                    stage: stageId,
                    type: 'low_accuracy',
                    priority: 'high',','
                    description: '精度が低く改善が必要です'
            }
                    estimatedImpact: 0.9); 
    }
        
        return opportunities.sort((a, b) => (b.estimatedImpact || 0) - (a.estimatedImpact || 0));
    }

    private analyzeMasteryProgression(stageStats: { [stageId: string]: StageStatistics ): MasteryProgression {
        const masteryLevels = Object.entries(stageStats),
            .filter(([id, stats]) => stats.playCount >= this.stageConfig.minimumPlaysForAnalysis),
            .map(([id, stats]) => ({
                stage: id,
                mastery: stats.masteryLevel || 0,
    difficulty: stats.difficultyLevel 
 }
            });
        const overallMastery = masteryLevels.length > 0 ;
            ? masteryLevels.reduce((sum, m) => sum + m.mastery, 0) / masteryLevels.length: 0,
        
        return { overallMastery,
            masteryByDifficulty: this.groupMasteryByDifficulty(masteryLevels,
    progressionRate: this.calculateProgressionRate(masteryLevels) };
            nextMilestone: this.determineNextMilestone(overallMastery), 
    }

    private groupMasteryByDifficulty(masteryLevels: Array<{ stage: string, mastery: number,  difficulty: DifficultyLevel )>): { [difficulty: string]: number; {
        const grouped: { [difficulty: string]: number[], = {}
        for (const level of masteryLevels) {
            if (!grouped[level.difficulty]) {
        }
                grouped[level.difficulty] = []; }
            grouped[level.difficulty].push(level.mastery);
        }
        
        // 各難易度の平均マスタリーレベル計算
        const result: { [difficulty: string]: number, = {}
        for(const [difficulty, masteries] of Object.entries(grouped) { result[difficulty] = masteries.reduce((sum, m) => sum + m, 0) / masteries.length }
        return result;
    }

    private calculateProgressionRate(masteryLevels: Array<{ stage: string, mastery: number,  difficulty: DifficultyLevel )>'): number {'
        // 難易度順でのマスタリー進歩率を計算
        const difficultyOrder: DifficultyLevel[] = ['easy', 'normal', 'hard', 'expert'],
        const progression: number[] = [],
        
        for(let, i = 0, i < difficultyOrder.length - 1, i++) {
        
            const current = masteryLevels.filter(m => m.difficulty === difficultyOrder[i]),
            const next = masteryLevels.filter(m => m.difficulty === difficultyOrder[i + 1]),
            
            if (current.length > 0 && next.length > 0) {
                const currentAvg = current.reduce((sum, m) => sum + m.mastery, 0) / current.length,
                const nextAvg = next.reduce((sum, m) => sum + m.mastery, 0) / next.length }
                progression.push(nextAvg - currentAvg); }
        }
        
        return progression.length > 0 ;
            ? progression.reduce((sum, p) => sum + p, 0) / progression.length: 0,

    private determineNextMilestone(overallMastery: number): string { ''
        if(overallMastery < 0.3) return '基本スキルの習得',
        if(overallMastery < 0.6) return '中級レベルへの到達',
        if(overallMastery < 0.8) return '上級スキルの開発',
        if(overallMastery < 0.95) return '専門性の向上',
        return 'マスタリーの維持' }
    /**
     * 設定の更新
     */
    updateConfig(newConfig: Partial<StageConfig>): void {
        this.stageConfig = { ...this.stageConfig, ...newConfig }

    /**
     * 難易度調整係数の更新
     */
    updateDifficultyAdjustments(newAdjustments: Partial<Record<DifficultyLevel, number>>): void {
        this.difficultyAdjustments = { ...this.difficultyAdjustments, ...newAdjustments }

    /**
     * 設定の取得
     */
    getConfig(): StageConfig {
        return { ...this.stageConfig }

    /**
     * 難易度調整係数の取得'
     */''
    getDifficultyAdjustments();