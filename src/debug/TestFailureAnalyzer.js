/**
 * Test Failure Analyzer
 * テスト失敗の詳細分析とデバッグ支援システム
 */

export class TestFailureAnalyzer {
    constructor(testSupportTools) {
        this.testSupportTools = testSupportTools;
        this.failurePatterns = new Map();
        this.commonIssues = new Map();
        this.debugSuggestions = new Map();
        this.failureHistory = [];
        
        this.initialize();
    }

    initialize() {
        this.setupFailurePatterns();
        this.setupCommonIssues();
        this.setupDebugSuggestions();
        this.loadFailureHistory();
    }

    setupFailurePatterns() {
        // よくある失敗パターンの定義
        this.failurePatterns.set('null_reference', {
            name: 'Null Reference Error',
            keywords: ['null', 'undefined', 'cannot read property', 'is not defined'],
            category: 'runtime_error',
            severity: 'high',
            description: 'オブジェクトまたはプロパティがnullまたはundefinedです'
        });

        this.failurePatterns.set('type_error', {
            name: 'Type Error',
            keywords: ['is not a function', 'is not a constructor', 'type error'],
            category: 'type_error',
            severity: 'high',
            description: '型の不一致またはメソッドの呼び出しエラーです'
        });

        this.failurePatterns.set('assertion_failure', {
            name: 'Assertion Failure',
            keywords: ['expected', 'to equal', 'to be', 'assertion failed'],
            category: 'assertion',
            severity: 'medium',
            description: 'テストの期待値と実際の値が一致しません'
        });

        this.failurePatterns.set('timeout_error', {
            name: 'Timeout Error',
            keywords: ['timeout', 'exceeded', 'timed out'],
            category: 'performance',
            severity: 'medium',
            description: 'テストの実行時間が制限を超えました'
        });

        this.failurePatterns.set('async_error', {
            name: 'Async Operation Error',
            keywords: ['promise', 'async', 'await', 'callback'],
            category: 'async',
            severity: 'medium',
            description: '非同期処理に関連するエラーです'
        });

        this.failurePatterns.set('memory_error', {
            name: 'Memory Error',
            keywords: ['out of memory', 'heap', 'stack overflow'],
            category: 'memory',
            severity: 'high',
            description: 'メモリ関連のエラーです'
        });

        this.failurePatterns.set('network_error', {
            name: 'Network Error',
            keywords: ['network', 'fetch', 'xhr', 'cors', 'connection'],
            category: 'network',
            severity: 'medium',
            description: 'ネットワーク通信に関連するエラーです'
        });

        this.failurePatterns.set('configuration_error', {
            name: 'Configuration Error',
            keywords: ['config', 'configuration', 'settings', 'invalid parameter'],
            category: 'configuration',
            severity: 'medium',
            description: '設定またはパラメータに関連するエラーです'
        });
    }

