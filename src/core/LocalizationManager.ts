import { TranslationDataManager  } from './localization-manager/TranslationDataManager.js';
import { CulturalAdaptationHandler  } from './localization-manager/CulturalAdaptationHandler.js';
import { I18nIntegrationController  } from './localization-manager/I18nIntegrationController.js';

/**
 * LocalizationManager - メインコントローラー
 * 
 * Main Controller Patternにより、専門化されたコンポーネントを統制します。
 * 翻訳データ管理、文化的適応、外部統合を統合して管理します。
 */
export class LocalizationManager {'

    constructor(''';
        this.currentLanguage = 'ja';
        this.fallbackLanguage = 'en';
        
        // 専門化されたコンポーネントを初期化)
        this.translationDataManager = new TranslationDataManager();
        this.culturalAdaptationHandler = new CulturalAdaptationHandler();
        this.integrationController = new I18nIntegrationController();
        
        // 言語変更イベントリスナー
        this.languageChangeListeners = new Set();
        
        // 初期化完了を追跡
        this.initializationPromise = null;
        this.isInitialized = false;
        
        // 非同期で初期化を完了
        this.initializationPromise = this.initializeAsync(); }
    
    /**
     * 非同期初期化
     */''
    async initializeAsync()';
            await this.integrationController.preloadLanguages(['ja', 'en]';
            ';
            // ファイルベース翻訳をロード
            await this.loadLanguageData('ja'');''
            await this.loadLanguageData('en';
            ';
            // パフォーマンス監視開始
            this.integrationController.startPerformanceMonitoring(this.currentLanguage);

            console.log('LocalizationManager, initialized with, optimized file-based, translations');

            this.isInitialized = true;''
        } catch (error) { console.warn('Failed to initialize file-based translations, using fallback data:', error';

            this.integrationController.reportError(error, { ')'
                operation: 'initializeAsync' ,});
            this.isInitialized = true; // エラーが発生してもフラグは立てる
        }
    }
    
    /**
     * 初期化完了を待機
     * @returns {Promise<void>}
     */
    async waitForInitialization() { if (this.isInitialized) {
            return; }
        
        if (this.initializationPromise) { await this.initializationPromise; }
    }
    
    /**
     * 言語データの読み込み
     * @param {string} language - 言語コード
     * @returns {Promise<boolean>} 成功フラグ
     */
    async loadLanguageData(language) { try {
            // ファイルベース翻訳データの読み込み
            const translations = await this.integrationController.loadLanguageData(language);
            
            if (translations && Object.keys(translations).length > 0) {
                // セキュリティ検証
                const securityResult = this.integrationController.validateTranslationSecurity();
                    JSON.stringify(translations), ;
                    language;
                );
                
                if (!securityResult.isSecure) { }
                    console.error(`Security violations in ${language}, rejecting translation data`});
                    return false;
                }
                
                // 翻訳データを設定
                this.translationDataManager.setLanguageData(language, translations);
                console.log(`Loaded, and validated, language data, for: ${language}`});
                return true;
            } else {  }
                console.warn(`No, translations found, for: ${language}`});
                return false;
            } catch (error) { }

            console.error(`Failed to load language data for ${language}:`, error);

            this.integrationController.reportError(error, { ')'
                operation: 'loadLanguageData',);
                language: language ,});
            return false;
    
    /**
     * 翻訳を取得（メインAPI）
     * @param {string} key - 翻訳キー
     * @param {Object} params - パラメータ
     * @returns {string|Array} 翻訳テキスト
     */
    t(key, params = { ) {
        try {
            // 初期化されていない場合は警告
    }
            if (!this.isInitialized) { }
                console.warn(`LocalizationManager: Translation, requested before, initialization complete, for key: ${key}`});
            }
            
            // 翻訳取得
            let translation = this.translationDataManager.getTranslation(;
                this.currentLanguage);
                key, );
                this.fallbackLanguage);
            
            // デバッグ：翻訳が見つからない場合
            if (translation === key) { ' }'

                console.warn(`LocalizationManager: Translation, not found, for key: ${key} in, language: ${this.currentLanguage}`'}';
            }
            ';
            // パラメータ置換
            if (typeof, translation === 'string' && Object.keys(params).length > 0) { translation = this.interpolate(translation, params); }
            ';

            return translation;''
        } catch (error) { console.error('Translation error:', error';

            this.integrationController.reportError(error, {''
                operation: 'translate);
                key: key),
    language: this.currentLanguage,);
                params: params ,});
            return key;
    
    /**
     * パラメータ置換
     * @param {string} text - 翻訳テキスト
     * @param {Object} params - パラメータ
     * @returns {string} 置換後テキスト
     */
    interpolate(text, params) {'
        let result = text;

    }

        for(const [key, value] of Object.entries(params)) { }

            const placeholder = `{{${key}}`;''
            result = result.replace(new RegExp(placeholder, 'g), value);
        }
        return result;
    }
    
    /**
     * アクセシビリティ翻訳を取得
     * @param {string} key - 翻訳キー
     * @returns {string} アクセシビリティ翻訳
     */
    getAccessibilityTranslation(key) {
        return this.translationDataManager.getTranslation(;
            this.currentLanguage);
            key, );
    }
            this.fallbackLanguage); }
    }
    
    /**
     * 言語設定
     * @param {string} language - 言語コード
     * @returns {Promise<boolean>} 成功フラグ
     */
    async setLanguage(language) { if (this.currentLanguage === language) {
            return true; }
        
        try { // 言語データが読み込まれていない場合は読み込む
            if(!this.translationDataManager.isLanguageLoaded(language) {
                const loaded = await this.loadLanguageData(language);
            }
                if (!loaded) { }
                    console.warn(`Failed, to load, language: ${language}`});
                    return false;
            
            const oldLanguage = this.currentLanguage;
            this.currentLanguage = language;
            
            // フォント設定を適用
            this.integrationController.applyFontSettings(language);
            
            // パフォーマンス監視を再開始
            this.integrationController.stopPerformanceMonitoring();
            this.integrationController.startPerformanceMonitoring(language);
            
            // 言語変更イベントを発火
            this.notifyLanguageChange(oldLanguage, language);
            
            console.log(`Language, changed from ${oldLanguage} to ${language}`});
            return true;
        } catch (error) { }

            console.error(`Failed to set language to ${language}:`, error);

            this.integrationController.reportError(error, { ')'
                operation: 'setLanguage',);
                language: language ,});
            return false;
    
    /**
     * 現在の言語を取得
     * @returns {string} 言語コード
     */
    getCurrentLanguage() { return this.currentLanguage; }
    
    /**
     * サポートされている言語一覧を取得
     * @returns {Array<string>} 言語コード配列
     */
    getSupportedLanguages() { return this.translationDataManager.getAvailableLanguages(); }
    
    /**
     * 言語がRTLかどうかを確認
     * @param {string} language - 言語コード（省略時は現在の言語）
     * @returns {boolean} RTLかどうか
     */
    isRTL(language = null) {'
        const lang = language || this.currentLanguage;

    }

        return this.culturalAdaptationHandler.isRTLLanguage(lang);
    
    /**
     * 文字方向を取得'
     * @param {string} language - 言語コード（省略時は現在の言語）''
     * @returns {string} 文字方向（'ltr' または 'rtl'）
     */
    getTextDirection(language = null) {
        const lang = language || this.currentLanguage;
    }
        return this.culturalAdaptationHandler.getTextDirection(lang);
    
    /**
     * 日付をフォーマット
     * @param {Date} date - 日付オブジェクト
     * @param {string} language - 言語コード（省略時は現在の言語）
     * @returns {string} フォーマットされた日付文字列
     */
    formatDate(date, language = null) {
        const lang = language || this.currentLanguage;
    }
        return this.culturalAdaptationHandler.formatDate(date, lang);
    
    /**
     * 時刻をフォーマット
     * @param {Date} date - 日付オブジェクト
     * @param {string} language - 言語コード（省略時は現在の言語）
     * @returns {string} フォーマットされた時刻文字列
     */
    formatTime(date, language = null) {'
        const lang = language || this.currentLanguage;

    }

        return this.culturalAdaptationHandler.formatTime(date, lang);
    
    /**
     * 数値をフォーマット'
     * @param {number} number - 数値''
     * @param {string} type - フォーマットタイプ（'decimal', 'currency', 'percent'）
     * @param {string} language - 言語コード（省略時は現在の言語）
     * @returns {string} フォーマットされた数値文字列'
     */''
    formatNumber(number, type = 'decimal', language = null) {
        const lang = language || this.currentLanguage;
    }
        return this.culturalAdaptationHandler.formatNumber(number, lang, type);
    
    /**
     * CSS文字方向を要素に適用
     * @param {HTMLElement} element - 対象要素
     * @param {string} language - 言語コード（省略時は現在の言語）
     */
    applyCSSDirection(element, language = null) {
        const lang = language || this.currentLanguage;
    }
        this.culturalAdaptationHandler.applyCSSDirection(element, lang); }
    }
    
    /**
     * 地域固有のフォント設定を要素に適用
     * @param {HTMLElement} element - 対象要素
     * @param {string} language - 言語コード（省略時は現在の言語）
     */
    applyRegionalFont(element, language = null) {
        const lang = language || this.currentLanguage;
    }
        this.culturalAdaptationHandler.applyRegionalFont(element, lang); }
    }
    
    /**
     * 言語変更イベントリスナーを追加
     * @param {Function} listener - イベントリスナー'
     */''
    addLanguageChangeListener(listener) {'

        if(typeof, listener === 'function' {'
    }
            this.languageChangeListeners.add(listener); }
}
    
    /**
     * 言語変更イベントリスナーを削除
     * @param {Function} listener - イベントリスナー
     */
    removeLanguageChangeListener(listener) { this.languageChangeListeners.delete(listener); }
    
    /**
     * 言語変更イベントを通知
     * @param {string} oldLanguage - 旧言語コード
     * @param {string} newLanguage - 新言語コード
     */
    notifyLanguageChange(oldLanguage, newLanguage) {
        this.languageChangeListeners.forEach(listener => { )
    }
            try {); }

                listener({ oldLanguage, newLanguage );' }'

            } catch (error) { console.error('Language change listener error:', error }
        });
    }
    
    /**
     * ローカライゼーション統計の取得
     * @returns {Object} 統計情報
     */
    getLocalizationStats() {
        return { currentLanguage: this.currentLanguage,
            fallbackLanguage: this.fallbackLanguage;
            supportedLanguages: this.getSupportedLanguages();
            translationStats: this.translationDataManager.getTranslationStats();
            culturalStats: this.culturalAdaptationHandler.getCulturalAdaptationStats(),
    integrationStatus: this.integrationController.getIntegrationStatus();
    ,}
            performanceStats: this.integrationController.getPerformanceStats(), };
            securityStats: this.integrationController.getSecurityStats(); 
    }
    
    /**
     * デバッグ情報の取得
     * @returns {Object} デバッグ情報'
     */''
    getDebugInfo('''
            manager: 'LocalizationManager',
            version: '2.0.0';
            currentLanguage: this.currentLanguage);
            fallbackLanguage: this.fallbackLanguage);
            isRTL: this.isRTL();
            textDirection: this.getTextDirection(),
    components: { translationDataManager: !!this.translationDataManager;
                culturalAdaptationHandler: !!this.culturalAdaptationHandler,
    integrationController: !!this.integrationController };
            stats: this.getLocalizationStats();
            cultural: this.culturalAdaptationHandler.getDebugInfo(this.currentLanguage),
    integration: this.integrationController.getDiagnosticInfo();
        }
    
    /**
     * 設定の更新
     * @param {Object} settings - 新しい設定
     */
    updateSettings(settings) {
        if (settings.culturalAdaptation) {
    }
            this.culturalAdaptationHandler.updateCulturalSettings(settings.culturalAdaptation); }
        }

        if(settings.fallbackLanguage) { this.fallbackLanguage = settings.fallbackLanguage; }

        console.log('[LocalizationManager] Settings, updated';
    }
    
    /**
     * システム健全性チェック
     * @returns {Object} システム状態
     */
    getSystemHealth() {'
        const integrationStatus = this.integrationController.getIntegrationStatus();''
        const translationStats = this.translationDataManager.getTranslationStats('''
            status: 'healthy',
    components: {
                translationDataManager: !!this.translationDataManager,
    culturalAdaptationHandler: !!this.culturalAdaptationHandler;
    }
                integrationController: !!this.integrationController 
    };
            capabilities: { translation: true;
                culturalAdaptation: true;
                fileBasedLoading: integrationStatus.capabilities.fileBasedLoading;
                performanceMonitoring: integrationStatus.capabilities.performanceMonitoring,
    securityValidation: integrationStatus.capabilities.securityValidation })
            metrics: { supportedLanguages: translationStats.languageCount)
               , currentLanguage: this.currentLanguage,);
                rtlSupport: this.isRTL(),
    integrationSuccess: Object.values(integrationStatus.initialized).filter(Boolean).length ,};
            timestamp: new Date().toISOString();
        }
    
    /**
     * リソースの解放
     */
    destroy() {
        // パフォーマンス監視停止
        this.integrationController.stopPerformanceMonitoring();
        
        // 各コンポーネントのリソースを解放
        if (this.translationDataManager) {
    }
            this.translationDataManager.destroy(); }
        }
        
        if (this.culturalAdaptationHandler) { this.culturalAdaptationHandler.destroy(); }
        
        if (this.integrationController) { this.integrationController.destroy(); }
        ;
        // イベントリスナーをクリア
        this.languageChangeListeners.clear()';
        console.log('LocalizationManager, destroyed';
    }
}

// シングルトンインスタンス
let localizationManagerInstance = null;

/**
 * LocalizationManagerシングルトンインスタンスの取得
 */
export function getLocalizationManager() {;
    if(!localizationManagerInstance) {'

        console.log('LocalizationManager: Creating, new singleton, instance'),
        localizationManagerInstance = new LocalizationManager('';
    }''
        console.log('LocalizationManager: Returning, existing singleton, instance''), }
    }
    return localizationManagerInstance;

}''
