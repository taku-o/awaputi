/**
 * UserInfoEventHandler.ts
 * ユーザー情報シーンのイベント処理コンポーネント
 * UserInfoSceneから分離されたイベント処理機能を提供
 */

import { GameEngine } from '../../../types/gameEngine';
import { EventBus } from '../../../types/eventBus';

// イベント関連の型定義
interface DialogData {
    type: string;
    [key: string]: any;
}

interface ErrorData {
    message: string;
    error?: Error;
}

interface TabData {
    tabId: string;
    previousTabId?: string;
}

interface EventCoordinates {
    x: number;
    y: number;
}

interface BackButton {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface HitArea {
    x: number;
    y: number;
    width: number;
    height: number;
    id: string;
}

interface HitAreas {
    tabs: HitArea[];
    buttons?: HitArea[];
}

interface Layout {
    contentPadding: number;
    headerHeight: number;
    tabHeight: number;
    [key: string]: any;
}

// シーン状態のインターフェース
interface SceneState {
    get(key: string): any;
    set(key: string, value: any): void;
}

// コンポーネントインターフェース
interface TabManager {
    switchTab(tabId: string): void;
    handleTabContentClick(x: number, y: number, contentX: number, contentY: number, contentWidth: number, contentHeight: number): boolean;
}

interface ProfileManager {
    handleClick?(x: number, y: number): boolean;
}

interface HelpSystem {
    handleClick(x: number, y: number, canvas: HTMLCanvasElement): boolean;
}

interface DialogManager {
    handleClick(x: number, y: number): boolean;
    handleKeyboard(event: KeyboardEvent): boolean;
}

interface Renderer {
    calculateHitAreas(canvas: HTMLCanvasElement, tabManager: TabManager): HitAreas;
    calculateLayout(canvas: HTMLCanvasElement): Layout;
}

export class UserInfoEventHandler {
    private gameEngine: GameEngine;
    private eventBus: EventBus | null;
    private sceneState: SceneState;
    
    // イベント処理状態
    private lastClickTime: number = 0;
    private lastKeyTime: number = 0;
    private readonly debounceDelay: number = 200;

    constructor(gameEngine: GameEngine, eventBus: EventBus | null, sceneState: SceneState) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.sceneState = sceneState;
        
        this.setupEventListeners();
    }
    
    /**
     * イベントリスナーをセットアップ
     */
    private setupEventListeners(): void {
        if (!this.eventBus) return;
        
        // ダイアログイベントの監視
        this.eventBus.on('dialog-opened', (data: DialogData) => {
            console.log('Dialog opened:', data.type);
            this.sceneState.set('activeDialog', data.type);
        });

        this.eventBus.on('dialog-closed', (data: DialogData) => {
            console.log('Dialog closed:', data.type);
            this.sceneState.set('activeDialog', null);
        });
        
        // エラー関連イベント
        this.eventBus.on('error-occurred', (data: ErrorData) => {
            this.showErrorMessage(data.message);
        });

        this.eventBus.on('error-cleared', () => {
            this.clearErrorMessage();
        });
        
        // タブ関連イベント
        this.eventBus.on('tab-changed', (data: TabData) => {
            console.log('Tab changed to:', data.tabId);
        });
    }

