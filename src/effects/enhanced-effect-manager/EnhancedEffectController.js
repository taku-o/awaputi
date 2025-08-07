import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * Enhanced Effect Controller
 * 拡張効果の制御・管理ロジック - パフォーマンス監視、設定管理、効果生成
 */
export class EnhancedEffectController {
    constructor(canvas) {
        this.canvas = canvas;
        this.errorHandler = getErrorHandler();
        
        // 効果配列
        this.transitionEffects = [];
        this.lightSources = [];
        this.backgroundEffects = [];
        this.shadowCasters = [];
        this.reflectionSurfaces = [];
        
        // ID生成カウンター
        this.effectId = 1;
        
        // パフォーマンス監視
        this.performanceMetrics = {
            effectCount: 0,
            renderTime: 0,
            memoryUsage: 0,
            lastFrameTime: 0
        };
        
        console.log('[EnhancedEffectController] 拡張効果コントローラーを初期化しました');
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
            console.log(`[EnhancedEffectController] 影効果を追加: ID ${shadowEffect.id}`);
            return shadowEffect.id;
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'EnhancedEffectController.addShadowEffect'
            });
            return -1;
        }
    }
    
    /**
     * 反射効果を追加
     */
    addReflectionEffect(reflectionObject, surfaceY, intensity = 0.8, distortion = 0.1) {
        try {
            const reflectionEffect = {
                id: this.effectId++,
                type: 'reflection',
                reflectionObject: reflectionObject,
                surfaceY: surfaceY,
                intensity: intensity,
                distortion: distortion,
                ripples: [],
                created: Date.now()
            };
            
            this.reflectionSurfaces.push(reflectionEffect);
            console.log(`[EnhancedEffectController] 反射効果を追加: ID ${reflectionEffect.id}`);
            return reflectionEffect.id;
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'EnhancedEffectController.addReflectionEffect'
            });
            return -1;
        }
    }
    
    /**
     * 水面リップル効果を追加（反射効果の一部）
     */
    addWaterRipple(x, y, maxRadius = 50, speed = 2, intensity = 1.0) {
        try {
            // 対応する反射効果を検索して追加
            this.reflectionSurfaces.forEach(surface => {
                if (Math.abs(surface.surfaceY - y) < 10) {
                    surface.ripples.push({
                        x, y,
                        radius: 0,
                        maxRadius,
                        speed,
                        intensity,
                        lifetime: 0
                    });
                }
            });
            
            console.log(`[EnhancedEffectController] 水面リップル効果を追加: (${x}, ${y})`);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'EnhancedEffectController.addWaterRipple'
            });
        }
    }
    
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
                type, // 'point', 'directional', 'spot'
                animated: false,
                animation: null,
                created: Date.now()
            };
            
            this.lightSources.push(lightSource);
            console.log(`[EnhancedEffectController] 光源を追加: ${type} at (${x}, ${y})`);
            return lightSource.id;
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'EnhancedEffectController.addLightSource'
            });
            return -1;
        }
    }
    
    /**
     * 背景効果を追加
     */
    addBackgroundEffect(type, options = {}) {
        try {
            const backgroundEffect = {
                id: this.effectId++,
                type: type, // 'particles', 'weather', 'environment'
                options: {
                    density: options.density || 1.0,
                    speed: options.speed || 1.0,
                    color: options.color || '#ffffff',
                    size: options.size || 1.0,
                    opacity: options.opacity || 0.5,
                    ...options
                },
                particles: [],
                active: true,
                created: Date.now()
            };
            
            this.backgroundEffects.push(backgroundEffect);
            console.log(`[EnhancedEffectController] 背景効果を追加: ${type}`);
            return backgroundEffect.id;
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'EnhancedEffectController.addBackgroundEffect'
            });
            return -1;
        }
    }
    
    /**
     * 効果を削除
     */
    removeEffect(effectId) {
        try {
            // 各配列から効果を削除
            this.transitionEffects = this.transitionEffects.filter(effect => effect.id !== effectId);
            this.lightSources = this.lightSources.filter(light => light.id !== effectId);
            this.backgroundEffects = this.backgroundEffects.filter(bg => bg.id !== effectId);
            this.shadowCasters = this.shadowCasters.filter(shadow => shadow.id !== effectId);
            this.reflectionSurfaces = this.reflectionSurfaces.filter(reflection => reflection.id !== effectId);
            
            console.log(`[EnhancedEffectController] 効果を削除: ID ${effectId}`);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'EnhancedEffectController.removeEffect'
            });
        }
    }
    
    /**
     * すべての効果をクリア
     */
    clearAllEffects() {
        try {
            this.transitionEffects = [];
            this.lightSources = [];
            this.backgroundEffects = [];
            this.shadowCasters = [];
            this.reflectionSurfaces = [];
            
            console.log('[EnhancedEffectController] すべての効果をクリアしました');
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'EnhancedEffectController.clearAllEffects'
            });
        }
    }
    
    /**
     * パフォーマンスメトリクスを更新
     */
    updatePerformanceMetrics(renderTime) {
        try {
            this.performanceMetrics.effectCount = 
                this.transitionEffects.length + 
                this.lightSources.length + 
                this.backgroundEffects.length + 
                this.shadowCasters.length + 
                this.reflectionSurfaces.length;
            
            this.performanceMetrics.renderTime = renderTime;
            this.performanceMetrics.lastFrameTime = Date.now();
            
            // メモリ使用量の概算
            this.performanceMetrics.memoryUsage = this.performanceMetrics.effectCount * 1024; // 簡易計算
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'EnhancedEffectController.updatePerformanceMetrics'
            });
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
        return Math.min(distance * 0.1, 20); // 最大20ピクセル
    }
}