/**
 * 時系列データの可視化システム
 * プレイヤーのパフォーマンス推移を線グラフで表示し、複数指標の同時表示やズーム機能を提供します
 */
export class TimeSeriesVisualizer {
    constructor(chartRenderer, trendAnalyzer) {
        this.chartRenderer = chartRenderer;
        this.trendAnalyzer = trendAnalyzer;
        
        // チャート設定
        this.chartConfigs = {
            default: {
                responsive: true;
                maintainAspectRatio: false,
    interaction: {
                    mode: 'index';
    ,}
                    intersect: false; 
    },
                plugins: { title: {'
                        display: true,
                        text: 'パフォーマンス推移' ,};
                    legend: { ''
                        position: 'top' };
                    tooltip: { ''
                        mode: 'index',
    intersect: false,
                        callbacks: {''
                            title(context) { ,}
                                return `期間: ${context[0].label}`;,
                    zoom: { zoom: {
                            wheel: {
                                enabled: true };
                            pinch: { enabled: true 
    },''
                            mode: 'x';
                        },

                        pan: { enabled: true,''
                            mode: 'x' ,}
};
                scales: { x: {
                        display: true,
    title: {'
                            display: true,
                            text: '期間' ,}
                    };
                    y: { display: true,
    title: {'
                            display: true,
                            text: '値' ,}
}
            }
        };
        // データセット色設定
        this.colors = {;
            score: '#4F46E5',
            accuracy: '#10B981',
            playTime: '#F59E0B',
            combo: '#EF4444',
            completionRate: '#8B5CF6',
            trend: '#6B7280' ,};
        // アクティブなチャート管理
        this.activeCharts = new Map();
    }

    /**
     * 単一指標の時系列グラフを作成
     * @param {HTMLCanvasElement} canvas - 描画対象のCanvas要素
     * @param {Array} timeSeriesData - 時系列データ
     * @param {string} metric - 表示する指標
     * @param {Object} options - 表示オプション
     * @returns {Object} Chart.jsのチャートインスタンス
     */
    createSingleMetricChart(canvas, timeSeriesData, metric, options: any = {}) {
        
    }
        const {' }'

            title = `${this.getMetricDisplayName(metric'}'の推移`,
            showTrend = true,
            showSeasonalAdjusted = false,
            period = 'weekly';
        } = options;

        // データ準備
        const labels = timeSeriesData.map(d => d.period);
        const values = timeSeriesData.map(d => this.getMetricValue(d, metric);
        ';

        const datasets = [{ ''
            label: this.getMetricDisplayName(metric)],
    data: values,]';
            borderColor: this.colors[metric] || this.colors.score,
            backgroundColor: this.colors[metric] + '20' || this.colors.score + '20';
            fill: false,
    tension: 0.4 ,}];
        // トレンドライン追加
        if(showTrend && values.length > 2) { const trendData = this.calculateTrendLine(values);

            datasets.push({''
                label: 'トレンド',
    data: trendData,
                borderColor: this.colors.trend,
                backgroundColor: 'transparent',
    borderDash: [5, 5]);
                fill: false),
    pointRadius: 0, }
                tension: 0); 
    }

        // 季節調整済みデータ追加
        if(showSeasonalAdjusted && timeSeriesData[0].seasonallyAdjusted !== undefined) {
            const adjustedValues = timeSeriesData.map(d => d.seasonallyAdjusted);
        }
            datasets.push({);' }'

                label: `${this.getMetricDisplayName(metric}) (季節調整済み')`;
                data: adjustedValues,
                borderColor: this.colors[metric] + 'AA' || this.colors.score + 'AA',
                backgroundColor: 'transparent',
    borderDash: [3, 3],
                fill: false,
                tension: 0.4'';
            }'),
        }
