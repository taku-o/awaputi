/**
 * パフォーマンス設定クラス
 * 
 * 最適化、リソース制限、品質設定を統合し、
 * PerformanceOptimizerとの連携インターフェースを提供します。
 */

import { getConfigurationManager } from '../core/ConfigurationManager.js';
import { getErrorHandler } from '../utils/ErrorHandler.js';

class PerformanceConfig {
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
            // 最適化設定の初期化
            this._initializeOptimizationConfig();
            
            // リソース制限設定の初期化
            this._initializeResourceLimitConfig();
            
            // 品質設定の初期化
            this._initializeQualityConfig();
            
            // 検証ルールの設定
            this._setupValidationRules();
            
            console.log('[PerformanceConfig] 初期化完了');
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'PerformanceConfig._initialize'
            });
        }
    }

    /**
     * 最適化設定の初期化
     * @private
     */
    _initializeOptimizationConfig() {
        // デフォルト最適化設定
        this.configManager.set('performance', 'optimization.targetFPS', 60);
        this.configManager.set('performance', 'optimization.adaptiveMode', true);
        this.configManager.set('performance', 'optimization.optimizationInterval', 1000);
        this.configManager.set('performance', 'optimization.maxHistorySize', 30);
        
        // 最適化レベル設定
        this.configManager.set('performance', 'optimization.performanceLevel', 'high'); // 'low', 'medium', 'high'
        this.configManager.set('performance', 'optimization.maxBubbles', 20);
        this.configManager.set('performance', 'optimization.maxParticles', 500);
        this.configManager.set('performance', 'optimization.workloadDistribution', true);
        this.configManager.set('performance', 'optimization.maxTimePerFrame', 8); // ms
        
        // 追加の性能設定（エラー修正用）
        this.configManager.set('performance', 'level', 'high');
        this.configManager.set('performance', 'adaptive', true);
        this.configManager.set('performance', 'quality.audioQuality', 1.0);
    }

    /**
     * リソース制限設定の初期化
     * @private
     */
    _initializeResourceLimitConfig() {
        // デフォルトリソース制限設定
        this.configManager.set('performance', 'limits.memoryThreshold', 100); // MB
        this.configManager.set('performance', 'limits.fpsThreshold', 30);
        this.configManager.set('performance', 'limits.maxTextureSize', 2048);
        this.configManager.set('performance', 'limits.maxAssetSize', 5); // MB
        
        // 自動調整設定
        this.configManager.set('performance', 'limits.autoAdjust', true);
        this.configManager.set('performance', 'limits.warningThreshold', 0.8);
        this.configManager.set('performance', 'limits.criticalThreshold', 0.95);
        this.configManager.set('performance', 'limits.cleanupInterval', 30000); // 30秒
    }

    /**
     * 品質設定の初期化
     * @private
     */
    _initializeQualityConfig() {
        // デフォルト品質設定
        this.configManager.set('performance', 'quality.renderQuality', 1.0); // 0.5 - 1.0
        this.configManager.set('performance', 'quality.particleQuality', 1.0); // 0.1 - 1.0
        this.configManager.set('performance', 'quality.effectQuality', 1.0); // 0.1 - 1.0
        this.configManager.set('performance', 'quality.audioQuality', 1.0); // 0.1 - 1.0
        
        // 視覚効果設定
        this.configManager.set('performance', 'quality.enableShadows', true);
        this.configManager.set('performance', 'quality.enableBlur', true);
        this.configManager.set('performance', 'quality.enableAntiAliasing', true);
        this.configManager.set('performance', 'quality.enableReflections', true);
        
        // 品質プリセット
        this.configManager.set('performance', 'quality.presets.low', {
            renderQuality: 0.7,
            particleQuality: 0.3,
            effectQuality: 0.2,
            audioQuality: 0.5,
            enableShadows: false,
            enableBlur: false,
            enableAntiAliasing: false,
            enableReflections: false
        });
        
        this.configManager.set('performance', 'quality.presets.medium', {
            renderQuality: 0.85,
            particleQuality: 0.6,
            effectQuality: 0.6,
            audioQuality: 0.8,
            enableShadows: false,
            enableBlur: true,
            enableAntiAliasing: false,
            enableReflections: false
        });
        
        this.configManager.set('performance', 'quality.presets.high', {
            renderQuality: 1.0,
            particleQuality: 1.0,
            effectQuality: 1.0,
            audioQuality: 1.0,
            enableShadows: true,
            enableBlur: true,
            enableAntiAliasing: true,
            enableReflections: true
        });
    }

    /**
     * 検証ルールの設定
     * @private
     */
    _setupValidationRules() {
        // 最適化設定の検証ルール
        this.configManager.setValidationRule('performance', 'optimization.targetFPS', {
            type: 'number',
            min: 30,
            max: 144
        });
        
        this.configManager.setValidationRule('performance', 'optimization.adaptiveMode', {
            type: 'boolean'
        });
        
        this.configManager.setValidationRule('performance', 'optimization.optimizationInterval', {
            type: 'number',
            min: 100,
            max: 10000
        });
        
        this.configManager.setValidationRule('performance', 'optimization.maxHistorySize', {
            type: 'number',
            min: 10,
            max: 100
        });
        
        this.configManager.setValidationRule('performance', 'optimization.performanceLevel', {
            type: 'string',
            validator: (value) => ['low', 'medium', 'high'].includes(value)
        });
        
        this.configManager.setValidationRule('performance', 'optimization.maxBubbles', {
            type: 'number',
            min: 5,
            max: 50
        });
        
        this.configManager.setValidationRule('performance', 'optimization.maxParticles', {
            type: 'number',
            min: 50,
            max: 2000
        });
        
        // リソース制限設定の検証ルール
        this.configManager.setValidationRule('performance', 'limits.memoryThreshold', {
            type: 'number',
            min: 50,
            max: 500
        });
        
        this.configManager.setValidationRule('performance', 'limits.fpsThreshold', {
            type: 'number',
            min: 15,
            max: 60
        });
        
        this.configManager.setValidationRule('performance', 'limits.maxTextureSize', {
            type: 'number',
            min: 512,
            max: 4096
        });
        
        // 品質設定の検証ルール
        this.configManager.setValidationRule('performance', 'quality.renderQuality', {
            type: 'number',
            min: 0.5,
            max: 1.0
        });
        
        this.configManager.setValidationRule('performance', 'quality.particleQuality', {
            type: 'number',
            min: 0.1,
            max: 1.0
        });
        
        this.configManager.setValidationRule('performance', 'quality.effectQuality', {
            type: 'number',
            min: 0.1,
            max: 1.0
        });
        
        this.configManager.setValidationRule('performance', 'quality.audioQuality', {
            type: 'number',
            min: 0.1,
            max: 1.0
        });
        
        this.configManager.setValidationRule('performance', 'quality.enableShadows', {
            type: 'boolean'
        });
        
        this.configManager.setValidationRule('performance', 'quality.enableBlur', {
            type: 'boolean'
        });
        
        this.configManager.setValidationRule('performance', 'quality.enableAntiAliasing', {
            type: 'boolean'
        });
        
        this.configManager.setValidationRule('performance', 'quality.enableReflections', {
            type: 'boolean'
        });
    }

    /**
     * 最適化設定を取得
     * @returns {Object} 最適化設定
     */
    getOptimizationConfig() {
        return {
            targetFPS: this.configManager.get('performance', 'optimization.targetFPS', 60),
            adaptiveMode: this.configManager.get('performance', 'optimization.adaptiveMode', true),
            optimizationInterval: this.configManager.get('performance', 'optimization.optimizationInterval', 1000),
            maxHistorySize: this.configManager.get('performance', 'optimization.maxHistorySize', 30),
            performanceLevel: this.configManager.get('performance', 'optimization.performanceLevel', 'high'),
            maxBubbles: this.configManager.get('performance', 'optimization.maxBubbles', 20),
            maxParticles: this.configManager.get('performance', 'optimization.maxParticles', 500),
            workloadDistribution: this.configManager.get('performance', 'optimization.workloadDistribution', true),
            maxTimePerFrame: this.configManager.get('performance', 'optimization.maxTimePerFrame', 8)
        };
    }

    /**
     * 目標FPSを取得
     * @returns {number} 目標FPS
     */
    getTargetFPS() {
        return this.configManager.get('performance', 'optimization.targetFPS', 60);
    }

    /**
     * 適応モードの有効状態を取得
     * @returns {boolean} 適応モードの有効状態
     */
    isAdaptiveModeEnabled() {
        return this.configManager.get('performance', 'optimization.adaptiveMode', true);
    }

    /**
     * パフォーマンスレベルを取得
     * @returns {string} パフォーマンスレベル ('low', 'medium', 'high')
     */
    getPerformanceLevel() {
        return this.configManager.get('performance', 'optimization.performanceLevel', 'high');
    }

    /**
     * 最大バブル数を取得
     * @returns {number} 最大バブル数
     */
    getMaxBubbles() {
        return this.configManager.get('performance', 'optimization.maxBubbles', 20);
    }

    /**
     * 最大パーティクル数を取得
     * @returns {number} 最大パーティクル数
     */
    getMaxParticles() {
        return this.configManager.get('performance', 'optimization.maxParticles', 500);
    }

    /**
     * 目標FPSを設定
     * @param {number} fps - 目標FPS
     * @returns {boolean} 設定成功フラグ
     */
    setTargetFPS(fps) {
        return this.configManager.set('performance', 'optimization.targetFPS', fps);
    }

    /**
     * 適応モードの有効状態を設定
     * @param {boolean} enabled - 適応モードの有効状態
     * @returns {boolean} 設定成功フラグ
     */
    setAdaptiveModeEnabled(enabled) {
        return this.configManager.set('performance', 'optimization.adaptiveMode', enabled);
    }

    /**
     * パフォーマンスレベルを設定
     * @param {string} level - パフォーマンスレベル ('low', 'medium', 'high')
     * @returns {boolean} 設定成功フラグ
     */
    setPerformanceLevel(level) {
        return this.configManager.set('performance', 'optimization.performanceLevel', level);
    }

    /**
     * 最大バブル数を設定
     * @param {number} count - 最大バブル数
     * @returns {boolean} 設定成功フラグ
     */
    setMaxBubbles(count) {
        return this.configManager.set('performance', 'optimization.maxBubbles', count);
    }

    /**
     * 最大パーティクル数を設定
     * @param {number} count - 最大パーティクル数
     * @returns {boolean} 設定成功フラグ
     */
    setMaxParticles(count) {
        return this.configManager.set('performance', 'optimization.maxParticles', count);
    }

    /**
     * リソース制限設定を取得
     * @returns {Object} リソース制限設定
     */
    getResourceLimitConfig() {
        return {
            memoryThreshold: this.configManager.get('performance', 'limits.memoryThreshold', 100),
            fpsThreshold: this.configManager.get('performance', 'limits.fpsThreshold', 30),
            maxTextureSize: this.configManager.get('performance', 'limits.maxTextureSize', 2048),
            maxAssetSize: this.configManager.get('performance', 'limits.maxAssetSize', 5),
            autoAdjust: this.configManager.get('performance', 'limits.autoAdjust', true),
            warningThreshold: this.configManager.get('performance', 'limits.warningThreshold', 0.8),
            criticalThreshold: this.configManager.get('performance', 'limits.criticalThreshold', 0.95),
            cleanupInterval: this.configManager.get('performance', 'limits.cleanupInterval', 30000)
        };
    }

    /**
     * メモリ閾値を取得
     * @returns {number} メモリ閾値 (MB)
     */
    getMemoryThreshold() {
        return this.configManager.get('performance', 'limits.memoryThreshold', 100);
    }

    /**
     * FPS閾値を取得
     * @returns {number} FPS閾値
     */
    getFPSThreshold() {
        return this.configManager.get('performance', 'limits.fpsThreshold', 30);
    }

    /**
     * 最大テクスチャサイズを取得
     * @returns {number} 最大テクスチャサイズ
     */
    getMaxTextureSize() {
        return this.configManager.get('performance', 'limits.maxTextureSize', 2048);
    }

    /**
     * 自動調整の有効状態を取得
     * @returns {boolean} 自動調整の有効状態
     */
    isAutoAdjustEnabled() {
        return this.configManager.get('performance', 'limits.autoAdjust', true);
    }

    /**
     * メモリ閾値を設定
     * @param {number} threshold - メモリ閾値 (MB)
     * @returns {boolean} 設定成功フラグ
     */
    setMemoryThreshold(threshold) {
        return this.configManager.set('performance', 'limits.memoryThreshold', threshold);
    }

    /**
     * FPS閾値を設定
     * @param {number} threshold - FPS閾値
     * @returns {boolean} 設定成功フラグ
     */
    setFPSThreshold(threshold) {
        return this.configManager.set('performance', 'limits.fpsThreshold', threshold);
    }

    /**
     * 最大テクスチャサイズを設定
     * @param {number} size - 最大テクスチャサイズ
     * @returns {boolean} 設定成功フラグ
     */
    setMaxTextureSize(size) {
        return this.configManager.set('performance', 'limits.maxTextureSize', size);
    }

    /**
     * 自動調整の有効状態を設定
     * @param {boolean} enabled - 自動調整の有効状態
     * @returns {boolean} 設定成功フラグ
     */
    setAutoAdjustEnabled(enabled) {
        return this.configManager.set('performance', 'limits.autoAdjust', enabled);
    }

    /**
     * 品質設定を取得
     * @returns {Object} 品質設定
     */
    getQualityConfig() {
        return {
            renderQuality: this.configManager.get('performance', 'quality.renderQuality', 1.0),
            particleQuality: this.configManager.get('performance', 'quality.particleQuality', 1.0),
            effectQuality: this.configManager.get('performance', 'quality.effectQuality', 1.0),
            audioQuality: this.configManager.get('performance', 'quality.audioQuality', 1.0),
            enableShadows: this.configManager.get('performance', 'quality.enableShadows', true),
            enableBlur: this.configManager.get('performance', 'quality.enableBlur', true),
            enableAntiAliasing: this.configManager.get('performance', 'quality.enableAntiAliasing', true),
            enableReflections: this.configManager.get('performance', 'quality.enableReflections', true)
        };
    }

    /**
     * レンダリング品質を取得
     * @returns {number} レンダリング品質 (0.5-1.0)
     */
    getRenderQuality() {
        return this.configManager.get('performance', 'quality.renderQuality', 1.0);
    }

    /**
     * パーティクル品質を取得
     * @returns {number} パーティクル品質 (0.1-1.0)
     */
    getParticleQuality() {
        return this.configManager.get('performance', 'quality.particleQuality', 1.0);
    }

    /**
     * エフェクト品質を取得
     * @returns {number} エフェクト品質 (0.1-1.0)
     */
    getEffectQuality() {
        return this.configManager.get('performance', 'quality.effectQuality', 1.0);
    }

    /**
     * 音声品質を取得
     * @returns {number} 音声品質 (0.1-1.0)
     */
    getAudioQuality() {
        return this.configManager.get('performance', 'quality.audioQuality', 1.0);
    }

    /**
     * 影エフェクトの有効状態を取得
     * @returns {boolean} 影エフェクトの有効状態
     */
    areShadowsEnabled() {
        return this.configManager.get('performance', 'quality.enableShadows', true);
    }

    /**
     * ブラーエフェクトの有効状態を取得
     * @returns {boolean} ブラーエフェクトの有効状態
     */
    isBlurEnabled() {
        return this.configManager.get('performance', 'quality.enableBlur', true);
    }

    /**
     * アンチエイリアシングの有効状態を取得
     * @returns {boolean} アンチエイリアシングの有効状態
     */
    isAntiAliasingEnabled() {
        return this.configManager.get('performance', 'quality.enableAntiAliasing', true);
    }

    /**
     * 反射エフェクトの有効状態を取得
     * @returns {boolean} 反射エフェクトの有効状態
     */
    areReflectionsEnabled() {
        return this.configManager.get('performance', 'quality.enableReflections', true);
    }

    /**
     * レンダリング品質を設定
     * @param {number} quality - レンダリング品質 (0.5-1.0)
     * @returns {boolean} 設定成功フラグ
     */
    setRenderQuality(quality) {
        return this.configManager.set('performance', 'quality.renderQuality', quality);
    }

    /**
     * パーティクル品質を設定
     * @param {number} quality - パーティクル品質 (0.1-1.0)
     * @returns {boolean} 設定成功フラグ
     */
    setParticleQuality(quality) {
        return this.configManager.set('performance', 'quality.particleQuality', quality);
    }

    /**
     * エフェクト品質を設定
     * @param {number} quality - エフェクト品質 (0.1-1.0)
     * @returns {boolean} 設定成功フラグ
     */
    setEffectQuality(quality) {
        return this.configManager.set('performance', 'quality.effectQuality', quality);
    }

    /**
     * 音声品質を設定
     * @param {number} quality - 音声品質 (0.1-1.0)
     * @returns {boolean} 設定成功フラグ
     */
    setAudioQuality(quality) {
        return this.configManager.set('performance', 'quality.audioQuality', quality);
    }

    /**
     * 影エフェクトの有効状態を設定
     * @param {boolean} enabled - 影エフェクトの有効状態
     * @returns {boolean} 設定成功フラグ
     */
    setShadowsEnabled(enabled) {
        return this.configManager.set('performance', 'quality.enableShadows', enabled);
    }

    /**
     * ブラーエフェクトの有効状態を設定
     * @param {boolean} enabled - ブラーエフェクトの有効状態
     * @returns {boolean} 設定成功フラグ
     */
    setBlurEnabled(enabled) {
        return this.configManager.set('performance', 'quality.enableBlur', enabled);
    }

    /**
     * アンチエイリアシングの有効状態を設定
     * @param {boolean} enabled - アンチエイリアシングの有効状態
     * @returns {boolean} 設定成功フラグ
     */
    setAntiAliasingEnabled(enabled) {
        return this.configManager.set('performance', 'quality.enableAntiAliasing', enabled);
    }

    /**
     * 反射エフェクトの有効状態を設定
     * @param {boolean} enabled - 反射エフェクトの有効状態
     * @returns {boolean} 設定成功フラグ
     */
    setReflectionsEnabled(enabled) {
        return this.configManager.set('performance', 'quality.enableReflections', enabled);
    }

    /**
     * 品質プリセットを適用
     * @param {string} presetName - プリセット名 ('low', 'medium', 'high')
     * @returns {boolean} 適用成功フラグ
     */
    applyQualityPreset(presetName) {
        try {
            if (!['low', 'medium', 'high'].includes(presetName)) {
                throw new Error(`無効なプリセット名: ${presetName}`);
            }
            
            const presetKey = `quality.presets.${presetName}`;
            const preset = this.configManager.get('performance', presetKey);
            
            if (!preset) {
                throw new Error(`プリセットが見つかりません: ${presetName}`);
            }
            
            // プリセット設定を適用
            this.setRenderQuality(preset.renderQuality);
            this.setParticleQuality(preset.particleQuality);
            this.setEffectQuality(preset.effectQuality);
            this.setAudioQuality(preset.audioQuality);
            this.setShadowsEnabled(preset.enableShadows);
            this.setBlurEnabled(preset.enableBlur);
            this.setAntiAliasingEnabled(preset.enableAntiAliasing);
            this.setReflectionsEnabled(preset.enableReflections);
            
            // パフォーマンスレベル別の最適化設定を適用
            switch (presetName) {
                case 'low':
                    this.setMaxBubbles(10);
                    this.setMaxParticles(100);
                    break;
                case 'medium':
                    this.setMaxBubbles(15);
                    this.setMaxParticles(300);
                    break;
                case 'high':
                    this.setMaxBubbles(20);
                    this.setMaxParticles(500);
                    break;
            }
            
            // パフォーマンスレベルも更新
            this.setPerformanceLevel(presetName);
            
            console.log(`[PerformanceConfig] 品質プリセット "${presetName}" を適用しました`);
            return true;
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'PerformanceConfig.applyQualityPreset'
            });
            return false;
        }
    }

    /**
     * PerformanceOptimizerとの連携インターフェース
     * PerformanceOptimizerに現在の設定を適用する
     * @param {PerformanceOptimizer} optimizer - PerformanceOptimizerインスタンス
     */
    applyToPerformanceOptimizer(optimizer) {
        try {
            if (!optimizer) {
                throw new Error('PerformanceOptimizerが指定されていません');
            }
            
            // 最適化設定の適用
            const optimizationConfig = this.getOptimizationConfig();
            optimizer.targetFPS = optimizationConfig.targetFPS;
            optimizer.maxHistorySize = optimizationConfig.maxHistorySize;
            optimizer.setAdaptiveMode(optimizationConfig.adaptiveMode);
            optimizer.optimizationInterval = optimizationConfig.optimizationInterval;
            optimizer.setPerformanceLevel(optimizationConfig.performanceLevel);
            
            // 品質設定の適用
            const qualityConfig = this.getQualityConfig();
            optimizer.settings = {
                maxBubbles: optimizationConfig.maxBubbles,
                maxParticles: optimizationConfig.maxParticles,
                renderQuality: qualityConfig.renderQuality,
                particleQuality: qualityConfig.particleQuality,
                effectQuality: qualityConfig.effectQuality,
                audioQuality: qualityConfig.audioQuality,
                enableShadows: qualityConfig.enableShadows,
                enableBlur: qualityConfig.enableBlur,
                enableAntiAliasing: qualityConfig.enableAntiAliasing
            };
            
            console.log('[PerformanceConfig] PerformanceOptimizerに設定を適用しました');
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'PerformanceConfig.applyToPerformanceOptimizer'
            });
        }
    }

    /**
     * PerformanceOptimizerから設定を同期
     * @param {PerformanceOptimizer} optimizer - PerformanceOptimizerインスタンス
     */
    syncFromPerformanceOptimizer(optimizer) {
        try {
            if (!optimizer) {
                throw new Error('PerformanceOptimizerが指定されていません');
            }
            
            // PerformanceOptimizerの状態を取得
            this.setTargetFPS(optimizer.targetFPS);
            this.setAdaptiveModeEnabled(optimizer.adaptiveMode);
            this.setPerformanceLevel(optimizer.performanceLevel);
            this.setMaxBubbles(optimizer.settings.maxBubbles);
            this.setMaxParticles(optimizer.settings.maxParticles);
            
            // 品質設定の同期
            this.setRenderQuality(optimizer.settings.renderQuality);
            this.setParticleQuality(optimizer.settings.particleQuality);
            this.setEffectQuality(optimizer.settings.effectQuality);
            this.setAudioQuality(optimizer.settings.audioQuality);
            this.setShadowsEnabled(optimizer.settings.enableShadows);
            this.setBlurEnabled(optimizer.settings.enableBlur);
            this.setAntiAliasingEnabled(optimizer.settings.enableAntiAliasing);
            
            console.log('[PerformanceConfig] PerformanceOptimizerから設定を同期しました');
        } catch (error) {
            getErrorHandler().handleError(error, {
                context: 'PerformanceConfig.syncFromPerformanceOptimizer'
            });
        }
    }
}

// シングルトンインスタンス
let instance = null;

/**
 * PerformanceConfigのシングルトンインスタンスを取得
 * @returns {PerformanceConfig} インスタンス
 */
function getPerformanceConfig() {
    if (!instance) {
        instance = new PerformanceConfig();
    }
    return instance;
}

export {
    PerformanceConfig,
    getPerformanceConfig
};