/**
 * DashboardWidgetRenderer
 * 統計ダッシュボードの全ウィジェット実装と描画を担当
 */
export class DashboardWidgetRenderer {
    constructor() {
        this.widgetClasses = {
            keyMetrics: KeyMetricsWidget,
            recentAchievements: RecentAchievementsWidget,
            growthTrends: GrowthTrendsWidget,
            playStyle: PlayStyleWidget,
            performanceChart: PerformanceChartWidget,
            statisticsBreakdown: StatisticsBreakdownWidget
        };
    }

    /**
     * ウィジェットを作成
     * @param {string} type ウィジェットタイプ
     * @param {Object} statisticsManager 統計マネージャー
     * @param {Object} chartRenderer チャートレンダラー
     * @returns {Object} ウィジェットインスタンス
     */
    createWidget(type, statisticsManager, chartRenderer) {
        const WidgetClass = this.widgetClasses[type];
        if (!WidgetClass) {
            throw new Error(`Unknown widget type: ${type}`);
        }

        // チャートレンダラーが必要なウィジェット
        const needsChartRenderer = ['growthTrends', 'playStyle', 'performanceChart', 'statisticsBreakdown'];
        
        if (needsChartRenderer.includes(type)) {
            return new WidgetClass(statisticsManager, chartRenderer);
        } else {
            return new WidgetClass(statisticsManager);
        }
    }

    /**
     * サポートされているウィジェットタイプを取得
     * @returns {Array} ウィジェットタイプ配列
     */
    getSupportedWidgetTypes() {
        return Object.keys(this.widgetClasses);
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