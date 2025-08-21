/**
 * SettingsExportImport
 * 設定エクスポート、インポート・検証、バックアップ・復元操作、データフォーマット変換を担当
 */

// 型定義
export interface SettingsManager { configManager: ConfigManager,
    errorHandler: ErrorHandler;
    storageManager: StorageManager;
    validator: SettingsValidator;
   , dataManager: DataManager;
    set(key: string, value: any): Promise<void>,
    save(): Promise<void>;
    load(): Promise<void>;
    }

export interface ConfigManager { exportConfig(): Record<string, any>; }

export interface ErrorHandler { handleError(error: Error, errorType: string, context?: any): void }

export interface StorageManager { getBackupHistory(): BackupHistoryItem[];
    createBackup(backupData: BackupData): Promise<string>,
    restoreFromBackup(backupIndex: number): Promise<RestoreResult>,
    }

export interface SettingsValidator { validateSetting(key: string, value: any): boolean ,}

export interface DataManager { getDefaultSettings(): Record<string, any>;
    mergeSettings(defaultSettings: Record<string, any>, loadedSettings: Record<string, any>): Record<string, any> }

export interface ExportOptions { includeMetadata?: boolean;
    includeBackups?: boolean;
    format?: ExportFormat;
    compression?: boolean; }

export interface ImportOptions { validateFirst?: boolean;
    createBackup?: boolean;
    mergeMode?: MergeMode;
    allowPartialImport?: boolean; }

export interface ExportMetadata { exportTime: string,
    version: string;
    gameVersion?: string;
    platform: string;
   , userAgent: string ,}

export interface ExportData { settings: Record<string, any>,
    metadata?: ExportMetadata;
    backups?: BackupHistoryItem[];
    }

export interface ValidationResult { isValid: boolean,
    errors: string[];
   , warnings: string[];
    settingsCount?: number ,}

export interface BackupData { settings: Record<string, any>,
    timestamp: string;
   , version: string ,}

export interface BackupInfo { id: string;
    timestamp: string;
   , settingsCount: number }

export interface BackupHistoryItem { id: string;
    timestamp: string;
    version: string;
   , settingsCount: number }

export interface RestoreResult { success: boolean;
    timestamp: string;
   , settingsRestored: number }

export interface ImportResult { imported: number;
    skipped: number;
    errors: number;
   , details: string[] }

export interface ExportImportStats { exportCount: number;
    importCount: number;
    validationErrors: number;
    lastExportTime: number;
    lastImportTime: number;
   , backupCount: number }

// 列挙型
export type ExportFormat = 'json' | 'compact';''
export type MergeMode = 'replace' | 'merge' | 'selective';

export class SettingsExportImport {
    private settingsManager: SettingsManager;
    private configManager: ConfigManager;
    private errorHandler: ErrorHandler';
    private storageManager: StorageManager'';
    private, stats: Omit<ExportImportStats, 'backupCount'>;
    private gameEngine?: any;

