/**
 * Syntax Validation Tests
 * 構文検証機能のテストスイート
 */

import { HTMLJavaScriptChecker } from '../../../src/utils/syntax-validation/HTMLJavaScriptChecker.js';
import { JavaScriptModuleValidator } from '../../../src/utils/syntax-validation/JavaScriptModuleValidator.js';

describe('Syntax Validation', () => {
    describe('HTMLJavaScriptChecker', () => {
        let checker;

        beforeEach(() => {
            checker = new HTMLJavaScriptChecker();
        });

        test('should validate HTML with valid JavaScript', () => {
            const validHTML = `
                <html>
                <body>
                    <script>
                        console.log('Hello World');
                        const x = 42;
                    </script>
                </body>
                </html>
            `;

            const result = checker.validateHTML(validHTML);
            
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.scriptBlockCount).toBe(1);
        });

        test('should detect syntax errors in JavaScript blocks', () => {
            const invalidHTML = `
                <html>
                <body>
                    <script>
                        console.log('unclosed string
                        const x = ;
                    </script>
                </body>
                </html>
            `;

            const result = checker.validateHTML(invalidHTML);
            
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors[0].type).toBe('SYNTAX_ERROR');
        });

        test('should detect properly escaped XSS test code', () => {
            const htmlWithEscapedXSS = `
                <html>
                <body>
                    <script>
                        const testData = [
                            { value: '&lt;script&gt;alert("xss")&lt;/script&gt;', desc: 'HTMLタグを含む文字列' }
                        ];
                    </script>
                </body>
                </html>
            `;

            const result = checker.validateHTML(htmlWithEscapedXSS);
            
            expect(result.isValid).toBe(true);
            expect(result.warnings.some(w => w.type === 'ESCAPED_XSS_TEST')).toBe(true);
        });

        test('should warn about potential XSS patterns', () => {
            const htmlWithPotentialXSS = `
                <html>
                <body>
                    <script>
                        const bad = '<script>alert("xss")</script>';
                    </script>
                </body>
                </html>
            `;

            const result = checker.validateHTML(htmlWithPotentialXSS);
            
            expect(result.warnings.some(w => w.type === 'POTENTIAL_XSS')).toBe(true);
        });

        test('should handle empty script blocks', () => {
            const htmlWithEmptyScript = `
                <html>
                <body>
                    <script></script>
                    <script>   </script>
                </body>
                </html>
            `;

            const result = checker.validateHTML(htmlWithEmptyScript);
            
            expect(result.isValid).toBe(true);
            expect(result.warnings.some(w => w.type === 'EMPTY_SCRIPT')).toBe(true);
        });

        test('should skip ES6 module scripts', () => {
            const htmlWithModuleScript = `
                <html>
                <body>
                    <script type="module">
                        import { something } from './module.js';
                    </script>
                </body>
                </html>
            `;

            const result = checker.validateHTML(htmlWithModuleScript);
            
            expect(result.isValid).toBe(true);
            expect(result.warnings.some(w => w.type === 'MODULE_SCRIPT')).toBe(true);
        });

        test('should validate escape sequences', () => {
            const escapeSequences = 'Valid: \\n\\t\\"\\\\  Invalid: \\z\\x\\u';
            const errors = checker.validateEscapeSequences(escapeSequences);
            
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].type).toBe('INVALID_ESCAPE');
        });

        test('should generate proper summary', () => {
            const result = {
                isValid: true,
                errors: [],
                warnings: [{ type: 'TEST_WARNING' }],
                scriptBlockCount: 2
            };

            const summary = checker.generateSummary(result);
            
            expect(summary).toContain('✅ 構文検証: 合格');
            expect(summary).toContain('⚠️  警告: 1件');
            expect(summary).toContain('📄 スクリプトブロック: 2件');
        });
    });

    describe('JavaScriptModuleValidator', () => {
        let validator;

        beforeEach(() => {
            validator = new JavaScriptModuleValidator();
        });

        test('should validate valid ES6 module', async () => {
            const validModule = `
                import { Component } from './Component.js';
                
                export class TestClass extends Component {
                    constructor() {
                        super();
                        this.name = 'test';
                    }
                    
                    getName() {
                        return this.name;
                    }
                }
                
                export default TestClass;
            `;

            const result = await validator.validateModule(validModule);
            
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.statistics.imports).toBe(1);
            expect(result.statistics.exports).toBe(2);
            expect(result.statistics.classes).toBe(1);
        });

        test('should detect unmatched brackets', async () => {
            const moduleWithUnmatchedBrackets = `
                export class TestClass {
                    constructor() {
                        this.items = [1, 2, 3;
                    }
                // 波括弧が閉じていない
            `;

            const result = await validator.validateModule(moduleWithUnmatchedBrackets);
            
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.type === 'UNMATCHED_BRACKET' || e.type === 'UNCLOSED_BRACKET')).toBe(true);
        });

        test('should validate import statements', async () => {
            const moduleWithImports = `
                import { Component } from './Component.js';
                import defaultExport from './default-export.js';
                import * as Utils from 'utils';
            `;

            const result = await validator.validateModule(moduleWithImports);
            
            expect(result.statistics.imports).toBe(3);
        });

        test('should warn about suspicious comparison operators', async () => {
            const moduleWithSuspiciousComparison = `
                export function checkValue(x, y) {
                    if (x ===== y) {  // 疑わしい比較演算子
                        return true;
                    }
                    return false;
                }
            `;

            const result = await validator.validateModule(moduleWithSuspiciousComparison);
            
            // 構文エラーとして検出されるはず
            expect(result.isValid).toBe(false);
        });

        test('should validate class naming conventions', async () => {
            const moduleWithBadNaming = `
                export class badClassName {  // PascalCaseでない
                    constructor() {}
                }
                
                export function BadFunctionName() {  // camelCaseでない
                    return true;
                }
            `;

            const result = await validator.validateModule(moduleWithBadNaming);
            
            expect(result.warnings.some(w => w.type === 'CLASS_NAMING_WARNING')).toBe(true);
            expect(result.warnings.some(w => w.type === 'FUNCTION_NAMING_WARNING')).toBe(true);
        });

        test('should detect incomplete statements', async () => {
            const moduleWithIncompleteStatements = `
                export function testFunction() {
                    if (
                    // 不完全なif文
                }
            `;

            const result = await validator.validateModule(moduleWithIncompleteStatements);
            
            expect(result.isValid).toBe(false);
        });

        test('should collect accurate statistics', async () => {
            const moduleWithVariousElements = `
                import { A, B } from './a.js';
                import C from './c.js';
                
                const variable1 = 'test';
                let variable2 = 42;
                var variable3 = true;
                
                export class ClassA {}
                export class ClassB {}
                
                export function functionA() {}
                export async function functionB() {}
                
                export default ClassA;
            `;

            const result = await validator.validateModule(moduleWithVariousElements);
            
            expect(result.statistics.imports).toBe(2);
            expect(result.statistics.exports).toBe(5);
            expect(result.statistics.classes).toBe(2);
            expect(result.statistics.functions).toBe(2);
            expect(result.statistics.variables).toBe(3);
        });

        test('should generate proper summary', () => {
            const result = {
                isValid: true,
                errors: [],
                warnings: [{ type: 'TEST_WARNING' }],
                statistics: {
                    imports: 2,
                    exports: 3,
                    classes: 1,
                    functions: 2,
                    variables: 4
                }
            };

            const summary = validator.generateSummary(result);
            
            expect(summary).toContain('✅ モジュール検証: 合格');
            expect(summary).toContain('⚠️  警告: 1件');
            expect(summary).toContain('📊 統計: imports(2) exports(3) classes(1) functions(2)');
        });
    });

    describe('Integration Tests', () => {
        test('should validate real test-error-handler.html file', () => {
            // 実際のテストファイルを読み込んで検証
            // 注意: 実際のファイル読み込みはテスト環境で適切に設定する必要があります
            const checker = new HTMLJavaScriptChecker();
            
            // モックデータを使用した統合テスト
            const realHTMLContent = `
                <!DOCTYPE html>
                <html>
                <head><title>Test</title></head>
                <body>
                    <script>
                        const invalidInputs = [
                            { value: 'a'.repeat(100), desc: '長すぎる文字列' },
                            { value: '&lt;script&gt;alert("xss")&lt;/script&gt;', desc: 'HTMLタグを含む文字列' },
                            { value: 123, desc: '数値' }
                        ];
                    </script>
                </body>
                </html>
            `;

            const result = checker.validateHTML(realHTMLContent);
            
            expect(result.isValid).toBe(true);
            expect(result.warnings.some(w => w.type === 'ESCAPED_XSS_TEST')).toBe(true);
        });

        test('should validate LocalizationManager module structure', async () => {
            const validator = new JavaScriptModuleValidator();
            
            // LocalizationManager のような構造のモックテスト
            const localizationManagerMock = `
                import { TranslationDataManager } from './localization-manager/TranslationDataManager.js';
                import { CulturalAdaptationHandler } from './localization-manager/CulturalAdaptationHandler.js';
                import { I18nIntegrationController } from './localization-manager/I18nIntegrationController.js';

                export class LocalizationManager {
                    constructor() {
                        this.currentLanguage = 'ja';
                        this.fallbackLanguage = 'en';
                        
                        this.translationDataManager = new TranslationDataManager();
                        this.culturalAdaptationHandler = new CulturalAdaptationHandler();
                        this.integrationController = new I18nIntegrationController();
                    }
                    
                    async initializeAsync() {
                        // 初期化処理
                    }
                }
            `;

            const result = await validator.validateModule(localizationManagerMock);
            
            expect(result.isValid).toBe(true);
            expect(result.statistics.imports).toBe(3);
            expect(result.statistics.classes).toBe(1);
            expect(result.statistics.functions).toBe(1);
        });
    });
});