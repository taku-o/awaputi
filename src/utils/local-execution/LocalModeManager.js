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
import BrowserCompatibilityManager from './BrowserCompatibilityManager.js';
import LocalExecutionErrorHandler from './LocalExecutionErrorHandler.js';
import { ErrorHandler } from '../ErrorHandler.js';

class LocalModeManager {
    /**
     * パフォーマンス最適化設定
     */
    static PERFORMANCE_CONFIG = {
        enableLazyInitialization: true,
        enableComponentCaching: true,
        enableBatchProcessing: true,
        enableResourcePreloading: true,
        enableMemoryOptimization: true,
        initializationTimeout: 30000, // 30秒
        componentInitDelay: 50, // 50ms間隔
        retryAttempts: 3,
        maxConcurrentTasks: 3
    };
    
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
        debugMode: false,
        enablePerformanceOptimizations: true
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
        
        // パフォーマンス最適化用のプライベートストレージ
        this._componentCache = new Map();
        this._initializationMetrics = {
            startTime: null,
            endTime: null,
            componentTimes: {},
            totalExecutionTime: 0,
            optimizationsApplied: []
        };
        this._resourcePreloadPromises = new Map();
        
        this.log('LocalModeManager instance created');
    }

    /**
     * ローカルモードを初期化（パフォーマンス最適化版）
     * @returns {Promise<boolean>} 初期化が成功した場合 true
     */
    async initialize() {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }
        
        // パフォーマンス測定開始
        this._initializationMetrics.startTime = performance.now();
        
        this.initializationPromise = this._performInitialization();
        return this.initializationPromise;
    }
    
    /**
     * 実際の初期化処理（最適化版）
     * @private
     */
    async _performInitialization() {
        try {
            this.log('Starting optimized local mode initialization');
            
            // パフォーマンス最適化が有効な場合
            if (this.config.enablePerformanceOptimizations) {
                return await this._initializeWithOptimizations();
            }
            
            // 従来の初期化方法
            return await this._initializeLegacy();
            
        } catch (error) {
            console.error('LocalModeManager: Initialization failed', error);
            return false;
        } finally {
            this._initializationMetrics.endTime = performance.now();
            this._initializationMetrics.totalExecutionTime = 
                this._initializationMetrics.endTime - this._initializationMetrics.startTime;
            
            if (this.config.debugMode) {
                this._logPerformanceMetrics();
            }
        }
    }
    
    /**
     * パフォーマンス最適化を適用した初期化
     * @private
     */
    async _initializeWithOptimizations() {
        const config = this.config;
        const perfConfig = LocalModeManager.PERFORMANCE_CONFIG;
        
        // 1. Lazy initialization - 必要な場合のみ初期化
        if (perfConfig.enableLazyInitialization) {
            const needsInit = await this._checkInitializationNecessity();
            if (!needsInit) {
                this.log('Initialization not needed, using cached state');
                this._initializationMetrics.optimizationsApplied.push('lazy-init-skipped');
                return true;
            }
        }
        
        // 2. 実行コンテキストの取得（キャッシュ対応）
        this.executionContext = this._getCachedExecutionContext() || 
            LocalExecutionDetector.getExecutionContext();
        
        if (!this.executionContext.isLocal) {
            this.log('Not running in local execution mode, skipping initialization');
            return true;
        }
        
        // 2.5. エラーハンドリングシステムの統合初期化
        if (config.enableErrorHandling) {
            await this._initializeIntegratedErrorHandling();
            this._initializationMetrics.optimizationsApplied.push('integrated-error-handling');
        }
        
        // 3. Resource preloading
        if (perfConfig.enableResourcePreloading) {
            await this._preloadResources();
            this._initializationMetrics.optimizationsApplied.push('resource-preloading');
        }
        
        // 4. バッチ処理または並列処理での初期化
        const initTasks = this._createInitializationTasks();
        let results;
        
        if (perfConfig.enableBatchProcessing) {
            results = await this._executeBatchInitialization(initTasks);
            this._initializationMetrics.optimizationsApplied.push('batch-processing');
        } else {
            results = await this._executeSequentialInitialization(initTasks);
        }
        
        // 5. メモリ最適化
        if (perfConfig.enableMemoryOptimization) {
            await this._optimizeMemoryUsage();
            this._initializationMetrics.optimizationsApplied.push('memory-optimization');
        }
        
        // 6. 結果の検証と完了処理
        const success = results.every(result => result.success);
        this.isInitialized = success;
        
        this.log(`Optimized initialization completed: ${success ? 'Success' : 'Failed'}`);
        return success;
    }
    
    /**
     * 初期化が必要かチェック
     * @private
     */
    async _checkInitializationNecessity() {
        try {
            // キャッシュから前回の初期化状態を確認
            const cachedState = this._getCachedInitializationState();
            if (cachedState && cachedState.isValid) {
                return false;
            }
            
            // DOM状態の確認
            const hasRequiredElements = this._checkRequiredDOMElements();
            if (hasRequiredElements) {
                return false;
            }
            
            return true;
            
        } catch (error) {
            this.log('Initialization necessity check failed, proceeding with init');
            return true;
        }
    }
    
    /**
     * リソースの先読み
     * @private
     */
    async _preloadResources() {
        const preloadTasks = [];
        
        // Canvas API の準備チェック
        if (this.config.enableFaviconGeneration) {
            preloadTasks.push(this._preloadCanvasResources());
        }
        
        // localStorage アクセステスト
        preloadTasks.push(this._preloadStorageResources());
        
        // DOM要素の準備確認
        preloadTasks.push(this._preloadDOMResources());
        
        const results = await Promise.allSettled(preloadTasks);
        const successfulPreloads = results.filter(r => r.status === 'fulfilled').length;
        
        this.log(`Resource preloading completed: ${successfulPreloads}/${preloadTasks.length} successful`);
    }
    
    /**
     * 初期化タスクの作成
     * @private
     */
    _createInitializationTasks() {
        const tasks = [];
        
        if (this.config.enableMetaTagOptimization) {
            tasks.push({
                name: 'MetaTagOptimization',
                priority: 1, // 高優先度
                fn: () => this._initializeMetaTagOptimization()
            });
        }
        
        if (this.config.enableFaviconGeneration) {
            tasks.push({
                name: 'FaviconGeneration',
                priority: 2, // 中優先度
                fn: () => this._initializeFaviconGeneration()
            });
        }
        
        if (this.config.enableDeveloperGuidance) {
            tasks.push({
                name: 'DeveloperGuidance',
                priority: 3, // 低優先度（最後に実行）
                fn: () => this._initializeDeveloperGuidance()
            });
        }
        
        // 優先度でソート
        return tasks.sort((a, b) => a.priority - b.priority);
    }
    
    /**
     * バッチ処理での初期化実行
     * @private
     */
    async _executeBatchInitialization(tasks) {
        const maxConcurrent = LocalModeManager.PERFORMANCE_CONFIG.maxConcurrentTasks;
        const results = [];
        
        // タスクをバッチに分割
        for (let i = 0; i < tasks.length; i += maxConcurrent) {
            const batch = tasks.slice(i, i + maxConcurrent);
            
            // バッチ内のタスクを並列実行
            const batchPromises = batch.map(async (task) => {
                const startTime = performance.now();
                try {
                    const result = await task.fn();
                    const endTime = performance.now();
                    
                    this._initializationMetrics.componentTimes[task.name] = endTime - startTime;
                    
                    return {
                        name: task.name,
                        success: true,
                        result,
                        executionTime: endTime - startTime
                    };
                } catch (error) {
                    const endTime = performance.now();
                    this._initializationMetrics.componentTimes[task.name] = endTime - startTime;
                    
                    return {
                        name: task.name,
                        success: false,
                        error: error.message,
                        executionTime: endTime - startTime
                    };
                }
            });
            
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
            
            // バッチ間の遅延
            if (i + maxConcurrent < tasks.length) {
                await this._sleep(LocalModeManager.PERFORMANCE_CONFIG.componentInitDelay);
            }
        }
        
        return results;
    }
    
    /**
     * 順次実行での初期化
     * @private
     */
    async _executeSequentialInitialization(tasks) {
        const results = [];
        
        for (const task of tasks) {
            const startTime = performance.now();
            try {
                const result = await task.fn();
                const endTime = performance.now();
                
                this._initializationMetrics.componentTimes[task.name] = endTime - startTime;
                
                results.push({
                    name: task.name,
                    success: true,
                    result,
                    executionTime: endTime - startTime
                });
                
                // タスク間の遅延
                await this._sleep(LocalModeManager.PERFORMANCE_CONFIG.componentInitDelay);
                
            } catch (error) {
                const endTime = performance.now();
                this._initializationMetrics.componentTimes[task.name] = endTime - startTime;
                
                results.push({
                    name: task.name,
                    success: false,
                    error: error.message,
                    executionTime: endTime - startTime
                });
            }
        }
        
        return results;
    }
    
    /**
     * メモリ使用量の最適化
     * @private
     */
    async _optimizeMemoryUsage() {
        try {
            // 不要なキャッシュエントリをクリーンアップ
            this._cleanupComponentCache();
            
            // リソースプールの整理
            if (FaviconGenerator._resourcePool) {
                // FaviconGeneratorのリソースクリーンアップを呼び出し
                await FaviconGenerator._cleanupResources();
            }
            
            // ガベージコレクションの促進（可能であれば）
            if (window.gc) {
                window.gc();
            }
            
            this.log('Memory optimization completed');
            
        } catch (error) {
            this.log('Memory optimization failed:', error);
        }
    }
    
    /**
     * コンポーネントキャッシュのクリーンアップ
     * @private
     */
    _cleanupComponentCache() {
        const maxCacheSize = 10; // 最大キャッシュエントリ数
        
        if (this._componentCache.size > maxCacheSize) {
            // 最も古いエントリから削除
            const entries = Array.from(this._componentCache.entries());
            const entriesToRemove = entries.slice(0, this._componentCache.size - maxCacheSize);
            
            entriesToRemove.forEach(([key]) => {
                this._componentCache.delete(key);
            });
            
            this.log(`Component cache cleaned up: removed ${entriesToRemove.length} entries`);
        }
    }
    
    /**
     * パフォーマンスメトリクスのログ出力
     * @private
     */
    _logPerformanceMetrics() {
        const metrics = this._initializationMetrics;
        
        console.group('LocalModeManager Performance Metrics');
        console.log(`Total execution time: ${metrics.totalExecutionTime.toFixed(2)}ms`);
        console.log('Component execution times:');
        
        Object.entries(metrics.componentTimes).forEach(([component, time]) => {
            console.log(`  ${component}: ${time.toFixed(2)}ms`);
        });
        
        console.log('Optimizations applied:', metrics.optimizationsApplied);
        console.groupEnd();
    }
    
    /**
     * スリープ処理
     * @private
     */
    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * キャッシュされた実行コンテキストの取得
     * @private
     */
    _getCachedExecutionContext() {
        return this._componentCache.get('executionContext');
    }
    
    /**
     * 従来の初期化方法（後方互換性）
     * @private
     */
    async _initializeLegacy() {
        this.log('Using legacy initialization method');
        
        // 実行コンテキストの取得
        this.executionContext = LocalExecutionDetector.getExecutionContext();
        
        if (!this.executionContext.isLocal) {
            this.log('Not running in local execution mode, skipping initialization');
            this.isInitialized = true;
            return true;
        }
        
        const tasks = [];
        
        // MetaTagOptimizer の初期化
        if (this.config.enableMetaTagOptimization) {
            tasks.push(this._initializeMetaTagOptimization());
        }
        
        // FaviconGenerator の初期化
        if (this.config.enableFaviconGeneration) {
            tasks.push(this._initializeFaviconGeneration());
        }
        
        // DeveloperGuidanceSystem の初期化
        if (this.config.enableDeveloperGuidance) {
            tasks.push(this._initializeDeveloperGuidance());
        }
        
        // 全タスクを並列実行
        const results = await Promise.allSettled(tasks);
        const successes = results.filter(r => r.status === 'fulfilled').length;
        
        this.log(`Legacy initialization completed: ${successes}/${results.length} components successful`);
        
        this.isInitialized = successes > 0; // 少なくとも1つ成功すれば初期化成功
        return this.isInitialized;
    }
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
                // ブラウザ互換性チェック付きガイダンスを表示
                setTimeout(() => {
                    // 互換性問題があるかチェック
                    const hasCompatibilityIssues = this._checkCompatibilityIssues();
                    
                    if (hasCompatibilityIssues) {
                        // 互換性問題がある場合は詳細ガイダンスを表示
                        DeveloperGuidanceSystem.showCompatibilityGuidance({
                            autoHide: false,
                            showCommands: true,
                            showTroubleshooting: true
                        });
                    } else {
                        // 標準のガイダンスを表示
                        DeveloperGuidanceSystem.showLocalExecutionWarning({
                            autoHide: false,
                            showCommands: true,
                            showTroubleshooting: false,
                            showBrowserSpecificInfo: true
                        });
                    }
                }, 1000);
            }
            
            this.log('Developer guidance initialized');
        } catch (error) {
            this.log('Developer guidance initialization failed', error);
        }
    }

    /**
     * ブラウザ互換性問題をチェック
     * @returns {boolean} 互換性問題がある場合 true
     * @private
     */
    _checkCompatibilityIssues() {
        try {
            const compatibility = BrowserCompatibilityManager.getComprehensiveSupport();
            
            // 高優先度の推奨事項がある場合
            if (compatibility.recommendations && compatibility.recommendations.length > 0) {
                const highPriorityIssues = compatibility.recommendations.filter(r => r.priority === 'high');
                if (highPriorityIssues.length > 0) {
                    return true;
                }
            }
            
            // ブラウザがサポートされていない場合
            if (!compatibility.browser.isSupported) {
                return true;
            }
            
            // Canvas APIが利用できない場合
            if (!compatibility.canvas.available) {
                return true;
            }
            
            // localStorage が書き込み不可の場合
            if (!compatibility.localStorage.writable) {
                return true;
            }
            
            // ES6 modules が利用できずfile://プロトコルの場合
            if (!compatibility.modules.available && window.location.protocol === 'file:') {
                return true;
            }
            
            return false;
            
        } catch (error) {
            this.log('Compatibility check failed', error);
            return false; // エラー時はデフォルトガイダンスを使用
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
                developerGuidanceSystem: DeveloperGuidanceSystem.getDebugInfo(),
                localExecutionErrorHandler: LocalExecutionErrorHandler.getDebugInfo(),
                browserCompatibilityManager: BrowserCompatibilityManager.getDebugInfo()
            }
        };
    }

    // ========== INTEGRATED ERROR HANDLING METHODS ==========

    /**
     * 統合エラーハンドリングシステムを初期化
     * @private
     */
    async _initializeIntegratedErrorHandling() {
        try {
            this.log('Initializing integrated error handling system');

            // メインのErrorHandlerインスタンスを取得または作成
            const mainErrorHandler = new ErrorHandler();
            
            // LocalExecutionErrorHandlerを初期化（統合モード）
            LocalExecutionErrorHandler.initialize({
                enableGlobalHandling: this.config.enableErrorHandling,
                enableUserNotifications: this.config.enableDeveloperGuidance,
                enableDebugLogging: this.config.debugMode,
                enableFallbacks: this.config.enableFallbackResources,
                enableMainErrorHandlerIntegration: true
            }, mainErrorHandler);

            // エラーハンドリングシステムのインスタンスを保存
            this.errorHandler = mainErrorHandler;
            this.localErrorHandler = LocalExecutionErrorHandler;

            this.log('Integrated error handling system initialized successfully');
            
        } catch (error) {
            console.error('LocalModeManager: Failed to initialize integrated error handling', error);
            
            // フォールバック：統合なしでLocalExecutionErrorHandlerのみ初期化
            try {
                LocalExecutionErrorHandler.initialize({
                    enableGlobalHandling: this.config.enableErrorHandling,
                    enableUserNotifications: this.config.enableDeveloperGuidance,
                    enableDebugLogging: this.config.debugMode,
                    enableFallbacks: this.config.enableFallbackResources,
                    enableMainErrorHandlerIntegration: false
                });
                
                this.localErrorHandler = LocalExecutionErrorHandler;
                this.log('Fallback: Local error handler initialized without main integration');
                
            } catch (fallbackError) {
                console.error('LocalModeManager: Failed to initialize even fallback error handling', fallbackError);
                throw fallbackError;
            }
        }
    }

    /**
     * エラーを処理（統合エラーハンドリングシステム経由）
     * @param {Error} error - エラーオブジェクト
     * @param {string} context - エラーコンテキスト
     * @param {Object} metadata - メタデータ
     */
    handleError(error, context = 'LOCAL_MODE_MANAGER', metadata = {}) {
        try {
            const enhancedMetadata = {
                ...metadata,
                localMode: true,
                executionContext: this.executionContext,
                componentState: this.getStatus(),
                timestamp: new Date().toISOString()
            };

            // メインのErrorHandlerが利用可能な場合はそれを使用
            if (this.errorHandler) {
                this.errorHandler.handleError(error, context, enhancedMetadata);
            } 
            // フォールバック：LocalExecutionErrorHandlerを直接使用
            else if (this.localErrorHandler) {
                this.localErrorHandler.handleResourceError(error, context);
            }
            // 最終フォールバック：コンソールログ
            else {
                console.error(`LocalModeManager Error [${context}]:`, error, enhancedMetadata);
            }

        } catch (handlingError) {
            console.error('LocalModeManager: Error in error handling system', handlingError);
            console.error('Original error:', error);
        }
    }

    /**
     * ブラウザ互換性エラーを処理
     * @param {Error} error - エラーオブジェクト
     * @param {string} feature - 機能名
     */
    handleCompatibilityError(error, feature) {
        try {
            if (this.localErrorHandler && typeof this.localErrorHandler.handleCompatibilityError === 'function') {
                return this.localErrorHandler.handleCompatibilityError(error, feature);
            } else {
                // フォールバック処理
                this.handleError(error, 'COMPATIBILITY_ERROR', { feature });
            }
        } catch (handlingError) {
            console.error('LocalModeManager: Failed to handle compatibility error', handlingError);
            console.error('Original compatibility error:', error);
        }
    }

    /**
     * セキュリティポリシーエラーを処理
     * @param {Error} error - エラーオブジェクト
     * @param {string} policy - ポリシー名
     */
    handleSecurityError(error, policy) {
        try {
            if (this.localErrorHandler && typeof this.localErrorHandler.handleSecurityError === 'function') {
                return this.localErrorHandler.handleSecurityError(error, policy);
            } else {
                // フォールバック処理
                this.handleError(error, 'SECURITY_ERROR', { policy });
            }
        } catch (handlingError) {
            console.error('LocalModeManager: Failed to handle security error', handlingError);
            console.error('Original security error:', error);
        }
    }

    /**
     * エラー統計を取得
     * @returns {Object} エラー統計情報
     */
    getErrorStats() {
        if (this.errorHandler && typeof this.errorHandler.getErrorStats === 'function') {
            return {
                mainErrorHandler: this.errorHandler.getErrorStats(),
                localErrorHandler: this.localErrorHandler ? this.localErrorHandler.getDebugInfo() : null
            };
        }

        return {
            mainErrorHandler: null,
            localErrorHandler: this.localErrorHandler ? this.localErrorHandler.getDebugInfo() : null
        };
    }
}

export default LocalModeManager;