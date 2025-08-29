import { BaseComponent } from '../BaseComponent.js';

/**
 * FailurePatternAnalyzer - 失敗パターン分析・認識コンポーネント
 */
export class FailurePatternAnalyzer extends BaseComponent {
    constructor(mainController) {
        super(mainController, 'FailurePatternAnalyzer');
        this.failurePatterns = new Map();
    }

    async _doInitialize() {
        this.setupFailurePatterns();
    }

    /**
     * 失敗パターンの定義を設定
     */
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

    /**
     * エラーメッセージからパターンを識別
     * @param {string} error - エラーメッセージ
     * @returns {Object} 識別されたパターン情報
     */
    identifyPattern(error) {
        if (!error || typeof error !== 'string') {
            return null;
        }

        const errorText = error.toLowerCase();
        let bestMatch = null;
        let highestConfidence = 0;

        for (const [patternId, pattern] of this.failurePatterns) {
            const confidence = this.calculatePatternConfidence(errorText, pattern.keywords);
            if (confidence > highestConfidence) {
                highestConfidence = confidence;
                bestMatch = { id: patternId, ...pattern, confidence };
            }
        }

        return bestMatch;
    }

    /**
     * パターンマッチングの信頼度計算
     * @param {string} text - 分析対象テキスト
     * @param {Array<string>} keywords - マッチング用キーワード
     * @returns {number} 信頼度スコア（0-1）
     */
    calculatePatternConfidence(text, keywords) {
        let matches = 0;
        for (const keyword of keywords) {
            if (text.includes(keyword.toLowerCase())) {
                matches++;
            }
        }
        return matches / keywords.length;
    }

    /**
     * 登録済みの失敗パターンを取得
     * @returns {Map} 失敗パターンのマップ
     */
    getFailurePatterns() {
        return new Map(this.failurePatterns);
    }

    /**
     * 特定のパターンを取得
     * @param {string} patternId - パターンID
     * @returns {Object|null} パターン情報
     */
    getPattern(patternId) {
        return this.failurePatterns.get(patternId) || null;
    }

    /**
     * パターンの統計情報を取得
     * @returns {Object} 統計情報
     */
    getPatternStatistics() {
        const stats = {
            totalPatterns: this.failurePatterns.size,
            patternsByCategory: {},
            patternsBySeverity: {}
        };

        for (const pattern of this.failurePatterns.values()) {
            // カテゴリ別統計
            if (!stats.patternsByCategory[pattern.category]) {
                stats.patternsByCategory[pattern.category] = 0;
            }
            stats.patternsByCategory[pattern.category]++;

            // 重要度別統計
            if (!stats.patternsBySeverity[pattern.severity]) {
                stats.patternsBySeverity[pattern.severity] = 0;
            }
            stats.patternsBySeverity[pattern.severity]++;
        }

        return stats;
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        this.failurePatterns.clear();
        super.cleanup();
    }
}