/**
 * D3.jsを使用した高度な可視化システム
 * カスタムビジュアライゼーションとインタラクティブな可視化機能
 */

// Data Visualizer interfaces and types
export interface DataVisualizerOptions {
    enableInteractivity?: boolean;
    enableAnimation?: boolean;
    animationDuration?: number;
    defaultWidth?: number;
    defaultHeight?: number;
    margin?: Margin;
    colorScheme?: string;
    locale?: string;
}

export interface Margin {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface VisualizationData {
    values: number[];
    labels?: string[];
    categories?: string[];
    timestamps?: number[];
    [key: string]: any;
}

export interface ScatterPlotData {
    x: number;
    y: number;
    size?: number;
    color?: string;
    label?: string;
}

export interface HeatmapData {
    x: any;
    y: any;
    value: number;
}

export interface NetworkData {
    nodes: Array<{
        id: string;
        value?: number;
        group?: string | number;
        [key: string]: any;
    }>;
    links: Array<{
        source: any;
        target: any;
        value?: number;
        [key: string]: any;
    }>;
}

export interface TreeMapData {
    name: string;
    value?: number;
    children?: TreeMapData[];
}

// Declare D3.js global interface
declare global {
    interface Window {
        d3: any;
    }
    var d3: any;
}

export class DataVisualizer {
    private options: Required<DataVisualizerOptions>;
    private visualizations: Map<string, any>;
    private svgElements: Map<string, any>;
    private scales: Map<string, any>;
    private d3: any;
    private colorScale: any;
    private transition: any;
    private useCanvasFallback: boolean;

    constructor(options: DataVisualizerOptions = {}) {
        this.options = {
            enableInteractivity: true,
            enableAnimation: true,
            animationDuration: 1000,
            defaultWidth: 500,
            defaultHeight: 400,
            margin: { top: 20, right: 30, bottom: 40, left: 50 },
            colorScheme: 'category10', // category10, category20, viridis, plasma等
            locale: 'ja-JP',
            ...options
        };

        this.visualizations = new Map(); // アクティブな可視化インスタンス
        this.svgElements = new Map(); // SVG要素
        this.scales = new Map(); // スケール関数
        this.d3 = null; // D3.jsライブラリ参照
        this.colorScale = null;
        this.transition = null;
        this.useCanvasFallback = false;

        this.initialize();
    }

    /**
     * 初期化
     */
    private initialize(): void {
        this.loadD3()
            .then(() => {
                console.log('D3.js loaded successfully');
                this.setupD3Defaults();
            })
            .catch(error => {
                console.error('Failed to load D3.js:', error);
                this.fallbackToCanvasRenderer();
            });
    }

