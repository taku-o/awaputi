/**
 * LocalModeInitializer - ローカルモード初期化専用クラス
 * コンポーネント初期化とシーケンス管理を担当
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import LocalExecutionDetector from '../LocalExecutionDetector.js';
import MetaTagOptimizer from '../MetaTagOptimizer.js';
import FaviconGenerator from '../FaviconGenerator.js';
import DeveloperGuidanceSystem from '../DeveloperGuidanceSystem.js';
import BrowserCompatibilityManager from '../BrowserCompatibilityManager.js';
import LocalExecutionErrorHandler from '../LocalExecutionErrorHandler.js';
import { ErrorHandler } from '../../ErrorHandler.js';

// Type definitions
interface InitializationMetrics {
    startTime: number | null;
    endTime: number | null;
    componentTimes: Record<string, number>;
    totalExecutionTime: number;
    optimizationsApplied: string[];
}

interface LocalModeConfig {
    enableErrorHandling?: boolean;
    enableMetaTagOptimization?: boolean;
    enableFaviconGeneration?: boolean;
    enableDeveloperGuidance?: boolean;
    enablePerformanceOptimizations?: boolean;
    debugMode?: boolean;
    maxConcurrentTasks?: number;
}

interface ExecutionContext {
    isLocal: boolean;
    protocol: string;
    url: string;
    domain: string;
    path: string;
}

interface InitializationTask {
    name: string;
    task: () => Promise<any>;
    priority: 'high' | 'medium' | 'low';
}

interface TaskResult {
    name: string;
    result?: any;
    error?: Error;
    success: boolean;
}

interface InitializationResult {
    success: boolean;
    executionContext: ExecutionContext | null;
    results?: Record<string, any>;
    metrics?: InitializationMetrics;
    reason?: string;
    error?: Error;
}

export default class LocalModeInitializer {
    /**
     * 初期化メトリクス
     */
    private static _initializationMetrics: InitializationMetrics = {
        startTime: null,
        endTime: null,
        componentTimes: {},
        totalExecutionTime: 0,
        optimizationsApplied: []
    };
    
    /**
     * 最適化された初期化処理
     * @param config - 設定
     * @param componentCache - コンポーネントキャッシュ
     * @param logCallback - ログコールバック
     * @returns 初期化結果
     */
    static async performOptimizedInitialization(
        config: LocalModeConfig, 
        componentCache: Map<string, any>, 
        logCallback: (message: string) => void
    ): Promise<InitializationResult> {
        this._initializationMetrics.startTime = performance.now();
        logCallback('Starting optimized local mode initialization');
        
        try {
            // 1. 実行コンテキスト検出
            const executionContext = await this._initializeExecutionContext(componentCache, logCallback);
            
            if (!executionContext.isLocal) {
                logCallback('Not in local execution mode, skipping local mode initialization');
                return { success: false, reason: 'not_local_execution', executionContext };
            }
            
            // 2. エラーハンドリング初期化
            if (config.enableErrorHandling) {
                await this._initializeErrorHandling(config, logCallback);
            }
            
            // 3. パフォーマンス最適化された並行初期化
            const initializationTasks = this._createInitializationTasks(config, executionContext, logCallback);
            const results = await this._executeTasksWithOptimization(initializationTasks, config);
            
            // 4. 初期化後処理
            await this._finalizeInitialization(results, config, logCallback);
            
            this._initializationMetrics.endTime = performance.now();
            this._initializationMetrics.totalExecutionTime = 
                this._initializationMetrics.endTime - this._initializationMetrics.startTime;
            
            logCallback(`Optimized initialization completed in ${Math.round(this._initializationMetrics.totalExecutionTime)}ms`);
            
            return {
                success: true,
                executionContext,
                results,
                metrics: { ...this._initializationMetrics }
            };
            
        } catch (error) {
            logCallback(`Initialization failed: ${(error as Error).message}`);
            return { success: false, error: error as Error, executionContext: null };
        }
    }
    
    /**
     * レガシー初期化処理（順次実行）
     * @param config - 設定
     * @param logCallback - ログコールバック
     * @returns 初期化結果
     */
    static async performLegacyInitialization(
        config: LocalModeConfig, 
        logCallback: (message: string) => void
    ): Promise<InitializationResult> {
        logCallback('Starting legacy initialization (sequential mode)');
        
        try {
            // 実行コンテキスト検出
            const executionContext: ExecutionContext = LocalExecutionDetector.getExecutionContext();
            
            if (!executionContext.isLocal) {
                logCallback('Not in local execution mode, skipping local mode initialization');
                return { success: false, reason: 'not_local_execution', executionContext };
            }
            
            const results: Record<string, any> = {};
            
            // エラーハンドリング初期化
            if (config.enableErrorHandling) {
                LocalExecutionErrorHandler.initialize({
                    enableMainErrorHandlerIntegration: true,
                    enableDebugLogging: config.debugMode
                }, ErrorHandler);
                results.errorHandler = { initialized: true };
            }
            
            // メタタグ最適化
            if (config.enableMetaTagOptimization) {
                MetaTagOptimizer.optimizeForLocalExecution();
                results.metaTagOptimizer = { initialized: true };
            }
            
            // ファビコン生成
            if (config.enableFaviconGeneration) {
                const faviconResult = await FaviconGenerator.generateMissingFavicons({
                    enablePerformanceOptimizations: config.enablePerformanceOptimizations
                });
                results.faviconGenerator = faviconResult;
            }
            
            // 開発者ガイダンス
            if (config.enableDeveloperGuidance) {
                if (!DeveloperGuidanceSystem.isPermanentlyDismissed()) {
                    DeveloperGuidanceSystem.showLocalExecutionWarning({
                        showWarning: true,
                        persistDismissal: true
                    });
                }
                results.developerGuidance = { initialized: true };
            }
            
            return { success: true, executionContext, results };
            
        } catch (error) {
            logCallback(`Legacy initialization failed: ${(error as Error).message}`);
            return { success: false, error: error as Error, executionContext: null };
        }
    }
    
    /**
     * 実行コンテキスト初期化
     * @private
     */
    private static async _initializeExecutionContext(
        componentCache: Map<string, any>, 
        logCallback: (message: string) => void
    ): Promise<ExecutionContext> {
        const startTime = performance.now();
        
        const cacheKey = 'execution-context';
        if (componentCache.has(cacheKey)) {
            logCallback('Using cached execution context');
            return componentCache.get(cacheKey);
        }
        
        const executionContext: ExecutionContext = LocalExecutionDetector.getExecutionContext();
        componentCache.set(cacheKey, executionContext);
        
        this._initializationMetrics.componentTimes.executionContext = performance.now() - startTime;
        return executionContext;
    }
    
    /**
     * エラーハンドリング初期化
     * @private
     */
    private static async _initializeErrorHandling(
        config: LocalModeConfig, 
        logCallback: (message: string) => void
    ): Promise<void> {
        const startTime = performance.now();
        
        try {
            LocalExecutionErrorHandler.initialize({
                enableMainErrorHandlerIntegration: true,
                enableDebugLogging: config.debugMode,
                enableUserNotifications: true,
                enableFallbackContent: true
            }, ErrorHandler);
            
            logCallback('Error handling system initialized');
            this._initializationMetrics.componentTimes.errorHandler = performance.now() - startTime;
            
        } catch (error) {
            logCallback(`Error handler initialization failed: ${(error as Error).message}`);
            this._initializationMetrics.componentTimes.errorHandler = performance.now() - startTime;
        }
    }
    
    /**
     * 初期化タスク作成
     * @private
     */
    private static _createInitializationTasks(
        config: LocalModeConfig, 
        executionContext: ExecutionContext, 
        logCallback: (message: string) => void
    ): InitializationTask[] {
        const tasks: InitializationTask[] = [];
        
        if (config.enableMetaTagOptimization) {
            tasks.push({
                name: 'metaTagOptimizer',
                task: async () => {
                    MetaTagOptimizer.optimizeForLocalExecution();
                    return { initialized: true };
                },
                priority: 'high'
            });
        }
        
        if (config.enableFaviconGeneration) {
            tasks.push({
                name: 'faviconGenerator',
                task: () => FaviconGenerator.generateMissingFavicons({
                    enablePerformanceOptimizations: config.enablePerformanceOptimizations
                }),
                priority: 'medium'
            });
        }
        
        if (config.enableDeveloperGuidance) {
            tasks.push({
                name: 'developerGuidance',
                task: async () => {
                    if (!DeveloperGuidanceSystem.isPermanentlyDismissed()) {
                        DeveloperGuidanceSystem.showLocalExecutionWarning({
                            showWarning: true,
                            persistDismissal: true
                        });
                    }
                    return { initialized: true };
                },
                priority: 'low'
            });
        }
        
        return tasks;
    }
    
    /**
     * 最適化されたタスク実行
     * @private
     */
    private static async _executeTasksWithOptimization(
        tasks: InitializationTask[], 
        config: LocalModeConfig
    ): Promise<Record<string, any>> {
        const results: Record<string, any> = {};
        const maxConcurrent: number = config.maxConcurrentTasks || 3;
        
        // 優先度でソート
        const sortedTasks = tasks.sort((a, b) => {
            const priority: Record<string, number> = { high: 3, medium: 2, low: 1 };
            return priority[b.priority] - priority[a.priority];
        });
        
        // バッチで実行
        const batches: InitializationTask[][] = [];
        for (let i = 0; i < sortedTasks.length; i += maxConcurrent) {
            batches.push(sortedTasks.slice(i, i + maxConcurrent));
        }
        
        for (const batch of batches) {
            const batchPromises = batch.map(async ({ name, task }): Promise<TaskResult> => {
                const startTime = performance.now();
                try {
                    const result = await task();
                    this._initializationMetrics.componentTimes[name] = performance.now() - startTime;
                    return { name, result, success: true };
                } catch (error) {
                    this._initializationMetrics.componentTimes[name] = performance.now() - startTime;
                    return { name, error: error as Error, success: false };
                }
            });
            
            const batchResults = await Promise.allSettled(batchPromises);
            batchResults.forEach(result => {
                if (result.status === 'fulfilled') {
                    results[result.value.name] = result.value.result || { error: result.value.error };
                }
            });
        }
        
        return results;
    }
    
    /**
     * 初期化後処理
     * @private
     */
    private static async _finalizeInitialization(
        results: Record<string, any>, 
        config: LocalModeConfig, 
        logCallback: (message: string) => void
    ): Promise<void> {
        // 結果の検証
        const successCount = Object.values(results).filter(r => r && !r.error).length;
        const totalCount = Object.keys(results).length;
        
        logCallback(`Initialization completed: ${successCount}/${totalCount} components succeeded`);
        
        // 最適化サマリー
        if (config.enablePerformanceOptimizations) {
            this._initializationMetrics.optimizationsApplied.push(
                'lazy-initialization',
                'component-caching',
                'batch-processing',
                'concurrent-execution'
            );
        }
    }
    
    /**
     * 初期化メトリクス取得
     * @returns メトリクス情報
     */
    static getInitializationMetrics(): InitializationMetrics {
        return { ...this._initializationMetrics };
    }
}