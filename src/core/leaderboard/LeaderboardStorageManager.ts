/**
 * LeaderboardStorageManager
 * リーダーボードのデータ永続化、キャッシュ管理、バックアップ・復旧を担当
 */

// 型定義
export interface LeaderboardManager { data: LeaderboardData,
    config: LeaderboardConfig,
    storageKey: string,
    version?: string;
    dataProcessor: DataProcessor,
    initializeDefaultLeaderboards: () => void,
    getLeaderboard: (key: string, limit: number) => any; }
}

export interface LeaderboardData { leaderboards: Record<string, Leaderboard>,
    periodLeaderboards?: PeriodLeaderboards;
    playerHistory?: Record<string, PlayerHistory>;
    lastUpdated: number,
    version: string,
    metadata?: DataMetadata;
    }
}

export interface Leaderboard { entries: ScoreEntry[],
    lastUpdated: number,
    metadata?: LeaderboardMetadata;
    }
}

export interface ScoreEntry { score: number,
    playerName: string,
    timestamp: number,
    stageId?: string;
    checksum?: string;
    metadata?: ScoreMetadata;
    }
}

export interface PeriodLeaderboards { daily?: Record<string, PeriodBoard>;
    weekly?: Record<string, PeriodBoard>;
    monthly?: Record<string, PeriodBoard>;
    yearly?: Record<string, PeriodBoard>; }
}

export interface PeriodBoard { entries: ScoreEntry[],
    endDate?: number;
    startDate?: number;
    metadata?: PeriodBoardMetadata;
    }
}

export interface PlayerHistory { scores: PlayerScore[],
    bestScore: number,
    totalGames: number,
    averageScore: number,
    metadata?: PlayerMetadata;
    }
}

export interface PlayerScore { score: number,
    timestamp: number,
    stageId?: string;
    metadata?: ScoreMetadata;
    }
}

export interface ScoreMetadata { difficulty?: string;
    gameMode?: string;
    duration?: number;
    combo?: number;
    accuracy?: number; }
}

export interface PlayerMetadata { firstPlayDate: number,
    lastPlayDate: number,
    favoriteStage?: string; }
}

export interface LeaderboardMetadata { createdAt: number,
    updatedAt: number,
    totalEntries: number,
    uniquePlayers: number; }
}

export interface PeriodBoardMetadata { period: PeriodType,
    periodKey: string,
    totalPlayers: number,
    averageScore: number; }
}

export interface DataMetadata { createdAt: number,
    updatedAt: number,
    totalBoards: number,
    backupCount: number; }
}

export interface LeaderboardConfig { cacheMaxAge?: number;
    maxCacheSize?: number;
    enableBackups?: boolean;
    backupRetentionDays?: number;
    compressionEnabled?: boolean;
    encryptionEnabled?: boolean; }
}

export interface DataProcessor { performIntegrityCheck: (data: LeaderboardData) => IntegrityCheckResult; }
}

export interface IntegrityCheckResult { isValid: boolean,
    errors: string[],
    warnings: string[],
    statistics: ValidationStatistics;
    }
}

export interface ValidationStatistics { totalEntries: number,
    validEntries: number,
    invalidEntries: number,
    duplicateEntries: number; }
}

export interface CacheEntry<T = any> { data: T,
    timestamp: number,
    accessCount?: number;
    lastAccess?: number;
    ttl?: number; }
}

export interface BackupData { data: LeaderboardData,
    timestamp: number,
    version: string,
    metadata?: BackupMetadata;
    }
}

export interface BackupMetadata { createdBy: string,
    reason: BackupReason,
    dataSize: number,
    compressionRatio?: number; }
}

export interface StorageOperationResult { success: boolean,
    error?: string;
    data?: any;
    metadata?: OperationMetadata;
    }
}

export interface OperationMetadata { operationType: StorageOperation,
    timestamp: number,
    dataSize: number,
    duration: number; }
}

