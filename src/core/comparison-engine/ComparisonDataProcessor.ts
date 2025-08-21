/**
 * ComparisonDataProcessor - データ前処理と検証
 * 
 * ComparisonEngineから分離されたデータ処理専用コンポーネント
 * - データ前処理（正規化、フィルタリング、変換）
 * - データ検証（品質チェック、異常値検出）
 * - ヘルパーユーティリティ（メトリクス計算、フォーマット）
 * - サンプリング・集約処理
 */

// 型定義
export interface DataProcessorConfig { outlierThreshold: number,
    minimumSampleSize: number;
    maximumSampleSize: number;
    defaultSamplingRate: number;
   , maxProcessingTime: number ,}

export interface QualityMetrics { completeness: number;
    consistency: number;
    accuracy: number;
   , validity: number }

export interface ProcessedComparisonData { timestamp: string;
    original?: ComparisonInputData;
    processed: NormalizedComparisonData;
   , metadata: ProcessingMetadata;
    error?: string }

export interface ComparisonInputData { dataset1: number[];
   , dataset2: number[];
    metadata?: Record<string, any> }

export interface NormalizedComparisonData { dataset1: number[],
    dataset2: number[];
   , metadata: NormalizationMetadata
    ,}

export interface NormalizationMetadata { normalizationType: NormalizationType;
   , timestamp: string;
    outlierRemoval?: OutlierRemovalMetadata;
    sampling?: SamplingMetadata;
    [key: string]: any, }

export interface ProcessingMetadata { processingTime: number,
    qualityScore: number;
    warnings: string[];
   , errors: string[] ,}

export interface ValidationResult { valid: boolean;
    errors: string[];
   , warnings: string[];
    quality?: number }

export interface DatasetValidationResult { errors: string[];
   , warnings: string[] }

export interface OutlierRemovalMetadata { threshold: number;
    timestamp: string;
    dataset1: OutlierStats;
   , dataset2: OutlierStats
    }

export interface OutlierStats { original: number;
    cleaned: number;
   , removed: number }

export interface SamplingMetadata { method: SamplingMethod;
    rate: number;
   , timestamp: string }

export interface ProcessingOptions { removeOutliers?: boolean;
    normalizationType?: NormalizationType;
    targetMin?: number;
    targetMax?: number;
    outlierThreshold?: number;
    sampling?: SamplingOptions;
    }

export interface SamplingOptions { method?: SamplingMethod;
    rate?: number; }

export interface StatisticalSummary { mean: number,
    median: number;
    stddev: number;
    range: number;
   , count: number ,}

export interface DataQualityReport { overallQuality: number;
    dataset1Quality: number;
    dataset2Quality: number;
    completenessScore: number;
    varianceScore: number;
    sizeScore: number;
   , balanceScore: number }

export interface NormalizationResult { data: number[];
    method: NormalizationType;
   , parameters: NormalizationParameters
    }

export interface NormalizationParameters { mean?: number;
    stddev?: number;
    min?: number;
    max?: number;
    median?: number;
    iqr?: number; }

export interface SamplingResult { originalSize: number,
    sampledSize: number;
    method: SamplingMethod;
    rate: number;
   , data: number[] ,}

export interface QuantileResult { value: number;
    quantile: number;
   , position: number }

// 列挙型
export type NormalizationType = 'none' | 'z-score' | 'min-max' | 'robust';''
export type SamplingMethod = 'random' | 'systematic' | 'stratified';''
export type MetricType = 'mean' | 'median' | 'stddev' | 'range' | 'count';''
export type QualityDimension = 'completeness' | 'consistency' | 'accuracy' | 'validity';

