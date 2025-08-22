/**
 * Chart.jsを使用したグラフ描画システム
 * 線グラフ、棒グラフ、円グラフの基本テンプレートとリアルタイムグラフ更新機能
 */

// Chart interfaces and types
export interface ChartRendererOptions {
    enableResponsive?: boolean;
    defaultWidth?: number;
    defaultHeight?: number;
    animationDuration?: number;
    updateInterval?: number;
    maxDataPoints?: number;
    theme?: 'default' | 'dark' | 'light';
    locale?: string;
}

export interface ThemeConfig {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    gridColor: string;
}

export interface ChartConfig {
    label?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    showLegend?: boolean;
    showTooltip?: boolean;
    legendPosition?: 'top' | 'bottom' | 'left' | 'right';
    dataCount?: number;
    chartOptions?: any;
    type?: string;
}

export interface ChartDataUpdate {
    labels?: string[];
    data?: number[];
    datasets?: any[];
}

export interface ChartStatistics {
    totalCharts: number;
    activeRealtimeCharts: number;
    chartTypes: Record<string, number>;
    memoryUsage: MemoryUsage;
}

export interface MemoryUsage {
    estimatedDataPoints: number;
    estimatedMemoryKB: number;
}

export type DataSourceCallback = () => ChartDataUpdate | null;

// Declare Chart.js global interface
declare global {
    interface Window {
        Chart: any;
    }
    var Chart: any;
}

export class AnalyticsChartRenderer {
    private options: Required<ChartRendererOptions>;
    private charts: Map<string, any>;
    private chartConfigs: Map<string, ChartConfig & { type: string }>;
    private updateTimers: Map<string, number>;
    private dataSourceCallbacks: Map<string, DataSourceCallback>;
    private Chart: any;
    private currentTheme: ThemeConfig;
    private useCanvasFallback: boolean;

    constructor(options: ChartRendererOptions = {}) {
        this.options = {
            enableResponsive: true,
            defaultWidth: 400,
            defaultHeight: 300,
            animationDuration: 750,
            updateInterval: 1000, // リアルタイム更新間隔（1秒）
            maxDataPoints: 50, // 表示する最大データポイント数
            theme: 'default', // default, dark, light
            locale: 'ja-JP',
            ...options
        };

        this.charts = new Map();
        this.chartConfigs = new Map();
        this.updateTimers = new Map();
        this.dataSourceCallbacks = new Map();
        this.useCanvasFallback = false;
        this.currentTheme = {
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            textColor: '#333333',
            gridColor: 'rgba(0, 0, 0, 0.1)'
        };

        this.initialize();
    }

    /**
     * 初期化
     */
    private initialize(): void {
        // Chart.jsの動的読み込み
        this.loadChartJS()
            .then(() => {
                console.log('Chart.js loaded successfully');
                this.setupChartDefaults();
            })
            .catch(error => {
                console.error('Failed to load Chart.js:', error);
                this.fallbackToCanvasRenderer();
            });
    }

