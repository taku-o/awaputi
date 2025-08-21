/**
 * Bubble Class Test Suite
 * TypeScript移行 - Task 24対応
 * 
 * 統合テスト: 手動作成テスト + 自動生成テストの組み合わせ
 * このファイルは元のBubble.test.jsと TestConfigurationGenerator の出力を統合しています。
 * 
 * 最終更新: 2025-07-27 (Task 7.2)
 */
import { jest } from '@jest/globals';
import { Bubble } from '../../src/bubbles/Bubble.js';
import { BubbleType, Position, BubbleConfig } from '../../src/types/bubble.js';
import { MockCanvasRenderingContext2D } from '../../src/types/test.js';
describe('Bubble Class Tests', () => {
    let mockGameEngine: any,
    let mockContext: Partial<MockCanvasRenderingContext2D>,
    
    beforeEach(() => {
        // Mock context
        mockContext = {
            arc: jest.fn(
            fill: jest.fn(
            stroke: jest.fn(
            fillText: jest.fn(
            strokeText: jest.fn(
            save: jest.fn(
            restore: jest.fn(
            translate: jest.fn(
            scale: jest.fn(
            rotate: jest.fn(
            beginPath: jest.fn(
            closePath: jest.fn(
            createLinearGradient: jest.fn(() => ({
                addColorStop: jest.fn()),
            createRadialGradient: jest.fn(() => ({
                addColorStop: jest.fn())'),'
            fillStyle: ','
            strokeStyle: ','
            lineWidth: 1,
            font: ','
            textAlign: 'start' as CanvasTextAlign,
            textBaseline: 'alphabetic' as CanvasTextBaseline,
            globalAlpha: 1,
            shadowColor: ','
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0
    };
        // Mock GameEngine
        mockGameEngine = {
            canvas: { width: 800, height: 600 ','
            ctx: mockContext,
            currentStage: { name: 'normal' },
            getInputManager: jest.fn(() => ({
                isMousePressed: jest.fn(() => false),
                getMousePosition: jest.fn(() => ({ x: 0, y: 0 ))))
        );
        jest.clearAllMocks();
    }');'
    describe('Constructor and Basic Properties', (') => {'
        test('should create bubble with correct initial properties', () => {
            // Bubble constructor expects (type, position}');'
            const position: Position = { x: 100, y: 100 },
            const bubble = new Bubble('normal', position);
            expect(bubble.type').toBe('normal');'
            expect(bubble.position.x).toBe(100);
            expect(bubble.position.y).toBe(100);
            expect(bubble.isAlive).toBe(true);
            expect(bubble.age).toBe(0);
        }');'
        test('should initialize with type-specific configuration', (') => {'
            const position: Position = { x: 100, y: 100 },
            const normalBubble = new Bubble('normal', position);
            const config: BubbleConfig = normalBubble.getTypeConfig(
            // 基本プロパティの存在確認
            expect(config').toHaveProperty('health');'
            expect(config').toHaveProperty('score');'
            expect(config').toHaveProperty('size');'
            expect(config').toHaveProperty('maxAge');'
            // 値の型確認
            expect(typeof config.health').toBe('number');'
            expect(typeof config.score').toBe('number');'
            expect(typeof config.size').toBe('number');'
            expect(typeof config.maxAge').toBe('number');'
        }');'
    }
    describe('Configuration Values (Based on Current GameBalance.js')', (') => {
        test('normal bubble should have correct configuration', (') => {'
            const position: Position = { x: 100, y: 100 },
            const bubble = new Bubble('normal', position);
            const config = bubble.getTypeConfig();
            expect(config.health).toBe(1);
            expect(config.score).toBe(15); // From hardcoded config
            expect(config.size).toBe(50);
            expect(config.maxAge).toBe(12000); // Updated from implementation
        }');'
        test('stone bubble should have correct configuration', (') => {'
            const position: Position = { x: 100, y: 100 },
            const bubble = new Bubble('stone', position);
            const config = bubble.getTypeConfig();
            expect(config.health).toBe(2);
            expect(config.score).toBe(25); // From hardcoded config
            expect(config.size).toBe(55);
        }');'
        test('boss bubble should have correct configuration', (') => {'
            const position: Position = { x: 100, y: 100 },
            const bubble = new Bubble('boss', position);
            const config = bubble.getTypeConfig();
            expect(config.health).toBe(8); // From hardcoded implementation
            expect(config.score).toBe(100); // From hardcoded config
            expect(config.size).toBe(90); // From hardcoded implementation
        }');'
        test('pink bubble should have healing properties', (') => {'
            const position: Position = { x: 100, y: 100 },
            const bubble = new Bubble('pink', position);
            const config = bubble.getTypeConfig();
            expect(config.score).toBe(20); // From hardcoded config
            expect(config.healAmount).toBe(25);
            expect(config.color').toBe('#FFB6C1');'
        }');'
        test('electric bubble should have special effects', (') => {'
            const position: Position = { x: 100, y: 100 },
            const bubble = new Bubble('electric', position);
            const config = bubble.getTypeConfig();
            expect(config.shakeIntensity).toBeDefined();
            expect(config.shakeIntensity).toBe(15); // From hardcoded config
            expect(config.disableDuration).toBe(1500); // From hardcoded config
        }');'
        test('rainbow bubble should have special effects', (') => {'
            const position: Position = { x: 100, y: 100 },
            const bubble = new Bubble('rainbow', position);
            const config = bubble.getTypeConfig();
            expect(config.bonusTimeMs).toBeDefined();
            expect(config.bonusTimeMs).toBe(8000); // From hardcoded config
        }');'
    }
    describe('Bubble Behavior', (') => {'
        test('should age correctly over time', (') => {'
            const position: Position = { x: 100, y: 100 },
            const bubble = new Bubble('normal', position);
            const initialAge = bubble.age;
            
            bubble.update(16.67); // One frame at 60fps
            expect(bubble.age).toBeGreaterThan(initialAge);
        }');'
        test('should handle damage correctly', (') => {'
            const position: Position = { x: 100, y: 100 },
            const bubble = new Bubble('normal', position);
            const initialHealth = bubble.health;
            
            const destroyed = bubble.takeDamage(1);
            expect(bubble.health).toBe(initialHealth - 1);
            expect(destroyed).toBe(true); // Normal bubble has 1 health
            expect(bubble.isAlive).toBe(false);
        }');'
        test('should handle boundary collision', (') => {'
            const position: Position = { x: 10, y: 10 },
            const bubble = new Bubble('normal', position);
            bubble.velocity = { x: -100, y: -100 },
            
            bubble.handleBoundaryCollision();
            // Should bounce off boundaries
            expect(bubble.velocity.x).toBeGreaterThanOrEqual(0);
            expect(bubble.velocity.y).toBeGreaterThanOrEqual(0);
        }');'
        test('escaping bubble should flee from mouse', (') => {'
            const position: Position = { x: 100, y: 100 },
            const bubble = new Bubble('escaping', position);
            const mousePosition: Position = { x: 110, y: 110 },
            
            bubble.handleEscapingBehavior(mousePosition, 16.67);
            // Should move away from mouse
            expect(bubble.velocity.x).toBeLessThan(0);
            expect(bubble.velocity.y).toBeLessThan(0);
        }');'
    }
    describe('Special Effects', (') => {'
        test('should trigger heal effect for pink bubble', (') => {'
            const position: Position = { x: 100, y: 100 },
            const bubble = new Bubble('pink', position);
            bubble.destroy();
            const effects = bubble.getAndClearEffects();
            expect(effects).toHaveLength(1);
            expect(effects[0].type').toBe('heal');'
            expect(effects[0].amount).toBe(25);
        }');'
        test('should trigger chain destroy effect for spiky bubble', (') => {'
            const position: Position = { x: 100, y: 100 },
            const bubble = new Bubble('spiky', position);
            bubble.destroy();
            const effects = bubble.getAndClearEffects();
            expect(effects).toHaveLength(1);
            expect(effects[0].type').toBe('chain_destroy');'
            expect(effects[0].radius).toBe(120);
        }');'
        test('should trigger time stop effect for clock bubble', (') => {'
            const position: Position = { x: 100, y: 100 },
            const bubble = new Bubble('clock', position);
            bubble.destroy();
            const effects = bubble.getAndClearEffects();
            expect(effects).toHaveLength(1);
            expect(effects[0].type').toBe('time_stop');'
            expect(effects[0].duration).toBe(2500);
        }');'
    }
    describe('Rendering', (') => {'
        test('should render bubble correctly', (') => {'
            const position: Position = { x: 100, y: 100 },
            const bubble = new Bubble('normal', position);
            bubble.render(mockContext as CanvasRenderingContext2D);
            expect(mockContext.save).toHaveBeenCalled();
            expect(mockContext.beginPath).toHaveBeenCalled();
            expect(mockContext.arc).toHaveBeenCalledWith(100, 100, 50, 0, Math.PI * 2);
            expect(mockContext.fill).toHaveBeenCalled();
            expect(mockContext.restore).toHaveBeenCalled();
        }');'
        test('should render special icon for special bubbles', (') => {'
            const position: Position = { x: 100, y: 100 },
            const bubble = new Bubble('pink', position);
            bubble.render(mockContext as CanvasRenderingContext2D);
            expect(mockContext.fillText').toHaveBeenCalledWith('♥', 100, 95);'
        }');'
        test('should display health for hard bubbles', (') => {'
            const position: Position = { x: 100, y: 100 },
            const bubble = new Bubble('stone', position);
            bubble.render(mockContext as CanvasRenderingContext2D);
            expect(mockContext.fillText').toHaveBeenCalledWith('2', 100, 100);'
        }');'
    }
    describe('Score Calculation', (') => {'
        test('should calculate base score correctly', (') => {'
            const position: Position = { x: 100, y: 100 },
            const bubble = new Bubble('normal', position);
            const score = bubble.getScore();
            expect(score).toBe(15);
        }');'
        test('should apply early pop bonus', (') => {'
            const position: Position = { x: 100, y: 100 },
            const bubble = new Bubble('normal', position);
            bubble.age = 100; // Very young
            
            const score = bubble.getScore();
            expect(score).toBe(30); // 2x bonus
        }');'
        test('should apply late pop bonus', (') => {'
            const position: Position = { x: 100, y: 100 },
            const bubble = new Bubble('normal', position);
            bubble.age = bubble.maxAge * 0.95; // Almost burst
            
            const score = bubble.getScore();
            expect(score).toBe(45); // 3x bonus
        }');'
    }
    describe('Type-specific behaviors', (') => {'
        const bubbleTypes: BubbleType[] = [
            'normal', 'stone', 'iron', 'diamond', 'pink', 'poison',
            'spiky', 'rainbow', 'clock', 'score', 'electric', 'escaping',
            'cracked', 'boss', 'golden', 'frozen', 'magnetic', 'explosive',
            'phantom', 'multiplier'
        ],
        
        test.each(bubbleTypes')('%s bubble should have valid configuration', (type) => {'
            const position: Position = { x: 100, y: 100 },
            const bubble = new Bubble(type, position);
            const config = bubble.getTypeConfig();
            expect(config.health).toBeGreaterThan(0);
            expect(config.size).toBeGreaterThan(0);
            expect(config.score).toBeGreaterThan(0);
            expect(config.maxAge).toBeGreaterThan(0);
            expect(config.color).toBeTruthy();
        };
    }
}');'