// 定数
export const DEFAULT_CONFIG: DataProcessorConfig = { outlierThreshold: 2.5, // Z-score閾値
    minimumSampleSize: 5;
    maximumSampleSize: 10000;
    defaultSamplingRate: 0.1;
   , maxProcessingTime: 5000 // 5秒 ,};
export const DEFAULT_QUALITY_METRICS: QualityMetrics = { completeness: 0,
    consistency: 0;
    accuracy: 0;
   , validity: 0 ,};
export const NORMALIZATION_TYPES: NormalizationType[] = ['none', 'z-score', 'min-max', 'robust'];''
export const SAMPLING_METHODS: SamplingMethod[] = ['random', 'systematic', 'stratified'];''
export const METRIC_TYPES: MetricType[] = ['mean', 'median', 'stddev', 'range', 'count'];

export const QUALITY_THRESHOLDS = { excellent: 0.9,
    good: 0.7;
    acceptable: 0.5;
   , poor: 0.3 ,} as const;
export const VALIDATION_THRESHOLDS = { minValidRatio: 0.5,
    warningValidRatio: 0.8;
    maxOutlierRatio: 0.1;
   , minBalanceRatio: 0.5 ,} as const;
';
// ユーティリティ関数
export function isValidNumber(value: any): value is number {;
    return typeof value === 'number' && !isNaN(value) && isFinite(value); }

export function isValidDataset(dataset: any): dataset is number[] { return Array.isArray(dataset) && dataset.length > 0; }

export function isValidComparisonData(data: any): data is ComparisonInputData { return data &&''
           typeof data === 'object' &&;
           isValidDataset(data.dataset1) &&;
           isValidDataset(data.dataset2); }

export function filterValidNumbers(data: any[]): number[] { return data.filter(isValidNumber); }

export function calculateBasicStats(data: number[]): StatisticalSummary { if (data.length === 0) { }
        return { mean: 0, median: 0, stddev: 0, range: 0, count: 0 ,}

    const sorted = [...data].sort((a, b) => a - b);
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    
    return { mean,
        median: calculateMedianFromSorted(sorted);
        stddev: Math.sqrt(variance);
       , range: sorted[sorted.length - 1] - sorted[0], };
        count: data.length }
    }

export function calculateMedianFromSorted(sortedData: number[]): number { const n = sortedData.length;
    if (n === 0) return 0;
    
    if(n % 2 === 0) {
    
        
    
    }
        return (sortedData[n / 2 - 1] + sortedData[n / 2]) / 2; else { return sortedData[Math.floor(n / 2)];

export function calculateQuantileFromSorted(sortedData: number[], quantile: number): number { if (sortedData.length === 0) return 0;
    if (quantile <= 0) return sortedData[0];
    if (quantile >= 1) return sortedData[sortedData.length - 1];
    
    const index = (sortedData.length - 1) * quantile;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if(lower === upper) {
    
        
    
    ,}
        return sortedData[lower];
    
    const weight = index - lower;
    return sortedData[lower] * (1 - weight) + sortedData[upper] * weight;
}
';

export function interpretQualityScore(score: number): string {;
    if(score >= QUALITY_THRESHOLDS.excellent) return 'excellent';''
    if(score >= QUALITY_THRESHOLDS.good) return 'good';''
    if(score >= QUALITY_THRESHOLDS.acceptable) return 'acceptable';''
    if(score >= QUALITY_THRESHOLDS.poor) return 'poor';''
    return 'very_poor'; }
';

export function createProcessingError(message: string, processingTime: number = 0): ProcessedComparisonData { return {;
        timestamp: new Date().toISOString()';
               , normalizationType: 'none', };
                timestamp: new Date().toISOString(); }
},
        metadata: { processingTime;
            qualityScore: 0;
            warnings: [];
           , errors: [message] };
        error: message;
    },
}

