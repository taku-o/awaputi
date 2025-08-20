/**
 * LocalModeStatusManager - ローカルモード状態管理専用クラス
 * 状態取得、デバッグ情報、設定管理を担当
 * 
 * @author Claude Code
 * @version 1.0.0
 */

// Type definitions
interface LocalModeManager { isInitialized: boolean,
    config: LocalModeConfig,
    executionContext?: ExecutionContext;
    _initializationMetrics?: InitializationMetrics;
    _resourcePreloadPromises?: Map<string, Promise<any>>;
    _componentCache?: Map<string, any>;
    initializationPromise?: Promise<any>;
    }
}

interface LocalModeConfig { debugMode?: boolean;
    enableErrorHandling?: boolean;
    enableMetaTagOptimization?: boolean;
    enableFaviconGeneration?: boolean;
    enableDeveloperGuidance?: boolean;
    enablePerformanceOptimizations?: boolean;
    maxConcurrentTasks?: number;
    [key: string]: any, }
}

interface ExecutionContext { isLocal: boolean,
    protocol: string,
    url: string,
    domain: string,
    path: string,
    canUseCanvas?: boolean;
    canUseLocalStorage?: boolean;
    canUseModules?: boolean; }
}

interface InitializationMetrics { startTime: number | null,
    endTime: number | null,
    componentTimes: Record<string, number>;
    totalExecutionTime: number,
    optimizationsApplied: string[] }
}

interface StatusInfo { isInitialized: boolean,
    isLocalMode: boolean,
    config: LocalModeConfig,
    executionContext: {
        protocol: string,
        isLocal: boolean,
        canUseCanvas?: boolean;
        canUseLocalStorage?: boolean;
        canUseModules?: boolean; }
    } | null;
    timestamp: string,
}

interface HealthCheck { overall: 'healthy' | 'degraded' | 'unhealthy','
    checks: Record<string, {''
        status: 'pass' | 'warning' | 'fail',
        message: string,
        value?: any }
    }>;
    warnings: string[],
    errors: string[],
    score: number,
}

interface ComponentDebugInfo { available: boolean,
    error?: string;
    context?: any;
    stats?: any;
    initialized?: boolean;
    support?: any; }
}

interface DebugInfo { status: StatusInfo,
    components: Record<string, ComponentDebugInfo>;
    performance: {
        initializationMetrics: InitializationMetrics | null,
        resourcePreloads: {
            count: number,
            promises: string[] }
        },
        componentCache: { size: number,
            keys: string[] }
        };
    };
    cache: { componentCache?: {
            size: number,
            entries: [string, any][] }
        };
        resourcePreloads?: { size: number,
            keys: string[] }
        };
        error?: string;
    };
    errors: any,
    browser: any,
    resources: any,
}

interface ConfigChange { key: string,
    old: any,
    new: any }
}

