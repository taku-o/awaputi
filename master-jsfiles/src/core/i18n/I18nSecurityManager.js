/**
 * 国際化セキュリティ管理システム
 * 
 * 翻訳データのセキュリティ検証、XSS攻撃防止、
 * 安全な翻訳パラメータ処理を提供
 */

import { getErrorHandler } from '../../utils/ErrorHandler.js';

export class I18nSecurityManager {
    constructor() {
        // セキュリティ設定
        this.security = {
            xssProtection: true,           // XSS保護
            parameterValidation: true,     // パラメータ検証
            contentValidation: true,       // コンテンツ検証
            injectionPrevention: true,     // インジェクション防止
            sanitization: true,            // サニタイゼーション
            trustedDomains: [],           // 信頼できるドメイン
            maxTranslationLength: 10000,   // 最大翻訳長
            maxParameterCount: 50          // 最大パラメータ数
        };
        
        // セキュリティルール
        this.securityRules = {
            // 危険なHTMLタグ
            forbiddenTags: [
                'script', 'iframe', 'object', 'embed', 'form', 'input',
                'button', 'textarea', 'select', 'option', 'link', 'meta',
                'base', 'style', 'title', 'head', 'html', 'body'
            ],
            
            // 危険な属性
            forbiddenAttributes: [
                'onload', 'onerror', 'onclick', 'onmouseover', 'onmouseout',
                'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset',
                'javascript:', 'vbscript:', 'data:', 'file:', 'ftp:'
            ],
            
            // 危険な文字列パターン
            suspiciousPatterns: [
                /<script[^>]*>.*?<\/script>/gi,
                /javascript:/gi,
                /vbscript:/gi,
                /on\w+\s*=/gi,
                /expression\s*\(/gi,
                /eval\s*\(/gi,
                /document\s*\./gi,
                /window\s*\./gi,
                /<iframe[^>]*>/gi,
                /<object[^>]*>/gi,
                /<embed[^>]*>/gi
            ],
            
            // 許可されたHTMLタグ（翻訳で使用可能）
            allowedTags: [
                'b', 'i', 'u', 'strong', 'em', 'span', 'div', 'p',
                'br', 'small', 'mark', 'del', 'ins', 'sub', 'sup'
            ],
            
            // 許可された属性
            allowedAttributes: [
                'class', 'id', 'style', 'title', 'alt', 'href', 'target',
                'rel', 'data-*'
            ]
        };
        
        // セキュリティ統計
        this.securityStats = {
            totalValidations: 0,
            blockedAttempts: 0,
            xssAttempts: 0,
            injectionAttempts: 0,
            parameterViolations: 0,
            contentViolations: 0,
            lastThreat: null
        };
        
        // CSP設定
        this.cspConfig = {
            'default-src': "'self'",
            'script-src': "'self' 'unsafe-inline'",
            'style-src': "'self' 'unsafe-inline' https://fonts.googleapis.com",
            'img-src': "'self' data: https:",
            'font-src': "'self' data: https: https://fonts.gstatic.com",
            'connect-src': "'self'",
            'object-src': "'none'",
            'base-uri': "'self'",
            'form-action': "'self'"
        };
        
        // 初期化
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        // CSPヘッダーの設定
        this.setupCSP();
        
        // セキュリティイベントリスナーの設定
        this.setupSecurityEventListeners();
        
        console.log('I18nSecurityManager initialized');
    }
    
    /**
     * CSP（Content Security Policy）の設定
     */
    setupCSP() {
        try {
            if (typeof document !== 'undefined') {
                // CSPメタタグが存在しない場合は作成
                let cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
                if (!cspMeta) {
                    cspMeta = document.createElement('meta');
                    cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
                    document.head.appendChild(cspMeta);
                }
                
                // CSP文字列を生成
                const cspValue = Object.entries(this.cspConfig)
                    .map(([directive, value]) => `${directive} ${value}`)
                    .join('; ');
                
                cspMeta.setAttribute('content', cspValue);
                console.log('CSP configured:', cspValue);
            }
        } catch (error) {
            console.warn('Failed to setup CSP:', error);
        }
    }
    
    /**
     * セキュリティイベントリスナーの設定
     */
    setupSecurityEventListeners() {
        if (typeof window !== 'undefined') {
            // セキュリティ違反の監視
            window.addEventListener('securitypolicyviolation', (event) => {
                this.handleSecurityViolation(event);
            });
            
            // エラーイベントの監視
            window.addEventListener('error', (event) => {
                if (event.message && this.containsSuspiciousContent(event.message)) {
                    this.handleSuspiciousActivity('error_message', event.message);
                }
            });
        }
    }
    
    /**
     * 翻訳データのセキュリティ検証
     */
    validateTranslationData(data, source = 'unknown') {
        this.securityStats.totalValidations++;
        
        try {
            const violations = [];
            
            // データ型チェック
            if (typeof data !== 'object' || data === null) {
                violations.push({
                    type: 'invalid_data_type',
                    message: 'Translation data must be an object',
                    severity: 'high'
                });
                return { isValid: false, violations };
            }
            
            // 再帰的にオブジェクトを検証
            const validateObject = (obj, path = '') => {
                for (const [key, value] of Object.entries(obj)) {
                    const currentPath = path ? `${path}.${key}` : key;
                    
                    // キーの検証
                    if (!this.validateTranslationKey(key)) {
                        violations.push({
                            type: 'invalid_key',
                            path: currentPath,
                            message: `Invalid translation key: ${key}`,
                            severity: 'medium'
                        });
                    }
                    
                    if (typeof value === 'string') {
                        // 文字列値の検証
                        const stringViolations = this.validateTranslationString(value, currentPath);
                        violations.push(...stringViolations);
                    } else if (typeof value === 'object' && value !== null) {
                        // ネストしたオブジェクトの検証
                        validateObject(value, currentPath);
                    } else if (!Array.isArray(value)) {
                        violations.push({
                            type: 'invalid_value_type',
                            path: currentPath,
                            message: `Invalid value type at ${currentPath}`,
                            severity: 'medium'
                        });
                    }
                }
            };
            
            validateObject(data);
            
            // 違反がある場合はログに記録
            if (violations.length > 0) {
                this.logSecurityViolations(violations, source);
                this.securityStats.contentViolations += violations.length;
            }
            
            return {
                isValid: violations.length === 0,
                violations,
                source
            };
            
        } catch (error) {
            getErrorHandler().handleError(error, 'I18N_SECURITY_ERROR', {
                operation: 'validateTranslationData',
                source: source
            });
            
            return {
                isValid: false,
                violations: [{
                    type: 'validation_error',
                    message: error.message,
                    severity: 'high'
                }]
            };
        }
    }
    
    /**
     * 翻訳キーの検証
     */
    validateTranslationKey(key) {
        // 基本的な文字制限
        const keyPattern = /^[a-zA-Z0-9._-]+$/;
        
        // 長さ制限
        if (key.length > 200) {
            console.log(`I18nSecurityManager: Key too long: ${key} (${key.length} characters)`);
            return false;
        }
        
        // パターンマッチング
        if (!keyPattern.test(key)) {
            console.log(`I18nSecurityManager: Invalid characters in key: ${key}`);
            return false;
        }
        
        // 危険なパターンのチェック（より精密に）
        const dangerousPatterns = [
            '__proto__', 'constructor', 'prototype',
            'eval', 'function'
        ];
        
        // 危険な'script'パターンのチェック（正当なキーワードを除外）
        // 'description', 'screenReader', 'subscript' などの正当なキーワードに含まれるscriptは許可
        // scriptが独立した単語として使われている場合のみ危険とみなす
        const lowercaseKey = key.toLowerCase();
        
        // 正当なscriptを含むパターン（許可する）
        const legitimateScriptPatterns = [
            'description', 'descriptions', 'screenreader', 'subscript', 'manuscript',
            'transcript', 'postscript', 'javascript'  // javascriptも正当な用途
        ];
        
        // 正当なパターンに該当する場合は許可
        const isLegitimateScriptUsage = legitimateScriptPatterns.some(pattern => 
            lowercaseKey.includes(pattern)
        );
        
        // 独立したscript（危険）- ドット、アンダースコア、ハイフンで区切られた場合のみ
        const dangerousScriptPattern = /(?:^|[._-])script(?:[._-]|$)/i;
        const hasScript = !isLegitimateScriptUsage && dangerousScriptPattern.test(key);
        
        const hasOtherDangerousPatterns = dangerousPatterns.some(pattern => 
            key.toLowerCase().includes(pattern)
        );
        
        return !(hasScript || hasOtherDangerousPatterns);
    }
    
    /**
     * 翻訳文字列の検証
     */
    validateTranslationString(str, path = '') {
        const violations = [];
        
        // 長さ制限
        if (str.length > this.security.maxTranslationLength) {
            violations.push({
                type: 'content_too_long',
                path: path,
                message: `Translation content exceeds maximum length: ${str.length}`,
                severity: 'medium'
            });
        }
        
        // 危険なコンテンツのチェック
        if (this.containsSuspiciousContent(str)) {
            violations.push({
                type: 'suspicious_content',
                path: path,
                message: 'Translation contains potentially dangerous content',
                severity: 'high'
            });
            this.securityStats.xssAttempts++;
        }
        
        // HTMLタグのチェック
        const htmlViolations = this.validateHTMLContent(str, path);
        violations.push(...htmlViolations);
        
        return violations;
    }
    
    /**
     * 疑わしいコンテンツの検出
     */
    containsSuspiciousContent(content) {
        if (typeof content !== 'string') {
            return false;
        }
        
        // 危険なパターンのチェック
        return this.securityRules.suspiciousPatterns.some(pattern => 
            pattern.test(content)
        );
    }
    
    /**
     * HTMLコンテンツの検証
     */
    validateHTMLContent(content, path = '') {
        const violations = [];
        
        // HTMLタグの検出
        const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi;
        let match;
        
        while ((match = tagPattern.exec(content)) !== null) {
            const tagName = match[1].toLowerCase();
            
            // 禁止されたタグのチェック
            if (this.securityRules.forbiddenTags.includes(tagName)) {
                violations.push({
                    type: 'forbidden_html_tag',
                    path: path,
                    message: `Forbidden HTML tag found: ${tagName}`,
                    severity: 'high',
                    details: { tag: tagName, fullMatch: match[0] }
                });
            }
            
            // 許可されていないタグのチェック
            else if (!this.securityRules.allowedTags.includes(tagName)) {
                violations.push({
                    type: 'unknown_html_tag',
                    path: path,
                    message: `Unknown HTML tag found: ${tagName}`,
                    severity: 'medium',
                    details: { tag: tagName, fullMatch: match[0] }
                });
            }
        }
        
        // 危険な属性のチェック
        this.securityRules.forbiddenAttributes.forEach(attr => {
            const attrPattern = new RegExp(attr, 'gi');
            if (attrPattern.test(content)) {
                violations.push({
                    type: 'forbidden_html_attribute',
                    path: path,
                    message: `Forbidden HTML attribute found: ${attr}`,
                    severity: 'high',
                    details: { attribute: attr }
                });
            }
        });
        
        return violations;
    }
    
    /**
     * 翻訳パラメータの安全な処理
     */
    sanitizeTranslationParameters(params) {
        if (!params || typeof params !== 'object') {
            return {};
        }
        
        this.securityStats.totalValidations++;
        
        const sanitizedParams = {};
        let paramCount = 0;
        
        for (const [key, value] of Object.entries(params)) {
            // パラメータ数制限
            if (paramCount >= this.security.maxParameterCount) {
                this.securityStats.parameterViolations++;
                console.warn(`Parameter count limit exceeded: ${paramCount}`);
                break;
            }
            
            // キーの検証
            if (!this.validateParameterKey(key)) {
                this.securityStats.parameterViolations++;
                console.warn(`Invalid parameter key: ${key}`);
                continue;
            }
            
            // 値のサニタイゼーション
            const sanitizedValue = this.sanitizeParameterValue(value);
            if (sanitizedValue !== null) {
                sanitizedParams[key] = sanitizedValue;
                paramCount++;
            } else {
                this.securityStats.parameterViolations++;
                console.warn(`Invalid parameter value for key: ${key}`);
            }
        }
        
        return sanitizedParams;
    }
    
    /**
     * パラメータキーの検証
     */
    validateParameterKey(key) {
        // 基本的な制限
        if (typeof key !== 'string' || key.length === 0 || key.length > 100) {
            return false;
        }
        
        // パターンマッチング
        const keyPattern = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
        return keyPattern.test(key);
    }
    
    /**
     * パラメータ値のサニタイゼーション
     */
    sanitizeParameterValue(value) {
        // 基本型のチェック
        if (value === null || value === undefined) {
            return '';
        }
        
        // 文字列化
        let strValue = String(value);
        
        // 長さ制限
        if (strValue.length > 1000) {
            strValue = strValue.substring(0, 1000);
        }
        
        // 危険なコンテンツのチェック
        if (this.containsSuspiciousContent(strValue)) {
            return this.sanitizeString(strValue);
        }
        
        return strValue;
    }
    
    /**
     * 文字列のサニタイゼーション
     */
    sanitizeString(str) {
        if (typeof str !== 'string') {
            return '';
        }
        
        // HTMLエンティティのエスケープ
        const entityMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };
        
        return str.replace(/[&<>"'`=\/]/g, (s) => entityMap[s]);
    }
    
    /**
     * 安全な翻訳文字列の生成
     */
    generateSafeTranslation(template, params = {}) {
        try {
            // パラメータのサニタイゼーション
            const safeParams = this.sanitizeTranslationParameters(params);
            
            // テンプレート文字列のセキュリティチェック
            if (this.containsSuspiciousContent(template)) {
                console.warn('Suspicious content in translation template');
                return this.sanitizeString(template);
            }
            
            // パラメータ置換（安全な方法）
            let result = template;
            
            for (const [key, value] of Object.entries(safeParams)) {
                // 安全なパラメータ置換パターン
                const placeholder = `{{${key}}}`;
                const escapedValue = this.sanitizeString(String(value));
                
                // すべての出現を置換
                result = result.split(placeholder).join(escapedValue);
            }
            
            return result;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'I18N_SECURITY_ERROR', {
                operation: 'generateSafeTranslation',
                template: template
            });
            
            // フォールバック: 完全にサニタイズされた文字列を返す
            return this.sanitizeString(template);
        }
    }
    
    /**
     * セキュリティ違反の処理
     */
    handleSecurityViolation(event) {
        this.securityStats.blockedAttempts++;
        this.securityStats.lastThreat = {
            timestamp: Date.now(),
            type: 'csp_violation',
            details: {
                violatedDirective: event.violatedDirective,
                blockedURI: event.blockedURI,
                sourceFile: event.sourceFile,
                lineNumber: event.lineNumber
            }
        };
        
        console.warn('CSP Violation detected:', event);
        
        // 重要な違反の場合は追加の処理
        if (event.violatedDirective.includes('script-src')) {
            this.handleSuspiciousActivity('script_injection', event.blockedURI);
        }
    }
    
    /**
     * 疑わしい活動の処理
     */
    handleSuspiciousActivity(type, details) {
        this.securityStats.lastThreat = {
            timestamp: Date.now(),
            type: type,
            details: details
        };
        
        switch (type) {
            case 'script_injection':
                this.securityStats.injectionAttempts++;
                break;
            case 'xss_attempt':
                this.securityStats.xssAttempts++;
                break;
        }
        
        console.warn(`Suspicious activity detected: ${type}`, details);
        
        // 必要に応じて追加のセキュリティ対策を実行
        this.triggerSecurityResponse(type, details);
    }
    
    /**
     * セキュリティ対応の実行
     */
    triggerSecurityResponse(type, details) {
        // 自動的なセキュリティ対応
        switch (type) {
            case 'script_injection':
            case 'xss_attempt':
                // 厳格モードの有効化
                this.enableStrictMode();
                break;
                
            case 'multiple_violations':
                // より厳しい制限の適用
                this.applyStricterSecurity();
                break;
        }
    }
    
    /**
     * 厳格モードの有効化
     */
    enableStrictMode() {
        this.security.xssProtection = true;
        this.security.parameterValidation = true;
        this.security.contentValidation = true;
        this.security.injectionPrevention = true;
        this.security.sanitization = true;
        
        console.log('Security strict mode enabled');
    }
    
    /**
     * より厳しいセキュリティの適用
     */
    applyStricterSecurity() {
        this.security.maxTranslationLength = 5000;
        this.security.maxParameterCount = 25;
        
        console.log('Stricter security policies applied');
    }
    
    /**
     * セキュリティ違反のログ記録
     */
    logSecurityViolations(violations, source) {
        const highSeverityViolations = violations.filter(v => v.severity === 'high');
        
        if (highSeverityViolations.length > 0) {
            console.error('High severity security violations detected:', {
                source: source,
                violations: highSeverityViolations,
                timestamp: new Date().toISOString()
            });
            
            // 高重要度の違反が複数ある場合
            if (highSeverityViolations.length > 3) {
                this.handleSuspiciousActivity('multiple_violations', {
                    source: source,
                    count: highSeverityViolations.length
                });
            }
        }
        
        // すべての違反をデバッグログに記録
        console.debug('Translation security violations:', {
            source: source,
            violations: violations,
            timestamp: new Date().toISOString()
        });
    }
    
    /**
     * セキュリティ統計の取得
     */
    getSecurityStats() {
        return {
            ...this.securityStats,
            uptime: Date.now() - (this.initTime || Date.now()),
            securityLevel: this.calculateSecurityLevel(),
            threatLevel: this.calculateThreatLevel()
        };
    }
    
    /**
     * セキュリティレベルの計算
     */
    calculateSecurityLevel() {
        const configs = Object.values(this.security);
        const enabledCount = configs.filter(Boolean).length;
        const percentage = (enabledCount / configs.length) * 100;
        
        if (percentage >= 90) return 'high';
        if (percentage >= 70) return 'medium';
        return 'low';
    }
    
    /**
     * 脅威レベルの計算
     */
    calculateThreatLevel() {
        const recentTime = Date.now() - 3600000; // 1時間前
        const recentThreats = this.securityStats.lastThreat && 
                             this.securityStats.lastThreat.timestamp > recentTime;
        
        if (this.securityStats.blockedAttempts > 10 || recentThreats) {
            return 'high';
        }
        
        if (this.securityStats.blockedAttempts > 5) {
            return 'medium';
        }
        
        return 'low';
    }
    
    /**
     * セキュリティ設定の更新
     */
    updateSecurityConfig(newConfig) {
        try {
            // 設定の検証
            if (typeof newConfig !== 'object') {
                throw new Error('Invalid security config');
            }
            
            // 安全な設定のみ更新
            const allowedKeys = [
                'xssProtection', 'parameterValidation', 'contentValidation',
                'injectionPrevention', 'sanitization', 'maxTranslationLength',
                'maxParameterCount'
            ];
            
            for (const [key, value] of Object.entries(newConfig)) {
                if (allowedKeys.includes(key)) {
                    this.security[key] = value;
                }
            }
            
            console.log('Security configuration updated');
            return true;
            
        } catch (error) {
            console.error('Failed to update security config:', error);
            return false;
        }
    }
    
    /**
     * セキュリティレポートの生成
     */
    generateSecurityReport() {
        return {
            timestamp: Date.now(),
            securityConfig: { ...this.security },
            statistics: this.getSecurityStats(),
            cspConfig: { ...this.cspConfig },
            recentThreats: this.securityStats.lastThreat ? [this.securityStats.lastThreat] : [],
            recommendations: this.generateSecurityRecommendations()
        };
    }
    
    /**
     * セキュリティ推奨事項の生成
     */
    generateSecurityRecommendations() {
        const recommendations = [];
        const stats = this.getSecurityStats();
        
        if (stats.threatLevel === 'high') {
            recommendations.push({
                priority: 'high',
                message: 'High threat level detected. Consider enabling stricter security policies.',
                action: 'enable_strict_mode'
            });
        }
        
        if (stats.xssAttempts > 0) {
            recommendations.push({
                priority: 'medium',
                message: 'XSS attempts detected. Review translation sources.',
                action: 'review_translation_sources'
            });
        }
        
        if (stats.securityLevel === 'low') {
            recommendations.push({
                priority: 'medium',
                message: 'Security level is low. Enable more security features.',
                action: 'enable_security_features'
            });
        }
        
        return recommendations;
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        // イベントリスナーの削除
        if (typeof window !== 'undefined') {
            window.removeEventListener('securitypolicyviolation', this.handleSecurityViolation);
            window.removeEventListener('error', this.handleSuspiciousActivity);
        }
        
        // 統計のリセット
        this.securityStats = {
            totalValidations: 0,
            blockedAttempts: 0,
            xssAttempts: 0,
            injectionAttempts: 0,
            parameterViolations: 0,
            contentViolations: 0,
            lastThreat: null
        };
        
        console.log('I18nSecurityManager cleaned up');
    }
}