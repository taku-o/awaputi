/**
 * FeedbackAnimationManager
 * 
 * フィードバックアニメーション管理機能を担当
 * Main Controller Patternの一部として設計
 * 
 * **Features**:
 * - Flash, Glow, Pulse, Ripple, Shake effects management
 * - Animation configuration and timing control
 * - Active animation tracking and management
 * - Performance optimized animation execution
 * 
 * @module FeedbackAnimationManager
 * Created: Phase G.4 (Issue #103)
 */

import { getErrorHandler  } from '../../../utils/ErrorHandler.js';

// 型定義
export interface VisualFeedbackManager { config: FeedbackManagerConfig;
    elements: FeedbackElements;
    state: FeedbackManagerState;

export interface FeedbackManagerConfig { animations: AnimationGlobalConfig;
    performance: PerformanceConfig;
    accessibility: AccessibilityConfig;

export interface AnimationGlobalConfig { maxConcurrent: number;
    reducedMotion: boolean;
    hardwareAcceleration: boolean;
    respectUserPreferences: boolean;

export interface PerformanceConfig { maxAnimationDuration: number;
    maxFrameRate: number;
    lowPowerMode: boolean;

export interface AccessibilityConfig { respectReducedMotion: boolean;
    highContrast: boolean;
    alternativeText: boolean;

export interface FeedbackElements { container: HTMLElement;
    overlay: HTMLElement;
    statusDisplay: HTMLElement;

export interface FeedbackManagerState { activeAnimations: Map<string, AnimationEffect>,
    animationQueue: AnimationQueueItem[];
    performance: PerformanceMetrics;

export interface AnimationConfig { flash: FlashAnimationConfig;
    glow: GlowAnimationConfig;
    pulse: PulseAnimationConfig;
    ripple: RippleAnimationConfig;
    shake: ShakeAnimationConfig;

export interface FlashAnimationConfig { defaultDuration: number;
    easingFunction: string;
    maxIntensity: number;
    fadeOutRatio: number;

export interface GlowAnimationConfig { defaultDuration: number;
    easingFunction: string;
    maxGlowSize: number;
    opacityRange: OpacityRange;

export interface PulseAnimationConfig { defaultDuration: number;
    easingFunction: string;
    iterationsPerSecond: number;
    scaleRange: ScaleRange;
    intensityRange: IntensityRange;

export interface RippleAnimationConfig { defaultDuration: number;
    easingFunction: string;
    minSize: number;
    maxSize: number;
    borderWidth: number;

export interface ShakeAnimationConfig { defaultDuration: number;
    easingFunction: string;
    stepInterval: number;
    maxDistance: number;

export interface OpacityRange { min: number;
    max: number;

export interface ScaleRange { min: number;
    max: number;

export interface IntensityRange { min: number;
    max: number;

export interface EffectOptions { id: string;
    target: HTMLElement;
    color: string;
    intensity: number;
    duration?: number;
    delay?: number;
    easing?: string;

export interface FlashEffectOptions extends EffectOptions { backgroundOverride?: string,
    fadeOutDelay?: number;

export interface GlowEffectOptions extends EffectOptions { glowSize?: number,
    spread?: number;
    blur?: number;

export interface PulseEffectOptions extends EffectOptions { iterations?: number,
    scaleMin?: number;
    scaleMax?: number;

export interface RippleEffectOptions extends EffectOptions { startSize?: number,
    endSize?: number;
    borderStyle?: string;
    originX?: number;
    originY?: number;

export interface ShakeEffectOptions extends EffectOptions { maxDistance?: number,
    steps?: number;
    direction?: ShakeDirection;

export interface AnimationEffect { id: string;
    target: HTMLElement;
    type: EffectType;
    animation: Animation;
    cleanup: () => void;
    startTime: number;
    duration: number;
    options: EffectOptions;
}

export interface AnimationQueueItem { effect: EffectOptions;
    priority: number;
    timestamp: number;

export interface PerformanceMetrics { totalAnimations: number;
    activeCount: number;
    averageDuration: number;
    droppedFrames: number;
    memoryUsage: number;

export interface AnimationStatistics { activeAnimations: number;
    supportedTypes: EffectType[];
    config: AnimationConfig;
    performance: PerformanceMetrics;
    byType: Record<EffectType, AnimationTypeStats> }

export interface AnimationTypeStats { count: number;
    totalDuration: number;
    averageIntensity: number;
    successRate: number;

export interface CleanupResult { cleaned: number;
    failed: number;
    errors: Error[];

export interface AnimationValidationResult { isValid: boolean;
    reason?: string;
    suggestion?: string;
';'
// 列挙型
export type EffectType = 'flash' | 'glow' | 'pulse' | 'ripple' | 'shake';
export type AnimationState = 'idle' | 'running' | 'paused' | 'finished' | 'cancelled';
export type EasingFunction = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
export type ShakeDirection = 'horizontal' | 'vertical' | 'both' | 'radial';
export type Priority = 'low' | 'normal' | 'high' | 'critical';

// 定数
export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = { flash: {
        defaultDuration: 300;
        easingFunction: 'ease-out';
        maxIntensity: 1.0;
    fadeOutRatio: 0.7  };
    glow: { defaultDuration: 500,''
        easingFunction: 'ease-out';
    maxGlowSize: 50 }
        opacityRange: { min: 0, max: 0.8  };

    pulse: { defaultDuration: 800,''
        easingFunction: 'ease-out';
    iterationsPerSecond: 2.5 }
        scaleRange: { min: 0.8, max: 1.3  };
        intensityRange: { min: 0.3, max: 1.0  };

    ripple: { defaultDuration: 1000,''
        easingFunction: 'ease-out';
        minSize: 20;
        maxSize: 200;
    borderWidth: 2  };
    shake: { defaultDuration: 200,''
        easingFunction: 'ease-out';
        stepInterval: 50;
    maxDistance: 10  }
} as const;
export const PERFORMANCE_LIMITS = { MAX_CONCURRENT_ANIMATIONS: 5;
    MAX_ANIMATION_DURATION: 5000;
    CLEANUP_INTERVAL: 1000;
    MEMORY_THRESHOLD: 50 * 1024 * 1024 // 50MB  } as const;
export const ANIMATION_PRIORITIES: Record<Priority, number> = { low: 1;
    normal: 2;
    high: 3;
    critical: 4  } as const;
';'

export const CSS_PROPERTIES = {;
    TRANSFORM: 'transform';
    OPACITY: 'opacity';
    BACKGROUND: 'background';
    BOX_SHADOW: 'boxShadow';
    BORDER: 'border'
            } as const;
// ユーティリティ関数
export function validateEffectOptions(options: Partial<EffectOptions>): AnimationValidationResult {;
    if (!options.target) {
        return { isValid: false;

            reason: 'Target element is required',' };'

            suggestion: 'Provide a valid HTMLElement as target' 
    }

    if (!options.color) {
        return { isValid: false;

            reason: 'Color is required',' };'

            suggestion: 'Provide a valid CSS color value' 
    }

    if(typeof, options.intensity !== 'number' || options.intensity < 0 || options.intensity > 1' {'
        return { isValid: false;

            reason: 'Intensity must be a number between 0 and 1',' };'

            suggestion: 'Set intensity to a value between 0.0 and 1.0' 
    }
    
    return { isValid: true;

export function normalizeIntensity(intensity: number): number { return Math.max(0, Math.min(1, intensity) }
';'

export function createAnimationKeyframes(type: EffectType, options: EffectOptions): Keyframe[] {;
    switch(type) {', ' }

        case 'flash': return [' }'

                { opacity: normalizeIntensity(options.intensity }]
                { opacity: 0 }]'
            ];
        case 'glow':';'
            const, glowSize = 10 * normalizeIntensity(options.intensity);
            return [{ boxShadow: `0 0 ${glowSize}px ${options.color}`, opacity: 0.8 }]
                { boxShadow: `0 0 0px ${options.color}`, opacity: 0 }]'
            ];
        case 'pulse':';'
            const intensity = 0.3 + (normalizeIntensity(options.intensity) * 0.7);

            return [';'
                { opacity: 0, transform: 'scale(0.8)'
            },''
                { opacity: intensity, transform: 'scale(1.1)'
            },]'
                { opacity: 0, transform: 'scale(1.3)'
            }]'
            ];
        case 'ripple': return [{ 
                    width: `${DEFAULT_ANIMATION_CONFIG.ripple.minSize}px`;
                    height: `${DEFAULT_ANIMATION_CONFIG.ripple.minSize}px`;
                    opacity: options.intensity ;
                },
                { 
                    width: `${DEFAULT_ANIMATION_CONFIG.ripple.maxSize}px`;
                    height: `${DEFAULT_ANIMATION_CONFIG.ripple.maxSize}px`;
                    opacity: 0 ];
                }]
            ],
        default: return [];

export function generateShakeKeyframes(distance: number, steps: number): Keyframe[] { const keyframes: Keyframe[] = [];
    
    for(let, i = 0, i <= steps, i++) {
    
        const x = (Math.random() - 0.5) * distance * 2,
        const y = (Math.random() - 0.5) * distance * 2,
        const opacity = 0.6 * (1 - i / steps) }
        keyframes.push({) }
            transform: `translate(${x}px, ${ y}px}`
            }
            opacity: Math.max(0, opacity};
        };
    }
    
