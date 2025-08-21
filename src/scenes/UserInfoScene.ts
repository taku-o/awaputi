/**
 * ユーザー情報画面シーン (Main, Controller Pattern)
 * 既存コンポーネントシステムを活用し、軽量なコントローラーとして機能
 */
import { Scene  } from '../core/Scene';
';
// コンポーネントシステム
import { ScenesDialogManager  } from './components/ScenesDialogManager';
import { ComponentEventBus  } from './components/ComponentEventBus';
import { SceneState  } from './components/SceneState';
import { UsernameDialog  } from './components/UsernameDialog';
import { ScenesExportDialog  } from './components/ScenesExportDialog';
import { ScenesImportDialog  } from './components/ScenesImportDialog';
';
// 既存の分離コンポーネント
import { UserProfileManager  } from './components/user-info/UserProfileManager';
import { UserStatisticsRenderer  } from './components/user-info/UserStatisticsRenderer';
import { UserAchievementDisplay  } from './components/user-info/UserAchievementDisplay';
import { UserDataExporter  } from './components/user-info/UserDataExporter';
import { UserHelpIntegration  } from './components/user-info/UserHelpIntegration';
import { UserInfoTabManager  } from './components/user-info/UserInfoTabManager';
import { UserInfoRenderer  } from './components/user-info/UserInfoRenderer';
import { UserInfoEventHandler  } from './components/user-info/UserInfoEventHandler';
';
// 新しいサブコンポーネント
import { UserInterfaceController  } from './user-info-scene/UserInterfaceController';
import { UserDataManager  } from './user-info-scene/UserDataManager';

export class UserInfoScene extends Scene { // コンポーネントシステム
    private eventBus!: ComponentEventBus,
    private sceneState!: SceneState,
    private dialogManager!: ScenesDialogManager,
    private tabManager!: UserInfoTabManager,
    private renderer!: UserInfoRenderer,
    private eventHandler!: UserInfoEventHandler,
    
    // サブコントローラー
    private uiController!: UserInterfaceController,
    private dataManager!: UserDataManager,
    
