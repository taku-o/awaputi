import { BaseComponent } from '../BaseComponent.js';

/**
 * CommonIssueDetector - 一般的な問題検出・分類コンポーネント
 */
export class CommonIssueDetector extends BaseComponent {
    constructor(mainController) {
        super(mainController, 'CommonIssueDetector');
        this.commonIssues = new Map();
    }

    async _doInitialize() {
        this.setupCommonIssues();
    }

    /**
     * よくある問題とその解決策を設定
     */
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
                'document.createElement("canvas")でCanvas作成を確認',
                'getContext("2d")が成功するか確認',
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

        this.commonIssues.set('mock_data_inconsistency', {
            pattern: 'assertion_failure',
            component: 'MockData',
            issue: 'Mock data does not match expected format',
            solutions: [
                'モックデータの構造を最新の仕様と同期',
                'データバリデーションを追加',
                'MockFactoryを使用して一貫性を保持'
            ],
            debugSteps: [
                'モックデータの実際の構造を確認',
                '期待される構造との違いを分析',
                'データ生成ロジックを検証'
            ]
        });

        this.commonIssues.set('event_listener_error', {
            pattern: 'type_error',
            component: 'EventSystem',
            issue: 'Event listener is not properly attached',
            solutions: [
                'addEventListener呼び出し前にDOM要素の存在を確認',
                'イベントリスナーの削除処理を追加',
                'カスタムイベントの名前空間を確認'
            ],
            debugSteps: [
                'DOM要素が実際に存在するか確認',
                'イベント名のスペルミスがないか確認',
                'イベントハンドラー関数が正しく定義されているか確認'
            ]
        });

        this.commonIssues.set('configuration_mismatch', {
            pattern: 'configuration_error',
            component: 'Configuration',
            issue: 'Configuration values do not match expected format',
            solutions: [
                'ConfigurationManagerの設定値を確認',
                'デフォルト設定との差異を確認',
                '設定の検証ルールを追加'
            ],
            debugSteps: [
                '現在の設定値をログ出力',
                'デフォルト設定と比較',
                '設定の読み込み順序を確認'
            ]
        });
    }

    /**
     * パターンとテスト情報から共通問題を検出
     * @param {Object} pattern - 識別されたパターン
     * @param {Object} test - テスト情報
     * @returns {Object|null} 検出された共通問題
     */
    findCommonIssue(pattern, test) {
        if (!pattern || !test) {
            return null;
        }

        const componentName = this.extractComponentName(test);
        
        // パターンとコンポーネント名によるマッチング
        for (const [issueId, issue] of this.commonIssues) {
            if (issue.pattern === pattern.id) {
                if (issue.component === 'General' || 
                    issue.component === componentName ||
                    (componentName && issue.component.toLowerCase().includes(componentName.toLowerCase()))) {
                    return { id: issueId, ...issue };
                }
            }
        }

        return null;
    }

    /**
     * テスト名からコンポーネント名を抽出
     * @param {Object} test - テスト情報
     * @returns {string|null} コンポーネント名
     */
    extractComponentName(test) {
        if (!test || !test.name) {
            return null;
        }

        const testName = test.name.toLowerCase();
        const componentPatterns = [
            'bubblemanager', 'scoremanager', 'gameengine', 'scenemanager',
            'particlemanager', 'audioManager', 'inputmanager', 'configurationmanager',
            'statisticsmanager', 'achievementmanager', 'rendering', 'canvas'
        ];

        for (const pattern of componentPatterns) {
            if (testName.includes(pattern)) {
                return pattern.charAt(0).toUpperCase() + pattern.slice(1);
            }
        }

        return null;
    }

    /**
     * 問題の重要度を評価
     * @param {Object} issue - 問題情報
     * @param {Object} pattern - パターン情報
     * @returns {string} 重要度（high, medium, low）
     */
    assessIssueSeverity(issue, pattern) {
        if (!issue || !pattern) {
            return 'low';
        }

        // クリティカルコンポーネントの問題は重要度が高い
        const criticalComponents = ['GameEngine', 'ScoreManager', 'BubbleManager'];
        if (criticalComponents.includes(issue.component)) {
            return 'high';
        }

        // パターンの重要度を考慮
        if (pattern.severity === 'high') {
            return 'high';
        } else if (pattern.severity === 'medium') {
            return 'medium';
        }

        return 'low';
    }

    /**
     * 問題の解決可能性を評価
     * @param {Object} issue - 問題情報
     * @returns {number} 解決可能性スコア（0-1）
     */
    assessResolvability(issue) {
        if (!issue || !issue.solutions) {
            return 0.1;
        }

        // 解決策の数と詳細度に基づく評価
        const solutionCount = issue.solutions.length;
        const debugStepCount = issue.debugSteps ? issue.debugSteps.length : 0;
        
        const baseScore = Math.min(solutionCount * 0.2, 0.8);
        const debugBonus = Math.min(debugStepCount * 0.1, 0.2);
        
        return Math.min(baseScore + debugBonus, 1.0);
    }

    /**
     * 登録済みの共通問題を取得
     * @returns {Map} 共通問題のマップ
     */
    getCommonIssues() {
        return new Map(this.commonIssues);
    }

    /**
     * 特定の問題を取得
     * @param {string} issueId - 問題ID
     * @returns {Object|null} 問題情報
     */
    getIssue(issueId) {
        return this.commonIssues.get(issueId) || null;
    }

    /**
     * 問題の統計情報を取得
     * @returns {Object} 統計情報
     */
    getIssueStatistics() {
        const stats = {
            totalIssues: this.commonIssues.size,
            issuesByComponent: {},
            issuesByPattern: {}
        };

        for (const issue of this.commonIssues.values()) {
            // コンポーネント別統計
            if (!stats.issuesByComponent[issue.component]) {
                stats.issuesByComponent[issue.component] = 0;
            }
            stats.issuesByComponent[issue.component]++;

            // パターン別統計
            if (!stats.issuesByPattern[issue.pattern]) {
                stats.issuesByPattern[issue.pattern] = 0;
            }
            stats.issuesByPattern[issue.pattern]++;
        }

        return stats;
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        this.commonIssues.clear();
        super.cleanup();
    }
}