/**
 * PerformanceConfig クラスのユニットテスト
 */
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { PerformanceConfig, getPerformanceConfig } from '../../src/config/PerformanceConfig.js';
import { ConfigurationManager, getConfigurationManager } from '../../src/core/ConfigurationManager.js';
import { getErrorHandler } from '../../src/utils/ErrorHandler.js';

// モックの型定義
interface MockCall {
    category: string;
    key: string;
    defaultValue?: any;
}

interface SetCall {
    category: string;
    key: string;
    value: any;
}

interface ValidationRule {
    type?: string;
    min?: number;
    max?: number;
    validator?: (value: any) => boolean | string;
}

interface MockConfigManager {
    get: jest.Mock<any>;
    set: jest.Mock<any>;
    setValidationRule: jest.Mock<any>;
    getCategory: jest.Mock<any>;
}

interface QualityPreset {
    renderQuality: number;
    particleQuality: number;
    effectQuality: number;
    audioQuality: number;
    enableShadows: boolean;
    enableBlur: boolean;
    enableAntiAliasing: boolean;
    enableReflections: boolean;
}

interface PerformanceOptimizer {
    targetFPS: number;
    maxHistorySize: number;
    adaptiveMode?: boolean;
    performanceLevel?: string;
    setAdaptiveMode: (mode: boolean) => void;
    optimizationInterval: number;
    setPerformanceLevel: (level: string) => void;
    settings: Record<string, any>;
}

// モックの設定
jest.mock('../../src/core/ConfigurationManager.js');
jest.mock('../../src/utils/ErrorHandler.js');

let mockGetCalls: MockCall[] = [];
const mockGet = jest.fn((category: string, key: string, defaultValue?: any) => {
    mockGetCalls.push({ category, key, defaultValue });
    // 戻り値は各テストで設定
    return defaultValue;
});

const mockSet = jest.fn((category: string, key: string, value: any) => {
    return true;
});

const mockSetValidationRule = jest.fn();
const mockGetCategory = jest.fn(() => ({}));

const mockConfigManager: MockConfigManager = {
    get: mockGet as any,
    set: mockSet as any,
    setValidationRule: mockSetValidationRule,
    getCategory: mockGetCategory
};

// ConfigurationManagerのモック
(getConfigurationManager as jest.Mock).mockReturnValue(mockConfigManager);

