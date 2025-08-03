// サブコンポーネントのインポート
import { StatisticalAnalyzer } from './comparison-engine/StatisticalAnalyzer.js';
import { StageComparisonAnalyzer } from './comparison-engine/StageComparisonAnalyzer.js';
import { ComparisonDataProcessor } from './comparison-engine/ComparisonDataProcessor.js';

/**
 * 比較分析エンジンクラス（リファクタリング版）
 * 期間別データ比較、A/Bテスト分析、統計的有意性検定を行う
 * サブコンポーネント化により保守性と可読性を向上
 */
export class ComparisonEngine {
    constructor() {
        try {
            // 比較タイプ定義
            this.comparisonTypes = {
                TEMPORAL: 'temporal',           // 時間的比較
                SEGMENTAL: 'segmental',         // セグメント比較
                BASELINE: 'baseline',           // ベースライン比較
                BENCHMARK: 'benchmark'          // ベンチマーク比較
            };
            
            // 有意性検定タイプ
            this.significanceTests = {
                T_TEST: 't_test',
                WILCOXON: 'wilcoxon',
                CHI_SQUARE: 'chi_square',
                MANN_WHITNEY: 'mann_whitney'
            };
            
            // 基本設定
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
            
            // サブコンポーネント初期化
            this._initializeSubComponents();
            
            console.log('[ComparisonEngine] サブコンポーネント統合版で初期化完了');
            
        } catch (error) {
            console.error('Failed to initialize ComparisonEngine:', error);
            this._initializeFallbackMode();
        }
    }
    
    /**
     * サブコンポーネントを初期化
     * @private
     */
    _initializeSubComponents() {
        // 統計解析コンポーネント
        this.statisticalAnalyzer = new StatisticalAnalyzer();
        
        // ステージ比較解析コンポーネント
        this.stageComparisonAnalyzer = new StageComparisonAnalyzer(this.statisticalAnalyzer);
        
        // データ処理コンポーネント
        this.dataProcessor = new ComparisonDataProcessor();
        
        console.log('[ComparisonEngine] All sub-components initialized successfully');
    }
    
    /**
     * フォールバックモードで初期化
     * @private
     */
    _initializeFallbackMode() {
        console.warn('[ComparisonEngine] Initializing in fallback mode due to sub-component error');
        this.statisticalAnalyzer = null;
        this.stageComparisonAnalyzer = null;
        this.dataProcessor = null;
    }
    
    // =============================================================================
    // メイン比較分析API（公開メソッド）
    // =============================================================================
    
