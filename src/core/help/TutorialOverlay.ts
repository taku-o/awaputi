/**
 * TutorialOverlay.ts (リファクタリング版)
 * チュートリアル用オーバーレイUIコンポーネント - メインコントローラー
 * 各専用コンポーネントを統合管理
 */

import { ScenesBaseDialog } from '../../scenes/components/ScenesBaseDialog.js';
import { LoggingSystem } from '../LoggingSystem.js';
import { getErrorHandler } from '../../utils/ErrorHandler.js';
import { TutorialStepManager } from './components/TutorialStepManager.js';
import { TutorialAnimationController } from './components/TutorialAnimationController.js';
import { TutorialInteractionHandler } from './components/TutorialInteractionHandler.js';
import { TutorialProgressTracker } from './components/TutorialProgressTracker.js';

// 型定義
export interface GameEngine {
    eventBus?: any;
    state?: any;
}

export interface TutorialStep {
    id: string;
    title: string;
    instructions: string;
    targetElement?: string;
    position?: string;
    highlight?: string | object;
    action?: string;
    [key: string]: any;
}

export interface Tutorial {
    id: string;
    title: string;
    description?: string;
    steps: TutorialStep[];
    [key: string]: any;
}

export interface TutorialOptions {
    userId?: string;
    showProgress?: boolean;
    allowSkip?: boolean;
    autoAdvance?: boolean;
    theme?: string;
    [key: string]: any;
}

export interface TutorialLayout {
    overlayZIndex: number;
    instructionPanelWidth: number;
    instructionPanelMaxHeight: number;
    navigationHeight: number;
    progressBarHeight: number;
    highlightPadding: number;
    spotlightRadius: number;
}

export interface TutorialStyles {
    overlayBackground: string;
    panelBackground: string;
    panelBorder: string;
    panelBorderRadius: string;
    panelBoxShadow: string;
    highlightBorder: string;
    highlightBackground: string;
    progressBarColor: string;
    progressBarBackground: string;
    glowColor: string;
    rippleColor: string;
    sparkleColor: string;
    pulseColor: string;
}

export interface TutorialState {
    isActive: boolean;
    isPaused: boolean;
    currentTutorial: Tutorial | null;
    highlightedElement: HTMLElement | null;
}

export interface InteractionData {
    type: string;
    target?: HTMLElement;
    timestamp: number;
    [key: string]: any;
}

export interface ErrorHandler {
    handleError(error: any, context?: string): void;
}

/**
 * チュートリアルオーバーレイクラス
 */
export class TutorialOverlay extends ScenesBaseDialog {
    private loggingSystem: LoggingSystem;
    private errorHandler: ErrorHandler;
    
    // 専用コンポーネント
    private stepManager: TutorialStepManager | null;
    private animationController: TutorialAnimationController | null;
    private interactionHandler: TutorialInteractionHandler | null;
    private progressTracker: TutorialProgressTracker | null;
    
    // UI要素
    private overlay: HTMLElement | null;
    private instructionPanel: HTMLElement | null;
    private navigationPanel: HTMLElement | null;
    private progressBar: HTMLElement | null;
    private highlightElement: HTMLElement | null;
    private spotlight: HTMLElement | null;
    
    // レイアウト設定
    private layout: TutorialLayout;
    
    // スタイル設定
    private styles: TutorialStyles;
    
    // チュートリアル状態
    private tutorialState: TutorialState;

    constructor(gameEngine: GameEngine, eventBus?: any, state?: any) {
        super(gameEngine, eventBus, state);
        
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        this.errorHandler = getErrorHandler();
        
        // 専用コンポーネント（初期化後に設定）
        this.stepManager = null;
        this.animationController = null;
        this.interactionHandler = null;
        this.progressTracker = null;
        
        // UI要素
        this.overlay = null;
        this.instructionPanel = null;
        this.navigationPanel = null;
        this.progressBar = null;
        this.highlightElement = null;
        this.spotlight = null;
        
        // レイアウト設定
        this.layout = {
            overlayZIndex: 10000,
            instructionPanelWidth: 350,
            instructionPanelMaxHeight: 400,
            navigationHeight: 60,
            progressBarHeight: 4,
            highlightPadding: 8,
            spotlightRadius: 100
        };
        
        // スタイル設定
        this.styles = {
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
            sparkleColor: '#ffd700',
            pulseColor: 'rgba(0, 123, 255, 0.4)'
        };
        
        // チュートリアル状態
        this.tutorialState = {
            isActive: false,
            isPaused: false,
            currentTutorial: null,
            highlightedElement: null
        };
        
        this.initialize();
    }