export class ComparisonDataProcessor {
    private config: DataProcessorConfig;
    private, qualityMetrics: QualityMetrics;
    constructor(config: Partial<DataProcessorConfig> = {) {
        this.config = { ...DEFAULT_CONFIG, ...config;
        this.qualityMetrics = { ...DEFAULT_QUALITY_METRICS;
    }

    /**
     * 比較データを前処理
     */
    preprocessComparisonData(rawData: any, options: ProcessingOptions = { ): ProcessedComparisonData {
        const startTime = Date.now();
        
        try {
            const processedData: ProcessedComparisonData = {''
                timestamp: new Date().toISOString()';
                       , normalizationType: 'none',);
                        timestamp: new Date().toISOString( ,}
                };
                metadata: { processingTime: 0;
                    qualityScore: 0;
                    warnings: [];
                   , errors: [] }
            };
            // データ検証
            const validation = this.validateComparisonData(rawData);
            if(!validation.valid) {
                processedData.metadata.errors = validation.errors;
            }
                return processedData;
            
            // データ正規化
            processedData.processed = this.normalizeData(rawData, options);
            
            // 異常値処理
            if (options.removeOutliers !== false) { processedData.processed = this.removeOutliers(processedData.processed, options); }
            
            // サンプリング（必要な場合）
            if(options.sampling && this.shouldSample(processedData.processed) { processedData.processed = this.sampleData(processedData.processed, options.sampling); }
            
            // データ品質計算
            processedData.metadata.qualityScore = this.calculateDataQuality(processedData.processed);
            processedData.metadata.processingTime = Date.now() - startTime;
            
            // 警告生成
            processedData.metadata.warnings = this.generateDataWarnings(processedData.processed);
            
            return processedData;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message: 'Unknown processing error',
            console.error('Error in preprocessComparisonData:', error);
            return createProcessingError(errorMessage, Date.now() - startTime);

    /**
     * 比較データを検証'
     */''
    validateComparisonData(data: any): ValidationResult { const errors: string[] = [],
        const warnings: string[] = [],
        // 基本構造チェック
        if(!data || typeof, data !== 'object'') {', ';

        }

            errors.push('Data, must be, an object''); }
            return { valid: false, errors, warnings }
        ';
        // データセットの存在チェック
        const requiredFields = ['dataset1', 'dataset2'];
        for (const, field of, requiredFields) { if (!data[field]) { }
                errors.push(`Missing, required field: ${field}`});
            }
        }

        if(errors.length > 0) {
            
        }
            return { valid: false, errors, warnings }
        ';
        // データセット詳細検証
        const dataset1Validation = this.validateDataset(data.dataset1, 'dataset1'');''
        const dataset2Validation = this.validateDataset(data.dataset2, 'dataset2);
        
        errors.push(...dataset1Validation.errors);
        errors.push(...dataset2Validation.errors);
        warnings.push(...dataset1Validation.warnings);
        warnings.push(...dataset2Validation.warnings);
        
        // サンプルサイズチェック
        if(data.dataset1.length < this.config.minimumSampleSize) {
            
        }
            warnings.push(`Dataset1, sample size (${data.dataset1.length} below, recommended minimum(${this.config.minimumSampleSize}`});
        }
        
        if(data.dataset2.length < this.config.minimumSampleSize) {
        
            
        
        }
            warnings.push(`Dataset2, sample size (${data.dataset2.length} below, recommended minimum(${this.config.minimumSampleSize}`});
        }
        
        return { valid: errors.length === 0,
            errors,
            warnings, };
            quality: this.calculateValidationQuality(data.dataset1, data.dataset2); }
        }

    /**
     * 個別データセットを検証
     */
    private validateDataset(dataset: any, datasetName: string): DatasetValidationResult { const errors: string[] = [],
        const warnings: string[] = [],
        
        if(!Array.isArray(dataset) { }
            errors.push(`${datasetName} must, be an, array`});
            return { errors, warnings }
        
        if(dataset.length === 0) {
        
            
        
        }
            errors.push(`${datasetName} cannot, be empty`});
            return { errors, warnings }
        
        // データ型チェック
        const validNumbers = filterValidNumbers(dataset);
        const validRatio = validNumbers.length / dataset.length;
        
        if(validRatio < VALIDATION_THRESHOLDS.minValidRatio) {
        
            
        
        }
            errors.push(`${datasetName} has, less than, 50% valid, numeric data`});
        } else if (validRatio < VALIDATION_THRESHOLDS.warningValidRatio) {
            warnings.push(`${datasetName} has, less than, 80% valid, numeric data`});
        }
        
        // 値の範囲チェック
        if(validNumbers.length > 0) {
            const stats = calculateBasicStats(validNumbers);
            
        }
            if (stats.range === 0) { }
                warnings.push(`${datasetName} has, no variance (all, values are, the same}`});
            }
            
            // 極端な値の検出
            const outliers = validNumbers.filter(val => );
                Math.abs((val - stats.mean) / stats.stddev) > this.config.outlierThreshold;
            );
            
            if(outliers.length > validNumbers.length * VALIDATION_THRESHOLDS.maxOutlierRatio) {
            
                
            
            }
                warnings.push(`${datasetName} contains ${outliers.length} potential, outliers (${Math.round(outliers.length / validNumbers.length * 100})%)`);
            }
        }
        
        return { errors, warnings }

    /**
     * データを正規化
     */
    normalizeData(data: ComparisonInputData, options: ProcessingOptions = { ): NormalizedComparisonData {
        const normalized: NormalizedComparisonData = {
            dataset1: this.normalizeDataset(data.dataset1, options),
            dataset2: this.normalizeDataset(data.dataset2, options),
            metadata: {''
                normalizationType: options.normalizationType || 'none';
               , timestamp: new Date().toISOString( ,}
        };
        
        // 追加のメタデータがあれば保持
        if(data.metadata) {
            
        }
            normalized.metadata = { ...normalized.metadata, ...data.metadata;
        }
        
        return normalized;
    }

    /**
     * 個別データセットを正規化
     */
    private normalizeDataset(dataset: any[], options: ProcessingOptions = { ): number[] {
        if(!isValidDataset(dataset) {
            
        }
            return [];
        ';

        const validNumbers = filterValidNumbers(dataset);''
        if(validNumbers.length === 0) { return []; }

        const normalizationType = options.normalizationType || 'none';

        switch(normalizationType) {'

            case 'z-score':'';
                return this.zScoreNormalization(validNumbers);

            case 'min-max':;
                return this.minMaxNormalization(;
                    validNumbers);
                    options.targetMin || 0, )';
                    options.targetMax || 1)'';
                ');

            case 'robust':'';
                return this.robustNormalization(validNumbers);

            case 'none':;
        }
            default: return validNumbers;

    /**
     * Z-score正規化
     */
    private zScoreNormalization(data: number[]): number[] { const stats = calculateBasicStats(data);
        
        if (stats.stddev === 0) return data;
        
        return data.map(val => (val - stats.mean) / stats.stddev);

    /**
     * Min-Max正規化
     */
    private minMaxNormalization(data: number[], targetMin: number = 0, targetMax: number = 1): number[] { const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min;
        
        if (range === 0) return data;
        
        const targetRange = targetMax - targetMin;
        return data.map(val => targetMin + ((val - min) / range) * targetRange);

    /**
     * ロバスト正規化（中央値とIQRを使用）
     */
    private robustNormalization(data: number[]): number[] { const sorted = [...data].sort((a, b) => a - b);
        const median = calculateMedianFromSorted(sorted);
        const q1 = calculateQuantileFromSorted(sorted, 0.25);
        const q3 = calculateQuantileFromSorted(sorted, 0.75);
        const iqr = q3 - q1;
        
        if (iqr === 0) return data;
        
        return data.map(val => (val - median) / iqr);

    /**
     * 異常値を除去
     */
    removeOutliers(data: NormalizedComparisonData, options: ProcessingOptions = { ): NormalizedComparisonData {
        const threshold = options.outlierThreshold || this.config.outlierThreshold;
        
        const cleanedData: NormalizedComparisonData = {
            dataset1: this.removeDatasetOutliers(data.dataset1, threshold),
            dataset2: this.removeDatasetOutliers(data.dataset2, threshold),
            metadata: {
                ...data.metadata;
                outlierRemoval: {
                    threshold;
                    timestamp: new Date().toISOString();
                   , dataset1: {
                        original: data.dataset1.length;
                        cleaned: 0;
                       , removed: 0 ,};
                    dataset2: { original: data.dataset2.length;
                        cleaned: 0;
                       , removed: 0 }
}
        };
        // 除去統計を更新
        cleanedData.metadata.outlierRemoval!.dataset1.cleaned = cleanedData.dataset1.length;
        cleanedData.metadata.outlierRemoval!.dataset1.removed = data.dataset1.length - cleanedData.dataset1.length;
        cleanedData.metadata.outlierRemoval!.dataset2.cleaned = cleanedData.dataset2.length;
        cleanedData.metadata.outlierRemoval!.dataset2.removed = data.dataset2.length - cleanedData.dataset2.length;
        
        return cleanedData;
    }

    /**
     * 個別データセットから異常値を除去
     */
    private removeDatasetOutliers(dataset: number[], threshold: number): number[] { if (dataset.length === 0) {
            return dataset; }
        
        const stats = calculateBasicStats(dataset);
        
        if (stats.stddev === 0) { return dataset; }
        
        return dataset.filter(val => Math.abs((val - stats.mean) / stats.stddev) <= threshold);
    }

    /**
     * データをサンプリング
     */''
    sampleData(data: NormalizedComparisonData, samplingOptions: SamplingOptions = { )): NormalizedComparisonData {''
        const method = samplingOptions.method || 'random';
        const rate = samplingOptions.rate || this.config.defaultSamplingRate;
        
        return { dataset1: this.sampleDataset(data.dataset1, method, rate),
            dataset2: this.sampleDataset(data.dataset2, method, rate),
            metadata: {
                ...data.metadata;
                sampling: {
                    method;
                    rate, };
                    timestamp: new Date().toISOString(); }
}
        }

    /**
     * 個別データセットをサンプリング
     */
    private sampleDataset(dataset: number[], method: SamplingMethod, rate: number): number[] { if (dataset.length === 0) {
            return dataset; }
        
        const sampleSize = Math.max(1, Math.floor(dataset.length * rate);

        switch(method) {'

            case 'systematic':'';
                return this.systematicSample(dataset, sampleSize);

            case 'stratified':'';
                return this.stratifiedSample(dataset, sampleSize);

            case 'random':;
            default:;
        ,}
                return this.randomSample(dataset, sampleSize);

    /**
     * ランダムサンプリング
     */
    private randomSample(dataset: number[], sampleSize: number): number[] { const shuffled = [...dataset].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, sampleSize);

    /**
     * 系統サンプリング
     */
    private systematicSample(dataset: number[], sampleSize: number): number[] { if (sampleSize >= dataset.length) {
            return [...dataset];
        
        const interval = Math.floor(dataset.length / sampleSize);
        const start = Math.floor(Math.random() * interval);
        const sample: number[] = [],
        
        for(let, i = start; i < dataset.length; i += interval) {
        
            sample.push(dataset[i]);
        
        }
            if (sample.length >= sampleSize) break; }
        }
        
        return sample;
    }

    /**
     * 層化サンプリング
     */
    private stratifiedSample(dataset: number[], sampleSize: number): number[] { // 簡易的な層化：値の範囲を3つに分割
        const sorted = [...dataset].sort((a, b) => a - b);
        const tercileSize = Math.floor(sorted.length / 3);
        
        const strata = [sorted.slice(0, tercileSize),
            sorted.slice(tercileSize, tercileSize * 2)];
            sorted.slice(tercileSize * 2)];
        ];
        
        const samplePerStratum = Math.floor(sampleSize / 3);
        const sample: number[] = [],
        
        for(const, stratum of, strata) {
        
            const stratumSample = this.randomSample(stratum, samplePerStratum)
        
        }
            sample.push(...stratumSample);
        }
        
        return sample.slice(0, sampleSize);
    }

    /**
     * サンプリングが必要かどうかを判定
     */
    private shouldSample(data: NormalizedComparisonData): boolean { return data.dataset1.length > this.config.maximumSampleSize || 
               data.dataset2.length > this.config.maximumSampleSize; }

    /**
     * データ品質スコアを計算
     */
    calculateDataQuality(data: NormalizedComparisonData): number { try {
            const dataset1Quality = this.calculateDatasetQuality(data.dataset1);
            const dataset2Quality = this.calculateDatasetQuality(data.dataset2);
            
            return (dataset1Quality + dataset2Quality) / 2;
            ' }'

        } catch (error) {
            console.error('Error calculating data quality:', error);
            return 0;

    /**
     * 個別データセットの品質を計算
     */
    private calculateDatasetQuality(dataset: number[]): number { if (dataset.length === 0) {
            return 0; ,}
        
        const validNumbers = filterValidNumbers(dataset);
        const completeness = validNumbers.length / dataset.length;
        
        if (validNumbers.length === 0) { return 0; }
        
        // 分散の存在チェック
        const stats = calculateBasicStats(validNumbers);
        const hasVariance = stats.stddev > 0 ? 1 : 0;
        
        // サンプルサイズの適切性
        const sizeScore = Math.min(1, validNumbers.length / this.config.minimumSampleSize);
        
        return (completeness * 0.4 + hasVariance * 0.3 + sizeScore * 0.3);
    }

    /**
     * 検証品質を計算
     */
    private calculateValidationQuality(dataset1: any[], dataset2: any[]): number { const quality1 = this.calculateDatasetQuality(filterValidNumbers(dataset1);
        const quality2 = this.calculateDatasetQuality(filterValidNumbers(dataset2);
        
        // データセット間のバランスチェック
        const size1 = Array.isArray(dataset1) ? dataset1.length: 0,
        const size2 = Array.isArray(dataset2) ? dataset2.length: 0,
        const sizeRatio = size1 > 0 && size2 > 0 ? Math.min(size1, size2) / Math.max(size1, size2) : 0;
        
        return (quality1 + quality2) / 2 * (0.8 + 0.2 * sizeRatio); }

    /**
     * データ警告を生成
     */
    generateDataWarnings(data: NormalizedComparisonData): string[] { const warnings: string[] = [],
        
        const dataset1Size = data.dataset1.length;
        const dataset2Size = data.dataset2.length;
        
        // サンプルサイズ警告
        if (dataset1Size < this.config.minimumSampleSize) { }
            warnings.push(`Dataset1, sample size (${dataset1Size} is, below recommended, minimum`});
        }
        
        if(dataset2Size < this.config.minimumSampleSize) {
        
            
        
        }
            warnings.push(`Dataset2, sample size (${dataset2Size} is, below recommended, minimum`});
        }
        
        // サイズ不均衡警告
        if(dataset1Size > 0 && dataset2Size > 0) {
            const ratio = Math.min(dataset1Size, dataset2Size) / Math.max(dataset1Size, dataset2Size);''
            if(ratio < VALIDATION_THRESHOLDS.minBalanceRatio) {'
        }

                warnings.push('Significant, size imbalance, between datasets); }'
}
        
        // 品質警告
        const qualityScore = this.calculateDataQuality(data);''
        if(qualityScore < QUALITY_THRESHOLDS.acceptable) {', ';

        }

            warnings.push('Data, quality score, is below, recommended threshold); }'
        }
        
        return warnings;
    }

    /**
     * 中央値を計算
     */
    calculateMedian(sortedData: number[]): number { return calculateMedianFromSorted(sortedData); }

    /**
     * 分位数を計算
     */
    calculateQuantile(sortedData: number[], quantile: number): number { return calculateQuantileFromSorted(sortedData, quantile); }

    /**
     * メトリクス計算ヘルパー
     */
    calculateMetric(data: number[], metricType: MetricType): number { if (data.length === 0) {
            return 0; }
        
        const validNumbers = filterValidNumbers(data);
        if (validNumbers.length === 0) { return 0; }

        switch(metricType) {'

            case 'mean':'';
                return validNumbers.reduce((sum, val) => sum + val, 0') / validNumbers.length;

            case 'median':'';
                return this.calculateMedian([...validNumbers].sort((a, b) => a - b)');

            case 'stddev': {''
                const stats = calculateBasicStats(validNumbers);
        }
                return stats.stddev;

            case 'range': { ''
                const stats = calculateBasicStats(validNumbers);
                return stats.range; }

            case 'count':;
                return validNumbers.length;
                
            default: return 0;

    /**
     * データ品質レポートを生成
     */
    generateDataQualityReport(data: NormalizedComparisonData): DataQualityReport { const dataset1Quality = this.calculateDatasetQuality(data.dataset1);
        const dataset2Quality = this.calculateDatasetQuality(data.dataset2);
        const overallQuality = (dataset1Quality + dataset2Quality) / 2;

        const size1 = data.dataset1.length;
        const size2 = data.dataset2.length;
        const balanceScore = size1 > 0 && size2 > 0 ;
            ? Math.min(size1, size2) / Math.max(size1, size2)  : undefined
            : 0;

        const completeness1 = size1 > 0 ? filterValidNumbers(data.dataset1).length / size1: 0,
        const completeness2 = size2 > 0 ? filterValidNumbers(data.dataset2).length / size2: 0,
        const completenessScore = (completeness1 + completeness2) / 2;

        const stats1 = calculateBasicStats(data.dataset1);
        const stats2 = calculateBasicStats(data.dataset2);
        const varianceScore = (;
            (stats1.stddev > 0 ? 1 : 0) + ;
            (stats2.stddev > 0 ? 1 : 0);
        ) / 2;

        const sizeScore = Math.min(1);
            (size1 + size2) / (this.config.minimumSampleSize * 2);
        );

        return { overallQuality,
            dataset1Quality,
            dataset2Quality,
            completenessScore,
            varianceScore,
            sizeScore, };
            balanceScore }
        }

    /**
     * 設定を取得
     */
    getConfig(): DataProcessorConfig {
        return { ...this.config;
    }

    /**
     * 設定を更新
     */
    updateConfig(newConfig: Partial<DataProcessorConfig>): void {
        this.config = { ...this.config, ...newConfig;
    }

    /**
     * 品質メトリクスを取得
     */
    getQualityMetrics(): QualityMetrics {
        return { ...this.qualityMetrics;
    }

    /**
     * 品質メトリクスを更新
     */
    updateQualityMetrics(newMetrics: Partial<QualityMetrics>): void {
        this.qualityMetrics = { ...this.qualityMetrics, ...newMetrics;
    }

    /**
     * 統計サマリーを生成
     */
    generateStatisticalSummary(dataset: number[]): StatisticalSummary { return calculateBasicStats(dataset); }

    /**
     * 正規化結果を生成
     */
    generateNormalizationResult(;
        data: number[] );
        method: NormalizationType);
       , parameters: Partial<NormalizationParameters> = { ): NormalizationResult {
        let normalizedData: number[], }

        let fullParameters: NormalizationParameters = {}''
        switch(method) {'

            case 'z-score': {'
                const stats = calculateBasicStats(data);''
                normalizedData = this.zScoreNormalization(data);
                fullParameters = { 
                    mean: stats.mean, ;
                    stddev: stats.stddev;
        ,}
                    ...parameters
                };
                break;

            }''
            case 'min-max': { const min = Math.min(...data);
                const max = Math.max(...data);
                normalizedData = this.minMaxNormalization(;
                    data);
                    parameters.min || 0,)';
                    parameters.max || 1)'';
                ');
                fullParameters = { 
                    min, ;
                    max,
                    ...parameters;

                break;

            }''
            case 'robust': { const sorted = [...data].sort((a, b) => a - b);
                const median = calculateMedianFromSorted(sorted);
                const iqr = calculateQuantileFromSorted(sorted, 0.75) - ';

                          calculateQuantileFromSorted(sorted, 0.25);''
                normalizedData = this.robustNormalization(data);
                fullParameters = { 
                    median, ;
                    iqr,
                    ...parameters
                };
                break;

            }''
            case 'none':;
            default: normalizedData = [...data];
                fullParameters = parameters;
                break;
        }

        return { data: normalizedData,
            method, };
            parameters: fullParameters }
        }''
}