import { EffectManager } from './EffectManager.js';
import { getEffectsConfig } from '../config/EffectsConfig.js';
import { getErrorHandler } from '../utils/ErrorHandler.js';
import { AccessibilityEffectIntegrator } from './accessibility/AccessibilityEffectIntegrator.js';

// サブコンポーネントのインポート
import { EffectTransitionRenderer } from './enhanced-effect-manager/EffectTransitionRenderer.js';
import { LightingSystemRenderer } from './enhanced-effect-manager/LightingSystemRenderer.js';
import { ReflectionRenderer } from './enhanced-effect-manager/ReflectionRenderer.js';
import { BackgroundEffectRenderer } from './enhanced-effect-manager/BackgroundEffectRenderer.js';
import { PostProcessingRenderer } from './enhanced-effect-manager/PostProcessingRenderer.js';

/**
 * 拡張画面効果管理クラス (Refactored)
 * 既存のEffectManagerを拡張し、より高度な視覚効果を実現
 * 
 * サブコンポーネント化により責任を分離：
 * - EffectTransitionRenderer: 画面遷移効果（フェード、スライド、ズーム、ワイプ、ディゾルブ）
 * - LightingSystemRenderer: 光源効果システム（動的光源、影処理）
 * - ReflectionRenderer: 反射効果（水面、鏡面、バブル反射）
 * - BackgroundEffectRenderer: 背景環境効果（パーティクル、天候、環境）
 * - PostProcessingRenderer: ポストプロセッシング（ビネット、ノイズ、グリッチ等）
 */
export class EnhancedEffectManager extends EffectManager {
    constructor(canvas) {
        super(canvas);
        
        // 拡張機能の初期化
        this.transitionEffects = [];
        this.lightSources = [];
        this.backgroundEffects = [];
        this.shadowCasters = [];
        this.reflectionSurfaces = [];
        
        // アクセシビリティ統合（初期化時に設定）
        this.accessibilityIntegrator = null;
        this.accessibilityEnabled = false;
        
        // サブコンポーネントの初期化
        this._initializeRenderers();
        
        // 拡張変換状態
        this.enhancedTransform = {
            ...this.currentTransform,
            depthOfField: 0,
            motionBlur: { x: 0, y: 0, intensity: 0 },
            chromatic: 0,
            vignette: 0,
            noise: 0,
            scanlines: 0,
            glitch: { intensity: 0, frequency: 0 }
        };
        
        // レンダリング設定
        this.renderSettings = {
            enableLighting: true,
            enableShadows: true,
            enableReflections: true,
            enablePostProcessing: true,
            qualityLevel: 'high', // 'low', 'medium', 'high', 'ultra'
            enableBatching: false,
            reducedEffects: false,
            transitionSmoothing: false,
            transitionDuration: 300
        };
        
        // パフォーマンス最適化設定
        this.optimizedRendering = false;
        this.transitionSmoothing = false;
        this.transitionDuration = 300;
        
        // パフォーマンス監視
        this.performanceMetrics = {
            effectCount: 0,
            renderTime: 0,
            memoryUsage: 0,
            lastFrameTime: 0
        };
        
        console.log('[EnhancedEffectManager] 拡張画面効果管理システムを初期化しました');
    }
    
    /**
     * 影効果を追加
     */
    addShadowEffect(shadowObject, lightSource) {
        try {
            const shadowEffect = {
                id: this.effectId++,
                type: 'shadow',
                shadowObject: shadowObject,
                lightSource: lightSource,
                opacity: 0.6,
                blur: 2,
                direction: this._calculateShadowDirection(shadowObject, lightSource),
                distance: this._calculateShadowDistance(shadowObject, lightSource),
                created: Date.now()
            };
            
            this.shadowCasters.push(shadowEffect);
            return shadowEffect.id;
        } catch (error) {
            console.warn('[EnhancedEffectManager] 影効果の追加に失敗:', error);
            return null;
        }
    }
    
    /**
     * 影の方向を計算
     */
    _calculateShadowDirection(shadowObject, lightSource) {
        const dx = shadowObject.x - lightSource.x;
        const dy = shadowObject.y - lightSource.y;
        return Math.atan2(dy, dx);
    }
    
    /**
     * 影の距離を計算
     */
    _calculateShadowDistance(shadowObject, lightSource) {
        const dx = shadowObject.x - lightSource.x;
        const dy = shadowObject.y - lightSource.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return Math.min(distance * 0.3, 50); // 最大50px
    }
    
    /**
     * 影をレンダリング
     */
    renderShadows(context) {
        if (!this.renderSettings.enableShadows || this.shadowCasters.length === 0) {
            return;
        }
        
        context.save();
        context.globalCompositeOperation = 'multiply';
        
        for (const shadow of this.shadowCasters) {
            try {
                const { shadowObject, lightSource, opacity, blur, direction, distance } = shadow;
                
                context.save();
                context.globalAlpha = opacity;
                context.filter = `blur(${blur}px)`;
                
                // 影の位置を計算
                const shadowX = shadowObject.x + Math.cos(direction) * distance;
                const shadowY = shadowObject.y + Math.sin(direction) * distance;
                
                context.fillStyle = '#000000';
                context.beginPath();
                if (shadowObject.width && shadowObject.height) {
                    context.rect(shadowX, shadowY, shadowObject.width, shadowObject.height);
                } else {
                    context.arc(shadowX, shadowY, shadowObject.size || 20, 0, Math.PI * 2);
                }
                context.fill();
                context.restore();
            } catch (error) {
                console.warn('[EnhancedEffectManager] 影のレンダリングエラー:', error);
            }
        }
        
        context.restore();
    }
    
