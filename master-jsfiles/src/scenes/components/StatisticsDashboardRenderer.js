/**
 * 統計ダッシュボードレンダラーコンポーネント
 * 統計ダッシュボードとチャートの表示機能を提供
 */
export class StatisticsDashboardRenderer {
    constructor(gameEngine, eventBus, state) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.state = state;
        
        // エラーハンドリング
        this.errorHandler = gameEngine.errorHandler;
        
        // アクセシビリティ設定
        this.accessibilitySettings = state.accessibilitySettings || {
            highContrast: false,
            largeText: false,
            reducedMotion: false
        };
        
        // レイアウト設定
        this.contentPadding = 20;
        
        // 統計データ
        this.statisticsData = null;
        
        // ダッシュボード設定
        this.statisticsDisplaySettings = {
            showDashboard: true,
            showCharts: true,
            showDetailedStats: true,
            enableAnimations: !this.accessibilitySettings.reducedMotion,
            compactMode: false
        };
        
        // 統計システム参照
        this.statisticsDashboard = null;
        this.chartRenderer = null;
        
        this.setupEventListeners();
        this.initializeStatisticsSystems();
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // 統計データ更新イベント
        this.eventBus.on('statistics-data-updated', (data) => {
            this.statisticsData = data;
        });
        
        // 設定変更イベント
        this.eventBus.on('statistics-display-settings-changed', (settings) => {
            this.statisticsDisplaySettings = { ...this.statisticsDisplaySettings, ...settings };
        });
    }
    
    /**
     * 統計システムの初期化
     */
    initializeStatisticsSystems() {
        try {
            // StatisticsDashboard の初期化
            if (this.gameEngine.statisticsDashboard) {
                this.statisticsDashboard = this.gameEngine.statisticsDashboard;
            } else {
                // フォールバック: 簡易ダッシュボード実装
                this.statisticsDashboard = {
                    render: this.renderFallbackDashboard.bind(this)
                };
            }
            
            // ChartRenderer の初期化
            if (this.gameEngine.chartRenderer) {
                this.chartRenderer = this.gameEngine.chartRenderer;
            } else {
                // フォールバック: 簡易チャート実装
                this.chartRenderer = {
                    render: this.renderFallbackChart.bind(this)
                };
            }
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'StatisticsDashboardRenderer.initializeStatisticsSystems',
                details: '統計システムの初期化でエラーが発生しました'
            });
        }
    }
    
    /**
     * ダッシュボードの描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - 描画X座標
     * @param {number} y - 描画Y座標
     * @param {number} width - 描画幅
     * @param {number} height - 描画高さ
     */
    render(context, x, y, width, height) {
        try {
            this.renderStatisticsDashboard(context, x, y, width, height);
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'StatisticsDashboardRenderer.render',
                details: 'ダッシュボードレンダリングでエラーが発生しました'
            });
            this.renderErrorFallback(context, x, y, width, height, error);
        }
    }
    
    /**
     * 統計ダッシュボードの描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - 描画X座標
     * @param {number} y - 描画Y座標
     * @param {number} width - 描画幅
     * @param {number} height - 描画高さ
     */
    async renderStatisticsDashboard(context, x, y, width, height) {
        if (!this.statisticsDashboard) {
            this.renderNoDataMessage(context, x, y, width, height, 'ダッシュボードを初期化できませんでした');
            return;
        }
        
        try {
            // ダッシュボード用のサブキャンバス作成
            const dashboardCanvas = document.createElement('canvas');
            dashboardCanvas.width = width;
            dashboardCanvas.height = height;
            const dashboardContext = dashboardCanvas.getContext('2d');
            
            // ダッシュボードの描画
            await this.statisticsDashboard.render(dashboardContext, {
                data: this.statisticsData,
                animated: this.statisticsDisplaySettings.enableAnimations,
                backgroundColor: this.accessibilitySettings.highContrast ? '#000000' : '#FFFFFF',
                textColor: this.accessibilitySettings.highContrast ? '#FFFFFF' : '#333333',
                accentColor: this.accessibilitySettings.highContrast ? '#FFFF00' : '#4a90e2',
                compactMode: this.statisticsDisplaySettings.compactMode,
                largeText: this.accessibilitySettings.largeText,
                width: width,
                height: height
            });
            
            // メインキャンバスに描画
            context.drawImage(dashboardCanvas, x, y);
            
        } catch (error) {
            console.error('Dashboard rendering failed:', error);
            this.renderNoDataMessage(context, x, y, width, height, 'ダッシュボードの描画に失敗しました');
        }
    }
    
    /**
     * フォールバック: 簡易ダッシュボードの描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} options - レンダリングオプション
     */
    async renderFallbackDashboard(context, options = {}) {
        const { width, height, backgroundColor, textColor, accentColor } = options;
        
        // 背景
        context.fillStyle = backgroundColor || (this.accessibilitySettings.highContrast ? '#000000' : '#F8FAFC');
        context.fillRect(0, 0, width, height);
        
        // 枠線
        context.strokeStyle = this.accessibilitySettings.highContrast ? '#FFFFFF' : '#E5E7EB';
        context.lineWidth = this.accessibilitySettings.highContrast ? 2 : 1;
        context.strokeRect(0, 0, width, height);
        
        if (!this.statisticsData) {
            // データなしメッセージ
            context.fillStyle = textColor || (this.accessibilitySettings.highContrast ? '#FFFFFF' : '#666666');
            context.font = this.accessibilitySettings.largeText ? '18px Arial' : '16px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText('統計データを読み込み中...', width / 2, height / 2);
            return;
        }
        
        // ダッシュボードタイトル
        context.fillStyle = accentColor || (this.accessibilitySettings.highContrast ? '#FFFF00' : '#4a90e2');
        context.font = this.accessibilitySettings.largeText ? 'bold 20px Arial' : 'bold 18px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.fillText('統計ダッシュボード', width / 2, 20);
        
        // 簡易統計カードを描画
        this.renderSimpleStatsCards(context, 20, 60, width - 40, height - 80, options);
    }
    
    /**
     * 簡易統計カードの描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - 描画X座標
     * @param {number} y - 描画Y座標
     * @param {number} width - 描画幅
     * @param {number} height - 描画高さ
     * @param {Object} options - レンダリングオプション
     */
    renderSimpleStatsCards(context, x, y, width, height, options = {}) {
        const { textColor, accentColor } = options;
        
        // 統計データの準備
        const stats = [
            {
                title: 'プレイ回数',
                value: this.statisticsData?.basic?.totalGamesPlayed || 0,
                unit: '回'
            },
            {
                title: '最高スコア',
                value: this.statisticsData?.basic?.highestScore || 0,
                unit: ''
            },
            {
                title: '総破壊数',
                value: this.statisticsData?.bubbles?.totalPopped || 0,
                unit: '個'
            },
            {
                title: '最大コンボ',
                value: this.statisticsData?.combos?.maxCombo || 0,
                unit: '連続'
            }
        ];
        
        // カードレイアウト計算
        const cardMargin = 10;
        const cardsPerRow = width < 400 ? 2 : 4;
        const cardWidth = (width - (cardMargin * (cardsPerRow + 1))) / cardsPerRow;
        const cardHeight = this.accessibilitySettings.largeText ? 100 : 80;
        
        // カードの描画
        stats.slice(0, cardsPerRow * 2).forEach((stat, index) => {
            const row = Math.floor(index / cardsPerRow);
            const col = index % cardsPerRow;
            const cardX = x + cardMargin + (col * (cardWidth + cardMargin));
            const cardY = y + (row * (cardHeight + cardMargin));
            
            this.renderStatsCard(context, stat, cardX, cardY, cardWidth, cardHeight, { textColor, accentColor });
        });
    }
    
    /**
     * 統計カードの描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {Object} stat - 統計データ
     * @param {number} x - 描画X座標
     * @param {number} y - 描画Y座標
     * @param {number} width - 描画幅
     * @param {number} height - 描画高さ
     * @param {Object} options - レンダリングオプション
     */
    renderStatsCard(context, stat, x, y, width, height, options = {}) {
        const { textColor, accentColor } = options;
        
        // カード背景
        context.fillStyle = this.accessibilitySettings.highContrast ? '#222222' : '#FFFFFF';
        context.fillRect(x, y, width, height);
        
        // カード枠線
        context.strokeStyle = this.accessibilitySettings.highContrast ? '#FFFFFF' : '#E5E7EB';
        context.lineWidth = this.accessibilitySettings.highContrast ? 2 : 1;
        context.strokeRect(x, y, width, height);
        
        // タイトル
        context.fillStyle = textColor || (this.accessibilitySettings.highContrast ? '#CCCCCC' : '#666666');
        context.font = this.accessibilitySettings.largeText ? '14px Arial' : '12px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.fillText(stat.title, x + width / 2, y + 10);
        
        // 値
        context.fillStyle = accentColor || (this.accessibilitySettings.highContrast ? '#FFFFFF' : '#333333');
        context.font = this.accessibilitySettings.largeText ? 'bold 24px Arial' : 'bold 20px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        const valueText = stat.value.toLocaleString() + stat.unit;
        context.fillText(valueText, x + width / 2, y + height / 2 + 5);
    }
    
    /**
     * フォールバック: 簡易チャートの描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {string} type - チャートタイプ
     * @param {Object} data - データ
     * @param {Object} options - オプション
     */
    async renderFallbackChart(context, type, data, options = {}) {
        const { width, height, lineColor, showAxes, showGrid } = options;
        
        // 背景
        context.fillStyle = this.accessibilitySettings.highContrast ? '#000000' : '#FFFFFF';
        context.fillRect(0, 0, width, height);
        
        // プレースホルダーメッセージ
        context.fillStyle = this.accessibilitySettings.highContrast ? '#FFFFFF' : '#666666';
        context.font = this.accessibilitySettings.largeText ? '16px Arial' : '14px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(`${type}チャート表示機能は開発中です`, width / 2, height / 2);
    }
    
    /**
     * データなしメッセージの描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - 描画X座標
     * @param {number} y - 描画Y座標
     * @param {number} width - 描画幅
     * @param {number} height - 描画高さ
     * @param {string} message - メッセージ
     */
    renderNoDataMessage(context, x, y, width, height, message) {
        context.fillStyle = this.accessibilitySettings.highContrast ? '#888888' : '#9CA3AF';
        context.font = this.accessibilitySettings.largeText ? '20px system-ui, -apple-system, sans-serif' : '16px system-ui, -apple-system, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(message, x + width / 2, y + height / 2);
    }
    
    /**
     * エラーフォールバックの描画
     * @param {CanvasRenderingContext2D} context - Canvas描画コンテキスト
     * @param {number} x - 描画X座標
     * @param {number} y - 描画Y座標
     * @param {number} width - 描画幅
     * @param {number} height - 描画高さ
     * @param {Error} error - エラーオブジェクト
     */
    renderErrorFallback(context, x, y, width, height, error) {
        context.fillStyle = this.accessibilitySettings.highContrast ? '#FF0000' : '#FF6B6B';
        context.fillRect(x, y, width, height);
        
        context.fillStyle = this.accessibilitySettings.highContrast ? '#FFFFFF' : '#333333';
        context.font = this.accessibilitySettings.largeText ? '18px sans-serif' : '16px sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        const errorText = 'ダッシュボード表示でエラーが発生しました';
        context.fillText(errorText, x + width / 2, y + height / 2);
        
        // デバッグ情報（開発時のみ）
        if (this.gameEngine.debugMode) {
            context.font = '12px monospace';
            context.fillText(error.message, x + width / 2, y + height / 2 + 30);
        }
    }
    
    /**
     * クリックイベント処理
     * @param {number} x - クリックX座標
     * @param {number} y - クリックY座標
     * @returns {boolean} - イベントが処理された場合true
     */
    handleClick(x, y) {
        try {
            // ダッシュボード内のインタラクティブ要素のクリック処理
            // 現在の実装では特別なクリック処理は不要
            // 将来的にチャートのドリルダウン等を実装する場合はここで処理
            return false;
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'StatisticsDashboardRenderer.handleClick',
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
            // アニメーション等が必要な場合はここで処理
            // 現在の実装では静的表示のため何もしない
            // 将来的にリアルタイム更新やアニメーションを実装する場合はここで処理
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'StatisticsDashboardRenderer.update',
                details: 'ダッシュボード更新処理でエラーが発生しました'
            });
        }
    }
    
    /**
     * 表示設定の更新
     * @param {Object} settings - 新しい表示設定
     */
    updateDisplaySettings(settings) {
        this.statisticsDisplaySettings = { ...this.statisticsDisplaySettings, ...settings };
        this.eventBus.emit('statistics-display-settings-changed', this.statisticsDisplaySettings);
    }
    
    /**
     * コンポーネントのクリーンアップ
     */
    cleanup() {
        // イベントリスナーのクリーンアップ
        this.eventBus.off('statistics-data-updated');
        this.eventBus.off('statistics-display-settings-changed');
        
        // データのクリア
        this.statisticsData = null;
        this.statisticsDashboard = null;
        this.chartRenderer = null;
    }
}