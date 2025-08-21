/**
 * Performance Visualizer Tests
 * PerformanceVisualizer クラスのユニットテスト
 */
import { jest  } from '@jest/globals';
// DOM environment setup''
import { JSDOM  } from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
(global: any).document = dom.window.document,
(global: any).window = dom.window,
(global: any).HTMLCanvasElement = dom.window.HTMLCanvasElement,
(global: any).CanvasRenderingContext2D = dom.window.CanvasRenderingContext2D,
(global: any).requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16);
(global: any).cancelAnimationFrame = jest.fn() as jest.Mock,
// Mock Canvas 2D Context
const mockCanvasContext = { fillRect: jest.fn(
    strokeRect: jest.fn(
    clearRect: jest.fn(
    fillText: jest.fn(
    beginPath: jest.fn(
    moveTo: jest.fn(
    lineTo: jest.fn(
    stroke: jest.fn(),','
    setLineDash: jest.fn(),','
    toDataURL: jest.fn((') => 'data:image/png,base64,mock-data'),'
    save: jest.fn(
    restore: jest.fn(
    translate: jest.fn(
    scale: jest.fn(
    rotate: jest.fn(
    createLinearGradient: jest.fn(() => ({
        addColorStop: jest.fn() }
    )),
    measureText: jest.fn(() => ({ width: 50 )) }
    );
// Mock Canvas'
const mockCanvas = { ''
    getContext: jest.fn(() => mockCanvasContext','
    width: 800,
    height: 600,','
    style: {''
        position: ',' };
        top: ',',
        right: ',',
        zIndex: ',',
        border: ',',
        backgroundColor: ',',
        display: 'none' }
    },
    addEventListener: jest.fn(
    parentNode: { removeChild: jest.fn() }'
    ),''
    toDataURL: jest.fn((') => 'data:image/png,base64,mock-data');'
    });
// Mock document.createElement for canvas'
const originalCreateElement = document.createElement;
document.createElement = jest.fn((tagName') => {  ''
    if (tagName === 'canvas') {
        return mockCanvas','
    '),'
    if (tagName === 'a') {
        return { ''
            download: ',',
            href: '}'
        click: jest.fn() }
    ) };
    return originalCreateElement.call(document, tagName); }
};
// Mock document.body.appendChild
document.body.appendChild = jest.fn() as jest.Mock;
// Mock monitor
const mockMonitor = { getCurrentMetrics: jest.fn(() => ({
        frame: { }
            currentFPS: 60,
            averageFPS: 58,
            frameTime: 16.67,
            droppedFrames: 0),
           , fpsVariance: 2.5 }
    },
        memory: { usedMemory: 50.5,
            totalMemory: 100.0 },
            pressureLevel: 0.3 }
    },
        render: { renderTime: 10.5,
            drawCalls: 25,',' };
            vertexCount: 1500' }'
    }'),'
        game: { bubbleCount: 15,
            particleCount: 120 },
            effectCount: 5,
            entityCount: 140,
            currentScore: 1500 }
        },'
        system: { ''
            userAgent: 'Test Agent',',' };
            platform: 'Test Platform',
            hardwareConcurrency: 4,
            deviceMemory: 8 }
        }
    },
    getHistoryData: jest.fn(() => ({ fps: [ { timestamp: Date.now() - 1000, value: 60 ,
            { timestamp: Date.now(), ]
        value: 58  }]
    }]
        ],
        memory: [{ timestamp: Date.now() - 1000, used: 45.5 },        ]
            { timestamp: Date.now(), used: 50.5 }]
        ]';'
    },''
    getAnalysisResults: jest.fn((') => ({ anomalies: [ '}
            { type: 'fps_drop', severity: 'warning',']'
        message: 'FPS dropped below threshold'  }]
    }]
        ],
        predictions: new Map(
        recommendations: [],
    }),
    getStatistics: jest.fn(() => ({ totalSamples: 150,
        uptime: 60000,
        samplesPerSecond: 2.5),
       , totalErrors: 0 }
            };
),';'
// Import after mocking''
const { PerformanceVisualizer ') = await import('../../src/debug/PerformanceVisualizer.js'),'
describe('PerformanceVisualizer', () => { 
    let visualizer: any,
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
        visualizer = new PerformanceVisualizer(mockMonitor: any);
    };
    afterEach(() => {  if (visualizer) { }
            visualizer.destroy(); }
        }
        // Restore console
        consoleLogSpy.mockRestore();
        consoleWarnSpy.mockRestore();'
        jest.useRealTimers();'}');
    describe('Initialization', (') => {  ''
        test('should initialize with default settings', () => {
            expect(visualizer.monitor).toBe(mockMonitor);
            expect(visualizer.canvas).toBe(mockCanvas);
            expect(visualizer.ctx).toBe(mockCanvasContext);
            expect(visualizer.charts).toBeInstanceOf(Map: any) }'
            expect(visualizer.settings).toBeDefined();' }'
        }');'
        test('should create canvas with correct properties', () => {  ''
            expect(document.createElement').toHaveBeenCalledWith('canvas'),'
            expect(mockCanvas.width).toBe(800),'
            expect(mockCanvas.height).toBe(600);
            expect(mockCanvas.style.position').toBe('absolute'),' }'
            expect(mockCanvas.style.display').toBe('none'););' }'
        }');'
        test('should setup event listeners', () => {  ''
            expect(mockCanvas.addEventListener').toHaveBeenCalledWith('mousemove', expect.any(Function),'
            expect(mockCanvas.addEventListener').toHaveBeenCalledWith('click', expect.any(Function),' }'
            expect(mockCanvas.addEventListener').toHaveBeenCalledWith('wheel', expect.any(Function);' }'
        }');'
        test('should initialize charts', () => {  ''
            expect(visualizer.charts.size).toBeGreaterThan(0'),'
            expect(visualizer.charts.has('fps').toBe(true'),'
            expect(visualizer.charts.has('memory').toBe(true'),'
            expect(visualizer.charts.has('frameTime').toBe(true'),'
            expect(visualizer.charts.has('drawCalls').toBe(true'),'
            expect(visualizer.charts.has('entities').toBe(true),'),' }'
            expect(visualizer.charts.has('heatmap').toBe(true'); }'
        }''
        test('should start rendering animation', () => {  expect(global.requestAnimationFrame).toHaveBeenCalled() }'
            expect(visualizer.animationId).toBeDefined();' }'
        }');'
    }''
    describe('Chart Management', (') => {  ''
        test('should update chart data', (') => {''
            const fpsChart = visualizer.charts.get('fps'),' }'
            const addDataPointSpy = jest.spyOn(fpsChart, 'addDataPoint'); }
            visualizer.updateCharts(};)
            expect(addDataPointSpy.toHaveBeenCalledWith({ timestamp: expect.any(Number)
                value: 60),
               , threshold: { warning: 45) }
        critical: 30 } };'
            }'}');
        test('should handle chart data with thresholds', (') => {  ''
            const memoryChart = visualizer.charts.get('memory'),' }'
            const addDataPointSpy = jest.spyOn(memoryChart, 'addDataPoint'); }
            visualizer.updateCharts(};)
            expect(addDataPointSpy.toHaveBeenCalledWith({ timestamp: expect.any(Number)
                value: 50.5),
               , threshold: { warning: 150) }
        critical: 180 } };'
            }'}');
        test('should update all chart types', (') => {  ''
            const chartNames = ['fps', 'memory', 'frameTime', 'drawCalls', 'entities'],'
            const spies = chartNames.map(name => {),' }'
                const chart = visualizer.charts.get(name');' }'
                return jest.spyOn(chart, 'addDataPoint'}
            };
            visualizer.updateCharts();
            spies.forEach(spy => {  ) }'
                expect(spy.toHaveBeenCalled();' }'
            }');'
        }''
        test('should update heatmap', (') => {  ''
            const heatmap = visualizer.charts.get('heatmap'),' }'
            const updateHeatmapSpy = jest.spyOn(heatmap, 'updateHeatmap'); }
            visualizer.updateCharts(};)
            expect(updateHeatmapSpy.toHaveBeenCalledWith({ fps: 60)
                memory: 0.3),
               , frameTime: 16.67),
        timestamp: expect.any(Number) }
    };'
            }'}');
        test('should throttle updates based on interval', () => {  ''
            visualizer.chartState.lastUpdate = Date.now(')',
            const fpsChart = visualizer.charts.get('fps');
            const addDataPointSpy = jest.spyOn(fpsChart, 'addDataPoint');
            visualizer.updateCharts() }'
            expect(addDataPointSpy).not.toHaveBeenCalled();' }'
        }');'
        test('should cleanup old data', (') => {  ''
            const fpsChart = visualizer.charts.get('fps');
            const cleanupSpy = jest.spyOn(fpsChart, 'cleanupOldData');
            visualizer.cleanupOldData(Date.now() }'
            expect(cleanupSpy.toHaveBeenCalled();' }'
        }');'
    }''
    describe('Rendering', (') => {  ''
        test('should render charts when visible', (') => {''
            mockCanvas.style.display = 'block',', ',
            const updateChartsSpy = jest.spyOn(visualizer, 'updateCharts');
            const renderChartsSpy = jest.spyOn(visualizer, 'renderCharts');
            // Simulate animation frame
            const renderCallback = global.requestAnimationFrame.mock.calls[0][0],
            renderCallback();
            expect(updateChartsSpy.toHaveBeenCalled() }'
            expect(renderChartsSpy.toHaveBeenCalled();' }'
        }');'
        test('should not render when hidden', (') => {  ''
            mockCanvas.style.display = 'none',', ',
            const updateChartsSpy = jest.spyOn(visualizer, 'updateCharts');
            const renderChartsSpy = jest.spyOn(visualizer, 'renderCharts');
            // Simulate animation frame
            const renderCallback = global.requestAnimationFrame.mock.calls[0][0],
            renderCallback();
            expect(updateChartsSpy).not.toHaveBeenCalled() }'
            expect(renderChartsSpy).not.toHaveBeenCalled();' }'
        }');'
        test('should clear background', () => {  visualizer.renderCharts();
            expect(mockCanvasContext.fillStyle).toBe(visualizer.settings.backgroundColor) }'
            expect(mockCanvasContext.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);' }'
        }');'
        test('should render title', (') => {  ''
            const renderTitleSpy = jest.spyOn(visualizer, 'renderTitle');
            visualizer.renderCharts(),'
            expect(renderTitleSpy.toHaveBeenCalledWith(mockCanvasContext);
            expect(mockCanvasContext.fillText').toHaveBeenCalledWith(')','
                'Real-time Performance Monitor') }
                400, // canvas.width / 2) }'
                25,'}');
        test('should render statistics', (') => {  ''
            const renderStatisticsSpy = jest.spyOn(visualizer, 'renderStatistics');
            visualizer.renderCharts() }'
            expect(renderStatisticsSpy.toHaveBeenCalledWith(mockCanvasContext);' }'
        }');'
        test('should render alerts when anomalies exist', (') => {  ''
            const renderAlertsSpy = jest.spyOn(visualizer, 'renderAlerts');
            visualizer.renderCharts() }'
            expect(renderAlertsSpy.toHaveBeenCalledWith(mockCanvasContext);' }'
        }');'
    }''
    describe('Mouse Interaction', (') => { }'
        test('should handle mouse move events', (') => { }'
            const handleMouseMoveSpy = jest.spyOn(visualizer, 'handleMouseMove'};
            )
            // Simulate mouse move event)'
            const mouseMoveCallback = mockCanvas.addEventListener.mock.calls.find(')';
                call => call[0] === 'mousemove')[1];
            
            const mockEvent = { clientX: 100,
                clientY: 50 }
            },
            
            mockCanvas.getBoundingClientRect = jest.fn(() => ({ left: 10) }
                top: 10 }
    }),
            mouseMoveCallback(mockEvent);'
            expect(handleMouseMoveSpy.toHaveBeenCalledWith(90, 40);')');
        test('should handle mouse click events', (') => {  ''
            const handleMouseClickSpy = jest.spyOn(visualizer, 'handleMouseClick');
            // Simulate mouse click event'
            const mouseClickCallback = mockCanvas.addEventListener.mock.calls.find(')',
                call => call[0] === 'click')[1],
            
            const mockEvent = {
                clientX: 150 }
                clientY: 75 }
            },
            
            mockCanvas.getBoundingClientRect = jest.fn(() => ({ left: 10) }
                top: 10 }
    }),
            mouseClickCallback(mockEvent);'
            expect(handleMouseClickSpy.toHaveBeenCalledWith(140, 65);')');
        test('should handle wheel events for zoom', (') => {  ''
            const handleWheelSpy = jest.spyOn(visualizer, 'handleWheel');
            // Simulate wheel event'
            const wheelCallback = mockCanvas.addEventListener.mock.calls.find(')',
                call => call[0] === 'wheel')[1],
            
            const mockEvent = {
                preventDefault: jest.fn() }
                deltaY: 100 }
    ),
            wheelCallback(mockEvent);
            expect(mockEvent.preventDefault).toHaveBeenCalled();'
            expect(handleWheelSpy.toHaveBeenCalledWith(100);'}');
        test('should update hover point on mouse move', (') => {  ''
            const chart = visualizer.charts.get('fps');
            chart.isPointInChart = jest.fn(() => true),
            chart.getDataPointAt = jest.fn(() => ({ value: 55.5) }
                timestamp: Date.now(
                threshold: { warning: 45 }
        critical: 30  }
    } };
            visualizer.handleMouseMove(50, 100);'
            expect(visualizer.chartState.hoverPoint).toBeDefined();
            expect(visualizer.chartState.hoverPoint.metric').toBe('fps');'
            expect(visualizer.chartState.hoverPoint.value).toBe(55.5);'}');
        test('should select chart on click', (') => {  ''
            const chart = visualizer.charts.get('memory');
            chart.isPointInChart = jest.fn(() => true),'
            visualizer.handleMouseClick(50, 100);
            expect(visualizer.chartState.selectedMetric').toBe('memory'),'
            // Click again to deselect
            visualizer.handleMouseClick(50, 100),'
            expect(visualizer.chartState.selectedMetric).toBeNull(),')'),
        test('should handle zoom with wheel', () => {
            const initialZoom = visualizer.chartState.zoomLevel,
            const initialTimeWindow = visualizer.settings.timeWindow,
            // Zoom in
            visualizer.handleWheel(-100);
            expect(visualizer.chartState.zoomLevel).toBeGreaterThan(initialZoom);
            expect(visualizer.settings.timeWindow).toBeLessThan(initialTimeWindow);
            // Zoom out
            visualizer.handleWheel(100) }'
            expect(visualizer.chartState.zoomLevel).toBeLessThan(initialZoom * 1.1);' }'
        }');'
    }''
    describe('Settings and Configuration', (') => {  ''
        test('should update settings', () => {
            const newSettings = {
                updateInterval: 200,
                timeWindow: 60000 }
                chartHeight: 200 }
            },
            visualizer.updateSettings(newSettings);
            expect(visualizer.settings.updateInterval).toBe(200);
            expect(visualizer.settings.timeWindow).toBe(60000);'
            expect(visualizer.settings.chartHeight).toBe(200);'}');
        test('should update chart settings', (') => { }'
            const chart = visualizer.charts.get('fps'}');'
            const updateSettingsSpy = jest.spyOn(chart, 'updateSettings').mockImplementation(() => {}');'
            const newSettings = { colors: { fps: '#ff0000' } },
            visualizer.updateSettings(newSettings);'
            expect(updateSettingsSpy.toHaveBeenCalledWith(visualizer.settings);'}');
        test('should get status from value correctly', () => {  }'
            const threshold = { warning: 50, critical: 80 }';'
            expect(visualizer.getStatusFromValue(30, threshold)').toBe('normal');'
            expect(visualizer.getStatusFromValue(60, threshold)').toBe('warning');'
            expect(visualizer.getStatusFromValue(90, threshold)').toBe('critical');'
            expect(visualizer.getStatusFromValue(40, null)').toBe('normal');'}');'
    }''
    describe('Visibility Control', (') => {  ''
        test('should toggle visibility', () => {'
            // Initially hidden''
            expect(mockCanvas.style.display').toBe('none'),'
            // Show'
            visualizer.toggle();
            expect(mockCanvas.style.display').toBe('block'),'
            // Hide'
            visualizer.toggle(),' }'
            expect(mockCanvas.style.display').toBe('none'););' }'
        }');'
        test('should log visibility changes', () => {  ''
            visualizer.toggle(')',
            expect(consoleLogSpy.toHaveBeenCalledWith('[PerformanceVisualizer] Visualization shown');
            visualizer.toggle(') }'
            expect(consoleLogSpy.toHaveBeenCalledWith('[PerformanceVisualizer] Visualization hidden');' }'
        }');'
    }''
    describe('Screenshot Functionality', (') => {  ''
        test('should capture screenshot', (') => {'
            // Mock link element'
            const mockLink = {','
                download: ',',
                href: '}'
        click: jest.fn(); }
            };', ';
            document.createElement = jest.fn((tagName') => {  ''
                if (tagName === 'a') return mockLink,
                if (tagName === 'canvas') return mockCanvas,
                return originalCreateElement.call(document, tagName)),'
            visualizer.captureScreenshot();
            expect(mockCanvas.toDataURL').toHaveBeenCalledWith('image/png'),'
            expect(mockLink.download).toMatch(/^performance-\d+\.png$/);
            expect(mockLink.href').toBe('data:image/png')base64,mock-data' }'
            expect(mockLink.click).toHaveBeenCalled(); }'
        }');'
        test('should log screenshot capture', () => {  ''
            visualizer.captureScreenshot(') }'
            expect(consoleLogSpy.toHaveBeenCalledWith('[PerformanceVisualizer] Screenshot captured');' }'
        }');'
    }''
    describe('Error Handling', (') => { }'
        test('should handle missing monitor data gracefully', () => { }
            mockMonitor.getCurrentMetrics.mockReturnValueOnce({};
            expect(() => {  }'
                visualizer.updateCharts(});'}.not.toThrow(')'
        test('should handle missing history data gracefully', () => {  }
            mockMonitor.getHistoryData.mockReturnValueOnce({};
            expect(() => {  }'
                visualizer.updateCharts(});'}.not.toThrow(')'
        test('should handle canvas context errors gracefully', () => {  mockCanvas.getContext.mockReturnValueOnce(null) }
            expect(() => { }'
                new PerformanceVisualizer(mockMonitor as any};')'
            }.not.toThrow(')'
        test('should handle rendering errors gracefully', () => {  ''
            mockCanvasContext.fillRect.mockImplementationOnce((') => { }'
                throw new Error('Canvas error'); }
            };
            expect(() => {  }
                visualizer.renderCharts(});
            }.not.toThrow();'
        }'}');
    describe('Cleanup', (') => {  ''
        test('should stop animation on destroy', () => {
            visualizer.destroy() }
            expect(global.cancelAnimationFrame).toHaveBeenCalledWith(visualizer.animationId); }'
            expect(visualizer.animationId).toBeNull(};'}');
        test('should remove canvas from DOM', () => {  visualizer.destroy() }'
            expect(mockCanvas.parentNode.removeChild).toHaveBeenCalledWith(mockCanvas: any);' }'
        }');'
        test('should clear charts', () => {  const initialChartCount = visualizer.charts.size,
            expect(initialChartCount.toBeGreaterThan(0);
            visualizer.destroy() }'
            expect(visualizer.charts.size).toBe(0););' }'
        }');'
        test('should log destruction', () => {  ''
            visualizer.destroy(') }'
            expect(consoleLogSpy.toHaveBeenCalledWith('[PerformanceVisualizer] Destroyed');' }'
        }');'
    }''
    describe('Chart Classes', (') => {  ''
        test('should create PerformanceChart with correct config', (') => {''
            const chart = visualizer.charts.get('fps');
            expect(chart.config.name').toBe('FPS'),'
            expect(chart.config.color).toBe(visualizer.settings.colors.fps);
            expect(chart.config.minValue).toBe(0),'
            expect(chart.config.maxValue).toBe(120),' }'
            expect(chart.config.unit').toBe('fps'););' }'
        }');'
        test('should add data points to chart', (') => {  ''
            const chart = visualizer.charts.get('fps');
            const initialDataLength = chart.data.length,
            
            chart.addDataPoint({);
                timestamp: Date.now() }
                value: 55 }
                threshold: { warning: 45, critical: 30 }
            };
            expect(chart.data.length).toBe(initialDataLength + 1);'
            expect(chart.data[chart.data.length - 1].value).toBe(55);'}');
        test('should limit data points in chart', (') => { }'
            const chart = visualizer.charts.get('fps'};)
            chart.maxDataPoints = 3;)
            // Add more data than limit);
            for(let i = 0; i < 5; i++) {
                chart.addDataPoint({);
                    timestamp: Date.now() + i }
                    value: 50 + i }
                    threshold: {}
                } }
            expect(chart.data.length).toBe(3);'
            expect(chart.data[0].value).toBe(52); // First should be removed'}');
        test('should detect point in chart correctly', (') => {  ''
            const chart = visualizer.charts.get('fps');
            const pos = chart.config.position,
            expect(chart.isPointInChart(pos.x + 10, pos.y + 10).toBe(true);
            expect(chart.isPointInChart(pos.x - 10, pos.y - 10).toBe(false)) }
            expect(chart.isPointInChart(pos.x + pos.width + 10, pos.y + 10).toBe(false); }'
        }'}');
    describe('Heatmap Functionality', (') => {  ''
        test('should create PerformanceHeatmap', (') => {''
            const heatmap = visualizer.charts.get('heatmap');
            expect(heatmap.config.name').toBe('Performance Heatmap'),'
            expect(heatmap.heatmapData).toEqual([]) }'
            expect(heatmap.colorScale).toBeDefined();' }'
        }');'
        test('should calculate performance score correctly', (') => { }'
            const heatmap = visualizer.charts.get('heatmap'};
            )
            // Good performance)
            let score = heatmap.calculatePerformanceScore({ fps: 60) },
                memory: 0.2),
                frameTime: 16.67); }
            };
            expect(score.toBeLessThan(0.5);
            // Poor performance
            score = heatmap.calculatePerformanceScore({ fps: 15) }
                memory: 0.9),
                frameTime: 50),';'
            expect(score.toBeGreaterThan(0.5);' }'
        }');'
        test('should interpolate colors correctly', (') => {  ''
            const heatmap = visualizer.charts.get('heatmap');
            const greenColor = heatmap.interpolateColor(0);
            const redColor = heatmap.interpolateColor(1);
            const midColor = heatmap.interpolateColor(0.5);
            expect(greenColor).toEqual([0, 255, 0]);
            expect(redColor).toEqual([255, 0, 0]) }'
            expect(midColor[1]).toBeGreaterThan(0); // Should have some yellow' }'
        }');'
        test('should update heatmap data', (') => { }'
            const heatmap = visualizer.charts.get('heatmap'};)
            const initialLength = heatmap.heatmapData.length;)
            heatmap.updateHeatmap({ fps: 45) }
                memory: 0.6),
                frameTime: 25,
        timestamp: Date.now(); }
            };
            expect(heatmap.heatmapData.length).toBe(initialLength + 1);
        };'
    }'}');