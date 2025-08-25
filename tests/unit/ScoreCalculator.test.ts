/**
 * ScoreCalculator のテスト
 */
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { ScoreCalculator } from '../../src/core/ScoreCalculator.js';

// Type definitions
interface ScoreConfig {
    baseScores: {
        normal: number;
        stone: number;
        iron: number;
        diamond: number;
        rainbow: number;
        pink: number;
        clock: number;
        electric: number;
        poison: number;
        spiky: number;
        cracked: number;
        escaping: number;
        boss: number;
        score: number;
    };
    combo: {
        multiplierIncrement: number;
        maxMultiplier: number;
        bonusInterval: number;
        bonusMultiplier: number;
        baseTimeout: number;
    };
    ageBonus: {
        earlyBonus: number;
        lateBonus: number;
        midBonus: number;
    };
}

interface MockGameConfig {
    getScoreConfig(): ScoreConfig;
}

interface ScoreCalculationParams {
    bubbleType: string;
    ageRatio?: number;
    comboCount?: number;
    specialMultiplier?: number;
    itemMultiplier?: number;
}

interface ScoreResult {
    baseScore: number;
    multipliers: {
        combo: number;
        total: number;
    };
    finalScore: number;
    comboBonus: number;
}

interface ScoreHistoryItem {
    finalScore: number;
    multipliers: {
        combo: number;
    };
    comboBonus: number;
}

interface ScoreStatistics {
    total: number;
    average: number;
    highest: number;
    lowest: number;
    comboCount: number;
    bonusCount: number;
    totalEntries: number;
}

interface BubbleInfo {
    type: string;
    ageRatio: number;
}

interface GameState {
    currentCombo?: number;
    availableBubbles?: BubbleInfo[];
    timeRemaining?: number;
    currentScore?: number;
}

interface RecommendedStrategy {
    priority: string;
    reasoning: string;
    targetBubbles: BubbleInfo[];
}

interface DebugInfo {
    hasGameConfig: boolean;
    scoreConfig: ScoreConfig;
    version: string;
}

// モックGameConfig
class MockGameConfig implements MockGameConfig {
    getScoreConfig(): ScoreConfig {
        return {
            baseScores: {
                normal: 15,
                stone: 35,
                iron: 65,
                diamond: 120,
                rainbow: 400,
                pink: 25,
                clock: 180,
                electric: 20,
                poison: 8,
                spiky: 85,
                cracked: 30,
                escaping: 50,
                boss: 800,
                score: 250
            },
            combo: {
                multiplierIncrement: 0.08,
                maxMultiplier: 2.5,
                bonusInterval: 5,
                bonusMultiplier: 8,
                baseTimeout: 2000
            },
            ageBonus: {
                earlyBonus: 2.0,
                lateBonus: 3.0,
                midBonus: 1.5
            }
        };
    }
}

