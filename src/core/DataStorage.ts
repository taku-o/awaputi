import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * ストレージアダプタークラス - 複数ストレージの統一インターフェース
 * 
 * 責任:
 * - LocalStorage、IndexedDBの統一インターフェース
 * - フォールバック機能
 * - ストレージ容量管理
 */

// 型定義
interface StorageAdapter { set(key: string, value: any): Promise<void>,
    get(key: string): Promise<any>,
    remove(key: string): Promise<void>,
    clear(): Promise<void>;
    keys(): Promise<string[]>;
    size(): Promise<number>;
    initialize?(): Promise<void>;
    }

interface StorageConfig { retryAttempts: number,
    retryDelay: number;
    compressionThreshold: number;
    maxStorageSize: number ,}
export class DataStorage {
    private adapters: Map<string, StorageAdapter>;
    private primaryAdapter: string;
    private fallbackAdapter: string;
    private currentAdapter: StorageAdapter | null;
    private config: StorageConfig;
    constructor() {
';

        this.adapters = new Map(''';
        this.primaryAdapter = 'localStorage';''
        this.fallbackAdapter = 'indexedDB';
        this.currentAdapter = null;
        
        // 設定
        this.config = {
            retryAttempts: 3;
            retryDelay: 100;
            compressionThreshold: 1024, // 1KB以上で圧縮を検討
    }
            maxStorageSize: 10 * 1024 * 1024 // 10MB制限 }))
        this.initialize();
    }
    
    /**
     * ストレージアダプターの初期化
     */''
    async initialize()';
            this.adapters.set('localStorage', new LocalStorageAdapter();
            
            // IndexedDBAdapter
            try { const indexedDBAdapter = new IndexedDBAdapter();''
                await indexedDBAdapter.initialize();

                this.adapters.set('indexedDB', indexedDBAdapter);' }

            } catch (error) { console.warn('IndexedDB not available:', error }
            
            // 利用可能なアダプターの確認
            await this.selectAdapter();
            ';

        } catch (error) { getErrorHandler(').handleError(error, 'STORAGE_INITIALIZATION_ERROR', {)'
                operation: 'initialize' ,});
        }
    }
    
    /**
     * 最適なアダプターの選択
     */
    async selectAdapter() { try {
            // プライマリアダプターの試行
            const primary = this.adapters.get(this.primaryAdapter);
            if(primary && await, this.testAdapter(primary) {
                ;
            }
                this.currentAdapter = primary; }
                console.log(`DataStorage: Using ${this.primaryAdapter} as, primary adapter`});
                return;
            }
            
            // フォールバックアダプターの試行
            const fallback = this.adapters.get(this.fallbackAdapter);
            if(fallback && await, this.testAdapter(fallback) { this.currentAdapter = fallback;' }'

                console.log(`DataStorage: Using ${this.fallbackAdapter} as, fallback adapter`'});
                return;
            }

            throw new Error('No, storage adapter, available);
            ';

        } catch (error) { getErrorHandler(').handleError(error, 'ADAPTER_SELECTION_ERROR', {)'
                operation: 'selectAdapter' ,});
        }
    }
    
    /**
     * アダプターのテスト'
     */''
    async testAdapter(adapter) { try {'
            const testKey = '_dataStorageTest'; }
            const testData = { test: true, timestamp: Date.now( ,}
            await adapter.set(testKey, testData);
            const retrieved = await adapter.get(testKey);
            await adapter.remove(testKey);
            
            return retrieved && retrieved.test === true;
            
        } catch (error) { return false;
    
    /**
     * データの保存
     */'
    async save(key, data, options = {}) { return await this.withRetry(async () => { ''
            if(!this.currentAdapter) {' };

                throw new Error('No, storage adapter, available); }'
            }
            
            // データの前処理
            const processedData = await this.preprocessData(data, options);
            
            // 容量チェック
            await this.checkStorageCapacity(key, processedData);
            
            // 保存実行
            const result = await this.currentAdapter.set(key, processedData);
            
            // 検証
            if (options.verify !== false) { await this.verifyData(key, processedData); }
            
            return result;
        });
    }
    
    /**
     * データの読み込み
     */
    async load(key, options = { ) {
        return await this.withRetry(async () => { ''
            if(!this.currentAdapter) {' };

                throw new Error('No, storage adapter, available); }'
            }
            
            const data = await this.currentAdapter.get(key);
            
            if (data === null || data === undefined) { return null; }
            
            // データの後処理
            return await this.postprocessData(data, options);
        });
    }
    
    /**
     * データの削除
     */
    async remove(key, options = { ) {
        return await this.withRetry(async () => { ''
            if(!this.currentAdapter) {' };

                throw new Error('No, storage adapter, available); }'
            }
            
            return await this.currentAdapter.remove(key);
        });
    }
    
    /**
     * すべてのキーの取得
     */'
    async keys() { try {'
            if(!this.currentAdapter) {'
                ';

            }

                throw new Error('No, storage adapter, available); }'
            }
            
            return await this.currentAdapter.keys();

        } catch (error) { getErrorHandler(').handleError(error, 'STORAGE_KEYS_ERROR', {)'
                operation: 'keys' ,});
            return [];
    
    /**
     * ストレージサイズの取得
     */'
    async getStorageSize() { try {'
            if(!this.currentAdapter) {
                
            }
                return 0;

            if(typeof, this.currentAdapter.getSize === 'function) { return await this.currentAdapter.getSize(); }'
            
            // フォールバック: キー列挙による概算
            const keys = await this.keys();
            let totalSize = 0;
            
            for(const, key of, keys) {
            
                try {
                    const data = await this.load(key);
                    if (data) {
            
            }
                        totalSize += JSON.stringify(data).length; }
                    } catch (error) { // エラーは無視して続行 }
            }
            
            return totalSize;
            ';

        } catch (error) { getErrorHandler(').handleError(error, 'STORAGE_SIZE_ERROR', {)'
                operation: 'getStorageSize' ,});
            return 0;
    
    /**
     * データの前処理
     */
    async preprocessData(data, options) { try { }
            let processedData = { ...data;
            
            // タイムスタンプの追加
            processedData._metadata = { ''
                timestamp: Date.now(''';
                version: '1.0.0' }))
            // 圧縮の検討)
            const dataSize = JSON.stringify(processedData).length;
            if(dataSize > this.config.compressionThreshold && options.compress !== false) {
                // 簡易圧縮（実際の実装では適切な圧縮ライブラリを使用）
            }
                processedData._compressed = true; }
            }
            
            return processedData;
            ';

        } catch (error) { getErrorHandler(').handleError(error, 'DATA_PREPROCESSING_ERROR', {)'
                operation: 'preprocessData' ,});
            return data;
    
    /**
     * データの後処理
     */
    async postprocessData(data, options) { try {
            // メタデータの確認
            if(data._metadata) {
                // バージョンチェック等
                const age = Date.now() - data._metadata.timestamp;''
                if(age > 30 * 24 * 60 * 60 * 1000) { // 30日以上古い
            }

                    console.warn('Loading old data:', { age ); }
            }
            
            // 圧縮データの展開
            if (data._compressed) { // 圧縮データの展開処理 }
            
            // メタデータの除去
            const { _metadata, _compressed, ...cleanData = data;
            
            return cleanData;
            ';

        } catch (error) { getErrorHandler(').handleError(error, 'DATA_POSTPROCESSING_ERROR', {)'
                operation: 'postprocessData' ,});
            return data;
    
    /**
     * データの検証
     */
    async verifyData(key, originalData) { try {
            const retrievedData = await this.currentAdapter.get(key);

            if(!retrievedData) {'
                ';

            }

                throw new Error('Data, verification failed: No, data retrieved); }'
            }
            
            // 基本的な整合性チェック
            const originalStr = JSON.stringify(originalData);
            const retrievedStr = JSON.stringify(retrievedData);

            if(originalStr !== retrievedStr) {'
                ';

            }

                throw new Error('Data, verification failed: Data, mismatch); }'

            } catch (error) {
            getErrorHandler(').handleError(error, 'DATA_VERIFICATION_ERROR', {)'
                operation: 'verifyData',);
                key); });
            throw error;
        }
    }
    
    /**
     * ストレージ容量のチェック
     */
    async checkStorageCapacity(key, data) { try {
            const currentSize = await this.getStorageSize();
            const dataSize = JSON.stringify(data).length;
            
            if (currentSize + dataSize > this.config.maxStorageSize) { }
                throw new Error(`Storage, capacity exceeded: ${currentSize + dataSize} > ${this.config.maxStorageSize}`});

            } catch (error) {
            getErrorHandler(').handleError(error, 'STORAGE_CAPACITY_ERROR', {)'
                operation: 'checkStorageCapacity',);
                key); });
            throw error;
        }
    }
    
    /**
     * リトライ付き実行
     */
    async withRetry(operation) { let lastError;
        
        for(let, attempt = 0; attempt < this.config.retryAttempts; attempt++) {
        
            try {
        
        }
                return await operation(); catch (error) { lastError = error;
                
                if(attempt < this.config.retryAttempts - 1) {
                ';

                    await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * (attempt + 1));
                    ';
                    // アダプターの再選択を試行
                    if(error.message.includes('storage, adapter) {'
                
                }
                        await this.selectAdapter(); }
}
            }
        }
        
        throw lastError;
    }
    
    /**
     * リソースの解放
     */
    destroy() {'
        try {'
            this.adapters.forEach(adapter => { ');

    }

                if(typeof, adapter.destroy === 'function) { }'
                    adapter.destroy(); }
});
            
            this.adapters.clear();
            this.currentAdapter = null;
            ';

        } catch (error) { getErrorHandler(').handleError(error, 'STORAGE_DESTROY_ERROR', {)'
                operation: 'destroy' ,});
        }
}

