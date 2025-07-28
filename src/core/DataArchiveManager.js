/**
 * データアーカイブ管理クラス
 * 古い統計データのアーカイブ、検索、復元機能を提供する
 */
export class DataArchiveManager {
    constructor(compressionManager) {
        this.compressionManager = compressionManager;
        
        // アーカイブ設定
        this.config = {
            archiving: {
                enabled: true,
                autoArchive: true,
                archiveThreshold: 30000, // 30000レコード以上でアーカイブ
                batchSize: 5000,
                compressionEnabled: true
            },
            retention: {
                activeDays: 90, // 90日間はアクティブデータ
                archiveDays: 365, // 365日間はアーカイブ保持
                maxArchiveDays: 1095, // 最大3年間保持
                permanentDelete: false // 永続削除を無効化
            },
            storage: {
                maxArchiveSize: 500 * 1024 * 1024, // 500MB
                indexEnabled: true,
                encryptionEnabled: false,
                backupEnabled: true
            },
            performance: {
                maxConcurrentOperations: 3,
                operationTimeout: 300000, // 5分
                indexRebuildThreshold: 1000
            }
        };
        
        // アーカイブ状態管理
        this.archiveState = {
            isArchiving: false,
            isRestoring: false,
            operationQueue: [],
            statistics: {
                totalArchived: 0,
                totalRestored: 0,
                totalSize: 0,
                lastArchive: null,
                lastRestore: null
            }
        };
        
        // アーカイブストレージ（LocalStorageベース）
        this.archiveStorage = new Map();
        this.archiveIndex = new Map();
        this.archiveMetadata = new Map();
        
        // アーカイブ戦略
        this.archiveStrategies = new Map([
            ['age', this.archiveByAge.bind(this)],
            ['size', this.archiveBySize.bind(this)],
            ['frequency', this.archiveByFrequency.bind(this)],
            ['importance', this.archiveByImportance.bind(this)]
        ]);
        
        // 検索インデックス
        this.searchIndex = {
            byDate: new Map(),
            byType: new Map(),
            bySize: new Map(),
            byMetadata: new Map()
        };
        
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        this.loadArchiveData();
        this.buildSearchIndex();
        this.setupArchiveScheduler();
    }
    
