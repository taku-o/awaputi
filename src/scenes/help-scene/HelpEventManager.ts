/**
 * Help Event Manager
 * ヘルプイベント管理 - キーボード・マウス入力の統合処理
 */

import { GameEngine } from '../../core/GameEngine';
import { HelpContentManager } from './HelpContentManager';
import { HelpAccessibilityManager } from './HelpAccessibilityManager';
import { HelpAnimationManager } from './HelpAnimationManager';
import { HelpRenderer } from './HelpRenderer';

// コールバックインターフェース
interface HelpEventCallbacks {
    onGoBack: (() => void) | null;
    onFeedbackRequest: ((data: FeedbackRequestData) => void) | null;
    onEffectivenessReport: ((report as any) => void) | null;
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
            '/': (event: KeyboardEvent) => { event.preventDefault(); this.focusSearchBar(); },
            'F': (event: KeyboardEvent) => { if (event.ctrlKey) { event.preventDefault(); this.showFeedbackDialog(); } },
            'E': (event: KeyboardEvent) => { if (event.ctrlKey && event.shiftKey) { event.preventDefault(); this.showEffectivenessReport(); } }
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
            // コンポジション終了時に検索を実行
            this.handleIMEInput({ target: this.hiddenInput } as Event);
        });
        
        // フォーカス・ブラーイベント
        this.hiddenInput.addEventListener('focus', () => {
            console.log('HelpEventManager: input focused');
            this.searchFocused = true;
            // フォーカス時のスタイル
            if (this.hiddenInput) {
                this.hiddenInput.style.borderColor = '#4A90E2';
                this.hiddenInput.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.3)';
            }
        });
        this.hiddenInput.addEventListener('blur', () => {
            console.log('HelpEventManager: input blurred');
            this.searchFocused = false;
            // ブラー時のスタイル
            if (this.hiddenInput) {
                this.hiddenInput.style.borderColor = '#ccc';
                this.hiddenInput.style.boxShadow = 'none';
            }
        });
        
        // 常時表示（非検索時も表示してレイアウトを保持）
        this.hiddenInput.style.display = 'block';
        
        console.log('HelpEventManager: appending hidden input to document.body');
        document.body.appendChild(this.hiddenInput);
        console.log('HelpEventManager: hidden input element created and added to DOM');
    }
    
    /**
     * 入力フィールドの位置を更新
     */
    private updateInputPosition(): void {
        if (!this.hiddenInput || !this.gameEngine.canvas) {
            return;
        }
        
        const canvas = this.gameEngine.canvas;
        const canvasRect = canvas.getBoundingClientRect();
        
        // HelpRendererから動的なレイアウト情報を取得
        let searchBarLayout;
        if (this.gameEngine.helpRenderer) {
            const layout = this.gameEngine.helpRenderer.getLayout();
            
            // 検索バーをサイドバーの左端からコンテンツの右端まで伸ばす
            const startX = layout.sidebar.x;
            const endX = layout.content.x + layout.content.width;
            
            searchBarLayout = {
                x: startX,
                y: 60, // タイトルの下
                width: endX - startX,
                height: 40
            };
        } else {
            // フォールバック: 固定値
            searchBarLayout = { x: 50, y: 60, width: 720, height: 40 };
        }
        
        // Canvas内の座標をページ座標に変換
        const left = canvasRect.left + searchBarLayout.x;
        const top = canvasRect.top + searchBarLayout.y;
        
        this.hiddenInput.style.left = `${left}px`;
        this.hiddenInput.style.top = `${top}px`;
        this.hiddenInput.style.width = `${searchBarLayout.width}px`;
        this.hiddenInput.style.height = `${searchBarLayout.height}px`;
        
        // デバッグ用ログ（必要時のみコメントアウト）
        // console.log('HelpEventManager: Input position updated', { left, top, width: searchBarLayout.width, height: searchBarLayout.height });
    }
    
    /**
     * IME入力の処理
     */
    private handleIMEInput(event: Event): void {
        if (!this.searchFocused) {
            return;
        }
        
        try {
            const target = event.target as HTMLInputElement;
            const newQuery = target.value;
            this.currentSearchQuery = newQuery;
            
            // IME確定時のみ検索実行（デバウンス付き）
            if (!this.isComposing) {
                this.debounceSearch(newQuery);
            }
            
            // 状態更新通知
            if (this.contentManager) {
                this.contentManager.setSearchQuery(newQuery);
            }
            
        } catch (error) {
            console.error('Error handling IME input:', error);
        }
    }

    /**
     * イベントリスナーの削除
     */
    public removeEventListeners(): void {
        console.log('HelpEventManager: removeEventListeners() called');
        
        if (this.boundKeyHandler) {
            document.removeEventListener('keydown', this.boundKeyHandler);
            this.boundKeyHandler = null;
        }
        
        if (this.boundClickHandler) {
            document.removeEventListener('click', this.boundClickHandler);
            this.boundClickHandler = null;
        }
        
        if (this.boundContextMenuHandler) {
            document.removeEventListener('contextmenu', this.boundContextMenuHandler);
            this.boundContextMenuHandler = null;
        }
        
        if (this.boundResizeHandler) {
            window.removeEventListener('resize', this.boundResizeHandler);
            this.boundResizeHandler = null;
        }
        
        if (this.boundWheelHandler) {
            document.removeEventListener('wheel', this.boundWheelHandler);
            this.boundWheelHandler = null;
        }
        
        if (this.boundMouseMoveHandler) {
            document.removeEventListener('mousemove', this.boundMouseMoveHandler);
            this.boundMouseMoveHandler = null;
        }
        
        if (this.boundMouseUpHandler) {
            document.removeEventListener('mouseup', this.boundMouseUpHandler);
            this.boundMouseUpHandler = null;
        }
        
        // 隠し入力フィールドのクリーンアップ
        if (this.hiddenInput) {
            console.log('HelpEventManager: cleaning up hidden input');
            
            if (this.boundInputHandler) {
                this.hiddenInput.removeEventListener('input', this.boundInputHandler);
                this.boundInputHandler = null;
            }
            
            if (this.hiddenInput.parentNode) {
                this.hiddenInput.parentNode.removeChild(this.hiddenInput);
            }
            this.hiddenInput = null;
        }
    }

    /**
     * キーボード入力処理
     */
    private handleKeyPress(event: KeyboardEvent): void {
        // 入力スロットリング
        const now = Date.now();
        if (now - this.lastInputTime < this.inputThrottleMs) {
            return;
        }
        this.lastInputTime = now;

        // 検索バーがフォーカスされている場合の特別処理
        if (this.searchFocused) {
            // 矢印キーは検索バー内のカーソル移動に使用（デフォルト動作を許可）
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
                return;
            }
            
            // Enterキーで検索実行
            if (event.key === 'Enter') {
                event.preventDefault();
                this.executeSearch();
                return;
            }
            
            // Escapeキーで検索終了
            if (event.key === 'Escape') {
                event.preventDefault();
                this.goBack();
                return;
            }
            
            // その他のキーはブラウザのデフォルト動作に任せる
            // （Backspace、Delete、文字入力など）
            return;
        }

        // アクセシビリティキーの優先処理
        if (this.accessibilityManager.handleAccessibilityKeys(event)) {
            return;
        }

        // `/` キーで検索フォーカス（特別処理）
        if (event.key === '/' && !this.searchFocused) {
            event.preventDefault();
            this.focusSearchBar();
            return;
        }

        // 通常のキー処理
        const handler = this.keyboardHandlers[event.key];
        if (handler) {
            try {
                handler(event);
                
                // ナビゲーション変更のアナウンス
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(event.key)) {
                    this.announceNavigationChange(event.key);
                }
                
            } catch (error) {
                console.error('Error handling key press:', error);
            }
        }
    }

    /**
     * 検索のデバウンス処理
     */
    private debounceSearch(query: string): void {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        this.searchTimeout = window.setTimeout(() => {
            this.handleSearchInput(query);
        }, 300); // 300ms のデバウンス
    }

    /**
     * 検索実行
     */
    private executeSearch(): void {
        if (this.hiddenInput && this.hiddenInput.value.trim()) {
            console.log('HelpEventManager: executing search for:', this.hiddenInput.value);
            // 検索結果にフォーカスを移動
            this.searchFocused = false;
            this.hiddenInput.blur();
        }
    }

    /**
     * ナビゲーション変更のアナウンス
     */
    private announceNavigationChange(key: string): void {
        const state = this.contentManager.getState();
        this.accessibilityManager.announceNavigationChange(
            key, 
            state.categories, 
            state.selectedCategory, 
            state.selectedTopicIndex, 
            state.isSearching, 
            state.searchResults
        );
    }

    /**
     * ナビゲーション処理
     */
    private async navigateUp(): Promise<void> {
        this.contentManager.navigateUp();
        
        // フォーカス遷移アニメーション
        if (this.animationManager) {
            this.animationManager.startFocusTransition(
                this.accessibilityManager.getCurrentFocusIndex(),
                this.accessibilityManager.getCurrentFocusIndex()
            );
        }
        
        // 選択項目にスクロール
        if (this.gameEngine.helpRenderer) {
            const state = this.contentManager.getState();
            this.gameEngine.helpRenderer.scrollToSelectedItem(state);
        }
    }

    private async navigateDown(): Promise<void> {
        this.contentManager.navigateDown();
        
        // フォーカス遷移アニメーション
        if (this.animationManager) {
            this.animationManager.startFocusTransition(
                this.accessibilityManager.getCurrentFocusIndex(),
                this.accessibilityManager.getCurrentFocusIndex()
            );
        }
        
        // 選択項目にスクロール
        if (this.gameEngine.helpRenderer) {
            const state = this.contentManager.getState();
            this.gameEngine.helpRenderer.scrollToSelectedItem(state);
        }
    }

    private async navigateLeft(): Promise<void> {
        const state = this.contentManager.getState();
        const fromIndex = state.categories.findIndex(c => c.id === state.selectedCategory);
        
        await this.contentManager.navigateLeft();
        
        const newState = this.contentManager.getState();
        const toIndex = newState.categories.findIndex(c => c.id === newState.selectedCategory);
        
        // カテゴリ遷移アニメーション
        if (this.animationManager && fromIndex !== toIndex) {
            this.animationManager.startCategoryTransition(fromIndex, toIndex);
        }
        
        // 選択項目にスクロール
        if (this.gameEngine.helpRenderer) {
            this.gameEngine.helpRenderer.scrollToSelectedItem(newState);
        }
    }

    private async navigateRight(): Promise<void> {
        const state = this.contentManager.getState();
        const fromIndex = state.categories.findIndex(c => c.id === state.selectedCategory);
        
        await this.contentManager.navigateRight();
        
        const newState = this.contentManager.getState();
        const toIndex = newState.categories.findIndex(c => c.id === newState.selectedCategory);
        
        // カテゴリ遷移アニメーション
        if (this.animationManager && fromIndex !== toIndex) {
            this.animationManager.startCategoryTransition(fromIndex, toIndex);
        }
        
        // 選択項目にスクロール
        if (this.gameEngine.helpRenderer) {
            this.gameEngine.helpRenderer.scrollToSelectedItem(newState);
        }
    }

    /**
     * 選択処理
     */
    private async selectCurrentItem(): Promise<void> {
        const state = this.contentManager.getState();
        
        console.log('HelpEventManager: selectCurrentItem - isSearching:', state.isSearching, 'searchResults:', state.searchResults.length);
        
        if (state.isSearching && state.searchResults.length > 0) {
            // 検索結果から選択
            console.log('HelpEventManager: selecting search result at index:', state.selectedTopicIndex);
            const result = await this.contentManager.selectSearchResult(state.selectedTopicIndex);
            if (result) {
                console.log('HelpEventManager: search result selected successfully');
                if (this.animationManager) {
                    this.animationManager.startContentTransition(result.newContent, 'fade');
                }
                // 検索終了
                this.searchFocused = false;
                this.currentSearchQuery = '';
                if (this.hiddenInput) {
                    this.hiddenInput.value = '';
                }
            }
        } else {
            // 通常のトピック選択
            const result = await this.contentManager.selectTopic(state.selectedTopicIndex);
            if (result && this.animationManager) {
                this.animationManager.startContentTransition(result.newContent, 'slide');
            }
        }
    }

    /**
     * 戻る処理
     */
    private goBack(): void {
        const state = this.contentManager.getState();
        
        if (state.isSearching || this.searchFocused) {
            // 検索モードを終了
            this.searchFocused = false;
            this.currentSearchQuery = '';
            
            // 隠し入力フィールドをクリア
            if (this.hiddenInput) {
                this.hiddenInput.value = '';
                this.hiddenInput.blur();
                // フィールドは表示したまま（レイアウト保持のため）
            }
            
            this.contentManager.performSearch('');
            if (this.animationManager) {
                this.animationManager.startSearchTransition(false);
            }
        } else {
            // メインメニューに戻る
            if (this.callbacks.onGoBack) {
                this.callbacks.onGoBack();
            }
        }
    }

    /**
     * 検索バーフォーカス
     */
    private focusSearchBar(): void {
        console.log('HelpEventManager: focusSearchBar() called');
        this.searchFocused = true;
        this.accessibilityManager.setFocusIndex(0); // 検索バーのインデックス
        
        // 隠し入力フィールドにフォーカスを当ててIMEを有効化
        if (this.hiddenInput) {
            console.log('HelpEventManager: focusing hidden input');
            // 位置を更新
            this.updateInputPosition();
            // フォーカスを当てる（既に表示済み）
            this.hiddenInput.value = this.currentSearchQuery || '';
            this.hiddenInput.focus();
            // カーソルを最後に移動
            this.hiddenInput.setSelectionRange(this.hiddenInput.value.length, this.hiddenInput.value.length);
        } else {
            console.error('HelpEventManager: hiddenInput not available for focus');
        }
        
        if (this.callbacks.onSearchFocus) {
            this.callbacks.onSearchFocus();
        }
        
        // 検索遷移アニメーション
        if (this.animationManager) {
            this.animationManager.startSearchTransition(true);
        }
    }

    /**
     * タブナビゲーション処理
     */
    private handleTabNavigation(event: KeyboardEvent): void {
        this.accessibilityManager.handleTabNavigation(event);
        
        // フォーカス遷移アニメーション
        if (this.animationManager) {
            this.animationManager.startFocusTransition(
                this.accessibilityManager.getCurrentFocusIndex(),
                this.accessibilityManager.getCurrentFocusIndex()
            );
        }
    }

    /**
     * フィードバックダイアログ表示
     */
    private showFeedbackDialog(): void {
        if (this.callbacks.onFeedbackRequest) {
            const state = this.contentManager.getState();
            const currentTopic = this.contentManager.getCurrentTopic();
            
            this.callbacks.onFeedbackRequest({
                topic: currentTopic,
                content: state.currentContent,
                category: state.selectedCategory
            });
        }
    }

    /**
     * 効果測定レポート表示
     */
    private async showEffectivenessReport(): Promise<void> {
        if (this.callbacks.onEffectivenessReport) {
            try {
                const report = await this.contentManager.getEffectivenessReport();
                this.callbacks.onEffectivenessReport(report);
            } catch (error) {
                console.error('Failed to generate effectiveness report:', error);
            }
        }
    }

    /**
     * マウス入力処理
     */
    private handleClick(event: MouseEvent): void {
        const canvas = this.gameEngine.canvas;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // 入力フィールド外をクリックした場合
        if (this.searchFocused && event.target !== this.hiddenInput) {
            this.hiddenInput?.blur();
        }

        // スクロールバー処理（レンダラーが存在する場合）
        if (this.gameEngine.helpRenderer) {
            const renderer = this.gameEngine.helpRenderer;
            
            // スクロールバーハンドルのドラッグ開始
            if (renderer.isPointInScrollbarHandle(x, y)) {
                event.preventDefault();
                renderer.startScrollbarDrag(y);
                // ドラッグ中のカーソル変更
                if (this.gameEngine.canvas) {
                    this.gameEngine.canvas.style.cursor = 'grabbing';
                }
                return;
            }
            
            // スクロールバートラックのクリック（ページスクロール）
            if (renderer.isPointInScrollbarTrack(x, y)) {
                event.preventDefault();
                const sidebar = this.getLayout().sidebar;
                const trackY = sidebar.y + 10;
                const trackHeight = sidebar.height - 20;
                const scrollInfo = renderer.getScrollInfo();
                const handleHeight = Math.max(20, (scrollInfo.viewHeight / scrollInfo.contentHeight) * trackHeight);
                const currentHandleY = trackY + (scrollInfo.offset / scrollInfo.maxOffset) * (trackHeight - handleHeight);
                
                if (y < currentHandleY) {
                    // 上方向にページスクロール
                    renderer.scrollSidebar(-scrollInfo.viewHeight * 0.8);
                } else {
                    // 下方向にページスクロール
                    renderer.scrollSidebar(scrollInfo.viewHeight * 0.8);
                }
                return;
            }
        }

        // サイドバークリック処理
        if (this.isPointInSidebar(x, y)) {
            this.handleSidebarClick(x, y);
            return;
        }

        // コンテンツエリアクリック処理（検索結果選択など）
        if (this.isPointInContent(x, y)) {
            this.handleContentClick(x, y);
            return;
        }

        // 戻るボタンクリック処理
        if (this.isPointInBackButton(x, y)) {
            this.goBack();
            return;
        }
    }

    /**
     * マウスホイール処理
     */
    private handleWheel(event: WheelEvent): void {
        const canvas = this.gameEngine.canvas;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // サイドバー内でのホイールスクロール
        if (this.isPointInSidebar(x, y) && this.gameEngine.helpRenderer) {
            event.preventDefault();
            const deltaY = event.deltaY * 0.5; // スクロール感度を調整
            this.gameEngine.helpRenderer.scrollSidebar(deltaY);
        }
    }

    /**
     * マウス移動処理
     */
    private handleMouseMove(event: MouseEvent): void {
        const canvas = this.gameEngine.canvas;
        if (!canvas || !this.gameEngine.helpRenderer) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // スクロールバードラッグ中の処理
        if (this.gameEngine.helpRenderer.isScrollbarDragging()) {
            event.preventDefault();
            this.gameEngine.helpRenderer.updateScrollbarDrag(y);
            return;
        }

        // カーソルの変更
        const renderer = this.gameEngine.helpRenderer;
        let cursor = 'default';

        // スクロールバー上でのカーソル変更
        if (renderer.isPointInScrollbarHandle(x, y)) {
            cursor = 'grab';
        } else if (renderer.isPointInScrollbarTrack(x, y)) {
            cursor = 'pointer';
        } else if (this.isPointInSidebar(x, y)) {
            // サイドバー内のクリック可能エリア
            cursor = 'pointer';
        } else if (this.isPointInBackButton(x, y)) {
            // 戻るボタン
            cursor = 'pointer';
        }

        // Canvasのカーソルを変更
        canvas.style.cursor = cursor;
    }

    /**
     * マウスアップ処理
     */
    private handleMouseUp(event: MouseEvent): void {
        if (this.gameEngine.helpRenderer && this.gameEngine.helpRenderer.isScrollbarDragging()) {
            event.preventDefault();
            this.gameEngine.helpRenderer.endScrollbarDrag();
            
            // カーソルをリセット
            if (this.gameEngine.canvas) {
                this.gameEngine.canvas.style.cursor = 'default';
            }
        }
    }

    /**
     * サイドバークリック処理
     */
    private async handleSidebarClick(x: number, y: number): Promise<void> {
        const layout = this.getLayout();
        const sidebar = layout.sidebar;
        
        // スクロールオフセットを適用した相対Y座標を計算
        const relativeY = y - sidebar.y;
        const scrollOffset = this.gameEngine.helpRenderer ? this.gameEngine.helpRenderer.getScrollInfo().offset : 0;
        const adjustedY = relativeY + scrollOffset; // スクロール分を補正
        
        const itemHeight = 40;
        let currentY = 10; // 上部マージン

        const state = this.contentManager.getState();
        
        // カテゴリクリック判定
        for (let i = 0; i < state.categories.length; i++) {
            const category = state.categories[i];
            const isSelected = category.id === state.selectedCategory;
            
            // カテゴリ項目の判定
            if (adjustedY >= currentY && adjustedY < currentY + itemHeight) {
                const categoryId = category.id;
                const result = await this.contentManager.selectCategory(categoryId);
                
                if (result && this.animationManager) {
                    this.animationManager.startCategoryTransition(result.fromIndex, result.toIndex);
                }
                
                // 選択項目にスクロール
                if (this.gameEngine.helpRenderer) {
                    const newState = this.contentManager.getState();
                    this.gameEngine.helpRenderer.scrollToSelectedItem(newState);
                }
                return;
            }
            
            currentY += itemHeight;
            
            // 選択されたカテゴリのトピック判定
            if (isSelected && category.topics.length > 0) {
                for (let j = 0; j < category.topics.length; j++) {
                    const topicHeight = 30;
                    
                    if (adjustedY >= currentY && adjustedY < currentY + topicHeight - 5) {
                        const result = await this.contentManager.selectTopic(j);
                        
                        if (result && this.animationManager) {
                            this.animationManager.startContentTransition(result.newContent, 'slide');
                        }
                        
                        // 選択項目にスクロール
                        if (this.gameEngine.helpRenderer) {
                            const newState = this.contentManager.getState();
                            this.gameEngine.helpRenderer.scrollToSelectedItem(newState);
                        }
                        return;
                    }
                    currentY += topicHeight;
                }
            }
        }
    }

    /**
     * コンテンツエリアクリック処理
     */
    private async handleContentClick(x: number, y: number): Promise<void> {
        const layout = this.getLayout();
        const content = layout.content;
        const state = this.contentManager.getState();
        
        // 検索結果表示中の場合
        if (state.isSearching && state.searchResults.length > 0) {
            const relativeY = y - content.y;
            const itemHeight = 40; // 検索結果の各項目の高さ（HelpRendererと一致）
            const itemSpacing = 5; // 項目間のスペース
            let currentY = 80; // 上部マージン（検索バー分）
            
            // どの検索結果がクリックされたかを判定
            for (let i = 0; i < state.searchResults.length; i++) {
                if (relativeY >= currentY && relativeY < currentY + itemHeight) {
                    // 検索結果を選択
                    const result = await this.contentManager.selectSearchResult(i);
                    if (result && this.animationManager) {
                        this.animationManager.startContentTransition(result.newContent, 'fade');
                    }
                    return;
                }
                currentY += itemHeight + itemSpacing;
            }
        }
        // 通常のコンテンツ表示時は特に処理なし（スクロールなど）
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

        // コンテンツエリアでの右クリック - クイックフィードバック
        if (this.isPointInContent(x, y)) {
            this.showQuickFeedback(x, y);
        }
    }

    /**
     * クイックフィードバック表示
     */
    private showQuickFeedback(x: number, y: number): void {
        const state = this.contentManager.getState();
        if (!state.currentContent) return;

        const currentTopic = this.contentManager.getCurrentTopic();
        if (currentTopic && this.callbacks.onFeedbackRequest) {
            this.callbacks.onFeedbackRequest({
                topic: currentTopic,
                content: state.currentContent,
                category: state.selectedCategory,
                position: { x, y },
                quickMode: true
            });
        }
    }

    /**
     * 検索入力処理
     */
    private async handleSearchInput(query: string): Promise<void> {
        await this.contentManager.performSearch(query);
        
        // 検索遷移アニメーション
        if (this.animationManager) {
            const isEntering = query.trim().length > 0;
            this.animationManager.startSearchTransition(isEntering);
        }
    }

    /**
     * 座標判定ヘルパー
     */
    private isPointInSearchBar(x: number, y: number): boolean {
        const layout = this.getLayout();
        return this.isPointInRect(x, y, layout.searchBar);
    }

    private isPointInSidebar(x: number, y: number): boolean {
        const layout = this.getLayout();
        return this.isPointInRect(x, y, layout.sidebar);
    }

    private isPointInContent(x: number, y: number): boolean {
        const layout = this.getLayout();
        return this.isPointInRect(x, y, layout.content);
    }

    private isPointInBackButton(x: number, y: number): boolean {
        const layout = this.getLayout();
        return this.isPointInRect(x, y, layout.backButton);
    }

    private isPointInRect(x: number, y: number, rect: { x: number; y: number; width: number; height: number }): boolean {
        return x >= rect.x && x <= rect.x + rect.width &&
               y >= rect.y && y <= rect.y + rect.height;
    }

    private getLayout(): HelpLayout {
        // レンダラーからレイアウトを取得
        if (this.gameEngine.helpRenderer) {
            return this.gameEngine.helpRenderer.getLayout();
        }
        
        // フォールバック: 固定レイアウト
        return {
            searchBar: { x: 50, y: 60, width: 720, height: 40 },  // タイトルの下に配置
            sidebar: { x: 50, y: 110, width: 250, height: 370 },  // 検索バーの下に配置
            content: { x: 320, y: 110, width: 450, height: 370 },
            backButton: { x: 50, y: 500, width: 100, height: 40 }
        };
    }

    /**
     * コールバック設定
     */
    public setCallback<K extends keyof HelpEventCallbacks>(type: K, callback: HelpEventCallbacks[K]): void {
        this.callbacks[type] = callback;
    }

    /**
     * 状態取得
     */
    public getEventState(): EventState {
        return {
            searchFocused: this.searchFocused,
            lastInputTime: this.lastInputTime,
            hasActiveListeners: Boolean(this.boundKeyHandler)
        };
    }

    /**
     * クリーンアップ
     */
    public destroy(): void {
        this.removeEventListeners();
        
        // カーソルをリセット
        if (this.gameEngine.canvas) {
            this.gameEngine.canvas.style.cursor = 'default';
        }
        
        // コールバッククリア
        (Object.keys(this.callbacks) as Array<keyof HelpEventCallbacks>).forEach(key => {
            this.callbacks[key] = null;
        });
        
        console.log('HelpEventManager destroyed');
    }
}