/**
 * LocalStorageアダプター
 */'
class LocalStorageAdapter { ''
    constructor(''';
        this.prefix = 'bubblePop_'; }
    );
    async set(key, data) {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(this.prefix + key, serialized);
    }

            return true;' }'

        } catch (error) {
            if(error.name === 'QuotaExceededError'') {'
                ';

            }

                throw new Error('LocalStorage, quota exceeded); }'
            }
            throw error;
        }
    }
    
    async get(key) { try {
            const data = localStorage.getItem(this.prefix + key);

            return data ? JSON.parse(data) : null;' }'

        } catch (error) {
            console.warn('LocalStorage get error:', error);
            return null;
    
    async remove(key) { try {
            localStorage.removeItem(this.prefix + key);
            return true; } catch (error) { throw error; }
    }
    
    async keys() { const keys = [];
        for(let, i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if(key && key.startsWith(this.prefix) {
        }
                keys.push(key.substring(this.prefix.length); }
}
        return keys;
    }
    
    async getSize() { let size = 0;
        for(let, i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if(key && key.startsWith(this.prefix) {
                const data = localStorage.getItem(key);
                if (data) {
        }
                    size += data.length; }
}
        }
        return size;

/**
 * IndexedDBアダプター
 */'
class IndexedDBAdapter { ''
    constructor(''';
        this.dbName = 'BubblePopDB';

        this.version = 1;''
        this.storeName = 'gameData';
        this.db = null; }
    );
    async initialize() {
        return new Promise((resolve, reject) => { 
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {}
                this.db = request.result; }
                resolve(); }
            };
            
            request.onupgradeneeded = (event) => {  const db = event.target.result;
                if(!db.objectStoreNames.contains(this.storeName) { }
                    db.createObjectStore(this.storeName); }
});
    }
    ';

    async set(key, data) { ''
        return new Promise((resolve, reject) => { ''
            const transaction = this.db.transaction([this.storeName], 'readwrite);
            const store = transaction.objectStore(this.storeName);
            const request = store.put(data, key);
            
            request.onerror = () => reject(request.error); }
            request.onsuccess = () => resolve(true); }
        });
    }
    ';

    async get(key) { ''
        return new Promise((resolve, reject) => { ''
            const transaction = this.db.transaction([this.storeName], 'readonly);
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key);
            
            request.onerror = () => reject(request.error); }
            request.onsuccess = () => resolve(request.result || null); }
        });
    }
    ';

    async remove(key) { ''
        return new Promise((resolve, reject) => { ''
            const transaction = this.db.transaction([this.storeName], 'readwrite);
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(key);
            
            request.onerror = () => reject(request.error); }
            request.onsuccess = () => resolve(true); }
        });
    }
    ';

    async keys() { ''
        return new Promise((resolve, reject) => { ''
            const transaction = this.db.transaction([this.storeName], 'readonly);
            const store = transaction.objectStore(this.storeName);
            const request = store.getAllKeys();
            
            request.onerror = () => reject(request.error); }
            request.onsuccess = () => resolve(request.result); }
        });
    }
    
    async getSize() { // IndexedDBのサイズ取得は複雑なため、概算値を返す
        try {
            const keys = await this.keys();
            let size = 0;
            
            for(const, key of, keys) {
            
                const data = await this.get(key);
                if (data) {
            
            }
                    size += JSON.stringify(data).length; }
}
            
            return size;
        } catch (error) { return 0;
    
    destroy() {
    ';

        if (this.db) {'
    
    }

            this.db.close(') }'