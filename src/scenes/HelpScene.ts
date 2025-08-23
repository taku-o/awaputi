import { Scene } from '../core/Scene.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import { getLoggingSystem } from '../core/LoggingSystem.js';
import { CoreAccessibilityManager } from '../core/AccessibilityManager.js';
import { NavigationContextManager } from '../core/navigation/NavigationContextManager.js';

// サブコンポーネントのインポート
import { HelpAccessibilityManager } from './help-scene/HelpAccessibilityManager.js';
import { HelpContentManager } from './help-scene/HelpContentManager.js';
import { HelpAnimationManager, HelpTransitionRenderer } from './help-scene/HelpAnimationManager.js';
import { HelpRenderer } from './help-scene/HelpRenderer.js';
import { HelpEventManager } from './help-scene/HelpEventManager.js';
import { ContextualHelpManager } from './help-scene/ContextualHelpManager.js';

// Help Scene specific types
export interface HelpTopic {
    id: string;
    title: string;
    content?: string;
    category?: string;
}

export interface HelpContextData {
    contextual?: boolean;
    documentation?: boolean;
    quick?: boolean;
    standard?: boolean;
    sourceScene?: string;
    accessMethod?: string;
    preserveContext?: boolean;
    returnScene?: string;
}

export interface HelpSceneState {
    initialized: boolean;
    currentContext?: any;
    contextualHelpTitle?: string;
    contextualHelpContent?: string;
    contextualHelpActions?: string[];
    hasContextualHelp?: boolean;
}

export interface HelpSceneComponents {
    helpAccessibilityManager: HelpAccessibilityManager;
    helpContentManager: HelpContentManager;
    helpAnimationManager: HelpAnimationManager;
    helpTransitionRenderer: HelpTransitionRenderer;
    helpRenderer: HelpRenderer;
    helpEventManager: HelpEventManager;
    contextualHelpManager: ContextualHelpManager;
}

export interface AccessibilityOptions {
    highContrast?: boolean;
    largeText?: boolean;
}

export interface AnimationOptions {
    enabled?: boolean;
}

export interface LayoutOptions {
    [key: string]: any;
}

export interface ColorOptions {
    [key: string]: any;
}

export interface ConfigureOptions {
    accessibility?: AccessibilityOptions;
    animations?: AnimationOptions;
    layout?: LayoutOptions;
    colors?: ColorOptions;
}

export interface HelpSceneStatus {
    initialized: boolean;
    contentState?: any;
    accessibilityState?: any;
    animationState?: any;
    eventState?: any;
}

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
export class HelpScene extends Scene implements HelpSceneState {
    // Core component properties
    public loggingSystem: any;
    public navigationContext: NavigationContextManager;
    
    // Sub-component properties
    public helpAccessibilityManager!: HelpAccessibilityManager;
    public helpContentManager!: HelpContentManager;
    public helpAnimationManager!: HelpAnimationManager;
    public helpTransitionRenderer!: HelpTransitionRenderer;
    public helpRenderer!: HelpRenderer;
    public helpEventManager!: HelpEventManager;
    public contextualHelpManager!: ContextualHelpManager;

    // State properties
    public initialized: boolean = false;
    public currentContext?: any;
    public contextualHelpTitle?: string;
    public contextualHelpContent?: string;
    public contextualHelpActions?: string[];
    public hasContextualHelp?: boolean;

    constructor(gameEngine: any) {
        super(gameEngine);
        this.loggingSystem = getLoggingSystem();
        
        // NavigationContextManagerの初期化
        this.navigationContext = new NavigationContextManager(gameEngine);
        
        // Initialize sub-components
        this._initializeSubComponents();
        
        // 初期化
        this.initialize();
    }
    
