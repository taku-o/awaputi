/**
 * ユーザー情報画面シーン
 */
import { Scene } from '../core/Scene.js';

// 新しいダイアログシステム
import { DialogManager } from './components/DialogManager.js';
import { ComponentEventBus } from './components/ComponentEventBus.js';
import { SceneState } from './components/SceneState.js';
import { UsernameDialog } from './components/UsernameDialog.js';
import { ExportDialog } from './components/ExportDialog.js';
import { ImportDialog } from './components/ImportDialog.js';

// 分離されたコンポーネント
import { UserProfileManager } from './components/user-info/UserProfileManager.js';
import { UserStatisticsRenderer } from './components/user-info/UserStatisticsRenderer.js';
import { UserAchievementDisplay } from './components/user-info/UserAchievementDisplay.js';
import { UserDataExporter } from './components/user-info/UserDataExporter.js';
import { UserHelpIntegration } from './components/user-info/UserHelpIntegration.js';
import { UserInfoTabManager } from './components/user-info/UserInfoTabManager.js';
import { UserInfoRenderer } from './components/user-info/UserInfoRenderer.js';
import { UserInfoEventHandler } from './components/user-info/UserInfoEventHandler.js';

export class UserInfoScene extends Scene {
    constructor(gameEngine) {
        super(gameEngine);
        
        // 新しいコンポーネントシステムの初期化
        this.initializeComponentSystem();
        
        // 分離されたコンポーネントの初期化
        this.initializeUserComponents();
    }
    
    /**
     * 新しいコンポーネントシステムの初期化
     */
    initializeComponentSystem() {
        // イベントバス作成
        this.eventBus = new ComponentEventBus();
        
        // 共有状態作成
        this.sceneState = new SceneState(this.gameEngine);
        
        // ダイアログマネージャー作成
        this.dialogManager = new DialogManager(this.gameEngine, this.eventBus, this.sceneState);
        
        // ダイアログコンポーネントを登録
        this.dialogManager.registerDialog('username', UsernameDialog);
        this.dialogManager.registerDialog('export', ExportDialog);
        this.dialogManager.registerDialog('import', ImportDialog);
        
        // 新しい専用コンポーネントの初期化
        this.tabManager = new UserInfoTabManager(this.gameEngine, this.eventBus, this.sceneState);
        this.renderer = new UserInfoRenderer(this.gameEngine, this.eventBus, this.sceneState);
        this.eventHandler = new UserInfoEventHandler(this.gameEngine, this.eventBus, this.sceneState);
        
        // レガシープロパティとの互換性維持
        this.setupLegacyCompatibility();
    }
    
    
    /**
     * 分離されたユーザーコンポーネントの初期化
     */
    initializeUserComponents() {
        // プロフィール管理コンポーネント
        this.userProfileManager = new UserProfileManager(this.gameEngine, this.eventBus, this.sceneState);
        
        // 統計描画コンポーネント
        this.userStatisticsRenderer = new UserStatisticsRenderer(this.gameEngine, this.eventBus, this.sceneState);
        
        // 実績表示コンポーネント
        this.userAchievementDisplay = new UserAchievementDisplay(this.gameEngine, this.eventBus, this.sceneState);
        
        // データエクスポートコンポーネント
        this.userDataExporter = new UserDataExporter(this.gameEngine, this.eventBus, this.sceneState);
        
        // ヘルプ統合コンポーネント
        this.userHelpIntegration = new UserHelpIntegration(this.gameEngine, this.eventBus, this.sceneState);
        
        // 初期化完了
        this.userProfileManager.initialize();
        
        console.log('User components initialized successfully');
    }
    
    
    /**
     * イベントリスナーをセットアップ
     */
    setupEventListeners() {
        // ダイアログイベントの監視
        this.eventBus.on('dialog-opened', (data) => {
            console.log('Dialog opened:', data.type);
        });
        
        this.eventBus.on('dialog-closed', (data) => {
            console.log('Dialog closed:', data.type);
        });
        
        // エラーイベントの監視
        this.eventBus.on('component-error', (error) => {
            console.error('Component error:', error);
            this.showError('コンポーネントエラーが発生しました');
        });
        
        // 状態変更の監視
        this.sceneState.onChange('currentTab', (newTab, oldTab) => {
            console.log(`Tab changed from ${oldTab} to ${newTab}`);
            this.handleTabChange(newTab, oldTab);
        });
    }
    
