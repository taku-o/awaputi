import { getErrorHandler } from '../../../utils/ErrorHandler.js';

/**
 * フィードバックアニメーション管理クラス
 * 
 * Phase G.4で分割されたVisualFeedbackManagerのサブコンポーネント
 * 視覚フィードバック効果のアニメーション制御を専門に扱います。
 * 
 * 主な責任：
 * - フラッシュ、グロー、パルス、リップル、シェイクエフェクトの管理
 * - アニメーション設定とタイミング制御
 * - アクティブアニメーションの追跡と管理
 * - パフォーマンス最適化されたアニメーション実行
 * 
 * @class FeedbackAnimationManager
 * @memberof VisualFeedbackManager
 * @since Phase G.4
 * @author Claude Code
 */
export class FeedbackAnimationManager {
    /**
     * コンストラクター
     * @param {VisualFeedbackManager} mainController - メインコントローラーインスタンス
     */
    constructor(mainController) {
        this.mainController = mainController;
        this.activeAnimations = new Map();
        
        // アニメーション設定
        this.animationConfig = {
            flash: {
                defaultDuration: 300,
                easingFunction: 'ease-out'
            },
            glow: {
                defaultDuration: 500,
                easingFunction: 'ease-out'
            },
            pulse: {
                defaultDuration: 800,
                easingFunction: 'ease-out',
                iterationsPerSecond: 2.5
            },
            ripple: {
                defaultDuration: 1000,
                easingFunction: 'ease-out',
                minSize: 20,
                maxSize: 200
            },
            shake: {
                defaultDuration: 200,
                easingFunction: 'ease-out',
                stepInterval: 50
            }
        };
        
        console.log('FeedbackAnimationManager initialized');
    }
    
    /**
     * フラッシュエフェクトの作成
     * 
     * 指定された要素に対してフラッシュ（点滅）エフェクトを適用します。
     * 背景色を瞬時に変更し、徐々にフェードアウトすることで注意を引く効果を実現します。
     * 
     * @param {Object} options - エフェクトオプション
     * @param {string} options.id - エフェクトの一意識別子
     * @param {HTMLElement} options.target - エフェクトを適用する対象要素
     * @param {string} options.color - フラッシュの色（CSS色値）
     * @param {number} options.intensity - フラッシュの強度（0.0-1.0）
     * @param {number} [options.duration=300] - エフェクトの継続時間（ミリ秒）
     * @returns {Object} エフェクトオブジェクト（アニメーション制御用）
     * @throws {Error} target または color が指定されていない場合
     * @example
     * manager.createFlashEffect({
     *   id: 'score-flash',
     *   target: scoreElement,
     *   color: '#FFD700',
     *   intensity: 0.8,
     *   duration: 500
     * });
     */
    createFlashEffect({ id, target, color, intensity, duration }) {
        try {
            if (!target || !color) {
                throw new Error('Flash effect requires target and color');
            }
            
            const originalBackground = target.style.background;
            const flashIntensity = Math.min(intensity, 1.0);
            
            target.style.background = color;
            target.style.opacity = flashIntensity.toString();
            
            // アニメーション
            const animation = target.animate([
                { opacity: flashIntensity },
                { opacity: 0 }
            ], {
                duration: duration || this.animationConfig.flash.defaultDuration,
                easing: this.animationConfig.flash.easingFunction,
                fill: 'forwards'
            });
            
            animation.addEventListener('finish', () => {
                try {
                    target.style.background = originalBackground;
                    target.style.opacity = '0';
                    this.activeAnimations.delete(id);
                } catch (error) {
                    console.warn('Flash effect cleanup error:', error);
                }
            });
            
            this.activeAnimations.set(id, animation);
            
            return { 
                id, 
                target, 
                type: 'flash', 
                animation,
                cleanup: () => {
                    animation.cancel?.();
                    target.style.background = originalBackground;
                    target.style.opacity = '0';
                }
            };
            
        } catch (error) {
            getErrorHandler().handleError(error, 'ANIMATION_ERROR', {
                operation: 'createFlashEffect',
                effectId: id
            });
            return null;
        }
    }
    
