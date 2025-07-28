/**
 * 比較分析エンジンクラス
 * 期間別データ比較、A/Bテスト分析、統計的有意性検定を行う
 */
export class ComparisonEngine {
    constructor() {
        this.comparisonTypes = {
            TEMPORAL: 'temporal',           // 時間的比較
            SEGMENTAL: 'segmental',         // セグメント比較
            BASELINE: 'baseline',           // ベースライン比較
            BENCHMARK: 'benchmark'          // ベンチマーク比較
        };
        
        this.significanceTests = {
            T_TEST: 't_test',
            WILCOXON: 'wilcoxon',
            CHI_SQUARE: 'chi_square',
            MANN_WHITNEY: 'mann_whitney'
        };
        
        this.comparisonConfigs = {
            // 有意性検定の設定
            significance: {
                alpha: 0.05,                // 有意水準
                minSampleSize: 10,          // 最小サンプルサイズ
                effectSizeThresholds: {
                    small: 0.2,
                    medium: 0.5,
                    large: 0.8
                }
            },
            
            // 比較分析の設定
            analysis: {
                percentileRanges: [25, 50, 75, 90, 95], // 分位数
                outlierMethod: 'iqr',                    // 外れ値検出方法
                trendSmoothingWindow: 3                  // トレンド平滑化ウィンドウ
            }
        };
    }
    
    /**
     * メインの比較分析
     */
    compare(dataset1, dataset2, options = {}) {
        const config = { ...this.comparisonConfigs, ...options };
        
        // データの前処理と検証
        const processedData1 = this.preprocessComparisonData(dataset1, 'dataset1');
        const processedData2 = this.preprocessComparisonData(dataset2, 'dataset2');
        
        if (!this.validateComparisonData(processedData1, processedData2)) {
            return this.createInvalidComparisonResult(processedData1, processedData2);
        }
        
        // 基本統計の計算
        const basicStats1 = this.calculateBasicStatistics(processedData1);
        const basicStats2 = this.calculateBasicStatistics(processedData2);
        
        // 分布分析
        const distribution1 = this.analyzeDistribution(processedData1);
        const distribution2 = this.analyzeDistribution(processedData2);
        
        // 統計的有意性検定
        const significanceTest = this.performSignificanceTest(processedData1, processedData2, config);
        
        // 効果量の計算
        const effectSize = this.calculateEffectSize(processedData1, processedData2);
        
        // 変化分析
        const changeAnalysis = this.analyzeChange(basicStats1, basicStats2);
        
        // トレンド比較
        const trendComparison = this.compareTrends(processedData1, processedData2);
        
        // 分位数比較
        const quantileComparison = this.compareQuantiles(processedData1, processedData2, config);
        
        // 外れ値分析
        const outlierAnalysis = this.compareOutliers(processedData1, processedData2);
        
        // 相関分析
        const correlationAnalysis = this.analyzeCorrelation(processedData1, processedData2);
        
        // 総合評価
        const overallAssessment = this.assessOverallComparison(
            changeAnalysis, significanceTest, effectSize, trendComparison
        );
        
        return {
            comparisonId: this.generateComparisonId(),
            timestamp: Date.now(),
            
            // データセット情報
            datasets: {
                dataset1: {
                    name: dataset1.name || 'Dataset 1',
                    size: processedData1.length,
                    period: dataset1.period,
                    statistics: basicStats1,
                    distribution: distribution1
                },
                dataset2: {
                    name: dataset2.name || 'Dataset 2',
                    size: processedData2.length,
                    period: dataset2.period,
                    statistics: basicStats2,
                    distribution: distribution2
                }
            },
            
            // 比較分析結果
            analysis: {
                change: changeAnalysis,
                significance: significanceTest,
                effectSize: effectSize,
                trends: trendComparison,
                quantiles: quantileComparison,
                outliers: outlierAnalysis,
                correlation: correlationAnalysis
            },
            
            // 総合評価
            assessment: overallAssessment,
            
            // 推奨事項
            recommendations: this.generateRecommendations(overallAssessment, changeAnalysis)
        };
    }
    
