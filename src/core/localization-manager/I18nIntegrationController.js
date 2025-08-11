/**
 * I18nIntegrationController - 国際化統合制御システム
 * 
 * 外部コンポーネント統合、パフォーマンス監視、セキュリティ管理、ファイルベース翻訳ローダーを専門的に管理します
 */
export class I18nIntegrationController {
    constructor() {
        // 外部コンポーネント（動的初期化）
        this.translationLoader = null;
        this.optimizedLoader = null;
        this.fontManager = null;
        this.performanceMonitor = null;
        this.renderOptimizer = null;
        this.securityManager = null;
        this.securityTester = null;
        
        // 初期化状態管理
        this.initializationState = {
            translationLoader: false,
            optimizedLoader: false,
            fontManager: false,
            performanceMonitor: false,
            renderOptimizer: false,
            securityManager: false,
            securityTester: false
        };
        
        // エラーハンドラー
        this.errorHandler = null;
        
        // 統合初期化
        this.initializeIntegrations();
    }
    
    /**
     * 統合コンポーネントの初期化
     */
    async initializeIntegrations() {
        try {
            // エラーハンドラーの初期化
            await this.initializeErrorHandler();
            
            // 翻訳ローダーの初期化
            await this.initializeTranslationLoaders();
            
            // フォントマネージャーの初期化
            await this.initializeFontManager();
            
            // パフォーマンス監視の初期化
            await this.initializePerformanceComponents();
            
            // セキュリティ管理の初期化
            await this.initializeSecurityComponents();
            
            console.log('I18n Integration Controller initialized');
        } catch (error) {
            console.error('Failed to initialize I18n integrations:', error);
        }
    }
    
    /**
     * エラーハンドラーの初期化
     */
    async initializeErrorHandler() {
        try {
            const { getErrorHandler } = await import('../../utils/ErrorHandler.js');
            this.errorHandler = getErrorHandler();
            console.log('Error handler initialized');
        } catch (error) {
            console.warn('Error handler not available:', error.message);
        }
    }
    
    /**
     * 翻訳ローダーの初期化
     */
    async initializeTranslationLoaders() {
        try {
            // 標準翻訳ローダー
            const { TranslationLoader } = await import('../i18n/TranslationLoader.js');
            this.translationLoader = new TranslationLoader();
            this.initializationState.translationLoader = true;
            
            // 最適化翻訳ローダー
            const { OptimizedTranslationLoader } = await import('../i18n/OptimizedTranslationLoader.js');
            this.optimizedLoader = new OptimizedTranslationLoader();
            this.initializationState.optimizedLoader = true;
            
            console.log('Translation loaders initialized');
        } catch (error) {
            console.warn('Translation loaders not available:', error.message);
        }
    }
    
    /**
     * フォントマネージャーの初期化
     */
    async initializeFontManager() {
        try {
            const { getFontManager } = await import('../i18n/FontManager.js');
            this.fontManager = getFontManager();
            this.initializationState.fontManager = true;
            console.log('Font manager initialized');
        } catch (error) {
            console.warn('Font manager not available:', error.message);
        }
    }
    
    /**
     * パフォーマンスコンポーネントの初期化
     */
    async initializePerformanceComponents() {
        try {
            // パフォーマンス監視
            const { I18nPerformanceMonitor } = await import('../i18n/I18nPerformanceMonitor.js');
            this.performanceMonitor = new I18nPerformanceMonitor();
            this.initializationState.performanceMonitor = true;
            
            // レンダリング最適化
            const { I18nRenderOptimizer } = await import('../i18n/I18nRenderOptimizer.js');
            this.renderOptimizer = new I18nRenderOptimizer();
            this.initializationState.renderOptimizer = true;
            
            console.log('Performance components initialized');
        } catch (error) {
            console.warn('Performance components not available:', error.message);
        }
    }
    
    /**
     * セキュリティコンポーネントの初期化
     */
    async initializeSecurityComponents() {
        try {
            // セキュリティ管理
            const { I18nSecurityManager } = await import('../i18n/I18nSecurityManager.js');
            this.securityManager = new I18nSecurityManager();
            this.initializationState.securityManager = true;
            
            // セキュリティテスター
            const { I18nSecurityTester } = await import('../i18n/I18nSecurityTester.js');
            this.securityTester = new I18nSecurityTester(this.securityManager);
            this.initializationState.securityTester = true;
            
            console.log('Security components initialized');
        } catch (error) {
            console.warn('Security components not available:', error.message);
        }
    }
    
