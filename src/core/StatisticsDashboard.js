/**
 * 統計ダッシュボードクラス
 * 統計データの統合ダッシュボード表示を管理する
 */
export class StatisticsDashboard {
    constructor(statisticsManager, chartRenderer) {
        this.statisticsManager = statisticsManager;
        this.chartRenderer = chartRenderer;
        
        // ダッシュボード設定
        this.config = {
            layout: {
                rows: 3,
                columns: 4,
                gridGap: 10,
                padding: 20
            },
            widgets: {
                keyMetrics: {
                    enabled: true,
                    span: { rows: 1, cols: 2 },
                    position: { row: 0, col: 0 }
                },
                recentAchievements: {
                    enabled: true,
                    span: { rows: 1, cols: 2 },
                    position: { row: 0, col: 2 }
                },
                growthTrends: {
                    enabled: true,
                    span: { rows: 1, cols: 3 },
                    position: { row: 1, col: 0 }
                },
                playStyle: {
                    enabled: true,
                    span: { rows: 1, cols: 1 },
                    position: { row: 1, col: 3 }
                },
                performanceChart: {
                    enabled: true,
                    span: { rows: 1, cols: 2 },
                    position: { row: 2, col: 0 }
                },
                statisticsBreakdown: {
                    enabled: true,
                    span: { rows: 1, cols: 2 },
                    position: { row: 2, col: 2 }
                }
            },
            responsive: {
                small: {
                    layout: { rows: 6, columns: 1 },
                    widgets: {
                        keyMetrics: { span: { rows: 1, cols: 1 }, position: { row: 0, col: 0 } },
                        recentAchievements: { span: { rows: 1, cols: 1 }, position: { row: 1, col: 0 } },
                        growthTrends: { span: { rows: 1, cols: 1 }, position: { row: 2, col: 0 } },
                        playStyle: { span: { rows: 1, cols: 1 }, position: { row: 3, col: 0 } },
                        performanceChart: { span: { rows: 1, cols: 1 }, position: { row: 4, col: 0 } },
                        statisticsBreakdown: { span: { rows: 1, cols: 1 }, position: { row: 5, col: 0 } }
                    }
                },
                medium: {
                    layout: { rows: 3, columns: 2 },
                    widgets: {
                        keyMetrics: { span: { rows: 1, cols: 2 }, position: { row: 0, col: 0 } },
                        recentAchievements: { span: { rows: 1, cols: 2 }, position: { row: 1, col: 0 } },
                        growthTrends: { span: { rows: 1, cols: 1 }, position: { row: 2, col: 0 } },
                        playStyle: { span: { rows: 1, cols: 1 }, position: { row: 2, col: 1 } },
                        performanceChart: { enabled: false },
                        statisticsBreakdown: { enabled: false }
                    }
                }
            }
        };
        
        // ウィジェット管理
        this.widgets = new Map();
        this.layoutCache = new Map();
        
        // イベントハンドラ
        this.eventHandlers = new Map();
        
        // アニメーション設定
        this.animationConfig = {
            enabled: true,
            duration: 300,
            easing: 'ease-in-out',
            stagger: 50
        };
        
        // 更新状態管理
        this.updateState = {
            isUpdating: false,
            lastUpdateTime: 0,
            updateInterval: 5000, // 5秒間隔
            autoUpdate: false
        };
        
        this.initialize();
    }
    
    /**
     * ダッシュボードの初期化
     */
    initialize() {
        this.createWidgets();
        this.setupEventListeners();
    }
    
    /**
     * ウィジェットの作成
     */
    createWidgets() {
        // 主要指標ウィジェット
        this.widgets.set('keyMetrics', new KeyMetricsWidget(this.statisticsManager));
        
        // 最近の実績ウィジェット
        this.widgets.set('recentAchievements', new RecentAchievementsWidget(this.statisticsManager));
        
        // 成長トレンドウィジェット
        this.widgets.set('growthTrends', new GrowthTrendsWidget(this.statisticsManager, this.chartRenderer));
        
        // プレイスタイルウィジェット
        this.widgets.set('playStyle', new PlayStyleWidget(this.statisticsManager, this.chartRenderer));
        
        // パフォーマンスチャートウィジェット
        this.widgets.set('performanceChart', new PerformanceChartWidget(this.statisticsManager, this.chartRenderer));
        
        // 統計詳細ウィジェット
        this.widgets.set('statisticsBreakdown', new StatisticsBreakdownWidget(this.statisticsManager, this.chartRenderer));
    }
    
