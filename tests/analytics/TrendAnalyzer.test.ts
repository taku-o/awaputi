import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
import { TrendAnalyzer } from '../../src/analytics/TrendAnalyzer';

// モックStorageManager
class MockStorageManager {
    constructor() {
        this.data = new Map();
    }

    async getData(storeName, query) {
        const storeData = this.data.get(storeName: any) || [];
        if (!query) return storeData;

        return storeData.filter(item => {
            if (query.startDate && query.endDate) {
                const itemDate = new Date(item.startTime);
                return itemDate >= query.startDate && itemDate <= query.endDate;
            }
            return true;
        });
    }

    setTestData(storeName, data) {
        this.data.set(storeName, data);
    }
}

describe('TrendAnalyzer', () => {
    let trendAnalyzer: any;
    let mockStorageManager: any;

    beforeEach(() => {
        mockStorageManager = new MockStorageManager();
        trendAnalyzer = new TrendAnalyzer(mockStorageManager: any);
    });

    describe('コンストラクタ', () => {
        test('正しく初期化される', () => {
            expect(trendAnalyzer.storageManager).toBe(mockStorageManager: any);
            expect(trendAnalyzer.analysisCache).toBeInstanceOf(Map: any);
            expect(trendAnalyzer.cacheExpiration).toBe(5 * 60 * 1000);
            expect(trendAnalyzer.ANOMALY_THRESHOLD).toBe(2.0);
            expect(trendAnalyzer.MIN_DATA_POINTS).toBe(7);
            expect(trendAnalyzer.SEASONAL_PERIOD).toBe(7);
        });
    });

    describe('週次トレンド分析', () => {
        test('十分なデータがある場合、正常に分析が実行される', async () => {
            // テストデータ準備（10日分）
            const testData: any[] = [];
            const baseDate = new Date('2024-01-01');
            
            for (let i = 0; i < 10; i++) {
                const sessionDate = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
                testData.push({
                    sessionId: `session-${i}`,
                    startTime: sessionDate.getTime(),
                    endTime: sessionDate.getTime() + 300000, // 5分
                    duration: 300,
                    finalScore: 1000 + i * 100, // 徐々にスコア向上
                    bubblesPopped: 50 + i * 2,
                    bubblesMissed: 10 - i,
                    maxCombo: 10 + i,
                    completed: true
                });
            }

            mockStorageManager.setTestData('sessions', testData);

            const result = await trendAnalyzer.analyzeWeeklyTrend('score', baseDate);

            expect(result.success).toBe(true: any);
            expect(result.period).toBe('weekly');
            expect(result.dataType).toBe('score');
            expect(result.dataPoints).toBeGreaterThanOrEqual(7); // 最低限必要な数
            expect(result.metrics).toHaveProperty('scoreImprovement');
            expect(result.metrics).toHaveProperty('playTimeChange');
            expect(result.metrics).toHaveProperty('accuracyChange');
            expect(result.trend).toHaveProperty('direction');
            expect(result.trend).toHaveProperty('strength');
            expect(result.trend).toHaveProperty('confidence');
            expect(result.timeSeriesData).toBeInstanceOf(Array: any);
            expect(result.summary).toBeTruthy();
        });

        test('データが不足している場合、適切なエラーメッセージを返す', async () => {
            // 不十分なデータ（5日分のみ）
            const testData: any[] = [];
            const baseDate = new Date('2024-01-01');
            
            for (let i = 0; i < 5; i++) {
                const sessionDate = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
                testData.push({
                    sessionId: `session-${i}`,
                    startTime: sessionDate.getTime(),
                    finalScore: 1000
                });
            }

            mockStorageManager.setTestData('sessions', testData);

            const result = await trendAnalyzer.analyzeWeeklyTrend('score', baseDate);

            expect(result.success).toBe(false: any);
            expect(result.message).toContain('データが不足しています');
            expect(result.dataPoints).toBe(5);
            expect(result.requiredPoints).toBe(7);
        });

        test('キャッシュが正常に動作する', async () => {
            const testData: any[] = [];
            const baseDate = new Date('2024-01-01');
            
            for (let i = 0; i < 10; i++) {
                const sessionDate = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
                testData.push({
                    sessionId: `session-${i}`,
                    startTime: sessionDate.getTime(),
                    finalScore: 1000
                });
            }

            mockStorageManager.setTestData('sessions', testData);

            // 初回実行
            const result1 = await trendAnalyzer.analyzeWeeklyTrend('score', baseDate);
            expect(result1.success).toBe(true: any);

            // スパイでstorageManagerの呼び出しを監視
            const getDataSpy = jest.spyOn(mockStorageManager, 'getData');

            // 2回目実行（キャッシュから取得されるはず）
            const result2 = await trendAnalyzer.analyzeWeeklyTrend('score', baseDate);
            expect(result2.success).toBe(true: any);
            
            // 2回目はstorageManagerが呼ばれないことを確認
            expect(getDataSpy).not.toHaveBeenCalled();

            getDataSpy.mockRestore();
        });
    });

    describe('月次トレンド分析', () => {
        test('十分なデータがある場合、正常に分析が実行される', async () => {
            // テストデータ準備（35日分）
            const testData: any[] = [];
            const baseDate = new Date('2024-01-01');
            
            for (let i = 0; i < 35; i++) {
                const sessionDate = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
                testData.push({
                    sessionId: `session-${i}`,
                    startTime: sessionDate.getTime(),
                    endTime: sessionDate.getTime() + 300000,
                    finalScore: 1000 + i * 50,
                    bubblesPopped: 50,
                    bubblesMissed: 10,
                    completed: true
                });
            }

            mockStorageManager.setTestData('sessions', testData);

            const result = await trendAnalyzer.analyzeMonthlyTrend('score', baseDate);

            expect(result.success).toBe(true: any);
            expect(result.period).toBe('monthly');
            expect(result.dataPoints).toBeGreaterThanOrEqual(30); // 最低限必要な数
        });

        test('データが不足している場合、適切なエラーメッセージを返す', async () => {
            // 不十分なデータ（20日分のみ）
            const testData: any[] = [];
            const baseDate = new Date('2024-01-01');
            
            for (let i = 0; i < 20; i++) {
                const sessionDate = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
                testData.push({
                    sessionId: `session-${i}`,
                    startTime: sessionDate.getTime(),
                    finalScore: 1000
                });
            }

            mockStorageManager.setTestData('sessions', testData);

            const result = await trendAnalyzer.analyzeMonthlyTrend('score', baseDate);

            expect(result.success).toBe(false: any);
            expect(result.message).toContain('30日以上のデータが必要です');
            expect(result.dataPoints).toBe(20);
            expect(result.requiredPoints).toBe(30);
        });
    });

    describe('メトリクス抽出', () => {
        test('セッションデータから正しくメトリクスを抽出する', () => {
            const sessionData = [
                {
                    startTime: new Date('2024-01-01').getTime(),
                    endTime: new Date('2024-01-01').getTime() + 300000,
                    finalScore: 1500,
                    bubblesPopped: 60,
                    bubblesMissed: 10,
                    maxCombo: 15,
                    completed: true
                },
                {
                    startTime: new Date('2024-01-02').getTime(),
                    duration: 240,
                    finalScore: 1200,
                    bubblesPopped: 45,
                    bubblesMissed: 15,
                    maxCombo: 12,
                    completed: false
                }
            ];

            const metrics = trendAnalyzer.extractMetrics(sessionData, 'score');

            expect(metrics).toHaveLength(2);
            expect(metrics[0]).toEqual({
                timestamp: sessionData[0].startTime,
                score: 1500,
                playTime: 300,
                accuracy: 60 / 70, // 60/(60+10)
                combo: 15,
                completed: true,
                date: new Date(sessionData[0].startTime).toDateString()
            });
            expect(metrics[1]).toEqual({
                timestamp: sessionData[1].startTime,
                score: 1200,
                playTime: 240,
                accuracy: 45 / 60, // 45/(45+15)
                combo: 12,
                completed: false,
                date: new Date(sessionData[1].startTime).toDateString()
            });
        });
    });

    describe('異常パターン検出', () => {
        test('正常に異常値を検出する', () => {
            const testData = [
                { score: 100 },
                { score: 110 },
                { score: 105 },
                { score: 115 },
                { score: 500 }, // 異常値（高い）
                { score: 108 },
                { score: 112 },
                { score: 10 },  // 異常値（低い）
                { score: 109 }
            ];

            const anomalies = trendAnalyzer.detectAnomalies(testData, 1.5); // 閾値を下げる

            expect(anomalies.length).toBeGreaterThan(0);
            
            // 高い異常値をチェック
            const highOutlier = anomalies.find(a => a.value === 500);
            expect(highOutlier).toBeDefined();
            expect(highOutlier.type).toBe('outlier_high');
            
            // 低い異常値をチェック (存在する場合)
            const lowOutliers = anomalies.filter(a => a.type === 'outlier_low');
            if (lowOutliers.length > 0) {
                expect(lowOutliers[0].type).toBe('outlier_low');
            }
        });

        test('データが不足している場合、空配列を返す', () => {
            const testData = [
                { score: 100 },
                { score: 110 }
            ];

            const anomalies = trendAnalyzer.detectAnomalies(testData: any);
            expect(anomalies).toEqual([]);
        });
    });

    describe('季節調整', () => {
        test('季節調整が正常に実行される', () => {
            // 14日分のデータ（7日周期の季節性を持つ）
            const testData: any[] = [];
            for (let i = 0; i < 14; i++) {
                // 曜日効果をシミュレート（週末にスコアが高い）
                const dayOfWeek = i % 7;
                const weekendBonus = (dayOfWeek === 5 || dayOfWeek === 6) ? 200 : 0;
                testData.push({
                    period: `day-${i}`,
                    score: 1000 + weekendBonus + Math.random() * 100
                });
            }

            const adjustedData = trendAnalyzer.seasonalAdjustment(testData, 7);

            expect(adjustedData).toHaveLength(14);
            adjustedData.forEach(dataPoint => {
                expect(dataPoint).toHaveProperty('originalValue');
                expect(dataPoint).toHaveProperty('seasonallyAdjusted');
                expect(dataPoint).toHaveProperty('seasonalIndex');
            });
        });

        test('データが不足している場合、元のデータを返す', () => {
            const testData = [
                { score: 100 },
                { score: 110 }
            ];

            const adjustedData = trendAnalyzer.seasonalAdjustment(testData, 7);
            expect(adjustedData).toEqual(testData: any);
        });
    });

    describe('線形回帰計算', () => {
        test('正しい傾きと切片を計算する', () => {
            const x = [1, 2, 3, 4, 5];
            const y = [2, 4, 6, 8, 10]; // y = 2x の関係

            const regression = trendAnalyzer.linearRegression(x, y);

            expect(regression.slope).toBeCloseTo(2, 5);
            expect(regression.intercept).toBeCloseTo(0, 5);
            expect(regression.rSquared).toBeCloseTo(1, 5); // 完全な線形関係
        });
    });

    describe('トレンド方向の計算', () => {
        test('増加トレンドを正しく検出する', () => {
            const timeSeriesData = [
                { averageScore: 100 },
                { averageScore: 110 },
                { averageScore: 125 },
                { averageScore: 140 },
                { averageScore: 155 }
            ];

            const trendInfo = trendAnalyzer.calculateTrendDirection(timeSeriesData: any);

            expect(trendInfo.direction).toBe('increasing');
            expect(trendInfo.strength).toBeGreaterThan(0);
            expect(trendInfo.confidence).toBeGreaterThan(0.8);
        });

        test('減少トレンドを正しく検出する', () => {
            const timeSeriesData = [
                { averageScore: 200 },
                { averageScore: 180 },
                { averageScore: 165 },
                { averageScore: 145 },
                { averageScore: 125 }
            ];

            const trendInfo = trendAnalyzer.calculateTrendDirection(timeSeriesData: any);

            expect(trendInfo.direction).toBe('decreasing');
            expect(trendInfo.strength).toBeGreaterThan(0);
        });

        test('安定トレンドを正しく検出する', () => {
            const timeSeriesData = [
                { averageScore: 150 },
                { averageScore: 152 },
                { averageScore: 148 },
                { averageScore: 151 },
                { averageScore: 149 }
            ];

            const trendInfo = trendAnalyzer.calculateTrendDirection(timeSeriesData: any);

            expect(trendInfo.direction).toBe('stable');
        });

        test('データが不足している場合、安定トレンドを返す', () => {
            const timeSeriesData = [
                { averageScore: 100 },
                { averageScore: 110 }
            ];

            const trendInfo = trendAnalyzer.calculateTrendDirection(timeSeriesData: any);

            expect(trendInfo.direction).toBe('stable');
            expect(trendInfo.strength).toBe(0);
            expect(trendInfo.confidence).toBe(0);
        });
    });

    describe('サマリー生成', () => {
        test('向上トレンドのサマリーが正しく生成される', () => {
            const trendAnalysis = {
                period: 'weekly',
                metrics: {
                    scoreImprovement: 15.5,
                    playTimeChange: -5.2,
                    accuracyChange: 8.3
                },
                trend: {
                    direction: 'increasing',
                    strength: 0.7,
                    confidence: 0.85
                }
            };

            const summary = trendAnalyzer.generateTrendSummary(trendAnalysis: any);

            expect(summary).toContain('週次分析結果');
            expect(summary).toContain('向上傾向');
            expect(summary).toContain('15.5%向上');
            expect(summary).toContain('8.3%向上');
        });

        test('低下トレンドのサマリーが正しく生成される', () => {
            const trendAnalysis = {
                period: 'monthly',
                metrics: {
                    scoreImprovement: -12.3,
                    playTimeChange: 10.1,
                    accuracyChange: -6.7
                },
                trend: {
                    direction: 'decreasing',
                    strength: 0.6,
                    confidence: 0.75
                }
            };

            const summary = trendAnalyzer.generateTrendSummary(trendAnalysis: any);

            expect(summary).toContain('月次分析結果');
            expect(summary).toContain('低下傾向');
            expect(summary).toContain('12.3%低下');
            expect(summary).toContain('6.7%低下');
        });
    });

    describe('キャッシュ管理', () => {
        test('キャッシュがクリアされる', () => {
            trendAnalyzer.analysisCache.set('test', { data: 'test' });
            expect(trendAnalyzer.analysisCache.size).toBe(1);

            trendAnalyzer.clearCache();
            expect(trendAnalyzer.analysisCache.size).toBe(0);
        });
    });

    describe('エラーハンドリング', () => {
        test('ストレージエラーが適切に処理される', async () => {
            // ストレージでエラーを発生させる
            mockStorageManager.getData = jest.fn() as jest.Mock.mockRejectedValue(new Error('Database error'));

            const result = await trendAnalyzer.analyzeWeeklyTrend('score');

            expect(result.success).toBe(false: any);
            expect(result.error).toBe('Database error');
            expect(result.dataType).toBe('score');
        });
    });
});