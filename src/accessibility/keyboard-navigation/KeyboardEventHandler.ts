/**
 * KeyboardEventHandler
 * キーボードイベント処理とシミュレーション機能を提供
 * - イベントリスナー管理
 * - キー組み合わせ検出
 * - キーボードイベントシミュレーション
 * - イベント伝播テスト
 */

import { getErrorHandler } from '../../core/ErrorHandler.js';

// Interfaces for keyboard event handling
interface EventHandlerConfig {
    enabled: boolean;
    monitorEvents: boolean;
    trackShortcuts: boolean;
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
    type: string;
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

interface SimulationOptions {
    key: string;
    code: string;
    keyCode: number;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
    bubbles?: boolean;
    cancelable?: boolean;
}

interface SimulationResult {
    keydown: boolean;
    keyup: boolean;
    element: Element;
    options: SimulationOptions;
}

interface EventDetection {
    hasKeydownHandler: boolean;
    hasKeyupHandler: boolean;
    hasKeypressHandler: boolean;
    hasAccessKey: boolean;
    hasTabIndex: boolean;
    eventHandlers: string[];
    accessKey?: string;
    tabIndex?: string;
    hasInlineHandlers?: boolean;
}

interface ValidationIssue {
    type: string;
    severity: 'error' | 'warning';
    message: string;
    suggestion?: string;
}

interface ValidationResult {
    passed: boolean;
    issues: ValidationIssue[];
    warnings: ValidationIssue[];
}

interface EventStatistics {
    totalEvents: number;
    keydownEvents: number;
    tabEvents: number;
    escapeEvents: number;
    shortcutEvents: number;
    browserShortcutConflicts: number;
}

export class KeyboardEventHandler {
    private config: EventHandlerConfig;
    private keyCodes: KeyCodes;
    private browserShortcuts: Record<string, string>;
    private monitoring: Monitoring;

