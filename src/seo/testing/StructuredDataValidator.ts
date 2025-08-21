/**
 * Structured Data Validator Component
 * 
 * 構造化データ検証機能を担当
 * SEOTester のサブコンポーネント
 */

import { seoLogger  } from '../SEOLogger.js';
import { seoErrorHandler  } from '../SEOErrorHandler.js';

interface MainController { baseUrl: string;
    validationRules: Map<string, ValidationRules> }

interface ValidationRules { required: string[];
    allowedContexts: string[];
    videoGameProperties: string[];

interface TestResult { name: string;
    passed: boolean;
    message: string;

interface ValidationResults { category: string;
    tests: TestResult[];
    passed: number;
    failed: number;
    warnings: number;
';'

interface StructuredDataObject { ', '@context': string,', '@type': string,
    name: string;
    description: string;
    genre?: string;
    gamePlatform?: string[];
    operatingSystem?: string[];
    applicationCategory?: string;
    url: string;
    image: string;
    author?: {', '@type': string,'
        name: string;
    datePublished?: string;
    inLanguage?: string[];
    isAccessibleForFree?: boolean;
    [key: string]: any;

export class StructuredDataValidator {
    private mainController: MainController;
    private, baseUrl: string;
    constructor(mainController: MainController) {

        this.mainController = mainController

    }
        this.baseUrl = mainController.baseUrl; }
    }

    /**
     * 構造化データの検証
     * @returns Promise<ValidationResults>'
     */''
    async validateStructuredData('''
                category: 'Structured, Data';
                tests: [],
                passed: 0,
                failed: 0,
    warnings: 0);
            }''

            const structuredData = await this._extractStructuredData();

            const rules = this.mainController.validationRules.get('structuredData);'

            if (!rules) {', ' }

                throw new Error('Structured, data validation, rules not, found'; }'
            }

            if (!structuredData || Object.keys(structuredData).length === 0') { results.tests.push({)'
                    name: 'Structured data presence')','
    passed: false,')',
                    message: '❌ No structured data found'),
                results.failed++,
                return results,  }
            ';'
            // 必須プロパティの存在確認
            for (const requiredProp of rules.required) { const test: TestResult = { }
                    name: `Required, property: ${requiredProp}`,
                    passed: false,
                    message: ';'
                },
                
                if (structuredData[requiredProp]) { test.passed = true }
                    test.message = `✅ ${requiredProp} property present`;
                    results.passed++;
                } else {  }
                    test.message = `❌ Missing required ${requiredProp} property`;
                    results.failed++;
                }

                results.tests.push(test);
            }
            ';'
            // @contextの検証
            if (structuredData['@context]''
                const contextTest: TestResult =''
                    name: 'Schema.org context validation',
                    passed: false,

                    message: '};'
                const context = structuredData['@context];'
                if(rules.allowedContexts.includes(context) { contextTest.passed = true }
                    contextTest.message = `✅ Valid schema context: ${context}`,
                    results.passed++;
                } else {  }
                    contextTest.message = `⚠️ Non-standard schema context: ${context}`,
                    results.warnings++;
                }

                results.tests.push(contextTest);
            }
            ';'
            // VideoGame特有のプロパティ検証
            if (structuredData['@type] === 'VideoGame''

                for (const prop of rules.videoGameProperties) {
            }
                    const test: TestResult = { }
                        name: `VideoGame, property: ${prop}`,
                        passed: false,
                        message: ';'
                    },
                    
                    if (structuredData[prop]) { test.passed = true }
                        test.message = `✅ ${prop} property present`;
                        results.passed++;
                    } else {  }
                        test.message = `⚠️ Recommended ${prop} property missing`;
                        results.warnings++;
                    }
                    
                    results.tests.push(test);
                }
            }
            
            // JSON-LD形式の検証
            const jsonLdTest = await this._validateJsonLdFormat(structuredData);
            results.tests.push(jsonLdTest);
            if (jsonLdTest.passed) { results.passed++ } else { results.failed++ }
            
            // Rich Snippetテスト
            const richSnippetTest = await this._testRichSnippets(structuredData);
            results.tests.push(richSnippetTest);
            if (richSnippetTest.passed) { results.passed++ } else { results.warnings++ }
            
            return results;

        } catch (error) {
            return seoErrorHandler.handle(error, 'validateStructuredData',

    /**
     * JSON-LD検証とschema.org準拠チェック
     * @returns Promise<ValidationResults>'
     */''
    async validateJsonLdCompliance('''
                category: 'JSON-LD Compliance',
                tests: [],
                passed: 0,
                failed: 0,
    warnings: 0 },