    /**
     * Chart.jsの動的読み込み
     */
    private async loadChartJS(): Promise<void> {
        // CDNからChart.jsを読み込み
        return new Promise((resolve, reject) => {
            if (typeof Chart !== 'undefined') {
                this.Chart = Chart;
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
            script.onload = () => {
                this.Chart = window.Chart;
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Chart.jsのデフォルト設定
     */
    private setupChartDefaults(): void {
        if (!this.Chart) return;

        // デフォルトフォント設定
        this.Chart.defaults.font.family = '"Helvetica Neue", "Arial", sans-serif';
        this.Chart.defaults.font.size = 12;
        
        // レスポンシブ設定
        this.Chart.defaults.responsive = this.options.enableResponsive;
        this.Chart.defaults.maintainAspectRatio = false;
        
        // アニメーション設定
        this.Chart.defaults.animation.duration = this.options.animationDuration;
        
        // テーマに基づく色設定
        this.applyTheme(this.options.theme);
    }

    /**
     * テーマの適用
     */
    private applyTheme(theme: 'default' | 'dark' | 'light'): void {
        if (!this.Chart) return;

        const themes: Record<string, ThemeConfig> = {
            default: {
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                textColor: '#333333',
                gridColor: 'rgba(0, 0, 0, 0.1)'
            },
            dark: {
                backgroundColor: 'rgba(154, 205, 50, 0.2)',
                borderColor: 'rgba(154, 205, 50, 1)',
                textColor: '#ffffff',
                gridColor: 'rgba(255, 255, 255, 0.2)'
            },
            light: {
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                textColor: '#000000',
                gridColor: 'rgba(0, 0, 0, 0.05)'
            }
        };

        this.currentTheme = themes[theme] || themes.default;
        
        // グローバルデフォルト色の設定
        if (this.Chart.defaults.color) {
            this.Chart.defaults.color = this.currentTheme.textColor;
        }
    }

    /**
     * 線グラフの作成
     */
    createLineChart(canvasId: string, config: ChartConfig = {}): any | null {
        const canvas = this.getCanvas(canvasId);
        if (!canvas || !this.Chart) return null;

        const defaultConfig = {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: config.label || 'データ',
                    data: [],
                    backgroundColor: this.currentTheme.backgroundColor,
                    borderColor: this.currentTheme.borderColor,
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1
                }]
            },
            options: {
                responsive: this.options.enableResponsive,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: config.xAxisLabel || 'X軸'
                        },
                        grid: {
                            color: this.currentTheme.gridColor
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: config.yAxisLabel || 'Y軸'
                        },
                        grid: {
                            color: this.currentTheme.gridColor
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: config.showLegend !== false
                    },
                    tooltip: {
                        enabled: config.showTooltip !== false
                    }
                },
                ...config.chartOptions
            }
        };

        const chart = new this.Chart(canvas.getContext('2d'), defaultConfig);
        this.charts.set(canvasId, chart);
        this.chartConfigs.set(canvasId, { ...config, type: 'line' });

        return chart;
    }

