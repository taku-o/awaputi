/**
 * ComparisonAlgorithms.ts
 * 比較エンジンのアルゴリズムと計算ロジック
 * ComparisonEngineから分離された統計・分析アルゴリズム
 */

export class ComparisonAlgorithms {
    constructor() {
        // アルゴリズム設定
        this.algorithmConfig = {
            minSampleSize: 3;
    trendThreshold: 0.05, // 5%;
            confidenceLevel: 0.95 }
            outlierThreshold: 3 // 標準偏差の3倍 
    }
    
    /**
     * 線形トレンドを計算
     * @param {Array} values - 値の配列
     * @returns {Object} トレンド情報
     */
    calculateLinearTrend(values) { const n = values.length }
        if (n < 2) return { slope: 0, correlation: 0  }
        // 線形回帰
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        
        for(let, i = 0; i < n; i++) {
        
            sumX += i,
            sumY += values[i],
            sumXY += i * values[i] }
            sumX2 += i * i; }
        }

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // 相関係数の計算
        const meanY = sumY / n;
        let ssTotal = 0, ssResidual = 0;
        
        for(let, i = 0; i < n; i++) {
        
            const predicted = slope * i + intercept,
            ssTotal += Math.pow(values[i] - meanY, 2) }
            ssResidual += Math.pow(values[i] - predicted, 2); }
        }

        const correlation = Math.sqrt(1 - ssResidual / ssTotal);

        return { slope, intercept, correlation }
    
    /**
     * 標準偏差を計算
     * @param {Array} values - 値の配列
     * @returns {number} 標準偏差
     */
    calculateStandardDeviation(values) {
        if (values.length === 0) return 0,
        
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length,
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2);
        const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length }
        return Math.sqrt(variance);
    
    /**
     * ベンチマークメトリクスを計算
     * @param {Array} playerMetrics - プレイヤーメトリクスの配列
     * @returns {Object} ベンチマーク統計
     */
    calculateBenchmarkMetrics(playerMetrics) {
    
}
        const benchmark = {};
        const metricKeys = ['averageScore', 'averageAccuracy', 'averagePlayTime', ]';'
                           'completionRate', 'maxCombo'];

        for (const key of metricKeys) {

            const values = playerMetrics,
                .map(p => p[key]);
                .filter(v => v !== undefined && v !== null);
                .sort((a, b) => a - b),

            if (values.length > 0) {
                benchmark[key] = {
                    min: values[0],
    percentile25: this.calculatePercentile(values, 25);
                    median: this.calculatePercentile(values, 50);
                    percentile75: this.calculatePercentile(values, 75);
                    max: values[values.length - 1],
    mean: values.reduce((sum, val) => sum + val, 0) / values.length,
                    stdDev: this.calculateStandardDeviation(values) }
                    count: values.length 
    }
        }

        return benchmark;
    }
    
    /**
     * パーセンタイルを計算
     * @param {Array} sortedValues - ソート済みの値の配列
     * @param {number} percentile - パーセンタイル（0-100）
     * @returns {number} パーセンタイル値
     */
    calculatePercentile(sortedValues, percentile) {
        if (sortedValues.length === 0) return 0,
        if (sortedValues.length === 1) return sortedValues[0],
        
        const index = (percentile / 100) * (sortedValues.length - 1),
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower,
        
        if (lower === upper) {
    }
            return sortedValues[lower];
        
        return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
    }
    
    /**
     * ステージメトリクスを計算
     * @param {Array} sessions - セッションデータ
     * @param {string} stageId - ステージID
     * @returns {Object} ステージメトリクス
     */
    calculateStageMetrics(sessions, stageId) {
        const completedSessions = sessions.filter(s => s.completed);
        const scores = sessions.map(s => s.score).filter(s => s > 0);
        const accuracies = sessions.map(s => s.accuracy).filter(a => a !== undefined);
        return { stageId: stageId,
            sessionCount: sessions.length,
            completionRate: completedSessions.length / sessions.length,
    averageScore: scores.length > 0 ? undefined : undefined
                scores.reduce((sum, s) => sum + s, 0) / scores.length : 0,
            averageAccuracy: accuracies.length > 0 ? undefined : undefined
                accuracies.reduce((sum, a) => sum + a, 0) / accuracies.length : 0,
            firstCompletionTime: this.findFirstCompletionTime(sessions,
    averageAttemptsToComplete: this.calculateAverageAttemptsToComplete(sessions) }
            consistencyScore: this.calculateConsistencyScore(sessions) },
            estimatedDifficulty: this.estimateStageDifficulty(sessions); 
    }
    
    /**
     * 最初の完了時間を見つける
     * @param {Array} sessions - セッションデータ
     * @returns {number|null} 最初の完了時間（ミリ秒）
     */
    findFirstCompletionTime(sessions) {
        const completedSessions = sessions,
            .filter(s => s.completed);
            .sort((a, b) => a.startTime - b.startTime),
        
        if (completedSessions.length === 0) return null,
        
        const firstSession = completedSessions[0] }
        return firstSession.endTime - firstSession.startTime;
    
    /**
     * 完了までの平均試行回数を計算
     * @param {Array} sessions - セッションデータ
     * @returns {number} 平均試行回数
     */
    calculateAverageAttemptsToComplete(sessions) {
        const completedSessions = sessions.filter(s => s.completed);
        if (completedSessions.length === 0) return sessions.length,
        
        let totalAttempts = 0,
        
        for (let, i = 0, i < completedSessions.length, i++) {
            const completedTime = completedSessions[i].startTime,
            const previousAttempts = sessions.filter(s => );
                s.startTime < completedTime && !s.completed).length }
            totalAttempts += previousAttempts + 1; }
        }
        
        return totalAttempts / completedSessions.length;
    }
    
    /**
     * 一貫性スコアを計算
     * @param {Array} sessions - セッションデータ
     * @returns {number} 一貫性スコア（0-1）
     */
    calculateConsistencyScore(sessions) {
        const scores = sessions.map(s => s.score).filter(s => s > 0);
        if (scores.length < 2) return 0,
        
        const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length,
        const stdDev = this.calculateStandardDeviation(scores);
        // 変動係数の逆数として一貫性を定義（0-1の範囲に正規化）
        const cv = stdDev / mean }
        return Math.max(0, Math.min(1, 1 - cv);
    
    /**
     * ステージ難易度を推定
     * @param {Array} sessions - セッションデータ
     * @returns {number} 推定難易度（1-10）
     */
    estimateStageDifficulty(sessions) {
        const completionRate = sessions.filter(s => s.completed).length / sessions.length,
        const avgAttempts = this.calculateAverageAttemptsToComplete(sessions);
        const avgAccuracy = sessions,
            .map(s => s.accuracy);
            .filter(a => a !== undefined);
            .reduce((sum, a, _, arr) => sum + a / arr.length, 0),
        
        // 難易度の計算（各要素に重みを付けて合成）
        const difficulty = ,
            (1 - completionRate) * 4 +      // 完了率の低さ（40%）,
            Math.min(avgAttempts / 10, 1) * 3 + // 試行回数（30%）,
            (1 - avgAccuracy) * 3,           // 精度の低さ（30%）
        
    }
        return Math.max(1, Math.min(10, Math.round(difficulty));
    
    /**
     * データ品質を評価
     * @param {Array} playerMetrics - プレイヤーメトリクス
     * @returns {Object} データ品質評価
     */''
    assessBenchmarkDataQuality(playerMetrics) {
        const sampleSize = playerMetrics.length,
        let quality = 'good',
        let confidence = 0.95,

        if (sampleSize < 10) {''
            quality = 'poor' }

            confidence = 0.5;' }'

        } else if (sampleSize < 30) { ''
            quality = 'fair',

            confidence = 0.75,' }'

        } else if (sampleSize < 100) { ''
            quality = 'good',
            confidence = 0.9 }

        } else {
            quality = 'excellent' }
            confidence = 0.95; }
        }
        
        return { quality,
            confidence,
            sampleSize };
            reliability: sampleSize >= this.algorithmConfig.minSampleSize 
    }
    
    /**
     * 外れ値を検出
     * @param {Array} values - 値の配列
     * @returns {Object} 外れ値情報
     */
    detectOutliers(values) { if (values.length < 3) { }
            return { outliers: [], cleanedValues: values,
        
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const stdDev = this.calculateStandardDeviation(values);
        const threshold = this.algorithmConfig.outlierThreshold;
        
        const outliers = [];
        const cleanedValues = [];
        
        for (const value of values) {
        
            const zScore = Math.abs((value - mean) / stdDev),
            if (zScore > threshold) {
    
}
                outliers.push(value); }
            } else { cleanedValues.push(value) }
        }
        
        return { outliers, cleanedValues }
    
    /**
     * 移動平均を計算
     * @param {Array} values - 値の配列
     * @param {number} window - ウィンドウサイズ
     * @returns {Array} 移動平均の配列
     */
    calculateMovingAverage(values, window = 3) {
        if (values.length < window) return values,
        
        const movingAverages = [],
        
        for (let, i = 0, i < values.length - window + 1, i++) {
            const windowValues = values.slice(i, i + window);
            const average = windowValues.reduce((sum, val) => sum + val, 0) / window }
            movingAverages.push(average); }
        }
        
        return movingAverages;
    }
    
    /**
     * 予測値を計算
     * @param {Object} trend - トレンド情報
     * @param {number} futureSteps - 未来のステップ数
     * @returns {number} 予測値
     */
    calculatePrediction(trend, futureSteps) { return trend.slope * futureSteps + trend.intercept }
    
    /**
     * 改善率を計算
     * @param {number} current - 現在の値
     * @param {number} past - 過去の値
     * @param {number} timeSpan - 時間範囲
     * @returns {number} 改善率（週あたり）
     */
    calculateImprovementRate(current, past, timeSpan) {
        if (past === 0 || timeSpan === 0) return 0,
        
        const totalImprovement = ((current - past) / past) * 100,
        const weeksInTimeSpan = timeSpan / (7 * 24 * 60 * 60 * 1000) }
        return totalImprovement / weeksInTimeSpan;
    
    /**
     * 信頼区間を計算
     * @param {number} mean - 平均値
     * @param {number} stdDev - 標準偏差
     * @param {number} sampleSize - サンプルサイズ
     * @returns {Object} 信頼区間
     */
    calculateConfidenceInterval(mean, stdDev, sampleSize) {
        // 95%信頼区間（z値 = 1.96）
        const zScore = 1.96,
        const standardError = stdDev / Math.sqrt(sampleSize);
        const marginOfError = zScore * standardError,
        
        return { lower: mean - marginOfError }
            upper: mean + marginOfError },
            marginOfError: marginOfError;'}'