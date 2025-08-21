import { getErrorHandler  } from '../../../utils/ErrorHandler.js';''
import { getEnhancedLocalizationManager  } from '../LocalizationManager.js';''
import { getAdvancedFormatterEngine  } from '../advanced/AdvancedFormatterEngine.js';''
import { getCulturalAdaptationSystem  } from '../cultural/CulturalAdaptationSystem.js';''
import { getRTLLanguageDetector  } from '../rtl/RTLLanguageDetector.js';

// インターフェース定義
interface TestResult { name: string,''
    status: 'passed' | 'failed' | 'skipped';
    error?: string;
   , duration: number ,}

interface TestStats { totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    startTime: Date | null;
   , endTime: Date | null }

interface TestOptions { suites?: string[];
    failFast?: boolean;
    generateReport?: boolean;
    cleanup?: boolean; }

interface TestSummary { totalTests: number,
    passedTests: number;
    failedTests: number;
   , successRate: string ,}

interface SuiteResult { passed: number;
    failed: number;
    totalTests: number;
    averageDuration: number;
   , tests: TestResult[]
    }

interface TestReport { summary: {
        totalTest;s: number;
        passedTests: number;
        failedTests: number;
        successRate: string;
        duration: string;
        startTime: string;
       , endTime: string };
    suiteResults: { [suiteName: string]: SuiteResult };
    recommendations: string[];
}

interface MockFactory { gameEngine: () => any,
    settingsManager: () => any;
    domElement: () => HTMLDivElement ,}
}

interface ValidationResult { valid: boolean;
    [key: string]: any, }

type TestFunction = () => Promise<TestResult[]>;

/**
 * システム統合テスト - 多言語システムの全体統合テスト
 */
