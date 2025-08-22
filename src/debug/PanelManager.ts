/**
 * Panel Manager
 * デバッグパネルのライフサイクル管理とステート管理システム
 */

interface GameEngine {
    // Game engine interface
}

interface DebugInterface {
    gameEngine?: GameEngine;
    debugPanel: HTMLElement;
    switchPanel(name: string): void;
}

interface PanelInstance {
    show?(): void;
    hide?(): void;
    destroy?(): void;
    getState?(): any;
    setState?(state: any): void;
}

interface PanelOptions {
    name: string;
    config: PanelConfig;
    savedState?: PanelState;
    panelManager: PanelManager;
}

interface PanelConfig {
    title: string;
    icon: string;
    order: number;
    enabled: boolean;
    persistent: boolean;
    cacheable: boolean;
    lazy: boolean;
    resizable: boolean;
    minimizable: boolean;
    closable: boolean;
}

interface PanelInfo {
    name: string;
    PanelClass: PanelClass;
    instance: PanelInstance | null;
    config: PanelConfig;
    created: boolean;
    visible: boolean;
    lastActivated: number | null;
    activationCount: number;
    renderTime: number;
}

interface PanelState {
    position: { x: number; y: number };
    size: { width: number; height: number };
    minimized: boolean;
    settings: Record<string, any>;
    data: Record<string, any>;
    history: any[];
    lastUpdated: number;
}

interface PanelClass {
    new(gameEngine?: GameEngine, debugInterface?: DebugInterface, options?: PanelOptions): PanelInstance;
}

interface LifecycleHooks {
    beforeCreate: Set<LifecycleCallback>;
    created: Set<LifecycleCallback>;
    beforeShow: Set<LifecycleCallback>;
    shown: Set<LifecycleCallback>;
    beforeHide: Set<LifecycleCallback>;
    hidden: Set<LifecycleCallback>;
    beforeDestroy: Set<LifecycleCallback>;
    destroyed: Set<LifecycleCallback>;
}

interface StateManager {
    saveEnabled: boolean;
    storageKey: string;
    maxStateHistory: number;
}

interface PanelStatistics {
    total: number;
    created: number;
    visible: number;
    cached: number;
    totalActivations: number;
    totalRenderTime: number;
    panels: Record<string, {
        created: boolean;
        visible: boolean;
        activations: number;
        renderTime: number;
        lastActivated: number | null;
    }>;
}

type LifecycleCallback = (panelName: string, data: any) => void;

export class PanelManager {
    private debugInterface: DebugInterface;
    private panels: Map<string, PanelInfo>;
    private panelStates: Map<string, PanelState>;
    private panelConfigs: Map<string, PanelConfig>;
    private lifecycleHooks: LifecycleHooks;
    private stateManager: StateManager;
    private autoSaveInterval?: NodeJS.Timeout;

    constructor(debugInterface: DebugInterface) {

        this.debugInterface = debugInterface;
        this.panels = new Map();
        this.panelStates = new Map();
        this.panelConfigs = new Map();
        
        // パネルライフサイクル
        this.lifecycleHooks = {
            beforeCreate: new Set(),
            created: new Set(),
            beforeShow: new Set(),
            shown: new Set(),
            beforeHide: new Set(),
            hidden: new Set(),
            beforeDestroy: new Set(),
            destroyed: new Set()
        };
        
        // パネル状態管理
        this.stateManager = {
            saveEnabled: true,
            storageKey: 'debug-panel-states',
            maxStateHistory: 10
        };
        this.initialize();
    }

    private initialize(): void {
        this.loadPanelStates();
        this.setupStateAutoSave();
    }

