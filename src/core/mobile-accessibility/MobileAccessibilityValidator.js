/**
 * Mobile Accessibility Validator
 * モバイルアクセシビリティ検証専用クラス
 * WCAG 2.1 AA準拠の検証機能を提供
 */

export class MobileAccessibilityValidator {
    constructor(mobileAccessibilityManager) {
        this.mobileAccessibilityManager = mobileAccessibilityManager;
        
        // 検証設定
        this.validationConfig = {
            wcagLevel: 'AA', // A, AA, AAA
            checkContrast: true,
            checkKeyboard: true,
            checkScreenReader: true,
            checkMobile: true,
            checkTiming: true
        };
        
        // 検証ルール
        this.validationRules = {
            contrast: {
                normal: 4.5,
                large: 3.0,
                enhanced: 7.0
            },
            timing: {
                minActionTime: 20000, // 20秒
                maxSessionTime: 1200000 // 20分
            },
            touch: {
                minTargetSize: 44, // 44px
                minSpacing: 8 // 8px
            },
            keyboard: {
                requiredKeys: ['Tab', 'Enter', 'Escape', 'Space'],
                navigationKeys: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
            }
        };
        
        // 検証結果
        this.validationResults = {
            overall: 'pending', // 'pass', 'fail', 'warning', 'pending'
            issues: [],
            suggestions: [],
            score: 0,
            maxScore: 100
        };
        
        // 要素キャッシュ
        this.elementCache = new Map();
        this.lastValidation = null;
    }
    
    /**
     * 完全アクセシビリティ検証
     */
    async validateMobileAccessibility() {
        console.log('[MobileAccessibilityValidator] 完全アクセシビリティ検証開始');
        
        this.resetValidationResults();
        
        const validations = [
            this.validateContrastRatio(),
            this.validateKeyboardAccessibility(),
            this.validateScreenReaderSupport(),
            this.validateTouchTargets(),
            this.validateMobileSpecific(),
            this.validateTimingRequirements()
        ];
        
        const results = await Promise.allSettled(validations);
        
        // 結果を統合
        this.processValidationResults(results);
        
        // 総合評価を計算
        this.calculateOverallScore();
        
        // 改善提案を生成
        this.generateAccessibilitySuggestions();
        
        this.lastValidation = Date.now();
        
        console.log('[MobileAccessibilityValidator] 完全アクセシビリティ検証完了', this.validationResults);
        return this.validationResults;
    }
    