    /**
     * ダッシュボードのレンダリング
     */
    render(context, options = {}) {
        try {
            const canvas = context.canvas;
            const currentConfig = this.getResponsiveConfig(canvas.width);
            
            // レイアウトの計算
            const layout = this.calculateLayout(canvas, currentConfig);
            
            // 背景の描画
            this.renderBackground(context, layout, options);
            
            // ウィジェットの描画
            const renderPromises = this.renderWidgets(context, layout, currentConfig, options);
            
            // アニメーション対応
            if (this.animationConfig.enabled && options.animated) {
                return this.animateWidgets(renderPromises);
            }
            
            return Promise.all(renderPromises).then(results => ({
                type: 'dashboard',
                widgets: results,
                layout: layout,
                timestamp: Date.now()
            }));
            
        } catch (error) {
            console.error('Dashboard rendering failed:', error);
            return this.renderErrorDashboard(context, error);
        }
    }
    
    /**
     * レスポンシブ設定の取得
     */
    getResponsiveConfig(width) {
        if (width <= 768) {
            return { ...this.config, ...this.config.responsive.small };
        } else if (width <= 1024) {
            return { ...this.config, ...this.config.responsive.medium };
        }
        return this.config;
    }
    
    /**
     * レイアウトの計算
     */
    calculateLayout(canvas, config) {
        const cacheKey = `${canvas.width}x${canvas.height}`;
        if (this.layoutCache.has(cacheKey)) {
            return this.layoutCache.get(cacheKey);
        }
        
        const { layout, widgets } = config;
        const { rows, columns, gridGap, padding } = layout;
        
        const availableWidth = canvas.width - (padding * 2);
        const availableHeight = canvas.height - (padding * 2);
        
        const cellWidth = (availableWidth - (gridGap * (columns - 1))) / columns;
        const cellHeight = (availableHeight - (gridGap * (rows - 1))) / rows;
        
        const widgetAreas = {};
        
        Object.entries(widgets).forEach(([name, widgetConfig]) => {
            if (!widgetConfig.enabled) return;
            
            const { span, position } = widgetConfig;
            const x = padding + (position.col * (cellWidth + gridGap));
            const y = padding + (position.row * (cellHeight + gridGap));
            const width = (cellWidth * span.cols) + (gridGap * (span.cols - 1));
            const height = (cellHeight * span.rows) + (gridGap * (span.rows - 1));
            
            widgetAreas[name] = { x, y, width, height };
        });
        
        const layoutResult = {
            canvas: { width: canvas.width, height: canvas.height },
            grid: { rows, columns, cellWidth, cellHeight, gridGap, padding },
            widgets: widgetAreas
        };
        
        this.layoutCache.set(cacheKey, layoutResult);
        return layoutResult;
    }
    
    /**
     * 背景の描画
     */
    renderBackground(context, layout, options) {
        const canvas = context.canvas;
        
        // 背景色
        context.fillStyle = options.backgroundColor || '#F8FAFC';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // グリッドの描画（デバッグ時）
        if (options.showGrid) {
            this.renderGrid(context, layout);
        }
    }
    
    /**
     * グリッドの描画
     */
    renderGrid(context, layout) {
        const { grid } = layout;
        
        context.strokeStyle = '#E2E8F0';
        context.lineWidth = 1;
        context.setLineDash([2, 2]);
        
        // 垂直線
        for (let col = 0; col <= grid.columns; col++) {
            const x = grid.padding + (col * (grid.cellWidth + grid.gridGap)) - (grid.gridGap / 2);
            context.beginPath();
            context.moveTo(x, grid.padding);
            context.lineTo(x, layout.canvas.height - grid.padding);
            context.stroke();
        }
        
        // 水平線
        for (let row = 0; row <= grid.rows; row++) {
            const y = grid.padding + (row * (grid.cellHeight + grid.gridGap)) - (grid.gridGap / 2);
            context.beginPath();
            context.moveTo(grid.padding, y);
            context.lineTo(layout.canvas.width - grid.padding, y);
            context.stroke();
        }
        
        context.setLineDash([]);
    }
    
