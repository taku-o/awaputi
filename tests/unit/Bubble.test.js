/**
 * Bubble Class Test Suite
 * 
 * このファイルは TestConfigurationGenerator によって自動生成されました。
 * 手動での編集は推奨されません。設定を変更する場合は、
 * 正規設定ファイルを更新し、テスト生成を再実行してください。
 * 
 * 生成日時: 2025-07-27T05:47:37.237Z
 * 生成器バージョン: 1.0.0
 */

import { jest } from '@jest/globals';
import { Bubble } from '../../src/bubbles/Bubble.js';

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

describe('Bubble Class Configuration Tests', () => {
    let mockCanvas;
    let mockContext;
    let mockGameEngine;
    
    beforeEach(() => {
        // Mock canvas and context
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
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            font: '',
            textAlign: '',
            textBaseline: '',
            globalAlpha: 1
        };
        
        mockCanvas = {
            getContext: jest.fn(() => mockContext),
            width: 800,
            height: 600
        };
        
        mockGameEngine = {
            canvas: mockCanvas,
            ctx: mockContext,
            currentStage: { name: 'normal' },
            getInputManager: jest.fn(() => ({
                isMousePressed: jest.fn(() => false),
                getMousePosition: jest.fn(() => ({ x: 0, y: 0 }))
            }))
        };
        
        // Reset all mocks
        jest.clearAllMocks();
    });
    
    describe('Bubble Type Configuration', () => {
    });
    
    describe('Configuration Consistency', () => {
        test('should have consistent configuration across all bubble types', () => {
            const bubbleTypes = [];
            
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
    });
    
    describe('Generated Test Metadata', () => {
        test('should have test generation metadata', () => {
            const metadata = {
          "extractedAt": 1753595257235,
          "sourceFiles": [
                    "src/config/GameBalance.js",
                    "src/bubbles/Bubble.js",
                    "ConfigurationManager"
          ],
          "generatorVersion": "1.0.0"
};
            
            expect(metadata).toHaveProperty('extractedAt');
            expect(metadata).toHaveProperty('sourceFiles');
            expect(metadata).toHaveProperty('generatorVersion');
            expect(Array.isArray(metadata.sourceFiles)).toBe(true);
        });
    });
});
