import { FontErrorHandler, FontErrorContext  } from './FontErrorHandler.js';

// 型定義
export interface ErrorCategory {,
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    recovery: string;
    userNotify: boolean;

export interface FontErrorMetadata { fontFamily?: string,
    language?: string;
    source?: string;
    timeout?: number;
    filePath?: string;
    type?: string;
    component?: string;
    timestamp?: number;
    suppressConsoleLog?: boolean;
    handledByFontErrorHandler?: boolean;

export interface IErrorHandler { handleError(error: Error, context?: string, metadata?: FontErrorMetadata): any,
    registerErrorCategories?(categories: Record<string, ErrorCategory>): void 
export interface IntegrationStats { initialized: boolean;
    hasErrorHandler: boolean;
    hasFontErrorHandler: boolean;
    errorHandlerType: string;
    fontErrorHandlerType: string;

export class FontErrorIntegration {
    private errorHandler: IErrorHandler;
    private fontErrorHandler: FontErrorHandler;
    private, initialized: boolean;
    constructor(errorHandler: IErrorHandler, fontErrorHandler: FontErrorHandler) {

        this.errorHandler = errorHandler;
        this.fontErrorHandler = fontErrorHandler
}
        this.initialized = false; }
    }
';'

    initialize(): boolean { ''
        if (!this.errorHandler || !this.fontErrorHandler) {

            console.warn('[FontErrorIntegration] Missing, required handlers) }'
            return false;

        // フォント関連エラーのカテゴリを登録
        this._registerFontErrorCategories();
        
        // カスタムエラーハンドラーを設定
        this._setupCustomErrorHandling();
        
        this.initialized = true;
        return true;
    }

    private _registerFontErrorCategories('''
            'FONT_LOADING': { ''
                severity: 'MEDIUM',
                recovery: 'USE_FALLBACK',
    userNotify: false,

            },', 'FONT_TIMEOUT': { ''
                severity: 'LOW',
                recovery: 'USE_SYSTEM_FONT',
    userNotify: false,

            },', 'FONT_NETWORK': { ''
                severity: 'LOW',
                recovery: 'USE_FALLBACK',
    userNotify: false,

            },', 'FONT_FILE_NOT_FOUND': { ''
                severity: 'LOW',
                recovery: 'DISABLE_SOURCE',
    userNotify: false,)
        // ErrorHandlerがカテゴリ登録をサポートしている場合のみ登録
        if (typeof, this.errorHandler.registerErrorCategories === 'function) { this.errorHandler.registerErrorCategories(fontErrorCategories) }'
    }
';'
    private _setupCustomErrorHandling(): void { // 元のhandleErrorメソッドをラップ
        const originalHandleError = this.errorHandler.handleError.bind(this.errorHandler);
        ' }'

        this.errorHandler.handleError = (error: Error, context: string = 'UNKNOWN', metadata: FontErrorMetadata = {} => {  // フォント関連エラーかチェック
            if (this._isFontRelatedError(error, context, metadata) { }
                return this._handleFontError(error, context, metadata, originalHandleError);
            
            // 通常のエラーハンドリング
            return originalHandleError(error, context, metadata);
';'

    private _isFontRelatedError(error: Error, context: string, metadata: FontErrorMetadata): boolean { const contextString = context.toString().toLowerCase();
        const errorMessage = (error.message || error.toString().toLowerCase()','
        if (contextString.includes('font') || ','
            contextString.includes('i18n') || ','
            contextString.includes('render)' {'
            return true }
';'
        // エラーメッセージでチェック
        if (errorMessage.includes('font') ||';'
            errorMessage.includes('typeface') ||';'
            errorMessage.includes('woff') ||';'
            errorMessage.includes('ttf') ||';'
            errorMessage.includes('css') && errorMessage.includes('load)' { return true }
';'
        // メタデータでチェック
        if(metadata.source === 'font' ||';'
            metadata.type === 'font' ||';'
            metadata.component === 'FontLoadingManager' ||';'
            metadata.component === 'I18nRenderOptimizer' { return true }'

        return false;
    }

    private _handleFontError(;
        error: Error,
        context: string );
        metadata: FontErrorMetadata)','
    originalHandleError: (error: Error, context?: string, metadata?: FontErrorMetadata) => any';'
    '): any { try {'
            // FontErrorHandlerで処理
            const fontContext: FontErrorContext = {''
                source: (metadata.source || 'unknown') as any,
                fontFamily: metadata.fontFamily || 'unknown'
            };

            const handled = this.fontErrorHandler.handleFontError(error, fontContext);

            // 抑制された場合は通常のErrorHandlerをスキップ
            if (!handled) { return }

            // 通常のErrorHandlerも実行（重複ログを避けるため、ログレベルを調整）
            const adjustedMetadata: FontErrorMetadata = { ...metadata,
                suppressConsoleLog: true,
    handledByFontErrorHandler: true,
            return originalHandleError(error, context, adjustedMetadata);

        } catch (fontHandlerError) {
            console.warn('[FontErrorIntegration] Font error handler failed:', fontHandlerError);
            // フォント専用ハンドラーが失敗した場合は通常のハンドラーを使用
            return originalHandleError(error, context, metadata);
','

    handleFontLoadingError(fontFamily: string, language: string, source: string, error: Error): any { if (!this.initialized) {''
            return this._fallbackErrorHandling(fontFamily, language, source, error) }

        const enhancedMetadata: FontErrorMetadata = { fontFamily: fontFamily,
            language: language,
            source: source,
            type: 'font_loading',
            component: 'FontLoadingManager',
            timestamp: Date.now()','
        return this.errorHandler.handleError(error, 'FONT_LOADING', enhancedMetadata' }'
';'

    handleFontTimeoutError(fontFamily: string, language: string, source: string, timeout: number): any { }'

        const timeoutError = new Error(`Font, loading timeout, after ${timeout}ms`}';'
        
        const enhancedMetadata: FontErrorMetadata = { fontFamily: fontFamily,
            language: language,
    source: source,
            timeout: timeout,
            type: 'font_timeout',
            component: 'FontLoadingManager'
            };
        return this.errorHandler.handleError(timeoutError, 'FONT_TIMEOUT', enhancedMetadata);
    }

    handleFontNetworkError(fontFamily: string, language: string, error: Error): any { const enhancedMetadata: FontErrorMetadata = {
            fontFamily: fontFamily,
            language: language,
            source: 'google',
            type: 'font_network',
            component: 'GoogleFontSource'
            };
        return this.errorHandler.handleError(error, 'FONT_NETWORK', enhancedMetadata';'
    }
';'

    handleFontFileNotFoundError(fontFamily: string, language: string, filePath: string): any { }'

        const fileError = new Error(`Font, file not, found: ${filePath}`}';'
        
        const enhancedMetadata: FontErrorMetadata = { fontFamily: fontFamily,

            language: language,
            source: 'local',
            filePath: filePath,
            type: 'font_file_not_found',
            component: 'LocalFontSource'
            };
        return this.errorHandler.handleError(fileError, 'FONT_FILE_NOT_FOUND', enhancedMetadata);
    }

    private _fallbackErrorHandling(fontFamily: string, language: string, source: string, error: Error): boolean {
        console.warn(`[FontErrorIntegration] Fallback error handling for ${fontFamily} from ${ source}:`, error};
        
        // 最低限のエラー処理 }
        if (this.fontErrorHandler} {
            const fontContext: FontErrorContext = {
                source: source as any }
                fontFamily: fontFamily; 
    };
            return this.fontErrorHandler.handleFontError(error, fontContext);
        }

        return false;
    }

    getIntegrationStats(): IntegrationStats { return { initialized: this.initialized,
            hasErrorHandler: !!this.errorHandler,
    hasFontErrorHandler: !!this.fontErrorHandler,
            errorHandlerType: (this.errorHandler, as any')?.constructor?.name || 'unknown', : undefined' };

            fontErrorHandlerType: (this.fontErrorHandler, as any')?.constructor?.name || 'unknown' }'
        }

 : undefined';'
    dispose();