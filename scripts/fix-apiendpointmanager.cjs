#!/usr/bin/env node

const fs = require('fs');

const filePath = 'src/analytics/analytics-api/APIEndpointManager.ts';

console.log('🔧 Fixing APIEndpointManager.ts syntax errors...');

const content = `/**
 * APIEndpointManager - API エンドポイント管理システム
 * 
 * エンドポイント登録・管理、レート制限、アクセス制御、リクエスト統計を専門的に処理します
 */

// TypeScript interfaces and types
export interface AnalysisOptions {
    timeRange?: { start: Date; end: Date };
    filters?: Record<string, any>;
    metrics?: string[];
}

export interface AnalysisResult {
    success: boolean;
    data?: any;
    insights?: string[];
    recommendations?: string[];
    timestamp: number;
}

export class APIEndpointManager {
    private storageManager: any;
    private privacyManager: any;
    private endpoints: Map<string, any>;
    private rateLimiting: {
        enabled: boolean;
        maxRequestsPerMinute: number;
        maxRequestsPerHour: number;
        requestHistory: Map<string, any[]>;
    };
    private accessControl: {
        enabled: boolean;
        allowedOrigins: string[];
        requireAuthentication: boolean;
    };
    private apiStats: {
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        rateLimitedRequests: number;
        averageResponseTime: number;
        lastRequestTime: number | null;
    };

    constructor(storageManager: any, privacyManager: any = null) {
        this.storageManager = storageManager;
        this.privacyManager = privacyManager;
        
        // エンドポイント管理
        this.endpoints = new Map();
        
        // レート制限設定
        this.rateLimiting = {
            enabled: true,
            maxRequestsPerMinute: 60,
            maxRequestsPerHour: 1000,
            requestHistory: new Map() // clientId -> requests[]
        };
        
        // アクセス制御設定
        this.accessControl = {
            enabled: false, // 将来の機能拡張用
            allowedOrigins: ['*'],
            requireAuthentication: false
        };
        
        // API統計
        this.apiStats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            rateLimitedRequests: 0,
            averageResponseTime: 0,
            lastRequestTime: null
        };
    }
    
    /**
     * エンドポイントマネージャーの初期化
     */
    initialize() {
        try {
            // 標準エンドポイントの登録
            this.registerStandardEndpoints();
            console.log('API Endpoint Manager initialized');
        } catch (error) {
            console.error('APIEndpointManager initialization error:', error);
            throw error;
        }
    }
    
    /**
     * 標準エンドポイントの登録
     */
    registerStandardEndpoints() {
        // セッションデータ取得
        this.registerEndpoint('/sessions', async (query: any) => {
            return await this.storageManager.getData('sessionData', query);
        });
        
        // バブルインタラクション取得
        this.registerEndpoint('/bubbles', async (query: any) => {
            return await this.storageManager.getData('bubbleInteractions', query);
        });
        
        // パフォーマンスデータ取得
        this.registerEndpoint('/performance', async (query: any) => {
            return await this.storageManager.getData('performanceData', query);
        });
        
        // 集計データ取得
        this.registerEndpoint('/aggregated', async (query: any) => {
            return await this.storageManager.getData('aggregatedData', query);
        });
        
        // リアルタイム監視データ取得
        this.registerEndpoint('/realtime', async (query: any) => {
            return await this.storageManager.getData('realtimeMonitoring', query);
        });
        
        // APIメタデータ取得
        this.registerEndpoint('/meta', async () => {
            return this.getAPIMetadata();
        });
    }
    
    /**
     * エンドポイントの登録
     * @param {string} path - エンドポイントパス
     * @param {Function} handler - ハンドラー関数
     * @param {Object} options - オプション設定
     */
    registerEndpoint(path: string, handler: Function, options: any = {}) {
        try {
            const endpointConfig = {
                path,
                handler,
                options: {
                    requireAuth: false,
                    rateLimit: true,
                    anonymizeData: true,
                    ...options
                },
                stats: {
                    callCount: 0,
                    successCount: 0,
                    errorCount: 0,
                    averageResponseTime: 0
                }
            };
            
            this.endpoints.set(path, endpointConfig);
        } catch (error) {
            console.error(\`Failed to register endpoint \${path}:\`, error);
            throw error;
        }
    }
    
    /**
     * エンドポイントリクエストの処理
     * @param {string} endpoint - エンドポイントパス
     * @param {Object} query - クエリパラメータ
     * @param {Object} options - リクエストオプション
     * @returns {Promise<Object>} API応答
     */
    async handleRequest(endpoint: string, query: any = {}, options: any = {}) {
        const startTime = performance.now();
        const requestId = this.generateRequestId();
        
        try {
            const requestOptions = {
                clientId: 'default',
                skipRateLimit: false,
                skipAnonymization: false,
                ...options
            };
            
            // レート制限チェック
            if (!requestOptions.skipRateLimit && !this.checkRateLimit(requestOptions.clientId)) {
                this.apiStats.rateLimitedRequests++;
                this.apiStats.failedRequests++;
                return this.createErrorResponse('RATE_LIMIT_EXCEEDED', 'Rate limit exceeded. Please try again later.', 429);
            }
            
            // エンドポイント存在確認
            const endpointConfig = this.endpoints.get(endpoint);
            if (!endpointConfig) {
                this.apiStats.failedRequests++;
                return this.createErrorResponse('ENDPOINT_NOT_FOUND', \`Endpoint '\${endpoint}' not found\`, 404);
            }
            
            // クエリの前処理
            const processedQuery = this.preprocessQuery(query);
            
            // データ取得
            let data = await endpointConfig.handler(processedQuery);
            
            // データの匿名化（必要に応じて）
            let isAnonymized = false;
            if (!requestOptions.skipAnonymization && 
                endpointConfig.options.anonymizeData && 
                this.privacyManager) {
                data = await this.privacyManager.anonymizeData({ data }).then(result => result.data);
                isAnonymized = true;
            }
            
            const responseTime = performance.now() - startTime;
            
            // 統計の更新
            this.updateRequestStats(endpointConfig, true, responseTime);
            this.updateAPIStats(true, responseTime);
            
            // レスポンスの作成
            return this.createSuccessResponse(data, {
                requestId,
                endpoint,
                query: processedQuery,
                responseTime: Math.max(responseTime, 0.1), // 最小0.1ms
                dataCount: Array.isArray(data) ? data.length : 1,
                anonymized: isAnonymized
            });
            
        } catch (error) {
            const responseTime = Math.max(performance.now() - startTime, 0.1);
            
            // エラー統計の更新
            const endpointConfig = this.endpoints.get(endpoint);
            if (endpointConfig) {
                this.updateRequestStats(endpointConfig, false, responseTime);
            }
            this.updateAPIStats(false, responseTime);
            
            console.error(\`API request failed for \${endpoint}:\`, error);
            return this.createErrorResponse('INTERNAL_ERROR', 'Internal server error occurred', 500, { requestId });
        }
    }
    
    /**
     * クエリの前処理
     * @param {Object} query - 元のクエリ
     * @returns {Object} 処理されたクエリ
     */
    preprocessQuery(query: any) {
        const processedQuery = { ...query };
        
        // 日付文字列をタイムスタンプに変換
        if (processedQuery.startDate && typeof processedQuery.startDate === 'string') {
            processedQuery.startDate = new Date(processedQuery.startDate).getTime();
        }
        if (processedQuery.endDate && typeof processedQuery.endDate === 'string') {
            processedQuery.endDate = new Date(processedQuery.endDate).getTime();
        }
        
        // 制限値の設定
        if (processedQuery.limit) {
            processedQuery.limit = Math.min(parseInt(processedQuery.limit), 10000); // 最大10,000件
        }
        
        // ソート設定の検証
        if (processedQuery.sortBy) {
            const allowedSortFields = ['timestamp', 'sessionId', 'bubbleType', 'score', 'duration'];
            if (!allowedSortFields.includes(processedQuery.sortBy)) {
                delete processedQuery.sortBy;
            }
        }
        
        return processedQuery;
    }
    
    /**
     * レート制限チェック
     * @param {string} clientId - クライアントID
     * @returns {boolean} リクエスト許可判定
     */
    checkRateLimit(clientId: string) {
        if (!this.rateLimiting.enabled) {
            return true;
        }
        
        const now = Date.now();
        const requests = this.rateLimiting.requestHistory.get(clientId) || [];
        
        // 古いリクエスト履歴を削除（1時間以上前）
        const recentRequests = requests.filter(time => now - time < 60 * 60 * 1000);
        
        // 1分間の制限確認
        const lastMinuteRequests = recentRequests.filter(time => now - time < 60 * 1000);
        if (lastMinuteRequests.length >= this.rateLimiting.maxRequestsPerMinute) {
            return false;
        }
        
        // 1時間の制限確認
        if (recentRequests.length >= this.rateLimiting.maxRequestsPerHour) {
            return false;
        }
        
        // リクエスト履歴を更新
        recentRequests.push(now);
        this.rateLimiting.requestHistory.set(clientId, recentRequests);
        
        return true;
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
     * APIメタデータの取得
     * @returns {Object} APIメタデータ
     */
    getAPIMetadata() {
        return {
            version: '1.0.0',
            endpoints: Array.from(this.endpoints.keys()),
            rateLimiting: {
                enabled: this.rateLimiting.enabled,
                maxRequestsPerMinute: this.rateLimiting.maxRequestsPerMinute,
                maxRequestsPerHour: this.rateLimiting.maxRequestsPerHour
            },
            stats: { ...this.apiStats },
            features: [
                'data_retrieval', 'aggregation', 'rate_limiting', 'anonymization', 'filtering', 'sorting'
            ]
        };
    }
    
    /**
     * リクエストID生成
     * @returns {string} ユニークなリクエストID
     */
    generateRequestId() {
        return \`req_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
    }
    
    /**
     * エンドポイント統計の更新
     * @param {Object} endpointConfig - エンドポイント設定
     * @param {boolean} success - 成功フラグ
     * @param {number} responseTime - レスポンス時間
     */
    updateRequestStats(endpointConfig: any, success: boolean, responseTime: number) {
        endpointConfig.stats.callCount++;
        
        if (success) {
            endpointConfig.stats.successCount++;
        } else {
            endpointConfig.stats.errorCount++;
        }
        
        // 平均レスポンス時間の更新
        const totalTime = endpointConfig.stats.averageResponseTime * (endpointConfig.stats.callCount - 1) + responseTime;
        endpointConfig.stats.averageResponseTime = totalTime / endpointConfig.stats.callCount;
    }
    
    /**
     * API統計の更新
     * @param {boolean} success - 成功フラグ
     * @param {number} responseTime - レスポンス時間
     */
    updateAPIStats(success: boolean, responseTime: number) {
        this.apiStats.totalRequests++;
        
        if (success) {
            this.apiStats.successfulRequests++;
        } else {
            this.apiStats.failedRequests++;
        }
        
        // 平均レスポンス時間の更新
        const totalTime = this.apiStats.averageResponseTime * (this.apiStats.totalRequests - 1) + responseTime;
        this.apiStats.averageResponseTime = totalTime / this.apiStats.totalRequests;
        
        this.apiStats.lastRequestTime = Date.now();
    }
    
    /**
     * 登録エンドポイント一覧の取得
     * @returns {Array} エンドポイントリスト
     */
    getEndpoints() {
        return Array.from(this.endpoints.keys());
    }
    
    /**
     * エンドポイント統計の取得
     * @param {string} endpoint - エンドポイントパス
     * @returns {Object} エンドポイント統計
     */
    getEndpointStats(endpoint: string) {
        const config = this.endpoints.get(endpoint);
        return config ? { ...config.stats } : null;
    }
    
    /**
     * API統計の取得
     * @returns {Object} API統計
     */
    getAPIStats() {
        return {
            ...this.apiStats,
            successRate: this.apiStats.totalRequests > 0 ?
                Math.round((this.apiStats.successfulRequests / this.apiStats.totalRequests) * 100) : 0,
            rateLimitRate: this.apiStats.totalRequests > 0 ?
                Math.round((this.apiStats.rateLimitedRequests / this.apiStats.totalRequests) * 100) : 0
        };
    }
    
    /**
     * レート制限設定の更新
     * @param {Object} newSettings - 新しい設定
     */
    updateRateLimitSettings(newSettings: any) {
        this.rateLimiting = { ...this.rateLimiting, ...newSettings };
    }
    
    /**
     * リソースの解放
     */
    destroy() {
        this.endpoints.clear();
        this.rateLimiting.requestHistory.clear();
        console.log('API Endpoint Manager destroyed');
    }
}
`;

try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ APIEndpointManager.ts fixed successfully!');
} catch (error) {
    console.error('❌ Error fixing APIEndpointManager.ts:', error.message);
}