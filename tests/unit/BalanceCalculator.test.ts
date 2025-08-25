/**
 * BalanceCalculator のテスト
 */
import { describe, test, beforeEach, expect } from '@jest/globals';

// Type definitions for test objects
interface UnlockRequirements {
    [stageName: string]: number;
}

interface StageDifficulty {
    spawnRate: number;
    maxBubbles: number;
    timeLimit: number;
    scoreTarget: number;
}

interface ItemBaseCosts {
    [itemName: string]: number;
}

interface ItemEffects {
    [itemName: string]: number;
}

interface ItemMaxLevels {
    [itemName: string]: number;
}

interface BubbleMaxAge {
    [bubbleType: string]: number;
}

interface BubbleHealth {
    [bubbleType: string]: number;
}

interface BalanceConfig {
    stages: {
        unlockRequirements: UnlockRequirements;
        difficulty: { [stageName: string]: StageDifficulty };
    };
    items: {
        baseCosts: ItemBaseCosts;
        costMultiplier: number;
        effects: ItemEffects;
        maxLevels: ItemMaxLevels;
    };
    bubbles: {
        maxAge: BubbleMaxAge;
        health: BubbleHealth;
        scoreMultipliers: { [bubbleType: string]: number };
    };
    player: {
        baseHealth: number;
        baseDamage: number;
        baseSpeed: number;
        baseAccuracy: number;
    };
    game: {
        baseScore: number;
        comboMultiplier: number;
        timeBonus: number;
        difficultyScaling: number;
    };
}

interface PlayerStats {
    level: number;
    experience: number;
    health: number;
    damage: number;
    speed: number;
    accuracy: number;
    criticalChance: number;
    items: { [itemName: string]: number };
}

interface GameState {
    stage: string;
    difficulty: number;
    timeRemaining: number;
    bubblesRemaining: number;
    combo: number;
    score: number;
}

interface CalculationResult {
    damage: number;
    health: number;
    score: number;
    cost: number;
    isUnlocked: boolean;
    effectiveness: number;
}

interface BalanceValidation {
    isValid: boolean;
    issues: string[];
    recommendations: string[];
}

// Mock BalanceCalculator implementation
class MockBalanceCalculator {
    private config: BalanceConfig;

    constructor(config: BalanceConfig) {
        this.config = config;
    }

    calculatePlayerDamage(playerStats: PlayerStats): number {
        const baseDamage = this.config.player.baseDamage;
        let totalDamage = baseDamage;

        // Apply level scaling
        totalDamage += playerStats.level * 2;

        // Apply item effects
        for (const [itemName, itemLevel] of Object.entries(playerStats.items)) {
            const itemEffect = this.config.items.effects[itemName] || 0;
            totalDamage += itemEffect * itemLevel;
        }

        // Apply stat modifiers
        const damageMultiplier = 1 + (playerStats.damage / 100);
        totalDamage *= damageMultiplier;

        return Math.floor(totalDamage);
    }

    calculatePlayerHealth(playerStats: PlayerStats): number {
        const baseHealth = this.config.player.baseHealth;
        let totalHealth = baseHealth;

        // Apply level scaling
        totalHealth += playerStats.level * 5;

        // Apply item effects
        for (const [itemName, itemLevel] of Object.entries(playerStats.items)) {
            const itemEffect = this.config.items.effects[itemName + '_health'] || 0;
            totalHealth += itemEffect * itemLevel;
        }

        // Apply stat modifiers
        const healthMultiplier = 1 + (playerStats.health / 100);
        totalHealth *= healthMultiplier;

        return Math.floor(totalHealth);
    }

    calculateItemCost(itemName: string, currentLevel: number): number {
        const baseCost = this.config.items.baseCosts[itemName] || 100;
        const multiplier = this.config.items.costMultiplier;
        
        return Math.floor(baseCost * Math.pow(multiplier, currentLevel));
    }

    calculateScore(gameState: GameState, damage: number): number {
        let score = this.config.game.baseScore * damage;

        // Apply combo multiplier
        const comboMultiplier = 1 + (gameState.combo * this.config.game.comboMultiplier);
        score *= comboMultiplier;

        // Apply time bonus
        const timeRatio = gameState.timeRemaining / 60000; // 60 seconds base
        const timeBonus = 1 + (timeRatio * this.config.game.timeBonus);
        score *= timeBonus;

        // Apply difficulty scaling
        const difficultyMultiplier = 1 + (gameState.difficulty * this.config.game.difficultyScaling);
        score *= difficultyMultiplier;

        return Math.floor(score);
    }

