import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getEffectsConfig } from '../config/EffectsConfig.js';

// Animation Manager types
export interface AnimationConfig {
    enabled: boolean;
    globalSpeed: number;
    quality: 'high' | 'medium' | 'low';
}

export interface Position {
    x: number;
    y: number;
}

export interface AnimationTarget {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    alpha?: number;
    scale?: number;
    rotation?: number;
    color?: string;
}

export interface AnimationOptions {
    delay?: number;
    easing?: string;
    intensity?: number;
    direction?: 'left' | 'right' | 'up' | 'down';
    distance?: number;
    color?: string;
    animateScale?: boolean;
    gap?: number;
    duration?: number;
}

export interface Animation {
    id: number;
    type: AnimationType;
    target: AnimationTarget;
    startValues: AnimationTarget;
    endValues: AnimationTarget;
    duration: number;
    elapsed: number;
    easing: string;
    options?: AnimationOptions;
    onComplete?: () => void;
}

export type AnimationType = 
    | 'bubbleSpawn'
    | 'bubbleDestroy'
    | 'bubbleMovement'
    | 'uiElement'
    | 'scoreChange'
    | 'menuExit'
    | 'menuEnter'
    | 'loading';

export interface TypeSettings {
    enabled: boolean;
    speedMultiplier: number;
}

export interface PerformanceMetrics {
    frameTime: number;
    activeAnimations: number;
    totalAnimations: number;
    averageFrameTime: number;
    maxFrameTime: number;
    memoryUsage?: number;
}

export interface AnimationChainConfig {
    type: 'bubble' | 'ui';
    target: AnimationTarget;
    spawnType?: string;
    animationType?: string;
    duration?: number;
    options?: AnimationOptions;
    gap?: number;
}

export interface QualitySettings {
    quality: 'high' | 'medium' | 'low';
    maxAnimations: number;
    frameSkipping: boolean;
    reducedEffects: boolean;
}

/**
 * アニメーション管理クラス (Refactored)
 * アニメーション統合管理システム - サブコンポーネント化により責任を分離し、保守性を向上
 * 
 * サブコンポーネント化により責任を分離：
 * - AnimationEngineCore: イージング、更新ループ、品質制御
 * - AnimationTypeHandlers: バブル、UI、メニュー、ローディングアニメーション処理
 * - AnimationRenderers: レンダリング処理（ローディング、エフェクト等）
 */
export class AnimationManager {
    private canvas: HTMLCanvasElement;
    private animations: Animation[];
    private animationId: number;
    private effectsConfig: any;
    private easingFunctions: { [key: string]: (t: number) => number };
    private subtleAnimations: any;
    
    // サブコンポーネント（Stub実装）
    private engineCore: any;
    private qualityController: any;
    private bubbleHandler: any;
    private uiHandler: any;
    private menuHandler: any;
    private loadingHandler: any;
    
    // アニメーションタイプ別設定
    private typeSettings: { [key: string]: TypeSettings };
    
    // キューイングシステム
    private animationQueue: Animation[];
    private maxConcurrentAnimations: number;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.animations = [];
        this.animationId = 0;
        
        // 設定システムとの連携
        this.effectsConfig = getEffectsConfig();
        
        // イージング関数の設定
        this.easingFunctions = {};
        
        // アニメーションタイプ別設定の初期化
        this.typeSettings = {
            bubble: { enabled: true, speedMultiplier: 1.0 },
            ui: { enabled: true, speedMultiplier: 1.0 },
            menu: { enabled: true, speedMultiplier: 1.0 },
            loading: { enabled: true, speedMultiplier: 1.0 },
            score: { enabled: true, speedMultiplier: 1.0 }
        };
        
        // キューイングシステムの初期化
        this.animationQueue = [];
        this.maxConcurrentAnimations = 10;
        
        // 繊細なアニメーション設定の初期化
        this.subtleAnimations = {
            types: ['fade', 'scale', 'slide']
        };
        
        // サブコンポーネントの初期化
        this._initializeSubComponents();

