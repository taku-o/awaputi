/**
 * Help Event Manager
 * ヘルプイベント管理 - キーボード・マウス入力の統合処理
 */

import { GameEngine } from '../../core/GameEngine.js';
import { HelpContentManager } from './HelpContentManager.js';
import { HelpAccessibilityManager } from './HelpAccessibilityManager.js';
import { HelpAnimationManager } from './HelpAnimationManager.js';
import { HelpRenderer } from './HelpRenderer.js';

// コールバックインターフェース
interface HelpEventCallbacks {
    onGoBack: (() => void) | null;
    onFeedbackRequest: ((data: FeedbackRequestData) => void) | null;
    onEffectivenessReport: ((report: any) => void) | null;
    onSearchFocus: (() => void) | null;
}

// フィードバックリクエストデータ
interface FeedbackRequestData {
    topic: any;
    content: any;
    category: string;
    position?: { x: number; y: number };
    quickMode?: boolean;
}

// イベント状態インターフェース
interface EventState {
    searchFocused: boolean;
    lastInputTime: number;
    hasActiveListeners: boolean;
}

// レイアウト情報インターフェース
interface HelpLayout {
    searchBar: { x: number; y: number; width: number; height: number };
    sidebar: { x: number; y: number; width: number; height: number };
    content: { x: number; y: number; width: number; height: number };
    backButton: { x: number; y: number; width: number; height: number };
}

// キーボードハンドラータイプ
type KeyboardHandler = (event: KeyboardEvent) => void;

/**
 * Help Event Manager
 * ヘルプイベント管理器 - 入力イベントの統合処理と配信
 */
export class HelpEventManager {
    private gameEngine: GameEngine;
    private contentManager: HelpContentManager;
    private accessibilityManager: HelpAccessibilityManager;
    private animationManager: HelpAnimationManager;
    
    // イベントハンドラー
    private boundKeyHandler: ((event: KeyboardEvent) => void) | null = null;
    private boundClickHandler: ((event: MouseEvent) => void) | null = null;
    private boundContextMenuHandler: ((event: MouseEvent) => void) | null = null;
    private boundResizeHandler: (() => void) | null = null;
    private boundWheelHandler: ((event: WheelEvent) => void) | null = null;
    private boundMouseMoveHandler: ((event: MouseEvent) => void) | null = null;
    private boundMouseUpHandler: ((event: MouseEvent) => void) | null = null;
    
    // IME対応のための隠し入力フィールド
    private hiddenInput: HTMLInputElement | null = null;
    private boundInputHandler: ((event: Event) => void) | null = null;
    
    // キーボードショートカット
    private keyboardHandlers: Record<string, KeyboardHandler>;
    
    // 状態管理
    private searchFocused: boolean = false;
    private currentSearchQuery: string = '';
    private lastInputTime: number = 0;
    private inputThrottleMs: number = 50; // 入力スロットリング
    
    // コールバック
    private callbacks: HelpEventCallbacks;
    
    // 検索関連
    private searchTimeout: number | null = null;
    private isComposing: boolean = false;

    constructor(
        gameEngine: GameEngine,
        contentManager: HelpContentManager,
        accessibilityManager: HelpAccessibilityManager,
        animationManager: HelpAnimationManager
    ) {
        this.gameEngine = gameEngine;
        this.contentManager = contentManager;
        this.accessibilityManager = accessibilityManager;
        this.animationManager = animationManager;

        // キーボードショートカット
        this.keyboardHandlers = {
            'ArrowUp': () => this.navigateUp(),
            'ArrowDown': () => this.navigateDown(),
            'ArrowLeft': () => this.navigateLeft(),
            'ArrowRight': () => this.navigateRight(),
            'Enter': () => this.selectCurrentItem(),
            'Escape': () => this.goBack(),
            'Tab': (event: KeyboardEvent) => this.handleTabNavigation(event),
            '/': (event: KeyboardEvent) => {
                event.preventDefault();
                this.focusSearchBar();
            },
            'F': (event: KeyboardEvent) => {
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.showFeedbackDialog();
                }
            },
            'E': (event: KeyboardEvent) => {
                if (event.ctrlKey && event.shiftKey) {
                    event.preventDefault();
                    this.showEffectivenessReport();
                }
            }
        };
        
