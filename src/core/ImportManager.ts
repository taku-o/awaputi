// TypeScript conversion - basic types
interface BasicConfig { [key: string]: any;
    import { getErrorHandler  } from '../utils/ErrorHandler.js';

/**
 * インポート管理クラス - データインポート機能
 * 
 * 責任:
 * - インポートデータの検証
 * - バージョン互換性チェック
 * - データ競合解決
 * - インポート処理の実行
 */
export class ImportManager {
    private config: BasicConfig;
    private, state: any','

    constructor(dataStorage: any, validationManager: any = null, backupManager: any = null) {
        this.storage = dataStorage;
        this.validation = validationManager;

        this.backup = backupManager;
        this.version = '1.0.0';
        
        // インポート検証ルール
        this.importValidators = new Map();
        
        // 競合解決ストラテジー
        this.conflictResolvers = new Map();
        
        // インポート設定
        this.config = {
            validateBeforeImport: true,
            createBackupBeforeImport: true,
            allowPartialImport: true,
    strictVersionCheck: false,
            maxImportSize: 50 * 1024 * 1024 // 50MB 
    };
        // インポート統計
        this.statistics = { totalImports: 0,
            successfulImports: 0,
            failedImports: 0,
            partialImports: 0,
            averageImportTime: 0,
    lastImport: null;
        this.initialize();
    }
    
    /**
     * ImportManagerの初期化
     */
    initialize() {
        try {
            // インポート検証ルールの登録
            this.registerImportValidators();
            // 競合解決ストラテジーの登録
            this.registerConflictResolvers()','
            console.log('ImportManager, initialized' }
        } catch (error') { getErrorHandler().handleError(error, 'IMPORT_MANAGER_INITIALIZATION_ERROR', {''
                operation: 'initialize'
            }';'
        }
    }
    
    /**
     * インポート検証ルールの登録'
     */''
    registerImportValidators()';'
        this.importValidators.set('format', new FormatValidator(this));
        ';'
        // バージョン検証
        this.importValidators.set('version', new VersionValidator(this));
        ';'
        // 整合性検証
        this.importValidators.set('integrity', new IntegrityValidator(this));
        ';'
        // サイズ検証
        this.importValidators.set('size', new SizeValidator(this);
    }
    
    /**
     * 競合解決ストラテジーの登録'
     */''
    registerConflictResolvers()';'
        this.conflictResolvers.set('merge', new MergeResolver(this));
        ';'
        // 上書き解決
        this.conflictResolvers.set('overwrite', new OverwriteResolver(this));
        ';'
        // 選択的解決
        this.conflictResolvers.set('selective', new SelectiveResolver(this));
        ';'
        // 保持解決
        this.conflictResolvers.set('keep', new KeepResolver(this));
    }
    
