/**
 * Performance Threshold Monitor Tests
 * PerformanceThresholdMonitor クラスのユニットテスト
 */
import { jest  } from '@jest/globals';
// DOM environment setup''
import { JSDOM  } from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
(global: any).document = dom.window.document;
(global: any).window = dom.window;'
// Mock Notification API''
(global as any').Notification = class MockNotification { ''
    static permission = 'granted',
    static requestPermission = jest.fn((') => Promise.resolve('granted'),
    constructor(title, options) {
        this.title = title,
        this.options = options,
        MockNotification.instances.push(this: any),
    ,'
    static instances = [],
    static reset(')',
jest.mock('../src/utils/ErrorHandler.js', () => ({ getErrorHandler: jest.fn(() => ({ }
    }
    }
        handleError: jest.fn(); }
    ))
));
// Mock monitor
const mockMonitor = { getCurrentMetrics: jest.fn(() => ({
        frame: { }
            currentFPS: 60,
            frameTime: 16.67);
           , fpsVariance: 2.0 }
    }),
        memory: { usedMemory: 80.5,
            pressureLevel: 0.4 }
    }),
        render: { drawCalls: 150 }
    }),
        game: { entityCount: 200 }'
        }'}') };'
// Import after mocking''
const { PerformanceThresholdMonitor } = await import('../../src/debug/PerformanceThresholdMonitor.js');
describe('PerformanceThresholdMonitor', () => {  let monitor: any,
    let consoleLogSpy: any,
    let consoleWarnSpy: any,',
    let consoleErrorSpy: any,',
    beforeEach((') => { }'
        // Console spies' }'
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation((') => {};
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation((') => {};
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {};
        // Reset mocks
        jest.clearAllMocks();
        jest.useFakeTimers();
        global.Notification.reset();
        // Create instance
        monitor = new PerformanceThresholdMonitor(mockMonitor: any);
    };
    afterEach(() => {  if (monitor) { }
            monitor.destroy(); }
        }
        // Restore console
        consoleLogSpy.mockRestore();
        consoleWarnSpy.mockRestore();'
        consoleErrorSpy.mockRestore();
        jest.useRealTimers(')';
    describe('Initialization', (') => {  ''
        test('should initialize with default values', () => {
            expect(monitor.monitor).toBe(mockMonitor),
            expect(monitor.thresholds).toBeInstanceOf(Map: any),
            expect(monitor.thresholds.size).toBeGreaterThan(0),'
            expect(monitor.monitoring.enabled).toBe(true),
            expect(monitor.monitoring.intervalId).toBeDefined(')',
        test('should setup default thresholds', (') => {''
            expect(monitor.thresholds.has('fps').toBe(true'),
            expect(monitor.thresholds.has('frameTime').toBe(true'),
            expect(monitor.thresholds.has('memory').toBe(true'),
            expect(monitor.thresholds.has('memoryPressure').toBe(true'),
            expect(monitor.thresholds.has('drawCalls').toBe(true'),
            expect(monitor.thresholds.has('entityCount').toBe(true),'),' }'
            expect(monitor.thresholds.has('frameVariance').toBe(true'); }'
        }''
        test('should have correct FPS threshold configuration', (') => {  ''
            const fpsThreshold = monitor.thresholds.get('fps'),
            expect(fpsThreshold.metric').toBe('frame.currentFPS'),
            expect(fpsThreshold.warning).toBe(45),
            expect(fpsThreshold.critical).toBe(30),'
            expect(fpsThreshold.evaluateBelow).toBe(true),' }'
            expect(fpsThreshold.unit').toBe('fps');'); }'
        };
        test('should have correct memory threshold configuration', (') => {  ''
            const memoryThreshold = monitor.thresholds.get('memory'),
            expect(memoryThreshold.metric').toBe('memory.usedMemory'),
            expect(memoryThreshold.warning).toBe(150),
            expect(memoryThreshold.critical).toBe(200),'
            expect(memoryThreshold.evaluateBelow).toBe(false),' }'
            expect(memoryThreshold.unit').toBe('MB');'); }'
        };
        test('should start monitoring automatically', () => {  expect(monitor.monitoring.intervalId).toBeDefined(),' }'
            expect(monitor.monitoring.enabled).toBe(true);'); }
        };'
    }''
    describe('Threshold Management', (') => {  ''
        test('should set custom threshold', (') => {'
            const customThreshold = {''
                metric: 'custom.metric',
                warning: 75,
                critical: 90,',
                evaluateBelow: false,',
                unit: '%',',
                description: 'Custom metric',' }'
                suggestions: ['Optimize custom metric'] }'
            };
            monitor.setThreshold('customMetric', customThreshold');
            expect(monitor.thresholds.has('customMetric').toBe(true');
            const stored = monitor.thresholds.get('customMetric');
            expect(stored.metric').toBe('custom.metric');'
            expect(stored.warning).toBe(75);
            expect(stored.critical).toBe(90');'
        };
        test('should get metric value correctly', (') => { const metrics = { }
                frame: { currentFPS: 45.5 },
                memory: { usedMemory: 120.3 }'
            };
            expect(monitor.getMetricValue(metrics, 'frame.currentFPS').toBe(45.5');
            expect(monitor.getMetricValue(metrics, 'memory.usedMemory').toBe(120.3');
            expect(monitor.getMetricValue(metrics, 'nonexistent.path').toBeNull(')';
        test('should handle invalid metric paths', (') => {  }'
            const metrics = { frame: { currentFPS: 60 } }';
            expect(monitor.getMetricValue(metrics, 'invalid.path').toBeNull(')';
            expect(monitor.getMetricValue(metrics, 'frame.invalid').toBeNull(')';
            expect(monitor.getMetricValue(metrics, ').toBe(metrics');
        };'
    }''
    describe('Threshold Evaluation', (') => {  ''
        test('should detect FPS warning', () => { }
            mockMonitor.getCurrentMetrics.mockReturnValueOnce({) }
                frame: { currentFPS: 40 }, // Below warning threshold (45);
                memory: { usedMemory: 50, pressureLevel: 0.2 },
                render: { drawCalls: 100 },
                game: { entityCount: 100 }
            },
            monitor.checkThresholds();
            expect(monitor.statistics.warningsTriggered).toBe(1);'
            expect(monitor.warningSystem.alertHistory.length).toBe(1);
            expect(monitor.warningSystem.alertHistory[0].name').toBe('fps');
            expect(monitor.warningSystem.alertHistory[0].severity').toBe('warning');'
        };
        test('should detect FPS critical alert', () => { mockMonitor.getCurrentMetrics.mockReturnValueOnce({) }
                frame: { currentFPS: 25 }, // Below critical threshold (30);
                memory: { usedMemory: 50, pressureLevel: 0.2 },
                render: { drawCalls: 100 },
                game: { entityCount: 100 }
            },
            monitor.checkThresholds();
            expect(monitor.statistics.criticalAlertsTriggered).toBe(1);'
            expect(monitor.warningSystem.alertHistory.length).toBe(1);
            expect(monitor.warningSystem.alertHistory[0].severity').toBe('critical');'
        };
        test('should detect memory warning', () => { mockMonitor.getCurrentMetrics.mockReturnValueOnce({) }
                frame: { currentFPS: 60, frameTime: 16.67, fpsVariance: 2.0 });
                memory: { usedMemory: 160, pressureLevel: 0.3 }, // Above warning threshold (150);
                render: { drawCalls: 100 },
                game: { entityCount: 100 }
            },
            monitor.checkThresholds();
            expect(monitor.statistics.warningsTriggered).toBe(1);'
            const alert = monitor.warningSystem.alertHistory[0];
            expect(alert.name').toBe('memory');
            expect(alert.severity').toBe('warning');
            expect(alert.value).toBe(160');'
        };
        test('should detect multiple threshold violations', () => { mockMonitor.getCurrentMetrics.mockReturnValueOnce({ }
                frame: { currentFPS: 35, frameTime: 25, fpsVariance: 2.0 }, // FPS warning, frameTime warning)
                memory: { usedMemory: 180, pressureLevel: 0.8 }, // Memory warning, pressure critical)
                render: { drawCalls: 400 }, // Draw calls warning)
                game: { entityCount: 600 } // Entity warning };
            monitor.checkThresholds();
            expect(monitor.statistics.warningsTriggered).toBeGreaterThan(1);'
            expect(monitor.statistics.criticalAlertsTriggered).toBeGreaterThanOrEqual(1);
            expect(monitor.warningSystem.alertHistory.length).toBeGreaterThan(1');'
        };
        test('should not trigger for values within normal range', () => { mockMonitor.getCurrentMetrics.mockReturnValueOnce({
            });
                frame: { currentFPS: 60, frameTime: 16.67, fpsVariance: 2.0 })
                memory: { usedMemory: 50, pressureLevel: 0.3
            });
                render: { drawCalls: 100 })
                game: { entityCount: 200 } };
            monitor.checkThresholds();
            expect(monitor.statistics.warningsTriggered).toBe(0);'
            expect(monitor.statistics.criticalAlertsTriggered).toBe(0);
            expect(monitor.warningSystem.alertHistory.length).toBe(0');
        };'
    }''
    describe('Alert Suppression', (') => {  ''
        test('should suppress repeated alerts', () => { }
            const lowFPSMetrics = { }
                frame: { currentFPS: 25, frameTime: 16.67, fpsVariance: 2.0 },
                memory: { usedMemory: 50, pressureLevel: 0.2 },
                render: { drawCalls: 100 },
                game: { entityCount: 100 }
            },
            mockMonitor.getCurrentMetrics.mockReturnValue(lowFPSMetrics);
            // First check - should trigger alert
            monitor.checkThresholds();
            expect(monitor.warningSystem.alertHistory.length).toBe(1);
            // Second check immediately - should be suppressed'
            monitor.checkThresholds();
            expect(monitor.warningSystem.alertHistory.length).toBe(1'); // No new alert'
        };
        test('should allow alerts after suppression period', () => { const lowFPSMetrics = { }
                frame: { currentFPS: 25, frameTime: 16.67, fpsVariance: 2.0 },
                memory: { usedMemory: 50, pressureLevel: 0.2 },
                render: { drawCalls: 100 },
                game: { entityCount: 100 }
            },
            mockMonitor.getCurrentMetrics.mockReturnValue(lowFPSMetrics);
            // First alert
            monitor.checkThresholds();
            expect(monitor.warningSystem.alertHistory.length).toBe(1);
            // Fast forward past suppression period
            jest.advanceTimersByTime(monitor.monitoring.criticalAlertTimeout + 1000);
            // Should allow new alert'
            monitor.checkThresholds();
            expect(monitor.warningSystem.alertHistory.length).toBe(2');'
        };
        test('should handle different suppression times for warning vs critical', () => { }'
            expect(monitor.monitoring.suppressionTimeout).toBeLessThan(monitor.monitoring.criticalAlertTimeout'); }
        };'
    }''
    describe('Notification System', (') => {  ''
        test('should create notification for alert', () => { }
            mockMonitor.getCurrentMetrics.mockReturnValueOnce({
            });
                frame: { currentFPS: 40, frameTime: 16.67, fpsVariance: 2.0 })
                memory: { usedMemory: 50, pressureLevel: 0.2
            });
                render: { drawCalls: 100 })
                game: { entityCount: 100 } };
            monitor.checkThresholds();
            expect(monitor.warningSystem.notifications.length).toBe(1);'
            const notification = monitor.warningSystem.notifications[0];
            expect(notification.title').toBe('Performance WARNING');
            expect(notification.severity').toBe('warning');
            expect(notification.actions).toHaveLength(2');'
        };
        test('should create browser notification when permission granted', (') => {  ''
            global.Notification.permission = 'granted' }
            mockMonitor.getCurrentMetrics.mockReturnValueOnce({
            });
                frame: { currentFPS: 25, frameTime: 16.67, fpsVariance: 2.0 })
                memory: { usedMemory: 50, pressureLevel: 0.2
            });
                render: { drawCalls: 100 })
                game: { entityCount: 100 } };
            monitor.checkThresholds();'
            expect(global.Notification.instances.length).toBe(1);
            expect(global.Notification.instances[0].title').toBe('Performance CRITICAL');'
        };
        test('should not create browser notification when permission denied', (') => {  ''
            global.Notification.permission = 'denied' }
            mockMonitor.getCurrentMetrics.mockReturnValueOnce({
            });
                frame: { currentFPS: 25, frameTime: 16.67, fpsVariance: 2.0 })
                memory: { usedMemory: 50, pressureLevel: 0.2
            });
                render: { drawCalls: 100 })
                game: { entityCount: 100 } };'
            monitor.checkThresholds();
            expect(global.Notification.instances.length).toBe(0');'
        };
        test('should limit notification count', () => {  monitor.warningSystem.maxNotifications = 2,
            
            // Create 3 alerts
            for (let i = 0, i < 3, i++) { }
                mockMonitor.getCurrentMetrics.mockReturnValueOnce({
            });
                    frame: { currentFPS: 40 - i, frameTime: 16.67, fpsVariance: 2.0 })
                    memory: { usedMemory: 50, pressureLevel: 0.2
            });
                    render: { drawCalls: 100 })
                    game: { entityCount: 100 } };
                monitor.checkThresholds();
                jest.advanceTimersByTime(monitor.monitoring.criticalAlertTimeout + 1000);'
            }''
            expect(monitor.warningSystem.notifications.length).toBe(2');
        };'
    }''
    describe('Suggestion Engine', (') => {  ''
        test('should generate suggestions for alerts', () => { }
            mockMonitor.getCurrentMetrics.mockReturnValueOnce({
            });
                frame: { currentFPS: 25, frameTime: 16.67, fpsVariance: 2.0 })
                memory: { usedMemory: 50, pressureLevel: 0.2
            });
                render: { drawCalls: 100 })
                game: { entityCount: 100 } };
            monitor.checkThresholds();
            expect(monitor.suggestionEngine.suggestions.size).toBeGreaterThan(0);
            expect(monitor.statistics.suggestionsGenerated).toBeGreaterThan(0);
            const suggestions = monitor.getCurrentSuggestions();'
            expect(suggestions.length).toBeGreaterThan(0);
            expect(suggestions[0].priority').toBe('high'); // Critical alert should generate high priority suggestions'
        };
        test('should categorize suggestions correctly', (') => { const categories = [ ' }'
                { suggestion: 'Reduce particle effects quality', expected: 'effects' },''
                { suggestion: 'Optimize rendering pipeline', expected: 'rendering' },''
                { suggestion: 'Clear unused object references', expected: 'memory' },']
                { suggestion: 'Implement entity culling', expected: 'entities' },']'
                { suggestion: 'Improve overall performance', expected: 'performance' }]
            ];
            categories.forEach(({ suggestion, expected ) => { '
                const category = monitor.categorizeSuggestion(suggestion),' }'
                expect(category).toBe(expected);'); }
            };'
        }''
        test('should handle suggestion cooldown', () => { mockMonitor.getCurrentMetrics.mockReturnValue({
            });
                frame: { currentFPS: 25, frameTime: 16.67, fpsVariance: 2.0 })
                memory: { usedMemory: 50, pressureLevel: 0.2
            });
                render: { drawCalls: 100 })
                game: { entityCount: 100 } };
            // First check
            monitor.checkThresholds();
            const initialSuggestionCount = monitor.suggestionEngine.suggestions.size;
            // Immediate second check - should not add duplicate suggestions due to cooldown
            jest.advanceTimersByTime(monitor.monitoring.criticalAlertTimeout + 1000);
            monitor.checkThresholds();'
            // Should not have significantly more suggestions due to cooldown''
            expect(monitor.suggestionEngine.suggestions.size).toBeLessThanOrEqual(initialSuggestionCount + 1');'
        };
        test('should limit suggestion count', () => {  monitor.suggestionEngine.maxSuggestions = 3,
            
            // Generate many alerts to exceed suggestion limit
            for (let i = 0, i < 10, i++) { }
                mockMonitor.getCurrentMetrics.mockReturnValueOnce({
            });
                    frame: { currentFPS: 20 + i, frameTime: 30 + i, fpsVariance: 15 })
                    memory: { usedMemory: 160 + i * 10, pressureLevel: 0.8
            });
                    render: { drawCalls: 400 + i * 10 })
        game: { entityCount: 600 + i * 10 } });
                }
                monitor.checkThresholds();
                jest.advanceTimersByTime(monitor.monitoring.criticalAlertTimeout + monitor.suggestionEngine.cooldownPeriod + 1000);'
            }''
            expect(monitor.suggestionEngine.suggestions.size).toBeLessThanOrEqual(3');
        };'
    }''
    describe('Auto Recovery', (') => { }'
        test('should attempt FPS recovery for critical FPS alert', (') => { }'
            const attemptAutoRecoverySpy = jest.spyOn(monitor, 'attemptAutoRecovery'};
            
            mockMonitor.getCurrentMetrics.mockReturnValueOnce({)
                frame: { currentFPS: 20, frameTime: 16.67, fpsVariance: 2.0 }, // Critical FPS)
                memory: { usedMemory: 50, pressureLevel: 0.2
            });
                render: { drawCalls: 100 })
                game: { entityCount: 100 } };
            monitor.checkThresholds();
            expect(attemptAutoRecoverySpy.toHaveBeenCalled();'
            const alert = monitor.warningSystem.alertHistory[0];
            expect(alert.severity').toBe('critical');'
        };
        test('should attempt memory recovery for critical memory alert', () => {  // Mock window.gc for memory recovery test
            global.window.gc = jest.fn() as jest.Mock }
            mockMonitor.getCurrentMetrics.mockReturnValueOnce({
            });
                frame: { currentFPS: 60, frameTime: 16.67, fpsVariance: 2.0
            });
                memory: { usedMemory: 250, pressureLevel: 0.2 }, // Critical memory
                render: { drawCalls: 100 })
                game: { entityCount: 100 } };'
            monitor.checkThresholds();
            expect(global.window.gc).toHaveBeenCalled(')';
        test('should handle auto recovery errors gracefully', () => {  ''
            global.window.gc = jest.fn((') => {''
                throw new Error('GC failed')),
            mockMonitor.getCurrentMetrics.mockReturnValueOnce({) }
                frame: { currentFPS: 60, frameTime: 16.67, fpsVariance: 2.0 ) }
                memory: { usedMemory: 250, pressureLevel: 0.2 },
                render: { drawCalls: 100 },
                game: { entityCount: 100 }
            },
            expect(() => {  }
                monitor.checkThresholds(});'
            }).not.toThrow();
            expect(consoleErrorSpy.toHaveBeenCalled(')';
    describe('Alert Management', (') => {  ''
        test('should acknowledge alerts', () => { }
            mockMonitor.getCurrentMetrics.mockReturnValueOnce({
            });
                frame: { currentFPS: 40, frameTime: 16.67, fpsVariance: 2.0 })
                memory: { usedMemory: 50, pressureLevel: 0.2
            });
                render: { drawCalls: 100 })
                game: { entityCount: 100 } };
            monitor.checkThresholds();
            const alert = monitor.warningSystem.alertHistory[0];
            expect(alert.acknowledged).toBe(false);'
            monitor.acknowledgeAlert(alert.id);
            expect(alert.acknowledged).toBe(true');'
        };
        test('should show alert details', () => { mockMonitor.getCurrentMetrics.mockReturnValueOnce({
            });
                frame: { currentFPS: 40, frameTime: 16.67, fpsVariance: 2.0 })
                memory: { usedMemory: 50, pressureLevel: 0.2
            });
                render: { drawCalls: 100 })
                game: { entityCount: 100 }),'
            };
            monitor.checkThresholds(')';
            const showAlertDetailsSpy = jest.spyOn(monitor, 'showAlertDetails');
            monitor.showAlertDetails(alert);'
            expect(showAlertDetailsSpy.toHaveBeenCalledWith(alert);
            expect(consoleLogSpy').toHaveBeenCalledWith(';
                '[PerformanceThresholdMonitor] Alert Details:')
                expect.objectContaining({ name: alert.name)
                    description: alert.description),
                   , value: alert.value)',
                    severity: alert.severity),', ') }'
        };
        test('should cleanup old notifications', () => {  ''
            const oldTime = Date.now(')',
                id: 'old1')',
               , timestamp: oldTime,') }'
                persistent: false'); }
            };'
            monitor.warningSystem.notifications.push({ ')'
                id: 'old2')',
               , timestamp: oldTime,')',
                persistent: true // Should not be cleaned up)'),',
            monitor.warningSystem.notifications.push({')'
                id: 'recent',
                timestamp: Date.now(
                persistent: false }
            },'
            monitor.cleanupOldNotifications(Date.now();
            expect(monitor.warningSystem.notifications.length).toBe(2');
            expect(monitor.warningSystem.notifications.find(n => n.id === 'old1').toBeUndefined(')';
            expect(monitor.warningSystem.notifications.find(n => n.id === 'old2').toBeDefined(')';
            expect(monitor.warningSystem.notifications.find(n => n.id === 'recent').toBeDefined(')';
    describe('Public API', (') => {  ''
        test('should get current alerts', () => { }
            mockMonitor.getCurrentMetrics.mockReturnValueOnce({
            });
                frame: { currentFPS: 40, frameTime: 16.67, fpsVariance: 2.0 })
                memory: { usedMemory: 50, pressureLevel: 0.2
            });
                render: { drawCalls: 100 })
                game: { entityCount: 100 } };
            monitor.checkThresholds();
            const currentAlerts = monitor.getCurrentAlerts();'
            expect(currentAlerts.length).toBe(1);
            expect(currentAlerts[0].severity').toBe('warning');'
        };
        test('should get all alerts', () => { mockMonitor.getCurrentMetrics.mockReturnValueOnce({
            });
                frame: { currentFPS: 40, frameTime: 16.67, fpsVariance: 2.0 })
                memory: { usedMemory: 50, pressureLevel: 0.2
            });
                render: { drawCalls: 100 })
                game: { entityCount: 100 } };
            monitor.checkThresholds();'
            const allAlerts = monitor.getAllAlerts();
            expect(allAlerts.length).toBe(1');'
        };
        test('should get current suggestions sorted by priority', () => { mockMonitor.getCurrentMetrics.mockReturnValueOnce({
            });
                frame: { currentFPS: 25, frameTime: 25, fpsVariance: 2.0 }, // Critical and warning)
                memory: { usedMemory: 50, pressureLevel: 0.2
            });
                render: { drawCalls: 100 })
                game: { entityCount: 100 } };
            monitor.checkThresholds();
            const suggestions = monitor.getCurrentSuggestions();
            expect(suggestions.length).toBeGreaterThan(0);
            // Should be sorted by priority (high first);
            for(let i = 0; i < suggestions.length - 1; i++) {
    
}
                const currentPriority = { high: 3, medium: 2, low: 1 }[suggestions[i].priority];'
                const nextPriority = { high: 3, medium: 2, low: 1 }[suggestions[i + 1].priority];
                expect(currentPriority.toBeGreaterThanOrEqual(nextPriority');
            }'
        };
        test('should get threshold configuration', () => {  const config = monitor.getThresholdConfiguration(),
            expect(config.fps).toBeDefined(),
            expect(config.fps.warning).toBe(45),
            expect(config.fps.critical).toBe(30),'
            expect(config.memory).toBeDefined(),' }'
            expect(config.memory.warning).toBe(150);'); }'
        };
        test('should get statistics', () => {  const stats = monitor.getStatistics(),
            expect(stats.totalChecks).toBeDefined(),
            expect(stats.warningsTriggered).toBeDefined(),
            expect(stats.criticalAlertsTriggered).toBeDefined(),
            expect(stats.suggestionsGenerated).toBeDefined(),'
            expect(stats.monitoring).toBeDefined(),' }'
            expect(stats.monitoring.enabled).toBe(true);'); }
        };'
    }''
    describe('Settings and Control', (') => {  ''
        test('should update settings', () => {
            const newSettings = {
                checkInterval: 2000,
                suppressionTimeout: 10000 }
                maxNotifications: 20 }
            },
            monitor.updateSettings(newSettings);
            expect(monitor.monitoring.checkInterval).toBe(2000);'
            expect(monitor.monitoring.suppressionTimeout).toBe(10000);
            expect(monitor.warningSystem.maxNotifications).toBe(20');'
        };
        test('should stop and start monitoring', () => {  expect(monitor.monitoring.intervalId).toBeDefined(),
            monitor.stopMonitoring(),
            expect(monitor.monitoring.intervalId).toBeNull(),'
            monitor.startMonitoring(),
            expect(monitor.monitoring.intervalId).toBeDefined(')',
        test('should reset all data', () => {
            // Add some data first }
            mockMonitor.getCurrentMetrics.mockReturnValueOnce({
            });
                frame: { currentFPS: 40, frameTime: 16.67, fpsVariance: 2.0 })
                memory: { usedMemory: 50, pressureLevel: 0.2
            });
                render: { drawCalls: 100 })
                game: { entityCount: 100 } };
            monitor.checkThresholds();
            expect(monitor.warningSystem.alertHistory.length).toBeGreaterThan(0);
            expect(monitor.statistics.warningsTriggered).toBeGreaterThan(0);
            monitor.reset();
            expect(monitor.warningSystem.notifications.length).toBe(0);
            expect(monitor.warningSystem.alertHistory.length).toBe(0);'
            expect(monitor.statistics.totalChecks).toBe(0);
            expect(monitor.statistics.warningsTriggered).toBe(0');
        };'
    }''
    describe('Error Handling', (') => {  ''
        test('should handle metrics collection errors', () => {''
            mockMonitor.getCurrentMetrics.mockImplementationOnce((') => { }'
                throw new Error('Metrics error'); }
            };
            expect(() => {  }
                monitor.checkThresholds(});
            }).not.toThrow();'
            expect(monitor.errorHandler.handleError).toHaveBeenCalledWith();
                expect.any(Error'),';
                'PerformanceThresholdMonitor.checkThresholds'';
            ');'
        };
        test('should handle missing metrics gracefully', () => {  }
            mockMonitor.getCurrentMetrics.mockReturnValueOnce({};)
            expect(() => {  }
                monitor.checkThresholds(});'
            }).not.toThrow();
            expect(monitor.statistics.totalChecks).toBe(1');'
        };
        test('should handle invalid metric values', (') => { mockMonitor.getCurrentMetrics.mockReturnValueOnce({ }')
                frame: { currentFPS: null },')'
                memory: { usedMemory: 'invalid'
            });
                render: { drawCalls: undefined })
        game: { entityCount: NaN } });
            }
            expect(() => {  }'
                monitor.checkThresholds(});'}).not.toThrow(')'
    describe('Cleanup', (') => {  ''
        test('should destroy cleanly', (') => {''
            const stopMonitoringSpy = jest.spyOn(monitor, 'stopMonitoring'),
            const resetSpy = jest.spyOn(monitor, 'reset'),
            monitor.destroy(),'
            expect(stopMonitoringSpy.toHaveBeenCalled(),
            expect(resetSpy.toHaveBeenCalled(')',
        test('should log destruction', () => {''
            monitor.destroy(') }'
            expect(consoleLogSpy.toHaveBeenCalledWith('[PerformanceThresholdMonitor] Destroyed'); }
        };'
    }'};