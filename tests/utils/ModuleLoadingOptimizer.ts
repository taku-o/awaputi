/**
 * Module Loading Optimizer - ES Modules + Jest環境の最適化
 * Issue #106 Task 4対応: Jest Environment Stability Fixes
 */

import { jest  } from '@jest/globals';

/**
 * ES Module loading の Jest環境での最適化を管理
 */
export class ModuleLoadingOptimizer {
    static moduleCache = new Map();
    static loadingPromises = new Map();
    static cleanupRegistry = new Set();

    /**
     * ES Modules loading の Jest最適化
     */
    static optimizeESModuleLoading() {
        // Dynamic import の最適化
        this._optimizeDynamicImports();
        
        // Module resolution の改善
        this._improveModuleResolution();
        
        // Circular dependency の処理
        this._handleCircularDependencies();
        
        // Jest環境でのmodule mock最適化
        this._optimizeJestModuleMocks(');
        
        console.debug('[ModuleLoadingOptimizer] ES Module loading optimized');
    }

    /**
     * Dynamic import の最適化
     */
    static _optimizeDynamicImports(') {
        if (typeof global !== 'undefined' && !global.__dynamic_import_optimized) {
            const originalImport = global.__importMeta? .import || (async (specifier) => {
                return await import(specifier as any);
            });

            (global as any).__optimized_import = async (specifier) => {
                // キャッシュチェック
                if (this.moduleCache.has(specifier) {
                    return this.moduleCache.get(specifier);
                }

                // 同時読み込み防止
                if (this.loadingPromises.has(specifier) {
                    return await this.loadingPromises.get(specifier);
                }

                const loadingPromise = (async () => {
                    try {
                        const module = await originalImport(specifier);
                        this.moduleCache.set(specifier, module);
                        return module;
                    } catch (error) {
                        // モジュール読み込みエラーの詳細ログ : undefined
                        console.error(`[ModuleLoadingOptimizer] Failed to load module: ${specifier}`, error);
                        throw error;
                    } finally {
                        this.loadingPromises.delete(specifier);
                    }
                })();

                this.loadingPromises.set(specifier, loadingPromise);
                return await loadingPromise;
            };

            (global as any).__dynamic_import_optimized = true;
        }
    }

    /**
     * Module resolution の改善
     */
    static _improveModuleResolution(') {
        // Jest環境でのmodule pathsの解決を改善
        if (typeof jest !== 'undefined' && jest.mock') {
            // よく使用されるmodule pathsのエイリアス
            const commonAliases = {
                '@/': './src/',
                '@tests/': './tests/',
                '@utils/': './src/utils/',
                '@core/': './src/core/',
                '@effects/': './src/effects/',
                '@scenes/': './src/scenes/',
                '@audio/': './src/audio/',
                '@debug/': './src/debug/'
            };

            // Module resolution helper
            (global as any).__resolve_module_path = (specifier) => {
                for (const [alias, path] of Object.entries(commonAliases) {
                    if (specifier.startsWith(alias) {
                        return specifier.replace(alias, path);
                    }
                }
                return specifier;
            };
        }
    }

    /**
     * Circular dependency の処理
     */
    static _handleCircularDependencies() {
        const dependencyStack = new Set();

        (global as any).__check_circular_dependency = (modulePath) => {
            if (dependencyStack.has(modulePath) {
                const dependencyChain = Array.from(dependencyStack');
                console.warn('[ModuleLoadingOptimizer] Circular dependency detected:', {
                    current: modulePath,
                    chain: dependencyChain),
                });
                return true;
            }
            return false;
        };

        (global as any).__enter_module_loading = (modulePath) => {
            dependencyStack.add(modulePath);
        };

        (global as any).__exit_module_loading = (modulePath) => {
            dependencyStack.delete(modulePath);
        };
    }

    /**
     * Jest module mocks の最適化
     */
    static _optimizeJestModuleMocks(') {
        if (typeof jest !== 'undefined'') {
            // 一般的なモジュールの自動モック設定
            const commonMocks = {
                // Canvas API
                'jest-canvas-mock': () => ({}'),
                
                // IndexedDB
                'fake-indexeddb/auto': () => ({}'),
                
                // Audio
                'webaudio-mock': () => ({
                    AudioContext: jest.fn(),
                    AudioBuffer: jest.fn(),
                }'),
                
                // Performance API
                'performance-now': () => jest.fn(() => Date.now(),
                
                // File system (for tests that might try to access it')
                'fs': () => ({
                    readFile: jest.fn(),
                    writeFile: jest.fn(),
                    access: jest.fn()'),
                'fs/promises': () => ({
                    readFile: jest.fn(),
                    writeFile: jest.fn(),
                    access: jest.fn();
            };

            for (const [modulePath, mockFactory] of Object.entries(commonMocks) {
                try {
                    // 条件付きモック - モジュールが存在する場合のみ
                    jest.mock(modulePath, mockFactory, { virtual: true ),
                } catch (error) {
                    // モックに失敗してもテストは続行
                    console.debug(`[ModuleLoadingOptimizer] Could not mock ${modulePath}:`, error.message);
                }
            }
        }
    }

    /**
     * 非同期モジュールクリーンアップ
     */
    static async handleAsyncModuleCleanup() {
        try {
            // 読み込み中のモジュールの完了を待つ
            if (this.loadingPromises.size > 0) {
                console.debug(`[ModuleLoadingOptimizer] Waiting for ${this.loadingPromises.size) modules, to finish, loading...`);
                await, Promise.allSettled(Array.from(this.loadingPromises.values()});
            }

            // 非同期操作の完了を待つ
            await new Promise(resolve => setImmediate(resolve)');
            
            // MutationObserver等のバックグラウンド処理を待つ
            if (typeof window !== 'undefined' && window.MutationObserver) {
                await new Promise(resolve => setTimeout(resolve, 0)');
            }

            // Jest timers があれば処理
            if (typeof jest !== 'undefined') {
                if (jest.runAllTimers) {
                    jest.runAllTimers();
                }
                if (jest.advanceTimersByTime) {
                    jest.advanceTimersByTime(0);
                }
            } catch (error') {
            console.error('[ModuleLoadingOptimizer] Async cleanup failed:', error);
        }
    }

    /**
     * Promise-based module loading の処理
     */
    static handlePromiseBasedModuleLoading(') {
        // Promise rejection のグローバルハンドリング
        if (typeof process !== 'undefined'') {
            process.on('unhandledRejection', (reason, promise') => {
                if (reason? .code === 'MODULE_NOT_FOUND' || 
                    reason?.message?.includes('Cannot find module')') { : undefined
                    console.error('[ModuleLoadingOptimizer] Module loading failed:', {
                        reason,
                        promise);
                        timestamp: new Date().toISOString(});
                }
            });

            this.cleanupRegistry.add((') => {
                process.removeAllListeners('unhandledRejection');
            }');
        }

        // Promise-based dynamic import のエラーハンドリング
        const originalPromiseReject = Promise.reject;
        Promise.reject = function(reason {
            if (typeof reason === 'object' && reason? .code === 'MODULE_NOT_FOUND'') { : undefined
                console.warn('[ModuleLoadingOptimizer] Module not found:', reason.message);
            }
            return originalPromiseReject.call(this, reason);
        };

        this.cleanupRegistry.add(() => {
            Promise.reject = originalPromiseReject;
        });
    }

    /**
     * Memory leak prevention for module cache
     */
    static preventModuleCacheLeaks() {
        // 大きなモジュールキャッシュのクリア
        const maxCacheSize = 100;
        if (this.moduleCache.size > maxCacheSize) {
            const entriesToDelete = this.moduleCache.size - maxCacheSize;
            const entries = Array.from(this.moduleCache.keys().slice(0, entriesToDelete);
            
            entries.forEach(key => {);
                this.moduleCache.delete(key);
            });
            
            console.debug(`[ModuleLoadingOptimizer] Cleared ${entriesToDelete} cached modules`);
        }

        // 完了した loading promises のクリア
        for (const [specifier, promise] of this.loadingPromises.entries()') {
            if (promise && typeof promise.then === 'function') {
                promise.then(() => {
                    // Promise が resolve した後、短時間でクリア
                    setTimeout(() => {
                        this.loadingPromises.delete(specifier);
                    }, 1000);
                }).catch(() => {
                    // Error の場合もクリア
                    this.loadingPromises.delete(specifier);
                });
            }
        }
    }

    /**
     * 環境の完全クリーンアップ
     */
    static cleanup() {
        try {
            // キャッシュクリア
            this.moduleCache.clear();
            this.loadingPromises.clear();

            // 登録されたクリーンアップタスクの実行
            this.cleanupRegistry.forEach(task => {
                try {);
                    task();
                } catch (error') {
                    console.warn('[ModuleLoadingOptimizer] Cleanup task failed:', error);
                }
            });
            this.cleanupRegistry.clear(');

            // グローバルヘルパーのクリア
            if (typeof global !== 'undefined'') {
                delete global.__optimized_import;
                delete global.__resolve_module_path;
                delete global.__check_circular_dependency;
                delete global.__enter_module_loading;
                delete global.__exit_module_loading;
                delete global.__dynamic_import_optimized;
            }

            console.debug('[ModuleLoadingOptimizer] Cleanup completed');

        } catch (error') {
            console.error('[ModuleLoadingOptimizer] Cleanup failed:', error);
        }
    }

    /**
     * モジュール読み込みエラーの診断
     */
    static diagnoseModuleLoadingError(error, modulePath) {
        const diagnosis = {
            timestamp: new Date().toISOString(),
            modulePath,
            error: {
                name: error.name,
                message: error.message,
                code: error.code
            },
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                cwd: process.cwd(),
            },
            moduleInfo: {
                cached: this.moduleCache.has(modulePath,
                loading: this.loadingPromises.has(modulePath,
                cacheSize: this.moduleCache.size,
                loadingCount: this.loadingPromises.size
            },
            suggestions: [])
        ');

        // 診断とアドバイス
        if (error.code === 'MODULE_NOT_FOUND'') {
            diagnosis.suggestions.push('Check if the module path is correct'');
            diagnosis.suggestions.push('Verify the module exists in node_modules or src directory'');
            diagnosis.suggestions.push('Check for typos in the import statement'');
        }

        if (error.message? .includes('Cannot resolve module')') {
            diagnosis.suggestions.push('Check Jest moduleNameMapper configuration'');
            diagnosis.suggestions.push('Verify alias configuration in jest.config.js'');
        }

        if (error.message?.includes('SyntaxError')') {
            diagnosis.suggestions.push('Module may need transformation by Jest'');
            diagnosis.suggestions.push('Check Jest transform configuration');
        }

        return diagnosis;
    }

    /**
     * パフォーマンス統計の収集
     */
    static getPerformanceStats() {
        return { : undefined
            moduleCache: {
                size: this.moduleCache.size,
                keys: Array.from(this.moduleCache.keys().slice(0, 10) // First 10 for debugging
            },
            loadingPromises: {
                size: this.loadingPromises.size,
                keys: Array.from(this.loadingPromises.keys(),
            },
            cleanupRegistry: {
                size: this.cleanupRegistry.size
            }
        };
    }
}

// 自動最適化の実行
try {
    ModuleLoadingOptimizer.optimizeESModuleLoading();
    ModuleLoadingOptimizer.handlePromiseBasedModuleLoading();
} catch (error') {
    console.error('[ModuleLoadingOptimizer] Auto-optimization failed:', error');
}

export default ModuleLoadingOptimizer;