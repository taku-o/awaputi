import { getConfigurationManager } from '../core/ConfigurationManager.js';
import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getEffectQualityController } from './EffectQualityController.js';
import { getSeasonalEffectManager } from './SeasonalEffectManager.js';

/**
 * エフェクト設定統合クラス
 * 
 * ConfigurationManagerと各エフェクトシステムの設定を統合し、
 * リアルタイム設定更新とシステム間の同期を管理します。
 */
export class EffectConfigurationIntegrator {
    constructor() {
        this.configManager = getConfigurationManager();
        this.errorHandler = getErrorHandler();
        
        // エフェクトシステムへの参照
        this.qualityController = null;
        this.seasonalManager = null;
        this.audioManager = null;
        
        // 設定監視用のリスナーマップ
        this.configListeners = new Map();
        
        // 設定同期状態
        this.syncInProgress = false;
        this.lastSyncTime = 0;
        this.syncInterval = 1000; // 1秒間隔で同期チェック
        
        this._initializeConfiguration();
        this._setupConfigurationWatchers();
    }
    
    /**
     * 設定の初期化
     * @private
     */
    _initializeConfiguration() {
        try {
            // エフェクト品質設定の初期化
            this._initializeQualitySettings();
            
            // 季節エフェクト設定の初期化
            this._initializeSeasonalSettings();
            
            // オーディオ統合設定の初期化
            this._initializeAudioIntegrationSettings();
            
            // パフォーマンス設定の初期化
            this._initializePerformanceSettings();
            
            console.log('[EffectConfigurationIntegrator] 設定初期化完了');
            
        } catch (error) {
            this.errorHandler.handleError(error, 'EffectConfigurationIntegrator._initializeConfiguration');
        }
    }
    
    /**
     * エフェクト品質設定の初期化
     * @private
     */
    _initializeQualitySettings() {
        const defaultSettings = {
            'effects.quality.level': 'high',
            'effects.quality.autoAdjust': true,
            'effects.quality.targetFPS': 60,
            'effects.quality.memoryThreshold': 100 * 1024 * 1024, // 100MB
            'effects.quality.maxParticles': 500,
            'effects.quality.maxEffects': 20
        };
        
        for (const [key, defaultValue] of Object.entries(defaultSettings)) {
            if (!this.configManager.has(key)) {
                this.configManager.set(key, defaultValue);
            }
        }
    }
    
    /**
     * 季節エフェクト設定の初期化
     * @private
     */
    _initializeSeasonalSettings() {
        const defaultSettings = {
            'effects.seasonal.enabled': true,
            'effects.seasonal.autoDetection': true,
            'effects.seasonal.events': true,
            'effects.seasonal.customThemes.enabled': true,
            'effects.seasonal.backgroundEffects': true,
            'effects.seasonal.currentSeason': 'spring',
            'effects.seasonal.currentTheme': null
        };
        
        for (const [key, defaultValue] of Object.entries(defaultSettings)) {
            if (!this.configManager.has(key)) {
                this.configManager.set(key, defaultValue);
            }
        }
    }
    
    /**
     * オーディオ統合設定の初期化
     * @private
     */
    _initializeAudioIntegrationSettings() {
        const defaultSettings = {
            'effects.audio.enabled': true,
            'effects.audio.volumeSync': true,
            'effects.audio.visualFeedback': true,
            'effects.audio.seasonalSounds': true,
            'effects.audio.qualityScaling': true,
            'effects.audio.reverbEffects': false
        };
        
        for (const [key, defaultValue] of Object.entries(defaultSettings)) {
            if (!this.configManager.has(key)) {
                this.configManager.set(key, defaultValue);
            }
        }
    }
    
    /**
     * パフォーマンス設定の初期化
     * @private
     */
    _initializePerformanceSettings() {
        const defaultSettings = {
            'effects.performance.monitoring': true,
            'effects.performance.autoOptimization': true,
            'effects.performance.culling': true,
            'effects.performance.lowLatencyMode': false,
            'effects.performance.resourceCleanup': true,
            'effects.performance.frameTimeLimit': 16.67 // 60FPS基準
        };
        
        for (const [key, defaultValue] of Object.entries(defaultSettings)) {
            if (!this.configManager.has(key)) {
                this.configManager.set(key, defaultValue);
            }
        }
    }
    
