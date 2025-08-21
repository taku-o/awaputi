import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it  } from '@jest/globals';
/**
 * GameBalanceCollector のテスト
 */
import { GameBalanceCollector  } from '../../src/analytics/GameBalanceCollector';
// モッククラス
class MockDataCollector {
    constructor(') {
        this.collectedData = [] }
    
    collectGameBalanceData(data {
        this.collectedData.push({
            type: 'gameBalance'),
           , timestamp: Date.now(
            data: data
        });
    }
    
    getCollectedData() {
        return this.collectedData }
    
    clearData(') {
        this.collectedData = [] }
}
describe('GameBalanceCollector', () => {
    let collector: any,
    let mockDataCollector: any,
    
    beforeEach(() => {
        mockDataCollector = new MockDataCollector(),
        collector = new GameBalanceCollector(mockDataCollector) }');
    describe('初期化', (') => {
        test('初期状態が正しく設定される', () => {
            expect(collector.bubbleSpawnData.totalSpawned).toBe(0),
            expect(collector.bubbleSpawnData.typeDistribution).toEqual({});
            expect(collector.scoreDistribution.bubbleScores).toEqual({});
            expect(collector.itemEffectiveness.usageFrequency).toEqual({});
            expect(collector.difficultyAnalysis.stageCompletionRates).toEqual({}');
        }
        test('警告閾値が設定される', () => {
            expect(collector.warningThresholds.scoreDistributionVariance).toBe(0.3),
            expect(collector.warningThresholds.completionRateDropoff).toBe(0.5),
            expect(collector.warningThresholds.itemUsageImbalance).toBe(0.8),
            expect(collector.warningThresholds.difficultySpike).toBe(2.0) }');
    }
    describe('バブル生成データ収集', (') => {
        test('バブル出現データが正常に収集される', (') => {
            const bubbleInfo = {
                type: 'normal',
                position: { x: 100, y: 200 },
                difficulty: 'medium',
                stageProgress: 0.3,
                surroundingBubbles: ['stone', 'normal'],
                expectedLifetime: 5000,
                scoreValue: 10,
                currentScore: 150,
                remainingTime: 240000,
                playerHP: 80,
                activeItems: ['timeExtender']
            };
            
            collector.collectBubbleSpawn(bubbleInfo);
            // 内部統計の確認
            expect(collector.bubbleSpawnData.totalSpawned).toBe(1);
            expect(collector.bubbleSpawnData.typeDistribution.normal).toBe(1);
            expect(collector.bubbleSpawnData.spawnTimings).toHaveLength(1);
            expect(collector.bubbleSpawnData.difficultyProgression).toHaveLength(1);
            // DataCollectorへの送信確認
            const collectedData = mockDataCollector.getCollectedData();
            expect(collectedData).toHaveLength(1);
            expect(collectedData[0].data.type').toBe('bubbleSpawn');
            expect(collectedData[0].data.bubbleType').toBe('normal');
            expect(collectedData[0].data.position).toEqual({ x: 100, y: 200 )' }
        test('複数のバブル出現データが統計に反映される', (') => {
            const bubbleTypes = ['normal', 'stone', 'normal', 'rainbow', 'normal'],
            
            bubbleTypes.forEach((type, index) => {
                collector.collectBubbleSpawn({
                    type: type,
                    position: { x: index * 50, y: index * 50 },
                    stageProgress: index * 0.2 });
            }
            expect(collector.bubbleSpawnData.totalSpawned).toBe(5);
            expect(collector.bubbleSpawnData.typeDistribution.normal).toBe(3);
            expect(collector.bubbleSpawnData.typeDistribution.stone).toBe(1);
            expect(collector.bubbleSpawnData.typeDistribution.rainbow).toBe(1);
            expect(collector.bubbleSpawnData.spawnTimings).toHaveLength(5);
        }');
    }
    describe('スコアデータ収集', (') => {
        test('スコア獲得データが正常に収集される', (') => {
            const scoreInfo = {
                type: 'bubble',
                amount: 25,
                multiplier: 1.5,
                baseScore: 15,
                source: 'stone',
                reactionTime: 400,
                comboCount: 3,
                timeInStage: 45000,
                difficulty: 'hard',
                stageProgress: 0.6,
                totalScore: 500,
                playerSkillLevel: 'intermediate'
            };
            
            collector.collectScoreData(scoreInfo);
            // 内部統計の確認
            expect(collector.scoreDistribution.bubbleScores.stone).toEqual([25]);
            expect(collector.scoreDistribution.totalScoreProgression).toHaveLength(1);
            // DataCollectorへの送信確認
            const collectedData = mockDataCollector.getCollectedData();
            expect(collectedData).toHaveLength(1);
            expect(collectedData[0].data.type').toBe('scoreAnalysis');
            expect(collectedData[0].data.amount).toBe(25);
            expect(collectedData[0].data.multiplier).toBe(1.5);
        }');
        test('コンボスコアが正常に記録される', (') => {
            const comboScoreInfo = {
                type: 'combo',
                amount: 50,
                multiplier: 2.0,
                source: 'combo_bonus',
                comboCount: 5,
                timeInStage: 30000,
                totalScore: 300
            };
            
            collector.collectScoreData(comboScoreInfo);
            expect(collector.scoreDistribution.comboScores).toHaveLength(1);
            expect(collector.scoreDistribution.comboScores[0].amount).toBe(50);
            expect(collector.scoreDistribution.comboScores[0].comboCount).toBe(5);
            expect(collector.scoreDistribution.comboScores[0].multiplier).toBe(2.0);
        }');
        test('ボーナススコアが正常に記録される', (') => {
            const bonusScoreInfo = {
                type: 'bonus',
                amount: 100,
                source: 'time_bonus',
                timeInStage: 60000,
                totalScore: 800
            };
            
            collector.collectScoreData(bonusScoreInfo);
            expect(collector.scoreDistribution.bonusScores).toHaveLength(1);
            expect(collector.scoreDistribution.bonusScores[0].amount).toBe(100);
            expect(collector.scoreDistribution.bonusScores[0].source').toBe('time_bonus');
        }');
        test('異常スコア検出が動作する', (') => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation('),
            // 異常に高いスコア
            const abnormalScoreInfo = {
                type: 'bubble',
                amount: 1000, // 通常のnormalバブルは10点
                source: 'normal',
                totalScore: 1000
            };
            
            collector.collectScoreData(abnormalScoreInfo);
            // 警告が生成されることを確認
            const collectedData = mockDataCollector.getCollectedData(');
            const warningData = collectedData.find(d => d.data.type === 'balanceWarning');
            expect(warningData).toBeDefined();
            expect(warningData.data.warningType').toBe('score_anomaly');
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        }');
    }
    describe('アイテム効果データ収集', (') => {
        test('アイテム効果データが正常に収集される', (') => {
            const itemInfo = {
                itemType: 'timeExtender',
                action: 'activate',
                duration: 30000,
                cost: 50,
                scoreBoost: 1.5,
                timeExtension: 15000,
                accuracyImprovement: 0.1,
                customEffects: { slowMotion: true },
                activationTiming: 120000,
                stageProgress: 0.4,
                playerSituation: 'desperate',
                scoreIncrease: 75,
                survivalTime: 45000,
                bubblesPopped: 12,
                stageCompleted: true
            };
            
            collector.collectItemEffectData(itemInfo);
            // 内部統計の確認
            expect(collector.itemEffectiveness.usageFrequency.timeExtender).toBe(1);
            expect(collector.itemEffectiveness.timingAnalysis.timeExtender).toHaveLength(1);
            // DataCollectorへの送信確認
            const collectedData = mockDataCollector.getCollectedData();
            expect(collectedData).toHaveLength(1);
            expect(collectedData[0].data.type').toBe('itemEffect');
            expect(collectedData[0].data.itemType').toBe('timeExtender');
            expect(collectedData[0].data.effectiveness.scoreBoost).toBe(1.5);
        }');
        test('アイテム効果時間が記録される', (') => {
            const expireInfo = {
                itemType: 'scoreBooster',
                action: 'expire',
                duration: 25000,
                cost: 75
            };
            
            collector.collectItemEffectData(expireInfo);
            expect(collector.itemEffectiveness.effectDuration.scoreBooster).toEqual([25000]);
        }');
        test('アイテムスコア影響が記録される', (') => {
            const effectInfo = {
                itemType: 'multiplier',
                action: 'activate',
                scoreIncrease: 200
            };
            
            collector.collectItemEffectData(effectInfo);
            expect(collector.itemEffectiveness.scoreImpact.multiplier).toEqual([200]);
        }');
    }
    describe('ステージ難易度データ収集', (') => {
        test('ステージ完了データが正常に収集される', (') => {
            const stageInfo = {
                stageId: 'normal',
                difficulty: 'medium',
                playTime: 240000,
                completed: true,
                finalScore: 1200,
                totalSpawned: 80,
                popped: 70,
                missed: 8,
                expired: 2,
                accuracy: 0.875,
                averageReactionTime: 450,
                maxCombo: 12,
                itemsUsed: 2,
                exitReason: 'completed',
                timeRemaining: 15000,
                hpRemaining: 60,
                progressPercent: 100
            };
            
            collector.collectStageDifficultyData(stageInfo);
            // 内部統計の確認
            const completionStats = collector.difficultyAnalysis.stageCompletionRates.normal;
            expect(completionStats.total).toBe(1);
            expect(completionStats.completed).toBe(1);
            expect(collector.difficultyAnalysis.averagePlayTimes.normal).toEqual([240000]);
            // DataCollectorへの送信確認
            const collectedData = mockDataCollector.getCollectedData();
            expect(collectedData).toHaveLength(1);
            expect(collectedData[0].data.type').toBe('stageDifficulty');
            expect(collectedData[0].data.stageId').toBe('normal');
            expect(collectedData[0].data.completed).toBe(true);
        }');
        test('ステージ失敗データが正常に記録される', (') => {
            const failedStageInfo = {
                stageId: 'hard',
                difficulty: 'hard',
                playTime: 180000,
                completed: false,
                finalScore: 800,
                exitReason: 'game_over',
                timeRemaining: 0,
                hpRemaining: 0,
                progressPercent: 75,
                accuracy: 0.65,
                averageReactionTime: 600,
                maxCombo: 5
            };
            
            collector.collectStageDifficultyData(failedStageInfo);
            // 失敗ポイントが記録されることを確認
            const failurePoints = collector.difficultyAnalysis.failurePoints.hard;
            expect(failurePoints).toHaveLength(1);
            expect(failurePoints[0].progressPercent).toBe(75);
            expect(failurePoints[0].reason').toBe('game_over');
        }');
        test('難易度バランス警告が生成される', (') => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(),
            // 低い完了率のステージデータを複数送信
            for (let i = 0, i < 10, i++') {
                collector.collectStageDifficultyData({
                    stageId: 'expert',
                    completed: i < 3, // 30%の完了率
                    playTime: 300000 });
            }
            
            // 警告が生成されることを確認
            const collectedData = mockDataCollector.getCollectedData(');
            const warningData = collectedData.find(d => d.data.type === 'balanceWarning');
            expect(warningData).toBeDefined();
            expect(warningData.data.warningType').toBe('difficulty_spike');
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        }');
    }
    describe('期待値計算', (') => {
        test('期待スコアが正常に計算される', (') => {
            expect(collector.getExpectedScore('normal', 'bubble').toBe(10'),
            expect(collector.getExpectedScore('stone', 'bubble').toBe(20'),
            expect(collector.getExpectedScore('boss', 'bubble').toBe(200'),
            expect(collector.getExpectedScore('unknown', 'bubble').toBe(10) }');
        test('ステージ完了率が正常に計算される', (') => {
            // テストデータを設定
            collector.difficultyAnalysis.stageCompletionRates.test = {
                total: 10,
                completed: 7
            };
            
            expect(collector.getStageCompletionRate('test').toBe(0.7');
            expect(collector.getStageCompletionRate('nonexistent').toBe(1.0);
        }');
        test('平均プレイ時間が正常に計算される', (') => {
            collector.difficultyAnalysis.averagePlayTimes.test = [100000, 200000, 300000],
            
            expect(collector.getAveragePlayTime('test').toBe(200000'),
            expect(collector.getAveragePlayTime('nonexistent').toBe(0) }');
        test('期待プレイ時間が正常に取得される', (') => {
            expect(collector.getExpectedPlayTime('tutorial').toBe(60000'),
            expect(collector.getExpectedPlayTime('normal').toBe(300000'),
            expect(collector.getExpectedPlayTime('unknown').toBe(300000) }');
    }
    describe('バランス分析レポート', () => {
        beforeEach(() => {
            // テストデータを設定
            collector.bubbleSpawnData.totalSpawned = 100,
            collector.bubbleSpawnData.typeDistribution = {
                normal: 60,
                stone: 25,
                rainbow: 15
            };
            
            collector.scoreDistribution.bubbleScores = {
                normal: [10, 10, 12, 8, 11],
                stone: [20, 22, 18, 21, 19]
            };
            
            collector.itemEffectiveness.usageFrequency = {
                timeExtender: 5,
                scoreBooster: 3,
                multiplier: 2
            };
            
            collector.difficultyAnalysis.stageCompletionRates = {
                easy: { total: 10, completed: 9 },
                normal: { total: 10, completed: 7 },
                hard: { total: 10, completed: 4 }
            };
        }');
        test('分布パーセンテージが正常に計算される', () => {
            const distribution = { a: 60, b: 25, c: 15 };
            const percentages = collector.calculateDistributionPercentages(distribution);
            expect(percentages.a').toBe('60.00');
            expect(percentages.b').toBe('25.00');
            expect(percentages.c').toBe('15.00');
        }');
        test('タイプ別平均スコアが正常に計算される', () => {
            const averages = collector.calculateAverageScoresByType(),
            expect(parseFloat(averages.normal).toBe(10.2),
            expect(parseFloat(averages.stone).toBe(20) }');
        test('スコア分散が正常に計算される', () => {
            const variances = collector.calculateScoreVariance(),
            expect(parseFloat(variances.normal).toBeCloseTo(2.16, 1),
            expect(parseFloat(variances.stone).toBeCloseTo(2, 1) }');
        test('完了率が正常に計算される', () => {
            const completionRates = collector.calculateCompletionRates(),
            expect(completionRates.easy').toBe('90.0'),
            expect(completionRates.normal').toBe('70.0'),
            expect(completionRates.hard').toBe('40.0') }');
        test('バランススコアが正常に計算される', () => {
            const bubbleScore = parseFloat(collector.calculateBubbleBalanceScore(),
            const difficultyScore = parseFloat(collector.calculateDifficultyBalanceScore(),
            const overallScore = parseFloat(collector.calculateOverallBalanceScore(),
            expect(bubbleScore).toBeGreaterThan(0),
            expect(bubbleScore).toBeLessThanOrEqual(100),
            expect(difficultyScore).toBeGreaterThan(0),
            expect(difficultyScore).toBeLessThanOrEqual(100),
            expect(overallScore).toBeGreaterThan(0),
            expect(overallScore).toBeLessThanOrEqual(100) }');
        test('バランスレポートが正常に生成される', () => {
            const report = collector.generateBalanceReport(),
            expect(report.timestamp).toBeDefined(),
            expect(report.bubbleBalance).toBeDefined(),
            expect(report.scoreBalance).toBeDefined(),
            expect(report.itemBalance).toBeDefined(),
            expect(report.difficultyBalance).toBeDefined(),
            expect(report.overallBalance).toBeDefined(),
            expect(report.bubbleBalance.totalSpawned).toBe(100),
            expect(report.bubbleBalance.typeDistribution.normal').toBe('60.00'),
            expect(report.overallBalance.score).toBeDefined(),
            expect(report.overallBalance.recommendations).toBeDefined(),
            expect(Array.isArray(report.overallBalance.recommendations).toBe(true) }');
        test('改善推奨事項が適切に生成される', () => {
            // 低いスコアの状況を作成
            collector.difficultyAnalysis.stageCompletionRates.veryHard = {
                total: 10,
                completed: 2 // 20%完了率
            };
            
            const recommendations = collector.generateBalanceRecommendations();
            expect(Array.isArray(recommendations).toBe(true)');
            // 低完了率の警告が含まれることを確認
            const difficultyRecommendation = recommendations.find(r => r.category === 'difficulty');
            expect(difficultyRecommendation).toBeDefined();
            expect(difficultyRecommendation.priority').toBe('high');
        }');
    }
    describe('統計リセット', (') => {
        test('統計データが正常にリセットされる', () => {
            // データを設定
            collector.bubbleSpawnData.totalSpawned = 100,
            collector.bubbleSpawnData.typeDistribution.normal = 50,
            collector.scoreDistribution.bubbleScores.normal = [10, 15, 20],
            collector.itemEffectiveness.usageFrequency.timeExtender = 5,
            collector.difficultyAnalysis.stageCompletionRates.normal = { total: 10, completed: 7 };
            
            // リセット実行
            collector.resetStats();
            // リセット確認
            expect(collector.bubbleSpawnData.totalSpawned).toBe(0);
            expect(collector.bubbleSpawnData.typeDistribution).toEqual({});
            expect(collector.scoreDistribution.bubbleScores).toEqual({});
            expect(collector.itemEffectiveness.usageFrequency).toEqual({});
            expect(collector.difficultyAnalysis.stageCompletionRates).toEqual({});
        }
    }');
    describe('エッジケース', (') => {
        test('空データでのバランス計算が正常に動作する', () => {
            const bubbleScore = collector.calculateBubbleBalanceScore(),
            const overallScore = collector.calculateOverallBalanceScore(),
            expect(parseFloat(bubbleScore).toBe(100), // 空の場合は最高スコア
            expect(parseFloat(overallScore).toBeGreaterThan(0) }');
        test('単一データでの統計計算が正常に動作する', () => {
            collector.scoreDistribution.bubbleScores.normal = [10],
            
            const averages = collector.calculateAverageScoresByType(),
            const variances = collector.calculateScoreVariance(),
            expect(averages.normal').toBe('10.00'),
            expect(variances.normal).toBeUndefined(), // 分散は計算されない（データ不足）
        }');
        test('ゼロ除算エラーが回避される', (') => {
            collector.difficultyAnalysis.stageCompletionRates.test = { total: 0, completed: 0 };
            
            const completionRate = collector.getStageCompletionRate('test');
            expect(completionRate).toBe(1.0); // デフォルト値
        });
    }
}');