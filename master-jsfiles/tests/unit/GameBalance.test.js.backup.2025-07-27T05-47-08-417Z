/**
 * ゲームバランステスト
 */

import { BALANCE_CONFIG, BalanceHelper } from '../../src/config/GameBalance.js';

describe('GameBalance', () => {
    describe('BALANCE_CONFIG', () => {
        test('should have all required scoring configurations', () => {
            expect(BALANCE_CONFIG.scoring).toBeDefined();
            expect(BALANCE_CONFIG.scoring.baseScores).toBeDefined();
            expect(BALANCE_CONFIG.scoring.combo).toBeDefined();
            expect(BALANCE_CONFIG.scoring.ageBonus).toBeDefined();
        });
        
        test('should have reasonable base scores', () => {
            const scores = BALANCE_CONFIG.scoring.baseScores;
            
            // 基本泡のスコアが適切な範囲内
            expect(scores.normal).toBeGreaterThan(10);
            expect(scores.normal).toBeLessThan(30);
            
            // 硬い泡ほど高スコア
            expect(scores.stone).toBeGreaterThan(scores.normal);
            expect(scores.iron).toBeGreaterThan(scores.stone);
            expect(scores.diamond).toBeGreaterThan(scores.iron);
            
            // ボス泡が最高スコア
            expect(scores.boss).toBeGreaterThan(scores.diamond);
        });
        
        test('should have balanced stage unlock requirements', () => {
            const requirements = BALANCE_CONFIG.stages.unlockRequirements;
            
            // 段階的な開放条件
            expect(requirements.hard).toBeLessThan(requirements.veryHard);
            expect(requirements.veryHard).toBeLessThan(requirements.special);
            expect(requirements.special).toBeLessThan(requirements.nightmare);
            
            // 最初のステージが手頃な条件
            expect(requirements.hard).toBeLessThanOrEqual(1000);
        });
        
        test('should have reasonable item costs', () => {
            const costs = BALANCE_CONFIG.items.baseCosts;
            
            // 全アイテムが購入可能な価格帯
            Object.values(costs).forEach(cost => {
                expect(cost).toBeGreaterThan(20);
                expect(cost).toBeLessThan(200);
            });
            
            // リセットアイテムが最安
            expect(costs.reset).toBeLessThan(costs.scoreMultiplier);
        });
    });
    
    describe('BalanceHelper', () => {
        test('should calculate score correctly', () => {
            // 基本スコア
            const normalScore = BalanceHelper.calculateScore('normal', 0.5);
            expect(normalScore).toBe(15); // 年齢ボーナスなし
            
            // 早期ボーナス
            const earlyScore = BalanceHelper.calculateScore('normal', 0.05);
            expect(earlyScore).toBe(30); // 2倍ボーナス
            
            // 破裂直前ボーナス
            const lateScore = BalanceHelper.calculateScore('normal', 0.95);
            expect(lateScore).toBe(45); // 3倍ボーナス
        });
        
        test('should calculate combo multiplier correctly', () => {
            expect(BalanceHelper.calculateComboMultiplier(1)).toBe(1);
            expect(BalanceHelper.calculateComboMultiplier(2)).toBeCloseTo(1.08);
            expect(BalanceHelper.calculateComboMultiplier(10)).toBeCloseTo(1.72);
            
            // 最大倍率チェック
            expect(BalanceHelper.calculateComboMultiplier(100)).toBe(2.5);
        });
        
        test('should calculate item cost correctly', () => {
            // レベル0（初回購入）
            const level0Cost = BalanceHelper.calculateItemCost('scoreMultiplier', 0);
            expect(level0Cost).toBe(75);
            
            // レベル1（2回目購入）
            const level1Cost = BalanceHelper.calculateItemCost('scoreMultiplier', 1);
            expect(level1Cost).toBe(Math.floor(75 * 1.3));
            
            // レベル2（3回目購入）
            const level2Cost = BalanceHelper.calculateItemCost('scoreMultiplier', 2);
            expect(level2Cost).toBe(Math.floor(75 * 1.3 * 1.3));
        });
        
        test('should check stage unlock correctly', () => {
            expect(BalanceHelper.isStageUnlocked('hard', 500)).toBe(true);
            expect(BalanceHelper.isStageUnlocked('hard', 499)).toBe(false);
            expect(BalanceHelper.isStageUnlocked('veryHard', 2000)).toBe(true);
            expect(BalanceHelper.isStageUnlocked('veryHard', 1999)).toBe(false);
        });
    });
    
    describe('Balance Validation', () => {
        test('should have consistent difficulty progression', () => {
            const difficulty = BALANCE_CONFIG.stages.difficulty;
            const stages = ['tutorial', 'normal', 'hard', 'veryHard', 'special', 'nightmare'];
            
            // spawn rate が段階的に増加
            for (let i = 1; i < stages.length; i++) {
                const current = difficulty[stages[i]];
                const previous = difficulty[stages[i - 1]];
                expect(current.spawnRate).toBeGreaterThanOrEqual(previous.spawnRate);
            }
        });
        
        test('should have reasonable bubble balance', () => {
            const bubbles = BALANCE_CONFIG.bubbles;
            
            // 生存時間が適切な範囲
            Object.values(bubbles.maxAge).forEach(age => {
                expect(age).toBeGreaterThan(5000);  // 最低5秒
                expect(age).toBeLessThan(40000);    // 最大40秒
            });
            
            // 耐久値が適切な範囲
            Object.values(bubbles.health).forEach(health => {
                expect(health).toBeGreaterThan(0);
                expect(health).toBeLessThanOrEqual(10);
            });
        });
        
        test('should have balanced special effects', () => {
            const effects = BALANCE_CONFIG.bubbles.specialEffects;
            
            // 回復量が適切
            expect(effects.pink.healAmount).toBeGreaterThan(15);
            expect(effects.pink.healAmount).toBeLessThan(50);
            
            // ダメージ量が適切
            expect(effects.poison.damageAmount).toBeGreaterThan(5);
            expect(effects.poison.damageAmount).toBeLessThan(15);
            
            // 連鎖範囲が適切
            expect(effects.spiky.chainRadius).toBeGreaterThan(80);
            expect(effects.spiky.chainRadius).toBeLessThan(200);
        });
    });
});