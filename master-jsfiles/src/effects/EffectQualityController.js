import { getConfigurationManager } from '../core/ConfigurationManager.js';
import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * エフェクト品質制御クラス
 * 
 * パフォーマンスに基づいた動的品質調整と、
 * エフェクトの優先度制御を行います。
 */
export class EffectQualityController {
    constructor() {
        this.configManager = getConfigurationManager();
        this.errorHandler = getErrorHandler();
        
        // 品質レベル定義
        this.qualityLevels = {
            low: {
                particleCountMultiplier: 0.25,
                particleSizeMultiplier: 0.8,
                particleComplexity: 1,
                effectDistance: 0.5,
                animationDetail: 1,
                shadowEnabled: false,
                reflectionEnabled: false,
                blurEnabled: false,
                backgroundParticles: false,
                frameRateTarget: 30
            },
            medium: {
                particleCountMultiplier: 0.5,
                particleSizeMultiplier: 0.9,
                particleComplexity: 2,
                effectDistance: 0.75,
                animationDetail: 2,
                shadowEnabled: false,
                reflectionEnabled: false,
                blurEnabled: true,
                backgroundParticles: true,
                frameRateTarget: 45
            },
            high: {
                particleCountMultiplier: 1.0,
                particleSizeMultiplier: 1.0,
                particleComplexity: 3,
                effectDistance: 1.0,
                animationDetail: 3,
                shadowEnabled: true,
                reflectionEnabled: true,
                blurEnabled: true,
                backgroundParticles: true,
                frameRateTarget: 60
            },
            ultra: {
                particleCountMultiplier: 1.5,
                particleSizeMultiplier: 1.2,
                particleComplexity: 4,
                effectDistance: 1.25,
                animationDetail: 4,
                shadowEnabled: true,
                reflectionEnabled: true,
                blurEnabled: true,
                backgroundParticles: true,
                frameRateTarget: 60
            }
        };
        
        // 現在の品質設定
        this.currentQuality = 'high';
        this.autoAdjustEnabled = true;
        this.lastAdjustTime = 0;
        this.adjustmentCooldown = 2000; // 2秒のクールダウン
        
        // パフォーマンス監視
        this.frameRateHistory = [];
        this.memoryUsageHistory = [];
        this.performanceCheckInterval = 1000; // 1秒間隔
        this.lastPerformanceCheck = 0;
        
        // エフェクト優先度システム
        this.effectPriorities = {
            critical: 3,    // ゲームプレイに必須
            important: 2,   // ユーザー体験に重要
            normal: 1,      // 標準エフェクト
            decorative: 0   // 装飾的エフェクト
        };
        
        // エフェクト制限
        this.effectLimits = {
            maxActiveParticles: 500,
            maxActiveEffects: 20,
            maxScreenEffects: 5,
            maxBackgroundParticles: 50
        };
        
        // 現在のエフェクトカウント
        this.activeEffectCounts = {
            particles: 0,
            effects: 0,
            screenEffects: 0,
            backgroundParticles: 0
        };
        
        this._initializeQualitySettings();
    }
    
    /**
     * 品質設定の初期化
     * @private
     */
    _initializeQualitySettings() {
        try {
            // 設定マネージャーから品質設定を読み込み
            const savedQuality = this.configManager.get('effects.quality.level', 'high');
            const autoAdjust = this.configManager.get('effects.quality.autoAdjust', true);
            
            this.setQualityLevel(savedQuality);
            this.setAutoAdjustment(autoAdjust);
            
            // 品質変更の監視
            this.configManager.watch('effects.quality.level', (newValue) => {
                this.setQualityLevel(newValue);
            });
            
            this.configManager.watch('effects.quality.autoAdjust', (newValue) => {
                this.setAutoAdjustment(newValue);
            });
            
        } catch (error) {
            this.errorHandler.handleError(error, 'EffectQualityController._initializeQualitySettings');
        }
    }
    
    /**
     * 品質レベルの設定
     * @param {string} level - 品質レベル (low, medium, high, ultra)
     */
    setQualityLevel(level) {
        // null または undefined の場合はデフォルト値を使用
        if (level == null) {
            level = 'high';
            console.log('[EffectQualityController] Quality level was null, using default: high');
        }
        
        if (!this.qualityLevels[level]) {
            this.errorHandler.handleError(
                new Error(`Invalid quality level: ${level}`),
                'EffectQualityController.setQualityLevel'
            );
            return;
        }
        
        const previousQuality = this.currentQuality;
        this.currentQuality = level;
        
        // エフェクト制限の調整
        this._adjustEffectLimits(level);
        
        // 設定の保存
        this.configManager.set('effects.quality.level', level);
        
        console.log(`Quality level changed from ${previousQuality} to ${level}`);
    }
    
