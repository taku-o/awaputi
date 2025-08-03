import { APIEndpointManager } from './analytics-api/APIEndpointManager.js';
import { DataAggregationProcessor } from './analytics-api/DataAggregationProcessor.js';
import { DataExportHandler } from './analytics-api/DataExportHandler.js';

/**
 * AnalyticsAPI - メインコントローラー
 * 
 * Main Controller Patternにより、専門化されたコンポーネントを統制します。
 * API管理、データ集計、エクスポート機能を統合して管理します。
 */
export class AnalyticsAPI {
    constructor(storageManager, privacyManager = null) {
        this.storageManager = storageManager;
        this.privacyManager = privacyManager;
        
        // 専門化されたコンポーネントを初期化
        this.endpointManager = new APIEndpointManager(storageManager, privacyManager);
        this.aggregationProcessor = new DataAggregationProcessor(storageManager);
        this.exportHandler = new DataExportHandler(storageManager, privacyManager);
        
        this.initialize();
    }
    
    /**
     * AnalyticsAPIの初期化
     */
    initialize() {
        try {
            // 各コンポーネントの初期化
            this.endpointManager.initialize();
            
            // 統計サマリーエンドポイントの追加登録
            this.endpointManager.registerEndpoint('/stats/summary', async (query) => {
                return await this.aggregationProcessor.getStatsSummary(query);
            });
            
            // データエクスポートエンドポイントの追加登録
            this.endpointManager.registerEndpoint('/export', async (query) => {
                return await this.exportHandler.exportData(query);
            }, {
                requireAuth: false,
                rateLimit: true,
                maxRequestsPerMinute: 10 // エクスポートは重い処理なので制限を厳しく
            });
            
            console.log('Analytics API initialized');
        } catch (error) {
            console.error('AnalyticsAPI initialization error:', error);
            throw error;
        }
    }
    
    /**
     * データ取得API（メインインターフェース）
     * @param {string} endpoint - エンドポイントパス
     * @param {Object} query - クエリパラメータ
     * @param {Object} options - リクエストオプション
     * @returns {Promise<Object>} API応答
     */
    async getData(endpoint, query = {}, options = {}) {
        return await this.endpointManager.handleRequest(endpoint, query, options);
    }
    
    /**
     * 集計データ取得API
     * @param {Object} aggregationRules - 集計ルール
     * @param {Object} options - オプション
     * @returns {Promise<Object>} 集計結果
     */
    async getAggregatedData(aggregationRules, options = {}) {
        return await this.aggregationProcessor.getAggregatedData(aggregationRules, options);
    }
    
    /**
     * 高度な集計データ取得API
     * @param {Object} aggregationRules - 高度な集計ルール
     * @param {Object} options - オプション
     * @returns {Promise<Object>} 集計結果
     */
    async getAdvancedAggregatedData(aggregationRules, options = {}) {
        return await this.aggregationProcessor.getAdvancedAggregatedData(aggregationRules, options);
    }
    
    /**
     * 時系列集計API
     * @param {Object} timeSeriesRules - 時系列集計ルール
     * @param {Object} options - オプション
     * @returns {Promise<Object>} 時系列集計結果
     */
    async getTimeSeriesAggregation(timeSeriesRules, options = {}) {
        return await this.aggregationProcessor.getTimeSeriesAggregation(timeSeriesRules, options);
    }
    
    /**
     * データエクスポート機能
     * @param {Object} options - エクスポートオプション
     * @returns {Promise<Object>} エクスポート結果
     */
    async exportData(options = {}) {
        return await this.exportHandler.exportData(options);
    }
    
    /**
     * エンドポイント管理
     */
    
    /**
     * エンドポイントの登録
     * @param {string} path - エンドポイントパス
     * @param {Function} handler - ハンドラー関数
     * @param {Object} options - オプション設定
     */
    registerEndpoint(path, handler, options = {}) {
        return this.endpointManager.registerEndpoint(path, handler, options);
    }
    
    /**
     * 登録エンドポイント一覧の取得
     * @returns {Array} エンドポイントリスト
     */
    getEndpoints() {
        return this.endpointManager.getEndpoints();
    }
    
    /**
     * エンドポイント統計の取得
     * @param {string} endpoint - エンドポイントパス
     * @returns {Object} エンドポイント統計
     */
    getEndpointStats(endpoint) {
        return this.endpointManager.getEndpointStats(endpoint);
    }
    