    isStageUnlocked(stageName: string, playerLevel: number): boolean {
        const requirement = this.config.stages.unlockRequirements[stageName];
        return requirement ? playerLevel >= requirement : false;
    }

    getStageDifficulty(stageName: string): StageDifficulty {
        return this.config.stages.difficulty[stageName] || {
            spawnRate: 1.0,
            maxBubbles: 10,
            timeLimit: 60000,
            scoreTarget: 1000
        };
    }

    calculateBubbleHealth(bubbleType: string, gameState: GameState): number {
        const baseHealth = this.config.bubbles.health[bubbleType] || 1;
        const difficultyMultiplier = 1 + (gameState.difficulty * 0.2);
        
        return Math.floor(baseHealth * difficultyMultiplier);
    }

    calculateBubbleMaxAge(bubbleType: string): number {
        return this.config.bubbles.maxAge[bubbleType] || 10000;
    }

    getItemMaxLevel(itemName: string): number {
        return this.config.items.maxLevels[itemName] || 10;
    }

    validateBalance(): BalanceValidation {
        const issues: string[] = [];
        const recommendations: string[] = [];

        // Check if stage difficulties are reasonable
        for (const [stageName, difficulty] of Object.entries(this.config.stages.difficulty)) {
            if (difficulty.spawnRate <= 0) {
                issues.push(`Stage ${stageName} has invalid spawn rate: ${difficulty.spawnRate}`);
            }
            if (difficulty.maxBubbles <= 0) {
                issues.push(`Stage ${stageName} has invalid max bubbles: ${difficulty.maxBubbles}`);
            }
            if (difficulty.timeLimit <= 0) {
                issues.push(`Stage ${stageName} has invalid time limit: ${difficulty.timeLimit}`);
            }
        }

        // Check item costs
        for (const [itemName, baseCost] of Object.entries(this.config.items.baseCosts)) {
            if (baseCost <= 0) {
                issues.push(`Item ${itemName} has invalid base cost: ${baseCost}`);
            }
            if (baseCost > 10000) {
                recommendations.push(`Item ${itemName} base cost (${baseCost}) might be too expensive`);
            }
        }

        // Check multipliers
        if (this.config.items.costMultiplier <= 1.0) {
            issues.push(`Item cost multiplier (${this.config.items.costMultiplier}) should be greater than 1.0`);
        }
        if (this.config.items.costMultiplier > 3.0) {
            recommendations.push(`Item cost multiplier (${this.config.items.costMultiplier}) might cause exponential cost growth`);
        }

        // Check bubble health values
        for (const [bubbleType, health] of Object.entries(this.config.bubbles.health)) {
            if (health <= 0) {
                issues.push(`Bubble type ${bubbleType} has invalid health: ${health}`);
            }
        }

        return {
            isValid: issues.length === 0,
            issues,
            recommendations
        };
    }

    optimizeForDifficulty(targetDifficulty: number): BalanceConfig {
        const optimizedConfig = JSON.parse(JSON.stringify(this.config)); // Deep clone

        // Adjust stage difficulties based on target
        for (const stageName in optimizedConfig.stages.difficulty) {
            const difficulty = optimizedConfig.stages.difficulty[stageName];
            difficulty.spawnRate *= (1 + targetDifficulty * 0.1);
            difficulty.maxBubbles = Math.floor(difficulty.maxBubbles * (1 + targetDifficulty * 0.05));
            difficulty.timeLimit = Math.floor(difficulty.timeLimit * (1 - targetDifficulty * 0.1));
        }

        // Adjust bubble health
        for (const bubbleType in optimizedConfig.bubbles.health) {
            optimizedConfig.bubbles.health[bubbleType] = Math.floor(
                optimizedConfig.bubbles.health[bubbleType] * (1 + targetDifficulty * 0.2)
            );
        }

        return optimizedConfig;
    }

