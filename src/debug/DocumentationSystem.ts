/**
 * Documentation System
 * デバッグツールの統合ヘルプとドキュメントシステム
 */

// Type definitions
interface DocumentationItem {
    id: string;
    title: string;
    category: string;
    content: string;
    keywords: string[];
    lastUpdated: number;
}

interface SearchResult {
    docId: string;
    title: string;
    score: number;
    matches: string[];
    excerpt: string;
}

interface SearchOptions {
    limit?: number;
}

interface ContextualHelpResult {
    context: string;
    suggestedDocs: string[];
    currentDoc?: string;
    tips: string[];
}

interface ContextInfo {
    docId: string;
    doc: DocumentationItem;
    timestamp: number;
}

interface TokenInfo {
    docId: string;
    title: string;
    frequency: number;
}

export class DocumentationSystem {
    private docs: Map<string, DocumentationItem>;
    private searchEngine: DocumentationSearchEngine;
    private contextualHelp: ContextualHelpProvider;
    private helpPanel: HTMLElement | null;
    private isVisible: boolean;

    constructor() {
        this.docs = new Map<string, DocumentationItem>();
        this.searchEngine = new DocumentationSearchEngine();
        this.contextualHelp = new ContextualHelpProvider();
        this.helpPanel = null;
        this.isVisible = false;
        this.initialize();
    }

    initialize(): void {
        this.loadDocumentation();
        this.createHelpPanel();
        this.setupEventHandlers();
    }

