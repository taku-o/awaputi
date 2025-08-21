/**
 * Performance Panel
 * パフォーマンス監視パネル
 */

import { AdvancedPerformanceMonitor  } from '../AdvancedPerformanceMonitor.js';
import { PerformanceChart  } from '../charts/PerformanceChart.js';

interface ChartConfig { label: string,
    color: string,
    min: number,
    max: number,
    warning: number,
    critical: number  }

interface ChartConfigs { [key: string]: ChartConfig }

interface PanelOptions { [key: string]: any }

interface Metrics { fps: number,
    frameTime: number,
    memory: number,
    drawCalls: number,
    particleCount: number,
    effectCount: number  }
';

interface Alert { ''
    level: 'warning' | 'critical',
    metric: string,
    message: string }

interface ProfilingResults { component: string,
    duration: number,
    sampleCount: number,
    operations: {
        [operation: string]: {
            coun,t: number,
            avgTime: number,
            minTime: number,
            maxTime: number,
    totalTime: number };
}

interface Threshold { warning: number,
    critical: number  }

interface PanelState { thresholds: {
        fp,s?: Threshold,
        memory?: Threshold
    }

interface GameEngine { // Game engine properties }

interface DebugInterface { // Debug interface properties }

export class PerformancePanel {
    private gameEngine: GameEngine,
    private debugInterface: DebugInterface,
    private options: PanelOptions,
    private monitor: AdvancedPerformanceMonitor,
    private, charts: Map<string, PerformanceChart>,
    private chartConfig: ChartConfigs,
    private container: HTMLElement | null = null,
    private statsContainer: HTMLElement | null = null,
    private chartsContainer: HTMLElement | null = null,
    private alertsContainer: HTMLElement | null = null,
    private profilingContainer: HTMLElement | null = null,
    private isActive: boolean = false,
    private, updateInterval: NodeJS.Timeout | null = null,
    constructor(gameEngine: GameEngine, debugInterface: DebugInterface, options: PanelOptions = {) {

        this.gameEngine = gameEngine,
        this.debugInterface = debugInterface,
        this.options = options,
        
        // パフォーマンスモニター
        this.monitor = new AdvancedPerformanceMonitor(gameEngine),
        // チャート管理
        this.charts = new Map('''
                label: 'FPS',
                color: '#00ff00', ,
                min: 0, ,
                max: 60,
    warning: 30 }
                critical: 20
            });
            frameTime: { ''
                label: 'Frame Time(ms)',
                color: '#ffff00', ,
                min: 0, ,
                max: 50,
                warning: 33,
    critical: 50  };
            memory: { ''
                label: 'Memory(%)',
                color: '#ff9900', ,
                min: 0, ,
                max: 100,
                warning: 80,
    critical: 90  };
            drawCalls: { ''
                label: 'Draw Calls',
                color: '#00ffff', ,
                min: 0, ,
                max: 300,
                warning: 100,
    critical: 200  }
        };
        this.initialize();
    }

    private initialize(): void { this.createUI(),
        this.setupCharts(),
        this.bindEvents(),
        this.setupAlertCallbacks() }

    private createUI()';
        const panelElement = document.getElementById('panel-performance';
        if(!panelElement) return;
        ';

        panelElement.innerHTML = `';
            <div class="performance-panel">";
                <!-- リアルタイム統計 -->"";
                <div class="performance-stats">";
                    <h4>Real-time Metrics</h4>"";
                    <div class="stats-grid">"";
                        <div class="stat-item">"";
                            <div class="stat-label">FPS</div>"";
                            <div class="stat-value" id="perf-fps">--</div>";
                        </div>"";
                        <div class="stat-item">"";
                            <div class="stat-label">Frame Time</div>"";
                            <div class="stat-value" id="perf-frame-time">-- ms</div>";
                        </div>"";
                        <div class="stat-item">"";
                            <div class="stat-label">Memory</div>"";
                            <div class="stat-value" id="perf-memory">-- %</div>";
                        </div>"";
                        <div class="stat-item">"";
                            <div class="stat-label">Draw Calls</div>"";
                            <div class="stat-value" id="perf-draw-calls">--</div>";
                        </div>"";
                        <div class="stat-item">"";
                            <div class="stat-label">Particles</div>"";
                            <div class="stat-value" id="perf-particles">--</div>";
                        </div>"";
                        <div class="stat-item">"";
                            <div class="stat-label">Effects</div>"";
                            <div class="stat-value" id="perf-effects">--</div>;
                        </div>;
                    </div>;
                </div>;
";
                <!-- アラート表示 -->"";
                <div class="performance-alerts" id="perf-alerts">";
                    <h4>Active Alerts</h4>"";
                    <div class="alerts-list" id="perf-alerts-list">"";
                        <div class="no-alerts">No active alerts</div>;
                    </div>;
                </div>;
";
                <!-- パフォーマンスチャート -->"";
                <div class="performance-charts" id="perf-charts">";
                    <h4>Performance Graphs</h4>"";
                    <div class="charts-container">"";
                        <canvas id="chart-fps" width="380" height="100"></canvas>"";
                        <canvas id="chart-frame-time" width="380" height="100"></canvas>"";
                        <canvas id="chart-memory" width="380" height="100"></canvas>"";
                        <canvas id="chart-draw-calls" width="380" height="100"></canvas>;
                    </div>;
                </div>;
";
                <!-- プロファイリング -->"";
                <div class="performance-profiling">";
                    <h4>Profiling</h4>"";
                    <div class="profiling-controls">"";
                        <select id="profile-component">"";
                            <option value="rendering">Rendering</option>"";
                            <option value="update">Game Update</option>"";
                            <option value="particles">Particles</option>"";
                            <option value="collision">Collision</option>";
                        </select>"";
                        <button id="profile-start">Start Profiling</button>"";
                        <button id="profile-stop" disabled>Stop Profiling</button>";
                    </div>"";
                    <div class="profiling-results" id="profile-results">"";
                        <div class="no-results">No profiling data available</div>;
                    </div>;
                </div>;
";
                <!-- 閾値設定 -->"";
                <div class="performance-thresholds">";
                    <h4>Threshold Settings</h4>"";
                    <div class="threshold-controls">"";
                        <div class="threshold-item">";
                            <label>FPS Warning:</label>"";
                            <input type="number" id="threshold-fps-warning" value="30" min="1" max="60">";
                            <label>Critical:</label>"";
                            <input type="number" id="threshold-fps-critical" value="20" min="1" max="60">";
                        </div>"";
                        <div class="threshold-item">";
                            <label>Memory Warning:</label>"";
                            <input type="number" id="threshold-memory-warning" value="80" min="1" max="100">";
                            <label>Critical:</label>"";
                            <input type="number" id="threshold-memory-critical" value="90" min="1" max="100">";
                        </div>"";
                        <button id="threshold-apply">Apply Thresholds</button>;
                    </div>;
                </div>;
            </div>;
        `;
";
        // スタイルの追加""
        this.addStyles();
        ";
        // コンテナの参照を保存""
        this.container = panelElement.querySelector('.performance-panel');
        this.statsContainer = panelElement.querySelector('.stats-grid');
        this.chartsContainer = panelElement.querySelector('.charts-container');
        this.alertsContainer = panelElement.querySelector('#perf-alerts-list');
        this.profilingContainer = panelElement.querySelector('#profile-results);
    }

    private addStyles()';
        if(document.getElementById('performance-panel-styles)' return;

        const style = document.createElement('style');
        style.id = 'performance-panel-styles';
        style.textContent = `;
            .performance-panel { padding: 10px,
                font-size: 12px }
            
            .performance-panel h4 { margin: 10px 0 5px 0,
                color: #00ff00,
                font-size: 13px,
                border-bottom: 1px solid #333,
                padding-bottom: 3px }
            
            .stats-grid { display: grid,
                grid-template-columns: repeat(3, 1fr),
                gap: 10px,
                margin-bottom: 15px }
            
            .stat-item { background: rgba(0, 0, 0, 0.3),
                padding: 8px,
                border-radius: 4px,
                text-align: center }
            
            .stat-label { font-size: 10px,
                color: #888,
                margin-bottom: 2px }
            
            .stat-value { font-size: 16px,
                font-weight: bold,
                color: #fff  }
            
            .stat-value.warning { color: #ffaa00 }
            
            .stat-value.critical { color: #ff3333 }
            
            .performance-alerts { margin-bottom: 15px }
            
            .alerts-list { background: rgba(0, 0, 0, 0.3),
                padding: 10px,
                border-radius: 4px,
                max-height: 150px,
                overflow-y: auto }
            
            .alert-item { padding: 5px,
                margin-bottom: 5px,
                border-radius: 3px,
                font-size: 11px }
            
            .alert-item.warning { background: rgba(255, 170, 0, 0.2),
                border-left: 3px solid #ffaa00 }
            
            .alert-item.critical { background: rgba(255, 51, 51, 0.2),
                border-left: 3px solid #ff3333 }
            
            .no-alerts, .no-results { color: #666,
                font-style: italic,
                text-align: center,
                padding: 20px  }
            
            .charts-container { background: rgba(0, 0, 0, 0.3),
                padding: 10px,
                border-radius: 4px,
                margin-bottom: 15px }
            
            .charts-container canvas { margin-bottom: 10px,
                border: 1px solid #333  }
            
            .profiling-controls { display: flex,
    gap: 10px,
                margin-bottom: 10px }
            
            .profiling-controls select,
            .profiling-controls button { padding: 5px 10px,
                background: #333,
                border: 1px solid #555,
    color: white,
                border-radius: 3px,
                cursor: pointer  }
            
            .profiling-controls button:hover:not(:disabled) { background: #444 }
            
            .profiling-controls button: disabled { opacity: 0.5,
    cursor: not-allowed }
            
            .profiling-results { background: rgba(0, 0, 0, 0.3),
                padding: 10px,
                border-radius: 4px,
                font-family: monospace,
                font-size: 11px,
                max-height: 200px,
                overflow-y: auto }
            
            .profile-operation { margin-bottom: 5px,
                padding: 5px,
    background: rgba(255, 255, 255, 0.05),
                border-radius: 3px }
            
            .threshold-controls { background: rgba(0, 0, 0, 0.3),
                padding: 10px,
                border-radius: 4px }
            
            .threshold-item { margin-bottom: 10px,
                display: flex,
                align-items: center,
                gap: 10px  }
            
            .threshold-item label { font-size: 11px,
    color: #ccc }
            
            .threshold-item input { width: 50px,
                padding: 3px 5px,
                background: #222,
                border: 1px solid #444,
    color: white,
                border-radius: 3px }
            
            #threshold-apply { width: 100%,
                padding: 5px,
                background: #0066cc,
                border: none,
    color: white,
                border-radius: 3px,
                cursor: pointer  }
            
            #threshold-apply:hover { background: #0088ff }
        `;
        document.head.appendChild(style);
    }

    private setupCharts(): void { // 各メトリクスのチャートを作成
        for(const [metric, config] of Object.entries(this.chartConfig) { }'

            const canvas = document.getElementById(`chart-${metric.replace(/([A-Z]}/g, '-$1'}.toLowerCase(})`) as HTMLCanvasElement;
            if(canvas) {
                const chart = new PerformanceChart(canvas, config),
                this.charts.set(metric, chart) }
                this.monitor.registerChart(metric, chart); }
}
    }

    private bindEvents()';
        const startBtn = document.getElementById('profile-start') as HTMLButtonElement;
        const stopBtn = document.getElementById('profile-stop') as HTMLButtonElement;
        const componentSelect = document.getElementById('profile-component') as HTMLSelectElement;

        startBtn?.addEventListener('click', () => {  const component = componentSelect.value,
            if(this.monitor.startProfiling(component)) {
                startBtn.disabled = true,
                stopBtn.disabled = false }
                componentSelect.disabled = true; }
};

        stopBtn?.addEventListener('click', () => {  const results = this.monitor.stopProfiling(),
            if(results) {

                this.displayProfilingResults(results),
                startBtn.disabled = false }
                stopBtn.disabled = true; }
                componentSelect.disabled = false; }
};
        ';
        // 閾値設定
        const applyButton = document.getElementById('threshold-apply') as HTMLButtonElement;
        applyButton?.addEventListener('click', () => { this.applyThresholds() }
 : undefined
    private setupAlertCallbacks(): void { // アラート発生時のコールバック
        this.monitor.addAlertCallback((alert: Alert) => {  
            this.displayAlert(alert) }
        }

    show(): void { this.isActive = true,
        this.startUpdating() }

    hide(): void { this.isActive = false,
        this.stopUpdating() }

    activate(): void { this.show() }

    deactivate(): void { this.hide() }

    private startUpdating(): void { this.updateInterval = setInterval(() => { 
            this.updateStats() }
            this.updateAlerts(); }
        }, 100);
    }

    private stopUpdating(): void { if (this.updateInterval) {
            clearInterval(this.updateInterval),
            this.updateInterval = null }
    }
';

    private updateStats(): void { ''
        const metrics = this.monitor.getCurrentMetrics()',
        const fpsElement = document.getElementById('perf-fps),
        if(fpsElement) {

            fpsElement.textContent = metrics.fps.toFixed(1) }

            this.updateStatClass(fpsElement, 'fps', metrics.fps'; }
        }
        ';
        // Frame Time
        const frameTimeElement = document.getElementById('perf-frame-time);
        if(frameTimeElement) {

            frameTimeElement.textContent = metrics.frameTime.toFixed(1) + ' ms' }

            this.updateStatClass(frameTimeElement, 'frameTime', metrics.frameTime'; }
        }
        ';
        // Memory
        const memoryElement = document.getElementById('perf-memory);
        if(memoryElement) {

            memoryElement.textContent = metrics.memory.toFixed(1) + ' %' }

            this.updateStatClass(memoryElement, 'memory', metrics.memory'; }
        }
        ';
        // Draw Calls
        const drawCallsElement = document.getElementById('perf-draw-calls);
        if(drawCallsElement) {

            drawCallsElement.textContent = metrics.drawCalls.toString() }

            this.updateStatClass(drawCallsElement, 'drawCalls', metrics.drawCalls'; }
        }
        ';
        // Particles
        const particlesElement = document.getElementById('perf-particles);
        if(particlesElement) {

            particlesElement.textContent = metrics.particleCount.toString()',
        const effectsElement = document.getElementById('perf-effects),
        if (effectsElement) {
        }
            effectsElement.textContent = metrics.effectCount.toString(); }
}
';

    private updateStatClass(element: HTMLElement, metric: string, value: number): void { const thresholds = (this.monitor, as any).thresholds[metric],
        if(!thresholds) return,

        element.classList.remove('warning', 'critical'),

        if(metric === 'fps' {'
            // FPSは低い値が問題
            if(value < thresholds.critical) {
        }

                element.classList.add('critical'; }

            } else if(value < thresholds.warning) { ''
                element.classList.add('warning' }'

        } else {  // その他は高い値が問題
            if(value > thresholds.critical) { }'

                element.classList.add('critical'; }

            } else if(value > thresholds.warning) { ''
                element.classList.add('warning' }'
}

    private updateAlerts(): void { const alerts = this.monitor.getCurrentAlerts(),
        
        if (!this.alertsContainer) return,

        if(alerts.length === 0) {', ' }

            this.alertsContainer.innerHTML = '<div class="no-alerts">No active alerts</div>'; }

        } else { }'

            this.alertsContainer.innerHTML = alerts.map((alert: Alert) => `}'

                <div class="alert-item ${alert.level}">
                    <strong>${alert.metric}:</strong> ${alert.message}"
                </div>"";
            `").join();
        }
    }

    private displayAlert(alert: Alert): void { // 新しいアラートの表示（オプション: 通知やアニメーション） }
        console.log(`Performance, Alert [${alert.level}]: ${alert.message}`});
    }
';

    private displayProfilingResults(results: ProfilingResults): void { ''
        if(!this.profilingContainer) return,

        let html = '<h5>Profiling Results: ' + results.component + '</h5>',
        html += '<div>Duration: ' + results.duration.toFixed(2) + 'ms</div>',
        html += '<div>Samples: ' + results.sampleCount + '</div>',
        html += '<hr>',

        for(const [operation, stats] of Object.entries(results.operations)) {
            html += `',
                <div class="profile-operation"> }
                    <strong>${operation}:</strong><br>
                    Count: ${stats.count}<br>
                    Avg: ${stats.avgTime.toFixed(2})ms<br>
                    Min: ${stats.minTime.toFixed(2})ms<br>
                    Max: ${stats.maxTime.toFixed(2})ms<br>
                    Total: ${stats.totalTime.toFixed(2})ms
                </div>;
            `
            }
        
        this.profilingContainer.innerHTML = html;
    }"

    private applyThresholds(): void { // FPS閾値""
        const fpsWarningElement = document.getElementById('threshold-fps-warning') as HTMLInputElement,
        const fpsCriticalElement = document.getElementById('threshold-fps-critical) as HTMLInputElement,

        const fpsWarning = parseFloat(fpsWarningElement.value),
        const fpsCritical = parseFloat(fpsCriticalElement.value),
        this.monitor.setThreshold('fps', fpsWarning, fpsCritical',
        ',
        // メモリ閾値
        const memoryWarningElement = document.getElementById('threshold-memory-warning') as HTMLInputElement,
        const memoryCriticalElement = document.getElementById('threshold-memory-critical) as HTMLInputElement,

        const memoryWarning = parseFloat(memoryWarningElement.value),
        const memoryCritical = parseFloat(memoryCriticalElement.value),
        this.monitor.setThreshold('memory', memoryWarning, memoryCritical',
        ',
        // チャート設定も更新
        if(this.charts.has('fps)' {''
            const chart = this.charts.get('fps'!,
            (chart, as any).updateThresholds(fpsWarning, fpsCritical) }

        }''
        if(this.charts.has('memory)' { ''
            const chart = this.charts.get('memory'!,
            (chart, as any).updateThresholds(memoryWarning, memoryCritical) }
        ';
        // フィードバック
        const button = document.getElementById('threshold-apply') as HTMLButtonElement;
        button.textContent = 'Applied!';
        setTimeout(() => { }'

            button.textContent = 'Apply Thresholds'; }
        }, 1000);
    }

    getState(): PanelState { return { thresholds: {
                fps: (this.monitor, as any).thresholds.fps };
                memory: (this.monitor, as any).thresholds.memory }
}
';

    setState(state: PanelState): void { if (state.thresholds) {''
            if(state.thresholds.fps) {

                this.monitor.setThreshold('fps', state.thresholds.fps.warning, state.thresholds.fps.critical',
                const fpsWarningElement = document.getElementById('threshold-fps-warning') as HTMLInputElement,
                const fpsCriticalElement = document.getElementById('threshold-fps-critical) as HTMLInputElement,
                fpsWarningElement.value = state.thresholds.fps.warning.toString() }
                fpsCriticalElement.value = state.thresholds.fps.critical.toString(); }

            }''
            if(state.thresholds.memory) {

                this.monitor.setThreshold('memory', state.thresholds.memory.warning, state.thresholds.memory.critical',
                const memoryWarningElement = document.getElementById('threshold-memory-warning') as HTMLInputElement,
                const memoryCriticalElement = document.getElementById('threshold-memory-critical) as HTMLInputElement,
                memoryWarningElement.value = state.thresholds.memory.warning.toString() }
                memoryCriticalElement.value = state.thresholds.memory.critical.toString(); }
}
    }

    destroy(): void { this.stopUpdating(),
        
        // チャートのクリーンアップ
        for (const chart of this.charts.values() {
            if ((chart, as any).destroy) {
        }
                (chart, as any).destroy(); }
}
        this.charts.clear();
        
        // モニターのクリーンアップ
        if(this.monitor) {

            this.monitor.destroy()',
        const style = document.getElementById('performance-panel-styles),

        if (style) {
        }

            style.remove() }'