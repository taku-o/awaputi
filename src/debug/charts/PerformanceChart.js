/**
 * Performance Chart
 * パフォーマンスメトリクス用のリアルタイムチャート
 */

export class PerformanceChart {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = {
            label: 'Metric',
            color: '#00ff00',
            backgroundColor: 'rgba(0, 255, 0, 0.1)',
            min: 0,
            max: 100,
            warning: 80,
            critical: 90,
            samples: 100,
            gridLines: 5,
            ...config
        };
        
        // データポイント
        this.dataPoints = [];
        this.maxDataPoints = this.config.samples;
        
        // 描画設定
        this.padding = { top: 20, right: 20, bottom: 30, left: 50 };
        this.chartArea = {
            x: this.padding.left,
            y: this.padding.top,
            width: this.canvas.width - this.padding.left - this.padding.right,
            height: this.canvas.height - this.padding.top - this.padding.bottom
        };
        
        // アニメーション
        this.animationId = null;
        this.lastUpdate = 0;
        
        this.setupCanvas();
        this.render();
    }

    setupCanvas() {
        // キャンバスの初期設定
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    update(metrics) {
        const key = this.config.key || Object.keys(metrics)[0];
        const value = metrics[key];
        
        if (value !== undefined) {
            const now = Date.now();
            this.dataPoints.push({
                value,
                timestamp: now
            });
            
            // データポイント数の制限
            if (this.dataPoints.length > this.maxDataPoints) {
                this.dataPoints.shift();
            }
            
            // 適度な頻度で再描画
            if (now - this.lastUpdate > 50) { // 20FPS
                this.render();
                this.lastUpdate = now;
            }
        }
    }

    render() {
        this.clear();
        this.drawBackground();
        this.drawGrid();
        this.drawThresholdLines();
        this.drawDataLine();
        this.drawDataPoints();
        this.drawLabels();
        this.drawLegend();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBackground() {
        // チャート背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(
            this.chartArea.x, 
            this.chartArea.y, 
            this.chartArea.width, 
            this.chartArea.height
        );
        
        // チャート境界線
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(
            this.chartArea.x, 
            this.chartArea.y, 
            this.chartArea.width, 
            this.chartArea.height
        );
    }

    drawGrid() {
        this.ctx.strokeStyle = '#222';
        this.ctx.lineWidth = 1;
        
        // 水平グリッド線
        for (let i = 0; i <= this.config.gridLines; i++) {
            const y = this.chartArea.y + (this.chartArea.height / this.config.gridLines) * i;
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.chartArea.x, y);
            this.ctx.lineTo(this.chartArea.x + this.chartArea.width, y);
            this.ctx.stroke();
        }
        
        // 垂直グリッド線
        const verticalLines = 5;
        for (let i = 0; i <= verticalLines; i++) {
            const x = this.chartArea.x + (this.chartArea.width / verticalLines) * i;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.chartArea.y);
            this.ctx.lineTo(x, this.chartArea.y + this.chartArea.height);
            this.ctx.stroke();
        }
    }

    drawThresholdLines() {
        // 警告ライン
        this.drawThresholdLine(this.config.warning, '#ffaa00', 'Warning');
        
        // 危険ライン
        this.drawThresholdLine(this.config.critical, '#ff3333', 'Critical');
    }

    drawThresholdLine(value, color, label) {
        const y = this.valueToY(value);
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.chartArea.x, y);
        this.ctx.lineTo(this.chartArea.x + this.chartArea.width, y);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
        
        // ラベル
        this.ctx.fillStyle = color;
        this.ctx.font = '10px monospace';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(
            `${label}: ${value}`, 
            this.chartArea.x + this.chartArea.width - 5, 
            y - 3
        );
    }

    drawDataLine() {
        if (this.dataPoints.length < 2) return;
        
        // データライン
        this.ctx.strokeStyle = this.config.color;
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        
        for (let i = 0; i < this.dataPoints.length; i++) {
            const x = this.indexToX(i);
            const y = this.valueToY(this.dataPoints[i].value);
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.stroke();
        
        // エリア塗りつぶし
        if (this.config.backgroundColor) {
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillStyle = this.config.backgroundColor;
            
            // 下端に線を追加
            this.ctx.lineTo(
                this.indexToX(this.dataPoints.length - 1), 
                this.chartArea.y + this.chartArea.height
            );
            this.ctx.lineTo(
                this.indexToX(0), 
                this.chartArea.y + this.chartArea.height
            );
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.globalAlpha = 1;
        }
    }

    drawDataPoints() {
        if (this.dataPoints.length === 0) return;
        
        // 最新のデータポイントをハイライト
        const latestPoint = this.dataPoints[this.dataPoints.length - 1];
        const x = this.indexToX(this.dataPoints.length - 1);
        const y = this.valueToY(latestPoint.value);
        
        this.ctx.fillStyle = this.config.color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 現在値の表示
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(
            `${latestPoint.value.toFixed(1)}`, 
            x + 8, 
            y - 8
        );
    }

    drawLabels() {
        this.ctx.fillStyle = '#ccc';
        this.ctx.font = '10px monospace';
        
        // Y軸ラベル
        this.ctx.textAlign = 'right';
        for (let i = 0; i <= this.config.gridLines; i++) {
            const value = this.config.max - (this.config.max - this.config.min) / this.config.gridLines * i;
            const y = this.chartArea.y + (this.chartArea.height / this.config.gridLines) * i + 3;
            
            this.ctx.fillText(value.toFixed(0), this.chartArea.x - 5, y);
        }
        
        // X軸ラベル（時間）
        this.ctx.textAlign = 'center';
        const timeLabels = ['5s', '4s', '3s', '2s', '1s', 'Now'];
        for (let i = 0; i < timeLabels.length; i++) {
            const x = this.chartArea.x + (this.chartArea.width / (timeLabels.length - 1)) * i;
            this.ctx.fillText(
                timeLabels[i], 
                x, 
                this.chartArea.y + this.chartArea.height + 15
            );
        }
    }

    drawLegend() {
        // チャートタイトル
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 12px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(this.config.label, this.chartArea.x, this.chartArea.y - 5);
        
        // 統計情報
        if (this.dataPoints.length > 0) {
            const values = this.dataPoints.map(p => p.value);
            const min = Math.min(...values);
            const max = Math.max(...values);
            const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
            
            this.ctx.fillStyle = '#888';
            this.ctx.font = '9px monospace';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(
                `Min: ${min.toFixed(1)} Max: ${max.toFixed(1)} Avg: ${avg.toFixed(1)}`, 
                this.chartArea.x + this.chartArea.width, 
                this.chartArea.y - 5
            );
        }
    }

    valueToY(value) {
        const normalizedValue = (value - this.config.min) / (this.config.max - this.config.min);
        return this.chartArea.y + this.chartArea.height - (normalizedValue * this.chartArea.height);
    }

    indexToX(index) {
        if (this.dataPoints.length <= 1) {
            return this.chartArea.x + this.chartArea.width / 2;
        }
        
        const ratio = index / (this.dataPoints.length - 1);
        return this.chartArea.x + ratio * this.chartArea.width;
    }

    updateThresholds(warning, critical) {
        this.config.warning = warning;
        this.config.critical = critical;
        this.render();
    }

    setRange(min, max) {
        this.config.min = min;
        this.config.max = max;
        this.render();
    }

    addDataPoint(value, timestamp = Date.now()) {
        this.dataPoints.push({
            value,
            timestamp
        });
        
        if (this.dataPoints.length > this.maxDataPoints) {
            this.dataPoints.shift();
        }
        
        this.render();
    }

    clearData() {
        this.dataPoints = [];
        this.render();
    }

    getStatistics() {
        if (this.dataPoints.length === 0) {
            return { min: 0, max: 0, avg: 0, current: 0 };
        }
        
        const values = this.dataPoints.map(p => p.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
        const current = values[values.length - 1];
        
        return { min, max, avg, current };
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        
        this.chartArea = {
            x: this.padding.left,
            y: this.padding.top,
            width: width - this.padding.left - this.padding.right,
            height: height - this.padding.top - this.padding.bottom
        };
        
        this.setupCanvas();
        this.render();
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.dataPoints = [];
        this.ctx = null;
        this.canvas = null;
    }
}

// デフォルトエクスポート
export default PerformanceChart;