        // コールバック
        this.callbacks = {
            onGoBack: null,
            onFeedbackRequest: null,
            onEffectivenessReport: null,
            onSearchFocus: null
        };
    }

    /**
     * イベントリスナーの設定
     */
    public setupEventListeners(): void {
        console.log('HelpEventManager: setupEventListeners() called');
        
        this.boundKeyHandler = (event: KeyboardEvent) => this.handleKeyPress(event);
        this.boundClickHandler = (event: MouseEvent) => this.handleClick(event);
        this.boundContextMenuHandler = (event: MouseEvent) => this.handleContextMenu(event);
        this.boundResizeHandler = () => this.updateInputPosition();
        this.boundWheelHandler = (event: WheelEvent) => this.handleWheel(event);
        this.boundMouseMoveHandler = (event: MouseEvent) => this.handleMouseMove(event);
        this.boundMouseUpHandler = (event: MouseEvent) => this.handleMouseUp(event);
        
        // IME対応の隠し入力フィールドを作成
        console.log('HelpEventManager: calling createHiddenInput()');
        this.createHiddenInput();
        
        document.addEventListener('keydown', this.boundKeyHandler);
        document.addEventListener('click', this.boundClickHandler);
        document.addEventListener('contextmenu', this.boundContextMenuHandler);
        document.addEventListener('wheel', this.boundWheelHandler, { passive: false });
        document.addEventListener('mousemove', this.boundMouseMoveHandler);
        document.addEventListener('mouseup', this.boundMouseUpHandler);
        window.addEventListener('resize', this.boundResizeHandler);
        
        console.log('HelpEventManager: event listeners setup completed');
    }
    
    /**
     * IME対応の隠し入力フィールドを作成
     */
    private createHiddenInput(): void {
        console.log('HelpEventManager: createHiddenInput() called, hiddenInput exists:', !!this.hiddenInput);

        if (this.hiddenInput) {
            console.log('HelpEventManager: hidden input already exists, skipping creation');
            return; // 既に作成済み
        }

        console.log('HelpEventManager: creating new hidden input element');
        this.hiddenInput = document.createElement('input');
        this.hiddenInput.type = 'text';
        this.hiddenInput.style.position = 'absolute';
        
        // Canvas要素の位置を基準に計算
        this.updateInputPosition();
        this.hiddenInput.style.width = '720px';
        this.hiddenInput.style.height = '40px';
        this.hiddenInput.style.fontSize = '16px';
        this.hiddenInput.style.padding = '5px 10px';
        this.hiddenInput.style.border = '2px solid #ccc';
        this.hiddenInput.style.borderRadius = '4px';
        this.hiddenInput.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        this.hiddenInput.style.color = '#333';
        this.hiddenInput.style.zIndex = '1000';
        this.hiddenInput.style.fontFamily = 'Arial, sans-serif';
        this.hiddenInput.style.transition = 'border-color 0.3s, box-shadow 0.3s';
        this.hiddenInput.style.outline = 'none';
        this.hiddenInput.placeholder = 'ヘルプを検索... （/ キーまたはクリックで検索開始）';
        this.hiddenInput.autocomplete = 'off';
        this.hiddenInput.autocorrect = 'off';
        this.hiddenInput.autocapitalize = 'off';
        this.hiddenInput.spellcheck = false;
        
        // IME対応設定
        this.hiddenInput.style.imeMode = 'active';
        this.hiddenInput.setAttribute('lang', 'ja');
        this.hiddenInput.setAttribute('inputmode', 'text');
        
        // Placeholderスタイル（CSS）
        const style = document.createElement('style');
        style.textContent = `
            .help-search-input::placeholder {
                color: #999;
                font-style: italic;
                opacity: 0.8;
            }
        `;
        document.head.appendChild(style);
        this.hiddenInput.className = 'help-search-input';

        console.log('HelpEventManager: setting up input event listeners');
        // 入力イベントハンドラーを設定
        this.boundInputHandler = (event: Event) => this.handleIMEInput(event);
        this.hiddenInput.addEventListener('input', this.boundInputHandler);
        this.hiddenInput.addEventListener('compositionstart', () => {
            console.log('HelpEventManager: composition started');
            this.isComposing = true;
        });
        this.hiddenInput.addEventListener('compositionend', () => {
            console.log('HelpEventManager: composition ended');
            this.isComposing = false;
            // コンポジション終了後に検索を実行
            if (this.hiddenInput) {
                this.performSearch(this.hiddenInput.value);
            }
        });

        // フォーカス・ブラーイベント
        this.hiddenInput.addEventListener('focus', () => {
            console.log('HelpEventManager: input focused');
            this.searchFocused = true;
            if (this.callbacks.onSearchFocus) {
                this.callbacks.onSearchFocus();
            }
        });

        this.hiddenInput.addEventListener('blur', () => {
            console.log('HelpEventManager: input blurred');
            this.searchFocused = false;
        });

        // DOMに追加
        document.body.appendChild(this.hiddenInput);
        console.log('HelpEventManager: hidden input added to DOM');
    }
    
    /**
     * 入力フィールドの位置更新
     */
    private updateInputPosition(): void {
        if (!this.hiddenInput) return;

        try {
            const canvas = this.gameEngine.canvas;
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                // 検索バーをキャンバス上部に配置
                this.hiddenInput.style.left = `${rect.left + 100}px`;
                this.hiddenInput.style.top = `${rect.top + 60}px`;
            } else {
                // フォールバック: 画面中央上部
                this.hiddenInput.style.left = '50%';
                this.hiddenInput.style.top = '60px';
                this.hiddenInput.style.transform = 'translateX(-50%)';
            }
        } catch (error) {
            console.error('HelpEventManager: Failed to update input position:', error);
        }
    }
    
    /**
     * IME入力の処理
     */
    private handleIMEInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        const query = input.value;
        
        console.log('HelpEventManager: IME input:', query, 'composing:', this.isComposing);
        
        this.currentSearchQuery = query;
        
        // IME変換中は検索を実行しない
        if (!this.isComposing) {
            // 入力スロットリング
            const now = Date.now();
            if (now - this.lastInputTime > this.inputThrottleMs) {
                this.performSearch(query);
                this.lastInputTime = now;
            } else {
                // スロットリング期間中は遅延実行
                if (this.searchTimeout) {
                    clearTimeout(this.searchTimeout);
                }
                this.searchTimeout = window.setTimeout(() => {
                    this.performSearch(query);
                }, this.inputThrottleMs);
            }
        }
    }
    
    /**
     * 検索実行
     */
    private performSearch(query: string): void {
        console.log('HelpEventManager: performing search:', query);
        
        if (this.contentManager && typeof this.contentManager.performSearch === 'function') {
            this.contentManager.performSearch(query);
        } else {
            console.warn('HelpEventManager: contentManager.performSearch not available');
        }
    }
    
    /**
     * キーボード入力処理
     */
    private handleKeyPress(event: KeyboardEvent): void {
        const handler = this.keyboardHandlers[event.key];
        if (handler) {
            handler(event);
            return;
        }
        
        // 検索フォーカス中の特別処理
        if (this.searchFocused) {
            if (event.key === 'Escape') {
                this.blurSearchBar();
                event.preventDefault();
                return;
            }
        }
        
        // アクセシビリティ対応のキーボード処理
        if (this.accessibilityManager) {
            this.accessibilityManager.handleKeyboard(event);
        }
    }
    
    /**
     * クリック処理
     */
    private handleClick(event: MouseEvent): void {
        const canvas = this.gameEngine.canvas;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // 検索バー領域のクリック判定
        if (this.isInSearchBarArea(x, y)) {
            this.focusSearchBar();
            return;
        }
        
        // コンテンツ領域の処理
        if (this.contentManager) {
            this.contentManager.handleClick(x, y);
        }
    }
    
    /**
     * コンテキストメニュー処理
     */
    private handleContextMenu(event: MouseEvent): void {
        event.preventDefault();
        
        const canvas = this.gameEngine.canvas;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // フィードバックダイアログを表示
        this.showFeedbackDialog({
            topic: null,
            content: null,
            category: 'general',
            position: { x, y },
            quickMode: true
        });
    }
    
    /**
     * マウスホイール処理
     */
    private handleWheel(event: WheelEvent): void {
        if (this.contentManager && typeof this.contentManager.handleScroll === 'function') {
            this.contentManager.handleScroll(event.deltaY);
        }
        event.preventDefault();
    }
    
    /**
     * マウス移動処理
     */
    private handleMouseMove(event: MouseEvent): void {
        // アニメーション効果のためのマウス位置追跡
        if (this.animationManager) {
            this.animationManager.updateMousePosition(event.clientX, event.clientY);
        }
    }
    
    /**
     * マウスアップ処理
     */
    private handleMouseUp(event: MouseEvent): void {
        // 必要に応じて実装
    }
    
    /**
     * ナビゲーション - 上
     */
    private navigateUp(): void {
        if (this.contentManager && typeof this.contentManager.navigateUp === 'function') {
            this.contentManager.navigateUp();
        }
    }
    
    /**
     * ナビゲーション - 下
     */
    private navigateDown(): void {
        if (this.contentManager && typeof this.contentManager.navigateDown === 'function') {
            this.contentManager.navigateDown();
        }
    }
    
    /**
     * ナビゲーション - 左
     */
    private navigateLeft(): void {
        if (this.contentManager && typeof this.contentManager.navigateLeft === 'function') {
            this.contentManager.navigateLeft();
        }
    }
    
    /**
     * ナビゲーション - 右
     */
    private navigateRight(): void {
        if (this.contentManager && typeof this.contentManager.navigateRight === 'function') {
            this.contentManager.navigateRight();
        }
    }
    
    /**
     * 現在の項目を選択
     */
    private selectCurrentItem(): void {
        if (this.contentManager && typeof this.contentManager.selectCurrentItem === 'function') {
            this.contentManager.selectCurrentItem();
        }
    }
    
    /**
     * タブナビゲーション処理
     */
    private handleTabNavigation(event: KeyboardEvent): void {
        // タブキーによるフォーカス移動
        if (this.accessibilityManager && typeof this.accessibilityManager.handleTabNavigation === 'function') {
            this.accessibilityManager.handleTabNavigation(event);
        }
    }
    
    /**
     * 戻る処理
     */
    private goBack(): void {
        if (this.callbacks.onGoBack) {
            this.callbacks.onGoBack();
        }
    }
    
    /**
     * 検索バーにフォーカス
     */
    private focusSearchBar(): void {
        if (this.hiddenInput) {
            this.hiddenInput.focus();
            this.searchFocused = true;
        }
    }
    
    /**
     * 検索バーからフォーカスを外す
     */
    private blurSearchBar(): void {
        if (this.hiddenInput) {
            this.hiddenInput.blur();
            this.searchFocused = false;
        }
    }
    
    /**
     * 検索バー領域の判定
     */
    private isInSearchBarArea(x: number, y: number): boolean {
        // 検索バー領域の判定（実際のレイアウトに応じて調整）
        return x >= 100 && x <= 820 && y >= 60 && y <= 100;
    }
    
    /**
     * フィードバックダイアログ表示
     */
    private showFeedbackDialog(data?: FeedbackRequestData): void {
        if (this.callbacks.onFeedbackRequest) {
            const feedbackData: FeedbackRequestData = data || {
                topic: null,
                content: null,
                category: 'general'
            };
            this.callbacks.onFeedbackRequest(feedbackData);
        }
    }
    
    /**
     * 効果測定レポート表示
     */
    private showEffectivenessReport(): void {
        if (this.callbacks.onEffectivenessReport) {
            this.callbacks.onEffectivenessReport({
                timestamp: Date.now(),
                source: 'keyboard_shortcut'
            });
        }
    }
    
    /**
     * コールバック設定
     */
    public setCallbacks(callbacks: Partial<HelpEventCallbacks>): void {
        Object.assign(this.callbacks, callbacks);
    }
    
    /**
     * イベントリスナーのクリーンアップ
     */
    public cleanup(): void {
        console.log('HelpEventManager: cleanup() called');
        
        // イベントリスナーを削除
        if (this.boundKeyHandler) {
            document.removeEventListener('keydown', this.boundKeyHandler);
        }
        if (this.boundClickHandler) {
            document.removeEventListener('click', this.boundClickHandler);
        }
        if (this.boundContextMenuHandler) {
            document.removeEventListener('contextmenu', this.boundContextMenuHandler);
        }
        if (this.boundWheelHandler) {
            document.removeEventListener('wheel', this.boundWheelHandler);
        }
        if (this.boundMouseMoveHandler) {
            document.removeEventListener('mousemove', this.boundMouseMoveHandler);
        }
        if (this.boundMouseUpHandler) {
            document.removeEventListener('mouseup', this.boundMouseUpHandler);
        }
        if (this.boundResizeHandler) {
            window.removeEventListener('resize', this.boundResizeHandler);
        }
        
        // 隠し入力フィールドの削除
        if (this.hiddenInput) {
            if (this.boundInputHandler) {
                this.hiddenInput.removeEventListener('input', this.boundInputHandler);
            }
            if (this.hiddenInput.parentNode) {
                this.hiddenInput.parentNode.removeChild(this.hiddenInput);
            }
            this.hiddenInput = null;
        }
        
        // タイマーのクリア
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = null;
        }
        
        // 状態リセット
        this.searchFocused = false;
        this.currentSearchQuery = '';
        this.isComposing = false;
        
        console.log('HelpEventManager: cleanup completed');
    }
    
    /**
     * 現在の状態取得
     */
    public getState(): EventState {
        return {
            searchFocused: this.searchFocused,
            lastInputTime: this.lastInputTime,
            hasActiveListeners: this.boundKeyHandler !== null
        };
    }
    
    /**
     * 検索クエリ取得
     */
    public getCurrentSearchQuery(): string {
        return this.currentSearchQuery;
    }
    
    /**
     * 検索クエリ設定
     */
    public setSearchQuery(query: string): void {
        this.currentSearchQuery = query;
        if (this.hiddenInput) {
            this.hiddenInput.value = query;
        }
    }
}