import { FontErrorHandler, FontErrorContext } from './FontErrorHandler.js';

// 型定義
export interface ErrorCategory {
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    recovery: string;
    userNotify: boolean;
}

export interface FontErrorMetadata {
    fontFamily?: string;
    language?: string;
    source?: string;
    timeout?: number;
    filePath?: string;
    type?: string;
    component?: string;
    timestamp?: number;
    suppressConsoleLog?: boolean;
    handledByFontErrorHandler?: boolean;
}

export interface IErrorHandler {
    handleError(error: Error, context?: string, metadata?: FontErrorMetadata): any;
    registerErrorCategories?(categories: Record<string, ErrorCategory>): void;
}

export interface IntegrationStats {
    initialized: boolean;
    hasErrorHandler: boolean;
    hasFontErrorHandler: boolean;
    errorHandlerType: string;
    fontErrorHandlerType: string;
    handlersWrapped: boolean;
    categoriesRegistered: boolean;
}

export interface FontErrorHandlingOptions {
    suppressConsoleOutput?: boolean;
    enableFallbackHandling?: boolean;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    contextualErrorMessages?: boolean;
}

/**
 * フォントエラー統合システム
 * 既存のエラーハンドラーとフォント専用エラーハンドラーを統合
 */
export class FontErrorIntegration {
    private errorHandler: IErrorHandler;
    private fontErrorHandler: FontErrorHandler;
    private initialized: boolean;
    private originalHandleError?: Function;
    private options: FontErrorHandlingOptions;

    constructor(
        errorHandler: IErrorHandler,
        fontErrorHandler: FontErrorHandler,
        options: FontErrorHandlingOptions = {}
    ) {
        this.errorHandler = errorHandler;
        this.fontErrorHandler = fontErrorHandler;
        this.initialized = false;
        this.options = {
            suppressConsoleOutput: false,
            enableFallbackHandling: true,
            logLevel: 'warn',
            contextualErrorMessages: true,
            ...options
        };

        console.log('FontErrorIntegration created');
    }

    /**
     * 統合システムを初期化
     */
    initialize(): boolean {
        if (!this.errorHandler || !this.fontErrorHandler) {
            console.warn('[FontErrorIntegration] Missing required handlers');
            return false;
        }

        try {
            // フォント関連エラーのカテゴリを登録
            this.registerFontErrorCategories();
            
            // カスタムエラーハンドラーを設定
            this.setupCustomErrorHandling();
            
            this.initialized = true;
            console.log('[FontErrorIntegration] Successfully initialized');
            return true;

        } catch (error) {
            console.error('[FontErrorIntegration] Initialization failed:', error);
            return false;
        }
    }

    /**
     * フォントエラーのカテゴリを登録
     */
    private registerFontErrorCategories(): void {
        const fontErrorCategories: Record<string, ErrorCategory> = {
            FONT_LOADING: {
                severity: 'MEDIUM',
                recovery: 'USE_FALLBACK',
                userNotify: false
            },
            FONT_TIMEOUT: {
                severity: 'LOW',
                recovery: 'USE_SYSTEM_FONT',
                userNotify: false
            },
            FONT_NETWORK: {
                severity: 'LOW',
                recovery: 'USE_FALLBACK',
                userNotify: false
            },
            FONT_FILE_NOT_FOUND: {
                severity: 'LOW',
                recovery: 'DISABLE_SOURCE',
                userNotify: false
            }
        };

        // ErrorHandlerがカテゴリ登録をサポートしている場合のみ登録
        if (typeof this.errorHandler.registerErrorCategories === 'function') {
            this.errorHandler.registerErrorCategories(fontErrorCategories);
            console.log('[FontErrorIntegration] Font error categories registered');
        }
    }

    /**
     * カスタムエラーハンドリングを設定
     */
    private setupCustomErrorHandling(): void {
        // 元のhandleErrorメソッドを保存
        this.originalHandleError = this.errorHandler.handleError.bind(this.errorHandler);

        // handleErrorメソッドをラップ
        this.errorHandler.handleError = (
            error: Error,
            context: string = 'UNKNOWN',
            metadata: FontErrorMetadata = {}
        ) => {
            // フォント関連エラーかチェック
            if (this.isFontRelatedError(error, context, metadata)) {
                return this.handleFontError(error, context, metadata, this.originalHandleError!);
            }
            
            // 通常のエラーハンドリング
            return this.originalHandleError!(error, context, metadata);
        };

        console.log('[FontErrorIntegration] Custom error handling setup complete');
    }

