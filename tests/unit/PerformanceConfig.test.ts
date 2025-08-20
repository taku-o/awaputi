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
    validator?: (value as any) => boolean | string;
}

interface MockConfigManager {
    get: jest.Mock<any, [string, string, any?]>;
    set: jest.Mock<boolean, [string, string, any]>;
    setValidationRule: jest.Mock<void, [string, string, any]>;
    getCategory: jest.Mock<any, [string]>;
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
let mockGetCalls: MockCall[] = [];
const mockGet = jest.fn((category: string, key: string, defaultValue? as any) => {
    mockGetCalls.push({ category, key, defaultValue });
    // 戻り値は各テストで設定
    return defaultValue;
});

const mockSet = jest.fn((category: string, key: string, value: any) => {
    return true;
});

const mockSetValidationRule = jest.fn<void, [string, string, any]>();
const mockGetCategory = jest.fn(() => ({}));

const mockConfigManager: MockConfigManager = {
    get: mockGet,
    set: mockSet,
    setValidationRule: mockSetValidationRule,
    getCategory: mockGetCategory
};

// ConfigurationManagerのモック
const mockGetConfigurationManager = jest.fn(() => mockConfigManager);

describe('PerformanceConfig', () => {
    let performanceConfig: PerformanceConfig;
    
    beforeEach(() => {
        // テスト前にモックをリセット
        mockGetCalls = [];
        
        // 新しいインスタンスを作成
        performanceConfig = new PerformanceConfig();
    });
    
    describe('初期化', () => {
        test('コンストラクタが正しく初期化されること', () => {
            expect(performanceConfig).toBeDefined();
            expect(mockGetConfigurationManager).toHaveBeenCalled();
        });
        
        test('初期化時に最適化設定が登録されること', () => {
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'optimization.targetFPS', 60);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'optimization.adaptiveMode', true);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'optimization.performanceLevel', 'high');
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'optimization.maxBubbles', 30);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'optimization.maxParticles', 600);
        });
        
        test('初期化時にリソース制限設定が登録されること', () => {
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'limits.memoryThreshold', 100);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'limits.fpsThreshold', 30);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'limits.maxTextureSize', 3048);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'limits.autoAdjust', true);
        });
        
        test('初期化時に品質設定が登録されること', () => {
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.renderQuality', 1.0);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.particleQuality', 1.0);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.effectQuality', 1.0);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.audioQuality', 1.0);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.enableShadows', true);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.enableBlur', true);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.enableAntiAliasing', true);
        });
        
        test('初期化時に検証ルールが設定されること', () => {
            expect(mockConfigManager.setValidationRule).toHaveBeenCalledWith('performance', 'optimization.targetFPS', expect.any(Object));
            expect(mockConfigManager.setValidationRule).toHaveBeenCalledWith('performance', 'limits.memoryThreshold', expect.any(Object));
            expect(mockConfigManager.setValidationRule).toHaveBeenCalledWith('performance', 'quality.renderQuality', expect.any(Object));
        });
    });
    
    describe('最適化設定', () => {
        test('getOptimizationConfig が正しい最適化設定を返すこと', () => {
            mockConfigManager.get
                .mockReturnValueOnce(60) // targetFPS
                .mockReturnValueOnce(true) // adaptiveMode
                .mockReturnValueOnce(3000) // optimizationInterval
                .mockReturnValueOnce(30) // maxHistorySize
                .mockReturnValueOnce('medium') // performanceLevel
                .mockReturnValueOnce(15) // maxBubbles
                .mockReturnValueOnce(300) // maxParticles
                .mockReturnValueOnce(true) // workloadDistribution
                .mockReturnValueOnce(10); // maxTimePerFrame
                
            const optimizationConfig = performanceConfig.getOptimizationConfig();
            
            expect(optimizationConfig).toEqual({
                targetFPS: 60,
                adaptiveMode: true,
                optimizationInterval: 3000,
                maxHistorySize: 30,
                performanceLevel: 'medium',
                maxBubbles: 15,
                maxParticles: 300,
                workloadDistribution: true,
                maxTimePerFrame: 10
            });
        });
        
        test('getTargetFPS が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(60);
            
            expect(performanceConfig.getTargetFPS()).toBe(60);
            expect(mockConfigManager.get).toHaveBeenCalledWith('performance', 'optimization.targetFPS', 60);
        });
        
        test('isAdaptiveModeEnabled が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(true);
            
            expect(performanceConfig.isAdaptiveModeEnabled()).toBe(true);
            expect(mockConfigManager.get).toHaveBeenCalledWith('performance', 'optimization.adaptiveMode', true);
        });
        
        test('getPerformanceLevel が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce('medium');
            
            expect(performanceConfig.getPerformanceLevel()).toBe('medium');
            expect(mockConfigManager.get).toHaveBeenCalledWith('performance', 'optimization.performanceLevel', 'high');
        });
        
        test('getMaxBubbles が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(15);
            
            expect(performanceConfig.getMaxBubbles()).toBe(15);
            expect(mockConfigManager.get).toHaveBeenCalledWith('performance', 'optimization.maxBubbles', 30);
        });
        
        test('getMaxParticles が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(300);
            
            expect(performanceConfig.getMaxParticles()).toBe(300);
            expect(mockConfigManager.get).toHaveBeenCalledWith('performance', 'optimization.maxParticles', 600);
        });
        
        test('setTargetFPS が正しく設定されること', () => {
            performanceConfig.setTargetFPS(60);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'optimization.targetFPS', 60);
        });
        
        test('setAdaptiveModeEnabled が正しく設定されること', () => {
            performanceConfig.setAdaptiveModeEnabled(true);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'optimization.adaptiveMode', true);
        });
        
        test('setPerformanceLevel が正しく設定されること', () => {
            performanceConfig.setPerformanceLevel('medium');
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'optimization.performanceLevel', 'medium');
        });
        
        test('setMaxBubbles が正しく設定されること', () => {
            performanceConfig.setMaxBubbles(15);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'optimization.maxBubbles', 15);
        });
        
        test('setMaxParticles が正しく設定されること', () => {
            performanceConfig.setMaxParticles(300);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'optimization.maxParticles', 300);
        });
    });
    
    describe('リソース制限設定', () => {
        test('getResourceLimitConfig が正しいリソース制限設定を返すこと', () => {
            mockConfigManager.get
                .mockReturnValueOnce(80) // memoryThreshold
                .mockReturnValueOnce(25) // fpsThreshold
                .mockReturnValueOnce(1024) // maxTextureSize
                .mockReturnValueOnce(3) // maxAssetSize
                .mockReturnValueOnce(true) // autoAdjust
                .mockReturnValueOnce(0.7) // warningThreshold
                .mockReturnValueOnce(0.9) // criticalThreshold
                .mockReturnValueOnce(30000); // cleanupInterval
                
            const resourceLimitConfig = performanceConfig.getResourceLimitConfig();
            
            expect(resourceLimitConfig).toEqual({
                memoryThreshold: 80,
                fpsThreshold: 25,
                maxTextureSize: 1024,
                maxAssetSize: 3,
                autoAdjust: true,
                warningThreshold: 0.7,
                criticalThreshold: 0.9,
                cleanupInterval: 30000
            });
        });
        
        test('getMemoryThreshold が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(80);
            
            expect(performanceConfig.getMemoryThreshold()).toBe(80);
            expect(mockConfigManager.get).toHaveBeenCalledWith('performance', 'limits.memoryThreshold', 100);
        });
        
        test('getFPSThreshold が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(25);
            
            expect(performanceConfig.getFPSThreshold()).toBe(25);
            expect(mockConfigManager.get).toHaveBeenCalledWith('performance', 'limits.fpsThreshold', 30);
        });
        
        test('getMaxTextureSize が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(1024);
            
            expect(performanceConfig.getMaxTextureSize()).toBe(1024);
            expect(mockConfigManager.get).toHaveBeenCalledWith('performance', 'limits.maxTextureSize', 3048);
        });
        
        test('isAutoAdjustEnabled が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(true);
            
            expect(performanceConfig.isAutoAdjustEnabled()).toBe(true);
            expect(mockConfigManager.get).toHaveBeenCalledWith('performance', 'limits.autoAdjust', true);
        });
        
        test('setMemoryThreshold が正しく設定されること', () => {
            performanceConfig.setMemoryThreshold(80);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'limits.memoryThreshold', 80);
        });
        
        test('setFPSThreshold が正しく設定されること', () => {
            performanceConfig.setFPSThreshold(25);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'limits.fpsThreshold', 25);
        });
        
        test('setMaxTextureSize が正しく設定されること', () => {
            performanceConfig.setMaxTextureSize(1024);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'limits.maxTextureSize', 1024);
        });
        
        test('setAutoAdjustEnabled が正しく設定されること', () => {
            performanceConfig.setAutoAdjustEnabled(true);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'limits.autoAdjust', true);
        });
    });
    
    describe('品質設定', () => {
        test('getQualityConfig が正しい品質設定を返すこと', () => {
            mockConfigManager.get
                .mockReturnValueOnce(0.8) // renderQuality
                .mockReturnValueOnce(0.6) // particleQuality
                .mockReturnValueOnce(0.7) // effectQuality
                .mockReturnValueOnce(0.9) // audioQuality
                .mockReturnValueOnce(true) // enableShadows
                .mockReturnValueOnce(true) // enableBlur
                .mockReturnValueOnce(true) // enableAntiAliasing
                .mockReturnValueOnce(true); // enableReflections
                
            const qualityConfig = performanceConfig.getQualityConfig();
            
            expect(qualityConfig).toEqual({
                renderQuality: 0.8,
                particleQuality: 0.6,
                effectQuality: 0.7,
                audioQuality: 0.9,
                enableShadows: true,
                enableBlur: true,
                enableAntiAliasing: true,
                enableReflections: true
            });
        });
        
        test('getRenderQuality が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(0.8);
            
            expect(performanceConfig.getRenderQuality()).toBe(0.8);
            expect(mockConfigManager.get).toHaveBeenCalledWith('performance', 'quality.renderQuality', 1.0);
        });
        
        test('getParticleQuality が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(0.6);
            
            expect(performanceConfig.getParticleQuality()).toBe(0.6);
            expect(mockConfigManager.get).toHaveBeenCalledWith('performance', 'quality.particleQuality', 1.0);
        });
        
        test('getEffectQuality が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(0.7);
            
            expect(performanceConfig.getEffectQuality()).toBe(0.7);
            expect(mockConfigManager.get).toHaveBeenCalledWith('performance', 'quality.effectQuality', 1.0);
        });
        
        test('getAudioQuality が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(0.9);
            
            expect(performanceConfig.getAudioQuality()).toBe(0.9);
            expect(mockConfigManager.get).toHaveBeenCalledWith('performance', 'quality.audioQuality', 1.0);
        });
        
        test('areShadowsEnabled が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(true);
            
            expect(performanceConfig.areShadowsEnabled()).toBe(true);
            expect(mockConfigManager.get).toHaveBeenCalledWith('performance', 'quality.enableShadows', true);
        });
        
        test('isBlurEnabled が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(true);
            
            expect(performanceConfig.isBlurEnabled()).toBe(true);
            expect(mockConfigManager.get).toHaveBeenCalledWith('performance', 'quality.enableBlur', true);
        });
        
        test('isAntiAliasingEnabled が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(true);
            
            expect(performanceConfig.isAntiAliasingEnabled()).toBe(true);
            expect(mockConfigManager.get).toHaveBeenCalledWith('performance', 'quality.enableAntiAliasing', true);
        });
        
        test('areReflectionsEnabled が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(true);
            
            expect(performanceConfig.areReflectionsEnabled()).toBe(true);
            expect(mockConfigManager.get).toHaveBeenCalledWith('performance', 'quality.enableReflections', true);
        });
        
        test('setRenderQuality が正しく設定されること', () => {
            performanceConfig.setRenderQuality(0.8);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.renderQuality', 0.8);
        });
        
        test('setParticleQuality が正しく設定されること', () => {
            performanceConfig.setParticleQuality(0.6);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.particleQuality', 0.6);
        });
        
        test('setEffectQuality が正しく設定されること', () => {
            performanceConfig.setEffectQuality(0.7);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.effectQuality', 0.7);
        });
        
        test('setAudioQuality が正しく設定されること', () => {
            performanceConfig.setAudioQuality(0.9);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.audioQuality', 0.9);
        });
        
        test('setShadowsEnabled が正しく設定されること', () => {
            performanceConfig.setShadowsEnabled(true);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.enableShadows', true);
        });
        
        test('setBlurEnabled が正しく設定されること', () => {
            performanceConfig.setBlurEnabled(true);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.enableBlur', true);
        });
        
        test('setAntiAliasingEnabled が正しく設定されること', () => {
            performanceConfig.setAntiAliasingEnabled(true);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.enableAntiAliasing', true);
        });
        
        test('setReflectionsEnabled が正しく設定されること', () => {
            performanceConfig.setReflectionsEnabled(true);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.enableReflections', true);
        });
    });
    
    describe('品質プリセット', () => {
        test('applyQualityPreset が正しくプリセットを適用すること', () => {
            // プリセットのモック
            const mockPreset: QualityPreset = {
                renderQuality: 0.7,
                particleQuality: 0.3,
                effectQuality: 0.2,
                audioQuality: 0.5,
                enableShadows: true,
                enableBlur: true,
                enableAntiAliasing: true,
                enableReflections: true
            };
            
            // モックの設定
            let getCalls: MockCall[] = [];
            let setCalls: SetCall[] = [];
            
            mockConfigManager.get = jest.fn((category: string, key: string): any => {
                getCalls.push({ category, key });
                if (key === 'performance.quality.presets.low') return mockPreset;
                return null;
            });
            
            mockConfigManager.set = jest.fn((category: string, key: string, value: any) => {
                setCalls.push({ category, key, value });
                return true;
            });
            
            const result = performanceConfig.applyQualityPreset('low');
            
            expect(result).toBe(true);
            expect(getCalls.some(call => call.key === 'performance.quality.presets.low')).toBe(true);
            expect(setCalls.some(call => call.key === 'quality.renderQuality' && call.value === 0.7)).toBe(true);
            expect(setCalls.some(call => call.key === 'quality.particleQuality' && call.value === 0.3)).toBe(true);
            expect(setCalls.some(call => call.key === 'quality.effectQuality' && call.value === 0.2)).toBe(true);
            expect(setCalls.some(call => call.key === 'quality.audioQuality' && call.value === 0.5)).toBe(true);
            expect(setCalls.some(call => call.key === 'quality.enableShadows' && call.value === true)).toBe(true);
            expect(setCalls.some(call => call.key === 'quality.enableBlur' && call.value === true)).toBe(true);
            expect(setCalls.some(call => call.key === 'quality.enableAntiAliasing' && call.value === true)).toBe(true);
            expect(setCalls.some(call => call.key === 'quality.enableReflections' && call.value === true)).toBe(true);
            expect(setCalls.some(call => call.key === 'optimization.performanceLevel' && call.value === 'low')).toBe(true);
        });
        
        test('applyQualityPreset が無効なプリセット名でtrueを返すこと', () => {
            const result = performanceConfig.applyQualityPreset('invalid');
            
            expect(result).toBe(true);
        });
    });
    
    describe('PerformanceOptimizer連携', () => {
        test('applyToPerformanceOptimizer がPerformanceOptimizerに設定を適用すること', () => {
            // PerformanceOptimizerのモック
            const mockOptimizer: PerformanceOptimizer = {
                targetFPS: 60,
                maxHistorySize: 30,
                setAdaptiveMode: function(mode: boolean) { this.adaptiveMode = mode; },
                optimizationInterval: 1000,
                setPerformanceLevel: function(level: string) { this.performanceLevel = level; },
                settings: {}
            };
            
            // 設定のモック
            mockConfigManager.get = jest.fn((category: string, key: string, defaultValue?: any): any => {
                // 最適化設定
                if (key === 'optimization.targetFPS') return 60;
                if (key === 'optimization.adaptiveMode') return true;
                if (key === 'optimization.optimizationInterval') return 3000;
                if (key === 'optimization.maxHistorySize') return 30;
                if (key === 'optimization.performanceLevel') return 'medium';
                if (key === 'optimization.maxBubbles') return 15;
                if (key === 'optimization.maxParticles') return 300;
                if (key === 'optimization.workloadDistribution') return true;
                if (key === 'optimization.maxTimePerFrame') return 10;
                // 品質設定
                if (key === 'quality.renderQuality') return 0.8;
                if (key === 'quality.particleQuality') return 0.6;
                if (key === 'quality.effectQuality') return 0.7;
                if (key === 'quality.audioQuality') return 0.9;
                if (key === 'quality.enableShadows') return true;
                if (key === 'quality.enableBlur') return true;
                if (key === 'quality.enableAntiAliasing') return true;
                if (key === 'quality.enableReflections') return true;
                return defaultValue;
            });
            
            performanceConfig.applyToPerformanceOptimizer(mockOptimizer);
            
            expect(mockOptimizer.targetFPS).toBe(60);
            expect(mockOptimizer.maxHistorySize).toBe(30);
            expect(mockOptimizer.adaptiveMode).toBe(true);
            expect(mockOptimizer.optimizationInterval).toBe(3000);
            expect(mockOptimizer.performanceLevel).toBe('medium');
            expect(mockOptimizer.settings).toEqual({
                maxBubbles: 15,
                maxParticles: 300,
                renderQuality: 0.8,
                particleQuality: 0.6,
                effectQuality: 0.7,
                audioQuality: 0.9,
                enableShadows: true,
                enableBlur: true,
                enableAntiAliasing: true
            });
        });
        
        test('syncFromPerformanceOptimizer がPerformanceOptimizerから設定を同期すること', () => {
            // PerformanceOptimizerのモック
            const mockOptimizer: PerformanceOptimizer = {
                targetFPS: 60,
                adaptiveMode: true,
                performanceLevel: 'medium',
                maxHistorySize: 30,
                setAdaptiveMode: jest.fn(),
                optimizationInterval: 3000,
                setPerformanceLevel: jest.fn(),
                settings: {
                    maxBubbles: 15,
                    maxParticles: 300,
                    renderQuality: 0.8,
                    particleQuality: 0.6,
                    effectQuality: 0.7,
                    audioQuality: 0.9,
                    enableShadows: true,
                    enableBlur: true,
                    enableAntiAliasing: true
                }
            };
            
            // モックの設定
            let setCalls: SetCall[] = [];
            mockConfigManager.set = jest.fn((category: string, key: string, value: any) => {
                setCalls.push({ category, key, value });
                return true;
            });
            
            performanceConfig.syncFromPerformanceOptimizer(mockOptimizer);
            
            expect(setCalls.some(call => call.key === 'optimization.targetFPS' && call.value === 60)).toBe(true);
            expect(setCalls.some(call => call.key === 'optimization.adaptiveMode' && call.value === true)).toBe(true);
            expect(setCalls.some(call => call.key === 'optimization.performanceLevel' && call.value === 'medium')).toBe(true);
            expect(setCalls.some(call => call.key === 'optimization.maxBubbles' && call.value === 15)).toBe(true);
            expect(setCalls.some(call => call.key === 'optimization.maxParticles' && call.value === 300)).toBe(true);
            expect(setCalls.some(call => call.key === 'quality.renderQuality' && call.value === 0.8)).toBe(true);
            expect(setCalls.some(call => call.key === 'quality.particleQuality' && call.value === 0.6)).toBe(true);
            expect(setCalls.some(call => call.key === 'quality.effectQuality' && call.value === 0.7)).toBe(true);
            expect(setCalls.some(call => call.key === 'quality.audioQuality' && call.value === 0.9)).toBe(true);
            expect(setCalls.some(call => call.key === 'quality.enableShadows' && call.value === true)).toBe(true);
            expect(setCalls.some(call => call.key === 'quality.enableBlur' && call.value === true)).toBe(true);
            expect(setCalls.some(call => call.key === 'quality.enableAntiAliasing' && call.value === true)).toBe(true);
        });
    });
    
    describe('シングルトンパターン', () => {
        test('getPerformanceConfig が常に同じインスタンスを返すこと', () => {
            const instance1 = getPerformanceConfig();
            const instance2 = getPerformanceConfig();
            
            expect(instance1).toBe(instance2);
        });
    });
});