    // 既存の分離コンポーネント
    private userProfileManager!: UserProfileManager,
    private userStatisticsRenderer!: UserStatisticsRenderer,
    private userAchievementDisplay!: UserAchievementDisplay,
    private userDataExporter!: UserDataExporter,
    private userHelpIntegration!: UserHelpIntegration,
    // レガシー互換性プロパティ
    private lastCleanupTime: number = Date.now('''
    public, currentTab: string = 'profile',
    public isDialogOpen: boolean = false),
    public, activeDialog: string | null = null)),
    constructor(gameEngine: any) {
        super(gameEngine),
        
        // Main Controller Pattern - サブコンポーネント初期化
        this.initializeControllers(),
        this.initializeComponentSystem(),
        this.initializeUserComponents(),
        // レガシー互換性プロパティ
        this.lastCleanupTime = Date.now(),
     }

    }

        console.log('[UserInfoScene] Main, Controller Pattern初期化完了'); }'
    }
    
    /**
     * メインコントローラーの初期化
     */
    private initializeControllers(): void { // イベントバスの作成（他のコンポーネントより先に）
        this.eventBus = new ComponentEventBus(),
        this.sceneState = new SceneState(this.gameEngine),
        
        // サブコントローラーの初期化
        this.uiController = new UserInterfaceController(this.gameEngine, this.eventBus, this.sceneState),
        this.dataManager = new UserDataManager(this.gameEngine, this.eventBus, this.sceneState),

        console.log('[UserInfoScene] メインコントローラーを初期化しました') }'
    
    /**
     * コンポーネントシステムの初期化
     */'
    private initializeComponentSystem(): void { // ダイアログマネージャー作成
        this.dialogManager = new ScenesDialogManager(this.gameEngine, this.eventBus, this.sceneState),
        ',
        // ダイアログコンポーネントを登録
        this.dialogManager.registerDialog('username', UsernameDialog',
        this.dialogManager.registerDialog('export', ScenesExportDialog',
        this.dialogManager.registerDialog('import', ScenesImportDialog),
        
        // 専用コンポーネントの初期化
        this.tabManager = new UserInfoTabManager(this.gameEngine, this.eventBus, this.sceneState),
        this.renderer = new UserInfoRenderer(this.gameEngine, this.eventBus, this.sceneState),
        this.eventHandler = new UserInfoEventHandler(this.gameEngine, this.eventBus, this.sceneState),
        
        // レガシー互換性の設定
        this.setupLegacyCompatibility() }
    
    /**
     * ユーザーコンポーネントの初期化
     */
    private initializeUserComponents(): void { // 既存の分離コンポーネント
        this.userProfileManager = new UserProfileManager(this.gameEngine, this.eventBus, this.sceneState),
        this.userStatisticsRenderer = new UserStatisticsRenderer(this.gameEngine, this.eventBus, this.sceneState),
        this.userAchievementDisplay = new UserAchievementDisplay(this.gameEngine, this.eventBus, this.sceneState),
        this.userDataExporter = new UserDataExporter(this.gameEngine, this.eventBus, this.sceneState),
        this.userHelpIntegration = new UserHelpIntegration(this.gameEngine, this.eventBus, this.sceneState) }
    
    /**
     * レガシー互換性のセットアップ
     */''
    private setupLegacyCompatibility('';
        this.currentTab = 'profile';
        this.isDialogOpen = false;
        this.activeDialog = null;
        ';

        // UIコントローラーとの同期''
        this.eventBus.on('tabSwitched', (tabId: string) => { this.currentTab = tabId,' 
    }');

        this.eventBus.on('dialogOpened', (dialogType: string) => {  this.isDialogOpen = true }

            this.activeDialog = dialogType;' }'

        }');

        this.eventBus.on('dialogClosed', () => {  this.isDialogOpen = false }
            this.activeDialog = null; }
        });
    }
    
    // ========================================
    // Scene基底クラスのオーバーライド
    // ========================================
    
    render(context: CanvasRenderingContext2D): void { try {
            // 基底クラスのレンダリング
            super.render(context),
            
            // メインレンダラーに処理を委譲
            this.renderer.render(context),
            
            // ダイアログレンダリング
            if(this.isDialogOpen && this.activeDialog) {
    
}
                this.dialogManager.render(context);' }'

            } catch (error) {
            console.error('[UserInfoScene] レンダリングエラー:', error) }
    }
    
    update(deltaTime: number): void { try {
            // 基底クラスの更新
            super.update(deltaTime),
            
            // 各コンポーネントの更新
            this.updateComponents(deltaTime),
            
            // 定期クリーンアップ
            this.performPeriodicCleanup(),
            ' }'

        } catch (error) {
            console.error('[UserInfoScene] 更新エラー:', error) }
    }
    
    handleClick(x: number, y: number): void { try {
            // UIコントローラーに処理を委譲
            const handled = this.uiController.handleClick(x, y),
            
            // 処理されなかった場合は他のコンポーネントに委譲
            if(!handled) {
    
}
                this.eventHandler.handleClick(x, y);' }'

            } catch (error) {
            console.error('[UserInfoScene] クリック処理エラー:', error) }
    }
    
    handleKeyDown(key: string): void { try {
            // UIコントローラーに処理を委譲
            const handled = this.uiController.handleKeyDown(key),
            
            // 処理されなかった場合は他のコンポーネントに委譲
            if(!handled) {
    
}
                this.eventHandler.handleKeyDown(key);' }'

            } catch (error) {
            console.error('[UserInfoScene] キー処理エラー:', error) }
    }
    
    // ========================================
    // 公開API（レガシー互換性）
    // ========================================
    
    switchTab(tabId: string): void { this.uiController.switchTab(tabId) }

    openDialog(dialogType: string): void { ''
        this.eventBus.emit('openDialog', dialogType) }

    closeDialog()';
        this.eventBus.emit('closeDialog);
    }
    
    async getUserProfile(): Promise<any> { return await this.dataManager.getUserProfile() }
    
    async getUserStatistics(): Promise<any> { return await this.dataManager.getUserStatistics() }
    
    async getUserAchievements(): Promise<any> { return await this.dataManager.getUserAchievements() }
    
    async updateUsername(newUsername: string): Promise<any> { return await this.dataManager.updateUsername(newUsername) }
    
    async exportUserData(): Promise<any> { return await this.dataManager.exportUserData() }
    
    async importUserData(importData: any): Promise<any> { return await this.dataManager.importUserData(importData) }
    
    // ========================================
    // 内部メソッド
    // ========================================
    
    /**
     * コンポーネントの更新
     */
    private updateComponents(deltaTime: number): void { // タブマネージャーの更新
        if (this.tabManager && (this.tabManager, as any).update) {
            (this.tabManager, as any).update(deltaTime) }
        
        // ダイアログマネージャーの更新
        if (this.dialogManager && (this.dialogManager, as any).update) { (this.dialogManager, as any).update(deltaTime) }
    }
    
    /**
     * 定期クリーンアップ処理
     */
    private performPeriodicCleanup(): void { const now = Date.now(),
        if(now - this.lastCleanupTime > this.CLEANUP_INTERVAL) {
            this.cleanup() }
            this.lastCleanupTime = now; }
}
    
    /**
     * クリーンアップ処理
     */
    private cleanup(): void { try {
            // ダイアログのクリーンアップ
            if(this.dialogManager) {
    
}
                (this.dialogManager, as any).cleanup(); }
            }
            
            // コントローラーのクリーンアップ
            if (this.uiController) { (this.uiController, as any).cleanup() }
            
            if(this.dataManager) {
            ',

                (this.dataManager, as any).cleanup()',
            console.log('[UserInfoScene] 定期クリーンアップ完了') }

            ' }'

        } catch (error) {
            console.error('[UserInfoScene] クリーンアップエラー:', error) }
    }
    
    /**
     * シーン終了時のクリーンアップ
     */
    destroy(): void { try {
            // 全コンポーネントのクリーンアップ
            this.cleanup(),
            
            // イベントリスナーの削除
            if(this.eventBus) {

                this.eventBus.removeAllListeners()',
            console.log('[UserInfoScene] シーン破棄完了') }

            ' }'

        } catch (error) {
            console.error('[UserInfoScene] シーン破棄エラー:', error' }

    }'}