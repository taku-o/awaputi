/**
 * Performance Visualizer
 * リアルタイムパフォーマンス可視化システム
 */

export class PerformanceVisualizer {
    constructor(monitor) {
        this.monitor = monitor;
        this.canvas = null;
        this.ctx = null;
        this.charts = new Map();
        this.animationId = null;
        
        // 可視化設定
        this.settings = {
            updateInterval: 100, // ms
            timeWindow: 30000, // 30秒
            chartHeight: 150,
            gridColor: '#333333',
            textColor: '#ffffff',
            backgroundColor: '#1a1a1a',
            colors: {
                fps: '#00ff00',
                memory: '#ff6b6b',
                frameTime: '#4ecdc4',
                drawCalls: '#ffe66d',
                entityCount: '#a8e6cf',
                warning: '#ffa500',
                critical: '#ff0000'
            }
        };
        
        // チャート状態
        this.chartState = {
            lastUpdate: 0,
            viewportOffset: 0,
            zoomLevel: 1,
            selectedMetric: null,
            hoverPoint: null
        };
        
        this.initialize();
    }

    initialize() {
        this.createCanvas();
        this.setupCharts();
        this.startRendering();
        
        console.log('[PerformanceVisualizer] Performance visualization initialized');
    }

    /**
     * Canvas作成と設定
     */
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '10px';
        this.canvas.style.right = '10px';
        this.canvas.style.zIndex = '10000';
        this.canvas.style.border = '2px solid #333';
        this.canvas.style.backgroundColor = this.settings.backgroundColor;
        this.canvas.style.display = 'none'; // Initially hidden
        
        this.ctx = this.canvas.getContext('2d');
        
        // イベントリスナー設定
        this.setupCanvasEvents();
        
