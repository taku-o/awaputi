import { DashboardWidgetRenderer } from './statistics/DashboardWidgetRenderer.js';

/**
 * 統計ダッシュボードクラス（Main Controller）
 * 統計データの統合ダッシュボード表示を管理する
 */
export class StatisticsDashboard {
    constructor(statisticsManager, chartRenderer, widgetRenderer) {
        this.statisticsManager = statisticsManager;
        this.chartRenderer = chartRenderer;
        this.widgetRenderer = widgetRenderer || new DashboardWidgetRenderer();
        
        // ダッシュボード設定
        this.config = {
            layout: {
                rows: 3;
                columns: 4;
                gridGap: 10;
    ,}
                padding: 20 }
            };
            widgets: { keyMetrics: {
                    enabled: true, }
                    span: { rows: 1, cols: 2 ,},
                    position: { row: 0, col: 0 ,},
                recentAchievements: { enabled: true, }
                    span: { rows: 1, cols: 2 ,},
                    position: { row: 0, col: 2 ,},
                growthTrends: { enabled: true, }
                    span: { rows: 1, cols: 3 ,},
                    position: { row: 1, col: 0 ,},
                playStyle: { enabled: true, }
                    span: { rows: 1, cols: 1 ,},
                    position: { row: 1, col: 3 ,},
                performanceChart: { enabled: true, }
                    span: { rows: 1, cols: 2 ,},
                    position: { row: 2, col: 0 ,},
                statisticsBreakdown: { enabled: true, }
                    span: { rows: 1, cols: 2 ,},
                    position: { row: 2, col: 2 ,}
            },
            responsive: { small: { }
                    layout: { rows: 6, columns: 1 ,},
                    widgets: {
                        keyMetrics: { span: { rows: 1, cols: 1 ,}, position: { row: 0, col: 0 ,},
                        recentAchievements: { span: { rows: 1, cols: 1 ,}, position: { row: 1, col: 0 ,},
                        growthTrends: { span: { rows: 1, cols: 1 ,}, position: { row: 2, col: 0 ,},
                        playStyle: { span: { rows: 1, cols: 1 ,}, position: { row: 3, col: 0 ,},
                        performanceChart: { span: { rows: 1, cols: 1 ,}, position: { row: 4, col: 0 ,},
                        statisticsBreakdown: { span: { rows: 1, cols: 1 ,}, position: { row: 5, col: 0 ,}
},
                medium: {
                    layout: { rows: 3, columns: 2 ,},
                    widgets: {
                        keyMetrics: { span: { rows: 1, cols: 2 ,}, position: { row: 0, col: 0 ,},
                        recentAchievements: { span: { rows: 1, cols: 2 ,}, position: { row: 1, col: 0 ,},
                        growthTrends: { span: { rows: 1, cols: 1 ,}, position: { row: 2, col: 0 ,},
                        playStyle: { span: { rows: 1, cols: 1 ,}, position: { row: 2, col: 1 ,},
                        performanceChart: { enabled: false };
                        statisticsBreakdown: { enabled: false }
}
        };
        // ウィジェット管理
        this.widgets = new Map();
        this.layoutCache = new Map();
        // イベントハンドラ
        this.eventHandlers = new Map(''';
            easing: 'ease-in-out';
            stagger: 50;
        },
        
        // 更新状態管理
        this.updateState = { isUpdating: false,
            lastUpdateTime: 0;
            updateInterval: 5000, // 5秒間隔;
            autoUpdate: false ,}))
        this.initialize();
    }
    
    /**
     * ダッシュボードの初期化
     */
    initialize() {
        this.createWidgets();
    }
        this.setupEventListeners(); }
    }
    
    /**
     * ウィジェットの作成（ウィジェットレンダラーに委譲）
     */''
    createWidgets(''';
        const widgetTypes = ['keyMetrics', 'recentAchievements', 'growthTrends', 'playStyle', 'performanceChart', 'statisticsBreakdown'];
        );
        widgetTypes.forEach(type => {  );
            const widget = this.widgetRenderer.createWidget(type, this.statisticsManager, this.chartRenderer); }
            this.widgets.set(type, widget); }
        });
    }
    
    /**
     * ダッシュボードのレンダリング
     */
    render(context, options = { ) {
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
    }
                return this.animateWidgets(renderPromises);

            return Promise.all(renderPromises).then(results => ({ ')'
                type: 'dashboard');
                widgets: results,);
                layout: layout);
                timestamp: Date.now( ,});

        } catch (error) {
            console.error('Dashboard rendering failed:', error);
            return this.renderErrorDashboard(context, error);
    
    /**
     * レスポンシブ設定の取得
     */
    getResponsiveConfig(width) { if (width <= 768) { }
            return { ...this.config, ...this.config.responsive.small;
        } else if (width <= 1024) {
            return { ...this.config, ...this.config.responsive.medium;
        }
        return this.config;
    }
    
    /**
     * レイアウトの計算
     */
    calculateLayout(canvas, config) {
        
    }
        const cacheKey = `${canvas.width}x${canvas.height}`;
        if(this.layoutCache.has(cacheKey) { return this.layoutCache.get(cacheKey); }
        
        const { layout, widgets } = config;
        const { rows, columns, gridGap, padding } = layout;
        
        const availableWidth = canvas.width - (padding * 2);
        const availableHeight = canvas.height - (padding * 2);
        
        const cellWidth = (availableWidth - (gridGap * (columns - 1))) / columns;
        const cellHeight = (availableHeight - (gridGap * (rows - 1))) / rows;
        
        const widgetAreas = {};
        
        Object.entries(widgets).forEach(([name, widgetConfig]) => {  if (!widgetConfig.enabled) return; }
            const { span, position } = widgetConfig;
            const x = padding + (position.col * (cellWidth + gridGap));
            const y = padding + (position.row * (cellHeight + gridGap));
            const width = (cellWidth * span.cols) + (gridGap * (span.cols - 1);
            const height = (cellHeight * span.rows) + (gridGap * (span.rows - 1));
            
            widgetAreas[name] = { x, y, width, height });
        
        const layoutResult = {
            canvas: { width: canvas.width, height: canvas.height ,},
            grid: { rows, columns, cellWidth, cellHeight, gridGap, padding },
            widgets: widgetAreas;
        },
        
        this.layoutCache.set(cacheKey, layoutResult);
        return layoutResult;
    }
    
    /**
     * 背景の描画'
     */''
    renderBackground(context, layout, options) {
        const canvas = context.canvas;
        ';
        // 背景色
        context.fillStyle = options.backgroundColor || '#F8FAFC';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // グリッドの描画（デバッグ時）
        if (options.showGrid) {
    }
            this.renderGrid(context, layout); }
}
    
    /**
     * グリッドの描画
     */''
    renderGrid(context, layout) {
        
    }
        const { grid } = layout;

        context.strokeStyle = '#E2E8F0';
        context.lineWidth = 1;
        context.setLineDash([2, 2]);
        
        // 垂直線
        for(let, col = 0; col <= grid.columns; col++) {
            const x = grid.padding + (col * (grid.cellWidth + grid.gridGap)) - (grid.gridGap / 2);
            context.beginPath();
            context.moveTo(x, grid.padding);
            context.lineTo(x, layout.canvas.height - grid.padding);
        }
            context.stroke(); }
        }
        
        // 水平線
        for(let, row = 0; row <= grid.rows; row++) {
            const y = grid.padding + (row * (grid.cellHeight + grid.gridGap)) - (grid.gridGap / 2);
            context.beginPath();
            context.moveTo(grid.padding, y);
            context.lineTo(layout.canvas.width - grid.padding, y);
        }
            context.stroke(); }
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

            if(widget && area) {'
                // サブコンテキストの作成
                const subCanvas = document.createElement('canvas'');
                subCanvas.width = area.width;

                subCanvas.height = area.height;''
                const subContext = subCanvas.getContext('2d);
                
                // ウィジェットのレンダリング
                const renderPromise = widget.render(subContext, {)
                    ...options);
                    area: area,);
                    name: name).then(result => {)
    ,}
                    // メインキャンバスに描画), }
                    context.drawImage(subCanvas, area.x, area.y); }
                    return { name, result, area }).catch(error => { ); }
                    console.error(`Widget ${name} rendering failed:`, error);
                    this.renderWidgetError(context, area, name, error);
                    return { name, error: error.message, area });
                
                renderPromises.push(renderPromise);
            }
        });
        
