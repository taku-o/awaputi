import { getEffectsConfig } from '../config/EffectsConfig.js';
import { getErrorHandler } from '../utils/ErrorHandler.js';

// Effect Manager types
export interface ColorRGBA {
    r: number;
    g: number;
    b: number;
    a: number;
}

export interface CurrentTransform {
    shake: { x: number; y: number };
    zoom: number;
    rotation: number;
    flash: ColorRGBA;
    tint: ColorRGBA;
    blur: number;
    contrast: number;
    brightness: number;
    saturation: number;
}

export interface Transforms {
    shakeX: number[];
    shakeY: number[];
    zoom: number[];
    rotation: number[];
    flash: ColorRGBA[];
    tint: ColorRGBA[];
    blur: number[];
    contrast: number[];
    brightness: number[];
    saturation: number[];
}

export interface EffectParameters {
    shakeIntensity: number;
    flashDuration: number;
    zoomSensitivity: number;
    enabled: boolean;
    shake: {
        duration: number;
        damping: number;
    };
    flash: {
        intensity: number;
    };
    zoom: {
        duration: number;
        easing: string;
    };
    tint: {
        intensity: number;
        duration: number;
    };
}

export interface BaseEffect {
    id: number;
    type: EffectType;
    duration: number;
    elapsed: number;
}

export interface ShakeEffect extends BaseEffect {
    type: 'shake';
    intensity: number;
    shakeType: ShakeType;
    frequency: number;
    damping: number;
}

export interface FlashEffect extends BaseEffect {
    type: 'flash';
    color: ColorRGBA;
    intensity: number;
    fadeType: FadeType;
}

export interface TintEffect extends BaseEffect {
    type: 'tint';
    color: ColorRGBA;
    intensity: number;
    easing: string;
}

export interface ZoomEffect extends BaseEffect {
    type: 'zoom';
    targetZoom: number;
    startZoom: number;
    easing: string;
}

export interface RotationEffect extends BaseEffect {
    type: 'rotation';
    targetRotation: number;
    startRotation: number;
    easing: string;
}

export interface BlurEffect extends BaseEffect {
    type: 'blur';
    targetBlur: number;
    startBlur: number;
    easing: string;
}

export interface FilterEffect extends BaseEffect {
    type: 'filter';
    filterType: FilterType;
    targetValue: number;
    startValue: number;
    easing: string;
}

export type Effect = ShakeEffect | FlashEffect | TintEffect | ZoomEffect | RotationEffect | BlurEffect | FilterEffect;

export type EffectType = 'shake' | 'flash' | 'tint' | 'zoom' | 'rotation' | 'blur' | 'filter';
export type ShakeType = 'random' | 'horizontal' | 'vertical' | 'circular';
export type FadeType = 'in' | 'out' | 'inout';
export type FilterType = 'contrast' | 'brightness' | 'saturation';

/**
 * 視覚効果管理クラス
 * 画面揺れ、フラッシュ、ズーム、色調変更などの全画面効果を管理
 */
export class EffectManager {
    private canvas: HTMLCanvasElement;
    private effects: Effect[];
    private effectId: number;
    private effectsConfig: any;
    private configWatchers: Map<string, any>;
    private currentTransform: CurrentTransform;
    private transforms: Transforms;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.effects = [];
        this.effectId = 0;
        
        // 設定システムとの連携
        this.effectsConfig = getEffectsConfig();
        this.configWatchers = new Map();
        
        // 現在の変換状態
        this.currentTransform = {
            shake: { x: 0, y: 0 },
            zoom: 1,
            rotation: 0,
            flash: { r: 0, g: 0, b: 0, a: 0 },
            tint: { r: 0, g: 0, b: 0, a: 0 },
            blur: 0,
            contrast: 1,
            brightness: 1,
            saturation: 1
        };
        
        // 効果の積算用
        this.transforms = {
            shakeX: [],
            shakeY: [],
            zoom: [],
            rotation: [],
            flash: [],
            tint: [],
            blur: [],
            contrast: [],
            brightness: [],
            saturation: []
        };
        
