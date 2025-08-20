import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { SyncManager } from '../../src/core/SyncManager.js';

// 型定義
interface MockLocalStorage {
    keys: jest.Mock<Promise<string[]>, []>;
    get: jest.Mock<Promise<any>, [string]>;
    save: jest.Mock<Promise<boolean>, [string, any]>;
    load: jest.Mock<Promise<any>, [string]>;
}

interface MockCloudStorage {
    isAuthenticated: jest.Mock<boolean, []>;
    keys: jest.Mock<Promise<string[]>, []>;
    get: jest.Mock<Promise<any>, [string]>;
    set: jest.Mock<Promise<boolean>, [string, any]>;
}

interface LocalData {
    data: any;
    _metadata?: {
        timestamp: number;
    };
}

interface CloudData {
    data: any;
    _cloudMetadata?: {
        uploadedAt: number;
    };
}

interface SyncResult {
    synchronized: number;
    direction?: string;
    isInProgress?: boolean;
    conflicts?: number;
    errors?: number;
}

interface SyncOptions {
    direction?: 'up' | 'down' | 'bidirectional';
}

interface ConflictResult {
    action: string;
    message: string;
}

interface SyncStatus {
    isInProgress: boolean;
    lastSyncTime: number | null;
    cloudAuthenticated: boolean;
    isOnline: boolean;
}

interface SavedSyncState {
    lastSyncTime: number;
    conflicts: Array<{ key: string }>;
    syncErrors: any[];
}

