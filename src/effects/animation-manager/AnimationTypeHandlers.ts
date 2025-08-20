import { getErrorHandler } from '../../utils/ErrorHandler.js';
import { EasingType } from './AnimationEngineCore.js';

/**
 * Animation Type Handlers
 * アニメーションタイプ別処理 - バブル、UI、メニュー、ローディングアニメーション
 */

/**
 * Position interface
 */
export interface Position {
    x: number;
    y: number;
}

/**
 * Bubble spawn types
 */
export type BubbleSpawnType = 'scale' | 'fade' | 'bounce' | 'spiral' | 'pop';

/**
 * Bubble destroy types
 */
export type BubbleDestroyType = 'shrink' | 'explode' | 'dissolve' | 'shatter' | 'vaporize';

/**
 * Movement path types
 */
export type MovementPathType = 'linear' | 'arc' | 'bezier' | 'wave';

/**
 * UI animation types
 */
export type UIAnimationType = 'fadeIn' | 'fadeOut' | 'slideIn' | 'slideOut' | 'bounce' | 'pulse' | 'shake';

/**
 * Menu transition types
 */
export type MenuTransitionType = 'slide' | 'fade' | 'scale' | 'zoom';

/**
 * Loading animation types
 */
export type LoadingAnimationType = 'spinner' | 'dots' | 'pulse' | 'wave' | 'progress';

/**
 * Slide directions
 */
export type SlideDirection = 'left' | 'right' | 'up' | 'down';

/**
 * Menu slide directions
 */
export type MenuSlideDirection = 'left' | 'right' | 'up' | 'down';

/**
 * Bubble interface
 */
export interface Bubble {
    x: number;
    y: number;
    size: number;
    alpha?: number;
    rotation?: number;
    scale?: number;
    [key: string]: any;
}

/**
 * Type settings interface
 */
export interface TypeSettings {
    enabled: boolean;
    speedMultiplier: number;
}

/**
 * Base animation options interface
 */
export interface BaseAnimationOptions {
    duration?: number;
    delay?: number;
    easing?: EasingType;
    intensity?: number;
    onComplete?: (animation as any) => void;
    [key: string]: any;
}

/**
 * Bubble spawn animation options interface
 */
export interface BubbleSpawnOptions extends BaseAnimationOptions {
    direction?: number;
}

/**
 * Bubble destroy animation options interface
 */
export interface BubbleDestroyOptions extends BaseAnimationOptions {
    fragments?: number;
}

/**
 * Bubble movement animation options interface
 */
export interface BubbleMovementOptions extends BaseAnimationOptions {
    path?: MovementPathType;
    controlPoints?: Position[];
    rotation?: boolean;
}

/**
 * Animation values interface
 */
export interface AnimationValues {
    x?: number;
    y?: number;
    size?: number;
    alpha?: number;
    rotation?: number;
    scale?: number;
    [key: string]: any;
}

/**
 * Bubble spawn animation interface
 */
export interface BubbleSpawnAnimation {
    type: 'bubbleSpawn';
    target: Bubble;
    spawnType: BubbleSpawnType;
    duration: number;
    elapsed: number;
    easing: EasingType;
    startValues: AnimationValues;
    endValues: AnimationValues;
    options: BubbleSpawnOptions;
}

/**
 * Bubble destroy animation interface
 */
export interface BubbleDestroyAnimation {
    type: 'bubbleDestroy';
    target: Bubble;
    destroyType: BubbleDestroyType;
    duration: number;
    elapsed: number;
    easing: EasingType;
    startValues: AnimationValues;
    endValues: AnimationValues;
    options: BubbleDestroyOptions;
}

/**
 * Bubble movement animation interface
 */
export interface BubbleMovementAnimation {
    type: 'bubbleMovement';
    target: Bubble;
    duration: number;
    elapsed: number;
    easing: EasingType;
    startValues: Position;
    endValues: Position;
    options: BubbleMovementOptions;
}

/**
 * UI element interface
 */
