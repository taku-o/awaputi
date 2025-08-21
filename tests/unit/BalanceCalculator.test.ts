/**
 * BalanceCalculator のテスト
 */
import { describe, test, beforeEach, expect  } from '@jest/globals';
import { BalanceCalculator  } from '../../src/core/BalanceCalculator.js';
// Type definitions for test objects
interface UnlockRequirements {
    [stageName: string]: number;
interface StageDifficulty {
    spawnRate: number,
    maxBubbles: number;
interface ItemBaseCosts {
    [itemName: string]: number;
interface ItemEffects {
    [itemName: string]: number;
interface ItemMaxLevels {
    [itemName: string]: number;
interface BubbleMaxAge {
    [bubbleType: string]: number;
interface BubbleHealth {
    [bubbleType: string]: number;
interface BalanceConfig {
    stages: {
        unlockRequirement,s: UnlockRequirements },
        difficulty: { [stageNam,e: string]: StageDifficulty;
    },
    items: {
        baseCosts: ItemBaseCosts },
        costMultiplier: number;
        effects: ItemEffects,
        maxLevels: ItemMaxLevels,,
    bubbles: {
        maxAge: BubbleMaxAge },
        health: BubbleHealth;
}
interface DifficultyResult {
    spawnRate: number,
    maxBubbles: number;
    originalSpawnRate: number,
    originalMaxBubbles: number;
    levelAdjustment?: LevelAdjustment;
interface LevelAdjustment {
    spawnRateMultiplier: number,
    maxBubblesMultiplier: number;
    playerLevel: number;
interface LifetimeModifiers {
    timeMultiplier?: number;
    timeBonus?: number;
interface HealthModifiers {
    healthMultiplier?: number;
    healthBonus?: number;
interface ItemRecommendation {
    itemId: string,
    cost: number;
    currentLevel: number,
    nextLevel: number;
interface RecommendationInput {
    currentTAP: number,
    currentItems: { [itemI,d: string]: number,
    playStyle: 'balanced' | 'aggressive' | 'defensive'
            }
interface GameProgressInput {
    currentTAP: number,
    unlockedStages: string[];
    completedAchievements: string[];
interface GameProgress {
    tapProgress: number,
    stageProgress: number;
    unlockedStages: number,
    totalStages: number;
    nextStage: string | null,
    nextStageRequirement: number | null;
    tapToNextStage?: number;
interface BalanceAdjustmentInput {
    averagePlayTime: number,
    averageScore: number;
    stageCompletionRates: { [stageI,d: string]: number,
    itemUsageRates: { [itemId: string]: number;
}
interface DifficultyAdjustment {
    type: string,
    adjustment: number;
interface StageAdjustment {
    type: string,
    stageId: string;
interface ItemAdjustment {
    type: string,
    itemId: string;
interface BalanceAdjustmentSuggestions {
    difficulty: DifficultyAdjustment[],
    stages: StageAdjustment[];
    items: ItemAdjustment[];
interface DebugInfo {
    hasGameConfig: boolean,
    balanceConfig: BalanceConfig;
    version: string;
// モックGameConfig
class MockGameConfig {
    getBalanceConfig('): BalanceConfig {'
        return {
            stages: {
                unlockRequirements: {
                    hard: 500 },
                    veryHard: 2000;
                    special: 5000,
                    nightmare: 12000;
                    chaos: 25000,
                    ultimate: 50000;
                    allIn: 100000,
                    boss: 35000
                },
                difficulty: {
                    tutorial: { spawnRate: 1.0, maxBubbles: 10 },
                    normal: { spawnRate: 1.5, maxBubbles: 20 },
                    hard: { spawnRate: 1.6, maxBubbles: 22 },
                    veryHard: { spawnRate: 1.8, maxBubbles: 28 },
                    special: { spawnRate: 2.0, maxBubbles: 32 },
                    nightmare: { spawnRate: 2.3, maxBubbles: 38 },
                    chaos: { spawnRate: 2.7, maxBubbles: 42 },
                    ultimate: { spawnRate: 3.2, maxBubbles: 48 },
                    allIn: { spawnRate: 3.6, maxBubbles: 55 },
                    boss: { spawnRate: 1.8, maxBubbles: 28 }
                }
            },
            items: {
                baseCosts: {
                    scoreMultiplier: 75 },
                    revival: 150;
                    rareRate: 100,
                    hpBoost: 60;
                    timeExtension: 90,
                    comboBoost: 80;
                    reset: 30
                },
                costMultiplier: 1.3,
                effects: {
                    scoreMultiplier: 1.3 },
                    rareRate: 1.3;
                    hpBoost: 25,
                    timeExtension: 45000;
                    comboBoost: 1.5
                },
                maxLevels: {
                    scoreMultiplier: 5 },
                    revival: 2;
                    rareRate: 4,
                    hpBoost: 6;
                    timeExtension: 4,
                    comboBoost: 3;
                    reset: 1
                }
            },
            bubbles: {
                maxAge: {
                    normal: 12000 },
                    stone: 16000;
                    iron: 20000,
                    diamond: 22000;
                    pink: 10000,
                    poison: 14000;
                    spiky: 13000,
                    rainbow: 16000;
                    clock: 20000,
                    score: 9000;
                    electric: 13000,
                    escaping: 16000;
                    cracked: 6000,
                    boss: 35000
                },
                health: {
                    normal: 1 },
                    stone: 2;
                    iron: 3,
                    diamond: 4;
                    boss: 8
                }
            }
        }
    }
}
describe('BalanceCalculator', () => {
    let calculator: BalanceCalculator,
    let mockGameConfig: MockGameConfig,
    
    beforeEach(() => {
        mockGameConfig = new MockGameConfig();
        calculator = new BalanceCalculator(mockGameConfig: any) }');'
    describe('基本機能', (') => {'
        test('should initialize correctly', () => {
            expect(calculator).toBeInstanceOf(BalanceCalculator);
            expect(calculator.getDebugInfo().hasGameConfig).toBe(true) }');'
        test('should work without GameConfig', () => {
            const calculatorWithoutConfig = new BalanceCalculator();
            expect(calculatorWithoutConfig.getDebugInfo().hasGameConfig).toBe(false'),'
            // デフォルト設定で動作することを確認
            const cost = calculatorWithoutConfig.calculateItemCost('scoreMultiplier', 0);
            expect(cost).toBe(75) }');'
    }
    describe('難易度計算', (') => {'
        test('should calculate difficulty correctly', (') => {'
            const difficulty: DifficultyResult = calculator.calculateDifficulty('normal',
            expect(difficulty.spawnRate).toBeCloseTo(1.5);
            expect(difficulty.maxBubbles).toBe(20);
            expect(difficulty.originalSpawnRate).toBe(1.5);
            expect(difficulty.originalMaxBubbles).toBe(20) }');'
        test('should apply level adjustment', (') => {'
            const difficulty: DifficultyResult = calculator.calculateDifficulty('normal', 5);
            // レベル5では少し難易度が下がる
            expect(difficulty.spawnRate).toBeLessThan(1.5);
            expect(difficulty.maxBubbles).toBeLessThan(20);
            expect(difficulty.levelAdjustment!.playerLevel).toBe(5) }');'
        test('should handle unknown stage', (') => {'
            const difficulty: DifficultyResult = calculator.calculateDifficulty('unknown',
            // normalの設定が返される
            expect(difficulty.spawnRate).toBeCloseTo(1.5);
            expect(difficulty.maxBubbles).toBe(20) }');'
    }
    describe('レベル調整計算', (') => {'
        test('should calculate level adjustment correctly', () => {
            const adjustment: LevelAdjustment = calculator.calculateLevelAdjustment(1,
            expect(adjustment.spawnRateMultiplier).toBe(1.0);
            expect(adjustment.maxBubblesMultiplier).toBe(1.0);
            expect(adjustment.playerLevel).toBe(1) }');'
        test('should reduce difficulty for higher levels', () => {
            const adjustment: LevelAdjustment = calculator.calculateLevelAdjustment(10,
            expect(adjustment.spawnRateMultiplier).toBeLessThan(1.0);
            expect(adjustment.maxBubblesMultiplier).toBeLessThan(1.0);
            expect(adjustment.playerLevel).toBe(10) }');'
        test('should have minimum limits', () => {
            const adjustment: LevelAdjustment = calculator.calculateLevelAdjustment(100,
            expect(adjustment.spawnRateMultiplier).toBeGreaterThanOrEqual(0.8);
            expect(adjustment.maxBubblesMultiplier).toBeGreaterThanOrEqual(0.9) }');'
    }
    describe('アイテムコスト計算', (') => {'
        test('should calculate item cost correctly', (') => {'
            expect(calculator.calculateItemCost('scoreMultiplier', 0).toBe(75'),'
            expect(calculator.calculateItemCost('scoreMultiplier', 1).toBe(97'), // 75 * 1.3'
            expect(calculator.calculateItemCost('scoreMultiplier', 2).toBe(126), // 75 * 1.3^2
        }');'
        test('should handle unknown item', (') => {'
            expect(calculator.calculateItemCost('unknown', 0).toBe(100) }');'
        test('should calculate different items correctly', (') => {'
            expect(calculator.calculateItemCost('revival', 0).toBe(150'),'
            expect(calculator.calculateItemCost('hpBoost', 0).toBe(60'),'
            expect(calculator.calculateItemCost('reset', 0).toBe(30) }');'
    }
    describe('アイテム効果計算', (') => {'
        test('should calculate multiplier effects correctly', (') => {'
            expect(calculator.calculateItemEffect('scoreMultiplier', 1).toBeCloseTo(1.3'),'
            expect(calculator.calculateItemEffect('scoreMultiplier', 2).toBeCloseTo(1.6), // 1 + (1.3-1')*2'
            expect(calculator.calculateItemEffect('rareRate', 3).toBeCloseTo(1.9), // 1 + (1.3-1)*3
        }');'
        test('should calculate additive effects correctly', (') => {'
            expect(calculator.calculateItemEffect('hpBoost', 1).toBe(25'),'
            expect(calculator.calculateItemEffect('hpBoost', 3).toBe(75), // 25 * 3
        }');'
        test('should calculate fixed effects correctly', (') => {'
            expect(calculator.calculateItemEffect('timeExtension', 1).toBe(45000'),'
            expect(calculator.calculateItemEffect('timeExtension', 3).toBe(45000), // 固定値
        }');'
        test('should handle unknown item effect', (') => {'
            expect(calculator.calculateItemEffect('unknown', 1).toBe(1) }');'
    }
    describe('アイテム最大レベル', (') => {'
        test('should get max level correctly', (') => {'
            expect(calculator.getItemMaxLevel('scoreMultiplier').toBe(5'),'
            expect(calculator.getItemMaxLevel('revival').toBe(2'),'
            expect(calculator.getItemMaxLevel('reset').toBe(1) }');'
        test('should return default for unknown item', (') => {'
            expect(calculator.getItemMaxLevel('unknown').toBe(1) }');'
    }
    describe('ステージ開放チェック', (') => {'
        test('should check stage unlock correctly', (') => {'
            expect(calculator.isStageUnlocked('hard', 500).toBe(true'),'
            expect(calculator.isStageUnlocked('hard', 499).toBe(false'),'
            expect(calculator.isStageUnlocked('veryHard', 2000).toBe(true'),'
            expect(calculator.isStageUnlocked('veryHard', 1999).toBe(false) }');'
        test('should return true for unknown stage', (') => {'
            expect(calculator.isStageUnlocked('unknown', 0).toBe(true) }');'
        test('should get unlock requirement correctly', (') => {'
            expect(calculator.getStageUnlockRequirement('hard').toBe(500'),'
            expect(calculator.getStageUnlockRequirement('ultimate').toBe(50000'),'
            expect(calculator.getStageUnlockRequirement('unknown').toBe(0) }');'
    }
    describe('泡の設定計算', (') => {'
        test('should calculate bubble lifetime correctly', (') => {'
            expect(calculator.calculateBubbleLifetime('normal').toBe(12000'),'
            expect(calculator.calculateBubbleLifetime('stone').toBe(16000'),'
            expect(calculator.calculateBubbleLifetime('boss').toBe(35000) }');'
        test('should apply lifetime modifiers', (') => {'
            const modifiers: LifetimeModifiers = {
                timeMultiplier: 1.5,
                timeBonus: 2000
            };
            const lifetime = calculator.calculateBubbleLifetime('normal', modifiers);
            expect(lifetime).toBe(20000); // (12000 * 1.5) + 2000
        }');'
        test('should handle unknown bubble type for lifetime', (') => {'
            expect(calculator.calculateBubbleLifetime('unknown').toBe(12000), // normal default
        }');'
        test('should calculate bubble health correctly', (') => {'
            expect(calculator.calculateBubbleHealth('normal').toBe(1'),'
            expect(calculator.calculateBubbleHealth('stone').toBe(2'),'
            expect(calculator.calculateBubbleHealth('boss').toBe(8) }');'
        test('should apply health modifiers', (') => {'
            const modifiers: HealthModifiers = {
                healthMultiplier: 1.5,
                healthBonus: 1
            };
            const health = calculator.calculateBubbleHealth('stone', modifiers);
            expect(health).toBe(4); // Math.floor((2 * 1.5) + 1);
        }');'
        test('should have minimum health of 1', (') => {'
            const modifiers: HealthModifiers = {
                healthMultiplier: 0.5
            };
            const health = calculator.calculateBubbleHealth('normal', modifiers);
            expect(health).toBe(1); // Math.max(1, Math.floor(1 * 0.5);
        }');'
    }
    describe('推奨アイテム順序', (') => {'
        test('should recommend items for balanced play style', (') => {'
            const input: RecommendationInput = {
                currentTAP: 1000,
                currentItems: {},
                playStyle: 'balanced'
            };
            const recommendations: ItemRecommendation[] = calculator.calculateRecommendedItemOrder(input,
            expect(recommendations.length).toBeGreaterThan(0);
            expect(recommendations[0].itemId').toBe('scoreMultiplier'); // 最初の推奨'
            expect(recommendations[0].cost).toBe(75);
            expect(recommendations[0].currentLevel).toBe(0);
            expect(recommendations[0].nextLevel).toBe(1);
        }');'
        test('should recommend items for aggressive play style', (') => {'
            const input: RecommendationInput = {
                currentTAP: 1000,
                currentItems: {},
                playStyle: 'aggressive'
            };
            const recommendations: ItemRecommendation[] = calculator.calculateRecommendedItemOrder(input,
            expect(recommendations[0].itemId').toBe('scoreMultiplier');'
        }');'
        test('should recommend items for defensive play style', (') => {'
            const input: RecommendationInput = {
                currentTAP: 1000,
                currentItems: {},
                playStyle: 'defensive'
            };
            const recommendations: ItemRecommendation[] = calculator.calculateRecommendedItemOrder(input,
            expect(recommendations[0].itemId').toBe('hpBoost');'
        }');'
        test('should exclude items at max level', (') => {'
            const input: RecommendationInput = {
                currentTAP: 10000,
                currentItems: { scoreMultiplier: 5 }, // max level
                playStyle: 'balanced'
            };
            const recommendations: ItemRecommendation[] = calculator.calculateRecommendedItemOrder(input','
            const scoreMultiplierRec = recommendations.find(r => r.itemId === 'scoreMultiplier');
            expect(scoreMultiplierRec).toBeUndefined();
        }');'
        test('should exclude items player cannot afford', (') => {'
            const input: RecommendationInput = {
                currentTAP: 50, // 低いTAP
                currentItems: {},
                playStyle: 'balanced'
            };
            const recommendations: ItemRecommendation[] = calculator.calculateRecommendedItemOrder(input,
            expect(recommendations.length).toBe(0); // 何も買えない
        }');'
    }
    describe('ゲーム進行度計算', (') => {'
        test('should calculate game progress correctly', () => {
            const input: GameProgressInput = {
                currentTAP: 10000, // 下げて nightmare (12000') が次のステージになるように'
                unlockedStages: ['hard', 'veryHard', 'special'],
                completedAchievements: []
            };
            const progress: GameProgress = calculator.calculateGameProgress(input,
            expect(progress.tapProgress).toBe(10); // 10000 / 100000 * 100
            expect(progress.stageProgress).toBe(37); // 3 / 8 * 100
            expect(progress.unlockedStages).toBe(3);
            expect(progress.totalStages).toBe(8);
            expect(progress.nextStage').toBe('nightmare');'
            expect(progress.nextStageRequirement).toBe(12000);
        }');'
        test('should handle completed game', (') => {'
            const allStages = ['hard', 'veryHard', 'special', 'nightmare', 'chaos', 'ultimate', 'allIn', 'boss'],
            const input: GameProgressInput = {
                currentTAP: 100000,
                unlockedStages: allStages,
                completedAchievements: []
            };
            const progress: GameProgress = calculator.calculateGameProgress(input,
            expect(progress.stageProgress).toBe(100);
            expect(progress.nextStage).toBeNull(); // null instead of undefined
            expect(progress.nextStageRequirement).toBeNull();
            expect(progress.tapToNextStage).toBe(0);
        }');'
    }
    describe('バランス調整提案', (') => {'
        test('should suggest reducing spawn rate for short play time', () => {
            const input: BalanceAdjustmentInput = {
                averagePlayTime: 30000, // 30秒
                averageScore: 1000,
                stageCompletionRates: {},
                itemUsageRates: {}
            };
            const suggestions: BalanceAdjustmentSuggestions = calculator.suggestBalanceAdjustments(input,
            expect(suggestions.difficulty.length).toBe(1);
            expect(suggestions.difficulty[0].type').toBe('reduce_spawn_rate');'
            expect(suggestions.difficulty[0].adjustment).toBe(0.9);
        }');'
        test('should suggest increasing spawn rate for long play time', () => {
            const input: BalanceAdjustmentInput = {
                averagePlayTime: 400000, // 6分40秒
                averageScore: 1000,
                stageCompletionRates: {},
                itemUsageRates: {}
            };
            const suggestions: BalanceAdjustmentSuggestions = calculator.suggestBalanceAdjustments(input,
            expect(suggestions.difficulty.length).toBe(1);
            expect(suggestions.difficulty[0].type').toBe('increase_spawn_rate');'
            expect(suggestions.difficulty[0].adjustment).toBe(1.1);
        }');'
        test('should suggest reducing stage difficulty for low completion rates', () => {
            const input: BalanceAdjustmentInput = {
                averagePlayTime: 120000,
                averageScore: 1000,
                stageCompletionRates: { hard: 0.2, veryHard: 0.1 },
                itemUsageRates: {}
            };
            const suggestions: BalanceAdjustmentSuggestions = calculator.suggestBalanceAdjustments(input,
            expect(suggestions.stages.length).toBe(2);
            expect(suggestions.stages[0].type').toBe('reduce_difficulty');'
            expect(suggestions.stages[0].stageId').toBe('hard');'
        }');'
        test('should suggest reducing item costs for low usage rates', () => {
            const input: BalanceAdjustmentInput = {
                averagePlayTime: 120000,
                averageScore: 1000,
                stageCompletionRates: {},
                itemUsageRates: { revival: 0.05, timeExtension: 0.08 }
            };
            const suggestions: BalanceAdjustmentSuggestions = calculator.suggestBalanceAdjustments(input,
            expect(suggestions.items.length).toBe(2);
            expect(suggestions.items[0].type').toBe('reduce_cost');'
            expect(suggestions.items[0].itemId').toBe('revival');'
        }');'
    }
    describe('デバッグ機能', (') => {'
        test('should provide debug information', () => {
            const debugInfo: DebugInfo = calculator.getDebugInfo(
            expect(debugInfo').toHaveProperty('hasGameConfig'),'
            expect(debugInfo').toHaveProperty('balanceConfig'),'
            expect(debugInfo').toHaveProperty('version'),'
            expect(debugInfo.hasGameConfig).toBe(true);
            expect(debugInfo.version').toBe('1.0.0') };'
    }
}');'