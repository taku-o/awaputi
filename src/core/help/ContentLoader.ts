/**
 * ContentLoader.ts
 * ヘルプコンテンツの非同期読み込みとキャッシュ管理クラス
 * 多言語対応とバージョン管理機能を提供
 */

import { ErrorHandler } from '../../utils/ErrorHandler.js';
import { getLocalizationManager } from '../LocalizationManager.js';
import { CacheSystem } from '../CacheSystem.js';
import { LoggingSystem } from '../LoggingSystem.js';
import { HelpContentModel, TutorialModel, FAQModel, UserProgressModel } from './DataModels.js';

// 型定義
export interface LocalizationManager {
    getCurrentLanguage(): string;
    getSupportedLanguages(): string[];
    setCurrentLanguage(language: string): void;
    getTranslation(key: string): string;
}

export interface ContentConfig {
    baseUrl: string;
    defaultLanguage: string;
    supportedLanguages: string[];
    cacheTimeout: number;
    retryAttempts: number;
    retryDelay: number;
}

export interface LoadOptions {
    forceReload?: boolean;
    timeout?: number;
    priority?: 'high' | 'normal' | 'low';
    [key: string]: any;
}

export interface CachedContentItem {
    data: any;
    timestamp: number;
    version?: string;
    expires: number;
}

export interface ContentManifest {
    version: string;
    lastUpdated: number;
    contents: {
        [contentType: string]: {
            [language: string]: {
                version: string;
                url: string;
                size: number;
                checksum?: string;
            };
        };
    };
}

export interface VersionInfo {
    version: string;
    lastUpdated: number;
    checksum?: string;
}

export interface TutorialData {
    tutorials: any[];
    [key: string]: any;
}

export interface FAQData {
    faqs: any[];
    [key: string]: any;
}

export interface GuidedTourData {
    tours: any[];
    [key: string]: any;
}

/**
 * コンテンツ読み込み管理クラス
 */
export class ContentLoader {
    private localizationManager: LocalizationManager;
    private cacheSystem: CacheSystem;
    private loggingSystem: LoggingSystem;
    
    // 読み込み設定
    private config: ContentConfig;
    
    // キャッシュ管理
    private contentCache: Map<string, CachedContentItem>;
    private versionCache: Map<string, VersionInfo>;
    private loadingPromises: Map<string, Promise<any>>;
    
    // バージョン管理
    private contentVersions: Map<string, string>;
    private manifestCache: Map<string, ContentManifest>;

    constructor(localizationManager: LocalizationManager | null = null) {
        this.localizationManager = localizationManager || getLocalizationManager();
        this.cacheSystem = CacheSystem.getInstance ? CacheSystem.getInstance() : new CacheSystem();
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // デフォルト設定
        this.config = {
            baseUrl: '/help',
            defaultLanguage: 'ja',
            supportedLanguages: ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'],
            cacheTimeout: 30 * 60 * 1000, // 30分
            retryAttempts: 3,
            retryDelay: 1000
        };
        
        // キャッシュ管理
        this.contentCache = new Map<string, CachedContentItem>();
        this.versionCache = new Map<string, VersionInfo>();
        this.loadingPromises = new Map<string, Promise<any>>();
        
        // バージョン管理
        this.contentVersions = new Map<string, string>();
        this.manifestCache = new Map<string, ContentManifest>();
        
        this.initialize();
    }