describe('ScoreCalculator', () => {
    let calculator: ScoreCalculator;
    let mockGameConfig: MockGameConfig;
    
    beforeEach(() => {
        mockGameConfig = new MockGameConfig();
        calculator = new ScoreCalculator(mockGameConfig);
    });
    
    describe('基本機能', () => {
        test('should initialize correctly', () => {
            expect(calculator).toBeInstanceOf(ScoreCalculator);
            expect(calculator.getDebugInfo().hasGameConfig).toBe(true);
        });
        
        test('should work without GameConfig', () => {
            const calculatorWithoutConfig = new ScoreCalculator();
            expect(calculatorWithoutConfig.getDebugInfo().hasGameConfig).toBe(false);
            // デフォルト設定で動作することを確認
            const score = calculatorWithoutConfig.calculateBaseScore('normal');
            expect(score).toBe(15);
        })
    });
    
    describe('基本スコア計算', () => {
        test('should calculate base score correctly', () => {
            expect(calculator.calculateBaseScore('normal')).toBe(15);
            expect(calculator.calculateBaseScore('stone')).toBe(35);
            expect(calculator.calculateBaseScore('diamond')).toBe(120);
            expect(calculator.calculateBaseScore('rainbow')).toBe(400);
        });
        
        test('should use default score for unknown bubble type', () => {
            expect(calculator.calculateBaseScore('unknown')).toBe(15);
        });
        
        test('should apply age bonus correctly', () => {
            // 発生直後ボーナス（2倍）
            expect(calculator.calculateBaseScore('normal', 0.05)).toBe(30);
            // 破裂直前ボーナス（3倍）
            expect(calculator.calculateBaseScore('normal', 0.95)).toBe(45);
            // 中盤ボーナス（1.5倍）
            expect(calculator.calculateBaseScore('normal', 0.6)).toBe(22);
            // 通常倍率
            expect(calculator.calculateBaseScore('normal', 0.3)).toBe(15);
        })
    });
    
    describe('年齢ボーナス計算', () => {
        test('should calculate age bonus correctly', () => {
            expect(calculator.calculateAgeBonus(0.05)).toBe(2.0);  // 早期ボーナス
            expect(calculator.calculateAgeBonus(0.95)).toBe(3.0);  // 破裂直前ボーナス
            expect(calculator.calculateAgeBonus(0.6)).toBe(1.5);   // 中盤ボーナス
            expect(calculator.calculateAgeBonus(0.3)).toBe(1.0);   // 通常
        });
        
        test('should handle invalid age ratio', () => {
            expect(calculator.calculateAgeBonus(-0.1)).toBe(1.0);  // 0として扱われる（通常倍率）
            expect(calculator.calculateAgeBonus(1.5)).toBe(1.0);   // 0として扱われる（通常倍率）
        })
    });
    
    describe('コンボ計算', () => {
        test('should calculate combo multiplier correctly', () => {
            expect(calculator.calculateComboMultiplier(1)).toBe(1.0);
            expect(calculator.calculateComboMultiplier(2)).toBeCloseTo(1.08);
            expect(calculator.calculateComboMultiplier(10)).toBeCloseTo(1.72);
            // 最大倍率チェック
            expect(calculator.calculateComboMultiplier(100)).toBe(2.5);
        });
        
        test('should calculate combo bonus correctly', () => {
            expect(calculator.calculateComboBonus(4)).toBe(0);   // 5の倍数でない
            expect(calculator.calculateComboBonus(5)).toBe(40);  // 5 * 8
            expect(calculator.calculateComboBonus(10)).toBe(80); // 10 * 8
            expect(calculator.calculateComboBonus(0)).toBe(0);   // 0コンボ
        })
    });
    
    describe('総合スコア計算', () => {
        test('should calculate total score correctly', () => {
            const result: ScoreResult = calculator.calculateTotalScore({
                bubbleType: 'normal',
                ageRatio: 0.5,
                comboCount: 2,
                specialMultiplier: 1.5,
                itemMultiplier: 1.2
            });
            
            expect(result.baseScore).toBe(22); // 15 * 1.5 (中盤ボーナス)
            expect(result.multipliers.combo).toBeCloseTo(1.08);
            expect(result.multipliers.total).toBeCloseTo(1.944); // 1.08 * 1.5 * 1.2
            expect(result.finalScore).toBe(42); // Math.floor(22 * 1.944)
            expect(result.comboBonus).toBe(0); // 2コンボなのでボーナスなし
        });
        
        test('should handle missing parameters with defaults', () => {
            const result: ScoreResult = calculator.calculateTotalScore({
                bubbleType: 'stone'
            });
            
            expect(result.baseScore).toBe(35);
            expect(result.multipliers.combo).toBe(1.0);
            expect(result.multipliers.total).toBe(1.0);
            expect(result.finalScore).toBe(35);
            expect(result.comboBonus).toBe(0);
        });
        
        test('should include combo bonus in calculation', () => {
            const result: ScoreResult = calculator.calculateTotalScore({
                bubbleType: 'normal',
                comboCount: 5
            });
            
            expect(result.comboBonus).toBe(40); // 5 * 8
        })
    });
    
    describe('特殊泡ボーナス計算', () => {
        test('should calculate rainbow bubble bonus', () => {
            expect(calculator.calculateSpecialBubbleBonus('rainbow', { bonusTimeActive: true })).toBe(200);
            expect(calculator.calculateSpecialBubbleBonus('rainbow', { bonusTimeActive: false })).toBe(0);
        });
        
        test('should calculate spiky bubble bonus', () => {
            expect(calculator.calculateSpecialBubbleBonus('spiky', { chainCount: 3 })).toBe(60);
            expect(calculator.calculateSpecialBubbleBonus('spiky', {})).toBe(0);
        });
        
        test('should calculate score bubble bonus', () => {
            expect(calculator.calculateSpecialBubbleBonus('score', { bonusScore: 100 })).toBe(100);
            expect(calculator.calculateSpecialBubbleBonus('score', {})).toBe(80); // デフォルト
        });
        
        test('should calculate boss bubble bonus', () => {
            expect(calculator.calculateSpecialBubbleBonus('boss', { healthRatio: 0.5 })).toBe(80);
            expect(calculator.calculateSpecialBubbleBonus('boss', {})).toBe(0); // 満タン時
        });
        
        test('should return 0 for unknown bubble types', () => {
            expect(calculator.calculateSpecialBubbleBonus('unknown', {})).toBe(0);
        })
    });
    
    describe('統計計算', () => {
        test('should calculate score statistics correctly', () => {
            const scoreHistory: ScoreHistoryItem[] = [
                { finalScore: 100, multipliers: { combo: 1.0 }, comboBonus: 0 },
                { finalScore: 150, multipliers: { combo: 1.2 }, comboBonus: 40 },
                { finalScore: 200, multipliers: { combo: 1.5 }, comboBonus: 0 },
                { finalScore: 80, multipliers: { combo: 1.0 }, comboBonus: 0 }
            ];
            
            const stats: ScoreStatistics = calculator.calculateScoreStatistics(scoreHistory);
            expect(stats.total).toBe(530);
            expect(stats.average).toBe(132);
            expect(stats.highest).toBe(200);
            expect(stats.lowest).toBe(80);
            expect(stats.comboCount).toBe(2); // combo > 1のもの
            expect(stats.bonusCount).toBe(1); // comboBonus > 0のもの
            expect(stats.totalEntries).toBe(4);
        });
        
        test('should handle empty score history', () => {
            const stats: ScoreStatistics = calculator.calculateScoreStatistics([]);
            expect(stats.total).toBe(0);
            expect(stats.average).toBe(0);
            expect(stats.highest).toBe(0);
            expect(stats.lowest).toBe(0);
            expect(stats.comboCount).toBe(0);
            expect(stats.bonusCount).toBe(0);
        });
        
        test('should handle invalid input', () => {
            const stats: ScoreStatistics = calculator.calculateScoreStatistics(null);
            expect(stats.total).toBe(0);
        })
    });
    
    describe('スコア効率計算', () => {
        test('should calculate score efficiency correctly', () => {
            expect(calculator.calculateScoreEfficiency(1000, 10000)).toBe(100); // 100点/秒
            expect(calculator.calculateScoreEfficiency(500, 5000)).toBe(100);   // 100点/秒
        });
        
        test('should handle zero or negative time', () => {
            expect(calculator.calculateScoreEfficiency(1000, 0)).toBe(0);
            expect(calculator.calculateScoreEfficiency(1000, -1000)).toBe(0);
        })
    });
    
    describe('推奨戦略計算', () => {
        test('should recommend combo strategy for high combo', () => {
            const gameState: GameState = {
                currentCombo: 5,
                availableBubbles: [
                    { type: 'normal', ageRatio: 0.5 },
                    { type: 'stone', ageRatio: 0.3 }
                ],
                timeRemaining: 60000,
                currentScore: 1000
            };
            
            const strategy: RecommendedStrategy = calculator.calculateRecommendedStrategy(gameState);
            expect(strategy.priority).toBe('combo');
            expect(strategy.reasoning).toContain('高コンボ継続を優先')
        });
        
        test('should recommend high score strategy for low time', () => {
            const gameState: GameState = {
                currentCombo: 1,
                availableBubbles: [
                    { type: 'normal', ageRatio: 0.5 },
                    { type: 'diamond', ageRatio: 0.3 }
                ],
                timeRemaining: 20000, // 20秒
                currentScore: 1000
            };
            
            const strategy: RecommendedStrategy = calculator.calculateRecommendedStrategy(gameState);
            expect(strategy.priority).toBe('highScore');
            expect(strategy.reasoning).toContain('時間切れ前の高得点狙い')
        });
        
        test('should sort target bubbles by expected score', () => {
            const gameState: GameState = {
                availableBubbles: [
                    { type: 'normal', ageRatio: 0.5 },
                    { type: 'diamond', ageRatio: 0.3 },
                    { type: 'stone', ageRatio: 0.2 }
                ]
            };
            
            const strategy: RecommendedStrategy = calculator.calculateRecommendedStrategy(gameState);
            expect(strategy.targetBubbles[0].type).toBe('diamond'); // 最高得点
            expect(strategy.targetBubbles[1].type).toBe('stone');
            expect(strategy.targetBubbles[2].type).toBe('normal');
        })
    });
    
    describe('デバッグ機能', () => {
        test('should provide debug information', () => {
            const debugInfo: DebugInfo = calculator.getDebugInfo();
            expect(debugInfo).toHaveProperty('hasGameConfig');
            expect(debugInfo).toHaveProperty('scoreConfig');
            expect(debugInfo).toHaveProperty('version');
            expect(debugInfo.hasGameConfig).toBe(true);
            expect(debugInfo.version).toBe('1.0.0');
        })
    })
});