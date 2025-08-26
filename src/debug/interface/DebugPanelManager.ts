import { BaseComponent } from '../BaseComponent.js';

// Type definitions
interface PanelConfig {
    id: string;
    name: string;
    content: string;
    visible: boolean;
    order: number;
    icon: string;
    shortcut: string;
    category: string;
    description: string;
    onActivate?: () => void;
    onDeactivate?: () => void;
    [key: string]: any;
}

interface PanelStatistics {
    totalPanels: number;
    activePanels: number;
    switchCount: number;
    sessionStartTime: number;
}

interface MainController {
    container?: HTMLElement;
}

/**
 * DebugPanelManager - デバッグパネルの管理コンポーネント
 */
export class DebugPanelManager extends BaseComponent {
    private panels: Map<string, PanelConfig>;
    private panelHistory: string[];
    private activePanel: string | null;
    private panelElements: Map<string, HTMLElement>;
    private panelStatistics: PanelStatistics;

    constructor(mainController: MainController) {
        super(mainController, 'DebugPanelManager');
        
        this.panels = new Map<string, PanelConfig>();
        this.panelHistory = [];
        this.activePanel = null;
        this.panelElements = new Map<string, HTMLElement>();
        this.panelStatistics = {
            totalPanels: 0,
            activePanels: 0,
            switchCount: 0,
            sessionStartTime: Date.now()
        };
    }

    async doInitialize(): Promise<void> {
        this.registerDefaultPanels();
        this.setupPanelEventHandlers();
    }

    /**
     * パネルを登録
     */
    registerPanel(config: PanelConfig): void {
        this.panels.set(config.id, config);
        this.panelStatistics.totalPanels = this.panels.size;
        
        // パネル要素を作成
        this.createPanelElement(config);
        
        console.log(`Panel registered: ${config.id}`);
    }

    /**
     * パネル要素作成
     */
    private createPanelElement(config: PanelConfig): void {
        const panelElement = document.createElement('div');
        panelElement.id = `debug-panel-${config.id}`;
        panelElement.className = 'debug-panel';
        panelElement.style.display = config.visible ? 'block' : 'none';
        panelElement.innerHTML = config.content;
        
        this.panelElements.set(config.id, panelElement);
        
        // コンテナに追加
        if (this.mainController.container) {
            this.mainController.container.appendChild(panelElement);
        }
    }

    /**
     * パネルをアクティブ化
     */
    activatePanel(panelId: string): boolean {
        const config = this.panels.get(panelId);
        if (!config) {
            console.warn(`Panel not found: ${panelId}`);
            return false;
        }

        // 現在のパネルを非アクティブ化
        if (this.activePanel) {
            this.deactivatePanel(this.activePanel);
        }

        // パネルをアクティブ化
        const element = this.panelElements.get(panelId);
        if (element) {
            element.style.display = 'block';
        }

        // 履歴を更新
        this.panelHistory.push(panelId);
        this.activePanel = panelId;
        this.panelStatistics.switchCount++;

        // コールバック実行
        if (config.onActivate) {
            config.onActivate();
        }

        console.log(`Panel activated: ${panelId}`);
        return true;
    }

    /**
     * パネルを非アクティブ化
     */
    deactivatePanel(panelId: string): boolean {
        const config = this.panels.get(panelId);
        if (!config) {
            return false;
        }

        // パネルを非表示
        const element = this.panelElements.get(panelId);
        if (element) {
            element.style.display = 'none';
        }

        // コールバック実行
        if (config.onDeactivate) {
            config.onDeactivate();
        }

        if (this.activePanel === panelId) {
            this.activePanel = null;
        }

        console.log(`Panel deactivated: ${panelId}`);
        return true;
    }

    /**
     * パネル切り替え
     */
    switchToPanel(panelId: string): boolean {
        return this.activatePanel(panelId);
    }

    /**
     * 前のパネルに戻る
     */
    goToPreviousPanel(): boolean {
        if (this.panelHistory.length < 2) {
            return false;
        }

        // 現在のパネルを履歴から削除
        this.panelHistory.pop();
        // 前のパネルを取得
        const previousPanelId = this.panelHistory.pop();
        
        if (previousPanelId) {
            return this.activatePanel(previousPanelId);
        }

        return false;
    }