    /**
     * 設定監視の設定
     * @private
     */
    _setupConfigurationWatchers() {
        // 品質設定の監視
        this._watchConfig('effects.quality.level', (newValue, oldValue) => {
            this._onQualityLevelChanged(newValue, oldValue);
        });
        
        this._watchConfig('effects.quality.autoAdjust', (newValue) => {
            this._onAutoAdjustChanged(newValue);
        });
        
        // 季節エフェクト設定の監視
        this._watchConfig('effects.seasonal.enabled', (newValue) => {
            this._onSeasonalEffectsEnabledChanged(newValue);
        });
        
        this._watchConfig('effects.seasonal.currentSeason', (newValue) => {
            this._onSeasonChanged(newValue);
        });
        
        // オーディオ統合設定の監視
        this._watchConfig('effects.audio.enabled', (newValue) => {
            this._onAudioEffectsEnabledChanged(newValue);
        });
        
        this._watchConfig('effects.audio.volumeSync', (newValue) => {
            this._onAudioVolumeSyncChanged(newValue);
        });
        
        // パフォーマンス設定の監視
        this._watchConfig('effects.performance.monitoring', (newValue) => {
            this._onPerformanceMonitoringChanged(newValue);
        });
    }
    
    /**
     * 設定監視の追加
     * @param {string} key - 設定キー
     * @param {Function} callback - コールバック
     * @private
     */
    _watchConfig(key, callback) {
        const listener = this.configManager.watch(key, callback);
        this.configListeners.set(key, listener);
    }
    
    /**
     * エフェクトシステムの登録
     * @param {Object} systems - システムオブジェクト
     */
    registerEffectSystems(systems) {
        if (systems.qualityController) {
            this.qualityController = systems.qualityController;
        }
        
        if (systems.seasonalManager) {
            this.seasonalManager = systems.seasonalManager;
        }
        
        if (systems.audioManager) {
            this.audioManager = systems.audioManager;
        }
        
        // 現在の設定をシステムに適用
        this._syncConfigurationToSystems();
        
        console.log('[EffectConfigurationIntegrator] エフェクトシステム登録完了');
    }
    
    /**
     * 設定をシステムに同期
     * @private
     */
    _syncConfigurationToSystems() {
        if (this.syncInProgress) return;
        
        this.syncInProgress = true;
        
        try {
            // 品質コントローラーとの同期
            if (this.qualityController) {
                const qualityLevel = this.configManager.get('effects.quality.level');
                const autoAdjust = this.configManager.get('effects.quality.autoAdjust');
                
                this.qualityController.setQualityLevel(qualityLevel);
                this.qualityController.setAutoAdjustment(autoAdjust);
            }
            
            // 季節エフェクトマネージャーとの同期
            if (this.seasonalManager) {
                const seasonalEnabled = this.configManager.get('effects.seasonal.enabled');
                const autoDetection = this.configManager.get('effects.seasonal.autoDetection');
                const currentSeason = this.configManager.get('effects.seasonal.currentSeason');
                
                this.seasonalManager.setSeasonalEffectsEnabled(seasonalEnabled);
                this.seasonalManager.setAutoSeasonDetection(autoDetection);
                
                if (currentSeason && !autoDetection) {
                    this.seasonalManager.setSeason(currentSeason);
                }
            }
            
            // オーディオマネージャーとの同期
            if (this.audioManager) {
                const audioEnabled = this.configManager.get('effects.audio.enabled');
                const volumeSync = this.configManager.get('effects.audio.volumeSync');
                
                this.audioManager.setEffectsEnabled?.(audioEnabled);
                this.audioManager.setVolumeSync?.(volumeSync);
            }
            
            this.lastSyncTime = performance.now();
            
        } catch (error) {
            this.errorHandler.handleError(error, 'EffectConfigurationIntegrator._syncConfigurationToSystems');
        } finally {
            this.syncInProgress = false;
        }
    }
    
    /**
     * 品質レベル変更時の処理
     * @param {string} newValue - 新しい値
     * @param {string} oldValue - 古い値
     * @private
     */
    _onQualityLevelChanged(newValue, oldValue) {
        if (this.qualityController) {
            this.qualityController.setQualityLevel(newValue);
        }
        
        console.log(`[EffectConfigurationIntegrator] 品質レベル変更: ${oldValue} → ${newValue}`);
    }
    
    /**
     * 自動調整変更時の処理
     * @param {boolean} newValue - 新しい値
     * @private
     */
    _onAutoAdjustChanged(newValue) {
        if (this.qualityController) {
            this.qualityController.setAutoAdjustment(newValue);
        }
        
        console.log(`[EffectConfigurationIntegrator] 自動品質調整: ${newValue}`);
    }
    
