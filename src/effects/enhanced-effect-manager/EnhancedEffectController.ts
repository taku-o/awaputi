import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * Shadow object interface
 */
interface ShadowObject { x: number,
    y: number,
    width?: number;
    height?: number;
    radius?: number; }
}

/**
 * Light source base interface
 */
interface LightSourceBase { x: number,
    y: number,
    intensity: number,
    color: string,
    radius: number; }
}

/**
 * Light source type'
 */''
type LightSourceType = 'point' | 'directional' | 'spot';

/**
 * Light source interface
 */
interface LightSource extends LightSourceBase { id: number,
    type: LightSourceType,
    animated: boolean,
    animation: any | null,
    created: number; }
}

/**
 * Shadow effect interface
 */'
interface ShadowEffect { id: number,''
    type: 'shadow',
    shadowObject: ShadowObject,
    lightSource: LightSourceBase,
    opacity: number,
    blur: number,
    direction: number,
    distance: number,
    created: number; }
}

/**
 * Reflection object interface
 */
interface ReflectionObject { x: number,
    y: number,
    width?: number;
    height?: number;
    image?: HTMLImageElement;
    }
}

/**
 * Water ripple interface
 */
interface WaterRipple { x: number,
    y: number,
    radius: number,
    maxRadius: number,
    speed: number,
    intensity: number,
    lifetime: number; }
}

/**
 * Reflection effect interface
 */'
interface ReflectionEffect { id: number,''
    type: 'reflection',
    reflectionObject: ReflectionObject,
    surfaceY: number,
    intensity: number,
    distortion: number,
    ripples: WaterRipple[],
    created: number; }
}

/**
 * Background effect type'
 */''
type BackgroundEffectType = 'particles' | 'weather' | 'environment';

/**
 * Background effect options interface
 */
interface BackgroundEffectOptions { density?: number;
    speed?: number;
    color?: string;
    size?: number;
    opacity?: number;
    [key: string]: any }
}

/**
 * Background effect interface
 */
interface BackgroundEffect { id: number,
    type: BackgroundEffectType,
    options: BackgroundEffectOptions,
    particles: any[],
    active: boolean,
    created: number; }
}

/**
 * Transition effect interface
 */
interface TransitionEffect { id: number,
    type: string,
    [key: string]: any, }
}

/**
 * Performance metrics interface
 */
interface PerformanceMetrics { effectCount: number,
    renderTime: number,
    memoryUsage: number,
    lastFrameTime: number; }
}

/**
 * Error handler interface
 */
interface ErrorHandler { handleError(error: any, details?: any): void; }
}

/**
 * Enhanced Effect Controller
 * 拡張効果の制御・管理ロジック - パフォーマンス監視、設定管理、効果生成
 */
