/**
 * Test Result Visualizer
 * テスト結果の可視化とダッシュボード表示システム
 * 
 * Main Controller Pattern: Lightweight orchestrator delegating to specialized sub-components
 */

import { TestChartGenerator  } from './test-result-visualizer/TestChartGenerator.js';
import { TestDataVisualizer  } from './test-result-visualizer/TestDataVisualizer.js';

interface TestSupportTools { 
    // Define the interface based on usage
}

interface TestResult {
    id: string;
    name: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    error?: Error;
    timestamp: number;
}

interface TestSummary {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
    coverage?: number;
}

export class TestResultVisualizer {
    private testSupportTools: TestSupportTools;
    private chartGenerator: TestChartGenerator;
    private dataVisualizer: TestDataVisualizer;
    private container: HTMLElement | null = null;
    private charts = new Map<string, any>();
    private isVisible = false;
    private currentTestResults: TestResult[] | null = null;
    
    constructor(testSupportTools: TestSupportTools) {
        this.testSupportTools = testSupportTools;
        
        // Initialize sub-components using dependency injection
        this.chartGenerator = new TestChartGenerator(this);
        this.dataVisualizer = new TestDataVisualizer(this);
        this.initialize();
        console.log('[TestResultVisualizer] Initialized with Main Controller Pattern');
    }

    private initialize(): void {
        this.createContainer();
        this.setupEventHandlers();
    }

