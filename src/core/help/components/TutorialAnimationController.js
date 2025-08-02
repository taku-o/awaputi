/**
 * TutorialAnimationController.js
 * チュートリアルアニメーション制御システム
 * TutorialOverlayから分離されたアニメーション機能
 */

import { getErrorHandler } from '../../../utils/ErrorHandler.js';
import { LoggingSystem } from '../../LoggingSystem.js';

export class TutorialAnimationController {
    constructor() {
        this.errorHandler = getErrorHandler();
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // アニメーション設定
        this.animationConfig = {
            fadeInDuration: 300,
            fadeOutDuration: 200,
            pulseInterval: 2000,
            highlightAnimationDuration: 500,
            panelSlideAnimationDuration: 400,
            breathingPulseDuration: 3000,
            rippleAnimationDuration: 1500,
            sparkleAnimationDuration: 2000,
            glowIntensity: 0.8,
            bounceHeight: 15,
            bounceDuration: 800,
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
            linear: t => t,
            easeInQuad: t => t * t,
            easeOutQuad: t => t * (2 - t),
            easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            easeInCubic: t => t * t * t,
            easeOutCubic: t => (--t) * t * t + 1,
            easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
            easeInBounce: t => 1 - this.easingFunctions.easeOutBounce(1 - t),
            easeOutBounce: t => {
                if (t < 1 / 2.75) return 7.5625 * t * t;
                if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
                if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
                return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
            }
        };
        
        // レンダリング用フレームID
        this.animationFrameId = null;
        
        this.initialize();
    }
    
    /**
     * アニメーションコントローラーを初期化
     */
    initialize() {
        try {
            this.startAnimationLoop();
            this.loggingSystem.debug('TutorialAnimationController', 'Animation controller initialized');
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialAnimationController.initialize');
        }
    }
    
    /**
     * アニメーションループを開始
     */
    startAnimationLoop() {
        const animate = (currentTime) => {
            this.updateAnimations(currentTime);
            this.processAnimationQueue();
            this.animationFrameId = requestAnimationFrame(animate);
        };
        
        this.animationFrameId = requestAnimationFrame(animate);
    }
    
    /**
     * ハイライトアニメーションを開始
     * @param {HTMLElement} element - アニメーション対象要素
     * @param {string} type - アニメーションタイプ
     * @param {number} intensity - アニメーション強度
     */
    startHighlightAnimation(element, type = 'pulse', intensity = 1.0) {
        try {
            if (!element) {
                throw new Error('Element is required for highlight animation');
            }
            
            this.animations.highlight = {
                isActive: true,
                startTime: Date.now(),
                type: type,
                intensity: intensity,
                currentFrame: 0,
                element: element
            };
            
            this.loggingSystem.debug('TutorialAnimationController', 
                `Highlight animation started: ${type}, intensity: ${intensity}`);
                
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialAnimationController.startHighlightAnimation');
        }
    }
    
    /**
     * パネルアニメーションを開始
     * @param {HTMLElement} element - アニメーション対象要素
     * @param {string} type - アニメーションタイプ
     * @param {string} direction - 方向
     */
    startPanelAnimation(element, type = 'slideIn', direction = 'bottom') {
        try {
            if (!element) {
                throw new Error('Element is required for panel animation');
            }
            
            this.animations.panel = {
                isActive: true,
                startTime: Date.now(),
                type: type,
                direction: direction,
                progress: 0,
                element: element
            };
            
            this.loggingSystem.debug('TutorialAnimationController', 
                `Panel animation started: ${type} from ${direction}`);
                
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialAnimationController.startPanelAnimation');
        }
    }
    
    /**
     * スポットライトアニメーションを開始
     * @param {HTMLElement} element - アニメーション対象要素
     * @param {number} targetRadius - 目標半径
     * @param {boolean} expansion - 拡張するかどうか
     */
    startSpotlightAnimation(element, targetRadius, expansion = true) {
        try {
            if (!element) {
                throw new Error('Element is required for spotlight animation');
            }
            
            this.animations.spotlight = {
                isActive: true,
                startTime: Date.now(),
                currentRadius: expansion ? 0 : targetRadius,
                targetRadius: targetRadius,
                expansion: expansion,
                element: element
            };
            
            this.loggingSystem.debug('TutorialAnimationController', 
                `Spotlight animation started: radius ${targetRadius}, expansion: ${expansion}`);
                
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialAnimationController.startSpotlightAnimation');
        }
    }
    
