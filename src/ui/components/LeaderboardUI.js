/**
 * LeaderboardUI.js
 * リーダーボードUI統合コンポーネント - リファクタリング版
 * 分離されたコンポーネントを統合してリーダーボード機能を提供
 */

import { getErrorHandler } from '../../utils/ErrorHandler.js';
import { LeaderboardRenderer } from './leaderboard/LeaderboardRenderer.js';
import { LeaderboardDataManager } from './leaderboard/LeaderboardDataManager.js';
import { LeaderboardAnimationController } from './leaderboard/LeaderboardAnimationController.js';
import { LeaderboardEventHandler } from './leaderboard/LeaderboardEventHandler.js';

export class LeaderboardUI {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.errorHandler = getErrorHandler();
        
        // コンポーネント初期化
        this.renderer = new LeaderboardRenderer(gameEngine);
        this.dataManager = new LeaderboardDataManager(gameEngine);
        this.animationController = new LeaderboardAnimationController(gameEngine);
        this.eventHandler = new LeaderboardEventHandler(gameEngine);
        
        // UI状態
        this.uiState = {
            currentView: 'overall',
            currentStage: null,
            currentPage: 0,
            sortBy: 'score',
            selectedEntry: null,
            hoveredEntry: null,
            hoveredButton: null,
            showDetails: false,
            cachedData: null,
            lastUpdateTime: 0,
            isLoading: false
        };
        
        // レイアウト設定
        this.layout = {
            headerHeight: 60,
            tabHeight: 40,
            entryHeight: 50,
            padding: 20,
            scrollOffset: 0,
            maxVisibleEntries: 8
        };
        
        // コンポーネント統合
        this.setupEventHandlers();
        this.setupDataWatchers();
        
