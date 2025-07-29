import { EffectManager } from './EffectManager.js';
import { getEffectsConfig } from '../config/EffectsConfig.js';
import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * 拡張画面効果管理クラス
 * 既存のEffectManagerを拡張し、より高度な視覚効果を実現
 * - 画面遷移効果（フェード、スライド、ズーム）
 * - 光源効果システム（動的光源、影、反射）
 * - 背景環境効果（パーティクル、天候、雰囲気）
 * - 高度な画面効果（深度ブラー、色調補正、歪み）
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
            qualityLevel: 'high' // 'low', 'medium', 'high', 'ultra'
        };
        
        // パフォーマンス監視
        this.performanceMetrics = {
            effectCount: 0,
            renderTime: 0,
            memoryUsage: 0,
            lastFrameTime: 0
        };
        
        console.log('[EnhancedEffectManager] 拡張画面効果管理システムを初期化しました');
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
                color: this.parseColor(color),
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
        this.performanceMetrics.effectCount = this.effects.length + this.lightSources.length + this.backgroundEffects.length;
        
        // 品質自動調整
        this.autoAdjustQuality();
    }
    
    /**
     * 遷移効果の更新
     */
    updateTransitionEffects(deltaTime) {
        this.transitionEffects = this.transitionEffects.filter(effect => {
            effect.elapsed += deltaTime;
            
            if (effect.elapsed >= effect.duration) {
                return false;
            }
            
            const progress = effect.elapsed / effect.duration;
            this.updateTransitionEffect(effect, progress);
            
            return true;
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
    updateLightSources(deltaTime) {
        const currentTime = Date.now();
        
        this.lightSources.forEach(light => {
            if (!light.enabled) return;
            
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
            if (!effect.enabled) return;
            
            if (effect.duration) {
                effect.elapsed += deltaTime;
                if (effect.elapsed >= effect.duration) {
                    effect.enabled = false;
                }
            }
            
            // エフェクトタイプ別の更新処理
            this.updateBackgroundEffect(effect, deltaTime);
        });
        
        // 無効な効果を削除
        this.backgroundEffects = this.backgroundEffects.filter(effect => effect.enabled);
    }
    
    /**
     * 個別背景効果の更新
     */
    updateBackgroundEffect(effect, deltaTime) {
        switch (effect.effectType) {
            case 'particles':
                // パーティクル位置更新などの処理
                break;
            case 'rain':
            case 'snow':
                // 天候エフェクトの更新
                break;
            case 'fog':
            case 'clouds':
                // 雲・霧エフェクトの更新
                break;
        }
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
        
        // 拡張変換を適用
        this.applyEnhancedTransform(context);
    }
    
    /**
     * 後処理エフェクトを描画（オーバーライド）
     */
    renderPostEffects(context) {
        // 光源効果をレンダリング
        if (this.renderSettings.enableLighting) {
            this.renderLighting(context);
        }
        
        // 影をレンダリング
        if (this.renderSettings.enableShadows) {
            this.renderShadows(context);
        }
        
        // 反射をレンダリング
        if (this.renderSettings.enableReflections) {
            this.renderReflections(context);
        }
        
        // 背景効果をレンダリング
        this.renderBackgroundEffects(context);
        
        // 遷移効果をレンダリング
        this.renderTransitionEffects(context);
        
        // ポストプロセッシング効果
        if (this.renderSettings.enablePostProcessing) {
            this.renderPostProcessingEffects(context);
        }
        
        // 親クラスのオーバーレイ
        this.resetTransform(context);
        this.renderOverlays(context);
        
        context.restore();
    }
    
    /**
     * 拡張変換を適用
     */
    applyEnhancedTransform(context) {
        // モーションブラーフィルター
        if (this.enhancedTransform.motionBlur.intensity > 0) {
            const blur = this.enhancedTransform.motionBlur.intensity;
            context.filter += ` blur(${blur}px)`;
        }
        
        // 色収差は後処理で実装
    }
    
    /**
     * 光源効果をレンダリング
     */
    renderLighting(context) {
        if (this.lightSources.length === 0) return;
        
        // 光源に基づいた照明効果を描画
        const canvas = this.canvas;
        
        // 簡単な光源効果（本格的な実装では専用のライティングシステムが必要）
        this.lightSources.forEach(light => {
            if (!light.enabled) return;
            
            context.save();
            
            // 放射状グラデーション
            const gradient = context.createRadialGradient(
                light.x, light.y, 0,
                light.x, light.y, light.radius
            );
            
            const intensity = light.currentIntensity || light.intensity;
            const alpha = Math.min(intensity, 1.0);
            
            gradient.addColorStop(0, `rgba(${light.color.r}, ${light.color.g}, ${light.color.b}, ${alpha})`);
            gradient.addColorStop(1, `rgba(${light.color.r}, ${light.color.g}, ${light.color.b}, 0)`);
            
            context.globalCompositeOperation = 'screen';
            context.fillStyle = gradient;
            context.fillRect(
                light.x - light.radius,
                light.y - light.radius,
                light.radius * 2,
                light.radius * 2
            );
            
            context.restore();
        });
    }
    
    /**
     * 影をレンダリング
     */
    renderShadows(context) {
        if (this.shadowCasters.length === 0 || this.lightSources.length === 0) return;
        
        // 品質に基づいて影レンダリングを調整
        const qualityMultiplier = this.getQualityMultiplier();
        if (qualityMultiplier < 0.5 && this.renderSettings.qualityLevel === 'low') {
            return; // 低品質では影を描画しない
        }
        
        // 影マップ生成（高品質時）
        if (this.renderSettings.qualityLevel === 'ultra' || this.renderSettings.qualityLevel === 'high') {
            this.renderAdvancedShadows(context);
        } else {
            this.renderBasicShadows(context);
        }
    }
    
    /**
     * 基本的な影レンダリング
     */
    renderBasicShadows(context) {
        this.shadowCasters.forEach(caster => {
            if (!caster.enabled) return;
            
            this.lightSources.forEach(light => {
                if (!light.enabled || !light.castShadows) return;
                
                // 影の方向を計算
                const dx = caster.object.x - light.x;
                const dy = caster.object.y - light.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > light.radius) return;
                
                const shadowLength = 100 * (1 - distance / light.radius);
                const shadowX = caster.object.x + (dx / distance) * shadowLength;
                const shadowY = caster.object.y + (dy / distance) * shadowLength;
                
                context.save();
                context.globalAlpha = caster.opacity * (1 - distance / light.radius);
                
                // 影のソフトネス
                if (caster.shadowType === 'soft') {
                    context.filter = `blur(${caster.blur}px)`;
                }
                
                context.fillStyle = '#000000';
                context.globalCompositeOperation = 'multiply';
                
                // 対象オブジェクトの形状に基づいた影
                this.renderObjectShadow(context, caster.object, shadowX, shadowY, dx / distance, dy / distance);
                
                context.restore();
            });
        });
    }
    
    /**
     * 高度な影レンダリング
     */
    renderAdvancedShadows(context) {
        // バブル専用の影レンダリング
        this.shadowCasters.forEach(caster => {
            if (!caster.enabled) return;
            
            this.lightSources.forEach(light => {
                if (!light.enabled || !light.castShadows) return;
                
                const dx = caster.object.x - light.x;
                const dy = caster.object.y - light.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > light.radius) return;
                
                // 高品質バブル影
                this.renderBubbleShadow(context, caster.object, light, distance);
            });
        });
    }
    
    /**
     * オブジェクトの形状に基づいた影を描画
     */
    renderObjectShadow(context, object, shadowX, shadowY, dirX, dirY) {
        if (object.type === 'bubble') {
            // バブル用の楕円影
            const radius = object.size || 20;
            const scaleX = 1 + Math.abs(dirX) * 0.5;
            const scaleY = 0.3 + Math.abs(dirY) * 0.3;
            
            context.save();
            context.translate(shadowX, shadowY + radius * 0.8);
            context.scale(scaleX, scaleY);
            
            context.beginPath();
            context.arc(0, 0, radius * 0.8, 0, Math.PI * 2);
            context.fill();
            
            context.restore();
        } else {
            // 一般的な円形影
            context.beginPath();
            context.arc(shadowX, shadowY, 15, 0, Math.PI * 2);
            context.fill();
        }
    }
    
    /**
     * バブル専用の高品質影
     */
    renderBubbleShadow(context, bubble, light, distance) {
        const radius = bubble.size || 20;
        const intensity = light.currentIntensity || light.intensity;
        const shadowOpacity = 0.6 * intensity * (1 - distance / light.radius);
        
        if (shadowOpacity < 0.1) return;
        
        // 影の位置計算
        const lightAngle = Math.atan2(bubble.y - light.y, bubble.x - light.x);
        const shadowDistance = radius * 2.5;
        const shadowX = bubble.x + Math.cos(lightAngle) * shadowDistance;
        const shadowY = bubble.y + Math.sin(lightAngle) * shadowDistance + radius * 0.5;
        
        context.save();
        context.globalAlpha = shadowOpacity;
        context.globalCompositeOperation = 'multiply';
        
        // グラデーション影
        const gradient = context.createRadialGradient(
            shadowX, shadowY, 0,
            shadowX, shadowY, radius * 1.2
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
        gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        context.fillStyle = gradient;
        
        // 楕円形の影
        context.save();
        context.translate(shadowX, shadowY);
        context.scale(1, 0.4);
        context.beginPath();
        context.arc(0, 0, radius * 1.2, 0, Math.PI * 2);
        context.fill();
        context.restore();
        
        context.restore();
    }
    
    /**
     * 反射をレンダリング
     */
    renderReflections(context) {
        if (this.reflectionSurfaces.length === 0) return;
        
        // 品質に基づいて反射レンダリングを調整
        if (this.renderSettings.qualityLevel === 'low') {
            return; // 低品質では反射を描画しない
        }
        
        this.reflectionSurfaces.forEach(surface => {
            if (!surface.enabled) return;
            
            // 反射面のタイプに基づいて処理
            switch (surface.surface.type) {
                case 'water':
                    this.renderWaterReflection(context, surface);
                    break;
                case 'mirror':
                    this.renderMirrorReflection(context, surface);
                    break;
                case 'bubble':
                    this.renderBubbleReflection(context, surface);
                    break;
                default:
                    this.renderGenericReflection(context, surface);
                    break;
            }
        });
    }
    
    /**
     * 水面反射をレンダリング
     */
    renderWaterReflection(context, surface) {
        const waterLevel = surface.surface.y;
        const reflectivity = surface.reflectivity;
        
        context.save();
        context.globalAlpha = reflectivity * 0.6;
        context.globalCompositeOperation = 'multiply';
        
        // クリッピング領域を設定
        context.beginPath();
        context.rect(0, waterLevel, this.canvas.width, this.canvas.height - waterLevel);
        context.clip();
        
        // 反射変換
        context.scale(1, -1);
        context.translate(0, -waterLevel * 2);
        
        // 波紋効果
        const time = Date.now() * 0.001;
        const waveOffset = Math.sin(time * 2) * 2;
        context.translate(waveOffset, 0);
        
        // ここで反射させたいオブジェクトを描画
        // （実際の実装では、描画リストを受け取る必要がある）
        
        context.restore();
    }
    
    /**
     * 鏡面反射をレンダリング
     */
    renderMirrorReflection(context, surface) {
        const mirror = surface.surface;
        const reflectivity = surface.reflectivity;
        
        context.save();
        context.globalAlpha = reflectivity;
        context.globalCompositeOperation = 'screen';
        
        // 鏡面の角度に基づいた反射変換
        const angle = mirror.angle || 0;
        const centerX = mirror.x + mirror.width / 2;
        const centerY = mirror.y + mirror.height / 2;
        
        context.translate(centerX, centerY);
        context.rotate(angle);
        context.scale(1, -1);
        context.rotate(-angle);
        context.translate(-centerX, -centerY);
        
        // 反射領域のクリッピング
        context.beginPath();
        context.rect(mirror.x, mirror.y, mirror.width, mirror.height);
        context.clip();
        
        context.restore();
    }
    
    /**
     * バブル反射をレンダリング
     */
    renderBubbleReflection(context, surface) {
        const bubble = surface.surface;
        const reflectivity = surface.reflectivity;
        
        if (!bubble.x || !bubble.y || !bubble.size) return;
        
        context.save();
        
        // バブルの光沢効果
        this.renderBubbleGloss(context, bubble, reflectivity);
        
        // 環境反射
        if (this.renderSettings.qualityLevel === 'ultra' || this.renderSettings.qualityLevel === 'high') {
            this.renderBubbleEnvironmentReflection(context, bubble, reflectivity);
        }
        
        context.restore();
    }
    
    /**
     * バブルの光沢効果
     */
    renderBubbleGloss(context, bubble, reflectivity) {
        const radius = bubble.size || 20;
        const glossSize = radius * 0.3;
        const glossX = bubble.x - radius * 0.2;
        const glossY = bubble.y - radius * 0.3;
        
        // 主要な光沢
        const gradient = context.createRadialGradient(
            glossX, glossY, 0,
            glossX, glossY, glossSize
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${reflectivity * 0.8})`);
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${reflectivity * 0.4})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        context.fillStyle = gradient;
        context.globalCompositeOperation = 'screen';
        context.beginPath();
        context.arc(glossX, glossY, glossSize, 0, Math.PI * 2);
        context.fill();
        
        // 二次光沢
        const secondaryGlossSize = radius * 0.15;
        const secondaryGlossX = bubble.x + radius * 0.3;
        const secondaryGlossY = bubble.y + radius * 0.1;
        
        const secondaryGradient = context.createRadialGradient(
            secondaryGlossX, secondaryGlossY, 0,
            secondaryGlossX, secondaryGlossY, secondaryGlossSize
        );
        secondaryGradient.addColorStop(0, `rgba(255, 255, 255, ${reflectivity * 0.4})`);
        secondaryGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        context.fillStyle = secondaryGradient;
        context.beginPath();
        context.arc(secondaryGlossX, secondaryGlossY, secondaryGlossSize, 0, Math.PI * 2);
        context.fill();
    }
    
    /**
     * バブルの環境反射
     */
    renderBubbleEnvironmentReflection(context, bubble, reflectivity) {
        const radius = bubble.size || 20;
        
        // バブル表面での環境光反射
        this.lightSources.forEach(light => {
            if (!light.enabled) return;
            
            const dx = light.x - bubble.x;
            const dy = light.y - bubble.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > light.radius + radius) return;
            
            // 反射点の計算
            const reflectionAngle = Math.atan2(dy, dx);
            const reflectionX = bubble.x + Math.cos(reflectionAngle) * radius * 0.8;
            const reflectionY = bubble.y + Math.sin(reflectionAngle) * radius * 0.8;
            
            // 光源からの反射光
            const intensity = (light.currentIntensity || light.intensity) * reflectivity;
            const lightInfluence = Math.max(0, 1 - distance / light.radius);
            
            const reflectionGradient = context.createRadialGradient(
                reflectionX, reflectionY, 0,
                reflectionX, reflectionY, radius * 0.4
            );
            
            const alpha = intensity * lightInfluence * 0.3;
            reflectionGradient.addColorStop(0, `rgba(${light.color.r}, ${light.color.g}, ${light.color.b}, ${alpha})`);
            reflectionGradient.addColorStop(1, `rgba(${light.color.r}, ${light.color.g}, ${light.color.b}, 0)`);
            
            context.fillStyle = reflectionGradient;
            context.globalCompositeOperation = 'screen';
            context.beginPath();
            context.arc(reflectionX, reflectionY, radius * 0.4, 0, Math.PI * 2);
            context.fill();
        });
    }
    
    /**
     * 汎用反射をレンダリング
     */
    renderGenericReflection(context, surface) {
        context.save();
        context.globalAlpha = surface.reflectivity;
        context.globalCompositeOperation = 'multiply';
        
        // ぼかし効果
        if (surface.blur > 0) {
            context.filter = `blur(${surface.blur}px)`;
        }
        
        // 簡単な反射効果
        const obj = surface.surface;
        if (obj.x !== undefined && obj.y !== undefined) {
            const gradient = context.createRadialGradient(
                obj.x, obj.y, 0,
                obj.x, obj.y, 50
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            context.fillStyle = gradient;
            context.beginPath();
            context.arc(obj.x, obj.y, 50, 0, Math.PI * 2);
            context.fill();
        }
        
        context.restore();
    }
    
    /**
     * 背景効果をレンダリング
     */
    renderBackgroundEffects(context) {
        this.backgroundEffects.forEach(effect => {
            if (!effect.enabled) return;
            
            switch (effect.effectType) {
                case 'particles':
                    this.renderParticleBackground(context, effect);
                    break;
                case 'rain':
                    this.renderRainEffect(context, effect);
                    break;
                case 'snow':
                    this.renderSnowEffect(context, effect);
                    break;
                case 'fog':
                    this.renderFogEffect(context, effect);
                    break;
                case 'stars':
                    this.renderStarsEffect(context, effect);
                    break;
            }
        });
    }
    
    /**
     * パーティクル背景をレンダリング
     */
    renderParticleBackground(context, effect) {
        const particleCount = Math.floor(effect.intensity * effect.options.density * 50);
        const time = Date.now() * 0.001;
        
        context.save();
        context.globalAlpha = effect.options.opacity;
        context.fillStyle = effect.options.color;
        
        for (let i = 0; i < particleCount; i++) {
            const x = (i * 123.456 + time * effect.options.speed * 10) % this.canvas.width;
            const y = (i * 78.9 + time * effect.options.speed * 5) % this.canvas.height;
            const size = effect.options.size * (0.5 + Math.sin(i + time) * 0.5);
            
            context.beginPath();
            context.arc(x, y, size, 0, Math.PI * 2);
            context.fill();
        }
        
        context.restore();
    }
    
    /**
     * 雨効果をレンダリング
     */
    renderRainEffect(context, effect) {
        const dropCount = Math.floor(effect.intensity * 100);
        const time = Date.now() * 0.001;
        
        context.save();
        context.globalAlpha = 0.7;
        context.strokeStyle = effect.options.color;
        context.lineWidth = 1;
        
        for (let i = 0; i < dropCount; i++) {
            const x = (i * 73.2 + time * effect.options.speed * 200) % (this.canvas.width + 100);
            const y = (i * 41.7 + time * effect.options.speed * 300) % (this.canvas.height + 100);
            const length = 10 + Math.sin(i) * 5;
            
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x - length * 0.3, y + length);
            context.stroke();
        }
        
        context.restore();
    }
    
    /**
     * 雪効果をレンダリング
     */
    renderSnowEffect(context, effect) {
        const flakeCount = Math.floor(effect.intensity * 50);
        const time = Date.now() * 0.001;
        
        context.save();
        context.globalAlpha = 0.8;
        context.fillStyle = effect.options.color;
        
        for (let i = 0; i < flakeCount; i++) {
            const x = (i * 91.3 + time * effect.options.speed * 20 + Math.sin(time + i) * 20) % this.canvas.width;
            const y = (i * 67.1 + time * effect.options.speed * 50) % (this.canvas.height + 20);
            const size = 2 + Math.sin(i) * 2;
            
            context.beginPath();
            context.arc(x, y, size, 0, Math.PI * 2);
            context.fill();
        }
        
        context.restore();
    }
    
    /**
     * 霧効果をレンダリング
     */
    renderFogEffect(context, effect) {
        context.save();
        context.globalAlpha = effect.options.opacity * effect.intensity;
        context.fillStyle = effect.options.color;
        context.globalCompositeOperation = 'multiply';
        
        // 簡単な霧効果
        const gradient = context.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, `rgba(200, 200, 200, ${effect.intensity * 0.1})`);
        gradient.addColorStop(0.5, `rgba(200, 200, 200, ${effect.intensity * 0.3})`);
        gradient.addColorStop(1, `rgba(200, 200, 200, ${effect.intensity * 0.1})`);
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        context.restore();
    }
    
    /**
     * 星効果をレンダリング
     */
    renderStarsEffect(context, effect) {
        const starCount = Math.floor(effect.intensity * 100);
        const time = Date.now() * 0.001;
        
        context.save();
        context.fillStyle = effect.options.color;
        
        for (let i = 0; i < starCount; i++) {
            const x = (i * 113.7) % this.canvas.width;
            const y = (i * 89.3) % this.canvas.height;
            const twinkle = Math.sin(time * 2 + i) * 0.5 + 0.5;
            const size = effect.options.size * twinkle;
            
            context.globalAlpha = effect.options.opacity * twinkle;
            context.beginPath();
            context.arc(x, y, size, 0, Math.PI * 2);
            context.fill();
        }
        
        context.restore();
    }
    
    /**
     * 遷移効果をレンダリング
     */
    renderTransitionEffects(context) {
        this.transitionEffects.forEach(effect => {
            const progress = effect.currentProgress || 0;
            
            switch (effect.transitionType) {
                case 'fade':
                    this.renderFadeTransition(context, effect, progress);
                    break;
                case 'slide':
                    this.renderSlideTransition(context, effect, progress);
                    break;
                case 'zoom':
                    this.renderZoomTransition(context, effect, progress);
                    break;
                case 'wipe':
                    this.renderWipeTransition(context, effect, progress);
                    break;
                case 'dissolve':
                    this.renderDissolveTransition(context, effect, progress);
                    break;
            }
        });
    }
    
    /**
     * フェード遷移をレンダリング
     */
    renderFadeTransition(context, effect, progress) {
        const alpha = effect.options.direction === 'in' ? progress : (1 - progress);
        
        context.save();
        context.globalAlpha = alpha;
        context.fillStyle = effect.options.color;
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        context.restore();
    }
    
    /**
     * スライド遷移をレンダリング
     */
    renderSlideTransition(context, effect, progress) {
        const canvas = this.canvas;
        let offsetX = 0, offsetY = 0;
        
        switch (effect.options.slideDirection) {
            case 'left':
                offsetX = -canvas.width * progress;
                break;
            case 'right':
                offsetX = canvas.width * progress;
                break;
            case 'up':
                offsetY = -canvas.height * progress;
                break;
            case 'down':
                offsetY = canvas.height * progress;
                break;
        }
        
        context.save();
        context.fillStyle = effect.options.color || '#000000';
        context.fillRect(
            offsetX,
            offsetY,
            canvas.width,
            canvas.height
        );
        context.restore();
    }
    
    /**
     * ズーム遷移をレンダリング
     */
    renderZoomTransition(context, effect, progress) {
        const scale = effect.options.zoomType === 'in' ? progress : (1 - progress);
        const center = effect.options.center;
        
        context.save();
        context.translate(center.x, center.y);
        context.scale(scale, scale);
        context.translate(-center.x, -center.y);
        
        context.globalAlpha = 1 - progress;
        context.fillStyle = effect.options.color || '#000000';
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        context.restore();
    }
    
    /**
     * ワイプ遷移をレンダリング
     */
    renderWipeTransition(context, effect, progress) {
        const canvas = this.canvas;
        
        context.save();
        context.fillStyle = effect.options.color || '#000000';
        
        switch (effect.options.pattern) {
            case 'horizontal':
                const width = canvas.width * progress;
                context.fillRect(0, 0, width, canvas.height);
                break;
            case 'vertical':
                const height = canvas.height * progress;
                context.fillRect(0, 0, canvas.width, height);
                break;
            case 'circular':
                const radius = Math.max(canvas.width, canvas.height) * progress;
                context.beginPath();
                context.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
                context.fill();
                break;
        }
        
        context.restore();
    }
    
    /**
     * ディゾルブ遷移をレンダリング
     */
    renderDissolveTransition(context, effect, progress) {
        // ノイズベースのディゾルブ効果（簡易版）
        const canvas = this.canvas;
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random();
            if (noise < progress * effect.options.threshold) {
                data[i + 3] = 0; // アルファ値を0に
            }
        }
        
        context.putImageData(imageData, 0, 0);
    }
    
    /**
     * ポストプロセッシング効果をレンダリング
     */
    renderPostProcessingEffects(context) {
        const canvas = this.canvas;
        
        // ビネット効果
        if (this.enhancedTransform.vignette > 0) {
            context.save();
            const gradient = context.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(1, `rgba(0, 0, 0, ${this.enhancedTransform.vignette})`);
            
            context.globalCompositeOperation = 'multiply';
            context.fillStyle = gradient;
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.restore();
        }
        
        // ノイズ効果
        if (this.enhancedTransform.noise > 0) {
            this.renderNoiseEffect(context);
        }
        
        // スキャンライン効果
        if (this.enhancedTransform.scanlines > 0) {
            this.renderScanlinesEffect(context);
        }
        
        // グリッチ効果
        if (this.enhancedTransform.glitch.intensity > 0) {
            this.renderGlitchEffect(context);
        }
    }
    
    /**
     * ノイズ効果をレンダリング
     */
    renderNoiseEffect(context) {
        const canvas = this.canvas;
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const intensity = this.enhancedTransform.noise * 50;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * intensity;
            data[i] += noise;     // R
            data[i + 1] += noise; // G
            data[i + 2] += noise; // B
        }
        
        context.putImageData(imageData, 0, 0);
    }
    
    /**
     * スキャンライン効果をレンダリング
     */
    renderScanlinesEffect(context) {
        const canvas = this.canvas;
        context.save();
        context.globalAlpha = this.enhancedTransform.scanlines;
        context.globalCompositeOperation = 'multiply';
        
        for (let y = 0; y < canvas.height; y += 4) {
            context.fillStyle = 'rgba(0, 0, 0, 0.1)';
            context.fillRect(0, y, canvas.width, 2);
        }
        
        context.restore();
    }
    
    /**
     * グリッチ効果をレンダリング
     */
    renderGlitchEffect(context) {
        const canvas = this.canvas;
        const intensity = this.enhancedTransform.glitch.intensity;
        
        if (Math.random() < intensity) {
            // 水平ずれ
            const sliceHeight = 10;
            const offset = (Math.random() - 0.5) * intensity * 20;
            
            for (let y = 0; y < canvas.height; y += sliceHeight) {
                if (Math.random() < intensity) {
                    const imageData = context.getImageData(0, y, canvas.width, sliceHeight);
                    context.putImageData(imageData, offset, y);
                }
            }
        }
    }
    
    /**
     * 深度ブラー効果を適用
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
     * バブル表面の光沢とリフレクションを統合描画
     */
    renderBubbleCompleteReflectionSystem(context, bubble) {
        if (!this.renderSettings.enableReflections || this.renderSettings.qualityLevel === 'low') {
            return;
        }
        
        // バブル反射面を自動追加
        const reflectionSurface = {
            surface: { ...bubble, type: 'bubble' },
            reflectivity: 0.7,
            blur: 0,
            enabled: true
        };
        
        this.renderBubbleReflection(context, reflectionSurface);
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
     * 品質レベルを設定
     */
    setQualityLevel(level) {
        if (['low', 'medium', 'high', 'ultra'].includes(level)) {
            this.renderSettings.qualityLevel = level;
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
     * リソースクリーンアップ
     */
    dispose() {
        super.dispose();
        this.clearEnhancedEffects();
        console.log('[EnhancedEffectManager] リソースをクリーンアップしました');
    }
}