    /**
     * レガシー互換性をセットアップ
     */
    setupLegacyCompatibility() {
        // 既存プロパティを新システムと同期
        Object.defineProperty(this, 'showingDialog', {
            get: () => this.sceneState.showingDialog,
            set: (value) => this.sceneState.set('showingDialog', value)
        });
        
        Object.defineProperty(this, 'dialogData', {
            get: () => this.sceneState.dialogData,
            set: (value) => this.sceneState.set('dialogData', value)
        });
        
        Object.defineProperty(this, 'currentTab', {
            get: () => this.sceneState.currentTab,
            set: (value) => this.sceneState.set('currentTab', value)
        });
        
        Object.defineProperty(this, 'currentAchievementCategory', {
            get: () => this.sceneState.currentAchievementCategory,
            set: (value) => this.sceneState.set('currentAchievementCategory', value)
        });
        
        // 配列プロパティの参照を維持
        this.tabs = this.sceneState.tabs;
        this.tabLabels = this.sceneState.tabLabels;
        this.achievementCategories = this.sceneState.achievementCategories;
        this.achievementCategoryLabels = this.sceneState.achievementCategoryLabels;
        
        // アクセシビリティ設定の参照
        this.accessibilitySettings = this.sceneState.accessibilitySettings;
    }
    
    /**
     * タブ変更処理
     * @param {string} newTab - 新しいタブ
     * @param {string} oldTab - 古いタブ
     */
    handleTabChange(newTab, oldTab) {
        // 古いタブコンポーネントを非アクティブ化
        if (oldTab && this.tabComponents.has(oldTab)) {
            this.tabComponents.get(oldTab).deactivate();
        }
        
        // 新しいタブコンポーネントをアクティブ化
        if (newTab && this.tabComponents.has(newTab)) {
            this.tabComponents.get(newTab).activate();
        }
        
        // ヘルプタブ特有の処理
        if (newTab === 'help' && this.helpTabComponent) {
            this.helpTabComponent.activate();
        }
    }

    enter() {
        console.log('User info scene entered');
        
        // データを初期化
        this.loadUserData();
        
        // フォーカスをリセット
        this.focusedElement = 0;
        this.scrollPosition = 0;
        
        // 初期タブをアクティブ化
        this.activateCurrentTab();
    }

    exit() {
        console.log('User info scene exited');
        
        // エラータイマーをクリア
        if (this.errorTimeout) {
            clearTimeout(this.errorTimeout);
            this.errorTimeout = null;
        }
        
        // 新しいコンポーネントシステムのクリーンアップ
        if (this.dialogManager) {
            this.dialogManager.cleanup();
        }
        
        if (this.eventBus) {
            this.eventBus.cleanup();
        }
        
        if (this.sceneState) {
            this.sceneState.cleanup();
        }
        
        // タブコンポーネントのクリーンアップ
        if (this.helpTabComponent) {
            this.helpTabComponent.cleanup();
        }
        
        if (this.helpSectionSelector) {
            this.helpSectionSelector.cleanup();
        }
        
        if (this.tabComponents) {
            for (const component of this.tabComponents.values()) {
                if (component.cleanup) {
                    component.cleanup();
                }
            }
            this.tabComponents.clear();
        }
    }

    update(deltaTime) {
        // 定期的にデータを更新（5秒間隔）
        if (!this.lastDataUpdate || Date.now() - this.lastDataUpdate > 5000) {
            this.loadUserData();
            this.lastDataUpdate = Date.now();
        }
        
        // Component coordination handled by individual components
        
        // リーダーボードタブが表示中の場合、コンポーネントを更新
        if (this.currentTab === 'leaderboard') {
            const component = this.getTabComponent('leaderboard');
            if (component && component.update) {
                component.update(deltaTime);
            }
        }
    }

    render(context) {
        try {
            // レンダリングを新しいUserInfoRendererコンポーネントに委譲
            this.renderer.render(context, this.tabManager, this.userProfileManager, this.helpSystem, this.dialogManager);
        } catch (error) {
            console.error('UserInfoScene render error:', error);
            this.showError('描画エラーが発生しました');
        }
    }

