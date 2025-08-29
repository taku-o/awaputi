/**
 * Unit tests for PlayerData class
 * TypeScript移行 - Task 24対応
 */
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { PlayerData } from '../../src/core/PlayerData.js';

// Mock GameEngine
const mockGameEngine = {
  audioManager: {
    playLevelUpSound: jest.fn(),
    playHealSound: jest.fn(),
    playDamageSound: jest.fn()
  }
} as any;

describe('PlayerData', () => {
  let playerData: PlayerData;

  beforeEach(() => {
    playerData = new PlayerData(mockGameEngine);
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should initialize with default values', () => {
      expect(playerData.username).toBe('');
      expect(playerData.currentHP).toBe(100);
      expect(playerData.maxHP).toBe(100);
      expect(playerData.currentScore).toBe(0);
      expect(playerData.ap).toBe(0);
      expect(playerData.tap).toBe(0);
      expect(playerData.combo).toBe(0);
      expect(playerData.highScores).toEqual({});
      expect(playerData.unlockedStages).toEqual(['tutorial', 'normal']);
      expect(playerData.ownedItems).toEqual([]);
    });
  });

  describe('Score Management', () => {
    test('should add score correctly', () => {
      playerData.addScore(100);
      expect(playerData.currentScore).toBe(100);
    });

    test('should handle negative scores', () => {
      playerData.currentScore = 50;
      playerData.addScore(-30);
      expect(playerData.currentScore).toBe(20);
    });

    test('should not allow score to go below zero', () => {
      playerData.addScore(-100);
      expect(playerData.currentScore).toBe(0);
    });

    test('should update high score for stage', () => {
      playerData.updateHighScore('normal', 1500);
      expect(playerData.highScores.normal).toBe(1500);
    });

    test('should not update high score if current is lower', () => {
      playerData.highScores.normal = 2000;
      playerData.updateHighScore('normal', 1500);
      expect(playerData.highScores.normal).toBe(2000);
    });
  });

  describe('HP Management', () => {
    test('should take damage correctly', () => {
      const result = playerData.takeDamage(30);
      expect(playerData.currentHP).toBe(70);
      expect(result.died).toBe(false);
      expect(mockGameEngine.audioManager.playDamageSound).toHaveBeenCalled();
    });

    test('should not allow HP to go below zero', () => {
      const result = playerData.takeDamage(150);
      expect(playerData.currentHP).toBe(0);
      expect(result.died).toBe(true);
    });

    test('should heal correctly', () => {
      playerData.currentHP = 50;
      playerData.heal(30);
      expect(playerData.currentHP).toBe(80);
      expect(mockGameEngine.audioManager.playHealSound).toHaveBeenCalled();
    });

    test('should not heal above max HP', () => {
      playerData.currentHP = 90;
      playerData.heal(30);
      expect(playerData.currentHP).toBe(100);
    });

    test('should revive with revival item', () => {
      playerData.ownedItems = [{ id: 'revival', level: 1 }];
      playerData.currentHP = 0;

      const result = playerData.takeDamage(10); // Should trigger revival
      expect(result.revived).toBe(true);
      expect(playerData.currentHP).toBe(50); // Revival amount
    });
  });

  describe('Combo Management', () => {
    test('should increase combo correctly', () => {
      playerData.increaseCombo();
      expect(playerData.combo).toBe(1);
      playerData.increaseCombo();
      expect(playerData.combo).toBe(2);
    });

    test('should apply combo boost item', () => {
      playerData.ownedItems = [{ id: 'combo_boost', level: 2 }];
      playerData.increaseCombo();
      expect(playerData.combo).toBe(3); // 1 + 2 from item
    });

    test('should reset combo', () => {
      playerData.combo = 10;
      playerData.resetCombo();
      expect(playerData.combo).toBe(0);
    });

    test('should get combo multiplier correctly', () => {
      playerData.combo = 0;
      expect(playerData.getComboMultiplier()).toBe(1.0);

      playerData.combo = 10;
      expect(playerData.getComboMultiplier()).toBe(1.5);

      playerData.combo = 50;
      expect(playerData.getComboMultiplier()).toBe(3.5);

      playerData.combo = 100;
      expect(playerData.getComboMultiplier()).toBe(6.0);
    });
  });

  describe('Item Management', () => {
    test('should add item correctly', () => {
      const item = { id: 'shield', level: 1 };
      playerData.addItem(item);
      expect(playerData.ownedItems).toContainEqual(item);
    });

    test('should upgrade existing item', () => {
      playerData.ownedItems = [{ id: 'shield', level: 1 }];
      playerData.upgradeItem('shield');
      const item = playerData.ownedItems.find(i => i.id === 'shield');
      expect(item?.level).toBe(2);
    });

    test('should check item ownership', () => {
      playerData.ownedItems = [{ id: 'shield', level: 1 }];
      expect(playerData.hasItem('shield')).toBe(true);
      expect(playerData.hasItem('sword')).toBe(false);
    });

    test('should get item level correctly', () => {
      playerData.ownedItems = [{ id: 'shield', level: 3 }];
      expect(playerData.getItemLevel('shield')).toBe(3);
      expect(playerData.getItemLevel('sword')).toBe(0);
    });
  });

  describe('Stage Management', () => {
    test('should check stage unlock status', () => {
      expect(playerData.isStageUnlocked('tutorial')).toBe(true);
      expect(playerData.isStageUnlocked('normal')).toBe(true);
      expect(playerData.isStageUnlocked('hard')).toBe(false);
    });

    test('should unlock stage correctly', () => {
      playerData.unlockStage('hard');
      expect(playerData.unlockedStages).toContain('hard');
      expect(playerData.isStageUnlocked('hard')).toBe(true);
    });

    test('should not duplicate unlocked stages', () => {
      playerData.unlockStage('normal'); // Already unlocked
      const normalCount = playerData.unlockedStages.filter(s => s === 'normal').length;
      expect(normalCount).toBe(1);
    });
  });

  describe('Save and Load', () => {
    test('should save data to localStorage', () => {
      playerData.username = 'TestPlayer';
      playerData.currentScore = 1000;
      playerData.save();

      const saved = JSON.parse(localStorage.getItem('playerData') || '{}');
      expect(saved.username).toBe('TestPlayer');
      expect(saved.currentScore).toBe(1000);
    });

    test('should load data from localStorage', () => {
      const testData = {
        username: 'LoadedPlayer',
        currentScore: 2000,
        currentHP: 80,
        highScores: { normal: 5000 }
      };
      localStorage.setItem('playerData', JSON.stringify(testData));

      playerData.load();
      expect(playerData.username).toBe('LoadedPlayer');
      expect(playerData.currentScore).toBe(2000);
      expect(playerData.currentHP).toBe(80);
      expect(playerData.highScores.normal).toBe(5000);
    });

    test('should handle corrupted save data', () => {
      localStorage.setItem('playerData', 'invalid json');
      
      // Should not throw
      expect(() => playerData.load()).not.toThrow();
      
      // Should maintain defaults
      expect(playerData.username).toBe('');
      expect(playerData.currentScore).toBe(0);
    });
  });

  describe('Reset', () => {
    test('should reset game state', () => {
      playerData.currentScore = 1000;
      playerData.currentHP = 50;
      playerData.combo = 10;

      playerData.resetGameState();
      expect(playerData.currentScore).toBe(0);
      expect(playerData.currentHP).toBe(100);
      expect(playerData.combo).toBe(0);
    });

    test('should reset all data', () => {
      playerData.username = 'TestPlayer';
      playerData.highScores = { normal: 5000 };
      playerData.unlockedStages = ['tutorial', 'normal', 'hard'];
      playerData.ownedItems = [{ id: 'shield', level: 1 }];

      playerData.resetAllData();
      expect(playerData.username).toBe('');
      expect(playerData.highScores).toEqual({});
      expect(playerData.unlockedStages).toEqual(['tutorial', 'normal']);
      expect(playerData.ownedItems).toEqual([]);
    });
  });
});