    /**
     * アーカイブデータの読み込み
     */
    loadArchiveData() {
        try {
            // LocalStorageからアーカイブデータを読み込み
            const archiveKeys = Object.keys(localStorage).filter(key => 
                key.startsWith('archive_') || key.startsWith('archive_index_') || key.startsWith('archive_meta_')
            );
            
            archiveKeys.forEach(key => {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    
                    if (key.startsWith('archive_index_')) {
                        const archiveId = key.replace('archive_index_', '');
                        this.archiveIndex.set(archiveId, data);
                    } else if (key.startsWith('archive_meta_')) {
                        const archiveId = key.replace('archive_meta_', '');
                        this.archiveMetadata.set(archiveId, data);
                    } else if (key.startsWith('archive_')) {
                        const archiveId = key.replace('archive_', '');
                        this.archiveStorage.set(archiveId, data);
                    }
                } catch (error) {
                    console.warn(`Failed to load archive data ${key}:`, error);
                }
            });
            
            console.debug(`Loaded ${this.archiveStorage.size} archives`);
        } catch (error) {
            console.error('Failed to load archive data:', error);
        }
    }
    
    /**
     * アーカイブスケジューラーの設定
     */
    setupArchiveScheduler() {
        if (!this.config.archiving.autoArchive) return;
        
        // 毎日深夜2時にアーカイブチェック
        const scheduleNextArchive = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(2, 0, 0, 0);
            
            const timeUntilNextRun = tomorrow.getTime() - now.getTime();
            
            setTimeout(() => {
                this.performScheduledArchive();
                scheduleNextArchive(); // 次の実行をスケジュール
            }, timeUntilNextRun);
        };
        
        scheduleNextArchive();
        
        // 週次メンテナンス（日曜日深夜3時）
        const scheduleWeeklyMaintenance = () => {
            const now = new Date();
            const nextSunday = new Date(now);
            nextSunday.setDate(now.getDate() + (7 - now.getDay()));
            nextSunday.setHours(3, 0, 0, 0);
            
            const timeUntilNextRun = nextSunday.getTime() - now.getTime();
            
            setTimeout(() => {
                this.performMaintenance();
                scheduleWeeklyMaintenance();
            }, timeUntilNextRun);
        };
        
        scheduleWeeklyMaintenance();
    }
    
    /**
     * データのアーカイブ
     */
    async archiveData(data, dataType, options = {}) {
        if (this.archiveState.isArchiving) {
            return this.queueArchiveOperation('archive', { data, dataType, options });
        }
        
        this.archiveState.isArchiving = true;
        const startTime = Date.now();
        
        try {
            // アーカイブ戦略の決定
            const strategy = options.strategy || this.determineArchiveStrategy(data, dataType);
            
            // データの前処理
            const preprocessedData = await this.preprocessDataForArchive(data, dataType, options);
            
            // 圧縮の適用
            let archiveData = preprocessedData;
            if (this.config.archiving.compressionEnabled && this.compressionManager) {
                const compressionResult = await this.compressionManager.compressData(
                    preprocessedData, dataType, { level: 5 }
                );
                if (compressionResult.compressed) {
                    archiveData = compressionResult.data;
                }
            }
            
            // アーカイブIDの生成
            const archiveId = this.generateArchiveId(dataType);
            
            // メタデータの作成
            const metadata = this.createArchiveMetadata(archiveId, dataType, preprocessedData, archiveData, strategy, options);
            
            // ストレージに保存
            await this.storeArchiveData(archiveId, archiveData, metadata);
            
            // インデックスの更新
            this.updateSearchIndex(archiveId, metadata);
            
            // 統計の更新
            this.updateArchiveStatistics(metadata, 'archive');
            
            const result = {
                archiveId,
                success: true,
                metadata,
                originalSize: this.calculateDataSize(data),
                archivedSize: this.calculateDataSize(archiveData),
                compressionRatio: this.calculateDataSize(archiveData) / this.calculateDataSize(data),
                processingTime: Date.now() - startTime
            };
            
            console.debug(`Archived data ${archiveId}: ${result.originalSize} -> ${result.archivedSize} bytes`);
            return result;
            
        } catch (error) {
            console.error('Data archiving failed:', error);
            throw error;
        } finally {
            this.archiveState.isArchiving = false;
            this.processOperationQueue();
        }
    }
    
    /**
     * アーカイブ戦略の決定
     */
    determineArchiveStrategy(data, dataType) {
        // データ量に基づく戦略選択
        const dataSize = this.calculateDataSize(data);
        
        if (dataSize > 10 * 1024 * 1024) { // 10MB以上
            return 'size';
        }
        
        // データ年齢に基づく戦略
        if (this.hasTimestampData(data)) {
            return 'age';
        }
        
        // アクセス頻度に基づく戦略
        if (this.hasAccessMetadata(data)) {
            return 'frequency';
        }
        
        return 'age'; // デフォルト
    }
    
    /**
     * タイムスタンプデータの存在確認
     */
    hasTimestampData(data) {
        if (Array.isArray(data)) {
            return data.some(item => 
                item && typeof item === 'object' && 
                Object.keys(item).some(key => 
                    key.includes('timestamp') || key.includes('date') || key.includes('time')
                )
            );
        }
        return false;
    }
    
    /**
     * アクセスメタデータの存在確認
     */
    hasAccessMetadata(data) {
        if (typeof data === 'object' && data.accessCount !== undefined) {
            return true;
        }
        return false;
    }
    
    /**
     * アーカイブ用データの前処理
     */
    async preprocessDataForArchive(data, dataType, options) {
        let processed = data;
        
        // データクリーニング
        processed = this.cleanDataForArchive(processed);
        
        // 機密データの除去
        if (options.removeSensitiveData) {
            processed = this.removeSensitiveData(processed);
        }
        
        // データ整合性チェック
        this.validateDataIntegrity(processed);
        
        return processed;
    }
    
    /**
     * アーカイブ用データクリーニング
     */
    cleanDataForArchive(data) {
        if (Array.isArray(data)) {
            return data.filter(item => item != null).map(item => this.cleanDataForArchive(item));
        }
        
        if (typeof data === 'object' && data !== null) {
            const cleaned = {};
            Object.entries(data).forEach(([key, value]) => {
                // 一時的なフィールドを除去
                if (!key.startsWith('_temp') && !key.startsWith('_cache')) {
                    cleaned[key] = this.cleanDataForArchive(value);
                }
            });
            return cleaned;
        }
        
        return data;
    }
    
    /**
     * 機密データの除去
     */
    removeSensitiveData(data) {
        const sensitiveFields = ['password', 'token', 'key', 'secret', 'private'];
        
        if (Array.isArray(data)) {
            return data.map(item => this.removeSensitiveData(item));
        }
        
        if (typeof data === 'object' && data !== null) {
            const sanitized = {};
            Object.entries(data).forEach(([key, value]) => {
                const isSensitive = sensitiveFields.some(field => 
                    key.toLowerCase().includes(field)
                );
                
                if (!isSensitive) {
                    sanitized[key] = this.removeSensitiveData(value);
                }
            });
            return sanitized;
        }
        
        return data;
    }
    
    /**
     * データ整合性の検証
     */
    validateDataIntegrity(data) {
        // 基本的な整合性チェック
        if (data === null || data === undefined) {
            throw new Error('Data is null or undefined');
        }
        
        // 循環参照のチェック
        try {
            JSON.stringify(data);
        } catch (error) {
            throw new Error('Data contains circular references');
        }
    }
    
    /**
     * アーカイブIDの生成
     */
    generateArchiveId(dataType) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `${dataType}_${timestamp}_${random}`;
    }
    
    /**
     * アーカイブメタデータの作成
     */
    createArchiveMetadata(archiveId, dataType, originalData, archivedData, strategy, options) {
        return {
            id: archiveId,
            dataType,
            strategy,
            createdAt: Date.now(),
            originalSize: this.calculateDataSize(originalData),
            archivedSize: this.calculateDataSize(archivedData),
            compressionRatio: this.calculateDataSize(archivedData) / this.calculateDataSize(originalData),
            recordCount: this.countRecords(originalData),
            version: '1.0',
            options: { ...options },
            checksums: {
                original: this.calculateChecksum(originalData),
                archived: this.calculateChecksum(archivedData)
            },
            dateRange: this.extractDateRange(originalData),
            tags: this.generateTags(originalData, dataType)
        };
    }
    
    /**
     * レコード数のカウント
     */
    countRecords(data) {
        if (Array.isArray(data)) {
            return data.length;
        }
        
        if (typeof data === 'object' && data !== null) {
            let count = 0;
            Object.values(data).forEach(value => {
                if (Array.isArray(value)) {
                    count += value.length;
                }
            });
            return count;
        }
        
        return 1;
    }
    
    /**
     * チェックサムの計算
     */
    calculateChecksum(data) {
        const str = JSON.stringify(data);
        let hash = 0;
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32bit integer
        }
        
        return hash.toString(16);
    }
    
    /**
     * 日付範囲の抽出
     */
    extractDateRange(data) {
        const timestamps = this.extractTimestamps(data);
        
        if (timestamps.length === 0) {
            return null;
        }
        
        return {
            start: Math.min(...timestamps),
            end: Math.max(...timestamps),
            count: timestamps.length
        };
    }
    
    /**
     * タイムスタンプの抽出
     */
    extractTimestamps(data) {
        const timestamps = [];
        
        const extract = (obj) => {
            if (Array.isArray(obj)) {
                obj.forEach(item => extract(item));
            } else if (typeof obj === 'object' && obj !== null) {
                Object.entries(obj).forEach(([key, value]) => {
                    if ((key.includes('timestamp') || key.includes('date') || key.includes('time')) &&
                        typeof value === 'number' && value > 1000000000000) {
                        timestamps.push(value);
                    } else if (typeof value === 'object') {
                        extract(value);
                    }
                });
            }
        };
        
        extract(data);
        return timestamps;
    }
    
    /**
     * タグの生成
     */
    generateTags(data, dataType) {
        const tags = [dataType];
        
        // データ構造に基づくタグ
        if (Array.isArray(data)) {
            tags.push('array');
            if (data.length > 1000) tags.push('large');
        }
        
        // 日付に基づくタグ
        const dateRange = this.extractDateRange(data);
        if (dateRange) {
            const now = Date.now();
            const daysDiff = (now - dateRange.end) / (24 * 60 * 60 * 1000);
            
            if (daysDiff < 7) tags.push('recent');
            else if (daysDiff < 30) tags.push('current');
            else if (daysDiff < 90) tags.push('old');
            else tags.push('ancient');
        }
        
        return tags;
    }
    
    /**
     * アーカイブデータの保存
     */
    async storeArchiveData(archiveId, data, metadata) {
        try {
            // メインストレージ（実際の実装ではより適切なストレージを使用）
            this.archiveStorage.set(archiveId, data);
            this.archiveMetadata.set(archiveId, metadata);
            
            // LocalStorageに永続化
            localStorage.setItem(`archive_${archiveId}`, JSON.stringify(data));
            localStorage.setItem(`archive_meta_${archiveId}`, JSON.stringify(metadata));
            
            // バックアップの作成
            if (this.config.storage.backupEnabled) {
                await this.createBackup(archiveId, data, metadata);
            }
            
        } catch (error) {
            console.error(`Failed to store archive ${archiveId}:`, error);
            throw error;
        }
    }
    
    /**
     * バックアップの作成
     */
    async createBackup(archiveId, data, metadata) {
        try {
            const backupData = {
                archiveId,
                data,
                metadata,
                backupCreated: Date.now()
            };
            
            localStorage.setItem(`archive_backup_${archiveId}`, JSON.stringify(backupData));
        } catch (error) {
            console.warn(`Failed to create backup for ${archiveId}:`, error);
        }
    }
    
    /**
     * アーカイブデータの検索
     */
    async searchArchives(query) {
        const results = [];
        
        // メタデータベースの検索
        for (const [archiveId, metadata] of this.archiveMetadata) {
            if (this.matchesQuery(metadata, query)) {
                results.push({
                    archiveId,
                    metadata,
                    score: this.calculateRelevanceScore(metadata, query)
                });
            }
        }
        
        // 関連度でソート
        results.sort((a, b) => b.score - a.score);
        
        return {
            total: results.length,
            results: results.slice(0, query.limit || 100),
            query
        };
    }
    
    /**
     * クエリとの一致判定
     */
    matchesQuery(metadata, query) {
        // データタイプフィルター
        if (query.dataType && metadata.dataType !== query.dataType) {
            return false;
        }
        
        // 日付範囲フィルター
        if (query.dateRange) {
            const metaDateRange = metadata.dateRange;
            if (!metaDateRange) return false;
            
            if (query.dateRange.start && metaDateRange.end < query.dateRange.start) return false;
            if (query.dateRange.end && metaDateRange.start > query.dateRange.end) return false;
        }
        
        // サイズフィルター
        if (query.minSize && metadata.archivedSize < query.minSize) return false;
        if (query.maxSize && metadata.archivedSize > query.maxSize) return false;
        
        // タグフィルター
        if (query.tags && query.tags.length > 0) {
            const hasAllTags = query.tags.every(tag => metadata.tags.includes(tag));
            if (!hasAllTags) return false;
        }
        
        // テキスト検索
        if (query.text) {
            const searchText = query.text.toLowerCase();
            const searchableText = [
                metadata.dataType,
                ...metadata.tags,
                metadata.strategy
            ].join(' ').toLowerCase();
            
            if (!searchableText.includes(searchText)) return false;
        }
        
        return true;
    }
    
    /**
     * 関連度スコアの計算
     */
    calculateRelevanceScore(metadata, query) {
        let score = 0;
        
        // 新しいデータほど高スコア
        const age = Date.now() - metadata.createdAt;
        score += Math.max(0, 100 - (age / (24 * 60 * 60 * 1000))); // 日数で減衰
        
        // サイズに基づくスコア
        if (query.preferLarger) {
            score += metadata.recordCount / 1000;
        }
        
        // 完全一致ボーナス
        if (query.dataType === metadata.dataType) {
            score += 50;
        }
        
        return score;
    }
    
    /**
     * アーカイブデータの復元
     */
    async restoreArchive(archiveId, options = {}) {
        if (this.archiveState.isRestoring) {
            return this.queueArchiveOperation('restore', { archiveId, options });
        }
        
        this.archiveState.isRestoring = true;
        const startTime = Date.now();
        
        try {
            // アーカイブデータの取得
            const archivedData = this.archiveStorage.get(archiveId);
            const metadata = this.archiveMetadata.get(archiveId);
            
            if (!archivedData || !metadata) {
                throw new Error(`Archive ${archiveId} not found`);
            }
            
            // データの復元
            let restoredData = archivedData;
            
            // 圧縮データの解凍
            if (metadata.compressionRatio < 1 && this.compressionManager) {
                restoredData = await this.decompressArchiveData(archivedData, metadata);
            }
            
            // データ整合性の検証
            await this.verifyRestoredData(restoredData, metadata);
            
            // 統計の更新
            this.updateArchiveStatistics(metadata, 'restore');
            
            const result = {
                archiveId,
                success: true,
                data: restoredData,
                metadata,
                restoredSize: this.calculateDataSize(restoredData),
                processingTime: Date.now() - startTime
            };
            
            console.debug(`Restored archive ${archiveId}: ${result.restoredSize} bytes`);
            return result;
            
        } catch (error) {
            console.error(`Archive restoration failed for ${archiveId}:`, error);
            throw error;
        } finally {
            this.archiveState.isRestoring = false;
            this.processOperationQueue();
        }
    }
    
    /**
     * アーカイブデータの解凍
     */
    async decompressArchiveData(data, metadata) {
        // 圧縮タイプに基づく解凍（簡略版）
        if (data.type === 'sampled_data') {
            return data.samples;
        }
        
        if (data.type === 'aggregated_data') {
            return data.data;
        }
        
        if (data.type === 'dictionary_compressed') {
            return this.decompressDictionary(data);
        }
        
        return data;
    }
    
    /**
     * 辞書圧縮の解凍
     */
    decompressDictionary(compressed) {
        const { data, dictionary } = compressed;
        
        const decompress = (obj) => {
            if (typeof obj !== 'object' || obj === null) {
                return typeof obj === 'string' && obj.startsWith('#') ? dictionary[obj] || obj : obj;
            }
            
            if (Array.isArray(obj)) {
                return obj.map(item => decompress(item));
            }
            
            const result = {};
            Object.entries(obj).forEach(([key, value]) => {
                result[key] = decompress(value);
            });
            
            return result;
        };
        
        return decompress(data);
    }
    
    /**
     * 復元データの検証
     */
    async verifyRestoredData(data, metadata) {
        // チェックサムの検証
        const checksum = this.calculateChecksum(data);
        if (checksum !== metadata.checksums.original) {
            console.warn(`Checksum mismatch for archive ${metadata.id}`);
        }
        
        // データ構造の検証
        this.validateDataIntegrity(data);
    }
    
    /**
     * 年齢によるアーカイブ
     */
    async archiveByAge(data, options) {
        const cutoffDate = Date.now() - (this.config.retention.activeDays * 24 * 60 * 60 * 1000);
        
        if (Array.isArray(data)) {
            const [oldData, newData] = this.partitionByAge(data, cutoffDate);
            return { archive: oldData, keep: newData };
        }
        
        return { archive: data, keep: null };
    }
    
    /**
     * 年齢による分割
     */
    partitionByAge(data, cutoffDate) {
        const old = [];
        const recent = [];
        
        data.forEach(item => {
            const timestamp = item.timestamp || item.date || item.createdAt || Date.now();
            if (timestamp < cutoffDate) {
                old.push(item);
            } else {
                recent.push(item);
            }
        });
        
        return [old, recent];
    }
    
    /**
     * サイズによるアーカイブ
     */
    async archiveBySize(data, options) {
        const maxActiveSize = options.maxActiveSize || 10 * 1024 * 1024; // 10MB
        const currentSize = this.calculateDataSize(data);
        
        if (currentSize <= maxActiveSize) {
            return { archive: null, keep: data };
        }
        
        // データの一部をアーカイブ
        if (Array.isArray(data)) {
            const targetSize = maxActiveSize * 0.8; // 80%を維持
            let keptSize = 0;
            const keep = [];
            const archive = [];
            
            // 新しいものから保持
            for (let i = data.length - 1; i >= 0; i--) {
                const itemSize = this.calculateDataSize(data[i]);
                if (keptSize + itemSize <= targetSize) {
                    keep.unshift(data[i]);
                    keptSize += itemSize;
                } else {
                    archive.unshift(data[i]);
                }
            }
            
            return { archive, keep };
        }
        
        return { archive: data, keep: null };
    }
    
    /**
     * 操作のキューイング
     */
    queueArchiveOperation(operation, params) {
        return new Promise((resolve, reject) => {
            this.archiveState.operationQueue.push({
                operation, params, resolve, reject, timestamp: Date.now()
            });
        });
    }
    
    /**
     * 操作キューの処理
     */
    async processOperationQueue() {
        while (this.archiveState.operationQueue.length > 0 && 
               !this.archiveState.isArchiving && 
               !this.archiveState.isRestoring) {
            
            const job = this.archiveState.operationQueue.shift();
            
            try {
                let result;
                if (job.operation === 'archive') {
                    result = await this.archiveData(job.params.data, job.params.dataType, job.params.options);
                } else if (job.operation === 'restore') {
                    result = await this.restoreArchive(job.params.archiveId, job.params.options);
                }
                
                job.resolve(result);
            } catch (error) {
                job.reject(error);
            }
        }
    }
    
    /**
     * 検索インデックスの構築
     */
    buildSearchIndex() {
        // 各アーカイブのメタデータからインデックスを構築
        for (const [archiveId, metadata] of this.archiveMetadata) {
            this.updateSearchIndex(archiveId, metadata);
        }
    }
    
    /**
     * 検索インデックスの更新
     */
    updateSearchIndex(archiveId, metadata) {
        // 日付インデックス
        if (metadata.dateRange) {
            const dateKey = new Date(metadata.dateRange.start).toISOString().split('T')[0];
            if (!this.searchIndex.byDate.has(dateKey)) {
                this.searchIndex.byDate.set(dateKey, []);
            }
            this.searchIndex.byDate.get(dateKey).push(archiveId);
        }
        
        // タイプインデックス
        if (!this.searchIndex.byType.has(metadata.dataType)) {
            this.searchIndex.byType.set(metadata.dataType, []);
        }
        this.searchIndex.byType.get(metadata.dataType).push(archiveId);
        
        // サイズインデックス
        const sizeCategory = this.getSizeCategory(metadata.archivedSize);
        if (!this.searchIndex.bySize.has(sizeCategory)) {
            this.searchIndex.bySize.set(sizeCategory, []);
        }
        this.searchIndex.bySize.get(sizeCategory).push(archiveId);
    }
    
    /**
     * サイズカテゴリの取得
     */
    getSizeCategory(size) {
        if (size < 1024) return 'tiny';
        if (size < 1024 * 1024) return 'small';
        if (size < 10 * 1024 * 1024) return 'medium';
        if (size < 100 * 1024 * 1024) return 'large';
        return 'huge';
    }
    
    /**
     * 定期アーカイブの実行
     */
    async performScheduledArchive() {
        console.debug('Starting scheduled archive operation');
        
        try {
            // アーカイブが必要なデータをチェック
            // 実際の実装では外部システムと連携
            
        } catch (error) {
            console.error('Scheduled archive failed:', error);
        }
    }
    
    /**
     * メンテナンスの実行
     */
    async performMaintenance() {
        console.debug('Starting archive maintenance');
        
        try {
            // 古いアーカイブの削除
            await this.cleanupOldArchives();
            
            // インデックスの最適化
            this.optimizeSearchIndex();
            
            // ストレージの最適化
            await this.optimizeStorage();
            
        } catch (error) {
            console.error('Archive maintenance failed:', error);
        }
    }
    
    /**
     * 古いアーカイブのクリーンアップ
     */
    async cleanupOldArchives() {
        const cutoffDate = Date.now() - (this.config.retention.maxArchiveDays * 24 * 60 * 60 * 1000);
        const toDelete = [];
        
        for (const [archiveId, metadata] of this.archiveMetadata) {
            if (metadata.createdAt < cutoffDate) {
                toDelete.push(archiveId);
            }
        }
        
        for (const archiveId of toDelete) {
            await this.deleteArchive(archiveId);
        }
        
        console.debug(`Cleaned up ${toDelete.length} old archives`);
    }
    
    /**
     * アーカイブの削除
     */
    async deleteArchive(archiveId) {
        try {
            // メモリから削除
            this.archiveStorage.delete(archiveId);
            this.archiveMetadata.delete(archiveId);
            
            // LocalStorageから削除
            localStorage.removeItem(`archive_${archiveId}`);
            localStorage.removeItem(`archive_meta_${archiveId}`);
            localStorage.removeItem(`archive_backup_${archiveId}`);
            
            // インデックスから削除
            this.removeFromSearchIndex(archiveId);
            
        } catch (error) {
            console.error(`Failed to delete archive ${archiveId}:`, error);
        }
    }
    
    /**
     * 検索インデックスからの削除
     */
    removeFromSearchIndex(archiveId) {
        for (const index of Object.values(this.searchIndex)) {
            for (const [key, archives] of index) {
                const newArchives = archives.filter(id => id !== archiveId);
                if (newArchives.length === 0) {
                    index.delete(key);
                } else {
                    index.set(key, newArchives);
                }
            }
        }
    }
    
    /**
     * データサイズの計算
     */
    calculateDataSize(data) {
        try {
            return JSON.stringify(data).length * 2; // UTF-16概算
        } catch (error) {
            return 0;
        }
    }
    
    /**
     * アーカイブ統計の更新
     */
    updateArchiveStatistics(metadata, operation) {
        const stats = this.archiveState.statistics;
        
        if (operation === 'archive') {
            stats.totalArchived++;
            stats.totalSize += metadata.archivedSize;
            stats.lastArchive = Date.now();
        } else if (operation === 'restore') {
            stats.totalRestored++;
            stats.lastRestore = Date.now();
        }
    }
    
    /**
     * アーカイブ統計の取得
     */
    getArchiveStatistics() {
        return {
            ...this.archiveState.statistics,
            archiveCount: this.archiveStorage.size,
            queueLength: this.archiveState.operationQueue.length,
            isArchiving: this.archiveState.isArchiving,
            isRestoring: this.archiveState.isRestoring,
            indexSizes: {
                byDate: this.searchIndex.byDate.size,
                byType: this.searchIndex.byType.size,
                bySize: this.searchIndex.bySize.size
            }
        };
    }
    
    /**
     * 設定の更新
     */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
    }
    
    /**
     * リソースのクリーンアップ
     */
    destroy() {
        this.archiveState.operationQueue = [];
        this.archiveStorage.clear();
        this.archiveIndex.clear();
        this.archiveMetadata.clear();
        
        // 検索インデックスのクリア
        Object.values(this.searchIndex).forEach(index => index.clear());
    }
}