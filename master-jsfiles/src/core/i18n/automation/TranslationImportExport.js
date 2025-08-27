import { getErrorHandler } from '../../../utils/ErrorHandler.js';
import { getTranslationKeyManager } from '../management/TranslationKeyManager.js';
import { getProgressTracker } from '../management/ProgressTracker.js';

/**
 * 翻訳インポート・エクスポートクラス - 翻訳データの外部形式対応
 */
export class TranslationImportExport {
    constructor() {
        this.keyManager = getTranslationKeyManager();
        this.progressTracker = getProgressTracker();
        
        // サポートするファイル形式
        this.supportedFormats = new Map([
            ['json', { 
                name: 'JSON', 
                extensions: ['.json'], 
                mimeType: 'application/json',
                supportsNesting: true,
                supportsMetadata: true
            }],
            ['csv', { 
                name: 'CSV', 
                extensions: ['.csv'], 
                mimeType: 'text/csv',
                supportsNesting: false,
                supportsMetadata: false
            }],
            ['xlsx', { 
                name: 'Excel', 
                extensions: ['.xlsx', '.xls'], 
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                supportsNesting: false,
                supportsMetadata: true
            }],
            ['xml', { 
                name: 'XML', 
                extensions: ['.xml'], 
                mimeType: 'application/xml',
                supportsNesting: true,
                supportsMetadata: true
            }],
            ['properties', { 
                name: 'Properties', 
                extensions: ['.properties'], 
                mimeType: 'text/plain',
                supportsNesting: false,
                supportsMetadata: false
            }]
        ]);
        
        // エクスポート設定
        this.exportConfig = {
            includeMetadata: true,
            includeComments: true,
            includeEmptyKeys: false,
            sortKeys: true,
            flattenStructure: false,
            encoding: 'UTF-8',
            dateFormat: 'ISO',
            includeStatistics: true
        };
        
        // インポート設定
        this.importConfig = {
            validateKeys: true,
            preserveExisting: true,
            autoDetectFormat: true,
            strictMode: false,
            skipInvalidEntries: true,
            updateMetadata: true,
            createBackup: true
        };
        
        console.log('TranslationImportExport initialized');
    }
    