    loadDocumentation(): void {
        // コアドキュメント
        this.registerDocumentation('overview', {
            title: 'Debug Tools Overview',
            category: 'general',
            content: `
                <h3>デバッグツール概要</h3>
                <p>BubblePopゲームの包括的なデバッグ支援システムです。</p>
                <h4>主要機能:</h4>
                <ul>
                    <li><strong>Performance Monitor</strong> - リアルタイムパフォーマンス監視</li>
                    <li><strong>Developer Console</strong> - インタラクティブコマンドライン</li>
                    <li><strong>Error Reporter</strong> - 自動エラー収集と分析</li>
                    <li><strong>Test Support</strong> - テスト実行と分析ツール</li>
                    <li><strong>Visual Debugger</strong> - ゲーム状態の可視化</li>
                </ul>
                <h4>ショートカット:</h4>
                <ul>
                    <li><kbd>Ctrl+Shift+D</kbd> - デバッグパネルを開く</li>
                    <li><kbd>Ctrl+Shift+C</kbd> - コンソールを開く</li>
                    <li><kbd>Ctrl+Shift+P</kbd> - パフォーマンスモニターを開く</li>
                    <li><kbd>Ctrl+Shift+E</kbd> - エフェクトデバッガーを開く</li>
                </ul>
            `,
            keywords: ['overview', 'help', 'getting started', 'introduction']
        });

        this.registerDocumentation('performance-monitor', {
            title: 'Performance Monitor',
            category: 'tools',
            content: `
                <h3>パフォーマンスモニター</h3>
                <p>ゲームのパフォーマンスをリアルタイムで監視します。</p>
                <h4>監視項目:</h4>
                <ul>
                    <li><strong>FPS</strong> - フレームレート（目標: 60 FPS）</li>
                    <li><strong>Frame Time</strong> - フレーム処理時間（目標: < 16.67ms）</li>
                    <li><strong>Memory Usage</strong> - メモリ使用量（MB）</li>
                    <li><strong>Render Time</strong> - 描画処理時間（ms）</li>
                    <li><strong>Update Time</strong> - 更新処理時間（ms）</li>
                </ul>
                <h4>使用方法:</h4>
                <ol>
                    <li>パフォーマンスタブを開く</li>
                    <li>監視したいメトリクスを選択</li>
                    <li>閾値を設定して自動警告を有効化</li>
                    <li>ベンチマークを実行して基準値を設定</li>
                </ol>
                <h4>パフォーマンス改善のヒント:</h4>
                <ul>
                    <li>オブジェクトプーリングを使用</li>
                    <li>不要な描画処理を削減</li>
                    <li>重い計算処理を分散</li>
                </ul>
            `,
            keywords: ['performance', 'fps', 'monitoring', 'optimization']
        });

        this.registerDocumentation('developer-console', {
            title: 'Developer Console',
            category: 'tools',
            content: `
                <h3>開発者コンソール</h3>
                <p>ゲーム状態の操作と設定変更のためのコマンドラインインターフェース。</p>
                <h4>基本コマンド:</h4>
                <ul>
                    <li><code>game.pause()</code> - ゲームを一時停止</li>
                    <li><code>game.resume()</code> - ゲームを再開</li>
                    <li><code>game.setScore(1000)</code> - スコアを設定</li>
                    <li><code>game.addBubbles(10)</code> - バブルを追加</li>
                    <li><code>game.clearBubbles()</code> - バブルをクリア</li>
                    <li><code>config.get('audio.volume')</code> - 設定値を取得</li>
                    <li><code>config.set('audio.volume', 0.5)</code> - 設定値を変更</li>
                    <li><code>config.reset()</code> - 設定をリセット</li>
                </ul>
                <h4>テストコマンド:</h4>
                <ul>
                    <li><code>test.generateBubbles()</code> - テスト用バブル生成</li>
                    <li><code>test.simulateCombo(5)</code> - コンボをシミュレート</li>
                    <li><code>test.benchmark()</code> - ベンチマークを実行</li>
                </ul>
                <h4>ヒント:</h4>
                <ul>
                    <li>Tabキーで自動補完</li>
                    <li>上下キーで履歴参照</li>
                    <li>help() でヘルプを表示</li>
                </ul>
            `,
            keywords: ['console', 'commands', 'cli', 'terminal']
        });

        this.registerDocumentation('error-reporter', {
            title: 'Error Reporter',
            category: 'tools',
            content: `
                <h3>エラーレポーター</h3>
                <p>エラーの自動収集、分析、レポート生成を行います。</p>
                <h4>機能:</h4>
                <ul>
                    <li><strong>自動エラー収集</strong> - すべてのエラーを自動的にキャプチャ</li>
                    <li><strong>パターン分析</strong> - 類似エラーの検出とグループ化</li>
                    <li><strong>コンテキスト収集</strong> - エラー発生時の詳細情報を記録</li>
                    <li><strong>通知システム</strong> - 重要なエラーの即時通知</li>
                </ul>
                <h4>エラー情報:</h4>
                <ul>
                    <li>エラーメッセージとスタックトレース</li>
                    <li>発生時刻とブラウザ情報</li>
                    <li>ゲーム状態のスナップショット</li>
                    <li>ユーザーアクション履歴</li>
                </ul>
                <h4>エラー対処方法:</h4>
                <ol>
                    <li>エラーパネルでエラー詳細を確認</li>
                    <li>パターン分析で根本原因を特定</li>
                    <li>推奨される解決策を適用</li>
                    <li>修正後、エラーが解決されたか確認</li>
                </ol>
            `,
            keywords: ['error', 'debugging', 'troubleshooting', 'logs']
        });

        this.registerDocumentation('test-support', {
            title: 'Test Support Tools',
            category: 'tools',
            content: `
                <h3>テスト支援ツール</h3>
                <p>自動テストの実行、モックデータ生成、ベンチマーク機能を提供。</p>
                <h4>テスト実行:</h4>
                <ul>
                    <li><strong>単体テスト</strong> - コンポーネント単位のテスト</li>
                    <li><strong>統合テスト</strong> - システム間の連携テスト</li>
                    <li><strong>パフォーマンステスト</strong> - 性能測定とベンチマーク</li>
                    <li><strong>ストレステスト</strong> - 高負荷状態でのテスト</li>
                </ul>
                <h4>モックデータ生成:</h4>
                <ul>
                    <li>バブルデータ（全18種類対応）</li>
                    <li>ゲーム状態データ</li>
                    <li>プレイヤーデータ</li>
                    <li>パフォーマンスメトリクス</li>
                </ul>
                <h4>ベンチマーク:</h4>
                <ul>
                    <li>レンダリングパフォーマンス</li>
                    <li>物理演算パフォーマンス</li>
                    <li>メモリ使用効率</li>
                    <li>入力応答性</li>
                </ul>
                <h4>結果分析:</h4>
                <ul>
                    <li>視覚的なグラフ表示</li>
                    <li>ベースラインとの比較</li>
                    <li>パフォーマンス推移の追跡</li>
                    <li>改善提案の自動生成</li>
                </ul>
            `,
            keywords: ['testing', 'test', 'mock', 'benchmark']
        });

        this.registerDocumentation('visual-debugger', {
            title: 'Visual Debugger',
            category: 'tools',
            content: `
                <h3>ビジュアルデバッガー</h3>
                <p>ゲーム状態を視覚的に表示・編集するツール。</p>
                <h4>表示機能:</h4>
                <ul>
                    <li><strong>バブル情報</strong> - 位置、タイプ、状態の表示</li>
                    <li><strong>ヒットボックス</strong> - 衝突判定領域の可視化</li>
                    <li><strong>パーティクル</strong> - エフェクトの詳細表示</li>
                    <li><strong>パフォーマンス</strong> - 処理負荷のヒートマップ</li>
                </ul>
                <h4>編集機能:</h4>
                <ul>
                    <li>バブルの追加・削除・移動</li>
                    <li>プロパティの直接編集</li>
                    <li>エフェクトのプレビュー</li>
                    <li>ゲーム状態の保存・復元</li>
                </ul>
                <h4>デバッグオプション:</h4>
                <ul>
                    <li>スローモーション再生</li>
                    <li>フレーム単位での進行</li>
                    <li>イベントログの表示</li>
                    <li>状態変化の追跡</li>
                </ul>
            `,
            keywords: ['visual', 'debug', 'editor', 'inspector']
        });

        this.registerDocumentation('shortcuts', {
            title: 'Keyboard Shortcuts',
            category: 'reference',
            content: `
                <h3>キーボードショートカット一覧</h3>
                <h4>基本操作:</h4>
                <ul>
                    <li><kbd>Ctrl+Shift+D</kbd> - デバッグパネルの開閉</li>
                    <li><kbd>Ctrl+Shift+C</kbd> - コンソールの開閉</li>
                    <li><kbd>Ctrl+Shift+P</kbd> - パフォーマンスモニター</li>
                    <li><kbd>Ctrl+Shift+E</kbd> - エフェクトデバッガー</li>
                    <li><kbd>Ctrl+Shift+T</kbd> - テストランナー</li>
                </ul>
                <h4>デバッグ操作:</h4>
                <ul>
                    <li><kbd>F5</kbd> - ゲームの再開</li>
                    <li><kbd>F6</kbd> - 一時停止/再開の切り替え</li>
                    <li><kbd>F7</kbd> - ステップ実行</li>
                    <li><kbd>F8</kbd> - 次のフレームへ</li>
                </ul>
                <h4>パネル操作:</h4>
                <ul>
                    <li><kbd>Tab</kbd> - 次のパネルへ</li>
                    <li><kbd>Shift+Tab</kbd> - 前のパネルへ</li>
                    <li><kbd>Ctrl+1-9</kbd> - パネル番号で直接切り替え</li>
                    <li><kbd>Esc</kbd> - パネルを閉じる</li>
                </ul>
                <h4>コンソール:</h4>
                <ul>
                    <li><kbd>↑/↓</kbd> - コマンド履歴</li>
                    <li><kbd>Tab</kbd> - 自動補完</li>
                    <li><kbd>Ctrl+L</kbd> - 画面クリア</li>
                    <li><kbd>Ctrl+C</kbd> - コマンド中断</li>
                </ul>
            `,
            keywords: ['shortcuts', 'keyboard', 'hotkeys', 'keys']
        });

        this.registerDocumentation('troubleshooting', {
            title: 'Troubleshooting Guide',
            category: 'guides',
            content: `
                <h3>トラブルシューティングガイド</h3>
                <h4>よくある問題:</h4>
                <h5>1. デバッグツールが表示されない</h5>
                <ul>
                    <li>ブラウザのコンソールでエラーを確認</li>
                    <li>ショートカットキーが競合していないか確認</li>
                    <li>LocalStorageの容量を確認</li>
                    <li>ブラウザを更新して再試行</li>
                </ul>
                <h5>2. パフォーマンスが低下する</h5>
                <ul>
                    <li>不要なデバッグ機能を無効化</li>
                    <li>ログレベルを調整</li>
                    <li>メモリリークをチェック</li>
                    <li>ブラウザのハードウェアアクセラレーションを確認</li>
                </ul>
                <h5>3. テストが失敗する</h5>
                <ul>
                    <li>テスト環境の初期化を確認</li>
                    <li>モックデータの妥当性を検証</li>
                    <li>非同期処理のタイミングを調整</li>
                    <li>依存関係を確認</li>
                </ul>
                <h5>4. エラーが正しく記録されない</h5>
                <ul>
                    <li>エラーハンドラーが正しく設定されているか確認</li>
                    <li>ストレージ容量を確認</li>
                    <li>フィルター設定を確認</li>
                    <li>ブラウザのセキュリティ設定を確認</li>
                </ul>
                <h4>サポート:</h4>
                <p>問題が解決しない場合は、以下の情報を含めて報告してください：</p>
                <ul>
                    <li>ブラウザとバージョン</li>
                    <li>エラーメッセージ（コンソール）</li>
                    <li>再現手順</li>
                    <li>デバッグツールのバージョン</li>
                </ul>
            `,
            keywords: ['troubleshooting', 'problems', 'issues', 'help', 'support']
        });

        this.registerDocumentation('best-practices', {
            title: 'Best Practices',
            category: 'guides',
            content: `
                <h3>ベストプラクティス</h3>
                <h4>デバッグワークフロー:</h4>
                <ol>
                    <li><strong>問題の特定</strong> - エラーレポーターで問題を確認</li>
                    <li><strong>再現</strong> - コンソールで問題を再現</li>
                    <li><strong>分析</strong> - パフォーマンスモニターで詳細を分析</li>
                    <li><strong>修正</strong> - コードを修正して検証</li>
                    <li><strong>テスト</strong> - テストツールで確認</li>
                </ol>
                <h4>パフォーマンス最適化:</h4>
                <ul>
                    <li>定期的にベンチマークを実行</li>
                    <li>メモリリークを早期発見</li>
                    <li>重い処理を特定して最適化</li>
                    <li>デバッグコードを本番環境から除外</li>
                </ul>
                <h4>エラー処理:</h4>
                <ul>
                    <li>すべてのエラーをキャッチして記録</li>
                    <li>エラーパターンを分析</li>
                    <li>ユーザーへの影響を最小限に</li>
                    <li>エラー回復戦略を実装</li>
                </ul>
                <h4>テスト戦略:</h4>
                <ul>
                    <li>単体テストでコンポーネントを検証</li>
                    <li>統合テストでシステム全体を確認</li>
                    <li>パフォーマンステストで性能を保証</li>
                    <li>ストレステストで限界を把握</li>
                </ul>
                <h4>セキュリティ:</h4>
                <ul>
                    <li>デバッグツールを本番環境で無効化</li>
                    <li>機密情報をログに出力しない</li>
                    <li>デバッグAPIへのアクセス制限</li>
                    <li>入力検証を徹底</li>
                </ul>
            `,
            keywords: ['best practices', 'guidelines', 'tips', 'recommendations']
        });

        // API リファレンス
        this.registerDocumentation('api-reference', {
            title: 'API Reference',
            category: 'reference',
            content: `
                <h3>デバッグツール API リファレンス</h3>
                <h4>EnhancedDebugInterface</h4>
                <pre><code>
class EnhancedDebugInterface {
    // パネル管理
    registerPanel(name: string, panel: Panel): void;
    switchPanel(name: string): void;
    closePanel(): void;
    
    // ショートカット
    registerShortcut(key: string, handler: Function): void;
    unregisterShortcut(key: string): void;
    
    // レイアウト
    setLayout(layout: 'docked' | 'floating' | 'fullscreen'): void;
    toggleVisibility(): void;
}
                </code></pre>
                <h4>PerformanceMonitor</h4>
                <pre><code>
class PerformanceMonitor {
    // メトリクス収集
    collectMetrics(): Metrics;
    startProfiling(label: string): void;
    stopProfiling(label: string): ProfileResult;
    
    // 分析
    analyzePerformance(): Analysis;
    compareWithBaseline(): Comparison;
    
    // 設定
    setThreshold(metric: string, value: number): void;
    enableWarnings(enabled: boolean): void;
}
                </code></pre>
                <h4>DeveloperConsole</h4>
                <pre><code>
class DeveloperConsole {
    // コマンド管理
    registerCommand(name: string, handler: Function): void;
    executeCommand(command: string): any;
    
    // 履歴
    getHistory(): string[];
    clearHistory(): void;
    
    // 自動補完
    getCompletions(partial: string): string[];
}
                </code></pre>
                <h4>TestSupportTools</h4>
                <pre><code>
class TestSupportTools {
    // テスト実行
    runTests(suites?: string[]): TestResults;
    runBenchmarks(names?: string[]): BenchmarkResults;
    
    // モックデータ
    generateMockData(type: "single" | "batch", count: number): any[];
    createScenario(name: string): Scenario;
    
    // 分析
    analyzeResults(results: TestResults): Analysis;
    generateReport(): Report;
}
                </code></pre>
            `,
            keywords: ['api', 'reference', 'documentation', 'methods', 'classes']
        });
    }