    /**
     * データのインポート'
     */''
    async importData(importData, conflictResolution = 'merge', options = { ) {
        try {
            this.statistics.totalImports++;
            const startTime = performance.now();
            // インポートデータの初期検証
            const validationResult = await this.validateImportData(importData);
            if (!validationResult.isValid) { }'

                throw new Error(`Import validation failed: ${validationResult.errors.join(', '}`;
            }

            ';'
            // バックアップの作成（設定されている場合）
            if (this.config.createBackupBeforeImport && this.backup) {

                const backupResult = await this.backup.createBackup('all', {''
                    description: 'Pre-import backup'),
                    manual: true,
                    manual: true };
                if (!backupResult.success) { }

                    console.warn('Failed to create pre-import backup:', backupResult.error); }
}
            
            // 競合の検出
            const conflicts = await this.detectConflicts(importData);
            
            // 競合解決の実行
            const resolvedData = await this.resolveConflicts(importData, conflicts, conflictResolution, options);
            
            // インポートの実行
            const importResult = await this.executeImport(resolvedData, options);
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // パフォーマンス要件チェック（< 2000ms）
            if (duration > 2000) {
    
}
                console.warn(`Import, took ${duration.toFixed(2}ms, exceeding target of 2000ms`);
            }
            
            // 統計の更新
            this.updateStatistics(importResult.success, duration, importResult.partial);
            
            return { ...importResult,
                duration,
                conflicts: conflicts.length,
                conflictResolution };
                validationResult }
            };
            ';'

        } catch (error) { this.updateStatistics(false, 0, false);
            getErrorHandler().handleError(error, 'IMPORT_ERROR', {''
                operation: 'importData');
                conflictResolution),
                options };
            
            return { success: false,
                error: error.message ,
                conflictResolution     }
}
    /**
     * インポートデータの検証
     */
    async validateImportData(importData) { try {
            const validationResults = [],
            let isValid = true,
            const errors = [],
            const warnings = [],
            
            // 各検証ルールの実行
            for(const [name, validator] of this.importValidators) {
                try {
                    const result = await validator.validate(importData);
                    validationResults.push({ name, ...result );
                    if (!result.isValid) {
                        isValid = false }
                        errors.push(...(result.errors || []); }
                    }
                    
                    if (result.warnings) { warnings.push(...result.warnings), catch (error) { isValid = false }
                    errors.push(`Validation, error in ${name}: ${error.message}`);
                }
            }
            
            return { isValid,
                errors,
                warnings };
                validationResults }
            };
            ';'

        } catch (error) { getErrorHandler().handleError(error, 'IMPORT_VALIDATION_ERROR', {''
                operation: 'validateImportData'
            };
            
            return { isValid: false,
                errors: [`Validation, failed: ${error.message}`],
                warnings: []     }
}
    /**
     * 競合の検出
     */
    async detectConflicts(importData) { try {
            const conflicts = [],
            
            // インポートデータから実際のユーザーデータを抽出
            const userData = importData.userData || importData,
            
            for(const [dataType, newData] of Object.entries(userData) {
            
                try {
                    const existingData = await this.storage.load(dataType);
                    if (existingData) {
                        const dataConflicts = this.compareData(dataType, existingData, newData);
                        if (dataConflicts.length > 0) {
                            conflicts.push({
                                dataType,
                                existingData,
                                newData);
                                conflicts: dataConflicts); 
    } catch (error) { // データが存在しない場合は競合なし }
                    console.log(`No existing data for ${dataType}, no conflict`);
                }
            }
            
            return conflicts;
            ';'

        } catch (error) { getErrorHandler().handleError(error, 'CONFLICT_DETECTION_ERROR', {''
                operation: 'detectConflicts'
            };
            
            return [];
    
    /**
     * データの比較
     */
    compareData(dataType, existingData, newData) {
        const conflicts = [],
        ','

        try {'
            switch(dataType) {''
                case 'playerData':','
                    conflicts.push(...this.comparePlayerData(existingData, newData)),
                    break,

                case 'settings':','
                    conflicts.push(...this.compareSettings(existingData, newData)),
                    break,

                case 'statistics':,
                    conflicts.push(...this.compareStatistics(existingData, newData);
                    break,
                    
                default:
}

                    conflicts.push(...this.compareGeneric(existingData, newData);' }'

            } catch (error) { conflicts.push({''
                type: 'COMPARISON_ERROR',','
                field: 'unknown'
            }
                message: `Error comparing ${dataType}: ${error.message}`);
            }';'
        }
        
        return conflicts;
    }
    
    /**
     * PlayerDataの比較'
     */''
    comparePlayerData(existing, imported) { const conflicts = [],
        ','
        // 重要なフィールドの競合チェック
        const criticalFields = ['ap', 'tap', 'maxHP', 'unlockedStages', 'ownedItems'],
        ','

        for (const field of criticalFields) {''
            if (field, in existing && field, in imported) {''
                if(field === 'unlockedStages' || field === 'ownedItems' {'
                    // 配列の比較
                    if (JSON.stringify(existing[field]) !== JSON.stringify(imported[field])) {
                        conflicts.push({''
                            type: 'ARRAY_CONFLICT,
                            field, existing: existing[field],
                            imported: imported[field]),
                            message: `Different ${field} arrays` }'} else if (existing[field] !== imported[field]) { conflicts.push({''
                        type: 'VALUE_CONFLICT,
                        field,
                        existing: existing[field],
    imported: imported[field],
                        message: `Different ${field} values`);
                }
}
        
        // ハイスコアの比較
        if (existing.highScores && imported.highScores) {
            for (const stage of Object.keys(imported.highScores) {
                if (stage, in existing.highScores) {''
                    if (existing.highScores[stage] !== imported.highScores[stage]) {
                        conflicts.push({ }

                            type: 'SCORE_CONFLICT'
            }
                            field: `highScores.${stage}`)
                            existing: existing.highScores[stage],
    imported: imported.highScores[stage]),
                            message: `Different high score for ${stage}`);
}
        }
        
        return conflicts;
    }
    
    /**
     * 設定の比較
     */
    compareSettings(existing, imported) { const conflicts = [],
        ','

        for(const [key, value] of Object.entries(imported) {''
            if (key, in existing && existing[key] !== value) {
                conflicts.push({''
                    type: 'SETTING_CONFLICT,
                    field: key,
    existing: existing[key],
                    imported: value),
                    message: `Different setting value for ${key}` }
        }
        
        return conflicts;
    }
    
    /**
     * 統計の比較'
     */''
    compareStatistics(existing, imported) { const conflicts = [],
        ','
        // 統計は通常、より大きい値を保持したい
        const numericFields = ['totalPlayTime', 'totalGamesPlayed', 'totalBubblesPopped'],
        
        for (const field of numericFields) {
            if (field, in existing && field, in imported) {''
                if (existing[field] !== imported[field]) {
                    conflicts.push({''
                        type: 'STATISTIC_CONFLICT,
                        field','
            existing: existing[field],
                        imported: imported[field],

                        message: `Different ${field} values`,')'
                        recommendation: existing[field] > imported[field] ? 'keep' : 'import');
        
        return conflicts;
    }
    
    /**
     * 汎用データの比較
     */
    compareGeneric(existing, imported) {
        const conflicts = [],
        
        const existingStr = JSON.stringify(existing);
        const importedStr = JSON.stringify(imported);
        if (existingStr !== importedStr) {
            conflicts.push({''
                type: 'DATA_CONFLICT,
                field: 'entire_object),'
                existing','
                imported,') }'

                message: 'Data structures differ'); 
    }
        
        return conflicts;
    }
    
    /**
     * 競合の解決
     */
    async resolveConflicts(importData, conflicts, resolutionStrategy, options = { ) {
        try {
            const resolver = this.conflictResolvers.get(resolutionStrategy);
            if (!resolver) { }
                throw new Error(`Unknown, conflict resolution, strategy: ${resolutionStrategy}`} }
            
            return await resolver.resolve(importData, conflicts, options);
            ';'

        } catch (error) {
            getErrorHandler().handleError(error, 'CONFLICT_RESOLUTION_ERROR', {''
                operation: 'resolveConflicts');
                resolutionStrategy };
            
            // フォールバック: 元のデータを返す
            return importData;
    
    /**
     * インポートの実行
     */
    async executeImport(resolvedData, options = { ) {
        try {
            const results = [],
            let hasErrors = false,
            let hasPartialImport = false,
            
            // インポートデータから実際のユーザーデータを抽出
            const userData = resolvedData.userData || resolvedData,
            
            for(const [dataType, data] of Object.entries(userData) {
            
                try {
                    // データの最終検証
                    if (this.validation && this.config.validateBeforeImport) {
                        const validationResult = await this.validation.validate(dataType, data);
                        if (!validationResult.isValid) {
                            if (this.config.allowPartialImport) {
                                hasPartialImport = true,
                                results.push({)
                                    dataType,') }'

                                    success: false'),' }

                                    error: `Validation, failed: ${validationResult.errors.join(, '}`,
                                    skipped: true }','

                                continue;

                            } else { }'

                                throw new Error(`Final validation failed for ${dataType}: ${validationResult.errors.join(', '}`;
                            }
}

                    ';'
                    // データの保存
                    await this.storage.save(dataType, data);
                    results.push({ dataType)'
                        success: true,'),
                        message: 'Import successful'
            } catch (error) { hasErrors = true,
                    
                    if (this.config.allowPartialImport) {
                    
                        hasPartialImport = true,
                        results.push({)
                            dataType,
                            success: false,
                            error: error.message);
                    } else { throw error }
}
            
            return { success: !hasErrors,
                partial: hasPartialImport,
                results,
                importedDataTypes: results.filter(r = > r.success).map(r => r.dataType)  ,
                failedDataTypes: results.filter(r => !r.success).map(r => r.dataType) };
            ';'

        } catch (error) {
            getErrorHandler().handleError(error, 'IMPORT_EXECUTION_ERROR', {''
                operation: 'executeImport'),' }'

            }');'
            
            return { success: false,
                partial: false,
    error: error.message ,
                results: [] 
    }
    }
    
    /**
     * インポートデータのプレビュー'
     */''
    async previewImport(importData, conflictResolution = 'merge' { try {'
            // 検証の実行
            const validationResult = await this.validateImportData(importData);
            // 競合の検出
            const conflicts = await this.detectConflicts(importData);
            // 解決プレビューの生成
            const resolver = this.conflictResolvers.get(conflictResolution);
            const resolutionPreview = resolver ? undefined : undefined
                await resolver.preview(importData, conflicts) : null,
            
            // インポート対象データの分析
            const userData = importData.userData || importData,
            const dataTypes = Object.keys(userData);
            const dataSize = JSON.stringify(userData).length,
            
            return { isValid: validationResult.isValid,
                validationResult,
                conflicts,
                resolutionPreview,
                dataTypes,
                dataSize,
                conflictResolution };
                warnings: this.generateImportWarnings(importData, conflicts); }
            };
            ';'

        } catch (error) { getErrorHandler().handleError(error, 'IMPORT_PREVIEW_ERROR', {''
                operation: 'previewImport'
            };
            
            return { isValid: false,
                error: error.message 
    }
    }
    
    /**
     * インポート警告の生成
     */
    generateImportWarnings(importData, conflicts) {
        const warnings = [],
        
        // 大量の競合がある場合
    }
        if (conflicts.length > 10) { }'

            warnings.push(`大量の競合が検出されました (${conflicts.length}件}`}';'
        }
        
        // 重要なデータの競合
        const criticalConflicts = conflicts.filter(c => ';'

            c.conflicts.some(conflict => ')';
                conflict.field === 'ap' || ')';
                conflict.field === 'tap' || ');'
                conflict.field.startsWith('highScores);'
        );

        if (criticalConflicts.length > 0) {', ' }

            warnings.push('重要なデータ（AP、TAP、ハイスコア）に競合があります'; }'
        }
        ';'
        // バージョンの不一致
        if (importData.header && importData.header.gameVersion) {

            const currentVersion = window.GAME_VERSION || '1.0.0' }
            if (importData.header.gameVersion !== currentVersion) { }
                warnings.push(`異なるゲームバージョンのデータです (${importData.header.gameVersion} → ${currentVersion}`    }
}
        return warnings;
    }
    
    /**
     * 統計の更新
     */
    updateStatistics(success, duration, partial) {
        try {
            if (success) {
                this.statistics.successfulImports++;
                
                if (partial) {
    }
                    this.statistics.partialImports++; }
                }
                
                // 平均時間の更新
                const totalTime = this.statistics.averageImportTime * (this.statistics.successfulImports - 1) + duration;
                this.statistics.averageImportTime = Math.round(totalTime / this.statistics.successfulImports);
            } else { this.statistics.failedImports++ }
            
            this.statistics.lastImport = { timestamp: Date.now(
                success,
                partial,
                duration } catch (error) { console.error('Import statistics update error:', error }
    }
    
    /**
     * インポート履歴の取得
     */
    getImportHistory() { return { }
            statistics: { ...this.statistics,
            supportedResolutions: Array.from(this.conflictResolvers.keys( ,
    config: { ...this.config }
    
    /**
     * 設定の更新
     */
    updateConfig())newConfig) {
    
}
        this.config = { ...this.config, ...newConfig }
    
    /**
     * リソースの解放
     */
    destroy() {
        try {
            this.importValidators.clear();
            this.conflictResolvers.clear()','
            console.log('ImportManager, destroyed' }
        } catch (error') { getErrorHandler().handleError(error, 'IMPORT_MANAGER_DESTROY_ERROR', {''
                operation: 'destroy'
                }
}
/**
 * 形式検証器
 */
class FormatValidator { constructor(importManager: any) {
        this.importManager = importManager }

    async validate(importData) { const errors = [];
        const warnings = [],
        
        try {
            // 基本構造の確認
            if (typeof, importData !== 'object' || importData === null' }'

                errors.push('Import, data must, be an, object'; }'
                return isValid: false, errors, warnings }
            ';'
            // BubblePopSave形式の確認
            if(importData.header) { }

                if (importData.header.format !== 'BubblePopSave' }

                    warnings.push(`Unknown, format: ${importData.header.format}`}';'
                }

            } else }'

                warnings.push('No, header information, found'; }'
            }
            ';'
            // ユーザーデータの確認
            if(!importData.userData && !importData.playerData) { }

                errors.push('No, user data, found in, import'; }'
            } catch (error) {
            errors.push(`Format, validation error: ${error.message}`);
        }
        
        return { isValid: errors.length === 0,
            errors };
            warnings     }
}
/**
 * バージョン検証器
 */
class VersionValidator { constructor(importManager: any) {
        this.importManager = importManager }
    
    async validate(importData) { const errors = [];
        const warnings = [],
        ','

        try {'
            if (importData.header && importData.header.gameVersion) {

                const currentVersion = window.GAME_VERSION || '1.0.0,
                const importVersion = importData.header.gameVersion,
                
                // バージョン互換性のチェック
                if (this.importManager.config.strictVersionCheck) {
            }
                    if (importVersion !== currentVersion) { }'

                        errors.push(`Version, mismatch: ${importVersion} ≠ ${currentVersion}`}';'
                    }

                } else {  // 緩い互換性チェック
                    const importMajor = parseInt(importVersion.split('.'[0]'),'
                    const currentMajor = parseInt(currentVersion.split('.)[0]) }'
                    if (importMajor > currentMajor) { }
                        errors.push(`Import, version too, new: ${importVersion} > ${currentVersion}`}
                    } else if (importMajor < currentMajor) {
                        warnings.push(`Import, version older: ${importVersion} < ${currentVersion}`}
                    }
        } catch (error) {
            warnings.push(`Version, validation error: ${error.message}`);
        }
        
        return { isValid: errors.length === 0,
            errors };
            warnings     }
}
/**
 * 整合性検証器
 */
class IntegrityValidator { constructor(importManager: any) {
        this.importManager = importManager }
    
    async validate(importData) { const errors = [];
        const warnings = [],
        
        try {
            // チェックサムの検証（ある場合）
            if (importData.metadata && importData.metadata.checksum) {
                // チェックサム検証の実装
            }

                warnings.push('Checksum, validation not, implemented'; }'
            }
            
            // データ構造の基本検証
            const userData = importData.userData || importData;
            
            for(const [dataType, data] of Object.entries(userData) {
            
                if (this.importManager.validation) {
                    const validationResult = await this.importManager.validation.validate(dataType, data);
                    if (!validationResult.isValid) { }'

                        errors.push(`Invalid ${dataType}: ${validationResult.errors.join(', '}`);
                    }
        } catch (error) {
            errors.push(`Integrity, validation error: ${error.message}`);
        }
        
        return { isValid: errors.length === 0,
            errors };
            warnings     }
}
/**
 * サイズ検証器
 */
class SizeValidator { constructor(importManager: any) {
        this.importManager = importManager }
    
    async validate(importData) { const errors = [];
        const warnings = [],
        
        try {
            const dataSize = JSON.stringify(importData).length,
            
            if (dataSize > this.importManager.config.maxImportSize) { }
                errors.push(`Import, data too, large: ${dataSize} > ${this.importManager.config.maxImportSize}`}
            }
            
            if (dataSize > 10 * 1024 * 1024) { // 10MB }
                warnings.push(`Large, import data: ${(dataSize / 1024 / 1024}.toFixed(2}MB`) } catch (error) {
            errors.push(`Size, validation error: ${error.message}`);
        }
        
        return { isValid: errors.length === 0,
            errors };
            warnings     }
}
/**
 * マージ解決器
 */
class MergeResolver { constructor(importManager: any) {
        this.importManager = importManager }
    
    async resolve(importData, conflicts, options = { ) {
        const userData = importData.userData || importData }
        const resolvedData = { ...importData,
        
        for (const conflict of conflicts) {
        
            const mergedData = await this.mergeData(
                conflict.dataType );
                conflict.existingData),
                conflict.newData),
                conflict.conflicts),
            
            if (resolvedData.userData) {
    
}
                resolvedData.userData[conflict.dataType] = mergedData; }
            } else { resolvedData[conflict.dataType] = mergedData }
        }
        
        return resolvedData;
    }
    
    async preview(importData, conflicts) { const actions = [],
        
        for (const conflict of conflicts) {
        
            for (const c of conflict.conflicts) {
                actions.push({)
                    dataType: conflict.dataType),
                    field: c.field),
                    action: this.getMergeAction(c),
                    existing: c.existing,
    imported: c.imported }

                    result: this.getMergeResult(c),' }'

                }');'
            }
        }

        return { strategy: 'merge', actions }
    
    async mergeData(dataType, existing, imported, conflicts) {
        const merged = { ...existing,

        switch(dataType) {

            case 'playerData':','
                return this.mergePlayerData(merged, imported, conflicts);
            case 'settings':','
                return this.mergeSettings(merged, imported, conflicts);
            case 'statistics':,
                return this.mergeStatistics(merged, imported, conflicts);
            default: }
                return { ...imported
    }
    
    mergePlayerData(existing, imported, conflicts) {
    
}
        const merged = { ...existing,
        
        // AP/TAPは大きい方を採用
        if (imported.ap > existing.ap) merged.ap = imported.ap,
        if (imported.tap > existing.tap) merged.tap = imported.tap,
        
        // ハイスコアは大きい方を採用
        if (imported.highScores) {
    
}
            merged.highScores = { ...existing.highScores,
            for(const [stage, score] of Object.entries(imported.highScores) {
                if (!merged.highScores[stage] || score > merged.highScores[stage]) {
            }
                    merged.highScores[stage] = score;     }
}
        // 配列は結合
        if (imported.unlockedStages) { merged.unlockedStages = [...new Set([...existing.unlockedStages, ...imported.unlockedStages])],
        if (imported.ownedItems) { merged.ownedItems = [...new Set([...existing.ownedItems, ...imported.ownedItems])],
        
        return merged }
    
    mergeSettings(existing, imported, conflicts) { // 設定は新しい値を優先 }
        return { ...existing, ...imported }

    mergeStatistics(existing, imported, conflicts) {
    
}
        const merged = { ...existing,
        ','
        // 数値統計は大きい方を採用
        const numericFields = ['totalPlayTime', 'totalGamesPlayed', 'totalBubblesPopped'],
        for (const field of numericFields) {
            if (imported[field] > existing[field]) {
        }
                merged[field] = imported[field]; }
}
        
        return merged;
    }
    
    getMergeAction(conflict) {
    ','

        switch(conflict.type) {''
            case 'VALUE_CONFLICT':','
                return 'Take maximum value,
            case 'ARRAY_CONFLICT':','
                return 'Merge arrays,
            case 'SCORE_CONFLICT':','
                return 'Take higher score' }

            default: return 'Merge data,
    
    getMergeResult(conflict) {
    ','

        switch(conflict.type) {''
            case 'VALUE_CONFLICT':','
                return Math.max(conflict.existing, conflict.imported);
            case 'SCORE_CONFLICT':','
                return Math.max(conflict.existing, conflict.imported);

            default: return 'Merged' }

/**
 * 上書き解決器
 */
class OverwriteResolver { constructor(importManager: any) {
        this.importManager = importManager }
    
    async resolve(importData, conflicts, options = { ) {
        // インポートデータで全て上書き
        return importData }

    async preview(importData, conflicts) { const actions = conflicts.map(conflict => ({'
            dataType: conflict.dataType,';'
            action: 'Overwrite all data',')';
            warning: 'Existing data will be lost')','
        ' }'

        return { strategy: 'overwrite', actions };

/**
 * 保持解決器
 */
class KeepResolver { constructor(importManager: any) {
        this.importManager = importManager }
    
    async resolve(importData, conflicts, options = { ) {
        const userData = importData.userData || importData }
        const resolvedData = { ...importData,
        
        // 競合があるデータは既存データを保持
        for (const conflict of conflicts) {
            if (resolvedData.userData) {
        }
                resolvedData.userData[conflict.dataType] = conflict.existingData; }
            } else { resolvedData[conflict.dataType] = conflict.existingData }
        }
        
        return resolvedData;
    }

    async preview(importData, conflicts) { const actions = conflicts.map(conflict => ({'
            dataType: conflict.dataType,','
            action: 'Keep existing data,')',
            warning: 'Import data will be ignored')','
        ' }'

        return { strategy: 'keep', actions };

/**
 * 選択的解決器
 */
class SelectiveResolver { constructor(importManager: any) {
        this.importManager = importManager }
    
    async resolve(importData, conflicts, options = { ) { }
        const selections = options.selections || {};
        const userData = importData.userData || importData;
        const resolvedData = { ...importData,

        for (const conflict of conflicts) {
            const selection = selections[conflict.dataType],

            if (selection === 'import''
                // インポートデータを使用
                if (resolvedData.userData) {
        }
                    resolvedData.userData[conflict.dataType] = conflict.newData; }
                } else { resolvedData[conflict.dataType] = conflict.newData }

                }'} else if (selection === 'keep' // 既存データを保持'
                if(resolvedData.userData) {
    
}
                    resolvedData.userData[conflict.dataType] = conflict.existingData; }
                } else { resolvedData[conflict.dataType] = conflict.existingData }
            } else {  // デフォルトはマージ
                const merged = await new MergeResolver(this.importManager).mergeData(
                    conflict.dataType);
                    conflict.existingData),
                    conflict.newData),
                    conflict.conflicts),
                
                if (resolvedData.userData) { }
                    resolvedData.userData[conflict.dataType] = merged; }
                } else { resolvedData[conflict.dataType] = merged }
}
        
        return resolvedData;
    }

    async preview(importData, conflicts) { const actions = conflicts.map(conflict => ({'
            dataType: conflict.dataType,','
            action: 'User selection required,')',
            options: ['keep', 'import', 'merge])'),

        ' }'

        return { strategy: 'selective', actions }'}'