';

        const config = { ''
            type: 'line',
    data: {
                labels: labels,
    datasets: datasets };
            options: { ...this.chartConfigs.default;
                plugins: {
                    ...this.chartConfigs.default.plugins;
                    title: {
                        display: true,
    text: title 
    }
        };
        const chart = this.chartRenderer.createChart(canvas, config);
        this.activeCharts.set(canvas.id, chart);
        return chart;
    }

    /**
     * 複数指標の比較チャートを作成
     * @param {HTMLCanvasElement} canvas - 描画対象のCanvas要素
     * @param {Array} timeSeriesData - 時系列データ
     * @param {Array} metrics - 表示する指標のリスト
     * @param {Object} options - 表示オプション
     * @returns {Object} Chart.jsのチャートインスタンス'
     */''
    createMultiMetricChart(canvas, timeSeriesData, metrics, options: any = { )) {'
        const { ''
            title = '複数指標の推移比較',
            normalizeValues = true } = options;

        const labels = timeSeriesData.map(d => d.period);
        const datasets = [];

        metrics.forEach(metric => {  );
            let values = timeSeriesData.map(d => this.getMetricValue(d, metric);
            
            // 正規化処理
            if (normalizeValues) { }
                values = this.normalizeValues(values); }
            }

            datasets.push({ );
                label: this.getMetricDisplayName(metric);
                data: values,
    borderColor: this.colors[metric] || this.generateRandomColor(),
                backgroundColor: (this.colors[metric] || this.generateRandomColor()) + '20';
                fill: false,
    tension: 0.4 ,}

            }';''
        }');
';

        const config = { ''
            type: 'line',
    data: {
                labels: labels,
    datasets: datasets };
            options: { ...this.chartConfigs.default;
                plugins: {
                    ...this.chartConfigs.default.plugins;
                    title: {
                        display: true,
    text: title 
    };
                scales: { ...this.chartConfigs.default.scales;
                    y: {
                        ...this.chartConfigs.default.scales.y;
                        title: {'
                            display: true,
                            text: normalizeValues ? '正規化された値 (0-1')' : '値' 
,}
            }
        };
        const chart = this.chartRenderer.createChart(canvas, config);
        this.activeCharts.set(canvas.id, chart);
        return chart;
    }

    /**
     * トレンド分析結果の詳細チャートを作成
     * @param {HTMLCanvasElement} canvas - 描画対象のCanvas要素
     * @param {Object} trendAnalysis - トレンド分析結果
     * @param {Object} options - 表示オプション
     * @returns {Object} Chart.jsのチャートインスタンス
     */
    createTrendAnalysisChart(canvas, trendAnalysis, options: any = {}) {
        const {
            showConfidenceInterval = true,
            showAnomalies = false }
            highlightTrend = true }
        } = options;

        const { timeSeriesData, trend } = trendAnalysis;

        const labels = timeSeriesData.map(d => d.period);''
        const values = timeSeriesData.map(d => d.averageScore);
';

        const datasets = [{ ''
            label: 'スコア',
    data: values,
            borderColor: this.colors.score,
            backgroundColor: this.colors.score + '20';
            fill: false],
    tension: 0.4 ,}]
        }];
';
        // トレンドライン
        if(trend && trend.direction !== 'stable' {'
            const trendData = this.calculateTrendLine(values);
        }

            datasets.push({);' }'

                label: `トレンド (${trend.direction}'}'`;
                data: trendData,
                borderColor: trend.direction === 'increasing' ? '#10B981' : '#EF4444',
                backgroundColor: 'transparent',
    borderDash: [5, 5],
                fill: false,
    pointRadius: 0,
                tension: 0'';
            }'),
        }
';
        // 信頼区間（安定トレンドの場合は表示しない）
        if(showConfidenceInterval && trend && trend.direction !== 'stable' {'
            const confidenceData = this.calculateConfidenceInterval(values);''
            datasets.push({);''
                label: '信頼区間 (上限')',
                data: confidenceData.upper,
                borderColor: this.colors.trend + '60',
                backgroundColor: 'transparent',
    borderDash: [2, 2],
                fill: false;
        ,}
                pointRadius: 0 
    }';''
            datasets.push({ ');''
                label: '信頼区間 (下限')',
                data: confidenceData.lower,
                borderColor: this.colors.trend + '60',
                backgroundColor: this.colors.trend + '10',
                borderDash: [2, 2],
                fill: '-1', // 上限データセットまで塗りつぶし;
                pointRadius: 0 ,});
        }

        // 異常値のハイライト
        if(showAnomalies && this.trendAnalyzer) {
            const anomalies = this.trendAnalyzer.detectAnomalies(timeSeriesData);
            if (anomalies.length > 0) {
                const anomalyData = new Array(values.length).fill(null);
                anomalies.forEach(anomaly => { ')'
                    anomalyData[anomaly.index] = anomaly.value'');

                datasets.push({''
                    label: '異常値',
                    data: anomalyData,
                    borderColor: '#EF4444',
                    backgroundColor: '#EF4444','';
                    type: 'scatter')
        ,}
                    pointRadius: 8,) }
                    pointHoverRadius: 10); 
    }';
            }
        }
