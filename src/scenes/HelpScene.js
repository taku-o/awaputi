import { Scene } from '../core/Scene.js';
import { ErrorHandler } from '../utils/ErrorHandler.js';
import { LoggingSystem } from '../core/LoggingSystem.js';
import { CoreAccessibilityManager } from '../core/AccessibilityManager.js';
import { NavigationContextManager } from '../core/navigation/NavigationContextManager.js';

// サブコンポーネントのインポート
import { HelpAccessibilityManager } from './help-scene/HelpAccessibilityManager.js';
import { HelpContentManager } from './help-scene/HelpContentManager.js';
import { HelpAnimationManager, HelpTransitionRenderer } from './help-scene/HelpAnimationManager.js';
import { HelpRenderer } from './help-scene/HelpRenderer.js';
import { HelpEventManager } from './help-scene/HelpEventManager.js';

/**
 * ヘルプシーン (Refactored)
 * ヘルプシーンメインコントローラー - 包括的なヘルプ表示とナビゲーション機能
 * 
 * サブコンポーネント化により責任を分離し、保守性を向上
 * - HelpAccessibilityManager: アクセシビリティ機能統合管理
 * - HelpContentManager: コンテンツ管理・検索・状態管理
 * - HelpAnimationManager: アニメーション制御システム
 * - HelpRenderer: 描画統合システム
 * - HelpEventManager: イベント処理統合システム
 */
export class HelpScene extends Scene {
    constructor(gameEngine) {
        super(gameEngine);
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // NavigationContextManagerの初期化
        this.navigationContext = new NavigationContextManager(gameEngine);
        
        // Initialize sub-components
        this._initializeSubComponents();
        
        // 基本設定
        this.initialized = false;
        
        this.initialize();
    }
    
    /**
     * Initialize sub-component systems
     * @private
     */
    _initializeSubComponents() {
        try {
            // アクセシビリティ管理
            const accessibilityManager = this.gameEngine.accessibilityManager || new CoreAccessibilityManager(this.gameEngine);
            this.helpAccessibilityManager = new HelpAccessibilityManager(this.gameEngine, accessibilityManager);
            
            // コンテンツ管理
            this.helpContentManager = new HelpContentManager(this.gameEngine);
            
            // アニメーション管理
            this.helpAnimationManager = new HelpAnimationManager();
            this.helpTransitionRenderer = new HelpTransitionRenderer(this.helpAnimationManager);
            
            // レンダリング管理
            this.helpRenderer = new HelpRenderer(this.gameEngine);
            
            // イベント管理
            this.helpEventManager = new HelpEventManager(
                this.gameEngine,
                this.helpContentManager,
                this.helpAccessibilityManager,
                this.helpAnimationManager
            );
            
            console.log('HelpScene sub-components initialized');
            
        } catch (error) {
            console.error('Failed to initialize HelpScene sub-components:', error);
            this.loggingSystem.error('HelpScene', 'Sub-component initialization failed', error);
        }
    }

    /**
     * 初期化処理
     */
    async initialize() {
        try {
            // サブコンポーネントの初期化待機
            await this.waitForSubComponentInitialization();
            
            // イベントコールバックの設定
            this.setupEventCallbacks();
            
            this.initialized = true;
            this.loggingSystem.info('HelpScene', 'Help scene initialized successfully');
            
        } catch (error) {
            this.loggingSystem.error('HelpScene', 'Failed to initialize help scene', error);
            ErrorHandler.handle(error, 'HelpScene.initialize');
        }
    }
    
    async waitForSubComponentInitialization() {
        // 各サブコンポーネントの初期化完了を待機
        const initPromises = [];
        
        if (this.helpAccessibilityManager && this.helpAccessibilityManager.initialize) {
            initPromises.push(this.helpAccessibilityManager.initialize());
        }
        
        if (this.helpContentManager && this.helpContentManager.initialize) {
            initPromises.push(this.helpContentManager.initialize());
        }
        
        await Promise.all(initPromises);
    }
    
    setupEventCallbacks() {
        // イベントマネージャーのコールバック設定
        this.helpEventManager.setCallback('onGoBack', () => {
            try {
                if (!this.gameEngine.sceneManager) {
                    console.error('SceneManager not available');
                    return;
                }
                
                // NavigationContextManagerを使用して適切な戻り先を決定
                const returnScene = this.navigationContext.getReturnDestination();
                this.navigationContext.popContext();
                
                const targetScene = returnScene || 'menu'; // フォールバックとして'menu'を使用
                const success = this.gameEngine.sceneManager.switchScene(targetScene);
                
                if (!success) {
                    console.error(`Failed to navigate to ${targetScene} from help screen`);
                    // フォールバック: menuシーンに戻る試行
                    if (targetScene !== 'menu') {
                        const fallbackSuccess = this.gameEngine.sceneManager.switchScene('menu');
                        if (!fallbackSuccess) {
                            console.error('Failed to navigate to fallback menu scene');
                        }
                    }
                }
                
                this.loggingSystem.info('HelpScene', `Navigated back to: ${targetScene}, success: ${success}`);
            } catch (error) {
                console.error('Error navigating back from help screen:', error);
                this.loggingSystem.error('HelpScene', 'Navigation error', error);
            }
        });
        
        this.helpEventManager.setCallback('onFeedbackRequest', (data) => {
            this.showFeedbackDialog(data);
        });
        
        this.helpEventManager.setCallback('onEffectivenessReport', (report) => {
            this.showEffectivenessReport(report);
        });
        
        this.helpEventManager.setCallback('onSearchFocus', () => {
            // 検索フォーカス時の処理
            console.log('Search bar focused');
        });
    }