export interface UIElement {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    alpha?: number;
    scale?: number;
    rotation?: number;
    textContent?: string;
    score?: number;
    scoreDiff?: number;
    diffAlpha?: number;
    [key: string]: any;
}

/**
 * UI animation options interface
 */
export interface UIAnimationOptions extends BaseAnimationOptions {
    direction?: SlideDirection;
    distance?: number;
}

/**
 * Score change animation options interface
 */
export interface ScoreChangeOptions extends BaseAnimationOptions {
    showDifference?: boolean;
    animateScale?: boolean;
    color?: string;
}

/**
 * UI element animation interface
 */
export interface UIElementAnimation {
    type: 'uiElement';
    target: UIElement;
    animationType: UIAnimationType;
    duration: number;
    elapsed: number;
    easing: EasingType;
    startValues: AnimationValues;
    endValues: AnimationValues;
    options: UIAnimationOptions;
}

/**
 * Score change animation interface
 */
export interface ScoreChangeAnimation {
    type: 'scoreChange';
    target: UIElement;
    duration: number;
    elapsed: number;
    easing: EasingType;
    startValues: AnimationValues & { score: number };
    endValues: AnimationValues & { score: number };
    scoreDiff: number;
    options: ScoreChangeOptions;
}

/**
 * Menu element interface
 */
export interface MenuElement {
    x?: number;
    y?: number;
    alpha?: number;
    scale?: number;
    [key: string]: any;
}

/**
 * Menu transition options interface
 */
export interface MenuTransitionOptions extends BaseAnimationOptions {
    direction?: MenuSlideDirection;
    overlap?: boolean;
    exitEasing?: EasingType;
    enterEasing?: EasingType;
}

/**
 * Menu exit animation interface
 */
export interface MenuExitAnimation {
    type: 'menuExit';
    target: MenuElement;
    transitionType: MenuTransitionType;
    duration: number;
    elapsed: number;
    easing: EasingType;
    startValues: AnimationValues;
    endValues: AnimationValues;
    options: MenuTransitionOptions;
}

/**
 * Menu enter animation interface
 */
export interface MenuEnterAnimation {
    type: 'menuEnter';
    target: MenuElement;
    transitionType: MenuTransitionType;
    duration: number;
    elapsed: number;
    easing: EasingType;
    startValues: AnimationValues;
    endValues: AnimationValues;
    options: MenuTransitionOptions & { delay: number };
}

/**
 * Loading animation options interface
 */
export interface LoadingAnimationOptions extends BaseAnimationOptions {
    color?: string;
    speed?: number;
    elements?: number;
    thickness?: number;
    progress?: number;
    showPercentage?: boolean;
    backgroundColor?: string;
    foregroundColor?: string;
}

/**
 * Loading animation interface
 */
export interface LoadingAnimation {
    type: 'loading';
    loadingType: LoadingAnimationType;
    position: Position;
    size: number;
    duration: number;
    elapsed: number;
    easing: string;
    rotation?: number;
    phase?: number;
    dotPhases?: number[];
    waveOffset?: number;
    completionTriggered?: boolean;
    options: LoadingAnimationOptions;
}

/**
 * Canvas interface
 */
export interface Canvas {
    width: number;
    height: number;
}

/**
 * Bubble Animation Handler
 * バブルアニメーション処理
 */
export class BubbleAnimationHandler {
    private typeSettings: TypeSettings;
    
    constructor() {
        this.typeSettings = {
            enabled: true,
            speedMultiplier: 1.0
        };
    }
    
