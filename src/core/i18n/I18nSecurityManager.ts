/**
 * 国際化セキュリティ管理システム
 * 
 * 翻訳データのセキュリティ検証、XSS攻撃防止、
 * 安全な翻訳パラメータ処理を提供
 */

import { getErrorHandler  } from '../../utils/ErrorHandler.js';

// 型定義
export interface SecurityConfiguration { xssProtection: boolean,
    parameterValidation: boolean,
    contentValidation: boolean,
    injectionPrevention: boolean,
    sanitization: boolean,
    trustedDomains: string[],
    maxTranslationLength: number,
    maxParameterCount: number  }

export interface SecurityRules { forbiddenTags: string[],
    forbiddenAttributes: string[],
    suspiciousPatterns: RegExp[],
    allowedTags: string[],
    allowedAttributes: string[] }

export interface SecurityStatistics { totalValidations: number,
    blockedAttempts: number,
    xssAttempts: number,
    injectionAttempts: number,
    parameterViolations: number,
    contentViolations: number,
    lastThreat: ThreatInfo | null }

export interface ThreatInfo { timestamp: number,
    type: string,
    details: any }
';

export interface CSPConfiguration {,
    'default-src': string,', 'script-src': string,', 'style-src': string,', 'img-src': string,', 'font-src': string,', 'connect-src': string,', 'object-src': string,', 'base-uri': string,', 'form-action': string }

export interface SecurityViolation { type: SecurityViolationType,
    path?: string,
    message: string,
    severity: SecuritySeverity,
    details?: SecurityViolationDetails
     }

export interface SecurityViolationDetails { tag?: string,
    fullMatch?: string,
    attribute?: string }

export interface ValidationResult { isValid: boolean,
    violations: SecurityViolation[],
    source?: string  }

export interface SecurityStats { totalValidations: number,
    blockedAttempts: number,
    xssAttempts: number,
    injectionAttempts: number,
    parameterViolations: number,
    contentViolations: number,
    lastThreat: ThreatInfo | null,
    uptime: number,
    securityLevel: SecurityLevel,
    threatLevel: ThreatLevel
    }

export interface SecurityReport { timestamp: number,
    securityConfig: SecurityConfiguration,
    statistics: SecurityStats,
    cspConfig: CSPConfiguration,
    recentThreats: ThreatInfo[],
    recommendations: SecurityRecommendation[]
    }

export interface SecurityRecommendation { priority: RecommendationPriority,
    message: string,
    action: SecurityAction
    }

export interface SecurityPolicyViolationEvent { violatedDirective: string,
    blockedURI: string,
    sourceFile: string,
    lineNumber: number }

export interface SanitizedParameters { [key: string]: string }

export interface EntityMap { [char: string]: string }
';

export type SecurityViolationType = ';
    | 'invalid_data_type', ';
    | 'invalid_key', ';
    | 'invalid_value_type', ';
    | 'content_too_long', ';
    | 'suspicious_content', ';
    | 'forbidden_html_tag', ';
    | 'unknown_html_tag', ';
    | 'forbidden_html_attribute', ';
    | 'validation_error';

export type SecuritySeverity = 'low' | 'medium' | 'high';
export type SecurityLevel = 'low' | 'medium' | 'high';
export type ThreatLevel = 'low' | 'medium' | 'high';
export type RecommendationPriority = 'low' | 'medium' | 'high';

export type SecurityAction = ';
    | 'enable_strict_mode', ';
    | 'review_translation_sources', ';
    | 'enable_security_features';
';

export type SuspiciousActivityType = ';
    | 'script_injection', ';
    | 'xss_attempt', ';
    | 'error_message', ';
    | 'multiple_violations';
';

export type SecurityResponseType = ';
    | 'script_injection', ';
    | 'xss_attempt', ';
    | 'multiple_violations';