    /**
     * メインの比較分析
     * @param {Array} dataset1 - データセット1
     * @param {Array} dataset2 - データセット2
     * @param {object} options - 比較オプション
     * @returns {object} 比較分析結果
     */
    compare(dataset1, dataset2, options = {}) {
        try {
            const config = { ...this.comparisonConfigs, ...options };
            
            // データ前処理
            const processedData = this.dataProcessor.preprocessComparisonData({
                dataset1: dataset1,
                dataset2: dataset2
            }, options);
            
            if (processedData.error) {
                return this._createErrorResult('データ前処理エラー', processedData.error);
            }
            
            // データ検証
            const validation = this.dataProcessor.validateComparisonData(processedData.processed);
            if (!validation.valid) {
                return this._createInvalidComparisonResult(processedData.processed, validation.errors);
            }
            
            // 基本統計計算
            const basicStats1 = this.statisticalAnalyzer.calculateBasicStatistics(processedData.processed.dataset1);
            const basicStats2 = this.statisticalAnalyzer.calculateBasicStatistics(processedData.processed.dataset2);
            
            // 統計的有意性検定
            const significanceTest = this.statisticalAnalyzer.performSignificanceTest(
                processedData.processed.dataset1,
                processedData.processed.dataset2,
                config
            );
            
            // 効果量計算
            const effectSize = this.statisticalAnalyzer.calculateEffectSize(basicStats1, basicStats2);
            
            // 変化分析
            const changeAnalysis = this._analyzeChange(basicStats1, basicStats2);
            
            // トレンド比較
            const trendComparison = this._compareTrends(processedData.processed);
            
            // 総合評価
            const overallAssessment = this._assessOverallComparison({
                changeAnalysis,
                significanceTest,
                effectSize,
                trendComparison
            });
            
            return {
                comparisonId: this._generateComparisonId(),
                timestamp: Date.now(),
                
                // データセット情報
                datasets: {
                    dataset1: {
                        name: dataset1.name || 'Dataset 1',
                        size: processedData.processed.dataset1.length,
                        statistics: basicStats1
                    },
                    dataset2: {
                        name: dataset2.name || 'Dataset 2',
                        size: processedData.processed.dataset2.length,
                        statistics: basicStats2
                    }
                },
                
                // 分析結果
                analysis: {
                    significance: significanceTest,
                    effectSize: effectSize,
                    change: changeAnalysis,
                    trends: trendComparison
                },
                
                // 総合評価
                assessment: overallAssessment,
                
                // メタデータ
                metadata: {
                    processingTime: processedData.metadata?.processingTime || 0,
                    dataQuality: processedData.metadata?.qualityScore || 0,
                    warnings: processedData.metadata?.warnings || []
                }
            };
            
        } catch (error) {
            console.error('Error in comparison analysis:', error);
            return this._createErrorResult('比較分析エラー', error.message);
        }
    }
    
    /**
     * 時間的比較分析
     * @param {object} period1Data - 期間1のデータ
     * @param {object} period2Data - 期間2のデータ
     * @param {string} category - 比較カテゴリ
     * @param {object} options - オプション
     * @returns {object} 時間的比較結果
     */
    compareTimePeriods(period1Data, period2Data, category, options = {}) {
        try {
            const config = { ...this.comparisonConfigs, ...options };
            
            // 期間データの処理
            const processedPeriod1 = this._extractPeriodValues(period1Data, category);
            const processedPeriod2 = this._extractPeriodValues(period2Data, category);
            
            // メイン比較分析を実行
            const mainComparison = this.compare(processedPeriod1, processedPeriod2, config);
            
            if (mainComparison.error) {
                return mainComparison;
            }
            
            // 時間的特有の分析を追加
            const temporalAnalysis = this._analyzeTemporalPatterns(period1Data, period2Data, category);
            const seasonalityAnalysis = this._analyzeSeasonalityImpact(period1Data.period, period2Data.period);
            
            return {
                ...mainComparison,
                comparisonType: this.comparisonTypes.TEMPORAL,
                temporal: {
                    patterns: temporalAnalysis,
                    seasonality: seasonalityAnalysis,
                    periodLength: {
                        period1: this._calculatePeriodLength(period1Data.period),
                        period2: this._calculatePeriodLength(period2Data.period)
                    }
                }
            };
            
        } catch (error) {
            console.error('Error in temporal comparison:', error);
            return this._createErrorResult('時間的比較エラー', error.message);
        }
    }
    
    /**
     * ベースライン比較
     * @param {Array} currentData - 現在のデータ
     * @param {Array} baselineData - ベースラインデータ
     * @param {object} options - オプション
     * @returns {object} ベースライン比較結果
     */
    compareAgainstBaseline(currentData, baselineData, options = {}) {
        try {
            const mainComparison = this.compare(currentData, baselineData, options);
            
            if (mainComparison.error) {
                return mainComparison;
            }
            
            // ベースライン特有の分析
            const baselineAnalysis = this._analyzeBaselineDeviation(mainComparison);
            const performanceIndex = this._calculatePerformanceIndex(currentData, baselineData);
            const alertLevel = this._determineAlertLevel(mainComparison.analysis.change, mainComparison.analysis.significance);
            
            return {
                ...mainComparison,
                comparisonType: this.comparisonTypes.BASELINE,
                baseline: {
                    deviation: baselineAnalysis,
                    performanceIndex: performanceIndex,
                    alertLevel: alertLevel,
                    recommendations: this._generateBaselineRecommendations(baselineAnalysis, alertLevel)
                }
            };
            
        } catch (error) {
            console.error('Error in baseline comparison:', error);
            return this._createErrorResult('ベースライン比較エラー', error.message);
        }
    }
    
