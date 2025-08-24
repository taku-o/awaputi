/**
 * DataManager - 包括的なデータ管理システムの中央制御
 * 各種データ管理機能の統合と既存システムとの連携を提供
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';
import { DataStorageManager } from './data/DataStorageManager.js';

interface DataManagerStatus {
    lastBackup: number | null;
    lastValidation: number | null;
    operationInProgress: boolean;
    errors: Error[];
}

interface CloudConfig {
    enabled: boolean;
    provider: string;
    apiEndpoint: string | null;
    autoSync: boolean;
    conflictResolution: string;
}

interface SaveOptions {
    useCache?: boolean;
    priority?: 'high' | 'normal' | 'low';
    cacheTtl?: number;
    dependencies?: string[];
    chunkSize?: number;
    parallel?: boolean;
}

interface LoadOptions {
    useCache?: boolean;
    priority?: 'high' | 'normal' | 'low';
    cacheTtl?: number;
    dependencies?: string[];
    chunkSize?: number;
    parallel?: boolean;
}

interface BatchOperation {
    dataType: string;
    data?: any;
    operationOptions?: SaveOptions | LoadOptions;
}

interface SaveResult {
    result: any;
    duration: number;
}

interface LoadResult {
    result: any;
    duration: number;
}

interface PlayerDataInterface {
    username: string;
    currentHP: number;
    maxHP: number;
    currentScore: number;
    ap: number;
    tap: number;
    combo: number;
    highScores: any[];
    unlockedStages: any[];
    ownedItems: any[];
    save: () => Promise<any>;
}

interface SettingsManagerInterface {
    save: () => Promise<any>;
    get: (key: string) => any;
    getAllSettings: () => any;
}

interface StatisticsManagerInterface {
    statistics: any;
    sessionStats: any;
    save: () => Promise<any>;
}

interface StorageInterface {
    save: (key: string, data: any) => Promise<any>;
    load: (key: string) => Promise<any>;
    remove: (key: string) => Promise<void>;
    destroy?: () => void;
}

interface CloudStorageInterface {
    authenticate: (credentials: any) => Promise<boolean>;
    logout: () => Promise<void>;
    isAuthenticated: () => boolean;
    destroy?: () => void;
}

interface SyncManagerInterface {
    sync: (options?: any) => Promise<any>;
    getSyncStatus: () => any;
    startAutoSync: () => void;
    stopAutoSync: () => void;
    destroy?: () => void;
}

interface OfflineManagerInterface {
    getOfflineStatus: () => any;
    destroy?: () => void;
}

interface GameEngineInterface {
    playerData?: PlayerDataInterface;
    settingsManager?: SettingsManagerInterface;
    statisticsManager?: StatisticsManagerInterface;
}

export class DataManager {
    private gameEngine: GameEngineInterface | null;
    private isInitialized: boolean;
    private version: string;
    private playerData: PlayerDataInterface | null;
    private settingsManager: SettingsManagerInterface | null;
    private statisticsManager: StatisticsManagerInterface | null;
    private storage: StorageInterface | null;
    private backup: any;
    private recovery: any;
    private export: any;
    private import: any;
    private security: any;
    private validation: any;
    private ui: any;
    private cloudStorage: CloudStorageInterface | null;
    private syncManager: SyncManagerInterface | null;
    private offlineManager: OfflineManagerInterface | null;
    private asyncQueue: any;
    private chunkProcessor: any;
    private cache: any;
    private storageManager: DataStorageManager;
    private listeners: Map<string, Function[]>;
    private status: DataManagerStatus;
    private errorHandler: any;

    constructor(gameEngine: GameEngineInterface | null) {
        this.gameEngine = gameEngine;
        this.errorHandler = ErrorHandler.getInstance();
        
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
        
        // クラウド対応コンポーネント
        this.cloudStorage = null;
        this.syncManager = null;
        this.offlineManager = null;
        
        // 非同期操作管理
        this.asyncQueue = this.initializeAsyncQueue();
        
        // チャンク処理管理
        this.chunkProcessor = this.initializeChunkProcessor();
        
        // キャッシュ管理
        this.cache = this.initializeCache();
        
        // ストレージマネージャーの初期化
        this.storageManager = new DataStorageManager(this);
        
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
     * 非同期キューの初期化
     */
    private initializeAsyncQueue(): any {
        return {
            executeBatch: async (operations: any[], options: any) => {
                return Promise.all(operations.map(op => op()));
            },
            getStatus: () => ({ pending: 0, running: 0 })
        };
    }
    
    /**
     * チャンクプロセッサの初期化
     */
    private initializeChunkProcessor(): any {
        return {
            processArray: async (data: any[], processor: Function, options: any) => {
                const results = [];
                for (let i = 0; i < data.length; i++) {
                    const result = await processor(data[i], i, { processedItems: i, totalItems: data.length });
                    results.push(result);
                }
                return results;
            },
            processObject: async (data: any, processor: Function, options: any) => {
                const keys = Object.keys(data);
                const results = [];
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    const result = await processor({ [key]: data[key] }, i, { processedItems: i, totalItems: keys.length });
                    results.push(result);
                }
                return results;
            },
            getStats: () => ({ processed: 0, pending: 0 })
        };
    }
    
    /**
     * キャッシュの初期化
     */
    private initializeCache(): any {
        const cache = new Map();
        return {
            getOrSet: async (key: string, getter: Function, options: any) => {
                if (cache.has(key)) {
                    return cache.get(key);
                }
                const value = await getter();
                cache.set(key, value);
                return value;
            },
            delete: (key: string) => cache.delete(key),
            deleteMany: (keys: string[]) => {
                let count = 0;
                keys.forEach(key => {
                    if (cache.delete(key)) count++;
                });
                return count;
            },
            keys: () => Array.from(cache.keys()),
            invalidateByDependency: (dependency: string) => 0,
            getStats: () => ({ size: cache.size, hits: 0, misses: 0 })
        };
    }
    
    /**
     * データマネージャーの初期化
     */
    private async initialize(): Promise<void> {
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
            this.errorHandler.handleError(error, 'DataManager.initialize');
            throw error;
        }
    }
    
    /**
     * 既存システムとの統合
     */
    private async integrateExistingSystems(): Promise<void> {
        try {
            // GameEngineから既存システムを取得
            if (this.gameEngine) {
                this.playerData = this.gameEngine.playerData || null;
                this.settingsManager = this.gameEngine.settingsManager || null;
                this.statisticsManager = this.gameEngine.statisticsManager || null;
            }
            
            // 各システムの状態を確認
            if (this.playerData) {
                console.log('DataManager: PlayerDataを統合しました');
            }
            
            if (this.settingsManager) {
                console.log('DataManager: SettingsManagerを統合しました');
            }
            
            if (this.statisticsManager) {
                console.log('DataManager: StatisticsManagerを統合しました');
            }
            
        } catch (error) {
            this.errorHandler.handleError(error, 'DataManager.integrateExistingSystems');
            throw error;
        }
    }
    
    /**
     * 基本コンポーネントの初期化
     */
    private async initializeComponents(): Promise<void> {
        try {
            // DataStorageの初期化
            await this.initializeStorage();
            
            // クラウド対応コンポーネントの初期化
            await this.initializeCloudComponents();
            
        } catch (error) {
            this.errorHandler.handleError(error, 'DataManager.initializeComponents');
            throw error;
        }
    }
    
    /**
     * ストレージコンポーネントの初期化
     */
    private async initializeStorage(): Promise<void> {
        try {
            // 動的インポートを試行
            const { DataStorage } = await import('./DataStorage.js');
            this.storage = new DataStorage();
            console.log('DataManager: DataStorage initialized');
            
        } catch (error) {
            console.warn('DataStorage not available, using fallback mode:', error);
            // フォールバック: 基本的なLocalStorage使用
            this.storage = {
                save: async (key: string, data: any) => {
                    localStorage.setItem(key, JSON.stringify(data));
                },
                load: async (key: string) => {
                    const data = localStorage.getItem(key);
                    return data ? JSON.parse(data) : null;
                },
                remove: async (key: string) => {
                    localStorage.removeItem(key);
                }
            };
        }
    }
    
    /**
     * クラウド対応コンポーネントの初期化
     */
    private async initializeCloudComponents(): Promise<void> {
        try {
            // CloudStorageAdapterの初期化
            await this.initializeCloudStorage();
            
            // SyncManagerの初期化
            if (this.storage && this.cloudStorage) {
                await this.initializeSyncManager();
            }
            
            // OfflineManagerの初期化
            if (this.storage && this.syncManager) {
                await this.initializeOfflineManager();
            }
            
        } catch (error) {
            console.warn('Cloud components initialization failed, continuing in offline mode:', error);
        }
    }
    
    /**
     * クラウドストレージの初期化
     */
    private async initializeCloudStorage(): Promise<void> {
        try {
            const { createCloudStorageAdapter } = await import('./CloudStorageAdapter.js');
            
            // 設定からクラウドプロバイダー情報を取得
            const cloudConfig = this.getCloudConfig();
            
            if (cloudConfig.enabled) {
                this.cloudStorage = createCloudStorageAdapter(cloudConfig.provider, cloudConfig);
                console.log('DataManager: CloudStorageAdapter initialized');
            }
            
        } catch (error) {
            console.warn('CloudStorageAdapter not available:', error);
        }
    }
    
    /**
     * 同期マネージャーの初期化
     */
    private async initializeSyncManager(): Promise<void> {
        try {
            const { SyncManager } = await import('./SyncManager.js');
            this.syncManager = new SyncManager(this.storage, this.cloudStorage);
            console.log('DataManager: SyncManager initialized');
            
        } catch (error) {
            console.warn('SyncManager not available:', error);
        }
    }
    
    /**
     * オフラインマネージャーの初期化
     */
    private async initializeOfflineManager(): Promise<void> {
        try {
            const { OfflineManager } = await import('./OfflineManager.js');
            this.offlineManager = new OfflineManager(this.storage, this.syncManager);
            console.log('DataManager: OfflineManager initialized');
            
        } catch (error) {
            console.warn('OfflineManager not available:', error);
        }
    }
    
    /**
     * クラウド設定の取得
     */
    private getCloudConfig(): CloudConfig {
        const defaultConfig: CloudConfig = {
            enabled: false,
            provider: 'generic',
            apiEndpoint: null,
            autoSync: true,
            conflictResolution: 'timestamp'
        };
        
        try {
            // SettingsManagerから設定を取得
            if (this.settingsManager && this.settingsManager.get) {
                const cloudSettings = this.settingsManager.get('cloud') || {};
                return { ...defaultConfig, ...cloudSettings };
            }
            
            // LocalStorageから設定を取得（フォールバック）
            const storedConfig = localStorage.getItem('bubblePop_cloudConfig');
            if (storedConfig) {
                const parsedConfig = JSON.parse(storedConfig);
                return { ...defaultConfig, ...parsedConfig };
            }
            
        } catch (error) {
            console.warn('Failed to get cloud config:', error);
        }
        
        return defaultConfig;
    }
    
    /**
     * データ保存の統一インターフェース
     */
    public async save(dataType: string, data: any, options: SaveOptions = {}): Promise<any> {
        return await this.storageManager.save(dataType, data, options);
    }
    
    /**
     * データ読み込みの統一インターフェース
     */
    public async load(dataType: string, options: LoadOptions = {}): Promise<any> {
        const cacheKey = this.storageManager.generateCacheKey(dataType, options);
        const useCache = options.useCache !== false;
        
        if (useCache) {
            return await this.cache.getOrSet(
                cacheKey,
                async () => {
                    return await this.storageManager.loadWithQueue(dataType, options);
                },
                {
                    ttl: options.cacheTtl || 5 * 60 * 1000, // 5分
                    priority: options.priority === 'high' ? 'high' : 'normal',
                    tags: [`dataType:${dataType}`, 'data-load'],
                    dependencies: options.dependencies || []
                }
            );
        } else {
            return await this.storageManager.loadWithQueue(dataType, options);
        }
    }
    
    /**
     * PlayerDataの保存
     */
    public async savePlayerData(data: any, options?: SaveOptions): Promise<any> {
        if (this.playerData) {
            return await this.playerData.save();
        }
        
        const key = 'bubblePop_playerData';
        return await this.storage!.save(key, data);
    }
    
    /**
     * PlayerDataの読み込み
     */
    public async loadPlayerData(options?: LoadOptions): Promise<any> {
        if (this.playerData) {
            return {
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
        }
        
        const key = 'bubblePop_playerData';
        return await this.storage!.load(key);
    }
    
    /**
     * 設定データの保存
     */
    public async saveSettings(data: any, options?: SaveOptions): Promise<any> {
        if (this.settingsManager) {
            return await this.settingsManager.save();
        }
        
        const key = 'bubblePop_settings';
        return await this.storage!.save(key, data);
    }
    
    /**
     * 設定データの読み込み
     */
    public async loadSettings(options?: LoadOptions): Promise<any> {
        if (this.settingsManager) {
            return this.settingsManager.getAllSettings();
        }
        
        const key = 'bubblePop_settings';
        return await this.storage!.load(key);
    }
    
    /**
     * 統計データの保存
     */
    public async saveStatistics(data: any, options?: SaveOptions): Promise<any> {
        if (this.statisticsManager) {
            return await this.statisticsManager.save();
        }
        
        const key = 'bubblePop_statistics';
        return await this.storage!.save(key, data);
    }
    
    /**
     * 統計データの読み込み
     */
    public async loadStatistics(options?: LoadOptions): Promise<any> {
        if (this.statisticsManager) {
            return {
                statistics: this.statisticsManager.statistics,
                sessionStats: this.statisticsManager.sessionStats
            };
        }
        
        const key = 'bubblePop_statistics';
        return await this.storage!.load(key);
    }
    
    /**
     * 汎用データの保存
     */
    public async saveGenericData(dataType: string, data: any, options?: SaveOptions): Promise<any> {
        const key = `bubblePop_${dataType}`;
        return await this.storage!.save(key, data);
    }
    
    /**
     * 汎用データの読み込み
     */
    public async loadGenericData(dataType: string, options?: LoadOptions): Promise<any> {
        const key = `bubblePop_${dataType}`;
        return await this.storage!.load(key);
    }
    
    /**
     * バッチ保存操作
     */
    public async saveBatch(operations: BatchOperation[], options: any = {}): Promise<any> {
        const batchOperations = operations.map(({ dataType, data, operationOptions = {} }) => {
            return async () => {
                return await this.saveDataDirect(dataType, data, operationOptions);
            };
        });
        
        return await this.asyncQueue.executeBatch(batchOperations, {
            priority: options.priority || 'normal',
            parallel: options.parallel !== false,
            metadata: { operation: 'batchSave', count: operations.length }
        });
    }
    
    /**
     * バッチ読み込み操作
     */
    public async loadBatch(dataTypes: string[], options: any = {}): Promise<any> {
        const batchOperations = dataTypes.map((dataType) => {
            return async () => {
                return await this.loadDataDirect(dataType, options);
            };
        });
        
        return await this.asyncQueue.executeBatch(batchOperations, {
            priority: options.priority || 'low',
            parallel: options.parallel !== false,
            metadata: { operation: 'batchLoad', count: dataTypes.length }
        });
    }
    
    /**
     * 直接データ保存
     */
    private async saveDataDirect(dataType: string, data: any, options: any = {}): Promise<SaveResult> {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }
            
            const startTime = performance.now();
            let result;
            
            switch(dataType) {
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
            
            const duration = performance.now() - startTime;
            return { result, duration };
            
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * 直接データ読み込み
     */
    private async loadDataDirect(dataType: string, options: any = {}): Promise<LoadResult> {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }
            
            const startTime = performance.now();
            let result;
            
            switch(dataType) {
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
            
            const duration = performance.now() - startTime;
            return { result, duration };
            
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * キャッシュの無効化
     */
    public invalidateCache(pattern: string | string[]): number {
        if (typeof pattern === 'string') {
            if (pattern.includes('*')) {
                const regex = new RegExp(pattern.replace(/\*/g, '.*'));
                const keysToDelete = this.cache.keys().filter((key: string) => regex.test(key));
                return this.cache.deleteMany(keysToDelete);
            } else {
                return this.cache.delete(pattern) ? 1 : 0;
            }
        } else if (Array.isArray(pattern)) {
            return this.cache.deleteMany(pattern);
        }
        
        return 0;
    }
    
    /**
     * 依存関係によるキャッシュ無効化
     */
    public invalidateCacheByDependency(dependency: string): number {
        return this.cache.invalidateByDependency(dependency);
    }
    
    /**
     * キャッシュ統計の取得
     */
    public getCacheStatus(): any {
        return this.cache.getStats();
    }
    
    /**
     * チャンク処理の状態を取得
     */
    public getChunkProcessorStatus(): any {
        return this.chunkProcessor.getStats();
    }
    
    /**
     * 非同期操作キューの状態を取得
     */
    public getAsyncQueueStatus(): any {
        return this.asyncQueue.getStatus();
    }
    
    /**
     * データマネージャーの状態を取得
     */
    public getStatus(): any {
        return {
            isInitialized: this.isInitialized,
            version: this.version,
            status: { ...this.status },
            asyncQueue: this.getAsyncQueueStatus(),
            chunkProcessor: this.getChunkProcessorStatus(),
            cache: this.getCacheStatus(),
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
    public on(event: string, callback: Function): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);
    }
    
    /**
     * イベントリスナーの削除
     */
    public off(event: string, callback: Function): void {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event)!;
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    /**
     * イベントの発火
     */
    public emit(event: string, data?: any): void {
        if (this.listeners.has(event)) {
            this.listeners.get(event)!.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    this.errorHandler.handleError(error, 'DataManager.emit', {
                        event,
                        data
                    });
                }
            });
        }
    }
    
    /**
     * クラウド同期の実行
     */
    public async syncToCloud(options: any = {}): Promise<any> {
        try {
            if (!this.syncManager) {
                throw new Error('Sync manager not available');
            }
            
            console.log('DataManager: Starting cloud sync...');
            const syncResult = await this.syncManager.sync(options);
            
            this.emit('cloudSyncCompleted', syncResult);
            return syncResult;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'DataManager.syncToCloud');
            this.emit('cloudSyncFailed', error);
            throw error;
        }
    }
    
    /**
     * オフライン状態の取得
     */
    public getOfflineStatus(): any {
        if (this.offlineManager) {
            return this.offlineManager.getOfflineStatus();
        }
        
        return {
            connectionQuality: 'unknown',
            offlineOperations: 0,
            cloudAvailable: !!this.cloudStorage
        };
    }
    
    /**
     * 同期状態の取得
     */
    public getSyncStatus(): any {
        if (this.syncManager) {
            return this.syncManager.getSyncStatus();
        }
        
        return {
            isInProgress: false,
            lastSyncTime: null,
            pendingConflicts: 0,
            cloudAuthenticated: this.cloudStorage ? this.cloudStorage.isAuthenticated() : false,
            isOnline: navigator.onLine
        };
    }
    
    /**
     * クラウドストレージへの認証
     */
    public async authenticateCloud(credentials: any): Promise<boolean> {
        try {
            if (!this.cloudStorage) {
                throw new Error('Cloud storage not available');
            }
            
            const result = await this.cloudStorage.authenticate(credentials);
            
            if (result) {
                // 認証成功後、自動同期を開始
                if (this.syncManager) {
                    this.syncManager.startAutoSync();
                }
                
                this.emit('cloudAuthenticated', { timestamp: Date.now() });
            }
            
            return result;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'DataManager.authenticateCloud');
            this.emit('cloudAuthFailed', error);
            throw error;
        }
    }
    
    /**
     * クラウドストレージからのログアウト
     */
    public async logoutCloud(): Promise<void> {
        try {
            if (this.cloudStorage) {
                await this.cloudStorage.logout();
            }
            
            if (this.syncManager) {
                this.syncManager.stopAutoSync();
            }
            
            this.emit('cloudLoggedOut', { timestamp: Date.now() });
            
        } catch (error) {
            this.errorHandler.handleError(error, 'DataManager.logoutCloud');
            throw error;
        }
    }
    
    /**
     * リソースの解放
     */
    public destroy(): void {
        try {
            this.listeners.clear();
            
            if (this.storage && typeof this.storage.destroy === 'function') {
                this.storage.destroy();
            }
            
            if (this.offlineManager && typeof this.offlineManager.destroy === 'function') {
                this.offlineManager.destroy();
            }
            
            if (this.syncManager && typeof this.syncManager.destroy === 'function') {
                this.syncManager.destroy();
            }
            
            if (this.cloudStorage && typeof this.cloudStorage.destroy === 'function') {
                this.cloudStorage.destroy();
            }
            
            console.log('DataManager destroyed');
            
        } catch (error) {
            this.errorHandler.handleError(error, 'DataManager.destroy');
        }
    }
}

// シングルトンインスタンス
let dataManagerInstance: DataManager | null = null;

/**
 * DataManagerシングルトンインスタンスの取得
 */
export function getDataManager(gameEngine: GameEngineInterface | null = null): DataManager | null {
    if (!dataManagerInstance && gameEngine) {
        dataManagerInstance = new DataManager(gameEngine);
    }
    return dataManagerInstance;
}