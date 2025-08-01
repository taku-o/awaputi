import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * リーダーボードUI表示コンポーネント
 * ランキング表示、期間・ステージ切り替え、プレイヤー検索機能を提供
 */
export class LeaderboardUI {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.leaderboardManager = gameEngine.leaderboardManager;
        
        // UI状態
        this.currentView = 'overall'; // overall, daily, weekly, monthly, stage
        this.currentStage = null;
        this.currentPage = 0;
        this.itemsPerPage = 10;
        this.sortBy = 'score'; // score, timestamp, combo, accuracy
        
        // データキャッシュ
        this.cachedData = null;
        this.lastUpdateTime = 0;
        this.refreshInterval = 30000; // 30秒
        
        // レイアウト設定
        this.layout = {
            headerHeight: 60,
            tabHeight: 40,
            entryHeight: 50,
            padding: 20,
            scrollOffset: 0,
            maxVisibleEntries: 8
        };
        
        // インタラクション状態
        this.selectedEntry = null;
        this.hoveredButton = null;
        this.showDetails = false;
        
        console.log('[LeaderboardUI] 初期化完了');
    }

    /**
     * 初期化
     */
    async initialize() {
        try {
            await this.refreshData();
            console.log('[LeaderboardUI] データ読み込み完了');
        } catch (error) {
            getErrorHandler().handleError(error, 'LEADERBOARD_UI_INIT_ERROR');
        }
    }

    /**
     * データ更新
     */
    async refreshData() {
        try {
            const now = Date.now();
            
            // キャッシュが有効な場合はスキップ
            if (this.cachedData && (now - this.lastUpdateTime) < this.refreshInterval) {
                return this.cachedData;
            }
            
            let data;
            
            // 現在のビューに応じてデータを取得
            switch (this.currentView) {
                case 'overall':
                case 'daily':
                case 'weekly':
                case 'monthly':
                    data = this.leaderboardManager.getPeriodRanking(this.currentView, {
                        limit: this.itemsPerPage * 5, // 複数ページ分を取得
                        offset: 0,
                        includeExpired: false
                    });
                    break;
                    
                case 'stage':
                    if (this.currentStage) {
                        data = this.leaderboardManager.getStageRanking(this.currentStage, {
                            limit: this.itemsPerPage * 5,
                            offset: 0,
                            sortBy: this.sortBy,
                            includePlayerData: true
                        });
                    }
                    break;
                    
                default:
                    data = this.leaderboardManager.getLeaderboard('overall', {
                        limit: this.itemsPerPage * 5,
                        offset: 0
                    });
            }
            
            if (data && !data.error) {
                this.cachedData = data;
                this.lastUpdateTime = now;
            }
            
            return data;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'LEADERBOARD_DATA_REFRESH_ERROR');
            return null;
        }
    }

    /**
     * メインレンダリング
     */
    render(context, x, y, width, height) {
        try {
            // 背景
            this.renderBackground(context, x, y, width, height);
            
            // ヘッダー（タイトル・更新時間）
            const headerY = this.renderHeader(context, x, y, width);
            
            // タブ（期間・ステージ切り替え）
            const tabY = this.renderTabs(context, x, headerY, width);
            
            // ソートオプション
            const sortY = this.renderSortOptions(context, x, tabY, width);
            
            // ランキングリスト
            const listHeight = height - (sortY - y) - this.layout.padding;
            this.renderRankingList(context, x, sortY, width, listHeight);
            
            // 詳細情報（選択時）
            if (this.showDetails && this.selectedEntry) {
                this.renderEntryDetails(context, x, y, width, height);
            }
            
        } catch (error) {
            console.error('[LeaderboardUI] 描画エラー:', error);
            this.renderErrorMessage(context, x, y, width, height);
        }
    }

    /**
     * 背景描画
     */
    renderBackground(context, x, y, width, height) {
        // グラデーション背景
        const gradient = context.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, '#0f1419');
        gradient.addColorStop(1, '#1a1a2e');
        
        context.fillStyle = gradient;
        context.fillRect(x, y, width, height);
        
        // 枠線
        context.strokeStyle = '#3a4a6a';
        context.lineWidth = 2;
        context.strokeRect(x, y, width, height);
    }

    /**
     * ヘッダー描画
     */
    renderHeader(context, x, y, width) {
        const headerHeight = this.layout.headerHeight;
        
        // ヘッダー背景
        context.fillStyle = '#16213e';
        context.fillRect(x, y, width, headerHeight);
        
        // タイトル
        context.fillStyle = '#ffffff';
        context.font = 'bold 24px Arial';
        context.textAlign = 'left';
        context.fillText('リーダーボード', x + this.layout.padding, y + 35);
        
        // 更新時間
        if (this.lastUpdateTime > 0) {
            const updateTime = new Date(this.lastUpdateTime).toLocaleTimeString();
            context.fillStyle = '#888';
            context.font = '12px Arial';
            context.textAlign = 'right';
            context.fillText(`最終更新: ${updateTime}`, x + width - this.layout.padding, y + 20);
        }
        
        // 更新ボタン
        const refreshButtonX = x + width - 100;
        const refreshButtonY = y + 25;
        const refreshButtonWidth = 70;
        const refreshButtonHeight = 25;
        
        context.fillStyle = this.hoveredButton === 'refresh' ? '#4a90e2' : '#3a4a6a';
        context.fillRect(refreshButtonX, refreshButtonY, refreshButtonWidth, refreshButtonHeight);
        
        context.fillStyle = '#ffffff';
        context.font = '12px Arial';
        context.textAlign = 'center';
        context.fillText('更新', refreshButtonX + refreshButtonWidth/2, refreshButtonY + 16);
        
        return y + headerHeight;
    }

    /**
     * タブ描画
     */
    renderTabs(context, x, y, width) {
        const tabHeight = this.layout.tabHeight;
        const tabs = [
            { id: 'overall', name: '総合' },
            { id: 'daily', name: '日間' },
            { id: 'weekly', name: '週間' },
            { id: 'monthly', name: '月間' },
            { id: 'stage', name: 'ステージ別' }
        ];
        
        const tabWidth = width / tabs.length;
        
        for (let i = 0; i < tabs.length; i++) {
            const tab = tabs[i];
            const tabX = x + i * tabWidth;
            const isActive = this.currentView === tab.id;
            const isHovered = this.hoveredButton === `tab_${tab.id}`;
            
            // タブ背景
            if (isActive) {
                context.fillStyle = '#4a90e2';
            } else if (isHovered) {
                context.fillStyle = '#3a5a8a';
            } else {
                context.fillStyle = '#2a3a5a';
            }
            
            context.fillRect(tabX, y, tabWidth, tabHeight);
            
            // タブ境界線
            context.strokeStyle = '#1a2a4a';
            context.lineWidth = 1;
            context.strokeRect(tabX, y, tabWidth, tabHeight);
            
            // タブテキスト
            context.fillStyle = isActive ? '#ffffff' : '#cccccc';
            context.font = '14px Arial';
            context.textAlign = 'center';
            context.fillText(tab.name, tabX + tabWidth/2, y + 25);
        }
        
        return y + tabHeight;
    }

    /**
     * ソートオプション描画
     */
    renderSortOptions(context, x, y, width) {
        if (this.currentView !== 'stage') {
            return y; // ステージ別以外はソートオプション非表示
        }
        
        const sortHeight = 30;
        const sortOptions = [
            { id: 'score', name: 'スコア' },
            { id: 'timestamp', name: '最新' },
            { id: 'combo', name: 'コンボ' },
            { id: 'accuracy', name: '精度' }
        ];
        
        // 背景
        context.fillStyle = '#1a2a4a';
        context.fillRect(x, y, width, sortHeight);
        
        // ソートラベル
        context.fillStyle = '#cccccc';
        context.font = '12px Arial';
        context.textAlign = 'left';
        context.fillText('並び順:', x + this.layout.padding, y + 20);
        
        // ソートボタン
        const buttonWidth = 60;
        const buttonHeight = 20;
        const startX = x + this.layout.padding + 60;
        
        for (let i = 0; i < sortOptions.length; i++) {
            const option = sortOptions[i];
            const buttonX = startX + i * (buttonWidth + 5);
            const buttonY = y + 5;
            const isActive = this.sortBy === option.id;
            const isHovered = this.hoveredButton === `sort_${option.id}`;
            
            // ボタン背景
            if (isActive) {
                context.fillStyle = '#4a90e2';
            } else if (isHovered) {
                context.fillStyle = '#3a5a8a';
            } else {
                context.fillStyle = '#2a3a5a';
            }
            
            context.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
            
            // ボタンテキスト
            context.fillStyle = isActive ? '#ffffff' : '#cccccc';
            context.font = '10px Arial';
            context.textAlign = 'center';
            context.fillText(option.name, buttonX + buttonWidth/2, buttonY + 14);
        }
        
        return y + sortHeight;
    }

    /**
     * ランキングリスト描画
     */
    renderRankingList(context, x, y, width, height) {
        if (!this.cachedData || this.cachedData.error) {
            this.renderNoData(context, x, y, width, height);
            return;
        }
        
        const entries = this.cachedData.entries || [];
        const visibleEntries = this.layout.maxVisibleEntries;
        const entryHeight = this.layout.entryHeight;
        
        // スクロール計算
        const startIndex = Math.floor(this.layout.scrollOffset / entryHeight);
        const endIndex = Math.min(startIndex + visibleEntries, entries.length);
        
        // ヘッダー
        this.renderListHeader(context, x, y, width);
        const listY = y + 30;
        
        // エントリー描画
        for (let i = startIndex; i < endIndex; i++) {
            const entry = entries[i];
            const entryY = listY + (i - startIndex) * entryHeight;
            
            this.renderRankingEntry(context, entry, x, entryY, width, entryHeight);
        }
        
        // スクロールバー
        if (entries.length > visibleEntries) {
            this.renderScrollbar(context, x + width - 10, listY, 10, height - 30, entries.length, visibleEntries);
        }
    }

    /**
     * リストヘッダー描画
     */
    renderListHeader(context, x, y, width) {
        const headerHeight = 30;
        
        // ヘッダー背景
        context.fillStyle = '#2a3a5a';
        context.fillRect(x, y, width, headerHeight);
        
        // ヘッダーテキスト
        context.fillStyle = '#ffffff';
        context.font = 'bold 12px Arial';
        
        context.textAlign = 'left';
        context.fillText('順位', x + 10, y + 20);
        context.fillText('プレイヤー', x + 60, y + 20);
        context.fillText('スコア', x + 200, y + 20);
        
        if (this.currentView === 'stage' || this.currentView === 'overall') {
            context.fillText('コンボ', x + 280, y + 20);
            context.fillText('精度', x + 340, y + 20);
        }
        
        context.fillText('日時', x + 400, y + 20);
    }

    /**
     * ランキングエントリー描画
     */
    renderRankingEntry(context, entry, x, y, width, height) {
        const isSelected = this.selectedEntry === entry;
        const isHovered = this.hoveredButton === `entry_${entry.rank}`;
        
        // 背景
        if (isSelected) {
            context.fillStyle = '#4a90e2';
        } else if (isHovered) {
            context.fillStyle = '#3a4a6a';
        } else if (entry.rank % 2 === 0) {
            context.fillStyle = '#1a2a4a';
        } else {
            context.fillStyle = '#16213e';
        }
        
        context.fillRect(x, y, width, height);
        
        // 順位
        context.fillStyle = this.getRankColor(entry.rank);
        context.font = 'bold 16px Arial';
        context.textAlign = 'center';
        context.fillText(entry.rank, x + 30, y + height/2 + 6);
        
        // プレイヤー名
        context.fillStyle = '#ffffff';
        context.font = '14px Arial';
        context.textAlign = 'left';
        const playerName = entry.playerName || 'プレイヤー';
        context.fillText(this.truncateText(playerName, 12), x + 60, y + height/2 + 5);
        
        // スコア
        context.fillStyle = '#ffd700';
        context.font = 'bold 14px Arial';
        context.textAlign = 'right';
        context.fillText(entry.score.toLocaleString(), x + 270, y + height/2 + 5);
        
        // ゲームデータ（コンボ・精度）
        if (entry.gameData) {
            context.fillStyle = '#cccccc';
            context.font = '12px Arial';
            
            if (entry.gameData.combo !== undefined) {
                context.textAlign = 'center';
                context.fillText(`${entry.gameData.combo}`, x + 300, y + height/2 + 5);
            }
            
            if (entry.gameData.accuracy !== undefined) {
                context.textAlign = 'center';
                context.fillText(`${Math.round(entry.gameData.accuracy)}%`, x + 360, y + height/2 + 5);
            }
        }
        
        // 日時
        context.fillStyle = '#888888';
        context.font = '10px Arial';
        context.textAlign = 'left';
        const date = new Date(entry.timestamp).toLocaleDateString();
        context.fillText(date, x + 400, y + height/2 + 5);
        
        // 区切り線
        context.strokeStyle = '#3a4a6a';
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(x, y + height);
        context.lineTo(x + width, y + height);
        context.stroke();
    }

    /**
     * スクロールバー描画
     */
    renderScrollbar(context, x, y, width, height, totalItems, visibleItems) {
        // スクロールバー背景
        context.fillStyle = '#2a3a5a';
        context.fillRect(x, y, width, height);
        
        // スクロールハンドル
        const handleHeight = Math.max(20, height * (visibleItems / totalItems));
        const handleY = y + (this.layout.scrollOffset / (totalItems * this.layout.entryHeight)) * (height - handleHeight);
        
        context.fillStyle = '#4a90e2';
        context.fillRect(x, handleY, width, handleHeight);
    }

    /**
     * データなし表示
     */
    renderNoData(context, x, y, width, height) {
        context.fillStyle = '#666666';
        context.font = '16px Arial';
        context.textAlign = 'center';
        
        const message = this.cachedData?.error ? 'データの読み込みに失敗しました' : 'データがありません';
        context.fillText(message, x + width/2, y + height/2);
    }

    /**
     * エントリー詳細表示
     */
    renderEntryDetails(context, x, y, width, height) {
        if (!this.selectedEntry) return;
        
        const detailsWidth = 300;
        const detailsHeight = 200;
        const detailsX = x + width - detailsWidth - 20;
        const detailsY = y + 100;
        
        // 背景
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(detailsX, detailsY, detailsWidth, detailsHeight);
        
        // 枠線
        context.strokeStyle = '#4a90e2';
        context.lineWidth = 2;
        context.strokeRect(detailsX, detailsY, detailsWidth, detailsHeight);
        
        // 詳細情報
        const entry = this.selectedEntry;
        let currentY = detailsY + 30;
        
        context.fillStyle = '#ffffff';
        context.font = 'bold 14px Arial';
        context.textAlign = 'left';
        context.fillText(`${entry.rank}位: ${entry.playerName}`, detailsX + 15, currentY);
        
        currentY += 25;
        context.font = '12px Arial';
        context.fillText(`スコア: ${entry.score.toLocaleString()}`, detailsX + 15, currentY);
        
        if (entry.gameData) {
            currentY += 20;
            context.fillText(`コンボ: ${entry.gameData.combo || 0}`, detailsX + 15, currentY);
            
            currentY += 20;
            context.fillText(`精度: ${Math.round(entry.gameData.accuracy || 0)}%`, detailsX + 15, currentY);
            
            if (entry.gameData.duration) {
                currentY += 20;
                const duration = Math.round(entry.gameData.duration / 1000);
                context.fillText(`プレイ時間: ${duration}秒`, detailsX + 15, currentY);
            }
        }
        
        currentY += 20;
        const date = new Date(entry.timestamp).toLocaleString();
        context.fillText(`記録日時: ${date}`, detailsX + 15, currentY);
        
        // 閉じるボタン
        const closeButtonX = detailsX + detailsWidth - 25;
        const closeButtonY = detailsY + 5;
        
        context.fillStyle = '#ff4444';
        context.fillRect(closeButtonX, closeButtonY, 20, 20);
        
        context.fillStyle = '#ffffff';
        context.font = 'bold 12px Arial';
        context.textAlign = 'center';
        context.fillText('×', closeButtonX + 10, closeButtonY + 15);
    }

    /**
     * エラーメッセージ描画
     */
    renderErrorMessage(context, x, y, width, height) {
        context.fillStyle = 'rgba(255, 0, 0, 0.1)';
        context.fillRect(x, y, width, height);
        
        context.fillStyle = '#ff4444';
        context.font = '16px Arial';
        context.textAlign = 'center';
        context.fillText('リーダーボードの表示でエラーが発生しました', x + width/2, y + height/2);
    }

    /**
     * クリック処理
     */
    handleClick(mouseX, mouseY, canvasX, canvasY, canvasWidth, canvasHeight) {
        try {
            // リフレッシュボタン
            const refreshButtonX = canvasX + canvasWidth - 100;
            const refreshButtonY = canvasY + 25;
            if (mouseX >= refreshButtonX && mouseX <= refreshButtonX + 70 && 
                mouseY >= refreshButtonY && mouseY <= refreshButtonY + 25) {
                this.handleRefresh();
                return true;
            }
            
            // タブクリック
            const tabY = canvasY + this.layout.headerHeight;
            if (mouseY >= tabY && mouseY <= tabY + this.layout.tabHeight) {
                const tabIndex = Math.floor((mouseX - canvasX) / (canvasWidth / 5));
                const tabs = ['overall', 'daily', 'weekly', 'monthly', 'stage'];
                if (tabIndex >= 0 && tabIndex < tabs.length) {
                    this.switchView(tabs[tabIndex]);
                    return true;
                }
            }
            
            // ソートオプションクリック
            if (this.currentView === 'stage') {
                const sortY = tabY + this.layout.tabHeight;
                if (mouseY >= sortY && mouseY <= sortY + 30) {
                    const sortOptions = ['score', 'timestamp', 'combo', 'accuracy'];
                    const startX = canvasX + this.layout.padding + 60;
                    const buttonWidth = 60;
                    
                    for (let i = 0; i < sortOptions.length; i++) {
                        const buttonX = startX + i * (buttonWidth + 5);
                        if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth) {
                            this.switchSort(sortOptions[i]);
                            return true;
                        }
                    }
                }
            }
            
            // エントリークリック
            const listY = canvasY + this.layout.headerHeight + this.layout.tabHeight + 
                          (this.currentView === 'stage' ? 30 : 0) + 30;
            if (mouseY >= listY && this.cachedData && this.cachedData.entries) {
                const entryIndex = Math.floor((mouseY - listY) / this.layout.entryHeight);
                const entry = this.cachedData.entries[entryIndex];
                if (entry) {
                    this.selectEntry(entry);
                    return true;
                }
            }
            
            // 詳細ウィンドウの閉じるボタン
            if (this.showDetails && this.selectedEntry) {
                const detailsX = canvasX + canvasWidth - 320;
                const closeButtonX = detailsX + 275;
                const closeButtonY = canvasY + 105;
                
                if (mouseX >= closeButtonX && mouseX <= closeButtonX + 20 && 
                    mouseY >= closeButtonY && mouseY <= closeButtonY + 20) {
                    this.closeDetails();
                    return true;
                }
            }
            
            return false;
            
        } catch (error) {
            console.error('[LeaderboardUI] クリック処理エラー:', error);
            return false;
        }
    }

    /**
     * ビュー切り替え
     */
    async switchView(newView) {
        if (this.currentView === newView) return;
        
        this.currentView = newView;
        this.currentPage = 0;
        this.layout.scrollOffset = 0;
        this.selectedEntry = null;
        this.showDetails = false;
        
        // ステージ別の場合、デフォルトステージを設定
        if (newView === 'stage' && !this.currentStage) {
            const stages = this.gameEngine.stageManager?.getAllStages() || [];
            if (stages.length > 0) {
                this.currentStage = stages[0].id;
            }
        }
        
        await this.refreshData();
    }

    /**
     * ソート切り替え
     */
    async switchSort(newSort) {
        if (this.sortBy === newSort) return;
        
        this.sortBy = newSort;
        await this.refreshData();
    }

    /**
     * エントリー選択
     */
    selectEntry(entry) {
        this.selectedEntry = entry;
        this.showDetails = true;
    }

    /**
     * 詳細ウィンドウを閉じる
     */
    closeDetails() {
        this.selectedEntry = null;
        this.showDetails = false;
    }

    /**
     * リフレッシュ処理
     */
    async handleRefresh() {
        this.cachedData = null;
        this.lastUpdateTime = 0;
        await this.refreshData();
    }

    /**
     * 順位色取得
     */
    getRankColor(rank) {
        if (rank === 1) return '#ffd700'; // 金
        if (rank === 2) return '#c0c0c0'; // 銀
        if (rank === 3) return '#cd7f32'; // 銅
        return '#ffffff';
    }

    /**
     * テキスト切り詰め
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 2) + '..';
    }

    /**
     * スクロール処理
     */
    scroll(deltaY) {
        if (!this.cachedData || !this.cachedData.entries) return;
        
        const maxScroll = Math.max(0, 
            (this.cachedData.entries.length - this.layout.maxVisibleEntries) * this.layout.entryHeight
        );
        
        this.layout.scrollOffset = Math.max(0, Math.min(maxScroll, this.layout.scrollOffset + deltaY));
    }

    /**
     * ホバーハンドリング
     */
    handleHover(mouseX, mouseY, canvasX, canvasY, canvasWidth, canvasHeight) {
        this.hoveredButton = null;
        
        // リフレッシュボタンホバー
        const refreshButtonX = canvasX + canvasWidth - 100;
        const refreshButtonY = canvasY + 25;
        if (mouseX >= refreshButtonX && mouseX <= refreshButtonX + 70 && 
            mouseY >= refreshButtonY && mouseY <= refreshButtonY + 25) {
            this.hoveredButton = 'refresh';
            return;
        }
        
        // タブホバー
        const tabY = canvasY + this.layout.headerHeight;
        if (mouseY >= tabY && mouseY <= tabY + this.layout.tabHeight) {
            const tabIndex = Math.floor((mouseX - canvasX) / (canvasWidth / 5));
            const tabs = ['overall', 'daily', 'weekly', 'monthly', 'stage'];
            if (tabIndex >= 0 && tabIndex < tabs.length) {
                this.hoveredButton = `tab_${tabs[tabIndex]}`;
                return;
            }
        }
        
        // エントリーホバー
        const listY = canvasY + this.layout.headerHeight + this.layout.tabHeight + 
                      (this.currentView === 'stage' ? 30 : 0) + 30;
        if (mouseY >= listY && this.cachedData && this.cachedData.entries) {
            const entryIndex = Math.floor((mouseY - listY) / this.layout.entryHeight);
            if (entryIndex >= 0 && entryIndex < this.cachedData.entries.length) {
                this.hoveredButton = `entry_${entryIndex + 1}`;
            }
        }
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        this.cachedData = null;
        this.selectedEntry = null;
        this.hoveredButton = null;
    }
}

