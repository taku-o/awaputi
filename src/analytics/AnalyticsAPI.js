import { ExportManager } from './ExportManager.js';

/**
 * Analytics API
 * 分析データのプログラマティックアクセス機能を提供します
 * 
 * 機能:
 * - 構造化されたJSON形式でのデータ取得
 * - エンドポイント登録とクエリ処理
 * - レート制限とアクセス制御
 * - 集計機能とフィルタリング
 * - プライバシー保護対応
 * - 多形式エクスポート機能（CSV、JSON、XML）
 */
export class AnalyticsAPI {
    constructor(storageManager, privacyManager = null) {
        this.storageManager = storageManager;
        this.privacyManager = privacyManager;
        
        // ExportManager統合
        this.exportManager = new ExportManager(storageManager, privacyManager);
        
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
        
        // 集計キャッシュ（LRUキャッシュ）
        this.aggregationCache = new Map();
        this.maxCacheSize = 100;
        
        this.initialize();
    }
    
    /**
     * AnalyticsAPIの初期化
     */
    initialize() {
        try {
            // 標準エンドポイントの登録
            this.registerStandardEndpoints();
            
            console.log('Analytics API initialized');
        } catch (error) {
            console.error('AnalyticsAPI initialization error:', error);
            throw error;
        }
    }
    
    /**
     * 標準エンドポイントの登録
     */
    registerStandardEndpoints() {
        // セッションデータ取得
        this.registerEndpoint('/sessions', async (query) => {
            return await this.storageManager.getData('sessionData', query);
        });
        
        // バブルインタラクション取得
        this.registerEndpoint('/bubbles', async (query) => {
            return await this.storageManager.getData('bubbleInteractions', query);
        });
        
        // パフォーマンスデータ取得
        this.registerEndpoint('/performance', async (query) => {
            return await this.storageManager.getData('performanceData', query);
        });
        
        // 集計データ取得
        this.registerEndpoint('/aggregated', async (query) => {
            return await this.storageManager.getData('aggregatedData', query);
        });
        
        // 統計サマリー取得
        this.registerEndpoint('/stats/summary', async (query) => {
            return await this.getStatsSummary(query);
        });
        
        // リアルタイム監視データ取得
        this.registerEndpoint('/realtime', async (query) => {
            return await this.storageManager.getData('realtimeMonitoring', query);
        });
        
        // APIメタデータ取得
        this.registerEndpoint('/meta', async () => {
            return this.getAPIMetadata();
        });
        
        // データエクスポート（多形式対応）
        this.registerEndpoint('/export', async (query) => {
            return await this.exportData(query);
        }, {
            requireAuth: false,
            rateLimit: true,
            maxRequestsPerMinute: 10 // エクスポートは重い処理なので制限を厳しく
        });
    }
    
