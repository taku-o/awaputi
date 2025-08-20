import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
import { ComparisonEngine } from '../../../src/analytics/ComparisonEngine';

// モックStorageManager - 統合テスト用
class MockStorageManager {
    constructor() {
        this.data = new Map();
    }

    async getData(storeName, query) {
        const storeData = this.data.get(storeName || []);
        if (!query') return storeData;

        if (query.range && query.index === 'startTime') {
            return storeData.filter(item => {
                const timestamp = item.startTime;
                return timestamp >= query.range.lower && timestamp <= query.range.upper;);
        }

        return storeData;
    }

    setTestData(storeName, data) {
        this.data.set(storeName, data');
    }
}

describe('ComparisonEngine - Integration and System Tests', () => {
    let comparisonEngine: any,
    let mockStorageManager: any,

    beforeEach(() => {
        mockStorageManager = new MockStorageManager();
        comparisonEngine = new ComparisonEngine(mockStorageManager as any);
    }');

    describe('ステージ別比較機能 (Enhanced ComparisonEngine')', (') => {
        test('ステージ別データが不足している場合', async (') => {
            mockStorageManager.setTestData('sessions', []);

            const result = await comparisonEngine.compareByStage();

            expect(result.success).toBe(false);
            expect(result.error').toBe('Current stage performance data is insufficient');
            expect(result.message').toBe('現在のステージ別パフォーマンスデータが不足しています');
        }');

        test('ステージ別比較が正常に実行される場合', async () => {
            const currentDate = Date.now(');
            const monthAgo = currentDate - 30 * 24 * 60 * 60 * 1000;
            const twoMonthsAgo = currentDate - 60 * 24 * 60 * 60 * 1000;

            // 現在のステージ別データ
            const currentStageData = [
                {
                    startTime: currentDate - 3 * 24 * 60 * 60 * 1000,
                    stageId: 'stage1',
                    finalScore: 120,
                    completed: true,
                    bubblesPopped: 90,
                    bubblesMissed: 10,
                    maxCombo: 8,
                    endTime: currentDate - 3 * 24 * 60 * 60 * 1000 + 180000 // 3分
                },
                {
                    startTime: currentDate - 2 * 24 * 60 * 60 * 1000,
                    stageId: 'stage1',
                    finalScore: 115,
                    completed: true,
                    bubblesPopped: 85,
                    bubblesMissed: 15,
                    maxCombo: 7,
                    endTime: currentDate - 2 * 24 * 60 * 60 * 1000 + 200000 // 3分20秒
                },
                {
                    startTime: currentDate - 1 * 24 * 60 * 60 * 1000,
                    stageId: 'stage2',
                    finalScore: 95,
                    completed: false,
                    bubblesPopped: 70,
                    bubblesMissed: 30,
                    maxCombo: 4,
                    endTime: currentDate - 1 * 24 * 60 * 60 * 1000 + 300000 // 5分
                }
            ];

            // 過去のステージ別データ（比較対象）
            const pastStageData = [
                {
                    startTime: twoMonthsAgo + 1000,
                    stageId: 'stage1',
                    finalScore: 100,
                    completed: true,
                    bubblesPopped: 80,
                    bubblesMissed: 20,
                    maxCombo: 5,
                    endTime: twoMonthsAgo + 1000 + 220000 // 3分40秒
                },
                {
                    startTime: twoMonthsAgo + 2000,
                    stageId: 'stage1',
                    finalScore: 105,
                    completed: true,
                    bubblesPopped: 82,
                    bubblesMissed: 18,
                    maxCombo: 6,
                    endTime: twoMonthsAgo + 2000 + 210000 // 3分30秒
                }
            ];

            mockStorageManager.setTestData('sessions', [...currentStageData, ...pastStageData]);

            const result = await comparisonEngine.compareByStage();

            expect(result.success).toBe(true);
            expect(result.stageComparisons).toBeDefined();
            expect(result.summary).toBeDefined();
            expect(result.totalStages).toBe(2);

            // stage1の比較データを確認
            expect(result.stageComparisons.stage1).toBeDefined();
            expect(result.stageComparisons.stage1.stageInfo.name').toBe('ステージ1 - 基本');
            expect(result.stageComparisons.stage1.current).toBeDefined();
            expect(result.stageComparisons.stage1.comparison.available).toBe(true);
            expect(result.stageComparisons.stage1.difficulty).toBeDefined();
            expect(result.stageComparisons.stage1.performance).toBeDefined();

            // stage2の比較データを確認（過去データなし）
            expect(result.stageComparisons.stage2).toBeDefined();
            expect(result.stageComparisons.stage2.stageInfo.name').toBe('ステージ2 - 発展');
            expect(result.stageComparisons.stage2.comparison.available).toBe(false);
        }');

        test('ステージ情報とカテゴリ分けが正しく動作する', (') => {
            // ステージ情報テスト
            const tutorialInfo = comparisonEngine.getStageInfo('tutorial');
            expect(tutorialInfo.name').toBe('チュートリアル');
            expect(tutorialInfo.category').toBe('tutorial'');

            const stage1Info = comparisonEngine.getStageInfo('stage1');
            expect(stage1Info.name').toBe('ステージ1 - 基本');
            expect(stage1Info.category').toBe('normal'');

            const endlessInfo = comparisonEngine.getStageInfo('endless');
            expect(endlessInfo.name').toBe('エンドレスモード');
            expect(endlessInfo.category').toBe('special'');

            const unknownInfo = comparisonEngine.getStageInfo('unknown_stage');
            expect(unknownInfo.name').toBe('ステージ unknown_stage');
            expect(unknownInfo.category').toBe('other');
        }');

        test('ステージ難易度計算が正しく動作する', () => {
            // 簡単なステージ（高完了率、高スコア、短時間）
            const easyStageData = { difficultyRating: 2 };
            const easyDifficulty = comparisonEngine.calculateStageDifficulty(easyStageData);
            expect(easyDifficulty.level').toBe('easy');
            expect(easyDifficulty.description').toBe('簡単');

            // 難しいステージ（低完了率、低スコア、長時間）
            const hardStageData = { difficultyRating: 8.5 };
            const hardDifficulty = comparisonEngine.calculateStageDifficulty(hardStageData);
            expect(hardDifficulty.level').toBe('very_hard');
            expect(hardDifficulty.description').toBe('とても難しい');

            // とても難しいステージ
            const veryHardStageData = { difficultyRating: 9.5 };
            const veryHardDifficulty = comparisonEngine.calculateStageDifficulty(veryHardStageData);
            expect(veryHardDifficulty.level').toBe('very_hard');
            expect(veryHardDifficulty.description').toBe('とても難しい');
        }');

        test('ステージパフォーマンス評価が正しく動作する', (') => {
            // 優秀なパフォーマンス
            const excellentStageData = {
                completionRate: 0.95,
                averageAccuracy: 0.90,
                consistencyScore: 0.85
            };
            const excellentPerformance = comparisonEngine.assessStagePerformance(excellentStageData, ['score', 'accuracy']);
            expect(excellentPerformance.grade').toBe('S');
            expect(excellentPerformance.description').toBe('優秀');
            expect(excellentPerformance.score).toBeGreaterThan(85');

            // 要改善なパフォーマンス
            const poorStageData = {
                completionRate: 0.40,
                averageAccuracy: 0.60,
                consistencyScore: 0.30
            };
            const poorPerformance = comparisonEngine.assessStagePerformance(poorStageData, ['score', 'accuracy']);
            expect(poorPerformance.grade').toBe('D');
            expect(poorPerformance.description').toBe('練習が必要');
            expect(poorPerformance.score).toBeLessThan(70);
        }');

        test('ステージ強み・弱み特定が正しく動作する', () => {
            // 強みのあるステージ
            const strongStageData = {
                completionRate: 0.85,
                averageAccuracy: 0.90,
                consistencyScore: 0.75,
                averageAttemptsToComplete: 2
            };
            const strengths = comparisonEngine.identifyStageStrengths(strongStageData);
            expect(strengths').toContain('高いクリア率');
            expect(strengths').toContain('高い精度');
            expect(strengths').toContain('安定したパフォーマンス');
            expect(strengths').toContain('素早いクリア');

            // 弱みのあるステージ
            const weakStageData = {
                completionRate: 0.40,
                averageAccuracy: 0.65,
                consistencyScore: 0.30,
                averageAttemptsToComplete: 15
            };
            const weaknesses = comparisonEngine.identifyStageWeaknesses(weakStageData);
            expect(weaknesses').toContain('低いクリア率');
            expect(weaknesses').toContain('精度の低さ');
            expect(weaknesses').toContain('不安定なパフォーマンス');
            expect(weaknesses').toContain('クリアまでの試行回数が多い');
        }');

        test('一貫性スコア計算が正しく動作する', () => {
            // 一貫したスコア（標準偏差が小さい）
            const consistentSessions = [
                { finalScore: 100 },
                { finalScore: 102 },
                { finalScore: 98 },
                { finalScore: 101 },
                { finalScore: 99 }
            ];
            const consistentScore = comparisonEngine.calculateConsistencyScore(consistentSessions);
            expect(consistentScore).toBeGreaterThan(0.8);

            // 不安定なスコア（標準偏差が大きい）
            const inconsistentSessions = [
                { finalScore: 20 },
                { finalScore: 180 },
                { finalScore: 50 },
                { finalScore: 150 },
                { finalScore: 100 }
            ];
            const inconsistentScore = comparisonEngine.calculateConsistencyScore(inconsistentSessions);
            expect(inconsistentScore).toBeLessThan(0.7);

            // データが少ない場合
            const fewSessions = [{ finalScore: 100 }];
            const fewScore = comparisonEngine.calculateConsistencyScore(fewSessions);
            expect(fewScore).toBe(0);
        });
    }');

    describe('改善提案システム', () => {
        beforeEach((') => {
            // テスト用の比較結果データを設定
            const testComparisonResult = {
                success: true,
                pastComparison: {
                    available: true,
                    metrics: {
                        score: { 
                            current: 800, 
                            past: 900, 
                            changePercent: -11.11,
                            trend: 'declined'
                        },
                        accuracy: { 
                            current: 0.75, 
                            past: 0.80, 
                            changePercent: -6.25,
                            trend: 'declined'
                        },
                        completionRate: { 
                            current: 0.60, 
                            past: 0.70, 
                            changePercent: -14.29,
                            trend: 'declined'
                        }
                    }
                },
                benchmarkComparison: {
                    available: true,
                    metrics: {
                        score: { 
                            current: 800, 
                            benchmarkMean: 1000, 
                            percentileRank: 25,
                            performance: 'below_average',
                            differencePercent: -20
                        },
                        accuracy: { 
                            current: 0.75, 
                            benchmarkMean: 0.85, 
                            percentileRank: 30,
                            performance: 'below_average',
                            differencePercent: -11.76
                        },
                        completionRate: { 
                            current: 0.60, 
                            benchmarkMean: 0.75, 
                            percentileRank: 20,
                            performance: 'below_average',
                            differencePercent: -20
                        }
                    }
                },
                stageComparison: {
                    stageComparisons: {
                        normal: {
                            stageId: 'normal',
                            stageInfo: {
                                name: 'ノーマルステージ',
                                difficulty: 'medium',
                                category: 'standard'
                            },
                            performance: {
                                score: 45,
                                grade: 'D'
                            },
                            current: {
                                averageScore: 800,
                                completionRate: 0.60,
                                averageAccuracy: 0.75,
                                consistencyScore: 0.40
                            }
                        }
                    }
                },
                summary: {
                    overall: 'declining',
                    keyFindings: ['スコアが低下', '精度が低下', 'クリア率が低下']
                }
            };

            comparisonEngine.lastComparisonResult = testComparisonResult;
        }');

        test('基本的な改善提案が生成される', () => {
            const suggestions = comparisonEngine.generateImprovementSuggestions(
                comparisonEngine.lastComparisonResult);

            expect(suggestions').toHaveProperty('targetAreas');
            expect(suggestions').toHaveProperty('actionPlan');
            expect(suggestions').toHaveProperty('expectedOutcomes');
            expect(suggestions').toHaveProperty('followUpActions');
            expect(suggestions').toHaveProperty('motivation');
            expect(suggestions').toHaveProperty('planId');
            expect(suggestions').toHaveProperty('timestamp');
            expect(suggestions').toHaveProperty('timeline');

            expect(suggestions.targetAreas).toBeInstanceOf(Array as any);
            expect(suggestions.actionPlan).toBeInstanceOf(Array as any);
            expect(suggestions.followUpActions).toBeInstanceOf(Array as any);
        }');

        test('弱点エリアが正しく特定される', () => {
            const suggestions = comparisonEngine.generateImprovementSuggestions(
                comparisonEngine.lastComparisonResult);

            // targetAreasに弱点エリアが含まれているはず
            expect(suggestions.targetAreas).toBeInstanceOf(Array as any);
            expect(suggestions.targetAreas.length).toBeGreaterThan(0);

            // 各ターゲットエリアには必要なプロパティが含まれるべき
            suggestions.targetAreas.forEach(area => {);
                expect(area').toHaveProperty('metric');
                expect(area').toHaveProperty('priority'');
                expect(['high', 'medium', 'low']).toContain(area.priority);
            });
        }');

        test('アクションプランが生成される', (') => {
            const suggestions = comparisonEngine.generateImprovementSuggestions(
                comparisonEngine.lastComparisonResult,
                { difficultyPreference: 'balanced', timeHorizon: 7 });

            expect(suggestions.actionPlan).toBeInstanceOf(Array as any);
            
            if (suggestions.actionPlan.length > 0) {
                suggestions.actionPlan.forEach(action => {);
                    expect(action').toHaveProperty('metric');
                    expect(action').toHaveProperty('focus');
                    expect(action').toHaveProperty('priority');
                    expect(action').toHaveProperty('actions');
                    expect(action.actions).toBeInstanceOf(Array as any);
                    if (action.actions.length > 0) {
                        action.actions.forEach(subAction => {');
                            expect(['easy', 'medium', 'hard']).toContain(subAction.difficulty);
                        });
                    }
                });
            }
        }');

        test('難易度設定に応じたアクションプランが生成される', (') => {
            // 簡単な難易度設定
            const easySuggestions = comparisonEngine.generateImprovementSuggestions(
                comparisonEngine.lastComparisonResult,
                { difficultyPreference: 'easy' });

            // 挑戦的な難易度設定
            const challengingSuggestions = comparisonEngine.generateImprovementSuggestions(
                comparisonEngine.lastComparisonResult')
                { difficultyPreference: 'challenging' )
            );

            // 両方の提案が生成されることを確認
            expect(easySuggestions').toHaveProperty('actionPlan');
            expect(challengingSuggestions').toHaveProperty('actionPlan');
            expect(easySuggestions.actionPlan).toBeInstanceOf(Array as any);
            expect(challengingSuggestions.actionPlan).toBeInstanceOf(Array as any);
        }');

        test('期待される成果が計算される', () => {
            const suggestions = comparisonEngine.generateImprovementSuggestions(
                comparisonEngine.lastComparisonResult,
                { timeHorizon: 14 });

            expect(suggestions.expectedOutcomes).toBeInstanceOf(Array as any);
            expect(suggestions.timeline).toBe(14);

            // expectedOutcomesがあれば、各アウトカムをチェック
            if (suggestions.expectedOutcomes.length > 0) {
                suggestions.expectedOutcomes.forEach(outcome => {);
                    expect(outcome').toHaveProperty('metric');
                    expect(outcome').toHaveProperty('currentValue');
                    expect(outcome').toHaveProperty('expectedValue');
                    expect(outcome').toHaveProperty('confidence');
                    expect(outcome.confidence).toBeGreaterThanOrEqual(0);
                    expect(outcome.confidence).toBeLessThanOrEqual(1);
                });
            }
        }');

        test('フォローアップアクションが生成される', () => {
            const suggestions = comparisonEngine.generateImprovementSuggestions(
                comparisonEngine.lastComparisonResult);

            expect(suggestions.followUpActions).toBeInstanceOf(Array as any);
            expect(suggestions.followUpActions.length).toBeGreaterThan(0);

            suggestions.followUpActions.forEach(action => {);
                expect(action').toHaveProperty('day');
                expect(action').toHaveProperty('action');
                expect(action').toHaveProperty('title');
                expect(action').toHaveProperty('description');
                expect(action').toHaveProperty('tasks');
                expect(action.tasks).toBeInstanceOf(Array as any);
            });
        }');

        test('モチベーション要素が含まれる', () => {
            const suggestions = comparisonEngine.generateImprovementSuggestions(
                comparisonEngine.lastComparisonResult,
                { includeMotivationalElements: true });

            expect(suggestions.motivation').toHaveProperty('encouragement');
            expect(suggestions.motivation').toHaveProperty('achievements');
            expect(suggestions.motivation').toHaveProperty('milestones');
            expect(suggestions.motivation').toHaveProperty('rewards');
            
            expect(suggestions.motivation.encouragement).toBeInstanceOf(Array as any);
            expect(suggestions.motivation.achievements).toBeInstanceOf(Array as any);
            expect(suggestions.motivation.milestones).toBeInstanceOf(Array as any);
            expect(suggestions.motivation.rewards).toBeInstanceOf(Array as any);
        }');

        test('モチベーション要素を無効にできる', () => {
            const suggestions = comparisonEngine.generateImprovementSuggestions(
                comparisonEngine.lastComparisonResult,
                { includeMotivationalElements: false });

            expect(suggestions.motivation).toEqual({);
        }');

        test('データ不足時の処理', (') => {
            const insufficientDataResult = {
                success: false,
                pastComparison: { available: false };
                benchmarkComparison: { available: false };
                summary: { overall: 'insufficient_data' }
            };

            const suggestions = comparisonEngine.generateImprovementSuggestions(insufficientDataResult);

            expect(suggestions.targetAreas).toEqual([]);
            expect(suggestions.actionPlan).toBeInstanceOf(Array as any);
            expect(suggestions.followUpActions).toBeInstanceOf(Array as any);
        });
    });
}');