import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * Effect API Manager
 * 公開API管理 - 遷移効果、設定管理、アクセシビリティ統合
 */
export class EffectApiManager {
    constructor(canvas, effectController) {
        this.canvas = canvas;
        this.effectController = effectController;
        this.errorHandler = getErrorHandler();
        
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
        
        // 拡張変換状態
        this.enhancedTransform = {
            depthOfField: 0,
            motionBlur: { x: 0, y: 0, intensity: 0 },
            chromatic: 0,
            vignette: 0,
            noise: 0,
            scanlines: 0,
            glitch: { intensity: 0, frequency: 0 }
        };
        
        console.log('[EffectApiManager] API管理システムを初期化しました');
    }
    
    // ========================================
    // 画面遷移効果API
    // ========================================
    
    /**
     * 画面遷移効果を追加
     */
    addTransitionEffect(type, duration, options = {}) {
        try {
            const effect = {
                id: this.effectController.effectId++,
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
            
            this.effectController.transitionEffects.push(effect);
            console.log(`[EffectApiManager] 遷移効果を追加: ${type} (${duration}ms)`);
            return effect.id;
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'EffectApiManager.addTransitionEffect'
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
    // 設定管理API
    // ========================================
    
    /**
     * レンダリング設定を更新
     */
    updateRenderSettings(newSettings) {
        try {
            this.renderSettings = { ...this.renderSettings, ...newSettings };
            console.log('[EffectApiManager] レンダリング設定を更新しました', newSettings);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'EffectApiManager.updateRenderSettings'
            });
        }
    }
    
    /**
     * 品質レベルを設定
     */
    setQualityLevel(level) {
        try {
            this.renderSettings.qualityLevel = level;
            
            // 品質レベルに応じた設定調整
            switch (level) {
                case 'low':
                    this.renderSettings.enableLighting = false;
                    this.renderSettings.enableShadows = false;
                    this.renderSettings.enableReflections = false;
                    this.renderSettings.enablePostProcessing = false;
                    break;
                case 'medium':
                    this.renderSettings.enableLighting = true;
                    this.renderSettings.enableShadows = false;
                    this.renderSettings.enableReflections = false;
                    this.renderSettings.enablePostProcessing = true;
                    break;
                case 'high':
                    this.renderSettings.enableLighting = true;
                    this.renderSettings.enableShadows = true;
                    this.renderSettings.enableReflections = false;
                    this.renderSettings.enablePostProcessing = true;
                    break;
                case 'ultra':
                    this.renderSettings.enableLighting = true;
                    this.renderSettings.enableShadows = true;
                    this.renderSettings.enableReflections = true;
                    this.renderSettings.enablePostProcessing = true;
                    break;
            }
            
            console.log(`[EffectApiManager] 品質レベルを${level}に設定しました`);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'EffectApiManager.setQualityLevel'
            });
        }
    }
    
    /**
     * パフォーマンス最適化を有効化
     */
    enableOptimization(enabled) {
        try {
            this.renderSettings.enableBatching = enabled;
            this.renderSettings.reducedEffects = enabled;
            
            console.log(`[EffectApiManager] パフォーマンス最適化を${enabled ? '有効' : '無効'}にしました`);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'EffectApiManager.enableOptimization'
            });
        }
    }
    
    /**
     * 遷移スムージングを設定
     */
    setTransitionSmoothing(enabled, duration = 300) {
        try {
            this.renderSettings.transitionSmoothing = enabled;
            this.renderSettings.transitionDuration = duration;
            
            console.log(`[EffectApiManager] 遷移スムージング: ${enabled ? '有効' : '無効'} (${duration}ms)`);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'EffectApiManager.setTransitionSmoothing'
            });
        }
    }
    
    // ========================================
    // 拡張変換API
    // ========================================
    
    /**
     * 被写界深度を設定
     */
    setDepthOfField(intensity) {
        try {
            this.enhancedTransform.depthOfField = Math.max(0, Math.min(1, intensity));
            console.log(`[EffectApiManager] 被写界深度を設定: ${intensity}`);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'EffectApiManager.setDepthOfField'
            });
        }
    }
    
    /**
     * モーションブラーを設定
     */
    setMotionBlur(x, y, intensity) {
        try {
            this.enhancedTransform.motionBlur = { x, y, intensity };
            console.log(`[EffectApiManager] モーションブラーを設定: (${x}, ${y}, ${intensity})`);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'EffectApiManager.setMotionBlur'
            });
        }
    }
    
    /**
     * 色収差を設定
     */
    setChromaticAberration(intensity) {
        try {
            this.enhancedTransform.chromatic = Math.max(0, Math.min(1, intensity));
            console.log(`[EffectApiManager] 色収差を設定: ${intensity}`);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'EffectApiManager.setChromaticAberration'
            });
        }
    }
    
    /**
     * ビネット効果を設定
     */
    setVignette(intensity) {
        try {
            this.enhancedTransform.vignette = Math.max(0, Math.min(1, intensity));
            console.log(`[EffectApiManager] ビネット効果を設定: ${intensity}`);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'EffectApiManager.setVignette'
            });
        }
    }
    
    /**
     * グリッチ効果を設定
     */
    setGlitchEffect(intensity, frequency) {
        try {
            this.enhancedTransform.glitch = { 
                intensity: Math.max(0, Math.min(1, intensity)),
                frequency: Math.max(0, frequency)
            };
            console.log(`[EffectApiManager] グリッチ効果を設定: ${intensity}, ${frequency}`);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'EffectApiManager.setGlitchEffect'
            });
        }
    }
    
    // ========================================
    // ユーティリティAPI
    // ========================================
    
    /**
     * 現在の設定を取得
     */
    getCurrentSettings() {
        return {
            renderSettings: { ...this.renderSettings },
            enhancedTransform: { ...this.enhancedTransform }
        };
    }
    
    /**
     * パフォーマンスメトリクスを取得
     */
    getPerformanceMetrics() {
        return { ...this.effectController.performanceMetrics };
    }
}