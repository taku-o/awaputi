import { BaseComponent } from './BaseComponent.js';
import { FailurePatternAnalyzer } from './analysis/FailurePatternAnalyzer.js';
import { CommonIssueDetector } from './analysis/CommonIssueDetector.js';
import { DebugSuggestionEngine } from './analysis/DebugSuggestionEngine.js';
import { FailureHistoryManager } from './analysis/FailureHistoryManager.js';

/**
 * TestFailureAnalyzer - テスト失敗分析システム (Main Controller)
 * 失敗したテストを分析し、原因を特定して解決策を提案する
 */
export class TestFailureAnalyzer extends BaseComponent {
    constructor(testSupportTools) {
        super(null, 'TestFailureAnalyzer');
        this.testSupportTools = testSupportTools;
        this.components = new Map();
        this.initialized = false;
    }

    /**
     * コンポーネントの初期化
     */
    async initialize() {
        if (this.initialized) {
            return;
        }

        try {
            // 分析コンポーネントの初期化
            this.components.set('patternAnalyzer', new FailurePatternAnalyzer(this));
            this.components.set('issueDetector', new CommonIssueDetector(this));
            this.components.set('suggestionEngine', new DebugSuggestionEngine(this));
            this.components.set('historyManager', new FailureHistoryManager(this));

            // 各コンポーネントを初期化
            for (const [name, component] of this.components) {
                if (component.initialize) {
                    await component.initialize();
                }
            }

            this.initialized = true;
        } catch (error) {
            this._handleError('Failed to initialize TestFailureAnalyzer', error);
            throw error;
        }
    }

    /**
     * パターンアナライザーを取得
     */
    getPatternAnalyzer() {
        return this.components.get('patternAnalyzer');
    }

    /**
     * 問題検出器を取得
     */
    getIssueDetector() {
        return this.components.get('issueDetector');
    }

    /**
     * 提案エンジンを取得
     */
    getSuggestionEngine() {
        return this.components.get('suggestionEngine');
    }

    /**
     * 履歴マネージャーを取得
     */
    getHistoryManager() {
        return this.components.get('historyManager');
    }

    /**
     * エラーメッセージからパターンを識別（メインコントローラー統制）
     * @param {string} error - エラーメッセージ
     * @returns {Object} 識別されたパターン情報
     */
    identifyPattern(error) {
        if (!this.initialized) {
            throw new Error('TestFailureAnalyzer not initialized');
        }

        const patternAnalyzer = this.getPatternAnalyzer();
        return patternAnalyzer ? patternAnalyzer.identifyPattern(error) : null;
    }

    /**
     * パターンとテスト情報から共通問題を検出（メインコントローラー統制）
     * @param {Object} pattern - 識別されたパターン
     * @param {Object} test - テスト情報
     * @returns {Object|null} 検出された共通問題
     */
    findCommonIssue(pattern, test) {
        if (!this.initialized) {
            throw new Error('TestFailureAnalyzer not initialized');
        }

        const issueDetector = this.getIssueDetector();
        return issueDetector ? issueDetector.findCommonIssue(pattern, test) : null;
    }

    /**
     * パターンとテストに基づいて提案を生成（メインコントローラー統制）
     * @param {Object} pattern - 識別されたパターン
     * @param {Object} test - テスト情報
     * @returns {Array} 提案の配列
     */
    generateSuggestions(pattern, test) {
        if (!this.initialized) {
            throw new Error('TestFailureAnalyzer not initialized');
        }

        const suggestionEngine = this.getSuggestionEngine();
        return suggestionEngine ? suggestionEngine.generateSuggestions(pattern, test) : [];
    }

    /**
     * 失敗分析結果を履歴に追加（メインコントローラー統制）
     * @param {Array} analyses - 分析結果の配列
     */
    addToFailureHistory(analyses) {
        if (!this.initialized) {
            throw new Error('TestFailureAnalyzer not initialized');
        }

        const historyManager = this.getHistoryManager();
        if (historyManager) {
            historyManager.addToFailureHistory(analyses);
        }
    }

