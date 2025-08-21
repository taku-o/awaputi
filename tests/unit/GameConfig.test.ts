/**
 * GameConfig クラスの単体テスト
 */
import { jest  } from '@jest/globals';
import { GameConfig, getGameConfig  } from '../../src/config/GameConfig.js';
// Types
interface AgeBonusConfig {
    earlyBonus: number,
    lateBonus: number;
    midBonus: number;
interface ComboConfig {
    multiplierIncrement: number,
    maxMultiplier: number;
interface MockConfigManager {
    get: jest.Mock<(categor,y: string, key: string, defaultValue?: any) => any> }
interface MockGameConfig extends GameConfig {
    getAgeBonusConfig: jest.Mock<() => AgeBonusConfig> | (() => AgeBonusConfig},
    getBubbleBaseScore: jest.Mock<(bubbleType: string) => number> | (() => number},
    getComboConfig: jest.Mock<() => ComboConfig> | (() => ComboConfig),
    getItemBaseCost: jest.Mock<(itemId: string) => number> | (() => number},
    getStageUnlockRequirement: jest.Mock<(stageId: string) => number> | ((stageId: string') => number},'
    configManager: MockConfigManager,
describe('GameConfig', (') => {'
    describe('計算メソッド', (') => {'
        test('calculateScore(')は泡タイプと年齢比率に基づいてスコアを計算する', () => {'
            const gameConfig = new GameConfig() as MockGameConfig,
            
            // モックメソッド
            gameConfig.getAgeBonusConfig = () => ({
                earlyBonus: 2.0,
                lateBonus: 3.0,
                midBonus: 1.5
            };
            gameConfig.getBubbleBaseScore = (') => 15;'
            
            // 早期クリック（10%以内）
            expect(gameConfig.calculateScore('normal', 0.05).toBe(30');  // 15 * 2.0'
            
            // 遅延クリック（90%以上）
            expect(gameConfig.calculateScore('normal', 0.95).toBe(45');  // 15 * 3.0'
            
            // 中盤クリック（50-70%）
            expect(gameConfig.calculateScore('normal', 0.6).toBe(22');   // 15 * 1.5'
            
            // 通常クリック
            expect(gameConfig.calculateScore('normal', 0.4).toBe(15);   // 15 * 1.0
        }');'
        test('calculateComboMultiplier(')はコンボ数に基づいて倍率を計算する', () => {'
            const gameConfig = new GameConfig() as MockGameConfig,
            
            // モックメソッド
            gameConfig.getComboConfig = () => ({
                multiplierIncrement: 0.08,
                maxMultiplier: 2.5
            };
            // コンボなし
            expect(gameConfig.calculateComboMultiplier(1).toBe(1);
            // 5コンボ
            expect(gameConfig.calculateComboMultiplier(5).toBe(1.32);  // 1 + (5-1) * 0.08
            
            // 最大倍率を超えるコンボ
            expect(gameConfig.calculateComboMultiplier(30).toBe(2.5);  // maxMultiplier
        }');'
        test('calculateItemCost(')はアイテムIDとレベルに基づいてコストを計算する', () => {'
            const gameConfig = new GameConfig() as MockGameConfig,
            
            // モックメソッド
            gameConfig.getItemBaseCost = () => 75,
            gameConfig.configManager = {
                get: jest.fn(() => 1.3)  // costMultiplier
    }');'
            // レベル0（初期購入）
            expect(gameConfig.calculateItemCost('scoreMultiplier', 0).toBe(75');  // 75 * 1.3^0'
            
            // レベル1
            expect(gameConfig.calculateItemCost('scoreMultiplier', 1).toBe(97');  // 75 * 1.3^1 = 97.5 -> 97'
            
            // レベル2
            expect(gameConfig.calculateItemCost('scoreMultiplier', 2).toBe(126); // 75 * 1.3^2 = 126.75 -> 126
        )');'
        test('isStageUnlocked(')はプレイヤーのTAP値に基づいてステージ開放状態を返す', () => {'
            const gameConfig = new GameConfig() as MockGameConfig,
            
            // モックメソッド - 呼び出し回数を追跡
            let callCount = 0,
            gameConfig.getStageUnlockRequirement = (stageId: string'): number => {'
                if (stageId === 'hard') return 500,
                if (stageId === 'veryHard') return 2000,
                return 0,
            '),'
            // 開放済み
            expect(gameConfig.isStageUnlocked('hard', 600).toBe(true'),'
            // 未開放
            expect(gameConfig.isStageUnlocked('veryHard', 1500).toBe(false) }');'
    }
    describe('シングルトンパターン', (') => {'
        test('getGameConfig(')は常に同じインスタンスを返す', () => {'
            const instance1 = getGameConfig();
            const instance2 = getGameConfig();
            expect(instance1).toBe(instance2) }
    }
}');'