        // DOM追加
        document.body.appendChild(this.canvas);
    }

    /**
     * Canvasイベント設定
     */
    setupCanvasEvents() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.handleMouseMove(x, y);
        });
        
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.handleMouseClick(x, y);
        });
        
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.handleWheel(e.deltaY);
        });
    }

    /**
     * チャート設定
     */
    setupCharts() {
        this.charts.set('fps', new PerformanceChart({
            name: 'FPS',
            color: this.settings.colors.fps,
            minValue: 0,
            maxValue: 120,
            unit: 'fps',
            position: { x: 10, y: 10, width: 380, height: this.settings.chartHeight }
        }));
        
        this.charts.set('memory', new PerformanceChart({
            name: 'Memory Usage',
            color: this.settings.colors.memory,
            minValue: 0,
            maxValue: 200, // MB
            unit: 'MB',
            position: { x: 410, y: 10, width: 380, height: this.settings.chartHeight }
        }));
        
        this.charts.set('frameTime', new PerformanceChart({
            name: 'Frame Time',
            color: this.settings.colors.frameTime,
            minValue: 0,
            maxValue: 50, // ms
            unit: 'ms',
            position: { x: 10, y: 180, width: 380, height: this.settings.chartHeight }
        }));
        
        this.charts.set('drawCalls', new PerformanceChart({
            name: 'Draw Calls',
            color: this.settings.colors.drawCalls,
            minValue: 0,
            maxValue: 500,
            unit: 'calls',
            position: { x: 410, y: 180, width: 380, height: this.settings.chartHeight }
        }));
        
        this.charts.set('entities', new PerformanceChart({
            name: 'Entity Count',
            color: this.settings.colors.entityCount,
            minValue: 0,
            maxValue: 1000,
            unit: 'entities',
            position: { x: 10, y: 350, width: 380, height: this.settings.chartHeight }
        }));
        
        this.charts.set('heatmap', new PerformanceHeatmap({
            name: 'Performance Heatmap',
            position: { x: 410, y: 350, width: 380, height: this.settings.chartHeight }
        }));
    }

    /**
     * レンダリング開始
     */
    startRendering() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        const render = () => {
            if (this.canvas.style.display !== 'none') {
                this.updateCharts();
                this.renderCharts();
            }
            
            this.animationId = requestAnimationFrame(render);
        };
        
        render();
    }

    /**
     * チャートデータ更新
     */
    updateCharts() {
        const now = Date.now();
        
        if (now - this.chartState.lastUpdate < this.settings.updateInterval) {
            return;
        }
        
        this.chartState.lastUpdate = now;
        
        // メトリクス取得
        const metrics = this.monitor.getCurrentMetrics();
        const historyData = this.monitor.getHistoryData();
        
        // FPSチャート更新
        const fpsChart = this.charts.get('fps');
        fpsChart.addDataPoint({
            timestamp: now,
            value: metrics.frame.currentFPS || 0,
            threshold: { warning: 45, critical: 30 }
        });
        
        // メモリチャート更新
        const memoryChart = this.charts.get('memory');
        memoryChart.addDataPoint({
            timestamp: now,
            value: metrics.memory.usedMemory || 0,
            threshold: { warning: 150, critical: 180 }
        });
        
        // フレーム時間チャート更新
        const frameTimeChart = this.charts.get('frameTime');
        frameTimeChart.addDataPoint({
            timestamp: now,
            value: metrics.frame.frameTime || 0,
            threshold: { warning: 20, critical: 33 }
        });
        
        // 描画コールチャート更新
        const drawCallsChart = this.charts.get('drawCalls');
        drawCallsChart.addDataPoint({
            timestamp: now,
            value: metrics.render.drawCalls || 0,
            threshold: { warning: 300, critical: 400 }
        });
        
        // エンティティ数チャート更新
        const entitiesChart = this.charts.get('entities');
        entitiesChart.addDataPoint({
            timestamp: now,
            value: metrics.game.entityCount || 0,
            threshold: { warning: 500, critical: 800 }
        });
        
        // ヒートマップ更新
        const heatmap = this.charts.get('heatmap');
        heatmap.updateHeatmap({
            fps: metrics.frame.currentFPS || 0,
            memory: metrics.memory.pressureLevel || 0,
            frameTime: metrics.frame.frameTime || 0,
            timestamp: now
        });
        
        // 古いデータのクリーンアップ
        this.cleanupOldData(now);
    }

    /**
     * 古いデータのクリーンアップ
     */
    cleanupOldData(currentTime) {
        const cutoffTime = currentTime - this.settings.timeWindow;
        
        this.charts.forEach(chart => {
            if (chart.cleanupOldData) {
                chart.cleanupOldData(cutoffTime);
            }
        });
    }

    /**
     * チャートレンダリング
     */
    renderCharts() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // 背景クリア
        ctx.fillStyle = this.settings.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // タイトル描画
        this.renderTitle(ctx);
        
        // 各チャートレンダリング
        this.charts.forEach(chart => {
            chart.render(ctx, this.settings);
        });
        
        // 統計情報表示
        this.renderStatistics(ctx);
        
        // ホバー情報表示
        if (this.chartState.hoverPoint) {
            this.renderHoverInfo(ctx);
        }
        
        // 警告・エラー表示
        this.renderAlerts(ctx);
    }

    /**
     * タイトル描画
     */
    renderTitle(ctx) {
        ctx.fillStyle = this.settings.textColor;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Real-time Performance Monitor', this.canvas.width / 2, 25);
        
        // 時間窓表示
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`Time Window: ${this.settings.timeWindow / 1000}s`, this.canvas.width - 10, 45);
    }

    /**
     * 統計情報レンダリング
     */
    renderStatistics(ctx) {
        const stats = this.monitor.getStatistics();
        const y = this.canvas.height - 80;
        
        ctx.fillStyle = this.settings.textColor;
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        
        const statsText = [
            `Uptime: ${Math.floor(stats.uptime / 1000)}s`,
            `Samples: ${stats.totalSamples}`,
            `Rate: ${stats.samplesPerSecond.toFixed(1)}/s`,
            `Errors: ${stats.totalErrors || 0}`
        ];
        
        statsText.forEach((text, index) => {
            ctx.fillText(text, 10 + index * 120, y);
        });
    }

    /**
     * ホバー情報表示
     */
    renderHoverInfo(ctx) {
        const hover = this.chartState.hoverPoint;
        if (!hover) return;
        
        const boxWidth = 200;
        const boxHeight = 100;
        const x = Math.min(hover.x + 10, this.canvas.width - boxWidth);
        const y = Math.max(hover.y - boxHeight, 10);
        
        // ボックス描画
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, boxWidth, boxHeight);
        ctx.strokeStyle = this.settings.gridColor;
        ctx.strokeRect(x, y, boxWidth, boxHeight);
        
        // テキスト描画
        ctx.fillStyle = this.settings.textColor;
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        
        const lines = [
            `Metric: ${hover.metric}`,
            `Value: ${hover.value.toFixed(2)} ${hover.unit}`,
            `Time: ${new Date(hover.timestamp).toLocaleTimeString()}`,
            `Status: ${hover.status}`
        ];
        
        lines.forEach((line, index) => {
            ctx.fillText(line, x + 10, y + 20 + index * 15);
        });
    }

    /**
     * アラート表示
     */
    renderAlerts(ctx) {
        const analysis = this.monitor.getAnalysisResults();
        if (!analysis.anomalies.length) return;
        
        const alertY = 60;
        const criticalAnomalies = analysis.anomalies.filter(a => a.severity === 'critical');
        const warningAnomalies = analysis.anomalies.filter(a => a.severity === 'warning');
        
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        
        // 重要なアラート
        if (criticalAnomalies.length > 0) {
            ctx.fillStyle = this.settings.colors.critical;
            ctx.fillText(`🚨 Critical: ${criticalAnomalies.length} issues`, 10, alertY);
        }
        
        // 警告
        if (warningAnomalies.length > 0) {
            ctx.fillStyle = this.settings.colors.warning;
            ctx.fillText(`⚠️ Warning: ${warningAnomalies.length} issues`, 200, alertY);
        }
    }

    /**
     * マウス移動ハンドラ
     */
    handleMouseMove(x, y) {
        // ホバー情報更新
        let foundHover = null;
        
        this.charts.forEach((chart, name) => {
            if (chart.isPointInChart && chart.isPointInChart(x, y)) {
                const dataPoint = chart.getDataPointAt(x, y);
                if (dataPoint) {
                    foundHover = {
                        x: x,
                        y: y,
                        metric: name,
                        value: dataPoint.value,
                        unit: chart.config.unit || '',
                        timestamp: dataPoint.timestamp,
                        status: this.getStatusFromValue(dataPoint.value, dataPoint.threshold)
                    };
                }
            }
        });
        
        this.chartState.hoverPoint = foundHover;
    }

    /**
     * マウスクリックハンドラ
     */
    handleMouseClick(x, y) {
        // チャート選択処理
        this.charts.forEach((chart, name) => {
            if (chart.isPointInChart && chart.isPointInChart(x, y)) {
                this.chartState.selectedMetric = this.chartState.selectedMetric === name ? null : name;
            }
        });
    }

    /**
     * ホイールハンドラ（ズーム）
     */
    handleWheel(deltaY) {
        const zoomFactor = deltaY > 0 ? 0.9 : 1.1;
        this.chartState.zoomLevel = Math.max(0.5, Math.min(3, this.chartState.zoomLevel * zoomFactor));
        
        // ズームレベルに応じて時間窓調整
        this.settings.timeWindow = Math.max(5000, Math.min(120000, 30000 / this.chartState.zoomLevel));
    }

    /**
     * 値から状態判定
     */
    getStatusFromValue(value, threshold) {
        if (!threshold) return 'normal';
        
        if (value >= threshold.critical) return 'critical';
        if (value >= threshold.warning) return 'warning';
        return 'normal';
    }

    /**
     * 可視化表示/非表示切り替え
     */
    toggle() {
        const isVisible = this.canvas.style.display !== 'none';
        this.canvas.style.display = isVisible ? 'none' : 'block';
        
        console.log(`[PerformanceVisualizer] Visualization ${isVisible ? 'hidden' : 'shown'}`);
    }

    /**
     * 設定更新
     */
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        
        // チャート設定更新
        this.charts.forEach(chart => {
            if (chart.updateSettings) {
                chart.updateSettings(this.settings);
            }
        });
        
        console.log('[PerformanceVisualizer] Settings updated');
    }

    /**
     * スクリーンショット作成
     */
    captureScreenshot() {
        const dataURL = this.canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `performance-${Date.now()}.png`;
        link.href = dataURL;
        link.click();
        
        console.log('[PerformanceVisualizer] Screenshot captured');
    }

    /**
     * クリーンアップ
     */
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        this.charts.clear();
        
        console.log('[PerformanceVisualizer] Destroyed');
    }
}