    /**
     * ウィジェットの描画
     */
    renderWidgets(context, layout, config, options) {
        const renderPromises = [];
        
        Object.entries(config.widgets).forEach(([name, widgetConfig]) => {
            if (!widgetConfig.enabled) return;
            
            const widget = this.widgets.get(name);
            const area = layout.widgets[name];
            
            if (widget && area) {
                // サブコンテキストの作成
                const subCanvas = document.createElement('canvas');
                subCanvas.width = area.width;
                subCanvas.height = area.height;
                const subContext = subCanvas.getContext('2d');
                
                // ウィジェットのレンダリング
                const renderPromise = widget.render(subContext, {
                    ...options,
                    area: area,
                    name: name
                }).then(result => {
                    // メインキャンバスに描画
                    context.drawImage(subCanvas, area.x, area.y);
                    return { name, result, area };
                }).catch(error => {
                    console.error(`Widget ${name} rendering failed:`, error);
                    this.renderWidgetError(context, area, name, error);
                    return { name, error: error.message, area };
                });
                
                renderPromises.push(renderPromise);
            }
        });
        
        return renderPromises;
    }
    
    /**
     * ウィジェットエラーの描画
     */
    renderWidgetError(context, area, name, error) {
        // エラー背景
        context.fillStyle = '#FEE2E2';
        context.fillRect(area.x, area.y, area.width, area.height);
        
        // エラー枠線
        context.strokeStyle = '#DC2626';
        context.lineWidth = 2;
        context.strokeRect(area.x, area.y, area.width, area.height);
        
        // エラーメッセージ
        context.fillStyle = '#DC2626';
        context.font = '14px system-ui, -apple-system, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        const centerX = area.x + area.width / 2;
        const centerY = area.y + area.height / 2;
        
        context.fillText(`${name} エラー`, centerX, centerY - 10);
        context.fillText(error.slice(0, 30) + '...', centerX, centerY + 10);
    }
    
    /**
     * アニメーションの実行
     */
    animateWidgets(renderPromises) {
        return new Promise((resolve) => {
            let completedCount = 0;
            const results = [];
            
            renderPromises.forEach((promise, index) => {
                setTimeout(() => {
                    promise.then(result => {
                        results[index] = result;
                        completedCount++;
                        
                        if (completedCount === renderPromises.length) {
                            resolve({
                                type: 'dashboard',
                                widgets: results,
                                animated: true,
                                timestamp: Date.now()
                            });
                        }
                    });
                }, index * this.animationConfig.stagger);
            });
        });
    }
    
    /**
     * エラーダッシュボードの描画
     */
    renderErrorDashboard(context, error) {
        const canvas = context.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // 背景
        context.fillStyle = '#F8FAFC';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // エラーアイコン
        context.fillStyle = '#EF4444';
        context.font = '48px system-ui, -apple-system, sans-serif';
        context.textAlign = 'center';
        context.fillText('⚠', centerX, centerY - 30);
        
        // エラーメッセージ
        context.fillStyle = '#374151';
        context.font = '16px system-ui, -apple-system, sans-serif';
        context.fillText('ダッシュボードの読み込みに失敗しました', centerX, centerY + 20);
        context.fillText(error.message, centerX, centerY + 40);
        
        return Promise.resolve({
            type: 'dashboard',
            error: error.message,
            timestamp: Date.now()
        });
    }
    
    /**
     * 自動更新の設定
     */
    setAutoUpdate(enabled, interval = 5000) {
        this.updateState.autoUpdate = enabled;
        this.updateState.updateInterval = interval;
        
        if (enabled) {
            this.startAutoUpdate();
        } else {
            this.stopAutoUpdate();
        }
    }
    
    /**
     * 自動更新の開始
     */
    startAutoUpdate() {
        if (this.updateState.autoUpdateTimer) {
            clearInterval(this.updateState.autoUpdateTimer);
        }
        
        this.updateState.autoUpdateTimer = setInterval(() => {
            if (!this.updateState.isUpdating) {
                this.refreshData();
            }
        }, this.updateState.updateInterval);
    }
    
    /**
     * 自動更新の停止
     */
    stopAutoUpdate() {
        if (this.updateState.autoUpdateTimer) {
            clearInterval(this.updateState.autoUpdateTimer);
            this.updateState.autoUpdateTimer = null;
        }
    }
    