    /**
     * エンドポイントの登録
     * @param {string} path - エンドポイントパス
     * @param {Function} handler - ハンドラー関数
     * @param {Object} options - オプション設定
     */
    registerEndpoint(path, handler, options = {}) {
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
            console.error(`Failed to register endpoint ${path}:`, error);
            throw error;
        }
    }
    
    /**
     * データ取得API
     * @param {string} endpoint - エンドポイントパス
     * @param {Object} query - クエリパラメータ
     * @param {Object} options - リクエストオプション
     * @returns {Promise<Object>} API応答
     */
    async getData(endpoint, query = {}, options = {}) {
        const startTime = performance.now();
        const requestId = this.generateRequestId();
        
        try {
            this.apiStats.totalRequests++;
            
            // リクエストオプションの設定
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
                return this.createErrorResponse('RATE_LIMIT_EXCEEDED', 
                    'Rate limit exceeded. Please try again later.', 429);
            }
            
            // エンドポイント存在確認
            const endpointConfig = this.endpoints.get(endpoint);
            if (!endpointConfig) {
                this.apiStats.failedRequests++;
                return this.createErrorResponse('ENDPOINT_NOT_FOUND', 
                    `Endpoint '${endpoint}' not found`, 404);
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
            
            console.error(`API request failed for ${endpoint}:`, error);
            
            return this.createErrorResponse('INTERNAL_ERROR', 
                'Internal server error occurred', 500, { requestId });
        }
    }
    
    /**
     * 集計データ取得API
     * @param {Object} aggregationRules - 集計ルール
     * @param {Object} options - オプション
     * @returns {Promise<Object>} 集計結果
     */
    async getAggregatedData(aggregationRules, options = {}) {
        try {
            const {
                dataType = 'sessionData',
                groupBy = [],
                aggregateBy = {},
                filters = {},
                period = null
            } = aggregationRules;
            
            // 基本データの取得
            const baseQuery = this.buildAggregationQuery(filters, period);
            const rawData = await this.storageManager.getData(dataType, baseQuery);
            
            if (!Array.isArray(rawData) || rawData.length === 0) {
                return this.createSuccessResponse([], {
                    message: 'No data found for aggregation'
                });
            }
            
            // データの集計処理
            const aggregatedData = this.performAggregation(rawData, {
                groupBy,
                aggregateBy
            });
            
            return this.createSuccessResponse(aggregatedData, {
                aggregationRules,
                sourceDataCount: rawData.length,
                aggregatedGroupCount: Object.keys(aggregatedData).length
            });
            
        } catch (error) {
            console.error('Aggregation error:', error);
            return this.createErrorResponse('AGGREGATION_ERROR', 
                'Failed to aggregate data', 500);
        }
    }
    
    /**
     * 高度な集計データ取得API
     * @param {Object} aggregationRules - 高度な集計ルール
     * @param {Object} options - オプション
     * @returns {Promise<Object>} 集計結果
     */
    async getAdvancedAggregatedData(aggregationRules, options = {}) {
        const startTime = performance.now();
        const requestId = this.generateRequestId();
        
        try {
            this.apiStats.totalRequests++;
            
            // 高度な集計ルールの解析
            const {
                dataTypes = ['sessionData'],
                multiGroupBy = [],
                customAggregations = {},
                timeWindow = null,
                conditionalAggregations = [],
                hierarchicalGrouping = null,
                cacheKey = null,
                maxResults = 1000
            } = aggregationRules;
            
            // キャッシュチェック
            if (cacheKey && this.aggregationCache && this.aggregationCache.has(cacheKey)) {
                const cachedResult = this.aggregationCache.get(cacheKey);
                if (Date.now() - cachedResult.timestamp < 300000) { // 5分間有効
                    return this.createSuccessResponse(cachedResult.data, {
                        cached: true,
                        requestId,
                        responseTime: performance.now() - startTime
                    });
                }
            }
            
            // 複数データタイプからのデータ収集
            const aggregatedResults = {};
            
            for (const dataType of dataTypes) {
                // データタイプ固有の集計処理
                const typeResult = await this.performAdvancedAggregation(dataType, {
                    multiGroupBy,
                    customAggregations,
                    timeWindow,
                    conditionalAggregations,
                    hierarchicalGrouping,
                    filters: aggregationRules.filters || {},
                    period: aggregationRules.period
                });
                
                aggregatedResults[dataType] = typeResult;
            }
            
            // 結果の統合と後処理
            const finalResult = this.consolidateAggregationResults(aggregatedResults, {
                maxResults,
                sortBy: aggregationRules.sortBy,
                sortOrder: aggregationRules.sortOrder || 'desc'
            });
            
            // キャッシュに保存
            if (cacheKey && this.aggregationCache) {
                this.aggregationCache.set(cacheKey, {
                    data: finalResult,
                    timestamp: Date.now()
                });
            }
            
            const responseTime = Math.max(performance.now() - startTime, 0.1);
            this.updateAPIStats(true, responseTime);
            
            return this.createSuccessResponse(finalResult, {
                requestId,
                responseTime,
                aggregationRules,
                dataTypes,
                totalGroups: this.countTotalGroups(finalResult),
                cached: false
            });
            
        } catch (error) {
            const responseTime = Math.max(performance.now() - startTime, 0.1);
            this.updateAPIStats(false, responseTime);
            
            console.error('Advanced aggregation error:', error);
            return this.createErrorResponse('ADVANCED_AGGREGATION_ERROR', 
                error.message, 500, { requestId });
        }
    }
    
    /**
     * 時系列集計API
     * @param {Object} timeSeriesRules - 時系列集計ルール
     * @param {Object} options - オプション
     * @returns {Promise<Object>} 時系列集計結果
     */
    async getTimeSeriesAggregation(timeSeriesRules, options = {}) {
        const startTime = performance.now();
        const requestId = this.generateRequestId();
        
        try {
            this.apiStats.totalRequests++;
            
            const {
                dataType = 'sessionData',
                timeField = 'timestamp',
                interval = 'hour', // hour, day, week, month
                aggregateBy = {},
                filters = {},
                startDate,
                endDate,
                fillGaps = true
            } = timeSeriesRules;
            
            // 時系列データの取得
            const query = this.buildTimeSeriesQuery(filters, startDate, endDate);
            const rawData = await this.storageManager.getData(dataType, query);
            
            if (!Array.isArray(rawData) || rawData.length === 0) {
                return this.createSuccessResponse([], {
                    message: 'No data found for time series aggregation',
                    requestId,
                    responseTime: Math.max(performance.now() - startTime, 0.1)
                });
            }
            
            // 時系列集計の実行
            const timeSeriesResult = this.performTimeSeriesAggregation(rawData, {
                timeField,
                interval,
                aggregateBy,
                fillGaps,
                startDate: new Date(startDate).getTime(),
                endDate: new Date(endDate).getTime()
            });
            
            const responseTime = Math.max(performance.now() - startTime, 0.1);
            this.updateAPIStats(true, responseTime);
            
            return this.createSuccessResponse(timeSeriesResult, {
                requestId,
                responseTime,
                timeSeriesRules,
                interval,
                dataPoints: timeSeriesResult.length
            });
            
        } catch (error) {
            const responseTime = Math.max(performance.now() - startTime, 0.1);
            this.updateAPIStats(false, responseTime);
            
            console.error('Time series aggregation error:', error);
            return this.createErrorResponse('TIMESERIES_AGGREGATION_ERROR', 
                error.message, 500, { requestId });
        }
    }
    
    /**
     * クエリの前処理
     * @param {Object} query - 元のクエリ
     * @returns {Object} 処理されたクエリ
     */
    preprocessQuery(query) {
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
     * データ集計処理
     * @param {Array} data - 集計対象データ
     * @param {Object} rules - 集計ルール
     * @returns {Object} 集計結果
     */
    performAggregation(data, rules) {
        const { groupBy = [], aggregateBy = {} } = rules;
        
        // グループ化
        const groups = this.groupData(data, groupBy);
        
        // 各グループの集計
        const result = {};
        for (const [groupKey, groupData] of Object.entries(groups)) {
            result[groupKey] = this.aggregateGroup(groupData, aggregateBy);
        }
        
        return result;
    }
    
    /**
     * データのグループ化
     * @param {Array} data - グループ化対象データ
     * @param {Array} groupBy - グループ化キー
     * @returns {Object} グループ化されたデータ
     */
    groupData(data, groupBy) {
        if (groupBy.length === 0) {
            return { 'all': data };
        }
        
        const groups = {};
        
        for (const item of data) {
            const groupKey = groupBy.map(key => {
                if (key === 'date' && item.timestamp) {
                    // 日付でのグループ化（YYYY-MM-DD形式）
                    return new Date(item.timestamp).toISOString().split('T')[0];
                }
                return item[key] || 'unknown';
            }).join('|');
            
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
        }
        
        return groups;
    }
    
    /**
     * グループデータの集計
     * @param {Array} groupData - グループデータ
     * @param {Object} aggregateBy - 集計設定
     * @returns {Object} 集計結果
     */
    aggregateGroup(groupData, aggregateBy) {
        const result = {
            count: groupData.length
        };
        
        for (const [field, operations] of Object.entries(aggregateBy)) {
            const values = groupData.map(item => item[field]).filter(val => val != null);
            
            if (values.length === 0) continue;
            
            if (operations.includes('sum')) {
                result[`${field}_sum`] = values.reduce((sum, val) => sum + Number(val), 0);
            }
            
            if (operations.includes('avg')) {
                result[`${field}_avg`] = values.reduce((sum, val) => sum + Number(val), 0) / values.length;
            }
            
            if (operations.includes('min')) {
                result[`${field}_min`] = Math.min(...values.map(Number));
            }
            
            if (operations.includes('max')) {
                result[`${field}_max`] = Math.max(...values.map(Number));
            }
            
            if (operations.includes('count')) {
                result[`${field}_count`] = values.length;
            }
        }
        
        return result;
    }
    
    /**
     * 集計用クエリの構築
     * @param {Object} filters - フィルター条件
     * @param {string} period - 期間設定
     * @returns {Object} クエリオブジェクト
     */
    buildAggregationQuery(filters, period) {
        const query = { ...filters };
        
        // 期間設定の処理
        if (period) {
            const now = Date.now();
            switch (period) {
                case 'last24h':
                    query.startDate = now - 24 * 60 * 60 * 1000;
                    break;
                case 'last7d':
                    query.startDate = now - 7 * 24 * 60 * 60 * 1000;
                    break;
                case 'last30d':
                    query.startDate = now - 30 * 24 * 60 * 60 * 1000;
                    break;
            }
        }
        
        return query;
    }
    
    /**
     * 統計サマリーの取得
     * @param {Object} query - クエリパラメータ
     * @returns {Promise<Object>} 統計サマリー
     */
    async getStatsSummary(query = {}) {
        try {
            const { period = 'last7d' } = query;
            
            // 並列でデータを取得
            const [sessions, interactions, performance] = await Promise.all([
                this.getData('/sessions', { ...query, period }).then(r => r.data || []),
                this.getData('/bubbles', { ...query, period }).then(r => r.data || []),
                this.getData('/performance', { ...query, period }).then(r => r.data || [])
            ]);
            
            // サマリー統計の計算
            const summary = {
                overview: {
                    totalSessions: sessions.length,
                    totalInteractions: interactions.length,
                    totalPerformanceRecords: performance.length,
                    period
                },
                sessionStats: this.calculateSessionStats(sessions),
                interactionStats: this.calculateInteractionStats(interactions),
                performanceStats: this.calculatePerformanceStats(performance),
                generatedAt: new Date().toISOString()
            };
            
            return summary;
            
        } catch (error) {
            console.error('Stats summary error:', error);
            throw error;
        }
    }
    
    /**
     * セッション統計の計算
     * @param {Array} sessions - セッションデータ
     * @returns {Object} セッション統計
     */
    calculateSessionStats(sessions) {
        if (sessions.length === 0) {
            return { noData: true };
        }
        
        const completedSessions = sessions.filter(s => s.completed);
        const durations = sessions.map(s => s.duration).filter(d => d > 0);
        const scores = sessions.map(s => s.finalScore).filter(s => s > 0);
        
        return {
            totalSessions: sessions.length,
            completedSessions: completedSessions.length,
            completionRate: completedSessions.length / sessions.length,
            averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length || 0,
            averageScore: scores.reduce((sum, s) => sum + s, 0) / scores.length || 0,
            maxScore: scores.length > 0 ? Math.max(...scores) : 0
        };
    }
    
    /**
     * インタラクション統計の計算
     * @param {Array} interactions - インタラクションデータ
     * @returns {Object} インタラクション統計
     */
    calculateInteractionStats(interactions) {
        if (interactions.length === 0) {
            return { noData: true };
        }
        
        const bubbleTypes = {};
        const reactionTimes = [];
        let totalScore = 0;
        
        for (const interaction of interactions) {
            // バブルタイプ別統計
            if (!bubbleTypes[interaction.bubbleType]) {
                bubbleTypes[interaction.bubbleType] = { count: 0, totalScore: 0 };
            }
            bubbleTypes[interaction.bubbleType].count++;
            bubbleTypes[interaction.bubbleType].totalScore += interaction.scoreGained || 0;
            
            // 反応時間統計
            if (interaction.reactionTime > 0) {
                reactionTimes.push(interaction.reactionTime);
            }
            
            totalScore += interaction.scoreGained || 0;
        }
        
        return {
            totalInteractions: interactions.length,
            totalScore,
            averageReactionTime: reactionTimes.reduce((sum, rt) => sum + rt, 0) / reactionTimes.length || 0,
            bubbleTypeStats: bubbleTypes
        };
    }
    
    /**
     * パフォーマンス統計の計算
     * @param {Array} performanceData - パフォーマンスデータ
     * @returns {Object} パフォーマンス統計
     */
    calculatePerformanceStats(performanceData) {
        if (performanceData.length === 0) {
            return { noData: true };
        }
        
        const fpsValues = performanceData.map(p => p.fps).filter(fps => fps > 0);
        const memoryValues = performanceData.map(p => p.memoryUsage?.used).filter(mem => mem > 0);
        
        return {
            totalRecords: performanceData.length,
            averageFPS: fpsValues.reduce((sum, fps) => sum + fps, 0) / fpsValues.length || 0,
            minFPS: fpsValues.length > 0 ? Math.min(...fpsValues) : 0,
            maxFPS: fpsValues.length > 0 ? Math.max(...fpsValues) : 0,
            averageMemoryUsage: memoryValues.reduce((sum, mem) => sum + mem, 0) / memoryValues.length || 0
        };
    }
    
    /**
     * レート制限チェック
     * @param {string} clientId - クライアントID
     * @returns {boolean} リクエスト許可判定
     */
    checkRateLimit(clientId) {
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
    createSuccessResponse(data, metadata = {}) {
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
    createErrorResponse(code, message, status = 500, metadata = {}) {
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
                'data_retrieval',
                'aggregation',
                'rate_limiting',
                'anonymization',
                'filtering',
                'sorting'
            ]
        };
    }
    
    /**
     * リクエストID生成
     * @returns {string} ユニークなリクエストID
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * エンドポイント統計の更新
     * @param {Object} endpointConfig - エンドポイント設定
     * @param {boolean} success - 成功フラグ
     * @param {number} responseTime - レスポンス時間
     */
    updateRequestStats(endpointConfig, success, responseTime) {
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
    updateAPIStats(success, responseTime) {
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
    getEndpointStats(endpoint) {
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
    updateRateLimitSettings(newSettings) {
        this.rateLimiting = { ...this.rateLimiting, ...newSettings };
    }
    
    /**
     * 高度な集計処理の実行
     * @param {string} dataType - データタイプ
     * @param {Object} rules - 集計ルール
     * @returns {Promise<Object>} 集計結果
     */
    async performAdvancedAggregation(dataType, rules) {
        const {
            multiGroupBy = [],
            customAggregations = {},
            timeWindow = null,
            conditionalAggregations = [],
            hierarchicalGrouping = null,
            filters = {},
            period = null
        } = rules;
        
        // データの取得
        const query = this.buildAggregationQuery(filters, period);
        const rawData = await this.storageManager.getData(dataType, query);
        
        if (!Array.isArray(rawData) || rawData.length === 0) {
            return { groups: {}, metadata: { totalRecords: 0 } };
        }
        
        let processedData = rawData;
        
        // 時間窓によるフィルタリング
        if (timeWindow) {
            processedData = this.applyTimeWindow(processedData, timeWindow);
        }
        
        // 階層的グループ化
        let groupedData;
        if (hierarchicalGrouping) {
            groupedData = this.performHierarchicalGrouping(processedData, hierarchicalGrouping);
        } else {
            groupedData = this.groupData(processedData, multiGroupBy);
        }
        
        // カスタム集計の実行
        const aggregatedResult = {};
        for (const [groupKey, groupData] of Object.entries(groupedData)) {
            aggregatedResult[groupKey] = this.performCustomAggregations(groupData, {
                ...customAggregations,
                conditionalAggregations
            });
        }
        
        return {
            groups: aggregatedResult,
            metadata: {
                totalRecords: rawData.length,
                processedRecords: processedData.length,
                groupCount: Object.keys(aggregatedResult).length
            }
        };
    }
    
    /**
     * 時系列集計の実行
     * @param {Array} data - データ配列
     * @param {Object} rules - 時系列集計ルール
     * @returns {Array} 時系列集計結果
     */
    performTimeSeriesAggregation(data, rules) {
        const {
            timeField,
            interval,
            aggregateBy,
            fillGaps,
            startDate,
            endDate
        } = rules;
        
        // 時間間隔の定義
        const intervalMs = this.getIntervalMilliseconds(interval);
        
        // 時系列データのグループ化
        const timeGroups = {};
        
        for (const record of data) {
            const timestamp = record[timeField];
            if (!timestamp) continue;
            
            // 時間間隔に基づくキーの生成
            const timeKey = Math.floor(timestamp / intervalMs) * intervalMs;
            
            if (!timeGroups[timeKey]) {
                timeGroups[timeKey] = [];
            }
            timeGroups[timeKey].push(record);
        }
        
        // 各時間グループの集計
        const result = [];
        const sortedTimeKeys = Object.keys(timeGroups).map(Number).sort((a, b) => a - b);
        
        for (const timeKey of sortedTimeKeys) {
            const groupData = timeGroups[timeKey];
            const aggregated = this.aggregateGroup(groupData, aggregateBy);
            
            result.push({
                timestamp: timeKey,
                datetime: new Date(timeKey).toISOString(),
                interval,
                ...aggregated
            });
        }
        
        // ギャップを埋める処理
        if (fillGaps && result.length > 0) {
            return this.fillTimeSeriesGaps(result, intervalMs, startDate, endDate);
        }
        
        return result;
    }
    
    /**
     * 時間窓の適用
     * @param {Array} data - データ配列
     * @param {Object} timeWindow - 時間窓設定
     * @returns {Array} フィルタリングされたデータ
     */
    applyTimeWindow(data, timeWindow) {
        const { windowSize, windowType = 'sliding', baseTime = Date.now() } = timeWindow;
        
        if (windowType === 'sliding') {
            const cutoffTime = baseTime - windowSize;
            return data.filter(record => record.timestamp >= cutoffTime);
        }
        
        // 他の時間窓タイプの実装を将来追加可能
        return data;
    }
    
    /**
     * 階層的グループ化の実行
     * @param {Array} data - データ配列
     * @param {Object} hierarchicalGrouping - 階層的グループ化設定
     * @returns {Object} 階層的にグループ化されたデータ
     */
    performHierarchicalGrouping(data, hierarchicalGrouping) {
        const { levels = [] } = hierarchicalGrouping;
        
        if (levels.length === 0) {
            return { 'all': data };
        }
        
        const result = {};
        
        for (const record of data) {
            let currentLevel = result;
            let pathKey = '';
            
            for (let i = 0; i < levels.length; i++) {
                const levelKey = levels[i];
                const value = record[levelKey] || 'unknown';
                pathKey += (pathKey ? '|' : '') + value;
                
                if (i === levels.length - 1) {
                    // 最終レベル
                    if (!currentLevel[pathKey]) {
                        currentLevel[pathKey] = [];
                    }
                    currentLevel[pathKey].push(record);
                } else {
                    // 中間レベル
                    if (!currentLevel[value]) {
                        currentLevel[value] = {};
                    }
                    currentLevel = currentLevel[value];
                }
            }
        }
        
        return this.flattenHierarchicalGroups(result);
    }
    
    /**
     * カスタム集計の実行
     * @param {Array} groupData - グループデータ
     * @param {Object} customAggregations - カスタム集計設定
     * @returns {Object} 集計結果
     */
    performCustomAggregations(groupData, customAggregations) {
        const result = { count: groupData.length };
        const { conditionalAggregations = [] } = customAggregations;
        
        // 条件付き集計の実行
        for (const conditionalAgg of conditionalAggregations) {
            const {
                field,
                condition,
                aggregationType,
                resultField
            } = conditionalAgg;
            
            const filteredData = groupData.filter(record => this.evaluateCondition(record, condition));
            
            if (filteredData.length > 0) {
                const values = filteredData.map(record => record[field]).filter(val => val != null);
                result[resultField] = this.performAggregationFunction(values, aggregationType);
            } else {
                result[resultField] = 0;
            }
        }
        
        return result;
    }
    
    /**
     * 条件の評価
     * @param {Object} record - レコード
     * @param {Object} condition - 条件
     * @returns {boolean} 条件の評価結果
     */
    evaluateCondition(record, condition) {
        const { field, operator, value } = condition;
        const recordValue = record[field];
        
        switch (operator) {
            case '=':
            case '==':
                return recordValue == value;
            case '!=':
                return recordValue != value;
            case '>':
                return recordValue > value;
            case '>=':
                return recordValue >= value;
            case '<':
                return recordValue < value;
            case '<=':
                return recordValue <= value;
            case 'in':
                return Array.isArray(value) && value.includes(recordValue);
            case 'contains':
                return String(recordValue).includes(value);
            default:
                return true;
        }
    }
    
    /**
     * 集計関数の実行
     * @param {Array} values - 値の配列
     * @param {string} aggregationType - 集計タイプ
     * @returns {number} 集計結果
     */
    performAggregationFunction(values, aggregationType) {
        if (values.length === 0) return 0;
        
        switch (aggregationType) {
            case 'sum':
                return values.reduce((sum, val) => sum + Number(val), 0);
            case 'avg':
                return values.reduce((sum, val) => sum + Number(val), 0) / values.length;
            case 'min':
                return Math.min(...values.map(Number));
            case 'max':
                return Math.max(...values.map(Number));
            case 'count':
                return values.length;
            case 'distinct':
                return new Set(values).size;
            default:
                return values.length;
        }
    }
    
    /**
     * 集計結果の統合
     * @param {Object} aggregatedResults - 集計結果
     * @param {Object} options - 統合オプション
     * @returns {Object} 統合された結果
     */
    consolidateAggregationResults(aggregatedResults, options = {}) {
        const { maxResults, sortBy, sortOrder } = options;
        
        const consolidated = {
            summary: this.createAggregationSummary(aggregatedResults),
            details: aggregatedResults
        };
        
        // ソート処理
        if (sortBy && consolidated.details) {
            for (const [dataType, typeResult] of Object.entries(consolidated.details)) {
                if (typeResult.groups) {
                    const sortedGroups = this.sortAggregationGroups(typeResult.groups, sortBy, sortOrder);
                    consolidated.details[dataType].groups = sortedGroups;
                }
            }
        }
        
        // 結果数制限
        if (maxResults && consolidated.details) {
            consolidated.details = this.limitAggregationResults(consolidated.details, maxResults);
        }
        
        return consolidated;
    }
    
    /**
     * 時系列クエリの構築
     * @param {Object} filters - フィルター
     * @param {string} startDate - 開始日
     * @param {string} endDate - 終了日
     * @returns {Object} クエリオブジェクト
     */
    buildTimeSeriesQuery(filters, startDate, endDate) {
        const query = { ...filters };
        
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) {
                query.timestamp.$gte = new Date(startDate).getTime();
            }
            if (endDate) {
                query.timestamp.$lte = new Date(endDate).getTime();
            }
        }
        
        return query;
    }
    
    /**
     * 間隔のミリ秒取得
     * @param {string} interval - 間隔
     * @returns {number} ミリ秒
     */
    getIntervalMilliseconds(interval) {
        const intervals = {
            'minute': 60 * 1000,
            'hour': 60 * 60 * 1000,
            'day': 24 * 60 * 60 * 1000,
            'week': 7 * 24 * 60 * 60 * 1000,
            'month': 30 * 24 * 60 * 60 * 1000
        };
        
        return intervals[interval] || intervals['hour'];
    }
    
    /**
     * 時系列のギャップを埋める
     * @param {Array} data - 時系列データ
     * @param {number} intervalMs - 間隔（ミリ秒）
     * @param {number} startDate - 開始日時
     * @param {number} endDate - 終了日時
     * @returns {Array} ギャップが埋められた時系列データ
     */
    fillTimeSeriesGaps(data, intervalMs, startDate, endDate) {
        if (data.length === 0) return data;
        
        const filled = [];
        const dataMap = new Map();
        
        // 既存データをマップに格納
        for (const item of data) {
            dataMap.set(item.timestamp, item);
        }
        
        // 範囲内の全時間点を生成
        const start = Math.max(startDate, data[0].timestamp);
        const end = Math.min(endDate, data[data.length - 1].timestamp);
        
        for (let timestamp = start; timestamp <= end; timestamp += intervalMs) {
            if (dataMap.has(timestamp)) {
                filled.push(dataMap.get(timestamp));
            } else {
                // 空のデータポイントを作成
                filled.push({
                    timestamp,
                    datetime: new Date(timestamp).toISOString(),
                    interval: data[0].interval,
                    count: 0
                });
            }
        }
        
        return filled;
    }
    
    /**
     * ヘルパーメソッド群
     */
    flattenHierarchicalGroups(hierarchicalGroups) {
        const flattened = {};
        
        const flatten = (obj, prefix = '') => {
            for (const [key, value] of Object.entries(obj)) {
                const newKey = prefix ? `${prefix}|${key}` : key;
                if (Array.isArray(value)) {
                    flattened[newKey] = value;
                } else if (typeof value === 'object') {
                    flatten(value, newKey);
                }
            }
        };
        
        flatten(hierarchicalGroups);
        return flattened;
    }
    
    createAggregationSummary(aggregatedResults) {
        const summary = {};
        
        for (const [dataType, result] of Object.entries(aggregatedResults)) {
            summary[dataType] = {
                totalGroups: Object.keys(result.groups || {}).length,
                totalRecords: result.metadata?.totalRecords || 0,
                processedRecords: result.metadata?.processedRecords || 0
            };
        }
        
        return summary;
    }
    
    sortAggregationGroups(groups, sortBy, sortOrder) {
        const entries = Object.entries(groups);
        
        entries.sort((a, b) => {
            const aVal = a[1][sortBy] || 0;
            const bVal = b[1][sortBy] || 0;
            return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
        });
        
        return Object.fromEntries(entries);
    }
    
    limitAggregationResults(details, maxResults) {
        const limited = {};
        
        for (const [dataType, result] of Object.entries(details)) {
            if (result.groups) {
                const groupEntries = Object.entries(result.groups);
                const limitedGroups = Object.fromEntries(groupEntries.slice(0, maxResults));
                limited[dataType] = {
                    ...result,
                    groups: limitedGroups
                };
            } else {
                limited[dataType] = result;
            }
        }
        
        return limited;
    }
    
    countTotalGroups(result) {
        let total = 0;
        
        if (result.details) {
            for (const typeResult of Object.values(result.details)) {
                if (typeResult.groups) {
                    total += Object.keys(typeResult.groups).length;
                }
            }
        }
        
        return total;
    }
    
    /**
     * データエクスポート機能
     * ExportManagerを使用して多形式エクスポートを提供
     * @param {Object} options - エクスポートオプション
     * @param {string|Array} options.dataTypes - エクスポートするデータタイプ
     * @param {string} options.format - 出力形式（json, csv, xml）
     * @param {Object} options.filters - データフィルター
     * @param {boolean} options.anonymize - データ匿名化フラグ
     * @param {boolean} options.includeMetadata - メタデータ含有フラグ
     * @returns {Promise<Object>} エクスポート結果
     */
    async exportData(options = {}) {
        const startTime = performance.now();
        
        try {
            // デフォルト設定
            const exportOptions = {
                dataTypes: options.dataTypes || 'all',
                format: options.format || 'json',
                filters: options.filters || {},
                anonymize: options.anonymize !== false, // デフォルトで匿名化を有効
                includeMetadata: options.includeMetadata !== false,
                ...options
            };
            
            // ExportManagerを使用してエクスポート実行
            const result = await this.exportManager.exportData(exportOptions);
            
            if (result.success) {
                // API用のレスポンス形式に変換
                return {
                    success: true,
                    data: result.data,
                    format: result.format,
                    filename: result.filename,
                    size: result.size,
                    duration: result.duration,
                    metadata: {
                        exportId: result.metadata?.exportId || `api_export_${Date.now()}`,
                        timestamp: new Date().toISOString(),
                        apiEndpoint: '/export',
                        requestOptions: exportOptions,
                        responseTime: Math.max(performance.now() - startTime, 0.1)
                    }
                };
            } else {
                throw new Error(result.error || 'Export failed');
            }
        } catch (error) {
            console.error('Export API error:', error);
            return {
                success: false,
                error: {
                    code: 'EXPORT_ERROR',
                    message: error.message,
                    status: 500,
                    timestamp: new Date().toISOString(),
                    endpoint: '/export'
                },
                metadata: {
                    responseTime: Math.max(performance.now() - startTime, 0.1)
                }
            };
        }
    }
    
    /**
     * サポートされているエクスポート形式の取得
     * @returns {Array<string>} サポートされている形式リスト
     */
    getSupportedExportFormats() {
        return this.exportManager.getSupportedFormats();
    }
    
    /**
     * エクスポート可能なデータタイプの取得
     * @returns {Array<string>} サポートされているデータタイプリスト
     */
    getSupportedExportDataTypes() {
        return this.exportManager.getSupportedDataTypes();
    }
    
    /**
     * エクスポート統計の取得
     * @returns {Object} エクスポート統計情報
     */
    getExportStats() {
        return this.exportManager.getExportStats();
    }
    
    /**
     * リソースの解放
     */
    destroy() {
        this.endpoints.clear();
        this.rateLimiting.requestHistory.clear();
        this.aggregationCache.clear();
        
        // ExportManagerのリソースも解放
        if (this.exportManager && typeof this.exportManager.destroy === 'function') {
            this.exportManager.destroy();
        }
        
        console.log('Analytics API destroyed');
    }
}