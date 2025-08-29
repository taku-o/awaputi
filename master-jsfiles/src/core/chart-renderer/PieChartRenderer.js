/**
 * PieChartRenderer - 円グラフレンダラー
 * 
 * 割合を表現する円グラフの描画を専門的に処理します
 */

export class PieChartRenderer {
    render(context, data, options) {
        try {
            const canvas = context.canvas;
            const chartArea = this.calculateChartArea(canvas, options);
            const processedData = this.processData(data);
            
            // 円グラフの描画
            const slices = this.renderSlices(context, processedData, chartArea, options);
            
            // ラベルの描画
            if (options.showLabels !== false) {
                this.renderLabels(context, processedData, slices, chartArea, options);
            }
            
            // 凡例の描画
            if (options.showLegend) {
                this.renderLegend(context, processedData, chartArea, options);
            }
            
            return {
                type: 'pie',
                dataPoints: processedData.length,
                slices: slices,
                total: processedData.reduce((sum, item) => sum + item.value, 0),
                chartArea: chartArea
            };
            
        } catch (error) {
            console.error('Pie chart rendering failed:', error);
            return { type: 'pie', error: error.message };
        }
    }
    
    calculateChartArea(canvas, options) {
        const padding = options.padding || 20;
        const size = Math.min(canvas.width, canvas.height) - (padding * 2);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        return {
            centerX,
            centerY,
            radius: size / 2,
            size
        };
    }
    
    processData(data) {
        const total = data.reduce((sum, item) => {
            const value = typeof item === 'number' ? item : item.value;
            return sum + Math.abs(value);
        }, 0);
        
        return data.map((item, index) => {
            if (typeof item === 'number') {
                return {
                    value: item,
                    label: `Slice ${index + 1}`,
                    percentage: (item / total) * 100
                };
            }
            return {
                ...item,
                percentage: (item.value / total) * 100
            };
        });
    }
    
    renderSlices(context, data, chartArea, options) {
        const slices = [];
        let currentAngle = -Math.PI / 2; // 12時位置から開始
        
        data.forEach((item, index) => {
            const sliceAngle = (item.percentage / 100) * 2 * Math.PI;
            const color = item.color || options.theme.palette[index % options.theme.palette.length];
            
            // スライスの描画
            context.fillStyle = color;
            context.beginPath();
            context.moveTo(chartArea.centerX, chartArea.centerY);
            context.arc(
                chartArea.centerX, 
                chartArea.centerY, 
                chartArea.radius, 
                currentAngle, 
                currentAngle + sliceAngle
            );
            context.closePath();
            context.fill();
            
            // スライスの枠線
            context.strokeStyle = '#FFFFFF';
            context.lineWidth = 2;
            context.stroke();
            
            slices.push({
                startAngle: currentAngle,
                endAngle: currentAngle + sliceAngle,
                angle: sliceAngle,
                color: color,
                value: item.value,
                percentage: item.percentage,
                label: item.label
            });
            
            currentAngle += sliceAngle;
        });
        
        return slices;
    }
    
    renderLabels(context, data, slices, chartArea, options) {
        context.font = `${options.fontSize}px ${options.fontFamily}`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        slices.forEach((slice, index) => {
            const midAngle = slice.startAngle + (slice.angle / 2);
            const labelRadius = chartArea.radius * 0.7;
            
            const x = chartArea.centerX + Math.cos(midAngle) * labelRadius;
            const y = chartArea.centerY + Math.sin(midAngle) * labelRadius;
            
            // パーセンテージ表示
            context.fillStyle = '#FFFFFF';
            context.fillText(`${slice.percentage.toFixed(1)}%`, x, y);
        });
    }
    
    renderLegend(context, data, chartArea, options) {
        const legendX = chartArea.centerX + chartArea.radius + 20;
        let legendY = chartArea.centerY - (data.length * 20) / 2;
        
        context.font = `${options.fontSize}px ${options.fontFamily}`;
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        
        data.forEach((item, index) => {
            const color = item.color || options.theme.palette[index % options.theme.palette.length];
            
            // 色サンプル
            context.fillStyle = color;
            context.fillRect(legendX, legendY - 8, 16, 16);
            
            // ラベル
            context.fillStyle = options.theme.colors.dark;
            context.fillText(item.label, legendX + 24, legendY);
            
            legendY += 24;
        });
    }
}