    /**
     * デフォルトパネル登録
     */
    private registerDefaultPanels(): void {
        this.registerPanel({
            id: 'overview',
            name: 'Overview',
            content: '<div class="overview-panel">Debug Overview</div>',
            visible: false,
            order: 1,
            icon: '📊',
            shortcut: 'Ctrl+Shift+O',
            category: 'general',
            description: 'Debug system overview and status'
        });

        this.registerPanel({
            id: 'console',
            name: 'Console',
            content: '<div class="console-panel">Debug Console</div>',
            visible: false,
            order: 2,
            icon: '💻',
            shortcut: 'Ctrl+Shift+C',
            category: 'general',
            description: 'Interactive debug console'
        });

        this.registerPanel({
            id: 'performance',
            name: 'Performance',
            content: '<div class="performance-panel">Performance Monitor</div>',
            visible: false,
            order: 3,
            icon: '⚡',
            shortcut: 'Ctrl+Shift+P',
            category: 'monitoring',
            description: 'Performance metrics and monitoring'
        });

        this.registerPanel({
            id: 'errors',
            name: 'Errors',
            content: '<div class="errors-panel">Error Log</div>',
            visible: false,
            order: 4,
            icon: '❌',
            shortcut: 'Ctrl+Shift+E',
            category: 'monitoring',
            description: 'Error logs and exception tracking'
        });
    }

    /**
     * イベントハンドラー設定
     */
    private setupPanelEventHandlers(): void {
        // キーボードショートカット処理
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });
    }

    /**
     * キーボードショートカット処理
     */
    private handleKeyboardShortcuts(event: KeyboardEvent): void {
        if (!event.ctrlKey || !event.shiftKey) {
            return;
        }

        for (const [panelId, config] of this.panels) {
            if (config.shortcut && this.matchesShortcut(event, config.shortcut)) {
                event.preventDefault();
                this.activatePanel(panelId);
                break;
            }
        }
    }

    /**
     * ショートカット一致判定
     */
    private matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
        const key = event.key.toLowerCase();
        const shortcutKey = shortcut.toLowerCase().split('+').pop();
        return key === shortcutKey;
    }

    /**
     * パネル一覧取得
     */
    getPanels(): PanelConfig[] {
        return Array.from(this.panels.values()).sort((a, b) => a.order - b.order);
    }

    /**
     * アクティブパネル取得
     */
    getActivePanel(): string | null {
        return this.activePanel;
    }

    /**
     * パネル統計取得
     */
    getStatistics(): PanelStatistics {
        return {
            ...this.panelStatistics,
            activePanels: this.activePanel ? 1 : 0
        };
    }

    /**
     * パネル削除
     */
    removePanel(panelId: string): boolean {
        const config = this.panels.get(panelId);
        if (!config) {
            return false;
        }

        // アクティブパネルの場合は非アクティブ化
        if (this.activePanel === panelId) {
            this.deactivatePanel(panelId);
        }

        // 要素を削除
        const element = this.panelElements.get(panelId);
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }

        // マップから削除
        this.panels.delete(panelId);
        this.panelElements.delete(panelId);
        
        // 履歴から削除
        this.panelHistory = this.panelHistory.filter(id => id !== panelId);

        this.panelStatistics.totalPanels = this.panels.size;

        console.log(`Panel removed: ${panelId}`);
        return true;
    }

    /**
     * 全パネルクリア
     */
    clearAllPanels(): void {
        // 全パネルを非アクティブ化
        for (const panelId of this.panels.keys()) {
            this.deactivatePanel(panelId);
        }

        // 要素を削除
        for (const element of this.panelElements.values()) {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }

        // データクリア
        this.panels.clear();
        this.panelElements.clear();
        this.panelHistory = [];
        this.activePanel = null;
        this.panelStatistics.totalPanels = 0;
        this.panelStatistics.activePanels = 0;

        console.log('All panels cleared');
    }

    /**
     * クリーンアップ
     */
    destroy(): void {
        this.clearAllPanels();
        console.log('DebugPanelManager destroyed');
    }
}

export default DebugPanelManager;