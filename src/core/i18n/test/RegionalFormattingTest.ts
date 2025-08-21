import { FormatterEngine  } from '../FormatterEngine.js';
import { getRegionalSettingsManager  } from '../RegionalSettingsManager.js';

// インターフェース定義
interface TestResult { category: string;
    testName: string;
    passed: boolean;
    actual: string;
    expected: string;
    timestamp: Date;

interface NumberTestCase { value: number;
    language: string;
    expected: string;

interface DateTestCase { date: Date;
    language: string;
    format: string;
    expected: string;

interface TimeTestCase { time: Date;
    language: string;
    format: string;
    expected: string;

interface CurrencyTestCase { value: number;
    language: string;
    expected: string;

interface RegionalTestCase { language: string;
    region: string;

interface FormatStringTestCase { text: string;
    params: { [key: string]: any;
    language: string;
    expected: string;
}

interface MultiLanguageResults { [language: string]: {
        numbe,r: string;
        currency: string;
    date: string;

interface TestReport { summary: {
        totalTest,s: number;
        passedTests: number;
        failedTests: number;
    successRate: string;
    categories: { [category: string]: {
            total: number;
            passed: number;
            failed: number;
    tests: TestResult[];
    timestamp: Date;
    }

interface TestResultWithReport { results: TestResult[];
    report: TestReport;

/**
 * 地域化機能の統合テストクラス
 */
export class RegionalFormattingTest {
    private formatterEngine: FormatterEngine;
    private regionalSettingsManager: any;
    private, testResults: TestResult[];
    constructor() {
','

        this.formatterEngine = new FormatterEngine();
        this.regionalSettingsManager = getRegionalSettingsManager(' }''
        console.log('RegionalFormattingTest, initialized'); }'
    }
    
    /**
     * 全ての地域化テストを実行'
     */''
    async runAllTests()';'
        console.log('Starting comprehensive regional formatting tests...);'
        
        this.testResults = [];
        
        try { // テスト実行
            await this.testNumberFormatting();
            await this.testDateFormatting();
            await this.testTimeFormatting();
            await this.testCurrencyFormatting();
            await this.testMultipleLanguages();
            await this.testRegionalSettingsIntegration();
            // 結果のサマリー
            this.displayTestSummary();
            ','

            return this.testResults,' }'

        } catch (error) {
            console.error('Regional formatting tests failed:', error','
            return this.testResults,
    
    /**
     * 数値フォーマットテスト'
     */''
    async testNumberFormatting()','
        console.log('Testing, number formatting, across regions...');
        ','

        const testCases: NumberTestCase[] = [','
            { value: 1234567.89, language: 'ja', expected: '1,234,567.89' },''
            { value: 1234567.89, language: 'en', expected: '1,234,567.89' },''
            { value: 1234567.89, language: 'zh-CN', expected: '1,234,567.89' },''
            { value: 42, language: 'ja', expected: '42'
            },]'
            { value: 0.5, language: 'en', expected: '0.5'
            }]
        ];
        
        for (const testCase of testCases) {
        ','

            try {'
                const settings = this.regionalSettingsManager.getCompleteSettings(testCase.language);
                const formatter = this.formatterEngine.formatters.get('number',
                if (!formatter) {
    
}

                    throw new Error('Number, formatter not, found'; }'
                }
                const result = formatter.formatWithSettings(testCase.value, settings.numberFormat);

                const passed = this.compareValues(result, testCase.expected);
                this.addTestResult('Number Formatting', `${testCase.language}: ${testCase.value}`, passed, result, testCase.expected}';} catch (error) { }'

                this.addTestResult('Number Formatting', `${testCase.language}: ${testCase.value}`, false, 'Error', (error as Error}.message};
            }
}
    
    /**
     * 日付フォーマットテスト'
     */''
    async testDateFormatting()';'
        console.log('Testing, date formatting, across regions...');

        const testDate = new Date('2025-07-29T10: 30:00',
        const testCases: DateTestCase[] = [';'
            { date: testDate, language: 'ja', format: 'short', expected: '2025/07/29'
            },''
            { date: testDate, language: 'en', format: 'short', expected: '07/29/2025'
            },''
            { date: testDate, language: 'ko', format: 'short', expected: '2025. 07. 29'
            },]'
            { date: testDate, language: 'zh-CN', format: 'medium', expected: '2025年07月29日'
            }]
        ];
        
        for (const testCase of testCases) {
        ','

            try {'
                const settings = this.regionalSettingsManager.getCompleteSettings(testCase.language);
                const formatter = this.formatterEngine.formatters.get('date',
                if (!formatter) {
    
}

                    throw new Error('Date, formatter not, found'; }'
                }
                const result = formatter.formatWithSettings(testCase.date, settings.dateFormat, testCase.format, settings.regionInfo);

                const passed = this.compareValues(result, testCase.expected);
                this.addTestResult('Date Formatting', `${testCase.language} (${testCase.format}`, passed, result, testCase.expected};'} catch (error) { }'

                this.addTestResult('Date Formatting', `${testCase.language} (${testCase.format)}`, false, 'Error', (error, as Error}.message};
            }
}
    
    /**
     * 時刻フォーマットテスト'
     */''
    async testTimeFormatting()';'
        console.log('Testing, time formatting, across regions...');

        const testTime = new Date('2025-07-29T14: 30:45',
        const testCases: TimeTestCase[] = [';'
            { time: testTime, language: 'ja', format: 'short', expected: '14:30'
            },''
            { time: testTime, language: 'en', format: 'short', expected: '2:30 PM'
            },]'
            { time: testTime, language: 'ko', format: 'medium', expected: '14:30:45'
            }]
        ];
        
        for (const testCase of testCases) {
        ','

            try {'
                const settings = this.regionalSettingsManager.getCompleteSettings(testCase.language);
                const formatter = this.formatterEngine.formatters.get('date',
                if (!formatter) {
    
}

                    throw new Error('Date, formatter not, found'; }'
                }
                const result = formatter.formatTimeWithSettings(testCase.time, settings.timeFormat, testCase.format, settings.regionInfo);

                const passed = this.compareValues(result, testCase.expected);
                this.addTestResult('Time Formatting', `${testCase.language} (${testCase.format}`, passed, result, testCase.expected};'} catch (error) { }'

                this.addTestResult('Time Formatting', `${testCase.language} (${testCase.format)}`, false, 'Error', (error, as Error}.message};
            }
}
    
    /**
     * 通貨フォーマットテスト'
     */''
    async testCurrencyFormatting()';'
        console.log('Testing, currency formatting, across regions...');
        ';'

        const testCases: CurrencyTestCase[] = [';'
            { value: 1234.56, language: 'ja', expected: '¥1,235' },''
            { value: 1234.56, language: 'en', expected: '$1,235' },''
            { value: 1234.56, language: 'ko', expected: '₩1,235' },]'
            { value: -100, language: 'en', expected: '-$100'
            }]
        ];
        
