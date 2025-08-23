import { FontSourceManager } from './FontSourceManager.js';
import { FontFallbackHandler } from './FontFallbackHandler.js';
import { FontErrorHandler, FontErrorConfig } from './FontErrorHandler.js';

// 型定義
export interface FontLoadingConfig extends FontErrorConfig {
    enabledSources: string[];
    timeouts: {
        google: number;
        local: number;
        system: number;
    };
    fallbackBehavior: {
        useSystemFonts: boolean;
        suppressErrors: boolean;
    };
    maxRetries: number;
    logging: {
        level: string;
        suppressRepeated: boolean;
        maxErrorsPerSource: number;
    };
    development: {
        disableExternalFonts: boolean;
        verboseLogging: boolean;
    };
}

export interface FontLoadResult {
    success: boolean;
    fontFamily: string;
    source: string;
    fallbackUsed: boolean;
    loadTime: number;
    error?: Error | null;
    cached?: boolean;
    originalFont?: string;
}

export interface FontLoadOptions {
    priority?: 'high' | 'normal' | 'low';
    timeout?: number;
    retries?: number;
    fallbackEnabled?: boolean;
    preload?: boolean;
}

export interface ApplyElementResults {
    total: number;
    successful: number;
    failed: number;
    elements: HTMLElement[];
}

export interface FontLoadStats {
    manager: {
        initialized: boolean;
        successfulLoads: number;
        failedSources: number;
        activeAttempts: number;
    };
    sources: any;
    fallbacks: any;
    errors: any;
    config: {
        enabledSources: string[];
        timeouts: any;
        fallbackBehavior: any;
    };
}

/**
 * フォント読み込み管理クラス
 * フォントソース、フォールバック、エラーハンドリングを統合管理
 */
export class FontLoadingManager {
    private static _instance: FontLoadingManager | null = null;
    private config: FontLoadingConfig;
    private sourceManager: FontSourceManager;
    private fallbackHandler: FontFallbackHandler;
    private errorHandler: FontErrorHandler;
    private loadAttempts: Map<string, Promise<FontLoadResult>>;
    private failedSources: Set<string>;
    private successfulLoads: Set<string>;
    private initialized: boolean;
    private globalErrorHandler: any;
    private errorIntegration: any;

    /**
     * シングルトンインスタンスを取得
     */
    static getInstance(config: Partial<FontLoadingConfig> = {}, globalErrorHandler: any = null): FontLoadingManager {
        if (!FontLoadingManager._instance) {
            FontLoadingManager._instance = new FontLoadingManager(config, globalErrorHandler);
        }
        return FontLoadingManager._instance;
    }

    constructor(config: Partial<FontLoadingConfig> = {}, globalErrorHandler: any = null) {
        this.config = this.mergeWithDefaults(config);
        this.sourceManager = new FontSourceManager(this.config);
        this.fallbackHandler = new FontFallbackHandler(this.config);
        this.errorHandler = new FontErrorHandler(this.config);
        
        this.loadAttempts = new Map<string, Promise<FontLoadResult>>();
        this.failedSources = new Set<string>();
        this.successfulLoads = new Set<string>();
        this.initialized = false;

        // ErrorHandler統合の設定
        this.globalErrorHandler = globalErrorHandler;
        this.errorIntegration = null;
        
        if (globalErrorHandler) {
            this.setupErrorIntegration();
        }

        console.log('FontLoadingManager initialized');
    }

    /**
     * エラーハンドラー統合をセットアップ
     */
    private async setupErrorIntegration(): Promise<void> {
        try {
            const { FontErrorIntegration } = await import('./FontErrorIntegration.js');
            this.errorIntegration = new FontErrorIntegration(this.globalErrorHandler, this.errorHandler);
            
            if (this.errorIntegration.initialize()) {
                if (this.config.development?.verboseLogging) {
                    console.log('[FontLoadingManager] ErrorHandler integration initialized');
                }
            } else {
                console.warn('[FontLoadingManager] ErrorHandler integration failed to initialize');
                this.errorIntegration = null;
            }
        } catch (error) {
            console.warn('[FontLoadingManager] Failed to setup ErrorHandler integration:', error);
            this.errorIntegration = null;
        }
    }

    /**
     * デフォルト設定とマージ
     */
    private mergeWithDefaults(config: Partial<FontLoadingConfig>): FontLoadingConfig {
        return {
            enabledSources: ['system', 'google', 'local'],
            timeouts: {
                google: 3000,
                local: 1000,
                system: 500
            },
            fallbackBehavior: {
                useSystemFonts: true,
                suppressErrors: true
            },
            maxRetries: 1,
            logging: {
                level: 'warn',
                suppressRepeated: true,
                maxErrorsPerSource: 3
            },
            development: {
                disableExternalFonts: false,
                verboseLogging: false
            },
            ...config
        };
    }

