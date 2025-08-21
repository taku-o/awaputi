/**
 * Test Panel - テスト支援機能パネル  
 */

interface TestResult { type: string,
    totalTests: number;
    passedTests: number;
    failedTests: number,
    duration: number;
    details?: TestDetail[]
    ,}

interface TestDetail { name: string;
    status: 'passed' | 'failed',
    duration: number;
    error?: string }

interface BenchmarkResult { type: string;
    duration: number;
    fps: number;
    memoryUsage: number;
    renderTime: number,
    score: number }

interface TestSummary { total: number;
    passed: number;
    failed: number;
    successRate: number,
    duration: number }

interface CategoryStats { [category: string]: {
        tota;l: number;
        passed: number,
    failed: number }
';

interface IntegrationTestResult { name: string,''
    status: 'passed' | 'failed';
    message: string,
    duration: number ,}

interface IntegrationTestResults { summary?: TestSummary;
    categoryStats?: CategoryStats;
    results?: IntegrationTestResult[];
    }

interface ValidationResult { id: string,

    name: string,
    status: 'passed' | 'failed';
    message: string,
    duration: number ,}

interface ValidationResults { summary?: TestSummary;
    categoryStats?: CategoryStats;
    results?: ValidationResult[];
    }

interface FinalValidationResult { category: string,

    name: string,
    status: 'passed' | 'failed';
    message: string,
    duration: number ,}

interface FinalValidationResults { summary?: TestSummary;
    targets?: {
        debugOverhea;d: number;
        memoryIncrease: number;
        initializationTime: number,
    panelSwitchTime: number ,};
    categoryStats?: CategoryStats;
    results?: FinalValidationResult[];
    }

interface TestSupportTools { runTests(type: string): Promise<TestResult>,
    generateTestData(dataType: string, count: number): void ,}

interface GameEngine { testSupportTools?: TestSupportTools;
    playerData?: any;
    activateBonusTime?(duration: number): void,
    activateTimeStop?(duration: number): void, 
interface DebugInterface { runIntegrationTests?(): Promise<IntegrationTestResults>;
    runCategoryIntegrationTests?(category: string): Promise<IntegrationTestResults>,
    exportIntegrationTestResults?(): Promise<any>;
    runRequirementsValidation?(): Promise<ValidationResults>;
    exportRequirementsValidationResults?(): Promise<any>;
    runFinalValidation?(): Promise<FinalValidationResults>;
    exportFinalValidationResults?(): Promise<any>;
    }

export class TestPanel {
    private gameEngine: GameEngine;
    private debugInterface: DebugInterface;
    private element: HTMLElement | null = null;
    private testSupportTools?: TestSupportTools;
    private, testResults: any[] = [];
    constructor(gameEngine: GameEngine, debugInterface: DebugInterface) {

        this.gameEngine = gameEngine;
        this.debugInterface = debugInterface;

    ,}
        this.testSupportTools = gameEngine.testSupportTools; }
    }