    /**
     * データの更新
     */
    async refreshData() {
        if (this.updateState.isUpdating) return;
        
        this.updateState.isUpdating = true;
        
        try {
            // 各ウィジェットのデータ更新
            const updatePromises = Array.from(this.widgets.values()).map(widget => {
                if (typeof widget.refreshData === 'function') {
                    return widget.refreshData();
                }
                return Promise.resolve();
            });
            
            await Promise.all(updatePromises);
            this.updateState.lastUpdateTime = Date.now();
            
            // 更新イベントの発火
            this.emit('dataUpdated', {
                timestamp: this.updateState.lastUpdateTime
            });
            
        } catch (error) {
            console.error('Dashboard data refresh failed:', error);
            this.emit('updateError', error);
        } finally {
            this.updateState.isUpdating = false;
        }
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // ウィンドウリサイズ時のレイアウト更新
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', () => {
                this.layoutCache.clear();
            });
        }
    }
    
    /**
     * イベントの発火
     */
    emit(eventName, data) {
        const handlers = this.eventHandlers.get(eventName) || [];
        handlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`Event handler error for ${eventName}:`, error);
            }
        });
    }
    
    /**
     * イベントリスナーの追加
     */
    on(eventName, handler) {
        if (!this.eventHandlers.has(eventName)) {
            this.eventHandlers.set(eventName, []);
        }
        this.eventHandlers.get(eventName).push(handler);
    }
    
    /**
     * イベントリスナーの削除
     */
    off(eventName, handler) {
        const handlers = this.eventHandlers.get(eventName);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }
    
    /**
     * ダッシュボードの破棄
     */
    destroy() {
        this.stopAutoUpdate();
        this.widgets.clear();
        this.layoutCache.clear();
        this.eventHandlers.clear();
    }
}

/**
 * 主要指標ウィジェット
 */
class KeyMetricsWidget {
    constructor(statisticsManager) {
        this.statisticsManager = statisticsManager;
        this.metrics = [
            { key: 'totalScore', label: 'トータルスコア', format: 'number' },
            { key: 'accuracy', label: '精度', format: 'percentage' },
            { key: 'averageCombo', label: '平均コンボ', format: 'decimal' },
            { key: 'playTime', label: 'プレイ時間', format: 'time' }
        ];
    }
    
    async render(context, options) {
        const stats = await this.statisticsManager.getDetailedStatistics();
        const canvas = context.canvas;
        
        // 背景
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // 枠線
        context.strokeStyle = '#E5E7EB';
        context.lineWidth = 1;
        context.strokeRect(0, 0, canvas.width, canvas.height);
        
        // タイトル
        context.fillStyle = '#1F2937';
        context.font = 'bold 16px system-ui, -apple-system, sans-serif';
        context.textAlign = 'left';
        context.fillText('主要指標', 15, 25);
        
        // メトリクスの描画
        const metricsPerRow = Math.ceil(this.metrics.length / 2);
        const metricWidth = (canvas.width - 30) / 2;
        const metricHeight = 40;
        
        this.metrics.forEach((metric, index) => {
            const row = Math.floor(index / 2);
            const col = index % 2;
            const x = 15 + (col * metricWidth);
            const y = 45 + (row * metricHeight);
            
            // 値の取得とフォーマット
            const value = this.getMetricValue(stats, metric.key);
            const formattedValue = this.formatValue(value, metric.format);
            
            // ラベル
            context.fillStyle = '#6B7280';
            context.font = '12px system-ui, -apple-system, sans-serif';
            context.fillText(metric.label, x, y);
            
            // 値
            context.fillStyle = '#1F2937';
            context.font = 'bold 18px system-ui, -apple-system, sans-serif';
            context.fillText(formattedValue, x, y + 20);
        });
        
        return {
            type: 'keyMetrics',
            metrics: this.metrics.map(m => ({
                ...m,
                value: this.getMetricValue(stats, m.key)
            }))
        };
    }
    
    getMetricValue(stats, key) {
        switch (key) {
            case 'totalScore': return stats.scoreStats?.totalScore || 0;
            case 'accuracy': return stats.bubbleStats?.accuracy || 0;
            case 'averageCombo': return stats.comboStats?.averageCombo || 0;
            case 'playTime': return stats.gamePlayStats?.totalPlayTime || 0;
            default: return 0;
        }
    }
    
    formatValue(value, format) {
        switch (format) {
            case 'number': return value.toLocaleString();
            case 'percentage': return `${(value * 100).toFixed(1)}%`;
            case 'decimal': return value.toFixed(1);
            case 'time': return this.formatTime(value);
            default: return value.toString();
        }
    }
    
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }
}

/**
 * 最近の実績ウィジェット
 */
class RecentAchievementsWidget {
    constructor(statisticsManager) {
        this.statisticsManager = statisticsManager;
    }
    
