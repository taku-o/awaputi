import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * 同期マネージャー - ローカル・クラウド間のデータ同期機能
 * 
 * 責任:
 * - ローカルとクラウド間のデータ同期
 * - 同期状態の管理
 * - 競合解決機能
 * - 同期エラーハンドリング
 */
export class SyncManager {
    constructor(localStorage, cloudStorage) {
        this.localStorage = localStorage;
        this.cloudStorage = cloudStorage;
        
        this.config = {
            autoSyncInterval: 5 * 60 * 1000, // 5分間隔
            conflictResolutionStrategy: 'timestamp', // 'timestamp', 'manual', 'local', 'cloud'
            maxSyncRetries: 3,
            syncBatchSize: 10,
            enableOfflineMode: true
        };
        
        this.syncState = {
            isInProgress: false,
            lastSyncTime: null,
            pendingOperations: [],
            conflicts: [],
            syncErrors: []
        };
        
        this.autoSyncTimer = null;
        this.eventListeners = new Map();
        
        this.initialize();
    }
    
    /**
     * 同期マネージャーの初期化
     */
    async initialize() {
        try {
            console.log('SyncManager: 同期マネージャーを初期化中...');
            
            // 保存された同期状態の復元
            await this.restoreSyncState();
            
            // 自動同期の開始
            this.startAutoSync();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            console.log('SyncManager: 初期化が完了しました');
            
        } catch (error) {
            getErrorHandler().handleError(error, 'SYNC_MANAGER_INITIALIZATION_ERROR', {
                operation: 'initialize'
            });
        }
    }
    
    /**
     * 手動同期の実行
     */
    async sync(options = {}) {
        if (this.syncState.isInProgress) {
            console.warn('SyncManager: Sync already in progress');
            return this.getSyncStatus();
        }
        
        this.syncState.isInProgress = true;
        this.emitEvent('syncStarted');
        
        try {
            console.log('SyncManager: Starting manual sync...');
            
            const syncResult = await this.performSync(options);
            
            this.syncState.lastSyncTime = Date.now();
            this.syncState.isInProgress = false;
            
            // 同期状態の保存
            await this.saveSyncState();
            
            this.emitEvent('syncCompleted', syncResult);
            
            console.log('SyncManager: Manual sync completed', syncResult);
            return syncResult;
            
        } catch (error) {
            this.syncState.isInProgress = false;
            this.syncState.syncErrors.push({
                timestamp: Date.now(),
                error: error.message,
                operation: 'manual_sync'
            });
            
            getErrorHandler().handleError(error, 'SYNC_ERROR', {
                operation: 'sync'
            });
            
            this.emitEvent('syncFailed', error);
            throw error;
        }
    }
    