    /**
     * メインの入力処理
     */
    public handleInput(
        event: Event,
        tabManager?: TabManager,
        profileManager?: ProfileManager,
        helpSystem?: HelpSystem,
        dialogManager?: DialogManager,
        renderer?: Renderer
    ): boolean {
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
                    return this.handleClickInput(event as MouseEvent | TouchEvent, tabManager, helpSystem, renderer, canvas);
                case 'keydown':
                    return this.handleKeyboardInput(event as KeyboardEvent, dialogManager);
                case 'mousemove':
                case 'touchmove':
                    return this.handleMouseMove(event as MouseEvent | TouchEvent, canvas);
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
    private handleDialogInput(event: Event, dialogManager: DialogManager): boolean {
        const { x, y } = this.getEventCoordinates(event as MouseEvent | TouchEvent);

        switch (event.type) {
            case 'click':
            case 'mousedown':
            case 'touchstart':
                return dialogManager.handleClick(x, y);
            case 'keydown':
                return dialogManager.handleKeyboard(event as KeyboardEvent);
            default:
                return false;
        }
    }
    
    /**
     * クリック入力の処理
     */
    private handleClickInput(
        event: MouseEvent | TouchEvent,
        tabManager?: TabManager,
        helpSystem?: HelpSystem,
        renderer?: Renderer,
        canvas?: HTMLCanvasElement
    ): boolean {
        const now = Date.now();
        if (now - this.lastClickTime < this.debounceDelay) {
            return true; // デバウンス
        }
        this.lastClickTime = now;
        
        const { x, y } = this.getEventCoordinates(event);
        
        // ヘルプシステムの処理
        if (helpSystem && canvas && helpSystem.handleClick(x, y, canvas)) {
            return true;
        }
        
        // 戻るボタンの処理
        if (this.handleBackButtonClick(x, y)) {
            return true;
        }
        
        // タブヘッダーの処理
        if (tabManager && renderer && canvas && this.handleTabHeaderClick(x, y, tabManager, renderer, canvas)) {
            return true;
        }
        
        // タブコンテンツの処理
        if (tabManager && renderer && canvas && this.handleTabContentClick(x, y, tabManager, renderer, canvas)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * キーボード入力の処理
     */
    private handleKeyboardInput(event: KeyboardEvent, dialogManager?: DialogManager): boolean {
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
    private handleMouseMove(event: MouseEvent | TouchEvent, canvas: HTMLCanvasElement): boolean {
        const { x, y } = this.getEventCoordinates(event);
        
        // ホバー効果の処理
        this.updateHoverStates(x, y, canvas);
        
        return false; // マウス移動は通常は他の処理をブロックしない
    }
    
    /**
     * 戻るボタンのクリック処理
     */
    private handleBackButtonClick(x: number, y: number): boolean {
        const backButton = this.sceneState.get('backButton') as BackButton | null;
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
    private handleTabHeaderClick(
        x: number,
        y: number,
        tabManager: TabManager,
        renderer: Renderer,
        canvas: HTMLCanvasElement
    ): boolean {
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
    private handleTabContentClick(
        x: number,
        y: number,
        tabManager: TabManager,
        renderer: Renderer,
        canvas: HTMLCanvasElement
    ): boolean {
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
    private handleBackAction(): void {
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
    private handleTabShortcut(tabIndex: number): void {
        // この機能は後で実装
        console.log(`Tab shortcut ${tabIndex + 1} pressed`);
    }
    
    /**
     * ホバー状態の更新
     */
    private updateHoverStates(x: number, y: number, canvas: HTMLCanvasElement): void {
        // 戻るボタンのホバー
        const backButton = this.sceneState.get('backButton') as BackButton | null;
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
    private getEventCoordinates(event: MouseEvent | TouchEvent): EventCoordinates {
        if ('touches' in event && event.touches && event.touches.length > 0) {
            // タッチイベント
            const rect = this.gameEngine.canvas.getBoundingClientRect();
            return {
                x: event.touches[0].clientX - rect.left,
                y: event.touches[0].clientY - rect.top
            };
        } else {
            // マウスイベント
            const mouseEvent = event as MouseEvent;
            return {
                x: mouseEvent.offsetX || (mouseEvent as any).layerX,
                y: mouseEvent.offsetY || (mouseEvent as any).layerY
            };
        }
    }
    
    /**
     * エラーメッセージの表示
     */
    private showErrorMessage(message: string): void {
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
    private clearErrorMessage(): void {
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
    public dispose(): void {
        const timeout = this.sceneState.get('errorTimeout');
        if (timeout) {
            clearTimeout(timeout);
        }

        console.log('UserInfoEventHandler disposed');
    }
}