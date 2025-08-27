/**
 * LocalModeStatusManager - ローカルモード状態管理専用クラス
 * 状態取得、デバッグ情報、設定管理を担当
 * 
 * @author Claude Code
 * @version 1.0.0
 */

export default class LocalModeStatusManager {
    /**
     * 状態情報取得
     * @param {Object} manager - LocalModeManagerインスタンス
     * @returns {Object} 状態情報
     */
    static getStatus(manager) {
        return {
            isInitialized: manager.isInitialized,
            isLocalMode: manager.executionContext?.isLocal || false,
            config: { ...manager.config },
            executionContext: manager.executionContext ? {
                protocol: manager.executionContext.protocol,
                isLocal: manager.executionContext.isLocal,
                canUseCanvas: manager.executionContext.canUseCanvas,
                canUseLocalStorage: manager.executionContext.canUseLocalStorage,
                canUseModules: manager.executionContext.canUseModules
            } : null,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * デバッグ情報取得
     * @param {Object} manager - LocalModeManagerインスタンス
     * @returns {Object} デバッグ情報
     */
    static getDebugInfo(manager) {
        return {
            status: this.getStatus(manager),
            components: this._getComponentsDebugInfo(manager),
            performance: this._getPerformanceDebugInfo(manager),
            cache: this._getCacheDebugInfo(manager),
            errors: this._getErrorDebugInfo(),
            browser: this._getBrowserDebugInfo(),
            resources: this._getResourceDebugInfo(manager)
        };
    }
    
    /**
     * 設定更新
     * @param {Object} manager - LocalModeManagerインスタンス
     * @param {Object} newConfig - 新しい設定
     */
    static updateConfig(manager, newConfig) {
        const oldConfig = { ...manager.config };
        manager.config = { ...manager.config, ...newConfig };
        
        // 設定変更のログ
        if (manager.config.debugMode) {
            console.log('LocalModeManager configuration updated:', {
                old: oldConfig,
                new: manager.config,
                changed: this._getChangedKeys(oldConfig, manager.config)
            });
        }
        
        return manager.config;
    }
    
    /**
     * ヘルスチェック
     * @param {Object} manager - LocalModeManagerインスタンス
     * @returns {Object} ヘルスチェック結果
     */
    static getHealthCheck(manager) {
        const health = {
            overall: 'healthy',
            checks: {},
            warnings: [],
            errors: [],
            score: 0
        };
        
        // 初期化状態チェック
        health.checks.initialization = {
            status: manager.isInitialized ? 'pass' : 'fail',
            message: manager.isInitialized ? 'Initialized successfully' : 'Not initialized'
        };
        
        // 実行コンテキストチェック
        if (manager.executionContext) {
            health.checks.executionContext = {
                status: manager.executionContext.isLocal ? 'pass' : 'warning',
                message: manager.executionContext.isLocal ? 'Local execution detected' : 'Not in local mode'
            };
            
            // ブラウザ機能チェック
            const capabilities = ['canUseCanvas', 'canUseLocalStorage', 'canUseModules'];
            capabilities.forEach(cap => {
                const supported = manager.executionContext[cap];
                health.checks[cap] = {
                    status: supported ? 'pass' : 'warning',
                    message: `${cap}: ${supported ? 'supported' : 'not supported'}`
                };
                if (!supported) {
                    health.warnings.push(`${cap} is not supported`);
                }
            });
        }
        
        // パフォーマンスチェック
        if (manager._initializationMetrics?.totalExecutionTime) {
            const initTime = manager._initializationMetrics.totalExecutionTime;
            health.checks.performance = {
                status: initTime < 5000 ? 'pass' : 'warning',
                message: `Initialization time: ${Math.round(initTime)}ms`,
                value: initTime
            };
            if (initTime >= 5000) {
                health.warnings.push('Slow initialization detected');
            }
        }
        
        // スコア計算
        const checks = Object.values(health.checks);
        const passCount = checks.filter(check => check.status === 'pass').length;
        const totalCount = checks.length;
        health.score = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;
        
        // 全体状態判定
        if (health.score >= 80) {
            health.overall = 'healthy';
        } else if (health.score >= 60) {
            health.overall = 'degraded';
        } else {
            health.overall = 'unhealthy';
        }
        
        return health;
    }
    
    /**
     * コンポーネントデバッグ情報取得
     * @private
     */
    static _getComponentsDebugInfo(manager) {
        const components = {};
        
        // LocalExecutionDetector
        try {
            const LocalExecutionDetector = 
                (typeof require !== 'undefined' && require('../LocalExecutionDetector.js')) ||
                (typeof window !== 'undefined' && window.LocalExecutionDetector);
                
            components.localExecutionDetector = {
                available: !!LocalExecutionDetector,
                context: manager.executionContext || null
            };
        } catch (error) {
            components.localExecutionDetector = { available: false, error: error.message };
        }
        
        // FaviconGenerator
        try {
            const FaviconGenerator =
                (typeof require !== 'undefined' && require('../FaviconGenerator.js')) ||
                (typeof window !== 'undefined' && window.FaviconGenerator);
                
            components.faviconGenerator = {
                available: !!FaviconGenerator,
                stats: FaviconGenerator?.getStats?.() || null
            };
        } catch (error) {
            components.faviconGenerator = { available: false, error: error.message };
        }
        
        // DeveloperGuidanceSystem
        try {
            const DeveloperGuidanceSystem =
                (typeof require !== 'undefined' && require('../DeveloperGuidanceSystem.js')) ||
                (typeof window !== 'undefined' && window.DeveloperGuidanceSystem);
                
            components.developerGuidanceSystem = {
                available: !!DeveloperGuidanceSystem,
                initialized: DeveloperGuidanceSystem?.isInitialized || false
            };
        } catch (error) {
            components.developerGuidanceSystem = { available: false, error: error.message };
        }
        
        // LocalExecutionErrorHandler
        try {
            const LocalExecutionErrorHandler =
                (typeof require !== 'undefined' && require('../LocalExecutionErrorHandler.js')) ||
                (typeof window !== 'undefined' && window.LocalExecutionErrorHandler);
                
            components.localExecutionErrorHandler = {
                available: !!LocalExecutionErrorHandler,
                initialized: LocalExecutionErrorHandler?.isInitialized || false,
                stats: LocalExecutionErrorHandler?.getDebugInfo?.() || null
            };
        } catch (error) {
            components.localExecutionErrorHandler = { available: false, error: error.message };
        }
        
        // BrowserCompatibilityManager
        try {
            const BrowserCompatibilityManager =
                (typeof require !== 'undefined' && require('../BrowserCompatibilityManager.js')) ||
                (typeof window !== 'undefined' && window.BrowserCompatibilityManager);
                
            components.browserCompatibilityManager = {
                available: !!BrowserCompatibilityManager,
                support: BrowserCompatibilityManager?.getComprehensiveSupport?.() || null
            };
        } catch (error) {
            components.browserCompatibilityManager = { available: false, error: error.message };
        }
        
        return components;
    }
    
    /**
     * パフォーマンスデバッグ情報取得
     * @private
     */
    static _getPerformanceDebugInfo(manager) {
        return {
            initializationMetrics: manager._initializationMetrics || null,
            resourcePreloads: {
                count: manager._resourcePreloadPromises?.size || 0,
                promises: Array.from(manager._resourcePreloadPromises?.keys() || [])
            },
            componentCache: {
                size: manager._componentCache?.size || 0,
                keys: Array.from(manager._componentCache?.keys() || [])
            }
        };
    }
    
    /**
     * キャッシュデバッグ情報取得
     * @private
     */
    static _getCacheDebugInfo(manager) {
        try {
            return {
                componentCache: {
                    size: manager._componentCache?.size || 0,
                    entries: Array.from(manager._componentCache?.entries() || [])
                },
                resourcePreloads: {
                    size: manager._resourcePreloadPromises?.size || 0,
                    keys: Array.from(manager._resourcePreloadPromises?.keys() || [])
                }
            };
        } catch (error) {
            return { error: error.message };
        }
    }
    
    /**
     * エラーデバッグ情報取得
     * @private
     */
    static _getErrorDebugInfo() {
        try {
            const LocalModeErrorHandler = 
                (typeof require !== 'undefined' && require('./LocalModeErrorHandler.js')) ||
                (typeof window !== 'undefined' && window.LocalModeErrorHandler);
                
            return LocalModeErrorHandler?.getErrorStats?.() || { available: false };
        } catch (error) {
            return { available: false, error: error.message };
        }
    }
    
    /**
     * ブラウザデバッグ情報取得
     * @private
     */
    static _getBrowserDebugInfo() {
        if (typeof window === 'undefined') {
            return { environment: 'non-browser' };
        }
        
        return {
            userAgent: navigator.userAgent,
            protocol: window.location.protocol,
            href: window.location.href,
            localStorage: typeof localStorage !== 'undefined',
            sessionStorage: typeof sessionStorage !== 'undefined',
            canvas: !!document.createElement('canvas').getContext,
            performance: typeof performance !== 'undefined'
        };
    }
    
    /**
     * リソースデバッグ情報取得
     * @private
     */
    static _getResourceDebugInfo(manager) {
        return {
            config: manager.config,
            executionContext: manager.executionContext,
            isInitialized: manager.isInitialized,
            initializationPromise: !!manager.initializationPromise
        };
    }
    
    /**
     * 変更されたキー取得
     * @private
     */
    static _getChangedKeys(oldConfig, newConfig) {
        const changed = [];
        
        Object.keys(newConfig).forEach(key => {
            if (oldConfig[key] !== newConfig[key]) {
                changed.push({
                    key,
                    old: oldConfig[key],
                    new: newConfig[key]
                });
            }
        });
        
        return changed;
    }
}