describe('PerformanceConfig', () => {
    let performanceConfig: PerformanceConfig;
    
    beforeEach(() => {
        // テスト前にモックをリセット
        jest.clearAllMocks();
        mockGetCalls = [];
        
        // 新しいインスタンスを作成
        performanceConfig = new PerformanceConfig();
    });
    
    describe('初期化', () => {
        test('コンストラクタが正しく初期化されること', () => {
            expect(performanceConfig).toBeDefined();
            expect(getConfigurationManager).toHaveBeenCalled();
        });
        
        test('品質プリセットが定義されていること', () => {
            expect((performanceConfig as any).qualityPresets).toBeDefined();
            expect((performanceConfig as any).qualityPresets.low).toBeDefined();
            expect((performanceConfig as any).qualityPresets.medium).toBeDefined();
            expect((performanceConfig as any).qualityPresets.high).toBeDefined();
            expect((performanceConfig as any).qualityPresets.ultra).toBeDefined();
        });
        
        test('バリデーションルールが設定されること', () => {
            expect(mockSetValidationRule).toHaveBeenCalled();
            expect(mockSetValidationRule).toHaveBeenCalledWith(
                'performance',
                expect.any(Object)
            );
        });
    });
    
    describe('targetFPS', () => {
        test('デフォルト値が取得できること', () => {
            mockGet.mockReturnValueOnce(60);
            const fps = performanceConfig.targetFPS;
            expect(fps).toBe(60);
            expect(mockGet).toHaveBeenCalledWith('performance', 'targetFPS', 60);
        });
        
        test('値を設定できること', () => {
            performanceConfig.targetFPS = 30;
            expect(mockSet).toHaveBeenCalledWith('performance', 'targetFPS', 30);
        });
        
        test('無効な値を設定した場合エラーになること', () => {
            expect(() => {
                performanceConfig.targetFPS = -1;
            }).toThrow();
            
            expect(() => {
                performanceConfig.targetFPS = 0;
            }).toThrow();
            
            expect(() => {
                performanceConfig.targetFPS = 241;
            }).toThrow();
        });
    });
    
    describe('renderQuality', () => {
        test('デフォルト値が取得できること', () => {
            mockGet.mockReturnValueOnce(1.0);
            const quality = performanceConfig.renderQuality;
            expect(quality).toBe(1.0);
            expect(mockGet).toHaveBeenCalledWith('performance', 'renderQuality', 1.0);
        });
        
        test('値を設定できること', () => {
            performanceConfig.renderQuality = 0.5;
            expect(mockSet).toHaveBeenCalledWith('performance', 'renderQuality', 0.5);
        });
        
        test('無効な値を設定した場合エラーになること', () => {
            expect(() => {
                performanceConfig.renderQuality = -0.1;
            }).toThrow();
            
            expect(() => {
                performanceConfig.renderQuality = 2.1;
            }).toThrow();
        });
    });
    
    describe('particleLimit', () => {
        test('デフォルト値が取得できること', () => {
            mockGet.mockReturnValueOnce(1000);
            const limit = performanceConfig.particleLimit;
            expect(limit).toBe(1000);
            expect(mockGet).toHaveBeenCalledWith('performance', 'particleLimit', 1000);
        });
        
        test('値を設定できること', () => {
            performanceConfig.particleLimit = 500;
            expect(mockSet).toHaveBeenCalledWith('performance', 'particleLimit', 500);
        });
        
        test('無効な値を設定した場合エラーになること', () => {
            expect(() => {
                performanceConfig.particleLimit = -1;
            }).toThrow();
            
            expect(() => {
                performanceConfig.particleLimit = 10001;
            }).toThrow();
        });
    });
    
    describe('enableShadows', () => {
        test('デフォルト値が取得できること', () => {
            mockGet.mockReturnValueOnce(true);
            const enabled = performanceConfig.enableShadows;
            expect(enabled).toBe(true);
            expect(mockGet).toHaveBeenCalledWith('performance', 'enableShadows', true);
        });
        
        test('値を設定できること', () => {
            performanceConfig.enableShadows = false;
            expect(mockSet).toHaveBeenCalledWith('performance', 'enableShadows', false);
        });
    });
    
    describe('adaptiveQuality', () => {
        test('デフォルト値が取得できること', () => {
            mockGet.mockReturnValueOnce(true);
            const enabled = performanceConfig.adaptiveQuality;
            expect(enabled).toBe(true);
            expect(mockGet).toHaveBeenCalledWith('performance', 'adaptiveQuality', true);
        });
        
        test('値を設定できること', () => {
            performanceConfig.adaptiveQuality = false;
            expect(mockSet).toHaveBeenCalledWith('performance', 'adaptiveQuality', false);
        });
    });
    
    describe('canvasScaling', () => {
        test('デフォルト値が取得できること', () => {
            mockGet.mockReturnValueOnce(1.0);
            const scaling = performanceConfig.canvasScaling;
            expect(scaling).toBe(1.0);
            expect(mockGet).toHaveBeenCalledWith('performance', 'canvasScaling', 1.0);
        });
        
        test('値を設定できること', () => {
            performanceConfig.canvasScaling = 0.75;
            expect(mockSet).toHaveBeenCalledWith('performance', 'canvasScaling', 0.75);
        });
        
        test('無効な値を設定した場合エラーになること', () => {
            expect(() => {
                performanceConfig.canvasScaling = 0.09;
            }).toThrow();
            
            expect(() => {
                performanceConfig.canvasScaling = 2.1;
            }).toThrow();
        });
    });
    
    describe('memoryLimit', () => {
        test('デフォルト値が取得できること', () => {
            mockGet.mockReturnValueOnce(512);
            const limit = performanceConfig.memoryLimit;
            expect(limit).toBe(512);
            expect(mockGet).toHaveBeenCalledWith('performance', 'memoryLimit', 512);
        });
        
        test('値を設定できること', () => {
            performanceConfig.memoryLimit = 1024;
            expect(mockSet).toHaveBeenCalledWith('performance', 'memoryLimit', 1024);
        });
        
        test('無効な値を設定した場合エラーになること', () => {
            expect(() => {
                performanceConfig.memoryLimit = 63;
            }).toThrow();
            
            expect(() => {
                performanceConfig.memoryLimit = 4097;
            }).toThrow();
        });
    });
    
    describe('maxTextureSize', () => {
        test('デフォルト値が取得できること', () => {
            mockGet.mockReturnValueOnce(2048);
            const size = performanceConfig.maxTextureSize;
            expect(size).toBe(2048);
            expect(mockGet).toHaveBeenCalledWith('performance', 'maxTextureSize', 2048);
        });
        
        test('値を設定できること', () => {
            performanceConfig.maxTextureSize = 1024;
            expect(mockSet).toHaveBeenCalledWith('performance', 'maxTextureSize', 1024);
        });
        
        test('無効な値を設定した場合エラーになること', () => {
            expect(() => {
                performanceConfig.maxTextureSize = 255;
            }).toThrow();
            
            expect(() => {
                performanceConfig.maxTextureSize = 8193;
            }).toThrow();
        });
    });
    
    describe('applyQualityPreset', () => {
        test('品質プリセットを適用できること', () => {
            mockSet.mockReturnValue(true);
            
            const result = performanceConfig.applyQualityPreset('low');
            expect(result).toBe(true);
            
            // low プリセットの値が設定されているか確認
            expect(mockSet).toHaveBeenCalledWith('performance', 'renderQuality', 0.5);
            expect(mockSet).toHaveBeenCalledWith('performance', 'particleQuality', 0.3);
            expect(mockSet).toHaveBeenCalledWith('performance', 'effectQuality', 0.3);
            expect(mockSet).toHaveBeenCalledWith('performance', 'audioQuality', 0.7);
            expect(mockSet).toHaveBeenCalledWith('performance', 'enableShadows', false);
            expect(mockSet).toHaveBeenCalledWith('performance', 'enableBlur', false);
            expect(mockSet).toHaveBeenCalledWith('performance', 'enableAntiAliasing', false);
            expect(mockSet).toHaveBeenCalledWith('performance', 'enableReflections', false);
        });
        
        test('無効なプリセット名の場合falseを返すこと', () => {
            const result = performanceConfig.applyQualityPreset('invalid' as any);
            expect(result).toBe(false);
        });
    });
    
    describe('getDevicePerformanceLevel', () => {
        test('デバイスのパフォーマンスレベルを判定できること', () => {
            // navigator.hardwareConcurrency のモック
            Object.defineProperty(navigator, 'hardwareConcurrency', {
                writable: true,
                value: 8
            });
            
            const level = performanceConfig.getDevicePerformanceLevel();
            expect(['low', 'medium', 'high']).toContain(level);
        });
    });
    
    describe('suggestQualityPreset', () => {
        test('デバイスに応じた品質プリセットを提案できること', () => {
            // パフォーマンスレベルのモック
            jest.spyOn(performanceConfig, 'getDevicePerformanceLevel')
                .mockReturnValue('medium');
            
            const preset = performanceConfig.suggestQualityPreset();
            expect(preset).toBe('medium');
        });
    });
    
    describe('getPerformanceReport', () => {
        test('パフォーマンスレポートを取得できること', () => {
            mockGetCategory.mockReturnValue({
                targetFPS: 60,
                renderQuality: 1.0,
                particleLimit: 1000,
                enableShadows: true,
                adaptiveQuality: true,
                canvasScaling: 1.0,
                memoryLimit: 512,
                maxTextureSize: 2048
            });
            
            const report = performanceConfig.getPerformanceReport();
            
            expect(report).toBeDefined();
            expect(report.current).toBeDefined();
            expect(report.recommended).toBeDefined();
            expect(report.deviceLevel).toBeDefined();
            expect(report.memoryUsage).toBeDefined();
        });
    });
    
    describe('createPerformanceOptimizer', () => {
        test('パフォーマンス最適化インスタンスを作成できること', () => {
            const optimizer: PerformanceOptimizer = performanceConfig.createPerformanceOptimizer();
            
            expect(optimizer).toBeDefined();
            expect(optimizer.targetFPS).toBe(60);
            expect(optimizer.maxHistorySize).toBe(120);
            expect(optimizer.optimizationInterval).toBe(2000);
        });
        
        test('カスタム設定でパフォーマンス最適化インスタンスを作成できること', () => {
            const config = {
                targetFPS: 30,
                adaptiveMode: false,
                performanceLevel: 'medium'
            };
            
            const optimizer: PerformanceOptimizer = performanceConfig.createPerformanceOptimizer(config);
            
            expect(optimizer.targetFPS).toBe(30);
            expect(optimizer.adaptiveMode).toBe(false);
            expect(optimizer.performanceLevel).toBe('medium');
        });
    });
    
    describe('resetToDefaults', () => {
        test('デフォルト値にリセットできること', () => {
            performanceConfig.resetToDefaults();
            
            expect(mockSet).toHaveBeenCalledWith('performance', 'targetFPS', 60);
            expect(mockSet).toHaveBeenCalledWith('performance', 'renderQuality', 1.0);
            expect(mockSet).toHaveBeenCalledWith('performance', 'particleLimit', 1000);
            expect(mockSet).toHaveBeenCalledWith('performance', 'enableShadows', true);
            expect(mockSet).toHaveBeenCalledWith('performance', 'adaptiveQuality', true);
            expect(mockSet).toHaveBeenCalledWith('performance', 'canvasScaling', 1.0);
            expect(mockSet).toHaveBeenCalledWith('performance', 'memoryLimit', 512);
            expect(mockSet).toHaveBeenCalledWith('performance', 'maxTextureSize', 2048);
        });
    });
    
    describe('シングルトンインスタンス', () => {
        test('getPerformanceConfigが同じインスタンスを返すこと', () => {
            const instance1 = getPerformanceConfig();
            const instance2 = getPerformanceConfig();
            
            expect(instance1).toBe(instance2);
        });
    });
});