    /**
     * 反射効果を追加
     */
    addReflectionEffect(surface, intensity = 0.5) {
        try {
            const reflectionEffect = {
                id: this.effectId++,
                type: 'reflection',
                surface: surface,
                intensity: intensity,
                opacity: intensity * 0.7,
                surfaceType: this._determineSurfaceType(surface),
                created: Date.now()
            };
            
            this.reflectionSurfaces.push(reflectionEffect);
            return reflectionEffect.id;
        } catch (error) {
            console.warn('[EnhancedEffectManager] 反射効果の追加に失敗:', error);
            return null;
        }
    }
    
    /**
     * サーフェスタイプを判定
     */
    _determineSurfaceType(surface) {
        if (surface.type) return surface.type;
        if (surface.y > 300) return 'water';  // 画面下部は水面
        if (surface.width > surface.height) return 'floor';  // 横長は床面
        return 'mirror';  // その他は鏡面
    }
    
    /**
     * 期限切れの効果をクリーンアップ
     */
    cleanupExpiredEffects() {
        try {
            const currentTime = Date.now();
            let cleanupCount = 0;
            
            // 遷移効果のクリーンアップ
            const initialTransitionCount = this.transitionEffects.length;
            this.transitionEffects = this.transitionEffects.filter(effect => {
                const isExpired = effect.elapsed >= effect.duration;
                if (isExpired) cleanupCount++;
                return !isExpired;
            });
            
            // 背景効果のクリーンアップ
            const initialBackgroundCount = this.backgroundEffects.length;
            this.backgroundEffects = this.backgroundEffects.filter(effect => {
                const isExpired = effect.duration && (currentTime - effect.created) >= effect.duration;
                if (isExpired) cleanupCount++;
                return !isExpired;
            });
            
            // 影効果のクリーンアップ
            const initialShadowCount = this.shadowCasters.length;
            this.shadowCasters = this.shadowCasters.filter(effect => {
                const isExpired = effect.duration && (currentTime - effect.created) >= effect.duration;
                if (isExpired) cleanupCount++;
                return !isExpired;
            });
            
            // 反射効果のクリーンアップ
            const initialReflectionCount = this.reflectionSurfaces.length;
            this.reflectionSurfaces = this.reflectionSurfaces.filter(effect => {
                const isExpired = effect.duration && (currentTime - effect.created) >= effect.duration;
                if (isExpired) cleanupCount++;
                return !isExpired;
            });
            
            // 親クラスの効果もクリーンアップ
            if (this.effects) {
                const initialEffectCount = this.effects.length;
                this.effects = this.effects.filter(effect => {
                    const isExpired = effect.duration && effect.elapsed >= effect.duration;
                    if (isExpired) cleanupCount++;
                    return !isExpired;
                });
            }
            
            if (cleanupCount > 0) {
                console.debug(`[EnhancedEffectManager] ${cleanupCount}個の期限切れ効果をクリーンアップしました`);
            }
            
            return cleanupCount;
        } catch (error) {
            console.warn('[EnhancedEffectManager] 期限切れ効果のクリーンアップでエラー:', error);
            return 0;
        }
    }
    