    /**
     * アニメーションを更新
     * @param {number} currentTime - 現在時刻
     */
    updateAnimations(currentTime) {
        this.updateHighlightAnimation(currentTime);
        this.updatePanelAnimation(currentTime);
        this.updateSpotlightAnimation(currentTime);
    }
    
    /**
     * ハイライトアニメーションを更新
     * @param {number} currentTime - 現在時刻
     */
    updateHighlightAnimation(currentTime) {
        if (!this.animations.highlight.isActive || !this.animations.highlight.element) return;
        
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
        const progress = (elapsed % duration) / duration;
        
        animation.currentFrame = progress;
        
        this.applyHighlightAnimationStyles(animation);
    }
    
    /**
     * パネルアニメーションを更新
     * @param {number} currentTime - 現在時刻
     */
    updatePanelAnimation(currentTime) {
        if (!this.animations.panel.isActive || !this.animations.panel.element) return;
        
        const animation = this.animations.panel;
        const elapsed = currentTime - animation.startTime;
        const duration = this.animationConfig.panelSlideAnimationDuration;
        
        let progress = Math.min(elapsed / duration, 1);
        
        // イージング適用
        switch (animation.type) {
            case 'bounceIn':
                progress = this.easingFunctions.easeOutBounce(progress);
                break;
            case 'scaleIn':
                progress = this.easingFunctions.easeOutCubic(progress);
                break;
            default:
                progress = this.easingFunctions.easeOutQuad(progress);
        }
        
        animation.progress = progress;
        
        this.applyPanelAnimationStyles(animation);
        
        // アニメーション完了チェック
        if (progress >= 1 && animation.type !== 'slideOut') {
            animation.isActive = false;
        }
    }
    
    /**
     * スポットライトアニメーションを更新
     * @param {number} currentTime - 現在時刻
     */
    updateSpotlightAnimation(currentTime) {
        if (!this.animations.spotlight.isActive || !this.animations.spotlight.element) return;
        
        const animation = this.animations.spotlight;
        const elapsed = currentTime - animation.startTime;
        const duration = 500; // スポットライトアニメーション時間
        
        let progress = Math.min(elapsed / duration, 1);
        progress = this.easingFunctions.easeOutQuad(progress);
        
        if (animation.expansion) {
            animation.currentRadius = progress * animation.targetRadius;
        } else {
            animation.currentRadius = animation.targetRadius * (1 - progress);
        }
        
        this.applySpotlightAnimationStyles(animation);
        
        // アニメーション完了チェック
        if (progress >= 1) {
            animation.isActive = false;
        }
    }
    
    /**
     * ハイライトアニメーションスタイルを適用
     * @param {Object} animation - アニメーション情報
     */
    applyHighlightAnimationStyles(animation) {
        const element = animation.element;
        const progress = animation.currentFrame;
        const intensity = animation.intensity;
        
        switch (animation.type) {
            case 'pulse':
                this.applyPulseEffect(element, progress, intensity);
                break;
            case 'breathing':
                this.applyBreathingEffect(element, progress, intensity);
                break;
            case 'ripple':
                this.applyRippleEffect(element, progress, intensity);
                break;
            case 'sparkle':
                this.applySparkleEffect(element, progress, intensity);
                break;
            case 'bounce':
                this.applyBounceEffect(element, progress, intensity);
                break;
        }
    }
    
    /**
     * パルスエフェクトを適用
     * @param {HTMLElement} element - 対象要素
     * @param {number} progress - 進捗
     * @param {number} intensity - 強度
     */
    applyPulseEffect(element, progress, intensity) {
        const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.1 * intensity;
        const opacity = 0.7 + Math.sin(progress * Math.PI * 2) * 0.3 * intensity;
        
        element.style.transform = `scale(${scale})`;
        element.style.opacity = opacity;
        element.style.boxShadow = `0 0 ${20 * intensity}px rgba(0, 123, 255, ${opacity * 0.5})`;
    }
    
