import { jest, describe, test, expect, beforeEach, afterEach  } from '@jest/globals';
import { OfflineManager  } from '../../src/core/OfflineManager';
// Type definitions
interface MockDataStorage {
    save: jest.Mock<(ke,y: string, data => Promise<void>>),
    load: jest.Mock<(ke,y: string) => Promise<any>> }
interface MockSyncManager {
    sync: jest.Mock<() => Promise<void>>,
    cloudStorage: {
        set: jest.Mock<(ke,y: string, data => Promise<boolean>>),
        remove: jest.Mock<(ke,y: string') => Promise<boolean>> };
}
interface OfflineOperation {
    id: string,
    type: 'save' | 'remove',
    key: string,
    data?: any,
    timestamp: number,
    retries: number,
    status: 'pending' | 'processing' | 'failed',
    lastError?: string }
interface OfflineState {
    isOnline: boolean,
    connectionQuality: 'unknown' | 'good' | 'poor' | 'unstable' | 'offline',
    lastOnlineTime?: number,
    lastOfflineTime?: number,
    heartbeatFailures: number,
    offlineOperations: OfflineOperation[] }
interface OfflineStatus {
    isOnline: boolean,
    connectionQuality: string,
    offlineOperations: number,
    offlineDuration?: number }
interface MockPerformance {
    now: jest.Mock<(') => number> }
interface MockDocument {
    addEventListener: jest.Mock,
    hidden: boolean }
interface MockWindow {
    addEventListener: jest.Mock,
    removeEventListener: jest.Mock }
describe('OfflineManager', () => {
    let offlineManager: OfflineManager,
    let mockDataStorage: MockDataStorage,
    let mockSyncManager: MockSyncManager,
    let mockFetch: jest.Mock,
    
    beforeEach(() => {
        // DataStorage mock
        mockDataStorage = {
            save: jest.fn(
        load: jest.fn( };
        
        // SyncManager mock
        mockSyncManager = {
            sync: jest.fn(
            cloudStorage: {
                set: jest.fn(
        remove: jest.fn( }
        };
        
        // fetch mock - default success response
        mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            headers: {,
                get: jest.fn(() => Date.now().toString());
        )');
        global.fetch = mockFetch as any;
        
        // navigator.onLine mock
        Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: true),
        // performance mock
        global.performance = {
            now: jest.fn(() => 100)) as MockPerformance as any;
        
        // document mock
        global.document = {
            addEventListener: jest.fn(
            hidden: false
    ) as MockDocument as any;
        
        // window mock
        global.window = {
            addEventListener: jest.fn(
        removeEventListener: jest.fn( } as MockWindow as any;
        
        // Use fake timers
        jest.useFakeTimers();
        offlineManager = new OfflineManager(mockDataStorage, mockSyncManager);
    });
    afterEach(() => {
        if (offlineManager) {
            offlineManager.destroy() }
        jest.useRealTimers();
        jest.clearAllMocks();
    }');
    describe('初期化', (') => {
        test('基本設定で正常に初期化される', () => {
            expect(offlineManager.dataStorage).toBe(mockDataStorage),
            expect(offlineManager.syncManager).toBe(mockSyncManager),
            expect(offlineManager.config.enableOfflineMode).toBe(true),
            expect(offlineManager.config.maxOfflineOperations).toBe(1000) }');
        test('オンライン状態が正しく初期化される', async () => {
            // Wait for initialization
            await new Promise(resolve => setTimeout(resolve, 50),
            expect(offlineManager.state.isOnline).toBe(true),
            expect(offlineManager.state.offlineOperations).toEqual([]'),
            // Connection check runs on init, so it becomes 'good'
            expect(['unknown', 'good']).toContain(offlineManager.state.connectionQuality) }, 10000'); // Set timeout to 10 seconds
        
        test('ハートビート監視が開始される', () => {
            expect(offlineManager.heartbeatTimer).toBeTruthy() }');
    }
    describe('オンライン状態変更', (') => {
        test('オフライン移行が正しく処理される', async (') => {
            const emitSpy = jest.spyOn(offlineManager, 'emitEvent'),
            await offlineManager.handleOnlineStateChange(false),
            expect(offlineManager.state.isOnline).toBe(false),
            expect(offlineManager.state.lastOfflineTime).toBeTruthy(),
            expect(offlineManager.state.connectionQuality').toBe('offline'),
            expect(emitSpy').toHaveBeenCalledWith('offlineTransition', expect.any(Object) }');
        test('オンライン復帰が正しく処理される', async () => {
            // First set to offline state
            offlineManager.state.isOnline = false,
            offlineManager.state.lastOfflineTime = Date.now(') - 60000,
            
            const emitSpy = jest.spyOn(offlineManager, 'emitEvent'),
            mockFetch.mockResolvedValueOnce({ ok: true ,
            await offlineManager.handleOnlineStateChange(true),
            expect(offlineManager.state.isOnline).toBe(true),
            expect(offlineManager.state.lastOnlineTime).toBeTruthy(),
            expect(offlineManager.state.heartbeatFailures).toBe(0),
            expect(emitSpy').toHaveBeenCalledWith('onlineRecovery', expect.any(Object) }');
        test('状態変更イベントが発行される', async (') => {
            const emitSpy = jest.spyOn(offlineManager, 'emitEvent'),
            await offlineManager.handleOnlineStateChange(false),
            expect(emitSpy').toHaveBeenCalledWith('connectionStateChanged', {
                isOnline: false,
                previousState: true,
                timestamp: expect.any(Number});
            });
        }
    }');
    describe('オフライン操作記録', (') => {
        test('オフライン操作が正しく記録される', async (') => {
            const operation = {
                type: 'save' as const,
                key: 'testKey',
                data: { test: 'data' }
            };
            
            const operationId = await offlineManager.recordOfflineOperation(operation);
            expect(operationId).toBeTruthy();
            expect(offlineManager.state.offlineOperations).toHaveLength(1);
            const recordedOp = offlineManager.state.offlineOperations[0];
            expect(recordedOp.type').toBe('save');
            expect(recordedOp.key').toBe('testKey');
            expect(recordedOp.status').toBe('pending');
        }');
        test('操作キューが満杯時に古い操作が削除される', async () => {
            // Fill the queue
            for (let i = 0, i < 1000, i++') {
                offlineManager.state.offlineOperations.push({
                    id: `old-${i}`;
                    type: 'save',
                    key: `oldKey-${i}`;);
                    timestamp: Date.now(') - 60000,
                    retries: 0,
                    status: 'pending'
                }');
            }
            
            const operation = {
                type: 'save' as const,
                key: 'newKey',
                data: { test: 'new' }
            };
            
            await offlineManager.recordOfflineOperation(operation);
            expect(offlineManager.state.offlineOperations).toHaveLength(1000);
            // New operation is added at the end
            const lastOperation = offlineManager.state.offlineOperations[999];
            expect(lastOperation.key').toBe('newKey');
            // First old operation is removed
            expect(offlineManager.state.offlineOperations[0].key').toBe('oldKey-1');
        }');
        test('オフラインモード無効時にエラーが発生する', async (') => {
            offlineManager.config.enableOfflineMode = false,
            
            const operation = { type: 'save' as const, key: 'test', data: {} };
            
            await expect(offlineManager.recordOfflineOperation(operation)')
                .rejects.toThrow('Offline mode is disabled');
        }');
    }
    describe('オフライン操作処理', (') => {
        test('保存操作が正しく処理される', async (') => {
            const operation: OfflineOperation = {
                id: 'op1',
                type: 'save',
                key: 'testKey',
                data: { test: 'data' };
                timestamp: Date.now(',
                retries: 0,
                status: 'pending'
            };
            
            offlineManager.state.offlineOperations = [operation];
            mockSyncManager.cloudStorage.set.mockResolvedValue(true);
            await offlineManager.processOfflineOperations();
            expect(mockSyncManager.cloudStorage.set').toHaveBeenCalledWith('testKey', { test: 'data' ,
            expect(offlineManager.state.offlineOperations).toHaveLength(0) }');
        test('削除操作が正しく処理される', async (') => {
            const operation: OfflineOperation = {
                id: 'op1',
                type: 'remove',
                key: 'testKey',
                timestamp: Date.now(',
                retries: 0,
                status: 'pending'
            };
            
            offlineManager.state.offlineOperations = [operation];
            mockSyncManager.cloudStorage.remove.mockResolvedValue(true);
            await offlineManager.processOfflineOperations();
            expect(mockSyncManager.cloudStorage.remove').toHaveBeenCalledWith('testKey');
            expect(offlineManager.state.offlineOperations).toHaveLength(0);
        }');
        test('失敗した操作がリトライされる', async (') => {
            const operation: OfflineOperation = {
                id: 'op1',
                type: 'save',
                key: 'testKey',
                data: { test: 'data' };
                timestamp: Date.now(',
                retries: 0,
                status: 'pending'
            };
            
            offlineManager.state.offlineOperations = [operation];
            mockSyncManager.cloudStorage.set
                .mockRejectedValueOnce(new Error('Network error')
                .mockResolvedValueOnce(true);
            await offlineManager.processOfflineOperations();
            expect(operation.retries).toBe(1);
            expect(operation.lastError').toBe('Network error');
        }');
        test('最大リトライ回数に達した操作が削除される', async (') => {
            const operation: OfflineOperation = {
                id: 'op1',
                type: 'save',
                key: 'testKey',
                data: { test: 'data' };
                timestamp: Date.now(',
                retries: 2,
                status: 'pending'
            };
            
            offlineManager.state.offlineOperations = [operation];
            mockSyncManager.cloudStorage.set.mockRejectedValue(new Error('Persistent error');
            await offlineManager.processOfflineOperations();
            expect(offlineManager.state.offlineOperations).toHaveLength(0);
            expect(operation.status').toBe('failed');
        }');
    }
    describe('接続品質チェック', (') => {
        test('良好な接続が正しく判定される', async () => {
            (global.performance.now as jest.Mock})
                .mockReturnValueOnce(0)
                .mockReturnValueOnce(100); // 100ms
            
            mockFetch.mockResolvedValue({ ok: true });
            const quality = await offlineManager.checkConnectionQuality();
            expect(quality').toBe('good');
            expect(offlineManager.state.connectionQuality').toBe('good');
            expect(offlineManager.state.heartbeatFailures).toBe(0);
        }');
        test('低品質な接続が正しく判定される', async () => {
            (global.performance.now as jest.Mock})
                .mockReturnValueOnce(0)
                .mockReturnValueOnce(800); // 800ms
            
            mockFetch.mockResolvedValue({ ok: true });
            const quality = await offlineManager.checkConnectionQuality();
            expect(quality').toBe('poor');
            expect(offlineManager.state.connectionQuality').toBe('poor');
        }');
        test('不安定な接続が正しく判定される', async () => {
            (global.performance.now as jest.Mock})
                .mockReturnValueOnce(0)
                .mockReturnValueOnce(1500); // 1500ms
            
            mockFetch.mockResolvedValue({ ok: true });
            const quality = await offlineManager.checkConnectionQuality();
            expect(quality').toBe('unstable');
            expect(offlineManager.state.connectionQuality').toBe('unstable');
        }');
        test('接続失敗が正しく処理される', async (') => {
            mockFetch.mockRejectedValue(new Error('Network error'),
            const quality = await offlineManager.checkConnectionQuality(),
            expect(offlineManager.state.heartbeatFailures).toBe(1),
            expect(quality').toBe('unstable') }');
        test('複数回の接続失敗でオフライン状態になる', async (') => {
            offlineManager.state.heartbeatFailures = 2,
            mockFetch.mockRejectedValue(new Error('Network error'),
            const quality = await offlineManager.checkConnectionQuality(),
            expect(quality').toBe('offline'),
            expect(offlineManager.state.connectionQuality').toBe('offline') }');
        test('オフライン状態では接続チェックしない', async () => {
            // Reset fetch mock
            mockFetch.mockClear('),
            // Set navigator.onLine to offline
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: false });
            const quality = await offlineManager.checkConnectionQuality();
            expect(quality').toBe('offline');
            expect(mockFetch).not.toHaveBeenCalled();
        }');
    }
    describe('ハートビート監視', (') => {
        test('ハートビート監視が開始される', () => {
            offlineManager.startHeartbeat(),
            expect(offlineManager.heartbeatTimer).toBeTruthy() }');
        test('ハートビート監視が停止される', () => {
            offlineManager.startHeartbeat(),
            offlineManager.stopHeartbeat(),
            expect(offlineManager.heartbeatTimer).toBeNull() }');
        test('ハートビート間隔で接続チェックが実行される', async (') => {
            const checkSpy = jest.spyOn(offlineManager, 'checkConnectionQuality'}')
                .mockResolvedValue('good');
            offlineManager.startHeartbeat();
            // Advance 30 seconds
            jest.advanceTimersByTime(30000);
            // Wait for timer callback execution
            await Promise.resolve();
            expect(checkSpy).toHaveBeenCalled();
            // Cleanup
            offlineManager.stopHeartbeat();
        }, 20000); // Set timeout to 20 seconds
    }');
    describe('オフライン状態管理', (') => {
        test('オフライン状態が正しく保存される', async (') => {
            offlineManager.state.lastOnlineTime = 123456789,
            offlineManager.state.offlineOperations = [{ id: 'op1' } as OfflineOperation];
            
            await offlineManager.saveOfflineState();
            expect(mockDataStorage.save').toHaveBeenCalledWith('_offlineState', expect.objectContaining({
                lastOnlineTime: 123456789,
        offlineOperations: expect.any(Array)) })');
        }
        test('オフライン状態が正しく復元される', async (') => {
            const savedState: Partial<OfflineState> = {
                lastOnlineTime: 123456789,
                offlineOperations: [{ id: 'op1', timestamp: Date.now(') } as OfflineOperation],
                connectionQuality: 'good'
            };
            
            mockDataStorage.load.mockResolvedValue(savedState);
            await offlineManager.restoreOfflineState();
            expect(offlineManager.state.lastOnlineTime).toBe(123456789);
            expect(offlineManager.state.offlineOperations).toEqual(savedState.offlineOperations);
            expect(offlineManager.state.connectionQuality').toBe('good');
        }');
        test('古いオフライン操作が削除される', async (') => {
            const oldOperation = {
                id: 'old',
                timestamp: Date.now(') - 8 * 24 * 60 * 60 * 1000 // 8 days ago
            };
            const newOperation = {
                id: 'new',
                timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000 // 1 day ago
            };
            
            const savedState = {
                offlineOperations: [oldOperation, newOperation]
            };
            
            mockDataStorage.load.mockResolvedValue(savedState);
            await offlineManager.restoreOfflineState();
            expect(offlineManager.state.offlineOperations).toHaveLength(1);
            expect(offlineManager.state.offlineOperations[0].id').toBe('new');
        }');
    }
    describe('設定管理', (') => {
        test('設定が正しく更新される', () => {
            const newConfig = {
                maxOfflineOperations: 500,
                heartbeatInterval: 60000
            };
            
            offlineManager.updateConfig(newConfig);
            expect(offlineManager.config.maxOfflineOperations).toBe(500);
            expect(offlineManager.config.heartbeatInterval).toBe(60000);
        }');
        test('ハートビート間隔変更時に再起動される', (') => {
            const startSpy = jest.spyOn(offlineManager, 'startHeartbeat'),
            offlineManager.updateConfig({ heartbeatInterval: 15000 });
            expect(startSpy).toHaveBeenCalled();
        }');
    }
    describe('状態取得', (') => {
        test('オフライン状態が正しく返される', (') => {
            offlineManager.state.isOnline = false,
            offlineManager.state.connectionQuality = 'poor',
            offlineManager.state.offlineOperations = [{ id: 'op1' }, { id: 'op2' }] as OfflineOperation[];
            offlineManager.state.lastOfflineTime = Date.now() - 60000;
            
            const status = offlineManager.getOfflineStatus() as OfflineStatus;
            
            expect(status.isOnline).toBe(false);
            expect(status.connectionQuality').toBe('poor');
            expect(status.offlineOperations).toBe(2);
            expect(status.offlineDuration!).toBeGreaterThan(50000);
        }');
    }
    describe('オフライン操作クリア', (') => {
        test('オフライン操作がクリアされる', (') => {
            offlineManager.state.offlineOperations = [{ id: 'op1' }, { id: 'op2' }] as OfflineOperation[];
            
            offlineManager.clearOfflineOperations();
            expect(offlineManager.state.offlineOperations).toEqual([]);
            expect(mockDataStorage.save).toHaveBeenCalled();
        }');
    }
    describe('イベント管理', (') => {
        test('イベントリスナーが正しく追加される', () => {
            const listener = jest.fn('),
            offlineManager.on('connectionStateChanged', listener'),
            expect(offlineManager.eventListeners.get('connectionStateChanged').toContain(listener) }');
        test('イベントが正しく発行される', () => {
            const listener = jest.fn('),
            const testData = { test: 'data' };
            
            offlineManager.on('testEvent', listener');
            offlineManager.emitEvent('testEvent', testData);
            expect(listener).toHaveBeenCalledWith(testData);
        }');
    }
    describe('リソース管理', (') => {
        test('destroy(')でリソースが適切に解放される', () => {
            offlineManager.startHeartbeat(),
            offlineManager.destroy(),
            expect(offlineManager.heartbeatTimer).toBeNull(),
            expect(offlineManager.eventListeners.size).toBe(0) });
    }
}');