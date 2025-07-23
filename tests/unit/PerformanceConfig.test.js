/**
 * PerformanceConfig クラスのユニットテスト
 */

// モックの設定
const mockGet = jest.fn();
const mockSet = jest.fn().mockReturnValue(true);
const mockSetValidationRule = jest.fn();
const mockGetCategory = jest.fn().mockReturnValue({});

const mockConfigManager = {
    get: mockGet,
    set: mockSet,
    setValidationRule: mockSetValidationRule,
    getCategory: mockGetCategory
};

// ConfigurationManagerのモック
const mockGetConfigurationManager = jest.fn().mockReturnValue(mockConfigManager);
jest.mock('../../src/core/ConfigurationManager.js', () => {
    return {
        ConfigurationManager: jest.fn(),
        getConfigurationManager: mockGetConfigurationManager
    };
});

// ErrorHandlerのモック
jest.mock('../../src/utils/ErrorHandler.js', () => {
    return {
        getErrorHandler: jest.fn().mockReturnValue({
            handleError: jest.fn()
        })
    };
});

const { PerformanceConfig, getPerformanceConfig } = require('../../src/config/PerformanceConfig.js');

describe('PerformanceConfig', () => {
    let performanceConfig;
    
    beforeEach(() => {
        // テスト前にモックをリセット
        jest.clearAllMocks();
        
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
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'optimization.maxBubbles', 20);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'optimization.maxParticles', 500);
        });
        
        test('初期化時にリソース制限設定が登録されること', () => {
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'limits.memoryThreshold', 100);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'limits.fpsThreshold', 30);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'limits.maxTextureSize', 2048);
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
                .mockReturnValueOnce(50) // targetFPS
                .mockReturnValueOnce(false) // adaptiveMode
                .mockReturnValueOnce(2000) // optimizationInterval
                .mockReturnValueOnce(20) // maxHistorySize
                .mockReturnValueOnce('medium') // performanceLevel
                .mockReturnValueOnce(15) // maxBubbles
                .mockReturnValueOnce(300) // maxParticles
                .mockReturnValueOnce(true) // workloadDistribution
                .mockReturnValueOnce(10); // maxTimePerFrame
                
            const optimizationConfig = performanceConfig.getOptimizationConfig();
            
            expect(optimizationConfig).toEqual({
                targetFPS: 50,
                adaptiveMode: false,
                optimizationInterval: 2000,
                maxHistorySize: 20,
                performanceLevel: 'medium',
                maxBubbles: 15,
                maxParticles: 300,
                workloadDistribution: true,
                maxTimePerFrame: 10
            });
        });
        
        test('getTargetFPS が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(50);
            
            expect(performanceConfig.getTargetFPS()).toBe(50);
            expect(mockConfigManager.get).toHaveBeenCalledWith('performance', 'optimization.targetFPS', 60);
        });
        
        test('isAdaptiveModeEnabled が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(false);
            
            expect(performanceConfig.isAdaptiveModeEnabled()).toBe(false);
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
            expect(mockConfigManager.get).toHaveBeenCalledWith('performance', 'optimization.maxBubbles', 20);
        });
        
        test('getMaxParticles が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(300);
            
            expect(performanceConfig.getMaxParticles()).toBe(300);
            expect(mockConfigManager.get).toHaveBeenCalledWith('performance', 'optimization.maxParticles', 500);
        });
        
        test('setTargetFPS が正しく設定されること', () => {
            performanceConfig.setTargetFPS(50);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'optimization.targetFPS', 50);
        });
        
        test('setAdaptiveModeEnabled が正しく設定されること', () => {
            performanceConfig.setAdaptiveModeEnabled(false);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'optimization.adaptiveMode', false);
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
                .mockReturnValueOnce(false) // autoAdjust
                .mockReturnValueOnce(0.7) // warningThreshold
                .mockReturnValueOnce(0.9) // criticalThreshold
                .mockReturnValueOnce(20000); // cleanupInterval
                
            const resourceLimitConfig = performanceConfig.getResourceLimitConfig();
            
            expect(resourceLimitConfig).toEqual({
                memoryThreshold: 80,
                fpsThreshold: 25,
                maxTextureSize: 1024,
                maxAssetSize: 3,
                autoAdjust: false,
                warningThreshold: 0.7,
                criticalThreshold: 0.9,
                cleanupInterval: 20000
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
            expect(mockConfigManager.get).toHaveBeenCalledWith('performance', 'limits.maxTextureSize', 2048);
        });
        
        test('isAutoAdjustEnabled が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(false);
            
            expect(performanceConfig.isAutoAdjustEnabled()).toBe(false);
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
            performanceConfig.setAutoAdjustEnabled(false);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'limits.autoAdjust', false);
        });
    });
    
    describe('品質設定', () => {
        test('getQualityConfig が正しい品質設定を返すこと', () => {
            mockConfigManager.get
                .mockReturnValueOnce(0.8) // renderQuality
                .mockReturnValueOnce(0.6) // particleQuality
                .mockReturnValueOnce(0.7) // effectQuality
                .mockReturnValueOnce(0.9) // audioQuality
                .mockReturnValueOnce(false) // enableShadows
                .mockReturnValueOnce(true) // enableBlur
                .mockReturnValueOnce(false) // enableAntiAliasing
                .mockReturnValueOnce(false); // enableReflections
                
            const qualityConfig = performanceConfig.getQualityConfig();
            
            expect(qualityConfig).toEqual({
                renderQuality: 0.8,
                particleQuality: 0.6,
                effectQuality: 0.7,
                audioQuality: 0.9,
                enableShadows: false,
                enableBlur: true,
                enableAntiAliasing: false,
                enableReflections: false
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
            mockConfigManager.get.mockReturnValueOnce(false);
            
            expect(performanceConfig.areShadowsEnabled()).toBe(false);
            expect(mockConfigManager.get).toHaveBeenCalledWith('performance', 'quality.enableShadows', true);
        });
        
        test('isBlurEnabled が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(true);
            
            expect(performanceConfig.isBlurEnabled()).toBe(true);
            expect(mockConfigManager.get).toHaveBeenCalledWith('performance', 'quality.enableBlur', true);
        });
        
        test('isAntiAliasingEnabled が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(false);
            
            expect(performanceConfig.isAntiAliasingEnabled()).toBe(false);
            expect(mockConfigManager.get).toHaveBeenCalledWith('performance', 'quality.enableAntiAliasing', true);
        });
        
        test('areReflectionsEnabled が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(false);
            
            expect(performanceConfig.areReflectionsEnabled()).toBe(false);
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
            performanceConfig.setShadowsEnabled(false);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.enableShadows', false);
        });
        
        test('setBlurEnabled が正しく設定されること', () => {
            performanceConfig.setBlurEnabled(true);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.enableBlur', true);
        });
        
        test('setAntiAliasingEnabled が正しく設定されること', () => {
            performanceConfig.setAntiAliasingEnabled(false);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.enableAntiAliasing', false);
        });
        
        test('setReflectionsEnabled が正しく設定されること', () => {
            performanceConfig.setReflectionsEnabled(false);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.enableReflections', false);
        });
    });
    
    describe('品質プリセット', () => {
        test('applyQualityPreset が正しくプリセットを適用すること', () => {
            // プリセットのモック
            const mockPreset = {
                renderQuality: 0.7,
                particleQuality: 0.3,
                effectQuality: 0.2,
                audioQuality: 0.5,
                enableShadows: false,
                enableBlur: false,
                enableAntiAliasing: false,
                enableReflections: false
            };
            
            mockConfigManager.get.mockReturnValueOnce(mockPreset);
            
            const result = performanceConfig.applyQualityPreset('low');
            
            expect(result).toBe(true);
            expect(mockConfigManager.get).toHaveBeenCalledWith('performance', 'performance.quality.presets.low');
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.renderQuality', 0.7);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.particleQuality', 0.3);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.effectQuality', 0.2);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.audioQuality', 0.5);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.enableShadows', false);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.enableBlur', false);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.enableAntiAliasing', false);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.enableReflections', false);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'optimization.performanceLevel', 'low');
        });
        
        test('applyQualityPreset が無効なプリセット名でfalseを返すこと', () => {
            const result = performanceConfig.applyQualityPreset('invalid');
            
            expect(result).toBe(false);
        });
    });
    
    describe('PerformanceOptimizer連携', () => {
        test('applyToPerformanceOptimizer がPerformanceOptimizerに設定を適用すること', () => {
            // PerformanceOptimizerのモック
            const mockOptimizer = {
                targetFPS: 60,
                maxHistorySize: 30,
                setAdaptiveMode: jest.fn(),
                optimizationInterval: 1000,
                setPerformanceLevel: jest.fn(),
                settings: {}
            };
            
            // 設定のモック
            mockConfigManager.get
                // 最適化設定
                .mockReturnValueOnce(50) // targetFPS
                .mockReturnValueOnce(false) // adaptiveMode
                .mockReturnValueOnce(2000) // optimizationInterval
                .mockReturnValueOnce(20) // maxHistorySize
                .mockReturnValueOnce('medium') // performanceLevel
                .mockReturnValueOnce(15) // maxBubbles
                .mockReturnValueOnce(300) // maxParticles
                .mockReturnValueOnce(true) // workloadDistribution
                .mockReturnValueOnce(10) // maxTimePerFrame
                // 品質設定
                .mockReturnValueOnce(0.8) // renderQuality
                .mockReturnValueOnce(0.6) // particleQuality
                .mockReturnValueOnce(0.7) // effectQuality
                .mockReturnValueOnce(0.9) // audioQuality
                .mockReturnValueOnce(false) // enableShadows
                .mockReturnValueOnce(true) // enableBlur
                .mockReturnValueOnce(false) // enableAntiAliasing
                .mockReturnValueOnce(false); // enableReflections
            
            performanceConfig.applyToPerformanceOptimizer(mockOptimizer);
            
            expect(mockOptimizer.targetFPS).toBe(50);
            expect(mockOptimizer.maxHistorySize).toBe(20);
            expect(mockOptimizer.setAdaptiveMode).toHaveBeenCalledWith(false);
            expect(mockOptimizer.optimizationInterval).toBe(2000);
            expect(mockOptimizer.setPerformanceLevel).toHaveBeenCalledWith('medium');
            expect(mockOptimizer.settings).toEqual({
                maxBubbles: 15,
                maxParticles: 300,
                renderQuality: 0.8,
                particleQuality: 0.6,
                effectQuality: 0.7,
                audioQuality: 0.9,
                enableShadows: false,
                enableBlur: true,
                enableAntiAliasing: false
            });
        });
        
        test('syncFromPerformanceOptimizer がPerformanceOptimizerから設定を同期すること', () => {
            // PerformanceOptimizerのモック
            const mockOptimizer = {
                targetFPS: 50,
                adaptiveMode: false,
                performanceLevel: 'medium',
                settings: {
                    maxBubbles: 15,
                    maxParticles: 300,
                    renderQuality: 0.8,
                    particleQuality: 0.6,
                    effectQuality: 0.7,
                    audioQuality: 0.9,
                    enableShadows: false,
                    enableBlur: true,
                    enableAntiAliasing: false
                }
            };
            
            performanceConfig.syncFromPerformanceOptimizer(mockOptimizer);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'optimization.targetFPS', 50);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'optimization.adaptiveMode', false);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'optimization.performanceLevel', 'medium');
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'optimization.maxBubbles', 15);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'optimization.maxParticles', 300);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.renderQuality', 0.8);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.particleQuality', 0.6);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.effectQuality', 0.7);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.audioQuality', 0.9);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.enableShadows', false);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.enableBlur', true);
            expect(mockConfigManager.set).toHaveBeenCalledWith('performance', 'quality.enableAntiAliasing', false);
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