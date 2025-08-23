/**
 * PerformanceMetricsCollector - パフォーマンスメトリクスの収集と分析を担当するコンポーネント
 * データ収集、統計計算、ベースライン比較、分析機能を提供
 */

// 型定義
interface PerformanceTestSuite {
    baselines: Map<string, any>;
    getPreviousTestResults(): PreviousTestResults | null;
}

interface PreviousTestResults {
    results: Map<string, TestCategoryResults>;
}

interface TestCategoryResults {
    passed: boolean;
    tests: Record<string, TestResult>;
}

interface TestResult {
    passed: boolean;
    result: number;
    expected: number;
    detail?: any;
}

interface MetricEntry {
    duration: number;
    timestamp: number;
    detail: any;
}

interface CollectedMetrics {
    timestamp: number;
    memory: MemoryUsage;
    frameRate: number;
    testResults: Map<string, TestCategoryResults>;
    systemInfo: SystemInfo;
}

interface MemoryUsage {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
    timestamp: number;
}

interface SystemInfo {
    userAgent: string;
    platform: string;
    hardwareConcurrency: number | string;
    language: string;
    onLine: boolean;
    cookieEnabled: boolean;
    timestamp: number;
}

interface AnalysisResult {
    overallPassed: boolean;
    regressions: RegressionEntry[];
    improvements: ImprovementEntry[];
    comparison: Map<string, ComparisonResult>;
    statistics: TestStatistics;
}

interface RegressionEntry {
    category: string;
    test: string;
    result: number;
    expected: number;
    severity: SeverityLevel;
}

interface ImprovementEntry {
    category: string;
    test: string;
    improvement: number;
}

interface ComparisonResult {
    current: TestCategoryResults;
    baseline: any;
    deviation: Record<string, number>;
}

interface TestStatistics {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    categories: Map<string, CategoryStatistics>;
    performance: any;
    passRate: number;
}

interface CategoryStatistics {
    total: number;
    passed: number;
    failed: number;
    averageResult: number;
    metrics: number[];
    variance?: number;
    standardDeviation?: number;
}

interface TrendAnalysis {
    direction: TrendDirection;
    magnitude: number;
    confidence: number;
}

interface AdvancedAnalysis {
    trends: Map<string, TrendAnalysis>;
    correlations: Map<string, number>;
    outliers: OutlierEntry[];
    performance_profile: PerformanceProfile;
}

interface OutlierEntry {
    category: string;
    test: string;
    value: number;
    zScore: number;
    severity: OutlierSeverity;
}

interface PerformanceProfile {
    overall_score: number;
    category_scores: Map<string, number>;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
}

interface ExportData {
    timestamp: number;
    metrics: Record<string, MetricEntry[]>;
    summary: Summary;
}

interface Summary {
    total_metrics: number;
    total_entries: number;
    categories: CategorySummary[];
}

interface CategorySummary {
    name: string;
    count: number;
    average: number;
}

type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';
type TrendDirection = 'improving' | 'degrading' | 'stable';
type OutlierSeverity = 'extreme' | 'moderate';
type ExportFormat = 'json' | 'csv';
export class PerformanceMetricsCollector {
    private performanceTestSuite: PerformanceTestSuite;
    private lastFrameTime: number | null;
    private collectedMetrics: Map<string, MetricEntry[]>;

    constructor(performanceTestSuite: PerformanceTestSuite) {
        this.performanceTestSuite = performanceTestSuite;
        this.lastFrameTime = null;
        this.collectedMetrics = new Map();
    }

    /**
     * パフォーマンスエントリの処理
     */
    processPerformanceEntries(entries: PerformanceEntry[]): void {
        for (const entry of entries) {
            if (entry.entryType === 'measure') {
                console.log(`Performance measure: ${entry.name} - ${entry.duration}ms`);
                
                // メトリクスを収集データに追加
                if (!this.collectedMetrics.has(entry.name)) {
                    this.collectedMetrics.set(entry.name, []);
                }
                this.collectedMetrics.get(entry.name)!.push({
                    duration: entry.duration,
                    timestamp: entry.startTime,
                    detail: (entry as any).detail || {}
                });
            }
        }
    }

    /**
     * メトリクスデータを収集
     */
    collectMetrics(testResults: Map<string, TestCategoryResults>): CollectedMetrics {
        const metrics = {
            timestamp: performance.now(),
            memory: this.getMemoryUsage(),
            frameRate: this.getCurrentFrameRate(),
            testResults: testResults,
            systemInfo: this.getSystemInfo()
        };

        return metrics;
    }

