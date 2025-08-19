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
        // タブ切り替えイベント
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
            return this.handleDialogClick(x, y);
        }
        
        // タブクリック判定
        const tabClick = this.checkTabClick(x, y, canvas);
        if (tabClick) {
            return tabClick;
        }
        
        // コンテンツエリアのクリック判定
        return this.handleContentClick(x, y, canvas);
    }
    
    /**
     * タブクリック判定
     */
    private checkTabClick(x: number, y: number, canvas: HTMLCanvasElement): boolean {
        if (y > this.layout.tabHeight) return false;
        
        const tabWidth = canvas.width / this.tabs.length;
        const tabIndex = Math.floor(x / tabWidth);
        
        if (tabIndex >= 0 && tabIndex < this.tabs.length) {
            const clickedTab = this.tabs[tabIndex];
            this.switchTab(clickedTab.id);
            return true;
        }
        
        return false;
    }
    
    /**
     * コンテンツエリアのクリック処理
     */
    private handleContentClick(x: number, y: number, canvas: HTMLCanvasElement): boolean {
        const contentY = y - this.layout.tabHeight;
        const currentTab = this.uiState.currentTab;
        
        // タブ別のクリック処理
        switch (currentTab) {
            case 'profile':
                return this.handleProfileClick(x, contentY, canvas);
            case 'data':
                return this.handleDataClick(x, contentY, canvas);
            default:
                // 他のタブのクリック処理はそれぞれのコンポーネントに委譲
                const eventData: ContentClickEventData = { 
                    tab: currentTab, 
                    x, 
                    y: contentY, 
                    canvas 
                };
                this.eventBus.emit('contentClick', eventData);
                return false;
        }
    }
    
    /**
     * プロフィールタブのクリック処理
     */
    private handleProfileClick(x: number, y: number, canvas: HTMLCanvasElement): boolean {
        const centerX = canvas.width / 2;
        const buttonY = 200;
        const buttonWidth = 200;
        const buttonHeight = this.layout.buttonHeight;
        
        // ユーザー名変更ボタンのクリック判定
        if (x >= centerX - buttonWidth / 2 && 
            x <= centerX + buttonWidth / 2 &&
            y >= buttonY && 
            y <= buttonY + buttonHeight) {
            
            this.eventBus.emit('openDialog', 'username');
            return true;
        }
        
        return false;
    }
    
    /**
     * データタブのクリック処理
     */
    private handleDataClick(x: number, y: number, canvas: HTMLCanvasElement): boolean {
        const centerX = canvas.width / 2;
        const buttonWidth = 200;
        const buttonHeight = this.layout.buttonHeight;
        const spacing = this.layout.buttonSpacing;
        
        // エクスポートボタン
        const exportButtonY = 200;
        if (x >= centerX - buttonWidth / 2 && 
            x <= centerX + buttonWidth / 2 &&
            y >= exportButtonY && 
            y <= exportButtonY + buttonHeight) {
            
            this.eventBus.emit('openDialog', 'export');
            return true;
        }
        
        // インポートボタン
        const importButtonY = exportButtonY + buttonHeight + spacing;
        if (x >= centerX - buttonWidth / 2 && 
            x <= centerX + buttonWidth / 2 &&
            y >= importButtonY && 
            y <= importButtonY + buttonHeight) {
            
            this.eventBus.emit('openDialog', 'import');
            return true;
        }
        
        return false;
    }
    
    /**
     * ダイアログクリック処理
     */
    private handleDialogClick(x: number, y: number): boolean {
        // ダイアログマネージャーに処理を委譲
        const eventData: DialogClickEventData = { x, y };
        this.eventBus.emit('dialogClick', eventData);
        return true;
    }
    
    /**
     * キーボードイベント処理
     */
    public handleKeyDown(key: string): boolean {
        // ダイアログが開いている場合はダイアログのキー処理を優先
        if (this.uiState.isDialogOpen) {
            this.eventBus.emit('dialogKeyDown', key);
            return true;
        }
        
        // タブ切り替えのショートカット
        if (key >= '1' && key <= '5') {
            const tabIndex = parseInt(key) - 1;
            if (tabIndex < this.tabs.length) {
                this.switchTab(this.tabs[tabIndex].id);
                return true;
            }
        }
        
        // ESCキーでメインメニューに戻る
        if (key === 'Escape') {
            this.eventBus.emit('requestSceneChange', 'MainMenu');
            return true;
        }
        
        return false;
    }
    
    /**
     * UI更新が必要かチェック
     */
    public needsUpdate(): boolean {
        return this.uiState.needsUpdate;
    }
    
    /**
     * 更新フラグをセット
     */
    public markNeedsUpdate(): void {
        this.uiState.needsUpdate = true;
        this.uiState.lastUpdateTime = Date.now();
    }
    
    /**
     * 更新完了をマーク
     */
    public markUpdated(): void {
        this.uiState.needsUpdate = false;
    }
    
    /**
     * 現在のタブを取得
     */
    public getCurrentTab(): TabId {
        return this.uiState.currentTab;
    }
    
    /**
     * タブ情報を取得
     */
    public getTabs(): Tab[] {
        return [...this.tabs];
    }
    
    /**
     * レイアウト設定を取得
     */
    public getLayout(): LayoutConfig {
        return { ...this.layout };
    }
    
    /**
     * UI状態を取得
     */
    public getUIState(): UIState {
        return { ...this.uiState };
    }
    
    /**
     * レスポンシブ対応 - 画面サイズに応じてレイアウト調整
     */
    public adjustLayoutForScreenSize(width: number, height: number): void {
        // 小さな画面での調整
        if (width < 800) {
            this.layout.tabHeight = 50;
            this.layout.contentPadding = 15;
            this.layout.buttonHeight = 35;
        } else {
            // デフォルト値に戻す
            this.layout.tabHeight = 60;
            this.layout.contentPadding = 20;
            this.layout.buttonHeight = 40;
        }
        
        this.markNeedsUpdate();
    }
    
    /**
     * クリーンアップ処理
     */
    public cleanup(): void {
        // イベントリスナーの削除
        this.eventBus.off('tabChanged');
        this.eventBus.off('dialogOpened');
        this.eventBus.off('dialogClosed');
        this.eventBus.off('uiUpdateRequired');
        
        console.log('[UserInterfaceController] クリーンアップ完了');
    }
}