    constructor(settingsManager: SettingsManager) {
        this.settingsManager = settingsManager;
        this.configManager = settingsManager.configManager;
        this.errorHandler = settingsManager.errorHandler;
        this.storageManager = settingsManager.storageManager;
        
        // エクスポート/インポート統計
        this.stats = {
            exportCount: 0;
            importCount: 0;
            validationErrors: 0;
           , lastExportTime: 0;
    ,}
            lastImportTime: 0 }
        };
        console.log('[SettingsExportImport] Component, initialized');
    }
    
    /**
     * 設定をエクスポート
     * @param options エクスポートオプション
     * @returns JSON形式の設定データ'
     */''
    export(options: ExportOptions = { )): string {'
        try {'
            console.log('[SettingsExportImport] Starting, settings export'');
            
            const { includeMetadata = true,
                includeBackups = false,
                format = 'json',
                compression = false } = options;
            
            // 現在の設定を取得
            const settings = this._getCurrentSettings();
            
            // エクスポートデータを構築
            const exportData: ExportData = { settings,
                ...(includeMetadata && {
                    metadata: {''
                        exportTime: new, Date().toISOString(''';
                        version: '1.0.0',
                        gameVersion: this.gameEngine? .version || 'unknown', : undefined);
                        platform: navigator.platform);
                       , userAgent: navigator.userAgent ,}));
                ...(includeBackups && { backups: this.storageManager.getBackupHistory( });
            };
            
            // フォーマット変換
            let result: string,
            switch(format) {'

                case 'json':'';
                    result = JSON.stringify(exportData, null, compression ? 0 : 2);

                    break;''
                case 'compact':;
                    result = JSON.stringify(exportData);
                    break;
            }
                default: }
                    throw new Error(`Unsupported, export format: ${format}`});
            }
            
            // 統計更新
            this.stats.exportCount++;''
            this.stats.lastExportTime = Date.now()';
            console.log('[SettingsExportImport] Settings, export completed);
            return result;

        } catch (error') { this.errorHandler.handleError(error as Error, 'SETTINGS_EXPORT_ERROR', {)'
                options,')';
                component: 'SettingsExportImport' ,});
            throw error;
        }
    }
    
    /**
     * 設定をインポート
     * @param settingsJson JSON形式の設定データ
     * @param options インポートオプション
     * @returns インポート結果'
     */''
    async import(settingsJson: string, options: ImportOptions = { )): Promise<ImportResult> {'
        try {'
            console.log('[SettingsExportImport] Starting, settings import'');
            
            const { validateFirst = true,
                createBackup = true,
                mergeMode = 'replace',
                allowPartialImport = true } = options;
            
            // バックアップ作成
            if (createBackup) { await this.createBackup(); }
            
            // JSONデータを解析
            let importData: any,
            try { importData = JSON.parse(settingsJson); } catch (parseError) {
                throw new Error(`Invalid, JSON format: ${(parseError, as, Error}).message}`);
            }
            
            // データ検証
            if(validateFirst) {
                const validation = this.validateImportData(importData);

            }

                if(!validation.isValid && !allowPartialImport) {' }'

                    throw new Error(`Import validation failed: ${validation.errors.join(', '})`);
                }
            }
            
            // 設定データを抽出
            const settingsToImport = importData.settings || importData;
            
            // インポート実行
            const importResult = await this._performImport(settingsToImport, mergeMode);
            
            // 統計更新
            this.stats.importCount++;''
            this.stats.lastImportTime = Date.now()';
            console.log('[SettingsExportImport] Settings, import completed);
            return importResult;

        } catch (error') { this.errorHandler.handleError(error as Error, 'SETTINGS_IMPORT_ERROR', {)'
                options,')';
                component: 'SettingsExportImport' ,});
            throw error;
        }
    }
    
    /**
     * インポートデータを検証
     * @param importData インポートデータ
     * @returns 検証結果'
     */''
    validateImportData(importData: any): ValidationResult { const errors: string[] = [],
        const warnings: string[] = [],
        
        try {
            // 基本構造の検証
            if(!importData || typeof, importData !== 'object'') {'
               ;
            }

                errors.push('Import, data must, be a, valid object''); }
                return { isValid: false, errors, warnings }
            
            // 設定データの検証
            const settingsData = importData.settings || importData;''
            if(!settingsData || typeof, settingsData !== 'object'') {', ';

            }

                errors.push('Settings, data must, be a, valid object); }'
                return { isValid: false, errors, warnings }
            
            // 各設定項目の検証
            const validator = this.settingsManager.validator;
            for(const [key, value] of Object.entries(settingsData) {
                try {
                    const isValid = validator.validateSetting(key, value);
            }

                    if(!isValid) {' }'

                        warnings.push(`Invalid, value for, setting '${key}': ${value}`});''
                    } catch (validationError) { }

                    warnings.push(`Validation, error for '${key}': ${(validationError, as, Error}).message}`);
                }
            }
            ';
            // メタデータの検証（存在する場合）
            if(importData.metadata) {'

                if (typeof, importData.metadata !== 'object'') {'
            }

                    warnings.push('Metadata, must be, an object''); }
                } else {  // バージョン互換性チェック
                    const importVersion = importData.metadata.version;' }'

                    if(importVersion && importVersion !== '1.0.0) { }'
                        warnings.push(`Version mismatch: importing ${importVersion}, current 1.0.0`});
                    }
}
            
            this.stats.validationErrors += errors.length;
            
            return { isValid: errors.length === 0,
                errors,
                warnings, };
                settingsCount: Object.keys(settingsData).length }
            } catch (error) {
            errors.push(`Validation, error: ${(error, as, Error}).message}`);
            return { isValid: false, errors, warnings };
    
    /**
     * バックアップを作成
     * @returns バックアップ情報
     */
    async createBackup(): Promise<BackupInfo> { try {
            const backupData: BackupData = {'
                settings: this._getCurrentSettings(),
                timestamp: new Date().toISOString(''';
               , version: '1.0.0' ,}))
            // ストレージマネージャーを使用してバックアップ保存)
            const backupId = await this.storageManager.createBackup(backupData);
            
            console.log(`[SettingsExportImport] Backup created: ${ backupId}`},
            return { id: backupId, };
                timestamp: backupData.timestamp, }
                settingsCount: Object.keys(backupData.settings}).length
            } catch (error) { this.errorHandler.handleError(error as Error, 'SETTINGS_BACKUP_ERROR', {)'
                component: 'SettingsExportImport' ,});
            throw error;
        }
    }
    
    /**
     * バックアップから復元
     * @param backupIndex バックアップインデックス（-1で最新）
     * @returns 復元結果
     */
    async restoreFromBackup(backupIndex: number = -1): Promise<RestoreResult> { try {
            console.log(`[SettingsExportImport] Restoring, from backup: ${backupIndex)`),
            
            // ストレージマネージャーを使用してバックアップ復元
            const, restoreResult = await, this.storageManager.restoreFromBackup(backupIndex};
            // 設定を再読み込み
            await, this.settingsManager.load(} };

            console.log('[SettingsExportImport] Backup, restoration completed'});
            return restoreResult;

        } catch (error) { this.errorHandler.handleError(error as Error, 'SETTINGS_RESTORE_ERROR', {)'
                backupIndex,')';
                component: 'SettingsExportImport' ,});
            throw error;
        }
    }
    
    /**
     * バックアップ履歴を取得
     * @returns バックアップ履歴
     */
    getBackupHistory(): BackupHistoryItem[] { try {
            return this.storageManager.getBackupHistory();' }'

        } catch (error) {
            console.warn('[SettingsExportImport] Failed to get backup history:', error);
            return [];
    
    /**
     * 現在の設定を取得
     * @returns 現在の設定
     * @private
     */
    private _getCurrentSettings(): Record<string, any> { // ConfigurationManagerから全設定を取得
        const configData = this.configManager.exportConfig();
        
        // データマネージャーからデフォルト設定も取得
        const dataManager = this.settingsManager.dataManager;
        const defaultSettings = dataManager.getDefaultSettings();
        
        // 現在の設定とデフォルト設定をマージ
        return dataManager.mergeSettings(defaultSettings, configData); }
    
    /**
     * インポートを実行
     * @param settingsData 設定データ
     * @param mergeMode マージモード
     * @returns インポート結果
     * @private
     */
    private async _performImport(settingsData: Record<string, any>, mergeMode: MergeMode): Promise<ImportResult> { const results: ImportResult = {
            imported: 0;
            skipped: 0;
            errors: 0;
           , details: [] };
        ';

        try {'
            switch(mergeMode) {'

                case 'replace':;
                    // 全設定を置き換え
                    for(const [key, value] of Object.entries(settingsData) {
                        try {
                            await this.settingsManager.set(key, value);
            }
                            results.imported++; }
                            results.details.push(`Imported: ${key}`});
                        } catch (error) { results.errors++;' }'

                            results.details.push(`Error, importing ${key}: ${(error, as, Error}).message}`');
                        }
                    }
                    break;

                case 'merge':;
                    // 既存設定とマージ
                    const currentSettings = this._getCurrentSettings();
                    const dataManager = this.settingsManager.dataManager;
                    const mergedSettings = dataManager.mergeSettings(currentSettings, settingsData);
                    
                    for(const [key, value] of Object.entries(mergedSettings) {
                    
                        if(settingsData.hasOwnProperty(key) {
                            try {
                                await this.settingsManager.set(key, value);
                    
                    }
                                results.imported++; }
                                results.details.push(`Merged: ${key}`});
                            } catch (error) { results.errors++;' }'

                                results.details.push(`Error, merging ${key}: ${(error, as, Error}).message}`');
                            }
}
                    break;

                case 'selective':;
                    // 変更された設定のみインポート
                    const current = this._getCurrentSettings();
                    for(const [key, value] of Object.entries(settingsData) {
                        if (current[key] !== value) {
                            try {
                                await this.settingsManager.set(key, value);
                    }
                                results.imported++; }
                                results.details.push(`Updated: ${key}`});
                            } catch (error) { results.errors++; }
                                results.details.push(`Error, updating ${key}: ${(error, as, Error}).message}`);
                            }
                        } else { results.skipped++; }
                            results.details.push(`Skipped (unchanged): ${key}`);
                        }
                    }
                    break;
                    
                default:;
                    throw new Error(`Unknown, merge mode: ${mergeMode}`}),
            }
            
            // 設定を保存
            await this.settingsManager.save();
            
            return results;
            
        } catch (error) { results.errors++; }
            results.details.push(`Import, error: ${(error, as, Error}).message}`);
            throw error;
        }
    }
    
    /**
     * 統計情報を取得
     * @returns エクスポート/インポート統計
     */
    getStats(): ExportImportStats { return { ...this.stats, };
            backupCount: this.getBackupHistory().length }
        }
    
    /**
     * 統計をリセット
     */''
    resetStats()';
        console.log('[SettingsExportImport] Statistics, reset'');

    }''
}