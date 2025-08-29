/**
 * Enhanced Debug Interface Tests
 * EnhancedDebugInterface クラスのユニットテスト
 */

import { jest } from '@jest/globals';

// DOM environment setup
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.localStorage = dom.window.localStorage;
global.performance = dom.window.performance;
global.requestAnimationFrame = dom.window.requestAnimationFrame;

// Mock GameEngine
const mockGameEngine = {
    canvas: { width: 800, height: 600 },
    performanceOptimizer: {
        getCurrentFPS: jest.fn(() => 60),
        getAverageRenderTime: jest.fn(() => 16.67)
    },
    enhancedParticleManager: {
        getActiveParticleCount: jest.fn(() => 150),
        setParticleMultiplier: jest.fn(),
        setEnabled: jest.fn(),
        clearAllParticles: jest.fn(),
        createBubbleDestructionEffect: jest.fn(),
        createComboEffect: jest.fn()
    },
    enhancedEffectManager: {
        getActiveEffectCount: jest.fn(() => 5),
        setEffectIntensity: jest.fn(),
        setEnabled: jest.fn(),
        clearAllEffects: jest.fn(),
        screenFlash: jest.fn(),
        screenShake: jest.fn()
    },
    effectQualityController: {
        getCurrentQualityLevel: jest.fn(() => 'high'),
        setQualityLevel: jest.fn()
    },
    animationManager: {
        setEnabled: jest.fn(),
        clearAllAnimations: jest.fn()
    },
    seasonalEffectManager: {
        setEnabled: jest.fn()
    }
};

// Import after mocking
const { EnhancedDebugInterface } = await import('../../src/debug/EnhancedDebugInterface.js');