    /**
     * API統計の取得
     * @returns {Object} API統計
     */
    getAPIStats() {
        return this.endpointManager.getAPIStats();
    }
    
    /**
     * APIメタデータの取得
     * @returns {Object} APIメタデータ
     */
    getAPIMetadata() {
        const baseMetadata = this.endpointManager.getAPIMetadata();
        
        // 拡張メタデータを追加
        return {
            ...baseMetadata,
            components: {
                endpointManager: 'APIEndpointManager',
                aggregationProcessor: 'DataAggregationProcessor',
                exportHandler: 'DataExportHandler'
            },
            capabilities: {
                ...baseMetadata.features,
                advanced_aggregation: true,
                time_series_analysis: true,
                multi_format_export: true,
                data_anonymization: !!this.privacyManager
            },
            exportFormats: this.exportHandler.getSupportedExportFormats(),
            exportDataTypes: this.exportHandler.getSupportedExportDataTypes()
        };
    }
    
    /**
     * エクスポート関連API
     */
    
    /**
     * サポートされているエクスポート形式の取得
     * @returns {Array<string>} サポートされている形式リスト
     */
    getSupportedExportFormats() {
        return this.exportHandler.getSupportedExportFormats();
    }
    
    /**
     * エクスポート可能なデータタイプの取得
     * @returns {Array<string>} サポートされているデータタイプリスト
     */
    getSupportedExportDataTypes() {
        return this.exportHandler.getSupportedExportDataTypes();
    }
    
    /**
     * エクスポート統計の取得
     * @returns {Object} エクスポート統計情報
     */
    getExportStats() {
        return this.exportHandler.getExportStats();
    }
    
    /**
     * 設定管理
     */
    
    /**
     * レート制限設定の更新
     * @param {Object} newSettings - 新しい設定
     */
    updateRateLimitSettings(newSettings) {
        return this.endpointManager.updateRateLimitSettings(newSettings);
    }
    
    /**
     * 統計サマリーの取得（直接アクセス）
     * @param {Object} query - クエリパラメータ
     * @returns {Promise<Object>} 統計サマリー
     */
    async getStatsSummary(query = {}) {
        return await this.aggregationProcessor.getStatsSummary(query);
    }
    
    /**
     * バッチデータ取得
     * @param {Array} dataTypes - データタイプ配列
     * @param {Object} filters - フィルター条件
     * @returns {Promise<Object>} バッチデータ
     */
    async getBatchData(dataTypes, filters = {}) {
        return await this.exportHandler.getBatchDataForExport(dataTypes, filters);
    }
    
    /**
     * システム健全性チェック
     * @returns {Object} システム状態
     */
    getSystemHealth() {
        return {
            status: 'healthy',
            components: {
                endpointManager: !!this.endpointManager,
                aggregationProcessor: !!this.aggregationProcessor,
                exportHandler: !!this.exportHandler,
                storageManager: !!this.storageManager,
                privacyManager: !!this.privacyManager
            },
            capabilities: {
                dataRetrieval: true,
                aggregation: true,
                timeSeriesAnalysis: true,
                dataExport: true,
                rateLimiting: true,
                dataAnonymization: !!this.privacyManager
            },
            stats: this.getAPIStats(),
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * デバッグ情報の取得
     * @returns {Object} デバッグ情報
     */
    getDebugInfo() {
        return {
            api: 'AnalyticsAPI',
            version: '1.0.0',
            components: {
                endpointManager: {
                    endpoints: this.endpointManager.getEndpoints(),
                    stats: this.endpointManager.getAPIStats()
                },
                aggregationProcessor: {
                    cacheSize: this.aggregationProcessor.aggregationCache?.size || 0
                },
                exportHandler: {
                    supportedFormats: this.exportHandler.getSupportedExportFormats(),
                    stats: this.exportHandler.getExportStats()
                }
            },
            systemHealth: this.getSystemHealth()
        };
    }
    
    /**
     * リソースの解放
     */
    destroy() {
        // 各コンポーネントのリソースを解放
        if (this.endpointManager) {
            this.endpointManager.destroy();
        }
        
        if (this.aggregationProcessor) {
            this.aggregationProcessor.destroy();
        }
        
        if (this.exportHandler) {
            this.exportHandler.destroy();
        }
        
        console.log('Analytics API destroyed');
    }
}