/**
 * 国際化セキュリティテストシステム
 * 
 * 翻訳データの脆弱性テスト、パラメータインジェクションテスト、
 * セキュリティ監査機能を提供
 */

import { getErrorHandler } from '../../utils/ErrorHandler.js';

// 型定義
export interface SecurityTestConfig {
    enabled: boolean;
    strictMode: boolean;
    timeoutMs: number;
    maxTestCases: number;
    reportDetails: boolean;
}

export interface TestCases {
    xssPayloads: string[];
    injectionPayloads: string[];
    parameterInjection: string[];
    longStrings: string[];
    unicodePayloads: string[];
}

export interface TestResults {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    vulnerabilities: SecurityVulnerability[];
    startTime: number | null;
    endTime: number | null;
    duration: number;
}

export interface SecurityVulnerability {
    type: string;
    timestamp: number;
    severity: VulnerabilitySeverity;
    details: VulnerabilityDetails;
}

export interface VulnerabilityDetails {
    input?: any;
    reason?: string;
    severity?: VulnerabilitySeverity;
    error?: string;
    suite?: string;
}

export interface TestValidationResult {
    passed: boolean;
    reason: string;
    severity?: VulnerabilitySeverity;
}

export interface SecurityTestReport {
    summary: TestSummary;
    vulnerabilities: VulnerabilityReport;
    recommendations: SecurityRecommendation[];
    timestamp: number;
}

export interface TestSummary {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    successRate: number;
    duration: number;
}

export interface VulnerabilityReport {
    total: number;
    high: number;
    medium: number;
    low: number;
    details: SecurityVulnerability[];
}

export interface SecurityRecommendation {
    priority: RecommendationPriority;
    message: string;
    action: string;
}

export interface I18nSecurityManager {
    sanitizeString(input: string): string;
    validateTranslationData(translations: Record<string, any>, source: string): ValidationResult;
    generateSafeTranslation(template: string, parameters: Record<string, any>): string;
    sanitizeTranslationParameters(parameters: Record<string, any>): Record<string, any>;
    sanitizeParameterValue(value: any): string;
}

export interface ValidationResult {
    isValid: boolean;
    violations: ValidationViolation[];
}

export interface ValidationViolation {
    severity: VulnerabilitySeverity;
    type: string;
    message: string;
}

export interface CSPMetaElement {
    getAttribute(name: string): string | null;
}

export type VulnerabilitySeverity = 'low' | 'medium' | 'high' | 'critical';
export type RecommendationPriority = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type TestType = 'xss_test' | 'injection_test' | 'parameter_key_validation' | 'parameter_injection' | 'content_validation' | 'long_string_test' | 'unicode_test' | 'csp_presence' | 'csp_configuration' | 'sanitization_test' | 'test_execution_error';
export type TestValidator = (input: any) => TestValidationResult;

export class I18nSecurityTester {
    // セキュリティマネージャー
    private securityManager: I18nSecurityManager;
    // テスト設定
    private testConfig: SecurityTestConfig;
    // テストケース
    private testCases: TestCases;
    // テスト結果
    private testResults: TestResults;

