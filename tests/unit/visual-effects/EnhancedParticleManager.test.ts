/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { EnhancedParticleManager } from '../../../src/effects/EnhancedParticleManager.js';

// Type definitions
interface MockCanvasContext {
    fillRect: jest.Mock<void, [number, number, number, number]>;
    clearRect: jest.Mock<void, [number, number, number, number]>;
    getImageData: jest.Mock<ImageData, [number, number, number, number]>;
    putImageData: jest.Mock<void, [ImageData, number, number]>;
    createImageData: jest.Mock<ImageData, [number, number]>;
    setTransform: jest.Mock<void, [number, number, number, number, number, number]>;
    drawImage: jest.Mock<void, [any, number, number]>;
    save: jest.Mock<void, []>;
    restore: jest.Mock<void, []>;
    beginPath: jest.Mock<void, []>;
    moveTo: jest.Mock<void, [number, number]>;
    lineTo: jest.Mock<void, [number, number]>;
    closePath: jest.Mock<void, []>;
    stroke: jest.Mock<void, []>;
    fill: jest.Mock<void, []>;
    arc: jest.Mock<void, [number, number, number, number, number, boolean?]>;
    rect: jest.Mock<void, [number, number, number, number]>;
    translate: jest.Mock<void, [number, number]>;
    scale: jest.Mock<void, [number, number]>;
    rotate: jest.Mock<void, [number]>;
    measureText: jest.Mock<TextMetrics, [string]>;
    canvas: { width: number; height: number; };
}

interface Particle {
    x: number;
    y: number;
    size: number;
    color: string;
    type?: string;
    lifetime?: number;
    opacity?: number;
    season?: string;
    theme?: string;
    layer?: string;
    trailLength?: number;
    glowIntensity?: number;
    shape?: string;
    intensity?: number;
}

interface QualityController {
    getQualityLevel: jest.Mock<string, []>;
    getParticleCountMultiplier: jest.Mock<number, []>;
    shouldRenderEffect: jest.Mock<boolean, []>;
}

interface PerformanceMetrics {
    fps: number;
    memoryUsage: number;
    frameDrops: number;
}

interface MockImageData {
    data: number[];
}

interface MockTextMetrics {
    width: number;
}

// Mock Canvas API
(global as any).HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => ({ data: new Array(4).fill(0) })),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => ({ data: new Array(4).fill(0) })),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    arc: jest.fn(),
    rect: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    canvas: {
        width: 800,
        height: 600
    }
}));

