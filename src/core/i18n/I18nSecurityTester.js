/**
 * 国際化セキュリティテストシステム
 * 
 * 翻訳データの脆弱性テスト、パラメータインジェクションテスト、
 * セキュリティ監査機能を提供
 */

import { getErrorHandler } from '../../utils/ErrorHandler.js';

export class I18nSecurityTester {
    constructor(securityManager) {
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
                '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">',
                '<base href="javascript:alert(1)//">',
                '"><script>alert(1)</script>',
                "'><script>alert(1)</script>",
                '\"><script>alert(1)</script>',
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
                '<IMG """><SCRIPT>alert("XSS")</SCRIPT>"\>',
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
                '\0',
                '\x00',
                '\u0000',
                'eval(1+1)',
                'process.exit()',
                'require("fs")',
                'import("fs")',
                '__import__("os")',
                'exec("ls")',
                'system("dir")'
            ],
            
            longStrings: [
                'A'.repeat(100000),  // 100KB
                'A'.repeat(1000000), // 1MB
                '\u0000'.repeat(10000), // null bytes
                '{{'.repeat(10000),     // template injection
                '<script>'.repeat(1000), // repeated script tags
            ],
            
            unicodePayloads: [
                '\u003cscript\u003ealert(1)\u003c/script\u003e', // Unicode encoded script
                '\u0022\u003e\u003cscript\u003ealert(1)\u003c/script\u003e', // Unicode quote escape
                '\uff1cscript\uff1ealert(1)\uff1c/script\uff1e', // Fullwidth characters
                '\u02bcscript\u02bealert(1)\u02bc/script\u02be', // Modifier letters
                '\u200b<script>alert(1)</script>', // Zero-width space
                '\ufeff<script>alert(1)</script>', // BOM
                '\u180e<script>alert(1)</script>', // Mongolian vowel separator
            ]
        };
        
        // テスト結果
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
     * 包括的セキュリティテストの実行
     */
    async runComprehensiveSecurityTest() {
        console.log('Starting comprehensive security test...');
        
        this.testResults = {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            vulnerabilities: [],
            startTime: Date.now(),
            endTime: null,
            duration: 0
        };
        
        const testSuites = [
            () => this.testXSSVulnerabilities(),
            () => this.testInjectionVulnerabilities(),
            () => this.testParameterValidation(),
            () => this.testContentValidation(),
            () => this.testLongStringHandling(),
            () => this.testUnicodeHandling(),
            () => this.testCSPEffectiveness(),
            () => this.testSanitizationRobustness()
        ];
        
        for (const testSuite of testSuites) {
            try {
                await testSuite();
            } catch (error) {
                console.error('Test suite failed:', error);
                this.recordVulnerability('test_execution_error', {
                    error: error.message,
                    suite: testSuite.name
                });
            }
        }
        
        this.testResults.endTime = Date.now();
        this.testResults.duration = this.testResults.endTime - this.testResults.startTime;
        
        console.log('Comprehensive security test completed');
        return this.generateTestReport();
    }
    
    /**
     * XSS脆弱性テスト
     */
    async testXSSVulnerabilities() {
        console.log('Testing XSS vulnerabilities...');
        
        for (const payload of this.testCases.xssPayloads) {
            await this.runSingleTest(
                'xss_test',
                payload,
                (result) => this.validateXSSProtection(result, payload)
            );
        }
    }
    
    /**
     * インジェクション脆弱性テスト
     */
    async testInjectionVulnerabilities() {
        console.log('Testing injection vulnerabilities...');
        
        for (const payload of this.testCases.injectionPayloads) {
            await this.runSingleTest(
                'injection_test',
                payload,
                (result) => this.validateInjectionProtection(result, payload)
            );
        }
    }
    
    /**
     * パラメータ検証テスト
     */
    async testParameterValidation() {
        console.log('Testing parameter validation...');
        
        // 無効なパラメータキーのテスト
        const invalidKeys = [
            '__proto__', 'constructor', 'prototype',
            '', 'a'.repeat(1000), '123invalid',
            'key with spaces', 'key-with-dashes',
            'key.with.dots', 'key/with/slashes'
        ];
        
        for (const key of invalidKeys) {
            await this.runSingleTest(
                'parameter_key_validation',
                { [key]: 'value' },
                (result) => this.validateParameterKeyRejection(result, key)
            );
        }
        
        // パラメータインジェクションテスト
        for (const payload of this.testCases.parameterInjection) {
            await this.runSingleTest(
                'parameter_injection',
                { key: payload },
                (result) => this.validateParameterInjectionProtection(result, payload)
            );
        }
    }
    
    /**
     * コンテンツ検証テスト
     */
    async testContentValidation() {
        console.log('Testing content validation...');
        
        const maliciousTranslations = {
            'test.xss': '<script>alert("XSS")</script>',
            'test.injection': '{{constructor.constructor("alert(1)")()}}',
            'test.html': '<iframe src="javascript:alert(1)"></iframe>',
            'test.proto': { '__proto__': { polluted: true } }
        };
        
        const validationResult = this.securityManager.validateTranslationData(
            maliciousTranslations,
            'security_test'
        );
        
        await this.runSingleTest(
            'content_validation',
            maliciousTranslations,
            () => this.validateContentValidationResult(validationResult)
        );
    }
    
    /**
     * 長い文字列処理テスト
     */
    async testLongStringHandling() {
        console.log('Testing long string handling...');
        
        for (const longString of this.testCases.longStrings) {
            await this.runSingleTest(
                'long_string_test',
                longString,
                (result) => this.validateLongStringHandling(result, longString)
            );
        }
    }
    
    /**
     * Unicode処理テスト
     */
    async testUnicodeHandling() {
        console.log('Testing Unicode handling...');
        
        for (const unicodePayload of this.testCases.unicodePayloads) {
            await this.runSingleTest(
                'unicode_test',
                unicodePayload,
                (result) => this.validateUnicodeHandling(result, unicodePayload)
            );
        }
    }
    
    /**
     * CSP効果テスト
     */
    async testCSPEffectiveness() {
        console.log('Testing CSP effectiveness...');
        
        // CSP設定の確認
        const cspMeta = typeof document !== 'undefined' ? 
            document.querySelector('meta[http-equiv="Content-Security-Policy"]') : null;
        
        await this.runSingleTest(
            'csp_presence',
            null,
            () => this.validateCSPPresence(cspMeta)
        );
        
        if (cspMeta) {
            const cspContent = cspMeta.getAttribute('content');
            await this.runSingleTest(
                'csp_configuration',
                cspContent,
                () => this.validateCSPConfiguration(cspContent)
            );
        }
    }
    
    /**
     * サニタイゼーション堅牢性テスト
     */
    async testSanitizationRobustness() {
        console.log('Testing sanitization robustness...');
        
        const testCases = [
            ...this.testCases.xssPayloads,
            ...this.testCases.injectionPayloads,
            ...this.testCases.unicodePayloads
        ];
        
        for (const payload of testCases) {
            const sanitized = this.securityManager.sanitizeString(payload);
            
            await this.runSingleTest(
                'sanitization_test',
                payload,
                () => this.validateSanitization(sanitized, payload)
            );
        }
    }
    
    /**
     * 単一テストの実行
     */
    async runSingleTest(testType, input, validator) {
        this.testResults.totalTests++;
        
        try {
            const result = validator(input);
            
            if (result.passed) {
                this.testResults.passedTests++;
            } else {
                this.testResults.failedTests++;
                this.recordVulnerability(testType, {
                    input: input,
                    reason: result.reason,
                    severity: result.severity || 'medium'
                });
            }
            
        } catch (error) {
            this.testResults.failedTests++;
            this.recordVulnerability(testType, {
                input: input,
                error: error.message,
                severity: 'high'
            });
        }
    }
    
    /**
     * XSS保護の検証
     */
    validateXSSProtection(result, payload) {
        const sanitized = this.securityManager.sanitizeString(payload);
        
        // 危険なタグや属性が残っていないか確認
        const dangerousPatterns = [
            /<script[^>]*>/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /<iframe[^>]*>/i,
            /<object[^>]*>/i,
            /<embed[^>]*>/i
        ];
        
        const hasDangerousContent = dangerousPatterns.some(pattern => 
            pattern.test(sanitized)
        );
        
        return {
            passed: !hasDangerousContent,
            reason: hasDangerousContent ? 
                'Dangerous content not properly sanitized' : 
                'XSS payload properly handled'
        };
    }
    
    /**
     * インジェクション保護の検証
     */
    validateInjectionProtection(result, payload) {
        const safeTranslation = this.securityManager.generateSafeTranslation(
            'Test: {{value}}', 
            { value: payload }
        );
        
        // テンプレートインジェクションパターンの確認
        const injectionPatterns = [
            /\{\{.*constructor.*\}\}/i,
            /\{\{.*prototype.*\}\}/i,
            /\$\{.*\}/i,
            /#\{.*\}/i,
            /<%.*%>/i
        ];
        
        const hasInjection = injectionPatterns.some(pattern => 
            pattern.test(safeTranslation)
        );
        
        return {
            passed: !hasInjection,
            reason: hasInjection ? 
                'Template injection not properly prevented' : 
                'Injection payload properly handled'
        };
    }
    
    /**
     * パラメータキー拒否の検証
     */
    validateParameterKeyRejection(result, key) {
        const sanitized = this.securityManager.sanitizeTranslationParameters({
            [key]: 'test_value'
        });
        
        const keyExists = Object.prototype.hasOwnProperty.call(sanitized, key);
        
        return {
            passed: !keyExists,
            reason: keyExists ? 
                `Invalid parameter key "${key}" was not rejected` : 
                'Invalid parameter key properly rejected'
        };
    }
    
    /**
     * パラメータインジェクション保護の検証
     */
    validateParameterInjectionProtection(result, payload) {
        const sanitized = this.securityManager.sanitizeParameterValue(payload);
        
        // パストラバーサルやシステムコマンドの確認
        const dangerousPatterns = [
            /\.\.\//i,
            /\.\.\\/i,
            /\/etc\/passwd/i,
            /system32/i,
            /require\(/i,
            /import\(/i,
            /eval\(/i,
            /exec\(/i
        ];
        
        const hasDangerousContent = dangerousPatterns.some(pattern => 
            pattern.test(sanitized)
        );
        
        return {
            passed: !hasDangerousContent,
            reason: hasDangerousContent ? 
                'Parameter injection not properly prevented' : 
                'Parameter injection properly handled'
        };
    }
    
    /**
     * コンテンツ検証結果の検証
     */
    validateContentValidationResult(validationResult) {
        const hasHighSeverityViolations = validationResult.violations.some(
            v => v.severity === 'high'
        );
        
        return {
            passed: !validationResult.isValid && hasHighSeverityViolations,
            reason: validationResult.isValid ? 
                'Malicious content was not detected' : 
                'Malicious content properly detected',
            severity: validationResult.isValid ? 'high' : 'low'
        };
    }
    
    /**
     * 長い文字列処理の検証
     */
    validateLongStringHandling(result, longString) {
        const sanitized = this.securityManager.sanitizeParameterValue(longString);
        
        // 適切に切り詰められているか確認
        const properlyTruncated = sanitized.length <= 1000;
        
        // メモリ使用量が適切か確認（簡易チェック）
        const memoryEfficient = sanitized.length < longString.length || 
                               longString.length <= 1000;
        
        return {
            passed: properlyTruncated && memoryEfficient,
            reason: !properlyTruncated ? 
                'Long string not properly truncated' :
                !memoryEfficient ?
                'Memory usage not optimized' :
                'Long string properly handled'
        };
    }
    
    /**
     * Unicode処理の検証
     */
    validateUnicodeHandling(result, unicodePayload) {
        const sanitized = this.securityManager.sanitizeString(unicodePayload);
        
        // Unicode文字がHTMLエンティティに変換されているか確認
        const properlyEncoded = !sanitized.includes('<script') && 
                               !sanitized.includes('javascript:') &&
                               !sanitized.includes('alert(');
        
        return {
            passed: properlyEncoded,
            reason: !properlyEncoded ? 
                'Unicode payload not properly encoded' : 
                'Unicode payload properly handled'
        };
    }
    
    /**
     * CSP存在の検証
     */
    validateCSPPresence(cspMeta) {
        return {
            passed: cspMeta !== null,
            reason: !cspMeta ? 
                'Content Security Policy not found' : 
                'Content Security Policy properly configured'
        };
    }
    
    /**
     * CSP設定の検証
     */
    validateCSPConfiguration(cspContent) {
        const requiredDirectives = [
            'default-src',
            'script-src',
            'object-src',
            'base-uri'
        ];
        
        const hasRequiredDirectives = requiredDirectives.every(directive =>
            cspContent.includes(directive)
        );
        
        const hasUnsafeInline = cspContent.includes("'unsafe-inline'") &&
                               cspContent.includes('script-src');
        
        return {
            passed: hasRequiredDirectives && !hasUnsafeInline,
            reason: !hasRequiredDirectives ? 
                'Missing required CSP directives' :
                hasUnsafeInline ?
                'Unsafe inline scripts allowed' :
                'CSP properly configured'
        };
    }
    
    /**
     * サニタイゼーションの検証
     */
    validateSanitization(sanitized, original) {
        // 危険な文字が適切にエスケープされているか確認
        const dangerousChars = ['<', '>', '"', "'", '&', '/', '`', '='];
        const properlyEscaped = dangerousChars.every(char => {
            if (original.includes(char)) {
                return !sanitized.includes(char) || 
                       sanitized.includes('&' + char.charCodeAt(0).toString(16) + ';') ||
                       sanitized.includes('&#x' + char.charCodeAt(0).toString(16) + ';');
            }
            return true;
        });
        
        return {
            passed: properlyEscaped,
            reason: !properlyEscaped ? 
                'Dangerous characters not properly escaped' : 
                'Content properly sanitized'
        };
    }
    
    /**
     * 脆弱性の記録
     */
    recordVulnerability(type, details) {
        this.testResults.vulnerabilities.push({
            type: type,
            timestamp: Date.now(),
            severity: details.severity || 'medium',
            details: details
        });
        
        console.warn(`Security vulnerability detected: ${type}`, details);
    }
    
    /**
     * テストレポートの生成
     */
    generateTestReport() {
        const report = {
            summary: {
                totalTests: this.testResults.totalTests,
                passedTests: this.testResults.passedTests,
                failedTests: this.testResults.failedTests,
                successRate: this.testResults.totalTests > 0 ? 
                    Math.round((this.testResults.passedTests / this.testResults.totalTests) * 100) : 0,
                duration: this.testResults.duration
            },
            vulnerabilities: {
                total: this.testResults.vulnerabilities.length,
                high: this.testResults.vulnerabilities.filter(v => v.severity === 'high').length,
                medium: this.testResults.vulnerabilities.filter(v => v.severity === 'medium').length,
                low: this.testResults.vulnerabilities.filter(v => v.severity === 'low').length,
                details: this.testResults.vulnerabilities
            },
            recommendations: this.generateSecurityRecommendations(),
            timestamp: Date.now()
        };
        
        this.logTestReport(report);
        return report;
    }
    
    /**
     * セキュリティ推奨事項の生成
     */
    generateSecurityRecommendations() {
        const recommendations = [];
        const vulnerabilities = this.testResults.vulnerabilities;
        
        if (vulnerabilities.some(v => v.type === 'xss_test' && v.severity === 'high')) {
            recommendations.push({
                priority: 'critical',
                message: 'Critical XSS vulnerabilities detected. Immediate action required.',
                action: 'fix_xss_vulnerabilities'
            });
        }
        
        if (vulnerabilities.some(v => v.type === 'injection_test')) {
            recommendations.push({
                priority: 'high',
                message: 'Template injection vulnerabilities found. Review parameter handling.',
                action: 'fix_injection_vulnerabilities'
            });
        }
        
        if (vulnerabilities.some(v => v.type === 'csp_presence')) {
            recommendations.push({
                priority: 'high',
                message: 'Content Security Policy not properly configured.',
                action: 'configure_csp'
            });
        }
        
        if (vulnerabilities.length === 0) {
            recommendations.push({
                priority: 'info',
                message: 'No security vulnerabilities detected. Maintain current security practices.',
                action: 'maintain_security'
            });
        }
        
        return recommendations;
    }
    
    /**
     * テストレポートのログ出力
     */
    logTestReport(report) {
        console.log('='.repeat(60));
        console.log('SECURITY TEST REPORT');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${report.summary.totalTests}`);
        console.log(`Passed: ${report.summary.passedTests}`);
        console.log(`Failed: ${report.summary.failedTests}`);
        console.log(`Success Rate: ${report.summary.successRate}%`);
        console.log(`Duration: ${report.summary.duration}ms`);
        console.log('');
        console.log('VULNERABILITIES:');
        console.log(`High: ${report.vulnerabilities.high}`);
        console.log(`Medium: ${report.vulnerabilities.medium}`);
        console.log(`Low: ${report.vulnerabilities.low}`);
        
        if (report.vulnerabilities.high > 0) {
            console.error('❌ CRITICAL SECURITY ISSUES FOUND!');
        } else if (report.vulnerabilities.medium > 0) {
            console.warn('⚠️  Security issues found - review recommended');
        } else if (report.vulnerabilities.low > 0) {
            console.info('ℹ️  Minor security issues found');
        } else {
            console.log('✅ No security vulnerabilities detected');
        }
        
        console.log('='.repeat(60));
    }
    
    /**
     * テスト設定の更新
     */
    updateTestConfig(newConfig) {
        Object.assign(this.testConfig, newConfig);
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        this.testResults = {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            vulnerabilities: [],
            startTime: null,
            endTime: null,
            duration: 0
        };
        
        console.log('I18nSecurityTester cleaned up');
    }
}