    constructor(securityManager: I18nSecurityManager) {
        this.securityManager = securityManager;
        
        // テスト設定
        this.testConfig = {
            enabled: true,
            strictMode: false,
            timeoutMs: 5000,
            maxTestCases: 1000,
            reportDetails: true
        };

        // テストケース
        this.testCases = {
            xssPayloads: [
                '<script>alert("XSS")</script>',
                '<img src="x" onerror="alert(1)">',
                '<svg onload="alert(1)">',
                'javascript:alert(1)',
                '<iframe src="javascript:alert(1)"></iframe>',
                '<object data="javascript:alert(1)"></object>',
                '<embed src="javascript:alert(1)">',
                '<link rel="stylesheet" href="javascript:alert(1)">',
                '<style>@import "javascript:alert(1)"</style>',
                '<div onclick="alert(1)">Click me</div>',
                '<input type="image" src="x" onerror="alert(1)">',
                '<form><button formaction="javascript:alert(1)">Submit</button></form>',
                '<details open ontoggle="alert(1)">',
                '<marquee onstart="alert(1)">',
                '<video><source onerror="alert(1)">',
                '<audio src="x" onerror="alert(1)">',
                '<body onload="alert(1)">',
                '<meta http-equiv="refresh" content="0,url=javascript:alert(1)">',
                '<base href="javascript:alert(1)//">',
                '"><script>alert(1)</script>',
                '\'><script>alert(1)</script>',
                '"><script>alert(1)</script>',
                '\\"><script>alert(1)</script>',
                '<script>eval("alert(1)")</script>',
                '<script>Function("alert(1)")()</script>',
                '<script>setTimeout("alert(1)", 0)</script>',
                '<script>setInterval("alert(1)", 1000)</script>'
            ],

            injectionPayloads: [
                '{{constructor.constructor("alert(1)")()}}',
                '{{__proto__.constructor.constructor("alert(1)")()}}',
                '{{#with this}}{{lookup ../constructor "constructor"}}{{/with}}',
                '${alert(1)}',
                '#{alert(1)}',
                '%{alert(1)}',
                '{alert(1)}',
                '#{7*7}',
                '${7*7}',
                '{{7*7}}',
                '<%=7*7%>',
                '<%= 7*7 %>',
                '{{= 7*7 }}',
                '{%=7*7%}',
                '<%- 7*7 %>',
                '<<SCRIPT>alert("XSS")<</SCRIPT>',
                '<<IMG SRC="javascript:alert(\'XSS\')">>', 
                '<IMG """><SCRIPT>alert("XSS")</SCRIPT>\\">',
                '<IMG SRC=javascript:alert(String.fromCharCode(88,83,83))>',
                '<IMG SRC=# onmouseover="alert(\'xxs\')">',
                '<IMG SRC= onmouseover="alert(\'xxs\')">',
                '<IMG onmouseover="alert(\'xxs\')">',
                '<IMG SRC=&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;&#39;&#88;&#83;&#83;&#39;&#41;>',
                '<IMG SRC=&#0000106&#0000097&#0000118&#0000097&#0000115&#0000099&#0000114&#0000105&#0000112&#0000116&#0000058&#0000097&#0000108&#0000101&#0000114&#0000116&#0000040&#0000039&#0000088&#0000083&#0000083&#0000039&#0000041>'
            ],

            parameterInjection: [
                '../../../etc/passwd',
                '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
                '/dev/null',
                'CON',
                'PRN',
                'AUX',
                'NUL',
                'COM1',
                'LPT1',
                '${env:PATH}',
                '${jndi:ldap://localhost:1389/exploit}',
                '%{env:PATH}',
                '%{sys:user.home}',
                '$(echo vulnerable)',
                '`echo vulnerable`',
                '|echo vulnerable',
                ';echo vulnerable',
                '&echo vulnerable',
                '&&echo vulnerable',
                '||echo vulnerable',
                '\necho vulnerable',
                '\r\necho vulnerable',
                '${7*7}',
                '#{7*7}',
                '{{7*7}}',
                '%{7*7}',
                '\\x00',
                '\\x0a',
                '\\x0d',
                '\\x1a',
                '%00',
                '%0a',
                '%0d',
                '%1a',
                'file:///etc/passwd',
                'http://169.254.169.254/',
                'dict://localhost:11211/',
                'gopher://localhost:9000/',
                'php://filter/convert.base64-encode/resource=index.php',
                'data:text/html,<script>alert(1)</script>'
            ],

            longStrings: [
                'A'.repeat(1000),
                'あ'.repeat(1000),
                '𠀋'.repeat(500),
                'A'.repeat(10000),
                'A'.repeat(100000),
                'A'.repeat(1000000),
                '\n'.repeat(1000),
                '\t'.repeat(1000),
                ' '.repeat(10000),
                'ABC'.repeat(5000)
            ],

            unicodePayloads: [
                '\u0000',
                '\u0001',
                '\u0008',
                '\u000B',
                '\u000C',
                '\u000E',
                '\u001F',
                '\u007F',
                '\u0080',
                '\u009F',
                '\u00A0',
                '\u2028',
                '\u2029',
                '\uFEFF',
                '\uFFFD',
                '\uFFFF',
                '‮',
                '‏',
                '‎',
                '⁦',
                '⁧',
                '⁨',
                '⁩',
                String.fromCharCode(0),
                String.fromCharCode(8),
                String.fromCharCode(11),
                String.fromCharCode(12),
                String.fromCharCode(14),
                String.fromCharCode(31),
                String.fromCharCode(127),
                String.fromCharCode(65533),
                String.fromCharCode(65535),
                '🔥'.repeat(100),
                '👨‍👩‍👧‍👦'.repeat(10),
                'A' + String.fromCharCode(8203) + 'B',
                'A' + String.fromCharCode(8204) + 'B',
                'A' + String.fromCharCode(8205) + 'B'
            ]
        };

        // テスト結果の初期化
        this.testResults = {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            vulnerabilities: [],
            startTime: null,
            endTime: null,
            duration: 0
        };

        console.log('I18nSecurityTester initialized');
    }