    /**
     * ステージパフォーマンス比較
     * @param {object} stageData - ステージデータ
     * @param {object} options - オプション
     * @returns {object} ステージ比較結果
     */
    compareStagePerformance(stageData, options = {}) {
        try {
            // ステージ比較アナライザーに委譲
            const stageComparison = this.stageComparisonAnalyzer.compareStagePerformance(stageData, options);
            
            if (stageComparison.error) {
                return this._createErrorResult('ステージ比較エラー', stageComparison.error);
            }
            
            // 追加のメタデータを付与
            return {
                ...stageComparison,
                comparisonType: this.comparisonTypes.SEGMENTAL,
                comparisonId: this._generateComparisonId(),
                metadata: {
                    ...stageComparison.metadata,
                    engineVersion: '2.0.0',
                    componentVersion: 'stage-comparison-analyzer'
                }
            };
            
        } catch (error) {
            console.error('Error in stage comparison:', error);
            return this._createErrorResult('ステージ比較エラー', error.message);
        }
    }
    
    // =============================================================================
    // データ処理ヘルパーメソッド
    // =============================================================================
    
    /**
     * 期間データから値を抽出
     * @private
     * @param {object} periodData - 期間データ
     * @param {string} category - カテゴリ
     * @returns {Array} 抽出された値
     */
    _extractPeriodValues(periodData, category) {
        if (!periodData || !periodData.data) {
            return [];
        }
        
        const data = periodData.data;
        
        switch (category) {
            case 'score':
                return data.map(d => d.score).filter(s => typeof s === 'number');
            case 'time':
                return data.map(d => d.completionTime).filter(t => typeof t === 'number');
            case 'accuracy':
                return data.map(d => d.accuracy).filter(a => typeof a === 'number');
            default:
                return data.map(d => d[category]).filter(v => typeof v === 'number');
        }
    }
    
    /**
     * 変化を分析
     * @private
     * @param {object} stats1 - 統計1
     * @param {object} stats2 - 統計2
     * @returns {object} 変化分析結果
     */
    _analyzeChange(stats1, stats2) {
        const meanChange = stats2.mean - stats1.mean;
        const meanPercentChange = stats1.mean !== 0 ? (meanChange / stats1.mean) * 100 : 0;
        
        const variabilityChange = stats2.standardDeviation - stats1.standardDeviation;
        const variabilityPercentChange = stats1.standardDeviation !== 0 
            ? (variabilityChange / stats1.standardDeviation) * 100 : 0;
        
        return {
            mean: {
                absolute: meanChange,
                percent: meanPercentChange,
                direction: this._determineChangeDirection(meanChange),
                magnitude: Math.abs(meanPercentChange)
            },
            variability: {
                absolute: variabilityChange,
                percent: variabilityPercentChange,
                interpretation: this._interpretVariabilityChange(variabilityChange)
            },
            range: {
                change: (stats2.maximum - stats2.minimum) - (stats1.maximum - stats1.minimum),
                dataset1: stats1.maximum - stats1.minimum,
                dataset2: stats2.maximum - stats2.minimum
            }
        };
    }
    
    /**
     * トレンドを比較
     * @private
     * @param {object} processedData - 処理済みデータ
     * @returns {object} トレンド比較結果
     */
    _compareTrends(processedData) {
        try {
            const trend1 = this._calculateTrend(processedData.dataset1);
            const trend2 = this._calculateTrend(processedData.dataset2);
            
            return {
                dataset1: trend1,
                dataset2: trend2,
                comparison: {
                    direction: this._compareTrendDirections(trend1, trend2),
                    strength: this._compareTrendStrengths(trend1, trend2),
                    convergence: this._analyzeTrendConvergence(trend1, trend2)
                }
            };
            
        } catch (error) {
            console.error('Error comparing trends:', error);
            return { error: true, message: error.message };
        }
    }
    
