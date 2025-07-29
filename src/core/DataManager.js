import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * データ管理クラス - 包括的なデータ管理システムの中央制御
 * 
 * 責任:
 * - 各種データ管理機能の統合
 * - 既存システム（PlayerData、SettingsManager、StatisticsManager）との連携
 * - データ操作の統一インターフェース提供
 */
export class DataManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        // 基本プロパティ
        this.isInitialized = false;
        this.version = '1.0.0';
        
        // 既存システムへの参照
        this.playerData = null;
        this.settingsManager = null;
        this.statisticsManager = null;
        
        // 管理コンポーネント（遅延初期化）
        this.storage = null;
        this.backup = null;
        this.recovery = null;
        this.export = null;
        this.import = null;
        this.security = null;
        this.validation = null;
        this.ui = null;
        
        // イベントリスナー
        this.listeners = new Map();
        
        // ステータス管理
        this.status = {
            lastBackup: null,
            lastValidation: null,
            operationInProgress: false,
            errors: []
        };
        
        this.initialize();
    }
    
    /**
     * データマネージャーの初期化
     */
    async initialize() {
        try {
            if (this.isInitialized) {
                return;
            }
            
            // 既存システムとの統合
            await this.integrateExistingSystems();
            
            // 基本コンポーネントの初期化
            await this.initializeComponents();
            
            this.isInitialized = true;
            this.emit('initialized', { timestamp: Date.now() });
            
        } catch (error) {
            getErrorHandler().handleError(error, 'DATA_MANAGER_INITIALIZATION_ERROR', {
                operation: 'initialize'
            });
        }
    }
    
    /**
     * 既存システムとの統合
     */
    async integrateExistingSystems() {
        try {
            // GameEngineから既存システムを取得
            if (this.gameEngine) {
                this.playerData = this.gameEngine.playerData;
                this.settingsManager = this.gameEngine.settingsManager;
                this.statisticsManager = this.gameEngine.statisticsManager;
            }
            
            // 各システムの状態を確認
            if (this.playerData) {
                console.log('DataManager: PlayerData integrated');
            }
            if (this.settingsManager) {
                console.log('DataManager: SettingsManager integrated');
            }
            if (this.statisticsManager) {
                console.log('DataManager: StatisticsManager integrated');
            }
            
        } catch (error) {
            getErrorHandler().handleError(error, 'SYSTEM_INTEGRATION_ERROR', {
                operation: 'integrateExistingSystems'
            });
        }
    }
    
    /**
     * 基本コンポーネントの初期化
     */
    async initializeComponents() {
        try {
            // DataStorageの初期化
            await this.initializeStorage();
            
        } catch (error) {
            getErrorHandler().handleError(error, 'COMPONENT_INITIALIZATION_ERROR', {
                operation: 'initializeComponents'
            });
        }
    }
    
    /**
     * ストレージコンポーネントの初期化
     */
    async initializeStorage() {
        try {
            const { DataStorage } = await import('./DataStorage.js');
            this.storage = new DataStorage();
            console.log('DataManager: DataStorage initialized');
        } catch (error) {
            console.warn('DataStorage not available, using fallback mode:', error);
            // フォールバック: 基本的なLocalStorage使用
            this.storage = {
                save: async (key, data) => {
                    localStorage.setItem(key, JSON.stringify(data));
                },
                load: async (key) => {
                    const data = localStorage.getItem(key);
                    return data ? JSON.parse(data) : null;
                },
                remove: async (key) => {
                    localStorage.removeItem(key);
                }
            };
        }
    }
    
    /**
     * データ保存の統一インターフェース
     */
    async save(dataType, data, options = {}) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }
            
            if (this.status.operationInProgress) {
                throw new Error('Another operation is in progress');
            }
            
            this.status.operationInProgress = true;
            
            const startTime = performance.now();
            
            // データタイプ別の処理
            let result;
            switch (dataType) {
                case 'playerData':
                    result = await this.savePlayerData(data, options);
                    break;
                case 'settings':
                    result = await this.saveSettings(data, options);
                    break;
                case 'statistics':
                    result = await this.saveStatistics(data, options);
                    break;
                default:
                    result = await this.saveGenericData(dataType, data, options);
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // パフォーマンス要件チェック（< 100ms）
            if (duration > 100) {
                console.warn(`Data save operation took ${duration.toFixed(2)}ms, exceeding target of 100ms`);
            }
            
            this.emit('dataSaved', { dataType, duration, timestamp: Date.now() });
            
            return result;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'DATA_SAVE_ERROR', {
                operation: 'save',
                dataType,
                options
            });
            return false;
        } finally {
            this.status.operationInProgress = false;
        }
    }
    
    /**
     * データ読み込みの統一インターフェース
     */
    async load(dataType, options = {}) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }
            
            const startTime = performance.now();
            
            // データタイプ別の処理
            let result;
            switch (dataType) {
                case 'playerData':
                    result = await this.loadPlayerData(options);
                    break;
                case 'settings':
                    result = await this.loadSettings(options);
                    break;
                case 'statistics':
                    result = await this.loadStatistics(options);
                    break;
                default:
                    result = await this.loadGenericData(dataType, options);
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // パフォーマンス要件チェック（< 50ms）
            if (duration > 50) {
                console.warn(`Data load operation took ${duration.toFixed(2)}ms, exceeding target of 50ms`);
            }
            
            this.emit('dataLoaded', { dataType, duration, timestamp: Date.now() });
            
            return result;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'DATA_LOAD_ERROR', {
                operation: 'load',
                dataType,
                options
            });
            return null;
        }
    }
    
    /**
     * PlayerDataの保存
     */
    async savePlayerData(data, options) {
        if (this.playerData) {
            // 既存のPlayerDataシステムを使用
            return this.playerData.save();
        }
        
        // フォールバック: 直接保存
        const key = 'bubblePop_playerData';
        return await this.storage.save(key, data);
    }
    
    /**
     * PlayerDataの読み込み
     */
    async loadPlayerData(options) {
        if (this.playerData) {
            // 既存のPlayerDataシステムから読み込み
            const data = {
                username: this.playerData.username,
                currentHP: this.playerData.currentHP,
                maxHP: this.playerData.maxHP,
                currentScore: this.playerData.currentScore,
                ap: this.playerData.ap,
                tap: this.playerData.tap,
                combo: this.playerData.combo,
                highScores: this.playerData.highScores,
                unlockedStages: this.playerData.unlockedStages,
                ownedItems: this.playerData.ownedItems
            };
            return data;
        }
        
        // フォールバック: 直接読み込み
        const key = 'bubblePop_playerData';
        return await this.storage.load(key);
    }
    
    /**
     * 設定データの保存
     */
    async saveSettings(data, options) {
        if (this.settingsManager) {
            // 既存のSettingsManagerシステムを使用
            return this.settingsManager.save();
        }
        
        // フォールバック: 直接保存
        const key = 'bubblePop_settings';
        return await this.storage.save(key, data);
    }
    
    /**
     * 設定データの読み込み
     */
    async loadSettings(options) {
        if (this.settingsManager) {
            // 既存のSettingsManagerから読み込み
            return this.settingsManager.getAllSettings();
        }
        
        // フォールバック: 直接読み込み
        const key = 'bubblePop_settings';
        return await this.storage.load(key);
    }
    
    /**
     * 統計データの保存
     */
    async saveStatistics(data, options) {
        if (this.statisticsManager) {
            // 既存のStatisticsManagerシステムを使用
            return this.statisticsManager.save();
        }
        
        // フォールバック: 直接保存
        const key = 'bubblePop_statistics';
        return await this.storage.save(key, data);
    }
    
    /**
     * 統計データの読み込み
     */
    async loadStatistics(options) {
        if (this.statisticsManager) {
            // 既存のStatisticsManagerから読み込み
            return {
                statistics: this.statisticsManager.statistics,
                sessionStats: this.statisticsManager.sessionStats
            };
        }
        
        // フォールバック: 直接読み込み
        const key = 'bubblePop_statistics';
        return await this.storage.load(key);
    }
    
    /**
     * 汎用データの保存
     */
    async saveGenericData(dataType, data, options) {
        const key = `bubblePop_${dataType}`;
        return await this.storage.save(key, data);
    }
    
    /**
     * 汎用データの読み込み
     */
    async loadGenericData(dataType, options) {
        const key = `bubblePop_${dataType}`;
        return await this.storage.load(key);
    }
    
    /**
     * データマネージャーの状態を取得
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            version: this.version,
            status: { ...this.status },
            components: {
                playerData: !!this.playerData,
                settingsManager: !!this.settingsManager,
                statisticsManager: !!this.statisticsManager,
                storage: !!this.storage,
                backup: !!this.backup,
                recovery: !!this.recovery,
                export: !!this.export,
                import: !!this.import,
                security: !!this.security,
                validation: !!this.validation,
                ui: !!this.ui
            }
        };
    }
    
    /**
     * イベントリスナーの追加
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    /**
     * イベントリスナーの削除
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    /**
     * イベントの発火
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    getErrorHandler().handleError(error, 'EVENT_CALLBACK_ERROR', {
                        event,
                        data
                    });
                }
            });
        }
    }
    
    /**
     * リソースの解放
     */
    destroy() {
        try {
            this.listeners.clear();
            this.status.operationInProgress = false;
            this.isInitialized = false;
            
            // 各コンポーネントのクリーンアップ
            if (this.storage && typeof this.storage.destroy === 'function') {
                this.storage.destroy();
            }
            
            console.log('DataManager destroyed');
            
        } catch (error) {
            getErrorHandler().handleError(error, 'DATA_MANAGER_DESTROY_ERROR', {
                operation: 'destroy'
            });
        }
    }
}

// シングルトンインスタンス
let dataManagerInstance = null;

/**
 * DataManagerシングルトンインスタンスの取得
 */
export function getDataManager(gameEngine = null) {
    if (!dataManagerInstance && gameEngine) {
        dataManagerInstance = new DataManager(gameEngine);
    }
    return dataManagerInstance;
}