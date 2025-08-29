/**
 * ChartUtilities - チャート描画支援ユーティリティ
 * 
 * 共通処理、ヘルパー関数、アニメーション、インタラクションを統合
 */

/**
 * チャートアニメーションエンジン
 */
export class ChartAnimationEngine {
    constructor() {
        this.animations = new Map();
        this.isAnimating = false;
    }
    
    animateChart(context, renderer, data, options) {
        // アニメーション実装（簡略化）
        return renderer.render(context, data, options);
    }
}

/**
 * チャートインタラクションマネージャー
 */
export class ChartInteractionManager {
    constructor() {
        this.activeInteractions = new Map();
    }
    
    setupInteractions(canvas, renderResult, options) {
        // インタラクション設定（簡略化）
        if (options.showTooltip) {
            this.setupTooltips(canvas, renderResult);
        }
    }
    
    setupTooltips(canvas, renderResult) {
        // ツールチップ設定（簡略化）
    }
}

/**
 * チャートレイアウトマネージャー
 */
export class ChartLayoutManager {
    calculateLayout(context, chartCount, layout) {
        const canvas = context.canvas;
        const width = canvas.width;
        const height = canvas.height;
        
        // グリッドレイアウトの計算
        const cols = Math.ceil(Math.sqrt(chartCount));
        const rows = Math.ceil(chartCount / cols);
        
        const chartWidth = width / cols;
        const chartHeight = height / rows;
        
        const areas = [];
        for (let i = 0; i < chartCount; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            
            areas.push({
                x: col * chartWidth,
                y: row * chartHeight,
                width: chartWidth,
                height: chartHeight
            });
        }
        
        return {
            areas: areas,
            totalArea: { width, height }
        };
    }
}

/**
 * エリアグラフレンダラー
 */
export class AreaChartRenderer {
    render(context, data, options) {
        try {
            const canvas = context.canvas;
            const chartArea = this.calculateChartArea(canvas, options);
            const processedData = this.processData(data);
            
            // スケールの計算
            const scales = this.calculateScales(processedData, chartArea);
            
            // 軸の描画
            if (options.showAxes) {
                this.renderAxes(context, chartArea, scales, options);
            }
            
            // グリッドの描画
            if (options.showGrid) {
                this.renderGrid(context, chartArea, scales, options);
            }
            
            // エリアの描画
            const areas = this.renderAreas(context, processedData, chartArea, scales, options);
            
            return {
                type: 'area',
                dataPoints: processedData.length,
                min: scales.yMin,
                max: scales.yMax,
                areas: areas,
                chartArea: chartArea,
                scales: scales
            };
            
        } catch (error) {
            console.error('Area chart rendering failed:', error);
            return { type: 'area', error: error.message };
        }
    }
    
    calculateChartArea(canvas, options) {
        const padding = options.padding || 20;
        return {
            x: padding,
            y: padding,
            width: canvas.width - (padding * 2),
            height: canvas.height - (padding * 2)
        };
    }
    
    processData(data) {
        return data.map((item, index) => {
            if (typeof item === 'number') {
                return { value: item, x: index };
            }
            return { ...item, x: item.x || index };
        });
    }
    
    calculateScales(data, chartArea) {
        const values = data.map(d => d.value);
        const xValues = data.map(d => d.x);
        
        const yMin = Math.min(0, Math.min(...values));
        const yMax = Math.max(...values);
        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        
        return {
            xScale: chartArea.width / (xMax - xMin || 1),
            yScale: chartArea.height / (yMax - yMin || 1),
            xMin,
            xMax,
            yMin,
            yMax
        };
    }
    
    renderAxes(context, chartArea, scales, options) {
        context.strokeStyle = options.theme.colors.dark;
        context.lineWidth = 1;
        
        // Y軸
        context.beginPath();
        context.moveTo(chartArea.x, chartArea.y);
        context.lineTo(chartArea.x, chartArea.y + chartArea.height);
        context.stroke();
        
        // X軸
        context.beginPath();
        context.moveTo(chartArea.x, chartArea.y + chartArea.height);
        context.lineTo(chartArea.x + chartArea.width, chartArea.y + chartArea.height);
        context.stroke();
    }
    
    renderGrid(context, chartArea, scales, options) {
        context.strokeStyle = '#E5E7EB';
        context.lineWidth = 0.5;
        
        // 水平グリッド線
        const ySteps = 5;
        for (let i = 0; i <= ySteps; i++) {
            const y = chartArea.y + (chartArea.height / ySteps) * i;
            context.beginPath();
            context.moveTo(chartArea.x, y);
            context.lineTo(chartArea.x + chartArea.width, y);
            context.stroke();
        }
    }
    