    /**
     * 総合評価を実施
     * @private
     * @param {object} analyses - 各種分析結果
     * @returns {object} 総合評価
     */
    _assessOverallComparison(analyses) {
        const { changeAnalysis, significanceTest, effectSize, trendComparison } = analyses;
        
        // 有意性レベル
        const significanceLevel = significanceTest.significant ? 'significant' : 'not_significant';
        
        // 効果サイズレベル
        const effectSizeLevel = effectSize?.interpretation || 'unknown';
        
        // 変化の方向と強度
        const changeDirection = changeAnalysis.mean.direction;
        const changeMagnitude = changeAnalysis.mean.magnitude;
        
        // 総合判定
        const overallJudgment = this._determineOverallJudgment({
            significanceLevel,
            effectSizeLevel,
            changeDirection,
            changeMagnitude
        });
        
        // 推奨事項生成
        const recommendations = this._generateRecommendations(overallJudgment, changeAnalysis);
        
        return {
            significance: significanceLevel,
            effectSize: effectSizeLevel,
            change: {
                direction: changeDirection,
                magnitude: changeMagnitude,
                interpretation: this._interpretChangeMagnitude(changeMagnitude)
            },
            judgment: overallJudgment,
            confidence: this._calculateConfidenceLevel(significanceTest, effectSize),
            recommendations: recommendations
        };
    }
    
    // =============================================================================
    // 分析ヘルパーメソッド
    // =============================================================================
    
    /**
     * 時間的パターンを分析
     * @private
     * @param {object} period1Data - 期間1データ
     * @param {object} period2Data - 期間2データ
     * @param {string} category - カテゴリ
     * @returns {object} 時間的パターン分析結果
     */
    _analyzeTemporalPatterns(period1Data, period2Data, category) {
        return {
            growth: this._calculateGrowthRate(period1Data, period2Data),
            volatility: this._calculateVolatilityChange(period1Data, period2Data),
            cyclical: this._detectCyclicalPatterns(period1Data, period2Data),
            seasonal: this._detectSeasonalPatterns(period1Data, period2Data)
        };
    }
    