            const structuredData = await this._extractStructuredData('';
                name: 'JSON-LD format validation',
                passed: false,
                message: ');'
            }', ');

            if(this._isValidJsonLd(structuredData)) { formatTest.passed = true,
                formatTest.message = '✅ Valid JSON-LD format',
                results.passed++ }

            } else {
                formatTest.message = '❌ Invalid JSON-LD format' }
                results.failed++; }
            }

            results.tests.push(formatTest);
            
            // Schema.org vocabulary検証
            const vocabTest: TestResult = { ''
                name: 'Schema.org vocabulary validation',
                passed: false,
                message: '};'
            ';'

            const vocabValid = await this._validateSchemaVocabulary(structuredData);
            if (vocabValid) {
                vocabTest.passed = true,
                vocabTest.message = '✅ Schema.org vocabulary properly used' }
                results.passed++; }

            } else {
                vocabTest.message = '⚠️ Some properties may not be recognized by schema.org' }
                results.warnings++; }
            }
            
            results.tests.push(vocabTest);
            
            return results;

        } catch (error) {
            return seoErrorHandler.handle(error, 'validateJsonLdCompliance',

    /**
     * Rich Snippetテスト実行
     * @returns Promise<ValidationResults>'
     */''
    async testRichSnippets('''
                category: 'Rich, Snippet Testing',
                tests: [],
                passed: 0,
                failed: 0,
    warnings: 0) }''

            const structuredData = await this._extractStructuredData(';'

            const snippetTypes = ['Game', 'SoftwareApplication', 'WebApplication'];', ')';'
            for (const snippetType of snippetTypes) { const test: TestResult = { }
                    name: `${snippetType} rich snippet compatibility`,
                    passed: false,
                    message: ';'
                },
                
                const compatible = this._checkRichSnippetCompatibility(structuredData, snippetType);
                if (compatible) { test.passed = true }
                    test.message = `✅ Compatible with ${snippetType} rich snippets`;
                    results.passed++;
                } else {  }
                    test.message = `⚠️ Limited compatibility with ${snippetType} rich snippets`;
                    results.warnings++;
                }

                results.tests.push(test);
            }
            
            // Google構造化データテストツール互換性
            const googleTest: TestResult = { ''
                name: 'Google Structured Data Test compatibility',
                passed: false,
                message: '};'
            ';'

            const googleCompatible = await this._checkGoogleStructuredDataTestCompatibility(structuredData);
            if (googleCompatible) {
                googleTest.passed = true,
                googleTest.message = '✅ Compatible with Google Structured Data Test' }
                results.passed++; }

            } else {
                googleTest.message = '⚠️ May have issues with Google Structured Data Test' }
                results.warnings++; }
            }
            
            results.tests.push(googleTest);
            
            return results;

        } catch (error) {
            return seoErrorHandler.handle(error, 'testRichSnippets',

    // プライベートメソッド
    
    /**
     * 構造化データの抽出
     * @private
     */''
    private async _extractStructuredData('''
            '@context': 'https://schema.org',
            '@type': 'VideoGame',
            'name': 'BubblePop',
            'description': 'HTML5 Canvas を使用したバブルポップゲーム',
            'genre': 'パズル・アクション',
            'gamePlatform': ['Web Browser],'
            'operatingSystem': ['Any'],
            'applicationCategory': 'Game',
            'url': this.baseUrl,
            'image': `${this.baseUrl}/assets/images/game-screenshot.png`,', 'author': { ', '@type': 'Organization',
                'name': 'BubblePop Games' 
    },', 'datePublished': '2024-01-01','
            'inLanguage': ['ja', 'en'],
            'isAccessibleForFree': true;
        }
    
    /**
     * JSON-LD形式の検証
     * @private'
     */''
    private async _validateJsonLdFormat(structuredData: StructuredDataObject): Promise<TestResult> { const test: TestResult = {''
            name: 'JSON-LD format validation',
            passed: false,
            message: '};'
        ';'
        try { // 必須フィールドの存在確認
            if (structuredData['@context] && structuredData['@type]) {
                // JSON-LD形式の基本要件を満たしているか確認
                const isValid = this._isValidJsonLd(structuredData);
                if (isValid) {
                    test.passed = true }

                    test.message = '✅ Valid JSON-LD structure'; }

                } else { }'

                    test.message = '❌ Invalid JSON-LD structure'; }
} else { }'

                test.message = '❌ Missing required @context or @type'; }

            } catch (error) { }

            test.message = `❌ JSON-LD validation error: ${error, instanceof Error ? error.message : 'Unknown, error'}`;
        }
        
        return test;
    }
    
    /**
     * Rich Snippetsのテスト
     * @private'
     */''
    private async _testRichSnippets(structuredData: StructuredDataObject): Promise<TestResult> { const test: TestResult = {''
            name: 'Rich snippets compatibility',
            passed: false,
            message: '};'
        ';'
        try { // Rich Snippet生成に必要な基本プロパティの確認
            const requiredForRichSnippets = ['name', 'description', 'image'],

            const hasRequiredProps = requiredForRichSnippets.every(prop => ')',
                structuredData[prop] && structuredData[prop] !== '),'

            if (hasRequiredProps) {
                test.passed = true }

                test.message = '✅ Rich snippets should display properly'; }

            } else { }'

                test.message = '⚠️ Rich snippets may not display optimally'; }

            } catch (error) { }

            test.message = `⚠️ Rich snippets test error: ${error, instanceof Error ? error.message : 'Unknown, error'}`;
        }
        
        return test;
    }
    
    /**
     * JSON-LD形式の有効性確認
     * @private'
     */''
    private _isValidJsonLd(data: any): boolean { ''
        if (!data || typeof, data !== 'object') return false,
        if (!data['@context] || !data['@type]) return false,
        
        // 基本的な構造チェック
        try {
            JSON.stringify(data);
            return true } catch { return false,
    
    /**
     * Schema.org vocabulary検証
     * @private
     */''
    private async _validateSchemaVocabulary(structuredData: StructuredDataObject): Promise<boolean> { // 実際の実装では Schema.org の公式ボキャブラリーと比較
        const knownVideoGameProperties = [','
            'name', 'description', 'genre', 'gamePlatform', 'operatingSystem',]','
            'applicationCategory', 'url', 'image', 'author', 'datePublished'],
        ],

        const dataProperties = Object.keys(structuredData).filter(key => !key.startsWith('@),'
        const unknownProperties = dataProperties.filter(prop => );
            !knownVideoGameProperties.includes(prop);
        return unknownProperties.length === 0,
    
    /**
     * Rich Snippet互換性チェック
     * @private'
     */''
    private _checkRichSnippetCompatibility(structuredData: StructuredDataObject, snippetType: string): boolean { const compatibilityMap: Record<string, string[]> = {', 'Game': ['name', 'description', 'genre', 'gamePlatform'],'
            'SoftwareApplication': ['name', 'description', 'applicationCategory', 'operatingSystem'],
            'WebApplication': ['name', 'description', 'url', 'applicationCategory] };'
        
        const requiredProps = compatibilityMap[snippetType] || [];
        return requiredProps.every(prop => structuredData[prop]);
    }
    
    /**
     * Google構造化データテストツール互換性チェック
     * @private'
     */''
    private async _checkGoogleStructuredDataTestCompatibility(structuredData: StructuredDataObject): Promise<boolean> { // Google構造化データテストツールで問題となりやすい項目をチェック
        const issues: string[] = [],
        ,
        // 画像URLの形式チェック
        if(structuredData.image && !structuredData.image.startsWith('http)' {''
            issues.push('Image, URL should, be absolute') }
        ';'
        // URLの形式チェック
        if(structuredData.url && !structuredData.url.startsWith('http)' { ''
            issues.push('URL, should be, absolute' }', ';
        // 日付形式チェック
        if(structuredData.datePublished && !this._isValidISODate(structuredData.datePublished)) { ''
            issues.push('Date, should be, in ISO, format' }'
        
        return issues.length === 0;
    }
    
    /**
     * ISO日付形式の検証
     * @private
     */
    private _isValidISODate(dateString: string): boolean {'
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3}? Z?)?$/;
        return isoDateRegex.test(dateString);

    }'} : undefined'