    /**
     * 季節エフェクト有効化変更時の処理
     * @param {boolean} newValue - 新しい値
     * @private
     */
    _onSeasonalEffectsEnabledChanged(newValue) {
        if (this.seasonalManager) {
            this.seasonalManager.setSeasonalEffectsEnabled(newValue);
        }
        
        console.log(`[EffectConfigurationIntegrator] 季節エフェクト: ${newValue}`);
    }
    
    /**
     * 季節変更時の処理
     * @param {string} newValue - 新しい値
     * @private
     */
    _onSeasonChanged(newValue) {
        if (this.seasonalManager && !this.seasonalManager.autoSeasonDetection) {
            this.seasonalManager.setSeason(newValue);
        }
        
        console.log(`[EffectConfigurationIntegrator] 季節変更: ${newValue}`);
    }
    
    /**
     * オーディオエフェクト有効化変更時の処理
     * @param {boolean} newValue - 新しい値
     * @private
     */
    _onAudioEffectsEnabledChanged(newValue) {
        if (this.audioManager) {
            this.audioManager.setEffectsEnabled?.(newValue);
        }
        
        console.log(`[EffectConfigurationIntegrator] オーディオエフェクト: ${newValue}`);
    }
    
    /**
     * オーディオボリューム同期変更時の処理
     * @param {boolean} newValue - 新しい値
     * @private
     */
    _onAudioVolumeSyncChanged(newValue) {
        if (this.audioManager) {
            this.audioManager.setVolumeSync?.(newValue);
        }
        
        console.log(`[EffectConfigurationIntegrator] オーディオボリューム同期: ${newValue}`);
    }
    
    /**
     * パフォーマンス監視変更時の処理
     * @param {boolean} newValue - 新しい値
     * @private
     */
    _onPerformanceMonitoringChanged(newValue) {
        // パフォーマンス監視の有効/無効設定
        console.log(`[EffectConfigurationIntegrator] パフォーマンス監視: ${newValue}`);
    }
    
    /**
     * リアルタイム設定更新
     * @param {string} key - 設定キー
     * @param {*} value - 新しい値
     */
    updateConfiguration(key, value) {
        try {
            this.configManager.set(key, value);
            console.log(`[EffectConfigurationIntegrator] 設定更新: ${key} = ${value}`);
        } catch (error) {
            this.errorHandler.handleError(error, 'EffectConfigurationIntegrator.updateConfiguration');
        }
    }
    
    /**
     * 設定の一括更新
     * @param {Object} settings - 設定オブジェクト
     */
    updateMultipleConfigurations(settings) {
        try {
            for (const [key, value] of Object.entries(settings)) {
                this.configManager.set(key, value);
            }
            
            // 一括更新後にシステム同期
            this._syncConfigurationToSystems();
            
            console.log(`[EffectConfigurationIntegrator] 設定一括更新: ${Object.keys(settings).length}件`);
        } catch (error) {
            this.errorHandler.handleError(error, 'EffectConfigurationIntegrator.updateMultipleConfigurations');
        }
    }
    
    /**
     * エフェクト設定のエクスポート
     * @returns {Object} エクスポート用設定データ
     */
    exportEffectSettings() {
        try {
            const settings = {
                quality: {
                    level: this.configManager.get('effects.quality.level'),
                    autoAdjust: this.configManager.get('effects.quality.autoAdjust'),
                    targetFPS: this.configManager.get('effects.quality.targetFPS'),
                    maxParticles: this.configManager.get('effects.quality.maxParticles')
                },
                seasonal: {
                    enabled: this.configManager.get('effects.seasonal.enabled'),
                    autoDetection: this.configManager.get('effects.seasonal.autoDetection'),
                    events: this.configManager.get('effects.seasonal.events'),
                    customThemes: this.configManager.get('effects.seasonal.customThemes.enabled')
                },
                audio: {
                    enabled: this.configManager.get('effects.audio.enabled'),
                    volumeSync: this.configManager.get('effects.audio.volumeSync'),
                    visualFeedback: this.configManager.get('effects.audio.visualFeedback'),
                    seasonalSounds: this.configManager.get('effects.audio.seasonalSounds')
                },
                performance: {
                    monitoring: this.configManager.get('effects.performance.monitoring'),
                    autoOptimization: this.configManager.get('effects.performance.autoOptimization'),
                    culling: this.configManager.get('effects.performance.culling'),
                    resourceCleanup: this.configManager.get('effects.performance.resourceCleanup')
                },
                metadata: {
                    version: '1.0',
                    exportTime: Date.now()
                }
            };
            
            return settings;
        } catch (error) {
            this.errorHandler.handleError(error, 'EffectConfigurationIntegrator.exportEffectSettings');
            return null;
        }
    }
    