/**
 * Help Input Validator
 * ヘルプ入力検証器 - 入力値の検証とサニタイズ
 */
export class HelpInputValidator {
    private maxSearchLength: number = 100;
    private allowedSearchChars: RegExp = /^[a-zA-Z0-9\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF\u20000-\u2A6DF\u2A700-\u2B73F\u2B740-\u2B81F\u2B820-\u2CEAF\uF900-\uFAFF\u2F800-\u2FA1F\-_.,!?()[\]{}'"「」『』【】〔〕〈〉《》：；、。・]*$/;

    /**
     * 検索クエリの検証
     */
    public validateSearchQuery(query: string): { valid: boolean; error?: string; sanitized?: string } {
        if (typeof query !== 'string') {
            return { valid: false, error: 'Search query must be a string' };
        }

        if (query.length > this.maxSearchLength) {
            return { 
                valid: false, 
                error: `Search query too long (max ${this.maxSearchLength} characters)`,
                sanitized: query.substring(0, this.maxSearchLength)
            };
        }

        if (!this.allowedSearchChars.test(query)) {
            const sanitized = query.replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\-_.,!?()[\]{}'"「」『』【】〔〕〈〉《》：；、。・]/g, '');
            return {
                valid: false,
                error: 'Search query contains invalid characters',
                sanitized
            };
        }

        return { valid: true, sanitized: query.trim() };
    }

    /**
     * インデックス値の検証
     */
    public validateIndex(index: string | number, maxValue: number): { valid: boolean; error?: string; sanitized?: number } {
        const numIndex = parseInt(String(index), 10);
        
        if (isNaN(numIndex)) {
            return { valid: false, error: 'Index must be a number' };
        }

        if (numIndex < 0) {
            return { valid: false, error: 'Index cannot be negative', sanitized: 0 };
        }

        if (numIndex >= maxValue) {
            return { 
                valid: false, 
                error: 'Index out of range', 
                sanitized: Math.max(0, maxValue - 1) 
            };
        }

        return { valid: true, sanitized: numIndex };
    }

    /**
     * カテゴリIDの検証
     */
    public validateCategoryId(categoryId: string, validCategories: string[]): { valid: boolean; error?: string; sanitized?: string } {
        if (typeof categoryId !== 'string') {
            return { valid: false, error: 'Category ID must be a string' };
        }

        const trimmedId = categoryId.trim();
        
        if (trimmedId.length === 0) {
            return { valid: false, error: 'Category ID cannot be empty' };
        }

        if (!validCategories.includes(trimmedId)) {
            return { 
                valid: false, 
                error: 'Invalid category ID',
                sanitized: validCategories[0] || 'gameplay'
            };
        }

        return { valid: true, sanitized: trimmedId };
    }
}