    /**
     * D3.jsの動的読み込み
     */
    private async loadD3(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof d3 !== 'undefined') {
                this.d3 = window.d3;
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js';
            script.onload = () => {
                this.d3 = window.d3;
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * D3.jsのデフォルト設定
     */
    private setupD3Defaults(): void {
        if (!this.d3) return;

        // デフォルトの色スケールを設定
        this.colorScale = this.d3.scaleOrdinal(this.d3[`scheme${this.options.colorScheme}`] || this.d3.schemeCategory10);
        
        // アニメーション設定
        this.transition = this.d3.transition()
            .duration(this.options.animationDuration)
            .ease(this.d3.easeCircleOut);

        // ロケール設定
        if (this.options.locale === 'ja-JP') {
            const jaLocale = this.d3.timeFormatLocale({
                dateTime: '%Y年%m月%d日 %H時%M分%S秒',
                date: '%Y年%m月%d日',
                time: '%H時%M分%S秒',
                periods: ['午前', '午後'],
                days: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
                shortDays: ['日', '月', '火', '水', '木', '金', '土'],
                months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                shortMonths: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
            });
            this.d3.timeFormat = jaLocale.format;
            this.d3.timeParse = jaLocale.parse;
        }
    }

    /**
     * 散布図の作成
     */
    createScatterPlot(containerId: string, data: ScatterPlotData[], config: any = {}): any {
        if (!this.d3 || !data || data.length === 0) return null;

        const container = this.getContainer(containerId);
        if (!container) return null;

        const svg = this.createSVG(containerId, config);
        const { width, height } = this.getDimensions(config);

        // スケールの設定
        const xExtent = this.d3.extent(data, (d: ScatterPlotData) => d.x);
        const yExtent = this.d3.extent(data, (d: ScatterPlotData) => d.y);

        const xScale = this.d3.scaleLinear()
            .domain(xExtent)
            .range([0, width]);

        const yScale = this.d3.scaleLinear()
            .domain(yExtent)
            .range([height, 0]);

        this.scales.set(`${containerId}-x`, xScale);
        this.scales.set(`${containerId}-y`, yScale);

        // 軸の作成
        const xAxis = this.d3.axisBottom(xScale);
        const yAxis = this.d3.axisLeft(yScale);

        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis);

        svg.append('g')
            .attr('class', 'y-axis')
            .call(yAxis);

        // 軸ラベル
        if (config.xAxisLabel) {
            svg.append('text')
                .attr('class', 'x-axis-label')
                .attr('x', width / 2)
                .attr('y', height + 35)
                .style('text-anchor', 'middle')
                .text(config.xAxisLabel);
        }

        if (config.yAxisLabel) {
            svg.append('text')
                .attr('class', 'y-axis-label')
                .attr('transform', 'rotate(-90)')
                .attr('x', -height / 2)
                .attr('y', -35)
                .style('text-anchor', 'middle')
                .text(config.yAxisLabel);
        }

        // データポイントの描画
        const circles = svg.selectAll('.data-point')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'data-point')
            .attr('cx', (d: ScatterPlotData) => xScale(d.x))
            .attr('cy', (d: ScatterPlotData) => yScale(d.y))
            .attr('r', config.pointRadius || 4)
            .style('fill', (d: ScatterPlotData, i: number) => this.colorScale(d.label || i))
            .style('opacity', 0.7);

        // インタラクティブ機能
        if (this.options.enableInteractivity) {
            this.addInteractivity(circles, config);
        }

        // アニメーション
        if (this.options.enableAnimation) {
            circles
                .attr('r', 0)
                .transition()
                .duration(this.options.animationDuration)
                .attr('r', config.pointRadius || 4);
        }

        const visualization = { svg, xScale, yScale, circles, type: 'scatter' };
        this.visualizations.set(containerId, visualization);

        return visualization;
    }

    /**
     * ヒートマップの作成
     */
    createHeatmap(containerId: string, data: HeatmapData[], config: any = {}): any {
        if (!this.d3 || !data || data.length === 0) return null;

        const container = this.getContainer(containerId);
        if (!container) return null;

        const svg = this.createSVG(containerId, config);
        const { width, height } = this.getDimensions(config);

        // データの構造を想定: [{x: string, y: string, value: number}, ...]
        const xLabels = [...new Set(data.map(d => d.x))];
        const yLabels = [...new Set(data.map(d => d.y))];

        const cellWidth = width / xLabels.length;
        const cellHeight = height / yLabels.length;

        // スケールの設定
        const xScale = this.d3.scaleBand()
            .domain(xLabels)
            .range([0, width]);

        const yScale = this.d3.scaleBand()
            .domain(yLabels)
            .range([0, height]);

        const colorScale = this.d3.scaleSequential(this.d3.interpolateViridis)
            .domain(this.d3.extent(data, (d: HeatmapData) => d.value));

        this.scales.set(`${containerId}-color`, colorScale);

        // ヒートマップセルの描画
        const cells = svg.selectAll('.heatmap-cell')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'heatmap-cell')
            .attr('x', (d: HeatmapData) => xScale(d.x))
            .attr('y', (d: HeatmapData) => yScale(d.y))
            .attr('width', cellWidth)
            .attr('height', cellHeight)
            .style('fill', (d: HeatmapData) => colorScale(d.value))
            .style('stroke', '#fff')
            .style('stroke-width', 1);

        // 軸ラベル
        svg.selectAll('.x-label')
            .data(xLabels)
            .enter()
            .append('text')
            .attr('class', 'x-label')
            .attr('x', (d: any) => xScale(d) + cellWidth / 2)
            .attr('y', height + 15)
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .text((d: any) => d);

        svg.selectAll('.y-label')
            .data(yLabels)
            .enter()
            .append('text')
            .attr('class', 'y-label')
            .attr('x', -10)
            .attr('y', (d: any) => yScale(d) + cellHeight / 2)
            .style('text-anchor', 'end')
            .style('alignment-baseline', 'middle')
            .style('font-size', '12px')
            .text((d: any) => d);

        // インタラクティブ機能
        if (this.options.enableInteractivity) {
            this.addHeatmapInteractivity(cells, config);
        }

