/**
 * IndexedDB Storage Manager
 * ゲーム分析データの効率的な保存・取得を管理
 */
export class IndexedDBStorageManager {
    constructor() {
        this.dbName = 'BubblePopAnalytics';
        this.version = 1;
        this.db = null;
        
        // ストア定義
        this.stores = {
            sessions: {
                name: 'sessions',
                keyPath: 'sessionId',
                indexes: [
                    { name: 'startTime', keyPath: 'startTime', unique: false },
                    { name: 'stageId', keyPath: 'stageId', unique: false },
                    { name: 'completed', keyPath: 'completed', unique: false }
                ]
            },
            bubbleInteractions: {
                name: 'bubbleInteractions',
                keyPath: 'id',
                autoIncrement: true,
                indexes: [
                    { name: 'sessionId', keyPath: 'sessionId', unique: false },
                    { name: 'timestamp', keyPath: 'timestamp', unique: false },
                    { name: 'bubbleType', keyPath: 'bubbleType', unique: false },
                    { name: 'action', keyPath: 'action', unique: false }
                ]
            },
            performance: {
                name: 'performance',
                keyPath: 'id',
                autoIncrement: true,
                indexes: [
                    { name: 'sessionId', keyPath: 'sessionId', unique: false },
                    { name: 'timestamp', keyPath: 'timestamp', unique: false },
                    { name: 'fps', keyPath: 'fps', unique: false }
                ]
            },
            aggregatedData: {
                name: 'aggregatedData',
                keyPath: ['period', 'startDate'],
                indexes: [
                    { name: 'period', keyPath: 'period', unique: false },
                    { name: 'endDate', keyPath: 'endDate', unique: false }
                ]
            }
        };
    }
    
    /**
     * データベース初期化
     * @returns {Promise<IDBDatabase>}
     */
    async initialize() {
        return new Promise((resolve, reject) => {
            // IndexedDBサポートチェック
            if (!('indexedDB' in window)) {
                reject(new Error('IndexedDB is not supported'));
                return;
            }
            
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => {
                reject(new Error(`Failed to open database: ${request.error}`));
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                this.setupEventHandlers();
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 既存ストアの削除（バージョンアップ時）
                for (const storeName of db.objectStoreNames) {
                    if (!Object.keys(this.stores).includes(storeName)) {
                        db.deleteObjectStore(storeName);
                    }
                }
                
                // ストアの作成
                for (const [key, storeConfig] of Object.entries(this.stores)) {
                    let store;
                    
                    if (!db.objectStoreNames.contains(storeConfig.name)) {
                        const options = { keyPath: storeConfig.keyPath };
                        if (storeConfig.autoIncrement) {
                            options.autoIncrement = true;
                        }
                        store = db.createObjectStore(storeConfig.name, options);
                    } else {
                        const transaction = event.target.transaction;
                        store = transaction.objectStore(storeConfig.name);
                    }
                    
                    // インデックスの作成
                    if (storeConfig.indexes) {
                        for (const index of storeConfig.indexes) {
                            if (!store.indexNames.contains(index.name)) {
                                store.createIndex(index.name, index.keyPath, { unique: index.unique });
                            }
                        }
                    }
                }
            };
        });
    }
    
    /**
     * イベントハンドラーの設定
     */
    setupEventHandlers() {
        if (!this.db) return;
        
        this.db.onerror = (event) => {
            console.error('Database error:', event);
        };
        
        this.db.onabort = (event) => {
            console.error('Database transaction aborted:', event);
        };
        
        this.db.onversionchange = () => {
            this.db.close();
            console.warn('Database version changed, connection closed');
        };
    }
    
    /**
     * データ保存
     * @param {string} storeName - ストア名
     * @param {Object|Array} data - 保存するデータ
     * @returns {Promise<void>}
     */
    async saveData(storeName, data) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
            
