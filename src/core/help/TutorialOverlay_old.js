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
        
        // 拡張アニメーション設定
        this.animationConfig = {
            fadeInDuration: 300,
            fadeOutDuration: 200,
            pulseInterval: 2000,
            highlightAnimationDuration: 500,
            panelSlideAnimationDuration: 400,
            // 新しいアニメーション設定
            breathingPulseDuration: 3000,
            rippleAnimationDuration: 1500,
            sparkleAnimationDuration: 2000,
            glowIntensity: 0.8,
            bounceHeight: 15,
            bounceDuration: 800
        };
        
        // アニメーション状態
        this.animations = {
            highlight: {
                isActive: false,
                startTime: 0,
                type: 'pulse', // 'pulse', 'breathing', 'ripple', 'sparkle', 'bounce'
                intensity: 1.0,
                currentFrame: 0
            },
            panel: {
                isActive: false,
                startTime: 0,
                type: 'slideIn', // 'slideIn', 'slideOut', 'bounceIn', 'scaleIn'
                direction: 'bottom', // 'top', 'bottom', 'left', 'right'
                progress: 0
            },
            spotlight: {
                isActive: false,
                startTime: 0,
                currentRadius: 0,
                targetRadius: 0,
                expansion: false
            }
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
        
        // 拡張スタイル設定
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
            // 新しいスタイル
            glowColor: '#007bff',
            rippleColor: 'rgba(0, 123, 255, 0.3)',
            sparkleColor: '#ffd700',
            pulseColor: 'rgba(0, 123, 255, 0.4)'
        };
        
        // イベントハンドラー
        this.boundHandlers = {
            keydown: this.handleKeydown.bind(this),
            resize: this.handleResize.bind(this),
            click: this.handleOverlayClick.bind(this)
        };
        
        // アクセシビリティ設定
        this.accessibility = {
            enabled: false,
            highContrast: false,
            largeText: false,
            screenReaderMode: false,
            reducedMotion: false,
            keyboardNavigation: true,
            focusIndicators: true,
            textSizeMultiplier: 1.0,
            colorAdjustment: {
                contrastRatio: 1.0,
                brightness: 1.0
            }
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
     * ハイライトアニメーションの開始
     * @param {string} type - アニメーションタイプ ('pulse', 'breathing', 'ripple', 'sparkle', 'bounce')
     * @param {number} intensity - アニメーション強度 (0.1-2.0)
     */
    startHighlightAnimation(type = 'pulse', intensity = 1.0) {
        this.animations.highlight = {
            isActive: true,
            startTime: Date.now(),
            type: type,
            intensity: intensity,
            currentFrame: 0
        };
        
        this.loggingSystem.debug('TutorialOverlay', `Highlight animation started: ${type}, intensity: ${intensity}`);
    }
    
    /**
     * パネルアニメーションの開始
     * @param {string} type - アニメーションタイプ ('slideIn', 'slideOut', 'bounceIn', 'scaleIn')
     * @param {string} direction - 方向 ('top', 'bottom', 'left', 'right')
     */
    startPanelAnimation(type = 'slideIn', direction = 'bottom') {
        this.animations.panel = {
            isActive: true,
            startTime: Date.now(),
            type: type,
            direction: direction,
            progress: 0
        };
        
        this.loggingSystem.debug('TutorialOverlay', `Panel animation started: ${type} from ${direction}`);
    }
    
    /**
     * スポットライトアニメーションの開始
     * @param {number} targetRadius - 目標半径
     * @param {boolean} expansion - 拡張するかどうか
     */
    startSpotlightAnimation(targetRadius, expansion = true) {
        this.animations.spotlight = {
            isActive: true,
            startTime: Date.now(),
            currentRadius: expansion ? 0 : this.layout.spotlightRadius,
            targetRadius: targetRadius,
            expansion: expansion
        };
        
        this.loggingSystem.debug('TutorialOverlay', `Spotlight animation started: radius ${targetRadius}, expansion: ${expansion}`);
    }
    
    /**
     * アニメーション更新処理
     * @param {number} currentTime - 現在時刻
     */
    updateAnimations(currentTime) {
        this.updateHighlightAnimation(currentTime);
        this.updatePanelAnimation(currentTime);
        this.updateSpotlightAnimation(currentTime);
    }
    
    /**
     * ハイライトアニメーションの更新
     * @param {number} currentTime - 現在時刻
     */
    updateHighlightAnimation(currentTime) {
        if (!this.animations.highlight.isActive) return;
        
        const animation = this.animations.highlight;
        let duration;
        
        switch (animation.type) {
            case 'pulse':
                duration = this.animationConfig.pulseInterval;
                break;
            case 'breathing':
                duration = this.animationConfig.breathingPulseDuration;
                break;
            case 'ripple':
                duration = this.animationConfig.rippleAnimationDuration;
                break;
            case 'sparkle':
                duration = this.animationConfig.sparkleAnimationDuration;
                break;
            case 'bounce':
                duration = this.animationConfig.bounceDuration;
                break;
            default:
                duration = this.animationConfig.pulseInterval;
        }
        
        const elapsed = currentTime - animation.startTime;
        const cycle = Math.floor(elapsed / duration);
        const progress = (elapsed % duration) / duration;
        
        animation.currentFrame = progress;
        
        // アニメーションのスタイルを要素に適用
        this.applyHighlightAnimationStyles(animation);
    }
    
    /**
     * パネルアニメーションの更新
     * @param {number} currentTime - 現在時刻
     */
    updatePanelAnimation(currentTime) {
        if (!this.animations.panel.isActive) return;
        
        const animation = this.animations.panel;
        const elapsed = currentTime - animation.startTime;
        const duration = this.animationConfig.panelSlideAnimationDuration;
        const progress = Math.min(elapsed / duration, 1);
        
        // イージング関数適用
        animation.progress = this.easeOutBounce(progress);
        
        if (progress >= 1) {
            animation.isActive = false;
            this.loggingSystem.debug('TutorialOverlay', 'Panel animation completed');
        }
        
        this.applyPanelAnimationStyles(animation);
    }
    
    /**
     * スポットライトアニメーションの更新
     * @param {number} currentTime - 現在時刻
     */
    updateSpotlightAnimation(currentTime) {
        if (!this.animations.spotlight.isActive) return;
        
        const animation = this.animations.spotlight;
        const elapsed = currentTime - animation.startTime;
        const duration = 500; // 500ms
        const progress = Math.min(elapsed / duration, 1);
        
        const startRadius = animation.expansion ? 0 : this.layout.spotlightRadius;
        const endRadius = animation.targetRadius;
        
        animation.currentRadius = startRadius + (endRadius - startRadius) * this.easeOutCubic(progress);
        
        if (progress >= 1) {
            animation.isActive = false;
            this.loggingSystem.debug('TutorialOverlay', 'Spotlight animation completed');
        }
    }
    
    /**
     * ハイライトアニメーションスタイルの適用
     * @param {Object} animation - アニメーション情報
     */
    applyHighlightAnimationStyles(animation) {
        if (!this.highlightElement) return;
        
        const element = this.highlightElement;
        const frame = animation.currentFrame;
        const intensity = animation.intensity;
        
        switch (animation.type) {
            case 'pulse':
                this.applyPulseEffect(element, frame, intensity);
                break;
            case 'breathing':
                this.applyBreathingEffect(element, frame, intensity);
                break;
            case 'ripple':
                this.applyRippleEffect(element, frame, intensity);
                break;
            case 'sparkle':
                this.applySparkleEffect(element, frame, intensity);
                break;
            case 'bounce':
                this.applyBounceEffect(element, frame, intensity);
                break;
        }
    }
    
    /**
     * パルス効果の適用
     * @param {HTMLElement} element - 対象要素
     * @param {number} frame - アニメーションフレーム (0-1)
     * @param {number} intensity - 強度
     */
    applyPulseEffect(element, frame, intensity) {
        const scale = 1 + Math.sin(frame * 2 * Math.PI) * 0.1 * intensity;
        const glow = Math.sin(frame * 2 * Math.PI) * 0.5 + 0.5;
        
        element.style.transform = `scale(${scale})`;
        element.style.boxShadow = `0 0 ${20 * glow * intensity}px ${this.styles.glowColor}`;
        element.style.borderColor = this.adjustColorOpacity(this.styles.highlightBorder, 0.7 + glow * 0.3);
    }
    
    /**
     * ブリージング効果の適用
     * @param {HTMLElement} element - 対象要素
     * @param {number} frame - アニメーションフレーム (0-1)
     * @param {number} intensity - 強度
     */
    applyBreathingEffect(element, frame, intensity) {
        const breathe = Math.sin(frame * 2 * Math.PI) * 0.5 + 0.5;
        const scale = 1 + breathe * 0.05 * intensity;
        const opacity = 0.8 + breathe * 0.2;
        
        element.style.transform = `scale(${scale})`;
        element.style.opacity = opacity;
        element.style.filter = `brightness(${1 + breathe * 0.2})`;
    }
    
    /**
     * リップル効果の適用
     * @param {HTMLElement} element - 対象要素
     * @param {number} frame - アニメーションフレーム (0-1)
     * @param {number} intensity - 強度
     */
    applyRippleEffect(element, frame, intensity) {
        const rippleRadius = frame * 100 * intensity;
        const rippleOpacity = (1 - frame) * 0.6;
        
        // 疑似要素でリップル効果を実現（CSS keyframesを動的生成）
        if (!element.rippleStyle) {
            element.rippleStyle = document.createElement('style');
            document.head.appendChild(element.rippleStyle);
        }
        
        element.rippleStyle.textContent = `
            .tutorial-highlight-ripple::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: ${rippleRadius * 2}px;
                height: ${rippleRadius * 2}px;
                margin: -${rippleRadius}px;
                border: 2px solid ${this.styles.rippleColor};
                border-radius: 50%;
                opacity: ${rippleOpacity};
                pointer-events: none;
            }
        `;
        
        element.classList.add('tutorial-highlight-ripple');
    }
    
    /**
     * スパークル効果の適用
     * @param {HTMLElement} element - 対象要素
     * @param {number} frame - アニメーションフレーム (0-1)
     * @param {number} intensity - 強度
     */
    applySparkleEffect(element, frame, intensity) {
        // スパークル要素を動的に生成・管理
        if (!element.sparkles) {
            element.sparkles = [];
            for (let i = 0; i < 6; i++) {
                const sparkle = document.createElement('div');
                sparkle.className = 'tutorial-sparkle';
                sparkle.style.cssText = `
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: ${this.styles.sparkleColor};
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 1001;
                `;
                element.appendChild(sparkle);
                element.sparkles.push(sparkle);
            }
        }
        
        // スパークルの位置をアニメート
        element.sparkles.forEach((sparkle, index) => {
            const angle = (index / element.sparkles.length) * 2 * Math.PI + frame * 2 * Math.PI;
            const radius = 30 + Math.sin(frame * 4 * Math.PI + index) * 15;
            const x = Math.cos(angle) * radius * intensity;
            const y = Math.sin(angle) * radius * intensity;
            const opacity = (Math.sin(frame * 4 * Math.PI + index) + 1) * 0.5;
            
            sparkle.style.transform = `translate(${x}px, ${y}px)`;
            sparkle.style.opacity = opacity;
        });
    }
    
    /**
     * バウンス効果の適用
     * @param {HTMLElement} element - 対象要素
     * @param {number} frame - アニメーションフレーム (0-1)
     * @param {number} intensity - 強度
     */
    applyBounceEffect(element, frame, intensity) {
        const bounce = Math.abs(Math.sin(frame * 4 * Math.PI)) * this.animationConfig.bounceHeight * intensity;
        const scale = 1 + bounce * 0.01;
        
        element.style.transform = `translateY(-${bounce}px) scale(${scale})`;
        element.style.filter = `drop-shadow(0 ${bounce + 5}px ${bounce * 0.5}px rgba(0,0,0,0.3))`;
    }
    
    /**
     * パネルアニメーションスタイルの適用
     * @param {Object} animation - アニメーション情報
     */
    applyPanelAnimationStyles(animation) {
        if (!this.instructionPanel) return;
        
        const progress = animation.progress;
        const panel = this.instructionPanel;
        
        switch (animation.type) {
            case 'slideIn':
                this.applySlideInEffect(panel, animation.direction, progress);
                break;
            case 'slideOut':
                this.applySlideOutEffect(panel, animation.direction, progress);
                break;
            case 'bounceIn':
                this.applyBounceInEffect(panel, progress);
                break;
            case 'scaleIn':
                this.applyScaleInEffect(panel, progress);
                break;
        }
    }
    
    /**
     * スライドイン効果の適用
     * @param {HTMLElement} panel - パネル要素
     * @param {string} direction - 方向
     * @param {number} progress - 進捗 (0-1)
     */
    applySlideInEffect(panel, direction, progress) {
        const distance = 100; // px
        let x = 0, y = 0;
        
        switch (direction) {
            case 'top':
                y = -distance * (1 - progress);
                break;
            case 'bottom':
                y = distance * (1 - progress);
                break;
            case 'left':
                x = -distance * (1 - progress);
                break;
            case 'right':
                x = distance * (1 - progress);
                break;
        }
        
        panel.style.transform = `translate(${x}px, ${y}px)`;
        panel.style.opacity = progress;
    }
    
    /**
     * バウンスイン効果の適用
     * @param {HTMLElement} panel - パネル要素
     * @param {number} progress - 進捗 (0-1)
     */
    applyBounceInEffect(panel, progress) {
        const scale = this.easeOutBounce(progress);
        panel.style.transform = `scale(${scale})`;
        panel.style.opacity = progress;
    }
    
    /**
     * スケールイン効果の適用
     * @param {HTMLElement} panel - パネル要素
     * @param {number} progress - 進捗 (0-1)
     */
    applyScaleInEffect(panel, progress) {
        const scale = 0.8 + progress * 0.2;
        panel.style.transform = `scale(${scale})`;
        panel.style.opacity = progress;
    }
    
    /**
     * イージング関数 - ease-out-bounce
     * @param {number} t - 進捗 (0-1)
     * @returns {number} イージングされた値
     */
    easeOutBounce(t) {
        if (t < 1 / 2.75) {
            return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
            return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
            return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
            return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
    }
    
    /**
     * イージング関数 - ease-out-cubic
     * @param {number} t - 進捗 (0-1)
     * @returns {number} イージングされた値
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    /**
     * 色の透明度を調整
     * @param {string} color - 色文字列
     * @param {number} opacity - 透明度 (0-1)
     * @returns {string} 調整された色文字列
     */
    adjustColorOpacity(color, opacity) {
        if (color.startsWith('rgba(')) {
            return color.replace(/,\s*[\d.]+\)$/, `, ${opacity})`);
        } else if (color.startsWith('rgb(')) {
            return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
        }
        return color;
    }

    /**
     * チュートリアルの表示
     * @param {Object} tutorial - チュートリアルデータ
     * @param {Object} step - 現在のステップ
     * @param {number} stepIndex - ステップインデックス
     */
    async showTutorial(tutorial, step, stepIndex) {
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
            
            // 要素のハイライト（アニメーション付き）
            if (step.targetElement) {
                this.highlightElement(step.targetElement);
                
                // ハイライトアニメーションの開始
                const animationType = step.highlightAnimation || 'breathing';
                const intensity = step.animationIntensity || 1.0;
                this.startHighlightAnimation(animationType, intensity);
            }
            
            // スポットライト効果（アニメーション付き）
            if (step.spotlight) {
                this.createSpotlight(step.spotlight);
                this.startSpotlightAnimation(step.spotlight.radius || this.layout.spotlightRadius, true);
            }
            
            // パネルアニメーションの開始
            const panelAnimation = step.panelAnimation || 'bounceIn';
            const panelDirection = step.panelDirection || 'bottom';
            this.startPanelAnimation(panelAnimation, panelDirection);
            
            // オーバーレイの表示アニメーション
            await this.animateShow();
            
            // フォーカス管理の設定
            this.setupFocusManagement();
            
            this.loggingSystem.info('TutorialOverlay', `Tutorial step displayed: ${stepIndex + 1}/${this.totalSteps} with animations`);
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

    /**
     * アクセシビリティ設定を更新
     * @param {Object} settings - アクセシビリティ設定
     */
    updateAccessibilitySettings(settings) {
        try {
            this.accessibility = { ...this.accessibility, ...settings };
            
            // 既存のUI要素にアクセシビリティ設定を適用
            if (this.overlay) {
                this.applyAccessibilityStyles();
            }
            
            // アニメーション設定の調整
            if (this.accessibility.reducedMotion) {
                this.disableAnimations();
            } else {
                this.enableAnimations();
            }
            
            this.loggingSystem.log('TutorialOverlay アクセシビリティ設定が更新されました', 'info');
        } catch (error) {
            this.loggingSystem.log(`アクセシビリティ設定更新エラー: ${error.message}`, 'error');
        }
    }

    /**
     * アクセシビリティスタイルを適用
     */
    applyAccessibilityStyles() {
        if (!this.overlay) return;

        try {
            // 高コントラストモード
            if (this.accessibility.highContrast) {
                this.applyHighContrastStyles();
            } else {
                this.removeHighContrastStyles();
            }

            // 大きな文字表示
            if (this.accessibility.largeText) {
                this.applyLargeTextStyles();
            } else {
                this.removeLargeTextStyles();
            }

            // フォーカスインジケーター
            if (this.accessibility.focusIndicators) {
                this.enableFocusIndicators();
            }

            // スクリーンリーダー対応
            if (this.accessibility.screenReaderMode) {
                this.enableScreenReaderSupport();
            }

        } catch (error) {
            this.loggingSystem.log(`アクセシビリティスタイル適用エラー: ${error.message}`, 'error');
        }
    }

    /**
     * 高コントラストスタイルを適用
     */
    applyHighContrastStyles() {
        const overlay = this.overlay;
        if (!overlay) return;

        // オーバーレイの背景を濃くする
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';

        // インストラクションパネルのスタイル
        if (this.instructionPanel) {
            this.instructionPanel.style.backgroundColor = '#000000';
            this.instructionPanel.style.color = '#ffffff';
            this.instructionPanel.style.border = '3px solid #ffffff';
        }

        // ナビゲーションボタンのスタイル
        const buttons = overlay.querySelectorAll('button');
        buttons.forEach(button => {
            button.style.backgroundColor = '#ffffff';
            button.style.color = '#000000';
            button.style.border = '2px solid #ffffff';
            button.style.fontWeight = 'bold';
        });

        // プログレスバーのスタイル
        if (this.progressBar) {
            this.progressBar.style.backgroundColor = '#ffffff';
            const progressFill = this.progressBar.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.backgroundColor = '#00ff00';
            }
        }

        // ハイライト要素のスタイル
        if (this.highlightElement) {
            this.highlightElement.style.border = '4px solid #ffff00';
            this.highlightElement.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
        }
    }

    /**
     * 高コントラストスタイルを除去
     */
    removeHighContrastStyles() {
        const overlay = this.overlay;
        if (!overlay) return;

        // デフォルトスタイルに戻す
        overlay.style.backgroundColor = this.styles.overlayBackground;

        if (this.instructionPanel) {
            this.instructionPanel.style.backgroundColor = this.styles.panelBackground;
            this.instructionPanel.style.color = '#333333';
            this.instructionPanel.style.border = this.styles.panelBorder;
        }

        // ボタンスタイルをリセット
        const buttons = overlay.querySelectorAll('button');
        buttons.forEach(button => {
            button.style.backgroundColor = '';
            button.style.color = '';
            button.style.border = '';
            button.style.fontWeight = '';
        });

        // プログレスバーとハイライトもリセット
        if (this.progressBar) {
            this.progressBar.style.backgroundColor = this.styles.progressBarBackground;
        }

        if (this.highlightElement) {
            this.highlightElement.style.border = this.styles.highlightBorder;
            this.highlightElement.style.backgroundColor = this.styles.highlightBackground;
        }
    }

    /**
     * 大きな文字スタイルを適用
     */
    applyLargeTextStyles() {
        const multiplier = this.accessibility.textSizeMultiplier;
        
        if (this.instructionPanel) {
            const textElements = this.instructionPanel.querySelectorAll('p, span, div, button');
            textElements.forEach(element => {
                const currentSize = parseFloat(getComputedStyle(element).fontSize);
                element.style.fontSize = `${currentSize * multiplier}px`;
                element.style.lineHeight = '1.6';
            });

            // パネルサイズの調整
            this.instructionPanel.style.width = `${this.layout.instructionPanelWidth * multiplier}px`;
            this.instructionPanel.style.maxHeight = `${this.layout.instructionPanelMaxHeight * multiplier}px`;
        }
    }

    /**
     * 大きな文字スタイルを除去
     */
    removeLargeTextStyles() {
        if (this.instructionPanel) {
            const textElements = this.instructionPanel.querySelectorAll('p, span, div, button');
            textElements.forEach(element => {
                element.style.fontSize = '';
                element.style.lineHeight = '';
            });

            // パネルサイズをリセット
            this.instructionPanel.style.width = `${this.layout.instructionPanelWidth}px`;
            this.instructionPanel.style.maxHeight = `${this.layout.instructionPanelMaxHeight}px`;
        }
    }

    /**
     * フォーカスインジケーターを有効化
     */
    enableFocusIndicators() {
        if (!this.overlay) return;

        const focusableElements = this.overlay.querySelectorAll('button, [tabindex="0"]');
        focusableElements.forEach(element => {
            element.style.outline = '3px solid #007bff';
            element.style.outlineOffset = '2px';
            
            // フォーカス時のスタイル
            element.addEventListener('focus', () => {
                element.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.5)';
            });
            
            element.addEventListener('blur', () => {
                element.style.boxShadow = '';
            });
        });
    }

    /**
     * スクリーンリーダーサポートを有効化
     */
    enableScreenReaderSupport() {
        if (!this.overlay) return;

        // ARIA属性の追加
        this.overlay.setAttribute('role', 'dialog');
        this.overlay.setAttribute('aria-modal', 'true');
        this.overlay.setAttribute('aria-labelledby', 'tutorial-title');
        this.overlay.setAttribute('aria-describedby', 'tutorial-content');

        if (this.instructionPanel) {
            this.instructionPanel.setAttribute('role', 'main');
            
            // タイトル要素にIDを追加
            const titleElement = this.instructionPanel.querySelector('h3, .tutorial-title');
            if (titleElement) {
                titleElement.id = 'tutorial-title';
                titleElement.setAttribute('aria-level', '1');
            }

            // コンテンツ要素にIDを追加
            const contentElement = this.instructionPanel.querySelector('p, .tutorial-content');
            if (contentElement) {
                contentElement.id = 'tutorial-content';
            }
        }

        // ナビゲーションボタンのARIA属性
        const buttons = this.overlay.querySelectorAll('button');
        buttons.forEach((button, index) => {
            if (button.textContent.includes('次へ') || button.textContent.includes('Next')) {
                button.setAttribute('aria-label', '次のステップに進む');
            } else if (button.textContent.includes('前へ') || button.textContent.includes('Previous')) {
                button.setAttribute('aria-label', '前のステップに戻る');
            } else if (button.textContent.includes('スキップ') || button.textContent.includes('Skip')) {
                button.setAttribute('aria-label', 'チュートリアルをスキップ');
            } else if (button.textContent.includes('完了') || button.textContent.includes('Complete')) {
                button.setAttribute('aria-label', 'チュートリアルを完了');
            }
        });

        // プログレスバーのARIA属性
        if (this.progressBar) {
            this.progressBar.setAttribute('role', 'progressbar');
            this.progressBar.setAttribute('aria-valuemin', '0');
            this.progressBar.setAttribute('aria-valuemax', this.totalSteps.toString());
            this.progressBar.setAttribute('aria-valuenow', (this.stepIndex + 1).toString());
            this.progressBar.setAttribute('aria-label', `チュートリアル進捗: ${this.stepIndex + 1}/${this.totalSteps}`);
        }
    }

    /**
     * アニメーションを無効化（動きの軽減対応）
     */
    disableAnimations() {
        this.animationConfig = {
            fadeInDuration: 0,
            fadeOutDuration: 0,
            pulseInterval: 0,
            highlightAnimationDuration: 0,
            panelSlideAnimationDuration: 0
        };

        // CSS transitionを無効化
        if (this.overlay) {
            this.overlay.style.transition = 'none';
            
            const allElements = this.overlay.querySelectorAll('*');
            allElements.forEach(element => {
                element.style.transition = 'none';
                element.style.animation = 'none';
            });
        }
    }

    /**
     * アニメーションを有効化
     */
    enableAnimations() {
        this.animationConfig = {
            fadeInDuration: 300,
            fadeOutDuration: 200,
            pulseInterval: 2000,
            highlightAnimationDuration: 500,
            panelSlideAnimationDuration: 400
        };

        // CSS transitionを復元
        if (this.overlay) {
            this.overlay.style.transition = '';
            
            const allElements = this.overlay.querySelectorAll('*');
            allElements.forEach(element => {
                element.style.transition = '';
                element.style.animation = '';
            });
        }
    }

    /**
     * アクセシビリティ設定を取得
     * @returns {Object} 現在のアクセシビリティ設定
     */
    getAccessibilitySettings() {
        return { ...this.accessibility };
    }

    /**
     * Enterキーの処理
     * @param {KeyboardEvent} event - キーボードイベント
     */
    handleEnterKey(event) {
        try {
            // フォーカスされた要素がある場合はそれをクリック
            const focusedElement = document.activeElement;
            if (focusedElement && focusedElement.tagName === 'BUTTON') {
                focusedElement.click();
                return;
            }
            
            // デフォルトでは次のステップに進む
            this.navigateStep('next');
            this.announceNavigation('次のステップに進みました');
        } catch (error) {
            this.loggingSystem.log(`Enterキー処理エラー: ${error.message}`, 'error');
        }
    }

    /**
     * Tabキーナビゲーションの処理
     * @param {KeyboardEvent} event - キーボードイベント
     */
    handleTabNavigation(event) {
        if (!this.overlay) return;

        try {
            const focusableElements = this.getFocusableElements();
            const currentIndex = focusableElements.indexOf(document.activeElement);
            
            if (event.shiftKey) {
                // Shift+Tab: 前の要素にフォーカス
                event.preventDefault();
                const prevIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
                focusableElements[prevIndex]?.focus();
                this.announceNavigation(`${focusableElements[prevIndex]?.getAttribute('aria-label') || 'ボタン'}にフォーカスしました`);
            } else {
                // Tab: 次の要素にフォーカス
                event.preventDefault();
                const nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
                focusableElements[nextIndex]?.focus();
                this.announceNavigation(`${focusableElements[nextIndex]?.getAttribute('aria-label') || 'ボタン'}にフォーカスしました`);
            }
        } catch (error) {
            this.loggingSystem.log(`Tabナビゲーションエラー: ${error.message}`, 'error');
        }
    }

    /**
     * フォーカス可能な要素を取得
     * @returns {HTMLElement[]} フォーカス可能な要素の配列
     */
    getFocusableElements() {
        if (!this.overlay) return [];

        const selector = 'button, [tabindex="0"], input, select, textarea, [contenteditable="true"]';
        return Array.from(this.overlay.querySelectorAll(selector))
            .filter(element => {
                // 表示されている要素のみを対象
                const style = getComputedStyle(element);
                return style.display !== 'none' && style.visibility !== 'hidden';
            });
    }

    /**
     * 最初のステップに移動
     */
    goToFirstStep() {
        try {
            this.stepIndex = 0;
            this.updateStep();
        } catch (error) {
            this.loggingSystem.log(`最初のステップ移動エラー: ${error.message}`, 'error');
        }
    }

    /**
     * 最後のステップに移動
     */
    goToLastStep() {
        try {
            this.stepIndex = this.totalSteps - 1;
            this.updateStep();
        } catch (error) {
            this.loggingSystem.log(`最後のステップ移動エラー: ${error.message}`, 'error');
        }
    }

    /**
     * 指定した数だけステップをスキップ
     * @param {number} count - スキップするステップ数（負の値で戻る）
     */
    skipSteps(count) {
        try {
            const newIndex = Math.max(0, Math.min(this.totalSteps - 1, this.stepIndex + count));
            this.stepIndex = newIndex;
            this.updateStep();
        } catch (error) {
            this.loggingSystem.log(`ステップスキップエラー: ${error.message}`, 'error');
        }
    }

    /**
     * 指定したステップにジャンプ
     * @param {number} stepNumber - ジャンプ先のステップ番号（0ベース）
     */
    jumpToStep(stepNumber) {
        try {
            if (stepNumber >= 0 && stepNumber < this.totalSteps) {
                this.stepIndex = stepNumber;
                this.updateStep();
            }
        } catch (error) {
            this.loggingSystem.log(`ステップジャンプエラー: ${error.message}`, 'error');
        }
    }

    /**
     * 高コントラストモードの切り替え
     */
    toggleHighContrast() {
        try {
            this.accessibility.highContrast = !this.accessibility.highContrast;
            this.applyAccessibilityStyles();
            
            const status = this.accessibility.highContrast ? '有効' : '無効';
            this.announceNavigation(`高コントラストモードが${status}になりました`);
        } catch (error) {
            this.loggingSystem.log(`高コントラスト切り替えエラー: ${error.message}`, 'error');
        }
    }

    /**
     * 大きな文字表示の切り替え
     */
    toggleLargeText() {
        try {
            this.accessibility.largeText = !this.accessibility.largeText;
            // テキストサイズ倍率を調整
            this.accessibility.textSizeMultiplier = this.accessibility.largeText ? 1.25 : 1.0;
            this.applyAccessibilityStyles();
            
            const status = this.accessibility.largeText ? '有効' : '無効';
            this.announceNavigation(`大きな文字表示が${status}になりました`);
        } catch (error) {
            this.loggingSystem.log(`大きな文字切り替えエラー: ${error.message}`, 'error');
        }
    }

    /**
     * スクリーンリーダーモードの切り替え
     */
    toggleScreenReaderMode() {
        try {
            this.accessibility.screenReaderMode = !this.accessibility.screenReaderMode;
            
            if (this.accessibility.screenReaderMode) {
                this.enableScreenReaderSupport();
            }
            
            const status = this.accessibility.screenReaderMode ? '有効' : '無効';
            this.announceNavigation(`スクリーンリーダーモードが${status}になりました`);
        } catch (error) {
            this.loggingSystem.log(`スクリーンリーダーモード切り替えエラー: ${error.message}`, 'error');
        }
    }

    /**
     * 音声入力機能の切り替え（将来の拡張用）
     */
    toggleVoiceInput() {
        try {
            // Web Speech API対応の確認
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                this.announceNavigation('音声入力は、このブラウザではサポートされていません');
                return;
            }
            
            this.accessibility.voiceInput = !this.accessibility.voiceInput;
            
            if (this.accessibility.voiceInput) {
                this.startVoiceRecognition();
                this.announceNavigation('音声入力が有効になりました。話しかけてください');
            } else {
                this.stopVoiceRecognition();
                this.announceNavigation('音声入力が無効になりました');
            }
        } catch (error) {
            this.loggingSystem.log(`音声入力切り替えエラー: ${error.message}`, 'error');
        }
    }

    /**
     * 音声認識を開始
     */
    startVoiceRecognition() {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.speechRecognition = new SpeechRecognition();
            
            this.speechRecognition.continuous = true;
            this.speechRecognition.interimResults = false;
            this.speechRecognition.lang = 'ja-JP';
            
            this.speechRecognition.onresult = (event) => {
                const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
                this.handleVoiceCommand(transcript);
            };
            
            this.speechRecognition.onerror = (event) => {
                this.loggingSystem.log(`音声認識エラー: ${event.error}`, 'error');
            };
            
            this.speechRecognition.start();
        } catch (error) {
            this.loggingSystem.log(`音声認識開始エラー: ${error.message}`, 'error');
        }
    }

    /**
     * 音声認識を停止
     */
    stopVoiceRecognition() {
        if (this.speechRecognition) {
            this.speechRecognition.stop();
            this.speechRecognition = null;
        }
    }

    /**
     * 音声コマンドの処理
     * @param {string} command - 認識された音声コマンド
     */
    handleVoiceCommand(command) {
        try {
            if (command.includes('次へ') || command.includes('進む')) {
                this.navigateStep('next');
                this.announceNavigation('音声コマンドで次のステップに進みました');
            } else if (command.includes('前へ') || command.includes('戻る')) {
                this.navigateStep('previous');
                this.announceNavigation('音声コマンドで前のステップに戻りました');
            } else if (command.includes('スキップ') || command.includes('飛ばす')) {
                this.navigateStep('skip');
                this.announceNavigation('音声コマンドでチュートリアルをスキップしました');
            } else if (command.includes('ヘルプ')) {
                this.showStepHelp();
                this.announceNavigation('音声コマンドでヘルプを表示しました');
            } else if (command.includes('最初')) {
                this.goToFirstStep();
                this.announceNavigation('音声コマンドで最初のステップに移動しました');
            } else if (command.includes('最後')) {
                this.goToLastStep();
                this.announceNavigation('音声コマンドで最後のステップに移動しました');
            } else {
                this.announceNavigation('音声コマンドが認識されませんでした。もう一度お試しください');
            }
        } catch (error) {
            this.loggingSystem.log(`音声コマンド処理エラー: ${error.message}`, 'error');
        }
    }

    /**
     * ナビゲーション状況をアナウンス
     * @param {string} message - アナウンスするメッセージ
     */
    announceNavigation(message) {
        try {
            if (this.accessibility.screenReaderMode && this.gameEngine?.accessibilityManager) {
                this.gameEngine.accessibilityManager.emit('announceToScreenReader', { 
                    message: message,
                    priority: 'assertive'
                });
            }
        } catch (error) {
            this.loggingSystem.log(`ナビゲーションアナウンスエラー: ${error.message}`, 'error');
        }
    }

    /**
     * デバッグモードの切り替え（開発者向け）
     */
    toggleDebugMode() {
        try {
            this.debugMode = !this.debugMode;
            
            if (this.debugMode) {
                this.showDebugInfo();
                console.log('TutorialOverlay Debug Mode Enabled');
                console.log('Current State:', {
                    stepIndex: this.stepIndex,
                    totalSteps: this.totalSteps,
                    accessibility: this.accessibility,
                    currentTutorial: this.currentTutorial
                });
            } else {
                this.hideDebugInfo();
                console.log('TutorialOverlay Debug Mode Disabled');
            }
        } catch (error) {
            this.loggingSystem.log(`デバッグモード切り替えエラー: ${error.message}`, 'error');
        }
    }

    /**
     * デバッグ情報の表示
     */
    showDebugInfo() {
        if (!this.overlay) return;

        const debugPanel = document.createElement('div');
        debugPanel.id = 'tutorial-debug-panel';
        debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10001;
            max-width: 300px;
        `;

        debugPanel.innerHTML = `
            <strong>Tutorial Debug Info</strong><br>
            Step: ${this.stepIndex + 1}/${this.totalSteps}<br>
            Accessibility Enabled: ${this.accessibility.enabled}<br>
            High Contrast: ${this.accessibility.highContrast}<br>
            Large Text: ${this.accessibility.largeText}<br>
            Screen Reader: ${this.accessibility.screenReaderMode}<br>
            Voice Input: ${this.accessibility.voiceInput || false}<br>
            Current Tutorial: ${this.currentTutorial?.id || 'None'}
        `;

        this.overlay.appendChild(debugPanel);
    }

    /**
     * デバッグ情報の非表示
     */
    hideDebugInfo() {
        const debugPanel = document.getElementById('tutorial-debug-panel');
        if (debugPanel) {
            debugPanel.remove();
        }
    }

    /**
     * 認知アクセシビリティ対応の簡素化モードを適用
     */
    applyCognitiveAccessibilityMode() {
        if (!this.accessibility.cognitiveAssistance || !this.overlay) return;

        try {
            // UI要素の簡素化
            this.simplifyCognitiveUI();
            
            // インタラクションの簡素化
            this.simplifyCognitiveInteractions();
            
            // コンテンツの読みやすさ向上
            this.improveCognitiveReadability();
            
            // 注意散漫要素の除去
            this.removeDistractions();
            
            this.loggingSystem.log('認知アクセシビリティモードが適用されました', 'info');
        } catch (error) {
            this.loggingSystem.log(`認知アクセシビリティモード適用エラー: ${error.message}`, 'error');
        }
    }

    /**
     * 認知アクセシビリティ向けUI簡素化
     */
    simplifyCognitiveUI() {
        if (!this.instructionPanel) return;

        try {
            // パネルのレイアウトを簡素化
            this.instructionPanel.style.border = '3px solid #333333';
            this.instructionPanel.style.borderRadius = '8px';
            this.instructionPanel.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            this.instructionPanel.style.backgroundColor = '#f8f9fa';
            
            // 不要な装飾要素を非表示
            const decorativeElements = this.instructionPanel.querySelectorAll('.decoration, .animation, .gradient');
            decorativeElements.forEach(element => {
                element.style.display = 'none';
            });

            // ボタンを大きく、わかりやすくする
            const buttons = this.overlay.querySelectorAll('button');
            buttons.forEach(button => {
                button.style.fontSize = '18px';
                button.style.padding = '12px 24px';
                button.style.margin = '8px';
                button.style.borderRadius = '6px';
                button.style.border = '2px solid #333333';
                button.style.backgroundColor = '#ffffff';
                button.style.color = '#333333';
                button.style.fontWeight = 'bold';
                button.style.cursor = 'pointer';
                
                // ホバー効果を明確に
                button.addEventListener('mouseenter', () => {
                    button.style.backgroundColor = '#e9ecef';
                    button.style.transform = 'scale(1.05)';
                });
                
                button.addEventListener('mouseleave', () => {
                    button.style.backgroundColor = '#ffffff';
                    button.style.transform = 'scale(1)';
                });
            });

            // プログレスバーを視覚的に分かりやすく
            if (this.progressBar) {
                this.progressBar.style.height = '12px';
                this.progressBar.style.borderRadius = '6px';
                this.progressBar.style.border = '2px solid #333333';
                this.progressBar.style.backgroundColor = '#e9ecef';
                
                const progressFill = this.progressBar.querySelector('.progress-fill');
                if (progressFill) {
                    progressFill.style.backgroundColor = '#28a745';
                    progressFill.style.borderRadius = '4px';
                }
                
                // プログレス数値を大きく表示
                const progressText = this.progressBar.querySelector('.progress-text') || 
                    document.createElement('div');
                progressText.className = 'progress-text';
                progressText.style.cssText = `
                    position: absolute;
                    top: -30px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 16px;
                    font-weight: bold;
                    color: #333333;
                `;
                progressText.textContent = `${this.stepIndex + 1} / ${this.totalSteps}`;
                this.progressBar.appendChild(progressText);
            }

        } catch (error) {
            this.loggingSystem.log(`認知UI簡素化エラー: ${error.message}`, 'error');
        }
    }

    /**
     * 認知アクセシビリティ向けインタラクション簡素化
     */
    simplifyCognitiveInteractions() {
        try {
            // 自動進行を無効化（ユーザーのペースに任せる）
            this.autoAdvanceEnabled = false;
            
            // タイムアウトを延長または無効化
            this.stepTimeout = null;
            
            // 複雑なキーボードショートカットを無効化
            this.simplifiedKeyboardMode = true;
            
            // 音声入力や複雑な機能を無効化
            this.accessibility.voiceInput = false;
            
            // シンプルな確認メッセージを追加
            this.addCognitiveConfirmationMessages();
            
        } catch (error) {
            this.loggingSystem.log(`認知インタラクション簡素化エラー: ${error.message}`, 'error');
        }
    }

    /**
     * 認知アクセシビリティ向け読みやすさ向上
     */
    improveCognitiveReadability() {
        if (!this.instructionPanel) return;

        try {
            // 文字サイズと行間を調整
            const textElements = this.instructionPanel.querySelectorAll('p, span, div, li');
            textElements.forEach(element => {
                element.style.fontSize = '18px';
                element.style.lineHeight = '1.8';
                element.style.color = '#333333';
                element.style.fontFamily = 'Arial, sans-serif';
                element.style.marginBottom = '12px';
            });

            // タイトルを大きく、目立つように
            const titleElements = this.instructionPanel.querySelectorAll('h1, h2, h3, .title');
            titleElements.forEach(element => {
                element.style.fontSize = '24px';
                element.style.fontWeight = 'bold';
                element.style.color = '#000000';
                element.style.marginBottom = '16px';
                element.style.textAlign = 'center';
            });

            // 重要なポイントにアイコンを追加
            this.addCognitiveVisualCues();

        } catch (error) {
            this.loggingSystem.log(`認知読みやすさ向上エラー: ${error.message}`, 'error');
        }
    }

    /**
     * 注意散漫要素の除去
     */
    removeDistractions() {
        try {
            // アニメーションを停止
            this.disableAnimations();
            
            // 不要な視覚効果を非表示
            if (this.spotlight) {
                this.spotlight.style.display = 'none';
            }
            
            // パーティクル効果や装飾を非表示
            const distractingElements = this.overlay.querySelectorAll(
                '.particle, .sparkle, .glow, .shadow, .reflection'
            );
            distractingElements.forEach(element => {
                element.style.display = 'none';
            });

            // 背景を単色に変更
            this.overlay.style.background = 'rgba(240, 240, 240, 0.95)';
            
        } catch (error) {
            this.loggingSystem.log(`注意散漫要素除去エラー: ${error.message}`, 'error');
        }
    }

    /**
     * 認知アクセシビリティ向け確認メッセージの追加
     */
    addCognitiveConfirmationMessages() {
        try {
            // 操作成功時の明確なフィードバック
            this.showCognitiveSuccessMessage = (message) => {
                const successElement = document.createElement('div');
                successElement.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: #d4edda;
                    color: #155724;
                    border: 3px solid #c3e6cb;
                    border-radius: 8px;
                    padding: 20px;
                    font-size: 20px;
                    font-weight: bold;
                    z-index: 10002;
                    text-align: center;
                `;
                successElement.textContent = `✓ ${message}`;
                
                document.body.appendChild(successElement);
                
                setTimeout(() => {
                    successElement.remove();
                }, 3000);
            };

            // エラー時の分かりやすいメッセージ
            this.showCognitiveErrorMessage = (message) => {
                const errorElement = document.createElement('div');
                errorElement.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: #f8d7da;
                    color: #721c24;
                    border: 3px solid #f5c6cb;
                    border-radius: 8px;
                    padding: 20px;
                    font-size: 20px;
                    font-weight: bold;
                    z-index: 10002;
                    text-align: center;
                `;
                errorElement.textContent = `⚠ ${message}`;
                
                document.body.appendChild(errorElement);
                
                setTimeout(() => {
                    errorElement.remove();
                }, 4000);
            };

        } catch (error) {
            this.loggingSystem.log(`認知確認メッセージ追加エラー: ${error.message}`, 'error');
        }
    }

    /**
     * 認知アクセシビリティ向け視覚的手がかりの追加
     */
    addCognitiveVisualCues() {
        if (!this.instructionPanel) return;

        try {
            // ステップ番号を大きく表示
            const stepNumberElement = document.createElement('div');
            stepNumberElement.style.cssText = `
                position: absolute;
                top: -15px;
                left: -15px;
                width: 40px;
                height: 40px;
                background: #007bff;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                font-weight: bold;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            `;
            stepNumberElement.textContent = this.stepIndex + 1;
            this.instructionPanel.appendChild(stepNumberElement);

            // 進捗インジケーターを追加
            const progressIndicator = document.createElement('div');
            progressIndicator.style.cssText = `
                margin: 16px 0;
                text-align: center;
                font-size: 16px;
                color: #666666;
            `;
            progressIndicator.innerHTML = `
                <strong>進捗:</strong> ${this.stepIndex + 1} / ${this.totalSteps} ステップ<br>
                <small>あと ${this.totalSteps - this.stepIndex - 1} ステップで完了です</small>
            `;
            
            const contentArea = this.instructionPanel.querySelector('.content') || this.instructionPanel;
            contentArea.insertBefore(progressIndicator, contentArea.firstChild);

            // 重要なアクションにアイコンを追加
            const actionButtons = this.overlay.querySelectorAll('button');
            actionButtons.forEach(button => {
                const buttonText = button.textContent.toLowerCase();
                let icon = '';
                
                if (buttonText.includes('次') || buttonText.includes('進む')) {
                    icon = '→ ';
                } else if (buttonText.includes('前') || buttonText.includes('戻る')) {
                    icon = '← ';
                } else if (buttonText.includes('完了')) {
                    icon = '✓ ';
                } else if (buttonText.includes('スキップ')) {
                    icon = '⏭ ';
                }
                
                if (icon) {
                    button.textContent = icon + button.textContent;
                }
            });

        } catch (error) {
            this.loggingSystem.log(`認知視覚的手がかり追加エラー: ${error.message}`, 'error');
        }
    }

    /**
     * 簡素化されたキーボード処理（認知アクセシビリティモード用）
     * @param {KeyboardEvent} event - キーボードイベント
     */
    handleSimplifiedKeyboard(event) {
        if (!this.simplifiedKeyboardMode) return false;

        try {
            switch (event.key) {
                case 'Enter':
                case ' ':
                    event.preventDefault();
                    this.navigateStep('next');
                    this.showCognitiveSuccessMessage('次のステップに進みました');
                    return true;
                    
                case 'Escape':
                    event.preventDefault();
                    this.navigateStep('skip');
                    this.showCognitiveSuccessMessage('チュートリアルを終了しました');
                    return true;
                    
                case 'F1':
                    event.preventDefault();
                    this.showStepHelp();
                    this.showCognitiveSuccessMessage('ヘルプを表示しました');
                    return true;
                    
                default:
                    return false; // 他のキーは処理しない
            }
        } catch (error) {
            this.loggingSystem.log(`簡素化キーボード処理エラー: ${error.message}`, 'error');
            return false;
        }
    }

    /**
     * 認知アクセシビリティ設定の切り替え
     */
    toggleCognitiveAccessibility() {
        try {
            this.accessibility.cognitiveAssistance = !this.accessibility.cognitiveAssistance;
            
            if (this.accessibility.cognitiveAssistance) {
                this.applyCognitiveAccessibilityMode();
                this.announceNavigation('認知アクセシビリティモードが有効になりました');
            } else {
                this.removeCognitiveAccessibilityMode();
                this.announceNavigation('認知アクセシビリティモードが無効になりました');
            }
            
        } catch (error) {
            this.loggingSystem.log(`認知アクセシビリティ切り替えエラー: ${error.message}`, 'error');
        }
    }

    /**
     * 認知アクセシビリティモードの解除
     */
    removeCognitiveAccessibilityMode() {
        try {
            // 簡素化された要素を削除
            const cognitiveElements = this.overlay.querySelectorAll('.cognitive-element, .step-number, .progress-indicator');
            cognitiveElements.forEach(element => element.remove());
            
            // デフォルトスタイルに戻す
            if (this.instructionPanel) {
                this.instructionPanel.style.border = this.styles.panelBorder;
                this.instructionPanel.style.backgroundColor = this.styles.panelBackground;
            }
            
            // 通常のキーボード処理に戻す
            this.simplifiedKeyboardMode = false;
            
            // アニメーションを復活
            this.enableAnimations();
            
            this.loggingSystem.log('認知アクセシビリティモードが解除されました', 'info');
        } catch (error) {
            this.loggingSystem.log(`認知アクセシビリティモード解除エラー: ${error.message}`, 'error');
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
        this.instructionPanel.setAttribute('role', 'dialog');
        this.instructionPanel.setAttribute('aria-labelledby', 'tutorial-step-title');
        this.instructionPanel.setAttribute('aria-describedby', 'tutorial-step-content');
        this.instructionPanel.setAttribute('aria-modal', 'true');
        this.instructionPanel.tabIndex = -1;
        
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
    }

    /**
     * 指示パネルの内容更新
     */
    updateInstructionPanel() {
        if (!this.instructionPanel || !this.currentStep) return;
        
        const step = this.currentStep;
        
        this.instructionPanel.innerHTML = `
            <div class="tutorial-step-header">
                <h3 id="tutorial-step-title" class="tutorial-step-title">${step.title}</h3>
                <div class="tutorial-step-counter" aria-label="ステップ ${this.stepIndex + 1} / ${this.totalSteps}">${this.stepIndex + 1} / ${this.totalSteps}</div>
            </div>
            <div id="tutorial-step-content" class="tutorial-step-content">
                <p class="tutorial-step-instructions" role="main">${step.instructions}</p>
                ${step.tips ? `<div class="tutorial-step-tips" role="note" aria-label="ヒント">💡 ${step.tips}</div>` : ''}
                ${step.warning ? `<div class="tutorial-step-warning" role="alert" aria-label="警告">⚠️ ${step.warning}</div>` : ''}
            </div>
            ${step.image ? `<div class="tutorial-step-image"><img src="${step.image}" alt="${step.title}" role="img" /></div>` : ''}
        `;
    }

    /**
     * ナビゲーションパネルの作成
     */
    createNavigationPanel() {
        this.navigationPanel = document.createElement('div');
        this.navigationPanel.className = 'tutorial-navigation-panel';
        this.navigationPanel.setAttribute('role', 'navigation');
        this.navigationPanel.setAttribute('aria-label', 'チュートリアルナビゲーション');
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
        
        // アクセシビリティ属性の追加
        switch (type) {
            case 'prev':
                button.setAttribute('aria-label', '前のステップに戻る');
                break;
            case 'next':
                button.setAttribute('aria-label', this.stepIndex >= this.totalSteps - 1 ? 'チュートリアルを完了する' : '次のステップに進む');
                break;
            case 'skip':
                button.setAttribute('aria-label', 'このステップをスキップする');
                break;
            case 'help':
                button.setAttribute('aria-label', 'このステップのヘルプを表示する');
                break;
        }
        
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
     * エラーメッセージの表示
     * @param {string} errorMessage - エラーメッセージ
     */
    async showError(errorMessage) {
        try {
            const errorPanel = document.createElement('div');
            errorPanel.className = 'tutorial-error-panel';
            errorPanel.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #f8d7da;
                border: 2px solid #dc3545;
                border-radius: 8px;
                padding: 20px;
                max-width: 400px;
                z-index: ${this.layout.overlayZIndex + 3};
                box-shadow: 0 4px 20px rgba(220, 53, 69, 0.3);
                opacity: 0;
                animation: tutorial-error-shake 0.5s ease-in-out, tutorial-fade-in 0.3s ease-in-out;
            `;
            
            errorPanel.innerHTML = `
                <div class="tutorial-error-header">
                    <span class="tutorial-error-icon">⚠️</span>
                    <h4 class="tutorial-error-title">チュートリアルエラー</h4>
                </div>
                <p class="tutorial-error-message">${errorMessage}</p>
                <div class="tutorial-error-actions">
                    <button class="tutorial-error-retry">再試行</button>
                    <button class="tutorial-error-skip">スキップ</button>
                </div>
            `;
            
            // エラーパネルのスタイルを追加
            this.injectErrorStyles();
            
            // ボタンのイベントハンドラー
            const retryButton = errorPanel.querySelector('.tutorial-error-retry');
            const skipButton = errorPanel.querySelector('.tutorial-error-skip');
            
            retryButton.onclick = () => {
                errorPanel.remove();
                // 現在のステップを再実行
                if (this.eventBus) {
                    this.eventBus.emit('tutorial_retry_step', {
                        stepIndex: this.stepIndex
                    });
                }
            };
            
            skipButton.onclick = () => {
                errorPanel.remove();
                this.navigateStep('next');
            };
            
            document.body.appendChild(errorPanel);
            
            // 3秒後に自動的に閉じる
            setTimeout(() => {
                if (errorPanel.parentNode) {
                    errorPanel.style.opacity = '0';
                    setTimeout(() => errorPanel.remove(), 300);
                }
            }, 3000);
            
            this.loggingSystem.info('TutorialOverlay', `Error displayed: ${errorMessage}`);
        } catch (error) {
            this.loggingSystem.error('TutorialOverlay', 'Failed to show error', error);
        }
    }

    /**
     * タイムアウトメッセージの表示
     * @param {string} timeoutMessage - タイムアウトメッセージ
     */
    async showTimeout(timeoutMessage) {
        try {
            const timeoutPanel = document.createElement('div');
            timeoutPanel.className = 'tutorial-timeout-panel';
            timeoutPanel.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #fff3cd;
                border: 2px solid #ffc107;
                border-radius: 8px;
                padding: 20px;
                max-width: 400px;
                z-index: ${this.layout.overlayZIndex + 3};
                box-shadow: 0 4px 20px rgba(255, 193, 7, 0.3);
                opacity: 0;
                animation: tutorial-fade-in 0.3s ease-in-out forwards;
            `;
            
            timeoutPanel.innerHTML = `
                <div class="tutorial-timeout-header">
                    <span class="tutorial-timeout-icon">⏰</span>
                    <h4 class="tutorial-timeout-title">時間切れ</h4>
                </div>
                <p class="tutorial-timeout-message">${timeoutMessage}</p>
                <div class="tutorial-timeout-actions">
                    <button class="tutorial-timeout-retry">もう一度</button>
                    <button class="tutorial-timeout-continue">続行</button>
                </div>
            `;
            
            // タイムアウトパネルのスタイルを追加
            this.injectTimeoutStyles();
            
            // ボタンのイベントハンドラー
            const retryButton = timeoutPanel.querySelector('.tutorial-timeout-retry');
            const continueButton = timeoutPanel.querySelector('.tutorial-timeout-continue');
            
            retryButton.onclick = () => {
                timeoutPanel.remove();
                // 現在のステップを再実行
                if (this.eventBus) {
                    this.eventBus.emit('tutorial_retry_step', {
                        stepIndex: this.stepIndex
                    });
                }
            };
            
            continueButton.onclick = () => {
                timeoutPanel.remove();
                this.navigateStep('next');
            };
            
            document.body.appendChild(timeoutPanel);
            
            this.loggingSystem.info('TutorialOverlay', `Timeout displayed: ${timeoutMessage}`);
        } catch (error) {
            this.loggingSystem.error('TutorialOverlay', 'Failed to show timeout', error);
        }
    }

    /**
     * キーボードイベントハンドラー
     * @param {KeyboardEvent} event - キーボードイベント
     */
    handleKeydown(event) {
        try {
            // アクセシビリティ機能が無効の場合は基本機能のみ
            if (!this.accessibility.keyboardNavigation) {
                return;
            }

            // 認知アクセシビリティモードの場合は簡素化された処理
            if (this.accessibility.cognitiveAssistance && this.handleSimplifiedKeyboard(event)) {
                return;
            }

            switch (event.key) {
                // 基本ナビゲーション
                case 'ArrowLeft':
                case 'ArrowUp':
                    event.preventDefault();
                    this.navigateStep('previous');
                    this.announceNavigation('前のステップに移動しました');
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                case ' ':
                    event.preventDefault();
                    this.navigateStep('next');
                    this.announceNavigation('次のステップに移動しました');
                    break;
                case 'Escape':
                    event.preventDefault();
                    this.navigateStep('skip');
                    this.announceNavigation('チュートリアルをスキップしました');
                    break;
                
                // 拡張キーボードショートカット
                case 'Enter':
                    event.preventDefault();
                    this.handleEnterKey(event);
                    break;
                case 'Tab':
                    this.handleTabNavigation(event);
                    break;
                case 'Home':
                    event.preventDefault();
                    this.goToFirstStep();
                    this.announceNavigation('最初のステップに移動しました');
                    break;
                case 'End':
                    event.preventDefault();
                    this.goToLastStep();
                    this.announceNavigation('最後のステップに移動しました');
                    break;
                case 'PageUp':
                    event.preventDefault();
                    this.skipSteps(-5); // 5ステップ戻る
                    this.announceNavigation('5ステップ戻りました');
                    break;
                case 'PageDown':
                    event.preventDefault();
                    this.skipSteps(5); // 5ステップ進む
                    this.announceNavigation('5ステップ進みました');
                    break;
                
                // ヘルプとアクセシビリティ
                case 'F1':
                    event.preventDefault();
                    this.showStepHelp();
                    this.announceNavigation('ヘルプを表示しました');
                    break;
                case 'F2':
                    event.preventDefault();
                    this.toggleHighContrast();
                    break;
                case 'F3':
                    event.preventDefault();
                    this.toggleLargeText();
                    break;
                case 'F4':
                    event.preventDefault();
                    this.toggleScreenReaderMode();
                    break;
                
                // 数字キー（ステップジャンプ）
                case '1': case '2': case '3': case '4': case '5':
                case '6': case '7': case '8': case '9':
                    if (event.ctrlKey) {
                        event.preventDefault();
                        const stepNumber = parseInt(event.key) - 1;
                        this.jumpToStep(stepNumber);
                        this.announceNavigation(`ステップ${event.key}に移動しました`);
                    }
                    break;
                
                // 音声制御（音声入力対応）
                case 'v':
                    if (event.ctrlKey && event.shiftKey) {
                        event.preventDefault();
                        this.toggleVoiceInput();
                    }
                    break;
                
                // デバッグモード（開発者向け）
                case 'd':
                    if (event.ctrlKey && event.shiftKey) {
                        event.preventDefault();
                        this.toggleDebugMode();
                    }
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
     * フォーカス管理の設定
     */
    setupFocusManagement() {
        try {
            if (!this.instructionPanel) return;
            
            // フォーカス可能な要素を取得
            const focusableElements = this.instructionPanel.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            if (focusableElements.length > 0) {
                // 最初の要素にフォーカス
                focusableElements[0].focus();
            } else {
                // フォーカス可能な要素がない場合はパネル自体にフォーカス
                this.instructionPanel.focus();
            }
            
            // フォーカストラップの設定
            this.setupFocusTrap(focusableElements);
            
        } catch (error) {
            this.loggingSystem.error('TutorialOverlay', 'Failed to setup focus management', error);
        }
    }

    /**
     * フォーカストラップの設定
     * @param {NodeList} focusableElements - フォーカス可能な要素
     */
    setupFocusTrap(focusableElements) {
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // Tab/Shift+Tab でのフォーカストラップ
        this.focusTrapHandler = (event) => {
            if (event.key !== 'Tab') return;
            
            if (event.shiftKey) {
                // Shift + Tab (逆方向)
                if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab (順方向)
                if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        };
        
        document.addEventListener('keydown', this.focusTrapHandler);
    }

    /**
     * フォーカストラップの解除
     */
    removeFocusTrap() {
        if (this.focusTrapHandler) {
            document.removeEventListener('keydown', this.focusTrapHandler);
            this.focusTrapHandler = null;
        }
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
     * エラーパネル用CSSスタイルの注入
     */
    injectErrorStyles() {
        if (document.getElementById('tutorial-error-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'tutorial-error-styles';
        styles.textContent = `
            @keyframes tutorial-error-shake {
                0%, 100% { transform: translate(-50%, -50%); }
                25% { transform: translate(-52%, -50%); }
                75% { transform: translate(-48%, -50%); }
            }
            
            @keyframes tutorial-fade-in {
                0% { opacity: 0; }
                100% { opacity: 1; }
            }
            
            .tutorial-error-header,
            .tutorial-timeout-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 12px;
            }
            
            .tutorial-error-icon,
            .tutorial-timeout-icon {
                font-size: 20px;
            }
            
            .tutorial-error-title,
            .tutorial-timeout-title {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }
            
            .tutorial-error-title {
                color: #721c24;
            }
            
            .tutorial-timeout-title {
                color: #856404;
            }
            
            .tutorial-error-message,
            .tutorial-timeout-message {
                margin: 0 0 16px 0;
                line-height: 1.5;
            }
            
            .tutorial-error-message {
                color: #721c24;
            }
            
            .tutorial-timeout-message {
                color: #856404;
            }
            
            .tutorial-error-actions,
            .tutorial-timeout-actions {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }
            
            .tutorial-error-retry,
            .tutorial-error-skip,
            .tutorial-timeout-retry,
            .tutorial-timeout-continue {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 200ms ease;
            }
            
            .tutorial-error-retry,
            .tutorial-timeout-retry {
                background: #007bff;
                color: white;
            }
            
            .tutorial-error-retry:hover,
            .tutorial-timeout-retry:hover {
                background: #0056b3;
                transform: translateY(-1px);
            }
            
            .tutorial-error-skip,
            .tutorial-timeout-continue {
                background: #6c757d;
                color: white;
            }
            
            .tutorial-error-skip:hover,
            .tutorial-timeout-continue:hover {
                background: #545b62;
                transform: translateY(-1px);
            }
        `;
        
        document.head.appendChild(styles);
    }

    /**
     * タイムアウトパネル用CSSスタイルの注入
     */
    injectTimeoutStyles() {
        // エラースタイルと共通のスタイルを使用
        this.injectErrorStyles();
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
            // フォーカストラップの解除
            this.removeFocusTrap();
            
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