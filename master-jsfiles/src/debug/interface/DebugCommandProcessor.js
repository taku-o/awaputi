import { BaseComponent } from '../BaseComponent.js';

/**
 * DebugCommandProcessor - デバッグコマンド処理・ショートカット管理コンポーネント
 */
export class DebugCommandProcessor extends BaseComponent {
    constructor(mainController) {
        super(mainController, 'DebugCommandProcessor');
        this.shortcuts = new Map();
        this.shortcutContexts = new Map();
        this.currentContext = 'global';
        this.shortcutStatistics = {
            totalShortcuts: 0,
            usageCount: 0,
            conflicts: 0
        };
        this.shortcutsEnabled = true;
        this.suspendShortcuts = false;
    }

    async _doInitialize() {
        this.setupDefaultShortcuts();
        this.bindKeyboardEvents();
        this.initializeShortcutContexts();
    }

    /**
     * ショートカットを登録
     * @param {string} shortcut - ショートカットキー組み合わせ
     * @param {Function} callback - コールバック関数
     * @param {Object} options - オプション
     */
    registerShortcut(shortcut, callback, options = {}) {
        const normalizedShortcut = this.normalizeShortcut(shortcut);
        const config = {
            shortcut: normalizedShortcut,
            callback: callback,
            description: options.description || '',
            context: options.context || 'global',
            group: options.group || 'general',
            enabled: options.enabled !== false,
            preventDefault: options.preventDefault !== false,
            ...options
        };

        // 競合チェック
        if (this.shortcuts.has(normalizedShortcut)) {
            console.warn(`Shortcut conflict detected: ${normalizedShortcut}`);
            this.shortcutStatistics.conflicts++;
        }

        this.shortcuts.set(normalizedShortcut, config);
        this.shortcutStatistics.totalShortcuts++;

        // コンテキスト別管理
        this.addToContext(config.context, normalizedShortcut, config);
    }

    /**
     * ショートカットキーを正規化
     * @param {string} shortcut - ショートカットキー
     * @returns {string} 正規化されたショートカット
     */
    normalizeShortcut(shortcut) {
        return shortcut.toLowerCase()
            .replace(/\s+/g, '')
            .replace(/cmd/g, 'meta')
            .replace(/command/g, 'meta')
            .replace(/ctrl/g, 'ctrl')
            .replace(/alt/g, 'alt')
            .replace(/shift/g, 'shift');
    }

    /**
     * ショートカット文字列を構築
     * @param {KeyboardEvent} event - キーボードイベント
     * @returns {string} ショートカット文字列
     */
    buildShortcutString(event) {
        const parts = [];
        
        if (event.ctrlKey) parts.push('ctrl');
        if (event.altKey) parts.push('alt');
        if (event.shiftKey) parts.push('shift');
        if (event.metaKey) parts.push('meta');
        
        // 特殊キーの処理
        let key = event.key.toLowerCase();
        if (key === ' ') key = 'space';
        if (key === 'escape') key = 'esc';
        if (key === 'delete') key = 'del';
        if (key === 'arrowleft') key = 'left';
        if (key === 'arrowright') key = 'right';
        if (key === 'arrowup') key = 'up';
        if (key === 'arrowdown') key = 'down';
        
        parts.push(key);
        
        return parts.join('+');
    }

    /**
     * キーボードイベントハンドラー
     * @param {KeyboardEvent} event - キーボードイベント
     */
    handleKeyboardEvent(event) {
        if (!this.shortcutsEnabled || this.suspendShortcuts) {
            return;
        }

        const shortcutString = this.buildShortcutString(event);
        const shortcutConfig = this.shortcuts.get(shortcutString);

        if (shortcutConfig && shortcutConfig.enabled && this.isContextActive(shortcutConfig.context)) {
            if (shortcutConfig.preventDefault) {
                event.preventDefault();
                event.stopPropagation();
            }

            try {
                shortcutConfig.callback(event);
                this.shortcutStatistics.usageCount++;
                this.logShortcutUsage(shortcutString, shortcutConfig);
            } catch (error) {
                console.error(`Error executing shortcut ${shortcutString}:`, error);
                this._handleError('shortcut execution', error);
            }
        }
    }

    /**
     * ショートカット使用をログ
     * @param {string} shortcut - ショートカット文字列
     * @param {Object} config - ショートカット設定
     */
    logShortcutUsage(shortcut, config) {
        console.debug(`Shortcut used: ${shortcut} (${config.description})`);
    }

    /**
     * コンテキストが有効かチェック
     * @param {string} context - コンテキスト名
     * @returns {boolean} 有効フラグ
     */
    isContextActive(context) {
        return context === 'global' || context === this.currentContext;
    }