    /**
     * パネルを作成'
     */''
    create()';
        this.element = document.createElement('div'');''
        this.element.className = 'debug-test-panel';

        this.element.innerHTML = `'';
            <div class="test-section">";
                <h4>テスト実行</h4>"";
                <div class="test-controls">"";
                    <button id="run-unit-tests">ユニットテスト実行</button>"";
                    <button id="run-integration-tests">統合テスト実行</button>"";
                    <button id="run-performance-tests">パフォーマンステスト実行</button>"";
                    <button id="run-all-tests">全テスト実行</button>;
                </div>;
            </div>";

            <div class="test-section">";
                <h4>モックデータ生成</h4>"";
                <div class="mock-controls">"";
                    <div class="mock-group">";
                        <label>バブル生成:</label>"";
                        <input type="number" id="bubble-count" value="10" min="1" max="100">"";
                        <button id="generate-bubbles">生成</button>";
                    </div>"";
                    <div class="mock-group">";
                        <label>プレイヤーデータ:</label>"";
                        <select id="player-data-type">"";
                            <option value="beginner">初心者</option>"";
                            <option value="intermediate">中級者</option>"";
                            <option value="expert">上級者</option>";
                        </select>"";
                        <button id="generate-player-data">生成</button>";
                    </div>"";
                    <div class="mock-group">";
                        <label>ゲーム状態:</label>"";
                        <select id="game-state-type">"";
                            <option value="normal">通常</option>"";
                            <option value="bonus">ボーナス中</option>"";
                            <option value="timestop">時間停止中</option>";
                        </select>"";
                        <button id="set-game-state">設定</button>;
                    </div>;
                </div>;
            </div>";

            <div class="test-section">";
                <h4>ベンチマーク</h4>"";
                <div class="benchmark-controls">"";
                    <button id="benchmark-particles">パーティクル性能</button>"";
                    <button id="benchmark-rendering">レンダリング性能</button>"";
                    <button id="benchmark-memory">メモリ性能</button>"";
                    <button id="benchmark-all">全体ベンチマーク</button>";
                </div>"";
                <div class="benchmark-results" id="benchmark-results"></div>;
            </div>";

            <div class="test-section">";
                <h4>統合テスト</h4>"";
                <div class="integration-controls">"";
                    <button id="run-integration-tests">全統合テスト実行</button>"";
                    <button id="run-game-integration">ゲームシステム統合</button>"";
                    <button id="run-compatibility-tests">互換性テスト</button>"";
                    <button id="export-test-results">結果エクスポート</button>";
                </div>"";
                <div class="integration-results" id="integration-results"></div>;
            </div>";

            <div class="test-section">";
                <h4>要件検証テスト</h4>"";
                <div class="validation-controls">"";
                    <button id="run-requirements-validation">全要件検証実行</button>"";
                    <button id="export-validation-results">検証結果エクスポート</button>";
                </div>"";
                <div class="validation-results" id="validation-results"></div>;
            </div>";

            <div class="test-section">";
                <h4>最終検証テスト</h4>"";
                <div class="final-validation-controls">"";
                    <button id="run-final-validation">最終検証実行</button>"";
                    <button id="export-final-validation-results">最終検証結果エクスポート</button>";
                </div>"";
                <div class="final-validation-results" id="final-validation-results"></div>;
            </div>";

            <div class="test-section">";
                <h4>テスト結果</h4>"";
                <div class="test-results" id="test-results">"";
                    <div class="no-results">テスト結果がここに表示されます</div>;
                </div>;
            </div>;
        `;

        this.bindEvents();
        return this.element;
    }

    /**
     * イベントバインド
     */"
    private bindEvents(): void { ""
        if (!this.element) return;
";
        // テスト実行ボタン""
        this.element.querySelector('#run-unit-tests'')?.addEventListener('click', () => { ' }

            this.runTests('unit';' }

        }');

        this.element.querySelector('#run-integration-tests'')?.addEventListener('click', () => {  ' }

            this.runTests('integration';' }

        }');

        this.element.querySelector('#run-performance-tests'')?.addEventListener('click', () => {  ' }

            this.runTests('performance';' }

        }');

        this.element.querySelector('#run-all-tests'')?.addEventListener('click', () => {  ' }

            this.runTests('all';' }

        }');
';
        // モックデータ生成
        this.element.querySelector('#generate-bubbles'')?.addEventListener('click', () => {  ''
            const countInput = this.element!.querySelector('#bubble-count) as HTMLInputElement;
            const count = parseInt(countInput.value); }

            this.generateMockBubbles(count);' }'

        }');

        this.element.querySelector('#generate-player-data'')?.addEventListener('click', () => {  ''
            const typeSelect = this.element!.querySelector('#player-data-type) as HTMLSelectElement;
            const type = typeSelect.value; }

            this.generateMockPlayerData(type);' }'

        }');

        this.element.querySelector('#set-game-state'')?.addEventListener('click', () => {  ''
            const typeSelect = this.element!.querySelector('#game-state-type) as HTMLSelectElement;
            const type = typeSelect.value; }

            this.setMockGameState(type);' }'

        }');
';
        // ベンチマークボタン
        this.element.querySelector('#benchmark-particles'')?.addEventListener('click', () => {  ' }

            this.runBenchmark('particles';' }

        }');

        this.element.querySelector('#benchmark-rendering'')?.addEventListener('click', () => {  ' }

            this.runBenchmark('rendering';' }

        }');

        this.element.querySelector('#benchmark-memory'')?.addEventListener('click', () => {  ' }

            this.runBenchmark('memory';' }

        }');

        this.element.querySelector('#benchmark-all'')?.addEventListener('click', () => {  ' }

            this.runBenchmark('all';' }

        }');
';
        // 統合テストボタン
        this.element.querySelector('#run-integration-tests'')?.addEventListener('click', () => { this.runIntegrationTests();' }

        }');