';

        let titleText = `トレンド分析結果`;''
        if(trend) {', ';

        }

            titleText += ` - ${trend.direction === 'increasing' ? '上昇' : ' 
                           trend.direction === 'decreasing' ? '下降' : '安定'}傾向`;''
            titleText += ` (信頼度: ${(trend.confidence * 100}.toFixed(1})%')`;
        }
';

        const config = { ''
            type: 'line',
    data: {
                labels: labels,
    datasets: datasets };
            options: { ...this.chartConfigs.default;
                plugins: {
                    ...this.chartConfigs.default.plugins;
                    title: {
                        display: true,
    text: titleText 
    }
        };
        const chart = this.chartRenderer.createChart(canvas, config);
        this.activeCharts.set(canvas.id, chart);
        return chart;
    }

    /**
     * インタラクティブなダッシュボードチャートを作成
     * @param {HTMLCanvasElement} canvas - 描画対象のCanvas要素
     * @param {Array} timeSeriesData - 時系列データ
     * @param {Object} options - 表示オプション
     * @returns {Object} Chart.jsのチャートインスタンス'
     */''
    createDashboardChart(canvas, timeSeriesData, options: any = { )) {'
        const { ''
            defaultMetric = 'averageScore',
            showControls = true,
            enableZoom = true,
            enableAnnotations = true } = options;
';

        const chart = this.createSingleMetricChart(canvas, timeSeriesData, defaultMetric, { ')'
            title: 'パフォーマンス ダッシュボード'),
    showTrend: true,);
            showSeasonalAdjusted: true);
        // インタラクティブ機能の設定
        if(enableZoom) {
            
        ,}
            this.enableZoomPan(chart); }
        }

        if (enableAnnotations) { this.addAnnotations(chart, timeSeriesData); }

        return chart;
    }

    /**
     * 指標値を取得
     * @param {Object} dataPoint - データポイント
     * @param {string} metric - 指標名
     * @returns {number} 指標値
     */
    getMetricValue(dataPoint, metric) {
        const metricMap = {
            score: dataPoint.averageScore;
            accuracy: dataPoint.averageAccuracy;
            playTime: dataPoint.averagePlayTime;
            combo: dataPoint.maxCombo,
    completionRate: dataPoint.completionRate;
    }
            sessionCount: dataPoint.sessionCount 
    };
        return metricMap[metric] || dataPoint[metric] || 0;
    }

    /**
     * 指標の表示名を取得
     * @param {string} metric - 指標名
     * @returns {string} 表示名
     */''
    getMetricDisplayName(metric) {'
        const displayNames = {''
            score: 'スコア',
            accuracy: '精度',
            playTime: 'プレイ時間',
            combo: '最大コンボ',
            completionRate: '完了率';
    ,}

            sessionCount: 'セッション数' 
    };
        return displayNames[metric] || metric;
    }

    /**
     * トレンドラインを計算
     * @param {Array} values - 値の配列
     * @returns {Array} トレンドライン値
     */
    calculateTrendLine(values) {
        const n = values.length;
        const indices = Array.from({ length: n ), (_, i) => i);
        
        // 線形回帰
        const sumX = indices.reduce((a, b) => a + b, 0);
        const sumY = values.reduce((a, b) => a + b, 0);
        const sumXY = indices.reduce((sum, x, i) => sum + x * values[i], 0);
        const sumXX = indices.reduce((sum, x) => sum + x * x, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
    }
        return indices.map(x => slope * x + intercept);

    /**
     * 信頼区間を計算
     * @param {Array} values - 値の配列
     * @returns {Object} 上限・下限の信頼区間
     */
    calculateConfidenceInterval(values, confidence = 0.95) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        
        // t分布の近似（簡易版）
        const tValue = 1.96; // 95%信頼区間の近似値
        const margin = tValue * stdDev / Math.sqrt(values.length);
        
    }
        return { upper: values.map(() => mean + margin), };
            lower: values.map(() => mean - margin); 
    }

    /**
     * 値を正規化 (0-1範囲)
     * @param {Array} values - 値の配列
     * @returns {Array} 正規化された値
     */
    normalizeValues(values) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min;
        
        if (range === 0) return values.map(() => 0.5);
        
    }
        return values.map(val => (val - min) / range);

    /**
     * ランダム色を生成
     * @returns {string} HEX色コード
     */''
    generateRandomColor(''';
        const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4];)
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * ズーム・パン機能を有効化
     * @param {Object} chart - Chart.jsインスタンス
     */
    enableZoomPan(chart) {
        if (chart.options.plugins && chart.options.plugins.zoom) {
            chart.options.plugins.zoom.zoom.wheel.enabled = true;
            chart.options.plugins.zoom.pan.enabled = true;
    }
            chart.update(); }
}

    /**
     * 注釈を追加
     * @param {Object} chart - Chart.jsインスタンス
     * @param {Array} timeSeriesData - 時系列データ
     */
    addAnnotations(chart, timeSeriesData) {
        // 重要なポイントに注釈を追加（簡易実装）
        const annotations = [];
        
        // 最高値・最低値のマーク
        const values = timeSeriesData.map(d => d.averageScore || 0);
        const maxIndex = values.indexOf(Math.max(...values);
        const minIndex = values.indexOf(Math.min(...values);

        if(maxIndex !== -1) {'
            annotations.push({''
                type: 'point',
    xValue: maxIndex,
                yValue: values[maxIndex],
                backgroundColor: '#10B981',
    radius: 8,
                label: {''
                    content: '最高値')
    ,}
                    enabled: true) 
    });
        }

        if(minIndex !== -1) { '
            annotations.push({''
                type: 'point',
    xValue: minIndex,
                yValue: values[minIndex],
                backgroundColor: '#EF4444',
    radius: 8,
                label: {''
                    content: '最低値' ,}
                    enabled: true) 
    });
        }
        
        // チャートにアノテーションを追加（Chart.jsのannotationプラグインが必要）
        if(chart.options.plugins) {
            chart.options.plugins.annotation = {
        }
                annotations: annotations 
    };
            chart.update();
        }
    }

    /**
     * チャートを更新
     * @param {string} chartId - チャートID
     * @param {Array} newData - 新しいデータ
     */
    updateChart(chartId, newData) {
        const chart = this.activeCharts.get(chartId);
        if (chart) {
            chart.data.labels = newData.map(d => d.period);
            chart.data.datasets[0].data = newData.map(d => d.averageScore || 0);
    }
            chart.update(); }
}

    /**
     * チャートをリセット（ズーム・パンをリセット）
     * @param {string} chartId - チャートID
     */
    resetChart(chartId) {
        const chart = this.activeCharts.get(chartId);
        if (chart && chart.resetZoom) {
    }
            chart.resetZoom(); }
}

    /**
     * チャートを破棄
     * @param {string} chartId - チャートID
     */
    destroyChart(chartId) {
        const chart = this.activeCharts.get(chartId);
        if (chart) {
            chart.destroy();
    }
            this.activeCharts.delete(chartId); }
}

    /**
     * 全チャートを破棄
     */
    destroyAllCharts() {
        this.activeCharts.forEach(chart => chart.destroy();
    }
        this.activeCharts.clear(); }
    }

    /**
     * チャート設定をエクスポート
     * @param {string} chartId - チャートID
     * @returns {Object} チャート設定
     */
    exportChartConfig(chartId) {
        const chart = this.activeCharts.get(chartId);''
        if(chart) {
            return { type: chart.config.type }
                data: chart.data, };
                options: chart.options 
    }
        return null;
    }

    /**
     * データをCSV形式でエクスポート
     * @param {Array} timeSeriesData - 時系列データ
     * @param {Array} metrics - エクスポートする指標
     * @returns {string} CSV文字列'
     */''
    exportToCSV(timeSeriesData, metrics = ['averageScore', 'averageAccuracy', 'averagePlayTime]' {'

        // メトリック名を正規化（'averageScore' -> 'score'）''
        const normalizedMetrics = metrics.map(m => { ');''
            if (m === 'averageScore'') return 'score';
            if (m === 'averageAccuracy'') return 'accuracy';

    }

            if (m === 'averagePlayTime'') return 'playTime'; }

            return m;' }'

        }');

        const headers = ['期間', ...normalizedMetrics.map(m => this.getMetricDisplayName(m)];
        const rows = timeSeriesData.map(d => [);
            d.period)]';
            ...normalizedMetrics.map(m => this.getMetricValue(d, m)']';
        ]');
        ';

        const csvContent = [headers, ...rows]'';
            .map(row => row.join(',)''';
            .join('\n'');
            
        return csvContent;

    }''
}