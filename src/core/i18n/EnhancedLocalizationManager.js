import { LocalizationManager } from '../LocalizationManager.js';
import { LanguageDetector } from './LanguageDetector.js';
import { TranslationCache } from './TranslationCache.js';
import { TranslationLoader } from './TranslationLoader.js';
import { FormatterEngine } from './FormatterEngine.js';
import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * 拡張ローカライゼーション管理クラス - 高度な多言語対応システム
 */
export class EnhancedLocalizationManager extends LocalizationManager {
    constructor() {
        super();
        
        // 新しいコンポーネント
        this.languageDetector = new LanguageDetector(this);
        this.translationCache = new TranslationCache(1000);
        this.translationLoader = new TranslationLoader();
        this.formatterEngine = new FormatterEngine();
        
        // 言語変更リスナー
        this.changeListeners = new Set();
        
        // ロード状態管理
        this.loadingPromises = new Map();
        this.isInitialized = false;
        
        // パフォーマンス監視
        this.performanceMetrics = {
            translationCalls: 0,
            cacheHits: 0,
            cacheMisses: 0,
            loadTimes: [],
            averageLoadTime: 0
        };
        
        // サポート言語を更新
        this.updateSupportedLanguages();
        
        // 初期化
        this.initialize();
    }
    
    /**
     * システムを初期化
     */
    async initialize() {
        try {
            // 最適な言語を検出
            const detectedLanguage = this.languageDetector.detect();
            
            // 検出された言語を設定
            if (detectedLanguage && this.languageDetector.isSupported(detectedLanguage)) {
                await this.setLanguage(detectedLanguage);
            }
            
            this.isInitialized = true;
            console.log('Enhanced LocalizationManager initialized');
        } catch (error) {
            getErrorHandler().handleError(error, 'LOCALIZATION_INIT_ERROR', {
                operation: 'initialize'
            });
        }
    }
    
    /**
     * 言語を設定（非同期版）
     */
    async setLanguage(language) {
        try {
            const normalized = this.languageDetector.normalizeLanguageCode(language);
            if (!normalized || !this.languageDetector.isSupported(normalized)) {
                console.warn(`Language not supported: ${language}`);
                return false;
            }
            
            const oldLanguage = this.currentLanguage;
            
            // 翻訳データを読み込み
            const startTime = Date.now();
            await this.loadLanguageData(normalized);
            const loadTime = Date.now() - startTime;
            
            // パフォーマンス記録
            this.recordLoadTime(loadTime);
            
            // 言語を設定
            const success = super.setLanguage(normalized);
            
            if (success) {
                // 言語設定を保存
                this.languageDetector.saveLanguagePreference(normalized);
                
                // 変更イベントを発火
                this.notifyLanguageChange(normalized, oldLanguage);
                
                console.log(`Language changed from ${oldLanguage} to ${normalized} (${loadTime}ms)`);
            }
            
            return success;
        } catch (error) {
            getErrorHandler().handleError(error, 'LOCALIZATION_ERROR', {
                operation: 'setLanguage',
                language: language
            });
            return false;
        }
    }
    
    /**
     * 翻訳を取得（拡張版）
     */
    t(key, params = {}, options = {}) {
        const startTime = performance.now();
        
        try {
            this.performanceMetrics.translationCalls++;
            
            const {
                language = this.currentLanguage,
                fallback = true,
                cache = true,
                format = true
            } = options;
            
            // キャッシュから確認
            if (cache) {
                const cached = this.translationCache.get(key, language);
                if (cached !== null) {
                    this.performanceMetrics.cacheHits++;
                    const formatted = format ? 
                        this.formatterEngine.format(cached, params, language) : 
                        this.interpolate(cached, params);
                    
                    this.recordTranslationTime(performance.now() - startTime);
                    return formatted;
                }
                this.performanceMetrics.cacheMisses++;
            }
            
            // 翻訳を取得
            let translation = this.getTranslation(key, language);
            
            // フォールバック処理
            if (translation === null && fallback && language !== this.fallbackLanguage) {
                translation = this.getTranslation(key, this.fallbackLanguage);
            }
            
            // 見つからない場合の処理
            if (translation === null) {
                console.warn(`Translation not found: ${key} (${language})`);
                const result = this.handleMissingTranslation(key, language);
                this.recordTranslationTime(performance.now() - startTime);
                return result;
            }
            
            // フォーマット処理
            const formatted = format ? 
                this.formatterEngine.format(translation, params, language) : 
                this.interpolate(translation, params);
            
            // キャッシュに保存
            if (cache) {
                this.translationCache.set(key, translation, language);
            }
            
            this.recordTranslationTime(performance.now() - startTime);
            return formatted;
        } catch (error) {
            getErrorHandler().handleError(error, 'LOCALIZATION_ERROR', {
                operation: 'translate',
                key: key,
                language: options.language || this.currentLanguage,
                params: params
            });
            this.recordTranslationTime(performance.now() - startTime);
            return key;
        }
    }
    