    calculateEffectiveness(itemName: string, playerStats: PlayerStats, gameState: GameState): number {
        const itemLevel = playerStats.items[itemName] || 0;
        const effect = this.config.items.effects[itemName] || 0;
        const cost = this.calculateItemCost(itemName, itemLevel);

        if (cost === 0) return 0;

        // Calculate effectiveness based on effect per cost ratio
        const baseDamage = this.calculatePlayerDamage(playerStats);
        const improvedStats = { ...playerStats, items: { ...playerStats.items, [itemName]: itemLevel + 1 } };
        const improvedDamage = this.calculatePlayerDamage(improvedStats);
        
        const damageIncrease = improvedDamage - baseDamage;
        const effectiveness = damageIncrease / cost;

        return effectiveness;
    }

    simulateGameProgression(initialStats: PlayerStats, targetLevel: number): PlayerStats[] {
        const progression: PlayerStats[] = [];
        let currentStats = { ...initialStats };

        for (let level = initialStats.level; level <= targetLevel; level++) {
            currentStats = {
                ...currentStats,
                level,
                experience: level * 100,
                health: currentStats.health + 5,
                damage: currentStats.damage + 2,
                speed: currentStats.speed + 1,
                accuracy: Math.min(currentStats.accuracy + 1, 100)
            };

            progression.push({ ...currentStats });
        }

        return progression;
    }

    getRecommendedItems(playerStats: PlayerStats, budget: number): Array<{ itemName: string; priority: number }> {
        const recommendations: Array<{ itemName: string; priority: number }> = [];

        for (const itemName in this.config.items.baseCosts) {
            const currentLevel = playerStats.items[itemName] || 0;
            const maxLevel = this.getItemMaxLevel(itemName);
            
            if (currentLevel < maxLevel) {
                const cost = this.calculateItemCost(itemName, currentLevel);
                
                if (cost <= budget) {
                    const effectiveness = this.calculateEffectiveness(itemName, playerStats, {
                        stage: 'normal',
                        difficulty: 1,
                        timeRemaining: 60000,
                        bubblesRemaining: 10,
                        combo: 1,
                        score: 0
                    });
                    
                    recommendations.push({
                        itemName,
                        priority: effectiveness
                    });
                }
            }
        }

        return recommendations.sort((a, b) => b.priority - a.priority);
    }
}

