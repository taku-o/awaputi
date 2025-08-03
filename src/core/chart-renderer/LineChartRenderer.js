/**
 * LineChartRenderer - 線グラフレンダラー
 * 
 * 連続データの線グラフ描画を専門的に処理します
 */

export class LineChartRenderer {
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
            
            // 線の描画
            const lines = this.renderLines(context, processedData, chartArea, scales, options);
            
            // データポイントの描画
            this.renderDataPoints(context, processedData, chartArea, scales, options);
            
            return {
                type: 'line',
                dataPoints: processedData.length,
                min: scales.yMin,
                max: scales.yMax,
                lines: lines,
                chartArea: chartArea,
                scales: scales
            };
            
        } catch (error) {
            console.error('Line chart rendering failed:', error);
            return { type: 'line', error: error.message };
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
                return { value: item, x: index, label: `Point ${index + 1}` };
            }
            return { ...item, x: item.x || index };
        });
    }
    
    calculateScales(data, chartArea) {
        const values = data.map(d => d.value);
        const xValues = data.map(d => d.x);
        
        const yMin = Math.min(...values);
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
    
    renderLines(context, data, chartArea, scales, options) {
        if (data.length < 2) return [];
        
        context.strokeStyle = options.lineColor || options.theme.colors.primary;
        context.lineWidth = options.lineWidth || 2;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        
        context.beginPath();
        
        data.forEach((item, index) => {
            const x = chartArea.x + (item.x - scales.xMin) * scales.xScale;
            const y = chartArea.y + chartArea.height - (item.value - scales.yMin) * scales.yScale;
            
            if (index === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
        });
        
        context.stroke();
        
        return [{ path: data, color: context.strokeStyle }];
    }
    
    renderDataPoints(context, data, chartArea, scales, options) {
        const pointRadius = options.pointRadius || 4;
        
        data.forEach((item, index) => {
            const x = chartArea.x + (item.x - scales.xMin) * scales.xScale;
            const y = chartArea.y + chartArea.height - (item.value - scales.yMin) * scales.yScale;
            
            // データポイント
            context.fillStyle = options.pointColor || options.theme.colors.primary;
            context.beginPath();
            context.arc(x, y, pointRadius, 0, 2 * Math.PI);
            context.fill();
            
            // ポイントの枠線
            context.strokeStyle = '#FFFFFF';
            context.lineWidth = 2;
            context.stroke();
        });
    }
}