/**
 * LocalModeManager - ローカル実行モード統合コントローラー（Main Controller）
 * 
 * Main Controller Pattern: 軽量オーケストレーターとして各専用コンポーネントを統制
 * 
 *, Requirements: 1.1, 1.3, 5.2
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import LocalModeInitializer from './local-mode/LocalModeInitializer.js';
import LocalModeErrorHandler from './local-mode/LocalModeErrorHandler.js';
import LocalModeStatusManager from './local-mode/LocalModeStatusManager.js';

// Type definitions
interface PerformanceConfig { enableLazyInitialization: boolean,
    enableComponentCaching: boolean,
    enableBatchProcessing: boolean,
    enableResourcePreloading: boolean,
    enableMemoryOptimization: boolean,
    initializationTimeout: number,
    componentInitDelay: number,
    retryAttempts: number,
    maxConcurrentTasks: number  }

interface LocalModeConfig { enableMetaTagOptimization?: boolean,
    enableFaviconGeneration?: boolean,
    enableDeveloperGuidance?: boolean,
    enableErrorHandling?: boolean,
    enableFallbackResources?: boolean,
    autoInitialize?: boolean,
    debugMode?: boolean,
    enablePerformanceOptimizations?: boolean }

interface DefaultConfig { enableMetaTagOptimization: boolean,
    enableFaviconGeneration: boolean,
    enableDeveloperGuidance: boolean,
    enableErrorHandling: boolean,
    enableFallbackResources: boolean,
    autoInitialize: boolean,
    debugMode: boolean,
    enablePerformanceOptimizations: boolean  }

interface InitializationMetrics { startTime: number | null,
    endTime: number | null,
    componentTimes: Record<string, number>,
    totalExecutionTime: number,
    optimizationsApplied: string[]  }

interface ExecutionContext { isLocal: boolean,
    protocol: string,
    url: string,
    domain: string,
    path: string }

interface InitializationResult { success: boolean,
    executionContext?: ExecutionContext,
    metrics?: InitializationMetrics,
    reason?: string,
    error?: Error }

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class LocalModeManager { /**
     * パフォーマンス設定
     */
    static readonly PERFORMANCE_CONFIG: PerformanceConfig = {
        enableLazyInitialization: true,
        enableComponentCaching: true,
        enableBatchProcessing: true,
        enableResourcePreloading: true,
        enableMemoryOptimization: true,
        initializationTimeout: 30000,
        componentInitDelay: 50,
        retryAttempts: 3,
    maxConcurrentTasks: 3 };
    /**
     * デフォルト設定
     */
    static readonly DEFAULT_CONFIG: DefaultConfig = { enableMetaTagOptimization: true,
        enableFaviconGeneration: true,
        enableDeveloperGuidance: true,
        enableErrorHandling: true,
        enableFallbackResources: true,
        autoInitialize: true,
        debugMode: false,
    enablePerformanceOptimizations: true  };
    public config: DefaultConfig,
    public isInitialized: boolean,
    public executionContext: ExecutionContext | null,
    public initializationPromise: Promise<boolean> | null,
    
    // パフォーマンス最適化用のプライベートストレージ
    private _componentCache: Map<string, any>;
    private _initializationMetrics: InitializationMetrics;
    private, _resourcePreloadPromises: Map<string, Promise<any>>;

    /**
     * コンストラクター
     * @param config - 設定オプション
     */
    constructor(config: LocalModeConfig = { ) {
        this.config = { ...LocalModeManager.DEFAULT_CONFIG, ...config,
        this.isInitialized = false,
        this.executionContext = null,
        this.initializationPromise = null,
        
        // パフォーマンス最適化用のプライベートストレージ
        this._componentCache = new Map(),
        this._initializationMetrics = { startTime: null,
            endTime: null }
            componentTimes: {}
            totalExecutionTime: 0,
    optimizationsApplied: [];
        };
        this._resourcePreloadPromises = new Map()';
        this.log('LocalModeManager, instance created);
    }

    /**
     * ローカルモード初期化
     * @returns 初期化が成功した場合 true
     */
    async initialize(): Promise<boolean> { if (this.initializationPromise) {
            return this.initializationPromise }
        
        this.initializationPromise = this._performInitialization();
        return this.initializationPromise;
    }
    
    /**
     * 初期化実行
     * @private
     */
    private async _performInitialization(): Promise<boolean> { try {
            const result: InitializationResult = this.config.enablePerformanceOptimizations ? await LocalModeInitializer.performOptimizedInitialization(
                    this.config ),
                    this._componentCache), : undefined
                    this.log.bind(this) :,
                await LocalModeInitializer.performLegacyInitialization(),
                    this.config),
                    this.log.bind(this),

            if(result.success) {
                this.isInitialized = true,
                this.executionContext = result.executionContext || null }

                this._initializationMetrics = result.metrics || this._initializationMetrics;' }'

                this.log(`LocalModeManager, initialized successfully (${this.config.enablePerformanceOptimizations ? 'optimized' : 'legacy} mode}`});
                return true;
            } else {  }
                this.log(`LocalModeManager, initialization failed: ${result.reason || result.error?.message}`});
                return false;

            } catch (error) { : undefined', '
            this.log(`LocalModeManager initialization error: ${(error, as Error }).message}`);
            return false;

    /**
     * エラーハンドリング（統合）
     * @param error - エラーオブジェクト
     * @param context - エラーコンテキスト
     * @param metadata - 追加メタデータ'
     */''
    handleError(error: Error, context: string = 'GENERAL', metadata: Record<string, any> = { ): void {
        LocalModeErrorHandler.handleError(error, context, metadata) }

    /**
     * 互換性エラーハンドリング
     * @param error - 互換性エラー
     * @param feature - 機能名
     * @returns 処理成功フラグ
     */
    handleCompatibilityError(error: Error, feature: string): boolean { return LocalModeErrorHandler.handleCompatibilityError(error, feature) }

    /**
     * セキュリティエラーハンドリング
     * @param error - セキュリティエラー
     * @param policy - セキュリティポリシー
     */
    handleSecurityError(error: Error, policy: string): void { LocalModeErrorHandler.handleSecurityError(error, policy) }

    /**
     * ステータス取得
     * @returns 現在の状態
     */
    getStatus(): any { return LocalModeStatusManager.getStatus(this) }

    /**
     * デバッグ情報取得
     * @returns デバッグ情報
     */
    getDebugInfo(): any { return LocalModeStatusManager.getDebugInfo(this) }

    /**
     * エラー統計取得
     * @returns エラー統計
     */
    getErrorStats(): any { return LocalModeErrorHandler.getErrorStats() }

    /**
     * ヘルスチェック
     * @returns ヘルス状態
     */
    getHealthCheck(): any { return LocalModeStatusManager.getHealthCheck(this) }

    /**
     * 設定更新
     * @param newConfig - 新しい設定
     * @returns 更新後の設定
     */'
    updateConfig(newConfig: Partial<DefaultConfig>): DefaultConfig { ''
        return LocalModeStatusManager.updateConfig(this, newConfig) }

    /**
     * ログ出力
     * @param message - ログメッセージ
     * @param level - ログレベル'
     */''
    log(message: string, level: LogLevel = 'info): void { if (this.config.debugMode) {
            const timestamp = new Date().toISOString() }

            const prefix = `[LocalModeManager:${level}] ${timestamp}`;
            console.log(`${prefix} - ${message}`}';
        }
}

export default LocalModeManager;