    /**
     * 期間比較の特化メソッド
     */
    compareTimePeriods(period1Data, period2Data, category, options = {}) {
        const comparison = this.compare(
            {
                name: `Period 1 (${period1Data.startDate} - ${period1Data.endDate})`,
                data: period1Data.data,
                period: period1Data
            },
            {
                name: `Period 2 (${period2Data.startDate} - ${period2Data.endDate})`,
                data: period2Data.data,
                period: period2Data
            },
            options
        );
        
        // 期間特有の分析を追加
        comparison.temporalAnalysis = {
            periodLength: {
                period1: this.calculatePeriodLength(period1Data),
                period2: this.calculatePeriodLength(period2Data),
                difference: this.calculatePeriodLength(period2Data) - this.calculatePeriodLength(period1Data)
            },
            seasonalityImpact: this.analyzeSeasonalityImpact(period1Data, period2Data),
            weekdayWeekendSplit: this.analyzeWeekdayWeekendSplit(period1Data, period2Data),
            growthRate: this.calculateGrowthRate(period1Data.data, period2Data.data)
        };
        
        return comparison;
    }
    
    /**
     * ベースライン比較
     */
    compareAgainstBaseline(currentData, baselineData, options = {}) {
        const comparison = this.compare(baselineData, currentData, options);
        
        // ベースライン特有の分析
        comparison.baselineAnalysis = {
            deviationFromBaseline: this.calculateBaselineDeviation(currentData, baselineData),
            performanceIndex: this.calculatePerformanceIndex(currentData, baselineData),
            confidenceInterval: this.calculateConfidenceInterval(currentData, baselineData),
            alertLevel: this.determineAlertLevel(comparison.analysis.change, comparison.analysis.significance)
        };
        
        return comparison;
    }
    
    /**
     * データの前処理
     */
    preprocessComparisonData(dataset, label) {
        if (!dataset || !dataset.data) {
            return [];
        }
        
        let data = Array.isArray(dataset.data) ? dataset.data : [dataset.data];
        
        // 数値データの抽出
        data = data.map(item => {
            if (typeof item === 'number') {
                return { value: item, timestamp: Date.now() };
            } else if (item && typeof item.value === 'number') {
                return item;
            } else if (item && typeof item.total === 'number') {
                return { value: item.total, timestamp: item.timestamp || Date.now() };
            } else if (item && typeof item.average === 'number') {
                return { value: item.average, timestamp: item.timestamp || Date.now() };
            }
            return null;
        }).filter(item => item !== null && !isNaN(item.value) && isFinite(item.value));
        
        // 時系列順にソート
        data.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        
        return data;
    }
    
    /**
     * 基本統計の計算
     */
    calculateBasicStatistics(data) {
        if (data.length === 0) {
            return this.createEmptyStatistics();
        }
        
        const values = data.map(item => item.value);
        const n = values.length;
        
        // 基本的な統計値
        const sum = values.reduce((acc, val) => acc + val, 0);
        const mean = sum / n;
        const sortedValues = [...values].sort((a, b) => a - b);
        
        // 分位数
        const q1 = this.calculateQuantile(sortedValues, 0.25);
        const median = this.calculateQuantile(sortedValues, 0.5);
        const q3 = this.calculateQuantile(sortedValues, 0.75);
        
        // 分散と標準偏差
        const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
        const standardDeviation = Math.sqrt(variance);
        
        // 歪度と尖度
        const skewness = this.calculateSkewness(values, mean, standardDeviation);
        const kurtosis = this.calculateKurtosis(values, mean, standardDeviation);
        
        return {
            count: n,
            sum: sum,
            mean: mean,
            median: median,
            min: Math.min(...values),
            max: Math.max(...values),
            range: Math.max(...values) - Math.min(...values),
            q1: q1,
            q3: q3,
            iqr: q3 - q1,
            variance: variance,
            standardDeviation: standardDeviation,
            coefficientOfVariation: mean !== 0 ? (standardDeviation / Math.abs(mean)) * 100 : 0,
            skewness: skewness,
            kurtosis: kurtosis
        };
    }
    