export class EnhancedEffectController {
    private canvas: HTMLCanvasElement;
    private errorHandler: ErrorHandler;
    private transitionEffects: TransitionEffect[];
    private lightSources: LightSource[];
    private backgroundEffects: BackgroundEffect[];
    private shadowCasters: ShadowEffect[];
    private reflectionSurfaces: ReflectionEffect[];
    private effectId: number;
    private performanceMetrics: PerformanceMetrics;
    constructor(canvas: HTMLCanvasElement) {
';
        this.canvas = canvas;''
        this.errorHandler = getErrorHandler('';
    }
    })'
        console.log('[EnhancedEffectController] 拡張効果コントローラーを初期化しました'); }
    }
    
    /**
     * 影効果を追加'
     */''
    addShadowEffect(shadowObject: ShadowObject, lightSource: LightSourceBase'): number { try {
            const shadowEffect: ShadowEffect = {'
                id: this.effectId++,'';
                type: 'shadow',
                shadowObject: shadowObject,
                lightSource: lightSource,
                opacity: 0.6,
                blur: 2,
                direction: this._calculateShadowDirection(shadowObject, lightSource),
                distance: this._calculateShadowDistance(shadowObject, lightSource),
                created: Date.now(); }
            };
            
            this.shadowCasters.push(shadowEffect);
            console.log(`[EnhancedEffectController] 影効果を追加: ID ${shadowEffect.id)`});'
            return shadowEffect.id;''
        } catch (error') { this.errorHandler.handleError(error, {')'
                context: 'EnhancedEffectController.addShadowEffect'); }
            });
            return -1;
        }
    }
    
    /**
     * 反射効果を追加'
     */''
    addReflectionEffect(reflectionObject: ReflectionObject, surfaceY: number, intensity: number = 0.8, distortion: number = 0.1'): number { try {
            const reflectionEffect: ReflectionEffect = {'
                id: this.effectId++,'';
                type: 'reflection',
                reflectionObject: reflectionObject,
                surfaceY: surfaceY,
                intensity: intensity,
                distortion: distortion,
                ripples: [],
                created: Date.now(); }
            };
            
            this.reflectionSurfaces.push(reflectionEffect);
            console.log(`[EnhancedEffectController] 反射効果を追加: ID ${reflectionEffect.id)`});'
            return reflectionEffect.id;''
        } catch (error') { this.errorHandler.handleError(error, {')'
                context: 'EnhancedEffectController.addReflectionEffect'); }
            });
            return -1;
        }
    }
    
    /**
     * 水面リップル効果を追加（反射効果の一部）
     */
    addWaterRipple(x: number, y: number, maxRadius: number = 50, speed: number = 2, intensity: number = 1.0): void { try {
            // 対応する反射効果を検索して追加
            this.reflectionSurfaces.forEach(surface => { );
                if (Math.abs(surface.surfaceY - y) < 10) {
                    surface.ripples.push({
                        x, y,
                        radius: 0,
                        maxRadius,);
                        speed);
                        intensity,) }
                        lifetime: 0); }
                    });
                }
            });
            ';
            console.log(`[EnhancedEffectController] 水面リップル効果を追加: (${x}, ${y)`});''
        } catch (error') { this.errorHandler.handleError(error, {')'
                context: 'EnhancedEffectController.addWaterRipple'),' }'
            }');
        }
    }
    
    /**
     * 光源を追加'
     */''
    addLightSource(x: number, y: number, intensity: number, color: string, radius: number, type: LightSourceType = 'point''): number { try {
            const lightSource: LightSource = {
                id: this.effectId++,
                x, y,
                intensity,
                color: color,';
                radius,'';
                type, // 'point', 'directional', 'spot';
                animated: false,
                animation: null,
                created: Date.now(); }
            };
            
            this.lightSources.push(lightSource);
            console.log(`[EnhancedEffectController] 光源を追加: ${type} at (${x}, ${y)`});'
            return lightSource.id;''
        } catch (error') { this.errorHandler.handleError(error, {')'
                context: 'EnhancedEffectController.addLightSource'); }
            });
            return -1;
        }
    }
    
    /**
     * 背景効果を追加'
     */''
    addBackgroundEffect(type: BackgroundEffectType, options: BackgroundEffectOptions = { )'): number {
        try {
            const backgroundEffect: BackgroundEffect = {'
                id: this.effectId++,'';
                type: type, // 'particles', 'weather', 'environment';
                options: {
                    density: options.density || 1.0,';
                    speed: options.speed || 1.0,'';
                    color: options.color || '#ffffff',
                    size: options.size || 1.0,
                    opacity: options.opacity || 0.5,
                    ...options }
                },
                particles: [],
                active: true,
                created: Date.now(),
            };
            
            this.backgroundEffects.push(backgroundEffect);
            console.log(`[EnhancedEffectController] 背景効果を追加: ${type)`});'
            return backgroundEffect.id;''
        } catch (error') { this.errorHandler.handleError(error, {')'
                context: 'EnhancedEffectController.addBackgroundEffect'); }
            });
            return -1;
        }
    }
    
    /**
     * 効果を削除
     */
    removeEffect(effectId: number): void { try {
            // 各配列から効果を削除
            this.transitionEffects = this.transitionEffects.filter(effect => effect.id !== effectId);
            this.lightSources = this.lightSources.filter(light => light.id !== effectId);
            this.backgroundEffects = this.backgroundEffects.filter(bg => bg.id !== effectId);
            this.shadowCasters = this.shadowCasters.filter(shadow => shadow.id !== effectId);
            this.reflectionSurfaces = this.reflectionSurfaces.filter(reflection => reflection.id !== effectId);
             }'
            console.log(`[EnhancedEffectController] 効果を削除: ID ${effectId)`});''
        } catch (error') { this.errorHandler.handleError(error, {')'
                context: 'EnhancedEffectController.removeEffect'); }
            });
        }
    }
    
    /**
     * すべての効果をクリア'
     */''
    clearAllEffects('')';
            console.log('[EnhancedEffectController] すべての効果をクリアしました');''
        } catch (error') { this.errorHandler.handleError(error, {')'
                context: 'EnhancedEffectController.clearAllEffects'); }
            });
        }
    }
    
    /**
     * パフォーマンスメトリクスを更新
     */
    updatePerformanceMetrics(renderTime: number): void { try {
            this.performanceMetrics.effectCount = ;
                this.transitionEffects.length + ;
                this.lightSources.length + ;
                this.backgroundEffects.length + ;
                this.shadowCasters.length + ;
                this.reflectionSurfaces.length;
            
            this.performanceMetrics.renderTime = renderTime;
            this.performanceMetrics.lastFrameTime = Date.now();
            
            // メモリ使用量の概算
            this.performanceMetrics.memoryUsage = this.performanceMetrics.effectCount * 1024; // 簡易計算'
            ' }'
        } catch (error') { this.errorHandler.handleError(error, {')'
                context: 'EnhancedEffectController.updatePerformanceMetrics'); }
            });
        }
    }
    
    /**
     * 影の方向を計算
     */
    private _calculateShadowDirection(shadowObject: ShadowObject, lightSource: LightSourceBase): number { const dx = shadowObject.x - lightSource.x;
        const dy = shadowObject.y - lightSource.y;
        return Math.atan2(dy, dx); }
    }
    
    /**
     * 影の距離を計算
     */
    private _calculateShadowDistance(shadowObject: ShadowObject, lightSource: LightSourceBase): number { const dx = shadowObject.x - lightSource.x;
        const dy = shadowObject.y - lightSource.y;'
        const distance = Math.sqrt(dx * dx + dy * dy);''
        return Math.min(distance * 0.1, 20'); // 最大20ピクセル }'
    }''
}