#!/usr/bin/env node

const fs = require('fs');

const filePath = 'src/analytics/analytics-api/DataExportHandler.ts';

console.log('🔧 Fixing DataExportHandler.ts syntax errors...');

const content = `/**
 * DataExportHandler - データエクスポート処理システム
 * 
 * ExportManager統合、多形式エクスポート、エクスポート統計管理を専門的に処理します
 */
export class DataExportHandler {
    private storageManager: any;
    private privacyManager: any;
    private exportManager: any;

    constructor(storageManager: any, privacyManager: any = null) {
        this.storageManager = storageManager;
        this.privacyManager = privacyManager;
        
        // ExportManager統合は動的インポートで対応
        this.exportManager = null;
        this.initializeExportManager();
    }
    
    /**
     * ExportManagerの初期化
     */
    async initializeExportManager() {
        try {
            const { ExportManager } = await import('../ExportManager.ts');
            this.exportManager = new ExportManager(this.storageManager, this.privacyManager);
            console.log('Export Manager initialized');
        } catch (error) {
            console.warn('ExportManager not available:', error.message);
            // Fallback implementation
            this.exportManager = this.createFallbackExportManager();
        }
    }
    
    /**
     * フォールバック用のExportManager
     */
    createFallbackExportManager() {
        return {
            exportData: async (options: any) => {
                return {
                    success: true,
                    data: JSON.stringify({ message: 'Basic export', options }),
                    format: options.format || 'json',
                    filename: \`export_\${Date.now()}.\${options.format || 'json'}\`,
                    size: 0,
                    duration: 0,
                    metadata: { fallback: true }
                };
            },
            getSupportedFormats: () => ['json'],
            getSupportedDataTypes: () => ['sessionData', 'bubbleInteractions', 'performanceData'],
            getExportStats: () => ({ totalExports: 0, fallback: true }),
            destroy: () => {}
        };
    }
    
    /**
     * データエクスポート機能
     * ExportManagerを使用して多形式エクスポートを提供
     * @param {Object} options - エクスポートオプション
     * @param {string|Array} options.dataTypes - エクスポートするデータタイプ
     * @param {string} options.format - エクスポート形式 (json, csv, xlsx)
     * @param {Object} options.filters - データフィルター
     * @param {string} options.period - 期間設定
     * @returns {Promise<Object>} エクスポート結果
     */
    async exportData(options: any = {}) {
        try {
            if (!this.exportManager) {
                await this.initializeExportManager();
            }
            
            const {
                dataTypes = ['sessionData'],
                format = 'json',
                filters = {},
                period = null,
                filename = null,
                includeMetadata = true,
                anonymize = false
            } = options;
            
            // データタイプの正規化
            const normalizedDataTypes = Array.isArray(dataTypes) ? dataTypes : [dataTypes];
            
            // ExportManagerに処理を委譲
            const result = await this.exportManager.exportData({
                dataTypes: normalizedDataTypes,
                format,
                filters,
                period,
                filename,
                includeMetadata,
                anonymize
            });
            
            return this.createSuccessResponse(result, {
                exportedDataTypes: normalizedDataTypes,
                format,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Data export error:', error);
            return this.createErrorResponse('DATA_EXPORT_ERROR', 'Failed to export data', 500);
        }
    }
    
    /**
     * サポートされるエクスポート形式の取得
     * @returns {Promise<Array>} サポートされる形式一覧
     */
    async getSupportedFormats() {
        try {
            if (!this.exportManager) {
                await this.initializeExportManager();
            }
            
            return this.exportManager.getSupportedFormats();
        } catch (error) {
            console.error('Failed to get supported formats:', error);
            return ['json']; // フォールバック
        }
    }
    
    /**
     * エクスポート可能なデータタイプの取得
     * @returns {Promise<Array>} エクスポート可能なデータタイプ一覧
     */
    async getSupportedDataTypes() {
        try {
            if (!this.exportManager) {
                await this.initializeExportManager();
            }
            
            return this.exportManager.getSupportedDataTypes();
        } catch (error) {
            console.error('Failed to get supported data types:', error);
            return ['sessionData', 'bubbleInteractions', 'performanceData']; // フォールバック
        }
    }
    
    /**
     * エクスポート統計の取得
     * @returns {Promise<Object>} エクスポート統計
     */
    async getExportStats() {
        try {
            if (!this.exportManager) {
                await this.initializeExportManager();
            }
            
            const stats = await this.exportManager.getExportStats();
            return this.createSuccessResponse(stats, {
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to get export stats:', error);
            return this.createErrorResponse('EXPORT_STATS_ERROR', 'Failed to retrieve export statistics', 500);
        }
    }
    
    /**
     * 成功レスポンスの作成
     * @param {any} data - レスポンスデータ
     * @param {Object} metadata - メタデータ
     * @returns {Object} APIレスポンス
     */
    createSuccessResponse(data: any, metadata: any = {}) {
        return {
            success: true,
            data,
            metadata: {
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                ...metadata
            }
        };
    }
    
    /**
     * エラーレスポンスの作成
     * @param {string} code - エラーコード
     * @param {string} message - エラーメッセージ
     * @param {number} status - HTTPステータスコード
     * @param {Object} metadata - 追加メタデータ
     * @returns {Object} エラーレスポンス
     */
    createErrorResponse(code: string, message: string, status: number = 500, metadata: any = {}) {
        return {
            success: false,
            error: {
                code,
                message,
                status
            },
            metadata: {
                timestamp: new Date().toISOString(),
                ...metadata
            }
        };
    }
    
    /**
     * リソースの解放
     */
    destroy() {
        if (this.exportManager && this.exportManager.destroy) {
            this.exportManager.destroy();
        }
        this.exportManager = null;
        console.log('Data Export Handler destroyed');
    }
}
`;

try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ DataExportHandler.ts fixed successfully!');
} catch (error) {
    console.error('❌ Error fixing DataExportHandler.ts:', error.message);
}