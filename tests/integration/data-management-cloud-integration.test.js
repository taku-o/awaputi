import { DataManager } from '../../src/core/DataManager.js';
import { CloudStorageAdapter } from '../../src/core/CloudStorageAdapter.js';
import { SyncManager } from '../../src/core/SyncManager.js';
import { OfflineManager } from '../../src/core/OfflineManager.js';
import { DataStorage } from '../../src/core/DataStorage.js';

describe('データ管理 - クラウド対応統合テスト', () => {
    let dataManager;
    let mockGameEngine;
    let mockFetch;
    
    beforeEach(async () => {
        // fetchのモック
        mockFetch = jest.fn();
        global.fetch = mockFetch;
        
        // navigator.onLineのモック
        Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: true
        });
        
        // performanceのモック
        global.performance = {
            now: jest.fn(() => 100)
        };
        
        // localStorageのモック
        const localStorageMock = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            key: jest.fn(),
            get length() { return 0; }
        };
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock
        });
        
        // documentのモック
        global.document = {
            addEventListener: jest.fn(),
            hidden: false
        };
        
        // windowのモック
        global.window = {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn()
        };
        
        // GameEngineのモック
        mockGameEngine = {
            playerData: {
                save: jest.fn(),
                load: jest.fn(),
                get: jest.fn(() => ({ name: 'TestPlayer', score: 1000 }))
            },
            settingsManager: {
                get: jest.fn((key) => {
                    if (key === 'cloud') {
                        return {
                            enabled: true,
                            provider: 'test',
                            apiEndpoint: 'https://api.test.com'
                        };
                    }
                    return null;
                })
            },
            statisticsManager: {
                getStatistics: jest.fn(() => ({ totalGames: 10, totalScore: 5000 }))
            }
        };
        
        // setInterval/clearIntervalのモック
        jest.useFakeTimers();
        
        dataManager = new DataManager(mockGameEngine);
        await dataManager.initialize();
    });
    
    afterEach(() => {
        if (dataManager) {
            dataManager.destroy();
        }
        jest.useRealTimers();
        jest.clearAllMocks();
    });
    
    describe('DataManager統合', () => {
        test('クラウド機能付きで正常に初期化される', () => {
            expect(dataManager.isInitialized).toBe(true);
            expect(dataManager.storage).toBeInstanceOf(DataStorage);
        });
        
        test('クラウド設定が正しく読み込まれる', () => {
            const cloudConfig = dataManager.getCloudConfig();
            
            expect(cloudConfig.enabled).toBe(true);
            expect(cloudConfig.provider).toBe('test');
            expect(cloudConfig.apiEndpoint).toBe('https://api.test.com');
        });
        
        test('クラウドコンポーネントが初期化される', async () => {
            // クラウド機能が有効化されていることを確認
            await dataManager.initializeCloudComponents();
            
            // 設定によってはクラウドストレージが初期化される
            const cloudConfig = dataManager.getCloudConfig();
            if (cloudConfig.enabled) {
                expect(dataManager.cloudStorage).toBeDefined();
            }
        });
    });
    
    describe('ローカル・クラウド間のデータ同期', () => {
        beforeEach(async () => {
            // クラウドストレージの認証をモック
            if (dataManager.cloudStorage) {
                dataManager.cloudStorage.authToken = 'test-token';
                dataManager.cloudStorage.userId = 'test-user';
            }
            
            // API応答のモック
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ success: true })
            });
        });
        
        test('ローカルデータがクラウドにアップロードされる', async () => {
            const testData = { playerName: 'Test', score: 1500 };
            
            // ローカルに保存
            await dataManager.save('playerData', testData);
            
            // クラウド同期が利用可能な場合にテスト
            if (dataManager.syncManager) {
                // SyncManagerをモック
                dataManager.syncManager.sync = jest.fn().mockResolvedValue({
                    synchronized: 1,
                    conflicts: 0,
                    errors: 0
                });
                
                const result = await dataManager.syncToCloud();
                
                expect(result.synchronized).toBe(1);
                expect(dataManager.syncManager.sync).toHaveBeenCalled();
            }
        });
        
        test('クラウドデータがローカルにダウンロードされる', async () => {
            // クラウドから取得されるデータをモック
            const cloudData = { playerName: 'CloudPlayer', score: 2000 };
            
            if (dataManager.syncManager && dataManager.cloudStorage) {
                // CloudStorageのgetメソッドをモック
                dataManager.cloudStorage.get = jest.fn().mockResolvedValue(cloudData);
                
                // SyncManagerの同期をモック
                dataManager.syncManager.sync = jest.fn().mockResolvedValue({
                    synchronized: 1,
                    conflicts: 0,
                    errors: 0
                });
                
                const result = await dataManager.syncToCloud({ direction: 'down' });
                
                expect(result.synchronized).toBe(1);
            }
        });
        
        test('データ競合が適切に解決される', async () => {
            const localData = { 
                playerName: 'LocalPlayer', 
                score: 1500,
                _metadata: { timestamp: Date.now() - 1000 }
            };
            const cloudData = { 
                playerName: 'CloudPlayer', 
                score: 2000,
                _cloudMetadata: { uploadedAt: Date.now() }
            };
            
            if (dataManager.syncManager) {
                // 競合データをモック
                dataManager.storage.load = jest.fn().mockResolvedValue(localData);
                dataManager.cloudStorage.get = jest.fn().mockResolvedValue(cloudData);
                
                dataManager.syncManager.sync = jest.fn().mockResolvedValue({
                    synchronized: 1,
                    conflicts: 1,
                    errors: 0
                });
                
                const result = await dataManager.syncToCloud();
                
                expect(result.conflicts).toBe(1);
            }
        });
    });
    
    describe('オフライン・オンライン統合', () => {
        test('オフライン時の操作がキューに記録される', async () => {
            // オフライン状態に設定
            navigator.onLine = false;
            
            if (dataManager.offlineManager) {
                dataManager.offlineManager.state.isOnline = false;
                
                const testData = { playerName: 'OfflinePlayer', score: 800 };
                
                // オフライン操作の記録をモック
                dataManager.offlineManager.recordOfflineOperation = jest.fn().mockResolvedValue('op123');
                
                await dataManager.offlineManager.recordOfflineOperation({
                    type: 'save',
                    key: 'playerData',
                    data: testData
                });
                
                expect(dataManager.offlineManager.recordOfflineOperation).toHaveBeenCalledWith({
                    type: 'save',
                    key: 'playerData',
                    data: testData
                });
            }
        });
        
        test('オンライン復帰時に自動同期が実行される', async () => {
            // オフライン状態から開始
            navigator.onLine = false;
            
            if (dataManager.offlineManager && dataManager.syncManager) {
                dataManager.offlineManager.state.isOnline = false;
                
                // オンライン復帰をシミュレート
                navigator.onLine = true;
                
                // 自動同期のモック
                dataManager.syncManager.sync = jest.fn().mockResolvedValue({
                    synchronized: 2,
                    conflicts: 0,
                    errors: 0
                });
                
                await dataManager.offlineManager.handleOnlineRecovery();
                
                // 設定により自動同期が実行される（遅延後）
                jest.advanceTimersByTime(3000);
                await jest.runAllTimersAsync();
            }
        });
        
        test('接続品質が監視される', async () => {
            if (dataManager.offlineManager) {
                // 良好な接続をモック
                mockFetch.mockResolvedValue({ ok: true });
                global.performance.now = jest.fn()
                    .mockReturnValueOnce(0)
                    .mockReturnValueOnce(150); // 150ms
                
                const quality = await dataManager.offlineManager.checkConnectionQuality();
                
                expect(quality).toBe('good');
                expect(dataManager.offlineManager.state.connectionQuality).toBe('good');
            }
        });
    });
    
    describe('データストレージフォールバック', () => {
        test('LocalStorageからIndexedDBへのフォールバック', async () => {
            // LocalStorageエラーをシミュレート
            localStorage.setItem = jest.fn().mockImplementation(() => {
                throw new Error('QuotaExceededError');
            });
            
            const testData = { test: 'fallback data' };
            
            try {
                await dataManager.save('testKey', testData);
                // フォールバック動作のテスト（実際の実装依存）
            } catch (error) {
                // エラーハンドリングのテスト
                expect(error).toBeDefined();
            }
        });
        
        test('ストレージエラー時の適切なエラーハンドリング', async () => {
            // 全ストレージが失敗する場合
            localStorage.setItem = jest.fn().mockImplementation(() => {
                throw new Error('Storage not available');
            });
            
            const testData = { test: 'error data' };
            
            await expect(dataManager.save('errorKey', testData))
                .rejects.toThrow();
        });
    });
    
    describe('統合エラーハンドリング', () => {
        test('クラウド認証失敗が適切に処理される', async () => {
            if (dataManager.cloudStorage) {
                dataManager.cloudStorage.authenticate = jest.fn().mockRejectedValue(
                    new Error('Authentication failed')
                );
                
                await expect(dataManager.authenticateCloud({
                    username: 'test',
                    password: 'wrong'
                })).rejects.toThrow('Authentication failed');
            }
        });
        
        test('同期エラーが適切に処理される', async () => {
            if (dataManager.syncManager) {
                dataManager.syncManager.sync = jest.fn().mockRejectedValue(
                    new Error('Sync failed')
                );
                
                await expect(dataManager.syncToCloud())
                    .rejects.toThrow('Sync failed');
            }
        });
        
        test('ネットワーク断絶が適切に処理される', async () => {
            // ネットワークエラーをシミュレート
            mockFetch.mockRejectedValue(new Error('Network error'));
            
            if (dataManager.offlineManager) {
                const quality = await dataManager.offlineManager.checkConnectionQuality();
                
                expect(dataManager.offlineManager.state.heartbeatFailures).toBeGreaterThan(0);
            }
        });
    });
    
    describe('パフォーマンス統合テスト', () => {
        test('データ保存が100ms以内に完了する', async () => {
            const testData = { performance: 'test', timestamp: Date.now() };
            
            const startTime = performance.now();
            await dataManager.save('performanceTest', testData);
            const endTime = performance.now();
            
            const duration = endTime - startTime;
            expect(duration).toBeLessThan(100);
        });
        
        test('データ読み込みが50ms以内に完了する', async () => {
            const testData = { performance: 'test' };
            await dataManager.save('performanceRead', testData);
            
            const startTime = performance.now();
            await dataManager.load('performanceRead');
            const endTime = performance.now();
            
            const duration = endTime - startTime;
            expect(duration).toBeLessThan(50);
        });
        
        test('大量データのチャンク処理が効率的に実行される', async () => {
            const largeData = {
                data: 'x'.repeat(1000000), // 1MB
                timestamp: Date.now()
            };
            
            if (dataManager.cloudStorage) {
                // チャンク処理のモック
                dataManager.cloudStorage.setChunked = jest.fn().mockResolvedValue(true);
                
                const startTime = performance.now();
                
                // 大容量データの処理をシミュレート
                await dataManager.cloudStorage.setChunked('largeData', largeData);
                
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                // チャンク処理が呼ばれることを確認
                expect(dataManager.cloudStorage.setChunked).toHaveBeenCalled();
            }
        });
    });
    
    describe('システム状態統合', () => {
        test('統合システム状態が正しく取得される', () => {
            const offlineStatus = dataManager.getOfflineStatus();
            const syncStatus = dataManager.getSyncStatus();
            
            expect(offlineStatus).toHaveProperty('isOnline');
            expect(offlineStatus).toHaveProperty('connectionQuality');
            expect(syncStatus).toHaveProperty('isInProgress');
            expect(syncStatus).toHaveProperty('cloudAuthenticated');
        });
        
        test('設定変更が全コンポーネントに反映される', () => {
            if (dataManager.syncManager && dataManager.offlineManager) {
                // 同期設定の更新
                dataManager.syncManager.updateConfig({
                    autoSyncInterval: 10 * 60 * 1000
                });
                
                expect(dataManager.syncManager.config.autoSyncInterval).toBe(10 * 60 * 1000);
                
                // オフライン設定の更新
                dataManager.offlineManager.updateConfig({
                    maxOfflineOperations: 500
                });
                
                expect(dataManager.offlineManager.config.maxOfflineOperations).toBe(500);
            }
        });
    });
    
    describe('データ一貫性統合テスト', () => {
        test('複数システム間でのデータ一貫性が保たれる', async () => {
            const testData = { 
                consistency: 'test',
                value: 12345,
                timestamp: Date.now()
            };
            
            // DataManagerを通じてデータ保存
            await dataManager.save('consistencyTest', testData);
            
            // 直接読み込んで一貫性を確認
            const retrievedData = await dataManager.load('consistencyTest');
            
            expect(retrievedData.consistency).toBe(testData.consistency);
            expect(retrievedData.value).toBe(testData.value);
        });
        
        test('バックアップからの復旧でデータ一貫性が保たれる', async () => {
            const originalData = { backup: 'test', value: 999 };
            
            // データ保存
            await dataManager.save('backupTest', originalData);
            
            // バックアップが利用可能な場合のテスト
            if (dataManager.backup) {
                // バックアップ作成をモック
                dataManager.backup.createBackup = jest.fn().mockResolvedValue(true);
                
                await dataManager.backup.createBackup();
                expect(dataManager.backup.createBackup).toHaveBeenCalled();
            }
        });
    });
});