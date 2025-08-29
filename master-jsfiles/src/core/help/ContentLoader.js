/**
 * ContentLoader.js
 * ヘルプコンテンツの非同期読み込みとキャッシュ管理クラス
 * 多言語対応とバージョン管理機能を提供
 */

import { ErrorHandler } from '../../utils/ErrorHandler.js';
import { getLocalizationManager } from '../LocalizationManager.js';
import { CacheSystem } from '../CacheSystem.js';
import { LoggingSystem } from '../LoggingSystem.js';
import { HelpContentModel, TutorialModel, FAQModel, UserProgressModel } from './DataModels.js';

/**
 * コンテンツ読み込み管理クラス
 */
export class ContentLoader {
    constructor(localizationManager = null) {
        this.localizationManager = localizationManager || getLocalizationManager();
        this.cacheSystem = CacheSystem.getInstance ? CacheSystem.getInstance() : new CacheSystem();
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // 読み込み設定
        this.config = {
            baseUrl: '/help',
            defaultLanguage: 'ja',
            supportedLanguages: ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'],
            cacheTimeout: 30 * 60 * 1000, // 30分
            retryAttempts: 3,
            retryDelay: 1000
        };
        
        // キャッシュ管理
        this.contentCache = new Map();
        this.versionCache = new Map();
        this.loadingPromises = new Map();
        
        // バージョン管理
        this.contentVersions = new Map();
        this.manifestCache = new Map();
        
        this.initialize();
    }

    /**
     * ContentLoaderの初期化
     */
    async initialize() {
        try {
            this.loggingSystem.info('ContentLoader', 'Initializing content loader...');
            
            // マニフェストファイルの読み込み
            await this.loadContentManifest();
            
            // デフォルト言語のコンテンツをプリロード
            const currentLanguage = this.localizationManager.getCurrentLanguage();
            await this.preloadEssentialContent(currentLanguage);
            
            this.loggingSystem.info('ContentLoader', 'Content loader initialized successfully');
        } catch (error) {
            this.loggingSystem.error('ContentLoader', 'Failed to initialize content loader', error);
            ErrorHandler.handle(error, 'ContentLoader.initialize');
        }
    }

    /**
     * ヘルプコンテンツの読み込み
     * @param {string} language - 言語コード
     * @param {Object} options - 読み込みオプション
     * @returns {Promise<HelpContentModel>} ヘルプコンテンツ
     */
    async loadHelpContent(language = 'ja', options = {}) {
        try {
            const cacheKey = `help_content_${language}`;
            
            // 既に読み込み中の場合は同じPromiseを返す
            if (this.loadingPromises.has(cacheKey)) {
                return await this.loadingPromises.get(cacheKey);
            }
            
            // キャッシュから確認
            if (!options.forceReload) {
                const cached = this.getCachedContent(cacheKey);
                if (cached && this.isContentValid(cached)) {
                    this.loggingSystem.debug('ContentLoader', `Help content loaded from cache: ${language}`);
                    return cached;
                }
            }
            
            // 読み込みPromiseを作成
            const loadPromise = this.performContentLoad('help', language, options);
            this.loadingPromises.set(cacheKey, loadPromise);
            
            try {
                const content = await loadPromise;
                const model = new HelpContentModel(content);
                
                // バリデーション
                if (!model.validate()) {
                    throw new Error(`Invalid help content format: ${language}`);
                }
                
                // キャッシュに保存
                this.setCachedContent(cacheKey, model);
                
                this.loggingSystem.info('ContentLoader', `Help content loaded: ${language}`);
                return model;
                
            } finally {
                this.loadingPromises.delete(cacheKey);
            }
            
        } catch (error) {
            this.loggingSystem.error('ContentLoader', `Failed to load help content: ${language}`, error);
            
            // フォールバック処理
            if (language !== this.config.defaultLanguage) {
                this.loggingSystem.info('ContentLoader', `Falling back to default language: ${this.config.defaultLanguage}`);
                return await this.loadHelpContent(this.config.defaultLanguage, options);
            }
            
            throw error;
        }
    }

