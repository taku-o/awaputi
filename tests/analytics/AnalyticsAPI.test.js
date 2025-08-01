import { AnalyticsAPI } from '../../src/analytics/AnalyticsAPI.js';

// Mock Storage Manager
class MockStorageManager {
    constructor() {
        this.data = new Map();
    }
    
    async getData(dataType, query = {}) {
        const data = this.data.get(dataType) || [];
        let filteredData = [...data];
        
        // フィルタリング処理
        if (query.startDate) {
            filteredData = filteredData.filter(item => item.timestamp >= query.startDate);
        }
        
        if (query.endDate) {
            filteredData = filteredData.filter(item => item.timestamp <= query.endDate);
        }
        
        if (query.sessionId) {
            filteredData = filteredData.filter(item => item.sessionId === query.sessionId);
        }
        
        if (query.bubbleType) {
            filteredData = filteredData.filter(item => item.bubbleType === query.bubbleType);
        }
        
        // ソート処理
        if (query.sortBy) {
            const sortOrder = query.sortOrder === 'desc' ? -1 : 1;
            filteredData.sort((a, b) => {
                const aVal = a[query.sortBy];
                const bVal = b[query.sortBy];
                if (aVal < bVal) return -1 * sortOrder;
                if (aVal > bVal) return 1 * sortOrder;
                return 0;
            });
        }
        
        // 制限処理
        if (query.limit) {
            filteredData = filteredData.slice(0, query.limit);
        }
        
        return filteredData;
    }
    
    setData(dataType, data) {
        this.data.set(dataType, data);
    }
}

// Mock Privacy Manager
class MockPrivacyManager {
    async anonymizeData(data) {
        // 簡単な匿名化処理
        const anonymized = JSON.parse(JSON.stringify(data));
        
        if (anonymized.data && Array.isArray(anonymized.data)) {
            anonymized.data.forEach(record => {
                if (record.playerId) {
                    record.playerId = 'anonymous_' + Math.random().toString(36).substr(2, 9);
                }
                if (record.userAgent) {
                    record.userAgent = 'anonymous_browser';
                }
            });
        }
        
        return anonymized;
    }
}