    /**
     * グローエフェクトの作成
     * @param {Object} options - エフェクトオプション
     * @returns {Object} エフェクトオブジェクト
     */
    createGlowEffect({ id, target, color, intensity, duration }) {
        try {
            if (!target || !color) {
                throw new Error('Glow effect requires target and color');
            }
            
            const glowSize = 10 * intensity;
            const originalBoxShadow = target.style.boxShadow;
            
            target.style.boxShadow = `0 0 ${glowSize}px ${color}`;
            target.style.opacity = '0.8';
            
            const animation = target.animate([
                { boxShadow: `0 0 ${glowSize}px ${color}`, opacity: 0.8 },
                { boxShadow: `0 0 0px ${color}`, opacity: 0 }
            ], {
                duration: duration || this.animationConfig.glow.defaultDuration,
                easing: this.animationConfig.glow.easingFunction,
                fill: 'forwards'
            });
            
            animation.addEventListener('finish', () => {
                try {
                    target.style.boxShadow = originalBoxShadow;
                    target.style.opacity = '0';
                    this.activeAnimations.delete(id);
                } catch (error) {
                    console.warn('Glow effect cleanup error:', error);
                }
            });
            
            this.activeAnimations.set(id, animation);
            
            return { 
                id, 
                target, 
                type: 'glow', 
                animation,
                cleanup: () => {
                    animation.cancel?.();
                    target.style.boxShadow = originalBoxShadow;
                    target.style.opacity = '0';
                }
            };
            
        } catch (error) {
            getErrorHandler().handleError(error, 'ANIMATION_ERROR', {
                operation: 'createGlowEffect',
                effectId: id
            });
            return null;
        }
    }
    
    /**
     * パルスエフェクトの作成
     * @param {Object} options - エフェクトオプション
     * @returns {Object} エフェクトオブジェクト
     */
    createPulseEffect({ id, target, color, intensity, duration }) {
        try {
            if (!target || !color) {
                throw new Error('Pulse effect requires target and color');
            }
            
            const originalBackground = target.style.background;
            const originalTransform = target.style.transform;
            const pulseIntensity = 0.3 + (intensity * 0.7);
            
            target.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;
            
            const iterations = Math.ceil((duration || this.animationConfig.pulse.defaultDuration) / 400);
            
            const animation = target.animate([
                { opacity: 0, transform: 'scale(0.8)' },
                { opacity: pulseIntensity, transform: 'scale(1.1)' },
                { opacity: 0, transform: 'scale(1.3)' }
            ], {
                duration: duration || this.animationConfig.pulse.defaultDuration,
                easing: this.animationConfig.pulse.easingFunction,
                iterations: iterations
            });
            
            animation.addEventListener('finish', () => {
                try {
                    target.style.background = originalBackground;
                    target.style.opacity = '0';
                    target.style.transform = originalTransform;
                    this.activeAnimations.delete(id);
                } catch (error) {
                    console.warn('Pulse effect cleanup error:', error);
                }
            });
            
            this.activeAnimations.set(id, animation);
            
            return { 
                id, 
                target, 
                type: 'pulse', 
                animation,
                cleanup: () => {
                    animation.cancel?.();
                    target.style.background = originalBackground;
                    target.style.opacity = '0';
                    target.style.transform = originalTransform;
                }
            };
            
        } catch (error) {
            getErrorHandler().handleError(error, 'ANIMATION_ERROR', {
                operation: 'createPulseEffect',
                effectId: id
            });
            return null;
        }
    }
    
    /**
     * リップルエフェクトの作成
     * @param {Object} options - エフェクトオプション
     * @returns {Object} エフェクトオブジェクト
     */
    createRippleEffect({ id, target, color, intensity, duration }) {
        try {
            if (!target || !color) {
                throw new Error('Ripple effect requires target and color');
            }
            
            const config = this.animationConfig.ripple;
            const ripple = document.createElement('div');
            
            ripple.style.cssText = `
                position: absolute;
                border: 2px solid ${color};
                border-radius: 50%;
                width: ${config.minSize}px;
                height: ${config.minSize}px;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                opacity: ${intensity};
                pointer-events: none;
            `;
            
            target.appendChild(ripple);
            
            const animation = ripple.animate([
                { 
                    width: `${config.minSize}px`, 
                    height: `${config.minSize}px`, 
                    opacity: intensity 
                },
                { 
                    width: `${config.maxSize}px`, 
                    height: `${config.maxSize}px`, 
                    opacity: 0 
                }
            ], {
                duration: duration || config.defaultDuration,
                easing: config.easingFunction
            });
            
            animation.addEventListener('finish', () => {
                try {
                    if (ripple.parentNode) {
                        ripple.parentNode.removeChild(ripple);
                    }
                    this.activeAnimations.delete(id);
                } catch (error) {
                    console.warn('Ripple effect cleanup error:', error);
                }
            });
            
            this.activeAnimations.set(id, animation);
            
            return { 
                id, 
                target, 
                type: 'ripple', 
                animation,
                cleanup: () => {
                    animation.cancel?.();
                    if (ripple.parentNode) {
                        ripple.parentNode.removeChild(ripple);
                    }
                }
            };
            
        } catch (error) {
            getErrorHandler().handleError(error, 'ANIMATION_ERROR', {
                operation: 'createRippleEffect',
                effectId: id
            });
            return null;
        }
    }
    
