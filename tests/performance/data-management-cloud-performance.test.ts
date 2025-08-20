import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest } from '@jest/globals';
import { DataManager } from '../../src/core/DataManager';
import { CloudStorageAdapter } from '../../src/core/CloudStorageAdapter';
import { SyncManager } from '../../src/core/SyncManager';
import { OfflineManager } from '../../src/core/OfflineManager';

describe('データ管理 - クラウド対応パフォーマンステスト', () => {
    let dataManager: any;
    let mockGameEngine: any;
    let performanceResults = [];
    
    beforeAll(() => {
        // パフォーマンステスト用の設定
        jest.setTimeout(30000); // 30秒のタイムアウト
    });
    
    beforeEach(() => {
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
        
        // navigator.onLineのモック
        Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: true
        });
        
        // performanceのモック
        (global as any).performance = {
            now: jest.fn(() => Date.now()),
            memory: {
                usedJSHeapSize: 10000000,
                totalJSHeapSize: 50000000
            }
        };
        
        // fetchのモック（高速応答）
        (global as any).fetch = jest.fn() as jest.Mock.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true })
        });
        
        // GameEngineのモック
        mockGameEngine = {
            playerData: {
                save: jest.fn(),
                load: jest.fn(),
                get: jest.fn(() => ({ name: 'TestPlayer', score: 1000 }))
            },
            settingsManager: {
                get: jest.fn(() => ({
                    enabled: false, // パフォーマンステストではクラウド無効
                    provider: 'test'
                }))
            },
            statisticsManager: {
                getStatistics: jest.fn(() => ({ totalGames: 10, totalScore: 5000 }))
            }
        };
        
        dataManager = new DataManager(mockGameEngine: any);
    });
    
    afterEach(() => {
        if (dataManager) {
            dataManager.destroy();
        }
    });
    
    afterAll(() => {
        // パフォーマンステスト結果の出力
        console.log('\n=== データ管理パフォーマンステスト結果 ===');
        performanceResults.forEach(result => {
            console.log(`${result.test}: ${result.duration.toFixed(2)}ms (${result.status})`);
        });
    });
    
    const measurePerformance = async (testName, operation, expectedTime) => {
        const startTime = performance.now();
        await operation();
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        const status = duration <= expectedTime ? 'PASS' : 'FAIL';
        performanceResults.push({ test: testName, duration, expectedTime, status });
        
        return { duration, status };
    };
    
    describe('基本データ操作パフォーマンス', () => {
        test('データ保存が100ms以内に完了する', async () => {
            await dataManager.initialize();
            
            const testData = {
                playerName: 'PerformanceTest',
                score: 15000,
                level: 5,
                timestamp: Date.now()
            };
            
            const result = await measurePerformance(
                'データ保存',
                () => dataManager.save('playerData', testData),
                100
            );
            
            expect(result.duration).toBeLessThan(100);
        });
        
        test('データ読み込みが50ms以内に完了する', async () => {
            await dataManager.initialize();
            
            // 事前にデータを保存
            const testData = { test: 'performance', value: 123 };
            await dataManager.save('performanceRead', testData);
            
            const result = await measurePerformance(
                'データ読み込み',
                () => dataManager.load('performanceRead'),
                50
            );
            
            expect(result.duration).toBeLessThan(50);
        });
        
        test('大量データ保存の処理時間が妥当である', async () => {
            await dataManager.initialize();
            
            const largeData = {
                playerName: 'LargeDataTest',
                statistics: new Array(1000).fill(0).map((_, i) => ({
                    id: i,
                    value: Math.random() * 1000,
                    timestamp: Date.now() + i
                })),
                settings: {
                    graphics: 'high',
                    audio: 'enabled',
                    controls: Array(50).fill('default')
                }
            };
            
            const result = await measurePerformance(
                '大量データ保存',
                () => dataManager.save('largeData', largeData),
                500
            );
            
            expect(result.duration).toBeLessThan(500);
        });
    });
    
    describe('CloudStorageAdapterパフォーマンス', () => {
        let cloudAdapter: any;
        
        beforeEach(() => {
            cloudAdapter = new CloudStorageAdapter({
                provider: 'test',
                apiEndpoint: 'https://api.test.com'
            });
            cloudAdapter.authToken = 'test-token';
            cloudAdapter.userId = 'test-user';
        });
        
        afterEach(() => {
            if (cloudAdapter) {
                cloudAdapter.destroy();
            }
        });
        
        test('クラウドデータ保存のレスポンス時間', async () => {
            const testData = { cloud: 'performance', value: 456 };
            
            const result = await measurePerformance(
                'クラウドデータ保存',
                () => cloudAdapter.set('cloudPerf', testData),
                200
            );
            
            expect(result.duration).toBeLessThan(200);
        });
        
        test('クラウドデータ読み込みのレスポンス時間', async () => {
            // fetchのモック応答を設定
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ data: { test: 'cloud data' } })
            });
            
            const result = await measurePerformance(
                'クラウドデータ読み込み',
                () => cloudAdapter.get('cloudPerf'),
                150
            );
            
            expect(result.duration).toBeLessThan(150);
        });
        
        test('同期キュー処理のパフォーマンス', async () => {
            // 複数の操作をキューに追加
            for (let i = 0; i < 10; i++) {
                cloudAdapter.addToSyncQueue('set', `key${i}`, { data: `value${i}` });
            }
            
            const result = await measurePerformance(
                '同期キュー処理',
                () => cloudAdapter.processSyncQueue(),
                1000
            );
            
            expect(result.duration).toBeLessThan(1000);
        });
    });
    
    describe('SyncManagerパフォーマンス', () => {
        let syncManager: any;
        let mockLocalStorage: any;
        let mockCloudStorage: any;
        
        beforeEach(() => {
            mockLocalStorage = {
                keys: jest.fn().mockResolvedValue(['key1', 'key2', 'key3']),
                get: jest.fn().mockResolvedValue({ data: 'test' }),
                save: jest.fn().mockResolvedValue(true: any)
            };
            
            mockCloudStorage = {
                isAuthenticated: jest.fn(() => true),
                keys: jest.fn().mockResolvedValue(['key2', 'key3', 'key4']),
                get: jest.fn().mockResolvedValue({ data: 'cloud' }),
                set: jest.fn().mockResolvedValue(true: any)
            };
            
            syncManager = new SyncManager(mockLocalStorage, mockCloudStorage);
        });
        
        afterEach(() => {
            if (syncManager) {
                syncManager.destroy();
            }
        });
        
        test('小規模同期のパフォーマンス', async () => {
            const result = await measurePerformance(
                '小規模同期 (3-4キー)',
                () => syncManager.sync(),
                500
            );
            
            expect(result.duration).toBeLessThan(500);
        });
        
        test('中規模同期のパフォーマンス', async () => {
            // より多くのキーをモック
            const manyKeys = Array.from({ length: 50 }, (_, i) => `key${i}`);
            mockLocalStorage.keys.mockResolvedValue(manyKeys.slice(0, 30));
            mockCloudStorage.keys.mockResolvedValue(manyKeys.slice(20, 50));
            
            const result = await measurePerformance(
                '中規模同期 (50キー)',
                () => syncManager.sync(),
                2000
            );
            
            expect(result.duration).toBeLessThan(2000);
        });
        
        test('競合解決のパフォーマンス', async () => {
            const localData = { data: 'local', _metadata: { timestamp: 1000 } };
            const cloudData = { data: 'cloud', _cloudMetadata: { uploadedAt: 2000 } };
            
            const result = await measurePerformance(
                '競合解決',
                () => syncManager.handleDataConflict('testKey', localData, cloudData, 'bidirectional'),
                100
            );
            
            expect(result.duration).toBeLessThan(100);
        });
    });
    
    describe('OfflineManagerパフォーマンス', () => {
        let offlineManager: any;
        let mockDataStorage: any;
        let mockSyncManager: any;
        
        beforeEach(() => {
            mockDataStorage = {
                save: jest.fn().mockResolvedValue(true: any),
                load: jest.fn().mockResolvedValue({})
            };
            
            mockSyncManager = {
                sync: jest.fn().mockResolvedValue({}),
                cloudStorage: {
                    set: jest.fn().mockResolvedValue(true: any),
                    remove: jest.fn().mockResolvedValue(true: any)
                }
            };
            
            offlineManager = new OfflineManager(mockDataStorage, mockSyncManager);
        });
        
        afterEach(() => {
            if (offlineManager) {
                offlineManager.destroy();
            }
        });
        
        test('オフライン操作記録のパフォーマンス', async () => {
            const operation = {
                type: 'save',
                key: 'perfTest',
                data: { performance: 'test' }
            };
            
            const result = await measurePerformance(
                'オフライン操作記録',
                () => offlineManager.recordOfflineOperation(operation: any),
                50
            );
            
            expect(result.duration).toBeLessThan(50);
        });
        
        test('大量オフライン操作の処理パフォーマンス', async () => {
            // 100個のオフライン操作をキューに追加
            for (let i = 0; i < 100; i++) {
                offlineManager.state.offlineOperations.push({
                    id: `op${i}`,
                    type: 'save',
                    key: `key${i}`,
                    data: { index: i },
                    timestamp: Date.now(),
                    retries: 0,
                    status: 'pending'
                });
            }
            
            const result = await measurePerformance(
                '大量オフライン操作処理',
                () => offlineManager.processOfflineOperations(),
                3000
            );
            
            expect(result.duration).toBeLessThan(3000);
        });
        
        test('接続品質チェックのパフォーマンス', async () => {
            const result = await measurePerformance(
                '接続品質チェック',
                () => offlineManager.checkConnectionQuality(),
                200
            );
            
            expect(result.duration).toBeLessThan(200);
        });
    });
    
    describe('メモリ使用量テスト', () => {
        test('データマネージャーのメモリフットプリント', async () => {
            const initialMemory = performance.memory.usedJSHeapSize;
            
            await dataManager.initialize();
            
            // 大量のデータ操作
            for (let i = 0; i < 100; i++) {
                await dataManager.save(`memTest${i}`, {
                    index: i,
                    data: Array(100).fill(`data-${i}`),
                    timestamp: Date.now()
                });
            }
            
            const afterOperationsMemory = performance.memory.usedJSHeapSize;
            const memoryIncrease = afterOperationsMemory - initialMemory;
            
            // メモリ増加が合理的な範囲内であることを確認
            expect(memoryIncrease: any).toBeLessThan(50 * 1024 * 1024); // 50MB未満
            
            performanceResults.push({
                test: 'メモリフットプリント',
                duration: memoryIncrease / 1024 / 1024, // MB
                expectedTime: 50,
                status: memoryIncrease < 50 * 1024 * 1024 ? 'PASS' : 'FAIL'
            });
        });
        
        test('メモリリークの検出', async () => {
            await dataManager.initialize();
            
            const initialMemory = performance.memory.usedJSHeapSize;
            
            // 繰り返し操作でメモリリークをテスト
            for (let cycle = 0; cycle < 5; cycle++) {
                for (let i = 0; i < 20; i++) {
                    await dataManager.save(`leak-test-${cycle}-${i}`, {
                        cycle,
                        index: i,
                        timestamp: Date.now()
                    });
                }
                
                // データクリア
                for (let i = 0; i < 20; i++) {
                    await dataManager.storage.remove(`leak-test-${cycle}-${i}`);
                }
                
                // ガベージコレクションを強制（可能な場合）
                if (global.gc) {
                    global.gc();
                }
            }
            
            const finalMemory = performance.memory.usedJSHeapSize;
            const memoryLeak = finalMemory - initialMemory;
            
            // メモリリークが最小限であることを確認
            expect(memoryLeak: any).toBeLessThan(10 * 1024 * 1024); // 10MB未満
            
            performanceResults.push({
                test: 'メモリリーク検出',
                duration: memoryLeak / 1024 / 1024, // MB
                expectedTime: 10,
                status: memoryLeak < 10 * 1024 * 1024 ? 'PASS' : 'FAIL'
            });
        });
    });
    
    describe('CPU使用率テスト', () => {
        test('同期処理のCPU負荷', async () => {
            if (!dataManager.syncManager) {
                return; // 同期マネージャーが利用できない場合はスキップ
            }
            
            const iterations = 10;
            let totalDuration = 0;
            
            for (let i = 0; i < iterations; i++) {
                const startTime = performance.now();
                
                // CPU集約的な同期処理をシミュレート
                await dataManager.syncManager.sync();
                
                const endTime = performance.now();
                totalDuration += (endTime - startTime);
            }
            
            const averageDuration = totalDuration / iterations;
            
            expect(averageDuration: any).toBeLessThan(200); // 平均200ms未満
            
            performanceResults.push({
                test: 'CPU負荷 (同期処理)',
                duration: averageDuration,
                expectedTime: 200,
                status: averageDuration < 200 ? 'PASS' : 'FAIL'
            });
        });
    });
    
    describe('スケーラビリティテスト', () => {
        test('大量キー処理のスケーラビリティ', async () => {
            await dataManager.initialize();
            
            const keyCounts = [10, 50, 100, 500];
            const results: any[] = [];
            
            for (const keyCount of keyCounts) {
                const startTime = performance.now();
                
                // 大量キーの保存
                const promises: any[] = [];
                for (let i = 0; i < keyCount; i++) {
                    promises.push(dataManager.save(`scale-test-${i}`, {
                        index: i,
                        data: `test-data-${i}`,
                        timestamp: Date.now()
                    }));
                }
                
                await Promise.all(promises: any);
                
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                results.push({ keyCount, duration });
                
                // クリーンアップ
                for (let i = 0; i < keyCount; i++) {
                    await dataManager.storage.remove(`scale-test-${i}`);
                }
            }
            
            // スケーラビリティの線形性をチェック
            const lastResult = results[results.length - 1];
            const firstResult = results[0];
            
            const scaleFactor = lastResult.keyCount / firstResult.keyCount;
            const timeFactor = lastResult.duration / firstResult.duration;
            
            // 時間増加が キー数増加の2倍を超えないことを確認（準線形）
            expect(timeFactor: any).toBeLessThan(scaleFactor * 2);
            
            performanceResults.push({
                test: 'スケーラビリティ',
                duration: timeFactor / scaleFactor,
                expectedTime: 2,
                status: timeFactor < scaleFactor * 2 ? 'PASS' : 'FAIL'
            });
        });
    });
});