        // 設定変更の監視を開始
        this._setupConfigWatchers();
    }
    
    /**
     * 設定変更の監視を設定
     * @private
     */
    private _setupConfigWatchers(): void {
        try {
            // 画面効果設定の監視
            const configManager = this.effectsConfig.configManager;
            
            // 画面揺れ強度の監視
            const shakeWatcher = configManager.watch('effects', 'screen.shakeIntensity', (newValue: number) => {
                console.log(`[EffectManager] 画面揺れ強度が変更されました: ${newValue}`);
            });
            this.configWatchers.set('shakeIntensity', shakeWatcher);
            
            // フラッシュ時間の監視
            const flashWatcher = configManager.watch('effects', 'screen.flashDuration', (newValue: number) => {
                console.log(`[EffectManager] フラッシュ時間が変更されました: ${newValue}ms`);
            });
            this.configWatchers.set('flashDuration', flashWatcher);
            
            // ズーム感度の監視
            const zoomWatcher = configManager.watch('effects', 'screen.zoomSensitivity', (newValue: number) => {
                console.log(`[EffectManager] ズーム感度が変更されました: ${newValue}`);
            });
            this.configWatchers.set('zoomSensitivity', zoomWatcher);
            
            // 画面効果有効状態の監視
            const enabledWatcher = configManager.watch('effects', 'screen.enabled', (newValue: boolean) => {
                console.log(`[EffectManager] 画面効果有効状態が変更されました: ${newValue}`);
                if (!newValue) {
                    this.clearEffects();
                }
            });
            this.configWatchers.set('enabled', enabledWatcher);
            
        } catch (error) {
            getErrorHandler().handleError(error, 'EFFECT_ERROR', {
                context: 'EffectManager._setupConfigWatchers'
            });
        }
    }

    /**
     * 設定から効果パラメータを取得
     * @private
     */
    private _getEffectParameters(): EffectParameters | null {
        try {
            // effectsConfigが無効な場合はnullを返す
            if (!this.effectsConfig) {
                return null;
            }
            
            const screenConfig = this.effectsConfig.getScreenEffectConfig();
            return {
                shakeIntensity: screenConfig.shakeIntensity,
                flashDuration: screenConfig.flashDuration,
                zoomSensitivity: screenConfig.zoomSensitivity,
                enabled: screenConfig.enabled,
                shake: screenConfig.shake,
                flash: screenConfig.flash,
                zoom: screenConfig.zoom,
                tint: screenConfig.tint
            };
        } catch (error) {
            getErrorHandler().handleError(error, 'EFFECT_ERROR', {
                context: 'EffectManager._getEffectParameters'
            });
            // エラーの場合もnullを返す
            return null;
        }
    }

    /**
     * 画面揺れ効果を追加
     */
    public addScreenShake(intensity: number, duration?: number, type: ShakeType = 'random'): number {
        try {
            const params = this._getEffectParameters();
            
            // 設定が取得できない場合は何もしない
            if (!params) {
                return -1;
            }
            
            // 画面効果が無効な場合は何もしない
            if (!params.enabled) {
                return -1;
            }
            
            // 設定値を適用
            const adjustedIntensity = intensity * params.shakeIntensity;
            const configDuration = duration || params.shake.duration;
            
            const effect: ShakeEffect = {
                id: this.effectId++,
                type: 'shake',
                intensity: adjustedIntensity,
                duration: configDuration,
                elapsed: 0,
                shakeType: type,
                frequency: 20, // 揺れの頻度
                damping: params.shake.damping   // 設定から減衰率を取得
            };
            
            this.effects.push(effect);
            return effect.id;
        } catch (error) {
            getErrorHandler().handleError(error, 'EFFECT_ERROR', {
                context: 'EffectManager.addScreenShake'
            });
            return -1;
        }
    }
    
    /**
     * フラッシュ効果を追加
     */
    public addFlash(color: string | ColorRGBA, intensity: number, duration?: number, fadeType: FadeType = 'out'): number {
        try {
            const params = this._getEffectParameters();
            
            // 設定が取得できない場合は何もしない
            if (!params) {
                return -1;
            }
            
            // 画面効果が無効な場合は何もしない
            if (!params.enabled) {
                return -1;
            }
            
            // 設定値を適用
            const adjustedIntensity = intensity * params.flash.intensity;
            // durationが指定されていない場合は設定から取得、指定されている場合はそれを使用
            const configDuration = duration !== undefined ? duration : params.flashDuration;
            
            const effect: FlashEffect = {
                id: this.effectId++,
                type: 'flash',
                color: this.parseColor(color),
                intensity: adjustedIntensity,
                duration: configDuration,
                elapsed: 0,
                fadeType: fadeType
            };
            
            this.effects.push(effect);
            return effect.id;
        } catch (error) {
            getErrorHandler().handleError(error, 'EFFECT_ERROR', {
                context: 'EffectManager.addFlash'
            });
            return -1;
        }
    }
    
    /**
     * 色調効果を追加
     */
    public addTint(color: string | ColorRGBA, intensity: number, duration?: number, easing: string = 'linear'): number {
        try {
            const params = this._getEffectParameters();
            
            // 設定が取得できない場合は何もしない
            if (!params) {
                return -1;
            }
            
            // 画面効果が無効な場合は何もしない
            if (!params.enabled) {
                return -1;
            }
            
            // 設定値を適用
            const adjustedIntensity = intensity * params.tint.intensity;
            const configDuration = duration !== undefined ? duration : params.tint.duration;
            
            const effect: TintEffect = {
                id: this.effectId++,
                type: 'tint',
                color: this.parseColor(color),
                intensity: adjustedIntensity,
                duration: configDuration,
                elapsed: 0,
                easing: easing
            };
            
            this.effects.push(effect);
            return effect.id;
        } catch (error) {
            getErrorHandler().handleError(error, 'EFFECT_ERROR', {
                context: 'EffectManager.addTint'
            });
            return -1;
        }
    }
    
    /**
     * ズーム効果を追加
     */
    public addZoom(targetZoom: number, duration?: number, easing: string = 'easeOut'): number {
        try {
            const params = this._getEffectParameters();
            
            if (!params || !params.enabled) {
                return -1;
            }
            
            // ズーム感度を適用し、範囲を制限
            const adjustedZoom = 1 + (targetZoom - 1) * params.zoomSensitivity;
            const clampedZoom = Math.max(0.5, Math.min(3.0, adjustedZoom)); // 範囲制限
            const configDuration = duration !== undefined ? duration : params.zoom.duration;
            
            const effect: ZoomEffect = {
                id: this.effectId++,
                type: 'zoom',
                targetZoom: clampedZoom,
                startZoom: this.currentTransform.zoom,
                duration: configDuration,
                elapsed: 0,
                easing: easing
            };
            
            this.effects.push(effect);
            return effect.id;
        } catch (error) {
            getErrorHandler().handleError(error, 'EFFECT_ERROR', {
                context: 'EffectManager.addZoom'
            });
            return -1;
        }
    }
    
    /**
     * 色文字列またはColorRGBAオブジェクトを解析
     */
    private parseColor(color: string | ColorRGBA): ColorRGBA {
        if (typeof color === 'object') {
            return color;
        }
        
        // 文字列の色を解析 (例: "#FF0000", "rgb(255,0,0)", "red")
        if (color.startsWith('#')) {
            const hex = color.slice(1);
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            return { r, g, b, a: 1 };
        }
        
        // デフォルト値
        return { r: 255, g: 255, b: 255, a: 1 };
    }
    
    /**
     * 効果の更新処理
     */
    public update(deltaTime: number): void {
        // 効果を更新し、期限切れの効果を削除
        this.effects = this.effects.filter(effect => {
            effect.elapsed += deltaTime;
            return effect.elapsed < effect.duration;
        });
        
        // 変換状態をリセット
        this.resetTransforms();
        
        // 各効果を適用
        this.effects.forEach(effect => {
            this.applyEffect(effect);
        });
        
        // 最終的な変換状態を計算
        this.calculateFinalTransform();
    }
    
    /**
     * 変換状態をリセット
     */
    private resetTransforms(): void {
        Object.keys(this.transforms).forEach(key => {
            (this.transforms as any)[key] = [];
        });
    }
    
    /**
     * 効果を適用
     */
    private applyEffect(effect: Effect): void {
        const progress = Math.min(effect.elapsed / effect.duration, 1);
        
        switch (effect.type) {
            case 'shake':
                this.applyShakeEffect(effect, progress);
                break;
            case 'flash':
                this.applyFlashEffect(effect, progress);
                break;
            case 'tint':
                this.applyTintEffect(effect, progress);
                break;
            case 'zoom':
                this.applyZoomEffect(effect, progress);
                break;
            case 'rotation':
                this.applyRotationEffect(effect, progress);
                break;
            case 'blur':
                this.applyBlurEffect(effect, progress);
                break;
            case 'filter':
                this.applyFilterEffect(effect, progress);
                break;
        }
    }
    
    /**
     * 揺れ効果を適用
     */
    private applyShakeEffect(effect: ShakeEffect, progress: number): void {
        const intensity = effect.intensity * (1 - progress * effect.damping);
        const time = effect.elapsed * 0.001 * effect.frequency;
        
        let shakeX = 0;
        let shakeY = 0;
        
        switch (effect.shakeType) {
            case 'random':
                shakeX = (Math.random() - 0.5) * intensity * 2;
                shakeY = (Math.random() - 0.5) * intensity * 2;
                break;
            case 'horizontal':
                shakeX = Math.sin(time) * intensity;
                break;
            case 'vertical':
                shakeY = Math.sin(time) * intensity;
                break;
            case 'circular':
                shakeX = Math.cos(time) * intensity;
                shakeY = Math.sin(time) * intensity;
                break;
        }
        
        this.transforms.shakeX.push(shakeX);
        this.transforms.shakeY.push(shakeY);
    }
    
    /**
     * フラッシュ効果を適用
     */
    private applyFlashEffect(effect: FlashEffect, progress: number): void {
        let alpha = 0;
        
        switch (effect.fadeType) {
            case 'out':
                alpha = (1 - progress) * effect.intensity;
                break;
            case 'in':
                alpha = progress * effect.intensity;
                break;
            case 'inout':
                alpha = Math.sin(progress * Math.PI) * effect.intensity;
                break;
        }
        
        const flashColor: ColorRGBA = {
            r: effect.color.r,
            g: effect.color.g,
            b: effect.color.b,
            a: alpha
        };
        
        this.transforms.flash.push(flashColor);
    }
    
    /**
     * 色調効果を適用
     */
    private applyTintEffect(effect: TintEffect, progress: number): void {
        const easedProgress = this.applyEasing(progress, effect.easing);
        const alpha = easedProgress * effect.intensity;
        
        const tintColor: ColorRGBA = {
            r: effect.color.r,
            g: effect.color.g,
            b: effect.color.b,
            a: alpha
        };
        
        this.transforms.tint.push(tintColor);
    }
    
    /**
     * ズーム効果を適用
     */
    private applyZoomEffect(effect: ZoomEffect, progress: number): void {
        const easedProgress = this.applyEasing(progress, effect.easing);
        const zoom = effect.startZoom + (effect.targetZoom - effect.startZoom) * easedProgress;
        
        this.transforms.zoom.push(zoom);
    }
    
    /**
     * 回転効果を適用
     */
    private applyRotationEffect(effect: RotationEffect, progress: number): void {
        const easedProgress = this.applyEasing(progress, effect.easing);
        const rotation = effect.startRotation + (effect.targetRotation - effect.startRotation) * easedProgress;
        
        this.transforms.rotation.push(rotation);
    }
    
    /**
     * ぼかし効果を適用
     */
    private applyBlurEffect(effect: BlurEffect, progress: number): void {
        const easedProgress = this.applyEasing(progress, effect.easing);
        const blur = effect.startBlur + (effect.targetBlur - effect.startBlur) * easedProgress;
        
        this.transforms.blur.push(blur);
    }
    
    /**
     * フィルター効果を適用
     */
    private applyFilterEffect(effect: FilterEffect, progress: number): void {
        const easedProgress = this.applyEasing(progress, effect.easing);
        const value = effect.startValue + (effect.targetValue - effect.startValue) * easedProgress;
        
        switch (effect.filterType) {
            case 'contrast':
                this.transforms.contrast.push(value);
                break;
            case 'brightness':
                this.transforms.brightness.push(value);
                break;
            case 'saturation':
                this.transforms.saturation.push(value);
                break;
        }
    }
    
    /**
     * イージング関数を適用
     */
    private applyEasing(progress: number, easing: string): number {
        switch (easing) {
            case 'easeIn':
                return progress * progress;
            case 'easeOut':
                return 1 - (1 - progress) * (1 - progress);
            case 'easeInOut':
                return progress < 0.5 
                    ? 2 * progress * progress 
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            case 'easeOutBounce':
                if (progress < 1 / 2.75) {
                    return 7.5625 * progress * progress;
                } else if (progress < 2 / 2.75) {
                    return 7.5625 * (progress -= 1.5 / 2.75) * progress + 0.75;
                } else if (progress < 2.5 / 2.75) {
                    return 7.5625 * (progress -= 2.25 / 2.75) * progress + 0.9375;
                } else {
                    return 7.5625 * (progress -= 2.625 / 2.75) * progress + 0.984375;
                }
            case 'linear':
            default:
                return progress;
        }
    }
    
    /**
     * 最終的な変換状態を計算
     */
    private calculateFinalTransform(): void {
        // 揺れの合計
        this.currentTransform.shake.x = this.transforms.shakeX.reduce((sum, val) => sum + val, 0);
        this.currentTransform.shake.y = this.transforms.shakeY.reduce((sum, val) => sum + val, 0);
        
        // ズームの乗算
        this.currentTransform.zoom = this.transforms.zoom.reduce((product, val) => product * val, 1);
        
        // 回転の加算
        this.currentTransform.rotation = this.transforms.rotation.reduce((sum, val) => sum + val, 0);
        
        // ぼかしの最大値
        this.currentTransform.blur = Math.max(0, ...this.transforms.blur, 0);
        
        // フィルターの乗算
        this.currentTransform.contrast = this.transforms.contrast.reduce((product, val) => product * val, 1);
        this.currentTransform.brightness = this.transforms.brightness.reduce((product, val) => product * val, 1);
        this.currentTransform.saturation = this.transforms.saturation.reduce((product, val) => product * val, 1);
        
        // フラッシュとティントの合成
        this.currentTransform.flash = this.blendColors(this.transforms.flash);
        this.currentTransform.tint = this.blendColors(this.transforms.tint);
    }
    
    /**
     * 回転効果を追加
     */
    public addRotation(angle: number, duration: number, easing: string = 'linear'): number {
        try {
            const params = this._getEffectParameters();
            
            if (!params || !params.enabled) {
                return -1;
            }
            
            const effect: RotationEffect = {
                id: this.effectId++,
                type: 'rotation',
                startRotation: this.currentTransform.rotation,
                targetRotation: this.currentTransform.rotation + angle,
                duration: duration,
                elapsed: 0,
                easing: easing
            };
            
            this.effects.push(effect);
            return effect.id;
        } catch (error) {
            getErrorHandler().handleError(error, 'EFFECT_ERROR', {
                context: 'EffectManager.addRotation'
            });
            return -1;
        }
    }
    
    /**
     * ぼかし効果を追加
     */
    public addBlur(intensity: number, duration: number, easing: string = 'easeInOut'): number {
        try {
            const params = this._getEffectParameters();
            
            if (!params || !params.enabled) {
                return -1;
            }
            
            const effect: BlurEffect = {
                id: this.effectId++,
                type: 'blur',
                startBlur: this.currentTransform.blur,
                targetBlur: intensity,
                duration: duration,
                elapsed: 0,
                easing: easing
            };
            
            this.effects.push(effect);
            return effect.id;
        } catch (error) {
            getErrorHandler().handleError(error, 'EFFECT_ERROR', {
                context: 'EffectManager.addBlur'
            });
            return -1;
        }
    }
    
    /**
     * フィルター効果を追加（コントラスト、明度、彩度）
     */
    public addFilter(filterType: FilterType, targetValue: number, duration: number, easing: string = 'easeInOut'): number {
        try {
            const params = this._getEffectParameters();
            
            if (!params || !params.enabled) {
                return -1;
            }
            
            let startValue = 1;
            switch (filterType) {
                case 'contrast':
                    startValue = this.currentTransform.contrast;
                    break;
                case 'brightness':
                    startValue = this.currentTransform.brightness;
                    break;
                case 'saturation':
                    startValue = this.currentTransform.saturation;
                    break;
            }
            
            const effect: FilterEffect = {
                id: this.effectId++,
                type: 'filter',
                filterType: filterType,
                startValue: startValue,
                targetValue: targetValue,
                duration: duration,
                elapsed: 0,
                easing: easing
            };
            
            this.effects.push(effect);
            return effect.id;
        } catch (error) {
            getErrorHandler().handleError(error, 'EFFECT_ERROR', {
                context: 'EffectManager.addFilter'
            });
            return -1;
        }
    }
    
    /**
     * 色のブレンド
     */
    private blendColors(colors: ColorRGBA[]): ColorRGBA {
        if (colors.length === 0) {
            return { r: 0, g: 0, b: 0, a: 0 };
        }
        
        return colors.reduce((result, color) => {
            const alpha = color.a;
            const invAlpha = 1 - alpha;
            
            return {
                r: result.r * invAlpha + color.r * alpha,
                g: result.g * invAlpha + color.g * alpha,
                b: result.b * invAlpha + color.b * alpha,
                a: Math.min(result.a + color.a, 1)
            };
        });
    }
    
    /**
     * 変換を適用してレンダリング
     */
    public applyTransform(context: CanvasRenderingContext2D): void {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // 変換を適用
        context.translate(centerX, centerY);
        
        // 画面揺れ
        context.translate(this.currentTransform.shake.x, this.currentTransform.shake.y);
        
        // ズーム
        context.scale(this.currentTransform.zoom, this.currentTransform.zoom);
        
        // 回転
        context.rotate(this.currentTransform.rotation);
        
        // 中心を戻す
        context.translate(-centerX, -centerY);
        
        // ぼかし効果
        if (this.currentTransform.blur > 0) {
            context.filter = `blur(${this.currentTransform.blur}px)`;
        }
        
        // フィルター効果
        if (this.currentTransform.contrast !== 1 || this.currentTransform.brightness !== 1 || this.currentTransform.saturation !== 1) {
            const filterParts = [];
            if (this.currentTransform.contrast !== 1) {
                filterParts.push(`contrast(${this.currentTransform.contrast})`);
            }
            if (this.currentTransform.brightness !== 1) {
                filterParts.push(`brightness(${this.currentTransform.brightness})`);
            }
            if (this.currentTransform.saturation !== 1) {
                filterParts.push(`saturate(${this.currentTransform.saturation})`);
            }
            
            if (filterParts.length > 0) {
                const existingFilter = context.filter !== 'none' ? context.filter + ' ' : '';
                context.filter = existingFilter + filterParts.join(' ');
            }
        }
    }
    
    /**
     * フラッシュとティントを適用
     */
    public applyOverlays(context: CanvasRenderingContext2D): void {
        // フラッシュを適用
        if (this.currentTransform.flash.a > 0) {
            context.save();
            context.globalCompositeOperation = 'screen';
            context.fillStyle = `rgba(${this.currentTransform.flash.r}, ${this.currentTransform.flash.g}, ${this.currentTransform.flash.b}, ${this.currentTransform.flash.a})`;
            context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            context.restore();
        }
        
        // ティントを適用
        if (this.currentTransform.tint.a > 0) {
            context.save();
            context.globalCompositeOperation = 'multiply';
            context.fillStyle = `rgba(${this.currentTransform.tint.r}, ${this.currentTransform.tint.g}, ${this.currentTransform.tint.b}, ${this.currentTransform.tint.a})`;
            context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            context.restore();
        }
    }
    
    /**
     * 特定の効果を削除
     */
    public removeEffect(effectId: number): boolean {
        const initialLength = this.effects.length;
        this.effects = this.effects.filter(effect => effect.id !== effectId);
        return this.effects.length < initialLength;
    }
    
    /**
     * 全ての効果をクリア
     */
    public clearEffects(): void {
        this.effects = [];
        this.resetTransforms();
        this.calculateFinalTransform();
    }
    
    /**
     * 現在の変換状態を取得
     */
    public getCurrentTransform(): CurrentTransform {
        return { ...this.currentTransform };
    }
    
    /**
     * アクティブな効果の数を取得
     */
    public getActiveEffectCount(): number {
        return this.effects.length;
    }
    
    /**
     * 効果の統計を取得
     */
    public getEffectStats(): { [key in EffectType]: number } {
        const stats = {} as { [key in EffectType]: number };
        
        this.effects.forEach(effect => {
            stats[effect.type] = (stats[effect.type] || 0) + 1;
        });
        
        return stats;
    }
    
    /**
     * 時間停止効果
     */
    public addTimeStopEffect(duration: number): void {
        try {
            // 青いフラッシュ
            this.addFlash('#0088FF', 0.3, 200, 'out');
            
            // 画面の軽いズームイン
            this.addZoom(1.05, 300, 'easeOut');
            setTimeout(() => {
                this.addZoom(1.0, duration - 300, 'easeIn');
            }, 300);
            
            // 青い色調
            this.addTint('#0088FF', 0.2, duration, 'easeInOut');
            
            // 軽いぼかし効果
            this.addBlur(2, 200, 'easeOut');
            setTimeout(() => {
                this.addBlur(0, duration - 200, 'easeIn');
            }, 200);
        } catch (error) {
            getErrorHandler().handleError(error, 'EFFECT_ERROR', {
                context: 'EffectManager.addTimeStopEffect'
            });
        }
    }
    
    /**
     * ボーナスタイム効果
     */
    public addBonusTimeEffect(duration: number): void {
        try {
            // 金色のフラッシュ
            this.addFlash('#FFD700', 0.4, 300, 'out');
            
            // パルスズーム
            for (let i = 0; i < duration / 1000; i++) {
                setTimeout(() => {
                    this.addZoom(1.02, 200, 'easeOut');
                    setTimeout(() => {
                        this.addZoom(1.0, 200, 'easeIn');
                    }, 200);
                }, i * 1000);
            }
            
            // 金色の色調
            this.addTint('#FFD700', 0.15, duration, 'easeInOut');
        } catch (error) {
            getErrorHandler().handleError(error, 'EFFECT_ERROR', {
                context: 'EffectManager.addBonusTimeEffect'
            });
        }
    }
    
    /**
     * 爆発効果
     */
    public addExplosionEffect(_x: number, _y: number, intensity: number = 1): void {
        try {
            // 中心からの画面揺れ
            this.addScreenShake(15 * intensity, 500, 'circular');
            
            // 白いフラッシュ
            this.addFlash('#FFFFFF', 0.6 * intensity, 150, 'out');
            
            // 一瞬のズームアウト
            this.addZoom(0.95, 100, 'easeOut');
            setTimeout(() => {
                this.addZoom(1.0, 200, 'easeOut');
            }, 100);
        } catch (error) {
            getErrorHandler().handleError(error, 'EFFECT_ERROR', {
                context: 'EffectManager.addExplosionEffect'
            });
        }
    }
    
    /**
     * ダメージ効果
     */
    public addDamageEffect(): void {
        try {
            // 赤いフラッシュ
            this.addFlash('#FF0000', 0.4, 200, 'out');
            
            // 短い画面揺れ
            this.addScreenShake(8, 300, 'random');
            
            // 一瞬の赤い色調
            this.addTint('#FF0000', 0.3, 400, 'easeOut');
        } catch (error) {
            getErrorHandler().handleError(error, 'EFFECT_ERROR', {
                context: 'EffectManager.addDamageEffect'
            });
        }
    }
    
    /**
     * 回復効果
     */
    public addHealEffect(): void {
        try {
            // 緑のパルス
            this.addFlash('#00FF00', 0.3, 400, 'inout');
            
            // 優しいズームイン
            this.addZoom(1.02, 300, 'easeInOut');
            setTimeout(() => {
                this.addZoom(1.0, 300, 'easeInOut');
            }, 300);
            
            // 緑の色調
            this.addTint('#00FF88', 0.2, 600, 'easeInOut');
        } catch (error) {
            getErrorHandler().handleError(error, 'EFFECT_ERROR', {
                context: 'EffectManager.addHealEffect'
            });
        }
    }
    
    /**
     * 電気効果
     */
    public addElectricEffect(): void {
        try {
            // 激しい画面揺れ
            this.addScreenShake(20, 800, 'random');
            
            // 黄色いフラッシュ（点滅）
            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    this.addFlash('#FFFF00', 0.5, 100, 'out');
                }, i * 200);
            }
            
            // 軽い回転
            this.addRotation((Math.random() - 0.5) * 0.1, 200, 'easeOut');
        } catch (error) {
            getErrorHandler().handleError(error, 'EFFECT_ERROR', {
                context: 'EffectManager.addElectricEffect'
            });
        }
    }
    
    /**
     * 変換をリセット（GameEngineとの互換性）
     */
    public resetTransform(context: CanvasRenderingContext2D): void {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.filter = 'none';
    }
    
    /**
     * 画面フラッシュ効果を追加（GameEngineとの互換性）
     */
    public addScreenFlash(intensity: number, duration: number, color: string = '#FFFFFF'): number {
        return this.addFlash(color, intensity, duration, 'out');
    }
    
    /**
     * 画面色調効果を追加（GameEngineとの互換性）
     */
    public addScreenTint(intensity: number, duration: number, color: string = '#FFFFFF'): number {
        return this.addTint(color, intensity, duration);
    }
    
    /**
     * ビネット効果を追加
     */
    public addVignette(intensity: number, duration: number): number {
        // ビネット効果は色調効果として実装
        return this.addTint('#000000', intensity, duration);
    }
    
    /**
     * エフェクトシステムを無効化
     * エラー復旧やセーフモード時に使用
     */
    public disable(): void {
        try {
            // 全ての効果をクリア
            this.clearEffects();
            
            // 変換状態をリセット
            this.currentTransform = {
                shake: { x: 0, y: 0 },
                zoom: 1,
                rotation: 0,
                flash: { r: 0, g: 0, b: 0, a: 0 },
                tint: { r: 0, g: 0, b: 0, a: 0 },
                blur: 0,
                contrast: 1,
                brightness: 1,
                saturation: 1
            };
            
            // 積算用配列をクリア
            Object.keys(this.transforms).forEach(key => {
                (this.transforms as any)[key] = [];
            });
            
            console.log('[EffectManager] エフェクトシステムを無効化しました');
        } catch (error) {
            getErrorHandler().handleError(error, 'EFFECT_ERROR', {
                context: 'EffectManager.disable'
            });
        }
    }
    
    /**
     * エフェクトシステムを有効化
     */
    public enable(): void {
        console.log('[EffectManager] エフェクトシステムを有効化しました');
    }
    
    /**
     * エフェクトの品質レベルを設定（ErrorRecovery用）
     * @param {string} level - 品質レベル ('high', 'medium', 'low')
     */
    public setQualityLevel(level: string): void {
        try {
            switch (level) {
                case 'low':
                    // 低品質: エフェクトを無効化または大幅削減
                    this.disable();
                    console.log('[EffectManager] 品質レベルを低に設定: エフェクトを無効化');
                    break;
                case 'medium':
                    // 中品質: 一部のエフェクトを削減
                    this.clearEffects();
                    // パフォーマンスの高いエフェクトのみ維持
                    console.log('[EffectManager] 品質レベルを中に設定: エフェクトを削減');
                    break;
                case 'high':
                default:
                    // 高品質: 全エフェクト有効（デフォルト）
                    this.enable();
                    console.log('[EffectManager] 品質レベルを高に設定: 全エフェクト有効');
                    break;
            }
        } catch (error) {
            console.warn('EffectManager: setQualityLevel failed', error);
        }
    }
    
    /**
     * 設定値を動的に変更
     */
    public setConfigValue(key: string, value: any): boolean {
        try {
            switch (key) {
                case 'shakeIntensity':
                    if (this.effectsConfig.setShakeIntensity) {
                        this.effectsConfig.setShakeIntensity(value);
                    }
                    break;
                case 'flashDuration':
                    if (this.effectsConfig.setFlashDuration) {
                        this.effectsConfig.setFlashDuration(value);
                    }
                    break;
                case 'zoomSensitivity':
                    if (this.effectsConfig.setZoomSensitivity) {
                        this.effectsConfig.setZoomSensitivity(value);
                    }
                    break;
                case 'enabled':
                    if (this.effectsConfig.setScreenEffectEnabled) {
                        this.effectsConfig.setScreenEffectEnabled(value);
                    }
                    break;
                default:
                    console.warn(`[EffectManager] 未知の設定キー: ${key}`);
                    return false;
            }
            
            return true;
        } catch (error) {
            getErrorHandler().handleError(error, 'EFFECT_ERROR', {
                context: 'EffectManager.setConfigValue'
            });
            return false;
        }
    }
    
    /**
     * 現在の設定値を取得
     */
    public getConfigValue(key: string): any {
        try {
            switch (key) {
                case 'shakeIntensity':
                    return this.effectsConfig.getShakeIntensity?.() || 1.0;
                case 'flashDuration':
                    return this.effectsConfig.getFlashDuration?.() || 300;
                case 'zoomSensitivity':
                    return this.effectsConfig.getZoomSensitivity?.() || 1.0;
                case 'enabled':
                    return this.effectsConfig.isScreenEffectEnabled?.() || true;
                default:
                    console.warn(`[EffectManager] 未知の設定キー: ${key}`);
                    return null;
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'EFFECT_ERROR', {
                context: 'EffectManager.getConfigValue'
            });
            return null;
        }
    }
    
    /**
     * 設定システムとの連携を適用
     * EffectsConfigから呼び出される
     */
    public applyConfiguration(): void {
        try {
            const params = this._getEffectParameters();
            if (!params) return;
            
            // 設定が無効な場合は全効果をクリア
            if (!params.enabled) {
                this.clearEffects();
            }
            
            console.log('[EffectManager] 設定システムとの連携を適用しました');
        } catch (error) {
            getErrorHandler().handleError(error, 'EFFECT_ERROR', {
                context: 'EffectManager.applyConfiguration'
            });
        }
    }
    
    /**
     * オーバーレイ効果を描画（レガシーメソッド互換性）
     */
    public renderOverlays(context: CanvasRenderingContext2D): void {
        this.applyOverlays(context);
    }
    
    /**
     * 前処理エフェクトを描画（変換適用）
     */
    public renderPreEffects(context: CanvasRenderingContext2D): void {
        context.save();
        this.applyTransform(context);
    }
    
    /**
     * 後処理エフェクトを描画（オーバーレイ）
     */
    public renderPostEffects(context: CanvasRenderingContext2D): void {
        this.resetTransform(context);
        this.renderOverlays(context);
        context.restore();
    }
    
    /**
     * 全ての効果をクリア（clearAllEffectsエイリアス）
     */
    public clearAllEffects(): void {
        this.clearEffects();
    }
    
    /**
     * 設定システムとの連携を更新
     * 動的な設定変更に対応
     */
    public updateConfiguration(): void {
        try {
            // 設定を再読み込み
            const params = this._getEffectParameters();
            
            // 画面効果が無効になった場合、全ての効果をクリア
            if (params && !params.enabled) {
                this.clearEffects();
            }
            
            console.log('[EffectManager] 設定を更新しました');
        } catch (error) {
            getErrorHandler().handleError(error, 'EFFECT_ERROR', {
                context: 'EffectManager.updateConfiguration'
            });
        }
    }
    
    /**
     * クリーンアップ
     */
    public dispose(): void {
        this.clearEffects();
        
        // 設定変更の監視を停止
        this.configWatchers.forEach((watcher, _key) => {
            if (this.effectsConfig?.configManager?.unwatch) {
                this.effectsConfig.configManager.unwatch(watcher);
            }
        });
        this.configWatchers.clear();
        
        console.log('[EffectManager] Disposed successfully');
    }
    
    /**
     * リソースの破棄（destroy エイリアス）
     */
    public destroy(): void {
        this.dispose();
    }

    // =======================
    // EventStageManager対応メソッド（要件7: 未実装メソッド実装）
    // =======================

    /**
     * ナイトモードを有効化
     * 夜間イベントステージで画面全体を暗くし、視界を制限する
     */
    public enableNightMode(intensity: number = 0.8, duration?: number): number {
        try {
            // 暗いティント効果を適用して夜間の雰囲気を演出
            const nightDuration = duration || 5000; // デフォルト5秒間
            const nightEffect = this.addTint('#000033', intensity, nightDuration, 'easeInOut');
            
            // コントラストを少し下げて暗い雰囲気を強化
            this.addFilter('contrast', 0.8, nightDuration, 'easeInOut');
            
            // 明度を下げて全体的に暗くする
            this.addFilter('brightness', 0.6, nightDuration, 'easeInOut');
            
            console.log(`[EffectManager] ナイトモードを有効化: intensity=${intensity}, duration=${nightDuration}ms`);
            
            // 主要なエフェクトID（ティント）を返す
            return nightEffect;
        } catch (error) {
            getErrorHandler().handleError(error, 'EFFECT_ERROR', {
                context: 'EffectManager.enableNightMode'
            });
            return -1;
        }
    }

    /**
     * 視界制限を設定
     * 霧や煙などの効果で視界を制限する
     */
    public setVisibilityReduction(reduction: number, duration?: number, effectType: 'fog' | 'smoke' | 'darkness' = 'fog'): number {
        try {
            const effectDuration = duration || 3000; // デフォルト3秒間
            let effectId = -1;
            
            switch (effectType) {
                case 'fog':
                    // 白っぽい霧効果（彩度を下げ、軽いぼかし）
                    effectId = this.addTint('#CCCCCC', reduction * 0.4, effectDuration, 'easeInOut');
                    this.addFilter('saturation', 1 - reduction * 0.3, effectDuration, 'easeInOut');
                    this.addBlur(reduction * 2, effectDuration, 'easeInOut');
                    break;
                    
                case 'smoke':
                    // 暗い煙効果（暗いティントとぼかし）
                    effectId = this.addTint('#444444', reduction * 0.6, effectDuration, 'easeInOut');
                    this.addBlur(reduction * 3, effectDuration, 'easeInOut');
                    this.addFilter('contrast', 1 + reduction * 0.2, effectDuration, 'easeInOut');
                    break;
                    
                case 'darkness':
                    // 暗闇効果（暗いティントと明度低下）
                    effectId = this.addTint('#000000', reduction * 0.7, effectDuration, 'easeInOut');
                    this.addFilter('brightness', 1 - reduction * 0.4, effectDuration, 'easeInOut');
                    break;
                    
                default:
                    console.warn(`[EffectManager] 未知の視界制限タイプ: ${effectType}`);
                    effectId = this.addTint('#CCCCCC', reduction * 0.5, effectDuration, 'easeInOut');
            }
            
            console.log(`[EffectManager] 視界制限を設定: type=${effectType}, reduction=${reduction}, duration=${effectDuration}ms`);
            return effectId;
        } catch (error) {
            getErrorHandler().handleError(error, 'EFFECT_ERROR', {
                context: 'EffectManager.setVisibilityReduction'
            });
            return -1;
        }
    }
}