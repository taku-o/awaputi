export class FontErrorIntegration {
    constructor(errorHandler, fontErrorHandler) {
        this.errorHandler = errorHandler;
        this.fontErrorHandler = fontErrorHandler;
        this.initialized = false;
    }

    initialize() {
        if (!this.errorHandler || !this.fontErrorHandler) {
            console.warn('[FontErrorIntegration] Missing required handlers');
            return false;
        }

        // フォント関連エラーのカテゴリを登録
        this._registerFontErrorCategories();
        
        // カスタムエラーハンドラーを設定
        this._setupCustomErrorHandling();
        
        this.initialized = true;
        return true;
    }

    _registerFontErrorCategories() {
        // ErrorHandlerに新しいエラーカテゴリを登録する（可能な場合）
        const fontErrorCategories = {
            'FONT_LOADING': {
                severity: 'MEDIUM',
                recovery: 'USE_FALLBACK',
                userNotify: false
            },
            'FONT_TIMEOUT': {
                severity: 'LOW',
                recovery: 'USE_SYSTEM_FONT',
                userNotify: false
            },
            'FONT_NETWORK': {
                severity: 'LOW',
                recovery: 'USE_FALLBACK',
                userNotify: false
            },
            'FONT_FILE_NOT_FOUND': {
                severity: 'LOW',
                recovery: 'DISABLE_SOURCE',
                userNotify: false
            }
        };

        // ErrorHandlerがカテゴリ登録をサポートしている場合のみ登録
        if (typeof this.errorHandler.registerErrorCategories === 'function') {
            this.errorHandler.registerErrorCategories(fontErrorCategories);
        }
    }

    _setupCustomErrorHandling() {
        // 元のhandleErrorメソッドをラップ
        const originalHandleError = this.errorHandler.handleError.bind(this.errorHandler);
        
        this.errorHandler.handleError = (error, context = 'UNKNOWN', metadata = {}) => {
            // フォント関連エラーかチェック
            if (this._isFontRelatedError(error, context, metadata)) {
                return this._handleFontError(error, context, metadata, originalHandleError);
            }
            
            // 通常のエラーハンドリング
            return originalHandleError(error, context, metadata);
        };
    }

    _isFontRelatedError(error, context, metadata) {
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
            errorMessage.includes('css') && errorMessage.includes('load')) {
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

    _handleFontError(error, context, metadata, originalHandleError) {
        try {
            // FontErrorHandlerで処理
            const handled = this.fontErrorHandler.handleFontError(error, {
                source: metadata.source || 'unknown',
                fontFamily: metadata.fontFamily || 'unknown',
                language: metadata.language || 'default',
                ...metadata
            });

            // 抑制された場合は通常のErrorHandlerをスキップ
            if (!handled) {
                return;
            }

            // 通常のErrorHandlerも実行（重複ログを避けるため、ログレベルを調整）
            const adjustedMetadata = {
                ...metadata,
                suppressConsoleLog: true,
                handledByFontErrorHandler: true
            };

            return originalHandleError(error, context, adjustedMetadata);

        } catch (fontHandlerError) {
            console.warn('[FontErrorIntegration] Font error handler failed:', fontHandlerError);
            
            // フォント専用ハンドラーが失敗した場合は通常のハンドラーを使用
            return originalHandleError(error, context, metadata);
        }
    }

    handleFontLoadingError(fontFamily, language, source, error) {
        if (!this.initialized) {
            return this._fallbackErrorHandling(fontFamily, language, source, error);
        }

        const enhancedMetadata = {
            fontFamily: fontFamily,
            language: language,
            source: source,
            type: 'font_loading',
            component: 'FontLoadingManager',
            timestamp: Date.now()
        };

        return this.errorHandler.handleError(error, 'FONT_LOADING', enhancedMetadata);
    }

    handleFontTimeoutError(fontFamily, language, source, timeout) {
        const timeoutError = new Error(`Font loading timeout after ${timeout}ms`);
        
        const enhancedMetadata = {
            fontFamily: fontFamily,
            language: language,
            source: source,
            timeout: timeout,
            type: 'font_timeout',
            component: 'FontLoadingManager'
        };

        return this.errorHandler.handleError(timeoutError, 'FONT_TIMEOUT', enhancedMetadata);
    }

    handleFontNetworkError(fontFamily, language, error) {
        const enhancedMetadata = {
            fontFamily: fontFamily,
            language: language,
            source: 'google',
            type: 'font_network',
            component: 'GoogleFontSource'
        };

        return this.errorHandler.handleError(error, 'FONT_NETWORK', enhancedMetadata);
    }

    handleFontFileNotFoundError(fontFamily, language, filePath) {
        const fileError = new Error(`Font file not found: ${filePath}`);
        
        const enhancedMetadata = {
            fontFamily: fontFamily,
            language: language,
            source: 'local',
            filePath: filePath,
            type: 'font_file_not_found',
            component: 'LocalFontSource'
        };

        return this.errorHandler.handleError(fileError, 'FONT_FILE_NOT_FOUND', enhancedMetadata);
    }

    _fallbackErrorHandling(fontFamily, language, source, error) {
        console.warn(`[FontErrorIntegration] Fallback error handling for ${fontFamily} from ${source}:`, error);
        
        // 最低限のエラー処理
        if (this.fontErrorHandler) {
            return this.fontErrorHandler.handleFontError(error, {
                source: source,
                fontFamily: fontFamily,
                language: language
            });
        }

        return false;
    }

    getIntegrationStats() {
        return {
            initialized: this.initialized,
            hasErrorHandler: !!this.errorHandler,
            hasFontErrorHandler: !!this.fontErrorHandler,
            errorHandlerType: this.errorHandler?.constructor?.name || 'unknown',
            fontErrorHandlerType: this.fontErrorHandler?.constructor?.name || 'unknown'
        };
    }

    dispose() {
        // 元のhandleErrorメソッドを復元する処理があれば実装
        this.initialized = false;
    }
}