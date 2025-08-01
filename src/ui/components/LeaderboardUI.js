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