/**
 * Contextual Help System
 * 状況に応じた動的ヘルプとサポート機能
 */

export class ContextualHelpSystem {
    constructor(documentationSystem) {
        this.documentationSystem = documentationSystem;
        this.helpTriggers = new Map();
        this.activeHelp = new Map();
        this.helpHistory = [];
        this.tooltips = new Map();
        this.interactiveGuides = new Map();
        
        this.initialize();
    }

    initialize() {
        this.setupHelpTriggers();
        this.setupTooltips();
        this.setupInteractiveGuides();
        this.attachEventListeners();
    }

    setupHelpTriggers() {
        // エラー関連のトリガー
        this.helpTriggers.set('error-null-reference', {
            condition: (context) => context.error?.type === 'null_reference',
            helpContent: {
                title: 'Null Reference Error Help',
                quick: 'オブジェクトまたはプロパティがnullまたはundefinedです',
                detailed: `
                    <h4>Null Reference Errorの解決方法</h4>
                    <ol>
                        <li>エラーが発生した箇所のオブジェクトを確認</li>
                        <li>オブジェクトの初期化が正しく行われているか確認</li>
                        <li>非同期処理の場合、タイミングの問題を確認</li>
                        <li>オプショナルチェーニング（?.）の使用を検討</li>
                    </ol>
                    <pre><code>// 安全なアクセス方法
const value = object?.property?.method?.();
// または
const value = object && object.property ? object.property : defaultValue;</code></pre>
                `,
                relatedDocs: ['troubleshooting', 'best-practices'],
                actions: [
                    { label: 'エラー詳細を表示', action: 'showErrorDetails' },
                    { label: 'スタックトレースを確認', action: 'showStackTrace' },
                    { label: 'コードを修正', action: 'suggestFix' }
                ]
            }
        });

        this.helpTriggers.set('performance-low-fps', {
            condition: (context) => context.fps < 30,
            helpContent: {
                title: 'Low FPS Warning',
                quick: 'フレームレートが低下しています（現在: {fps} FPS）',
                detailed: `
                    <h4>パフォーマンス改善の方法</h4>
                    <ul>
                        <li><strong>レンダリング最適化</strong>
                            <ul>
                                <li>不要な描画処理を削減</li>
                                <li>Canvas の clear 範囲を最小化</li>
                                <li>オフスクリーンレンダリングを活用</li>
                            </ul>
                        </li>
                        <li><strong>オブジェクト管理</strong>
                            <ul>
                                <li>オブジェクトプーリングを使用</li>
                                <li>画面外のオブジェクトを非アクティブ化</li>
                                <li>バブル数の上限を調整</li>
                            </ul>
                        </li>
                        <li><strong>エフェクト調整</strong>
                            <ul>
                                <li>パーティクル数を削減</li>
                                <li>エフェクト品質を下げる</li>
                                <li>不要なアニメーションを無効化</li>
                            </ul>
                        </li>
                    </ul>
                `,
                relatedDocs: ['performance-monitor', 'best-practices'],
                actions: [
                    { label: 'パフォーマンスプロファイル', action: 'runProfile' },
                    { label: 'エフェクト品質を下げる', action: 'lowerQuality' },
                    { label: 'ベンチマークを実行', action: 'runBenchmark' }
                ]
            }
        });

        this.helpTriggers.set('test-failure', {
            condition: (context) => context.testFailed === true,
            helpContent: {
                title: 'Test Failure Help',
                quick: 'テスト "{testName}" が失敗しました',
                detailed: `
                    <h4>テスト失敗の分析</h4>
                    <p>失敗したテスト: <strong>{testName}</strong></p>
                    <p>エラー: <code>{errorMessage}</code></p>
                    
                    <h5>デバッグ手順:</h5>
                    <ol>
                        <li>エラーメッセージとスタックトレースを確認</li>
                        <li>テストの前提条件が満たされているか確認</li>
                        <li>モックデータが適切か検証</li>
                        <li>非同期処理のタイミングを確認</li>
                        <li>依存関係が正しく設定されているか確認</li>
                    </ol>
                    
                    <h5>よくある原因:</h5>
                    <ul>
                        <li>初期化の順序問題</li>
                        <li>非同期処理の待機漏れ</li>
                        <li>モックの設定ミス</li>
                        <li>環境依存の問題</li>
                    </ul>
                `,
                relatedDocs: ['test-support', 'troubleshooting'],
                actions: [
                    { label: '失敗分析を表示', action: 'analyzeFailure' },
                    { label: 'デバッグモードで再実行', action: 'rerunDebug' },
                    { label: '類似の失敗を検索', action: 'findSimilar' }
                ]
            }
        });

        this.helpTriggers.set('memory-high', {
            condition: (context) => context.memoryUsage > 150, // MB
            helpContent: {
                title: 'High Memory Usage Warning',
                quick: 'メモリ使用量が高くなっています（{memoryUsage} MB）',
                detailed: `
                    <h4>メモリ使用量の削減方法</h4>
                    <ul>
                        <li><strong>オブジェクトのクリーンアップ</strong>
                            <ul>
                                <li>使用しないオブジェクトを削除</li>
                                <li>イベントリスナーを適切に削除</li>
                                <li>大きな配列やオブジェクトをクリア</li>
                            </ul>
                        </li>
                        <li><strong>リソース管理</strong>
                            <ul>
                                <li>画像やオーディオリソースを解放</li>
                                <li>不要なキャッシュをクリア</li>
                                <li>オブジェクトプールのサイズを調整</li>
                            </ul>
                        </li>
                        <li><strong>メモリリークの確認</strong>
                            <ul>
                                <li>循環参照をチェック</li>
                                <li>グローバル変数の使用を最小化</li>
                                <li>クロージャーの適切な使用</li>
                            </ul>
                        </li>
                    </ul>
                `,
                relatedDocs: ['performance-monitor', 'best-practices'],
                actions: [
                    { label: 'メモリプロファイル', action: 'memoryProfile' },
                    { label: 'ガベージコレクション実行', action: 'forceGC' },
                    { label: 'リソースをクリア', action: 'clearResources' }
                ]
            }
        });

        this.helpTriggers.set('console-command-error', {
            condition: (context) => context.commandError === true,
            helpContent: {
                title: 'Console Command Error',
                quick: 'コマンド実行エラー: {command}',
                detailed: `
                    <h4>コマンドエラーの解決</h4>
                    <p>実行したコマンド: <code>{command}</code></p>
                    <p>エラー: <code>{errorMessage}</code></p>
                    
                    <h5>考えられる原因:</h5>
                    <ul>
                        <li>コマンドの構文エラー</li>
                        <li>存在しないコマンドまたはメソッド</li>
                        <li>パラメータの型または数が不正</li>
                        <li>実行権限の不足</li>
                    </ul>
                    
                    <h5>ヒント:</h5>
                    <ul>
                        <li><code>help()</code> で利用可能なコマンド一覧を表示</li>
                        <li>Tab キーで自動補完を使用</li>
                        <li>コマンドの正しい構文を確認</li>
                    </ul>
                `,
                relatedDocs: ['developer-console', 'api-reference'],
                actions: [
                    { label: 'コマンドヘルプ', action: 'showCommandHelp' },
                    { label: '類似コマンドを提案', action: 'suggestCommands' },
                    { label: 'APIリファレンス', action: 'showAPIReference' }
                ]
            }
        });
    }

