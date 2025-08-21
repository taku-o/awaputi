/**
 * Advanced Performance Monitor Tests
 * AdvancedPerformanceMonitor クラスのユニットテスト
 */
import { jest  } from '@jest/globals';
// DOM environment setup''
import { JSDOM  } from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
(global: any).document = dom.window.document,
(global: any).window = dom.window,
(global: any).localStorage = dom.window.localStorage,
(global: any).performance = { now: jest.fn(() => Date.now(
    memory: {
        usedJSHeapSize: 50 * 1024 * 1024 },
        totalJSHeapSize: 100 * 1024 * 1024,
        jsHeapSizeLimit: 200 * 1024 * 1024 }
    }'
);
(global as any').navigator = { ''
    userAgent: 'Test Agent',','
    platform: 'Test Platform',
    hardwareConcurrency: 4,','
    deviceMemory: 8' }'
    }'),'
// Mock PerformanceConfig''
jest.mock('../src/config/PerformanceConfig.js', () => ({ getPerformanceConfig: jest.fn(() => ({''
        getOptimizationConfig: jest.fn((') => ({'
            targetFPS: 60,','
            maxHistorySize: 1000,','
            performanceLevel: 'high',
            adaptiveMode: true),
           , optimizationInterval: 100 }
    }),
        getQualityConfig: jest.fn(() => ({ )) }'
    )'))');'
// Mock ErrorHandler''
jest.mock('../src/utils/ErrorHandler.js', () => ({ getErrorHandler: jest.fn(() => ({
        handleError: jest.fn() }
    ))
));
// Mock GameEngine
const mockGameEngine = { canvas: {
        getContext: jest.fn(() => ({
            // Mock WebGL context
        ))),
    performanceOptimizer: {
        getCurrentFPS: jest.fn(() => 60 },
        getAverageFPS: jest.fn(() => 58,
        getAverageFrameTime: jest.fn(() => 16.67,
        stats: {
            droppedFrames: 2 },
            frameTimeVariance: 3.5,
        renderTime: 12.5 }
            };
    ),
    bubbleManager: { getActiveBubbleCount: jest.fn(() => 15) }
    ),
    enhancedParticleManager: { getActiveParticleCount: jest.fn(() => 120) }
    ),
    enhancedEffectManager: { getActiveEffectCount: jest.fn(() => 5) }
    ),
    scoreManager: { getScore: jest.fn(() => 1500) }'
    )', ');'
