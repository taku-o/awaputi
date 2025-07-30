/**
 * Performance Panel
 * パフォーマンス監視パネル
 */

import { AdvancedPerformanceMonitor } from '../AdvancedPerformanceMonitor.js';
import { PerformanceChart } from '../charts/PerformanceChart.js';

export class PerformancePanel {
    constructor(gameEngine, debugInterface, options = {}) {
        this.gameEngine = gameEngine;
        this.debugInterface = debugInterface;
        this.options = options;
        
        // パフォーマンスモニター
        this.monitor = new AdvancedPerformanceMonitor(gameEngine);
        
        // チャート管理
        this.charts = new Map();
        this.chartConfig = {
            fps: { 
                label: 'FPS', 
                color: '#00ff00', 
                min: 0, 
                max: 60,
                warning: 30,
                critical: 20
            },
            frameTime: { 
                label: 'Frame Time (ms)', 
                color: '#ffff00', 
                min: 0, 
                max: 50,
                warning: 33,
                critical: 50
            },
            memory: { 
                label: 'Memory (%)', 
                color: '#ff9900', 
                min: 0, 
                max: 100,
                warning: 80,
                critical: 90
            },
            drawCalls: { 
                label: 'Draw Calls', 
                color: '#00ffff', 
                min: 0, 
                max: 300,
                warning: 100,
                critical: 200
            }
        };
        
        // UI要素
        this.container = null;
        this.statsContainer = null;
        this.chartsContainer = null;
        this.alertsContainer = null;
        this.profilingContainer = null;
        
        // 状態
        this.isActive = false;
        this.updateInterval = null;
        
        this.initialize();
    }

    initialize() {
        this.createUI();
        this.setupCharts();
        this.bindEvents();
        this.setupAlertCallbacks();
    }

    createUI() {
        const panelElement = document.getElementById('panel-performance');
        if (!panelElement) return;
        
        panelElement.innerHTML = `
            <div class="performance-panel">
                <!-- リアルタイム統計 -->
                <div class="performance-stats">
                    <h4>Real-time Metrics</h4>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-label">FPS</div>
                            <div class="stat-value" id="perf-fps">--</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Frame Time</div>
                            <div class="stat-value" id="perf-frame-time">-- ms</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Memory</div>
                            <div class="stat-value" id="perf-memory">-- %</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Draw Calls</div>
                            <div class="stat-value" id="perf-draw-calls">--</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Particles</div>
                            <div class="stat-value" id="perf-particles">--</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Effects</div>
                            <div class="stat-value" id="perf-effects">--</div>
                        </div>
                    </div>
                </div>

                <!-- アラート表示 -->
                <div class="performance-alerts" id="perf-alerts">
                    <h4>Active Alerts</h4>
                    <div class="alerts-list" id="perf-alerts-list">
                        <div class="no-alerts">No active alerts</div>
                    </div>
                </div>

                <!-- パフォーマンスチャート -->
                <div class="performance-charts" id="perf-charts">
                    <h4>Performance Graphs</h4>
                    <div class="charts-container">
                        <canvas id="chart-fps" width="380" height="100"></canvas>
                        <canvas id="chart-frame-time" width="380" height="100"></canvas>
                        <canvas id="chart-memory" width="380" height="100"></canvas>
                        <canvas id="chart-draw-calls" width="380" height="100"></canvas>
                    </div>
                </div>

                <!-- プロファイリング -->
                <div class="performance-profiling">
                    <h4>Profiling</h4>
                    <div class="profiling-controls">
                        <select id="profile-component">
                            <option value="rendering">Rendering</option>
                            <option value="update">Game Update</option>
                            <option value="particles">Particles</option>
                            <option value="collision">Collision</option>
                        </select>
                        <button id="profile-start">Start Profiling</button>
                        <button id="profile-stop" disabled>Stop Profiling</button>
                    </div>
                    <div class="profiling-results" id="profile-results">
                        <div class="no-results">No profiling data available</div>
                    </div>
                </div>

                <!-- 閾値設定 -->
                <div class="performance-thresholds">
                    <h4>Threshold Settings</h4>
                    <div class="threshold-controls">
                        <div class="threshold-item">
                            <label>FPS Warning:</label>
                            <input type="number" id="threshold-fps-warning" value="30" min="1" max="60">
                            <label>Critical:</label>
                            <input type="number" id="threshold-fps-critical" value="20" min="1" max="60">
                        </div>
                        <div class="threshold-item">
                            <label>Memory Warning:</label>
                            <input type="number" id="threshold-memory-warning" value="80" min="1" max="100">
                            <label>Critical:</label>
                            <input type="number" id="threshold-memory-critical" value="90" min="1" max="100">
                        </div>
                        <button id="threshold-apply">Apply Thresholds</button>
                    </div>
                </div>
            </div>
        `;

        // スタイルの追加
        this.addStyles();
        
        // コンテナの参照を保存
        this.container = panelElement.querySelector('.performance-panel');
        this.statsContainer = panelElement.querySelector('.stats-grid');
        this.chartsContainer = panelElement.querySelector('.charts-container');
        this.alertsContainer = panelElement.querySelector('#perf-alerts-list');
        this.profilingContainer = panelElement.querySelector('#profile-results');
    }

