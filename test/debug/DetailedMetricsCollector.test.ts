/**
 * Detailed Metrics Collector Tests
 * DetailedMetricsCollector クラスのユニットテスト
 */

import { jest } from '@jest/globals';

// DOM environment setup
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
(global as any).document = dom.window.document;
(global as any).window = dom.window;
(global as any).performance = {
    now: jest.fn(() => Date.now()),
    memory: {
        usedJSHeapSize: 50 * 1024 * 1024,
        totalJSHeapSize: 100 * 1024 * 1024,
        jsHeapSizeLimit: 200 * 1024 * 1024
    }
};
(global as any).navigator = {
    userAgent: 'Test Agent',
    platform: 'Test Platform',
    language: 'en-US',
    languages: ['en-US', 'en'],
    hardwareConcurrency: 4,
    deviceMemory: 8,
    maxTouchPoints: 10,
    connection: {
        effectiveType: '4g',
        downlink: 10,
        rtt: 50,
        saveData: false
    }
};

// Mock monitor
const mockMonitor = {
    gameEngine: {
        canvas: {
            getContext: jest.fn((type) => {
                if (type === 'webgl' || type === 'experimental-webgl') {
                    return { mock: 'webgl-context' };
                }
                if (type === '2d') {
                    return { mock: '2d-context' };
                }
                return null;
            })
        },
        bubbleManager: {
            getActiveBubbleCount: jest.fn(() => 25)
        },
        enhancedParticleManager: {
            getActiveParticleCount: jest.fn(() => 150)
        },
        enhancedEffectManager: {
            getActiveEffectCount: jest.fn(() => 8)
        },
        audioManager: {
            mock: 'audio-manager'
        }
    },
    historyManager: {
        data: {
            memory: [
                { timestamp: Date.now() - 5000, used: 45 },
                { timestamp: Date.now() - 4000, used: 48 },
                { timestamp: Date.now() - 3000, used: 52 },
                { timestamp: Date.now() - 2000, used: 49 }, // GC event
                { timestamp: Date.now() - 1000, used: 55 },
                { timestamp: Date.now(), used: 58 }
            ]
        }
    }
};

// Import after mocking
const { DetailedMetricsCollector } = await import('../../src/debug/DetailedMetricsCollector.js');

