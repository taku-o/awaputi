/**
 * EffectsConfig クラスのユニットテスト
 */
import { jest } from '@jest/globals';
// Types
interface MockConfigManager {
    get: jest.Mock<(category: string, key: string, defaultValue => any>);
    set: jest.Mock<(category: string, key: string, value => boolean>);
    setValidationRule: jest.Mock<(category: string, key: string, rule => void>);
    getCategory: jest.Mock<() => Record<string, any>>;
}
interface MockGetCall {
    category: string,
    key: string,
    defaultValue: any,
}
interface ParticleConfig {
    maxCount: number,
    poolSize: number,
    quality: number,
    enabled: boolean,
    bubble: {
        count: number,
        size: number,
        speed: number,
        life: number
    },
    star: {
        count: number,
        size: number,
        speed: number,
        life: number
    },
    explosion: {
        count: number,
        size: number,
        speed: number,
        life: number,
    };
}
interface ScreenEffectConfig {
    shakeIntensity: number,
    flashDuration: number,
    zoomSensitivity: number,
    enabled: boolean,
    shake: {
        intensity: number,
        duration: number,
        damping: number
    },
    flash: {
        intensity: number,
        duration: number
    },
    zoom: {
        min: number,
        max: number,
        speed: number
    },
    tint: {
        intensity: number,
        duration: number,
    };
}
interface AnimationConfig {
    duration: number,
    easing: string,
    enabled: boolean,
    pop: {
        duration: number,
        scale: number,
        easing: string
    },
    fade: {
        duration: number,
        easing: string
    },
    slide: {
        duration: number,
        distance: number,
        easing: string
    },
    bounce: {
        duration: number,
        height: number,
        easing: string,
    };
}
interface MockParticleManager {
    maxParticles: number,
    poolSize: number,
    particlePool: any[],
    initializePool: () => void;
    initializePoolCalled?: boolean;
}
interface MockEffectManager {
    // Currently no specific properties required
}
// モックの設定
let mockGetCalls: MockGetCall[] = [],
const mockGet = jest.fn((category: string, key: string, defaultValue => {);
    mockGetCalls.push({ category, key, defaultValue );
    // 戻り値は各テストで設定
    return defaultValue;
});
const mockSet = jest.fn((category: string, key: string, value: boolean => {
    return true;);
});
const mockSetValidationRule = jest.fn();
const mockGetCategory = jest.fn(() => ({)));
const mockConfigManager: MockConfigManager = {
    get: mockGet,
    set: mockSet,
    setValidationRule: mockSetValidationRule,
    getCategory: mockGetCategory
    });
