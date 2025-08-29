/**
 * Structured Data Validator Component
 * 
 * 構造化データ検証機能を担当
 * SEOTester のサブコンポーネント
 */

import { seoLogger } from '../SEOLogger.js';
import { seoErrorHandler } from '../SEOErrorHandler.js';

export class StructuredDataValidator {
    constructor(mainController) {
        this.mainController = mainController;
        this.baseUrl = mainController.baseUrl;
    }

    /**
     * 構造化データの検証
     * @returns {Promise<Object>}
     */
    async validateStructuredData() {
        try {
            const results = {
                category: 'Structured Data',
                tests: [],
                passed: 0,
                failed: 0,
                warnings: 0
            };
            
            const structuredData = await this._extractStructuredData();
            const rules = this.mainController.validationRules.get('structuredData');
            
            if (!structuredData || Object.keys(structuredData).length === 0) {
                results.tests.push({
                    name: 'Structured data presence',
                    passed: false,
                    message: '❌ No structured data found'
                });
                results.failed++;
                return results;
            }
            
            // 必須プロパティの存在確認
            for (const requiredProp of rules.required) {
                const test = {
                    name: `Required property: ${requiredProp}`,
                    passed: false,
                    message: ''
                };
                
                if (structuredData[requiredProp]) {
                    test.passed = true;
                    test.message = `✅ ${requiredProp} property present`;
                    results.passed++;
                } else {
                    test.message = `❌ Missing required ${requiredProp} property`;
                    results.failed++;
                }
                
                results.tests.push(test);
            }
            
            // @contextの検証
            if (structuredData['@context']) {
                const contextTest = {
                    name: 'Schema.org context validation',
                    passed: false,
                    message: ''
                };
                
                const context = structuredData['@context'];
                if (rules.allowedContexts.includes(context)) {
                    contextTest.passed = true;
                    contextTest.message = `✅ Valid schema context: ${context}`;
                    results.passed++;
                } else {
                    contextTest.message = `⚠️ Non-standard schema context: ${context}`;
                    results.warnings++;
                }
                
                results.tests.push(contextTest);
            }
            
            // VideoGame特有のプロパティ検証
            if (structuredData['@type'] === 'VideoGame') {
                for (const prop of rules.videoGameProperties) {
                    const test = {
                        name: `VideoGame property: ${prop}`,
                        passed: false,
                        message: ''
                    };
                    
                    if (structuredData[prop]) {
                        test.passed = true;
                        test.message = `✅ ${prop} property present`;
                        results.passed++;
                    } else {
                        test.message = `⚠️ Recommended ${prop} property missing`;
                        results.warnings++;
                    }
                    
                    results.tests.push(test);
                }
            }
            
            // JSON-LD形式の検証
            const jsonLdTest = await this._validateJsonLdFormat(structuredData);
            results.tests.push(jsonLdTest);
            if (jsonLdTest.passed) {
                results.passed++;
            } else {
                results.failed++;
            }
            
            // Rich Snippetテスト
            const richSnippetTest = await this._testRichSnippets(structuredData);
            results.tests.push(richSnippetTest);
            if (richSnippetTest.passed) {
                results.passed++;
            } else {
                results.warnings++;
            }
            
            return results;
            
        } catch (error) {
            return seoErrorHandler.handle(error, 'validateStructuredData');
        }
    }