    setupCommonIssues() {
        // よくある問題とその解決策
        this.commonIssues.set('bubble_manager_null', {
            pattern: 'null_reference',
            component: 'BubbleManager',
            issue: 'BubbleManager instance is null or undefined',
            solutions: [
                'GameEngineでBubbleManagerが正しく初期化されているか確認',
                'シーン遷移時のBubbleManagerの状態を確認',
                'テストでモックBubbleManagerを使用する'
            ],
            debugSteps: [
                'console.log(gameEngine.bubbleManager)でインスタンスを確認',
                'GameEngine.initializeメソッドが実行されているか確認',
                'シーンが正しく設定されているか確認'
            ]
        });

        this.commonIssues.set('score_calculation_mismatch', {
            pattern: 'assertion_failure',
            component: 'ScoreManager',
            issue: 'Score calculation does not match expected value',
            solutions: [
                'GameBalance.jsの設定値を確認',
                'コンボ計算のロジックを確認',
                'テストの期待値を最新の仕様に更新'
            ],
            debugSteps: [
                'ScoreManager.calculateScore()の戻り値を確認',
                'バブルタイプごとのベーススコアを確認',
                '現在のコンボ値を確認'
            ]
        });

        this.commonIssues.set('canvas_context_error', {
            pattern: 'null_reference',
            component: 'Rendering',
            issue: 'Canvas context is null',
            solutions: [
                'テスト環境でCanvas APIが利用可能か確認',
                'OffscreenCanvasまたはモックCanvasを使用',
                'headlessブラウザでのCanvas対応を確認'
            ],
            debugSteps: [
                'document.createElement(\"canvas\")でCanvas作成を確認',
                'getContext(\"2d\")が成功するか確認',
                'HTMLCanvasElementの機能が利用可能か確認'
            ]
        });

        this.commonIssues.set('async_timing_issue', {
            pattern: 'async_error',
            component: 'General',
            issue: 'Async operations timing issues',
            solutions: [
                'awaitを使用して非同期処理の完了を待つ',
                'テストタイムアウト値を調整',
                'Promise.allで並行処理を同期'
            ],
            debugSteps: [
                '非同期処理の完了タイミングを確認',
                'Promiseチェーンが正しく構築されているか確認',
                'エラーハンドリングが適切に設定されているか確認'
            ]
        });

        this.commonIssues.set('performance_degradation', {
            pattern: 'timeout_error',
            component: 'Performance',
            issue: 'Test execution is too slow',
            solutions: [
                'オブジェクトプールを使用してGC負荷を軽減',
                '重い処理をモック化',
                'テストデータサイズを調整'
            ],
            debugSteps: [
                'Performance APIで実行時間を測定',
                'メモリ使用量の推移を確認',
                'CPUプロファイラーで重い処理を特定'
            ]
        });
    }

    setupDebugSuggestions() {
        // デバッグ提案システム
        this.debugSuggestions.set('null_reference', [
            {
                action: 'Add null checks',
                code: 'if (object && object.property) { /* use object.property */ }',
                description: 'オブジェクトとプロパティの存在確認を追加'
            },
            {
                action: 'Use optional chaining',
                code: 'object?.property?.method?.()',
                description: 'オプショナルチェーニングで安全にアクセス'
            },
            {
                action: 'Initialize with default',
                code: 'const value = object.property || defaultValue',
                description: 'デフォルト値を使用してフォールバック'
            }
        ]);

        this.debugSuggestions.set('assertion_failure', [
            {
                action: 'Add debug logging',
                code: 'console.log("Expected:", expected, "Actual:", actual)',
                description: '期待値と実際の値をログ出力して比較'
            },
            {
                action: 'Use deep equality',
                code: 'expect(result).toEqual(expected) // not toBe',
                description: 'オブジェクトの比較にはtoEqualを使用'
            },
            {
                action: 'Check data types',
                code: 'console.log(typeof actual, typeof expected)',
                description: 'データ型の違いを確認'
            }
        ]);

        this.debugSuggestions.set('async_error', [
            {
                action: 'Add await',
                code: 'const result = await asyncFunction()',
                description: '非同期関数の完了を待つ'
            },
            {
                action: 'Handle promise rejection',
                code: 'try { await asyncFunc() } catch (error) { /* handle */ }',
                description: 'Promise拒否のエラーハンドリングを追加'
            },
            {
                action: 'Use Promise.allSettled',
                code: 'const results = await Promise.allSettled(promises)',
                description: '並行処理の完了を確実に待つ'
            }
        ]);
    }

