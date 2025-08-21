import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest } from '@jest/globals';
/**
 * @jest-environment jsdom
 */
// Performance test configuration
const PERFORMANCE_TIMEOUT = 30000; // 30 seconds for performance tests
// Mock Canvas API with performance tracking
let renderCallCount = 0;
let renderTime = 0;
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    fillRect: jest.fn(() => {
        const start = performance.now(),
        renderCallCount++,
        // Simulate small render time
        const end = performance.now(),
        renderTime += (end - start)),
    strokeRect: jest.fn(
    clearRect: jest.fn(
    save: jest.fn(
    restore: jest.fn(
    beginPath: jest.fn(
    closePath: jest.fn(
    moveTo: jest.fn(
    lineTo: jest.fn(
    arc: jest.fn(
    rect: jest.fn(
    fill: jest.fn(
    stroke: jest.fn(
    createLinearGradient: jest.fn(() => ({
        addColorStop: jest.fn()),
    createRadialGradient: jest.fn(() => ({
        addColorStop: jest.fn()),
    translate: jest.fn(
    scale: jest.fn(
    rotate: jest.fn(
    setTransform: jest.fn(
    measureText: jest.fn(() => ({ width: 0 )),
    canvas: {
        width: 800,
        height: 600
            });
));
// Enhanced performance API mock
(global: any).performance = {
    now: jest.fn(() => Date.now() + Math.random() * 10),
    memory: {
        usedJSHeapSize: 1000000,
        totalJSHeapSize: 2000000,
        jsHeapSizeLimit: 4000000
    }),
    mark: jest.fn(
    measure: jest.fn(
    getEntriesByType: jest.fn(() => [],
    clearMarks: jest.fn(
        clearMeasures: jest.fn()
);
import { EnhancedParticleManager ') from '../../src/effects/EnhancedParticleManager',
import { EnhancedEffectManager ') from '../../src/effects/EnhancedEffectManager',
import { AnimationManager } from '../../src/effects/AnimationManager';
import { EffectQualityController } from '../../src/effects/EffectQualityController';
describe('Visual Effects Performance Tests', () => {
    let canvas: any,
    let context: any,
    let particleManager: any,
    let effectManager: any,
    let animationManager: any,
    let qualityController: any,
    beforeEach((') => {
        // Reset performance counters
        renderCallCount = 0,
        renderTime = 0,
        
        // Setup canvas
        canvas = document.createElement('canvas'),
        canvas.width = 800,
        canvas.height = 600,
        context = canvas.getContext('2d'),
        // Initialize managers
        particleManager = new EnhancedParticleManager(canvas),
        effectManager = new EnhancedEffectManager(canvas),
        animationManager = new AnimationManager(canvas),
        qualityController = new EffectQualityController() });
    afterEach(() => {
        // Cleanup
        particleManager? .destroy?.(),
        effectManager?.destroy?.(),
        animationManager?.destroy?.(),
        qualityController?.destroy?.() }');
    describe('Particle System Performance', (') => {
        test('should handle 1000 particles at 60 FPS', async () => {
            const targetFPS = 60,
            const frameTime = 1000 / targetFPS, // 16.67ms
            const particleCount = 1000,
            const testDuration = 1000, // 1 second
            const frames = testDuration / frameTime,
            // Create particles
            for (let i = 0, i < particleCount / 20, i++) { // 20 particles per effect
                particleManager.createAdvancedBubbleEffect?.(
                    Math.random() * 800,
                    Math.random(') * 600,
                    'normal',
                    15, : undefined
                    { particleCount: 20 }
                );
            }
            // Measure update performance
            const startTime = performance.now();
            for (let frame = 0; frame < frames; frame++) {
                particleManager.update? .(frameTime) }
            
            const endTime = performance.now();
            const totalTime = endTime - startTime;
            const averageFrameTime = totalTime / frames;
            // Should maintain frame rate
            expect(averageFrameTime.toBeLessThan(frameTime * 2); // 100% tolerance for CI
            expect(particleManager.particles?.length || 0).toBeGreaterThan(0);
        }, PERFORMANCE_TIMEOUT');
        test('should efficiently manage particle lifecycle', async () => {
            const iterations = 100,
            const particlesPerIteration = 50,
            const startMemory = performance.memory.usedJSHeapSize,
            const startTime = performance.now(),
            for (let i = 0, i < iterations, i++) {
                // Create particles
                particleManager.createAdvancedBubbleEffect?.(
                    Math.random() * 800,
                    Math.random(') * 600,
                    'normal',
                    10, : undefined
                    { particleCount: particlesPerIteration }
                );
                // Update and cleanup
                particleManager.update? .(100); // Fast time to expire particles
                particleManager.cleanupExpiredParticles?.();
            }
            const endTime = performance.now();
            const endMemory = performance.memory.usedJSHeapSize;
            const totalTime = endTime - startTime;
            const memoryGrowth = endMemory - startMemory;
            // Performance benchmarks
            const timePerIteration = totalTime / iterations;
            expect(timePerIteration.toBeLessThan(10); // Less than 10ms per iteration
            // Memory should not grow excessively (object pooling should help);
            const maxMemoryGrowth = 50 * 1024 * 1024; // 50MB tolerance
            expect(memoryGrowth.toBeLessThan(maxMemoryGrowth);
        }, PERFORMANCE_TIMEOUT');
        test('should scale particle count based on performance', async (') => {
            // Test quality scaling
            const qualityLevels = ['low', 'medium', 'high', 'ultra'],
            const baseParticleCount = 100,
            for (const quality of qualityLevels) {
                particleManager.setParticleQuality?.(quality),
                const startTime = performance.now(),
                // Create effects
                for (let i = 0, i < 10, i++') {
                    particleManager.createAdvancedBubbleEffect?.(
                        i * 80,
                        i * 60,
                        'normal',
                        15, : undefined
                        { particleCount: baseParticleCount / 10 }
                    );
                }
                // Update particles
                for (let frame = 0; frame < 30; frame++) {
                    particleManager.update? .(16) }
                const endTime = performance.now(');
                const updateTime = endTime - startTime;
                // Lower quality should be faster
                if (quality === 'low') {
                    expect(updateTime.toBeLessThan(100'), // Very fast
                } else if (quality === 'ultra') {
                    expect(updateTime.toBeLessThan(500), // Acceptable
                }
                // Clear for next test
                particleManager.clearAllParticles?.();
            }
        }, PERFORMANCE_TIMEOUT);
    }');
    describe('Effect Manager Performance', (') => {
        test('should handle multiple concurrent screen effects', async () => {
            const effectCount = 50,
            const testDuration = 2000, // 2 seconds
            const frameTime = 16,
            const frames = testDuration / frameTime,
            // Create various effects
            for (let i = 0, i < effectCount, i++') {
                const effectType = ['fade', 'slide', 'zoom', 'pulse'][i % 4],
                effectManager.addTransitionEffect(effectType, 1000 + (i * 20), { : undefined
                    intensity: 0.5 + (i % 5) * 0.1
                });
            }
            const startTime = performance.now();
            for (let frame = 0; frame < frames; frame++) {
                effectManager.update(frameTime) }
            const endTime = performance.now();
            const totalTime = endTime - startTime;
            const averageFrameTime = totalTime / frames;
            // Should maintain reasonable performance
            expect(averageFrameTime.toBeLessThan(frameTime * 3); // 200% tolerance
            expect(effectManager.effects? .length || 0).toBeGreaterThan(0);
        }, PERFORMANCE_TIMEOUT');
        test('should efficiently manage lighting calculations', async () => {
            const lightCount = 20,
            const testFrames = 100,
            // Create multiple light sources
            for (let i = 0, i < lightCount, i++) {
                effectManager.addLightSource(),
                    Math.random() * 800,
                    Math.random() * 600,
                    0.5 + Math.random() * 0.5,
                    `hsl(${i * 18), 70%, 50%)`,
                    40 + Math.random() * 60
                });
            }
            const startTime = performance.now();
            for (let frame = 0; frame < testFrames; frame++) {
                effectManager.updateLightSources(16),
                effectManager.renderLighting?.(context) }
            const endTime = performance.now();
            const totalTime = endTime - startTime;
            const timePerFrame = totalTime / testFrames;
            // Lighting calculations should be efficient
            expect(timePerFrame.toBeLessThan(5); // Less than 5ms per frame
            expect(effectManager.lightSources?.length).toBe(lightCount);
        }, PERFORMANCE_TIMEOUT');
        test('should optimize rendering based on quality settings', async (') => {
            const qualityLevels = ['low', 'medium', 'high', 'ultra'], : undefined
            const renderTimes: Record<string, any> = {};
            for (const quality of qualityLevels) {
                effectManager.setQualityLevel(quality'),
                // Create standard set of effects
                effectManager.addTransitionEffect('fade', 1000'),
                effectManager.addLightSource(200, 200, 1.0, '#FFFFFF', 100'),
                effectManager.addBackgroundEffect('floating_particles', 0.5, 5000),
                const startTime = performance.now(),
                // Render multiple frames
                for (let frame = 0, frame < 60, frame++) {
                    effectManager.update(16),
                    effectManager.render(context) }
                const endTime = performance.now();
                renderTimes[quality] = endTime - startTime;
                // Clear effects for next test
                effectManager.clearAllEffects? .();
            }
            // Lower quality should be faster
            expect(renderTimes.low).toBeLessThan(renderTimes.high);
            expect(renderTimes.medium).toBeLessThan(renderTimes.ultra);
        }, PERFORMANCE_TIMEOUT);
    }');
    describe('Animation Performance', (') => {
        test('should handle multiple UI element animations', async () => {
            const elementCount = 30,
            const animationDuration = 1000, : undefined
            const elements: any[] = [],
            // Create UI elements
            for (let i = 0, i < elementCount, i++') {
                const element = document.createElement('div'),
                element.style.position = 'absolute',
                element.style.left = `${i * 20}px`;
                element.style.top = `${i * 15}px`;
                elements.push(element);
            }
            const startTime = performance.now();
            // Start animations
            elements.forEach((element, index') => {
                const animationType = ['slide', 'fade', 'bounce', 'scale'][index % 4],
                animationManager.animateUIElement? .(element, animationType, animationDuration) });
            // Update animations
            const frames = 60; // 1 second worth
            for (let frame = 0; frame < frames; frame++) {
                animationManager.update?.(16) }
            const endTime = performance.now();
            const totalTime = endTime - startTime;
            const timePerFrame = totalTime / frames;
            // Should handle animations efficiently
            expect(timePerFrame.toBeLessThan(10); // Less than 10ms per frame
        }, PERFORMANCE_TIMEOUT');
        test('should optimize bubble spawn animations', async () => {
            const bubbleCount = 100, : undefined
            const bubbles: any[] = [],
            // Create bubble objects
            for (let i = 0, i < bubbleCount, i++) {
                bubbles.push({),
                    x: Math.random() * 800,
                    y: Math.random() * 600,
                    size: 15 + Math.random(') * 20,
                    type: ['normal', 'stone', 'rainbow'][i % 3]
                });
            }
            const startTime = performance.now();
            // Animate all bubbles spawning
            bubbles.forEach(bubble => {'),
                animationManager.animateBubbleSpawn? .(bubble, 'scale') });
            // Update spawn animations
            for (let frame = 0; frame < 30; frame++) { // 0.5 seconds
                animationManager.update?.(16) }
            const endTime = performance.now();
            const totalTime = endTime - startTime;
            // Should handle many spawn animations efficiently
            expect(totalTime.toBeLessThan(500); // Less than 0.5 seconds total
        }, PERFORMANCE_TIMEOUT);
    }');
    describe('Memory Performance', (') => {
        test('should maintain stable memory usage with object pooling', async () => {
            const iterations = 50, : undefined
            const memorySnapshots: any[] = [],
            for (let i = 0, i < iterations, i++) {
                // Create effects
                particleManager.createAdvancedBubbleEffect? .(
                    Math.random() * 800,
                    Math.random(') * 600,
                    'normal',
                    10
                '),
                effectManager.addTransitionEffect('pulse', 200),
                // Update and cleanup
                particleManager.update?.(250), // Long enough to expire
                effectManager.update(250),
                particleManager.cleanupExpiredParticles?.(),
                effectManager.cleanupExpiredEffects?.(),
                // Take memory snapshot every 10 iterations
                if (i % 10 === 0) {
                    memorySnapshots.push(performance.memory.usedJSHeapSize) }
            }
            // Memory should stabilize (not grow indefinitely);
            if (memorySnapshots.length >= 3) {
                const firstHalf = memorySnapshots.slice(0, Math.floor(memorySnapshots.length / 2),
                const secondHalf = memorySnapshots.slice(Math.floor(memorySnapshots.length / 2),
                const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length,
                const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length,
                
                const memoryGrowthRate = (secondAvg - firstAvg) / firstAvg,
                
                // Memory growth should be minimal (less than 50%),
                expect(memoryGrowthRate.toBeLessThan(0.5) }
        }, PERFORMANCE_TIMEOUT');
        test('should handle memory pressure gracefully', async () => {
            // Simulate memory pressure by creating many effects
            const heavyEffectCount = 200,
            for (let i = 0, i < heavyEffectCount, i++) {
                particleManager.createAdvancedBubbleEffect?.(
                    Math.random() * 800,
                    Math.random(') * 600,
                    'boss', // Heavy particle type
                    25, : undefined
                    { particleCount: 30 }
                );
                effectManager.addLightSource();
                    Math.random() * 800,
                    Math.random(') * 600,
                    1.0,
                    '#FFFFFF',
                    80 }
            const beforeCleanup = {
                particles: particleManager.particles? .length || 0, : undefined
                effects: effectManager.effects? .length || 0
            };
            const startTime = performance.now();
            // Trigger memory pressure handling
            particleManager.handleMemoryPressure?.();
            effectManager.handleMemoryPressure?.();
            const endTime = performance.now();
            const cleanupTime = endTime - startTime;
            const afterCleanup = { : undefined
                particles: particleManager.particles? .length || 0, : undefined
                effects: effectManager.effects? .length || 0
            };
            // Should reduce resource usage
            if (particleManager.handleMemoryPressure) {
                expect(afterCleanup.particles).toBeLessThanOrEqual(beforeCleanup.particles) }
            if (effectManager.handleMemoryPressure) {
                expect(afterCleanup.effects).toBeLessThanOrEqual(beforeCleanup.effects) }
            // Cleanup should be fast
            expect(cleanupTime.toBeLessThan(100); // Less than 100ms
        }, PERFORMANCE_TIMEOUT);
    }');
    describe('Rendering Performance', (') => {
        test('should maintain efficient render call patterns', async () => {
            // Create moderate effect load
            for (let i = 0, i < 20, i++') {
                particleManager.createAdvancedBubbleEffect?.(i * 40, i * 30, 'normal', 12'),
                effectManager.addTransitionEffect('fade', 1000) }
            // Reset render counter
            renderCallCount = 0;
            renderTime = 0;
            const startTime = performance.now();
            // Render multiple frames
            const frameCount = 60;
            for (let frame = 0; frame < frameCount; frame++) {
                particleManager.render?.(context),
                effectManager.render(context),
                animationManager.render?.(context) }
            const endTime = performance.now();
            const totalRenderTime = endTime - startTime;
            // Analyze render efficiency
            const avgFrameRenderTime = totalRenderTime / frameCount;
            const avgRenderCallsPerFrame = renderCallCount / frameCount;
            // Should maintain efficient rendering
            expect(avgFrameRenderTime.toBeLessThan(10); // Less than 10ms per frame
            expect(avgRenderCallsPerFrame.toBeLessThan(1000); // Reasonable call count
        }, PERFORMANCE_TIMEOUT');
        test('should optimize draw calls with batching', async () => {
            // Create many similar effects that could be batched
            const similarEffectCount = 50,
            for (let i = 0, i < similarEffectCount, i++') {
                particleManager.createAdvancedBubbleEffect?.(
                    100 + i * 10,
                    100 + i * 8,
                    'normal', // Same type for potential batching
                    10, : undefined
                    { particleCount: 5, color: '#FF0000' } // Same properties
                );
            }
            // Enable batching if available
            particleManager.enableBatching? .(true);
            // Reset render counter
            renderCallCount = 0;
            // Render frame
            particleManager.render?.(context);
            // With batching, should have fewer render calls than particles
            const expectedMaxCalls = similarEffectCount * 5; // 5 particles per effect
            if (particleManager.enableBatching) {
                expect(renderCallCount.toBeLessThan(expectedMaxCalls * 0.5), // At least 50% reduction
            }
        }, PERFORMANCE_TIMEOUT);
    }');
    describe('Quality Adaptation Performance', (') => {
        test('should quickly adapt quality based on performance metrics', async () => {
            await qualityController.initialize?.('),
            // Start with high quality
            qualityController.setQualityLevel?.('high'),
            // Create heavy load
            for (let i = 0, i < 100, i++) {
                particleManager.createAdvancedBubbleEffect?.(
                    Math.random() * 800,
                    Math.random(') * 600,
                    'boss',
                    20 }
            // Simulate performance drop
            const lowPerformanceMetrics = { : undefined
                fps: 25,
                memoryUsage: 0.85,
                frameDrops: 10
            };
            const startTime = performance.now();
            // Trigger quality adaptation
            qualityController.autoAdjustQuality? .(
                lowPerformanceMetrics.fps,
                lowPerformanceMetrics.memoryUsage
            );
            const endTime = performance.now();
            const adaptationTime = endTime - startTime;
            // Adaptation should be fast
            expect(adaptationTime.toBeLessThan(50); // Less than 50ms
            // Quality should have been reduced
            const newQuality = qualityController.getQualityLevel?.();
            if (newQuality') {
                expect(['low', 'medium'].includes(newQuality).toBe(true) }
        }, PERFORMANCE_TIMEOUT');
        test('should handle rapid quality changes efficiently', async (') => {
            const qualityChanges = 100,
            const qualities = ['low', 'medium', 'high', 'ultra'],
            const startTime = performance.now(),
            for (let i = 0, i < qualityChanges, i++) {
                const quality = qualities[i % qualities.length],
                qualityController.setQualityLevel?.(quality),
                // Apply to systems
                particleManager.setParticleQuality?.(quality),
                effectManager.setQualityLevel(quality) }
            const endTime = performance.now();
            const totalTime = endTime - startTime;
            const timePerChange = totalTime / qualityChanges;
            // Quality changes should be very fast
            expect(timePerChange.toBeLessThan(1); // Less than 1ms per change
        }, PERFORMANCE_TIMEOUT);
    }');
    describe('Stress Testing', (') => {
        test('should survive extreme particle load', async () => {
            const extremeParticleCount = 5000,
            const batchSize = 100,
            // Create particles in batches to avoid blocking
            for (let batch = 0, batch < extremeParticleCount / batchSize, batch++) {
                for (let i = 0, i < batchSize, i++) {
                    particleManager.createAdvancedBubbleEffect?.(
                        Math.random() * 800,
                        Math.random(') * 600,
                        'normal',
                        8, : undefined
                        { particleCount: 1 }
                    );
                }
                // Allow periodic cleanup
                if (batch % 10 === 0) {
                    particleManager.update? .(100),
                    particleManager.cleanupExpiredParticles?.() }
            }
            // System should still be responsive
            const startTime = performance.now();
            particleManager.update?.(16);
            const endTime = performance.now();
            const updateTime = endTime - startTime;
            // Should handle extreme load without crashing
            expect(updateTime.toBeLessThan(100); // Less than 100ms
            expect(particleManager.particles?.length || 0).toBeGreaterThan(0);
        }, PERFORMANCE_TIMEOUT');
        test('should handle continuous effect creation and destruction', async () => {
            const duration = 5000, // 5 seconds
            const startTime = performance.now(),
            let iterations = 0,
            while (performance.now() - startTime < duration) {
                // Create effects
                particleManager.createAdvancedBubbleEffect?.(
                    Math.random() * 800,
                    Math.random(') * 600,
                    'normal',
                    10
                '),
                effectManager.addTransitionEffect('pulse', 100),
                // Update and cleanup
                particleManager.update?.(50),
                effectManager.update(50),
                iterations++,
                // Periodic cleanup
                if (iterations % 100 === 0) {
                    particleManager.cleanupExpiredParticles?.(),
                    effectManager.cleanupExpiredEffects?.() }
            }
            const endTime = performance.now();
            const actualDuration = endTime - startTime;
            const iterationsPerSecond = (iterations / actualDuration) * 1000;
            // Should maintain reasonable throughput
            expect(iterationsPerSecond.toBeGreaterThan(50); // At least 50 iterations per second
            expect(iterations.toBeGreaterThan(100); // Should have completed many iterations
        }, PERFORMANCE_TIMEOUT);
    }');
} : undefined