// Import after mocking''
const { AdvancedPerformanceMonitor } = await import('../../src/debug/AdvancedPerformanceMonitor.js');
describe('AdvancedPerformanceMonitor', () => {  let monitor: any,
    let consoleLogSpy: any,','
    let consoleWarnSpy: any,','
    beforeEach((') => { }'
        // Console spies' }'
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {}');'
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        // Reset mock calls
        jest.clearAllMocks();
        jest.useFakeTimers();
        // Create instance
        monitor = new AdvancedPerformanceMonitor(mockGameEngine: any),
    };
    afterEach(() => {  if (monitor) { }
            monitor.destroy(); }
        }
        // Restore console
        consoleLogSpy.mockRestore();
        consoleWarnSpy.mockRestore();'
        jest.useRealTimers();'}');
    describe('Initialization', (') => {  ''
        test('should initialize with default values', () => {
            expect(monitor.gameEngine).toBe(mockGameEngine);
            expect(monitor.performanceOptimizer).toBe(mockGameEngine.performanceOptimizer);
            expect(monitor.metricsCollector).toBeDefined();
            expect(monitor.performanceAnalyzer).toBeDefined() }'
            expect(monitor.detailedProfiler).toBeDefined();' }'
        }');'
        test('should setup metrics objects', () => {  expect(monitor.metrics.frame).toBeDefined();
            expect(monitor.metrics.memory).toBeDefined();
            expect(monitor.metrics.render).toBeDefined();
            expect(monitor.metrics.game).toBeDefined() }'
            expect(monitor.metrics.system).toBeDefined();' }'
        }');'
        test('should initialize history manager', () => {  expect(monitor.historyManager.maxSize).toBe(1000);
            expect(monitor.historyManager.retentionTime).toBe(5 * 60 * 1000);
            expect(monitor.historyManager.data).toBeDefined() }'
            expect(monitor.historyManager.data.fps).toEqual([]);' }'
        }');'
        test('should start monitoring automatically', () => {  expect(monitor.monitoring.enabled).toBe(true) }'
            expect(monitor.monitoring.intervalId).toBeDefined();' }'
        }');'
    }''
    describe('Metrics Collection', (') => {  ''
        test('should collect frame metrics', () => {
            monitor.metricsCollector.collectFrameMetrics();
            expect(monitor.metrics.frame.currentFPS).toBe(60);
            expect(monitor.metrics.frame.averageFPS).toBe(58);
            expect(monitor.metrics.frame.frameTime).toBe(16.67);
            expect(monitor.metrics.frame.droppedFrames).toBe(2) }'
            expect(monitor.metrics.frame.fpsVariance).toBe(3.5););' }'
        }');'
        test('should collect memory metrics', () => {  monitor.metricsCollector.collectMemoryMetrics();
            expect(monitor.metrics.memory.usedMemory).toBeCloseTo(47.68, 1), // 50MB in MB
            expect(monitor.metrics.memory.totalMemory).toBeCloseTo(95.37, 1), // 100MB in MB }'
            expect(monitor.metrics.memory.pressureLevel).toBeCloseTo(0.25, 2);' }'
        }');'
        test('should collect render metrics', () => {  monitor.metricsCollector.collectRenderMetrics();
            expect(monitor.metrics.render.renderTime).toBe(12.5);
            expect(monitor.metrics.render.drawCalls).toBeGreaterThan(0) }'
            expect(monitor.metrics.render.vertexCount).toBeGreaterThan(0);' }'
        }');'
        test('should collect game metrics', () => {  monitor.metricsCollector.collectGameMetrics();
            expect(monitor.metrics.game.bubbleCount).toBe(15);
            expect(monitor.metrics.game.particleCount).toBe(120);
            expect(monitor.metrics.game.effectCount).toBe(5);
            expect(monitor.metrics.game.currentScore).toBe(1500) }'
            expect(monitor.metrics.game.entityCount).toBe(135); // bubbles + particles);' }'
        }');'
        test('should collect system metrics', () => {  monitor.metricsCollector.collectSystemMetrics();
            expect(monitor.metrics.system.userAgent').toBe('Test Agent'),'
            expect(monitor.metrics.system.platform').toBe('Test Platform'),'
            expect(monitor.metrics.system.hardwareConcurrency).toBe(4) }'
            expect(monitor.metrics.system.deviceMemory).toBe(8););' }'
        }');'
        test('should collect all metrics', (') => {  ''
            const collectFrameMetricsSpy = jest.spyOn(monitor.metricsCollector, 'collectFrameMetrics');
            const collectMemoryMetricsSpy = jest.spyOn(monitor.metricsCollector, 'collectMemoryMetrics');
            const collectRenderMetricsSpy = jest.spyOn(monitor.metricsCollector, 'collectRenderMetrics');
            const collectGameMetricsSpy = jest.spyOn(monitor.metricsCollector, 'collectGameMetrics');
            const collectSystemMetricsSpy = jest.spyOn(monitor.metricsCollector, 'collectSystemMetrics');
            monitor.metricsCollector.collectAll();
            expect(collectFrameMetricsSpy.toHaveBeenCalled();
            expect(collectMemoryMetricsSpy.toHaveBeenCalled();
            expect(collectRenderMetricsSpy.toHaveBeenCalled();
            expect(collectGameMetricsSpy.toHaveBeenCalled() }'
            expect(collectSystemMetricsSpy.toHaveBeenCalled();' }'
        }');'
    }''
    describe('History Management', (') => {  ''
        test('should update history data', () => {
            monitor.metrics.frame.currentFPS = 55,
            monitor.metrics.memory.usedMemory = 60,
            
            monitor.updateHistoryData();
            expect(monitor.historyManager.data.fps).toHaveLength(1);
            expect(monitor.historyManager.data.fps[0].value).toBe(55);
            expect(monitor.historyManager.data.memory).toHaveLength(1) }'
            expect(monitor.historyManager.data.memory[0].used).toBe(60););' }'
        }');'
        test('should limit history size', () => {  monitor.historyManager.maxSize = 3,
            // Add more data than max size
            for (let i = 0, i < 5, i++) { }
                monitor.metrics.frame.currentFPS = 50 + i; }
                monitor.updateHistoryData(};)
            };
            expect(monitor.historyManager.data.fps).toHaveLength(3);'
            expect(monitor.historyManager.data.fps[0].value).toBe(52); // First should be removed'}');
        test('should cleanup old data', () => {  const oldTime = Date.now() - 10 * 60 * 1000, // 10 minutes ago
            const recentTime = Date.now() }
            monitor.historyManager.data.fps = [}
                { timestamp: oldTime, value: 30 },]
                { timestamp: recentTime, value: 60 }]
            ];
            monitor.cleanupOldData();
            expect(monitor.historyManager.data.fps).toHaveLength(1);'
            expect(monitor.historyManager.data.fps[0].value).toBe(60);'}');'
    }''
    describe('Performance Analysis', (') => {  ''
        test('should detect FPS anomalies', () => {
            monitor.metrics.frame.currentFPS = 25, // Critical FPS
            monitor.detectAnomalies(),'
            expect(monitor.analysis.anomalies).toHaveLength(1);
            expect(monitor.analysis.anomalies[0].type').toBe('fps_critical'),' }'
            expect(monitor.analysis.anomalies[0].severity').toBe('critical'););' }'
        }');'
        test('should detect memory pressure anomalies', () => {  monitor.metrics.memory.pressureLevel = 0.85, // High pressure
            monitor.detectAnomalies(),'
            expect(monitor.analysis.anomalies).toHaveLength(1);
            expect(monitor.analysis.anomalies[0].type').toBe('memory_pressure'),' }'
            expect(monitor.analysis.anomalies[0].severity').toBe('critical'););' }'
        }');'
        test('should detect frame variance anomalies', () => {  monitor.metrics.frame.fpsVariance = 15, // High variance
            monitor.detectAnomalies(),'
            expect(monitor.analysis.anomalies).toHaveLength(1);
            expect(monitor.analysis.anomalies[0].type').toBe('frame_variance'),' }'
            expect(monitor.analysis.anomalies[0].severity').toBe('warning'););' }'
        }');'
        test('should generate FPS predictions', () => {  // Add some history data }
            for (let i = 0; i < 5; i++) { }
                monitor.historyManager.data.fps.push({};
                    timestamp: Date.now() - (5 - i) * 1000,
                    value: 60 - i // Decreasing trend,
                },'
            }''
            monitor.generatePredictions(')';
            expect(monitor.analysis.predictions.has('fps_trend').toBe(true');'
            const fpsPrediction = monitor.analysis.predictions.get('fps_trend');
            expect(fpsPrediction.direction').toBe('degrading');'
            expect(fpsPrediction.confidence).toBeGreaterThan(0);'}');
        test('should generate performance recommendations', () => {  monitor.metrics.frame.currentFPS = 40, // Low FPS
            monitor.metrics.memory.pressureLevel = 0.75, // High memory
            monitor.metrics.render.drawCalls = 150, // High draw calls'
            monitor.generateRecommendations();
            expect(monitor.analysis.recommendations.length).toBeGreaterThan(0'),'
            const performanceRec = monitor.analysis.recommendations.find(r => r.type === 'performance'),'
            expect(performanceRec).toBeDefined();
            expect(performanceRec.priority').toBe('high'),'
            const memoryRec = monitor.analysis.recommendations.find(r => r.type === 'memory'),'
            expect(memoryRec).toBeDefined(),' }'
            expect(memoryRec.priority').toBe('medium'););' }'
        }');'
        test('should calculate trend correctly', () => {  const increasingValues = [10, 15, 20, 25, 30],
            const decreasingValues = [30, 25, 20, 15, 10],
            const stableValues = [20, 20, 20, 20, 20],
            expect(monitor.calculateTrend(increasingValues).toBeGreaterThan(0);
            expect(monitor.calculateTrend(decreasingValues).toBeLessThan(0) }
            expect(monitor.calculateTrend(stableValues).toBeCloseTo(0, 1); }'
        }'}');
    describe('Monitoring Control', (') => {  ''
        test('should start monitoring', () => {
            monitor.stopMonitoring();
            expect(monitor.monitoring.intervalId).toBeNull();
            monitor.startMonitoring() }'
            expect(monitor.monitoring.intervalId).toBeDefined();' }'
        }');'
        test('should stop monitoring', () => {  expect(monitor.monitoring.intervalId).toBeDefined() }
            monitor.stopMonitoring(); }'
            expect(monitor.monitoring.intervalId).toBeNull(};'}');
        test('should collect metrics at intervals', (') => {  ''
            const collectMetricsSpy = jest.spyOn(monitor, 'collectMetrics');
            jest.advanceTimersByTime(150), // Advance by 150ms }'
            expect(collectMetricsSpy.toHaveBeenCalled();' }'
        }');'
        test('should not collect metrics when disabled', (') => {  ''
            const collectMetricsSpy = jest.spyOn(monitor, 'collectMetrics');
            monitor.monitoring.enabled = false,
            jest.advanceTimersByTime(150) }'
            expect(collectMetricsSpy).not.toHaveBeenCalled();' }'
        }');'
    }''
    describe('Profiling', (') => {  ''
        test('should start profiling', (') => {''
            const startProfilingSpy = jest.spyOn(monitor.detailedProfiler, 'startProfiling');
            monitor.startProfiling('test-component'),' }'
            expect(startProfilingSpy.toHaveBeenCalledWith('test-component');' }'
        }');'
        test('should stop profiling', (') => {  ''
            const stopProfilingSpy = jest.spyOn(monitor.detailedProfiler, 'stopProfiling');
            monitor.stopProfiling() }'
            expect(stopProfilingSpy.toHaveBeenCalled();' }'
        }');'
        test('should get profiling results', (') => {  ''
            const getResultsSpy = jest.spyOn(monitor.detailedProfiler, 'getResults');
            monitor.getProfilingResults() }'
            expect(getResultsSpy.toHaveBeenCalled();' }'
        }');'
    }''
    describe('Public API', (') => {  ''
        test('should get current metrics', () => {
            const metrics = monitor.getCurrentMetrics();
            expect(metrics.frame).toBeDefined();
            expect(metrics.memory).toBeDefined();
            expect(metrics.render).toBeDefined();
            expect(metrics.game).toBeDefined() }'
            expect(metrics.system).toBeDefined();' }'
        }');'
        test('should get history data by type', () => {  // Add some test data }
            monitor.historyManager.data.fps = [}'
                { timestamp: Date.now(), value: 60 },''
                { timestamp: Date.now(')'
            const fpsHistory = monitor.getHistoryData('fps'),]
            expect(fpsHistory.toHaveLength(2),]'
            expect(fpsHistory[0].value).toBe(60),' }'
        }');'
        test('should get history data with time range', () => {  ''
            const now = Date.now(')',
            const recentHistory = monitor.getHistoryData('fps', 45000), // Last 45 seconds }'
            expect(recentHistory.toHaveLength(2);' }'
        }');'
        test('should get all history data', () => {  const allHistory = monitor.getHistoryData();
            expect(allHistory.fps).toBeDefined();
            expect(allHistory.memory).toBeDefined() }'
            expect(allHistory.frameTime).toBeDefined();' }'
        }');'
        test('should get analysis results', (') => { }'
            monitor.analysis.anomalies = [{ type: 'test', severity: 'warning' }],
            monitor.analysis.predictions.set('test', { value: 100 }');'
            monitor.analysis.recommendations = [{ type: 'test', priority: 'low' }],
            const results = monitor.getAnalysisResults();
            expect(results.anomalies).toHaveLength(1);
            expect(results.predictions.test).toBeDefined();'
            expect(results.recommendations).toHaveLength(1);'}');
        test('should get statistics', () => {  monitor.statistics.totalSamples = 100,
            monitor.statistics.monitoringStartTime = Date.now() - 60000, // 1 minute ago
            const stats = monitor.getStatistics();
            expect(stats.totalSamples).toBe(100);
            expect(stats.uptime).toBeGreaterThan(0) }'
            expect(stats.samplesPerSecond).toBeGreaterThan(0);' }'
        }');'
        test('should generate report', (') => {  ''
            const generateReportSpy = jest.spyOn(monitor.performanceAnalyzer, 'generateReport');
            monitor.generateReport() }'
            expect(generateReportSpy.toHaveBeenCalled();' }'
        }');'
        test('should update settings', () => {  const oldInterval = monitor.monitoring.interval,
            const newSettings = {
                interval: 200,
                historySize: 500 }
                retentionTime: 120000 }
            },
            monitor.updateSettings(newSettings);
            expect(monitor.monitoring.interval).toBe(200);
            expect(monitor.historyManager.maxSize).toBe(500);'
            expect(monitor.historyManager.retentionTime).toBe(120000);'}');
        test('should reset data', () => {  // Add some test data' }'
            monitor.historyManager.data.fps = [{ timestamp: Date.now('}]'
            monitor.analysis.anomalies = [{ type: 'test' }];)
            monitor.statistics.totalSamples = 100;)
            monitor.reset();
            expect(monitor.historyManager.data.fps).toHaveLength(0);
            expect(monitor.analysis.anomalies).toHaveLength(0);'
            expect(monitor.statistics.totalSamples).toBe(0);'}');'
    }''
    describe('Error Handling', (') => {  ''
        test('should handle collection errors gracefully', (') => {''
            const errorHandlerSpy = jest.spyOn(monitor.errorHandler, 'handleError'),'
            // Force an error in collection''
            jest.spyOn(monitor.metricsCollector, 'collectAll').mockImplementationOnce((') => { }'
                throw new Error('Collection error'); }
            };
            monitor.collectMetrics();'
            expect(errorHandlerSpy).toHaveBeenCalledWith();
                expect.any(Error'),';
                'AdvancedPerformanceMonitor.collectMetrics';
            );'}');
        test('should handle missing game engine gracefully', () => {  const monitorWithoutEngine = new AdvancedPerformanceMonitor(null: any) }
            expect(() => { }
                monitorWithoutEngine.metricsCollector.collectGameMetrics(}
            }.not.toThrow();'
            monitorWithoutEngine.destroy();'}');
        test('should handle missing performance optimizer gracefully', () => {  }
            const gameEngineWithoutOptimizer = { ...mockGameEngine };
            delete gameEngineWithoutOptimizer.performanceOptimizer;
            
            const monitorWithoutOptimizer = new AdvancedPerformanceMonitor(gameEngineWithoutOptimizer: any);
            expect(() => {  }
                monitorWithoutOptimizer.metricsCollector.collectFrameMetrics(}
            }.not.toThrow();'
            monitorWithoutOptimizer.destroy();'}');'
    }''
    describe('Cleanup', (') => {  ''
        test('should destroy cleanly', (') => {''
            const stopMonitoringSpy = jest.spyOn(monitor, 'stopMonitoring');
            const metricsCollectorDestroySpy = jest.spyOn(monitor.metricsCollector, 'destroy');
            const performanceAnalyzerDestroySpy = jest.spyOn(monitor.performanceAnalyzer, 'destroy');
            const detailedProfilerDestroySpy = jest.spyOn(monitor.detailedProfiler, 'destroy');
            monitor.destroy();
            expect(stopMonitoringSpy.toHaveBeenCalled();
            expect(metricsCollectorDestroySpy.toHaveBeenCalled();
            expect(performanceAnalyzerDestroySpy.toHaveBeenCalled() }'
            expect(detailedProfilerDestroySpy.toHaveBeenCalled();' }'
        }');'
    }''
    describe('Integration with PerformanceOptimizer', (') => {  ''
        test('should integrate with existing PerformanceOptimizer', () => { }'
            expect(monitor.performanceOptimizer).toBe(mockGameEngine.performanceOptimizer););' }'
        }');'
        test('should handle frame completion from optimizer', () => {  const frameData = {
                fps: 55,
                frameTime: 18.18 }
                droppedFrames: 1 }
            },
            monitor.onOptimizerFrameComplete(frameData);
            // Should update frame metrics
            expect(monitor.metrics.frame.currentFPS).toBe(55);
            expect(monitor.metrics.frame.frameTime).toBe(18.18);
            expect(monitor.metrics.frame.droppedFrames).toBe(1);
        };'
    }'}');