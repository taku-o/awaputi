// TypeScript conversion - basic types
interface BasicConfig { 
    [key: string]: any;
}

import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * エクスポート管理クラス - データエクスポート機能
 * 
 * 責任:
 * - 複数形式でのデータエクスポート
 * - エクスポートデータの検証
 * - メタデータ付与
 * - ファイルダウンロード処理
 */
export class ExportManager {
    private config: BasicConfig;
    private storage: any;
    private validation: any;
    private version: string;
    private exportFormats: Map<string, any>;
    private statistics: any;

    constructor(dataStorage: any, validationManager: any = null) {
        this.storage = dataStorage;
        this.validation = validationManager;
        this.version = '1.0.0';
        
        // エクスポート形式
        this.exportFormats = new Map();
        
        this.config = {
            defaultFormat: 'json',
            includeMetadata: true,
            validateBeforeExport: true,
            compressLargeExports: true,
            compressionThreshold: 10 * 1024, // 10KB
            maxExportSize: 50 * 1024 * 1024 // 50MB 
        };
        
        // エクスポート統計
        this.statistics = {
            totalExports: 0,
            successfulExports: 0,
            failedExports: 0,
            averageExportSize: 0,
            averageExportTime: 0,
            lastExport: null
        };
        
        this.initialize();
    }
    
    /**
     * ExportManagerの初期化
     */
    initialize(): void {
        try {
            // エクスポート形式の登録
            this.registerExportFormats();
            console.log('ExportManager initialized');
        } catch (error) {
            getErrorHandler().handleError(error, 'EXPORT_MANAGER_INITIALIZATION_ERROR', {
                operation: 'initialize'
            });
        }
    }
    
    /**
     * エクスポート形式の登録
     */
    registerExportFormats(): void {
        this.exportFormats.set('json', new JSONExporter(this));
        
        // 圧縮JSON形式
        this.exportFormats.set('compressed', new CompressedExporter(this));
        
        // 暗号化形式（SecurityManagerと統合時に有効化）
        this.exportFormats.set('encrypted', new EncryptedExporter(this));
        
        // CSV形式（統計データ用）
        this.exportFormats.set('csv', new CSVExporter(this));
        
        // テキスト形式（人間が読める形式）
        this.exportFormats.set('text', new TextExporter(this));
    }
    
    /**
     * データのエクスポート
     */
    async exportData(dataType = 'all', format = 'json', options = {}): Promise<any> {
        try {
            this.statistics.totalExports++;
            const startTime = performance.now();
            
            // エクスポート形式の確認
            const exporter = this.exportFormats.get(format);
            if (!exporter) {
                throw new Error(`Unknown export format: ${format}`);
            }
            
            // データの収集
            const data = await this.collectExportData(dataType);
            
            // データの検証
            if (this.config.validateBeforeExport && this.validation) {
                const validationResult = await this.validation.validate(dataType, data);
                if (!validationResult.isValid) {
                    console.warn('Export data validation warnings:', validationResult.warnings);
                    // 警告があっても続行（エラーの場合は例外を投げる）
                    if (validationResult.errors.length > 0) {
                        throw new Error(`Export data validation failed: ${validationResult.errors.join(', ')}`);
                    }
                }
            }
            
            // メタデータの作成
            const metadata = this.createExportMetadata(dataType, data, format, options);
            
            // エクスポートデータの構築
            const exportData = {
                header: {
                    format: "BubblePopSave",
                    version: this.version,
                    exportedAt: new Date().toISOString(),
                    gameVersion: (window as any).GAME_VERSION || '1.0.0',
                    platform: 'web',
                    language: navigator.language || 'ja'
                },
                metadata,
                userData: data
            };
            
            // サイズチェック
            const dataSize = JSON.stringify(exportData).length;
            if (dataSize > this.config.maxExportSize) {
                throw new Error(`Export data too large: ${dataSize} bytes > ${this.config.maxExportSize} bytes`);
            }
            
            // エクスポート処理
            const result = await exporter.export(exportData, options);
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // パフォーマンス要件チェック（< 2000ms）
            if (duration > 2000) {
                console.warn(`Export took ${duration.toFixed(2)}ms, exceeding target of 2000ms`);
            }
            
            // 統計の更新
            this.updateStatistics(true, duration, result.size || dataSize);
            
            return {
                success: true,
                format,
                dataType,
                size: result.size || dataSize,
                duration,
                filename: result.filename,
                data: result.data,
                metadata
            };

        } catch (error) {
            this.updateStatistics(false, 0, 0);
            getErrorHandler().handleError(error, 'EXPORT_ERROR', {
                operation: 'exportData',
                dataType,
                format,
                options
            });
            
            return {
                success: false,
                error: error.message,
                format,
                dataType
            };
        }
    }

