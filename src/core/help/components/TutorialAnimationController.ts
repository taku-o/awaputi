/**
 * TutorialAnimationController.ts
 * チュートリアルアニメーション制御システム
 * TutorialOverlayから分離されたアニメーション機能
 */

import { getErrorHandler } from '../../../utils/ErrorHandler.js';
import { LoggingSystem } from '../../LoggingSystem.js';

// 型定義
export interface AnimationConfig {
    fadeInDuration: number;
    fadeOutDuration: number;
    pulseInterval: number;
    highlightAnimationDuration: number;
    panelSlideAnimationDuration: number;
    breathingPulseDuration: number;
    rippleAnimationDuration: number;
    sparkleAnimationDuration: number;
    glowIntensity: number;
    bounceHeight: number;
    bounceDuration: number;
    easingFunction: string;
}

export interface HighlightAnimation {
    isActive: boolean;
    startTime: number;
    type: HighlightAnimationType;
    intensity: number;
    currentFrame: number;
    element: HTMLElement | null;
}

export interface PanelAnimation {
    isActive: boolean;
    startTime: number;
    type: PanelAnimationType;
    direction: AnimationDirection;
    progress: number;
    element: HTMLElement | null;
}

export interface SpotlightAnimation {
    isActive: boolean;
    startTime: number;
    currentRadius: number;
    targetRadius: number;
    expansion: boolean;
    element: HTMLElement | null;
}

export interface AnimationState {
    highlight: HighlightAnimation;
    panel: PanelAnimation;
    spotlight: SpotlightAnimation;
}

export type HighlightAnimationType = 'pulse' | 'breathing' | 'ripple' | 'sparkle' | 'bounce';
export type PanelAnimationType = 'slideIn' | 'slideOut' | 'bounceIn' | 'scaleIn';
export type AnimationDirection = 'top' | 'bottom' | 'left' | 'right';
export type EasingFunction = (t: number) => number;

export interface EasingFunctions {
    linear: EasingFunction;
    easeInQuad: EasingFunction;
    easeOutQuad: EasingFunction;
    easeInOutQuad: EasingFunction;
    easeInCubic: EasingFunction;
    easeOutCubic: EasingFunction;
    easeInOutCubic: EasingFunction;
    easeInBounce: EasingFunction;
    easeOutBounce: EasingFunction;
}

export type AnimationFunction = () => void;

export interface ErrorHandler {
    handleError(error: Error, context: string): void;
}

/**
 * チュートリアルアニメーション制御クラス
 */
export class TutorialAnimationController {
    private errorHandler: ErrorHandler;
    private loggingSystem: LoggingSystem;
    private animationConfig: AnimationConfig;
    private animations: AnimationState;
    private animationQueue: AnimationFunction[];
    private isProcessingQueue: boolean;
    private easingFunctions: EasingFunctions;
    private animationFrameId: number | null;

    constructor() {
        this.errorHandler = getErrorHandler();
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // アニメーション設定
        this.animationConfig = {
            fadeInDuration: 300,
            fadeOutDuration: 200,
            pulseInterval: 1500,
            highlightAnimationDuration: 800,
            panelSlideAnimationDuration: 400,
            breathingPulseDuration: 2000,
            rippleAnimationDuration: 1000,
            sparkleAnimationDuration: 1200,
            glowIntensity: 0.8,
            bounceHeight: 20,
            bounceDuration: 600,
            easingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
        };
        
        // アニメーション状態管理
        this.animations = {
            highlight: {
                isActive: false,
                startTime: 0,
                type: 'pulse',
                intensity: 1.0,
                currentFrame: 0,
                element: null
            },
            panel: {
                isActive: false,
                startTime: 0,
                type: 'slideIn',
                direction: 'bottom',
                progress: 0,
                element: null
            },
            spotlight: {
                isActive: false,
                startTime: 0,
                currentRadius: 0,
                targetRadius: 0,
                expansion: false,
                element: null
            }
        };
        
        // アニメーションキュー
        this.animationQueue = [];
        this.isProcessingQueue = false;
        
        // イージング関数
        this.easingFunctions = {
            linear: (t: number) => t,
            easeInQuad: (t: number) => t * t,
            easeOutQuad: (t: number) => 1 - (1 - t) * (1 - t),
            easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
            easeInCubic: (t: number) => t * t * t,
            easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
            easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
            easeInBounce: (t: number) => 1 - this.easingFunctions.easeOutBounce(1 - t),
            easeOutBounce: (t: number) => {
                const n1 = 7.5625;
                const d1 = 2.75;
                if (t < 1 / d1) {
                    return n1 * t * t;
                } else if (t < 2 / d1) {
                    return n1 * (t -= 1.5 / d1) * t + 0.75;
                } else if (t < 2.5 / d1) {
                    return n1 * (t -= 2.25 / d1) * t + 0.9375;
                } else {
                    return n1 * (t -= 2.625 / d1) * t + 0.984375;
                }
            }
        };
        
        this.animationFrameId = null;
        this.initialize();
    }