    /**
     * 呼吸エフェクトを適用
     * @param {HTMLElement} element - 対象要素
     * @param {number} progress - 進捗
     * @param {number} intensity - 強度
     */
    applyBreathingEffect(element, progress, intensity) {
        const scale = 1 + Math.sin(progress * Math.PI) * 0.05 * intensity;
        const opacity = 0.8 + Math.sin(progress * Math.PI) * 0.2 * intensity;
        
        element.style.transform = `scale(${scale})`;
        element.style.opacity = opacity;
    }
    
    /**
     * リップルエフェクトを適用
     * @param {HTMLElement} element - 対象要素
     * @param {number} progress - 進捗
     * @param {number} intensity - 強度
     */
    applyRippleEffect(element, progress, intensity) {
        const rippleSize = progress * 50 * intensity;
        const opacity = (1 - progress) * intensity;
        
        element.style.position = 'relative';
        element.style.overflow = 'visible';
        
        // リップル要素を動的に作成・更新
        let ripple = element.querySelector('.tutorial-ripple');
        if (!ripple) {
            ripple = document.createElement('div');
            ripple.className = 'tutorial-ripple';
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.pointerEvents = 'none';
            element.appendChild(ripple);
        }
        
        ripple.style.width = `${rippleSize}px`;
        ripple.style.height = `${rippleSize}px`;
        ripple.style.border = `2px solid rgba(0, 123, 255, ${opacity})`;
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.transform = 'translate(-50%, -50%)';
    }
    