    /**
     * キーボードイベントをバインド
     */
    bindKeyboardEvents() {
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardEvent(event);
        }, true);

        // デバッグインターフェース固有のイベント
        if (this.mainController.container) {
            this.mainController.container.addEventListener('keydown', (event) => {
                this.handleDebugInterfaceKeyboard(event);
            });
        }
    }

    /**
     * デバッグインターフェース固有のキーボード処理
     * @param {KeyboardEvent} event - キーボードイベント
     */
    handleDebugInterfaceKeyboard(event) {
        // ESCキーでインターフェースを非表示
        if (event.key === 'Escape') {
            this.mainController.hide();
            event.preventDefault();
        }

        // Tab移動の制御
        if (event.key === 'Tab') {
            this.handleTabNavigation(event);
        }
    }

    /**
     * Tab移動を処理
     * @param {KeyboardEvent} event - キーボードイベント
     */
    handleTabNavigation(event) {
        const focusableElements = this.mainController.container?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
            // Shift+Tab (逆方向)
            if (document.activeElement === firstElement) {
                lastElement.focus();
                event.preventDefault();
            }
        } else {
            // Tab (順方向)
            if (document.activeElement === lastElement) {
                firstElement.focus();
                event.preventDefault();
            }
        }
    }

    /**
     * デフォルトショートカットを設定
     */
    setupDefaultShortcuts() {
        // パネル切り替え
        this.registerShortcut('ctrl+1', () => this.switchToPanel('console'), {
            description: 'Switch to Console panel',
            group: 'navigation'
        });

        this.registerShortcut('ctrl+2', () => this.switchToPanel('performance'), {
            description: 'Switch to Performance panel',
            group: 'navigation'
        });

        this.registerShortcut('ctrl+3', () => this.switchToPanel('memory'), {
            description: 'Switch to Memory panel',
            group: 'navigation'
        });

        this.registerShortcut('ctrl+4', () => this.switchToPanel('network'), {
            description: 'Switch to Network panel',
            group: 'navigation'
        });

        this.registerShortcut('ctrl+5', () => this.switchToPanel('settings'), {
            description: 'Switch to Settings panel',
            group: 'navigation'
        });

        // インターフェース制御
        this.registerShortcut('f12', () => this.mainController.toggle(), {
            description: 'Toggle debug interface',
            group: 'interface'
        });

        this.registerShortcut('ctrl+shift+d', () => this.mainController.toggle(), {
            description: 'Toggle debug interface (alternative)',
            group: 'interface'
        });

        this.registerShortcut('ctrl+shift+r', () => this.mainController.refresh(), {
            description: 'Refresh debug data',
            group: 'interface'
        });

        // ウィンドウ操作
        this.registerShortcut('ctrl+shift+m', () => this.mainController.minimize(), {
            description: 'Minimize debug interface',
            group: 'window'
        });

        this.registerShortcut('ctrl+shift+s', () => this.mainController.showSettings(), {
            description: 'Show settings modal',
            group: 'window'
        });

        // データ操作
        this.registerShortcut('ctrl+shift+e', () => this.exportCurrentData(), {
            description: 'Export current panel data',
            group: 'data'
        });

        this.registerShortcut('ctrl+shift+c', () => this.clearCurrentData(), {
            description: 'Clear current panel data',
            group: 'data'
        });

        // 履歴ナビゲーション
        this.registerShortcut('alt+left', () => this.navigateHistory(-1), {
            description: 'Previous panel in history',
            group: 'navigation'
        });

        this.registerShortcut('alt+right', () => this.navigateHistory(1), {
            description: 'Next panel in history',
            group: 'navigation'
        });
    }

    /**
     * パネルに切り替え
     * @param {string} panelId - パネルID
     */
    switchToPanel(panelId) {
        const panelManager = this.mainController.getComponent('panelManager');
        if (panelManager) {
            panelManager.switchPanel(panelId);
        }
    }

    /**
     * 現在のデータをエクスポート
     */
    exportCurrentData() {
        const dataExporter = this.mainController.getComponent('dataExporter');
        if (dataExporter) {
            dataExporter.exportCurrentPanelData();
        }
    }

    /**
     * 現在のデータをクリア
     */
    clearCurrentData() {
        const panelManager = this.mainController.getComponent('panelManager');
        const activePanel = panelManager?.getActivePanel();
        
        if (activePanel && confirm('Clear current panel data?')) {
            // パネル固有のクリア処理
            this.clearPanelData(activePanel);
        }
    }

    /**
     * パネルデータをクリア
     * @param {string} panelId - パネルID
     */
    clearPanelData(panelId) {
        switch (panelId) {
            case 'console':
                this.clearConsoleData();
                break;
            case 'performance':
                this.clearPerformanceData();
                break;
            case 'memory':
                this.clearMemoryData();
                break;
            case 'network':
                this.clearNetworkData();
                break;
            default:
                console.log(`No clear action defined for panel: ${panelId}`);
        }
    }

    /**
     * コンソールデータをクリア
     */
    clearConsoleData() {
        const consoleOutput = this.mainController.container?.querySelector('.console-output');
        if (consoleOutput) {
            consoleOutput.innerHTML = '';
        }
    }

    /**
     * パフォーマンスデータをクリア
     */
    clearPerformanceData() {
        const performanceCharts = this.mainController.container?.querySelector('.performance-charts');
        if (performanceCharts) {
            performanceCharts.innerHTML = '<p>Performance data cleared</p>';
        }
    }

    /**
     * メモリデータをクリア
     */
    clearMemoryData() {
        const memoryUsage = this.mainController.container?.querySelector('.memory-usage');
        if (memoryUsage) {
            memoryUsage.innerHTML = '<p>Memory data cleared</p>';
        }
    }

    /**
     * ネットワークデータをクリア
     */
    clearNetworkData() {
        const networkRequests = this.mainController.container?.querySelector('.network-requests');
        if (networkRequests) {
            networkRequests.innerHTML = '<p>Network data cleared</p>';
        }
    }

    /**
     * 履歴ナビゲーション
     * @param {number} direction - 方向（-1: 戻る, 1: 進む）
     */
    navigateHistory(direction) {
        const panelManager = this.mainController.getComponent('panelManager');
        if (!panelManager) return;

        const history = panelManager.getPanelHistory();
        const currentPanel = panelManager.getActivePanel();
        const currentIndex = history.indexOf(currentPanel);

        let targetIndex = currentIndex + direction;
        
        // 範囲チェック
        if (targetIndex < 0) targetIndex = history.length - 1;
        if (targetIndex >= history.length) targetIndex = 0;

        if (history[targetIndex]) {
            panelManager.switchPanel(history[targetIndex]);
        }
    }

    /**
     * ショートカットコンテキストを初期化
     */
    initializeShortcutContexts() {
        this.shortcutContexts.set('global', new Map());
        this.shortcutContexts.set('debug', new Map());
        this.shortcutContexts.set('panel', new Map());
        this.shortcutContexts.set('modal', new Map());
    }

    /**
     * コンテキストにショートカットを追加
     * @param {string} context - コンテキスト名
     * @param {string} shortcut - ショートカット
     * @param {Object} config - 設定
     */
    addToContext(context, shortcut, config) {
        if (!this.shortcutContexts.has(context)) {
            this.shortcutContexts.set(context, new Map());
        }
        
        this.shortcutContexts.get(context).set(shortcut, config);
    }

    // === 公開API ===

    /**
     * ショートカット一覧を取得
     * @returns {Map} ショートカットMap
     */
    getShortcuts() {
        return new Map(this.shortcuts);
    }

    /**
     * ショートカット競合を取得
     * @returns {Array} 競合ショートカット
     */
    getShortcutConflicts() {
        const conflicts = [];
        const shortcutGroups = new Map();

        for (const [shortcut, config] of this.shortcuts) {
            if (!shortcutGroups.has(shortcut)) {
                shortcutGroups.set(shortcut, []);
            }
            shortcutGroups.get(shortcut).push(config);
        }

        for (const [shortcut, configs] of shortcutGroups) {
            if (configs.length > 1) {
                conflicts.push({ shortcut, configs });
            }
        }

        return conflicts;
    }

    /**
     * ショートカットの有効/無効を設定
     * @param {boolean} enabled - 有効フラグ
     */
    setShortcutsEnabled(enabled) {
        this.shortcutsEnabled = enabled;
    }

    /**
     * ショートカットの一時停止を設定
     * @param {boolean} suspend - 停止フラグ
     */
    setSuspendShortcuts(suspend) {
        this.suspendShortcuts = suspend;
    }

    /**
     * ショートカットコンテキストを切り替え
     * @param {string} context - コンテキスト名
     */
    switchShortcutContext(context) {
        this.currentContext = context;
    }

    /**
     * グループ別ショートカットを取得
     * @param {string} group - グループ名
     * @returns {Array} ショートカット配列
     */
    getShortcutsByGroup(group) {
        return Array.from(this.shortcuts.values()).filter(config => config.group === group);
    }

    /**
     * コンテキスト別ショートカットを取得
     * @param {string} context - コンテキスト名
     * @returns {Map} ショートカットMap
     */
    getShortcutsByContext(context) {
        return this.shortcutContexts.get(context) || new Map();
    }

    /**
     * ショートカット統計を取得
     * @returns {Object} 統計情報
     */
    getShortcutStatistics() {
        return { ...this.shortcutStatistics };
    }

    /**
     * ショートカットを削除
     * @param {string} shortcut - ショートカット
     */
    removeShortcut(shortcut) {
        const normalizedShortcut = this.normalizeShortcut(shortcut);
        if (this.shortcuts.delete(normalizedShortcut)) {
            this.shortcutStatistics.totalShortcuts--;
            
            // コンテキストからも削除
            for (const contextMap of this.shortcutContexts.values()) {
                contextMap.delete(normalizedShortcut);
            }
        }
    }

    /**
     * 全ショートカットをクリア
     */
    clearAllShortcuts() {
        this.shortcuts.clear();
        for (const contextMap of this.shortcutContexts.values()) {
            contextMap.clear();
        }
        this.shortcutStatistics.totalShortcuts = 0;
        this.shortcutStatistics.conflicts = 0;
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        this.clearAllShortcuts();
        this.currentContext = 'global';
        this.shortcutsEnabled = true;
        this.suspendShortcuts = false;
        
        super.cleanup();
    }
}