    /**
     * トレンドを計算
     * @private
     * @param {Array} data - データ配列
     * @returns {object} トレンド情報
     */
    _calculateTrend(data) {
        if (!Array.isArray(data) || data.length < 2) {
            return { direction: 'unknown', strength: 0, slope: 0 };
        }
        
        // 簡易線形回帰でトレンド計算
        const n = data.length;
        const x = Array.from({ length: n }, (_, i) => i);
        const y = data;
        
        const sumX = x.reduce((sum, val) => sum + val, 0);
        const sumY = y.reduce((sum, val) => sum + val, 0);
        const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
        const sumXX = x.reduce((sum, val) => sum + val * val, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const strength = Math.abs(slope);
        
        let direction = 'stable';
        if (slope > 0.1) direction = 'increasing';
        else if (slope < -0.1) direction = 'decreasing';
        
        return { direction, strength, slope };
    }
    
    // =============================================================================
    // ユーティリティメソッド
    // =============================================================================
    
    /**
     * 変化方向を決定
     * @private
     * @param {number} change - 変化量
     * @returns {string} 変化方向
     */
    _determineChangeDirection(change) {
        if (Math.abs(change) < 0.01) return 'stable';
        return change > 0 ? 'increase' : 'decrease';
    }
    
    /**
     * 変動性変化を解釈
     * @private
     * @param {number} change - 変動性変化
     * @returns {string} 解釈
     */
    _interpretVariabilityChange(change) {
        if (Math.abs(change) < 0.1) return 'stable';
        return change > 0 ? 'more_variable' : 'less_variable';
    }
    
    /**
     * 比較IDを生成
     * @private
     * @returns {string} 比較ID
     */
    _generateComparisonId() {
        return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * エラー結果を作成
     * @private
     * @param {string} title - エラータイトル
     * @param {string} message - エラーメッセージ
     * @returns {object} エラー結果オブジェクト
     */
    _createErrorResult(title, message) {
        return {
            error: true,
            title: title,
            message: message,
            timestamp: Date.now(),
            comparisonId: this._generateComparisonId()
        };
    }
    
    /**
     * 無効な比較結果を作成
     * @private
     * @param {object} data - データ
     * @param {Array} errors - エラー配列
     * @returns {object} 無効な比較結果
     */
    _createInvalidComparisonResult(data, errors) {
        return {
            error: true,
            title: 'データ検証エラー',
            message: 'データが比較分析の要件を満たしていません',
            errors: errors,
            timestamp: Date.now(),
            comparisonId: this._generateComparisonId(),
            datasets: {
                dataset1: { size: Array.isArray(data.dataset1) ? data.dataset1.length : 0 },
                dataset2: { size: Array.isArray(data.dataset2) ? data.dataset2.length : 0 }
            }
        };
    }
    
    // =============================================================================
    // フォールバック・スタブメソッド
    // =============================================================================
    
    // 簡易実装のスタブメソッド（必要に応じて拡張）
    _analyzeSeasonalityImpact(period1, period2) { return { detected: false }; }
    _calculatePeriodLength(period) { return 1; }
    _analyzeBaselineDeviation(comparison) { return { level: 'normal' }; }
    _calculatePerformanceIndex(current, baseline) { return 1.0; }
    _determineAlertLevel(change, significance) { return significance.significant ? 'attention' : 'normal'; }
    _generateBaselineRecommendations(deviation, alertLevel) { return []; }
    _compareTrendDirections(trend1, trend2) { return 'similar'; }
    _compareTrendStrengths(trend1, trend2) { return 'similar'; }
    _analyzeTrendConvergence(trend1, trend2) { return { converging: false }; }
    _determineOverallJudgment(factors) { return 'neutral'; }
    _generateRecommendations(judgment, change) { return []; }
    _interpretChangeMagnitude(magnitude) { return magnitude > 10 ? 'large' : magnitude > 5 ? 'medium' : 'small'; }
    _calculateConfidenceLevel(significance, effectSize) { return significance.significant ? 0.8 : 0.3; }
    _calculateGrowthRate(data1, data2) { return 0; }
    _calculateVolatilityChange(data1, data2) { return 0; }
    _detectCyclicalPatterns(data1, data2) { return { detected: false }; }
    _detectSeasonalPatterns(data1, data2) { return { detected: false }; }
    
    // =============================================================================
    // 設定・状態取得メソッド
    // =============================================================================
    
    /**
     * 現在の設定を取得
     * @returns {object} 現在の設定
     */
    getConfig() {
        return { ...this.comparisonConfigs };
    }
    
    /**
     * サブコンポーネントの状態を取得
     * @returns {object} サブコンポーネント状態
     */
    getComponentStatus() {
        return {
            statisticalAnalyzer: !!this.statisticalAnalyzer,
            stageComparisonAnalyzer: !!this.stageComparisonAnalyzer,
            dataProcessor: !!this.dataProcessor,
            initialized: !!(this.statisticalAnalyzer && this.stageComparisonAnalyzer && this.dataProcessor)
        };
    }
    
    /**
     * 診断情報を取得
     * @returns {object} 診断情報
     */
    getDiagnostics() {
        const componentStatus = this.getComponentStatus();
        
        return {
            timestamp: Date.now(),
            version: '2.0.0',
            components: componentStatus,
            config: this.getConfig(),
            health: componentStatus.initialized ? 'healthy' : 'degraded'
        };
    }
}

// デフォルトエクスポート
export default ComparisonEngine;