    /**
     * シェイクエフェクトの作成
     * @param {Object} options - エフェクトオプション
     * @returns {Object} エフェクトオブジェクト
     */
    createShakeEffect({ id, target, color, intensity, duration }) {
        try {
            if (!target || !color) {
                throw new Error('Shake effect requires target and color');
            }
            
            const config = this.animationConfig.shake;
            const shakeDistance = 5 * intensity;
            const originalTransform = target.style.transform;
            const originalBackground = target.style.background;
            
            target.style.background = color;
            target.style.opacity = '0.6';
            
            // キーフレームの生成
            const keyframes = [];
            const shakeDuration = duration || config.defaultDuration;
            const steps = Math.floor(shakeDuration / config.stepInterval);
            
            for (let i = 0; i <= steps; i++) {
                const x = (Math.random() - 0.5) * shakeDistance * 2;
                const y = (Math.random() - 0.5) * shakeDistance * 2;
                const opacity = 0.6 * (1 - i / steps);
                
                keyframes.push({
                    transform: `translate(${x}px, ${y}px)`,
                    opacity: Math.max(0, opacity)
                });
            }
            
            const animation = target.animate(keyframes, {
                duration: shakeDuration,
                easing: config.easingFunction
            });
            
            animation.addEventListener('finish', () => {
                try {
                    target.style.transform = originalTransform;
                    target.style.background = originalBackground;
                    target.style.opacity = '0';
                    this.activeAnimations.delete(id);
                } catch (error) {
                    console.warn('Shake effect cleanup error:', error);
                }
            });
            
            this.activeAnimations.set(id, animation);
            
            return { 
                id, 
                target, 
                type: 'shake', 
                animation,
                cleanup: () => {
                    animation.cancel?.();
                    target.style.transform = originalTransform;
                    target.style.background = originalBackground;
                    target.style.opacity = '0';
                }
            };
            
        } catch (error) {
            getErrorHandler().handleError(error, 'ANIMATION_ERROR', {
                operation: 'createShakeEffect',
                effectId: id
            });
            return null;
        }
    }
    
    /**
     * 全アニメーションの停止とクリーンアップ
     */
    stopAllAnimations() {
        try {
            for (const [id, animation] of this.activeAnimations) {
                if (animation && typeof animation.cancel === 'function') {
                    animation.cancel();
                }
            }
            this.activeAnimations.clear();
            
            console.log('All animations stopped and cleaned up');
        } catch (error) {
            getErrorHandler().handleError(error, 'ANIMATION_ERROR', {
                operation: 'stopAllAnimations'
            });
        }
    }
    
    /**
     * アニメーション設定の更新
     * @param {string} type - アニメーションタイプ
     * @param {Object} config - 設定オブジェクト
     */
    updateAnimationConfig(type, config) {
        if (this.animationConfig[type]) {
            Object.assign(this.animationConfig[type], config);
            console.log(`Animation config updated for ${type}:`, config);
        } else {
            console.warn(`Unknown animation type: ${type}`);
        }
    }
    
    /**
     * アクティブアニメーション数の取得
     * @returns {number} アクティブアニメーション数
     */
    getActiveAnimationCount() {
        return this.activeAnimations.size;
    }
    
    /**
     * 統計情報の取得
     * @returns {Object} 統計情報
     */
    getStatistics() {
        return {
            activeAnimations: this.activeAnimations.size,
            supportedTypes: Object.keys(this.animationConfig),
            config: this.animationConfig
        };
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        console.log('Destroying FeedbackAnimationManager...');
        
        // 全アニメーションの停止
        this.stopAllAnimations();
        
        // 設定のクリア
        this.animationConfig = null;
        this.mainController = null;
        
        console.log('FeedbackAnimationManager destroyed');
    }
}