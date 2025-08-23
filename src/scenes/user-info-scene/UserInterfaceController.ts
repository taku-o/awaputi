/**
 * User Interface Controller
 * ユーザーインターフェース制御 - UI制御、イベント処理、表示管理
 */

// Import types
import type { GameEngine } from '../../core/GameEngine';
import type { EventBus } from '../../core/EventBus';

// Tab interface
interface Tab {
    id: TabId;
    label: string;
    icon: string;
}

// Tab ID type
type TabId = 'profile' | 'statistics' | 'achievements' | 'data' | 'help';

// Dialog type
type DialogType = 'username' | 'export' | 'import' | null;

// UI state interface
interface UIState {
    currentTab: TabId;
    isDialogOpen: boolean;
    activeDialog: DialogType;
    lastUpdateTime: number;
    needsUpdate: boolean;
}

// Layout configuration interface
interface LayoutConfig {
    tabHeight: number;
    contentPadding: number;
    buttonHeight: number;
    buttonSpacing: number;
    dialogOverlayAlpha: number;
}

// Click event data interface
interface ContentClickEventData {
    tab: TabId;
    x: number;
    y: number;
    canvas: HTMLCanvasElement;
}

// Dialog click event data interface
interface DialogClickEventData {
    x: number;
    y: number;
}

// Scene state interface
interface SceneState {
    // Add scene state properties as needed
    [key: string]: any;
}

export class UserInterfaceController {
    private gameEngine: GameEngine;
    private eventBus: EventBus;
    private sceneState: SceneState;
    
    // UI状態管理
    private uiState: UIState;
    
    // タブ設定
    private readonly tabs: ReadonlyArray<Tab> = [
        { id: 'profile', label: 'プロフィール', icon: '👤' },
        { id: 'statistics', label: '統計', icon: '📊' },
        { id: 'achievements', label: '実績', icon: '🏆' },
        { id: 'data', label: 'データ', icon: '💾' },
        { id: 'help', label: 'ヘルプ', icon: '❓' }
    ];
    
    // レイアウト設定
    private layout: LayoutConfig;

    constructor(gameEngine: GameEngine, eventBus: EventBus, sceneState: SceneState) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.sceneState = sceneState;
        
        // UI状態管理
        this.uiState = {
            currentTab: 'profile',
            isDialogOpen: false,
            activeDialog: null,
            lastUpdateTime: Date.now(),
            needsUpdate: true
        };
        
        // レイアウト設定
        this.layout = {
            tabHeight: 60,
            contentPadding: 20,
            buttonHeight: 40,
            buttonSpacing: 10,
            dialogOverlayAlpha: 0.7
        };
        
        // イベントリスナーの設定
        this.setupEventListeners();
        