    /**
     * エクスポートデータの収集
     */
    async collectExportData(dataType: any): Promise<any> {
        try {
            const exportData: any = {};

            if (dataType === 'all') {
                // 全データのエクスポート
                exportData.playerData = await this.storage.load('playerData');
                exportData.settings = await this.storage.load('settings');
                exportData.statistics = await this.storage.load('statistics');
                exportData.achievements = await this.storage.load('achievements');
                
                // nullデータの除去
                Object.keys(exportData).forEach(key => {
                    if (exportData[key] === null || exportData[key] === undefined) {
                        delete exportData[key];
                    }
                });
                
            } else if (Array.isArray(dataType)) {
                // 複数データタイプのエクスポート
                for (const type of dataType) {
                    const data = await this.storage.load(type);
                    if (data !== null && data !== undefined) {
                        exportData[type] = data;
                    }
                }
                
            } else {
                // 単一データタイプのエクスポート
                const data = await this.storage.load(dataType);
                if (data !== null && data !== undefined) {
                    exportData[dataType] = data;
                } else {
                    throw new Error(`No data found for type: ${dataType}`);
                }
            }

            return exportData;

        } catch (error) {
            getErrorHandler().handleError(error, 'EXPORT_DATA_COLLECTION_ERROR', {
                operation: 'collectExportData',
                dataType
            });
            
            throw error;
        }
    }
    
    /**
     * エクスポートメタデータの作成
     */
    createExportMetadata(dataType: any, data: any, format: string, options: any): any {
        const dataSize = JSON.stringify(data).length;

        return {
            dataTypes: Array.isArray(dataType) ? dataType :
                       dataType === 'all' ? Object.keys(data) : [dataType],
            format,
            originalDataType: dataType,
            dataSize,
            compressed: format === 'compressed' ||
                       (this.config.compressLargeExports && dataSize > this.config.compressionThreshold),
            encrypted: format === 'encrypted',
            exportOptions: options,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            description: options.description || `Export of ${dataType} data`
        };
    }
    