    /**
     * シーン開始時の処理
     */
    enter(contextData = {}) {
        if (!this.initialized) {
            console.warn('HelpScene not initialized, attempting to initialize...');
            this.initialize();
        }
        
        // コンテキストデータの処理
        this.processEntryContext(contextData);
        
        // イベントリスナーの設定
        this.helpEventManager.setupEventListeners();
        
        // アクセシビリティ機能の有効化
        this.helpAccessibilityManager.enableAccessibilityFeatures();
        
        // アナリティクス開始
        const analytics = this.helpContentManager.getHelpAnalytics();
        if (analytics) {
            analytics.startHelpSession('help_scene', {
                initialCategory: contextData.contextual ? 'contextual' : 'gameplay',
                accessMethod: contextData.accessMethod || 'unknown',
                sourceScene: contextData.sourceScene || 'unknown',
                userAgent: navigator.userAgent,
                screenSize: `${window.innerWidth}x${window.innerHeight}`,
                language: this.gameEngine.localizationManager?.getCurrentLanguage() || 'ja'
            });
        }
        
        // スクリーンリーダーへの入場アナウンス
        const t = this.gameEngine.localizationManager.t.bind(this.gameEngine.localizationManager);
        let announcement = t('help.accessibility.sceneEntered', 'ヘルプシーンに入りました。F1キーでキーボードショートカットを確認できます。');
        
        // コンテキスト依存のアナウンス追加
        if (contextData.contextual) {
            announcement += ' ' + t('help.accessibility.contextualHelp', 'コンテキスト依存のヘルプを表示しています。');
        } else if (contextData.documentation) {
            announcement += ' ' + t('help.accessibility.documentationHelp', 'ドキュメントヘルプを表示しています。');
        } else if (contextData.quick) {
            announcement += ' ' + t('help.accessibility.quickHelp', 'クイックヘルプを表示しています。');
        }
        
        this.helpAccessibilityManager.announceToScreenReader(announcement);
        
        this.loggingSystem.info('HelpScene', 'Help scene entered', {
            contextData,
            accessMethod: contextData.accessMethod
        });
    }
    
    /**
     * エントリコンテキストの処理
     * @param {Object} contextData - コンテキストデータ
     */
    processEntryContext(contextData) {
        try {
            // コンテキスト依存のヘルプ内容設定
            if (contextData.contextual && contextData.sourceScene) {
                this.setContextualHelpMode(contextData.sourceScene);
            } else if (contextData.documentation) {
                this.setDocumentationHelpMode();
            } else if (contextData.quick) {
                this.setQuickHelpMode();
            } else {
                this.setStandardHelpMode();
            }
            
            this.loggingSystem.debug('HelpScene', 'Entry context processed', contextData);
        } catch (error) {
            this.loggingSystem.error('HelpScene', 'Error processing entry context', error);
        }
    }
    
    /**
     * コンテキスト依存ヘルプモードの設定
     * @param {string} sourceScene - 呼び出し元シーン
     */
    setContextualHelpMode(sourceScene) {
        // ContextualHelpSystemの機能を統合予定
        this.loggingSystem.info('HelpScene', `Contextual help mode for scene: ${sourceScene}`);
    }
    
    /**
     * ドキュメントヘルプモードの設定
     */
    setDocumentationHelpMode() {
        this.loggingSystem.info('HelpScene', 'Documentation help mode activated');
    }
    
    /**
     * クイックヘルプモードの設定
     */
    setQuickHelpMode() {
        this.loggingSystem.info('HelpScene', 'Quick help mode activated');
    }
    
    /**
     * 標準ヘルプモードの設定
     */
    setStandardHelpMode() {
        this.loggingSystem.info('HelpScene', 'Standard help mode activated');
    }

    /**
     * シーン終了時の処理
     */
    exit() {
        // フィードバックシステムでビュー終了追跡
        const feedbackSystem = this.helpContentManager.getHelpFeedbackSystem();
        const state = this.helpContentManager.getState();
        if (feedbackSystem && state.currentContent) {
            const currentTopic = this.helpContentManager.getCurrentTopic();
            if (currentTopic) {
                feedbackSystem.endContentView(currentTopic.id);
            }
        }
        
        // アナリティクス終了
        const analytics = this.helpContentManager.getHelpAnalytics();
        if (analytics) {
            analytics.endHelpSession('scene_exit', {
                finalCategory: state.selectedCategory,
                finalTopic: state.selectedTopicIndex,
                searchPerformed: state.searchQuery !== '',
                lastSearchQuery: state.searchQuery
            });
        }
        
        // イベントリスナーの削除
        this.helpEventManager.removeEventListeners();
        
        // アクセシビリティ機能の無効化
        this.helpAccessibilityManager.disableAccessibilityFeatures();
        
        this.loggingSystem.info('HelpScene', 'Help scene exited');
    }