describe('DetailedMetricsCollector', () => {
    let collector: any;
    let consoleLogSpy: any;
    let consoleWarnSpy: any;
    let consoleErrorSpy: any;

    beforeEach(() => {
        // Console spies
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // Reset mock calls
        jest.clearAllMocks();

        // Create instance
        collector = new DetailedMetricsCollector(mockMonitor as any);
    });

    afterEach(() => {
        if (collector) {
            collector.destroy();
        }

        // Restore console
        consoleLogSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    describe('Initialization', () => {
        test('should initialize with extended metrics', () => {
            expect(collector.extendedMetrics.rendering).toBeDefined();
            expect(collector.extendedMetrics.memory).toBeDefined();
            expect(collector.extendedMetrics.game).toBeDefined();
            expect(collector.extendedMetrics.audio).toBeDefined();
            expect(collector.extendedMetrics.network).toBeDefined();
            expect(collector.extendedMetrics.system).toBeDefined();
        });

        test('should initialize profiling data structures', () => {
            expect(collector.profilingData.renderPipeline).toBeInstanceOf(Map as any);
            expect(collector.profilingData.memoryAllocations).toEqual([]);
            expect(collector.profilingData.gameLoopBreakdown).toBeInstanceOf(Map as any);
            expect(collector.profilingData.webGLCalls).toEqual([]);
            expect(collector.profilingData.audioProcessing).toBeInstanceOf(Map as any);
        });

        test('should initialize statistics tracking', () => {
            expect(collector.statisticsTracking.sampleCount).toBe(0);
            expect(collector.statisticsTracking.errorCount).toBe(0);
            expect(collector.statisticsTracking.averageCollectionTime).toBe(0);
            expect(collector.statisticsTracking.peakCollectionTime).toBe(0);
        });
    });

    describe('Rendering Metrics Collection', () => {
        test('should collect rendering details', () => {
            collector.collectRenderingDetails();

            const renderMetrics = collector.extendedMetrics.rendering;
            expect(renderMetrics.timestamp).toBeDefined();
            expect(renderMetrics.drawCalls).toBeGreaterThanOrEqual(0);
            expect(renderMetrics.triangles).toBeGreaterThanOrEqual(0);
            expect(renderMetrics.vertices).toBeGreaterThanOrEqual(0);
        });

        test('should estimate draw calls correctly', () => {
            const drawCalls = collector.estimateDrawCalls();
            expect(drawCalls).toBeGreaterThan(0);
            // Based on mock data: 25 bubbles, 150 particles, 8 effects
            // Expected: ceil(25/20) + ceil(150/100) + 8*2 = 2 + 2 + 16 = 20
            expect(drawCalls).toBe(20);
        });

        test('should estimate triangle count correctly', () => {
            const triangles = collector.estimateTriangleCount();
            expect(triangles).toBeGreaterThan(0);
            // Expected: 25*16 + 150*2 = 400 + 300 = 700
            expect(triangles).toBe(700);
        });

        test('should estimate vertex count correctly', () => {
            const vertices = collector.estimateVertexCount();
            expect(vertices).toBeGreaterThan(0);
            // Expected: 700 * 3 = 2100
            expect(vertices).toBe(2100);
        });

        test('should handle missing WebGL context', () => {
            mockMonitor.gameEngine.canvas.getContext.mockReturnValue(null;
            
            expect(() => {
                collector.collectRenderingDetails();
            }).not.toThrow();
        });
    });

    describe('Memory Metrics Collection', () => {
        test('should collect memory details', () => {
            collector.collectMemoryDetails();

            const memoryMetrics = collector.extendedMetrics.memory;
            expect(memoryMetrics.timestamp).toBeDefined();
            expect(memoryMetrics.heap).toBeDefined();
        });

        test('should analyze memory allocation patterns', () => {
            collector.analyzeMemoryAllocationPatterns(collector.extendedMetrics.memory);

            const memoryMetrics = collector.extendedMetrics.memory;
            expect(memoryMetrics.allocationPattern).toBeDefined();
            expect(memoryMetrics.allocationPattern.frequency).toBeGreaterThanOrEqual(0);
            expect(memoryMetrics.allocationPattern.trend).toMatch(/increasing|decreasing|stable/);
        });

        test('should analyze GC patterns', () => {
            collector.analyzeGCPatterns(collector.extendedMetrics.memory);

            const memoryMetrics = collector.extendedMetrics.memory;
            expect(memoryMetrics.garbageCollection).toBeDefined();
            expect(memoryMetrics.garbageCollection.eventCount).toBeGreaterThanOrEqual(0);
            expect(memoryMetrics.garbageCollection.frequency).toBeGreaterThanOrEqual(0);
        });

        test('should calculate memory trend correctly', () => {
            const history = [
                { used: 40 }, { used: 42 }, { used: 44 }, { used: 46 }, { used: 48 },
                { used: 50 }, { used: 52 }, { used: 54 }, { used: 56 }, { used: 58 }
            ];
            
            const trend = collector.calculateMemoryTrend(history;
            expect(trend).toBe('increasing');
        });

        test('should detect stable memory trend', () => {
            const history = [
                { used: 50 }, { used: 50 }, { used: 51 }, { used: 49 }, { used: 50 },
                { used: 50 }, { used: 51 }, { used: 49 }, { used: 50 }, { used: 50 }
            ];
            
            const trend = collector.calculateMemoryTrend(history;
            expect(trend).toBe('stable');
        });
    });

    describe('Game Metrics Collection', () => {
        test('should collect game details', () => {
            collector.collectGameDetails();

            const gameMetrics = collector.extendedMetrics.game;
            expect(gameMetrics.timestamp).toBeDefined();
        });

        test('should collect entity metrics', () => {
            collector.collectEntityMetrics(collector.extendedMetrics.game);

            const gameMetrics = collector.extendedMetrics.game;
            expect(gameMetrics.entities).toBeDefined();
            expect(gameMetrics.entities.bubbles).toBeDefined();
            expect(gameMetrics.entities.particles).toBeDefined();
            expect(gameMetrics.entities.effects).toBeDefined();
            
            expect(gameMetrics.entities.bubbles.total).toBe(25);
            expect(gameMetrics.entities.particles.total).toBe(150);
            expect(gameMetrics.entities.effects.total).toBe(8);
        });

        test('should collect physics metrics', () => {
            collector.collectPhysicsMetrics(collector.extendedMetrics.game);

            const gameMetrics = collector.extendedMetrics.game;
            expect(gameMetrics.physics).toBeDefined();
            expect(gameMetrics.physics.collisionChecks).toBeGreaterThanOrEqual(0);
            expect(gameMetrics.physics.collisionHits).toBeGreaterThanOrEqual(0);
            expect(gameMetrics.physics.physicsSteps).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Audio Metrics Collection', () => {
        test('should collect audio details', () => {
            collector.collectAudioDetails();

            const audioMetrics = collector.extendedMetrics.audio;
            expect(audioMetrics.timestamp).toBeDefined();
        });

        test('should handle missing audio manager', () => {
            const originalAudioManager = mockMonitor.gameEngine.audioManager;
            mockMonitor.gameEngine.audioManager = null;

            expect(() => {
                collector.collectAudioDetails();
            }).not.toThrow();

            mockMonitor.gameEngine.audioManager = originalAudioManager;
        });
    });

    describe('Network Metrics Collection', () => {
        test('should collect network details', () => {
            collector.collectNetworkDetails();

            const networkMetrics = collector.extendedMetrics.network;
            expect(networkMetrics.timestamp).toBeDefined();
            expect(networkMetrics.connection).toBeDefined();
            expect(networkMetrics.connection.effectiveType).toBe('4g');
            expect(networkMetrics.connection.downlink).toBe(10);
            expect(networkMetrics.connection.rtt).toBe(50);
        });

        test('should handle missing connection info', () => {
            const originalConnection = navigator.connection;
            delete navigator.connection;

            expect(() => {
                collector.collectNetworkDetails();
            }).not.toThrow();

            navigator.connection = originalConnection;
        });
    });

    describe('System Metrics Collection', () => {
        test('should collect system details', () => {
            collector.collectSystemDetails();

            const systemMetrics = collector.extendedMetrics.system;
            expect(systemMetrics.timestamp).toBeDefined();
            expect(systemMetrics.device).toBeDefined();
            expect(systemMetrics.capabilities).toBeDefined();
            expect(systemMetrics.performanceAPI).toBeDefined();
        });

        test('should detect browser capabilities', () => {
            collector.collectSystemDetails();

            const systemMetrics = collector.extendedMetrics.system;
            expect(systemMetrics.capabilities.webgl).toBe(true;
            expect(systemMetrics.capabilities.localStorage).toBe(true;
            expect(systemMetrics.capabilities.indexedDB).toBe(true;
        });

        test('should collect device information', () => {
            collector.collectSystemDetails();

            const systemMetrics = collector.extendedMetrics.system;
            expect(systemMetrics.device.userAgent).toBe('Test Agent');
            expect(systemMetrics.device.platform).toBe('Test Platform');
            expect(systemMetrics.device.language).toBe('en-US');
            expect(systemMetrics.device.hardwareConcurrency).toBe(4);
            expect(systemMetrics.device.deviceMemory).toBe(8);
        });
    });

    describe('Platform Detection', () => {
        test('should detect WebGL support', () => {
            const support = collector.detectWebGLSupport();
            expect(support).toBe(true;
        });

        test('should detect WebGL2 support', () => {
            const support = collector.detectWebGL2Support();
            expect(support).toBe(false; // Mock doesn't support WebGL2
        });

        test('should detect WebAssembly support', () => {
            // Mock WebAssembly
            (global as any).WebAssembly = {
                instantiate: jest.fn()
            };

            const support = collector.detectWebAssemblySupport();
            expect(support).toBe(true;

            delete global.WebAssembly;
        });

        test('should handle WebGL detection errors', () => {
            // Mock canvas creation error
            const originalCreateElement = document.createElement;
            document.createElement = jest.fn(() => {
                throw new Error('Canvas creation failed');
            });

            const support = collector.detectWebGLSupport();
            expect(support).toBe(false as any);

            document.createElement = originalCreateElement;
        });
    });

    describe('Collection Process', () => {
        test('should collect all detailed metrics', () => {
            const collectRenderingSpy = jest.spyOn(collector, 'collectRenderingDetails');
            const collectMemorySpy = jest.spyOn(collector, 'collectMemoryDetails');
            const collectGameSpy = jest.spyOn(collector, 'collectGameDetails');
            const collectAudioSpy = jest.spyOn(collector, 'collectAudioDetails');
            const collectNetworkSpy = jest.spyOn(collector, 'collectNetworkDetails');
            const collectSystemSpy = jest.spyOn(collector, 'collectSystemDetails');

            collector.collectDetailedMetrics();

            expect(collectRenderingSpy).toHaveBeenCalled();
            expect(collectMemorySpy).toHaveBeenCalled();
            expect(collectGameSpy).toHaveBeenCalled();
            expect(collectAudioSpy).toHaveBeenCalled();
            expect(collectNetworkSpy).toHaveBeenCalled();
            expect(collectSystemSpy).toHaveBeenCalled();
        });

        test('should update statistics after collection', () => {
            const initialSampleCount = collector.statisticsTracking.sampleCount;
            
            collector.collectDetailedMetrics();

            expect(collector.statisticsTracking.sampleCount).toBe(initialSampleCount + 1);
            expect(collector.statisticsTracking.lastSampleTime).toBeGreaterThan(0);
            expect(collector.statisticsTracking.averageCollectionTime).toBeGreaterThanOrEqual(0);
        });

        test('should handle collection errors', () => {
            // Force an error
            jest.spyOn(collector, 'collectRenderingDetails').mockImplementationOnce(() => {
                throw new Error('Collection error');
            });

            expect(() => {
                collector.collectDetailedMetrics();
            }).toThrow('Collection error');

            expect(collector.statisticsTracking.errorCount).toBe(1);
        });
    });

    describe('Public API', () => {
        test('should get extended metrics', () => {
            collector.collectDetailedMetrics();
            
            const metrics = collector.getExtendedMetrics();
            
            expect(metrics.rendering).toBeDefined();
            expect(metrics.memory).toBeDefined();
            expect(metrics.game).toBeDefined();
            expect(metrics.audio).toBeDefined();
            expect(metrics.network).toBeDefined();
            expect(metrics.system).toBeDefined();
        });

        test('should get profiling data', () => {
            const profilingData = collector.getProfilingData();
            
            expect(profilingData.renderPipeline).toBeDefined();
            expect(profilingData.memoryAllocations).toEqual([]);
            expect(profilingData.gameLoopBreakdown).toBeDefined();
            expect(profilingData.webGLCalls).toEqual([]);
            expect(profilingData.audioProcessing).toBeDefined();
        });

        test('should get collection statistics', () => {
            collector.collectDetailedMetrics();
            
            const stats = collector.getCollectionStatistics();
            
            expect(stats.sampleCount).toBeGreaterThan(0);
            expect(stats.lastSampleTime).toBeGreaterThan(0);
            expect(stats.averageCollectionTime).toBeGreaterThanOrEqual(0);
            expect(stats.errorCount).toBe(0);
        });
    });

    describe('Setup Methods', () => {
        test('should setup WebGL profiler', () => {
            expect(() => {
                collector.setupWebGLProfiler();
            }).not.toThrow();
        });

        test('should setup memory tracker', () => {
            expect(() => {
                collector.setupMemoryTracker();
            }).not.toThrow();
        });

        test('should setup game loop profiler', () => {
            expect(() => {
                collector.setupGameLoopProfiler();
            }).not.toThrow();
        });

        test('should setup audio profiler', () => {
            expect(() => {
                collector.setupAudioProfiler();
            }).not.toThrow();
        });

        test('should setup network monitor', () => {
            expect(() => {
                collector.setupNetworkMonitor();
            }).not.toThrow();
        });
    });

    describe('Cleanup', () => {
        test('should destroy cleanly', () => {
            // Add some test data
            collector.profilingData.renderPipeline.set('test', 'data');
            collector.profilingData.memoryAllocations.push({ test: 'data' });
            collector.profilingData.webGLCalls.push({ test: 'call' });

            collector.destroy();

            expect(collector.profilingData.renderPipeline.size).toBe(0);
            expect(collector.profilingData.memoryAllocations).toHaveLength(0);
            expect(collector.profilingData.webGLCalls).toHaveLength(0);
        });
    });
});