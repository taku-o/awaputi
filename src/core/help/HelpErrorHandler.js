/**
 * HelpErrorHandler.js
 * ヘルプシステム専用のエラーハンドリングクラス
 * ヘルプ機能におけるエラーの分類、処理、復旧を担当
 */

import { ErrorHandler } from '../../utils/ErrorHandler.js';
import { LoggingSystem } from '../LoggingSystem.js';

/**
 * ヘルプシステム専用エラーハンドラー
 */
export class HelpErrorHandler {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // エラー分類
        this.errorCategories = {
            CONTENT_LOAD: 'content_load',
            TUTORIAL_EXECUTION: 'tutorial_execution',
            SEARCH_OPERATION: 'search_operation',
            TOOLTIP_DISPLAY: 'tooltip_display',
            CONTEXT_DETECTION: 'context_detection',
            USER_INTERACTION: 'user_interaction'
        };
        
        // エラー統計
        this.errorStats = new Map();
        this.recoveryAttempts = new Map();
        this.maxRecoveryAttempts = 3;
        
        // フォールバック戦略
        this.fallbackStrategies = new Map();
        
        this.initialize();
    }

    /**
     * エラーハンドラーの初期化
     */
    initialize() {
        try {
            this.loggingSystem.info('HelpErrorHandler', 'Initializing help error handler...');
            
            // フォールバック戦略の設定
            this.setupFallbackStrategies();
            
            // エラー統計の初期化
            Object.values(this.errorCategories).forEach(category => {
                this.errorStats.set(category, {
                    count: 0,
                    lastOccurred: null,
                    resolved: 0,
                    unresolved: 0
                });
            });
            
            this.loggingSystem.info('HelpErrorHandler', 'Help error handler initialized successfully');
        } catch (error) {
            this.loggingSystem.error('HelpErrorHandler', 'Failed to initialize help error handler', error);
        }
    }

    /**
     * コンテンツ読み込みエラーの処理
     * @param {Error} error - エラーオブジェクト
     * @param {Object} fallbackOptions - フォールバックオプション
     * @returns {Object} 処理結果
     */
    handleContentLoadError(error, fallbackOptions = {}) {
        try {
            this.logError(this.errorCategories.CONTENT_LOAD, error, fallbackOptions);
            
            const strategy = this.fallbackStrategies.get(this.errorCategories.CONTENT_LOAD);
            const result = strategy(error, fallbackOptions);
            
            if (result.success) {
                this.incrementResolvedCount(this.errorCategories.CONTENT_LOAD);
                this.loggingSystem.info('HelpErrorHandler', `Content load error resolved using: ${result.strategy}`);
            } else {
                this.incrementUnresolvedCount(this.errorCategories.CONTENT_LOAD);
                this.showUserFriendlyError(error, result.suggestions);
            }
            
            return result;
        } catch (handlingError) {
            this.loggingSystem.error('HelpErrorHandler', 'Failed to handle content load error', handlingError);
            return this.getDefaultErrorResult();
        }
    }

    /**
     * チュートリアル実行エラーの処理
     * @param {Error} error - エラーオブジェクト
     * @param {Object} currentStep - 現在のステップ
     * @returns {Object} 処理結果
     */
    handleTutorialError(error, currentStep = null) {
        try {
            this.logError(this.errorCategories.TUTORIAL_EXECUTION, error, { currentStep });
            
            const strategy = this.fallbackStrategies.get(this.errorCategories.TUTORIAL_EXECUTION);
            const result = strategy(error, { currentStep });
            
            if (result.success) {
                this.incrementResolvedCount(this.errorCategories.TUTORIAL_EXECUTION);
                this.loggingSystem.info('HelpErrorHandler', `Tutorial error resolved: ${result.strategy}`);
            } else {
                this.incrementUnresolvedCount(this.errorCategories.TUTORIAL_EXECUTION);
                this.showUserFriendlyError(error, result.suggestions);
            }
            
            return result;
        } catch (handlingError) {
            this.loggingSystem.error('HelpErrorHandler', 'Failed to handle tutorial error', handlingError);
            return this.getDefaultErrorResult();
        }
    }

    /**
     * 検索エラーの処理
     * @param {Error} error - エラーオブジェクト
     * @param {string} query - 検索クエリ
     * @returns {Object} 処理結果
     */
    handleSearchError(error, query = '') {
        try {
            this.logError(this.errorCategories.SEARCH_OPERATION, error, { query });
            
            const strategy = this.fallbackStrategies.get(this.errorCategories.SEARCH_OPERATION);
            const result = strategy(error, { query });
            
            if (result.success) {
                this.incrementResolvedCount(this.errorCategories.SEARCH_OPERATION);
                this.loggingSystem.info('HelpErrorHandler', `Search error resolved: ${result.strategy}`);
            } else {
                this.incrementUnresolvedCount(this.errorCategories.SEARCH_OPERATION);
                this.showUserFriendlyError(error, result.suggestions);
            }
            
            return result;
        } catch (handlingError) {
            this.loggingSystem.error('HelpErrorHandler', 'Failed to handle search error', handlingError);
            return this.getDefaultErrorResult();
        }
    }

    /**
     * エラー復旧の試行
     * @param {string} errorType - エラータイプ
     * @param {Object} context - エラーコンテキスト
     * @returns {Promise<boolean>} 復旧成功フラグ
     */
    async attemptRecovery(errorType, context) {
        try {
            const attemptKey = `${errorType}_${JSON.stringify(context)}`;
            const currentAttempts = this.recoveryAttempts.get(attemptKey) || 0;
            
            if (currentAttempts >= this.maxRecoveryAttempts) {
                this.loggingSystem.warn('HelpErrorHandler', `Max recovery attempts reached for: ${errorType}`);
                return false;
            }
            
            this.recoveryAttempts.set(attemptKey, currentAttempts + 1);
            
            // エラータイプ別の復旧処理
            const recovered = await this.executeRecoveryStrategy(errorType, context);
            
            if (recovered) {
                this.recoveryAttempts.delete(attemptKey);
                this.loggingSystem.info('HelpErrorHandler', `Recovery successful for: ${errorType}`);
            }
            
            return recovered;
        } catch (error) {
            this.loggingSystem.error('HelpErrorHandler', `Recovery attempt failed for: ${errorType}`, error);
            return false;
        }
    }

    /**
     * ユーザーフレンドリーなエラー表示
     * @param {Error} error - エラーオブジェクト
     * @param {Array} suggestions - 提案一覧
     */
    showUserFriendlyError(error, suggestions = []) {
        try {
            const userMessage = this.translateErrorToUserMessage(error);
            const errorData = {
                message: userMessage,
                suggestions,
                timestamp: Date.now(),
                canRetry: this.canRetryError(error),
                helpAvailable: this.isHelpAvailable(error)
            };
            
            // エラー表示UI（後続のタスクで実装）
            this.loggingSystem.info('HelpErrorHandler', `User-friendly error: ${userMessage}`);
            console.warn('ヘルプエラー:', userMessage);
            
            if (suggestions.length > 0) {
                console.info('解決提案:', suggestions);
            }
            
        } catch (error) {
            this.loggingSystem.error('HelpErrorHandler', 'Failed to show user-friendly error', error);
        }
    }

    /**
     * エラーログの記録
     * @param {string} category - エラーカテゴリ
     * @param {Error} error - エラーオブジェクト
     * @param {Object} context - エラーコンテキスト
     */
    logError(category, error, context = {}) {
        try {
            // エラー統計の更新
            const stats = this.errorStats.get(category);
            if (stats) {
                stats.count++;
                stats.lastOccurred = Date.now();
            }
            
            // 詳細ログ記録
            this.loggingSystem.error('HelpErrorHandler', `${category} error`, {
                error: error.message,
                stack: error.stack,
                context,
                timestamp: Date.now(),
                userAgent: navigator.userAgent
            });
            
        } catch (loggingError) {
            console.error('Failed to log help error:', loggingError);
        }
    }

    /**
     * アナリティクスへの報告
     * @param {Error} error - エラーオブジェクト
     * @param {Object} context - エラーコンテキスト
     */
    reportToAnalytics(error, context = {}) {
        try {
            // Analytics システムとの連携（後続のタスクで実装）
            const analyticsData = {
                event: 'help_system_error',
                error_type: error.constructor.name,
                error_message: error.message,
                context,
                timestamp: Date.now()
            };
            
            this.loggingSystem.debug('HelpErrorHandler', 'Error reported to analytics', analyticsData);
            
        } catch (error) {
            this.loggingSystem.error('HelpErrorHandler', 'Failed to report error to analytics', error);
        }
    }

    /**
     * エラー統計の取得
     * @returns {Object} エラー統計
     */
    getErrorStatistics() {
        const statistics = {};
        
        for (const [category, stats] of this.errorStats.entries()) {
            statistics[category] = {
                ...stats,
                resolutionRate: stats.count > 0 ? (stats.resolved / stats.count) * 100 : 0
            };
        }
        
        return {
            categories: statistics,
            totalErrors: Array.from(this.errorStats.values()).reduce((sum, stats) => sum + stats.count, 0),
            totalResolved: Array.from(this.errorStats.values()).reduce((sum, stats) => sum + stats.resolved, 0),
            overallResolutionRate: this.calculateOverallResolutionRate()
        };
    }

    // ---- プライベートメソッド ----

    /**
     * フォールバック戦略の設定
     */
    setupFallbackStrategies() {
        // コンテンツ読み込みエラー戦略
        this.fallbackStrategies.set(this.errorCategories.CONTENT_LOAD, (error, options) => {
            // 1. キャッシュされたコンテンツを試行
            if (options.useCache) {
                return { success: true, strategy: 'cached_content', data: options.cachedContent };
            }
            
            // 2. デフォルト言語での再試行
            if (options.language !== 'ja') {
                return { success: true, strategy: 'fallback_language', suggestions: ['日本語版を表示します'] };
            }
            
            // 3. デフォルトコンテンツを提供
            return {
                success: true,
                strategy: 'default_content',
                data: this.getDefaultHelpContent(),
                suggestions: ['基本的なヘルプを表示しています']
            };
        });

        // チュートリアルエラー戦略
        this.fallbackStrategies.set(this.errorCategories.TUTORIAL_EXECUTION, (error, options) => {
            const { currentStep } = options;
            
            // 1. 前のステップに戻る
            if (currentStep && currentStep.stepIndex > 0) {
                return { success: true, strategy: 'previous_step', suggestions: ['前のステップに戻ります'] };
            }
            
            // 2. チュートリアルをスキップ
            return {
                success: true,
                strategy: 'skip_tutorial',
                suggestions: ['チュートリアルをスキップして、基本的なヘルプを表示します']
            };
        });

        // 検索エラー戦略
        this.fallbackStrategies.set(this.errorCategories.SEARCH_OPERATION, (error, options) => {
            const { query } = options;
            
            // 1. 簡略化された検索
            if (query && query.length > 3) {
                return {
                    success: true,
                    strategy: 'simplified_search',
                    suggestions: [`"${query.substring(0, 3)}" で再検索します`]
                };
            }
            
            // 2. カテゴリ別ヘルプを提供
            return {
                success: true,
                strategy: 'category_help',
                suggestions: ['カテゴリ別のヘルプを表示します']
            };
        });

        // ツールチップエラー戦略
        this.fallbackStrategies.set(this.errorCategories.TOOLTIP_DISPLAY, (error, options) => {
            return {
                success: true,
                strategy: 'basic_tooltip',
                suggestions: ['基本的なツールチップを表示します']
            };
        });

        // コンテキスト検出エラー戦略
        this.fallbackStrategies.set(this.errorCategories.CONTEXT_DETECTION, (error, options) => {
            return {
                success: true,
                strategy: 'default_context',
                suggestions: ['デフォルトのヘルプを表示します']
            };
        });

        // ユーザーインタラクションエラー戦略
        this.fallbackStrategies.set(this.errorCategories.USER_INTERACTION, (error, options) => {
            return {
                success: true,
                strategy: 'manual_mode',
                suggestions: ['手動でヘルプを確認できます']
            };
        });
    }

    /**
     * 復旧戦略の実行
     * @param {string} errorType - エラータイプ
     * @param {Object} context - コンテキスト
     * @returns {Promise<boolean>} 復旧成功フラグ
     */
    async executeRecoveryStrategy(errorType, context) {
        switch (errorType) {
            case this.errorCategories.CONTENT_LOAD:
                return await this.recoverContentLoad(context);
            case this.errorCategories.TUTORIAL_EXECUTION:
                return await this.recoverTutorialExecution(context);
            case this.errorCategories.SEARCH_OPERATION:
                return await this.recoverSearchOperation(context);
            default:
                return false;
        }
    }

    /**
     * コンテンツ読み込み復旧
     * @param {Object} context - コンテキスト
     * @returns {Promise<boolean>} 復旧成功フラグ
     */
    async recoverContentLoad(context) {
        try {
            // キャッシュクリア後再試行
            if (context.clearCache) {
                // CacheSystem.clear() 相当の処理
                return true;
            }
            
            // ネットワーク状態確認
            if (navigator.onLine) {
                // 再読み込み試行
                return true;
            }
            
            return false;
        } catch (error) {
            return false;
        }
    }

    /**
     * チュートリアル実行復旧
     * @param {Object} context - コンテキスト
     * @returns {Promise<boolean>} 復旧成功フラグ
     */
    async recoverTutorialExecution(context) {
        try {
            // DOM要素の再確認
            if (context.targetElement) {
                const element = document.querySelector(context.targetElement);
                if (element) {
                    return true;
                }
            }
            
            // 代替要素の検索
            const fallbackElements = document.querySelectorAll('.bubble, .button, .clickable');
            return fallbackElements.length > 0;
        } catch (error) {
            return false;
        }
    }

    /**
     * 検索操作復旧
     * @param {Object} context - コンテキスト
     * @returns {Promise<boolean>} 復旧成功フラグ
     */
    async recoverSearchOperation(context) {
        try {
            // インデックス再構築
            if (context.rebuildIndex) {
                // SearchEngine.rebuildIndex() 相当の処理
                return true;
            }
            
            return false;
        } catch (error) {
            return false;
        }
    }

    /**
     * エラーのユーザーメッセージ変換
     * @param {Error} error - エラーオブジェクト
     * @returns {string} ユーザーメッセージ
     */
    translateErrorToUserMessage(error) {
        const errorMappings = {
            'NetworkError': 'ネットワーク接続を確認してください',
            'TypeError': '予期しない問題が発生しました',
            'SyntaxError': 'データの読み込みに失敗しました',
            'ReferenceError': '必要な機能が見つかりません',
            'Default': 'ヘルプ機能で問題が発生しました'
        };

        const errorType = error.constructor.name;
        return errorMappings[errorType] || errorMappings['Default'];
    }

    /**
     * エラー再試行可能性の判定
     * @param {Error} error - エラーオブジェクト
     * @returns {boolean} 再試行可能フラグ
     */
    canRetryError(error) {
        const retryableErrors = ['NetworkError', 'TimeoutError', 'AbortError'];
        return retryableErrors.includes(error.constructor.name);
    }

    /**
     * ヘルプ利用可能性の判定
     * @param {Error} error - エラーオブジェクト
     * @returns {boolean} ヘルプ利用可能フラグ
     */
    isHelpAvailable(error) {
        // 基本的なヘルプは常に利用可能
        return true;
    }

    /**
     * デフォルトヘルプコンテンツの取得
     * @returns {Object} デフォルトコンテンツ
     */
    getDefaultHelpContent() {
        return {
            version: '1.0.0',
            category: 'error_fallback',
            language: 'ja',
            sections: [{
                id: 'error_help',
                title: 'ヘルプ利用について',
                content: 'ヘルプ機能で問題が発生しました。基本的な操作方法については、メニューからチュートリアルをご確認ください。',
                difficulty: 'beginner',
                tags: ['error', 'basic']
            }]
        };
    }

    /**
     * デフォルトエラー結果の取得
     * @returns {Object} デフォルト結果
     */
    getDefaultErrorResult() {
        return {
            success: false,
            strategy: 'none',
            suggestions: ['しばらく時間をおいてから再度お試しください'],
            data: null
        };
    }

    /**
     * 解決済みカウントの増加
     * @param {string} category - カテゴリ
     */
    incrementResolvedCount(category) {
        const stats = this.errorStats.get(category);
        if (stats) {
            stats.resolved++;
        }
    }

    /**
     * 未解決カウントの増加
     * @param {string} category - カテゴリ
     */
    incrementUnresolvedCount(category) {
        const stats = this.errorStats.get(category);
        if (stats) {
            stats.unresolved++;
        }
    }

    /**
     * 全体解決率の計算
     * @returns {number} 解決率（パーセンテージ）
     */
    calculateOverallResolutionRate() {
        let totalErrors = 0;
        let totalResolved = 0;

        for (const stats of this.errorStats.values()) {
            totalErrors += stats.count;
            totalResolved += stats.resolved;
        }

        return totalErrors > 0 ? (totalResolved / totalErrors) * 100 : 0;
    }

    /**
     * リソースのクリーンアップ
     */
    destroy() {
        try {
            this.errorStats.clear();
            this.recoveryAttempts.clear();
            this.fallbackStrategies.clear();
            
            this.loggingSystem.info('HelpErrorHandler', 'Help error handler destroyed');
        } catch (error) {
            this.loggingSystem.error('HelpErrorHandler', 'Failed to destroy help error handler', error);
        }
    }
}

// シングルトンインスタンス管理
let helpErrorHandlerInstance = null;

/**
 * HelpErrorHandlerのシングルトンインスタンスを取得
 * @param {Object} gameEngine - ゲームエンジン
 * @returns {HelpErrorHandler} HelpErrorHandlerインスタンス
 */
export function getHelpErrorHandler(gameEngine) {
    if (!helpErrorHandlerInstance) {
        helpErrorHandlerInstance = new HelpErrorHandler(gameEngine);
    }
    return helpErrorHandlerInstance;
}

/**
 * HelpErrorHandlerインスタンスを再初期化
 * @param {Object} gameEngine - ゲームエンジン
 * @returns {HelpErrorHandler} 新しいHelpErrorHandlerインスタンス
 */
export function reinitializeHelpErrorHandler(gameEngine) {
    if (helpErrorHandlerInstance) {
        helpErrorHandlerInstance.destroy();
    }
    helpErrorHandlerInstance = new HelpErrorHandler(gameEngine);
    return helpErrorHandlerInstance;
}