    /**
     * 初期化処理
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        try {
            // Check source availability
            const availableSources = this.sourceManager.getAvailableSources();
            if (this.config.development?.verboseLogging) {
                console.log('[FontLoadingManager] Available sources:', availableSources);
            }

            if (availableSources.length === 0) {
                console.warn('[FontLoadingManager] No font sources available');
            }

            this.initialized = true;

        } catch (error) {
            this.errorHandler.handleFontError(error as Error, {
                source: 'manager' as any,
                fontFamily: 'initialization'
            });
            
            // Continue with fallback behavior
            this.initialized = true;
        }
    }

    /**
     * フォントを読み込み
     */
    async loadFont(fontFamily: string, language: string = 'default', options: FontLoadOptions = {}): Promise<FontLoadResult> {
        if (!this.initialized) {
            await this.initialize();
        }

        const loadKey = `${fontFamily}:${language}`;

        // キャッシュチェック
        if (this.successfulLoads.has(loadKey)) {
            return {
                success: true,
                fontFamily: fontFamily,
                source: 'cached',
                fallbackUsed: false,
                loadTime: 0,
                cached: true
            };
        }

        // 既存の読み込み試行をチェック
        if (this.loadAttempts.has(loadKey)) {
            return await this.loadAttempts.get(loadKey)!;
        }

        const loadPromise = this.performFontLoad(fontFamily, language, options);
        this.loadAttempts.set(loadKey, loadPromise);

        try {
            const result = await loadPromise;
            if (result.success) {
                this.successfulLoads.add(loadKey);
            }
            return result;
        } finally {
            this.loadAttempts.delete(loadKey);
        }
    }

    /**
     * フォント読み込みを実行
     */
    private async performFontLoad(fontFamily: string, language: string, options: FontLoadOptions): Promise<FontLoadResult> {
        const startTime = Date.now();
        const availableSources = this.sourceManager.getAvailableSources();
        
        for (const sourceName of availableSources) {
            if (this.failedSources.has(`${sourceName}:${fontFamily}`)) {
                continue;
            }

            try {
                const result = await this.sourceManager.loadFromSource(sourceName, fontFamily, options);
                return {
                    success: true,
                    fontFamily: fontFamily,
                    source: sourceName,
                    fallbackUsed: false,
                    loadTime: Date.now() - startTime,
                    error: null
                };
            } catch (error) {
                const context = {
                    source: sourceName as any,
                    fontFamily: fontFamily
                };

                this.errorHandler.handleFontError(error as Error, context);
                this.failedSources.add(`${sourceName}:${fontFamily}`);
                
                if (this.config.development?.verboseLogging) {
                    console.warn(`[FontLoadingManager] Failed to load ${fontFamily} from ${sourceName}:`, (error as Error).message);
                }
            }
        }

        // All sources failed, apply fallback
        return this.applyFallbackStrategy(fontFamily, language, startTime);
    }

    /**
     * フォールバック戦略を適用
     */
    private applyFallbackStrategy(fontFamily: string, language: string, startTime: number): FontLoadResult {
        if (!this.config.fallbackBehavior.useSystemFonts) {
            return {
                success: false,
                fontFamily: fontFamily,
                source: 'none',
                fallbackUsed: false,
                loadTime: Date.now() - startTime,
                error: new Error('All font sources failed and fallback disabled')
            };
        }

        try {
            const fallbackFont = this.fallbackHandler.getSystemFontForLanguage(language);
            return {
                success: true,
                fontFamily: fallbackFont,
                source: 'fallback',
                fallbackUsed: true,
                loadTime: Date.now() - startTime,
                error: null,
                originalFont: fontFamily
            };
        } catch (error) {
            this.errorHandler.handleFontError(error as Error, {
                source: 'fallback' as any,
                fontFamily: fontFamily
            });

            return {
                success: false,
                fontFamily: fontFamily,
                source: 'fallback',
                fallbackUsed: false,
                loadTime: Date.now() - startTime,
                error: error as Error
            };
        }
    }

    /**
     * フォールバックフォントを取得
     */
    getFallbackFont(fontFamily: string, language: string): string {
        return this.fallbackHandler.getSystemFontForLanguage(language);
    }

    /**
     * ソースが利用可能かチェック
     */
    isSourceAvailable(sourceName: string): boolean {
        return this.sourceManager.isSourceAvailable(sourceName);
    }

