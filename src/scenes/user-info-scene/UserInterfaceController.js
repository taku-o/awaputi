/**
 * User Interface Controller
 * ユーザーインターフェース制御 - UI制御、イベント処理、表示管理
 */
export class UserInterfaceController {
    constructor(gameEngine, eventBus, sceneState) {
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
        
        // タブ設定
        this.tabs = [
            { id: 'profile', label: 'プロフィール', icon: '👤' },
            { id: 'statistics', label: '統計', icon: '📊' },
            { id: 'achievements', label: '実績', icon: '🏆' },
            { id: 'data', label: 'データ', icon: '💾' },
            { id: 'help', label: 'ヘルプ', icon: '❓' }
        ];
        
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
    setupEventListeners() {
        // タブ切り替えイベント
        this.eventBus.on('tabChanged', (tabId) => {
            this.switchTab(tabId);
        });
        
        // ダイアログイベント
        this.eventBus.on('dialogOpened', (dialogType) => {
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
    switchTab(tabId) {
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
    handleDialogOpen(dialogType) {
        this.uiState.isDialogOpen = true;
        this.uiState.activeDialog = dialogType;
        this.uiState.needsUpdate = true;
        console.log(`[UserInterfaceController] ダイアログを開く: ${dialogType}`);
    }
    
    /**
     * ダイアログクローズ処理
     */
    handleDialogClose() {
        this.uiState.isDialogOpen = false;
        this.uiState.activeDialog = null;
        this.uiState.needsUpdate = true;
        console.log('[UserInterfaceController] ダイアログを閉じました');
    }
    
    /**
     * クリックイベント処理
     */
    handleClick(x, y) {
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
    checkTabClick(x, y, canvas) {
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
    handleContentClick(x, y, canvas) {
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
                this.eventBus.emit('contentClick', { 
                    tab: currentTab, 
                    x, 
                    y: contentY, 
                    canvas 
                });
                return false;
        }
    }
    
    /**
     * プロフィールタブのクリック処理
     */
    handleProfileClick(x, y, canvas) {
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
    handleDataClick(x, y, canvas) {
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
    handleDialogClick(x, y) {
        // ダイアログマネージャーに処理を委譲
        this.eventBus.emit('dialogClick', { x, y });
        return true;
    }
    
    /**
     * キーボードイベント処理
     */
    handleKeyDown(key) {
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
    needsUpdate() {
        return this.uiState.needsUpdate;
    }
    
    /**
     * 更新フラグをセット
     */
    markNeedsUpdate() {
        this.uiState.needsUpdate = true;
        this.uiState.lastUpdateTime = Date.now();
    }
    
    /**
     * 更新完了をマーク
     */
    markUpdated() {
        this.uiState.needsUpdate = false;
    }
    
    /**
     * 現在のタブを取得
     */
    getCurrentTab() {
        return this.uiState.currentTab;
    }
    
    /**
     * タブ情報を取得
     */
    getTabs() {
        return [...this.tabs];
    }
    
    /**
     * レイアウト設定を取得
     */
    getLayout() {
        return { ...this.layout };
    }
    
    /**
     * UI状態を取得
     */
    getUIState() {
        return { ...this.uiState };
    }
    
    /**
     * レスポンシブ対応 - 画面サイズに応じてレイアウト調整
     */
    adjustLayoutForScreenSize(width, height) {
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
    cleanup() {
        // イベントリスナーの削除
        this.eventBus.off('tabChanged');
        this.eventBus.off('dialogOpened');
        this.eventBus.off('dialogClosed');
        this.eventBus.off('uiUpdateRequired');
        
        console.log('[UserInterfaceController] クリーンアップ完了');
    }
}