describe('SyncManager', () => {
    let syncManager: SyncManager;
    let mockLocalStorage: MockLocalStorage;
    let mockCloudStorage: MockCloudStorage;
    
    beforeEach(() => {
        // LocalStorageのモック
        mockLocalStorage = {
            keys: jest.fn<any, any[]>(),
            get: jest.fn<any, any[]>(),
            save: jest.fn<any, any[]>(),
            load: jest.fn<any, any[]>()
        };
        
        // CloudStorageのモック
        mockCloudStorage = {
            isAuthenticated: jest.fn(() => true),
            keys: jest.fn<any, any[]>(),
            get: jest.fn<any, any[]>(),
            set: jest.fn<any, any[]>()
        };
        
        // navigator.onLineのモック
        Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: true
        });
        
        // setInterval/clearIntervalのモック
        jest.useFakeTimers();
        
        syncManager = new SyncManager(mockLocalStorage, mockCloudStorage);
    });
    
    afterEach(() => {
        if (syncManager) {
            syncManager.destroy();
        }
        jest.useRealTimers();
        jest.clearAllMocks();
    });
    
    describe('初期化', () => {
        test('基本設定で正常に初期化される', () => {
            expect(syncManager.localStorage).toBe(mockLocalStorage);
            expect(syncManager.cloudStorage).toBe(mockCloudStorage);
            expect(syncManager.config.autoSyncInterval).toBe(5 * 60 * 1000);
            expect(syncManager.config.conflictResolutionStrategy).toBe('timestamp');
        });
        
        test('同期状態が初期化される', () => {
            expect(syncManager.syncState.isInProgress).toBe(false);
            expect(syncManager.syncState.lastSyncTime).toBeNull();
            expect(syncManager.syncState.pendingOperations).toEqual([]);
            expect(syncManager.syncState.conflicts).toEqual([]);
        });
        
        test('イベントリスナーが設定される', () => {
            expect(syncManager.eventListeners).toBeInstanceOf(Map);
        });
    });
    
    describe('手動同期', () => {
        test('双方向同期が正常に実行される', async () => {
            // モックデータの設定
            mockLocalStorage.keys.mockResolvedValue(['key1', 'key2']);
            mockCloudStorage.keys.mockResolvedValue(['key2', 'key3']);
            
            mockLocalStorage.get
                .mockResolvedValueOnce({ data: 'local1', _metadata: { timestamp: 1000 } })
                .mockResolvedValueOnce({ data: 'local2', _metadata: { timestamp: 2000 } })
                .mockResolvedValueOnce(null);
            
            mockCloudStorage.get
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({ data: 'cloud2', _cloudMetadata: { uploadedAt: 1500 } })
                .mockResolvedValueOnce({ data: 'cloud3', _cloudMetadata: { uploadedAt: 3000 } });
            
            mockCloudStorage.set.mockResolvedValue(true);
            mockLocalStorage.save.mockResolvedValue(true);
            
            const result = await syncManager.sync();
            
            expect(result.synchronized).toBeGreaterThan(0);
            expect(syncManager.syncState.lastSyncTime).toBeTruthy();
            expect(syncManager.syncState.isInProgress).toBe(false);
        });
        
        test('アップロード専用同期が実行される', async () => {
            mockLocalStorage.keys.mockResolvedValue(['key1']);
            mockCloudStorage.keys.mockResolvedValue([]);
            
            mockLocalStorage.get.mockResolvedValue({ data: 'local1' });
            mockCloudStorage.get.mockResolvedValue(null);
            mockCloudStorage.set.mockResolvedValue(true);
            
            const result = await syncManager.sync({ direction: 'up' });
            
            expect(result.direction).toBe('up');
            expect(result.synchronized).toBe(1);
            expect(mockCloudStorage.set).toHaveBeenCalledWith('key1', { data: 'local1' });
        });
        
        test('ダウンロード専用同期が実行される', async () => {
            mockLocalStorage.keys.mockResolvedValue([]);
            mockCloudStorage.keys.mockResolvedValue(['key1']);
            
            mockLocalStorage.get.mockResolvedValue(null);
            mockCloudStorage.get.mockResolvedValue({ data: 'cloud1' });
            mockLocalStorage.save.mockResolvedValue(true);
            
            const result = await syncManager.sync({ direction: 'down' });
            
            expect(result.direction).toBe('down');
            expect(result.synchronized).toBe(1);
            expect(mockLocalStorage.save).toHaveBeenCalledWith('key1', { data: 'cloud1' });
        });
        
        test('進行中の同期が検出される', async () => {
            syncManager.syncState.isInProgress = true;
            
            const result = await syncManager.sync();
            
            expect(result.isInProgress).toBe(true);
        });
    });
    
    describe('競合解決', () => {
        test('タイムスタンプによる競合解決（ローカル勝利）', async () => {
            const localData: LocalData = { data: 'local', _metadata: { timestamp: 2000 } };
            const cloudData: CloudData = { data: 'cloud', _cloudMetadata: { uploadedAt: 1000 } };
            
            const result = await syncManager.handleDataConflict('testKey', localData, cloudData, 'bidirectional');
            
            expect(result.action).toBe('synchronized');
            expect(result.message).toContain('local_wins');
        });
        
        test('タイムスタンプによる競合解決（クラウド勝利）', async () => {
            const localData: LocalData = { data: 'local', _metadata: { timestamp: 1000 } };
            const cloudData: CloudData = { data: 'cloud', _cloudMetadata: { uploadedAt: 2000 } };
            
            mockLocalStorage.save.mockResolvedValue(true);
            
            const result = await syncManager.handleDataConflict('testKey', localData, cloudData, 'bidirectional');
            
            expect(result.action).toBe('synchronized');
            expect(result.message).toContain('cloud_wins');
            expect(mockLocalStorage.save).toHaveBeenCalledWith('testKey', cloudData);
        });
        
        test('ローカル優先戦略', async () => {
            syncManager.config.conflictResolutionStrategy = 'local';
            
            const localData = { data: 'local' };
            const cloudData = { data: 'cloud' };
            
            mockCloudStorage.set.mockResolvedValue(true);
            
            const result = await syncManager.handleDataConflict('testKey', localData, cloudData, 'bidirectional');
            
            expect(result.action).toBe('synchronized');
            expect(result.message).toContain('local_wins');
            expect(mockCloudStorage.set).toHaveBeenCalledWith('testKey', localData);
        });
        
        test('手動解決戦略', async () => {
            syncManager.config.conflictResolutionStrategy = 'manual';
            
            const localData = { data: 'local' };
            const cloudData = { data: 'cloud' };
            
            const result = await syncManager.handleDataConflict('testKey', localData, cloudData, 'bidirectional');
            
            expect(result.action).toBe('conflicts');
            expect(result.message).toContain('Manual resolution required');
            expect(syncManager.syncState.conflicts).toHaveLength(1);
        });
        
        test('同一データの競合スキップ', async () => {
            const identicalData = { data: 'same', value: 123 };
            const localData: LocalData = { ...identicalData, _metadata: { timestamp: 1000 } };
            const cloudData: CloudData = { ...identicalData, _cloudMetadata: { uploadedAt: 2000 } };
            
            const result = await syncManager.handleDataConflict('testKey', localData, cloudData, 'bidirectional');
            
            expect(result.action).toBe('skipped');
            expect(result.message).toBe('Data is identical');
        });
    });
    
    describe('データ比較', () => {
        test('同一データが正しく検出される', () => {
            const data1: LocalData = { name: 'test', value: 123, _metadata: { timestamp: 1000 } } as any;
            const data2: CloudData = { name: 'test', value: 123, _cloudMetadata: { uploadedAt: 2000 } } as any;
            
            expect(syncManager.isDataEqual(data1, data2)).toBe(true);
        });
        
        test('異なるデータが正しく検出される', () => {
            const data1 = { name: 'test', value: 123 };
            const data2 = { name: 'test', value: 456 };
            
            expect(syncManager.isDataEqual(data1, data2)).toBe(false);
        });
        
        test('メタデータが除外される', () => {
            const cleanData = { name: 'test', value: 123 };
            const dataWithMeta = {
                name: 'test',
                value: 123,
                _metadata: { timestamp: 1000 },
                _cloudMetadata: { uploadedAt: 2000 }
            };
            
            const result = syncManager.removeMetadata(dataWithMeta);
            expect(result).toEqual(cleanData);
        });
    });
    
    describe('自動同期', () => {
        test('自動同期が開始される', () => {
            syncManager.startAutoSync();
            
            expect(syncManager.autoSyncTimer).toBeTruthy();
        });
        
        test('自動同期が停止される', () => {
            syncManager.startAutoSync();
            syncManager.stopAutoSync();
            
            expect(syncManager.autoSyncTimer).toBeNull();
        });
        
        test('自動同期間隔で同期が実行される', async () => {
            const syncSpy = jest.spyOn(syncManager, 'sync').mockResolvedValue({} as SyncResult);
            
            syncManager.startAutoSync();
            
            // 5分間進める
            jest.advanceTimersByTime(5 * 60 * 1000);
            
            // タイマーコールバックの実行を待つ
            await Promise.resolve();
            
            expect(syncSpy).toHaveBeenCalled();
            
            // クリーンアップ
            syncManager.stopAutoSync();
        }, 20000); // タイムアウトを20秒に設定
    });
    
    describe('同期状態管理', () => {
        test('同期状態が正しく保存される', async () => {
            syncManager.syncState.lastSyncTime = Date.now();
            syncManager.syncState.conflicts = [{ key: 'test' }];
            
            await syncManager.saveSyncState();
            
            expect(mockLocalStorage.save).toHaveBeenCalledWith('_syncState', expect.objectContaining({
                lastSyncTime: expect.any(Number),
                conflicts: expect.any(Array)
            }));
        });
        
        test('同期状態が正しく復元される', async () => {
            const savedState: SavedSyncState = {
                lastSyncTime: 123456789,
                conflicts: [{ key: 'test' }],
                syncErrors: []
            };
            
            mockLocalStorage.load.mockResolvedValue(savedState);
            
            await syncManager.restoreSyncState();
            
            expect(syncManager.syncState.lastSyncTime).toBe(123456789);
            expect(syncManager.syncState.conflicts).toEqual([{ key: 'test' }]);
        });
    });
    
    describe('設定管理', () => {
        test('設定が正しく更新される', () => {
            const newConfig = {
                autoSyncInterval: 10 * 60 * 1000,
                conflictResolutionStrategy: 'cloud' as const
            };
            
            syncManager.updateConfig(newConfig);
            
            expect(syncManager.config.autoSyncInterval).toBe(10 * 60 * 1000);
            expect(syncManager.config.conflictResolutionStrategy).toBe('cloud');
        });
        
        test('自動同期間隔変更時に再起動される', () => {
            const startSpy = jest.spyOn(syncManager, 'startAutoSync');
            
            syncManager.updateConfig({ autoSyncInterval: 2 * 60 * 1000 });
            
            expect(startSpy).toHaveBeenCalled();
        });
    });
    
    describe('イベント管理', () => {
        test('イベントリスナーが正しく追加される', () => {
            const listener = jest.fn();
            
            syncManager.on('syncCompleted', listener);
            
            expect(syncManager.eventListeners.get('syncCompleted')).toContain(listener);
        });
        
        test('イベントが正しく発行される', () => {
            const listener = jest.fn();
            const testData = { test: 'data' };
            
            syncManager.on('testEvent', listener);
            syncManager.emitEvent('testEvent', testData);
            
            expect(listener).toHaveBeenCalledWith(testData);
        });
        
        test('イベントリスナーが正しく削除される', () => {
            const listener = jest.fn();
            
            syncManager.on('testEvent', listener);
            syncManager.off('testEvent', listener);
            
            expect(syncManager.eventListeners.get('testEvent')).not.toContain(listener);
        });
    });
    
    describe('エラーハンドリング', () => {
        test('未認証エラーが適切に処理される', async () => {
            mockCloudStorage.isAuthenticated.mockReturnValue(false);
            
            await expect(syncManager.sync()).rejects.toThrow('Cloud storage not authenticated');
        });
        
        test('オフライン状態でエラーが発生する', async () => {
            (navigator: any14439.onLine = false;
            
            await expect(syncManager.sync()).rejects.toThrow('Offline - cannot sync');
        });
        
        test('同期エラーが記録される', async () => {
            mockLocalStorage.keys.mockRejectedValue(new Error('Storage error'));
            
            await expect(syncManager.sync()).rejects.toThrow('Storage error');
            
            expect(syncManager.syncState.syncErrors.length).toBeGreaterThan(0);
        });
    });
    
    describe('同期状態取得', () => {
        test('同期状態が正しく返される', () => {
            syncManager.syncState.isInProgress = true;
            syncManager.syncState.lastSyncTime = 123456789;
            
            const status = syncManager.getSyncStatus();
            
            expect(status.isInProgress).toBe(true);
            expect(status.lastSyncTime).toBe(123456789);
            expect(status.cloudAuthenticated).toBe(true);
            expect(status.isOnline).toBe(true);
        });
    });
    
    describe('リソース管理', () => {
        test('destroy()でリソースが適切に解放される', () => {
            syncManager.startAutoSync();
            
            syncManager.destroy();
            
            expect(syncManager.autoSyncTimer).toBeNull();
            expect(syncManager.eventListeners.size).toBe(0);
        });
    });
});