    handleInput(event) {
        try {
            // 入力処理を新しいUserInfoEventHandlerコンポーネントに委譲
            return this.eventHandler.handleInput(event, this.tabManager, this.userProfileManager, this.helpSystem, this.dialogManager, this.renderer);
        } catch (error) {
            console.error('UserInfoScene input error:', error);
            this.showError('入力処理エラーが発生しました');
            return false;
        }
    }

    /**
     * マウス移動処理
     */
    handleMouseMove(event) {
        try {
            const canvas = this.gameEngine.canvas;
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            // リーダーボードタブでのマウスホバー処理
            if (this.currentTab === 'leaderboard') {
                const component = this.getTabComponent('leaderboard');
                if (component) {
                    const contentY = this.headerHeight;
                    const contentHeight = canvas.height - contentY - 80;
                    component.handleHover(x, y, contentY, contentHeight);
                }
            }
        } catch (error) {
            console.error('[UserInfoScene] マウス移動処理エラー:', error);
        }
    }

    /**
     * ホイール処理
     */
    handleWheel(event) {
        try {
            // デフォルトのスクロール動作を無効化
            event.preventDefault();
            
            // リーダーボードタブでのスクロール処理
            if (this.currentTab === 'leaderboard') {
                const component = this.getTabComponent('leaderboard');
                if (component) {
                    component.handleScroll(event.deltaY);
                }
                return;
            }
            
            // その他のタブでもスクロール処理があれば追加
            
        } catch (error) {
            console.error('[UserInfoScene] ホイール処理エラー:', error);
        }
    }

    /**
     * ユーザーデータを読み込む
     */
    loadUserData() {
        try {
            // StatisticsManagerから統計データを取得
            if (this.gameEngine.statisticsManager) {
                this.statisticsData = this.gameEngine.statisticsManager.getDetailedStatistics();
            }
            
            // AchievementManagerから実績データを取得
            if (this.gameEngine.achievementManager) {
                this.achievementsData = this.gameEngine.achievementManager.getAchievements();
                this.achievementsByCategory = this.gameEngine.achievementManager.getAchievementsByCategory();
                
                // 実績統計UIを初期化（遅延初期化）
                if (!this.achievementStatsUI) {
                    this.achievementStatsUI = new AchievementStatsUI(this.gameEngine.achievementManager);
                }
            }
            
            this.errorMessage = null;
        } catch (error) {
            console.error('Failed to load user data:', error);
            this.showError('データの読み込みに失敗しました');
        }
    }

    /**
     * タイトルを描画
     */
    renderTitle(context) {
        const canvas = this.gameEngine.canvas;
        
        context.fillStyle = '#ffffff';
        context.font = 'bold 32px Arial';
        context.textAlign = 'center';
        context.fillText('ユーザー情報', canvas.width / 2, 50);
    }

    /**
     * タブを描画
     */
    renderTabs(context) {
        const canvas = this.gameEngine.canvas;
        const tabWidth = canvas.width / this.tabs.length;
        const tabY = this.headerHeight - this.tabHeight;
        
        for (let i = 0; i < this.tabs.length; i++) {
            const tabX = i * tabWidth;
            const isActive = this.tabs[i] === this.currentTab;
            const isFocused = this.focusedElement === i;
            
            // タブ背景
            context.fillStyle = isActive ? '#4a90e2' : '#1a1a2e';
            if (isFocused) {
                context.fillStyle = isActive ? '#6bb0ff' : '#2a2a3e';
            }
            context.fillRect(tabX, tabY, tabWidth, this.tabHeight);
            
            // タブ枠線
            context.strokeStyle = '#333';
            context.lineWidth = 1;
            context.strokeRect(tabX, tabY, tabWidth, this.tabHeight);
            
            // タブテキスト
            context.fillStyle = '#ffffff';
            context.font = '18px Arial';
            context.textAlign = 'center';
            context.fillText(
                this.tabLabels[i], 
                tabX + tabWidth / 2, 
                tabY + this.tabHeight / 2 + 6
            );
        }
    }

