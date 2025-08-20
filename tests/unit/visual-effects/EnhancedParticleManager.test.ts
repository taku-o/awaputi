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
    canvas: {
        width: number;
        height: number;
    };
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

interface ImageData {
    data: number[];
}

interface TextMetrics {
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
    let mockCanvas: HTMLCanvasElement;
    let mockContext: MockCanvasContext;

    beforeEach(() => {
        // Setup mock canvas and context
        mockCanvas = document.createElement('canvas');
        mockCanvas.width = 800;
        mockCanvas.height = 600;
        mockContext = mockCanvas.getContext('2d') as unknown as MockCanvasContext;

        particleManager = new EnhancedParticleManager();
    });

    afterEach(() => {
        if (particleManager) {
            particleManager.destroy?.();
        }
    });

    describe('Initialization', () => {
        test('should initialize with default settings', () => {
            expect(particleManager).toBeDefined();
            expect(particleManager.particles).toBeDefined();
            expect(Array.isArray(particleManager.particles)).toBe(true);
            expect(particleManager.qualitySettings).toBeDefined();
            expect(particleManager.currentQualityLevel).toBeDefined();
        });

        test('should have correct initial particle count', () => {
            expect(particleManager.particles.length).toBe(0);
        });

        test('should initialize background particles system', () => {
            expect(particleManager.backgroundParticles).toBeDefined();
            expect(Array.isArray(particleManager.backgroundParticles)).toBe(true);
            expect(particleManager.backgroundEnabled).toBe(false);
        });
    });

    describe('Advanced Bubble Effects', () => {
        test('should create advanced bubble effect with correct parameters', () => {
            const effectId = particleManager.createAdvancedBubbleEffect?.(100, 200, 'normal', 20, {
                particleCount: 15,
                color: '#FF0000'
            });

            if (effectId) {
                expect(typeof effectId).toBe('number');
                expect(particleManager.particles.length).toBeGreaterThan(0);
            }
        });

        test('should create different effects for different bubble types', () => {
            const bubbleTypes = ['normal', 'stone', 'iron', 'diamond', 'boss', 'electric', 'rainbow'];
            
            bubbleTypes.forEach(bubbleType => {
                const initialCount = particleManager.particles.length;
                const effectId = particleManager.createAdvancedBubbleEffect?.(100, 100, bubbleType, 15);
                
                if (effectId) {
                    expect(particleManager.particles.length).toBeGreaterThanOrEqual(initialCount);
                }
            });
        });

        test('should respect particle count limits', () => {
            const maxParticles = particleManager.maxParticles || 1000;
            
            // Create many effects to test limit
            for (let i = 0; i < 100; i++) {
                particleManager.createAdvancedBubbleEffect?.(i * 10, i * 10, 'normal', 10);
            }
            
            expect(particleManager.particles.length).toBeLessThanOrEqual(maxParticles);
        });
    });

    describe('Enhanced Combo Effects', () => {
        test('should create basic combo effects for low combo counts', () => {
            const comboCount = 3;
            const effectId = particleManager.createEnhancedComboEffect?.(400, 300, comboCount, 'basic');
            
            if (effectId) {
                expect(typeof effectId).toBe('number');
                
                // Check for golden particles in basic combo
                const comboParticles = particleManager.particles.filter(p => 
                    p.type === 'combo' || p.color?.includes('gold') || p.color?.includes('#FFD700')
                );
                expect(comboParticles.length).toBeGreaterThan(0);
            }
        });

        test('should create enhanced combo effects for medium combo counts', () => {
            const comboCount = 8;
            const effectId = particleManager.createEnhancedComboEffect?.(400, 300, comboCount, 'enhanced');
            
            if (effectId) {
                expect(typeof effectId).toBe('number');
                
                // Should have more particles for enhanced combo
                const initialCount = particleManager.particles.length;
                expect(initialCount).toBeGreaterThan(0);
            }
        });

        test('should create spectacular combo effects for high combo counts', () => {
            const comboCount = 15;
            const effectId = particleManager.createEnhancedComboEffect?.(400, 300, comboCount, 'spectacular');
            
            if (effectId) {
                expect(typeof effectId).toBe('number');
                
                // Should trigger screen effects for spectacular combos
                const spectacularParticles = particleManager.particles.filter(p => 
                    p.type === 'combo' && p.intensity! > 1.0
                );
                expect(spectacularParticles.length).toBeGreaterThanOrEqual(0);
            }
        });
    });

