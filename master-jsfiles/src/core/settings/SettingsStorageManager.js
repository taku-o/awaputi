import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * SettingsStorageManager
 * 設定の保存、同期、バックアップ、復旧、永続化操作を担当
 */
export class SettingsStorageManager {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
        this.errorHandler = getErrorHandler();
        
        // ストレージキー
        this.storageKeys = {
            settings: 'bubblePop_settings',
            configManager: 'bubblePop_configManager',
            backup: 'bubblePop_settings_backup',
            timestamp: 'bubblePop_settings_timestamp',
            version: 'bubblePop_settings_version'
        };
        
        // バックアップ設定
        this.backupConfig = {
            maxBackups: 5,
            autoBackupInterval: 300000, // 5分
            compressionEnabled: true
        };
        
        // 同期統計
        this.syncStats = {
            saveCount: 0,
            loadCount: 0,
            backupCount: 0,
            errorCount: 0,
            lastSaveTime: 0,
            lastLoadTime: 0
        };
        
        // 自動バックアップの開始
        this.startAutoBackup();
    }

    /**
     * 設定を保存
     * @param {Object} settings 設定オブジェクト
     * @returns {boolean} 保存成功可否
     */
    saveSettings(settings) {
        try {
            if (!settings || typeof settings !== 'object') {
                throw new Error('Settings must be a valid object');
            }

            // タイムスタンプを更新
            const timestamp = Date.now();
            
            // 設定データを準備
            const settingsData = {
                ...settings,
                _metadata: {
                    version: '1.0',
                    timestamp,
                    source: 'SettingsStorageManager'
                }
            };

            // メインの設定を保存
            const settingsJson = JSON.stringify(settingsData);
            localStorage.setItem(this.storageKeys.settings, settingsJson);
            
            // タイムスタンプを保存
            localStorage.setItem(this.storageKeys.timestamp, timestamp.toString());
            
            // 統計を更新
            this.syncStats.saveCount++;
            this.syncStats.lastSaveTime = timestamp;
            
            console.log('[SettingsStorageManager] Settings saved successfully');
            return true;
            
        } catch (error) {
            this.syncStats.errorCount++;
            this.errorHandler.handleError(error, 'STORAGE_ERROR', {
                operation: 'saveSettings',
                component: 'SettingsStorageManager'
            });
            return false;
        }
    }

    /**
     * 設定を読み込み
     * @returns {Object|null} 読み込まれた設定
     */
    loadSettings() {
        try {
            const settingsData = localStorage.getItem(this.storageKeys.settings);
            
            if (!settingsData) {
                console.log('[SettingsStorageManager] No saved settings found');
                return null;
            }

            const parsedSettings = JSON.parse(settingsData);
            
            // メタデータを除去
            if (parsedSettings._metadata) {
                delete parsedSettings._metadata;
            }

            // 統計を更新
            this.syncStats.loadCount++;
            this.syncStats.lastLoadTime = Date.now();
            
            console.log('[SettingsStorageManager] Settings loaded successfully');
            return parsedSettings;
            
        } catch (error) {
            this.syncStats.errorCount++;
            this.errorHandler.handleError(error, 'STORAGE_ERROR', {
                operation: 'loadSettings',
                component: 'SettingsStorageManager'
            });
            
            // エラーの場合はバックアップから復旧を試行
            console.log('[SettingsStorageManager] Attempting to restore from backup');
            return this.restoreFromBackup();
        }
    }

    /**
     * ConfigurationManagerのデータを保存
     * @param {Object} configData ConfigurationManagerのデータ
     * @returns {boolean} 保存成功可否
     */
    saveConfigurationManagerData(configData) {
        try {
            if (!configData || typeof configData !== 'object') {
                throw new Error('Configuration data must be a valid object');
            }

            const configJson = JSON.stringify({
                ...configData,
                _metadata: {
                    version: '1.0',
                    timestamp: Date.now(),
                    source: 'SettingsStorageManager'
                }
            });
            
            localStorage.setItem(this.storageKeys.configManager, configJson);
            console.log('[SettingsStorageManager] Configuration data saved successfully');
            return true;
            
        } catch (error) {
            this.syncStats.errorCount++;
            this.errorHandler.handleError(error, 'STORAGE_ERROR', {
                operation: 'saveConfigurationManagerData',
                component: 'SettingsStorageManager'
            });
            return false;
        }
    }

    /**
     * ConfigurationManagerのデータを読み込み
     * @returns {Object|null} 読み込まれた設定
     */
    loadConfigurationManagerData() {
        try {
            const configData = localStorage.getItem(this.storageKeys.configManager);
            
            if (!configData) {
                console.log('[SettingsStorageManager] No configuration data found');
                return null;
            }

            const parsedConfig = JSON.parse(configData);
            
            // メタデータを除去
            if (parsedConfig._metadata) {
                delete parsedConfig._metadata;
            }

            console.log('[SettingsStorageManager] Configuration data loaded successfully');
            return parsedConfig;
            
        } catch (error) {
            this.syncStats.errorCount++;
            this.errorHandler.handleError(error, 'STORAGE_ERROR', {
                operation: 'loadConfigurationManagerData',
                component: 'SettingsStorageManager'
            });
            return null;
        }
    }

    /**
     * 設定のバックアップを作成
     * @returns {boolean} バックアップ成功可否
     */
    createBackup() {
        try {
            const currentSettings = this.loadSettings();
            const currentConfig = this.loadConfigurationManagerData();
            
            if (!currentSettings && !currentConfig) {
                console.log('[SettingsStorageManager] No data to backup');
                return false;
            }

            // バックアップデータを準備
            const backupData = {
                settings: currentSettings,
                configManager: currentConfig,
                timestamp: Date.now(),
                version: '1.0'
            };

            // 既存のバックアップを取得
            const existingBackups = this.getExistingBackups();
            
            // 新しいバックアップを追加
            existingBackups.push(backupData);
            
            // 最大バックアップ数を超えた場合、古いものを削除
            if (existingBackups.length > this.backupConfig.maxBackups) {
                existingBackups.splice(0, existingBackups.length - this.backupConfig.maxBackups);
            }

            // バックアップを保存
            const backupJson = JSON.stringify(existingBackups);
            localStorage.setItem(this.storageKeys.backup, backupJson);
            
            // 統計を更新
            this.syncStats.backupCount++;
            
            console.log(`[SettingsStorageManager] Backup created (${existingBackups.length} total)`);
            return true;
            
        } catch (error) {
            this.syncStats.errorCount++;
            this.errorHandler.handleError(error, 'STORAGE_ERROR', {
                operation: 'createBackup',
                component: 'SettingsStorageManager'
            });
            return false;
        }
    }

    /**
     * バックアップから復旧
     * @param {number} backupIndex バックアップのインデックス（未指定の場合は最新）
     * @returns {Object|null} 復旧された設定
     */
    restoreFromBackup(backupIndex = -1) {
        try {
            const backups = this.getExistingBackups();
            
            if (backups.length === 0) {
                console.log('[SettingsStorageManager] No backups available');
                return null;
            }

            // バックアップインデックスを正規化
            const index = backupIndex < 0 ? backups.length + backupIndex : backupIndex;
            
            if (index < 0 || index >= backups.length) {
                throw new Error(`Invalid backup index: ${backupIndex}`);
            }

            const backup = backups[index];
            
            if (backup.settings) {
                console.log(`[SettingsStorageManager] Restoring settings from backup ${index}`);
                return backup.settings;
            }
            
            return null;
            
        } catch (error) {
            this.syncStats.errorCount++;
            this.errorHandler.handleError(error, 'STORAGE_ERROR', {
                operation: 'restoreFromBackup',
                component: 'SettingsStorageManager',
                backupIndex
            });
            return null;
        }
    }

    /**
     * 既存のバックアップを取得
     * @private
     * @returns {Array} バックアップ配列
     */
    getExistingBackups() {
        try {
            const backupData = localStorage.getItem(this.storageKeys.backup);
            return backupData ? JSON.parse(backupData) : [];
        } catch (error) {
            console.warn('[SettingsStorageManager] Failed to parse backup data:', error);
            return [];
        }
    }

    /**
     * 設定の同期状態をチェック
     * @returns {Object} 同期状態
     */
    checkSyncStatus() {
        try {
            const settings = this.loadSettings();
            const configData = this.loadConfigurationManagerData();
            const timestamp = localStorage.getItem(this.storageKeys.timestamp);
            
            return {
                hasSettings: !!settings,
                hasConfigData: !!configData,
                lastSaved: timestamp ? new Date(parseInt(timestamp)) : null,
                synchronized: !!(settings && configData),
                storageSize: this.getStorageSize(),
                backupCount: this.getExistingBackups().length
            };
            
        } catch (error) {
            this.errorHandler.handleError(error, 'STORAGE_ERROR', {
                operation: 'checkSyncStatus',
                component: 'SettingsStorageManager'
            });
            
            return {
                hasSettings: false,
                hasConfigData: false,
                lastSaved: null,
                synchronized: false,
                storageSize: 0,
                backupCount: 0,
                error: error.message
            };
        }
    }

    /**
     * 設定を強制同期
     * @param {Object} settings 設定オブジェクト
     * @param {Object} configData ConfigurationManagerデータ
     * @returns {boolean} 同期成功可否
     */
    forceSynchronization(settings, configData) {
        try {
            let success = true;
            
            // バックアップを作成
            this.createBackup();
            
            // 設定を保存
            if (settings) {
                success = this.saveSettings(settings) && success;
            }
            
            // ConfigurationManagerデータを保存
            if (configData) {
                success = this.saveConfigurationManagerData(configData) && success;
            }
            
            console.log(`[SettingsStorageManager] Force synchronization ${success ? 'completed' : 'failed'}`);
            return success;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'STORAGE_ERROR', {
                operation: 'forceSynchronization',
                component: 'SettingsStorageManager'
            });
            return false;
        }
    }

    /**
     * 設定をエクスポート
     * @returns {string|null} エクスポートされたJSON文字列
     */
    exportSettings() {
        try {
            const settings = this.loadSettings();
            const configData = this.loadConfigurationManagerData();
            
            const exportData = {
                settings,
                configManager: configData,
                exportDate: new Date().toISOString(),
                version: '1.0',
                source: 'BubblePop Game'
            };
            
            return JSON.stringify(exportData, null, 2);
            
        } catch (error) {
            this.errorHandler.handleError(error, 'STORAGE_ERROR', {
                operation: 'exportSettings',
                component: 'SettingsStorageManager'
            });
            return null;
        }
    }

    /**
     * 設定をインポート
     * @param {string} settingsJson インポートするJSON文字列
     * @returns {boolean} インポート成功可否
     */
    importSettings(settingsJson) {
        try {
            const importData = JSON.parse(settingsJson);
            
            // バックアップを作成
            this.createBackup();
            
            let success = true;
            
            // 設定をインポート
            if (importData.settings) {
                success = this.saveSettings(importData.settings) && success;
            }
            
            // ConfigurationManagerデータをインポート
            if (importData.configManager) {
                success = this.saveConfigurationManagerData(importData.configManager) && success;
            }
            
            console.log(`[SettingsStorageManager] Settings import ${success ? 'completed' : 'failed'}`);
            return success;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'STORAGE_ERROR', {
                operation: 'importSettings',
                component: 'SettingsStorageManager',
                data: settingsJson?.substring(0, 100)
            });
            return false;
        }
    }

    /**
     * ストレージをクリア
     * @param {boolean} includeBackups バックアップも削除するか
     * @returns {boolean} クリア成功可否
     */
    clearStorage(includeBackups = false) {
        try {
            localStorage.removeItem(this.storageKeys.settings);
            localStorage.removeItem(this.storageKeys.configManager);
            localStorage.removeItem(this.storageKeys.timestamp);
            localStorage.removeItem(this.storageKeys.version);
            
            if (includeBackups) {
                localStorage.removeItem(this.storageKeys.backup);
            }
            
            console.log('[SettingsStorageManager] Storage cleared successfully');
            return true;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'STORAGE_ERROR', {
                operation: 'clearStorage',
                component: 'SettingsStorageManager'
            });
            return false;
        }
    }

    /**
     * ストレージサイズを取得
     * @returns {number} ストレージサイズ（バイト）
     */
    getStorageSize() {
        try {
            let totalSize = 0;
            
            for (const key of Object.values(this.storageKeys)) {
                const data = localStorage.getItem(key);
                if (data) {
                    totalSize += new Blob([data]).size;
                }
            }
            
            return totalSize;
            
        } catch (error) {
            console.warn('[SettingsStorageManager] Failed to calculate storage size:', error);
            return 0;
        }
    }

    /**
     * ストレージの健全性をチェック
     * @returns {Object} 健全性レポート
     */
    checkStorageHealth() {
        try {
            const report = {
                healthy: true,
                issues: [],
                recommendations: [],
                storageSize: this.getStorageSize(),
                backupCount: this.getExistingBackups().length,
                lastModified: null
            };

            // 設定の存在チェック
            const settings = this.loadSettings();
            if (!settings) {
                report.healthy = false;
                report.issues.push('No settings found in storage');
                report.recommendations.push('Initialize with default settings');
            }

            // タイムスタンプチェック
            const timestamp = localStorage.getItem(this.storageKeys.timestamp);
            if (timestamp) {
                report.lastModified = new Date(parseInt(timestamp));
                const ageInDays = (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60 * 24);
                
                if (ageInDays > 30) {
                    report.recommendations.push('Settings haven\'t been updated in over 30 days');
                }
            }

            // ストレージサイズチェック
            if (report.storageSize > 100000) { // 100KB
                report.recommendations.push('Storage size is large, consider cleanup');
            }

            // バックアップチェック
            if (report.backupCount === 0) {
                report.recommendations.push('No backups found, consider creating backup');
            } else if (report.backupCount > this.backupConfig.maxBackups) {
                report.recommendations.push('Too many backups, cleanup recommended');
            }

            return report;
            
        } catch (error) {
            return {
                healthy: false,
                issues: [`Health check failed: ${error.message}`],
                recommendations: ['Investigate storage errors'],
                storageSize: 0,
                backupCount: 0,
                lastModified: null
            };
        }
    }

    /**
     * 自動バックアップを開始
     * @private
     */
    startAutoBackup() {
        if (this.autoBackupInterval) {
            clearInterval(this.autoBackupInterval);
        }

        this.autoBackupInterval = setInterval(() => {
            console.log('[SettingsStorageManager] Performing automatic backup');
            this.createBackup();
        }, this.backupConfig.autoBackupInterval);

        console.log(`[SettingsStorageManager] Auto backup started (${this.backupConfig.autoBackupInterval}ms interval)`);
    }

    /**
     * 同期統計を取得
     * @returns {Object} 統計情報
     */
    getSyncStats() {
        return {
            ...this.syncStats,
            storageHealth: this.checkStorageHealth(),
            storageSize: this.getStorageSize(),
            backupCount: this.getExistingBackups().length,
            autoBackupEnabled: !!this.autoBackupInterval
        };
    }

    /**
     * バックアップ履歴を取得
     * @returns {Array} バックアップ履歴
     */
    getBackupHistory() {
        const backups = this.getExistingBackups();
        return backups.map((backup, index) => ({
            index,
            timestamp: backup.timestamp,
            date: new Date(backup.timestamp),
            hasSettings: !!backup.settings,
            hasConfigData: !!backup.configManager,
            version: backup.version || 'unknown'
        }));
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        if (this.autoBackupInterval) {
            clearInterval(this.autoBackupInterval);
            this.autoBackupInterval = null;
        }

        console.log('[SettingsStorageManager] Cleanup completed');
    }
}