    /**
     * フィードバックダイアログ表示
     */
    showFeedbackDialog(data) {
        try {
            const feedbackSystem = this.helpContentManager.getHelpFeedbackSystem();
            if (!feedbackSystem || !data.content) {
                console.warn('Feedback system not available or no content provided');
                return;
            }

            if (data.quickMode) {
                // クイックフィードバック（右クリック）
                feedbackSystem.showQuickFeedback(data.topic.id, data.content, data.position);
            } else {
                // 詳細フィードバックダイアログ
                feedbackSystem.showFeedbackDialog(data.topic.id, data.content, {
                    category: data.category,
                    topicTitle: data.topic && data.topic.title ? data.topic.title : 'Unknown Topic'
                });
            }
            
        } catch (error) {
            console.error('Failed to show feedback dialog:', error);
        }
    }

    /**
     * 効果測定レポート表示
     */
    showEffectivenessReport(report) {
        try {
            if (!report) {
                console.warn('No effectiveness report provided');
                return;
            }

            // レポート表示の実装（簡易版）
            console.log('Effectiveness Report:', report);
            
            // 実際のプロダクションではモーダルダイアログなどを表示
            this.helpAccessibilityManager.announceToScreenReader(
                'ヘルプ効果測定レポートが生成されました',
                'assertive'
            );
            
        } catch (error) {
            console.error('Failed to show effectiveness report:', error);
        }
    }

    /**
     * 検索入力処理
     */
    async handleSearchInput(query) {
        try {
            await this.helpEventManager.handleSearchInput(query);
        } catch (error) {
            console.error('Search input handling failed:', error);
        }
    }

    /**
     * 描画処理
     */
    render(ctx) {
        if (!this.initialized) return;

        try {
            // アニメーション更新
            const currentTime = performance.now();
            this.helpAnimationManager.updateAnimations(currentTime);

            // メイン描画
            const state = this.helpContentManager.getState();
            this.helpRenderer.render(
                ctx,
                state,
                this.helpAccessibilityManager,
                this.helpAnimationManager,
                this.helpTransitionRenderer
            );
            
        } catch (error) {
            console.error('Render error in HelpScene:', error);
            this.loggingSystem.error('HelpScene', 'Render error', error);
        }
    }

    /**
     * フレーム更新処理
     */
    update(deltaTime) {
        if (!this.initialized) return;

        try {
            // アニメーション更新
            const currentTime = performance.now();
            this.helpAnimationManager.updateAnimations(currentTime);
            
        } catch (error) {
            console.error('Update error in HelpScene:', error);
        }
    }

    /**
     * 状態取得（デバッグ・診断用）
     */
    getStatus() {
        if (!this.initialized) {
            return { initialized: false };
        }

        return {
            initialized: this.initialized,
            contentState: this.helpContentManager.getState(),
            accessibilityState: this.helpAccessibilityManager.getAccessibilityState(),
            animationState: this.helpAnimationManager.getAllAnimationStates(),
            eventState: this.helpEventManager.getEventState()
        };
    }

    /**
     * 設定変更
     */
    configure(options = {}) {
        if (options.accessibility && this.helpAccessibilityManager) {
            // アクセシビリティ設定の更新
            if (options.accessibility.highContrast !== undefined) {
                if (options.accessibility.highContrast) {
                    this.helpAccessibilityManager.enableHighContrastMode();
                } else {
                    this.helpAccessibilityManager.disableHighContrastMode();
                }
            }
            
            if (options.accessibility.largeText !== undefined) {
                if (options.accessibility.largeText) {
                    this.helpAccessibilityManager.enableLargeTextMode();
                } else {
                    this.helpAccessibilityManager.disableLargeTextMode();
                }
            }
        }

        if (options.animations && this.helpAnimationManager) {
            // アニメーション設定の更新
            this.helpAnimationManager.setAnimationEnabled(options.animations.enabled !== false);
        }

        if (options.layout && this.helpRenderer) {
            // レイアウト設定の更新
            this.helpRenderer.updateLayout(options.layout);
        }

        if (options.colors && this.helpRenderer) {
            // 色設定の更新
            this.helpRenderer.updateColors(options.colors);
        }
    }

    /**
     * クリーンアップ
     */
    destroy() {
        try {
            // サブコンポーネントのクリーンアップ
            if (this.helpEventManager) {
                this.helpEventManager.destroy();
            }
            
            if (this.helpAccessibilityManager) {
                this.helpAccessibilityManager.destroy();
            }
            
            if (this.helpContentManager) {
                this.helpContentManager.destroy();
            }
            
            if (this.helpAnimationManager) {
                this.helpAnimationManager.destroy();
            }
            
            if (this.navigationContext) {
                this.navigationContext.cleanup();
            }
            
            this.initialized = false;
            console.log('HelpScene destroyed');
            
        } catch (error) {
            console.error('Error during HelpScene destruction:', error);
        }
    }
}