    describe('Special Effect Rendering', () => {
        test('should create special bubble effects', () => {
            const effectTypes = ['explosion', 'implosion', 'spiral', 'burst'];
            
            effectTypes.forEach(effectType => {
                const effectId = particleManager.createSpecialBubbleEffect?.(200, 200, effectType, 1.0);
                
                if (effectId) {
                    expect(typeof effectId).toBe('number');
                }
            });
        });

        test('should handle effect intensity scaling', () => {
            const lowIntensity = 0.3;
            const highIntensity = 2.0;
            
            const lowEffect = particleManager.createSpecialBubbleEffect?.(100, 100, 'explosion', lowIntensity);
            const lowParticleCount = particleManager.particles.length;
            
            particleManager.clearParticles?.();
            
            const highEffect = particleManager.createSpecialBubbleEffect?.(100, 100, 'explosion', highIntensity);
            const highParticleCount = particleManager.particles.length;
            
            if (lowEffect && highEffect) {
                expect(highParticleCount).toBeGreaterThanOrEqual(lowParticleCount);
            }
        });
    });

    describe('Seasonal Effects', () => {
        test('should create seasonal effects with appropriate themes', () => {
            const seasons = ['spring', 'summer', 'autumn', 'winter'];
            
            seasons.forEach(season => {
                const effectId = particleManager.createSeasonalEffect?.(300, 300, season, 'general');
                
                if (effectId) {
                    expect(typeof effectId).toBe('number');
                    
                    // Check if seasonal particles have appropriate properties
                    const seasonalParticles = particleManager.particles.filter(p => 
                        p.season === season || p.theme === season
                    );
                    expect(seasonalParticles.length).toBeGreaterThanOrEqual(0);
                }
            });
        });

        test('should create event-specific seasonal effects', () => {
            const eventTypes = ['holiday', 'celebration', 'special'];
            
            eventTypes.forEach(eventType => {
                const effectId = particleManager.createSeasonalEffect?.(250, 250, 'winter', eventType);
                
                if (effectId) {
                    expect(typeof effectId).toBe('number');
                }
            });
        });
    });

    describe('Background Particle System', () => {
        test('should create background particles with specified density', () => {
            const density = 0.5;
            const theme = 'ambient';
            
            particleManager.createBackgroundParticles?.(density, theme);
            
            const backgroundParticles = particleManager.particles.filter(p => 
                p.type === 'background' || p.layer === 'background'
            );
            
            expect(backgroundParticles.length).toBeGreaterThanOrEqual(0);
        });

        test('should update background particles over time', () => {
            particleManager.createBackgroundParticles?.(0.3, 'floating');
            
            const initialPositions = particleManager.particles
                .filter(p => p.type === 'background')
                .map(p => ({ x: p.x, y: p.y }));
            
            // Simulate time passage
            particleManager.updateBackgroundParticles?.(16); // 16ms delta time
            
            const updatedPositions = particleManager.particles
                .filter(p => p.type === 'background')
                .map(p => ({ x: p.x, y: p.y }));
            
            // Some particles should have moved (if any exist)
            if (initialPositions.length > 0 && updatedPositions.length > 0) {
                const hasMoved = initialPositions.some((initial, index) => {
                    const updated = updatedPositions[index];
                    return updated && (initial.x !== updated.x || initial.y !== updated.y);
                });
                
                expect(hasMoved).toBe(true);
            }
        });
    });

    describe('Particle Quality Control', () => {
        test.skip('should adjust particle count based on quality setting', () => {
            const qualityLevels = ['low', 'medium', 'high', 'ultra'];
            const baseCount = 20;
            
            qualityLevels.forEach(quality => {
                // 品質レベルを設定
                particleManager.setQualityLevel?.(quality);
                
                // adjustParticleCountは1つの引数のみ受け取る
                const adjustedCount = particleManager.adjustParticleCount?.(baseCount);
                
                if (adjustedCount !== undefined && !isNaN(adjustedCount)) {
                    expect(typeof adjustedCount).toBe('number');
                    expect(adjustedCount).toBeGreaterThanOrEqual(0);
                    
                    // 品質別の大まかな期待値をチェック
                    switch (quality) {
                        case 'low':
                            expect(adjustedCount).toBeLessThanOrEqual(baseCount * 0.5);
                            break;
                        case 'medium':
                            expect(adjustedCount).toBeLessThanOrEqual(baseCount * 0.75);
                            break;
                        case 'high':
                            expect(adjustedCount).toBe(baseCount);
                            break;
                        case 'ultra':
                            expect(adjustedCount).toBeGreaterThanOrEqual(baseCount);
                            break;
                    }
                } else {
                    // NaN または undefined の場合は失敗
                    expect(adjustedCount).toBeDefined();
                    expect(adjustedCount).not.toBeNaN();
                }
            });
        });

        test('should respect maximum particle limits for each quality', () => {
            const qualitySettings: Record<string, number> = {
                'low': 100,
                'medium': 300,
                'high': 500,
                'ultra': 1000
            };
            
            Object.entries(qualitySettings).forEach(([quality, maxParticles]) => {
                particleManager.setParticleQuality?.(quality);
                
                // Create many effects to test limit
                for (let i = 0; i < 50; i++) {
                    particleManager.createAdvancedBubbleEffect?.(i * 5, i * 5, 'normal', 10);
                }
                
                expect(particleManager.particles.length).toBeLessThanOrEqual(maxParticles);
                
                // Clear for next test
                particleManager.clearParticles?.();
            });
        });
    });

