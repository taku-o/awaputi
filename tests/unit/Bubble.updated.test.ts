/**
 * Bubble Class Test Suite
 * 
 * 統合テスト: 手動作成テスト + 自動生成テストの組み合わせ
 * このファイルは元のBubble.test.jsと TestConfigurationGenerator の出力を統合しています。
 * 
 * 最終更新: 2025-07-27 (Task 7.2)
 */
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { Bubble } from '../../src/bubbles/Bubble.js';

// Type definitions
interface MockCanvasContext {
    arc: jest.Mock;
    fill: jest.Mock;
    stroke: jest.Mock;
    fillText: jest.Mock;
    strokeText: jest.Mock;
    save: jest.Mock;
    restore: jest.Mock;
    translate: jest.Mock;
    scale: jest.Mock;
    rotate: jest.Mock;
    beginPath: jest.Mock;
    closePath: jest.Mock;
    fillStyle: string;
    strokeStyle: string;
    lineWidth: number;
    font: string;
    textAlign: string;
    textBaseline: string;
    globalAlpha: number;
}

interface MockGameEngine {
    canvas: { width: number; height: number };
    ctx: MockCanvasContext;
    currentStage: { name: string };
    getInputManager: jest.Mock<() => {
        isMousePressed: jest.Mock<() => boolean>;
        getMousePosition: jest.Mock<() => { x: number; y: number }>;
    }>;
}

interface BubbleConfig {
    health: number;
    score: number;
    size: number;
    maxAge: number;
    healAmount?: number;
    color?: string;
    effects?: {
        intensity?: number;
        duration?: number;
    };
    escapeDistance?: number;
    damageAmount?: number;
    poisonDamage?: number;
    minSize: number;
}

interface TestMetadata {
    generatedAt: string;
    sourceFiles: string[];
    testTypes: string[];
    bubbleTypesCount: number;
}
// Mock dependencies
jest.mock('../../src/core/ConfigurationManager.js', () => ({
    getConfigurationManager: jest.fn(() => ({
        get: jest.fn(),
        watch: jest.fn(),
        set: jest.fn()
    }))
}));

jest.mock('../../src/utils/ErrorHandler.js', () => ({
    getErrorHandler: jest.fn(() => ({
        handleError: jest.fn()
    }))
}));

