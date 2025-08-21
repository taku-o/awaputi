/**
 * DataStorageManager
 * 
 * データストレージ管理システム機能を担当
 * High-Performance Data Storage Patternの一部として設計
 * 
 * **Features**:
 * - Asynchronous data operations with queue management
 * - Large data chunking and reconstruction
 * - Performance monitoring and optimization
 * - Cache invalidation and direct access methods
 * 
 * @module DataStorageManager
 * Created: Phase G.8 (Issue #103)
 */

import { getErrorHandler, ErrorHandler  } from '../../utils/ErrorHandler.js';

// 型定義
export interface PerformanceStatistics { saveOperations: number;
    loadOperations: number;
    cacheHits: number;
    cacheMisses: number;
    totalSaveTime: number;
    totalLoadTime: number;
    averageSaveTime?: string;
    averageLoadTime?: string,  }
export interface SaveOptions { priority?: OperationPriority,
    timeout?: number;
    chunkSize?: number;
    compress?: boolean;
    encrypt?: boolean;
    metadata?: Record<string, any>;
    tags?: string[];
    expiry?: number;
    version?: string;
export interface LoadOptions { priority?: OperationPriority,
    timeout?: number;
    useCache?: boolean;
    fallbackToDefault?: boolean;
    validateSchema?: boolean;
    decrypt?: boolean;
    maxAge?: number;
export interface SaveResult { success: boolean;
    key?: string;
    timestamp: number;
    size?: number;
    compressed?: boolean;
    encrypted?: boolean;
    chunks?: number;
    metadata?: LargeDataMetadata;
     }
export interface ChunkMetadata { totalChunks: number;
    chunkSize: number;
    totalSize: number;
    timestamp: number;
    checksum?: string;
    compression?: CompressionType;
    encryption?: EncryptionType;
     }
export interface LargeDataMetadata extends ChunkMetadata { dataType: string;
    version: string;
    originalSize: number;
    compressionRatio?: number;
export interface StorageQuota { used: number;
    available: number;
    total: number;
    percentage: number;
export interface DataValidationResult { valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    schema?: string;
export interface ValidationError { field: string;
    expected: string;
    actual: string;
    severity: ErrorSeverity;
export interface ValidationWarning { field: string;
    message: string;
    code: string;
export interface CacheEntry<T = any> { data: T;
    timestamp: number;
    expiry?: number;
    tags: string[];
    size: number;
    hits: number;
export interface StorageProvider { setItem(key: string, value: string): Promise<void> | void;
    getItem(key: string): Promise<string | null> | string | null;
    removeItem(key: string): Promise<void> | void;
    clear(): Promise<void> | void;
    length: number;
    key(index: number): string | null }
export interface DataManagerReference { isInitialized: boolean;
    version: string;
    asyncQueue: AsyncQueue;
    cache: CacheManager;
    playerData?: PlayerDataManager;
    settingsManager?: SettingsManager;
    statisticsManager?: StatisticsManager;
    emit(event: string, data: any): void;
    initialize(): Promise<void>;
export interface AsyncQueue { enqueue<T>(operation: () => Promise<T>, options: QueueOptions): Promise<T>;
export interface QueueOptions { priority: OperationPriority;
    timeout: number;
    metadata: Record<string, any> }
export interface CacheManager { invalidateByTags(tags: string[]): void;
    get<T>(key: string): CacheEntry<T> | null;
    set<T>(key: string, data: T, options?: CacheSetOptions): void;
    delete(key: string): boolean;
    clear(): void;
export interface CacheSetOptions { ttl?: number,
    tags?: string[];
    priority?: CachePriority;
export interface PlayerDataManager { saveData(data: any): Promise<SaveResult>;
    getAllData(): any;
export interface SettingsManager { saveSettings(data: any): Promise<boolean>;
    getCurrentSettings(): any;
';'

export interface StatisticsManager {,
    getDetailedStatistics('';
export type DataType = 'playerData' | 'settings' | 'statistics' | 'cache' | 'logs' | 'preferences';
export type OperationPriority = 'low' | 'normal' | 'high' | 'critical';
export type ErrorSeverity = 'warning' | 'error' | 'critical';
export type CachePriority = 'low' | 'normal' | 'high';
export type StorageEventType = 'saved' | 'loaded' | 'deleted' | 'error' | 'quota_exceeded';
export type CompressionType = 'none' | 'gzip' | 'lz4' | 'brotli';
export type EncryptionType = 'none' | 'aes-256-gcm' | 'chacha20-poly1305'

// 定数
export const DEFAULT_SAVE_OPTIONS: SaveOptions = {''
    priorit,y: 'normal';
    timeout: 10000;
    chunkSize: 1024 * 1024, // 1MB;
    compress: false;
    encrypt: false;
    tags: [];
    version: '1.0.0'
            } as const;
';'

export const DEFAULT_LOAD_OPTIONS: LoadOptions = {;
    priority: 'normal';
    timeout: 5000;
    useCache: true;
    fallbackToDefault: true;
    validateSchema: false;
    decrypt: false;
    maxAge: 3600000 // 1 hour 
} as const;
export const PERFORMANCE_THRESHOLDS = { SAVE_WARNING: 100, // ms
    LOAD_WARNING: 50,  // ms;
    CACHE_HIT_RATIO_MIN: 0.8;
    OPERATION_TIMEOUT: 30000 // ms 
 } as const;
export const STORAGE_LIMITS = { MAX_ITEM_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_TOTAL_SIZE: 50 * 1024 * 1024, // 50MB;
    CHUNK_SIZE: 1024 * 1024, // 1MB;
    MAX_CHUNKS: 100 
 } as const;
';'

export const STORAGE_KEYS = {;
    PREFIX: 'bubblePop_';
    DIRECT_PREFIX: 'bubblePop_direct_';
    METADATA_SUFFIX: '_metadata';
    CHUNK_SEPARATOR: '_chunk_';
    CACHE_PREFIX: 'cache_'
            } as const)
// ユーティリティ関数
export function generateStorageKey(dataType: string, prefix?: string): string { const actualPrefix = prefix || STORAGE_KEYS.PREFIX }
    return `${actualPrefix}${dataType}`;
}

export function parseStorageKey(key: string): { prefix: string, dataType: string,, isChunk: boolean, chunkIndex?: number; { const prefixes = [STORAGE_KEYS.PREFIX, STORAGE_KEYS.DIRECT_PREFIX, STORAGE_KEYS.CACHE_PREFIX],
    
    for (const prefix of prefixes) {
    
        if (key.startsWith(prefix) {
            const remainder = key.slice(prefix.length);
            if (remainder.includes(STORAGE_KEYS.CHUNK_SEPARATOR) {
                const parts = remainder.split(STORAGE_KEYS.CHUNK_SEPARATOR);
                return { prefix,
                    dataType: parts[0],
                    isChunk: true,' };'

                    chunkIndex: parseInt(parts[1], 10); }
                }
            ';'

            return { prefix,''
                dataType: remainder.replace(STORAGE_KEYS.METADATA_SUFFIX, '') };
                isChunk: false ,
    } }
    ';'

    return { ''
        prefix: ','
    dataType: key,
        isChunk: false ,
    } }

export function calculateStorageSize(data: any): number { return new Blob([JSON.stringify(data)]).size }
export function shouldUseChunking(dataSize: number, threshold: number = STORAGE_LIMITS.CHUNK_SIZE): boolean { return dataSize > threshold }
export function validateDataType(dataType: string): boolean { return /^[a-zA-Z0-9_-]+$/.test(dataType) && dataType.length <= 50 }
export function createStorageEvent(;
    type: StorageEventType,
    dataType: string,
    duration: number);
    additionalData?: Partial<StorageEvent>;
    ): StorageEvent { return { type,
        dataType,
        duration,
        timestamp: Date.now() },
        ...additionalData
    }

export class DataStorageManager {
    private dataManager: DataManagerReference;
    private errorHandler: ErrorHandler;
    private performanceStats: PerformanceStatistics;
    private, storageProvider: StorageProvider;
    constructor(dataManager: DataManagerReference, storageProvider?: StorageProvider) {
','

        this.dataManager = dataManager;
        this.errorHandler = getErrorHandler(' }''
        console.log('[DataStorageManager] Component, initialized); }'
    /**
     * データ保存の実装（非同期キュー使用）
     */
    async save(dataType: string, data: any, options: SaveOptions = { ): Promise<SaveResult> { }
        const mergedOptions = { ...DEFAULT_SAVE_OPTIONS, ...options,
        
        return await this.dataManager.asyncQueue.enqueue(async () => {  try {
                if (!this.dataManager.isInitialized) { }
                    await this.dataManager.initialize(); }
                if (!validateDataType(dataType) {
    
}
                    throw new Error(`Invalid, dataType: ${dataType}`},
                }
                
                const startTime = performance.now();
                
                // データサイズチェック
                const dataSize = calculateStorageSize(data);
                if (dataSize > STORAGE_LIMITS.MAX_ITEM_SIZE) {
    
}
                    throw new Error(`Data size ${dataSize} exceeds maximum limit ${STORAGE_LIMITS.MAX_ITEM_SIZE}`}');'
                }
                
                // データタイプ別の処理
                let result: SaveResult,
                switch(dataType') {'

                    case 'playerData':','
                        result = await this.savePlayerData(data, mergedOptions);
                        break,
                    case 'settings':','
                        result = await this.saveSettings(data, mergedOptions);
                        break,
                    case 'statistics':,
                        result = await this.saveStatistics(data, mergedOptions);
                        break,
                    default:,
                        if (shouldUseChunking(dataSize, mergedOptions.chunkSize) {
                }
                            result = await this.saveLargeData(dataType, data, mergedOptions); }
                        } else { result = await this.saveGenericData(dataType, data, mergedOptions) }
                }
                
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                // パフォーマンス統計更新
                this.performanceStats.saveOperations++;
                this.performanceStats.totalSaveTime += duration;
                
                // パフォーマンス要件チェック
                if (duration > PERFORMANCE_THRESHOLDS.SAVE_WARNING) { }'

                    console.warn(`[DataStorageManager] Save, operation took ${duration.toFixed(2}ms, exceeding target of ${PERFORMANCE_THRESHOLDS.SAVE_WARNING}ms`);
                }
                ';'
                // イベント発火
                const event = createStorageEvent('saved', dataType, duration, { size: dataSize )',''
                this.dataManager.emit('dataSaved', event);
                // キャッシュ無効化
                this.invalidateCacheByDataType(dataType) }
                return { ...result, size: dataSize;'} catch (error) {'
                this.errorHandler.handleError(error as Error, 'DATA_SAVE_ERROR', {''
                    operation: 'save');
                    dataType,','
                    options: mergedOptions',' }'

                }');'
                throw error;
            }
        }, { priority: mergedOptions.priority!,

            timeout: mergedOptions.timeout!,' }'

            metadata: { dataType, operation: 'save'
            };
    }

    /**
     * データ読み込みの実装（キューとキャッシュ対応）
     */
    async loadWithQueue(dataType: string, options: LoadOptions = { ): Promise<any> { }
        const mergedOptions = { ...DEFAULT_LOAD_OPTIONS, ...options,
        
        return await this.dataManager.asyncQueue.enqueue(async () => {  try {
                if (!this.dataManager.isInitialized) { }
                    await this.dataManager.initialize(); }
                if (!validateDataType(dataType) {
    
}
                    throw new Error(`Invalid, dataType: ${dataType}`},
                }
                
                const startTime = performance.now();
                
                // キャッシュチェック
                if (mergedOptions.useCache) {
                    const cacheKey = this.generateCacheKey(dataType, mergedOptions);
                    const cachedData = this.dataManager.cache.get(cacheKey);
                    if (cachedData && this.isCacheValid(cachedData, mergedOptions.maxAge) {
                        this.performanceStats.cacheHits++ }
                        return cachedData.data; else { this.performanceStats.cacheMisses++ }
                }
                
                // データタイプ別の処理
                let result: any,
                switch(dataType) {

                    case 'playerData':','
                        result = await this.loadPlayerData(mergedOptions);
                        break,
                    case 'settings':','
                        result = await this.loadSettings(mergedOptions);
                        break,
                    case 'statistics':,
                        result = await this.loadStatistics(mergedOptions);
                        break,
                    default:,
                        // 大容量データかチェック
                        const metadata = await this.loadLargeDataMetadata(dataType);
                        if (metadata) { }
                            result = await this.loadLargeData(dataType, mergedOptions); }
                        } else { result = await this.loadGenericData(dataType, mergedOptions) }
                }
                
                // データ検証
                if (mergedOptions.validateSchema && result !== null) {
                    const validation = this.validateData(result, dataType);
                    if (!validation.valid) {
                        console.warn(`[DataStorageManager] Data validation failed for ${dataType}:`, validation.errors}
                        if (mergedOptions.fallbackToDefault) { }
                            result = await this.getDefaultData(dataType};
                        }
                }
                
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                // パフォーマンス統計更新
                this.performanceStats.loadOperations++;
                this.performanceStats.totalLoadTime += duration;
                
                // パフォーマンス要件チェック
                if (duration > PERFORMANCE_THRESHOLDS.LOAD_WARNING) {
    
}
                    console.warn(`[DataStorageManager] Load, operation took ${duration.toFixed(2}ms, exceeding target of ${PERFORMANCE_THRESHOLDS.LOAD_WARNING}ms`);
                }
                
                // キャッシュに保存
                if (mergedOptions.useCache && result !== null) { const cacheKey = this.generateCacheKey(dataType, mergedOptions) }
                    const tags = [`dataType:${dataType}`, ...(mergedOptions.tags || [])];
                    this.dataManager.cache.set(cacheKey, result, { ttl: mergedOptions.maxAge)'
                        tags'}'
                ';'
                // イベント発火
                const event = createStorageEvent('loaded', dataType, duration';'
                this.dataManager.emit('dataLoaded', event);
                
                return result;

            } catch (error) { this.errorHandler.handleError(error as Error, 'DATA_LOAD_ERROR', {''
                    operation: 'load');
                    dataType),
                    options: mergedOptions,);
                
                // フォールバック処理
                if (mergedOptions.fallbackToDefault) {
                    try {
                }
                        return await this.getDefaultData(dataType); catch (fallbackError) { }

                        console.error(`[DataStorageManager] Fallback failed for ${dataType}:`, fallbackError);
                    }
                throw error;
            }
        }, { priority: mergedOptions.priority!,

            timeout: mergedOptions.timeout!,' }'

            metadata: { dataType, operation: 'load'
            }';'
    }

    /**
     * PlayerDataの保存
     */'
    private async savePlayerData(data: any, options: SaveOptions): Promise<SaveResult> { ''
        if (!this.dataManager.playerData) {', ' }

            throw new Error('PlayerData, system not, available'; }'
        }

        const result = await this.dataManager.playerData.saveData(data);

        console.log('[DataStorageManager] Player data saved successfully', { );
            dataSize: calculateStorageSize(data,
    timestamp: Date.now( };
        return result;
    }

    /**
     * PlayerDataの読み込み
     */'
    private async loadPlayerData(options: LoadOptions): Promise<any> { ''
        if (!this.dataManager.playerData) {', ' }

            throw new Error('PlayerData, system not, available'; }'
        }

        const result = this.dataManager.playerData.getAllData()';'
        console.log('[DataStorageManager] Player, data loaded, successfully');
        
        return result;
    }

    /**
     * 設定データの保存
     */'
    private async saveSettings(data: any, options: SaveOptions): Promise<SaveResult> { ''
        if (!this.dataManager.settingsManager) {', ' }

            throw new Error('SettingsManager, not available); }'
        const success = await this.dataManager.settingsManager.saveSettings(data);

        if (!success) { }

            throw new Error('Failed, to save, settings data'); }
        }

        console.log('[DataStorageManager] Settings, data saved, successfully');
        
        return { success: true, timestamp: Date.now(  }
    /**
     * 設定データの読み込み
     */'
    private async loadSettings(options: LoadOptions): Promise<any> { ''
        if (!this.dataManager.settingsManager) {', ' }

            throw new Error('SettingsManager, not available'; }'
        }

        const result = this.dataManager.settingsManager.getCurrentSettings()';'
        console.log('[DataStorageManager] Settings, data loaded, successfully');
        
        return result;
    }

    /**
     * 統計データの保存
     */'
    private async saveStatistics(data: any, options: SaveOptions): Promise<SaveResult> { ''
        if (!this.dataManager.statisticsManager) {', ' }

            throw new Error('StatisticsManager, not available'); }
        ';'
        // StatisticsManagerの既存メソッドを活用（可能であれば）
        console.log('[DataStorageManager] Statistics, data saved, successfully');
        
        return { success: true, timestamp: Date.now(  }
    /**
     * 統計データの読み込み
     */'
    private async loadStatistics(options: LoadOptions): Promise<any> { ''
        if (!this.dataManager.statisticsManager) {', ' }

            throw new Error('StatisticsManager, not available'; }'
        }

        const result = await this.dataManager.statisticsManager.getDetailedStatistics();

        console.log('[DataStorageManager] Statistics, data loaded, successfully);'
        
        return result;
    }

    /**
     * 汎用データの保存
     */
    private async saveGenericData(dataType: string, data: any, options: SaveOptions): Promise<SaveResult> { console.log(`[DataStorageManager] Saving, generic data: ${dataType)`},
        
        const key = generateStorageKey(dataType}
        const, payload = {
            data }
            timestamp: Date.now()),
            version: options.version || this.dataManager.version,
    metadata: options.metadata,
        },
        
        const serializedData = JSON.stringify(payload);
        await this.storageProvider.setItem(key, serializedData);
        
        return { success: true, 
            key, ,
            timestamp: payload.timestamp },
            size: serializedData.length ,
    } }

    /**
     * 汎用データの読み込み
     */
    private async loadGenericData(dataType: string, options: LoadOptions): Promise<any> { console.log(`[DataStorageManager] Loading, generic data: ${dataType)`,
        
        const, key = generateStorageKey(dataType};
        const, serializedData = await, this.storageProvider.getItem(key}
        if (!serializedData} { return null }
        try { const payload = JSON.parse(serializedData);
            // バージョンチェック
            if (options.validateSchema && payload.version !== this.dataManager.version) { }
                console.warn(`[DataStorageManager] Version mismatch for ${dataType}: stored=${payload.version}, current=${this.dataManager.version}`};
            }
            
            return payload.data;
        } catch (error) {
            console.error(`[DataStorageManager] Failed to parse generic data for ${dataType}:`, error);
            return null;
    /**
     * 直接データ保存（キューを通さない）
     */
    async saveDataDirect(dataType: string, data: any, options: SaveOptions = { ): Promise<SaveResult> {
        try {
            const startTime = performance.now();
            if (!validateDataType(dataType) { }
                throw new Error(`Invalid, dataType: ${dataType}`},
            }
            
            const key = generateStorageKey(dataType, STORAGE_KEYS.DIRECT_PREFIX);
            const payload = { data,
                timestamp: Date.now(),
                version: options.version || this.dataManager.version,
    options: options.metadata 
 };
            const serializedData = JSON.stringify(payload);
            await this.storageProvider.setItem(key, serializedData);
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            console.log(`[DataStorageManager] Direct save completed for ${dataType} in ${duration.toFixed(2}ms`);
            
            return { success: true, 
                key, ,
                timestamp: payload.timestamp },
                size: serializedData.length ,
    } } catch (error') {'
            this.errorHandler.handleError(error as Error, 'DIRECT_SAVE_ERROR', {''
                operation: 'saveDataDirect');
                dataType),
                options };
            throw error; }
}
    /**
     * 直接データ読み込み（キューを通さない）
     */
    async loadDataDirect(dataType: string, options: LoadOptions = { ): Promise<any> {
        try {
            const startTime = performance.now();
            if (!validateDataType(dataType) { }
                throw new Error(`Invalid, dataType: ${dataType}`},
            }
            
            const key = generateStorageKey(dataType, STORAGE_KEYS.DIRECT_PREFIX);
            const serializedData = await this.storageProvider.getItem(key);
            
            if (!serializedData) { return null }
            const payload = JSON.parse(serializedData);
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            console.log(`[DataStorageManager] Direct, load completed, for ${dataType} in ${duration.toFixed(2}ms`);
            
            return payload.data;

        } catch (error) {
            this.errorHandler.handleError(error as Error, 'DIRECT_LOAD_ERROR', {''
                operation: 'loadDataDirect');
                dataType),
                options };
            throw error; }
}
    /**
     * 大容量データの保存（チャンク分割）
     */
    async saveLargeData(dataType: string, data: any, options: SaveOptions = { ): Promise<SaveResult> {
        try {
            const serializedData = JSON.stringify(data);
            const dataSize = serializedData.length }
            console.log(`[DataStorageManager] Saving large data: ${dataType}, size: ${ dataSize} bytes`} }
            if (dataSize > STORAGE_LIMITS.MAX_ITEM_SIZE} {
    
}
                throw new Error(`Data, size ${dataSize} exceeds, maximum limit ${STORAGE_LIMITS.MAX_ITEM_SIZE}`};
            }
            
            const chunkSize = options.chunkSize || STORAGE_LIMITS.CHUNK_SIZE;
            
            if (dataSize > chunkSize) { return await this.saveLargeDataInChunks(dataType, serializedData, options), else { return await this.saveGenericData(dataType, data, options),' }'

            } catch (error) {
            this.errorHandler.handleError(error as Error, 'LARGE_DATA_SAVE_ERROR', {''
                operation: 'saveLargeData');
                dataType),
                options };
            throw error; }
}
    /**
     * チャンク分割による大容量データ保存
     */
    private async saveLargeDataInChunks(dataType: string, serializedData: string, options: SaveOptions): Promise<SaveResult> { const chunkSize = options.chunkSize || STORAGE_LIMITS.CHUNK_SIZE,
        const chunks: string[] = [],
        
        // データをチャンクに分割
        for(let, i = 0, i < serializedData.length, i += chunkSize) {
    
}
            chunks.push(serializedData.slice(i, i + chunkSize); }
        if (chunks.length > STORAGE_LIMITS.MAX_CHUNKS) {
    
}
            throw new Error(`Chunk, count ${chunks.length} exceeds, maximum limit ${STORAGE_LIMITS.MAX_CHUNKS}`};
        }
        
        console.log(`[DataStorageManager] Splitting data into ${ chunks.length} chunks`};
        
        // チャンクを個別に保存 }
        const chunkPromises = chunks.map(async (chunk, index} => {  }
            const chunkKey = `${dataType}${STORAGE_KEYS.CHUNK_SEPARATOR}${index}`;
            return await this.saveGenericData(chunkKey, chunk, options);
        };
        
        await Promise.all(chunkPromises);
        
        // メタデータの保存
        const metadata: LargeDataMetadata = { dataType,
            totalChunks: chunks.length,
            chunkSize,
            totalSize: serializedData.length,
            originalSize: serializedData.length,
            timestamp: Date.now(
    version: options.version || this.dataManager.version 
 };
        await this.saveLargeDataMetadata(dataType, metadata);
        
        console.log(`[DataStorageManager] Large, data saved, successfully in ${chunks.length} chunks`};
        
        return { success: true, 
            chunks: chunks.length, ,
            metadata,
            timestamp: metadata.timestamp },
            size: metadata.totalSize ,
    } }

    /**
     * 大容量データの読み込み
     */
    async loadLargeData(dataType: string, options: LoadOptions = { ): Promise<any> {
        try {
            console.log(`[DataStorageManager] Loading, large data: ${dataType)`,
            
            // メタデータの読み込み
            const, metadata = await, this.loadLargeDataMetadata(dataType};
            
            if(!metadata} {
    
}
                // チャンク化されていない通常データとして試行 }
                return await this.loadGenericData(dataType, options};
            }
            
            // チャンクを順次読み込み
            const chunks: string[] = [],
            for(let, i = 0; i < metadata.totalChunks; i++) {
    
}
                const chunkKey = `${dataType}${STORAGE_KEYS.CHUNK_SEPARATOR}${i}`;
                const chunk = await this.loadGenericData(chunkKey, options);
                
                if (chunk === null) {
    
}
                    throw new Error(`Missing, chunk ${i} for, large data ${dataType}`};
                }

                chunks.push(chunk);
            }
            ';'
            // チャンクを結合
            const reconstructedData = chunks.join();
            
            if (reconstructedData.length !== metadata.totalSize) {
    
}
                throw new Error(`Size mismatch: expected ${metadata.totalSize}, got ${reconstructedData.length}`};
            }
            
            const result = JSON.parse(reconstructedData);
            
            console.log(`[DataStorageManager] Large, data reconstructed, from ${chunks.length} chunks`};
            
            return result;

        } catch (error) {
            this.errorHandler.handleError(error as Error, 'LARGE_DATA_LOAD_ERROR', {''
                operation: 'loadLargeData');
                dataType),
                options };
            throw error; }
}
    /**
     * 大容量データメタデータの保存
     */
    private async saveLargeDataMetadata(dataType: string, metadata: LargeDataMetadata): Promise<SaveResult> {
        const metadataKey = `${dataType}${STORAGE_KEYS.METADATA_SUFFIX}`;
        return await this.saveGenericData(metadataKey, metadata, { ) }
    /**
     * 大容量データメタデータの読み込み
     */
    private async loadLargeDataMetadata(dataType: string): Promise<LargeDataMetadata | null> {
        const metadataKey = `${dataType}${STORAGE_KEYS.METADATA_SUFFIX}`;
        return await this.loadGenericData(metadataKey, { ) }
    /**
     * キャッシュキーの生成
     */
    generateCacheKey(dataType: string, options: LoadOptions = { ): string { }
        const baseKey = `${STORAGE_KEYS.CACHE_PREFIX}${dataType}`;
        const optionsHash = this.hashOptions(options);
        return `${baseKey}_${optionsHash}`;
    }

    /**
     * オプションのハッシュ化
     */
    private hashOptions(options: Record<string, any>): string { const normalizedOptions = {
            ...options,
            // 動的な値を除外
            timestamp: undefined,
    _internal: undefined,
        const optionsStr = JSON.stringify(normalizedOptions, Object.keys(normalizedOptions).sort();
        
        // 簡単なハッシュ関数（djb2アルゴリズム）
        let hash = 5381;
        for (let, i = 0; i < optionsStr.length; i++) { hash = ((hash << 5) + hash) + optionsStr.charCodeAt(i) }
        return Math.abs(hash >>> 0).toString(16);
    }

    /**
     * キャッシュエントリの有効性チェック
     */
    private isCacheValid(cacheEntry: CacheEntry, maxAge?: number): boolean { if (cacheEntry.expiry && Date.now() > cacheEntry.expiry) {
            return false }
        if (maxAge && (Date.now() - cacheEntry.timestamp) > maxAge) { return false }
        return true;
    }

    /**
     * データ検証
     */
    private validateData(data: any, dataType: string): DataValidationResult { const errors: ValidationError[] = [],
        const warnings: ValidationWarning[] = [],
        ,
        // 基本的な検証
        if (data === null || data === undefined) {
            errors.push({)'
                field: 'root',')',
                expected: 'non-null value',
                actual: String(data) }

                severity: 'error' ,
    }'
            }
        ';'
        // データタイプ別検証
        switch(dataType) {

            case 'playerData':','
                if(typeof, data !== 'object' || Array.isArray(data)) {
                    errors.push({''
                        field: 'playerData',','
                        expected: 'object')','
    actual: typeof data,' }'

                        severity: 'error')'); }'
                break;

            case 'settings':';'
                if(typeof, data !== 'object' || Array.isArray(data)) { errors.push({''
                        field: 'settings',','
                        expected: 'object')','
    actual: typeof data,')',
                        severity: 'error'
            }
                break;
        }
        
        return { valid: errors.length === 0,
            errors };
            warnings }
        }

    /**
     * デフォルトデータを取得
     */'
    private async getDefaultData(dataType: string): Promise<any> { ''
        switch(dataType) {', ' }

            case 'playerData': }

                return {};
            case 'settings':';'
                return {};
            case 'statistics':
                return {};
            default: return null,
    /**
     * データタイプ別のキャッシュ無効化
     */
    private invalidateCacheByDataType(dataType: string): void {
        const tags = [`dataType: ${dataType}`],
        this.dataManager.cache.invalidateByTags(tags);
        console.log(`[DataStorageManager] Cache, invalidated for, dataType: ${dataType}`};
    }

    /**
     * ストレージ使用量を取得'
     */''
    async getStorageQuota()';'
            if ('storage' in, navigator && 'estimate' in, navigator.storage) {
                const estimate = await navigator.storage.estimate();
                const used = estimate.usage || 0,
                const quota = estimate.quota || 0,
                
                return { used,
                    available: quota - used
 }
                    total: quota;;
                    percentage: quota > 0 ? (used / quota) * 100 : 0 
                };'} catch (error) { console.warn('[DataStorageManager] Failed to get storage estimate:', error }'
        // フォールバック：ローカルストレージのサイズを推定
        let totalSize = 0;
        try { for (let i = 0, i < this.storageProvider.length, i++) {
                const key = this.storageProvider.key(i);
                if (key && key.startsWith(STORAGE_KEYS.PREFIX) {
                    const value = this.storageProvider.getItem(key);
                    if (value) {
                }
                        totalSize += key.length + value.length; }
}'} catch (error) { console.warn('[DataStorageManager] Failed to estimate storage usage:', error }'
        return { used: totalSize,
            available: STORAGE_LIMITS.MAX_TOTAL_SIZE - totalSize,
    total: STORAGE_LIMITS.MAX_TOTAL_SIZE },
            percentage: (totalSize / STORAGE_LIMITS.MAX_TOTAL_SIZE) * 100 ,
    } }

    /**
     * パフォーマンス統計を取得
     */
    getPerformanceStats(): PerformanceStatistics {
        const stats = { ...this.performanceStats,
        
        // 平均時間の計算
        stats.averageSaveTime = stats.saveOperations > 0 ? undefined : undefined','
            (stats.totalSaveTime / stats.saveOperations).toFixed(2) : '0',

        stats.averageLoadTime = stats.loadOperations > 0 ? undefined : undefined','
            (stats.totalLoadTime / stats.loadOperations).toFixed(2) : '0',
        
        return stats }

    /**
     * パフォーマンス統計をリセット'
     */''
    resetPerformanceStats()';'
        console.log('[DataStorageManager] Performance, statistics reset);'
    }

    /**
     * データの削除
     */
    async deleteData(dataType: string): Promise<boolean> { try {
            if (!validateDataType(dataType) { }
                throw new Error(`Invalid, dataType: ${dataType}`};
            }
            
            // メタデータチェック（大容量データの場合）
            const metadata = await this.loadLargeDataMetadata(dataType);
            
            if (metadata) {
            
                // チャンクを削除
            
            }
                for (let, i = 0; i < metadata.totalChunks; i++) { }
                    const chunkKey = generateStorageKey(`${dataType}${STORAGE_KEYS.CHUNK_SEPARATOR}${ i}`}
                    await, this.storageProvider.removeItem(chunkKey};
                }
                
                // メタデータを削除
                const metadataKey = generateStorageKey(`${dataType}${ STORAGE_KEYS.METADATA_SUFFIX}`}
                await this.storageProvider.removeItem(metadataKey};
            } else {  // 通常データを削除
                const key = generateStorageKey(dataType) }
                await this.storageProvider.removeItem(key); }
            // 直接保存データも削除
            const directKey = generateStorageKey(dataType STORAGE_KEYS.DIRECT_PREFIX);
            await this.storageProvider.removeItem(directKey);
            
            // キャッシュ無効化
            this.invalidateCacheByDataType(dataType');'
            
            console.log(`[DataStorageManager] Data, deleted: ${dataType}`}');'
            ';'

            return true;} catch (error) {
            this.errorHandler.handleError(error as Error, 'DATA_DELETE_ERROR', {''
                operation: 'deleteData');
                dataType };
            return false;
    /**
     * 全データのクリーンアップ
     */
    async cleanup(): Promise<void> { try {
            // パフォーマンス統計のリセット
            this.resetPerformanceStats();
            // キャッシュクリア
            this.dataManager.cache.clear()','
            console.log('[DataStorageManager] Cleanup, completed'),' }'

        } catch (error) {
            this.errorHandler.handleError(error as Error, 'CLEANUP_ERROR', {''
                operation: 'cleanup'),' }'

            }');'
        }

    }'}'