    /**
     * パネルの登録
     * @param name - パネル名
     * @param PanelClass - パネルクラス
     * @param config - パネル設定
     * @returns 登録成功可否
     */
    public registerPanel(name: string, PanelClass: PanelClass, config: Partial<PanelConfig> = {}): boolean {
        if (this.panels.has(name)) {
            console.warn(`Panel '${name}' is already registered`);
            return false;
        }

        try {
            // ライフサイクルフック実行
            this.executeLifecycleHook('beforeCreate', name, { PanelClass, config });

            // パネル設定の設定
            const defaultConfig: PanelConfig = {
                title: name,
                icon: '📋',
                order: 100,
                enabled: true,
                persistent: false,
                cacheable: true,
                lazy: true,
                resizable: true,
                minimizable: true,
                closable: false
            };
            const panelConfig = { ...defaultConfig, ...config };
            this.panelConfigs.set(name, panelConfig);
            
            // パネルインスタンス作成（lazy でなければ即座に作成）
            let panelInstance: PanelInstance | null = null;
            if (!panelConfig.lazy) {
                panelInstance = this.createPanelInstance(name, PanelClass);
            }

            // パネル情報を登録
            this.panels.set(name, {
                name,
                PanelClass,
                instance: panelInstance,
                config: panelConfig,
                created: !panelConfig.lazy,
                visible: false,
                lastActivated: null,
                activationCount: 0,
                renderTime: 0
            });
            
            // パネルステートの初期化
            this.initializePanelState(name);
            
            // UI要素の追加
            this.addPanelToUI(name, panelConfig);

            // ライフサイクルフック実行
            this.executeLifecycleHook('created', name, { panelInstance, config: panelConfig });

            console.log(`Panel '${name}' registered successfully`);
            return true;

        } catch (error) {
            console.error(`Failed to register panel '${name}':`, error);
            this.cleanupFailedRegistration(name);
            return false;
        }
    }

    /**
     * パネルインスタンスの作成
     * @param name - パネル名
     * @param PanelClass - パネルクラス
     * @returns パネルインスタンス
     */
    private createPanelInstance(name: string, PanelClass: PanelClass): PanelInstance {
        const config = this.panelConfigs.get(name);
        const savedState = this.panelStates.get(name);
        return new PanelClass(this.debugInterface.gameEngine, this.debugInterface, {
            name,
            config: config!,
            savedState,
            panelManager: this
        });
    }

    /**
     * パネルの表示
     * @param name - パネル名
     * @returns 表示成功可否
     */
    public showPanel(name: string): boolean {
        const panelInfo = this.panels.get(name);
        if (!panelInfo) {
            console.warn(`Panel '${name}' not found`);
            return false;
        }

        if (!panelInfo.config.enabled) {
            console.warn(`Panel '${name}' is disabled`);
            return false;
        }

        try {
            // ライフサイクルフック実行
            this.executeLifecycleHook('beforeShow', name, panelInfo);
            
            // Lazy loading の場合、初回表示時にインスタンス作成
            if (!panelInfo.instance && panelInfo.config.lazy) {
                panelInfo.instance = this.createPanelInstance(name, panelInfo.PanelClass);
                panelInfo.created = true;
            }

            // パネルの表示処理
            const startTime = performance.now();
            if (panelInfo.instance && typeof panelInfo.instance.show === 'function') {
                panelInfo.instance.show();
            }

            // パネル情報の更新
            panelInfo.visible = true;
            panelInfo.lastActivated = Date.now();
            panelInfo.activationCount++;
            panelInfo.renderTime = performance.now() - startTime;

            // UI の更新
            this.updatePanelUI(name, true);
            
            // ステートの保存
            this.savePanelState(name);

            // ライフサイクルフック実行
            this.executeLifecycleHook('shown', name, panelInfo);

            return true;

        } catch (error) {
            console.error(`Failed to show panel '${name}':`, error);
            return false;
        }
    }