    /**
     * チュートリアルデータの読み込み
     * @param {string} language - 言語コード
     * @param {Object} options - 読み込みオプション
     * @returns {Promise<TutorialModel[]>} チュートリアルデータ配列
     */
    async loadTutorialData(language = 'ja', options = {}) {
        try {
            const cacheKey = `tutorial_data_${language}`;
            
            // キャッシュ確認
            if (!options.forceReload) {
                const cached = this.getCachedContent(cacheKey);
                if (cached && this.isContentValid(cached)) {
                    this.loggingSystem.debug('ContentLoader', `Tutorial data loaded from cache: ${language}`);
                    return cached;
                }
            }
            
            const rawData = await this.performContentLoad('tutorials', language, options);
            
            // 複数のチュートリアルデータを TutorialModel に変換
            const tutorials = [];
            if (rawData.tutorials && Array.isArray(rawData.tutorials)) {
                for (const tutorialData of rawData.tutorials) {
                    const model = new TutorialModel(tutorialData);
                    if (model.validate()) {
                        tutorials.push(model);
                    } else {
                        this.loggingSystem.warn('ContentLoader', `Invalid tutorial data: ${tutorialData.id}`);
                    }
                }
            }
            
            // キャッシュに保存
            this.setCachedContent(cacheKey, tutorials);
            
            this.loggingSystem.info('ContentLoader', `Tutorial data loaded: ${language} (${tutorials.length} tutorials)`);
            return tutorials;
            
        } catch (error) {
            this.loggingSystem.error('ContentLoader', `Failed to load tutorial data: ${language}`, error);
            
            // フォールバック処理
            if (language !== this.config.defaultLanguage) {
                return await this.loadTutorialData(this.config.defaultLanguage, options);
            }
            
            return [];
        }
    }

    /**
     * FAQデータの読み込み
     * @param {string} language - 言語コード
     * @param {Object} options - 読み込みオプション
     * @returns {Promise<FAQModel[]>} FAQデータ配列
     */
    async loadFAQData(language = 'ja', options = {}) {
        try {
            const cacheKey = `faq_data_${language}`;
            
            // キャッシュ確認
            if (!options.forceReload) {
                const cached = this.getCachedContent(cacheKey);
                if (cached && this.isContentValid(cached)) {
                    this.loggingSystem.debug('ContentLoader', `FAQ data loaded from cache: ${language}`);
                    return cached;
                }
            }
            
            const rawData = await this.performContentLoad('faq', language, options);
            
            // FAQ データを FAQModel に変換
            const faqs = [];
            if (rawData.faqs && Array.isArray(rawData.faqs)) {
                for (const faqData of rawData.faqs) {
                    const model = new FAQModel(faqData);
                    if (model.validate()) {
                        faqs.push(model);
                    } else {
                        this.loggingSystem.warn('ContentLoader', `Invalid FAQ data: ${faqData.id}`);
                    }
                }
            }
            
            // キャッシュに保存
            this.setCachedContent(cacheKey, faqs);
            
            this.loggingSystem.info('ContentLoader', `FAQ data loaded: ${language} (${faqs.length} FAQs)`);
            return faqs;
            
        } catch (error) {
            this.loggingSystem.error('ContentLoader', `Failed to load FAQ data: ${language}`, error);
            
            // フォールバック処理
            if (language !== this.config.defaultLanguage) {
                return await this.loadFAQData(this.config.defaultLanguage, options);
            }
            
            return [];
        }
    }