    async render(context, options) {
        const stats = await this.statisticsManager.getDetailedStatistics();
        const canvas = context.canvas;
        
        // 背景
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // 枠線
        context.strokeStyle = '#E5E7EB';
        context.lineWidth = 1;
        context.strokeRect(0, 0, canvas.width, canvas.height);
        
        // タイトル
        context.fillStyle = '#1F2937';
        context.font = 'bold 16px system-ui, -apple-system, sans-serif';
        context.textAlign = 'left';
        context.fillText('最近の実績', 15, 25);
        
        // 実績データの取得（模擬データ）
        const achievements = [
            { name: '初回プレイ', date: '今日' },
            { name: 'コンボマスター', date: '昨日' },
            { name: 'スピードスター', date: '2日前' }
        ];
        
        // 実績の描画
        achievements.forEach((achievement, index) => {
            const y = 50 + (index * 25);
            
            // 実績アイコン
            context.fillStyle = '#10B981';
            context.fillRect(15, y - 8, 12, 12);
            
            // 実績名
            context.fillStyle = '#1F2937';
            context.font = '14px system-ui, -apple-system, sans-serif';
            context.fillText(achievement.name, 35, y);
            
            // 日付
            context.fillStyle = '#6B7280';
            context.font = '12px system-ui, -apple-system, sans-serif';
            context.textAlign = 'right';
            context.fillText(achievement.date, canvas.width - 15, y);
            context.textAlign = 'left';
        });
        
        return {
            type: 'recentAchievements',
            achievements: achievements
        };
    }
}

/**
 * 成長トレンドウィジェット
 */
class GrowthTrendsWidget {
    constructor(statisticsManager, chartRenderer) {
        this.statisticsManager = statisticsManager;
        this.chartRenderer = chartRenderer;
    }
    
    async render(context, options) {
        const stats = await this.statisticsManager.getDetailedStatistics();
        const canvas = context.canvas;
        
        // 背景
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // 枠線
        context.strokeStyle = '#E5E7EB';
        context.lineWidth = 1;
        context.strokeRect(0, 0, canvas.width, canvas.height);
        
        // タイトル
        context.fillStyle = '#1F2937';
        context.font = 'bold 16px system-ui, -apple-system, sans-serif';
        context.textAlign = 'left';
        context.fillText('成長トレンド', 15, 25);
        
        // グラフエリア
        const chartArea = {
            x: 15,
            y: 35,
            width: canvas.width - 30,
            height: canvas.height - 50
        };
        
        // トレンドデータの生成（模擬データ）
        const trendData = this.generateTrendData();
        
        // 小さなサブキャンバスでチャートを描画
        const chartCanvas = document.createElement('canvas');
        chartCanvas.width = chartArea.width;
        chartCanvas.height = chartArea.height;
        const chartContext = chartCanvas.getContext('2d');
        
        await this.chartRenderer.render(chartContext, 'line', trendData, {
            width: chartArea.width,
            height: chartArea.height,
            showAxes: false,
            showGrid: false,
            padding: 5,
            lineColor: '#3B82F6',
            pointColor: '#3B82F6'
        });
        
        // メインキャンバスに描画
        context.drawImage(chartCanvas, chartArea.x, chartArea.y);
        
        return {
            type: 'growthTrends',
            data: trendData
        };
    }
    
    generateTrendData() {
        const data = [];
        for (let i = 0; i < 7; i++) {
            data.push({
                x: i,
                value: 100 + (i * 10) + (Math.random() * 20),
                label: `Day ${i + 1}`
            });
        }
        return data;
    }
}

/**
 * プレイスタイルウィジェット
 */
class PlayStyleWidget {
    constructor(statisticsManager, chartRenderer) {
        this.statisticsManager = statisticsManager;
        this.chartRenderer = chartRenderer;
    }
    
    async render(context, options) {
        const stats = await this.statisticsManager.getDetailedStatistics();
        const canvas = context.canvas;
        
        // 背景
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // 枠線
        context.strokeStyle = '#E5E7EB';
        context.lineWidth = 1;
        context.strokeRect(0, 0, canvas.width, canvas.height);
        
        // タイトル
        context.fillStyle = '#1F2937';
        context.font = 'bold 16px system-ui, -apple-system, sans-serif';
        context.textAlign = 'left';
        context.fillText('プレイスタイル', 15, 25);
        
        // プレイスタイル分析データ
        const playStyleData = [
            { label: '攻撃的', value: 65 },
            { label: '安定型', value: 85 },
            { label: '効率的', value: 70 }
        ];
        
        // プレイスタイル指標の描画
        playStyleData.forEach((item, index) => {
            const y = 45 + (index * 20);
            const barWidth = (item.value / 100) * (canvas.width - 80);
            
            // ラベル
            context.fillStyle = '#6B7280';
            context.font = '12px system-ui, -apple-system, sans-serif';
            context.fillText(item.label, 15, y);
            
            // プログレスバー
            context.fillStyle = '#E5E7EB';
            context.fillRect(60, y - 8, canvas.width - 80, 12);
            
            context.fillStyle = '#3B82F6';
            context.fillRect(60, y - 8, barWidth, 12);
            
            // 値
            context.fillStyle = '#1F2937';
            context.textAlign = 'right';
            context.fillText(`${item.value}%`, canvas.width - 15, y);
            context.textAlign = 'left';
        });
        
        return {
            type: 'playStyle',
            data: playStyleData
        };
    }
}