    /**
     * ContentLoaderの初期化
     */
    async initialize(): Promise<void> {
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
     * @param language - 言語コード
     * @param options - 読み込みオプション
     * @returns ヘルプコンテンツ
     */
    async loadHelpContent(language: string = 'ja', options: LoadOptions = {}): Promise<HelpContentModel> {
        try {
            const cacheKey = `help_content_${language}`;
            
            // 既に読み込み中の場合は同じPromiseを返す
            if (this.loadingPromises.has(cacheKey)) {
                return await this.loadingPromises.get(cacheKey)!;
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
     * @param language - 言語コード
     * @param options - 読み込みオプション
     * @returns チュートリアルデータ配列
     */
    async loadTutorialData(language: string = 'ja', options: LoadOptions = {}): Promise<TutorialModel[]> {
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
            
            const rawData: TutorialData = await this.performContentLoad('tutorials', language, options);
            
            // 複数のチュートリアルデータを TutorialModel に変換
            const tutorials: TutorialModel[] = [];
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
     * @param language - 言語コード
     * @param options - 読み込みオプション
     * @returns FAQデータ配列
     */
    async loadFAQData(language: string = 'ja', options: LoadOptions = {}): Promise<FAQModel[]> {
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
            
            const rawData: FAQData = await this.performContentLoad('faq', language, options);
            
            // FAQ データを FAQModel に変換
            const faqs: FAQModel[] = [];
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
     * 特定のチュートリアルを読み込み
     * @param tutorialId - チュートリアルID
     * @param language - 言語コード
     * @returns チュートリアルモデル
     */
    async loadTutorial(tutorialId: string, language: string = 'ja'): Promise<TutorialModel | null> {
        try {
            const tutorials = await this.loadTutorialData(language);
            const tutorial = tutorials.find(t => t.id === tutorialId);
            
            if (!tutorial) {
                this.loggingSystem.warn('ContentLoader', `Tutorial not found: ${tutorialId}`);
                return null;
            }
            
            return tutorial;
        } catch (error) {
            this.loggingSystem.error('ContentLoader', `Failed to load tutorial: ${tutorialId}`, error);
            return null;
        }
    }

    /**
     * ガイドツアーデータの読み込み
     * @param language - 言語コード
     * @returns ガイドツアーデータ
     */
    async loadGuidedTours(language: string = 'ja'): Promise<any> {
        try {
            const cacheKey = `guided_tours_${language}`;
            
            // キャッシュ確認
            const cached = this.getCachedContent(cacheKey);
            if (cached && this.isContentValid(cached)) {
                return cached;
            }
            
            const rawData: GuidedTourData = await this.performContentLoad('guided-tours', language);
            
            // キャッシュに保存
            this.setCachedContent(cacheKey, rawData);
            
            return rawData;
        } catch (error) {
            this.loggingSystem.error('ContentLoader', `Failed to load guided tours: ${language}`, error);
            return null;
        }
    }

    /**
     * キャッシュされたコンテンツの取得
     * @param key - キャッシュキー
     * @returns キャッシュされたコンテンツ
     */
    getCachedContent(key: string): any {
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
     * コンテンツをキャッシュに保存
     * @param key - キャッシュキー
     * @param data - データ
     * @param version - バージョン
     */
    setCachedContent(key: string, data: any, version?: string): void {
        try {
            const cachedItem: CachedContentItem = {
                data,
                timestamp: Date.now(),
                version,
                expires: Date.now() + this.config.cacheTimeout
            };
            
            // ローカルキャッシュに保存
            this.contentCache.set(key, cachedItem);
            
            // システムキャッシュにも保存
            this.cacheSystem.set(key, data, this.config.cacheTimeout);
            
        } catch (error) {
            this.loggingSystem.error('ContentLoader', `Failed to cache content: ${key}`, error);
        }
    }

    /**
     * コンテンツの有効性確認
     * @param cachedItem - キャッシュアイテム
     * @returns 有効性フラグ
     */
    isContentValid(cachedItem: CachedContentItem): boolean {
        try {
            if (!cachedItem) return false;
            
            // 期限チェック
            if (cachedItem.expires && Date.now() > cachedItem.expires) {
                return false;
            }
            
            // バージョンチェック（将来の実装）
            // if (cachedItem.version && this.hasNewerVersion(cachedItem.version)) {
            //     return false;
            // }
            
            return true;
        } catch (error) {
            this.loggingSystem.error('ContentLoader', 'Failed to validate cached content', error);
            return false;
        }
    }

    /**
     * 実際のコンテンツ読み込み処理
     * @param contentType - コンテンツタイプ
     * @param language - 言語コード
     * @param options - 読み込みオプション
     * @returns 読み込まれたコンテンツ
     */
    async performContentLoad(contentType: string, language: string, options: LoadOptions = {}): Promise<any> {
        try {
            const url = this.buildContentUrl(contentType, language);
            let attempts = 0;
            
            while (attempts < this.config.retryAttempts) {
                try {
                    const response = await this.fetchWithTimeout(url, options.timeout || 10000);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    const contentTypeHeader = response.headers.get('content-type');
                    if (contentTypeHeader && contentTypeHeader.includes('application/json')) {
                        return await response.json();
                    } else {
                        return await response.text();
                    }
                } catch (error) {
                    attempts++;
                    if (attempts >= this.config.retryAttempts) {
                        throw error;
                    }
                    
                    // リトライ前の待機
                    await this.delay(this.config.retryDelay * attempts);
                }
            }
        } catch (error) {
            this.loggingSystem.error('ContentLoader', `Content load failed: ${contentType}/${language}`, error);
            throw error;
        }
    }

    /**
     * コンテンツURLの構築
     * @param contentType - コンテンツタイプ
     * @param language - 言語コード
     * @returns URL
     */
    private buildContentUrl(contentType: string, language: string): string {
        return `${this.config.baseUrl}/${language}/${contentType}.json`;
    }

    /**
     * タイムアウト付きfetch
     * @param url - URL
     * @param timeout - タイムアウト時間
     * @returns Response
     */
    private async fetchWithTimeout(url: string, timeout: number): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
            return response;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    /**
     * 遅延処理
     * @param ms - ミリ秒
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * コンテンツマニフェストの読み込み
     */
    private async loadContentManifest(): Promise<void> {
        try {
            const manifestUrl = `${this.config.baseUrl}/manifest.json`;
            const response = await this.fetchWithTimeout(manifestUrl, 5000);
            
            if (response.ok) {
                const manifest: ContentManifest = await response.json();
                this.manifestCache.set('default', manifest);
                this.loggingSystem.info('ContentLoader', 'Content manifest loaded successfully');
            }
        } catch (error) {
            this.loggingSystem.warn('ContentLoader', 'Failed to load content manifest', error);
        }
    }

    /**
     * 必須コンテンツのプリロード
     * @param language - 言語コード
     */
    private async preloadEssentialContent(language: string): Promise<void> {
        try {
            // 並行してプリロード
            const preloadPromises = [
                this.loadHelpContent(language, { priority: 'high' }),
                this.loadTutorialData(language, { priority: 'high' })
            ];
            
            await Promise.allSettled(preloadPromises);
            
            this.loggingSystem.info('ContentLoader', `Essential content preloaded: ${language}`);
        } catch (error) {
            this.loggingSystem.warn('ContentLoader', `Failed to preload essential content: ${language}`, error);
        }
    }

    /**
     * キャッシュクリア
     * @param pattern - クリア対象パターン
     */
    clearCache(pattern?: string): void {
        try {
            if (pattern) {
                // パターンマッチングでクリア
                for (const key of this.contentCache.keys()) {
                    if (key.includes(pattern)) {
                        this.contentCache.delete(key);
                        this.cacheSystem.delete(key);
                    }
                }
            } else {
                // 全クリア
                this.contentCache.clear();
                this.cacheSystem.clear();
            }
            
            this.loggingSystem.info('ContentLoader', `Cache cleared: ${pattern || 'all'}`);
        } catch (error) {
            this.loggingSystem.error('ContentLoader', 'Failed to clear cache', error);
        }
    }

    /**
     * リソースのクリーンアップ
     */
    destroy(): void {
        try {
            // 進行中の読み込みをキャンセル
            this.loadingPromises.clear();
            
            // キャッシュをクリア
            this.clearCache();
            
            this.loggingSystem.info('ContentLoader', 'Content loader destroyed');
        } catch (error) {
            this.loggingSystem.error('ContentLoader', 'Failed to destroy content loader', error);
        }
    }
}

// シングルトンインスタンス管理
let contentLoaderInstance: ContentLoader | null = null;

/**
 * ContentLoaderのシングルトンインスタンスを取得
 * @param localizationManager - ローカライゼーションマネージャー
 * @returns ContentLoaderインスタンス
 */
export function getContentLoader(localizationManager?: LocalizationManager): ContentLoader {
    if (!contentLoaderInstance) {
        contentLoaderInstance = new ContentLoader(localizationManager || null);
    }
    return contentLoaderInstance;
}

/**
 * ContentLoaderインスタンスを再初期化
 * @param localizationManager - ローカライゼーションマネージャー
 * @returns 新しいContentLoaderインスタンス
 */
export function reinitializeContentLoader(localizationManager?: LocalizationManager): ContentLoader {
    if (contentLoaderInstance) {
        contentLoaderInstance.destroy();
    }
    contentLoaderInstance = new ContentLoader(localizationManager || null);
    return contentLoaderInstance;
}