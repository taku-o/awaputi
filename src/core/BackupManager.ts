import { getErrorHandler } from '../utils/ErrorHandler.js';

interface DataStorage {
    [key: string]: unknown;
}

interface ValidationManager {
    [key: string]: unknown;
}

interface BackupConfig {
    autoBackupInterval: number;
    maxBackups: number;
    maxBackupAge: number;
    compressionEnabled: boolean;
    encryptionEnabled: boolean;
}

interface BackupJob {
    [key: string]: unknown;
}

/**
 * バックアップ管理クラス - 自動・手動バックアップシステム
 * 
 * 責任:
 * - 自動バックアップスケジューリング
 * - 手動バックアップ実行
 * - バックアップ履歴管理
 * - 古いバックアップの自動削除
 */
export class BackupManager {
    private storage: DataStorage;
    private validation: ValidationManager | null;
    private version: string;
    private config: BackupConfig;
    private backupQueue: BackupJob[];
    private isBackupInProgress: boolean;
    private autoBackupTimer: ReturnType<typeof setInterval> | null;

    constructor(dataStorage: DataStorage, validationManager: ValidationManager | null = null) {
        this.storage = dataStorage;
        this.validation = validationManager;
        this.version = '1.0.0';
        
        // バックアップ設定
        this.config = {
            autoBackupInterval: 5 * 60 * 1000, // 5分間隔
            maxBackups: 10, // 最大保持数
            maxBackupAge: 30 * 24 * 60 * 60 * 1000, // 30日
            compressionEnabled: true,
            encryptionEnabled: false // SecurityManagerと統合時に有効化
        };
        
        // バックアップ管理
        this.backupQueue = [];
        this.isBackupInProgress = false;
        this.autoBackupTimer = null;
        this.lastBackupTime = null;
        
        // バックアップ統計
        this.statistics = {
            totalBackups: 0,
            successfulBackups: 0,
            failedBackups: 0,
            autoBackups: 0,
            manualBackups: 0,
            averageBackupSize: 0,
            averageBackupTime: 0
        };
        
        this.initialize();
    }
    
    /**
     * BackupManagerの初期化
     */
    async initialize() {
        try {
            // 既存バックアップの読み込み
            await this.loadBackupHistory();
            
            // 自動バックアップの開始
            this.startAutoBackup();
            
            console.log('BackupManager initialized');
            
        } catch (error) {
            getErrorHandler().handleError(error, 'BACKUP_MANAGER_INITIALIZATION_ERROR', {
                operation: 'initialize'
            });
        }
    }
    
    /**
     * 手動バックアップの作成
     */
    async createBackup(dataType = 'all', options = {}) {
        try {
            if (this.isBackupInProgress && !options.force) {
                throw new Error('Backup already in progress');
            }
            
            this.isBackupInProgress = true;
            const startTime = performance.now();
            
            // バックアップデータの収集
            const backupData = await this.collectBackupData(dataType);
            
            // バックアップメタデータの作成
            const metadata = this.createBackupMetadata(dataType, backupData, {
                manual: true,
                ...options
            });
            
            // 検証の実行
            if (this.validation && options.validate !== false) {
                const validationResult = await this.validation.validate('backup', {
                    metadata,
                    data: backupData
                });
                
                if (!validationResult.isValid) {
                    throw new Error(`Backup validation failed: ${validationResult.errors.join(', ')}`);
                }
                
                metadata.validationChecksum = validationResult.checksum;
            }
            
            // バックアップの保存
            const backupId = this.generateBackupId();
            const backupKey = `backup_${backupId}`;
            
            const finalBackupData = {
                metadata,
                data: backupData
            };
            
            await this.storage.save(backupKey, finalBackupData, {
                compress: this.config.compressionEnabled
            });
            
            // バックアップ履歴の更新
            await this.updateBackupHistory(backupId, metadata);
            
            // 古いバックアップの清理
            await this.cleanupOldBackups();
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // 統計の更新
            this.updateStatistics(true, duration, JSON.stringify(finalBackupData).length, false);
            
            this.lastBackupTime = Date.now();
            
            // パフォーマンス要件チェック（< 500ms バックグラウンド）
            if (duration > 500) {
                console.warn(`Backup took ${duration.toFixed(2)}ms, exceeding target of 500ms`);
            }
            
            return {
                success: true,
                backupId,
                metadata,
                duration,
                size: JSON.stringify(finalBackupData).length
            };
            
        } catch (error) {
            this.updateStatistics(false, 0, 0, false);
            getErrorHandler().handleError(error, 'BACKUP_CREATION_ERROR', {
                operation: 'createBackup',
                dataType,
                options
            });
            
            return {
                success: false,
                error: error.message
            };
            
        } finally {
            this.isBackupInProgress = false;
        }
    }
    