/**
 * パフォーマンスチャートウィジェット
 */
class PerformanceChartWidget {
    constructor(statisticsManager, chartRenderer) {
        this.statisticsManager = statisticsManager;
        this.chartRenderer = chartRenderer;
    }
    
    async render(context, options) {
        const stats = await this.statisticsManager.getDetailedStatistics();
        const canvas = context.canvas;
        
        // 背景
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // 枠線
        context.strokeStyle = '#E5E7EB';
        context.lineWidth = 1;
        context.strokeRect(0, 0, canvas.width, canvas.height);
        
        // タイトル
        context.fillStyle = '#1F2937';
        context.font = 'bold 16px system-ui, -apple-system, sans-serif';
        context.textAlign = 'left';
        context.fillText('パフォーマンス', 15, 25);
        
        // チャートエリア
        const chartArea = {
            x: 15,
            y: 35,
            width: canvas.width - 30,
            height: canvas.height - 50
        };
        
        // パフォーマンスデータ
        const performanceData = [
            { label: 'スコア', value: 1250 },
            { label: '精度', value: 850 },
            { label: 'コンボ', value: 920 },
            { label: '速度', value: 780 }
        ];
        
        // バーチャートの描画
        const chartCanvas = document.createElement('canvas');
        chartCanvas.width = chartArea.width;
        chartCanvas.height = chartArea.height;
        const chartContext = chartCanvas.getContext('2d');
        
        await this.chartRenderer.render(chartContext, 'bar', performanceData, {
            width: chartArea.width,
            height: chartArea.height,
            showAxes: true,
            showGrid: true,
            padding: 5
        });
        
        // メインキャンバスに描画
        context.drawImage(chartCanvas, chartArea.x, chartArea.y);
        
        return {
            type: 'performanceChart',
            data: performanceData
        };
    }
}

/**
 * 統計詳細ウィジェット
 */
class StatisticsBreakdownWidget {
    constructor(statisticsManager, chartRenderer) {
        this.statisticsManager = statisticsManager;
        this.chartRenderer = chartRenderer;
    }
    
    async render(context, options) {
        const stats = await this.statisticsManager.getDetailedStatistics();
        const canvas = context.canvas;
        
        // 背景
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // 枠線
        context.strokeStyle = '#E5E7EB';
        context.lineWidth = 1;
        context.strokeRect(0, 0, canvas.width, canvas.height);
        
        // タイトル
        context.fillStyle = '#1F2937';
        context.font = 'bold 16px system-ui, -apple-system, sans-serif';
        context.textAlign = 'left';
        context.fillText('統計詳細', 15, 25);
        
        // 統計項目の表示
        const statisticsItems = [
            { label: 'ゲーム数', value: stats.gamePlayStats?.totalGames || 0 },
            { label: '最高スコア', value: stats.scoreStats?.highestScore || 0 },
            { label: '最高コンボ', value: stats.comboStats?.maxCombo || 0 },
            { label: '平均精度', value: `${((stats.bubbleStats?.accuracy || 0) * 100).toFixed(1)}%` }
        ];
        
        statisticsItems.forEach((item, index) => {
            const y = 50 + (index * 20);
            
            // ラベル
            context.fillStyle = '#6B7280';
            context.font = '12px system-ui, -apple-system, sans-serif';
            context.fillText(item.label, 15, y);
            
            // 値
            context.fillStyle = '#1F2937';
            context.font = 'bold 14px system-ui, -apple-system, sans-serif';
            context.textAlign = 'right';
            context.fillText(item.value.toString(), canvas.width - 15, y);
            context.textAlign = 'left';
        });
        
        return {
            type: 'statisticsBreakdown',
            items: statisticsItems
        };
    }
}