        for (const testCase of testCases) {
        ','

            try {'
                const settings = this.regionalSettingsManager.getCompleteSettings(testCase.language);
                const formatter = this.formatterEngine.formatters.get('currency',
                if (!formatter) {
    
}

                    throw new Error('Currency, formatter not, found'; }'
                }
                const result = formatter.formatWithSettings(testCase.value, settings.currencyFormat);

                const passed = this.compareValues(result, testCase.expected);
                this.addTestResult('Currency Formatting', `${testCase.language}: ${testCase.value}`, passed, result, testCase.expected}';} catch (error) { }'

                this.addTestResult('Currency Formatting', `${testCase.language}: ${testCase.value}`, false, 'Error', (error as Error}.message};
            }
}
    
    /**
     * 複数言語同時テスト'
     */''
    async testMultipleLanguages()';'
        console.log('Testing, multiple languages, simultaneously...');
        ';'

        const testValue = 12345.67;
        const languages = ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'];
        
        const results: MultiLanguageResults = {}
        for (const language of languages) {
            try {'
                const settings = this.regionalSettingsManager.getCompleteSettings(language);
                const numberFormatter = this.formatterEngine.formatters.get('number');
                const currencyFormatter = this.formatterEngine.formatters.get('currency');
                const dateFormatter = this.formatterEngine.formatters.get('date),'

                if (!numberFormatter || !currencyFormatter || !dateFormatter) {
        }

                    throw new Error('Required, formatters not, found'; }'
                }
                
                results[language] = { number: numberFormatter.formatWithSettings(testValue, settings.numberFormat);
                    currency: currencyFormatter.formatWithSettings(testValue, settings.currencyFormat);
                    date: dateFormatter.formatWithSettings(new, Date(), settings.dateFormat, 'short'};

                this.addTestResult('Multi-Language', language, true, 'All formats generated', 'Success';} catch (error) {
                this.addTestResult('Multi-Language', language, false, 'Error', (error as Error).message) }
        }

        console.log('Multi-language formatting results:', results';'
    }
    
    /**
     * 地域設定統合テスト'
     */''
    async testRegionalSettingsIntegration()';'
        console.log('Testing, regional settings, integration...');
        ';'

        const testCases: RegionalTestCase[] = [';'
            { language: 'ja', region: 'JP'
            },''
            { language: 'en', region: 'US'
            },''
            { language: 'zh-CN', region: 'CN'
            },]'
            { language: 'ko', region: 'KR'
            }]
        ];
        