            // 配列の場合は一括保存
            if (Array.isArray(data)) {
                data.forEach(item => store.put(item));
            } else {
                store.put(data);
            }
        });
    }
    
    /**
     * データ取得
     * @param {string} storeName - ストア名
     * @param {Object} query - クエリ条件
     * @returns {Promise<Array>}
     */
    async getData(storeName, query = {}) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const results = [];
            
            let request;
            
            // クエリタイプに応じた処理
            if (query.key) {
                // 単一キー検索
                request = store.get(query.key);
                request.onsuccess = () => {
                    resolve(request.result ? [request.result] : []);
                };
                request.onerror = () => reject(request.error);
            } else if (query.index && query.value) {
                // インデックス検索
                const index = store.index(query.index);
                request = index.openCursor(IDBKeyRange.only(query.value));
                
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        results.push(cursor.value);
                        cursor.continue();
                    } else {
                        resolve(results);
                    }
                };
                request.onerror = () => reject(request.error);
            } else if (query.range) {
                // 範囲検索
                const range = this.createKeyRange(query.range);
                const index = query.index ? store.index(query.index) : store;
                request = index.openCursor(range);
                
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        results.push(cursor.value);
                        cursor.continue();
                    } else {
                        resolve(results);
                    }
                };
                request.onerror = () => reject(request.error);
            } else {
                // 全件取得
                request = store.getAll();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            }
        });
    }
    
    /**
     * KeyRange作成
     * @param {Object} range - 範囲条件
     * @returns {IDBKeyRange}
     */
    createKeyRange(range) {
        if (range.lower && range.upper) {
            return IDBKeyRange.bound(
                range.lower,
                range.upper,
                range.lowerExclusive || false,
                range.upperExclusive || false
            );
        } else if (range.lower) {
            return IDBKeyRange.lowerBound(range.lower, range.lowerExclusive || false);
        } else if (range.upper) {
            return IDBKeyRange.upperBound(range.upper, range.upperExclusive || false);
        }
        return null;
    }
    
    /**
     * データ集計
     * @param {string} storeName - ストア名
     * @param {Object} aggregationRules - 集計ルール
     * @returns {Promise<Object>}
     */
    async aggregateData(storeName, aggregationRules) {
        const data = await this.getData(storeName, aggregationRules.query || {});
        
        const result = {
            count: data.length,
            ...aggregationRules.initialValues || {}
        };
        
        // 集計処理
        data.forEach(item => {
            for (const [field, rule] of Object.entries(aggregationRules.fields || {})) {
                const value = this.getNestedValue(item, field);
                
                switch (rule.type) {
                    case 'sum':
                        result[rule.alias || field] = (result[rule.alias || field] || 0) + (value || 0);
                        break;
                    case 'avg':
                        if (!result[`_sum_${field}`]) result[`_sum_${field}`] = 0;
                        result[`_sum_${field}`] += (value || 0);
                        result[rule.alias || field] = result[`_sum_${field}`] / result.count;
                        break;
                    case 'min':
                        if (result[rule.alias || field] === undefined || value < result[rule.alias || field]) {
                            result[rule.alias || field] = value;
                        }
                        break;
                    case 'max':
                        if (result[rule.alias || field] === undefined || value > result[rule.alias || field]) {
                            result[rule.alias || field] = value;
                        }
                        break;
                    case 'count':
                        if (rule.condition && rule.condition(value)) {
                            result[rule.alias || field] = (result[rule.alias || field] || 0) + 1;
                        }
                        break;
                    case 'group':
                        if (!result[rule.alias || field]) result[rule.alias || field] = {};
                        const groupKey = value || 'unknown';
                        result[rule.alias || field][groupKey] = (result[rule.alias || field][groupKey] || 0) + 1;
                        break;
                }
            }
        });
        
        // 平均値の最終計算用の一時フィールドを削除
        Object.keys(result).forEach(key => {
            if (key.startsWith('_sum_')) {
                delete result[key];
            }
        });
        
        return result;
    }
    
    /**
     * ネストされたオブジェクトから値を取得
     * @param {Object} obj - オブジェクト
     * @param {string} path - パス（ドット区切り）
     * @returns {*}
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    
    /**
     * データクリーンアップ
     * @param {number} retentionDays - 保持日数
     * @returns {Promise<Object>}
     */
    async cleanupOldData(retentionDays) {
        const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
        const results = {};
        
        // セッションデータのクリーンアップ
        const oldSessions = await this.getData('sessions', {
            range: {
                upper: cutoffTime,
                index: 'startTime'
            }
        });
        
        results.sessions = {
            count: oldSessions.length,
            sessionIds: oldSessions.map(s => s.sessionId)
        };
        
        // 関連データの削除
        for (const sessionId of results.sessions.sessionIds) {
            // バブルインタラクションデータ削除
            await this.deleteData('bubbleInteractions', {
                index: 'sessionId',
                value: sessionId
            });
            
            // パフォーマンスデータ削除
            await this.deleteData('performance', {
                index: 'sessionId',
                value: sessionId
            });
            
            // セッションデータ削除
            await this.deleteData('sessions', { key: sessionId });
        }
        
        // 古い集計データの削除
        const oldAggregated = await this.getData('aggregatedData', {
            range: {
                upper: cutoffTime,
                index: 'endDate'
            }
        });
        
        results.aggregatedData = {
            count: oldAggregated.length
        };
        
        for (const data of oldAggregated) {
            await this.deleteData('aggregatedData', {
                key: [data.period, data.startDate]
            });
        }
        
        return results;
    }
    
    /**
     * データ削除
     * @param {string} storeName - ストア名
     * @param {Object} query - 削除条件
     * @returns {Promise<void>}
     */
    async deleteData(storeName, query) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
            
            if (query.key) {
                store.delete(query.key);
            } else if (query.index && query.value) {
                const index = store.index(query.index);
                const request = index.openCursor(IDBKeyRange.only(query.value));
                
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        cursor.delete();
                        cursor.continue();
                    }
                };
            }
        });
    }
    
    /**
     * データベースのサイズ取得
     * @returns {Promise<Object>}
     */
    async getDatabaseSize() {
        if (!navigator.storage?.estimate) {
            return { supported: false };
        }
        
        try {
            const estimate = await navigator.storage.estimate();
            return {
                supported: true,
                usage: estimate.usage || 0,
                quota: estimate.quota || 0,
                usageInMB: ((estimate.usage || 0) / (1024 * 1024)).toFixed(2),
                quotaInMB: ((estimate.quota || 0) / (1024 * 1024)).toFixed(2),
                percentUsed: estimate.quota ? ((estimate.usage / estimate.quota) * 100).toFixed(2) : 0
            };
        } catch (error) {
            console.error('Failed to estimate storage:', error);
            return { supported: false, error: error.message };
        }
    }
    
    /**
     * データベースのクローズ
     */
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}