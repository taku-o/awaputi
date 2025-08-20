import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * IndexedDBStorageManager のテスト
 */

import { IndexedDBStorageManager } from '../../src/analytics/IndexedDBStorageManager';

// IndexedDBのモック
class MockIDBDatabase {
    constructor() {
        this.objectStoreNames = [];
        this.version = 1;
        this.stores = new Map();
    }
    
    createObjectStore(name, options) {
        this.objectStoreNames.push(name);
        const store = new MockIDBObjectStore(name, options);
        this.stores.set(name, store);
        return store;
    }
    
    transaction(storeNames, mode) {
        return new MockIDBTransaction(this.stores, storeNames, mode);
    }
    
    close() {}
}

class MockIDBObjectStore {
    constructor(name, options) {
        this.name = name;
        this.keyPath = options.keyPath;
        this.autoIncrement = options.autoIncrement || false;
        this.indexNames = [];
        this.data = new Map();
        this.indexes = new Map();
    }
    
    createIndex(name, keyPath, options) {
        this.indexNames.push(name);
        this.indexes.set(name, new MockIDBIndex(name, keyPath, options));
        return this.indexes.get(name);
    }
    
    put(data {
        const key = typeof this.keyPath === 'string' ? data[this.keyPath] : 
                   Array.isArray(this.keyPath) ? this.keyPath.map(k => data[k]).join('|') :
                   this.autoIncrement ? Date.now() : data.id;
        this.data.set(key, data);
        return { onsuccess: null, onerror: null };
    }
    
    get(key {
        const request = { onsuccess: null, onerror: null };
        setTimeout(() => {
            request.result = this.data.get(key);
            if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
    }
    
    getAll() {
        const request = { onsuccess: null, onerror: null };
        setTimeout(() => {
            request.result = Array.from(this.data.values());
            if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
    }
    
    delete(key {
        this.data.delete(key);
        return { onsuccess: null, onerror: null };
    }
    
    openCursor(range {
        const request = { onsuccess: null, onerror: null };
        setTimeout(() => {
            const values = Array.from(this.data.values());
            let index = 0;
            
            const cursor = {
                value: values[index],
                continue() {
                    index++;
                    setTimeout(() => {
                        if (index < values.length) {
                            cursor.value = values[index];
                            if (request.onsuccess) request.onsuccess({ target: { result: cursor } });
                        } else {
                            if (request.onsuccess) request.onsuccess({ target: { result: null } });
                        }
                    }, 0);
                },
                delete() {
                    // 削除処理のモック
                }
            };
            
            if (values.length > 0) {
                if (request.onsuccess) request.onsuccess({ target: { result: cursor } });
            } else {
                if (request.onsuccess) request.onsuccess({ target: { result: null } });
            }
        }, 0);
        return request;
    }
    
    index(name {
        return this.indexes.get(name || new MockIDBIndex(name, name, {}));
    }
}

class MockIDBIndex {
    constructor(name, keyPath, options) {
        this.name = name;
        this.keyPath = keyPath;
        this.unique = options.unique || false;
    }
    
    openCursor(range {
        // 簡易実装
        const request = { onsuccess: null, onerror: null };
        setTimeout(() => {
            if (request.onsuccess) request.onsuccess({ target: { result: null } });
        }, 0);
        return request;
    }
}

class MockIDBTransaction {
    constructor(stores, storeNames, mode) {
        this.stores = stores;
        this.storeNames = Array.isArray(storeNames ? storeNames : [storeNames]);
        this.mode = mode;
        this.oncomplete = null;
        this.onerror = null;
        this.onabort = null;
        
        // トランザクション完了を模擬
        setTimeout(() => {
            if (this.oncomplete) this.oncomplete();
        }, 0);
    }
    
    objectStore(name {
        return this.stores.get(name);
    }
}

// IndexedDBのグローバルモック
(global as any).indexedDB = {
    open: jest.fn((name, version) => {
        const request = {
            onsuccess: null,
            onerror: null,
            onupgradeneeded: null,
            result: null
        };
        
        setTimeout(() => {
            const db = new MockIDBDatabase();
            db.version = version;
            
            // onupgradeneededを呼び出す
            if (request.onupgradeneeded) {
                const event = {
                    target: { result: db, transaction: new MockIDBTransaction(new Map(), [], 'versionchange') }
                };
                request.onupgradeneeded(event);
            }
            
            request.result = db;
            if (request.onsuccess) request.onsuccess();
        }, 0);
        
        return request;
    })
};

(global as any).IDBKeyRange = {
    only: jest.fn(value => ({ type: 'only', value })),
    bound: jest.fn((lower, upper, lowerExclusive, upperExclusive) => ({
        type: 'bound',
        lower,
        upper,
        lowerExclusive,
        upperExclusive
    })),
    lowerBound: jest.fn((value, exclusive) => ({
        type: 'lowerBound',
        lower: value,
        lowerExclusive: exclusive
    })),
    upperBound: jest.fn((value, exclusive) => ({
        type: 'upperBound',
        upper: value,
        upperExclusive: exclusive
    }))
};

describe('IndexedDBStorageManager', () => {
    jest.setTimeout(30000); // 30秒のタイムアウト設定
    let manager: any;
    
    beforeEach(() => {
        manager = new IndexedDBStorageManager();
        
        // Navigator.storage のモック設定
        Object.defineProperty(global.navigator, 'storage', {
            value: {
                estimate: jest.fn().mockResolvedValue({
                    usage: 1024 * 1024, // 1MB
                    quota: 100 * 1024 * 1024 // 100MB
                })
            },
            configurable: true
        });
        // モックをリセット
        global.indexedDB.open.mockClear();
    });
    
    afterEach(() => {
        if (manager.db) {
            manager.close();
        }
    });
    
    describe('初期化', () => {
        test('データベースが正常に初期化される', async () => {
            const db = await manager.initialize();
            
            expect(db).toBeDefined();
            expect(global.indexedDB.open).toHaveBeenCalledWith('BubblePopAnalytics', 1);
        });
        
        test('IndexedDBがサポートされていない場合エラーが発生', async () => {
            // IndexedDBを無効にする
            const originalIndexedDB = global.indexedDB;
            delete global.indexedDB;
            
            await expect(manager.initialize()).rejects.toThrow('IndexedDB is not supported');
            
            // 復元
            (global as any).indexedDB = originalIndexedDB;
        });
    });
    
    describe('データ保存', () => {
        beforeEach(async () => {
            await manager.initialize();
        });
        
        test('単一データが正常に保存される', async () => {
            const sessionData = {
                sessionId: 'test-session-1',
                startTime: Date.now(),
                stageId: 'normal',
                finalScore: 1000,
                completed: true
            };
            
            await expect(manager.saveData('sessions', sessionData)).resolves.not.toThrow();
        });
        
        test('配列データが正常に保存される', async () => {
            const bubbleData = [
                {
                    sessionId: 'test-session-1',
                    timestamp: Date.now(),
                    bubbleType: 'normal',
                    action: 'popped',
                    reactionTime: 500
                },
                {
                    sessionId: 'test-session-1',
                    timestamp: Date.now() + 1000,
                    bubbleType: 'stone',
                    action: 'missed',
                    reactionTime: 0
                }
            ];
            
            await expect(manager.saveData('bubbleInteractions', bubbleData)).resolves.not.toThrow();
        });
        
        test('データベースが初期化されていない場合エラーが発生', async () => {
            manager.db = null;
            
            await expect(manager.saveData('sessions', {})).rejects.toThrow('Database not initialized');
        });
    });
    
    describe('データ取得', () => {
        beforeEach(async () => {
            await manager.initialize();
            
            // テストデータを設定
            const store = manager.db.stores.get('sessions');
            store.data.set('test-session-1', {
                sessionId: 'test-session-1',
                startTime: Date.now() - 1000,
                stageId: 'normal',
                completed: true
            });
            store.data.set('test-session-2', {
                sessionId: 'test-session-2',
                startTime: Date.now(),
                stageId: 'hard',
                completed: false
            });
        });
        
        test('キー指定でデータが取得される', async () => {
            const result = await manager.getData('sessions', { key: 'test-session-1' });
            expect(result).toHaveLength(1);
            expect(result[0].sessionId).toBe('test-session-1');
        });
        
        test('全件取得が正常に動作する', async () => {
            const result = await manager.getData('sessions');
            expect(result).toHaveLength(2);
        });
        
        test('存在しないキーの場合空配列が返される', async () => {
            const result = await manager.getData('sessions', { key: 'non-existent' });
            expect(result).toEqual([]);
        });
    });
    
    describe('KeyRange作成', () => {
        test('bound範囲が正常に作成される', () => {
            const range = manager.createKeyRange({
                lower: 100,
                upper: 200
            });
            
            expect(global.IDBKeyRange.bound).toHaveBeenCalledWith(100, 200, false, false);
        });
        
        test('lowerBound範囲が正常に作成される', () => {
            const range = manager.createKeyRange({
                lower: 100,
                lowerExclusive: true
            });
            
            expect(global.IDBKeyRange.lowerBound).toHaveBeenCalledWith(100, true);
        });
        
        test('upperBound範囲が正常に作成される', () => {
            const range = manager.createKeyRange({
                upper: 200,
                upperExclusive: false
            });
            
            expect(global.IDBKeyRange.upperBound).toHaveBeenCalledWith(200, false);
        });
        
        test('無効な範囲の場合nullが返される', () => {
            const range = manager.createKeyRange({});
            expect(range).toBeNull();
        });
    });
    
    describe('データ集計', () => {
        beforeEach(async () => {
            await manager.initialize();
            
            // テストデータを設定
            const store = manager.db.stores.get('bubbleInteractions');
            store.data.set('1', {
                sessionId: 'test-session-1',
                bubbleType: 'normal',
                scoreGained: 10
            });
            store.data.set('2', {
                sessionId: 'test-session-1',
                bubbleType: 'stone',
                scoreGained: 20
            });
            store.data.set('3', {
                sessionId: 'test-session-1',
                bubbleType: 'normal',
                scoreGained: 15
            });
        });
        
        test('合計値の集計が正常に動作する', async () => {
            const result = await manager.aggregateData('bubbleInteractions', {
                fields: {
                    scoreGained: { type: 'sum' }
                }
            });
            
            expect(result.count).toBe(3);
            expect(result.scoreGained).toBe(45);
        });
        
        test('平均値の集計が正常に動作する', async () => {
            const result = await manager.aggregateData('bubbleInteractions', {
                fields: {
                    scoreGained: { type: 'avg' }
                }
            });
            
            expect(result.scoreGained).toBe(15);
        });
        
        test('グループ化集計が正常に動作する', async () => {
            const result = await manager.aggregateData('bubbleInteractions', {
                fields: {
                    bubbleType: { type: 'group' }
                }
            });
            
            expect(result.bubbleType.normal).toBe(2);
            expect(result.bubbleType.stone).toBe(1);
        });
    });
    
    describe('ネストされた値の取得', () => {
        test('単一レベルの値が取得される', () => {
            const obj = { name: 'test' };
            const result = manager.getNestedValue(obj, 'name');
            expect(result).toBe('test');
        });
        
        test('ネストされた値が取得される', () => {
            const obj = { user: { profile: { name: 'test' } } };
            const result = manager.getNestedValue(obj, 'user.profile.name');
            expect(result).toBe('test');
        });
        
        test('存在しないパスの場合undefinedが返される', () => {
            const obj = { name: 'test' };
            const result = manager.getNestedValue(obj, 'user.name');
            expect(result).toBeUndefined();
        });
    });
    
    describe('データクリーンアップ', () => {
        beforeEach(async () => {
            await manager.initialize();
            
            // 古いデータを設定
            const oldTime = Date.now() - (10 * 24 * 60 * 60 * 1000); // 10日前
            const sessionsStore = manager.db.stores.get('sessions');
            sessionsStore.data.set('old-session', {
                sessionId: 'old-session',
                startTime: oldTime
            });
        });
        
        test('古いデータが正常に削除される', async () => {
            const result = await manager.cleanupOldData(7); // 7日以上古いデータを削除
            
            expect(result.sessions.count).toBe(1);
            expect(result.sessions.sessionIds).toContain('old-session');
        });
    });
    
    describe('データベースサイズ取得', () => {
        test('StorageManagerが利用可能な場合サイズ情報が取得される', async () => {
            // StorageManagerのモック
            (global as any).navigator = {
                storage: {
                    estimate: jest.fn().mockResolvedValue({
                        usage: 1024 * 1024, // 1MB
                        quota: 100 * 1024 * 1024 // 100MB
                    })
                }
            };
            
            const result = await manager.getDatabaseSize();
            
            expect(result.supported).toBe(true);
            expect(result.usageInMB).toBe('1.00');
            expect(result.quotaInMB).toBe('100.00');
            expect(result.percentUsed).toBe('1.00');
        });
        
        test('StorageManagerが利用できない場合適切なレスポンスが返される', async () => {
            // navigator.storageを一時的に無効化
            const originalNavigator = global.navigator;
            Object.defineProperty(global, 'navigator', {
                value: {},
                configurable: true
            });
            
            const result = await manager.getDatabaseSize();
            
            expect(result.supported).toBe(false);
            
            // navigatorを復元
            Object.defineProperty(global, 'navigator', {
                value: originalNavigator,
                configurable: true
            });
        });
    });
    
    describe('データベースのクローズ', () => {
        test('データベースが正常にクローズされる', async () => {
            await manager.initialize();
            expect(manager.db).not.toBeNull();
            
            manager.close();
            expect(manager.db).toBeNull();
        });
    });
});