    /**
     * アニメーションコントローラの初期化
     */
    private initialize(): void {
        try {
            this.loggingSystem.debug('TutorialAnimationController', 'Animation controller initialized');
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'TutorialAnimationController.initialize');
        }
    }

    /**
     * ハイライトアニメーション開始
     * @param element - アニメーション対象要素
     * @param type - アニメーションタイプ
     * @param intensity - アニメーション強度
     */
    startHighlightAnimation(element: HTMLElement | null, type: HighlightAnimationType = 'pulse', intensity: number = 1.0): void {
        try {
            if (!element) {
                this.loggingSystem.warn('TutorialAnimationController', 'Cannot start highlight animation: element is null');
                return;
            }

            // 既存のアニメーションを停止
            this.stopAnimation('highlight');

            this.animations.highlight = {
                isActive: true,
                startTime: Date.now(),
                type,
                intensity,
                currentFrame: 0,
                element
            };

            this.startAnimationLoop();
            this.loggingSystem.debug('TutorialAnimationController', `Started highlight animation: ${type}`, { intensity });
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'TutorialAnimationController.startHighlightAnimation');
        }
    }

    /**
     * パネルアニメーション開始
     * @param element - アニメーション対象要素
     * @param type - アニメーションタイプ
     * @param direction - アニメーション方向
     */
    startPanelAnimation(element: HTMLElement | null, type: PanelAnimationType = 'slideIn', direction: AnimationDirection = 'bottom'): void {
        try {
            if (!element) {
                this.loggingSystem.warn('TutorialAnimationController', 'Cannot start panel animation: element is null');
                return;
            }

            // 既存のアニメーションを停止
            this.stopAnimation('panel');

            this.animations.panel = {
                isActive: true,
                startTime: Date.now(),
                type,
                direction,
                progress: 0,
                element
            };

            this.startAnimationLoop();
            this.loggingSystem.debug('TutorialAnimationController', `Started panel animation: ${type}`, { direction });
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'TutorialAnimationController.startPanelAnimation');
        }
    }

    /**
     * スポットライトアニメーション開始
     * @param element - アニメーション対象要素
     * @param targetRadius - 目標半径
     * @param expansion - 拡大フラグ
     */
    startSpotlightAnimation(element: HTMLElement | null, targetRadius: number, expansion: boolean = true): void {
        try {
            if (!element) {
                this.loggingSystem.warn('TutorialAnimationController', 'Cannot start spotlight animation: element is null');
                return;
            }

            // 既存のアニメーションを停止
            this.stopAnimation('spotlight');

            this.animations.spotlight = {
                isActive: true,
                startTime: Date.now(),
                currentRadius: expansion ? 0 : targetRadius,
                targetRadius,
                expansion,
                element
            };

            this.startAnimationLoop();
            this.loggingSystem.debug('TutorialAnimationController', 'Started spotlight animation', { targetRadius, expansion });
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'TutorialAnimationController.startSpotlightAnimation');
        }
    }

    /**
     * アニメーション停止
     * @param animationType - 停止するアニメーションタイプ
     */
    stopAnimation(animationType: keyof AnimationState): void {
        try {
            if (this.animations[animationType]) {
                this.animations[animationType].isActive = false;
                this.animations[animationType].element = null;
            }

            // 全てのアニメーションが停止している場合、アニメーションループを停止
            const hasActiveAnimations = Object.values(this.animations).some(anim => anim.isActive);
            if (!hasActiveAnimations && this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }

            this.loggingSystem.debug('TutorialAnimationController', `Stopped animation: ${animationType}`);
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'TutorialAnimationController.stopAnimation');
        }
    }

    /**
     * 全アニメーション停止
     */
    stopAllAnimations(): void {
        try {
            this.stopAnimation('highlight');
            this.stopAnimation('panel');
            this.stopAnimation('spotlight');
            
            // アニメーションキューもクリア
            this.animationQueue = [];
            this.isProcessingQueue = false;

            this.loggingSystem.debug('TutorialAnimationController', 'All animations stopped');
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'TutorialAnimationController.stopAllAnimations');
        }
    }

    /**
     * アニメーションキューに追加
     * @param animationFunction - アニメーション関数
     */
    queueAnimation(animationFunction: AnimationFunction): void {
        try {
            this.animationQueue.push(animationFunction);
            
            if (!this.isProcessingQueue) {
                this.processAnimationQueue();
            }
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'TutorialAnimationController.queueAnimation');
        }
    }

    /**
     * アニメーション設定更新
     * @param config - 新しい設定
     */
    updateConfig(config: Partial<AnimationConfig>): void {
        try {
            this.animationConfig = { ...this.animationConfig, ...config };
            this.loggingSystem.debug('TutorialAnimationController', 'Animation config updated', config);
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'TutorialAnimationController.updateConfig');
        }
    }

    /**
     * アニメーション状態取得
     * @returns 現在のアニメーション状態
     */
    getAnimationState(): AnimationState {
        return { ...this.animations };
    }

    /**
     * リソース破棄
     */
    dispose(): void {
        try {
            this.stopAllAnimations();
            
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }

            this.loggingSystem.debug('TutorialAnimationController', 'Animation controller disposed');
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'TutorialAnimationController.dispose');
        }
    }

    // プライベートメソッド

    /**
     * アニメーションループ開始
     */
    private startAnimationLoop(): void {
        if (this.animationFrameId) {
            return; // 既にアニメーションループが実行中
        }

        const loop = () => {
            try {
                const currentTime = Date.now();
                let hasActiveAnimations = false;

                // ハイライトアニメーション更新
                if (this.animations.highlight.isActive) {
                    this.updateHighlightAnimation(currentTime);
                    hasActiveAnimations = true;
                }

                // パネルアニメーション更新
                if (this.animations.panel.isActive) {
                    this.updatePanelAnimation(currentTime);
                    hasActiveAnimations = true;
                }

                // スポットライトアニメーション更新
                if (this.animations.spotlight.isActive) {
                    this.updateSpotlightAnimation(currentTime);
                    hasActiveAnimations = true;
                }

                // アクティブなアニメーションがある場合は継続
                if (hasActiveAnimations) {
                    this.animationFrameId = requestAnimationFrame(loop);
                } else {
                    this.animationFrameId = null;
                }
            } catch (error) {
                this.errorHandler.handleError(error as Error, 'TutorialAnimationController.animationLoop');
                this.animationFrameId = null;
            }
        };

        this.animationFrameId = requestAnimationFrame(loop);
    }

    /**
     * ハイライトアニメーション更新
     * @param currentTime - 現在時刻
     */
    private updateHighlightAnimation(currentTime: number): void {
        const animation = this.animations.highlight;
        if (!animation.element || !animation.isActive) return;

        const elapsed = currentTime - animation.startTime;
        const duration = this.animationConfig.highlightAnimationDuration;
        
        let progress = Math.min(elapsed / duration, 1);
        
        // アニメーションタイプごとの処理
        switch (animation.type) {
            case 'pulse':
                this.applyPulseAnimation(animation.element, progress, animation.intensity);
                break;
            case 'breathing':
                this.applyBreathingAnimation(animation.element, progress, animation.intensity);
                break;
            case 'ripple':
                this.applyRippleAnimation(animation.element, progress, animation.intensity);
                break;
            case 'sparkle':
                this.applySparkleAnimation(animation.element, progress, animation.intensity);
                break;
            case 'bounce':
                this.applyBounceAnimation(animation.element, progress, animation.intensity);
                break;
        }

        // アニメーション終了判定
        if (progress >= 1 && animation.type !== 'pulse' && animation.type !== 'breathing') {
            animation.isActive = false;
        }
    }

    /**
     * パネルアニメーション更新
     * @param currentTime - 現在時刻
     */
    private updatePanelAnimation(currentTime: number): void {
        const animation = this.animations.panel;
        if (!animation.element || !animation.isActive) return;

        const elapsed = currentTime - animation.startTime;
        const duration = this.animationConfig.panelSlideAnimationDuration;
        
        let progress = Math.min(elapsed / duration, 1);
        progress = this.easingFunctions.easeOutCubic(progress);
        
        animation.progress = progress;

        // アニメーションタイプごとの処理
        switch (animation.type) {
            case 'slideIn':
                this.applySlideInAnimation(animation.element, progress, animation.direction);
                break;
            case 'slideOut':
                this.applySlideOutAnimation(animation.element, progress, animation.direction);
                break;
            case 'bounceIn':
                this.applyBounceInAnimation(animation.element, progress);
                break;
            case 'scaleIn':
                this.applyScaleInAnimation(animation.element, progress);
                break;
        }

        // アニメーション終了判定
        if (progress >= 1) {
            animation.isActive = false;
        }
    }

    /**
     * スポットライトアニメーション更新
     * @param currentTime - 現在時刻
     */
    private updateSpotlightAnimation(currentTime: number): void {
        const animation = this.animations.spotlight;
        if (!animation.element || !animation.isActive) return;

        const elapsed = currentTime - animation.startTime;
        const duration = this.animationConfig.fadeInDuration;
        
        let progress = Math.min(elapsed / duration, 1);
        progress = this.easingFunctions.easeInOutQuad(progress);

        // 半径の補間
        if (animation.expansion) {
            animation.currentRadius = progress * animation.targetRadius;
        } else {
            animation.currentRadius = animation.targetRadius * (1 - progress);
        }

        this.applySpotlightEffect(animation.element, animation.currentRadius);

        // アニメーション終了判定
        if (progress >= 1) {
            animation.isActive = false;
        }
    }

    /**
     * パルスアニメーション適用
     * @param element - 対象要素
     * @param progress - 進捗
     * @param intensity - 強度
     */
    private applyPulseAnimation(element: HTMLElement, progress: number, intensity: number): void {
        const pulseValue = Math.sin(progress * Math.PI * 2) * intensity;
        const opacity = 0.7 + (pulseValue * 0.3);
        const scale = 1 + (pulseValue * 0.1);
        
        element.style.opacity = opacity.toString();
        element.style.transform = `scale(${scale})`;
        element.style.filter = `drop-shadow(0 0 ${pulseValue * 10}px rgba(0, 123, 255, ${intensity}))`;
    }

    /**
     * ブリージングアニメーション適用
     * @param element - 対象要素
     * @param progress - 進捗
     * @param intensity - 強度
     */
    private applyBreathingAnimation(element: HTMLElement, progress: number, intensity: number): void {
        const breathValue = (Math.sin(progress * Math.PI * 4) + 1) / 2;
        const opacity = 0.5 + (breathValue * 0.5 * intensity);
        
        element.style.opacity = opacity.toString();
        element.style.filter = `blur(${(1 - breathValue) * 2}px)`;
    }

    /**
     * リップルアニメーション適用
     * @param element - 対象要素
     * @param progress - 進捗
     * @param intensity - 強度
     */
    private applyRippleAnimation(element: HTMLElement, progress: number, intensity: number): void {
        const scale = 1 + (progress * 0.2 * intensity);
        const opacity = 1 - (progress * 0.7);
        
        element.style.transform = `scale(${scale})`;
        element.style.opacity = opacity.toString();
        element.style.borderWidth = `${progress * 5}px`;
    }

    /**
     * スパークルアニメーション適用
     * @param element - 対象要素
     * @param progress - 進捗
     * @param intensity - 強度
     */
    private applySparkleAnimation(element: HTMLElement, progress: number, intensity: number): void {
        const sparkle = Math.sin(progress * Math.PI * 6) * intensity;
        const brightness = 1 + (sparkle * 0.5);
        
        element.style.filter = `brightness(${brightness}) contrast(${1 + sparkle * 0.2})`;
        element.style.boxShadow = `0 0 ${sparkle * 15}px rgba(255, 215, 0, ${intensity})`;
    }

    /**
     * バウンスアニメーション適用
     * @param element - 対象要素
     * @param progress - 進捗
     * @param intensity - 強度
     */
    private applyBounceAnimation(element: HTMLElement, progress: number, intensity: number): void {
        const bounceValue = this.easingFunctions.easeOutBounce(progress);
        const translateY = -this.animationConfig.bounceHeight * bounceValue * intensity;
        
        element.style.transform = `translateY(${translateY}px)`;
    }

    /**
     * スライドインアニメーション適用
     * @param element - 対象要素
     * @param progress - 進捗
     * @param direction - 方向
     */
    private applySlideInAnimation(element: HTMLElement, progress: number, direction: AnimationDirection): void {
        const translateValue = (1 - progress) * 100;
        
        switch (direction) {
            case 'top':
                element.style.transform = `translateY(-${translateValue}%)`;
                break;
            case 'bottom':
                element.style.transform = `translateY(${translateValue}%)`;
                break;
            case 'left':
                element.style.transform = `translateX(-${translateValue}%)`;
                break;
            case 'right':
                element.style.transform = `translateX(${translateValue}%)`;
                break;
        }
        
        element.style.opacity = progress.toString();
    }

    /**
     * スライドアウトアニメーション適用
     * @param element - 対象要素
     * @param progress - 進捗
     * @param direction - 方向
     */
    private applySlideOutAnimation(element: HTMLElement, progress: number, direction: AnimationDirection): void {
        const translateValue = progress * 100;
        
        switch (direction) {
            case 'top':
                element.style.transform = `translateY(-${translateValue}%)`;
                break;
            case 'bottom':
                element.style.transform = `translateY(${translateValue}%)`;
                break;
            case 'left':
                element.style.transform = `translateX(-${translateValue}%)`;
                break;
            case 'right':
                element.style.transform = `translateX(${translateValue}%)`;
                break;
        }
        
        element.style.opacity = (1 - progress).toString();
    }

    /**
     * バウンスインアニメーション適用
     * @param element - 対象要素
     * @param progress - 進捗
     */
    private applyBounceInAnimation(element: HTMLElement, progress: number): void {
        const bounceValue = this.easingFunctions.easeOutBounce(progress);
        const scale = bounceValue;
        
        element.style.transform = `scale(${scale})`;
        element.style.opacity = progress.toString();
    }

    /**
     * スケールインアニメーション適用
     * @param element - 対象要素
     * @param progress - 進捗
     */
    private applyScaleInAnimation(element: HTMLElement, progress: number): void {
        const easedProgress = this.easingFunctions.easeOutCubic(progress);
        
        element.style.transform = `scale(${easedProgress})`;
        element.style.opacity = progress.toString();
    }

    /**
     * スポットライト効果適用
     * @param element - 対象要素
     * @param radius - 半径
     */
    private applySpotlightEffect(element: HTMLElement, radius: number): void {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        element.style.background = `radial-gradient(circle at ${centerX}px ${centerY}px, transparent ${radius}px, rgba(0, 0, 0, 0.7) ${radius + 50}px)`;
    }

    /**
     * アニメーションキュー処理
     */
    private async processAnimationQueue(): Promise<void> {
        if (this.isProcessingQueue || this.animationQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        try {
            while (this.animationQueue.length > 0) {
                const animationFunction = this.animationQueue.shift();
                if (animationFunction) {
                    animationFunction();
                    // アニメーション間の待機時間
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        } catch (error) {
            this.errorHandler.handleError(error as Error, 'TutorialAnimationController.processAnimationQueue');
        } finally {
            this.isProcessingQueue = false;
        }
    }
}

// シングルトンインスタンス管理
let tutorialAnimationControllerInstance: TutorialAnimationController | null = null;

/**
 * TutorialAnimationControllerのシングルトンインスタンスを取得
 * @returns TutorialAnimationControllerインスタンス
 */
export function getTutorialAnimationController(): TutorialAnimationController {
    if (!tutorialAnimationControllerInstance) {
        tutorialAnimationControllerInstance = new TutorialAnimationController();
    }
    return tutorialAnimationControllerInstance;
}

/**
 * TutorialAnimationControllerインスタンスを再初期化
 * @returns 新しいTutorialAnimationControllerインスタンス
 */
export function reinitializeTutorialAnimationController(): TutorialAnimationController {
    if (tutorialAnimationControllerInstance) {
        tutorialAnimationControllerInstance.dispose();
    }
    tutorialAnimationControllerInstance = new TutorialAnimationController();
    return tutorialAnimationControllerInstance;
}

export default TutorialAnimationController;