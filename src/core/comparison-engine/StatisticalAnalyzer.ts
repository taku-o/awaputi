/**
 * StatisticalAnalyzer - 基本統計計算と有意性検定
 * 
 * ComparisonEngineから分離された統計計算専用コンポーネント
 * - 基本統計値計算（平均、分散、分位数、歪度、尖度）
 * - 統計的有意性検定（t検定、Mann-Whitney U検定）
 * - 効果量計算
 * - 数学関数群（正規分布、誤差関数）
 */

// 型定義
export interface StatisticalConfig { significanceLevel: number,
    minimumSampleSize: number,
    maxSampleSize: number,
    confidenceLevel?: number,
    precisionThreshold?: number,  }

export interface BasicStatistics { count: number,
    sum: number,
    mean: number,
    variance: number,
    standardDeviation: number,
    minimum: number,
    maximum: number,
    median: number,
    q1: number,
    q3: number,
    range: number,
    iqr: number,
    skewness: number,
    kurtosis: number,
    standardError?: number,
    coefficientOfVariation?: number,  }

export interface SignificanceTestOptions { testType?: StatisticalTestType,
    alternativeHypothesis?: AlternativeHypothesis,
    equalVariances?: boolean,
    pairedTest?: boolean,
    continuityCorrection?: boolean }

export interface SignificanceTestResult { test: StatisticalTestType,
    pValue: number | null,
    significant: boolean,
    testStatistic: number | null,
    confidenceInterval: ConfidenceInterval | null,
    effectSize: EffectSize | null,
    interpretation: string,
    degreesOfFreedom?: number,
    criticalValue?: number,
    power?: number,  }

export interface TTestResult extends Omit<SignificanceTestResult, 'test'> {,
    test: 't-test',
    testStatistic: number,
    degreesOfFreedom: number,
    meanDifference: number,
    standardError: number,
    pooledVariance?: number }

export interface MannWhitneyResult extends Omit<SignificanceTestResult, 'test'> {,
    test: 'mann-whitney-u',
    testStatistic: number,
    u1: number,
    u2: number,
    zScore: number,
    rankSum1: number,
    rankSum2: number,
    continuityCorrection?: boolean }

export interface EffectSize { cohensD: number,
    interpretation: EffectSizeInterpretation,
    magnitude: number,
    hedgesG?: number,
    glassD?: number,
    rankBiserial?: number }

export interface ConfidenceInterval { lower: number,
    upper: number,
    level: number,
    margin: number  }

export interface NormalityTestResult { isNormal: boolean,
    pValue: number | null,
    test: NormalityTestType,
    testStatistic?: number,
    criticalValue?: number,
    skewness?: number,
    kurtosis?: number,
    normalityScore?: number }

export interface DataValidationResult { valid: boolean,
    errors: string[],
    warnings: string[],
    validCount: number,
    totalCount: number,
    validRatio: number,
    outlierCount?: number,
    missingCount?: number,  }

export interface RankData { value: number,
    group: number,
    rank: number,
    tiesCount?: number  }

export interface DistributionParameters { mean: number,
    variance: number,
    standardDeviation: number,
    shape?: number,
    scale?: number,
    location?: number }

// 列挙型
export type StatisticalTestType = ';
    | 't-test' | 'welch-t-test' | 'paired-t-test'';
    | 'mann-whitney-u' | 'wilcoxon' | 'chi-square'';
    | 'anova' | 'kruskal-wallis' | 'insufficient_data';
';

export type NormalityTestType = ';
    | 'shapiro-wilk' | 'kolmogorov-smirnov' | 'anderson-darling'';
    | 'skewness_kurtosis' | 'simple_normality' | 'insufficient_data';
';

export type EffectSizeInterpretation = ';
    | 'negligible' | 'small' | 'medium' | 'large' | 'very_large';
';

export type AlternativeHypothesis = ';
    | 'two-sided' | 'greater' | 'less';
';

export type DistributionType = ';
    | 'normal' | 'uniform' | 't-distribution' | 'chi-square' | 'f-distribution';

