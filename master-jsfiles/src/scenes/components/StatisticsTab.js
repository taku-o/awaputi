/**
 * 統計タブコンポーネント
 * UserInfoSceneの統計表示機能を分離したコンポーネント
 */
import { TabComponent } from './TabComponent.js';
import { StatisticsFilterUI } from './StatisticsFilterUI.js';
import { StatisticsRenderer } from './StatisticsRenderer.js';
import { StatisticsDashboardRenderer } from './StatisticsDashboardRenderer.js';

export class StatisticsTab extends TabComponent {
    constructor(gameEngine, eventBus, state) {
        super(gameEngine, eventBus, state);
        
        // 統計表示設定
        this.statisticsViewMode = 'dashboard'; // 'dashboard', 'charts', 'details'
        this.currentPeriodFilter = 'last7days';
        
        // 統計表示設定
        this.statisticsDisplaySettings = {
            showDashboard: true,
            showCharts: true,
            showDetailedStats: true,
            enableAnimations: true,
            compactMode: false
        };
        
        // 子コンポーネント
        this.filterUI = null;
        this.statisticsRenderer = null;
        this.dashboardRenderer = null;
        
        // 統計データ
        this.statisticsData = null;
        
        // レイアウト設定
        this.contentPadding = 20;
    }
    