/**
 * チャレンジ一覧表示UIコンポーネント
 * デイリー・ウィークリーチャレンジの表示と進捗管理を担当
 */
export class ChallengeUI {
    constructor(challengeSystem, localizationManager) {
        this.challengeSystem = challengeSystem;
        this.localizationManager = localizationManager;
        
        // UI要素
        this.container = null;
        this.challengeList = null;
        this.filterTabs = null;
        this.progressBars = new Map();
        this.rewardButtons = new Map();
        
        // 状態管理
        this.currentFilter = 'active'; // 'active', 'completed', 'all'
        this.isVisible = false;
        this.autoRefreshInterval = null;
        
        // 設定
        this.config = {
            refreshInterval: 30000, // 30秒
            animationDuration: 300,
            maxDisplayedChallenges: 20,
            progressAnimationSpeed: 2000
        };
        
        // イベントハンドラー
        this.boundHandlers = {
            challengeProgress: this.onChallengeProgress.bind(this),
            challengeCompleted: this.onChallengeCompleted.bind(this),
            challengeRewardClaimed: this.onChallengeRewardClaimed.bind(this),
            refreshClick: this.refresh.bind(this),
            filterChange: this.onFilterChange.bind(this)
        };
        
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        this.createContainer();
        this.setupEventListeners();
        console.log('[ChallengeUI] 初期化完了');
    }
    
