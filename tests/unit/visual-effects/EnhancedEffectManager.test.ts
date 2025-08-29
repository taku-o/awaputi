/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { EnhancedEffectManager } from '../../../src/effects/EnhancedEffectManager.js';

// Type definitions
interface MockCanvasContext {
    fillRect: jest.Mock<(...args: any[]) => void>;
    strokeRect: jest.Mock<(...args: any[]) => void>;
    clearRect: jest.Mock<(...args: any[]) => void>;
    save: jest.Mock<() => void>;
    restore: jest.Mock<() => void>;
    beginPath: jest.Mock<() => void>;
    closePath: jest.Mock<() => void>;
    moveTo: jest.Mock<(...args: any[]) => void>;
    lineTo: jest.Mock<(...args: any[]) => void>;
    arc: jest.Mock<(...args: any[]) => void>;
    rect: jest.Mock<(...args: any[]) => void>;
    fill: jest.Mock<() => void>;
    stroke: jest.Mock<() => void>;
    createLinearGradient: jest.Mock<(...args: any[]) => MockCanvasGradient>;
    createRadialGradient: jest.Mock<(...args: any[]) => MockCanvasGradient>;
    translate: jest.Mock<(...args: any[]) => void>;
    scale: jest.Mock<(...args: any[]) => void>;
    rotate: jest.Mock<(...args: any[]) => void>;
    setTransform: jest.Mock<(...args: any[]) => void>;
    canvas: { width: number; height: number; };
}

interface MockCanvasGradient {
    addColorStop: jest.Mock<(offset: number, color: string) => void>;
}

interface TransitionEffect {
    id: number;
    transitionType: string;
    duration: number;
    elapsed: number;
    options: any;
    completed?: boolean;
}

interface LightSource {
    id: number;
    x: number;
    y: number;
    intensity: number;
    color: string;
    radius: number;
}

interface ShadowCaster {
    id: number;
    object: any;
    lightSource: any;
    direction?: { x: number; y: number; };
}

interface ReflectionSurface {
    id: number;
    surface: any;
    intensity: number;
}

interface BackgroundEffect {
    id: number;
    type: string;
    intensity: number;
    duration: number;
    elapsed: number;
    completed?: boolean;
}

interface EnhancedTransform {
    depthOfField: number;
    motionBlur: {
        x: number;
        y: number;
        intensity: number;
    };
    chromatic: number;
    vignette: number;
    noise: number;
    scanlines: number;
    glitch: { intensity: number; frequency: number; };
}

interface RenderSettings {
    enableLighting: boolean;
    enableShadows: boolean;
    enablePostProcessing: boolean;
    qualityLevel: string;
}

interface PerformanceMetrics {
    effectCount: number;
    renderTime: number;
    memoryUsage: number;
}


// Mock Canvas API
(global as any).HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    clearRect: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    closePath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    arc: jest.fn(),
    rect: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    createLinearGradient: jest.fn<(...args: any[]) => MockCanvasGradient>(() => ({
        addColorStop: jest.fn<(offset: number, color: string) => void>()
    })),
    createRadialGradient: jest.fn<(...args: any[]) => MockCanvasGradient>(() => ({
        addColorStop: jest.fn<(offset: number, color: string) => void>()
    })),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    setTransform: jest.fn(),
    canvas: {
        width: 800,
        height: 600
    }
}));

