/**
 * StatisticalAnalyzer - 基本統計計算と有意性検定
 * 
 * ComparisonEngineから分離された統計計算専用コンポーネント
 * - 基本統計値計算（平均、分散、分位数、歪度、尖度）
 * - 統計的有意性検定（t検定、Mann-Whitney U検定）
 * - 効果量計算
 * - 数学関数群（正規分布、誤差関数）
 */

export class StatisticalAnalyzer {
    constructor() {
        // 統計計算の設定値
        this.config = {
            significanceLevel: 0.05,
            minimumSampleSize: 5,
            maxSampleSize: 10000
        };
    }

    /**
     * 基本統計を計算
     * @param {Array} data - 数値データ配列
     * @returns {object} 基本統計値
     */
    calculateBasicStatistics(data) {
        if (!Array.isArray(data) || data.length === 0) {
            return this.createEmptyStatistics();
        }

        const validData = data.filter(x => typeof x === 'number' && !isNaN(x));
        if (validData.length === 0) {
            return this.createEmptyStatistics();
        }

        const n = validData.length;
        const sum = validData.reduce((a, b) => a + b, 0);
        const mean = sum / n;
        
        const variance = validData.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
        const stdDev = Math.sqrt(variance);
        
        const sortedData = [...validData].sort((a, b) => a - b);
        const min = sortedData[0];
        const max = sortedData[n - 1];
        const median = this.calculateQuantile(sortedData, 0.5);
        const q1 = this.calculateQuantile(sortedData, 0.25);
        const q3 = this.calculateQuantile(sortedData, 0.75);
        
        return {
            count: n,
            sum,
            mean,
            variance: isNaN(variance) ? 0 : variance,
            standardDeviation: isNaN(stdDev) ? 0 : stdDev,
            minimum: min,
            maximum: max,
            median,
            q1,
            q3,
            range: max - min,
            iqr: q3 - q1,
            skewness: this.calculateSkewness(validData, mean, stdDev),
            kurtosis: this.calculateKurtosis(validData, mean, stdDev)
        };
    }

    /**
     * 分位数を計算
     * @param {Array} sortedData - ソート済みデータ
     * @param {number} quantile - 分位数（0-1）
     * @returns {number} 分位数値
     */
    calculateQuantile(sortedData, quantile) {
        if (sortedData.length === 0) return 0;
        if (quantile <= 0) return sortedData[0];
        if (quantile >= 1) return sortedData[sortedData.length - 1];
        
        const index = (sortedData.length - 1) * quantile;
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        
        if (lower === upper) {
            return sortedData[lower];
        }
        
        const weight = index - lower;
        return sortedData[lower] * (1 - weight) + sortedData[upper] * weight;
    }