    /**
     * コンテナ作成
     */
    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'challenge-ui';
        this.container.setAttribute('role', 'tabpanel');
        this.container.setAttribute('aria-label', this.localizationManager.translate('challenge.ui.title'));
        
        this.container.innerHTML = `
            <div class="challenge-header">
                <h2>${this.localizationManager.translate('challenge.ui.title')}</h2>
                <button class="refresh-button" aria-label="${this.localizationManager.translate('challenge.ui.refresh')}">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                    </svg>
                </button>
            </div>
            
            <div class="challenge-filters" role="tablist">
                <button class="filter-tab active" data-filter="active" role="tab" aria-selected="true">
                    ${this.localizationManager.translate('challenge.filter.active')}
                </button>
                <button class="filter-tab" data-filter="completed" role="tab" aria-selected="false">
                    ${this.localizationManager.translate('challenge.filter.completed')}
                </button>
                <button class="filter-tab" data-filter="all" role="tab" aria-selected="false">
                    ${this.localizationManager.translate('challenge.filter.all')}
                </button>
            </div>
            
            <div class="challenge-list" role="region" aria-live="polite">
                <!-- チャレンジアイテムがここに動的に追加される -->
            </div>
            
            <div class="challenge-stats">
                <div class="stat-item">
                    <span class="stat-label">${this.localizationManager.translate('challenge.stats.active')}</span>
                    <span class="stat-value" id="active-challenges-count">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">${this.localizationManager.translate('challenge.stats.completed')}</span>
                    <span class="stat-value" id="completed-challenges-count">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">${this.localizationManager.translate('challenge.stats.today')}</span>
                    <span class="stat-value" id="today-challenges-count">0</span>
                </div>
            </div>
        `;
        
