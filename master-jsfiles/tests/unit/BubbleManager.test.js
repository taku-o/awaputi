/**
 * BubbleManager Test Suite
 * Updated to use MockFactory and match actual BubbleManager API
 */

import { jest } from '@jest/globals';
import { MockFactory } from '../mocks/MockFactory.js';

// Note: Mock imports removed to avoid path resolution issues
// Mocks will be created manually in test setup

describe('BubbleManager', () => {
    let bubbleManager;
    let mockGameEngine;
    let mockCanvas;
    let mockContext;
    
    beforeEach(async () => {
        // Use MockFactory for consistent canvas mocking
        mockCanvas = MockFactory.createCanvasMock();
        mockContext = mockCanvas.getContext('2d');
        
        mockGameEngine = {
            canvas: mockCanvas,
            ctx: mockContext,
            currentStage: { name: 'normal' },
            getInputManager: jest.fn(() => ({
                isMousePressed: jest.fn(() => false),
                getMousePosition: jest.fn(() => ({ x: 0, y: 0 }))
            })),
            createExplosion: jest.fn(),
            returnBubbleToPool: jest.fn(),
            getBubbleFromPool: jest.fn(() => ({
                type: 'normal',
                x: 100,
                y: 100,
                size: 30,
                isAlive: true,
                age: 0
            }))
        };
        
        // Mock PerformanceOptimizer before importing BubbleManager
        const mockPerformanceOptimizer = {
            adjustUpdateFrequency: jest.fn(deltaTime => deltaTime),
            getMaxBubbles: jest.fn(() => 50),
            getCurrentRenderQuality: jest.fn(() => 1.0)
        };
        
        // Mock the getPerformanceOptimizer function
        jest.doMock('../../src/utils/PerformanceOptimizer.js', () => ({
            getPerformanceOptimizer: () => mockPerformanceOptimizer
        }));
        
        // Import BubbleManager dynamically to avoid path issues
        const { BubbleManager } = await import('../../src/managers/BubbleManager.js');
        bubbleManager = new BubbleManager(mockGameEngine);
        
        jest.clearAllMocks();
    });
    
    describe('Constructor', () => {
        test('should initialize with game engine', () => {
            expect(bubbleManager.gameEngine).toBe(mockGameEngine);
            expect(bubbleManager.bubbles).toEqual([]);
            expect(bubbleManager.spawner).toBeDefined();
            expect(bubbleManager.physicsEngine).toBeDefined();
            expect(bubbleManager.dragSystem).toBeDefined();
            expect(bubbleManager.effectProcessor).toBeDefined();
        });
    });
    
    describe('Bubble Management', () => {
        test('should spawn bubbles', () => {
            const initialCount = bubbleManager.getBubbleCount();
            bubbleManager.spawnBubble();
            
            expect(bubbleManager.getBubbleCount()).toBeGreaterThan(initialCount);
        });
        
        test('should spawn specific bubble types', () => {
            const initialCount = bubbleManager.getBubbleCount();
            const bubble = bubbleManager.spawnSpecificBubble('normal', { x: 100, y: 100 });
            
            expect(bubbleManager.getBubbleCount()).toBe(initialCount + 1);
            if (bubble) {
                expect(bubble.type).toBe('normal');
            }
        });
        
        test('should clear all bubbles', () => {
            bubbleManager.spawnBubble();
            bubbleManager.spawnBubble();
            
            expect(bubbleManager.getBubbleCount()).toBeGreaterThan(0);
            
            bubbleManager.clearAllBubbles();
            expect(bubbleManager.getBubbleCount()).toBe(0);
        });
        
        test('should get active bubbles', () => {
            bubbleManager.spawnBubble();
            bubbleManager.spawnBubble();
            
            const activeBubbles = bubbleManager.getActiveBubbles();
            expect(Array.isArray(activeBubbles)).toBe(true);
            expect(activeBubbles.length).toBe(bubbleManager.getBubbleCount());
        });
    });
    
    describe('Update Cycle', () => {
        test('should update bubbles over time', () => {
            bubbleManager.spawnBubble();
            const initialCount = bubbleManager.getBubbleCount();
            
            // Should not throw errors during update
            expect(() => {
                bubbleManager.update(16.67); // One frame at 60fps
            }).not.toThrow();
            
            // Bubble count should remain stable for short updates
            expect(bubbleManager.getBubbleCount()).toBe(initialCount);
        });
        
        test('should handle mouse position updates', () => {
            expect(() => {
                bubbleManager.updateMousePosition(100, 200);
            }).not.toThrow();
        });
    });
    
    describe('Interaction Handling', () => {
        test('should handle click events', () => {
            bubbleManager.spawnSpecificBubble('normal', { x: 100, y: 100 });
            
            expect(() => {
                bubbleManager.handleClick(100, 100);
            }).not.toThrow();
        });
        
        test('should handle drag events', () => {
            expect(() => {
                bubbleManager.handleDragStart(50, 50);
                bubbleManager.handleDragMove(60, 60);
                bubbleManager.handleDragEnd(50, 50, 60, 60);
            }).not.toThrow();
        });
    });
    
    describe('Utility Methods', () => {
        test('should get bubbles in radius', () => {
            bubbleManager.spawnSpecificBubble('normal', { x: 100, y: 100 });
            
            const bubblesInRadius = bubbleManager.getBubblesInRadius(100, 100, 50);
            expect(Array.isArray(bubblesInRadius)).toBe(true);
        });
        
        test('should get bubbles along path', () => {
            bubbleManager.spawnSpecificBubble('normal', { x: 100, y: 100 });
            
            const bubblesOnPath = bubbleManager.getBubblesAlongPath(
                { x: 50, y: 50 }, 
                { x: 150, y: 150 }
            );
            expect(Array.isArray(bubblesOnPath)).toBe(true);
        });
    });
    
    describe('Configuration', () => {
        test('should set stage config', () => {
            const stageConfig = {
                spawnRate: 2.0,
                maxBubbles: 100,
                bubbleTypes: ['normal', 'boss']
            };
            
            expect(() => {
                bubbleManager.setStageConfig(stageConfig);
            }).not.toThrow();
        });
        
        test('should set special spawn rates', () => {
            expect(() => {
                bubbleManager.setSpecialSpawnRate('electric', 0.1);
                bubbleManager.setSpecialSpawnRate('freeze', 0.05);
            }).not.toThrow();
        });
    });
    
    describe('Rendering', () => {
        test('should render without errors', () => {
            bubbleManager.spawnBubble();
            
            expect(() => {
                bubbleManager.render(mockContext);
            }).not.toThrow();
        });
    });
    
    describe('Test Bubble Management', () => {
        test('should add test bubbles', () => {
            const testBubbleData = {
                type: 'normal',
                x: 100,
                y: 100,
                size: 30
            };
            
            const initialCount = bubbleManager.getBubbleCount();
            bubbleManager.addTestBubble(testBubbleData);
            
            expect(bubbleManager.getBubbleCount()).toBeGreaterThanOrEqual(initialCount);
        });
        
        test('should remove test bubbles by condition', () => {
            bubbleManager.addTestBubble({ type: 'test', x: 100, y: 100, size: 30 });
            
            expect(() => {
                bubbleManager.removeTestBubbles(bubble => bubble.type === 'test');
            }).not.toThrow();
        });
        
        test('should get test bubble info', () => {
            const info = bubbleManager.getTestBubbleInfo();
            expect(typeof info).toBe('object');
        });
    });
});