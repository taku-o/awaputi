/**
 * D3.jsを使用した高度な可視化システム
 * カスタムビジュアライゼーションとインタラクティブな可視化機能
 */

export class DataVisualizer {
    constructor(options = {}) {
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

        this.initialize();
    }

    /**
     * 初期化
     */
    initialize() {
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
    async loadD3() {
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
    setupD3Defaults() {
        if (!this.d3) return;

        // デフォルトの色スケールを設定
        this.colorScale = this.d3.scaleOrdinal(this.d3[`scheme${this.options.colorScheme}`] || this.d3.schemeCategory10);
        
        // アニメーション設定
        this.transition = this.d3.transition()
            .duration(this.options.animationDuration)
            .ease(this.d3.easeCircleOut);
    }

    /**
     * 散布図の作成
     */
    createScatterPlot(containerId, data, config = {}) {
        if (!this.d3 || !data || data.length === 0) return null;

        const container = this.getContainer(containerId);
        if (!container) return null;

        const svg = this.createSVG(containerId, config);
        const { width, height } = this.getDimensions(config);

        // スケールの設定
        const xExtent = this.d3.extent(data, d => d.x);
        const yExtent = this.d3.extent(data, d => d.y);

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
            .attr('cx', d => xScale(d.x))
            .attr('cy', d => yScale(d.y))
            .attr('r', config.pointRadius || 4)
            .style('fill', (d, i) => this.colorScale(d.category || i))
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
    createHeatmap(containerId, data, config = {}) {
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
            .domain(this.d3.extent(data, d => d.value));

        this.scales.set(`${containerId}-color`, colorScale);

        // ヒートマップセルの描画
        const cells = svg.selectAll('.heatmap-cell')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'heatmap-cell')
            .attr('x', d => xScale(d.x))
            .attr('y', d => yScale(d.y))
            .attr('width', cellWidth)
            .attr('height', cellHeight)
            .style('fill', d => colorScale(d.value))
            .style('stroke', '#fff')
            .style('stroke-width', 1);

        // 軸ラベル
        svg.selectAll('.x-label')
            .data(xLabels)
            .enter()
            .append('text')
            .attr('class', 'x-label')
            .attr('x', d => xScale(d) + cellWidth / 2)
            .attr('y', height + 15)
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .text(d => d);

        svg.selectAll('.y-label')
            .data(yLabels)
            .enter()
            .append('text')
            .attr('class', 'y-label')
            .attr('x', -10)
            .attr('y', d => yScale(d) + cellHeight / 2)
            .style('text-anchor', 'end')
            .style('alignment-baseline', 'middle')
            .style('font-size', '12px')
            .text(d => d);

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
    createNetworkDiagram(containerId, data, config = {}) {
        if (!this.d3 || !data || !data.nodes || !data.links) return null;

        const container = this.getContainer(containerId);
        if (!container) return null;

        const svg = this.createSVG(containerId, config);
        const { width, height } = this.getDimensions(config);

        // 力学シミュレーションの設定
        const simulation = this.d3.forceSimulation(data.nodes)
            .force('link', this.d3.forceLink(data.links).id(d => d.id).distance(config.linkDistance || 100))
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
            .style('stroke-width', d => Math.sqrt(d.value || 1));

        // ノードの描画
        const nodes = svg.selectAll('.node')
            .data(data.nodes)
            .enter()
            .append('circle')
            .attr('class', 'node')
            .attr('r', d => Math.sqrt((d.value || 1) * 10))
            .style('fill', (d, i) => this.colorScale(d.group || i))
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
            .text(d => d.id);

        // ドラッグ機能
        if (this.options.enableInteractivity) {
            const drag = this.d3.drag()
                .on('start', (event, d) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on('drag', (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on('end', (event, d) => {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                });

            nodes.call(drag);
        }

        // シミュレーション更新
        simulation.on('tick', () => {
            links
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            nodes
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);

            labels
                .attr('x', d => d.x)
                .attr('y', d => d.y + 4);
        });

        const visualization = { svg, simulation, nodes, links, labels, type: 'network' };
        this.visualizations.set(containerId, visualization);

        return visualization;
    }

    /**
     * 時系列チャートの作成
     */
    createTimeSeriesChart(containerId, data, config = {}) {
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
            .domain(this.d3.extent(data, d => d.date))
            .range([0, width]);

        const yScale = this.d3.scaleLinear()
            .domain(this.d3.extent(data, d => d.value))
            .nice()
            .range([height, 0]);

        this.scales.set(`${containerId}-x`, xScale);
        this.scales.set(`${containerId}-y`, yScale);

        // ライン生成関数
        const line = this.d3.line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.value))
            .curve(this.d3.curveMonotoneX);

        // エリア生成関数（オプション）
        let area = null;
        if (config.showArea) {
            area = this.d3.area()
                .x(d => xScale(d.date))
                .y0(height)
                .y1(d => yScale(d.value))
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
                .attr('cx', d => xScale(d.date))
                .attr('cy', d => yScale(d.value))
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
    createSVG(containerId, config = {}) {
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
    addInteractivity(selection, config = {}) {
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
            .on('mouseover', (event, d) => {
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
            .on('mouseout', (event, d) => {
                tooltip.transition().duration(500).style('opacity', 0);

                // ハイライト解除
                this.d3.select(event.currentTarget)
                    .transition()
                    .duration(200)
                    .attr('r', (this.d3.select(event.currentTarget).attr('r') || 6) / 1.5)
                    .style('opacity', 0.7);
            })
            .on('click', (event, d) => {
                if (config.onPointClick) {
                    config.onPointClick(d, event);
                }
            });
    }

    /**
     * ヒートマップのインタラクティブ機能
     */
    addHeatmapInteractivity(selection, config = {}) {
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
            .on('mouseover', (event, d) => {
                tooltip.transition().duration(200).style('opacity', 0.9);
                tooltip.html(`${d.x} - ${d.y}<br/>値: ${d.value}`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');

                this.d3.select(event.currentTarget)
                    .style('stroke-width', 3);
            })
            .on('mouseout', (event, d) => {
                tooltip.transition().duration(500).style('opacity', 0);
                this.d3.select(event.currentTarget)
                    .style('stroke-width', 1);
            });
    }

    /**
     * コンテナ要素の取得
     */
    getContainer(containerId) {
        return document.getElementById(containerId);
    }

    /**
     * 寸法の取得
     */
    getDimensions(config = {}) {
        return {
            width: config.width || this.options.defaultWidth,
            height: config.height || this.options.defaultHeight
        };
    }

    /**
     * 可視化の更新
     */
    updateVisualization(containerId, newData, config = {}) {
        const visualization = this.visualizations.get(containerId);
        if (!visualization) return false;

        try {
            switch (visualization.type) {
                case 'scatter':
                    return this.updateScatterPlot(containerId, newData, config);
                case 'heatmap':
                    return this.updateHeatmap(containerId, newData, config);
                case 'timeseries':
                    return this.updateTimeSeriesChart(containerId, newData, config);
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
     * Canvas APIフォールバック
     */
    fallbackToCanvasRenderer() {
        console.warn('D3.js not available, using Canvas API fallback');
        this.useCanvasFallback = true;
    }

    /**
     * 可視化の削除
     */
    destroyVisualization(containerId) {
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
     * 統計情報の取得
     */
    getVisualizationStatistics() {
        const typeCount = {};
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
    estimateMemoryUsage() {
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
    destroy() {
        // 全ての可視化を削除
        for (const containerId of this.visualizations.keys()) {
            this.destroyVisualization(containerId);
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