export default class LocalModeStatusManager { /**
     * 状態情報取得
     * @param manager - LocalModeManagerインスタンス
     * @returns 状態情報
     */
    static getStatus(manager: LocalModeManager): StatusInfo {
        return { isInitialized: manager.isInitialized, };
            isLocalMode: manager.executionContext? .isLocal || false, : undefined }
            config: { ...manager.config },
            executionContext: manager.executionContext ? { : undefined
                protocol: manager.executionContext.protocol,
                isLocal: manager.executionContext.isLocal,
                canUseCanvas: manager.executionContext.canUseCanvas,
                canUseLocalStorage: manager.executionContext.canUseLocalStorage,
                canUseModules: manager.executionContext.canUseModules }
            } : null,
            timestamp: new Date().toISOString(),
        };
    }
    
    /**
     * デバッグ情報取得
     * @param manager - LocalModeManagerインスタンス
     * @returns デバッグ情報
     */
    static getDebugInfo(manager: LocalModeManager): DebugInfo { return { status: this.getStatus(manager),
            components: this._getComponentsDebugInfo(manager),
            performance: this._getPerformanceDebugInfo(manager),
            cache: this._getCacheDebugInfo(manager),
            errors: this._getErrorDebugInfo(),
            browser: this._getBrowserDebugInfo(), };
            resources: this._getResourceDebugInfo(manager); }
        };
    }
    
    /**
     * 設定更新
     * @param manager - LocalModeManagerインスタンス
     * @param newConfig - 新しい設定
     */
    static updateConfig(manager: LocalModeManager, newConfig: Partial<LocalModeConfig>): LocalModeConfig {
        const oldConfig = { ...manager.config };
        manager.config = { ...manager.config, ...newConfig };
        ';
        // 設定変更のログ
        if(manager.config.debugMode') {'
            '';
            console.log('LocalModeManager configuration updated:', {)
                old: oldConfig,);
                new: manager.config),
        }
                changed: this._getChangedKeys(oldConfig, manager.config); }
            });
        }
        
        return manager.config;
    }
    
    /**
     * ヘルスチェック
     * @param manager - LocalModeManagerインスタンス
     * @returns ヘルスチェック結果'
     */''
    static getHealthCheck(manager: LocalModeManager'): HealthCheck { const health: HealthCheck = {''
            overall: 'healthy' }
            checks: {},
            warnings: [],
            errors: [],
            score: 0;
        },
        
        // 初期化状態チェック
        health.checks.initialization = { ''
            status: manager.isInitialized ? 'pass' : 'fail','';
            message: manager.isInitialized ? 'Initialized successfully' : 'Not initialized' }
        },
        ';
        // 実行コンテキストチェック
        if(manager.executionContext') {'
            health.checks.executionContext = {''
                status: manager.executionContext.isLocal ? 'pass' : 'warning','
        }'
                message: manager.executionContext.isLocal ? 'Local execution detected' : 'Not in local mode' }
            },
            ';
            // ブラウザ機能チェック
            const capabilities = ['canUseCanvas', 'canUseLocalStorage', 'canUseModules'] as const;
            capabilities.forEach(cap => {  const supported = manager.executionContext![cap];'
                health.checks[cap] = {' })'
                    status: supported ? 'pass' : 'warning',') }'
                    message: `${cap}: ${supported ? 'supported' : 'not supported'}`),
                if(!supported) {
                    
                }
                    health.warnings.push(`${cap) is not supported`});
                }
            });
        }
        ';
        // パフォーマンスチェック
        if(manager._initializationMetrics? .totalExecutionTime') {
            const initTime = manager._initializationMetrics.totalExecutionTime;'
            health.checks.performance = { : undefined'
        }'
                status: initTime < 5000 ? 'pass' : 'warning', }
                message: `Initialization time: ${Math.round(initTime})}ms`,
                value: initTime';
            };''
            if(initTime >= 5000') {'
                ';'
            }'
                health.warnings.push('Slow initialization detected'); }
            }
        }
        ';
        // スコア計算
        const checks = Object.values(health.checks');''
        const passCount = checks.filter(check => check.status === 'pass').length;
        const totalCount = checks.length;
        health.score = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;
        ';
        // 全体状態判定
        if(health.score >= 80') {'
            ';'
        }'
            health.overall = 'healthy';' }'
        } else if (health.score >= 60') { ''
            health.overall = 'degraded'; }'
        } else {  ' }'
            health.overall = 'unhealthy'; }
        }
        
        return health;
    }
    
    /**
     * コンポーネントデバッグ情報取得
     * @private'
     */''
    private static _getComponentsDebugInfo(manager: LocalModeManager'): Record<string, ComponentDebugInfo> {
        const components: Record<string, ComponentDebugInfo> = {};
        
        // LocalExecutionDetector
        try { const LocalExecutionDetector = ''
                (typeof require !== 'undefined' && require('../LocalExecutionDetector.js')') ||'';
                (typeof window !== 'undefined' && (window as any).LocalExecutionDetector);
                
            components.localExecutionDetector = {
                available: !!LocalExecutionDetector,
                context: manager.executionContext || null }
            },'
        } catch (error) { ' }'
            components.localExecutionDetector = { available: false, error: (error as Error').message }
        }
        
        // FaviconGenerator
        try { const FaviconGenerator =''
                (typeof require !== 'undefined' && require('../FaviconGenerator.js')') ||'';
                (typeof window !== 'undefined' && (window as any).FaviconGenerator);
                
            components.faviconGenerator = {
                available: !!FaviconGenerator,
                stats: FaviconGenerator? .getStats?.() || null }
            },'
        } catch (error) { : undefined' }'
            components.faviconGenerator = { available: false, error: (error as Error').message }
        }
        
        // DeveloperGuidanceSystem
        try { const DeveloperGuidanceSystem =''
                (typeof require !== 'undefined' && require('../DeveloperGuidanceSystem.js')') ||'';
                (typeof window !== 'undefined' && (window as any).DeveloperGuidanceSystem);
                
            components.developerGuidanceSystem = {
                available: !!DeveloperGuidanceSystem,
                initialized: DeveloperGuidanceSystem? .isInitialized || false }
            },'
        } catch (error) { : undefined' }'
            components.developerGuidanceSystem = { available: false, error: (error as Error').message }
        }
        
        // LocalExecutionErrorHandler
        try { const LocalExecutionErrorHandler =''
                (typeof require !== 'undefined' && require('../LocalExecutionErrorHandler.js')') ||'';
                (typeof window !== 'undefined' && (window as any).LocalExecutionErrorHandler);
                
            components.localExecutionErrorHandler = {
                available: !!LocalExecutionErrorHandler,
                initialized: LocalExecutionErrorHandler? .isInitialized || false, : undefined;
                stats: LocalExecutionErrorHandler? .getDebugInfo?.() || null }
            },'
        } catch (error) { : undefined' }'
            components.localExecutionErrorHandler = { available: false, error: (error as Error').message }
        }
        
        // BrowserCompatibilityManager
        try { const BrowserCompatibilityManager =''
                (typeof require !== 'undefined' && require('../BrowserCompatibilityManager.js')') ||'';
                (typeof window !== 'undefined' && (window as any).BrowserCompatibilityManager);
                
            components.browserCompatibilityManager = {
                available: !!BrowserCompatibilityManager,
                support: BrowserCompatibilityManager? .getComprehensiveSupport?.() || null }
            },
        } catch (error) { : undefined }
            components.browserCompatibilityManager = { available: false, error: (error as Error).message }
        }
        
        return components;
    }
    
    /**
     * パフォーマンスデバッグ情報取得
     * @private
     */
    private static _getPerformanceDebugInfo(manager: LocalModeManager) { return { initializationMetrics: manager._initializationMetrics || null,
            resourcePreloads: {
                count: manager._resourcePreloadPromises? .size || 0, : undefined };
                promises: Array.from(manager._resourcePreloadPromises? .keys() || []); }
            }, : undefined
            componentCache: { size: manager._componentCache? .size || 0, : undefined
                keys: Array.from(manager._componentCache? .keys() || []) }
            }
        };
    }
    
    /**
     * キャッシュデバッグ情報取得
     * @private
     */ : undefined
    private static _getCacheDebugInfo(manager: LocalModeManager) { try {
            return { componentCache: {
                    size: manager._componentCache? .size || 0, : undefined };
                    entries: Array.from(manager._componentCache? .entries() || []); }
                }, : undefined
                resourcePreloads: { size: manager._resourcePreloadPromises? .size || 0, : undefined
                    keys: Array.from(manager._resourcePreloadPromises? .keys() || []) }
                }
            };
        } catch (error) { : undefined }
            return { error: (error as Error).message }
        }
    }
    
    /**
     * エラーデバッグ情報取得
     * @private'
     */''
    private static _getErrorDebugInfo()';
                (typeof require !== 'undefined' && require('./LocalModeErrorHandler.js')') ||'';
                (typeof window !== 'undefined' && (window as any).LocalModeErrorHandler);
                
            return LocalModeErrorHandler?.getErrorStats?.() || { available: false }
        } catch (error) {
            return { available: false, error: (error as Error).message }
        }
    }
    
    /**
     * ブラウザデバッグ情報取得
     * @private'
     */''
    private static _getBrowserDebugInfo()';
        if (typeof window === 'undefined'') { ' }'
            return { environment: 'non-browser' }
        }
        
        return { userAgent: navigator.userAgent,
            protocol: window.location.protocol,';
            href: window.location.href,'';
            localStorage: typeof localStorage !== 'undefined','';
            sessionStorage: typeof sessionStorage !== 'undefined','';
            canvas: !!document.createElement('canvas'').getContext,' };'
            performance: typeof performance !== 'undefined' }
        },
    }
    
    /**
     * リソースデバッグ情報取得
     * @private
     */
    private static _getResourceDebugInfo(manager: LocalModeManager) { return { config: manager.config,
            executionContext: manager.executionContext,
            isInitialized: manager.isInitialized, };
            initializationPromise: !!manager.initializationPromise }
        },
    }
    
    /**
     * 変更されたキー取得
     * @private
     */
    private static _getChangedKeys(oldConfig: LocalModeConfig, newConfig: LocalModeConfig): ConfigChange[] { const changed: ConfigChange[] = [],
        
        Object.keys(newConfig).forEach(key => { );
            if(oldConfig[key] !== newConfig[key]) {
                changed.push({)
                    key);
            }
                    old: oldConfig[key],) }
                    new: newConfig[key]); }
                });'
            }''
        }');
        
        return changed;'
    }''
}