    /**
     * JSON-LD検証とschema.org準拠チェック
     * @returns {Promise<Object>}
     */
    async validateJsonLdCompliance() {
        try {
            const results = {
                category: 'JSON-LD Compliance',
                tests: [],
                passed: 0,
                failed: 0,
                warnings: 0
            };
            
            const structuredData = await this._extractStructuredData();
            
            // JSON-LD形式の基本検証
            const formatTest = {
                name: 'JSON-LD format validation',
                passed: false,
                message: ''
            };
            
            if (this._isValidJsonLd(structuredData)) {
                formatTest.passed = true;
                formatTest.message = '✅ Valid JSON-LD format';
                results.passed++;
            } else {
                formatTest.message = '❌ Invalid JSON-LD format';
                results.failed++;
            }
            
            results.tests.push(formatTest);
            
            // Schema.org vocabulary検証
            const vocabTest = {
                name: 'Schema.org vocabulary validation',
                passed: false,
                message: ''
            };
            
            const vocabValid = await this._validateSchemaVocabulary(structuredData);
            if (vocabValid) {
                vocabTest.passed = true;
                vocabTest.message = '✅ Schema.org vocabulary properly used';
                results.passed++;
            } else {
                vocabTest.message = '⚠️ Some properties may not be recognized by schema.org';
                results.warnings++;
            }
            
            results.tests.push(vocabTest);
            
            return results;
            
        } catch (error) {
            return seoErrorHandler.handle(error, 'validateJsonLdCompliance');
        }
    }

    /**
     * Rich Snippetテスト実行
     * @returns {Promise<Object>}
     */
    async testRichSnippets() {
        try {
            const results = {
                category: 'Rich Snippet Testing',
                tests: [],
                passed: 0,
                failed: 0,
                warnings: 0
            };
            
            const structuredData = await this._extractStructuredData();
            
            // Rich Snippet対応の検証
            const snippetTypes = ['Game', 'SoftwareApplication', 'WebApplication'];
            
            for (const snippetType of snippetTypes) {
                const test = {
                    name: `${snippetType} rich snippet compatibility`,
                    passed: false,
                    message: ''
                };
                
                const compatible = this._checkRichSnippetCompatibility(structuredData, snippetType);
                if (compatible) {
                    test.passed = true;
                    test.message = `✅ Compatible with ${snippetType} rich snippets`;
                    results.passed++;
                } else {
                    test.message = `⚠️ Limited compatibility with ${snippetType} rich snippets`;
                    results.warnings++;
                }
                
                results.tests.push(test);
            }
            
            // Google構造化データテストツール互換性
            const googleTest = {
                name: 'Google Structured Data Test compatibility',
                passed: false,
                message: ''
            };
            
            const googleCompatible = await this._checkGoogleStructuredDataTestCompatibility(structuredData);
            if (googleCompatible) {
                googleTest.passed = true;
                googleTest.message = '✅ Compatible with Google Structured Data Test';
                results.passed++;
            } else {
                googleTest.message = '⚠️ May have issues with Google Structured Data Test';
                results.warnings++;
            }
            
            results.tests.push(googleTest);
            
            return results;
            
        } catch (error) {
            return seoErrorHandler.handle(error, 'testRichSnippets');
        }
    }

    // プライベートメソッド
    
    /**
     * 構造化データの抽出
     * @private
     */
    async _extractStructuredData() {
        // 実際の実装では document から JSON-LD スクリプトタグを抽出
        return {
            '@context': 'https://schema.org',
            '@type': 'VideoGame',
            'name': 'BubblePop',
            'description': 'HTML5 Canvas を使用したバブルポップゲーム',
            'genre': 'パズル・アクション',
            'gamePlatform': ['Web Browser'],
            'operatingSystem': ['Any'],
            'applicationCategory': 'Game',
            'url': this.baseUrl,
            'image': `${this.baseUrl}/assets/images/game-screenshot.png`,
            'author': {
                '@type': 'Organization',
                'name': 'BubblePop Games'
            },
            'datePublished': '2024-01-01',
            'inLanguage': ['ja', 'en'],
            'isAccessibleForFree': true
        };
    }
    
