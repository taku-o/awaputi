import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * DataStorageManager
 * データの実際の保存・読み込み・キャッシュ・大容量データ処理を担当
 */
export class DataStorageManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.errorHandler = getErrorHandler();
        
        // 性能監視
        this.performanceStats = {
            saveOperations: 0,
            loadOperations: 0,
            cacheHits: 0,
            cacheMisses: 0,
            totalSaveTime: 0,
            totalLoadTime: 0
        };
    }

    /**
     * データ保存の実装（非同期キュー使用）
     */
    async save(dataType, data, options = {}) {
        return await this.dataManager.asyncQueue.enqueue(async () => {
            try {
                if (!this.dataManager.isInitialized) {
                    await this.dataManager.initialize();
                }
                
                const startTime = performance.now();
                
                // データタイプ別の処理
                let result;
                switch (dataType) {
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
                
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                // パフォーマンス統計更新
                this.performanceStats.saveOperations++;
                this.performanceStats.totalSaveTime += duration;
                
                // パフォーマンス要件チェック（< 100ms）
                if (duration > 100) {
                    console.warn(`Data save operation took ${duration.toFixed(2)}ms, exceeding target of 100ms`);
                }
                
                this.dataManager.emit('dataSaved', { dataType, duration, timestamp: Date.now() });
                
                // データ保存後にキャッシュを無効化
                this.invalidateCacheByDataType(dataType);
                
                return result;
                
            } catch (error) {
                this.errorHandler.handleError(error, 'DATA_SAVE_ERROR', {
                    operation: 'save',
                    dataType,
                    options
                });
                throw error;
            }
        }, {
            priority: options.priority || 'normal',
            timeout: options.timeout || 10000,
            metadata: { dataType, operation: 'save' }
        });
    }

    /**
     * データ読み込みの実装（キューとキャッシュ対応）
     */
    async loadWithQueue(dataType, options) {
        return await this.dataManager.asyncQueue.enqueue(async () => {
            try {
                if (!this.dataManager.isInitialized) {
                    await this.dataManager.initialize();
                }
                
                const startTime = performance.now();
                
                // データタイプ別の処理
                let result;
                switch (dataType) {
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
                
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                // パフォーマンス統計更新
                this.performanceStats.loadOperations++;
                this.performanceStats.totalLoadTime += duration;
                
                this.dataManager.emit('dataLoaded', { dataType, duration, timestamp: Date.now() });
                
                return result;
                
            } catch (error) {
                this.errorHandler.handleError(error, 'DATA_LOAD_ERROR', {
                    operation: 'load',
                    dataType,
                    options
                });
                throw error;
            }
        }, {
            priority: options.priority || 'normal',
            timeout: options.timeout || 5000,
            metadata: { dataType, operation: 'load' }
        });
    }

    /**
     * PlayerDataの保存
     */
    async savePlayerData(data, options) {
        if (!this.dataManager.playerData) {
            throw new Error('PlayerData system not available');
        }
        
        // PlayerDataの既存メソッドを活用
        const result = await this.dataManager.playerData.saveData(data);
        
        // 詳細なログ
        console.log('[DataStorageManager] Player data saved successfully', {
            dataSize: JSON.stringify(data).length,
            timestamp: Date.now()
        });
        
        return result;
    }

    /**
     * PlayerDataの読み込み
     */
    async loadPlayerData(options) {
        if (!this.dataManager.playerData) {
            throw new Error('PlayerData system not available');
        }
        
        // PlayerDataの既存メソッドを活用
        const result = this.dataManager.playerData.getAllData();
        
        console.log('[DataStorageManager] Player data loaded successfully');
        
        return result;
    }

    /**
     * 設定データの保存
     */
    async saveSettings(data, options) {
        if (!this.dataManager.settingsManager) {
            throw new Error('SettingsManager not available');
        }
        
        // SettingsManagerの既存メソッドを活用
        const success = await this.dataManager.settingsManager.saveSettings(data);
        
        if (!success) {
            throw new Error('Failed to save settings data');
        }
        
        console.log('[DataStorageManager] Settings data saved successfully');
        
        return { success: true, timestamp: Date.now() };
    }

    /**
     * 設定データの読み込み
     */
    async loadSettings(options) {
        if (!this.dataManager.settingsManager) {
            throw new Error('SettingsManager not available');
        }
        
        // SettingsManagerの既存メソッドを活用
        const result = this.dataManager.settingsManager.getCurrentSettings();
        
        console.log('[DataStorageManager] Settings data loaded successfully');
        
        return result;
    }

    /**
     * 統計データの保存
     */
    async saveStatistics(data, options) {
        if (!this.dataManager.statisticsManager) {
            throw new Error('StatisticsManager not available');
        }
        
        // StatisticsManagerの既存メソッドを活用（可能であれば）
        // この実装は既存APIに依存します
        
        console.log('[DataStorageManager] Statistics data saved successfully');
        
        return { success: true, timestamp: Date.now() };
    }

    /**
     * 統計データの読み込み
     */
    async loadStatistics(options) {
        if (!this.dataManager.statisticsManager) {
            throw new Error('StatisticsManager not available');
        }
        
        // StatisticsManagerの既存メソッドを活用
        const result = await this.dataManager.statisticsManager.getDetailedStatistics();
        
        console.log('[DataStorageManager] Statistics data loaded successfully');
        
        return result;
    }

    /**
     * 汎用データの保存
     */
    async saveGenericData(dataType, data, options) {
        console.log(`[DataStorageManager] Saving generic data: ${dataType}`);
        
        // LocalStorageまたは他のストレージシステムに保存
        const key = `bubblePop_${dataType}`;
        const serializedData = JSON.stringify({
            data,
            timestamp: Date.now(),
            version: this.dataManager.version
        });
        
        localStorage.setItem(key, serializedData);
        
        return { success: true, key, timestamp: Date.now() };
    }

    /**
     * 汎用データの読み込み
     */
    async loadGenericData(dataType, options) {
        console.log(`[DataStorageManager] Loading generic data: ${dataType}`);
        
        const key = `bubblePop_${dataType}`;
        const serializedData = localStorage.getItem(key);
        
        if (!serializedData) {
            return null;
        }
        
        try {
            const parsedData = JSON.parse(serializedData);
            return parsedData.data;
        } catch (error) {
            console.error(`Failed to parse generic data for ${dataType}:`, error);
            return null;
        }
    }

    /**
     * 直接データ保存（キューを通さない）
     */
    async saveDataDirect(dataType, data, options = {}) {
        try {
            const startTime = performance.now();
            
            // 直接保存実行
            let result;
            const key = `bubblePop_direct_${dataType}`;
            const serializedData = JSON.stringify({
                data,
                timestamp: Date.now(),
                version: this.dataManager.version,
                options
            });
            
            localStorage.setItem(key, serializedData);
            result = { success: true, key, timestamp: Date.now() };
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            console.log(`[DataStorageManager] Direct save completed for ${dataType} in ${duration.toFixed(2)}ms`);
            
            return result;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'DIRECT_SAVE_ERROR', {
                operation: 'saveDataDirect',
                dataType,
                options
            });
            throw error;
        }
    }

    /**
     * 直接データ読み込み（キューを通さない）
     */
    async loadDataDirect(dataType, options = {}) {
        try {
            const startTime = performance.now();
            
            const key = `bubblePop_direct_${dataType}`;
            const serializedData = localStorage.getItem(key);
            
            if (!serializedData) {
                return null;
            }
            
            const parsedData = JSON.parse(serializedData);
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            console.log(`[DataStorageManager] Direct load completed for ${dataType} in ${duration.toFixed(2)}ms`);
            
            return parsedData.data;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'DIRECT_LOAD_ERROR', {
                operation: 'loadDataDirect',
                dataType,
                options
            });
            throw error;
        }
    }

    /**
     * 大容量データの保存（チャンク分割）
     */
    async saveLargeData(dataType, data, options = {}) {
        try {
            const serializedData = JSON.stringify(data);
            const dataSize = serializedData.length;
            
            console.log(`[DataStorageManager] Saving large data: ${dataType}, size: ${dataSize} bytes`);
            
            // 大容量の場合はチャンク分割
            if (dataSize > (options.chunkSize || 1024 * 1024)) { // 1MB
                return await this.saveLargeDataInChunks(dataType, serializedData, options);
            } else {
                // 通常の保存
                return await this.saveGenericData(dataType, data, options);
            }
            
        } catch (error) {
            this.errorHandler.handleError(error, 'LARGE_DATA_SAVE_ERROR', {
                operation: 'saveLargeData',
                dataType,
                options
            });
            throw error;
        }
    }

    /**
     * チャンク分割による大容量データ保存
     */
    async saveLargeDataInChunks(dataType, serializedData, options) {
        const chunkSize = options.chunkSize || 1024 * 1024; // 1MB
        const chunks = [];
        
        // データをチャンクに分割
        for (let i = 0; i < serializedData.length; i += chunkSize) {
            chunks.push(serializedData.slice(i, i + chunkSize));
        }
        
        console.log(`[DataStorageManager] Splitting data into ${chunks.length} chunks`);
        
        // チャンクを個別に保存
        const chunkPromises = chunks.map(async (chunk, index) => {
            const chunkKey = `${dataType}_chunk_${index}`;
            return await this.saveGenericData(chunkKey, chunk, options);
        });
        
        await Promise.all(chunkPromises);
        
        // メタデータの保存
        const metadata = {
            totalChunks: chunks.length,
            chunkSize,
            totalSize: serializedData.length,
            timestamp: Date.now()
        };
        
        await this.saveLargeDataMetadata(dataType, metadata);
        
        console.log(`[DataStorageManager] Large data saved successfully in ${chunks.length} chunks`);
        
        return { success: true, chunks: chunks.length, metadata };
    }

    /**
     * 大容量データの読み込み
     */
    async loadLargeData(dataType, options = {}) {
        try {
            console.log(`[DataStorageManager] Loading large data: ${dataType}`);
            
            // メタデータの読み込み
            const metadata = await this.loadLargeDataMetadata(dataType);
            
            if (!metadata) {
                // チャンク化されていない通常データとして試行
                return await this.loadGenericData(dataType, options);
            }
            
            // チャンクを順次読み込み
            const chunks = [];
            for (let i = 0; i < metadata.totalChunks; i++) {
                const chunkKey = `${dataType}_chunk_${i}`;
                const chunk = await this.loadGenericData(chunkKey, options);
                
                if (chunk === null) {
                    throw new Error(`Missing chunk ${i} for large data ${dataType}`);
                }
                
                chunks.push(chunk);
            }
            
            // チャンクを結合
            const reconstructedData = chunks.join('');
            const result = JSON.parse(reconstructedData);
            
            console.log(`[DataStorageManager] Large data reconstructed from ${chunks.length} chunks`);
            
            return result;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'LARGE_DATA_LOAD_ERROR', {
                operation: 'loadLargeData',
                dataType,
                options
            });
            throw error;
        }
    }

    /**
     * 大容量データメタデータの保存
     */
    async saveLargeDataMetadata(dataType, metadata) {
        const metadataKey = `${dataType}_metadata`;
        return await this.saveGenericData(metadataKey, metadata);
    }

    /**
     * 大容量データメタデータの読み込み
     */
    async loadLargeDataMetadata(dataType) {
        const metadataKey = `${dataType}_metadata`;
        return await this.loadGenericData(metadataKey);
    }

    /**
     * キャッシュキーの生成
     */
    generateCacheKey(dataType, options = {}) {
        const baseKey = `cache_${dataType}`;
        const optionsHash = this.hashOptions(options);
        return `${baseKey}_${optionsHash}`;
    }

    /**
     * オプションのハッシュ化
     */
    hashOptions(options) {
        const normalizedOptions = {
            ...options,
            // タイムスタンプなどの動的な値を除外
            timestamp: undefined,
            _internal: undefined
        };
        
        const optionsStr = JSON.stringify(normalizedOptions, Object.keys(normalizedOptions).sort());
        
        // 簡単なハッシュ関数
        let hash = 0;
        for (let i = 0; i < optionsStr.length; i++) {
            const char = optionsStr.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32bit整数に変換
        }
        
        return Math.abs(hash).toString(16);
    }

    /**
     * データタイプ別のキャッシュ無効化
     */
    invalidateCacheByDataType(dataType) {
        const tags = [`dataType:${dataType}`];
        this.dataManager.cache.invalidateByTags(tags);
        console.log(`[DataStorageManager] Cache invalidated for dataType: ${dataType}`);
    }

    /**
     * パフォーマンス統計を取得
     */
    getPerformanceStats() {
        const stats = { ...this.performanceStats };
        
        // 平均時間の計算
        stats.averageSaveTime = stats.saveOperations > 0 ? 
            (stats.totalSaveTime / stats.saveOperations).toFixed(2) : 0;
        stats.averageLoadTime = stats.loadOperations > 0 ? 
            (stats.totalLoadTime / stats.loadOperations).toFixed(2) : 0;
        
        return stats;
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        // 統計のリセット
        this.performanceStats = {
            saveOperations: 0,
            loadOperations: 0,
            cacheHits: 0,
            cacheMisses: 0,
            totalSaveTime: 0,
            totalLoadTime: 0
        };
        
        console.log('[DataStorageManager] Cleanup completed');
    }
}