    /**
     * Initialize sub-component systems
     * @private
     */
    private _initializeSubComponents(): void {
        console.log('HelpScene: _initializeSubComponents() called');
        
        try {
            // アクセシビリティ管理
            console.log('HelpScene: Creating HelpAccessibilityManager');
            const accessibilityManager = this.gameEngine.accessibilityManager || new CoreAccessibilityManager(this.gameEngine);
            this.helpAccessibilityManager = new HelpAccessibilityManager(this.gameEngine, accessibilityManager);
            
            // コンテンツ管理
            console.log('HelpScene: Creating HelpContentManager');
            this.helpContentManager = new HelpContentManager(this.gameEngine);
            
            // アニメーション管理
            console.log('HelpScene: Creating HelpAnimationManager');
            this.helpAnimationManager = new HelpAnimationManager();
            this.helpTransitionRenderer = new HelpTransitionRenderer(this.helpAnimationManager);
            
            // レンダリング管理
            console.log('HelpScene: Creating HelpRenderer');
            this.helpRenderer = new HelpRenderer(this.gameEngine);
            
            // GameEngineにレンダラーの参照を設定（イベント管理で使用）
            this.gameEngine.helpRenderer = this.helpRenderer;
            
            // イベント管理
            console.log('HelpScene: Creating HelpEventManager');
            this.helpEventManager = new HelpEventManager(
                this.gameEngine,
                this.helpContentManager,
                this.helpAccessibilityManager,
                this.helpAnimationManager
            );
            console.log('HelpScene: HelpEventManager created, instance:', !!this.helpEventManager);
            
            // コンテキスト依存ヘルプ管理
            console.log('HelpScene: Creating ContextualHelpManager');
            this.contextualHelpManager = new ContextualHelpManager(this.gameEngine);

            console.log('HelpScene sub-components initialized');
        } catch (error) {
            console.error('Failed to initialize HelpScene sub-components:', error);
            this.loggingSystem.error('HelpScene', 'Sub-component initialization failed', error);
        }
    }

