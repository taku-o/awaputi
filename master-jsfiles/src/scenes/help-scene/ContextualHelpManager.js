/**
 * ContextualHelpManager.js
 * 
 * HelpScene内でのコンテキスト依存ヘルプ管理
 * ContextualHelpSystemの機能をHelpSceneに統合するためのマネージャー
 * 
 * @version 1.0.0
 * @since Issue #163 - Task 9: Contextual Help System Integration
 */

import { getLoggingSystem } from '../../core/LoggingSystem.js';

export class ContextualHelpManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.loggingSystem = getLoggingSystem();
        
        // ヘルプトリガー管理
        this.helpTriggers = new Map();
        this.activeHelp = new Map();
        this.helpHistory = [];
        
        // ツールチップ管理
        this.tooltips = new Map();
        this.activeTooltips = new Set();
        
        // インタラクティブガイド管理
        this.interactiveGuides = new Map();
        this.currentGuide = null;
        this.guideStep = 0;
        
        // 状態管理
        this.isMonitoring = false;
        this.currentContext = {};
        
        this.initialize();
    }
    
    /**
     * 初期化処理
     */
    initialize() {
        try {
            this.setupHelpTriggers();
            this.setupTooltips();
            this.setupInteractiveGuides();
            
            this.loggingSystem.info('ContextualHelpManager', 'Contextual help manager initialized');
        } catch (error) {
            this.loggingSystem.error('ContextualHelpManager', 'Initialization error', error);
        }
    }
    
    /**
     * ヘルプトリガーの設定
     */
    setupHelpTriggers() {
        // エラー関連トリガー
        this.helpTriggers.set('error-null-reference', {
            condition: (context) => context.error?.type === 'null_reference',
            priority: 'high',
            helpContent: {
                title: 'Null Reference Error Help',
                quick: 'オブジェクトまたはプロパティがnullまたはundefinedです',
                detailed: this.generateErrorHelpContent('null_reference'),
                category: 'troubleshooting',
                relatedTopics: ['troubleshooting', 'best-practices'],
                actions: [
                    { label: 'エラー詳細を表示', action: 'showErrorDetails' },
                    { label: 'スタックトレースを確認', action: 'showStackTrace' },
                    { label: 'トラブルシューティングガイド', action: 'openTroubleshootingGuide' }
                ]
            }
        });
        
        // パフォーマンス関連トリガー
        this.helpTriggers.set('performance-low-fps', {
            condition: (context) => context.fps && context.fps < 30,
            priority: 'medium',
            helpContent: {
                title: 'パフォーマンス低下の警告',
                quick: `フレームレートが低下しています（現在: ${this.currentContext.fps || 'N/A'} FPS）`,
                detailed: this.generatePerformanceHelpContent(),
                category: 'performance',
                relatedTopics: ['performance', 'troubleshooting'],
                actions: [
                    { label: 'パフォーマンスガイド', action: 'openPerformanceGuide' },
                    { label: 'エフェクト品質を下げる', action: 'lowerEffectQuality' },
                    { label: '設定画面を開く', action: 'openSettings' }
                ]
            }
        });
        
        // ゲーム固有トリガー
        this.helpTriggers.set('gameplay-first-time', {
            condition: (context) => context.isFirstTime === true,
            priority: 'low',
            helpContent: {
                title: '初回ゲームプレイのヘルプ',
                quick: 'BubblePopへようこそ！基本的な遊び方をご説明します。',
                detailed: this.generateFirstTimeHelpContent(),
                category: 'gameplay',
                relatedTopics: ['controls', 'scoring', 'bubbles'],
                actions: [
                    { label: 'チュートリアルを開始', action: 'startTutorial' },
                    { label: '操作方法を確認', action: 'showControls' },
                    { label: 'スコアリングを確認', action: 'showScoring' }
                ]
            }
        });
        
        // ナビゲーション関連トリガー
        this.helpTriggers.set('navigation-help-from-scene', {
            condition: (context) => context.accessMethod && context.accessMethod.includes('keyboard'),
            priority: 'low',
            helpContent: {
                title: 'キーボードナビゲーションヘルプ',
                quick: 'キーボードショートカットを使ってヘルプにアクセスしました。',
                detailed: this.generateKeyboardHelpContent(),
                category: 'navigation',
                relatedTopics: ['controls', 'accessibility'],
                actions: [
                    { label: 'ショートカット一覧', action: 'showShortcuts' },
                    { label: 'アクセシビリティ設定', action: 'openAccessibilitySettings' },
                    { label: 'キーボードガイド', action: 'openKeyboardGuide' }
                ]
            }
        });
    }
    
    /**
     * ツールチップの設定
     */
    setupTooltips() {
        // ヘルプ画面のUI要素用ツールチップ
        this.tooltips.set('help-search', {
            content: '検索キーワードを入力してヘルプ内容を絞り込みます。',
            position: 'bottom',
            trigger: 'hover'
        });
        
        this.tooltips.set('help-category', {
            content: 'カテゴリを選択してヘルプ内容を分類表示します。',
            position: 'right',
            trigger: 'hover'
        });
        
        this.tooltips.set('help-back-button', {
            content: 'ESCキーまたはクリックで前の画面に戻ります。',
            position: 'bottom',
            trigger: 'hover'
        });
        
        this.tooltips.set('help-contextual-indicator', {
            content: 'この内容は現在の状況に応じて表示されています。',
            position: 'top',
            trigger: 'hover'
        });
    }
    
    /**
     * インタラクティブガイドの設定
     */
    setupInteractiveGuides() {
        // 初回ヘルプ利用ガイド
        this.interactiveGuides.set('first-time-help', {
            name: '初回ヘルプ利用ガイド',
            trigger: 'first_help_access',
            steps: [
                {
                    target: '.help-category-list',
                    content: 'まずはカテゴリを選択して、知りたい情報を見つけましょう。',
                    position: 'right',
                    action: () => this.highlightCategories()
                },
                {
                    target: '.help-search-input',
                    content: '検索機能を使って、特定のキーワードでヘルプを検索できます。',
                    position: 'bottom',
                    action: () => this.focusSearchInput()
                },
                {
                    target: '.help-back-button',
                    content: 'ESCキーまたはこのボタンで前の画面に戻れます。',
                    position: 'bottom',
                    action: () => this.highlightBackButton()
                }
            ]
        });
        
        // コンテキストヘルプガイド
        this.interactiveGuides.set('contextual-help-intro', {
            name: 'コンテキストヘルプの紹介',
            trigger: 'contextual_help_first',
            steps: [
                {
                    target: '.help-contextual-content',
                    content: 'この内容は現在の状況に応じて自動的に表示されています。',
                    position: 'top',
                    action: () => this.highlightContextualContent()
                },
                {
                    target: '.help-actions',
                    content: 'これらのアクションで直接問題を解決できます。',
                    position: 'bottom',
                    action: () => this.highlightActions()
                }
            ]
        });
    }
    
    /**
     * コンテキスト分析とヘルプ内容決定
     * @param {Object} contextData - コンテキストデータ
     * @returns {Object|null} 適用すべきヘルプ内容
     */
    analyzeContextAndGetHelp(contextData) {
        try {
            this.currentContext = { ...contextData };
            const relevantHelps = [];
            
            // 全トリガーを評価
            this.helpTriggers.forEach((trigger, key) => {
                if (trigger.condition(this.currentContext)) {
                    relevantHelps.push({
                        key,
                        priority: trigger.priority,
                        content: trigger.helpContent
                    });
                }
            });
            
            // 優先順位でソート（high > medium > low）
            relevantHelps.sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });
            
            if (relevantHelps.length > 0) {
                const selectedHelp = relevantHelps[0];
                this.logHelpUsage(selectedHelp);
                return selectedHelp.content;
            }
            
            return null;
        } catch (error) {
            this.loggingSystem.error('ContextualHelpManager', 'Context analysis error', error);
            return null;
        }
    }
    
    /**
     * ヘルプアクションの実行
     * @param {string} action - アクション名
     * @param {Object} context - 実行コンテキスト
     */
    executeHelpAction(action, context = {}) {
        try {
            this.loggingSystem.info('ContextualHelpManager', `Executing help action: ${action}`);
            
            switch (action) {
                case 'showErrorDetails':
                    this.showErrorDetails(context);
                    break;
                case 'showStackTrace':
                    this.showStackTrace(context);
                    break;
                case 'openTroubleshootingGuide':
                    this.navigateToCategory('troubleshooting');
                    break;
                case 'openPerformanceGuide':
                    this.navigateToCategory('performance');
                    break;
                case 'lowerEffectQuality':
                    this.suggestQualitySettings();
                    break;
                case 'openSettings':
                    this.navigateToSettings();
                    break;
                case 'startTutorial':
                    this.startInteractiveGuide('first-time-help');
                    break;
                case 'showControls':
                    this.navigateToTopic('controls');
                    break;
                case 'showScoring':
                    this.navigateToTopic('scoring');
                    break;
                case 'showShortcuts':
                    this.showKeyboardShortcuts();
                    break;
                case 'openAccessibilitySettings':
                    this.navigateToAccessibilitySettings();
                    break;
                default:
                    this.loggingSystem.warn('ContextualHelpManager', `Unknown action: ${action}`);
            }
        } catch (error) {
            this.loggingSystem.error('ContextualHelpManager', `Action execution error: ${action}`, error);
        }
    }
    
    /**
     * エラーヘルプコンテンツの生成
     */
    generateErrorHelpContent(errorType) {
        return `
            <div class="help-contextual-content">
                <h4>エラーの解決方法</h4>
                <p>Null Reference Errorは、存在しないオブジェクトやプロパティにアクセスしようとした際に発生します。</p>
                <h5>考えられる原因:</h5>
                <ul>
                    <li>オブジェクトの初期化が完了していない</li>
                    <li>非同期処理のタイミング問題</li>
                    <li>存在しないプロパティへのアクセス</li>
                </ul>
                <h5>解決のヒント:</h5>
                <pre><code>// 安全なアクセス方法
const value = object?.property?.method?.();
// または条件チェック
if (object && object.property) {
    const value = object.property;
}</code></pre>
            </div>
        `;
    }
    
    /**
     * パフォーマンスヘルプコンテンツの生成
     */
    generatePerformanceHelpContent() {
        return `
            <div class="help-contextual-content">
                <h4>パフォーマンス改善の方法</h4>
                <p>フレームレートが低下している場合、以下の方法で改善できる可能性があります。</p>
                <h5>即座に試せる対処法:</h5>
                <ul>
                    <li><strong>エフェクト品質を下げる</strong> - 視覚効果を軽量化</li>
                    <li><strong>バブル数を減らす</strong> - 画面上のオブジェクト数を調整</li>
                    <li><strong>ブラウザのタブを閉じる</strong> - メモリを解放</li>
                </ul>
                <h5>根本的な改善:</h5>
                <ul>
                    <li>ブラウザの更新</li>
                    <li>ハードウェアアクセラレーションの有効化</li>
                    <li>他のアプリケーションの終了</li>
                </ul>
            </div>
        `;
    }
    
    /**
     * 初回ユーザーヘルプコンテンツの生成
     */
    generateFirstTimeHelpContent() {
        return `
            <div class="help-contextual-content">
                <h4>BubblePopへようこそ！</h4>
                <p>BubblePopは、バブルをクリックして消していくパズルゲームです。</p>
                <h5>基本的な遊び方:</h5>
                <ol>
                    <li><strong>バブルをクリック</strong> - 同じ色のバブルを消す</li>
                    <li><strong>連鎖を狙う</strong> - 一度に多くのバブルを消すと高得点</li>
                    <li><strong>時間を意識</strong> - 素早くクリアするとボーナス</li>
                </ol>
                <h5>役立つヒント:</h5>
                <ul>
                    <li>角から攻めると連鎖しやすい</li>
                    <li>色の分布を考えて戦略的に</li>
                    <li>スコアは連鎖数と速さで決まる</li>
                </ul>
            </div>
        `;
    }
    
    /**
     * キーボードヘルプコンテンツの生成
     */
    generateKeyboardHelpContent() {
        return `
            <div class="help-contextual-content">
                <h4>キーボードナビゲーション</h4>
                <p>マウスを使わずに、キーボードだけでゲームを操作できます。</p>
                <h5>主要なショートカット:</h5>
                <table class="help-shortcuts-table">
                    <tr><td><kbd>F1</kbd></td><td>コンテキスト依存ヘルプ</td></tr>
                    <tr><td><kbd>Ctrl + H</kbd></td><td>ドキュメントヘルプ</td></tr>
                    <tr><td><kbd>ESC</kbd></td><td>前の画面に戻る</td></tr>
                    <tr><td><kbd>F11</kbd></td><td>フルスクリーン切り替え</td></tr>
                    <tr><td><kbd>Space</kbd></td><td>ゲーム一時停止</td></tr>
                    <tr><td><kbd>F12</kbd></td><td>デバッグ情報表示</td></tr>
                </table>
                <h5>ナビゲーション:</h5>
                <table class="help-shortcuts-table">
                    <tr><td><kbd>↑/↓</kbd></td><td>メニュー項目を選択</td></tr>
                    <tr><td><kbd>←/→</kbd></td><td>カテゴリを切り替え</td></tr>
                    <tr><td><kbd>Enter</kbd></td><td>項目を選択</td></tr>
                    <tr><td><kbd>Tab</kbd></td><td>フォーカス移動</td></tr>
                    <tr><td><kbd>/</kbd></td><td>検索バーにフォーカス</td></tr>
                </table>
                <p><strong>注意:</strong> HキーとSキーのショートカットは削除されました。ヘルプと設定はメニューボタンからアクセスしてください。</p>
            </div>
        `;
    }
    
    // アクション実行メソッド群
    showErrorDetails(context) {
        try {
            this.loggingSystem.info('ContextualHelpManager', 'Showing error details', context);
            
            // エラー詳細を表示するダイアログやパネルの実装
            const errorDetails = {
                error: context.error || this.currentContext.error,
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            // ダイアログ表示の実装
            console.log('Error Details:', errorDetails);
            
            // エラー詳細をHelpContentManagerに送信してカテゴリ表示
            this.navigateToCategory('troubleshooting');
        } catch (error) {
            this.loggingSystem.error('ContextualHelpManager', 'Failed to show error details', error);
        }
    }
    
    showStackTrace(context) {
        try {
            this.loggingSystem.info('ContextualHelpManager', 'Showing stack trace', context);
            
            // スタックトレース情報の取得
            const stackTrace = context.error?.stack || this.currentContext.error?.stack || 'Stack trace not available';
            
            // スタックトレースを表示
            console.group('Stack Trace');
            console.log(stackTrace);
            console.groupEnd();
            
            // トラブルシューティングカテゴリに移動
            this.navigateToCategory('troubleshooting');
        } catch (error) {
            this.loggingSystem.error('ContextualHelpManager', 'Failed to show stack trace', error);
        }
    }
    
    navigateToCategory(category) {
        try {
            this.loggingSystem.info('ContextualHelpManager', `Navigating to category: ${category}`);
            
            // HelpScene内のHelpContentManagerにアクセス
            if (this.gameEngine && this.gameEngine.sceneManager) {
                const currentScene = this.gameEngine.sceneManager.getCurrentScene();
                if (currentScene && currentScene.helpContentManager) {
                    currentScene.helpContentManager.setCategory(category);
                    return true;
                }
            }
            
            this.loggingSystem.warn('ContextualHelpManager', 'Could not access HelpContentManager for category navigation');
            return false;
        } catch (error) {
            this.loggingSystem.error('ContextualHelpManager', 'Failed to navigate to category', error);
            return false;
        }
    }
    
    navigateToTopic(topic) {
        try {
            this.loggingSystem.info('ContextualHelpManager', `Navigating to topic: ${topic}`);
            
            // HelpScene内のHelpContentManagerにアクセス
            if (this.gameEngine && this.gameEngine.sceneManager) {
                const currentScene = this.gameEngine.sceneManager.getCurrentScene();
                if (currentScene && currentScene.helpContentManager) {
                    // トピックによってカテゴリを推測
                    const topicCategoryMap = {
                        'controls': 'gameplay',
                        'scoring': 'gameplay', 
                        'shortcuts': 'controls',
                        'troubleshooting': 'troubleshooting',
                        'performance': 'troubleshooting'
                    };
                    
                    const category = topicCategoryMap[topic] || 'gameplay';
                    currentScene.helpContentManager.setCategory(category);
                    return true;
                }
            }
            
            this.loggingSystem.warn('ContextualHelpManager', 'Could not access HelpContentManager for topic navigation');
            return false;
        } catch (error) {
            this.loggingSystem.error('ContextualHelpManager', 'Failed to navigate to topic', error);
            return false;
        }
    }
    
    navigateToSettings() {
        try {
            this.loggingSystem.info('ContextualHelpManager', 'Navigating to settings');
            
            // SceneManagerを使用して設定画面に移動
            if (this.gameEngine && this.gameEngine.sceneManager) {
                return this.gameEngine.sceneManager.switchScene('settings', {
                    accessMethod: 'contextual_help',
                    sourceScene: 'help',
                    preserveContext: true
                });
            }
            
            this.loggingSystem.warn('ContextualHelpManager', 'Could not access SceneManager for settings navigation');
            return false;
        } catch (error) {
            this.loggingSystem.error('ContextualHelpManager', 'Failed to navigate to settings', error);
            return false;
        }
    }
    
    navigateToAccessibilitySettings() {
        try {
            this.loggingSystem.info('ContextualHelpManager', 'Navigating to accessibility settings');
            
            // 設定画面のアクセシビリティセクションに移動
            if (this.gameEngine && this.gameEngine.sceneManager) {
                return this.gameEngine.sceneManager.switchScene('settings', {
                    accessMethod: 'contextual_help_accessibility',
                    sourceScene: 'help',
                    initialSection: 'accessibility',
                    preserveContext: true
                });
            }
            
            this.loggingSystem.warn('ContextualHelpManager', 'Could not access SceneManager for accessibility settings navigation');
            return false;
        } catch (error) {
            this.loggingSystem.error('ContextualHelpManager', 'Failed to navigate to accessibility settings', error);
            return false;
        }
    }
    
    suggestQualitySettings() {
        try {
            this.loggingSystem.info('ContextualHelpManager', 'Suggesting quality settings');
            
            // パフォーマンス改善のための設定提案
            const suggestions = {
                effectQuality: 'low',
                bubbleCount: 'reduced',
                animation: 'minimal',
                reason: 'Performance optimization for better frame rate'
            };
            
            // 提案をログに記録
            this.loggingSystem.info('ContextualHelpManager', 'Quality settings suggestions', suggestions);
            
            // 設定画面に移動して品質設定を表示
            this.navigateToSettings();
            
            return suggestions;
        } catch (error) {
            this.loggingSystem.error('ContextualHelpManager', 'Failed to suggest quality settings', error);
            return null;
        }
    }
    
    showKeyboardShortcuts() {
        try {
            this.loggingSystem.info('ContextualHelpManager', 'Showing keyboard shortcuts');
            
            // キーボードショートカット情報をHelpContentManagerで表示
            return this.navigateToTopic('shortcuts');
        } catch (error) {
            this.loggingSystem.error('ContextualHelpManager', 'Failed to show keyboard shortcuts', error);
            return false;
        }
    }
    
    startInteractiveGuide(guideId) {
        try {
            this.loggingSystem.info('ContextualHelpManager', `Starting interactive guide: ${guideId}`);
            
            const guide = this.interactiveGuides.get(guideId);
            if (!guide) {
                this.loggingSystem.warn('ContextualHelpManager', `Interactive guide not found: ${guideId}`);
                return false;
            }
            
            this.currentGuide = guideId;
            this.guideStep = 0;
            
            // ガイドの最初のステップを開始
            if (guide.steps && guide.steps.length > 0) {
                this.executeGuideStep(guide.steps[0]);
            }
            
            return true;
        } catch (error) {
            this.loggingSystem.error('ContextualHelpManager', 'Failed to start interactive guide', error);
            return false;
        }
    }
    
    // ガイドステップ実行
    executeGuideStep(step) {
        try {
            this.loggingSystem.debug('ContextualHelpManager', 'Executing guide step', step);
            
            // ステップのアクションを実行
            if (step.action && typeof step.action === 'function') {
                step.action();
            }
            
            // ビジュアル表示はスタブとして残す（実際のUI実装が必要）
            return true;
        } catch (error) {
            this.loggingSystem.error('ContextualHelpManager', 'Failed to execute guide step', error);
            return false;
        }
    }
    
    // ユーティリティメソッド群
    highlightCategories() { 
        this.loggingSystem.debug('ContextualHelpManager', 'Highlighting categories');
        // UI highlighting implementation needed
    }
    
    focusSearchInput() { 
        this.loggingSystem.debug('ContextualHelpManager', 'Focusing search input');
        // Search input focus implementation needed
    }
    
    highlightBackButton() { 
        this.loggingSystem.debug('ContextualHelpManager', 'Highlighting back button');
        // Back button highlighting implementation needed
    }
    
    highlightContextualContent() { 
        this.loggingSystem.debug('ContextualHelpManager', 'Highlighting contextual content');
        // Contextual content highlighting implementation needed
    }
    
    highlightActions() { 
        this.loggingSystem.debug('ContextualHelpManager', 'Highlighting actions');
        // Action buttons highlighting implementation needed
    }
    
    /**
     * ヘルプ使用状況のログ
     */
    logHelpUsage(helpData) {
        this.helpHistory.push({
            timestamp: Date.now(),
            key: helpData.key,
            priority: helpData.priority,
            context: { ...this.currentContext }
        });
        
        // 履歴サイズ制限
        if (this.helpHistory.length > 100) {
            this.helpHistory.shift();
        }
    }
    
    /**
     * デバッグ情報の取得
     */
    getDebugInfo() {
        return {
            triggers: Array.from(this.helpTriggers.keys()),
            tooltips: Array.from(this.tooltips.keys()),
            guides: Array.from(this.interactiveGuides.keys()),
            currentContext: this.currentContext,
            helpHistory: this.helpHistory.slice(-10) // 最新10件
        };
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        this.helpTriggers.clear();
        this.activeHelp.clear();
        this.helpHistory = [];
        this.tooltips.clear();
        this.activeTooltips.clear();
        this.interactiveGuides.clear();
        this.currentGuide = null;
        this.isMonitoring = false;
        
        this.loggingSystem.info('ContextualHelpManager', 'Contextual help manager cleaned up');
    }
}