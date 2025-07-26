/**
 * EffectsConfig クラスのユニットテスト
 */

// モックの設定
let mockGetCalls = [];
const mockGet = jest.fn((category, key, defaultValue) => {
    mockGetCalls.push({ category, key, defaultValue });
    // 戻り値は各テストで設定
    return defaultValue;
});

const mockSet = jest.fn((category, key, value) => {
    return true;
});

const mockSetValidationRule = jest.fn();
const mockGetCategory = jest.fn(() => ({}));

const mockConfigManager = {
    get: mockGet,
    set: mockSet,
    setValidationRule: mockSetValidationRule,
    getCategory: mockGetCategory
};

// ConfigurationManagerのモック
const mockGetConfigurationManager = jest.fn(() => mockConfigManager);

// ConfigurationManagerのモック
import { ConfigurationManager, getConfigurationManager } from '../../src/core/ConfigurationManager.js';

// ErrorHandlerのモック
import { getErrorHandler } from '../../src/utils/ErrorHandler.js';

import { EffectsConfig, getEffectsConfig } from '../../src/config/EffectsConfig.js';

describe('EffectsConfig', () => {
    let effectsConfig;
    
    beforeEach(() => {
        // テスト前にモックをリセット
        mockGetCalls = [];
        
        // 新しいインスタンスを作成
        effectsConfig = new EffectsConfig();
    });
    
    describe('初期化', () => {
        test('コンストラクタが正しく初期化されること', () => {
            expect(effectsConfig).toBeDefined();
            expect(mockGetConfigurationManager).toHaveBeenCalled();
        });
        
        test('初期化時にパーティクル設定が登録されること', () => {
            expect(mockConfigManager.set).toHaveBeenCalledWith('effects', 'particles.maxCount', 500);
            expect(mockConfigManager.set).toHaveBeenCalledWith('effects', 'particles.poolSize', 100);
            expect(mockConfigManager.set).toHaveBeenCalledWith('effects', 'particles.quality', 1.0);
            expect(mockConfigManager.set).toHaveBeenCalledWith('effects', 'particles.enabled', true);
        });
        
        test('初期化時に画面効果設定が登録されること', () => {
            expect(mockConfigManager.set).toHaveBeenCalledWith('effects', 'screen.shakeIntensity', 1.0);
            expect(mockConfigManager.set).toHaveBeenCalledWith('effects', 'screen.flashDuration', 200);
            expect(mockConfigManager.set).toHaveBeenCalledWith('effects', 'screen.zoomSensitivity', 1.0);
            expect(mockConfigManager.set).toHaveBeenCalledWith('effects', 'screen.enabled', true);
        });
        
        test('初期化時にアニメーション設定が登録されること', () => {
            expect(mockConfigManager.set).toHaveBeenCalledWith('effects', 'animations.duration', 300);
            expect(mockConfigManager.set).toHaveBeenCalledWith('effects', 'animations.easing', 'easeOut');
            expect(mockConfigManager.set).toHaveBeenCalledWith('effects', 'animations.enabled', true);
        });
        
        test('初期化時に検証ルールが設定されること', () => {
            expect(mockConfigManager.setValidationRule).toHaveBeenCalledWith('effects', 'particles.maxCount', expect.any(Object));
            expect(mockConfigManager.setValidationRule).toHaveBeenCalledWith('effects', 'screen.shakeIntensity', expect.any(Object));
            expect(mockConfigManager.setValidationRule).toHaveBeenCalledWith('effects', 'animations.duration', expect.any(Object));
        });
    });
    
    describe('パーティクル設定', () => {
        test('getParticleConfig が正しいパーティクル設定を返すこと', () => {
            mockConfigManager.get
                .mockReturnValueOnce(400) // maxCount
                .mockReturnValueOnce(80)  // poolSize
                .mockReturnValueOnce(0.8) // quality
                .mockReturnValueOnce(true) // enabled
                .mockReturnValueOnce(10) // bubble.count
                .mockReturnValueOnce(2)  // bubble.size
                .mockReturnValueOnce(80) // bubble.speed
                .mockReturnValueOnce(600) // bubble.life
                .mockReturnValueOnce(8)  // star.count
                .mockReturnValueOnce(3)  // star.size
                .mockReturnValueOnce(60) // star.speed
                .mockReturnValueOnce(1000) // star.life
                .mockReturnValueOnce(20) // explosion.count
                .mockReturnValueOnce(4)  // explosion.size
                .mockReturnValueOnce(120) // explosion.speed
                .mockReturnValueOnce(1200); // explosion.life
                
            const particleConfig = effectsConfig.getParticleConfig();
            
            expect(particleConfig).toEqual({
                maxCount: 400,
                poolSize: 80,
                quality: 0.8,
                enabled: true,
                bubble: {
                    count: 10,
                    size: 2,
                    speed: 80,
                    life: 600
                },
                star: {
                    count: 8,
                    size: 3,
                    speed: 60,
                    life: 1000
                },
                explosion: {
                    count: 20,
                    size: 4,
                    speed: 120,
                    life: 1200
                }
            });
        });
        
        test('getMaxParticleCount が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(400);
            
            expect(effectsConfig.getMaxParticleCount()).toBe(400);
            expect(mockConfigManager.get).toHaveBeenCalledWith('effects', 'particles.maxCount', 500);
        });
        
        test('getParticlePoolSize が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(80);
            
            expect(effectsConfig.getParticlePoolSize()).toBe(80);
            expect(mockConfigManager.get).toHaveBeenCalledWith('effects', 'particles.poolSize', 100);
        });
        
        test('getParticleQuality が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(0.8);
            
            expect(effectsConfig.getParticleQuality()).toBe(0.8);
            expect(mockConfigManager.get).toHaveBeenCalledWith('effects', 'particles.quality', 1.0);
        });
        
        test('isParticleEnabled が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(false);
            
            expect(effectsConfig.isParticleEnabled()).toBe(false);
            expect(mockConfigManager.get).toHaveBeenCalledWith('effects', 'particles.enabled', true);
        });
        
        test('setMaxParticleCount が正しく設定されること', () => {
            effectsConfig.setMaxParticleCount(400);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('effects', 'particles.maxCount', 400);
        });
        
        test('setParticlePoolSize が正しく設定されること', () => {
            effectsConfig.setParticlePoolSize(80);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('effects', 'particles.poolSize', 80);
        });
        
        test('setParticleQuality が正しく設定されること', () => {
            effectsConfig.setParticleQuality(0.8);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('effects', 'particles.quality', 0.8);
        });
        
        test('setParticleEnabled が正しく設定されること', () => {
            effectsConfig.setParticleEnabled(false);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('effects', 'particles.enabled', false);
        });
    });
    
    describe('画面効果設定', () => {
        test('getScreenEffectConfig が正しい画面効果設定を返すこと', () => {
            mockConfigManager.get
                .mockReturnValueOnce(0.8) // shakeIntensity
                .mockReturnValueOnce(150) // flashDuration
                .mockReturnValueOnce(1.2) // zoomSensitivity
                .mockReturnValueOnce(true) // enabled
                .mockReturnValueOnce(8)   // shake.intensity
                .mockReturnValueOnce(400) // shake.duration
                .mockReturnValueOnce(0.8) // shake.damping
                .mockReturnValueOnce(0.4) // flash.intensity
                .mockReturnValueOnce(150) // flash.duration
                .mockReturnValueOnce(0.7) // zoom.min
                .mockReturnValueOnce(1.3) // zoom.max
                .mockReturnValueOnce(0.4) // zoom.speed
                .mockReturnValueOnce(0.2) // tint.intensity
                .mockReturnValueOnce(400); // tint.duration
                
            const screenEffectConfig = effectsConfig.getScreenEffectConfig();
            
            expect(screenEffectConfig).toEqual({
                shakeIntensity: 0.8,
                flashDuration: 150,
                zoomSensitivity: 1.2,
                enabled: true,
                shake: {
                    intensity: 8,
                    duration: 400,
                    damping: 0.8
                },
                flash: {
                    intensity: 0.4,
                    duration: 150
                },
                zoom: {
                    min: 0.7,
                    max: 1.3,
                    speed: 0.4
                },
                tint: {
                    intensity: 0.2,
                    duration: 400
                }
            });
        });
        
        test('getShakeIntensity が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(0.8);
            
            expect(effectsConfig.getShakeIntensity()).toBe(0.8);
            expect(mockConfigManager.get).toHaveBeenCalledWith('effects', 'screen.shakeIntensity', 1.0);
        });
        
        test('getFlashDuration が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(150);
            
            expect(effectsConfig.getFlashDuration()).toBe(150);
            expect(mockConfigManager.get).toHaveBeenCalledWith('effects', 'screen.flashDuration', 200);
        });
        
        test('getZoomSensitivity が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(1.2);
            
            expect(effectsConfig.getZoomSensitivity()).toBe(1.2);
            expect(mockConfigManager.get).toHaveBeenCalledWith('effects', 'screen.zoomSensitivity', 1.0);
        });
        
        test('isScreenEffectEnabled が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(false);
            
            expect(effectsConfig.isScreenEffectEnabled()).toBe(false);
            expect(mockConfigManager.get).toHaveBeenCalledWith('effects', 'screen.enabled', true);
        });
        
        test('setShakeIntensity が正しく設定されること', () => {
            effectsConfig.setShakeIntensity(0.8);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('effects', 'screen.shakeIntensity', 0.8);
        });
        
        test('setFlashDuration が正しく設定されること', () => {
            effectsConfig.setFlashDuration(150);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('effects', 'screen.flashDuration', 150);
        });
        
        test('setZoomSensitivity が正しく設定されること', () => {
            effectsConfig.setZoomSensitivity(1.2);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('effects', 'screen.zoomSensitivity', 1.2);
        });
        
        test('setScreenEffectEnabled が正しく設定されること', () => {
            effectsConfig.setScreenEffectEnabled(false);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('effects', 'screen.enabled', false);
        });
    });
    
    describe('アニメーション設定', () => {
        test('getAnimationConfig が正しいアニメーション設定を返すこと', () => {
            mockConfigManager.get
                .mockReturnValueOnce(250) // duration
                .mockReturnValueOnce('easeInOut') // easing
                .mockReturnValueOnce(true) // enabled
                .mockReturnValueOnce(250) // pop.duration
                .mockReturnValueOnce(1.1) // pop.scale
                .mockReturnValueOnce('easeOut') // pop.easing
                .mockReturnValueOnce(400) // fade.duration
                .mockReturnValueOnce('linear') // fade.easing
                .mockReturnValueOnce(350) // slide.duration
                .mockReturnValueOnce(40)  // slide.distance
                .mockReturnValueOnce('easeIn') // slide.easing
                .mockReturnValueOnce(500) // bounce.duration
                .mockReturnValueOnce(25)  // bounce.height
                .mockReturnValueOnce('easeOutBounce'); // bounce.easing
                
            const animationConfig = effectsConfig.getAnimationConfig();
            
            expect(animationConfig).toEqual({
                duration: 250,
                easing: 'easeInOut',
                enabled: true,
                pop: {
                    duration: 250,
                    scale: 1.1,
                    easing: 'easeOut'
                },
                fade: {
                    duration: 400,
                    easing: 'linear'
                },
                slide: {
                    duration: 350,
                    distance: 40,
                    easing: 'easeIn'
                },
                bounce: {
                    duration: 500,
                    height: 25,
                    easing: 'easeOutBounce'
                }
            });
        });
        
        test('getAnimationDuration が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(250);
            
            expect(effectsConfig.getAnimationDuration()).toBe(250);
            expect(mockConfigManager.get).toHaveBeenCalledWith('effects', 'animations.duration', 300);
        });
        
        test('getAnimationEasing が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce('easeInOut');
            
            expect(effectsConfig.getAnimationEasing()).toBe('easeInOut');
            expect(mockConfigManager.get).toHaveBeenCalledWith('effects', 'animations.easing', 'easeOut');
        });
        
        test('isAnimationEnabled が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(false);
            
            expect(effectsConfig.isAnimationEnabled()).toBe(false);
            expect(mockConfigManager.get).toHaveBeenCalledWith('effects', 'animations.enabled', true);
        });
        
        test('setAnimationDuration が正しく設定されること', () => {
            effectsConfig.setAnimationDuration(250);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('effects', 'animations.duration', 250);
        });
        
        test('setAnimationEasing が正しく設定されること', () => {
            effectsConfig.setAnimationEasing('easeInOut');
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('effects', 'animations.easing', 'easeInOut');
        });
        
        test('setAnimationEnabled が正しく設定されること', () => {
            effectsConfig.setAnimationEnabled(false);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('effects', 'animations.enabled', false);
        });
    });
    
    describe('ParticleManager連携', () => {
        test('applyToParticleManager がParticleManagerに設定を適用すること', () => {
            // ParticleManagerのモック
            const mockParticleManager = {
                maxParticles: 300,
                poolSize: 50,
                particlePool: Array(50),
                initializePool: function() { this.initializePoolCalled = true; }
            };
            
            // パーティクル設定のモック
            mockConfigManager.get = function(category, key, defaultValue) {
                if (key === 'particles.maxCount') return 400;
                if (key === 'particles.poolSize') return 80;
                return defaultValue;
            };
            
            effectsConfig.applyToParticleManager(mockParticleManager);
            
            expect(mockParticleManager.maxParticles).toBe(400);
            expect(mockParticleManager.poolSize).toBe(80);
            expect(mockParticleManager.initializePoolCalled).toBe(true);
        });
        
        test('syncFromParticleManager がParticleManagerから設定を同期すること', () => {
            // ParticleManagerのモック
            const mockParticleManager = {
                maxParticles: 400,
                poolSize: 80
            };
            
            effectsConfig.syncFromParticleManager(mockParticleManager);
            
            expect(mockConfigManager.set).toHaveBeenCalledWith('effects', 'particles.maxCount', 400);
            expect(mockConfigManager.set).toHaveBeenCalledWith('effects', 'particles.poolSize', 80);
        });
    });
    
    describe('EffectManager連携', () => {
        test('applyToEffectManager がEffectManagerに設定を適用すること', () => {
            // EffectManagerのモック
            const mockEffectManager = {};
            
            effectsConfig.applyToEffectManager(mockEffectManager);
            
            // 現在の実装では具体的な適用処理はないため、エラーが発生しないことを確認
            expect(() => effectsConfig.applyToEffectManager(mockEffectManager)).not.toThrow();
        });
        
        test('syncFromEffectManager がEffectManagerから設定を同期すること', () => {
            // EffectManagerのモック
            const mockEffectManager = {};
            
            effectsConfig.syncFromEffectManager(mockEffectManager);
            
            // 現在の実装では具体的な同期処理はないため、エラーが発生しないことを確認
            expect(() => effectsConfig.syncFromEffectManager(mockEffectManager)).not.toThrow();
        });
    });
    
    describe('シングルトンパターン', () => {
        test('getEffectsConfig が常に同じインスタンスを返すこと', () => {
            const instance1 = getEffectsConfig();
            const instance2 = getEffectsConfig();
            
            expect(instance1).toBe(instance2);
        });
    });
});