    loadFailureHistory() {
        try {
            const stored = localStorage.getItem('testFailureHistory');
            if (stored) {
                this.failureHistory = JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Failed to load failure history:', error);
            this.failureHistory = [];
        }
    }

    saveFailureHistory() {
        try {
            localStorage.setItem('testFailureHistory', JSON.stringify(this.failureHistory.slice(-100)));
        } catch (error) {
            console.warn('Failed to save failure history:', error);
        }
    }

    // メイン分析メソッド
    analyzeFailures(testResults) {
        if (!testResults || !testResults.results) {
            return { analyses: [], summary: null };
        }

        const failedTests = testResults.results.filter(test => test.failed && test.error);
        if (failedTests.length === 0) {
            return { analyses: [], summary: this.createSuccessSummary(testResults) };
        }

        const analyses = failedTests.map(test => this.analyzeIndividualFailure(test));
        const summary = this.createFailureSummary(analyses, testResults);
        
        // 失敗履歴に追加
        this.addToFailureHistory(analyses);

        return { analyses, summary };
    }

    analyzeIndividualFailure(test) {
        const analysis = {
            testName: test.name,
            category: test.category,
            error: test.error,
            timestamp: Date.now(),
            pattern: this.identifyPattern(test.error),
            commonIssue: null,
            suggestions: [],
            debugSteps: [],
            similarity: 0,
            relatedFailures: []
        };

        // パターンマッチングによる分析
        if (analysis.pattern) {
            analysis.commonIssue = this.findCommonIssue(analysis.pattern, test);
            analysis.suggestions = this.generateSuggestions(analysis.pattern, test);
            analysis.debugSteps = this.generateDebugSteps(analysis.pattern, test);
        }

        // 類似失敗の検索
        analysis.relatedFailures = this.findRelatedFailures(test);
        analysis.similarity = this.calculateSimilarityScore(test, analysis.relatedFailures);

        // 失敗頻度の分析
        analysis.frequency = this.analyzeFailureFrequency(test.name);

        // 回復可能性の評価
        analysis.recoverability = this.assessRecoverability(analysis);

        return analysis;
    }

    identifyPattern(error) {
        if (!error || !error.message) return null;

        const message = error.message.toLowerCase();
        const stack = error.stack ? error.stack.toLowerCase() : '';
        const searchText = message + ' ' + stack;

        for (const [patternId, pattern] of this.failurePatterns) {
            if (pattern.keywords.some(keyword => searchText.includes(keyword.toLowerCase()))) {
                return {
                    id: patternId,
                    ...pattern,
                    confidence: this.calculatePatternConfidence(searchText, pattern.keywords)
                };
            }
        }

        return null;
    }

    calculatePatternConfidence(text, keywords) {
        const matches = keywords.filter(keyword => text.includes(keyword.toLowerCase()));
        return matches.length / keywords.length;
    }

    findCommonIssue(pattern, test) {
        const componentName = this.extractComponentName(test);
        
        for (const [issueId, issue] of this.commonIssues) {
            if (issue.pattern === pattern.id && 
                (issue.component === 'General' || issue.component === componentName)) {
                return {
                    id: issueId,
                    ...issue,
                    relevance: issue.component === componentName ? 1.0 : 0.7
                };
            }
        }

        return null;
    }

    extractComponentName(test) {
        const name = test.name.toLowerCase();
        if (name.includes('bubble')) return 'BubbleManager';
        if (name.includes('score')) return 'ScoreManager';
        if (name.includes('input')) return 'InputManager';
        if (name.includes('audio')) return 'AudioManager';
        if (name.includes('render')) return 'Rendering';
        if (name.includes('scene')) return 'SceneManager';
        return 'General';
    }

    generateSuggestions(pattern, test) {
        const suggestions = [];
        
        // パターンベースの提案
        const patternSuggestions = this.debugSuggestions.get(pattern.id) || [];
        suggestions.push(...patternSuggestions);

        // テスト固有の提案
        const testSpecificSuggestions = this.generateTestSpecificSuggestions(test);
        suggestions.push(...testSpecificSuggestions);

        // 履歴ベースの提案
        const historicalSuggestions = this.generateHistoricalSuggestions(test);
        suggestions.push(...historicalSuggestions);

        return suggestions.slice(0, 5); // 最大5つの提案
    }

    generateTestSpecificSuggestions(test) {
        const suggestions = [];
        const testName = test.name.toLowerCase();
        const errorMessage = test.error?.message?.toLowerCase() || '';

        if (testName.includes('performance')) {
            suggestions.push({
                action: 'Increase timeout',
                code: 'jest.setTimeout(30000)',
                description: 'パフォーマンステストのタイムアウトを延長'
            });
        }

        if (testName.includes('integration')) {
            suggestions.push({
                action: 'Add setup delay',
                code: 'await new Promise(resolve => setTimeout(resolve, 100))',
                description: 'コンポーネント初期化の時間を確保'
            });
        }

        if (errorMessage.includes('canvas')) {
            suggestions.push({
                action: 'Mock Canvas API',
                code: 'jest.mock("canvas", () => ({ createCanvas: jest.fn() }))',
                description: 'Canvas APIをモック化してテスト環境に対応'
            });
        }

        return suggestions;
    }

    generateHistoricalSuggestions(test) {
        const suggestions = [];
        const similarFailures = this.findRelatedFailures(test);
        
        if (similarFailures.length > 0) {
            const mostRecent = similarFailures[0];
            if (mostRecent.resolution) {
                suggestions.push({
                    action: 'Apply previous solution',
                    code: mostRecent.resolution.code || '',
                    description: `前回の解決策: ${mostRecent.resolution.description}`
                });
            }
        }

        return suggestions;
    }

    generateDebugSteps(pattern, test) {
        const steps = [];
        
        // パターン固有のデバッグステップ
        const commonIssue = this.findCommonIssue(pattern, test);
        if (commonIssue && commonIssue.debugSteps) {
            steps.push(...commonIssue.debugSteps);
        }

        // 一般的なデバッグステップ
        steps.push(
            `テスト "${test.name}" の実行環境を確認`,
            'エラーメッセージの詳細なスタックトレースを確認',
            '関連するコンポーネントの初期化状態を確認'
        );

        // エラー固有のステップ
        if (test.error?.stack) {
            steps.push('スタックトレースから失敗箇所を特定');
        }

        if (test.executionTime > 5000) {
            steps.push('実行時間が長い原因を特定（パフォーマンス問題の可能性）');
        }

        return steps.slice(0, 8); // 最大8ステップ
    }

    findRelatedFailures(test) {
        return this.failureHistory
            .filter(failure => {
                // 同じテスト名
                if (failure.testName === test.name) return true;
                
                // 同じエラーパターン
                if (failure.error?.message === test.error?.message) return true;
                
                // 同じカテゴリ
                if (failure.category === test.category) return true;
                
                return false;
            })
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5);
    }