    /**
     * 複数翻訳の一括取得
     */
    tMultiple(keys, params = {}, options = {}) {
        try {
            const result = {};
            
            for (const key of keys) {
                result[key] = this.t(key, params, options);
            }
            
            return result;
        } catch (error) {
            getErrorHandler().handleError(error, 'LOCALIZATION_ERROR', {
                operation: 'translateMultiple',
                keys: keys
            });
            return {};
        }
    }
    
    /**
     * 条件付き翻訳
     */
    tConditional(condition, trueKey, falseKey, params = {}, options = {}) {
        const key = condition ? trueKey : falseKey;
        return this.t(key, params, options);
    }
    
    /**
     * 複数形対応翻訳（拡張版）
     */
    tPlural(key, count, params = {}, options = {}) {
        try {
            const language = options.language || this.currentLanguage;
            
            // FormatterEngineの複数形機能を使用
            const baseTranslation = this.t(key, params, { ...options, format: false });
            const formatted = this.formatterEngine.format(
                '{{plural:text:count}}',
                { text: baseTranslation, count: count, ...params },
                language
            );
            
            return formatted;
        } catch (error) {
            getErrorHandler().handleError(error, 'LOCALIZATION_ERROR', {
                operation: 'translatePlural',
                key: key,
                count: count
            });
            return this.t(key, { ...params, count }, options);
        }
    }
    
    /**
     * 言語データを読み込み
     */
    async loadLanguageData(language) {
        try {
            if (this.loadingPromises.has(language)) {
                return this.loadingPromises.get(language);
            }
            
            const promise = this._loadLanguageDataInternal(language);
            this.loadingPromises.set(language, promise);
            
            try {
                const result = await promise;
                return result;
            } finally {
                this.loadingPromises.delete(language);
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'LOCALIZATION_ERROR', {
                operation: 'loadLanguageData',
                language: language
            });
            return false;
        }
    }
    
