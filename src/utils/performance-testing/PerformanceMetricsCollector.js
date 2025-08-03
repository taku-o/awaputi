/**
 * PerformanceMetricsCollector - パフォーマンスメトリクスの収集と分析を担当するコンポーネント
 * データ収集、統計計算、ベースライン比較、分析機能を提供
 */
export class PerformanceMetricsCollector {
    constructor(performanceTestSuite) {
        this.performanceTestSuite = performanceTestSuite;
        this.lastFrameTime = null;
        this.collectedMetrics = new Map();
    }

    /**
     * パフォーマンスエントリの処理
     */
    processPerformanceEntries(entries) {
        for (const entry of entries) {
            if (entry.entryType === 'measure') {
                console.log(`Performance measure: ${entry.name} - ${entry.duration}ms`);
                
                // メトリクスを収集データに追加
                if (!this.collectedMetrics.has(entry.name)) {
                    this.collectedMetrics.set(entry.name, []);
                }
                this.collectedMetrics.get(entry.name).push({
                    duration: entry.duration,
                    timestamp: entry.startTime,
                    detail: entry.detail || {}
                });
            }
        }
    }

    /**
     * メトリクスデータを収集
     */
    collectMetrics(testResults) {
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
    analyzeResults(testResults) {
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
    compareWithBaseline(testResults) {
        const comparison = new Map();
        
        for (const [category, results] of testResults) {
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
    isOverallTestsPassed(testResults) {
        for (const [category, results] of testResults) {
            if (!results.passed) {
                return false;
            }
        }
        return true;
    }

    /**
     * リグレッション検出
     */
    detectRegressions(testResults) {
        const regressions = [];
        
        for (const [category, results] of testResults) {
            for (const [testName, testResult] of Object.entries(results.tests)) {
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
    detectImprovements(testResults) {
        const improvements = [];
        const previousResults = this.performanceTestSuite.getPreviousTestResults();
        
        if (previousResults) {
            for (const [category, results] of testResults) {
                const previousCategoryResults = previousResults.results.get(category);
                if (previousCategoryResults) {
                    for (const [testName, testResult] of Object.entries(results.tests)) {
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
    calculateTestStatistics(testResults) {
        const stats = {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            categories: new Map(),
            performance: {}
        };

        for (const [category, results] of testResults) {
            const categoryStats = {
                total: Object.keys(results.tests).length,
                passed: 0,
                failed: 0,
                averageResult: 0,
                metrics: []
            };

            for (const [testName, testResult] of Object.entries(results.tests)) {
                stats.totalTests++;
                categoryStats.total++;
                
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
    calculateVariance(values) {
        if (values.length === 0) return 0;
        
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return variance;
    }

    /**
     * パーセンタイル計算
     */
    calculatePercentile(values, percentile) {
        if (values.length === 0) return 0;
        
        const sorted = values.slice().sort((a, b) => a - b);
        const index = Math.ceil(sorted.length * percentile / 100) - 1;
        return sorted[Math.max(0, index)];
    }

    /**
     * ベースラインからの偏差計算
     */
    calculateDeviation(results, baseline) {
        const deviations = {};
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
    calculateRegressionSeverity(testResult) {
        const deviation = Math.abs(testResult.result - testResult.expected) / testResult.expected;
        if (deviation > 0.5) return 'critical';
        if (deviation > 0.3) return 'high';
        if (deviation > 0.1) return 'medium';
        return 'low';
    }

    /**
     * 改善判定
     */
    isImprovement(current, previous) {
        return current.result < previous.result; // 小さい値が良い場合
    }

    /**
     * 改善率計算
     */
    calculateImprovement(current, previous) {
        return ((previous.result - current.result) / previous.result) * 100;
    }

    // データ収集メソッド

    /**
     * メモリ使用量取得
     */
    getMemoryUsage() {
        if (performance.memory) {
            return {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
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
    getCurrentFrameRate() {
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
    getSystemInfo() {
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
    getCollectedMetrics() {
        return this.collectedMetrics;
    }

    /**
     * メトリクスのクリア
     */
    clearMetrics() {
        this.collectedMetrics.clear();
    }

    /**
     * 高度な統計分析
     */
    performAdvancedAnalysis(testResults) {
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
    analyzeTrends(testResults) {
        const trends = new Map();
        const previousResults = this.performanceTestSuite.getPreviousTestResults();
        
        if (previousResults) {
            for (const [category, results] of testResults) {
                const previousCategoryResults = previousResults.results.get(category);
                if (previousCategoryResults) {
                    const trend = {
                        direction: 'stable',
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
    analyzeCorrelations(testResults) {
        const correlations = new Map();
        const categories = Array.from(testResults.keys());

        for (let i = 0; i < categories.length; i++) {
            for (let j = i + 1; j < categories.length; j++) {
                const cat1 = categories[i];
                const cat2 = categories[j];
                
                const correlation = this.calculateCorrelation(
                    testResults.get(cat1),
                    testResults.get(cat2)
                );
                
                correlations.set(`${cat1}_${cat2}`, correlation);
            }
        }

        return correlations;
    }

    /**
     * 外れ値検出
     */
    detectOutliers(testResults) {
        const outliers = [];

        for (const [category, results] of testResults) {
            const values = Object.values(results.tests).map(test => test.result);
            const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
            const variance = this.calculateVariance(values);
            const stdDev = Math.sqrt(variance);

            for (const [testName, testResult] of Object.entries(results.tests)) {
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
    createPerformanceProfile(testResults) {
        const profile = {
            overall_score: 0,
            category_scores: new Map(),
            strengths: [],
            weaknesses: [],
            recommendations: []
        };

        let totalScore = 0;
        let categoryCount = 0;

        for (const [category, results] of testResults) {
            const passed = Object.values(results.tests).filter(test => test.passed).length;
            const total = Object.values(results.tests).length;
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
    calculateCategoryAverage(results) {
        const values = Object.values(results.tests).map(test => test.result);
        return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
    }

    /**
     * 相関係数計算
     */
    calculateCorrelation(results1, results2) {
        // 簡易的な相関計算（実際の実装では more sophisticated な手法を使用）
        const values1 = Object.values(results1.tests).map(test => test.result);
        const values2 = Object.values(results2.tests).map(test => test.result);
        
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
    exportMetrics(format = 'json') {
        const data = {
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
    convertToCSV(data) {
        const rows = ['timestamp,metric,value,detail'];
        
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
    getSummary() {
        const summary = {
            total_metrics: this.collectedMetrics.size,
            total_entries: 0,
            categories: []
        };

        for (const [metricName, entries] of this.collectedMetrics) {
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