    /**
     * コンテンツを描画
     */
    renderContent(context) {
        const canvas = this.gameEngine.canvas;
        const contentY = this.headerHeight;
        const contentHeight = canvas.height - contentY - 80; // 戻るボタン分を除く
        
        // コンテンツエリアの背景
        context.fillStyle = '#1a1a2e';
        context.fillRect(0, contentY, canvas.width, contentHeight);
        
        // 現在のタブに応じてコンテンツを描画
        switch (this.currentTab) {
            case 'statistics':
                this.renderStatisticsWithComponent(context, contentY, contentHeight);
                break;
            case 'achievements':
                this.renderAchievementsWithComponent(context, contentY, contentHeight);
                break;
            case 'leaderboard':
                this.renderLeaderboardWithComponent(context, contentY, contentHeight);
                break;
            case 'challenges':
                this.renderChallengesWithComponent(context, contentY, contentHeight);
                break;
            case 'management':
                this.renderManagementWithComponent(context, contentY, contentHeight);
                break;
            case 'help':
                this.renderHelpWithComponent(context, contentY, contentHeight);
                break;
        }
    }

    /**
     * 統計データをコンポーネントで描画
     */
    renderStatisticsWithComponent(context, y, height) {
        return this.userStatisticsRenderer.renderStatisticsWithComponent(context, y, height, this.statisticsTabComponent);
    }

    // Responsive layout methods moved to components





    /**
     * 実績データを描画（コンポーネントに委譲）
     */
    renderAchievements(context, y, height) {
        return this.userAchievementDisplay.renderAchievements(context, y, height);
    }

    // Achievement rendering methods moved to UserAchievementDisplay component
    
    // Achievement stats methods moved to UserAchievementDisplay component
    
    // Achievement filter methods moved to UserAchievementDisplay component

    // Achievement item rendering moved to UserAchievementDisplay component

    // Progress bar rendering moved to UserAchievementDisplay component
    
    /**
     * 実績カテゴリフィルターのクリック処理（コンポーネントに委譲）
     */
    handleAchievementCategoryClick(x, y) {
        return this.userAchievementDisplay.handleAchievementCategoryClick(x, y);
    }

    /**
     * ユーザー管理画面を描画（コンポーネントに委譲）
     */
    renderUserManagement(context, y, height) {
        return this.userProfileManager.renderUserManagement(context, y, height);
    }

    // User management rendering methods moved to UserProfileManager and UserDataExporter components

    // Dialog rendering handled by DialogManager









    /**
     * 戻るボタンを描画
     */
    renderBackButton(context) {
        const canvas = this.gameEngine.canvas;
        const buttonY = canvas.height - 70;
        const isFocused = this.focusedElement === this.tabs.length;
        
        context.fillStyle = isFocused ? '#6bb0ff' : '#4a90e2';
        context.fillRect(50, buttonY, 120, 50);
        
        context.fillStyle = '#ffffff';
        context.font = '18px Arial';
        context.textAlign = 'center';
        context.fillText('戻る', 110, buttonY + 30);
    }

    /**
     * エラーメッセージを描画
     */
    renderErrorMessage(context) {
        const canvas = this.gameEngine.canvas;
        
        // 背景
        context.fillStyle = 'rgba(204, 0, 0, 0.8)';
        context.fillRect(0, 0, canvas.width, 60);
        
        // エラーテキスト
        context.fillStyle = '#ffffff';
        context.font = '16px Arial';
        context.textAlign = 'center';
        context.fillText(this.errorMessage, canvas.width / 2, 35);
    }