    constructor(config: Partial<EventHandlerConfig> = {}) {
        this.config = {
            enabled: true,
            monitorEvents: true,
            trackShortcuts: true,
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
        
        // 標準ブラウザショートカット
        this.browserShortcuts = {
            'Ctrl+Tab': 'タブ切り替え',
            'Ctrl+Shift+Tab': 'タブ逆順切り替え',
            'Ctrl+T': '新しいタブ',
            'Ctrl+W': 'タブを閉じる',
            'Ctrl+R': 'リロード',
            'Ctrl+F': 'ページ内検索',
            'Ctrl+L': 'アドレスバーにフォーカス',
            'F5': 'リロード',
            'F11': 'フルスクリーン',
            'F12': 'デベロッパーツール'
        };
        
        // イベント監視
        this.monitoring = {
            keydownListener: null,
            keyupListener: null,
            focusListener: null,
            blurListener: null,
            eventHistory: [],
            shortcutHistory: []
        };
        
        console.log('KeyboardEventHandler initialized');
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners(): void {
        if (!this.config.enabled) return;
        
        try {
            // キーボードイベントの監視
            this.monitoring.keydownListener = (event: KeyboardEvent) => {
                this.handleKeyboardEvent(event, 'keydown');
            };
            
            this.monitoring.keyupListener = (event: KeyboardEvent) => {
                this.handleKeyboardEvent(event, 'keyup');
            };
            
            // フォーカスイベントの監視
            this.monitoring.focusListener = (event: FocusEvent) => {
                this.handleFocusEvent(event, 'focus');
            };
            
            this.monitoring.blurListener = (event: FocusEvent) => {
                this.handleFocusEvent(event, 'blur');
            };
            
            // イベントリスナーの登録
            document.addEventListener('keydown', this.monitoring.keydownListener, true);
            document.addEventListener('keyup', this.monitoring.keyupListener, true);
            document.addEventListener('focus', this.monitoring.focusListener, true);
            document.addEventListener('blur', this.monitoring.blurListener, true);
            
            console.log('Event listeners set up successfully');
            
        } catch (error) {
            getErrorHandler().handleError(error, 'KEYBOARD_EVENT_SETUP_ERROR', {
                component: 'KeyboardEventHandler',
                operation: 'setupEventListeners'
            });
        }
    }
    
    /**
     * キーボードイベントハンドリング
     */
    private handleKeyboardEvent(event: KeyboardEvent, type: string): void {
        if (!this.config.monitorEvents) return;
        
        try {
            // イベント履歴の記録
            const eventData: EventData = {
                type,
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
            
            this.monitoring.eventHistory.push(eventData);
            
            // 履歴を最新1000件に制限
            if (this.monitoring.eventHistory.length > 1000) {
                this.monitoring.eventHistory.shift();
            }
            
            // ショートカットキーの検出
            if (this.config.trackShortcuts && (event.ctrlKey || event.altKey || event.metaKey)) {
                const shortcut = this.buildShortcutString(event);
                this.recordShortcutUsage(shortcut, event);
            }
            
            // 特定のキーイベントの追跡
            this.trackSpecificKeyEvents(event, type);
            
        } catch (error) {
            getErrorHandler().handleError(error, 'KEYBOARD_EVENT_HANDLING_ERROR', {
                component: 'KeyboardEventHandler',
                event: event.key,
                type
            });
        }
    }
    
    /**
     * フォーカスイベントハンドリング
     */
    private handleFocusEvent(event: FocusEvent, type: string): void {
        if (!this.config.monitorEvents) return;
        
        try {
            const eventData: EventData = {
                type,
                target: event.target,
                relatedTarget: event.relatedTarget,
                timestamp: Date.now()
            };
            
            this.monitoring.eventHistory.push(eventData);
            
        } catch (error) {
            getErrorHandler().handleError(error, 'FOCUS_EVENT_HANDLING_ERROR', {
                component: 'KeyboardEventHandler',
                type
            });
        }
    }
    
    /**
     * 特定のキーイベントの追跡
     */
    private trackSpecificKeyEvents(event: KeyboardEvent, type: string): void {
        // Tabキーの追跡
        if (event.key === 'Tab') {
            this.trackTabNavigation(event);
        }
        
        // Escapeキーの追跡
        if (event.key === 'Escape') {
            this.trackEscapeKeyUsage(event);
        }
        
        // 矢印キーの追跡
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            this.trackArrowKeyUsage(event);
        }
    }
    
    /**
     * Tabナビゲーションの追跡
     */
    private trackTabNavigation(event: KeyboardEvent): void {
        const navigationData: NavigationData = {
            type: 'tab-navigation',
            shiftKey: event.shiftKey,
            target: event.target,
            timestamp: Date.now()
        };
        
        this.monitoring.eventHistory.push(navigationData);
    }
    
    /**
     * Escapeキー使用の追跡
     */
    private trackEscapeKeyUsage(event: KeyboardEvent): void {
        const escapeData: EscapeData = {
            type: 'escape-key',
            target: event.target,
            timestamp: Date.now()
        };
        
        this.monitoring.eventHistory.push(escapeData);
    }
    
    /**
     * 矢印キー使用の追跡
     */
    private trackArrowKeyUsage(event: KeyboardEvent): void {
        const arrowData: ArrowData = {
            type: 'arrow-key',
            key: event.key,
            target: event.target,
            timestamp: Date.now()
        };
        
        this.monitoring.eventHistory.push(arrowData);
    }
    
    /**
     * ショートカット使用の記録
     */
    private recordShortcutUsage(shortcut: string, event: KeyboardEvent): void {
        const shortcutData: ShortcutData = {
            shortcut,
            target: event.target,
            timestamp: Date.now(),
            isBrowserShortcut: this.browserShortcuts.hasOwnProperty(shortcut)
        };
        
        this.monitoring.shortcutHistory.push(shortcutData);
        
        // ショートカット履歴を最新500件に制限
        if (this.monitoring.shortcutHistory.length > 500) {
            this.monitoring.shortcutHistory.shift();
        }
    }
    
    /**
     * ショートカット文字列の構築
     */
    private buildShortcutString(event: KeyboardEvent): string {
        const parts: string[] = [];
        
        if (event.ctrlKey) parts.push('Ctrl');
        if (event.altKey) parts.push('Alt');
        if (event.shiftKey) parts.push('Shift');
        if (event.metaKey) parts.push('Meta');
        
        parts.push(event.key);
        
        return parts.join('+');
    }
    
    /**
     * キーボードイベントのシミュレーション
     */
    simulateKeyPress(element: Element, keyOptions: Partial<SimulationOptions>): SimulationResult | null {
        try {
            const defaultOptions: SimulationOptions = {
                key: '',
                code: '',
                keyCode: 0,
                ctrlKey: false,
                altKey: false,
                shiftKey: false,
                metaKey: false,
                bubbles: true,
                cancelable: true
            };
            
            const options = { ...defaultOptions, ...keyOptions } as SimulationOptions;
            
            // KeyboardEventの作成
            const keydownEvent = new KeyboardEvent('keydown', options);
            const keyupEvent = new KeyboardEvent('keyup', options);
            
            // イベントの発火
            const keydownResult = element.dispatchEvent(keydownEvent);
            const keyupResult = element.dispatchEvent(keyupEvent);
            
            return {
                keydown: keydownResult,
                keyup: keyupResult,
                element,
                options
            };
            
        } catch (error) {
            getErrorHandler().handleError(error, 'KEY_SIMULATION_ERROR', {
                component: 'KeyboardEventHandler',
                element: element.tagName,
                key: keyOptions.key
            });
            return null;
        }
    }
    
    /**
     * Tabキーシミュレーション
     */
    simulateTabKey(element: Element, shiftKey: boolean = false): SimulationResult | null {
        return this.simulateKeyPress(element, {
            key: 'Tab',
            code: 'Tab',
            keyCode: this.keyCodes.TAB,
            shiftKey
        });
    }
    
    /**
     * Escapeキーシミュレーション
     */
    simulateEscapeKey(element: Element): SimulationResult | null {
        return this.simulateKeyPress(element, {
            key: 'Escape',
            code: 'Escape',
            keyCode: this.keyCodes.ESC
        });
    }
    
    /**
     * Enterキーシミュレーション
     */
    simulateEnterKey(element: Element): SimulationResult | null {
        return this.simulateKeyPress(element, {
            key: 'Enter',
            code: 'Enter',
            keyCode: this.keyCodes.ENTER
        });
    }
    
    /**
     * キーボードイベントの検出
     */
    detectKeyboardEvents(element: HTMLElement): EventDetection {
        const events: EventDetection = {
            hasKeydownHandler: false,
            hasKeyupHandler: false,
            hasKeypressHandler: false,
            hasAccessKey: false,
            hasTabIndex: false,
            eventHandlers: []
        };
        
        try {
            // onXXX属性の検出
            if ((element as any).onkeydown) {
                events.hasKeydownHandler = true;
                events.eventHandlers.push('onkeydown');
            }
            
            if ((element as any).onkeyup) {
                events.hasKeyupHandler = true;
                events.eventHandlers.push('onkeyup');
            }
            
            if ((element as any).onkeypress) {
                events.hasKeypressHandler = true;
                events.eventHandlers.push('onkeypress');
            }
            
            // accesskey属性の検出
            if (element.hasAttribute('accesskey')) {
                events.hasAccessKey = true;
                events.accessKey = element.getAttribute('accesskey') || undefined;
            }
            
            // tabindex属性の検出
            if (element.hasAttribute('tabindex')) {
                events.hasTabIndex = true;
                events.tabIndex = element.getAttribute('tabindex') || undefined;
            }
            
            // HTML内容からイベントハンドラーの推測
            const elementHTML = element.outerHTML.toLowerCase();
            if (elementHTML.includes('keydown') || 
                elementHTML.includes('keyup') || 
                elementHTML.includes('keyboard')) {
                events.hasInlineHandlers = true;
            }
            
        } catch (error) {
            getErrorHandler().handleError(error, 'EVENT_DETECTION_ERROR', {
                component: 'KeyboardEventHandler',
                element: element.tagName
            });
        }
        
        return events;
    }
    
    /**
     * イベントハンドラーの検証
     */
    validateEventHandlers(element: HTMLElement): ValidationResult {
        const validation: ValidationResult = {
            passed: true,
            issues: [],
            warnings: []
        };
        
        try {
            const events = this.detectKeyboardEvents(element);
            
            // インタラクティブ要素のキーボード対応チェック
            if (this.isInteractiveElement(element)) {
                const hasKeyboardSupport = events.hasKeydownHandler || 
                                         events.hasKeyupHandler || 
                                         this.isNativelyKeyboardAccessible(element);
                
                if (!hasKeyboardSupport) {
                    validation.passed = false;
                    validation.issues.push({
                        type: 'missing-keyboard-handler',
                        severity: 'error',
                        message: 'Interactive element missing keyboard event handlers',
                        suggestion: 'Add keydown or keyup event handlers'
                    });
                }
            }
            
            // アクセスキーの競合チェック
            if (events.hasAccessKey && events.accessKey) {
                const shortcut = `Alt+${events.accessKey.toUpperCase()}`;
                if (this.browserShortcuts[shortcut]) {
                    validation.warnings.push({
                        type: 'accesskey-conflict',
                        severity: 'warning',
                        message: `Access key may conflict with browser shortcut: ${shortcut}`,
                        suggestion: 'Consider using different access key'
                    });
                }
            }
            
            // tabindexの適切性チェック
            if (events.hasTabIndex && events.tabIndex) {
                const tabIndex = parseInt(events.tabIndex);
                if (tabIndex > 0) {
                    validation.warnings.push({
                        type: 'positive-tabindex',
                        severity: 'warning',
                        message: `Positive tabindex found: ${tabIndex}`,
                        suggestion: 'Use tabindex="0" or rely on natural tab order'
                    });
                }
            }
            
        } catch (error) {
            validation.passed = false;
            validation.issues.push({
                type: 'validation-error',
                severity: 'error',
                message: `Event handler validation failed: ${(error as Error).message}`
            });
        }
        
        return validation;
    }
    
    /**
     * インタラクティブ要素の判定
     */
    private isInteractiveElement(element: HTMLElement): boolean {
        // クリックハンドラーがある
        if ((element as any).onclick) {
            return true;
        }
        
        // インタラクティブな役割
        const interactiveRoles = ['button', 'link', 'tab', 'menuitem', 'option'];
        const role = element.getAttribute('role');
        
        if (role && interactiveRoles.includes(role)) {
            return true;
        }
        
        // カーソルスタイル
        const styles = window.getComputedStyle(element);
        if (styles.cursor === 'pointer') {
            return true;
        }
        
        // ゲーム固有の要素
        const gameInteractiveClasses = ['game-control', 'game-button', 'bubble', 'clickable'];
        return gameInteractiveClasses.some(className => 
            element.classList.contains(className) || 
            element.className.includes(className)
        );
    }
    
    /**
     * ネイティブキーボードアクセシブル要素の判定
     */
    private isNativelyKeyboardAccessible(element: HTMLElement): boolean {
        const nativelyAccessible = ['button', 'a', 'input', 'textarea', 'select'];
        return nativelyAccessible.includes(element.tagName.toLowerCase());
    }
    
    /**
     * イベント履歴の取得
     */
    getEventHistory(limit: number = 100): (EventData | NavigationData | EscapeData | ArrowData)[] {
        return this.monitoring.eventHistory.slice(-limit);
    }
    
    /**
     * ショートカット履歴の取得
     */
    getShortcutHistory(limit: number = 50): ShortcutData[] {
        return this.monitoring.shortcutHistory.slice(-limit);
    }
    
    /**
     * 統計情報の取得
     */
    getStatistics(): EventStatistics {
        const keydownEvents = this.monitoring.eventHistory.filter(e => e.type === 'keydown').length;
        const tabEvents = this.monitoring.eventHistory.filter(e => 'key' in e && e.key === 'Tab').length;
        const escapeEvents = this.monitoring.eventHistory.filter(e => 'key' in e && e.key === 'Escape').length;
        const shortcutEvents = this.monitoring.shortcutHistory.length;
        
        return {
            totalEvents: this.monitoring.eventHistory.length,
            keydownEvents,
            tabEvents,
            escapeEvents,
            shortcutEvents,
            browserShortcutConflicts: this.monitoring.shortcutHistory.filter(s => s.isBrowserShortcut).length
        };
    }
    
    /**
     * 設定の更新
     */
    updateConfig(newConfig: Partial<EventHandlerConfig>): void {
        this.config = { ...this.config, ...newConfig };
        
        // 設定変更に応じた再初期化
        if (newConfig.hasOwnProperty('enabled')) {
            if (newConfig.enabled && !this.monitoring.keydownListener) {
                this.setupEventListeners();
            } else if (!newConfig.enabled) {
                this.removeEventListeners();
            }
        }
        
        console.log('KeyboardEventHandler configuration updated');
    }
    
    /**
     * イベントリスナーの削除
     */
    private removeEventListeners(): void {
        try {
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
            
            console.log('Event listeners removed');
            
        } catch (error) {
            getErrorHandler().handleError(error, 'EVENT_LISTENER_REMOVAL_ERROR', {
                component: 'KeyboardEventHandler'
            });
        }
    }
    
    /**
     * クリーンアップ
     */
    destroy(): void {
        console.log('Destroying KeyboardEventHandler...');
        
        // イベントリスナーの削除
        this.removeEventListeners();
        
        // データのクリア
        this.monitoring.eventHistory = [];
        this.monitoring.shortcutHistory = [];
        
        console.log('KeyboardEventHandler destroyed');
    }
}