    /**
     * スパークルエフェクトを適用
     * @param {HTMLElement} element - 対象要素
     * @param {number} progress - 進捗
     * @param {number} intensity - 強度
     */
    applySparkleEffect(element, progress, intensity) {
        const sparkleCount = Math.floor(5 * intensity);
        
        // 既存のスパークルを削除
        element.querySelectorAll('.tutorial-sparkle').forEach(sparkle => sparkle.remove());
        
        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'tutorial-sparkle';
            sparkle.style.position = 'absolute';
            sparkle.style.width = '4px';
            sparkle.style.height = '4px';
            sparkle.style.backgroundColor = '#ffd700';
            sparkle.style.borderRadius = '50%';
            sparkle.style.pointerEvents = 'none';
            
            const angle = (i / sparkleCount) * Math.PI * 2;
            const radius = 30 + progress * 20;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            sparkle.style.left = `calc(50% + ${x}px)`;
            sparkle.style.top = `calc(50% + ${y}px)`;
            sparkle.style.opacity = Math.sin(progress * Math.PI) * intensity;
            
            element.appendChild(sparkle);
        }
    }
    
    /**
     * バウンスエフェクトを適用
     * @param {HTMLElement} element - 対象要素
     * @param {number} progress - 進捗
     * @param {number} intensity - 強度
     */
    applyBounceEffect(element, progress, intensity) {
        const bounceHeight = this.animationConfig.bounceHeight * intensity;
        const bounceValue = this.easingFunctions.easeOutBounce(progress);
        const translateY = -bounceHeight * bounceValue;
        
        element.style.transform = `translateY(${translateY}px)`;
    }
    
    /**
     * パネルアニメーションスタイルを適用
     * @param {Object} animation - アニメーション情報
     */
    applyPanelAnimationStyles(animation) {
        const element = animation.element;
        const progress = animation.progress;
        const type = animation.type;
        const direction = animation.direction;
        
        switch (type) {
            case 'slideIn':
                this.applySlideInEffect(element, progress, direction);
                break;
            case 'slideOut':
                this.applySlideOutEffect(element, progress, direction);
                break;
            case 'bounceIn':
                this.applyBounceInEffect(element, progress);
                break;
            case 'scaleIn':
                this.applyScaleInEffect(element, progress);
                break;
        }
    }
    
    /**
     * スライドインエフェクトを適用
     * @param {HTMLElement} element - 対象要素
     * @param {number} progress - 進捗
     * @param {string} direction - 方向
     */
    applySlideInEffect(element, progress, direction) {
        let transform = '';
        
        switch (direction) {
            case 'top':
                transform = `translateY(${(1 - progress) * -100}%)`;
                break;
            case 'bottom':
                transform = `translateY(${(1 - progress) * 100}%)`;
                break;
            case 'left':
                transform = `translateX(${(1 - progress) * -100}%)`;
                break;
            case 'right':
                transform = `translateX(${(1 - progress) * 100}%)`;
                break;
        }
        
        element.style.transform = transform;
        element.style.opacity = progress;
    }
    
    /**
     * スライドアウトエフェクトを適用
     * @param {HTMLElement} element - 対象要素
     * @param {number} progress - 進捗
     * @param {string} direction - 方向
     */
    applySlideOutEffect(element, progress, direction) {
        let transform = '';
        
        switch (direction) {
            case 'top':
                transform = `translateY(${progress * -100}%)`;
                break;
            case 'bottom':
                transform = `translateY(${progress * 100}%)`;
                break;
            case 'left':
                transform = `translateX(${progress * -100}%)`;
                break;
            case 'right':
                transform = `translateX(${progress * 100}%)`;
                break;
        }
        
        element.style.transform = transform;
        element.style.opacity = 1 - progress;
    }
    
    /**
     * バウンスインエフェクトを適用
     * @param {HTMLElement} element - 対象要素
     * @param {number} progress - 進捗
     */
    applyBounceInEffect(element, progress) {
        element.style.transform = `scale(${progress})`;
        element.style.opacity = progress;
    }
    
    /**
     * スケールインエフェクトを適用
     * @param {HTMLElement} element - 対象要素
     * @param {number} progress - 進捗
     */
    applyScaleInEffect(element, progress) {
        element.style.transform = `scale(${progress})`;
        element.style.opacity = progress;
    }
    
    /**
     * スポットライトアニメーションスタイルを適用
     * @param {Object} animation - アニメーション情報
     */
    applySpotlightAnimationStyles(animation) {
        const element = animation.element;
        const radius = animation.currentRadius;
        
        element.style.clipPath = `circle(${radius}px at center)`;
    }
    
    /**
     * アニメーションキューを処理
     */
    processAnimationQueue() {
        if (this.isProcessingQueue || this.animationQueue.length === 0) return;
        
        this.isProcessingQueue = true;
        
        const nextAnimation = this.animationQueue.shift();
        if (nextAnimation && typeof nextAnimation === 'function') {
            try {
                nextAnimation();
            } catch (error) {
                this.errorHandler.handleError(error, 'TutorialAnimationController.processAnimationQueue');
            }
        }
        
        this.isProcessingQueue = false;
    }
    
    /**
     * アニメーションをキューに追加
     * @param {Function} animationFunction - アニメーション関数
     */
    queueAnimation(animationFunction) {
        this.animationQueue.push(animationFunction);
    }
    
    /**
     * すべてのアニメーションを停止
     */
    stopAllAnimations() {
        Object.keys(this.animations).forEach(key => {
            this.animations[key].isActive = false;
        });
        
        this.animationQueue = [];
        this.loggingSystem.debug('TutorialAnimationController', 'All animations stopped');
    }
    
    /**
     * 特定のアニメーションを停止
     * @param {string} animationType - アニメーションタイプ
     */
    stopAnimation(animationType) {
        if (this.animations[animationType]) {
            this.animations[animationType].isActive = false;
            this.loggingSystem.debug('TutorialAnimationController', `Animation stopped: ${animationType}`);
        }
    }
    
    /**
     * アニメーション設定を更新
     * @param {Object} newConfig - 新しい設定
     */
    updateConfig(newConfig) {
        Object.assign(this.animationConfig, newConfig);
        this.loggingSystem.debug('TutorialAnimationController', 'Animation configuration updated', newConfig);
    }
    
    /**
     * リソースをクリーンアップ
     */
    dispose() {
        try {
            this.stopAllAnimations();
            
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
            
            // スパークルとリップル要素を削除
            document.querySelectorAll('.tutorial-sparkle, .tutorial-ripple').forEach(element => {
                element.remove();
            });
            
            this.loggingSystem.debug('TutorialAnimationController', 'Animation controller disposed');
        } catch (error) {
            this.errorHandler.handleError(error, 'TutorialAnimationController.dispose');
        }
    }
}