    /**
     * パネルの非表示
     * @param name - パネル名
     * @returns 非表示成功可否
     */
    public hidePanel(name: string): boolean {
        const panelInfo = this.panels.get(name);
        if (!panelInfo || !panelInfo.visible) {
            return false;
        }

        try {
            // ライフサイクルフック実行
            this.executeLifecycleHook('beforeHide', name, panelInfo);

            // パネルの非表示処理
            if (panelInfo.instance && typeof panelInfo.instance.hide === 'function') {
                panelInfo.instance.hide();
            }

            // パネル情報の更新
            panelInfo.visible = false;

            // UI の更新
            this.updatePanelUI(name, false);

            // ステートの保存
            this.savePanelState(name);

            // キャッシュ不可の場合、インスタンスを破棄
            if (!panelInfo.config.cacheable && !panelInfo.config.persistent) {
                this.destroyPanelInstance(name);
            }

            // ライフサイクルフック実行
            this.executeLifecycleHook('hidden', name, panelInfo);

            return true;

        } catch (error) {
            console.error(`Failed to hide panel '${name}':`, error);
            return false;
        }
    }

    /**
     * パネルの破棄
     * @param name - パネル名
     * @returns 破棄成功可否
     */
    public destroyPanel(name: string): boolean {
        const panelInfo = this.panels.get(name);
        if (!panelInfo) {
            return false;
        }

        try {
            // ライフサイクルフック実行
            this.executeLifecycleHook('beforeDestroy', name, panelInfo);
            
            // パネルが表示中の場合は非表示にする
            if (panelInfo.visible) {
                this.hidePanel(name);
            }

            // インスタンスの破棄
            this.destroyPanelInstance(name);

            // UI要素の削除
            this.removePanelFromUI(name);

            // 登録情報の削除
            this.panels.delete(name);
            this.panelConfigs.delete(name);
            
            // ステートの削除（persistent でない場合）
            if (!panelInfo.config.persistent) {
                this.panelStates.delete(name);
            }

            // ライフサイクルフック実行
            this.executeLifecycleHook('destroyed', name, { name });

            console.log(`Panel '${name}' destroyed successfully`);
            return true;

        } catch (error) {
            console.error(`Failed to destroy panel '${name}':`, error);
            return false;
        }
    }

    /**
     * パネルインスタンスの破棄
     * @param name - パネル名
     */
    private destroyPanelInstance(name: string): void {
        const panelInfo = this.panels.get(name);
        if (panelInfo && panelInfo.instance) {
            if (typeof panelInfo.instance.destroy === 'function') {
                panelInfo.instance.destroy();
            }
            panelInfo.instance = null;
            panelInfo.created = false;
        }
    }

    /**
     * パネルステートの初期化
     * @param name - パネル名
     */
    private initializePanelState(name: string): void {
        if (!this.panelStates.has(name)) {
            this.panelStates.set(name, {
                position: { x: 0, y: 0 },
                size: { width: 300, height: 400 },
                minimized: false,
                settings: {},
                data: {},
                history: [],
                lastUpdated: Date.now()
            });
        }
    }
    /**
     * パネルステートの保存
     * @param name - パネル名
     */
    private savePanelState(name: string): void {
        if (!this.stateManager.saveEnabled) return;

        const panelInfo = this.panels.get(name);
        const currentState = this.panelStates.get(name);
        if (panelInfo && panelInfo.instance && currentState) {
            // インスタンスから現在の状態を取得
            if (typeof panelInfo.instance.getState === 'function') {
                const instanceState = panelInfo.instance.getState();
                Object.assign(currentState, instanceState);
            }

            currentState.lastUpdated = Date.now();
            this.panelStates.set(name, currentState);

            // 自動保存の実行
            this.autoSavePanelStates();
        }
    }