export class I18nSecurityManager {
    // セキュリティ設定
    private security: SecurityConfiguration,
    // セキュリティルール
    private securityRules: SecurityRules,
    // セキュリティ統計
    private securityStats: SecurityStatistics,
    // CSP設定
    private cspConfig: CSPConfiguration,
    // 初期化時刻
    private, initTime: number,
    constructor() {
',

        this.initTime = Date.now('',
                'script', 'iframe', 'object', 'embed', 'form', 'input',
                'button', 'textarea', 'select', 'option', 'link', 'meta',
                'base', 'style', 'title', 'head', 'html', 'body'
            ],
            
            // 危険な属性
            forbiddenAttributes: [',
                'onload', 'onerror', 'onclick', 'onmouseover', 'onmouseout',
                'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset',]',
                'javascript:', 'vbscript:', 'data:', 'file:', 'ftp:'],
            ],
            
            // 危険な文字列パターン
            suspiciousPatterns: [,
                /<script[^>]*>.*? <\/script>/gi, : undefined
                /javascript:/gi,
                /vbscript:/gi,
                /on\w+\s*=/gi,
                /expression\s*\(/gi,
                /eval\s*\(/gi,
                /document\s*\./gi,
                /window\s*\./gi,
                /<iframe[^>]*>/gi,
                /<object[^>]*>/gi,
                /<embed[^>]*>/gi,
            ],
            
            // 許可されたHTMLタグ（翻訳で使用可能）
            allowedTags: [',
                'b', 'i', 'u', 'strong', 'em', 'span', 'div', 'p',]',
                'br', 'small', 'mark', 'del', 'ins', 'sub', 'sup'],
            ],
            
            // 許可された属性
            allowedAttributes: [',
                'class', 'id', 'style', 'title', 'alt', 'href', 'target',]',
                'rel', 'data-*'] }
            ] }
        };
        
        // セキュリティ統計
        this.securityStats = { totalValidations: 0,
            blockedAttempts: 0,
            xssAttempts: 0,
            injectionAttempts: 0,
            parameterViolations: 0,
            contentViolations: 0,
    lastThreat: null  })'
        // CSP設定
        this.cspConfig = {;
            'default-src': "'self'",
            'script-src': "'self', 'unsafe-inline'",
            'style-src': "'self', 'unsafe-inline' https://fonts.googleapis.com",
            'img-src': "'self' data: https:",
            'font-src': "'self' data: https:, https://fonts.gstatic.com",
            'connect-src': "'self'",
            'object-src': "'none'",
            'base-uri': "'self'",
            'form-action': "'self'" };
        
        // 初期化)
        this.initialize();
    }
    
    /**
     * 初期化
     */
    private initialize(): void { // CSPヘッダーの設定
        this.setupCSP(),
        ",
        // セキュリティイベントリスナーの設定""
        this.setupSecurityEventListeners(),"

        console.log('I18nSecurityManager, initialized') }'
    
    /**
     * CSP（Content Security Policy）の設定'
     */''
    private setupCSP()';
            if(typeof, document !== 'undefined') {
                // CSPメタタグが存在しない場合は作成
                let cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]" as HTMLMetaElement,
                if(!cspMeta) {''
                    cspMeta = document.createElement('meta'),
                    cspMeta.setAttribute('http-equiv', 'Content-Security-Policy) }
                    document.head.appendChild(cspMeta); }
                }
                
                // CSP文字列を生成
                const cspValue = Object.entries(this.cspConfig)';
                    .map(([directive, value]) => `${directive} ${value}`)
                    .join('; ');

                cspMeta.setAttribute('content', cspValue';
                console.log('CSP configured:', cspValue';} catch (error) { console.warn('Failed to setup CSP:', error }
    }
    
    /**
     * セキュリティイベントリスナーの設定'
     */''
    private setupSecurityEventListeners()';
        if(typeof, window !== 'undefined') {
            // セキュリティ違反の監視
        }

            window.addEventListener('securitypolicyviolation', (event: SecurityPolicyViolationEvent) => {  }

                this.handleSecurityViolation(event);' }'

            }');
            ';
            // エラーイベントの監視
            window.addEventListener('error', (event: ErrorEvent) => {  ''
                if(event.message && this.containsSuspiciousContent(event.message)) { }'

                    this.handleSuspiciousActivity('error_message', event.message'; }

                }'}');
        }
    }
    
    /**
     * 翻訳データのセキュリティ検証'
     */''
    validateTranslationData(data: any, source: string = 'unknown'): ValidationResult { this.securityStats.totalValidations++,
        
        try {
            const violations: SecurityViolation[] = [],
            // データ型チェック
            if(typeof, data !== 'object' || data === null' {'
                violations.push({''
                    type: 'invalid_data_type',',
                    message: 'Translation data must be an object',' }

                    severity: 'high')') }
                return { isValid: false, violations }
            ';
            // 再帰的にオブジェクトを検証
            const validateObject = (obj: Record<string, any>, path: string = '): void => { for(const [key, value] of Object.entries(obj) { }
                    const currentPath = path ? `${path}.${key}` : key;
                    ';
                    // キーの検証
                    if(!this.validateTranslationKey(key)) { violations.push({)'
                            type: 'invalid_key',
    path: currentPath }

                            message: `Invalid translation, key: ${key}`,')'
                            severity: 'medium')');
                    }

                    if(typeof, value === 'string' {'
                        // 文字列値の検証
                        const stringViolations = this.validateTranslationString(value, currentPath) }

                        violations.push(...stringViolations);'

                    } else if (typeof, value === 'object' && value !== null) { // ネストしたオブジェクトの検証
                        validateObject(value, currentPath),' }'

                    } else if(!Array.isArray(value)) { violations.push({)'
                            type: 'invalid_value_type',
    path: currentPath }

                            message: `Invalid value type at ${currentPath}`,')'
                            severity: 'medium');
    };
            
            validateObject(data);
            
            // 違反がある場合はログに記録
            if(violations.length > 0) {
                this.logSecurityViolations(violations, source) }
                this.securityStats.contentViolations += violations.length; }
            }
            
            return { isValid: violations.length === 0,
                violations };
                source }
            };
            ';

        } catch (error) {
            getErrorHandler().handleError(error as Error, 'I18N_SECURITY_ERROR', {''
                operation: 'validateTranslationData',',
                source: source',' }'

            }');
            
            return { isValid: false,

                violations: [{''
                    type: 'validation_error',
                    message: (error, as Error').message,' };]'
                    severity: 'high' }]
                }]
            }
    }
    
    /**
     * 翻訳キーの検証
     */
    private validateTranslationKey(key: string): boolean { // 基本的な文字制限
        const keyPattern = /^[a-zA-Z0-9._-]+$/,
        
        // 長さ制限
        if (key.length > 200) { }
            console.log(`I18nSecurityManager: Key, too long: ${key} (${key.length} characters}`});
            return false;
        }
        
        // パターンマッチング
        if(!keyPattern.test(key) { }'

            console.log(`I18nSecurityManager: Invalid, characters in, key: ${key}`}';
            return false;
        }
        
        // 危険なパターンのチェック（より精密に）
        const dangerousPatterns = [';
            '__proto__', 'constructor', 'prototype',]';
            'eval', 'function'];
        ];

        // 危険な'script'パターンのチェック（正当なキーワードを除外）''
        // 'description', 'screenReader', 'subscript' などの正当なキーワードに含まれるscriptは許可'
        // scriptが独立した単語として使われている場合のみ危険とみなす
        const lowercaseKey = key.toLowerCase('';
            'description', 'descriptions', 'screenreader', 'subscript', 'manuscript',
            'transcript', 'postscript', 'javascript'  // javascriptも正当な用途;
        ];
        );
        // 正当なパターンに該当する場合は許可)
        const isLegitimateScriptUsage = legitimateScriptPatterns.some(pattern => );
            lowercaseKey.includes(pattern);
        
        // 独立したscript（危険）- ドット、アンダースコア、ハイフンで区切られた場合のみ
        const dangerousScriptPattern = /(?:^|[._-])script(?:[._-]|$)/i;
        const hasScript = !isLegitimateScriptUsage && dangerousScriptPattern.test(key);
        
        const hasOtherDangerousPatterns = dangerousPatterns.some(pattern => );
            key.toLowerCase().includes(pattern);

        return !(hasScript || hasOtherDangerousPatterns');
    }
    
    /**
     * 翻訳文字列の検証'
     */''
    private validateTranslationString(str: string, path: string = '): SecurityViolation[] { const violations: SecurityViolation[] = [],
        // 長さ制限
        if(str.length > this.security.maxTranslationLength) {
            violations.push({)'
                type: 'content_too_long'
            }
                path: path }

                message: `Translation content exceeds maximum, length: ${str.length}`,')'
                severity: 'medium');
        }
        ';
        // 危険なコンテンツのチェック
        if(this.containsSuspiciousContent(str)) { violations.push({)'
                type: 'suspicious_content')',
    path: path,
                message: 'Translation contains potentially dangerous content',')',
                severity: 'high'),
            this.securityStats.xssAttempts++  }
        
        // HTMLタグのチェック
        const htmlViolations = this.validateHTMLContent(str, path);
        violations.push(...htmlViolations);
        
        return violations;
    }
    
    /**
     * 疑わしいコンテンツの検出
     */''
    private containsSuspiciousContent(content: any): boolean { ''
        if(typeof, content !== 'string' { }
            return false;
        
        // 危険なパターンのチェック
        return this.securityRules.suspiciousPatterns.some(pattern => );
            pattern.test(content)';
        ');
    }
    
    /**'
     * HTMLコンテンツの検証'
     */''
    private validateHTMLContent(content: string, path: string = '): SecurityViolation[] { const violations: SecurityViolation[] = [],
        
        // HTMLタグの検出
        const tagPattern = /<\/? ([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi, : undefined
        let match: RegExpExecArray | null,
        
        while((match = tagPattern.exec(content) !== null) {
            const tagName = match[1].toLowerCase(),
            // 禁止されたタグのチェック
            if(this.securityRules.forbiddenTags.includes(tagName)) {
                violations.push({)'
                    type: 'forbidden_html_tag',
    path: path  }

                    message: `Forbidden HTML tag, found: ${tagName}`,''
                    severity: 'high');
                    details: { tag: tagName, fullMatch: match[0]  }';
            }
            ';
            // 許可されていないタグのチェック
            else if(!this.securityRules.allowedTags.includes(tagName)) { violations.push({)'
                    type: 'unknown_html_tag',
    path: path }

                    message: `Unknown HTML tag, found: ${tagName}`,''
                    severity: 'medium');
                    details: { tag: tagName, fullMatch: match[0]  }';
            }
        }
        ';
        // 危険な属性のチェック
        this.securityRules.forbiddenAttributes.forEach(attr => { '),
            const attrPattern = new RegExp(attr, 'gi',
            if(attrPattern.test(content)) {
                violations.push({)'
                    type: 'forbidden_html_attribute'
            }
                    path: path }

                    message: `Forbidden HTML attribute, found: ${attr}`,''
                    severity: 'high');
                    details: { attribute: attr });
                });
            }
        }';
        
        return violations;
    }
    
    /**
     * 翻訳パラメータの安全な処理'
     */''
    sanitizeTranslationParameters(params: Record<string, any>): SanitizedParameters { ''
        if(!params || typeof, params !== 'object' { }'
            return {}
        
        this.securityStats.totalValidations++;
        
        const sanitizedParams: SanitizedParameters = {}
        let paramCount = 0;
        
        for(const [key, value] of Object.entries(params) {
        
            // パラメータ数制限
            if (paramCount >= this.security.maxParameterCount) {
    
}
                this.securityStats.parameterViolations++; }
                console.warn(`Parameter, count limit, exceeded: ${paramCount}`});
                break;
            }
            
            // キーの検証
            if(!this.validateParameterKey(key) { this.securityStats.parameterViolations++ }
                console.warn(`Invalid, parameter key: ${key}`});
                continue;
            }
            
            // 値のサニタイゼーション
            const sanitizedValue = this.sanitizeParameterValue(value);
            if(sanitizedValue !== null) {
                sanitizedParams[key] = sanitizedValue }
                paramCount++; }
            } else { this.securityStats.parameterViolations++ }
                console.warn(`Invalid, parameter value, for key: ${key}`});
            }
        }
        
        return sanitizedParams;
    }
    
    /**
     * パラメータキーの検証
     */''
    private validateParameterKey(key: string): boolean { // 基本的な制限
        if(typeof, key !== 'string' || key.length === 0 || key.length > 100) {
    
}
            return false;
        
        // パターンマッチング
        const keyPattern = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
        return keyPattern.test(key);
    }
    
    /**
     * パラメータ値のサニタイゼーション
     */
    private sanitizeParameterValue(value: any): string | null { // 基本型のチェック
        if(value === null || value === undefined) {', ' }

            return ';
        
        // 文字列化
        let strValue = String(value);
        
        // 長さ制限
        if (strValue.length > 1000) { strValue = strValue.substring(0, 1000) }
        
        // 危険なコンテンツのチェック
        if(this.containsSuspiciousContent(strValue) { return this.sanitizeString(strValue) }
        
        return strValue;
    }
    
    /**
     * 文字列のサニタイゼーション
     */''
    private sanitizeString(str: string): string { ''
        if(typeof, str !== 'string') {', ' }

            return ';
        
        // HTMLエンティティのエスケープ
        const entityMap: EntityMap = { ', '&': '&amp,',', '<': '&lt,',', '>': '&gt,',''
            '"': '&quot,',''
            "'": '&#39,',', '/': '&#x2F,',', '`': '&#x60,',', '=': '&#x3D,' };

        return str.replace(/[&<>"'`=\/]/g, (s) => entityMap[s]);
    }
    
    /**
     * 安全な翻訳文字列の生成
     */
    generateSafeTranslation(template: string, params: Record<string, any> = { ): string {
        try {
            // パラメータのサニタイゼーション
            const safeParams = this.sanitizeTranslationParameters(params),
            // テンプレート文字列のセキュリティチェック
            if(this.containsSuspiciousContent(template)) {''
                console.warn('Suspicious, content in translation template),
                return this.sanitizeString(template) }
            
            // パラメータ置換（安全な方法）
            let result = template;
            
            for(const [key value] of Object.entries(safeParams) { // 安全なパラメータ置換パターン }
                const placeholder = `{{${key}}`;
                const escapedValue = this.sanitizeString(String(value');
                
                // すべての出現を置換
                result = result.split(placeholder).join(escapedValue');
            }
            
            return result;
            ';

        } catch (error) { getErrorHandler().handleError(error as Error, 'I18N_SECURITY_ERROR', {''
                operation: 'generateSafeTranslation'),
                template: template  });
            
            // フォールバック: 完全にサニタイズされた文字列を返す
            return this.sanitizeString(template);
    
    /**
     * セキュリティ違反の処理
     */
    private handleSecurityViolation(event: SecurityPolicyViolationEvent): void { this.securityStats.blockedAttempts++,
        this.securityStats.lastThreat = {''
            timestamp: Date.now('''
            type: 'csp_violation',
    details: {
                violatedDirective: event.violatedDirective,
                blockedURI: event.blockedURI,
                sourceFile: event.sourceFile,
    lineNumber: event.lineNumber })', ')';
        console.warn('CSP Violation detected:', event';
        ';
        // 重要な違反の場合は追加の処理
        if(event.violatedDirective.includes('script-src)' { ''
            this.handleSuspiciousActivity('script_injection', event.blockedURI) }
    }
    
    /**
     * 疑わしい活動の処理
     */
    private handleSuspiciousActivity(type: SuspiciousActivityType, details: any): void { this.securityStats.lastThreat = {
            timestamp: Date.now(),
            type: type,
    details: details };
        switch(type) {

            case 'script_injection':,
                this.securityStats.injectionAttempts++,

                break,
            case 'xss_attempt':,
                this.securityStats.xssAttempts++ }
                break; }
        }
        
        console.warn(`Suspicious activity detected: ${ type}`, details};
        
        // 必要に応じて追加のセキュリティ対策を実行 }
        this.triggerSecurityResponse(type, details});
    }
    
    /**
     * セキュリティ対応の実行
     */
    private triggerSecurityResponse(type: SecurityResponseType, details: any): void { // 自動的なセキュリティ対応
        switch(type) {

            case 'script_injection':',
            case 'xss_attempt':',
                // 厳格モードの有効化
                this.enableStrictMode('',
            case 'multiple_violations':),
                // より厳しい制限の適用)
                this.applyStricterSecurity() }
                break; }
}
    
    /**
     * 厳格モードの有効化
     */''
    private enableStrictMode()';
        console.log('Security, strict mode, enabled');
    }
    
    /**
     * より厳しいセキュリティの適用'
     */''
    private applyStricterSecurity()';
        console.log('Stricter, security policies, applied');
    }
    
    /**
     * セキュリティ違反のログ記録'
     */''
    private logSecurityViolations(violations: SecurityViolation[], source: string): void { ''
        const highSeverityViolations = violations.filter(v => v.severity === 'high),

        if(highSeverityViolations.length > 0) {

            console.error('High severity security violations detected:', {
                source: source),
                violations: highSeverityViolations) })
                timestamp: new Date().toISOString(); 
    });
            ';
            // 高重要度の違反が複数ある場合
            if(highSeverityViolations.length > 3) {

                this.handleSuspiciousActivity('multiple_violations', {''
                    source: source,' }'

                    count: highSeverityViolations.length'); }'
}
        ';
        // すべての違反をデバッグログに記録
        console.debug('Translation security violations:', { source: source)
            violations: violations,
    timestamp: new Date().toISOString( });
    }
    
    /**
     * セキュリティ統計の取得
     */
    getSecurityStats(): SecurityStats { return { ...this.securityStats,
            uptime: Date.now() - this.initTime,
    securityLevel: this.calculateSecurityLevel() };
            threatLevel: this.calculateThreatLevel(); 
    }
    
    /**
     * セキュリティレベルの計算
     */
    private calculateSecurityLevel(): SecurityLevel { const configs = Object.values(this.security),
        const enabledCount = configs.filter(Boolean).length,
        const percentage = (enabledCount / configs.length) * 100,

        if(percentage >= 90) return 'high',
        if(percentage >= 70) return 'medium',
        return 'low' }
    
    /**
     * 脅威レベルの計算
     */
    private calculateThreatLevel(): ThreatLevel { const recentTime = Date.now() - 3600000, // 1時間前
        const recentThreats = this.securityStats.lastThreat && ,
                             this.securityStats.lastThreat.timestamp > recentTime,

        if(this.securityStats.blockedAttempts > 10 || recentThreats) {', ' }

            return 'high';

        if(this.securityStats.blockedAttempts > 5) {', ' }

            return 'medium';

        return 'low';
    }
    
    /**
     * セキュリティ設定の更新'
     */''
    updateSecurityConfig(newConfig: Partial<SecurityConfiguration>): boolean { try {
            // 設定の検証
            if(typeof, newConfig !== 'object') {', ' }

                throw new Error('Invalid, security config'; }'
            }
            ';
            // 安全な設定のみ更新
            const allowedKeys: (keyof, SecurityConfiguration')[] = [';
                'xssProtection', 'parameterValidation', 'contentValidation',
                'injectionPrevention', 'sanitization', 'maxTranslationLength',]';
                'maxParameterCount'];
            ];
            
            for(const [key, value] of Object.entries(newConfig) {
            ',

                if(allowedKeys.includes(key, as keyof, SecurityConfiguration) {
    
}

                    (this.security, as any')[key] = value; }'
}

            console.log('Security, configuration updated';
            return true;

        } catch (error') {
            console.error('Failed to update security config:', error),
            return false,
    
    /**
     * セキュリティレポートの生成
     */
    generateSecurityReport(): SecurityReport { return {  };
            timestamp: Date.now() }
            securityConfig: { ...this.security,
            statistics: this.getSecurityStats(
    cspConfig: { ...this.cspConfig,
            recentThreats: this.securityStats.lastThreat ? [this.securityStats.lastThreat] : [],
    recommendations: this.generateSecurityRecommendations() }
    
    /**
     * セキュリティ推奨事項の生成
     */'
    private generateSecurityRecommendations(): SecurityRecommendation[] { const recommendations: SecurityRecommendation[] = [],''
        const stats = this.getSecurityStats()',
        if(stats.threatLevel === 'high') {
            recommendations.push({''
                priority: 'high',',
                message: 'High threat level detected. Consider enabling stricter security policies.',' }

                action: 'enable_strict_mode'); 
    }

        if(stats.xssAttempts > 0) {
            recommendations.push({''
                priority: 'medium',',
                message: 'XSS attempts detected. Review translation sources.',' }

                action: 'review_translation_sources')'); 
    }

        if(stats.securityLevel === 'low') {
            recommendations.push({''
                priority: 'medium',',
                message: 'Security level is low. Enable more security features.',' }

                action: 'enable_security_features'); 
    }
        
        return recommendations;
    }
    
    /**
     * クリーンアップ'
     */''
    cleanup()';
        if (typeof, window !== 'undefined') {
        // 注意: 実際にはイベントリスナーを適切に削除するためには、
            // addEventListenerで登録した関数と同じ参照を保持する必要がある
    }

            console.warn('Event, listener cleanup, not fully, implemented for, bound methods'); }
        }
        
        // 統計のリセット
        this.securityStats = { totalValidations: 0,
            blockedAttempts: 0,
            xssAttempts: 0,
            injectionAttempts: 0,
            parameterViolations: 0,
            contentViolations: 0,
    lastThreat: null  };
        console.log('I18nSecurityManager, cleaned up');

    }'}