/**
 * パフォーマンスチャートクラス
 */
class PerformanceChart {
    constructor(config) {
        this.config = {
            name: 'Chart',
            color: '#ffffff',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            minValue: 0,
            maxValue: 100,
            unit: '',
            position: { x: 0, y: 0, width: 300, height: 150 },
            showGrid: true,
            showThresholds: true,
            ...config
        };
        
        this.data = [];
        this.maxDataPoints = 300;
    }

    addDataPoint(dataPoint) {
        this.data.push({
            timestamp: dataPoint.timestamp,
            value: dataPoint.value,
            threshold: dataPoint.threshold
        });
        
        // データポイント数制限
        if (this.data.length > this.maxDataPoints) {
            this.data.shift();
        }
    }

    render(ctx, globalSettings) {
        const pos = this.config.position;
        
        // 背景描画
        ctx.fillStyle = this.config.backgroundColor;
        ctx.fillRect(pos.x, pos.y, pos.width, pos.height);
        
        // 境界線描画
        ctx.strokeStyle = globalSettings.gridColor;
        ctx.strokeRect(pos.x, pos.y, pos.width, pos.height);
        
        // タイトル描画
        ctx.fillStyle = globalSettings.textColor;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(this.config.name, pos.x + 5, pos.y + 15);
        
        // 現在値表示
        if (this.data.length > 0) {
            const currentValue = this.data[this.data.length - 1].value;
            const valueText = `${currentValue.toFixed(1)} ${this.config.unit}`;
            ctx.textAlign = 'right';
            ctx.fillText(valueText, pos.x + pos.width - 5, pos.y + 15);
        }
        
        // グリッド描画
        if (this.config.showGrid) {
            this.renderGrid(ctx, globalSettings);
        }
        
        // 閾値線描画
        if (this.config.showThresholds && this.data.length > 0) {
            this.renderThresholds(ctx, globalSettings);
        }
        
        // データ線描画
        if (this.data.length > 1) {
            this.renderDataLine(ctx);
        }
    }

