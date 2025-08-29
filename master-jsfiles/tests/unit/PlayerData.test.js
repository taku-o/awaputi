/**
 * Unit tests for PlayerData class
 */

import { PlayerData } from '../../src/core/PlayerData.js';

// Mock GameEngine
const mockGameEngine = {
  audioManager: {
    playLevelUpSound: jest.fn(),
    playHealSound: jest.fn(),
    playDamageSound: jest.fn()
  }
};

describe('PlayerData', () => {
  let playerData;

  beforeEach(() => {
    playerData = new PlayerData(mockGameEngine);
    localStorage.clear();
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
      expect(playerData.currentHP).toBe(100);
    });
  });

  describe('AP and TAP Management', () => {
    test('should convert score to AP on game over', () => {
      playerData.currentScore = 1000;
      playerData.onGameOver();
      
      expect(playerData.ap).toBe(10); // 1000 / 100 = 10 AP
      expect(playerData.tap).toBe(10);
    });

    test('should spend AP correctly', () => {
      playerData.ap = 100;
      const result = playerData.spendAP(30);
      
      expect(result).toBe(true);
      expect(playerData.ap).toBe(70);
    });

    test('should not spend more AP than available', () => {
      playerData.ap = 20;
      const result = playerData.spendAP(30);
      
      expect(result).toBe(false);
      expect(playerData.ap).toBe(20);
    });
  });

  describe('Combo System', () => {
    test('should increment combo', () => {
      playerData.incrementCombo();
      expect(playerData.combo).toBe(1);
    });

    test('should reset combo', () => {
      playerData.combo = 10;
      playerData.resetCombo();
      expect(playerData.combo).toBe(0);
    });

    test('should get combo multiplier', () => {
      playerData.combo = 5;
      expect(playerData.getComboMultiplier()).toBe(1.5); // 1 + 0.1 * 5
      
      playerData.combo = 15;
      expect(playerData.getComboMultiplier()).toBe(2.5); // 1 + 0.1 * 15
    });

    test('should cap combo multiplier', () => {
      playerData.combo = 50;
      expect(playerData.getComboMultiplier()).toBe(3); // Capped at 3x
    });
  });

  describe('Stage Management', () => {
    test('should unlock stage', () => {
      playerData.unlockStage('hard');
      expect(playerData.unlockedStages).toContain('hard');
    });

    test('should not duplicate unlocked stages', () => {
      playerData.unlockStage('normal'); // Already unlocked
      expect(playerData.unlockedStages.filter(s => s === 'normal')).toHaveLength(1);
    });

    test('should check if stage is unlocked', () => {
      expect(playerData.isStageUnlocked('normal')).toBe(true);
      expect(playerData.isStageUnlocked('boss')).toBe(false);
    });
  });

  describe('Item Management', () => {
    test('should add item', () => {
      playerData.addItem('scoreMultiplier', 1);
      expect(playerData.ownedItems).toContainEqual({ id: 'scoreMultiplier', level: 1 });
    });

    test('should upgrade existing item', () => {
      playerData.ownedItems = [{ id: 'scoreMultiplier', level: 1 }];
      playerData.addItem('scoreMultiplier', 2);
      
      const item = playerData.ownedItems.find(i => i.id === 'scoreMultiplier');
      expect(item.level).toBe(2);
    });

    test('should check if item is owned', () => {
      playerData.ownedItems = [{ id: 'revival', level: 1 }];
      expect(playerData.hasItem('revival')).toBe(true);
      expect(playerData.hasItem('scoreMultiplier')).toBe(false);
    });

    test('should get item level', () => {
      playerData.ownedItems = [{ id: 'revival', level: 3 }];
      expect(playerData.getItemLevel('revival')).toBe(3);
      expect(playerData.getItemLevel('nonexistent')).toBe(0);
    });
  });

  describe('Data Persistence', () => {
    test('should save data to localStorage', () => {
      playerData.username = 'TestUser';
      playerData.currentScore = 1000;
      playerData.ap = 50;
      
      playerData.save();
      
      const savedData = JSON.parse(localStorage.getItem('bubblePop_playerData'));
      expect(savedData.username).toBe('TestUser');
      expect(savedData.currentScore).toBe(1000);
      expect(savedData.ap).toBe(50);
    });

    test('should load data from localStorage', () => {
      const testData = {
        username: 'LoadedUser',
        currentScore: 2000,
        ap: 75,
        tap: 500,
        highScores: { normal: 1500 },
        unlockedStages: ['tutorial', 'normal', 'hard'],
        ownedItems: [{ id: 'revival', level: 1 }]
      };
      
      localStorage.setItem('bubblePop_playerData', JSON.stringify(testData));
      
      playerData.load();
      
      expect(playerData.username).toBe('LoadedUser');
      expect(playerData.currentScore).toBe(2000);
      expect(playerData.ap).toBe(75);
      expect(playerData.tap).toBe(500);
      expect(playerData.highScores.normal).toBe(1500);
      expect(playerData.unlockedStages).toContain('hard');
      expect(playerData.ownedItems).toContainEqual({ id: 'revival', level: 1 });
    });

    test('should handle corrupted save data', () => {
      localStorage.setItem('bubblePop_playerData', 'invalid json');
      
      expect(() => playerData.load()).not.toThrow();
      expect(playerData.username).toBe(''); // Should use defaults
    });

    test('should reset all data', () => {
      playerData.username = 'TestUser';
      playerData.currentScore = 1000;
      playerData.ap = 50;
      
      playerData.reset();
      
      expect(playerData.username).toBe('');
      expect(playerData.currentScore).toBe(0);
      expect(playerData.ap).toBe(0);
      expect(localStorage.getItem('bubblePop_playerData')).toBeNull();
    });
  });

  describe('Statistics', () => {
    test('should get player statistics', () => {
      playerData.currentScore = 1500;
      playerData.ap = 75;
      playerData.tap = 500;
      playerData.highScores = { normal: 2000, hard: 1000 };
      playerData.combo = 10;
      
      const stats = playerData.getStats();
      
      expect(stats.currentScore).toBe(1500);
      expect(stats.totalAP).toBe(75);
      expect(stats.totalTAP).toBe(500);
      expect(stats.bestScore).toBe(2000);
      expect(stats.currentCombo).toBe(10);
      expect(stats.stagesUnlocked).toBe(2);
      expect(stats.itemsOwned).toBe(0);
    });

    test('should calculate total playtime', () => {
      const startTime = Date.now() - 300000; // 5 minutes ago
      playerData.sessionStartTime = startTime;
      
      const stats = playerData.getStats();
      expect(stats.sessionTime).toBeGreaterThan(250000); // Should be around 5 minutes
    });
  });

  describe('Validation', () => {
    test('should validate data integrity', () => {
      playerData.currentHP = -10; // Invalid
      playerData.currentScore = -100; // Invalid
      playerData.ap = -50; // Invalid
      
      const isValid = playerData.validateData();
      
      expect(isValid).toBe(false);
      expect(playerData.currentHP).toBe(0); // Should be corrected
      expect(playerData.currentScore).toBe(0); // Should be corrected
      expect(playerData.ap).toBe(0); // Should be corrected
    });

    test('should validate username', () => {
      expect(playerData.isValidUsername('')).toBe(false);
      expect(playerData.isValidUsername('a')).toBe(false); // Too short
      expect(playerData.isValidUsername('a'.repeat(21))).toBe(false); // Too long
      expect(playerData.isValidUsername('ValidName')).toBe(true);
      expect(playerData.isValidUsername('User123')).toBe(true);
    });
  });

  describe('Events', () => {
    test('should trigger events on significant changes', () => {
      const mockCallback = jest.fn();
      playerData.on('levelUp', mockCallback);
      
      // Simulate level up condition
      playerData.tap = 999;
      playerData.addTAP(1); // Should trigger level up at 1000
      
      expect(mockCallback).toHaveBeenCalled();
    });

    test('should trigger achievement events', () => {
      const mockCallback = jest.fn();
      playerData.on('achievement', mockCallback);
      
      // Simulate first combo achievement
      playerData.combo = 9;
      playerData.incrementCombo(); // Should trigger achievement at 10
      
      expect(mockCallback).toHaveBeenCalledWith({
        type: 'combo',
        value: 10,
        title: 'Combo Master',
        description: 'Reached 10 combo!'
      });
    });
  });
});