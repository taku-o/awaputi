import { BaseComponent } from '../BaseComponent.js';

// Type definitions
interface ShortcutOptions { description?: string;
    context?: string;
    group?: string;
    enabled?: boolean;
    preventDefault?: boolean;
    [key: string]: any, }
}

interface ShortcutConfig extends Required<ShortcutOptions> { shortcut: string,
    callback: (event: KeyboardEvent) => void }
}

interface ShortcutStatistics { totalShortcuts: number,
    usageCount: number,
    conflicts: number }
}

interface ShortcutConflict { shortcut: string,
    configs: ShortcutConfig[]
    }
}

interface MainController { container?: HTMLElement;
    hide(): void;
    toggle(): void;
    refresh(): void;
    minimize(): void;
    showSettings(): void;
    getComponent(name: string): any, }
}

interface PanelManager { switchPanel(panelId: string): void,
    getActivePanel(): string | null;
    getPanelHistory(): string[]; }
}

interface DataExporter { exportCurrentPanelData(): void; }
}

/**
 * DebugCommandProcessor - デバッグコマンド処理・ショートカット管理コンポーネント
 */
export class DebugCommandProcessor extends BaseComponent { private shortcuts: Map<string, ShortcutConfig>;
    private shortcutContexts: Map<string, Map<string, ShortcutConfig>>;
    private currentContext: string;
    private shortcutStatistics: ShortcutStatistics;
    private shortcutsEnabled: boolean;
    private suspendShortcuts: boolean;
'';
    constructor(mainController: MainController') {'
        '';
        super(mainController, 'DebugCommandProcessor');'
        this.shortcuts = new Map<string, ShortcutConfig>();''
        this.shortcutContexts = new Map<string, Map<string, ShortcutConfig>>(');''
        this.currentContext = 'global';
        this.shortcutStatistics = {
            totalShortcuts: 0,
            usageCount: 0,
    }
    }
            conflicts: 0 }
        },
        this.shortcutsEnabled = true;
        this.suspendShortcuts = false;
    }

    async _doInitialize(): Promise<void> { this.setupDefaultShortcuts();
        this.bindKeyboardEvents();
        this.initializeShortcutContexts(); }
    }

    /**
     * ショートカットを登録
     * @param shortcut - ショートカットキー組み合わせ
     * @param callback - コールバック関数
     * @param options - オプション
     */'
    registerShortcut(shortcut: string, callback: (event: KeyboardEvent) => void, options: ShortcutOptions = {}): void { ''
        const normalizedShortcut = this.normalizeShortcut(shortcut');
        const config: ShortcutConfig = {
            shortcut: normalizedShortcut,';
            callback: callback,'';
            description: options.description || '','';
            context: options.context || 'global','';
            group: options.group || 'general',
            enabled: options.enabled !== false,
            preventDefault: options.preventDefault !== false,
            ...options }
        };

        // 競合チェック
        if(this.shortcuts.has(normalizedShortcut) {
            
        }
            console.warn(`Shortcut conflict detected: ${normalizedShortcut)`});
            this.shortcutStatistics.conflicts++;
        }

        this.shortcuts.set(normalizedShortcut, config);
        this.shortcutStatistics.totalShortcuts++;

        // コンテキスト別管理
        this.addToContext(config.context, normalizedShortcut, config);
    }

    /**
     * ショートカットキーを正規化
     * @param shortcut - ショートカットキー
     * @returns 正規化されたショートカット
     */
    normalizeShortcut(shortcut: string): string { ''
        return shortcut.toLowerCase()';
            .replace(/\s+/g, ''')'';
            .replace(/cmd/g, 'meta'')'';
            .replace(/command/g, 'meta'')'';
            .replace(/ctrl/g, 'ctrl'')'';
            .replace(/alt/g, 'alt'')'';
            .replace(/shift/g, 'shift'); }
    }

    /**
     * ショートカット文字列を構築
     * @param event - キーボードイベント
     * @returns ショートカット文字列
     */
    buildShortcutString(event: KeyboardEvent): string { const parts: string[] = [],'
        '';
        if (event.ctrlKey') parts.push('ctrl');''
        if (event.altKey') parts.push('alt');''
        if (event.shiftKey') parts.push('shift');''
        if (event.metaKey') parts.push('meta');
        ';
        // 特殊キーの処理
        let key = event.key.toLowerCase()';
        if (key === ' '') key = 'space';''
        if (key === 'escape'') key = 'esc';''
        if (key === 'delete'') key = 'del';''
        if (key === 'arrowleft'') key = 'left';''
        if (key === 'arrowright'') key = 'right';''
        if (key === 'arrowup'') key = 'up';''
        if (key === 'arrowdown'') key = 'down';'
        '';
        parts.push(key');'
        '';
        return parts.join('+'); }
    }

    /**
     * キーボードイベントハンドラー
     * @param event - キーボードイベント
     */
    handleKeyboardEvent(event: KeyboardEvent): void { if (!this.shortcutsEnabled || this.suspendShortcuts) {
            return; }
        }

        const shortcutString = this.buildShortcutString(event);
        const shortcutConfig = this.shortcuts.get(shortcutString);

        if(shortcutConfig && shortcutConfig.enabled && this.isContextActive(shortcutConfig.context) {

            if (shortcutConfig.preventDefault) {
                event.preventDefault();

        }
                event.stopPropagation(); }
            }

            try { shortcutConfig.callback(event);
                this.shortcutStatistics.usageCount++;
                this.logShortcutUsage(shortcutString, shortcutConfig); }'
            } catch (error) { ' }'
                console.error(`Error executing shortcut ${shortcutString}:`, error');''
                this._handleError('shortcut execution', error);
            }
        }
    }

    /**
     * ショートカット使用をログ
     * @param shortcut - ショートカット文字列
     * @param config - ショートカット設定
     */
    logShortcutUsage(shortcut: string, config: ShortcutConfig): void {
        console.debug(`Shortcut used: ${shortcut} (${config.description)`});
    }

    /**
     * コンテキストが有効かチェック
     * @param context - コンテキスト名
     * @returns 有効フラグ'
     */''
    isContextActive(context: string'): boolean { ''
        return context === 'global' || context === this.currentContext; }
    }

    /**
     * キーボードイベントをバインド'
     */''
    bindKeyboardEvents()';
        document.addEventListener('keydown', (event) => { this.handleKeyboardEvent(event); }
        }, true);

        // デバッグインターフェース固有のイベント
        const controller = this.mainController as MainController;''
        if(controller.container') {'
            ';'
        }'
            controller.container.addEventListener('keydown', (event) => {  }
                this.handleDebugInterfaceKeyboard(event); }
            });
        }
    }

    /**
     * デバッグインターフェース固有のキーボード処理
     * @param event - キーボードイベント'
     */''
    handleDebugInterfaceKeyboard(event: KeyboardEvent'): void { // ESCキーでインターフェースを非表示
        if(event.key === 'Escape') {'
            (this.mainController as MainController).hide();''
            event.preventDefault()';
        if (event.key === 'Tab') {
        }
            this.handleTabNavigation(event); }
        }
    }

    /**
     * Tab移動を処理
     * @param event - キーボードイベント
     */'
    handleTabNavigation(event: KeyboardEvent): void { const controller = this.mainController as MainController;''
        const focusableElements = controller.container? .querySelectorAll()';
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]")';
        );

        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if(event.shiftKey) {

            // Shift+Tab (逆方向);
            if (document.activeElement === firstElement) {
                lastElement.focus();

        }
                event.preventDefault(); }
            }
        } else {  // Tab (順方向);
            if(document.activeElement === lastElement) {
                
            }
                firstElement.focus(); }
                event.preventDefault(); }
            }
        }
    }

    /**
     * デフォルトショートカットを設定
     */''
    setupDefaultShortcuts()';
        this.registerShortcut('ctrl+1', (') => this.switchToPanel('console''), { ''
            description: 'Switch to Console panel','';
            group: 'navigation'' }'
        }'),'
'';
        this.registerShortcut('ctrl+2', (') => this.switchToPanel('performance''), { ''
            description: 'Switch to Performance panel','';
            group: 'navigation'' }'
        }'),'
'';
        this.registerShortcut('ctrl+3', (') => this.switchToPanel('memory''), { ''
            description: 'Switch to Memory panel','';
            group: 'navigation'' }'
        }'),'
'';
        this.registerShortcut('ctrl+4', (') => this.switchToPanel('network''), { ''
            description: 'Switch to Network panel','';
            group: 'navigation'' }'
        }'),'
'';
        this.registerShortcut('ctrl+5', (') => this.switchToPanel('settings''), { ''
            description: 'Switch to Settings panel','';
            group: 'navigation'' }'
        }'),

        // インターフェース制御
        const controller = this.mainController as MainController;
        '';
        this.registerShortcut('f12', () => controller.toggle(''';
            description: 'Toggle debug interface',')';
            group: 'interface'')';
        }'),'
'';
        this.registerShortcut('ctrl+shift+d', () => controller.toggle()';
            description: 'Toggle debug interface (alternative')','';
            group: 'interface''';
        }'),'