    /**
     * 特定のテストに関連する過去の失敗を検索（メインコントローラー統制）
     * @param {Object} test - テスト情報
     * @returns {Array} 関連する失敗履歴
     */
    findRelatedFailures(test) {
        if (!this.initialized) {
            throw new Error('TestFailureAnalyzer not initialized');
        }

        const historyManager = this.getHistoryManager();
        return historyManager ? historyManager.findRelatedFailures(test) : [];
    }

    /**
     * 失敗頻度を分析（メインコントローラー統制）
     * @param {string} testName - テスト名
     * @returns {Object} 頻度分析結果
     */
    analyzeFailureFrequency(testName) {
        if (!this.initialized) {
            throw new Error('TestFailureAnalyzer not initialized');
        }

        const historyManager = this.getHistoryManager();
        return historyManager ? historyManager.analyzeFailureFrequency(testName) : 
            { frequency: 0, trend: 'stable', recentFailures: 0 };
    }

    /**
     * 失敗したテストを分析し、包括的なレポートを生成
     * @param {Array} failedTests - 失敗したテストの配列
     * @returns {Object} 分析レポート
     */
    async analyzeTestFailures(failedTests) {
        if (!this.initialized) {
            await this.initialize();
        }

        if (!Array.isArray(failedTests) || failedTests.length === 0) {
            return {
                totalFailures: 0,
                analyses: [],
                summary: {
                    patterns: {},
                    commonIssues: [],
                    recommendations: []
                }
            };
        }

        const analyses = [];
        const patterns = {};
        const commonIssues = [];
        const recommendations = new Set();

        for (const test of failedTests) {
            try {
                const analysis = await this.analyzeFailure(test);
                if (analysis) {
                    analyses.push(analysis);
                    
                    // パターン統計
                    if (analysis.pattern) {
                        const patternId = analysis.pattern.id;
                        patterns[patternId] = (patterns[patternId] || 0) + 1;
                    }
                    
                    // 共通問題の収集
                    if (analysis.commonIssue) {
                        commonIssues.push(analysis.commonIssue);
                    }
                    
                    // 推奨事項の収集
                    if (analysis.suggestions) {
                        analysis.suggestions.forEach(s => recommendations.add(s.action));
                    }
                }
            } catch (error) {
                this._handleError(`Failed to analyze test: ${test.name}`, error);
            }
        }

        // 履歴に追加
        this.addToFailureHistory(analyses);

        return {
            totalFailures: failedTests.length,
            analyses,
            summary: {
                patterns,
                commonIssues,
                recommendations: Array.from(recommendations)
            }
        };
    }

    /**
     * 個別の失敗テストを分析
     * @param {Object} test - テスト情報
     * @returns {Object} 分析結果
     */
    async analyzeFailure(test) {
        if (!this.initialized) {
            await this.initialize();
        }

        if (!test || !test.error) {
            return null;
        }

        try {
            // パターン識別
            const pattern = this.identifyPattern(test.error);
            
            // 共通問題の検出
            const commonIssue = this.findCommonIssue(pattern, test);
            
            // デバッグ提案の生成
            const suggestions = this.generateSuggestions(pattern, test);
            
            // 履歴ベースの提案
            const historicalSuggestions = this.generateHistoricalSuggestions(test);
            
            // 解決可能性の評価
            const recoverability = this.assessRecoverability(pattern, commonIssue);
            
            // コンポーネント名の抽出（issueDetectorから取得）
            const issueDetector = this.getIssueDetector();
            const component = issueDetector ? issueDetector.extractComponentName(test) : null;

            return {
                test: {
                    name: test.name,
                    error: test.error,
                    stackTrace: test.stackTrace || null
                },
                pattern,
                commonIssue,
                component,
                suggestions: [...suggestions, ...historicalSuggestions],
                recoverability,
                timestamp: Date.now()
            };
        } catch (error) {
            this._handleError(`Failed to analyze failure for test: ${test.name}`, error);
            return null;
        }
    }

    /**
     * 履歴に基づく提案を生成（メインコントローラー統制）
     * @param {Object} test - テスト情報
     * @returns {Array} 履歴ベースの提案
     */
    generateHistoricalSuggestions(test) {
        if (!this.initialized) {
            throw new Error('TestFailureAnalyzer not initialized');
        }

        const historyManager = this.getHistoryManager();
        return historyManager ? historyManager.generateHistoricalSuggestions(test) : [];
    }