    /**
     * クリック処理
     */
    handleClick(event) {
        const canvas = this.gameEngine.canvas;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // ダイアログが表示されている場合はダイアログの処理を優先
        if (this.showingDialog) {
            this.handleDialogClick(x, y);
            return;
        }
        
        // タブクリック処理
        if (y >= this.headerHeight - this.tabHeight && y <= this.headerHeight) {
            const tabIndex = Math.floor(x / (canvas.width / this.tabs.length));
            if (tabIndex >= 0 && tabIndex < this.tabs.length) {
                this.switchTab(this.tabs[tabIndex]);
                this.focusedElement = tabIndex;
                return;
            }
        }
        
        // 統計画面のフィルター・モード切り替えクリック処理
        if (this.currentTab === 'statistics') {
            this.handleStatisticsClickWithComponent(x, y);
        }
        
        // 実績画面のカテゴリフィルタークリック処理
        if (this.currentTab === 'achievements') {
            this.handleAchievementCategoryClick(x, y);
        }
        
        // リーダーボード画面のクリック処理
        if (this.currentTab === 'leaderboard') {
            this.handleLeaderboardClick(x, y);
        }
        
        // チャレンジ画面のクリック処理
        if (this.currentTab === 'challenges') {
            this.handleChallengesClick(x, y);
        }
        
        // ユーザー管理画面のボタンクリック処理
        if (this.currentTab === 'management') {
            this.handleManagementClick(x, y);
        }
        
        // ヘルプ画面のセクション選択クリック処理
        if (this.currentTab === 'help') {
            this.handleHelpTabClick(x, y);
        }
        
        // 戻るボタンクリック処理
        if (x >= 50 && x <= 170 && y >= canvas.height - 70 && y <= canvas.height - 20) {
            this.sceneManager.switchScene('menu');
            return;
        }
    }

    /**
     * ユーザー管理画面のクリック処理（コンポーネントに委譲）
     */
    handleManagementClick(x, y) {
        return this.userProfileManager.handleManagementClick(x, y);
    }

    /**
     * リーダーボードクリック処理
     */
    handleLeaderboardClick(x, y) {
        try {
            // コンポーネントのクリック処理に委譲
            const component = this.getTabComponent('leaderboard');
            if (component) {
                const canvas = this.gameEngine.canvas;
                const contentY = this.headerHeight;
                const contentHeight = canvas.height - contentY - 80;
                
                const handled = component.handleClick(x, y, contentY, contentHeight);
                if (handled) {
                    return;
                }
            }
        } catch (error) {
            console.error('[UserInfoScene] リーダーボードクリック処理エラー:', error);
        }
    }

    /**
     * チャレンジ画面のクリック処理
     */
    handleChallengesClick(x, y) {
        try {
            const component = this.getTabComponent('challenges');
            if (component && typeof component.handleClick === 'function') {
                const canvas = this.gameEngine.canvas;
                const contentY = this.headerHeight;
                const contentHeight = canvas.height - contentY - 80;
                const contentX = this.contentPadding;
                const contentWidth = canvas.width - this.contentPadding * 2;
                
                // コンポーネントのクリック処理を呼び出し
                const handled = component.handleClick(x, y, contentX, contentY, contentWidth, contentHeight);
                
                if (handled) {
                    return;
                }
            }
            
            // コンポーネントで処理されなかった場合の代替処理
            console.log('[UserInfoScene] チャレンジクリック - 代替処理');
            
        } catch (error) {
            console.error('[UserInfoScene] チャレンジクリック処理エラー:', error);
        }
    }

    // Dialog click handling moved to DialogManager


    /**
     * ユーザー名変更ダイアログを表示
     */
    async showUsernameChangeDialog() {
        try {
            const result = await this.dialogManager.showDialog('username');
            
            if (result.action === 'change') {
                console.log('Username changed:', result.data);
                this.showMessage('ユーザー名が変更されました');
                this.loadUserData(); // データを再読み込み
            }
        } catch (error) {
            console.error('Username change dialog error:', error);
            this.showError('ユーザー名変更ダイアログでエラーが発生しました');
        }
    }

    /**
     * データエクスポートダイアログを表示
     */
    async showDataExportDialog() {
        try {
            const result = await this.dialogManager.showDialog('export', {
                exportType: 'playerData',
                format: 'json'
            });
            
            if (result.action === 'download') {
                console.log('Data exported and downloaded:', result.data);
                this.showMessage('データがダウンロードされました');
            } else if (result.action === 'copy') {
                console.log('Data copied to clipboard:', result.data);
                this.showMessage('データがクリップボードにコピーされました');
            }
        } catch (error) {
            console.error('Export dialog error:', error);
            this.showError('エクスポートダイアログでエラーが発生しました');
        }
    }