    addStyles() {
        if (document.getElementById('performance-panel-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'performance-panel-styles';
        style.textContent = `
            .performance-panel {
                padding: 10px;
                font-size: 12px;
            }
            
            .performance-panel h4 {
                margin: 10px 0 5px 0;
                color: #00ff00;
                font-size: 13px;
                border-bottom: 1px solid #333;
                padding-bottom: 3px;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
                margin-bottom: 15px;
            }
            
            .stat-item {
                background: rgba(0, 0, 0, 0.3);
                padding: 8px;
                border-radius: 4px;
                text-align: center;
            }
            
            .stat-label {
                font-size: 10px;
                color: #888;
                margin-bottom: 2px;
            }
            
            .stat-value {
                font-size: 16px;
                font-weight: bold;
                color: #fff;
            }
            
            .stat-value.warning {
                color: #ffaa00;
            }
            
            .stat-value.critical {
                color: #ff3333;
            }
            
            .performance-alerts {
                margin-bottom: 15px;
            }
            
            .alerts-list {
                background: rgba(0, 0, 0, 0.3);
                padding: 10px;
                border-radius: 4px;
                max-height: 150px;
                overflow-y: auto;
            }
            
            .alert-item {
                padding: 5px;
                margin-bottom: 5px;
                border-radius: 3px;
                font-size: 11px;
            }
            
            .alert-item.warning {
                background: rgba(255, 170, 0, 0.2);
                border-left: 3px solid #ffaa00;
            }
            
            .alert-item.critical {
                background: rgba(255, 51, 51, 0.2);
                border-left: 3px solid #ff3333;
            }
            
            .no-alerts, .no-results {
                color: #666;
                font-style: italic;
                text-align: center;
                padding: 20px;
            }
            
            .charts-container {
                background: rgba(0, 0, 0, 0.3);
                padding: 10px;
                border-radius: 4px;
                margin-bottom: 15px;
            }
            
            .charts-container canvas {
                margin-bottom: 10px;
                border: 1px solid #333;
            }
            
            .profiling-controls {
                display: flex;
                gap: 10px;
                margin-bottom: 10px;
            }
            
            .profiling-controls select,
            .profiling-controls button {
                padding: 5px 10px;
                background: #333;
                border: 1px solid #555;
                color: white;
                border-radius: 3px;
                cursor: pointer;
            }
            
            .profiling-controls button:hover:not(:disabled) {
                background: #444;
            }
            
            .profiling-controls button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .profiling-results {
                background: rgba(0, 0, 0, 0.3);
                padding: 10px;
                border-radius: 4px;
                font-family: monospace;
                font-size: 11px;
                max-height: 200px;
                overflow-y: auto;
            }
            
            .profile-operation {
                margin-bottom: 5px;
                padding: 5px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 3px;
            }
            
            .threshold-controls {
                background: rgba(0, 0, 0, 0.3);
                padding: 10px;
                border-radius: 4px;
            }
            
            .threshold-item {
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .threshold-item label {
                font-size: 11px;
                color: #ccc;
            }
            
            .threshold-item input {
                width: 50px;
                padding: 3px 5px;
                background: #222;
                border: 1px solid #444;
                color: white;
                border-radius: 3px;
            }
            
            #threshold-apply {
                width: 100%;
                padding: 5px;
                background: #0066cc;
                border: none;
                color: white;
                border-radius: 3px;
                cursor: pointer;
            }
            
            #threshold-apply:hover {
                background: #0088ff;
            }
        `;
        document.head.appendChild(style);
    }

    setupCharts() {
        // 各メトリクスのチャートを作成
        for (const [metric, config] of Object.entries(this.chartConfig)) {
            const canvas = document.getElementById(`chart-${metric.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
            if (canvas) {
                const chart = new PerformanceChart(canvas, config);
                this.charts.set(metric, chart);
                this.monitor.registerChart(metric, chart);
            }
        }
    }

    bindEvents() {
        // プロファイリング制御
        const startBtn = document.getElementById('profile-start');
        const stopBtn = document.getElementById('profile-stop');
        const componentSelect = document.getElementById('profile-component');
        
        startBtn?.addEventListener('click', () => {
            const component = componentSelect.value;
            if (this.monitor.startProfiling(component)) {
                startBtn.disabled = true;
                stopBtn.disabled = false;
                componentSelect.disabled = true;
            }
        });
        
        stopBtn?.addEventListener('click', () => {
            const results = this.monitor.stopProfiling();
            if (results) {
                this.displayProfilingResults(results);
                startBtn.disabled = false;
                stopBtn.disabled = true;
                componentSelect.disabled = false;
            }
        });
        
        // 閾値設定
        document.getElementById('threshold-apply')?.addEventListener('click', () => {
            this.applyThresholds();
        });
    }

    setupAlertCallbacks() {
        // アラート発生時のコールバック
        this.monitor.addAlertCallback((alert) => {
            this.displayAlert(alert);
        });
    }

    show() {
        this.isActive = true;
        this.startUpdating();
    }

    hide() {
        this.isActive = false;
        this.stopUpdating();
    }

    activate() {
        this.show();
    }

    deactivate() {
        this.hide();
    }

    startUpdating() {
        this.updateInterval = setInterval(() => {
            this.updateStats();
            this.updateAlerts();
        }, 100);
    }

    stopUpdating() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    updateStats() {
        const metrics = this.monitor.getCurrentMetrics();
        const stats = this.monitor.getStatistics();
        
        // FPS
        const fpsElement = document.getElementById('perf-fps');
        if (fpsElement) {
            fpsElement.textContent = metrics.fps.toFixed(1);
            this.updateStatClass(fpsElement, 'fps', metrics.fps);
        }
        
        // Frame Time
        const frameTimeElement = document.getElementById('perf-frame-time');
        if (frameTimeElement) {
            frameTimeElement.textContent = metrics.frameTime.toFixed(1) + ' ms';
            this.updateStatClass(frameTimeElement, 'frameTime', metrics.frameTime);
        }
        
        // Memory
        const memoryElement = document.getElementById('perf-memory');
        if (memoryElement) {
            memoryElement.textContent = metrics.memory.toFixed(1) + ' %';
            this.updateStatClass(memoryElement, 'memory', metrics.memory);
        }
        
        // Draw Calls
        const drawCallsElement = document.getElementById('perf-draw-calls');
        if (drawCallsElement) {
            drawCallsElement.textContent = metrics.drawCalls.toString();
            this.updateStatClass(drawCallsElement, 'drawCalls', metrics.drawCalls);
        }
        
        // Particles
        const particlesElement = document.getElementById('perf-particles');
        if (particlesElement) {
            particlesElement.textContent = metrics.particleCount.toString();
        }
        
        // Effects
        const effectsElement = document.getElementById('perf-effects');
        if (effectsElement) {
            effectsElement.textContent = metrics.effectCount.toString();
        }
    }

    updateStatClass(element, metric, value) {
        const thresholds = this.monitor.thresholds[metric];
        if (!thresholds) return;
        
        element.classList.remove('warning', 'critical');
        
        if (metric === 'fps') {
            // FPSは低い値が問題
            if (value < thresholds.critical) {
                element.classList.add('critical');
            } else if (value < thresholds.warning) {
                element.classList.add('warning');
            }
        } else {
            // その他は高い値が問題
            if (value > thresholds.critical) {
                element.classList.add('critical');
            } else if (value > thresholds.warning) {
                element.classList.add('warning');
            }
        }
    }

    updateAlerts() {
        const alerts = this.monitor.getCurrentAlerts();
        
        if (alerts.length === 0) {
            this.alertsContainer.innerHTML = '<div class="no-alerts">No active alerts</div>';
        } else {
            this.alertsContainer.innerHTML = alerts.map(alert => `
                <div class="alert-item ${alert.level}">
                    <strong>${alert.metric}:</strong> ${alert.message}
                </div>
            `).join('');
        }
    }

    displayAlert(alert) {
        // 新しいアラートの表示（オプション: 通知やアニメーション）
        console.log(`Performance Alert [${alert.level}]: ${alert.message}`);
    }

    displayProfilingResults(results) {
        let html = '<h5>Profiling Results: ' + results.component + '</h5>';
        html += '<div>Duration: ' + results.duration.toFixed(2) + 'ms</div>';
        html += '<div>Samples: ' + results.sampleCount + '</div>';
        html += '<hr>';
        
        for (const [operation, stats] of Object.entries(results.operations)) {
            html += `
                <div class="profile-operation">
                    <strong>${operation}:</strong><br>
                    Count: ${stats.count}<br>
                    Avg: ${stats.avgTime.toFixed(2)}ms<br>
                    Min: ${stats.minTime.toFixed(2)}ms<br>
                    Max: ${stats.maxTime.toFixed(2)}ms<br>
                    Total: ${stats.totalTime.toFixed(2)}ms
                </div>
            `;
        }
        
        this.profilingContainer.innerHTML = html;
    }

    applyThresholds() {
        // FPS閾値
        const fpsWarning = parseFloat(document.getElementById('threshold-fps-warning').value);
        const fpsCritical = parseFloat(document.getElementById('threshold-fps-critical').value);
        this.monitor.setThreshold('fps', fpsWarning, fpsCritical);
        
        // メモリ閾値
        const memoryWarning = parseFloat(document.getElementById('threshold-memory-warning').value);
        const memoryCritical = parseFloat(document.getElementById('threshold-memory-critical').value);
        this.monitor.setThreshold('memory', memoryWarning, memoryCritical);
        
        // チャート設定も更新
        if (this.charts.has('fps')) {
            this.charts.get('fps').updateThresholds(fpsWarning, fpsCritical);
        }
        if (this.charts.has('memory')) {
            this.charts.get('memory').updateThresholds(memoryWarning, memoryCritical);
        }
        
        // フィードバック
        const button = document.getElementById('threshold-apply');
        button.textContent = 'Applied!';
        setTimeout(() => {
            button.textContent = 'Apply Thresholds';
        }, 1000);
    }

    getState() {
        return {
            thresholds: {
                fps: this.monitor.thresholds.fps,
                memory: this.monitor.thresholds.memory
            }
        };
    }

    setState(state) {
        if (state.thresholds) {
            if (state.thresholds.fps) {
                this.monitor.setThreshold('fps', state.thresholds.fps.warning, state.thresholds.fps.critical);
                document.getElementById('threshold-fps-warning').value = state.thresholds.fps.warning;
                document.getElementById('threshold-fps-critical').value = state.thresholds.fps.critical;
            }
            if (state.thresholds.memory) {
                this.monitor.setThreshold('memory', state.thresholds.memory.warning, state.thresholds.memory.critical);
                document.getElementById('threshold-memory-warning').value = state.thresholds.memory.warning;
                document.getElementById('threshold-memory-critical').value = state.thresholds.memory.critical;
            }
        }
    }

    destroy() {
        this.stopUpdating();
        
        // チャートのクリーンアップ
        for (const chart of this.charts.values()) {
            if (chart.destroy) {
                chart.destroy();
            }
        }
        this.charts.clear();
        
        // モニターのクリーンアップ
        if (this.monitor) {
            this.monitor.destroy();
        }
        
        // スタイルの削除
        const style = document.getElementById('performance-panel-styles');
        if (style) {
            style.remove();
        }
    }
}

// デフォルトエクスポート
export default PerformancePanel;