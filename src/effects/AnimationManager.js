import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getEffectsConfig } from '../config/EffectsConfig.js';

// サブコンポーネントのインポート
import { AnimationEngineCore, AnimationQualityController } from './animation-manager/AnimationEngineCore.js';
import { 
    BubbleAnimationHandler, 
    UIAnimationHandler, 
    MenuAnimationHandler, 
    LoadingAnimationHandler 
} from './animation-manager/AnimationTypeHandlers.js';
import { 
    LoadingAnimationRenderer, 
    InteractiveEffectRenderer, 
    ParticleEffectRenderer, 
    TransitionEffectRenderer,
    AnimationEffectUtils 
} from './animation-manager/AnimationRenderers.js';

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
    constructor(canvas) {
        this.canvas = canvas;
        this.animations = [];
        this.animationId = 0;
        
        // 設定システムとの連携
        this.effectsConfig = getEffectsConfig();
        
        // サブコンポーネントの初期化
        this._initializeSubComponents();
        
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
        
        console.log('[AnimationManager] アニメーション管理システムを初期化しました');
        this._initializeFromConfig();
    }
    
    /**
     * サブコンポーネント初期化
     */
    _initializeSubComponents() {
        try {
            // エンジンコア
            this.engineCore = new AnimationEngineCore();
            
            // 品質コントローラー
            this.qualityController = new AnimationQualityController();
            
            // アニメーションハンドラー
            this.bubbleHandler = new BubbleAnimationHandler();
            this.uiHandler = new UIAnimationHandler();
            this.menuHandler = new MenuAnimationHandler(this.canvas);
            this.loadingHandler = new LoadingAnimationHandler(this.canvas);
            
            console.log('[AnimationManager] サブコンポーネントを初期化しました');
            
        } catch (error) {
            console.error('AnimationManager サブコンポーネント初期化に失敗:', error);
            getErrorHandler().handleError(error, {
                context: 'AnimationManager._initializeSubComponents'
            });
        }
    }
    
    /**
     * 設定から初期化
     */
    _initializeFromConfig() {
        try {
            const animationConfig = this.effectsConfig.getAnimationConfig();
            if (animationConfig) {
                const settings = {
                    enabled: animationConfig.enabled || true,
                    globalSpeed: animationConfig.globalSpeed || 1.0,
                    quality: animationConfig.quality || 'high'
                };
                this.engineCore.updateSettings(settings);
            }
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'AnimationManager._initializeFromConfig'
            });
        }
    }
    
    // ========================================
    // バブルアニメーション（サブコンポーネント呼び出し）
    // ========================================
    
    /**
     * バブルスポーンアニメーション
     */
    animateBubbleSpawn(bubble, spawnType = 'scale', options = {}) {
        if (!this.engineCore.settings.enabled || !this.typeSettings.bubble.enabled) {
            return -1;
        }
        
        const animation = this.bubbleHandler.createBubbleSpawnAnimation(bubble, spawnType, options);
        if (animation) {
            animation.id = this.animationId++;
            
            // 遅延がある場合は遅延付きで開始
            if (animation.options.delay > 0) {
                setTimeout(() => {
                    this.animations.push(animation);
                }, animation.options.delay);
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
    animateBubbleDestroy(bubble, destroyType = 'shrink', options = {}) {
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
    animateBubbleMovement(bubble, targetPosition, duration = 1000, options = {}) {
        if (!this.engineCore.settings.enabled || !this.typeSettings.bubble.enabled) {
            return -1;
        }
        
        const animation = this.bubbleHandler.createBubbleMovementAnimation(bubble, targetPosition, duration, options);
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
    animateUIElement(element, animationType, duration = 500, options = {}) {
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
    animateScoreChange(oldScore, newScore, element, duration = 1000, options = {}) {
        if (!this.engineCore.settings.enabled || !this.typeSettings.score.enabled) {
            return -1;
        }
        
        const animation = this.uiHandler.createScoreChangeAnimation(oldScore, newScore, element, duration, options);
        if (animation) {
            animation.id = this.animationId++;
            
            // スコア増加時のスケールアニメーション
            const scoreDiff = newScore - oldScore;
            if (animation.options.animateScale && scoreDiff > 0) {
                animation.endValues.scale = 1.2;
                setTimeout(() => {
                    animation.endValues.scale = 1;
                }, duration * 0.3);
            }
            
            this.animations.push(animation);
            return animation.id;
        }
        return -1;
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
        if (!this.engineCore.settings.enabled || !this.typeSettings.menu.enabled) {
            return -1;
        }
        
        const animations = this.menuHandler.createMenuTransitionAnimations(fromMenu, toMenu, transitionType, options);
        const animationIds = [];
        
        animations.forEach((animation, index) => {
            animation.id = this.animationId++;
            animationIds.push(animation.id);
            
            if (animation.options && animation.options.delay > 0) {
                setTimeout(() => {
                    this.animations.push(animation);
                }, animation.options.delay);
            } else {
                this.animations.push(animation);
            }
        });
        
        return animationIds;
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
    
    // ========================================
    // 高度なアニメーション機能（簡略化版）
    // ========================================
    
    /**
     * チェーンアニメーション
     */
    chainAnimations(animationChain) {
        const chainId = `chain_${this.animationId++}`;
        let totalDelay = 0;
        
        animationChain.forEach((animConfig) => {
            // 個別アニメーション作成（タイプに応じて適切なハンドラーを使用）
            setTimeout(() => {
                if (animConfig.type === 'bubble') {
                    this.animateBubbleSpawn(animConfig.target, animConfig.spawnType, animConfig.options);
                } else if (animConfig.type === 'ui') {
                    this.animateUIElement(animConfig.target, animConfig.animationType, animConfig.duration, animConfig.options);
                }
            }, totalDelay);
            
            totalDelay += (animConfig.duration || 500) + (animConfig.gap || 0);
        });
        
        return chainId;
    }
    
    /**
     * パラレルアニメーション
     */
    runParallelAnimations(animationList) {
        const parallelId = `parallel_${this.animationId++}`;
        
        animationList.forEach((animConfig) => {
            // 並列でアニメーション実行
            if (animConfig.type === 'bubble') {
                this.animateBubbleSpawn(animConfig.target, animConfig.spawnType, animConfig.options);
            } else if (animConfig.type === 'ui') {
                this.animateUIElement(animConfig.target, animConfig.animationType, animConfig.duration, animConfig.options);
            }
        });
        
        return parallelId;
    }
    
    /**
     * イージング関数（エンジンコアに委譲）
     */
    ease(t, type) {
        return this.engineCore.ease(t, type);
    }
    
    // ========================================
    // 更新とレンダリング
    // ========================================
    
    /**
     * アニメーション更新（エンジンコア使用）
     */
    update(deltaTime) {
        if (!this.engineCore.settings.enabled) {
            return;
        }
        
        // エンジンコアでアニメーション更新
        this.animations = this.engineCore.updateAnimations(this.animations, deltaTime);
        
        // 個別アニメーション更新
        this.animations.forEach(animation => {
            const { progress, easedProgress } = this.engineCore.calculateAnimationProgress(animation);
            this._updateAnimation(animation, easedProgress);
        });
        
        // 品質コントローラーでフレーム時間記録
        const metrics = this.engineCore.getPerformanceMetrics();
        this.qualityController.recordFrameTime(metrics.frameTime);
    }
    
    /**
     * 個別アニメーション更新（サブコンポーネント使用）
     */
    _updateAnimation(animation, easedProgress) {
        // アニメーションタイプ別更新をハンドラーに委譲
        switch (animation.type) {
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
    
    // 詳細アニメーション更新処理はサブコンポーネントに移行済み
    
    // 品質調整・イベント発火はエンジンコアに移行済み
    
    // ========================================
    // レンダリング
    // ========================================
    
    /**
     * ローディングアニメーションをレンダリング
     */
    renderLoadingAnimation(context, animation) {
        LoadingAnimationRenderer.renderLoadingAnimation(context, animation);
    }
    
    // 詳細なレンダリング処理はサブコンポーネントに移行
    
    /**
     * 進行状況付きローディングアニメーション
     */
    createProgressLoadingAnimation(position, size, options = {}) {
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
    updateLoadingProgress(animationId, progress) {
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
     * インタラクティブなアニメーション（簡略化版）
     */
    addInteractiveAnimation(element, interactionType, options = {}) {
        // 基本的なインタラクティブアニメーション
        switch (interactionType) {
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
     * リップル効果を作成
     */
    createRippleEffect(position, color = '#FFFFFF') {
        return InteractiveEffectRenderer.renderRippleEffect;
    }
    
    /**
     * アニメーションプリセット（簡略化版）
     */
    applyAnimationPreset(target, presetName, options = {}) {
        const presets = {
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
    stopAnimation(animationId) {
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
    stopAllAnimations() {
        this.animations.forEach(animation => {
            this.engineCore.completeAnimation(animation);
        });
        this.animations = [];
    }
    
    /**
     * 特定のタイプのアニメーションを停止
     */
    stopAnimationsByType(type) {
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
    updateSettings(newSettings) {
        this.engineCore.updateSettings(newSettings);
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
        return this.engineCore.getPerformanceMetrics();
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
     * 品質設定を取得
     */
    getCurrentQualitySettings() {
        return this.qualityController.getCurrentQualitySettings();
    }
    
    /**
     * リソースクリーンアップ
     */
    dispose() {
        this.stopAllAnimations();
        this.animationQueue = [];
        
        // サブコンポーネントのクリーンアップ
        if (this.engineCore) {
            this.engineCore.dispose();
        }
        
        console.log('[AnimationManager] リソースをクリーンアップしました');
    }
}