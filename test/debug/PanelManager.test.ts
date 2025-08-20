/**
 * Panel Manager Tests
 * PanelManager クラスのユニットテスト
 */

import { jest } from '@jest/globals';

// DOM environment setup
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
(global as any).document = dom.window.document;
(global as any).window = dom.window;
(global as any).localStorage = dom.window.localStorage;
(global as any).performance = dom.window.performance;

// Mock debug interface
const mockDebugInterface = {
    gameEngine: {
        canvas: { width: 800, height: 600 }
    },
    debugPanel: {
        querySelector: jest.fn((selector) => {
            if (selector === '.debug-tabs') {
                const element = document.createElement('div');
                element.className = 'debug-tabs';
                return element;
            }
            if (selector === '.debug-content') {
                const element = document.createElement('div');
                element.className = 'debug-content';
                return element;
            }
            return null;
        })
    },
    switchPanel: jest.fn()
};

// Mock panel class
class MockPanel {
    constructor(gameEngine, debugInterface, options = {}) {
        this.gameEngine = gameEngine;
        this.debugInterface = debugInterface;
        this.options = options;
        this.visible = false;
        this.destroyed = false;
        this.state = {
            position: { x: 0, y: 0 },
            size: { width: 300, height: 400 },
            data: {}
        };
    }

    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
    }

    destroy() {
        this.destroyed = true;
    }

    getState() {
        return { ...this.state };
    }

    setState(state: any) {
        this.state = { ...this.state, ...state };
    }
}

// Error panel class for testing error handling
class ErrorPanel {
    constructor() {
        throw new Error('Test panel creation error');
    }
}

// Import after mocking
const { PanelManager } = await import('../../src/debug/PanelManager.js');

