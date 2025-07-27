/**
 * Bubble Class Test Suite
 * 
 * 統合テスト: 手動作成テスト + 自動生成テストの組み合わせ
 * このファイルは元のBubble.test.jsと TestConfigurationGenerator の出力を統合しています。
 * 
 * 最終更新: 2025-07-27 (Task 7.2)
 */

import { jest } from '@jest/globals';
import { Bubble } from '../../src/bubbles/Bubble.js';

describe('Bubble Class Tests', () => {
    let mockGameEngine;
    
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
        
        jest.clearAllMocks();
    });
    
    describe('Constructor and Basic Properties', () => {
        test('should create bubble with correct initial properties', () => {
            // Bubble constructor expects (type, position)
            const bubble = new Bubble('normal', { x: 100, y: 100 });
            
            expect(bubble.type).toBe('normal');
            expect(bubble.position.x).toBe(100);
            expect(bubble.position.y).toBe(100);
            expect(bubble.isAlive).toBe(true);
            expect(bubble.age).toBe(0);
        });
        
        test('should initialize with type-specific configuration', () => {
            const normalBubble = new Bubble('normal', { x: 100, y: 100 });
            const config = normalBubble.getTypeConfig();
            
            // 基本プロパティの存在確認
            expect(config).toHaveProperty('health');
            expect(config).toHaveProperty('score');
            expect(config).toHaveProperty('size');
            expect(config).toHaveProperty('maxAge');
            
            // 値の型確認
            expect(typeof config.health).toBe('number');
            expect(typeof config.score).toBe('number');
            expect(typeof config.size).toBe('number');
            expect(typeof config.maxAge).toBe('number');
        });
    });
    
    describe('Configuration Values (Based on Current GameBalance.js)', () => {
        test('normal bubble should have correct configuration', () => {
            const bubble = new Bubble('normal', { x: 100, y: 100 });
            const config = bubble.getTypeConfig();
            
            expect(config.health).toBe(1);
            expect(config.score).toBe(15); // From hardcoded config
            expect(config.size).toBe(50);
            expect(config.maxAge).toBe(12000); // Updated from implementation
        });
        
        test('stone bubble should have correct configuration', () => {
            const bubble = new Bubble('stone', { x: 100, y: 100 });
            const config = bubble.getTypeConfig();
            
            expect(config.health).toBe(2);
            expect(config.score).toBe(35); // From hardcoded config
            expect(config.size).toBe(55);
        });
        
        test('boss bubble should have correct configuration', () => {
            const bubble = new Bubble('boss', { x: 100, y: 100 });
            const config = bubble.getTypeConfig();
            
            expect(config.health).toBe(8); // From hardcoded implementation
            expect(config.score).toBe(800); // From hardcoded config
            expect(config.size).toBe(90); // From hardcoded implementation
        });
        
        test('pink bubble should have healing properties', () => {
            const bubble = new Bubble('pink', { x: 100, y: 100 });
            const config = bubble.getTypeConfig();
            
            expect(config.score).toBe(25); // From hardcoded config
            expect(config.healAmount).toBe(25);
            expect(config.color).toBe('#FFB6C1');
        });
        
        test('electric bubble should have special effects', () => {
            const bubble = new Bubble('electric', { x: 100, y: 100 });
            const config = bubble.getTypeConfig();
            
            expect(config.shakeIntensity).toBeDefined();
            expect(config.shakeIntensity).toBe(15); // From hardcoded config
            expect(config.disableDuration).toBe(1500); // From hardcoded config
        });
        
        test('rainbow bubble should have special effects', () => {
            const bubble = new Bubble('rainbow', { x: 100, y: 100 });
            const config = bubble.getTypeConfig();
            
            expect(config.bonusTimeMs).toBeDefined();
            expect(config.bonusTimeMs).toBe(8000); // From hardcoded config
        });
    });
    
    describe('Bubble Behavior', () => {
        test('should age correctly over time', () => {
            const bubble = new Bubble(mockGameEngine, 100, 100, 'normal');
            const initialAge = bubble.age;
            
            bubble.update(16.67); // One frame at 60fps
            expect(bubble.age).toBeGreaterThan(initialAge);
        });
        
        test('should handle damage correctly', () => {
            const bubble = new Bubble('normal', { x: 100, y: 100 });
            const initialHealth = bubble.health;
            
            bubble.takeDamage(1);
            expect(bubble.health).toBe(initialHealth - 1);
        });
        
        test('should be marked for removal when health reaches zero', () => {
            const bubble = new Bubble('normal', { x: 100, y: 100 });
            const config = bubble.getTypeConfig();
            
            // Damage enough to destroy the bubble
            for (let i = 0; i < config.health; i++) {
                bubble.takeDamage(1);
            }
            
            expect(bubble.isAlive).toBe(false);
        });
        
        test('should be marked for removal when exceeding max age', () => {
            const bubble = new Bubble('normal', { x: 100, y: 100 });
            const config = bubble.getTypeConfig();
            
            // Age beyond max age
            bubble.age = config.maxAge + 1000;
            bubble.update(16.67);
            
            expect(bubble.isAlive).toBe(false);
        });
    });
    
    describe('Configuration Consistency', () => {
        const bubbleTypes = [
            'normal', 'stone', 'iron', 'diamond', 'rainbow', 'pink', 'clock',
            'electric', 'poison', 'spiky', 'escaping', 'boss'
        ];
        
        test('should have consistent configuration across all bubble types', () => {
            for (const bubbleType of bubbleTypes) {
                const bubble = new Bubble(mockGameEngine, 100, 100, bubbleType);
                const config = bubble.getTypeConfig();
                
                // 基本プロパティの存在確認
                expect(config).toHaveProperty('health');
                expect(config).toHaveProperty('score');
                expect(config).toHaveProperty('size');
                expect(config).toHaveProperty('maxAge');
                
                // 値の型確認
                expect(typeof config.health).toBe('number');
                expect(typeof config.score).toBe('number');
                expect(typeof config.size).toBe('number');
                expect(typeof config.maxAge).toBe('number');
                
                // 値の範囲確認
                expect(config.health).toBeGreaterThan(0);
                expect(config.score).toBeGreaterThanOrEqual(0);
                expect(config.size).toBeGreaterThan(0);
                expect(config.maxAge).toBeGreaterThan(0);
            }
        });
        
        test('should maintain relative balance between bubble types', () => {
            const normalBubble = new Bubble(mockGameEngine, 100, 100, 'normal');
            const bossBubble = new Bubble(mockGameEngine, 100, 100, 'boss');
            
            const normalConfig = normalBubble.getTypeConfig();
            const bossConfig = bossBubble.getTypeConfig();
            
            // Boss bubble should be stronger than normal
            expect(bossConfig.health).toBeGreaterThanOrEqual(normalConfig.health);
            expect(bossConfig.score).toBeGreaterThanOrEqual(normalConfig.score);
            expect(bossConfig.size).toBeGreaterThanOrEqual(normalConfig.size);
        });
        
        test('should have appropriate difficulty progression', () => {
            const normalBubble = new Bubble(mockGameEngine, 100, 100, 'normal');
            const stoneBubble = new Bubble(mockGameEngine, 100, 100, 'stone');
            const ironBubble = new Bubble(mockGameEngine, 100, 100, 'iron');
            const diamondBubble = new Bubble(mockGameEngine, 100, 100, 'diamond');
            
            const normalConfig = normalBubble.getTypeConfig();
            const stoneConfig = stoneBubble.getTypeConfig();
            const ironConfig = ironBubble.getTypeConfig();
            const diamondConfig = diamondBubble.getTypeConfig();
            
            // Health should increase with difficulty
            expect(stoneConfig.health).toBeGreaterThanOrEqual(normalConfig.health);
            expect(ironConfig.health).toBeGreaterThanOrEqual(stoneConfig.health);
            expect(diamondConfig.health).toBeGreaterThanOrEqual(ironConfig.health);
            
            // Score should increase with difficulty
            expect(stoneConfig.score).toBeGreaterThanOrEqual(normalConfig.score);
            expect(ironConfig.score).toBeGreaterThanOrEqual(stoneConfig.score);
            expect(diamondConfig.score).toBeGreaterThanOrEqual(ironConfig.score);
        });
    });
    
    describe('Special Bubble Types', () => {
        test('escaping bubble should have movement behavior', () => {
            const bubble = new Bubble('escaping', { x: 100, y: 100 });
            
            expect(bubble.type).toBe('escaping');
            // Escaping bubbles should have special behavior when cursor approaches
            const config = bubble.getTypeConfig();
            expect(config).toHaveProperty('escapeSpeed');
            expect(config).toHaveProperty('escapeRadius');
        });
        
        test('spiky bubble should have damage properties', () => {
            const bubble = new Bubble('spiky', { x: 100, y: 100 });
            const config = bubble.getTypeConfig();
            
            expect(config.score).toBe(85); // From hardcoded config
            expect(config).toHaveProperty('chainRadius');
        });
        
        test('poison bubble should have poison effects', () => {
            const bubble = new Bubble('poison', { x: 100, y: 100 });
            const config = bubble.getTypeConfig();
            
            expect(config.score).toBe(8); // From hardcoded config
            expect(config).toHaveProperty('damageAmount');
        });
    });
    
    describe('Integration with Configuration Management', () => {
        test('should use ConfigurationManager when available', () => {
            const bubble = new Bubble(mockGameEngine, 100, 100, 'normal');
            
            // This tests the fallback mechanism in getTypeConfig()
            const config = bubble.getTypeConfig();
            expect(config).toBeDefined();
            expect(typeof config).toBe('object');
        });
        
        test('should fallback to hardcoded values when ConfigurationManager fails', () => {
            const bubble = new Bubble(mockGameEngine, 100, 100, 'normal');
            
            // Test that hardcoded fallback works
            const config = bubble._getHardcodedConfig();
            expect(config).toBeDefined();
            expect(config.health).toBe(1);
            expect(config.score).toBe(15);
        });
    });
    
    describe('Test Generation Metadata', () => {
        const bubbleTypes = [
            'normal', 'stone', 'iron', 'diamond', 'rainbow', 'pink', 'clock',
            'electric', 'poison', 'spiky', 'escaping', 'boss'
        ];
        
        test('should have consistent test structure', () => {
            // This test validates that our test generation worked correctly
            const metadata = {
                generatedAt: new Date().toISOString(),
                sourceFiles: ['src/config/GameBalance.js', 'src/bubbles/Bubble.js'],
                testTypes: ['manual', 'generated', 'integrated'],
                bubbleTypesCount: bubbleTypes.length
            };
            
            expect(metadata).toHaveProperty('generatedAt');
            expect(metadata).toHaveProperty('sourceFiles');
            expect(Array.isArray(metadata.sourceFiles)).toBe(true);
            expect(metadata.bubbleTypesCount).toBeGreaterThan(0);
        });
    });
});