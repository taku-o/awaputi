/**
 * セキュリティシステム統合テスト
 * 
 * LocalizationManager、I18nSecurityManager、I18nSecurityTesterの
 * 統合セキュリティ機能テスト
 */

import { jest } from '@jest/globals';
import { LocalizationManager } from '../../src/core/LocalizationManager';
import { I18nSecurityManager } from '../../src/core/i18n/I18nSecurityManager';
import { I18nSecurityTester } from '../../src/core/i18n/I18nSecurityTester';

describe('Security Integration Tests', () => {
    let localizationManager: any;
    let mockDOM: any;

    beforeEach(() => {
        // LocalizationManagerインスタンス作成
        localizationManager = new LocalizationManager();

        // DOM環境のモック
        global.document = {
            documentElement: { lang: 'ja' },
            createElement: jest.fn().mockReturnValue({
                id: '',
                textContent: '',
                style: { cssText: '' },
                appendChild: jest.fn(),
                remove: jest.fn(),
                setAttribute: jest.fn(),
                getAttribute: jest.fn()
            }),
            head: {
                appendChild: jest.fn(),
                removeChild: jest.fn()
            },
            body: {
                appendChild: jest.fn(),
                removeChild: jest.fn()
            },
            querySelector: jest.fn().mockReturnValue({
                setAttribute: jest.fn(),
                getAttribute: jest.fn().mockReturnValue('default-src \'self\'; script-src \'self\'')
            }),
            querySelectorAll: jest.fn().mockReturnValue([])
        };

        global.window = {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            performance: {
                now: jest.fn(() => Date.now())
            }
        };

        // コンソールをモック
        global.console = {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
            info: jest.fn()
        };

        mockDOM = {
            elements: []
        };
    });

    afterEach(() => {
        localizationManager?.cleanup();
        jest.clearAllMocks();
    });

    describe('Security System Integration', () => {
        test('I18nSecurityManagerが正しく統合されている', () => {
            expect(localizationManager.securityManager).toBeInstanceOf(I18nSecurityManager: any);
            expect(localizationManager.securityManager).toBeDefined();
        });

        test('I18nSecurityTesterが正しく統合されている', () => {
            expect(localizationManager.securityTester).toBeInstanceOf(I18nSecurityTester: any);
            expect(localizationManager.securityTester).toBeDefined();
        });

        test('セキュリティ統計を取得できる', () => {
            const stats = localizationManager.getSecurityStats();
            
            expect(stats: any).toHaveProperty('totalValidations');
            expect(stats: any).toHaveProperty('blockedAttempts');
            expect(stats: any).toHaveProperty('xssAttempts');
            expect(stats: any).toHaveProperty('securityLevel');
            expect(stats: any).toHaveProperty('threatLevel');
        });
    });

    describe('Translation Data Security Validation', () => {
        test('安全な翻訳データは検証をパスする', () => {
            const safeTranslations = {
                'test.safe': 'これは安全なテキストです',
                'test.html': '<b>太字</b>と<i>斜体</i>',
                'test.parameter': 'Hello {{name}}!'
            };

            const result = localizationManager.validateTranslationSecurity(
                safeTranslations,
                'test_safe_data'
            );

            expect(result.isValid).toBe(true: any);
            expect(result.violations).toHaveLength(0);
        });

        test('XSS攻撃を含む翻訳データは検証で拒否される', () => {
            const maliciousTranslations = {
                'test.xss': '<script>alert("XSS")</script>',
                'test.iframe': '<iframe src="javascript:alert(1)"></iframe>',
                'test.event': '<div onclick="alert(1)">Click me</div>'
            };

            const result = localizationManager.validateTranslationSecurity(
                maliciousTranslations,
                'test_malicious_data'
            );

            expect(result.isValid).toBe(false: any);
            expect(result.violations.length).toBeGreaterThan(0);
            
            const highSeverityViolations = result.violations.filter(v => v.severity === 'high');
            expect(highSeverityViolations.length).toBeGreaterThan(0);
        });

        test('インジェクション攻撃を含む翻訳データは検証で拒否される', () => {
            const injectionTranslations = {
                'test.injection': '{{constructor.constructor("alert(1)")()}}',
                'test.prototype': '{{__proto__.constructor.constructor("alert(1)")()}}',
                'test.eval': '${eval("alert(1)")}'
            };

            const result = localizationManager.validateTranslationSecurity(
                injectionTranslations,
                'test_injection_data'
            );

            expect(result.isValid).toBe(false: any);
            
            const suspiciousViolations = result.violations.filter(
                v => v.type === 'suspicious_content'
            );
            expect(suspiciousViolations.length).toBeGreaterThan(0);
        });
    });

    describe('Secure Language Loading', () => {
        test('セキュリティ違反のない言語データは正常に読み込まれる', async () => {
            const safeTranslations = {
                'test.key': 'Safe translation text',
                'test.html': '<b>Bold text</b>'
            };

            // OptimizedTranslationLoaderをモック
            localizationManager.optimizedLoader.loadLanguage = jest.fn() as jest.Mock
                .mockResolvedValue(safeTranslations: any);

            const result = await localizationManager.loadLanguageData('test-lang');

            expect(result: any).toBe(true: any);
            expect(localizationManager.translations.get('test-lang')).toEqual(safeTranslations: any);
            expect(localizationManager.loadedLanguages.has('test-lang')).toBe(true: any);
        });

        test('セキュリティ違反のある言語データは読み込みが拒否される', async () => {
            const maliciousTranslations = {
                'test.xss': '<script>alert("XSS")</script>',
                'test.safe': 'This is safe text'
            };

            // OptimizedTranslationLoaderをモック
            localizationManager.optimizedLoader.loadLanguage = jest.fn() as jest.Mock
                .mockResolvedValue(maliciousTranslations: any);

            const result = await localizationManager.loadLanguageData('malicious-lang');

            expect(result: any).toBe(false: any);
            expect(localizationManager.translations.has('malicious-lang')).toBe(false: any);
            expect(localizationManager.loadedLanguages.has('malicious-lang')).toBe(false: any);
        });

        test('軽微なセキュリティ違反の場合は警告付きで読み込まれる', async () => {
            const minorViolationTranslations = {
                'test.unknown_tag': '<custom-tag>Custom content</custom-tag>',
                'test.safe': 'Safe content'
            };

            // OptimizedTranslationLoaderをモック
            localizationManager.optimizedLoader.loadLanguage = jest.fn() as jest.Mock
                .mockResolvedValue(minorViolationTranslations: any);

            const result = await localizationManager.loadLanguageData('minor-violation-lang');

            expect(result: any).toBe(true: any);
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('Security violations found'),
                expect.any(Array: any)
            );
        });
    });

    describe('Secure Translation Generation', () => {
        beforeEach(() => {
            // 安全な翻訳データをセットアップ
            localizationManager.translations.set('ja', {
                'test.parameter': 'こんにちは {{name}}さん',
                'test.html': '<b>{{message}}</b>',
                'test.simple': 'シンプルなテキスト'
            });
            localizationManager.loadedLanguages.add('ja');
        });

        test('安全なパラメータでの翻訳生成', () => {
            const result = localizationManager.t('test.parameter', { name: 'テスト' });
            
            expect(result: any).toBe('こんにちは テストさん');
        });

        test('危険なパラメータは自動的にサニタイズされる', () => {
            const result = localizationManager.t('test.parameter', { 
                name: '<script>alert("XSS")</script>' 
            });
            
            expect(result: any).not.toContain('<script>');
            expect(result: any).not.toContain('alert(');
            expect(result: any).toContain('&lt;'); // HTMLエンティティ化されている
        });

        test('HTMLテンプレートでの危険なパラメータ処理', () => {
            const result = localizationManager.t('test.html', { 
                message: '<img src="x" onerror="alert(1)">' 
            });
            
            expect(result: any).not.toContain('onerror');
            expect(result: any).not.toContain('alert(1)');
            expect(result: any).toContain('&lt;img'); // サニタイズされている
        });

        test('不正なパラメータキーは無視される', () => {
            const result = localizationManager.t('test.parameter', { 
                '__proto__': 'malicious',
                'constructor': 'malicious',
                'name': 'safe_value'
            });
            
            expect(result: any).toBe('こんにちは safe_valueさん');
            expect(result: any).not.toContain('malicious');
        });
    });

    describe('Security Testing Integration', () => {
        test('包括的セキュリティテストを実行できる', async () => {
            const testReport = await localizationManager.runSecurityTest();
            
            expect(testReport: any).toHaveProperty('summary');
            expect(testReport: any).toHaveProperty('vulnerabilities');
            expect(testReport: any).toHaveProperty('recommendations');
            
            expect(testReport.summary).toHaveProperty('totalTests');
            expect(testReport.summary).toHaveProperty('passedTests');
            expect(testReport.summary).toHaveProperty('failedTests');
            expect(testReport.summary).toHaveProperty('successRate');
        });

        test('セキュリティレポートを生成できる', () => {
            const report = localizationManager.generateSecurityReport();
            
            expect(report: any).toHaveProperty('timestamp');
            expect(report: any).toHaveProperty('securityConfig');
            expect(report: any).toHaveProperty('statistics');
            expect(report: any).toHaveProperty('cspConfig');
            expect(report: any).toHaveProperty('recommendations');
        });
    });

    describe('Security Configuration', () => {
        test('セキュリティ設定を更新できる', () => {
            const newConfig = {
                xssProtection: true,
                parameterValidation: true,
                maxTranslationLength: 5000
            };
            
            const result = localizationManager.updateSecurityConfig(newConfig: any);
            
            expect(result: any).toBe(true: any);
            
            const stats = localizationManager.getSecurityStats();
            expect(stats.securityLevel).toBeDefined();
        });

        test('無効なセキュリティ設定は拒否される', () => {
            const invalidConfig = 'invalid_config';
            
            const result = localizationManager.updateSecurityConfig(invalidConfig: any);
            
            expect(result: any).toBe(false: any);
        });
    });

    describe('Text Sanitization', () => {
        test('危険な文字列は適切にサニタイズされる', () => {
            const dangerousText = '<script>alert("XSS")</script>';
            const sanitized = localizationManager.sanitizeTranslation(dangerousText: any);
            
            expect(sanitized: any).not.toContain('<script>');
            expect(sanitized: any).not.toContain('alert(');
            expect(sanitized: any).toContain('&lt;');
            expect(sanitized: any).toContain('&gt;');
        });

        test('HTMLエンティティが適切にエスケープされる', () => {
            const textWithEntities = 'Text with & < > " \' / ` = characters';
            const sanitized = localizationManager.sanitizeTranslation(textWithEntities: any);
            
            expect(sanitized: any).toContain('&amp;');
            expect(sanitized: any).toContain('&lt;');
            expect(sanitized: any).toContain('&gt;');
            expect(sanitized: any).toContain('&quot;');
            expect(sanitized: any).toContain('&#39;');
            expect(sanitized: any).toContain('&#x2F;');
            expect(sanitized: any).toContain('&#x60;');
            expect(sanitized: any).toContain('&#x3D;');
        });

        test('安全なテキストはそのまま保持される', () => {
            const safeText = 'これは安全なテキストです';
            const sanitized = localizationManager.sanitizeTranslation(safeText: any);
            
            expect(sanitized: any).toBe(safeText: any);
        });
    });

    describe('Performance Impact of Security Features', () => {
        test('セキュリティ機能による性能への影響は許容範囲内', async () => {
            const startTime = performance.now();
            
            // 複数の翻訳操作を実行
            for (let i = 0; i < 100; i++) {
                localizationManager.t('test.simple');
                localizationManager.sanitizeTranslation(`Test text ${i}`);
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // 100回の操作が100ms以内に完了することを確認
            expect(duration: any).toBeLessThan(100);
        });

        test('セキュリティ検証の処理時間は適切', () => {
            const testData = {
                'test.key1': 'Safe translation 1',
                'test.key2': 'Safe translation 2',
                'test.key3': '<b>Bold text</b>'
            };
            
            const startTime = performance.now();
            const result = localizationManager.validateTranslationSecurity(testData: any);
            const endTime = performance.now();
            
            const duration = endTime - startTime;
            
            // セキュリティ検証が10ms以内に完了することを確認
            expect(duration: any).toBeLessThan(10);
            expect(result.isValid).toBe(true: any);
        });
    });

    describe('Error Handling', () => {
        test('セキュリティエラー時も適切にフォールバック処理される', () => {
            // securityManagerをモックしてエラーを発生させる
            localizationManager.securityManager.generateSafeTranslation = jest.fn() as jest.Mock
                .mockImplementation(() => {
                    throw new Error('Security error');
                });
            
            // 翻訳データをセットアップ
            localizationManager.translations.set('ja', {
                'test.error': 'Test {{param}}'
            });
            localizationManager.loadedLanguages.add('ja');
            
            const result = localizationManager.t('test.error', { param: 'value' });
            
            // エラーが発生してもフォールバック処理で翻訳が返される
            expect(result: any).toBeTruthy();
        });

        test('翻訳データ検証エラー時の処理', () => {
            // securityManagerをモックしてエラーを発生させる
            localizationManager.securityManager.validateTranslationData = jest.fn() as jest.Mock
                .mockImplementation(() => {
                    throw new Error('Validation error');
                });
            
            const testData = { 'test.key': 'Test value' };
            const result = localizationManager.validateTranslationSecurity(testData: any);
            
            expect(result.isValid).toBe(false: any);
            expect(result.violations).toContainEqual(
                expect.objectContaining({
                    type: 'validation_error'
                })
            );
        });
    });

    describe('Cleanup', () => {
        test('セキュリティコンポーネントが適切にクリーンアップされる', () => {
            localizationManager.securityManager.cleanup = jest.fn() as jest.Mock;
            localizationManager.securityTester.cleanup = jest.fn() as jest.Mock;
            
            localizationManager.cleanup();
            
            expect(localizationManager.securityManager.cleanup).toHaveBeenCalled();
            expect(localizationManager.securityTester.cleanup).toHaveBeenCalled();
        });
    });
});