    /**
     * ファイルダウンロードの実行
     */
    async downloadExport(exportResult: any, filename: string = null): Promise<any> {
        try {
            if (!exportResult.success) {
                throw new Error('Cannot download failed export');
            }

            const finalFilename = filename || exportResult.filename ||
                                  this.generateFilename(exportResult.dataType, exportResult.format);
            
            // Blobの作成
            let blob;
            if (typeof exportResult.data === 'string') {
                blob = new Blob([exportResult.data], {
                    type: this.getMimeType(exportResult.format)
                });
            } else {
                blob = new Blob([JSON.stringify(exportResult.data, null, 2)], {
                    type: 'application/json'
                });
            }
            
            // ダウンロードの実行
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = finalFilename;
            
            // 一時的にDOMに追加してクリック
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // メモリクリーンアップ
            URL.revokeObjectURL(url);
            
            return {
                success: true,
                filename: finalFilename,
                size: blob.size
            };

        } catch (error) {
            getErrorHandler().handleError(error, 'DOWNLOAD_ERROR', {
                operation: 'downloadExport',
                filename
            });
            
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * ファイル名の生成
     */
    generateFilename(dataType: string, format: string): string {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        const extension = this.getFileExtension(format);
        return `bubblePop_${dataType}_${timestamp}.${extension}`;
    }
    
    /**
     * ファイル拡張子の取得
     */
    getFileExtension(format: string): string {
        const extensions: {[key: string]: string} = {
            json: 'json',
            compressed: 'json.gz',
            encrypted: 'enc',
            csv: 'csv',
            text: 'txt'
        };
        return extensions[format] || 'dat';
    }
    
    /**
     * MIMEタイプの取得
     */
    getMimeType(format: string): string {
        const mimeTypes: {[key: string]: string} = {
            json: 'application/json',
            compressed: 'application/gzip',
            encrypted: 'application/octet-stream',
            csv: 'text/csv',
            text: 'text/plain'
        };
        return mimeTypes[format] || 'application/octet-stream';
    }
    
    /**
     * エクスポート履歴の取得
     */
    getExportHistory(): any {
        return {
            statistics: { ...this.statistics },
            supportedFormats: Array.from(this.exportFormats.keys()),
            config: { ...this.config }
        };
    }
    
    /**
     * 統計の更新
     */
    updateStatistics(success: boolean, duration: number, size: number): void {
        try {
            if (success) {
                this.statistics.successfulExports++;
                
                // 平均サイズの更新
                const totalSize = this.statistics.averageExportSize * (this.statistics.successfulExports - 1) + size;
                this.statistics.averageExportSize = Math.round(totalSize / this.statistics.successfulExports);
                
                // 平均時間の更新
                const totalTime = this.statistics.averageExportTime * (this.statistics.successfulExports - 1) + duration;
                this.statistics.averageExportTime = Math.round(totalTime / this.statistics.successfulExports);
            } else {
                this.statistics.failedExports++;
            }
            
            this.statistics.lastExport = {
                timestamp: Date.now(),
                success,
                duration,
                size
            };
        } catch (error) {
            console.error('Export statistics update error:', error);
        }
    }
    
    /**
     * 設定の更新
     */
    updateConfig(newConfig: any): void {
        this.config = { ...this.config, ...newConfig };
    }
    
    /**
     * エクスポート可能なデータタイプの取得
     */
    async getAvailableDataTypes(): Promise<string[]> {
        try {
            const keys = await this.storage.keys();
            const dataTypes = keys.filter((key: string) =>
                !key.startsWith('backup_') &&
                key !== 'backupHistory' &&
                !key.startsWith('_')
            );
            
            return dataTypes;
        } catch (error) {
            getErrorHandler().handleError(error, 'AVAILABLE_DATA_TYPES_ERROR', {
                operation: 'getAvailableDataTypes'
            });
            
            return [];
        }
    }
    
    /**
     * リソースの解放
     */
    destroy(): void {
        try {
            this.exportFormats.clear();
            console.log('ExportManager destroyed');
        } catch (error) {
            getErrorHandler().handleError(error, 'EXPORT_MANAGER_DESTROY_ERROR', {
                operation: 'destroy'
            });
        }
    }
}

/**
 * JSONエクスポーター
 */
class JSONExporter {
    private exportManager: any;

    constructor(exportManager: any) {
        this.exportManager = exportManager;
    }
    
    async export(exportData: any, options: any = {}): Promise<any> {
        try {
            const jsonString = JSON.stringify(exportData, null, options.pretty ? 2 : 0);
            const filename = this.exportManager.generateFilename(
                exportData.metadata.originalDataType,
                'json'
            );
            
            return {
                success: true,
                data: jsonString,
                filename,
                size: jsonString.length,
                mimeType: 'application/json'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

/**
 * 圧縮エクスポーター
 */
class CompressedExporter {
    private exportManager: any;

    constructor(exportManager: any) {
        this.exportManager = exportManager;
    }
    
    async export(exportData: any, options: any = {}): Promise<any> {
        try {
            // 実際の実装では適切な圧縮ライブラリを使用
            // ここでは簡易的にJSON文字列を返す
            const jsonString = JSON.stringify(exportData);
            const filename = this.exportManager.generateFilename(
                exportData.metadata.originalDataType,
                'compressed'
            );
            
            // 圧縮フラグを追加
            exportData.metadata.compressed = true;
            
            return {
                success: true,
                data: jsonString,
                filename,
                size: jsonString.length,
                mimeType: 'application/gzip'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

/**
 * 暗号化エクスポーター
 */
class EncryptedExporter {
    private exportManager: any;

    constructor(exportManager: any) {
        this.exportManager = exportManager;
    }
    
    async export(exportData: any, options: any = {}): Promise<any> {
        try {
            // SecurityManagerと統合時に実装
            // 現在は基本的なエンコーディングのみ
            const jsonString = JSON.stringify(exportData);
            const encoded = btoa(jsonString); // Base64エンコーディング
            
            const filename = this.exportManager.generateFilename(
                exportData.metadata.originalDataType,
                'encrypted'
            );
            
            exportData.metadata.encrypted = true;
            
            return {
                success: true,
                data: encoded,
                filename,
                size: encoded.length,
                mimeType: 'application/octet-stream'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

/**
 * CSVエクスポーター
 */
class CSVExporter {
    private exportManager: any;

    constructor(exportManager: any) {
        this.exportManager = exportManager;
    }

    async export(exportData: any, options: any = {}): Promise<any> {
        try {
            let csvContent = '';
            
            // 統計データをCSV形式に変換
            if (exportData.userData.statistics) {
                csvContent = this.statisticsToCSV(exportData.userData.statistics);
            } else if (exportData.userData.playerData) {
                csvContent = this.playerDataToCSV(exportData.userData.playerData);
            } else {
                // 汎用的なオブジェクトをCSVに変換
                csvContent = this.objectToCSV(exportData.userData);
            }
            
            const filename = this.exportManager.generateFilename(
                exportData.metadata.originalDataType,
                'csv'
            );
            
            return {
                success: true,
                data: csvContent,
                filename,
                size: csvContent.length,
                mimeType: 'text/csv'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    statisticsToCSV(statistics: any): string {
        const headers = ['Metric', 'Value'];
        const rows = Object.entries(statistics).map(([key, value]) => [key, value]);
        return this.arrayToCSV([headers, ...rows]);
    }

    playerDataToCSV(playerData: any): string {
        const headers = ['Field', 'Value'];
        const rows = Object.entries(playerData).map(([key, value]) => [key,
            Array.isArray(value) ? value.join(',') :
            typeof value === 'object' ? JSON.stringify(value) :
            value
        ]);
        return this.arrayToCSV([headers, ...rows]);
    }

    objectToCSV(obj: any): string {
        const headers = ['Key', 'Value'];
        const rows = Object.entries(obj).map(([key, value]) => [key,
            typeof value === 'object' ? JSON.stringify(value) : value
        ]);
        return this.arrayToCSV([headers, ...rows]);
    }
    
    arrayToCSV(array: any[][]): string {
        return array.map(row =>
            row.map(field =>
                typeof field === 'string' && field.includes(',') ?
                `"${field.replace(/"/g, '""')}"` :
                field
            ).join(',')
        ).join('\n');
    }
}

/**
 * テキストエクスポーター
 */
class TextExporter {
    private exportManager: any;

    constructor(exportManager: any) {
        this.exportManager = exportManager;
    }
    
    async export(exportData: any, options: any = {}): Promise<any> {
        try {
            let textContent = this.formatAsText(exportData);
            const filename = this.exportManager.generateFilename(
                exportData.metadata.originalDataType,
                'text'
            );
            
            return {
                success: true,
                data: textContent,
                filename,
                size: textContent.length,
                mimeType: 'text/plain'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    formatAsText(exportData: any): string {
        let text = '';
        
        // ヘッダー情報
        text += '='.repeat(50) + '\n';
        text += 'BubblePop Game Data Export\n';
        text += '='.repeat(50) + '\n\n';
        text += `Export Date: ${exportData.header.exportedAt}\n`;
        text += `Game Version: ${exportData.header.gameVersion}\n`;
        text += `Data Types: ${exportData.metadata.dataTypes.join(', ')}\n`;
        text += `Data Size: ${exportData.metadata.dataSize} bytes\n\n`;

        // データ内容
        for (const [dataType, data] of Object.entries(exportData.userData)) {
            text += '-'.repeat(30) + '\n';
            text += `${dataType.toUpperCase()}\n`;
            text += '-'.repeat(30) + '\n';

            if (typeof data === 'object') {
                text += this.objectToText(data, 0);
            } else {
                text += `${data}\n`;
            }

            text += '\n';
        }
        
        return text;
    }

    objectToText(obj: any, indent = 0): string {
        let text = '';
        const spaces = '  '.repeat(indent);
        
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    text += `${spaces}${key}: [${value.join(', ')}]\n`;
                } else {
                    text += `${spaces}${key}:\n`;
                    text += this.objectToText(value, indent + 1);
                }
            } else {
                text += `${spaces}${key}: ${value}\n`;
            }
        }
        
        return text;
    }
}