/**
 * トレンド分析クラス
 * 統計データの時系列分析とトレンド検出を行う
 */
export class TrendAnalyzer {
    constructor() {
        this.analysisConfigs = {
            // トレンド検出の閾値設定
            trendThresholds: {
                strong: 15,     // 15%以上の変化で強いトレンド
                moderate: 8,    // 8%以上の変化で中程度のトレンド
                weak: 3         // 3%以上の変化で弱いトレンド
            },
            
            // 分析期間設定
            analysisWindows: {
                short: 7,       // 短期: 7データポイント
                medium: 14,     // 中期: 14データポイント
                long: 30        // 長期: 30データポイント
            },
            
            // 異常値検出設定
            outlierDetection: {
                enabled: true,
                zScoreThreshold: 2.5,  // Z-score閾値
                iqrMultiplier: 1.5     // IQR倍数
            }
        };
        
        this.trendTypes = {
            STRONGLY_IMPROVING: 'strongly_improving',
            MODERATELY_IMPROVING: 'moderately_improving',
            WEAKLY_IMPROVING: 'weakly_improving',
            STABLE: 'stable',
            WEAKLY_DECLINING: 'weakly_declining',
            MODERATELY_DECLINING: 'moderately_declining',
            STRONGLY_DECLINING: 'strongly_declining',
            VOLATILE: 'volatile',
            INSUFFICIENT_DATA: 'insufficient_data'
        };
    }
    
    /**
     * メインのトレンド分析
     */
    analyze(timeSeriesData, category = null, options = {}) {
        if (!timeSeriesData || timeSeriesData.length === 0) {
            return this.createEmptyAnalysis();
        }
        
        const config = { ...this.analysisConfigs, ...options };
        
        // データの前処理
        const processedData = this.preprocessData(timeSeriesData, category);
        
        if (processedData.length < 3) {
            return this.createInsufficientDataAnalysis(processedData);
        }
        
        // 複数の期間でトレンド分析
        const shortTermTrend = this.analyzeWindow(processedData, config.analysisWindows.short);
        const mediumTermTrend = this.analyzeWindow(processedData, config.analysisWindows.medium);
        const longTermTrend = this.analyzeWindow(processedData, config.analysisWindows.long);
        
        // 総合的なトレンド分析
        const overallTrend = this.analyzeOverallTrend(processedData);
        
        // 季節性・周期性分析
        const seasonality = this.analyzeSeasonality(processedData);
        
        // 変動性分析
        const volatility = this.analyzeVolatility(processedData);
        
        // 予測分析
        const forecast = this.generateForecast(processedData, 5); // 5期間先まで予測
        
        // トレンド強度の計算
        const trendStrength = this.calculateTrendStrength(processedData);
        
        return {
            category: category,
            dataPoints: processedData.length,
            analysisTimestamp: Date.now(),
            
            // 期間別トレンド
            trends: {
                shortTerm: shortTermTrend,
                mediumTerm: mediumTermTrend,
                longTerm: longTermTrend,
                overall: overallTrend
            },
            
            // 統計的指標
            statistics: {
                mean: this.calculateMean(processedData),
                median: this.calculateMedian(processedData),
                standardDeviation: this.calculateStandardDeviation(processedData),
                variance: this.calculateVariance(processedData),
                range: this.calculateRange(processedData)
            },
            
            // 追加分析
            seasonality: seasonality,
            volatility: volatility,
            trendStrength: trendStrength,
            forecast: forecast,
            
            // 品質指標
            dataQuality: this.assessDataQuality(processedData),
            confidence: this.calculateConfidence(processedData, overallTrend)
        };
    }
    
    /**
     * データの前処理
     */
    preprocessData(timeSeriesData, category) {
        let data = [];
        
        // カテゴリ指定がある場合はフィルター
        if (category) {
            data = timeSeriesData
                .filter(entry => entry.categories && entry.categories[category])
                .map(entry => ({
                    period: entry.period,
                    timestamp: entry.timestamp,
                    value: entry.categories[category].total || entry.categories[category].average || 0
                }));
        } else {
            // カテゴリ指定がない場合は全データポイントの合計
            data = timeSeriesData.map(entry => ({
                period: entry.period,
                timestamp: entry.timestamp,
                value: entry.totalDataPoints || 0
            }));
        }
        
        // 時系列順にソート
        data.sort((a, b) => a.period.localeCompare(b.period));
        
        // 異常値検出・除去（オプション）
        if (this.analysisConfigs.outlierDetection.enabled) {
            data = this.removeOutliers(data);
        }
        
        return data;
    }
    
