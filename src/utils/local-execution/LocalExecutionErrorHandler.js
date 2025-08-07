/**
 * LocalExecutionErrorHandler - ローカル実行時のエラーハンドリングシステム
 * 
 * ローカルファイル実行時に発生する特有のエラーを検出・処理し、
 * ユーザーフレンドリーなフォールバック機能を提供します。
 * 
 * Requirements: 1.1, 2.3
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import DeveloperGuidanceSystem from './DeveloperGuidanceSystem.js';
import BrowserCompatibilityManager from './BrowserCompatibilityManager.js';

class LocalExecutionErrorHandler {
    /**
     * エラーカテゴリ定数
     */
    static ERROR_CATEGORIES = {
        CORS: 'cors',
        MODULE_LOADING: 'module_loading',
        RESOURCE_LOADING: 'resource_loading',
        BROWSER_COMPATIBILITY: 'browser_compatibility',
        SECURITY_POLICY: 'security_policy'
    };

    /**
     * エラーパターン定義
     */
    static ERROR_PATTERNS = {
        [this.ERROR_CATEGORIES.CORS]: [
            /cross.origin/i,
            /cors/i,
            /not allowed by access-control-allow-origin/i,
            /blocked by cors policy/i
        ],
        [this.ERROR_CATEGORIES.MODULE_LOADING]: [
            /failed to load module/i,
            /cannot import.*module/i,
            /module not found/i,
            /import.*is not defined/i,
            /es6.*module/i
        ],
        [this.ERROR_CATEGORIES.RESOURCE_LOADING]: [
            /failed to load resource/i,
            /404.*not found/i,
            /net::err_file_not_found/i,
            /favicon.*404/i
        ],
        [this.ERROR_CATEGORIES.BROWSER_COMPATIBILITY]: [
            /not supported/i,
            /is not a function/i,
            /unsupported.*api/i,
            /canvas.*not supported/i
        ],
        [this.ERROR_CATEGORIES.SECURITY_POLICY]: [
            /content security policy/i,
            /csp/i,
            /x-frame-options/i,
            /refused to.*frame/i
        ]
    };

    /**
     * 初期化フラグ
     */
    static isInitialized = false;

    /**
     * エラーハンドラーを初期化
     * @param {Object} config - 設定オプション
     */
    static initialize(config = {}) {
        if (this.isInitialized) {
            return;
        }

        const defaultConfig = {
            enableGlobalHandling: true,
            enableUserNotifications: true,
            enableDebugLogging: false,
            enableFallbacks: true
        };

        this.config = { ...defaultConfig, ...config };

        if (this.config.enableGlobalHandling) {
            this._setupGlobalErrorHandlers();
        }

        this.isInitialized = true;
        this._log('LocalExecutionErrorHandler initialized');
    }

    /**
     * リソース読み込みエラーを処理
     * @param {Error} error - エラーオブジェクト
     * @param {string} resource - リソース名
     */
    static handleResourceError(error, resource) {
        this._log('Handling resource error:', error, resource);

        const errorInfo = this._analyzeError(error);
        
        switch (errorInfo.category) {
            case this.ERROR_CATEGORIES.CORS:
                this._handleCORSError(error, resource);
                break;
                
            case this.ERROR_CATEGORIES.RESOURCE_LOADING:
                this._handleResourceLoadingError(error, resource);
                break;
                
            default:
                this._handleGenericResourceError(error, resource);
        }

        // フォールバック処理
        if (this.config.enableFallbacks) {
            this._attemptResourceFallback(resource, errorInfo);
        }
    }

    /**
     * ブラウザ互換性エラーを処理
     * @param {Error} error - エラーオブジェクト
     * @param {string} feature - 機能名
     */
    static handleCompatibilityError(error, feature) {
        this._log('Handling compatibility error:', error, feature);

        // ブラウザ互換性情報を取得
        const compatibility = this._getBrowserCompatibilityInfo();
        
        const errorInfo = {
            category: this.ERROR_CATEGORIES.BROWSER_COMPATIBILITY,
            feature,
            browserInfo: compatibility.browser,
            supportInfo: compatibility[feature] || {},
            userMessage: this._generateCompatibilityMessage(feature, compatibility),
            fallbackAvailable: this._checkFallbackAvailability(feature, compatibility)
        };

        // ユーザー通知
        if (this.config.enableUserNotifications) {
            this._showCompatibilityError(errorInfo);
        }

        // フォールバック処理
        if (errorInfo.fallbackAvailable && this.config.enableFallbacks) {
            this._enableFeatureFallback(feature, compatibility);
        }

        return errorInfo;
    }

    /**
     * ブラウザ互換性情報を取得
     * @returns {Object} 互換性情報
     * @private
     */
    static _getBrowserCompatibilityInfo() {
        try {
            return BrowserCompatibilityManager.getComprehensiveSupport();
        } catch (error) {
            this._log('Failed to get browser compatibility info:', error);
            return {
                browser: { name: 'unknown', version: 0, isSupported: false },
                canvas: { available: false },
                localStorage: { available: false },
                modules: { available: false }
            };
        }
    }

    /**
     * セキュリティポリシーエラーを処理
     * @param {Error} error - エラーオブジェクト
     * @param {string} policy - ポリシー名
     */
    static handleSecurityError(error, policy) {
        this._log('Handling security error:', error, policy);

        const errorInfo = {
            category: this.ERROR_CATEGORIES.SECURITY_POLICY,
            policy,
            userMessage: this._generateSecurityMessage(policy),
            canOptimize: this._canOptimizePolicy(policy)
        };

        // セキュリティポリシーの自動最適化
        if (errorInfo.canOptimize) {
            this._optimizeSecurityPolicy(policy);
        }

        // 開発者ガイダンス表示
        if (this.config.enableUserNotifications) {
            this._showSecurityErrorGuidance(errorInfo);
        }
    }

    /**
     * フォールバックコンテンツを表示
     * @param {string} errorType - エラータイプ
     */
    static showFallbackContent(errorType) {
        this._log('Showing fallback content for error type:', errorType);

        const fallbackContent = this._generateFallbackContent(errorType);
        
        if (fallbackContent) {
            this._displayFallbackContent(fallbackContent);
        }
    }

    /**
     * エラーを分析してカテゴリを判定
     * @param {Error|string} error - エラー
     * @returns {Object} エラー情報
     * @private
     */
    static _analyzeError(error) {
        const errorMessage = error?.message || error?.toString() || String(error);
        
        for (const [category, patterns] of Object.entries(this.ERROR_PATTERNS)) {
            for (const pattern of patterns) {
                if (pattern.test(errorMessage)) {
                    return {
                        category,
                        message: errorMessage,
                        severity: this._determineSeverity(category),
                        recoverable: this._isRecoverable(category)
                    };
                }
            }
        }

        return {
            category: 'unknown',
            message: errorMessage,
            severity: 'medium',
            recoverable: true
        };
    }

    /**
     * グローバルエラーハンドラーを設定
     * @private
     */
    static _setupGlobalErrorHandlers() {
        // JavaScript エラー
        window.addEventListener('error', (event) => {
            this._handleGlobalError(event);
        });

        // Promise 拒否
        window.addEventListener('unhandledrejection', (event) => {
            this._handleUnhandledRejection(event);
        });

        // リソース読み込みエラー
        document.addEventListener('error', (event) => {
            if (event.target !== window) {
                this._handleResourceLoadError(event);
            }
        }, true);

        this._log('Global error handlers set up');
    }

    /**
     * CORSエラーを処理
     * @param {Error} error - エラー
     * @param {string} resource - リソース
     * @private
     */
    static _handleCORSError(error, resource) {
        this._log('CORS error detected:', error, resource);

        if (this.config.enableUserNotifications && !this._isGuidanceShown('cors')) {
            DeveloperGuidanceSystem.showDeveloperServerGuidance({
                title: 'CORS Error Detected',
                message: `Cross-origin request blocked for: ${resource}`,
                showTroubleshooting: true,
                autoHide: false
            });
            
            this._markGuidanceShown('cors');
        }
    }

    /**
     * リソース読み込みエラーを処理
     * @param {Error} error - エラー
     * @param {string} resource - リソース
     * @private
     */
    static _handleResourceLoadingError(error, resource) {
        this._log('Resource loading error:', error, resource);

        // ファビコンエラーは静かに処理
        if (resource && resource.includes('favicon')) {
            this._handleFaviconError(resource);
            return;
        }

        // 重要なリソースの場合は通知
        if (this._isCriticalResource(resource)) {
            this._showResourceError(resource);
        }
    }

    /**
     * 汎用リソースエラーを処理
     * @param {Error} error - エラー
     * @param {string} resource - リソース
     * @private
     */
    static _handleGenericResourceError(error, resource) {
        this._log('Generic resource error:', error, resource);
        
        // 詳細なログ記録
        if (this.config.enableDebugLogging) {
            console.error('LocalExecutionErrorHandler: Resource error details', {
                error,
                resource,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                location: window.location.href
            });
        }
    }

    /**
     * グローバルエラーを処理
     * @param {ErrorEvent} event - エラーイベント
     * @private
     */
    static _handleGlobalError(event) {
        const error = event.error || event.message;
        const errorInfo = this._analyzeError(error);

        if (errorInfo.category !== 'unknown') {
            this.handleResourceError(error, 'global');
        }
    }

    /**
     * 未処理Promise拒否を処理
     * @param {PromiseRejectionEvent} event - Promise拒否イベント
     * @private
     */
    static _handleUnhandledRejection(event) {
        const reason = event.reason;
        const errorInfo = this._analyzeError(reason);

        if (errorInfo.category === this.ERROR_CATEGORIES.MODULE_LOADING) {
            this._handleModuleLoadingError(reason);
        }
    }

    /**
     * リソース読み込みエラーイベントを処理
     * @param {Event} event - エラーイベント
     * @private
     */
    static _handleResourceLoadError(event) {
        const target = event.target;
        const resource = target.src || target.href || 'unknown';
        
        this.handleResourceError(new Error(`Failed to load: ${resource}`), resource);
    }

    /**
     * モジュール読み込みエラーを処理
     * @param {any} reason - エラー理由
     * @private
     */
    static _handleModuleLoadingError(reason) {
        this._log('Module loading error:', reason);

        if (this.config.enableUserNotifications && !this._isGuidanceShown('module')) {
            DeveloperGuidanceSystem.showDeveloperServerGuidance({
                title: 'ES6 Module Loading Error',
                message: 'ES6 modules cannot be loaded from file:// URLs. Please use a development server.',
                showCommands: true,
                showTroubleshooting: true
            });
            
            this._markGuidanceShown('module');
        }
    }

    /**
     * ファビコンエラーを処理
     * @param {string} resource - ファビコンリソース
     * @private
     */
    static _handleFaviconError(resource) {
        this._log('Favicon error (silently handled):', resource);
        
        // ファビコンエラーは静かに処理し、
        // FaviconGenerator で代替生成を試行
        try {
            // FaviconGenerator が利用可能な場合は自動生成を試行
            if (window.FaviconGenerator) {
                window.FaviconGenerator.generateMissingFavicons();
            }
        } catch (error) {
            // 生成に失敗しても静かに無視
            this._log('Favicon generation fallback failed:', error);
        }
    }

    /**
     * リソースのフォールバックを試行
     * @param {string} resource - リソース
     * @param {Object} errorInfo - エラー情報
     * @private
     */
    static _attemptResourceFallback(resource, errorInfo) {
        if (!errorInfo.recoverable) {
            return;
        }

        // CSS ファイルの場合
        if (resource.includes('.css')) {
            this._fallbackToInlineCSS(resource);
        }
        
        // JavaScript ファイルの場合
        else if (resource.includes('.js')) {
            this._fallbackToAlternativeJS(resource);
        }
        
        // 画像ファイルの場合
        else if (this._isImageResource(resource)) {
            this._fallbackToPlaceholderImage(resource);
        }
    }

    /**
     * 互換性メッセージを生成
     * @param {string} feature - 機能名
     * @returns {string} メッセージ
     * @private
     */
    static _generateCompatibilityMessage(feature) {
        const messages = {
            canvas: 'Canvas API is not supported. Some visual features may not work.',
            localStorage: 'Local storage is not available. Settings cannot be saved.',
            serviceWorker: 'Service Worker is not supported. Offline functionality is disabled.',
            modules: 'ES6 modules are not supported. Please use a modern browser or development server.'
        };

        return messages[feature] || `${feature} is not supported in this environment.`;
    }

    /**
     * セキュリティメッセージを生成
     * @param {string} policy - ポリシー名
     * @returns {string} メッセージ
     * @private
     */
    static _generateSecurityMessage(policy) {
        const messages = {
            'X-Frame-Options': 'X-Frame-Options policy is blocking content. This has been optimized for local execution.',
            'Content-Security-Policy': 'Content Security Policy restrictions detected. Local execution policy applied.',
            'CORS': 'Cross-origin restrictions are preventing resource loading. Please use a development server.'
        };

        return messages[policy] || `Security policy ${policy} is affecting local execution.`;
    }

    /**
     * エラーの重要度を判定
     * @param {string} category - エラーカテゴリ
     * @returns {string} 重要度
     * @private
     */
    static _determineSeverity(category) {
        const severityMap = {
            [this.ERROR_CATEGORIES.CORS]: 'high',
            [this.ERROR_CATEGORIES.MODULE_LOADING]: 'high',
            [this.ERROR_CATEGORIES.RESOURCE_LOADING]: 'medium',
            [this.ERROR_CATEGORIES.BROWSER_COMPATIBILITY]: 'medium',
            [this.ERROR_CATEGORIES.SECURITY_POLICY]: 'low'
        };

        return severityMap[category] || 'medium';
    }

    /**
     * エラーが復旧可能かチェック
     * @param {string} category - エラーカテゴリ
     * @returns {boolean} 復旧可能な場合 true
     * @private
     */
    static _isRecoverable(category) {
        const recoverableCategories = [
            this.ERROR_CATEGORIES.RESOURCE_LOADING,
            this.ERROR_CATEGORIES.SECURITY_POLICY,
            this.ERROR_CATEGORIES.BROWSER_COMPATIBILITY
        ];

        return recoverableCategories.includes(category);
    }

    /**
     * 重要なリソースかチェック
     * @param {string} resource - リソース
     * @returns {boolean} 重要なリソースの場合 true
     * @private
     */
    static _isCriticalResource(resource) {
        const criticalPatterns = [
            /main\.(js|css)$/,
            /game\.(js|css)$/,
            /core\.(js|css)$/,
            /app\.(js|css)$/
        ];

        return criticalPatterns.some(pattern => pattern.test(resource));
    }

    /**
     * 画像リソースかチェック
     * @param {string} resource - リソース
     * @returns {boolean} 画像リソースの場合 true
     * @private
     */
    static _isImageResource(resource) {
        return /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(resource);
    }

    /**
     * ガイダンスが既に表示されたかチェック
     * @param {string} type - ガイダンスタイプ
     * @returns {boolean} 表示済みの場合 true
     * @private
     */
    static _isGuidanceShown(type) {
        try {
            return sessionStorage.getItem(`guidance_shown_${type}`) === 'true';
        } catch {
            return false;
        }
    }

    /**
     * ガイダンス表示状態をマーク
     * @param {string} type - ガイダンスタイプ
     * @private
     */
    static _markGuidanceShown(type) {
        try {
            sessionStorage.setItem(`guidance_shown_${type}`, 'true');
        } catch {
            // sessionStorage が使用できない場合は無視
        }
    }

    /**
     * フォールバックコンテンツを生成
     * @param {string} errorType - エラータイプ
     * @returns {Object|null} フォールバックコンテンツ
     * @private
     */
    static _generateFallbackContent(errorType) {
        const fallbacks = {
            module_loading: {
                title: 'Module Loading Error',
                message: 'Some features may not work properly in local file mode.',
                action: 'Please use a development server for full functionality.'
            },
            cors: {
                title: 'Network Restrictions',
                message: 'Local file security restrictions are in effect.',
                action: 'Use a development server to enable all features.'
            }
        };

        return fallbacks[errorType] || null;
    }

    /**
     * ログ出力
     * @param {...any} args - 引数
     * @private
     */
    static _log(...args) {
        if (this.config?.enableDebugLogging) {
            console.log('LocalExecutionErrorHandler:', ...args);
        }
    }

    /**
     * デバッグ情報を取得
     * @returns {Object} デバッグ情報
     */
    static getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            config: this.config,
            errorCategories: this.ERROR_CATEGORIES,
            handledGuidanceTypes: this._getHandledGuidanceTypes()
        };
    }

    /**
     * 処理済みガイダンスタイプを取得
     * @returns {string[]} ガイダンスタイプ配列
     * @private
     */
    static _getHandledGuidanceTypes() {
        const types = [];
        try {
            for (const type of ['cors', 'module', 'resource', 'security']) {
                if (sessionStorage.getItem(`guidance_shown_${type}`) === 'true') {
                    types.push(type);
                }
            }
        } catch {
            // sessionStorage エラーは無視
        }
        return types;
    }
}

export default LocalExecutionErrorHandler;