/**
 * コア比較エンジンクラス
 * データの比較・分析機能を提供
 */

import { getErrorHandler } from '../utils/ErrorHandler';

export interface ComparisonData {
    id: string;
    value: number;
    metadata?: Record<string, any>;
    timestamp?: number;
}

export interface ComparisonResult {
    compared: boolean;
    difference: number;
    percentage: number;
    trend: 'up' | 'down' | 'equal';
    significance: 'high' | 'medium' | 'low';
    details?: ComparisonDetails;
}

export interface ComparisonDetails {
    absoluteDifference: number;
    relativeDifference: number;
    standardizedDifference: number;
    confidence: number;
}

export interface ComparisonConfig {
    precision: number;
    significanceThreshold: number;
    confidenceLevel: number;
    enableStatistics: boolean;
}

export class CoreComparisonEngine {
    private config: ComparisonConfig;
    private cache: Map<string, ComparisonResult>;
    private statistics: Map<string, any>;

    constructor(config: Partial<ComparisonConfig> = {}) {
        this.config = {
            precision: 2,
            significanceThreshold: 0.05,
            confidenceLevel: 0.95,
            enableStatistics: true,
            ...config
        };

        this.cache = new Map();
        this.statistics = new Map();

        console.log('CoreComparisonEngine initialized');
    }

    /**
     * 2つの数値を比較
     */
    compareNumbers(a: number, b: number): ComparisonResult {
        try {
            const difference = b - a;
            const percentage = a !== 0 ? (difference / Math.abs(a)) * 100 : 0;
            
            let trend: 'up' | 'down' | 'equal' = 'equal';
            if (difference > 0) trend = 'up';
            else if (difference < 0) trend = 'down';

            const significance = this._calculateSignificance(Math.abs(percentage));

            return {
                compared: true,
                difference: Number(difference.toFixed(this.config.precision)),
                percentage: Number(percentage.toFixed(this.config.precision)),
                trend,
                significance,
                details: {
                    absoluteDifference: Math.abs(difference),
                    relativeDifference: percentage,
                    standardizedDifference: this._standardizeDifference(difference, a, b),
                    confidence: this.config.confidenceLevel
                }
            };
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'CoreComparisonEngine.compareNumbers',
                a,
                b
            });

