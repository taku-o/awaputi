/**
 * リアルタイム監視ダッシュボード
 * パフォーマンス指標のリアルタイムグラフ表示を提供
 */

export class RealtimeDashboard {
    constructor(container, performanceDataCollector, realtimeMonitor, options: any = { } {
        this.container = container;
        this.dataCollector = performanceDataCollector;
        this.monitor = realtimeMonitor;
        this.options = {
            updateInterval: 1000, // 1秒間隔で更新;
            historyLength: 60, // 60秒分のデータを保持;
            theme: 'dark,
            enableFPS: true,
            enableMemory: true,
            enableErrors: true,
    enableLatency: true;
            ...options
        };

        this.charts = new Map();
        this.updateTimer = null;
        this.dataHistory = { fps: [],
            memory: [],
            errors: [],
            latency: [],
    timestamps: []  };
        this.initialize();
    }

    /**
     * 初期化
     */
    initialize() {
        this.createDashboardLayout();
        this.initializeCharts();
        this.setupEventListeners(); }
    }

    /**
     * ダッシュボードレイアウトの作成'
     */''
    createDashboardLayout() {
        this.container.innerHTML = `','
            <div class="realtime-dashboard">",
                <div class="dashboard-header">","
                    <h2>リアルタイムパフォーマンス監視</h2>",
                    <div class="dashboard-controls">",
                        <button id="toggle-monitoring" class="control-btn">監視開始</button>",
                        <button id="clear-data" class="control-btn">データクリア</button>",
                        <button id="export-data" class="control-btn">エクスポート</button>,
                    </div>","
                </div>",
                <div class="dashboard-grid">","
                    ${this.options.enableFPS ? `"
    }
                        <div class="chart-container">" }"
                            <h3>フレームレート (FPS"}"</h3>""
                            <canvas id="fps-chart"></canvas>"";
                            <div class="chart-stats" id="fps-stats"></div>";"
                        </div> : undefined"";
                    ` : '}'

                    ${ this.options.enableMemory ? `''
                        <div, class="chart-container">" }"
                            <h3>メモリ使用量 (%"}"</h3>""
                            <canvas id="memory-chart"></canvas>"";
                            <div class="chart-stats" id="memory-stats"></div>";"
                        </div> : undefined"";
                    ` : '}'

                    ${ this.options.enableErrors ? `''
                        <div, class="chart-container">","
                            <h3>エラー数</h3>",
                            <canvas, id="errors-chart"></canvas>",
                            <div, class="chart-stats" id="errors-stats"></div>","
                        </div> : undefined" }"
                    ` : '}'

                    ${ this.options.enableLatency ? `''
                        <div, class="chart-container">" }"
                            <h3>レイテンシ (ms"}"</h3>""
                            <canvas id="latency-chart"></canvas>"";
                            <div class="chart-stats" id="latency-stats"></div>";"
                        </div> : undefined"";
                    ` : '}'

                </div>';'
                <div class="dashboard-alerts">";"
                    <h3>最近のアラート</h3>"";
                    <div id="alerts-container"></div>;
                </div>;
            </div>;
        `;

        this.applyStyles();
    }

    /**
     * スタイルの適用"
     */""
    applyStyles() {"

        const style = document.createElement('style');
        style.textContent = ` }

            .realtime-dashboard { }'

                background: ${this.options.theme === 'dark' ? '#1a1a1a' : '#f5f5f5'},''
                color: ${this.options.theme === 'dark' ? '#e0e0e0' : '#333'},
                padding: 20px,
                border-radius: 8px,
                font-family: Arial, sans-serif;
            }
            .dashboard-header { display: flex,
                justify-content: space-between,
                align-items: center,
                margin-bottom: 20px,
                padding-bottom: 10px,' }'

                border-bottom: 1px solid ${this.options.theme === 'dark' ? '#333' : '#ddd'
            .dashboard-controls { display: flex,
                gap: 10px  }

            .control-btn { padding: 8px 16px,' }'

                background: ${this.options.theme === 'dark' ? '#2196f3' : '#4caf50'},
                color: white,
    border: none,
                border-radius: 4px,
                cursor: pointer,
    transition: background 0.3s }
            .control-btn:hover { opacity: 0.9 }

            .control-btn.active { }'

                background: ${this.options.theme === 'dark' ? '#f44336' : '#ff9800'}

            .dashboard-grid { display: grid,''
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)),
                gap: 20px,
                margin-bottom: 20px }

            .chart-container { }'

                background: ${this.options.theme === 'dark' ? '#2a2a2a' : 'white'},
                padding: 15px,
                border-radius: 6px,
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .chart-container h3 { margin: 0 0 10px 0,

                font-size: 16px,' }'

                color: ${this.options.theme === 'dark' ? '#aaa' : '#666'}
            .chart-stats { margin-top: 10px,

                font-size: 12px,' }'

                color: ${this.options.theme === 'dark' ? '#888' : '#666'}

            .dashboard-alerts { }'

                background: ${this.options.theme === 'dark' ? '#2a2a2a' : 'white'},
                padding: 15px,
                border-radius: 6px,
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                max-height: 300px,
                overflow-y: auto,
            .dashboard-alerts h3 { margin: 0 0 10px 0,

                font-size: 16px,' }'

                color: ${this.options.theme === 'dark' ? '#aaa' : '#666'}
            .alert-item { padding: 8px,
                margin-bottom: 5px,
                border-radius: 4px,
                font-size: 14px }
            .alert-item.warning { background: rgba(255, 152, 0, 0.2);
                border-left: 3px solid #ff9800 }
            .alert-item.error { background: rgba(244, 67, 54, 0.2);
                border-left: 3px solid #f44336 }

            .alert-item.info { ''
                background: rgba(33, 150, 243, 0.2);
                border-left: 3px solid #2196f3 }

            .alert-time { font-size: 12px,' }'

                color: ${this.options.theme === 'dark' ? '#666' : '#999'}
        `;
        document.head.appendChild(style);
    }

    /**
     * チャートの初期化'
     */''
    initializeCharts('''
                    type: 'time,
                    time: { ''
                        unit: 'second' ,
                        displayFormats: {''
                            second: 'HH:mm:ss'
            }
                    };
                    title: { display: true,''
                        text: '時間'
             ,
                    ticks: { ''
                        color: this.options.theme === 'dark' ? '#aaa' : '#666' ,
                    grid: { ''
                        color: this.options.theme === 'dark' ? '#333' : '#e0e0e0' 
                 ,
                y: { beginAtZero: true,
    ticks: {''
                        color: this.options.theme === 'dark' ? '#aaa' : '#666' ,
                    grid: { ''
                        color: this.options.theme === 'dark' ? '#333' : '#e0e0e0' 
 ,
            plugins: { legend: {
                    display: false,
                tooltip: { ''
                    mode: 'index' ,
    intersect: false,);
        // FPSチャート
        if (this.options.enableFPS) {

            const fpsCanvas = document.getElementById('fps-chart,
            if (fpsCanvas) {''
                this.charts.set('fps', new Chart(fpsCanvas, {)'
                    type: 'line,
    data: {'
                        datasets: [{]'
                            label: 'FPS',]','
                            data: [],'),
                            borderColor: '#4caf50,
                            backgroundColor: 'rgba(76, 175, 80, 0.1),
                            borderWidth: 2,
    pointRadius: 0 } },
                            tension: 0.1 
    }]
                    };
                    options: { ...chartOptions,
                        scales: {
                            ...chartOptions.scales  },
                            y: { ...chartOptions.scales.y  },
                                min: 0,
                                max: 120,
    title: {'
                                    display: true ,
                                    text: 'FPS'
                }
}
                }';'
            }
        }
';'
        // メモリチャート
        if (this.options.enableMemory) {

            const memoryCanvas = document.getElementById('memory-chart,
            if (memoryCanvas) {''
                this.charts.set('memory', new Chart(memoryCanvas, {)'
                    type: 'line,
    data: {'
                        datasets: [{]'
                            label: 'メモリ使用量',]','
                            data: [],'),
                            borderColor: '#2196f3,
                            backgroundColor: 'rgba(33, 150, 243, 0.1),
                            borderWidth: 2,
    pointRadius: 0 } },
                            tension: 0.1 
    }]
                    };
                    options: { ...chartOptions,
                        scales: {
                            ...chartOptions.scales  },
                            y: { ...chartOptions.scales.y  },
                                min: 0,
                                max: 100,
    title: {'
                                    display: true ,
                                    text: '使用率 (%')'
                }
}
                }';'
            }
        }
';'
        // エラーチャート
        if (this.options.enableErrors) {

            const errorsCanvas = document.getElementById('errors-chart,
            if (errorsCanvas) {''
                this.charts.set('errors', new Chart(errorsCanvas, {''
                    type: 'bar,
    data: {'
                        datasets: [{]'
                            label: 'エラー数',]','
                            data: [],
                            backgroundColor: '#f44336,
                            borderColor: '#f44336' } },
                            borderWidth: 1 
    }]
                    };
                    options: { ...chartOptions,
                        scales: {
                            ...chartOptions.scales  },
                            y: { )
                                ...chartOptions.scales.y','  },
                                title: {'
                                    display: true ,
                                    text: 'エラー数'
            }
})';'
            }
        }
';'
        // レイテンシチャート
        if (this.options.enableLatency) {

            const latencyCanvas = document.getElementById('latency-chart,
            if (latencyCanvas) {''
                this.charts.set('latency', new Chart(latencyCanvas, {)'
                    type: 'line,
    data: {'
                        datasets: [{]'
                            label: 'レイテンシ',]','
                            data: [],'),
                            borderColor: '#ff9800,
                            backgroundColor: 'rgba(255, 152, 0, 0.1),
                            borderWidth: 2,
    pointRadius: 0 } },
                            tension: 0.1 
    }]
                    };
                    options: { ...chartOptions,
                        scales: {
                            ...chartOptions.scales  },
                            y: { ...chartOptions.scales.y  },
                                title: {'
                                    display: true ,
                                    text: 'レイテンシ (ms')'
                }
}
                }';'
            }
}

    /**
     * イベントリスナーの設定'
     */''
    setupEventListeners()';'
        const toggleBtn = document.getElementById('toggle-monitoring';
        if (toggleBtn) {

            toggleBtn.addEventListener('click', () => { '
                if (this.updateTimer) {''
                    this.stopUpdates(' }''
                    toggleBtn.textContent = '監視開始';);

                    toggleBtn.classList.remove('active'; }'

                } else {
                    this.startUpdates()','
                    toggleBtn.textContent = '監視停止',' }'

                    toggleBtn.classList.add('active'; }'

                }'}');
        }
';'
        // データクリアボタン
        const clearBtn = document.getElementById('clear-data';
        if (clearBtn) {', ' }

            clearBtn.addEventListener('click', () => {  }

                this.clearHistory();' }'

            }');'
        }
';'
        // エクスポートボタン
        const exportBtn = document.getElementById('export-data';
        if (exportBtn) {', ' }

            exportBtn.addEventListener('click', () => {  }

                this.exportData();' }'

            }');'
        }
';'
        // リアルタイムアラートリスナー
        window.addEventListener('realtime-alert', (event) => { this.displayAlert(event.detail) });
    }

    /**
     * 更新開始
     */
    startUpdates() {
        if (this.updateTimer) return }
        this.updateTimer = setInterval(() => {  }
            this.updateData(); }
        }, this.options.updateInterval);

        // モニタリングも開始
        if (this.monitor && !this.monitor.isMonitoring) { this.monitor.startMonitoring();
    }

    /**
     * 更新停止
     */
    stopUpdates() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null; }
}

    /**
     * データ更新
     */
    updateData() {
        if (!this.dataCollector) return,

        const currentStats = this.dataCollector.getCurrentStats();
        const timestamp = new Date();
        // データ履歴に追加
        this.dataHistory.timestamps.push(timestamp);
        this.dataHistory.fps.push(currentStats.currentFPS || 0);
        this.dataHistory.memory.push(currentStats.currentMemoryUsage?.usagePercent || 0);
        this.dataHistory.errors.push(currentStats.errorCount || 0);
        this.dataHistory.latency.push(currentStats.averageFrameTime || 0);
        // 履歴の長さを制限
        this.trimHistory();
        // チャート更新
        this.updateCharts();
        // 統計情報更新
    }
        this.updateStats(); }
    }

    /**
     * 履歴のトリミング
     */
    trimHistory() {
        const maxLength = this.options.historyLength,
        
        Object.keys(this.dataHistory).forEach(key => { );
            if (this.dataHistory[key].length > maxLength) { }
                this.dataHistory[key] = this.dataHistory[key].slice(-maxLength);     }
}
    /**
     * チャートの更新
     */''
    updateCharts()';'
        const fpsChart = this.charts.get('fps);'
        if (fpsChart) {
            fpsChart.data.datasets[0].data = this.dataHistory.timestamps.map((time, i) => ({ : undefined, x: time)
        
            y: this.dataHistory.fps[i]'
            }

            }');'
            fpsChart.update('none');
        }
';'
        // メモリチャート更新
        const memoryChart = this.charts.get('memory);'
        if (memoryChart) {
            memoryChart.data.datasets[0].data = this.dataHistory.timestamps.map((time, i) => ({
                x: time),

                y: this.dataHistory.memory[i]' }'

            }');'
            memoryChart.update('none');
        }
';'
        // エラーチャート更新
        const errorsChart = this.charts.get('errors);'
        if (errorsChart) {
            errorsChart.data.datasets[0].data = this.dataHistory.timestamps.map((time, i) => ({
                x: time),

                y: this.dataHistory.errors[i]' }'

            }');'
            errorsChart.update('none');
        }
';'
        // レイテンシチャート更新
        const latencyChart = this.charts.get('latency);'
        if (latencyChart) {
            latencyChart.data.datasets[0].data = this.dataHistory.timestamps.map((time, i) => ({
                x: time),

                y: this.dataHistory.latency[i]' }'

            }');'
            latencyChart.update('none);'
        }
    }

    /**
     * 統計情報の更新
     */
    updateStats() {
        // FPS統計
        if (this.options.enableFPS) {''
            const fpsStats = document.getElementById('fps-stats),'
            if (fpsStats) {
                const currentFPS = this.dataHistory.fps[this.dataHistory.fps.length - 1] || 0,
                const avgFPS = this.calculateAverage(this.dataHistory.fps);
                const minFPS = Math.min(...this.dataHistory.fps.filter(v => v > 0);
                const maxFPS = Math.max(...this.dataHistory.fps);
                fpsStats.innerHTML = ` }
                    現在: ${currentFPS.toFixed(1} | 
                    平均: ${avgFPS.toFixed(1} | 
                    最小: ${minFPS.toFixed(1} | 
                    最大: ${maxFPS.toFixed(1}
                `;
            }
        }
';'
        // メモリ統計
        if (this.options.enableMemory) {

            const memoryStats = document.getElementById('memory-stats),'
            if (memoryStats) {
                const currentMemory = this.dataHistory.memory[this.dataHistory.memory.length - 1] || 0,
                const avgMemory = this.calculateAverage(this.dataHistory.memory);
                memoryStats.innerHTML = ` }
                    現在: ${currentMemory.toFixed(1}% | 
                    平均: ${avgMemory.toFixed(1}%
                `;
            }
        }
';'
        // エラー統計
        if (this.options.enableErrors) {

            const errorsStats = document.getElementById('errors-stats),'
            if (errorsStats) {
                const totalErrors = this.dataHistory.errors[this.dataHistory.errors.length - 1] || 0,
                const errorRate = this.calculateErrorRate();
                errorsStats.innerHTML = ` }
                    合計: ${totalErrors} | 
                    エラー率: ${errorRate.toFixed(2}/分
                `;
            }
        }
';'
        // レイテンシ統計
        if (this.options.enableLatency) {

            const latencyStats = document.getElementById('latency-stats),'
            if (latencyStats) {
                const currentLatency = this.dataHistory.latency[this.dataHistory.latency.length - 1] || 0,
                const avgLatency = this.calculateAverage(this.dataHistory.latency);
                latencyStats.innerHTML = ` }
                    現在: ${currentLatency.toFixed(1}ms | 
                    平均: ${avgLatency.toFixed(1}ms
                `;
            }
}

    /**
     * アラートの表示'
     */''
    displayAlert(alert) {

        const alertsContainer = document.getElementById('alerts-container,
        if(!alertsContainer) return,

' }'

        const alertItem = document.createElement('div'); }
        alertItem.className = `alert-item ${alert.severity}`;

        alertItem.innerHTML = `';'
            <div class="alert-time">${new, Date(alert.timestamp}.toLocaleTimeString(}</div>
            <div>${alert.message}</div>
        `;

        // 最新のアラートを上に追加
        alertsContainer.insertBefore(alertItem, alertsContainer.firstChild);

        // 最大50件まで表示
        while (alertsContainer.children.length > 50) { alertsContainer.removeChild(alertsContainer.lastChild);
    }

    /**
     * 平均値の計算
     */
    calculateAverage(values) {
        if (values.length === 0) return 0,
        const sum = values.reduce((a, b) => a + b, 0);
        return sum / values.length;

    /**
     * エラー率の計算
     */
    calculateErrorRate() {
        if (this.dataHistory.errors.length < 2) return 0,
        
        const recentErrors = this.dataHistory.errors.slice(-10), // 最後の10秒
        let increases = 0,
        
        for (let, i = 1, i < recentErrors.length, i++) {
    }
            increases += Math.max(0, recentErrors[i] - recentErrors[i-1]); }
        }
        
        return (increases / recentErrors.length) * 60; // 分あたりに換算
    }

    /**
     * 履歴のクリア
     */
    clearHistory() {
        this.dataHistory = {
            fps: [],
            memory: [],
            errors: [],
    latency: [] }
            timestamps: [] 
    };
        ";"
        this.updateCharts();""
        this.updateStats();
        ";"
        // アラートもクリア""
        const alertsContainer = document.getElementById('alerts-container';
        if (alertsContainer) {', ' }

            alertsContainer.innerHTML = '; }'
}

    /**
     * データのエクスポート
     */
    exportData() {
        const exportData = {
            exportTime: new Date().toISOString(),
            updateInterval: this.options.updateInterval,
            historyLength: this.options.historyLength,
    data: {
                timestamps: this.dataHistory.timestamps.map(t => t.toISOString() ,
                fps: this.dataHistory.fps,
                memory: this.dataHistory.memory,
                errors: this.dataHistory.errors }
                latency: this.dataHistory.latency 
    };
            statistics: { fps: {
                    average: this.calculateAverage(this.dataHistory.fps),
                    min: Math.min(...this.dataHistory.fps.filter(v => v > 0),
                    max: Math.max(...this.dataHistory.fps)
        }
                memory: { average: this.calculateAverage(this.dataHistory.memory),
                    min: Math.min(...this.dataHistory.memory) ,
                    max: Math.max(...this.dataHistory.memory,
    errors: { total: this.dataHistory.errors[this.dataHistory.errors.length - 1] || 0,
    rate: this.calculateErrorRate( }
                latency: { average: this.calculateAverage(this.dataHistory.latency),
                    min: Math.min(...this.dataHistory.latency.filter(v => v > 0) ,
                    max: Math.max(...this.dataHistory.latency)
    };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' }';'
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a);'
        a.href = url;
        a.download = `realtime-performance-${new, Date(}.toISOString(}.json`;
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('Performance, data exported);'
    }

    /**
     * リソースの解放
     */
    destroy() {
        this.stopUpdates();
        // チャートの破棄
    }
        this.charts.forEach(chart => { );
            chart.destroy(); }
        }');'
        this.charts.clear()';'
        window.removeEventListener('realtime-alert', this.displayAlert';'
        ';'
        // DOM要素のクリア
        if (this.container) {', ' }

            this.container.innerHTML = '; }'
        }

        console.log('RealtimeDashboard, destroyed');

    }'}'