    /**
     * 棒グラフの作成
     */
    createBarChart(canvasId: string, config: ChartConfig = {}): any | null {
        const canvas = this.getCanvas(canvasId);
        if (!canvas || !this.Chart) return null;

        const defaultConfig = {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: config.label || 'データ',
                    data: [],
                    backgroundColor: this.generateColorPalette(config.dataCount || 10, 0.6),
                    borderColor: this.generateColorPalette(config.dataCount || 10, 1),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: this.options.enableResponsive,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: config.xAxisLabel || 'カテゴリ'
                        },
                        grid: {
                            color: this.currentTheme.gridColor
                        }
                    },
                    y: {
                        display: true,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: config.yAxisLabel || '値'
                        },
                        grid: {
                            color: this.currentTheme.gridColor
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: config.showLegend !== false
                    },
                    tooltip: {
                        enabled: config.showTooltip !== false
                    }
                },
                ...config.chartOptions
            }
        };

        const chart = new this.Chart(canvas.getContext('2d'), defaultConfig);
        this.charts.set(canvasId, chart);
        this.chartConfigs.set(canvasId, { ...config, type: 'bar' });

        return chart;
    }

    /**
     * 円グラフの作成
     */
    createPieChart(canvasId: string, config: ChartConfig = {}): any | null {
        const canvas = this.getCanvas(canvasId);
        if (!canvas || !this.Chart) return null;

        const defaultConfig = {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    label: config.label || 'データ',
                    data: [],
                    backgroundColor: this.generateColorPalette(config.dataCount || 8, 0.8),
                    borderColor: this.generateColorPalette(config.dataCount || 8, 1),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: this.options.enableResponsive,
                plugins: {
                    legend: {
                        display: config.showLegend !== false,
                        position: config.legendPosition || 'right'
                    },
                    tooltip: {
                        enabled: config.showTooltip !== false,
                        callbacks: {
                            label(context: any) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                ...config.chartOptions
            }
        };

        const chart = new this.Chart(canvas.getContext('2d'), defaultConfig);
        this.charts.set(canvasId, chart);
        this.chartConfigs.set(canvasId, { ...config, type: 'pie' });

        return chart;
    }

    /**
     * ドーナツグラフの作成
     */
    createDoughnutChart(canvasId: string, config: ChartConfig = {}): any | null {
        const pieConfig = { ...config, type: 'doughnut' };
        const chart = this.createPieChart(canvasId, pieConfig);

        if (chart) {
            chart.config.type = 'doughnut';
            this.chartConfigs.set(canvasId, { ...config, type: 'doughnut' });
        }

        return chart;
    }

    /**
     * チャートデータの更新
     */
    updateChartData(canvasId: string, newData: ChartDataUpdate): boolean {
        const chart = this.charts.get(canvasId);
        if (!chart) return false;

        try {
            if (Array.isArray(newData.labels)) {
                chart.data.labels = newData.labels;
            }

            if (Array.isArray(newData.datasets)) {
                newData.datasets.forEach((newDataset, index) => {
                    if (chart.data.datasets[index]) {
                        Object.assign(chart.data.datasets[index], newDataset);
                    } else {
                        chart.data.datasets.push(newDataset);
                    }
                });
            } else if (Array.isArray(newData.data)) {
                // 単一データセットの場合
                if (chart.data.datasets[0]) {
                    chart.data.datasets[0].data = newData.data;
                }
            }

            // データポイント数制限
            this.limitDataPoints(chart);

            chart.update('none'); // アニメーションなしで更新
            return true;
        } catch (error) {
            console.error('Chart update failed:', error);
            return false;
        }
    }

    /**
     * リアルタイム更新の開始
     */
    startRealtimeUpdate(canvasId: string, dataSourceCallback: DataSourceCallback, interval?: number): void {
        this.stopRealtimeUpdate(canvasId); // 既存のタイマーをクリア

        const updateInterval = interval || this.options.updateInterval;
        this.dataSourceCallbacks.set(canvasId, dataSourceCallback);

        const timer = window.setInterval(() => {
            try {
                const newData = dataSourceCallback();
                if (newData) {
                    this.updateChartData(canvasId, newData);
                }
            } catch (error) {
                console.error('Realtime update failed:', error);
                this.stopRealtimeUpdate(canvasId);
            }
        }, updateInterval);

        this.updateTimers.set(canvasId, timer);
    }

    /**
     * リアルタイム更新の停止
     */
    stopRealtimeUpdate(canvasId: string): void {
        const timer = this.updateTimers.get(canvasId);
        if (timer) {
            clearInterval(timer);
            this.updateTimers.delete(canvasId);
        }
        this.dataSourceCallbacks.delete(canvasId);
    }

    /**
     * データポイント数の制限
     */
    private limitDataPoints(chart: any): void {
        const maxPoints = this.options.maxDataPoints;
        
        if (chart.data.labels.length > maxPoints) {
            chart.data.labels = chart.data.labels.slice(-maxPoints);
        }

        chart.data.datasets.forEach((dataset: any) => {
            if (dataset.data.length > maxPoints) {
                dataset.data = dataset.data.slice(-maxPoints);
            }
        });
    }

    /**
     * カラーパレットの生成
     */
    private generateColorPalette(count: number, alpha: number = 1): string[] {
        const colors: string[] = [];
        const hueStep = 360 / count;

        for (let i = 0; i < count; i++) {
            const hue = i * hueStep;
            const saturation = 70 + (i % 3) * 10; // 70-90%
            const lightness = 45 + (i % 2) * 10; // 45-55%

            colors.push(`hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`);
        }

        return colors;
    }

    /**
     * キャンバス要素の取得または作成
     */
    private getCanvas(canvasId: string): HTMLCanvasElement | null {
        let canvas = document.getElementById(canvasId) as HTMLCanvasElement;

        if (!canvas) {
            // キャンバスが存在しない場合は作成
            canvas = document.createElement('canvas');
            canvas.id = canvasId;
            canvas.width = this.options.defaultWidth;
            canvas.height = this.options.defaultHeight;
            
            // 適切な親要素に追加（存在する場合）
            const container = document.getElementById(`${canvasId}-container`) || document.body;
            container.appendChild(canvas);
        }

        return canvas;
    }

    /**
     * チャートの削除
     */
    destroyChart(canvasId: string): void {
        this.stopRealtimeUpdate(canvasId);
        
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.destroy();
            this.charts.delete(canvasId);
        }
        
        this.chartConfigs.delete(canvasId);
    }

    /**
     * Canvas APIによるフォールバック描画
     */
    private fallbackToCanvasRenderer(): void {
        console.warn('Chart.js not available, using Canvas API fallback');
        this.useCanvasFallback = true;
    }

    /**
     * Canvas APIを使用した簡単な線グラフの描画（フォールバック）
     */
    drawSimpleLineChart(canvasId: string, data: ChartDataUpdate, config: ChartConfig = {}): boolean {
        if (!this.useCanvasFallback) return false;

        const canvas = this.getCanvas(canvasId);
        if (!canvas) return false;

        const ctx = canvas.getContext('2d');
        if (!ctx) return false;
        
        // キャンバスをクリア
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (!data.data || data.data.length === 0) return false;

        const padding = 40;
        const width = canvas.width - 2 * padding;
        const height = canvas.height - 2 * padding;
        
        const minValue = Math.min(...data.data);
        const maxValue = Math.max(...data.data);
        const valueRange = maxValue - minValue || 1;

        // 軸の描画
        ctx.strokeStyle = this.currentTheme.gridColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, padding + height);
        ctx.lineTo(padding + width, padding + height);
        ctx.stroke();

        // データ線の描画
        ctx.strokeStyle = this.currentTheme.borderColor;
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.data.forEach((value, index) => {
            const x = padding + (index / (data.data!.length - 1)) * width;
            const y = padding + height - ((value - minValue) / valueRange) * height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // データポイントの描画
        ctx.fillStyle = this.currentTheme.borderColor;
        data.data.forEach((value, index) => {
            const x = padding + (index / (data.data!.length - 1)) * width;
            const y = padding + height - ((value - minValue) / valueRange) * height;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });

        return true;
    }

    /**
     * 全チャートの更新
     */
    updateAllCharts(): void {
        for (const [canvasId, callback] of this.dataSourceCallbacks) {
            try {
                const newData = callback();
                if (newData) {
                    this.updateChartData(canvasId, newData);
                }
            } catch (error) {
                console.error(`Failed to update chart ${canvasId}:`, error);
            }
        }
    }

    /**
     * チャート統計の取得
     */
    getChartStatistics(): ChartStatistics {
        return {
            totalCharts: this.charts.size,
            activeRealtimeCharts: this.updateTimers.size,
            chartTypes: [...this.chartConfigs.values()].reduce((acc: Record<string, number>, config) => {
                acc[config.type] = (acc[config.type] || 0) + 1;
                return acc;
            }, {}),
            memoryUsage: this.estimateMemoryUsage()
        };
    }

    /**
     * メモリ使用量の推定
     */
    private estimateMemoryUsage(): MemoryUsage {
        let totalDataPoints = 0;
        
        this.charts.forEach(chart => {
            if (chart.data && chart.data.datasets) {
                chart.data.datasets.forEach((dataset: any) => {
                    totalDataPoints += (dataset.data || []).length;
                });
            }
        });

        return {
            estimatedDataPoints: totalDataPoints,
            estimatedMemoryKB: Math.round(totalDataPoints * 0.1) // 1データポイント約100バイトと仮定
        };
    }

    /**
     * リソースの解放
     */
    destroy(): void {
        // 全てのリアルタイム更新を停止
        for (const canvasId of this.updateTimers.keys()) {
            this.stopRealtimeUpdate(canvasId);
        }

        // 全てのチャートを削除
        for (const canvasId of this.charts.keys()) {
            this.destroyChart(canvasId);
        }

        this.charts.clear();
        this.chartConfigs.clear();
        this.updateTimers.clear();
        this.dataSourceCallbacks.clear();
        
        console.log('ChartRenderer destroyed');
    }
}