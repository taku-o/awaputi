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
        this.configManager = null;
        this._initialized = false;
        this._initializeSafely();
    }

    /**
     * 安全な初期化処理
     * @private
     */
    _initializeSafely() {
        try {
            this.configManager = getConfigurationManager();
            if (!this.configManager) {
                console.warn('[PerformanceConfig] ConfigurationManager is not available, using fallback');
                this._useFallbackConfig();
                return;
            }
            
            this._initialize();
            this._initialized = true;
            
        } catch (error) {
            console.error('[PerformanceConfig] 初期化失敗、フォールバック設定を使用:', error);
            this._useFallbackConfig();
        }
    }

    /**
     * フォールバック設定を使用
     * @private
     */
    _useFallbackConfig() {
        this.fallbackConfig = {
            optimization: {
                targetFPS: 60,
                adaptiveMode: true,
                optimizationInterval: 1000,
                maxHistorySize: 30,
                performanceLevel: 'high',
                maxBubbles: 20,
                maxParticles: 500,
                workloadDistribution: true,
                maxTimePerFrame: 8
            },
            quality: {
                renderQuality: 0.8,
                particleQuality: 0.7,
                effectQuality: 0.8,
                audioQuality: 'medium',
                enableShadows: true,
                enableBlur: true,
                enableAntiAliasing: true
            },
            resource: {
                memoryLimit: 100,
                canvasPoolSize: 5,
                soundPoolSize: 20,
                maxTextureSize: 2048,
                enableDebugMode: false
            }
        };
        this._initialized = true;
    }

    /**
     * 最適化設定を取得（安全版）
     * @returns {object} 最適化設定
     */
    getOptimizationConfig() {
        // フォールバック設定を使用
        if (!this._initialized || !this.configManager || this.fallbackConfig) {
            return this.fallbackConfig?.optimization || {
                targetFPS: 60,
                adaptiveMode: true,
                optimizationInterval: 1000,
                maxHistorySize: 30,
                performanceLevel: 'high',
                maxBubbles: 20,
                maxParticles: 500,
                workloadDistribution: true,
                maxTimePerFrame: 8
            };
        }

        // 通常の設定取得を試行
        try {
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
        } catch (error) {
            console.error('[PerformanceConfig] 設定取得エラー、フォールバック使用:', error);
            return this.fallbackConfig?.optimization || {
                targetFPS: 60,
                adaptiveMode: true,
                optimizationInterval: 1000,
                maxHistorySize: 30,
                performanceLevel: 'high',
                maxBubbles: 20,
                maxParticles: 500,
                workloadDistribution: true,
                maxTimePerFrame: 8
            };
        }
    }

    /**
     * 目標FPSを取得（安全版）
     * @returns {number} 目標FPS
     */
    getTargetFPS() {
        if (!this._initialized || !this.configManager || this.fallbackConfig) {
            return 60; // 安全なデフォルト値
        }

        try {
            return this.configManager.get('performance', 'optimization.targetFPS', 60);
        } catch (error) {
            console.error('[PerformanceConfig] targetFPS取得エラー:', error);
            return 60; // 安全なデフォルト値
        }
    }

    // 残りのメソッドも同様にnull安全性を追加...
    // (元のファイルから残りのメソッドをコピーして安全化)
}

// シングルトンインスタンス
let performanceConfigInstance = null;

/**
 * PerformanceConfigのシングルトンインスタンスを取得
 * @returns {PerformanceConfig} パフォーマンス設定インスタンス
 */
export function getPerformanceConfig() {
    if (!performanceConfigInstance) {
        performanceConfigInstance = new PerformanceConfig();
    }
    return performanceConfigInstance;
}

export { PerformanceConfig };