    /**
     * フォント関連エラーかどうかを判定
     */
    private isFontRelatedError(error: Error, context: string, metadata: FontErrorMetadata): boolean {
        const contextString = context.toString().toLowerCase();
        const errorMessage = (error.message || error.toString()).toLowerCase();

        // コンテキストでチェック
        if (contextString.includes('font') ||
            contextString.includes('i18n') ||
            contextString.includes('render')) {
            return true;
        }

        // エラーメッセージでチェック
        if (errorMessage.includes('font') ||
            errorMessage.includes('typeface') ||
            errorMessage.includes('woff') ||
            errorMessage.includes('ttf') ||
            (errorMessage.includes('css') && errorMessage.includes('load'))) {
            return true;
        }

        // メタデータでチェック
        if (metadata.source === 'font' ||
            metadata.type === 'font' ||
            metadata.component === 'FontLoadingManager' ||
            metadata.component === 'I18nRenderOptimizer') {
            return true;
        }

        return false;
    }

    /**
     * フォントエラーを処理
     */
    private handleFontError(
        error: Error,
        context: string,
        metadata: FontErrorMetadata,
        originalHandleError: Function
    ): any {
        try {
            // FontErrorHandlerで処理
            const fontContext: FontErrorContext = {
                source: (metadata.source || 'unknown') as any,
                fontFamily: metadata.fontFamily || 'unknown',
                url: metadata.filePath,
                timeout: metadata.timeout
            };

            const handled = this.fontErrorHandler.handleFontError(error, fontContext);

            // 抑制された場合は通常のErrorHandlerをスキップ
            if (!handled) {
                return;
            }

            // 通常のErrorHandlerも実行（重複ログを避けるため、ログレベルを調整）
            const adjustedMetadata: FontErrorMetadata = {
                ...metadata,
                suppressConsoleLog: this.options.suppressConsoleOutput,
                handledByFontErrorHandler: true
            };

            return originalHandleError(error, context, adjustedMetadata);

        } catch (fontHandlerError) {
            console.warn('[FontErrorIntegration] Font error handler failed:', fontHandlerError);
            // フォント専用ハンドラーが失敗した場合は通常のハンドラーを使用
            return originalHandleError(error, context, metadata);
        }
    }

    /**
     * フォント読み込みエラーを処理
     */
    handleFontLoadingError(fontFamily: string, language: string, source: string, error: Error): any {
        if (!this.initialized) {
            return this.fallbackErrorHandling(fontFamily, language, source, error);
        }

        const enhancedMetadata: FontErrorMetadata = {
            fontFamily: fontFamily,
            language: language,
            source: source,
            type: 'font_loading',
            component: 'FontLoadingManager',
            timestamp: Date.now()
        };

        return this.errorHandler.handleError(error, 'FONT_LOADING', enhancedMetadata);
    }

    /**
     * フォントタイムアウトエラーを処理
     */
    handleFontTimeoutError(fontFamily: string, language: string, source: string, timeout: number): any {
        const timeoutError = new Error(`Font loading timeout after ${timeout}ms`);
        
        const enhancedMetadata: FontErrorMetadata = {
            fontFamily: fontFamily,
            language: language,
            source: source,
            timeout: timeout,
            type: 'font_timeout',
            component: 'FontLoadingManager'
        };

        return this.errorHandler.handleError(timeoutError, 'FONT_TIMEOUT', enhancedMetadata);
    }

    /**
     * フォントネットワークエラーを処理
     */
    handleFontNetworkError(fontFamily: string, language: string, error: Error): any {
        const enhancedMetadata: FontErrorMetadata = {
            fontFamily: fontFamily,
            language: language,
            source: 'google',
            type: 'font_network',
            component: 'GoogleFontSource'
        };

        return this.errorHandler.handleError(error, 'FONT_NETWORK', enhancedMetadata);
    }

