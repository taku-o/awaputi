import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it  } from '@jest/globals';
import { ComparisonEngine  } from '../../../src/analytics/ComparisonEngine';
import { ComparisonEngine as CoreComparisonEngine  } from '../../../src/core/ComparisonEngine';

// モックStorageManager - 高度機能テスト用
class MockStorageManager {
    data: Map<string, any[]>;
    
    constructor() {
        this.data = new Map();
    }

    async getData(storeName: string, query?: any) {
        const storeData = this.data.get(storeName) || [];
        if (!query) return storeData;

        if (query.range && query.index === 'startTime') {
            return storeData.filter((item: any) => {
                const timestamp = item.startTime;
                return timestamp >= query.range.lower && timestamp <= query.range.upper;
            });
        }

        return storeData;
    }

    setTestData(storeName: string, data: any[]) {
        this.data.set(storeName, data);
    }
}

describe('ComparisonEngine - Advanced Features Tests', () => {
    let comparisonEngine: any;
    let mockStorageManager: any;

    beforeEach(() => {
        mockStorageManager = new MockStorageManager();
        comparisonEngine = new ComparisonEngine(mockStorageManager);
    });

    describe('過去データとの比較', () => {
        beforeEach(() => {
            // 現在のデータ（直近1週間）
            const currentSessions = [
                {
                    sessionId: 'current1',
                    startTime: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2日前
                    endTime: Date.now() - 2 * 24 * 60 * 60 * 1000 + 300000,
                    finalScore: 1200,
                    bubblesPopped: 90,
                    bubblesMissed: 10,
                    maxCombo: 20,
                    completed: true
                }
            ];

            // 過去のデータ（1週間前の1週間）
            const pastSessions = [
                {
                    sessionId: 'past1',
                    startTime: Date.now() - 14 * 24 * 60 * 60 * 1000, // 2週間前
                    endTime: Date.now() - 14 * 24 * 60 * 60 * 1000 + 300000,
                    finalScore: 1000,
                    bubblesPopped: 80,
                    bubblesMissed: 20,
                    maxCombo: 15,
                    completed: true
                }
            ];

            mockStorageManager.setTestData('sessions', [...currentSessions, ...pastSessions]);
        });

        test('過去データとの比較が実行される', async () => {
            const result = await comparisonEngine.compareWithPastData({
                periods: ['week'],
                metrics: ['score', 'accuracy']
            });

            expect(result.success).toBe(true);
            expect(result.comparisons.week.available).toBe(true);
            expect(result.summary).toHaveProperty('overall');
        });

        test('データ不足時の適切な処理', async () => {
            mockStorageManager.setTestData('sessions', []); // 空のデータ

            const result = await comparisonEngine.compareWithPastData();
            expect(result.success).toBe(false);
            expect(result.error).toBe('Current performance data is insufficient');
        });
    });

    describe('エラーハンドリング', () => {
        test('ストレージエラーが適切に処理される', async () => {
            mockStorageManager.getData = jest.fn().mockRejectedValue(new Error('Database error'));

            const result = await comparisonEngine.compareWithPastData();
            expect(result.success).toBe(false);
            expect(result.error).toBe('Database error');
        });
    });
});

// Task 8.3とTask 8.4で実装した機能のテスト
describe('CoreComparisonEngine (Task 8.3 & 8.4)', () => {
    let coreComparisonEngine: any;

    beforeEach(() => {
        coreComparisonEngine = new CoreComparisonEngine();
    });

    describe('Task 8.3: ステージ別比較機能', () => {
        test('ステージ別比較が実行される', () => {
            const stageData = {
                stage1: [
                    { score: 1000, accuracy: 0.9, playTime: 300 },
                    { score: 1100, accuracy: 0.85, playTime: 320 }
                ],
                stage2: [
                    { score: 1200, accuracy: 0.95, playTime: 280 },
                    { score: 1300, accuracy: 0.92, playTime: 290 }
                ]
            };

            const result = coreComparisonEngine.compareByStage(stageData);
            expect(result.success).toBe(true);
            expect(result.comparisons).toHaveProperty('stage1');
            expect(result.comparisons).toHaveProperty('stage2');
            expect(result.analysis.bestStage).toBeDefined();
            expect(result.analysis.worstStage).toBeDefined();
        });

        test('単一ステージデータの処理', () => {
            const stageData = {
                stage1: [
                    { score: 1000, accuracy: 0.9, playTime: 300 }
                ]
            };

            const result = coreComparisonEngine.compareByStage(stageData);
            expect(result.success).toBe(true);
            expect(result.warning).toContain('insufficient data');
        });

        test('空データの処理', () => {
            const result = coreComparisonEngine.compareByStage({});
            expect(result.success).toBe(false);
            expect(result.error).toBe('No stage data provided');
        });
    });

    describe('Task 8.4: 改善提案生成機能', () => {
        test('改善提案が生成される', () => {
            const performanceData = {
                current: { score: 800, accuracy: 0.75, playTime: 400 },
                benchmark: { score: 1200, accuracy: 0.9, playTime: 300 },
                trend: { score: -50, accuracy: -0.05, playTime: 20 }
            };

            const suggestions = coreComparisonEngine.generateImprovementSuggestions(performanceData);
            expect(suggestions.length).toBeGreaterThan(0);
            expect(suggestions[0]).toHaveProperty('category');
            expect(suggestions[0]).toHaveProperty('priority');
            expect(suggestions[0]).toHaveProperty('suggestion');
            expect(suggestions[0]).toHaveProperty('expectedImprovement');
        });

        test('優秀な成績での提案', () => {
            const excellentData = {
                current: { score: 1500, accuracy: 0.95, playTime: 200 },
                benchmark: { score: 1200, accuracy: 0.9, playTime: 300 },
                trend: { score: 50, accuracy: 0.02, playTime: -10 }
            };

            const suggestions = coreComparisonEngine.generateImprovementSuggestions(excellentData);
            expect(suggestions.some((s: any) => s.category === 'maintenance')).toBe(true);
        });

        test('提案の優先度分類', () => {
            const problemData = {
                current: { score: 500, accuracy: 0.6, playTime: 500 },
                benchmark: { score: 1200, accuracy: 0.9, playTime: 300 },
                trend: { score: -100, accuracy: -0.1, playTime: 50 }
            };

            const suggestions = coreComparisonEngine.generateImprovementSuggestions(problemData);
            const highPriority = suggestions.filter((s: any) => s.priority === 'high');
            const mediumPriority = suggestions.filter((s: any) => s.priority === 'medium');
            
            expect(highPriority.length).toBeGreaterThan(0);
            expect(highPriority.length + mediumPriority.length).toBe(suggestions.length);
        });
    });
});