    /**
     * 最適化されたローダーで言語をプリロード
     * @param {Array<string>} languages - 言語配列
     * @returns {Promise<boolean>} 成功フラグ
     */
    async preloadLanguages(languages) {
        if (!this.optimizedLoader) {
            console.warn('Optimized loader not available for preloading');
            return false;
        }
        
        try {
            await this.optimizedLoader.preloadLanguages(languages);
            return true;
        } catch (error) {
            console.error('Failed to preload languages:', error);
            return false;
        }
    }
    
    /**
     * 言語データをファイルから読み込み
     * @param {string} language - 言語コード
     * @returns {Promise<Object|null>} 翻訳データまたはnull
     */
    async loadLanguageData(language) {
        // ローダーが初期化されるまで待機
        let attempts = 0;
        const maxAttempts = 20; // 2秒間待機
        
        while ((!this.translationLoader && !this.optimizedLoader) && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        // 標準ローダーを優先（安定性重視）
        if (this.translationLoader) {
            try {
                const result = await this.translationLoader.loadLanguage(language);
                return result;
            } catch (error) {
                console.warn(`Standard loader failed for ${language}:`, error);
            }
        }
        
        // 最適化ローダーをフォールバック
        if (this.optimizedLoader) {
            try {
                const result = await this.optimizedLoader.loadLanguage(language);
                return result;
            } catch (error) {
                console.error(`Both loaders failed for ${language}:`, error);
            }
        }
        
        console.error(`No translation loaders available for ${language} after ${attempts} attempts`);
        return null;
    }
    
    /**
     * フォント設定を適用
     * @param {string} language - 言語コード
     * @param {HTMLElement} element - 対象要素
     * @returns {boolean} 成功フラグ
     */
    applyFontSettings(language, element = null) {
        if (!this.fontManager) {
            return false;
        }
        
        try {
            this.fontManager.applyLanguageFont(language, element);
            return true;
        } catch (error) {
            console.error('Failed to apply font settings:', error);
            return false;
        }
    }
    
    /**
     * パフォーマンス監視を開始
     * @param {string} language - 言語コード
     */
    startPerformanceMonitoring(language) {
        if (this.performanceMonitor) {
            try {
                this.performanceMonitor.startMonitoring(language);
            } catch (error) {
                console.error('Failed to start performance monitoring:', error);
            }
        }
    }
    
    /**
     * パフォーマンス監視を停止
     */
    stopPerformanceMonitoring() {
        if (this.performanceMonitor) {
            try {
                this.performanceMonitor.stopMonitoring();
            } catch (error) {
                console.error('Failed to stop performance monitoring:', error);
            }
        }
    }
    
    /**
     * レンダリング最適化を実行
     * @param {Object} renderContext - レンダリングコンテキスト
     * @returns {Object} 最適化されたコンテキスト
     */
    optimizeRendering(renderContext) {
        if (!this.renderOptimizer) {
            return renderContext;
        }
        
        try {
            return this.renderOptimizer.optimize(renderContext);
        } catch (error) {
            console.error('Failed to optimize rendering:', error);
            return renderContext;
        }
    }
    
    /**
     * 翻訳テキストのセキュリティ検証
     * @param {string} text - 検証対象テキスト
     * @param {string} language - 言語コード
     * @returns {Object} 検証結果
     */
    validateTranslationSecurity(text, language) {
        if (!this.securityManager) {
            return { isSecure: true, warnings: [] };
        }
        
        try {
            return this.securityManager.validateText(text, language);
        } catch (error) {
            console.error('Failed to validate translation security:', error);
            return { isSecure: false, warnings: ['Security validation failed'] };
        }
    }
    
    /**
     * セキュリティテストを実行
     * @param {Object} translationData - 翻訳データ
     * @returns {Object} テスト結果
     */
    runSecurityTests(translationData) {
        if (!this.securityTester) {
            return { passed: true, issues: [] };
        }
        
        try {
            return this.securityTester.runTests(translationData);
        } catch (error) {
            console.error('Failed to run security tests:', error);
            return { passed: false, issues: ['Security test execution failed'] };
        }
    }
    
    /**
     * エラーレポートを送信
     * @param {Error} error - エラーオブジェクト
     * @param {Object} context - エラーコンテキスト
     */
    reportError(error, context = {}) {
        if (this.errorHandler) {
            try {
                this.errorHandler.handleError(error, {
                    component: 'LocalizationManager',
                    ...context
                });
            } catch (handlerError) {
                console.error('Error handler failed:', handlerError);
            }
        } else {
            console.error('Localization error:', error, context);
        }
    }
    
    /**
     * パフォーマンス統計の取得
     * @returns {Object} パフォーマンス統計
     */
    getPerformanceStats() {
        if (!this.performanceMonitor) {
            return { monitoring: false };
        }
        
        try {
            return this.performanceMonitor.getStats();
        } catch (error) {
            console.error('Failed to get performance stats:', error);
            return { monitoring: false, error: error.message };
        }
    }
    
    /**
     * セキュリティ統計の取得
     * @returns {Object} セキュリティ統計
     */
    getSecurityStats() {
        if (!this.securityManager) {
            return { security: false };
        }
        
        try {
            return this.securityManager.getStats();
        } catch (error) {
            console.error('Failed to get security stats:', error);
            return { security: false, error: error.message };
        }
    }
    
    /**
     * 統合状態の取得
     * @returns {Object} 統合状態
     */
    getIntegrationStatus() {
        return {
            initialized: this.initializationState,
            components: {
                translationLoader: !!this.translationLoader,
                optimizedLoader: !!this.optimizedLoader,
                fontManager: !!this.fontManager,
                performanceMonitor: !!this.performanceMonitor,
                renderOptimizer: !!this.renderOptimizer,
                securityManager: !!this.securityManager,
                securityTester: !!this.securityTester,
                errorHandler: !!this.errorHandler
            },
            capabilities: {
                fileBasedLoading: !!this.translationLoader || !!this.optimizedLoader,
                optimizedLoading: !!this.optimizedLoader,
                fontManagement: !!this.fontManager,
                performanceMonitoring: !!this.performanceMonitor,
                renderOptimization: !!this.renderOptimizer,
                securityValidation: !!this.securityManager,
                securityTesting: !!this.securityTester,
                errorHandling: !!this.errorHandler
            }
        };
    }
    
    /**
     * 診断情報の取得
     * @returns {Object} 診断情報
     */
    getDiagnosticInfo() {
        return {
            integrationStatus: this.getIntegrationStatus(),
            performanceStats: this.getPerformanceStats(),
            securityStats: this.getSecurityStats(),
            loadedComponents: Object.keys(this.initializationState).filter(
                key => this.initializationState[key]
            ),
            failedComponents: Object.keys(this.initializationState).filter(
                key => !this.initializationState[key]
            ),
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * リソースの解放
     */
    destroy() {
        // パフォーマンス監視停止
        this.stopPerformanceMonitoring();
        
        // コンポーネントのクリーンアップ
        if (this.translationLoader && typeof this.translationLoader.destroy === 'function') {
            this.translationLoader.destroy();
        }
        
        if (this.optimizedLoader && typeof this.optimizedLoader.destroy === 'function') {
            this.optimizedLoader.destroy();
        }
        
        if (this.fontManager && typeof this.fontManager.destroy === 'function') {
            this.fontManager.destroy();
        }
        
        if (this.performanceMonitor && typeof this.performanceMonitor.destroy === 'function') {
            this.performanceMonitor.destroy();
        }
        
        if (this.renderOptimizer && typeof this.renderOptimizer.destroy === 'function') {
            this.renderOptimizer.destroy();
        }
        
        if (this.securityManager && typeof this.securityManager.destroy === 'function') {
            this.securityManager.destroy();
        }
        
        if (this.securityTester && typeof this.securityTester.destroy === 'function') {
            this.securityTester.destroy();
        }
        
        // 参照をクリア
        this.translationLoader = null;
        this.optimizedLoader = null;
        this.fontManager = null;
        this.performanceMonitor = null;
        this.renderOptimizer = null;
        this.securityManager = null;
        this.securityTester = null;
        this.errorHandler = null;
        
        console.log('I18n Integration Controller destroyed');
    }
}