    private createContainer(): void {
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

    private createDashboardHTML(): string {
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
                                        <span class="label">Skipped:</span>
                                        <span class="value skipped" id="skipped-tests">--</span>
                                    </div>
                                </div>
                            </div>
                            <div class="summary-card" style="background: #333; padding: 15px; border-radius: 8px;">
                                <h3 style="margin: 0 0 10px 0; color: #ff8800;">Performance</h3>
                                <div id="performance-summary-content">
                                    <div class="metric">
                                        <span class="label">Total Duration:</span>
                                        <span class="value" id="total-duration">--</span>
                                    </div>
                                    <div class="metric">
                                        <span class="label">Average:</span>
                                        <span class="value" id="avg-duration">--</span>
                                    </div>
                                    <div class="metric">
                                        <span class="label">Slowest:</span>
                                        <span class="value" id="slowest-test">--</span>
                                    </div>
                                </div>
                            </div>
                            <div class="summary-card" style="background: #333; padding: 15px; border-radius: 8px;">
                                <h3 style="margin: 0 0 10px 0; color: #8800ff;">Coverage</h3>
                                <div id="coverage-summary-content">
                                    <div class="metric">
                                        <span class="label">Line Coverage:</span>
                                        <span class="value" id="line-coverage">--</span>
                                    </div>
                                    <div class="metric">
                                        <span class="label">Branch Coverage:</span>
                                        <span class="value" id="branch-coverage">--</span>
                                    </div>
                                    <div class="metric">
                                        <span class="label">Function Coverage:</span>
                                        <span class="value" id="function-coverage">--</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="charts-container" style="background: #333; padding: 15px; border-radius: 8px;">
                            <h3 style="margin: 0 0 10px 0; color: #00aaff;">Test Results Charts</h3>
                            <div id="chart-content"></div>
                        </div>
                    </div>

                    <div id="tab-performance" class="tab-panel" style="display: none;">
                        <div id="performance-charts"></div>
                    </div>

                    <div id="tab-trends" class="tab-panel" style="display: none;">
                        <div id="trends-charts"></div>
                    </div>

                    <div id="tab-details" class="tab-panel" style="display: none;">
                        <div id="test-details"></div>
                    </div>

                    <div id="tab-coverage" class="tab-panel" style="display: none;">
                        <div id="coverage-details"></div>
                    </div>
                </div>
            </div>
        `;
    }
    private setupEventHandlers(): void {
        if (!this.container) return;

        // Control buttons
        const refreshBtn = this.container.querySelector('#refresh-results');
        const exportBtn = this.container.querySelector('#export-results');
        const clearBtn = this.container.querySelector('#clear-history');
        const closeBtn = this.container.querySelector('#close-visualizer');
        
        refreshBtn?.addEventListener('click', () => this.refreshResults());
        exportBtn?.addEventListener('click', () => this.exportResults());
        clearBtn?.addEventListener('click', () => this.clearHistory());
        closeBtn?.addEventListener('click', () => this.hide());

        // Tab buttons
        const tabButtons = this.container.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const tabName = target.getAttribute('data-tab');
                if (tabName) {
                    this.switchTab(tabName);
                }
            });
        });
    }
    public show(): void {
        if (this.container) {
            this.container.style.display = 'block';
            this.isVisible = true;
            this.refreshResults();
        }
    }

    public hide(): void {
        if (this.container) {
            this.container.style.display = 'none';
            this.isVisible = false;
        }
    }

    public toggle(): void {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    private switchTab(tabName: string): void {
        if (!this.container) return;

        // Update tab buttons
        const tabButtons = this.container.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            (btn as HTMLElement).style.background = '#222';
            (btn as HTMLElement).style.color = '#ccc';
        });

        const activeButton = this.container.querySelector(`[data-tab="${tabName}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
            (activeButton as HTMLElement).style.background = '#444';
            (activeButton as HTMLElement).style.color = 'white';
        }

        // Update tab panels
        const tabPanels = this.container.querySelectorAll('.tab-panel');
        tabPanels.forEach(panel => {
            (panel as HTMLElement).style.display = 'none';
        });

        const activePanel = this.container.querySelector(`#tab-${tabName}`);
        if (activePanel) {
            (activePanel as HTMLElement).style.display = 'block';
        }

        // Load tab-specific content
        this.loadTabContent(tabName);
    }

    private loadTabContent(tabName: string): void {
        switch(tabName) {
            case 'summary':
                this.loadSummaryContent();
                break;
            case 'performance':
                this.loadPerformanceContent();
                break;
            case 'trends':
                this.loadTrendsContent();
                break;
            case 'details':
                this.loadDetailsContent();
                break;
            case 'coverage':
                this.loadCoverageContent();
                break;
        }
    }

    private loadSummaryContent(): void {
        // Delegate to chartGenerator
        this.chartGenerator.generateSummaryCharts();
    }

    private loadPerformanceContent(): void {
        // Delegate to chartGenerator
        this.chartGenerator.generatePerformanceCharts();
    }

    private loadTrendsContent(): void {
        // Delegate to chartGenerator
        this.chartGenerator.generateTrendsCharts();
    }

    private loadDetailsContent(): void {
        // Delegate to dataVisualizer
        this.dataVisualizer.renderTestDetails();
    }

    private loadCoverageContent(): void {
        // Delegate to dataVisualizer
        this.dataVisualizer.renderCoverageDetails();
    }

    private refreshResults(): void {
        // Get latest test results from testSupportTools
        // this.currentTestResults = this.testSupportTools.getLatestResults();
        this.updateSummaryDisplay();
        this.loadTabContent('summary');
    }

    private updateSummaryDisplay(): void {
        if (!this.currentTestResults || !this.container) return;

        const summary = this.calculateSummary(this.currentTestResults);
        
        // Update summary metrics
        this.updateElement('total-tests', summary.total.toString());
        this.updateElement('passed-tests', summary.passed.toString());
        this.updateElement('failed-tests', summary.failed.toString());
        this.updateElement('skipped-tests', summary.skipped.toString());

        this.updateElement('total-duration', `${summary.duration.toFixed(2)}ms`);
        this.updateElement('avg-duration', `${(summary.duration / summary.total).toFixed(2)}ms`);
    }

    private updateElement(id: string, text: string): void {
        const element = this.container?.querySelector(`#${id}`);
        if (element) {
            element.textContent = text;
        }
    }

    private calculateSummary(results: TestResult[]): TestSummary {
        return {
            total: results.length,
            passed: results.filter(r => r.status === 'passed').length,
            failed: results.filter(r => r.status === 'failed').length,
            skipped: results.filter(r => r.status === 'skipped').length,
            duration: results.reduce((sum, r) => sum + r.duration, 0)
        };
    }

    private exportResults(): void {
        if (!this.currentTestResults) return;

        const data = {
            results: this.currentTestResults,
            summary: this.calculateSummary(this.currentTestResults),
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `test-results-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    private clearHistory(): void {
        this.currentTestResults = null;
        this.charts.clear();
        this.updateSummaryDisplay();
    }

    public updateResults(results: TestResult[]): void {
        this.currentTestResults = results;
        if (this.isVisible) {
            this.updateSummaryDisplay();
            this.loadTabContent('summary');
        }
    }

    public destroy(): void {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.charts.clear();
    }
}