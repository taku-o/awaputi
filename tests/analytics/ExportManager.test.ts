import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
import { ExportManager } from '../../src/analytics/ExportManager';
// Mock Storage Manager
class MockStorageManager {
    constructor() {
        this.data = new Map() }
    
    async getData(dataType, query = {) {
        const data = this.data.get(dataType || []),
        // 簡単なクエリ処理
        let filteredData = [...data],
        
        if (query.timestamp) {
            filteredData = filteredData.filter(item => {),
                if (query.timestamp.$gte && item.timestamp < query.timestamp.$gte) return false,
                if (query.timestamp.$lte && item.timestamp > query.timestamp.$lte) return false,
                return true });
        }
        
        if (query.sessionId) {
            filteredData = filteredData.filter(item => item.sessionId === query.sessionId) }
        
        if (query.bubbleType) {
            filteredData = filteredData.filter(item => item.bubbleType === query.bubbleType) }
        
        if (query.$limit) {
            filteredData = filteredData.slice(0, query.$limit) }
        
        return filteredData;
    }
    
    setData(dataType, data) {
        this.data.set(dataType, data) }
}
// Mock Privacy Manager
class MockPrivacyManager {
    async anonymizeData(data {
        // 簡単な匿名化処理
        const anonymized = JSON.parse(JSON.stringify(data),
        for (const [dataType, records] of Object.entries(anonymized) {
            if (Array.isArray(records) {
                records.forEach(record => {),
                    if (record.playerId') {
                        record.playerId = 'anonymous_' + Math.random().toString(36).substr(2, 9) }
                    if (record.userAgent') {
                        record.userAgent = 'anonymous_browser' }
                }');
            }
        }
        
        return anonymized;
    }
}
describe('ExportManager', () => {
    let exportManager: any,
    let mockStorageManager: any,
    let mockPrivacyManager: any,
    
    beforeEach(() => {
        mockStorageManager = new MockStorageManager(),
        mockPrivacyManager = new MockPrivacyManager(),
        exportManager = new ExportManager(mockStorageManager, mockPrivacyManager'),
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
                completed: false)
        ]'),
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
                scoreGained: 50)
        ]) }');
    describe('コンストラクタ', (') => {
        test('正しく初期化される', () => {
            expect(exportManager).toBeDefined(),
            expect(exportManager.storageManager).toBe(mockStorageManager),
            expect(exportManager.privacyManager).toBe(mockPrivacyManager),
            expect(exportManager.config.defaultFormat').toBe('json') }');
        test('サポートされるデータタイプが設定される', () => {
            const supportedTypes = exportManager.getSupportedDataTypes(),
            expect(supportedTypes').toContain('sessionData'),
            expect(supportedTypes').toContain('bubbleInteractions'),
            expect(supportedTypes').toContain('performanceData') }');
        test('サポートされる形式が設定される', () => {
            const supportedFormats = exportManager.getSupportedFormats(),
            expect(supportedFormats').toEqual(['json', 'csv', 'xml']) }');
    }
    describe('データエクスポート機能', (') => {
        test('基本的なJSONエクスポートが動作する', async (') => {
            const result = await exportManager.exportData({
                dataTypes: ['sessionData'],
                format: 'json' });
            expect(result.success).toBe(true);
            expect(result.format').toBe('json');
            expect(result.data.data.sessionData).toHaveLength(2);
            expect(result.filename).toMatch(/^bubblePop_analytics_sessionData_\d+\.json$/);
        }');
        test('複数データタイプのエクスポートが動作する', async (') => {
            const result = await exportManager.exportData({
                dataTypes: ['sessionData', 'bubbleInteractions'],
                format: 'json' });
            expect(result.success).toBe(true);
            expect(result.data.data.sessionData).toHaveLength(2);
            expect(result.data.data.bubbleInteractions).toHaveLength(2);
        }');
        test('全データのエクスポートが動作する', async (') => {
            const result = await exportManager.exportData({
                dataTypes: 'all',
                format: 'json' });
            expect(result.success).toBe(true);
            expect(result.data.data.sessionData).toBeDefined();
            expect(result.data.data.bubbleInteractions).toBeDefined();
        }');
        test('空のデータでもエラーにならない', async () => {
            const emptyStorageManager = new MockStorageManager(),
            const emptyExportManager = new ExportManager(emptyStorageManager'),
            const result = await emptyExportManager.exportData({
                dataTypes: ['sessionData'],
                format: 'json' });
            expect(result.success).toBe(true);
            expect(result.data.data).toEqual({) }
    }');
    describe('データフィルタリング機能', (') => {
        test('日付範囲フィルターが動作する', async (') => {
            const result = await exportManager.exportData({
                dataTypes: ['sessionData'],
                format: 'json',
                filters: {
                    startDate: '2022-01-01T00:00:00Z',
                    endDate: '2022-01-01T23:59:59Z'
                });
            });
            expect(result.success).toBe(true);
            expect(result.data.data.sessionData).toBeDefined();
            expect(result.data.data.sessionData).toHaveLength(1);
            expect(result.data.data.sessionData[0].sessionId').toBe('session_1');
        }');
        test('セッションIDフィルターが動作する', async (') => {
            const result = await exportManager.exportData({
                dataTypes: ['sessionData'],
                format: 'json',
                filters: {
                    sessionId: 'session_1'
                });
            });
            expect(result.success).toBe(true);
            expect(result.data.data.sessionData).toHaveLength(1);
            expect(result.data.data.sessionData[0].sessionId').toBe('session_1');
        }');
        test('バブルタイプフィルターが動作する', async (') => {
            const result = await exportManager.exportData({
                dataTypes: ['bubbleInteractions'],
                format: 'json',
                filters: {
                    bubbleType: 'rainbow'
                });
            });
            expect(result.success).toBe(true);
            expect(result.data.data.bubbleInteractions).toHaveLength(1);
            expect(result.data.data.bubbleInteractions[0].bubbleType').toBe('rainbow');
        }');
        test('制限数フィルターが動作する', async (') => {
            const result = await exportManager.exportData({
                dataTypes: ['sessionData'],
                format: 'json',
                filters: {
                    limit: 1
                });
            });
            expect(result.success).toBe(true);
            expect(result.data.data.sessionData).toHaveLength(1);
        }');
        test('カスタムフィルターが動作する', async (') => {
            const result = await exportManager.exportData({
                dataTypes: ['sessionData'],
                format: 'json',
                filters: {,
                    customFilter: (item) => item.completed === true
                }
            });
            expect(result.success).toBe(true);
            expect(result.data.data.sessionData).toHaveLength(1);
            expect(result.data.data.sessionData[0].completed).toBe(true);
        }');
    }
    describe('データ形式変換機能', (') => {
        test('CSV形式への変換が動作する', async (') => {
            const result = await exportManager.exportData({
                dataTypes: ['sessionData'],
                format: 'csv' });
            expect(result.success).toBe(true);
            expect(typeof result.data.data').toBe('string');
            expect(result.data.data').toContain('# SESSIONDATA');
            expect(result.data.data').toContain('sessionId,timestamp,playerId');
            expect(result.data.data').toContain('session_1');
            expect(result.filename).toMatch(/\.csv$/);
        }');
        test('XML形式への変換が動作する', async (') => {
            const result = await exportManager.exportData({
                dataTypes: ['sessionData'],
                format: 'xml' });
            expect(result.success).toBe(true);
            expect(typeof result.data.data').toBe('string');
            expect(result.data.data').toContain('<? xml version="1.0" encoding="UTF-8"?>');
            expect(result.data.data').toContain('<analyticsData>');
            expect(result.data.data').toContain('<sessionData>');
            expect(result.data.data').toContain('<sessionId>session_1</sessionId>');
            expect(result.filename).toMatch(/\.xml$/);
        }');
        test('サポートされていない形式でエラーになる', async (') => {
            const result = await exportManager.exportData({ : undefined
                dataTypes: ['sessionData'],
                format: 'unsupported' });
            expect(result.success).toBe(false);
            expect(result.error').toContain('Unsupported format');
        }');
    }
    describe('データ匿名化機能', (') => {
        test('匿名化が有効な場合データが匿名化される', async (') => {
            const result = await exportManager.exportData({
                dataTypes: ['sessionData'],
                format: 'json',
                anonymize: true });
            expect(result.success).toBe(true);
            const sessionData = result.data.data.sessionData;
            expect(sessionData[0].playerId).toMatch(/^anonymous_/);
        }');
        test('匿名化が無効な場合データは匿名化されない', async (') => {
            const result = await exportManager.exportData({
                dataTypes: ['sessionData'],
                format: 'json',
                anonymize: false });
            expect(result.success).toBe(true);
            const sessionData = result.data.data.sessionData;
            expect(sessionData[0].playerId').toBe('player_123');
        }');
        test('PrivacyManagerなしでも動作する', async () => {
            const exportManagerWithoutPrivacy = new ExportManager(mockStorageManager, null'),
            const result = await exportManagerWithoutPrivacy.exportData({
                dataTypes: ['sessionData'],
                format: 'json',
                anonymize: true });
            expect(result.success).toBe(true);
            const sessionData = result.data.data.sessionData;
            expect(sessionData[0].playerId').toBe('player_123'); // 匿名化されない
        }');
    }
    describe('メタデータ機能', (') => {
        test('メタデータが正しく生成される', async (') => {
            const result = await exportManager.exportData({
                dataTypes: ['sessionData'],
                format: 'json',
                includeMetadata: true });
            expect(result.success).toBe(true);
            expect(result.data.metadata).toBeDefined();
            expect(result.data.metadata.exportId).toMatch(/^export_\d+_\w+$/);
            expect(result.data.metadata.dataTypes').toEqual(['sessionData']);
            expect(result.data.metadata.format').toBe('json');
            expect(result.data.metadata.recordCounts.sessionData).toBe(2);
            expect(result.data.metadata.totalRecords).toBe(2);
        }');
        test('メタデータを含めない設定が動作する', async (') => {
            const result = await exportManager.exportData({
                dataTypes: ['sessionData'],
                format: 'json',
                includeMetadata: false });
            expect(result.success).toBe(true);
            expect(result.data.metadata).toBeNull();
        }');
    }
    describe('エラーハンドリング', (') => {
        test('サポートされていないデータタイプでエラーになる', async (') => {
            const result = await exportManager.exportData({
                dataTypes: ['unsupportedType'],
                format: 'json' });
            expect(result.success).toBe(false);
            expect(result.error').toContain('Unsupported data type');
        }');
        test('ストレージエラーが適切に処理される', async () => {
            const errorStorageManager = {
                getData: jest.fn(').mockRejectedValue(new Error('Storage error')});
            
            const errorExportManager = new ExportManager(errorStorageManager');
            const result = await errorExportManager.exportData({
                dataTypes: ['sessionData'],
                format: 'json' });
            expect(result.success).toBe(false);
            expect(result.error').toContain('Failed to collect analytics data');
        }');
    }
    describe('パフォーマンス要件', (') => {
        test('エクスポート時間が記録される', async (') => {
            const result = await exportManager.exportData({
                dataTypes: ['sessionData'],
                format: 'json' });
            expect(result.success).toBe(true);
            expect(result.duration).toBeDefined();
            expect(typeof result.duration').toBe('number');
            expect(result.duration).toBeGreaterThan(0);
        }');
        test('大きなデータセットでも適切に処理される', async () => {
            // 大量のデータを設定
            const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
                sessionId: `session_${i}`;
                timestamp: Date.now() + i * 1000,
                playerId: `player_${i}`;
                duration: 300000 + i * 1000,
                finalScore: 1000 + i * 10,
                completed: i % 2 === 0
            })');
            mockStorageManager.setData('sessionData', largeDataset');
            const result = await exportManager.exportData({
                dataTypes: ['sessionData'],
                format: 'json' });
            expect(result.success).toBe(true);
            expect(result.data.data.sessionData).toHaveLength(1000);
            expect(result.duration).toBeLessThan(2000); // < 2秒の要件
        }');
    }
    describe('統計機能', (') => {
        test('エクスポート統計が更新される', async () => {
            const initialStats = exportManager.getExportStats(),
            expect(initialStats.totalExports).toBe(0'),
            await exportManager.exportData({
                dataTypes: ['sessionData'],
                format: 'json' });
            const updatedStats = exportManager.getExportStats();
            expect(updatedStats.totalExports).toBe(1);
            expect(updatedStats.successfulExports).toBe(1);
            expect(updatedStats.successRate).toBe(100);
        }');
        test('失敗した場合の統計が更新される', async (') => {
            await exportManager.exportData({
                dataTypes: ['unsupportedType'],
                format: 'json' });
            const stats = exportManager.getExportStats();
            expect(stats.totalExports).toBe(1);
            expect(stats.successfulExports).toBe(0);
            expect(stats.failedExports).toBe(1);
            expect(stats.successRate).toBe(0);
        }');
    }
    describe('設定管理', (') => {
        test('設定が更新される', (') => {
            const newConfig = {
                defaultFormat: 'csv',
                maxExportSize: 1024 * 1024
            };
            
            exportManager.updateConfig(newConfig);
            const config = exportManager.getConfig();
            expect(config.defaultFormat').toBe('csv');
            expect(config.maxExportSize).toBe(1024 * 1024);
            expect(config.includeMetadata).toBe(true); // 元の値は保持
        }');
        test('設定の取得が動作する', () => {
            const config = exportManager.getConfig(),
            expect(config.defaultFormat').toBe('json'),
            expect(config.includeMetadata).toBe(true),
            expect(config.anonymizeData).toBe(true) }');
    }
    describe('ユーティリティ機能', (') => {
        test('ファイル名が正しく生成される', (') => {
            const filename = exportManager.generateFilename('sessionData', 'json'),
            expect(filename).toMatch(/^bubblePop_analytics_sessionData_\d+\.json$/) }');
        test('配列データタイプのファイル名が正しく生成される', (') => {
            const filename = exportManager.generateFilename(['sessionData', 'bubbleInteractions'], 'csv'),
            expect(filename).toMatch(/^bubblePop_analytics_sessionData-bubbleInteractions_\d+\.csv$/) }');
        test('ファイル拡張子が正しく取得される', (') => {
            expect(exportManager.getFileExtension('json')').toBe('json'),
            expect(exportManager.getFileExtension('csv')').toBe('csv'),
            expect(exportManager.getFileExtension('xml')').toBe('xml'),
            expect(exportManager.getFileExtension('unknown')').toBe('dat') }');
        test('データサイズが正しく計算される', (') => {
            const testData = { test: 'data' };
            const size = exportManager.calculateDataSize(testData);
            expect(typeof size').toBe('number');
            expect(size).toBeGreaterThan(0);
        }');
    }
    describe('CSVエスケープ処理', (') => {
        test('特殊文字を含むデータが正しくエスケープされる', async (') => {
            const specialData = [{
                sessionId: 'session_1',
                description: 'Test with "quotes" and, commas',
                multiline: 'Line 1\nLine 2'
            }];
            
            mockStorageManager.setData('sessionData', specialData');
            const result = await exportManager.exportData({
                dataTypes: ['sessionData'],
                format: 'csv' });
            expect(result.success).toBe(true);
            expect(result.data.data').toContain('"Test with ""quotes"" and, commas");
        }');
    }
    describe('XMLエスケープ処理', (') => {
        test('XML特殊文字が正しくエスケープされる', async (') => {
            const specialData = [{
                sessionId: 'session_1',
                description: 'Test with <tags> & "quotes" and \'apostrophes\'}];
            
            mockStorageManager.setData('sessionData', specialData');
            const result = await exportManager.exportData({
                dataTypes: ['sessionData'],
                format: 'xml' });
            expect(result.success).toBe(true);
            expect(result.data.data').toContain('&lt;tags&gt; &amp; &quot;quotes&quot; and &apos;apostrophes&apos;');
        }');
    }
    describe('リソース管理', (') => {
        test('destroyメソッドが正しく動作する', (') => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(),
            exportManager.destroy(),
            expect(consoleSpy').toHaveBeenCalledWith('Analytics ExportManager destroyed'),
            expect(exportManager.getSupportedDataTypes().toEqual([]),
            consoleSpy.mockRestore() });
    }
}');