    /**
     * 自動品質調整の有効/無効設定
     * @param {boolean} enabled - 自動調整を有効にするか
     */
    setAutoAdjustment(enabled) {
        this.autoAdjustEnabled = enabled;
        this.configManager.set('effects.quality.autoAdjust', enabled);
    }
    
    /**
     * エフェクト制限の調整
     * @param {string} qualityLevel - 品質レベル
     * @private
     */
    _adjustEffectLimits(qualityLevel) {
        const quality = this.qualityLevels[qualityLevel];
        
        this.effectLimits.maxActiveParticles = Math.floor(500 * quality.particleCountMultiplier);
        this.effectLimits.maxActiveEffects = Math.floor(20 * quality.animationDetail / 4);
        this.effectLimits.maxScreenEffects = Math.floor(5 * quality.animationDetail / 4);
        this.effectLimits.maxBackgroundParticles = quality.backgroundParticles ? 
            Math.floor(50 * quality.particleCountMultiplier) : 0;
    }
    
    /**
     * エフェクトの実行可否をチェック
     * @param {string} effectType - エフェクトタイプ
     * @param {string} priority - エフェクト優先度
     * @returns {boolean} エフェクトを実行可能か
     */
    canExecuteEffect(effectType, priority = 'normal') {
        const priorityLevel = this.effectPriorities[priority] || 1;
        
        // 優先度が高い場合は制限を緩和
        if (priorityLevel >= 2) {
            return true;
        }
        
        // エフェクトタイプ別の制限チェック
        switch (effectType) {
            case 'particle':
                return this.activeEffectCounts.particles < this.effectLimits.maxActiveParticles;
            case 'effect':
                return this.activeEffectCounts.effects < this.effectLimits.maxActiveEffects;
            case 'screenEffect':
                return this.activeEffectCounts.screenEffects < this.effectLimits.maxScreenEffects;
            case 'backgroundParticle':
                return this.activeEffectCounts.backgroundParticles < this.effectLimits.maxBackgroundParticles;
            default:
                return true;
        }
    }
    
    /**
     * エフェクトカウントの更新
     * @param {string} effectType - エフェクトタイプ
     * @param {number} delta - 変更量
     */
    updateEffectCount(effectType, delta) {
        if (this.activeEffectCounts.hasOwnProperty(effectType)) {
            this.activeEffectCounts[effectType] = Math.max(0, 
                this.activeEffectCounts[effectType] + delta);
        }
    }
    
    /**
     * パフォーマンス監視の更新
     * @param {number} currentTime - 現在時刻
     * @param {number} frameRate - 現在のフレームレート
     * @param {number} memoryUsage - メモリ使用量
     */
    updatePerformanceMetrics(currentTime, frameRate, memoryUsage) {
        if (currentTime - this.lastPerformanceCheck < this.performanceCheckInterval) {
            return;
        }
        
        this.lastPerformanceCheck = currentTime;
        
        // フレームレート履歴の更新
        this.frameRateHistory.push(frameRate);
        if (this.frameRateHistory.length > 10) {
            this.frameRateHistory.shift();
        }
        
        // メモリ使用量履歴の更新
        if (memoryUsage) {
            this.memoryUsageHistory.push(memoryUsage);
            if (this.memoryUsageHistory.length > 10) {
                this.memoryUsageHistory.shift();
            }
        }
        
        // 自動品質調整
        if (this.autoAdjustEnabled) {
            this._performAutoAdjustment(currentTime, frameRate, memoryUsage);
        }
    }
    