    /**
     * キャッシュされたコンテンツの取得
     * @param {string} key - キャッシュキー
     * @returns {Object|null} キャッシュされたコンテンツ
     */
    getCachedContent(key) {
        try {
            // システムキャッシュから確認
            const systemCached = this.cacheSystem.get(key);
            if (systemCached) {
                return systemCached;
            }
            
            // ローカルキャッシュから確認
            const localCached = this.contentCache.get(key);
            if (localCached && this.isContentValid(localCached)) {
                return localCached.data;
            }
            
            return null;
        } catch (error) {
            this.loggingSystem.error('ContentLoader', `Failed to get cached content: ${key}`, error);
            return null;
        }
    }

    /**
     * コンテンツのキャッシュ保存
     * @param {string} key - キャッシュキー
     * @param {Object} content - コンテンツ
     */
    setCachedContent(key, content) {
        try {
            const cacheData = {
                data: content,
                timestamp: Date.now(),
                version: this.getContentVersion(key),
                language: this.extractLanguageFromKey(key)
            };
            
            // システムキャッシュに保存
            this.cacheSystem.set(key, content, this.config.cacheTimeout);
            
            // ローカルキャッシュに保存
            this.contentCache.set(key, cacheData);
            
            this.loggingSystem.debug('ContentLoader', `Content cached: ${key}`);
        } catch (error) {
            this.loggingSystem.error('ContentLoader', `Failed to cache content: ${key}`, error);
        }
    }

    /**
     * キャッシュのクリア
     * @param {string} pattern - クリア対象パターン（オプション）
     */
    clearCache(pattern = null) {
        try {
            if (pattern) {
                // パターンに一致するキャッシュのみクリア
                for (const [key] of this.contentCache.entries()) {
                    if (key.includes(pattern)) {
                        this.contentCache.delete(key);
                        this.cacheSystem.delete(key);
                    }
                }
                this.loggingSystem.info('ContentLoader', `Cache cleared for pattern: ${pattern}`);
            } else {
                // 全キャッシュをクリア
                this.contentCache.clear();
                this.loggingSystem.info('ContentLoader', 'All cache cleared');
            }
        } catch (error) {
            this.loggingSystem.error('ContentLoader', 'Failed to clear cache', error);
        }
    }

    /**
     * コンテンツバージョンのチェック
     * @returns {Promise<Object>} バージョン情報
     */
    async checkContentVersion() {
        try {
            // マニフェストファイルから最新バージョンを取得
            const manifest = await this.loadContentManifest(true); // 強制リロード
            
            const versionInfo = {
                current: {},
                available: {},
                needsUpdate: false
            };
            
            // 各コンテンツタイプのバージョンを比較
            for (const contentType of ['help', 'tutorials', 'faq']) {
                const currentVersion = this.contentVersions.get(contentType) || '0.0.0';
                const availableVersion = manifest.versions?.[contentType] || '0.0.0';
                
                versionInfo.current[contentType] = currentVersion;
                versionInfo.available[contentType] = availableVersion;
                
                if (this.compareVersions(availableVersion, currentVersion) > 0) {
                    versionInfo.needsUpdate = true;
                }
            }
            
            this.loggingSystem.debug('ContentLoader', 'Content version check completed', versionInfo);
            return versionInfo;
            
        } catch (error) {
            this.loggingSystem.error('ContentLoader', 'Failed to check content version', error);
            return { current: {}, available: {}, needsUpdate: false };
        }
    }

