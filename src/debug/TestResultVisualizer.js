/**
 * Test Result Visualizer
 * テスト結果の可視化とダッシュボード表示システム
 */

export class TestResultVisualizer {
    constructor(testSupportTools) {
        this.testSupportTools = testSupportTools;
        this.container = null;
        this.charts = new Map();
        this.isVisible = false;
        
        this.initialize();
    }

    initialize() {
        this.createContainer();
        this.setupEventHandlers();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'test-result-visualizer';
        this.container.className = 'test-result-visualizer';
        this.container.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            width: 900px;
            height: 700px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 12px;
            font-family: 'Segoe UI', monospace;
            font-size: 13px;
            z-index: 15000;
            display: none;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;

        this.container.innerHTML = this.createDashboardHTML();
        document.body.appendChild(this.container);
    }

    createDashboardHTML() {
        return `
            <div class="dashboard-header">
                <h2 style="margin: 0 0 15px 0; color: #00ff88; display: flex; align-items: center;">
                    <span style="margin-right: 10px;">📊</span>
                    Test Results Dashboard
                </h2>
                <div class="controls" style="margin-bottom: 20px;">
                    <button id="refresh-results" style="margin-right: 10px; padding: 5px 12px; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer;">Refresh</button>
                    <button id="export-results" style="margin-right: 10px; padding: 5px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Export</button>
                    <button id="clear-history" style="margin-right: 10px; padding: 5px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Clear History</button>
                    <button id="close-visualizer" style="float: right; padding: 5px 12px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
                </div>
            </div>

            <div class="dashboard-tabs">
                <div class="tab-buttons" style="display: flex; margin-bottom: 15px; border-bottom: 1px solid #333;">
                    <button class="tab-button active" data-tab="summary" style="padding: 8px 16px; background: #444; color: white; border: none; border-radius: 4px 4px 0 0; margin-right: 2px; cursor: pointer;">Summary</button>
                    <button class="tab-button" data-tab="performance" style="padding: 8px 16px; background: #222; color: #ccc; border: none; cursor: pointer;">Performance</button>
                    <button class="tab-button" data-tab="trends" style="padding: 8px 16px; background: #222; color: #ccc; border: none; cursor: pointer;">Trends</button>
                    <button class="tab-button" data-tab="details" style="padding: 8px 16px; background: #222; color: #ccc; border: none; cursor: pointer;">Details</button>
                    <button class="tab-button" data-tab="coverage" style="padding: 8px 16px; background: #222; color: #ccc; border: none; cursor: pointer;">Coverage</button>
                </div>

                <div class="tab-content">
                    <div id="tab-summary" class="tab-panel active">
                        <div class="summary-grid" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="summary-card" style="background: #333; padding: 15px; border-radius: 8px;">
                                <h3 style="margin: 0 0 10px 0; color: #00ff88;">Test Summary</h3>
                                <div id="test-summary-content">
                                    <div class="metric">
                                        <span class="label">Total Tests:</span>
                                        <span class="value" id="total-tests">--</span>
                                    </div>
                                    <div class="metric">
                                        <span class="label">Passed:</span>
                                        <span class="value passed" id="passed-tests">--</span>
                                    </div>
                                    <div class="metric">
                                        <span class="label">Failed:</span>
                                        <span class="value failed" id="failed-tests">--</span>
                                    </div>
                                    <div class="metric">
                                        <span class="label">Success Rate:</span>
                                        <span class="value" id="success-rate">--</span>
                                    </div>
                                </div>
                            </div>

                            <div class="summary-card" style="background: #333; padding: 15px; border-radius: 8px;">
                                <h3 style="margin: 0 0 10px 0; color: #ffa500;">Performance</h3>
                                <div id="performance-summary-content">
                                    <div class="metric">
                                        <span class="label">Avg Execution:</span>
                                        <span class="value" id="avg-execution">--</span>
                                    </div>
                                    <div class="metric">
                                        <span class="label">Total Time:</span>
                                        <span class="value" id="total-time">--</span>
                                    </div>
                                    <div class="metric">
                                        <span class="label">Regressions:</span>
                                        <span class="value warning" id="regressions">--</span>
                                    </div>
                                    <div class="metric">
                                        <span class="label">Improvements:</span>
                                        <span class="value passed" id="improvements">--</span>
                                    </div>
                                </div>
                            </div>

                            <div class="summary-card" style="background: #333; padding: 15px; border-radius: 8px;">
                                <h3 style="margin: 0 0 10px 0; color: #ff69b4;">Quality Score</h3>
                                <div id="quality-score">
                                    <div class="score-circle" style="text-align: center;">
                                        <div id="quality-score-value" style="font-size: 36px; font-weight: bold; color: #00ff88;">--</div>
                                        <div style="font-size: 12px; color: #ccc;">Overall Quality</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="charts-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="chart-container" style="background: #333; padding: 15px; border-radius: 8px;">
                                <h4 style="margin: 0 0 10px 0; color: #ccc;">Test Results Distribution</h4>
                                <canvas id="results-pie-chart" width="300" height="200"></canvas>
                            </div>
                            <div class="chart-container" style="background: #333; padding: 15px; border-radius: 8px;">
                                <h4 style="margin: 0 0 10px 0; color: #ccc;">Category Performance</h4>
                                <canvas id="category-bar-chart" width="300" height="200"></canvas>
                            </div>
                        </div>
                    </div>

                    <div id="tab-performance" class="tab-panel" style="display: none;">
                        <div class="performance-metrics">
                            <h3 style="color: #ffa500; margin-bottom: 15px;">Performance Metrics</h3>
                            <div class="chart-container" style="background: #333; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                                <h4 style="margin: 0 0 10px 0; color: #ccc;">Execution Time Trends</h4>
                                <canvas id="performance-line-chart" width="800" height="300"></canvas>
                            </div>
                            <div class="benchmark-results" id="benchmark-results">
                                <!-- Benchmark results will be populated here -->
                            </div>
                        </div>
                    </div>

                    <div id="tab-trends" class="tab-panel" style="display: none;">
                        <div class="trends-analysis">
                            <h3 style="color: #87ceeb; margin-bottom: 15px;">Test Trends Analysis</h3>
                            <div class="chart-container" style="background: #333; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                                <h4 style="margin: 0 0 10px 0; color: #ccc;">Success Rate Over Time</h4>
                                <canvas id="trends-line-chart" width="800" height="300"></canvas>
                            </div>
                            <div class="trends-insights" id="trends-insights">
                                <!-- Trends insights will be populated here -->
                            </div>
                        </div>
                    </div>

                    <div id="tab-details" class="tab-panel" style="display: none;">
                        <div class="test-details">
                            <h3 style="color: #dda0dd; margin-bottom: 15px;">Detailed Test Results</h3>
                            <div class="filter-controls" style="margin-bottom: 15px;">
                                <select id="category-filter" style="padding: 5px; margin-right: 10px; background: #444; color: white; border: 1px solid #666; border-radius: 4px;">
                                    <option value="all">All Categories</option>
                                    <option value="core">Core</option>
                                    <option value="performance">Performance</option>
                                    <option value="integration">Integration</option>
                                </select>
                                <select id="status-filter" style="padding: 5px; margin-right: 10px; background: #444; color: white; border: 1px solid #666; border-radius: 4px;">
                                    <option value="all">All Status</option>
                                    <option value="passed">Passed</option>
                                    <option value="failed">Failed</option>
                                    <option value="warning">Warning</option>
                                </select>
                                <input type="text" id="search-filter" placeholder="Search tests..." style="padding: 5px; background: #444; color: white; border: 1px solid #666; border-radius: 4px; width: 200px;">
                            </div>
                            <div class="test-results-table" id="test-results-table">
                                <!-- Detailed test results table will be populated here -->
                            </div>
                        </div>
                    </div>

                    <div id="tab-coverage" class="tab-panel" style="display: none;">
                        <div class="coverage-analysis">
                            <h3 style="color: #98fb98; margin-bottom: 15px;">Test Coverage Analysis</h3>
                            <div class="coverage-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                <div class="chart-container" style="background: #333; padding: 15px; border-radius: 8px;">
                                    <h4 style="margin: 0 0 10px 0; color: #ccc;">Component Coverage</h4>
                                    <canvas id="coverage-bar-chart" width="350" height="250"></canvas>
                                </div>
                                <div class="coverage-details" id="coverage-details">
                                    <!-- Coverage details will be populated here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .metric {
                    display: flex;
                    justify-content: space-between;
                    margin: 5px 0;
                    padding: 3px 0;
                    border-bottom: 1px solid #444;
                }
                
                .metric:last-child {
                    border-bottom: none;
                }
                
                .label {
                    color: #ccc;
                    font-size: 12px;
                }
                
                .value {
                    font-weight: bold;
                    color: white;
                }
                
                .value.passed {
                    color: #28a745;
                }
                
                .value.failed {
                    color: #dc3545;
                }
                
                .value.warning {
                    color: #ffc107;
                }
                
                .tab-button.active {
                    background: #444 !important;
                    color: white !important;
                }
                
                .tab-button:hover {
                    background: #555 !important;
                    color: white !important;
                }
                
                .chart-container canvas {
                    max-width: 100%;
                }
                
                .test-results-table {
                    max-height: 400px;
                    overflow-y: auto;
                    border: 1px solid #444;
                    border-radius: 4px;
                }
                
                .test-result-row {
                    display: grid;
                    grid-template-columns: 30px 200px 80px 80px 100px 1fr;
                    padding: 8px;
                    border-bottom: 1px solid #444;
                    align-items: center;
                }
                
                .test-result-row:hover {
                    background: #444;
                }
                
                .test-result-row.passed {
                    border-left: 3px solid #28a745;
                }
                
                .test-result-row.failed {
                    border-left: 3px solid #dc3545;
                }
                
                .test-result-row.warning {
                    border-left: 3px solid #ffc107;
                }
            </style>
        `;
    }