    /**
     * データインポートダイアログを表示
     */
    async showDataImportDialog() {
        try {
            const result = await this.dialogManager.showDialog('import');
            
            if (result.action === 'import' && result.data.success) {
                console.log('Data imported successfully:', result.data);
                this.showMessage('データが正常にインポートされました');
                this.loadUserData(); // データを再読み込み
            } else if (result.data.error) {
                this.showError(`インポートエラー: ${result.data.error}`);
            }
        } catch (error) {
            console.error('Import dialog error:', error);
            this.showError('インポートダイアログでエラーが発生しました');
        }
    }

    /**
     * ダイアログを閉じる（レガシー互換）
     */
    closeDialog() {
        if (this.dialogManager) {
            this.dialogManager.closeDialog();
        } else {
            // フォールバック
            this.showingDialog = null;
            this.dialogData = {};
        }
    }

    /**
     * ダイアログのOKボタン処理
     */
    handleDialogOK() {
        switch (this.showingDialog) {
            case 'username':
                this.processUsernameChange();
                break;
            case 'export':
                this.closeDialog();
                break;
            case 'import':
                this.processDataImport();
                break;
        }
    }

    // Username processing methods moved to UserProfileManager component

    // Data export methods moved to UserDataExporter component






    // Data restoration methods moved to UserDataExporter component

    /**
     * キーボード処理
     */
    handleKeyboard(event) {
        // ダイアログが表示されている場合
        if (this.showingDialog) {
            this.handleDialogKeyboard(event);
            return;
        }
        
        // 基本的なナビゲーション
        switch (event.key) {
            case 'Escape':
                this.sceneManager.switchScene('menu');
                break;
            case 'ArrowLeft':
                this.navigateTab(-1);
                break;
            case 'ArrowRight':
                this.navigateTab(1);
                break;
            case 'Enter':
                this.activateFocusedElement();
                break;
        }
    }

    /**
     * ダイアログのキーボード処理
     */
    handleDialogKeyboard(event) {
        switch (event.key) {
            case 'Escape':
                this.closeDialog();
                break;
            case 'Enter':
                this.handleDialogOK();
                break;
        }
    }



    /**
     * タブを切り替える
     */
    switchTab(tabName) {
        if (this.tabs.includes(tabName)) {
            // 既存のタブを非アクティブ化
            this.deactivateAllTabs();
            
            // 新しいタブに切り替え
            this.currentTab = tabName;
            this.scrollPosition = 0;
            this.selectedItem = -1;
            
            // 新しいタブをアクティブ化
            this.activateCurrentTab();
        }
    }
    
    /**
     * 全タブコンポーネントを非アクティブ化
     */
    deactivateAllTabs() {
        if (this.tabComponents) {
            this.tabComponents.forEach(component => {
                if (component && component.deactivate) {
                    component.deactivate();
                }
            });
        }
    }
    
    /**
     * 現在のタブコンポーネントをアクティブ化
     */
    activateCurrentTab() {
        const component = this.getTabComponent(this.currentTab);
        if (component && component.activate) {
            component.activate();
            // アクセス時間を記録（メモリ管理用）
            component.lastAccessTime = Date.now();
        }
    }
    
    
    
    

    /**
     * タブナビゲーション
     */
    navigateTab(direction) {
        if (this.focusedElement < this.tabs.length) {
            const currentIndex = this.tabs.indexOf(this.currentTab);
            const newIndex = (currentIndex + direction + this.tabs.length) % this.tabs.length;
            this.switchTab(this.tabs[newIndex]);
            this.focusedElement = newIndex;
        }
    }

    /**
     * フォーカスナビゲーション
     */
    navigateFocus(direction) {
        let maxFocus = this.tabs.length; // タブ数 + 戻るボタン
        
        // ユーザー管理画面では追加のフォーカス可能要素がある
        if (this.currentTab === 'management') {
            maxFocus += 3; // ユーザー名変更、エクスポート、インポートボタン
        }
        
        this.focusedElement = (this.focusedElement + direction + maxFocus + 1) % (maxFocus + 1);
    }

