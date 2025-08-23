/**
 * ユーザー情報画面シーン (Main, Controller Pattern)
 * 既存コンポーネントシステムを活用し、軽量なコントローラーとして機能
 */
import { Scene } from '../core/Scene';

// コンポーネントシステム
import { ScenesDialogManager } from './components/ScenesDialogManager';
import { ComponentEventBus } from './components/ComponentEventBus';
import { SceneState } from './components/SceneState';
import { UsernameDialog } from './components/UsernameDialog';
import { ScenesExportDialog } from './components/ScenesExportDialog';
import { ScenesImportDialog } from './components/ScenesImportDialog';

// 既存の分離コンポーネント
import { UserProfileManager } from './components/user-info/UserProfileManager';
import { UserStatisticsRenderer } from './components/user-info/UserStatisticsRenderer';
import { UserAchievementDisplay } from './components/user-info/UserAchievementDisplay';
import { UserDataExporter } from './components/user-info/UserDataExporter';
import { UserHelpIntegration } from './components/user-info/UserHelpIntegration';
import { UserInfoTabManager } from './components/user-info/UserInfoTabManager';
import { UserInfoRenderer } from './components/user-info/UserInfoRenderer';
import { UserInfoEventHandler } from './components/user-info/UserInfoEventHandler';

// 新しいサブコンポーネント
import { UserInterfaceController } from './user-info-scene/UserInterfaceController';
import { UserDataManager } from './user-info-scene/UserDataManager';

export class UserInfoScene extends Scene {
    // コンポーネントシステム
    private eventBus!: ComponentEventBus;
    private sceneState!: SceneState;
    private dialogManager!: ScenesDialogManager;
    private tabManager!: UserInfoTabManager;
    private renderer!: UserInfoRenderer;
    private eventHandler!: UserInfoEventHandler;
    
    // サブコントローラー
    private uiController!: UserInterfaceController;
    private dataManager!: UserDataManager;
    
    // 既存の分離コンポーネント
    private userProfileManager!: UserProfileManager;
    private userStatisticsRenderer!: UserStatisticsRenderer;
    private userAchievementDisplay!: UserAchievementDisplay;
    private userDataExporter!: UserDataExporter;
    private userHelpIntegration!: UserHelpIntegration;
    
    // レガシー互換性プロパティ
    private lastCleanupTime: number = Date.now();
    public currentTab: string = 'profile';
    public isDialogOpen: boolean = false;
    public activeDialog: string | null = null;

    constructor(gameEngine: any) {
        super(gameEngine);
        
        try {
            // Main Controller Pattern - サブコンポーネント初期化
            this.initializeControllers();
            this.initializeComponentSystem();
            this.initializeUserComponents();
            
            // レガシー互換性プロパティ
            this.lastCleanupTime = Date.now();
            
            console.log('[UserInfoScene] Main Controller Pattern初期化完了');
        } catch (error) {
            console.error('[UserInfoScene] 初期化エラー:', error);
        }
    }
    
    /**
     * メインコントローラーの初期化
     */
    private initializeControllers(): void {
        // イベントバスの作成（他のコンポーネントより先に）
        this.eventBus = new ComponentEventBus();
        this.sceneState = new SceneState(this.gameEngine);
        
        // サブコントローラーの初期化
        this.uiController = new UserInterfaceController(this.gameEngine, this.eventBus, this.sceneState);
        this.dataManager = new UserDataManager(this.gameEngine, this.eventBus, this.sceneState);
        
        console.log('[UserInfoScene] メインコントローラーを初期化しました');
    }
    