    /**
     * 統計的有意性検定
     */
    performSignificanceTest(data1, data2, config) {
        if (data1.length < config.significance.minSampleSize || 
            data2.length < config.significance.minSampleSize) {
            return {
                test: 'insufficient_data',
                pValue: null,
                significant: false,
                reason: 'Sample size too small'
            };
        }
        
        const values1 = data1.map(item => item.value);
        const values2 = data2.map(item => item.value);
        
        // 正規性検定（簡易版）
        const normalityTest1 = this.testNormality(values1);
        const normalityTest2 = this.testNormality(values2);
        
        let testResult;
        
        if (normalityTest1.isNormal && normalityTest2.isNormal) {
            // 両方が正規分布の場合：t検定
            testResult = this.performTTest(values1, values2);
            testResult.test = 't_test';
        } else {
            // 非正規分布の場合：Mann-Whitney U検定
            testResult = this.performMannWhitneyU(values1, values2);
            testResult.test = 'mann_whitney_u';
        }
        
        testResult.significant = testResult.pValue < config.significance.alpha;
        testResult.alpha = config.significance.alpha;
        testResult.normality = { data1: normalityTest1, data2: normalityTest2 };
        
        return testResult;
    }
    
    /**
     * 効果量の計算
     */
    calculateEffectSize(data1, data2) {
        const values1 = data1.map(item => item.value);
        const values2 = data2.map(item => item.value);
        
        const mean1 = values1.reduce((sum, val) => sum + val, 0) / values1.length;
        const mean2 = values2.reduce((sum, val) => sum + val, 0) / values2.length;
        
        // プールされた標準偏差の計算
        const variance1 = values1.reduce((acc, val) => acc + Math.pow(val - mean1, 2), 0) / (values1.length - 1);
        const variance2 = values2.reduce((acc, val) => acc + Math.pow(val - mean2, 2), 0) / (values2.length - 1);
        const pooledStandardDeviation = Math.sqrt(((values1.length - 1) * variance1 + (values2.length - 1) * variance2) / (values1.length + values2.length - 2));
        
        // Cohen's d
        const cohensD = pooledStandardDeviation !== 0 ? (mean2 - mean1) / pooledStandardDeviation : 0;
        
        // 効果量の解釈
        let interpretation;
        const absD = Math.abs(cohensD);
        if (absD < 0.2) {
            interpretation = 'negligible';
        } else if (absD < 0.5) {
            interpretation = 'small';
        } else if (absD < 0.8) {
            interpretation = 'medium';
        } else {
            interpretation = 'large';
        }
        
        return {
            cohensD: cohensD,
            interpretation: interpretation,
            magnitude: absD,
            direction: cohensD > 0 ? 'increase' : cohensD < 0 ? 'decrease' : 'no_change'
        };
    }
    
    /**
     * 変化分析
     */
    analyzeChange(stats1, stats2) {
        const meanChange = stats2.mean - stats1.mean;
        const meanChangePercent = stats1.mean !== 0 ? (meanChange / Math.abs(stats1.mean)) * 100 : 0;
        
        const medianChange = stats2.median - stats1.median;
        const medianChangePercent = stats1.median !== 0 ? (medianChange / Math.abs(stats1.median)) * 100 : 0;
        
        const variabilityChange = stats2.standardDeviation - stats1.standardDeviation;
        const variabilityChangePercent = stats1.standardDeviation !== 0 ? 
            (variabilityChange / stats1.standardDeviation) * 100 : 0;
        
        return {
            mean: {
                absolute: meanChange,
                percent: meanChangePercent,
                direction: this.determineChangeDirection(meanChange)
            },
            median: {
                absolute: medianChange,
                percent: medianChangePercent,
                direction: this.determineChangeDirection(medianChange)
            },
            variability: {
                absolute: variabilityChange,
                percent: variabilityChangePercent,
                direction: this.determineChangeDirection(variabilityChange),
                interpretation: this.interpretVariabilityChange(variabilityChange)
            },
            range: {
                from: { min: stats1.min, max: stats1.max },
                to: { min: stats2.min, max: stats2.max },
                expansion: (stats2.max - stats2.min) - (stats1.max - stats1.min)
            }
        };
    }
    