    /**
     * 言語データを内部的に読み込み
     */
    async _loadLanguageDataInternal(language) {
        try {
            // 既に読み込み済みの場合はスキップ
            if (this.translationLoader.isLanguageLoaded(language)) {
                return true;
            }
            
            // 外部ファイルから読み込み
            const translations = await this.translationLoader.loadLanguage(language);
            
            if (translations && Object.keys(translations).length > 0) {
                // 既存の翻訳データと統合
                this.addTranslations(language, translations);
                
                // キャッシュをクリア（新しいデータに更新）
                this.translationCache.clearLanguage(language);
                
                console.log(`Loaded ${Object.keys(translations).length} translations for ${language}`);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error(`Failed to load language data for ${language}:`, error);
            return false;
        }
    }
    
    /**
     * 不足している翻訳の処理
     */
    handleMissingTranslation(key, language) {
        // 開発モードでは詳細情報を表示
        if (process.env.NODE_ENV === 'development') {
            return `[Missing: ${key}@${language}]`;
        }
        
        // 本番モードではキーをそのまま返す
        return key;
    }
    
    /**
     * 言語変更リスナーを追加
     */
    addChangeListener(listener) {
        if (typeof listener === 'function') {
            this.changeListeners.add(listener);
            return true;
        }
        return false;
    }
    
    /**
     * 言語変更リスナーを削除
     */
    removeChangeListener(listener) {
        return this.changeListeners.delete(listener);
    }
    
    /**
     * 言語変更をリスナーに通知
     */
    notifyLanguageChange(newLanguage, oldLanguage) {
        for (const listener of this.changeListeners) {
            try {
                listener(newLanguage, oldLanguage);
            } catch (error) {
                console.error('Language change listener error:', error);
            }
        }
    }
    
    /**
     * サポート言語リストを更新
     */
    updateSupportedLanguages() {
        const supportedLanguages = this.getAvailableLanguages();
        
        for (const language of supportedLanguages) {
            this.languageDetector.addSupportedLanguage(language);
        }
    }
    
    /**
     * 言語を動的に追加
     */
    async addLanguageSupport(language, translationData = null) {
        try {
            const normalized = this.languageDetector.normalizeLanguageCode(language);
            if (!normalized) {
                return false;
            }
            
            // サポート言語に追加
            this.languageDetector.addSupportedLanguage(normalized);
            
            // 翻訳データがある場合は追加
            if (translationData) {
                this.addTranslations(normalized, translationData);
            } else {
                // 外部ファイルから読み込み
                const success = await this.loadLanguageData(normalized);
                if (!success) {
                    console.warn(`Failed to load translations for ${normalized}`);
                }
            }
            
            console.log(`Added language support: ${normalized}`);
            return true;
        } catch (error) {
            getErrorHandler().handleError(error, 'LOCALIZATION_ERROR', {
                operation: 'addLanguageSupport',
                language: language
            });
            return false;
        }
    }
    
    /**
     * 言語サポートを削除
     */
    removeLanguageSupport(language) {
        try {
            const normalized = this.languageDetector.normalizeLanguageCode(language);
            if (!normalized) {
                return false;
            }
            
            // サポート言語から削除
            this.languageDetector.removeSupportedLanguage(normalized);
            
            // 翻訳データを削除
            this.translations.delete(normalized);
            this.loadedLanguages.delete(normalized);
            
            // キャッシュをクリア
            this.translationCache.clearLanguage(normalized);
            
            // ローダーからも削除
            this.translationLoader.unloadLanguage(normalized);
            
            console.log(`Removed language support: ${normalized}`);
            return true;
        } catch (error) {
            getErrorHandler().handleError(error, 'LOCALIZATION_ERROR', {
                operation: 'removeLanguageSupport',
                language: language
            });
            return false;
        }
    }
    
    /**
     * パフォーマンス記録
     */
    recordLoadTime(loadTime) {
        this.performanceMetrics.loadTimes.push(loadTime);
        
        // 最新100件のみ保持
        if (this.performanceMetrics.loadTimes.length > 100) {
            this.performanceMetrics.loadTimes.shift();
        }
        
        // 平均計算
        this.performanceMetrics.averageLoadTime = 
            this.performanceMetrics.loadTimes.reduce((sum, time) => sum + time, 0) / 
            this.performanceMetrics.loadTimes.length;
    }
    
    /**
     * 翻訳時間記録
     */
    recordTranslationTime(time) {
        // 統計に追加（将来的にメトリクス監視で使用）
    }
    
    /**
     * 拡張統計情報を取得
     */
    getEnhancedStats() {
        const baseStats = this.getStats();
        const cacheStats = this.translationCache.getStats();
        const loaderStats = this.translationLoader.getStats();
        const detectorStats = this.languageDetector.getDetectionStats();
        
        return {
            ...baseStats,
            performance: this.performanceMetrics,
            cache: cacheStats,
            loader: loaderStats,
            detector: detectorStats,
            isInitialized: this.isInitialized,
            changeListeners: this.changeListeners.size
        };
    }
    
    /**
     * システム健全性チェック
     */
    async healthCheck() {
        const issues = [];
        
        try {
            // 基本的な翻訳テスト
            const testKey = 'menu.title';
            const translation = this.t(testKey);
            
            if (translation === testKey) {
                issues.push(`Basic translation test failed: ${testKey}`);
            }
            
            // キャッシュ健全性
            const cacheStats = this.translationCache.getStats();
            if (cacheStats.hitRate < 50 && cacheStats.totalRequests > 100) {
                issues.push(`Low cache hit rate: ${cacheStats.hitRate}%`);
            }
            
            // ロード済み言語チェック
            const loadedLanguages = this.translationLoader.getLoadedLanguages();
            if (loadedLanguages.length === 0) {
                issues.push('No languages loaded');
            }
            
            // 現在の言語が利用可能かチェック
            if (!this.languageDetector.isSupported(this.currentLanguage)) {
                issues.push(`Current language not supported: ${this.currentLanguage}`);
            }
            
        } catch (error) {
            issues.push(`Health check error: ${error.message}`);
        }
        
        return {
            healthy: issues.length === 0,
            issues: issues,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        super.cleanup();
        
        this.translationCache.cleanup();
        this.translationLoader.cleanup();
        this.changeListeners.clear();
        this.loadingPromises.clear();
        
        console.log('Enhanced LocalizationManager cleaned up');
    }
}