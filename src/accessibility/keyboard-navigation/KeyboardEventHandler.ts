/**
 * KeyboardEventHandler
 * キーボードイベント処理とシミュレーション機能を提供
 * - イベントリスナー管理
 * - キー組み合わせ検出
 * - キーボードイベントシミュレーション
 * - イベント伝播テスト
 */

import { getErrorHandler } from '../../utils/ErrorHandler.js';

// Interfaces for keyboard event handling
interface EventHandlerConfig {
    enabled: boolean;
    monitorEvents: boolean;
    trackShortcuts: boolean;
    logEvents: boolean;
    simulateEvents: boolean;
}

interface KeyCodes {
    TAB: number;
    ENTER: number;
    ESC: number;
    SPACE: number;
    ARROW_LEFT: number;
    ARROW_UP: number;
    ARROW_RIGHT: number;
    ARROW_DOWN: number;
    HOME: number;
    END: number;
    PAGE_UP: number;
    PAGE_DOWN: number;
    F1: number;
    F2: number;
    F3: number;
    F4: number;
    F5: number;
    F6: number;
    F7: number;
    F8: number;
    F9: number;
    F10: number;
    F11: number;
    F12: number;
}

interface EventData {
    type: "single" | "batch";
    key?: string;
    code?: string;
    keyCode?: number;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
    target: EventTarget | null;
    timestamp: number;
    relatedTarget?: EventTarget | null;
}

interface NavigationData {
    type: 'tab-navigation';
    shiftKey: boolean;
    target: EventTarget | null;
    timestamp: number;
}

interface EscapeData {
    type: 'escape-key';
    target: EventTarget | null;
    timestamp: number;
}

interface ArrowData {
    type: 'arrow-key';
    key: string;
    target: EventTarget | null;
    timestamp: number;
}

interface ShortcutData {
    shortcut: string;
    target: EventTarget | null;
    timestamp: number;
    isBrowserShortcut: boolean;
}

interface Monitoring {
    keydownListener: ((event: KeyboardEvent) => void) | null;
    keyupListener: ((event: KeyboardEvent) => void) | null;
    focusListener: ((event: FocusEvent) => void) | null;
    blurListener: ((event: FocusEvent) => void) | null;
    eventHistory: (EventData | NavigationData | EscapeData | ArrowData)[];
    shortcutHistory: ShortcutData[];
}

interface EventSimulation {
    target: HTMLElement;
    eventType: 'keydown' | 'keyup' | 'keypress';
    key: string;
    code: string;
    keyCode: number;
    modifiers?: {
        ctrlKey?: boolean;
        altKey?: boolean;
        shiftKey?: boolean;
        metaKey?: boolean;
    };
}

interface EventStatistics {
    totalEvents: number;
    keydownEvents: number;
    keyupEvents: number;
    navigationEvents: number;
    shortcutEvents: number;
    focusEvents: number;
    blurEvents: number;
    mostUsedKeys: Record<string, number>;
    shortcutUsage: Record<string, number>;
}

export class KeyboardEventHandler {
    private config: EventHandlerConfig;
    private keyCodes: KeyCodes;
    private monitoring: Monitoring;
    private initialized: boolean;
    private eventCallbacks: Map<string, Set<Function>>;
    private shortcuts: Map<string, Function>;
    private statistics: EventStatistics;

    constructor(config: Partial<EventHandlerConfig> = {}) {
        this.config = {
            enabled: true,
            monitorEvents: true,
            trackShortcuts: true,
            logEvents: false,
            simulateEvents: true,
            ...config
        };

        // キーコード定義
        this.keyCodes = {
            TAB: 9,
            ENTER: 13,
            ESC: 27,
            SPACE: 32,
            ARROW_LEFT: 37,
            ARROW_UP: 38,
            ARROW_RIGHT: 39,
            ARROW_DOWN: 40,
            HOME: 36,
            END: 35,
            PAGE_UP: 33,
            PAGE_DOWN: 34,
            F1: 112,
            F2: 113,
            F3: 114,
            F4: 115,
            F5: 116,
            F6: 117,
            F7: 118,
            F8: 119,
            F9: 120,
            F10: 121,
            F11: 122,
            F12: 123
        };

        // 監視システム
        this.monitoring = {
            keydownListener: null,
            keyupListener: null,
            focusListener: null,
            blurListener: null,
            eventHistory: [],
            shortcutHistory: []
        };

        this.initialized = false;
        this.eventCallbacks = new Map();
        this.shortcuts = new Map();
        
        // 統計データ
        this.statistics = {
            totalEvents: 0,
            keydownEvents: 0,
            keyupEvents: 0,
            navigationEvents: 0,
            shortcutEvents: 0,
            focusEvents: 0,
            blurEvents: 0,
            mostUsedKeys: {},
            shortcutUsage: {}
        };

        this.initialize();
    }

