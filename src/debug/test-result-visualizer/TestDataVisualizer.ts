/**
 * Test Data Visualizer
 * テストデータの可視化表示クラス
 */

interface TestResult { id: string,
    name: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    error?: Error;
   , timestamp: number;
    tags?: string[];
    category?: string; ,}

interface CoverageData { lines: {
        tota;l: number;
        covered: number;
       , percentage: number };
    branches: { total: number;
        covered: number;
       , percentage: number };
    functions: { total: number;
        covered: number;
       , percentage: number };
    statements: { total: number;
        covered: number;
       , percentage: number }

export class TestDataVisualizer {
    private visualizer: any;
    constructor(visualizer: any) {
        this.visualizer = visualizer }

    public renderTestDetails()';
        const container = this.getContainer('test-details);
        if (!container) return;

        const results = this.getTestResults(');

        ')';
        container.innerHTML = `'';
            <div class="test-details-header">";
                <h3>Test Details</h3>"";
                <div class="filters">"";
                    <select id="status-filter">"";
                        <option value="">All Tests</option>"";
                        <option value="passed">Passed</option>"";
                        <option value="failed">Failed</option>"";
                        <option value="skipped">Skipped</option>";
                    </select>"";
                    <input type="text" id="search-filter" placeholder="Search tests..." />;
                </div>";
            </div>"";
            <div class="test-results-table">;
                ${this.renderTestTable(results})
            </div>;
        `;

        this.setupTestDetailsEventHandlers();
    }"

    public renderCoverageDetails("): void { ""
        const container = this.getContainer('coverage-details);
        if (!container) return;

        const coverage = this.getCoverageData(');

        ')';
        container.innerHTML = `'';
            <div class="coverage-header">;
                <h3>Code Coverage Analysis</h3>";
            </div>"";
            <div class="coverage-summary">" }"
                ${this.renderCoverageSummary(coverage"})"
            </div>"";
            <div class="coverage-breakdown">;
                ${this.renderCoverageBreakdown(coverage})
            </div>;
        `;
    }
";
    public renderPerformanceMetrics(): void { const results = this.getTestResults();""
        const metrics = this.calculatePerformanceMetrics(results);"

        const container = this.getContainer('performance-metrics);''
        if(!container) return;
';

        container.innerHTML = `'';
            <div class="performance-metrics">";
                <h3>Performance Metrics</h3>"";
                <div class="metrics-grid">"";
                    <div class="metric-card">";
                        <h4>Total Duration</h4>" }"
                        <span class="metric-value">${metrics.totalDuration.toFixed(2"})ms</span>"
                    </div>"";
                    <div class="metric-card">";
                        <h4>Average Duration</h4>"";
                        <span class="metric-value">${metrics.averageDuration.toFixed(2"})ms</span>"
                    </div>"";
                    <div class="metric-card">";
                        <h4>Slowest Test</h4>"";
                        <span class="metric-value">${metrics.slowestTest? .duration.toFixed(2"})ms</span>""
                        <span class="metric-label">${metrics.slowestTest?.name}</span>"
                    </div>"";
                    <div class="metric-card">";
                        <h4>Fastest Test</h4>"";
                        <span class="metric-value">${metrics.fastestTest?.duration.toFixed(2"})ms</span>""
                        <span class="metric-label">${metrics.fastestTest?.name}</span>
                    </div>;
                </div>;
            </div>;
        `;
    }
 : undefined";
    private renderTestTable(results: TestResult[]): string { ""
        if(!results.length) {", ";
        }"
            return '<div class="no-results">No test results available</div>';
';

        const rows = results.map(result => `)';
            <tr class="test-row ${result.status}">")""
                <td class="test-name" title="${ result.name"}">" }"
                    ${this.truncateText(result.name, 50"})"
                </td>"";
                <td class="test-status">"";
                    <span class="status-badge status-${result.status}">""
                        ${this.getStatusIcon(result.status"}) ${result.status}"
                    </span>";
                </td>"";
                <td class="test-duration">${result.duration.toFixed(2"})ms</td>""
                <td class="test-timestamp">${this.formatTimestamp(result.timestamp"})</td>""
                <td class="test-actions">"";
                    <button class="btn-small" onclick="this.showTestDetails('${ result.id}''}">
                        Details";
                    </button>"";
                    ${result.status === 'failed' ? `' }

                        <button, class="btn-small, btn-warning" onclick="this.showError('${result.id}''})">
                            Error";
                        </button> : undefined"";
                    ` : ''}
                </td>';
            </tr>'';
        `').join(''');
';

        return `'';
            <table class="test-table">;
                <thead>;
                    <tr>;
                        <th>Test Name</th>;
                        <th>Status</th>;
                        <th>Duration</th>;
                        <th>Timestamp</th>;
                        <th>Actions</th>;
                    </tr>;
                </thead>;
                <tbody>;
                    ${rows}
                </tbody>;
            </table>;
        `;
    }"

    private renderCoverageSummary(coverage: CoverageData): string { return `""
            <div class="coverage-summary-grid">"";
                <div class="coverage-card">";
                    <h4>Lines</h4>"";
                    <div class="coverage-progress">"";
                        <div class="progress-bar">" }"
                            <div class="progress-fill" style="width: ${coverage.lines.percentage}%"></div>"
                        </div>"";
                        <span class="coverage-text">${coverage.lines.percentage.toFixed(1"})%</span>
                    </div>;
                    <small>${coverage.lines.covered}/${coverage.lines.total} lines covered</small>
                </div>";

                <div class="coverage-card">";
                    <h4>Branches</h4>"";
                    <div class="coverage-progress">"";
                        <div class="progress-bar">"";
                            <div class="progress-fill" style="width: ${coverage.branches.percentage}%"></div>"
                        </div>"";
                        <span class="coverage-text">${coverage.branches.percentage.toFixed(1"})%</span>
                    </div>;
                    <small>${coverage.branches.covered}/${coverage.branches.total} branches covered</small>
                </div>";

                <div class="coverage-card">";
                    <h4>Functions</h4>"";
                    <div class="coverage-progress">"";
                        <div class="progress-bar">"";
                            <div class="progress-fill" style="width: ${coverage.functions.percentage}%"></div>"
                        </div>"";
                        <span class="coverage-text">${coverage.functions.percentage.toFixed(1"})%</span>
                    </div>;
                    <small>${coverage.functions.covered}/${coverage.functions.total} functions covered</small>
                </div>";

                <div class="coverage-card">";
                    <h4>Statements</h4>"";
                    <div class="coverage-progress">"";
                        <div class="progress-bar">"";
                            <div class="progress-fill" style="width: ${coverage.statements.percentage}%"></div>"
                        </div>"";
                        <span class="coverage-text">${coverage.statements.percentage.toFixed(1})%</span>
                    </div>;
                    <small>${coverage.statements.covered}/${coverage.statements.total} statements covered</small>
                </div>;
            </div>;
        `;
    }"

    private renderCoverageBreakdown(coverage: CoverageData): string { return `""
            <div class="coverage-breakdown">";
                <h4>Coverage Breakdown by File</h4>"";
                <div class="coverage-files">"";
                    <div class="file-coverage">"";
                        <span class="file-name">src/components/GameEngine.js</span>"";
                        <div class="file-coverage-bar">"";
                            <div class="coverage-fill" style="width: 85%"></div>";
                        </div>"";
                        <span class="coverage-percentage">85%</span>";
                    </div>"";
                    <div class="file-coverage">"";
                        <span class="file-name">src/components/BubbleManager.js</span>"";
                        <div class="file-coverage-bar">"";
                            <div class="coverage-fill" style="width: 92%"></div>";
                        </div>"";
                        <span class="coverage-percentage">92%</span>";
                    </div>"";
                    <div class="file-coverage">"";
                        <span class="file-name">src/utils/CollisionDetection.js</span>"";
                        <div class="file-coverage-bar">"";
                            <div class="coverage-fill" style="width: 76%"></div>";
                        </div>"";
                        <span class="coverage-percentage">76%</span>;
                    </div>;
                </div>;
            </div>;
        `; }"

    private setupTestDetailsEventHandlers("): void { ""
        const statusFilter = document.getElementById('status-filter'') as HTMLSelectElement;''
        const searchFilter = document.getElementById('search-filter) as HTMLInputElement;

        if(statusFilter) {', ';

        }

            statusFilter.addEventListener('change', () => {  }
                this.filterTests(); }
            });
        }

        if(searchFilter) {', ';

        }

            searchFilter.addEventListener('input', () => {  }
                this.filterTests(); }
            });
        }
    }

