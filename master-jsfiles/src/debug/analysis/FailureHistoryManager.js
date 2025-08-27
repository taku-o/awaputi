import { BaseComponent } from '../BaseComponent.js';

/**
 * FailureHistoryManager - 失敗履歴管理・永続化コンポーネント
 */
export class FailureHistoryManager extends BaseComponent {
    constructor(mainController) {
        super(mainController, 'FailureHistoryManager');
        this.failureHistory = [];
        this.maxHistorySize = 100;
        this.storageKey = 'testFailureHistory';
    }

    async _doInitialize() {
        this.loadFailureHistory();
    }

    /**
     * ローカルストレージから失敗履歴を読み込み
     */
    loadFailureHistory() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    this.failureHistory = parsed;
                } else {
                    console.warn('Invalid failure history format, starting fresh');
                    this.failureHistory = [];
                }
            }
        } catch (error) {
            this._handleError('Failed to load failure history', error);
            this.failureHistory = [];
        }
    }

    /**
     * 失敗履歴をローカルストレージに保存
     */
    saveFailureHistory() {
        try {
            // 最大履歴サイズを超えた場合は古いものから削除
            const historyToSave = this.failureHistory.slice(-this.maxHistorySize);
            localStorage.setItem(this.storageKey, JSON.stringify(historyToSave));
        } catch (error) {
            this._handleError('Failed to save failure history', error);
        }
    }

    /**
     * 失敗分析結果を履歴に追加
     * @param {Array} analyses - 分析結果の配列
     */
    addToFailureHistory(analyses) {
        if (!Array.isArray(analyses) || analyses.length === 0) {
            return;
        }

        const timestamp = Date.now();
        const sessionId = this.generateSessionId();

        for (const analysis of analyses) {
            if (analysis && analysis.test) {
                const historyEntry = {
                    timestamp,
                    sessionId,
                    testName: analysis.test.name,
                    pattern: analysis.pattern ? {
                        id: analysis.pattern.id,
                        name: analysis.pattern.name,
                        category: analysis.pattern.category,
                        severity: analysis.pattern.severity
                    } : null,
                    error: analysis.test.error,
                    component: analysis.component || null,
                    recoverability: analysis.recoverability || null,
                    suggestions: analysis.suggestions ? analysis.suggestions.slice(0, 3) : []
                };

                this.failureHistory.push(historyEntry);
            }
        }

        // 履歴サイズの制限
        if (this.failureHistory.length > this.maxHistorySize) {
            this.failureHistory = this.failureHistory.slice(-this.maxHistorySize);
        }

        this.saveFailureHistory();
    }

    /**
     * セッションIDを生成
     * @returns {string} セッションID
     */
    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 特定のテストに関連する過去の失敗を検索
     * @param {Object} test - テスト情報
     * @returns {Array} 関連する失敗履歴
     */
    findRelatedFailures(test) {
        if (!test || !test.name) {
            return [];
        }

        const testName = test.name;
        const relatedFailures = this.failureHistory.filter(entry => {
            if (entry.testName === testName) {
                return true;
            }
            
            // 類似のテスト名
            if (this.calculateSimilarityScore(testName, entry.testName) > 0.7) {
                return true;
            }

            return false;
        });

        // 最新の失敗から順に並べる
        return relatedFailures
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 10); // 最大10件
    }

    /**
     * テスト名の類似度を計算
     * @param {string} name1 - テスト名1
     * @param {string} name2 - テスト名2
     * @returns {number} 類似度スコア（0-1）
     */
    calculateSimilarityScore(name1, name2) {
        if (!name1 || !name2) return 0;
        if (name1 === name2) return 1;

        const words1 = name1.toLowerCase().split(/\s+/);
        const words2 = name2.toLowerCase().split(/\s+/);
        
        const commonWords = words1.filter(word => words2.includes(word));
        const totalWords = new Set([...words1, ...words2]).size;
        
        return commonWords.length / totalWords;
    }

    /**
     * 失敗頻度を分析
     * @param {string} testName - テスト名
     * @returns {Object} 頻度分析結果
     */
    analyzeFailureFrequency(testName) {
        if (!testName) {
            return { frequency: 0, trend: 'stable', recentFailures: 0 };
        }

        const relatedFailures = this.findRelatedFailures({ name: testName });
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        const weekMs = 7 * dayMs;

        // 期間別の失敗数をカウント
        const recentFailures = relatedFailures.filter(f => (now - f.timestamp) < dayMs).length;
        const weeklyFailures = relatedFailures.filter(f => (now - f.timestamp) < weekMs).length;
        const totalFailures = relatedFailures.length;

        // トレンド分析
        let trend = 'stable';
        if (recentFailures > 0) {
            const recentRate = recentFailures / Math.max(1, totalFailures);
            if (recentRate > 0.5) {
                trend = 'increasing';
            } else if (recentRate < 0.1) {
                trend = 'decreasing';
            }
        }

        return {
            frequency: totalFailures,
            recentFailures,
            weeklyFailures,
            trend,
            firstFailure: totalFailures > 0 ? new Date(relatedFailures[totalFailures - 1].timestamp) : null,
            lastFailure: totalFailures > 0 ? new Date(relatedFailures[0].timestamp) : null
        };
    }

    /**
     * 失敗履歴の統計情報を取得
     * @returns {Object} 統計情報
     */
    getHistoryStatistics() {
        const stats = {
            totalFailures: this.failureHistory.length,
            uniqueTests: new Set(this.failureHistory.map(f => f.testName)).size,
            patternBreakdown: {},
            componentBreakdown: {},
            severityBreakdown: {},
            timeRange: null
        };

        if (this.failureHistory.length === 0) {
            return stats;
        }

        // 時間範囲
        const timestamps = this.failureHistory.map(f => f.timestamp).sort((a, b) => a - b);
        stats.timeRange = {
            earliest: new Date(timestamps[0]),
            latest: new Date(timestamps[timestamps.length - 1]),
            spanDays: (timestamps[timestamps.length - 1] - timestamps[0]) / (24 * 60 * 60 * 1000)
        };

        // パターン別統計
        for (const failure of this.failureHistory) {
            if (failure.pattern) {
                const patternId = failure.pattern.id;
                stats.patternBreakdown[patternId] = (stats.patternBreakdown[patternId] || 0) + 1;
                
                // 重要度別統計
                const severity = failure.pattern.severity;
                stats.severityBreakdown[severity] = (stats.severityBreakdown[severity] || 0) + 1;
            }

            // コンポーネント別統計
            if (failure.component) {
                stats.componentBreakdown[failure.component] = (stats.componentBreakdown[failure.component] || 0) + 1;
            }
        }

        return stats;
    }

    /**
     * 履歴に基づく提案を生成
     * @param {Object} test - テスト情報
     * @returns {Array} 履歴ベースの提案
     */
    generateHistoricalSuggestions(test) {
        const relatedFailures = this.findRelatedFailures(test);
        if (relatedFailures.length === 0) {
            return [];
        }

        const suggestions = [];
        const frequencyAnalysis = this.analyzeFailureFrequency(test.name);

        // 頻繁に失敗するテストの場合
        if (frequencyAnalysis.frequency > 3) {
            suggestions.push({
                action: 'Review test stability',
                description: `このテストは過去${frequencyAnalysis.frequency}回失敗しています。テストの安定性を見直すことを推奨します。`,
                priority: 'high',
                category: 'stability',
                source: 'history'
            });
        }

        // 最近増加傾向の場合
        if (frequencyAnalysis.trend === 'increasing') {
            suggestions.push({
                action: 'Investigate recent changes',
                description: '最近失敗が増加しています。関連するコード変更を調査してください。',
                priority: 'high',
                category: 'investigation',
                source: 'history'
            });
        }

        // 同じパターンでの失敗が多い場合
        const commonPatterns = this.getCommonPatternsFromHistory(relatedFailures);
        for (const pattern of commonPatterns) {
            if (pattern.count > 1) {
                suggestions.push({
                    action: `Address recurring ${pattern.name}`,
                    description: `${pattern.name}パターンで${pattern.count}回失敗しています。根本的な解決を検討してください。`,
                    priority: 'medium',
                    category: 'pattern_analysis',
                    source: 'history'
                });
            }
        }

        return suggestions.slice(0, 5); // 最大5件
    }

    /**
     * 履歴から共通パターンを抽出
     * @param {Array} failures - 失敗履歴
     * @returns {Array} 共通パターン
     */
    getCommonPatternsFromHistory(failures) {
        const patternCounts = {};
        
        for (const failure of failures) {
            if (failure.pattern) {
                const key = failure.pattern.id;
                if (!patternCounts[key]) {
                    patternCounts[key] = {
                        id: failure.pattern.id,
                        name: failure.pattern.name,
                        count: 0
                    };
                }
                patternCounts[key].count++;
            }
        }

        return Object.values(patternCounts)
            .sort((a, b) => b.count - a.count);
    }

    /**
     * 失敗トレンドを分析
     * @param {number} days - 分析期間（日数）
     * @returns {Object} トレンド分析結果
     */
    analyzeFailureTrend(days = 30) {
        const now = Date.now();
        const periodMs = days * 24 * 60 * 60 * 1000;
        const periodStart = now - periodMs;

        const recentFailures = this.failureHistory.filter(f => f.timestamp >= periodStart);
        
        if (recentFailures.length === 0) {
            return {
                trend: 'no_data',
                totalFailures: 0,
                dailyAverage: 0,
                mostCommonPattern: null,
                mostProblematicTest: null
            };
        }

        // 日別の失敗数を計算
        const dailyFailures = {};
        const dayMs = 24 * 60 * 60 * 1000;
        
        for (const failure of recentFailures) {
            const dayKey = Math.floor(failure.timestamp / dayMs);
            dailyFailures[dayKey] = (dailyFailures[dayKey] || 0) + 1;
        }

        const dailyAverage = recentFailures.length / days;

        // 最も一般的なパターン
        const patternCounts = {};
        for (const failure of recentFailures) {
            if (failure.pattern) {
                const key = failure.pattern.id;
                patternCounts[key] = (patternCounts[key] || 0) + 1;
            }
        }

        const mostCommonPattern = Object.entries(patternCounts)
            .sort(([, a], [, b]) => b - a)[0];

        // 最も問題のあるテスト
        const testCounts = {};
        for (const failure of recentFailures) {
            const key = failure.testName;
            testCounts[key] = (testCounts[key] || 0) + 1;
        }

        const mostProblematicTest = Object.entries(testCounts)
            .sort(([, a], [, b]) => b - a)[0];

        return {
            trend: dailyAverage > 1 ? 'high' : dailyAverage > 0.5 ? 'medium' : 'low',
            totalFailures: recentFailures.length,
            dailyAverage,
            mostCommonPattern: mostCommonPattern ? {
                pattern: mostCommonPattern[0],
                count: mostCommonPattern[1]
            } : null,
            mostProblematicTest: mostProblematicTest ? {
                testName: mostProblematicTest[0],
                count: mostProblematicTest[1]
            } : null
        };
    }

    /**
     * 履歴をクリア
     */
    clearHistory() {
        this.failureHistory = [];
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            this._handleError('Failed to clear failure history', error);
        }
    }

    /**
     * 履歴をエクスポート
     * @returns {string} JSON形式の履歴データ
     */
    exportHistory() {
        return JSON.stringify({
            version: '1.0',
            exportDate: new Date().toISOString(),
            totalFailures: this.failureHistory.length,
            history: this.failureHistory
        }, null, 2);
    }

    /**
     * 履歴をインポート
     * @param {string} jsonData - JSON形式の履歴データ
     * @returns {boolean} インポート成功フラグ
     */
    importHistory(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.version && Array.isArray(data.history)) {
                this.failureHistory = data.history;
                this.saveFailureHistory();
                return true;
            }
            return false;
        } catch (error) {
            this._handleError('Failed to import failure history', error);
            return false;
        }
    }

    /**
     * 失敗履歴を取得
     * @param {number} limit - 取得件数制限
     * @returns {Array} 失敗履歴
     */
    getFailureHistory(limit = null) {
        const history = [...this.failureHistory].reverse(); // 最新から順に
        return limit ? history.slice(0, limit) : history;
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        this.saveFailureHistory();
        this.failureHistory = [];
        super.cleanup();
    }
}