    /**
     * 同期処理の実行
     */
    async performSync(options = {}) {
        const syncResult = {
            direction: options.direction || 'bidirectional', // 'up', 'down', 'bidirectional'
            synchronized: 0,
            conflicts: 0,
            errors: 0,
            skipped: 0,
            details: []
        };
        
        try {
            // クラウドストレージの認証確認
            if (!this.cloudStorage.isAuthenticated()) {
                throw new Error('クラウドストレージが認証されていません');
            }
            
            // オンライン状態の確認
            if (!navigator.onLine && !options.forceOffline) {
                throw new Error('オフライン状態のため同期できません');
            }
            
            // ローカルキーとクラウドキーの取得
            const localKeys = await this.localStorage.keys();
            const cloudKeys = await this.cloudStorage.keys();
            
            // 全キーのユニークリストを作成
            const allKeys = [...new Set([...localKeys, ...cloudKeys])];
            
            console.log(`SyncManager: Syncing ${allKeys.length} keys`);
            
            // バッチ処理で同期
            for (let i = 0; i < allKeys.length; i += this.config.syncBatchSize) {
                const batch = allKeys.slice(i, i + this.config.syncBatchSize);
                const batchResult = await this.syncBatch(batch, syncResult.direction);
                
                syncResult.synchronized += batchResult.synchronized;
                syncResult.conflicts += batchResult.conflicts;
                syncResult.errors += batchResult.errors;
                syncResult.skipped += batchResult.skipped;
                syncResult.details.push(...batchResult.details);
                
                // 進捗の通知
                this.emitEvent('syncProgress', {
                    progress: Math.min(100, ((i + batch.length) / allKeys.length) * 100),
                    current: i + batch.length,
                    total: allKeys.length
                });
            }
            
            // 競合の解決
            if (this.syncState.conflicts.length > 0) {
                await this.resolveConflicts();
            }
            
            return syncResult;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'SYNC_PERFORM_ERROR', {
                operation: 'performSync'
            });
            throw error;
        }
    }
    
    /**
     * バッチ同期の実行
     */
    async syncBatch(keys, direction) {
        const batchResult = {
            synchronized: 0,
            conflicts: 0,
            errors: 0,
            skipped: 0,
            details: []
        };
        
        for (const key of keys) {
            try {
                const itemResult = await this.syncItem(key, direction);
                
                batchResult[itemResult.action]++;
                batchResult.details.push({
                    key,
                    action: itemResult.action,
                    timestamp: Date.now(),
                    message: itemResult.message
                });
                
            } catch (error) {
                batchResult.errors++;
                batchResult.details.push({
                    key,
                    action: 'error',
                    timestamp: Date.now(),
                    error: error.message
                });
                
                console.error(`SyncManager: Error syncing key ${key}:`, error);
            }
        }
        
        return batchResult;
    }
    
    /**
     * 個別アイテムの同期
     */
    async syncItem(key, direction) {
        // ローカルとクラウドのデータを取得
        const localData = await this.localStorage.get(key);
        const cloudData = await this.cloudStorage.get(key);
        
        // データの存在パターンによる処理
        if (localData && cloudData) {
            // 両方に存在する場合 - 競合の可能性
            return await this.handleDataConflict(key, localData, cloudData, direction);
        } else if (localData && !cloudData) {
            // ローカルのみに存在
            if (direction === 'down') {
                return { action: 'skipped', message: 'Local only, direction is down' };
            }
            await this.cloudStorage.set(key, localData);
            return { action: 'synchronized', message: 'Uploaded to cloud' };
        } else if (!localData && cloudData) {
            // クラウドのみに存在
            if (direction === 'up') {
                return { action: 'skipped', message: 'Cloud only, direction is up' };
            }
            await this.localStorage.save(key, cloudData);
            return { action: 'synchronized', message: 'Downloaded from cloud' };
        } else {
            // 両方に存在しない（削除された可能性）
            return { action: 'skipped', message: 'No data found' };
        }
    }
    
    /**
     * データ競合の処理
     */
    async handleDataConflict(key, localData, cloudData, direction) {
        // データの比較
        if (this.isDataEqual(localData, cloudData)) {
            return { action: 'skipped', message: 'Data is identical' };
        }
        
        // タイムスタンプによる競合解決
        const localTimestamp = this.getDataTimestamp(localData);
        const cloudTimestamp = this.getDataTimestamp(cloudData);
        
        let resolutionAction;
        let winningData;
        let losingStorage;
        
        switch (this.config.conflictResolutionStrategy) {
            case 'timestamp':
                if (localTimestamp > cloudTimestamp) {
                    resolutionAction = 'local_wins';
                    winningData = localData;
                    losingStorage = this.cloudStorage;
                } else {
                    resolutionAction = 'cloud_wins';
                    winningData = cloudData;
                    losingStorage = this.localStorage;
                }
                break;
                
            case 'local':
                resolutionAction = 'local_wins';
                winningData = localData;
                losingStorage = this.cloudStorage;
                break;
                
            case 'cloud':
                resolutionAction = 'cloud_wins';
                winningData = cloudData;
                losingStorage = this.localStorage;
                break;
                
            case 'manual':
                // 手動解決のため競合キューに追加
                this.syncState.conflicts.push({
                    key,
                    localData,
                    cloudData,
                    timestamp: Date.now()
                });
                return { action: 'conflicts', message: 'Manual resolution required' };
                
            default:
                throw new Error(`Unknown conflict resolution strategy: ${this.config.conflictResolutionStrategy}`);
        }
        
        // 勝者のデータで負けた側を更新
        if (losingStorage === this.localStorage) {
            await this.localStorage.save(key, winningData);
        } else {
            await this.cloudStorage.set(key, winningData);
        }
        
        return { 
            action: 'synchronized', 
            message: `Conflict resolved: ${resolutionAction}` 
        };
    }
    
    /**
     * データの等価性チェック
     */
    isDataEqual(data1, data2) {
        try {
            // メタデータを除外してから比較
            const clean1 = this.removeMetadata(data1);
            const clean2 = this.removeMetadata(data2);
            
            return JSON.stringify(clean1) === JSON.stringify(clean2);
        } catch (error) {
            return false;
        }
    }
    
    /**
     * データからタイムスタンプを取得
     */
    getDataTimestamp(data) {
        if (data && data._metadata && data._metadata.timestamp) {
            return data._metadata.timestamp;
        }
        if (data && data._cloudMetadata && data._cloudMetadata.uploadedAt) {
            return data._cloudMetadata.uploadedAt;
        }
        return 0; // タイムスタンプが見つからない場合
    }
    
    /**
     * メタデータの除去
     */
    removeMetadata(data) {
        if (!data || typeof data !== 'object') {
            return data;
        }
        
        const { _metadata, _cloudMetadata, ...cleanData } = data;
        return cleanData;
    }
    
    /**
     * 競合の解決
     */
    async resolveConflicts() {
        const resolvedConflicts = [];
        
        for (const conflict of this.syncState.conflicts) {
            try {
                // デフォルトの競合解決（新しいタイムスタンプを優先）
                const localTimestamp = this.getDataTimestamp(conflict.localData);
                const cloudTimestamp = this.getDataTimestamp(conflict.cloudData);
                
                if (localTimestamp > cloudTimestamp) {
                    await this.cloudStorage.set(conflict.key, conflict.localData);
                } else {
                    await this.localStorage.save(conflict.key, conflict.cloudData);
                }
                
                resolvedConflicts.push(conflict);
                
            } catch (error) {
                console.error(`SyncManager: Failed to resolve conflict for key ${conflict.key}:`, error);
            }
        }
        
        // 解決された競合を削除
        this.syncState.conflicts = this.syncState.conflicts.filter(
            conflict => !resolvedConflicts.includes(conflict)
        );
    }
    
    /**
     * 自動同期の開始
     */
    startAutoSync() {
        if (this.autoSyncTimer) {
            this.stopAutoSync();
        }
        
        this.autoSyncTimer = setInterval(async () => {
            try {
                // オンライン状態とクラウド認証の確認
                if (navigator.onLine && this.cloudStorage.isAuthenticated()) {
                    console.log('SyncManager: Running auto sync...');
                    await this.sync({ direction: 'bidirectional' });
                }
            } catch (error) {
                console.warn('SyncManager: Auto sync failed:', error.message);
            }
        }, this.config.autoSyncInterval);
        
        console.log(`SyncManager: Auto sync started (interval: ${this.config.autoSyncInterval}ms)`);
    }
    
    /**
     * 自動同期の停止
     */
    stopAutoSync() {
        if (this.autoSyncTimer) {
            clearInterval(this.autoSyncTimer);
            this.autoSyncTimer = null;
            console.log('SyncManager: Auto sync stopped');
        }
    }
    
    /**
     * 同期状態の保存
     */
    async saveSyncState() {
        try {
            const stateData = {
                lastSyncTime: this.syncState.lastSyncTime,
                conflicts: this.syncState.conflicts,
                syncErrors: this.syncState.syncErrors.slice(-10) // 最新10件のみ保存
            };
            
            await this.localStorage.save('_syncState', stateData);
        } catch (error) {
            console.warn('SyncManager: Failed to save sync state:', error);
        }
    }
    
    /**
     * 同期状態の復元
     */
    async restoreSyncState() {
        try {
            const stateData = await this.localStorage.load('_syncState');
            if (stateData) {
                this.syncState.lastSyncTime = stateData.lastSyncTime;
                this.syncState.conflicts = stateData.conflicts || [];
                this.syncState.syncErrors = stateData.syncErrors || [];
                
                console.log('SyncManager: Sync state restored');
            }
        } catch (error) {
            console.warn('SyncManager: Failed to restore sync state:', error);
        }
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // オンライン状態の変化を監視
        window.addEventListener('online', () => {
            console.log('SyncManager: Back online, triggering sync...');
            setTimeout(() => {
                if (this.cloudStorage.isAuthenticated()) {
                    this.sync({ direction: 'bidirectional' });
                }
            }, 1000); // 1秒後に同期実行
        });
    }
    
    /**
     * 同期状態の取得
     */
    getSyncStatus() {
        return {
            isInProgress: this.syncState.isInProgress,
            lastSyncTime: this.syncState.lastSyncTime,
            pendingConflicts: this.syncState.conflicts.length,
            recentErrors: this.syncState.syncErrors.slice(-5),
            autoSyncEnabled: !!this.autoSyncTimer,
            cloudAuthenticated: this.cloudStorage.isAuthenticated(),
            isOnline: navigator.onLine
        };
    }
    
    /**
     * 同期設定の更新
     */
    updateConfig(newConfig) {
        const oldInterval = this.config.autoSyncInterval;
        
        this.config = { ...this.config, ...newConfig };
        
        // 自動同期間隔が変更された場合は再起動
        if (newConfig.autoSyncInterval && newConfig.autoSyncInterval !== oldInterval) {
            this.startAutoSync();
        }
        
        console.log('SyncManager: Configuration updated', this.config);
    }
    
    /**
     * イベントの発行
     */
    emitEvent(eventName, data = null) {
        const listeners = this.eventListeners.get(eventName) || [];
        listeners.forEach(listener => {
            try {
                listener(data);
            } catch (error) {
                console.error(`SyncManager: Error in event listener for ${eventName}:`, error);
            }
        });
    }
    
    /**
     * イベントリスナーの追加
     */
    on(eventName, listener) {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName).push(listener);
    }
    
    /**
     * イベントリスナーの削除
     */
    off(eventName, listener) {
        const listeners = this.eventListeners.get(eventName) || [];
        const index = listeners.indexOf(listener);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }
    
    /**
     * リソースの解放
     */
    destroy() {
        try {
            // 自動同期の停止
            this.stopAutoSync();
            
            // イベントリスナーの削除
            this.eventListeners.clear();
            
            // 同期状態の最終保存
            this.saveSyncState();
            
            console.log('SyncManager: Destroyed');
            
        } catch (error) {
            getErrorHandler().handleError(error, 'SYNC_MANAGER_DESTROY_ERROR', {
                operation: 'destroy'
            });
        }
    }
}