    /**
     * 指定期間でのトレンド分析
     */
    analyzeWindow(data, windowSize) {
        if (data.length < windowSize) {
            return this.analyzeWindow(data, data.length);
        }
        
        const windowData = data.slice(-windowSize);
        
        // 線形回帰によるトレンド検出
        const regression = this.calculateLinearRegression(windowData);
        
        // パーセント変化の計算
        const percentChange = this.calculatePercentChange(
            windowData[0].value, 
            windowData[windowData.length - 1].value
        );
        
        // トレンドタイプの判定
        const trendType = this.determineTrendType(percentChange);
        
        // 一貫性の評価
        const consistency = this.evaluateTrendConsistency(windowData);
        
        return {
            windowSize: windowSize,
            startValue: windowData[0].value,
            endValue: windowData[windowData.length - 1].value,
            change: windowData[windowData.length - 1].value - windowData[0].value,
            percentChange: percentChange,
            trendType: trendType,
            slope: regression.slope,
            rSquared: regression.rSquared,
            consistency: consistency,
            significance: this.calculateSignificance(regression, windowData.length)
        };
    }
    
    /**
     * 全体的なトレンド分析
     */
    analyzeOverallTrend(data) {
        const regression = this.calculateLinearRegression(data);
        const percentChange = this.calculatePercentChange(data[0].value, data[data.length - 1].value);
        
        // 転換点の検出
        const turningPoints = this.detectTurningPoints(data);
        
        // トレンドの加速・減速分析
        const acceleration = this.analyzeAcceleration(data);
        
        return {
            dataPoints: data.length,
            totalChange: data[data.length - 1].value - data[0].value,
            percentChange: percentChange,
            trendType: this.determineTrendType(percentChange),
            slope: regression.slope,
            rSquared: regression.rSquared,
            turningPoints: turningPoints,
            acceleration: acceleration,
            duration: this.calculateTrendDuration(data)
        };
    }
    