    /**
     * 自動バックアップの作成
     */
    async createAutoBackup() {
        try {
            const result = await this.createBackup('all', {
                automatic: true,
                validate: true
            });
            
            if (result.success) {
                this.statistics.autoBackups++;
                console.log(`Auto backup created: ${result.backupId}`);
            } else {
                console.error('Auto backup failed:', result.error);
            }
            
            return result;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'AUTO_BACKUP_ERROR', {
                operation: 'createAutoBackup'
            });
            
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * バックアップデータの収集
     */
    async collectBackupData(dataType) {
        try {
            const backupData = {};
            
            if (dataType === 'all' || dataType === 'playerData') {
                backupData.playerData = await this.storage.load('playerData');
            }
            
            if (dataType === 'all' || dataType === 'settings') {
                backupData.settings = await this.storage.load('settings');
            }
            
            if (dataType === 'all' || dataType === 'statistics') {
                backupData.statistics = await this.storage.load('statistics');
            }
            
            if (dataType === 'all' || dataType === 'achievements') {
                backupData.achievements = await this.storage.load('achievements');
            }
            
            // カスタムデータタイプの処理
            if (dataType !== 'all' && !['playerData', 'settings', 'statistics', 'achievements'].includes(dataType)) {
                backupData[dataType] = await this.storage.load(dataType);
            }
            
            return backupData;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'BACKUP_DATA_COLLECTION_ERROR', {
                operation: 'collectBackupData',
                dataType
            });
            
            throw error;
        }
    }
    
    /**
     * バックアップメタデータの作成
     */
    createBackupMetadata(dataType, data, options = {}) {
        return {
            version: this.version,
            timestamp: Date.now(),
            gameVersion: window.GAME_VERSION || '1.0.0',
            dataTypes: Object.keys(data),
            dataType,
            size: JSON.stringify(data).length,
            checksum: null, // ValidationManagerで設定
            automatic: options.automatic || false,
            manual: options.manual || false,
            compressed: this.config.compressionEnabled,
            encrypted: this.config.encryptionEnabled,
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            description: options.description || (options.automatic ? 'Automatic backup' : 'Manual backup')
        };
    }
    