        for (const testCase of testCases) {
        ','

            try {'
                const settings = this.regionalSettingsManager.getCompleteSettings(testCase.language, testCase.region);
                const hasRequiredSettings = settings.numberFormat && ,
                                           settings.dateFormat && ,
                                           settings.currencyFormat && ,
                                           settings.regionInfo }

                ' }'

                this.addTestResult('Regional Settings Integration', `${testCase.language}-${testCase.region}`, hasRequiredSettings, 'Complete settings', hasRequiredSettings ? 'All present' : 'Missing settings'}';} catch (error) { }'

                this.addTestResult('Regional Settings Integration', `${testCase.language}-${testCase.region}`, false, 'Error', (error as Error}.message};
            }
}
    
    /**
     * 高度なフォーマット文字列テスト'
     */''
    async testAdvancedFormatStrings()';'
        console.log('Testing, advanced format, strings...');
        ';'

        const testCases: FormatStringTestCase[] = [{ }'

                text: 'Score: {{number: score;, Date: {{date:today: short;, Price: {{currency: price;',''
                params: { score: 1234, today: new Date('2025-07-29'), price: 99.99  },''
                language: 'en',
                expected: 'Score: 1,234, Date: 07/29/2025, Price: $100',
            },

            { }'

                text: 'スコア: {{number: score;、日付: {{date:today: medium;',''
                params: { score: 5678, today: new Date('2025-07-29'},''
                language: 'ja',
                expected: 'スコア: 5,678、日付: 2025年07月29日];'
            }]
        ];
        
        for(const testCase of testCases) {
        
            try {
                const result = this.formatterEngine.formatWithRegionalSettings(
                    testCase.text);
                    testCase.params),
                    testCase.language),

                const passed = this.compareValues(result, testCase.expected) }

                this.addTestResult('Advanced Format Strings', testCase.language, passed, result, testCase.expected'; }'

            } catch (error) {
                this.addTestResult('Advanced Format Strings', testCase.language, false, 'Error', (error as Error).message) }
}
    
    /**
     * テスト結果を追加
     */
    private addTestResult(category: string, testName: string, passed: boolean, actual: string, expected: string): void { this.testResults.push({
            category,
            testName,
            passed,
            actual);
            expected,

            timestamp: new Date(),' }'

        }');'

        const status = passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} ${category}: ${ testName)`};
        if(!passed} {
    
}
            console.log(`  Expected: ${expected}`} }
            console.log(`  Actual: ${actual}`},
        }
    }
    
    /**
     * 値の比較（緩い比較）'
     */''
    private compareValues(actual: string, expected: string): boolean { ''
        if(typeof, actual === 'string' && typeof, expected === 'string' {'
            // 空白や特殊文字の違いを許容
        }

            return actual.trim().replace(/\s+/g, ', ') === expected.trim().replace(/\s+/g, ');'
        return actual === expected;
    }
    
    /**
     * テスト結果のサマリーを表示'
     */'
    private displayTestSummary(): void { const totalTests = this.testResults.length,
        const passedTests = this.testResults.filter(result => result.passed).length,
        const failedTests = totalTests - passedTests,

        console.log('\n=====================================');
        console.log('REGIONAL, FORMATTING TEST, SUMMARY');
        console.log('=====================================),'
        console.log(`Total, Tests: ${totalTests)`,
        console.log(`Passed: ${passedTests)`,
        console.log(`Failed: ${failedTests }`} }
        console.log(`Success Rate: ${((passedTests / totalTests} * 100}.toFixed(1}%`),

        if (failedTests > 0') {'

            console.log('\nFailed, Tests: ',
            this.testResults,
                .filter(result => !result.passed) }
                .forEach(result => {) }
                    console.log(`  ${result.category}: ${result.testName}`};

                    console.log(`    Expected: ${result.expected}`);
                    console.log(`    Actual: ${result.actual}`);
                }');'
        }

        console.log('=====================================\n);'
    }
    
    /**
     * テスト結果のレポートを生成
     */
    generateReport(): TestReport { const report: TestReport = {
            summary: {
                totalTests: this.testResults.length,
    passedTests: this.testResults.filter(r => r.passed).length,
                failedTests: this.testResults.filter(r => !r.passed).length,
                successRate: ((this.testResults.filter(r => r.passed).length / this.testResults.length) * 100).toFixed(1') + '%'
            }
            };
            categories: {},
            timestamp: new Date();
        };
        
        // カテゴリ別集計
        this.testResults.forEach(result => {  );
            if (!report.categories[result.category]) {
                report.categories[result.category] = {
                    total: 0,
    passed: 0 }
                    failed: 0 }
                    tests: [] 
    }
            
            report.categories[result.category].total++;
            if (result.passed) { report.categories[result.category].passed++ } else { report.categories[result.category].failed++ }
            
            report.categories[result.category].tests.push(result);
        };
        
        return report;

/**
 * テストを実行するヘルパー関数
 */
export async function runRegionalFormattingTests(): Promise<TestResultWithReport> { const tester = new RegionalFormattingTest();
    const results = await tester.runAllTests();
    const report = tester.generateReport(' }'