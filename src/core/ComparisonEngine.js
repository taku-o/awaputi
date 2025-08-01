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
     * ステージ別比較機能
     */
    compareStagePerformance(stageData, options = {}) {
        const stageIds = Object.keys(stageData);
        if (stageIds.length < 2) {
            return {
                error: 'insufficient_stages',
                message: 'At least 2 stages required for comparison',
                availableStages: stageIds.length
            };
        }
        
        // ステージ別統計の計算
        const stageStatistics = {};
        const stageComparisons = {};
        
        stageIds.forEach(stageId => {
            const stage = stageData[stageId];
            stageStatistics[stageId] = {
                stageId: stageId,
                name: stage.name || stageId,
                difficulty: stage.difficulty || 'unknown',
                ...this.calculateStageStatistics(stage),
                performanceMetrics: this.calculateStagePerformanceMetrics(stage),
                difficultyAdjustedMetrics: this.calculateDifficultyAdjustedMetrics(stage)
            };
        });
        
        // ステージ間比較の実行
        for (let i = 0; i < stageIds.length; i++) {
            for (let j = i + 1; j < stageIds.length; j++) {
                const stageA = stageIds[i];
                const stageB = stageIds[j];
                
                const comparisonKey = `${stageA}_vs_${stageB}`;
                stageComparisons[comparisonKey] = this.compareIndividualStages(
                    stageStatistics[stageA],
                    stageStatistics[stageB],
                    options
                );
            }
        }
        
        // 統合分析
        const overallAnalysis = this.analyzeOverallStagePerformance(stageStatistics, stageComparisons);
        
        // ランキング生成
        const rankings = this.generateStageRankings(stageStatistics);
        
        // 改善提案
        const improvements = this.generateStageImprovementSuggestions(stageStatistics, overallAnalysis);
        
        return {
            comparisonId: this.generateComparisonId(),
            timestamp: Date.now(),
            
            // ステージ統計
            stageStatistics: stageStatistics,
            
            // ペアワイズ比較
            stageComparisons: stageComparisons,
            
            // 統合分析
            overallAnalysis: overallAnalysis,
            
            // ランキング
            rankings: rankings,
            
            // 改善提案
            improvements: improvements,
            
            // サマリー
            summary: {
                totalStages: stageIds.length,
                totalComparisons: Object.keys(stageComparisons).length,
                bestPerformingStage: rankings.overall[0],
                mostDifficultStage: rankings.difficulty[0],
                recommendedFocus: improvements.priorityStages
            }
        };
    }
    
    /**
     * ステージ統計の計算
     */
    calculateStageStatistics(stageData) {
        const sessions = stageData.sessions || [];
        
        if (sessions.length === 0) {
            return this.createEmptyStageStatistics();
        }
        
        // 基本統計
        const scores = sessions.map(s => s.score || 0);
        const playTimes = sessions.map(s => s.playTime || 0);
        const completionRates = sessions.map(s => s.completed ? 1 : 0);
        const bubblesPopped = sessions.map(s => s.bubblesPopped || 0);
        const bubblesMissed = sessions.map(s => s.bubblesMissed || 0);
        const maxCombos = sessions.map(s => s.maxCombo || 0);
        
        return {
            totalSessions: sessions.length,
            scoreStats: this.calculateBasicStatistics(scores.map(s => ({ value: s }))),
            playTimeStats: this.calculateBasicStatistics(playTimes.map(t => ({ value: t }))),
            completionRate: completionRates.reduce((sum, rate) => sum + rate, 0) / sessions.length,
            bubbleAccuracy: this.calculateBubbleAccuracy(bubblesPopped, bubblesMissed),
            comboStats: this.calculateBasicStatistics(maxCombos.map(c => ({ value: c }))),
            
            // 詳細統計
            sessionLengthConsistency: this.calculateConsistency(playTimes),
            scoreConsistency: this.calculateConsistency(scores),
            improvementTrend: this.calculateImprovementTrend(sessions),
            retryRate: this.calculateRetryRate(sessions),
            perfectRuns: sessions.filter(s => s.bubblesMissed === 0).length
        };
    }
    
    /**
     * ステージパフォーマンスメトリクスの計算
     */
    calculateStagePerformanceMetrics(stageData) {
        const sessions = stageData.sessions || [];
        
        if (sessions.length === 0) {
            return {};
        }
        
        // 効率メトリクス
        const timeEfficiency = sessions.map(s => {
            if (!s.playTime || s.playTime === 0) return 0;
            return (s.score || 0) / s.playTime;
        });
        
        const bubbleEfficiency = sessions.map(s => {
            const totalBubbles = (s.bubblesPopped || 0) + (s.bubblesMissed || 0);
            if (totalBubbles === 0) return 0;
            return (s.bubblesPopped || 0) / totalBubbles;
        });
        
        // 安定性メトリクス
        const scoreVariability = this.calculateVariabilityMetric(sessions.map(s => s.score || 0));
        const timeVariability = this.calculateVariabilityMetric(sessions.map(s => s.playTime || 0));
        
        // 成長メトリクス
        const learningRate = this.calculateLearningRate(sessions);
        const plateuScore = this.detectPerformancePlateau(sessions);
        
        return {
            efficiency: {
                timeEfficiency: this.calculateBasicStatistics(timeEfficiency.map(e => ({ value: e }))),
                bubbleEfficiency: this.calculateBasicStatistics(bubbleEfficiency.map(e => ({ value: e }))),
                overallEfficiency: (timeEfficiency.reduce((sum, e) => sum + e, 0) + 
                                  bubbleEfficiency.reduce((sum, e) => sum + e, 0)) / 2
            },
            stability: {
                scoreVariability: scoreVariability,
                timeVariability: timeVariability,
                consistencyIndex: this.calculateConsistencyIndex(scoreVariability, timeVariability)
            },
            growth: {
                learningRate: learningRate,
                hasPlateaued: plateuScore.hasPlateaued,
                plateauScore: plateuScore.score,
                improvementPotential: this.calculateImprovementPotential(sessions, learningRate)
            }
        };
    }
    
    /**
     * 難易度調整済みメトリクスの計算
     */
    calculateDifficultyAdjustedMetrics(stageData) {
        const difficulty = this.normalizeDifficulty(stageData.difficulty);
        const baseMetrics = this.calculateStageStatistics(stageData);
        
        // 難易度による調整係数
        const difficultyMultiplier = this.getDifficultyMultiplier(difficulty);
        
        return {
            adjustedScore: baseMetrics.scoreStats.mean * difficultyMultiplier.score,
            adjustedEfficiency: (baseMetrics.bubbleAccuracy / 100) * difficultyMultiplier.accuracy,
            adjustedCompletionRate: baseMetrics.completionRate * difficultyMultiplier.completion,
            difficultyRating: difficulty,
            
            // 相対パフォーマンス指標
            relativePerformance: {
                scorePerDifficulty: baseMetrics.scoreStats.mean / Math.max(difficulty, 0.1),
                accuracyPerDifficulty: (baseMetrics.bubbleAccuracy / 100) / Math.max(difficulty, 0.1),
                completionPerDifficulty: baseMetrics.completionRate / Math.max(difficulty, 0.1)
            }
        };
    }
    
    /**
     * 個別ステージ比較
     */
    compareIndividualStages(stageA, stageB, options = {}) {
        const comparison = {
            stages: {
                stageA: { id: stageA.stageId, name: stageA.name, difficulty: stageA.difficulty },
                stageB: { id: stageB.stageId, name: stageB.name, difficulty: stageB.difficulty }
            }
        };
        
        // 基本メトリクス比較
        comparison.scoreComparison = this.compareMetric(
            stageA.scoreStats, stageB.scoreStats, 'score'
        );
        
        comparison.timeComparison = this.compareMetric(
            stageA.playTimeStats, stageB.playTimeStats, 'playTime'
        );
        
        comparison.accuracyComparison = this.compareSimpleMetric(
            stageA.bubbleAccuracy, stageB.bubbleAccuracy, 'accuracy'
        );
        
        comparison.completionComparison = this.compareSimpleMetric(
            stageA.completionRate, stageB.completionRate, 'completionRate'
        );
        
        // 難易度調整済み比較
        comparison.difficultyAdjustedComparison = {
            scoreAdvantage: this.calculateDifficultyAdjustedAdvantage(
                stageA.difficultyAdjustedMetrics.adjustedScore,
                stageB.difficultyAdjustedMetrics.adjustedScore
            ),
            efficiencyAdvantage: this.calculateDifficultyAdjustedAdvantage(
                stageA.difficultyAdjustedMetrics.adjustedEfficiency,
                stageB.difficultyAdjustedMetrics.adjustedEfficiency
            )
        };
        
        // パフォーマンス分析
        comparison.performanceAnalysis = this.analyzeStagePerformanceDifferences(stageA, stageB);
        
        // 推奨事項
        comparison.recommendations = this.generateStageComparisonRecommendations(stageA, stageB, comparison);
        
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
    
    // ステージ比較用ヘルパーメソッド
    createEmptyStageStatistics() {
        return {
            totalSessions: 0,
            scoreStats: this.createEmptyStatistics(),
            playTimeStats: this.createEmptyStatistics(),
            completionRate: 0,
            bubbleAccuracy: 0,
            comboStats: this.createEmptyStatistics(),
            sessionLengthConsistency: 0,
            scoreConsistency: 0,
            improvementTrend: 0,
            retryRate: 0,
            perfectRuns: 0
        };
    }
    
    calculateBubbleAccuracy(poppedList, missedList) {
        const totalPopped = Array.isArray(poppedList) ? 
            poppedList.reduce((sum, val) => sum + val, 0) : (poppedList || 0);
        const totalMissed = Array.isArray(missedList) ? 
            missedList.reduce((sum, val) => sum + val, 0) : (missedList || 0);
        
        const total = totalPopped + totalMissed;
        return total > 0 ? (totalPopped / total) * 100 : 0;
    }
    
    calculateConsistency(values) {
        if (values.length <= 1) return 0;
        
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
        const standardDeviation = Math.sqrt(variance);
        
        return mean > 0 ? (1 - (standardDeviation / mean)) * 100 : 0;
    }
    
    calculateImprovementTrend(sessions) {
        if (sessions.length <= 1) return 0;
        
        // 線形回帰による傾向計算
        const n = sessions.length;
        const x = Array.from({ length: n }, (_, i) => i + 1);
        const y = sessions.map(s => s.score || 0);
        
        const sumX = x.reduce((sum, val) => sum + val, 0);
        const sumY = y.reduce((sum, val) => sum + val, 0);
        const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
        const sumXX = x.reduce((sum, val) => sum + val * val, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        return isNaN(slope) ? 0 : slope;
    }
    
    calculateRetryRate(sessions) {
        if (sessions.length === 0) return 0;
        
        const failed = sessions.filter(s => !s.completed).length;
        return (failed / sessions.length) * 100;
    }
    
    calculateVariabilityMetric(values) {
        if (values.length <= 1) return 0;
        
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
        
        return Math.sqrt(variance);
    }
    
    calculateLearningRate(sessions) {
        if (sessions.length < 3) return 0;
        
        // 最初の1/3と最後の1/3を比較
        const firstThird = sessions.slice(0, Math.ceil(sessions.length / 3));
        const lastThird = sessions.slice(-Math.ceil(sessions.length / 3));
        
        const firstAvg = firstThird.reduce((sum, s) => sum + (s.score || 0), 0) / firstThird.length;
        const lastAvg = lastThird.reduce((sum, s) => sum + (s.score || 0), 0) / lastThird.length;
        
        return firstAvg > 0 ? ((lastAvg - firstAvg) / firstAvg) * 100 : 0;
    }
    
    detectPerformancePlateau(sessions) {
        if (sessions.length < 5) return { hasPlateaued: false, score: 0 };
        
        const recentSessions = sessions.slice(-5);
        const scores = recentSessions.map(s => s.score || 0);
        const variability = this.calculateVariabilityMetric(scores);
        const mean = scores.reduce((sum, val) => sum + val, 0) / scores.length;
        
        const hasPlateaued = mean > 0 && (variability / mean) < 0.1; // 10%未満の変動
        
        return { hasPlateaued, score: mean };
    }
    
    calculateConsistencyIndex(scoreVar, timeVar) {
        const normalizedScoreVar = Math.min(scoreVar / 1000, 1); // 正規化
        const normalizedTimeVar = Math.min(timeVar / 60000, 1); // 正規化（分単位）
        
        return Math.max(0, 1 - (normalizedScoreVar + normalizedTimeVar) / 2) * 100;
    }
    
    calculateImprovementPotential(sessions, learningRate) {
        if (sessions.length === 0) return 0;
        
        const recentPerformance = sessions.slice(-3);
        const avgRecentScore = recentPerformance.reduce((sum, s) => sum + (s.score || 0), 0) / recentPerformance.length;
        const maxScore = Math.max(...sessions.map(s => s.score || 0));
        
        const currentPotential = maxScore > 0 ? (avgRecentScore / maxScore) * 100 : 0;
        const learningFactor = Math.max(0, learningRate) / 10; // 学習率による調整
        
        return Math.min(100, currentPotential + learningFactor);
    }
    
    normalizeDifficulty(difficulty) {
        if (typeof difficulty === 'number') return Math.max(0.1, Math.min(5, difficulty));
        
        const difficultyMap = {
            'very_easy': 0.5,
            'easy': 1,
            'normal': 2,
            'hard': 3,
            'very_hard': 4,
            'extreme': 5
        };
        
        return difficultyMap[difficulty] || 2;
    }
    
    getDifficultyMultiplier(difficulty) {
        return {
            score: Math.pow(difficulty, 0.5), // 平方根で調整
            accuracy: 1 + (difficulty - 1) * 0.2, // 線形調整
            completion: 1 + (difficulty - 1) * 0.3 // より強い調整
        };
    }
    
    compareMetric(statsA, statsB, metricName) {
        return {
            metricName: metricName,
            stageA: {
                mean: statsA.mean,
                median: statsA.median,
                standardDeviation: statsA.standardDeviation
            },
            stageB: {
                mean: statsB.mean,
                median: statsB.median,
                standardDeviation: statsB.standardDeviation
            },
            difference: {
                mean: statsB.mean - statsA.mean,
                percent: statsA.mean > 0 ? ((statsB.mean - statsA.mean) / statsA.mean) * 100 : 0
            },
            winner: statsB.mean > statsA.mean ? 'stageB' : 'stageA',
            confidence: this.calculateComparisonConfidence(statsA, statsB)
        };
    }
    
    compareSimpleMetric(valueA, valueB, metricName) {
        return {
            metricName: metricName,
            stageA: valueA,
            stageB: valueB,
            difference: {
                absolute: valueB - valueA,
                percent: valueA > 0 ? ((valueB - valueA) / valueA) * 100 : 0
            },
            winner: valueB > valueA ? 'stageB' : 'stageA'
        };
    }
    
    calculateDifficultyAdjustedAdvantage(valueA, valueB) {
        if (valueA === 0 && valueB === 0) return { advantage: 'none', ratio: 1 };
        if (valueA === 0) return { advantage: 'stageB', ratio: Infinity };
        if (valueB === 0) return { advantage: 'stageA', ratio: Infinity };
        
        const ratio = valueB / valueA;
        const advantage = ratio > 1.1 ? 'stageB' : ratio < 0.9 ? 'stageA' : 'none';
        
        return { advantage, ratio };
    }
    
    calculateComparisonConfidence(statsA, statsB) {
        // 簡易的な信頼度計算
        const sampleSizeA = statsA.count || 0;
        const sampleSizeB = statsB.count || 0;
        
        if (sampleSizeA < 3 || sampleSizeB < 3) return 'low';
        if (sampleSizeA < 10 || sampleSizeB < 10) return 'medium';
        return 'high';
    }
    
    analyzeStagePerformanceDifferences(stageA, stageB) {
        return {
            strengthsA: this.identifyStageStrengths(stageA),
            strengthsB: this.identifyStageStrengths(stageB),
            weaknessesA: this.identifyStageWeaknesses(stageA),
            weaknessesB: this.identifyStageWeaknesses(stageB),
            overallAssessment: this.assessOverallStagePerformance(stageA, stageB)
        };
    }
    
    identifyStageStrengths(stage) {
        const strengths = [];
        
        if (stage.completionRate > 0.8) strengths.push('high_completion_rate');
        if (stage.bubbleAccuracy > 85) strengths.push('high_accuracy');
        if (stage.scoreConsistency > 70) strengths.push('consistent_performance');
        if (stage.improvementTrend > 0) strengths.push('positive_learning_trend');
        if (stage.perfectRuns > stage.totalSessions * 0.1) strengths.push('frequent_perfect_runs');
        
        return strengths;
    }
    
    identifyStageWeaknesses(stage) {
        const weaknesses = [];
        
        if (stage.completionRate < 0.5) weaknesses.push('low_completion_rate');
        if (stage.bubbleAccuracy < 70) weaknesses.push('low_accuracy');
        if (stage.scoreConsistency < 30) weaknesses.push('inconsistent_performance');
        if (stage.improvementTrend < -5) weaknesses.push('declining_performance');
        if (stage.retryRate > 50) weaknesses.push('high_retry_rate');
        
        return weaknesses;
    }
    
    assessOverallStagePerformance(stageA, stageB) {
        const scoreA = this.calculateOverallPerformanceScore(stageA);
        const scoreB = this.calculateOverallPerformanceScore(stageB);
        
        return {
            stageA: { score: scoreA, rating: this.getRatingFromScore(scoreA) },
            stageB: { score: scoreB, rating: this.getRatingFromScore(scoreB) },
            winner: scoreA > scoreB ? 'stageA' : 'stageB',
            margin: Math.abs(scoreA - scoreB)
        };
    }
    
    calculateOverallPerformanceScore(stage) {
        const weights = {
            completion: 0.3,
            accuracy: 0.25,
            consistency: 0.2,
            improvement: 0.15,
            efficiency: 0.1
        };
        
        const scores = {
            completion: stage.completionRate * 100,
            accuracy: stage.bubbleAccuracy,
            consistency: stage.scoreConsistency,
            improvement: Math.max(0, stage.improvementTrend),
            efficiency: stage.performanceMetrics?.efficiency?.overallEfficiency || 0
        };
        
        return Object.keys(weights).reduce((total, key) => {
            return total + (scores[key] * weights[key]);
        }, 0);
    }
    
    getRatingFromScore(score) {
        if (score >= 80) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 60) return 'average';
        if (score >= 50) return 'below_average';
        return 'poor';
    }
    
    generateStageComparisonRecommendations(stageA, stageB, comparison) {
        const recommendations = [];
        
        // 完了率に基づく推奨
        if (comparison.completionComparison.winner === 'stageB' && comparison.completionComparison.difference.percent > 20) {
            recommendations.push({
                type: 'focus_practice',
                stage: stageA.stageId,
                reason: 'low_completion_rate',
                suggestion: `${stageA.name}での完了率を向上させるため、より集中的な練習を推奨`
            });
        }
        
        // 精度に基づく推奨
        if (comparison.accuracyComparison.winner === 'stageB' && comparison.accuracyComparison.difference.percent > 15) {
            recommendations.push({
                type: 'accuracy_improvement',
                stage: stageA.stageId,
                reason: 'low_accuracy',
                suggestion: `${stageA.name}での泡の精度向上に重点を置いた練習を推奨`
            });
        }
        
        // 難易度調整に基づく推奨
        if (comparison.difficultyAdjustedComparison.scoreAdvantage.advantage === 'stageB') {
            recommendations.push({
                type: 'difficulty_consideration',
                stage: stageA.stageId,
                reason: 'difficulty_adjusted_performance',
                suggestion: `難易度を考慮すると${stageB.name}の方が効率的。戦略の見直しを推奨`
            });
        }
        
        return recommendations;
    }
    
    analyzeOverallStagePerformance(stageStatistics, stageComparisons) {
        const stageIds = Object.keys(stageStatistics);
        
        return {
            performanceDistribution: this.analyzePerformanceDistribution(stageStatistics),
            difficultyCorrelation: this.analyzeDifficultyCorrelation(stageStatistics),
            learningPatterns: this.analyzeLearningPatterns(stageStatistics),
            optimalProgression: this.determineOptimalProgression(stageStatistics),
            bottlenecks: this.identifyPerformanceBottlenecks(stageStatistics)
        };
    }
    
    generateStageRankings(stageStatistics) {
        const stageIds = Object.keys(stageStatistics);
        
        return {
            overall: this.rankStagesByOverallPerformance(stageStatistics),
            difficulty: this.rankStagesByDifficulty(stageStatistics),
            improvement: this.rankStagesByImprovement(stageStatistics),
            consistency: this.rankStagesByConsistency(stageStatistics),
            efficiency: this.rankStagesByEfficiency(stageStatistics)
        };
    }
    
    generateStageImprovementSuggestions(stageStatistics, overallAnalysis) {
        const suggestions = [];
        const stageIds = Object.keys(stageStatistics);
        
        stageIds.forEach(stageId => {
            const stage = stageStatistics[stageId];
            const stageSuggestions = this.generateIndividualStageSuggestions(stage);
            suggestions.push(...stageSuggestions);
        });
        
        return {
            individualSuggestions: suggestions,
            priorityStages: this.identifyPriorityStages(stageStatistics),
            generalRecommendations: this.generateGeneralRecommendations(overallAnalysis)
        };
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
    
    // 改善提案システムの実装
    generatePersonalizedImprovementPlan(playerData, comparisonAnalysis, options = {}) {
        const config = {
            focusAreas: 3, // 重点分野の数
            timeHorizon: 30, // 日数
            difficultyPreference: 'gradual', // 'aggressive', 'gradual', 'conservative'
            includeMotivationalElements: true,
            ...options
        };
        
        // プレイスタイル分析
        const playStyle = this.analyzePlayStyle(playerData);
        
        // 弱点と改善機会の特定
        const weaknesses = this.identifyPlayerWeaknesses(playerData, comparisonAnalysis);
        const opportunities = this.identifyImprovementOpportunities(playerData, comparisonAnalysis);
        
        // 個別化された提案生成
        const personalizedSuggestions = this.generatePersonalizedSuggestions(playStyle, weaknesses, opportunities, config);
        
        // 実行可能なアクションプラン
        const actionPlan = this.createActionPlan(personalizedSuggestions, config);
        
        // モチベーション要素
        const motivationalElements = config.includeMotivationalElements ? 
            this.generateMotivationalElements(playerData, actionPlan) : null;
        
        return {
            planId: this.generatePlanId(),
            timestamp: Date.now(),
            playerProfile: playStyle,
            
            // 分析結果
            analysis: {
                strengths: this.identifyPlayerStrengths(playerData),
                weaknesses: weaknesses,
                opportunities: opportunities,
                threats: this.identifyPerformanceThreats(playerData)
            },
            
            // 個別提案
            suggestions: personalizedSuggestions,
            
            // アクションプラン
            actionPlan: actionPlan,
            
            // モチベーション要素
            motivation: motivationalElements,
            
            // 成功メトリクス
            successMetrics: this.defineSuccessMetrics(personalizedSuggestions),
            
            // フォローアップ
            followUp: this.createFollowUpPlan(actionPlan, config.timeHorizon)
        };
    }
    
    analyzePlayStyle(playerData) {
        const stats = playerData.statistics || {};
        
        // プレイパターンの分析
        const patterns = {
            pace: this.analyzePace(stats),
            riskTolerance: this.analyzeRiskTolerance(stats),
            consistency: this.analyzeConsistencyPattern(stats),
            learningStyle: this.analyzeLearningStyle(stats),
            preferredStages: this.analyzeStagePreferences(stats),
            sessionHabits: this.analyzeSessionHabits(stats)
        };
        
        // プレイスタイル分類
        const styleClassification = this.classifyPlayStyle(patterns);
        
        return {
            classification: styleClassification,
            patterns: patterns,
            characteristics: this.getStyleCharacteristics(styleClassification),
            recommendations: this.getStyleBasedRecommendations(styleClassification)
        };
    }
    
    identifyPlayerWeaknesses(playerData, comparisonAnalysis) {
        const weaknesses = [];
        const stats = playerData.statistics || {};
        const benchmarks = comparisonAnalysis.benchmarks || {};
        
        // スコア関連の弱点
        if (stats.averageScore < benchmarks.averageScore * 0.8) {
            weaknesses.push({
                type: 'low_average_score',
                severity: 'high',
                description: '平均スコアがベンチマークより20%以上低い',
                impactArea: 'scoring',
                priority: 1
            });
        }
        
        // 精度関連の弱点
        if (stats.bubbleAccuracy < benchmarks.bubbleAccuracy * 0.85) {
            weaknesses.push({
                type: 'low_accuracy',
                severity: 'medium',
                description: '泡の命中精度が平均より低い',
                impactArea: 'accuracy',
                priority: 2
            });
        }
        
        // 一貫性関連の弱点
        if (this.calculateScoreVariability(stats) > benchmarks.scoreVariability * 1.3) {
            weaknesses.push({
                type: 'inconsistent_performance',
                severity: 'medium',
                description: 'パフォーマンスの一貫性に課題がある',
                impactArea: 'consistency',
                priority: 2
            });
        }
        
        // 学習効率の弱点
        if (stats.improvementTrend < 0) {
            weaknesses.push({
                type: 'declining_performance',
                severity: 'high',
                description: '最近のパフォーマンスが低下傾向にある',
                impactArea: 'learning',
                priority: 1
            });
        }
        
        // 完了率の弱点
        if (stats.completionRate < benchmarks.completionRate * 0.75) {
            weaknesses.push({
                type: 'low_completion_rate',
                severity: 'medium',
                description: 'ステージ完了率が平均より低い',
                impactArea: 'completion',
                priority: 2
            });
        }
        
        return weaknesses.sort((a, b) => a.priority - b.priority);
    }
    
    identifyImprovementOpportunities(playerData, comparisonAnalysis) {
        const opportunities = [];
        const stats = playerData.statistics || {};
        
        // スキル向上の機会
        const skillGaps = this.identifySkillGaps(stats, comparisonAnalysis);
        skillGaps.forEach(gap => {
            opportunities.push({
                type: 'skill_improvement',
                area: gap.skill,
                potential: gap.potential,
                timeframe: gap.estimatedTime,
                description: `${gap.skill}スキルの向上により${gap.potential}%のパフォーマンス向上が期待できる`
            });
        });
        
        // ステージ最適化の機会
        const stageOpportunities = this.identifyStageOptimizationOpportunities(stats);
        opportunities.push(...stageOpportunities);
        
        // プレイ時間最適化の機会
        const timeOptimization = this.identifyTimeOptimizationOpportunities(stats);
        if (timeOptimization) {
            opportunities.push(timeOptimization);
        }
        
        return opportunities;
    }
    
    generatePersonalizedSuggestions(playStyle, weaknesses, opportunities, config) {
        const suggestions = [];
        
        // 弱点に基づく提案
        weaknesses.slice(0, config.focusAreas).forEach(weakness => {
            const suggestion = this.createWeaknessBasedSuggestion(weakness, playStyle, config);
            suggestions.push(suggestion);
        });
        
        // 機会に基づく提案
        opportunities.filter(opp => opp.potential > 10).forEach(opportunity => {
            const suggestion = this.createOpportunityBasedSuggestion(opportunity, playStyle, config);
            suggestions.push(suggestion);
        });
        
        // プレイスタイルに基づく提案
        const styleSuggestions = this.createStyleBasedSuggestions(playStyle, config);
        suggestions.push(...styleSuggestions);
        
        return suggestions.slice(0, 5); // 最大5つの提案
    }
    
    createWeaknessBasedSuggestion(weakness, playStyle, config) {
        const suggestionTemplates = {
            low_average_score: {
                title: 'スコア向上トレーニング',
                description: '特殊泡を狙った集中練習でスコアを向上させましょう',
                actions: [
                    'レインボー泡を優先的に狙う練習',
                    'コンボ継続テクニックの習得',
                    '高得点ステージでの反復練習'
                ],
                expectedImprovement: '15-25%のスコア向上',
                timeframe: '2-3週間'
            },
            low_accuracy: {
                title: '精度向上プログラム',
                description: '狙いを定めた正確なクリックでミスを減らしましょう',
                actions: [
                    'スロー泡でのターゲット練習',
                    'マウス感度の最適化',
                    '短いセッションでの集中練習'
                ],
                expectedImprovement: '10-20%の精度向上',
                timeframe: '1-2週間'
            },
            inconsistent_performance: {
                title: '安定性向上トレーニング',
                description: '一定のパフォーマンスを維持する練習を行いましょう',
                actions: [
                    '毎日決まった時間での短期練習',
                    'ウォームアップルーチンの確立',
                    '集中力維持テクニックの習得'
                ],
                expectedImprovement: 'パフォーマンスの安定化',
                timeframe: '3-4週間'
            }
        };
        
        const template = suggestionTemplates[weakness.type] || suggestionTemplates.low_average_score;
        
        return {
            id: this.generateSuggestionId(),
            type: 'weakness_improvement',
            priority: weakness.priority,
            ...template,
            targetWeakness: weakness.type,
            personalizedActions: this.personalizeActions(template.actions, playStyle)
        };
    }
    
    createOpportunityBasedSuggestion(opportunity, playStyle, config) {
        return {
            id: this.generateSuggestionId(),
            type: 'opportunity_exploitation',
            title: `${opportunity.area}の最適化`,
            description: opportunity.description,
            potential: opportunity.potential,
            timeframe: opportunity.timeframe,
            actions: this.generateOpportunityActions(opportunity, playStyle),
            priority: Math.ceil(opportunity.potential / 10)
        };
    }
    
    createStyleBasedSuggestions(playStyle, config) {
        const suggestions = [];
        const style = playStyle.classification;
        
        const styleSpecificSuggestions = {
            aggressive: [
                {
                    title: 'リスク管理の習得',
                    description: '攻撃的なプレイスタイルにリスク管理を組み合わせましょう',
                    actions: ['安全な泡を確保してからリスクを取る', '残り時間を意識した戦略の切り替え']
                }
            ],
            conservative: [
                {
                    title: 'チャンス活用の強化',
                    description: '安全性を保ちながらより多くのチャンスを活用しましょう',
                    actions: ['特殊泡出現時の迅速な判断練習', 'リスクとリターンの計算練習']
                }
            ],
            balanced: [
                {
                    title: 'スペシャリゼーションの検討',
                    description: '特定の分野での強みをさらに伸ばしましょう',
                    actions: ['得意なステージタイプの特定', '専門スキルの集中強化']
                }
            ]
        };
        
        const styleSuggestions = styleSpecificSuggestions[style] || styleSpecificSuggestions.balanced;
        
        styleSuggestions.forEach(suggestion => {
            suggestions.push({
                id: this.generateSuggestionId(),
                type: 'style_optimization',
                priority: 3,
                timeframe: '2-4週間',
                ...suggestion
            });
        });
        
        return suggestions;
    }
    
    createActionPlan(suggestions, config) {
        const plan = {
            phases: [],
            timeline: config.timeHorizon,
            milestones: []
        };
        
        // フェーズ分け
        const phaseDuration = Math.ceil(config.timeHorizon / 3);
        
        // Phase 1: 基礎固め
        plan.phases.push({
            phase: 1,
            name: '基礎強化フェーズ',
            duration: phaseDuration,
            focus: 'weakness_improvement',
            actions: this.getPhaseActions(suggestions, 'weakness_improvement', 1),
            goals: this.getPhaseGoals(suggestions, 1)
        });
        
        // Phase 2: スキル向上
        plan.phases.push({
            phase: 2,
            name: 'スキル向上フェーズ',
            duration: phaseDuration,
            focus: 'opportunity_exploitation',
            actions: this.getPhaseActions(suggestions, 'opportunity_exploitation', 2),
            goals: this.getPhaseGoals(suggestions, 2)
        });
        
        // Phase 3: 最適化
        plan.phases.push({
            phase: 3,
            name: '最適化フェーズ',
            duration: config.timeHorizon - phaseDuration * 2,
            focus: 'style_optimization',
            actions: this.getPhaseActions(suggestions, 'style_optimization', 3),
            goals: this.getPhaseGoals(suggestions, 3)
        });
        
        // マイルストーン設定
        plan.milestones = this.createMilestones(plan.phases);
        
        return plan;
    }
    
    generateMotivationalElements(playerData, actionPlan) {
        return {
            encouragement: this.generateEncouragement(playerData),
            achievements: this.predictAchievements(actionPlan),
            challenges: this.createPersonalChallenges(playerData, actionPlan),
            socialElements: this.generateSocialMotivation(playerData),
            rewards: this.suggestRewardMilestones(actionPlan)
        };
    }
    
    defineSuccessMetrics(suggestions) {
        const metrics = [];
        
        suggestions.forEach(suggestion => {
            switch (suggestion.type) {
                case 'weakness_improvement':
                    metrics.push({
                        name: `${suggestion.targetWeakness}_improvement`,
                        type: 'improvement_percentage',
                        target: suggestion.expectedImprovement,
                        measurement: 'weekly_average'
                    });
                    break;
                case 'opportunity_exploitation':
                    metrics.push({
                        name: `${suggestion.title}_utilization`,
                        type: 'opportunity_realization',
                        target: `${suggestion.potential}% potential realized`,
                        measurement: 'cumulative'
                    });
                    break;
                case 'style_optimization':
                    metrics.push({
                        name: 'style_consistency',
                        type: 'consistency_score',
                        target: 'improved consistency',
                        measurement: 'rolling_average'
                    });
                    break;
            }
        });
        
        return metrics;
    }
    
    createFollowUpPlan(actionPlan, timeHorizon) {
        const checkpoints = [];
        const weeklyInterval = Math.ceil(timeHorizon / 4); // 4回のチェックポイント
        
        for (let i = 1; i <= 4; i++) {
            checkpoints.push({
                week: i * weeklyInterval,
                focus: this.getCheckpointFocus(i),
                assessments: this.getCheckpointAssessments(i),
                adjustments: this.getCheckpointAdjustments(i)
            });
        }
        
        return {
            checkpoints: checkpoints,
            finalReview: {
                week: timeHorizon,
                comprehensive: true,
                nextPlanGeneration: true
            }
        };
    }
    
    // ヘルパーメソッドの実装
    analyzePace(stats) {
        const avgSessionTime = stats.averageSessionLength || 0;
        if (avgSessionTime < 180000) return 'fast'; // 3分未満
        if (avgSessionTime > 600000) return 'slow'; // 10分超
        return 'medium';
    }
    
    analyzeRiskTolerance(stats) {
        const perfectGameRate = (stats.perfectGames || 0) / Math.max(stats.totalGamesPlayed || 1, 1);
        if (perfectGameRate > 0.3) return 'conservative';
        if (perfectGameRate < 0.1) return 'risk_taking';
        return 'balanced';
    }
    
    analyzeConsistencyPattern(stats) {
        const scoreVariability = this.calculateScoreVariability(stats);
        if (scoreVariability < 0.2) return 'highly_consistent';
        if (scoreVariability > 0.5) return 'highly_variable';
        return 'moderately_consistent';
    }
    
    analyzeLearningStyle(stats) {
        const improvementTrend = stats.improvementTrend || 0;
        if (improvementTrend > 5) return 'fast_learner';
        if (improvementTrend < -2) return 'needs_support';
        return 'steady_learner';
    }
    
    analyzeStagePreferences(stats) {
        const stageStats = stats.stageStats || {};
        const favorites = Object.entries(stageStats)
            .sort((a, b) => b[1].gamesPlayed - a[1].gamesPlayed)
            .slice(0, 3)
            .map(([stageId]) => stageId);
        return favorites;
    }
    
    analyzeSessionHabits(stats) {
        const playTimeByHour = stats.playTimeByHour || new Array(24).fill(0);
        const peakHour = playTimeByHour.indexOf(Math.max(...playTimeByHour));
        
        return {
            peakHour: peakHour,
            averageSessionsPerDay: (stats.totalGamesPlayed || 0) / Math.max((stats.totalPlayTime || 1) / 86400000, 1),
            preferredTimeSlot: this.getTimeSlot(peakHour)
        };
    }
    
    classifyPlayStyle(patterns) {
        if (patterns.riskTolerance === 'risk_taking' && patterns.pace === 'fast') {
            return 'aggressive';
        }
        if (patterns.riskTolerance === 'conservative' && patterns.consistency === 'highly_consistent') {
            return 'conservative';
        }
        return 'balanced';
    }
    
    calculateScoreVariability(stats) {
        if (!stats.totalScore || !stats.totalGamesPlayed) return 0;
        const avgScore = stats.totalScore / stats.totalGamesPlayed;
        return stats.highestScore > 0 ? 1 - (avgScore / stats.highestScore) : 0;
    }
    
    // プレースホルダ実装
    getStyleCharacteristics(style) { return {}; }
    getStyleBasedRecommendations(style) { return []; }
    identifyPlayerStrengths(playerData) { return []; }
    identifyPerformanceThreats(playerData) { return []; }
    identifySkillGaps(stats, analysis) { return []; }
    identifyStageOptimizationOpportunities(stats) { return []; }
    identifyTimeOptimizationOpportunities(stats) { return null; }
    personalizeActions(actions, playStyle) { return actions; }
    generateOpportunityActions(opportunity, playStyle) { return []; }
    getPhaseActions(suggestions, type, phase) { return []; }
    getPhaseGoals(suggestions, phase) { return []; }
    createMilestones(phases) { return []; }
    generateEncouragement(playerData) { return ''; }
    predictAchievements(actionPlan) { return []; }
    createPersonalChallenges(playerData, actionPlan) { return []; }
    generateSocialMotivation(playerData) { return {}; }
    suggestRewardMilestones(actionPlan) { return []; }
    getCheckpointFocus(week) { return 'general'; }
    getCheckpointAssessments(week) { return []; }
    getCheckpointAdjustments(week) { return []; }
    getTimeSlot(hour) { return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'; }
    generatePlanId() { return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; }
    generateSuggestionId() { return `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; }
    
    // 残りのステージ比較用プレースホルダ
    analyzePerformanceDistribution(stats) { return {}; }
    analyzeDifficultyCorrelation(stats) { return { correlation: 0 }; }
    analyzeLearningPatterns(stats) { return {}; }
    determineOptimalProgression(stats) { return []; }
    identifyPerformanceBottlenecks(stats) { return []; }
    rankStagesByOverallPerformance(stats) { return Object.keys(stats); }
    rankStagesByDifficulty(stats) { return Object.keys(stats); }
    rankStagesByImprovement(stats) { return Object.keys(stats); }
    rankStagesByConsistency(stats) { return Object.keys(stats); }
    rankStagesByEfficiency(stats) { return Object.keys(stats); }
    generateIndividualStageSuggestions(stage) { return []; }
    identifyPriorityStages(stats) { return []; }
    generateGeneralRecommendations(analysis) { return []; }
}