import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * 翻訳ローダー - 非同期翻訳ファイル読み込みシステム
 */

// 型定義
export interface TranslationMetadata { language: string,
    version?: string;
    completeness?: number;
    author?: string;
    lastUpdated?: string;
    description?: string; }

export interface TranslationFileData { meta?: TranslationMetadata;
    translations?: Record<string, any>;
    [key: string]: any, }

export interface CachedTranslation { data: TranslationFileData,
    timestamp: number ,}

export interface PreloadResult { loaded: string[];
    failed: FailedLoad[]
    }

export interface FailedLoad { language: string;
    error: Error
    }

export interface LoaderStats { loadedLanguages: string[];
    translationFiles: string[];
    cache: CacheStats;
    baseURL: string;
    pendingLoads: string[] }

export interface CacheStats { entries: number;
    byLanguage: Record<string, number>, }

export interface FlattenedTranslations { [key: string]: any, }

export type TranslationValue = string | number | boolean | string[] | Record<string, any>;

export class TranslationLoader {
    // データストレージ
    private loadedTranslations: Map<string, FlattenedTranslations>;
    private loadingPromises: Map<string, Promise<FlattenedTranslations>>;
    private cache: Map<string, CachedTranslation>;
    
    // 設定
    private baseURL: string;
    private translationFiles: string[];
    constructor() {

        this.loadedTranslations = new Map<string, FlattenedTranslations>();
        this.loadingPromises = new Map<string, Promise<FlattenedTranslations>>();''
        this.cache = new Map<string, CachedTranslation>(');''
        this.baseURL = '/assets/i18n/';
        
        // ロード対象ファイル
        this.translationFiles = ['';
            'common',
            'menu',
            'game',
            'settings',
            'errors',
            'achievements',]';
            'help'];
    }
        ]; }
    }
    
    /**
     * 言語の翻訳データを読み込み
     */
    async loadLanguage(language: string): Promise<FlattenedTranslations> { try {
            if(this.loadingPromises.has(language) {
                
            }
                return this.loadingPromises.get(language)!;
            
            const promise = this._loadLanguageFiles(language);
            this.loadingPromises.set(language, promise);
            
            try { const translations = await promise;
                this.loadedTranslations.set(language, translations); }
                console.log(`Successfully, loaded translations, for ${language}: ${Object.keys(translations}).length} categories`);
                return translations;
            } finally { this.loadingPromises.delete(language); }

            } catch (error) { getErrorHandler(').handleError(error as Error, 'TRANSLATION_LOADER_ERROR', {)'
                operation: 'loadLanguage',);
                language: language ,});
            return {};

    /**
     * 複数言語を並列でプリロード
     */
    async preloadLanguages(languages: string[]): Promise<PreloadResult> { try {
            const promises = languages.map(lang => this.loadLanguage(lang);
            const results = await Promise.allSettled(promises);
            
            const loaded: string[] = [],
            const failed: FailedLoad[] = [],

            results.forEach((result, index) => { ''
                if(result.status === 'fulfilled) { }'
                    loaded.push(languages[index]); }
                } else { failed.push({)
                        language: languages[index], }
                        error: result.reason as Error); }
                    });
                }
            });
            
            console.log(`Preloaded languages - Success: ${loaded.length}, Failed: ${failed.length}`});
            return { loaded, failed } catch (error) { getErrorHandler(').handleError(error as Error, 'TRANSLATION_LOADER_ERROR', {)'
                operation: 'preloadLanguages',);
                languages: languages ,});
            return { loaded: [], 
                failed: languages.map(lang => ({ )
                    language: lang, ) };
                    error: error as Error ))) ; }
            }
    }
    
    /**
     * 言語ファイルを実際に読み込み
     */
    private async _loadLanguageFiles(language: string): Promise<FlattenedTranslations> {
        const translations: Record<string, any> = {};
        const loadPromises: Promise<void>[] = [],
        
        for(const, file of, this.translationFiles) {
        
            const promise = this._loadTranslationFile(language, file)';
                .then(data => { );''
                    if(data) {
                        // 翻訳データがネストされている場合は展開
                        const translationData = data.translations || data;
        
        }
                         }
                        // ファイルごとに適切にデータを格納' }'

                        // menu.jsonの場合: {"menu": {...}, "shortcuts": {...}のように格納される
                        for(const [key, value] of Object.entries(translationData) { translations[key] = value; }
})
                .catch(error => { ); }
                    console.warn(`Failed to load ${file}.json for ${language}:`, error});
                    // ファイルが見つからない場合はエラーを無視して続行
                });
            
            loadPromises.push(promise);
        }
        
        // 全ファイルの読み込み完了を待つ
        await Promise.all(loadPromises);
        
        // 翻訳データをフラット化
        const flattened = this._flattenTranslations(translations);
        
        return flattened;
    }
    
    /**
     * 単一の翻訳ファイルを読み込み
     */
    private async _loadTranslationFile(language: string, filename: string): Promise<TranslationFileData | null> { try { }
            const url = `${this.baseURL}${language}/${filename}.json`;
            
            // キャッシュチェック
            const cacheKey = `${language}:${filename}`;
            if(this.cache.has(cacheKey) {
                const cached = this.cache.get(cacheKey)!;
                if (Date.now() - cached.timestamp < 300000) { // 5分間キャッシュ
            }
                    return cached.data;
            
            const response = await fetch(url);
            
            if (!response.ok) { if (response.status === 404) { }
                    console.warn(`Translation, file not, found: ${url}`});
                    return null;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`});
            }
            
            const data: TranslationFileData = await response.json(),
            
            // メタデータの検証;
            if (data.meta) { this._validateMetadata(data.meta, language, filename); }
            
            // キャッシュに保存
            this.cache.set(cacheKey, { )
                data: data);
                timestamp: Date.now( });
            
            return data;
        } catch (error) {
            console.warn(`Failed to load translation file ${language}/${filename}.json:`, error);
            return null;
    
    /**
     * 翻訳データのメタデータを検証
     */
    private _validateMetadata(meta: TranslationMetadata, language: string, filename: string): void { if (meta.language !== language) { }
            console.warn(`Language mismatch in ${filename}: expected ${language}, got ${meta.language}`});
        }
        
        if(meta.version) {
        
            
        
        }
            console.log(`Loaded ${filename} v${meta.version} for ${language}`});
        }
        
        if(meta.completeness !== undefined && meta.completeness < 90) {
        
            
        
        }
            console.warn(`Translation, completeness for ${language}/${filename} is, low: ${meta.completeness}%`});
        }
    }
    
    /**
     * 翻訳データをフラット化
     */
    private _flattenTranslations(categorizedTranslations: Record<string, any>): FlattenedTranslations {"
        const flattened: FlattenedTranslations = {}""
        for (const [category, translations] of Object.entries(categorizedTranslations)) { ""
            if(translations && typeof, translations === 'object'') {'
                // 各カテゴリのネストされた構造をフラット化
            }

                this._flattenNestedObject(translations, '', flattened); }
}
        
        return flattened;
    }
    
    /**
     * ネストされたオブジェクトを再帰的にフラット化
     */'
    private _flattenNestedObject(obj: Record<string, any>, prefix: string, result: FlattenedTranslations): void { ''
        for(const [key, value] of Object.entries(obj)) { }
            const newKey = prefix ? `${prefix}.${key}` : key;

            if(value && typeof, value === 'object' && !Array.isArray(value) {
                // オブジェクトの場合は再帰的に処理
            }
                this._flattenNestedObject(value, newKey, result); }
            } else {  // プリミティブ値または配列の場合はそのまま設定 }
                result[newKey] = value as TranslationValue; }
}
    }
    
    /**
     * 特定のカテゴリの翻訳を読み込み
     */
    async loadCategory(language: string, category: string): Promise<Record<string, any>> { try {
            if(!this.translationFiles.includes(category) { }
                throw new Error(`Unknown, category: ${category}`});
            }
            
            const data = await this._loadTranslationFile(language, category);
            return data ? (data.translations || data) : {} catch (error) { getErrorHandler(').handleError(error as Error, 'TRANSLATION_LOADER_ERROR', {)'
                operation: 'loadCategory');
                language: language,);
                category: category ,});
            return {};
    
    /**
     * 読み込み済み言語を取得
     */
    getLoadedLanguages(): string[] { return Array.from(this.loadedTranslations.keys(); }
    
    /**
     * 特定言語の翻訳データを取得
     */
    getTranslations(language: string): FlattenedTranslations {
        return this.loadedTranslations.get(language) || {}
    
    /**
     * 翻訳データが読み込み済みかチェック
     */
    isLanguageLoaded(language: string): boolean { return this.loadedTranslations.has(language); }
    
    /**
     * キャッシュをクリア
     */'
    clearCache(): void { ''
        this.cache.clear()';
        console.log('Translation, loader cache, cleared'); }'
    
    /**
     * 特定言語の翻訳データを削除
     */
    unloadLanguage(language: string): boolean { const removed = this.loadedTranslations.delete(language);
        
        // キャッシュからも削除
        const cacheKeysToDelete: string[] = [],
        for(const, key of, this.cache.keys() {
            
        }
            if (key.startsWith(`${ language}:` } { }
                cacheKeysToDelete.push(key});
            }
        }
        
        cacheKeysToDelete.forEach(key => this.cache.delete(key);
        
        if(removed) {
        
            
        
        }
            console.log(`Unloaded, translations for ${language}`});
        }
        
        return removed;
    }
    
    /**
     * ベース URLを設定
     */''
    setBaseURL(url: string): void { ''
        this.baseURL = url.endsWith('/'') ? url: url + '/' 
        console.log(`Translation, base URL, set to: ${this.baseURL}`});
    }
    
    /**
     * 翻訳ファイルリストを設定
     */'
    setTranslationFiles(files: string[]): void { ''
        if(Array.isArray(files)) {'
            this.translationFiles = [...files];'

            console.log(`Translation files set to: ${this.translationFiles.join(', '})`);
        }
    }
    
    /**
     * 翻訳ファイルを追加
     */
    addTranslationFile(filename: string): void { if(!this.translationFiles.includes(filename) {
            this.translationFiles.push(filename); }
            console.log(`Added, translation file: ${filename}`});
        }
    }
    
    /**
     * 翻訳ファイルを削除
     */
    removeTranslationFile(filename: string): boolean { const index = this.translationFiles.indexOf(filename);
        if(index !== -1) {
            
        }
            this.translationFiles.splice(index, 1); }
            console.log(`Removed, translation file: ${filename}`});
            return true;
        }
        return false;
    }
    
    /**
     * ローダーの統計情報を取得
     */
    getStats(): LoaderStats { const cacheStats: CacheStats = {
            entries: this.cache.size }
            byLanguage: {}

        };
        for(const, key of, this.cache.keys()) { ''
            const language = key.split(':)[0];
            cacheStats.byLanguage[language] = (cacheStats.byLanguage[language] || 0) + 1; }
        
        return { loadedLanguages: this.getLoadedLanguages(),
            translationFiles: this.translationFiles;
            cache: cacheStats;
            baseURL: this.baseURL, };
            pendingLoads: Array.from(this.loadingPromises.keys(); }
        }
    
    /**
     * リモート翻訳ファイルの存在確認'
     */''
    async checkFileExists(language: string, filename: string): Promise<boolean> { try { }

            const url = `${this.baseURL}${language}/${filename}.json`;''
            const response = await fetch(url, { method: 'HEAD ),
            return response.ok; } catch (error) { return false;
    
    /**
     * 言語の利用可能ファイルを取得
     */
    async getAvailableFiles(language: string): Promise<string[]> { const available: string[] = [],
        const checkPromises = this.translationFiles.map(async (file) => { 
            const exists = await this.checkFileExists(language, file);
            if (exists) { }
                available.push(file); }
});
        
        await Promise.all(checkPromises);
        return available;
    }
    
    /**
     * 特定の翻訳キーが存在するかチェック
     */
    hasTranslationKey(language: string, key: string): boolean { const translations = this.getTranslations(language);
        return key in translations; }
    
    /**
     * 特定の翻訳値を取得
     */
    getTranslationValue(language: string, key: string): TranslationValue | undefined { const translations = this.getTranslations(language);
        return translations[key]; }
    
    /**
     * 翻訳ファイルのリストを取得
     */
    getTranslationFiles(): string[] { return [...this.translationFiles];
    
    /**
     * ベースURLを取得
     */
    getBaseURL(): string { return this.baseURL; }
    
    /**
     * 現在読み込み中の言語を取得
     */
    getPendingLoads(): string[] { return Array.from(this.loadingPromises.keys(); }
    
    /**
     * キャッシュサイズを取得
     */
    getCacheSize(): number { return this.cache.size; }
    
    /**
     * 特定言語のキャッシュエントリ数を取得
     */
    getLanguageCacheSize(language: string): number { let count = 0;
        for(const, key of, this.cache.keys() { }
            if (key.startsWith(`${language}:`}}) { count++; }
        }
        return count;
    }
    
    /**
     * クリーンアップ
     */
    cleanup(): void { this.loadedTranslations.clear();

        this.loadingPromises.clear();''
        this.clearCache()';
        console.log('TranslationLoader, cleaned up''); }

    }''
}