    renderGrid(ctx, globalSettings) {
        const pos = this.config.position;
        const gridLines = 5;
        
        ctx.strokeStyle = globalSettings.gridColor;
        ctx.setLineDash([2, 2]);
        ctx.lineWidth = 0.5;
        
        // 水平グリッド
        for (let i = 1; i < gridLines; i++) {
            const y = pos.y + (pos.height * i / gridLines);
            ctx.beginPath();
            ctx.moveTo(pos.x, y);
            ctx.lineTo(pos.x + pos.width, y);
            ctx.stroke();
        }
        
        // 垂直グリッド
        for (let i = 1; i < gridLines; i++) {
            const x = pos.x + (pos.width * i / gridLines);
            ctx.beginPath();
            ctx.moveTo(x, pos.y);
            ctx.lineTo(x, pos.y + pos.height);
            ctx.stroke();
        }
        
        ctx.setLineDash([]);
        ctx.lineWidth = 1;
    }

    renderThresholds(ctx, globalSettings) {
        const pos = this.config.position;
        const lastDataPoint = this.data[this.data.length - 1];
        
        if (!lastDataPoint.threshold) return;
        
        const drawThresholdLine = (value, color, label) => {
            if (value < this.config.minValue || value > this.config.maxValue) return;
            
            const y = pos.y + pos.height - ((value - this.config.minValue) / (this.config.maxValue - this.config.minValue)) * pos.height;
            
            ctx.strokeStyle = color;
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pos.x, y);
            ctx.lineTo(pos.x + pos.width, y);
            ctx.stroke();
            
            // ラベル
            ctx.fillStyle = color;
            ctx.font = '10px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(label, pos.x + 5, y - 3);
        };
        