    renderAreas(context, data, chartArea, scales, options) {
        if (data.length < 2) return [];
        
        const baseY = chartArea.y + chartArea.height;
        
        // エリアパスの作成
        context.beginPath();
        
        // 底辺の開始点
        const firstX = chartArea.x + (data[0].x - scales.xMin) * scales.xScale;
        context.moveTo(firstX, baseY);
        
        // 上辺のパス
        data.forEach((item) => {
            const x = chartArea.x + (item.x - scales.xMin) * scales.xScale;
            const y = chartArea.y + chartArea.height - (item.value - scales.yMin) * scales.yScale;
            context.lineTo(x, y);
        });
        
        // 底辺に戻る
        const lastX = chartArea.x + (data[data.length - 1].x - scales.xMin) * scales.xScale;
        context.lineTo(lastX, baseY);
        context.closePath();
        
        // エリアの塗りつぶし
        const gradient = context.createLinearGradient(0, chartArea.y, 0, baseY);
        gradient.addColorStop(0, options.areaColor || options.theme.colors.primary + '80');
        gradient.addColorStop(1, options.areaColor || options.theme.colors.primary + '20');
        
        context.fillStyle = gradient;
        context.fill();
        
        // 境界線の描画
        context.strokeStyle = options.lineColor || options.theme.colors.primary;
        context.lineWidth = 2;
        context.stroke();
        
        return [{ path: data, gradient: gradient }];
    }
}

/**
 * 散布図レンダラー
 */
export class ScatterChartRenderer {
    render(context, data, options) {
        try {
            const canvas = context.canvas;
            const chartArea = this.calculateChartArea(canvas, options);
            const processedData = this.processData(data);
            
            // スケールの計算
            const scales = this.calculateScales(processedData, chartArea);
            
            // 軸の描画
            if (options.showAxes) {
                this.renderAxes(context, chartArea, scales, options);
            }
            
            // グリッドの描画
            if (options.showGrid) {
                this.renderGrid(context, chartArea, scales, options);
            }
            
            // 散布点の描画
            const points = this.renderPoints(context, processedData, chartArea, scales, options);
            
            return {
                type: 'scatter',
                dataPoints: processedData.length,
                xMin: scales.xMin,
                xMax: scales.xMax,
                yMin: scales.yMin,
                yMax: scales.yMax,
                points: points,
                chartArea: chartArea,
                scales: scales
            };
            
        } catch (error) {
            console.error('Scatter chart rendering failed:', error);
            return { type: 'scatter', error: error.message };
        }
    }
    
    calculateChartArea(canvas, options) {
        const padding = options.padding || 20;
        return {
            x: padding,
            y: padding,
            width: canvas.width - (padding * 2),
            height: canvas.height - (padding * 2)
        };
    }
    
    processData(data) {
        return data.map((item, index) => {
            if (typeof item === 'number') {
                return { x: index, y: item, size: 5 };
            }
            return { 
                x: item.x || index, 
                y: item.y || item.value || 0,
                size: item.size || 5,
                label: item.label
            };
        });
    }
    
    calculateScales(data, chartArea) {
        const xValues = data.map(d => d.x);
        const yValues = data.map(d => d.y);
        
        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        const yMin = Math.min(...yValues);
        const yMax = Math.max(...yValues);
        
        return {
            xScale: chartArea.width / (xMax - xMin || 1),
            yScale: chartArea.height / (yMax - yMin || 1),
            xMin,
            xMax,
            yMin,
            yMax
        };
    }
    
    renderAxes(context, chartArea, scales, options) {
        context.strokeStyle = options.theme.colors.dark;
        context.lineWidth = 1;
        
        // Y軸
        context.beginPath();
        context.moveTo(chartArea.x, chartArea.y);
        context.lineTo(chartArea.x, chartArea.y + chartArea.height);
        context.stroke();
        
        // X軸
        context.beginPath();
        context.moveTo(chartArea.x, chartArea.y + chartArea.height);
        context.lineTo(chartArea.x + chartArea.width, chartArea.y + chartArea.height);
        context.stroke();
    }
    