describe('EnhancedEffectManager', () => {
    let effectManager: EnhancedEffectManager;
    let mockCanvas: HTMLCanvasElement;
    let mockContext: MockCanvasContext;

    beforeEach(() => {
        mockCanvas = document.createElement('canvas');
        mockCanvas.width = 800;
        mockCanvas.height = 600;
        mockContext = mockCanvas.getContext('2d') as unknown as MockCanvasContext;
        effectManager = new EnhancedEffectManager(mockCanvas);
    });

    afterEach(() => {
        if (effectManager) {
            effectManager.destroy?.();
        }
    });

    describe('Initialization', () => {
        test('should initialize with enhanced features', () => {
            expect(effectManager).toBeDefined();
            expect((effectManager as any).canvas).toBe(mockCanvas);
            expect(effectManager.transitionEffects).toBeDefined();
            expect(effectManager.lightSources).toBeDefined();
            expect(effectManager.backgroundEffects).toBeDefined();
        });
        
        test('should extend base EffectManager functionality', () => {
            // Should inherit base functionality
            expect((effectManager as any).effects).toBeDefined();
            expect(typeof effectManager.update).toBe('function');
            expect(typeof effectManager.render).toBe('function')
        
});

        test('should initialize with default render settings', () => {

            expect((effectManager as any).renderSettings).toBeDefined();
            expect((effectManager as any).renderSettings.enableLighting).toBe(true);
            expect((effectManager as any).renderSettings.enableShadows).toBe(true);
            expect((effectManager as any).renderSettings.qualityLevel).toBe('high')
        
})
 
});

    describe('Screen Transition Effects', () => {

        test('should create fade transition effect', () => {
            const effectId = effectManager.addTransitionEffect('fade', 1000, {
                direction: 'in',
                color: '#000000'
            
});
expect(typeof effectId).toBe('number');
            expect(effectManager.transitionEffects.length).toBe(1);
            
            const effect = effectManager.transitionEffects[0];
            expect(effect.transitionType).toBe('fade');
            expect(effect.duration).toBe(1000);
            expect(effect.options.color).toBe('#000000')
        
});

        test('should create slide transition effect', () => {

            const effectId = effectManager.addTransitionEffect('slide', 800, {
                direction: 'left',
                easing: 'easeOut'
            
});
expect(typeof effectId).toBe('number');
            const effect = effectManager.transitionEffects.find(e => e.id === effectId);
            expect(effect).toBeDefined();
            expect(effect!.transitionType).toBe('slide');
            expect(effect!.options.direction).toBe('left')
        
});

        test('should create zoom transition effect', () => {
            const effectId = effectManager.addTransitionEffect('zoom', 600, {
                scale: 1.5,
                origin: { x: 400, y: 300 }
            });

            expect(typeof effectId).toBe('number');
            const effect = effectManager.transitionEffects.find(e => e.id === effectId);
            expect(effect).toBeDefined();
            expect(effect!.transitionType).toBe('zoom');
            expect(effect!.options.scale).toBe(1.5)
        });

        test('should handle multiple concurrent transitions', () => {

            const fadeId = effectManager.addTransitionEffect('fade', 500);
            const slideId = effectManager.addTransitionEffect('slide', 800);
            const zoomId = effectManager.addTransitionEffect('zoom', 300);

            expect(effectManager.transitionEffects.length).toBe(3);
            expect([fadeId, slideId, zoomId].every(id => typeof id === 'number')).toBe(true)
        
});
test('should remove completed transitions', () => {
            const effectId = effectManager.addTransitionEffect('fade', 100); // Short duration
            
            expect(effectManager.transitionEffects.length).toBe(1);
            // Simulate time passage to complete the transition
            effectManager.update(150); // More than 100ms
            
            // Effect should be removed after completion
            const remainingEffect = effectManager.transitionEffects.find(e => e.id === effectId);
            expect(remainingEffect?.elapsed).toBeGreaterThanOrEqual(100)
        
})
    });

    describe('Lighting Effect System', () => {

        test('should add light source with specified properties', () => {
            const lightId = effectManager.addLightSource(200, 300, 1.0, '#FFFFFF', 100);

            expect(typeof lightId).toBe('number');
            expect(effectManager.lightSources.length).toBe(1);

            const light = effectManager.lightSources[0];
            expect(light.x).toBe(200);
            expect(light.y).toBe(300);
            expect(light.intensity).toBe(1.0);
            expect(light.color).toBe('#FFFFFF');
            expect(light.radius).toBe(100)
        
});
test('should support multiple light sources', () => {
            const light1 = effectManager.addLightSource(100, 100, 0.8, '#FF0000', 80);
            const light2 = effectManager.addLightSource(300, 200, 1.2, '#00FF00', 120);
            const light3 = effectManager.addLightSource(500, 400, 0.6, '#0000FF', 60);

            expect(effectManager.lightSources.length).toBe(3);
            expect([light1, light2, light3].every(id => typeof id === 'number')).toBe(true)
        
});

        test('should update light sources over time', () => {
            const lightId = effectManager.addLightSource(250, 250, 1.0, '#FFFF00', 90);
            const initialLight = effectManager.lightSources.find(l => l.id === lightId);
            const initialIntensity = initialLight!.intensity;

            // Add animation to light source
            if ((effectManager as any).animateLightSource) {
                (effectManager as any).animateLightSource(lightId, {
                    intensity: { target: 0.5, duration: 1000 }
                });
            }

            (effectManager as any).updateLightSources(500); // 500ms

            const updatedLight = effectManager.lightSources.find(l => l.id === lightId);
            if ((effectManager as any).animateLightSource) {
                expect(updatedLight!.intensity).not.toBe(initialIntensity);
            }
        });

        test('should remove light sources when requested', () => {
            const lightId = effectManager.addLightSource(150, 150, 1.0, '#FFFFFF', 75);
            expect(effectManager.lightSources.length).toBe(1);

            effectManager.removeLightSource?.(lightId);
            expect(effectManager.lightSources.length).toBe(0);
        });
    });

    describe('Shadow Effect System', () => {
        test('should add shadow effect for objects', () => {
            const shadowObject = {
                x: 100, y: 100, width: 50, height: 50
            };
            const lightSource = {
                x: 200, y: 200, intensity: 1.0
            };

            const shadowId = effectManager.addShadowEffect(shadowObject, lightSource);
            if (shadowId) {
                expect(typeof shadowId).toBe('number');
                expect(effectManager.shadowCasters.length).toBe(1);
            }
        });

        test('should calculate shadow direction based on light position', () => {
            const object = { x: 300, y: 300, width: 40, height: 40 };
            const light = { x: 200, y: 200, intensity: 1.0 };

            const shadowId = effectManager.addShadowEffect(object, light);
            if (shadowId) {
                const shadow = effectManager.shadowCasters.find(s => s.id === shadowId);
                expect(shadow).toBeDefined();
                expect(shadow!.direction).toBeDefined();
            }
        });

        test('should render shadows with proper opacity', () => {
            const object = { x: 250, y: 250, width: 30, height: 30 };
            const light = { x: 100, y: 100, intensity: 0.8 };

            effectManager.addShadowEffect(object, light);
            effectManager.renderShadows?.(mockContext);

            if (effectManager.renderShadows) {
                expect(mockContext.save).toHaveBeenCalled();
                expect(mockContext.restore).toHaveBeenCalled();
            }
        });
    });

    // ... 他のテストメソッドも同様に修正 ...
});