    setupTooltips() {
        // UI要素のツールチップ
        this.tooltips.set('fps-display', {
            content: 'Frames Per Second - 目標は60FPS。30FPS未満は要最適化。',
            position: 'bottom'
        });

        this.tooltips.set('memory-display', {
            content: 'JavaScript ヒープメモリ使用量（MB）。継続的な増加はメモリリークの可能性。',
            position: 'bottom'
        });

        this.tooltips.set('particle-count', {
            content: 'アクティブなパーティクル数。多すぎるとパフォーマンスに影響。',
            position: 'bottom'
        });

        this.tooltips.set('quality-select', {
            content: 'グラフィック品質設定。パフォーマンスが低い場合は下げることを推奨。',
            position: 'right'
        });

        this.tooltips.set('benchmark-button', {
            content: 'システムのパフォーマンステストを実行。ベースライン設定に使用。',
            position: 'left'
        });
    }

    setupInteractiveGuides() {
        // インタラクティブチュートリアル
        this.interactiveGuides.set('first-time-setup', {
            name: 'はじめてのデバッグツール',
            steps: [
                {
                    target: '#debug-panel-toggle',
                    content: 'ここをクリックしてデバッグパネルを開きます',
                    position: 'bottom',
                    action: () => this.highlightElement('#debug-panel-toggle')
                },
                {
                    target: '#performance-tab',
                    content: 'パフォーマンスタブでFPSやメモリ使用量を監視できます',
                    position: 'right',
                    action: () => this.switchToTab('performance')
                },
                {
                    target: '#console-tab',
                    content: 'コンソールタブでゲーム状態を直接操作できます',
                    position: 'right',
                    action: () => this.switchToTab('console')
                },
                {
                    target: '#help-button',
                    content: 'ヘルプボタンで詳細なドキュメントにアクセスできます',
                    position: 'left',
                    action: () => this.showHelpHighlight()
                }
            ]
        });

        this.interactiveGuides.set('performance-optimization', {
            name: 'パフォーマンス最適化ガイド',
            steps: [
                {
                    target: '#fps-monitor',
                    content: 'まず現在のFPSを確認します',
                    position: 'bottom'
                },
                {
                    target: '#run-benchmark',
                    content: 'ベンチマークを実行してボトルネックを特定します',
                    position: 'left',
                    action: () => this.runBenchmark()
                },
                {
                    target: '#quality-settings',
                    content: 'パフォーマンスが低い場合は品質設定を調整します',
                    position: 'right'
                },
                {
                    target: '#performance-report',
                    content: '改善提案を確認して適用します',
                    position: 'top'
                }
            ]
        });
    }

