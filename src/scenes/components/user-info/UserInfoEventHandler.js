/**
 * UserInfoEventHandler.js
 * ユーザー情報シーンのイベント処理コンポーネント
 * UserInfoSceneから分離されたイベント処理機能を提供
 */

export class UserInfoEventHandler {
    constructor(gameEngine, eventBus, sceneState) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.sceneState = sceneState;
        
        // イベント処理状態
        this.lastClickTime = 0;
        this.lastKeyTime = 0;
        this.debounceDelay = 200;
        
        this.setupEventListeners();
    }
    
    /**
     * イベントリスナーをセットアップ
     */
    setupEventListeners() {
        // ダイアログイベントの監視
        this.eventBus.on('dialog-opened', (data) => {
            console.log('Dialog opened:', data.type);
            this.sceneState.set('activeDialog', data.type);
        });
        
        this.eventBus.on('dialog-closed', (data) => {
            console.log('Dialog closed:', data.type);
            this.sceneState.set('activeDialog', null);
        });
        
        // エラー関連イベント
        this.eventBus.on('error-occurred', (data) => {
            this.showErrorMessage(data.message);
        });
        
        this.eventBus.on('error-cleared', () => {
            this.clearErrorMessage();
        });
        
        // タブ関連イベント
        this.eventBus.on('tab-changed', (data) => {
            console.log('Tab changed to:', data.tabId);
        });
    }
    
    /**
     * メインの入力処理
     */
    handleInput(event, tabManager, profileManager, helpSystem, dialogManager, renderer) {
        try {
            const canvas = this.gameEngine.canvas;
            
            // ダイアログが開いている場合は、ダイアログが優先
            if (dialogManager && this.sceneState.get('activeDialog')) {
                return this.handleDialogInput(event, dialogManager);
            }
            
            // イベントタイプ別の処理
            switch (event.type) {
                case 'click':
                case 'mousedown':
                case 'touchstart':
                    return this.handleClickInput(event, tabManager, helpSystem, renderer, canvas);
                    
                case 'keydown':
                    return this.handleKeyboardInput(event, dialogManager);
                    
                case 'mousemove':
                case 'touchmove':
                    return this.handleMouseMove(event, canvas);
                    
                default:
                    return false;
            }
        } catch (error) {
            console.error('UserInfoEventHandler input error:', error);
            this.showErrorMessage('入力処理中にエラーが発生しました');
            return false;
        }
    }
    
    /**
     * ダイアログの入力処理
     */
    handleDialogInput(event, dialogManager) {
        if (!dialogManager) return false;
        
        const { x, y } = this.getEventCoordinates(event);
        
        switch (event.type) {
            case 'click':
            case 'mousedown':
            case 'touchstart':
                return dialogManager.handleClick(x, y);
                
            case 'keydown':
                return dialogManager.handleKeyboard(event);
                
            default:
                return false;
        }
    }
    
    /**
     * クリック入力の処理
     */
    handleClickInput(event, tabManager, helpSystem, renderer, canvas) {
        const now = Date.now();
        if (now - this.lastClickTime < this.debounceDelay) {
            return true; // デバウンス
        }
        this.lastClickTime = now;
        
        const { x, y } = this.getEventCoordinates(event);
        
        // ヘルプシステムの処理
        if (helpSystem && helpSystem.handleClick(x, y, canvas)) {
            return true;
        }
        
        // 戻るボタンの処理
        if (this.handleBackButtonClick(x, y)) {
            return true;
        }
        
        // タブヘッダーの処理
        if (tabManager && this.handleTabHeaderClick(x, y, tabManager, renderer, canvas)) {
            return true;
        }
        
        // タブコンテンツの処理
        if (tabManager && this.handleTabContentClick(x, y, tabManager, renderer, canvas)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * キーボード入力の処理
     */
    handleKeyboardInput(event, dialogManager) {
        const now = Date.now();
        if (now - this.lastKeyTime < this.debounceDelay) {
            return true; // デバウンス
        }
        this.lastKeyTime = now;
        
        // ダイアログが開いている場合
        if (dialogManager && this.sceneState.get('activeDialog')) {
            return dialogManager.handleKeyboard(event);
        }
        
        // 一般的なキーボードショートカット
        switch (event.key) {
            case 'Escape':
                this.handleBackAction();
                return true;
                
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
                const tabIndex = parseInt(event.key) - 1;
                this.handleTabShortcut(tabIndex);
                return true;
                
            default:
                return false;
        }
    }
    
    /**
     * マウス移動の処理
     */
    handleMouseMove(event, canvas) {
        const { x, y } = this.getEventCoordinates(event);
        
        // ホバー効果の処理
        this.updateHoverStates(x, y, canvas);
        
        return false; // マウス移動は通常は他の処理をブロックしない
    }
    
    /**
     * 戻るボタンのクリック処理
     */
    handleBackButtonClick(x, y) {
        const backButton = this.sceneState.get('backButton');
        if (!backButton) return false;
        
        if (x >= backButton.x && x <= backButton.x + backButton.width &&
            y >= backButton.y && y <= backButton.y + backButton.height) {
            this.handleBackAction();
            return true;
        }
        
        return false;
    }
    
    /**
     * タブヘッダーのクリック処理
     */
    handleTabHeaderClick(x, y, tabManager, renderer, canvas) {
        const hitAreas = renderer.calculateHitAreas(canvas, tabManager);
        
        for (const tabArea of hitAreas.tabs) {
            if (x >= tabArea.x && x <= tabArea.x + tabArea.width &&
                y >= tabArea.y && y <= tabArea.y + tabArea.height) {
                tabManager.switchTab(tabArea.id);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * タブコンテンツのクリック処理
     */
    handleTabContentClick(x, y, tabManager, renderer, canvas) {
        const layout = renderer.calculateLayout(canvas);
        const contentX = layout.contentPadding;
        const contentY = layout.headerHeight + layout.tabHeight;
        const contentWidth = canvas.width - (layout.contentPadding * 2);
        const contentHeight = canvas.height - contentY - 80;
        
        if (x >= contentX && x <= contentX + contentWidth &&
            y >= contentY && y <= contentY + contentHeight) {
            return tabManager.handleTabContentClick(x, y, contentX + 10, contentY + 10, contentWidth - 20, contentHeight - 20);
        }
        
        return false;
    }
    
    /**
     * 戻るアクションの処理
     */
    handleBackAction() {
        try {
            this.gameEngine.setCurrentScene('MainMenuScene');
            console.log('Navigating back to MainMenuScene');
        } catch (error) {
            console.error('Error navigating back:', error);
            this.showErrorMessage('メニューに戻れませんでした');
        }
    }
    
    /**
     * タブショートカットの処理
     */
    handleTabShortcut(tabIndex) {
        // この機能は後で実装
        console.log(`Tab shortcut ${tabIndex + 1} pressed`);
    }
    
    /**
     * ホバー状態の更新
     */
    updateHoverStates(x, y, canvas) {
        // 戻るボタンのホバー
        const backButton = this.sceneState.get('backButton');
        if (backButton) {
            const isHovering = x >= backButton.x && x <= backButton.x + backButton.width &&
                              y >= backButton.y && y <= backButton.y + backButton.height;
            this.sceneState.set('backButtonHover', isHovering);
        }
        
        // タブのホバー（将来の実装用）
        // この機能は後で実装
    }
    
    /**
     * イベント座標の取得
     */
    getEventCoordinates(event) {
        if (event.touches && event.touches.length > 0) {
            // タッチイベント
            const rect = this.gameEngine.canvas.getBoundingClientRect();
            return {
                x: event.touches[0].clientX - rect.left,
                y: event.touches[0].clientY - rect.top
            };
        } else {
            // マウスイベント
            return {
                x: event.offsetX || event.layerX,
                y: event.offsetY || event.layerY
            };
        }
    }
    
    /**
     * エラーメッセージの表示
     */
    showErrorMessage(message) {
        this.sceneState.set('errorMessage', message);
        
        // 自動でエラーメッセージをクリア
        if (this.sceneState.get('errorTimeout')) {
            clearTimeout(this.sceneState.get('errorTimeout'));
        }
        
        const timeout = setTimeout(() => {
            this.clearErrorMessage();
        }, 5000);
        
        this.sceneState.set('errorTimeout', timeout);
    }
    
    /**
     * エラーメッセージのクリア
     */
    clearErrorMessage() {
        this.sceneState.set('errorMessage', null);
        
        const timeout = this.sceneState.get('errorTimeout');
        if (timeout) {
            clearTimeout(timeout);
            this.sceneState.set('errorTimeout', null);
        }
    }
    
    /**
     * リソースのクリーンアップ
     */
    dispose() {
        const timeout = this.sceneState.get('errorTimeout');
        if (timeout) {
            clearTimeout(timeout);
        }
        
        console.log('UserInfoEventHandler disposed');
    }
}