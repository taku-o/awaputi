/**
 * ComparisonDataProcessor - データ前処理と検証
 * 
 * ComparisonEngineから分離されたデータ処理専用コンポーネント
 * - データ前処理（正規化、フィルタリング、変換）
 * - データ検証（品質チェック、異常値検出）
 * - ヘルパーユーティリティ（メトリクス計算、フォーマット）
 * - サンプリング・集約処理
 */

export class ComparisonDataProcessor {
    constructor() {
        // データ処理設定
        this.config = {
            outlierThreshold: 2.5, // Z-score閾値
            minimumSampleSize: 5,
            maximumSampleSize: 10000,
            defaultSamplingRate: 0.1,
            maxProcessingTime: 5000 // 5秒
        };
        
        // データ品質メトリクス
        this.qualityMetrics = {
            completeness: 0,
            consistency: 0,
            accuracy: 0,
            validity: 0
        };
    }

    /**
     * 比較データを前処理
     * @param {object} rawData - 生データ
     * @param {object} options - 前処理オプション
     * @returns {object} 前処理済みデータ
     */
    preprocessComparisonData(rawData, options = {}) {
        const startTime = Date.now();
        
        try {
            const processedData = {
                timestamp: new Date().toISOString(),
                original: rawData,
                processed: {},
                metadata: {
                    processingTime: 0,
                    qualityScore: 0,
                    warnings: [],
                    errors: []
                }
            };
            
            // データ検証
            const validation = this.validateComparisonData(rawData);
            if (!validation.valid) {
                processedData.metadata.errors = validation.errors;
                return processedData;
            }
            
            // データ正規化
            processedData.processed = this.normalizeData(rawData, options);
            
            // 異常値処理
            if (options.removeOutliers !== false) {
                processedData.processed = this.removeOutliers(processedData.processed, options);
            }
            
            // サンプリング（必要な場合）
            if (options.sampling && this.shouldSample(processedData.processed)) {
                processedData.processed = this.sampleData(processedData.processed, options.sampling);
            }
            
            // データ品質計算
            processedData.metadata.qualityScore = this.calculateDataQuality(processedData.processed);
            processedData.metadata.processingTime = Date.now() - startTime;
            
            // 警告生成
            processedData.metadata.warnings = this.generateDataWarnings(processedData.processed);
            
            return processedData;
            
        } catch (error) {
            console.error('Error in preprocessComparisonData:', error);
            return {
                timestamp: new Date().toISOString(),
                error: error.message,
                metadata: {
                    processingTime: Date.now() - startTime,
                    errors: [error.message]
                }
            };
        }
    }