    /**
     * t検定の実行
     */
    performTTest(values1, values2) {
        const n1 = values1.length;
        const n2 = values2.length;
        
        const mean1 = values1.reduce((sum, val) => sum + val, 0) / n1;
        const mean2 = values2.reduce((sum, val) => sum + val, 0) / n2;
        
        const variance1 = values1.reduce((acc, val) => acc + Math.pow(val - mean1, 2), 0) / (n1 - 1);
        const variance2 = values2.reduce((acc, val) => acc + Math.pow(val - mean2, 2), 0) / (n2 - 1);
        
        // Welch's t-test (等分散を仮定しない)
        const standardError = Math.sqrt(variance1 / n1 + variance2 / n2);
        const tStatistic = (mean2 - mean1) / standardError;
        
        // 自由度の計算（Welch-Satterthwaite equation）
        const degreesOfFreedom = Math.pow(variance1 / n1 + variance2 / n2, 2) / 
            (Math.pow(variance1 / n1, 2) / (n1 - 1) + Math.pow(variance2 / n2, 2) / (n2 - 1));
        
        // p値の近似計算（簡易版）
        const pValue = this.approximateTTestPValue(Math.abs(tStatistic), degreesOfFreedom);
        
        return {
            tStatistic: tStatistic,
            degreesOfFreedom: degreesOfFreedom,
            pValue: pValue,
            standardError: standardError
        };
    }
    
    /**
     * Mann-Whitney U検定の実行（簡易版）
     */
    performMannWhitneyU(values1, values2) {
        // 簡易的な実装
        const combined = [...values1.map(v => ({ value: v, group: 1 })), 
                         ...values2.map(v => ({ value: v, group: 2 }))];
        
        combined.sort((a, b) => a.value - b.value);
        
        // 順位の計算
        let rank = 1;
        const ranks = combined.map((item, index) => {
            if (index > 0 && item.value !== combined[index - 1].value) {
                rank = index + 1;
            }
            return { ...item, rank: rank };
        });
        
        const sumRanks1 = ranks.filter(item => item.group === 1)
                              .reduce((sum, item) => sum + item.rank, 0);
        
        const n1 = values1.length;
        const n2 = values2.length;
        
        const u1 = sumRanks1 - (n1 * (n1 + 1)) / 2;
        const u2 = n1 * n2 - u1;
        const u = Math.min(u1, u2);
        
        // 正規近似による p値計算（簡易版）
        const meanU = (n1 * n2) / 2;
        const standardErrorU = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12);
        const zScore = Math.abs(u - meanU) / standardErrorU;
        const pValue = 2 * (1 - this.standardNormalCDF(zScore));
        
