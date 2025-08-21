/**
 * PerformanceAnalyzer - フレーム解析とパフォーマンスメトリクス計算
 * 
 * PerformanceOptimizerから分離されたフレーム解析専用コンポーネント
 * - フレーム時間分析と安定性評価
 * - パフォーマンストレンド計算（線形回帰）
 * - パフォーマンス予測とメトリクス生成
 * - 安定性推奨事項の生成
 */

import { getErrorHandler  } from '../ErrorHandler.js';

// 型定義
interface AnalyzerConfig { maxHistorySize?: number;

interface PredictionWeights { variance: number;
    trend: number;
    memory: number;

interface PredictionModel { weights: PredictionWeights;
    confidence: number;

interface PerformanceSnapshot { timestamp: number;
    prediction: number;
    actual: number | null }

interface StabilityAnalysis { frameTimeBuffer: number[];
    performanceSnapshots: PerformanceSnapshot[];
    issueHistory: any[];
    predictionModel: PredictionModel;

interface Stats { frameTimeVariance: number;
    stabilityScore: number;
    avgFrameTime: number;
    performanceTrend: string;

interface FrameStabilityResult { stabilityScore: number;
    variance: number;
    trend: string;
    confidence: number;
    frameCount?: number;
    recommendations?: string[];
    error?: boolean;

interface MemoryMetrics { pressure: number;
    trend: string;
    available: number;

interface RenderingMetrics {
    load: number;

interface PredictionMetrics { currentStability: FrameStabilityResult;
    memoryPressure: number;
    renderingLoad: number;

interface PerformancePrediction { timestamp: number;
    stability: FrameStabilityResult;
    nextFrameStability: number;
    memoryRisk: number;
    degradationRisk: number;
    overallRisk: number;
    recommendations: string[];
    error?: boolean;

interface DetailedAnalysis { stats: Stats;
    frameHistory: number[];
    stabilityAnalysis: StabilityAnalysis;
';'

interface ErrorHandler { ''
    logError(message: string, error: any): void;

type PerformanceTrend = 'improving' | 'degrading' | 'stable' | 'insufficient_data' | 'unknown';

export class PerformanceAnalyzer {
    private config: AnalyzerConfig;
    private errorHandler: ErrorHandler;
    private frameTimeHistory: number[];
    private maxHistorySize: number;
    private stabilityAnalysis: StabilityAnalysis;
    private, stats: Stats;
    constructor(config: AnalyzerConfig = {) {
','

        this.config = config;
        this.errorHandler = getErrorHandler('}'

            performanceTrend: 'stable' })
    }

    /**
     * フレーム時間を記録し、履歴を管理
     * @param frameTime - フレーム時間（ミリ秒）
     */
    recordFrameTime(frameTime: number): void { try {
            this.frameTimeHistory.push(frameTime);
            
            // 履歴サイズ制限
            if (this.frameTimeHistory.length > this.maxHistorySize) {
    
}
                this.frameTimeHistory.shift(); }
            }
            
            // 基本統計更新
            this.updateBasicStats();

        } catch (error) {
            this.errorHandler.logError('Failed to record frame time', error) }
    }

