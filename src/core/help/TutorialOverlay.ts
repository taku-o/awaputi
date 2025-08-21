/**
 * TutorialOverlay.ts (リファクタリング版)
 * チュートリアル用オーバーレイUIコンポーネント - メインコントローラー
 * 各専用コンポーネントを統合管理
 */

import { ScenesBaseDialog  } from '../../scenes/components/ScenesBaseDialog.js';
import { LoggingSystem  } from '../LoggingSystem.js';
import { getErrorHandler  } from '../../utils/ErrorHandler.js';
import { TutorialStepManager  } from './components/TutorialStepManager.js';
import { TutorialAnimationController  } from './components/TutorialAnimationController.js';
import { TutorialInteractionHandler  } from './components/TutorialInteractionHandler.js';
import { TutorialProgressTracker  } from './components/TutorialProgressTracker.js';

// 型定義
export interface GameEngine { eventBus?: any,
    state?: any,
    [key: string]: any }

export interface TutorialData { id: string,
    title?: string,
    description?: string,
    steps: TutorialStep[],
    [key: string]: any }

export interface TutorialStep { id: string,
    title?: string,
    content?: string,
    target?: string | HTMLElement,
    highlightOptions?: HighlightOptions,
    animation?: string,
    [key: string]: any }

export interface HighlightOptions { style?: string,
    padding?: number,
    borderRadius?: number,
    color?: string,
    [key: string]: any }

export interface TutorialOptions { userId?: string,
    autoProgress?: boolean,
    showProgress?: boolean,
    [key: string]: any }

export interface TutorialLayout { overlayZIndex: number,
    instructionPanelWidth: number,
    instructionPanelMaxHeight: number,
    navigationHeight: number,
    progressBarHeight: number,
    highlightPadding: number,
    spotlightRadius: number  }

export interface TutorialStyles { overlayBackground: string,
    panelBackground: string,
    panelBorder: string,
    panelBorderRadius: string,
    panelBoxShadow: string,
    highlightBorder: string,
    highlightBackground: string,
    progressBarColor: string,
    progressBarBackground: string,
    glowColor: string,
    rippleColor: string,
    sparkleColor: string,
    pulseColor: string }

export interface TutorialState { isActive: boolean,
    isPaused: boolean,
    currentTutorial: TutorialData | null,
    highlightedElement: HTMLElement | null }

/**
 * チュートリアルオーバーレイクラス
 */
export class TutorialOverlay extends ScenesBaseDialog { private loggingSystem: LoggingSystem
    private errorHandler: any,
    // 専用コンポーネント
    private stepManager: TutorialStepManager | null,
    private animationController: TutorialAnimationController | null,
    private interactionHandler: TutorialInteractionHandler | null,
    private progressTracker: TutorialProgressTracker | null,
    // UI要素
    private overlay: HTMLElement | null,
    private instructionPanel: HTMLElement | null,
    private navigationPanel: HTMLElement | null,
    private progressBar: HTMLElement | null,
    private highlightElement: HTMLElement | null,
    private spotlight: HTMLElement | null,
    // レイアウト設定
    private layout: TutorialLayout,
    // スタイル設定
    private styles: TutorialStyles,
    // チュートリアル状態
    private, tutorialState: TutorialState,
    constructor(gameEngine: GameEngine, eventBus?: any, state?: any) {

        super(gameEngine, eventBus, state),
        ',

        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem(),
        this.errorHandler = getErrorHandler()',
            overlayBackground: 'rgba(0, 0, 0, 0.6)',
            panelBackground: '#ffffff',
            panelBorder: '1px solid #e0e0e0',
            panelBorderRadius: '12px',
            panelBoxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            highlightBorder: '3px solid #007bff',
            highlightBackground: 'rgba(0, 123, 255, 0.1)',
            progressBarColor: '#007bff',
            progressBarBackground: '#e9ecef',
            glowColor: '#007bff',
            rippleColor: 'rgba(0, 123, 255, 0.3)',
            sparkleColor: '#ffd700' }