export interface MemoryUsageInfo { totalSize: number,
    dataSize: number,
    cacheSize: number,
    cacheEntries: number,
    lastCacheCleanup: number,
    memoryPressure: MemoryPressureLevel;
    }
}

export interface RetentionPeriods { daily: number,
    weekly: number,
    monthly: number,
    yearly: number; }
}

export interface CacheStatistics { size: number,
    hitRate: number,
    missRate: number,
    totalRequests: number,
    totalHits: number,
    totalMisses: number,
    averageAccessTime: number; }
}

export interface CompressionResult { originalSize: number,
    compressedSize: number,
    compressionRatio: number,
    algorithm: CompressionAlgorithm;
    }
}

// 列挙型
export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly';''
export type StorageOperation = 'load' | 'save' | 'backup' | 'restore' | 'migrate' | 'cleanup';''
export type BackupReason = 'scheduled' | 'manual' | 'pre_migration' | 'pre_update' | 'error_recovery';''
export type MemoryPressureLevel = 'low' | 'medium' | 'high' | 'critical';''
export type CompressionAlgorithm = 'gzip' | 'lz4' | 'brotli' | 'none';''
export type CacheStrategy = 'lru' | 'lfu' | 'fifo' | 'ttl';

// 定数
export const DEFAULT_CACHE_MAX_AGE = 300000; // 5分
export const DEFAULT_MAX_CACHE_SIZE = 100;'
export const DEFAULT_CLEANUP_INTERVAL = 60000; // 1分''
export const DEFAULT_PRELOAD_QUERIES = ['global', 'daily', 'weekly', 'monthly'];
export const UNUSED_CACHE_THRESHOLD = 600000; // 10分

export const DEFAULT_RETENTION_PERIODS: RetentionPeriods = { daily: 30 * 24 * 60 * 60 * 1000,      // 30日
    weekly: 12 * 7 * 24 * 60 * 60 * 1000,  // 12週;
    monthly: 12 * 30 * 24 * 60 * 60 * 1000, // 12ヶ月;
    yearly: 5 * 365 * 24 * 60 * 60 * 1000   // 5年 }
},

export const MEMORY_PRESSURE_THRESHOLDS = { low: 1024 * 1024,      // 1MB
    medium: 5 * 1024 * 1024, // 5MB;
    high: 10 * 1024 * 1024,  // 10MB;
    critical: 20 * 1024 * 1024 // 20MB }
},