    /**
     * 解決可能性を評価
     * @param {Object} pattern - パターン情報
     * @param {Object} commonIssue - 共通問題情報
     * @returns {number} 解決可能性スコア（0-1）
     */
    assessRecoverability(pattern, commonIssue) {
        if (!this.initialized) {
            return 0.5;
        }

        const issueDetector = this.getIssueDetector();
        if (issueDetector && commonIssue) {
            return issueDetector.assessResolvability(commonIssue);
        }

        // フォールバック計算
        let score = 0.5; // 基本スコア

        if (pattern) {
            if (pattern.category === 'assertion') {
                score += 0.3;
            } else if (pattern.category === 'runtime_error') {
                score += 0.1;
            } else if (pattern.category === 'memory') {
                score -= 0.2;
            }
        }

        return Math.max(0, Math.min(1, score));
    }

    /**
     * 失敗履歴の統計情報を取得（メインコントローラー統制）
     * @returns {Object} 統計情報
     */
    getHistoryStatistics() {
        if (!this.initialized) {
            return {
                totalFailures: 0,
                uniqueTests: 0,
                patternBreakdown: {},
                componentBreakdown: {},
                severityBreakdown: {},
                timeRange: null
            };
        }

        const historyManager = this.getHistoryManager();
        return historyManager ? historyManager.getHistoryStatistics() : {
            totalFailures: 0,
            uniqueTests: 0,
            patternBreakdown: {},
            componentBreakdown: {},
            severityBreakdown: {},
            timeRange: null
        };
    }

    /**
     * 失敗トレンドを分析（メインコントローラー統制）
     * @param {number} days - 分析期間（日数）
     * @returns {Object} トレンド分析結果
     */
    analyzeFailureTrend(days = 30) {
        if (!this.initialized) {
            return {
                trend: 'no_data',
                totalFailures: 0,
                dailyAverage: 0,
                mostCommonPattern: null,
                mostProblematicTest: null
            };
        }

        const historyManager = this.getHistoryManager();
        return historyManager ? historyManager.analyzeFailureTrend(days) : {
            trend: 'no_data',
            totalFailures: 0,
            dailyAverage: 0,
            mostCommonPattern: null,
            mostProblematicTest: null
        };
    }

    /**
     * 履歴をクリア（メインコントローラー統制）
     */
    clearHistory() {
        if (!this.initialized) {
            return;
        }

        const historyManager = this.getHistoryManager();
        if (historyManager) {
            historyManager.clearHistory();
        }
    }

    /**
     * 履歴をエクスポート（メインコントローラー統制）
     * @returns {string} JSON形式の履歴データ
     */
    exportHistory() {
        if (!this.initialized) {
            return JSON.stringify({ version: '1.0', history: [] }, null, 2);
        }

        const historyManager = this.getHistoryManager();
        return historyManager ? historyManager.exportHistory() : 
            JSON.stringify({ version: '1.0', history: [] }, null, 2);
    }

    /**
     * 履歴をインポート（メインコントローラー統制）
     * @param {string} jsonData - JSON形式の履歴データ
     * @returns {boolean} インポート成功フラグ
     */
    importHistory(jsonData) {
        if (!this.initialized) {
            return false;
        }

        const historyManager = this.getHistoryManager();
        return historyManager ? historyManager.importHistory(jsonData) : false;
    }

    /**
     * 失敗履歴を取得（メインコントローラー統制）
     * @param {number} limit - 取得件数制限
     * @returns {Array} 失敗履歴
     */
    getFailureHistory(limit = null) {
        if (!this.initialized) {
            return [];
        }

        const historyManager = this.getHistoryManager();
        return historyManager ? historyManager.getFailureHistory(limit) : [];
    }

    /**
     * 旧来のAPIとの互換性のため
     * @param {Object} testResults - テスト結果
     * @returns {Object} 分析レポート
     */
    async analyzeFailures(testResults) {
        if (!testResults || !testResults.results) {
            return { analyses: [], summary: null };
        }

        const failedTests = testResults.results.filter(test => test.failed && test.error);
        if (failedTests.length === 0) {
            return { analyses: [], summary: this.createSuccessSummary(testResults) };
        }

        const result = await this.analyzeTestFailures(failedTests);
        return {
            analyses: result.analyses,
            summary: this.createFailureSummary(result.analyses, testResults)
        };
    }