    /**
     * コンポーネントの初期化
     */
    initialize() {
        super.initialize();
        
        try {
            // 子コンポーネントの初期化
            this.filterUI = new StatisticsFilterUI(this.gameEngine, this.eventBus, this.state);
            this.statisticsRenderer = new StatisticsRenderer(this.gameEngine, this.eventBus, this.state);
            this.dashboardRenderer = new StatisticsDashboardRenderer(this.gameEngine, this.eventBus, this.state);
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // 統計データの初期化
            this.loadStatisticsData();
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'StatisticsTab.initialize',
                details: 'StatisticsTab初期化に失敗しました'
            });
        }
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // フィルター変更イベント
        this.eventBus.on('statistics-filter-changed', (filterData) => {
            this.currentPeriodFilter = filterData.period;
            this.loadStatisticsData();
        });
        
        // 表示モード変更イベント
        this.eventBus.on('statistics-view-mode-changed', (mode) => {
            this.statisticsViewMode = mode;
        });
        
        // 統計データ更新イベント
        this.eventBus.on('statistics-data-updated', (data) => {
            this.statisticsData = data;
        });
    }
    
    /**
     * 統計データの読み込み
     */
    async loadStatisticsData() {
        try {
            const statisticsManager = this.gameEngine.statisticsManager;
            if (!statisticsManager) {
                this.statisticsData = null;
                return;
            }
            
            // 期間フィルターに基づいてデータを取得
            this.statisticsData = await statisticsManager.getDetailedStatistics(this.currentPeriodFilter);
            
            // データ更新イベントを発信
            this.eventBus.emit('statistics-data-updated', this.statisticsData);
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'StatisticsTab.loadStatisticsData',
                details: '統計データの読み込みに失敗しました'
            });
            this.statisticsData = null;
        }
    }
    
    /**
     * タブのレンダリング
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - 描画X座標
     * @param {number} y - 描画Y座標
     * @param {number} width - 描画幅
     * @param {number} height - 描画高さ
     */
    render(context, x, y, width, height) {
        try {
            this.renderStatistics(context, x, y, width, height);
        } catch (error) {
            this.renderErrorFallback(context, x, y, width, height, error);
            this.eventBus.emit('component-error', { 
                component: 'StatisticsTab', 
                error: error 
            });
        }
    }
    
    /**
     * 統計情報の描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - 描画X座標
     * @param {number} y - 描画Y座標
     * @param {number} width - 描画幅
     * @param {number} height - 描画高さ
     */
    renderStatistics(context, x, y, width, height) {
        const contentWidth = width - this.contentPadding * 2;
        let currentY = y;
        
        // 統計フィルターUIの描画
        if (this.filterUI) {
            const filterHeight = this.filterUI.render(context, x + this.contentPadding, currentY, contentWidth);
            currentY += filterHeight + 10;
        }
        
        // 利用可能な高さを計算
        const availableHeight = height - (currentY - y) - 20;
        
        if (!this.statisticsData) {
            this.renderNoDataMessage(context, x, currentY, width, availableHeight);
            return;
        }
        
        // 統計表示モードに応じて描画
        switch (this.statisticsViewMode) {
            case 'dashboard':
                if (this.dashboardRenderer) {
                    this.dashboardRenderer.render(context, x + this.contentPadding, currentY + 20, contentWidth, availableHeight - 20);
                }
                break;
            case 'charts':
                this.renderStatisticsCharts(context, x + this.contentPadding, currentY + 20, contentWidth, availableHeight - 20);
                break;
            case 'details':
                if (this.statisticsRenderer) {
                    this.statisticsRenderer.render(context, x + this.contentPadding, currentY + 20, contentWidth, availableHeight - 20);
                }
                break;
        }
    }
    
    /**
     * データがない場合のメッセージ描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - 描画X座標
     * @param {number} y - 描画Y座標
     * @param {number} width - 描画幅
     * @param {number} height - 描画高さ
     */
    renderNoDataMessage(context, x, y, width, height) {
        context.fillStyle = this.accessibilitySettings.highContrast ? '#888888' : '#cccccc';
        context.font = this.accessibilitySettings.largeText ? '24px Arial' : '20px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        const message = 'まだ記録がありません';
        context.fillText(message, x + width / 2, y + height / 2);
    }
    
    /**
     * 統計チャートの描画（暫定実装）
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - 描画X座標
     * @param {number} y - 描画Y座標
     * @param {number} width - 描画幅
     * @param {number} height - 描画高さ
     */
    renderStatisticsCharts(context, x, y, width, height) {
        // チャート描画の暫定実装
        // TODO: 後続のコンポーネント抽出で詳細実装
        context.fillStyle = this.accessibilitySettings.highContrast ? '#444444' : '#f0f0f0';
        context.fillRect(x, y, width, height);
        
        context.fillStyle = this.accessibilitySettings.highContrast ? '#FFFFFF' : '#333333';
        context.font = this.accessibilitySettings.largeText ? '18px Arial' : '16px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        const message = 'チャート表示機能は開発中です';
        context.fillText(message, x + width / 2, y + height / 2);
    }
    
    /**
     * クリックイベント処理
     * @param {number} x - クリックX座標
     * @param {number} y - クリックY座標
     * @returns {boolean} - イベントが処理された場合true
     */
    handleClick(x, y) {
        try {
            // フィルターUIのクリック処理
            if (this.filterUI && this.filterUI.handleClick) {
                if (this.filterUI.handleClick(x, y)) {
                    return true;
                }
            }
            
            // ダッシュボードレンダラーのクリック処理
            if (this.dashboardRenderer && this.dashboardRenderer.handleClick) {
                if (this.dashboardRenderer.handleClick(x, y)) {
                    return true;
                }
            }
            
            // 統計レンダラーのクリック処理
            if (this.statisticsRenderer && this.statisticsRenderer.handleClick) {
                if (this.statisticsRenderer.handleClick(x, y)) {
                    return true;
                }
            }
            
            return false;
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'StatisticsTab.handleClick',
                details: `クリック処理でエラーが発生しました: (${x}, ${y})`
            });
            return false;
        }
    }
    
    /**
     * フレーム更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        try {
            // 子コンポーネントの更新
            if (this.filterUI && this.filterUI.update) {
                this.filterUI.update(deltaTime);
            }
            
            if (this.dashboardRenderer && this.dashboardRenderer.update) {
                this.dashboardRenderer.update(deltaTime);
            }
            
            if (this.statisticsRenderer && this.statisticsRenderer.update) {
                this.statisticsRenderer.update(deltaTime);
            }
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'StatisticsTab.update',
                details: 'StatisticsTab更新処理でエラーが発生しました'
            });
        }
    }
    
    /**
     * レスポンシブレイアウト設定を取得
     * @param {number} screenWidth - 画面幅
     * @returns {Object} - レイアウト設定
     */
    getResponsiveLayout(screenWidth) {
        if (screenWidth < 600) {
            return { columns: 1, fontSize: 'small' };
        } else if (screenWidth < 800) {
            return { columns: 2, fontSize: 'medium' };
        } else {
            return { columns: 2, fontSize: 'large' };
        }
    }
    
    /**
     * 統計表示モードの設定
     * @param {string} mode - 表示モード ('dashboard', 'charts', 'details')
     */
    setViewMode(mode) {
        if (['dashboard', 'charts', 'details'].includes(mode)) {
            this.statisticsViewMode = mode;
            this.eventBus.emit('statistics-view-mode-changed', mode);
        }
    }
    
    /**
     * 期間フィルターの設定
     * @param {string} period - 期間フィルター
     */
    setPeriodFilter(period) {
        this.currentPeriodFilter = period;
        this.eventBus.emit('statistics-filter-changed', { period: period });
    }
    
    /**
     * コンポーネントのクリーンアップ
     */
    cleanup() {
        super.cleanup();
        
        // イベントリスナーのクリーンアップ
        this.eventBus.off('statistics-filter-changed');
        this.eventBus.off('statistics-view-mode-changed');
        this.eventBus.off('statistics-data-updated');
        
        // 子コンポーネントのクリーンアップ
        if (this.filterUI && this.filterUI.cleanup) {
            this.filterUI.cleanup();
        }
        
        if (this.statisticsRenderer && this.statisticsRenderer.cleanup) {
            this.statisticsRenderer.cleanup();
        }
        
        if (this.dashboardRenderer && this.dashboardRenderer.cleanup) {
            this.dashboardRenderer.cleanup();
        }
    }
}