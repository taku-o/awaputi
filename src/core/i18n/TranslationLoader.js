import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * 翻訳ローダー - 非同期翻訳ファイル読み込みシステム
 */
export class TranslationLoader {
    constructor() {
        this.loadedTranslations = new Map();
        this.loadingPromises = new Map();
        this.cache = new Map();
        this.baseURL = '/assets/i18n/';
        
        // ロード対象ファイル
        this.translationFiles = [
            'common',
            'menu', 
            'game',
            'settings',
            'errors',
            'achievements',
            'help'
        ];
    }
    
    /**
     * 言語の翻訳データを読み込み
     */
    async loadLanguage(language) {
        try {
            if (this.loadingPromises.has(language)) {
                return this.loadingPromises.get(language);
            }
            
            const promise = this._loadLanguageFiles(language);
            this.loadingPromises.set(language, promise);
            
            try {
                const translations = await promise;
                this.loadedTranslations.set(language, translations);
                console.log(`Successfully loaded translations for ${language}: ${Object.keys(translations).length} categories`);
                return translations;
            } finally {
                this.loadingPromises.delete(language);
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'TRANSLATION_LOADER_ERROR', {
                operation: 'loadLanguage',
                language: language
            });
            return {};
        }
    }
    
    /**
     * 複数言語を並列でプリロード
     */
    async preloadLanguages(languages) {
        try {
            const promises = languages.map(lang => this.loadLanguage(lang));
            const results = await Promise.allSettled(promises);
            
            const loaded = [];
            const failed = [];
            
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    loaded.push(languages[index]);
                } else {
                    failed.push({
                        language: languages[index],
                        error: result.reason
                    });
                }
            });
            
            console.log(`Preloaded languages - Success: ${loaded.length}, Failed: ${failed.length}`);
            return { loaded, failed };
        } catch (error) {
            getErrorHandler().handleError(error, 'TRANSLATION_LOADER_ERROR', {
                operation: 'preloadLanguages',
                languages: languages
            });
            return { loaded: [], failed: languages.map(lang => ({ language: lang, error })) };
        }
    }
    
    /**
     * 言語ファイルを実際に読み込み
     */
    async _loadLanguageFiles(language) {
        const translations = {};
        const loadPromises = [];
        
        for (const file of this.translationFiles) {
            const promise = this._loadTranslationFile(language, file)
                .then(data => {
                    if (data) {
                        translations[file] = data.translations || data;
                    }
                })
                .catch(error => {
                    console.warn(`Failed to load ${file}.json for ${language}:`, error);
                    // ファイルが見つからない場合はエラーを無視して続行
                });
            
            loadPromises.push(promise);
        }
        
        // 全ファイルの読み込み完了を待つ
        await Promise.all(loadPromises);
        
        console.log(`TranslationLoader: Loaded categories for ${language}:`, Object.keys(translations));
        
        // 翻訳データをフラット化
        const flattened = this._flattenTranslations(translations);
        console.log(`TranslationLoader: Flattened ${Object.keys(flattened).length} keys for ${language}`);
        
        return flattened;
    }
    
    /**
     * 単一の翻訳ファイルを読み込み
     */
    async _loadTranslationFile(language, filename) {
        try {
            const url = `${this.baseURL}${language}/${filename}.json`;
            
            // キャッシュチェック
            const cacheKey = `${language}:${filename}`;
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < 300000) { // 5分間キャッシュ
                    return cached.data;
                }
            }
            
            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn(`Translation file not found: ${url}`);
                    return null;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // メタデータの検証
            if (data.meta) {
                this._validateMetadata(data.meta, language, filename);
            }
            
            // キャッシュに保存
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.warn(`Failed to load translation file ${language}/${filename}.json:`, error);
            return null;
        }
    }
    
    /**
     * 翻訳データのメタデータを検証
     */
    _validateMetadata(meta, language, filename) {
        if (meta.language !== language) {
            console.warn(`Language mismatch in ${filename}: expected ${language}, got ${meta.language}`);
        }
        
        if (meta.version) {
            console.log(`Loaded ${filename} v${meta.version} for ${language}`);
        }
        
        if (meta.completeness !== undefined && meta.completeness < 90) {
            console.warn(`Translation completeness for ${language}/${filename} is low: ${meta.completeness}%`);
        }
    }
    
    /**
     * 翻訳データをフラット化
     */
    _flattenTranslations(categorizedTranslations) {
        const flattened = {};
        
        for (const [category, translations] of Object.entries(categorizedTranslations)) {
            if (translations && typeof translations === 'object') {
                console.log(`TranslationLoader: Processing category ${category} with keys:`, Object.keys(translations));
                
                // 各カテゴリのネストされた構造をフラット化
                this._flattenNestedObject(translations, '', flattened);
            }
        }
        
        console.log(`TranslationLoader: Final flattened keys:`, Object.keys(flattened).slice(0, 10), '...');
        console.log(`TranslationLoader: Total keys: ${Object.keys(flattened).length}`);
        return flattened;
    }
    
    /**
     * ネストされたオブジェクトを再帰的にフラット化
     */
    _flattenNestedObject(obj, prefix, result) {
        for (const [key, value] of Object.entries(obj)) {
            const newKey = prefix ? `${prefix}.${key}` : key;
            
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                // オブジェクトの場合は再帰的に処理
                this._flattenNestedObject(value, newKey, result);
            } else {
                // プリミティブ値または配列の場合はそのまま設定
                result[newKey] = value;
            }
        }
    }
    
    /**
     * 特定のカテゴリの翻訳を読み込み
     */
    async loadCategory(language, category) {
        try {
            if (!this.translationFiles.includes(category)) {
                throw new Error(`Unknown category: ${category}`);
            }
            
            const data = await this._loadTranslationFile(language, category);
            return data ? (data.translations || data) : {};
        } catch (error) {
            getErrorHandler().handleError(error, 'TRANSLATION_LOADER_ERROR', {
                operation: 'loadCategory',
                language: language,
                category: category
            });
            return {};
        }
    }
    
    /**
     * 読み込み済み言語を取得
     */
    getLoadedLanguages() {
        return Array.from(this.loadedTranslations.keys());
    }
    
    /**
     * 特定言語の翻訳データを取得
     */
    getTranslations(language) {
        return this.loadedTranslations.get(language) || {};
    }
    
    /**
     * 翻訳データが読み込み済みかチェック
     */
    isLanguageLoaded(language) {
        return this.loadedTranslations.has(language);
    }
    
    /**
     * キャッシュをクリア
     */
    clearCache() {
        this.cache.clear();
        console.log('Translation loader cache cleared');
    }
    
    /**
     * 特定言語の翻訳データを削除
     */
    unloadLanguage(language) {
        const removed = this.loadedTranslations.delete(language);
        
        // キャッシュからも削除
        const cacheKeysToDelete = [];
        for (const key of this.cache.keys()) {
            if (key.startsWith(`${language}:`)) {
                cacheKeysToDelete.push(key);
            }
        }
        
        cacheKeysToDelete.forEach(key => this.cache.delete(key));
        
        if (removed) {
            console.log(`Unloaded translations for ${language}`);
        }
        
        return removed;
    }
    
    /**
     * ベース URLを設定
     */
    setBaseURL(url) {
        this.baseURL = url.endsWith('/') ? url : url + '/';
        console.log(`Translation base URL set to: ${this.baseURL}`);
    }
    
    /**
     * 翻訳ファイルリストを設定
     */
    setTranslationFiles(files) {
        if (Array.isArray(files)) {
            this.translationFiles = [...files];
            console.log(`Translation files set to: ${this.translationFiles.join(', ')}`);
        }
    }
    
    /**
     * 翻訳ファイルを追加
     */
    addTranslationFile(filename) {
        if (!this.translationFiles.includes(filename)) {
            this.translationFiles.push(filename);
            console.log(`Added translation file: ${filename}`);
        }
    }
    
    /**
     * 翻訳ファイルを削除
     */
    removeTranslationFile(filename) {
        const index = this.translationFiles.indexOf(filename);
        if (index !== -1) {
            this.translationFiles.splice(index, 1);
            console.log(`Removed translation file: ${filename}`);
            return true;
        }
        return false;
    }
    
    /**
     * ローダーの統計情報を取得
     */
    getStats() {
        const cacheStats = {
            entries: this.cache.size,
            byLanguage: {}
        };
        
        for (const key of this.cache.keys()) {
            const language = key.split(':')[0];
            cacheStats.byLanguage[language] = (cacheStats.byLanguage[language] || 0) + 1;
        }
        
        return {
            loadedLanguages: this.getLoadedLanguages(),
            translationFiles: this.translationFiles,
            cache: cacheStats,
            baseURL: this.baseURL,
            pendingLoads: Array.from(this.loadingPromises.keys())
        };
    }
    
    /**
     * リモート翻訳ファイルの存在確認
     */
    async checkFileExists(language, filename) {
        try {
            const url = `${this.baseURL}${language}/${filename}.json`;
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * 言語の利用可能ファイルを取得
     */
    async getAvailableFiles(language) {
        const available = [];
        const checkPromises = this.translationFiles.map(async (file) => {
            const exists = await this.checkFileExists(language, file);
            if (exists) {
                available.push(file);
            }
        });
        
        await Promise.all(checkPromises);
        return available;
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        this.loadedTranslations.clear();
        this.loadingPromises.clear();
        this.clearCache();
        console.log('TranslationLoader cleaned up');
    }
}