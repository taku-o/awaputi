import { BaseComponent  } from '../BaseComponent.js';

// Type definitions
interface PanelConfig { id: string;
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

interface PanelStatistics { totalPanels: number;
    activePanels: number;
    switchCount: number;
    sessionStartTime: number;

interface MainController { container?: HTMLElement;

/**
 * DebugPanelManager - デバッグパネルの管理コンポーネント
 */
export class DebugPanelManager extends BaseComponent { private panels: Map<string, PanelConfig>,
    private panelHistory: string[];
    private activePanel: string | null;
    private, panelElements: Map<string, HTMLElement>,
    private panelStatistics: PanelStatistics;

    constructor(mainController: MainController) {

        super(mainController, 'DebugPanelManager),'
        this.panels = new Map<string, PanelConfig>(),
        this.panelHistory = [];
        this.activePanel = null;
        this.panelElements = new Map<string, HTMLElement>(),
        this.panelStatistics = {
            totalPanels: 0;
            activePanels: 0;
    switchCount: 0 }
            sessionStartTime: Date.now(); 
    }

    async _doInitialize(): Promise<void> { this.registerDefaultPanels();
        this.setupPanelEventHandlers() }

    /**
     * パネルを登録
     * @param id - パネルID
     * @param config - パネル設定'
     */''
    registerPanel(id: string, config: Partial<PanelConfig>): void { const panelConfig: PanelConfig = {
            id: id;
            name: config.name || id;
            content: config.content || ','
    visible: config.visible !== false;
            order: config.order || this.panels.size;
            icon: config.icon || ','
            shortcut: config.shortcut || ','
            category: config.category || 'general';
            description: config.description || ','
            ...config,

        this.panels.set(id, panelConfig);
        this.panelStatistics.totalPanels++,

        // パネルタブを作成
        this.addPanelTab(id, panelConfig);
        // パネルコンテンツを作成
        this.addPanelContent(id, panelConfig) }

    /**
     * パネルタブを追加
     * @param id - パネルID
     * @param config - パネル設定
     */''
    addPanelTab(id: string, config: PanelConfig): void { const controller = this.mainController as MainController;
        const tabsContainer = controller.container?.querySelector('.debug-tabs',
        if(!tabsContainer) return,

        const tab = document.createElement('div'), : undefined' 
        tab.className = `debug-tab ${config.visible ? 'active' : '}`;'
        tab.dataset.panelId = id;

        tab.innerHTML = `';'
            ${config.icon ? `<span, class="tab-icon">${config.icon}</span>` : '}''
            <span class="tab-label">${config.name}</span>""
            ${config.shortcut ? `<span, class="tab-shortcut">${config.shortcut}</span>` : ''
        `;
';'
        // クリックイベント
        tab.addEventListener('click', () => this.switchPanel(id));
        ';'
        // キーボードナビゲーション
        tab.setAttribute('tabindex', '0');
        tab.addEventListener('keydown', (e) => {  ''
            if (e.key === 'Enter' || e.key === ', ') {
    
}
                e.preventDefault(); }
                this.switchPanel(id); }
};

        tabsContainer.appendChild(tab);
        this.panelElements.set(`${id}-tab`, tab);
    }

    /**
     * パネルコンテンツを追加
     * @param id - パネルID'
     * @param config - パネル設定'
     */''
    addPanelContent(id: string, config: PanelConfig): void { const controller = this.mainController as MainController;
        const contentContainer = controller.container?.querySelector('.debug-content',
        if(!contentContainer) return,

        const content = document.createElement('div'), : undefined' 
        content.className = `debug-panel-content ${config.visible ? 'active' : '}`;'
        content.dataset.panelId = id;
        content.innerHTML = config.content || `<p>Panel: ${config.name}</p>`;

        contentContainer.appendChild(content);
        this.panelElements.set(`${id}-content`, content);
    }

    /**
     * パネルを切り替え
     * @param panelId - 切り替え先パネルID
     */
    switchPanel(panelId: string): void { const panel = this.panels.get(panelId);
        if (!panel) { }
            console.warn(`Panel, not found: ${panelId}`};
            return;
        }

        // 現在のアクティブパネルを非アクティブに
        if (this.activePanel) { this.deactivatePanel(this.activePanel) }

        // 新しいパネルをアクティブに
        this.activatePanel(panelId);
        
        // 履歴に追加
        this.addToHistory(panelId);
        
        // 統計を更新
        this.panelStatistics.switchCount++;
        
        // イベント通知
        this.notifyPanelSwitch(this.activePanel, panelId);
        
        this.activePanel = panelId;
        
        // UI更新
        this.updatePanelUI();
    }

    /**
     * パネルをアクティブ化
     * @param panelId - パネルID
     */
    activatePanel(panelId: string): void { const tab = this.panelElements.get(`${panelId)-tab`),
        const, content = this.panelElements.get(`${panelId)-content`};

        if(tab} {', ' }

            tab.classList.add('active');' }'

            tab.setAttribute('aria-selected', 'true'};
        }

        if (content) {

            content.classList.add('active') }

            content.setAttribute('aria-hidden', 'false); }'
        }

        // パネル固有の初期化処理
        const panel = this.panels.get(panelId);
        if (panel?.onActivate) { panel.onActivate() }
    }

    /**
     * パネルを非アクティブ化
     * @param panelId - パネルID
     */ : undefined
    deactivatePanel(panelId: string): void { const tab = this.panelElements.get(`${panelId)-tab`),
        const, content = this.panelElements.get(`${panelId)-content`};

        if(tab} {', ' }

            tab.classList.remove('active');' }'

            tab.setAttribute('aria-selected', 'false'};
        }

        if (content) {

            content.classList.remove('active') }

            content.setAttribute('aria-hidden', 'true); }'
        }

        // パネル固有のクリーンアップ処理
        const panel = this.panels.get(panelId);
        if (panel?.onDeactivate) { panel.onDeactivate() }
    }