    return keyframes;
}
';'

export function calculateAnimationTiming(duration: number, easing: string): KeyframeAnimationOptions { return {,
        duration: Math.min(duration, PERFORMANCE_LIMITS.MAX_ANIMATION_DURATION);
        easing,' };'

        fill: 'forwards' 
    }

export function shouldUseReducedMotion()';'
           window.matchMedia('(prefers-reduced-motion: reduce)).matches }'

export class FeedbackAnimationManager {
    private mainController: VisualFeedbackManager;
    private, activeAnimations: Map<string, AnimationEffect>,
    private animationConfig: AnimationConfig;
    private, performanceMetrics: PerformanceMetrics;
    constructor(mainController: VisualFeedbackManager) {
','

        this.mainController = mainController;
        this.activeAnimations = new Map('
}''
        console.log('FeedbackAnimationManager, initialized'); }'
    }

    /**
     * フラッシュエフェクトの作成
     */
    createFlashEffect(options: FlashEffectOptions): AnimationEffect | null { try {
            const validation = validateEffectOptions(options);
            if (!validation.isValid) { }
                throw new Error(`Flash, effect validation, failed: ${validation.reason}`};
            }
            
            const originalBackground = options.target.style.background;
            const flashIntensity = normalizeIntensity(options.intensity);
            ';'

            options.target.style.background = options.color;
            options.target.style.opacity = flashIntensity.toString()';'
            const keyframes = createAnimationKeyframes('flash', options);
            const timing = calculateAnimationTiming(;
                options.duration || this.animationConfig.flash.defaultDuration);
                options.easing || this.animationConfig.flash.easingFunction;
            );
            
            const animation = options.target.animate(keyframes, timing);

            const cleanup = () => {  try {'
                    options.target.style.background = originalBackground,
                    options.target.style.opacity = '0' }

                    this.activeAnimations.delete(options.id);' }'

                } catch (error) { console.warn('Flash effect cleanup error:', error }
            };

            animation.addEventListener('finish', cleanup';'
            
            const effect: AnimationEffect = { id: options.id,

                target: options.target,
                type: 'flash',
                animation,
                cleanup,
                startTime: Date.now(
    duration: timing.duration as number,
                options  };
            
            this.activeAnimations.set(options.id, effect);
            this.updatePerformanceMetrics();
            
            return effect;
            ';'

        } catch (error) { getErrorHandler().handleError(error as Error, 'ANIMATION_ERROR', {''
                operation: 'createFlashEffect');
                effectId: options.id  },
            return null;

    /**
     * グローエフェクトの作成
     */
    createGlowEffect(options: GlowEffectOptions): AnimationEffect | null { try {
            const validation = validateEffectOptions(options);
            if (!validation.isValid) { }
                throw new Error(`Glow, effect validation, failed: ${validation.reason}`};
            }

            const glowSize = (options.glowSize || 10) * normalizeIntensity(options.intensity);
            const originalBoxShadow = options.target.style.boxShadow;
            ';'

            options.target.style.boxShadow = `0 0 ${glowSize}px ${options.color}`;
            options.target.style.opacity = '0.8';

            const keyframes = createAnimationKeyframes('glow', options);
            const timing = calculateAnimationTiming(;
                options.duration || this.animationConfig.glow.defaultDuration);
                options.easing || this.animationConfig.glow.easingFunction;
            );
            
            const animation = options.target.animate(keyframes, timing);

            const cleanup = () => {  try {'
                    options.target.style.boxShadow = originalBoxShadow,
                    options.target.style.opacity = '0' }

                    this.activeAnimations.delete(options.id);' }'

                } catch (error) { console.warn('Glow effect cleanup error:', error }
            };

            animation.addEventListener('finish', cleanup';'
            
            const effect: AnimationEffect = { id: options.id,

                target: options.target,
                type: 'glow',
                animation,
                cleanup,
                startTime: Date.now(
    duration: timing.duration as number,
                options  };
            
            this.activeAnimations.set(options.id, effect);
            this.updatePerformanceMetrics();
            
            return effect;
            ';'

        } catch (error) { getErrorHandler().handleError(error as Error, 'ANIMATION_ERROR', {''
                operation: 'createGlowEffect');
                effectId: options.id  },
            return null;

    /**
     * パルスエフェクトの作成
     */
    createPulseEffect(options: PulseEffectOptions): AnimationEffect | null { try {
            const validation = validateEffectOptions(options);
            if (!validation.isValid) { }
                throw new Error(`Pulse, effect validation, failed: ${validation.reason}`};
            }
            
            const originalBackground = options.target.style.background;
            const originalTransform = options.target.style.transform;
            const pulseIntensity = 0.3 + (normalizeIntensity(options.intensity) * 0.7);
            
            options.target.style.background = `radial-gradient(circle, ${ options.color) 0%, transparent, 70%)`,
            ','

            const, duration = options.duration || this.animationConfig.pulse.defaultDuration,
            const, iterations = options.iterations || Math.ceil(duration / 400};

            const keyframes = createAnimationKeyframes('pulse', options};
            const timing = { }
                ...calculateAnimationTiming(duration, options.easing || this.animationConfig.pulse.easingFunction};
                iterations;
            };
            
            const animation = options.target.animate(keyframes, timing);

            const cleanup = () => {  try {'
                    options.target.style.background = originalBackground,
                    options.target.style.opacity = '0',
                    options.target.style.transform = originalTransform }

                    this.activeAnimations.delete(options.id);' }'

                } catch (error) { console.warn('Pulse effect cleanup error:', error }
            };

            animation.addEventListener('finish', cleanup';'
            
            const effect: AnimationEffect = { id: options.id,

                target: options.target,
                type: 'pulse',
                animation,
                cleanup,
                startTime: Date.now(
    duration: timing.duration as number,
                options  };
            
            this.activeAnimations.set(options.id, effect);
            this.updatePerformanceMetrics();
            
            return effect;
            ';'

        } catch (error) { getErrorHandler().handleError(error as Error, 'ANIMATION_ERROR', {''
                operation: 'createPulseEffect');
                effectId: options.id  },
            return null;

    /**
     * リップルエフェクトの作成
     */
    createRippleEffect(options: RippleEffectOptions): AnimationEffect | null { try {
            const validation = validateEffectOptions(options);
            if (!validation.isValid) { }'

                throw new Error(`Ripple, effect validation, failed: ${validation.reason}`}';'
            }
            ';'

            const config = this.animationConfig.ripple;
            const ripple = document.createElement('div);'
            const startSize = options.startSize || config.minSize;
            const endSize = options.endSize || config.maxSize;
            
            ripple.style.cssText = `;
                position: absolute,
    border: ${config.borderWidth}px solid ${options.color}
                border-radius: 50%,
    width: ${startSize}px,
                height: ${startSize}px,
                top: ${options.originY || 50}%,
                left: ${options.originX || 50}%,
                transform: translate(-50%, -50%);
                opacity: ${normalizeIntensity(options.intensity}
                pointer-events: none,
            `;
            
            options.target.appendChild(ripple);
            
            const keyframes = [{ 
                    width: `${startSize}px`,
                    height: `${startSize}px`,
                    opacity: normalizeIntensity(options.intensity);
                },
                { 
                    width: `${endSize}px`,
                    height: `${endSize}px`,
                    opacity: 0 ],
                }]
            ],
            
            const timing = calculateAnimationTiming(;
                options.duration || config.defaultDuration);
                options.easing || config.easingFunction;
            );
            
            const animation = ripple.animate(keyframes, timing);
            
            const cleanup = () => {  try {
                    if (ripple.parentNode) { }
                        ripple.parentNode.removeChild(ripple); }
                    }

                    this.activeAnimations.delete(options.id);'} catch (error) { console.warn('Ripple effect cleanup error:', error }'
            };

            animation.addEventListener('finish', cleanup';'
            
            const effect: AnimationEffect = { id: options.id,

                target: options.target,
                type: 'ripple',
                animation,
                cleanup,
                startTime: Date.now(
    duration: timing.duration as number,
                options  };
            
            this.activeAnimations.set(options.id, effect);
            this.updatePerformanceMetrics();
            
            return effect;
            ';'

        } catch (error) { getErrorHandler().handleError(error as Error, 'ANIMATION_ERROR', {''
                operation: 'createRippleEffect');
                effectId: options.id  },
            return null;

    /**
     * シェイクエフェクトの作成
     */
    createShakeEffect(options: ShakeEffectOptions): AnimationEffect | null { try {
            const validation = validateEffectOptions(options);
            if (!validation.isValid) { }
                throw new Error(`Shake, effect validation, failed: ${validation.reason}`};
            }
            ';'

            const config = this.animationConfig.shake;
            const shakeDistance = (options.maxDistance || 5) * normalizeIntensity(options.intensity);
            const originalTransform = options.target.style.transform;
            const originalBackground = options.target.style.background;
            ';'

            options.target.style.background = options.color;
            options.target.style.opacity = '0.6';
            
            const shakeDuration = options.duration || config.defaultDuration;
            const steps = options.steps || Math.floor(shakeDuration / config.stepInterval);
            const keyframes = generateShakeKeyframes(shakeDistance, steps);
            
            const timing = calculateAnimationTiming(;
                shakeDuration,
                options.easing || config.easingFunction;
            );
            
            const animation = options.target.animate(keyframes, timing);

            const cleanup = () => {  try {'
                    options.target.style.transform = originalTransform,

                    options.target.style.background = originalBackground,
                    options.target.style.opacity = '0' }

                    this.activeAnimations.delete(options.id);' }'

                } catch (error) { console.warn('Shake effect cleanup error:', error }
            };

            animation.addEventListener('finish', cleanup';'
            
            const effect: AnimationEffect = { id: options.id,

                target: options.target,
                type: 'shake',
                animation,
                cleanup,
                startTime: Date.now(
    duration: timing.duration as number,
                options  };
            
            this.activeAnimations.set(options.id, effect);
            this.updatePerformanceMetrics();
            
            return effect;
            ';'

        } catch (error) { getErrorHandler().handleError(error as Error, 'ANIMATION_ERROR', {''
                operation: 'createShakeEffect');
                effectId: options.id  },
            return null;

    /**
     * 全アニメーションの停止とクリーンアップ
     */
    stopAllAnimations(): CleanupResult { const result: CleanupResult = {
            cleaned: 0,
            failed: 0,
    errors: [] },
        ';'

        try {'
            for(const [id, effect] of this.activeAnimations) {
                try {'
                    if(effect.animation && typeof, effect.animation.cancel === 'function' { }
                        effect.animation.cancel(); }
                    }
                    if (effect.cleanup) { effect.cleanup() }
                    result.cleaned++;
                } catch (error) { result.failed++,
                    result.errors.push(error, as Error) }
                    console.warn(`Failed to cleanup animation ${id}:`, error);
                }
            }
            
            this.activeAnimations.clear();
            this.updatePerformanceMetrics();
            
            console.log(`Animation cleanup completed: ${result.cleaned} cleaned, ${result.failed} failed`};
            return result;
            ';'

        } catch (error) { getErrorHandler().handleError(error as Error, 'ANIMATION_ERROR', {''
                operation: 'stopAllAnimations'
            };
            result.errors.push(error, as Error);
            return result;

    /**
     * アニメーション設定の更新
     */
    updateAnimationConfig(type: EffectType, config: Partial<AnimationConfig[EffectType]>): void { if (this.animationConfig[type]) {
            Object.assign(this.animationConfig[type], config) }
            console.log(`Animation config updated for ${type}:`, config};
        } else {  }
            console.warn(`Unknown, animation type: ${type}`};
        }
    }

    /**
     * パフォーマンスメトリクスの更新
     */
    private updatePerformanceMetrics(): void { this.performanceMetrics.activeCount = this.activeAnimations.size,
        this.performanceMetrics.totalAnimations++,
        
        // 平均実行時間の計算
        const activeDurations = Array.from(this.activeAnimations.values().map(effect => effect.duration);
        if (activeDurations.length > 0) {
            this.performanceMetrics.averageDuration =  }
                activeDurations.reduce((sum, duration) => sum + duration, 0) / activeDurations.length; }
}

    /**
     * アクティブアニメーション数の取得
     */
    getActiveAnimationCount(): number { return this.activeAnimations.size }

    /**
     * 統計情報の取得
     */
    getStatistics(): AnimationStatistics { const byType: Record<EffectType, AnimationTypeStats> = { }
            flash: { count: 0, totalDuration: 0, averageIntensity: 0, successRate: 0  },
            glow: { count: 0, totalDuration: 0, averageIntensity: 0, successRate: 0  },
            pulse: { count: 0, totalDuration: 0, averageIntensity: 0, successRate: 0  },
            ripple: { count: 0, totalDuration: 0, averageIntensity: 0, successRate: 0  },
            shake: { count: 0, totalDuration: 0, averageIntensity: 0, successRate: 0  },
        
        // アクティブアニメーションの統計を計算
        for (const effect of this.activeAnimations.values() {
            const stats = byType[effect.type],
            stats.count++,
            stats.totalDuration += effect.duration }
            stats.averageIntensity += effect.options.intensity; }
        }
        
        // 平均値の計算
        for (const type of Object.keys(byType) as EffectType[]) { const stats = byType[type],
            if (stats.count > 0) {
                stats.averageIntensity /= stats.count }
                stats.successRate = 1.0; // 現在実行中のものは成功率100% }
}
        
        return { activeAnimations: this.activeAnimations.size,
            supportedTypes: Object.keys(this.animationConfig) as EffectType[],
            config: this.animationConfig,
    performance: this.performanceMetrics },
            byType }
        }

    /**
     * リソースの解放
     */''
    destroy()';'
        console.log('Destroying, FeedbackAnimationManager...');
        ';'
        // 全アニメーションの停止
        this.stopAllAnimations()';'
        console.log('FeedbackAnimationManager, destroyed');

    }'}'