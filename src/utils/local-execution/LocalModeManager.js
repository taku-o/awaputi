/**
 * LocalModeManager - ローカル実行モード統合コントローラー
 * 
 * ローカルファイル実行時の全コンポーネントを統合管理し、
 * 初期化シーケンスとフォールバック機能を提供します。
 * 
 * Requirements: 1.1, 1.3, 5.2
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import LocalExecutionDetector from './LocalExecutionDetector.js';
import MetaTagOptimizer from './MetaTagOptimizer.js';
import FaviconGenerator from './FaviconGenerator.js';
import DeveloperGuidanceSystem from './DeveloperGuidanceSystem.js';

class LocalModeManager {
    /**
     * デフォルト設定
     */
    static DEFAULT_CONFIG = {
        enableMetaTagOptimization: true,
        enableFaviconGeneration: true,
        enableDeveloperGuidance: true,
        enableErrorHandling: true,
        enableFallbackResources: true,
        autoInitialize: true,
        debugMode: false
    };

    /**
     * コンストラクター
     * @param {Object} config - 設定オプション
     */
    constructor(config = {}) {
        this.config = { ...LocalModeManager.DEFAULT_CONFIG, ...config };
        this.isInitialized = false;
        this.executionContext = null;
        this.initializationPromise = null;
        
        this.log('LocalModeManager instance created');
    }

    /**
     * ローカルモードを初期化
     * @returns {Promise<boolean>} 初期化が成功した場合 true
     */
    async initialize() {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = this._performInitialization();
        return this.initializationPromise;
    }

    /**
     * 初期化処理を実行
     * @returns {Promise<boolean>}
     * @private
     */
    async _performInitialization() {
        try {
            this.log('Starting LocalModeManager initialization');
            
            // 実行コンテキストを取得
            this.executionContext = LocalExecutionDetector.getExecutionContext();
            
            // ローカル実行でない場合は処理をスキップ
            if (!this.executionContext.isLocal) {
                this.log('Not running in local mode, skipping initialization');
                this.isInitialized = true;
                return true;
            }

            this.log('Local execution detected, enabling local mode');

            // ローカルモードを有効化
            await this.enableLocalMode();

            // 各コンポーネントを初期化
            await this._initializeComponents();

            // イベントハンドラーを設定
            this.setupLocalEventHandlers();

            this.isInitialized = true;
            this.log('LocalModeManager initialization completed successfully');
            
            return true;

        } catch (error) {
            console.error('LocalModeManager: Initialization failed', error);
            
            // エラーハンドリングが有効な場合は基本的な機能のみ提供
            if (this.config.enableErrorHandling) {
                await this._handleInitializationError(error);
            }
            
            return false;
        }
    }

    /**
     * ローカルモードを有効化
     */
    async enableLocalMode() {
        this.log('Enabling local mode');

        // ドキュメントにローカルモードクラスを追加
        document.documentElement.classList.add('awaputi-local-mode');
        
        // ローカルモード用のメタ情報を設定
        this._setLocalModeMetaInfo();

        // フォールバックリソースを読み込み
        if (this.config.enableFallbackResources) {
            await this.loadFallbackResources();
        }

        this.log('Local mode enabled');
    }

    /**
     * フォールバックリソースを読み込み
     * @returns {Promise<void>}
     */
    async loadFallbackResources() {
        this.log('Loading fallback resources for local execution');

        try {
            // ES6モジュールが使用できない場合のフォールバック準備
            if (!this.executionContext.canUseModules) {
                await this._prepareBundleFallback();
            }

            // 重要なリソースの事前読み込み
            await this._preloadCriticalResources();

            this.log('Fallback resources loaded successfully');

        } catch (error) {
            this.log('Failed to load some fallback resources', error);
            // 非致命的エラーとして続行
        }
    }

    /**
     * ローカル実行用イベントハンドラーを設定
     */
    setupLocalEventHandlers() {
        this.log('Setting up local event handlers');

        // ページ読み込み完了時の処理
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this._onDOMContentLoaded();
            });
        } else {
            // 既に読み込み完了している場合は即座に実行
            setTimeout(() => this._onDOMContentLoaded(), 0);
        }

        // ページ離脱時のクリーンアップ
        window.addEventListener('beforeunload', () => {
            this._onBeforeUnload();
        });

        // エラーハンドリング
        window.addEventListener('error', (event) => {
            this._onGlobalError(event);
        });

        // 未処理のPromise拒否
        window.addEventListener('unhandledrejection', (event) => {
            this._onUnhandledRejection(event);
        });

        this.log('Local event handlers set up');
    }

    /**
     * ローカルモードを無効化
     */
    disableLocalMode() {
        this.log('Disabling local mode');

        // DOMクラスを削除
        document.documentElement.classList.remove('awaputi-local-mode');

        // ガイダンスを非表示
        if (DeveloperGuidanceSystem) {
            DeveloperGuidanceSystem.dismissGuidance();
        }

        this.isInitialized = false;
        this.log('Local mode disabled');
    }

    /**
     * 各コンポーネントを初期化
     * @returns {Promise<void>}
     * @private
     */
    async _initializeComponents() {
        const initTasks = [];

        // メタタグ最適化
        if (this.config.enableMetaTagOptimization) {
            initTasks.push(this._initializeMetaTagOptimization());
        }

        // ファビコン生成
        if (this.config.enableFaviconGeneration) {
            initTasks.push(this._initializeFaviconGeneration());
        }

        // 開発者ガイダンス
        if (this.config.enableDeveloperGuidance) {
            initTasks.push(this._initializeDeveloperGuidance());
        }

        // 並行実行
        await Promise.allSettled(initTasks);
    }

    /**
     * メタタグ最適化を初期化
     * @returns {Promise<void>}
     * @private
     */
    async _initializeMetaTagOptimization() {
        try {
            this.log('Initializing meta tag optimization');
            MetaTagOptimizer.optimizeForLocalExecution();
            this.log('Meta tag optimization completed');
        } catch (error) {
            this.log('Meta tag optimization failed', error);
        }
    }

    /**
     * ファビコン生成を初期化
     * @returns {Promise<void>}
     * @private
     */
    async _initializeFaviconGeneration() {
        try {
            this.log('Initializing favicon generation');
            
            // Canvas APIがサポートされている場合のみ実行
            if (this.executionContext.supportedFeatures.canvas) {
                await FaviconGenerator.generateMissingFavicons();
                this.log('Favicon generation completed');
            } else {
                this.log('Canvas API not supported, skipping favicon generation');
            }
        } catch (error) {
            this.log('Favicon generation failed', error);
        }
    }

    /**
     * 開発者ガイダンスを初期化
     * @returns {Promise<void>}
     * @private
     */
    async _initializeDeveloperGuidance() {
        try {
            this.log('Initializing developer guidance');
            
            // 永続的に非表示設定されていない場合のみ表示
            if (!DeveloperGuidanceSystem.isPermanentlyDismissed()) {
                // 少し遅延してから表示（ページ読み込みの邪魔にならないように）
                setTimeout(() => {
                    DeveloperGuidanceSystem.showLocalExecutionWarning({
                        autoHide: false,
                        showCommands: true,
                        showTroubleshooting: false
                    });
                }, 1000);
            }
            
            this.log('Developer guidance initialized');
        } catch (error) {
            this.log('Developer guidance initialization failed', error);
        }
    }

    /**
     * ローカルモード用のメタ情報を設定
     * @private
     */
    _setLocalModeMetaInfo() {
        // bodyに属性を追加
        document.body.setAttribute('data-execution-mode', 'local');
        document.body.setAttribute('data-local-mode-version', '1.0.0');
        
        // デバッグ用の情報をコンソールに出力
        if (this.config.debugMode) {
            console.groupCollapsed('🔧 Local Mode Debug Information');
            console.log('Execution Context:', this.executionContext);
            console.log('Configuration:', this.config);
            console.log('Browser Info:', this.executionContext.browserInfo);
            console.log('Supported Features:', this.executionContext.supportedFeatures);
            console.groupEnd();
        }
    }

    /**
     * バンドル版のフォールバック準備
     * @returns {Promise<void>}
     * @private
     */
    async _prepareBundleFallback() {
        this.log('Preparing bundle fallback for ES6 modules');
        
        // バンドル版のスクリプトタグを動的に追加
        // （実際の実装では、既存のbundleファイルがある場合）
        const bundleScript = document.createElement('script');
        bundleScript.src = './dist/bundle.js';
        bundleScript.async = true;
        bundleScript.onerror = () => {
            this.log('Bundle fallback not available');
        };
        
        // バンドルが存在する場合のみ追加
        // document.head.appendChild(bundleScript);
    }

    /**
     * 重要なリソースを事前読み込み
     * @returns {Promise<void>}
     * @private
     */
    async _preloadCriticalResources() {
        // 重要なCSSファイルの確認
        const criticalResources = [
            './src/styles/main.css',
            './src/styles/game.css'
        ];

        for (const resource of criticalResources) {
            try {
                // リンクタグが存在するか確認
                const existing = document.querySelector(`link[href="${resource}"]`);
                if (!existing) {
                    this._addResourceLink(resource);
                }
            } catch (error) {
                this.log(`Failed to preload resource: ${resource}`, error);
            }
        }
    }

    /**
     * リソースリンクを追加
     * @param {string} href - リソースURL
     * @private
     */
    _addResourceLink(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onerror = () => {
            this.log(`Resource not found: ${href}`);
        };
        document.head.appendChild(link);
    }

    /**
     * DOM読み込み完了時の処理
     * @private
     */
    _onDOMContentLoaded() {
        this.log('DOM content loaded in local mode');
        
        // 追加の初期化処理があれば実行
        if (this.isInitialized) {
            this._performPostDOMInitialization();
        }
    }

    /**
     * DOM読み込み後の追加初期化
     * @private
     */
    _performPostDOMInitialization() {
        // ローカル実行用のUI調整
        this._adjustUIForLocalExecution();
        
        // パフォーマンス警告
        this._checkPerformanceIssues();
    }

    /**
     * ローカル実行用のUI調整
     * @private
     */
    _adjustUIForLocalExecution() {
        // ローカル実行時のUI調整ロジック
        // 例: 一部の機能を無効化、代替表示など
        
        const localModeIndicator = document.createElement('div');
        localModeIndicator.id = 'local-mode-indicator';
        localModeIndicator.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(255, 193, 7, 0.9);
            color: #333;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            font-family: monospace;
        `;
        localModeIndicator.textContent = 'LOCAL MODE';
        document.body.appendChild(localModeIndicator);
    }

    /**
     * パフォーマンス問題をチェック
     * @private
     */
    _checkPerformanceIssues() {
        // ローカル実行時の潜在的なパフォーマンス問題を検出
        const issues = [];

        if (!this.executionContext.supportedFeatures.serviceWorker) {
            issues.push('ServiceWorker not available');
        }

        if (!this.executionContext.canUseModules) {
            issues.push('ES6 modules not supported');
        }

        if (issues.length > 0 && this.config.debugMode) {
            console.warn('LocalModeManager: Potential performance issues detected:', issues);
        }
    }

    /**
     * ページ離脱前のクリーンアップ
     * @private
     */
    _onBeforeUnload() {
        this.log('Performing cleanup before page unload');
        
        // 生成されたBlob URLsをクリーンアップ
        // （実際のBlob URLトラッキングが必要）
        
        // 一時的なDOM要素をクリーンアップ
        const tempElements = document.querySelectorAll('[id^="awaputi-local-"]');
        tempElements.forEach(element => element.remove());
    }

    /**
     * グローバルエラーハンドリング
     * @param {ErrorEvent} event - エラーイベント
     * @private
     */
    _onGlobalError(event) {
        // ローカル実行時の一般的なエラーパターンを検出
        const error = event.error || event.message;
        
        if (typeof error === 'string' && error.includes('CORS')) {
            this.log('CORS error detected in local mode', error);
            // ユーザーにCORSエラーであることを通知
            this._showCORSErrorGuidance();
        }
    }

    /**
     * 未処理Promise拒否のハンドリング
     * @param {PromiseRejectionEvent} event - Promise拒否イベント
     * @private
     */
    _onUnhandledRejection(event) {
        this.log('Unhandled promise rejection in local mode', event.reason);
        
        // ローカル実行特有の問題の可能性を検討
        if (event.reason && event.reason.toString().includes('module')) {
            this._showModuleLoadingErrorGuidance();
        }
    }

    /**
     * CORSエラー用のガイダンスを表示
     * @private
     */
    _showCORSErrorGuidance() {
        if (DeveloperGuidanceSystem && !DeveloperGuidanceSystem.isPermanentlyDismissed()) {
            DeveloperGuidanceSystem.showDeveloperServerGuidance({
                title: 'CORS Error Detected',
                message: 'A CORS error occurred. This is common when running from local files.',
                showTroubleshooting: true
            });
        }
    }

    /**
     * モジュール読み込みエラー用のガイダンスを表示
     * @private
     */
    _showModuleLoadingErrorGuidance() {
        if (DeveloperGuidanceSystem && !DeveloperGuidanceSystem.isPermanentlyDismissed()) {
            DeveloperGuidanceSystem.showDeveloperServerGuidance({
                title: 'Module Loading Error',
                message: 'Failed to load ES6 modules. Please use a development server.',
                showTroubleshooting: true
            });
        }
    }

    /**
     * 初期化エラーのハンドリング
     * @param {Error} error - エラーオブジェクト
     * @returns {Promise<void>}
     * @private
     */
    async _handleInitializationError(error) {
        this.log('Handling initialization error', error);
        
        try {
            // 最低限のガイダンスを表示
            DeveloperGuidanceSystem.showLocalExecutionWarning({
                title: 'Local Mode Setup Failed',
                message: 'Some local mode features could not be initialized. Please use a development server for the best experience.',
                showCommands: true,
                showTroubleshooting: true
            });
        } catch (guidanceError) {
            // ガイダンス表示も失敗した場合はコンソール警告のみ
            console.warn('LocalModeManager: Could not display error guidance', guidanceError);
        }
    }

    /**
     * ログ出力（デバッグモード時のみ）
     * @param {string} message - メッセージ
     * @param {...any} args - 追加引数
     * @private
     */
    log(message, ...args) {
        if (this.config.debugMode) {
            console.log(`LocalModeManager: ${message}`, ...args);
        }
    }

    /**
     * 現在の状態を取得
     * @returns {Object} 状態情報
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isLocalMode: this.executionContext?.isLocal || false,
            executionContext: this.executionContext,
            config: this.config,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * デバッグ情報を取得
     * @returns {Object} デバッグ情報
     */
    getDebugInfo() {
        return {
            status: this.getStatus(),
            components: {
                localExecutionDetector: LocalExecutionDetector.getDebugInfo(),
                metaTagOptimizer: MetaTagOptimizer.getMetaTagInfo(),
                faviconGenerator: FaviconGenerator.getDebugInfo(),
                developerGuidanceSystem: DeveloperGuidanceSystem.getDebugInfo()
            }
        };
    }
}

export default LocalModeManager;