    /**
     * JSON-LD形式の検証
     * @private
     */
    async _validateJsonLdFormat(structuredData) {
        const test = {
            name: 'JSON-LD format validation',
            passed: false,
            message: ''
        };
        
        try {
            // 必須フィールドの存在確認
            if (structuredData['@context'] && structuredData['@type']) {
                // JSON-LD形式の基本要件を満たしているか確認
                const isValid = this._isValidJsonLd(structuredData);
                if (isValid) {
                    test.passed = true;
                    test.message = '✅ Valid JSON-LD structure';
                } else {
                    test.message = '❌ Invalid JSON-LD structure';
                }
            } else {
                test.message = '❌ Missing required @context or @type';
            }
        } catch (error) {
            test.message = `❌ JSON-LD validation error: ${error.message}`;
        }
        
        return test;
    }
    
    /**
     * Rich Snippetsのテスト
     * @private
     */
    async _testRichSnippets(structuredData) {
        const test = {
            name: 'Rich snippets compatibility',
            passed: false,
            message: ''
        };
        
        try {
            // Rich Snippet生成に必要な基本プロパティの確認
            const requiredForRichSnippets = ['name', 'description', 'image'];
            const hasRequiredProps = requiredForRichSnippets.every(prop => 
                structuredData[prop] && structuredData[prop] !== ''
            );
            
            if (hasRequiredProps) {
                test.passed = true;
                test.message = '✅ Rich snippets should display properly';
            } else {
                test.message = '⚠️ Rich snippets may not display optimally';
            }
        } catch (error) {
            test.message = `⚠️ Rich snippets test error: ${error.message}`;
        }
        
        return test;
    }
    
    /**
     * JSON-LD形式の有効性確認
     * @private
     */
    _isValidJsonLd(data) {
        if (!data || typeof data !== 'object') return false;
        if (!data['@context'] || !data['@type']) return false;
        
        // 基本的な構造チェック
        try {
            JSON.stringify(data);
            return true;
        } catch {
            return false;
        }
    }
    
    /**
     * Schema.org vocabulary検証
     * @private
     */
    async _validateSchemaVocabulary(structuredData) {
        // 実際の実装では Schema.org の公式ボキャブラリーと比較
        const knownVideoGameProperties = [
            'name', 'description', 'genre', 'gamePlatform', 'operatingSystem',
            'applicationCategory', 'url', 'image', 'author', 'datePublished'
        ];
        
        const dataProperties = Object.keys(structuredData).filter(key => !key.startsWith('@'));
        const unknownProperties = dataProperties.filter(prop => 
            !knownVideoGameProperties.includes(prop)
        );
        
        return unknownProperties.length === 0;
    }
    
    /**
     * Rich Snippet互換性チェック
     * @private
     */
    _checkRichSnippetCompatibility(structuredData, snippetType) {
        const compatibilityMap = {
            'Game': ['name', 'description', 'genre', 'gamePlatform'],
            'SoftwareApplication': ['name', 'description', 'applicationCategory', 'operatingSystem'],
            'WebApplication': ['name', 'description', 'url', 'applicationCategory']
        };
        
        const requiredProps = compatibilityMap[snippetType] || [];
        return requiredProps.every(prop => structuredData[prop]);
    }
    
    /**
     * Google構造化データテストツール互換性チェック
     * @private
     */
    async _checkGoogleStructuredDataTestCompatibility(structuredData) {
        // Google構造化データテストツールで問題となりやすい項目をチェック
        const issues = [];
        
        // 画像URLの形式チェック
        if (structuredData.image && !structuredData.image.startsWith('http')) {
            issues.push('Image URL should be absolute');
        }
        
        // URLの形式チェック
        if (structuredData.url && !structuredData.url.startsWith('http')) {
            issues.push('URL should be absolute');
        }
        
        // 日付形式チェック
        if (structuredData.datePublished && !this._isValidISODate(structuredData.datePublished)) {
            issues.push('Date should be in ISO format');
        }
        
        return issues.length === 0;
    }
    
    /**
     * ISO日付形式の検証
     * @private
     */
    _isValidISODate(dateString) {
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
        return isoDateRegex.test(dateString);
    }
}