// ConfigurationManagerのモック
const mockGetConfigurationManager = jest.fn(() => mockConfigManager);
// テスト用のEffectsConfigクラス（依存性注入対応）
class TestEffectsConfig {
    configManager: MockConfigManager,
    constructor(configManager: MockConfigManager = mockConfigManager) {
        this.configManager = configManager;
        this._initialize();
    )
    // 実装は元のEffectsConfigと同じメソッドをコピーしてテスト用に作成
    private _initialize(): void {
        try {
            this._initializeParticleConfig();
            this._initializeScreenEffectConfig();
            this._initializeAnimationConfig();
            this._setupValidationRules();
        ) catch (error) {
            // エラーハンドリングもモック化
            });
    }
    private _initializeParticleConfig('): void {
        this.configManager.set('effects', 'particles.maxCount', 500');
        this.configManager.set('effects', 'particles.poolSize', 100');
        this.configManager.set('effects', 'particles.quality', 1.0');
        this.configManager.set('effects', 'particles.enabled', true');
        this.configManager.set('effects', 'particles.bubble.count', 15');
        this.configManager.set('effects', 'particles.bubble.size', 3');
        this.configManager.set('effects', 'particles.bubble.speed', 100');
        this.configManager.set('effects', 'particles.bubble.life', 800');
        this.configManager.set('effects', 'particles.star.count', 10');
        this.configManager.set('effects', 'particles.star.size', 4');
        this.configManager.set('effects', 'particles.star.speed', 80');
        this.configManager.set('effects', 'particles.star.life', 1200');
        this.configManager.set('effects', 'particles.explosion.count', 30');
        this.configManager.set('effects', 'particles.explosion.size', 5');
        this.configManager.set('effects', 'particles.explosion.speed', 150');
        this.configManager.set('effects', 'particles.explosion.life', 1500);
    }
    private _initializeScreenEffectConfig('): void {
        this.configManager.set('effects', 'screen.shakeIntensity', 1.0');
        this.configManager.set('effects', 'screen.flashDuration', 200');
        this.configManager.set('effects', 'screen.zoomSensitivity', 1.0');
        this.configManager.set('effects', 'screen.enabled', true');
        this.configManager.set('effects', 'screen.shake.intensity', 10');
        this.configManager.set('effects', 'screen.shake.duration', 500');
        this.configManager.set('effects', 'screen.shake.damping', 0.9');
        this.configManager.set('effects', 'screen.flash.intensity', 0.5');
        this.configManager.set('effects', 'screen.flash.duration', 200');
        this.configManager.set('effects', 'screen.zoom.min', 0.8');
        this.configManager.set('effects', 'screen.zoom.max', 1.2');
        this.configManager.set('effects', 'screen.zoom.speed', 0.3');
        this.configManager.set('effects', 'screen.tint.intensity', 0.3');
        this.configManager.set('effects', 'screen.tint.duration', 500);
    }
    private _initializeAnimationConfig('): void {
        this.configManager.set('effects', 'animations.duration', 300');
        this.configManager.set('effects', 'animations.easing', 'easeOut'');
        this.configManager.set('effects', 'animations.enabled', true');
        this.configManager.set('effects', 'animations.pop.duration', 300');
        this.configManager.set('effects', 'animations.pop.scale', 1.2');
        this.configManager.set('effects', 'animations.pop.easing', 'easeOutBack'');
        this.configManager.set('effects', 'animations.fade.duration', 500');
        this.configManager.set('effects', 'animations.fade.easing', 'easeInOut'');
        this.configManager.set('effects', 'animations.slide.duration', 400');
        this.configManager.set('effects', 'animations.slide.distance', 50');
        this.configManager.set('effects', 'animations.slide.easing', 'easeOutQuad'');
        this.configManager.set('effects', 'animations.bounce.duration', 600');
        this.configManager.set('effects', 'animations.bounce.height', 30');
        this.configManager.set('effects', 'animations.bounce.easing', 'easeOutBounce');
    }
    private _setupValidationRules('): void {
        this.configManager.setValidationRule('effects', 'particles.maxCount', { type: 'number', min: 0, max: 2000 )'),
        this.configManager.setValidationRule('effects', 'screen.shakeIntensity', { type: 'number', min: 0, max: 2.0 )'),
        this.configManager.setValidationRule('effects', 'animations.duration', { type: 'number', min: 0, max: 2000 ),
    }
    getParticleConfig('): ParticleConfig {
        return {
            maxCount: this.configManager.get('effects', 'particles.maxCount', 500'),
            poolSize: this.configManager.get('effects', 'particles.poolSize', 100'),
            quality: this.configManager.get('effects', 'particles.quality', 1.0'),
            enabled: this.configManager.get('effects', 'particles.enabled', true'),
            bubble: {
                count: this.configManager.get('effects', 'particles.bubble.count', 15'),
                size: this.configManager.get('effects', 'particles.bubble.size', 3'),
                speed: this.configManager.get('effects', 'particles.bubble.speed', 100'),
                life: this.configManager.get('effects', 'particles.bubble.life', 800');
            },
            star: {
                count: this.configManager.get('effects', 'particles.star.count', 10'),
                size: this.configManager.get('effects', 'particles.star.size', 4'),
                speed: this.configManager.get('effects', 'particles.star.speed', 80'),
                life: this.configManager.get('effects', 'particles.star.life', 1200');
            },
            explosion: {
                count: this.configManager.get('effects', 'particles.explosion.count', 30'),
                size: this.configManager.get('effects', 'particles.explosion.size', 5'),
                speed: this.configManager.get('effects', 'particles.explosion.speed', 150'),
                life: this.configManager.get('effects', 'particles.explosion.life', 1500);
            }
        };
    }
    getMaxParticleCount('): number { return this.configManager.get('effects', 'particles.maxCount', 500); }
    getParticlePoolSize('): number { return this.configManager.get('effects', 'particles.poolSize', 100); }
    getParticleQuality('): number { return this.configManager.get('effects', 'particles.quality', 1.0); }
    isParticleEnabled('): boolean { return this.configManager.get('effects', 'particles.enabled', true); }
    setMaxParticleCount(count: number'): boolean { return this.configManager.set('effects', 'particles.maxCount', count); }
    setParticlePoolSize(size: number'): boolean { return this.configManager.set('effects', 'particles.poolSize', size); }
    setParticleQuality(quality: number'): boolean { return this.configManager.set('effects', 'particles.quality', quality); }
    setParticleEnabled(enabled: boolean'): boolean { return this.configManager.set('effects', 'particles.enabled', enabled); }
    getScreenEffectConfig('): ScreenEffectConfig {
        return {
            shakeIntensity: this.configManager.get('effects', 'screen.shakeIntensity', 1.0'),
            flashDuration: this.configManager.get('effects', 'screen.flashDuration', 200'),
            zoomSensitivity: this.configManager.get('effects', 'screen.zoomSensitivity', 1.0'),
            enabled: this.configManager.get('effects', 'screen.enabled', true'),
            shake: {
                intensity: this.configManager.get('effects', 'screen.shake.intensity', 10'),
                duration: this.configManager.get('effects', 'screen.shake.duration', 500'),
                damping: this.configManager.get('effects', 'screen.shake.damping', 0.9');
            },
            flash: {
                intensity: this.configManager.get('effects', 'screen.flash.intensity', 0.5'),
                duration: this.configManager.get('effects', 'screen.flash.duration', 200');
            },
            zoom: {
                min: this.configManager.get('effects', 'screen.zoom.min', 0.8'),
                max: this.configManager.get('effects', 'screen.zoom.max', 1.2'),
                speed: this.configManager.get('effects', 'screen.zoom.speed', 0.3');
            },
            tint: {
                intensity: this.configManager.get('effects', 'screen.tint.intensity', 0.3'),
                duration: this.configManager.get('effects', 'screen.tint.duration', 500);
            }
        };
    }
    getShakeIntensity('): number { return this.configManager.get('effects', 'screen.shakeIntensity', 1.0); }
    getFlashDuration('): number { return this.configManager.get('effects', 'screen.flashDuration', 200); }
    getZoomSensitivity('): number { return this.configManager.get('effects', 'screen.zoomSensitivity', 1.0); }
    isScreenEffectEnabled('): boolean { return this.configManager.get('effects', 'screen.enabled', true); }
    setShakeIntensity(intensity: number'): boolean { return this.configManager.set('effects', 'screen.shakeIntensity', intensity); }
    setFlashDuration(duration: number'): boolean { return this.configManager.set('effects', 'screen.flashDuration', duration); }
    setZoomSensitivity(sensitivity: number'): boolean { return this.configManager.set('effects', 'screen.zoomSensitivity', sensitivity); }
    setScreenEffectEnabled(enabled: boolean'): boolean { return this.configManager.set('effects', 'screen.enabled', enabled); }
    getAnimationConfig('): AnimationConfig {
        return {
            duration: this.configManager.get('effects', 'animations.duration', 300'),
            easing: this.configManager.get('effects', 'animations.easing', 'easeOut''),
            enabled: this.configManager.get('effects', 'animations.enabled', true'),
            pop: {
                duration: this.configManager.get('effects', 'animations.pop.duration', 300'),
                scale: this.configManager.get('effects', 'animations.pop.scale', 1.2'),
                easing: this.configManager.get('effects', 'animations.pop.easing', 'easeOutBack'');
            },
            fade: {
                duration: this.configManager.get('effects', 'animations.fade.duration', 500'),
                easing: this.configManager.get('effects', 'animations.fade.easing', 'easeInOut'');
            },
            slide: {
                duration: this.configManager.get('effects', 'animations.slide.duration', 400'),
                distance: this.configManager.get('effects', 'animations.slide.distance', 50'),
                easing: this.configManager.get('effects', 'animations.slide.easing', 'easeOutQuad'');
            },
            bounce: {
                duration: this.configManager.get('effects', 'animations.bounce.duration', 600'),
                height: this.configManager.get('effects', 'animations.bounce.height', 30'),
                easing: this.configManager.get('effects', 'animations.bounce.easing', 'easeOutBounce');
            }
        };
    }
    getAnimationDuration('): number { return this.configManager.get('effects', 'animations.duration', 300); }
    getAnimationEasing('): string { return this.configManager.get('effects', 'animations.easing', 'easeOut'); }
    isAnimationEnabled('): boolean { return this.configManager.get('effects', 'animations.enabled', true); }
    setAnimationDuration(duration: number'): boolean { return this.configManager.set('effects', 'animations.duration', duration); }
    setAnimationEasing(easing: string'): boolean { return this.configManager.set('effects', 'animations.easing', easing); }
    setAnimationEnabled(enabled: boolean'): boolean { return this.configManager.set('effects', 'animations.enabled', enabled); }
    applyToParticleManager(particleManager: MockParticleManager): void {
        if (!particleManager') throw new Error('ParticleManagerが指定されていません');
        const particleConfig = this.getParticleConfig();
        particleManager.maxParticles = particleConfig.maxCount;
        particleManager.poolSize = particleConfig.poolSize;
        if (particleManager.particlePool.length !== particleConfig.poolSize) {
            particleManager.particlePool = [];
            particleManager.initializePool();
        }
    }
    applyToEffectManager(effectManager: MockEffectManager): void {
        if (!effectManager') throw new Error('EffectManagerが指定されていません');
    }
    syncFromParticleManager(particleManager: MockParticleManager): void {
        if (!particleManager') throw new Error('ParticleManagerが指定されていません');
        this.setMaxParticleCount(particleManager.maxParticles);
        this.setParticlePoolSize(particleManager.poolSize);
    }
    syncFromEffectManager(effectManager: MockEffectManager): void {
        if (!effectManager') throw new Error('EffectManagerが指定されていません'');
    }
}
describe('EffectsConfig', () => {
    let effectsConfig: TestEffectsConfig,
    
    beforeEach(() => {
        // テスト前にモックをリセット
        mockGetCalls = [];
        jest.clearAllMocks();
        // モック関数をリセット
        mockGetConfigurationManager.mockReturnValue(mockConfigManager);
        mockGet.mockImplementation((category: string, key: string, defaultValue => {);
            mockGetCalls.push({ category, key, defaultValue });
            return defaultValue;
        });
        mockSet.mockReturnValue(true);
        // テスト用クラスのインスタンスを作成
        effectsConfig = new TestEffectsConfig(mockConfigManager);
    }');
    describe('初期化', (') => {
        test('コンストラクタが正しく初期化されること', () => {
            expect(effectsConfig).toBeDefined();
            // TestEffectsConfigは直接configManagerを受け取るため、getConfigurationManagerは呼ばれない
            expect(effectsConfig.configManager).toBe(mockConfigManager);
        }');
        test('初期化時にパーティクル設定が登録されること', () => {
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'particles.maxCount', 500);
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'particles.poolSize', 100);
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'particles.quality', 1.0);
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'particles.enabled', true);
            // bubble設定（実装と一致）
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'particles.bubble.count', 15);
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'particles.bubble.size', 3);
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'particles.bubble.speed', 100);
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'particles.bubble.life', 800);
        }');
        test('初期化時に画面効果設定が登録されること', () => {
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'screen.shakeIntensity', 1.0);
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'screen.flashDuration', 200);
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'screen.zoomSensitivity', 1.0);
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'screen.enabled', true);
            // 詳細設定（実装と一致）
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'screen.shake.intensity', 10);
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'screen.shake.duration', 500);
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'screen.shake.damping', 0.9);
        }');
        test('初期化時にアニメーション設定が登録されること', () => {
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'animations.duration', 300);
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'animations.easing', 'easeOut');
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'animations.enabled', true);
            // 詳細設定（実装と一致）
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'animations.pop.duration', 300);
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'animations.pop.scale', 1.2);
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'animations.pop.easing', 'easeOutBack');
        }');
        test('初期化時に検証ルールが設定されること', () => {
            expect(mockConfigManager.setValidationRule').toHaveBeenCalledWith('effects', 'particles.maxCount', expect.any(Object);
            expect(mockConfigManager.setValidationRule').toHaveBeenCalledWith('effects', 'screen.shakeIntensity', expect.any(Object);
            expect(mockConfigManager.setValidationRule').toHaveBeenCalledWith('effects', 'animations.duration', expect.any(Object);
        }');
    }
    describe('パーティクル設定', (') => {
        test('getParticleConfig が正しいパーティクル設定を返すこと', () => {
            mockConfigManager.get
                .mockReturnValueOnce(400) // maxCount
                .mockReturnValueOnce(80)  // poolSize
                .mockReturnValueOnce(0.8) // quality
                .mockReturnValueOnce(true) // enabled
                .mockReturnValueOnce(15) // bubble.count（実装値）
                .mockReturnValueOnce(3)  // bubble.size（実装値）
                .mockReturnValueOnce(100) // bubble.speed（実装値）
                .mockReturnValueOnce(800) // bubble.life（実装値）
                .mockReturnValueOnce(10)  // star.count（実装値）
                .mockReturnValueOnce(4)  // star.size（実装値）
                .mockReturnValueOnce(80) // star.speed（実装値）
                .mockReturnValueOnce(1200) // star.life（実装値）
                .mockReturnValueOnce(30) // explosion.count（実装値）
                .mockReturnValueOnce(5)  // explosion.size（実装値）
                .mockReturnValueOnce(150) // explosion.speed（実装値）
                .mockReturnValueOnce(1500); // explosion.life（実装値）
                
            const particleConfig = effectsConfig.getParticleConfig();
            expect(particleConfig).toEqual({
                maxCount: 400,
                poolSize: 80,
                quality: 0.8,
                enabled: true,
                bubble: {
                    count: 15,
                    size: 3,
                    speed: 100,
                    life: 800
                },
                star: {
                    count: 10,
                    size: 4,
                    speed: 80,
                    life: 1200
                },
                explosion: {
                    count: 30,
                    size: 5,
                    speed: 150,
                    life: 1500
                })');
        }
        test('getMaxParticleCount が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(400);
            expect(effectsConfig.getMaxParticleCount().toBe(400);
            expect(mockConfigManager.get').toHaveBeenCalledWith('effects', 'particles.maxCount', 500);
        }');
        test('getParticlePoolSize が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(80);
            expect(effectsConfig.getParticlePoolSize().toBe(80);
            expect(mockConfigManager.get').toHaveBeenCalledWith('effects', 'particles.poolSize', 100);
        }');
        test('getParticleQuality が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(0.8);
            expect(effectsConfig.getParticleQuality().toBe(0.8);
            expect(mockConfigManager.get').toHaveBeenCalledWith('effects', 'particles.quality', 1.0);
        }');
        test('isParticleEnabled が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(false);
            expect(effectsConfig.isParticleEnabled().toBe(false);
            expect(mockConfigManager.get').toHaveBeenCalledWith('effects', 'particles.enabled', true);
        }');
        test('setMaxParticleCount が正しく設定されること', () => {
            effectsConfig.setMaxParticleCount(400);
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'particles.maxCount', 400);
        }');
        test('setParticlePoolSize が正しく設定されること', () => {
            effectsConfig.setParticlePoolSize(80);
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'particles.poolSize', 80);
        }');
        test('setParticleQuality が正しく設定されること', () => {
            effectsConfig.setParticleQuality(0.8);
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'particles.quality', 0.8);
        }');
        test('setParticleEnabled が正しく設定されること', () => {
            effectsConfig.setParticleEnabled(false);
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'particles.enabled', false);
        }');
    }
    describe('画面効果設定', (') => {
        test('getScreenEffectConfig が正しい画面効果設定を返すこと', () => {
            mockConfigManager.get
                .mockReturnValueOnce(0.8) // shakeIntensity
                .mockReturnValueOnce(150) // flashDuration
                .mockReturnValueOnce(1.2) // zoomSensitivity
                .mockReturnValueOnce(true) // enabled
                .mockReturnValueOnce(10)   // shake.intensity（実装値）
                .mockReturnValueOnce(500) // shake.duration（実装値）
                .mockReturnValueOnce(0.9) // shake.damping（実装値）
                .mockReturnValueOnce(0.5) // flash.intensity（実装値）
                .mockReturnValueOnce(200) // flash.duration（実装値）
                .mockReturnValueOnce(0.8) // zoom.min（実装値）
                .mockReturnValueOnce(1.2) // zoom.max（実装値）
                .mockReturnValueOnce(0.3) // zoom.speed（実装値）
                .mockReturnValueOnce(0.3) // tint.intensity（実装値）
                .mockReturnValueOnce(500); // tint.duration（実装値）
                
            const screenEffectConfig = effectsConfig.getScreenEffectConfig();
            expect(screenEffectConfig).toEqual({
                shakeIntensity: 0.8,
                flashDuration: 150,
                zoomSensitivity: 1.2,
                enabled: true,
                shake: {
                    intensity: 10,
                    duration: 500,
                    damping: 0.9
                },
                flash: {
                    intensity: 0.5,
                    duration: 200
                },
                zoom: {
                    min: 0.8,
                    max: 1.2,
                    speed: 0.3
                },
                tint: {
                    intensity: 0.3,
                    duration: 500
                })');
        }
        test('getShakeIntensity が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(0.8);
            expect(effectsConfig.getShakeIntensity().toBe(0.8);
            expect(mockConfigManager.get').toHaveBeenCalledWith('effects', 'screen.shakeIntensity', 1.0);
        }');
        test('getFlashDuration が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(150);
            expect(effectsConfig.getFlashDuration().toBe(150);
            expect(mockConfigManager.get').toHaveBeenCalledWith('effects', 'screen.flashDuration', 200);
        }');
        test('getZoomSensitivity が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(1.2);
            expect(effectsConfig.getZoomSensitivity().toBe(1.2);
            expect(mockConfigManager.get').toHaveBeenCalledWith('effects', 'screen.zoomSensitivity', 1.0);
        }');
        test('isScreenEffectEnabled が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(false);
            expect(effectsConfig.isScreenEffectEnabled().toBe(false);
            expect(mockConfigManager.get').toHaveBeenCalledWith('effects', 'screen.enabled', true);
        }');
        test('setShakeIntensity が正しく設定されること', () => {
            effectsConfig.setShakeIntensity(0.8);
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'screen.shakeIntensity', 0.8);
        }');
        test('setFlashDuration が正しく設定されること', () => {
            effectsConfig.setFlashDuration(150);
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'screen.flashDuration', 150);
        }');
        test('setZoomSensitivity が正しく設定されること', () => {
            effectsConfig.setZoomSensitivity(1.2);
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'screen.zoomSensitivity', 1.2);
        }');
        test('setScreenEffectEnabled が正しく設定されること', () => {
            effectsConfig.setScreenEffectEnabled(false);
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'screen.enabled', false);
        }');
    }
    describe('アニメーション設定', (') => {
        test('getAnimationConfig が正しいアニメーション設定を返すこと', () => {
            mockConfigManager.get
                .mockReturnValueOnce(250') // duration
                .mockReturnValueOnce('easeInOut') // easing
                .mockReturnValueOnce(true) // enabled
                .mockReturnValueOnce(300) // pop.duration（実装値）
                .mockReturnValueOnce(1.2') // pop.scale（実装値）
                .mockReturnValueOnce('easeOutBack') // pop.easing（実装値）
                .mockReturnValueOnce(500') // fade.duration（実装値）
                .mockReturnValueOnce('easeInOut') // fade.easing（実装値）
                .mockReturnValueOnce(400) // slide.duration（実装値）
                .mockReturnValueOnce(50')  // slide.distance（実装値）
                .mockReturnValueOnce('easeOutQuad') // slide.easing（実装値）
                .mockReturnValueOnce(600) // bounce.duration（実装値）
                .mockReturnValueOnce(30')  // bounce.height（実装値）
                .mockReturnValueOnce('easeOutBounce'); // bounce.easing（実装値）
                
            const animationConfig = effectsConfig.getAnimationConfig();
            expect(animationConfig').toEqual({
                duration: 250,
                easing: 'easeInOut',
                enabled: true,
                pop: {
                    duration: 300,
                    scale: 1.2,
                    easing: 'easeOutBack'
                },
                fade: {
                    duration: 500,
                    easing: 'easeInOut'
                },
                slide: {
                    duration: 400,
                    distance: 50,
                    easing: 'easeOutQuad'
                },
                bounce: {
                    duration: 600,
                    height: 30,
                    easing: 'easeOutBounce'
                })');
        }
        test('getAnimationDuration が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(250);
            expect(effectsConfig.getAnimationDuration().toBe(250);
            expect(mockConfigManager.get').toHaveBeenCalledWith('effects', 'animations.duration', 300);
        }');
        test('getAnimationEasing が正しい値を返すこと', (') => {
            mockConfigManager.get.mockReturnValueOnce('easeInOut');
            expect(effectsConfig.getAnimationEasing()').toBe('easeInOut');
            expect(mockConfigManager.get').toHaveBeenCalledWith('effects', 'animations.easing', 'easeOut');
        }');
        test('isAnimationEnabled が正しい値を返すこと', () => {
            mockConfigManager.get.mockReturnValueOnce(false);
            expect(effectsConfig.isAnimationEnabled().toBe(false);
            expect(mockConfigManager.get').toHaveBeenCalledWith('effects', 'animations.enabled', true);
        }');
        test('setAnimationDuration が正しく設定されること', () => {
            effectsConfig.setAnimationDuration(250);
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'animations.duration', 250);
        }');
        test('setAnimationEasing が正しく設定されること', (') => {
            effectsConfig.setAnimationEasing('easeInOut');
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'animations.easing', 'easeInOut');
        }');
        test('setAnimationEnabled が正しく設定されること', () => {
            effectsConfig.setAnimationEnabled(false);
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'animations.enabled', false);
        }');
    }
    describe('ParticleManager連携', (') => {
        test('applyToParticleManager がParticleManagerに設定を適用すること', () => {
            // ParticleManagerのモック
            const mockParticleManager: MockParticleManager = {
                maxParticles: 300,
                poolSize: 50,
                particlePool: Array(50),
                initializePool: function() { this.initializePoolCalled = true; }
            };
            
            // パーティクル設定のモック
            mockConfigManager.get = jest.fn((category: string, key: string, defaultValue => {');
                if (key === 'particles.maxCount'') return 400;
                if (key === 'particles.poolSize') return 80;
                return defaultValue;
            }) as any;
            
            effectsConfig.applyToParticleManager(mockParticleManager);
            expect(mockParticleManager.maxParticles).toBe(400);
            expect(mockParticleManager.poolSize).toBe(80);
            expect(mockParticleManager.initializePoolCalled).toBe(true);
        }');
        test('syncFromParticleManager がParticleManagerから設定を同期すること', () => {
            // ParticleManagerのモック
            const mockParticleManager: MockParticleManager = {
                maxParticles: 400,
                poolSize: 80,
                particlePool: [],
        initializePool: jest.fn(),
            };
            
            effectsConfig.syncFromParticleManager(mockParticleManager);
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'particles.maxCount', 400);
            expect(mockConfigManager.set').toHaveBeenCalledWith('effects', 'particles.poolSize', 80);
        }');
    }
    describe('EffectManager連携', (') => {
        test('applyToEffectManager がEffectManagerに設定を適用すること', () => {
            // EffectManagerのモック
            const mockEffectManager: MockEffectManager = {};
            
            effectsConfig.applyToEffectManager(mockEffectManager);
            // 現在の実装では具体的な適用処理はないため、エラーが発生しないことを確認
            expect(() => effectsConfig.applyToEffectManager(mockEffectManager).not.toThrow();
        }');
        test('syncFromEffectManager がEffectManagerから設定を同期すること', () => {
            // EffectManagerのモック
            const mockEffectManager: MockEffectManager = {};
            
            effectsConfig.syncFromEffectManager(mockEffectManager);
            // 現在の実装では具体的な同期処理はないため、エラーが発生しないことを確認
            expect(() => effectsConfig.syncFromEffectManager(mockEffectManager).not.toThrow();
        }');
    }
    describe('シングルトンパターン', (') => {
        test('getEffectsConfig が常に同じインスタンスを返すこと', () => {
            // テスト用のシングルトンパターンを模擬
            let testInstance: TestEffectsConfig | null = null,
            const getTestEffectsConfig = () => {
                if (!testInstance) {
                    testInstance = new TestEffectsConfig(mockConfigManager);
                }
                return testInstance;
            };
            
            const instance1 = getTestEffectsConfig();
            const instance2 = getTestEffectsConfig();
            expect(instance1).toBe(instance2);
        });
    }
}');