    /**
     * バックアップIDの生成
     */
    generateBackupId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `${timestamp}_${random}`;
    }
    
    /**
     * バックアップ履歴の読み込み
     */
    async loadBackupHistory() {
        try {
            const history = await this.storage.load('backupHistory');
            this.backupHistory = history || [];
            
        } catch (error) {
            getErrorHandler().handleError(error, 'BACKUP_HISTORY_LOAD_ERROR', {
                operation: 'loadBackupHistory'
            });
            
            this.backupHistory = [];
        }
    }
    
    /**
     * バックアップ履歴の更新
     */
    async updateBackupHistory(backupId, metadata) {
        try {
            if (!this.backupHistory) {
                this.backupHistory = [];
            }
            
            this.backupHistory.push({
                id: backupId,
                timestamp: metadata.timestamp,
                dataType: metadata.dataType,
                size: metadata.size,
                automatic: metadata.automatic,
                description: metadata.description
            });
            
            // 履歴の制限（最大100件）
            if (this.backupHistory.length > 100) {
                this.backupHistory = this.backupHistory.slice(-100);
            }
            
            await this.storage.save('backupHistory', this.backupHistory);
            
        } catch (error) {
            getErrorHandler().handleError(error, 'BACKUP_HISTORY_UPDATE_ERROR', {
                operation: 'updateBackupHistory',
                backupId
            });
        }
    }
    
    /**
     * バックアップの一覧取得
     */
    async getBackupList() {
        try {
            await this.loadBackupHistory();
            
            // 最新順にソート
            const sortedHistory = [...this.backupHistory].sort((a, b) => b.timestamp - a.timestamp);
            
            // 各バックアップの詳細情報を付加
            const backupList = await Promise.all(
                sortedHistory.map(async (backup) => {
                    try {
                        const backupData = await this.storage.load(`backup_${backup.id}`);
                        return {
                            ...backup,
                            exists: !!backupData,
                            metadata: backupData?.metadata || null
                        };
                    } catch (error) {
                        return {
                            ...backup,
                            exists: false,
                            metadata: null
                        };
                    }
                })
            );
            
            return backupList;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'BACKUP_LIST_ERROR', {
                operation: 'getBackupList'
            });
            
            return [];
        }
    }
    
    /**
     * バックアップの削除
     */
    async deleteBackup(backupId) {
        try {
            // バックアップファイルの削除
            await this.storage.remove(`backup_${backupId}`);
            
            // 履歴からの削除
            if (this.backupHistory) {
                this.backupHistory = this.backupHistory.filter(backup => backup.id !== backupId);
                await this.storage.save('backupHistory', this.backupHistory);
            }
            
            return true;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'BACKUP_DELETE_ERROR', {
                operation: 'deleteBackup',
                backupId
            });
            
            return false;
        }
    }
    
    /**
     * 古いバックアップの清理
     */
    async cleanupOldBackups() {
        try {
            const backupList = await this.getBackupList();
            const now = Date.now();
            
            // 削除対象の特定
            const toDelete = backupList.filter((backup, index) => {
                // 保持数を超えている場合
                if (index >= this.config.maxBackups) {
                    return true;
                }
                
                // 古すぎる場合
                const age = now - backup.timestamp;
                if (age > this.config.maxBackupAge) {
                    return true;
                }
                
                return false;
            });
            
            // 削除の実行
            for (const backup of toDelete) {
                await this.deleteBackup(backup.id);
                console.log(`Deleted old backup: ${backup.id}`);
            }
            
            return toDelete.length;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'BACKUP_CLEANUP_ERROR', {
                operation: 'cleanupOldBackups'
            });
            
            return 0;
        }
    }
    
    /**
     * 自動バックアップの開始
     */
    startAutoBackup() {
        try {
            if (this.autoBackupTimer) {
                clearInterval(this.autoBackupTimer);
            }
            
            this.autoBackupTimer = setInterval(async () => {
                try {
                    await this.createAutoBackup();
                } catch (error) {
                    console.error('Auto backup error:', error);
                }
            }, this.config.autoBackupInterval);
            
            console.log(`Auto backup started with ${this.config.autoBackupInterval / 1000}s interval`);
            
        } catch (error) {
            getErrorHandler().handleError(error, 'AUTO_BACKUP_START_ERROR', {
                operation: 'startAutoBackup'
            });
        }
    }
    
    /**
     * 自動バックアップの停止
     */
    stopAutoBackup() {
        try {
            if (this.autoBackupTimer) {
                clearInterval(this.autoBackupTimer);
                this.autoBackupTimer = null;
                console.log('Auto backup stopped');
            }
            
        } catch (error) {
            getErrorHandler().handleError(error, 'AUTO_BACKUP_STOP_ERROR', {
                operation: 'stopAutoBackup'
            });
        }
    }
    
    /**
     * バックアップ設定の更新
     */
    updateConfig(newConfig) {
        try {
            this.config = { ...this.config, ...newConfig };
            
            // 自動バックアップ間隔の更新
            if (newConfig.autoBackupInterval && this.autoBackupTimer) {
                this.stopAutoBackup();
                this.startAutoBackup();
            }
            
        } catch (error) {
            getErrorHandler().handleError(error, 'BACKUP_CONFIG_UPDATE_ERROR', {
                operation: 'updateConfig',
                newConfig
            });
        }
    }
    
    /**
     * 統計の更新
     */
    updateStatistics(success, duration, size, isAuto) {
        try {
            this.statistics.totalBackups++;
            
            if (success) {
                this.statistics.successfulBackups++;
                
                // 平均サイズの更新
                const totalSize = this.statistics.averageBackupSize * (this.statistics.successfulBackups - 1) + size;
                this.statistics.averageBackupSize = Math.round(totalSize / this.statistics.successfulBackups);
                
                // 平均時間の更新
                const totalTime = this.statistics.averageBackupTime * (this.statistics.successfulBackups - 1) + duration;
                this.statistics.averageBackupTime = Math.round(totalTime / this.statistics.successfulBackups);
                
                if (isAuto) {
                    this.statistics.autoBackups++;
                } else {
                    this.statistics.manualBackups++;
                }
            } else {
                this.statistics.failedBackups++;
            }
            
        } catch (error) {
            console.error('Statistics update error:', error);
        }
    }
    
    /**
     * バックアップ状況の取得
     */
    getStatus() {
        return {
            isBackupInProgress: this.isBackupInProgress,
            lastBackupTime: this.lastBackupTime,
            autoBackupEnabled: !!this.autoBackupTimer,
            config: { ...this.config },
            statistics: { ...this.statistics },
            backupCount: this.backupHistory ? this.backupHistory.length : 0
        };
    }
    
    /**
     * 特定のバックアップの取得
     */
    async getBackup(backupId) {
        try {
            const backupData = await this.storage.load(`backup_${backupId}`);
            
            if (!backupData) {
                throw new Error(`Backup not found: ${backupId}`);
            }
            
            return backupData;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'BACKUP_GET_ERROR', {
                operation: 'getBackup',
                backupId
            });
            
            return null;
        }
    }
    
    /**
     * リソースの解放
     */
    destroy() {
        try {
            this.stopAutoBackup();
            this.backupQueue = [];
            this.isBackupInProgress = false;
            
            console.log('BackupManager destroyed');
            
        } catch (error) {
            getErrorHandler().handleError(error, 'BACKUP_MANAGER_DESTROY_ERROR', {
                operation: 'destroy'
            });
        }
    }
}