    /**
     * 要素にフォントを適用
     */
    async applyFontToElement(element: HTMLElement, fontFamily: string, language: string, options: FontLoadOptions = {}): Promise<boolean> {
        try {
            const result = await this.loadFont(fontFamily, language, options);
            
            if (result.success) {
                if (result.fallbackUsed) {
                    this.fallbackHandler.applyFallback(element, language, fontFamily);
                } else {
                    element.style.fontFamily = fontFamily;
                }
                return true;
            } else {
                // Apply fallback even if loading failed
                this.fallbackHandler.applyFallback(element, language, fontFamily);
                return false;
            }
        } catch (error) {
            this.errorHandler.handleFontError(error as Error, {
                source: 'element' as any,
                fontFamily: fontFamily
            });

            this.fallbackHandler.applyFallback(element, language, fontFamily);
            return false;
        }
    }

    /**
     * 複数要素にフォントを適用
     */
    async applyFontToElements(selector: string, fontFamily: string, language: string, options: FontLoadOptions = {}): Promise<ApplyElementResults> {
        const elements = document.querySelectorAll(selector);
        const htmlElements = Array.from(elements) as HTMLElement[];
        
        const promises = htmlElements.map(element =>
            this.applyFontToElement(element, fontFamily, language, options)
        );
        
        const results = await Promise.allSettled(promises);
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;

        return {
            total: elements.length,
            successful: successCount,
            failed: elements.length - successCount,
            elements: htmlElements
        };
    }

    /**
     * ソースを有効化
     */
    enableSource(sourceName: string): void {
        this.sourceManager.enableSource(sourceName);
        this.failedSources.clear();
    }

    /**
     * ソースを無効化
     */
    disableSource(sourceName: string): void {
        this.sourceManager.disableSource(sourceName);
    }

    /**
     * キャッシュをクリア
     */
    clearCaches(): void {
        this.loadAttempts.clear();
        this.failedSources.clear();
        this.successfulLoads.clear();
        this.sourceManager.clearLoadHistory();
        this.fallbackHandler.clearFallbackHistory();
        this.errorHandler.clearErrorHistory();
        
        if (this.config.development?.verboseLogging) {
            console.log('[FontLoadingManager] All caches cleared');
        }
    }

    /**
     * 統計情報を取得
     */
    getStats(): FontLoadStats {
        return {
            manager: {
                initialized: this.initialized,
                successfulLoads: this.successfulLoads.size,
                failedSources: this.failedSources.size,
                activeAttempts: this.loadAttempts.size
            },
            sources: this.sourceManager.getStats(),
            fallbacks: this.fallbackHandler.getStats(),
            errors: this.errorHandler.getErrorStats(),
            config: {
                enabledSources: this.config.enabledSources,
                timeouts: this.config.timeouts,
                fallbackBehavior: this.config.fallbackBehavior
            }
        };
    }

    /**
     * 設定を更新
     */
    updateConfig(newConfig: Partial<FontLoadingConfig>): void {
        this.config = this.mergeWithDefaults({ ...this.config, ...newConfig });
        
        // Update child components
        this.sourceManager.updateConfig({
            enabledSources: this.config.enabledSources,
            timeouts: this.config.timeouts
        });

        if (this.config.development?.verboseLogging) {
            console.log('[FontLoadingManager] Configuration updated:', this.config);
        }
    }

    /**
     * フォントを事前読み込み
     */
    async preloadFonts(fontList: string[], language: string = 'default'): Promise<FontLoadResult[]> {
        const results: FontLoadResult[] = [];
        
        for (const fontFamily of fontList) {
            try {
                const result = await this.loadFont(fontFamily, language, { preload: true });
                results.push(result);
                
                if (this.config.development?.verboseLogging) {
                    console.log(`[FontLoadingManager] Preloaded ${fontFamily}: ${result.success}`);
                }
            } catch (error) {
                results.push({
                    success: false,
                    fontFamily: fontFamily,
                    source: 'error',
                    fallbackUsed: false,
                    loadTime: 0,
                    error: error as Error
                });
            }
        }

        return results;
    }

    /**
     * デバッグ情報を取得
     */
    getDebugInfo(): {
        config: FontLoadingConfig;
        stats: FontLoadStats;
        successfulLoads: string[];
        failedSources: string[];
        activeAttempts: string[];
    } {
        return {
            config: this.config,
            stats: this.getStats(),
            successfulLoads: Array.from(this.successfulLoads),
            failedSources: Array.from(this.failedSources),
            activeAttempts: Array.from(this.loadAttempts.keys())
        };
    }

    /**
     * リソースの解放
     */
    dispose(): void {
        this.clearCaches();
        this.initialized = false;

        if (this.config.development?.verboseLogging) {
            console.log('[FontLoadingManager] Disposed');
        }
    }
}

// エクスポート関数
export function getFontLoadingManager(): FontLoadingManager {
    return FontLoadingManager.getInstance();
}

export function createFontLoadingManager(config?: Partial<FontLoadingConfig>, errorHandler?: any): FontLoadingManager {
    return FontLoadingManager.getInstance(config, errorHandler);
}