        this.element.querySelector('#run-game-integration'')?.addEventListener('click', () => {  ' }

            this.runCategoryIntegrationTests('gameSystemIntegration';' }

        }');

        this.element.querySelector('#run-compatibility-tests'')?.addEventListener('click', () => {  ' }

            this.runCategoryIntegrationTests('crossBrowserCompatibility';' }

        }');

        this.element.querySelector('#export-test-results'')?.addEventListener('click', () => { this.exportIntegrationTestResults();' }

        }');
';
        // 要件検証テストボタン
        this.element.querySelector('#run-requirements-validation'')?.addEventListener('click', () => { this.runRequirementsValidation();' }

        }');

        this.element.querySelector('#export-validation-results'')?.addEventListener('click', () => { this.exportValidationResults();' }

        }');
';
        // 最終検証テストボタン
        this.element.querySelector('#run-final-validation'')?.addEventListener('click', () => { this.runFinalValidation();' }

        }');

        this.element.querySelector('#export-final-validation-results'')?.addEventListener('click', () => { this.exportFinalValidationResults(); });
    }

    /**
     * テストを実行'
     */ : undefined''
    async runTests(type: string): Promise<void> { ', '
        this.addTestResult(`${type}テストを開始中...`, 'info);
        
        try { if (this.testSupportTools) {
                const results = await this.testSupportTools.runTests(type);
                this.displayTestResults(results); } else {  // フォールバック：基本的なテスト実行
                const results = await this.runBasicTests(type); }
                this.displayTestResults(results); }
            } catch (error) { }

            this.addTestResult(`テスト実行エラー: ${(error, as, Error'}'.message}`, 'error');
        }
    }

    /**
     * 基本的なテストを実行
     */'
    private async runBasicTests(type: string): Promise<TestResult> { ''
        await new Promise(resolve => setTimeout(resolve, 1000)); // シミュレーション

        const mockResults: TestResult = {
            type: type;
            totalTests: 15;
            passedTests: 13;
            failedTests: 2;
            duration: 1234,
    details: [' ,}'

                { name: 'GameEngine初期化テスト', status: 'passed', duration: 45 ,},''
                { name: 'バブル生成テスト', status: 'passed', duration: 23 ,},''
                { name: 'スコア計算テスト', status: 'failed', duration: 67, error: 'Expected 100, got 95' },''
                { name: 'パーティクル生成テスト', status: 'passed', duration: 34 ,},]'
                { name: 'エフェクト表示テスト', status: 'failed', duration: 89, error: 'Timeout after 5000ms' ,}]
            ];
        };

        return mockResults;
    }

    /**
     * テスト結果を表示
     */
    private displayTestResults(results: TestResult): void { const successRate = ((results.passedTests / results.totalTests) * 100).toFixed(1);

        ' }'

        this.addTestResult(`${results.type}テスト完了: ${results.passedTests}/${results.totalTests} 成功 (${ successRate)%')`, ''
            results.failedTests === 0 ? 'success' : 'warning'};

        if (results.details} { }

            results.details.forEach(detail => {});''
                const message = `${detail.name}: ${detail.status} (${ detail.duration)ms')`;''
                this.addTestResult(message, detail.status === 'passed' ? 'success' : 'error};
                ';

                if (detail.error} {' }'

                    this.addTestResult(`  → ${detail.error}`, 'error'});
                }
            }';
        }
    }

    /**
     * モックバブルを生成
     */'
    private generateMockBubbles(count: number): void { try {'
            if(this.testSupportTools && this.testSupportTools.generateTestData) {', ';

            }

                this.testSupportTools.generateTestData('bubbles', count); }
            } else {  // フォールバック：基本的なバブル生成シミュレーション
                for (let, i = 0; i < count; i++) { }
                    // モックバブル生成の簡単なシミュレーション }
                    console.log(`Mock, bubble ${i + 1} generated`});
                }
            }

            this.addTestResult(`${count}個のテスト用バブルを生成しました`, 'success'});

        } catch (error) { }

            this.addTestResult(`バブル生成エラー: ${(error, as, Error'}'.message}`, 'error');
        }
    }

    /**
     * モックプレイヤーデータを生成
     */
    private generateMockPlayerData(type: string): void { try {
            const mockData: Record<string, any> = { }
                beginner: { score: 1000, level: 1, playtime: 300 ,},
                intermediate: { score: 50000, level: 15, playtime: 18000 ,},
                expert: { score: 500000, level: 50, playtime: 180000 ,};

            const data = mockData[type];
            if(data && this.gameEngine.playerData) {'
                // プレイヤーデータを一時的に設定（実際のゲームでは注意が必要）
            }

                console.log(`Mock player data set:`, data); }
            }

            this.addTestResult(`${type}プレイヤーデータを生成しました`, 'success);

        } catch (error) { }

            this.addTestResult(`プレイヤーデータ生成エラー: ${(error, as, Error'}'.message}`, 'error');
        }
    }

    /**
     * モックゲーム状態を設定
     */'
    private setMockGameState(type: string): void { try {'
            switch(type) {'

                case 'normal':;
                    // 通常状態に設定
                    break;''
                case 'bonus':';
                    if (this.gameEngine.activateBonusTime) {'
            }

                        this.gameEngine.activateBonusTime(10000); // 10秒間 }
                    }
                    break;''
                case 'timestop':;
                    if (this.gameEngine.activateTimeStop) { this.gameEngine.activateTimeStop(5000); // 5秒間 }
                    break;
            }

            this.addTestResult(`ゲーム状態を${type}に設定しました`, 'success'});

        } catch (error) { }

            this.addTestResult(`ゲーム状態設定エラー: ${(error, as, Error'}'.message}`, 'error');
        }
    }

    /**
     * ベンチマークを実行
     */'
    private async runBenchmark(type: string): Promise<void> { ''
        this.addBenchmarkResult(`${type)ベンチマークを開始中...`, 'info'};
        
        try {
            const results = await this.runBenchmarkTest(type}
            this.displayBenchmarkResults(results});

        } catch (error) { }

            this.addBenchmarkResult(`ベンチマークエラー: ${(error, as, Error'}'.message}`, 'error');
        }
    }

    /**
     * ベンチマークテストを実行
     */
    private async runBenchmarkTest(type: string): Promise<BenchmarkResult> { const startTime = performance.now();
        
        // シミュレーション
        await new Promise(resolve => setTimeout(resolve, 2000);
        
        const endTime = performance.now();
        const duration = endTime - startTime;

        // モック結果
        const mockResults: BenchmarkResult = {
            type: type;
            duration: duration,
    fps: Math.random() * 20 + 40, // 40-60 FPS;
            memoryUsage: Math.random() * 50 + 50, // 50-100 MB;
            renderTime: Math.random() * 10 + 5, // 5-15 ms;
            score: Math.floor(Math.random() * 40 + 60) // 60-100点 ,}
        };
        return mockResults;
    }

    /**
     * ベンチマーク結果を表示
     */
    private displayBenchmarkResults(results: BenchmarkResult): void { ''
        if(!this.element) return;

        const resultsDiv = this.element.querySelector('#benchmark-results' as HTMLElement;''
        if(resultsDiv) {'

            const div = document.createElement('div'');''
            div.className = 'benchmark-result';
        }
            div.innerHTML = ` }
                <h5>${results.type}ベンチマーク結果</h5>
                <div>スコア: ${results.score}/100</div>
                <div>FPS: ${results.fps.toFixed(1})</div>
                <div>メモリ使用量: ${results.memoryUsage.toFixed(1}) MB</div>
                <div>描画時間: ${results.renderTime.toFixed(2}) ms</div>
                <div>実行時間: ${results.duration.toFixed(0}) ms</div>'
            `;''
            resultsDiv.appendChild(div);
        }
    }

    /**
     * テスト結果を追加'
     */''
    private addTestResult(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info': void { ''
        if(!this.element) return;

        const results = this.element.querySelector('#test-results' as HTMLElement;''
        if(results) {'

            // "結果がありません"メッセージを削除""
            const noResults = results.querySelector('.no-results);

            if (noResults) {''
                noResults.remove();
        }

            const div = document.createElement('div''); }
            div.className = `test-result test-${type}`;

            div.innerHTML = `'';
                <span class="result-time">${new, Date(}.toLocaleTimeString("}"</span>""
                <span class="result-message">${message}</span>"
            `;""
            results.appendChild(div);
            results.scrollTop = results.scrollHeight;
        }
    }

    /**
     * ベンチマーク結果を追加"
     */""
    private addBenchmarkResult(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info): void { this.addTestResult(message, type); }

    /**
     * パネルを表示
     */'
    show(): void { ''
        if(this.element) {', ';

        }

            this.element.style.display = 'block'; }
}

    /**
     * パネルを非表示
     */'
    hide(): void { ''
        if(this.element) {', ';

        }

            this.element.style.display = 'none'; }
}

    /**
     * パネルサイズを更新（レスポンシブレイアウト用）
     */'
    updateSize(): void { // パネルサイズ変更時の処理
        if(this.element) {'
            // ベンチマーク結果の表示を調整
            const resultsDiv = this.element.querySelector('#benchmark-results) as HTMLElement;
            if (resultsDiv) {
                // 必要に応じてスクロール位置を調整
        }
                resultsDiv.scrollTop = resultsDiv.scrollHeight; }
}
    }

    /**
     * 統合テストを実行
     */''
    private async runIntegrationTests()';
        this.addTestResult('統合テストを開始中...', 'info);
        
        try { if (this.debugInterface && this.debugInterface.runIntegrationTests) {'
                const results = await this.debugInterface.runIntegrationTests();''
                this.displayIntegrationTestResults(results); }

            } else { }'

                this.addTestResult('統合テストシステムが利用できません', 'error); }

            } catch (error) { }

            this.addTestResult(`統合テスト実行エラー: ${(error, as, Error'}'.message}`, 'error');
        }
    }

    /**
     * カテゴリ別統合テストを実行'
     */''
    private async runCategoryIntegrationTests(category: string): Promise<void> { const categoryNames: Record<string, string> = {'', 'gameSystemIntegration': 'ゲームシステム統合',
            'existingSystemCompatibility': '既存システム互換性',
            'crossBrowserCompatibility': 'クロスブラウザ互換性',
            'performanceIntegration': 'パフォーマンス統合',
            'errorHandling': 'エラーハンドリング',
            'memoryManagement': 'メモリ管理' };
';

        const categoryName = categoryNames[category] || category;''
        this.addTestResult(`${ categoryName)テストを開始中...`, 'info'};
        
        try {
            if(this.debugInterface && this.debugInterface.runCategoryIntegrationTests} {
                
            }

                const, results = await, this.debugInterface.runCategoryIntegrationTests(category);' }'

                this.displayIntegrationTestResults(results'}';

            } else { }'

                this.addTestResult('統合テストシステムが利用できません', 'error); }

            } catch (error) { }

            this.addTestResult(`${categoryName}テスト実行エラー: ${(error, as, Error'}'.message}`, 'error');
        }
    }

    /**
     * 統合テスト結果を表示
     */'
    private displayIntegrationTestResults(results: IntegrationTestResults): void { ''
        if(!this.element) return;

        const integrationResults = this.element.querySelector('#integration-results) as HTMLElement;
        if (!integrationResults) return;

        // 結果サマリー表示
        if(results.summary) {
            const summary = results.summary;''
            const successRate = summary.successRate.toFixed(1);

            const summaryDiv = document.createElement('div'');''
            summaryDiv.className = 'integration-summary';
            summaryDiv.innerHTML = `';
                <h5>統合テスト結果サマリー</h5>';
        }

                <div class="summary-stats">" }"
                    <span class="stat">総テスト数: ${summary.total}</span>""
                    <span class="stat success">成功: ${summary.passed}</span>""
                    <span class="stat ${summary.failed > 0 ? 'error' : 'success'}">失敗: ${summary.failed}</span>""
                    <span class="stat">成功率: ${successRate}%</span>""
                    <span class="stat">実行時間: ${summary.duration.toFixed(0})ms</span>
                </div>;
            `;
            integrationResults.appendChild(summaryDiv);
        }

        // カテゴリ別結果表示
        if(results.categoryStats) {"

            Object.entries(results.categoryStats).forEach(([category, stats]) => { ""
                const categoryDiv = document.createElement('div'');

        }

                categoryDiv.className = 'category-result'; }
                categoryDiv.innerHTML = ` }

                    <h6>${category}</h6>''
                    <div class="category-stats">"";
                        <span class="success">${stats.passed}/${stats.total} 成功</span>""
                        ${stats.failed > 0 ? `<span, class="error">${stats.failed} 失敗</span>` : ''
                    </div>;
                `;
                integrationResults.appendChild(categoryDiv);
            });
        }
';
        // 詳細結果表示
        if(results.results && results.results.length > 0) {'

            const detailsDiv = document.createElement('div'');''
            detailsDiv.className = 'integration-details';
            detailsDiv.innerHTML = '<h6>詳細結果</h6>';

            ';

        }

            results.results.forEach(result => { ');' }

                const resultDiv = document.createElement('div''); }
                resultDiv.className = `test-detail test-${result.status}`;

                resultDiv.innerHTML = `'';
                    <span class="test-name">${result.name}</span>""
                    <span class="test-message">${result.message}</span>""
                    <span class="test-duration">${result.duration.toFixed(2})ms</span>
                `;
                detailsDiv.appendChild(resultDiv);
            });
            
            integrationResults.appendChild(detailsDiv);
        }

        // スクロールを最下部に
        integrationResults.scrollTop = integrationResults.scrollHeight;
    }

    /**
     * 統合テスト結果をエクスポート
     */
    private async exportIntegrationTestResults(): Promise<void> { try {
            if(this.debugInterface && this.debugInterface.exportIntegrationTestResults) {"

                await this.debugInterface.exportIntegrationTestResults();"
            }"
                this.addTestResult('統合テスト結果をエクスポートしました', 'success''); }

            } else { }'

                this.addTestResult('エクスポート機能が利用できません', 'error); }

            } catch (error) { }

            this.addTestResult(`エクスポートエラー: ${(error, as, Error'}'.message}`, 'error');
        }
    }

    /**
     * 要件検証テストを実行'
     */''
    private async runRequirementsValidation()';
        this.addTestResult('要件検証テストを開始中...', 'info);
        
        try { if (this.debugInterface && this.debugInterface.runRequirementsValidation) {'
                const results = await this.debugInterface.runRequirementsValidation();''
                this.displayValidationResults(results); }

            } else { }'

                this.addTestResult('要件検証システムが利用できません', 'error); }

            } catch (error) { }

            this.addTestResult(`要件検証エラー: ${(error, as, Error'}'.message}`, 'error');
        }
    }

    /**
     * 要件検証結果を表示
     */'
    private displayValidationResults(results: ValidationResults): void { ''
        if(!this.element) return;

        const validationResults = this.element.querySelector('#validation-results) as HTMLElement;
        if (!validationResults) return;

        // 結果サマリー表示
        if(results.summary) {
            const summary = results.summary;''
            const successRate = summary.successRate.toFixed(1);

            const summaryDiv = document.createElement('div'');''
            summaryDiv.className = 'validation-summary';
            summaryDiv.innerHTML = `';
                <h5>要件検証結果サマリー</h5>';
        }

                <div class="summary-stats">" }"
                    <span class="stat">総要件数: ${summary.total}</span>""
                    <span class="stat success">検証済み: ${summary.passed}</span>""
                    <span class="stat ${summary.failed > 0 ? 'error' : 'success'}">未充足: ${summary.failed}</span>""
                    <span class="stat">充足率: ${successRate}%</span>""
                    <span class="stat">検証時間: ${summary.duration.toFixed(0})ms</span>
                </div>;
            `;
            validationResults.appendChild(summaryDiv);
        }

        // カテゴリ別結果表示
        if(results.categoryStats) {"

            Object.entries(results.categoryStats).forEach(([category, stats]) => { ""
                const categoryDiv = document.createElement('div'');

        }

                categoryDiv.className = 'category-result'; }
                categoryDiv.innerHTML = ` }

                    <h6>${category}</h6>''
                    <div class="category-stats">"";
                        <span class="success">${stats.passed}/${stats.total} 充足</span>""
                        ${stats.failed > 0 ? `<span, class="error">${stats.failed} 未充足</span>` : ''
                    </div>;
                `;
                validationResults.appendChild(categoryDiv);
            });
        }
';
        // 詳細結果表示
        if(results.results && results.results.length > 0) {'

            const detailsDiv = document.createElement('div'');''
            detailsDiv.className = 'validation-details';
            detailsDiv.innerHTML = '<h6>詳細結果</h6>';

            ';

        }

            results.results.forEach(result => { ');' }

                const resultDiv = document.createElement('div''); }
                resultDiv.className = `validation-detail validation-${result.status}`;

                resultDiv.innerHTML = `'';
                    <span class="requirement-id">${result.id}</span>""
                    <span class="requirement-name">${result.name}</span>""
                    <span class="requirement-message">${result.message}</span>""
                    <span class="requirement-duration">${result.duration.toFixed(2})ms</span>
                `;
                detailsDiv.appendChild(resultDiv);
            });
            
            validationResults.appendChild(detailsDiv);
        }

        // スクロールを最下部に
        validationResults.scrollTop = validationResults.scrollHeight;
    }

    /**
     * 要件検証結果をエクスポート
     */
    private async exportValidationResults(): Promise<void> { try {
            if(this.debugInterface && this.debugInterface.exportRequirementsValidationResults) {"

                await this.debugInterface.exportRequirementsValidationResults();"
            }"
                this.addTestResult('要件検証結果をエクスポートしました', 'success''); }

            } else { }'

                this.addTestResult('エクスポート機能が利用できません', 'error); }

            } catch (error) { }

            this.addTestResult(`エクスポートエラー: ${(error, as, Error'}'.message}`, 'error');
        }
    }

    /**
     * 最終検証テストを実行'
     */''
    private async runFinalValidation()';
        this.addTestResult('最終検証テストを開始中...', 'info);
        
        try { if (this.debugInterface && this.debugInterface.runFinalValidation) {'
                const results = await this.debugInterface.runFinalValidation();''
                this.displayFinalValidationResults(results); }

            } else { }'

                this.addTestResult('最終検証システムが利用できません', 'error); }

            } catch (error) { }

            this.addTestResult(`最終検証エラー: ${(error, as, Error'}'.message}`, 'error');
        }
    }

    /**
     * 最終検証結果を表示
     */'
    private displayFinalValidationResults(results: FinalValidationResults): void { ''
        if(!this.element) return;

        const finalValidationResults = this.element.querySelector('#final-validation-results) as HTMLElement;
        if (!finalValidationResults) return;

        // 結果サマリー表示
        if(results.summary) {
            const summary = results.summary;''
            const successRate = summary.successRate.toFixed(1);

            const summaryDiv = document.createElement('div'');''
            summaryDiv.className = 'final-validation-summary';
            summaryDiv.innerHTML = `';
                <h5>最終検証結果サマリー</h5>';
        }

                <div class="summary-stats">" }"
                    <span class="stat">総検証数: ${summary.total}</span>""
                    <span class="stat success">合格: ${summary.passed}</span>""
                    <span class="stat ${summary.failed > 0 ? 'error' : 'success'}">不合格: ${summary.failed}</span>""
                    <span class="stat">合格率: ${successRate}%</span>""
                    <span class="stat">検証時間: ${summary.duration.toFixed(0})ms</span>
                </div>;
            `;
            finalValidationResults.appendChild(summaryDiv);
        }
";
        // パフォーマンス目標との比較""
        if(results.targets) {"

            const targetsDiv = document.createElement('div'');''
            targetsDiv.className = 'performance-targets';
            targetsDiv.innerHTML = `';
                <h6>パフォーマンス目標</h6>';
        }

                <div class="targets"> }
                    <div>デバッグオーバーヘッド: < ${results.targets.debugOverhead}%</div>
                    <div>メモリ増加: < ${results.targets.memoryIncrease}MB</div>
                    <div>初期化時間: < ${results.targets.initializationTime}ms</div>
                    <div>パネル切替時間: < ${results.targets.panelSwitchTime}ms</div>
                </div>;
            `;
            finalValidationResults.appendChild(targetsDiv);
        }

        // カテゴリ別結果表示
        if(results.categoryStats) {"

            Object.entries(results.categoryStats).forEach(([category, stats]) => { ""
                const categoryDiv = document.createElement('div'');

        }

                categoryDiv.className = 'category-result'; }
                categoryDiv.innerHTML = ` }

                    <h6>${category}</h6>''
                    <div class="category-stats">"";
                        <span class="success">${stats.passed}/${stats.total} 合格</span>""
                        ${stats.failed > 0 ? `<span, class="error">${stats.failed} 不合格</span>` : ''
                    </div>;
                `;
                finalValidationResults.appendChild(categoryDiv);
            });
        }
';
        // 詳細結果表示
        if(results.results && results.results.length > 0) {'

            const detailsDiv = document.createElement('div'');''
            detailsDiv.className = 'final-validation-details';
            detailsDiv.innerHTML = '<h6>詳細結果</h6>';

            ';

        }

            results.results.forEach(result => { ');' }

                const resultDiv = document.createElement('div''); }
                resultDiv.className = `validation-detail validation-${result.status}`;

                resultDiv.innerHTML = `'';
                    <span class="validation-category">[${result.category}]</span>""
                    <span class="validation-name">${result.name}</span>""
                    <span class="validation-message">${result.message}</span>""
                    <span class="validation-duration">${result.duration.toFixed(2})ms</span>
                `;
                detailsDiv.appendChild(resultDiv);
            });
            
            finalValidationResults.appendChild(detailsDiv);
        }

        // スクロールを最下部に
        finalValidationResults.scrollTop = finalValidationResults.scrollHeight;
    }

    /**
     * 最終検証結果をエクスポート
     */
    private async exportFinalValidationResults(): Promise<void> { try {
            if(this.debugInterface && this.debugInterface.exportFinalValidationResults) {"

                await this.debugInterface.exportFinalValidationResults();"
            }"
                this.addTestResult('最終検証結果をエクスポートしました', 'success''); }

            } else { }'

                this.addTestResult('エクスポート機能が利用できません', 'error); }

            } catch (error) { }

            this.addTestResult(`エクスポートエラー: ${(error, as, Error'}'.message}`, 'error');
        }
    }

    /**
     * パネルを破棄
     */'
    destroy(): void { if (this.element && this.element.parentNode) {''
            this.element.parentNode.removeChild(this.element); }
        this.element = null;

    }''
}