export const DEFAULT_CONFIG: Partial<LeaderboardConfig> = { cacheMaxAge: DEFAULT_CACHE_MAX_AGE,
    maxCacheSize: DEFAULT_MAX_CACHE_SIZE,
    enableBackups: true,
    backupRetentionDays: 30,
    compressionEnabled: true,
    encryptionEnabled: false }
},
';
// ユーティリティ関数''
export function isValidLeaderboardData(data: any'): data is LeaderboardData { return data &&''
           typeof data === 'object' &&'';
           typeof data.leaderboards === 'object' &&'';
           typeof data.lastUpdated === 'number' &&'';
           typeof data.version === 'string'; }
}'
'';
export function isValidBackupData(data: any'): data is BackupData { return data &&''
           typeof data === 'object' &&'';
           isValidLeaderboardData(data.data') &&'';
           typeof data.timestamp === 'number' &&'';
           typeof data.version === 'string'; }
}
';
export function calculateMemoryPressure(totalSize: number): MemoryPressureLevel { ''
    if (totalSize >= MEMORY_PRESSURE_THRESHOLDS.critical') return 'critical';''
    if (totalSize >= MEMORY_PRESSURE_THRESHOLDS.high') return 'high';''
    if (totalSize >= MEMORY_PRESSURE_THRESHOLDS.medium') return 'medium';''
    return 'low'; }
}
';
export function formatBytes(bytes: number): string { ''
    if (bytes === 0') return '0 B';'
    const k = 1024;''
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k); }
    return `${parseFloat((bytes / Math.pow(k, i).toFixed(2)})} ${sizes[i]}`;
}

export function generateStorageKey(base: string, suffix?: string): string {'
    const key = suffix ? `${base}_${suffix}` : base;''
    return key.toLowerCase(').replace(/[^a-z0-9_]/g, '_');
}'
'';
export function isLocalStorageAvailable(''';
        const testKey = '__storage_test__';')'
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);'
        return true;''
    } catch (error') { return false; }
    }
}'
'';
export function compressData(data: string, algorithm: CompressionAlgorithm = 'gzip''): string { // 簡単な実装：実際のプロジェクトではより高度な圧縮ライブラリを使用''
    if (algorithm === 'none') return data;
    
    // Base64エンコードによる簡易圧縮シミュレーション
    try {'
        return btoa(unescape(encodeURIComponent(data));' }'
    } catch (error') { ''
        console.warn('Compression failed, returning original data'');
        return data; }
    }
}'
'';
export function decompressData(compressedData: string, algorithm: CompressionAlgorithm = 'gzip''): string { ''
    if (algorithm === 'none') return compressedData;
    
    try {'
        return decodeURIComponent(escape(atob(compressedData));' }'
    } catch (error') { ''
        console.warn('Decompression failed, returning original data');
        return compressedData; }
    }
}

export class LeaderboardStorageManager {
    private leaderboardManager: LeaderboardManager;
    private cache: Map<string, CacheEntry> = new Map();
    private lastCacheCleanup: number = Date.now();
    private cacheStatistics: CacheStatistics = {
        size: 0;
        hitRate: 0,
        missRate: 0,
        totalRequests: 0,
        totalHits: 0,
        totalMisses: 0,
        averageAccessTime: 0 }
    },
    private cleanupIntervalId: NodeJS.Timeout | null = null;
    constructor(leaderboardManager: LeaderboardManager) {

        this.leaderboardManager = leaderboardManager;

    }
    }
        this.setupAdvancedCaching(); }
    }

    /**
     * データのロード
     */
    async load(): Promise<StorageOperationResult> { const startTime = performance.now();
        ';
        try {''
            if (!isLocalStorageAvailable()') {''
                throw new Error('localStorage is not available'); }
            }

            const savedData = localStorage.getItem(this.leaderboardManager.storageKey);
            
            if(savedData) {
            
                const data = JSON.parse(savedData);
                
                // データマイグレーション
                const migratedData = this.migrateData(data);
                
                // 整合性チェック
                const integrityResult = this.leaderboardManager.dataProcessor.performIntegrityCheck(migratedData);'
                '';
                if (!integrityResult.isValid') {''
                    console.warn('Leaderboard data integrity issues found:', integrityResult.errors);
                    
                    // バックアップからの復旧を試行'
                    const restoreResult = await this.attemptBackupRestore();''
                    if (restoreResult.success') {'
            
            }'
                        return this.createOperationResult('load', true, undefined, startTime); }
                    }
                    ';
                    // 復旧失敗時は空データで初期化''
                    this.initializeEmptyData('')';
                    return this.createOperationResult('load', false, 'Data integrity issues, initialized empty data', startTime');
                }
                ';
                this.leaderboardManager.data = migratedData;''
                console.log('Leaderboard data loaded successfully'');''
                return this.createOperationResult('load', true, migratedData, startTime);'
            } else {  ''
                this.initializeEmptyData('')';
                console.log('No saved leaderboard data found, initialized empty data'');' }'
                return this.createOperationResult('load', true, this.leaderboardManager.data, startTime);' }'
            } catch (error') { ''
            const errorMessage = error instanceof Error ? error.message: 'Unknown error','';
            console.error('Error loading leaderboard data:', errorMessage);
            
            // エラー時はバックアップからの復旧を試行
            const restoreResult = await this.attemptBackupRestore();
            if(!restoreResult.success) {'
                '';
                this.initializeEmptyData('');
            }'
            return this.createOperationResult('load', false, errorMessage, startTime); }
        }
    }

    /**
     * データの保存
     */
    async save(): Promise<StorageOperationResult> { const startTime = performance.now();
        ';
        try {''
            if (!isLocalStorageAvailable()') {''
                throw new Error('localStorage is not available'); }
            }
';
            // バックアップの作成''
            if(this.leaderboardManager.config.enableBackups') {'
                ';
            }'
                await this.createBackup('pre_save'); }
            }
            
            const dataToSave = JSON.stringify(this.leaderboardManager.data);
            
            // 圧縮が有効な場合
            let finalData = dataToSave;
            if (this.leaderboardManager.config.compressionEnabled) { finalData = compressData(dataToSave); }
            }'
            '';
            localStorage.setItem(this.leaderboardManager.storageKey, finalData');'
            '';
            console.log('Leaderboard data saved successfully'');''
            return this.createOperationResult('save', true, undefined, startTime, finalData.length);''
        } catch (error') { ''
            const errorMessage = error instanceof Error ? error.message: 'Unknown error','';
            console.error('Error saving leaderboard data:', errorMessage');''
            return this.createOperationResult('save', false, errorMessage, startTime); }
        }
    }

    /**
     * 非同期保存
     */
    async saveAsync(): Promise<StorageOperationResult> { return new Promise((resolve) => { 
            // ブラウザの次のイベントループで実行
            setTimeout(async () => {
                const result = await this.save(); }
                resolve(result); }'
            }, 0);''
        }');
    }

    /**
     * バックアップの作成'
     */''
    async createBackup(reason: BackupReason = 'manual'): Promise<StorageOperationResult> { const startTime = performance.now();
        ';
        try {''
            if (!isLocalStorageAvailable()') {''
                throw new Error('localStorage is not available''); }
            }'
'';
            const backupKey = generateStorageKey(this.leaderboardManager.storageKey, 'backup');
            const timestamp = Date.now();
            ';
            const backupData: BackupData = { ''
                data: JSON.parse(JSON.stringify(this.leaderboardManager.data)'), // ディープコピー';
                timestamp: timestamp,'';
                version: this.leaderboardManager.version || '1.0.0',';
                metadata: {''
                    createdBy: 'LeaderboardStorageManager',
                    reason,
                    dataSize: JSON.stringify(this.leaderboardManager.data).length }
                }
            },
            
            const serializedBackup = JSON.stringify(backupData);
            
            // 圧縮が有効な場合
            let finalBackup = serializedBackup;
            if(this.leaderboardManager.config.compressionEnabled) {
                finalBackup = compressData(serializedBackup);
                if (backupData.metadata) {
            }
                    backupData.metadata.compressionRatio = finalBackup.length / serializedBackup.length; }
                }
            }'
            '';
            localStorage.setItem(backupKey, finalBackup');''
            console.log('Backup created successfully'');''
            return this.createOperationResult('backup', true, backupData, startTime, finalBackup.length);''
        } catch (error') { ''
            const errorMessage = error instanceof Error ? error.message: 'Unknown error','';
            console.error('Error creating backup:', errorMessage');''
            return this.createOperationResult('backup', false, errorMessage, startTime); }
        }
    }

    /**
     * バックアップからの復旧
     */
    async attemptBackupRestore(): Promise<StorageOperationResult> { const startTime = performance.now();
        ';
        try {''
            if (!isLocalStorageAvailable()') {''
                throw new Error('localStorage is not available''); }
            }'
'';
            const backupKey = generateStorageKey(this.leaderboardManager.storageKey, 'backup');
            const backupData = localStorage.getItem(backupKey);'
            '';
            if(!backupData') {'
                '';
                console.log('No backup data found'');'
            }'
                return this.createOperationResult('restore', false, 'No backup data found', startTime); }
            }
            
            // 圧縮されている場合は展開
            let decompressedData = backupData;
            if (this.leaderboardManager.config.compressionEnabled) { decompressedData = decompressData(backupData); }
            }
            
            const backup: BackupData = JSON.parse(decompressedData),
            ';
            // バックアップデータの検証''
            if (!isValidBackupData(backup)') { ''
                console.warn('Invalid backup data structure'');''
                return this.createOperationResult('restore', false, 'Invalid backup data structure', startTime); }
            }
            
            // 整合性チェック
            const integrityResult = this.leaderboardManager.dataProcessor.performIntegrityCheck(backup.data);'
            '';
            if(!integrityResult.isValid') {'
                '';
                console.warn('Backup data also has integrity issues'');'
            }'
                return this.createOperationResult('restore', false, 'Backup data integrity issues', startTime'); }
            }
            ';
            this.leaderboardManager.data = backup.data;''
            console.log('Data restored from backup successfully'');''
            return this.createOperationResult('restore', true, backup.data, startTime);''
        } catch (error') { ''
            const errorMessage = error instanceof Error ? error.message: 'Unknown error','';
            console.error('Error restoring from backup:', errorMessage');''
            return this.createOperationResult('restore', false, errorMessage, startTime); }
        }
    }

    /**
     * 空データの初期化
     */
    initializeEmptyData(): void { this.leaderboardManager.data = { }
            leaderboards: {},
            periodLeaderboards: {},'
            playerHistory: {},''
            lastUpdated: Date.now('')';
            version: this.leaderboardManager.version || '1.0.0');
            metadata: { )
                createdAt: Date.now(),
                updatedAt: Date.now(),
                totalBoards: 0,
                backupCount: 0 }
            }
        },
        
        // デフォルトリーダーボードの初期化
        this.leaderboardManager.initializeDefaultLeaderboards();
    }

    /**
     * データマイグレーション
     */'
    migrateData(data: any): LeaderboardData { // バージョン情報がない場合は古いバージョンとして扱う''
        if(!data.version') {'
            ';
        }'
            data.version = '1.0.0'; }
        }

        // 必要な構造が存在しない場合は追加
        if(!data.leaderboards) {
            
        }
            data.leaderboards = {};
        }

        if(!data.periodLeaderboards) {

            

        }
            data.periodLeaderboards = {};
        }

        if(!data.playerHistory) {

            

        }
            data.playerHistory = {};
        }

        data.lastUpdated = data.lastUpdated || Date.now();

        // メタデータの追加
        if(!data.metadata) {
            data.metadata = {
                createdAt: data.lastUpdated,
                updatedAt: Date.now(),
                totalBoards: Object.keys(data.leaderboards).length,
        }
                backupCount: 0 }
            },
        }

        return data as LeaderboardData;
    }

    /**
     * 期限切れ期間エントリのクリーンアップ
     */
    cleanupExpiredPeriodEntries(): number { const data = this.leaderboardManager.data;
        
        if(!data.periodLeaderboards) {
        
            
        
        }
            return 0; }
        }

        const now = Date.now();
        let cleanedCount = 0;

        for(const [period, boards] of Object.entries(data.periodLeaderboards) {

            if (!boards) continue;
            
            const retentionTime = DEFAULT_RETENTION_PERIODS[period as PeriodType] || DEFAULT_RETENTION_PERIODS.daily;
            
            for(const [key, board] of Object.entries(boards) {
                if (board && board.endDate && (now - board.endDate) > retentionTime) {
                    delete boards[key];

        }
                    cleanedCount++; }
                    console.log(`Cleaned up expired ${period} leaderboard: ${key)`});
                }
            }
        }

        return cleanedCount;
    }

    /**
     * キャッシュにリーダーボードを保存
     */
    cacheLeaderboard<T = any>(key: string, data: T, ttl?: number): void { const cacheEntry: CacheEntry<T> = {
            data: JSON.parse(JSON.stringify(data), // ディープコピー;
            timestamp: Date.now(),
            accessCount: 1,
            lastAccess: Date.now(),
            ttl: ttl }
        },
        
        this.cache.set(key, cacheEntry);
        this.updateCacheStatistics();
    }

    /**
     * キャッシュからリーダーボードを取得
     */
    getCachedLeaderboard<T = any>(key: string): T | null { const startTime = performance.now();
        this.cacheStatistics.totalRequests++;
        
        const cached = this.cache.get(key);
        
        if(!cached) {
        
            this.cacheStatistics.totalMisses++;
            this.updateCacheStatistics();
        
        }
            return null; }
        }

        const maxAge = cached.ttl || this.leaderboardManager.config.cacheMaxAge || DEFAULT_CACHE_MAX_AGE;
        
        if (Date.now() - cached.timestamp > maxAge) { this.cache.delete(key);
            this.cacheStatistics.totalMisses++;
            this.updateCacheStatistics();
            return null; }
        }

        // アクセス統計の更新
        cached.accessCount = (cached.accessCount || 0) + 1;
        cached.lastAccess = Date.now();
        
        this.cacheStatistics.totalHits++;
        this.cacheStatistics.averageAccessTime = ;
            (this.cacheStatistics.averageAccessTime + (performance.now() - startTime)) / 2;
        
        this.updateCacheStatistics();
        return cached.data as T;
    }

    /**
     * 関連キャッシュのクリア
     */
    clearRelevantCache(leaderboardKey: string): number { const keysToDelete: string[] = [],
        
        for(const [key] of this.cache.entries() {
        
            if(key.includes(leaderboardKey) {
        
        }
                keysToDelete.push(key); }
            }
        }
        
        keysToDelete.forEach(key => this.cache.delete(key);
        this.updateCacheStatistics();
        
        return keysToDelete.length;
    }

    /**
     * 期限切れキャッシュのクリア
     */
    clearExpiredCache(): number { const now = Date.now();
        const defaultMaxAge = this.leaderboardManager.config.cacheMaxAge || DEFAULT_CACHE_MAX_AGE;
        const keysToDelete: string[] = [],

        for(const [key, cached] of this.cache.entries() {

            const maxAge = cached.ttl || defaultMaxAge;
            if (now - cached.timestamp > maxAge) {

        }
                keysToDelete.push(key); }
            }
        }

        keysToDelete.forEach(key => this.cache.delete(key);
        
        if(keysToDelete.length > 0) {
        
            
        
        }
            console.log(`Cleared ${keysToDelete.length) expired cache entries`});
        }
        
        this.lastCacheCleanup = now;
        this.updateCacheStatistics();
        
        return keysToDelete.length;
    }

    /**
     * キャッシュサイズの制限
     */
    limitCacheSize(): number { const maxCacheSize = this.leaderboardManager.config.maxCacheSize || DEFAULT_MAX_CACHE_SIZE;
        
        if(this.cache.size <= maxCacheSize) {
        
            
        
        }
            return 0; }
        }

        // LRU: 最も古いエントリから削除
        const entries = Array.from(this.cache.entries();
        entries.sort((a, b) => {  const aLastAccess = a[1].lastAccess || a[1].timestamp;
            const bLastAccess = b[1].lastAccess || b[1].timestamp; }
            return aLastAccess - bLastAccess; }
        });
        
        const toDelete = entries.slice(0, this.cache.size - maxCacheSize);
        toDelete.forEach(([key]) => this.cache.delete(key);
        
        console.log(`Limited cache size: removed ${ toDelete.length) oldest entries`), }
        this.updateCacheStatistics(});
        
        return toDelete.length;
    }

    /**
     * メモリ使用量の取得
     */
    getMemoryUsage(): MemoryUsageInfo { const dataSize = JSON.stringify(this.leaderboardManager.data).length;
        const cacheSize = JSON.stringify(Array.from(this.cache.entries()).length;
        const totalSize = dataSize + cacheSize;
        
        return { totalSize,
            dataSize,
            cacheSize,
            cacheEntries: this.cache.size,
            lastCacheCleanup: this.lastCacheCleanup, };
            memoryPressure: calculateMemoryPressure(totalSize); }
        };
    }

    /**
     * 高度なキャッシュ設定
     */
    setupAdvancedCaching(): void { // 定期的なキャッシュクリーンアップ
        if(this.cleanupIntervalId) {
            
        }
            clearInterval(this.cleanupIntervalId); }
        }
        
        this.cleanupIntervalId = setInterval(() => {  this.clearExpiredCache(); }'
            this.limitCacheSize();' }'
        }, DEFAULT_CLEANUP_INTERVAL');'
        '';
        console.log('Advanced caching setup completed');
    }

    /**
     * 一般的なクエリの事前ロード
     */
    async preloadCommonQueries(): Promise<void> { try {
            // よく使用されるリーダーボードの事前キャッシュ
            for(const key of DEFAULT_PRELOAD_QUERIES) {
                if (this.leaderboardManager.data.leaderboards[key]) {
            }'
                    const data = this.leaderboardManager.getLeaderboard(key, 10);' }'
                    this.cacheLeaderboard(`leaderboard_${key)_10`, data'});
                }
            }'
            '';
            console.log('Common queries preloaded');''
        } catch (error') { ''
            console.error('Error preloading common queries:', error); }
        }
    }

    /**
     * キャッシュの最適化
     */
    optimizeCache(): number { let optimizedCount = 0;
        
        // 期限切れエントリのクリア
        optimizedCount += this.clearExpiredCache();
        
        // サイズ制限の適用
        optimizedCount += this.limitCacheSize();
        
        // 使用頻度の低いエントリの削除
        const now = Date.now();
        const keysToDelete: string[] = [],
        
        for(const [key, cached] of this.cache.entries() {
        
            const lastAccess = cached.lastAccess || cached.timestamp;
            if (now - lastAccess > UNUSED_CACHE_THRESHOLD) {
        
        }
                keysToDelete.push(key); }
            }
        }
        
        keysToDelete.forEach(key = > this.cache.delete(key);
        optimizedCount += keysToDelete.length;
        
        console.log(`Cache optimized: removed ${ optimizedCount) total entries`) }
        this.updateCacheStatistics(});
        
        return optimizedCount;
    }

    /**
     * キャッシュ統計の更新
     */
    private updateCacheStatistics(): void { this.cacheStatistics.size = this.cache.size;
        
        if(this.cacheStatistics.totalRequests > 0) {
        
            this.cacheStatistics.hitRate = this.cacheStatistics.totalHits / this.cacheStatistics.totalRequests;
        
        }
            this.cacheStatistics.missRate = this.cacheStatistics.totalMisses / this.cacheStatistics.totalRequests; }
        }
    }

    /**
     * 操作結果の作成
     */
    private createOperationResult(;
        operation: StorageOperation,
        success: boolean,
        data?: any,);
        startTime?: number)';
        dataSize?: number'';
    '): StorageOperationResult { const result: StorageOperationResult = {
            success,
            data }
        };'
'';
        if(!success && typeof data === 'string') {
            result.error = data;
        }
            result.data = undefined; }
        }

        if(startTime !== undefined) {

            result.metadata = {
                operationType: operation,
                timestamp: Date.now(),
                dataSize: dataSize || (data ? JSON.stringify(data).length : 0),

        }
                duration: performance.now() - startTime }
            },
        }

        return result;
    }

    /**
     * キャッシュ統計の取得
     */
    getCacheStatistics(): CacheStatistics {
        return { ...this.cacheStatistics };
    }

    /**
     * 全キャッシュのクリア
     */'
    clearAllCache(): void { ''
        this.cache.clear('')';
        console.log('All cache cleared'); }
    }

    /**
     * クリーンアップ
     */
    destroy(): void { if (this.cleanupIntervalId) {
            clearInterval(this.cleanupIntervalId);
            this.cleanupIntervalId = null; }
        }'
        '';
        this.clearAllCache('')';
        console.log('[LeaderboardStorageManager] Destroyed'');'
    }''
}