        return renderPromises;
    }
    
    /**
     * ウィジェットエラーの描画
     */''
    renderWidgetError(context, area, name, error) {'
        // エラー背景
        context.fillStyle = '#FEE2E2';''
        context.fillRect(area.x, area.y, area.width, area.height);
        ';
        // エラー枠線
        context.strokeStyle = '#DC2626';

        context.lineWidth = 2;''
        context.strokeRect(area.x, area.y, area.width, area.height);
        ';
        // エラーメッセージ
        context.fillStyle = '#DC2626';''
        context.font = '14px system-ui, -apple-system, sans-serif';''
        context.textAlign = 'center';''
        context.textBaseline = 'middle';
        
        const centerX = area.x + area.width / 2;
        const centerY = area.y + area.height / 2;
        
    }

        context.fillText(`${name} エラー`, centerX, centerY - 10};' }'

        context.fillText(error.slice(0, 30) + '...', centerX, centerY + 10});
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
                    promise.then(result => {)
                        results[index] = result;)
                        completedCount++';
                        );''
                        if(completedCount === renderPromises.length) {'
                            resolve({''
                                type: 'dashboard';
                                widgets: results;
    ,})
                                animated: true) }
                                timestamp: Date.now(); }
                            });
                        }
                    });
                }, index * this.animationConfig.stagger);
            });
        });
    }
    
    /**
     * エラーダッシュボードの描画'
     */''
    renderErrorDashboard(context, error) {
        const canvas = context.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        ';
        // 背景
        context.fillStyle = '#F8FAFC';''
        context.fillRect(0, 0, canvas.width, canvas.height);
        ';
        // エラーアイコン
        context.fillStyle = '#EF4444';''
        context.font = '48px system-ui, -apple-system, sans-serif';''
        context.textAlign = 'center';''
        context.fillText('⚠', centerX, centerY - 30);
        ';
        // エラーメッセージ
        context.fillStyle = '#374151';''
        context.font = '16px system-ui, -apple-system, sans-serif';''
        context.fillText('ダッシュボードの読み込みに失敗しました', centerX, centerY + 20);''
        context.fillText(error.message, centerX, centerY + 40);
        ';

        return Promise.resolve({)'
            type: 'dashboard',);
            error: error.message);
    ,}
            timestamp: Date.now(); }
        });
    }
    
    /**
     * 自動更新の設定
     */
    setAutoUpdate(enabled, interval = 5000) {
        this.updateState.autoUpdate = enabled;
        this.updateState.updateInterval = interval;
        
        if (enabled) {
    }
            this.startAutoUpdate(); }
        } else { this.stopAutoUpdate(); }
    }
    
    /**
     * 自動更新の開始
     */
    startAutoUpdate() {
        if (this.updateState.autoUpdateTimer) {
    }
            clearInterval(this.updateState.autoUpdateTimer); }
        }
        
        this.updateState.autoUpdateTimer = setInterval(() => {  if (!this.updateState.isUpdating) { }
                this.refreshData(); }
}, this.updateState.updateInterval);
    }
    
    /**
     * 自動更新の停止
     */
    stopAutoUpdate() {
        if (this.updateState.autoUpdateTimer) {
            clearInterval(this.updateState.autoUpdateTimer);
    }
            this.updateState.autoUpdateTimer = null; }
}
    
    /**
     * データの更新
     */
    async refreshData() { if (this.updateState.isUpdating) return;
        
        this.updateState.isUpdating = true;
        
        try {
            // 各ウィジェットのデータ更新
            const updatePromises = Array.from(this.widgets.values().map(widget => { ');''
                if(typeof, widget.refreshData === 'function) { }'
                    return widget.refreshData();
                return Promise.resolve();
            });
            ';

            await Promise.all(updatePromises);''
            this.updateState.lastUpdateTime = Date.now()';
            this.emit('dataUpdated', { )
                timestamp: this.updateState.lastUpdateTime),
            ' }'

        } catch (error) {
            console.error('Dashboard data refresh failed:', error);''
            this.emit('updateError', error); } finally { this.updateState.isUpdating = false; }
    }
    
    /**
     * イベントリスナーの設定'
     */''
    setupEventListeners()';
        if (typeof, window !== 'undefined'') {'
        ';

    }

            window.addEventListener('resize', () => {  }
                this.layoutCache.clear(); }
            });
        }
    }
    
    /**
     * イベントの発火
     */
    emit(eventName, data) {
        const handlers = this.eventHandlers.get(eventName) || [];
        handlers.forEach(handler => { )
    }
            try {); }
                handler(data); }
            } catch (error) {
                console.error(`Event handler error for ${eventName}:`, error);
            }
        });
    }
    
    /**
     * イベントリスナーの追加
     */
    on(eventName, handler) {
        if(!this.eventHandlers.has(eventName) {
    }
            this.eventHandlers.set(eventName, []); }
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
    }
                handlers.splice(index, 1); }
}
    }
    
    /**
     * ダッシュボードの破棄
     */
    destroy() {
        this.stopAutoUpdate();
        this.widgets.clear();

        this.layoutCache.clear();

    }

        this.eventHandlers.clear(') }'