    /**
     * すべてのセキュリティテストを実行
     */
    async runAllTests(): Promise<SecurityTestReport> {
        if (!this.testConfig.enabled) {
            console.log('Security tests are disabled');
            return this.generateEmptyReport();
        }

        console.log('Starting security test suite...');
        this.resetTestResults();
        this.testResults.startTime = Date.now();

        try {
            // 各テストスイートを実行
            await this.runTestWithTimeout(() => this.runXSSTests(), 'XSS Tests');
            await this.runTestWithTimeout(() => this.runInjectionTests(), 'Injection Tests');
            await this.runTestWithTimeout(() => this.runParameterTests(), 'Parameter Tests');
            await this.runTestWithTimeout(() => this.runContentValidationTests(), 'Content Validation');
            await this.runTestWithTimeout(() => this.runLongStringTests(), 'Long String Tests');
            await this.runTestWithTimeout(() => this.runUnicodeTests(), 'Unicode Tests');
            await this.runTestWithTimeout(() => this.runCSPTests(), 'CSP Tests');
            await this.runTestWithTimeout(() => this.runSanitizationTests(), 'Sanitization Tests');

        } catch (error) {
            this.recordVulnerability({
                type: 'test_execution_error',
                timestamp: Date.now(),
                severity: 'high',
                details: {
                    error: error instanceof Error ? error.message : String(error),
                    suite: 'Test Execution'
                }
            });
        } finally {
            this.testResults.endTime = Date.now();
            this.testResults.duration = this.testResults.endTime - this.testResults.startTime;
        }

        return this.generateReport();
    }

    /**
     * XSSテストを実行
     */
    private async runXSSTests(): Promise<void> {
        console.log('Running XSS tests...');

        for (const payload of this.testCases.xssPayloads) {
            if (this.testResults.totalTests >= this.testConfig.maxTestCases) {
                break;
            }

            this.testResults.totalTests++;

            // サニタイズ前後を比較
            const sanitized = this.securityManager.sanitizeString(payload);
            
            if (this.containsXSSPattern(sanitized)) {
                this.testResults.failedTests++;
                this.recordVulnerability({
                    type: 'xss_test',
                    timestamp: Date.now(),
                    severity: 'high',
                    details: {
                        input: payload,
                        reason: 'XSS pattern detected after sanitization'
                    }
                });
            } else {
                this.testResults.passedTests++;
            }
        }
    }

    /**
     * インジェクションテストを実行
     */
    private async runInjectionTests(): Promise<void> {
        console.log('Running injection tests...');

        for (const payload of this.testCases.injectionPayloads) {
            if (this.testResults.totalTests >= this.testConfig.maxTestCases) {
                break;
            }

            this.testResults.totalTests++;

            // テンプレートインジェクションをチェック
            const testTemplate = `Hello ${payload} World`;
            const result = this.securityManager.generateSafeTranslation(testTemplate, {});

            if (this.containsInjectionPattern(result)) {
                this.testResults.failedTests++;
                this.recordVulnerability({
                    type: 'injection_test',
                    timestamp: Date.now(),
                    severity: 'critical',
                    details: {
                        input: payload,
                        reason: 'Template injection pattern detected'
                    }
                });
            } else {
                this.testResults.passedTests++;
            }
        }
    }