    /**
     * 自動品質調整の実行
     * @param {number} currentTime - 現在時刻
     * @param {number} frameRate - 現在のフレームレート
     * @param {number} memoryUsage - メモリ使用量
     * @private
     */
    _performAutoAdjustment(currentTime, frameRate, memoryUsage) {
        if (currentTime - this.lastAdjustTime < this.adjustmentCooldown) {
            return;
        }
        
        const currentQualitySettings = this.qualityLevels[this.currentQuality];
        const targetFrameRate = currentQualitySettings.frameRateTarget;
        
        // 平均フレームレートの計算
        const avgFrameRate = this.frameRateHistory.length > 0 ?
            this.frameRateHistory.reduce((sum, rate) => sum + rate, 0) / this.frameRateHistory.length :
            frameRate;
        
        let shouldAdjust = false;
        let newQuality = this.currentQuality;
        
        // フレームレートが目標を大幅に下回る場合、品質を下げる
        if (avgFrameRate < targetFrameRate * 0.8) {
            if (this.currentQuality === 'ultra') {
                newQuality = 'high';
                shouldAdjust = true;
            } else if (this.currentQuality === 'high') {
                newQuality = 'medium';
                shouldAdjust = true;
            } else if (this.currentQuality === 'medium') {
                newQuality = 'low';
                shouldAdjust = true;
            }
        }
        // フレームレートが安定している場合、品質を上げる
        else if (avgFrameRate > targetFrameRate * 1.1 && this.frameRateHistory.length >= 5) {
            const stableFrameRate = this.frameRateHistory.every(rate => 
                rate > targetFrameRate * 1.05);
            
            if (stableFrameRate) {
                if (this.currentQuality === 'low') {
                    newQuality = 'medium';
                    shouldAdjust = true;
                } else if (this.currentQuality === 'medium') {
                    newQuality = 'high';
                    shouldAdjust = true;
                } else if (this.currentQuality === 'high') {
                    newQuality = 'ultra';
                    shouldAdjust = true;
                }
            }
        }
        
        if (shouldAdjust) {
            console.log(`Auto-adjusting quality from ${this.currentQuality} to ${newQuality} (FPS: ${avgFrameRate.toFixed(1)})`);
            this.setQualityLevel(newQuality);
            this.lastAdjustTime = currentTime;
        }
    }
    
    /**
     * 現在の品質設定を取得
     * @returns {Object} 品質設定オブジェクト
     */
    getCurrentQualitySettings() {
        return { ...this.qualityLevels[this.currentQuality] };
    }
    
    /**
     * 品質レベルを取得
     * @returns {string} 現在の品質レベル
     */
    getCurrentQualityLevel() {
        return this.currentQuality;
    }
    
    /**
     * エフェクト制限を取得
     * @returns {Object} エフェクト制限オブジェクト
     */
    getEffectLimits() {
        return { ...this.effectLimits };
    }
    
    /**
     * 現在のエフェクトカウントを取得
     * @returns {Object} エフェクトカウントオブジェクト
     */
    getActiveEffectCounts() {
        return { ...this.activeEffectCounts };
    }
    
    /**
     * パフォーマンス統計を取得
     * @returns {Object} パフォーマンス統計
     */
    getPerformanceStats() {
        const avgFrameRate = this.frameRateHistory.length > 0 ?
            this.frameRateHistory.reduce((sum, rate) => sum + rate, 0) / this.frameRateHistory.length :
            0;
        
        const avgMemoryUsage = this.memoryUsageHistory.length > 0 ?
            this.memoryUsageHistory.reduce((sum, usage) => sum + usage, 0) / this.memoryUsageHistory.length :
            0;
        
        return {
            averageFrameRate: avgFrameRate,
            averageMemoryUsage: avgMemoryUsage,
            currentQuality: this.currentQuality,
            autoAdjustEnabled: this.autoAdjustEnabled,
            effectCounts: { ...this.activeEffectCounts },
            effectLimits: { ...this.effectLimits }
        };
    }
    
    /**
     * デバッグ情報の取得
     * @returns {Object} デバッグ情報
     */
    getDebugInfo() {
        return {
            currentQuality: this.currentQuality,
            qualitySettings: this.getCurrentQualitySettings(),
            frameRateHistory: [...this.frameRateHistory],
            memoryUsageHistory: [...this.memoryUsageHistory],
            activeEffectCounts: { ...this.activeEffectCounts },
            effectLimits: { ...this.effectLimits },
            autoAdjustEnabled: this.autoAdjustEnabled,
            lastAdjustTime: this.lastAdjustTime
        };
    }
    
    /**
     * リソースのクリーンアップ
     */
    dispose() {
        this.frameRateHistory = [];
        this.memoryUsageHistory = [];
        this.activeEffectCounts = {
            particles: 0,
            effects: 0,
            screenEffects: 0,
            backgroundParticles: 0
        };
    }
}

// シングルトンインスタンスの作成と管理
let effectQualityControllerInstance = null;

/**
 * EffectQualityControllerのシングルトンインスタンスを取得
 * @returns {EffectQualityController} シングルトンインスタンス
 */
export function getEffectQualityController() {
    if (!effectQualityControllerInstance) {
        effectQualityControllerInstance = new EffectQualityController();
    }
    return effectQualityControllerInstance;
}