    private filterTests()';
        const statusFilter = (document.getElementById('status-filter) as HTMLSelectElement')? .value;''
        const searchFilter = (document.getElementById('search-filter) as HTMLInputElement)?.value.toLowerCase()';
        const rows = document.querySelectorAll('.test-row);

        rows.forEach(row => {  ')'
            const element = row as HTMLElement'); : undefined''
            const status = element.classList.contains('passed'') ? 'passed' : '';
                          element.classList.contains('failed'') ? 'failed' : 'skipped';''
            const name = element.querySelector('.test-name)? .textContent?.toLowerCase(') || '';
';

            const matchesStatus = !statusFilter || status === statusFilter;''
            const matchesSearch = !searchFilter || name.includes(searchFilter);

 : undefined', '
            element.style.display = matchesStatus && matchesSearch ? '' : 'none'; }
        });
    }

    private calculatePerformanceMetrics(results: TestResult[]): { totalDuration: number,
        averageDuration: number;
        slowestTest: TestResult | null;
       , fastestTest: TestResult | null ,} { if (!results.length) {
            return { totalDuration: 0;
                averageDuration: 0;
               , slowestTest: null, };
                fastestTest: null }
            }

        const totalDuration = results.reduce((sum, test) => sum + test.duration, 0);
        const averageDuration = totalDuration / results.length;
        const slowestTest = results.reduce((prev, current) => ;
            current.duration > prev.duration ? current : prev;
        );
        const fastestTest = results.reduce((prev, current) => ;
            current.duration < prev.duration ? current : prev;
        );

        return { totalDuration,
            averageDuration,
            slowestTest, };
            fastestTest }
        }

    private getTestResults(): TestResult[] { return this.visualizer.currentTestResults || []; }

    private getCoverageData(): CoverageData { // Mock coverage data - would be real data in actual implementation
        return { }
            lines: { total: 1250, covered: 1087, percentage: 86.9 ,},
            branches: { total: 340, covered: 298, percentage: 87.6 ,},
            functions: { total: 156, covered: 142, percentage: 91.0 ,},
            statements: { total: 1180, covered: 1025, percentage: 86.9 ,}

    private getContainer(id: string): HTMLElement | null { return document.getElementById(id); }
';

    private getStatusIcon(status: string): string { ''
        switch(status) {'

            case 'passed': return '✓';''
            case 'failed': return '✗';''
            case 'skipped': return '⚠';

        }

            default: return '? ';

 : undefined';
    private truncateText(text: string, maxLength: number): string { ''
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text; }
';

    private formatTimestamp(timestamp: number): string { ''
        return new Date(timestamp).toLocaleTimeString(' }'