    attachEventListeners() {
        // ヘルプトリガーの監視
        this.startMonitoring();

        // ツールチップの表示
        document.addEventListener('mouseover', (e) => {
            const element = e.target;
            const tooltipKey = element.id || element.className;
            
            if (this.tooltips.has(tooltipKey)) {
                this.showTooltip(element, this.tooltips.get(tooltipKey));
            }
        });

        document.addEventListener('mouseout', (e) => {
            this.hideTooltip();
        });

        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                this.showContextualHelp();
            }
            
            if (e.ctrlKey && e.key === '?') {
                e.preventDefault();
                this.showQuickHelp();
            }
        });
    }

    startMonitoring() {
        // 定期的にコンテキストをチェック
        setInterval(() => {
            const context = this.getCurrentContext();
            this.checkHelpTriggers(context);
        }, 1000);
    }

    getCurrentContext() {
        // 現在のシステム状態を収集
        return {
            fps: this.getFPS(),
            memoryUsage: this.getMemoryUsage(),
            errorCount: this.getErrorCount(),
            activePanel: this.getActivePanel(),
            lastError: this.getLastError(),
            testStatus: this.getTestStatus()
        };
    }

    checkHelpTriggers(context) {
        this.helpTriggers.forEach((trigger, key) => {
            if (trigger.condition(context) && !this.activeHelp.has(key)) {
                this.showTriggeredHelp(key, trigger.helpContent, context);
            }
        });
    }

    showTriggeredHelp(key, helpContent, context) {
        // ヘルプコンテンツを準備
        const processedContent = this.processHelpContent(helpContent, context);
        
        // ヘルプ通知を表示
        const notification = this.createHelpNotification(processedContent);
        document.body.appendChild(notification);
        
        // アクティブヘルプに追加
        this.activeHelp.set(key, {
            notification: notification,
            content: processedContent,
            timestamp: Date.now()
        });

        // 履歴に追加
        this.helpHistory.push({
            key: key,
            timestamp: Date.now(),
            context: context,
            accepted: false
        });
    }

    processHelpContent(helpContent, context) {
        // コンテキスト変数を置換
        const processed = { ...helpContent };
        
        ['quick', 'detailed'].forEach(field => {
            if (processed[field]) {
                processed[field] = processed[field].replace(/\{(\w+)\}/g, (match, key) => {
                    return context[key] || match;
                });
            }
        });

        return processed;
    }

    createHelpNotification(helpContent) {
        const notification = document.createElement('div');
        notification.className = 'contextual-help-notification';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid #00ff88;
            border-radius: 8px;
            padding: 15px;
            color: white;
            font-family: 'Segoe UI', sans-serif;
            font-size: 14px;
            z-index: 25000;
            box-shadow: 0 4px 20px rgba(0, 255, 136, 0.3);
            animation: slideIn 0.3s ease-out;
        `;

        notification.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h4 style="margin: 0; color: #00ff88; display: flex; align-items: center;">
                    <span style="margin-right: 8px;">💡</span>
                    ${helpContent.title}
                </h4>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: #ccc; cursor: pointer; font-size: 18px;">×</button>
            </div>
            
            <p style="margin: 0 0 10px 0; color: #ddd;">${helpContent.quick}</p>
            
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button onclick="window.contextualHelp.showDetailedHelp('${helpContent.title}')" 
                        style="flex: 1; padding: 8px; background: #00ff88; color: black; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                    詳細を見る
                </button>
                <button onclick="window.contextualHelp.dismissHelp(this)" 
                        style="flex: 1; padding: 8px; background: #444; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    閉じる
                </button>
            </div>
            
            <style>
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            </style>
        `;

        return notification;
    }

    showDetailedHelp(title) {
        const activeHelp = Array.from(this.activeHelp.values())
            .find(help => help.content.title === title);
        
        if (activeHelp) {
            this.showHelpDialog(activeHelp.content);
        }
    }

    showHelpDialog(helpContent) {
        const dialog = document.createElement('div');
        dialog.className = 'contextual-help-dialog';
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            max-width: 90vw;
            max-height: 80vh;
            background: rgba(0, 0, 0, 0.95);
            border: 2px solid #00ff88;
            border-radius: 12px;
            padding: 20px;
            color: white;
            font-family: 'Segoe UI', sans-serif;
            z-index: 26000;
            overflow-y: auto;
        `;

        dialog.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #00ff88;">${helpContent.title}</h3>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: #ccc; cursor: pointer; font-size: 24px;">×</button>
            </div>
            
            <div style="line-height: 1.6;">
                ${helpContent.detailed}
            </div>
            
            ${helpContent.actions ? `
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #444;">
                    <h4 style="color: #ffa500; margin-bottom: 10px;">アクション:</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        ${helpContent.actions.map(action => `
                            <button onclick="window.contextualHelp.executeAction('${action.action}')"
                                    style="padding: 8px 16px; background: #444; color: white; border: 1px solid #666; border-radius: 4px; cursor: pointer;">
                                ${action.label}
                            </button>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${helpContent.relatedDocs ? `
                <div style="margin-top: 20px;">
                    <h4 style="color: #87ceeb; margin-bottom: 10px;">関連ドキュメント:</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        ${helpContent.relatedDocs.map(docId => `
                            <a href="#" onclick="window.contextualHelp.openDocument('${docId}'); return false;"
                               style="color: #00ff88; text-decoration: none; padding: 5px 10px; background: #333; border-radius: 4px;">
                                ${docId}
                            </a>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;

        document.body.appendChild(dialog);
    }

    showTooltip(element, tooltip) {
        const tooltipEl = document.createElement('div');
        tooltipEl.className = 'contextual-tooltip';
        tooltipEl.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 13px;
            border: 1px solid #444;
            z-index: 30000;
            pointer-events: none;
            max-width: 250px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        `;
        tooltipEl.textContent = tooltip.content;

        document.body.appendChild(tooltipEl);

        // 位置を計算
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltipEl.getBoundingClientRect();
        
        let top, left;
        switch (tooltip.position) {
            case 'top':
                top = rect.top - tooltipRect.height - 10;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'bottom':
                top = rect.bottom + 10;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.left - tooltipRect.width - 10;
                break;
            case 'right':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.right + 10;
                break;
        }

        tooltipEl.style.top = `${top}px`;
        tooltipEl.style.left = `${left}px`;

        this.currentTooltip = tooltipEl;
    }

    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    startInteractiveGuide(guideName) {
        const guide = this.interactiveGuides.get(guideName);
        if (!guide) return;

        this.currentGuide = {
            guide: guide,
            currentStep: 0
        };

        this.showGuideStep(0);
    }

    showGuideStep(stepIndex) {
        if (!this.currentGuide) return;
        
        const guide = this.currentGuide.guide;
        const step = guide.steps[stepIndex];
        
        if (!step) {
            this.completeGuide();
            return;
        }

        // 前のステップのハイライトを削除
        this.removeHighlights();

        // ステップのアクションを実行
        if (step.action) {
            step.action();
        }

        // ガイドバブルを表示
        this.showGuideBubble(step, stepIndex);
    }

    showGuideBubble(step, stepIndex) {
        const bubble = document.createElement('div');
        bubble.className = 'guide-bubble';
        bubble.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.95);
            color: white;
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #00ff88;
            max-width: 300px;
            z-index: 31000;
            box-shadow: 0 4px 20px rgba(0, 255, 136, 0.3);
        `;

        const totalSteps = this.currentGuide.guide.steps.length;
        
        bubble.innerHTML = `
            <p style="margin: 0 0 10px 0;">${step.content}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                <span style="color: #888; font-size: 12px;">ステップ ${stepIndex + 1} / ${totalSteps}</span>
                <div>
                    ${stepIndex > 0 ? `
                        <button onclick="window.contextualHelp.previousGuideStep()"
                                style="padding: 5px 10px; background: #444; color: white; border: none; border-radius: 4px; margin-right: 5px; cursor: pointer;">
                            前へ
                        </button>
                    ` : ''}
                    <button onclick="window.contextualHelp.nextGuideStep()"
                            style="padding: 5px 10px; background: #00ff88; color: black; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                        ${stepIndex < totalSteps - 1 ? '次へ' : '完了'}
                    </button>
                </div>
            </div>
        `;

        // ターゲット要素の近くに配置
        const target = document.querySelector(step.target);
        if (target) {
            const rect = target.getBoundingClientRect();
            
            // ハイライト
            target.style.outline = '2px solid #00ff88';
            target.style.outlineOffset = '5px';
            
            // バブルの位置を計算
            bubble.style.position = 'fixed';
            switch (step.position) {
                case 'top':
                    bubble.style.bottom = `${window.innerHeight - rect.top + 10}px`;
                    bubble.style.left = `${rect.left}px`;
                    break;
                case 'bottom':
                    bubble.style.top = `${rect.bottom + 10}px`;
                    bubble.style.left = `${rect.left}px`;
                    break;
                case 'left':
                    bubble.style.top = `${rect.top}px`;
                    bubble.style.right = `${window.innerWidth - rect.left + 10}px`;
                    break;
                case 'right':
                    bubble.style.top = `${rect.top}px`;
                    bubble.style.left = `${rect.right + 10}px`;
                    break;
            }
        }

        document.body.appendChild(bubble);
        this.currentGuideBubble = bubble;
    }

    nextGuideStep() {
        if (!this.currentGuide) return;
        
        this.currentGuide.currentStep++;
        this.showGuideStep(this.currentGuide.currentStep);
    }

    previousGuideStep() {
        if (!this.currentGuide || this.currentGuide.currentStep === 0) return;
        
        this.currentGuide.currentStep--;
        this.showGuideStep(this.currentGuide.currentStep);
    }

    completeGuide() {
        this.removeHighlights();
        if (this.currentGuideBubble) {
            this.currentGuideBubble.remove();
            this.currentGuideBubble = null;
        }
        
        // 完了メッセージ
        this.showNotification('ガイド完了！', 'success');
        
        this.currentGuide = null;
    }

    removeHighlights() {
        document.querySelectorAll('[style*="outline"]').forEach(el => {
            el.style.outline = '';
            el.style.outlineOffset = '';
        });
        
        if (this.currentGuideBubble) {
            this.currentGuideBubble.remove();
            this.currentGuideBubble = null;
        }
    }

    // アクション実行
    executeAction(actionName) {
        const actions = {
            showErrorDetails: () => this.showErrorDetails(),
            showStackTrace: () => this.showStackTrace(),
            suggestFix: () => this.suggestFix(),
            runProfile: () => this.runPerformanceProfile(),
            lowerQuality: () => this.lowerGraphicsQuality(),
            runBenchmark: () => this.runBenchmark(),
            analyzeFailure: () => this.analyzeTestFailure(),
            rerunDebug: () => this.rerunTestInDebugMode(),
            findSimilar: () => this.findSimilarFailures(),
            memoryProfile: () => this.runMemoryProfile(),
            forceGC: () => this.forceGarbageCollection(),
            clearResources: () => this.clearUnusedResources(),
            showCommandHelp: () => this.showCommandHelp(),
            suggestCommands: () => this.suggestSimilarCommands(),
            showAPIReference: () => this.showAPIReference()
        };

        const action = actions[actionName];
        if (action) {
            action();
        }
    }

    // ヘルプAPI
    showContextualHelp() {
        const context = this.getCurrentContext();
        const relevantHelps = [];

        this.helpTriggers.forEach((trigger, key) => {
            if (trigger.condition(context)) {
                relevantHelps.push({
                    key: key,
                    content: this.processHelpContent(trigger.helpContent, context)
                });
            }
        });

        if (relevantHelps.length > 0) {
            this.showHelpDialog(relevantHelps[0].content);
        } else {
            this.showQuickHelp();
        }
    }

    showQuickHelp() {
        const quickHelp = {
            title: 'クイックヘルプ',
            detailed: `
                <h4>デバッグツールの使い方</h4>
                <ul>
                    <li><kbd>F1</kbd> - コンテキストヘルプを表示</li>
                    <li><kbd>Ctrl+?</kbd> - このクイックヘルプを表示</li>
                    <li><kbd>Ctrl+Shift+D</kbd> - デバッグパネルを開く</li>
                    <li><kbd>Ctrl+Shift+C</kbd> - コンソールを開く</li>
                </ul>
                
                <h4>現在の状態</h4>
                <ul>
                    <li>FPS: ${this.getFPS()}</li>
                    <li>メモリ: ${this.getMemoryUsage()} MB</li>
                    <li>エラー数: ${this.getErrorCount()}</li>
                </ul>
                
                <p>詳細なヘルプは <a href="#" onclick="window.debugDocs.show(); return false;">ドキュメント</a> を参照してください。</p>
            `,
            actions: [
                { label: 'ドキュメントを開く', action: 'openDocs' },
                { label: 'チュートリアルを開始', action: 'startTutorial' }
            ]
        };

        this.showHelpDialog(quickHelp);
    }

    // ユーティリティメソッド
    getFPS() {
        return window.gameEngine?.performanceOptimizer?.getCurrentFPS?.() || 0;
    }

    getMemoryUsage() {
        return performance.memory ? 
            Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 0;
    }

    getErrorCount() {
        return window.gameEngine?.errorHandler?.getErrorCount?.() || 0;
    }

    getActivePanel() {
        return document.querySelector('.debug-panel.active')?.id || 'none';
    }

    getLastError() {
        return window.gameEngine?.errorHandler?.getLastError?.();
    }

    getTestStatus() {
        return window.testSupportTools?.getLatestTestResults?.();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#00ff88' : '#ffa500'};
            color: ${type === 'success' ? 'black' : 'white'};
            border-radius: 4px;
            font-weight: bold;
            z-index: 32000;
            animation: fadeInOut 3s ease-in-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }

    dismissHelp(button) {
        const notification = button.closest('.contextual-help-notification');
        if (notification) {
            notification.remove();
            
            // アクティブヘルプから削除
            this.activeHelp.forEach((help, key) => {
                if (help.notification === notification) {
                    this.activeHelp.delete(key);
                }
            });
        }
    }

    openDocument(docId) {
        if (this.documentationSystem) {
            this.documentationSystem.show();
            this.documentationSystem.showDocument(docId);
        }
    }

    // クリーンアップ
    destroy() {
        this.removeHighlights();
        this.hideTooltip();
        this.activeHelp.forEach(help => {
            if (help.notification && help.notification.parentNode) {
                help.notification.remove();
            }
        });
        this.activeHelp.clear();
        this.helpTriggers.clear();
        this.tooltips.clear();
        this.interactiveGuides.clear();
    }
}

// グローバルアクセス用
window.ContextualHelpSystem = ContextualHelpSystem;