    /**
     * バブルスポーンアニメーション作成
     */
    createBubbleSpawnAnimation(bubble: Bubble, spawnType: BubbleSpawnType = 'scale', options: BubbleSpawnOptions = {}): BubbleSpawnAnimation | null {
        try {
            return {
                type: 'bubbleSpawn',
                target: bubble,
                spawnType,
                duration: options.duration || 800,
                elapsed: 0,
                easing: options.easing || 'easeOutBounce',
                startValues: this.getBubbleStartValues(bubble, spawnType),
                endValues: this.getBubbleEndValues(bubble, spawnType),
                options: {
                    delay: options.delay || 0,
                    intensity: options.intensity || 1.0,
                    direction: options.direction || 0,
                    ...options
                }
            };
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'BubbleAnimationHandler.createBubbleSpawnAnimation'
            });
            return null;
        }
    }
    
    /**
     * バブル破壊アニメーション作成
     */
    createBubbleDestroyAnimation(bubble: Bubble, destroyType: BubbleDestroyType = 'shrink', options: BubbleDestroyOptions = {}): BubbleDestroyAnimation | null {
        try {
            return {
                type: 'bubbleDestroy',
                target: bubble,
                destroyType,
                duration: options.duration || 600,
                elapsed: 0,
                easing: options.easing || 'easeInQuad',
                startValues: this.getBubbleStartValues(bubble, destroyType),
                endValues: this.getBubbleDestroyEndValues(bubble, destroyType),
                options: {
                    intensity: options.intensity || 1.0,
                    fragments: options.fragments || 8,
                    ...options
                }
            };
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'BubbleAnimationHandler.createBubbleDestroyAnimation'
            });
            return null;
        }
    }
    
    /**
     * バブル移動アニメーション作成
     */
    createBubbleMovementAnimation(bubble: Bubble, targetPosition: Position, duration: number = 1000, options: BubbleMovementOptions = {}): BubbleMovementAnimation | null {
        try {
            return {
                type: 'bubbleMovement',
                target: bubble,
                duration,
                elapsed: 0,
                easing: options.easing || 'easeInOutQuad',
                startValues: { x: bubble.x, y: bubble.y },
                endValues: { x: targetPosition.x, y: targetPosition.y },
                options: {
                    path: options.path || 'linear',
                    controlPoints: options.controlPoints || [],
                    rotation: options.rotation || false,
                    ...options
                }
            };
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'BubbleAnimationHandler.createBubbleMovementAnimation'
            });
            return null;
        }
    }
    
    /**
     * バブルアニメーション更新
     */
    updateBubbleAnimation(animation: BubbleSpawnAnimation | BubbleDestroyAnimation | BubbleMovementAnimation, easedProgress: number): void {
        switch (animation.type) {
            case 'bubbleSpawn':
                this.updateBubbleSpawnAnimation(animation, easedProgress);
                break;
            case 'bubbleDestroy':
                this.updateBubbleDestroyAnimation(animation, easedProgress);
                break;
            case 'bubbleMovement':
                this.updateBubbleMovementAnimation(animation, easedProgress);
                break;
        }
    }
    
    /**
     * バブルスポーンアニメーション更新
     */
    private updateBubbleSpawnAnimation(animation: BubbleSpawnAnimation, progress: number): void {
        const start = animation.startValues;
        const end = animation.endValues;
        const target = animation.target;
        
        // 基本的な補間
        if (start.scale !== undefined && end.scale !== undefined) {
            target.scale = start.scale + (end.scale - start.scale) * progress;
        }
        if (start.alpha !== undefined && end.alpha !== undefined) {
            target.alpha = start.alpha + (end.alpha - start.alpha) * progress;
        }
        if (start.rotation !== undefined && end.rotation !== undefined) {
            target.rotation = start.rotation + (end.rotation - start.rotation) * progress;
        }
        
        // スポーンタイプ別の特殊処理
        switch (animation.spawnType) {
            case 'bounce':
                if (start.y !== undefined && end.y !== undefined) {
                    target.y = start.y + (end.y - start.y) * progress;
                }
                break;
            case 'spiral':
                if (end.x !== undefined && end.y !== undefined) {
                    const spiralProgress = progress * Math.PI * 2;
                    target.x = end.x + Math.cos(spiralProgress) * (1 - progress) * 30;
                    target.y = end.y + Math.sin(spiralProgress) * (1 - progress) * 30;
                }
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
    private updateBubbleDestroyAnimation(animation: BubbleDestroyAnimation, progress: number): void {
        const start = animation.startValues;
        const end = animation.endValues;
        const target = animation.target;
        
        if (start.scale !== undefined && end.scale !== undefined) {
            target.scale = start.scale + (end.scale - start.scale) * progress;
        }
        if (start.alpha !== undefined && end.alpha !== undefined) {
            target.alpha = start.alpha + (end.alpha - start.alpha) * progress;
        }
        if (start.rotation !== undefined && end.rotation !== undefined) {
            target.rotation = start.rotation + (end.rotation - start.rotation) * progress;
        }
        
        // 破壊タイプ別の特殊処理
        switch (animation.destroyType) {
            case 'explode':
                target.scale = 1 + progress * 2;
                break;
            case 'vaporize':
                if (start.y !== undefined && end.y !== undefined) {
                    target.y = start.y + (end.y - start.y) * progress;
                }
                break;
            case 'shatter':
                // 破片効果は外部のパーティクルシステムで処理
                break;
        }
    }
    
    /**
     * バブル移動アニメーション更新
     */
    private updateBubbleMovementAnimation(animation: BubbleMovementAnimation, progress: number): void {
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
     * バブル開始値を取得
     */
    private getBubbleStartValues(bubble: Bubble, animationType: BubbleSpawnType | BubbleDestroyType): AnimationValues {
        const baseValues: AnimationValues = {
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
    private getBubbleEndValues(bubble: Bubble, animationType: BubbleSpawnType): AnimationValues {
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
    private getBubbleDestroyEndValues(bubble: Bubble, destroyType: BubbleDestroyType): AnimationValues {
        const baseValues: AnimationValues = {
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
}

/**
 * UI Animation Handler
 * UIアニメーション処理
 */
export class UIAnimationHandler {
    private typeSettings: TypeSettings;
    
    constructor() {
        this.typeSettings = {
            enabled: true,
            speedMultiplier: 1.0
        };
    }
    
    /**
     * UIエレメントアニメーション作成
     */
    createUIElementAnimation(element: UIElement, animationType: UIAnimationType, duration: number = 500, options: UIAnimationOptions = {}): UIElementAnimation | null {
        try {
            return {
                type: 'uiElement',
                target: element,
                animationType,
                duration,
                elapsed: 0,
                easing: options.easing || 'easeOutQuad',
                startValues: this.getUIStartValues(element, animationType, options),
                endValues: this.getUIEndValues(element, animationType, options),
                options: {
                    direction: options.direction || 'up',
                    distance: options.distance || 50,
                    intensity: options.intensity || 1.0,
                    ...options
                }
            };
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'UIAnimationHandler.createUIElementAnimation'
            });
            return null;
        }
    }
    
    /**
     * スコア変更アニメーション作成
     */
    createScoreChangeAnimation(oldScore: number, newScore: number, element: UIElement, duration: number = 1000, options: ScoreChangeOptions = {}): ScoreChangeAnimation | null {
        try {
            const scoreDiff = newScore - oldScore;
            return {
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
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'UIAnimationHandler.createScoreChangeAnimation'
            });
            return null;
        }
    }
    
    /**
     * UIアニメーション更新
     */
    updateUIAnimation(animation: UIElementAnimation | ScoreChangeAnimation, easedProgress: number): void {
        switch (animation.type) {
            case 'uiElement':
                this.updateUIElementAnimation(animation, easedProgress);
                break;
            case 'scoreChange':
                this.updateScoreChangeAnimation(animation, easedProgress);
                break;
        }
    }
    
    /**
     * UIエレメントアニメーション更新
     */
    private updateUIElementAnimation(animation: UIElementAnimation, progress: number): void {
        const start = animation.startValues;
        const end = animation.endValues;
        const target = animation.target;
        
        // 基本的な補間
        if (start.x !== undefined && end.x !== undefined) {
            target.x = start.x + (end.x - start.x) * progress;
        }
        if (start.y !== undefined && end.y !== undefined) {
            target.y = start.y + (end.y - start.y) * progress;
        }
        if (start.alpha !== undefined && end.alpha !== undefined) {
            target.alpha = start.alpha + (end.alpha - start.alpha) * progress;
        }
        if (start.scale !== undefined && end.scale !== undefined) {
            target.scale = start.scale + (end.scale - start.scale) * progress;
        }
        
        // アニメーションタイプ別の特殊処理
        switch (animation.animationType) {
            case 'pulse':
                const pulse = Math.sin(progress * Math.PI * 4) * 0.1 + 1;
                target.scale = pulse;
                break;
            case 'shake':
                const shakeIntensity = (1 - progress) * animation.options.intensity!;
                target.x = (target.x || 0) + (Math.random() - 0.5) * shakeIntensity * 10;
                target.y = (target.y || 0) + (Math.random() - 0.5) * shakeIntensity * 10;
                break;
        }
    }
    
    /**
     * スコア変更アニメーション更新
     */
    private updateScoreChangeAnimation(animation: ScoreChangeAnimation, progress: number): void {
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
        if (start.scale !== undefined && end.scale !== undefined) {
            target.scale = start.scale + (end.scale - start.scale) * progress;
        }
        
        // 差分表示
        if (animation.options.showDifference && animation.scoreDiff !== 0) {
            target.scoreDiff = animation.scoreDiff;
            target.diffAlpha = 1 - progress;
        }
    }
    
    /**
     * UI開始値を取得
     */
    private getUIStartValues(element: UIElement, animationType: UIAnimationType, options: UIAnimationOptions): AnimationValues {
        const baseValues: AnimationValues = {
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
                    case 'left': return { ...baseValues, x: baseValues.x! - slideDistance };
                    case 'right': return { ...baseValues, x: baseValues.x! + slideDistance };
                    case 'up': return { ...baseValues, y: baseValues.y! - slideDistance };
                    case 'down': return { ...baseValues, y: baseValues.y! + slideDistance };
                    default: return { ...baseValues, y: baseValues.y! - slideDistance };
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
    private getUIEndValues(element: UIElement, animationType: UIAnimationType, options: UIAnimationOptions): AnimationValues {
        const baseValues: AnimationValues = {
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
                    case 'left': return { ...baseValues, x: baseValues.x! - slideDistance };
                    case 'right': return { ...baseValues, x: baseValues.x! + slideDistance };
                    case 'up': return { ...baseValues, y: baseValues.y! - slideDistance };
                    case 'down': return { ...baseValues, y: baseValues.y! + slideDistance };
                    default: return { ...baseValues, y: baseValues.y! + slideDistance };
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
}

/**
 * Menu Animation Handler
 * メニューアニメーション処理
 */
export class MenuAnimationHandler {
    private canvas: Canvas;
    private typeSettings: TypeSettings;
    
    constructor(canvas: Canvas) {
        this.canvas = canvas;
        this.typeSettings = {
            enabled: true,
            speedMultiplier: 0.8
        };
    }
    
    /**
     * メニュー遷移アニメーション作成
     */
    createMenuTransitionAnimations(fromMenu: MenuElement | null, toMenu: MenuElement | null, transitionType: MenuTransitionType = 'slide', options: MenuTransitionOptions = {}): (MenuExitAnimation | MenuEnterAnimation)[] {
        const animations: (MenuExitAnimation | MenuEnterAnimation)[] = [];
        
        try {
            // 退出アニメーション
            if (fromMenu) {
                const exitAnimation: MenuExitAnimation = {
                    type: 'menuExit',
                    target: fromMenu,
                    transitionType,
                    duration: options.duration || 600,
                    elapsed: 0,
                    easing: options.exitEasing || 'easeInQuad',
                    startValues: { alpha: 1, x: 0, y: 0, scale: 1 },
                    endValues: this.getMenuExitEndValues(transitionType, options),
                    options: { ...options }
                };
                animations.push(exitAnimation);
            }
            
            // 入場アニメーション
            if (toMenu) {
                const enterAnimation: MenuEnterAnimation = {
                    type: 'menuEnter',
                    target: toMenu,
                    transitionType,
                    duration: options.duration || 600,
                    elapsed: 0,
                    easing: options.enterEasing || 'easeOutQuad',
                    startValues: this.getMenuEnterStartValues(transitionType, options),
                    endValues: { alpha: 1, x: 0, y: 0, scale: 1 },
                    options: { 
                        delay: options.overlap ? (options.duration || 600) * 0.3 : (options.duration || 600) * 0.5,
                        ...options 
                    }
                };
                animations.push(enterAnimation);
            }
            
            return animations;
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'MenuAnimationHandler.createMenuTransitionAnimations'
            });
            return [];
        }
    }
    
    /**
     * メニューアニメーション更新
     */
    updateMenuAnimation(animation: MenuExitAnimation | MenuEnterAnimation, progress: number): void {
        const start = animation.startValues;
        const end = animation.endValues;
        const target = animation.target;
        
        if (start.x !== undefined && end.x !== undefined) {
            target.x = start.x + (end.x - start.x) * progress;
        }
        if (start.y !== undefined && end.y !== undefined) {
            target.y = start.y + (end.y - start.y) * progress;
        }
        if (start.alpha !== undefined && end.alpha !== undefined) {
            target.alpha = start.alpha + (end.alpha - start.alpha) * progress;
        }
        if (start.scale !== undefined && end.scale !== undefined) {
            target.scale = start.scale + (end.scale - start.scale) * progress;
        }
    }
    
    /**
     * メニュー退出終了値を取得
     */
    private getMenuExitEndValues(transitionType: MenuTransitionType, options: MenuTransitionOptions): AnimationValues {
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
    private getMenuEnterStartValues(transitionType: MenuTransitionType, options: MenuTransitionOptions): AnimationValues {
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
}

/**
 * Loading Animation Handler
 * ローディングアニメーション処理
 */
export class LoadingAnimationHandler {
    private canvas: Canvas;
    private typeSettings: TypeSettings;
    
    constructor(canvas: Canvas) {
        this.canvas = canvas;
        this.typeSettings = {
            enabled: true,
            speedMultiplier: 1.2
        };
    }
    
    /**
     * ローディングアニメーション作成
     */
    createLoadingAnimation(type: LoadingAnimationType = 'spinner', position: Position | null = null, size: number = 50, options: LoadingAnimationOptions = {}): LoadingAnimation | null {
        try {
            const centerX = position?.x || this.canvas.width / 2;
            const centerY = position?.y || this.canvas.height / 2;
            
            return {
                type: 'loading',
                loadingType: type,
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
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'LoadingAnimationHandler.createLoadingAnimation'
            });
            return null;
        }
    }
    
    /**
     * ローディングアニメーション更新
     */
    updateLoadingAnimation(animation: LoadingAnimation, deltaTime: number): void {
        animation.rotation = (animation.rotation || 0) + (deltaTime * 0.003 * animation.options.speed!);
        animation.phase = (animation.phase || 0) + (deltaTime * 0.002 * animation.options.speed!);
        
        // ローディングタイプ別の状態更新
        switch (animation.loadingType) {
            case 'dots':
                animation.dotPhases = animation.dotPhases || [];
                for (let i = 0; i < animation.options.elements!; i++) {
                    animation.dotPhases[i] = (animation.phase + i * 0.2) % (Math.PI * 2);
                }
                break;
            case 'wave':
                animation.waveOffset = (animation.waveOffset || 0) + deltaTime * 0.005;
                break;
        }
    }
    
    /**
     * プログレスローディングアニメーション作成
     */
    createProgressLoadingAnimation(position: Position, size: number, options: LoadingAnimationOptions = {}): LoadingAnimation | null {
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
     * プログレス更新
     */
    updateLoadingProgress(animation: LoadingAnimation | null, progress: number): boolean {
        if (animation && animation.loadingType === 'progress') {
            animation.options.progress = Math.max(0, Math.min(1, progress));
            
            // 100%完了時の特別アニメーション
            if (animation.options.progress >= 1 && !animation.completionTriggered) {
                animation.completionTriggered = true;
                return true; // 完了フラグを返す
            }
        }
        return false;
    }
}