    /**
     * パラメータテストを実行
     */
    private async runParameterTests(): Promise<void> {
        console.log('Running parameter tests...');

        // パラメータキーの検証
        const dangerousKeys = [
            '__proto__',
            'constructor',
            'prototype',
            'eval',
            'Function',
            'setTimeout',
            'setInterval'
        ];

        for (const key of dangerousKeys) {
            this.testResults.totalTests++;

            const testParams = { [key]: 'test' };
            const sanitized = this.securityManager.sanitizeTranslationParameters(testParams);

            if (key in sanitized) {
                this.testResults.failedTests++;
                this.recordVulnerability({
                    type: 'parameter_key_validation',
                    timestamp: Date.now(),
                    severity: 'high',
                    details: {
                        input: key,
                        reason: 'Dangerous parameter key not filtered'
                    }
                });
            } else {
                this.testResults.passedTests++;
            }
        }

        // パラメータ値のインジェクション
        for (const payload of this.testCases.parameterInjection) {
            if (this.testResults.totalTests >= this.testConfig.maxTestCases) {
                break;
            }

            this.testResults.totalTests++;

            const sanitized = this.securityManager.sanitizeParameterValue(payload);

            if (this.containsPathTraversal(sanitized) || this.containsCommandInjection(sanitized)) {
                this.testResults.failedTests++;
                this.recordVulnerability({
                    type: 'parameter_injection',
                    timestamp: Date.now(),
                    severity: 'critical',
                    details: {
                        input: payload,
                        reason: 'Injection pattern detected in parameter value'
                    }
                });
            } else {
                this.testResults.passedTests++;
            }
        }
    }

    /**
     * コンテンツ検証テストを実行
     */
    private async runContentValidationTests(): Promise<void> {
        console.log('Running content validation tests...');

        const testCases = [
            {
                translations: {
                    'key1': '<script>alert(1)</script>',
                    'key2': '${alert(1)}',
                    'key3': '{{7*7}}'
                },
                source: 'untrusted'
            },
            {
                translations: {
                    'nested.key': {
                        'value': '<img src=x onerror=alert(1)>'
                    }
                },
                source: 'external'
            }
        ];

        for (const testCase of testCases) {
            this.testResults.totalTests++;

            const result = this.securityManager.validateTranslationData(
                testCase.translations,
                testCase.source
            );

            if (!result.isValid && result.violations.length > 0) {
                this.testResults.passedTests++;
            } else {
                this.testResults.failedTests++;
                this.recordVulnerability({
                    type: 'content_validation',
                    timestamp: Date.now(),
                    severity: 'high',
                    details: {
                        input: testCase,
                        reason: 'Failed to detect malicious content'
                    }
                });
            }
        }
    }

    /**
     * 長い文字列テストを実行
     */
    private async runLongStringTests(): Promise<void> {
        console.log('Running long string tests...');

        for (const payload of this.testCases.longStrings) {
            if (this.testResults.totalTests >= this.testConfig.maxTestCases) {
                break;
            }

            this.testResults.totalTests++;

            try {
                const sanitized = this.securityManager.sanitizeString(payload);
                
                // 長さチェック
                if (sanitized.length > 10000 && this.testConfig.strictMode) {
                    this.testResults.failedTests++;
                    this.recordVulnerability({
                        type: 'long_string_test',
                        timestamp: Date.now(),
                        severity: 'low',
                        details: {
                            input: `String of length ${payload.length}`,
                            reason: 'String length exceeds safe limit'
                        }
                    });
                } else {
                    this.testResults.passedTests++;
                }
            } catch (error) {
                this.testResults.failedTests++;
                this.recordVulnerability({
                    type: 'long_string_test',
                    timestamp: Date.now(),
                    severity: 'medium',
                    details: {
                        input: `String of length ${payload.length}`,
                        reason: 'Error processing long string',
                        error: error instanceof Error ? error.message : String(error)
                    }
                });
            }
        }
    }