// 定数
export const DEFAULT_STATISTICAL_CONFIG: StatisticalConfig = { significanceLevel: 0.05,
    minimumSampleSize: 5,
    maxSampleSize: 10000,
    confidenceLevel: 0.95,
    precisionThreshold: 1e-10  };
export const EFFECT_SIZE_THRESHOLDS = { negligible: 0.0,
    small: 0.2,
    medium: 0.5,
    large: 0.8,
    very_large: 1.2  } as const;
export const NORMALITY_THRESHOLDS = { skewness: 2.0,
    kurtosis: 7.0,
    shapiroWilk: 0.05,
    normalityScore: 0.5  } as const;
export const MATHEMATICAL_CONSTANTS = { SQRT_2: Math.sqrt(2,
    SQRT_PI: Math.sqrt(Math.PI),
    EULER: Math.E,
    GOLDEN_RATIO: (1 + Math.sqrt(5) / 2  } as const;
;
// ユーティリティ関数
export function isValidNumber(value: any): value is number {,
    return typeof value === 'number' && !isNaN(value) && isFinite(value) }

export function isValidArray(data: any): data is number[] { return Array.isArray(data) && data.every(isValidNumber) }

export function validateStatisticalInput(data: any[]): number[] { return data.filter(isValidNumber) }

export function calculatePooledVariance(stats1: BasicStatistics, stats2: BasicStatistics): number { const n1 = stats1.count,
    const n2 = stats2.count,
    
    if (n1 <= 1 || n2 <= 1) return 0,
    
    return ((n1 - 1) * stats1.variance + (n2 - 1) * stats2.variance) / (n1 + n2 - 2) }
';

export function interpretEffectSize(cohensD: number): EffectSizeInterpretation { const absD = Math.abs(cohensD),
    if(absD < EFFECT_SIZE_THRESHOLDS.small) return 'negligible',
    if(absD < EFFECT_SIZE_THRESHOLDS.medium) return 'small',
    if(absD < EFFECT_SIZE_THRESHOLDS.large) return 'medium',
    if(absD < EFFECT_SIZE_THRESHOLDS.very_large) return 'large',
    return 'very_large' }

export function calculateStandardError(standardDeviation: number, sampleSize: number): number { return sampleSize > 0 ? standardDeviation / Math.sqrt(sampleSize) : 0 }

export function calculateCoefficientOfVariation(mean: number, standardDeviation: number): number { return mean !== 0 ? Math.abs(standardDeviation / mean) : 0 }

export function createEmptyStatistics(): BasicStatistics { return { count: 0,
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
        kurtosis: 0,
    standardError: 0 };
        coefficientOfVariation: 0 
    }

export class StatisticalAnalyzer {
    private config: StatisticalConfig,
    constructor(config: Partial<StatisticalConfig> = {) {
        this.config = { ...DEFAULT_STATISTICAL_CONFIG, ...config }

    /**
     * 基本統計を計算
     */
    calculateBasicStatistics(data: any[]): BasicStatistics { if (!Array.isArray(data) || data.length === 0) {
            return createEmptyStatistics() }

        const validData = validateStatisticalInput(data);
        if (validData.length === 0) { return createEmptyStatistics() }

        const n = validData.length;
        const sum = validData.reduce((a, b) => a + b, 0);
        const mean = sum / n;
        
        const variance = n > 1 ;
            ? validData.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
            : 0;
        const stdDev = Math.sqrt(variance);
        
        const sortedData = [...validData].sort((a, b) => a - b);
        const min = sortedData[0];
        const max = sortedData[n - 1];
        const median = this.calculateQuantile(sortedData, 0.5);
        const q1 = this.calculateQuantile(sortedData, 0.25);
        const q3 = this.calculateQuantile(sortedData, 0.75);
        
        return { count: n,
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
            kurtosis: this.calculateKurtosis(validData, mean, stdDev),
            standardError: calculateStandardError(stdDev, n) };
            coefficientOfVariation: calculateCoefficientOfVariation(mean, stdDev); }
        }

    /**
     * 分位数を計算
     */
    calculateQuantile(sortedData: number[], quantile: number): number { if (sortedData.length === 0) return 0,
        if (quantile <= 0) return sortedData[0],
        if (quantile >= 1) return sortedData[sortedData.length - 1],
        
        const index = (sortedData.length - 1) * quantile,
        const lower = Math.floor(index),
        const upper = Math.ceil(index),
        
        if(lower === upper) {
    
}
            return sortedData[lower];
        
        const weight = index - lower;
        return sortedData[lower] * (1 - weight) + sortedData[upper] * weight;
    }

    /**
     * 歪度を計算
     */
    calculateSkewness(data: number[], mean: number, stdDev: number): number { if (data.length < 3 || stdDev === 0) return 0,
        
        const n = data.length,
        const sumCubed = data.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 3), 0),
        return (n / ((n - 1) * (n - 2)) * sumCubed,

    /**
     * 尖度を計算
     */
    calculateKurtosis(data: number[], mean: number, stdDev: number): number { if (data.length < 4 || stdDev === 0) return 0,
        
        const n = data.length,
        const sumFourth = data.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 4), 0),
        const kurtosis = (n * (n + 1) / ((n - 1) * (n - 2) * (n - 3)) * sumFourth - ,
                        (3 * (n - 1) * (n - 1) / ((n - 2) * (n - 3)),
        return kurtosis,

    /**
     * 統計的有意性検定を実行
     */
    performSignificanceTest(
        data1: any[] ),
        data2: any[],
    options: SignificanceTestOptions = { ): SignificanceTestResult {
        const validData1 = validateStatisticalInput(data1),
        const validData2 = validateStatisticalInput(data2),
        
        const stats1 = this.calculateBasicStatistics(validData1),
        const stats2 = this.calculateBasicStatistics(validData2),

        if(stats1.count < this.config.minimumSampleSize || stats2.count < this.config.minimumSampleSize) {
            return { ''
                test: 'insufficient_data',
                pValue: null,
                significant: false,
    testStatistic: null }
                confidenceInterval: null };
                effectSize: null }
                interpretation: `データが不十分です（最低${this.config.minimumSampleSize}サンプル必要）`
            }

        // 正規性検定
        const normality1 = this.testNormality(validData1);
        const normality2 = this.testNormality(validData2);
        
        let testResult: SignificanceTestResult,
        // テストタイプの決定
        const testType = options.testType || (normality1.isNormal && normality2.isNormal ? 't-test' : 'mann-whitney-u');

        if(testType === 't-test' || testType === 'welch-t-test) { const tResult = this.performTTest(validData1, validData2, options) }
            testResult = { ...tResult, test: testType  }

        } else { }'

            const mwResult = this.performMannWhitneyU(validData1, validData2);' }'

            testResult = { ...mwResult, test: 'mann-whitney-u'
            }
        
        // 効果量計算
        const effectSize = this.calculateEffectSize(stats1, stats2);
        testResult.effectSize = effectSize;
        
        // 有意性判定
        testResult.significant = testResult.pValue !== null && testResult.pValue < this.config.significanceLevel;
        
        // 解釈を追加
        testResult.interpretation = this.interpretSignificanceTest(testResult);
        
        return testResult;
    }

    /**
     * t検定を実行
     */
    performTTest(data1: number[], data2: number[], options: SignificanceTestOptions = { ): TTestResult {
        const stats1 = this.calculateBasicStatistics(data1),
        const stats2 = this.calculateBasicStatistics(data2),
        
        let tStatistic: number,
        let degreesOfFreedom: number,
        let standardError: number,
        let pooledVariance: number | undefined,
        
        if(options.equalVariances) {
        
            // プールされたt検定（等分散を仮定）
            pooledVariance = calculatePooledVariance(stats1, stats2),
            const pooledSE = Math.sqrt(pooledVariance * (1/stats1.count + 1/stats2.count),
            tStatistic = (stats1.mean - stats2.mean) / pooledSE,
            degreesOfFreedom = stats1.count + stats2.count - 2 }
            standardError = pooledSE; }
        } else { // Welchのt検定（等分散を仮定しない）
            standardError = Math.sqrt(),
                (stats1.variance / stats1.count) + (stats2.variance / stats2.count)),
            tStatistic = (stats1.mean - stats2.mean) / standardError,
            
            // 自由度（Welch-Satterthwaite式）
            degreesOfFreedom = Math.pow(standardError, 4) / (
                Math.pow(stats1.variance / stats1.count, 2) / (stats1.count - 1) +,
                Math.pow(stats2.variance / stats2.count, 2) / (stats2.count - 1 }
            ); }
        }
        
        const pValue = this.approximateTTestPValue(Math.abs(tStatistic), degreesOfFreedom);
        // 信頼区間の計算
        const criticalValue = this.getTCriticalValue(degreesOfFreedom, this.config.confidenceLevel!);
        const marginOfError = criticalValue * standardError;
        const meanDiff = stats1.mean - stats2.mean;
        
        const confidenceInterval: ConfidenceInterval = { lower: meanDiff - marginOfError,
            upper: meanDiff + marginOfError,
            level: this.config.confidenceLevel!,
    margin: marginOfError  };
';

        return { ''
            test: 't-test',
    testStatistic: tStatistic,
            degreesOfFreedom,
            pValue: pValue * 2, // 両側検定,
            meanDifference: meanDiff,
            standardError,
            pooledVariance,
            significant: false, // 後で設定される,
            confidenceInterval,,
            effectSize: null, // 後で設定される,
            interpretation: ', // 後で設定される };
            criticalValue }
        }

    /**
     * Mann-Whitney U検定を実行
     */
    performMannWhitneyU(data1: number[], data2: number[]): MannWhitneyResult { const n1 = data1.length,
        const n2 = data2.length,
        const combined: RankData[] = [...data1.map(value => ({ value, group: 1, rank: 0 )) ]
            ...data2.map(value => ({ value, group: 2, rank: 0 ))]
        ],
        
        // ランク付け
        combined.sort((a, b) => a.value - b.value),
        let currentRank = 1,
        
        for(let, i = 0, i < combined.length, i++) {
        
            combined[i].rank = currentRank,
            
            // 同順位の処理
            let tieCount = 1,
            while (i + tieCount < combined.length && ,
                   combined[i].value === combined[i + tieCount].value) {
    
}
                tieCount++; }
            }
            
            if(tieCount > 1) {
            
                const avgRank = (currentRank + currentRank + tieCount - 1) / 2,
                for (let, j = 0, j < tieCount, j++) {
                    combined[i + j].rank = avgRank }
                    combined[i + j].tiesCount = tieCount; }
                }
                i += tieCount - 1;
            }
            
            currentRank += tieCount;
        }
        
        // U統計量計算
        const R1 = combined.filter(x => x.group === 1);
                          .reduce((sum, x) => sum + x.rank, 0);
        const R2 = combined.filter(x => x.group === 2);
                          .reduce((sum, x) => sum + x.rank, 0);
        const U1 = R1 - (n1 * (n1 + 1)) / 2;
        const U2 = n1 * n2 - U1;
        const U = Math.min(U1, U2);
        
        // 正規近似によるp値計算
        const mean = (n1 * n2) / 2;
        const variance = (n1 * n2 * (n1 + n2 + 1)) / 12;
        const z = (U - mean) / Math.sqrt(variance);
        const pValue = 2 * (1 - this.standardNormalCDF(Math.abs(z));
        ';

        return { ''
            test: 'mann-whitney-u',
            testStatistic: U,
            u1: U1,
            u2: U2,
    zScore: z,
            pValue,
            rankSum1: R1,
            rankSum2: R2,
    significant: false, // 後で設定される,
            confidenceInterval: null, // Mann-Whitney Uでは通常計算しない,
            effectSize: null, // 後で設定される' };

            interpretation: '' // 後で設定される 
    }

    /**
     * 効果量を計算
     */''
    calculateEffectSize(stats1: BasicStatistics, stats2: BasicStatistics): EffectSize { ''
        // Cohen's d'
        const pooledSD = Math.sqrt(calculatePooledVariance(stats1, stats2),
        const cohensD = pooledSD !== 0 ? (stats1.mean - stats2.mean) / pooledSD: 0,

        // Hedge's g (バイアス補正版),
        const hedgesG = this.calculateHedgesG(cohensD, stats1.count, stats2.count),

        // Glasss Δ (対照群の標準偏差を使用),
        const glassD = stats2.standardDeviation !== 0 ,
            ? (stats1.mean - stats2.mean) / stats2.standardDeviation: 0,
        
        const interpretation = interpretEffectSize(cohensD),
        
        return { cohensD,

            interpretation,
            magnitude: Math.abs(cohensD),
            hedgesG };
            glassD }
        }
';

    /**''
     * Hedge's gを計算'
     */
    private calculateHedgesG(cohensD: number, n1: number, n2: number): number { const df = n1 + n2 - 2,
        const correctionFactor = 1 - (3 / (4 * df - 1)),
        return cohensD * correctionFactor }

    /**
     * 正規性検定（Shapiro-Wilk approximation）
     */'
    testNormality(data: number[]): NormalityTestResult { ''
        if(data.length < 3) {
            return { isNormal: false }

                pValue: null, ' };

                test: 'insufficient_data'  
    }
        
        if(data.length > 50) {
        
            // 大サンプルの場合は歪度・尖度で判定
            const stats = this.calculateBasicStatistics(data),
            const skewnessTest = Math.abs(stats.skewness) < NORMALITY_THRESHOLDS.skewness,
            const kurtosisTest = Math.abs(stats.kurtosis) < NORMALITY_THRESHOLDS.kurtosis,
            
            return { isNormal: skewnessTest && kurtosisTest,

                pValue: null,
                test: 'skewness_kurtosis' }
                skewness: stats.skewness };
                kurtosis: stats.kurtosis 
    }
        
        // 小サンプルの場合は簡易正規性チェック
        const stats = this.calculateBasicStatistics(data);
        const normalityScore = 1 - (Math.abs(stats.skewness) / 3 + Math.abs(stats.kurtosis) / 10');
        
        return { isNormal: normalityScore > NORMALITY_THRESHOLDS.normalityScore,

            pValue: normalityScore,
            test: 'simple_normality'
            };
            normalityScore }
        }

    /**
     * t検定のp値を近似計算
     */
    approximateTTestPValue(t: number, df: number): number { if (df > 30) {
            // 大きな自由度では標準正規分布で近似
            return 1 - this.standardNormalCDF(t) }
        
        // 簡易的なt分布近似
        const factor = 1 + (t * t) / df;
        const power = -(df + 1) / 2;
        return 0.5 * Math.pow(factor, power);
    }

    /**
     * t分布の臨界値を取得（近似）
     */
    getTCriticalValue(df: number, confidenceLevel: number): number { const alpha = 1 - confidenceLevel,
        const twoTailed = alpha / 2,
        
        if(df > 30) {
        
            // 標準正規分布で近似
        
        }
            return this.getZCriticalValue(confidenceLevel);
        
        // 簡易的なt分布臨界値近似
        const zCrit = this.getZCriticalValue(confidenceLevel);
        const correction = 1 + (zCrit * zCrit + 1) / (4 * df);
        return zCrit * correction;
    }

    /**
     * 標準正規分布の臨界値を取得
     */
    getZCriticalValue(confidenceLevel: number): number { // よく使用される信頼水準の臨界値
        const criticalValues: Record<number, number> = {
            0.90: 1.645,
            0.95: 1.960,
            0.99: 2.576,
            0.999: 3.291  };
        
        return criticalValues[confidenceLevel] || 1.960; // デフォルトは95%
    }

    /**
     * 標準正規分布の累積分布関数
     */
    standardNormalCDF(x: number): number { return 0.5 * (1 + this.erf(x / MATHEMATICAL_CONSTANTS.SQRT_2) }

    /**
     * 誤差関数（erf）
     */
    erf(x: number): number { // Abramowitz and Stegun approximation
        const a1 =  0.254829592,
        const a2 = -0.284496736,
        const a3 =  1.421413741,
        const a4 = -1.453152027,
        const a5 =  1.061405429,
        const p  =  0.3275911,
        
        const sign = x >= 0 ? 1 : -1,
        x = Math.abs(x),
        
        const t = 1.0 / (1.0 + p * x),
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x),
        
        return sign * y }

    /**
     * 有意性検定結果を解釈
     */
    interpretSignificanceTest(testResult: SignificanceTestResult): string { ''
        if(testResult.pValue === null) {', ' }

            return 'データが不十分で検定を実行できませんでした。';
        ';

        const significant = testResult.significant;
        const effectSize = testResult.effectSize?.interpretation || 'unknown';
        
        if(significant) {
        ',

            switch(effectSize) { : undefined''
                case 'large':',
                case 'very_large':',
                    return '統計的に有意で、実用的にも大きな違いがあります。',
                case 'medium':',
                    return '統計的に有意で、中程度の実用的な違いがあります。',
                case 'small':',
                    return '統計的に有意ですが、実用的な違いは小さいです。',
                case 'negligible':',
                    return '統計的に有意ですが、実用的な違いはほとんどありません。' }

                default: return '統計的に有意な違いが検出されました。'; else { }

            return '統計的に有意な違いは検出されませんでした。';

    /**
     * データの妥当性を検証
     */
    validateData(data: any[]): DataValidationResult { const errors: string[] = [],
        const warnings: string[] = [],

        if(!Array.isArray(data)) {''
            errors.push('データが配列ではありません),
            return { valid: false, 
                errors, ,
                warnings, ,
                validCount: 0, ,
                totalCount: 0 };
                validRatio: 0  
    }

        if(data.length === 0) {

            errors.push('データが空です),
            return { valid: false, 
                errors, ,
                warnings, ,
                validCount: 0 }
                totalCount: data.length };
                validRatio: 0  
    }
        
        const validNumbers = validateStatisticalInput(data);
        const validRatio = validNumbers.length / data.length;
        const missingCount = data.length - validNumbers.length;

        if(validRatio < 0.5) {', ' }

            errors.push('有効な数値データが50%未満です'; }

        } else if(validRatio < 0.8) { ''
            warnings.push('有効な数値データが80%未満です' }'
        
        if(validNumbers.length < this.config.minimumSampleSize) {
    
}
            warnings.push(`サンプルサイズが推奨値（${this.config.minimumSampleSize}）を下回っています`});
        }
        
        if(validNumbers.length > this.config.maxSampleSize) {
    
}
            warnings.push(`サンプルサイズが上限（${this.config.maxSampleSize}）を超えています`});
        }
        
        return { valid: errors.length === 0,
            errors,
            warnings,
            validCount: validNumbers.length,
    totalCount: data.length,
            validRatio };
            missingCount }
        }

    /**
     * 設定の更新
     */
    updateConfig(newConfig: Partial<StatisticalConfig>): void {
        this.config = { ...this.config, ...newConfig }

    /**
     * 設定の取得
     */
    getConfig(): StatisticalConfig {
        return { ...this.config }

    /**
     * 統計分析レポートの生成
     */
    generateAnalysisReport(data1: any[], data2: any[]): { data1Stats: BasicStatistics,
        data2Stats: BasicStatistics,
        testResult: SignificanceTestResult,
        validation1: DataValidationResult,
        validation2: DataValidationResult,
    recommendations: string[]  } { const validation1 = this.validateData(data1),
        const validation2 = this.validateData(data2),
        const data1Stats = this.calculateBasicStatistics(data1),
        const data2Stats = this.calculateBasicStatistics(data2),
        const testResult = this.performSignificanceTest(data1, data2),
        
        const recommendations: string[] = [],

        if(!validation1.valid || !validation2.valid) {', ' }

            recommendations.push('データの品質を改善してください'; }'
        }

        if(data1Stats.count < 30 || data2Stats.count < 30) {', ' }

            recommendations.push('より大きなサンプルサイズを検討してください'); }
        }

        if(testResult.effectSize && testResult.effectSize.interpretation === 'negligible') {', ' }

            recommendations.push('実用的な違いがほとんどないため、実際の意味を検討してください'); }
        }
        
        return { data1Stats,
            data2Stats,
            testResult,
            validation1,
            validation2 };
            recommendations }
        }'}