    /**
     * パネル履歴に追加
     * @param panelId - パネルID
     */ : undefined
    addToHistory(panelId: string): void { // 重複を避けるため、既存の履歴から削除
        this.panelHistory = this.panelHistory.filter(id => id !== panelId);
        
        // 先頭に追加
        this.panelHistory.unshift(panelId);
        // 履歴の長さを制限（最大20件）
        if (this.panelHistory.length > 20) {
    
}
            this.panelHistory = this.panelHistory.slice(0, 20); }
}

    /**
     * パネル切り替えイベントを通知
     * @param fromPanel - 切り替え元パネル
     * @param toPanel - 切り替え先パネル
     */''
    notifyPanelSwitch(fromPanel: string | null, toPanel: string): void { ''
        const event = new CustomEvent('panelSwitch', {
            };
            detail: { from: fromPanel, to: toPanel, timestamp: Date.now(  };
        const controller = this.mainController as MainController;
        if (controller.container) { controller.container.dispatchEvent(event) }
    }

    /**
     * パネルUIを更新'
     */''
    updatePanelUI()';'
        const statusElement = controller.container?.querySelector('.debug-status);'
        if (statusElement && this.activePanel) { const panel = this.panels.get(this.activePanel), : undefined 
            statusElement.textContent = `Active: ${panel?.name }`,
        }

        // パネル統計の更新
        this.updatePanelStatistics();
    }

    /**
     * パネル統計を更新
     */ : undefined
    updatePanelStatistics(): void { this.panelStatistics.activePanels = Array.from(this.panels.values()
            .filter(panel => panel.visible).length,
        ','

        const controller = this.mainController as MainController,
        const statsElement = controller.container?.querySelector('.panel-statistics),'
        if (statsElement) {
    
}
            statsElement.innerHTML = ` : undefined 
                <div>Total Panels: ${this.panelStatistics.totalPanels}</div>
                <div>Active Panels: ${this.panelStatistics.activePanels}</div>
                <div>Switch Count: ${this.panelStatistics.switchCount}</div>
            `;
        }
    }

    /**
     * デフォルトパネルを登録'
     */''
    registerDefaultPanels('''
        this.registerPanel('console', { ''
            name: 'Console',
            icon: '💻',
            shortcut: 'Ctrl+1',','
            category: 'development',')',
            content: '<div class="console-output"></div><input type="text" class="console-input" placeholder="Enter command...">',
            onActivate: () => this.focusConsoleInput('''
        this.registerPanel('performance', {''
            name: 'Performance',
            icon: '📊',
            shortcut: 'Ctrl+2',','
            category: 'monitoring',')',
            content: '<div class="performance-charts"></div>',
            onActivate: () => this.updatePerformanceData('''
        this.registerPanel('memory', {''
            name: 'Memory',
            icon: '🧠',
            shortcut: 'Ctrl+3',','
            category: 'monitoring',')',
            content: '<div class="memory-usage"></div>')'),'
','
        // Network パネル
        this.registerPanel('network', {''
            name: 'Network',
            icon: '🌐',
            shortcut: 'Ctrl+4',','
            category: 'monitoring',')',
            content: '<div class="network-requests"></div>')'),'
','
        // Settings パネル
        this.registerPanel('settings', {''
            name: 'Settings',
            icon: '⚙️',
            shortcut: 'Ctrl+5',','
            category: 'configuration',')',
            content: '<div class="debug-settings"></div>')  }
    }

    /**
     * パネルイベントハンドラーを設定
     */
    setupPanelEventHandlers(): void { // パネル切り替えのキーボードショートカット処理は
        // DebugCommandProcessorで処理される }

    /**
     * コンソール入力にフォーカス
     */''
    focusConsoleInput()';'
        const input = this.panelElements.get('console-content')?.querySelector('.console-input) as HTMLInputElement;'
        if (input) { setTimeout(() => input.focus(), 100) }
}

    /**
     * パフォーマンスデータを更新'
     */ : undefined''
    updatePerformanceData()';'
        const chartsContainer = this.panelElements.get('performance-content')?.querySelector('.performance-charts';
        if (chartsContainer) { chartsContainer.innerHTML = ` : undefined''
                <div class="chart">FPS: ${Math.floor(Math.random( } * 60 + 30"}"</div>""
                <div class="chart">Memory: ${Math.floor(Math.random() * 100 + 50"}"MB</div>""
                <div class="chart">CPU: ${Math.floor(Math.random() * 50 + 20}%</div>
            `;
        }
    }

    // === 公開API ===

    /**
     * アクティブパネルを取得
     * @returns アクティブパネルID
     */
    getActivePanel(): string | null { return this.activePanel }

    /**
     * パネル履歴を取得
     * @returns パネル履歴
     */
    getPanelHistory(): string[] { return [...this.panelHistory],

    /**
     * 登録されたパネル一覧を取得
     * @returns パネル設定配列
     */
    getRegisteredPanels(): PanelConfig[] { return Array.from(this.panels.values() }

    /**
     * パネル情報を取得
     * @param panelId - パネルID
     * @returns パネル情報
     */
    getPanelInfo(panelId: string): PanelConfig | null { return this.panels.get(panelId) || null }

    /**
     * 全パネル一覧を取得
     * @returns パネルMap
     */
    getAllPanels(): Map<string, PanelConfig> { return new Map(this.panels) }

    /**
     * 表示中のパネル一覧を取得
     * @returns 表示中パネル配列
     */
    getVisiblePanels(): PanelConfig[] { return Array.from(this.panels.values().filter(panel => panel.visible);
    /**
     * パネル統計を取得
     * @returns 統計情報
     */
    getPanelStatistics(): PanelStatistics {
        return { ...this.panelStatistics }

    /**
     * パネルの表示/非表示を切り替え
     * @param panelId - パネルID
     * @param visible - 表示フラグ
     */
    setPanelVisibility(panelId: string, visible: boolean): void { const panel = this.panels.get(panelId);
        if (panel) {
            panel.visible = visible,
            const tab = this.panelElements.get(`${panelId)-tab`),
            const, content = this.panelElements.get(`${panelId}-content`}"
            " }"
            if (tab"}"", " }"
                tab.style.display = visible ? 'block' : 'none'; 
    }''
            if(content) {', ' }

                content.style.display = visible ? 'block' : 'none'; 
    }
            
            this.updatePanelStatistics();
        }
    }

    /**
     * パネルコンテンツを更新
     * @param panelId - パネルID
     * @param content - 新しいコンテンツ
     */
    updatePanelContent(panelId: string, content: string): void { const panel = this.panels.get(panelId);
        const contentElement = this.panelElements.get(`${panelId}-content`}
        if (panel && contentElement} {
            panel.content = content }
            contentElement.innerHTML = content; }
}

    /**
     * パネルを削除
     * @param panelId - パネルID
     */
    removePanel(panelId: string): void { if (this.panels.has(panelId) {
            // アクティブパネルの場合は他のパネルに切り替え
            if (this.activePanel === panelId) {
                const remainingPanels = Array.from(this.panels.keys().filter(id => id !== panelId);
                if (remainingPanels.length > 0) {
            }
                    this.switchPanel(remainingPanels[0]); }
}

            // パネル要素を削除
            const tab = this.panelElements.get(`${ panelId)-tab`),
            const, content = this.panelElements.get(`${panelId)-content`),
            
            if (tab) tab.remove();
            if (content) content.remove();
            // データ構造から削除
            this.panels.delete(panelId);
            this.panelElements.delete(`${panelId)-tab`),
            this.panelElements.delete(`${panelId)-content`};
            this.panelHistory = this.panelHistory.filter(id => id !== panelId};
            
            this.panelStatistics.totalPanels--; }
            this.updatePanelStatistics(};
        }
    }

    /**
     * クリーンアップ
     */
    cleanup(): void { // イベントリスナーの削除
        for (const element of this.panelElements.values() {
    
}
            element.remove(); }
        }
        
        // データクリア
        this.panels.clear();
        this.panelElements.clear();
        this.panelHistory = [];
        this.activePanel = null;

        super.cleanup();