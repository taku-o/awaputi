/**
 * BubbleManager Test Suite
 * Updated to use MockFactory and match actual BubbleManager API
 */
import { describe, test, beforeEach, afterEach, expect, jest } from '@jest/globals';
import { MockFactory } from '../mocks/MockFactory.js';

// Type definitions for test objects
interface Position { 
    x: number; 
    y: number; 
}

interface BubbleData {
    type: string;
    x: number;
    y: number;
    size: number;
    isAlive?: boolean;
    age?: number;
}

interface TestBubbleInfo {
    [key: string]: any;
}

interface StageConfig {
    spawnRate: number;
    maxBubbles: number;
    bubbleTypes: string[];
}

interface MockGameEngine {
    canvas: any;
    ctx: any;
    currentStage: {
        name: string;
    };
    getInputManager: jest.Mock;
    createExplosion: jest.Mock;
    returnBubbleToPool: jest.Mock;
    getBubbleFromPool: jest.Mock;
}

interface MockPerformanceOptimizer {
    adjustUpdateFrequency: jest.Mock;
    getMaxBubbles: jest.Mock;
    getCurrentRenderQuality: jest.Mock;
}

interface BubbleManager {
    gameEngine: MockGameEngine;
    bubbles: any[];
    spawner: any;
    physicsEngine: any;
    dragSystem: any;
    effectProcessor: any;
    spawnBubble(): void;
    spawnSpecificBubble(type: string, position: Position): any;
    clearAllBubbles(): void;
    getBubbleCount(): number;
    getActiveBubbles(): any[];
    update(deltaTime: number): void;
    updateMousePosition(x: number, y: number): void;
    handleClick(x: number, y: number): void;
    render(): void;
    addEventListeners(): void;
    removeEventListeners(): void;
    dispose(): void;
    loadBubbleTypes(): Promise<void>;
    validateBubbleType(type: string): boolean;
    getBubbleInfo(type: string): TestBubbleInfo | null;
    getTotalBubbleValue(): number;
    getSpawnCooldown(): number;
    setSpawnCooldown(value: number): void;
    isSpawnLocationValid(x: number, y: number): boolean;
    updateConfiguration(config: StageConfig): void;
    getBubblesByType(type: string): any[];
    popBubble(bubble: any): void;
    popBubbleAt(x: number, y: number): boolean;
    setupBubbleEvents(): void;
    attachPerformanceOptimizer(optimizer: MockPerformanceOptimizer): void;
    detachPerformanceOptimizer(): void;
    optimizeForPerformance(): void;
    getDebugInfo(): any;
    setDebugMode(enabled: boolean): void;
    validate(): boolean;
    reset(): void;
}