    /**
     * フォーカスされた要素を実行
     */
    activateFocusedElement() {
        if (this.focusedElement < this.tabs.length) {
            this.switchTab(this.tabs[this.focusedElement]);
        } else if (this.currentTab === 'management') {
            // ユーザー管理画面のボタン処理
            const buttonIndex = this.focusedElement - this.tabs.length;
            switch (buttonIndex) {
                case 0: // 戻るボタン
                    this.sceneManager.switchScene('menu');
                    break;
                case 1: // ユーザー名変更ボタン
                    this.showUsernameChangeDialog();
                    break;
                case 2: // エクスポートボタン
                    this.showDataExportDialog();
                    break;
                case 3: // インポートボタン
                    this.showDataImportDialog();
                    break;
            }
        } else if (this.focusedElement === this.tabs.length) {
            this.sceneManager.switchScene('menu');
        }
    }

    /**
     * エラーメッセージを表示
     */
    showError(message) {
        this.errorMessage = message;
        
        if (this.errorTimeout) {
            clearTimeout(this.errorTimeout);
        }
        
        this.errorTimeout = setTimeout(() => {
            this.errorMessage = null;
            this.errorTimeout = null;
        }, 3000);
    }

    // Accessibility methods moved to components
    


    /**
     * 統計データフィルタリング完了時のハンドラ
     */
    onStatisticsDataFiltered(data) {
        // フィルタリングされたデータでUI更新
        this.statisticsData = data.statistics;
        
        // 必要に応じて再描画をトリガー
        if (this.currentTab === 'statistics') {
            // 再描画フラグを設定（次のrenderループで反映）
            this.needsRedraw = true;
        }
    }

    /**
     * 統計フィルターエラー時のハンドラ
     */
    onStatisticsFilterError(error) {
        this.setErrorMessage(`統計データの取得に失敗しました: ${error.message}`);
    }





    /**
     * データなしメッセージの描画
     */
    renderNoDataMessage(context, y, height, message) {
        context.fillStyle = '#9CA3AF';
        context.font = '16px system-ui, -apple-system, sans-serif';
        context.textAlign = 'center';
        context.fillText(message, this.gameEngine.canvas.width / 2, y + height / 2);
    }

    // Chart rendering and statistics methods moved to UserStatisticsRenderer component
    
    renderHelpWithComponent(context, y, height) {
        return this.userHelpIntegration.renderHelpWithComponent(context, y, height, this.helpTabComponent);
    }
    
    renderManagementWithComponent(context, y, height) {
        const canvas = this.gameEngine.canvas;
        const contentWidth = canvas.width - this.contentPadding * 2;
        const contentX = this.contentPadding;
        
        if (this.managementTabComponent && this.managementTabComponent.isActive) {
            this.managementTabComponent.render(context, contentX, y, contentWidth, height);
        } else {
            this.renderUserManagement(context, y, height);
        }
    }
    
    renderAchievementsWithComponent(context, y, height) {
        return this.userAchievementDisplay.renderAchievementsWithComponent(context, y, height, this.achievementsTabComponent);
    }

    /**
     * リーダーボードタブをコンポーネントで描画
     */
    renderLeaderboardWithComponent(context, contentY, contentHeight) {
        try {
            const component = this.getTabComponent('leaderboard');
            if (component) {
                component.render(context, contentY, contentHeight);
            } else {
                this.renderLeaderboardLoadingState(context, contentY, contentHeight);
            }
        } catch (error) {
            console.error('[UserInfoScene] リーダーボードコンポーネント描画エラー:', error);
            this.renderLeaderboardErrorState(context, contentY, contentHeight);
        }
    }

    /**
     * チャレンジコンポーネントを使用した描画
     */
    renderChallengesWithComponent(context, contentY, contentHeight) {
        try {
            const component = this.getTabComponent('challenges');
            if (component) {
                const canvas = this.gameEngine.canvas;
                const contentX = this.contentPadding;
                const contentWidth = canvas.width - this.contentPadding * 2;
                component.render(context, contentX, contentY, contentWidth, contentHeight);
            } else {
                this.renderChallengesLoadingState(context, contentY, contentHeight);
            }
        } catch (error) {
            console.error('[UserInfoScene] チャレンジコンポーネント描画エラー:', error);
            this.renderChallengesErrorState(context, contentY, contentHeight);
        }
    }
    
    // Loading and error state rendering moved to component classes
    
    // Help rendering methods moved to UserHelpIntegration component
    
    
    
    
}