    /**
     * コンテンツの更新
     * @param {Array} contentTypes - 更新対象のコンテンツタイプ
     * @returns {Promise<boolean>} 更新成功フラグ
     */
    async updateContent(contentTypes = ['help', 'tutorials', 'faq']) {
        try {
            this.loggingSystem.info('ContentLoader', `Updating content: ${contentTypes.join(', ')}`);
            
            let updateSuccess = true;
            const supportedLanguages = this.config.supportedLanguages;
            
            for (const contentType of contentTypes) {
                for (const language of supportedLanguages) {
                    try {
                        // キャッシュをクリアして強制リロード
                        this.clearCache(`${contentType}_${language}`);
                        
                        // コンテンツを再読み込み
                        switch (contentType) {
                            case 'help':
                                await this.loadHelpContent(language, { forceReload: true });
                                break;
                            case 'tutorials':
                                await this.loadTutorialData(language, { forceReload: true });
                                break;
                            case 'faq':
                                await this.loadFAQData(language, { forceReload: true });
                                break;
                        }
                        
                    } catch (error) {
                        this.loggingSystem.error('ContentLoader', `Failed to update ${contentType} for ${language}`, error);
                        updateSuccess = false;
                    }
                }
            }
            
            if (updateSuccess) {
                this.loggingSystem.info('ContentLoader', 'Content update completed successfully');
            } else {
                this.loggingSystem.warn('ContentLoader', 'Content update completed with some errors');
            }
            
            return updateSuccess;
            
        } catch (error) {
            this.loggingSystem.error('ContentLoader', 'Failed to update content', error);
            return false;
        }
    }

    // ---- プライベートメソッド ----

    /**
     * 実際のコンテンツ読み込み処理
     * @param {string} contentType - コンテンツタイプ
     * @param {string} language - 言語コード
     * @param {Object} options - オプション
     * @returns {Promise<Object>} 読み込まれたコンテンツ
     */
    async performContentLoad(contentType, language, options = {}) {
        const url = `${this.config.baseUrl}/${language}/${contentType}.json`;
        let lastError = null;
        
        for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
            try {
                if (attempt > 0) {
                    // リトライ前に遅延
                    await this.delay(this.config.retryDelay * attempt);
                    this.loggingSystem.info('ContentLoader', `Retrying content load: ${url} (attempt ${attempt + 1})`);
                }
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Cache-Control': options.forceReload ? 'no-cache' : 'default'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const content = await response.json();
                
                // コンテンツバージョンを記録
                if (content.version) {
                    this.contentVersions.set(contentType, content.version);
                }
                
                return content;
                
            } catch (error) {
                lastError = error;
                this.loggingSystem.warn('ContentLoader', `Content load attempt ${attempt + 1} failed: ${url}`, error);
            }
        }
        