    renderGrid(context, chartArea, scales, options) {
        context.strokeStyle = '#E5E7EB';
        context.lineWidth = 0.5;
        
        // 水平グリッド線
        const ySteps = 5;
        for (let i = 0; i <= ySteps; i++) {
            const y = chartArea.y + (chartArea.height / ySteps) * i;
            context.beginPath();
            context.moveTo(chartArea.x, y);
            context.lineTo(chartArea.x + chartArea.width, y);
            context.stroke();
        }
        
        // 垂直グリッド線
        const xSteps = 5;
        for (let i = 0; i <= xSteps; i++) {
            const x = chartArea.x + (chartArea.width / xSteps) * i;
            context.beginPath();
            context.moveTo(x, chartArea.y);
            context.lineTo(x, chartArea.y + chartArea.height);
            context.stroke();
        }
    }
    
    renderPoints(context, data, chartArea, scales, options) {
        const points = [];
        
        data.forEach((item, index) => {
            const x = chartArea.x + (item.x - scales.xMin) * scales.xScale;
            const y = chartArea.y + chartArea.height - (item.y - scales.yMin) * scales.yScale;
            const radius = item.size || 5;
            
            // 散布点の描画
            context.fillStyle = item.color || options.theme.palette[index % options.theme.palette.length];
            context.beginPath();
            context.arc(x, y, radius, 0, 2 * Math.PI);
            context.fill();
            
            // 点の枠線
            context.strokeStyle = '#FFFFFF';
            context.lineWidth = 1;
            context.stroke();
            
            points.push({
                x: x,
                y: y,
                radius: radius,
                dataX: item.x,
                dataY: item.y,
                label: item.label
            });
        });
        
        return points;
    }
}

/**
 * プログレスバーレンダラー
 */
export class ProgressBarRenderer {
    render(context, data, options) {
        try {
            const canvas = context.canvas;
            const chartArea = this.calculateChartArea(canvas, options);
            const processedData = this.processData(data);
            
            // プログレスバーの描画
            const bars = this.renderProgressBars(context, processedData, chartArea, options);
            
            return {
                type: 'progress',
                dataPoints: processedData.length,
                bars: bars,
                chartArea: chartArea
            };
            
        } catch (error) {
            console.error('Progress bar rendering failed:', error);
            return { type: 'progress', error: error.message };
        }
    }
    
    calculateChartArea(canvas, options) {
        const padding = options.padding || 20;
        return {
            x: padding,
            y: padding,
            width: canvas.width - (padding * 2),
            height: canvas.height - (padding * 2)
        };
    }
    
    processData(data) {
        return data.map((item, index) => {
            if (typeof item === 'number') {
                return {
                    value: Math.max(0, Math.min(100, item)),
                    label: `Progress ${index + 1}`,
                    max: 100
                };
            }
            return {
                value: Math.max(0, Math.min(item.max || 100, item.value || 0)),
                max: item.max || 100,
                label: item.label || `Progress ${index + 1}`
            };
        });
    }
    
    renderProgressBars(context, data, chartArea, options) {
        const barHeight = 30;
        const barSpacing = 10;
        const totalHeight = (barHeight + barSpacing) * data.length - barSpacing;
        const startY = chartArea.y + (chartArea.height - totalHeight) / 2;
        const bars = [];
        
        data.forEach((item, index) => {
            const y = startY + index * (barHeight + barSpacing);
            const progressWidth = (item.value / item.max) * chartArea.width;
            
            // 背景バー
            context.fillStyle = '#E5E7EB';
            context.fillRect(chartArea.x, y, chartArea.width, barHeight);
            
            // プログレスバー
            const color = item.color || options.theme.palette[index % options.theme.palette.length];
            context.fillStyle = color;
            context.fillRect(chartArea.x, y, progressWidth, barHeight);
            
            // 枠線
            context.strokeStyle = options.theme.colors.dark;
            context.lineWidth = 1;
            context.strokeRect(chartArea.x, y, chartArea.width, barHeight);
            
            // ラベルとパーセンテージ
            context.fillStyle = options.theme.colors.dark;
            context.font = `${options.fontSize}px ${options.fontFamily}`;
            context.textAlign = 'left';
            
            // ラベル
            context.fillText(item.label, chartArea.x, y - 5);
            
            // パーセンテージ
            const percentage = ((item.value / item.max) * 100).toFixed(1);
            context.textAlign = 'right';
            context.fillText(`${percentage}%`, chartArea.x + chartArea.width, y - 5);
            
            bars.push({
                x: chartArea.x,
                y: y,
                width: chartArea.width,
                height: barHeight,
                progressWidth: progressWidth,
                value: item.value,
                max: item.max,
                percentage: parseFloat(percentage)
            });
        });
        
        return bars;
    }
}