    /**
     * コンポーネントシステムの初期化
     */
    private initializeComponentSystem(): void {
        // ダイアログマネージャー作成
        this.dialogManager = new ScenesDialogManager(this.gameEngine, this.eventBus, this.sceneState);
        
        // ダイアログコンポーネントを登録
        this.dialogManager.registerDialog('username', UsernameDialog);
        this.dialogManager.registerDialog('export', ScenesExportDialog);
        this.dialogManager.registerDialog('import', ScenesImportDialog);
        
        // 専用コンポーネントの初期化
        this.tabManager = new UserInfoTabManager(this.gameEngine, this.eventBus, this.sceneState);
        this.renderer = new UserInfoRenderer(this.gameEngine, this.eventBus, this.sceneState);
        this.eventHandler = new UserInfoEventHandler(this.gameEngine, this.eventBus, this.sceneState);
        
        // レガシー互換性の設定
        this.setupLegacyCompatibility();
    }
    
    /**
     * ユーザーコンポーネントの初期化
     */
    private initializeUserComponents(): void {
        // 既存の分離コンポーネント
        this.userProfileManager = new UserProfileManager(this.gameEngine, this.eventBus, this.sceneState);
        this.userStatisticsRenderer = new UserStatisticsRenderer(this.gameEngine, this.eventBus, this.sceneState);
        this.userAchievementDisplay = new UserAchievementDisplay(this.gameEngine, this.eventBus, this.sceneState);
        this.userDataExporter = new UserDataExporter(this.gameEngine, this.eventBus, this.sceneState);
        this.userHelpIntegration = new UserHelpIntegration(this.gameEngine, this.eventBus, this.sceneState);
    }
    
    /**
     * レガシー互換性のセットアップ
     */
    private setupLegacyCompatibility(): void {
        this.currentTab = 'profile';
        this.isDialogOpen = false;
        this.activeDialog = null;

        // UIコントローラーとの同期
        this.eventBus.on('tabSwitched', (tabId: string) => {
            this.currentTab = tabId;
        });

        this.eventBus.on('dialogOpened', (dialogType: string) => {
            this.isDialogOpen = true;
            this.activeDialog = dialogType;
        });

        this.eventBus.on('dialogClosed', () => {
            this.isDialogOpen = false;
            this.activeDialog = null;
        });
    }
    
    // ========================================
    // Scene基底クラスのオーバーライド
    // ========================================
    
    render(context: CanvasRenderingContext2D): void {
        try {
            // 基底クラスのレンダリング
            super.render(context);
            
            // メインレンダラーに処理を委譲
            this.renderer.render(context);
            
            // ダイアログレンダリング
            if (this.isDialogOpen && this.activeDialog) {
                this.dialogManager.render(context);
            }
        } catch (error) {
            console.error('[UserInfoScene] レンダリングエラー:', error);
        }
    }
    
    update(deltaTime: number): void {
        try {
            // 基底クラスの更新
            super.update(deltaTime);
            
            // 各コンポーネントの更新
            this.updateComponents(deltaTime);
            
            // 定期クリーンアップ
            this.performPeriodicCleanup();
        } catch (error) {
            console.error('[UserInfoScene] 更新エラー:', error);
        }
    }
    
    handleClick(x: number, y: number): void {
        try {
            // UIコントローラーに処理を委譲
            const handled = this.uiController.handleClick(x, y);
            
            // 処理されなかった場合は他のコンポーネントに委譲
            if (!handled) {
                this.eventHandler.handleInput(
                    new MouseEvent('click', { 
                        clientX: x, 
                        clientY: y 
                    }) as any,
                    this.tabManager,
                    this.userProfileManager,
                    this.userHelpIntegration,
                    this.dialogManager,
                    this.renderer
                );
            }
        } catch (error) {
            console.error('[UserInfoScene] クリック処理エラー:', error);
        }
    }
    
    handleKeyDown(key: string): void {
        try {
            // UIコントローラーに処理を委譲
            const handled = this.uiController.handleKeyDown(key);
            
            // 処理されなかった場合は他のコンポーネントに委譲
            if (!handled) {
                this.eventHandler.handleInput(
                    new KeyboardEvent('keydown', { key }),
                    this.tabManager,
                    this.userProfileManager,
                    this.userHelpIntegration,
                    this.dialogManager,
                    this.renderer
                );
            }
        } catch (error) {
            console.error('[UserInfoScene] キー処理エラー:', error);
        }
    }
    