    /**
     * TutorialOverlayの初期化
     */
    async initialize(options: TutorialOptions = {}): Promise<void> {
        try {
            await super.initialize(options);
            
            // 専用コンポーネントを初期化
            await this.initializeComponents();
            
            // コンポーネント間の統合を設定
            this.setupComponentIntegration();
            
            // CSSスタイルの追加
            this.injectStyles();
            
            this.loggingSystem.info('TutorialOverlay', 'Tutorial overlay initialized successfully');
        } catch (error) {
            this.loggingSystem.error('TutorialOverlay', 'Failed to initialize tutorial overlay', error);
            this.errorHandler.handleError(error, 'TutorialOverlay.initialize');
        }
    }
    
    /**
     * 専用コンポーネントを初期化
     */
    async initializeComponents(): Promise<void> {
        try {
            this.loggingSystem.debug('TutorialOverlay', 'Initializing tutorial components...');
            
            // ステップマネージャーを初期化
            this.stepManager = new TutorialStepManager();
            
            // アニメーションコントローラーを初期化
            this.animationController = new TutorialAnimationController();
            
            // インタラクションハンドラーを初期化
            this.interactionHandler = new TutorialInteractionHandler();
            
            // 進捗追跡システムを初期化
            this.progressTracker = new TutorialProgressTracker();
            
            this.loggingSystem.debug('TutorialOverlay', 'All tutorial components initialized');
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.initializeComponents');
        }
    }
    
    /**
     * コンポーネント間の統合を設定
     */
    setupComponentIntegration(): void {
        try {
            if (!this.interactionHandler || !this.progressTracker) {
                throw new Error('Components not initialized');
            }

            // インタラクションハンドラーのコールバック設定
            this.interactionHandler.setCallback('onNext', () => this.nextStep());
            this.interactionHandler.setCallback('onPrevious', () => this.previousStep());
            this.interactionHandler.setCallback('onSkip', () => this.skipStep());
            this.interactionHandler.setCallback('onComplete', () => this.completeTutorial());
            this.interactionHandler.setCallback('onClose', () => this.closeTutorial());
            this.interactionHandler.setCallback('onHelp', () => this.showHelp());
            this.interactionHandler.setCallback('onResize', () => this.handleResize());
            this.interactionHandler.setCallback('onInteraction', (data: InteractionData) => {
                this.progressTracker!.recordUserAction(data.type, data);
            });
            
            // ジェスチャーコールバック設定
            this.interactionHandler.setGestureCallback('swipeLeft', () => this.nextStep());
            this.interactionHandler.setGestureCallback('swipeRight', () => this.previousStep());
            this.interactionHandler.setGestureCallback('tap', () => this.nextStep());
            this.interactionHandler.setGestureCallback('doubleTap', () => this.skipStep());
            
            this.loggingSystem.debug('TutorialOverlay', 'Component integration setup completed');
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.setupComponentIntegration');
        }
    }

