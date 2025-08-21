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
   , getData: jest.fn().mockResolvedValue([],
        destroy: jest.fn(),
const createMockPrivacyManager = () => ({
    anonymizeData: jest.fn().mockImplementation(data => {)
        // Handle single event object(not array),
        const result = { ...data };
        if (result.data && result.data.sessionId) {
            result.data = { ...result.data, sessionId: undefined,;
        }
        return result;
    }),
    checkConsent: jest.fn().mockReturnValue(true,
    isOptedOut: jest.fn().mockReturnValue(false,
        destroy: jest.fn( }');'
describe('Analytics Component Integration Tests', () => {
    let mockStorageManager: any,
    let mockPrivacyManager: any,
    let dataCollector: any,
    let exportManager: any,
    let analyticsAPI: any,
    
    beforeEach(() => {
        mockStorageManager = createMockStorageManager(),
        mockPrivacyManager = createMockPrivacyManager(),
        dataCollector = new DataCollector(mockPrivacyManager, mockStorageManager),
        exportManager = new ExportManager(mockStorageManager, mockPrivacyManager),
        analyticsAPI = new AnalyticsAPI(mockStorageManager, mockPrivacyManager) });
    afterEach(() => {
        if (dataCollector) dataCollector.destroy(),
        if (exportManager) exportManager.destroy(),
        if (analyticsAPI) analyticsAPI.destroy() }');'
    describe('データ収集・保存統合フロー', (') => {'
        test('DataCollector + StorageManager + PrivacyManagerの連携', async (') => {'
            // 1. テストデータの準備
            const testData = {
                type: 'player_behavior',
                sessionId: 'test-session-123',
                timestamp: Date.now(','
                action: 'bubble_click',
                bubbleType: 'normal',
                success: true,;
            
            // 2. データ収集の実行
            dataCollector.collectSessionData(testData);
            // 3. バッチ処理を手動でトリガー
            await dataCollector.processBatch();
            // 4. ストレージマネージャーが呼び出されることを確認
            expect(mockStorageManager.saveData).toHaveBeenCalled();
            // 5. 適切なデータタイプで保存されることを確認
            const saveDataCalls = mockStorageManager.saveData.mock.calls;
            expect(saveDataCalls[0][0]').toBe('sessions');'
            expect(saveDataCalls[0][1]).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        sessionId: undefined, // anonymized
                        action: testData.action,
                        bubbleType: testData.bubbleType),
                ])
            ) }');'
        test('バッチ処理での統合データフロー', async (') => {'
            // 1. セッションを開始（bubble interactionに必要）
            dataCollector.startSession({ stageId: 'test', difficulty: 'normal' });
            // 2. バッチデータの準備
            const batchData: any[] = [],
            for (let i = 0; i < 3; i++') {'
                batchData.push({
                    type: 'bubble_interaction'),
                   , timestamp: Date.now(') + i * 1000,'
                    bubbleType: i % 2 === 0 ? 'normal' : 'stone',
                    success: i % 2 === 0,
                    score: 100 + i * 50,
                    action: 'popped'
                });
            }
            
            // 3. バッチ収集の実行
            for (const data of batchData) {
                dataCollector.collectBubbleInteraction(data) }
            
            // 4. バッチ処理を手動でトリガー
            await dataCollector.processBatch();
            // 5. ストレージに保存されることを確認
            expect(mockStorageManager.saveData).toHaveBeenCalled();
            // 6. 正しいデータタイプで保存されることを確認
            const calls = mockStorageManager.saveData.mock.calls;
            expect(calls.length).toBeGreaterThan(0);
            // 7. セッションデータ（sessions）とバブルインタラクション（bubbleInteractions）が保存されることを確認
            const storeNames = calls.map(call => call[0]);
            expect(storeNames').toContain('sessions'); // startSession call'
            expect(storeNames').toContain('bubbleInteractions'); // bubble interactions'
        }');'
    }
    describe('エクスポート・API統合フロー', (') => {'
        test('ExportManager + StorageManager + PrivacyManagerの連携', async (') => {'
            // 1. ストレージからのデータ取得をモック
            const mockData = [
                {
                    sessionId: 'session-1',
                    timestamp: Date.now(','
                    score: 1200,
                    bubbleType: 'normal'
                },
                {
                    sessionId: 'session-2',
                    timestamp: Date.now(') + 1000,'
                    score: 1500,
                    bubbleType: 'stone'
                }
            ];
            mockStorageManager.getData.mockResolvedValue(mockData');'
            // 2. エクスポートの実行
            const exportResult = await exportManager.exportData({
                dataTypes: ['sessionData'],
                format: 'json',
                anonymize: true),
            // 3. エクスポートが成功することを確認
            expect(exportResult.success).toBe(true),
            expect(exportResult.data).toBeDefined(),
            // 4. ストレージマネージャーからデータが取得されることを確認
            expect(mockStorageManager.getData').toHaveBeenCalledWith('
                'sessionData',
                expect.any(Object),
            // 5. プライバシーマネージャーで匿名化されることを確認
            expect(mockPrivacyManager.anonymizeData).toHaveBeenCalledWith(mockData) }');'
        test('AnalyticsAPI + ExportManagerの統合', async (') => {'
            // 1. ストレージからのデータ取得をモック
            const mockSessionData = [
                { sessionId: 'api-test', score: 1800, timestamp: Date.now() }
            ];
            mockStorageManager.getData.mockResolvedValue(mockSessionData');'
            // 2. API経由でのデータ取得
            const apiResponse = await analyticsAPI.getData('/sessionData');
            expect(apiResponse.success).toBe(true);
            expect(apiResponse.data).toBeDefined();
            expect(mockStorageManager.getData').toHaveBeenCalledWith('
                'sessionData',
                expect.any(Object)
            ');'
            // 3. API経由でのエクスポート
            const exportResponse = await analyticsAPI.getData('/export', {
                format: 'json',
                dataTypes: 'sessionData'),
            expect(exportResponse.success).toBe(true),
            expect(exportResponse.data).toBeDefined() }');'
        test('集計データのAPI統合処理', async (') => {'
            // 1. 集計用のテストデータをモック
            const mockAggregationData = [
                { bubbleType: 'normal', score: 1000, timestamp: Date.now(') - 3600000 },'
                { bubbleType: 'normal', score: 1200, timestamp: Date.now(') - 1800000 },'
                { bubbleType: 'stone', score: 800, timestamp: Date.now(') - 3600000 },'
                { bubbleType: 'stone', score: 900, timestamp: Date.now() - 1800000 }
            ];
            mockStorageManager.getData.mockResolvedValue(mockAggregationData');'
            // 2. API経由での集計処理
            const aggregationResponse = await analyticsAPI.getData('/aggregate', {
                dataType: 'bubbleInteractions',
                groupBy: 'bubbleType',
                metrics: ['avg:score', 'count']),
            // 3. 集計結果の確認
            expect(aggregationResponse.success).toBe(true),
            expect(aggregationResponse.data.aggregatedData).toBeDefined(),
            // 4. 正しいグループ化が行われることを確認
            const aggregatedData = aggregationResponse.data.aggregatedData,
            expect(aggregatedData').toHaveProperty('normal'),'
            expect(aggregatedData').toHaveProperty('stone'),'
            expect(aggregatedData.normal').toHaveProperty('avg_score'),'
            expect(aggregatedData.normal').toHaveProperty('count') }');
    }
    describe('エラーハンドリング統合', (') => {'
        test('ストレージエラー時のカスケード処理', async (') => {'
            // 1. ストレージエラーを設定
            const storageError = new Error('Storage connection failed'),
            mockStorageManager.saveData.mockRejectedValue(storageError'),'
            // 2. データ収集時のエラーハンドリング
            const testData = {
                type: 'player_behavior',
                sessionId: 'error-test',
        timestamp: Date.now( };
            
            // 3. データを収集してバッチ処理を実行
            dataCollector.collectSessionData(testData);
            // 4. バッチ処理でエラーが発生することを確認
            await dataCollector.processBatch();
            // 5. ストレージマネージャーが呼び出されることを確認
            expect(mockStorageManager.saveData).toHaveBeenCalled();
            // 6. エラー統計が更新されることを確認
            const stats = dataCollector.getEventStats();
            expect(stats.errors).toBeGreaterThan(0);
        }');'
        test('エクスポート時のエラーハンドリング', async (') => {'
            // 1. ストレージからのデータ取得エラーを設定
            const dataError = new Error('Data retrieval failed'),
            mockStorageManager.getData.mockRejectedValue(dataError'),'
            // 2. エクスポート実行
            const exportResult = await exportManager.exportData({
                dataTypes: ['sessionData'],
                format: 'json'),
            // 3. エラーが適切に処理されることを確認
            expect(exportResult.success).toBe(false),
            expect(exportResult.error').toContain('Data retrieval failed') }');
        test('API制限エラーの統合処理', async () => {
            // 1. 大量のリクエストを送信
            const requests: any[] = [],
            for (let i = 0, i < 65, i++') { // レート制限を超える'
                requests.push(analyticsAPI.getData('/sessionData') }
            
            // 2. 結果の確認
            const results = await Promise.allSettled(requests');'
            // 3. 一部のリクエストがレート制限でエラーになることを確認
            const rateLimitedRequests = results.filter(result => 
                result.status === 'fulfilled' && 
                result.value.error && 
                result.value.error.code === 'RATE_LIMIT_EXCEEDED');
            expect(rateLimitedRequests.length).toBeGreaterThan(0);
        }');'
    }
    describe('データフロー整合性テスト', (') => {'
        test('収集からエクスポートまでの完全フロー', async (') => {'
            // 1. データ収集
            const originalData = {
                type: 'player_behavior',
                sessionId: 'flow-test-session',
                timestamp: Date.now(','
                action: 'bubble_click',
                bubbleType: 'rainbow',
                success: true,
                score: 500
            };
            
            await dataCollector.collectSessionData(originalData);
            // 2. 収集されたデータをストレージから取得できるように設定
            const storedData = [{
                sessionId: originalData.sessionId,
                timestamp: originalData.timestamp,
                action: originalData.action,
                bubbleType: originalData.bubbleType,
                success: originalData.success,
                score: originalData.score
            }];
            mockStorageManager.getData.mockResolvedValue(storedData');'
            // 3. エクスポート実行
            const exportResult = await exportManager.exportData({
                dataTypes: ['sessionData'],
                format: 'json',
                anonymize: false),
            // 4. データの整合性確認
            expect(exportResult.success).toBe(true),
            expect(exportResult.data.sessionData).toBeDefined(),
            expect(exportResult.data.sessionData[0]).toMatchObject({
                sessionId: originalData.sessionId,
                action: originalData.action,
                bubbleType: originalData.bubbleType)'),'
            // 5. API経由でも同じデータが取得できることを確認
            const apiResult = await analyticsAPI.getData('/sessionData'),
            expect(apiResult.success).toBe(true),
            expect(apiResult.data[0]).toMatchObject({
                sessionId: originalData.sessionId,
                action: originalData.action)') }'
        test('プライバシー保護の統合確認', async (') => {'
            // 1. 個人情報を含むデータの準備
            const sensitiveData = [
                {
                    sessionId: 'sensitive-session-123',
                    userId: 'user-456',
                    timestamp: Date.now(','
                    ipAddress: '192.168.1.1',
                    deviceId: 'device-789',
                    score: 1200
                }
            ];
            
            mockStorageManager.getData.mockResolvedValue(sensitiveData');'
            // 2. 匿名化ありでエクスポート
            const anonymizedExport = await exportManager.exportData({
                dataTypes: ['sessionData'],
                format: 'json',
                anonymize: true),
            // 3. プライバシー保護が適用されることを確認
            expect(mockPrivacyManager.anonymizeData).toHaveBeenCalled(),
            expect(anonymizedExport.success).toBe(true'),'
            // 4. API経由でも匿名化が適用されることを確認
            const apiResult = await analyticsAPI.getData('/sessionData', {
                anonymize: true),
            expect(apiResult.success).toBe(true),
            expect(mockPrivacyManager.anonymizeData).toHaveBeenCalled() });
    }
}');'