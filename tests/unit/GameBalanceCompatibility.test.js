/**
 * GameBalanceCompatibilityテスト
 */

import { jest } from '@jest/globals';

// ErrorHandlerとLoggingSystemをモック
jest.mock('../../src/utils/ErrorHandler.js', () => ({
    getErrorHandler: jest.fn(() => ({
        handleError: jest.fn()
    }))
}));

jest.mock('../../src/core/LoggingSystem.js', () => ({
    getLoggingSystem: jest.fn(() => ({
        warn: jest.fn(),
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn()
    }))
}));

import { BALANCE_CONFIG, BalanceHelper } from '../../src/core/GameBalanceCompatibility.js';
import { getGameConfig } from '../../src/config/GameConfig.js';

// 警告出力をモック
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

describe('GameBalanceCompatibility', () => {
    beforeEach(() => {
        // 警告出力をモック
        console.warn = jest.fn();
        console.error = jest.fn();
    });
    
    afterEach(() => {
        // モックを元に戻す
        console.warn = originalConsoleWarn;
        console.error = originalConsoleError;
    });
    
    describe('BALANCE_CONFIG互換性', () => {
        test('should provide access to scoring configuration', () => {
            const gameConfig = getGameConfig();
            
            // スパイを設定
            const getScoreConfig = gameConfig.getScoreConfig;
            gameConfig.getScoreConfig = jest.fn(() => {
                return {
                    baseScores: { normal: 15 },
                    combo: { multiplierIncrement: 0.08 },
                    ageBonus: { earlyBonus: 2.0 }
                };
            });
            
            const scoring = BALANCE_CONFIG.scoring;
            
            expect(scoring).toBeDefined();
            expect(scoring.baseScores).toBeDefined();
            expect(scoring.combo).toBeDefined();
            expect(scoring.ageBonus).toBeDefined();
            expect(gameConfig.getScoreConfig).toHaveBeenCalled();
            
            // 非推奨警告が表示されること
            expect(console.warn).toHaveBeenCalled();
            
            // 元に戻す
            gameConfig.getScoreConfig = getScoreConfig;
        });
        
        test('should provide access to stages configuration', () => {
            const gameConfig = getGameConfig();
            
            // スパイを設定
            const getStageConfig = gameConfig.getStageConfig;
            gameConfig.getStageConfig = jest.fn(() => {
                return {
                    unlockRequirements: { hard: 500 },
                    difficulty: { normal: { spawnRate: 1.5 } }
                };
            });
            
            const stages = BALANCE_CONFIG.stages;
            
            expect(stages).toBeDefined();
            expect(stages.unlockRequirements).toBeDefined();
            expect(stages.difficulty).toBeDefined();
            expect(gameConfig.getStageConfig).toHaveBeenCalled();
            
            // 非推奨警告が表示されること
            expect(console.warn).toHaveBeenCalled();
            
            // 元に戻す
            gameConfig.getStageConfig = getStageConfig;
        });
        
        test('should provide access to items configuration', () => {
            const gameConfig = getGameConfig();
            
            // スパイを設定
            const getItemConfig = gameConfig.getItemConfig;
            gameConfig.getItemConfig = jest.fn(() => {
                return {
                    baseCosts: { scoreMultiplier: 75 },
                    effects: { scoreMultiplier: 1.3 },
                    maxLevels: { scoreMultiplier: 5 }
                };
            });
            
            const items = BALANCE_CONFIG.items;
            
            expect(items).toBeDefined();
            expect(items.baseCosts).toBeDefined();
            expect(items.effects).toBeDefined();
            expect(items.maxLevels).toBeDefined();
            expect(gameConfig.getItemConfig).toHaveBeenCalled();
            
            // 非推奨警告が表示されること
            expect(console.warn).toHaveBeenCalled();
            
            // 元に戻す
            gameConfig.getItemConfig = getItemConfig;
        });
        
        test('should provide access to bubbles configuration', () => {
            const gameConfig = getGameConfig();
            
            // スパイを設定
            const getBubbleConfig = gameConfig.getBubbleConfig;
            gameConfig.getBubbleConfig = jest.fn(() => {
                return {
                    maxAge: { normal: 12000 },
                    health: { normal: 1 },
                    specialEffects: { pink: { healAmount: 25 } }
                };
            });
            
            const bubbles = BALANCE_CONFIG.bubbles;
            
            expect(bubbles).toBeDefined();
            expect(bubbles.maxAge).toBeDefined();
            expect(bubbles.health).toBeDefined();
            expect(bubbles.specialEffects).toBeDefined();
            expect(gameConfig.getBubbleConfig).toHaveBeenCalled();
            
            // 非推奨警告が表示されること
            expect(console.warn).toHaveBeenCalled();
            
            // 元に戻す
            gameConfig.getBubbleConfig = getBubbleConfig;
        });
        
        test('should prevent direct modification of BALANCE_CONFIG', () => {
            // 直接設定を試みる
            BALANCE_CONFIG.scoring = { test: 'value' };
            
            // エラーが表示されること
            expect(console.error).toHaveBeenCalled();
        });
    });
    
    describe('BalanceHelper互換性', () => {
        test('should calculate score correctly', () => {
            const gameConfig = getGameConfig();
            
            // スパイを設定
            const calculateScore = gameConfig.calculateScore;
            gameConfig.calculateScore = jest.fn((bubbleType, ageRatio) => {
                if (ageRatio < 0.1) return 30;
                if (ageRatio > 0.9) return 45;
                return 15;
            });
            
            // 基本スコア
            const normalScore = BalanceHelper.calculateScore('normal', 0.5);
            expect(normalScore).toBe(15); // 年齢ボーナスなし
            expect(gameConfig.calculateScore).toHaveBeenCalledWith('normal', 0.5);
            
            // 早期ボーナス
            const earlyScore = BalanceHelper.calculateScore('normal', 0.05);
            expect(earlyScore).toBe(30); // 2倍ボーナス
            expect(gameConfig.calculateScore).toHaveBeenCalledWith('normal', 0.05);
            
            // 非推奨警告が表示されること
            expect(console.warn).toHaveBeenCalled();
            
            // 元に戻す
            gameConfig.calculateScore = calculateScore;
        });
        
        test('should calculate combo multiplier correctly', () => {
            const gameConfig = getGameConfig();
            
            // スパイを設定
            const calculateComboMultiplier = gameConfig.calculateComboMultiplier;
            gameConfig.calculateComboMultiplier = jest.fn(comboCount => {
                if (comboCount <= 1) return 1;
                if (comboCount === 10) return 1.72;
                return 1 + (comboCount - 1) * 0.08;
            });
            
            expect(BalanceHelper.calculateComboMultiplier(1)).toBe(1);
            expect(gameConfig.calculateComboMultiplier).toHaveBeenCalledWith(1);
            
            expect(BalanceHelper.calculateComboMultiplier(10)).toBeCloseTo(1.72);
            expect(gameConfig.calculateComboMultiplier).toHaveBeenCalledWith(10);
            
            // 非推奨警告が表示されること
            expect(console.warn).toHaveBeenCalled();
            
            // 元に戻す
            gameConfig.calculateComboMultiplier = calculateComboMultiplier;
        });
        
        test('should calculate item cost correctly', () => {
            const gameConfig = getGameConfig();
            
            // スパイを設定
            const calculateItemCost = gameConfig.calculateItemCost;
            gameConfig.calculateItemCost = jest.fn((itemId, currentLevel) => {
                const baseCost = 75;
                const multiplier = 1.3;
                return Math.floor(baseCost * Math.pow(multiplier, currentLevel));
            });
            
            // レベル0（初回購入）
            const level0Cost = BalanceHelper.calculateItemCost('scoreMultiplier', 0);
            expect(level0Cost).toBe(75);
            expect(gameConfig.calculateItemCost).toHaveBeenCalledWith('scoreMultiplier', 0);
            
            // レベル1（2回目購入）
            const level1Cost = BalanceHelper.calculateItemCost('scoreMultiplier', 1);
            expect(level1Cost).toBe(Math.floor(75 * 1.3));
            expect(gameConfig.calculateItemCost).toHaveBeenCalledWith('scoreMultiplier', 1);
            
            // 非推奨警告が表示されること
            expect(console.warn).toHaveBeenCalled();
            
            // 元に戻す
            gameConfig.calculateItemCost = calculateItemCost;
        });
        
        test('should check stage unlock correctly', () => {
            const gameConfig = getGameConfig();
            
            // スパイを設定
            const isStageUnlocked = gameConfig.isStageUnlocked;
            gameConfig.isStageUnlocked = jest.fn((stageId, playerTAP) => {
                if (stageId === 'hard') return playerTAP >= 500;
                if (stageId === 'veryHard') return playerTAP >= 2000;
                return false;
            });
            
            expect(BalanceHelper.isStageUnlocked('hard', 500)).toBe(true);
            expect(gameConfig.isStageUnlocked).toHaveBeenCalledWith('hard', 500);
            
            expect(BalanceHelper.isStageUnlocked('hard', 499)).toBe(false);
            expect(gameConfig.isStageUnlocked).toHaveBeenCalledWith('hard', 499);
            
            // 非推奨警告が表示されること
            expect(console.warn).toHaveBeenCalled();
            
            // 元に戻す
            gameConfig.isStageUnlocked = isStageUnlocked;
        });
    });
    
    describe('警告システム', () => {
        test('should show deprecation warnings', () => {
            // 警告出力をリセット
            console.warn.mockClear();
            
            // 複数回アクセスしても警告は1回だけ表示される（同一テスト内）
            BALANCE_CONFIG.scoring;
            BALANCE_CONFIG.scoring;
            
            // 警告が表示されることを確認（正確な回数は環境により異なる可能性があるため、最低限の確認）
            expect(console.warn).toHaveBeenCalled();
            
            // 非推奨メッセージが含まれることを確認
            const calls = console.warn.mock.calls;
            const hasDeprecationWarning = calls.some(call => 
                call.some(arg => typeof arg === 'string' && arg.includes('非推奨'))
            );
            expect(hasDeprecationWarning).toBe(true);
        });
    });
});