    calculateSimilarityScore(test, relatedFailures) {
        if (relatedFailures.length === 0) return 0;

        const scores = relatedFailures.map(failure => {
            let score = 0;
            
            // テスト名の一致
            if (failure.testName === test.name) score += 0.4;
            
            // エラーメッセージの類似度
            if (failure.error?.message === test.error?.message) score += 0.3;
            
            // カテゴリの一致
            if (failure.category === test.category) score += 0.2;
            
            // 時間的近さ（最近のものほど関連性が高い）
            const timeDiff = Date.now() - failure.timestamp;
            const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
            if (daysDiff < 1) score += 0.1;
            
            return score;
        });

        return Math.max(...scores);
    }

    analyzeFailureFrequency(testName) {
        const sameTestFailures = this.failureHistory.filter(f => f.testName === testName);
        const recentFailures = sameTestFailures.filter(f => 
            Date.now() - f.timestamp < 7 * 24 * 60 * 60 * 1000 // 7日以内
        );

        return {
            total: sameTestFailures.length,
            recent: recentFailures.length,
            firstFailure: sameTestFailures.length > 0 ? 
                Math.min(...sameTestFailures.map(f => f.timestamp)) : null,
            lastFailure: sameTestFailures.length > 0 ? 
                Math.max(...sameTestFailures.map(f => f.timestamp)) : null,
            frequency: recentFailures.length > 5 ? 'high' : 
                      recentFailures.length > 2 ? 'medium' : 'low'
        };
    }