    /**
     * Initialize the event handler
     */
    private initialize(): void {
        try {
            if (!this.config.enabled) {
                console.log('KeyboardEventHandler is disabled');
                return;
            }

            this.setupEventListeners();
            this.setupDefaultShortcuts();
            this.initialized = true;
            
            console.log('KeyboardEventHandler initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'KEYBOARD_EVENT_HANDLER_ERROR', {
                operation: 'initialize'
            });
        }
    }

    /**
     * Setup event listeners for keyboard monitoring
     */
    private setupEventListeners(): void {
        if (!this.config.monitorEvents) return;

        // Keydown listener
        this.monitoring.keydownListener = (event: KeyboardEvent) => {
            this.handleKeydownEvent(event);
        };

        // Keyup listener
        this.monitoring.keyupListener = (event: KeyboardEvent) => {
            this.handleKeyupEvent(event);
        };

        // Focus listener
        this.monitoring.focusListener = (event: FocusEvent) => {
            this.handleFocusEvent(event);
        };

        // Blur listener
        this.monitoring.blurListener = (event: FocusEvent) => {
            this.handleBlurEvent(event);
        };

        // Attach listeners to document
        document.addEventListener('keydown', this.monitoring.keydownListener, true);
        document.addEventListener('keyup', this.monitoring.keyupListener, true);
        document.addEventListener('focus', this.monitoring.focusListener, true);
        document.addEventListener('blur', this.monitoring.blurListener, true);
    }

    /**
     * Setup default keyboard shortcuts
     */
    private setupDefaultShortcuts(): void {
        if (!this.config.trackShortcuts) return;

        // Common accessibility shortcuts
        this.registerShortcut('Tab', (event) => this.handleTabNavigation(event));
        this.registerShortcut('Shift+Tab', (event) => this.handleShiftTabNavigation(event));
        this.registerShortcut('Escape', (event) => this.handleEscapeKey(event));
        this.registerShortcut('Enter', (event) => this.handleEnterKey(event));
        this.registerShortcut('Space', (event) => this.handleSpaceKey(event));
        
        // Arrow keys
        this.registerShortcut('ArrowUp', (event) => this.handleArrowKey(event, 'up'));
        this.registerShortcut('ArrowDown', (event) => this.handleArrowKey(event, 'down'));
        this.registerShortcut('ArrowLeft', (event) => this.handleArrowKey(event, 'left'));
        this.registerShortcut('ArrowRight', (event) => this.handleArrowKey(event, 'right'));

        // Home/End keys
        this.registerShortcut('Home', (event) => this.handleHomeKey(event));
        this.registerShortcut('End', (event) => this.handleEndKey(event));
    }

    /**
     * Handle keydown events
     */
    private handleKeydownEvent(event: KeyboardEvent): void {
        try {
            this.statistics.totalEvents++;
            this.statistics.keydownEvents++;

            const eventData: EventData = {
                type: "single",
                key: event.key,
                code: event.code,
                keyCode: event.keyCode,
                ctrlKey: event.ctrlKey,
                altKey: event.altKey,
                shiftKey: event.shiftKey,
                metaKey: event.metaKey,
                target: event.target,
                timestamp: Date.now()
            };

            // Record event
            this.recordEvent(eventData);

            // Update key usage statistics
            this.updateKeyStatistics(event.key);

            // Check for shortcuts
            if (this.config.trackShortcuts) {
                this.checkForShortcuts(event);
            }

            // Trigger callbacks
            this.triggerCallbacks('keydown', event);

            // Log if enabled
            if (this.config.logEvents) {
                console.log('KeyboardEventHandler: Keydown event', eventData);
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'KEYBOARD_EVENT_HANDLER_ERROR', {
                operation: 'handleKeydownEvent'
            });
        }
    }

    /**
     * Handle keyup events
     */
    private handleKeyupEvent(event: KeyboardEvent): void {
        try {
            this.statistics.totalEvents++;
            this.statistics.keyupEvents++;

            const eventData: EventData = {
                type: "single",
                key: event.key,
                code: event.code,
                keyCode: event.keyCode,
                ctrlKey: event.ctrlKey,
                altKey: event.altKey,
                shiftKey: event.shiftKey,
                metaKey: event.metaKey,
                target: event.target,
                timestamp: Date.now()
            };

            this.recordEvent(eventData);
            this.triggerCallbacks('keyup', event);

            if (this.config.logEvents) {
                console.log('KeyboardEventHandler: Keyup event', eventData);
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'KEYBOARD_EVENT_HANDLER_ERROR', {
                operation: 'handleKeyupEvent'
            });
        }
    }

    /**
     * Handle focus events
     */
    private handleFocusEvent(event: FocusEvent): void {
        try {
            this.statistics.focusEvents++;
            this.triggerCallbacks('focus', event);

            if (this.config.logEvents) {
                console.log('KeyboardEventHandler: Focus event', {
                    target: event.target,
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'KEYBOARD_EVENT_HANDLER_ERROR', {
                operation: 'handleFocusEvent'
            });
        }
    }

    /**
     * Handle blur events
     */
    private handleBlurEvent(event: FocusEvent): void {
        try {
            this.statistics.blurEvents++;
            this.triggerCallbacks('blur', event);

            if (this.config.logEvents) {
                console.log('KeyboardEventHandler: Blur event', {
                    target: event.target,
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'KEYBOARD_EVENT_HANDLER_ERROR', {
                operation: 'handleBlurEvent'
            });
        }
    }

    /**
     * Handle Tab navigation
     */
    private handleTabNavigation(event: KeyboardEvent): void {
        this.statistics.navigationEvents++;

        const navigationData: NavigationData = {
            type: 'tab-navigation',
            shiftKey: event.shiftKey,
            target: event.target,
            timestamp: Date.now()
        };

        this.recordEvent(navigationData);
        this.triggerCallbacks('tab-navigation', event);
    }

    /**
     * Handle Shift+Tab navigation
     */
    private handleShiftTabNavigation(event: KeyboardEvent): void {
        this.statistics.navigationEvents++;

        const navigationData: NavigationData = {
            type: 'tab-navigation',
            shiftKey: true,
            target: event.target,
            timestamp: Date.now()
        };

        this.recordEvent(navigationData);
        this.triggerCallbacks('shift-tab-navigation', event);
    }

    /**
     * Handle Escape key
     */
    private handleEscapeKey(event: KeyboardEvent): void {
        const escapeData: EscapeData = {
            type: 'escape-key',
            target: event.target,
            timestamp: Date.now()
        };

        this.recordEvent(escapeData);
        this.triggerCallbacks('escape', event);
    }

    /**
     * Handle Enter key
     */
    private handleEnterKey(event: KeyboardEvent): void {
        this.triggerCallbacks('enter', event);
    }

    /**
     * Handle Space key
     */
    private handleSpaceKey(event: KeyboardEvent): void {
        this.triggerCallbacks('space', event);
    }

    /**
     * Handle arrow keys
     */
    private handleArrowKey(event: KeyboardEvent, direction: string): void {
        const arrowData: ArrowData = {
            type: 'arrow-key',
            key: direction,
            target: event.target,
            timestamp: Date.now()
        };

        this.recordEvent(arrowData);
        this.triggerCallbacks(`arrow-${direction}`, event);
    }

    /**
     * Handle Home key
     */
    private handleHomeKey(event: KeyboardEvent): void {
        this.triggerCallbacks('home', event);
    }

    /**
     * Handle End key
     */
    private handleEndKey(event: KeyboardEvent): void {
        this.triggerCallbacks('end', event);
    }

    /**
     * Check for keyboard shortcuts
     */
    private checkForShortcuts(event: KeyboardEvent): void {
        const shortcut = this.buildShortcutString(event);
        const handler = this.shortcuts.get(shortcut);

        if (handler) {
            this.statistics.shortcutEvents++;
            
            const shortcutData: ShortcutData = {
                shortcut: shortcut,
                target: event.target,
                timestamp: Date.now(),
                isBrowserShortcut: this.isBrowserShortcut(shortcut)
            };

            this.recordShortcut(shortcutData);
            this.updateShortcutStatistics(shortcut);

            try {
                handler(event);
            } catch (error) {
                getErrorHandler().handleError(error, 'KEYBOARD_EVENT_HANDLER_ERROR', {
                    operation: 'executeShortcut',
                    shortcut: shortcut
                });
            }
        }
    }

    /**
     * Build shortcut string from keyboard event
     */
    private buildShortcutString(event: KeyboardEvent): string {
        const parts: string[] = [];
        
        if (event.ctrlKey) parts.push('Ctrl');
        if (event.altKey) parts.push('Alt');
        if (event.shiftKey && event.key !== 'Tab') parts.push('Shift');
        if (event.metaKey) parts.push('Meta');
        
        parts.push(event.key);
        
        return parts.join('+');
    }

    /**
     * Check if shortcut is a browser shortcut
     */
    private isBrowserShortcut(shortcut: string): boolean {
        const browserShortcuts = [
            'Ctrl+T', 'Ctrl+W', 'Ctrl+R', 'Ctrl+L', 'Ctrl+D',
            'Ctrl+Shift+T', 'Ctrl+Tab', 'Ctrl+Shift+Tab',
            'F5', 'Ctrl+F5', 'F12'
        ];
        
        return browserShortcuts.includes(shortcut);
    }

    /**
     * Register a keyboard shortcut
     */
    registerShortcut(shortcut: string, handler: (event: KeyboardEvent) => void): void {
        this.shortcuts.set(shortcut, handler);
        
        if (this.config.logEvents) {
            console.log(`KeyboardEventHandler: Shortcut registered - ${shortcut}`);
        }
    }

    /**
     * Unregister a keyboard shortcut
     */
    unregisterShortcut(shortcut: string): void {
        this.shortcuts.delete(shortcut);
        
        if (this.config.logEvents) {
            console.log(`KeyboardEventHandler: Shortcut unregistered - ${shortcut}`);
        }
    }

    /**
     * Register event callback
     */
    on(eventType: string, callback: Function): void {
        if (!this.eventCallbacks.has(eventType)) {
            this.eventCallbacks.set(eventType, new Set());
        }
        
        this.eventCallbacks.get(eventType)!.add(callback);
    }

    /**
     * Unregister event callback
     */
    off(eventType: string, callback: Function): void {
        const callbacks = this.eventCallbacks.get(eventType);
        if (callbacks) {
            callbacks.delete(callback);
        }
    }

    /**
     * Trigger callbacks for event type
     */
    private triggerCallbacks(eventType: string, event: Event): void {
        const callbacks = this.eventCallbacks.get(eventType);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(event);
                } catch (error) {
                    getErrorHandler().handleError(error, 'KEYBOARD_EVENT_HANDLER_ERROR', {
                        operation: 'triggerCallback',
                        eventType: eventType
                    });
                }
            });
        }
    }

    /**
     * Simulate keyboard event
     */
    simulateKeyboardEvent(simulation: EventSimulation): boolean {
        try {
            if (!this.config.simulateEvents) {
                console.warn('Event simulation is disabled');
                return false;
            }

            const event = new KeyboardEvent(simulation.eventType, {
                key: simulation.key,
                code: simulation.code,
                keyCode: simulation.keyCode,
                ctrlKey: simulation.modifiers?.ctrlKey || false,
                altKey: simulation.modifiers?.altKey || false,
                shiftKey: simulation.modifiers?.shiftKey || false,
                metaKey: simulation.modifiers?.metaKey || false,
                bubbles: true,
                cancelable: true
            });

            return simulation.target.dispatchEvent(event);
        } catch (error) {
            getErrorHandler().handleError(error, 'KEYBOARD_EVENT_HANDLER_ERROR', {
                operation: 'simulateKeyboardEvent'
            });
            return false;
        }
    }

    /**
     * Record event in history
     */
    private recordEvent(eventData: EventData | NavigationData | EscapeData | ArrowData): void {
        this.monitoring.eventHistory.push(eventData);
        
        // Keep history size reasonable
        if (this.monitoring.eventHistory.length > 1000) {
            this.monitoring.eventHistory = this.monitoring.eventHistory.slice(-500);
        }
    }

    /**
     * Record shortcut usage
     */
    private recordShortcut(shortcutData: ShortcutData): void {
        this.monitoring.shortcutHistory.push(shortcutData);
        
        // Keep history size reasonable
        if (this.monitoring.shortcutHistory.length > 1000) {
            this.monitoring.shortcutHistory = this.monitoring.shortcutHistory.slice(-500);
        }
    }

    /**
     * Update key usage statistics
     */
    private updateKeyStatistics(key: string): void {
        this.statistics.mostUsedKeys[key] = (this.statistics.mostUsedKeys[key] || 0) + 1;
    }

    /**
     * Update shortcut usage statistics
     */
    private updateShortcutStatistics(shortcut: string): void {
        this.statistics.shortcutUsage[shortcut] = (this.statistics.shortcutUsage[shortcut] || 0) + 1;
    }

    /**
     * Get event history
     */
    getEventHistory(limit?: number): (EventData | NavigationData | EscapeData | ArrowData)[] {
        const history = this.monitoring.eventHistory;
        return limit ? history.slice(-limit) : history;
    }

    /**
     * Get shortcut history
     */
    getShortcutHistory(limit?: number): ShortcutData[] {
        const history = this.monitoring.shortcutHistory;
        return limit ? history.slice(-limit) : history;
    }

    /**
     * Get statistics
     */
    getStatistics(): EventStatistics {
        return { ...this.statistics };
    }

    /**
     * Get key codes
     */
    getKeyCodes(): KeyCodes {
        return { ...this.keyCodes };
    }

    /**
     * Clear event history
     */
    clearHistory(): void {
        this.monitoring.eventHistory = [];
        this.monitoring.shortcutHistory = [];
        console.log('Event history cleared');
    }

    /**
     * Clear statistics
     */
    clearStatistics(): void {
        this.statistics = {
            totalEvents: 0,
            keydownEvents: 0,
            keyupEvents: 0,
            navigationEvents: 0,
            shortcutEvents: 0,
            focusEvents: 0,
            blurEvents: 0,
            mostUsedKeys: {},
            shortcutUsage: {}
        };
        console.log('Statistics cleared');
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<EventHandlerConfig>): void {
        this.config = { ...this.config, ...newConfig };
        
        // If monitoring was disabled, remove listeners
        if (!this.config.monitorEvents) {
            this.removeEventListeners();
        } else if (!this.monitoring.keydownListener) {
            // If monitoring was re-enabled, setup listeners
            this.setupEventListeners();
        }
        
        console.log('KeyboardEventHandler configuration updated');
    }

    /**
     * Check if handler is ready
     */
    isReady(): boolean {
        return this.initialized;
    }

    /**
     * Remove event listeners
     */
    private removeEventListeners(): void {
        if (this.monitoring.keydownListener) {
            document.removeEventListener('keydown', this.monitoring.keydownListener, true);
            this.monitoring.keydownListener = null;
        }
        
        if (this.monitoring.keyupListener) {
            document.removeEventListener('keyup', this.monitoring.keyupListener, true);
            this.monitoring.keyupListener = null;
        }
        
        if (this.monitoring.focusListener) {
            document.removeEventListener('focus', this.monitoring.focusListener, true);
            this.monitoring.focusListener = null;
        }
        
        if (this.monitoring.blurListener) {
            document.removeEventListener('blur', this.monitoring.blurListener, true);
            this.monitoring.blurListener = null;
        }
    }

    /**
     * Destroy handler and cleanup resources
     */
    destroy(): void {
        this.removeEventListeners();
        this.clearHistory();
        this.eventCallbacks.clear();
        this.shortcuts.clear();
        this.initialized = false;
        
        console.log('KeyboardEventHandler destroyed');
    }
}