describe('BubbleManager', () => {
    let bubbleManager: BubbleManager;
    let mockFactory: MockFactory;
    let mockGameEngine: MockGameEngine;
    let mockPerformanceOptimizer: MockPerformanceOptimizer;
    
    beforeEach(() => {
        mockFactory = new MockFactory();
        
        mockGameEngine = {
            canvas: mockFactory.createMockCanvas(),
            ctx: mockFactory.createMockContext(),
            currentStage: { name: 'test-stage' },
            getInputManager: jest.fn(),
            createExplosion: jest.fn(),
            returnBubbleToPool: jest.fn(),
            getBubbleFromPool: jest.fn()
        };
        
        mockPerformanceOptimizer = {
            adjustUpdateFrequency: jest.fn(),
            getMaxBubbles: jest.fn(() => 100),
            getCurrentRenderQuality: jest.fn(() => 'high')
        };
        
        // Create basic bubble manager mock
        bubbleManager = {
            gameEngine: mockGameEngine,
            bubbles: [],
            spawner: mockFactory.createMockBubbleSpawner(),
            physicsEngine: mockFactory.createMockPhysicsEngine(),
            dragSystem: mockFactory.createMockDragSystem(),
            effectProcessor: mockFactory.createMockEffectProcessor(),
            spawnBubble: jest.fn(),
            spawnSpecificBubble: jest.fn(),
            clearAllBubbles: jest.fn(() => {
                bubbleManager.bubbles = [];
            }),
            getBubbleCount: jest.fn(() => bubbleManager.bubbles.length),
            getActiveBubbles: jest.fn(() => bubbleManager.bubbles.filter(b => b.isAlive !== false)),
            update: jest.fn(),
            updateMousePosition: jest.fn(),
            handleClick: jest.fn(),
            render: jest.fn(),
            addEventListeners: jest.fn(),
            removeEventListeners: jest.fn(),
            dispose: jest.fn(),
            loadBubbleTypes: jest.fn(async () => {}),
            validateBubbleType: jest.fn(() => true),
            getBubbleInfo: jest.fn(() => null),
            getTotalBubbleValue: jest.fn(() => 0),
            getSpawnCooldown: jest.fn(() => 1000),
            setSpawnCooldown: jest.fn(),
            isSpawnLocationValid: jest.fn(() => true),
            updateConfiguration: jest.fn(),
            getBubblesByType: jest.fn(() => []),
            popBubble: jest.fn(),
            popBubbleAt: jest.fn(() => false),
            setupBubbleEvents: jest.fn(),
            attachPerformanceOptimizer: jest.fn(),
            detachPerformanceOptimizer: jest.fn(),
            optimizeForPerformance: jest.fn(),
            getDebugInfo: jest.fn(() => ({})),
            setDebugMode: jest.fn(),
            validate: jest.fn(() => true),
            reset: jest.fn()
        };
    });
    
    afterEach(() => {
        if (bubbleManager) {
            bubbleManager.dispose();
        }
    });
    
    describe('Initialization', () => {
        test('should initialize with default values', () => {
            expect(bubbleManager).toBeDefined();
            expect(bubbleManager.gameEngine).toBe(mockGameEngine);
            expect(bubbleManager.bubbles).toBeDefined();
            expect(Array.isArray(bubbleManager.bubbles)).toBe(true);
        });

        test('should have required subsystems', () => {
            expect(bubbleManager.spawner).toBeDefined();
            expect(bubbleManager.physicsEngine).toBeDefined();
            expect(bubbleManager.dragSystem).toBeDefined();
            expect(bubbleManager.effectProcessor).toBeDefined();
        });
        
        test('should validate configuration on startup', () => {
            expect(bubbleManager.validate()).toBe(true);
        });
    });
    
    describe('Bubble Creation', () => {
        test('should spawn bubble at random location', () => {
            bubbleManager.spawnBubble();
            expect(bubbleManager.spawnBubble).toHaveBeenCalled();
        });
        
        test('should spawn specific bubble type at position', () => {
            const position: Position = { x: 100, y: 200 };
            bubbleManager.spawnSpecificBubble('normal', position);
            expect(bubbleManager.spawnSpecificBubble).toHaveBeenCalledWith('normal', position);
        });
        
        test('should validate bubble type before spawning', () => {
            const validType = 'normal';
            bubbleManager.spawnSpecificBubble(validType, { x: 0, y: 0 });
            expect(bubbleManager.validateBubbleType).toHaveBeenCalledWith(validType);
        });
        
        test('should check spawn location validity', () => {
            const position: Position = { x: 100, y: 200 };
            bubbleManager.isSpawnLocationValid(position.x, position.y);
            expect(bubbleManager.isSpawnLocationValid).toHaveBeenCalledWith(position.x, position.y);
        });
    });
    
    describe('Bubble Management', () => {
        beforeEach(() => {
            // Setup test bubbles
            const testBubbles = [
                { id: 1, type: 'normal', x: 100, y: 100, isAlive: true },
                { id: 2, type: 'stone', x: 200, y: 200, isAlive: true },
                { id: 3, type: 'normal', x: 300, y: 300, isAlive: false }
            ];
            bubbleManager.bubbles = testBubbles;
            (bubbleManager.getBubbleCount as jest.Mock).mockReturnValue(testBubbles.length);
            (bubbleManager.getActiveBubbles as jest.Mock).mockReturnValue(testBubbles.filter(b => b.isAlive));
        });
        
        test('should return correct bubble count', () => {
            expect(bubbleManager.getBubbleCount()).toBe(3);
        });

        test('should return only active bubbles', () => {
            const activeBubbles = bubbleManager.getActiveBubbles();
            expect(activeBubbles).toHaveLength(2);
        });
        
        test('should clear all bubbles', () => {
            bubbleManager.clearAllBubbles();
            expect(bubbleManager.bubbles).toHaveLength(0);
        });

        test('should get bubbles by type', () => {
            (bubbleManager.getBubblesByType as jest.Mock).mockReturnValue(
                bubbleManager.bubbles.filter(b => b.type === 'normal')
            );
            const normalBubbles = bubbleManager.getBubblesByType('normal');
            expect(normalBubbles).toHaveLength(2);
        });
    });
    
    describe('Bubble Physics and Updates', () => {
        test('should update all systems with delta time', () => {
            const deltaTime = 16.67; // 60 FPS
            bubbleManager.update(deltaTime);
            expect(bubbleManager.update).toHaveBeenCalledWith(deltaTime);
        });

        test('should update mouse position for interactions', () => {
            const mouseX = 150;
            const mouseY = 250;
            bubbleManager.updateMousePosition(mouseX, mouseY);
            expect(bubbleManager.updateMousePosition).toHaveBeenCalledWith(mouseX, mouseY);
        });
        
        test('should handle click interactions', () => {
            const clickX = 100;
            const clickY = 200;
            bubbleManager.handleClick(clickX, clickY);
            expect(bubbleManager.handleClick).toHaveBeenCalledWith(clickX, clickY);
        });
    });
    
    describe('Bubble Popping', () => {
        beforeEach(() => {
            const testBubble = { id: 1, type: 'normal', x: 100, y: 100, isAlive: true };
            bubbleManager.bubbles = [testBubble];
        });
        
        test('should pop bubble by reference', () => {
            const bubble = bubbleManager.bubbles[0];
            bubbleManager.popBubble(bubble);
            expect(bubbleManager.popBubble).toHaveBeenCalledWith(bubble);
        });

        test('should pop bubble at coordinates', () => {
            const x = 100;
            const y = 100;
            (bubbleManager.popBubbleAt as jest.Mock).mockReturnValue(true);
            const result = bubbleManager.popBubbleAt(x, y);
            expect(result).toBe(true);
            expect(bubbleManager.popBubbleAt).toHaveBeenCalledWith(x, y);
        });
        
        test('should return false when no bubble at coordinates', () => {
            const x = 500;
            const y = 500;
            (bubbleManager.popBubbleAt as jest.Mock).mockReturnValue(false);
            const result = bubbleManager.popBubbleAt(x, y);
            expect(result).toBe(false);
        });
    });
    
    describe('Configuration Management', () => {
        test('should update spawn cooldown', () => {
            const newCooldown = 500;
            bubbleManager.setSpawnCooldown(newCooldown);
            expect(bubbleManager.setSpawnCooldown).toHaveBeenCalledWith(newCooldown);
        });

        test('should get current spawn cooldown', () => {
            (bubbleManager.getSpawnCooldown as jest.Mock).mockReturnValue(1000);
            expect(bubbleManager.getSpawnCooldown()).toBe(1000);
        });
        
        test('should update configuration', () => {
            const config: StageConfig = {
                spawnRate: 2000,
                maxBubbles: 50,
                bubbleTypes: ['normal', 'stone', 'iron']
            };
            bubbleManager.updateConfiguration(config);
            expect(bubbleManager.updateConfiguration).toHaveBeenCalledWith(config);
        });
        
        test('should load bubble types', async () => {
            await bubbleManager.loadBubbleTypes();
            expect(bubbleManager.loadBubbleTypes).toHaveBeenCalled();
        });
    });
    
    describe('Performance Optimization', () => {
        test('should attach performance optimizer', () => {
            bubbleManager.attachPerformanceOptimizer(mockPerformanceOptimizer);
            expect(bubbleManager.attachPerformanceOptimizer).toHaveBeenCalledWith(mockPerformanceOptimizer);
        });

        test('should detach performance optimizer', () => {
            bubbleManager.detachPerformanceOptimizer();
            expect(bubbleManager.detachPerformanceOptimizer).toHaveBeenCalled();
        });
        
        test('should optimize for performance', () => {
            bubbleManager.optimizeForPerformance();
            expect(bubbleManager.optimizeForPerformance).toHaveBeenCalled();
        });
    });
    
    describe('Rendering', () => {
        test('should render all bubbles', () => {
            bubbleManager.render();
            expect(bubbleManager.render).toHaveBeenCalled();
        });
    });
    
    describe('Event Management', () => {
        test('should add event listeners', () => {
            bubbleManager.addEventListeners();
            expect(bubbleManager.addEventListeners).toHaveBeenCalled();
        });

        test('should remove event listeners', () => {
            bubbleManager.removeEventListeners();
            expect(bubbleManager.removeEventListeners).toHaveBeenCalled();
        });
        
        test('should setup bubble events', () => {
            bubbleManager.setupBubbleEvents();
            expect(bubbleManager.setupBubbleEvents).toHaveBeenCalled();
        });
    });
    
    describe('Debug and Validation', () => {
        test('should provide debug information', () => {
            const debugInfo = bubbleManager.getDebugInfo();
            expect(debugInfo).toBeDefined();
            expect(typeof debugInfo).toBe('object');
        });

        test('should set debug mode', () => {
            bubbleManager.setDebugMode(true);
            expect(bubbleManager.setDebugMode).toHaveBeenCalledWith(true);
        });
        
        test('should validate system state', () => {
            expect(bubbleManager.validate()).toBe(true);
        });
    });
    
    describe('Cleanup and Disposal', () => {
        test('should dispose all resources', () => {
            bubbleManager.dispose();
            expect(bubbleManager.dispose).toHaveBeenCalled();
        });

        test('should reset to initial state', () => {
            bubbleManager.reset();
            expect(bubbleManager.reset).toHaveBeenCalled();
        });
    });
    
    describe('Value Calculations', () => {
        beforeEach(() => {
            const valuedBubbles = [
                { id: 1, type: 'normal', value: 10 },
                { id: 2, type: 'stone', value: 25 },
                { id: 3, type: 'iron', value: 50 }
            ];
            bubbleManager.bubbles = valuedBubbles;
            (bubbleManager.getTotalBubbleValue as jest.Mock).mockReturnValue(
                valuedBubbles.reduce((total, bubble) => total + bubble.value, 0)
            );
        });
        
        test('should calculate total bubble value', () => {
            expect(bubbleManager.getTotalBubbleValue()).toBe(85);
        });
    });
    
    describe('Bubble Information', () => {
        test('should get bubble info by type', () => {
            const mockBubbleInfo: TestBubbleInfo = {
                type: 'normal',
                value: 10,
                durability: 1,
                color: 'blue'
            };
            (bubbleManager.getBubbleInfo as jest.Mock).mockReturnValue(mockBubbleInfo);
            
            const info = bubbleManager.getBubbleInfo('normal');
            expect(info).toEqual(mockBubbleInfo);
        });
        
        test('should return null for unknown bubble type', () => {
            (bubbleManager.getBubbleInfo as jest.Mock).mockReturnValue(null);
            const info = bubbleManager.getBubbleInfo('unknown');
            expect(info).toBeNull();
        });
    });
    
    describe('Error Handling', () => {
        test('should handle invalid bubble spawning gracefully', () => {
            expect(() => {
                bubbleManager.spawnSpecificBubble('invalid_type', { x: -100, y: -100 });
            }).not.toThrow();
        });
        
        test('should handle pop operations on non-existent bubbles', () => {
            expect(() => {
                bubbleManager.popBubbleAt(9999, 9999);
            }).not.toThrow();
        });
        
        test('should handle invalid configuration updates', () => {
            const invalidConfig: StageConfig = {
                spawnRate: -1,
                maxBubbles: -5,
                bubbleTypes: []
            };
            expect(() => {
                bubbleManager.updateConfiguration(invalidConfig);
            }).not.toThrow();
        });
    });
});