    /**
     * 翻訳データをエクスポート
     */
    async exportTranslations(language, options = {}) {
        try {
            const {
                format = 'json',
                categories = [],
                outputPath = null,
                includeMetadata = this.exportConfig.includeMetadata,
                includeEmptyKeys = this.exportConfig.includeEmptyKeys,
                flattenStructure = this.exportConfig.flattenStructure,
                customConfig = {}
            } = options;
            
            // フォーマット検証
            if (!this.supportedFormats.has(format)) {
                throw new Error(`Unsupported export format: ${format}`);
            }
            
            const formatInfo = this.supportedFormats.get(format);
            console.log(`Exporting translations for ${language} in ${formatInfo.name} format`);
            
            // 翻訳データを収集
            const translationData = await this.collectTranslationData(language, {
                categories: categories,
                includeMetadata: includeMetadata,
                includeEmptyKeys: includeEmptyKeys
            });
            
            if (!translationData) {
                throw new Error(`No translation data found for language: ${language}`);
            }
            
            // フォーマット別エクスポート
            const exportedContent = await this.formatExportData(
                translationData,
                format,
                {
                    flattenStructure: flattenStructure,
                    language: language,
                    ...customConfig
                }
            );
            
            // 統計情報を生成
            const statistics = this.generateExportStatistics(translationData, format);
            
            const exportResult = {
                success: true,
                language: language,
                format: format,
                fileName: `${language}_translations.${formatInfo.extensions[0].substring(1)}`,
                content: exportedContent,
                size: exportedContent.length,
                statistics: statistics,
                exportedAt: new Date().toISOString(),
                outputPath: outputPath
            };
            
            // ファイル出力（実際の実装では適切な方法で）
            if (outputPath) {
                console.log(`Export would be saved to: ${outputPath}/${exportResult.fileName}`);
            }
            
            console.log(`Successfully exported ${statistics.totalKeys} keys in ${format} format`);
            return exportResult;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'TRANSLATION_IMPORT_EXPORT_ERROR', {
                operation: 'exportTranslations',
                language: language,
                format: options.format
            });
            
            return {
                success: false,
                error: error.message,
                language: language,
                format: options.format || 'json'
            };
        }
    }
    
    /**
     * 翻訳データをインポート
     */
    async importTranslations(content, options = {}) {
        try {
            const {
                format = 'auto',
                language = null,
                validateKeys = this.importConfig.validateKeys,
                preserveExisting = this.importConfig.preserveExisting,
                strictMode = this.importConfig.strictMode,
                createBackup = this.importConfig.createBackup,
                customConfig = {}
            } = options;
            
            // フォーマット自動検出
            const detectedFormat = format === 'auto' ? 
                this.detectFileFormat(content, options.fileName) : format;
            
            if (!this.supportedFormats.has(detectedFormat)) {
                throw new Error(`Unsupported import format: ${detectedFormat}`);
            }
            
            console.log(`Importing translations in ${detectedFormat} format`);
            
            // バックアップ作成
            let backupData = null;
            if (createBackup && language) {
                backupData = await this.createBackup(language);
            }
            
            // コンテンツをパース
            const parsedData = await this.parseImportContent(content, detectedFormat, {
                strictMode: strictMode,
                ...customConfig
            });
            
            if (!parsedData) {
                throw new Error('Failed to parse import content');
            }
            
            // データを検証
            const validationResult = await this.validateImportData(parsedData, {
                validateKeys: validateKeys,
                language: language,
                strictMode: strictMode
            });
            
            if (!validationResult.valid && strictMode) {
                throw new Error(`Import validation failed: ${validationResult.errors.join(', ')}`);
            }
            
            // 翻訳データを統合
            const integrationResult = await this.integrateTranslationData(
                parsedData,
                language || parsedData.language,
                {
                    preserveExisting: preserveExisting,
                    validationResult: validationResult
                }
            );
            
            const importResult = {
                success: true,
                language: language || parsedData.language,
                format: detectedFormat,
                statistics: {
                    totalKeys: integrationResult.totalKeys,
                    importedKeys: integrationResult.importedKeys,
                    skippedKeys: integrationResult.skippedKeys,
                    updatedKeys: integrationResult.updatedKeys,
                    newKeys: integrationResult.newKeys
                },
                validation: validationResult,
                backup: backupData ? {
                    created: true,
                    timestamp: backupData.timestamp
                } : null,
                importedAt: new Date().toISOString()
            };
            
            console.log(`Successfully imported ${importResult.statistics.importedKeys} keys`);
            return importResult;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'TRANSLATION_IMPORT_EXPORT_ERROR', {
                operation: 'importTranslations',
                format: options.format
            });
            
            return {
                success: false,
                error: error.message,
                format: options.format || 'auto'
            };
        }
    }
    
    /**
     * 翻訳データの差分管理
     */
    async manageDifferences(baseVersion, newVersion, options = {}) {
        const {
            generatePatch = true,
            includeMetadata = true,
            ignoreWhitespace = true,
            contextLines = 3
        } = options;
        
        const differences = {
            timestamp: new Date().toISOString(),
            baseVersion: baseVersion,
            newVersion: newVersion,
            changes: {
                added: new Map(),
                modified: new Map(),
                deleted: new Map()
            },
            statistics: {
                totalChanges: 0,
                addedCount: 0,
                modifiedCount: 0,
                deletedCount: 0
            }
        };
        
        // 基準データと新データを平坦化
        const baseFlat = this.flattenTranslationData(baseVersion);
        const newFlat = this.flattenTranslationData(newVersion);
        
        // 追加されたキーを検出
        for (const [key, value] of Object.entries(newFlat)) {
            if (!baseFlat.hasOwnProperty(key)) {
                differences.changes.added.set(key, {
                    key: key,
                    value: value,
                    type: 'added'
                });
                differences.statistics.addedCount++;
            }
        }
        
        // 削除されたキーを検出
        for (const [key, value] of Object.entries(baseFlat)) {
            if (!newFlat.hasOwnProperty(key)) {
                differences.changes.deleted.set(key, {
                    key: key,
                    value: value,
                    type: 'deleted'
                });
                differences.statistics.deletedCount++;
            }
        }
        
        // 変更されたキーを検出
        for (const [key, newValue] of Object.entries(newFlat)) {
            if (baseFlat.hasOwnProperty(key)) {
                const baseValue = baseFlat[key];
                if (!this.compareValues(baseValue, newValue, { ignoreWhitespace })) {
                    differences.changes.modified.set(key, {
                        key: key,
                        oldValue: baseValue,
                        newValue: newValue,
                        type: 'modified'
                    });
                    differences.statistics.modifiedCount++;
                }
            }
        }
        
        differences.statistics.totalChanges = 
            differences.statistics.addedCount + 
            differences.statistics.modifiedCount + 
            differences.statistics.deletedCount;
        
        // パッチ生成
        if (generatePatch) {
            differences.patch = this.generatePatch(differences, {
                contextLines: contextLines,
                includeMetadata: includeMetadata
            });
        }
        
        return differences;
    }
    
    /**
     * バックアップ機能
     */
    async createBackup(language, options = {}) {
        const {
            includeMetadata = true,
            compressionLevel = 'normal',
            description = 'Automatic backup before import'
        } = options;
        
        const timestamp = new Date().toISOString();
        const backupId = `backup_${language}_${Date.now()}`;
        
        // 現在の翻訳データを収集
        const translationData = await this.collectTranslationData(language, {
            includeMetadata: includeMetadata
        });
        
        const backup = {
            id: backupId,
            language: language,
            timestamp: timestamp,
            description: description,
            version: '1.0.0',
            data: translationData,
            statistics: this.generateExportStatistics(translationData, 'json'),
            metadata: {
                creator: 'TranslationImportExport',
                compressionLevel: compressionLevel,
                originalSize: JSON.stringify(translationData).length
            }
        };
        
        // 圧縮（実際の実装では適切な圧縮を使用）
        if (compressionLevel !== 'none') {
            backup.compressed = true;
            backup.metadata.compressedSize = Math.floor(backup.metadata.originalSize * 0.7); // モック
        }
        
        console.log(`Created backup ${backupId} for ${language}`);
        return backup;
    }
    
    /**
     * 復元機能
     */
    async restoreFromBackup(backup, options = {}) {
        const {
            validateBackup = true,
            confirmRestore = true,
            createRestorePoint = true
        } = options;
        
        if (validateBackup) {
            const isValid = this.validateBackup(backup);
            if (!isValid.valid) {
                throw new Error(`Invalid backup: ${isValid.errors.join(', ')}`);
            }
        }
        
        // 現在の状態の復元ポイントを作成
        let restorePoint = null;
        if (createRestorePoint) {
            restorePoint = await this.createBackup(backup.language, {
                description: 'Restore point before backup restoration'
            });
        }
        
        // バックアップからデータを復元
        const restorationResult = await this.integrateTranslationData(
            backup.data,
            backup.language,
            {
                preserveExisting: false, // バックアップは完全復元
                isRestore: true
            }
        );
        
        const restoreResult = {
            success: true,
            backupId: backup.id,
            language: backup.language,
            restoredAt: new Date().toISOString(),
            originalTimestamp: backup.timestamp,
            statistics: {
                restoredKeys: restorationResult.importedKeys,
                totalKeys: restorationResult.totalKeys
            },
            restorePoint: restorePoint ? {
                id: restorePoint.id,
                timestamp: restorePoint.timestamp
            } : null
        };
        
        console.log(`Successfully restored backup ${backup.id} for ${backup.language}`);
        return restoreResult;
    }
    
    /**
     * ヘルパー関数群
     */
    
    async collectTranslationData(language, options = {}) {
        const { categories = [], includeMetadata = true, includeEmptyKeys = false } = options;
        
        try {
            // ProgressTrackerから翻訳データを取得
            const languageProgress = this.progressTracker.getLanguageProgress(language);
            if (!languageProgress) {
                return null;
            }
            
            const translationData = {
                _metadata: includeMetadata ? {
                    language: language,
                    exportedAt: new Date().toISOString(),
                    version: '1.0.0',
                    progress: languageProgress,
                    exporter: 'TranslationImportExport'
                } : undefined
            };
            
            // モック翻訳データ（実際の実装では適切にデータを取得）
            const mockCategories = {
                common: {
                    ok: language === 'en' ? 'OK' : 'OK',
                    cancel: language === 'en' ? 'Cancel' : 'キャンセル',
                    save: language === 'en' ? 'Save' : '保存'
                },
                menu: {
                    play: language === 'en' ? 'Play' : 'プレイ',
                    settings: language === 'en' ? 'Settings' : '設定',
                    help: language === 'en' ? 'Help' : 'ヘルプ'
                }
            };
            
            const targetCategories = categories.length > 0 ? categories : Object.keys(mockCategories);
            
            for (const category of targetCategories) {
                if (mockCategories[category]) {
                    translationData[category] = mockCategories[category];
                }
            }
            
            return translationData;
            
        } catch (error) {
            console.warn(`Failed to collect translation data for ${language}:`, error);
            return null;
        }
    }
    
    async formatExportData(translationData, format, options = {}) {
        const { flattenStructure = false, language = 'unknown' } = options;
        
        switch (format) {
            case 'json':
                return JSON.stringify(translationData, null, 2);
                
            case 'csv':
                return this.convertToCSV(translationData, { flattenStructure });
                
            case 'xlsx':
                return this.convertToXLSX(translationData, { flattenStructure });
                
            case 'xml':
                return this.convertToXML(translationData, { language });
                
            case 'properties':
                return this.convertToProperties(translationData, { flattenStructure });
                
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
    
    detectFileFormat(content, fileName = '') {
        // ファイル拡張子から推測
        if (fileName) {
            const extension = fileName.toLowerCase().match(/\.[^.]+$/)?.[0];
            for (const [format, info] of this.supportedFormats) {
                if (info.extensions.includes(extension)) {
                    return format;
                }
            }
        }
        
        // コンテンツから推測
        const trimmed = content.trim();
        
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            return 'json';
        }
        if (trimmed.startsWith('<?xml') || trimmed.startsWith('<')) {
            return 'xml';
        }
        if (trimmed.includes(',') && trimmed.includes('\n')) {
            return 'csv';
        }
        if (trimmed.includes('=') && !trimmed.includes(',')) {
            return 'properties';
        }
        
        return 'json'; // デフォルト
    }
    
    async parseImportContent(content, format, options = {}) {
        const { strictMode = false } = options;
        
        try {
            switch (format) {
                case 'json':
                    return JSON.parse(content);
                    
                case 'csv':
                    return this.parseCSV(content, options);
                    
                case 'xlsx':
                    return this.parseXLSX(content, options);
                    
                case 'xml':
                    return this.parseXML(content, options);
                    
                case 'properties':
                    return this.parseProperties(content, options);
                    
                default:
                    throw new Error(`Unsupported import format: ${format}`);
            }
        } catch (error) {
            if (strictMode) {
                throw error;
            }
            console.warn(`Failed to parse ${format} content:`, error);
            return null;
        }
    }
    
    convertToCSV(data, options = {}) {
        const { flattenStructure = true } = options;
        const flattened = flattenStructure ? this.flattenTranslationData(data) : data;
        
        const rows = [['Key', 'Value', 'Category', 'Notes']];
        
        for (const [key, value] of Object.entries(flattened)) {
            if (key.startsWith('_')) continue; // メタデータをスキップ
            
            const category = this.keyManager.categorizeKey(key);
            rows.push([
                `"${key}"`,
                `"${String(value).replace(/"/g, '""')}"`,
                `"${category}"`,
                '""'
            ]);
        }
        
        return rows.map(row => row.join(',')).join('\n');
    }
    
    parseCSV(content, options = {}) {
        const lines = content.split('\n').map(line => line.trim()).filter(line => line);
        if (lines.length < 2) {
            throw new Error('Invalid CSV format: missing header or data');
        }
        
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        const keyIndex = headers.findIndex(h => h.toLowerCase().includes('key'));
        const valueIndex = headers.findIndex(h => h.toLowerCase().includes('value'));
        
        if (keyIndex === -1 || valueIndex === -1) {
            throw new Error('Invalid CSV format: missing key or value columns');
        }
        
        const translations = {};
        
        for (let i = 1; i < lines.length; i++) {
            const cells = lines[i].split(',').map(c => c.replace(/"/g, '').trim());
            if (cells.length > keyIndex && cells.length > valueIndex) {
                const key = cells[keyIndex];
                const value = cells[valueIndex];
                if (key && value) {
                    translations[key] = value;
                }
            }
        }
        
        return { translations };
    }
    
    flattenTranslationData(data, prefix = '') {
        const flattened = {};
        
        for (const [key, value] of Object.entries(data)) {
            if (key.startsWith('_')) continue; // メタデータをスキップ
            
            const fullKey = prefix ? `${prefix}.${key}` : key;
            
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                Object.assign(flattened, this.flattenTranslationData(value, fullKey));
            } else {
                flattened[fullKey] = value;
            }
        }
        
        return flattened;
    }
    
    generateExportStatistics(translationData, format) {
        const flattened = this.flattenTranslationData(translationData);
        
        return {
            totalKeys: Object.keys(flattened).length,
            emptyKeys: Object.values(flattened).filter(v => !v || v.trim() === '').length,
            format: format,
            categories: Array.from(new Set(
                Object.keys(flattened).map(key => this.keyManager.categorizeKey(key))
            )),
            estimatedFileSize: JSON.stringify(translationData).length
        };
    }
    
    /**
     * サポートフォーマットを取得
     */
    getSupportedFormats() {
        return Array.from(this.supportedFormats.entries()).map(([code, info]) => ({
            code: code,
            name: info.name,
            extensions: info.extensions,
            mimeType: info.mimeType,
            supportsNesting: info.supportsNesting,
            supportsMetadata: info.supportsMetadata
        }));
    }
    
    /**
     * 統計情報を取得
     */
    getStats() {
        return {
            supportedFormats: this.supportedFormats.size,
            exportConfig: this.exportConfig,
            importConfig: this.importConfig,
            operationsPerformed: 0 // 実際の実装では操作数を追跡
        };
    }
}

// シングルトンインスタンス
let translationImportExportInstance = null;

/**
 * TranslationImportExportのシングルトンインスタンスを取得
 */
export function getTranslationImportExport() {
    if (!translationImportExportInstance) {
        translationImportExportInstance = new TranslationImportExport();
    }
    return translationImportExportInstance;
}