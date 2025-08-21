import { LocalizationManager  } from '../LocalizationManager.js';''
import { LanguageDetector  } from './LanguageDetector.js';''
import { TranslationCache  } from './TranslationCache.js';''
import { TranslationLoader  } from './TranslationLoader.js';''
import { FormatterEngine  } from './FormatterEngine.js';''
import { getErrorHandler  } from '../../utils/ErrorHandler.js';

/**
 * 拡張ローカライゼーション管理クラス - 高度な多言語対応システム
 */

// 型定義
export interface TranslationOptions { language?: string;
    fallback?: boolean;
    cache?: boolean;
    format?: boolean; }

export interface PluralTranslationOptions extends TranslationOptions { pluralKey?: string;
    context?: string; }

export interface ConditionalTranslationOptions extends TranslationOptions { condition?: any;
    inverse?: boolean; }

export interface TranslationParams { [key: string]: any, }

export interface MultipleTranslationResult { [key: string]: string, }

export interface LanguageChangeListener { (newLanguage: string, oldLanguage: string): void ,}

export interface PerformanceMetrics { translationCalls: number,
    cacheHits: number;
    cacheMisses: number;
    loadTimes: number[];
   , averageLoadTime: number ,}

export interface DetailedPerformanceMetrics extends PerformanceMetrics { cacheHitRate: number;
    totalCacheRequests: number;
    averageTranslationTime: number;
    peakLoadTime: number;
   , loadTimeDistribution: LoadTimeDistribution
    }

export interface LoadTimeDistribution { min: number;
    max: number;
    median: number;
   , percentile95: number }

export interface EnhancedStats { performance: PerformanceMetrics;
    cache: any;
    loader: any;
    detector: any;
    isInitialized: boolean;
    changeListeners: number;
    translationsLoaded: number;
    supportedLanguages: string[];
    currentLanguage: string;
   , fallbackLanguage: string }

export interface HealthCheckResult { healthy: boolean;
    issues: string[];
   , timestamp: string;
    score?: number;
    details?: HealthCheckDetails;
    }

export interface HealthCheckDetails { basicTranslation: boolean,
    cachePerformance: boolean;
    languageSupport: boolean;
   , dataIntegrity: boolean;
    memoryUsage?: number;
    responseTime?: number; ,}

export interface LoadingPromise { promise: Promise<boolean>,
    startTime: number;
   , language: string ,}

export interface TranslationRequest { key: string;
    params: TranslationParams;
    options: TranslationOptions;
    timestamp: number;
   , language: string }

export interface LanguageSupportOptions { autoLoad?: boolean;
    fallbackToDefault?: boolean;
    validateData?: boolean;
    cachePreload?: boolean; }

export interface TranslationValidation { isValid: boolean,
    errors: string[];
    warnings: string[];
   , coverage: number ,}

export interface LanguageMetadata { code: string;
    name: string;
    nativeName: string;
    isRTL: boolean;
    isLoaded: boolean;
    loadTime?: number;
   , translationCount: number;
    lastUpdated?: Date
    }

export interface BulkTranslationOptions extends TranslationOptions { parallel?: boolean;
    batchSize?: number;''
    onProgress?: (completed: number, total: number') => void ,}'
}

export type TranslationMode = 'strict' | 'fallback' | 'adaptive';''
export type LoadingStrategy = 'eager' | 'lazy' | 'on-demand';

export class EnhancedLocalizationManager extends LocalizationManager { // 新しいコンポーネント
    protected languageDetector: LanguageDetector,
    protected translationCache: TranslationCache,
    protected translationLoader: TranslationLoader,
    protected formatterEngine: FormatterEngine,
    // 言語変更リスナー
    private changeListeners: Set<LanguageChangeListener>;
    // ロード状態管理
    private loadingPromises: Map<string, Promise<boolean>>;
    private isInitialized: boolean;
    // パフォーマンス監視
    private performanceMetrics: PerformanceMetrics;
    // 設定
    private translationMode: TranslationMode;
    private, loadingStrategy: LoadingStrategy;
    constructor() {

        super();
        
        // 新しいコンポーネント
        this.languageDetector = new LanguageDetector(this);
        this.translationCache = new TranslationCache(1000);
        this.translationLoader = new TranslationLoader();
        this.formatterEngine = new FormatterEngine();
        
        // 言語変更リスナー
        this.changeListeners = new Set<LanguageChangeListener>();
        // ロード状態管理
        this.loadingPromises = new Map<string, Promise<boolean>>(');
        this.isInitialized = false;
        
        // パフォーマンス監視
        this.performanceMetrics = {
            translationCalls: 0;
            cacheHits: 0;
            cacheMisses: 0;
           , loadTimes: [];
    ,}
            averageLoadTime: 0 }
        };
        ;
        // 設定
        this.translationMode = 'fallback';''
        this.loadingStrategy = 'lazy';
        