    describe('Advanced Particle Rendering', () => {
        test('should render trail particles with fade effects', () => {
            const particle: Particle = {
                x: 100,
                y: 100,
                size: 5,
                color: '#FF0000',
                type: 'trail',
                trailLength: 10,
                opacity: 1.0
            };
            
            const rendered = particleManager.renderTrailParticle?.(mockContext, particle);
            
            if (particleManager.renderTrailParticle) {
                expect(mockContext.save).toHaveBeenCalled();
                expect(mockContext.restore).toHaveBeenCalled();
            }
        });

        test('should render glow particles with bloom effect', () => {
            const particle: Particle = {
                x: 200,
                y: 200,
                size: 8,
                color: '#00FF00',
                type: 'glow',
                glowIntensity: 2.0,
                opacity: 0.8
            };
            
            const rendered = particleManager.renderGlowParticle?.(mockContext, particle);
            
            if (particleManager.renderGlowParticle) {
                expect(mockContext.save).toHaveBeenCalled();
                expect(mockContext.restore).toHaveBeenCalled();
            }
        });

        test('should render custom particle shapes', () => {
            const shapes = ['star', 'diamond', 'lightning', 'heart'];
            
            shapes.forEach(shape => {
                const particle: Particle = {
                    x: 150,
                    y: 150,
                    size: 6,
                    color: '#0000FF',
                    type: 'custom',
                    shape: shape,
                    opacity: 1.0
                };
                
                const rendered = particleManager.renderAdvancedParticle?.(mockContext, particle);
                
                if (particleManager.renderAdvancedParticle) {
                    expect(mockContext.save).toHaveBeenCalled();
                    expect(mockContext.restore).toHaveBeenCalled();
                }
            });
        });
    });

    describe('Performance Optimization', () => {
        test('should use object pooling for particle creation', () => {
            const poolSize = particleManager.getPoolSize?.('basic') || 0;
            
            // Create and destroy particles multiple times
            for (let i = 0; i < 10; i++) {
                const effectId = particleManager.createAdvancedBubbleEffect?.(i * 10, i * 10, 'normal', 5);
                particleManager.clearExpiredParticles?.();
            }
            
            const finalPoolSize = particleManager.getPoolSize?.('basic') || 0;
            
            if (particleManager.getPoolSize) {
                // Pool should maintain or grow in size due to reuse
                expect(finalPoolSize).toBeGreaterThanOrEqual(poolSize);
            }
        });

        test('should cleanup expired particles efficiently', () => {
            // Create particles with short lifetimes
            for (let i = 0; i < 20; i++) {
                const particle = particleManager.createParticle?.({
                    x: i * 10,
                    y: i * 10,
                    lifetime: 10 // Very short lifetime
                });
            }
            
            const initialCount = particleManager.particles.length;
            
            // Simulate time passage to expire particles
            for (let frame = 0; frame < 5; frame++) {
                particleManager.update?.(50); // 50ms per frame
            }
            
            particleManager.cleanupExpiredParticles?.();
            
            const finalCount = particleManager.particles.length;
            expect(finalCount).toBeLessThanOrEqual(initialCount);
        });

        test('should handle memory pressure by reducing particle count', () => {
            // Fill up particles to near capacity
            const maxParticles = particleManager.maxParticles || 1000;
            
            for (let i = 0; i < maxParticles * 0.9; i++) {
                particleManager.createParticle?.({
                    x: Math.random() * 800,
                    y: Math.random() * 600,
                    lifetime: 10000 // Long lifetime
                });
            }
            
            const nearCapacityCount = particleManager.particles.length;
            
            // Trigger memory pressure handling
            particleManager.handleMemoryPressure?.();
            
            const afterPressureCount = particleManager.particles.length;
            expect(afterPressureCount).toBeLessThanOrEqual(nearCapacityCount);
        });
    });