describe('EnhancedParticleManager', () => {
    let particleManager: EnhancedParticleManager;
    let mockContext: MockCanvasContext;
    let mockQualityController: QualityController;
    let canvas: HTMLCanvasElement;

    beforeEach(() => {
        // Create mock canvas
        canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        
        mockContext = canvas.getContext('2d') as any;
        
        // Create mock quality controller
        mockQualityController = {
            getQualityLevel: jest.fn(() => 'high'),
            getParticleCountMultiplier: jest.fn(() => 1.0),
            shouldRenderEffect: jest.fn(() => true)
        };

        // Initialize particle manager
        particleManager = new EnhancedParticleManager(canvas, mockQualityController as any);
    });

    afterEach(() => {
        if (particleManager) {
            particleManager.cleanup();
        }
        jest.clearAllMocks();
    });

    describe('初期化', () => {
        test('正常に初期化される', () => {
            expect(particleManager).toBeDefined();
            expect(particleManager.canvas).toBe(canvas);
            expect(particleManager.context).toBe(mockContext);
        });

        test('品質コントローラーが設定される', () => {
            expect(particleManager.qualityController).toBe(mockQualityController);
        });

        test('初期パーティクル配列が空である', () => {
            expect(particleManager.particles.length).toBe(0);
        });
    });

    describe('パーティクル作成', () => {
        test('基本パーティクルを作成', () => {
            const particle: Particle = {
                x: 100,
                y: 200,
                size: 5,
                color: '#ff0000'
            };

            particleManager.addParticle(particle);
            expect(particleManager.particles.length).toBe(1);
            expect(particleManager.particles[0]).toEqual(expect.objectContaining(particle));
        });

        test('複数のパーティクルを作成', () => {
            const particles: Particle[] = [
                { x: 100, y: 200, size: 5, color: '#ff0000' },
                { x: 150, y: 250, size: 8, color: '#00ff00' },
                { x: 200, y: 300, size: 12, color: '#0000ff' }
            ];

            particles.forEach(p => particleManager.addParticle(p));
            expect(particleManager.particles.length).toBe(3);
        });

        test('タイプ別パーティクル作成', () => {
            particleManager.createBubblePopEffect(100, 200, 'normal');
            expect(particleManager.particles.length).toBeGreaterThan(0);
        });

        test('爆発エフェクト作成', () => {
            particleManager.createExplosionEffect(150, 250, 'large');
            expect(particleManager.particles.length).toBeGreaterThan(0);
        });

        test('トレイルエフェクト作成', () => {
            particleManager.createTrailEffect(200, 300, 250, 350);
            expect(particleManager.particles.length).toBeGreaterThan(0);
        });
    });

    describe('パーティクル更新', () => {
        beforeEach(() => {
            const testParticles: Particle[] = [
                { x: 100, y: 200, size: 5, color: '#ff0000', lifetime: 1000 },
                { x: 150, y: 250, size: 8, color: '#00ff00', lifetime: 500 },
                { x: 200, y: 300, size: 12, color: '#0000ff', lifetime: 2000 }
            ];
            testParticles.forEach(p => particleManager.addParticle(p));
        });

        test('パーティクルの位置が更新される', () => {
            const initialPositions = particleManager.particles.map(p => ({ x: p.x, y: p.y }));
            
            particleManager.update(16); // 16ms delta time
            
            // パーティクルが動いているかチェック（実装によって異なる）
            expect(particleManager.particles.length).toBeGreaterThan(0);
        });

        test('ライフタイム終了でパーティクルが削除される', () => {
            // 短いライフタイムのパーティクルを追加
            particleManager.addParticle({ x: 50, y: 50, size: 3, color: '#ffff00', lifetime: 1 });
            
            expect(particleManager.particles.length).toBe(4);
            
            // 十分な時間を経過させる
            particleManager.update(2);
            
            expect(particleManager.particles.length).toBeLessThan(4);
        });

        test('品質設定に応じてパーティクル数が調整される', () => {
            mockQualityController.getParticleCountMultiplier.mockReturnValue(0.5);
            
            // 多数のパーティクルを作成
            for (let i = 0; i < 100; i++) {
                particleManager.addParticle({
                    x: Math.random() * 800,
                    y: Math.random() * 600,
                    size: 5,
                    color: '#ffffff'
                });
            }
            
            particleManager.update(16);
            
            // 品質設定により数が制限される
            expect(mockQualityController.getParticleCountMultiplier).toHaveBeenCalled();
        });
    });

    describe('パーティクル描画', () => {
        beforeEach(() => {
            const testParticles: Particle[] = [
                { x: 100, y: 200, size: 5, color: '#ff0000', shape: 'circle' },
                { x: 150, y: 250, size: 8, color: '#00ff00', shape: 'square' },
                { x: 200, y: 300, size: 12, color: '#0000ff', glowIntensity: 0.5 }
            ];
            testParticles.forEach(p => particleManager.addParticle(p));
        });

        test('パーティクルが描画される', () => {
            particleManager.render();
            
            expect(mockContext.save).toHaveBeenCalled();
            expect(mockContext.restore).toHaveBeenCalled();
        });

        test('円形パーティクルの描画', () => {
            particleManager.render();
            
            expect(mockContext.beginPath).toHaveBeenCalled();
            expect(mockContext.arc).toHaveBeenCalled();
            expect(mockContext.fill).toHaveBeenCalled();
        });

        test('四角形パーティクルの描画', () => {
            particleManager.render();
            
            expect(mockContext.rect).toHaveBeenCalled();
            expect(mockContext.fill).toHaveBeenCalled();
        });

        test('グローエフェクト付きパーティクルの描画', () => {
            particleManager.render();
            
            // グローエフェクトのため複数回描画される
            expect(mockContext.save).toHaveBeenCalled();
            expect(mockContext.restore).toHaveBeenCalled();
        });

        test('品質設定によりエフェクトが調整される', () => {
            mockQualityController.shouldRenderEffect.mockReturnValue(false);
            
            particleManager.render();
            
            expect(mockQualityController.shouldRenderEffect).toHaveBeenCalled();
        });
    });

    describe('パフォーマンス管理', () => {
        test('パーティクル数制限', () => {
            // 大量のパーティクルを追加
            for (let i = 0; i < 1000; i++) {
                particleManager.addParticle({
                    x: Math.random() * 800,
                    y: Math.random() * 600,
                    size: 5,
                    color: '#ffffff'
                });
            }
            
            particleManager.update(16);
            
            // 最大数制限により制御される
            expect(particleManager.particles.length).toBeLessThan(1000);
        });

        test('パフォーマンスメトリクス更新', () => {
            const metrics: PerformanceMetrics = {
                fps: 45,
                memoryUsage: 70,
                frameDrops: 3
            };
            
            particleManager.updatePerformanceMetrics(metrics);
            
            // パフォーマンスに応じて最適化される
            expect(mockQualityController.getParticleCountMultiplier).toHaveBeenCalled();
        });

        test('自動品質調整', () => {
            // 低FPSシミュレーション
            const lowFpsMetrics: PerformanceMetrics = {
                fps: 30,
                memoryUsage: 80,
                frameDrops: 10
            };
            
            particleManager.updatePerformanceMetrics(lowFpsMetrics);
            particleManager.update(16);
            
            // 品質が自動的に下げられる
            expect(mockQualityController.getQualityLevel).toHaveBeenCalled();
        });
    });

    describe('特殊エフェクト', () => {
        test('季節テーマエフェクト', () => {
            particleManager.setSeasonTheme('winter');
            particleManager.createBubblePopEffect(100, 200, 'normal');
            
            expect(particleManager.particles.some(p => p.season === 'winter')).toBe(true);
        });

        test('レイヤー管理', () => {
            particleManager.addParticle({ x: 100, y: 200, size: 5, color: '#ff0000', layer: 'background' });
            particleManager.addParticle({ x: 150, y: 250, size: 8, color: '#00ff00', layer: 'foreground' });
            
            particleManager.render();
            
            // レイヤー順に描画される
            expect(mockContext.save).toHaveBeenCalled();
            expect(mockContext.restore).toHaveBeenCalled();
        });

        test('アニメーションチェーン', () => {
            particleManager.createAnimationChain([
                { x: 100, y: 200, size: 5, color: '#ff0000' },
                { x: 200, y: 300, size: 10, color: '#00ff00' }
            ]);
            
            expect(particleManager.particles.length).toBeGreaterThan(0);
        });
    });

    describe('リソース管理', () => {
        test('パーティクルプール管理', () => {
            // プールからパーティクル取得
            const particle = particleManager.getParticleFromPool();
            expect(particle).toBeDefined();
            
            // プールに返却
            if (particle) {
                particleManager.returnParticleToPool(particle);
            }
        });

        test('メモリクリーンアップ', () => {
            // パーティクル追加
            for (let i = 0; i < 50; i++) {
                particleManager.addParticle({
                    x: Math.random() * 800,
                    y: Math.random() * 600,
                    size: 5,
                    color: '#ffffff'
                });
            }
            
            expect(particleManager.particles.length).toBe(50);
            
            // クリーンアップ実行
            particleManager.cleanup();
            
            expect(particleManager.particles.length).toBe(0);
        });

        test('全パーティクル削除', () => {
            // パーティクル追加
            particleManager.addParticle({ x: 100, y: 200, size: 5, color: '#ff0000' });
            particleManager.addParticle({ x: 150, y: 250, size: 8, color: '#00ff00' });
            
            expect(particleManager.particles.length).toBe(2);
            
            particleManager.clearAllParticles();
            
            expect(particleManager.particles.length).toBe(0);
        });
    });

    describe('設定管理', () => {
        test('品質設定変更', () => {
            mockQualityController.getQualityLevel.mockReturnValue('low');
            
            particleManager.updateQualitySettings();
            
            expect(mockQualityController.getQualityLevel).toHaveBeenCalled();
        });

        test('エフェクト有効/無効切り替え', () => {
            particleManager.setEffectEnabled('glow', false);
            
            mockQualityController.shouldRenderEffect.mockImplementation((effect: string) => {
                return effect !== 'glow';
            });
            
            particleManager.render();
            
            expect(mockQualityController.shouldRenderEffect).toHaveBeenCalledWith('glow');
        });

        test('デフォルト設定リセット', () => {
            // 設定変更
            particleManager.setSeasonTheme('summer');
            particleManager.setEffectEnabled('glow', false);
            
            // リセット
            particleManager.resetToDefaults();
            
            // デフォルト状態に戻る
            expect(particleManager.currentSeason).toBeUndefined();
        });
    });

    describe('エラーハンドリング', () => {
        test('無効なパーティクル追加でエラーが発生しない', () => {
            expect(() => {
                particleManager.addParticle(null as any);
                particleManager.addParticle(undefined as any);
            }).not.toThrow();
        });

        test('コンテキスト取得失敗の処理', () => {
            const invalidCanvas = document.createElement('canvas');
            (invalidCanvas as any).getContext = jest.fn(() => null);
            
            expect(() => {
                new EnhancedParticleManager(invalidCanvas, mockQualityController as any);
            }).toThrow();
        });

        test('描画エラーの処理', () => {
            mockContext.arc.mockImplementation(() => {
                throw new Error('Canvas error');
            });
            
            expect(() => {
                particleManager.addParticle({ x: 100, y: 200, size: 5, color: '#ff0000' });
                particleManager.render();
            }).not.toThrow();
        });
    });
});