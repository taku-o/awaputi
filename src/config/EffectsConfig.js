/**
 * 視覚効果設定クラス
 * 
 * パーティクル、画面効果、アニメーション設定を統合し、
 * ParticleManagerとEffectManagerとの連携インターフェースを提供します。
 */

import { getConfigurationManager } from '../core/ConfigurationManager.js';
import { getErrorHandler } from '../utils/ErrorHandler.js';

class EffectsConfig {
    constructor() {
        this.configManager = getConfigurationManager();
        this._initialize();
    }

    /**
     * 初期化処理 - デフォルト設定の登録
     * @private
     */
    _initialize() {
        try {
            // パーティクル設定の初期化
            this._initializeParticleConfig();
            
            // 画面効果設定の初期化
            this._initializeScreenEffectConfig();
            
            // アニメーション設定の初期化
            this._initializeAnimationConfig();
            
            // 検証ルールの設定
            this._setupValidationRules();
            
            console.log('[EffectsConfig] 初期化完了');
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EffectsConfig._initialize'
            });
        }
    }

    /**
     * パーティクル設定の初期化
     * @private
     */
    _initializeParticleConfig() {
        // デフォルトパーティクル設定
        this.configManager.set('effects', 'particles.maxCount', 500);
        this.configManager.set('effects', 'particles.poolSize', 100);
        this.configManager.set('effects', 'particles.quality', 1.0);
        this.configManager.set('effects', 'particles.enabled', true);
        
        // パーティクルタイプ別設定
        this.configManager.set('effects', 'particles.bubble.count', 15);
        this.configManager.set('effects', 'particles.bubble.size', 3);
        this.configManager.set('effects', 'particles.bubble.speed', 100);
        this.configManager.set('effects', 'particles.bubble.life', 800);
        
        this.configManager.set('effects', 'particles.star.count', 10);
        this.configManager.set('effects', 'particles.star.size', 4);
        this.configManager.set('effects', 'particles.star.speed', 80);
        this.configManager.set('effects', 'particles.star.life', 1200);
        
        this.configManager.set('effects', 'particles.explosion.count', 30);
        this.configManager.set('effects', 'particles.explosion.size', 5);
        this.configManager.set('effects', 'particles.explosion.speed', 150);
        this.configManager.set('effects', 'particles.explosion.life', 1500);
    }

    /**
     * 画面効果設定の初期化
     * @private
     */
    _initializeScreenEffectConfig() {
        // デフォルト画面効果設定
        this.configManager.set('effects', 'screen.shakeIntensity', 1.0);
        this.configManager.set('effects', 'screen.flashDuration', 200);
        this.configManager.set('effects', 'screen.zoomSensitivity', 1.0);
        this.configManager.set('effects', 'screen.enabled', true);
        
        // 効果タイプ別設定
        this.configManager.set('effects', 'screen.shake.intensity', 10);
        this.configManager.set('effects', 'screen.shake.duration', 500);
        this.configManager.set('effects', 'screen.shake.damping', 0.9);
        
        this.configManager.set('effects', 'screen.flash.intensity', 0.5);
        this.configManager.set('effects', 'screen.flash.duration', 200);
        
        this.configManager.set('effects', 'screen.zoom.min', 0.8);
        this.configManager.set('effects', 'screen.zoom.max', 1.2);
        this.configManager.set('effects', 'screen.zoom.speed', 0.3);
        
        this.configManager.set('effects', 'screen.tint.intensity', 0.3);
        this.configManager.set('effects', 'screen.tint.duration', 500);
    }

    /**
     * アニメーション設定の初期化
     * @private
     */
    _initializeAnimationConfig() {
        // デフォルトアニメーション設定
        this.configManager.set('effects', 'animations.duration', 300);
        this.configManager.set('effects', 'animations.easing', 'easeOut');
        this.configManager.set('effects', 'animations.enabled', true);
        
        // アニメーションタイプ別設定
        this.configManager.set('effects', 'animations.pop.duration', 300);
        this.configManager.set('effects', 'animations.pop.scale', 1.2);
        this.configManager.set('effects', 'animations.pop.easing', 'easeOutBack');
        
        this.configManager.set('effects', 'animations.fade.duration', 500);
        this.configManager.set('effects', 'animations.fade.easing', 'easeInOut');
        
        this.configManager.set('effects', 'animations.slide.duration', 400);
        this.configManager.set('effects', 'animations.slide.distance', 50);
        this.configManager.set('effects', 'animations.slide.easing', 'easeOutQuad');
        
        this.configManager.set('effects', 'animations.bounce.duration', 600);
        this.configManager.set('effects', 'animations.bounce.height', 30);
        this.configManager.set('effects', 'animations.bounce.easing', 'easeOutBounce');
    }

    /**
     * 検証ルールの設定
     * @private
     */
    _setupValidationRules() {
        // パーティクル設定の検証ルール
        this.configManager.setValidationRule('effects', 'particles.maxCount', {
            type: 'number',
            min: 0,
            max: 2000
        });
        
        this.configManager.setValidationRule('effects', 'particles.poolSize', {
            type: 'number',
            min: 0,
            max: 1000
        });
        
        this.configManager.setValidationRule('effects', 'particles.quality', {
            type: 'number',
            min: 0.1,
            max: 2.0
        });
        
        this.configManager.setValidationRule('effects', 'particles.enabled', {
            type: 'boolean'
        });
        
        // 画面効果設定の検証ルール
        this.configManager.setValidationRule('effects', 'screen.shakeIntensity', {
            type: 'number',
            min: 0,
            max: 2.0
        });
        
        this.configManager.setValidationRule('effects', 'screen.flashDuration', {
            type: 'number',
            min: 0,
            max: 1000
        });
        
        this.configManager.setValidationRule('effects', 'screen.zoomSensitivity', {
            type: 'number',
            min: 0.1,
            max: 2.0
        });
        
        this.configManager.setValidationRule('effects', 'screen.enabled', {
            type: 'boolean'
        });
        
        // アニメーション設定の検証ルール
        this.configManager.setValidationRule('effects', 'animations.duration', {
            type: 'number',
            min: 0,
            max: 2000
        });
        
        this.configManager.setValidationRule('effects', 'animations.easing', {
            type: 'string',
            validator: (value) => ['linear', 'easeIn', 'easeOut', 'easeInOut', 'easeOutBounce'].includes(value)
        });
        
        this.configManager.setValidationRule('effects', 'animations.enabled', {
            type: 'boolean'
        });
    }

    /**
     * パーティクル設定を取得
     * @returns {Object} パーティクル設定
     */
    getParticleConfig() {
        return {
            maxCount: this.configManager.get('effects', 'particles.maxCount', 500),
            poolSize: this.configManager.get('effects', 'particles.poolSize', 100),
            quality: this.configManager.get('effects', 'particles.quality', 1.0),
            enabled: this.configManager.get('effects', 'particles.enabled', true),
            bubble: {
                count: this.configManager.get('effects', 'particles.bubble.count', 15),
                size: this.configManager.get('effects', 'particles.bubble.size', 3),
                speed: this.configManager.get('effects', 'particles.bubble.speed', 100),
                life: this.configManager.get('effects', 'particles.bubble.life', 800)
            },
            star: {
                count: this.configManager.get('effects', 'particles.star.count', 10),
                size: this.configManager.get('effects', 'particles.star.size', 4),
                speed: this.configManager.get('effects', 'particles.star.speed', 80),
                life: this.configManager.get('effects', 'particles.star.life', 1200)
            },
            explosion: {
                count: this.configManager.get('effects', 'particles.explosion.count', 30),
                size: this.configManager.get('effects', 'particles.explosion.size', 5),
                speed: this.configManager.get('effects', 'particles.explosion.speed', 150),
                life: this.configManager.get('effects', 'particles.explosion.life', 1500)
            }
        };
    }

    /**
     * 最大パーティクル数を取得
     * @returns {number} 最大パーティクル数
     */
    getMaxParticleCount() {
        return this.configManager.get('effects', 'particles.maxCount', 500);
    }

    /**
     * パーティクルプールサイズを取得
     * @returns {number} パーティクルプールサイズ
     */
    getParticlePoolSize() {
        return this.configManager.get('effects', 'particles.poolSize', 100);
    }

    /**
     * パーティクル品質を取得
     * @returns {number} パーティクル品質 (0.1-2.0)
     */
    getParticleQuality() {
        return this.configManager.get('effects', 'particles.quality', 1.0);
    }

    /**
     * パーティクル有効状態を取得
     * @returns {boolean} パーティクル有効状態
     */
    isParticleEnabled() {
        return this.configManager.get('effects', 'particles.enabled', true);
    }

    /**
     * 最大パーティクル数を設定
     * @param {number} count - 最大パーティクル数
     * @returns {boolean} 設定成功フラグ
     */
    setMaxParticleCount(count) {
        return this.configManager.set('effects', 'particles.maxCount', count);
    }

    /**
     * パーティクルプールサイズを設定
     * @param {number} size - パーティクルプールサイズ
     * @returns {boolean} 設定成功フラグ
     */
    setParticlePoolSize(size) {
        return this.configManager.set('effects', 'particles.poolSize', size);
    }

    /**
     * パーティクル品質を設定
     * @param {number} quality - パーティクル品質 (0.1-2.0)
     * @returns {boolean} 設定成功フラグ
     */
    setParticleQuality(quality) {
        return this.configManager.set('effects', 'particles.quality', quality);
    }

    /**
     * パーティクル有効状態を設定
     * @param {boolean} enabled - パーティクル有効状態
     * @returns {boolean} 設定成功フラグ
     */
    setParticleEnabled(enabled) {
        return this.configManager.set('effects', 'particles.enabled', enabled);
    }

    /**
     * 画面効果設定を取得
     * @returns {Object} 画面効果設定
     */
    getScreenEffectConfig() {
        return {
            shakeIntensity: this.configManager.get('effects', 'screen.shakeIntensity', 1.0),
            flashDuration: this.configManager.get('effects', 'screen.flashDuration', 200),
            zoomSensitivity: this.configManager.get('effects', 'screen.zoomSensitivity', 1.0),
            enabled: this.configManager.get('effects', 'screen.enabled', true),
            shake: {
                intensity: this.configManager.get('effects', 'screen.shake.intensity', 10),
                duration: this.configManager.get('effects', 'screen.shake.duration', 500),
                damping: this.configManager.get('effects', 'screen.shake.damping', 0.9)
            },
            flash: {
                intensity: this.configManager.get('effects', 'screen.flash.intensity', 0.5),
                duration: this.configManager.get('effects', 'screen.flash.duration', 200)
            },
            zoom: {
                min: this.configManager.get('effects', 'screen.zoom.min', 0.8),
                max: this.configManager.get('effects', 'screen.zoom.max', 1.2),
                speed: this.configManager.get('effects', 'screen.zoom.speed', 0.3)
            },
            tint: {
                intensity: this.configManager.get('effects', 'screen.tint.intensity', 0.3),
                duration: this.configManager.get('effects', 'screen.tint.duration', 500)
            }
        };
    }

    /**
     * 画面揺れ強度を取得
     * @returns {number} 画面揺れ強度 (0-2.0)
     */
    getShakeIntensity() {
        return this.configManager.get('effects', 'screen.shakeIntensity', 1.0);
    }

    /**
     * フラッシュ時間を取得
     * @returns {number} フラッシュ時間 (ms)
     */
    getFlashDuration() {
        return this.configManager.get('effects', 'screen.flashDuration', 200);
    }

    /**
     * ズーム感度を取得
     * @returns {number} ズーム感度 (0.1-2.0)
     */
    getZoomSensitivity() {
        return this.configManager.get('effects', 'screen.zoomSensitivity', 1.0);
    }

    /**
     * 画面効果有効状態を取得
     * @returns {boolean} 画面効果有効状態
     */
    isScreenEffectEnabled() {
        return this.configManager.get('effects', 'screen.enabled', true);
    }

    /**
     * 画面揺れ強度を設定
     * @param {number} intensity - 画面揺れ強度 (0-2.0)
     * @returns {boolean} 設定成功フラグ
     */
    setShakeIntensity(intensity) {
        return this.configManager.set('effects', 'screen.shakeIntensity', intensity);
    }

    /**
     * フラッシュ時間を設定
     * @param {number} duration - フラッシュ時間 (ms)
     * @returns {boolean} 設定成功フラグ
     */
    setFlashDuration(duration) {
        return this.configManager.set('effects', 'screen.flashDuration', duration);
    }

    /**
     * ズーム感度を設定
     * @param {number} sensitivity - ズーム感度 (0.1-2.0)
     * @returns {boolean} 設定成功フラグ
     */
    setZoomSensitivity(sensitivity) {
        return this.configManager.set('effects', 'screen.zoomSensitivity', sensitivity);
    }

    /**
     * 画面効果有効状態を設定
     * @param {boolean} enabled - 画面効果有効状態
     * @returns {boolean} 設定成功フラグ
     */
    setScreenEffectEnabled(enabled) {
        return this.configManager.set('effects', 'screen.enabled', enabled);
    }

    /**
     * アニメーション設定を取得
     * @returns {Object} アニメーション設定
     */
    getAnimationConfig() {
        return {
            duration: this.configManager.get('effects', 'animations.duration', 300),
            easing: this.configManager.get('effects', 'animations.easing', 'easeOut'),
            enabled: this.configManager.get('effects', 'animations.enabled', true),
            pop: {
                duration: this.configManager.get('effects', 'animations.pop.duration', 300),
                scale: this.configManager.get('effects', 'animations.pop.scale', 1.2),
                easing: this.configManager.get('effects', 'animations.pop.easing', 'easeOutBack')
            },
            fade: {
                duration: this.configManager.get('effects', 'animations.fade.duration', 500),
                easing: this.configManager.get('effects', 'animations.fade.easing', 'easeInOut')
            },
            slide: {
                duration: this.configManager.get('effects', 'animations.slide.duration', 400),
                distance: this.configManager.get('effects', 'animations.slide.distance', 50),
                easing: this.configManager.get('effects', 'animations.slide.easing', 'easeOutQuad')
            },
            bounce: {
                duration: this.configManager.get('effects', 'animations.bounce.duration', 600),
                height: this.configManager.get('effects', 'animations.bounce.height', 30),
                easing: this.configManager.get('effects', 'animations.bounce.easing', 'easeOutBounce')
            }
        };
    }

    /**
     * アニメーション時間を取得
     * @returns {number} アニメーション時間 (ms)
     */
    getAnimationDuration() {
        return this.configManager.get('effects', 'animations.duration', 300);
    }

    /**
     * アニメーションイージングを取得
     * @returns {string} アニメーションイージング
     */
    getAnimationEasing() {
        return this.configManager.get('effects', 'animations.easing', 'easeOut');
    }

    /**
     * アニメーション有効状態を取得
     * @returns {boolean} アニメーション有効状態
     */
    isAnimationEnabled() {
        return this.configManager.get('effects', 'animations.enabled', true);
    }

    /**
     * アニメーション時間を設定
     * @param {number} duration - アニメーション時間 (ms)
     * @returns {boolean} 設定成功フラグ
     */
    setAnimationDuration(duration) {
        return this.configManager.set('effects', 'animations.duration', duration);
    }

    /**
     * アニメーションイージングを設定
     * @param {string} easing - アニメーションイージング
     * @returns {boolean} 設定成功フラグ
     */
    setAnimationEasing(easing) {
        return this.configManager.set('effects', 'animations.easing', easing);
    }

    /**
     * アニメーション有効状態を設定
     * @param {boolean} enabled - アニメーション有効状態
     * @returns {boolean} 設定成功フラグ
     */
    setAnimationEnabled(enabled) {
        return this.configManager.set('effects', 'animations.enabled', enabled);
    }

    /**
     * ParticleManagerとの連携インターフェース
     * ParticleManagerに現在の設定を適用する
     * @param {ParticleManager} particleManager - ParticleManagerインスタンス
     */
    applyToParticleManager(particleManager) {
        try {
            if (!particleManager) {
                throw new Error('ParticleManagerが指定されていません');
            }
            
            // パーティクル設定の適用
            const particleConfig = this.getParticleConfig();
            particleManager.maxParticles = particleConfig.maxCount;
            particleManager.poolSize = particleConfig.poolSize;
            
            // パーティクルプールの再初期化（必要に応じて）
            if (particleManager.particlePool.length !== particleConfig.poolSize) {
                particleManager.particlePool = [];
                particleManager.initializePool();
            }
            
            console.log('[EffectsConfig] ParticleManagerに設定を適用しました');
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EffectsConfig.applyToParticleManager'
            });
        }
    }

    /**
     * EffectManagerとの連携インターフェース
     * EffectManagerに現在の設定を適用する
     * @param {EffectManager} effectManager - EffectManagerインスタンス
     */
    applyToEffectManager(effectManager) {
        try {
            if (!effectManager) {
                throw new Error('EffectManagerが指定されていません');
            }
            
            // EffectManagerの設定適用メソッドを呼び出し
            if (typeof effectManager.applyConfiguration === 'function') {
                effectManager.applyConfiguration();
            }
            
            console.log('[EffectsConfig] EffectManagerに設定を適用しました');
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EffectsConfig.applyToEffectManager'
            });
        }
    }

    /**
     * ParticleManagerから設定を同期
     * @param {ParticleManager} particleManager - ParticleManagerインスタンス
     */
    syncFromParticleManager(particleManager) {
        try {
            if (!particleManager) {
                throw new Error('ParticleManagerが指定されていません');
            }
            
            // ParticleManagerの状態を取得
            this.setMaxParticleCount(particleManager.maxParticles);
            this.setParticlePoolSize(particleManager.poolSize);
            
            console.log('[EffectsConfig] ParticleManagerから設定を同期しました');
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EffectsConfig.syncFromParticleManager'
            });
        }
    }

    /**
     * EffectManagerから設定を同期
     * @param {EffectManager} effectManager - EffectManagerインスタンス
     */
    syncFromEffectManager(effectManager) {
        try {
            if (!effectManager) {
                throw new Error('EffectManagerが指定されていません');
            }
            
            // EffectManagerから現在の設定値を取得して同期
            const shakeIntensity = effectManager.getConfigValue('shakeIntensity');
            const flashDuration = effectManager.getConfigValue('flashDuration');
            const zoomSensitivity = effectManager.getConfigValue('zoomSensitivity');
            const enabled = effectManager.getConfigValue('enabled');
            
            if (shakeIntensity !== null) {
                this.setShakeIntensity(shakeIntensity);
            }
            if (flashDuration !== null) {
                this.setFlashDuration(flashDuration);
            }
            if (zoomSensitivity !== null) {
                this.setZoomSensitivity(zoomSensitivity);
            }
            if (enabled !== null) {
                this.setScreenEffectEnabled(enabled);
            }
            
            console.log('[EffectsConfig] EffectManagerから設定を同期しました');
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'EffectsConfig.syncFromEffectManager'
            });
        }
    }
}

// シングルトンインスタンス
let instance = null;

/**
 * EffectsConfigのシングルトンインスタンスを取得
 * @returns {EffectsConfig} インスタンス
 */
function getEffectsConfig() {
    if (!instance) {
        instance = new EffectsConfig();
    }
    return instance;
}

export {
    EffectsConfig,
    getEffectsConfig
};