    registerDocumentation(id: string, doc: Omit<DocumentationItem, 'id' | 'lastUpdated'>): void {
        const fullDoc: DocumentationItem = {
            id: id,
            ...doc,
            lastUpdated: Date.now()
        };
        
        this.docs.set(id, fullDoc);
        
        // 検索エンジンにインデックス
        this.searchEngine.indexDocument(id, fullDoc);
    }

    createHelpPanel(): void {
        this.helpPanel = document.createElement('div');
        this.helpPanel.id = 'debug-help-panel';
        this.helpPanel.className = 'debug-help-panel';
        this.helpPanel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 800px;
            max-width: 90vw;
            height: 600px;
            max-height: 90vh;
            background: rgba(0, 0, 0, 0.95);
            color: white;
            padding: 20px;
            border-radius: 12px;
            font-family: 'Segoe UI', system-ui, sans-serif;
            font-size: 14px;
            z-index: 20000;
            display: none;
            box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;

        this.helpPanel.innerHTML = this.createHelpPanelHTML();
        document.body.appendChild(this.helpPanel);
    }

    createHelpPanelHTML(): string {
        return `
            <div class="help-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #333; padding-bottom: 15px;">
                <h2 style="margin: 0; color: #00ff88; font-size: 24px;">
                    <span style="margin-right: 10px;">📚</span>
                    Debug Tools Documentation
                </h2>
                <button id="close-help" style="background: none; border: none; color: #ccc; font-size: 24px; cursor: pointer; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">×</button>
            </div>

            <div class="help-search" style="margin-bottom: 20px;">
                <input type="text" id="help-search-input" placeholder="Search documentation..." style="width: 100%; padding: 10px 15px; background: #222; border: 1px solid #444; border-radius: 6px; color: white; font-size: 14px;">
                <div id="search-results" style="position: absolute; background: #333; border: 1px solid #444; border-radius: 6px; margin-top: 5px; display: none; max-height: 200px; overflow-y: auto; width: 100%; z-index: 1000;"></div>
            </div>

            <div class="help-content" style="display: flex; gap: 20px; height: calc(100% - 120px);">
                <div class="help-sidebar" style="width: 200px; overflow-y: auto; border-right: 1px solid #333; padding-right: 20px;">
                    <h3 style="margin: 0 0 15px 0; color: #ccc; font-size: 14px; text-transform: uppercase;">Categories</h3>
                    <ul id="help-categories" style="list-style: none; padding: 0; margin: 0;">
                        <li class="category-item active" data-category="all" style="padding: 8px 12px; margin: 2px 0; cursor: pointer; border-radius: 4px; background: #444;">
                            <span>All Topics</span>
                        </li>
                        <li class="category-item" data-category="general" style="padding: 8px 12px; margin: 2px 0; cursor: pointer; border-radius: 4px;">
                            <span>General</span>
                        </li>
                        <li class="category-item" data-category="tools" style="padding: 8px 12px; margin: 2px 0; cursor: pointer; border-radius: 4px;">
                            <span>Tools</span>
                        </li>
                        <li class="category-item" data-category="guides" style="padding: 8px 12px; margin: 2px 0; cursor: pointer; border-radius: 4px;">
                            <span>Guides</span>
                        </li>
                        <li class="category-item" data-category="reference" style="padding: 8px 12px; margin: 2px 0; cursor: pointer; border-radius: 4px;">
                            <span>Reference</span>
                        </li>
                    </ul>

                    <h3 style="margin: 25px 0 15px 0; color: #ccc; font-size: 14px; text-transform: uppercase;">Quick Links</h3>
                    <ul id="help-quick-links" style="list-style: none; padding: 0; margin: 0;">
                        <li class="doc-link" data-doc="overview" style="padding: 6px 12px; margin: 2px 0; cursor: pointer; border-radius: 4px; font-size: 13px; color: #00ff88;">
                            → Getting Started
                        </li>
                        <li class="doc-link" data-doc="shortcuts" style="padding: 6px 12px; margin: 2px 0; cursor: pointer; border-radius: 4px; font-size: 13px; color: #00ff88;">
                            → Keyboard Shortcuts
                        </li>
                        <li class="doc-link" data-doc="troubleshooting" style="padding: 6px 12px; margin: 2px 0; cursor: pointer; border-radius: 4px; font-size: 13px; color: #00ff88;">
                            → Troubleshooting
                        </li>
                    </ul>
                </div>

                <div class="help-main" style="flex: 1; overflow-y: auto; padding-right: 10px;">
                    <div id="help-article" style="line-height: 1.6;">
                        <!-- Documentation content will be displayed here -->
                    </div>
                </div>
            </div>
            <style>
                .help-main h3 {
                    color: #00ff88;
                    margin: 20px 0 10px 0;
                    font-size: 18px;
                }
                
                .help-main h4 {
                    color: #ffa500;
                    margin: 15px 0 8px 0;
                    font-size: 16px;
                }
                
                .help-main h5 {
                    color: #87ceeb;
                    margin: 10px 0 5px 0;
                    font-size: 14px;
                }
                
                .help-main p {
                    margin: 8px 0;
                    color: #ddd;
                }
                
                .help-main ul, .help-main ol {
                    margin: 8px 0;
                    padding-left: 25px;
                    color: #ddd;
                }
                
                .help-main li {
                    margin: 4px 0;
                }
                
                .help-main code {
                    background: #333;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-family: 'Consolas', 'Monaco', monospace;
                    font-size: 13px;
                }
                
                .help-main pre {
                    background: #222;
                    padding: 12px;
                    border-radius: 6px;
                    overflow-x: auto;
                    margin: 10px 0;
                    border: 1px solid #444;
                }
                
                .help-main kbd {
                    background: #444;
                    padding: 2px 6px;
                    border-radius: 3px;
                    border: 1px solid #666;
                    font-family: monospace;
                    font-size: 12px;
                    box-shadow: 0 2px 0 #222;
                }
                
                .category-item:hover, .doc-link:hover {
                    background: #555 !important;
                }
                
                .category-item.active {
                    background: #444 !important;
                    color: #00ff88;
                }
                
                ::-webkit-scrollbar {
                    width: 8px;
                }
                
                ::-webkit-scrollbar-track {
                    background: #222;
                }
                
                ::-webkit-scrollbar-thumb {
                    background: #555;
                    border-radius: 4px;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: #666;
                }
            </style>
        `;
    }

