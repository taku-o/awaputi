/**
 * Bubble Class Test Suite
 * TypeScript移行 - Task 24対応
 * 
 * 統合テスト: 手動作成テスト + 自動生成テストの組み合わせ
 * このファイルは元のBubble.test.jsと TestConfigurationGenerator の出力を統合しています。
 * 
 * 最終更新: 2025-07-27 (Task 7.2)
 */
import { jest, describe, test, beforeEach, expect } from '@jest/globals';
import { Bubble } from '../../src/bubbles/Bubble.js';
import { BubbleType, Position, BubbleConfig } from '../../src/types/bubble.js';
import { MockCanvasRenderingContext2D } from '../../src/types/test.js';

describe('Bubble Class Tests', () => {
    let mockGameEngine: any;
    let mockContext: Partial<MockCanvasRenderingContext2D>;
    
    beforeEach(() => {
        // Mock context
        mockContext = {
            arc: jest.fn(),
            fill: jest.fn(),
            stroke: jest.fn(),
            fillText: jest.fn(),
            strokeText: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            scale: jest.fn(),
            rotate: jest.fn(),
            beginPath: jest.fn(),
            closePath: jest.fn(),
            createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
            createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            font: '',
            textAlign: 'start' as CanvasTextAlign,
            textBaseline: 'alphabetic' as CanvasTextBaseline,
            globalAlpha: 1,
            shadowColor: '',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0
        };
        
        // Mock GameEngine
        mockGameEngine = {
            canvas: { width: 800, height: 600 },
            ctx: mockContext,
            currentStage: { name: 'normal' },
            getInputManager: jest.fn(() => ({
                isMousePressed: jest.fn(() => false),
                getMousePosition: jest.fn(() => ({ x: 0, y: 0 }))
            }))
        };
        
        jest.clearAllMocks()
    });
    
    describe('Constructor and Basic Properties', () => {
        test('should create bubble with correct initial properties', () => {
            // Bubble constructor expects (type, position)
            const position: Position = { x: 100, y: 100 };
            const bubble = new Bubble('normal', position);
            
            expect(bubble.type).toBe('normal');
            expect(bubble.position.x).toBe(100);
            expect(bubble.position.y).toBe(100);
            expect(bubble.isAlive).toBe(true);
            expect(bubble.age).toBe(0)
        });
        
        test('should initialize with type-specific configuration', () => {
            const position: Position = { x: 100, y: 100 };
            const normalBubble = new Bubble('normal', position);
            const config: BubbleConfig = normalBubble.getTypeConfig();
            
            // 基本プロパティの存在確認
            expect(config).toHaveProperty('health');
            expect(config).toHaveProperty('score');
            expect(config).toHaveProperty('size');
            expect(config).toHaveProperty('maxAge');
            
            // 値の型確認
            expect(typeof config.health).toBe('number');
            expect(typeof config.score).toBe('number');
            expect(typeof config.size).toBe('number');
            expect(typeof config.maxAge).toBe('number')
        })
    });
    
    describe('Configuration Values (Based on Current GameBalance.js)', () => {
        test('normal bubble should have correct configuration', () => {
            const position: Position = { x: 100, y: 100 };
            const bubble = new Bubble('normal', position);
            const config = bubble.getTypeConfig();
            
            expect(config.health).toBe(1);
            expect(config.score).toBe(15); // From hardcoded config
            expect(config.size).toBe(50);
            expect(config.maxAge).toBe(12000); // Updated from implementation
        });
        
        test('stone bubble should have correct configuration', () => {
            const position: Position = { x: 100, y: 100 };
            const bubble = new Bubble('stone', position);
            const config = bubble.getTypeConfig();
            
            expect(config.health).toBe(2);
            expect(config.score).toBe(25); // From hardcoded config
            expect(config.size).toBe(55)
        });
        
        test('boss bubble should have correct configuration', () => {
            const position: Position = { x: 100, y: 100 };
            const bubble = new Bubble('boss', position);
            const config = bubble.getTypeConfig();
            
            expect(config.health).toBe(8); // From hardcoded implementation
            expect(config.score).toBe(100); // From hardcoded config
            expect(config.size).toBe(90); // From hardcoded implementation
        });
        
        test('pink bubble should have healing properties', () => {
            const position: Position = { x: 100, y: 100 };
            const bubble = new Bubble('pink', position);
            const config = bubble.getTypeConfig();
            
            expect(config.score).toBe(20); // From hardcoded config
            expect(config.healAmount).toBe(25)
        })
    });
    
    describe('Bubble State Management', () => {
        test('should manage health correctly', () => {
            const position: Position = { x: 100, y: 100 };
            const bubble = new Bubble('stone', position);
            
            expect(bubble.health).toBe(2);
            expect(bubble.isAlive).toBe(true);
            
            bubble.takeDamage(1);
            expect(bubble.health).toBe(1);
            expect(bubble.isAlive).toBe(true);
            
            bubble.takeDamage(1);
            expect(bubble.health).toBe(0);
            expect(bubble.isAlive).toBe(false)
        });
        
        test('should handle over-damage correctly', () => {
            const position: Position = { x: 100, y: 100 };
            const bubble = new Bubble('normal', position);
            
            bubble.takeDamage(5); // More than health
            expect(bubble.health).toBe(0);
            expect(bubble.isAlive).toBe(false)
        });
        
        test('should prevent negative health', () => {
            const position: Position = { x: 100, y: 100 };
            const bubble = new Bubble('normal', position);
            
            bubble.takeDamage(10);
            expect(bubble.health).toBe(0);
            expect(bubble.health).toBeGreaterThanOrEqual(0)
        })
    });
    
    describe('Bubble Age and Lifecycle', () => {
        test('should track age correctly', () => {
            const position: Position = { x: 100, y: 100 };
            const bubble = new Bubble('normal', position);
            
            expect(bubble.age).toBe(0);
            
            bubble.update(100); // 100ms elapsed
            expect(bubble.age).toBe(100);
            
            bubble.update(150); // Another 150ms elapsed
            expect(bubble.age).toBe(250)
        });
        
        test('should expire when max age is reached', () => {
            const position: Position = { x: 100, y: 100 };
            const bubble = new Bubble('normal', position);
            const config = bubble.getTypeConfig();
            
            expect(bubble.isAlive).toBe(true);
            
            // Age the bubble to just before max age
            bubble.update(config.maxAge - 1);
            expect(bubble.isAlive).toBe(true);
            
            // Age beyond max age
            bubble.update(2);
            expect(bubble.isAlive).toBe(false)
        })
    });
    
    describe('Bubble Rendering', () => {
        test('should call render methods correctly', () => {
            const position: Position = { x: 100, y: 100 };
            const bubble = new Bubble('normal', position);
            
            bubble.render(mockContext as CanvasRenderingContext2D);
            
            expect(mockContext.save).toHaveBeenCalled();
            expect(mockContext.restore).toHaveBeenCalled();
            expect(mockContext.beginPath).toHaveBeenCalled();
            expect(mockContext.arc).toHaveBeenCalled();
            expect(mockContext.fill).toHaveBeenCalled()
        });
        
        test('should render with correct position and size', () => {
            const position: Position = { x: 150, y: 200 };
            const bubble = new Bubble('normal', position);
            const config = bubble.getTypeConfig();
            
            bubble.render(mockContext as CanvasRenderingContext2D);
            
            expect(mockContext.arc).toHaveBeenCalledWith(
                position.x,
                position.y,
                config.size / 2,
                0,
                Math.PI * 2
            )
        })
    });
    
    describe('Bubble Types', () => {
        const types: BubbleType[] = ['normal', 'stone', 'boss', 'pink', 'rainbow', 'coin', 'bomb', 'freeze', 'multicolor'];
        
        types.forEach(type => {
            test(`should create ${type} bubble successfully`, () => {
                const position: Position = { x: 100, y: 100 };
                const bubble = new Bubble(type, position);
                
                expect(bubble.type).toBe(type);
                expect(bubble.isAlive).toBe(true);
                expect(bubble.position).toEqual(position)
            })
        })
    });
    
    describe('Special Bubble Properties', () => {
        test('rainbow bubble should have special effects', () => {
            const position: Position = { x: 100, y: 100 };
            const bubble = new Bubble('rainbow', position);
            
            expect(bubble.hasSpecialEffect).toBe(true);
            expect(bubble.getSpecialEffectType()).toBe('rainbow')
        });
        
        test('bomb bubble should have explosion capability', () => {
            const position: Position = { x: 100, y: 100 };
            const bubble = new Bubble('bomb', position);
            
            expect(bubble.hasSpecialEffect).toBe(true);
            expect(bubble.getSpecialEffectType()).toBe('explosion')
        });
        
        test('freeze bubble should have freeze capability', () => {
            const position: Position = { x: 100, y: 100 };
            const bubble = new Bubble('freeze', position);
            
            expect(bubble.hasSpecialEffect).toBe(true);
            expect(bubble.getSpecialEffectType()).toBe('freeze')
        })
    });
    
    describe('Bubble Collision Detection', () => {
        test('should detect collision with another bubble', () => {
            const position1: Position = { x: 100, y: 100 };
            const position2: Position = { x: 120, y: 100 }; // Close enough to collide
            
            const bubble1 = new Bubble('normal', position1);
            const bubble2 = new Bubble('normal', position2);
            
            expect(bubble1.isCollidingWith(bubble2)).toBe(true)
        });
        
        test('should not detect collision when bubbles are far apart', () => {
            const position1: Position = { x: 100, y: 100 };
            const position2: Position = { x: 300, y: 300 }; // Far apart
            
            const bubble1 = new Bubble('normal', position1);
            const bubble2 = new Bubble('normal', position2);
            
            expect(bubble1.isCollidingWith(bubble2)).toBe(false)
        })
    });
    
    describe('Performance Tests', () => {
        test('should handle many bubble updates efficiently', () => {
            const bubbles: Bubble[] = [];
            
            // Create many bubbles
            for (let i = 0; i < 1000; i++) {
                const position: Position = { x: Math.random() * 800, y: Math.random() * 600 };
                bubbles.push(new Bubble('normal', position))
            }
            
            const startTime = performance.now();
            
            // Update all bubbles
            bubbles.forEach(bubble => {
                if (bubble.isAlive) {
                    bubble.update(16); // ~60fps
                }
            });
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            expect(duration).toBeLessThan(100); // Should complete in less than 100ms
        });
    });
});