    /**
     * チュートリアルを開始
     * @param tutorial - チュートリアル定義
     * @param options - オプション設定
     */
    async startTutorial(tutorial: Tutorial, options: TutorialOptions = {}): Promise<boolean> {
        try {
            if (this.tutorialState.isActive) {
                this.loggingSystem.warn('TutorialOverlay', 'Tutorial is already active');
                return false;
            }
            
            this.tutorialState.currentTutorial = tutorial;
            this.tutorialState.isActive = true;
            
            // 進捗追跡を開始
            this.progressTracker!.startTracking(tutorial, options.userId);
            
            // ステップマネージャーでチュートリアルを開始
            if (!this.stepManager!.startTutorial(tutorial)) {
                throw new Error('Failed to start tutorial in step manager');
            }
            
            // インタラクションリスナーを開始
            this.interactionHandler!.startListening();
            
            // オーバーレイUIを表示
            this.createOverlayElements();
            this.showOverlay();
            
            // 最初のステップを表示
            this.displayCurrentStep();
            
            this.loggingSystem.info('TutorialOverlay', `Tutorial started: ${tutorial.id}`);
            return true;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.startTutorial');
            this.tutorialState.isActive = false;
            return false;
        }
    }
    
    /**
     * 次のステップに進む
     */
    nextStep(): void {
        try {
            if (!this.stepManager || !this.tutorialState.isActive) {
                return;
            }

            const moved = this.stepManager.nextStep();
            if (moved) {
                this.displayCurrentStep();
                this.progressTracker?.recordStepNavigation('next');
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.nextStep');
        }
    }

    /**
     * 前のステップに戻る
     */
    previousStep(): void {
        try {
            if (!this.stepManager || !this.tutorialState.isActive) {
                return;
            }

            const moved = this.stepManager.previousStep();
            if (moved) {
                this.displayCurrentStep();
                this.progressTracker?.recordStepNavigation('previous');
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.previousStep');
        }
    }

    /**
     * ステップをスキップ
     */
    skipStep(): void {
        try {
            if (!this.stepManager || !this.tutorialState.isActive) {
                return;
            }

            this.progressTracker?.recordStepNavigation('skip');
            this.nextStep();
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.skipStep');
        }
    }

    /**
     * チュートリアルを完了
     */
    completeTutorial(): void {
        try {
            this.progressTracker?.recordTutorialCompletion('completed');
            this.closeTutorial();
            this.loggingSystem.info('TutorialOverlay', 'Tutorial completed successfully');
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.completeTutorial');
        }
    }

    /**
     * チュートリアルを閉じる
     */
    closeTutorial(): void {
        try {
            this.tutorialState.isActive = false;
            this.tutorialState.currentTutorial = null;
            
            // UIを非表示
            this.hideOverlay();
            
            // リスナーを停止
            this.interactionHandler?.stopListening();
            
            // ハイライトをクリア
            this.clearHighlight();
            
            this.loggingSystem.info('TutorialOverlay', 'Tutorial closed');
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.closeTutorial');
        }
    }

    /**
     * ヘルプを表示
     */
    showHelp(): void {
        try {
            // ヘルプ表示の実装
            this.loggingSystem.info('TutorialOverlay', 'Help requested');
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.showHelp');
        }
    }

    /**
     * リサイズ処理
     */
    handleResize(): void {
        try {
            if (this.tutorialState.isActive) {
                this.repositionElements();
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.handleResize');
        }
    }

    /**
     * 現在のステップを表示
     */
    private displayCurrentStep(): void {
        try {
            if (!this.stepManager || !this.tutorialState.isActive) {
                return;
            }

            const currentStep = this.stepManager.getCurrentStep();
            if (!currentStep) {
                this.completeTutorial();
                return;
            }

            // ステップ情報を更新
            this.updateInstructionPanel(currentStep);
            this.updateProgressBar();
            
            // ハイライトを更新
            if (currentStep.targetElement) {
                this.highlightElement(currentStep.targetElement);
            }
            
            // アニメーションを再生
            this.animationController?.playStepAnimation(currentStep);

        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.displayCurrentStep');
        }
    }

    /**
     * オーバーレイ要素を作成
     */
    private createOverlayElements(): void {
        try {
            // メインオーバーレイ
            this.overlay = this.createElement('div', 'tutorial-overlay');
            
            // 指示パネル
            this.instructionPanel = this.createElement('div', 'tutorial-instruction-panel');
            
            // ナビゲーションパネル
            this.navigationPanel = this.createElement('div', 'tutorial-navigation-panel');
            
            // プログレスバー
            this.progressBar = this.createElement('div', 'tutorial-progress-bar');
            
            // DOM に追加
            this.overlay.appendChild(this.instructionPanel);
            this.overlay.appendChild(this.navigationPanel);
            this.overlay.appendChild(this.progressBar);
            document.body.appendChild(this.overlay);

        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.createOverlayElements');
        }
    }

    /**
     * 要素を作成
     */
    private createElement(tag: string, className: string): HTMLElement {
        const element = document.createElement(tag);
        element.className = className;
        return element;
    }

    /**
     * オーバーレイを表示
     */
    private showOverlay(): void {
        try {
            if (this.overlay) {
                this.overlay.style.display = 'block';
                this.animationController?.fadeIn(this.overlay);
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.showOverlay');
        }
    }

    /**
     * オーバーレイを非表示
     */
    private hideOverlay(): void {
        try {
            if (this.overlay) {
                this.animationController?.fadeOut(this.overlay, () => {
                    if (this.overlay && this.overlay.parentNode) {
                        this.overlay.parentNode.removeChild(this.overlay);
                    }
                });
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.hideOverlay');
        }
    }

    /**
     * 指示パネルを更新
     */
    private updateInstructionPanel(step: TutorialStep): void {
        try {
            if (this.instructionPanel) {
                this.instructionPanel.innerHTML = `
                    <h3>${step.title}</h3>
                    <p>${step.instructions}</p>
                `;
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.updateInstructionPanel');
        }
    }

    /**
     * プログレスバーを更新
     */
    private updateProgressBar(): void {
        try {
            if (this.progressBar && this.stepManager) {
                const progress = this.stepManager.getProgress();
                this.progressBar.style.width = `${progress}%`;
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.updateProgressBar');
        }
    }

    /**
     * 要素をハイライト
     */
    highlightElement(selector: string | object): void {
        try {
            this.clearHighlight();
            
            let targetElement: HTMLElement | null = null;
            
            if (typeof selector === 'string') {
                targetElement = document.querySelector(selector) as HTMLElement;
            } else if (selector instanceof HTMLElement) {
                targetElement = selector;
            }
            
            if (targetElement) {
                this.tutorialState.highlightedElement = targetElement;
                this.createHighlightOverlay(targetElement);
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.highlightElement');
        }
    }

    /**
     * ハイライトオーバーレイを作成
     */
    private createHighlightOverlay(element: HTMLElement): void {
        try {
            const rect = element.getBoundingClientRect();
            
            this.highlightElement = this.createElement('div', 'tutorial-highlight');
            this.highlightElement.style.cssText = `
                position: fixed;
                top: ${rect.top - this.layout.highlightPadding}px;
                left: ${rect.left - this.layout.highlightPadding}px;
                width: ${rect.width + this.layout.highlightPadding * 2}px;
                height: ${rect.height + this.layout.highlightPadding * 2}px;
                border: ${this.styles.highlightBorder};
                background: ${this.styles.highlightBackground};
                z-index: ${this.layout.overlayZIndex + 1};
                pointer-events: none;
                border-radius: 4px;
            `;
            
            document.body.appendChild(this.highlightElement);
            this.animationController?.pulseAnimation(this.highlightElement);
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.createHighlightOverlay');
        }
    }

    /**
     * ハイライトをクリア
     */
    clearHighlight(): void {
        try {
            if (this.highlightElement && this.highlightElement.parentNode) {
                this.highlightElement.parentNode.removeChild(this.highlightElement);
                this.highlightElement = null;
            }
            this.tutorialState.highlightedElement = null;
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.clearHighlight');
        }
    }

    /**
     * 要素を再配置
     */
    private repositionElements(): void {
        try {
            if (this.tutorialState.highlightedElement) {
                this.highlightElement(this.tutorialState.highlightedElement);
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.repositionElements');
        }
    }

    /**
     * CSSスタイルを挿入
     */
    private injectStyles(): void {
        try {
            const style = document.createElement('style');
            style.textContent = `
                .tutorial-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: ${this.styles.overlayBackground};
                    z-index: ${this.layout.overlayZIndex};
                    display: none;
                }
                
                .tutorial-instruction-panel {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    width: ${this.layout.instructionPanelWidth}px;
                    max-height: ${this.layout.instructionPanelMaxHeight}px;
                    background: ${this.styles.panelBackground};
                    border: ${this.styles.panelBorder};
                    border-radius: ${this.styles.panelBorderRadius};
                    box-shadow: ${this.styles.panelBoxShadow};
                    padding: 20px;
                    overflow-y: auto;
                }
                
                .tutorial-navigation-panel {
                    position: absolute;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    height: ${this.layout.navigationHeight}px;
                    background: ${this.styles.panelBackground};
                    border: ${this.styles.panelBorder};
                    border-radius: ${this.styles.panelBorderRadius};
                    box-shadow: ${this.styles.panelBoxShadow};
                    padding: 10px 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .tutorial-progress-bar {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: ${this.layout.progressBarHeight}px;
                    background: ${this.styles.progressBarColor};
                    transition: width 0.3s ease;
                    z-index: ${this.layout.overlayZIndex + 1};
                }
            `;
            
            document.head.appendChild(style);
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.injectStyles');
        }
    }

    /**
     * チュートリアルを一時停止
     */
    pause(): void {
        try {
            this.tutorialState.isPaused = true;
            if (this.overlay) {
                this.overlay.style.display = 'none';
            }
            this.loggingSystem.info('TutorialOverlay', 'Tutorial paused');
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.pause');
        }
    }

    /**
     * チュートリアルを再開
     */
    resume(): void {
        try {
            this.tutorialState.isPaused = false;
            if (this.overlay) {
                this.overlay.style.display = 'block';
            }
            this.loggingSystem.info('TutorialOverlay', 'Tutorial resumed');
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.resume');
        }
    }

    /**
     * チュートリアルを表示
     */
    async show(tutorial: Tutorial): Promise<void> {
        try {
            await this.startTutorial(tutorial);
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.show');
        }
    }

    /**
     * チュートリアルを非表示
     */
    hide(): void {
        try {
            this.closeTutorial();
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.hide');
        }
    }

    /**
     * ステップを表示
     */
    showStep(step: TutorialStep): void {
        try {
            this.updateInstructionPanel(step);
            if (step.targetElement) {
                this.highlightElement(step.targetElement);
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.showStep');
        }
    }

    /**
     * リソースのクリーンアップ
     */
    destroy(): void {
        try {
            this.closeTutorial();
            
            // コンポーネントのクリーンアップ
            this.stepManager?.destroy?.();
            this.animationController?.destroy?.();
            this.interactionHandler?.destroy?.();
            this.progressTracker?.destroy?.();
            
            this.loggingSystem.info('TutorialOverlay', 'Tutorial overlay destroyed');
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialOverlay.destroy');
        }
    }
}

// シングルトンインスタンス管理
let tutorialOverlayInstance: TutorialOverlay | null = null;

/**
 * TutorialOverlayのシングルトンインスタンスを取得
 * @param gameEngine - ゲームエンジン
 * @param eventBus - イベントバス
 * @param state - 状態
 * @returns TutorialOverlayインスタンス
 */
export function getTutorialOverlay(gameEngine: GameEngine, eventBus?: any, state?: any): TutorialOverlay {
    if (!tutorialOverlayInstance) {
        tutorialOverlayInstance = new TutorialOverlay(gameEngine, eventBus, state);
    }
    return tutorialOverlayInstance;
}

/**
 * TutorialOverlayインスタンスを再初期化
 * @param gameEngine - ゲームエンジン
 * @param eventBus - イベントバス
 * @param state - 状態
 * @returns 新しいTutorialOverlayインスタンス
 */
export function reinitializeTutorialOverlay(gameEngine: GameEngine, eventBus?: any, state?: any): TutorialOverlay {
    if (tutorialOverlayInstance) {
        tutorialOverlayInstance.destroy();
    }
    tutorialOverlayInstance = new TutorialOverlay(gameEngine, eventBus, state);
    return tutorialOverlayInstance;
}