        // アニメーション
        if (this.options.enableAnimation) {
            cells
                .style('opacity', 0)
                .transition()
                .duration(this.options.animationDuration)
                .style('opacity', 1);
        }

        const visualization = { svg, cells, colorScale, type: 'heatmap' };
        this.visualizations.set(containerId, visualization);

        return visualization;
    }

    /**
     * ネットワーク図の作成
     */
    createNetworkDiagram(containerId: string, data: NetworkData, config: any = {}): any {
        if (!this.d3 || !data || !data.nodes || !data.links) return null;

        const container = this.getContainer(containerId);
        if (!container) return null;

        const svg = this.createSVG(containerId, config);
        const { width, height } = this.getDimensions(config);

        // 力学シミュレーションの設定
        const simulation = this.d3.forceSimulation(data.nodes)
            .force('link', this.d3.forceLink(data.links).id((d: any) => d.id).distance(config.linkDistance || 100))
            .force('charge', this.d3.forceManyBody().strength(config.charge || -300))
            .force('center', this.d3.forceCenter(width / 2, height / 2));

        // リンクの描画
        const links = svg.selectAll('.link')
            .data(data.links)
            .enter()
            .append('line')
            .attr('class', 'link')
            .style('stroke', '#999')
            .style('stroke-opacity', 0.6)
            .style('stroke-width', (d: any) => Math.sqrt(d.value || 1));

        // ノードの描画
        const nodes = svg.selectAll('.node')
            .data(data.nodes)
            .enter()
            .append('circle')
            .attr('class', 'node')
            .attr('r', (d: any) => Math.sqrt((d.value || 1) * 10))
            .style('fill', (d: any, i: number) => this.colorScale(d.group || i))
            .style('stroke', '#fff')
            .style('stroke-width', 2);

        // ノードラベル
        const labels = svg.selectAll('.node-label')
            .data(data.nodes)
            .enter()
            .append('text')
            .attr('class', 'node-label')
            .style('text-anchor', 'middle')
            .style('font-size', '10px')
            .text((d: any) => d.id);

        // ドラッグ機能
        if (this.options.enableInteractivity) {
            const drag = this.d3.drag()
                .on('start', (event: any, d: any) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on('drag', (event: any, d: any) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on('end', (event: any, d: any) => {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                });

            nodes.call(drag);
        }

        // シミュレーション更新
        simulation.on('tick', () => {
            links
                .attr('x1', (d: any) => d.source.x)
                .attr('y1', (d: any) => d.source.y)
                .attr('x2', (d: any) => d.target.x)
                .attr('y2', (d: any) => d.target.y);

            nodes
                .attr('cx', (d: any) => d.x)
                .attr('cy', (d: any) => d.y);

            labels
                .attr('x', (d: any) => d.x)
                .attr('y', (d: any) => d.y + 4);
        });

        const visualization = { svg, simulation, nodes, links, labels, type: 'network' };
        this.visualizations.set(containerId, visualization);

        return visualization;
    }

    /**
     * ツリーマップの作成
     */
    createTreemap(containerId: string, data: TreeMapData, config: any = {}): boolean {
        if (!this.d3) return false;

        const container = document.getElementById(containerId);
        if (!container) return false;

        const width = config.width || this.options.defaultWidth;
        const height = config.height || this.options.defaultHeight;

        // SVG要素の作成
        const svg = this.d3.select(`#${containerId}`)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // ツリーマップレイアウト
        const treemap = this.d3.treemap()
            .size([width, height])
            .padding(2);

        // データの階層化
        const root = this.d3.hierarchy(data)
            .sum((d: TreeMapData) => d.value)
            .sort((a: any, b: any) => b.value - a.value);

        treemap(root);

        // カラースケール
        const colorScale = this.d3.scaleOrdinal(this.d3.schemeCategory10);

        // ノードの描画
        const leaf = svg.selectAll('g')
            .data(root.leaves())
            .enter()
            .append('g')
            .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

        leaf.append('rect')
            .attr('width', (d: any) => d.x1 - d.x0)
            .attr('height', (d: any) => d.y1 - d.y0)
            .style('fill', (d: any) => colorScale(d.parent?.data.name || d.data.name))
            .style('stroke', '#fff')
            .style('stroke-width', 2);

        leaf.append('text')
            .attr('x', 4)
            .attr('y', 14)
            .text((d: any) => d.data.name)
            .attr('font-size', '12px')
            .attr('fill', 'white');

        this.svgElements.set(containerId, svg);
        this.visualizations.set(containerId, { type: 'treemap', data, config });

        return true;
    }

    /**
     * 時系列チャートの作成
     */
    createTimeSeries(containerId: string, data: VisualizationData, config: any = {}): boolean {
        if (!this.d3 || !data.timestamps || !data.values) return false;

        const container = document.getElementById(containerId);
        if (!container) return false;

        const width = config.width || this.options.defaultWidth;
        const height = config.height || this.options.defaultHeight;
        const margin = config.margin || this.options.margin;

        // SVG要素の作成
        const svg = this.d3.select(`#${containerId}`)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // スケールの設定
        const xScale = this.d3.scaleTime()
            .domain(this.d3.extent(data.timestamps, (d: number) => new Date(d)))
            .range([0, width - margin.left - margin.right]);

        const yScale = this.d3.scaleLinear()
            .domain(this.d3.extent(data.values))
            .range([height - margin.top - margin.bottom, 0]);

        // ラインジェネレーター
        const line = this.d3.line()
            .x((_: any, i: number) => xScale(new Date(data.timestamps![i])))
            .y((d: number) => yScale(d))
            .curve(this.d3.curveMonotoneX);

        // 軸の追加
        g.append('g')
            .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
            .call(this.d3.axisBottom(xScale));

        g.append('g')
            .call(this.d3.axisLeft(yScale));

        // ラインの描画
        g.append('path')
            .datum(data.values)
            .attr('fill', 'none')
            .attr('stroke', '#007bff')
            .attr('stroke-width', 2)
            .attr('d', line);

        this.svgElements.set(containerId, svg);
        this.scales.set(containerId, { xScale, yScale });
        this.visualizations.set(containerId, { type: 'timeseries', data, config });

        return true;
    }

    /**
     * 時系列チャートの作成（互換性のためのメソッド）
     */
    createTimeSeriesChart(containerId: string, data: any[], config: any = {}): any {
        if (!this.d3 || !data || data.length === 0) return null;

        const container = this.getContainer(containerId);
        if (!container) return null;

        const svg = this.createSVG(containerId, config);
        const { width, height } = this.getDimensions(config);

        // 日付パーサー
        const parseTime = this.d3.timeParse(config.timeFormat || '%Y-%m-%d');
        
        // データの前処理
        data.forEach(d => {
            d.date = parseTime(d.date) || new Date(d.date);
            d.value = +d.value;
        });

        // スケールの設定
        const xScale = this.d3.scaleTime()
            .domain(this.d3.extent(data, (d: any) => d.date))
            .range([0, width]);

        const yScale = this.d3.scaleLinear()
            .domain(this.d3.extent(data, (d: any) => d.value))
            .nice()
            .range([height, 0]);

        this.scales.set(`${containerId}-x`, xScale);
        this.scales.set(`${containerId}-y`, yScale);

        // ライン生成関数
        const line = this.d3.line()
            .x((d: any) => xScale(d.date))
            .y((d: any) => yScale(d.value))
            .curve(this.d3.curveMonotoneX);

        // エリア生成関数（オプション）
        let area = null;
        if (config.showArea) {
            area = this.d3.area()
                .x((d: any) => xScale(d.date))
                .y0(height)
                .y1((d: any) => yScale(d.value))
                .curve(this.d3.curveMonotoneX);

            svg.append('path')
                .datum(data)
                .attr('class', 'area')
                .attr('d', area)
                .style('fill', this.colorScale(0))
                .style('opacity', 0.3);
        }

        // ラインの描画
        const path = svg.append('path')
            .datum(data)
            .attr('class', 'line')
            .attr('d', line)
            .style('fill', 'none')
            .style('stroke', this.colorScale(0))
            .style('stroke-width', 2);

        // 軸の作成
        const xAxis = this.d3.axisBottom(xScale)
            .tickFormat(this.d3.timeFormat(config.tickFormat || '%m/%d'));
        const yAxis = this.d3.axisLeft(yScale);

        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis);

        svg.append('g')
            .attr('class', 'y-axis')
            .call(yAxis);

        // データポイント（オプション）
        if (config.showPoints) {
            const circles = svg.selectAll('.data-point')
                .data(data)
                .enter()
                .append('circle')
                .attr('class', 'data-point')
                .attr('cx', (d: any) => xScale(d.date))
                .attr('cy', (d: any) => yScale(d.value))
                .attr('r', 3)
                .style('fill', this.colorScale(0));

            if (this.options.enableInteractivity) {
                this.addInteractivity(circles, config);
            }
        }

        // アニメーション
        if (this.options.enableAnimation) {
            const pathLength = path.node().getTotalLength();
            path
                .attr('stroke-dasharray', pathLength + ' ' + pathLength)
                .attr('stroke-dashoffset', pathLength)
                .transition()
                .duration(this.options.animationDuration * 2)
                .attr('stroke-dashoffset', 0);
        }

        const visualization = { svg, xScale, yScale, path, line, type: 'timeseries' };
        this.visualizations.set(containerId, visualization);

        return visualization;
    }

    /**
     * SVG要素の作成
     */
    private createSVG(containerId: string, config: any = {}): any {
        const container = this.getContainer(containerId);
        const { width, height } = this.getDimensions(config);
        const { margin } = this.options;

        // 既存のSVGを削除
        this.d3.select(container).select('svg').remove();

        const svg = this.d3.select(container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        this.svgElements.set(containerId, svg);
        return svg;
    }

    /**
     * インタラクティブ機能の追加
     */
    private addInteractivity(selection: any, config: any = {}): void {
        if (!this.options.enableInteractivity) return;

        // ツールチップの作成
        const tooltip = this.d3.select('body')
            .append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('padding', '10px')
            .style('background', 'rgba(0, 0, 0, 0.8)')
            .style('color', 'white')
            .style('border-radius', '5px')
            .style('pointer-events', 'none')
            .style('opacity', 0);

        selection
            .on('mouseover', (event: any, d: any) => {
                tooltip.transition().duration(200).style('opacity', 0.9);
                
                const tooltipText = config.tooltipFormatter ? 
                    config.tooltipFormatter(d) : 
                    `値: ${d.value || d.y || 'N/A'}`;
                
                tooltip.html(tooltipText)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');

                // ハイライト効果
                this.d3.select(event.currentTarget)
                    .transition()
                    .duration(100)
                    .attr('r', (this.d3.select(event.currentTarget).attr('r') || 4) * 1.5)
                    .style('opacity', 1);
            })
            .on('mouseout', (event: any) => {
                tooltip.transition().duration(500).style('opacity', 0);

                // ハイライト解除
                this.d3.select(event.currentTarget)
                    .transition()
                    .duration(200)
                    .attr('r', (this.d3.select(event.currentTarget).attr('r') || 6) / 1.5)
                    .style('opacity', 0.7);
            })
            .on('click', (_event: any, d: any) => {
                if (config.onPointClick) {
                    config.onPointClick(d, _event);
                }
            });
    }

    /**
     * ヒートマップのインタラクティブ機能
     */
    private addHeatmapInteractivity(selection: any, _config: any = {}): void {
        if (!this.options.enableInteractivity) return;

        const tooltip = this.d3.select('body')
            .append('div')
            .attr('class', 'heatmap-tooltip')
            .style('position', 'absolute')
            .style('padding', '8px')
            .style('background', 'rgba(0, 0, 0, 0.9)')
            .style('color', 'white')
            .style('border-radius', '4px')
            .style('pointer-events', 'none')
            .style('opacity', 0);

        selection
            .on('mouseover', (event: any, d: any) => {
                tooltip.transition().duration(200).style('opacity', 0.9);
                tooltip.html(`${d.x} - ${d.y}<br/>値: ${d.value}`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');

                this.d3.select(event.currentTarget)
                    .style('stroke-width', 3);
            })
            .on('mouseout', (event: any) => {
                tooltip.transition().duration(500).style('opacity', 0);
                this.d3.select(event.currentTarget)
                    .style('stroke-width', 1);
            });
    }

    /**
     * コンテナ要素の取得
     */
    private getContainer(containerId: string): HTMLElement | null {
        return document.getElementById(containerId);
    }

    /**
     * 寸法の取得
     */
    private getDimensions(config: any = {}): { width: number; height: number } {
        return {
            width: config.width || this.options.defaultWidth,
            height: config.height || this.options.defaultHeight
        };
    }

    /**
     * 可視化の更新
     */
    updateVisualization(containerId: string, newData: any): boolean {
        const visualization = this.visualizations.get(containerId);
        if (!visualization) return false;

        try {
            switch(visualization.type) {
                case 'scatterplot':
                case 'scatter':
                    return this.updateScatterPlot(containerId, newData, visualization.config);
                case 'heatmap':
                    return this.updateHeatmap(containerId, newData, visualization.config);
                case 'treemap':
                    return this.updateTreemap(containerId, newData);
                case 'timeseries':
                    return this.updateTimeSeries(containerId, newData, visualization.config);
                default:
                    console.warn(`Update not implemented for visualization type: ${visualization.type}`);
                    return false;
            }
        } catch (error) {
            console.error('Visualization update failed:', error);
            return false;
        }
    }

    /**
     * 散布図の更新
     */
    private updateScatterPlot(containerId: string, newData: ScatterPlotData[], config?: any): boolean {
        const svg = this.svgElements.get(containerId);
        const scales = this.scales.get(containerId);
        if (!svg || !scales) return false;

        // データポイントの更新
        const dots = svg.selectAll('.dot')
            .data(newData);

        dots.enter().append('circle')
            .attr('class', 'dot')
            .merge(dots)
            .transition()
            .duration(this.options.animationDuration)
            .attr('cx', (d: ScatterPlotData) => scales.xScale(d.x))
            .attr('cy', (d: ScatterPlotData) => scales.yScale(d.y))
            .attr('r', (d: ScatterPlotData) => d.size || 5)
            .style('fill', (d: ScatterPlotData) => d.color || scales.colorScale(d.label || ''));

        dots.exit().remove();
        return true;
    }

    /**
     * ヒートマップの更新
     */
    private updateHeatmap(containerId: string, _newData: HeatmapData[], _config?: any): boolean {
        // ヒートマップの更新実装
        const visualization = this.visualizations.get(containerId);
        if (!visualization) return false;

        // TODO: 実際の更新ロジックの実装
        console.log(`Updating heatmap for ${containerId}`);
        return true;
    }

    /**
     * ツリーマップの更新
     */
    private updateTreemap(_containerId: string, _newData: TreeMapData): boolean {
        // ツリーマップの更新実装
        return true;
    }

    /**
     * 時系列チャートの更新
     */
    private updateTimeSeries(containerId: string, _newData: VisualizationData, _config?: any): boolean {
        // 時系列チャートの更新実装
        const visualization = this.visualizations.get(containerId);
        if (!visualization) return false;

        // TODO: 実際の更新ロジックの実装
        console.log(`Updating time series for ${containerId}`);
        return true;
    }

    /**
     * Canvas APIによるフォールバック描画
     */
    private fallbackToCanvasRenderer(): void {
        console.warn('D3.js not available, using Canvas API fallback');
        this.useCanvasFallback = true;
    }

    /**
     * 可視化の削除
     */
    removeVisualization(containerId: string): void {
        const visualization = this.visualizations.get(containerId);
        if (visualization) {
            if (visualization.simulation) {
                visualization.simulation.stop();
            }
            
            const container = this.getContainer(containerId);
            if (container) {
                this.d3.select(container).selectAll('*').remove();
            }
            
            this.visualizations.delete(containerId);
        }
        
        this.svgElements.delete(containerId);
        this.scales.delete(`${containerId}-x`);
        this.scales.delete(`${containerId}-y`);
        this.scales.delete(`${containerId}-color`);
    }

    /**
     * 可視化の破棄（互換性のため）
     */
    destroyVisualization(containerId: string): void {
        this.removeVisualization(containerId);
    }

    /**
     * 統計情報の取得
     */
    getVisualizationStatistics(): any {
        const typeCount: Record<string, number> = {};
        this.visualizations.forEach((viz) => {
            typeCount[viz.type] = (typeCount[viz.type] || 0) + 1;
        });

        return {
            totalVisualizations: this.visualizations.size,
            visualizationTypes: typeCount,
            d3Available: !!this.d3,
            memoryEstimate: this.estimateMemoryUsage()
        };
    }

    /**
     * メモリ使用量の推定
     */
    estimateMemoryUsage(): any {
        return {
            visualizationCount: this.visualizations.size,
            svgElementCount: this.svgElements.size,
            scaleCount: this.scales.size,
            estimatedMemoryKB: Math.round((this.visualizations.size * 50 + this.svgElements.size * 20) / 1024)
        };
    }

    /**
     * リソースの解放
     */
    destroy(): void {
        // 全ての可視化を削除
        for (const containerId of Array.from(this.visualizations.keys())) {
            this.removeVisualization(containerId);
        }

        // ツールチップを削除
        if (this.d3) {
            this.d3.selectAll('.tooltip, .heatmap-tooltip').remove();
        }

        this.visualizations.clear();
        this.svgElements.clear();
        this.scales.clear();
        console.log('DataVisualizer destroyed');
    }
}