    /**
     * サブコンポーネントレンダラーの初期化
     */
    _initializeRenderers() {
        try {
            this.transitionRenderer = new EffectTransitionRenderer(this.canvas);
            this.lightingRenderer = new LightingSystemRenderer(this.canvas);
            this.reflectionRenderer = new ReflectionRenderer(this.canvas);
            this.backgroundRenderer = new BackgroundEffectRenderer(this.canvas);
            this.postProcessingRenderer = new PostProcessingRenderer(this.canvas);
            
            console.log('[EnhancedEffectManager] サブコンポーネントレンダラーを初期化しました');
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EnhancedEffectManager._initializeRenderers'
            });
        }
    }
    
    /**
     * アクセシビリティ統合の初期化
     */
    async initializeAccessibility(gameEngine) {
        try {
            this.accessibilityIntegrator = new AccessibilityEffectIntegrator(gameEngine);
            await this.accessibilityIntegrator.initialize();
            this.accessibilityEnabled = true;
            
            console.log('[EnhancedEffectManager] アクセシビリティ統合を初期化しました');
            return true;
        } catch (error) {
            getErrorHandler().handleError(error, 'ACCESSIBILITY_ERROR', {
                operation: 'initializeAccessibility',
                component: 'EnhancedEffectManager'
            });
            return false;
        }
    }
    
    // ========================================
    // 画面遷移効果システム
    // ========================================
    
    /**
     * 画面遷移効果を追加
     */
    addTransitionEffect(type, duration, options = {}) {
        try {
            const effect = {
                id: this.effectId++,
                type: 'transition',
                transitionType: type, // 'fade', 'slide', 'zoom', 'wipe', 'dissolve'
                duration: duration,
                elapsed: 0,
                options: {
                    direction: options.direction || 'in', // 'in', 'out', 'cross'
                    easing: options.easing || 'easeInOut',
                    color: options.color || '#000000',
                    intensity: options.intensity || 1.0,
                    ...options
                }
            };
            
            this.transitionEffects.push(effect);
            this.effects.push(effect);
            
            console.log(`[EnhancedEffectManager] 遷移効果を追加: ${type} (${duration}ms)`);
            return effect.id;
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EnhancedEffectManager.addTransitionEffect'
            });
            return -1;
        }
    }
    
    /**
     * フェード遷移効果
     */
    addFadeTransition(duration, color = '#000000', direction = 'out') {
        return this.addTransitionEffect('fade', duration, { color, direction });
    }
    
    /**
     * スライド遷移効果
     */
    addSlideTransition(duration, direction = 'left', easing = 'easeInOut') {
        return this.addTransitionEffect('slide', duration, { 
            direction, 
            easing,
            slideDirection: direction // 'left', 'right', 'up', 'down'
        });
    }
    
    /**
     * ズーム遷移効果
     */
    addZoomTransition(duration, zoomType = 'in', center = null) {
        const centerPoint = center || { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        return this.addTransitionEffect('zoom', duration, { 
            zoomType, // 'in', 'out'
            center: centerPoint
        });
    }
    
    /**
     * ワイプ遷移効果
     */
    addWipeTransition(duration, pattern = 'horizontal', direction = 'left') {
        return this.addTransitionEffect('wipe', duration, { 
            pattern, // 'horizontal', 'vertical', 'circular', 'diamond'
            direction
        });
    }
    
    /**
     * ディゾルブ遷移効果
     */
    addDissolveTransition(duration, noiseScale = 1.0, threshold = 0.5) {
        return this.addTransitionEffect('dissolve', duration, { 
            noiseScale, 
            threshold 
        });
    }
    
    // ========================================
    // 光源効果システム
    // ========================================
    
    /**
     * 光源を追加
     */
    addLightSource(x, y, intensity, color, radius, type = 'point') {
        try {
            const lightSource = {
                id: this.effectId++,
                x, y,
                intensity,
                color: color,
                radius,
                type, // 'point', 'directional', 'spot', 'ambient'
                enabled: true,
                flickerFrequency: 0,
                flickerIntensity: 0,
                pulseFrequency: 0,
                pulseIntensity: 0,
                castShadows: true
            };
            
            this.lightSources.push(lightSource);
            
            console.log(`[EnhancedEffectManager] 光源を追加: ${type} (${x}, ${y})`);
            return lightSource.id;
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EnhancedEffectManager.addLightSource'
            });
            return -1;
        }
    }
    
    /**
     * スポットライトを追加
     */
    addSpotLight(x, y, targetX, targetY, intensity, color, radius, angle) {
        const lightId = this.addLightSource(x, y, intensity, color, radius, 'spot');
        if (lightId !== -1) {
            const light = this.lightSources.find(l => l.id === lightId);
            if (light) {
                light.targetX = targetX;
                light.targetY = targetY;
                light.spotAngle = angle;
            }
        }
        return lightId;
    }
    
    /**
     * 光源にエフェクトを追加
     */
    addLightEffect(lightId, effectType, parameters) {
        const light = this.lightSources.find(l => l.id === lightId);
        if (!light) return false;
        
        switch (effectType) {
            case 'flicker':
                light.flickerFrequency = parameters.frequency || 5;
                light.flickerIntensity = parameters.intensity || 0.3;
                break;
            case 'pulse':
                light.pulseFrequency = parameters.frequency || 2;
                light.pulseIntensity = parameters.intensity || 0.5;
                break;
        }
        
        return true;
    }
    
    /**
     * 影を投げかけるオブジェクトを追加
     */
    addShadowCaster(object, shadowType = 'hard') {
        try {
            const shadowCaster = {
                id: this.effectId++,
                object,
                shadowType, // 'hard', 'soft', 'volumetric'
                opacity: 0.7,
                blur: shadowType === 'soft' ? 3 : 0,
                enabled: true
            };
            
            this.shadowCasters.push(shadowCaster);
            
            return shadowCaster.id;
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EnhancedEffectManager.addShadowCaster'
            });
            return -1;
        }
    }
    
    /**
     * 反射面を追加
     */
    addReflectionSurface(surface, reflectivity = 0.5, blur = 0) {
        try {
            const reflectionSurface = {
                id: this.effectId++,
                surface,
                reflectivity,
                blur,
                enabled: true
            };
            
            this.reflectionSurfaces.push(reflectionSurface);
            
            return reflectionSurface.id;
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EnhancedEffectManager.addReflectionSurface'
            });
            return -1;
        }
    }
    
    // ========================================
    // 背景効果システム
    // ========================================
    
    /**
     * 背景効果を追加
     */
    addBackgroundEffect(type, intensity, duration = null, options = {}) {
        try {
            const effect = {
                id: this.effectId++,
                type: 'background',
                effectType: type, // 'particles', 'fog', 'clouds', 'rain', 'snow', 'stars'
                intensity,
                duration,
                elapsed: 0,
                enabled: true,
                options: {
                    density: options.density || 1.0,
                    speed: options.speed || 1.0,
                    direction: options.direction || 0,
                    color: options.color || '#FFFFFF',
                    size: options.size || 1.0,
                    opacity: options.opacity || 0.5,
                    ...options
                }
            };
            
            this.backgroundEffects.push(effect);
            if (duration) {
                this.effects.push(effect);
            }
            
            console.log(`[EnhancedEffectManager] 背景効果を追加: ${type}`);
            return effect.id;
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EnhancedEffectManager.addBackgroundEffect'
            });
            return -1;
        }
    }
    
    /**
     * パーティクル背景を追加
     */
    addParticleBackground(particleType, density, options = {}) {
        return this.addBackgroundEffect('particles', density, null, {
            particleType, // 'sparkles', 'dust', 'bubbles', 'energy'
            ...options
        });
    }
    
    /**
     * 天候効果を追加
     */
    addWeatherEffect(weatherType, intensity, duration = null) {
        const weatherOptions = {
            rain: { color: '#4A90E2', speed: 2.0, direction: Math.PI * 0.25 },
            snow: { color: '#FFFFFF', speed: 0.5, direction: Math.PI * 0.5 },
            fog: { color: '#CCCCCC', density: 0.3, opacity: 0.4 }
        };
        
        const options = weatherOptions[weatherType] || {};
        return this.addBackgroundEffect(weatherType, intensity, duration, options);
    }
    
    // ========================================
    // 高度な画面効果
    // ========================================
    
    /**
     * 深度ブラー効果を追加
     */
    addDepthOfField(focusDistance, blurIntensity, duration, easing = 'easeInOut') {
        const effect = {
            id: this.effectId++,
            type: 'depthOfField',
            startFocus: this.enhancedTransform.depthOfField,
            targetFocus: focusDistance,
            blurIntensity,
            duration,
            elapsed: 0,
            easing
        };
        
        this.effects.push(effect);
        return effect.id;
    }
    
    /**
     * モーションブラー効果を追加
     */
    addMotionBlur(velocityX, velocityY, intensity, duration) {
        const effect = {
            id: this.effectId++,
            type: 'motionBlur',
            velocityX,
            velocityY,
            intensity,
            duration,
            elapsed: 0
        };
        
        this.effects.push(effect);
        return effect.id;
    }
    
    /**
     * 色収差効果を追加
     */
    addChromaticAberration(intensity, duration, easing = 'easeInOut') {
        const effect = {
            id: this.effectId++,
            type: 'chromatic',
            startIntensity: this.enhancedTransform.chromatic,
            targetIntensity: intensity,
            duration,
            elapsed: 0,
            easing
        };
        
        this.effects.push(effect);
        return effect.id;
    }
    
    /**
     * ビネット効果を追加
     */
    addVignetteEffect(intensity, duration, easing = 'easeInOut') {
        const effect = {
            id: this.effectId++,
            type: 'vignette',
            startIntensity: this.enhancedTransform.vignette,
            targetIntensity: intensity,
            duration,
            elapsed: 0,
            easing
        };
        
        this.effects.push(effect);
        return effect.id;
    }
    
    /**
     * ノイズ効果を追加
     */
    addNoiseEffect(intensity, duration, noiseType = 'film') {
        const effect = {
            id: this.effectId++,
            type: 'noise',
            intensity,
            noiseType, // 'film', 'digital', 'static'
            duration,
            elapsed: 0
        };
        
        this.effects.push(effect);
        return effect.id;
    }
    
    /**
     * スキャンライン効果を追加
     */
    addScanlinesEffect(intensity, frequency, duration) {
        const effect = {
            id: this.effectId++,
            type: 'scanlines',
            intensity,
            frequency,
            duration,
            elapsed: 0
        };
        
        this.effects.push(effect);
        return effect.id;
    }
    
    /**
     * グリッチ効果を追加
     */
    addGlitchEffect(intensity, frequency, duration, type = 'digital') {
        const effect = {
            id: this.effectId++,
            type: 'glitch',
            intensity,
            frequency,
            glitchType: type, // 'digital', 'analog', 'data'
            duration,
            elapsed: 0
        };
        
        this.effects.push(effect);
        return effect.id;
    }
    
    // ========================================
    // 更新処理の拡張
    // ========================================
    
    /**
     * 更新処理（親クラスを拡張）
     */
    update(deltaTime) {
        const startTime = performance.now();
        
        // 親クラスの更新処理
        super.update(deltaTime);
        
        // 拡張効果の更新
        this.updateTransitionEffects(deltaTime);
        this.updateLightSources(deltaTime);
        this.updateBackgroundEffects(deltaTime);
        this.updateEnhancedEffects(deltaTime);
        
        // パフォーマンス監視
        this.performanceMetrics.renderTime = performance.now() - startTime;
        const totalEffects = (this.effects ? this.effects.length : 0) + 
                            this.transitionEffects.length + 
                            this.lightSources.length + 
                            this.backgroundEffects.length;
        this.performanceMetrics.effectCount = totalEffects;
        this.performanceMetrics.memoryUsage = totalEffects * 1024; // Estimate memory usage
        
        // 品質自動調整
        this.autoAdjustQuality();
    }
    
    /**
     * 遷移効果の更新
     */
    updateTransitionEffects(deltaTime) {
        this.transitionEffects.forEach(effect => {
            if (!effect.completed) {
                effect.elapsed += deltaTime;
                
                if (effect.elapsed >= effect.duration) {
                    effect.completed = true;
                } else {
                    const progress = effect.elapsed / effect.duration;
                    this.updateTransitionEffect(effect, progress);
                }
            }
        });
    }
    
    /**
     * 個別遷移効果の更新
     */
    updateTransitionEffect(effect, progress) {
        const easedProgress = this.ease(progress, effect.options.easing);
        
        // 各遷移タイプに応じた処理はrenderTransitionEffectsで実装
        effect.currentProgress = easedProgress;
    }
    
    /**
     * 光源の更新
     */
    /**
     * 光源アニメーション設定
     */
    animateLightSource(lightId, animations) {
        const light = this.lightSources.find(l => l.id === lightId);
        if (!light) return false;
        
        light.animations = light.animations || {};
        
        if (animations.intensity) {
            light.animations.intensity = {
                startValue: light.intensity,
                targetValue: animations.intensity.target,
                duration: animations.intensity.duration,
                startTime: Date.now()
            };
        }
        
        return true;
    }

    updateLightSources(deltaTime) {
        const currentTime = Date.now();
        
        this.lightSources.forEach(light => {
            if (!light.enabled) return;
            
            // アニメーション処理
            if (light.animations) {
                Object.keys(light.animations).forEach(prop => {
                    const anim = light.animations[prop];
                    if (anim && anim.startTime) {
                        const elapsed = currentTime - anim.startTime;
                        const progress = Math.min(elapsed / anim.duration, 1);
                        
                        if (prop === 'intensity') {
                            light.intensity = anim.startValue + (anim.targetValue - anim.startValue) * progress;
                        }
                        
                        // アニメーション完了時にクリーンアップ
                        if (progress >= 1) {
                            delete light.animations[prop];
                        }
                    }
                });
            }
            
            // フリッカー効果
            if (light.flickerFrequency > 0) {
                const flicker = Math.sin(currentTime * 0.001 * light.flickerFrequency * Math.PI * 2);
                light.currentIntensity = light.intensity * (1 + flicker * light.flickerIntensity);
            }
            
            // パルス効果
            if (light.pulseFrequency > 0) {
                const pulse = Math.sin(currentTime * 0.001 * light.pulseFrequency * Math.PI * 2);
                light.currentIntensity = light.intensity * (1 + pulse * light.pulseIntensity);
            }
            
            if (light.flickerFrequency === 0 && light.pulseFrequency === 0) {
                light.currentIntensity = light.intensity;
            }
        });
    }
    
    /**
     * 背景効果の更新
     */
    updateBackgroundEffects(deltaTime) {
        this.backgroundEffects.forEach(effect => {
            if (!effect.completed && effect.enabled !== false) {
                if (effect.duration) {
                    effect.elapsed += deltaTime;
                    if (effect.elapsed >= effect.duration) {
                        effect.enabled = false;
                        effect.completed = true;
                    }
                }
            }
            
            // エフェクトタイプ別の更新処理（サブコンポーネントに委譲）
            if (this.backgroundRenderer && this.backgroundRenderer.updateBackgroundEffect) {
                this.backgroundRenderer.updateBackgroundEffect(effect, deltaTime);
            }
        });
        
        // 無効な効果を削除
        this.backgroundEffects = this.backgroundEffects.filter(effect => effect.enabled);
    }
    
    /**
     * 拡張効果の更新
     */
    updateEnhancedEffects(deltaTime) {
        // 拡張効果のみを処理
        const enhancedEffects = this.effects.filter(effect => 
            ['depthOfField', 'motionBlur', 'chromatic', 'vignette', 'noise', 'scanlines', 'glitch'].includes(effect.type)
        );
        
        enhancedEffects.forEach(effect => {
            const progress = effect.elapsed / effect.duration;
            const easedProgress = this.ease(progress, effect.easing || 'linear');
            
            switch (effect.type) {
                case 'depthOfField':
                    this.enhancedTransform.depthOfField = effect.startFocus + (effect.targetFocus - effect.startFocus) * easedProgress;
                    break;
                case 'motionBlur':
                    this.enhancedTransform.motionBlur = {
                        x: effect.velocityX * effect.intensity * (1 - progress),
                        y: effect.velocityY * effect.intensity * (1 - progress),
                        intensity: effect.intensity * (1 - progress)
                    };
                    break;
                case 'chromatic':
                    this.enhancedTransform.chromatic = effect.startIntensity + (effect.targetIntensity - effect.startIntensity) * easedProgress;
                    break;
                case 'vignette':
                    this.enhancedTransform.vignette = effect.startIntensity + (effect.targetIntensity - effect.startIntensity) * easedProgress;
                    break;
                case 'noise':
                    this.enhancedTransform.noise = effect.intensity * (1 - progress);
                    break;
                case 'scanlines':
                    this.enhancedTransform.scanlines = effect.intensity * (1 - progress);
                    break;
                case 'glitch':
                    this.enhancedTransform.glitch = {
                        intensity: effect.intensity * (1 - progress),
                        frequency: effect.frequency
                    };
                    break;
            }
        });
    }
    
    /**
     * 品質自動調整
     */
    autoAdjustQuality() {
        const frameTime = this.performanceMetrics.renderTime;
        const targetFrameTime = 16.67; // 60FPS
        
        if (frameTime > targetFrameTime * 2) {
            // パフォーマンスが悪い場合は品質を下げる
            if (this.renderSettings.qualityLevel === 'ultra') {
                this.renderSettings.qualityLevel = 'high';
            } else if (this.renderSettings.qualityLevel === 'high') {
                this.renderSettings.qualityLevel = 'medium';
            } else if (this.renderSettings.qualityLevel === 'medium') {
                this.renderSettings.qualityLevel = 'low';
            }
        } else if (frameTime < targetFrameTime * 0.5) {
            // パフォーマンスが良い場合は品質を上げる
            if (this.renderSettings.qualityLevel === 'low') {
                this.renderSettings.qualityLevel = 'medium';
            } else if (this.renderSettings.qualityLevel === 'medium') {
                this.renderSettings.qualityLevel = 'high';
            } else if (this.renderSettings.qualityLevel === 'high') {
                this.renderSettings.qualityLevel = 'ultra';
            }
        }
    }
    
    // ========================================
    // レンダリング拡張
    // ========================================
    
    /**
     * 前処理エフェクトを描画（オーバーライド）
     */
    renderPreEffects(context) {
        context.save();
        
        // 親クラスの変換を適用
        this.applyTransform(context);
        
        // 拡張変換を適用（サブコンポーネントに委譲）
        this.postProcessingRenderer.applyEnhancedTransform(context, this.enhancedTransform);
    }
    
    /**
     * 後処理エフェクトを描画（オーバーライド）
     */
    renderPostEffects(context) {
        // 光源効果をレンダリング（サブコンポーネントに委譲）
        if (this.renderSettings.enableLighting) {
            this.lightingRenderer.renderLighting(context, this.lightSources);
        }
        
        // 影をレンダリング（サブコンポーネントに委譲）
        if (this.renderSettings.enableShadows) {
            this.renderShadows(context);
        }
        
        // 反射をレンダリング（サブコンポーネントに委譲）
        if (this.renderSettings.enableReflections) {
            this.reflectionRenderer.renderReflections(context, this.reflectionSurfaces, this.renderSettings);
        }
        
        // 背景効果をレンダリング（サブコンポーネントに委譲）
        this.backgroundRenderer.renderBackgroundEffects(context, this.backgroundEffects);
        
        // 遷移効果をレンダリング（サブコンポーネントに委譲）
        this.renderTransitionEffects(context);
        
        // ポストプロセッシング効果（サブコンポーネントに委譲）
        if (this.renderSettings.enablePostProcessing) {
            this.postProcessingRenderer.renderPostProcessingEffects(context, this.enhancedTransform, this.renderSettings);
        }
        
        // 親クラスのオーバーレイ
        this.resetTransform(context);
        this.renderOverlays(context);
        
        context.restore();
    }
    
    // レンダリング処理はサブコンポーネントに移行済み
    
    // 影・反射・背景効果のレンダリング処理はサブコンポーネントに移行済み
    
    /**
     * 遷移効果をレンダリング（サブコンポーネントに委譲）
     */
    renderTransitionEffects(context) {
        this.transitionEffects.forEach(effect => {
            const progress = effect.currentProgress || 0;
            this.transitionRenderer.renderTransition(context, effect, progress);
        });
    }
    
    // 遷移効果・ポストプロセッシング効果のレンダリング処理はサブコンポーネントに移行済み
    
    /**
     * 深度ブラー効果を適用（サブコンポーネントに委譲）
     */
    addDepthBlurEffect(focusPoint, blurRadius, duration) {
        const effect = {
            id: this.effectId++,
            type: 'depthBlur',
            focusPoint, // {x, y, z} z値で深度を表現
            blurRadius,
            duration,
            elapsed: 0,
            enabled: true
        };
        
        this.effects.push(effect);
        return effect.id;
    }
    
    /**
     * 品質倍率を取得
     */
    getQualityMultiplier() {
        switch (this.renderSettings.qualityLevel) {
            case 'low': return 0.25;
            case 'medium': return 0.5;
            case 'high': return 1.0;
            case 'ultra': return 1.5;
            default: return 1.0;
        }
    }
    
    /**
     * バブル表面の光沢とリフレクションを統合描画（サブコンポーネントに委譲）
     */
    renderBubbleCompleteReflectionSystem(context, bubble) {
        this.reflectionRenderer.renderBubbleCompleteReflectionSystem(context, bubble, this.renderSettings);
    }
    
    /**
     * 動的ライティングシステム
     */
    addDynamicLighting(bubbles = []) {
        // 既存の光源をクリア
        this.lightSources = this.lightSources.filter(light => light.type !== 'dynamic');
        
        // バブルベースの動的光源を追加
        bubbles.forEach(bubble => {
            if (bubble.type === 'rainbow' || bubble.type === 'electric') {
                this.addLightSource(
                    bubble.x, bubble.y, 
                    0.8, // intensity
                    bubble.type === 'rainbow' ? '#FFFFFF' : '#FFFF00',
                    bubble.size * 3, // radius
                    'dynamic'
                );
            }
        });
        
        // 環境光源を追加
        if (this.renderSettings.qualityLevel === 'ultra' || this.renderSettings.qualityLevel === 'high') {
            this.addLightSource(
                this.canvas.width / 2, -50,
                0.5, '#FFFFCC', this.canvas.width,
                'ambient'
            );
        }
    }
    
    // ========================================
    // 設定とユーティリティ
    // ========================================
    
    /**
     * レンダリング設定を更新
     */
    updateRenderSettings(settings) {
        Object.assign(this.renderSettings, settings);
        console.log('[EnhancedEffectManager] レンダリング設定を更新:', settings);
    }
    
    /**
     * Enable or disable optimized rendering for performance optimization
     * @param {boolean} enabled - Whether to enable optimized rendering
     */
    enableOptimizedRendering(enabled) {
        this.optimizedRendering = enabled;
        if (enabled) {
            this.renderSettings.enableBatching = true;
            this.renderSettings.reducedEffects = false;
            this.renderSettings.qualityLevel = 'high';
        } else {
            this.renderSettings.enableBatching = false;
            this.renderSettings.reducedEffects = true;
        }
        console.log(`[EnhancedEffectManager] Optimized rendering ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Enable or disable transition smoothing
     * @param {boolean} enabled - Whether to enable transition smoothing
     */
    setTransitionSmoothing(enabled) {
        this.transitionSmoothing = enabled;
        if (enabled) {
            this.renderSettings.transitionSmoothing = true;
        }
        console.log(`[EnhancedEffectManager] Transition smoothing ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Set transition duration in milliseconds
     * @param {number} duration - Duration in milliseconds
     */
    setTransitionDuration(duration) {
        this.transitionDuration = duration;
        this.renderSettings.transitionDuration = duration;
        console.log(`[EnhancedEffectManager] Transition duration set to ${duration}ms`);
    }

    
    /**
     * Set gradient profiles for various visual effects
     * @param {object} gradientProfiles - Object containing gradient profile definitions
     */
    setGradientProfiles(gradientProfiles) {
        this.gradientProfiles = gradientProfiles;
        console.log('[EnhancedEffectManager] Gradient profiles set:', Object.keys(gradientProfiles));
    }
    
    /**
     * 品質レベルを設定
     */
    setQualityLevel(level) {
        if (['low', 'medium', 'high', 'ultra'].includes(level)) {
            this.renderSettings.qualityLevel = level;
            
            // Quality level specific settings
            switch (level) {
                case 'low':
                    this.renderSettings.enablePostProcessing = false;
                    this.renderSettings.enableShadows = true;
                    this.renderSettings.enableLighting = true;
                    break;
                case 'medium':
                    this.renderSettings.enablePostProcessing = true;
                    this.renderSettings.enableShadows = false;
                    this.renderSettings.enableLighting = true;
                    break;
                case 'high':
                    this.renderSettings.enablePostProcessing = true;
                    this.renderSettings.enableShadows = true;
                    this.renderSettings.enableLighting = true;
                    break;
                case 'ultra':
                    this.renderSettings.enablePostProcessing = true;
                    this.renderSettings.enableShadows = true;
                    this.renderSettings.enableLighting = true;
                    break;
            }
            
            console.log(`[EnhancedEffectManager] 品質レベルを設定: ${level}`);
        }
    }
    
    /**
     * パフォーマンス統計を取得
     */
    getPerformanceMetrics() {
        return { ...this.performanceMetrics };
    }
    
    /**
     * 光源を削除
     */
    removeLightSource(lightId) {
        const index = this.lightSources.findIndex(l => l.id === lightId);
        if (index !== -1) {
            this.lightSources.splice(index, 1);
            return true;
        }
        return false;
    }
    
    /**
     * 背景効果を削除
     */
    removeBackgroundEffect(effectId) {
        const index = this.backgroundEffects.findIndex(e => e.id === effectId);
        if (index !== -1) {
            this.backgroundEffects.splice(index, 1);
            return true;
        }
        return false;
    }
    
    /**
     * 全ての拡張効果をクリア
     */
    clearEnhancedEffects() {
        super.clearEffects();
        this.transitionEffects = [];
        this.lightSources = [];
        this.backgroundEffects = [];
        this.shadowCasters = [];
        this.reflectionSurfaces = [];
        
        // 拡張変換状態をリセット
        this.enhancedTransform = {
            ...this.currentTransform,
            depthOfField: 0,
            motionBlur: { x: 0, y: 0, intensity: 0 },
            chromatic: 0,
            vignette: 0,
            noise: 0,
            scanlines: 0,
            glitch: { intensity: 0, frequency: 0 }
        };
        
        console.log('[EnhancedEffectManager] 全ての拡張効果をクリアしました');
    }
    
    /**
     * エフェクトをレンダリング
     * Issue #106 Task 6対応: 不足しているrenderメソッドの実装
     * @param {CanvasRenderingContext2D} context - キャンバスコンテキスト
     */
    render(context) {
        try {
            // 親クラスのrenderメソッドを呼び出し
            if (super.render && typeof super.render === 'function') {
                super.render(context);
            }
            
            // 拡張エフェクトのレンダリング
            this.renderEnhancedEffects(context);
            
        } catch (error) {
            console.error('[EnhancedEffectManager] Render error:', error);
        }
    }
    
    /**
     * 拡張エフェクトの描画
     * @param {CanvasRenderingContext2D} context - キャンバスコンテキスト
     */
    renderEnhancedEffects(context) {
        if (!context) return;
        
        try {
            context.save();
            
            // 画面遷移エフェクトの描画
            if (this.transitionManager) {
                this.transitionManager.render(context);
            }
            
            // ライティング エフェクトの描画
            if (this.lightingManager) {
                this.lightingManager.render(context);
            }
            
            // 背景エフェクトの描画
            if (this.backgroundManager) {
                this.backgroundManager.render(context);
            }
            
            // シャドウ エフェクトの描画
            this.renderShadowEffects(context);
            
            // リフレクション エフェクトの描画
            this.renderReflectionEffects(context);
            
            context.restore();
            
        } catch (error) {
            context.restore();
            console.error('[EnhancedEffectManager] Enhanced effects render error:', error);
        }
    }
    
    /**
     * シャドウ エフェクトの描画
     * @param {CanvasRenderingContext2D} context - キャンバスコンテキスト
     */
    renderShadowEffects(context) {
        // シャドウ エフェクトの基本実装
        // 実際の実装は後で追加される予定
        if (this.currentEffects && this.currentEffects.shadow) {
            context.save();
            context.globalAlpha = 0.3;
            context.shadowColor = 'rgba(0, 0, 0, 0.5)';
            context.shadowBlur = 10;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            // シャドウ描画処理
            context.restore();
        }
    }
    
    /**
     * リフレクション エフェクトの描画
     * @param {CanvasRenderingContext2D} context - キャンバスコンテキスト
     */
    renderReflectionEffects(context) {
        // リフレクション エフェクトの基本実装
        // 実際の実装は後で追加される予定
        if (this.currentEffects && this.currentEffects.reflection) {
            context.save();
            context.globalAlpha = 0.2;
            context.setTransform(1, 0, 0, -1, 0, context.canvas.height);
            // リフレクション描画処理
            context.restore();
        }
    }

    /**
     * Depth of Field エフェクトの設定
     */
    setDepthOfField(intensity) {
        if (this.enhancedTransform) {
            this.enhancedTransform.depthOfField = Math.max(0, Math.min(1, intensity));
        }
    }
    
    /**
     * Motion Blur エフェクトの設定
     */
    setMotionBlur(x, y, intensity) {
        if (this.enhancedTransform) {
            this.enhancedTransform.motionBlur.x = x || 0;
            this.enhancedTransform.motionBlur.y = y || 0;
            this.enhancedTransform.motionBlur.intensity = Math.max(0, Math.min(1, intensity || 0));
        }
    }
    
    /**
     * Chromatic Aberration エフェクトの設定
     */
    setChromaticAberration(intensity) {
        if (this.enhancedTransform) {
            this.enhancedTransform.chromatic = Math.max(0, Math.min(1, intensity));
        }
    }

    /**
     * Vignette エフェクトの設定
     */
    setVignette(intensity) {
        if (this.enhancedTransform) {
            this.enhancedTransform.vignette = Math.max(0, Math.min(1, intensity));
        }
    }

    /**
     * ノイズエフェクトの追加
     */
    addNoiseEffect(intensity, type = 'film') {
        if (this.enhancedTransform) {
            this.enhancedTransform.noise = Math.max(0, Math.min(1, intensity));
            this.enhancedTransform.noiseType = type;
        }
    }

    /**
     * スキャンラインエフェクトの追加
     */
    addScanlineEffect(intensity, lineWidth = 2) {
        if (this.enhancedTransform) {
            this.enhancedTransform.scanlines = Math.max(0, Math.min(1, intensity));
            this.enhancedTransform.scanlineWidth = lineWidth;
        }
    }

    /**
     * グリッチエフェクトの追加
     */
    addGlitchEffect(intensity, frequency) {
        if (this.enhancedTransform) {
            this.enhancedTransform.glitch.intensity = Math.max(0, Math.min(1, intensity));
            this.enhancedTransform.glitch.frequency = frequency || 10;
        }
    }

    /**
     * ポストプロセシングエフェクトのレンダリング
     */
    renderPostProcessing(context) {
        if (!this.renderSettings.enablePostProcessing || !context) return;
        
        context.save();
        
        // Apply post-processing effects
        if (this.enhancedTransform) {
            if (this.enhancedTransform.noise > 0) {
                // Render noise effect
            }
            if (this.enhancedTransform.scanlines > 0) {
                // Render scanline effect
            }
            if (this.enhancedTransform.glitch.intensity > 0) {
                // Render glitch effect
            }
        }
        
        context.restore();
    }

    /**
     * 光源アニメーションの追加
     */
    animateLightSource(lightId, animations) {
        const light = this.lightSources.find(l => l.id === lightId);
        if (!light) return false;
        
        light.animations = light.animations || {};
        
        if (animations.intensity) {
            light.animations.intensity = {
                startValue: light.intensity,
                targetValue: animations.intensity.target,
                duration: animations.intensity.duration,
                startTime: Date.now()
            };
        }
        
        return true;
    }

    /**
     * リフレクションエフェクトのレンダリング
     */
    renderReflections(context) {
        if (!this.reflectionSurfaces.length || !context) return;
        
        context.save();
        
        for (const reflection of this.reflectionSurfaces) {
            try {
                context.globalAlpha = reflection.intensity;
                context.setTransform(1, 0, 0, -1, 0, context.canvas.height);
                // Render reflection effect
                context.restore();
                context.save();
            } catch (error) {
                console.error('Error rendering reflection:', error);
            }
        }
        
        context.restore();
    }

    /**
     * 設定を更新
     */
    updateConfiguration(config) {
        if (config) {
            if (config.hasOwnProperty('enableLighting')) {
                this.renderSettings.enableLighting = config.enableLighting;
            }
            if (config.hasOwnProperty('enableShadows')) {
                this.renderSettings.enableShadows = config.enableShadows;
            }
            if (config.hasOwnProperty('qualityLevel')) {
                this.setQualityLevel(config.qualityLevel);
            }
            if (config.hasOwnProperty('enablePostProcessing')) {
                this.renderSettings.enablePostProcessing = config.enablePostProcessing;
            }
        }
    }

    /**
     * 全てのエフェクトをクリア
     */
    clearAllEffects() {
        this.clearEnhancedEffects();
    }

    /**
     * デストラクタ
     */
    destroy() {
        this.clearEnhancedEffects();
        this.dispose();
    }

    /**
     * リソースクリーンアップ
     */
    dispose() {
        super.dispose();
        this.clearEnhancedEffects();
        console.log('[EnhancedEffectManager] リソースをクリーンアップしました');
    }
}