    /**
     * フォントファイル未検出エラーを処理
     */
    handleFontFileNotFoundError(fontFamily: string, language: string, filePath: string): any {
        const fileError = new Error(`Font file not found: ${filePath}`);
        
        const enhancedMetadata: FontErrorMetadata = {
            fontFamily: fontFamily,
            language: language,
            source: 'local',
            filePath: filePath,
            type: 'font_file_not_found',
            component: 'LocalFontSource'
        };

        return this.errorHandler.handleError(fileError, 'FONT_FILE_NOT_FOUND', enhancedMetadata);
    }

    /**
     * フォールバックエラーハンドリング
     */
    private fallbackErrorHandling(fontFamily: string, language: string, source: string, error: Error): boolean {
        if (!this.options.enableFallbackHandling) {
            return false;
        }

        console.warn(`[FontErrorIntegration] Fallback error handling for ${fontFamily} from ${source}:`, error);
        
        // 最低限のエラー処理
        if (this.fontErrorHandler) {
            const fontContext: FontErrorContext = {
                source: source as any,
                fontFamily: fontFamily
            };
            return this.fontErrorHandler.handleFontError(error, fontContext);
        }

        return false;
    }

    /**
     * 統合統計を取得
     */
    getIntegrationStats(): IntegrationStats {
        return {
            initialized: this.initialized,
            hasErrorHandler: !!this.errorHandler,
            hasFontErrorHandler: !!this.fontErrorHandler,
            errorHandlerType: (this.errorHandler as any)?.constructor?.name || 'unknown',
            fontErrorHandlerType: (this.fontErrorHandler as any)?.constructor?.name || 'unknown',
            handlersWrapped: !!this.originalHandleError,
            categoriesRegistered: typeof this.errorHandler.registerErrorCategories === 'function'
        };
    }

    /**
     * 設定を更新
     */
    updateOptions(options: Partial<FontErrorHandlingOptions>): void {
        this.options = { ...this.options, ...options };
        console.log('[FontErrorIntegration] Options updated:', options);
    }

    /**
     * デバッグ情報を取得
     */
    getDebugInfo(): {
        initialized: boolean;
        options: FontErrorHandlingOptions;
        stats: IntegrationStats;
        errorHandlerMethods: string[];
        fontErrorHandlerMethods: string[];
    } {
        return {
            initialized: this.initialized,
            options: this.options,
            stats: this.getIntegrationStats(),
            errorHandlerMethods: Object.getOwnPropertyNames(Object.getPrototypeOf(this.errorHandler))
                .filter(name => typeof (this.errorHandler as any)[name] === 'function'),
            fontErrorHandlerMethods: Object.getOwnPropertyNames(Object.getPrototypeOf(this.fontErrorHandler))
                .filter(name => typeof (this.fontErrorHandler as any)[name] === 'function')
        };
    }

    /**
     * リソースの解放
     */
    dispose(): void {
        // 元のhandleErrorメソッドを復元
        if (this.originalHandleError) {
            this.errorHandler.handleError = this.originalHandleError;
            this.originalHandleError = undefined;
        }

        this.initialized = false;
        console.log('[FontErrorIntegration] Disposed');
    }
}

// シングルトンインスタンス
let fontErrorIntegrationInstance: FontErrorIntegration | null = null;

/**
 * FontErrorIntegrationのシングルトンインスタンスを取得
 */
export function getFontErrorIntegration(): FontErrorIntegration | null {
    return fontErrorIntegrationInstance;
}

/**
 * FontErrorIntegrationのシングルトンインスタンスを設定
 */
export function setFontErrorIntegration(integration: FontErrorIntegration): void {
    fontErrorIntegrationInstance = integration;
}

/**
 * FontErrorIntegrationインスタンスを作成
 */
export function createFontErrorIntegration(
    errorHandler: IErrorHandler,
    fontErrorHandler: FontErrorHandler,
    options?: FontErrorHandlingOptions
): FontErrorIntegration {
    const integration = new FontErrorIntegration(errorHandler, fontErrorHandler, options);
    setFontErrorIntegration(integration);
    return integration;
}