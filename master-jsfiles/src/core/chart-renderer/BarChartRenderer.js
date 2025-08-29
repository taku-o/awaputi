/**
 * BarChartRenderer - 棒グラフレンダラー
 * 
 * 垂直棒グラフの描画を専門的に処理します
 */

export class BarChartRenderer {
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
            
            // バーの描画
            const bars = this.renderBars(context, processedData, chartArea, scales, options);
            
            // 凡例の描画
            if (options.showLegend && processedData.some(d => d.series)) {
                this.renderLegend(context, processedData, chartArea, options);
            }
            
            return {
                type: 'bar',
                dataPoints: processedData.length,
                min: scales.yMin,
                max: scales.yMax,
                bars: bars,
                chartArea: chartArea,
                scales: scales
            };
            
        } catch (error) {
            console.error('Bar chart rendering failed:', error);
            return { type: 'bar', error: error.message };
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
                return { value: item, label: `Item ${index + 1}`, index };
            }
            return { ...item, index };
        });
    }
    
    calculateScales(data, chartArea) {
        const values = data.map(d => d.value);
        const yMin = Math.min(0, Math.min(...values));
        const yMax = Math.max(...values);
        const yRange = yMax - yMin;
        
        return {
            xScale: chartArea.width / data.length,
            yScale: chartArea.height / (yRange || 1),
            yMin,
            yMax,
            yRange
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
    
    renderBars(context, data, chartArea, scales, options) {
        const barWidth = scales.xScale * 0.8;
        const barGap = scales.xScale * 0.1;
        const bars = [];
        
        data.forEach((item, index) => {
            const barHeight = Math.abs(item.value) * scales.yScale;
            const x = chartArea.x + (index * scales.xScale) + barGap;
            const y = item.value >= 0 
                ? chartArea.y + chartArea.height - barHeight
                : chartArea.y + chartArea.height;
            
            // バーの描画
            context.fillStyle = item.color || options.theme.palette[index % options.theme.palette.length];
            context.fillRect(x, y, barWidth, barHeight);
            
            // バーの枠線
            context.strokeStyle = options.theme.colors.dark;
            context.lineWidth = 1;
            context.strokeRect(x, y, barWidth, barHeight);
            
            // ラベルの描画
            if (item.label) {
                context.fillStyle = options.theme.colors.dark;
                context.font = `${options.fontSize}px ${options.fontFamily}`;
                context.textAlign = 'center';
                context.fillText(item.label, x + barWidth / 2, chartArea.y + chartArea.height + 15);
            }
            
            bars.push({ x, y, width: barWidth, height: barHeight, value: item.value });
        });
        
        return bars;
    }
    
    renderLegend(context, data, chartArea, options) {
        // 凡例実装（簡略化）
        const legendY = chartArea.y - 10;
        context.font = `${options.fontSize}px ${options.fontFamily}`;
        context.fillStyle = options.theme.colors.dark;
        context.textAlign = 'left';
        context.fillText('凡例', chartArea.x, legendY);
    }
}