        if (lastDataPoint.threshold.warning) {
            drawThresholdLine(lastDataPoint.threshold.warning, globalSettings.colors.warning, 'Warning');
        }
        
        if (lastDataPoint.threshold.critical) {
            drawThresholdLine(lastDataPoint.threshold.critical, globalSettings.colors.critical, 'Critical');
        }
        
        ctx.setLineDash([]);
    }

    renderDataLine(ctx) {
        const pos = this.config.position;
        const valueRange = this.config.maxValue - this.config.minValue;
        
        ctx.strokeStyle = this.config.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        let firstPoint = true;
        const now = Date.now();
        const timeWindow = 30000; // 30秒
        
        for (let i = 0; i < this.data.length; i++) {
            const dataPoint = this.data[i];
            const age = now - dataPoint.timestamp;
            
            if (age > timeWindow) continue;
            
            const x = pos.x + pos.width - (age / timeWindow) * pos.width;
            const y = pos.y + pos.height - ((dataPoint.value - this.config.minValue) / valueRange) * pos.height;
            
            if (firstPoint) {
                ctx.moveTo(x, y);
                firstPoint = false;
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
    }

    isPointInChart(x, y) {
        const pos = this.config.position;
        return x >= pos.x && x <= pos.x + pos.width &&
               y >= pos.y && y <= pos.y + pos.height;
    }

    getDataPointAt(x, y) {
        if (!this.isPointInChart(x, y)) return null;
        
        const pos = this.config.position;
        const relativeX = x - pos.x;
        const timeWindow = 30000;
        const now = Date.now();
        
        // X位置から時間を逆算
        const targetTime = now - (1 - relativeX / pos.width) * timeWindow;
        
        // 最も近いデータポイントを検索
        let closestPoint = null;
        let minDistance = Infinity;
        
        for (const dataPoint of this.data) {
            const distance = Math.abs(dataPoint.timestamp - targetTime);
            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = dataPoint;
            }
        }
        
        return closestPoint;
    }

    cleanupOldData(cutoffTime) {
        this.data = this.data.filter(point => point.timestamp > cutoffTime);
    }

    updateSettings(settings) {
        // 設定更新処理
        if (settings.colors && settings.colors[this.config.name.toLowerCase()]) {
            this.config.color = settings.colors[this.config.name.toLowerCase()];
        }
    }
}

/**
 * パフォーマンスヒートマップクラス
 */
class PerformanceHeatmap {
    constructor(config) {
        this.config = {
            name: 'Heatmap',
            position: { x: 0, y: 0, width: 300, height: 150 },
            cellSize: 5,
            maxAge: 60000, // 1分
            ...config
        };
        
        this.heatmapData = [];
        this.colorScale = [
            { value: 0, color: [0, 255, 0] },     // Green
            { value: 0.5, color: [255, 255, 0] }, // Yellow
            { value: 1, color: [255, 0, 0] }      // Red
        ];
    }

    updateHeatmap(data) {
        // パフォーマンス指標を0-1に正規化
        const normalizedScore = this.calculatePerformanceScore(data);
        
        this.heatmapData.push({
            timestamp: data.timestamp,
            score: normalizedScore,
            details: data
        });
        
        // 古いデータのクリーンアップ
        const cutoffTime = data.timestamp - this.config.maxAge;
        this.heatmapData = this.heatmapData.filter(point => point.timestamp > cutoffTime);
    }

