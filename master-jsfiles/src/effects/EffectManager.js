import { getEffectsConfig } from '../config/EffectsConfig.js';
import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * 視覚効果管理クラス
 * 画面揺れ、フラッシュ、ズーム、色調変更などの全画面効果を管理
 */
export class EffectManager {
    constructor(canvas) {
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
    _setupConfigWatchers() {
        try {
            // 画面効果設定の監視
            const configManager = this.effectsConfig.configManager;
            
            // 画面揺れ強度の監視
            const shakeWatcher = configManager.watch('effects', 'screen.shakeIntensity', (newValue) => {
                console.log(`[EffectManager] 画面揺れ強度が変更されました: ${newValue}`);
            });
            this.configWatchers.set('shakeIntensity', shakeWatcher);
            
            // フラッシュ時間の監視
            const flashWatcher = configManager.watch('effects', 'screen.flashDuration', (newValue) => {
                console.log(`[EffectManager] フラッシュ時間が変更されました: ${newValue}ms`);
            });
            this.configWatchers.set('flashDuration', flashWatcher);
            
            // ズーム感度の監視
            const zoomWatcher = configManager.watch('effects', 'screen.zoomSensitivity', (newValue) => {
                console.log(`[EffectManager] ズーム感度が変更されました: ${newValue}`);
            });
            this.configWatchers.set('zoomSensitivity', zoomWatcher);
            
            // 画面効果有効状態の監視
            const enabledWatcher = configManager.watch('effects', 'screen.enabled', (newValue) => {
                console.log(`[EffectManager] 画面効果有効状態が変更されました: ${newValue}`);
                if (!newValue) {
                    this.clearEffects();
                }
            });
            this.configWatchers.set('enabled', enabledWatcher);
            
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EffectManager._setupConfigWatchers'
            });
        }
    }

    /**
     * 設定から効果パラメータを取得
     * @private
     */
    _getEffectParameters() {
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
            getErrorHandler().handleError(error, {
                context: 'EffectManager._getEffectParameters'
            });
            // エラーの場合もnullを返す
            return null;
        }
    }

    /**
     * 画面揺れ効果を追加
     */
    addScreenShake(intensity, duration, type = 'random') {
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
            
            const effect = {
                id: this.effectId++,
                type: 'shake',
                intensity: adjustedIntensity,
                duration: configDuration,
                elapsed: 0,
                shakeType: type, // 'random', 'horizontal', 'vertical', 'circular'
                frequency: 20, // 揺れの頻度
                damping: params.shake.damping   // 設定から減衰率を取得
            };
            
            this.effects.push(effect);
            return effect.id;
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EffectManager.addScreenShake'
            });
            return -1;
        }
    }
    
    /**
     * フラッシュ効果を追加
     */
    addFlash(color, intensity, duration, fadeType = 'out') {
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
            
            const effect = {
                id: this.effectId++,
                type: 'flash',
                color: this.parseColor(color),
                intensity: adjustedIntensity,
                duration: configDuration,
                elapsed: 0,
                fadeType: fadeType // 'in', 'out', 'inout'
            };
            
            this.effects.push(effect);
            return effect.id;
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EffectManager.addFlash'
            });
            return -1;
        }
    }
    
    /**
     * 色調効果を追加
     */
    addTint(color, intensity, duration, easing = 'linear') {
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
            
            const effect = {
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
            getErrorHandler().handleError(error, {
                context: 'EffectManager.addTint'
            });
            return -1;
        }
    }
    
    /**
     * ズーム効果を追加
     */
    addZoom(targetZoom, duration, easing = 'easeOut') {
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
            
            // ズーム感度を適用し、範囲を制限
            const adjustedZoom = 1 + (targetZoom - 1) * params.zoomSensitivity;
            const clampedZoom = Math.max(params.zoom.min, Math.min(params.zoom.max, adjustedZoom));
            
            const effect = {
                id: this.effectId++,
                type: 'zoom',
                startZoom: this.currentTransform.zoom,
                targetZoom: clampedZoom,
                duration: duration,
                elapsed: 0,
                easing: easing
            };
            
            this.effects.push(effect);
            return effect.id;
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EffectManager.addZoom'
            });
            return -1;
        }
    }
    
    /**
     * 回転効果を追加
     */
    addRotation(angle, duration, easing = 'linear') {
        const effect = {
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
    }
    
    /**
     * ぼかし効果を追加
     */
    addBlur(intensity, duration, easing = 'easeInOut') {
        const effect = {
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
    }
    
    /**
     * 時間停止効果
     */
    addTimeStopEffect(duration) {
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
    }
    
    /**
     * ボーナスタイム効果
     */
    addBonusTimeEffect(duration) {
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
    }
    
    /**
     * 爆発効果
     */
    addExplosionEffect(x, y, intensity = 1) {
        // 中心からの画面揺れ
        this.addScreenShake(15 * intensity, 500, 'circular');
        
        // 白いフラッシュ
        this.addFlash('#FFFFFF', 0.6 * intensity, 150, 'out');
        
        // 一瞬のズームアウト
        this.addZoom(0.95, 100, 'easeOut');
        setTimeout(() => {
            this.addZoom(1.0, 200, 'easeOut');
        }, 100);
    }
    
    /**
     * ダメージ効果
     */
    addDamageEffect() {
        // 赤いフラッシュ
        this.addFlash('#FF0000', 0.4, 200, 'out');
        
        // 短い画面揺れ
        this.addScreenShake(8, 300, 'random');
        
        // 一瞬の赤い色調
        this.addTint('#FF0000', 0.3, 400, 'easeOut');
    }
    
    /**
     * 回復効果
     */
    addHealEffect() {
        // 緑のパルス
        this.addFlash('#00FF00', 0.3, 400, 'inout');
        
        // 優しいズームイン
        this.addZoom(1.02, 300, 'easeInOut');
        setTimeout(() => {
            this.addZoom(1.0, 300, 'easeInOut');
        }, 300);
        
        // 緑の色調
        this.addTint('#00FF88', 0.2, 600, 'easeInOut');
    }
    
    /**
     * 電気効果
     */
    addElectricEffect() {
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
    }
    
    /**
     * 色文字列をRGB値に変換
     */
    parseColor(color) {
        if (color.startsWith('#')) {
            const hex = color.substring(1);
            return {
                r: parseInt(hex.substring(0, 2), 16),
                g: parseInt(hex.substring(2, 4), 16),
                b: parseInt(hex.substring(4, 6), 16)
            };
        }
        
        // デフォルトは白
        return { r: 255, g: 255, b: 255 };
    }
    
    /**
     * イージング関数
     */
    ease(t, type) {
        switch (type) {
            case 'linear':
                return t;
            case 'easeIn':
                return t * t;
            case 'easeOut':
                return 1 - (1 - t) * (1 - t);
            case 'easeInOut':
                return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            case 'easeOutBounce':
                if (t < 1 / 2.75) {
                    return 7.5625 * t * t;
                } else if (t < 2 / 2.75) {
                    return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
                } else if (t < 2.5 / 2.75) {
                    return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
                } else {
                    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
                }
            default:
                return t;
        }
    }
    
    /**
     * 更新処理
     */
    update(deltaTime) {
        // 各変換配列をクリア
        for (const key in this.transforms) {
            this.transforms[key] = [];
        }
        
        // 効果を更新
        this.effects = this.effects.filter(effect => {
            effect.elapsed += deltaTime;
            
            if (effect.elapsed >= effect.duration) {
                return false; // 効果終了
            }
            
            const progress = effect.elapsed / effect.duration;
            this.updateEffect(effect, progress);
            
            return true;
        });
        
        // 最終的な変換状態を計算
        this.calculateFinalTransform();
    }
    
    /**
     * 個別効果の更新
     */
    updateEffect(effect, progress) {
        const easedProgress = this.ease(progress, effect.easing || 'linear');
        
        switch (effect.type) {
            case 'shake':
                this.updateShakeEffect(effect, progress);
                break;
            case 'flash':
                this.updateFlashEffect(effect, progress);
                break;
            case 'tint':
                this.updateTintEffect(effect, easedProgress);
                break;
            case 'zoom':
                this.updateZoomEffect(effect, easedProgress);
                break;
            case 'rotation':
                this.updateRotationEffect(effect, easedProgress);
                break;
            case 'blur':
                this.updateBlurEffect(effect, easedProgress);
                break;
        }
    }
    
    /**
     * 画面揺れ効果の更新
     */
    updateShakeEffect(effect, progress) {
        const intensity = effect.intensity * Math.pow(effect.damping, progress);
        const time = effect.elapsed * effect.frequency * 0.01;
        
        let shakeX = 0, shakeY = 0;
        
        switch (effect.shakeType) {
            case 'horizontal':
                shakeX = Math.sin(time) * intensity;
                break;
            case 'vertical':
                shakeY = Math.sin(time) * intensity;
                break;
            case 'circular':
                shakeX = Math.sin(time) * intensity;
                shakeY = Math.cos(time) * intensity;
                break;
            default: // random
                shakeX = (Math.random() - 0.5) * intensity * 2;
                shakeY = (Math.random() - 0.5) * intensity * 2;
                break;
        }
        
        this.transforms.shakeX.push(shakeX);
        this.transforms.shakeY.push(shakeY);
    }
    
    /**
     * フラッシュ効果の更新
     */
    updateFlashEffect(effect, progress) {
        let alpha = 0;
        
        switch (effect.fadeType) {
            case 'in':
                alpha = progress * effect.intensity;
                break;
            case 'out':
                alpha = (1 - progress) * effect.intensity;
                break;
            case 'inout':
                alpha = Math.sin(progress * Math.PI) * effect.intensity;
                break;
        }
        
        this.transforms.flash.push({
            r: effect.color.r,
            g: effect.color.g,
            b: effect.color.b,
            a: alpha
        });
    }
    
    /**
     * 色調効果の更新
     */
    updateTintEffect(effect, progress) {
        const alpha = effect.intensity * (1 - progress);
        
        this.transforms.tint.push({
            r: effect.color.r,
            g: effect.color.g,
            b: effect.color.b,
            a: alpha
        });
    }
    
    /**
     * ズーム効果の更新
     */
    updateZoomEffect(effect, progress) {
        const zoom = effect.startZoom + (effect.targetZoom - effect.startZoom) * progress;
        this.transforms.zoom.push(zoom);
    }
    
    /**
     * 回転効果の更新
     */
    updateRotationEffect(effect, progress) {
        const rotation = effect.startRotation + (effect.targetRotation - effect.startRotation) * progress;
        this.transforms.rotation.push(rotation);
    }
    
    /**
     * ぼかし効果の更新
     */
    updateBlurEffect(effect, progress) {
        const blur = effect.startBlur + (effect.targetBlur - effect.startBlur) * progress;
        this.transforms.blur.push(blur);
    }
    
    /**
     * 最終的な変換状態を計算
     */
    calculateFinalTransform() {
        // 画面揺れ（加算）
        this.currentTransform.shake.x = this.transforms.shakeX.reduce((sum, val) => sum + val, 0);
        this.currentTransform.shake.y = this.transforms.shakeY.reduce((sum, val) => sum + val, 0);
        
        // ズーム（乗算）
        this.currentTransform.zoom = this.transforms.zoom.reduce((product, val) => product * val, 1);
        
        // 回転（加算）
        this.currentTransform.rotation = this.transforms.rotation.reduce((sum, val) => sum + val, 0);
        
        // フラッシュ（最大値）
        this.currentTransform.flash = this.transforms.flash.reduce((max, val) => {
            return val.a > max.a ? val : max;
        }, { r: 0, g: 0, b: 0, a: 0 });
        
        // 色調（混合）
        this.currentTransform.tint = this.transforms.tint.reduce((result, val) => {
            const totalAlpha = result.a + val.a * (1 - result.a);
            if (totalAlpha === 0) return result;
            
            return {
                r: (result.r * result.a + val.r * val.a * (1 - result.a)) / totalAlpha,
                g: (result.g * result.a + val.g * val.a * (1 - result.a)) / totalAlpha,
                b: (result.b * result.a + val.b * val.a * (1 - result.a)) / totalAlpha,
                a: totalAlpha
            };
        }, { r: 0, g: 0, b: 0, a: 0 });
        
        // ぼかし（最大値）
        this.currentTransform.blur = Math.max(0, ...this.transforms.blur, 0);
    }
    
    /**
     * 変換をCanvasコンテキストに適用
     */
    applyTransform(context) {
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
    }
    
    /**
     * オーバーレイ効果を描画
     */
    renderOverlays(context) {
        const canvas = this.canvas;
        
        // 色調オーバーレイ
        if (this.currentTransform.tint.a > 0) {
            context.save();
            context.globalAlpha = this.currentTransform.tint.a;
            context.fillStyle = `rgb(${this.currentTransform.tint.r}, ${this.currentTransform.tint.g}, ${this.currentTransform.tint.b})`;
            context.globalCompositeOperation = 'multiply';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.restore();
        }
        
        // フラッシュオーバーレイ
        if (this.currentTransform.flash.a > 0) {
            context.save();
            context.globalAlpha = this.currentTransform.flash.a;
            context.fillStyle = `rgb(${this.currentTransform.flash.r}, ${this.currentTransform.flash.g}, ${this.currentTransform.flash.b})`;
            context.globalCompositeOperation = 'screen';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.restore();
        }
    }
    
    /**
     * 変換をリセット
     */
    resetTransform(context) {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.filter = 'none';
    }
    
    /**
     * 特定の効果を削除
     */
    removeEffect(effectId) {
        this.effects = this.effects.filter(effect => effect.id !== effectId);
    }
    
    /**
     * 全ての効果をクリア
     */
    clearEffects() {
        this.effects = [];
        this.currentTransform = {
            shake: { x: 0, y: 0 },
            zoom: 1,
            rotation: 0,
            flash: { r: 0, g: 0, b: 0, a: 0 },
            tint: { r: 0, g: 0, b: 0, a: 0 },
            blur: 0
        };
    }
    
    /**
     * 現在の変換状態を取得
     */
    getCurrentTransform() {
        return { ...this.currentTransform };
    }
    
    /**
     * アクティブな効果数を取得
     */
    getActiveEffectCount() {
        return this.effects.length;
    }
    
    /**
     * 前処理エフェクトを描画（変換適用）
     */
    renderPreEffects(context) {
        context.save();
        // 一時的に変換を無効化してテスト
        // this.applyTransform(context);
    }
    
    /**
     * 後処理エフェクトを描画（オーバーレイ）
     */
    renderPostEffects(context) {
        // 一時的にオーバーレイも無効化してテスト
        // this.resetTransform(context);
        // this.renderOverlays(context);
        context.restore();
    }
    
    /**
     * 全ての効果をクリア（clearAllEffectsエイリアス）
     */
    clearAllEffects() {
        this.clearEffects();
    }

    /**
     * 設定システムとの連携を更新
     * 動的な設定変更に対応
     */
    updateConfiguration() {
        try {
            // 設定を再読み込み
            const params = this._getEffectParameters();
            
            // 画面効果が無効になった場合、全ての効果をクリア
            if (!params.enabled) {
                this.clearEffects();
            }
            
            console.log('[EffectManager] 設定を更新しました');
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EffectManager.updateConfiguration'
            });
        }
    }

    /**
     * 設定値を動的に変更
     * @param {string} key - 設定キー
     * @param {*} value - 設定値
     */
    setConfigValue(key, value) {
        try {
            switch (key) {
                case 'shakeIntensity':
                    this.effectsConfig.setShakeIntensity(value);
                    break;
                case 'flashDuration':
                    this.effectsConfig.setFlashDuration(value);
                    break;
                case 'zoomSensitivity':
                    this.effectsConfig.setZoomSensitivity(value);
                    break;
                case 'enabled':
                    this.effectsConfig.setScreenEffectEnabled(value);
                    break;
                default:
                    console.warn(`[EffectManager] 未知の設定キー: ${key}`);
                    return false;
            }
            
            // 設定変更後に更新
            this.updateConfiguration();
            return true;
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EffectManager.setConfigValue'
            });
            return false;
        }
    }

    /**
     * 現在の設定値を取得
     * @param {string} key - 設定キー
     * @returns {*} 設定値
     */
    getConfigValue(key) {
        try {
            switch (key) {
                case 'shakeIntensity':
                    return this.effectsConfig.getShakeIntensity();
                case 'flashDuration':
                    return this.effectsConfig.getFlashDuration();
                case 'zoomSensitivity':
                    return this.effectsConfig.getZoomSensitivity();
                case 'enabled':
                    return this.effectsConfig.isScreenEffectEnabled();
                default:
                    console.warn(`[EffectManager] 未知の設定キー: ${key}`);
                    return null;
            }
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EffectManager.getConfigValue'
            });
            return null;
        }
    }

    /**
     * 設定システムとの連携を適用
     * EffectsConfigから呼び出される
     */
    applyConfiguration() {
        try {
            this.updateConfiguration();
            console.log('[EffectManager] 設定システムとの連携を適用しました');
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EffectManager.applyConfiguration'
            });
        }
    }

    /**
     * リソースのクリーンアップ
     */
    dispose() {
        try {
            // 設定監視の解除
            for (const [key, watcher] of this.configWatchers) {
                if (watcher && typeof watcher.unwatch === 'function') {
                    watcher.unwatch();
                }
            }
            this.configWatchers.clear();
            
            // 全ての効果をクリア
            this.clearEffects();
            
            console.log('[EffectManager] リソースをクリーンアップしました');
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EffectManager.dispose'
            });
        }
    }
    
    /**
     * 画面フラッシュ効果を追加（GameEngineとの互換性）
     */
    addScreenFlash(intensity, duration, color = '#FFFFFF') {
        return this.addFlash(color, intensity, duration, 'out');
    }
    
    /**
     * 画面色調効果を追加（GameEngineとの互換性）
     */
    addScreenTint(intensity, duration, color = '#FFFFFF') {
        return this.addTint(color, intensity, duration);
    }
    
    /**
     * ビネット効果を追加
     */
    addVignette(intensity, duration) {
        // ビネット効果は色調効果として実装
        return this.addTint('#000000', intensity, duration);
    }
    
    /**
     * エフェクトシステムを無効化
     * エラー復旧やセーフモード時に使用
     */
    disable() {
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
                this.transforms[key] = [];
            });
            
            console.log('[EffectManager] エフェクトシステムを無効化しました');
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EffectManager.disable'
            });
        }
    }
    
    /**
     * エフェクトシステムを有効化
     */
    enable() {
        console.log('[EffectManager] エフェクトシステムを有効化しました');
    }
    
    /**
     * エフェクトの品質レベルを設定（ErrorRecovery用）
     * @param {string} level - 品質レベル ('high', 'medium', 'low')
     */
    setQualityLevel(level) {
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
}