    assessRecoverability(analysis) {
        let score = 50; // ベーススコア

        // パターンベースの評価
        if (analysis.pattern) {
            switch (analysis.pattern.category) {
                case 'assertion':
                    score += 30; // アサーション失敗は修正しやすい
                    break;
                case 'configuration':
                    score += 25; // 設定問題は修正しやすい
                    break;
                case 'type_error':
                    score += 15; // 型エラーは中程度
                    break;
                case 'memory':
                    score -= 20; // メモリ問題は複雑
                    break;
                case 'async':
                    score -= 10; // 非同期問題は複雑
                    break;
            }
        }

        // 頻度ベースの評価
        if (analysis.frequency) {
            switch (analysis.frequency.frequency) {
                case 'low':
                    score += 10; // 稀な失敗は修正しやすい
                    break;
                case 'high':
                    score -= 15; // 頻繁な失敗は根深い問題
                    break;
            }
        }

        // 類似性ベースの評価
        if (analysis.similarity > 0.7) {
            score += 20; // 類似の解決例がある
        }

        // 提案の質ベースの評価
        if (analysis.suggestions.length > 3) {
            score += 10; // 多くの提案がある
        }

        return {
            score: Math.max(0, Math.min(100, score)),
            level: score > 70 ? 'high' : score > 40 ? 'medium' : 'low',
            timeEstimate: this.estimateRecoveryTime(score)
        };
    }

    estimateRecoveryTime(recoverabilityScore) {
        if (recoverabilityScore > 70) return '< 30 minutes';
        if (recoverabilityScore > 40) return '30 minutes - 2 hours';
        return '2+ hours';
    }

    createFailureSummary(analyses, testResults) {
        const summary = {
            totalFailures: analyses.length,
            patterns: this.summarizePatterns(analyses),
            components: this.summarizeComponents(analyses),
            severity: this.assessOverallSeverity(analyses),
            recoverability: this.assessOverallRecoverability(analyses),
            recommendations: this.generateOverallRecommendations(analyses),
            trend: this.analyzeFailureTrend(),
            impactAssessment: this.assessImpact(analyses, testResults)
        };

        return summary;
    }

    summarizePatterns(analyses) {
        const patternCounts = new Map();
        
        analyses.forEach(analysis => {
            if (analysis.pattern) {
                const key = analysis.pattern.id;
                patternCounts.set(key, (patternCounts.get(key) || 0) + 1);
            }
        });

        return Array.from(patternCounts.entries())
            .map(([patternId, count]) => ({
                pattern: this.failurePatterns.get(patternId),
                count: count,
                percentage: (count / analyses.length) * 100
            }))
            .sort((a, b) => b.count - a.count);
    }

