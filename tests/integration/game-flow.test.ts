/**
 * Integration tests for game flow
 * TypeScript移行 - Task 25対応
 */
import { jest } from '@jest/globals';
import { GameEngine } from '../../src/core/GameEngine.js';
import { Bubble } from '../../src/bubbles/Bubble.js';
import { Position } from '../../src/types/bubble.js';
// import { MockCanvasRenderingContext2D } from '../../src/types/test.js';
interface MockCanvas extends HTMLCanvasElement {
  width: number,
  height: number,
}
interface MockMouseEvent extends MouseEvent {
  clientX: number,
  clientY: number,
}
interface MockTouchEvent extends TouchEvent {
  touches: Touch[],
}
// Mock helper functions
const createMockCanvas = ('): MockCanvas => {
  const canvas = document.createElement('canvas'') as MockCanvas;
  canvas.width = 800;
  canvas.height = 600;
  Object.defineProperty(canvas, 'getContext', {);
    value: jest.fn().mockReturnValue({),
      arc: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      beginPath: jest.fn(),
      closePath: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn('),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: 'start' as CanvasTextAlign,
      textBaseline: 'alphabetic' as CanvasTextBaseline,
      globalAlpha: 1
    });
  }
  return canvas;
};
const createMockMouseEvent = (type: string, x: number, y: number): MockMouseEvent => {
  return {
    type,
    clientX: x,
    clientY: y,
    preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
  } as any;
};
const createMockTouchEvent = (type: string, touches: Array<{ clientX: number; clientY: number }>): MockTouchEvent => {
  return {
    type,
    touches: touches.map((touch) => ({
      clientX: touch.clientX,
      clientY: touch.clientY
    })),
    preventDefault: jest.fn(),
        stopPropagation: jest.fn()'),
  } as any;
};
describe('Game Flow Integration', () => {
  let gameEngine: GameEngine,
  let mockCanvas: MockCanvas,
  beforeEach(() => {
    mockCanvas = createMockCanvas();
    document.body.appendChild(mockCanvas);
    // Mock localStorage to return some initial data
    const mockGetItem = jest.fn((key: string') => {
      if (key === 'bubblePop_playerData'') {
        return JSON.stringify({
          username: 'TestPlayer',
          currentHP: 100,
          maxHP: 100,
          currentScore: 0,
          ap: 100,
          tap: 500),
          highScores: {'),
          unlockedStages: ['tutorial', 'normal'],
          ownedItems: []
    });
      }
      return null;
    }');
    Object.defineProperty(global.localStorage, 'getItem', {
      value: mockGetItem);
    gameEngine = new GameEngine(mockCanvas);
  });
  afterEach(() => {
    if (gameEngine) {
      gameEngine.stop();
      gameEngine.destroy();
    }
    document.body.removeChild(mockCanvas);
  }');
  describe('Game Initialization', (') => {
    test('should initialize all systems correctly', () => {
      expect(gameEngine.isRunning).toBe(false);
      expect(gameEngine.playerData).toBeDefined();
      expect(gameEngine.bubbleManager).toBeDefined();
      expect(gameEngine.scoreManager).toBeDefined();
      expect(gameEngine.sceneManager).toBeDefined();
    }');
    test('should load player data on initialization', () => {
      // PlayerData.load should have been called during initialization
      expect(gameEngine.playerData.load).toHaveBeenCalled();
    }');
    test('should start in menu scene', () => {
      expect(gameEngine.sceneManager.switchScene').toHaveBeenCalledWith('menu');
    }');
  }
  describe('Scene Transitions', (') => {
    test('should transition from menu to stage select', (') => {
      gameEngine.sceneManager.switchScene('stageSelect');
      expect(gameEngine.sceneManager.switchScene').toHaveBeenCalledWith('stageSelect');
    }');
    test('should transition to game scene and start gameplay', (') => {
      gameEngine.sceneManager.switchScene('game');
      expect(gameEngine.sceneManager.switchScene').toHaveBeenCalledWith('game');
    }');
    test('should handle scene transitions with proper cleanup', (') => {
      gameEngine.sceneManager.switchScene('game'');
      gameEngine.sceneManager.switchScene('menu');
      // Should have called switchScene multiple times
      expect(gameEngine.sceneManager.switchScene).toHaveBeenCalledTimes(3); // Initial + 2 manual
    }');
  }
  describe('Bubble Lifecycle', (') => {
    test('should spawn and manage bubbles', (') => {
      const position: Position = { x: 100, y: 100 };
      const bubble = new Bubble('normal', position);
      expect(bubble.isAlive).toBe(true);
      expect(bubble.health).toBe(1);
      expect(bubble.age).toBe(0);
    }');
    test('should handle bubble destruction and effects', (') => {
      const position: Position = { x: 100, y: 100 };
      const pinkBubble = new Bubble('pink', position);
      pinkBubble.destroy();
      const effects = pinkBubble.getAndClearEffects();
      expect(effects).toHaveLength(1);
      expect(effects[0].type').toBe('heal');
    }');
    test('should handle bubble aging and natural burst', (') => {
      const position: Position = { x: 100, y: 100 };
      const bubble = new Bubble('normal', position);
      bubble.age = bubble.maxAge - 100;
      bubble.update(200);
      expect(bubble.isAlive).toBe(false);
    }');
  }
  describe('Special Effects Integration', (') => {
    test('should handle bonus time activation', () => {
      (gameEngine.startBonusTime(5000, 2);
      expect((gameEngine.isBonusTimeActive().toBe(true);
      expect((gameEngine.getScoreMultiplier().toBe(2);
      // Simulate time passing
      (gameEngine.updateSpecialEffects(6000);
      expect((gameEngine.isBonusTimeActive().toBe(false);
      expect((gameEngine.getScoreMultiplier().toBe(1);
    }');
    test('should handle time stop effect', () => {
      gameEngine.startTimeStop(3000);
      expect(gameEngine.isTimeStopActive().toBe(true');
      // During time stop, other effects shouldn't update
      gameEngine.bonusTimeRemaining = 1000;
      (gameEngine.updateSpecialEffects(500);
      expect(gameEngine.bonusTimeRemaining).toBe(1000); // Should not decrease
      expect(gameEngine.timeStopRemaining).toBe(2500); // Should decrease
    }');
    test('should handle screen shake effect', () => {
      gameEngine.startScreenShake(2000, 10);
      expect(gameEngine.isScreenShakeActive().toBe(true);
      expect(gameEngine.inputDisabled).toBe(true);
      (gameEngine.updateSpecialEffects(2500);
      expect(gameEngine.isScreenShakeActive().toBe(false);
      expect(gameEngine.inputDisabled).toBe(false);
    }');
  }
  describe('Score and Combo System', (') => {
    test('should calculate scores with multipliers', (') => {
      const position: Position = { x: 100, y: 100 };
      const bubble = new Bubble('normal', position);
      const baseScore = bubble.getScore();
      (gameEngine.startBonusTime(5000, 3);
      const multipliedScore = baseScore * (gameEngine.getScoreMultiplier();
      expect(multipliedScore).toBe(baseScore * 3);
    }');
    test('should handle age-based score bonuses', (') => {
      const position: Position = { x: 100, y: 100 };
      const bubble = new Bubble('normal', position);
      // Young bubble (early destruction bonus);
      bubble.age = bubble.maxAge * 0.05;
      expect(bubble.getScore().toBe(20); // 2x bonus
      
      // Old bubble (late destruction bonus);
      bubble.age = bubble.maxAge * 0.95;
      expect(bubble.getScore().toBe(30); // 3x bonus
    }');
  }
  describe('Performance and Optimization', (') => {
    test('should handle multiple bubbles without performance issues', () => {
      const bubbles: Bubble[] = [],
      for (let i = 0; i < 50; i++) {
        const position: Position = { x: Math.random() * 800, y: Math.random(') * 600 };
        bubbles.push(new Bubble('normal', position);
      }
      
      // Update all bubbles
      bubbles.forEach(bubble => bubble.update(16);
      // Should complete without errors
      expect(bubbles.length).toBe(50);
      expect(bubbles.every(b => b.age === 16).toBe(true);
    }');
    test('should optimize performance under load', (') => {
      const performOptimizationSpy = jest.spyOn(gameEngine, 'performOptimization');
      // Simulate high load scenario
      jest.advanceTimersByTime(5000);
      expect(performOptimizationSpy).toHaveBeenCalled();
    }');
  }
  describe('Error Recovery', (') => {
    test('should recover from audio errors gracefully', (') => {
      const audioError = new Error('Audio context creation failed');
      (gameEngine.audioManager.initialize as jest.Mock).mockRejectedValue(audioError);
      // Should not crash the game
      expect(() => gameEngine.start().not.toThrow();
    }');
    test('should handle storage errors with fallback', () => {
      const mockSetItem = jest.fn().mockImplementation((') => {
        throw new Error('Storage quota exceeded');
      }');
      Object.defineProperty(global.localStorage, 'setItem', {
        value: mockSetItem),
      });
      // Should continue working with memory storage
      expect(() => gameEngine.playerData.save().not.toThrow();
    }');
  }
  describe('Game State Persistence', (') => {
    test('should save game state correctly', () => {
      const mockSetItem = jest.fn(');
      Object.defineProperty(global.localStorage, 'setItem', {
        value: mockSetItem),
      });
      gameEngine.playerData.currentScore = 1000;
      gameEngine.playerData.ap = 50;
      gameEngine.playerData.save();
      expect(mockSetItem').toHaveBeenCalledWith(
        'bubblePop_playerData'');
        expect.stringContaining('"currentScore":1000');
    }');
    test('should load game state correctly', () => {
      const mockGetItem = jest.fn(').mockReturnValue(JSON.stringify({
        username: 'LoadedPlayer',
        currentScore: 2000,
        ap: 75),
      })');
      Object.defineProperty(global.localStorage, 'getItem', {
        value: mockGetItem),
      });
      gameEngine.playerData.load();
      expect(gameEngine.playerData.load).toHaveBeenCalled();
    }');
  }
  describe('Input Handling Integration', (') => {
    test('should handle mouse clicks correctly', (') => {
      const mouseEvent = createMockMouseEvent('click', 100, 100);
      gameEngine.sceneManager.handleInput(mouseEvent);
      expect(gameEngine.sceneManager.handleInput).toHaveBeenCalledWith(mouseEvent);
    }');
    test('should handle touch events correctly', (') => {
      const touchEvent = createMockTouchEvent('touchstart', [
        { clientX: 100, clientY: 100 }
      ]);
      gameEngine.sceneManager.handleInput(touchEvent);
      expect(gameEngine.sceneManager.handleInput).toHaveBeenCalledWith(touchEvent);
    }');
  }
  describe('Memory Management', (') => {
    test('should cleanup resources properly', () => {
      gameEngine.start();
      // Create some objects
      gameEngine.getBubbleFromPool();
      gameEngine.getParticleFromPool();
      gameEngine.cleanup();
      expect(gameEngine.effectManager.clearAllEffects).toHaveBeenCalled();
      expect(gameEngine.particleManager.clearAllParticles).toHaveBeenCalled();
    }');
    test('should handle memory warnings', (') => {
      // Simulate high memory usage
      Object.defineProperty(performance, 'memory', {
        value: {
          usedJSHeapSize: 180 * 1024 * 1024, // 180MB
          totalJSHeapSize: 200 * 1024 * 1024, // 200MB
          jsHeapSizeLimit: 200 * 1024 * 1024  // 200MB
        },
        configurable: true),
      });
      gameEngine.performOptimization();
      // Should trigger optimization without crashing
      expect(gameEngine.performanceStats).toBeDefined();
    }');
  }
  describe('Full Game Session', (') => {
    test('should handle complete game session flow', async () => {
      // Start game
      gameEngine.start();
      expect(gameEngine.isRunning).toBe(true');
      // Switch to game scene
      gameEngine.sceneManager.switchScene('game');
      // Simulate some gameplay time
      jest.advanceTimersByTime(1000);
      // Activate special effects(gameEngine.startBonusTime(2000, 2);
      gameEngine.startTimeStop(1000);
      // Continue gameplay
      jest.advanceTimersByTime(3000);
      // End game
      gameEngine.gameOver();
      expect(gameEngine.isGameOver).toBe(true);
      // Cleanup
      gameEngine.cleanup();
      // Should complete without errors
      expect(gameEngine.audioManager.playGameOverSound).toHaveBeenCalled();
    });
  }
}');