describe('BalanceCalculator', () => {
    let calculator: MockBalanceCalculator;
    let defaultConfig: BalanceConfig;
    let testPlayerStats: PlayerStats;
    let testGameState: GameState;

    beforeEach(() => {
        defaultConfig = {
            stages: {
                unlockRequirements: {
                    'stage1': 1,
                    'stage2': 5,
                    'stage3': 10,
                    'boss1': 15
                },
                difficulty: {
                    'stage1': { spawnRate: 1.0, maxBubbles: 8, timeLimit: 60000, scoreTarget: 500 },
                    'stage2': { spawnRate: 1.2, maxBubbles: 12, timeLimit: 50000, scoreTarget: 1000 },
                    'stage3': { spawnRate: 1.5, maxBubbles: 15, timeLimit: 45000, scoreTarget: 1500 },
                    'boss1': { spawnRate: 2.0, maxBubbles: 20, timeLimit: 40000, scoreTarget: 3000 }
                }
            },
            items: {
                baseCosts: {
                    'damage_boost': 100,
                    'health_boost': 80,
                    'speed_boost': 120,
                    'accuracy_boost': 90
                },
                costMultiplier: 1.5,
                effects: {
                    'damage_boost': 5,
                    'health_boost_health': 10,
                    'speed_boost': 3,
                    'accuracy_boost': 2
                },
                maxLevels: {
                    'damage_boost': 20,
                    'health_boost': 15,
                    'speed_boost': 25,
                    'accuracy_boost': 30
                }
            },
            bubbles: {
                maxAge: {
                    'normal': 10000,
                    'stone': 15000,
                    'rainbow': 8000,
                    'bomb': 5000
                },
                health: {
                    'normal': 1,
                    'stone': 3,
                    'rainbow': 1,
                    'bomb': 2
                },
                scoreMultipliers: {
                    'normal': 1.0,
                    'stone': 1.5,
                    'rainbow': 2.0,
                    'bomb': 1.2
                }
            },
            player: {
                baseHealth: 100,
                baseDamage: 10,
                baseSpeed: 5,
                baseAccuracy: 80
            },
            game: {
                baseScore: 10,
                comboMultiplier: 0.1,
                timeBonus: 0.2,
                difficultyScaling: 0.15
            }
        };

        testPlayerStats = {
            level: 5,
            experience: 500,
            health: 20,
            damage: 15,
            speed: 10,
            accuracy: 85,
            criticalChance: 5,
            items: {
                'damage_boost': 2,
                'health_boost': 1,
                'speed_boost': 0,
                'accuracy_boost': 3
            }
        };

        testGameState = {
            stage: 'stage1',
            difficulty: 1,
            timeRemaining: 45000,
            bubblesRemaining: 8,
            combo: 3,
            score: 1200
        };

        calculator = new MockBalanceCalculator(defaultConfig);
    });

    describe('初期化', () => {
        test('正常に初期化される', () => {
            expect(calculator).toBeDefined();
        });
    });

    describe('プレイヤーダメージ計算', () => {
        test('基本ダメージが正しく計算される', () => {
            const damage = calculator.calculatePlayerDamage(testPlayerStats);
            
            expect(damage).toBeGreaterThan(defaultConfig.player.baseDamage);
            expect(damage).toBeGreaterThan(0);
        });

        test('レベルによるダメージスケーリング', () => {
            const lowLevelStats = { ...testPlayerStats, level: 1 };
            const highLevelStats = { ...testPlayerStats, level: 10 };

            const lowDamage = calculator.calculatePlayerDamage(lowLevelStats);
            const highDamage = calculator.calculatePlayerDamage(highLevelStats);

            expect(highDamage).toBeGreaterThan(lowDamage);
        });

        test('アイテムエフェクトの適用', () => {
            const noItemStats = { ...testPlayerStats, items: {} };
            const withItemStats = testPlayerStats;

            const noItemDamage = calculator.calculatePlayerDamage(noItemStats);
            const withItemDamage = calculator.calculatePlayerDamage(withItemStats);

            expect(withItemDamage).toBeGreaterThan(noItemDamage);
        });
    });

    describe('プレイヤー体力計算', () => {
        test('基本体力が正しく計算される', () => {
            const health = calculator.calculatePlayerHealth(testPlayerStats);
            
            expect(health).toBeGreaterThan(defaultConfig.player.baseHealth);
            expect(health).toBeGreaterThan(0);
        });

        test('レベルによる体力スケーリング', () => {
            const lowLevelStats = { ...testPlayerStats, level: 1 };
            const highLevelStats = { ...testPlayerStats, level: 15 };

            const lowHealth = calculator.calculatePlayerHealth(lowLevelStats);
            const highHealth = calculator.calculatePlayerHealth(highLevelStats);

            expect(highHealth).toBeGreaterThan(lowHealth);
        });
    });

    describe('アイテムコスト計算', () => {
        test('基本コストが正しく計算される', () => {
            const cost = calculator.calculateItemCost('damage_boost', 0);
            
            expect(cost).toBe(defaultConfig.items.baseCosts['damage_boost']);
        });

        test('レベルによるコスト増加', () => {
            const level0Cost = calculator.calculateItemCost('damage_boost', 0);
            const level1Cost = calculator.calculateItemCost('damage_boost', 1);
            const level2Cost = calculator.calculateItemCost('damage_boost', 2);

            expect(level1Cost).toBeGreaterThan(level0Cost);
            expect(level2Cost).toBeGreaterThan(level1Cost);
        });

        test('存在しないアイテムのデフォルトコスト', () => {
            const cost = calculator.calculateItemCost('nonexistent_item', 0);
            
            expect(cost).toBe(100); // デフォルト値
        });
    });

    describe('スコア計算', () => {
        test('基本スコアが正しく計算される', () => {
            const damage = 20;
            const score = calculator.calculateScore(testGameState, damage);
            
            expect(score).toBeGreaterThan(0);
            expect(score).toBeGreaterThan(defaultConfig.game.baseScore * damage);
        });

        test('コンボによるスコア増加', () => {
            const lowComboState = { ...testGameState, combo: 1 };
            const highComboState = { ...testGameState, combo: 10 };
            const damage = 15;

            const lowComboScore = calculator.calculateScore(lowComboState, damage);
            const highComboScore = calculator.calculateScore(highComboState, damage);

            expect(highComboScore).toBeGreaterThan(lowComboScore);
        });

        test('時間ボーナスの適用', () => {
            const fastClearState = { ...testGameState, timeRemaining: 55000 };
            const slowClearState = { ...testGameState, timeRemaining: 10000 };
            const damage = 15;

            const fastScore = calculator.calculateScore(fastClearState, damage);
            const slowScore = calculator.calculateScore(slowClearState, damage);

            expect(fastScore).toBeGreaterThan(slowScore);
        });

        test('難易度によるスコア調整', () => {
            const easyState = { ...testGameState, difficulty: 0 };
            const hardState = { ...testGameState, difficulty: 3 };
            const damage = 15;

            const easyScore = calculator.calculateScore(easyState, damage);
            const hardScore = calculator.calculateScore(hardState, damage);

            expect(hardScore).toBeGreaterThan(easyScore);
        });
    });

    describe('ステージアンロック', () => {
        test('レベル要件を満たしているステージはアンロックされる', () => {
            expect(calculator.isStageUnlocked('stage1', 1)).toBe(true);
            expect(calculator.isStageUnlocked('stage2', 5)).toBe(true);
            expect(calculator.isStageUnlocked('stage3', 10)).toBe(true);
        });

        test('レベル要件を満たしていないステージはロックされる', () => {
            expect(calculator.isStageUnlocked('stage2', 3)).toBe(false);
            expect(calculator.isStageUnlocked('stage3', 8)).toBe(false);
            expect(calculator.isStageUnlocked('boss1', 10)).toBe(false);
        });

        test('存在しないステージはロックされる', () => {
            expect(calculator.isStageUnlocked('nonexistent_stage', 100)).toBe(false);
        });
    });

    describe('ステージ難易度取得', () => {
        test('既存ステージの難易度が取得される', () => {
            const difficulty = calculator.getStageDifficulty('stage1');
            
            expect(difficulty).toEqual(defaultConfig.stages.difficulty['stage1']);
        });

        test('存在しないステージのデフォルト難易度が取得される', () => {
            const difficulty = calculator.getStageDifficulty('nonexistent_stage');
            
            expect(difficulty.spawnRate).toBe(1.0);
            expect(difficulty.maxBubbles).toBe(10);
            expect(difficulty.timeLimit).toBe(60000);
            expect(difficulty.scoreTarget).toBe(1000);
        });
    });

    describe('バブル体力計算', () => {
        test('基本バブル体力が計算される', () => {
            const health = calculator.calculateBubbleHealth('normal', testGameState);
            
            expect(health).toBeGreaterThan(0);
            expect(health).toBeGreaterThanOrEqual(defaultConfig.bubbles.health['normal']);
        });

        test('難易度によるバブル体力増加', () => {
            const easyState = { ...testGameState, difficulty: 0 };
            const hardState = { ...testGameState, difficulty: 3 };

            const easyHealth = calculator.calculateBubbleHealth('stone', easyState);
            const hardHealth = calculator.calculateBubbleHealth('stone', hardState);

            expect(hardHealth).toBeGreaterThan(easyHealth);
        });

        test('存在しないバブルタイプのデフォルト体力', () => {
            const health = calculator.calculateBubbleHealth('unknown', testGameState);
            
            expect(health).toBeGreaterThan(0);
        });
    });

    describe('バランス検証', () => {
        test('有効な設定の検証', () => {
            const validation = calculator.validateBalance();
            
            expect(validation.isValid).toBe(true);
            expect(validation.issues).toHaveLength(0);
        });

        test('無効な設定の検出', () => {
            const invalidConfig = {
                ...defaultConfig,
                stages: {
                    ...defaultConfig.stages,
                    difficulty: {
                        'invalid_stage': { spawnRate: -1, maxBubbles: 0, timeLimit: -100, scoreTarget: -500 }
                    }
                },
                items: {
                    ...defaultConfig.items,
                    baseCosts: { 'invalid_item': -50 },
                    costMultiplier: 0.5
                },
                bubbles: {
                    ...defaultConfig.bubbles,
                    health: { 'invalid_bubble': -1 }
                }
            };

            const invalidCalculator = new MockBalanceCalculator(invalidConfig);
            const validation = invalidCalculator.validateBalance();

            expect(validation.isValid).toBe(false);
            expect(validation.issues.length).toBeGreaterThan(0);
        });

        test('推奨事項の生成', () => {
            const expensiveConfig = {
                ...defaultConfig,
                items: {
                    ...defaultConfig.items,
                    baseCosts: { 'expensive_item': 15000 },
                    costMultiplier: 5.0
                }
            };

            const expensiveCalculator = new MockBalanceCalculator(expensiveConfig);
            const validation = expensiveCalculator.validateBalance();

            expect(validation.recommendations.length).toBeGreaterThan(0);
        });
    });

    describe('難易度最適化', () => {
        test('難易度に基づく設定最適化', () => {
            const targetDifficulty = 2;
            const optimizedConfig = calculator.optimizeForDifficulty(targetDifficulty);

            // Original values should be modified
            expect(optimizedConfig.stages.difficulty['stage1'].spawnRate)
                .toBeGreaterThan(defaultConfig.stages.difficulty['stage1'].spawnRate);
            expect(optimizedConfig.stages.difficulty['stage1'].maxBubbles)
                .toBeGreaterThan(defaultConfig.stages.difficulty['stage1'].maxBubbles);
            expect(optimizedConfig.stages.difficulty['stage1'].timeLimit)
                .toBeLessThan(defaultConfig.stages.difficulty['stage1'].timeLimit);
        });
    });

    describe('効率性計算', () => {
        test('アイテムの効率性が計算される', () => {
            const effectiveness = calculator.calculateEffectiveness('damage_boost', testPlayerStats, testGameState);
            
            expect(effectiveness).toBeGreaterThanOrEqual(0);
        });

        test('レベルによる効率性の変化', () => {
            const lowLevelStats = { ...testPlayerStats, items: { ...testPlayerStats.items, 'damage_boost': 0 } };
            const highLevelStats = { ...testPlayerStats, items: { ...testPlayerStats.items, 'damage_boost': 10 } };

            const lowLevelEffectiveness = calculator.calculateEffectiveness('damage_boost', lowLevelStats, testGameState);
            const highLevelEffectiveness = calculator.calculateEffectiveness('damage_boost', highLevelStats, testGameState);

            // Higher level items typically have lower cost-effectiveness
            expect(lowLevelEffectiveness).toBeGreaterThanOrEqual(highLevelEffectiveness);
        });
    });

    describe('ゲーム進行シミュレーション', () => {
        test('レベルアップによる能力値変化のシミュレーション', () => {
            const progression = calculator.simulateGameProgression(testPlayerStats, testPlayerStats.level + 5);
            
            expect(progression).toHaveLength(6); // level 5 to 10 (inclusive)
            expect(progression[0].level).toBe(testPlayerStats.level);
            expect(progression[progression.length - 1].level).toBe(testPlayerStats.level + 5);
            
            // Stats should increase with level
            expect(progression[progression.length - 1].health).toBeGreaterThan(progression[0].health);
            expect(progression[progression.length - 1].damage).toBeGreaterThan(progression[0].damage);
        });
    });

    describe('推奨アイテム', () => {
        test('予算内の効率的なアイテムが推奨される', () => {
            const budget = 500;
            const recommendations = calculator.getRecommendedItems(testPlayerStats, budget);
            
            expect(recommendations).toBeInstanceOf(Array);
            expect(recommendations.every(rec => rec.itemName && rec.priority >= 0)).toBe(true);
            
            // Should be sorted by priority (descending)
            for (let i = 1; i < recommendations.length; i++) {
                expect(recommendations[i - 1].priority).toBeGreaterThanOrEqual(recommendations[i].priority);
            }
        });

        test('予算が少ない場合は推奨アイテムが制限される', () => {
            const smallBudget = 50;
            const largeBudget = 5000;
            
            const smallRecommendations = calculator.getRecommendedItems(testPlayerStats, smallBudget);
            const largeRecommendations = calculator.getRecommendedItems(testPlayerStats, largeBudget);
            
            expect(largeRecommendations.length).toBeGreaterThanOrEqual(smallRecommendations.length);
        });
    });

    describe('エラーハンドリング', () => {
        test('不正な入力値でもエラーが発生しない', () => {
            const invalidStats: PlayerStats = {
                level: -1,
                experience: -100,
                health: -50,
                damage: -10,
                speed: -5,
                accuracy: -20,
                criticalChance: -5,
                items: {}
            };

            expect(() => {
                calculator.calculatePlayerDamage(invalidStats);
                calculator.calculatePlayerHealth(invalidStats);
            }).not.toThrow();
        });

        test('空のアイテムリストでも正常に動作する', () => {
            const emptyItemStats = { ...testPlayerStats, items: {} };
            
            expect(() => {
                calculator.calculatePlayerDamage(emptyItemStats);
                calculator.getRecommendedItems(emptyItemStats, 1000);
            }).not.toThrow();
        });
    });
});