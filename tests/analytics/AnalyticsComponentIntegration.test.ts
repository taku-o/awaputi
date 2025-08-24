import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it  } from '@jest/globals';
/**
 * Analytics Component Integration Tests
 * 分析システムコンポーネント間の統合テスト
 * 
 * 主要なコンポーネント間の連携動作を検証します:
 * - DataCollector + StorageManager + PrivacyManager
 * - ExportManager + AnalyticsAPI
 * - エラーハンドリングの連携
 */
import { DataCollector  } from '../../src/analytics/DataCollector';
import { ExportManager  } from '../../src/analytics/ExportManager';
import { AnalyticsAPI  } from '../../src/analytics/AnalyticsAPI';

// モック設定
const createMockStorageManager = () => ({
    saveData: jest.fn().mockResolvedValue(true),
    getData: jest.fn().mockResolvedValue([]),
    destroy: jest.fn()
});

const createMockPrivacyManager = () => ({
    anonymizeData: jest.fn().mockImplementation((data: any) => {
        // Handle single event object(not array);
        const result = { ...data };
        if (result.data && result.data.sessionId) {
            result.data = { ...result.data, sessionId: undefined };
        }
        return result;
    }),
    checkConsent: jest.fn().mockReturnValue(true),
    isOptedOut: jest.fn().mockReturnValue(false),
    destroy: jest.fn()
});