            return {
                compared: false,
                difference: 0,
                percentage: 0,
                trend: 'equal',
                significance: 'low'
            };
        }
    }

    /**
     * データセットを比較
     */
    compareDatasets(dataset1: ComparisonData[], dataset2: ComparisonData[]): ComparisonResult[] {
        const results: ComparisonResult[] = [];

        try {
            const maxLength = Math.max(dataset1.length, dataset2.length);

            for (let i = 0; i < maxLength; i++) {
                const data1 = dataset1[i];
                const data2 = dataset2[i];

                if (data1 && data2) {
                    const result = this.compareNumbers(data1.value, data2.value);
                    results.push({
                        ...result,
                        details: {
                            ...result.details!,
                            confidence: this._calculateConfidence(data1, data2)
                        }
                    });
                } else {
                    results.push({
                        compared: false,
                        difference: 0,
                        percentage: 0,
                        trend: 'equal',
                        significance: 'low'
                    });
                }
            }
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'CoreComparisonEngine.compareDatasets',
                dataset1Length: dataset1.length,
                dataset2Length: dataset2.length
            });
        }

        return results;
    }

    /**
     * 統計的比較
     */
    compareStatistically(values1: number[], values2: number[]): ComparisonResult {
        try {
            const stats1 = this._calculateStatistics(values1);
            const stats2 = this._calculateStatistics(values2);

            const meanDiff = stats2.mean - stats1.mean;
            const percentage = stats1.mean !== 0 ? (meanDiff / Math.abs(stats1.mean)) * 100 : 0;

            let trend: 'up' | 'down' | 'equal' = 'equal';
            if (meanDiff > 0) trend = 'up';
            else if (meanDiff < 0) trend = 'down';

            const significance = this._calculateStatisticalSignificance(stats1, stats2);
            const confidence = this._calculateStatisticalConfidence(stats1, stats2);

            return {
                compared: true,
                difference: Number(meanDiff.toFixed(this.config.precision)),
                percentage: Number(percentage.toFixed(this.config.precision)),
                trend,
                significance,
                details: {
                    absoluteDifference: Math.abs(meanDiff),
                    relativeDifference: percentage,
                    standardizedDifference: meanDiff / Math.sqrt((stats1.variance + stats2.variance) / 2),
                    confidence
                }
            };
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'CoreComparisonEngine.compareStatistically',
                values1Length: values1.length,
                values2Length: values2.length
            });

            return {
                compared: false,
                difference: 0,
                percentage: 0,
                trend: 'equal',
                significance: 'low'
            };
        }
    }

    /**
     * 有意性を計算
     */
    private _calculateSignificance(percentage: number): 'high' | 'medium' | 'low' {
        if (percentage >= 50) return 'high';
        if (percentage >= 10) return 'medium';
        return 'low';
    }

    /**
     * 標準化差分を計算
     */
    private _standardizeDifference(difference: number, a: number, b: number): number {
        const mean = (a + b) / 2;
        const std = Math.sqrt(((a - mean) ** 2 + (b - mean) ** 2) / 2);
        return std !== 0 ? difference / std : 0;
    }

    /**
     * 信頼度を計算
     */
    private _calculateConfidence(data1: ComparisonData, data2: ComparisonData): number {
        // 基本的な信頼度計算
        let confidence = this.config.confidenceLevel;

        // メタデータがある場合は信頼度を調整
        if (data1.metadata?.quality && data2.metadata?.quality) {
            const avgQuality = (data1.metadata.quality + data2.metadata.quality) / 2;
            confidence *= avgQuality;
        }

        return Number(confidence.toFixed(3));
    }

    /**
     * 統計情報を計算
     */
    private _calculateStatistics(values: number[]): any {
        if (values.length === 0) {
            return { mean: 0, variance: 0, stdDev: 0, count: 0 };
        }

        const sum = values.reduce((acc, val) => acc + val, 0);
        const mean = sum / values.length;
        
        const variance = values.reduce((acc, val) => acc + (val - mean) ** 2, 0) / values.length;
        const stdDev = Math.sqrt(variance);

        return {
            mean,
            variance,
            stdDev,
            count: values.length,
            sum,
            min: Math.min(...values),
            max: Math.max(...values)
        };
    }

    /**
     * 統計的有意性を計算
     */
    private _calculateStatisticalSignificance(stats1: any, stats2: any): 'high' | 'medium' | 'low' {
        // 簡易的なt検定の近似
        const pooledStd = Math.sqrt((stats1.variance + stats2.variance) / 2);
        if (pooledStd === 0) return 'low';

        const tStat = Math.abs(stats1.mean - stats2.mean) / (pooledStd * Math.sqrt(2 / Math.min(stats1.count, stats2.count)));
        
        if (tStat >= 2.576) return 'high';    // p < 0.01
        if (tStat >= 1.96) return 'medium';   // p < 0.05
        return 'low';
    }

    /**
     * 統計的信頼度を計算
     */
    private _calculateStatisticalConfidence(stats1: any, stats2: any): number {
        // サンプルサイズと分散に基づく信頼度計算
        const minSampleSize = Math.min(stats1.count, stats2.count);
        const maxVariance = Math.max(stats1.variance, stats2.variance);

        let confidence = this.config.confidenceLevel;

        // サンプルサイズが少ない場合は信頼度を下げる
        if (minSampleSize < 10) confidence *= 0.8;
        else if (minSampleSize < 30) confidence *= 0.9;

        // 分散が大きい場合は信頼度を下げる
        if (maxVariance > 100) confidence *= 0.9;

        return Number(confidence.toFixed(3));
    }

    /**
     * キャッシュをクリア
     */
    clearCache(): void {
        this.cache.clear();
        this.statistics.clear();
    }

    /**
     * 設定を更新
     */
    updateConfig(newConfig: Partial<ComparisonConfig>): void {
        this.config = { ...this.config, ...newConfig };
        this.clearCache(); // 設定変更時はキャッシュをクリア
    }

    /**
     * 統計情報を取得
     */
    getStatistics(): Map<string, any> {
        return new Map(this.statistics);
    }
}

// シングルトンインスタンス
let instance: CoreComparisonEngine | null = null;

export function getCoreComparisonEngine(config?: Partial<ComparisonConfig>): CoreComparisonEngine {
    if (!instance) {
        instance = new CoreComparisonEngine(config);
    }
    return instance;
}