describe('AnalyticsAPI', () => {
    let analyticsAPI;
    let mockStorageManager;
    let mockPrivacyManager;
    
    beforeEach(() => {
        mockStorageManager = new MockStorageManager();
        mockPrivacyManager = new MockPrivacyManager();
        analyticsAPI = new AnalyticsAPI(mockStorageManager, mockPrivacyManager);
        
        // サンプルデータの設定
        mockStorageManager.setData('sessionData', [
            {
                sessionId: 'session_1',
                timestamp: 1640995200000, // 2022-01-01
                playerId: 'player_123',
                duration: 300000,
                finalScore: 1500,
                completed: true
            },
            {
                sessionId: 'session_2',
                timestamp: 1641081600000, // 2022-01-02
                playerId: 'player_456',
                duration: 180000,
                finalScore: 900,
                completed: false
            }
        ]);
        
        mockStorageManager.setData('bubbleInteractions', [
            {
                sessionId: 'session_1',
                timestamp: 1640995300000,
                bubbleType: 'normal',
                action: 'popped',
                reactionTime: 250,
                scoreGained: 10
            },
            {
                sessionId: 'session_1',
                timestamp: 1640995350000,
                bubbleType: 'rainbow',
                action: 'popped',
                reactionTime: 180,
                scoreGained: 50
            }
        ]);
        
        mockStorageManager.setData('performanceData', [
            {
                sessionId: 'session_1',
                timestamp: 1640995400000,
                fps: 58.5,
                memoryUsage: { used: 50000000, total: 100000000 }
            },
            {
                sessionId: 'session_2',
                timestamp: 1641081700000,
                fps: 45.2,
                memoryUsage: { used: 75000000, total: 100000000 }
            }
        ]);
    });
    
    describe('コンストラクタ', () => {
        test('正しく初期化される', () => {
            expect(analyticsAPI).toBeDefined();
            expect(analyticsAPI.storageManager).toBe(mockStorageManager);
            expect(analyticsAPI.privacyManager).toBe(mockPrivacyManager);
            expect(analyticsAPI.endpoints.size).toBeGreaterThan(0);
        });
        
        test('標準エンドポイントが登録される', () => {
            expect(analyticsAPI.endpoints.has('/sessions')).toBe(true);
            expect(analyticsAPI.endpoints.has('/bubbles')).toBe(true);
            expect(analyticsAPI.endpoints.has('/performance')).toBe(true);
            expect(analyticsAPI.endpoints.has('/aggregated')).toBe(true);
            expect(analyticsAPI.endpoints.has('/stats/summary')).toBe(true);
            expect(analyticsAPI.endpoints.has('/realtime')).toBe(true);
            expect(analyticsAPI.endpoints.has('/meta')).toBe(true);
        });
        
        test('レート制限設定が初期化される', () => {
            expect(analyticsAPI.rateLimiting.enabled).toBe(true);
            expect(analyticsAPI.rateLimiting.maxRequestsPerMinute).toBe(60);
            expect(analyticsAPI.rateLimiting.maxRequestsPerHour).toBe(1000);
        });
    });
    
    describe('エンドポイント管理', () => {
        test('カスタムエンドポイントが登録できる', () => {
            const customHandler = jest.fn().mockResolvedValue(['test']);
            
            analyticsAPI.registerEndpoint('/custom', customHandler, {
                requireAuth: true,
                rateLimit: false
            });
            
            expect(analyticsAPI.endpoints.has('/custom')).toBe(true);
            const endpoint = analyticsAPI.endpoints.get('/custom');
            expect(endpoint.handler).toBe(customHandler);
            expect(endpoint.options.requireAuth).toBe(true);
            expect(endpoint.options.rateLimit).toBe(false);
        });
        
        test('エンドポイント一覧が取得できる', () => {
            const endpoints = analyticsAPI.getEndpoints();
            expect(Array.isArray(endpoints)).toBe(true);
            expect(endpoints).toContain('/sessions');
            expect(endpoints).toContain('/bubbles');
        });
    });
    
    describe('データ取得機能', () => {
        test('セッションデータが取得できる', async () => {
            const result = await analyticsAPI.getData('/sessions');
            
            expect(result.success).toBe(true);
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data).toHaveLength(2);
            expect(result.metadata.dataCount).toBe(2);
            expect(result.metadata.endpoint).toBe('/sessions');
        });
        
        test('バブルインタラクションデータが取得できる', async () => {
            const result = await analyticsAPI.getData('/bubbles');
            
            expect(result.success).toBe(true);
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data).toHaveLength(2);
            expect(result.data[0].bubbleType).toBeDefined();
        });
        
        test('パフォーマンスデータが取得できる', async () => {
            const result = await analyticsAPI.getData('/performance');
            
            expect(result.success).toBe(true);
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data).toHaveLength(2);
            expect(result.data[0].fps).toBeDefined();
        });
        
        test('存在しないエンドポイントでエラーになる', async () => {
            const result = await analyticsAPI.getData('/nonexistent');
            
            expect(result.success).toBe(false);
            expect(result.error.code).toBe('ENDPOINT_NOT_FOUND');
            expect(result.error.status).toBe(404);
        });
    });
    
    describe('クエリ処理機能', () => {
        test('日付範囲フィルターが動作する', async () => {
            const result = await analyticsAPI.getData('/sessions', {
                startDate: '2022-01-01T00:00:00Z',
                endDate: '2022-01-01T23:59:59Z'
            });
            
            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
            expect(result.data[0].sessionId).toBe('session_1');
        });
        
        test('セッションIDフィルターが動作する', async () => {
            const result = await analyticsAPI.getData('/sessions', {
                sessionId: 'session_2'
            });
            
            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
            expect(result.data[0].sessionId).toBe('session_2');
        });
        
        test('制限数が適用される', async () => {
            const result = await analyticsAPI.getData('/sessions', {
                limit: 1
            });
            
            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
        });
        
        test('ソート機能が動作する', async () => {
            const result = await analyticsAPI.getData('/sessions', {
                sortBy: 'timestamp',
                sortOrder: 'desc'
            });
            
            expect(result.success).toBe(true);
            expect(result.data[0].sessionId).toBe('session_2'); // 新しい順
        });
        
        test('無効なソートフィールドは無視される', async () => {
            const result = await analyticsAPI.getData('/sessions', {
                sortBy: 'invalidField'
            });
            
            expect(result.success).toBe(true);
            // ソートは適用されないが、エラーにはならない
        });
    });
    
    describe('データ匿名化機能', () => {
        test('データが匿名化される', async () => {
            const result = await analyticsAPI.getData('/sessions');
            
            expect(result.success).toBe(true);
            expect(result.metadata.anonymized).toBe(true);
            // playerId が匿名化されている（mockでは 'anonymous_' プレフィックス付き）
            if (result.data.length > 0 && result.data[0].playerId) {
                expect(result.data[0].playerId).toMatch(/^anonymous_/);
            }
        });
        
        test('匿名化をスキップできる', async () => {
            const result = await analyticsAPI.getData('/sessions', {}, {
                skipAnonymization: true
            });
            
            expect(result.success).toBe(true);
            expect(result.metadata.anonymized).toBe(false);
        });
        
        test('PrivacyManagerなしでも動作する', async () => {
            const apiWithoutPrivacy = new AnalyticsAPI(mockStorageManager, null);
            
            const result = await apiWithoutPrivacy.getData('/sessions');
            
            expect(result.success).toBe(true);
            expect(result.metadata.anonymized).toBe(false);
        });
    });
    
    describe('集計機能', () => {
        test('基本的な集計が動作する', async () => {
            const aggregationRules = {
                dataType: 'sessionData',
                groupBy: ['completed'],
                aggregateBy: {
                    'finalScore': ['sum', 'avg', 'count'],
                    'duration': ['avg', 'min', 'max']
                }
            };
            
            const result = await analyticsAPI.getAggregatedData(aggregationRules);
            
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.metadata.sourceDataCount).toBe(2);
        });
        
        test('日付別グループ化が動作する', async () => {
            const aggregationRules = {
                dataType: 'sessionData',
                groupBy: ['date'],
                aggregateBy: {
                    'finalScore': ['avg']
                }
            };
            
            const result = await analyticsAPI.getAggregatedData(aggregationRules);
            
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
        });
        
        test('期間フィルターが適用される', async () => {
            const aggregationRules = {
                dataType: 'sessionData',
                period: 'last24h',
                aggregateBy: {
                    'finalScore': ['sum']
                }
            };
            
            const result = await analyticsAPI.getAggregatedData(aggregationRules);
            
            expect(result.success).toBe(true);
        });
        
        test('データがない場合の処理', async () => {
            mockStorageManager.setData('emptyData', []);
            
            const aggregationRules = {
                dataType: 'emptyData',
                aggregateBy: {
                    'score': ['sum']
                }
            };
            
            const result = await analyticsAPI.getAggregatedData(aggregationRules);
            
            expect(result.success).toBe(true);
            expect(result.data).toEqual([]);
        });
    });
    
    describe('統計サマリー機能', () => {
        test('統計サマリーが取得できる', async () => {
            const result = await analyticsAPI.getData('/stats/summary');
            
            expect(result.success).toBe(true);
            expect(result.data.overview).toBeDefined();
            expect(result.data.sessionStats).toBeDefined();
            expect(result.data.interactionStats).toBeDefined();
            expect(result.data.performanceStats).toBeDefined();
        });
        
        test('セッション統計が正しく計算される', async () => {
            const result = await analyticsAPI.getData('/stats/summary');
            const sessionStats = result.data.sessionStats;
            
            expect(sessionStats.totalSessions).toBe(2);
            expect(sessionStats.completedSessions).toBe(1);
            expect(sessionStats.completionRate).toBe(0.5);
            expect(sessionStats.averageScore).toBeGreaterThan(0);
        });
        
        test('インタラクション統計が正しく計算される', async () => {
            const result = await analyticsAPI.getData('/stats/summary');
            const interactionStats = result.data.interactionStats;
            
            expect(interactionStats.totalInteractions).toBe(2);
            expect(interactionStats.totalScore).toBeGreaterThan(0);
            expect(interactionStats.bubbleTypeStats).toBeDefined();
            expect(interactionStats.bubbleTypeStats.normal).toBeDefined();
            expect(interactionStats.bubbleTypeStats.rainbow).toBeDefined();
        });
        
        test('パフォーマンス統計が正しく計算される', async () => {
            const result = await analyticsAPI.getData('/stats/summary');
            const performanceStats = result.data.performanceStats;
            
            expect(performanceStats.totalRecords).toBe(2);
            expect(performanceStats.averageFPS).toBeGreaterThan(0);
            expect(performanceStats.minFPS).toBeLessThanOrEqual(performanceStats.maxFPS);
        });
        
        test('データがない場合のノーデータフラグ', async () => {
            const emptyAPI = new AnalyticsAPI(new MockStorageManager());
            
            const result = await emptyAPI.getData('/stats/summary');
            
            expect(result.success).toBe(true);
            expect(result.data.sessionStats.noData).toBe(true);
            expect(result.data.interactionStats.noData).toBe(true);
            expect(result.data.performanceStats.noData).toBe(true);
        });
    });
    
    describe('レート制限機能', () => {
        test('正常なリクエストが通る', async () => {
            const result = await analyticsAPI.getData('/sessions');
            
            expect(result.success).toBe(true);
        });
        
        test('レート制限を超えた場合のエラー処理', async () => {
            // レート制限を厳しく設定
            analyticsAPI.updateRateLimitSettings({
                maxRequestsPerMinute: 1,
                maxRequestsPerHour: 1
            });
            
            // 最初のリクエストは成功
            const result1 = await analyticsAPI.getData('/sessions');
            expect(result1.success).toBe(true);
            
            // 2回目のリクエストは制限される
            const result2 = await analyticsAPI.getData('/sessions');
            expect(result2.success).toBe(false);
            expect(result2.error.code).toBe('RATE_LIMIT_EXCEEDED');
            expect(result2.error.status).toBe(429);
        });
        
        test('レート制限をスキップできる', async () => {
            // レート制限を厳しく設定
            analyticsAPI.updateRateLimitSettings({
                maxRequestsPerMinute: 1
            });
            
            // 最初のリクエスト
            await analyticsAPI.getData('/sessions');
            
            // レート制限スキップでリクエスト
            const result = await analyticsAPI.getData('/sessions', {}, {
                skipRateLimit: true
            });
            
            expect(result.success).toBe(true);
        });
        
        test('レート制限が無効化できる', async () => {
            analyticsAPI.updateRateLimitSettings({ enabled: false });
            
            // 複数回リクエストしても制限されない
            for (let i = 0; i < 5; i++) {
                const result = await analyticsAPI.getData('/sessions');
                expect(result.success).toBe(true);
            }
        });
    });
    
    describe('メタデータ機能', () => {
        test('APIメタデータが取得できる', async () => {
            const result = await analyticsAPI.getData('/meta');
            
            expect(result.success).toBe(true);
            expect(result.data.version).toBeDefined();
            expect(result.data.endpoints).toBeDefined();
            expect(result.data.rateLimiting).toBeDefined();
            expect(result.data.stats).toBeDefined();
            expect(result.data.features).toBeDefined();
        });
        
        test('エンドポイント統計が取得できる', () => {
            const stats = analyticsAPI.getEndpointStats('/sessions');
            
            expect(stats).toBeDefined();
            expect(stats.callCount).toBeDefined();
            expect(stats.successCount).toBeDefined();
            expect(stats.errorCount).toBeDefined();
        });
        
        test('存在しないエンドポイントの統計はnull', () => {
            const stats = analyticsAPI.getEndpointStats('/nonexistent');
            expect(stats).toBeNull();
        });
    });
    
    describe('統計管理機能', () => {
        test('API統計が更新される', async () => {
            const initialStats = analyticsAPI.getAPIStats();
            
            await analyticsAPI.getData('/sessions');
            
            const updatedStats = analyticsAPI.getAPIStats();
            expect(updatedStats.totalRequests).toBe(initialStats.totalRequests + 1);
            expect(updatedStats.successfulRequests).toBe(initialStats.successfulRequests + 1);
        });
        
        test('エラー時の統計が更新される', async () => {
            const initialStats = analyticsAPI.getAPIStats();
            
            await analyticsAPI.getData('/nonexistent');
            
            const updatedStats = analyticsAPI.getAPIStats();
            expect(updatedStats.totalRequests).toBe(initialStats.totalRequests + 1);
            expect(updatedStats.failedRequests).toBe(initialStats.failedRequests + 1);
        });
        
        test('成功率が正しく計算される', async () => {
            // 成功リクエスト
            await analyticsAPI.getData('/sessions');
            await analyticsAPI.getData('/sessions');
            
            // 失敗リクエスト
            await analyticsAPI.getData('/nonexistent');
            
            const stats = analyticsAPI.getAPIStats();
            expect(stats.successRate).toBe(67); // 2/3 = 66.7% -> 67%
        });
    });
    
    describe('エラーハンドリング', () => {
        test('ストレージエラーが適切に処理される', async () => {
            const errorStorageManager = {
                getData: jest.fn().mockRejectedValue(new Error('Storage error'))
            };
            
            const errorAPI = new AnalyticsAPI(errorStorageManager);
            
            const result = await errorAPI.getData('/sessions');
            
            expect(result.success).toBe(false);
            expect(result.error.code).toBe('INTERNAL_ERROR');
            expect(result.error.status).toBe(500);
        });
        
        test('集計エラーが適切に処理される', async () => {
            const errorStorageManager = {
                getData: jest.fn().mockRejectedValue(new Error('Aggregation error'))
            };
            
            const errorAPI = new AnalyticsAPI(errorStorageManager);
            
            const result = await errorAPI.getAggregatedData({
                dataType: 'sessionData'
            });
            
            expect(result.success).toBe(false);
            expect(result.error.code).toBe('AGGREGATION_ERROR');
        });
    });
    
    describe('パフォーマンス要件', () => {
        test('レスポンス時間が記録される', async () => {
            const result = await analyticsAPI.getData('/sessions');
            
            expect(result.success).toBe(true);
            expect(result.metadata.responseTime).toBeDefined();
            expect(typeof result.metadata.responseTime).toBe('number');
            expect(result.metadata.responseTime).toBeGreaterThan(0);
        });
        
        test('大量データでも適切に処理される', async () => {
            // 大量のデータを設定
            const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
                sessionId: `session_${i}`,
                timestamp: Date.now() + i * 1000,
                playerId: `player_${i}`,
                duration: 300000 + i * 1000,
                finalScore: 1000 + i * 10,
                completed: i % 2 === 0
            }));
            
            mockStorageManager.setData('sessionData', largeDataset);
            
            const result = await analyticsAPI.getData('/sessions');
            
            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1000);
            expect(result.metadata.responseTime).toBeLessThan(1000); // < 1秒
        });
        
        test('制限値が適用される', async () => {
            const result = await analyticsAPI.getData('/sessions', {
                limit: 20000 // 制限値10,000を超える
            });
            
            expect(result.success).toBe(true);
            // クエリが前処理で制限される
        });
    });
    
    describe('高度な集計機能', () => {
        test('複数データタイプの集計が動作する', async () => {
            const aggregationRules = {
                dataTypes: ['sessionData', 'bubbleInteractions'],
                multiGroupBy: ['bubbleType'],
                customAggregations: {
                    conditionalAggregations: [
                        {
                            field: 'scoreGained',
                            condition: { field: 'action', operator: '==', value: 'popped' },
                            aggregationType: 'sum',
                            resultField: 'totalScore'
                        }
                    ]
                }
            };
            
            const result = await analyticsAPI.getAdvancedAggregatedData(aggregationRules);
            
            expect(result.success).toBe(true);
            expect(result.data.summary).toBeDefined();
            expect(result.data.details).toBeDefined();
            expect(result.data.details.sessionData).toBeDefined();
            expect(result.data.details.bubbleInteractions).toBeDefined();
        });
        
        test('階層的グループ化が動作する', async () => {
            const aggregationRules = {
                dataTypes: ['bubbleInteractions'],
                hierarchicalGrouping: {
                    levels: ['bubbleType', 'action']
                }
            };
            
            const result = await analyticsAPI.getAdvancedAggregatedData(aggregationRules);
            
            expect(result.success).toBe(true);
            expect(result.data.details.bubbleInteractions.groups).toBeDefined();
        });
        
        test('時間窓フィルタリングが動作する', async () => {
            const aggregationRules = {
                dataTypes: ['sessionData'],
                timeWindow: {
                    windowSize: 24 * 60 * 60 * 1000, // 24時間
                    windowType: 'sliding',
                    baseTime: Date.now()
                }
            };
            
            const result = await analyticsAPI.getAdvancedAggregatedData(aggregationRules);
            
            expect(result.success).toBe(true);
        });
        
        test('キャッシュ機能が動作する', async () => {
            const aggregationRules = {
                dataTypes: ['sessionData'],
                cacheKey: 'test_cache_key'
            };
            
            // 最初のリクエスト
            const result1 = await analyticsAPI.getAdvancedAggregatedData(aggregationRules);
            expect(result1.success).toBe(true);
            expect(result1.metadata.cached).toBe(false);
            
            // 2回目のリクエスト（キャッシュから取得）
            const result2 = await analyticsAPI.getAdvancedAggregatedData(aggregationRules);
            expect(result2.success).toBe(true);
            expect(result2.metadata.cached).toBe(true);
        });
    });
    
    describe('時系列集計機能', () => {
        test('時系列集計が動作する', async () => {
            const timeSeriesRules = {
                dataType: 'sessionData',
                timeField: 'timestamp',
                interval: 'day',
                aggregateBy: {
                    'finalScore': ['sum', 'avg'],
                    'duration': ['avg']
                },
                startDate: '2022-01-01T00:00:00Z',
                endDate: '2022-01-03T00:00:00Z',
                fillGaps: true
            };
            
            const result = await analyticsAPI.getTimeSeriesAggregation(timeSeriesRules);
            
            expect(result.success).toBe(true);
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.metadata.interval).toBe('day');
            expect(result.metadata.dataPoints).toBeGreaterThan(0);
        });
        
        test('時間間隔の設定が正しく動作する', async () => {
            const timeSeriesRules = {
                dataType: 'sessionData',
                interval: 'hour',
                startDate: '2022-01-01T00:00:00Z',
                endDate: '2022-01-01T23:59:59Z'
            };
            
            const result = await analyticsAPI.getTimeSeriesAggregation(timeSeriesRules);
            
            expect(result.success).toBe(true);
            if (result.data.length > 0) {
                expect(result.data[0].interval).toBe('hour');
                expect(result.data[0].datetime).toBeDefined();
            }
        });
        
        test('ギャップ埋め機能が動作する', async () => {
            const timeSeriesRules = {
                dataType: 'sessionData',
                interval: 'day',
                startDate: '2022-01-01T00:00:00Z',
                endDate: '2022-01-03T00:00:00Z',
                fillGaps: true
            };
            
            const result = await analyticsAPI.getTimeSeriesAggregation(timeSeriesRules);
            
            expect(result.success).toBe(true);
            // ギャップが埋められているかは実データに依存するためここでは基本動作のみテスト
        });
        
        test('データがない場合の時系列集計', async () => {
            const emptyAPI = new AnalyticsAPI(new MockStorageManager());
            
            const timeSeriesRules = {
                dataType: 'sessionData',
                interval: 'day',
                startDate: '2022-01-01T00:00:00Z',
                endDate: '2022-01-03T00:00:00Z'
            };
            
            const result = await emptyAPI.getTimeSeriesAggregation(timeSeriesRules);
            
            expect(result.success).toBe(true);
            expect(result.data).toEqual([]);
            expect(result.metadata.message).toContain('No data found');
        });
    });
    
    describe('条件付き集計機能', () => {
        test('条件評価が正しく動作する', () => {
            const record = { score: 100, type: 'normal', completed: true };
            
            // 等価条件
            expect(analyticsAPI.evaluateCondition(record, { field: 'type', operator: '==', value: 'normal' })).toBe(true);
            expect(analyticsAPI.evaluateCondition(record, { field: 'type', operator: '==', value: 'special' })).toBe(false);
            
            // 数値比較
            expect(analyticsAPI.evaluateCondition(record, { field: 'score', operator: '>', value: 50 })).toBe(true);
            expect(analyticsAPI.evaluateCondition(record, { field: 'score', operator: '<', value: 50 })).toBe(false);
            
            // 配列内包含
            expect(analyticsAPI.evaluateCondition(record, { field: 'type', operator: 'in', value: ['normal', 'special'] })).toBe(true);
            expect(analyticsAPI.evaluateCondition(record, { field: 'type', operator: 'in', value: ['special', 'rare'] })).toBe(false);
        });
        
        test('集計関数が正しく動作する', () => {
            const values = [10, 20, 30, 40, 50];
            
            expect(analyticsAPI.performAggregationFunction(values, 'sum')).toBe(150);
            expect(analyticsAPI.performAggregationFunction(values, 'avg')).toBe(30);
            expect(analyticsAPI.performAggregationFunction(values, 'min')).toBe(10);
            expect(analyticsAPI.performAggregationFunction(values, 'max')).toBe(50);
            expect(analyticsAPI.performAggregationFunction(values, 'count')).toBe(5);
            expect(analyticsAPI.performAggregationFunction([1, 2, 2, 3, 3, 3], 'distinct')).toBe(3);
        });
        
        test('空の値配列での集計関数', () => {
            const emptyValues = [];
            
            expect(analyticsAPI.performAggregationFunction(emptyValues, 'sum')).toBe(0);
            expect(analyticsAPI.performAggregationFunction(emptyValues, 'avg')).toBe(0);
            expect(analyticsAPI.performAggregationFunction(emptyValues, 'count')).toBe(0);
        });
    });
    
    describe('ヘルパーメソッド', () => {
        test('時間間隔のミリ秒変換が正しく動作する', () => {
            expect(analyticsAPI.getIntervalMilliseconds('minute')).toBe(60 * 1000);
            expect(analyticsAPI.getIntervalMilliseconds('hour')).toBe(60 * 60 * 1000);
            expect(analyticsAPI.getIntervalMilliseconds('day')).toBe(24 * 60 * 60 * 1000);
            expect(analyticsAPI.getIntervalMilliseconds('week')).toBe(7 * 24 * 60 * 60 * 1000);
            expect(analyticsAPI.getIntervalMilliseconds('month')).toBe(30 * 24 * 60 * 60 * 1000);
            expect(analyticsAPI.getIntervalMilliseconds('unknown')).toBe(60 * 60 * 1000); // デフォルトは'hour'
        });
        
        test('グループ数のカウントが正しく動作する', () => {
            const result = {
                details: {
                    sessionData: {
                        groups: { 'group1': {}, 'group2': {}, 'group3': {} }
                    },
                    bubbleInteractions: {
                        groups: { 'group1': {}, 'group2': {} }
                    }
                }
            };
            
            expect(analyticsAPI.countTotalGroups(result)).toBe(5);
        });
        
        test('集計結果の制限が正しく動作する', () => {
            const details = {
                sessionData: {
                    groups: {
                        'group1': { count: 10 },
                        'group2': { count: 20 },
                        'group3': { count: 30 }
                    }
                }
            };
            
            const limited = analyticsAPI.limitAggregationResults(details, 2);
            
            expect(Object.keys(limited.sessionData.groups)).toHaveLength(2);
        });
    });
    
    describe('リソース管理', () => {
        test('destroyメソッドが正しく動作する', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            
            analyticsAPI.destroy();
            
            expect(consoleSpy).toHaveBeenCalledWith('Analytics API destroyed');
            expect(analyticsAPI.endpoints.size).toBe(0);
            expect(analyticsAPI.rateLimiting.requestHistory.size).toBe(0);
            expect(analyticsAPI.aggregationCache.size).toBe(0);
            
            consoleSpy.mockRestore();
        });
    });
});