    /**
     * 成功サマリーを作成
     * @param {Object} testResults - テスト結果
     * @returns {Object} 成功サマリー
     */
    createSuccessSummary(testResults) {
        return {
            message: 'All tests passed successfully!',
            totalTests: testResults.results.passed,
            executionTime: testResults.results.executionTime,
            performance: {
                avgTestTime: testResults.results.executionTime / testResults.results.passed,
                status: testResults.results.executionTime < 10000 ? 'excellent' : 
                       testResults.results.executionTime < 30000 ? 'good' : 'needs_improvement'
            },
            recommendations: testResults.results.executionTime > 30000 ? [
                {
                    type: 'performance',
                    priority: 'medium',
                    message: 'Consider optimizing test execution time',
                    action: 'Review slow tests and implement performance improvements'
                }
            ] : []
        };
    }

    /**
     * 失敗サマリーを作成
     * @param {Array} analyses - 分析結果
     * @param {Object} testResults - テスト結果
     * @returns {Object} 失敗サマリー
     */
    createFailureSummary(analyses, testResults) {
        return {
            totalFailures: analyses.length,
            patterns: this.summarizePatterns(analyses),
            components: this.summarizeComponents(analyses),
            severity: this.assessOverallSeverity(analyses),
            recoverability: this.assessOverallRecoverability(analyses),
            recommendations: this.generateOverallRecommendations(analyses),
            trend: this.analyzeFailureTrend(),
            impactAssessment: this.assessImpact(analyses, testResults)
        };
    }

    /**
     * パターンをサマライズ
     * @param {Array} analyses - 分析結果
     * @returns {Array} パターンサマリー
     */
    summarizePatterns(analyses) {
        const patternCounts = new Map();
        
        analyses.forEach(analysis => {
            if (analysis.pattern) {
                const key = analysis.pattern.id;
                patternCounts.set(key, (patternCounts.get(key) || 0) + 1);
            }
        });

        const patternAnalyzer = this.getPatternAnalyzer();
        if (!patternAnalyzer) {
            return [];
        }

        return Array.from(patternCounts.entries())
            .map(([patternId, count]) => ({
                pattern: patternAnalyzer.getPattern(patternId),
                count: count,
                percentage: (count / analyses.length) * 100
            }))
            .sort((a, b) => b.count - a.count);
    }

    /**
     * コンポーネントをサマライズ
     * @param {Array} analyses - 分析結果
     * @returns {Array} コンポーネントサマリー
     */
    summarizeComponents(analyses) {
        const componentCounts = new Map();
        
        analyses.forEach(analysis => {
            const component = analysis.component || 'General';
            componentCounts.set(component, (componentCounts.get(component) || 0) + 1);
        });

        return Array.from(componentCounts.entries())
            .map(([component, count]) => ({
                component: component,
                count: count,
                percentage: (count / analyses.length) * 100
            }))
            .sort((a, b) => b.count - a.count);
    }

    /**
     * 全体的な重要度を評価
     * @param {Array} analyses - 分析結果
     * @returns {Object} 重要度評価
     */
    assessOverallSeverity(analyses) {
        const severityCounts = { high: 0, medium: 0, low: 0 };
        
        analyses.forEach(analysis => {
            const severity = analysis.pattern?.severity || 'medium';
            severityCounts[severity]++;
        });

        if (severityCounts.high > 0) {
            return { level: 'high', description: `${severityCounts.high} critical issues require immediate attention` };
        } else if (severityCounts.medium > analyses.length * 0.5) {
            return { level: 'medium', description: 'Multiple medium-severity issues detected' };
        } else {
            return { level: 'low', description: 'Most issues are low-severity and manageable' };
        }
    }

