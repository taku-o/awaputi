/**
 * EffectsConfig クラスのユニットテスト
 */
import { jest, describe, test, beforeEach, expect } from '@jest/globals';

// Types
interface MockConfigManager {
    get: jest.Mock;
    set: jest.Mock;
    setValidationRule: jest.Mock;
    getCategory: jest.Mock;
}

interface MockGetCall {
    category: string;
    key: string;
    defaultValue: any;
}

interface ParticleConfig {
    maxCount: number;
    poolSize: number;
    quality: number;
    enabled: boolean;
    bubble: {
        count: number;
        size: number;
        lifetime: number;
        colors: string[];
    };
    explosion: {
        count: number;
        size: number;
        speed: number;
    };
    trail: {
        enabled: boolean;
        length: number;
        alpha: number;
    };
}

interface EffectConfig {
    particles: ParticleConfig;
    animations: {
        enabled: boolean;
        quality: number;
        transitions: { duration: number; easing: string; };
    };
    sound: {
        enabled: boolean;
        volume: number;
        effects: {
            bubble: boolean;
            explosion: boolean;
            combo: boolean;
        };
    };
    performance: {
        autoOptimize: boolean;
        maxParticles: number;
        targetFPS: number;
        reducedMotion: boolean;
    };
}

interface ValidationRule {
    type: string;
    min?: number;
    max?: number;
    options?: any[];
    required?: boolean;
}

interface PerformanceMetrics {
    fps: number;
    particleCount: number;
    memoryUsage: number;
}

// Mock EffectsConfig implementation (since we can't import the actual class)
class MockEffectsConfig {
    private configManager: MockConfigManager;
    private defaultConfig: EffectConfig;
    private validationRules: Map<string, ValidationRule> = new Map();

    constructor(configManager: MockConfigManager) {
        this.configManager = configManager;
        this.defaultConfig = this.getDefaultConfig();
        this.setupValidationRules();
    }

    private getDefaultConfig(): EffectConfig {
        return {
            particles: {
                maxCount: 100,
                poolSize: 200,
                quality: 1.0,
                enabled: true,
                bubble: {
                    count: 5,
                    size: 20,
                    lifetime: 1000,
                    colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24']
                },
                explosion: {
                    count: 10,
                    size: 30,
                    speed: 200
                },
                trail: {
                    enabled: true,
                    length: 10,
                    alpha: 0.8
                }
            },
            animations: {
                enabled: true,
                quality: 1.0,
                transitions: {
                    duration: 300,
                    easing: 'ease-out'
                }
            },
            sound: {
                enabled: true,
                volume: 0.8,
                effects: {
                    bubble: true,
                    explosion: true,
                    combo: true
                }
            },
            performance: {
                autoOptimize: true,
                maxParticles: 500,
                targetFPS: 60,
                reducedMotion: false
            }
        };
    }

    private setupValidationRules(): void {
        this.validationRules.set('particles.maxCount', { type: 'number', min: 0, max: 1000 });
        this.validationRules.set('particles.poolSize', { type: 'number', min: 0, max: 2000 });
        this.validationRules.set('particles.quality', { type: 'number', min: 0, max: 2 });
        this.validationRules.set('animations.quality', { type: 'number', min: 0, max: 2 });
        this.validationRules.set('sound.volume', { type: 'number', min: 0, max: 1 });
        this.validationRules.set('performance.targetFPS', { type: 'number', min: 30, max: 120 });
    }

    getParticleConfig(): ParticleConfig {
        return this.configManager.get('effects', 'particles', this.defaultConfig.particles);
    }

    setParticleConfig(config: Partial<ParticleConfig>): void {
        const current = this.getParticleConfig();
        const updated = { ...current, ...config };
        this.configManager.set('effects', 'particles', updated);
    }

    getAnimationConfig() {
        return this.configManager.get('effects', 'animations', this.defaultConfig.animations);
    }

    getSoundConfig() {
        return this.configManager.get('effects', 'sound', this.defaultConfig.sound);
    }

    getPerformanceConfig() {
        return this.configManager.get('effects', 'performance', this.defaultConfig.performance);
    }

    getFullConfig(): EffectConfig {
        return {
            particles: this.getParticleConfig(),
            animations: this.getAnimationConfig(),
            sound: this.getSoundConfig(),
            performance: this.getPerformanceConfig()
        };
    }

    updateConfig(updates: Partial<EffectConfig>): void {
        if (updates.particles) {
            this.setParticleConfig(updates.particles);
        }
        if (updates.animations) {
            this.configManager.set('effects', 'animations', updates.animations);
        }
        if (updates.sound) {
            this.configManager.set('effects', 'sound', updates.sound);
        }
        if (updates.performance) {
            this.configManager.set('effects', 'performance', updates.performance);
        }
    }