        console.log('Animation configuration:', {
            queueSize: this.animationQueue.length,
            maxConcurrent: this.maxConcurrentAnimations,
            subtleConfig: this.subtleAnimations
        });

        console.log('[AnimationManager] アニメーション管理システムを初期化しました');
        this._initializeFromConfig();
    }

    /**
     * サブコンポーネント初期化（Stub実装）
     */
    private _initializeSubComponents(): void {
        try {
            this.engineCore = {
                settings: { enabled: true, globalSpeed: 1.0, quality: 'high' },
                updateSettings: (settings: any) => { Object.assign(this.engineCore.settings, settings); },
                updateAnimations: (animations: Animation[], deltaTime: number) => {
                    return animations.filter(animation => {
                        animation.elapsed += deltaTime;
                        return animation.elapsed < animation.duration;
                    });
                },
                calculateAnimationProgress: (animation: Animation) => {
                    const progress = Math.min(animation.elapsed / animation.duration, 1);
                    const easedProgress = this.ease(progress, animation.easing);
                    return { progress, easedProgress };
                },
                ease: (t: number, type: string) => this.ease(t, type),
                completeAnimation: (animation: Animation) => {
                    if (animation.onComplete) {
                        animation.onComplete();
                    }
                },
                getPerformanceMetrics: (): PerformanceMetrics => ({
                    frameTime: 16.67, // 60fps target
                    activeAnimations: this.animations.length,
                    totalAnimations: this.animationId,
                    averageFrameTime: 16.67,
                    maxFrameTime: 33.33
                }),
                setEasingFunctions: (_functions: any) => {},
                dispose: () => {}
            };
            
            this.qualityController = {
                recordFrameTime: (_frameTime: number) => {},
                getCurrentQualitySettings: (): QualitySettings => ({
                    quality: 'high',
                    maxAnimations: 50,
                    frameSkipping: false,
                    reducedEffects: false
                })
            };

            this.bubbleHandler = {
                createBubbleSpawnAnimation: (bubble: any, spawnType: string, options: AnimationOptions): Animation => {
                    return this._createBasicAnimation('bubbleSpawn', bubble, spawnType, options);
                },
                createBubbleDestroyAnimation: (bubble: any, destroyType: string, options: AnimationOptions): Animation => {
                    return this._createBasicAnimation('bubbleDestroy', bubble, destroyType, options);
                },
                createBubbleMovementAnimation: (bubble: any, _targetPosition: Position, duration: number, options: AnimationOptions): Animation => {
                    return this._createBasicAnimation('bubbleMovement', bubble, 'move', { ...options, duration });
                },
                updateBubbleAnimation: (animation: Animation, progress: number) => {
                    this._updateBasicAnimation(animation, progress);
                }
            };

            this.uiHandler = {
                createUIElementAnimation: (element: any, animationType: string, duration: number, options: AnimationOptions): Animation => {
                    return this._createBasicAnimation('uiElement', element, animationType, { ...options, duration });
                },
                createScoreChangeAnimation: (_oldScore: number, _newScore: number, element: any, duration: number, options: AnimationOptions): Animation => {
                    return this._createBasicAnimation('scoreChange', element, 'scoreChange', { ...options, duration });
                },
                updateUIAnimation: (animation: Animation, progress: number) => {
                    this._updateBasicAnimation(animation, progress);
                }
            };

            this.menuHandler = {
                createMenuTransitionAnimations: (fromMenu: any, toMenu: any, transitionType: string, options: AnimationOptions): Animation[] => {
                    return [
                        this._createBasicAnimation('menuExit', fromMenu, transitionType, options),
                        this._createBasicAnimation('menuEnter', toMenu, transitionType, options)
                    ];
                },
                updateMenuAnimation: (animation: Animation, progress: number) => {
                    this._updateBasicAnimation(animation, progress);
                }
            };

            this.loadingHandler = {
                createLoadingAnimation: (type: string, position: Position | null, size: number, options: AnimationOptions): Animation => {
                    const target = {
                        x: position?.x || this.canvas.width / 2,
                        y: position?.y || this.canvas.height / 2,
                        width: size,
                        height: size,
                        scale: 1,
                        alpha: 1
                    };
                    return this._createBasicAnimation('loading', target, type, options);
                },
                createProgressLoadingAnimation: (position: Position, size: number, options: AnimationOptions): Animation => {
                    return this.loadingHandler.createLoadingAnimation('progress', position, size, options);
                },
                updateLoadingAnimation: (animation: Animation, progress: number) => {
                    this._updateBasicAnimation(animation, progress);
                },
                updateLoadingProgress: (animation: Animation, progress: number): boolean => {
                    animation.target.alpha = progress;
                    return progress >= 1.0;
                }
            };

            console.log('[AnimationManager] サブコンポーネントを初期化しました（Stub実装）');

        } catch (error) {
            console.error('AnimationManager サブコンポーネント初期化に失敗:', error);
            getErrorHandler().handleError(error, 'ANIMATION_INIT_ERROR', {
                context: 'AnimationManager._initializeSubComponents'
            });
        }
    }

    /**
     * 基本アニメーション作成（Stub実装）
     */
    private _createBasicAnimation(type: AnimationType, target: any, animationType: string, options: AnimationOptions = {}): Animation {
        const duration = options.duration || 500;
        const easing = options.easing || 'easeOut';
        
        const startValues = this._getStartValues(target, animationType, options);
        const endValues = this._getEndValues(target, animationType, options);
        
        return {
            id: 0, // Will be set by caller
            type: type,
            target: target,
            startValues: startValues,
            endValues: endValues,
            duration: duration,
            elapsed: 0,
            easing: easing,
            options: options
        };
    }
    
    /**
     * 基本アニメーション更新（Stub実装）
     */
    private _updateBasicAnimation(animation: Animation, progress: number): void {
        if (!animation.target) return;
        
        // Linear interpolation between start and end values
        Object.keys(animation.endValues).forEach(key => {
            const startValue = (animation.startValues as any)[key] || 0;
            const endValue = (animation.endValues as any)[key] || 0;
            (animation.target as any)[key] = startValue + (endValue - startValue) * progress;
        });
    }

    /**
     * 開始値を取得
     */
    private _getStartValues(target: any, animationType: string, options: AnimationOptions): AnimationTarget {
        const baseValues = {
            x: target.x || 0,
            y: target.y || 0,
            width: target.width || 100,
            height: target.height || 50,
            alpha: target.alpha || 1,
            scale: target.scale || 1,
            rotation: target.rotation || 0
        };
        
        switch(animationType) {
            case 'fadeIn':
                return { ...baseValues, alpha: 0 };
            case 'scale':
                return { ...baseValues, scale: 0 };
            case 'slideIn':
                const slideDistance = options.distance || 50;
                switch(options.direction) {
                    case 'left': return { ...baseValues, x: baseValues.x - slideDistance };
                    case 'right': return { ...baseValues, x: baseValues.x + slideDistance };
                    case 'up': return { ...baseValues, y: baseValues.y - slideDistance };
                    case 'down': return { ...baseValues, y: baseValues.y + slideDistance };
                    default: return { ...baseValues, y: baseValues.y - slideDistance };
                }
            default:
                return baseValues;
        }
    }

    /**
     * 終了値を取得
     */
    private _getEndValues(target: any, animationType: string, options: AnimationOptions): AnimationTarget {
        const baseValues = {
            x: target.x || 0,
            y: target.y || 0,
            width: target.width || 100,
            height: target.height || 50,
            alpha: target.alpha || 1,
            scale: target.scale || 1,
            rotation: target.rotation || 0
        };
        
        switch(animationType) {
            case 'fadeOut':
                return { ...baseValues, alpha: 0 };
            case 'scale':
                return baseValues;
            case 'slideIn':
                return baseValues;
            case 'pulse':
                return { ...baseValues, scale: (options.intensity || 1.1) * baseValues.scale };
            default:
                return baseValues;
        }
    }

    /**
     * 設定から初期化
     */
    private _initializeFromConfig(): void {
        try {
            const animationConfig = this.effectsConfig.getAnimationConfig?.();
            if (animationConfig) {
                const settings: AnimationConfig = {
                    enabled: animationConfig.enabled || true,
                    globalSpeed: animationConfig.globalSpeed || 1.0,
                    quality: animationConfig.quality || 'high'
                };
                this.engineCore.updateSettings(settings);
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'ANIMATION_CONFIG_ERROR', {
                context: 'AnimationManager._initializeFromConfig'
            });
        }
    }

    /**
     * Set easing functions for animations
     */
    public setEasingFunctions(easingFunctions: { [key: string]: (t: number) => number }): void {
        this.easingFunctions = { ...this.easingFunctions, ...easingFunctions };
        
        // エンジンコアにも反映
        if (this.engineCore && this.engineCore.setEasingFunctions) {
            this.engineCore.setEasingFunctions(easingFunctions);
        }

        console.log('[AnimationManager] イージング関数を設定しました:', Object.keys(easingFunctions));
    }
    
    /**
     * Set subtle animations for enhanced visual polish
     */
    public setSubtleAnimations(subtleAnimations: any): void {
        this.subtleAnimations = subtleAnimations;
        console.log('[AnimationManager] 繊細なアニメーション設定を適用しました:', Object.keys(subtleAnimations));
    }

    // ========================================
    // バブルアニメーション（サブコンポーネント呼び出し）
    // ========================================
    
    /**
     * バブルスポーンアニメーション
     */
    public animateBubbleSpawn(bubble: any, spawnType: string = 'scale', options: AnimationOptions = {}): number {
        if (!this.engineCore.settings.enabled || !this.typeSettings.bubble.enabled) {
            return -1;
        }

        const animation = this.bubbleHandler.createBubbleSpawnAnimation(bubble, spawnType, options);
        if (animation) {
            animation.id = this.animationId++;
            
            // 遅延がある場合は遅延付きで開始
            if (options.delay && options.delay > 0) {
                setTimeout(() => {
                    this.animations.push(animation);
                }, options.delay);
            } else {
                this.animations.push(animation);
            }
            return animation.id;
        }
        return -1;
    }
    
    /**
     * バブル破壊アニメーション
     */
    public animateBubbleDestroy(bubble: any, destroyType: string = 'shrink', options: AnimationOptions = {}): number {
        if (!this.engineCore.settings.enabled || !this.typeSettings.bubble.enabled) {
            return -1;
        }

        const animation = this.bubbleHandler.createBubbleDestroyAnimation(bubble, destroyType, options);
        if (animation) {
            animation.id = this.animationId++;
            this.animations.push(animation);
            return animation.id;
        }
        return -1;
    }
    
    /**
     * バブル移動アニメーション
     */
    public animateBubbleMovement(bubble: any, _targetPosition: Position, duration: number = 1000, options: AnimationOptions = {}): number {
        if (!this.engineCore.settings.enabled || !this.typeSettings.bubble.enabled) {
            return -1;
        }

        const animation = this.bubbleHandler.createBubbleMovementAnimation(bubble, _targetPosition, duration, options);
        if (animation) {
            animation.id = this.animationId++;
            this.animations.push(animation);
            return animation.id;
        }
        return -1;
    }
    
    // ========================================
    // UIアニメーション（サブコンポーネント呼び出し）
    // ========================================
    
    /**
     * UIエレメントアニメーション
     */
    public animateUIElement(element: AnimationTarget, animationType: string, duration: number = 500, options: AnimationOptions = {}): number {
        if (!this.engineCore.settings.enabled || !this.typeSettings.ui.enabled) {
            return -1;
        }

        const animation = this.uiHandler.createUIElementAnimation(element, animationType, duration, options);
        if (animation) {
            animation.id = this.animationId++;
            this.animations.push(animation);
            return animation.id;
        }
        return -1;
    }
    
    /**
     * スコア変更アニメーション
     */
    public animateScoreChange(oldScore: number, newScore: number, element: AnimationTarget, duration: number = 1000, options: AnimationOptions = {}): number {
        if (!this.engineCore.settings.enabled || !this.typeSettings.score.enabled) {
            return -1;
        }

        const animation = this.uiHandler.createScoreChangeAnimation(oldScore, newScore, element, duration, options);
        if (animation) {
            animation.id = this.animationId++;
            
            // スコア増加時のスケールアニメーション
            const scoreDiff = newScore - oldScore;
            if (options.animateScale && scoreDiff > 0) {
                animation.endValues.scale = 1.2;
                setTimeout(() => {
                    if (animation.endValues) {
                        animation.endValues.scale = 1;
                    }
                }, duration * 0.3);
            }

            this.animations.push(animation);
            return animation.id;
        }
        return -1;
    }
    
    // ========================================
    // メニューアニメーション
    // ========================================
    
    /**
     * メニュー遷移アニメーション
     */
    public animateMenuTransition(fromMenu: any, toMenu: any, transitionType: string = 'slide', options: AnimationOptions = {}): number[] {
        if (!this.engineCore.settings.enabled || !this.typeSettings.menu.enabled) {
            return [];
        }

        const animations = this.menuHandler.createMenuTransitionAnimations(fromMenu, toMenu, transitionType, options);
        const animationIds: number[] = [];
        
        animations.forEach((animation: any) => {
            animation.id = this.animationId++;
            animationIds.push(animation.id);
            if (animation.options && animation.options.delay && animation.options.delay > 0) {
                setTimeout(() => {
                    this.animations.push(animation);
                }, animation.options.delay);
            } else {
                this.animations.push(animation);
            }
        });
        
        return animationIds;
    }
    
    // ========================================
    // ローディングアニメーション
    // ========================================
    
    /**
     * ローディングアニメーション作成
     */
    public createLoadingAnimation(type: string = 'spinner', position: Position | null = null, size: number = 50, options: AnimationOptions = {}): number {
        if (!this.engineCore.settings.enabled || !this.typeSettings.loading.enabled) {
            return -1;
        }

        const animation = this.loadingHandler.createLoadingAnimation(type, position, size, options);
        if (animation) {
            animation.id = this.animationId++;
            this.animations.push(animation);
            return animation.id;
        }
        return -1;
    }
    
    /**
     * 進行状況付きローディングアニメーション
     */
    public createProgressLoadingAnimation(position: Position, size: number, options: AnimationOptions = {}): number {
        const animation = this.loadingHandler.createProgressLoadingAnimation(position, size, options);
        if (animation) {
            animation.id = this.animationId++;
            this.animations.push(animation);
            return animation.id;
        }
        return -1;
    }
    
    /**
     * 進行状況を更新
     */
    public updateLoadingProgress(animationId: number, progress: number): void {
        const animation = this.animations.find(anim => anim.id === animationId);
        if (animation) {
            const isCompleted = this.loadingHandler.updateLoadingProgress(animation, progress);
            // 100%完了時の特別アニメーション
            if (isCompleted) {
                this._triggerCompletionAnimation(animation);
            }
        }
    }

    /**
     * 完了アニメーションをトリガー
     */
    private _triggerCompletionAnimation(loadingAnimation: Animation): void {
        // 完了フラッシュエフェクト
        this.animateUIElement(
            {
                x: loadingAnimation.target.x || 0,
                y: loadingAnimation.target.y || 0,
                alpha: 0,
                scale: 1
            },
            'pulse',
            300,
            { intensity: 2.0, color: '#00FF00' }
        );
        
        // 短い遅延後にローディングアニメーションを削除
        setTimeout(() => {
            this.stopAnimation(loadingAnimation.id);
        }, 300);
    }
    
    // ========================================
    // 高度なアニメーション機能（簡略化版）
    // ========================================
    
    /**
     * チェーンアニメーション
     */
    public chainAnimations(animationChain: AnimationChainConfig[]): string {
        const chainId = `chain_${this.animationId++}`;
        let totalDelay = 0;

        animationChain.forEach((animConfig) => {
            // 個別アニメーション作成（タイプに応じて適切なハンドラーを使用）
            setTimeout(() => {
                if (animConfig.type === 'bubble') {
                    this.animateBubbleSpawn(animConfig.target, animConfig.spawnType, animConfig.options);
                } else if (animConfig.type === 'ui') {
                    this.animateUIElement(animConfig.target, animConfig.animationType || 'fadeIn', animConfig.duration, animConfig.options);
                }
            }, totalDelay);
            
            totalDelay += (animConfig.duration || 500) + (animConfig.gap || 0);
        });
        
        return chainId;
    }
    
    /**
     * パラレルアニメーション
     */
    public runParallelAnimations(animationList: AnimationChainConfig[]): string {
        const parallelId = `parallel_${this.animationId++}`;

        animationList.forEach((animConfig) => {
            // 並列でアニメーション実行
            if (animConfig.type === 'bubble') {
                this.animateBubbleSpawn(animConfig.target, animConfig.spawnType, animConfig.options);
            } else if (animConfig.type === 'ui') {
                this.animateUIElement(animConfig.target, animConfig.animationType || 'fadeIn', animConfig.duration, animConfig.options);
            }
        });
        
        return parallelId;
    }
    
    /**
     * イージング関数（エンジンコアに委譲）
     */
    public ease(t: number, type: string): number {
        // Custom easing functions
        if (this.easingFunctions[type]) {
            return this.easingFunctions[type](t);
        }
        
        // Built-in easing functions
        switch(type) {
            case 'linear':
                return t;
            case 'easeIn':
                return t * t;
            case 'easeOut':
                return 1 - (1 - t) * (1 - t);
            case 'easeInOut':
                return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            case 'easeInQuad':
                return t * t;
            case 'easeOutQuad':
                return 1 - (1 - t) * (1 - t);
            case 'easeInOutQuad':
                return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            case 'easeOutBounce':
                if (t < 1 / 2.75) {
                    return 7.5625 * t * t;
                } else if (t < 2 / 2.75) {
                    return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
                } else if (t < 2.5 / 2.75) {
                    return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
                } else {
                    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
                }
            default:
                return t;
        }
    }
    
    // ========================================
    // 更新とレンダリング
    // ========================================
    
    /**
     * アニメーション更新（エンジンコア使用）
     */
    public update(deltaTime: number): void {
        if (!this.engineCore.settings.enabled) {
            return;
        }

        // エンジンコアでアニメーション更新
        this.animations = this.engineCore.updateAnimations(this.animations, deltaTime);
        
        // 個別アニメーション更新
        this.animations.forEach(animation => {
            const { progress: _progress, easedProgress } = this.engineCore.calculateAnimationProgress(animation);
            this._updateAnimation(animation, easedProgress);
        });
        
        // 品質コントローラーでフレーム時間記録
        const metrics = this.engineCore.getPerformanceMetrics();
        this.qualityController.recordFrameTime(metrics.frameTime);
    }
    
    /**
     * 個別アニメーション更新（サブコンポーネント使用）
     */
    private _updateAnimation(animation: Animation, easedProgress: number): void {
        // アニメーションタイプ別更新をハンドラーに委譲
        switch(animation.type) {
            case 'bubbleSpawn':
            case 'bubbleDestroy':
            case 'bubbleMovement':
                this.bubbleHandler.updateBubbleAnimation(animation, easedProgress);
                break;
            case 'uiElement':
            case 'scoreChange':
                this.uiHandler.updateUIAnimation(animation, easedProgress);
                break;
            case 'menuExit':
            case 'menuEnter':
                this.menuHandler.updateMenuAnimation(animation, easedProgress);
                break;
            case 'loading':
                this.loadingHandler.updateLoadingAnimation(animation, easedProgress);
                break;
        }
    }
    
    /**
     * インタラクティブなアニメーション（簡略化版）
     */
    public addInteractiveAnimation(element: AnimationTarget, interactionType: string, options: AnimationOptions = {}): number {
        // 基本的なインタラクティブアニメーション
        switch(interactionType) {
            case 'hover':
                return this.animateUIElement(element, 'pulse', 200, { intensity: 1.1, ...options });
            case 'click':
                return this.animateUIElement(element, 'bounce', 150, { intensity: 0.95, ...options });
            case 'focus':
                return this.animateUIElement(element, 'pulse', 300, { intensity: 1.05, ...options });
            default:
                return -1;
        }
    }
    
    /**
     * アニメーションプリセット（簡略化版）
     */
    public applyAnimationPreset(target: AnimationTarget, presetName: string, options: AnimationOptions = {}): number {
        const presets: { [key: string]: () => number } = {
            attention: () => this.animateUIElement(target, 'pulse', 400, { intensity: 1.2, ...options }),
            gentleEnter: () => this.animateUIElement(target, 'fadeIn', 300, options),
            dynamicExit: () => this.animateUIElement(target, 'fadeOut', 200, options),
            error: () => this.animateUIElement(target, 'shake', 300, { intensity: 1.0, ...options }),
            success: () => this.animateUIElement(target, 'bounce', 400, options)
        };
        
        const preset = presets[presetName];
        if (!preset) {
            console.warn(`[AnimationManager] 未知のプリセット: ${presetName}`);
            return -1;
        }
        
        return preset();
    }
    
    // ========================================
    // 制御とユーティリティ（エンジンコア使用）
    // ========================================
    
    /**
     * 特定のアニメーションを停止
     */
    public stopAnimation(animationId: number): boolean {
        const index = this.animations.findIndex(anim => anim.id === animationId);
        if (index !== -1) {
            const animation = this.animations[index];
            this.engineCore.completeAnimation(animation);
            this.animations.splice(index, 1);
            return true;
        }
        return false;
    }
    
    /**
     * すべてのアニメーションを停止
     */
    public stopAllAnimations(): void {
        this.animations.forEach(animation => {
            this.engineCore.completeAnimation(animation);
        });
        this.animations = [];
    }
    
    /**
     * 特定のタイプのアニメーションを停止
     */
    public stopAnimationsByType(type: AnimationType): number {
        const stoppedAnimations = this.animations.filter(anim => anim.type === type);
        stoppedAnimations.forEach(animation => {
            this.engineCore.completeAnimation(animation);
        });
        this.animations = this.animations.filter(anim => anim.type !== type);
        return stoppedAnimations.length;
    }
    
    /**
     * アニメーション設定を更新
     */
    public updateSettings(newSettings: Partial<AnimationConfig>): void {
        this.engineCore.updateSettings(newSettings);
        console.log('[AnimationManager] 設定を更新しました:', newSettings);
    }

    /**
     * タイプ別設定を更新
     */
    public updateTypeSettings(type: string, settings: Partial<TypeSettings>): void {
        if (this.typeSettings[type]) {
            Object.assign(this.typeSettings[type], settings);
            console.log(`[AnimationManager] タイプ設定を更新しました (${type}:`, settings);
        }
    }

    /**
     * パフォーマンス統計を取得
     */
    public getPerformanceMetrics(): PerformanceMetrics {
        return this.engineCore.getPerformanceMetrics();
    }

    /**
     * アクティブなアニメーション数を取得
     */
    public getActiveAnimationCount(): number {
        return this.animations.length;
    }

    /**
     * 特定のタイプのアニメーション数を取得
     */
    public getAnimationCountByType(type: AnimationType): number {
        return this.animations.filter(anim => anim.type === type).length;
    }

    /**
     * 品質設定を取得
     */
    public getCurrentQualitySettings(): QualitySettings {
        return this.qualityController.getCurrentQualitySettings();
    }

    /**
     * リソースクリーンアップ
     */
    public dispose(): void {
        this.stopAllAnimations();
        this.animationQueue = [];
        
        // サブコンポーネントのクリーンアップ
        if (this.engineCore) {
            this.engineCore.dispose();
        }

        console.log('[AnimationManager] リソースをクリーンアップしました');
    }
}