        // サポート言語を更新
        this.updateSupportedLanguages();
        
        // 初期化
        this.initialize();
    }
    
    /**
     * システムを初期化
     */
    async initialize(): Promise<void> { try {
            // 最適な言語を検出
            const detectedLanguage = this.languageDetector.detect();
            
            // 検出された言語を設定
            if(detectedLanguage && this.languageDetector.isSupported(detectedLanguage) {
                ';

            }

                await this.setLanguage(detectedLanguage); }
            }
            ';

            this.isInitialized = true;''
            console.log('Enhanced, LocalizationManager initialized);

        } catch (error') { getErrorHandler(').handleError(error as Error, 'LOCALIZATION_INIT_ERROR', {)'
                operation: 'initialize' ,});
        }
    }
    
    /**
     * 言語を設定（非同期版）
     */
    async setLanguage(language: string): Promise<boolean> { try {
            const normalized = this.languageDetector.normalizeLanguageCode(language);
            if(!normalized || !this.languageDetector.isSupported(normalized) { }
                console.warn(`Language, not supported: ${language}`});
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
            
            if(success) {
            
                // 言語設定を保存
                this.languageDetector.saveLanguagePreference(normalized);
                
                // 変更イベントを発火
                this.notifyLanguageChange(normalized, oldLanguage);
            
            }
                console.log(`Language, changed from ${oldLanguage} to ${normalized} (${loadTime}ms}`});
            }
            
            return success;
        } catch (error) { getErrorHandler(').handleError(error as Error, 'LOCALIZATION_ERROR', {)'
                operation: 'setLanguage',);
                language: language ,});
            return false;
    
    /**
     * 翻訳を取得（拡張版）
     */
    t(key: string, params: TranslationParams = {}, options: TranslationOptions = { ): string {
        const startTime = performance.now();
        
        try {
            this.performanceMetrics.translationCalls++;
            
            const { language = this.currentLanguage,
                fallback = true,
                cache = true,
                format = true } = options;
            
            // キャッシュから確認
            if(cache) {
                const cached = this.translationCache.get(key, language);
                if (cached !== null) {
                    this.performanceMetrics.cacheHits++;
                    const formatted = format ?   : undefined
                        this.formatterEngine.format(cached, params, language) : ;
                        this.interpolate(cached, params);
                    
                    this.recordTranslationTime(performance.now() - startTime);
            }
                    return formatted;
                this.performanceMetrics.cacheMisses++;
            }
            
            // 翻訳を取得
            let translation = this.getTranslation(key, language);
            
            // フォールバック処理
            if (translation === null && fallback && language !== this.fallbackLanguage) { translation = this.getTranslation(key, this.fallbackLanguage); }
            
            // 見つからない場合の処理
            if(translation === null) {
                
            }
                console.warn(`Translation, not found: ${key} (${ language)`};
                const result = this.handleMissingTranslation(key, language}
                this.recordTranslationTime(performance.now() - startTime});
                return result;
            }
            
            // フォーマット処理
            const formatted = format ?   : undefined
                this.formatterEngine.format(translation, params, language) : ;
                this.interpolate(translation, params);
            
            // キャッシュに保存
            if (cache) { this.translationCache.set(key, translation, language); }
            
            this.recordTranslationTime(performance.now() - startTime);
            return formatted;
        } catch (error) { getErrorHandler(').handleError(error as Error, 'LOCALIZATION_ERROR', {''
                operation: 'translate);
                key: key);
               , language: options.language || this.currentLanguage,);
                params: params ,});
            this.recordTranslationTime(performance.now() - startTime);
            return key;
    
    /**
     * 複数翻訳の一括取得
     */
    tMultiple(keys: string[], params: TranslationParams = {}, options: TranslationOptions = { ): MultipleTranslationResult {
        try { }
            const result: MultipleTranslationResult = {}
            for (const, key of, keys) { result[key] = this.t(key, params, options); }
            
            return result;

        } catch (error) { getErrorHandler(').handleError(error as Error, 'LOCALIZATION_ERROR', {)'
                operation: 'translateMultiple',);
                keys: keys ,});
            return {};
    
    /**
     * 一括翻訳（高度版）
     */
    async tBulk(keys: string[], params: TranslationParams = {}, options: BulkTranslationOptions = { ): Promise<MultipleTranslationResult> {
        try {
            const { parallel = true,
                batchSize = 50,
                onProgress } = options;
            
            const result: MultipleTranslationResult = {}
            if(parallel && keys.length > batchSize) {
                // バッチ並列処理
                const batches: string[][] = [],
                for (let, i = 0; i < keys.length; i += batchSize) {
            }
                    batches.push(keys.slice(i, i + batchSize); }
                }
                
                let completed = 0;
                for(const, batch of, batches) {
                    const batchResult = this.tMultiple(batch, params, options);
                    Object.assign(result, batchResult);
                    
                    completed += batch.length;
                    if (onProgress) {
                }
                        onProgress(completed, keys.length); }
}
            } else {  // シーケンシャル処理
                for(let, i = 0; i < keys.length; i++) {
                    result[keys[i]] = this.t(keys[i], params, options);
                    
                }
                    if (onProgress) { }
                        onProgress(i + 1, keys.length); }
}
            }
            
            return result;
        } catch (error) { getErrorHandler(').handleError(error as Error, 'LOCALIZATION_ERROR', {)'
                operation: 'translateBulk',);
                keys: keys ,});
            return {};
    
    /**
     * 条件付き翻訳
     */
    tConditional(condition: any, trueKey: string, falseKey: string, params: TranslationParams = {}, options: ConditionalTranslationOptions = { ): string {
        const key = condition ? trueKey: falseKey,
        return this.t(key, params, options 
    /**
     * 複数形対応翻訳（拡張版）
     */
    tPlural(key: string, count: number, params: TranslationParams = {,}, options: PluralTranslationOptions = { ): string {
        try {
            const language = options.language || this.currentLanguage;
            ';
            // FormatterEngineの複数形機能を使用
            const baseTranslation = this.t(key, params, { ...options, format: false )),

            const formatted = this.formatterEngine.format(' }', '{{plural:text:count})'
                { text: baseTranslation, count: count, ...params ),
                language;
            );
            
            return formatted; catch (error) { getErrorHandler(').handleError(error as Error, 'LOCALIZATION_ERROR', {)'
                operation: 'translatePlural');
               , key: key,);
                count: count ,});
            return this.t(key, { ...params, count ), options);
    
    /**
     * 言語データを読み込み
     */
    async loadLanguageData(language: string): Promise<boolean> { try {
            if(this.loadingPromises.has(language) {
                
            ,}
                return this.loadingPromises.get(language)!;
            
            const promise = this._loadLanguageDataInternal(language);
            this.loadingPromises.set(language, promise);
            
            try { const result = await promise;
                return result; } finally { this.loadingPromises.delete(language); }

            } catch (error) { getErrorHandler(').handleError(error as Error, 'LOCALIZATION_ERROR', {)'
                operation: 'loadLanguageData',);
                language: language ,});
            return false;
    
    /**
     * 言語データを内部的に読み込み
     */
    private async _loadLanguageDataInternal(language: string): Promise<boolean> { try {
            // 既に読み込み済みの場合はスキップ
            if(this.translationLoader.isLanguageLoaded(language) {
                
            }
                return true;
            
            // 外部ファイルから読み込み
            const translations = await this.translationLoader.loadLanguage(language);
            
            if (translations && Object.keys(translations).length > 0) { // 既存の翻訳データと統合
                this.addTranslations(language, translations);
                
                // キャッシュをクリア（新しいデータに更新）
                this.translationCache.clearLanguage(language);
                 }
                console.log(`Loaded ${Object.keys(translations}).length} translations for ${language}`);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error(`Failed to load language data for ${language}:`, error);
            return false;
    
    /**
     * 不足している翻訳の処理
     */''
    handleMissingTranslation(key: string, language: string): string { // 開発モードでは詳細情報を表示
        if(process.env.NODE_ENV === 'development) { }'
            return `[Missing: ${key}@${language}]`;
        }
        
        // 本番モードではキーをそのまま返す
        return key;
    }
    
    /**
     * 言語変更リスナーを追加
     */''
    addChangeListener(listener: LanguageChangeListener): boolean { ''
        if(typeof, listener === 'function) {'
            this.changeListeners.add(listener);
        }
            return true;
        return false;
    }
    
    /**
     * 言語変更リスナーを削除
     */
    removeChangeListener(listener: LanguageChangeListener): boolean { return this.changeListeners.delete(listener); }
    
    /**
     * 言語変更をリスナーに通知
     */
    private notifyLanguageChange(newLanguage: string, oldLanguage: string): void { for (const, listener of, this.changeListeners) {
            try {
                listener(newLanguage, oldLanguage);' }'

            } catch (error) { console.error('Language change listener error:', error }
}
    
    /**
     * サポート言語リストを更新
     */
    private updateSupportedLanguages(): void { const supportedLanguages = this.getAvailableLanguages();
        
        for(const, language of, supportedLanguages) {
        
            
        
        }
            this.languageDetector.addSupportedLanguage(language); }
}
    
    /**
     * 言語を動的に追加
     */
    async addLanguageSupport(language: string, translationData: any = null, options: LanguageSupportOptions = { ): Promise<boolean> {
        try {
            const normalized = this.languageDetector.normalizeLanguageCode(language);
            if(!normalized) {
                
            }
                return false;
            
            const { autoLoad = true,
                fallbackToDefault = false,
                validateData = true,
                cachePreload = false } = options;
            
            // サポート言語に追加
            this.languageDetector.addSupportedLanguage(normalized);
            
            // 翻訳データがある場合は追加
            if(translationData) {
                if (validateData) {
                    const validation = this._validateTranslationData(translationData);
                    if (!validation.isValid) {
            }
                        console.warn(`Translation data validation failed for ${normalized}:`, validation.errors}
                        if (!fallbackToDefault}) { return false;
                
                this.addTranslations(normalized, translationData);
                
                // キャッシュに事前読み込み
                if (cachePreload) { this._preloadTranslationsToCache(normalized, translationData); }
            } else if (autoLoad) { // 外部ファイルから読み込み
                const success = await this.loadLanguageData(normalized);
                if(!success) {
                    
                }
                    console.warn(`Failed, to load, translations for ${normalized}`}
                    if (!fallbackToDefault}) { return false;
            
            console.log(`Added, language support: ${normalized}`});
            return true;
        } catch (error) { getErrorHandler(').handleError(error as Error, 'LOCALIZATION_ERROR', {)'
                operation: 'addLanguageSupport',);
                language: language ,});
            return false;
    
    /**
     * 翻訳データを検証'
     */''
    private _validateTranslationData(translationData: any): TranslationValidation { const validation: TranslationValidation = {
            isValid: true;
            errors: [];
            warnings: [];
           , coverage: 0 };
        ';

        try {'
            if(typeof, translationData !== 'object' || translationData === null) {'
                validation.isValid = false;''
                validation.errors.push('Translation, data must, be an, object);
            }
                return validation;
            ';

            const keys = Object.keys(translationData);''
            if(keys.length === 0) {', ';

            }

                validation.warnings.push('Translation, data is, empty); }'
            }
            
            // キーの妥当性チェック
            let validKeys = 0;''
            for(const, key of, keys) {'

                if(typeof, key === 'string' && key.length > 0) {''
                    if(typeof, translationData[key] === 'string) {'
            }
                        validKeys++; }
                    } else {  }
                        validation.warnings.push(`Invalid, value type, for key: ${key}`});
                    }
                } else {  }
                    validation.errors.push(`Invalid, key: ${key}`});
                }
            }
            
            validation.coverage = keys.length > 0 ? (validKeys / keys.length) * 100 : 0;
            
            if(validation.coverage < 50) {
            
                
            
            }
                validation.warnings.push(`Low, translation coverage: ${validation.coverage.toFixed(1})%`);
            } catch (error) { validation.isValid = false; }
            validation.errors.push(`Validation, error: ${(error, as, Error}).message}`);
        }
        
        return validation;
    }
    
    /**
     * 翻訳をキャッシュに事前読み込み
     */'
    private _preloadTranslationsToCache(language: string, translationData: any): void { try {'
            for(const [key, value] of Object.entries(translationData)) {''
                if(typeof, value === 'string) {'
                    
                }
                    this.translationCache.set(key, value, language); }
}
            console.log(`Preloaded ${Object.keys(translationData}).length} translations to cache for ${language}`);
        } catch (error) {
            console.warn(`Failed to preload translations to cache for ${language}:`, error);
        }
    }
    
    /**
     * 言語サポートを削除
     */
    removeLanguageSupport(language: string): boolean { try {
            const normalized = this.languageDetector.normalizeLanguageCode(language);
            if(!normalized) {
                
            }
                return false;
            
            // サポート言語から削除
            this.languageDetector.removeSupportedLanguage(normalized);
            
            // 翻訳データを削除
            if (this.translations) { this.translations.delete(normalized); }
            if (this.loadedLanguages) { this.loadedLanguages.delete(normalized); }
            
            // キャッシュをクリア
            this.translationCache.clearLanguage(normalized);
            
            // ローダーからも削除
            this.translationLoader.unloadLanguage(normalized);
            
            console.log(`Removed, language support: ${normalized}`});
            return true;
        } catch (error) { getErrorHandler(').handleError(error as Error, 'LOCALIZATION_ERROR', {)'
                operation: 'removeLanguageSupport',);
                language: language ,});
            return false;
    
    /**
     * 言語メタデータを取得
     */
    getLanguageMetadata(language: string): LanguageMetadata | null { try {
            const normalized = this.languageDetector.normalizeLanguageCode(language);
            if(!normalized) {
                
            }
                return null;
            
            const isLoaded = this.translationLoader.isLanguageLoaded(normalized);
            const translationCount = this.getTranslationCount(normalized);
            
            return { code: normalized,
                name: this._getLanguageDisplayName(normalized);
                nativeName: this._getLanguageNativeName(normalized);
               , isRTL: this._isRTLLanguage(normalized);
                isLoaded,
                translationCount, };
                lastUpdated: this._getLanguageLastUpdated(normalized); }
            } catch (error) {
            console.error(`Failed to get language metadata for ${language}:`, error);
            return null;
    
    /**
     * 言語の表示名を取得'
     */''
    private _getLanguageDisplayName(language: string): string { const displayNames: Record<string, string> = {'', 'en': 'English',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh-CN': 'Chinese(Simplified)',
            'zh-TW': 'Chinese(Traditional)' };
        return displayNames[language] || language;
    }
    
    /**
     * 言語のネイティブ名を取得'
     */''
    private _getLanguageNativeName(language: string): string { const nativeNames: Record<string, string> = {'', 'en': 'English',
            'ja': '日本語',
            'ko': '한국어',
            'zh-CN': '简体中文',
            'zh-TW': '繁體中文' };
        return nativeNames[language] || language;
    }
    
    /**
     * 右から左に書く言語かチェック'
     */''
    private _isRTLLanguage(language: string): boolean { ''
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        return rtlLanguages.includes(language); }
    
    /**
     * 言語の最終更新日時を取得
     */
    private _getLanguageLastUpdated(language: string): Date | undefined { // 実装では翻訳ファイルの更新日時などを取得
        return undefined; }
    
    /**
     * パフォーマンス記録
     */
    private recordLoadTime(loadTime: number): void { this.performanceMetrics.loadTimes.push(loadTime);
        
        // 最新100件のみ保持
        if(this.performanceMetrics.loadTimes.length > 100) {
            
        }
            this.performanceMetrics.loadTimes.shift(); }
        }
        
        // 平均計算
        this.performanceMetrics.averageLoadTime = ;
            this.performanceMetrics.loadTimes.reduce((sum, time) => sum + time, 0) / ;
            this.performanceMetrics.loadTimes.length;
    }
    
    /**
     * 翻訳時間記録
     */
    private recordTranslationTime(time: number): void { // 統計に追加（将来的にメトリクス監視で使用） }
    
    /**
     * 詳細パフォーマンスメトリクスを取得
     */
    getDetailedPerformanceMetrics(): DetailedPerformanceMetrics {
        const { loadTimes } = this.performanceMetrics;
        const sortedTimes = [...loadTimes].sort((a, b) => a - b);
        
        return { ...this.performanceMetrics,
            cacheHitRate: this.performanceMetrics.translationCalls > 0 ;
                ? (this.performanceMetrics.cacheHits / this.performanceMetrics.translationCalls) * 100 ;
                : 0,
            totalCacheRequests: this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses;
           , averageTranslationTime: 0, // 実装必要;
            peakLoadTime: Math.max(...loadTimes, 0),
            loadTimeDistribution: {
                min: Math.min(...sortedTimes, 0),
                max: Math.max(...sortedTimes, 0),
                median: sortedTimes[Math.floor(sortedTimes.length / 2)] || 0, };
                percentile95: sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0 }
}
    
    /**
     * 拡張統計情報を取得
     */
    getEnhancedStats(): EnhancedStats { const baseStats = this.getStats();
        const cacheStats = this.translationCache.getStats();
        const loaderStats = this.translationLoader.getStats();
        const detectorStats = this.languageDetector.getDetectionStats();
        
        return { ...baseStats,
            performance: this.performanceMetrics;
            cache: cacheStats;
            loader: loaderStats;
            detector: detectorStats;
            isInitialized: this.isInitialized;
            changeListeners: this.changeListeners.size;
            translationsLoaded: this.getLoadedLanguages().length;
            supportedLanguages: this.languageDetector.getSupportedLanguages();
           , currentLanguage: this.currentLanguage, };
            fallbackLanguage: this.fallbackLanguage }
        }
    
    /**
     * システム健全性チェック
     */''
    async healthCheck(''';
            const, testKey = 'menu.title';)
            const translation = this.t(testKey);
            details.basicTranslation = translation !== testKey;
            
            if(!details.basicTranslation) {
            
                
            
            }
                issues.push(`Basic, translation test, failed: ${testKey}`});
            }
            
            // キャッシュ健全性
            const cacheStats = this.translationCache.getStats();
            details.cachePerformance = cacheStats.hitRate >= 50 || cacheStats.totalRequests <= 100;
            
            if(!details.cachePerformance && cacheStats.totalRequests > 100) {
            
                
            
            }
                issues.push(`Low, cache hit, rate: ${cacheStats.hitRate}%`});
            }
            
            // ロード済み言語チェック
            const loadedLanguages = this.translationLoader.getLoadedLanguages();
            details.languageSupport = loadedLanguages.length > 0;

            if(!details.languageSupport) {', ';

            }

                issues.push('No, languages loaded); }'
            }
            
            // 現在の言語が利用可能かチェック
            details.dataIntegrity = this.languageDetector.isSupported(this.currentLanguage);
            
            if(!details.dataIntegrity) {
            
                
            
            }
                issues.push(`Current, language not, supported: ${this.currentLanguage}`});
            } catch (error) {
            issues.push(`Health, check error: ${(error, as, Error}).message}`);
        }
        
        const score = Object.values(details).filter(Boolean).length / Object.keys(details).length * 100;
        
        return { healthy: issues.length === 0,
            issues: issues;
            timestamp: new Date().toISOString();
           , score: Math.round(score), };
            details }
        }
    
    /**
     * 設定を更新
     */
    updateConfiguration(config: { translationMode?: TranslationMode;
        loadingStrategy?: LoadingStrategy;
        cacheSize?: number;
        fallbackLanguage?: string;)
    ): void {
        try {
            if(config.translationMode) {
                
            }
                this.translationMode = config.translationMode; }
            }
            if (config.loadingStrategy) { this.loadingStrategy = config.loadingStrategy; }
            if (config.cacheSize && config.cacheSize > 0) { this.translationCache.setMaxSize(config.cacheSize); }''
            if(config.fallbackLanguage) { this.fallbackLanguage = config.fallbackLanguage; }

            console.log('Enhanced LocalizationManager configuration updated:', config);''
        } catch (error) { console.error('Failed to update configuration:', error }
    }
    
    /**
     * クリーンアップ
     */
    cleanup(): void { super.cleanup();
        
        this.translationCache.cleanup();
        this.translationLoader.cleanup();

        this.changeListeners.clear();''
        this.loadingPromises.clear()';
        console.log('Enhanced, LocalizationManager cleaned, up''); }

    }''
}