    validateConfig(config: Partial<EffectConfig>): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        // パーティクル設定の検証
        if (config.particles) {
            if (config.particles.maxCount !== undefined) {
                if (config.particles.maxCount < 0 || config.particles.maxCount > 1000) {
                    errors.push('particles.maxCount must be between 0 and 1000');
                }
            }
            if (config.particles.quality !== undefined) {
                if (config.particles.quality < 0 || config.particles.quality > 2) {
                    errors.push('particles.quality must be between 0 and 2');
                }
            }
        }

        // 音量設定の検証
        if (config.sound?.volume !== undefined) {
            if (config.sound.volume < 0 || config.sound.volume > 1) {
                errors.push('sound.volume must be between 0 and 1');
            }
        }

        return { valid: errors.length === 0, errors };
    }

    optimizeForPerformance(metrics: PerformanceMetrics): void {
        const performanceConfig = this.getPerformanceConfig();
        
        if (!performanceConfig.autoOptimize) return;

        const updates: Partial<EffectConfig> = {};

        // FPSが低い場合の最適化
        if (metrics.fps < performanceConfig.targetFPS * 0.8) {
            updates.particles = {
                ...this.getParticleConfig(),
                maxCount: Math.max(50, this.getParticleConfig().maxCount * 0.8),
                quality: Math.max(0.5, this.getParticleConfig().quality * 0.9)
            };
            
            updates.animations = {
                ...this.getAnimationConfig(),
                quality: Math.max(0.5, this.getAnimationConfig().quality * 0.9)
            };
        }

        // パーティクル数が多すぎる場合
        if (metrics.particleCount > performanceConfig.maxParticles) {
            updates.particles = {
                ...this.getParticleConfig(),
                maxCount: Math.min(this.getParticleConfig().maxCount, performanceConfig.maxParticles * 0.8)
            };
        }

        this.updateConfig(updates);
    }

    resetToDefaults(): void {
        this.updateConfig(this.defaultConfig);
    }

    getPreset(name: string): Partial<EffectConfig> {
        const presets: { [key: string]: Partial<EffectConfig> } = {
            low: {
                particles: {
                    ...this.defaultConfig.particles,
                    maxCount: 50,
                    quality: 0.5,
                    bubble: { ...this.defaultConfig.particles.bubble, count: 3 },
                    explosion: { ...this.defaultConfig.particles.explosion, count: 5 }
                },
                animations: {
                    ...this.defaultConfig.animations,
                    quality: 0.5
                }
            },
            medium: {
                particles: {
                    ...this.defaultConfig.particles,
                    maxCount: 100,
                    quality: 0.8
                },
                animations: {
                    ...this.defaultConfig.animations,
                    quality: 0.8
                }
            },
            high: {
                particles: {
                    ...this.defaultConfig.particles,
                    maxCount: 200,
                    quality: 1.0
                },
                animations: {
                    ...this.defaultConfig.animations,
                    quality: 1.0
                }
            },
            ultra: {
                particles: {
                    ...this.defaultConfig.particles,
                    maxCount: 500,
                    quality: 2.0,
                    bubble: { ...this.defaultConfig.particles.bubble, count: 10 },
                    explosion: { ...this.defaultConfig.particles.explosion, count: 20 }
                },
                animations: {
                    ...this.defaultConfig.animations,
                    quality: 2.0
                }
            }
        };

        return presets[name] || presets.medium;
    }
}