    /**
     * ベースラインとの比較分析
     */
    analyzeResults(testResults: Map<string, TestCategoryResults>): AnalysisResult {
        const analysis = {
            overallPassed: this.isOverallTestsPassed(testResults),
            regressions: this.detectRegressions(testResults),
            improvements: this.detectImprovements(testResults),
            comparison: this.compareWithBaseline(testResults),
            statistics: this.calculateTestStatistics(testResults)
        };

        return analysis;
    }

    /**
     * ベースラインとの比較
     */
    compareWithBaseline(testResults: Map<string, TestCategoryResults>): Map<string, ComparisonResult> {
        const comparison = new Map<string, ComparisonResult>();
        
        for (const [category, results] of Array.from(testResults)) {
            const baseline = this.performanceTestSuite.baselines.get(category);
            if (baseline) {
                comparison.set(category, {
                    current: results,
                    baseline: baseline,
                    deviation: this.calculateDeviation(results, baseline)
                });
            }
        }
        
        return comparison;
    }

    /**
     * 全体テスト結果の判定
     */
    isOverallTestsPassed(testResults: Map<string, TestCategoryResults>): boolean {
        for (const [category, results] of Array.from(testResults)) {
            if (!results.passed) {
                return false;
            }
        }
        return true;
    }

    /**
     * リグレッション検出
     */
    detectRegressions(testResults: Map<string, TestCategoryResults>): RegressionEntry[] {
        const regressions: RegressionEntry[] = [];
        
        for (const [category, results] of Array.from(testResults)) {
            for (const [testName, testResult] of Object.entries(results.tests) as [string, TestResult][]) {
                if (!testResult.passed) {
                    regressions.push({
                        category,
                        test: testName,
                        result: testResult.result,
                        expected: testResult.expected,
                        severity: this.calculateRegressionSeverity(testResult)
                    });
                }
            }
        }
        return regressions;
    }

    /**
     * 改善検出
     */
    detectImprovements(testResults: Map<string, TestCategoryResults>): ImprovementEntry[] {
        const improvements: ImprovementEntry[] = [];
        const previousResults = this.performanceTestSuite.getPreviousTestResults();
        if (previousResults) {
            for (const [category, results] of Array.from(testResults)) {
                const previousCategoryResults = previousResults.results.get(category);
                if (previousCategoryResults) {
                    for (const [testName, testResult] of Object.entries(results.tests) as [string, TestResult][]) {
                        const previousTest = previousCategoryResults.tests[testName];
                        if (previousTest && this.isImprovement(testResult, previousTest)) {
                            improvements.push({
                                category,
                                test: testName,
                                improvement: this.calculateImprovement(testResult, previousTest)
                            });
                        }
                    }
                }
            }
        }
        return improvements;
    }

    /**
     * テスト統計の計算
     */
    calculateTestStatistics(testResults: Map<string, TestCategoryResults>): TestStatistics {
        const stats: TestStatistics = {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            categories: new Map<string, CategoryStatistics>(),
            performance: {},
            passRate: 0
        };
        
        for (const [category, results] of Array.from(testResults)) {
            const categoryStats: CategoryStatistics = {
                total: Object.keys(results.tests).length,
                passed: 0,
                failed: 0,
                averageResult: 0,
                metrics: []
            };
            
            for (const [testName, testResult] of Object.entries(results.tests) as [string, TestResult][]) {
                stats.totalTests++;
                
                if (testResult.passed) {
                    stats.passedTests++;
                    categoryStats.passed++;
                } else {
                    stats.failedTests++;
                    categoryStats.failed++;
                }

                categoryStats.metrics.push(testResult.result);
            }

            // カテゴリ平均の計算
            if (categoryStats.metrics.length > 0) {
                categoryStats.averageResult = categoryStats.metrics.reduce((sum, val) => sum + val, 0) / categoryStats.metrics.length;
                categoryStats.variance = this.calculateVariance(categoryStats.metrics);
                categoryStats.standardDeviation = Math.sqrt(categoryStats.variance);
            }

            stats.categories.set(category, categoryStats);
        }

        // 全体のパス率
        stats.passRate = stats.totalTests > 0 ? (stats.passedTests / stats.totalTests) * 100 : 0;

        return stats;
    }

    // 統計計算メソッド

    /**
     * 分散計算
     */
    calculateVariance(values: number[]): number {
        if (values.length === 0) return 0;
        
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return variance;
    }

    /**
     * パーセンタイル計算
     */
    calculatePercentile(values: number[], percentile: number): number {
        if (values.length === 0) return 0;
        
        const sorted = values.slice().sort((a, b) => a - b);
        const index = Math.ceil(sorted.length * percentile / 100) - 1;
        return sorted[Math.max(0, index)];
    }