    /**
     * 全体的な回復可能性を評価
     * @param {Array} analyses - 分析結果
     * @returns {Object} 回復可能性評価
     */
    assessOverallRecoverability(analyses) {
        const avgScore = analyses.reduce((sum, analysis) => 
            sum + (analysis.recoverability || 0.5), 0) / analyses.length;

        return {
            averageScore: avgScore,
            level: avgScore > 0.7 ? 'high' : avgScore > 0.4 ? 'medium' : 'low',
            estimatedTime: this.estimateRecoveryTime(avgScore * 100),
            breakdown: {
                high: analyses.filter(a => (a.recoverability || 0.5) > 0.7).length,
                medium: analyses.filter(a => {
                    const score = a.recoverability || 0.5;
                    return score >= 0.4 && score <= 0.7;
                }).length,
                low: analyses.filter(a => (a.recoverability || 0.5) < 0.4).length
            }
        };
    }

    /**
     * 回復時間を推定
     * @param {number} recoverabilityScore - 回復可能性スコア
     * @returns {string} 推定回復時間
     */
    estimateRecoveryTime(recoverabilityScore) {
        if (recoverabilityScore > 70) return '< 30 minutes';
        if (recoverabilityScore > 40) return '30 minutes - 2 hours';
        return '2+ hours';
    }

    /**
     * 全体的な推奨事項を生成
     * @param {Array} analyses - 分析結果
     * @returns {Array} 推奨事項
     */
    generateOverallRecommendations(analyses) {
        const recommendations = [];
        
        // パターンベースの推奨事項
        const topPatterns = this.summarizePatterns(analyses).slice(0, 3);
        topPatterns.forEach(({ pattern, count }) => {
            if (count > 1 && pattern) {
                recommendations.push({
                    type: 'pattern',
                    priority: pattern.severity === 'high' ? 'high' : 'medium',
                    message: `Address ${count} ${pattern.name} issues - focus on common root causes`,
                    action: `Review and fix ${pattern.name.toLowerCase()} patterns across the codebase`
                });
            }
        });

        // コンポーネントベースの推奨事項
        const topComponents = this.summarizeComponents(analyses).slice(0, 2);
        topComponents.forEach(({ component, count }) => {
            if (count > 2) {
                recommendations.push({
                    type: 'component',
                    priority: 'medium',
                    message: `${component} has ${count} failing tests - may need refactoring`,
                    action: `Review ${component} implementation and test coverage`
                });
            }
        });

        return recommendations.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    /**
     * 影響を評価
     * @param {Array} analyses - 分析結果
     * @param {Object} testResults - テスト結果
     * @returns {Object} 影響評価
     */
    assessImpact(analyses, testResults) {
        const totalTests = testResults.results.passed + testResults.results.failed;
        const failureRate = analyses.length / totalTests;

        const criticalFailures = analyses.filter(a => 
            a.pattern?.severity === 'high'
        ).length;

        const blockedComponents = new Set(
            analyses.map(a => a.component || 'General')
        ).size;

        return {
            failureRate: failureRate,
            criticalFailures: criticalFailures,
            blockedComponents: blockedComponents,
            impact: failureRate > 0.3 ? 'high' : 
                   failureRate > 0.1 ? 'medium' : 'low',
            description: this.generateImpactDescription(failureRate, criticalFailures, blockedComponents)
        };
    }

    /**
     * 影響の説明を生成
     * @param {number} failureRate - 失敗率
     * @param {number} criticalFailures - 重要な失敗数
     * @param {number} blockedComponents - ブロックされたコンポーネント数
     * @returns {string} 影響の説明
     */
    generateImpactDescription(failureRate, criticalFailures, blockedComponents) {
        if (failureRate > 0.3) {
            return `High impact: ${(failureRate * 100).toFixed(1)}% failure rate affects ${blockedComponents} components`;
        } else if (criticalFailures > 0) {
            return `Medium impact: ${criticalFailures} critical failures require immediate attention`;
        } else {
            return `Low impact: Isolated failures with limited system impact`;
        }
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        try {
            // 各コンポーネントのクリーンアップ
            for (const [name, component] of this.components) {
                if (component.cleanup) {
                    component.cleanup();
                }
            }
            
            this.components.clear();
            this.initialized = false;
            super.cleanup();
        } catch (error) {
            this._handleError('Error during cleanup', error);
        }
    }
}

// グローバルアクセス用（デバッグ目的）
if (typeof window !== 'undefined') {
    window.TestFailureAnalyzer = TestFailureAnalyzer;
}