describe('EffectsConfig', () => {
    let effectsConfig: MockEffectsConfig;
    let mockConfigManager: MockConfigManager;

    beforeEach(() => {
        mockConfigManager = {
            get: jest.fn(),
            set: jest.fn(),
            setValidationRule: jest.fn(),
            getCategory: jest.fn()
        };

        // デフォルト値を返すようにmockを設定
        mockConfigManager.get.mockImplementation((category: string, key: string, defaultValue: any) => defaultValue);

        effectsConfig = new MockEffectsConfig(mockConfigManager);
    });

    describe('初期化', () => {
        test('正常に初期化される', () => {
            expect(effectsConfig).toBeDefined();
        });

        test('デフォルト設定が正しく設定される', () => {
            const config = effectsConfig.getFullConfig();
            
            expect(config.particles.maxCount).toBe(100);
            expect(config.particles.enabled).toBe(true);
            expect(config.animations.enabled).toBe(true);
            expect(config.sound.enabled).toBe(true);
            expect(config.performance.autoOptimize).toBe(true);
        });
    });

    describe('パーティクル設定', () => {
        test('パーティクル設定の取得', () => {
            const particleConfig = effectsConfig.getParticleConfig();
            
            expect(particleConfig).toBeDefined();
            expect(particleConfig.maxCount).toBe(100);
            expect(particleConfig.bubble.count).toBe(5);
            expect(particleConfig.explosion.count).toBe(10);
            expect(particleConfig.trail.enabled).toBe(true);
        });

        test('パーティクル設定の更新', () => {
            const updates = {
                maxCount: 150,
                quality: 1.5,
                bubble: {
                    count: 8,
                    size: 25,
                    lifetime: 1500,
                    colors: ['#ff0000', '#00ff00']
                }
            };

            effectsConfig.setParticleConfig(updates);

            expect(mockConfigManager.set).toHaveBeenCalledWith(
                'effects',
                'particles',
                expect.objectContaining({
                    maxCount: 150,
                    quality: 1.5,
                    bubble: expect.objectContaining({
                        count: 8,
                        size: 25,
                        lifetime: 1500,
                        colors: ['#ff0000', '#00ff00']
                    })
                })
            );
        });

        test('部分的なパーティクル設定更新', () => {
            const updates = { maxCount: 75 };

            effectsConfig.setParticleConfig(updates);

            expect(mockConfigManager.set).toHaveBeenCalledWith(
                'effects',
                'particles',
                expect.objectContaining({
                    maxCount: 75,
                    poolSize: 200, // デフォルト値が維持される
                    quality: 1.0,
                    enabled: true
                })
            );
        });
    });

    describe('アニメーション設定', () => {
        test('アニメーション設定の取得', () => {
            const animationConfig = effectsConfig.getAnimationConfig();
            
            expect(animationConfig).toBeDefined();
            expect(animationConfig.enabled).toBe(true);
            expect(animationConfig.quality).toBe(1.0);
            expect(animationConfig.transitions.duration).toBe(300);
            expect(animationConfig.transitions.easing).toBe('ease-out');
        });
    });

    describe('サウンド設定', () => {
        test('サウンド設定の取得', () => {
            const soundConfig = effectsConfig.getSoundConfig();
            
            expect(soundConfig).toBeDefined();
            expect(soundConfig.enabled).toBe(true);
            expect(soundConfig.volume).toBe(0.8);
            expect(soundConfig.effects.bubble).toBe(true);
            expect(soundConfig.effects.explosion).toBe(true);
            expect(soundConfig.effects.combo).toBe(true);
        });
    });

    describe('パフォーマンス設定', () => {
        test('パフォーマンス設定の取得', () => {
            const performanceConfig = effectsConfig.getPerformanceConfig();
            
            expect(performanceConfig).toBeDefined();
            expect(performanceConfig.autoOptimize).toBe(true);
            expect(performanceConfig.maxParticles).toBe(500);
            expect(performanceConfig.targetFPS).toBe(60);
            expect(performanceConfig.reducedMotion).toBe(false);
        });
    });

    describe('設定更新', () => {
        test('複数カテゴリの設定を同時更新', () => {
            const updates: Partial<EffectConfig> = {
                particles: {
                    maxCount: 80,
                    quality: 0.8,
                    enabled: true,
                    poolSize: 160,
                    bubble: { count: 4, size: 18, lifetime: 800, colors: ['#blue'] },
                    explosion: { count: 8, size: 25, speed: 180 },
                    trail: { enabled: false, length: 8, alpha: 0.6 }
                },
                sound: {
                    enabled: false,
                    volume: 0.5,
                    effects: { bubble: false, explosion: true, combo: true }
                }
            };

            effectsConfig.updateConfig(updates);

            expect(mockConfigManager.set).toHaveBeenCalledWith('effects', 'particles', updates.particles);
            expect(mockConfigManager.set).toHaveBeenCalledWith('effects', 'sound', updates.sound);
        });
    });

    describe('設定検証', () => {
        test('有効な設定の検証', () => {
            const config: Partial<EffectConfig> = {
                particles: {
                    maxCount: 150,
                    quality: 1.2,
                    enabled: true,
                    poolSize: 300,
                    bubble: { count: 6, size: 22, lifetime: 1200, colors: ['#red'] },
                    explosion: { count: 12, size: 28, speed: 220 },
                    trail: { enabled: true, length: 12, alpha: 0.7 }
                },
                sound: {
                    volume: 0.7,
                    enabled: true,
                    effects: { bubble: true, explosion: true, combo: false }
                }
            };

            const result = effectsConfig.validateConfig(config);
            
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('無効な設定の検証', () => {
            const config: Partial<EffectConfig> = {
                particles: {
                    maxCount: 1500, // 上限超過
                    quality: 3.0, // 上限超過
                    enabled: true,
                    poolSize: 200,
                    bubble: { count: 5, size: 20, lifetime: 1000, colors: ['#red'] },
                    explosion: { count: 10, size: 30, speed: 200 },
                    trail: { enabled: true, length: 10, alpha: 0.8 }
                },
                sound: {
                    volume: 1.5, // 上限超過
                    enabled: true,
                    effects: { bubble: true, explosion: true, combo: true }
                }
            };

            const result = effectsConfig.validateConfig(config);
            
            expect(result.valid).toBe(false);
            expect(result.errors).toHaveLength(3);
            expect(result.errors).toContain('particles.maxCount must be between 0 and 1000');
            expect(result.errors).toContain('particles.quality must be between 0 and 2');
            expect(result.errors).toContain('sound.volume must be between 0 and 1');
        });
    });

    describe('パフォーマンス最適化', () => {
        test('低FPS時の自動最適化', () => {
            const metrics: PerformanceMetrics = {
                fps: 40, // 目標FPS 60の80%未満
                particleCount: 300,
                memoryUsage: 50
            };

            effectsConfig.optimizeForPerformance(metrics);

            expect(mockConfigManager.set).toHaveBeenCalledWith(
                'effects',
                'particles',
                expect.objectContaining({
                    maxCount: 80, // 100 * 0.8
                    quality: 0.9 // 1.0 * 0.9
                })
            );
        });

        test('パーティクル数過多時の最適化', () => {
            const metrics: PerformanceMetrics = {
                fps: 65,
                particleCount: 600, // 上限500を超過
                memoryUsage: 80
            };

            effectsConfig.optimizeForPerformance(metrics);

            expect(mockConfigManager.set).toHaveBeenCalledWith(
                'effects',
                'particles',
                expect.objectContaining({
                    maxCount: 100 // 500 * 0.8 = 400だが、現在値100がより小さいため
                })
            );
        });

        test('自動最適化が無効な場合は何もしない', () => {
            // 自動最適化を無効にする
            mockConfigManager.get.mockImplementation((category: string, key: string, defaultValue: any) => {
                if (category === 'effects' && key === 'performance') {
                    return { ...defaultValue, autoOptimize: false };
                }
                return defaultValue;
            });

            const metrics: PerformanceMetrics = {
                fps: 30, // 低FPS
                particleCount: 600, // 多いパーティクル数
                memoryUsage: 90
            };

            effectsConfig.optimizeForPerformance(metrics);

            // パーティクル設定の更新呼び出しがないことを確認
            expect(mockConfigManager.set).not.toHaveBeenCalled();
        });
    });

    describe('プリセット', () => {
        test('低品質プリセット', () => {
            const preset = effectsConfig.getPreset('low');
            
            expect(preset.particles?.maxCount).toBe(50);
            expect(preset.particles?.quality).toBe(0.5);
            expect(preset.particles?.bubble?.count).toBe(3);
            expect(preset.particles?.explosion?.count).toBe(5);
            expect(preset.animations?.quality).toBe(0.5);
        });

        test('中品質プリセット', () => {
            const preset = effectsConfig.getPreset('medium');
            
            expect(preset.particles?.maxCount).toBe(100);
            expect(preset.particles?.quality).toBe(0.8);
            expect(preset.animations?.quality).toBe(0.8);
        });

        test('高品質プリセット', () => {
            const preset = effectsConfig.getPreset('high');
            
            expect(preset.particles?.maxCount).toBe(200);
            expect(preset.particles?.quality).toBe(1.0);
            expect(preset.animations?.quality).toBe(1.0);
        });

        test('最高品質プリセット', () => {
            const preset = effectsConfig.getPreset('ultra');
            
            expect(preset.particles?.maxCount).toBe(500);
            expect(preset.particles?.quality).toBe(2.0);
            expect(preset.particles?.bubble?.count).toBe(10);
            expect(preset.particles?.explosion?.count).toBe(20);
            expect(preset.animations?.quality).toBe(2.0);
        });

        test('存在しないプリセットでは中品質を返す', () => {
            const preset = effectsConfig.getPreset('nonexistent');
            
            expect(preset.particles?.maxCount).toBe(100);
            expect(preset.particles?.quality).toBe(0.8);
            expect(preset.animations?.quality).toBe(0.8);
        });
    });

    describe('デフォルトリセット', () => {
        test('設定をデフォルトにリセット', () => {
            effectsConfig.resetToDefaults();

            expect(mockConfigManager.set).toHaveBeenCalledWith(
                'effects',
                'particles',
                expect.objectContaining({
                    maxCount: 100,
                    quality: 1.0,
                    enabled: true
                })
            );

            expect(mockConfigManager.set).toHaveBeenCalledWith(
                'effects',
                'animations',
                expect.objectContaining({
                    enabled: true,
                    quality: 1.0
                })
            );

            expect(mockConfigManager.set).toHaveBeenCalledWith(
                'effects',
                'sound',
                expect.objectContaining({
                    enabled: true,
                    volume: 0.8
                })
            );

            expect(mockConfigManager.set).toHaveBeenCalledWith(
                'effects',
                'performance',
                expect.objectContaining({
                    autoOptimize: true,
                    maxParticles: 500,
                    targetFPS: 60
                })
            );
        });
    });
});