    /**
     * ベースラインからの偏差計算
     */
    calculateDeviation(results: TestCategoryResults, baseline: any): Record<string, number> {
        const deviations: Record<string, number> = {};
        for (const [testName, testResult] of Object.entries(results.tests)) {
            if (baseline[testName]) {
                deviations[testName] = (testResult.result - baseline[testName]) / baseline[testName];
            }
        }
        return deviations;
    }

    /**
     * リグレッション重要度計算
     */
    calculateRegressionSeverity(testResult: TestResult): SeverityLevel {
        const deviation = Math.abs(testResult.result - testResult.expected) / testResult.expected;
        if (deviation > 0.5) return 'critical';
        if (deviation > 0.3) return 'high';
        if (deviation > 0.1) return 'medium';
        return 'low';
    }

    /**
     * 改善判定
     */
    isImprovement(current: TestResult, previous: TestResult): boolean {
        return current.result < previous.result; // 小さい値が良い場合
    }

    /**
     * 改善率計算
     */
    calculateImprovement(current: TestResult, previous: TestResult): number {
        return ((previous.result - current.result) / previous.result) * 100;
    }

    // データ収集メソッド

    /**
     * メモリ使用量取得
     */
    getMemoryUsage(): MemoryUsage {
        if ((performance as any).memory) {
            return {
                usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
                totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
                jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
                timestamp: performance.now()
            };
        }
        return {
            usedJSHeapSize: 0,
            totalJSHeapSize: 0,
            jsHeapSizeLimit: 0,
            timestamp: performance.now()
        };
    }

    /**
     * 現在のフレームレート取得
     */
    getCurrentFrameRate(): number {
        const now = performance.now();
        if (this.lastFrameTime) {
            const fps = 1000 / (now - this.lastFrameTime);
            this.lastFrameTime = now;
            return fps;
        }
        this.lastFrameTime = now;
        return 60; // デフォルト値
    }

