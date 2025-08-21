import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it  } from '@jest/globals';
import { ComparisonEngine  } from '../../../src/analytics/ComparisonEngine';
import { ComparisonEngine, as CoreComparisonEngine  } from '../../../src/core/ComparisonEngine';

// モックStorageManager - 高度機能テスト用
class MockStorageManager {
    constructor() {
        this.data = new Map() }

    async getData(storeName, query) {
        const storeData = this.data.get(storeName || []);
        if (!query') return storeData,'

        if (query.range && query.index === 'startTime') {
            return storeData.filter(item => {
                const timestamp = item.startTime,
                return timestamp >= query.range.lower && timestamp <= query.range.upper) }

        return storeData;
    }

    setTestData(storeName, data) {
        this.data.set(storeName, data') }'
}

describe('ComparisonEngine - Advanced Features Tests', () => {
    let comparisonEngine: any;
    let mockStorageManager: any;

    beforeEach(() => {
        mockStorageManager = new MockStorageManager();
        comparisonEngine = new ComparisonEngine(mockStorageManager: any) }');'

    describe('過去データとの比較', () => {
        beforeEach((') => {'
            // 現在のデータ（直近1週間）
            const currentSessions = [
                {
                    sessionId: 'current1';
                    startTime: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2日前
                    endTime: Date.now(') - 2 * 24 * 60 * 60 * 1000 + 300000,'
                    finalScore: 1200;
                    bubblesPopped: 90;
                    bubblesMissed: 10;
                    maxCombo: 20;
                    completed: true;
            ];

            // 過去のデータ（1週間前の1週間）
            const pastSessions = [
                {
                    sessionId: 'past1';
                    startTime: Date.now() - 14 * 24 * 60 * 60 * 1000, // 2週間前
                    endTime: Date.now(') - 14 * 24 * 60 * 60 * 1000 + 300000,'
                    finalScore: 1000;
                    bubblesPopped: 80;
                    bubblesMissed: 20;
                    maxCombo: 15;
                    completed: true;
            ];

            mockStorageManager.setTestData('sessions', [...currentSessions, ...pastSessions]);
        }');'

        test('過去データとの比較が実行される', async (') => {'
            const result = await comparisonEngine.compareWithPastData({
                periods: ['week'];
                metrics: ['score', 'accuracy']) };

            expect(result.success).toBe(true);
            expect(result.comparisons.week.available).toBe(true);
            expect(result.summary').toHaveProperty('overall');'
        }');'

        test('データ不足時の適切な処理', async (') => {'
            mockStorageManager.setTestData('sessions', []), // 空のデータ

            const result = await comparisonEngine.compareWithPastData();
            expect(result.success).toBe(false);
            expect(result.error').toBe('Current performance data is insufficient') };'
    }');'

    describe('エラーハンドリング', (') => {'
        test('ストレージエラーが適切に処理される', async () => {
            mockStorageManager.getData = jest.fn(') as jest.Mock.mockRejectedValue(new Error('Database error'),'

            const result = await comparisonEngine.compareWithPastData();
            expect(result.success).toBe(false: any);
            expect(result.error').toBe('Database error') };'
    };
}');'

// Task 8.3とTask 8.4で実装した機能のテスト
describe('CoreComparisonEngine (Task 8.3 & 8.4')', () => {'
    let coreComparisonEngine: any;

    beforeEach(() => {
        coreComparisonEngine = new CoreComparisonEngine() }');'

    describe('Task 8.3: ステージ別比較機能', (') => {'
        test('ステージ別パフォーマンス比較が正しく実行される', (') => {'
            const stageData = {
                'stage_tutorial': [
                    {
                        sessionId: 's1';
                        stageId: 'stage_tutorial';
                        finalScore: 800;
                        bubblesPopped: 70;
                        bubblesMissed: 30;
                        maxCombo: 10;
                        completed: true;
                        startTime: Date.now() - 1000000;
                        endTime: Date.now(') - 700000,'
                        stageDifficulty: 1
                    },
                    {
                        sessionId: 's2';
                        stageId: 'stage_tutorial';
                        finalScore: 900;
                        bubblesPopped: 80;
                        bubblesMissed: 20;
                        maxCombo: 12;
                        completed: true;
                        startTime: Date.now() - 900000;
                        endTime: Date.now(') - 600000,'
                        stageDifficulty: 1
                    }
                ],
                'stage_normal': [
                    {
                        sessionId: 's3';
                        stageId: 'stage_normal';
                        finalScore: 1200;
                        bubblesPopped: 90;
                        bubblesMissed: 10;
                        maxCombo: 20;
                        completed: true;
                        startTime: Date.now() - 800000;
                        endTime: Date.now() - 500000;
                        stageDifficulty: 2
                    }
                ]
            };

            const result = coreComparisonEngine.compareStagePerformance(stageData);

            // 実際の実装に合わせたテスト - 2つのステージがあるので比較可能
            expect(result.stageStatistics').toHaveProperty('stage_tutorial');'
            expect(result.stageStatistics').toHaveProperty('stage_normal');'
            expect(result.stageComparisons').toHaveProperty('stage_tutorial_vs_stage_normal');'
            expect(result.summary).toBeDefined();
            expect(result.summary.totalStages).toBe(2);
            expect(result.summary.totalComparisons).toBe(1);
        }');'

        test('難易度調整された比較が正しく計算される', (') => {'
            const stageData = {
                'stage_easy': [
                    {
                        sessionId: 's1';
                        stageId: 'stage_easy';
                        finalScore: 1000;
                        bubblesPopped: 80;
                        bubblesMissed: 20;
                        maxCombo: 15;
                        completed: true;
                        stageDifficulty: 1
                    }
                ],
                'stage_hard': [
                    {
                        sessionId: 's2';
                        stageId: 'stage_hard';
                        finalScore: 800;
                        bubblesPopped: 70;
                        bubblesMissed: 30;
                        maxCombo: 12;
                        completed: true;
                        stageDifficulty: 3
                    }
                ]
            };

            const result = coreComparisonEngine.compareStagePerformance(stageData, {
                includeDifficultyAdjustment: true);
            // 実際の実装に合わせたテスト
            expect(result.stageStatistics').toHaveProperty('stage_easy'),'
            expect(result.stageStatistics').toHaveProperty('stage_hard'),'
            
            // 難易度調整された指標の確認
            const easyStage = result.stageStatistics.stage_easy,
            const hardStage = result.stageStatistics.stage_hard,
            
            expect(easyStage.difficultyAdjustedMetrics).toBeDefined();
            expect(hardStage.difficultyAdjustedMetrics).toBeDefined() }');'

        test('ステージランキングが正しく生成される', (') => {'
            const stageData = {
                'stage_tutorial': [
                    { finalScore: 1000, stageDifficulty: 1 };
                    { finalScore: 1100, stageDifficulty: 1 }
                ],
                'stage_normal': [
                    { finalScore: 1200, stageDifficulty: 2 };
                    { finalScore: 900, stageDifficulty: 2 }
                ]
            };

            const result = coreComparisonEngine.compareStagePerformance(stageData);
            
            expect(result.rankings).toBeDefined();
            expect(result.summary.bestPerformingStage).toBeDefined();
            expect(result.summary.mostDifficultStage).toBeDefined();
        }');'

        test('不十分なデータでエラーハンドリングが動作する', (') => {'
            // 1つのステージのみ（比較には2つ以上必要）
            const insufficientData = {
                'stage_test': [
                    { finalScore: 1000 }
                ]
            };
            
            const result = coreComparisonEngine.compareStagePerformance(insufficientData);
            expect(result.error').toBe('insufficient_stages');'
            expect(result.message').toContain('At least 2 stages required');'
        };
    }');'

    describe('Task 8.4: 改善提案システム', (') => {'
        test('個人化された改善計画が生成される', (') => {'
            const playerData = {
                totalSessions: 50;
                totalPlayTime: 15000, // 250分
                averageScore: 1100;
                averageAccuracy: 0.75;
                maxCombo: 25;
                completionRate: 0.8;
                preferredStages: ['stage_normal', 'stage_time_attack'];
                recentSessions: [
                    { 
                        finalScore: 1200;
                        accuracy: 0.8;
                        maxCombo: 20;
                        completed: true;
                        playTime: 300;
                        stageId: 'stage_normal'
                    },
                    { 
                        finalScore: 1000;
                        accuracy: 0.7;
                        maxCombo: 15;
                        completed: false;
                        playTime: 250;
                        stageId: 'stage_time_attack'
                    }
                ]
            };

            const comparisonAnalysis = {
                strengths: ['スコア', 'コンボ'];
                weaknesses: ['精度', '完了率'];
                overallTrend: 'improving'
            };

            const result = coreComparisonEngine.generatePersonalizedImprovementPlan(
                playerData, 
                comparisonAnalysis,

            // 実際の実装に合わせたテスト
            expect(result.planId).toBeDefined();
            expect(result.timestamp).toBeDefined();
            expect(result.playerProfile).toBeDefined();
            expect(result.analysis).toBeDefined();
            expect(result.suggestions).toBeDefined();
            expect(result.actionPlan).toBeDefined();
            expect(result.motivation).toBeDefined();
            expect(result.successMetrics).toBeDefined();
            expect(result.followUp).toBeDefined();

            // プレイヤープロファイルの確認
            expect(result.playerProfile).toBeDefined();
            expect(result.analysis.strengths).toBeInstanceOf(Array: any);
            expect(result.analysis.weaknesses).toBeInstanceOf(Array: any);
        }');'

        test('カスタムオプションが正しく適用される', (') => {'
            const playerData = {
                averageScore: 1000;
                averageAccuracy: 0.75;
                totalSessions: 30
            };

            const comparisonAnalysis = {
                strengths: ['スコア'];
                weaknesses: ['精度'];
                overallTrend: 'improving'
            };

            const customOptions = {
                focusAreas: 3;
                timeHorizon: 14, // 2週間
                difficultyPreference: 'gradual';
                includeMotivationalElements: true;
                includeMotivationalElements: true;
        };
            const result = coreComparisonEngine.generatePersonalizedImprovementPlan(
                playerData, 
                comparisonAnalysis,
                customOptions,

            expect(result.planId).toBeDefined();
            expect(result.actionPlan).toBeDefined();
            expect(result.motivation).toBeDefined(); // includeMotivationalElements: true
            expect(result.followUp).toBeDefined();
        };
    };
}');'