describe('Analytics Component Integration Tests', () => {
    let mockStorageManager: any;
    let mockPrivacyManager: any;
    let dataCollector: any;
    let exportManager: any;
    let analyticsAPI: any;
    
    beforeEach(() => {
        mockStorageManager = createMockStorageManager();
        mockPrivacyManager = createMockPrivacyManager();
        dataCollector = new DataCollector(mockPrivacyManager, mockStorageManager);
        exportManager = new ExportManager(mockStorageManager, mockPrivacyManager);
        analyticsAPI = new AnalyticsAPI(mockStorageManager, mockPrivacyManager);
    });
    
    afterEach(() => {
        if (dataCollector) dataCollector.destroy();
        if (exportManager) exportManager.destroy();
        if (analyticsAPI) analyticsAPI.destroy();
    });
    
    describe('データ収集・保存統合フロー', () => {
        test('DataCollector + StorageManager + PrivacyManagerの連携', async () => {
            // 1. テストデータの準備
            const eventData = {
                type: 'session',
                data: {
                    sessionId: 'test_session_123',
                    timestamp: Date.now(),
                    playerId: 'player_123',
                    score: 1000,
                    duration: 300000
                }
            };
            
            // 2. データ収集と保存を実行
            await dataCollector.collectEvent(eventData);
            
            // 3. プライバシー処理の確認
            expect(mockPrivacyManager.anonymizeData).toHaveBeenCalled();
            expect(mockPrivacyManager.checkConsent).toHaveBeenCalled();
            expect(mockPrivacyManager.isOptedOut).toHaveBeenCalled();
            
            // 4. データ保存の確認
            expect(mockStorageManager.saveData).toHaveBeenCalled();
            
            // 5. 正しいデータ形式での保存確認
            const saveCall = mockStorageManager.saveData.mock.calls[0];
            expect(saveCall[0]).toBe('sessionData');
            expect(saveCall[1]).toBeDefined();
        });
        
        test('エラー時のフォールバック処理', async () => {
            // StorageManagerでエラーが発生する場合をモック
            mockStorageManager.saveData.mockRejectedValueOnce(new Error('Storage error'));
            
            const eventData = {
                type: 'error',
                data: {
                    message: 'Test error',
                    timestamp: Date.now()
                }
            };
            
            // エラーが発生してもDataCollectorが適切に処理することを確認
            await expect(dataCollector.collectEvent(eventData)).resolves.not.toThrow();
        });
        
        test('プライバシー設定に応じたデータ処理', async () => {
            // オプトアウト状態をシミュレート
            mockPrivacyManager.isOptedOut.mockReturnValueOnce(true);
            
            const eventData = {
                type: 'interaction',
                data: {
                    bubbleType: 'normal',
                    action: 'click',
                    timestamp: Date.now()
                }
            };
            
            await dataCollector.collectEvent(eventData);
            
            // オプトアウトしている場合はデータ保存が行われない
            expect(mockStorageManager.saveData).not.toHaveBeenCalled();
        });
    });
    
    describe('データエクスポート統合フロー', () => {
        test('ExportManager + StorageManager + PrivacyManagerの連携', async () => {
            // 1. エクスポート用データの準備
            const mockData = [
                {
                    sessionId: 'session_1',
                    timestamp: Date.now() - 1000000,
                    playerId: 'player_123',
                    score: 1500
                },
                {
                    sessionId: 'session_2',
                    timestamp: Date.now() - 500000,
                    playerId: 'player_456',
                    score: 2000
                }
            ];
            
            mockStorageManager.getData.mockResolvedValueOnce(mockData);
            
            // 2. データエクスポートを実行
            const exportResult = await exportManager.exportData('sessionData', {
                format: 'json',
                includeAnonymization: true,
                dateRange: {
                    start: Date.now() - 2000000,
                    end: Date.now()
                }
            });
            
            // 3. StorageManagerからのデータ取得確認
            expect(mockStorageManager.getData).toHaveBeenCalledWith('sessionData', {
                startDate: expect.any(Number),
                endDate: expect.any(Number)
            });
            
            // 4. プライバシー処理の実行確認
            expect(mockPrivacyManager.anonymizeData).toHaveBeenCalled();
            
            // 5. エクスポート結果の検証
            expect(exportResult.success).toBe(true);
            expect(exportResult.data).toBeDefined();
        });
        
        test('エクスポート時のエラーハンドリング', async () => {
            // StorageManagerでエラーが発生する場合
            mockStorageManager.getData.mockRejectedValueOnce(new Error('Data retrieval error'));
            
            const exportResult = await exportManager.exportData('sessionData', { format: 'csv' });
            
            // エラーが適切に処理され、失敗結果が返される
            expect(exportResult.success).toBe(false);
            expect(exportResult.error).toBeDefined();
            expect(exportResult.error.message).toContain('Data retrieval error');
        });
        
        test('大量データのエクスポート処理', async () => {
            // 大量データをモック（1000件）
            const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
                sessionId: `session_${i}`,
                timestamp: Date.now() - (i * 1000),
                playerId: `player_${i}`,
                score: 1000 + i * 10
            }));
            
            mockStorageManager.getData.mockResolvedValueOnce(largeDataset);
            
            const exportResult = await exportManager.exportData('sessionData', {
                format: 'csv',
                limit: 500 // 制限を設定
            });
            
            expect(exportResult.success).toBe(true);
            // プライバシー処理が適切に実行される
            expect(mockPrivacyManager.anonymizeData).toHaveBeenCalledTimes(1);
        });
    });
    
    describe('AnalyticsAPI統合フロー', () => {
        test('AnalyticsAPI + StorageManager + PrivacyManagerの連携', async () => {
            // 1. テストデータの準備
            const testData = [
                {
                    sessionId: 'api_test_session',
                    timestamp: Date.now(),
                    playerId: 'api_player',
                    duration: 600000,
                    completed: true
                }
            ];
            
            mockStorageManager.getData.mockResolvedValueOnce(testData);
            
            // 2. APIを通じたデータ取得
            const apiResult = await analyticsAPI.getData('/sessions', {
                sessionId: 'api_test_session'
            });
            
            // 3. StorageManagerの呼び出し確認
            expect(mockStorageManager.getData).toHaveBeenCalledWith('sessionData', {
                sessionId: 'api_test_session'
            });
            
            // 4. プライバシー処理の実行確認
            expect(mockPrivacyManager.anonymizeData).toHaveBeenCalled();
            
            // 5. API結果の検証
            expect(apiResult.success).toBe(true);
            expect(apiResult.data).toBeDefined();
            expect(apiResult.metadata).toBeDefined();
            expect(apiResult.metadata.anonymized).toBe(true);
        });
        
        test('複数コンポーネント間での集約データ処理', async () => {
            // 1. 複数種類のデータを準備
            mockStorageManager.getData
                .mockResolvedValueOnce([
                    { sessionId: 'session_1', score: 1000, duration: 300000 },
                    { sessionId: 'session_2', score: 1500, duration: 450000 }
                ])
                .mockResolvedValueOnce([
                    { sessionId: 'session_1', bubbleType: 'normal', scoreGained: 10 },
                    { sessionId: 'session_1', bubbleType: 'special', scoreGained: 50 }
                ]);
            
            // 2. 集約データの取得
            const aggregationRules = {
                dataType: 'sessionData',
                groupBy: ['sessionId'],
                aggregateBy: {
                    'score': ['sum', 'avg'],
                    'duration': ['avg']
                }
            };
            
            const aggregatedResult = await analyticsAPI.getAggregatedData(aggregationRules);
            
            // 3. 複数のStorageManager呼び出しの確認
            expect(mockStorageManager.getData).toHaveBeenCalled();
            
            // 4. プライバシー処理の実行確認
            expect(mockPrivacyManager.anonymizeData).toHaveBeenCalled();
            
            // 5. 集約結果の検証
            expect(aggregatedResult.success).toBe(true);
            expect(aggregatedResult.data).toBeDefined();
        });
        
        test('API + ExportManagerの統合', async () => {
            // 1. APIを通じてエクスポート要求
            const exportRequest = {
                dataTypes: ['sessionData'],
                format: 'json',
                filters: {
                    startDate: Date.now() - 86400000, // 24時間前
                    endDate: Date.now()
                }
            };
            
            mockStorageManager.getData.mockResolvedValueOnce([
                { sessionId: 'export_session', timestamp: Date.now(), score: 2000 }
            ]);
            
            const exportResult = await analyticsAPI.getData('/export', exportRequest);
            
            // 2. StorageManagerの呼び出し確認
            expect(mockStorageManager.getData).toHaveBeenCalled();
            
            // 3. プライバシー処理の実行確認
            expect(mockPrivacyManager.anonymizeData).toHaveBeenCalled();
            
            // 4. エクスポート結果の検証
            expect(exportResult.success).toBe(true);
            expect(exportResult.data).toBeDefined();
        });
    });
    
    describe('エラーハンドリング統合', () => {
        test('複数コンポーネント間のエラー伝播', async () => {
            // StorageManagerでエラーが発生
            mockStorageManager.getData.mockRejectedValueOnce(new Error('Database connection lost'));
            
            // DataCollectorでのエラー処理
            const eventData = {
                type: 'error',
                data: { message: 'Test error event' }
            };
            
            await expect(dataCollector.collectEvent(eventData)).resolves.not.toThrow();
            
            // AnalyticsAPIでのエラー処理
            const apiResult = await analyticsAPI.getData('/sessions');
            expect(apiResult.success).toBe(false);
            expect(apiResult.error).toBeDefined();
            
            // ExportManagerでのエラー処理
            const exportResult = await exportManager.exportData('sessionData', { format: 'json' });
            expect(exportResult.success).toBe(false);
            expect(exportResult.error).toBeDefined();
        });
        
        test('プライバシーエラーの処理', async () => {
            // PrivacyManagerでエラーが発生
            mockPrivacyManager.anonymizeData.mockRejectedValueOnce(new Error('Anonymization failed'));
            
            // DataCollectorでの処理確認
            const eventData = {
                type: 'session',
                data: { sessionId: 'privacy_error_test' }
            };
            
            await expect(dataCollector.collectEvent(eventData)).resolves.not.toThrow();
            
            // AnalyticsAPIでの処理確認
            mockStorageManager.getData.mockResolvedValueOnce([{ sessionId: 'test' }]);
            const apiResult = await analyticsAPI.getData('/sessions');
            
            // プライバシーエラーが発生してもAPIは動作する
            expect(apiResult).toBeDefined();
        });
    });
    
    describe('パフォーマンス統合テスト', () => {
        test('大量データ処理時の各コンポーネント連携', async () => {
            // 大量データセット（10,000件）
            const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
                sessionId: `perf_session_${i}`,
                timestamp: Date.now() - (i * 100),
                playerId: `perf_player_${i}`,
                score: 1000 + (i % 1000),
                duration: 300000 + (i * 100)
            }));
            
            mockStorageManager.getData.mockResolvedValueOnce(largeDataset);
            
            // パフォーマンス測定開始
            const startTime = Date.now();
            
            // API経由での大量データ取得
            const apiResult = await analyticsAPI.getData('/sessions', { limit: 5000 });
            
            // パフォーマンス測定終了
            const endTime = Date.now();
            const executionTime = endTime - startTime;
            
            // 結果の検証
            expect(apiResult.success).toBe(true);
            expect(apiResult.data).toBeDefined();
            
            // プライバシー処理が実行される
            expect(mockPrivacyManager.anonymizeData).toHaveBeenCalled();
            
            // 合理的な実行時間（5秒以内）
            expect(executionTime).toBeLessThan(5000);
        });
        
        test('並行処理時のコンポーネント連携', async () => {
            // 複数のデータ収集を並行実行
            const eventPromises = Array.from({ length: 50 }, (_, i) => 
                dataCollector.collectEvent({
                    type: 'concurrent_event',
                    data: { eventId: i, timestamp: Date.now() + i }
                })
            );
            
            // 並行実行とその完了確認
            await Promise.all(eventPromises);
            
            // すべてのイベントが適切に処理される
            expect(mockPrivacyManager.checkConsent).toHaveBeenCalledTimes(50);
            expect(mockPrivacyManager.isOptedOut).toHaveBeenCalledTimes(50);
        });
    });
});