describe('Bubble Class Tests', () => {
    let mockGameEngine: MockGameEngine;

    beforeEach(() => {
        // Mock GameEngine
        mockGameEngine = {
            canvas: { width: 800, height: 600 },
            ctx: {
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
                fillStyle: '',
                strokeStyle: '',
                lineWidth: 1,
                font: '',
                textAlign: '',
                textBaseline: '',
                globalAlpha: 1
            },
            currentStage: { name: 'normal' },
            getInputManager: jest.fn(() => ({
                isMousePressed: jest.fn(() => false),
                getMousePosition: jest.fn(() => ({ x: 0, y: 0 }))
            }))
        };

        jest.clearAllMocks()
    });

    describe('基本的な初期化', () => {

        test('should create a bubble with default properties', () => {
            const bubble = new Bubble(100, 200, 'normal', mockGameEngine as any);
            
            expect(bubble.x).toBe(100);
            expect(bubble.y).toBe(200);
            expect(bubble.type).toBe('normal');
            expect(bubble.isAlive).toBe(true);
            expect(bubble.radius).toBeGreaterThan(0)
        
});
test('should initialize with correct bubble type configuration', () => {
            const bubble = new Bubble(100, 200, 'diamond', mockGameEngine as any);
            
            expect(bubble.type).toBe('diamond');
            expect(bubble.health).toBeGreaterThan(0);
            expect(bubble.score).toBeGreaterThan(0)
        
});

        test('should handle invalid bubble type gracefully', () => {
            expect(() => {
                new Bubble(100, 200, 'invalid_type', mockGameEngine as any)
            }).not.toThrow()
        })
    });

    describe('バブルタイプ別テスト', () => {
        const bubbleTypes = ['normal', 'stone', 'iron', 'diamond', 'boss', 'pink', 'poison', 'spiky', 'electric', 'rainbow'];

        bubbleTypes.forEach(type => {
            test(`should create ${type} bubble with appropriate configuration`, () => {
                const bubble = new Bubble(150, 150, type, mockGameEngine as any);
                
                expect(bubble.type).toBe(type);
                expect(bubble.isAlive).toBe(true);
                expect(bubble.x).toBe(150);
                expect(bubble.y).toBe(150);
                
                // Type-specific checks
                if (type === 'boss') {
                    expect(bubble.health).toBeGreaterThan(50);
                }
                if (type === 'diamond') {
                    expect(bubble.score).toBeGreaterThanOrEqual(100);
                }
            });
        });
    });

    describe('バブル描画', () => {

        test('should render bubble correctly', () => {
            const bubble = new Bubble(100, 100, 'normal', mockGameEngine as any);
            bubble.render();

            expect(mockGameEngine.ctx.save).toHaveBeenCalled();
            expect(mockGameEngine.ctx.beginPath).toHaveBeenCalled();
            expect(mockGameEngine.ctx.arc).toHaveBeenCalledWith(100, 100, expect.any(Number), 0, expect.any(Number));
            expect(mockGameEngine.ctx.fill).toHaveBeenCalled();
            expect(mockGameEngine.ctx.restore).toHaveBeenCalled()
        
});
test('should render special effects for electric bubble', () => {
            const bubble = new Bubble(100, 100, 'electric', mockGameEngine as any);
            bubble.render();

            expect(mockGameEngine.ctx.save).toHaveBeenCalled();
            expect(mockGameEngine.ctx.restore).toHaveBeenCalled()
        
});

        test('should render rainbow bubble with gradient', () => {

            const bubble = new Bubble(100, 100, 'rainbow', mockGameEngine as any);
            bubble.render();

            expect(mockGameEngine.ctx.save).toHaveBeenCalled();
            expect(mockGameEngine.ctx.restore).toHaveBeenCalled()
        
})
 
});

    describe('バブル更新', () => {
        test('should update bubble position and state', () => {
            const bubble = new Bubble(100, 100, 'normal', mockGameEngine as any);
            const initialAge = bubble.age;
            
            bubble.update(16); // 16ms delta time
            
            expect(bubble.age).toBeGreaterThan(initialAge)
        });

        test('should handle bubble aging', () => {
            const bubble = new Bubble(100, 100, 'normal', mockGameEngine as any);
            
            // Simulate aging beyond maxAge
            for (let i = 0; i < 1000; i++) {
                bubble.update(100); // Large delta to speed up aging
            }
            
            // Bubble may become inactive or change state based on age
            expect(bubble.age).toBeGreaterThan(0)
        });

        test('should handle escaping bubble behavior', () => {

            const bubble = new Bubble(100, 100, 'escaping', mockGameEngine as any);
            const initialY = bubble.y;
            
            bubble.update(16);
            
            // Escaping bubbles should move upward
            expect(bubble.y).toBeLessThanOrEqual(initialY)
        
})
 
});

    describe('バブル衝突検出', () => {

        test('should detect collision with another bubble', () => {
            const bubble1 = new Bubble(100, 100, 'normal', mockGameEngine as any);
            const bubble2 = new Bubble(110, 110, 'normal', mockGameEngine as any);
            
            const collision = bubble1.isCollidingWith(bubble2);
            expect(typeof collision).toBe('boolean')
        
});
test('should not collide with distant bubbles', () => {
            const bubble1 = new Bubble(100, 100, 'normal', mockGameEngine as any);
            const bubble2 = new Bubble(500, 500, 'normal', mockGameEngine as any);
            
            expect(bubble1.isCollidingWith(bubble2)).toBe(false)
        
});

        test('should handle collision with point', () => {

            const bubble = new Bubble(100, 100, 'normal', mockGameEngine as any);
            
            expect(bubble.contains(100, 100)).toBe(true);
            expect(bubble.contains(200, 200)).toBe(false)
        
})
 
});

    describe('バブルダメージ処理', () => {

        test('should take damage and reduce health', () => {
            const bubble = new Bubble(100, 100, 'stone', mockGameEngine as any);
            const initialHealth = bubble.health;
            
            bubble.takeDamage(10);
            
            expect(bubble.health).toBeLessThan(initialHealth)
        
});
test('should die when health reaches zero', () => {
            const bubble = new Bubble(100, 100, 'normal', mockGameEngine as any);
            
            bubble.takeDamage(1000); // Large damage
            
            expect(bubble.isAlive).toBe(false)
        
});

        test('should handle poison damage over time', () => {

            const bubble = new Bubble(100, 100, 'poison', mockGameEngine as any);
            
            // Poison bubbles may have special damage behavior
            bubble.takeDamage(5);
            expect(bubble.health).toBeGreaterThanOrEqual(0)
        
})
 
});

    describe('特殊バブル効果', () => {

        test('should handle electric bubble effects', () => {
            const bubble = new Bubble(100, 100, 'electric', mockGameEngine as any);
            
            // Electric bubbles should have special properties
            expect(bubble.type).toBe('electric');
            expect(bubble.hasSpecialEffects()).toBe(true)
        
});
test('should handle rainbow bubble effects', () => {
            const bubble = new Bubble(100, 100, 'rainbow', mockGameEngine as any);
            
            expect(bubble.type).toBe('rainbow');
            expect(bubble.hasSpecialEffects()).toBe(true)
        
});

        test('should handle boss bubble properties', () => {

            const bubble = new Bubble(100, 100, 'boss', mockGameEngine as any);
            
            expect(bubble.type).toBe('boss');
            expect(bubble.health).toBeGreaterThan(50);
            expect(bubble.score).toBeGreaterThan(50)
        
})
 
});

    describe('バブルクリック処理', () => {

        test('should handle click event', () => {
            const bubble = new Bubble(100, 100, 'normal', mockGameEngine as any);
            
            const result = bubble.onClick();
            expect(typeof result).toBe('boolean')
        
});
test('should not respond to clicks when dead', () => {
            const bubble = new Bubble(100, 100, 'normal', mockGameEngine as any);
            bubble.isAlive = false;
            
            const result = bubble.onClick();
            expect(result).toBe(false)
        
});

        test('should handle spiky bubble click damage', () => {

            const bubble = new Bubble(100, 100, 'spiky', mockGameEngine as any);
            
            // Spiky bubbles may damage the player on click
            const result = bubble.onClick();
            expect(typeof result).toBe('boolean')
        
})
 
});

    describe('パフォーマンステスト', () => {
        test('should handle many bubble updates efficiently', () => {
            const bubbles = Array.from({ length: 100 }, (_, i) => 
                new Bubble(i * 10, i * 10, 'normal', mockGameEngine as any)
            );
            
            const startTime = performance.now();
            bubbles.forEach(bubble => bubble.update(16));
            const endTime = performance.now();
            
            expect(endTime - startTime).toBeLessThan(100); // Should complete in < 100ms
        });

        test('should handle many bubble renders efficiently', () => {
            const bubbles = Array.from({ length: 50 }, (_, i) => 
                new Bubble(i * 15, i * 15, 'normal', mockGameEngine as any)
            );
            
            const startTime = performance.now();
            bubbles.forEach(bubble => bubble.render());
            const endTime = performance.now();
            
            expect(endTime - startTime).toBeLessThan(50); // Should complete in < 50ms
        })
    });

    describe('エラーハンドリング', () => {
        test('should handle null game engine gracefully', () => {
            expect(() => {
                new Bubble(100, 100, 'normal', null as any)
            }).not.toThrow()
        });

        test('should handle invalid coordinates', () => {
            expect(() => {
                new Bubble(NaN, Infinity, 'normal', mockGameEngine as any)
            }).not.toThrow()
        });

        test('should handle extreme damage values', () => {
            const bubble = new Bubble(100, 100, 'normal', mockGameEngine as any);
            
            expect(() => {
                bubble.takeDamage(Infinity)
            }).not.toThrow();
            
            expect(() => {
                bubble.takeDamage(-100)
            }).not.toThrow()
        })
    });

    describe('テストメタデータ', () => {
        test('should have proper test metadata', () => {
            const metadata: TestMetadata = {
                generatedAt: new Date().toISOString(),
                sourceFiles: ['Bubble.js', 'GameBalance.js'],
                testTypes: ['unit', 'integration'],
                bubbleTypesCount: 10
            };
            
            expect(metadata.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
            expect(metadata.sourceFiles.length).toBeGreaterThan(0);
            expect(metadata.testTypes.length).toBeGreaterThan(0);
            expect(metadata.bubbleTypesCount).toBeGreaterThan(0);
        });
    });
});