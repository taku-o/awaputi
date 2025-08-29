/**
 * 分析ダッシュボード
 * データ可視化のメインインターフェース
 */

import { AnalyticsChartRenderer } from './ChartRenderer.js';
import { DataVisualizer } from './DataVisualizer.js';

export class AnalyticsDashboard {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            enableRealtime: true,
            updateInterval: 5000, // 5秒間隔
            theme: 'default',
            layout: 'grid', // grid, flex, masonry
            showDataCollectingMessage: true,
            minDataPoints: 5, // データ不足判定の閾値
            chartDefaults: {
                width: 350,
                height: 250,
                enableAnimation: true,
                enableTooltips: true
            },
            ...options
        };

        this.container = null;
        this.chartRenderer = null;
        this.dataVisualizer = null;
        this.sections = new Map(); // ダッシュボードセクション
        this.activeCharts = new Map(); // アクティブなチャート
        this.dataCallbacks = new Map(); // データ取得コールバック
        this.realtimeTimers = new Map(); // リアルタイム更新タイマー

        this.initialize();
    }

    /**
     * 初期化
     */
    initialize() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            console.error(`Container element with ID '${this.containerId}' not found`);
            return;
        }

        // Chart.jsとD3.jsレンダラーの初期化
        this.chartRenderer = new AnalyticsChartRenderer({
            theme: this.options.theme,
            defaultWidth: this.options.chartDefaults.width,
            defaultHeight: this.options.chartDefaults.height,
            animationDuration: this.options.chartDefaults.enableAnimation ? 750 : 0
        });

        this.dataVisualizer = new DataVisualizer({
            enableInteractivity: true,
            enableAnimation: this.options.chartDefaults.enableAnimation,
            defaultWidth: this.options.chartDefaults.width,
            defaultHeight: this.options.chartDefaults.height
        });

        this.setupContainer();
        this.createLayout();
        
        console.log('Analytics Dashboard initialized');
    }

    /**
     * コンテナの設定
     */
    setupContainer() {
        this.container.className = `analytics-dashboard ${this.options.layout}-layout`;
        this.container.innerHTML = '';

        // ダッシュボードのCSS
        this.injectStyles();
    }

    /**
     * レイアウトの作成
     */
    createLayout() {
        // ヘッダー
        const header = this.createElement('div', 'dashboard-header');
        header.innerHTML = `
            <h2>ゲーム分析ダッシュボード</h2>
            <div class="dashboard-controls">
                <button id="refresh-dashboard" class="btn">更新</button>
                <button id="export-data" class="btn">データエクスポート</button>
                <select id="time-range" class="select">
                    <option value="1h">過去1時間</option>
                    <option value="24h" selected>過去24時間</option>
                    <option value="7d">過去7日</option>
                    <option value="30d">過去30日</option>
                </select>
            </div>
        `;
        this.container.appendChild(header);

        // メインコンテンツエリア
        const mainContent = this.createElement('div', 'dashboard-main');
        this.container.appendChild(mainContent);

        // セクション作成
        this.createSection('basic-stats', 'プレイ統計', mainContent);
        this.createSection('bubble-analysis', 'バブル分析', mainContent);
        this.createSection('performance-metrics', 'パフォーマンス指標', mainContent);

        // イベントリスナーの設定
        this.setupEventListeners();
    }

    /**
     * セクションの作成
     */
    createSection(sectionId, title, parent) {
        const sectionContainer = this.createElement('div', 'dashboard-section');
        sectionContainer.id = `section-${sectionId}`;

        const sectionHeader = this.createElement('div', 'section-header');
        sectionHeader.innerHTML = `
            <h3>${title}</h3>
            <div class="section-controls">
                <button class="btn-small toggle-section" data-section="${sectionId}">最小化</button>
            </div>
        `;

        const sectionContent = this.createElement('div', 'section-content');
        sectionContent.id = `content-${sectionId}`;

        sectionContainer.appendChild(sectionHeader);
        sectionContainer.appendChild(sectionContent);
        parent.appendChild(sectionContainer);

        this.sections.set(sectionId, {
            container: sectionContainer,
            content: sectionContent,
            title: title,
            charts: new Map()
        });

        return sectionContent;
    }

    /**
     * 基本統計表示の実装
     */
    setupBasicStatistics(dataCallback) {
        const section = this.sections.get('basic-stats');
        if (!section) return;

        const content = section.content;
        
        // データ不足チェック
        const data = dataCallback();
        if (this.isDataInsufficient(data)) {
            this.showDataCollectingMessage(content, 'basic-stats');
            return;
        }

        // チャートコンテナの作成
        const chartsContainer = this.createElement('div', 'charts-grid');
        content.appendChild(chartsContainer);

        // プレイ時間チャート
        this.createPlayTimeChart(chartsContainer, data);
        
        // スコア分布チャート
        this.createScoreDistributionChart(chartsContainer, data);
        
        // 成功率チャート
        this.createSuccessRateChart(chartsContainer, data);

        // データコールバックを登録
        this.dataCallbacks.set('basic-stats', dataCallback);

        // リアルタイム更新の開始
        if (this.options.enableRealtime) {
            this.startRealtimeUpdate('basic-stats');
        }
    }

    /**
     * プレイ時間チャートの作成
     */
    createPlayTimeChart(container, data) {
        const chartContainer = this.createChartContainer('playtime-chart', 'プレイ時間推移', container);
        
        if (data.playtime && data.playtime.length > 0) {
            const chart = this.chartRenderer.createLineChart('playtime-chart-canvas', {
                label: 'プレイ時間（分）',
                xAxisLabel: '日付',
                yAxisLabel: 'プレイ時間（分）',
                showLegend: false
            });

            // データ更新
            this.chartRenderer.updateChartData('playtime-chart-canvas', {
                labels: data.playtime.map(d => d.date),
                data: data.playtime.map(d => d.minutes)
            });

            this.activeCharts.set('playtime-chart', chart);
        } else {
            this.showNoDataMessage(chartContainer);
        }
    }

    /**
     * スコア分布チャートの作成
     */
    createScoreDistributionChart(container, data) {
        const chartContainer = this.createChartContainer('score-distribution-chart', 'スコア分布', container);
        
        if (data.scoreDistribution && data.scoreDistribution.length > 0) {
            const chart = this.chartRenderer.createBarChart('score-distribution-chart-canvas', {
                label: 'ゲーム数',
                xAxisLabel: 'スコア範囲',
                yAxisLabel: 'ゲーム数',
                showLegend: false
            });

            this.chartRenderer.updateChartData('score-distribution-chart-canvas', {
                labels: data.scoreDistribution.map(d => d.range),
                data: data.scoreDistribution.map(d => d.count)
            });

            this.activeCharts.set('score-distribution-chart', chart);
        } else {
            this.showNoDataMessage(chartContainer);
        }
    }

    /**
     * 成功率チャートの作成
     */
    createSuccessRateChart(container, data) {
        const chartContainer = this.createChartContainer('success-rate-chart', '成功率', container);
        
        if (data.successRate !== undefined) {
            const chart = this.chartRenderer.createDoughnutChart('success-rate-chart-canvas', {
                label: '成功率',
                showLegend: true,
                legendPosition: 'right'
            });

            this.chartRenderer.updateChartData('success-rate-chart-canvas', {
                labels: ['成功', '失敗'],
                data: [data.successRate, 100 - data.successRate]
            });

            this.activeCharts.set('success-rate-chart', chart);
        } else {
            this.showNoDataMessage(chartContainer);
        }
    }

    /**
     * バブルタイプ別分析表示の実装
     */
    setupBubbleAnalysis(dataCallback) {
        const section = this.sections.get('bubble-analysis');
        if (!section) return;

        const content = section.content;
        const data = dataCallback();

        if (this.isDataInsufficient(data, 'bubbleStats')) {
            this.showDataCollectingMessage(content, 'bubble-analysis');
            return;
        }

        const chartsContainer = this.createElement('div', 'charts-grid');
        content.appendChild(chartsContainer);

        // バブル成功率円グラフ
        this.createBubbleSuccessRateChart(chartsContainer, data);
        
        // バブル出現頻度棒グラフ
        this.createBubbleFrequencyChart(chartsContainer, data);
        
        // バブル別スコア寄与棒グラフ
        this.createBubbleScoreContributionChart(chartsContainer, data);

        this.dataCallbacks.set('bubble-analysis', dataCallback);

        if (this.options.enableRealtime) {
            this.startRealtimeUpdate('bubble-analysis');
        }
    }

    /**
     * バブル成功率円グラフの作成
     */
    createBubbleSuccessRateChart(container, data) {
        const chartContainer = this.createChartContainer('bubble-success-rate-chart', 'バブル別成功率', container);
        
        if (data.bubbleStats && data.bubbleStats.length > 0) {
            const chart = this.chartRenderer.createPieChart('bubble-success-rate-chart-canvas', {
                label: '成功率',
                showLegend: true,
                legendPosition: 'right'
            });

            const successRateData = data.bubbleStats.map(bubble => ({
                label: bubble.type,
                value: bubble.successRate
            }));

            this.chartRenderer.updateChartData('bubble-success-rate-chart-canvas', {
                labels: successRateData.map(d => d.label),
                data: successRateData.map(d => d.value)
            });

            this.activeCharts.set('bubble-success-rate-chart', chart);
        } else {
            this.showNoDataMessage(chartContainer);
        }
    }

    /**
     * バブル出現頻度棒グラフの作成
     */
    createBubbleFrequencyChart(container, data) {
        const chartContainer = this.createChartContainer('bubble-frequency-chart', 'バブル出現頻度', container);
        
        if (data.bubbleStats && data.bubbleStats.length > 0) {
            const chart = this.chartRenderer.createBarChart('bubble-frequency-chart-canvas', {
                label: '出現回数',
                xAxisLabel: 'バブルタイプ',
                yAxisLabel: '出現回数',
                showLegend: false
            });

            this.chartRenderer.updateChartData('bubble-frequency-chart-canvas', {
                labels: data.bubbleStats.map(bubble => bubble.type),
                data: data.bubbleStats.map(bubble => bubble.frequency)
            });

            this.activeCharts.set('bubble-frequency-chart', chart);
        } else {
            this.showNoDataMessage(chartContainer);
        }
    }

    /**
     * バブル別スコア寄与棒グラフの作成
     */
    createBubbleScoreContributionChart(container, data) {
        const chartContainer = this.createChartContainer('bubble-score-contribution-chart', 'バブル別スコア寄与', container);
        
        if (data.bubbleStats && data.bubbleStats.length > 0) {
            const chart = this.chartRenderer.createBarChart('bubble-score-contribution-chart-canvas', {
                label: '平均獲得スコア',
                xAxisLabel: 'バブルタイプ',
                yAxisLabel: '平均獲得スコア',
                showLegend: false
            });

            this.chartRenderer.updateChartData('bubble-score-contribution-chart-canvas', {
                labels: data.bubbleStats.map(bubble => bubble.type),
                data: data.bubbleStats.map(bubble => bubble.avgScore)
            });

            this.activeCharts.set('bubble-score-contribution-chart', chart);
        } else {
            this.showNoDataMessage(chartContainer);
        }
    }

    /**
     * パフォーマンス指標表示の実装
     */
    setupPerformanceMetrics(dataCallback) {
        const section = this.sections.get('performance-metrics');
        if (!section) return;

        const content = section.content;
        const data = dataCallback();

        if (this.isDataInsufficient(data, 'performance')) {
            this.showDataCollectingMessage(content, 'performance-metrics');
            return;
        }

        const chartsContainer = this.createElement('div', 'charts-grid');
        content.appendChild(chartsContainer);

        // FPS推移チャート
        this.createFPSChart(chartsContainer, data);
        
        // メモリ使用量チャート
        this.createMemoryUsageChart(chartsContainer, data);

        this.dataCallbacks.set('performance-metrics', dataCallback);

        if (this.options.enableRealtime) {
            this.startRealtimeUpdate('performance-metrics');
        }
    }

    /**
     * FPS推移チャートの作成
     */
    createFPSChart(container, data) {
        const chartContainer = this.createChartContainer('fps-chart', 'FPS推移', container);
        
        if (data.performance && data.performance.fps && data.performance.fps.length > 0) {
            const chart = this.chartRenderer.createLineChart('fps-chart-canvas', {
                label: 'FPS',
                xAxisLabel: '時刻',
                yAxisLabel: 'フレーム/秒',
                showLegend: false
            });

            this.chartRenderer.updateChartData('fps-chart-canvas', {
                labels: data.performance.fps.map(d => new Date(d.timestamp).toLocaleTimeString()),
                data: data.performance.fps.map(d => d.fps)
            });

            this.activeCharts.set('fps-chart', chart);
        } else {
            this.showNoDataMessage(chartContainer);
        }
    }

    /**
     * メモリ使用量チャートの作成
     */
    createMemoryUsageChart(container, data) {
        const chartContainer = this.createChartContainer('memory-usage-chart', 'メモリ使用量推移', container);
        
        if (data.performance && data.performance.memory && data.performance.memory.length > 0) {
            const chart = this.chartRenderer.createLineChart('memory-usage-chart-canvas', {
                label: 'メモリ使用量（%）',
                xAxisLabel: '時刻',
                yAxisLabel: 'メモリ使用量（%）',
                showLegend: false
            });

            this.chartRenderer.updateChartData('memory-usage-chart-canvas', {
                labels: data.performance.memory.map(d => new Date(d.timestamp).toLocaleTimeString()),
                data: data.performance.memory.map(d => d.usagePercent)
            });

            this.activeCharts.set('memory-usage-chart', chart);
        } else {
            this.showNoDataMessage(chartContainer);
        }
    }

    /**
     * チャートコンテナの作成
     */
    createChartContainer(chartId, title, parent) {
        const container = this.createElement('div', 'chart-container');
        container.id = `container-${chartId}`;

        const header = this.createElement('div', 'chart-header');
        header.innerHTML = `<h4>${title}</h4>`;

        const canvasContainer = this.createElement('div', 'chart-canvas-container');
        const canvas = this.createElement('canvas', 'chart-canvas');
        canvas.id = `${chartId}-canvas`;
        canvas.width = this.options.chartDefaults.width;
        canvas.height = this.options.chartDefaults.height;

        canvasContainer.appendChild(canvas);
        container.appendChild(header);
        container.appendChild(canvasContainer);
        parent.appendChild(container);

        return container;
    }

    /**
     * データ不足の判定
     */
    isDataInsufficient(data, property = null) {
        if (!data) return true;
        
        if (property) {
            const targetData = data[property];
            if (!targetData) return true;
            if (Array.isArray(targetData) && targetData.length < this.options.minDataPoints) return true;
            return false;
        }

        // 全般的なデータ不足チェック
        const totalDataPoints = [
            data.playtime?.length || 0,
            data.scoreDistribution?.length || 0,
            data.bubbleStats?.length || 0,
            data.performance?.fps?.length || 0
        ].reduce((sum, count) => sum + count, 0);

        return totalDataPoints < this.options.minDataPoints;
    }

    /**
     * データ収集中メッセージの表示
     */
    showDataCollectingMessage(container, sectionId) {
        if (!this.options.showDataCollectingMessage) return;

        container.innerHTML = `
            <div class="data-collecting-message">
                <div class="collecting-icon">📊</div>
                <h3>データ収集中...</h3>
                <p>ゲームプレイデータを収集しています。</p>
                <p>分析結果を表示するには、${this.options.minDataPoints}回以上のゲームプレイが必要です。</p>
                <div class="progress-indicator">
                    <div class="progress-bar"></div>
                </div>
            </div>
        `;
    }

    /**
     * データなしメッセージの表示
     */
    showNoDataMessage(container) {
        const messageDiv = this.createElement('div', 'no-data-message');
        messageDiv.innerHTML = `
            <div class="no-data-icon">📈</div>
            <p>データがありません</p>
        `;
        container.appendChild(messageDiv);
    }

    /**
     * リアルタイム更新の開始
     */
    startRealtimeUpdate(sectionId) {
        if (this.realtimeTimers.has(sectionId)) {
            clearInterval(this.realtimeTimers.get(sectionId));
        }

        const timer = setInterval(() => {
            this.updateSection(sectionId);
        }, this.options.updateInterval);

        this.realtimeTimers.set(sectionId, timer);
    }

    /**
     * セクションの更新
     */
    updateSection(sectionId) {
        const dataCallback = this.dataCallbacks.get(sectionId);
        if (!dataCallback) return;

        try {
            const newData = dataCallback();
            
            switch (sectionId) {
                case 'basic-stats':
                    this.updateBasicStatistics(newData);
                    break;
                case 'bubble-analysis':
                    this.updateBubbleAnalysis(newData);
                    break;
                case 'performance-metrics':
                    this.updatePerformanceMetrics(newData);
                    break;
            }
        } catch (error) {
            console.error(`Failed to update section ${sectionId}:`, error);
        }
    }

    /**
     * 基本統計の更新
     */
    updateBasicStatistics(data) {
        if (this.activeCharts.has('playtime-chart') && data.playtime) {
            this.chartRenderer.updateChartData('playtime-chart-canvas', {
                labels: data.playtime.map(d => d.date),
                data: data.playtime.map(d => d.minutes)
            });
        }

        if (this.activeCharts.has('score-distribution-chart') && data.scoreDistribution) {
            this.chartRenderer.updateChartData('score-distribution-chart-canvas', {
                labels: data.scoreDistribution.map(d => d.range),
                data: data.scoreDistribution.map(d => d.count)
            });
        }

        if (this.activeCharts.has('success-rate-chart') && data.successRate !== undefined) {
            this.chartRenderer.updateChartData('success-rate-chart-canvas', {
                labels: ['成功', '失敗'],
                data: [data.successRate, 100 - data.successRate]
            });
        }
    }

    /**
     * バブル分析の更新
     */
    updateBubbleAnalysis(data) {
        if (!data.bubbleStats) return;

        if (this.activeCharts.has('bubble-success-rate-chart')) {
            const successRateData = data.bubbleStats.map(bubble => ({
                label: bubble.type,
                value: bubble.successRate
            }));

            this.chartRenderer.updateChartData('bubble-success-rate-chart-canvas', {
                labels: successRateData.map(d => d.label),
                data: successRateData.map(d => d.value)
            });
        }

        if (this.activeCharts.has('bubble-frequency-chart')) {
            this.chartRenderer.updateChartData('bubble-frequency-chart-canvas', {
                labels: data.bubbleStats.map(bubble => bubble.type),
                data: data.bubbleStats.map(bubble => bubble.frequency)
            });
        }

        if (this.activeCharts.has('bubble-score-contribution-chart')) {
            this.chartRenderer.updateChartData('bubble-score-contribution-chart-canvas', {
                labels: data.bubbleStats.map(bubble => bubble.type),
                data: data.bubbleStats.map(bubble => bubble.avgScore)
            });
        }
    }

    /**
     * パフォーマンス指標の更新
     */
    updatePerformanceMetrics(data) {
        if (!data.performance) return;

        if (this.activeCharts.has('fps-chart') && data.performance.fps) {
            this.chartRenderer.updateChartData('fps-chart-canvas', {
                labels: data.performance.fps.map(d => new Date(d.timestamp).toLocaleTimeString()),
                data: data.performance.fps.map(d => d.fps)
            });
        }

        if (this.activeCharts.has('memory-usage-chart') && data.performance.memory) {
            this.chartRenderer.updateChartData('memory-usage-chart-canvas', {
                labels: data.performance.memory.map(d => new Date(d.timestamp).toLocaleTimeString()),
                data: data.performance.memory.map(d => d.usagePercent)
            });
        }
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // 更新ボタン
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }

        // エクスポートボタン
        const exportBtn = document.getElementById('export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        // 時間範囲選択
        const timeRangeSelect = document.getElementById('time-range');
        if (timeRangeSelect) {
            timeRangeSelect.addEventListener('change', (e) => this.changeTimeRange(e.target.value));
        }

        // セクション最小化/最大化
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('toggle-section')) {
                const sectionId = e.target.dataset.section;
                this.toggleSection(sectionId);
            }
        });
    }

    /**
     * ダッシュボードの手動更新
     */
    refresh() {
        console.log('Refreshing dashboard...');
        
        for (const sectionId of this.dataCallbacks.keys()) {
            this.updateSection(sectionId);
        }
    }

    /**
     * データエクスポート
     */
    exportData() {
        const exportData = {
            timestamp: new Date().toISOString(),
            sections: {}
        };

        for (const [sectionId, callback] of this.dataCallbacks) {
            try {
                exportData.sections[sectionId] = callback();
            } catch (error) {
                console.error(`Failed to export data for section ${sectionId}:`, error);
                exportData.sections[sectionId] = { error: error.message };
            }
        }

        // JSON形式でダウンロード
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `game-analytics-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('Dashboard data exported');
    }

    /**
     * 時間範囲の変更
     */
    changeTimeRange(timeRange) {
        console.log(`Time range changed to: ${timeRange}`);
        this.currentTimeRange = timeRange;
        this.refresh();
    }

    /**
     * セクションの最小化/最大化
     */
    toggleSection(sectionId) {
        const section = this.sections.get(sectionId);
        if (!section) return;

        const content = section.content;
        const toggleBtn = section.container.querySelector('.toggle-section');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            toggleBtn.textContent = '最小化';
        } else {
            content.style.display = 'none';
            toggleBtn.textContent = '展開';
        }
    }

    /**
     * DOM要素の作成ヘルパー
     */
    createElement(tag, className = '') {
        const element = document.createElement(tag);
        if (className) {
            element.className = className;
        }
        return element;
    }

    /**
     * スタイルの注入
     */
    injectStyles() {
        if (document.getElementById('analytics-dashboard-styles')) return;

        const styles = `
            .analytics-dashboard {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #f5f5f5;
                min-height: 100vh;
                padding: 20px;
            }

            .dashboard-header {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                margin-bottom: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .dashboard-header h2 {
                margin: 0;
                color: #333;
            }

            .dashboard-controls {
                display: flex;
                gap: 10px;
                align-items: center;
            }

            .btn, .btn-small {
                background: #007bff;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }

            .btn-small {
                padding: 4px 8px;
                font-size: 12px;
            }

            .btn:hover, .btn-small:hover {
                background: #0056b3;
            }

            .select {
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }

            .dashboard-section {
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                margin-bottom: 20px;
                overflow: hidden;
            }

            .section-header {
                padding: 15px 20px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #fafafa;
            }

            .section-header h3 {
                margin: 0;
                color: #333;
            }

            .section-content {
                padding: 20px;
            }

            .charts-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 20px;
            }

            .chart-container {
                border: 1px solid #eee;
                border-radius: 6px;
                padding: 15px;
                background: #fafafa;
            }

            .chart-header {
                margin-bottom: 10px;
            }

            .chart-header h4 {
                margin: 0;
                color: #555;
                font-size: 14px;
            }

            .chart-canvas-container {
                position: relative;
                height: 250px;
                background: white;
                border-radius: 4px;
            }

            .chart-canvas {
                max-width: 100%;
                max-height: 100%;
            }

            .data-collecting-message {
                text-align: center;
                padding: 40px 20px;
                color: #666;
            }

            .collecting-icon {
                font-size: 48px;
                margin-bottom: 20px;
            }

            .data-collecting-message h3 {
                margin: 0 0 10px 0;
                color: #333;
            }

            .progress-indicator {
                margin-top: 20px;
                background: #eee;
                border-radius: 10px;
                height: 8px;
                overflow: hidden;
            }

            .progress-bar {
                background: #007bff;
                height: 100%;
                width: 30%;
                animation: progress-animation 2s ease-in-out infinite;
            }

            @keyframes progress-animation {
                0%, 100% { width: 30%; }
                50% { width: 70%; }
            }

            .no-data-message {
                text-align: center;
                padding: 20px;
                color: #999;
            }

            .no-data-icon {
                font-size: 24px;
                margin-bottom: 10px;
            }

            @media (max-width: 768px) {
                .dashboard-header {
                    flex-direction: column;
                    gap: 15px;
                }

                .charts-grid {
                    grid-template-columns: 1fr;
                }

                .analytics-dashboard {
                    padding: 10px;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'analytics-dashboard-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    /**
     * ダッシュボード統計の取得
     */
    getDashboardStatistics() {
        return {
            totalSections: this.sections.size,
            activeCharts: this.activeCharts.size,
            realtimeUpdates: this.realtimeTimers.size,
            dataCallbacks: this.dataCallbacks.size,
            theme: this.options.theme,
            updateInterval: this.options.updateInterval
        };
    }

    /**
     * リソースの解放
     */
    destroy() {
        // リアルタイム更新タイマーの停止
        for (const timer of this.realtimeTimers.values()) {
            clearInterval(timer);
        }
        this.realtimeTimers.clear();

        // チャートの削除
        if (this.chartRenderer) {
            this.chartRenderer.destroy();
        }
        if (this.dataVisualizer) {
            this.dataVisualizer.destroy();
        }

        // コンテナのクリア
        if (this.container) {
            this.container.innerHTML = '';
        }

        // スタイルの削除
        const styleSheet = document.getElementById('analytics-dashboard-styles');
        if (styleSheet) {
            styleSheet.remove();
        }

        this.sections.clear();
        this.activeCharts.clear();
        this.dataCallbacks.clear();

        console.log('Analytics Dashboard destroyed');
    }
}