    // ========================================
    // 公開API（レガシー互換性）
    // ========================================
    
    switchTab(tabId: string): void {
        this.uiController.switchTab(tabId);
    }

    openDialog(dialogType: string): void {
        this.eventBus.emit('openDialog', dialogType);
    }

    closeDialog(): void {
        this.eventBus.emit('closeDialog');
    }
    
    async getUserProfile(): Promise<any> {
        return await this.dataManager.getUserProfile();
    }

    async getUserStatistics(): Promise<any> {
        return await this.dataManager.getUserStatistics();
    }

    async getUserAchievements(): Promise<any> {
        return await this.dataManager.getUserAchievements();
    }

    async exportUserData(): Promise<boolean> {
        return await this.userDataExporter.exportData();
    }

    async importUserData(data: any): Promise<boolean> {
        return await this.userDataExporter.importData(data);
    }
    
    // ========================================
    // プライベートヘルパーメソッド
    // ========================================
    
    /**
     * コンポーネントの更新
     */
    private updateComponents(deltaTime: number): void {
        // ダイアログ更新
        if (this.dialogManager && this.isDialogOpen) {
            this.dialogManager.update(deltaTime);
        }
        
        // タブマネージャー更新
        if (this.tabManager) {
            // タブマネージャーにupdateメソッドがある場合
            if (typeof (this.tabManager as any).update === 'function') {
                (this.tabManager as any).update(deltaTime);
            }
        }
        
        // 他のコンポーネントの更新
        this.updateUserComponents(deltaTime);
    }
    
    /**
     * ユーザーコンポーネントの更新
     */
    private updateUserComponents(deltaTime: number): void {
        // 実績表示の更新
        if (this.userAchievementDisplay && typeof (this.userAchievementDisplay as any).update === 'function') {
            (this.userAchievementDisplay as any).update(deltaTime);
        }
        
        // 統計レンダラーの更新
        if (this.userStatisticsRenderer && typeof (this.userStatisticsRenderer as any).update === 'function') {
            (this.userStatisticsRenderer as any).update(deltaTime);
        }
    }
    
    /**
     * 定期クリーンアップ
     */
    private performPeriodicCleanup(): void {
        const now = Date.now();
        if (now - this.lastCleanupTime > 60000) { // 1分間隔
            try {
                // イベントバスのクリーンアップ
                if (this.eventBus && typeof this.eventBus.cleanup === 'function') {
                    this.eventBus.cleanup();
                }
                
                // シーン状態のクリーンアップ
                if (this.sceneState && typeof this.sceneState.cleanup === 'function') {
                    this.sceneState.cleanup();
                }
                
                this.lastCleanupTime = now;
            } catch (error) {
                console.error('[UserInfoScene] クリーンアップエラー:', error);
            }
        }
    }
    
    // ========================================
    // クリーンアップ
    // ========================================
    
    /**
     * シーンのクリーンアップ
     */
    public cleanup(): void {
        try {
            // コンポーネントの解放
            if (this.eventHandler && typeof this.eventHandler.dispose === 'function') {
                this.eventHandler.dispose();
            }
            
            if (this.tabManager && typeof this.tabManager.dispose === 'function') {
                this.tabManager.dispose();
            }
            
            if (this.dialogManager && typeof this.dialogManager.dispose === 'function') {
                this.dialogManager.dispose();
            }
            
            if (this.userAchievementDisplay && typeof this.userAchievementDisplay.cleanup === 'function') {
                this.userAchievementDisplay.cleanup();
            }
            
            // イベントバスのクリーンアップ
            if (this.eventBus && typeof this.eventBus.dispose === 'function') {
                this.eventBus.dispose();
            }
            
            console.log('[UserInfoScene] クリーンアップ完了');
        } catch (error) {
            console.error('[UserInfoScene] クリーンアップエラー:', error);
        }
    }
    
    /**
     * シーン終了時の処理
     */
    public onExit(): void {
        this.cleanup();
        super.onExit?.();
    }
}