        return {
            uStatistic: u,
            zScore: zScore,
            pValue: pValue
        };
    }
    
    /**
     * ヘルパーメソッド群
     */
    calculateQuantile(sortedValues, q) {
        const index = q * (sortedValues.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        
        if (lower === upper) {
            return sortedValues[lower];
        } else {
            return sortedValues[lower] * (upper - index) + sortedValues[upper] * (index - lower);
        }
    }
    
    calculateSkewness(values, mean, standardDeviation) {
        if (standardDeviation === 0) return 0;
        
        const n = values.length;
        const skewness = values.reduce((acc, val) => acc + Math.pow((val - mean) / standardDeviation, 3), 0) / n;
        return skewness;
    }
    
    calculateKurtosis(values, mean, standardDeviation) {
        if (standardDeviation === 0) return 0;
        
        const n = values.length;
        const kurtosis = values.reduce((acc, val) => acc + Math.pow((val - mean) / standardDeviation, 4), 0) / n;
        return kurtosis - 3; // 正規分布の尖度を0とする調整
    }
    
    testNormality(values) {
        // 簡易的な正規性検定（Shapiro-Wilk検定の代替）
        if (values.length < 8) {
            return { isNormal: false, reason: 'sample_too_small' };
        }
        
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const standardDeviation = Math.sqrt(values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length);
        
        if (standardDeviation === 0) {
            return { isNormal: false, reason: 'no_variation' };
        }
        
        const skewness = this.calculateSkewness(values, mean, standardDeviation);
        const kurtosis = this.calculateKurtosis(values, mean, standardDeviation);
        
        // 簡易的な判定（歪度と尖度が合理的な範囲内かチェック）
        const isNormal = Math.abs(skewness) < 2 && Math.abs(kurtosis) < 2;
        
        return {
            isNormal: isNormal,
            skewness: skewness,
            kurtosis: kurtosis
        };
    }
    
    approximateTTestPValue(tStat, df) {
        // 非常に簡易的なp値近似
        if (df < 1) return 1;
        
        // 正規分布近似（大標本の場合）
        if (df >= 30) {
            return 2 * (1 - this.standardNormalCDF(tStat));
        }
        
        // 小標本の場合の簡易近似
        const criticalValues = [12.71, 4.30, 3.18, 2.78, 2.57, 2.45, 2.36, 2.31, 2.26]; // df=1-9
        const dfIndex = Math.min(Math.floor(df) - 1, criticalValues.length - 1);
        
        if (dfIndex >= 0 && tStat > criticalValues[dfIndex]) {
            return 0.01; // p < 0.01
        } else if (tStat > 2.0) {
            return 0.05; // p < 0.05
        } else {
            return 0.1;  // p >= 0.05
        }
    }
    
    standardNormalCDF(x) {
        // 標準正規分布の累積分布関数の近似
        return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
    }
    
    erf(x) {
        // 誤差関数の近似
        const a1 =  0.254829592;
        const a2 = -0.284496736;
        const a3 =  1.421413741;
        const a4 = -1.453152027;
        const a5 =  1.061405429;
        const p  =  0.3275911;
        
        const sign = x < 0 ? -1 : 1;
        x = Math.abs(x);
        
        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        
        return sign * y;
    }
    
    determineChangeDirection(change) {
        if (change > 0) return 'increase';
        if (change < 0) return 'decrease';
        return 'no_change';
    }
    
    interpretVariabilityChange(change) {
        if (change > 0) return 'increased_variability';
        if (change < 0) return 'decreased_variability';
        return 'stable_variability';
    }
    
    validateComparisonData(data1, data2) {
        return data1.length > 0 && data2.length > 0;
    }
    
    createEmptyStatistics() {
        return {
            count: 0,
            sum: 0,
            mean: 0,
            median: 0,
            min: 0,
            max: 0,
            range: 0,
            standardDeviation: 0,
            variance: 0
        };
    }
    
    createInvalidComparisonResult(data1, data2) {
        return {
            error: 'invalid_data',
            message: 'Insufficient or invalid data for comparison',
            data1Size: data1.length,
            data2Size: data2.length
        };
    }
    
    generateComparisonId() {
        return `comparison_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // 簡略化された実装のプレースホルダ
    analyzeDistribution(data) { return { type: 'unknown' }; }
    compareTrends(data1, data2) { return { correlation: 0 }; }
    compareQuantiles(data1, data2, config) { return {}; }
    compareOutliers(data1, data2) { return {}; }
    analyzeCorrelation(data1, data2) { return { coefficient: 0 }; }
    assessOverallComparison(change, significance, effectSize, trends) { 
        return { 
            summary: 'comparison_complete',
            confidence: 0.5,
            recommendation: 'further_analysis_needed'
        }; 
    }
    generateRecommendations(assessment, change) { return []; }
    calculatePeriodLength(period) { return 1; }
    analyzeSeasonalityImpact(period1, period2) { return {}; }
    analyzeWeekdayWeekendSplit(period1, period2) { return {}; }
    calculateGrowthRate(data1, data2) { return 0; }
    calculateBaselineDeviation(current, baseline) { return 0; }
    calculatePerformanceIndex(current, baseline) { return 1; }
    calculateConfidenceInterval(current, baseline) { return { lower: 0, upper: 0 }; }
    determineAlertLevel(change, significance) { return 'normal'; }
}