/**
 * Quality Decision Analyzer
 * 品質決定分析 - 品質調整の必要性判定、パフォーマンススコア計算、トレンド分析を担当
 */

// 型定義
interface PerformanceMetrics { fps?: number;
    frameTime?: number;
    memoryUsage?: number;
    droppedFrames?: number; }

interface CurrentQuality { level: string,
    index?: number }

interface PerformanceAverages { fps: number[];
    frameTime: number[];
    memoryUsage: number[];
    dropFrameCount: number;
    performanceScore: number }

interface AnalysisConfig { sampleSize: number;
    performanceThresholds: {
        excellent: number;
        good: number;
        fair: number;
        poor: number;
        critical: number };
    trendAnalysis: { windowSize: number;
        significantChange: number;
        trendStability: number }

interface TrendHistoryEntry { trend: string,
    stability: number;
    timestamp: number ,}

interface TrendAnalysis { trend: string;
    strength: number;
    stability: number;
    direction: number;
    correlation?: number;
    variance?: number; }

interface QualityDecision { needsAdjustment: boolean,
    recommendedLevel: string;
    reason: string;
    confidence: number;
    currentLevel?: string;
    currentIndex?: number;
    performanceScore?: number;
    trend?: string;
    timestamp?: number; ,}

interface EvaluationResult { needsAdjustment: boolean,
    recommendedLevel: string;
    reason: string;
    confidence: number;
    performanceScore: number;
    trend: TrendAnalysis;
    timestamp: number ,}

interface LinearTrend { slope: number;
    correlation: number;
    variance: number }

interface PerformanceStats { averageFPS: number;
    averageFrameTime: number;
    averageMemoryUsage: number;
    dropFrameCount: number;
    performanceScore: number;
    trendHistory: TrendHistoryEntry[];
    stabilityCounter: number;
    lastDecision: QualityDecision | null }

export class QualityDecisionAnalyzer {
    private performanceAverages: PerformanceAverages;
    private analysisConfig: AnalysisConfig;
    private trendHistory: TrendHistoryEntry[];
    private stabilityCounter: number;
    private lastDecision: QualityDecision | null;
    constructor() {

        // パフォーマンス統計
        this.performanceAverages = {
            fps: [];
            frameTime: [];
            memoryUsage: [];
            dropFrameCount: 0;
    }
            performanceScore: 0 }
        };
        // 分析設定
        this.analysisConfig = { sampleSize: 30, // 30フレームの平均を計算
            performanceThresholds: {
                excellent: 0.9, // 90%以上;
                good: 0.75,     // 75%以上;
                fair: 0.6,      // 60%以上;
                poor: 0.4,      // 40%以上;
                critical: 0.2   // 20%以上 ,};
            trendAnalysis: { windowSize: 10;
                significantChange: 0.1, // 10%の変化で有意とみなす;
                trendStability: 5 // 5回連続で同じトレンドなら安定 ,}
        };
        // トレンド追跡
        this.trendHistory = [];
        this.stabilityCounter = 0;
        this.lastDecision = null;
    }
    
    /**
     * 品質調整の必要性を評価
     * @param {Object} performanceMetrics - パフォーマンス指標
     * @param {Object} currentQuality - 現在の品質設定
     * @returns {Object} 評価結果
     */
    evaluateQualityAdjustment(performanceMetrics: PerformanceMetrics, currentQuality: CurrentQuality): EvaluationResult { try {
            // パフォーマンス平均を更新
            this.updatePerformanceAverages(performanceMetrics);
            
            // パフォーマンススコアを計算
            const performanceScore = this.calculatePerformanceScore();
            
            // トレンド分析を実行
            const trendAnalysis = this.analyzePerformanceTrend();
            
            // 品質調整決定を実行
            const decision = this.analyzeQualityDecision(;
                performanceScore);
                trendAnalysis, );
                currentQuality);
            
            // 決定履歴を更新
            this.updateDecisionHistory(decision);
            
            return { needsAdjustment: decision.needsAdjustment,
                recommendedLevel: decision.recommendedLevel;
                reason: decision.reason;
                confidence: decision.confidence;
                performanceScore: performanceScore;
                trend: trendAnalysis, };
                timestamp: Date.now(); }
            } catch (error) { console.error('[QualityDecisionAnalyzer] Error in evaluation:', error);

            return { needsAdjustment: false,''
                reason: 'evaluation_error';
                confidence: 0,
                performanceScore: 0.5,
                recommendedLevel: 'medium',
                trend: 'stable', };
                timestamp: Date.now(); }
            }
    }
    
    /**
     * 品質調整決定の詳細分析
     * @param {number} performanceScore - パフォーマンススコア
     * @param {Object} trendAnalysis - トレンド分析結果
     * @param {Object} currentQuality - 現在の品質設定
     * @returns {Object} 決定結果'
     */''
    analyzeQualityDecision(performanceScore: number, trendAnalysis: TrendAnalysis, currentQuality: CurrentQuality): QualityDecision { const currentLevel = currentQuality.level;
        const currentIndex = currentQuality.index || 2;
        
        // 基本的な品質決定ロジック
        let recommendedLevel = currentLevel;
        let needsAdjustment = false;''
        let reason = 'performance_stable';
        let confidence = 0.5;
        
        // パフォーマンススコアに基づく初期判定
        if(performanceScore >= this.analysisConfig.performanceThresholds.excellent) {
            // 優秀なパフォーマンス：品質向上を検討
            if (currentIndex < 4) {''
                recommendedLevel = this.getQualityLevelByIndex(currentIndex + 1);

                needsAdjustment = true;''
                reason = 'performance_excellent';
        }
                confidence = 0.8; }
} else if (performanceScore < this.analysisConfig.performanceThresholds.fair) { // 公正以下のパフォーマンス：品質低下を検討
            if(currentIndex > 0) {

                recommendedLevel = this.getQualityLevelByIndex(currentIndex - 1);

                needsAdjustment = true;''
                reason = 'performance_poor';
            }
                confidence = 0.9; }
}
        ';
        // トレンド分析による調整
        if(trendAnalysis.trend === 'declining' && trendAnalysis.stability >= 3) {'
            if (currentIndex > 0) {''
                recommendedLevel = this.getQualityLevelByIndex(currentIndex - 1);

                needsAdjustment = true;''
                reason = 'performance_declining';

        }

                confidence = Math.min(confidence + 0.2, 1.0); }

            }''
        } else if (trendAnalysis.trend === 'improving' && trendAnalysis.stability >= 5) { if (currentIndex < 4 && performanceScore >= this.analysisConfig.performanceThresholds.good) {''
                recommendedLevel = this.getQualityLevelByIndex(currentIndex + 1);

                needsAdjustment = true;''
                reason = 'performance_improving';
                confidence = Math.min(confidence + 0.1, 0.9); }
        }
        
        // 極端な状況への対応
        if(performanceScore < this.analysisConfig.performanceThresholds.critical) {
            // 緊急品質低下
            recommendedLevel = this.getQualityLevelByIndex(Math.max(0, currentIndex - 2));

            needsAdjustment = true;''
            reason = 'performance_critical';
        }
            confidence = 1.0; }
        }
        
        return { needsAdjustment,
            recommendedLevel,
            reason,
            confidence,
            currentLevel,
            currentIndex,
            performanceScore, };
            trend: trendAnalysis.trend }
        }
    
    /**
     * パフォーマンストレンドを分析
     * @returns {Object} トレンド分析結果
     */
    analyzePerformanceTrend(): TrendAnalysis { const windowSize = this.analysisConfig.trendAnalysis.windowSize;
        const significantChange = this.analysisConfig.trendAnalysis.significantChange;

        if(this.performanceAverages.fps.length < windowSize) {'
            return { ''
                trend: 'insufficient_data';
                strength: 0;
        }
                stability: 0, };
                direction: 0 }
            }
        
        // 最近のパフォーマンス傾向を計算
        const recentScores = this.performanceAverages.fps;
            .slice(-windowSize);
            .map((fps) => this.calculatePerformanceScoreFromFPS(fps);
        
        // 線形回帰による傾向分析
        const trend = this.calculateLinearTrend(recentScores);
        // 傾向の安定性を評価
        const stability = this.evaluateTrendStability(trend);
        ';
        // 傾向の分類
        let trendCategory = 'stable';''
        if (Math.abs(trend.slope) >= significantChange') { ''
            trendCategory = trend.slope > 0 ? 'improving' : 'declining'; }
        
        // 傾向履歴を更新
        this.updateTrendHistory(trendCategory, stability);
        
        return { trend: trendCategory,
            strength: Math.abs(trend.slope);
            stability: stability;
            direction: Math.sign(trend.slope);
            correlation: trend.correlation, };
            variance: trend.variance }
        }
    
    /**
     * パフォーマンス平均を更新
     * @param {Object} metrics - パフォーマンス指標
     */
    updatePerformanceAverages(metrics: PerformanceMetrics): void { const sampleSize = this.analysisConfig.sampleSize;
        
        // FPS平均を更新
        this.performanceAverages.fps.push(metrics.fps || 60);
        if(this.performanceAverages.fps.length > sampleSize) {
            
        }
            this.performanceAverages.fps.shift(); }
        }
        
        // フレーム時間平均を更新
        const frameTime = metrics.frameTime || (1000 / (metrics.fps || 60));
        this.performanceAverages.frameTime.push(frameTime);
        if (this.performanceAverages.frameTime.length > sampleSize) { this.performanceAverages.frameTime.shift(); }
        
        // メモリ使用量平均を更新
        if(metrics.memoryUsage) {
            this.performanceAverages.memoryUsage.push(metrics.memoryUsage);
            if (this.performanceAverages.memoryUsage.length > sampleSize) {
        }
                this.performanceAverages.memoryUsage.shift(); }
}
        
        // ドロップフレーム数を追跡
        if (metrics.droppedFrames) { this.performanceAverages.dropFrameCount += metrics.droppedFrames; }
    }
    
    /**
     * パフォーマンススコアを計算
     * @returns {number} パフォーマンススコア (0-1)
     */
    calculatePerformanceScore(): number { if (this.performanceAverages.fps.length === 0) {
            return 0.5; // デフォルトスコア }
        
        // FPSスコア計算
        const avgFPS = this.calculateAverage(this.performanceAverages.fps);
        const fpsScore = this.calculatePerformanceScoreFromFPS(avgFPS);
        
        // フレーム時間の安定性スコア
        const frameTimeVariance = this.calculateVariance(this.performanceAverages.frameTime);
        const stabilityScore = Math.max(0, 1 - (frameTimeVariance / 100); // 100ms以上の分散で大幅減点
        
        // メモリ使用量スコア
        let memoryScore = 1.0;
        if(this.performanceAverages.memoryUsage.length > 0) {
            const avgMemory = this.calculateAverage(this.performanceAverages.memoryUsage);
            // メモリ使用量が80%超で減点開始
        }
            memoryScore = avgMemory > 0.8 ? Math.max(0, 2 - (avgMemory / 0.4) : 1.0; }
        }
        
        // ドロップフレームペナルティ
        const dropFramePenalty = Math.min(0.3, this.performanceAverages.dropFrameCount * 0.01);
        
        // 総合スコア計算
        const compositeScore = (fpsScore * 0.5 + stabilityScore * 0.3 + memoryScore * 0.2) - dropFramePenalty;
        
        this.performanceAverages.performanceScore = Math.max(0, Math.min(1, compositeScore);
        return this.performanceAverages.performanceScore;
    }
    
    /**
     * FPSからパフォーマンススコアを計算
     * @param {number} fps - FPS値
     * @returns {number} スコア (0-1)
     */
    calculatePerformanceScoreFromFPS(fps: number): number { // 60FPS = 1.0, 30FPS = 0.5, 0FPS = 0.0
        return Math.max(0, Math.min(1, fps / 60); }
    
    /**
     * 線形トレンドを計算
     * @param {Array} values - 値の配列
     * @returns {Object} トレンド情報
     */
    calculateLinearTrend(values: number[]): LinearTrend { const n = values.length; }
        if (n < 2) return { slope: 0, correlation: 0, variance: 0 ,}
        const x = Array.from({ length: n ), (_, i) => i);
        const y = values;
        
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const correlation = (n * sumXY - sumX * sumY) / ;
            Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
        
        const meanY = sumY / n;
        const variance = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0) / n;
         }
        return { slope, correlation, variance }
    
    /**
     * トレンドの安定性を評価
     * @param {Object} trend - トレンド情報
     * @returns {number} 安定性スコア
     */
    evaluateTrendStability(trend: LinearTrend): number { // 相関係数の絶対値が高いほど安定
        return Math.abs(trend.correlation || 0); }
    
    /**
     * トレンド履歴を更新
     * @param {string} trendCategory - トレンドカテゴリ
     * @param {number} stability - 安定性
     */
    updateTrendHistory(trendCategory: string, stability: number): void { this.trendHistory.push({)
            trend: trendCategory,);
            stability: stability);
            timestamp: Date.now( ,});
        
        // 履歴サイズの制限
        if (this.trendHistory.length > 50) { this.trendHistory.shift(); }
        
        // 安定性カウンターの更新
        if(this.trendHistory.length >= 2) {
            const previousTrend = this.trendHistory[this.trendHistory.length - 2].trend;
            if (previousTrend === trendCategory) {
        }
                this.stabilityCounter++; }
            } else { this.stabilityCounter = 1; }
}
    
    /**
     * 決定履歴を更新
     * @param {Object} decision - 決定結果
     */
    updateDecisionHistory(decision: QualityDecision): void { this.lastDecision = {
            ...decision,
            timestamp: Date.now( ,}
    
    /**
     * 品質レベルをインデックスで取得
     * @param {number} index - 品質インデックス
     * @returns {string} 品質レベル名
     */''
    getQualityLevelByIndex(index: number): string {;
        const levels = ['low', 'medium', 'high', 'ultra'];''
        return levels[Math.max(0, Math.min(3, index))] || 'medium'; }
    
    /**
     * 配列の平均を計算
     * @param {Array} arr - 数値配列
     * @returns {number} 平均値
     */
    calculateAverage(arr: number[]): number { return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length: 0, 
    }
    
    /**
     * 配列の分散を計算
     * @param {Array} arr - 数値配列
     * @returns {number} 分散
     */
    calculateVariance(arr: number[]): number { if (arr.length === 0) return 0;
        const mean = this.calculateAverage(arr);
        const variance = arr.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / arr.length;
        return variance;
    
    /**
     * 現在のパフォーマンス統計を取得
     * @returns {Object} パフォーマンス統計
     */
    getPerformanceStats(): PerformanceStats { return { averageFPS: this.calculateAverage(this.performanceAverages.fps),
            averageFrameTime: this.calculateAverage(this.performanceAverages.frameTime);
            averageMemoryUsage: this.calculateAverage(this.performanceAverages.memoryUsage);
            dropFrameCount: this.performanceAverages.dropFrameCount;
            performanceScore: this.performanceAverages.performanceScore;
            trendHistory: this.trendHistory.slice(-10), // 最近10件;
            stabilityCounter: this.stabilityCounter, };
            lastDecision: this.lastDecision }
        }
    
    /**
     * 統計をリセット
     */''
    resetStats(');