    /**
     * Unicodeテストを実行
     */
    private async runUnicodeTests(): Promise<void> {
        console.log('Running Unicode tests...');

        for (const payload of this.testCases.unicodePayloads) {
            if (this.testResults.totalTests >= this.testConfig.maxTestCases) {
                break;
            }

            this.testResults.totalTests++;

            const sanitized = this.securityManager.sanitizeString(payload);

            // 制御文字や危険な文字が含まれているかチェック
            if (this.containsDangerousUnicode(sanitized)) {
                this.testResults.failedTests++;
                this.recordVulnerability({
                    type: 'unicode_test',
                    timestamp: Date.now(),
                    severity: 'medium',
                    details: {
                        input: `Unicode: ${payload.charCodeAt(0)}`,
                        reason: 'Dangerous Unicode character not filtered'
                    }
                });
            } else {
                this.testResults.passedTests++;
            }
        }
    }

    /**
     * CSPテストを実行
     */
    private async runCSPTests(): Promise<void> {
        console.log('Running CSP tests...');

        // CSPの存在をチェック
        this.testResults.totalTests++;

        const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]') as CSPMetaElement | null;

        if (!cspMeta) {
            this.testResults.failedTests++;
            this.recordVulnerability({
                type: 'csp_presence',
                timestamp: Date.now(),
                severity: 'medium',
                details: {
                    reason: 'Content Security Policy not found'
                }
            });
        } else {
            this.testResults.passedTests++;

            // CSPの設定をチェック
            this.testResults.totalTests++;
            const cspContent = cspMeta.getAttribute('content') || '';

            if (!cspContent.includes("script-src") || cspContent.includes("unsafe-inline")) {
                this.testResults.failedTests++;
                this.recordVulnerability({
                    type: 'csp_configuration',
                    timestamp: Date.now(),
                    severity: 'high',
                    details: {
                        reason: 'Weak CSP configuration detected'
                    }
                });
            } else {
                this.testResults.passedTests++;
            }
        }
    }

    /**
     * サニタイズテストを実行
     */
    private async runSanitizationTests(): Promise<void> {
        console.log('Running sanitization tests...');

        const testCases = [
            {
                input: '<div>Hello {{name}}</div>',
                params: { name: '<script>alert(1)</script>' },
                expected: '<div>Hello &lt;script&gt;alert(1)&lt;/script&gt;</div>'
            },
            {
                input: 'URL: {{url}}',
                params: { url: 'javascript:alert(1)' },
                expected: 'URL: about:blank'
            },
            {
                input: 'Link: <a href="{{link}}">Click</a>',
                params: { link: 'javascript:void(0)' },
                expected: 'Link: <a href="#">Click</a>'
            }
        ];

        for (const testCase of testCases) {
            this.testResults.totalTests++;

            const result = this.securityManager.generateSafeTranslation(
                testCase.input,
                testCase.params
            );

            // 基本的なサニタイズが行われているかチェック
            if (!this.containsXSSPattern(result)) {
                this.testResults.passedTests++;
            } else {
                this.testResults.failedTests++;
                this.recordVulnerability({
                    type: 'sanitization_test',
                    timestamp: Date.now(),
                    severity: 'high',
                    details: {
                        input: testCase,
                        reason: 'Sanitization failed'
                    }
                });
            }
        }
    }

    /**
     * タイムアウト付きでテストを実行
     */
    private async runTestWithTimeout(testFn: () => Promise<void>, testName: string): Promise<void> {
        const timeoutPromise = new Promise<void>((_, reject) => {
            setTimeout(() => reject(new Error(`Test timeout: ${testName}`)), this.testConfig.timeoutMs);
        });

        try {
            await Promise.race([testFn(), timeoutPromise]);
        } catch (error) {
            console.error(`Test suite failed: ${testName}`, error);
            throw error;
        }
    }

    /**
     * XSSパターンが含まれているかチェック
     */
    private containsXSSPattern(input: string): boolean {
        const xssPatterns = [
            /<script[^>]*>[\s\S]*?<\/script>/gi,
            /<iframe[^>]*>/gi,
            /<object[^>]*>/gi,
            /<embed[^>]*>/gi,
            /<img[^>]*onerror\s*=/gi,
            /<svg[^>]*onload\s*=/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<.*onclick\s*=/gi,
            /<.*onmouseover\s*=/gi,
            /<.*onload\s*=/gi,
            /<.*onerror\s*=/gi
        ];

        return xssPatterns.some(pattern => pattern.test(input));
    }

    /**
     * インジェクションパターンが含まれているかチェック
     */
    private containsInjectionPattern(input: string): boolean {
        const injectionPatterns = [
            /\{\{.*\}\}/,
            /\${.*}/,
            /#{.*}/,
            /%{.*}/,
            /<%.*%>/,
            /<\/script>/i,
            /eval\s*\(/,
            /Function\s*\(/,
            /setTimeout\s*\(/,
            /setInterval\s*\(/,
            /constructor\s*\(/,
            /__proto__/
        ];

        return injectionPatterns.some(pattern => pattern.test(input));
    }

    /**
     * パストラバーサルパターンが含まれているかチェック
     */
    private containsPathTraversal(input: string): boolean {
        const pathTraversalPatterns = [
            /\.\.[\/\\]/,
            /\.\.%2[fF]/,
            /\.\.%5[cC]/,
            /\/etc\/passwd/,
            /\/windows\/system32/
        ];

        return pathTraversalPatterns.some(pattern => pattern.test(input));
    }

    /**
     * コマンドインジェクションパターンが含まれているかチェック
     */
    private containsCommandInjection(input: string): boolean {
        const commandPatterns = [
            /[;&|`$]/,
            /\$\(/,
            /`.*`/,
            /\|\|/,
            /&&/
        ];

        return commandPatterns.some(pattern => pattern.test(input));
    }

    /**
     * 危険なUnicode文字が含まれているかチェック
     */
    private containsDangerousUnicode(input: string): boolean {
        for (let i = 0; i < input.length; i++) {
            const code = input.charCodeAt(i);
            
            // 制御文字（C0, C1）
            if ((code >= 0x00 && code <= 0x1F) || (code >= 0x7F && code <= 0x9F)) {
                // タブ、改行、キャリッジリターンは許可
                if (code !== 0x09 && code !== 0x0A && code !== 0x0D) {
                    return true;
                }
            }
            
            // 双方向制御文字
            if (code >= 0x202A && code <= 0x202E) {
                return true;
            }
            
            // その他の危険な文字
            if (code === 0xFEFF || code === 0xFFFF || code === 0xFFFE) {
                return true;
            }
        }

        return false;
    }

    /**
     * 脆弱性を記録
     */
    private recordVulnerability(vulnerability: SecurityVulnerability): void {
        this.testResults.vulnerabilities.push(vulnerability);

        if (this.testConfig.reportDetails) {
            console.warn(`Security vulnerability detected: ${vulnerability.type}`, vulnerability.details);
        }
    }

    /**
     * テスト結果をリセット
     */
    private resetTestResults(): void {
        this.testResults = {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            vulnerabilities: [],
            startTime: null,
            endTime: null,
            duration: 0
        };
    }

    /**
     * レポートを生成
     */
    private generateReport(): SecurityTestReport {
        const vulnerabilityReport = this.categorizeVulnerabilities();
        const recommendations = this.generateRecommendations(vulnerabilityReport);

        return {
            summary: {
                totalTests: this.testResults.totalTests,
                passedTests: this.testResults.passedTests,
                failedTests: this.testResults.failedTests,
                successRate: this.testResults.totalTests > 0 
                    ? (this.testResults.passedTests / this.testResults.totalTests) * 100 
                    : 0,
                duration: this.testResults.duration
            },
            vulnerabilities: vulnerabilityReport,
            recommendations: recommendations,
            timestamp: Date.now()
        };
    }

    /**
     * 空のレポートを生成
     */
    private generateEmptyReport(): SecurityTestReport {
        return {
            summary: {
                totalTests: 0,
                passedTests: 0,
                failedTests: 0,
                successRate: 100,
                duration: 0
            },
            vulnerabilities: {
                total: 0,
                high: 0,
                medium: 0,
                low: 0,
                details: []
            },
            recommendations: [],
            timestamp: Date.now()
        };
    }

    /**
     * 脆弱性を分類
     */
    private categorizeVulnerabilities(): VulnerabilityReport {
        const report: VulnerabilityReport = {
            total: this.testResults.vulnerabilities.length,
            high: 0,
            medium: 0,
            low: 0,
            details: this.testResults.vulnerabilities
        };

        for (const vulnerability of this.testResults.vulnerabilities) {
            switch (vulnerability.severity) {
                case 'critical':
                case 'high':
                    report.high++;
                    break;
                case 'medium':
                    report.medium++;
                    break;
                case 'low':
                    report.low++;
                    break;
            }
        }

        return report;
    }

    /**
     * 推奨事項を生成
     */
    private generateRecommendations(vulnerabilityReport: VulnerabilityReport): SecurityRecommendation[] {
        const recommendations: SecurityRecommendation[] = [];

        if (vulnerabilityReport.high > 0) {
            recommendations.push({
                priority: 'critical',
                message: '高リスクの脆弱性が検出されました',
                action: '即座にセキュリティ対策を実施してください'
            });
        }

        // XSS脆弱性がある場合
        const xssVulns = this.testResults.vulnerabilities.filter(v => v.type === 'xss_test');
        if (xssVulns.length > 0) {
            recommendations.push({
                priority: 'high',
                message: 'XSS脆弱性が検出されました',
                action: 'HTMLエスケープとCSPの実装を強化してください'
            });
        }

        // インジェクション脆弱性がある場合
        const injectionVulns = this.testResults.vulnerabilities.filter(v => 
            v.type === 'injection_test' || v.type === 'parameter_injection'
        );
        if (injectionVulns.length > 0) {
            recommendations.push({
                priority: 'high',
                message: 'インジェクション脆弱性が検出されました',
                action: 'パラメータの検証とサニタイズを強化してください'
            });
        }

        // CSP未設定の場合
        const cspVulns = this.testResults.vulnerabilities.filter(v => v.type === 'csp_presence');
        if (cspVulns.length > 0) {
            recommendations.push({
                priority: 'medium',
                message: 'Content Security Policyが設定されていません',
                action: '適切なCSPヘッダーを設定してください'
            });
        }

        // 全体的な推奨
        if (this.testResults.successRate < 90) {
            recommendations.push({
                priority: 'high',
                message: 'セキュリティテストの成功率が低いです',
                action: 'セキュリティ実装の全体的な見直しを推奨します'
            });
        }

        return recommendations;
    }

    /**
     * 設定を更新
     */
    updateConfig(config: Partial<SecurityTestConfig>): void {
        this.testConfig = { ...this.testConfig, ...config };
        console.log('Security test configuration updated');
    }

    /**
     * カスタムテストケースを追加
     */
    addCustomTestCase(type: keyof TestCases, payload: string): void {
        if (!this.testCases[type]) {
            console.error(`Invalid test case type: ${type}`);
            return;
        }

        this.testCases[type].push(payload);
        console.log(`Custom test case added to ${type}`);
    }

    /**
     * テスト結果を取得
     */
    getTestResults(): TestResults {
        return { ...this.testResults };
    }

    /**
     * 統計情報を取得
     */
    getStatistics(): {
        totalRuns: number;
        averageSuccessRate: number;
        commonVulnerabilities: Record<string, number>;
    } {
        const vulnerabilityTypes: Record<string, number> = {};

        for (const vuln of this.testResults.vulnerabilities) {
            vulnerabilityTypes[vuln.type] = (vulnerabilityTypes[vuln.type] || 0) + 1;
        }

        return {
            totalRuns: 1, // この実装では1回のみ
            averageSuccessRate: this.testResults.totalTests > 0 
                ? (this.testResults.passedTests / this.testResults.totalTests) * 100 
                : 0,
            commonVulnerabilities: vulnerabilityTypes
        };
    }
}

// エクスポート
export function createSecurityTester(securityManager: I18nSecurityManager): I18nSecurityTester {
    return new I18nSecurityTester(securityManager);
}