    setupEventHandlers(): void {
        document.getElementById('close-help')?.addEventListener('click', () => {
            this.hide();
        });

        // カテゴリ選択
        document.getElementById('help-categories')?.addEventListener('click', (e) => {
            const item = (e.target as HTMLElement).closest('.category-item') as HTMLElement;
            if (item) {
                this.selectCategory(item.dataset.category!);
            }
        });

        // ドキュメントリンク
        document.addEventListener('click', (e) => {
            const docLink = (e.target as HTMLElement).closest('.doc-link') as HTMLElement;
            if (docLink) {
                const docId = docLink.dataset.doc;
                if (docId) {
                    this.showDocument(docId);
                }
            }
        });

        // 検索
        const searchInput = document.getElementById('help-search-input') as HTMLInputElement;
        searchInput?.addEventListener('input', (e) => {
            this.handleSearch((e.target as HTMLInputElement).value);
        });

        searchInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideSearchResults();
            }
        });

        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1' || (e.ctrlKey && e.key === 'h')) {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    show(): void {
        this.isVisible = true;
        if (this.helpPanel) {
            this.helpPanel.style.display = 'block';
            this.showDocument('overview'); // デフォルトでOverviewを表示
        }
    }

    hide(): void {
        this.isVisible = false;
        if (this.helpPanel) {
            this.helpPanel.style.display = 'none';
            this.hideSearchResults();
        }
    }

    toggle(): void {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    selectCategory(category: string): void {
        // カテゴリボタンの状態更新
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
            (item as HTMLElement).style.background = '';
        });

        const selectedItem = document.querySelector(`[data-category="${category}"]`) as HTMLElement;
        if (selectedItem) {
            selectedItem.classList.add('active');
            selectedItem.style.background = '#444';
        }

        // ドキュメント一覧を表示
        this.showCategoryDocuments(category);
    }

    showCategoryDocuments(category: string): void {
        const docs = category === 'all' ? 
            Array.from(this.docs.values()) :
            Array.from(this.docs.values()).filter(doc => doc.category === category);

        const content = `
            <h3>Documents in ${category === 'all' ? 'All Categories' : category}</h3>
            <div class="doc-list">
                ${docs.map(doc => `
                    <div class="doc-item" style="background: #333; padding: 15px; margin: 10px 0; border-radius: 8px; cursor: pointer;"
                         onclick="window.debugDocs.showDocument('${doc.id}')">
                        <h4 style="margin: 0 0 5px 0; color: #00ff88;">${doc.title}</h4>
                        <p style="margin: 0; color: #ccc; font-size: 13px;">
                            Category: ${doc.category} | Keywords: ${doc.keywords.join(', ')}
                        </p>
                    </div>
                `).join('')}
            </div>
        `;

        const helpArticle = document.getElementById('help-article');
        if (helpArticle) {
            helpArticle.innerHTML = content;
        }
    }

    showDocument(docId: string): void {
        const doc = this.docs.get(docId);
        if (!doc) {
            this.showError('Document not found');
            return;
        }

        const helpArticle = document.getElementById('help-article');
        if (helpArticle) {
            helpArticle.innerHTML = doc.content;
        }

        // コンテキストヘルプを更新
        this.contextualHelp.updateContext(docId, doc);
    }

    handleSearch(query: string): void {
        if (!query || query.length < 2) {
            this.hideSearchResults();
            return;
        }

        const results = this.searchEngine.search(query);
        this.showSearchResults(results);
    }

    showSearchResults(results: SearchResult[]): void {
        const resultsDiv = document.getElementById('search-results');
        if (!resultsDiv) return;

        if (results.length === 0) {
            resultsDiv.innerHTML = '<div style="padding: 10px; color: #ccc;">No results found</div>';
        } else {
            resultsDiv.innerHTML = results.map(result => `
                <div class="search-result-item" style="padding: 10px; cursor: pointer; border-bottom: 1px solid #444;"
                     onclick="window.debugDocs.showDocument('${result.docId}'); window.debugDocs.hideSearchResults();">
                    <div style="font-weight: bold; color: #00ff88;">${result.title}</div>
                    <div style="font-size: 12px; color: #ccc;">${result.excerpt}</div>
                    <div style="font-size: 11px; color: #888; margin-top: 2px;">Score: ${result.score.toFixed(2)}</div>
                </div>
            `).join('');
        }

        resultsDiv.style.display = 'block';
    }

    hideSearchResults(): void {
        const resultsDiv = document.getElementById('search-results');
        if (resultsDiv) {
            resultsDiv.style.display = 'none';
        }
    }

    showError(message: string): void {
        const helpArticle = document.getElementById('help-article');
        if (helpArticle) {
            helpArticle.innerHTML = `
                <div style="text-align: center; padding: 50px; color: #ff6b6b;">
                    <h3>Error</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    // コンテキストヘルプAPI
    getContextualHelp(context: string): ContextualHelpResult {
        return this.contextualHelp.getHelp(context);
    }

    getSuggestedDocs(context: string): string[] {
        return this.contextualHelp.getSuggestedDocs(context);
    }

    // ドキュメント管理API
    getDocument(docId: string): DocumentationItem | undefined {
        return this.docs.get(docId);
    }

    getAllDocuments(): DocumentationItem[] {
        return Array.from(this.docs.values());
    }

    getDocumentsByCategory(category: string): DocumentationItem[] {
        return Array.from(this.docs.values()).filter(doc => doc.category === category);
    }

    updateDocument(docId: string, updates: Partial<DocumentationItem>): void {
        const doc = this.docs.get(docId);
        if (doc) {
            Object.assign(doc, updates, { lastUpdated: Date.now() });
            this.searchEngine.reindexDocument(docId, doc);
        }
    }

    // 検索API
    search(query: string, options: SearchOptions = {}): SearchResult[] {
        return this.searchEngine.search(query, options);
    }

    // クリーンアップ
    destroy(): void {
        if (this.helpPanel && this.helpPanel.parentNode) {
            this.helpPanel.parentNode.removeChild(this.helpPanel);
        }
        this.docs.clear();
        this.searchEngine?.destroy?.();
        this.contextualHelp?.destroy?.();
    }
}

/**
 * Documentation Search Engine
 * ドキュメント検索エンジン
 */
class DocumentationSearchEngine {
    private index: Map<string, Map<string, TokenInfo>>;
    private stopWords: Set<string>;

    constructor() {
        this.index = new Map<string, Map<string, TokenInfo>>();
        this.stopWords = new Set([
            'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'as', 'are',
            'の', 'は', 'が', 'を', 'に', 'で', 'と', 'も', 'や', 'から'
        ]);
    }

    indexDocument(docId: string, doc: DocumentationItem): void {
        const tokens = this.tokenize(doc.title + ' ' + doc.content + ' ' + doc.keywords.join(' '));
        tokens.forEach(token => {
            if (!this.index.has(token)) {
                this.index.set(token, new Map<string, TokenInfo>());
            }
            
            const tokenIndex = this.index.get(token)!;
            const existing = tokenIndex.get(docId);
            tokenIndex.set(docId, {
                docId: docId,
                title: doc.title,
                frequency: (existing?.frequency || 0) + 1
            });
        });
    }

    reindexDocument(docId: string, doc: DocumentationItem): void {
        // 既存のインデックスを削除
        this.index.forEach(tokenIndex => {
            tokenIndex.delete(docId);
        });
        
        // 再インデックス
        this.indexDocument(docId, doc);
    }

    tokenize(text: string): string[] {
        return text
            .toLowerCase()
            .replace(/[^\w\s\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, ' ')
            .split(/\s+/)
            .filter(token => token.length > 1 && !this.stopWords.has(token));
    }

    search(query: string, options: SearchOptions = {}): SearchResult[] {
        const queryTokens = this.tokenize(query);
        const results = new Map<string, SearchResult>();

        queryTokens.forEach(token => {
            const tokenIndex = this.index.get(token);
            if (tokenIndex) {
                tokenIndex.forEach((docInfo, docId) => {
                    if (!results.has(docId)) {
                        results.set(docId, {
                            docId: docId,
                            title: docInfo.title,
                            score: 0,
                            matches: [],
                            excerpt: ''
                        });
                    }
                    
                    const result = results.get(docId)!;
                    result.score += docInfo.frequency;
                    result.matches.push(token);
                });
            }

            // 部分一致検索
            this.index.forEach((tokenIndex, indexToken) => {
                if (indexToken.includes(token)) {
                    tokenIndex.forEach((docInfo, docId) => {
                        if (!results.has(docId)) {
                            results.set(docId, {
                                docId: docId,
                                title: docInfo.title,
                                score: 0,
                                matches: [],
                                excerpt: ''
                            });
                        }
                        
                        const result = results.get(docId)!;
                        result.score += docInfo.frequency * 0.5; // 部分一致は低いスコア
                        result.matches.push(indexToken);
                    });
                }
            });
        });

        // スコアでソート
        const sortedResults = Array.from(results.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, options.limit || 10);

        // 抜粋を生成
        sortedResults.forEach(result => {
            result.excerpt = this.generateExcerpt(result.docId, queryTokens);
        });

        return sortedResults;
    }

    generateExcerpt(_docId: string, queryTokens: string[]): string {
        // 簡単な抜粋生成（実際の実装ではより洗練された方法を使用）
        return 'Relevant documentation about ' + queryTokens.join(', ');
    }

    destroy(): void {
        this.index.clear();
    }
}

/**
 * Contextual Help Provider
 * コンテキストに応じたヘルプ提供システム
 */
class ContextualHelpProvider {
    private currentContext: ContextInfo | null;
    private contextMappings: Map<string, string[]>;

    constructor() {
        this.currentContext = null;
        this.contextMappings = new Map<string, string[]>();
        this.setupContextMappings();
    }

    setupContextMappings(): void {
        this.contextMappings.set('performance-issues', [
            'performance-monitor',
            'best-practices',
            'troubleshooting'
        ]);

        this.contextMappings.set('error-occurred', [
            'error-reporter',
            'troubleshooting',
            'api-reference'
        ]);

        this.contextMappings.set('test-failure', [
            'test-support',
            'troubleshooting',
            'best-practices'
        ]);

        this.contextMappings.set('console-usage', [
            'developer-console',
            'shortcuts',
            'api-reference'
        ]);

        this.contextMappings.set('visual-debugging', [
            'visual-debugger',
            'shortcuts',
            'best-practices'
        ]);
    }

    updateContext(docId: string, doc: DocumentationItem): void {
        this.currentContext = {
            docId: docId,
            doc: doc,
            timestamp: Date.now()
        };
    }

    getHelp(context: string): ContextualHelpResult {
        const relatedDocs = this.contextMappings.get(context) || [];
        return {
            context: context,
            suggestedDocs: relatedDocs,
            currentDoc: this.currentContext?.docId,
            tips: this.getContextualTips(context)
        };
    }

    getSuggestedDocs(context: string): string[] {
        return this.contextMappings.get(context) || [];
    }

    getContextualTips(context: string): string[] {
        const tips: Record<string, string[]> = {
            'performance-issues': [
                'Check FPS and frame time in Performance Monitor',
                'Run benchmarks to identify bottlenecks',
                'Enable performance warnings for proactive monitoring'
            ],
            'error-occurred': [
                'Check Error Reporter for detailed stack traces',
                'Look for similar errors in history',
                'Use suggested fixes from error analysis'
            ],
            'test-failure': [
                'Analyze failure patterns in Test Support Tools',
                'Generate mock data for isolated testing',
                'Check test coverage for gaps'
            ],
            'console-usage': [
                'Use Tab for command auto-completion',
                'Type help() for available commands',
                'Use up/down arrows for command history'
            ],
            'visual-debugging': [
                'Enable hitbox display for collision debugging',
                'Use frame-by-frame stepping for detailed analysis',
                'Save and restore game states for testing'
            ]
        };

        return tips[context] || [];
    }

    destroy(): void {
        this.currentContext = null;
        this.contextMappings.clear();
    }
}

// グローバルアクセス用（デバッグ目的）
(window as any).DocumentationSystem = DocumentationSystem;
(window as any).debugDocs = null; // インスタンスは後で設定