            pulseColor: 'rgba(0, 123, 255, 0.4)' }
        };
        
        // チュートリアル状態
        this.tutorialState = { isActive: false,
            isPaused: false,
            currentTutorial: null,
    highlightedElement: null  };
        this.initialize();
    }

    /**
     * TutorialOverlayの初期化
     */
    async initialize(options: any = { ): Promise<void> {
        try {
            await super.initialize(options),
            
            // 専用コンポーネントを初期化
            await this.initializeComponents(),
            
            // コンポーネント間の統合を設定
            this.setupComponentIntegration(),
            // CSSスタイルの追加
            this.injectStyles()',
            this.loggingSystem.info('TutorialOverlay', 'Tutorial overlay initialized successfully',' }

        } catch (error) {
            this.loggingSystem.error('TutorialOverlay', 'Failed to initialize tutorial overlay', error',
            this.errorHandler.handleError(error, 'TutorialOverlay.initialize' }'
    }
    
    /**
     * 専用コンポーネントを初期化'
     */''
    async initializeComponents()';
            this.loggingSystem.debug('TutorialOverlay', 'Initializing tutorial components...);
            
            // ステップマネージャーを初期化
            this.stepManager = new TutorialStepManager();
            
            // アニメーションコントローラーを初期化
            this.animationController = new TutorialAnimationController();
            
            // インタラクションハンドラーを初期化
            this.interactionHandler = new TutorialInteractionHandler();
            // 進捗追跡システムを初期化
            this.progressTracker = new TutorialProgressTracker()';
            this.loggingSystem.debug('TutorialOverlay', 'All tutorial components initialized';} catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.initializeComponents' }'
    }
    
    /**
     * コンポーネント間の統合を設定'
     */''
    setupComponentIntegration()';
            this.interactionHandler.setCallback('onNext', () => this.nextStep());
            this.interactionHandler.setCallback('onPrevious', () => this.previousStep());
            this.interactionHandler.setCallback('onSkip', () => this.skipStep());
            this.interactionHandler.setCallback('onComplete', () => this.completeTutorial());
            this.interactionHandler.setCallback('onClose', () => this.closeTutorial());
            this.interactionHandler.setCallback('onHelp', () => this.showHelp());
            this.interactionHandler.setCallback('onResize', () => this.handleResize());
            this.interactionHandler.setCallback('onInteraction', (data) => { this.progressTracker.recordUserAction(data.type, data),' }

            }');
            ';
            // ジェスチャーコールバック設定
            this.interactionHandler.setGestureCallback('swipeLeft', () => this.nextStep());
            this.interactionHandler.setGestureCallback('swipeRight', () => this.previousStep());
            this.interactionHandler.setGestureCallback('tap', () => this.nextStep());
            this.interactionHandler.setGestureCallback('doubleTap', () => this.skipStep());

            this.loggingSystem.debug('TutorialOverlay', 'Component integration setup completed';} catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.setupComponentIntegration' }'
    }

    /**
     * チュートリアルを開始
     * @param tutorial - チュートリアル定義
     * @param options - オプション設定
     */
    async startTutorial(tutorial: TutorialData, options: TutorialOptions = { ): Promise<boolean> {'
        try {'
            if(this.tutorialState.isActive) {

                this.loggingSystem.warn('TutorialOverlay', 'Tutorial is already active) }
                return false;
            
            this.tutorialState.currentTutorial = tutorial;
            this.tutorialState.isActive = true;
            
            // 進捗追跡を開始
            this.progressTracker?.startTracking(tutorial, options.userId);
            // ステップマネージャーでチュートリアルを開始
            if(!this.stepManager?.startTutorial(tutorial)) { ''
                throw new Error('Failed, to start, tutorial in, step manager' }'
            
            // インタラクションリスナーを開始
            this.interactionHandler?.startListening();
            
            // オーバーレイUIを表示
            this.createOverlayElements();
            this.showOverlay();
            // 最初のステップを表示
            this.displayCurrentStep()';
            this.loggingSystem.info('TutorialOverlay', `Tutorial started: ${tutorial.id}`});
            return true;

        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.startTutorial),
            this.tutorialState.isActive = false,
            return false,
    
    /**
     * 次のステップに進む
     */
    async nextStep(): Promise<void> { try {
            if (!this.tutorialState.isActive) return,
            
            const success = await this.stepManager?.nextStep(),
            if(success) {
                this.progressTracker?.recordStepComplete((this.stepManager, as any).stepIndex - 1) }

                this.displayCurrentStep(); }'

            } catch (error) {
            this.progressTracker?.recordError(error, 'nextStep'),
            this.errorHandler.handleError(error, 'TutorialOverlay.nextStep' }'
    }
    
    /**
     * 前のステップに戻る
     */ : undefined
    previousStep(): void { try {
            if (!this.tutorialState.isActive) return,
            
            const success = this.stepManager?.previousStep(),
            if(success) {
    
}

                this.displayCurrentStep();' }'

            } catch (error) {
            this.progressTracker?.recordError(error, 'previousStep'),
            this.errorHandler.handleError(error, 'TutorialOverlay.previousStep' }'
    }
    
    /**
     * 現在のステップをスキップ
     */
    skipStep() {
        try {'
            if(!this.tutorialState.isActive) return,

            this.progressTracker.recordStepSkip(this.stepManager.stepIndex, 'user_choice),
            const success = this.stepManager.skipCurrentStep(),
            
            if (success) {
    }

                this.displayCurrentStep();' }'

            } catch (error) {
            this.progressTracker.recordError(error, 'skipStep'),
            this.errorHandler.handleError(error, 'TutorialOverlay.skipStep' }'
    }
    
    /**
     * 現在のステップを表示
     */
    displayCurrentStep() {
        try {
            const currentStep = this.stepManager.currentStep,
            if (!currentStep) return,
            
            // 進捗追跡にステップ開始を記録
            this.progressTracker.recordStepStart(this.stepManager.stepIndex, currentStep),
            
            // 前のハイライトをクリア
            this.clearHighlight(),
            
            // ステップ内容を更新
            this.updateInstructionPanel(currentStep),
            this.updateProgressBar(),
            this.updateNavigationPanel(),
            
            // 要素ハイライトを設定
            if (currentStep.target) {
    }
                this.highlightElement(currentStep.target, currentStep.highlightOptions); }
            }
            ;
            // アニメーションを開始
            this.startStepAnimation(currentStep);

             : undefined';
            this.loggingSystem.debug('TutorialOverlay', `Step displayed: ${this.stepManager.stepIndex + 1}`});

        } catch (error) {
            this.progressTracker.recordError(error, 'displayCurrentStep'),
            this.errorHandler.handleError(error, 'TutorialOverlay.displayCurrentStep' }'
    }
    
    /**
     * 要素をハイライト
     * @param {string|HTMLElement} target - ハイライト対象
     * @param {Object} options - ハイライトオプション'
     */''
    highlightElement(target, options = { )) {
        try {
            let element,

            if(typeof, target === 'string' { }
                element = document.querySelector(target); }
            } else if (target, instanceof HTMLElement) { element = target }

            if(!element) { }'

                this.loggingSystem.warn('TutorialOverlay', `Target element not found: ${target}`}';
                return;
            }
            
            this.tutorialState.highlightedElement = element;
            ';
            // ハイライト要素を作成
            this.createHighlightElement(element, options);
            ';
            // アニメーションを開始
            const animationType = options.animation || 'pulse';
            const intensity = options.intensity || 1.0;
            this.animationController.startHighlightAnimation(this.highlightElement, animationType, intensity);
            
            // スポットライトエフェクト
            if (options.spotlight !== false) { this.createSpotlightEffect(element, options.spotlightRadius),' }'

            } catch (error) {
            this.progressTracker.recordError(error, 'highlightElement'),
            this.errorHandler.handleError(error, 'TutorialOverlay.highlightElement' }'
    }
    
    /**
     * ハイライト要素を作成
     * @param {HTMLElement} targetElement - 対象要素
     * @param {Object} options - オプション
     */
    createHighlightElement(targetElement, options = { ) {

        const rect = targetElement.getBoundingClientRect()',
        this.highlightElement = document.createElement('div'),
        this.highlightElement.className = 'tutorial-highlight',
        ',

        Object.assign(this.highlightElement.style, { }

            position: 'fixed'
            }
            left: `${rect.left - padding}px`;
            top: `${rect.top - padding}px`;
            width: `${rect.width + padding * 2}px`;
            height: `${rect.height + padding * 2}px`;
            border: this.styles.highlightBorder,
            backgroundColor: this.styles.highlightBackground,
            borderRadius: options.borderRadius || '4px',';
            pointerEvents: 'none')',
    zIndex: this.layout.overlayZIndex + 2,')';
            transition: 'all 0.3s ease');
        document.body.appendChild(this.highlightElement);
    }
    
    /**
     * スポットライトエフェクトを作成
     * @param {HTMLElement} targetElement - 対象要素
     * @param {number} radius - スポットライト半径
     */
    createSpotlightEffect(targetElement, radius) {
        if (this.spotlight) {
    }
            this.spotlight.remove(); }
        }

        const rect = targetElement.getBoundingClientRect()';
        this.spotlight = document.createElement('div');
        this.spotlight.className = 'tutorial-spotlight';
        ';

        Object.assign(this.spotlight.style, { ''
            position: 'fixed',
            left: '0',
            top: '0',
            width: '100vw',',
            height: '100vh'
            }
            background: `radial-gradient(circle, at ${centerX}px ${centerY}px);
                transparent ${ spotlightRadius}px, ' }'

                rgba(0, 0, 0, 0.7}) ${spotlightRadius + 50}px')`,''
            pointerEvents: 'none',
    zIndex: this.layout.overlayZIndex + 1;
        }),
        
        this.overlay.appendChild(this.spotlight);
        
        // アニメーション開始
        this.animationController.startSpotlightAnimation(this.spotlight, spotlightRadius, true);
    }
    
    /**
     * ハイライトをクリア
     */
    clearHighlight() {
        if (this.highlightElement) {
            this.highlightElement.remove() }
            this.highlightElement = null; }
        }
        
        if(this.spotlight) {
        ',

            this.spotlight.remove()',
        this.animationController.stopAnimation('highlight') }

        this.animationController.stopAnimation('spotlight'; }'
    }
    
    /**
     * オーバーレイ要素を作成'
     */''
    createOverlayElements()';
        this.overlay = document.createElement('div');
        this.overlay.className = 'tutorial-overlay';
        ';

        Object.assign(this.overlay.style, { ''
            position: 'fixed',
            left: '0',
            top: '0',
            width: '100vw',
            height: '100vh),
            backgroundColor: this.styles.overlayBackground',
    zIndex: this.layout.overlayZIndex,
            display: 'flex',
            alignItems: 'center',')',
            justifyContent: 'center'),
        // インストラクションパネル
        this.createInstructionPanel(),
        
        // ナビゲーションパネル
        this.createNavigationPanel(),
        
        // プログレスバー
        this.createProgressBar(),
        
        document.body.appendChild(this.overlay),  }
    
    /**
     * インストラクションパネルを作成
     */''
    createInstructionPanel()';
        this.instructionPanel = document.createElement('div');
        this.instructionPanel.className = 'tutorial-instruction-panel';
        
        Object.assign(this.instructionPanel.style, {
            maxWidth: `${this.layout.instructionPanelWidth}px`;
            maxHeight: `${this.layout.instructionPanelMaxHeight}px`;
            backgroundColor: this.styles.panelBackground;
            border: this.styles.panelBorder);
            borderRadius: this.styles.panelBorderRadius)',
    boxShadow: this.styles.panelBoxShadow,
            padding: '24px',')';
            overflow: 'auto');
        this.overlay.appendChild(this.instructionPanel);
    }
    
    /**
     * インストラクションパネルを更新
     * @param {Object} step - ステップデータ
     */
    updateInstructionPanel(step) {

        if(!this.instructionPanel || !step) return }

        this.instructionPanel.innerHTML = `}'

            <h3 style="margin: 0 0 16px 0;, color: #333; font-size: 20px;">${step.title || 'チュートリアル'}</h3>''
            <p style="margin: 0 0 16px 0;, color: #666; line-height: 1.5;">${step.description || '}</p>''
            ${step.content ? `<div, style="margin: 16px, 0,">${step.content}</div>` : '}
        `;
    }
    
    /**
     * プログレスバーを作成'
     */''
    createProgressBar()';
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'tutorial-progress-bar';
        ';

        Object.assign(this.progressBar.style, { ''
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%'
            });
            height: `${this.layout.progressBarHeight}px`''
            backgroundColor: this.styles.progressBarBackground,')';
            zIndex: this.layout.overlayZIndex + 3',

        const progressFill = document.createElement('div');
        progressFill.className = 'tutorial-progress-fill';
        ';

        Object.assign(progressFill.style, { ')'
            height: '100%')',
    backgroundColor: this.styles.progressBarColor,
            width: '0%',')',
            transition: 'width 0.3s ease'),
        this.progressBar.appendChild(progressFill),
        document.body.appendChild(this.progressBar),  }
    
    /**
     * プログレスバーを更新
     */
    updateProgressBar() {
        if (!this.progressBar) return,

        const progress = this.stepManager.getProgress()',
        const progressFill = this.progressBar.querySelector('.tutorial-progress-fill) }
        if (progressFill) { }
            progressFill.style.width = `${progress.progress * 100}%`;
        }
    }
    
    /**
     * ナビゲーションパネルを作成'
     */''
    createNavigationPanel()';
        this.navigationPanel = document.createElement('div');
        this.navigationPanel.className = 'tutorial-navigation-panel';
        ';

        Object.assign(this.navigationPanel.style, { ''
            position: 'fixed',',
            bottom: '24px',')',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '12px',
            padding: '12px 24px',
            backgroundColor: this.styles.panelBackground,
            border: this.styles.panelBorder,
            borderRadius: this.styles.panelBorderRadius,
            boxShadow: this.styles.panelBoxShadow,
    zIndex: this.layout.overlayZIndex + 2  });
        document.body.appendChild(this.navigationPanel);
    }
    
    /**
     * ナビゲーションパネルを更新
     */
    updateNavigationPanel() {
        if (!this.navigationPanel) return,

        const progress = this.stepManager.getProgress(),
        ',

        this.navigationPanel.innerHTML = ` }

            <button class="tutorial-nav-btn tutorial-prev-btn", " }"
                    ${!progress.canGoPrevious ? 'disabled' : '}>前へ</button>''
            <span class="tutorial-step-counter">${progress.currentStep} / ${progress.totalSteps}</span>""
            <button class="tutorial-nav-btn tutorial-next-btn">次へ</button>"";
            ${progress.canSkip ? '<button, class="tutorial-nav-btn, tutorial-skip-btn">スキップ</button>' : '}''
            <button class="tutorial-nav-btn tutorial-close-btn">閉じる</button>;
        `;
        
        // イベントリスナーを設定
        this.setupNavigationEvents();
    }
    
    /**
     * ナビゲーションイベントを設定"
     */""
    setupNavigationEvents() {"

        const prevBtn = this.navigationPanel.querySelector('.tutorial-prev-btn'),
        const nextBtn = this.navigationPanel.querySelector('.tutorial-next-btn'),
        const skipBtn = this.navigationPanel.querySelector('.tutorial-skip-btn'),
        const closeBtn = this.navigationPanel.querySelector('.tutorial-close-btn),

        if(prevBtn) prevBtn.addEventListener('click', () => this.previousStep(),
        if(nextBtn) nextBtn.addEventListener('click', () => this.nextStep(),
        if(skipBtn) skipBtn.addEventListener('click', () => this.skipStep() }

        if(closeBtn) closeBtn.addEventListener('click', () => this.closeTutorial(); }
    }
    
    /**
     * ステップアニメーションを開始
     * @param {Object} step - ステップデータ
     */
    startStepAnimation(step) {

        if(!step.animation) return,

        const animationType = step.animation.type || 'slideIn',
        const direction = step.animation.direction || 'bottom' }
        this.animationController.startPanelAnimation(this.instructionPanel, animationType, direction); }
    }
    
    /**
     * チュートリアルを完了'
     */''
    completeTutorial()';
            this.progressTracker.recordTutorialEnd('completed';
            this.closeTutorial()';
            this.loggingSystem.info('TutorialOverlay', 'Tutorial completed successfully';} catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.completeTutorial' }'
    }
    
    /**
     * チュートリアルを閉じる
     */
    closeTutorial() {
        try {
            if (!this.tutorialState.isActive) return,
            ',
            // 進捗追跡を終了
            if(this.progressTracker) {
    }

                this.progressTracker.recordTutorialEnd('abandoned'; }'
            }
            
            // インタラクションリスナーを停止
            if (this.interactionHandler) { this.interactionHandler.stopListening() }
            
            // アニメーションを停止
            if (this.animationController) { this.animationController.stopAllAnimations() }
            
            // UI要素を削除
            this.hideOverlay();
            this.clearHighlight()';
            this.loggingSystem.info('TutorialOverlay', 'Tutorial closed';} catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.closeTutorial' }'
    }
    
    /**
     * ヘルプを表示'
     */''
    showHelp()';
            this.progressTracker.recordHelpRequest('general_help');
            ';
            // ヘルプモーダルやツールチップを表示
            this.loggingSystem.debug('TutorialOverlay', 'Help requested';} catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.showHelp' }'
    }
    
    /**
     * リサイズを処理
     */
    handleResize() {
        try {
            // ハイライトやスポットライトの位置を更新
            if (this.tutorialState.highlightedElement) {
                const currentStep = this.stepManager.currentStep,
                this.clearHighlight() }
                this.highlightElement(this.tutorialState.highlightedElement, currentStep.highlightOptions);' }'

            } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.handleResize' }'
    }
    
    /**
     * オーバーレイを表示
     */
    showOverlay() {

        if(this.overlay) {''
            this.overlay.style.display = 'flex' }

            this.animationController.startPanelAnimation(this.overlay, 'fadeIn'; }'
}
    
    /**
     * オーバーレイを非表示
     */
    hideOverlay() {
        if (this.overlay) {
            this.overlay.remove() }
            this.overlay = null; }
        }
        
        if(this.progressBar) {
        
            this.progressBar.remove() }
            this.progressBar = null; }
        }
        
        if(this.navigationPanel) {
        
            this.navigationPanel.remove() }
            this.navigationPanel = null; }
}
    
    /**
     * CSSスタイルを挿入'
     */''
    injectStyles()';
        if(document.getElementById('tutorial-overlay-styles)' return;

        const style = document.createElement('style');
        style.id = 'tutorial-overlay-styles';
        style.textContent = `;
            .tutorial-nav-btn { padding: 8px 16px,
                border: none,
                border-radius: 6px,
                background: #007bff,
                color: white,
    cursor: pointer,
                font-size: 14px,
                transition: background 0.2s ease  }
            
            .tutorial-nav-btn:hover:not(:disabled) { background: #0056b3 }
            
            .tutorial-nav-btn: disabled { background: #ccc,
    cursor: not-allowed }
            
            .tutorial-step-counter { display: flex,
                align-items: center,
                font-size: 14px,
                color: #666,
    margin: 0 8px  }
            
            .tutorial-highlight { animation: tutorialPulse 2s infinite }
            
            @keyframes tutorialPulse {
                0%, 100% { opacity: 0.8 }
                50% { opacity: 1 }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * 現在の進捗情報を取得
     */
    getProgress() { return this.stepManager ? this.stepManager.getProgress() : null }
    
    /**
     * チュートリアルオーバーレイを破棄
     */
    dispose() {
        try {
            this.closeTutorial(),
            
            // 専用コンポーネントを破棄
            this.animationController?.dispose(),
            this.interactionHandler?.dispose(),
            this.progressTracker?.dispose(),
            this.stepManager?.reset()',
            const style = document.getElementById('tutorial-overlay-styles),
            if (style) {
    }
                style.remove(); }
            }

            super.dispose()';
            this.loggingSystem.info('TutorialOverlay', 'Tutorial overlay disposed';} catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.dispose' }'
}

// シングルトンインスタンス管理 : undefined
let tutorialOverlayInstance: TutorialOverlay | null = null,

/**
 * TutorialOverlayのシングルトンインスタンスを取得
 * @param gameEngine - ゲームエンジン
 * @param eventBus - イベントバス
 * @param state - 状態オブジェクト
 * @returns TutorialOverlayインスタンス
 */
export function getTutorialOverlay(gameEngine: GameEngine, eventBus?: any, state?: any): TutorialOverlay { if (!tutorialOverlayInstance) {
        tutorialOverlayInstance = new TutorialOverlay(gameEngine, eventBus, state) }
    return tutorialOverlayInstance;
}

/**
 * TutorialOverlayインスタンスを再初期化
 * @param gameEngine - ゲームエンジン
 * @param eventBus - イベントバス
 * @param state - 状態オブジェクト
 * @returns 新しいTutorialOverlayインスタンス
 */
export function reinitializeTutorialOverlay(gameEngine: GameEngine, eventBus?: any, state?: any): TutorialOverlay { if (tutorialOverlayInstance) {
        tutorialOverlayInstance.dispose() }''
    tutorialOverlayInstance = new TutorialOverlay(gameEngine, eventBus, state);

    return tutorialOverlayInstance;}