    /**
     * 線形回帰計算
     */
    calculateLinearRegression(data) {
        const n = data.length;
        if (n < 2) return { slope: 0, intercept: 0, rSquared: 0 };
        
        const xValues = data.map((_, index) => index);
        const yValues = data.map(point => point.value);
        
        const sumX = xValues.reduce((sum, x) => sum + x, 0);
        const sumY = yValues.reduce((sum, y) => sum + y, 0);
        const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
        const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
        const sumYY = yValues.reduce((sum, y) => sum + y * y, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        // R-squared計算
        const yMean = sumY / n;
        const ssRes = yValues.reduce((sum, y, i) => {
            const predicted = slope * i + intercept;
            return sum + Math.pow(y - predicted, 2);
        }, 0);
        const ssTot = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
        const rSquared = ssTot === 0 ? 1 : 1 - (ssRes / ssTot);
        
        return {
            slope: slope,
            intercept: intercept,
            rSquared: Math.max(0, Math.min(1, rSquared))
        };
    }
    
    /**
     * パーセント変化の計算
     */
    calculatePercentChange(startValue, endValue) {
        if (startValue === 0) {
            return endValue > 0 ? 100 : 0;
        }
        return ((endValue - startValue) / Math.abs(startValue)) * 100;
    }
    
    /**
     * トレンドタイプの判定
     */
    determineTrendType(percentChange) {
        const absChange = Math.abs(percentChange);
        const thresholds = this.analysisConfigs.trendThresholds;
        
        if (absChange >= thresholds.strong) {
            return percentChange > 0 ? this.trendTypes.STRONGLY_IMPROVING : this.trendTypes.STRONGLY_DECLINING;
        } else if (absChange >= thresholds.moderate) {
            return percentChange > 0 ? this.trendTypes.MODERATELY_IMPROVING : this.trendTypes.MODERATELY_DECLINING;
        } else if (absChange >= thresholds.weak) {
            return percentChange > 0 ? this.trendTypes.WEAKLY_IMPROVING : this.trendTypes.WEAKLY_DECLINING;
        } else {
            return this.trendTypes.STABLE;
        }
    }
    
    /**
     * トレンドの一貫性評価
     */
    evaluateTrendConsistency(data) {
        if (data.length < 3) return 0;
        
        const changes = [];
        for (let i = 1; i < data.length; i++) {
            const change = data[i].value - data[i - 1].value;
            changes.push(change);
        }
        
        // 変化の方向の一貫性
        const positiveChanges = changes.filter(change => change > 0).length;
        const negativeChanges = changes.filter(change => change < 0).length;
        const noChanges = changes.filter(change => change === 0).length;
        
        const totalChanges = changes.length;
        const maxConsistency = Math.max(positiveChanges, negativeChanges, noChanges);
        
        return maxConsistency / totalChanges;
    }
    
    /**
     * 季節性・周期性分析
     */
    analyzeSeasonality(data) {
        if (data.length < 12) {
            return { detected: false, reason: 'insufficient_data' };
        }
        
        // 簡単な周期性検出（実際にはFFTなどを使用することもある）
        const cycleLengths = [7, 14, 30]; // 週次、隔週、月次パターン
        const seasonalityResults = {};
        
        cycleLengths.forEach(cycleLength => {
            if (data.length >= cycleLength * 2) {
                const correlation = this.calculateAutocorrelation(data, cycleLength);
                seasonalityResults[`${cycleLength}_period`] = {
                    correlation: correlation,
                    significant: correlation > 0.3
                };
            }
        });
        
        const hasSeasonality = Object.values(seasonalityResults).some(result => result.significant);
        
        return {
            detected: hasSeasonality,
            patterns: seasonalityResults,
            dominantCycle: this.findDominantCycle(seasonalityResults)
        };
    }
    
    /**
     * 自己相関の計算
     */
    calculateAutocorrelation(data, lag) {
        if (data.length <= lag) return 0;
        
        const values = data.map(point => point.value);
        const n = values.length - lag;
        
        let sumXY = 0;
        let sumX = 0;
        let sumY = 0;
        let sumXX = 0;
        let sumYY = 0;
        
        for (let i = 0; i < n; i++) {
            const x = values[i];
            const y = values[i + lag];
            
            sumXY += x * y;
            sumX += x;
            sumY += y;
            sumXX += x * x;
            sumYY += y * y;
        }
        
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
        
        return denominator === 0 ? 0 : numerator / denominator;
    }
    
    /**
     * 変動性分析
     */
    analyzeVolatility(data) {
        const values = data.map(point => point.value);
        const mean = this.calculateMean(data);
        const standardDeviation = this.calculateStandardDeviation(data);
        
        // 変動係数（相対的な変動性）
        const coefficientOfVariation = mean !== 0 ? (standardDeviation / Math.abs(mean)) * 100 : 0;
        
        // 変動性の分類
        let volatilityLevel;
        if (coefficientOfVariation < 10) {
            volatilityLevel = 'low';
        } else if (coefficientOfVariation < 25) {
            volatilityLevel = 'moderate';
        } else {
            volatilityLevel = 'high';
        }
        
        return {
            standardDeviation: standardDeviation,
            coefficientOfVariation: coefficientOfVariation,
            level: volatilityLevel,
            range: this.calculateRange(data),
            averageAbsoluteDeviation: this.calculateAverageAbsoluteDeviation(data)
        };
    }
    
    /**
     * 予測生成
     */
    generateForecast(data, periods) {
        const regression = this.calculateLinearRegression(data);
        const lastIndex = data.length - 1;
        const forecast = [];
        
        for (let i = 1; i <= periods; i++) {
            const predictedValue = regression.slope * (lastIndex + i) + regression.intercept;
            
            forecast.push({
                period: i,
                predictedValue: Math.max(0, predictedValue), // 負の値を避ける
                confidence: this.calculateForecastConfidence(regression, i)
            });
        }
        
        return {
            method: 'linear_regression',
            periods: periods,
            forecast: forecast,
            reliability: regression.rSquared
        };
    }
    
    /**
     * トレンド強度の計算
     */
    calculateTrendStrength(data) {
        const regression = this.calculateLinearRegression(data);
        const percentChange = this.calculatePercentChange(data[0].value, data[data.length - 1].value);
        
        // 複数の指標を組み合わせて強度を計算
        const rSquaredWeight = regression.rSquared * 0.4;
        const percentChangeWeight = Math.min(Math.abs(percentChange) / 50, 1) * 0.4;
        const consistencyWeight = this.evaluateTrendConsistency(data) * 0.2;
        
        const strength = rSquaredWeight + percentChangeWeight + consistencyWeight;
        
        return {
            score: Math.min(strength, 1),
            components: {
                linearity: regression.rSquared,
                magnitude: Math.abs(percentChange),
                consistency: this.evaluateTrendConsistency(data)
            },
            interpretation: this.interpretTrendStrength(strength)
        };
    }
    
    /**
     * 統計計算ヘルパーメソッド
     */
    calculateMean(data) {
        const values = data.map(point => point.value);
        return values.reduce((sum, value) => sum + value, 0) / values.length;
    }
    
    calculateMedian(data) {
        const values = data.map(point => point.value).sort((a, b) => a - b);
        const mid = Math.floor(values.length / 2);
        return values.length % 2 === 0 ? (values[mid - 1] + values[mid]) / 2 : values[mid];
    }
    
    calculateStandardDeviation(data) {
        const mean = this.calculateMean(data);
        const values = data.map(point => point.value);
        const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }
    
    calculateVariance(data) {
        const mean = this.calculateMean(data);
        const values = data.map(point => point.value);
        return values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
    }
    
    calculateRange(data) {
        const values = data.map(point => point.value);
        return {
            min: Math.min(...values),
            max: Math.max(...values),
            range: Math.max(...values) - Math.min(...values)
        };
    }
    
    calculateAverageAbsoluteDeviation(data) {
        const mean = this.calculateMean(data);
        const values = data.map(point => point.value);
        return values.reduce((sum, value) => sum + Math.abs(value - mean), 0) / values.length;
    }
    
    /**
     * 異常値除去
     */
    removeOutliers(data) {
        const values = data.map(point => point.value);
        const q1 = this.calculatePercentile(values, 25);
        const q3 = this.calculatePercentile(values, 75);
        const iqr = q3 - q1;
        const lowerBound = q1 - this.analysisConfigs.outlierDetection.iqrMultiplier * iqr;
        const upperBound = q3 + this.analysisConfigs.outlierDetection.iqrMultiplier * iqr;
        
        return data.filter(point => point.value >= lowerBound && point.value <= upperBound);
    }
    
    calculatePercentile(values, percentile) {
        const sorted = [...values].sort((a, b) => a - b);
        const index = (percentile / 100) * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        
        if (lower === upper) {
            return sorted[lower];
        } else {
            return sorted[lower] * (upper - index) + sorted[upper] * (index - lower);
        }
    }
    
    /**
     * ヘルパーメソッド群
     */
    detectTurningPoints(data) {
        // 実装を簡略化（実際にはより高度なアルゴリズムを使用）
        return [];
    }
    
    analyzeAcceleration(data) {
        // 実装を簡略化
        return { type: 'constant', value: 0 };
    }
    
    calculateTrendDuration(data) {
        return data.length;
    }
    
    findDominantCycle(seasonalityResults) {
        const significant = Object.entries(seasonalityResults)
            .filter(([_, result]) => result.significant)
            .sort(([_, a], [__, b]) => b.correlation - a.correlation);
        
        return significant.length > 0 ? significant[0][0] : null;
    }
    
    calculateSignificance(regression, sampleSize) {
        // 簡易的な有意性計算
        return regression.rSquared > 0.5 && sampleSize >= 10 ? 'significant' : 'not_significant';
    }
    
    calculateForecastConfidence(regression, period) {
        // 予測の信頼度は時間とともに減少
        const baseConfidence = regression.rSquared;
        const timeDecay = Math.exp(-period * 0.1);
        return baseConfidence * timeDecay;
    }
    
    interpretTrendStrength(strength) {
        if (strength >= 0.8) return 'very_strong';
        if (strength >= 0.6) return 'strong';
        if (strength >= 0.4) return 'moderate';
        if (strength >= 0.2) return 'weak';
        return 'very_weak';
    }
    
    assessDataQuality(data) {
        return {
            completeness: 1.0, // 簡略化
            consistency: 1.0,
            accuracy: 1.0
        };
    }
    
    calculateConfidence(data, trend) {
        return Math.min(trend.rSquared * 0.8 + (data.length / 100) * 0.2, 1.0);
    }
    
    createEmptyAnalysis() {
        return {
            category: null,
            dataPoints: 0,
            trends: null,
            statistics: null,
            error: 'no_data'
        };
    }
    
    createInsufficientDataAnalysis(data) {
        return {
            category: null,
            dataPoints: data.length,
            trends: { overall: { trendType: this.trendTypes.INSUFFICIENT_DATA } },
            statistics: null,
            error: 'insufficient_data'
        };
    }
}