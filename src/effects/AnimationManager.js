import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getEffectsConfig } from '../config/EffectsConfig.js';

/**
 * アニメーション管理クラス
 * UI要素、オブジェクト、ゲーム要素のアニメーションを統一管理
 * - バブルスポーン/破壊アニメーション
 * - UIエレメントの遷移アニメーション
 * - スコア更新アニメーション
 * - メニュー遷移とローディングアニメーション
 * - 高度なイージング関数とタイムライン制御
 */
export class AnimationManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.animations = [];
        this.animationId = 0;
        
        // 設定システムとの連携
        this.effectsConfig = getEffectsConfig();
        
        // アニメーション設定
        this.settings = {
            enabled: true,
            globalSpeed: 1.0,
            quality: 'high', // 'low', 'medium', 'high', 'ultra'
            enableEasing: true,
            enableParallax: true
        };
        
        // アニメーションタイプ別設定
        this.typeSettings = {
            ui: { enabled: true, speedMultiplier: 1.0 },
            bubble: { enabled: true, speedMultiplier: 1.0 },
            score: { enabled: true, speedMultiplier: 1.0 },
            menu: { enabled: true, speedMultiplier: 0.8 },
            loading: { enabled: true, speedMultiplier: 1.2 }
        };
        
        // キューイングシステム
        this.animationQueue = [];
        this.maxConcurrentAnimations = 50;
        
        // パフォーマンス監視
        this.performanceMetrics = {
            activeAnimations: 0,
            frameTime: 0,
            droppedFrames: 0
        };
        
        console.log('[AnimationManager] アニメーション管理システムを初期化しました');
        this._initializeFromConfig();
    }
    
    /**
     * 設定から初期化
     */
    _initializeFromConfig() {
        try {
            const animationConfig = this.effectsConfig.getAnimationConfig();
            if (animationConfig) {
                this.settings.enabled = animationConfig.enabled || true;
                this.settings.globalSpeed = animationConfig.globalSpeed || 1.0;
                this.settings.quality = animationConfig.quality || 'high';
            }
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'AnimationManager._initializeFromConfig'
            });
        }
    }
    
    // ========================================
    // バブルアニメーション
    // ========================================
    
    /**
     * バブルスポーンアニメーション
     */
    animateBubbleSpawn(bubble, spawnType = 'scale', options = {}) {
        if (!this.settings.enabled || !this.typeSettings.bubble.enabled) {
            return -1;
        }
        
        try {
            const animation = {
                id: this.animationId++,
                type: 'bubbleSpawn',
                target: bubble,
                spawnType, // 'scale', 'fade', 'bounce', 'spiral', 'pop'
                duration: options.duration || 800,
                elapsed: 0,
                easing: options.easing || 'easeOutBounce',
                startValues: this._getBubbleStartValues(bubble, spawnType),
                endValues: this._getBubbleEndValues(bubble, spawnType),
                options: {
                    delay: options.delay || 0,
                    intensity: options.intensity || 1.0,
                    direction: options.direction || 0,
                    ...options
                }
            };
            
            // 遅延がある場合は遅延付きで開始
            if (animation.options.delay > 0) {
                setTimeout(() => {
                    this.animations.push(animation);
                }, animation.options.delay);
            } else {
                this.animations.push(animation);
            }
            
            return animation.id;
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'AnimationManager.animateBubbleSpawn'
            });
            return -1;
        }
    }
    
    /**
     * バブル破壊アニメーション
     */
    animateBubbleDestroy(bubble, destroyType = 'shrink', options = {}) {
        if (!this.settings.enabled || !this.typeSettings.bubble.enabled) {
            return -1;
        }
        
        try {
            const animation = {
                id: this.animationId++,
                type: 'bubbleDestroy',
                target: bubble,
                destroyType, // 'shrink', 'explode', 'dissolve', 'shatter', 'vaporize'
                duration: options.duration || 600,
                elapsed: 0,
                easing: options.easing || 'easeInQuad',
                startValues: this._getBubbleStartValues(bubble, destroyType),
                endValues: this._getBubbleDestroyEndValues(bubble, destroyType),
                options: {
                    intensity: options.intensity || 1.0,
                    fragments: options.fragments || 8,
                    ...options
                }
            };
            
            this.animations.push(animation);
            return animation.id;
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'AnimationManager.animateBubbleDestroy'
            });
            return -1;
        }
    }
    
    /**
     * バブル移動アニメーション
     */
    animateBubbleMovement(bubble, targetPosition, duration = 1000, options = {}) {
        if (!this.settings.enabled || !this.typeSettings.bubble.enabled) {
            return -1;
        }
        
        try {
            const animation = {
                id: this.animationId++,
                type: 'bubbleMovement',
                target: bubble,
                duration,
                elapsed: 0,
                easing: options.easing || 'easeInOutQuad',
                startValues: { x: bubble.x, y: bubble.y },
                endValues: { x: targetPosition.x, y: targetPosition.y },
                options: {
                    path: options.path || 'linear', // 'linear', 'arc', 'bezier', 'wave'
                    controlPoints: options.controlPoints || [],
                    rotation: options.rotation || false,
                    ...options
                }
            };
            
            this.animations.push(animation);
            return animation.id;
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'AnimationManager.animateBubbleMovement'
            });
            return -1;
        }
    }
    
    /**
     * バブル開始値を取得
     */
    _getBubbleStartValues(bubble, animationType) {
        const baseValues = {
            x: bubble.x,
            y: bubble.y,
            size: bubble.size,
            alpha: bubble.alpha || 1,
            rotation: bubble.rotation || 0,
            scale: bubble.scale || 1
        };
        
        switch (animationType) {
            case 'scale':
                return { ...baseValues, scale: 0 };
            case 'fade':
                return { ...baseValues, alpha: 0 };
            case 'bounce':
                return { ...baseValues, scale: 0, y: bubble.y + 50 };
            case 'spiral':
                return { ...baseValues, scale: 0, rotation: -Math.PI * 2 };
            case 'pop':
                return { ...baseValues, scale: 1.5, alpha: 0 };
            default:
                return baseValues;
        }
    }
    
    /**
     * バブル終了値を取得
     */
    _getBubbleEndValues(bubble, animationType) {
        return {
            x: bubble.x,
            y: bubble.y,
            size: bubble.size,
            alpha: 1,
            rotation: 0,
            scale: 1
        };
    }
    
    /**
     * バブル破壊終了値を取得
     */
    _getBubbleDestroyEndValues(bubble, destroyType) {
        const baseValues = {
            x: bubble.x,
            y: bubble.y,
            size: bubble.size,
            alpha: 0,
            rotation: 0,
            scale: 1
        };
        
        switch (destroyType) {
            case 'shrink':
                return { ...baseValues, scale: 0 };
            case 'explode':
                return { ...baseValues, scale: 2, alpha: 0 };
            case 'dissolve':
                return { ...baseValues, alpha: 0 };
            case 'shatter':
                return { ...baseValues, scale: 0.1, rotation: Math.PI };
            case 'vaporize':
                return { ...baseValues, scale: 3, alpha: 0, y: bubble.y - 100 };
            default:
                return baseValues;
        }
    }
    
    // ========================================
    // UIアニメーション
    // ========================================
    
    /**
     * UIエレメントアニメーション
     */
    animateUIElement(element, animationType, duration = 500, options = {}) {
        if (!this.settings.enabled || !this.typeSettings.ui.enabled) {
            return -1;
        }
        
        try {
            const animation = {
                id: this.animationId++,
                type: 'uiElement',
                target: element,
                animationType, // 'fadeIn', 'fadeOut', 'slideIn', 'slideOut', 'bounce', 'pulse', 'shake'
                duration,
                elapsed: 0,
                easing: options.easing || 'easeOutQuad',
                startValues: this._getUIStartValues(element, animationType, options),
                endValues: this._getUIEndValues(element, animationType, options),
                options: {
                    direction: options.direction || 'up', // for slide animations
                    distance: options.distance || 50,
                    intensity: options.intensity || 1.0,
                    ...options
                }
            };
            
            this.animations.push(animation);
            return animation.id;
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'AnimationManager.animateUIElement'
            });
            return -1;
        }
    }
    
    /**
     * スコア変更アニメーション
     */
    animateScoreChange(oldScore, newScore, element, duration = 1000, options = {}) {
        if (!this.settings.enabled || !this.typeSettings.score.enabled) {
            return -1;
        }
        
        try {
            const scoreDiff = newScore - oldScore;
            const animation = {
                id: this.animationId++,
                type: 'scoreChange',
                target: element,
                duration,
                elapsed: 0,
                easing: options.easing || 'easeOutQuart',
                startValues: { score: oldScore, scale: 1, alpha: 1 },
                endValues: { score: newScore, scale: 1, alpha: 1 },
                scoreDiff,
                options: {
                    showDifference: options.showDifference !== false,
                    animateScale: options.animateScale !== false,
                    color: scoreDiff > 0 ? '#00FF00' : '#FF0000',
                    ...options
                }
            };
            
            // スコア増加時のスケールアニメーション
            if (animation.options.animateScale && scoreDiff > 0) {
                animation.endValues.scale = 1.2;
                setTimeout(() => {
                    animation.endValues.scale = 1;
                }, duration * 0.3);
            }
            
            this.animations.push(animation);
            return animation.id;
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'AnimationManager.animateScoreChange'
            });
            return -1;
        }
    }
    
    /**
     * UI開始値を取得
     */
    _getUIStartValues(element, animationType, options) {
        const baseValues = {
            x: element.x || 0,
            y: element.y || 0,
            width: element.width || 100,
            height: element.height || 50,
            alpha: element.alpha || 1,
            scale: element.scale || 1,
            rotation: element.rotation || 0
        };
        
        switch (animationType) {
            case 'fadeIn':
                return { ...baseValues, alpha: 0 };
            case 'fadeOut':
                return baseValues;
            case 'slideIn':
                const slideDistance = options.distance || 50;
                switch (options.direction) {
                    case 'left': return { ...baseValues, x: baseValues.x - slideDistance };
                    case 'right': return { ...baseValues, x: baseValues.x + slideDistance };
                    case 'up': return { ...baseValues, y: baseValues.y - slideDistance };
                    case 'down': return { ...baseValues, y: baseValues.y + slideDistance };
                    default: return { ...baseValues, y: baseValues.y - slideDistance };
                }
            case 'bounce':
                return { ...baseValues, scale: 0 };
            case 'pulse':
                return baseValues;
            case 'shake':
                return baseValues;
            default:
                return baseValues;
        }
    }
    
    /**
     * UI終了値を取得
     */
    _getUIEndValues(element, animationType, options) {
        const baseValues = {
            x: element.x || 0,
            y: element.y || 0,
            width: element.width || 100,
            height: element.height || 50,
            alpha: element.alpha || 1,
            scale: element.scale || 1,
            rotation: element.rotation || 0
        };
        
        switch (animationType) {
            case 'fadeIn':
                return baseValues;
            case 'fadeOut':
                return { ...baseValues, alpha: 0 };
            case 'slideIn':
                return baseValues;
            case 'slideOut':
                const slideDistance = options.distance || 50;
                switch (options.direction) {
                    case 'left': return { ...baseValues, x: baseValues.x - slideDistance };
                    case 'right': return { ...baseValues, x: baseValues.x + slideDistance };
                    case 'up': return { ...baseValues, y: baseValues.y - slideDistance };
                    case 'down': return { ...baseValues, y: baseValues.y + slideDistance };
                    default: return { ...baseValues, y: baseValues.y + slideDistance };
                }
            case 'bounce':
                return baseValues;
            case 'pulse':
                return { ...baseValues, scale: 1.1 };
            case 'shake':
                return baseValues;
            default:
                return baseValues;
        }
    }
    
    // ========================================
    // メニューアニメーション
    // ========================================
    
    /**
     * メニュー遷移アニメーション
     */
    animateMenuTransition(fromMenu, toMenu, transitionType = 'slide', options = {}) {
        if (!this.settings.enabled || !this.typeSettings.menu.enabled) {
            return -1;
        }
        
        try {
            const animations = [];
            
            // 退出アニメーション
            if (fromMenu) {
                const exitAnimation = {
                    id: this.animationId++,
                    type: 'menuExit',
                    target: fromMenu,
                    transitionType,
                    duration: options.duration || 600,
                    elapsed: 0,
                    easing: options.exitEasing || 'easeInQuad',
                    startValues: { alpha: 1, x: 0, y: 0, scale: 1 },
                    endValues: this._getMenuExitEndValues(transitionType, options),
                    options: { ...options }
                };
                animations.push(exitAnimation);
                this.animations.push(exitAnimation);
            }
            
            // 入場アニメーション（遅延付き）
            if (toMenu) {
                const enterAnimation = {
                    id: this.animationId++,
                    type: 'menuEnter',
                    target: toMenu,
                    transitionType,
                    duration: options.duration || 600,
                    elapsed: 0,
                    easing: options.enterEasing || 'easeOutQuad',
                    startValues: this._getMenuEnterStartValues(transitionType, options),
                    endValues: { alpha: 1, x: 0, y: 0, scale: 1 },
                    options: { 
                        delay: options.overlap ? options.duration * 0.3 : options.duration * 0.5,
                        ...options 
                    }
                };
                
                setTimeout(() => {
                    this.animations.push(enterAnimation);
                }, enterAnimation.options.delay);
                animations.push(enterAnimation);
            }
            
            return animations.map(a => a.id);
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'AnimationManager.animateMenuTransition'
            });
            return [];
        }
    }
    
    /**
     * メニュー退出終了値を取得
     */
    _getMenuExitEndValues(transitionType, options) {
        switch (transitionType) {
            case 'slide':
                const direction = options.direction || 'left';
                switch (direction) {
                    case 'left': return { alpha: 1, x: -this.canvas.width, y: 0, scale: 1 };
                    case 'right': return { alpha: 1, x: this.canvas.width, y: 0, scale: 1 };
                    case 'up': return { alpha: 1, x: 0, y: -this.canvas.height, scale: 1 };
                    case 'down': return { alpha: 1, x: 0, y: this.canvas.height, scale: 1 };
                    default: return { alpha: 1, x: -this.canvas.width, y: 0, scale: 1 };
                }
            case 'fade':
                return { alpha: 0, x: 0, y: 0, scale: 1 };
            case 'scale':
                return { alpha: 0, x: 0, y: 0, scale: 0 };
            case 'zoom':
                return { alpha: 0, x: 0, y: 0, scale: 2 };
            default:
                return { alpha: 0, x: 0, y: 0, scale: 1 };
        }
    }
    
    /**
     * メニュー入場開始値を取得
     */
    _getMenuEnterStartValues(transitionType, options) {
        switch (transitionType) {
            case 'slide':
                const direction = options.direction || 'right';
                switch (direction) {
                    case 'left': return { alpha: 1, x: -this.canvas.width, y: 0, scale: 1 };
                    case 'right': return { alpha: 1, x: this.canvas.width, y: 0, scale: 1 };
                    case 'up': return { alpha: 1, x: 0, y: -this.canvas.height, scale: 1 };
                    case 'down': return { alpha: 1, x: 0, y: this.canvas.height, scale: 1 };
                    default: return { alpha: 1, x: this.canvas.width, y: 0, scale: 1 };
                }
            case 'fade':
                return { alpha: 0, x: 0, y: 0, scale: 1 };
            case 'scale':
                return { alpha: 0, x: 0, y: 0, scale: 0 };
            case 'zoom':
                return { alpha: 0, x: 0, y: 0, scale: 0.5 };
            default:
                return { alpha: 0, x: 0, y: 0, scale: 1 };
        }
    }
    
    // ========================================
    // ローディングアニメーション
    // ========================================
    
    /**
     * ローディングアニメーション作成
     */
    createLoadingAnimation(type = 'spinner', position = null, size = 50, options = {}) {
        if (!this.settings.enabled || !this.typeSettings.loading.enabled) {
            return -1;
        }
        
        try {
            const centerX = position?.x || this.canvas.width / 2;
            const centerY = position?.y || this.canvas.height / 2;
            
            const animation = {
                id: this.animationId++,
                type: 'loading',
                loadingType: type, // 'spinner', 'dots', 'pulse', 'wave', 'progress'
                position: { x: centerX, y: centerY },
                size,
                duration: options.duration || Number.MAX_SAFE_INTEGER, // 無限ループ
                elapsed: 0,
                easing: 'linear',
                options: {
                    color: options.color || '#4A90E2',
                    speed: options.speed || 1.0,
                    elements: options.elements || 8,
                    thickness: options.thickness || 4,
                    ...options
                }
            };
            
            this.animations.push(animation);
            return animation.id;
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'AnimationManager.createLoadingAnimation'
            });
            return -1;
        }
    }
    
    // ========================================
    // 高度なアニメーション機能
    // ========================================
    
    /**
     * チェーンアニメーション
     */
    chainAnimations(animationChain) {
        const chainId = `chain_${this.animationId++}`;
        const animations = [];
        let totalDelay = 0;
        
        animationChain.forEach((animConfig, index) => {
            const animation = {
                ...animConfig,
                id: this.animationId++,
                chainId,
                chainIndex: index,
                options: {
                    ...animConfig.options,
                    delay: totalDelay
                }
            };
            
            animations.push(animation);
            totalDelay += (animConfig.duration || 500) + (animConfig.gap || 0);
        });
        
        // 遅延付きでアニメーションを追加
        animations.forEach(animation => {
            if (animation.options.delay > 0) {
                setTimeout(() => {
                    this.animations.push(animation);
                }, animation.options.delay);
            } else {
                this.animations.push(animation);
            }
        });
        
        return chainId;
    }
    
    /**
     * パラレルアニメーション
     */
    runParallelAnimations(animationList) {
        const parallelId = `parallel_${this.animationId++}`;
        const animations = [];
        
        animationList.forEach((animConfig, index) => {
            const animation = {
                ...animConfig,
                id: this.animationId++,
                parallelId,
                parallelIndex: index
            };
            
            animations.push(animation);
            this.animations.push(animation);
        });
        
        return parallelId;
    }
    
    /**
     * カスタムイージング関数
     */
    ease(t, type) {
        switch (type) {
            case 'linear':
                return t;
            case 'easeInQuad':
                return t * t;
            case 'easeOutQuad':
                return 1 - (1 - t) * (1 - t);
            case 'easeInOutQuad':
                return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            case 'easeInCubic':
                return t * t * t;
            case 'easeOutCubic':
                return 1 - Math.pow(1 - t, 3);
            case 'easeInOutCubic':
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            case 'easeInQuart':
                return t * t * t * t;
            case 'easeOutQuart':
                return 1 - Math.pow(1 - t, 4);
            case 'easeInOutQuart':
                return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
            case 'easeInBack':
                const c1 = 1.70158;
                const c3 = c1 + 1;
                return c3 * t * t * t - c1 * t * t;
            case 'easeOutBack':
                const c1_2 = 1.70158;
                const c3_2 = c1_2 + 1;
                return 1 + c3_2 * Math.pow(t - 1, 3) + c1_2 * Math.pow(t - 1, 2);
            case 'easeOutBounce':
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
            case 'easeInElastic':
                const c4 = (2 * Math.PI) / 3;
                return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
            case 'easeOutElastic':
                const c4_2 = (2 * Math.PI) / 3;
                return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4_2) + 1;
            default:
                return t;
        }
    }
    
    // ========================================
    // 更新とレンダリング
    // ========================================
    
    /**
     * アニメーション更新
     */
    update(deltaTime) {
        if (!this.settings.enabled) {
            return;
        }
        
        const startTime = performance.now();
        const adjustedDeltaTime = deltaTime * this.settings.globalSpeed;
        
        // アクティブなアニメーションを更新
        this.animations = this.animations.filter(animation => {
            animation.elapsed += adjustedDeltaTime;
            
            if (animation.elapsed >= animation.duration && animation.duration !== Number.MAX_SAFE_INTEGER) {
                this._completeAnimation(animation);
                return false; // 完了したアニメーションを削除
            }
            
            this._updateAnimation(animation, adjustedDeltaTime);
            return true;
        });
        
        // パフォーマンス監視
        this.performanceMetrics.activeAnimations = this.animations.length;
        this.performanceMetrics.frameTime = performance.now() - startTime;
        
        // 品質自動調整
        this._autoAdjustQuality();
    }
    
    /**
     * 個別アニメーション更新
     */
    _updateAnimation(animation, deltaTime) {
        const progress = Math.min(animation.elapsed / animation.duration, 1);
        const easedProgress = this.settings.enableEasing ? this.ease(progress, animation.easing) : progress;
        
        // アニメーションタイプ別更新
        switch (animation.type) {
            case 'bubbleSpawn':
                this._updateBubbleSpawnAnimation(animation, easedProgress);
                break;
            case 'bubbleDestroy':
                this._updateBubbleDestroyAnimation(animation, easedProgress);
                break;
            case 'bubbleMovement':
                this._updateBubbleMovementAnimation(animation, easedProgress);
                break;
            case 'uiElement':
                this._updateUIElementAnimation(animation, easedProgress);
                break;
            case 'scoreChange':
                this._updateScoreChangeAnimation(animation, easedProgress);
                break;
            case 'menuExit':
            case 'menuEnter':
                this._updateMenuAnimation(animation, easedProgress);
                break;
            case 'loading':
                this._updateLoadingAnimation(animation, deltaTime);
                break;
        }
    }
    
    /**
     * バブルスポーンアニメーション更新
     */
    _updateBubbleSpawnAnimation(animation, progress) {
        const start = animation.startValues;
        const end = animation.endValues;
        const target = animation.target;
        
        // 基本的な補間
        target.scale = start.scale + (end.scale - start.scale) * progress;
        target.alpha = start.alpha + (end.alpha - start.alpha) * progress;
        target.rotation = start.rotation + (end.rotation - start.rotation) * progress;
        
        // スポーンタイプ別の特殊処理
        switch (animation.spawnType) {
            case 'bounce':
                target.y = start.y + (end.y - start.y) * progress;
                break;
            case 'spiral':
                const spiralProgress = progress * Math.PI * 2;
                target.x = end.x + Math.cos(spiralProgress) * (1 - progress) * 30;
                target.y = end.y + Math.sin(spiralProgress) * (1 - progress) * 30;
                break;
            case 'pop':
                if (progress < 0.5) {
                    target.scale = 1.5 - progress;
                    target.alpha = progress * 2;
                } else {
                    target.scale = 0.5 + (progress - 0.5);
                }
                break;
        }
    }
    
    /**
     * バブル破壊アニメーション更新
     */
    _updateBubbleDestroyAnimation(animation, progress) {
        const start = animation.startValues;
        const end = animation.endValues;
        const target = animation.target;
        
        target.scale = start.scale + (end.scale - start.scale) * progress;
        target.alpha = start.alpha + (end.alpha - start.alpha) * progress;
        target.rotation = start.rotation + (end.rotation - start.rotation) * progress;
        
        // 破壊タイプ別の特殊処理
        switch (animation.destroyType) {
            case 'explode':
                // 爆発的拡大
                target.scale = 1 + progress * 2;
                break;
            case 'vaporize':
                target.y = start.y + (end.y - start.y) * progress;
                break;
            case 'shatter':
                // 破片効果は外部のパーティクルシステムで処理
                break;
        }
    }
    
    /**
     * バブル移動アニメーション更新
     */
    _updateBubbleMovementAnimation(animation, progress) {
        const start = animation.startValues;
        const end = animation.endValues;
        const target = animation.target;
        
        switch (animation.options.path) {
            case 'linear':
                target.x = start.x + (end.x - start.x) * progress;
                target.y = start.y + (end.y - start.y) * progress;
                break;
            case 'arc':
                const midX = (start.x + end.x) / 2;
                const midY = Math.min(start.y, end.y) - 100;
                const t1 = 2 * progress * (1 - progress);
                const t2 = progress * progress;
                target.x = start.x * (1 - progress) * (1 - progress) + midX * t1 + end.x * t2;
                target.y = start.y * (1 - progress) * (1 - progress) + midY * t1 + end.y * t2;
                break;
            case 'wave':
                target.x = start.x + (end.x - start.x) * progress;
                target.y = start.y + (end.y - start.y) * progress + Math.sin(progress * Math.PI * 4) * 20;
                break;
        }
        
        // 回転効果
        if (animation.options.rotation) {
            target.rotation = progress * Math.PI * 2;
        }
    }
    
    /**
     * UIエレメントアニメーション更新
     */
    _updateUIElementAnimation(animation, progress) {
        const start = animation.startValues;
        const end = animation.endValues;
        const target = animation.target;
        
        // 基本的な補間
        target.x = start.x + (end.x - start.x) * progress;
        target.y = start.y + (end.y - start.y) * progress;
        target.alpha = start.alpha + (end.alpha - start.alpha) * progress;
        target.scale = start.scale + (end.scale - start.scale) * progress;
        
        // アニメーションタイプ別の特殊処理
        switch (animation.animationType) {
            case 'pulse':
                const pulse = Math.sin(progress * Math.PI * 4) * 0.1 + 1;
                target.scale = pulse;
                break;
            case 'shake':
                const shakeIntensity = (1 - progress) * animation.options.intensity;
                target.x += (Math.random() - 0.5) * shakeIntensity * 10;
                target.y += (Math.random() - 0.5) * shakeIntensity * 10;
                break;
        }
    }
    
    /**
     * スコア変更アニメーション更新
     */
    _updateScoreChangeAnimation(animation, progress) {
        const start = animation.startValues;
        const end = animation.endValues;
        const target = animation.target;
        
        // スコア値の補間
        const currentScore = Math.floor(start.score + (end.score - start.score) * progress);
        if (target.textContent !== undefined) {
            target.textContent = currentScore.toString();
        } else if (target.score !== undefined) {
            target.score = currentScore;
        }
        
        // スケールアニメーション
        target.scale = start.scale + (end.scale - start.scale) * progress;
        
        // 差分表示
        if (animation.options.showDifference && animation.scoreDiff !== 0) {
            // 差分表示ロジック（実装は使用側で処理）
            target.scoreDiff = animation.scoreDiff;
            target.diffAlpha = 1 - progress;
        }
    }
    
    /**
     * メニューアニメーション更新
     */
    _updateMenuAnimation(animation, progress) {
        const start = animation.startValues;
        const end = animation.endValues;
        const target = animation.target;
        
        target.x = start.x + (end.x - start.x) * progress;
        target.y = start.y + (end.y - start.y) * progress;
        target.alpha = start.alpha + (end.alpha - start.alpha) * progress;
        target.scale = start.scale + (end.scale - start.scale) * progress;
    }
    
    /**
     * ローディングアニメーション更新
     */
    _updateLoadingAnimation(animation, deltaTime) {
        animation.rotation = (animation.rotation || 0) + (deltaTime * 0.003 * animation.options.speed);
        animation.phase = (animation.phase || 0) + (deltaTime * 0.002 * animation.options.speed);
        
        // ローディングタイプ別の状態更新
        switch (animation.loadingType) {
            case 'dots':
                animation.dotPhases = animation.dotPhases || [];
                for (let i = 0; i < animation.options.elements; i++) {
                    animation.dotPhases[i] = (animation.phase + i * 0.2) % (Math.PI * 2);
                }
                break;
            case 'wave':
                animation.waveOffset = (animation.waveOffset || 0) + deltaTime * 0.005;
                break;
        }
    }
    
    /**
     * アニメーション完了処理
     */
    _completeAnimation(animation) {
        // 最終値を確実に設定
        if (animation.endValues && animation.target) {
            Object.assign(animation.target, animation.endValues);
        }
        
        // コールバック実行
        if (animation.options && animation.options.onComplete) {
            animation.options.onComplete(animation);
        }
        
        // イベント発火
        this._dispatchAnimationEvent('complete', animation);
    }
    
    /**
     * 品質自動調整
     */
    _autoAdjustQuality() {
        const frameTime = this.performanceMetrics.frameTime;
        const activeCount = this.performanceMetrics.activeAnimations;
        
        // フレーム時間が長すぎる場合は品質を下げる
        if (frameTime > 16.67 && activeCount > 20) { // 60FPS基準
            if (this.settings.quality === 'ultra') {
                this.settings.quality = 'high';
            } else if (this.settings.quality === 'high') {
                this.settings.quality = 'medium';
            } else if (this.settings.quality === 'medium') {
                this.settings.quality = 'low';
            }
        }
        
        // パフォーマンスが良い場合は品質を上げる
        if (frameTime < 8 && activeCount < 10) {
            if (this.settings.quality === 'low') {
                this.settings.quality = 'medium';
            } else if (this.settings.quality === 'medium') {
                this.settings.quality = 'high';
            } else if (this.settings.quality === 'high') {
                this.settings.quality = 'ultra';
            }
        }
    }
    
    /**
     * イベント発火
     */
    _dispatchAnimationEvent(eventType, animation) {
        // カスタムイベントの実装
        if (typeof window !== 'undefined' && window.dispatchEvent) {
            const event = new CustomEvent(`animation${eventType}`, {
                detail: { animation }
            });
            window.dispatchEvent(event);
        }
    }
    
    // ========================================
    // レンダリング
    // ========================================
    
    /**
     * ローディングアニメーションをレンダリング
     */
    renderLoadingAnimation(context, animation) {
        const pos = animation.position;
        const size = animation.size;
        const options = animation.options;
        
        context.save();
        context.strokeStyle = options.color;
        context.lineWidth = options.thickness;
        context.lineCap = 'round';
        
        switch (animation.loadingType) {
            case 'spinner':
                this._renderSpinner(context, pos, size, animation.rotation, options);
                break;
            case 'dots':
                this._renderDots(context, pos, size, animation.dotPhases, options);
                break;
            case 'pulse':
                this._renderPulse(context, pos, size, animation.phase, options);
                break;
            case 'wave':
                this._renderWave(context, pos, size, animation.waveOffset, options);
                break;
        }
        
        context.restore();
    }
    
    /**
     * スピナーをレンダリング
     */
    _renderSpinner(context, pos, size, rotation, options) {
        context.translate(pos.x, pos.y);
        context.rotate(rotation);
        
        const segments = 8;
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const alpha = (i + 1) / segments;
            const startRadius = size * 0.6;
            const endRadius = size;
            
            context.globalAlpha = alpha;
            context.beginPath();
            context.moveTo(Math.cos(angle) * startRadius, Math.sin(angle) * startRadius);
            context.lineTo(Math.cos(angle) * endRadius, Math.sin(angle) * endRadius);
            context.stroke();
        }
    }
    
    /**
     * ドットローディングをレンダリング
     */
    _renderDots(context, pos, size, phases, options) {
        const dotCount = options.elements;
        const spacing = size * 0.3;
        const startX = pos.x - (dotCount - 1) * spacing / 2;
        
        context.fillStyle = options.color;
        
        for (let i = 0; i < dotCount; i++) {
            const dotX = startX + i * spacing;
            const phase = phases[i] || 0;
            const scale = (Math.sin(phase) + 1) * 0.5 * 0.5 + 0.5;
            const radius = size * 0.1 * scale;
            
            context.globalAlpha = scale;
            context.beginPath();
            context.arc(dotX, pos.y, radius, 0, Math.PI * 2);
            context.fill();
        }
    }
    
    /**
     * パルスローディングをレンダリング
     */
    _renderPulse(context, pos, size, phase, options) {
        const scale = (Math.sin(phase) + 1) * 0.5 * 0.5 + 0.5;
        const radius = size * scale;
        
        context.globalAlpha = 1 - scale;
        context.strokeStyle = options.color;
        context.beginPath();
        context.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        context.stroke();
    }
    
    /**
     * ウェーブローディングをレンダリング
     */
    _renderWave(context, pos, size, waveOffset, options) {
        const waveWidth = size * 2;
        const waveHeight = size * 0.3;
        const segments = 20;
        
        context.strokeStyle = options.color;
        context.beginPath();
        
        for (let i = 0; i <= segments; i++) {
            const x = pos.x - waveWidth / 2 + (i / segments) * waveWidth;
            const y = pos.y + Math.sin((i / segments) * Math.PI * 4 + waveOffset) * waveHeight;
            
            if (i === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
        }
        
        context.stroke();
    }
    
    /**
     * 進行状況付きローディングアニメーション
     */
    createProgressLoadingAnimation(position, size, options = {}) {
        const animation = this.createLoadingAnimation('progress', position, size, {
            ...options,
            progress: 0, // 初期進行状況
            showPercentage: options.showPercentage !== false,
            backgroundColor: options.backgroundColor || '#EEEEEE',
            foregroundColor: options.foregroundColor || '#4A90E2'
        });
        
        return animation;
    }
    
    /**
     * 進行状況を更新
     */
    updateLoadingProgress(animationId, progress) {
        const animation = this.animations.find(anim => anim.id === animationId);
        if (animation && animation.loadingType === 'progress') {
            animation.options.progress = Math.max(0, Math.min(1, progress));
            
            // 100%完了時の特別アニメーション
            if (animation.options.progress >= 1 && !animation.completionTriggered) {
                animation.completionTriggered = true;
                this._triggerCompletionAnimation(animation);
            }
        }
    }
    
    /**
     * 完了アニメーションをトリガー
     */
    _triggerCompletionAnimation(loadingAnimation) {
        // 完了フラッシュエフェクト
        this.animateUIElement(
            { x: loadingAnimation.position.x, y: loadingAnimation.position.y, alpha: 0, scale: 1 },
            'pulse',
            300,
            { intensity: 2.0, color: '#00FF00' }
        );
        
        // 短い遅延後にローディングアニメーションを削除
        setTimeout(() => {
            this.stopAnimation(loadingAnimation.id);
        }, 300);
    }
    
    /**
     * インタラクティブなアニメーション（ホバー効果等）
     */
    addInteractiveAnimation(element, interactionType, options = {}) {
        const baseId = `interactive_${this.animationId++}`;
        
        switch (interactionType) {
            case 'hover':
                return this._addHoverAnimation(element, baseId, options);
            case 'click':
                return this._addClickAnimation(element, baseId, options);
            case 'focus':
                return this._addFocusAnimation(element, baseId, options);
            default:
                return -1;
        }
    }
    
    /**
     * ホバーアニメーション
     */
    _addHoverAnimation(element, baseId, options) {
        const hoverAnimation = {
            id: baseId,
            type: 'interactive',
            interactionType: 'hover',
            target: element,
            isActive: false,
            options: {
                hoverScale: options.hoverScale || 1.1,
                hoverDuration: options.hoverDuration || 200,
                restoreDuration: options.restoreDuration || 150,
                ...options
            }
        };
        
        // 疑似的なホバー状態管理（実際の実装ではイベントリスナーが必要）
        hoverAnimation.startHover = () => {
            if (!hoverAnimation.isActive) {
                hoverAnimation.isActive = true;
                this.animateUIElement(element, 'scale', hoverAnimation.options.hoverDuration, {
                    targetScale: hoverAnimation.options.hoverScale,
                    easing: 'easeOutQuad'
                });
            }
        };
        
        hoverAnimation.endHover = () => {
            if (hoverAnimation.isActive) {
                hoverAnimation.isActive = false;
                this.animateUIElement(element, 'scale', hoverAnimation.options.restoreDuration, {
                    targetScale: 1.0,
                    easing: 'easeInQuad'
                });
            }
        };
        
        this.animations.push(hoverAnimation);
        return baseId;
    }
    
    /**
     * クリックアニメーション
     */
    _addClickAnimation(element, baseId, options) {
        const clickAnimation = {
            id: baseId,
            type: 'interactive',
            interactionType: 'click',
            target: element,
            options: {
                clickScale: options.clickScale || 0.95,
                clickDuration: options.clickDuration || 100,
                restoreDuration: options.restoreDuration || 150,
                rippleEffect: options.rippleEffect !== false,
                ...options
            }
        };
        
        clickAnimation.triggerClick = (clickPosition) => {
            // スケールアニメーション
            this.animateUIElement(element, 'scale', clickAnimation.options.clickDuration, {
                targetScale: clickAnimation.options.clickScale,
                easing: 'easeInQuad',
                onComplete: () => {
                    this.animateUIElement(element, 'scale', clickAnimation.options.restoreDuration, {
                        targetScale: 1.0,
                        easing: 'easeOutQuad'
                    });
                }
            });
            
            // リップル効果
            if (clickAnimation.options.rippleEffect && clickPosition) {
                this._createRippleEffect(clickPosition, options.rippleColor || '#FFFFFF');
            }
        };
        
        this.animations.push(clickAnimation);
        return baseId;
    }
    
    /**
     * フォーカスアニメーション
     */
    _addFocusAnimation(element, baseId, options) {
        const focusAnimation = {
            id: baseId,
            type: 'interactive',
            interactionType: 'focus',
            target: element,
            isActive: false,
            options: {
                focusGlow: options.focusGlow !== false,
                glowColor: options.glowColor || '#4A90E2',
                glowIntensity: options.glowIntensity || 0.3,
                pulseDuration: options.pulseDuration || 1500,
                ...options
            }
        };
        
        focusAnimation.startFocus = () => {
            if (!focusAnimation.isActive) {
                focusAnimation.isActive = true;
                
                if (focusAnimation.options.focusGlow) {
                    // フォーカスグロー効果のアニメーション開始
                    element.focusGlow = {
                        active: true,
                        intensity: focusAnimation.options.glowIntensity,
                        color: focusAnimation.options.glowColor,
                        phase: 0
                    };
                }
            }
        };
        
        focusAnimation.endFocus = () => {
            if (focusAnimation.isActive) {
                focusAnimation.isActive = false;
                
                if (element.focusGlow) {
                    element.focusGlow.active = false;
                }
            }
        };
        
        this.animations.push(focusAnimation);
        return baseId;
    }
    
    /**
     * リップル効果を作成
     */
    _createRippleEffect(position, color = '#FFFFFF') {
        const rippleAnimation = {
            id: this.animationId++,
            type: 'ripple',
            position: { x: position.x, y: position.y },
            duration: 600,
            elapsed: 0,
            easing: 'easeOutQuad',
            startRadius: 0,
            endRadius: 100,
            options: {
                color,
                maxAlpha: 0.3
            }
        };
        
        this.animations.push(rippleAnimation);
        return rippleAnimation.id;
    }
    
    /**
     * 複合アニメーションシーケンス
     */
    createAnimationSequence(sequenceConfig) {
        const sequenceId = `sequence_${this.animationId++}`;
        const { target, sequence, options = {} } = sequenceConfig;
        
        let totalDelay = 0;
        const animationIds = [];
        
        sequence.forEach((step, index) => {
            const animationId = this.animateUIElement(
                target,
                step.type,
                step.duration || 500,
                {
                    ...step.options,
                    delay: totalDelay,
                    sequenceId,
                    sequenceIndex: index
                }
            );
            
            animationIds.push(animationId);
            totalDelay += (step.duration || 500) + (step.gap || 0);
        });
        
        return { sequenceId, animationIds };
    }
    
    /**
     * アニメーションプリセット
     */
    applyAnimationPreset(target, presetName, options = {}) {
        const presets = {
            // 注目を引くアニメーション
            attention: [
                { type: 'pulse', duration: 400, options: { intensity: 1.2 } },
                { type: 'shake', duration: 200, options: { intensity: 0.5 }, gap: 100 }
            ],
            
            // 柔らかい入場
            gentleEnter: [
                { type: 'fadeIn', duration: 300 },
                { type: 'slideIn', duration: 400, options: { direction: 'up', distance: 30 } }
            ],
            
            // 動的な退場
            dynamicExit: [
                { type: 'bounce', duration: 300 },
                { type: 'fadeOut', duration: 200, gap: 100 }
            ],
            
            // エラー表示
            error: [
                { type: 'shake', duration: 300, options: { intensity: 1.0 } },
                { type: 'pulse', duration: 200, options: { color: '#FF0000' }, gap: 50 }
            ],
            
            // 成功表示
            success: [
                { type: 'bounce', duration: 400 },
                { type: 'pulse', duration: 300, options: { color: '#00FF00' }, gap: 100 }
            ]
        };
        
        const preset = presets[presetName];
        if (!preset) {
            console.warn(`[AnimationManager] 未知のプリセット: ${presetName}`);
            return -1;
        }
        
        return this.createAnimationSequence({
            target,
            sequence: preset,
            options
        });
    }
    
    // ========================================
    // 制御とユーティリティ
    // ========================================
    
    /**
     * 特定のアニメーションを停止
     */
    stopAnimation(animationId) {
        const index = this.animations.findIndex(anim => anim.id === animationId);
        if (index !== -1) {
            const animation = this.animations[index];
            this._completeAnimation(animation);
            this.animations.splice(index, 1);
            return true;
        }
        return false;
    }
    
    /**
     * すべてのアニメーションを停止
     */
    stopAllAnimations() {
        this.animations.forEach(animation => {
            this._completeAnimation(animation);
        });
        this.animations = [];
    }
    
    /**
     * 特定のタイプのアニメーションを停止
     */
    stopAnimationsByType(type) {
        const stoppedAnimations = this.animations.filter(anim => anim.type === type);
        stoppedAnimations.forEach(animation => {
            this._completeAnimation(animation);
        });
        this.animations = this.animations.filter(anim => anim.type !== type);
        return stoppedAnimations.length;
    }
    
    /**
     * アニメーション設定を更新
     */
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        console.log('[AnimationManager] 設定を更新しました:', newSettings);
    }
    
    /**
     * タイプ別設定を更新
     */
    updateTypeSettings(type, settings) {
        if (this.typeSettings[type]) {
            Object.assign(this.typeSettings[type], settings);
            console.log(`[AnimationManager] タイプ設定を更新しました (${type}):`, settings);
        }
    }
    
    /**
     * パフォーマンス統計を取得
     */
    getPerformanceMetrics() {
        return { ...this.performanceMetrics };
    }
    
    /**
     * アクティブなアニメーション数を取得
     */
    getActiveAnimationCount() {
        return this.animations.length;
    }
    
    /**
     * 特定のタイプのアニメーション数を取得
     */
    getAnimationCountByType(type) {
        return this.animations.filter(anim => anim.type === type).length;
    }
    
    /**
     * リソースクリーンアップ
     */
    dispose() {
        this.stopAllAnimations();
        this.animationQueue = [];
        console.log('[AnimationManager] リソースをクリーンアップしました');
    }
}