    /**
     * 歪度を計算
     * @param {Array} data - データ配列
     * @param {number} mean - 平均値
     * @param {number} stdDev - 標準偏差
     * @returns {number} 歪度
     */
    calculateSkewness(data, mean, stdDev) {
        if (data.length < 3 || stdDev === 0) return 0;
        
        const n = data.length;
        const sumCubed = data.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 3), 0);
        return (n / ((n - 1) * (n - 2))) * sumCubed;
    }

    /**
     * 尖度を計算
     * @param {Array} data - データ配列
     * @param {number} mean - 平均値
     * @param {number} stdDev - 標準偏差
     * @returns {number} 尖度
     */
    calculateKurtosis(data, mean, stdDev) {
        if (data.length < 4 || stdDev === 0) return 0;
        
        const n = data.length;
        const sumFourth = data.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 4), 0);
        const kurtosis = (n * (n + 1) / ((n - 1) * (n - 2) * (n - 3))) * sumFourth - 
                        (3 * (n - 1) * (n - 1) / ((n - 2) * (n - 3)));
        return kurtosis;
    }

    /**
     * 統計的有意性検定を実行
     * @param {Array} data1 - データセット1
     * @param {Array} data2 - データセット2
     * @param {object} options - 検定オプション
     * @returns {object} 検定結果
     */
    performSignificanceTest(data1, data2, options = {}) {
        const stats1 = this.calculateBasicStatistics(data1);
        const stats2 = this.calculateBasicStatistics(data2);
        
        if (stats1.count < this.config.minimumSampleSize || stats2.count < this.config.minimumSampleSize) {
            return {
                test: 'insufficient_data',
                pValue: null,
                significant: false,
                testStatistic: null,
                confidenceInterval: null,
                effectSize: null,
                interpretation: 'データが不十分です（最低5サンプル必要）'
            };
        }

        // 正規性検定
        const normality1 = this.testNormality(data1);
        const normality2 = this.testNormality(data2);
        
        let testResult;
        
        // 両方とも正規分布に従う場合はt検定、そうでなければMann-Whitney U検定
        if (normality1.isNormal && normality2.isNormal) {
            testResult = this.performTTest(data1, data2);
            testResult.test = 't-test';
        } else {
            testResult = this.performMannWhitneyU(data1, data2);
            testResult.test = 'mann-whitney-u';
        }
        
        // 効果量計算
        const effectSize = this.calculateEffectSize(stats1, stats2);
        testResult.effectSize = effectSize;
        
        // 有意性判定
        testResult.significant = testResult.pValue < this.config.significanceLevel;
        
        // 解釈を追加
        testResult.interpretation = this.interpretSignificanceTest(testResult);
        
        return testResult;
    }

    /**
     * t検定を実行
     * @param {Array} data1 - データセット1
     * @param {Array} data2 - データセット2
     * @returns {object} t検定結果
     */
    performTTest(data1, data2) {
        const stats1 = this.calculateBasicStatistics(data1);
        const stats2 = this.calculateBasicStatistics(data2);
        
        // Welchのt検定（等分散を仮定しない）
        const pooledSE = Math.sqrt(
            (stats1.variance / stats1.count) + (stats2.variance / stats2.count)
        );
        
        const tStatistic = (stats1.mean - stats2.mean) / pooledSE;
        
        // 自由度（Welch-Satterthwaite式）
        const df = Math.pow(pooledSE, 4) / (
            Math.pow(stats1.variance / stats1.count, 2) / (stats1.count - 1) +
            Math.pow(stats2.variance / stats2.count, 2) / (stats2.count - 1)
        );
        
        const pValue = this.approximateTTestPValue(Math.abs(tStatistic), df);
        
        return {
            testStatistic: tStatistic,
            degreesOfFreedom: df,
            pValue: pValue * 2, // 両側検定
            meanDifference: stats1.mean - stats2.mean,
            standardError: pooledSE
        };
    }

    /**
     * Mann-Whitney U検定を実行
     * @param {Array} data1 - データセット1
     * @param {Array} data2 - データセット2
     * @returns {object} Mann-Whitney U検定結果
     */
    performMannWhitneyU(data1, data2) {
        const n1 = data1.length;
        const n2 = data2.length;
        const combined = [...data1.map(x => ({ value: x, group: 1 })), 
                         ...data2.map(x => ({ value: x, group: 2 }))];
        
        // ランク付け
        combined.sort((a, b) => a.value - b.value);
        let currentRank = 1;
        for (let i = 0; i < combined.length; i++) {
            combined[i].rank = currentRank;
            
            // 同順位の処理
            let tieCount = 1;
            while (i + tieCount < combined.length && 
                   combined[i].value === combined[i + tieCount].value) {
                tieCount++;
            }
            
            if (tieCount > 1) {
                const avgRank = (currentRank + currentRank + tieCount - 1) / 2;
                for (let j = 0; j < tieCount; j++) {
                    combined[i + j].rank = avgRank;
                }
                i += tieCount - 1;
            }
            
            currentRank += tieCount;
        }
        
        // U統計量計算
        const R1 = combined.filter(x => x.group === 1)
                          .reduce((sum, x) => sum + x.rank, 0);
        const U1 = R1 - (n1 * (n1 + 1)) / 2;
        const U2 = n1 * n2 - U1;
        const U = Math.min(U1, U2);
        
        // 正規近似によるp値計算
        const mean = (n1 * n2) / 2;
        const variance = (n1 * n2 * (n1 + n2 + 1)) / 12;
        const z = (U - mean) / Math.sqrt(variance);
        const pValue = 2 * (1 - this.standardNormalCDF(Math.abs(z)));
        
        return {
            testStatistic: U,
            u1: U1,
            u2: U2,
            zScore: z,
            pValue,
            rankSum1: R1,
            rankSum2: combined.filter(x => x.group === 2)
                             .reduce((sum, x) => sum + x.rank, 0)
        };
    }

    /**
     * 効果量を計算
     * @param {object} stats1 - データセット1の統計
     * @param {object} stats2 - データセット2の統計
     * @returns {object} 効果量
     */
    calculateEffectSize(stats1, stats2) {
        // Cohen's d
        const pooledSD = Math.sqrt(
            ((stats1.count - 1) * stats1.variance + 
             (stats2.count - 1) * stats2.variance) / 
            (stats1.count + stats2.count - 2)
        );
        
        const cohensD = (stats1.mean - stats2.mean) / pooledSD;
        
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
            cohensD,
            interpretation,
            magnitude: absD
        };
    }

    /**
     * 正規性検定（Shapiro-Wilk approximation）
     * @param {Array} data - データ配列
     * @returns {object} 正規性検定結果
     */
    testNormality(data) {
        if (data.length < 3) {
            return { isNormal: false, pValue: null, test: 'insufficient_data' };
        }
        
        if (data.length > 50) {
            // 大サンプルの場合は歪度・尖度で判定
            const stats = this.calculateBasicStatistics(data);
            const skewnessTest = Math.abs(stats.skewness) < 2;
            const kurtosisTest = Math.abs(stats.kurtosis) < 7;
            
            return {
                isNormal: skewnessTest && kurtosisTest,
                pValue: null,
                test: 'skewness_kurtosis',
                skewness: stats.skewness,
                kurtosis: stats.kurtosis
            };
        }
        
        // 小サンプルの場合は簡易正規性チェック
        const stats = this.calculateBasicStatistics(data);
        const normalityScore = 1 - (Math.abs(stats.skewness) / 3 + Math.abs(stats.kurtosis) / 10);
        
        return {
            isNormal: normalityScore > 0.5,
            pValue: normalityScore,
            test: 'simple_normality',
            normalityScore
        };
    }

    /**
     * t検定のp値を近似計算
     * @param {number} t - t統計量
     * @param {number} df - 自由度
     * @returns {number} p値
     */
    approximateTTestPValue(t, df) {
        if (df > 30) {
            // 大きな自由度では標準正規分布で近似
            return 1 - this.standardNormalCDF(t);
        }
        
        // 簡易的なt分布近似
        const factor = 1 + (t * t) / df;
        const power = -(df + 1) / 2;
        return 0.5 * Math.pow(factor, power);
    }

    /**
     * 標準正規分布の累積分布関数
     * @param {number} x - 値
     * @returns {number} 累積確率
     */
    standardNormalCDF(x) {
        return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
    }

    /**
     * 誤差関数（erf）
     * @param {number} x - 値
     * @returns {number} 誤差関数値
     */
    erf(x) {
        // Abramowitz and Stegun approximation
        const a1 =  0.254829592;
        const a2 = -0.284496736;
        const a3 =  1.421413741;
        const a4 = -1.453152027;
        const a5 =  1.061405429;
        const p  =  0.3275911;
        
        const sign = x >= 0 ? 1 : -1;
        x = Math.abs(x);
        
        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        
        return sign * y;
    }

    /**
     * 空の統計オブジェクトを作成
     * @returns {object} 空の統計オブジェクト
     */
    createEmptyStatistics() {
        return {
            count: 0,
            sum: 0,
            mean: 0,
            variance: 0,
            standardDeviation: 0,
            minimum: 0,
            maximum: 0,
            median: 0,
            q1: 0,
            q3: 0,
            range: 0,
            iqr: 0,
            skewness: 0,
            kurtosis: 0
        };
    }

    /**
     * 有意性検定結果を解釈
     * @param {object} testResult - 検定結果
     * @returns {string} 解釈文
     */
    interpretSignificanceTest(testResult) {
        if (testResult.pValue === null) {
            return 'データが不十分で検定を実行できませんでした。';
        }
        
        const significant = testResult.significant;
        const effectSize = testResult.effectSize?.interpretation || 'unknown';
        
        if (significant) {
            switch (effectSize) {
                case 'large':
                    return '統計的に有意で、実用的にも大きな違いがあります。';
                case 'medium':
                    return '統計的に有意で、中程度の実用的な違いがあります。';
                case 'small':
                    return '統計的に有意ですが、実用的な違いは小さいです。';
                default:
                    return '統計的に有意な違いが検出されました。';
            }
        } else {
            return '統計的に有意な違いは検出されませんでした。';
        }
    }

    /**
     * データの妥当性を検証
     * @param {Array} data - 検証するデータ
     * @returns {object} 検証結果
     */
    validateData(data) {
        const errors = [];
        const warnings = [];
        
        if (!Array.isArray(data)) {
            errors.push('データが配列ではありません');
            return { valid: false, errors, warnings };
        }
        
        if (data.length === 0) {
            errors.push('データが空です');
            return { valid: false, errors, warnings };
        }
        
        const validNumbers = data.filter(x => typeof x === 'number' && !isNaN(x));
        const validRatio = validNumbers.length / data.length;
        
        if (validRatio < 0.5) {
            errors.push('有効な数値データが50%未満です');
        } else if (validRatio < 0.8) {
            warnings.push('有効な数値データが80%未満です');
        }
        
        if (validNumbers.length < this.config.minimumSampleSize) {
            warnings.push(`サンプルサイズが推奨値（${this.config.minimumSampleSize}）を下回っています`);
        }
        
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            validCount: validNumbers.length,
            totalCount: data.length,
            validRatio
        };
    }
}