    /**
     * パネルステートの復元
     * @param name - パネル名
     */
    public restorePanelState(name: string): void {
        const panelInfo = this.panels.get(name);
        const savedState = this.panelStates.get(name);
        if (panelInfo && panelInfo.instance && savedState) {
            if (typeof panelInfo.instance.setState === 'function') {
                panelInfo.instance.setState(savedState);
            }
        }
    }
    /**
     * UIにパネルタブを追加
     * @param name - パネル名  
     * @param config - パネル設定
     */
    private addPanelToUI(name: string, config: PanelConfig): void {
        const tabsContainer = this.debugInterface.debugPanel.querySelector('.debug-tabs');
        if (!tabsContainer) return;

        const newTab = document.createElement('button');
        newTab.className = 'debug-tab';
        newTab.dataset.panel = name;
        newTab.innerHTML = `${config.icon} ${config.title}`;
        newTab.title = config.title;

        if (!config.enabled) {
            newTab.classList.add('disabled');
            (newTab as HTMLButtonElement).disabled = true;
        }
        // 順序に基づいて挿入位置を決定
        const existingTabs = Array.from(tabsContainer.querySelectorAll('.debug-tab'));
        let insertIndex = existingTabs.length;
        
        for (let i = 0; i < existingTabs.length; i++) {
            const tabName = (existingTabs[i] as HTMLElement).dataset.panel;
            const tabConfig = tabName ? this.panelConfigs.get(tabName) : null;
            
            if (tabConfig && tabConfig.order > config.order) {
                insertIndex = i;
                break;
            }
        }

        if (insertIndex >= existingTabs.length) {
            tabsContainer.appendChild(newTab);
        } else {
            tabsContainer.insertBefore(newTab, existingTabs[insertIndex]);
        }

        // パネルコンテンツエリアの追加
        this.addPanelContentArea(name);

        // クリックイベントの設定
        newTab.addEventListener('click', () => {
            if (config.enabled) {
                this.debugInterface.switchPanel(name);
            }
        });
    }
    /**
     * パネルコンテンツエリアの追加
     * @param name - パネル名
     */
    private addPanelContentArea(name: string): void {
        const contentContainer = this.debugInterface.debugPanel.querySelector('.debug-content');
        if (!contentContainer) return;

        const newPanel = document.createElement('div');
        newPanel.id = `panel-${name}`;
        newPanel.className = 'debug-panel';
        newPanel.innerHTML = '<div class="panel-loading">Loading...</div>';
        contentContainer.appendChild(newPanel);
    }

    /**
     * UIからパネルを削除
     * @param name - パネル名
     */
    private removePanelFromUI(name: string): void {
        // タブの削除
        const tab = this.debugInterface.debugPanel.querySelector(`[data-panel="${name}"]`);
        if (tab) {
            tab.remove();
        }

        // パネルコンテンツの削除
        const panel = document.getElementById(`panel-${name}`);
        if (panel) {
            panel.remove();
        }
    }
    /**
     * パネルUIの更新
     * @param name - パネル名
     * @param visible - 表示状態
     */
    private updatePanelUI(name: string, visible: boolean): void {
        const tab = this.debugInterface.debugPanel.querySelector(`[data-panel="${name}"]`);
        const panel = document.getElementById(`panel-${name}`);

        if (visible) {
            if (tab) tab.classList.add('active');
            if (panel) panel.classList.add('active');
        } else {
            if (tab) tab.classList.remove('active');
            if (panel) panel.classList.remove('active');
        }
    }

    /**
     * ライフサイクルフックの実行
     * @param hookName - フック名
     * @param panelName - パネル名
     * @param data - フックデータ
     */
    private executeLifecycleHook(hookName: keyof LifecycleHooks, panelName: string, data: any): void {
        const hooks = this.lifecycleHooks[hookName];
        if (hooks) {
            hooks.forEach(callback => {
                try {
                    callback(panelName, data);
                } catch (error) {
                    console.error(`Error in lifecycle hook '${hookName}' for panel '${panelName}':`, error);
                }
            });
        }
    }

    /**
     * ライフサイクルフックの登録
     * @param hookName - フック名
     * @param callback - コールバック関数
     */
    public addLifecycleHook(hookName: keyof LifecycleHooks, callback: LifecycleCallback): void {
        if (this.lifecycleHooks[hookName]) {
            this.lifecycleHooks[hookName].add(callback);
        } else {
            console.warn(`Unknown lifecycle hook: ${hookName}`);
        }
    }