    /**
     * 比較データを検証
     * @param {object} data - 検証するデータ
     * @returns {object} 検証結果
     */
    validateComparisonData(data) {
        const errors = [];
        const warnings = [];
        
        // 基本構造チェック
        if (!data || typeof data !== 'object') {
            errors.push('Data must be an object');
            return { valid: false, errors, warnings };
        }
        
        // データセットの存在チェック
        const requiredFields = ['dataset1', 'dataset2'];
        for (const field of requiredFields) {
            if (!data[field]) {
                errors.push(`Missing required field: ${field}`);
            }
        }
        
        if (errors.length > 0) {
            return { valid: false, errors, warnings };
        }
        
        // データセット詳細検証
        const dataset1Validation = this.validateDataset(data.dataset1, 'dataset1');
        const dataset2Validation = this.validateDataset(data.dataset2, 'dataset2');
        
        errors.push(...dataset1Validation.errors);
        errors.push(...dataset2Validation.errors);
        warnings.push(...dataset1Validation.warnings);
        warnings.push(...dataset2Validation.warnings);
        
        // サンプルサイズチェック
        if (data.dataset1.length < this.config.minimumSampleSize) {
            warnings.push(`Dataset1 sample size (${data.dataset1.length}) below recommended minimum (${this.config.minimumSampleSize})`);
        }
        
        if (data.dataset2.length < this.config.minimumSampleSize) {
            warnings.push(`Dataset2 sample size (${data.dataset2.length}) below recommended minimum (${this.config.minimumSampleSize})`);
        }
        
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            quality: this.calculateValidationQuality(data.dataset1, data.dataset2)
        };
    }

    /**
     * 個別データセットを検証
     * @param {Array} dataset - データセット
     * @param {string} datasetName - データセット名
     * @returns {object} 検証結果
     */
    validateDataset(dataset, datasetName) {
        const errors = [];
        const warnings = [];
        
        if (!Array.isArray(dataset)) {
            errors.push(`${datasetName} must be an array`);
            return { errors, warnings };
        }
        
        if (dataset.length === 0) {
            errors.push(`${datasetName} cannot be empty`);
            return { errors, warnings };
        }
        
        // データ型チェック
        const validNumbers = dataset.filter(x => typeof x === 'number' && !isNaN(x) && isFinite(x));
        const validRatio = validNumbers.length / dataset.length;
        
        if (validRatio < 0.5) {
            errors.push(`${datasetName} has less than 50% valid numeric data`);
        } else if (validRatio < 0.8) {
            warnings.push(`${datasetName} has less than 80% valid numeric data`);
        }
        
        // 値の範囲チェック
        if (validNumbers.length > 0) {
            const min = Math.min(...validNumbers);
            const max = Math.max(...validNumbers);
            const range = max - min;
            
            if (range === 0) {
                warnings.push(`${datasetName} has no variance (all values are the same)`);
            }
            
            // 極端な値の検出
            const mean = validNumbers.reduce((sum, val) => sum + val, 0) / validNumbers.length;
            const stdDev = Math.sqrt(validNumbers.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validNumbers.length);
            
            const outliers = validNumbers.filter(val => Math.abs((val - mean) / stdDev) > this.config.outlierThreshold);
            if (outliers.length > validNumbers.length * 0.1) {
                warnings.push(`${datasetName} contains ${outliers.length} potential outliers (${Math.round(outliers.length / validNumbers.length * 100)}%)`);
            }
        }
        
        return { errors, warnings };
    }

    /**
     * データを正規化
     * @param {object} data - 正規化するデータ
     * @param {object} options - 正規化オプション
     * @returns {object} 正規化済みデータ
     */
    normalizeData(data, options = {}) {
        const normalized = {
            dataset1: this.normalizeDataset(data.dataset1, options),
            dataset2: this.normalizeDataset(data.dataset2, options),
            metadata: {
                normalizationType: options.normalizationType || 'none',
                timestamp: new Date().toISOString()
            }
        };
        
        // 追加のメタデータがあれば保持
        if (data.metadata) {
            normalized.metadata = { ...normalized.metadata, ...data.metadata };
        }
        
        return normalized;
    }

    /**
     * 個別データセットを正規化
     * @param {Array} dataset - データセット
     * @param {object} options - 正規化オプション
     * @returns {Array} 正規化済みデータセット
     */
    normalizeDataset(dataset, options = {}) {
        if (!Array.isArray(dataset) || dataset.length === 0) {
            return dataset;
        }
        
        const validNumbers = dataset.filter(x => typeof x === 'number' && !isNaN(x) && isFinite(x));
        if (validNumbers.length === 0) {
            return dataset;
        }
        
        const normalizationType = options.normalizationType || 'none';
        
        switch (normalizationType) {
            case 'z-score':
                return this.zScoreNormalization(validNumbers);
                
            case 'min-max':
                return this.minMaxNormalization(validNumbers, options.targetMin || 0, options.targetMax || 1);
                
            case 'robust':
                return this.robustNormalization(validNumbers);
                
            case 'none':
            default:
                return validNumbers;
        }
    }

    /**
     * Z-score正規化
     * @param {Array} data - データ配列
     * @returns {Array} 正規化済みデータ
     */
    zScoreNormalization(data) {
        const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
        const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
        const stdDev = Math.sqrt(variance);
        
        if (stdDev === 0) return data;
        
        return data.map(val => (val - mean) / stdDev);
    }

    /**
     * Min-Max正規化
     * @param {Array} data - データ配列
     * @param {number} targetMin - 目標最小値
     * @param {number} targetMax - 目標最大値
     * @returns {Array} 正規化済みデータ
     */
    minMaxNormalization(data, targetMin = 0, targetMax = 1) {
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min;
        
        if (range === 0) return data;
        
        const targetRange = targetMax - targetMin;
        return data.map(val => targetMin + ((val - min) / range) * targetRange);
    }

    /**
     * ロバスト正規化（中央値とIQRを使用）
     * @param {Array} data - データ配列
     * @returns {Array} 正規化済みデータ
     */
    robustNormalization(data) {
        const sorted = [...data].sort((a, b) => a - b);
        const median = this.calculateMedian(sorted);
        const q1 = this.calculateQuantile(sorted, 0.25);
        const q3 = this.calculateQuantile(sorted, 0.75);
        const iqr = q3 - q1;
        
        if (iqr === 0) return data;
        
        return data.map(val => (val - median) / iqr);
    }

    /**
     * 異常値を除去
     * @param {object} data - データオブジェクト
     * @param {object} options - 除去オプション
     * @returns {object} 異常値除去後のデータ
     */
    removeOutliers(data, options = {}) {
        const threshold = options.outlierThreshold || this.config.outlierThreshold;
        
        const cleanedData = {
            dataset1: this.removeDatasetOutliers(data.dataset1, threshold),
            dataset2: this.removeDatasetOutliers(data.dataset2, threshold),
            metadata: {
                ...data.metadata,
                outlierRemoval: {
                    threshold,
                    timestamp: new Date().toISOString()
                }
            }
        };
        
        // 除去統計を記録
        const original1Count = Array.isArray(data.dataset1) ? data.dataset1.length : 0;
        const original2Count = Array.isArray(data.dataset2) ? data.dataset2.length : 0;
        const cleaned1Count = cleanedData.dataset1.length;
        const cleaned2Count = cleanedData.dataset2.length;
        
        cleanedData.metadata.outlierRemoval.dataset1 = {
            original: original1Count,
            cleaned: cleaned1Count,
            removed: original1Count - cleaned1Count
        };
        
        cleanedData.metadata.outlierRemoval.dataset2 = {
            original: original2Count,
            cleaned: cleaned2Count,
            removed: original2Count - cleaned2Count
        };
        
        return cleanedData;
    }

    /**
     * 個別データセットから異常値を除去
     * @param {Array} dataset - データセット
     * @param {number} threshold - Z-score閾値
     * @returns {Array} 異常値除去後のデータセット
     */
    removeDatasetOutliers(dataset, threshold) {
        if (!Array.isArray(dataset) || dataset.length === 0) {
            return dataset;
        }
        
        const validNumbers = dataset.filter(x => typeof x === 'number' && !isNaN(x) && isFinite(x));
        if (validNumbers.length === 0) {
            return [];
        }
        
        const mean = validNumbers.reduce((sum, val) => sum + val, 0) / validNumbers.length;
        const variance = validNumbers.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validNumbers.length;
        const stdDev = Math.sqrt(variance);
        
        if (stdDev === 0) {
            return validNumbers;
        }
        
        return validNumbers.filter(val => Math.abs((val - mean) / stdDev) <= threshold);
    }

    /**
     * データをサンプリング
     * @param {object} data - データオブジェクト
     * @param {object} samplingOptions - サンプリングオプション
     * @returns {object} サンプリング後のデータ
     */
    sampleData(data, samplingOptions = {}) {
        const method = samplingOptions.method || 'random';
        const rate = samplingOptions.rate || this.config.defaultSamplingRate;
        
        return {
            dataset1: this.sampleDataset(data.dataset1, method, rate),
            dataset2: this.sampleDataset(data.dataset2, method, rate),
            metadata: {
                ...data.metadata,
                sampling: {
                    method,
                    rate,
                    timestamp: new Date().toISOString()
                }
            }
        };
    }

    /**
     * 個別データセットをサンプリング
     * @param {Array} dataset - データセット
     * @param {string} method - サンプリング方法
     * @param {number} rate - サンプリング率
     * @returns {Array} サンプリング後のデータセット
     */
    sampleDataset(dataset, method, rate) {
        if (!Array.isArray(dataset) || dataset.length === 0) {
            return dataset;
        }
        
        const sampleSize = Math.max(1, Math.floor(dataset.length * rate));
        
        switch (method) {
            case 'systematic':
                return this.systematicSample(dataset, sampleSize);
                
            case 'stratified':
                return this.stratifiedSample(dataset, sampleSize);
                
            case 'random':
            default:
                return this.randomSample(dataset, sampleSize);
        }
    }

    /**
     * ランダムサンプリング
     * @param {Array} dataset - データセット
     * @param {number} sampleSize - サンプルサイズ
     * @returns {Array} サンプリング後のデータ
     */
    randomSample(dataset, sampleSize) {
        const shuffled = [...dataset].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, sampleSize);
    }

    /**
     * 系統サンプリング
     * @param {Array} dataset - データセット
     * @param {number} sampleSize - サンプルサイズ
     * @returns {Array} サンプリング後のデータ
     */
    systematicSample(dataset, sampleSize) {
        if (sampleSize >= dataset.length) {
            return [...dataset];
        }
        
        const interval = Math.floor(dataset.length / sampleSize);
        const start = Math.floor(Math.random() * interval);
        const sample = [];
        
        for (let i = start; i < dataset.length; i += interval) {
            sample.push(dataset[i]);
            if (sample.length >= sampleSize) break;
        }
        
        return sample;
    }

    /**
     * 層化サンプリング
     * @param {Array} dataset - データセット
     * @param {number} sampleSize - サンプルサイズ
     * @returns {Array} サンプリング後のデータ
     */
    stratifiedSample(dataset, sampleSize) {
        // 簡易的な層化：値の範囲を3つに分割
        const sorted = [...dataset].sort((a, b) => a - b);
        const tercileSize = Math.floor(sorted.length / 3);
        
        const strata = [
            sorted.slice(0, tercileSize),
            sorted.slice(tercileSize, tercileSize * 2),
            sorted.slice(tercileSize * 2)
        ];
        
        const samplePerStratum = Math.floor(sampleSize / 3);
        const sample = [];
        
        for (const stratum of strata) {
            const stratumSample = this.randomSample(stratum, samplePerStratum);
            sample.push(...stratumSample);
        }
        
        return sample.slice(0, sampleSize);
    }

    // ヘルパーメソッド群

    /**
     * サンプリングが必要かどうかを判定
     * @param {object} data - データオブジェクト
     * @returns {boolean} サンプリング必要フラグ
     */
    shouldSample(data) {
        const dataset1Size = Array.isArray(data.dataset1) ? data.dataset1.length : 0;
        const dataset2Size = Array.isArray(data.dataset2) ? data.dataset2.length : 0;
        
        return dataset1Size > this.config.maximumSampleSize || 
               dataset2Size > this.config.maximumSampleSize;
    }

    /**
     * データ品質スコアを計算
     * @param {object} data - データオブジェクト
     * @returns {number} 品質スコア（0-1）
     */
    calculateDataQuality(data) {
        try {
            const dataset1Quality = this.calculateDatasetQuality(data.dataset1);
            const dataset2Quality = this.calculateDatasetQuality(data.dataset2);
            
            return (dataset1Quality + dataset2Quality) / 2;
            
        } catch (error) {
            console.error('Error calculating data quality:', error);
            return 0;
        }
    }

    /**
     * 個別データセットの品質を計算
     * @param {Array} dataset - データセット
     * @returns {number} 品質スコア（0-1）
     */
    calculateDatasetQuality(dataset) {
        if (!Array.isArray(dataset) || dataset.length === 0) {
            return 0;
        }
        
        const validNumbers = dataset.filter(x => typeof x === 'number' && !isNaN(x) && isFinite(x));
        const completeness = validNumbers.length / dataset.length;
        
        if (validNumbers.length === 0) {
            return 0;
        }
        
        // 分散の存在チェック
        const mean = validNumbers.reduce((sum, val) => sum + val, 0) / validNumbers.length;
        const variance = validNumbers.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validNumbers.length;
        const hasVariance = variance > 0 ? 1 : 0;
        
        // サンプルサイズの適切性
        const sizeScore = Math.min(1, validNumbers.length / this.config.minimumSampleSize);
        
        return (completeness * 0.4 + hasVariance * 0.3 + sizeScore * 0.3);
    }

    /**
     * 検証品質を計算
     * @param {Array} dataset1 - データセット1
     * @param {Array} dataset2 - データセット2
     * @returns {number} 検証品質スコア（0-1）
     */
    calculateValidationQuality(dataset1, dataset2) {
        const quality1 = this.calculateDatasetQuality(dataset1);
        const quality2 = this.calculateDatasetQuality(dataset2);
        
        // データセット間のバランスチェック
        const size1 = Array.isArray(dataset1) ? dataset1.length : 0;
        const size2 = Array.isArray(dataset2) ? dataset2.length : 0;
        const sizeRatio = size1 > 0 && size2 > 0 ? Math.min(size1, size2) / Math.max(size1, size2) : 0;
        
        return (quality1 + quality2) / 2 * (0.8 + 0.2 * sizeRatio);
    }

    /**
     * データ警告を生成
     * @param {object} data - データオブジェクト
     * @returns {Array} 警告配列
     */
    generateDataWarnings(data) {
        const warnings = [];
        
        const dataset1Size = Array.isArray(data.dataset1) ? data.dataset1.length : 0;
        const dataset2Size = Array.isArray(data.dataset2) ? data.dataset2.length : 0;
        
        // サンプルサイズ警告
        if (dataset1Size < this.config.minimumSampleSize) {
            warnings.push(`Dataset1 sample size (${dataset1Size}) is below recommended minimum`);
        }
        
        if (dataset2Size < this.config.minimumSampleSize) {
            warnings.push(`Dataset2 sample size (${dataset2Size}) is below recommended minimum`);
        }
        
        // サイズ不均衡警告
        if (dataset1Size > 0 && dataset2Size > 0) {
            const ratio = Math.min(dataset1Size, dataset2Size) / Math.max(dataset1Size, dataset2Size);
            if (ratio < 0.5) {
                warnings.push('Significant size imbalance between datasets');
            }
        }
        
        // 品質警告
        const qualityScore = this.calculateDataQuality(data);
        if (qualityScore < 0.6) {
            warnings.push('Data quality score is below recommended threshold');
        }
        
        return warnings;
    }

    /**
     * 中央値を計算
     * @param {Array} sortedData - ソート済みデータ
     * @returns {number} 中央値
     */
    calculateMedian(sortedData) {
        const n = sortedData.length;
        if (n === 0) return 0;
        
        if (n % 2 === 0) {
            return (sortedData[n / 2 - 1] + sortedData[n / 2]) / 2;
        } else {
            return sortedData[Math.floor(n / 2)];
        }
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
     * メトリクス計算ヘルパー
     * @param {Array} data - データ配列
     * @param {string} metricType - メトリクスタイプ
     * @returns {number} メトリクス値
     */
    calculateMetric(data, metricType) {
        if (!Array.isArray(data) || data.length === 0) {
            return 0;
        }
        
        const validNumbers = data.filter(x => typeof x === 'number' && !isNaN(x) && isFinite(x));
        if (validNumbers.length === 0) {
            return 0;
        }
        
        switch (metricType) {
            case 'mean':
                return validNumbers.reduce((sum, val) => sum + val, 0) / validNumbers.length;
                
            case 'median':
                return this.calculateMedian([...validNumbers].sort((a, b) => a - b));
                
            case 'stddev':
                const mean = this.calculateMetric(validNumbers, 'mean');
                const variance = validNumbers.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validNumbers.length;
                return Math.sqrt(variance);
                
            case 'range':
                return Math.max(...validNumbers) - Math.min(...validNumbers);
                
            case 'count':
                return validNumbers.length;
                
            default:
                return 0;
        }
    }

    /**
     * 設定を取得
     * @returns {object} 現在の設定
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * 設定を更新
     * @param {object} newConfig - 新しい設定
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * 品質メトリクスを取得
     * @returns {object} 品質メトリクス
     */
    getQualityMetrics() {
        return { ...this.qualityMetrics };
    }
}