        console.log('[LeaderboardUI] Initialized with modular architecture');
    }
    
    /**
     * 初期化
     */
    async initialize() {
        try {
            // 各コンポーネント初期化
            await this.dataManager.initialize();
            this.animationController.initialize();
            this.eventHandler.initialize();
            
            // 初期データ読み込み
            await this.refreshData();
            
            console.log('[LeaderboardUI] All components initialized');
        } catch (error) {
            this.errorHandler.handleError(error, 'LeaderboardUI.initialize');
        }
    }
    
    /**
     * イベントハンドラー設定
     */
    setupEventHandlers() {
        // ビュー変更
        this.eventHandler.addCallback('onViewChange', (data) => {
            this.changeView(data.view);
        });
        
        // ソート変更
        this.eventHandler.addCallback('onSortChange', (data) => {
            this.changeSortBy(data.sortBy);
        });
        
        // エントリー選択
        this.eventHandler.addCallback('onEntrySelect', (data) => {
            this.selectEntry(data.entry, data.index);
        });
        
        // 詳細表示切り替え
        this.eventHandler.addCallback('onDetailsToggle', (data) => {
            this.uiState.showDetails = data.show;
            if (data.entry) {
                this.uiState.selectedEntry = data.entry;
            }
        });
        
        // スクロール
        this.eventHandler.addCallback('onScroll', (data) => {
            if (data.scrollRatio !== undefined) {
                // スクロールバークリック
                this.setScrollRatio(data.scrollRatio);
            } else if (data.scrollTo) {
                // ショートカットスクロール
                this.scrollTo(data.scrollTo);
            } else {
                // 通常スクロール
                this.scroll(data.deltaY);
            }
        });
        
        // データ更新
        this.eventHandler.addCallback('onRefresh', () => {
            this.refreshData();
        });
        
        // ホバー処理
        this.eventHandler.addCallback('onHover', (data) => {
            this.handleHover(data.target);
        });
        
        this.eventHandler.addCallback('onHoverEnd', (data) => {
            this.handleHoverEnd(data.target);
        });
    }
    
    /**
     * データ監視設定
     */
    setupDataWatchers() {
        this.dataManager.addDataWatcher((viewType, data) => {
            if (viewType === this.uiState.currentView) {
                this.uiState.cachedData = data;
                this.uiState.lastUpdateTime = Date.now();
                this.updateScrollBounds();
            }
        });
    }
    
    /**
     * メインレンダリング
     */
    render(context, x, y, width, height) {
        try {
            // UI要素座標を更新（イベント処理用）
            this.updateUIElementBounds(x, y, width, height);
            
            // レンダリング実行
            this.renderer.render(context, x, y, width, height, this.uiState, this.layout);
            
        } catch (error) {
            this.errorHandler.handleError(error, 'LeaderboardUI.render');
            this.renderErrorState(context, x, y, width, height);
        }
    }
    
    /**
     * エラー状態のレンダリング
     */
    renderErrorState(context, x, y, width, height) {
        context.fillStyle = '#ff6b6b';
        context.font = '16px Arial';
        context.textAlign = 'center';
        context.fillText('リーダーボードの読み込みに失敗しました', x + width / 2, y + height / 2);
    }
    
    /**
     * UI要素の境界を更新
     */
    updateUIElementBounds(x, y, width, height) {
        const padding = this.layout.padding;
        const headerHeight = this.layout.headerHeight;
        const tabHeight = this.layout.tabHeight;
        
        // タブ境界
        const tabs = ['overall', 'daily', 'weekly', 'monthly', 'stage'];
        const tabWidth = (width - padding * 2) / tabs.length;
        const tabElements = tabs.map((tab, index) => ({
            view: tab,
            bounds: {
                x: x + padding + (index * tabWidth),
                y: y + headerHeight,
                width: tabWidth,
                height: tabHeight
            }
        }));
        
        // ソートオプション境界
        const sortOptions = ['score', 'timestamp', 'combo', 'accuracy'];
        const sortWidth = (width - padding * 2) / sortOptions.length;
        const sortY = y + headerHeight + tabHeight;
        const sortElements = sortOptions.map((sort, index) => ({
            sortBy: sort,
            bounds: {
                x: x + padding + (index * sortWidth),
                y: sortY,
                width: sortWidth,
                height: 35
            }
        }));
        
        // エントリー境界
        const entryStartY = sortY + 35 + 30; // ソート + リストヘッダー
        const data = this.uiState.cachedData;
        const entryElements = [];
        
        if (data && data.rankings) {
            const maxEntries = Math.floor((height - (entryStartY - y)) / this.layout.entryHeight);
            const startIndex = this.layout.scrollOffset;
            const endIndex = Math.min(startIndex + maxEntries, data.rankings.length);
            
            for (let i = startIndex; i < endIndex; i++) {
                entryElements.push({
                    data: data.rankings[i],
                    index: i,
                    bounds: {
                        x: x + 5,
                        y: entryStartY + ((i - startIndex) * this.layout.entryHeight),
                        width: width - 10,
                        height: this.layout.entryHeight
                    }
                });
            }
        }
        
        // イベントハンドラーに境界情報を更新
        this.eventHandler.updateUIElements({
            tabs: tabElements,
            sortOptions: sortElements,
            entries: entryElements,
            buttons: [], // 必要に応じて追加
            scrollbar: data && data.rankings && data.rankings.length > this.layout.maxVisibleEntries ? {
                bounds: {
                    x: x + width - 15,
                    y: y,
                    width: 15,
                    height: height
                }
            } : null
        });
    }
    
    /**
     * クリックイベント処理
     */
    handleClick(x, y, options = {}) {
        this.eventHandler.handleClick(x, y, options);
    }
    
    /**
     * ホバーイベント処理
     */
    handleHover(x, y, options = {}) {
        this.eventHandler.handleHover(x, y, options);
        
        // アニメーション連携
        const target = this.eventHandler.getTargetAt(x, y);
        if (target && target.type === 'entry') {
            this.animationController.startHover(target.data);
        }
    }
    
    /**
     * ホバー処理
     */
    handleHover(target) {
        if (target && target.type === 'entry') {
            this.uiState.hoveredEntry = target.data;
            this.animationController.startHover(target.data);
        }
    }
    
    /**
     * ホバー終了処理
     */
    handleHoverEnd(target) {
        this.uiState.hoveredEntry = null;
        if (target && target.data) {
            this.animationController.endHover(target.data);
        }
    }
    
    /**
     * スクロールイベント処理
     */
    handleScroll(deltaX, deltaY, options = {}) {
        this.animationController.scroll(deltaY, options);
        this.layout.scrollOffset = Math.max(0, Math.min(
            this.getMaxScrollOffset(),
            this.layout.scrollOffset + Math.round(deltaY / this.layout.entryHeight)
        ));
    }
    
    /**
     * キーボードイベント処理
     */
    handleKeyDown(keyCode, options = {}) {
        this.eventHandler.handleKeyDown(keyCode, options);
    }
    
    /**
     * タッチイベント処理
     */
    handleTouchStart(touches, options = {}) {
        this.eventHandler.handleTouchStart(touches, options);
    }
    
    handleTouchMove(touches, options = {}) {
        this.eventHandler.handleTouchMove(touches, options);
    }
    
    handleTouchEnd(touches, options = {}) {
        this.eventHandler.handleTouchEnd(touches, options);
    }
    
    /**
     * ビュー変更
     */
    async changeView(newView) {
        if (this.uiState.currentView !== newView) {
            this.uiState.currentView = newView;
            this.layout.scrollOffset = 0;
            await this.refreshData();
        }
    }
    
    /**
     * ソート変更
     */
    async changeSortBy(newSortBy) {
        if (this.uiState.sortBy !== newSortBy) {
            this.uiState.sortBy = newSortBy;
            await this.refreshData();
        }
    }
    
    /**
     * エントリー選択
     */
    selectEntry(entry, index) {
        this.uiState.selectedEntry = entry;
        this.animationController.startSelectAnimation(entry);
    }
    
    /**
     * データ更新
     */
    async refreshData() {
        try {
            this.uiState.isLoading = true;
            
            const options = {
                sortBy: this.uiState.sortBy,
                stageId: this.uiState.currentStage
            };
            
            const data = await this.dataManager.refreshData(this.uiState.currentView, options);
            
            if (data && !data.error) {
                this.uiState.cachedData = data;
                this.uiState.lastUpdateTime = Date.now();
                this.updateScrollBounds();
            }
            
        } catch (error) {
            this.errorHandler.handleError(error, 'LeaderboardUI.refreshData');
        } finally {
            this.uiState.isLoading = false;
        }
    }
    
    /**
     * スクロール境界を更新
     */
    updateScrollBounds() {
        const data = this.uiState.cachedData;
        if (data && data.rankings) {
            const maxOffset = Math.max(0, data.rankings.length - this.layout.maxVisibleEntries);
            this.animationController.setScrollBounds(maxOffset * this.layout.entryHeight);
        }
    }
    
    /**
     * 最大スクロールオフセットを取得
     */
    getMaxScrollOffset() {
        const data = this.uiState.cachedData;
        if (!data || !data.rankings) return 0;
        return Math.max(0, data.rankings.length - this.layout.maxVisibleEntries);
    }
    
    /**
     * スクロール比率設定
     */
    setScrollRatio(ratio) {
        const maxOffset = this.getMaxScrollOffset();
        this.layout.scrollOffset = Math.round(ratio * maxOffset);
    }
    
    /**
     * 指定位置にスクロール
     */
    scrollTo(position) {
        switch (position) {
            case 'top':
                this.layout.scrollOffset = 0;
                break;
            case 'bottom':
                this.layout.scrollOffset = this.getMaxScrollOffset();
                break;
        }
    }
    
    /**
     * スクロール処理
     */
    scroll(deltaY) {
        const scrollAmount = Math.round(deltaY / this.layout.entryHeight);
        this.layout.scrollOffset = Math.max(0, Math.min(
            this.getMaxScrollOffset(),
            this.layout.scrollOffset + scrollAmount
        ));
    }
    
    /**
     * 統計情報を取得
     */
    getStatistics() {
        return {
            dataManager: this.dataManager.getStatistics(),
            animation: this.animationController.getPerformanceInfo(),
            eventHandler: this.eventHandler.getSelectionState()
        };
    }
    
    /**
     * 設定更新
     */
    updateConfig(newConfig) {
        if (newConfig.layout) {
            Object.assign(this.layout, newConfig.layout);
        }
        
        // 各コンポーネントに設定を伝播
        this.renderer.updateRenderConfig(newConfig);
        this.dataManager.updateConfig(newConfig);
        this.animationController.updateConfig(newConfig);
        this.eventHandler.updateConfig(newConfig);
    }
    
    /**
     * リソースを破棄
     */
    dispose() {
        this.renderer.dispose();
        this.dataManager.dispose();
        this.animationController.dispose();
        this.eventHandler.dispose();
        
        console.log('[LeaderboardUI] All components disposed');
    }
}

// ChallengeDetailModal と ChallengeUI クラスも必要に応じて分離可能ですが、
// ファイルサイズの制約内で基本的なリーダーボード機能を維持しています。
// これらの追加機能は、必要に応じて別ファイルに分離することを推奨します。