    /**
     * ライフサイクルフックの削除
     * @param hookName - フック名
     * @param callback - コールバック関数
     */
    public removeLifecycleHook(hookName: keyof LifecycleHooks, callback: LifecycleCallback): void {
        if (this.lifecycleHooks[hookName]) {
            this.lifecycleHooks[hookName].delete(callback);
        }
    }

    /**
     * パネルステートの自動保存設定
     */
    private setupStateAutoSave(): void {
        if (this.stateManager.saveEnabled) {
            // 定期的な自動保存
            this.autoSaveInterval = setInterval(() => {
                this.autoSavePanelStates();
            }, 5000); // 5秒間隔

            // ページアンロード時の保存
            window.addEventListener('beforeunload', () => {
                this.savePanelStates();
            });
        }
    }

    /**
     * パネルステートの自動保存
     */
    private autoSavePanelStates(): void {
        if (this.panelStates.size === 0) return;

        try {
            const stateData: Record<string, PanelState> = {};
            for (const [name, state] of this.panelStates) {
                stateData[name] = state;
            }

            localStorage.setItem(this.stateManager.storageKey, JSON.stringify(stateData));
        } catch (error) {
            console.warn('Failed to auto-save panel states:', error);
        }
    }

    /**
     * パネルステートの読み込み
     */
    private loadPanelStates(): void {
        try {
            const saved = localStorage.getItem(this.stateManager.storageKey);
            if (saved) {
                const stateData = JSON.parse(saved);
                for (const [name, state] of Object.entries(stateData)) {
                    this.panelStates.set(name, state as PanelState);
                }
            }
        } catch (error) {
            console.warn('Failed to load panel states:', error);
        }
    }

    /**
     * パネルステートの保存
     */
    public savePanelStates(): void {
        this.autoSavePanelStates();
    }

    /**
     * 失敗した登録のクリーンアップ
     * @param name - パネル名
     */
    private cleanupFailedRegistration(name: string): void {
        this.panels.delete(name);
        this.panelConfigs.delete(name);
        this.removePanelFromUI(name);
    }

    /**
     * パネル情報の取得
     * @param name - パネル名
     * @returns パネル情報
     */
    public getPanelInfo(name: string): PanelInfo | null {
        return this.panels.get(name) || null;
    }

    /**
     * 全パネル情報の取得
     * @returns パネル情報配列
     */
    public getAllPanels(): PanelInfo[] {
        return Array.from(this.panels.values());
    }

    /**
     * 表示中のパネル一覧の取得
     * @returns 表示中パネル名配列
     */
    public getVisiblePanels(): string[] {
        return Array.from(this.panels.entries())
            .filter(([, info]) => info.visible)
            .map(([name]) => name);
    }

    /**
     * パネル統計情報の取得
     * @returns 統計情報
     */
    public getPanelStatistics(): PanelStatistics {
        const stats: PanelStatistics = {
            total: this.panels.size,
            created: 0,
            visible: 0,
            cached: 0,
            totalActivations: 0,
            totalRenderTime: 0,
            panels: {}
        };

        for (const [name, info] of this.panels) {
            if (info.created) stats.created++;
            if (info.visible) stats.visible++;
            if (info.instance && info.config.cacheable) stats.cached++;
            
            stats.totalActivations += info.activationCount;
            stats.totalRenderTime += info.renderTime;

            stats.panels[name] = {
                created: info.created,
                visible: info.visible,
                activations: info.activationCount,
                renderTime: info.renderTime,
                lastActivated: info.lastActivated
            };
        }

        return stats;
    }

    /**
     * クリーンアップ
     */
    public destroy(): void {
        // 自動保存の停止
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        // 最終保存
        this.savePanelStates();

        // 全パネルの破棄
        for (const name of this.panels.keys()) {
            this.destroyPanel(name);
        }

        // イベントリスナーの削除
        window.removeEventListener('beforeunload', this.savePanelStates.bind(this));

        console.log('PanelManager destroyed');
    }
}

// デフォルトエクスポート
export default PanelManager;