    /**
     * システム情報取得
     */
    getSystemInfo(): SystemInfo {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
            language: navigator.language,
            onLine: navigator.onLine,
            cookieEnabled: navigator.cookieEnabled,
            timestamp: performance.now()
        };
    }

    /**
     * 収集されたメトリクスの取得
     */
    getCollectedMetrics(): Map<string, MetricEntry[]> {
        return this.collectedMetrics;
    }

    /**
     * メトリクスのクリア
     */
    clearMetrics(): void {
        this.collectedMetrics.clear();
    }

    /**
     * 高度な統計分析
     */
    performAdvancedAnalysis(testResults: Map<string, TestCategoryResults>): AdvancedAnalysis {
        const analysis = {
            trends: this.analyzeTrends(testResults),
            correlations: this.analyzeCorrelations(testResults),
            outliers: this.detectOutliers(testResults),
            performance_profile: this.createPerformanceProfile(testResults)
        };

        return analysis;
    }

    /**
     * トレンド分析
     */
    analyzeTrends(testResults: Map<string, TestCategoryResults>): Map<string, TrendAnalysis> {
        const trends = new Map<string, TrendAnalysis>();
        const previousResults = this.performanceTestSuite.getPreviousTestResults();
        if (previousResults) {
            for (const [category, results] of Array.from(testResults)) {
                const previousCategoryResults = previousResults.results.get(category);
                if (previousCategoryResults) {
                    const trend: TrendAnalysis = {
                        direction: 'stable' as TrendDirection,
                        magnitude: 0,
                        confidence: 0
                    };
                    // 簡単なトレンド分析
                    const currentAvg = this.calculateCategoryAverage(results);
                    const previousAvg = this.calculateCategoryAverage(previousCategoryResults);
                    
                    if (currentAvg !== previousAvg) {
                        const change = (currentAvg - previousAvg) / previousAvg;
                        trend.magnitude = Math.abs(change);
                        trend.direction = change > 0 ? 'degrading' : 'improving';
                        trend.confidence = Math.min(trend.magnitude * 10, 1); // 簡易信頼度
                    }

                    trends.set(category, trend);
                }
            }
        }

        return trends;
    }

    /**
     * 相関分析
     */
    analyzeCorrelations(testResults: Map<string, TestCategoryResults>): Map<string, number> {
        const correlations = new Map<string, number>();
        const categories = Array.from(testResults.keys());
        for (let i = 0; i < categories.length; i++) {
            for (let j = i + 1; j < categories.length; j++) {
                const cat1 = categories[i];
                const cat2 = categories[j];
                
                const results1 = testResults.get(cat1);
                const results2 = testResults.get(cat2);
                
                if (results1 && results2) {
                    const correlation = this.calculateCorrelation(results1, results2);
                    correlations.set(`${cat1}_${cat2}`, correlation);
                }
            }
        }
        return correlations;
    }

    /**
     * 外れ値検出
     */
    detectOutliers(testResults: Map<string, TestCategoryResults>): OutlierEntry[] {
        const outliers: OutlierEntry[] = [];

        for (const [category, results] of Array.from(testResults)) {
            const values = (Object.values(results.tests) as TestResult[]).map(test => test.result);
            const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
            const variance = this.calculateVariance(values);
            const stdDev = Math.sqrt(variance);
            
            for (const [testName, testResult] of Object.entries(results.tests) as [string, TestResult][]) {
                const zScore = Math.abs((testResult.result - mean) / stdDev);
                if (zScore > 2) { // 2σを超える場合を外れ値とする
                    outliers.push({
                        category,
                        test: testName,
                        value: testResult.result,
                        zScore,
                        severity: zScore > 3 ? 'extreme' : 'moderate'
                    });
                }
            }
        }

        return outliers;
    }

    /**
     * パフォーマンスプロファイル作成
     */
    createPerformanceProfile(testResults: Map<string, TestCategoryResults>): PerformanceProfile {
        const profile: PerformanceProfile = {
            overall_score: 0,
            category_scores: new Map<string, number>(),
            strengths: [],
            weaknesses: [],
            recommendations: []
        };
        let totalScore = 0;
        let categoryCount = 0;

        for (const [category, results] of Array.from(testResults)) {
            const passed = (Object.values(results.tests) as TestResult[]).filter(test => test.passed).length;
            const total = (Object.values(results.tests) as TestResult[]).length;
            const score = total > 0 ? (passed / total) * 100 : 0;
            
            profile.category_scores.set(category, score);
            totalScore += score;
            categoryCount++;

            if (score >= 90) {
                profile.strengths.push(category);
            } else if (score < 70) {
                profile.weaknesses.push(category);
            }
        }

        profile.overall_score = categoryCount > 0 ? totalScore / categoryCount : 0;

        return profile;
    }

    // ヘルパーメソッド

    /**
     * カテゴリ平均計算
     */
    calculateCategoryAverage(results: TestCategoryResults): number {
        const values = (Object.values(results.tests) as TestResult[]).map(test => test.result);
        return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
    }

    /**
     * 相関係数計算
     */
    calculateCorrelation(results1: TestCategoryResults, results2: TestCategoryResults): number {
        // 簡易的な相関計算（実際の実装では more sophisticated な手法を使用）
        const values1 = (Object.values(results1.tests) as TestResult[]).map(test => test.result);
        const values2 = (Object.values(results2.tests) as TestResult[]).map(test => test.result);
        if (values1.length !== values2.length || values1.length === 0) {
            return 0;
        }

        const mean1 = values1.reduce((sum, val) => sum + val, 0) / values1.length;
        const mean2 = values2.reduce((sum, val) => sum + val, 0) / values2.length;

        let numerator = 0;
        let denominator1 = 0;
        let denominator2 = 0;

        for (let i = 0; i < values1.length; i++) {
            const diff1 = values1[i] - mean1;
            const diff2 = values2[i] - mean2;
            
            numerator += diff1 * diff2;
            denominator1 += diff1 * diff1;
            denominator2 += diff2 * diff2;
        }

        const denominator = Math.sqrt(denominator1 * denominator2);
        return denominator === 0 ? 0 : numerator / denominator;
    }

    /**
     * データエクスポート
     */
    exportMetrics(format: ExportFormat = 'json'): string | ExportData {
        const data: ExportData = {
            timestamp: Date.now(),
            metrics: Object.fromEntries(this.collectedMetrics),
            summary: this.getSummary()
        };

        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);
            case 'csv':
                return this.convertToCSV(data);
            default:
                return data;
        }
    }

    /**
     * CSV変換
     */
    convertToCSV(data: ExportData): string {
        const rows: string[] = ['timestamp,metric,value,detail'];
        
        for (const [metricName, entries] of Object.entries(data.metrics)) {
            for (const entry of entries) {
                rows.push(`${entry.timestamp},${metricName},${entry.duration},${JSON.stringify(entry.detail)}`);
            }
        }

        return rows.join('\n');
    }

    /**
     * サマリー取得
     */
    getSummary(): Summary {
        const summary: Summary = {
            total_metrics: this.collectedMetrics.size,
            total_entries: 0,
            categories: [] as CategorySummary[]
        };
        
        for (const [metricName, entries] of Array.from(this.collectedMetrics)) {
            summary.total_entries += entries.length;
            summary.categories.push({
                name: metricName,
                count: entries.length,
                average: entries.reduce((sum, entry) => sum + entry.duration, 0) / entries.length
            });
        }

        return summary;
    }
}