    calculatePerformanceScore(data) {
        // FPS、メモリ、フレーム時間から統合スコア計算
        let score = 0;
        
        // FPS (60fps = 0, 30fps = 0.5, 15fps = 1)
        score += Math.max(0, Math.min(1, (60 - data.fps) / 45));
        
        // メモリ圧迫度 (直接使用)
        score += data.memory;
        
        // フレーム時間 (16.67ms = 0, 33ms = 0.5, 50ms = 1)
        score += Math.max(0, Math.min(1, (data.frameTime - 16.67) / 33.33));
        
        return Math.min(1, score / 3); // 平均化して0-1にクランプ
    }

    render(ctx, globalSettings) {
        const pos = this.config.position;
        
        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(pos.x, pos.y, pos.width, pos.height);
        
        // 境界線
        ctx.strokeStyle = globalSettings.gridColor;
        ctx.strokeRect(pos.x, pos.y, pos.width, pos.height);
        
        // タイトル
        ctx.fillStyle = globalSettings.textColor;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(this.config.name, pos.x + 5, pos.y + 15);
        
        // ヒートマップ描画
        this.renderHeatmapCells(ctx);
        
        // カラースケール描画
        this.renderColorScale(ctx, globalSettings);
    }

    renderHeatmapCells(ctx) {
        const pos = this.config.position;
        const cellSize = this.config.cellSize;
        const cols = Math.floor(pos.width / cellSize);
        const rows = Math.floor((pos.height - 30) / cellSize); // タイトル分を除く
        
        const now = Date.now();
        const timeWindow = this.config.maxAge;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cellTime = now - (col / cols) * timeWindow;
                const cellY = row / rows;
                
                // この時間・位置でのパフォーマンススコア取得
                const score = this.getScoreForCell(cellTime, cellY);
                
                if (score >= 0) {
                    const color = this.interpolateColor(score);
                    ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.8)`;
                    
                    const x = pos.x + pos.width - (col + 1) * cellSize;
                    const y = pos.y + 25 + row * cellSize;
                    
                    ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
                }
            }
        }
    }

    getScoreForCell(targetTime, yPosition) {
        // 時間と位置に基づいてスコア取得
        const timeTolerances = 2000; // 2秒の許容範囲
        
        const relevantData = this.heatmapData.filter(point => 
            Math.abs(point.timestamp - targetTime) <= timeTolerances
        );
        
        if (relevantData.length === 0) return -1;
        
        // 最も近いデータポイントのスコア使用
        const closest = relevantData.reduce((prev, curr) => 
            Math.abs(curr.timestamp - targetTime) < Math.abs(prev.timestamp - targetTime) ? curr : prev
        );
        
        return closest.score;
    }

    interpolateColor(value) {
        // 値に基づいて色を補間
        for (let i = 0; i < this.colorScale.length - 1; i++) {
            const current = this.colorScale[i];
            const next = this.colorScale[i + 1];
            
            if (value >= current.value && value <= next.value) {
                const ratio = (value - current.value) / (next.value - current.value);
                
                return [
                    Math.round(current.color[0] + (next.color[0] - current.color[0]) * ratio),
                    Math.round(current.color[1] + (next.color[1] - current.color[1]) * ratio),
                    Math.round(current.color[2] + (next.color[2] - current.color[2]) * ratio)
                ];
            }
        }
        
        return this.colorScale[0].color;
    }

    renderColorScale(ctx, globalSettings) {
        const pos = this.config.position;
        const scaleWidth = 100;
        const scaleHeight = 10;
        const scaleX = pos.x + pos.width - scaleWidth - 10;
        const scaleY = pos.y + pos.height - 20;
        
        // カラースケール描画
        for (let i = 0; i < scaleWidth; i++) {
            const value = i / scaleWidth;
            const color = this.interpolateColor(value);
            
            ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            ctx.fillRect(scaleX + i, scaleY, 1, scaleHeight);
        }
        
        // ラベル
        ctx.fillStyle = globalSettings.textColor;
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Good', scaleX, scaleY - 3);
        ctx.textAlign = 'right';
        ctx.fillText('Poor', scaleX + scaleWidth, scaleY - 3);
    }

    cleanupOldData(cutoffTime) {
        this.heatmapData = this.heatmapData.filter(point => point.timestamp > cutoffTime);
    }
}

export default PerformanceVisualizer;