        throw lastError;
    }

    /**
     * コンテンツマニフェストの読み込み
     * @param {boolean} forceReload - 強制リロードフラグ
     * @returns {Promise<Object>} マニフェストデータ
     */
    async loadContentManifest(forceReload = false) {
        try {
            const cacheKey = 'content_manifest';
            
            if (!forceReload) {
                const cached = this.manifestCache.get(cacheKey);
                if (cached && Date.now() - cached.timestamp < this.config.cacheTimeout) {
                    return cached.data;
                }
            }
            
            const url = `${this.config.baseUrl}/manifest.json`;
            const response = await fetch(url, {
                headers: {
                    'Cache-Control': forceReload ? 'no-cache' : 'default'
                }
            });
            
            if (!response.ok) {
                // マニフェストが存在しない場合はデフォルトを返す
                return this.getDefaultManifest();
            }
            
            const manifest = await response.json();
            
            // キャッシュに保存
            this.manifestCache.set(cacheKey, {
                data: manifest,
                timestamp: Date.now()
            });
            
            this.loggingSystem.debug('ContentLoader', 'Content manifest loaded');
            return manifest;
            
        } catch (error) {
            this.loggingSystem.warn('ContentLoader', 'Failed to load content manifest, using default', error);
            return this.getDefaultManifest();
        }
    }

    /**
     * 必須コンテンツのプリロード
     * @param {string} language - 言語コード
     */
    async preloadEssentialContent(language) {
        try {
            const essentialContent = ['help']; // 基本的なヘルプコンテンツのみプリロード
            
            for (const contentType of essentialContent) {
                try {
                    switch (contentType) {
                        case 'help':
                            await this.loadHelpContent(language);
                            break;
                    }
                } catch (error) {
                    this.loggingSystem.warn('ContentLoader', `Failed to preload ${contentType}`, error);
                }
            }
            
            this.loggingSystem.info('ContentLoader', `Essential content preloaded for: ${language}`);
        } catch (error) {
            this.loggingSystem.error('ContentLoader', 'Failed to preload essential content', error);
        }
    }

    /**
     * コンテンツの有効性チェック
     * @param {Object} content - コンテンツ
     * @returns {boolean} 有効性フラグ
     */
    isContentValid(content) {
        if (!content) return false;
        
        // タイムスタンプベースの有効性チェック
        if (content.timestamp) {
            const age = Date.now() - content.timestamp;
            if (age > this.config.cacheTimeout) {
                return false;
            }
        }
        
        // データ構造の基本チェック
        if (content.data) {
            return content.data.version && content.data.sections;
        }
        
        return true;
    }

    /**
     * コンテンツバージョンの取得
     * @param {string} key - キャッシュキー
     * @returns {string} バージョン文字列
     */
    getContentVersion(key) {
        const contentType = key.split('_')[0];
        return this.contentVersions.get(contentType) || '1.0.0';
    }

    /**
     * キーから言語コードを抽出
     * @param {string} key - キャッシュキー
     * @returns {string} 言語コード
     */
    extractLanguageFromKey(key) {
        const parts = key.split('_');
        return parts[parts.length - 1] || 'ja';
    }

    /**
     * バージョン比較
     * @param {string} version1 - バージョン1
     * @param {string} version2 - バージョン2
     * @returns {number} 比較結果（1: version1が新しい、0: 同じ、-1: version2が新しい）
     */
    compareVersions(version1, version2) {
        const v1Parts = version1.split('.').map(Number);
        const v2Parts = version2.split('.').map(Number);
        
        for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
            const v1Part = v1Parts[i] || 0;
            const v2Part = v2Parts[i] || 0;
            
            if (v1Part > v2Part) return 1;
            if (v1Part < v2Part) return -1;
        }
        
        return 0;
    }

    /**
     * デフォルトマニフェストの取得
     * @returns {Object} デフォルトマニフェスト
     */
    getDefaultManifest() {
        return {
            version: '1.0.0',
            lastUpdated: Date.now(),
            languages: this.config.supportedLanguages,
            versions: {
                help: '1.0.0',
                tutorials: '1.0.0',
                faq: '1.0.0'
            }
        };
    }

    /**
     * 遅延処理
     * @param {number} ms - 遅延時間（ミリ秒）
     * @returns {Promise} 遅延Promise
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * リソースのクリーンアップ
     */
    destroy() {
        try {
            this.contentCache.clear();
            this.versionCache.clear();
            this.loadingPromises.clear();
            this.contentVersions.clear();
            this.manifestCache.clear();
            
            this.loggingSystem.info('ContentLoader', 'Content loader destroyed');
        } catch (error) {
            this.loggingSystem.error('ContentLoader', 'Failed to destroy content loader', error);
        }
    }
}

// シングルトンインスタンス管理
let contentLoaderInstance = null;

/**
 * ContentLoaderのシングルトンインスタンスを取得
 * @param {LocalizationManager} localizationManager - ローカライゼーションマネージャー
 * @returns {ContentLoader} ContentLoaderインスタンス
 */
export function getContentLoader(localizationManager = null) {
    if (!contentLoaderInstance) {
        contentLoaderInstance = new ContentLoader(localizationManager);
    }
    return contentLoaderInstance;
}

/**
 * ContentLoaderインスタンスを再初期化
 * @param {LocalizationManager} localizationManager - ローカライゼーションマネージャー
 * @returns {ContentLoader} 新しいContentLoaderインスタンス
 */
export function reinitializeContentLoader(localizationManager = null) {
    if (contentLoaderInstance) {
        contentLoaderInstance.destroy();
    }
    contentLoaderInstance = new ContentLoader(localizationManager);
    return contentLoaderInstance;
}