    /**
     * WCAG準拠チェック
     */
    async checkWCAGCompliance(level = 'AA') {
        console.log(`[MobileAccessibilityValidator] WCAG ${level} 準拠チェック開始`);
        
        this.validationConfig.wcagLevel = level;
        
        const wcagChecks = {
            // レベルA
            A: [
                this.checkImageAlternatives(),
                this.checkNonTextContent(),
                this.checkKeyboardAccess(),
                this.checkNoSeizureContent(),
                this.checkSkipLinks()
            ],
            // レベルAA
            AA: [
                this.checkColorContrast(),
                this.checkTextResize(),
                this.checkKeyboardNavigation(),
                this.checkFocusVisible(),
                this.checkTouchTargetSize()
            ],
            // レベルAAA
            AAA: [
                this.checkEnhancedContrast(),
                this.checkContextHelp(),
                this.checkErrorSuggestions(),
                this.checkTimingExtensions()
            ]
        };
        
        // 指定レベルまでのチェックを実行
        const checksToRun = [];
        if (level === 'A' || level === 'AA' || level === 'AAA') {
            checksToRun.push(...wcagChecks.A);
        }
        if (level === 'AA' || level === 'AAA') {
            checksToRun.push(...wcagChecks.AA);
        }
        if (level === 'AAA') {
            checksToRun.push(...wcagChecks.AAA);
        }
        
        const results = await Promise.allSettled(checksToRun);
        
        const complianceReport = {
            level,
            passed: 0,
            failed: 0,
            warnings: 0,
            issues: [],
            timestamp: Date.now()
        };
        
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const checkResult = result.value;
                if (checkResult.status === 'pass') {
                    complianceReport.passed++;
                } else if (checkResult.status === 'fail') {
                    complianceReport.failed++;
                    complianceReport.issues.push(checkResult);
                } else if (checkResult.status === 'warning') {
                    complianceReport.warnings++;
                    complianceReport.issues.push(checkResult);
                }
            }
        });
        
        complianceReport.compliance = complianceReport.failed === 0 ? 'compliant' : 'non-compliant';
        
        console.log(`[MobileAccessibilityValidator] WCAG ${level} 準拠チェック完了`, complianceReport);
        return complianceReport;
    }
    
    /**
     * 検証レポート生成
     */
    generateValidationReport(options = {}) {
        const report = {
            metadata: {
                timestamp: Date.now(),
                validator: 'MobileAccessibilityValidator',
                version: '1.0.0',
                wcagLevel: this.validationConfig.wcagLevel,
                userAgent: navigator.userAgent
            },
            summary: {
                overall: this.validationResults.overall,
                score: this.validationResults.score,
                maxScore: this.validationResults.maxScore,
                issueCount: this.validationResults.issues.length,
                suggestionCount: this.validationResults.suggestions.length
            },
            results: {
                issues: this.formatIssues(this.validationResults.issues),
                suggestions: this.formatSuggestions(this.validationResults.suggestions)
            },
            categories: this.categorizeValidationResults(),
            deviceInfo: this.getDeviceAccessibilityInfo(),
            capabilities: this.mobileAccessibilityManager.capabilities
        };
        
        if (options.includeElementDetails) {
            report.elementDetails = this.getElementAccessibilityDetails();
        }
        
        if (options.includeRecommendations) {
            report.recommendations = this.generateDetailedRecommendations();
        }
        
        return report;
    }
    
    /**
     * コントラスト比検証
     */
    async validateContrastRatio() {
        const issues = [];
        const elements = document.querySelectorAll('*');
        
        for (const element of elements) {
            const style = getComputedStyle(element);
            const backgroundColor = style.backgroundColor;
            const textColor = style.color;
            
            if (this.isVisibleElement(element) && this.hasText(element)) {
                const contrastRatio = this.calculateContrastRatio(backgroundColor, textColor);
                const requiredRatio = this.getRequiredContrastRatio(element);
                
                if (contrastRatio < requiredRatio) {
                    issues.push({
                        type: 'contrast',
                        severity: 'error',
                        element: this.getElementSelector(element),
                        current: contrastRatio.toFixed(2),
                        required: requiredRatio,
                        wcagReference: '1.4.3'
                    });
                }
            }
        }
        
        return {
            category: 'contrast',
            status: issues.length === 0 ? 'pass' : 'fail',
            issues,
            checkedElements: elements.length
        };
    }
    
    /**
     * キーボードアクセシビリティ検証
     */
    async validateKeyboardAccessibility() {
        const issues = [];
        const interactiveElements = this.getInteractiveElements();
        
        // フォーカス可能性チェック
        interactiveElements.forEach(element => {
            if (!this.isKeyboardFocusable(element)) {
                issues.push({
                    type: 'keyboard-focus',
                    severity: 'error',
                    element: this.getElementSelector(element),
                    issue: 'Interactive element is not keyboard focusable',
                    wcagReference: '2.1.1'
                });
            }
            
            // フォーカスインジケーターチェック
            if (!this.hasFocusIndicator(element)) {
                issues.push({
                    type: 'focus-indicator',
                    severity: 'warning',
                    element: this.getElementSelector(element),
                    issue: 'No visible focus indicator',
                    wcagReference: '2.4.7'
                });
            }
        });
        
        // Tab順序チェック
        const tabOrderIssues = this.validateTabOrder();
        issues.push(...tabOrderIssues);
        
        // キーボードトラップチェック
        const trapIssues = this.validateKeyboardTraps();
        issues.push(...trapIssues);
        
        return {
            category: 'keyboard',
            status: issues.length === 0 ? 'pass' : 'fail',
            issues,
            checkedElements: interactiveElements.length
        };
    }
    
    /**
     * スクリーンリーダーサポート検証
     */
    async validateScreenReaderSupport() {
        const issues = [];
        
        // ARIA属性チェック
        const ariaIssues = this.validateARIAAttributes();
        issues.push(...ariaIssues);
        
        // ランドマークチェック
        const landmarkIssues = this.validateLandmarks();
        issues.push(...landmarkIssues);
        
        // ヘディング構造チェック
        const headingIssues = this.validateHeadingStructure();
        issues.push(...headingIssues);
        
        // ライブリージョンチェック
        const liveRegionIssues = this.validateLiveRegions();
        issues.push(...liveRegionIssues);
        
        return {
            category: 'screen-reader',
            status: issues.length === 0 ? 'pass' : 'fail',
            issues,
            totalChecks: ariaIssues.length + landmarkIssues.length + headingIssues.length + liveRegionIssues.length
        };
    }
    
    /**
     * タッチターゲット検証
     */
    async validateTouchTargets() {
        const issues = [];
        const touchElements = this.getTouchableElements();
        
        touchElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const size = Math.min(rect.width, rect.height);
            
            if (size < this.validationRules.touch.minTargetSize) {
                issues.push({
                    type: 'touch-target-size',
                    severity: 'error',
                    element: this.getElementSelector(element),
                    currentSize: size,
                    requiredSize: this.validationRules.touch.minTargetSize,
                    wcagReference: '2.5.5'
                });
            }
            
            // タッチターゲット間隔チェック
            const spacingIssues = this.validateTouchTargetSpacing(element, touchElements);
            issues.push(...spacingIssues);
        });
        
        return {
            category: 'touch-targets',
            status: issues.length === 0 ? 'pass' : 'fail',
            issues,
            checkedElements: touchElements.length
        };
    }
    
    /**
     * モバイル固有検証
     */
    async validateMobileSpecific() {
        const issues = [];
        
        // ビューポート設定チェック
        const viewportIssues = this.validateViewportSettings();
        issues.push(...viewportIssues);
        
        // オリエンテーション対応チェック
        const orientationIssues = this.validateOrientationSupport();
        issues.push(...orientationIssues);
        
        // タッチジェスチャーチェック
        const gestureIssues = this.validateGestureAlternatives();
        issues.push(...gestureIssues);
        
        // モバイル入力方式チェック
        const inputIssues = this.validateMobileInputMethods();
        issues.push(...inputIssues);
        
        return {
            category: 'mobile-specific',
            status: issues.length === 0 ? 'pass' : 'fail',
            issues,
            totalChecks: viewportIssues.length + orientationIssues.length + gestureIssues.length + inputIssues.length
        };
    }
    
    /**
     * タイミング要件検証
     */
    async validateTimingRequirements() {
        const issues = [];
        
        // セッションタイムアウトチェック
        if (this.hasSessionTimeout()) {
            const timeoutWarning = this.validateSessionTimeout();
            if (timeoutWarning) issues.push(timeoutWarning);
        }
        
        // 自動再生コンテンツチェック
        const autoplayIssues = this.validateAutoplayContent();
        issues.push(...autoplayIssues);
        
        // 点滅・動きコンテンツチェック
        const motionIssues = this.validateMotionContent();
        issues.push(...motionIssues);
        
        return {
            category: 'timing',
            status: issues.length === 0 ? 'pass' : 'fail',
            issues,
            totalChecks: 3
        };
    }
    
    /**
     * WCAG レベルA チェック項目
     */
    async checkImageAlternatives() {
        const issues = [];
        const images = document.querySelectorAll('img, svg, canvas');
        
        images.forEach(img => {
            if (!img.alt && !img.getAttribute('aria-label') && !img.getAttribute('aria-labelledby')) {
                issues.push({
                    type: 'missing-alt',
                    severity: 'error',
                    element: this.getElementSelector(img),
                    wcagReference: '1.1.1'
                });
            }
        });
        
        return { status: issues.length === 0 ? 'pass' : 'fail', issues };
    }
    
    async checkNonTextContent() {
        const issues = [];
        const mediaElements = document.querySelectorAll('video, audio, object, embed');
        
        mediaElements.forEach(media => {
            if (!this.hasTextAlternative(media)) {
                issues.push({
                    type: 'missing-text-alternative',
                    severity: 'error',
                    element: this.getElementSelector(media),
                    wcagReference: '1.1.1'
                });
            }
        });
        
        return { status: issues.length === 0 ? 'pass' : 'fail', issues };
    }
    
    async checkKeyboardAccess() {
        const issues = [];
        const interactiveElements = this.getInteractiveElements();
        
        interactiveElements.forEach(element => {
            if (!this.isKeyboardAccessible(element)) {
                issues.push({
                    type: 'keyboard-inaccessible',
                    severity: 'error',
                    element: this.getElementSelector(element),
                    wcagReference: '2.1.1'
                });
            }
        });
        
        return { status: issues.length === 0 ? 'pass' : 'fail', issues };
    }
    
    /**
     * WCAG レベルAA チェック項目
     */
    async checkColorContrast() {
        return await this.validateContrastRatio();
    }
    
    async checkTextResize() {
        const issues = [];
        
        // 200%拡大時の可読性チェック
        const originalSize = document.documentElement.style.fontSize;
        document.documentElement.style.fontSize = '200%';
        
        const readabilityCheck = this.checkTextReadability();
        if (!readabilityCheck.readable) {
            issues.push({
                type: 'text-not-scalable',
                severity: 'error',
                wcagReference: '1.4.4',
                details: readabilityCheck.issues
            });
        }
        
        // 元のサイズに戻す
        document.documentElement.style.fontSize = originalSize;
        
        return { status: issues.length === 0 ? 'pass' : 'fail', issues };
    }
    
    async checkFocusVisible() {
        const issues = [];
        const focusableElements = this.getFocusableElements();
        
        focusableElements.forEach(element => {
            if (!this.hasFocusIndicator(element)) {
                issues.push({
                    type: 'no-focus-indicator',
                    severity: 'error',
                    element: this.getElementSelector(element),
                    wcagReference: '2.4.7'
                });
            }
        });
        
        return { status: issues.length === 0 ? 'pass' : 'fail', issues };
    }
    
    /**
     * ユーティリティメソッド
     */
    isVisibleElement(element) {
        const style = getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               element.offsetParent !== null;
    }
    
    hasText(element) {
        return element.textContent && element.textContent.trim().length > 0;
    }
    
    calculateContrastRatio(backgroundColor, textColor) {
        const bgLuminance = this.calculateLuminance(backgroundColor);
        const textLuminance = this.calculateLuminance(textColor);
        
        const lighter = Math.max(bgLuminance, textLuminance);
        const darker = Math.min(bgLuminance, textLuminance);
        
        return (lighter + 0.05) / (darker + 0.05);
    }
    
    calculateLuminance(color) {
        const rgb = this.parseColor(color);
        if (!rgb) return 0;
        
        const [r, g, b] = rgb.map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    
    parseColor(color) {
        const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
            return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
        }
        
        const hexMatch = color.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
        if (hexMatch) {
            return [
                parseInt(hexMatch[1], 16),
                parseInt(hexMatch[2], 16),
                parseInt(hexMatch[3], 16)
            ];
        }
        
        return null;
    }
    
    getRequiredContrastRatio(element) {
        const style = getComputedStyle(element);
        const fontSize = parseFloat(style.fontSize);
        const fontWeight = style.fontWeight;
        
        // 大きいテキスト（18pt以上または14pt以上で太字）は3.0、その他は4.5
        const isLargeText = fontSize >= 24 || (fontSize >= 18 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
        
        return isLargeText ? this.validationRules.contrast.large : this.validationRules.contrast.normal;
    }
    
    getInteractiveElements() {
        const selectors = [
            'button', 'input', 'select', 'textarea', 'a[href]',
            '[onclick]', '[role="button"]', '[role="link"]', '[role="menuitem"]',
            '[tabindex]:not([tabindex="-1"])', '.interactive'
        ];
        
        return Array.from(document.querySelectorAll(selectors.join(', ')))
            .filter(el => this.isVisibleElement(el));
    }
    
    isKeyboardFocusable(element) {
        return element.tabIndex >= 0 || 
               ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A'].includes(element.tagName) ||
               element.hasAttribute('contenteditable');
    }
    
    hasFocusIndicator(element) {
        const style = getComputedStyle(element, ':focus');
        return style.outline !== 'none' && style.outline !== '0' ||
               style.boxShadow !== 'none' ||
               element.classList.contains('focus-visible');
    }
    
    getElementSelector(element) {
        if (element.id) return `#${element.id}`;
        if (element.className) return `${element.tagName.toLowerCase()}.${element.className.split(' ')[0]}`;
        return element.tagName.toLowerCase();
    }
    
    resetValidationResults() {
        this.validationResults = {
            overall: 'pending',
            issues: [],
            suggestions: [],
            score: 0,
            maxScore: 100
        };
    }
    
    processValidationResults(results) {
        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value.issues) {
                this.validationResults.issues.push(...result.value.issues);
            }
        });
    }
    
    calculateOverallScore() {
        const totalChecks = 100;
        const failedChecks = this.validationResults.issues.filter(issue => issue.severity === 'error').length;
        
        this.validationResults.score = Math.max(0, totalChecks - failedChecks);
        this.validationResults.overall = this.validationResults.score >= 90 ? 'pass' : 
                                       this.validationResults.score >= 70 ? 'warning' : 'fail';
    }
    
    generateAccessibilitySuggestions() {
        const suggestions = [];
        
        // スコアに基づく提案
        if (this.validationResults.score < 90) {
            suggestions.push({
                type: 'general',
                priority: 'high',
                message: 'アクセシビリティスコアが90点を下回っています。重要な問題を優先的に修正してください。'
            });
        }
        
        // 問題カテゴリーに基づく提案
        const issuesByCategory = this.categorizeIssues();
        Object.entries(issuesByCategory).forEach(([category, issues]) => {
            if (issues.length > 0) {
                suggestions.push(this.getSuggestionForCategory(category, issues.length));
            }
        });
        
        this.validationResults.suggestions = suggestions;
    }
    
    categorizeIssues() {
        const categories = {};
        this.validationResults.issues.forEach(issue => {
            if (!categories[issue.type]) {
                categories[issue.type] = [];
            }
            categories[issue.type].push(issue);
        });
        return categories;
    }
    
    getSuggestionForCategory(category, count) {
        const suggestions = {
            'contrast': {
                type: 'contrast',
                priority: 'high',
                message: `${count}個の要素でコントラスト比が不足しています。色の組み合わせを見直してください。`
            },
            'keyboard-focus': {
                type: 'keyboard',
                priority: 'high',
                message: `${count}個の要素がキーボードフォーカスできません。tabindex属性を追加してください。`
            },
            'touch-target-size': {
                type: 'touch',
                priority: 'medium',
                message: `${count}個のタッチターゲットが小さすぎます。最小44pxのサイズを確保してください。`
            }
        };
        
        return suggestions[category] || {
            type: 'general',
            priority: 'medium',
            message: `${category}カテゴリーで${count}個の問題が見つかりました。`
        };
    }
    
    /**
     * 設定・状態取得メソッド
     */
    getValidationConfig() {
        return { ...this.validationConfig };
    }
    
    updateValidationConfig(newConfig) {
        Object.assign(this.validationConfig, newConfig);
    }
    
    getLastValidationResults() {
        return {
            results: { ...this.validationResults },
            timestamp: this.lastValidation
        };
    }
}