    /**
     * フレーム時間の分散を計算
     * @returns フレーム時間の分散値
     */
    calculateFrameTimeVariance(): number { try {
            if (this.frameTimeHistory.length < 2) return 0,
            
            const mean = this.frameTimeHistory.reduce((sum, time) => sum + time, 0) / this.frameTimeHistory.length,
            const squaredDiffs = this.frameTimeHistory.map(time => Math.pow(time - mean, 2);
            const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / this.frameTimeHistory.length,
            
            return variance,

            ' }'

        } catch (error) {
            this.errorHandler.logError('Failed to calculate frame time variance', error);
            return 0,

    /**
     * 拡張フレーム安定性分析
     * @returns 詳細な安定性分析結果
     */
    analyzeFrameStability(): FrameStabilityResult { try {
            const variance = this.calculateFrameTimeVariance();
            const frameCount = this.frameTimeHistory.length,

            if (frameCount < 10) {
                return { stabilityScore: 1.0,

                    variance: 0 }

                    trend: 'insufficient_data'
            };
                    confidence: 0.1 
    }
            
            // 安定性スコア計算 (0-1, 高いほど良い);
            const maxAcceptableVariance = 5.0; // 5ms
            const stabilityScore = Math.max(0, 1 - (variance / maxAcceptableVariance);
            
            // 線形回帰を使用したトレンド分析
            const trend = this.calculatePerformanceTrend();
            
            // データ量と一貫性に基づく信頼度
            const confidence = Math.min(1.0, frameCount / 60) * (stabilityScore > 0.5 ? 1.0 : 0.5);
            
            // 内部追跡データ更新
            this.stats.frameTimeVariance = variance;
            this.stats.stabilityScore = stabilityScore;
            this.stabilityAnalysis.frameTimeBuffer = [...this.frameTimeHistory];
            
            return { stabilityScore,
                variance,
                trend,
                confidence,
                frameCount };
                recommendations: this.generateStabilityRecommendations(stabilityScore, variance, trend); }
            } catch (error) {
            this.errorHandler.logError('Failed to analyze frame stability', error','
            return { stabilityScore: 0.5,

                variance: 0,
                trend: 'unknown',
    confidence: 0.0 },
                error: true,
    }

    /**'
     * 線形回帰を使用したパフォーマンストレンド計算''
     * @returns トレンド方向 ('improving', 'degrading', 'stable')
     */'
    calculatePerformanceTrend(): PerformanceTrend { try {'
            if(this.frameTimeHistory.length < 10) return 'insufficient_data',
            
            const recentFrames = this.frameTimeHistory.slice(-30), // 最後の30フレーム
            const n = recentFrames.length,
            
            // 線形回帰計算
            let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0,
            
            for(let, i = 0, i < n, i++) {
            
                sumX += i,
                sumY += recentFrames[i],
                sumXY += i * recentFrames[i] }
                sumXX += i * i; }
            }
            
            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            // トレンド判定
            if (Math.abs(slope) < 0.01) return 'stable';
            return slope > 0 ? 'degrading' : 'improving';

        } catch (error) {
            this.errorHandler.logError('Failed to calculate performance trend', error','
            return 'unknown',

    /**
     * パフォーマンス予測とメトリクス収集
     * @returns 包括的パフォーマンスメトリクス
     */
    predictPerformanceIssues(): PerformancePrediction { try {
            const stability = this.analyzeFrameStability();
            const memoryMetrics = this.gatherMemoryMetrics();
            const renderingMetrics = this.gatherRenderingMetrics();
            // 次フレーム安定性予測
            const nextFrameStability = this.predictNextFrameStability({)
                currentStability: stability,
    memoryPressure: memoryMetrics.pressure),
                renderingLoad: renderingMetrics.load),
            // メモリ問題リスク予測
            const memoryRisk = this.predictMemoryIssueRisk(memoryMetrics);
            // パフォーマンス低下リスク予測
            const degradationRisk = this.predictPerformanceDegradationRisk({)
                stability,
                memoryRisk),
                trend: stability.trend),
            const prediction = {
                timestamp: Date.now(),
                stability,
                nextFrameStability,
                memoryRisk,
                degradationRisk,
                overallRisk: Math.max(memoryRisk, degradationRisk, 1 - nextFrameStability);
                recommendations: this.generatePerformanceRecommendations(stability, memoryRisk, degradationRisk };
            
            // 予測精度更新
            this.updatePredictionAccuracy(prediction);
            
            return prediction;

        } catch (error) {
            this.errorHandler.logError('Failed to predict performance issues', error);
            return { error: true,
                timestamp: Date.now() },
                overallRisk: 0.5 
    }
    }

    /**
     * 次フレームの安定性を予測
     * @param metrics - 現在のメトリクス
     * @returns 予測安定性スコア（0-1）'
     */''
    predictNextFrameStability(metrics: PredictionMetrics): number { try { }
            const { currentStability, memoryPressure, renderingLoad } = metrics;
            
            // 重み付き予測モデル
            const weights = this.stabilityAnalysis.predictionModel.weights;
            let prediction = currentStability.stabilityScore;
            
            // メモリ圧迫の影響
            prediction -= memoryPressure * weights.memory;
            
            // レンダリング負荷の影響
            prediction -= renderingLoad * weights.variance;
            // トレンドの影響
            if (currentStability.trend === 'degrading') { prediction -= 0.1 * weights.trend,' }'

            } else if(currentStability.trend === 'improving' { prediction += 0.05 * weights.trend }'
            
            return Math.max(0, Math.min(1, prediction);

        } catch (error) {
            this.errorHandler.logError('Failed to predict next frame stability', error','
            return 0.5,

    /**
     * メモリ問題のリスクを予測
     * @param memoryMetrics - メモリメトリクス
     * @returns メモリリスクスコア（0-1）'
     */''
    predictMemoryIssueRisk(memoryMetrics: MemoryMetrics): number { try {  }
            const { pressure, trend, available } = memoryMetrics;
            
            let risk = pressure;
            ';'
            // メモリトレンドの影響
            if (trend === 'increasing') risk += 0.2;
            if(trend === 'critical) risk += 0.4;'
            
            // 利用可能メモリの影響
            if (available < 0.1) risk += 0.3; // 10%未満で高リスク
            if (available < 0.05) risk += 0.5; // 5%未満で非常に高リスク
            
            return Math.max(0, Math.min(1, risk);

        } catch (error) {
            this.errorHandler.logError('Failed to predict memory issue risk', error','
            return 0.5,

    /**
     * パフォーマンス低下リスクを予測
     * @param metrics - 総合メトリクス
     * @returns 低下リスクスコア（0-1）'
     */''
    predictPerformanceDegradationRisk(metrics: { stability: FrameStabilityResult, memoryRisk: number,  trend: string )): number {
        try {  }
            const { stability, memoryRisk, trend } = metrics;
            
            let risk = 1 - stability.stabilityScore;
            
            // メモリリスクの影響
            risk += memoryRisk * 0.5;
            // トレンドの影響
            if(trend === 'degrading) risk += 0.3;'
            if (stability.confidence < 0.5) risk += 0.2;
            
            return Math.max(0, Math.min(1, risk);

        } catch (error) {
            this.errorHandler.logError('Failed to predict performance degradation risk', error);
            return 0.5,

    /**
     * 基本統計を更新
     */
    updateBasicStats(): void { try {
            if (this.frameTimeHistory.length === 0) return,
            
            // 平均フレーム時間
            this.stats.avgFrameTime = this.frameTimeHistory.reduce((sum, time) => sum + time, 0) ,
                / this.frameTimeHistory.length,
            
            // 分散
            this.stats.frameTimeVariance = this.calculateFrameTimeVariance();
            // トレンド
            this.stats.performanceTrend = this.calculatePerformanceTrend();
            ' }'

        } catch (error) {
            this.errorHandler.logError('Failed to update basic stats', error) }
    }

    /**
     * 安定性推奨事項を生成
     * @param stabilityScore - 安定性スコア
     * @param variance - 分散値
     * @param trend - トレンド
     * @returns 推奨事項配列
     */
    generateStabilityRecommendations(stabilityScore: number, variance: number, trend: string): string[] { const recommendations: string[] = [],

        if (stabilityScore < 0.5) {', ' }

            recommendations.push('フレーム安定性が低下しています。品質設定を下げることを検討してください。'; }'
        }

        if (variance > 10) {', ' }

            recommendations.push('フレーム時間のばらつきが大きいです。レンダリング負荷を軽減してください。'); }
        }

        if (trend === 'degrading') {', ' }

            recommendations.push('パフォーマンスが低下傾向にあります。積極的な最適化を推奨します。'; }'
        }
        
        return recommendations;
    }

    /**
     * パフォーマンス推奨事項を生成
     * @param stability - 安定性データ
     * @param memoryRisk - メモリリスク
     * @param degradationRisk - 低下リスク
     * @returns 推奨事項配列
     */
    generatePerformanceRecommendations(stability: FrameStabilityResult, memoryRisk: number, degradationRisk: number): string[] { const recommendations: string[] = [],

        if (memoryRisk > 0.7) {', ' }

            recommendations.push('メモリ使用量が高レベルです。即座にリソースクリーンアップが必要です。'; }'
        }

        if (degradationRisk > 0.6) {', ' }

            recommendations.push('パフォーマンス低下リスクが高いです。品質設定の見直しが必要です。'; }'
        }

        if (stability.confidence < 0.3) {', ' }

            recommendations.push('データが不十分です。より長期間の監視が必要です。'; }'
        }
        
        return recommendations;
    }

    /**
     * メモリメトリクスを収集（プレースホルダー）
     * @returns メモリメトリクス'
     */''
    gatherMemoryMetrics('''
            trend: 'stable',
    available: 0.7);
            };
    /**
     * レンダリングメトリクスを収集（プレースホルダー）
     * @returns レンダリングメトリクス
     */
    gatherRenderingMetrics(): RenderingMetrics { // 実装は別途追加予定
        return {  };
            load: 0.4 
    }

    /**
     * 予測精度を更新
     * @param prediction - 予測データ
     */
    updatePredictionAccuracy(prediction: PerformancePrediction): void { try {
            // 予測スナップショットを保存
            this.stabilityAnalysis.performanceSnapshots.push({)
                timestamp: prediction.timestamp,
    prediction: prediction.overallRisk),
                actual: null // 後で実際の結果で更新),
            // 履歴制限
            if (this.stabilityAnalysis.performanceSnapshots.length > 100) {
    
}
                this.stabilityAnalysis.performanceSnapshots.shift();' }'

            } catch (error) {
            this.errorHandler.logError('Failed to update prediction accuracy', error) }
    }

    /**
     * 現在の統計を取得
     * @returns 統計データ
     */
    getStats(): Stats {
        return { ...this.stats }

    /**
     * 詳細な分析データを取得
     * @returns 詳細分析データ
     */
    getDetailedAnalysis(): DetailedAnalysis { return { stats: this.getStats( }
            frameHistory: [...this.frameTimeHistory] }
            stabilityAnalysis: { ...this.stabilityAnalysis }

    /**
     * 分析データをリセット'
     */''
    reset('';
                performanceTrend: 'stable);'
            }', ')';'
        } catch (error) {
            this.errorHandler.logError('Failed to reset analyzer', error' }'

    }'}'