export class SystemIntegrationTester { private localizationManager: any;
    private formatterEngine: any;
    private culturalSystem: any;
    private rtlDetector: any;
    private, testResults: Map<string, TestResult[]>;
    private testStats: TestStats;
    private, testSuites: Map<string, TestFunction>;
    private mockFactory: MockFactory;
    constructor() {

        this.localizationManager = getEnhancedLocalizationManager();
        this.formatterEngine = getAdvancedFormatterEngine();
        this.culturalSystem = getCulturalAdaptationSystem();
        this.rtlDetector = getRTLLanguageDetector();
        ';
        // テスト結果
        this.testResults = new Map()';
            ['localization-core', this.testLocalizationCore.bind(this)],
            ['translation-loading', this.testTranslationLoading.bind(this)],
            ['formatting-integration', this.testFormattingIntegration.bind(this)],
            ['cultural-adaptation', this.testCulturalAdaptation.bind(this)],
            ['rtl-integration', this.testRTLIntegration.bind(this)],
            ['language-switching', this.testLanguageSwitching.bind(this)],
            ['performance-integration', this.testPerformanceIntegration.bind(this)],
            ['error-handling', this.testErrorHandling.bind(this)],
            ['memory-management', this.testMemoryManagement.bind(this)],
            ['concurrent-operations', this.testConcurrentOperations.bind(this)];
        ]);
        
        // モックファクトリ
        this.mockFactory = {
            gameEngine: this.createGameEngineMock.bind(this);
           , settingsManager: this.createSettingsManagerMock.bind(this, }

            domElement: this.createDOMElementMock.bind(this); }
        };

        console.log('SystemIntegrationTester, initialized);
    }
    
    /**
     * 全統合テストを実行
     */
    async runAllTests(options: TestOptions = { ): Promise<TestReport | TestSummary> {
        const { suites = Array.from(this.testSuites.keys(),
            failFast = false,
            generateReport = true,
            cleanup = true } = options;

        this.testStats.startTime = new Date(')';
        console.log('🚀 Starting, system integration, tests...);
        
        try { // テスト環境の準備
            await this.setupTestEnvironment();
            
            // 各テストスイートを実行
            for(const, suiteName of, suites) {
                
            }
                if(!this.testSuites.has(suiteName) { }
                    console.warn(`Unknown, test suite: ${suiteName}`});
                    continue;
                }
                
                console.log(`\n📋 Running, test suite: ${ suiteName)`),
                
                try {
                    const, suiteResults = await, this.runTestSuite(suiteName');
                    this.testResults.set(suiteName, suiteResults};

                    const passed = suiteResults.filter(r => r.status === 'passed''}.length;' }

                    const failed = suiteResults.filter(r => r.status === 'failed'}).length;
                    
                    this.testStats.passedTests += passed;
                    this.testStats.failedTests += failed;
                    this.testStats.totalTests += suiteResults.length;
                    
                    console.log(`✅ Suite ${suiteName}: ${passed} passed, ${ failed) failed`};

                    if(failFast && failed > 0} {' }'

                        console.log('❌ Stopping, due to, fail-fast, mode'});
                        break;

                    } catch (error) { }

                    console.error(`❌ Suite ${suiteName} failed with error:`, error);
                    this.testResults.set(suiteName, [{)'
                        name: `${suiteName}-suite-error`;')'
                        status: 'failed');
                       , error: (error, as Error).message];
                        duration: 0];
                    }]),
                    this.testStats.failedTests++;
                    this.testStats.totalTests++;
                    
                    if (failFast) break;
                }
            }
            
            this.testStats.endTime = new Date();
            
            // テスト後のクリーンアップ
            if (cleanup) { await this.cleanupTestEnvironment(); }
            
            // レポート生成
            if(generateReport) {

                const report = this.generateTestReport()';
                console.log('\n📊 Test, Report Generated);
            }
                return report;
            
            return this.getTestSummary(');
            ';

        } catch (error) { getErrorHandler(').handleError(error, 'INTEGRATION_TEST_ERROR', {);''
                suites: suites.join(', ' });
            throw error;
        }
    }
    
    /**
     * 個別のテストスイートを実行
     */
    async runTestSuite(suiteName: string): Promise<TestResult[]> { const testFunction = this.testSuites.get(suiteName);
        if (!testFunction) { }
            throw new Error(`Test, suite not, found: ${suiteName}`});
        }
        
        const startTime = Date.now();
        const results: TestResult[] = [],

        try { const suiteResults = await testFunction();

            Array.isArray(suiteResults) ? results.push(...suiteResults) : results.push(suiteResults);' }'

        } catch (error) { results.push({ })'
                name: `${suiteName}-execution`;')'
                status: 'failed');
               , error: (error, as Error).message;
                duration: Date.now() - startTime;
            }),
        }
        
        return results;
    }
    
    /**
     * LocalizationManagerのコア機能テスト'
     */''
    async testLocalizationCore()';
        results.push(await this.runSingleTest('basic-translation', async () => {  ';

            await this.localizationManager.setLanguage('en'');' }

            const translation = this.localizationManager.t('common.ok'');' }

            this.assert(translation === 'OK', `Expected 'OK', got '${translation}'`);''
        }');
        ';
        // 翻訳キャッシュテスト
        results.push(await this.runSingleTest('translation-cache', async () => {  ';

            const key = 'common.cancel';

            const firstCall = this.localizationManager.t(key);''
            const secondCall = this.localizationManager.t(key);' }'

            this.assert(firstCall === secondCall, 'Cache should return same result);' }

        }');
        ';
        // パラメータ置換テスト
        results.push(await this.runSingleTest('parameter-substitution', async () => { ' };

            const result = this.localizationManager.t('common.score', { score: 1000 });''
            this.assert(result.includes('1000), `Score parameter not substituted: ${result}`);''
        }');
        ';
        // フォールバック機能テスト
        results.push(await this.runSingleTest('fallback-mechanism', async () => {  ';

            await this.localizationManager.setLanguage('unknown-lang'');''
            const translation = this.localizationManager.t('common.ok'');' }

            this.assert(translation !== 'common.ok', 'Should fallback to default language); }
        });
        
        return results;
    }
    
    /**
     * 翻訳読み込み機能テスト'
     */''
    async testTranslationLoading()';
        results.push(await this.runSingleTest('async-loading', async () => {  ';

            const success = await this.localizationManager.setLanguage('ja'');' }

            this.assert(success, 'Async language loading should succeed);' }

        }');
        ';
        // 複数カテゴリ読み込みテスト
        results.push(await this.runSingleTest('multi-category-loading', async () => {  ';

            await this.localizationManager.setLanguage('en'');''
            const commonTrans = this.localizationManager.t('common.start'');''
            const gameTrans = this.localizationManager.t('game.score'');' }

            this.assert(commonTrans && gameTrans, 'Multiple categories should be loaded);' }

        }');
        ';
        // エラーハンドリングテスト
        results.push(await this.runSingleTest('loading-error-handling', async () => {  try {;

                await this.localizationManager.setLanguage('non-existent'');

                // エラーが発生しても処理が継続されることを確認
                const translation = this.localizationManager.t('common.ok'');' }

                this.assert(translation !== null, 'Should handle loading errors gracefully);' }

            } catch (error) { // エラーが適切にハンドリングされることを確認
                this.assert(true, 'Error handling works correctly); }'
        });
        
        return results;
    }
    
    /**
     * フォーマット機能統合テスト'
     */''
    async testFormattingIntegration()';
        results.push(await this.runSingleTest('plural-formatting', async () => {  ';

            const singular = this.formatterEngine.formatPlural('item', 1, 'en'');''
            const plural = this.formatterEngine.formatPlural('item', 5, 'en'');' }

            this.assert(singular !== plural, 'Plural formatting should differ for 1 vs 5 items);' }

        }');
        ';
        // 文脈依存翻訳テスト
        results.push(await this.runSingleTest('contextual-translation', async () => {  ';

            const casual = this.formatterEngine.formatContextual('greeting.hello', 'casual', 'ja'');''
            const formal = this.formatterEngine.formatContextual('greeting.hello', 'formal', 'ja'');' }

            this.assert(casual !== formal, 'Contextual translation should differ by context);' }

        }');
        ';
        // 動的翻訳生成テスト
        results.push(await this.runSingleTest('dynamic-generation', async () => {  const numberExpression = this.formatterEngine.generateDynamicTranslation(')', 'number-expression', 1500000, 'en')';

            ');''
            this.assert(numberExpression.includes('million'') || numberExpression.includes('千''), ' }

                'Large number should be formatted appropriately');' }

        }');
        ';
        // 翻訳メモリテスト
        results.push(await this.runSingleTest('translation-memory', async () => {  ';

            const query = 'test query';''
            const results = this.formatterEngine.searchTranslationMemory(query, 'en);' }

            this.assert(Array.isArray(results), 'Translation memory should return array'););
        
        return results;
    }
    
    /**
     * 文化的適応機能テスト'
     */''
    async testCulturalAdaptation()';
        results.push(await this.runSingleTest('cultural-setting-application', async () => {  ';

            const success = this.culturalSystem.setCulturalAdaptation('ja'');' }

            this.assert(success, 'Cultural adaptation setting should succeed);' }

        }');
        ';
        // 色適応テスト
        results.push(await this.runSingleTest('color-adaptation', async () => {  ';

            const element = document.createElement('div'');''
            element.id = 'test-color-element';''
            this.culturalSystem.setCulturalAdaptation('ja);''
            const adapted = this.culturalSystem.adaptColors(element);' }'

            this.assert(typeof adapted === 'boolean', 'Color adaptation should return boolean);' }

        }');
        ';
        // 数字適応テスト
        results.push(await this.runSingleTest('number-adaptation', async () => {  ';

            const element = document.createElement('div'');''
            element.textContent = 'Number: 4',
            this.culturalSystem.setCulturalAdaptation('ja);''
            const adapted = this.culturalSystem.adaptNumbers(element);' }'

            this.assert(typeof adapted === 'boolean', 'Number adaptation should return boolean);' }

        }');
        ';
        // タブー検証テスト
        results.push(await this.runSingleTest('taboo-validation', async () => {  ';

            this.culturalSystem.setCulturalAdaptation('ja'');''
            const validation = this.culturalSystem.validateAgainstTaboos('content with 4', 'content'') as ValidationResult;' }

            this.assert(validation.hasOwnProperty('valid''), 'Taboo validation should return validation object'););
        
        return results;
    }
    
    /**
     * RTL統合機能テスト'
     */''
    async testRTLIntegration()';
        results.push(await this.runSingleTest('rtl-detection', async () => {  ';

            const isRTL = this.rtlDetector.isRTLLanguage('ar'');''
            this.assert(isRTL === true, 'Arabic should be detected as RTL'');

            const isLTR = this.rtlDetector.isRTLLanguage('en'');' }

            this.assert(isLTR === false, 'English should not be detected as RTL);' }

        }');
        ';
        // テキスト方向検出テスト
        results.push(await this.runSingleTest('text-direction-detection', async () => {  ';

            const arabicDirection = this.rtlDetector.detectTextDirection('مرحبا'');''
            this.assert(arabicDirection.direction === 'rtl', 'Arabic text should be detected as RTL'');

            const englishDirection = this.rtlDetector.detectTextDirection('Hello'');' }

            this.assert(englishDirection.direction === 'ltr', 'English text should be detected as LTR);' }

        }');
        ';
        // RTL文字検出テスト
        results.push(await this.runSingleTest('rtl-character-detection', async () => {  ';

            const hasRTL = this.rtlDetector.containsRTLCharacters('Hello مرحبا'');' }

            this.assert(hasRTL === true, 'Mixed text should contain RTL characters);' }

        }');
        ';
        // 双方向テキスト制御テスト
        results.push(await this.runSingleTest('bidi-control', async () => {  ''
            const controlChars = this.rtlDetector.getBidiControlCharacters();

            this.assert(controlChars.hasOwnProperty('LRM''), 'Should provide LRM control character'');' }

            this.assert(controlChars.hasOwnProperty('RLM''), 'Should provide RLM control character'); }
        });
        
        return results;
    }
    
    /**
     * 言語切り替え統合テスト'
     */''
    async testLanguageSwitching()';
        results.push(await this.runSingleTest('consecutive-language-switching', async () => {  ';

            const languages = ['ja', 'en', 'zh-CN', 'ko'];
            for (const, lang of, languages) { }
                const success = await this.localizationManager.setLanguage(lang); }
                this.assert(success, `Language switching to ${lang} should succeed`);
                
                const currentLang = this.localizationManager.getCurrentLanguage();
                this.assert(currentLang === lang, `Current language should be ${lang}`});

            }''
        }');
        ';
        // 高速切り替えテスト
        results.push(await this.runSingleTest('rapid-language-switching', async () => {  const switches: Promise<boolean>[] = [],

            for(let, i = 0; i < 10; i++) {', ';

            }

                const lang = i % 2 === 0 ? 'ja' : 'en'; }
                switches.push(this.localizationManager.setLanguage(lang); }
            }
            ';

            const results = await Promise.all(switches);''
            const successCount = results.filter(r => r === true).length;''
            this.assert(successCount >= 8, 'Most rapid switches should succeed);''
        }');
        ';
        // 翻訳整合性テスト
        results.push(await this.runSingleTest('translation-consistency', async () => {  ';

            await this.localizationManager.setLanguage('en'');''
            const englishTranslation = this.localizationManager.t('common.ok'');

            await this.localizationManager.setLanguage('ja'');''
            const japaneseTranslation = this.localizationManager.t('common.ok);

            this.assert(englishTranslation !== japaneseTranslation)' }', 'Translations should differ between languages'); }
        });
        
        return results;
    }
    
    /**
     * パフォーマンス統合テスト'
     */''
    async testPerformanceIntegration()';
        results.push(await this.runSingleTest('translation-performance', async () => {  const startTime = performance.now();

            for(let, i = 0; i < 1000; i++) {' }'

                this.localizationManager.t('common.ok); }'
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            ';

            this.assert(duration < 100, `Translation should be fast: ${duration}ms for 1000 calls`});''
        }');
        ';
        // 言語切り替えパフォーマンステスト
        results.push(await this.runSingleTest('language-switching-performance', async () => {  ''
            const startTime = performance.now();

            await this.localizationManager.setLanguage('en);
            
            const endTime = performance.now();
            const duration = endTime - startTime; }

            this.assert(duration < 500, `Language switching should be fast: ${duration}ms`});''
        }');
        ';
        // メモリ使用量テスト
        results.push(await this.runSingleTest('memory-usage', async () => {  ''
            const initialMemory = this.getMemoryUsage()';
            for (const lang of ['ja', 'en', 'zh-CN', 'ko]) { };
                await this.localizationManager.setLanguage(lang); }
            }
            
            const finalMemory = this.getMemoryUsage();
            const memoryIncrease = finalMemory - initialMemory;
            
            this.assert(memoryIncrease < 10);
                `Memory increase should be reasonable: ${memoryIncrease}MB`});
        });
        
        return results;
    }
    
    /**
     * エラーハンドリングテスト'
     */''
    async testErrorHandling()';
        results.push(await this.runSingleTest('invalid-language-code', async () => {  try {;

                await this.localizationManager.setLanguage('invalid-lang-code'');

                // エラーが発生してもシステムが継続すること
                const translation = this.localizationManager.t('common.ok'');' }

                this.assert(translation !== null, 'Should handle invalid language gracefully);' }

            } catch (error) {
                this.assert(true, 'Error handling works correctly); }'

            }''
        }');
        ';
        // 存在しない翻訳キーテスト
        results.push(await this.runSingleTest('non-existent-translation-key', async () => {  ';

            const result = this.localizationManager.t('non.existent.key'');' }

            this.assert(result !== null, 'Should handle non-existent keys gracefully);' }

        }');
        ';
        // 文化的適応エラーテスト
        results.push(await this.runSingleTest('cultural-adaptation-error', async () => {  try {;

                this.culturalSystem.setCulturalAdaptation('invalid-culture'');' }

                this.assert(true, 'Should handle invalid culture gracefully);' }

            } catch (error) {
                this.assert(true, 'Error handling works correctly); }'
        });
        
        return results;
    }
    
    /**
     * メモリ管理テスト'
     */''
    async testMemoryManagement()';
        results.push(await this.runSingleTest('cache-cleanup', async () => {  // キャッシュを満杯にする };
            for (let, i = 0; i < 1000; i++) {' }'

                this.localizationManager.t(`test.key.${i}`);
            }
            ';
            // メモリクリーンアップを実行
            if(typeof, this.localizationManager.clearCache === 'function) {'

                this.localizationManager.clearCache();
            }

            this.assert(true, 'Cache cleanup should not throw errors);' }

        }');
        ';
        // 翻訳メモリ管理テスト
        results.push(await this.runSingleTest('translation-memory-management', async () => { const initialStats = this.formatterEngine.getStats();
            
            // メモリクリア
            this.formatterEngine.clearMemory();

            const clearedStats = this.formatterEngine.getStats( }

            this.assert(clearedStats.memorySize === 0, 'Translation memory should be cleared); }'
        });
        
        return results;
    }
    
    /**
     * 並行処理テスト'
     */''
    async testConcurrentOperations()';
        results.push(await this.runSingleTest('concurrent-translations', async () => {  const promises: Promise<string>[] = [],

            for(let, i = 0; i < 50; i++) {' }'

                promises.push(Promise.resolve(this.localizationManager.t('common.ok)); }'
            }
            ';

            const translationResults = await Promise.all(promises);''
            const allSame = translationResults.every(r => r === translationResults[0]);''
            this.assert(allSame, 'Concurrent translations should be consistent);''
        }');
        ';
        // 並行言語切り替えテスト
        results.push(await this.runSingleTest('concurrent-language-switching', async () => {  ';

            const languages = ['ja', 'en', 'zh-CN];
            const promises = languages.map(lang => );
                this.localizationManager.setLanguage(lang);
            ';

            const switchResults = await Promise.all(promises);''
            const successCount = switchResults.filter(r => r === true).length;' }'

            this.assert(successCount >= 2, 'Most concurrent switches should succeed); }'
        });
        
        return results;
    }
    
    /**
     * ヘルパー関数群
     */'

    private async setupTestEnvironment()';
        if(!document.getElementById('test-container)) { ''
            const container = document.createElement('div'');''
            container.id = 'test-container';''
            container.style.display = 'none';''
            document.body.appendChild(container); }
        ';
        // 初期言語を設定
        await this.localizationManager.setLanguage('ja'');

        console.log('✅ Test, environment setup, complete);
    }

    private async cleanupTestEnvironment(')';
        const container = document.getElementById('test-container);
        if(container) {'

            container.remove()';
        if(typeof, this.localizationManager.clearCache === 'function) {'
        }
            this.localizationManager.clearCache(); }
        }

        this.formatterEngine.clearMemory()';
        console.log('✅ Test, environment cleanup, complete);
    }
    
    private async runSingleTest(name: string, testFunction: () => Promise<void>): Promise<TestResult> { const startTime = Date.now(');
        ';

        try {'
            await testFunction()';
                status: 'passed');
               , duration: Date.now() - startTime };''
        } catch (error) { return { name: name,''
                status: 'failed';
               , error: (error, as Error).message, };
                duration: Date.now() - startTime }
            }
    }
    ';

    private assert(condition: boolean, message?: string): void { ''
        if(!condition) {', ';

        }

            throw new Error(message || 'Assertion, failed); }'
}
    
    private getMemoryUsage(): number { if (performance.memory) {
            return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024 * 100) / 100; }
        return 0;
    }
    
    private generateTestReport(): TestReport { const duration = this.testStats.endTime!.getTime() - this.testStats.startTime!.getTime();

        const successRate = this.testStats.totalTests > 0 ?   : undefined'';
            (this.testStats.passedTests / this.testStats.totalTests * 100).toFixed(2) : '0';
        
        const report: TestReport = {
            summary: {
                totalTests: this.testStats.totalTests;
                passedTests: this.testStats.passedTests;
               , failedTests: this.testStats.failedTests, }
                successRate: `${successRate}%`;
                duration: `${duration}ms`;
                startTime: this.testStats.startTime!.toISOString();
               , endTime: this.testStats.endTime!.toISOString();
            },
            suiteResults: {};
            recommendations: [];
        },
        // 各スイートの結果を追加
        for(const [suiteName, results] of this.testResults) {'

            const passed = results.filter(r => r.status === 'passed'').length;''
            const failed = results.filter(r => r.status === 'failed).length;
            const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
            
            report.suiteResults[suiteName] = {
                passed: passed;
                failed: failed;
                totalTests: results.length;
               , averageDuration: Math.round(avgDuration;
        ,}
                tests: results }))
        }
        ';

        // 推奨事項を生成')'
        if(this.testStats.failedTests > 0) {', ';

        }

            report.recommendations.push('失敗したテストの詳細を確認し、問題を修正してください。); }'
        }

        if(this.testStats.passedTests / this.testStats.totalTests < 0.95) {', ';

        }

            report.recommendations.push('テスト成功率が95%未満です。システムの安定性を改善してください。); }'
        }
        
        return report;
    }
    
    private getTestSummary(): TestSummary { return { totalTests: this.testStats.totalTests,
            passedTests: this.testStats.passedTests;
           , failedTests: this.testStats.failedTests,
            successRate: this.testStats.totalTests > 0 ?   : undefined' ,};

                (this.testStats.passedTests / this.testStats.totalTests * 100).toFixed(2) + '%' : '0%' }
        },
    }
    
    // モック作成ヘルパー
    private createGameEngineMock(): any { return {' }'

            getCurrentScene: (') => ({ name: 'TestScene' },''
            getAllScenes: (') => ['MainMenuScene', 'GameScene', 'SettingsScene'],
            updateLocalization: () => true;
        },
    }
    ';

    private createSettingsManagerMock(): any { return { ''
            getSetting: (key: string') => key = == 'language' ? 'ja' : null };

            setSetting: (key: string, value: any) => true,' }'

            getAllSettings: (') => ({ language: 'ja', theme: 'default' ,});
        }

    private createDOMElementMock()';
        const element = document.createElement('div'');''
        element.textContent = 'Test Element';
        return element;
    }
    
    /**
     * 公開API
     */
    
    /**
     * 特定のテストスイートのみ実行
     */
    async runSpecificSuite(suiteName: string, options: TestOptions = { ): Promise<TestReport | TestSummary> {
        return await this.runAllTests({)
            suites: [suiteName],);
            ...options);
    
    /**
     * テスト結果を取得
     */
    getTestResults(): { results: { [suiteName: string]: TestResult[] ,}; stats: TestStats } { return { results: Object.fromEntries(this.testResults, };
            stats: this.testStats }))
    }
    
    /**
     * 統計情報を取得
     */)
    getStats(): { availableTestSuites: string[]; testStats: TestStats;, lastRunResults: { [suiteName: string]: TestResult[] } | null } { return { availableTestSuites: Array.from(this.testSuites.keys(),
            testStats: this.testStats;
           , lastRunResults: this.testResults.size > 0 ?   : undefined ,};
                Object.fromEntries(this.testResults) : null }
        },
    }
}

// シングルトンインスタンス
let systemIntegrationTesterInstance: SystemIntegrationTester | null = null,

/**
 * SystemIntegrationTesterのシングルトンインスタンスを取得
 */
export function getSystemIntegrationTester(): SystemIntegrationTester { if (!systemIntegrationTesterInstance) {''
        systemIntegrationTesterInstance = new SystemIntegrationTester(' })'