    /**
     * 初期化処理
     */
    async initialize(): Promise<void> {
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
    
    async waitForSubComponentInitialization(): Promise<void> {
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

    setupEventCallbacks(): void {
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

        this.helpEventManager.setCallback('onFeedbackRequest', (data: any) => {
            this.showFeedbackDialog(data);
        });

        this.helpEventManager.setCallback('onEffectivenessReport', (report: any) => {
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
    enter(contextData: HelpContextData = {}): void {
        console.log('HelpScene: enter() called');
        
        if (!this.initialized) {
            console.warn('HelpScene not initialized, attempting to initialize...');
            this.initialize();
        }
        
        // コンテキストデータの処理
        this.processEntryContext(contextData);
        
        // イベントリスナーの設定
        console.log('HelpScene: enter() - helpEventManager exists:', !!this.helpEventManager);
        if (this.helpEventManager) {
            console.log('HelpScene: enter() - calling setupEventListeners()');
            this.helpEventManager.setupEventListeners();
        } else {
            console.error('HelpScene: enter() - helpEventManager is not available!');
        }
        
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
     * @param contextData - コンテキストデータ
     */
    processEntryContext(contextData: HelpContextData): void {
        try {
            // コンテキスト情報の保存（戻りナビゲーション用）
            this.currentContext = {
                ...contextData,
                entryTime: Date.now()
            };
            
            // NavigationContextManagerにコンテキストを設定
            if (contextData.preserveContext && contextData.returnScene) {
                this.navigationContext.setReturnContext({
                    targetScene: contextData.returnScene,
                    contextData: contextData,
                    preserveState: true
                });
            }
            
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
    setContextualHelpMode(sourceScene: any): void {
        // ContextualHelpManagerを使用してコンテキスト依存ヘルプを分析
        const contextualHelp = this.contextualHelpManager.analyzeContextAndGetHelp({
            sourceScene,
            accessMethod: 'keyboard_f1',
            contextual: true
        });

        if (contextualHelp) {
            this.applyContextualHelp(contextualHelp);
        }

        this.loggingSystem.info('HelpScene', `Contextual help mode for scene: ${sourceScene}`, {
            hasContextualHelp: !!contextualHelp
        });
    }
    
    /**
     * ドキュメントヘルプモードの設定
     */
    setDocumentationHelpMode(): void {
        const documentationHelp = this.contextualHelpManager.analyzeContextAndGetHelp({
            accessMethod: 'keyboard_ctrl_h',
            documentation: true
        });
        
        if (documentationHelp) {
            this.applyContextualHelp(documentationHelp);
        }

        this.loggingSystem.info('HelpScene', 'Documentation help mode activated');
    }
    
    /**
     * クイックヘルプモードの設定
     */
    setQuickHelpMode(): void {
        const quickHelp = this.contextualHelpManager.analyzeContextAndGetHelp({
            accessMethod: 'keyboard_ctrl_slash',
            quick: true
        });
        
        if (quickHelp) {
            this.applyContextualHelp(quickHelp);
        }

        this.loggingSystem.info('HelpScene', 'Quick help mode activated');
    }
    
    /**
     * 標準ヘルプモードの設定
     */
    setStandardHelpMode(): void {
        const standardHelp = this.contextualHelpManager.analyzeContextAndGetHelp({
            accessMethod: 'menu_click',
            standard: true
        });
        
        if (standardHelp) {
            this.applyContextualHelp(standardHelp);
        }

        this.loggingSystem.info('HelpScene', 'Standard help mode activated');
    }
    
    /**
     * コンテキスト依存ヘルプの適用
     * @param {Object} helpContent - ヘルプ内容
     */
    applyContextualHelp(helpContent: any): void {
        try {
            // ヘルプ内容の設定
            if (this.helpContentManager && helpContent.category) {
                // カテゴリベースでヘルプ内容を設定する
                this.setHelpCategory(helpContent.category);
            }
            
            // タイトルと内容の設定
            this.contextualHelpTitle = helpContent.title;
            this.contextualHelpContent = helpContent.detailed;
            this.contextualHelpActions = helpContent.actions || [];
            
            // UI更新フラグ
            this.hasContextualHelp = true;

            this.loggingSystem.debug('HelpScene', 'Contextual help applied', {
                title: helpContent.title,
                category: helpContent.category,
                actionsCount: this.contextualHelpActions?.length || 0
            });
        } catch (error) {
            this.loggingSystem.error('HelpScene', 'Error applying contextual help', error);
        }
    }
    
    /**
     * ヘルプカテゴリの設定
     * @param {string} category - カテゴリ名
     */
    setHelpCategory(category: any): void {
        try {
            if (this.helpContentManager && this.helpContentManager.selectCategory) {
                this.helpContentManager.selectCategory(category);
            }
        } catch (error) {
            this.loggingSystem.error('HelpScene', `Error setting help category: ${category}`, error);
        }
    }
    
    /**
     * ヘルプアクションの実行
     * @param {string} action - アクション名
     */
    executeHelpAction(action: any): void {
        try {
            if (this.contextualHelpManager) {
                this.contextualHelpManager.executeHelpAction(action, {
                    scene: this,
                    navigationContext: this.navigationContext
                });
            }
        } catch (error) {
            this.loggingSystem.error('HelpScene', `Error executing help action: ${action}`, error);
        }
    }

    /**
     * シーン終了時の処理
     */
    exit(): void {
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
    showFeedbackDialog(data: any): void {
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
                feedbackSystem.showFeedbackDialog(data.topic.id);
            }
        } catch (error) {
            console.error('Failed to show feedback dialog:', error);
        }
    }

    /**
     * 効果測定レポート表示
     */
    showEffectivenessReport(report: any): void {
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
    async handleSearchInput(query: any): Promise<void> {
        try {
            await this.helpEventManager.handleSearchInput(query);
        } catch (error) {
            console.error('Search input handling failed:', error);
        }
    }

    /**
     * 描画処理
     */
    render(ctx: CanvasRenderingContext2D): void {
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
            
            // レンダリング後に検索バーの位置を更新（レイアウト変更に対応）
            if (this.helpEventManager && this.helpEventManager.updateInputPosition) {
                this.helpEventManager.updateInputPosition();
            }
        } catch (error) {
            console.error('Render error in HelpScene:', error);
            this.loggingSystem.error('HelpScene', 'Render error', error);
        }
    }

    /**
     * フレーム更新処理
     */
    update(__deltaTime: number): void {
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
    getStatus(): HelpSceneStatus {
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
    configure(options: ConfigureOptions = {}): void {
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
    destroy(): void {
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
            
            if (this.contextualHelpManager) {
                this.contextualHelpManager.cleanup();
            }
            
            console.log('HelpScene destroyed');
        } catch (error) {
            console.error('Error during HelpScene destruction:', error);
        }
    }
}