    /**
     * エフェクト設定のインポート
     * @param {Object} settings - インポート用設定データ
     * @returns {boolean} インポート成功か
     */
    importEffectSettings(settings) {
        try {
            if (!settings || typeof settings !== 'object') {
                throw new Error('Invalid settings data');
            }
            
            const configUpdates = {};
            
            // 品質設定
            if (settings.quality) {
                if (settings.quality.level) configUpdates['effects.quality.level'] = settings.quality.level;
                if (typeof settings.quality.autoAdjust === 'boolean') configUpdates['effects.quality.autoAdjust'] = settings.quality.autoAdjust;
                if (settings.quality.targetFPS) configUpdates['effects.quality.targetFPS'] = settings.quality.targetFPS;
                if (settings.quality.maxParticles) configUpdates['effects.quality.maxParticles'] = settings.quality.maxParticles;
            }
            
            // 季節設定
            if (settings.seasonal) {
                if (typeof settings.seasonal.enabled === 'boolean') configUpdates['effects.seasonal.enabled'] = settings.seasonal.enabled;
                if (typeof settings.seasonal.autoDetection === 'boolean') configUpdates['effects.seasonal.autoDetection'] = settings.seasonal.autoDetection;
                if (typeof settings.seasonal.events === 'boolean') configUpdates['effects.seasonal.events'] = settings.seasonal.events;
                if (typeof settings.seasonal.customThemes === 'boolean') configUpdates['effects.seasonal.customThemes.enabled'] = settings.seasonal.customThemes;
            }
            
            // オーディオ設定
            if (settings.audio) {
                if (typeof settings.audio.enabled === 'boolean') configUpdates['effects.audio.enabled'] = settings.audio.enabled;
                if (typeof settings.audio.volumeSync === 'boolean') configUpdates['effects.audio.volumeSync'] = settings.audio.volumeSync;
                if (typeof settings.audio.visualFeedback === 'boolean') configUpdates['effects.audio.visualFeedback'] = settings.audio.visualFeedback;
                if (typeof settings.audio.seasonalSounds === 'boolean') configUpdates['effects.audio.seasonalSounds'] = settings.audio.seasonalSounds;
            }
            
            // パフォーマンス設定
            if (settings.performance) {
                if (typeof settings.performance.monitoring === 'boolean') configUpdates['effects.performance.monitoring'] = settings.performance.monitoring;
                if (typeof settings.performance.autoOptimization === 'boolean') configUpdates['effects.performance.autoOptimization'] = settings.performance.autoOptimization;
                if (typeof settings.performance.culling === 'boolean') configUpdates['effects.performance.culling'] = settings.performance.culling;
                if (typeof settings.performance.resourceCleanup === 'boolean') configUpdates['effects.performance.resourceCleanup'] = settings.performance.resourceCleanup;
            }
            
            // 一括更新
            this.updateMultipleConfigurations(configUpdates);
            
            console.log(`[EffectConfigurationIntegrator] 設定インポート完了: ${Object.keys(configUpdates).length}件`);
            return true;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'EffectConfigurationIntegrator.importEffectSettings');
            return false;
        }
    }
    
    /**
     * 設定統計の取得
     * @returns {Object} 設定統計
     */
    getConfigurationStats() {
        return {
            totalSettings: this.configListeners.size,
            lastSyncTime: this.lastSyncTime,
            syncInProgress: this.syncInProgress,
            registeredSystems: {
                qualityController: !!this.qualityController,
                seasonalManager: !!this.seasonalManager,
                audioManager: !!this.audioManager
            }
        };
    }
    
    /**
     * リソースのクリーンアップ
     */
    dispose() {
        // 設定監視リスナーの削除
        for (const [key, listener] of this.configListeners) {
            this.configManager.unwatch(key, listener);
        }
        
        this.configListeners.clear();
        
        // システム参照のクリア
        this.qualityController = null;
        this.seasonalManager = null;
        this.audioManager = null;
        
        console.log('[EffectConfigurationIntegrator] クリーンアップ完了');
    }
}

// シングルトンインスタンスの作成と管理
let configurationIntegratorInstance = null;

/**
 * EffectConfigurationIntegratorのシングルトンインスタンスを取得
 * @returns {EffectConfigurationIntegrator} シングルトンインスタンス
 */
export function getEffectConfigurationIntegrator() {
    if (!configurationIntegratorInstance) {
        configurationIntegratorInstance = new EffectConfigurationIntegrator();
    }
    return configurationIntegratorInstance;
}