/**
 * TutorialOverlay.js
 * チュートリアル用オーバーレイUIコンポーネント
 * BaseDialogを拡張してチュートリアル表示、要素ハイライト、ステップナビゲーションを提供
 */

import { BaseDialog } from '../../scenes/components/BaseDialog.js';
import { LoggingSystem } from '../LoggingSystem.js';
import { ErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * チュートリアルオーバーレイクラス
 */
export class TutorialOverlay extends BaseDialog {
    constructor(gameEngine, eventBus, state) {
        super(gameEngine, eventBus, state);
        
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // チュートリアル固有プロパティ
        this.currentTutorial = null;
        this.currentStep = null;
        this.stepIndex = 0;
        this.totalSteps = 0;
        
        // UI要素
        this.overlay = null;
        this.instructionPanel = null;
        this.navigationPanel = null;
        this.progressBar = null;
        this.highlightElement = null;
        this.spotlight = null;
        
        // アニメーション設定
        this.animationConfig = {
            fadeInDuration: 300,
            fadeOutDuration: 200,
            pulseInterval: 2000,
            highlightAnimationDuration: 500,
            panelSlideAnimationDuration: 400
        };
        
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
            progressBarBackground: '#e9ecef'
        };
        
        // イベントハンドラー
        this.boundHandlers = {
            keydown: this.handleKeydown.bind(this),
            resize: this.handleResize.bind(this),
            click: this.handleOverlayClick.bind(this)
        };
        
        this.initialize();
    }

    /**
     * TutorialOverlayの初期化
     */
    async initialize(options = {}) {
        try {
            await super.initialize(options);
            
            // CSSスタイルの追加
            this.injectStyles();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            this.loggingSystem.info('TutorialOverlay', 'Tutorial overlay initialized successfully');
        } catch (error) {
            this.loggingSystem.error('TutorialOverlay', 'Failed to initialize tutorial overlay', error);
            ErrorHandler.handle(error, 'TutorialOverlay.initialize');
        }
    }

    /**
     * チュートリアルの表示
     * @param {Object} tutorial - チュートリアルデータ
     * @param {Object} step - 現在のステップ
     * @param {number} stepIndex - ステップインデックス
     */
    showTutorial(tutorial, step, stepIndex) {
        try {
            this.currentTutorial = tutorial;
            this.currentStep = step;
            this.stepIndex = stepIndex;
            this.totalSteps = tutorial.steps.length;
            
            // オーバーレイの作成
            this.createOverlay();
            
            // 指示パネルの作成
            this.createInstructionPanel();
            
            // ナビゲーションパネルの作成
            this.createNavigationPanel();
            
            // プログレスバーの作成
            this.createProgressBar();
            
            // 要素のハイライト
            if (step.targetElement) {
                this.highlightElement(step.targetElement);
            }
            
            // スポットライト効果
            if (step.spotlight) {
                this.createSpotlight(step.spotlight);
            }
            
            // オーバーレイの表示アニメーション
            this.animateShow();
            
            this.loggingSystem.info('TutorialOverlay', `Tutorial step displayed: ${stepIndex + 1}/${this.totalSteps}`);
        } catch (error) {
            this.loggingSystem.error('TutorialOverlay', 'Failed to show tutorial', error);
            ErrorHandler.handle(error, 'TutorialOverlay.showTutorial');
        }
    }

    /**
     * チュートリアルの非表示
     */
    hideTutorial() {
        try {
            this.animateHide().then(() => {
                this.cleanup();
            });
            
            this.loggingSystem.info('TutorialOverlay', 'Tutorial overlay hidden');
        } catch (error) {
            this.loggingSystem.error('TutorialOverlay', 'Failed to hide tutorial', error);
            this.cleanup();
        }
    }

    /**
     * ステップの更新
     * @param {Object} step - 新しいステップ
     * @param {number} stepIndex - ステップインデックス
     */
    updateStep(step, stepIndex) {
        try {
            this.currentStep = step;
            this.stepIndex = stepIndex;
            
            // 指示パネルの更新
            this.updateInstructionPanel();
            
            // プログレスバーの更新
            this.updateProgressBar();
            
            // ハイライトの更新
            this.clearHighlight();
            if (step.targetElement) {
                this.highlightElement(step.targetElement);
            }
            
            // スポットライトの更新
            this.clearSpotlight();
            if (step.spotlight) {
                this.createSpotlight(step.spotlight);
            }
            
            this.loggingSystem.debug('TutorialOverlay', `Step updated: ${stepIndex + 1}/${this.totalSteps}`);
        } catch (error) {
            this.loggingSystem.error('TutorialOverlay', 'Failed to update step', error);
        }
    }

    // ---- UI作成メソッド ----

    /**
     * オーバーレイの作成
     */
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'tutorial-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${this.styles.overlayBackground};
            z-index: ${this.layout.overlayZIndex};
            opacity: 0;
            transition: opacity ${this.animationConfig.fadeInDuration}ms ease-in-out;
        `;
        
        document.body.appendChild(this.overlay);
    }

    /**
     * 指示パネルの作成
     */
    createInstructionPanel() {
        this.instructionPanel = document.createElement('div');
        this.instructionPanel.className = 'tutorial-instruction-panel';
        this.instructionPanel.style.cssText = `
            position: fixed;
            width: ${this.layout.instructionPanelWidth}px;
            max-height: ${this.layout.instructionPanelMaxHeight}px;
            background: ${this.styles.panelBackground};
            border: ${this.styles.panelBorder};
            border-radius: ${this.styles.panelBorderRadius};
            box-shadow: ${this.styles.panelBoxShadow};
            padding: 20px;
            z-index: ${this.layout.overlayZIndex + 1};
            transform: translateY(-20px);
            opacity: 0;
            transition: all ${this.animationConfig.panelSlideAnimationDuration}ms ease-out;
        `;
        
        // 指示パネルの内容を作成
        this.updateInstructionPanel();
        
        // 位置の計算と設定
        this.positionInstructionPanel();
        
        this.overlay.appendChild(this.instructionPanel);
    }

    /**
     * 指示パネルの内容更新
     */
    updateInstructionPanel() {
        if (!this.instructionPanel || !this.currentStep) return;
        
        const step = this.currentStep;
        
        this.instructionPanel.innerHTML = `
            <div class="tutorial-step-header">
                <h3 class="tutorial-step-title">${step.title}</h3>
                <div class="tutorial-step-counter">${this.stepIndex + 1} / ${this.totalSteps}</div>
            </div>
            <div class="tutorial-step-content">
                <p class="tutorial-step-instructions">${step.instructions}</p>
                ${step.tips ? `<div class="tutorial-step-tips">💡 ${step.tips}</div>` : ''}
                ${step.warning ? `<div class="tutorial-step-warning">⚠️ ${step.warning}</div>` : ''}
            </div>
            ${step.image ? `<div class="tutorial-step-image"><img src="${step.image}" alt="${step.title}" /></div>` : ''}
        `;
    }

    /**
     * ナビゲーションパネルの作成
     */
    createNavigationPanel() {
        this.navigationPanel = document.createElement('div');
        this.navigationPanel.className = 'tutorial-navigation-panel';
        this.navigationPanel.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            gap: 12px;
            background: ${this.styles.panelBackground};
            border: ${this.styles.panelBorder};
            border-radius: 25px;
            padding: 12px 20px;
            box-shadow: ${this.styles.panelBoxShadow};
            z-index: ${this.layout.overlayZIndex + 1};
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
            transition: all ${this.animationConfig.panelSlideAnimationDuration}ms ease-out;
        `;
        
        // ナビゲーションボタンの作成
        this.createNavigationButtons();
        
        this.overlay.appendChild(this.navigationPanel);
    }

    /**
     * ナビゲーションボタンの作成
     */
    createNavigationButtons() {
        const step = this.currentStep;
        
        // 前のステップボタン
        const prevButton = this.createButton('前へ', 'prev', this.stepIndex > 0);
        prevButton.onclick = () => this.navigateStep('previous');
        
        // スキップボタン
        const skipButton = this.createButton('スキップ', 'skip', step.skipAllowed !== false);
        skipButton.onclick = () => this.navigateStep('skip');
        
        // 次のステップボタン
        const nextButton = this.createButton(
            this.stepIndex >= this.totalSteps - 1 ? '完了' : '次へ', 
            'next', 
            true
        );
        nextButton.onclick = () => this.navigateStep('next');
        
        // ヘルプボタン
        const helpButton = this.createButton('?', 'help', true);
        helpButton.onclick = () => this.showStepHelp();
        
        this.navigationPanel.innerHTML = '';
        this.navigationPanel.appendChild(prevButton);
        this.navigationPanel.appendChild(skipButton);
        this.navigationPanel.appendChild(nextButton);
        this.navigationPanel.appendChild(helpButton);
    }

    /**
     * ボタンの作成
     * @param {string} text - ボタンテキスト
     * @param {string} type - ボタンタイプ
     * @param {boolean} enabled - 有効フラグ
     * @returns {HTMLElement} ボタン要素
     */
    createButton(text, type, enabled) {
        const button = document.createElement('button');
        button.className = `tutorial-nav-button tutorial-nav-button-${type}`;
        button.textContent = text;
        button.disabled = !enabled;
        
        const baseStyle = `
            padding: 8px 16px;
            border: none;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 200ms ease;
            outline: none;
        `;
        
        if (enabled) {
            const primaryColor = type === 'next' ? '#007bff' : '#6c757d';
            button.style.cssText = baseStyle + `
                background: ${primaryColor};
                color: white;
            `;
            
            button.onmouseenter = () => {
                button.style.opacity = '0.8';
                button.style.transform = 'scale(1.05)';
            };
            button.onmouseleave = () => {
                button.style.opacity = '1';
                button.style.transform = 'scale(1)';
            };
        } else {
            button.style.cssText = baseStyle + `
                background: #e9ecef;
                color: #6c757d;
                cursor: not-allowed;
            `;
        }
        
        return button;
    }

    /**
     * プログレスバーの作成
     */
    createProgressBar() {
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'tutorial-progress-bar';
        this.progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: ${this.layout.progressBarHeight}px;
            background: ${this.styles.progressBarBackground};
            z-index: ${this.layout.overlayZIndex + 1};
        `;
        
        const progressFill = document.createElement('div');
        progressFill.className = 'tutorial-progress-fill';
        progressFill.style.cssText = `
            height: 100%;
            background: ${this.styles.progressBarColor};
            transition: width 400ms ease-out;
            width: 0%;
        `;
        
        this.progressBar.appendChild(progressFill);
        this.overlay.appendChild(this.progressBar);
        
        // プログレスの更新
        this.updateProgressBar();
    }

    /**
     * プログレスバーの更新
     */
    updateProgressBar() {
        if (!this.progressBar) return;
        
        const progressFill = this.progressBar.querySelector('.tutorial-progress-fill');
        if (progressFill) {
            const progress = ((this.stepIndex + 1) / this.totalSteps) * 100;
            progressFill.style.width = `${progress}%`;
        }
    }

    /**
     * 要素のハイライト
     * @param {string} selector - 要素セレクター
     */
    highlightElement(selector) {
        try {
            const targetElement = document.querySelector(selector);
            if (!targetElement) {
                this.loggingSystem.warn('TutorialOverlay', `Target element not found: ${selector}`);
                return;
            }
            
            const rect = targetElement.getBoundingClientRect();
            
            this.highlightElement = document.createElement('div');
            this.highlightElement.className = 'tutorial-highlight';
            this.highlightElement.style.cssText = `
                position: fixed;
                top: ${rect.top - this.layout.highlightPadding}px;
                left: ${rect.left - this.layout.highlightPadding}px;
                width: ${rect.width + this.layout.highlightPadding * 2}px;
                height: ${rect.height + this.layout.highlightPadding * 2}px;
                border: ${this.styles.highlightBorder};
                background: ${this.styles.highlightBackground};
                border-radius: 8px;
                z-index: ${this.layout.overlayZIndex + 2};
                pointer-events: none;
                animation: tutorial-highlight-pulse ${this.animationConfig.pulseInterval}ms infinite;
            `;
            
            this.overlay.appendChild(this.highlightElement);
            
            this.loggingSystem.debug('TutorialOverlay', `Element highlighted: ${selector}`);
        } catch (error) {
            this.loggingSystem.error('TutorialOverlay', `Failed to highlight element: ${selector}`, error);
        }
    }

    /**
     * スポットライト効果の作成
     * @param {Object} spotlightConfig - スポットライト設定
     */
    createSpotlight(spotlightConfig) {
        try {
            const { x, y, radius = this.layout.spotlightRadius } = spotlightConfig;
            
            this.spotlight = document.createElement('div');
            this.spotlight.className = 'tutorial-spotlight';
            this.spotlight.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at ${x}px ${y}px, transparent ${radius}px, rgba(0, 0, 0, 0.8) ${radius + 20}px);
                z-index: ${this.layout.overlayZIndex + 1};
                pointer-events: none;
            `;
            
            this.overlay.appendChild(this.spotlight);
        } catch (error) {
            this.loggingSystem.error('TutorialOverlay', 'Failed to create spotlight', error);
        }
    }

    // ---- イベントハンドリング ----

    /**
     * ステップナビゲーション
     * @param {string} direction - ナビゲーション方向
     */
    navigateStep(direction) {
        try {
            if (this.eventBus) {
                this.eventBus.emit('tutorial_navigate', {
                    direction,
                    currentStep: this.stepIndex,
                    totalSteps: this.totalSteps
                });
            }
            
            this.loggingSystem.debug('TutorialOverlay', `Navigation requested: ${direction}`);
        } catch (error) {
            this.loggingSystem.error('TutorialOverlay', `Failed to navigate: ${direction}`, error);
        }
    }

    /**
     * ステップヘルプの表示
     */
    showStepHelp() {
        try {
            const step = this.currentStep;
            if (step.helpContent) {
                // ヘルプコンテンツの表示
                this.showHelpModal(step.helpContent);
            } else {
                // デフォルトヘルプの表示
                this.showHelpModal({
                    title: 'ヘルプ',
                    content: 'このステップに関する詳細な情報は現在利用できません。'
                });
            }
        } catch (error) {
            this.loggingSystem.error('TutorialOverlay', 'Failed to show step help', error);
        }
    }

    /**
     * ヘルプモーダルの表示
     * @param {Object} helpContent - ヘルプコンテンツ
     */
    showHelpModal(helpContent) {
        // ヘルプモーダルの実装は後続のタスクで対応
        console.log('ヘルプモーダル:', helpContent);
    }

    /**
     * キーボードイベントハンドラー
     * @param {KeyboardEvent} event - キーボードイベント
     */
    handleKeydown(event) {
        try {
            switch (event.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    event.preventDefault();
                    this.navigateStep('previous');
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                case ' ':
                    event.preventDefault();
                    this.navigateStep('next');
                    break;
                case 'Escape':
                    event.preventDefault();
                    this.navigateStep('skip');
                    break;
                case 'F1':
                    event.preventDefault();
                    this.showStepHelp();
                    break;
            }
        } catch (error) {
            this.loggingSystem.error('TutorialOverlay', 'Failed to handle keydown', error);
        }
    }

    /**
     * リサイズイベントハンドラー
     */
    handleResize() {
        try {
            // 指示パネルの位置を再計算
            this.positionInstructionPanel();
            
            // ハイライトの位置を更新
            if (this.highlightElement && this.currentStep && this.currentStep.targetElement) {
                this.clearHighlight();
                this.highlightElement(this.currentStep.targetElement);
            }
        } catch (error) {
            this.loggingSystem.error('TutorialOverlay', 'Failed to handle resize', error);
        }
    }

    /**
     * オーバーレイクリックハンドラー
     * @param {MouseEvent} event - マウスイベント
     */
    handleOverlayClick(event) {
        // オーバーレイ背景のクリックでスキップ（設定で無効化可能）
        if (event.target === this.overlay) {
            this.navigateStep('skip');
        }
    }

    // ---- ユーティリティメソッド ----

    /**
     * 指示パネルの位置計算
     */
    positionInstructionPanel() {
        if (!this.instructionPanel) return;
        
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const panelWidth = this.layout.instructionPanelWidth;
        
        // デフォルトは右上に配置
        let left = windowWidth - panelWidth - 20;
        let top = 80;
        
        // ターゲット要素がある場合は適切な位置に配置
        if (this.currentStep && this.currentStep.targetElement) {
            const targetElement = document.querySelector(this.currentStep.targetElement);
            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                
                // ターゲット要素の位置に応じて配置を調整
                if (rect.left > panelWidth + 40) {
                    // 左側に配置
                    left = rect.left - panelWidth - 20;
                    top = Math.max(20, rect.top);
                } else if (windowWidth - rect.right > panelWidth + 40) {
                    // 右側に配置
                    left = rect.right + 20;
                    top = Math.max(20, rect.top);
                } else if (rect.top > 200) {
                    // 上側に配置
                    left = Math.max(20, Math.min(windowWidth - panelWidth - 20, rect.left));
                    top = Math.max(20, rect.top - 160);
                } else {
                    // 下側に配置
                    left = Math.max(20, Math.min(windowWidth - panelWidth - 20, rect.left));
                    top = rect.bottom + 20;
                }
            }
        }
        
        // 画面外に出ないように調整
        left = Math.max(20, Math.min(windowWidth - panelWidth - 20, left));
        top = Math.max(20, Math.min(windowHeight - 200, top));
        
        this.instructionPanel.style.left = `${left}px`;
        this.instructionPanel.style.top = `${top}px`;
    }

    /**
     * ハイライトのクリア
     */
    clearHighlight() {
        if (this.highlightElement) {
            this.highlightElement.remove();
            this.highlightElement = null;
        }
    }

    /**
     * スポットライトのクリア
     */
    clearSpotlight() {
        if (this.spotlight) {
            this.spotlight.remove();
            this.spotlight = null;
        }
    }

    /**
     * 表示アニメーション
     */
    async animateShow() {
        return new Promise((resolve) => {
            if (!this.overlay) {
                resolve();
                return;
            }
            
            // オーバーレイのフェードイン
            this.overlay.style.opacity = '1';
            
            // パネルのスライドイン
            setTimeout(() => {
                if (this.instructionPanel) {
                    this.instructionPanel.style.opacity = '1';
                    this.instructionPanel.style.transform = 'translateY(0)';
                }
                if (this.navigationPanel) {
                    this.navigationPanel.style.opacity = '1';
                    this.navigationPanel.style.transform = 'translateX(-50%) translateY(0)';
                }
            }, 100);
            
            setTimeout(resolve, this.animationConfig.fadeInDuration);
        });
    }

    /**
     * 非表示アニメーション
     */
    async animateHide() {
        return new Promise((resolve) => {
            if (!this.overlay) {
                resolve();
                return;
            }
            
            // パネルのスライドアウト
            if (this.instructionPanel) {
                this.instructionPanel.style.opacity = '0';
                this.instructionPanel.style.transform = 'translateY(-20px)';
            }
            if (this.navigationPanel) {
                this.navigationPanel.style.opacity = '0';
                this.navigationPanel.style.transform = 'translateX(-50%) translateY(20px)';
            }
            
            // オーバーレイのフェードアウト
            setTimeout(() => {
                if (this.overlay) {
                    this.overlay.style.opacity = '0';
                }
            }, 100);
            
            setTimeout(resolve, this.animationConfig.fadeOutDuration);
        });
    }

    /**
     * CSSスタイルの注入
     */
    injectStyles() {
        if (document.getElementById('tutorial-overlay-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'tutorial-overlay-styles';
        styles.textContent = `
            @keyframes tutorial-highlight-pulse {
                0%, 100% { opacity: 0.6; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.02); }
            }
            
            .tutorial-step-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                padding-bottom: 12px;
                border-bottom: 1px solid #e9ecef;
            }
            
            .tutorial-step-title {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: #333;
            }
            
            .tutorial-step-counter {
                background: #007bff;
                color: white;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
            }
            
            .tutorial-step-instructions {
                margin: 0 0 16px 0;
                line-height: 1.6;
                color: #555;
            }
            
            .tutorial-step-tips {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 6px;
                padding: 12px;
                margin: 12px 0;
                font-size: 14px;
                color: #856404;
            }
            
            .tutorial-step-warning {
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                border-radius: 6px;
                padding: 12px;
                margin: 12px 0;
                font-size: 14px;
                color: #721c24;
            }
            
            .tutorial-step-image img {
                max-width: 100%;
                height: auto;
                border-radius: 6px;
                margin-top: 12px;
            }
            
            .tutorial-nav-button:focus {
                box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
            }
        `;
        
        document.head.appendChild(styles);
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        document.addEventListener('keydown', this.boundHandlers.keydown);
        window.addEventListener('resize', this.boundHandlers.resize);
    }

    /**
     * イベントリスナーの削除
     */
    removeEventListeners() {
        document.removeEventListener('keydown', this.boundHandlers.keydown);
        window.removeEventListener('resize', this.boundHandlers.resize);
    }

    /**
     * リソースのクリーンアップ
     */
    cleanup() {
        try {
            // イベントリスナーの削除
            this.removeEventListeners();
            
            // UI要素の削除
            this.clearHighlight();
            this.clearSpotlight();
            
            if (this.overlay) {
                this.overlay.remove();
                this.overlay = null;
            }
            
            // 参照のクリア
            this.instructionPanel = null;
            this.navigationPanel = null;
            this.progressBar = null;
            this.currentTutorial = null;
            this.currentStep = null;
            
            this.loggingSystem.info('TutorialOverlay', 'Tutorial overlay cleaned up');
        } catch (error) {
            this.loggingSystem.error('TutorialOverlay', 'Failed to cleanup tutorial overlay', error);
        }
    }

    /**
     * リソースの破棄
     */
    destroy() {
        try {
            this.cleanup();
            
            // スタイルの削除
            const styleElement = document.getElementById('tutorial-overlay-styles');
            if (styleElement) {
                styleElement.remove();
            }
            
            this.loggingSystem.info('TutorialOverlay', 'Tutorial overlay destroyed');
        } catch (error) {
            this.loggingSystem.error('TutorialOverlay', 'Failed to destroy tutorial overlay', error);
        }
    }
}

// シングルトンインスタンス管理
let tutorialOverlayInstance = null;

/**
 * TutorialOverlayのシングルトンインスタンスを取得
 * @param {Object} gameEngine - ゲームエンジン
 * @param {Object} eventBus - イベントバス
 * @param {Object} state - 状態
 * @returns {TutorialOverlay} TutorialOverlayインスタンス
 */
export function getTutorialOverlay(gameEngine, eventBus, state) {
    if (!tutorialOverlayInstance) {
        tutorialOverlayInstance = new TutorialOverlay(gameEngine, eventBus, state);
    }
    return tutorialOverlayInstance;
}

/**
 * TutorialOverlayインスタンスを再初期化
 * @param {Object} gameEngine - ゲームエンジン
 * @param {Object} eventBus - イベントバス
 * @param {Object} state - 状態
 * @returns {TutorialOverlay} 新しいTutorialOverlayインスタンス
 */
export function reinitializeTutorialOverlay(gameEngine, eventBus, state) {
    if (tutorialOverlayInstance) {
        tutorialOverlayInstance.destroy();
    }
    tutorialOverlayInstance = new TutorialOverlay(gameEngine, eventBus, state);
    return tutorialOverlayInstance;
}