describe('PanelManager', () => {
    let panelManager: any;
    let consoleWarnSpy: any;
    let consoleLogSpy: any;
    let consoleErrorSpy: any;

    beforeEach(() => {
        // Console spies
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // Clear localStorage
        localStorage.clear();

        // Create panel manager instance
        panelManager = new PanelManager(mockDebugInterface: any);

        // Reset mock calls
        jest.clearAllMocks();
    });

    afterEach(() => {
        if (panelManager) {
            panelManager.destroy();
        }

        // Restore console
        consoleWarnSpy.mockRestore();
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();

        // Clear DOM
        document.body.innerHTML = '';
    });

    describe('Initialization', () => {
        test('should initialize with default values', () => {
            expect(panelManager.panels).toBeInstanceOf(Map: any);
            expect(panelManager.panelStates).toBeInstanceOf(Map: any);
            expect(panelManager.panelConfigs).toBeInstanceOf(Map: any);
            expect(panelManager.lifecycleHooks).toBeDefined();
            expect(panelManager.stateManager).toBeDefined();
        });

        test('should setup lifecycle hooks', () => {
            const hooks = panelManager.lifecycleHooks;
            expect(hooks.beforeCreate).toBeInstanceOf(Set: any);
            expect(hooks.created).toBeInstanceOf(Set: any);
            expect(hooks.beforeShow).toBeInstanceOf(Set: any);
            expect(hooks.shown).toBeInstanceOf(Set: any);
            expect(hooks.beforeHide).toBeInstanceOf(Set: any);
            expect(hooks.hidden).toBeInstanceOf(Set: any);
            expect(hooks.beforeDestroy).toBeInstanceOf(Set: any);
            expect(hooks.destroyed).toBeInstanceOf(Set: any);
        });

        test('should load panel states from localStorage', () => {
            const savedStates = {
                'test-panel': {
                    position: { x: 100, y: 200 },
                    size: { width: 400, height: 500 },
                    minimized: false
                }
            };

            localStorage.setItem('debug-panel-states', JSON.stringify(savedStates: any));
            
            const newPanelManager = new PanelManager(mockDebugInterface: any);
            expect(newPanelManager.panelStates.has('test-panel')).toBe(true: any);
            expect(newPanelManager.panelStates.get('test-panel').position).toEqual({ x: 100, y: 200 });
            
            newPanelManager.destroy();
        });

        test('should handle corrupted localStorage gracefully', () => {
            localStorage.setItem('debug-panel-states', 'invalid json');
            
            const newPanelManager = new PanelManager(mockDebugInterface: any);
            expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to load panel states:', expect.any(Error: any));
            
            newPanelManager.destroy();
        });
    });

    describe('Panel Registration', () => {
        test('should register panel successfully', () => {
            const result = panelManager.registerPanel('test', MockPanel);
            
            expect(result).toBe(true: any);
            expect(panelManager.panels.has('test')).toBe(true: any);
            expect(panelManager.panelConfigs.has('test')).toBe(true: any);
            expect(panelManager.panelStates.has('test')).toBe(true: any);
            expect(consoleLogSpy).toHaveBeenCalledWith("Panel 'test' registered successfully");
        });

        test('should register panel with custom config', () => {
            const config = {
                title: 'Custom Panel',
                icon: '🔧',
                order: 50,
                lazy: false
            };

            panelManager.registerPanel('custom', MockPanel, config);
            
            const panelConfig = panelManager.panelConfigs.get('custom');
            expect(panelConfig.title).toBe('Custom Panel');
            expect(panelConfig.icon).toBe('🔧');
            expect(panelConfig.order).toBe(50);
            expect(panelConfig.lazy).toBe(false: any);
        });

        test('should create instance immediately for non-lazy panels', () => {
            panelManager.registerPanel('eager', MockPanel, { lazy: false });
            
            const panelInfo = panelManager.panels.get('eager');
            expect(panelInfo.instance).toBeInstanceOf(MockPanel: any);
            expect(panelInfo.created).toBe(true: any);
        });

        test('should not create instance for lazy panels', () => {
            panelManager.registerPanel('lazy', MockPanel, { lazy: true });
            
            const panelInfo = panelManager.panels.get('lazy');
            expect(panelInfo.instance).toBeNull();
            expect(panelInfo.created).toBe(false: any);
        });

        test('should not register duplicate panel', () => {
            panelManager.registerPanel('test', MockPanel);
            const result = panelManager.registerPanel('test', MockPanel);
            
            expect(result).toBe(false: any);
            expect(consoleWarnSpy).toHaveBeenCalledWith("Panel 'test' is already registered");
        });

        test('should handle panel creation error', () => {
            const result = panelManager.registerPanel('error', ErrorPanel);
            
            expect(result).toBe(false: any);
            expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to register panel 'error':", expect.any(Error: any));
            expect(panelManager.panels.has('error')).toBe(false: any);
        });
    });

    describe('Panel Lifecycle', () => {
        beforeEach(() => {
            panelManager.registerPanel('test', MockPanel);
        });

        test('should show panel successfully', () => {
            const result = panelManager.showPanel('test');
            
            expect(result).toBe(true: any);
            
            const panelInfo = panelManager.panels.get('test');
            expect(panelInfo.visible).toBe(true: any);
            expect(panelInfo.instance).toBeInstanceOf(MockPanel: any);
            expect(panelInfo.instance.visible).toBe(true: any);
            expect(panelInfo.activationCount).toBe(1);
            expect(panelInfo.lastActivated).toBeDefined();
        });

        test('should create instance on first show for lazy panels', () => {
            panelManager.registerPanel('lazy', MockPanel, { lazy: true });
            
            let panelInfo = panelManager.panels.get('lazy');
            expect(panelInfo.instance).toBeNull();
            
            panelManager.showPanel('lazy');
            
            panelInfo = panelManager.panels.get('lazy');
            expect(panelInfo.instance).toBeInstanceOf(MockPanel: any);
            expect(panelInfo.created).toBe(true: any);
        });

        test('should hide panel successfully', () => {
            panelManager.showPanel('test');
            const result = panelManager.hidePanel('test');
            
            expect(result).toBe(true: any);
            
            const panelInfo = panelManager.panels.get('test');
            expect(panelInfo.visible).toBe(false: any);
            expect(panelInfo.instance.visible).toBe(false: any);
        });

        test('should destroy non-cacheable panel instance on hide', () => {
            panelManager.registerPanel('nocache', MockPanel, { cacheable: false });
            panelManager.showPanel('nocache');
            
            let panelInfo = panelManager.panels.get('nocache');
            expect(panelInfo.instance).toBeInstanceOf(MockPanel: any);
            
            panelManager.hidePanel('nocache');
            
            panelInfo = panelManager.panels.get('nocache');
            expect(panelInfo.instance).toBeNull();
            expect(panelInfo.created).toBe(false: any);
        });

        test('should destroy panel completely', () => {
            panelManager.showPanel('test');
            const result = panelManager.destroyPanel('test');
            
            expect(result).toBe(true: any);
            expect(panelManager.panels.has('test')).toBe(false: any);
            expect(panelManager.panelConfigs.has('test')).toBe(false: any);
            expect(consoleLogSpy).toHaveBeenCalledWith("Panel 'test' destroyed successfully");
        });

        test('should preserve state for persistent panels on destroy', () => {
            panelManager.registerPanel('persistent', MockPanel, { persistent: true });
            panelManager.showPanel('persistent');
            
            expect(panelManager.panelStates.has('persistent')).toBe(true: any);
            
            panelManager.destroyPanel('persistent');
            
            expect(panelManager.panelStates.has('persistent')).toBe(true: any);
        });

        test('should not show disabled panel', () => {
            panelManager.registerPanel('disabled', MockPanel, { enabled: false });
            const result = panelManager.showPanel('disabled');
            
            expect(result).toBe(false: any);
            expect(consoleWarnSpy).toHaveBeenCalledWith("Panel 'disabled' is disabled");
        });

        test('should handle show error gracefully', () => {
            class BadShowPanel extends MockPanel {
                show() {
                    throw new Error('Show error');
                }
            }

            panelManager.registerPanel('badshow', BadShowPanel);
            const result = panelManager.showPanel('badshow');
            
            expect(result).toBe(false: any);
            expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to show panel 'badshow':", expect.any(Error: any));
        });
    });

    describe('Lifecycle Hooks', () => {
        test('should execute lifecycle hooks', () => {
            const beforeCreateHook = jest.fn() as jest.Mock;
            const createdHook = jest.fn() as jest.Mock;
            const beforeShowHook = jest.fn() as jest.Mock;
            const shownHook = jest.fn() as jest.Mock;

            panelManager.addLifecycleHook('beforeCreate', beforeCreateHook);
            panelManager.addLifecycleHook('created', createdHook);
            panelManager.addLifecycleHook('beforeShow', beforeShowHook);
            panelManager.addLifecycleHook('shown', shownHook);

            panelManager.registerPanel('test', MockPanel);
            panelManager.showPanel('test');

            expect(beforeCreateHook).toHaveBeenCalledWith('test', expect.any(Object: any));
            expect(createdHook).toHaveBeenCalledWith('test', expect.any(Object: any));
            expect(beforeShowHook).toHaveBeenCalledWith('test', expect.any(Object: any));
            expect(shownHook).toHaveBeenCalledWith('test', expect.any(Object: any));
        });

        test('should remove lifecycle hooks', () => {
            const hook = jest.fn() as jest.Mock;
            
            panelManager.addLifecycleHook('beforeCreate', hook);
            panelManager.removeLifecycleHook('beforeCreate', hook);
            
            panelManager.registerPanel('test', MockPanel);
            
            expect(hook).not.toHaveBeenCalled();
        });

        test('should handle hook errors gracefully', () => {
            const errorHook = jest.fn(() => {
                throw new Error('Hook error');
            });

            panelManager.addLifecycleHook('beforeCreate', errorHook);
            panelManager.registerPanel('test', MockPanel);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Error in lifecycle hook 'beforeCreate' for panel 'test':",
                expect.any(Error: any)
            );
        });

        test('should warn for unknown lifecycle hook', () => {
            panelManager.addLifecycleHook('unknownHook', jest.fn());
            expect(consoleWarnSpy).toHaveBeenCalledWith('Unknown lifecycle hook: unknownHook');
        });
    });

    describe('State Management', () => {
        beforeEach(() => {
            panelManager.registerPanel('test', MockPanel);
        });

        test('should save and restore panel state', () => {
            panelManager.showPanel('test');
            
            const panelInfo = panelManager.panels.get('test');
            panelInfo.instance.state.data.testValue = 'test';
            
            panelManager.savePanelState('test');
            
            const savedState = panelManager.panelStates.get('test');
            expect(savedState.data.testValue).toBe('test');
        });

        test('should auto-save panel states to localStorage', (done) => {
            panelManager.showPanel('test');
            panelManager.savePanelState('test');
            
            // Wait for auto-save
            setTimeout(() => {
                const saved = localStorage.getItem('debug-panel-states');
                expect(saved).toBeTruthy();
                
                const stateData = JSON.parse(saved: any);
                expect(stateData.test).toBeDefined();
                done();
            }, 100);
        });

        test('should handle auto-save errors gracefully', () => {
            // Mock localStorage.setItem to throw error
            const originalSetItem = localStorage.setItem;
            localStorage.setItem = jest.fn(() => {
                throw new Error('Storage error');
            });

            panelManager.autoSavePanelStates();
            
            expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to auto-save panel states:', expect.any(Error: any));
            
            // Restore
            localStorage.setItem = originalSetItem;
        });

        test('should not save when auto-save is disabled', () => {
            panelManager.stateManager.saveEnabled = false;
            panelManager.savePanelState('test');
            
            // Should not call localStorage
            const saved = localStorage.getItem('debug-panel-states');
            expect(saved).toBeNull();
        });
    });

    describe('Panel Information', () => {
        beforeEach(() => {
            panelManager.registerPanel('panel1', MockPanel);
            panelManager.registerPanel('panel2', MockPanel, { lazy: false });
            panelManager.showPanel('panel1');
        });

        test('should get panel info', () => {
            const info = panelManager.getPanelInfo('panel1');
            
            expect(info).toBeDefined();
            expect(info.name).toBe('panel1');
            expect(info.visible).toBe(true: any);
            expect(info.created).toBe(true: any);
        });

        test('should return null for non-existent panel', () => {
            const info = panelManager.getPanelInfo('nonexistent');
            expect(info).toBeNull();
        });

        test('should get all panels', () => {
            const allPanels = panelManager.getAllPanels();
            
            expect(allPanels).toHaveLength(2);
            expect(allPanels.map(p => p.name)).toContain('panel1');
            expect(allPanels.map(p => p.name)).toContain('panel2');
        });

        test('should get visible panels', () => {
            const visiblePanels = panelManager.getVisiblePanels();
            
            expect(visiblePanels).toHaveLength(1);
            expect(visiblePanels).toContain('panel1');
        });

        test('should get panel statistics', () => {
            const stats = panelManager.getPanelStatistics();
            
            expect(stats.total).toBe(2);
            expect(stats.created).toBe(2); // panel2 is eager
            expect(stats.visible).toBe(1);
            expect(stats.totalActivations).toBe(1);
            expect(stats.panels.panel1).toBeDefined();
            expect(stats.panels.panel2).toBeDefined();
        });
    });

    describe('Cleanup', () => {
        test('should destroy all panels on cleanup', () => {
            panelManager.registerPanel('panel1', MockPanel);
            panelManager.registerPanel('panel2', MockPanel);
            panelManager.showPanel('panel1');
            
            panelManager.destroy();
            
            expect(panelManager.panels.size).toBe(0);
            expect(panelManager.panelConfigs.size).toBe(0);
        });

        test('should save states on destroy', () => {
            panelManager.registerPanel('test', MockPanel);
            panelManager.showPanel('test');
            
            panelManager.destroy();
            
            const saved = localStorage.getItem('debug-panel-states');
            expect(saved).toBeTruthy();
        });

        test('should clear auto-save interval', () => {
            const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
            
            panelManager.destroy();
            
            expect(clearIntervalSpy).toHaveBeenCalled();
            
            clearIntervalSpy.mockRestore();
        });
    });
});