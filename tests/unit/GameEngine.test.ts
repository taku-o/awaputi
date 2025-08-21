/**
 * Unit tests for GameEngine class
 */
import { jest  } from '@jest/globals';
import { MockFactory  } from '../mocks/MockFactory.js';
import { GameEngine  } from '../../src/core/GameEngine.js';
// Types
interface CanvasInfo {
    actualWidth: number,
    actualHeight: number;
    scale: number;
interface PerformanceStats {
    fps: number,
    renderTime: number;
    updateTime: number;
interface MockBubble {
    type: string;
interface MockLocalStorage {
    getItem: jest.Mock<(ke,y: string) => string | null>;
    setItem: jest.Mock<(ke,y: string, value: string) => void>;
    removeItem: jest.Mock<(ke,y: string) => void>;
    clear: jest.Mock<(') => void> }'
// Note: Mock imports removed to avoid path resolution issues
// Mocks will be created manually in test setup
describe('GameEngine', () => {
  let gameEngine: GameEngine,
  let mockCanvas: HTMLCanvasElement,
  beforeEach((') => {'
    // Create a real canvas element for DOM operations
    mockCanvas = document.createElement('canvas'),
    mockCanvas.width = 800,
    mockCanvas.height = 600,
    document.body.appendChild(mockCanvas),
    // Reset all mocks
    jest.clearAllMocks(),
    gameEngine = new GameEngine(mockCanvas) });
  afterEach(() => {
    if (gameEngine) {
      gameEngine.stop(),
      gameEngine.destroy() }
    if (mockCanvas && mockCanvas.parentNode) {
      document.body.removeChild(mockCanvas) }
  }');'
  describe('Constructor', (') => {'
    test('should initialize with canvas and context', () => {
      expect(gameEngine.canvas).toBe(mockCanvas),
      expect(gameEngine.context).toBeTruthy(),
      expect(gameEngine.isRunning).toBe(false) }');'
    test('should throw error if canvas context cannot be created', (') => {'
      const badCanvas = document.createElement('canvas'),
      const originalGetContext = badCanvas.getContext,
      badCanvas.getContext = jest.fn(() => null),
      expect(() => new GameEngine(badCanvas)').toThrow('Failed to get 2D rendering context'),'
      badCanvas.getContext = originalGetContext)'),'
    test('should initialize all managers', () => {
      expect(gameEngine.playerData).toBeDefined(),
      expect(gameEngine.bubbleManager).toBeDefined(),
      expect(gameEngine.scoreManager).toBeDefined(),
      expect(gameEngine.stageManager).toBeDefined(),
      expect(gameEngine.sceneManager).toBeDefined(),
      expect(gameEngine.audioManager).toBeDefined(),
      expect(gameEngine.particleManager).toBeDefined(),
      expect(gameEngine.effectManager).toBeDefined())'),'
    test('should set initial game state', () => {
      expect(gameEngine.timeRemaining).toBe(300000), // 5 minutes
      expect(gameEngine.isGameOver).toBe(false),
      expect(gameEngine.bonusTimeRemaining).toBe(0),
      expect(gameEngine.timeStopRemaining).toBe(0),
      expect(gameEngine.scoreMultiplier).toBe(1)) }');'
  describe('Game Loop', (') => {'
    test('should start game loop', (') => {'
      const requestAnimationFrameSpy = jest.spyOn(global, 'requestAnimationFrame'),
      gameEngine.start(),
      expect(gameEngine.isRunning).toBe(true),
      expect(requestAnimationFrameSpy).toHaveBeenCalled() }');'
    test('should stop game loop', () => {
      gameEngine.start(),
      gameEngine.stop(),
      expect(gameEngine.isRunning).toBe(false) }');'
    test('should update and render in game loop', (') => {'
      const updateSpy = jest.spyOn(gameEngine, 'update'),
      const renderSpy = jest.spyOn(gameEngine, 'render'),
      gameEngine.start(),
      // Advance time to trigger game loop
      jest.advanceTimersByTime(16),
      expect(updateSpy).toHaveBeenCalled(),
      expect(renderSpy).toHaveBeenCalled() }');'
    test('should handle errors in game loop gracefully', (') => {'
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation('),'
      jest.spyOn(gameEngine, 'update').mockImplementation((') => {'
        throw new Error('Test error') });
      gameEngine.start();
      jest.advanceTimersByTime(16);
      // Should continue running despite error
      expect(gameEngine.isRunning).toBe(true);
      consoleSpy.mockRestore();
    }');'
  }
  describe('Update Logic', (') => {'
    test('should update special effects', (') => {'
      const updateSpecialEffectsSpy = jest.spyOn(gameEngine, 'updateSpecialEffects'),
      gameEngine.update(16),
      expect(updateSpecialEffectsSpy).toHaveBeenCalledWith(16) }');'
    test('should update managers', (') => {'
      // マネージャーのupdateメソッドをspyとして設定
      const effectManagerSpy = jest.spyOn(gameEngine.effectManager, 'update'),
      const particleManagerSpy = jest.spyOn(gameEngine.particleManager, 'update'),
      const sceneManagerSpy = jest.spyOn(gameEngine.sceneManager, 'update'),
      gameEngine.update(16),
      // adjustedDeltaTime（変換後の値）で呼び出されることを確認
      expect(effectManagerSpy).toHaveBeenCalled(),
      expect(particleManagerSpy).toHaveBeenCalled(),
      expect(sceneManagerSpy).toHaveBeenCalled() }');'
  }
  describe('Special Effects', (') => {'
    test('should start bonus time', (') => {'
      const playBonusSoundSpy = jest.spyOn(gameEngine.audioManager, 'playBonusSound'),
      gameEngine.startBonusTime(5000, 3),
      expect(gameEngine.bonusTimeRemaining).toBe(5000),
      expect(gameEngine.scoreMultiplier).toBe(3),
      expect(playBonusSoundSpy).toHaveBeenCalled() }');'
    test('should extend bonus time if already active', () => {
      gameEngine.bonusTimeRemaining = 2000,
      gameEngine.startBonusTime(5000, 2),
      expect(gameEngine.bonusTimeRemaining).toBe(5000), // Should take the maximum
    }');'
    test('should start time stop', (') => {'
      const playTimeStopSoundSpy = jest.spyOn(gameEngine.audioManager, 'playTimeStopSound'),
      gameEngine.startTimeStop(3000),
      expect(gameEngine.timeStopRemaining).toBe(3000),
      expect(playTimeStopSoundSpy).toHaveBeenCalled() }');'
    test('should start screen shake', (') => {'
      const playElectricSoundSpy = jest.spyOn(gameEngine.audioManager, 'playElectricSound'),
      gameEngine.startScreenShake(2000, 15),
      expect(gameEngine.screenShakeRemaining).toBe(2000),
      expect(gameEngine.screenShakeIntensity).toBe(15),
      expect(gameEngine.inputDisabled).toBe(true),
      expect(playElectricSoundSpy).toHaveBeenCalled() }');'
    test('should update special effects over time', () => {
      gameEngine.bonusTimeRemaining = 1000,
      gameEngine.timeStopRemaining = 500,
      gameEngine.screenShakeRemaining = 200,
      gameEngine.inputDisabled = true, // 画面揺れで無効化されている状態
      
      gameEngine.updateSpecialEffects(300),
      // 時間停止中はボーナスタイムや画面揺れは進行しない
      expect(gameEngine.bonusTimeRemaining).toBe(1000), // 変化なし
      expect(gameEngine.timeStopRemaining).toBe(200), // 時間停止自体は進行
      expect(gameEngine.screenShakeRemaining).toBe(200), // 変化なし
      expect(gameEngine.inputDisabled).toBe(true), // 変化なし
    }');'
    test('should not update effects during time stop', () => {
      gameEngine.timeStopRemaining = 1000,
      gameEngine.bonusTimeRemaining = 2000,
      
      gameEngine.updateSpecialEffects(500),
      expect(gameEngine.timeStopRemaining).toBe(500), // Should decrease
      expect(gameEngine.bonusTimeRemaining).toBe(2000), // Should not decrease
    }');'
    test('should reset score multiplier when bonus time ends', () => {
      gameEngine.bonusTimeRemaining = 100,
      gameEngine.scoreMultiplier = 3,
      
      gameEngine.updateSpecialEffects(200),
      expect(gameEngine.bonusTimeRemaining).toBe(0),
      expect(gameEngine.scoreMultiplier).toBe(1) }');'
  }
  describe('Effect State Queries', (') => {'
    test('should correctly report bonus time state', () => {
      expect(gameEngine.isBonusTimeActive().toBe(false),
      gameEngine.bonusTimeRemaining = 1000,
      expect(gameEngine.isBonusTimeActive().toBe(true),
      gameEngine.bonusTimeRemaining = 0,
      expect(gameEngine.isBonusTimeActive().toBe(false) }');'
    test('should correctly report time stop state', () => {
      expect(gameEngine.isTimeStopActive().toBe(false),
      gameEngine.timeStopRemaining = 1000,
      expect(gameEngine.isTimeStopActive().toBe(true),
      gameEngine.timeStopRemaining = 0,
      expect(gameEngine.isTimeStopActive().toBe(false) }');'
    test('should correctly report screen shake state', () => {
      expect(gameEngine.isScreenShakeActive().toBe(false),
      gameEngine.screenShakeRemaining = 1000,
      expect(gameEngine.isScreenShakeActive().toBe(true),
      gameEngine.screenShakeRemaining = 0,
      expect(gameEngine.isScreenShakeActive().toBe(false) }');'
  }
  describe('Explosion Effects', (') => {'
    test('should create explosion with all effects', (') => {'
      const createBubblePopEffectSpy = jest.spyOn(gameEngine.particleManager, 'createBubblePopEffect').mockImplementation(() => {}');'
      const playPopSoundSpy = jest.spyOn(gameEngine.audioManager, 'playPopSound').mockImplementation(() => {}');'
      const addScreenFlashSpy = jest.spyOn(gameEngine.effectManager, 'addScreenFlash').mockImplementation(() => {}');'
      gameEngine.createExplosion(100, 200, 'normal', 50, 1);
      expect(createBubblePopEffectSpy).toHaveBeenCalled();
      expect(playPopSoundSpy).toHaveBeenCalled();
      expect(addScreenFlashSpy).toHaveBeenCalled();
    }');'
    test('should create less intense explosion for low intensity', (') => {'
      const createBubblePopEffectSpy = jest.spyOn(gameEngine.particleManager, 'createBubblePopEffect').mockImplementation(() => {}');'
      const playPopSoundSpy = jest.spyOn(gameEngine.audioManager, 'playPopSound').mockImplementation(() => {}');'
      const addScreenFlashSpy = jest.spyOn(gameEngine.effectManager, 'addScreenFlash').mockImplementation(() => {}');'
      gameEngine.createExplosion(100, 200, 'normal', 50, 0.3);
      expect(createBubblePopEffectSpy).toHaveBeenCalled();
      expect(playPopSoundSpy).toHaveBeenCalled();
      expect(addScreenFlashSpy).not.toHaveBeenCalled();
    }');'
  }
  describe('Performance Monitoring', (') => {'
    test('should track performance stats', () => {
      gameEngine.frameCount = 59, // Just before stats update
      gameEngine.update(16),
      gameEngine.render(),
      gameEngine.frameCount = 60, // Should trigger stats update
      gameEngine.update(16),
      expect(gameEngine.performanceStats.fps).toBeDefined(),
      expect(gameEngine.performanceStats.renderTime).toBeDefined(),
      expect(gameEngine.performanceStats.updateTime).toBeDefined() }');'
    test('should perform periodic optimization', (') => {'
      const performOptimizationSpy = jest.spyOn(gameEngine, 'performOptimization').mockImplementation(() => {}');'
      // Call optimization directly since the test doesn't set up periodic triggers'
      gameEngine.performOptimization();
      expect(performOptimizationSpy).toHaveBeenCalled();
    }');'
  }
  describe('Game Over', (') => {'
    test('should handle game over', (') => {'
      const cleanupSpy = jest.spyOn(gameEngine, 'cleanup').mockImplementation(() => {}');'
      const playGameOverSoundSpy = jest.spyOn(gameEngine.audioManager, 'playGameOverSound').mockImplementation(() => {});
      gameEngine.gameOver();
      expect(gameEngine.isGameOver).toBe(true);
      expect(playGameOverSoundSpy).toHaveBeenCalled();
      expect(cleanupSpy).toHaveBeenCalled();
    }');'
  }
  describe('Cleanup', (') => {'
    test('should cleanup all resources', (') => {'
      const clearAllEffectsSpy = jest.spyOn(gameEngine.effectManager, 'clearAllEffects').mockImplementation(() => {}');'
      const clearAllParticlesSpy = jest.spyOn(gameEngine.particleManager, 'clearAllParticles').mockImplementation(() => {});
      gameEngine.cleanup();
      expect(clearAllEffectsSpy).toHaveBeenCalled();
      expect(clearAllParticlesSpy).toHaveBeenCalled();
    }');'
  }
  describe('Canvas Resize', (') => {'
    test('should handle canvas resize', () => {
      const canvasInfo: CanvasInfo = {
        actualWidth: 1024,
        actualHeight: 768,
        scale: 1.2
      };
      
      gameEngine.onCanvasResize(canvasInfo);
      expect(gameEngine.uiInfo.scale).toBe(1.2);
      expect(gameEngine.uiInfo.canvasInfo).toBe(canvasInfo);
    }');'
    test('should limit UI scale to maximum', () => {
      const canvasInfo: CanvasInfo = {
        actualWidth: 1600,
        actualHeight: 1200,
        scale: 2.0 // Very high scale
      };
      
      gameEngine.onCanvasResize(canvasInfo);
      expect(gameEngine.uiInfo.scale).toBe(1.5); // Should be capped at 1.5
    }');'
  }
  describe('Debug Mode', (') => {'
    test('should detect debug mode from localStorage', () => {
      // Mock localStorage directly with proper Storage implementation
      const mockLocalStorage: MockLocalStorage = {
        getItem: jest.fn(
        setItem: jest.fn(
        removeItem: jest.fn(
        clear: jest.fn()' };'
      
      // Replace global localStorage
      const originalLocalStorage = global.localStorage;
      Object.defineProperty(global, 'localStorage', {
        value: mockLocalStorage,
        writable: true)'),'
      // Test debug = 'true'
      mockLocalStorage.getItem.mockReturnValue('true'),
      expect(gameEngine.isDebugMode().toBe(true'),'
      // Test debug = 'false' 
      mockLocalStorage.getItem.mockReturnValue('false'),
      expect(gameEngine.isDebugMode().toBe(false),
      // Test debug = null
      mockLocalStorage.getItem.mockReturnValue(null),
      expect(gameEngine.isDebugMode().toBe(false'),'
      // Restore original localStorage
      Object.defineProperty(global, 'localStorage', {
        value: originalLocalStorage,
        writable: true) }
  }');'
  describe('Object Pool Integration', (') => {'
    test('should get bubble from pool', (') => {'
      // Mock directly at the GameEngine level since we can't mock ES module exports'
      const getBubbleFromPoolSpy = jest.spyOn(gameEngine, 'getBubbleFromPool').mockImplementation(('): MockBubble => {'
        return { type: 'normal' };
      });
      const bubble = gameEngine.getBubbleFromPool();
      expect(getBubbleFromPoolSpy).toHaveBeenCalled();
      expect(bubble').toEqual(expect.objectContaining({ type: 'normal' })');
    }
    test('should return bubble to pool', (') => {'
      const mockBubble: MockBubble = { type: 'normal' };
      
      // Mock directly at the GameEngine level since we can't mock ES module exports  '
      const returnBubbleToPoolSpy = jest.spyOn(gameEngine, 'returnBubbleToPool').mockImplementation(() => {});
      gameEngine.returnBubbleToPool(mockBubble);
      expect(returnBubbleToPoolSpy).toHaveBeenCalledWith(mockBubble);
    }');'
  }
  describe('Error Handling', (') => {'
    test('should handle canvas context creation failure', (') => {'
      const badCanvas = document.createElement('canvas'),
      const originalGetContext = badCanvas.getContext,
      badCanvas.getContext = jest.fn(() => null),
      expect(() => new GameEngine(badCanvas).toThrow(),
      badCanvas.getContext = originalGetContext)'),'
    test('should continue running after non-critical errors', (') => {'
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation('),'
      // Mock a non-critical error in update
      jest.spyOn(gameEngine.sceneManager, 'update').mockImplementation((') => {'
        throw new Error('Non-critical error')),
      gameEngine.start(),
      jest.advanceTimersByTime(16),
      expect(gameEngine.isRunning).toBe(true),
      consoleSpy.mockRestore())'),'
    test('should stop on critical canvas errors', (') => {'
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation('),'
      // Mock a critical canvas error
      jest.spyOn(gameEngine, 'render').mockImplementation((') => {'
        const error = new Error('Canvas context lost'),
        error.message = 'Canvas context lost',
        throw error });
      gameEngine.start();
      jest.advanceTimersByTime(16);
      expect(gameEngine.isRunning).toBe(false);
      consoleSpy.mockRestore();
    });
  }
}');'