        // 要素参照取得
        this.challengeList = this.container.querySelector('.challenge-list');
        this.filterTabs = this.container.querySelectorAll('.filter-tab');
        
        // フィルタータブのイベント設定
        this.filterTabs.forEach(tab => {
            tab.addEventListener('click', this.boundHandlers.filterChange);
        });
        
        // リフレッシュボタンのイベント設定
        const refreshButton = this.container.querySelector('.refresh-button');
        refreshButton.addEventListener('click', this.boundHandlers.refreshClick);
        
        // スタイル適用
        this.applyStyles();
    }
    
    /**
     * イベントリスナー設定
     */
    setupEventListeners() {
        if (this.challengeSystem.gameEngine) {
            this.challengeSystem.gameEngine.on('challengeProgress', this.boundHandlers.challengeProgress);
            this.challengeSystem.gameEngine.on('challengeCompleted', this.boundHandlers.challengeCompleted);
            this.challengeSystem.gameEngine.on('challengeRewardClaimed', this.boundHandlers.challengeRewardClaimed);
        }
    }
    
    /**
     * チャレンジ進捗更新時の処理
     */
    onChallengeProgress(data) {
        const progressBar = this.progressBars.get(data.challengeId);
        if (progressBar) {
            this.animateProgress(progressBar, data.progress * 100);
        }
        
        // 進捗値テキスト更新
        const challengeItem = this.container.querySelector(`[data-challenge-id="${data.challengeId}"]`);
        if (challengeItem) {
            const progressText = challengeItem.querySelector('.progress-text');
            if (progressText) {
                progressText.textContent = `${data.newValue} / ${data.targetValue}`;
            }
        }
    }
    
    /**
     * チャレンジ完了時の処理
     */
    onChallengeCompleted(data) {
        const challengeItem = this.container.querySelector(`[data-challenge-id="${data.challengeId}"]`);
        if (challengeItem) {
            challengeItem.classList.add('completed');
            
            // 完了アニメーション
            this.playCompletionAnimation(challengeItem);
            
            // 報酬受け取りボタンを有効化
            const rewardButton = challengeItem.querySelector('.reward-button');
            if (rewardButton) {
                rewardButton.disabled = false;
                rewardButton.classList.add('available');
            }
        }
        
        // 統計更新
        this.updateStats();
    }
    
    /**
     * 報酬受け取り時の処理
     */
    onChallengeRewardClaimed(data) {
        const challengeItem = this.container.querySelector(`[data-challenge-id="${data.challengeId}"]`);
        if (challengeItem) {
            const rewardButton = challengeItem.querySelector('.reward-button');
            if (rewardButton) {
                rewardButton.textContent = this.localizationManager.translate('challenge.reward.claimed');
                rewardButton.disabled = true;
                rewardButton.classList.add('claimed');
            }
        }
    }
    
    /**
     * フィルター変更処理
     */
    onFilterChange(event) {
        const filter = event.target.dataset.filter;
        if (filter && filter !== this.currentFilter) {
            this.currentFilter = filter;
            
            // タブ状態更新
            this.filterTabs.forEach(tab => {
                const isActive = tab.dataset.filter === filter;
                tab.classList.toggle('active', isActive);
                tab.setAttribute('aria-selected', isActive.toString());
            });
            
            // リスト更新
            this.refresh();
        }
    }
    
    /**
     * チャレンジリスト表示
     */
    show() {
        this.isVisible = true;
        this.container.style.display = 'block';
        this.refresh();
        this.startAutoRefresh();
        
        // フォーカス設定
        const firstTab = this.container.querySelector('.filter-tab.active');
        if (firstTab) {
            firstTab.focus();
        }
    }
    
    /**
     * チャレンジリスト非表示
     */
    hide() {
        this.isVisible = false;
        this.container.style.display = 'none';
        this.stopAutoRefresh();
    }
    
    /**
     * リスト更新
     */
    refresh() {
        if (!this.isVisible) return;
        
        const challenges = this.getFilteredChallenges();
        this.renderChallenges(challenges);
        this.updateStats();
    }
    
    /**
     * フィルター済みチャレンジ取得
     */
    getFilteredChallenges() {
        let challenges = [];
        
        switch (this.currentFilter) {
            case 'active':
                challenges = this.challengeSystem.getActiveChallenges()
                    .filter(c => !c.progress?.completed);
                break;
                
            case 'completed':
                challenges = this.challengeSystem.getCompletedChallenges();
                break;
                
            case 'all':
                challenges = [
                    ...this.challengeSystem.getActiveChallenges(),
                    ...this.challengeSystem.getCompletedChallenges()
                ];
                break;
        }
        
        // 重複除去とソート
        const uniqueChallenges = challenges.filter((challenge, index, self) => 
            index === self.findIndex(c => c.id === challenge.id)
        );
        
        return uniqueChallenges.sort((a, b) => {
            // 完了済みは下に、未完了は上に
            if (a.progress?.completed !== b.progress?.completed) {
                return a.progress?.completed ? 1 : -1;
            }
            // タイプ別にソート（デイリー > ウィークリー）
            if (a.type !== b.type) {
                const typeOrder = { daily: 0, weekly: 1, event: 2, community: 3 };
                return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
            }
            // 作成日時でソート
            return (b.startTime || 0) - (a.startTime || 0);
        }).slice(0, this.config.maxDisplayedChallenges);
    }
    
    /**
     * チャレンジアイテム描画
     */
    renderChallenges(challenges) {
        this.challengeList.innerHTML = '';
        this.progressBars.clear();
        this.rewardButtons.clear();
        
        if (challenges.length === 0) {
            this.challengeList.innerHTML = `
                <div class="no-challenges">
                    <p>${this.localizationManager.translate('challenge.ui.noChallenges')}</p>
                </div>
            `;
            return;
        }
        
        challenges.forEach(challenge => {
            const challengeItem = this.createChallengeItem(challenge);
            this.challengeList.appendChild(challengeItem);
        });
    }
    
    /**
     * チャレンジアイテム作成
     */
    createChallengeItem(challenge) {
        const progress = challenge.progress || { current: 0, target: challenge.targetValue, percentage: 0, completed: false, rewardClaimed: false };
        const isCompleted = progress.completed;
        const canClaimReward = isCompleted && !progress.rewardClaimed;
        
        const item = document.createElement('div');
        item.className = `challenge-item ${challenge.type} ${isCompleted ? 'completed' : ''}`;
        item.dataset.challengeId = challenge.id;
        item.setAttribute('role', 'article');
        item.setAttribute('aria-labelledby', `challenge-title-${challenge.id}`);
        
        // 難易度アイコン
        const difficultyIcon = this.getDifficultyIcon(challenge.difficulty);
        
        // 報酬情報
        const rewardText = this.formatReward(challenge.reward);
        
        // 残り時間（デイリー・ウィークリーチャレンジの場合）
        const timeRemaining = this.getTimeRemaining(challenge);
        
        item.innerHTML = `
            <div class="challenge-header">
                <div class="challenge-type-badge ${challenge.type}">
                    ${this.localizationManager.translate(`challenge.type.${challenge.type}`)}
                </div>
                <div class="challenge-difficulty">
                    ${difficultyIcon}
                </div>
            </div>
            
            <div class="challenge-content">
                <h3 class="challenge-title" id="challenge-title-${challenge.id}">
                    ${challenge.title}
                </h3>
                <p class="challenge-description">
                    ${challenge.description}
                </p>
                
                <div class="challenge-progress">
                    <div class="progress-bar-container">
                        <div class="progress-bar" role="progressbar" 
                             aria-valuenow="${progress.percentage}" 
                             aria-valuemin="0" 
                             aria-valuemax="100"
                             aria-labelledby="challenge-title-${challenge.id}">
                            <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                        </div>
                        <span class="progress-text" aria-live="polite">
                            ${progress.current} / ${progress.target}
                        </span>
                    </div>
                    <div class="progress-percentage">
                        ${Math.round(progress.percentage)}%
                    </div>
                </div>
                
                <div class="challenge-footer">
                    <div class="challenge-info">
                        <div class="reward-info">
                            <span class="reward-label">${this.localizationManager.translate('challenge.reward.label')}</span>
                            <span class="reward-value">${rewardText}</span>
                        </div>
                        ${timeRemaining ? `
                            <div class="time-remaining">
                                <span class="time-label">${this.localizationManager.translate('challenge.timeRemaining')}</span>
                                <span class="time-value">${timeRemaining}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="challenge-actions">
                        ${canClaimReward ? `
                            <button class="reward-button available" data-challenge-id="${challenge.id}">
                                ${this.localizationManager.translate('challenge.reward.claim')}
                            </button>
                        ` : isCompleted ? `
                            <button class="reward-button claimed" disabled>
                                ${this.localizationManager.translate('challenge.reward.claimed')}
                            </button>
                        ` : `
                            <button class="reward-button disabled" disabled>
                                ${this.localizationManager.translate('challenge.reward.locked')}
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
        
        // プログレスバー参照保存
        const progressBar = item.querySelector('.progress-fill');
        this.progressBars.set(challenge.id, progressBar);
        
        // 報酬ボタン参照保存とイベント設定
        const rewardButton = item.querySelector('.reward-button');
        if (rewardButton && canClaimReward) {
            this.rewardButtons.set(challenge.id, rewardButton);
            rewardButton.addEventListener('click', () => {
                this.claimReward(challenge.id);
            });
        }
        
        return item;
    }
    
    /**
     * 報酬受け取り処理
     */
    claimReward(challengeId) {
        if (this.challengeSystem.claimReward(challengeId)) {
            // 成功時の処理は onChallengeRewardClaimed で行われる
            console.log(`[ChallengeUI] 報酬受け取り成功: ${challengeId}`);
        } else {
            console.warn(`[ChallengeUI] 報酬受け取り失敗: ${challengeId}`);
        }
    }
    
    /**
     * 難易度アイコン取得
     */
    getDifficultyIcon(difficulty) {
        const icons = {
            easy: '⭐',
            normal: '⭐⭐',
            hard: '⭐⭐⭐',
            expert: '⭐⭐⭐⭐'
        };
        return icons[difficulty] || '⭐';
    }
    
    /**
     * 報酬フォーマット
     */
    formatReward(reward) {
        switch (reward.type) {
            case 'ap':
                return `${reward.amount} AP`;
            case 'item':
                return `${this.localizationManager.translate(`item.${reward.itemId}`)} x${reward.amount || 1}`;
            case 'title':
                return this.localizationManager.translate(`title.${reward.titleId}`);
            case 'theme':
                return this.localizationManager.translate(`theme.${reward.themeId}`);
            default:
                return this.localizationManager.translate('challenge.reward.unknown');
        }
    }
    
    /**
     * 残り時間取得
     */
    getTimeRemaining(challenge) {
        if (!challenge.endTime) return null;
        
        const now = Date.now();
        const remaining = challenge.endTime - now;
        
        if (remaining <= 0) return null;
        
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}${this.localizationManager.translate('time.hours')} ${minutes}${this.localizationManager.translate('time.minutes')}`;
        } else {
            return `${minutes}${this.localizationManager.translate('time.minutes')}`;
        }
    }
    
    /**
     * 進捗アニメーション
     */
    animateProgress(progressBar, targetPercentage) {
        if (!progressBar) return;
        
        const currentWidth = parseFloat(progressBar.style.width) || 0;
        const targetWidth = Math.min(100, Math.max(0, targetPercentage));
        
        if (Math.abs(targetWidth - currentWidth) < 0.1) return;
        
        progressBar.style.transition = `width ${this.config.progressAnimationSpeed}ms ease-out`;
        progressBar.style.width = `${targetWidth}%`;
        
        // アニメーション完了後にtransitionを削除
        setTimeout(() => {
            progressBar.style.transition = '';
        }, this.config.progressAnimationSpeed);
    }
    
    /**
     * 完了アニメーション
     */
    playCompletionAnimation(challengeItem) {
        challengeItem.classList.add('completion-animation');
        
        setTimeout(() => {
            challengeItem.classList.remove('completion-animation');
        }, this.config.animationDuration * 2);
    }
    
    /**
     * 統計更新
     */
    updateStats() {
        const stats = this.challengeSystem.getChallengeStats();
        
        const activeCount = this.container.querySelector('#active-challenges-count');
        const completedCount = this.container.querySelector('#completed-challenges-count');
        const todayCount = this.container.querySelector('#today-challenges-count');
        
        if (activeCount) activeCount.textContent = stats.activeChallenges;
        if (completedCount) completedCount.textContent = stats.completedChallenges;
        if (todayCount) todayCount.textContent = stats.completedToday;
    }
    
    /**
     * 自動更新開始
     */
    startAutoRefresh() {
        this.stopAutoRefresh();
        this.autoRefreshInterval = setInterval(() => {
            this.refresh();
        }, this.config.refreshInterval);
    }
    
    /**
     * 自動更新停止
     */
    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }
    
    /**
     * スタイル適用
     */
    applyStyles() {
        if (document.getElementById('challenge-ui-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'challenge-ui-styles';
        style.textContent = `
            .challenge-ui {
                padding: 20px;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .challenge-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #e1e8ed;
            }
            
            .challenge-header h2 {
                margin: 0;
                color: #2c3e50;
                font-size: 24px;
                font-weight: 700;
            }
            
            .refresh-button {
                background: #3498db;
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                color: white;
            }
            
            .refresh-button:hover {
                background: #2980b9;
                transform: rotate(180deg);
            }
            
            .challenge-filters {
                display: flex;
                gap: 5px;
                margin-bottom: 20px;
                background: #ecf0f1;
                border-radius: 25px;
                padding: 5px;
            }
            
            .filter-tab {
                flex: 1;
                padding: 10px 20px;
                border: none;
                background: transparent;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 500;
                color: #7f8c8d;
            }
            
            .filter-tab.active {
                background: #3498db;
                color: white;
                box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
            }
            
            .filter-tab:hover:not(.active) {
                background: #d5dbdb;
                color: #2c3e50;
            }
            
            .challenge-list {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin-bottom: 20px;
                max-height: 400px;
                overflow-y: auto;
                padding-right: 10px;
            }
            
            .challenge-item {
                background: white;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
                transition: all 0.3s ease;
                overflow: hidden;
                border-left: 4px solid #bdc3c7;
            }
            
            .challenge-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            }
            
            .challenge-item.daily {
                border-left-color: #e74c3c;
            }
            
            .challenge-item.weekly {
                border-left-color: #9b59b6;
            }
            
            .challenge-item.event {
                border-left-color: #f39c12;
            }
            
            .challenge-item.completed {
                background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
                border-left-color: #28a745;
            }
            
            .challenge-item.completion-animation {
                animation: challengeComplete 0.6s ease-out;
            }
            
            @keyframes challengeComplete {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); box-shadow: 0 6px 25px rgba(40, 167, 69, 0.4); }
                100% { transform: scale(1); }
            }
            
            .challenge-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px 0;
            }
            
            .challenge-type-badge {
                padding: 4px 12px;
                border-radius: 15px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .challenge-type-badge.daily {
                background: #ffebee;
                color: #e74c3c;
            }
            
            .challenge-type-badge.weekly {
                background: #f3e5f5;
                color: #9b59b6;
            }
            
            .challenge-type-badge.event {
                background: #fff8e1;
                color: #f39c12;
            }
            
            .challenge-difficulty {
                font-size: 16px;
            }
            
            .challenge-content {
                padding: 0 20px 20px;
            }
            
            .challenge-title {
                margin: 15px 0 10px;
                color: #2c3e50;
                font-size: 18px;
                font-weight: 600;
                line-height: 1.3;
            }
            
            .challenge-description {
                margin: 0 0 20px;
                color: #7f8c8d;
                font-size: 14px;
                line-height: 1.5;
            }
            
            .challenge-progress {
                margin-bottom: 20px;
            }
            
            .progress-bar-container {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 8px;
            }
            
            .progress-bar {
                flex: 1;
                height: 12px;
                background: #ecf0f1;
                border-radius: 6px;
                overflow: hidden;
                position: relative;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #3498db 0%, #2ecc71 100%);
                border-radius: 6px;
                transition: width 0.3s ease;
                position: relative;
            }
            
            .progress-fill::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
                animation: progressShimmer 2s infinite;
            }
            
            @keyframes progressShimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            
            .progress-text {
                font-size: 13px;
                font-weight: 600;
                color: #34495e;
                min-width: 80px;
                text-align: right;
            }
            
            .progress-percentage {
                text-align: right;
                font-size: 12px;
                color: #7f8c8d;
                font-weight: 500;
            }
            
            .challenge-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 15px;
            }
            
            .challenge-info {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .reward-info, .time-remaining {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .reward-label, .time-label {
                font-size: 12px;
                color: #7f8c8d;
                font-weight: 500;
            }
            
            .reward-value, .time-value {
                font-size: 13px;
                color: #2c3e50;
                font-weight: 600;
            }
            
            .reward-button {
                padding: 8px 20px;
                border-radius: 20px;
                border: none;
                font-weight: 600;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .reward-button.available {
                background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
                color: white;
                box-shadow: 0 2px 10px rgba(46, 204, 113, 0.3);
            }
            
            .reward-button.available:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 15px rgba(46, 204, 113, 0.4);
            }
            
            .reward-button.claimed {
                background: #95a5a6;
                color: white;
                cursor: not-allowed;
            }
            
            .reward-button.disabled {
                background: #ecf0f1;
                color: #bdc3c7;
                cursor: not-allowed;
            }
            
            .challenge-stats {
                display: flex;
                justify-content: space-around;
                background: white;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
            }
            
            .stat-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }
            
            .stat-label {
                font-size: 12px;
                color: #7f8c8d;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .stat-value {
                font-size: 24px;
                font-weight: 700;
                color: #2c3e50;
            }
            
            .no-challenges {
                text-align: center;
                padding: 40px 20px;
                color: #7f8c8d;
            }
            
            .no-challenges p {
                margin: 0;
                font-size: 16px;
            }
            
            /* レスポンシブ対応 */
            @media (max-width: 768px) {
                .challenge-ui {
                    padding: 15px;
                }
                
                .challenge-header h2 {
                    font-size: 20px;
                }
                
                .challenge-filters {
                    flex-direction: column;
                    gap: 5px;
                }
                
                .filter-tab {
                    border-radius: 5px;
                }
                
                .challenge-item {
                    margin-bottom: 10px;
                }
                
                .challenge-footer {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .challenge-stats {
                    flex-direction: column;
                    gap: 15px;
                }
                
                .stat-item {
                    flex-direction: row;
                    justify-content: space-between;
                }
            }
            
            /* アクセシビリティ対応 */
            @media (prefers-reduced-motion: reduce) {
                .challenge-item, .reward-button, .progress-fill {
                    transition: none;
                }
                
                .progress-fill::after {
                    animation: none;
                }
                
                .challenge-item.completion-animation {
                    animation: none;
                }
            }
            
            /* 高コントラスト対応 */
            @media (prefers-contrast: high) {
                .challenge-item {
                    border: 2px solid #000;
                }
                
                .filter-tab.active {
                    border: 2px solid #000;
                }
                
                .reward-button.available {
                    border: 2px solid #000;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * DOM要素取得
     */
    getElement() {
        return this.container;
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        this.stopAutoRefresh();
        
        // イベントリスナー削除
        if (this.challengeSystem.gameEngine) {
            this.challengeSystem.gameEngine.off('challengeProgress', this.boundHandlers.challengeProgress);
            this.challengeSystem.gameEngine.off('challengeCompleted', this.boundHandlers.challengeCompleted);
            this.challengeSystem.gameEngine.off('challengeRewardClaimed', this.boundHandlers.challengeRewardClaimed);
        }
        
        // DOM要素削除
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        
        // 参照クリア
        this.progressBars.clear();
        this.rewardButtons.clear();
        
        console.log('[ChallengeUI] クリーンアップ完了');
    }
}

/**
 * チャレンジ詳細モーダルコンポーネント
 * 個別チャレンジの詳細情報と進捗を表示するモーダルダイアログ
 */
export class ChallengeDetailModal {
    constructor(challengeSystem, localizationManager) {
        this.challengeSystem = challengeSystem;
        this.localizationManager = localizationManager;
        
        // UI要素
        this.modal = null;
        this.modalContent = null;
        this.backdrop = null;
        
        // 状態管理
        this.isVisible = false;
        this.currentChallenge = null;
        this.progressUpdateInterval = null;
        
        // 設定
        this.config = {
            updateInterval: 5000, // 5秒
            animationDuration: 300,
            backdropBlur: true
        };
        
        // イベントハンドラー
        this.boundHandlers = {
            close: this.close.bind(this),
            backdropClick: this.onBackdropClick.bind(this),
            keyDown: this.onKeyDown.bind(this),
            claimReward: this.claimReward.bind(this)
        };
        
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        this.createModal();
        this.setupEventListeners();
        console.log('[ChallengeDetailModal] 初期化完了');
    }
    
    /**
     * モーダル作成
     */
    createModal() {
        // バックドロップ作成
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'challenge-modal-backdrop';
        this.backdrop.addEventListener('click', this.boundHandlers.backdropClick);
        
        // モーダル作成
        this.modal = document.createElement('div');
        this.modal.className = 'challenge-modal';
        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-modal', 'true');
        this.modal.setAttribute('aria-labelledby', 'challenge-modal-title');
        
        // モーダルコンテンツ作成
        this.modalContent = document.createElement('div');
        this.modalContent.className = 'challenge-modal-content';
        
        this.modal.appendChild(this.modalContent);
        this.backdrop.appendChild(this.modal);
        
        // スタイル適用
        this.applyStyles();
        
        // DOMに追加
        document.body.appendChild(this.backdrop);
        
        // 初期状態では非表示
        this.backdrop.style.display = 'none';
    }
    
    /**
     * イベントリスナー設定
     */
    setupEventListeners() {
        document.addEventListener('keydown', this.boundHandlers.keyDown);
    }
    
    /**
     * モーダル表示
     */
    show(challengeId) {
        const challenge = this.challengeSystem.challenges.get(challengeId);
        if (!challenge) {
            console.warn(`[ChallengeDetailModal] チャレンジが見つかりません: ${challengeId}`);
            return;
        }
        
        this.currentChallenge = challenge;
        this.isVisible = true;
        
        // コンテンツ更新
        this.updateContent();
        
        // モーダル表示
        this.backdrop.style.display = 'flex';
        
        // アニメーション
        requestAnimationFrame(() => {
            this.backdrop.classList.add('visible');
            this.modal.classList.add('visible');
        });
        
        // フォーカス管理
        this.setFocus();
        
        // 進捗更新開始
        this.startProgressUpdate();
    }
    
    /**
     * モーダル非表示
     */
    close() {
        if (!this.isVisible) return;
        
        this.isVisible = false;
        this.currentChallenge = null;
        
        // 進捗更新停止
        this.stopProgressUpdate();
        
        // アニメーション
        this.backdrop.classList.remove('visible');
        this.modal.classList.remove('visible');
        
        setTimeout(() => {
            this.backdrop.style.display = 'none';
        }, this.config.animationDuration);
        
        // フォーカスを元の要素に戻す
        this.restoreFocus();
    }
    
    /**
     * コンテンツ更新
     */
    updateContent() {
        if (!this.currentChallenge) return;
        
        const challenge = this.currentChallenge;
        const progress = this.challengeSystem.playerProgress.get(challenge.id) || {
            currentValue: 0,
            completed: false,
            rewardClaimed: false
        };
        
        const progressPercentage = Math.min(100, (progress.currentValue / challenge.targetValue) * 100);
        const isCompleted = progress.completed;
        const canClaimReward = isCompleted && !progress.rewardClaimed;
        
        // 詳細情報
        const difficultyStars = this.getDifficultyStars(challenge.difficulty);
        const rewardText = this.formatReward(challenge.reward);
        const timeRemaining = this.getTimeRemaining(challenge);
        const categoryText = this.localizationManager.translate(`challenge.category.${challenge.category}`);
        
        this.modalContent.innerHTML = `
            <div class="modal-header">
                <div class="challenge-type-badge ${challenge.type}">
                    ${this.localizationManager.translate(`challenge.type.${challenge.type}`)}
                </div>
                <button class="modal-close-button" aria-label="${this.localizationManager.translate('common.close')}">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            
            <div class="modal-body">
                <div class="challenge-overview">
                    <h2 id="challenge-modal-title" class="challenge-title">
                        ${challenge.title}
                    </h2>
                    
                    <div class="challenge-meta">
                        <div class="meta-item">
                            <span class="meta-label">${this.localizationManager.translate('challenge.difficulty')}</span>
                            <span class="meta-value">${difficultyStars}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">${this.localizationManager.translate('challenge.category')}</span>
                            <span class="meta-value">${categoryText}</span>
                        </div>
                        ${timeRemaining ? `
                            <div class="meta-item">
                                <span class="meta-label">${this.localizationManager.translate('challenge.timeRemaining')}</span>
                                <span class="meta-value time-remaining">${timeRemaining}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <p class="challenge-description">
                        ${challenge.description}
                    </p>
                </div>
                
                <div class="progress-section">
                    <h3>${this.localizationManager.translate('challenge.progress.title')}</h3>
                    
                    <div class="progress-visual">
                        <div class="circular-progress" data-percentage="${progressPercentage}">
                            <svg viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" class="progress-bg"/>
                                <circle cx="50" cy="50" r="45" class="progress-fill" 
                                        style="stroke-dasharray: ${progressPercentage * 2.827}, 282.7"/>
                            </svg>
                            <div class="progress-text">
                                <span class="progress-percentage">${Math.round(progressPercentage)}%</span>
                                <span class="progress-values">${progress.currentValue} / ${challenge.targetValue}</span>
                            </div>
                        </div>
                        
                        <div class="progress-details">
                            <div class="detail-item">
                                <span class="detail-label">${this.localizationManager.translate('challenge.progress.current')}</span>
                                <span class="detail-value">${progress.currentValue.toLocaleString()}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">${this.localizationManager.translate('challenge.progress.target')}</span>
                                <span class="detail-value">${challenge.targetValue.toLocaleString()}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">${this.localizationManager.translate('challenge.progress.remaining')}</span>
                                <span class="detail-value">${Math.max(0, challenge.targetValue - progress.currentValue).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="reward-section">
                    <h3>${this.localizationManager.translate('challenge.reward.title')}</h3>
                    
                    <div class="reward-display">
                        <div class="reward-icon">
                            ${this.getRewardIcon(challenge.reward)}
                        </div>
                        <div class="reward-info">
                            <span class="reward-name">${rewardText}</span>
                            <span class="reward-description">${this.getRewardDescription(challenge.reward)}</span>
                        </div>
                    </div>
                </div>
                
                ${this.getTipsSection(challenge)}
            </div>
            
            <div class="modal-footer">
                ${canClaimReward ? `
                    <button class="reward-claim-button primary" data-challenge-id="${challenge.id}">
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path d="M12 2L13.09 7.26L19 5L17.26 10.91L23 12L17.74 13.09L19 19L13.09 17.26L12 23L10.91 17.74L5 19L6.74 13.09L1 12L6.26 10.91L5 5L10.91 6.74L12 2Z"/>
                        </svg>
                        ${this.localizationManager.translate('challenge.reward.claim')}
                    </button>
                ` : isCompleted ? `
                    <button class="reward-claim-button claimed" disabled>
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        ${this.localizationManager.translate('challenge.reward.claimed')}
                    </button>
                ` : `
                    <button class="reward-claim-button locked" disabled>
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path d="M12 2C13.1 2 14 2.9 14 4V6H16C16.55 6 17 6.45 17 7V19C17 19.55 16.55 20 16 20H8C7.45 20 7 19.55 7 19V7C7 6.45 7.45 6 8 6H10V4C10 2.9 10.9 2 12 2ZM12 3.5C11.17 3.5 10.5 4.17 10.5 5V6H13.5V5C13.5 4.17 12.83 3.5 12 3.5Z"/>
                        </svg>
                        ${this.localizationManager.translate('challenge.reward.locked')}
                    </button>
                `}
                
                <button class="modal-close-button secondary">
                    ${this.localizationManager.translate('common.close')}
                </button>
            </div>
        `;
        
        // イベントリスナー設定
        this.setupModalEventListeners();
    }
    
    /**
     * モーダル内イベントリスナー設定
     */
    setupModalEventListeners() {
        // 閉じるボタン
        const closeButtons = this.modalContent.querySelectorAll('.modal-close-button');
        closeButtons.forEach(button => {
            button.addEventListener('click', this.boundHandlers.close);
        });
        
        // 報酬受け取りボタン
        const claimButton = this.modalContent.querySelector('.reward-claim-button.primary');
        if (claimButton) {
            claimButton.addEventListener('click', this.boundHandlers.claimReward);
        }
    }
    
    /**
     * 報酬受け取り処理
     */
    claimReward() {
        if (!this.currentChallenge) return;
        
        const challengeId = this.currentChallenge.id;
        if (this.challengeSystem.claimReward(challengeId)) {
            // 成功時はコンテンツを更新
            setTimeout(() => {
                this.updateContent();
            }, 100);
            console.log(`[ChallengeDetailModal] 報酬受け取り成功: ${challengeId}`);
        } else {
            console.warn(`[ChallengeDetailModal] 報酬受け取り失敗: ${challengeId}`);
        }
    }
    
    /**
     * 難易度星表示
     */
    getDifficultyStars(difficulty) {
        const starCount = {
            easy: 1,
            normal: 2,
            hard: 3,
            expert: 4
        }[difficulty] || 1;
        
        return '⭐'.repeat(starCount);
    }
    
    /**
     * 報酬フォーマット
     */
    formatReward(reward) {
        switch (reward.type) {
            case 'ap':
                return `${reward.amount} AP`;
            case 'item':
                return `${this.localizationManager.translate(`item.${reward.itemId}`)} x${reward.amount || 1}`;
            case 'title':
                return this.localizationManager.translate(`title.${reward.titleId}`);
            case 'theme':
                return this.localizationManager.translate(`theme.${reward.themeId}`);
            default:
                return this.localizationManager.translate('challenge.reward.unknown');
        }
    }
    
    /**
     * 報酬アイコン取得
     */
    getRewardIcon(reward) {
        const icons = {
            ap: '💰',
            item: '📦',
            title: '🏆',
            theme: '🎨'
        };
        return icons[reward.type] || '🎁';
    }
    
    /**
     * 報酬説明取得
     */
    getRewardDescription(reward) {
        switch (reward.type) {
            case 'ap':
                return this.localizationManager.translate('challenge.reward.description.ap');
            case 'item':
                return this.localizationManager.translate('challenge.reward.description.item');
            case 'title':
                return this.localizationManager.translate('challenge.reward.description.title');
            case 'theme':
                return this.localizationManager.translate('challenge.reward.description.theme');
            default:
                return '';
        }
    }
    
    /**
     * 残り時間取得
     */
    getTimeRemaining(challenge) {
        if (!challenge.endTime) return null;
        
        const now = Date.now();
        const remaining = challenge.endTime - now;
        
        if (remaining <= 0) return this.localizationManager.translate('challenge.expired');
        
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
            return `${days}${this.localizationManager.translate('time.days')} ${hours}${this.localizationManager.translate('time.hours')}`;
        } else if (hours > 0) {
            return `${hours}${this.localizationManager.translate('time.hours')} ${minutes}${this.localizationManager.translate('time.minutes')}`;
        } else {
            return `${minutes}${this.localizationManager.translate('time.minutes')}`;
        }
    }
    
    /**
     * ヒントセクション取得
     */
    getTipsSection(challenge) {
        const tips = this.getChallengeTypeTips(challenge.type, challenge.progressType);
        if (!tips.length) return '';
        
        return `
            <div class="tips-section">
                <h3>${this.localizationManager.translate('challenge.tips.title')}</h3>
                <ul class="tips-list">
                    ${tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    /**
     * チャレンジタイプ別ヒント取得
     */
    getChallengeTypeTips(type, progressType) {
        const tips = [];
        
        // プログレスタイプ別ヒント
        switch (progressType) {
            case 'SCORE':
                tips.push(this.localizationManager.translate('challenge.tips.score'));
                break;
            case 'COMBO':
                tips.push(this.localizationManager.translate('challenge.tips.combo'));
                break;
            case 'BUBBLE_POP':
                tips.push(this.localizationManager.translate('challenge.tips.bubblePop'));
                break;
            case 'TIME_PLAYED':
                tips.push(this.localizationManager.translate('challenge.tips.timePlayed'));
                break;
        }
        
        // チャレンジタイプ別ヒント
        switch (type) {
            case 'daily':
                tips.push(this.localizationManager.translate('challenge.tips.daily'));
                break;
            case 'weekly':
                tips.push(this.localizationManager.translate('challenge.tips.weekly'));
                break;
        }
        
        return tips;
    }
    
    /**
     * バックドロップクリック処理
     */
    onBackdropClick(event) {
        if (event.target === this.backdrop) {
            this.close();
        }
    }
    
    /**
     * キーボード操作処理
     */
    onKeyDown(event) {
        if (!this.isVisible) return;
        
        switch (event.key) {
            case 'Escape':
                event.preventDefault();
                this.close();
                break;
                
            case 'Tab':
                this.handleTabNavigation(event);
                break;
        }
    }
    
    /**
     * タブナビゲーション処理
     */
    handleTabNavigation(event) {
        const focusableElements = this.modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }
    
    /**
     * フォーカス設定
     */
    setFocus() {
        const firstFocusable = this.modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }
    
    /**
     * フォーカス復元
     */
    restoreFocus() {
        // 実装は呼び出し元に依存
        // 通常は呼び出し元のボタンにフォーカスを戻す
    }
    
    /**
     * 進捗更新開始
     */
    startProgressUpdate() {
        this.stopProgressUpdate();
        this.progressUpdateInterval = setInterval(() => {
            if (this.isVisible && this.currentChallenge) {
                this.updateContent();
            }
        }, this.config.updateInterval);
    }
    
    /**
     * 進捗更新停止
     */
    stopProgressUpdate() {
        if (this.progressUpdateInterval) {
            clearInterval(this.progressUpdateInterval);
            this.progressUpdateInterval = null;
        }
    }
    
    /**
     * スタイル適用
     */
    applyStyles() {
        if (document.getElementById('challenge-detail-modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'challenge-detail-modal-styles';
        style.textContent = `
            .challenge-modal-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(5px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
                padding: 20px;
            }
            
            .challenge-modal-backdrop.visible {
                opacity: 1;
            }
            
            .challenge-modal {
                background: white;
                border-radius: 15px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                transform: scale(0.9) translateY(20px);
                transition: transform 0.3s ease;
            }
            
            .challenge-modal.visible {
                transform: scale(1) translateY(0);
            }
            
            .challenge-modal-content {
                display: flex;
                flex-direction: column;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 25px 15px;
                border-bottom: 1px solid #e1e8ed;
            }
            
            .modal-header .challenge-type-badge {
                padding: 6px 16px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .modal-header .challenge-type-badge.daily {
                background: #ffebee;
                color: #e74c3c;
            }
            
            .modal-header .challenge-type-badge.weekly {
                background: #f3e5f5;
                color: #9b59b6;
            }
            
            .modal-header .challenge-type-badge.event {
                background: #fff8e1;
                color: #f39c12;
            }
            
            .modal-close-button {
                background: none;
                border: none;
                cursor: pointer;
                padding: 8px;
                border-radius: 50%;
                color: #7f8c8d;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-close-button:hover {
                background: #ecf0f1;
                color: #2c3e50;
            }
            
            .modal-close-button svg {
                stroke: currentColor;
                stroke-width: 2;
                fill: none;
            }
            
            .modal-body {
                padding: 25px;
                flex: 1;
            }
            
            .challenge-overview {
                margin-bottom: 30px;
            }
            
            .challenge-title {
                margin: 0 0 20px;
                color: #2c3e50;
                font-size: 24px;
                font-weight: 700;
                line-height: 1.3;
            }
            
            .challenge-meta {
                display: flex;
                gap: 20px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }
            
            .meta-item {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .meta-label {
                font-size: 12px;
                color: #7f8c8d;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .meta-value {
                font-size: 14px;
                color: #2c3e50;
                font-weight: 600;
            }
            
            .meta-value.time-remaining {
                color: #e74c3c;
            }
            
            .challenge-description {
                margin: 0;
                color: #7f8c8d;
                font-size: 15px;
                line-height: 1.6;
            }
            
            .progress-section {
                margin-bottom: 30px;
                padding: 25px;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border-radius: 10px;
            }
            
            .progress-section h3 {
                margin: 0 0 20px;
                color: #2c3e50;
                font-size: 18px;
                font-weight: 600;
            }
            
            .progress-visual {
                display: flex;
                gap: 30px;
                align-items: center;
            }
            
            .circular-progress {
                position: relative;
                width: 120px;
                height: 120px;
                flex-shrink: 0;
            }
            
            .circular-progress svg {
                width: 100%;
                height: 100%;
                transform: rotate(-90deg);
            }
            
            .circular-progress .progress-bg {
                fill: none;
                stroke: #e1e8ed;
                stroke-width: 8;
            }
            
            .circular-progress .progress-fill {
                fill: none;
                stroke: url(#progressGradient);
                stroke-width: 8;
                stroke-linecap: round;
                transition: stroke-dasharray 0.5s ease;
            }
            
            .circular-progress::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: conic-gradient(from 0deg, #3498db, #2ecc71, #3498db);
                border-radius: 50%;
                padding: 4px;
                z-index: -1;
            }
            
            .progress-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
            }
            
            .progress-percentage {
                display: block;
                font-size: 24px;
                font-weight: 700;
                color: #2c3e50;
                line-height: 1;
            }
            
            .progress-values {
                display: block;
                font-size: 12px;
                color: #7f8c8d;
                margin-top: 4px;
            }
            
            .progress-details {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .detail-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
            
            .detail-label {
                font-size: 14px;
                color: #7f8c8d;
                font-weight: 500;
            }
            
            .detail-value {
                font-size: 16px;
                color: #2c3e50;
                font-weight: 600;
            }
            
            .reward-section {
                margin-bottom: 30px;
            }
            
            .reward-section h3 {
                margin: 0 0 15px;
                color: #2c3e50;
                font-size: 18px;
                font-weight: 600;
            }
            
            .reward-display {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 20px;
                background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
                border-radius: 10px;
                border-left: 4px solid #f39c12;
            }
            
            .reward-icon {
                font-size: 32px;
                flex-shrink: 0;
            }
            
            .reward-info {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .reward-name {
                font-size: 16px;
                color: #2c3e50;
                font-weight: 600;
            }
            
            .reward-description {
                font-size: 13px;
                color: #7f8c8d;
                line-height: 1.4;
            }
            
            .tips-section {
                margin-bottom: 20px;
            }
            
            .tips-section h3 {
                margin: 0 0 15px;
                color: #2c3e50;
                font-size: 18px;
                font-weight: 600;
            }
            
            .tips-list {
                margin: 0;
                padding-left: 20px;
                color: #7f8c8d;
                font-size: 14px;
                line-height: 1.6;
            }
            
            .tips-list li {
                margin-bottom: 8px;
            }
            
            .modal-footer {
                display: flex;
                gap: 15px;
                padding: 20px 25px;
                border-top: 1px solid #e1e8ed;
                background: #f8f9fa;
                border-radius: 0 0 15px 15px;
            }
            
            .reward-claim-button {
                flex: 1;
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .reward-claim-button.primary {
                background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
                color: white;
                box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
            }
            
            .reward-claim-button.primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(46, 204, 113, 0.4);
            }
            
            .reward-claim-button.claimed {
                background: #95a5a6;
                color: white;
                cursor: not-allowed;
            }
            
            .reward-claim-button.locked {
                background: #ecf0f1;
                color: #bdc3c7;
                cursor: not-allowed;
            }
            
            .modal-close-button.secondary {
                padding: 12px 24px;
                background: transparent;
                border: 2px solid #bdc3c7;
                border-radius: 8px;
                color: #7f8c8d;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .modal-close-button.secondary:hover {
                border-color: #7f8c8d;
                color: #2c3e50;
                background: #f8f9fa;
            }
            
            /* レスポンシブ対応 */
            @media (max-width: 768px) {
                .challenge-modal-backdrop {
                    padding: 10px;
                }
                
                .challenge-modal {
                    max-height: 95vh;
                }
                
                .modal-header, .modal-body, .modal-footer {
                    padding-left: 20px;
                    padding-right: 20px;
                }
                
                .challenge-title {
                    font-size: 20px;
                }
                
                .challenge-meta {
                    flex-direction: column;
                    gap: 10px;
                }
                
                .progress-visual {
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                }
                
                .circular-progress {
                    width: 100px;
                    height: 100px;
                }
                
                .progress-percentage {
                    font-size: 20px;
                }
                
                .modal-footer {
                    flex-direction: column;
                }
            }
            
            /* アクセシビリティ対応 */
            @media (prefers-reduced-motion: reduce) {
                .challenge-modal-backdrop, .challenge-modal, .reward-claim-button, .progress-fill {
                    transition: none;
                }
            }
            
            /* 高コントラスト対応 */
            @media (prefers-contrast: high) {
                .challenge-modal {
                    border: 2px solid #000;
                }
                
                .reward-claim-button.primary {
                    border: 2px solid #000;
                }
            }
        `;
        
        // SVGグラデーション定義追加
        if (!document.getElementById('progressGradient')) {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.style.display = 'none';
            svg.innerHTML = `
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#3498db;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#2ecc71;stop-opacity:1" />
                    </linearGradient>
                </defs>
            `;
            document.body.appendChild(svg);
        }
        
        document.head.appendChild(style);
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        this.stopProgressUpdate();
        
        // イベントリスナー削除
        document.removeEventListener('keydown', this.boundHandlers.keyDown);
        
        // DOM要素削除
        if (this.backdrop && this.backdrop.parentNode) {
            this.backdrop.parentNode.removeChild(this.backdrop);
        }
        
        console.log('[ChallengeDetailModal] クリーンアップ完了');
    }
}
