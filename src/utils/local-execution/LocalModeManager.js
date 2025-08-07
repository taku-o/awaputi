/**
 * LocalModeManager - ローカル実行モード統合コントローラー（Main Controller）
 * 
 * Main Controller Pattern: 軽量オーケストレーターとして各専用コンポーネントを統制
 * 
 * Requirements: 1.1, 1.3, 5.2
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import LocalModeInitializer from './local-mode/LocalModeInitializer.js';
import LocalModeErrorHandler from './local-mode/LocalModeErrorHandler.js';
import LocalModeStatusManager from './local-mode/LocalModeStatusManager.js';

class LocalModeManager {
    /**
     * パフォーマンス設定
     */
    static PERFORMANCE_CONFIG = {
        enableLazyInitialization: true,
        enableComponentCaching: true,
        enableBatchProcessing: true,
        enableResourcePreloading: true,
        enableMemoryOptimization: true,
        initializationTimeout: 30000,
        componentInitDelay: 50,
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
     * ローカルモード初期化
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
     * 初期化実行
     * @private
     */
    async _performInitialization() {
        try {
            const result = this.config.enablePerformanceOptimizations ?
                await LocalModeInitializer.performOptimizedInitialization(
                    this.config, 
                    this._componentCache, 
                    this.log.bind(this)
                ) :
                await LocalModeInitializer.performLegacyInitialization(
                    this.config,
                    this.log.bind(this)
                );
            
            if (result.success) {
                this.isInitialized = true;
                this.executionContext = result.executionContext;
                this._initializationMetrics = result.metrics || {};
                this.log(`LocalModeManager initialized successfully (${this.config.enablePerformanceOptimizations ? 'optimized' : 'legacy'} mode)`);
                return true;
            } else {
                this.log(`LocalModeManager initialization failed: ${result.reason || result.error?.message}`);
                return false;
            }
            
        } catch (error) {
            this.log(`LocalModeManager initialization error: ${error.message}`);
            return false;
        }
    }

    /**
     * エラーハンドリング（統合）
     * @param {Error} error - エラーオブジェクト
     * @param {string} context - エラーコンテキスト
     * @param {Object} metadata - 追加メタデータ
     */
    handleError(error, context = 'GENERAL', metadata = {}) {
        LocalModeErrorHandler.handleError(error, context, metadata);
    }

    /**
     * 互換性エラーハンドリング
     * @param {Error} error - 互換性エラー
     * @param {string} feature - 機能名
     * @returns {boolean} 処理成功フラグ
     */
    handleCompatibilityError(error, feature) {
        return LocalModeErrorHandler.handleCompatibilityError(error, feature);
    }

    /**
     * セキュリティエラーハンドリング
     * @param {Error} error - セキュリティエラー
     * @param {string} policy - セキュリティポリシー
     */
    handleSecurityError(error, policy) {
        LocalModeErrorHandler.handleSecurityError(error, policy);
    }

    /**
     * ステータス取得
     * @returns {Object} 現在の状態
     */
    getStatus() {
        return LocalModeStatusManager.getStatus(this);
    }

    /**
     * デバッグ情報取得
     * @returns {Object} デバッグ情報
     */
    getDebugInfo() {
        return LocalModeStatusManager.getDebugInfo(this);
    }

    /**
     * エラー統計取得
     * @returns {Object} エラー統計
     */
    getErrorStats() {
        return LocalModeErrorHandler.getErrorStats();
    }

    /**
     * ヘルスチェック
     * @returns {Object} ヘルス状態
     */
    getHealthCheck() {
        return LocalModeStatusManager.getHealthCheck(this);
    }

    /**
     * 設定更新
     * @param {Object} newConfig - 新しい設定
     * @returns {Object} 更新後の設定
     */
    updateConfig(newConfig) {
        return LocalModeStatusManager.updateConfig(this, newConfig);
    }

    /**
     * ログ出力
     * @param {string} message - ログメッセージ
     * @param {string} level - ログレベル
     */
    log(message, level = 'info') {
        if (this.config.debugMode) {
            const timestamp = new Date().toISOString();
            const prefix = `[LocalModeManager:${level}] ${timestamp}`;
            console.log(`${prefix} - ${message}`);
        }
    }
}

export default LocalModeManager;