describe('EnhancedDebugInterface', () => {
    let debugInterface;
    let consoleWarnSpy;
    let consoleLogSpy;
    let consoleErrorSpy;

    beforeEach(() => {
        // Console spies
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // Clear DOM
        document.body.innerHTML = '';
        
        // Clear localStorage
        localStorage.clear();

        // Create instance
        debugInterface = new EnhancedDebugInterface(mockGameEngine);
    });

    afterEach(() => {
        if (debugInterface) {
            debugInterface.destroy();
        }
        
        // Restore console
        consoleWarnSpy.mockRestore();
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
        
        // Clear DOM
        document.body.innerHTML = '';
        document.head.innerHTML = '';
    });

    describe('Initialization', () => {
        test('should initialize with default values', () => {
            expect(debugInterface.panels).toBeInstanceOf(Map);
            expect(debugInterface.activePanel).toBe('overview');
            expect(debugInterface.panelHistory).toEqual([]);
            expect(debugInterface.layout).toBe('docked');
            expect(debugInterface.shortcuts).toBeInstanceOf(Map);
            expect(debugInterface.sessionId).toBeDefined();
            expect(debugInterface.sessionStartTime).toBeDefined();
        });

        test('should create enhanced debug panel in DOM', () => {
            const panel = document.getElementById('enhanced-debug-panel');
            expect(panel).toBeTruthy();
            expect(panel.className).toBe('enhanced-debug-panel');
        });

        test('should add debug styles to head', () => {
            const styles = document.getElementById('enhanced-debug-styles');
            expect(styles).toBeTruthy();
            expect(styles.tagName).toBe('STYLE');
        });

        test('should generate unique session ID', () => {
            const debugInterface2 = new EnhancedDebugInterface(mockGameEngine);
            expect(debugInterface.sessionId).not.toBe(debugInterface2.sessionId);
            debugInterface2.destroy();
        });

        test('should setup default shortcuts', () => {
            expect(debugInterface.shortcuts.size).toBeGreaterThan(0);
            expect(debugInterface.shortcuts.has('ctrl+shift+d')).toBe(true);
            expect(debugInterface.shortcuts.has('escape')).toBe(true);
        });
    });

    describe('Panel Management', () => {
        // Mock panel class
        class MockPanel {
            constructor(gameEngine, debugInterface) {
                this.gameEngine = gameEngine;
                this.debugInterface = debugInterface;
                this.activated = false;
            }
            
            getDisplayName() {
                return 'Mock Panel';
            }
            
            activate() {
                this.activated = true;
            }
            
            destroy() {
                // Mock cleanup
            }
        }

        test('should register new panel successfully', () => {
            const result = debugInterface.registerPanel('mock', MockPanel);
            expect(result).toBe(true);
            expect(debugInterface.panels.has('mock')).toBe(true);
            expect(debugInterface.panels.get('mock')).toBeInstanceOf(MockPanel);
        });

        test('should not register duplicate panel', () => {
            debugInterface.registerPanel('mock', MockPanel);
            const result = debugInterface.registerPanel('mock', MockPanel);
            expect(result).toBe(false);
            expect(consoleWarnSpy).toHaveBeenCalledWith("Panel 'mock' is already registered");
        });

        test('should handle panel registration error', () => {
            class BadPanel {
                constructor() {
                    throw new Error('Test error');
                }
            }
            
            const result = debugInterface.registerPanel('bad', BadPanel);
            expect(result).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        test('should switch panel correctly', () => {
            debugInterface.registerPanel('mock', MockPanel);
            debugInterface.switchPanel('mock');
            
            expect(debugInterface.activePanel).toBe('mock');
            expect(debugInterface.panelHistory).toContain('overview');
            expect(debugInterface.panels.get('mock').activated).toBe(true);
        });

        test('should track panel history', () => {
            debugInterface.registerPanel('mock1', MockPanel);
            debugInterface.registerPanel('mock2', MockPanel);
            
            debugInterface.switchPanel('mock1');
            debugInterface.switchPanel('mock2');
            debugInterface.switchPanel('overview');
            
            expect(debugInterface.panelHistory).toEqual(['overview', 'mock1', 'mock2']);
        });

        test('should limit panel history size', () => {
            debugInterface.registerPanel('mock', MockPanel);
            
            // Switch panels more than 10 times
            for (let i = 0; i < 15; i++) {
                debugInterface.switchPanel(i % 2 === 0 ? 'overview' : 'mock');
            }
            
            expect(debugInterface.panelHistory.length).toBeLessThanOrEqual(10);
        });

        test('should warn for non-existent panel', () => {
            debugInterface.switchPanel('nonexistent');
            expect(consoleWarnSpy).toHaveBeenCalledWith("Panel 'nonexistent' not found");
        });
    });

    describe('Keyboard Shortcuts', () => {
        test('should register shortcut successfully', () => {
            const callback = jest.fn();
            const result = debugInterface.registerShortcut('ctrl+shift+x', callback, 'Test shortcut');
            
            expect(result).toBe(true);
            expect(debugInterface.shortcuts.has('ctrl+shift+x')).toBe(true);
        });

        test('should detect shortcut conflicts', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            
            debugInterface.registerShortcut('ctrl+shift+x', callback1, 'First shortcut');
            const result = debugInterface.registerShortcut('ctrl+shift+x', callback2, 'Second shortcut');
            
            expect(result).toBe(false);
            expect(debugInterface.shortcutConflicts.has('ctrl+shift+x')).toBe(true);
            expect(consoleWarnSpy).toHaveBeenCalled();
        });

        test('should normalize shortcuts correctly', () => {
            expect(debugInterface.normalizeShortcut('Ctrl+Shift+X')).toBe('ctrl+shift+x');
            expect(debugInterface.normalizeShortcut('CTRL + SHIFT + X')).toBe('ctrl+shift+x');
        });

        test('should build shortcut string from keyboard event', () => {
            const event = {
                ctrlKey: true,
                shiftKey: true,
                altKey: false,
                metaKey: false,
                key: 'X'
            };
            
            expect(debugInterface.buildShortcutString(event)).toBe('ctrl+shift+x');
        });

        test('should handle keyboard events correctly', () => {
            const callback = jest.fn();
            debugInterface.registerShortcut('ctrl+shift+x', callback);
            
            const event = {
                ctrlKey: true,
                shiftKey: true,
                altKey: false,
                metaKey: false,
                key: 'X',
                preventDefault: jest.fn()
            };
            
            const result = debugInterface.handleKeyboardEvent(event);
            
            expect(result).toBe(true);
            expect(callback).toHaveBeenCalled();
            expect(event.preventDefault).toHaveBeenCalled();
        });

        test('should return false for unregistered shortcuts', () => {
            const event = {
                ctrlKey: true,
                shiftKey: true,
                altKey: false,
                metaKey: false,
                key: 'Z',
                preventDefault: jest.fn()
            };
            
            const result = debugInterface.handleKeyboardEvent(event);
            
            expect(result).toBe(false);
            expect(event.preventDefault).not.toHaveBeenCalled();
        });
    });

    describe('Session Management', () => {
        test('should track session data', () => {
            const sessionData = debugInterface.getSessionData();
            
            expect(sessionData.sessionId).toBe(debugInterface.sessionId);
            expect(sessionData.startTime).toBe(debugInterface.sessionStartTime);
            expect(sessionData.currentTime).toBeDefined();
            expect(sessionData.duration).toBeGreaterThanOrEqual(0);
            expect(sessionData.commands).toEqual([]);
            expect(sessionData.errors).toEqual([]);
            expect(sessionData.metrics).toEqual([]);
            expect(sessionData.panels).toEqual([]);
        });

        test('should update session data on panel switch', () => {
            debugInterface.switchPanel('performance');
            const sessionData = debugInterface.getSessionData();
            
            expect(sessionData.panels).toHaveLength(1);
            expect(sessionData.panels[0].panel).toBe('performance');
            expect(sessionData.panels[0].timestamp).toBeDefined();
        });
    });

    describe('Settings Management', () => {
        test('should save settings to localStorage', () => {
            debugInterface.position = { x: 100, y: 200 };
            debugInterface.size = { width: 500, height: 700 };
            debugInterface.saveSettings();
            
            const saved = JSON.parse(localStorage.getItem('enhanced-debug-settings'));
            expect(saved.position).toEqual({ x: 100, y: 200 });
            expect(saved.size).toEqual({ width: 500, height: 700 });
        });

        test('should load settings from localStorage', () => {
            const settings = {
                position: { x: 150, y: 250 },
                size: { width: 600, height: 800 },
                theme: 'light',
                activePanel: 'console'
            };
            
            localStorage.setItem('enhanced-debug-settings', JSON.stringify(settings));
            
            const newDebugInterface = new EnhancedDebugInterface(mockGameEngine);
            expect(newDebugInterface.position).toEqual({ x: 150, y: 250 });
            expect(newDebugInterface.size).toEqual({ width: 600, height: 800 });
            expect(newDebugInterface.settings.theme).toBe('light');
            
            newDebugInterface.destroy();
        });

        test('should handle corrupted settings gracefully', () => {
            localStorage.setItem('enhanced-debug-settings', 'invalid json');
            
            const newDebugInterface = new EnhancedDebugInterface(mockGameEngine);
            expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to load debug settings:', expect.any(Error));
            
            newDebugInterface.destroy();
        });

        test('should not save settings when autoSave is disabled', () => {
            debugInterface.settings.autoSave = false;
            debugInterface.saveSettings();
            
            expect(localStorage.getItem('enhanced-debug-settings')).toBeNull();
        });
    });

    describe('UI Interaction', () => {
        test('should toggle visibility correctly', () => {
            expect(debugInterface.isVisible).toBe(false);
            
            debugInterface.show();
            expect(debugInterface.isVisible).toBe(true);
            expect(debugInterface.debugPanel.style.display).toBe('block');
            
            debugInterface.hide();
            expect(debugInterface.isVisible).toBe(false);
            expect(debugInterface.debugPanel.style.display).toBe('none');
        });

        test('should minimize and restore correctly', () => {
            debugInterface.show();
            
            debugInterface.minimize();
            expect(debugInterface.debugPanel.classList.contains('minimized')).toBe(true);
            expect(debugInterface.debugPanel.style.height).toBe('40px');
            
            debugInterface.restore();
            expect(debugInterface.debugPanel.classList.contains('minimized')).toBe(false);
            expect(debugInterface.debugPanel.style.height).toBe(`${debugInterface.size.height}px`);
        });

        test('should update status message', () => {
            debugInterface.show();
            debugInterface.updateStatus('Test message');
            
            const statusElement = document.getElementById('debug-status-text');
            expect(statusElement.textContent).toBe('Test message');
        });
    });

    describe('Public API', () => {
        test('should return active panel', () => {
            expect(debugInterface.getActivePanel()).toBe('overview');
            
            debugInterface.switchPanel('performance');
            expect(debugInterface.getActivePanel()).toBe('performance');
        });

        test('should return panel history', () => {
            debugInterface.switchPanel('performance');
            debugInterface.switchPanel('console');
            
            const history = debugInterface.getPanelHistory();
            expect(history).toEqual(['overview', 'performance']);
        });

        test('should return registered panels', () => {
            class MockPanel {
                getDisplayName() { return 'Mock'; }
            }
            
            debugInterface.registerPanel('mock1', MockPanel);
            debugInterface.registerPanel('mock2', MockPanel);
            
            const panels = debugInterface.getRegisteredPanels();
            expect(panels).toContain('mock1');
            expect(panels).toContain('mock2');
        });

        test('should return shortcuts', () => {
            const shortcuts = debugInterface.getShortcuts();
            expect(shortcuts).toBeInstanceOf(Map);
            expect(shortcuts.size).toBeGreaterThan(0);
        });

        test('should return shortcut conflicts', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            
            debugInterface.registerShortcut('ctrl+x', callback1);
            debugInterface.registerShortcut('ctrl+x', callback2);
            
            const conflicts = debugInterface.getShortcutConflicts();
            expect(conflicts.has('ctrl+x')).toBe(true);
        });
    });

    describe('Cleanup', () => {
        test('should destroy cleanly', () => {
            class MockPanel {
                constructor() {
                    this.destroyed = false;
                }
                getDisplayName() { return 'Mock'; }
                destroy() {
                    this.destroyed = true;
                }
            }
            
            debugInterface.registerPanel('mock', MockPanel);
            const panel = debugInterface.panels.get('mock');
            
            debugInterface.destroy();
            
            expect(panel.destroyed).toBe(true);
            expect(document.getElementById('enhanced-debug-panel')).toBeNull();
            expect(document.getElementById('enhanced-debug-styles')).toBeNull();
        });

        test('should save session data on destroy', () => {
            debugInterface.settings.autoSave = true;
            debugInterface.destroy();
            
            const sessionData = JSON.parse(localStorage.getItem('enhanced-debug-session'));
            expect(sessionData).toBeTruthy();
            expect(sessionData.sessionId).toBe(debugInterface.sessionId);
            expect(sessionData.endTime).toBeDefined();
        });
    });
});