    summarizeComponents(analyses) {
        const componentCounts = new Map();
        
        analyses.forEach(analysis => {
            const component = this.extractComponentName({ name: analysis.testName });
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

    assessOverallRecoverability(analyses) {
        const avgScore = analyses.reduce((sum, analysis) => 
            sum + analysis.recoverability.score, 0) / analyses.length;

        return {
            averageScore: avgScore,
            level: avgScore > 70 ? 'high' : avgScore > 40 ? 'medium' : 'low',
            estimatedTime: this.estimateRecoveryTime(avgScore),
            breakdown: {
                high: analyses.filter(a => a.recoverability.level === 'high').length,
                medium: analyses.filter(a => a.recoverability.level === 'medium').length,
                low: analyses.filter(a => a.recoverability.level === 'low').length
            }
        };
    }

    generateOverallRecommendations(analyses) {
        const recommendations = [];
        
        // パターンベースの推奨事項
        const topPatterns = this.summarizePatterns(analyses).slice(0, 3);
        topPatterns.forEach(({ pattern, count }) => {
            if (count > 1) {
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

        // 頻度ベースの推奨事項
        const frequentFailures = analyses.filter(a => a.frequency.frequency === 'high');
        if (frequentFailures.length > 0) {
            recommendations.push({
                type: 'frequency',
                priority: 'high',
                message: `${frequentFailures.length} tests are failing frequently`,
                action: 'Investigate systemic issues causing repeated test failures'
            });
        }

        // 全般的な推奨事項
        if (analyses.length > 5) {
            recommendations.push({
                type: 'general',
                priority: 'medium',
                message: 'High number of test failures indicates potential systemic issues',
                action: 'Consider improving test infrastructure and error handling'
            });
        }

        return recommendations.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    analyzeFailureTrend() {
        const recentHistory = this.failureHistory
            .filter(f => Date.now() - f.timestamp < 7 * 24 * 60 * 60 * 1000)
            .sort((a, b) => a.timestamp - b.timestamp);

        if (recentHistory.length < 3) {
            return { trend: 'insufficient_data', message: 'Not enough historical data' };
        }

        const dayBuckets = new Map();
        recentHistory.forEach(failure => {
            const day = Math.floor(failure.timestamp / (24 * 60 * 60 * 1000));
            dayBuckets.set(day, (dayBuckets.get(day) || 0) + 1);
        });

        const dailyCounts = Array.from(dayBuckets.values());
        const recentAvg = dailyCounts.slice(-3).reduce((sum, count) => sum + count, 0) / 3;
        const olderAvg = dailyCounts.slice(-6, -3).reduce((sum, count) => sum + count, 0) / 3 || recentAvg;

        const change = (recentAvg - olderAvg) / olderAvg;

        if (change > 0.2) {
            return { trend: 'increasing', message: 'Test failures are increasing', change: change };
        } else if (change < -0.2) {
            return { trend: 'decreasing', message: 'Test failures are decreasing', change: change };
        } else {
            return { trend: 'stable', message: 'Test failure rate is stable', change: change };
        }
    }

    assessImpact(analyses, testResults) {
        const totalTests = testResults.results.passed + testResults.results.failed;
        const failureRate = analyses.length / totalTests;

        const criticalFailures = analyses.filter(a => 
            a.pattern?.severity === 'high' || a.frequency.frequency === 'high'
        ).length;

        const blockedComponents = new Set(
            analyses.map(a => this.extractComponentName({ name: a.testName }))
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

    generateImpactDescription(failureRate, criticalFailures, blockedComponents) {
        if (failureRate > 0.3) {
            return `High impact: ${(failureRate * 100).toFixed(1)}% failure rate affects ${blockedComponents} components`;
        } else if (criticalFailures > 0) {
            return `Medium impact: ${criticalFailures} critical failures require immediate attention`;
        } else {
            return `Low impact: Isolated failures with limited system impact`;
        }
    }

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

    addToFailureHistory(analyses) {
        analyses.forEach(analysis => {
            this.failureHistory.push({
                testName: analysis.testName,
                category: analysis.category,
                error: analysis.error,
                pattern: analysis.pattern,
                timestamp: analysis.timestamp,
                frequency: analysis.frequency,
                resolution: null // 解決策は後で追加
            });
        });

        // 履歴を最新100件に制限
        this.failureHistory = this.failureHistory.slice(-100);
        this.saveFailureHistory();
    }

    // 解決策の追加
    addResolution(testName, resolution) {
        const failure = this.failureHistory
            .filter(f => f.testName === testName)
            .sort((a, b) => b.timestamp - a.timestamp)[0];

        if (failure) {
            failure.resolution = {
                description: resolution.description,
                code: resolution.code,
                timestamp: Date.now(),
                effectiveness: resolution.effectiveness || 'unknown'
            };
            this.saveFailureHistory();
        }
    }

    // 詳細なデバッグレポート生成
    generateDebugReport(analysis) {
        return {
            testName: analysis.testName,
            timestamp: new Date(analysis.timestamp).toISOString(),
            
            errorDetails: {
                message: analysis.error.message,
                stack: analysis.error.stack,
                type: analysis.pattern?.name || 'Unknown Error'
            },
            
            analysis: {
                pattern: analysis.pattern,
                commonIssue: analysis.commonIssue,
                frequency: analysis.frequency,
                similarity: analysis.similarity,
                recoverability: analysis.recoverability
            },
            
            actionPlan: {
                immediate: analysis.suggestions.slice(0, 2),
                debugging: analysis.debugSteps.slice(0, 5),
                longTerm: this.generateLongTermActions(analysis)
            },
            
            relatedFailures: analysis.relatedFailures.map(f => ({
                testName: f.testName,
                timestamp: new Date(f.timestamp).toLocaleString(),
                resolution: f.resolution?.description
            })),
            
            resources: this.generateHelpfulResources(analysis)
        };
    }

    generateLongTermActions(analysis) {
        const actions = [];
        
        if (analysis.frequency.frequency === 'high') {
            actions.push('Implement more robust error handling for this component');
            actions.push('Add comprehensive integration tests to prevent regressions');
        }
        
        if (analysis.pattern?.category === 'async') {
            actions.push('Review async/await patterns across the codebase');
            actions.push('Consider implementing timeout handling utilities');
        }
        
        if (analysis.recoverability.level === 'low') {
            actions.push('Investigate architectural improvements to reduce complexity');
            actions.push('Consider refactoring the affected component');
        }
        
        return actions;
    }

    generateHelpfulResources(analysis) {
        const resources = [];
        
        if (analysis.pattern) {
            switch (analysis.pattern.category) {
                case 'async':
                    resources.push({
                        title: 'JavaScript Async/Await Best Practices',
                        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function'
                    });
                    break;
                case 'type_error':
                    resources.push({
                        title: 'TypeScript Type Checking',
                        url: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html'
                    });
                    break;
                case 'memory':
                    resources.push({
                        title: 'JavaScript Memory Management',
                        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management'
                    });
                    break;
            }
        }
        
        resources.push({
            title: 'Jest Testing Best Practices',
            url: 'https://jestjs.io/docs/getting-started'
        });
        
        return resources;
    }

    // 失敗の統計情報
    getFailureStatistics(days = 30) {
        const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
        const recentFailures = this.failureHistory.filter(f => f.timestamp > cutoff);
        
        return {
            totalFailures: recentFailures.length,
            uniqueTests: new Set(recentFailures.map(f => f.testName)).size,
            topFailingTests: this.getTopFailingTests(recentFailures),
            commonPatterns: this.getCommonPatterns(recentFailures),
            resolutionRate: this.calculateResolutionRate(recentFailures),
            averageRecoveryTime: this.calculateAverageRecoveryTime(recentFailures)
        };
    }

    getTopFailingTests(failures) {
        const testCounts = new Map();
        failures.forEach(f => {
            testCounts.set(f.testName, (testCounts.get(f.testName) || 0) + 1);
        });
        
        return Array.from(testCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([testName, count]) => ({ testName, count }));
    }

    getCommonPatterns(failures) {
        const patternCounts = new Map();
        failures.forEach(f => {
            if (f.pattern) {
                patternCounts.set(f.pattern.id, (patternCounts.get(f.pattern.id) || 0) + 1);
            }
        });
        
        return Array.from(patternCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([patternId, count]) => ({ 
                pattern: this.failurePatterns.get(patternId), 
                count 
            }));
    }

    calculateResolutionRate(failures) {
        const resolved = failures.filter(f => f.resolution && f.resolution.effectiveness !== 'failed');
        return failures.length > 0 ? resolved.length / failures.length : 0;
    }

    calculateAverageRecoveryTime(failures) {
        const resolved = failures.filter(f => f.resolution && f.resolution.timestamp);
        if (resolved.length === 0) return null;
        
        const recoveryTimes = resolved.map(f => f.resolution.timestamp - f.timestamp);
        return recoveryTimes.reduce((sum, time) => sum + time, 0) / recoveryTimes.length;
    }

    // クリーンアップ
    destroy() {
        this.saveFailureHistory();
        this.failurePatterns.clear();
        this.commonIssues.clear();
        this.debugSuggestions.clear();
        this.failureHistory = [];
    }
}

// グローバルアクセス用（デバッグ目的）
window.TestFailureAnalyzer = TestFailureAnalyzer;