        console.log('[UserInterfaceController] ユーザーインターフェース制御システムを初期化しました');
    }
    
    /**
     * イベントリスナーの設定
     */
    private setupEventListeners(): void {
        this.eventBus.on('tabChanged', (tabId: TabId) => {
            this.switchTab(tabId);
        });
        
        // ダイアログイベント
        this.eventBus.on('dialogOpened', (dialogType: DialogType) => {
            this.handleDialogOpen(dialogType);
        });

        this.eventBus.on('dialogClosed', () => {
            this.handleDialogClose();
        });
        
        // UI更新イベント
        this.eventBus.on('uiUpdateRequired', () => {
            this.markNeedsUpdate();
        });
    }
    
    /**
     * タブ切り替え処理
     */
    public switchTab(tabId: TabId): void {
        if (this.tabs.find(tab => tab.id === tabId)) {
            this.uiState.currentTab = tabId;
            this.uiState.needsUpdate = true;
            this.eventBus.emit('tabSwitched', tabId);
            console.log(`[UserInterfaceController] タブを切り替え: ${tabId}`);
        }
    }
    
    /**
     * ダイアログオープン処理
     */
    private handleDialogOpen(dialogType: DialogType): void {
        if (dialogType === null) return;
        
        this.uiState.isDialogOpen = true;
        this.uiState.activeDialog = dialogType;
        this.uiState.needsUpdate = true;
        
        console.log(`[UserInterfaceController] ダイアログを開く: ${dialogType}`);
    }
    
    /**
     * ダイアログクローズ処理
     */
    private handleDialogClose(): void {
        this.uiState.isDialogOpen = false;
        this.uiState.activeDialog = null;
        this.uiState.needsUpdate = true;
        
        console.log('[UserInterfaceController] ダイアログを閉じました');
    }
    
    /**
     * クリックイベント処理
     */
    public handleClick(x: number, y: number): boolean {
        const canvas = this.gameEngine.canvas;
        
        // ダイアログが開いている場合はダイアログのクリックを優先
        if (this.uiState.isDialogOpen) {
            return this.handleDialogClick({ x, y });
        }
        
        // タブクリック判定
        if (this.isTabAreaClick(x, y, canvas)) {
            const clickedTab = this.getClickedTab(x, y, canvas);
            if (clickedTab) {
                this.switchTab(clickedTab.id);
                return true;
            }
        }
        
        // コンテンツエリアクリック
        if (this.isContentAreaClick(x, y, canvas)) {
            return this.handleContentClick({
                tab: this.uiState.currentTab,
                x,
                y,
                canvas
            });
        }
        
        return false;
    }
    
    /**
     * キーダウンイベント処理
     */
    public handleKeyDown(key: string): boolean {
        // ダイアログが開いている場合
        if (this.uiState.isDialogOpen) {
            if (key === 'Escape') {
                this.eventBus.emit('dialogClosed');
                return true;
            }
        }
        
        // タブショートカット
        const tabShortcuts: { [key: string]: TabId } = {
            '1': 'profile',
            '2': 'statistics',
            '3': 'achievements',
            '4': 'data',
            '5': 'help'
        };
        
        if (tabShortcuts[key]) {
            this.switchTab(tabShortcuts[key]);
            return true;
        }
        
        return false;
    }
    
    /**
     * タブエリアのクリック判定
     */
    private isTabAreaClick(x: number, y: number, canvas: HTMLCanvasElement): boolean {
        return y >= 0 && y <= this.layout.tabHeight;
    }
    
    /**
     * コンテンツエリアのクリック判定
     */
    private isContentAreaClick(x: number, y: number, canvas: HTMLCanvasElement): boolean {
        return y > this.layout.tabHeight && 
               x >= this.layout.contentPadding && 
               x <= canvas.width - this.layout.contentPadding;
    }
    
    /**
     * クリックされたタブを取得
     */
    private getClickedTab(x: number, y: number, canvas: HTMLCanvasElement): Tab | null {
        const tabWidth = canvas.width / this.tabs.length;
        const tabIndex = Math.floor(x / tabWidth);
        
        if (tabIndex >= 0 && tabIndex < this.tabs.length) {
            return this.tabs[tabIndex];
        }
        
        return null;
    }
    
    /**
     * ダイアログクリック処理
     */
    private handleDialogClick(eventData: DialogClickEventData): boolean {
        // ダイアログ外クリックでクローズ
        const canvas = this.gameEngine.canvas;
        const dialogWidth = Math.min(400, canvas.width - 40);
        const dialogHeight = Math.min(300, canvas.height - 40);
        const dialogX = (canvas.width - dialogWidth) / 2;
        const dialogY = (canvas.height - dialogHeight) / 2;
        
        if (eventData.x < dialogX || 
            eventData.x > dialogX + dialogWidth || 
            eventData.y < dialogY || 
            eventData.y > dialogY + dialogHeight) {
            this.eventBus.emit('dialogClosed');
            return true;
        }
        
        // ダイアログ内のクリックは別途処理
        this.eventBus.emit('dialogContentClick', {
            x: eventData.x - dialogX,
            y: eventData.y - dialogY,
            dialogType: this.uiState.activeDialog
        });
        
        return true;
    }
    
    /**
     * コンテンツクリック処理
     */
    private handleContentClick(eventData: ContentClickEventData): boolean {
        // コンテンツエリア内での相対座標
        const contentX = eventData.x - this.layout.contentPadding;
        const contentY = eventData.y - this.layout.tabHeight;
        
        this.eventBus.emit('contentClick', {
            tab: eventData.tab,
            x: contentX,
            y: contentY,
            originalX: eventData.x,
            originalY: eventData.y,
            canvas: eventData.canvas
        });
        
        return true;
    }
    
    /**
     * UI更新が必要かマーク
     */
    private markNeedsUpdate(): void {
        this.uiState.needsUpdate = true;
        this.uiState.lastUpdateTime = Date.now();
    }
    
    /**
     * タブの描画
     */
    public renderTabs(context: CanvasRenderingContext2D): void {
        const canvas = this.gameEngine.canvas;
        const tabWidth = canvas.width / this.tabs.length;
        
        for (let i = 0; i < this.tabs.length; i++) {
            const tab = this.tabs[i];
            const x = i * tabWidth;
            const isActive = tab.id === this.uiState.currentTab;
            
            this.renderTab(context, tab, x, 0, tabWidth, this.layout.tabHeight, isActive);
        }
    }
    
    /**
     * 個別タブの描画
     */
    private renderTab(
        context: CanvasRenderingContext2D,
        tab: Tab,
        x: number,
        y: number,
        width: number,
        height: number,
        isActive: boolean
    ): void {
        // タブ背景
        context.fillStyle = isActive ? '#4a4a6a' : '#2a2a4a';
        context.fillRect(x, y, width, height);
        
        // タブ枠線
        context.strokeStyle = isActive ? '#6a6a8a' : '#4a4a6a';
        context.lineWidth = 1;
        context.strokeRect(x, y, width, height);
        
        // アイコン
        context.font = '20px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = isActive ? '#ffffff' : '#cccccc';
        context.fillText(tab.icon, x + width / 2, y + height / 2 - 10);
        
        // ラベル
        context.font = '12px Arial';
        context.fillText(tab.label, x + width / 2, y + height / 2 + 12);
    }
    
    /**
     * ダイアログオーバーレイの描画
     */
    public renderDialogOverlay(context: CanvasRenderingContext2D): void {
        if (!this.uiState.isDialogOpen) return;
        
        const canvas = this.gameEngine.canvas;
        
        // オーバーレイ背景
        context.fillStyle = `rgba(0, 0, 0, ${this.layout.dialogOverlayAlpha})`;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // ダイアログフレーム
        const dialogWidth = Math.min(400, canvas.width - 40);
        const dialogHeight = Math.min(300, canvas.height - 40);
        const dialogX = (canvas.width - dialogWidth) / 2;
        const dialogY = (canvas.height - dialogHeight) / 2;
        
        context.fillStyle = '#ffffff';
        context.fillRect(dialogX, dialogY, dialogWidth, dialogHeight);
        context.strokeStyle = '#cccccc';
        context.lineWidth = 2;
        context.strokeRect(dialogX, dialogY, dialogWidth, dialogHeight);
        
        // ダイアログタイトル
        if (this.uiState.activeDialog) {
            const title = this.getDialogTitle(this.uiState.activeDialog);
            context.fillStyle = '#333333';
            context.font = 'bold 18px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'top';
            context.fillText(title, dialogX + dialogWidth / 2, dialogY + 20);
        }
    }
    
    /**
     * ダイアログタイトルの取得
     */
    private getDialogTitle(dialogType: DialogType): string {
        const titles = {
            'username': 'ユーザー名変更',
            'export': 'データエクスポート',
            'import': 'データインポート'
        };
        
        return titles[dialogType as keyof typeof titles] || 'ダイアログ';
    }
    
    /**
     * UI状態の取得
     */
    public getUIState(): Readonly<UIState> {
        return { ...this.uiState };
    }
    
    /**
     * レイアウト設定の取得
     */
    public getLayout(): Readonly<LayoutConfig> {
        return { ...this.layout };
    }
    
    /**
     * タブ一覧の取得
     */
    public getTabs(): ReadonlyArray<Tab> {
        return this.tabs;
    }
    
    /**
     * 現在のタブの取得
     */
    public getCurrentTab(): Tab | undefined {
        return this.tabs.find(tab => tab.id === this.uiState.currentTab);
    }
    
    /**
     * ダイアログを開く
     */
    public openDialog(dialogType: DialogType): void {
        if (dialogType) {
            this.eventBus.emit('dialogOpened', dialogType);
        }
    }
    
    /**
     * ダイアログを閉じる
     */
    public closeDialog(): void {
        this.eventBus.emit('dialogClosed');
    }
    
    /**
     * 更新フラグのリセット
     */
    public resetUpdateFlag(): void {
        this.uiState.needsUpdate = false;
    }
    
    /**
     * 更新が必要かチェック
     */
    public needsUpdate(): boolean {
        return this.uiState.needsUpdate;
    }
    
    /**
     * クリーンアップ
     */
    public cleanup(): void {
        // イベントリスナーのクリーンアップ
        this.eventBus.off('tabChanged');
        this.eventBus.off('dialogOpened');
        this.eventBus.off('dialogClosed');
        this.eventBus.off('uiUpdateRequired');
        
        console.log('[UserInterfaceController] クリーンアップ完了');
    }
}