'';
        this.registerShortcut('ctrl+shift+r', () => controller.refresh(''';
            description: 'Refresh debug data',')';
            group: 'interface'')';
        }'),
';
        // ウィンドウ操作
        this.registerShortcut('ctrl+shift+m', () => controller.minimize(''';
            description: 'Minimize debug interface',')';
            group: 'window'')';
        }'),'
'';
        this.registerShortcut('ctrl+shift+s', () => controller.showSettings(''';
            description: 'Show settings modal',')';
            group: 'window'')';
        }'),
';
        // データ操作
        this.registerShortcut('ctrl+shift+e', () => this.exportCurrentData(''';
            description: 'Export current panel data',')';
            group: 'data'')';
        }'),'
'';
        this.registerShortcut('ctrl+shift+c', () => this.clearCurrentData(''';
            description: 'Clear current panel data',')';
            group: 'data'')';
        }'),
';
        // 履歴ナビゲーション
        this.registerShortcut('alt+left', () => this.navigateHistory(-1'), { ''
            description: 'Previous panel in history','';
            group: 'navigation'' }'
        }'),'
'';
        this.registerShortcut('alt+right', () => this.navigateHistory(1'), { ''
            description: 'Next panel in history','';
            group: 'navigation' }
        }),
    }

    /**
     * パネルに切り替え
     * @param panelId - パネルID
     */'
    switchToPanel(panelId: string): void { ''
        const panelManager = (this.mainController as MainController').getComponent('panelManager') as PanelManager;
        if(panelManager) {
            
        }
            panelManager.switchPanel(panelId); }
        }
    }

    /**
     * 現在のデータをエクスポート
     */'
    exportCurrentData(): void { ''
        const dataExporter = (this.mainController as MainController').getComponent('dataExporter') as DataExporter;
        if(dataExporter) {
            
        }
            dataExporter.exportCurrentPanelData(); }
        }
    }

    /**
     * 現在のデータをクリア
     */'
    clearCurrentData(): void { ''
        const panelManager = (this.mainController as MainController').getComponent('panelManager') as PanelManager;''
        const activePanel = panelManager? .getActivePanel()';
        if(activePanel && confirm('Clear current panel data?') {
            // パネル固有のクリア処理
        }
            this.clearPanelData(activePanel); }
        }
    }

    /**
     * パネルデータをクリア
     * @param panelId - パネルID
     */ : undefined
    clearPanelData(panelId: string): void { ''
        switch(panelId') {'
            '';
            case 'console':'';
                this.clearConsoleData(''';
            case 'performance':'';
                this.clearPerformanceData(''';
            case 'memory':'';
                this.clearMemoryData()';
            case 'network':);
                this.clearNetworkData();
                break;
        }
            default: }
                console.log(`No clear action defined for panel: ${panelId)`}),
        }
    }

    /**
     * コンソールデータをクリア
     */'
    clearConsoleData(): void { ''
        const consoleOutput = (this.mainController as MainController').container? .querySelector('.console-output');''
        if(consoleOutput') {'
            ';'
        }'
            consoleOutput.innerHTML = ''; }
        }
    }

    /**
     * パフォーマンスデータをクリア
     */ : undefined'
    clearPerformanceData(): void { ''
        const performanceCharts = (this.mainController as MainController').container? .querySelector('.performance-charts');''
        if(performanceCharts') {'
            ';'
        }'
            performanceCharts.innerHTML = '<p>Performance data cleared</p>'; }
        }
    }

    /**
     * メモリデータをクリア
     */ : undefined'
    clearMemoryData(): void { ''
        const memoryUsage = (this.mainController as MainController').container? .querySelector('.memory-usage');''
        if(memoryUsage') {'
            ';'
        }'
            memoryUsage.innerHTML = '<p>Memory data cleared</p>'; }
        }
    }

    /**
     * ネットワークデータをクリア
     */ : undefined'
    clearNetworkData(): void { ''
        const networkRequests = (this.mainController as MainController').container? .querySelector('.network-requests');''
        if(networkRequests') {'
            ';'
        }'
            networkRequests.innerHTML = '<p>Network data cleared</p>'; }
        }
    }

    /**
     * 履歴ナビゲーション : undefined
     * @param direction - 方向（-1: 戻る, 1: 進む）
     */'
    navigateHistory(direction: number): void { ''
        const panelManager = (this.mainController as MainController').getComponent('panelManager') as PanelManager;
        if (!panelManager) return;

        const history = panelManager.getPanelHistory();
        const currentPanel = panelManager.getActivePanel();
        const currentIndex = history.indexOf(currentPanel!);

        let targetIndex = currentIndex + direction;
        
        // 範囲チェック
        if (targetIndex < 0) targetIndex = history.length - 1;
        if (targetIndex >= history.length) targetIndex = 0;

        if(history[targetIndex]) {

            

        }
            panelManager.switchPanel(history[targetIndex]); }
        }
    }

    /**
     * ショートカットコンテキストを初期化
     */''
    initializeShortcutContexts()';
        this.shortcutContexts.set('global', new Map<string, ShortcutConfig>()');''
        this.shortcutContexts.set('debug', new Map<string, ShortcutConfig>()');''
        this.shortcutContexts.set('panel', new Map<string, ShortcutConfig>()');''
        this.shortcutContexts.set('modal', new Map<string, ShortcutConfig>();
    }

    /**
     * コンテキストにショートカットを追加
     * @param context - コンテキスト名
     * @param shortcut - ショートカット
     * @param config - 設定
     */
    addToContext(context: string, shortcut: string, config: ShortcutConfig): void { if(!this.shortcutContexts.has(context) {
            this.shortcutContexts.set(context, new Map<string, ShortcutConfig>(); }
        }
        
        this.shortcutContexts.get(context)!.set(shortcut, config);
    }

    // === 公開API ===

    /**
     * ショートカット一覧を取得
     * @returns ショートカットMap
     */
    getShortcuts(): Map<string, ShortcutConfig> { return new Map(this.shortcuts); }
    }

    /**
     * ショートカット競合を取得
     * @returns 競合ショートカット
     */
    getShortcutConflicts(): ShortcutConflict[] { const conflicts: ShortcutConflict[] = [],
        const shortcutGroups = new Map<string, ShortcutConfig[]>();

        for(const [shortcut, config] of this.shortcuts) {

            if(!shortcutGroups.has(shortcut) {

        }
                shortcutGroups.set(shortcut, []); }
            }
            shortcutGroups.get(shortcut)!.push(config);
        }

        for(const [shortcut, configs] of shortcutGroups) {

            if (configs.length > 1) {

        }
                conflicts.push({ shortcut, configs ); }
            }
        }

        return conflicts;
    }

    /**
     * ショートカットの有効/無効を設定
     * @param enabled - 有効フラグ
     */
    setShortcutsEnabled(enabled: boolean): void { this.shortcutsEnabled = enabled; }
    }

    /**
     * ショートカットの一時停止を設定
     * @param suspend - 停止フラグ
     */
    setSuspendShortcuts(suspend: boolean): void { this.suspendShortcuts = suspend; }
    }

    /**
     * ショートカットコンテキストを切り替え
     * @param context - コンテキスト名
     */
    switchShortcutContext(context: string): void { this.currentContext = context; }
    }

    /**
     * グループ別ショートカットを取得
     * @param group - グループ名
     * @returns ショートカット配列
     */
    getShortcutsByGroup(group: string): ShortcutConfig[] { return Array.from(this.shortcuts.values().filter(config => config.group === group); }
    }

    /**
     * コンテキスト別ショートカットを取得
     * @param context - コンテキスト名
     * @returns ショートカットMap
     */
    getShortcutsByContext(context: string): Map<string, ShortcutConfig> { return this.shortcutContexts.get(context) || new Map<string, ShortcutConfig>(); }
    }

    /**
     * ショートカット統計を取得
     * @returns 統計情報
     */
    getShortcutStatistics(): ShortcutStatistics {
        return { ...this.shortcutStatistics };
    }

    /**
     * ショートカットを削除
     * @param shortcut - ショートカット
     */
    removeShortcut(shortcut: string): void { const normalizedShortcut = this.normalizeShortcut(shortcut);
        if(this.shortcuts.delete(normalizedShortcut) {
            this.shortcutStatistics.totalShortcuts--;
            
            // コンテキストからも削除
            for(const contextMap of this.shortcutContexts.values() {
        }
                contextMap.delete(normalizedShortcut); }
            }
        }
    }

    /**
     * 全ショートカットをクリア
     */
    clearAllShortcuts(): void { this.shortcuts.clear();
        for(const contextMap of this.shortcutContexts.values() {
            
        }
            contextMap.clear(); }
        }
        this.shortcutStatistics.totalShortcuts = 0;
        this.shortcutStatistics.conflicts = 0;
    }

    /**
     * クリーンアップ
     */
    cleanup(): void { ''
        this.clearAllShortcuts(''';
        this.currentContext = 'global';
        this.shortcutsEnabled = true;
        this.suspendShortcuts = false;'
        ')';
        super.cleanup(') }