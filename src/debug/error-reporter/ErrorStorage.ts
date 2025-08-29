/**
 * Error Storage
 * エラーの永続化ストレージクラス
 */

interface StoredError {
    id: string;
    timestamp: number;
    severity: string;
    category: string;
    message: string;
    stack?: string;
    context?: any;
    sessionId: string;
}

interface StorageConfig {
    maxItems: number;
    storageKey: string;
    useIndexedDB: boolean;
    compressionEnabled: boolean;
}

interface StorageStatistics {
    totalStored: number;
    totalSize: number;
    oldestTimestamp?: number;
    newestTimestamp?: number;
    errorsByCategory: { [category: string]: number };
}

export class ErrorStorage {
    private config: StorageConfig;
    private cache: StoredError[] = [];
    private initialized = false;

    constructor(config: Partial<StorageConfig> = {}) {
        this.config = {
            maxItems: 1000,
            storageKey: 'debug-errors',
            useIndexedDB: true,
            compressionEnabled: false,
            ...config
        };
    }

    /**
     * 初期化
     */
    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            if (this.config.useIndexedDB && this.isIndexedDBAvailable()) {
                await this.initializeIndexedDB();
            } else {
                this.initializeLocalStorage();
            }
            this.initialized = true;
            console.log('ErrorStorage initialized');
        } catch (error) {
            console.error('Failed to initialize ErrorStorage:', error);
            // フォールバックとしてメモリキャッシュのみ使用
            this.initialized = true;
        }
    }

    /**
     * エラーを保存
     */
    async storeError(error: Omit<StoredError, 'id' | 'timestamp'>): Promise<string> {
        const storedError: StoredError = {
            id: this.generateId(),
            timestamp: Date.now(),
            ...error
        };

        this.cache.push(storedError);

        // キャッシュサイズ制限
        if (this.cache.length > this.config.maxItems) {
            this.cache.shift();
        }

        try {
            if (this.config.useIndexedDB && this.isIndexedDBAvailable()) {
                await this.saveToIndexedDB(storedError);
            } else {
                this.saveToLocalStorage();
            }
        } catch (error) {
            console.warn('Failed to persist error to storage:', error);
        }

        return storedError.id;
    }

    /**
     * エラーを取得
     */
    async getErrors(options: {
        category?: string;
        severity?: string;
        limit?: number;
        offset?: number;
        startTime?: number;
        endTime?: number;
    } = {}): Promise<StoredError[]> {
        await this.loadFromStorage();

        let results = [...this.cache];

        // フィルタリング
        if (options.category) {
            results = results.filter(error => error.category === options.category);
        }

        if (options.severity) {
            results = results.filter(error => error.severity === options.severity);
        }

        if (options.startTime) {
            results = results.filter(error => error.timestamp >= options.startTime!);
        }

        if (options.endTime) {
            results = results.filter(error => error.timestamp <= options.endTime!);
        }

        // ソート（新しい順）
        results.sort((a, b) => b.timestamp - a.timestamp);

        // ページネーション
        const offset = options.offset || 0;
        const limit = options.limit || results.length;
        
        return results.slice(offset, offset + limit);
    }

    /**
     * エラーを削除
     */
    async deleteError(id: string): Promise<boolean> {
        const index = this.cache.findIndex(error => error.id === id);
        if (index === -1) return false;

        this.cache.splice(index, 1);

        try {
            if (this.config.useIndexedDB && this.isIndexedDBAvailable()) {
                await this.deleteFromIndexedDB(id);
            } else {
                this.saveToLocalStorage();
            }
            return true;
        } catch (error) {
            console.warn('Failed to delete error from storage:', error);
            return false;
        }
    }

    /**
     * 全エラーを削除
     */
    async clearAll(): Promise<void> {
        this.cache = [];

        try {
            if (this.config.useIndexedDB && this.isIndexedDBAvailable()) {
                await this.clearIndexedDB();
            } else {
                localStorage.removeItem(this.config.storageKey);
            }
        } catch (error) {
            console.warn('Failed to clear error storage:', error);
        }
    }

    /**
     * 統計情報を取得
     */
    getStatistics(): StorageStatistics {
        const stats: StorageStatistics = {
            totalStored: this.cache.length,
            totalSize: this.calculateCacheSize(),
            errorsByCategory: {}
        };

        if (this.cache.length > 0) {
            const timestamps = this.cache.map(error => error.timestamp);
            stats.oldestTimestamp = Math.min(...timestamps);
            stats.newestTimestamp = Math.max(...timestamps);

            // カテゴリ別統計
            for (const error of this.cache) {
                stats.errorsByCategory[error.category] = (stats.errorsByCategory[error.category] || 0) + 1;
            }
        }

        return stats;
    }

    /**
     * IndexedDB初期化
     */
    private async initializeIndexedDB(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('ErrorStorage', 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                
                if (!db.objectStoreNames.contains('errors')) {
                    const store = db.createObjectStore('errors', { keyPath: 'id' });
                    store.createIndex('timestamp', 'timestamp');
                    store.createIndex('category', 'category');
                    store.createIndex('severity', 'severity');
                }
            };
        });
    }

    /**
     * LocalStorage初期化
     */
    private initializeLocalStorage(): void {
        try {
            const stored = localStorage.getItem(this.config.storageKey);
            if (stored) {
                this.cache = JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            this.cache = [];
        }
    }

    /**
     * IndexedDBへの保存
     */
    private async saveToIndexedDB(error: StoredError): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('ErrorStorage', 1);

            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['errors'], 'readwrite');
                const store = transaction.objectStore('errors');

                const addRequest = store.add(error);
                addRequest.onsuccess = () => resolve();
                addRequest.onerror = () => reject(addRequest.error);

                transaction.oncomplete = () => db.close();
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * LocalStorageへの保存
     */
    private saveToLocalStorage(): void {
        try {
            const data = JSON.stringify(this.cache);
            localStorage.setItem(this.config.storageKey, data);
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }

    /**
     * ストレージからの読み込み
     */
    private async loadFromStorage(): Promise<void> {
        if (this.cache.length > 0) return; // Already loaded

        try {
            if (this.config.useIndexedDB && this.isIndexedDBAvailable()) {
                await this.loadFromIndexedDB();
            } else {
                this.initializeLocalStorage();
            }
        } catch (error) {
            console.warn('Failed to load from storage:', error);
        }
    }

    /**
     * IndexedDBからの読み込み
     */
    private async loadFromIndexedDB(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('ErrorStorage', 1);

            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['errors'], 'readonly');
                const store = transaction.objectStore('errors');
                const getAllRequest = store.getAll();

                getAllRequest.onsuccess = () => {
                    this.cache = getAllRequest.result || [];
                    resolve();
                };

                getAllRequest.onerror = () => reject(getAllRequest.error);
                transaction.oncomplete = () => db.close();
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * IndexedDBから削除
     */
    private async deleteFromIndexedDB(id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('ErrorStorage', 1);

            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['errors'], 'readwrite');
                const store = transaction.objectStore('errors');

                const deleteRequest = store.delete(id);
                deleteRequest.onsuccess = () => resolve();
                deleteRequest.onerror = () => reject(deleteRequest.error);

                transaction.oncomplete = () => db.close();
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * IndexedDBクリア
     */
    private async clearIndexedDB(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('ErrorStorage', 1);

            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['errors'], 'readwrite');
                const store = transaction.objectStore('errors');

                const clearRequest = store.clear();
                clearRequest.onsuccess = () => resolve();
                clearRequest.onerror = () => reject(clearRequest.error);

                transaction.oncomplete = () => db.close();
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * IndexedDB利用可能チェック
     */
    private isIndexedDBAvailable(): boolean {
        return typeof indexedDB !== 'undefined';
    }

    /**
     * ID生成
     */
    private generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * キャッシュサイズ計算
     */
    private calculateCacheSize(): number {
        try {
            return JSON.stringify(this.cache).length;
        } catch (error) {
            return 0;
        }
    }

    /**
     * クリーンアップ
     */
    destroy(): void {
        this.cache = [];
        this.initialized = false;
        console.log('ErrorStorage destroyed');
    }
}

export default ErrorStorage;