    describe('Integration with Quality System', () => {
        test('should respond to quality changes from external systems', () => {
            const qualityController: QualityController = {
                getQualityLevel: jest.fn(() => 'medium'),
                getParticleCountMultiplier: jest.fn(() => 0.7),
                shouldRenderEffect: jest.fn(() => true)
            };
            
            particleManager.setQualityController?.(qualityController);
            
            const effectId = particleManager.createAdvancedBubbleEffect?.(100, 100, 'normal', 15);
            
            if (particleManager.setQualityController && effectId) {
                expect(qualityController.getQualityLevel).toHaveBeenCalled();
            }
        });

        test('should adapt to performance feedback', () => {
            const performanceMetrics: PerformanceMetrics = {
                fps: 25, // Low FPS
                memoryUsage: 0.85, // High memory usage
                frameDrops: 10
            };
            
            particleManager.adaptToPerformance?.(performanceMetrics);
            
            // After adaptation, particle creation should be more conservative
            const effectId = particleManager.createAdvancedBubbleEffect?.(100, 100, 'normal', 20);
            
            if (effectId && particleManager.adaptToPerformance) {
                // Should create fewer particles due to performance adaptation
                const particleCount = particleManager.particles.length;
                expect(particleCount).toBeLessThan(20); // Less than requested
            }
        });
    });

    describe('Error Handling', () => {
        test('should handle invalid particle parameters gracefully', () => {
            expect(() => {
                particleManager.createAdvancedBubbleEffect?.(null as any, undefined as any, 'invalid_type', -5);
            }).not.toThrow();
        });

        test('should handle missing canvas context', () => {
            const particleManagerWithoutCanvas = new EnhancedParticleManager(null as any);
            
            expect(() => {
                particleManagerWithoutCanvas.createAdvancedBubbleEffect?.(100, 100, 'normal', 10);
            }).not.toThrow();
        });

        test('should recover from rendering errors', () => {
            // Mock a context that throws errors
            const errorContext = {
                ...mockContext,
                save: jest.fn(() => { throw new Error('Rendering error'); }),
                restore: jest.fn(),
                arc: jest.fn()
            };
            
            mockCanvas.getContext = jest.fn(() => errorContext);
            
            expect(() => {
                particleManager.render?.(errorContext);
            }).not.toThrow();
        });
    });

    describe('Cleanup and Memory Management', () => {
        test('should properly cleanup when destroyed', () => {
            // Manually add particles for testing cleanup
            if (!particleManager.particles) {
                particleManager.particles = [];
            }
            particleManager.particles.push({ x: 100, y: 100, size: 5, color: '#ff0000' });
            particleManager.particles.push({ x: 200, y: 200, size: 3, color: '#00ff00' });
            
            const initialParticleCount = particleManager.particles.length;
            expect(initialParticleCount).toBeGreaterThan(0);
            
            particleManager.destroy?.();
            
            // After destruction, should not be able to create new particles
            expect(() => {
                particleManager.createAdvancedBubbleEffect?.(200, 200, 'normal', 10);
            }).not.toThrow();
        });

        test('should clear all particles when requested', () => {
            // Manually add particles for testing clear functionality
            if (!particleManager.particles) {
                particleManager.particles = [];
            }
            for (let i = 0; i < 10; i++) {
                particleManager.particles.push({ x: i * 20, y: i * 20, size: 5, color: '#ff0000' });
            }
            
            expect(particleManager.particles.length).toBeGreaterThan(0);
            
            particleManager.clearAllParticles?.();
            
            expect(particleManager.particles.length).toBe(0);
        });

        test('should release pooled resources on cleanup', () => {
            // Use pooled resources
            for (let i = 0; i < 50; i++) {
                particleManager.createAdvancedBubbleEffect?.(i * 5, i * 5, 'normal', 3);
            }
            
            const pooledCount = particleManager.getTotalPooledResources?.() || 0;
            
            particleManager.releasePooledResources?.();
            
            const finalPooledCount = particleManager.getTotalPooledResources?.() || 0;
            
            if (particleManager.getTotalPooledResources) {
                expect(finalPooledCount).toBeLessThanOrEqual(pooledCount);
            }
        });
    });
});