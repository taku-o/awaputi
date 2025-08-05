/**
 * Unit tests for GameEngine class
 */

import { jest } from '@jest/globals';
import { MockFactory } from '../mocks/MockFactory.js';
import { GameEngine } from '../../src/core/GameEngine.js';

// Note: Mock imports removed to avoid path resolution issues
// Mocks will be created manually in test setup

describe('GameEngine', () => {
  let gameEngine;
  let mockCanvas;

  beforeEach(() => {
    // Create a real canvas element for DOM operations
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 800;
    mockCanvas.height = 600;
    document.body.appendChild(mockCanvas);
    
    // Reset all mocks
    jest.clearAllMocks();
    
    gameEngine = new GameEngine(mockCanvas);
  });

  afterEach(() => {
    if (gameEngine) {
      gameEngine.stop();
      gameEngine.destroy();
    }
    if (mockCanvas && mockCanvas.parentNode) {
      document.body.removeChild(mockCanvas);
    }
  });

  describe('Constructor', () => {
    test('should initialize with canvas and context', () => {
      expect(gameEngine.canvas).toBe(mockCanvas);
      expect(gameEngine.context).toBeTruthy();
      expect(gameEngine.isRunning).toBe(false);
    });

    test('should throw error if canvas context cannot be created', () => {
      const badCanvas = document.createElement('canvas');
      const originalGetContext = badCanvas.getContext;
      badCanvas.getContext = jest.fn(() => null);
      
      expect(() => new GameEngine(badCanvas)).toThrow('Failed to get 2D rendering context');
      
      badCanvas.getContext = originalGetContext;
    });

    test('should initialize all managers', () => {
      expect(gameEngine.playerData).toBeDefined();
      expect(gameEngine.bubbleManager).toBeDefined();
      expect(gameEngine.scoreManager).toBeDefined();
      expect(gameEngine.stageManager).toBeDefined();
      expect(gameEngine.sceneManager).toBeDefined();
      expect(gameEngine.audioManager).toBeDefined();
      expect(gameEngine.particleManager).toBeDefined();
      expect(gameEngine.effectManager).toBeDefined();
    });

    test('should set initial game state', () => {
      expect(gameEngine.timeRemaining).toBe(300000); // 5 minutes
      expect(gameEngine.isGameOver).toBe(false);
      expect(gameEngine.bonusTimeRemaining).toBe(0);
      expect(gameEngine.timeStopRemaining).toBe(0);
      expect(gameEngine.scoreMultiplier).toBe(1);
    });
  });

  describe('Game Loop', () => {
    test('should start game loop', () => {
      const requestAnimationFrameSpy = jest.spyOn(global, 'requestAnimationFrame');
      
      gameEngine.start();
      
      expect(gameEngine.isRunning).toBe(true);
      expect(requestAnimationFrameSpy).toHaveBeenCalled();
    });

    test('should stop game loop', () => {
      gameEngine.start();
      gameEngine.stop();
      
      expect(gameEngine.isRunning).toBe(false);
    });

    test('should update and render in game loop', () => {
      const updateSpy = jest.spyOn(gameEngine, 'update');
      const renderSpy = jest.spyOn(gameEngine, 'render');
      
      gameEngine.start();
      
      // Advance time to trigger game loop
      jest.advanceTimersByTime(16);
      
      expect(updateSpy).toHaveBeenCalled();
      expect(renderSpy).toHaveBeenCalled();
    });

    test('should handle errors in game loop gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(gameEngine, 'update').mockImplementation(() => {
        throw new Error('Test error');
      });
      
      gameEngine.start();
      jest.advanceTimersByTime(16);
      
      // Should continue running despite error
      expect(gameEngine.isRunning).toBe(true);
      
      consoleSpy.mockRestore();
    });
  });

  describe('Update Logic', () => {
    test('should update special effects', () => {
      const updateSpecialEffectsSpy = jest.spyOn(gameEngine, 'updateSpecialEffects');
      
      gameEngine.update(16);
      
      expect(updateSpecialEffectsSpy).toHaveBeenCalledWith(16);
    });

    test('should update managers', () => {
      gameEngine.update(16);
      
      expect(gameEngine.effectManager.update).toHaveBeenCalledWith(16);
      expect(gameEngine.particleManager.update).toHaveBeenCalledWith(16);
      expect(gameEngine.sceneManager.update).toHaveBeenCalledWith(16);
    });
  });

  describe('Special Effects', () => {
    test('should start bonus time', () => {
      gameEngine.startBonusTime(5000, 3);
      
      expect(gameEngine.bonusTimeRemaining).toBe(5000);
      expect(gameEngine.scoreMultiplier).toBe(3);
      expect(gameEngine.audioManager.playBonusSound).toHaveBeenCalled();
    });

    test('should extend bonus time if already active', () => {
      gameEngine.bonusTimeRemaining = 2000;
      gameEngine.startBonusTime(5000, 2);
      
      expect(gameEngine.bonusTimeRemaining).toBe(5000); // Should take the maximum
    });

    test('should start time stop', () => {
      gameEngine.startTimeStop(3000);
      
      expect(gameEngine.timeStopRemaining).toBe(3000);
      expect(gameEngine.audioManager.playTimeStopSound).toHaveBeenCalled();
    });

    test('should start screen shake', () => {
      gameEngine.startScreenShake(2000, 15);
      
      expect(gameEngine.screenShakeRemaining).toBe(2000);
      expect(gameEngine.screenShakeIntensity).toBe(15);
      expect(gameEngine.inputDisabled).toBe(true);
      expect(gameEngine.audioManager.playElectricSound).toHaveBeenCalled();
    });

    test('should update special effects over time', () => {
      gameEngine.bonusTimeRemaining = 1000;
      gameEngine.timeStopRemaining = 500;
      gameEngine.screenShakeRemaining = 200;
      
      gameEngine.updateSpecialEffects(300);
      
      expect(gameEngine.bonusTimeRemaining).toBe(700);
      expect(gameEngine.timeStopRemaining).toBe(200);
      expect(gameEngine.screenShakeRemaining).toBe(0); // Should be finished
      expect(gameEngine.inputDisabled).toBe(false); // Should be re-enabled
    });

    test('should not update effects during time stop', () => {
      gameEngine.timeStopRemaining = 1000;
      gameEngine.bonusTimeRemaining = 2000;
      
      gameEngine.updateSpecialEffects(500);
      
      expect(gameEngine.timeStopRemaining).toBe(500); // Should decrease
      expect(gameEngine.bonusTimeRemaining).toBe(2000); // Should not decrease
    });

    test('should reset score multiplier when bonus time ends', () => {
      gameEngine.bonusTimeRemaining = 100;
      gameEngine.scoreMultiplier = 3;
      
      gameEngine.updateSpecialEffects(200);
      
      expect(gameEngine.bonusTimeRemaining).toBe(0);
      expect(gameEngine.scoreMultiplier).toBe(1);
    });
  });

  describe('Effect State Queries', () => {
    test('should correctly report bonus time state', () => {
      expect(gameEngine.isBonusTimeActive()).toBe(false);
      
      gameEngine.bonusTimeRemaining = 1000;
      expect(gameEngine.isBonusTimeActive()).toBe(true);
      
      gameEngine.bonusTimeRemaining = 0;
      expect(gameEngine.isBonusTimeActive()).toBe(false);
    });

    test('should correctly report time stop state', () => {
      expect(gameEngine.isTimeStopActive()).toBe(false);
      
      gameEngine.timeStopRemaining = 1000;
      expect(gameEngine.isTimeStopActive()).toBe(true);
      
      gameEngine.timeStopRemaining = 0;
      expect(gameEngine.isTimeStopActive()).toBe(false);
    });

    test('should correctly report screen shake state', () => {
      expect(gameEngine.isScreenShakeActive()).toBe(false);
      
      gameEngine.screenShakeRemaining = 1000;
      expect(gameEngine.isScreenShakeActive()).toBe(true);
      
      gameEngine.screenShakeRemaining = 0;
      expect(gameEngine.isScreenShakeActive()).toBe(false);
    });
  });

  describe('Explosion Effects', () => {
    test('should create explosion with all effects', () => {
      gameEngine.createExplosion(100, 200, 'normal', 50, 1);
      
      expect(gameEngine.particleManager.createBubblePopEffect).toHaveBeenCalledWith(100, 200, 'normal', 50);
      expect(gameEngine.audioManager.playPopSound).toHaveBeenCalledWith(false, 'normal');
      expect(gameEngine.effectManager.addScreenFlash).toHaveBeenCalledWith(0.1, 100, '#FFFFFF');
    });

    test('should create less intense explosion for low intensity', () => {
      gameEngine.createExplosion(100, 200, 'normal', 50, 0.3);
      
      expect(gameEngine.particleManager.createBubblePopEffect).toHaveBeenCalled();
      expect(gameEngine.audioManager.playPopSound).toHaveBeenCalled();
      expect(gameEngine.effectManager.addScreenFlash).not.toHaveBeenCalled();
    });
  });

  describe('Performance Monitoring', () => {
    test('should track performance stats', () => {
      gameEngine.frameCount = 59; // Just before stats update
      gameEngine.update(16);
      gameEngine.render();
      
      gameEngine.frameCount = 60; // Should trigger stats update
      gameEngine.update(16);
      
      expect(gameEngine.performanceStats.fps).toBeDefined();
      expect(gameEngine.performanceStats.renderTime).toBeDefined();
      expect(gameEngine.performanceStats.updateTime).toBeDefined();
    });

    test('should perform periodic optimization', () => {
      const performOptimizationSpy = jest.spyOn(gameEngine, 'performOptimization');
      
      // Fast-forward 5 seconds to trigger optimization
      jest.advanceTimersByTime(5000);
      
      expect(performOptimizationSpy).toHaveBeenCalled();
    });
  });

  describe('Game Over', () => {
    test('should handle game over', () => {
      const cleanupSpy = jest.spyOn(gameEngine, 'cleanup');
      
      gameEngine.gameOver();
      
      expect(gameEngine.isGameOver).toBe(true);
      expect(gameEngine.audioManager.playGameOverSound).toHaveBeenCalled();
      expect(cleanupSpy).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    test('should cleanup all resources', () => {
      gameEngine.cleanup();
      
      expect(gameEngine.effectManager.clearAllEffects).toHaveBeenCalled();
      expect(gameEngine.particleManager.clearAllParticles).toHaveBeenCalled();
    });
  });

  describe('Canvas Resize', () => {
    test('should handle canvas resize', () => {
      const canvasInfo = {
        actualWidth: 1024,
        actualHeight: 768,
        scale: 1.2
      };
      
      gameEngine.onCanvasResize(canvasInfo);
      
      expect(gameEngine.uiInfo.scale).toBe(1.2);
      expect(gameEngine.uiInfo.canvasInfo).toBe(canvasInfo);
    });

    test('should limit UI scale to maximum', () => {
      const canvasInfo = {
        actualWidth: 1600,
        actualHeight: 1200,
        scale: 2.0 // Very high scale
      };
      
      gameEngine.onCanvasResize(canvasInfo);
      
      expect(gameEngine.uiInfo.scale).toBe(1.5); // Should be capped at 1.5
    });
  });

  describe('Debug Mode', () => {
    test('should detect debug mode from localStorage', () => {
      global.localStorage.getItem = jest.fn().mockReturnValue('true');
      expect(gameEngine.isDebugMode()).toBe(true);
      
      global.localStorage.getItem = jest.fn().mockReturnValue('false');
      expect(gameEngine.isDebugMode()).toBe(false);
      
      global.localStorage.getItem = jest.fn().mockReturnValue(null);
      expect(gameEngine.isDebugMode()).toBe(false);
    });
  });

  describe('Object Pool Integration', () => {
    test('should get bubble from pool', async () => {
      const mockBubble = { type: 'normal' };
      const ObjectPoolModule = await import('../../src/utils/ObjectPool.js');
      ObjectPoolModule.poolManager.get = jest.fn().mockReturnValue(mockBubble);
      
      const bubble = gameEngine.getBubbleFromPool();
      expect(bubble).toBe(mockBubble);
    });

    test('should return bubble to pool', async () => {
      const mockBubble = { type: 'normal' };
      const ObjectPoolModule = await import('../../src/utils/ObjectPool.js');
      ObjectPoolModule.poolManager.return = jest.fn();
      
      gameEngine.returnBubbleToPool(mockBubble);
      
      expect(ObjectPoolModule.poolManager.return).toHaveBeenCalledWith('bubbles', mockBubble);
    });
  });

  describe('Error Handling', () => {
    test('should handle canvas context creation failure', () => {
      const badCanvas = document.createElement('canvas');
      const originalGetContext = badCanvas.getContext;
      badCanvas.getContext = jest.fn(() => null);
      
      expect(() => new GameEngine(badCanvas)).toThrow();
      
      badCanvas.getContext = originalGetContext;
    });

    test('should continue running after non-critical errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock a non-critical error in update
      jest.spyOn(gameEngine.sceneManager, 'update').mockImplementation(() => {
        throw new Error('Non-critical error');
      });
      
      gameEngine.start();
      jest.advanceTimersByTime(16);
      
      expect(gameEngine.isRunning).toBe(true);
      
      consoleSpy.mockRestore();
    });

    test('should stop on critical canvas errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock a critical canvas error
      jest.spyOn(gameEngine, 'render').mockImplementation(() => {
        const error = new Error('Canvas context lost');
        error.message = 'Canvas context lost';
        throw error;
      });
      
      gameEngine.start();
      jest.advanceTimersByTime(16);
      
      expect(gameEngine.isRunning).toBe(false);
      
      consoleSpy.mockRestore();
    });
  });
});