    setupEventHandlers() {
        // タブ切り替え
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-button')) {
                this.switchTab(e.target.dataset.tab);
            }
        });

        // 制御ボタン
        document.getElementById('refresh-results').addEventListener('click', () => {
            this.refreshData();
        });

        document.getElementById('export-results').addEventListener('click', () => {
            this.exportResults();
        });

        document.getElementById('clear-history').addEventListener('click', () => {
            this.clearHistory();
        });

        document.getElementById('close-visualizer').addEventListener('click', () => {
            this.hide();
        });

        // フィルター
        document.getElementById('category-filter').addEventListener('change', (e) => {
            this.applyFilters();
        });

        document.getElementById('status-filter').addEventListener('change', (e) => {
            this.applyFilters();
        });

        document.getElementById('search-filter').addEventListener('input', (e) => {
            this.applyFilters();
        });
    }

    show() {
        this.isVisible = true;
        this.container.style.display = 'block';
        this.refreshData();
    }

    hide() {
        this.isVisible = false;
        this.container.style.display = 'none';
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    switchTab(tabName) {
        // タブボタンの状態更新
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = '#222';
            btn.style.color = '#ccc';
        });
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).style.background = '#444';
        document.querySelector(`[data-tab="${tabName}"]`).style.color = 'white';

        // タブパネルの表示切り替え
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.style.display = 'none';
        });
        
        document.getElementById(`tab-${tabName}`).style.display = 'block';

        // タブ固有のデータ更新
        this.updateTabContent(tabName);
    }

    refreshData() {
        const latestResults = this.testSupportTools.getLatestTestResults();
        const testHistory = this.testSupportTools.getTestHistory(20);
        
        if (!latestResults) {
            this.showNoDataMessage();
            return;
        }

        this.updateSummaryTab(latestResults);
        this.updatePerformanceTab(latestResults);
        this.updateTrendsTab(testHistory);
        this.updateDetailsTab(latestResults);
        this.updateCoverageTab(latestResults);
    }

    updateSummaryTab(results) {
        // 基本統計の更新
        document.getElementById('total-tests').textContent = results.results.passed + results.results.failed + results.results.skipped;
        document.getElementById('passed-tests').textContent = results.results.passed;
        document.getElementById('failed-tests').textContent = results.results.failed;
        
        const successRate = results.results.passed / (results.results.passed + results.results.failed) * 100;
        document.getElementById('success-rate').textContent = `${successRate.toFixed(1)}%`;

        document.getElementById('avg-execution').textContent = `${results.results.executionTime.toFixed(0)}ms`;
        document.getElementById('total-time').textContent = `${(results.results.executionTime / 1000).toFixed(1)}s`;
        document.getElementById('regressions').textContent = results.summary?.performance?.regressions?.length || 0;
        document.getElementById('improvements').textContent = results.summary?.performance?.improvements?.length || 0;

        // 品質スコア計算
        const qualityScore = this.calculateQualityScore(results);
        document.getElementById('quality-score-value').textContent = qualityScore;
        document.getElementById('quality-score-value').style.color = this.getQualityScoreColor(qualityScore);

        // チャート描画
        this.drawResultsPieChart(results);
        this.drawCategoryBarChart(results);
    }

    calculateQualityScore(results) {
        const successRate = results.results.passed / (results.results.passed + results.results.failed);
        const performanceScore = (results.summary?.performance?.improvements?.length || 0) - 
                               (results.summary?.performance?.regressions?.length || 0);
        const speedScore = Math.min(100, 10000 / results.results.executionTime);
        
        const overallScore = (successRate * 60) + (Math.min(10, Math.max(-10, performanceScore)) * 2) + (speedScore * 0.3);
        return Math.max(0, Math.min(100, Math.round(overallScore)));
    }

    getQualityScoreColor(score) {
        if (score >= 80) return '#28a745';
        if (score >= 60) return '#ffc107';
        if (score >= 40) return '#fd7e14';
        return '#dc3545';
    }

    drawResultsPieChart(results) {
        const canvas = document.getElementById('results-pie-chart');
        const ctx = canvas.getContext('2d');
        
        const data = [
            { label: 'Passed', value: results.results.passed, color: '#28a745' },
            { label: 'Failed', value: results.results.failed, color: '#dc3545' },
            { label: 'Skipped', value: results.results.skipped, color: '#6c757d' }
        ];

        this.drawPieChart(ctx, data, canvas.width, canvas.height);
    }

    drawCategoryBarChart(results) {
        const canvas = document.getElementById('category-bar-chart');
        const ctx = canvas.getContext('2d');
        
        const categories = results.summary?.categories || {};
        const data = Object.entries(categories).map(([name, stats]) => ({
            label: name,
            passed: stats.passed,
            failed: stats.failed,
            warnings: stats.warnings
        }));

        this.drawStackedBarChart(ctx, data, canvas.width, canvas.height);
    }

    updatePerformanceTab(results) {
        this.drawPerformanceLineChart();
        this.updateBenchmarkResults(results);
    }

    drawPerformanceLineChart() {
        const canvas = document.getElementById('performance-line-chart');
        const ctx = canvas.getContext('2d');
        
        const history = this.testSupportTools.getTestHistory(10);
        if (history.length === 0) return;

        const data = history.map((session, index) => ({
            x: index,
            y: session.executionTime,
            label: new Date(session.timestamp).toLocaleTimeString()
        }));

        this.drawLineChart(ctx, data, canvas.width, canvas.height, {
            title: 'Execution Time Trends',
            yLabel: 'Time (ms)',
            color: '#007acc'
        });
    }

    updateBenchmarkResults(results) {
        const container = document.getElementById('benchmark-results');
        if (!results.benchmarks) {
            container.innerHTML = '<p style="color: #ccc;">No benchmark data available</p>';
            return;
        }

        const benchmarkHTML = results.benchmarks.map(benchmark => `
            <div class="benchmark-item" style="background: #333; margin: 10px 0; padding: 15px; border-radius: 8px; border-left: 4px solid ${this.getBenchmarkStatusColor(benchmark)};">
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 10px;">
                    <h4 style="margin: 0; color: white;">${benchmark.name}</h4>
                    <span class="benchmark-status" style="color: ${this.getBenchmarkStatusColor(benchmark)}; font-weight: bold;">
                        ${benchmark.success ? 'PASS' : 'FAIL'}
                    </span>
                </div>
                <div class="benchmark-metrics" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                    ${Object.entries(benchmark.keyMetrics || {}).map(([key, value]) => `
                        <div class="metric">
                            <span class="label">${key}:</span>
                            <span class="value">${this.formatMetricValue(key, value)}</span>
                        </div>
                    `).join('')}
                </div>
                ${benchmark.comparison ? `
                    <div class="comparison" style="margin-top: 10px; padding: 8px; background: #222; border-radius: 4px;">
                        <small style="color: #ccc;">vs Baseline: 
                            <span style="color: ${this.getComparisonColor(benchmark.comparison.overallScore)}">
                                ${benchmark.comparison.overallScore.toFixed(1)}% performance
                            </span>
                        </small>
                    </div>
                ` : ''}
            </div>
        `).join('');

        container.innerHTML = benchmarkHTML;
    }

    getBenchmarkStatusColor(benchmark) {
        if (!benchmark.success) return '#dc3545';
        if (benchmark.comparison?.status === 'fail') return '#dc3545';
        if (benchmark.comparison?.status === 'warning') return '#ffc107';
        return '#28a745';
    }

    getComparisonColor(score) {
        if (score >= 100) return '#28a745';
        if (score >= 80) return '#ffc107';
        return '#dc3545';
    }

    formatMetricValue(key, value) {
        if (typeof value !== 'number') return value;
        
        if (key.includes('Time') || key.includes('Latency')) {
            return `${value.toFixed(2)}ms`;
        } else if (key.includes('FPS')) {
            return `${value.toFixed(1)} FPS`;
        } else if (key.includes('Memory')) {
            return `${value.toFixed(1)} MB`;
        } else if (key.includes('Rate')) {
            return `${value.toFixed(0)}/s`;
        }
        
        return value.toFixed(2);
    }

    updateTrendsTab(history) {
        this.drawTrendsLineChart(history);
        this.updateTrendsInsights(history);
    }

    drawTrendsLineChart(history) {
        const canvas = document.getElementById('trends-line-chart');
        const ctx = canvas.getContext('2d');
        
        if (history.length === 0) return;

        const data = history.map((session, index) => {
            const successRate = session.results.passed / (session.results.passed + session.results.failed) * 100;
            return {
                x: index,
                y: successRate,
                label: new Date(session.timestamp).toLocaleDateString()
            };
        });

        this.drawLineChart(ctx, data, canvas.width, canvas.height, {
            title: 'Success Rate Trends',
            yLabel: 'Success Rate (%)',
            color: '#28a745',
            yMin: 0,
            yMax: 100
        });
    }

    updateTrendsInsights(history) {
        const container = document.getElementById('trends-insights');
        
        if (history.length < 2) {
            container.innerHTML = '<p style="color: #ccc;">Not enough data for trend analysis</p>';
            return;
        }

        const analysis = this.analyzeTrends(history);
        
        const insightsHTML = `
            <div class="insights-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="insight-card" style="background: #333; padding: 15px; border-radius: 8px;">
                    <h4 style="margin: 0 0 10px 0; color: #87ceeb;">Success Rate Trend</h4>
                    <div class="trend-indicator ${analysis.successTrend}" style="display: flex; align-items: center;">
                        <span class="trend-icon">${this.getTrendIcon(analysis.successTrend)}</span>
                        <span class="trend-text" style="margin-left: 8px; font-weight: bold; color: ${this.getTrendColor(analysis.successTrend)};">
                            ${analysis.successTrend.toUpperCase()}
                        </span>
                    </div>
                    <p style="color: #ccc; margin: 10px 0 0 0; font-size: 12px;">
                        Current: ${analysis.currentSuccessRate.toFixed(1)}% 
                        (${analysis.successRateChange > 0 ? '+' : ''}${analysis.successRateChange.toFixed(1)}%)
                    </p>
                </div>

                <div class="insight-card" style="background: #333; padding: 15px; border-radius: 8px;">
                    <h4 style="margin: 0 0 10px 0; color: #87ceeb;">Performance Trend</h4>
                    <div class="trend-indicator ${analysis.performanceTrend}" style="display: flex; align-items: center;">
                        <span class="trend-icon">${this.getTrendIcon(analysis.performanceTrend)}</span>
                        <span class="trend-text" style="margin-left: 8px; font-weight: bold; color: ${this.getTrendColor(analysis.performanceTrend)};">
                            ${analysis.performanceTrend.toUpperCase()}
                        </span>
                    </div>
                    <p style="color: #ccc; margin: 10px 0 0 0; font-size: 12px;">
                        Avg Execution: ${analysis.avgExecutionTime.toFixed(0)}ms 
                        (${analysis.executionTimeChange > 0 ? '+' : ''}${analysis.executionTimeChange.toFixed(0)}ms)
                    </p>
                </div>
            </div>

            <div class="recommendations" style="margin-top: 20px; background: #333; padding: 15px; border-radius: 8px;">
                <h4 style="margin: 0 0 10px 0; color: #ffa500;">Recommendations</h4>
                <ul style="margin: 0; padding-left: 20px; color: #ccc;">
                    ${analysis.recommendations.map(rec => `<li style="margin: 5px 0;">${rec}</li>`).join('')}
                </ul>
            </div>
        `;

        container.innerHTML = insightsHTML;
    }

    analyzeTrends(history) {
        const recent = history.slice(-3);
        const older = history.slice(-6, -3);
        
        const recentSuccessRate = recent.reduce((sum, session) => {
            return sum + (session.results.passed / (session.results.passed + session.results.failed));
        }, 0) / recent.length * 100;

        const olderSuccessRate = older.length > 0 ? older.reduce((sum, session) => {
            return sum + (session.results.passed / (session.results.passed + session.results.failed));
        }, 0) / older.length * 100 : recentSuccessRate;

        const recentExecutionTime = recent.reduce((sum, session) => sum + session.executionTime, 0) / recent.length;
        const olderExecutionTime = older.length > 0 ? 
            older.reduce((sum, session) => sum + session.executionTime, 0) / older.length : recentExecutionTime;

        const successRateChange = recentSuccessRate - olderSuccessRate;
        const executionTimeChange = recentExecutionTime - olderExecutionTime;

        const successTrend = successRateChange > 5 ? 'improving' : 
                           successRateChange < -5 ? 'declining' : 'stable';
        const performanceTrend = executionTimeChange < -100 ? 'improving' : 
                                executionTimeChange > 100 ? 'declining' : 'stable';

        const recommendations = [];
        if (successTrend === 'declining') {
            recommendations.push('Review recent code changes that may have introduced test failures');
        }
        if (performanceTrend === 'declining') {
            recommendations.push('Investigate performance regressions in test execution');
        }
        if (recentSuccessRate < 80) {
            recommendations.push('Focus on stabilizing failing tests to improve overall quality');
        }
        if (recommendations.length === 0) {
            recommendations.push('Test suite is performing well - continue current practices');
        }

        return {
            successTrend,
            performanceTrend,
            currentSuccessRate: recentSuccessRate,
            avgExecutionTime: recentExecutionTime,
            successRateChange,
            executionTimeChange,
            recommendations
        };
    }

    getTrendIcon(trend) {
        switch (trend) {
            case 'improving': return '📈';
            case 'declining': return '📉';
            case 'stable': return '➡️';
            default: return '❓';
        }
    }

    getTrendColor(trend) {
        switch (trend) {
            case 'improving': return '#28a745';
            case 'declining': return '#dc3545';
            case 'stable': return '#ffc107';
            default: return '#6c757d';
        }
    }

    updateDetailsTab(results) {
        this.currentTestResults = results.results.results || [];
        this.applyFilters();
    }

    applyFilters() {
        if (!this.currentTestResults) return;

        const categoryFilter = document.getElementById('category-filter').value;
        const statusFilter = document.getElementById('status-filter').value;
        const searchFilter = document.getElementById('search-filter').value.toLowerCase();

        let filteredResults = this.currentTestResults.filter(test => {
            const matchesCategory = categoryFilter === 'all' || test.category === categoryFilter;
            const matchesStatus = statusFilter === 'all' || this.getTestStatus(test) === statusFilter;
            const matchesSearch = test.name.toLowerCase().includes(searchFilter);

            return matchesCategory && matchesStatus && matchesSearch;
        });

        this.renderTestResultsTable(filteredResults);
    }

    getTestStatus(test) {
        if (!test.passed && test.failed) return 'failed';
        if (test.passed && !test.failed) return 'passed';
        return 'warning';
    }

    renderTestResultsTable(results) {
        const container = document.getElementById('test-results-table');
        
        if (results.length === 0) {
            container.innerHTML = '<p style="color: #ccc; text-align: center; padding: 20px;">No tests match the current filters</p>';
            return;
        }

        const tableHTML = `
            <div class="test-result-row" style="background: #444; font-weight: bold;">
                <div>Status</div>
                <div>Test Name</div>
                <div>Category</div>
                <div>Duration</div>
                <div>Score</div>
                <div>Details</div>
            </div>
            ${results.map(test => `
                <div class="test-result-row ${this.getTestStatus(test)}">
                    <div>${this.getStatusIcon(test)}</div>
                    <div style="font-weight: bold;">${test.name}</div>
                    <div style="color: #ccc;">${test.category || 'N/A'}</div>
                    <div>${test.executionTime ? test.executionTime.toFixed(0) + 'ms' : 'N/A'}</div>
                    <div>${test.score ? test.score.toFixed(0) + '%' : 'N/A'}</div>
                    <div style="font-size: 11px; color: #ccc;">
                        ${test.error ? `Error: ${test.error.message}` : 'OK'}
                    </div>
                </div>
            `).join('')}
        `;

        container.innerHTML = tableHTML;
    }

    getStatusIcon(test) {
        const status = this.getTestStatus(test);
        switch (status) {
            case 'passed': return '✅';
            case 'failed': return '❌';
            case 'warning': return '⚠️';
            default: return '❓';
        }
    }

    updateCoverageTab(results) {
        this.drawCoverageBarChart();
        this.updateCoverageDetails(results);
    }

    drawCoverageBarChart() {
        const canvas = document.getElementById('coverage-bar-chart');
        const ctx = canvas.getContext('2d');
        
        // モックカバレッジデータ（実際の実装では真のカバレッジデータを使用）
        const coverageData = [
            { component: 'GameEngine', coverage: 85 },
            { component: 'BubbleManager', coverage: 92 },
            { component: 'ScoreManager', coverage: 78 },
            { component: 'InputManager', coverage: 88 },
            { component: 'AudioManager', coverage: 65 },
            { component: 'EffectManager', coverage: 71 }
        ];

        this.drawHorizontalBarChart(ctx, coverageData, canvas.width, canvas.height);
    }

    updateCoverageDetails(results) {
        const container = document.getElementById('coverage-details');
        
        const coverageHTML = `
            <h4 style="margin: 0 0 15px 0; color: #ccc;">Coverage Summary</h4>
            <div class="coverage-metrics">
                <div class="metric">
                    <span class="label">Overall Coverage:</span>
                    <span class="value" style="color: #28a745;">79.8%</span>
                </div>
                <div class="metric">
                    <span class="label">Components Tested:</span>
                    <span class="value">6 / 8</span>
                </div>
                <div class="metric">
                    <span class="label">Test Methods:</span>
                    <span class="value">${results.results.passed + results.results.failed}</span>
                </div>
                <div class="metric">
                    <span class="label">Assertions:</span>
                    <span class="value">247</span>
                </div>
            </div>

            <div class="coverage-recommendations" style="margin-top: 20px;">
                <h5 style="color: #ffa500; margin: 0 0 10px 0;">Coverage Gaps</h5>
                <ul style="margin: 0; padding-left: 20px; color: #ccc; font-size: 12px;">
                    <li>AudioManager needs more integration tests (65% coverage)</li>
                    <li>EffectManager particle system not fully tested (71% coverage)</li>
                    <li>Error handling paths need additional coverage</li>
                    <li>Mobile-specific code paths require testing</li>
                </ul>
            </div>
        `;

        container.innerHTML = coverageHTML;
    }

    updateTabContent(tabName) {
        // タブ固有の更新処理
        switch (tabName) {
            case 'performance':
                this.drawPerformanceLineChart();
                break;
            case 'trends':
                const history = this.testSupportTools.getTestHistory(20);
                this.drawTrendsLineChart(history);
                break;
            case 'coverage':
                this.drawCoverageBarChart();
                break;
        }
    }

    // チャート描画ユーティリティ
    drawPieChart(ctx, data, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;
        
        const total = data.reduce((sum, item) => sum + item.value, 0);
        if (total === 0) return;

        ctx.clearRect(0, 0, width, height);
        
        let currentAngle = -Math.PI / 2;
        
        data.forEach(item => {
            if (item.value === 0) return;
            
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = item.color;
            ctx.fill();
            
            // ラベル描画
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius + 20);
            const labelY = centerY + Math.sin(labelAngle) * (radius + 20);
            
            ctx.fillStyle = 'white';
            ctx.font = '11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${item.label}: ${item.value}`, labelX, labelY);
            
            currentAngle += sliceAngle;
        });
    }

    drawStackedBarChart(ctx, data, width, height) {
        if (data.length === 0) return;

        ctx.clearRect(0, 0, width, height);
        
        const margin = 40;
        const chartWidth = width - margin * 2;
        const chartHeight = height - margin * 2;
        const barWidth = chartWidth / data.length * 0.8;
        
        const maxValue = Math.max(...data.map(item => item.passed + item.failed + item.warnings));
        
        data.forEach((item, index) => {
            const x = margin + index * (chartWidth / data.length) + (chartWidth / data.length - barWidth) / 2;
            const total = item.passed + item.failed + item.warnings;
            
            if (total === 0) return;
            
            let y = margin + chartHeight;
            
            // Failed (bottom)
            if (item.failed > 0) {
                const failedHeight = (item.failed / maxValue) * chartHeight;
                ctx.fillStyle = '#dc3545';
                ctx.fillRect(x, y - failedHeight, barWidth, failedHeight);
                y -= failedHeight;
            }
            
            // Warnings (middle)
            if (item.warnings > 0) {
                const warningsHeight = (item.warnings / maxValue) * chartHeight;
                ctx.fillStyle = '#ffc107';
                ctx.fillRect(x, y - warningsHeight, barWidth, warningsHeight);
                y -= warningsHeight;
            }
            
            // Passed (top)
            if (item.passed > 0) {
                const passedHeight = (item.passed / maxValue) * chartHeight;
                ctx.fillStyle = '#28a745';
                ctx.fillRect(x, y - passedHeight, barWidth, passedHeight);
            }
            
            // Label
            ctx.fillStyle = 'white';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(item.label, x + barWidth / 2, margin + chartHeight + 15);
        });
    }

    drawLineChart(ctx, data, width, height, options = {}) {
        if (data.length === 0) return;

        ctx.clearRect(0, 0, width, height);
        
        const margin = 40;
        const chartWidth = width - margin * 2;
        const chartHeight = height - margin * 2;
        
        const minY = options.yMin !== undefined ? options.yMin : Math.min(...data.map(p => p.y));
        const maxY = options.yMax !== undefined ? options.yMax : Math.max(...data.map(p => p.y));
        const rangeY = maxY - minY || 1;
        
        // 軸描画
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin, margin + chartHeight);
        ctx.lineTo(margin + chartWidth, margin + chartHeight);
        ctx.stroke();
        
        // データ線描画
        ctx.strokeStyle = options.color || '#007acc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((point, index) => {
            const x = margin + (index / (data.length - 1)) * chartWidth;
            const y = margin + chartHeight - ((point.y - minY) / rangeY) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // データポイント描画
        ctx.fillStyle = options.color || '#007acc';
        data.forEach((point, index) => {
            const x = margin + (index / (data.length - 1)) * chartWidth;
            const y = margin + chartHeight - ((point.y - minY) / rangeY) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Y軸ラベル
        ctx.fillStyle = 'white';
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const value = minY + (rangeY * i / 5);
            const y = margin + chartHeight - (i / 5) * chartHeight;
            ctx.fillText(value.toFixed(0), margin - 5, y + 3);
        }
    }

    drawHorizontalBarChart(ctx, data, width, height) {
        if (data.length === 0) return;

        ctx.clearRect(0, 0, width, height);
        
        const margin = 80;
        const chartWidth = width - margin * 2;
        const chartHeight = height - margin * 2;
        const barHeight = chartHeight / data.length * 0.8;
        
        data.forEach((item, index) => {
            const y = margin + index * (chartHeight / data.length) + (chartHeight / data.length - barHeight) / 2;
            const barWidth = (item.coverage / 100) * chartWidth;
            
            // バー描画
            const color = item.coverage >= 80 ? '#28a745' : 
                         item.coverage >= 60 ? '#ffc107' : '#dc3545';
            ctx.fillStyle = color;
            ctx.fillRect(margin, y, barWidth, barHeight);
            
            // ラベル描画
            ctx.fillStyle = 'white';
            ctx.font = '11px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(item.component, margin - 5, y + barHeight / 2 + 3);
            
            // パーセンテージ表示
            ctx.textAlign = 'left';
            ctx.fillText(`${item.coverage}%`, margin + barWidth + 5, y + barHeight / 2 + 3);
        });
    }

    // エクスポート機能
    exportResults() {
        const results = this.testSupportTools.getLatestTestResults();
        if (!results) {
            alert('No test results to export');
            return;
        }

        const exportData = {
            timestamp: new Date().toISOString(),
            summary: results.summary,
            results: results.results,
            environment: results.environment
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `test-results-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all test history?')) {
            this.testSupportTools.clearTestHistory();
            this.refreshData();
        }
    }

    showNoDataMessage() {
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.innerHTML = '<div style="text-align: center; padding: 50px; color: #ccc;"><h3>No Test Data Available</h3><p>Run some tests to see results here.</p></div>';
        });
    }

    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.charts.clear();
    }
}

// グローバルアクセス用（デバッグ目的）
window.TestResultVisualizer = TestResultVisualizer;