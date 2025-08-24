/**
 * MultilingualContentManager.ts
 * 多言語コンテンツ管理システム
 * LocalizationManagerとの統合、言語フォールバック、コンテンツ同期を提供
 */

import { getLocalizationManager } from '../LocalizationManager.js';
import { LoggingSystem } from '../LoggingSystem.js';
import { ErrorHandler } from '../../utils/ErrorHandler.js';
import { ContentLoader, getContentLoader } from './ContentLoader.js';
import { SearchEngine, getSearchEngine } from './SearchEngine.js';

// 型定義
export interface LocalizationManager {
    getCurrentLanguage(): string;
    on?(event: string, callback: Function): void;
}

export interface MultilingualConfig {
    supportedLanguages: string[];
    defaultLanguage: string;
    fallbackChain: Record<string, string[]>;
    autoTranslateThreshold: number;
    contentSyncInterval: number;
}

export interface LanguageStats {
    contentCoverage: Map<string, number>;
    translationQuality: Map<string, number>;
    userPreferences: Map<string, number>;
    fallbackUsage: Map<string, number>;
}

export interface ContentCoverageInfo {
    language: string;
    totalContent: number;
    availableContent: number;
    coverage: number;
    missingContent: string[];
}

export interface TranslationResult {
    success: boolean;
    translatedText: string;
    confidence: number;
    fallbackUsed: boolean;
    sourceLanguage: string;
    targetLanguage: string;
}

export interface ContentSyncResult {
    language: string;
    synced: number;
    failed: number;
    errors: string[];
}

export interface LanguageContent {
    helpContent: any;
    tutorialData: any[];
    faqData: any[];
    lastUpdated: number;
    version: string;
}

/**
 * 多言語コンテンツ管理クラス
 */
export class MultilingualContentManager {
    private localizationManager: LocalizationManager;
    private loggingSystem: LoggingSystem;
    private contentLoader: ContentLoader;
    private searchEngine: SearchEngine;
    
    // 言語設定
    private config: MultilingualConfig;
    
    // コンテンツ管理
    private contentCache: Map<string, LanguageContent>;
    private translationCache: Map<string, any>;
    private contentVersions: Map<string, string>;
    private syncQueue: Set<string>;
    
    // 言語統計
    private languageStats: LanguageStats;

    constructor(localizationManager: LocalizationManager | null = null) {
        this.localizationManager = localizationManager || getLocalizationManager();
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        this.contentLoader = getContentLoader();
        this.searchEngine = getSearchEngine();

        // デフォルト設定
        this.config = {
            supportedLanguages: ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'],
            defaultLanguage: 'ja',
            fallbackChain: {
                'ja': ['en'],
                'en': ['ja'],
                'zh-CN': ['zh-TW', 'en', 'ja'],
                'zh-TW': ['zh-CN', 'en', 'ja'],
                'ko': ['en', 'ja']
            },
            autoTranslateThreshold: 0.7, // 翻訳品質閾値
            contentSyncInterval: 24 * 60 * 60 * 1000 // 24時間
        };
        
        // コンテンツ管理
        this.contentCache = new Map<string, LanguageContent>();
        this.translationCache = new Map<string, any>();
        this.contentVersions = new Map<string, string>();
        this.syncQueue = new Set<string>();
        
        // 言語統計
        this.languageStats = {
            contentCoverage: new Map<string, number>(),
            translationQuality: new Map<string, number>(),
            userPreferences: new Map<string, number>(),
            fallbackUsage: new Map<string, number>()
        };
        
        this.initialize();
    }

    /**
     * MultilingualContentManagerの初期化
     */
    async initialize(): Promise<void> {
        try {
            this.loggingSystem.info('MultilingualContentManager', 'Initializing multilingual content manager...');
            
            // 現在の言語設定を取得
            const currentLanguage = this.localizationManager.getCurrentLanguage();
            
            // サポート言語のコンテンツ状況を分析
            await this.analyzeContentCoverage();
            
            // デフォルト言語のコンテンツをロード
            await this.loadLanguageContent(currentLanguage);
            
            // 言語変更イベントの監視
            this.setupLanguageChangeListeners();
            
            this.loggingSystem.info('MultilingualContentManager', 'Multilingual content manager initialized successfully');
        } catch (error) {
            this.loggingSystem.error('MultilingualContentManager', 'Failed to initialize multilingual content manager', error);
            ErrorHandler.handle(error, 'MultilingualContentManager.initialize');
        }
    }

    /**
     * 指定言語のヘルプコンテンツを取得（フォールバック付き）
     * @param language - 言語コード
     * @param contentId - コンテンツID（オプション）
     * @returns ヘルプコンテンツ
     */
    async getHelpContent(language: string = 'ja', contentId?: string): Promise<any> {
        try {
            // キャッシュから確認
            const cached = this.getCachedContent(language, 'help');
            if (cached && (!contentId || this.hasContentId(cached, contentId))) {
                this.loggingSystem.debug('MultilingualContentManager', `Help content loaded from cache: ${language}`);
                return contentId ? this.extractContentById(cached, contentId) : cached;
            }
            
            // コンテンツローダーから取得を試行
            try {
                const content = await this.contentLoader.loadHelpContent(language);
                this.setCachedContent(language, 'help', content);
                
                return contentId ? this.extractContentById(content, contentId) : content;
                
            } catch (error) {
                this.loggingSystem.warn('MultilingualContentManager', `Failed to load help content for ${language}, trying fallback`);
                
                // フォールバック言語を試行
                const fallbackContent = await this.tryFallbackLanguages(language, 'help', contentId);
                if (fallbackContent) {
                    this.recordFallbackUsage(language);
                    return fallbackContent;
                }
                
                throw error;
            }
        } catch (error) {
            this.loggingSystem.error('MultilingualContentManager', `Failed to get help content: ${language}`, error);
            throw error;
        }
    }

    /**
     * 指定言語のチュートリアルコンテンツを取得
     * @param language - 言語コード
     * @param tutorialId - チュートリアルID（オプション）
     * @returns チュートリアルコンテンツ
     */
    async getTutorialContent(language: string = 'ja', tutorialId?: string): Promise<any> {
        try {
            // キャッシュから確認
            const cached = this.getCachedContent(language, 'tutorial');
            if (cached && (!tutorialId || this.hasTutorialId(cached, tutorialId))) {
                this.loggingSystem.debug('MultilingualContentManager', `Tutorial content loaded from cache: ${language}`);
                return tutorialId ? this.extractTutorialById(cached, tutorialId) : cached;
            }
            
            // コンテンツローダーから取得を試行
            try {
                const content = await this.contentLoader.loadTutorialData(language);
                this.setCachedContent(language, 'tutorial', content);
                
                return tutorialId ? this.extractTutorialById(content, tutorialId) : content;
                
            } catch (error) {
                this.loggingSystem.warn('MultilingualContentManager', `Failed to load tutorial content for ${language}, trying fallback`);
                
                // フォールバック言語を試行
                const fallbackContent = await this.tryFallbackLanguages(language, 'tutorial', tutorialId);
                if (fallbackContent) {
                    this.recordFallbackUsage(language);
                    return fallbackContent;
                }
                
                throw error;
            }
        } catch (error) {
            this.loggingSystem.error('MultilingualContentManager', `Failed to get tutorial content: ${language}`, error);
            throw error;
        }
    }

    /**
     * 指定言語のFAQコンテンツを取得
     * @param language - 言語コード
     * @param faqId - FAQ ID（オプション）
     * @returns FAQコンテンツ
     */
    async getFAQContent(language: string = 'ja', faqId?: string): Promise<any> {
        try {
            // キャッシュから確認
            const cached = this.getCachedContent(language, 'faq');
            if (cached && (!faqId || this.hasFAQId(cached, faqId))) {
                this.loggingSystem.debug('MultilingualContentManager', `FAQ content loaded from cache: ${language}`);
                return faqId ? this.extractFAQById(cached, faqId) : cached;
            }
            
            // コンテンツローダーから取得を試行
            try {
                const content = await this.contentLoader.loadFAQData(language);
                this.setCachedContent(language, 'faq', content);
                
                return faqId ? this.extractFAQById(content, faqId) : content;
                
            } catch (error) {
                this.loggingSystem.warn('MultilingualContentManager', `Failed to load FAQ content for ${language}, trying fallback`);
                
                // フォールバック言語を試行
                const fallbackContent = await this.tryFallbackLanguages(language, 'faq', faqId);
                if (fallbackContent) {
                    this.recordFallbackUsage(language);
                    return fallbackContent;
                }
                
                throw error;
            }
        } catch (error) {
            this.loggingSystem.error('MultilingualContentManager', `Failed to get FAQ content: ${language}`, error);
            throw error;
        }
    }

    /**
     * 多言語検索の実行
     * @param query - 検索クエリ
     * @param language - 言語コード
     * @param options - 検索オプション
     * @returns 検索結果
     */
    async multilingualSearch(query: string, language: string = 'ja', options: any = {}): Promise<any> {
        try {
            // 指定言語での検索
            let results = await this.searchInLanguage(query, language, options);
            
            // 結果が不十分な場合、フォールバック言語でも検索
            if (results.length < (options.minResults || 3)) {
                const fallbackLanguages = this.config.fallbackChain[language] || [];
                
                for (const fallbackLang of fallbackLanguages) {
                    const fallbackResults = await this.searchInLanguage(query, fallbackLang, options);
                    results = results.concat(fallbackResults);
                    
                    if (results.length >= (options.maxResults || 10)) {
                        break;
                    }
                }
                
                // 結果を重複排除とスコア順にソート
                results = this.deduplicateAndSortResults(results);
            }

            this.loggingSystem.debug('MultilingualContentManager', `Multilingual search completed: ${results.length} results`);
            return results;

        } catch (error) {
            this.loggingSystem.error('MultilingualContentManager', `Multilingual search failed: ${query}`, error);
            return [];
        }
    }

    /**
     * コンテンツカバレッジの分析
     * @returns カバレッジ情報
     */
    async analyzeContentCoverage(): Promise<ContentCoverageInfo[]> {
        const coverageInfo: ContentCoverageInfo[] = [];

        try {
            for (const language of this.config.supportedLanguages) {
                const info: ContentCoverageInfo = {
                    language,
                    totalContent: 0,
                    availableContent: 0,
                    coverage: 0,
                    missingContent: []
                };
                
                // 各コンテンツタイプの可用性をチェック
                const contentTypes = ['help', 'tutorial', 'faq'];
                for (const contentType of contentTypes) {
                    info.totalContent++;
                    try {
                        await this.checkContentAvailability(language, contentType);
                        info.availableContent++;
                    } catch (error) {
                        info.missingContent.push(contentType);
                    }
                }
                
                info.coverage = (info.availableContent / info.totalContent) * 100;
                this.languageStats.contentCoverage.set(language, info.coverage);

                coverageInfo.push(info);
            }

            this.loggingSystem.info('MultilingualContentManager', `Content coverage analysis completed for ${coverageInfo.length} languages`);
        } catch (error) {
            this.loggingSystem.error('MultilingualContentManager', 'Failed to analyze content coverage', error);
        }
        
        return coverageInfo;
    }

    /**
     * 指定言語のコンテンツを同期
     * @param language - 言語コード
     * @returns 同期結果
     */
    async syncLanguageContent(language: string): Promise<ContentSyncResult> {
        const result: ContentSyncResult = {
            language,
            synced: 0,
            failed: 0,
            errors: []
        };

        try {
            const contentTypes = ['help', 'tutorial', 'faq'];
            
            for (const contentType of contentTypes) {
                try {
                    await this.syncContentType(language, contentType);
                    result.synced++;
                } catch (error) {
                    result.failed++;
                    result.errors.push(`${contentType}: ${(error as Error).message}`);
                }
            }

            this.loggingSystem.info('MultilingualContentManager', `Content sync completed for ${language}: ${result.synced} synced, ${result.failed} failed`);

        } catch (error) {
            this.loggingSystem.error('MultilingualContentManager', `Failed to sync content for ${language}`, error);
            result.errors.push(`Sync process failed: ${(error as Error).message}`);
        }
        
        return result;
    }

    /**
     * サポート言語一覧を取得
     * @returns サポート言語配列
     */
    getSupportedLanguages(): string[] {
        return [...this.config.supportedLanguages];
    }

    /**
     * 言語統計を取得
     * @returns 言語統計情報
     */
    getLanguageStatistics(): LanguageStats {
        return {
            contentCoverage: new Map(this.languageStats.contentCoverage),
            translationQuality: new Map(this.languageStats.translationQuality),
            userPreferences: new Map(this.languageStats.userPreferences),
            fallbackUsage: new Map(this.languageStats.fallbackUsage)
        };
    }

    // ---- プライベートメソッド ----

    /**
     * 指定言語のコンテンツを読み込み
     * @param language - 言語コード
     */
    private async loadLanguageContent(language: string): Promise<void> {
        try {
            const languageContent: LanguageContent = {
                helpContent: null,
                tutorialData: [],
                faqData: [],
                lastUpdated: Date.now(),
                version: '1.0.0'
            };

            // 並行してコンテンツを読み込み
            const [helpContent, tutorialData, faqData] = await Promise.allSettled([
                this.contentLoader.loadHelpContent(language),
                this.contentLoader.loadTutorialData(language),
                this.contentLoader.loadFAQData(language)
            ]);

            if (helpContent.status === 'fulfilled') {
                languageContent.helpContent = helpContent.value;
            }
            
            if (tutorialData.status === 'fulfilled') {
                languageContent.tutorialData = tutorialData.value;
            }
            
            if (faqData.status === 'fulfilled') {
                languageContent.faqData = faqData.value;
            }
            
            this.contentCache.set(language, languageContent);

        } catch (error) {
            this.loggingSystem.error('MultilingualContentManager', `Failed to load content for ${language}`, error);
        }
    }

    /**
     * キャッシュからコンテンツを取得
     * @param language - 言語コード
     * @param contentType - コンテンツタイプ
     * @returns キャッシュされたコンテンツ
     */
    private getCachedContent(language: string, contentType: string): any {
        const languageContent = this.contentCache.get(language);
        if (!languageContent) return null;

        switch (contentType) {
            case 'help':
                return languageContent.helpContent;
            case 'tutorial':
                return languageContent.tutorialData;
            case 'faq':
                return languageContent.faqData;
            default:
                return null;
        }
    }

    /**
     * コンテンツをキャッシュに保存
     * @param language - 言語コード
     * @param contentType - コンテンツタイプ
     * @param content - コンテンツ
     */
    private setCachedContent(language: string, contentType: string, content: any): void {
        let languageContent = this.contentCache.get(language);
        if (!languageContent) {
            languageContent = {
                helpContent: null,
                tutorialData: [],
                faqData: [],
                lastUpdated: Date.now(),
                version: '1.0.0'
            };
        }

        switch (contentType) {
            case 'help':
                languageContent.helpContent = content;
                break;
            case 'tutorial':
                languageContent.tutorialData = content;
                break;
            case 'faq':
                languageContent.faqData = content;
                break;
        }
        
        languageContent.lastUpdated = Date.now();
        this.contentCache.set(language, languageContent);
    }

    /**
     * フォールバック言語を試行
     * @param language - 元の言語
     * @param contentType - コンテンツタイプ
     * @param itemId - アイテムID
     * @returns フォールバックコンテンツ
     */
    private async tryFallbackLanguages(language: string, contentType: string, itemId?: string): Promise<any> {
        const fallbackLanguages = this.config.fallbackChain[language] || [];
        
        for (const fallbackLang of fallbackLanguages) {
            try {
                let content: any;

                switch (contentType) {
                    case 'help':
                        content = await this.contentLoader.loadHelpContent(fallbackLang);
                        break;
                    case 'tutorial':
                        content = await this.contentLoader.loadTutorialData(fallbackLang);
                        break;
                    case 'faq':
                        content = await this.contentLoader.loadFAQData(fallbackLang);
                        break;
                    default:
                        continue;
                }
                
                this.setCachedContent(fallbackLang, contentType, content);
                
                if (itemId) {
                    return this.extractItemById(content, itemId, contentType);
                }
                
                return content;

            } catch (error) {
                this.loggingSystem.debug('MultilingualContentManager', `Fallback language ${fallbackLang} also failed`);
                continue;
            }
        }
        
        return null;
    }

    /**
     * 指定言語での検索を実行
     * @param query - 検索クエリ
     * @param language - 言語コード
     * @param options - オプション
     * @returns 検索結果
     */
    private async searchInLanguage(query: string, language: string, options: any): Promise<any[]> {
        try {
            // まず言語のコンテンツが利用可能か確認
            await this.loadLanguageContent(language);
            
            // 検索エンジンに言語固有の検索を依頼
            const results = await this.searchEngine.search(query, {
                ...options,
                language,
                includeLanguageInfo: true
            });
            
            return results.map((result: any) => ({
                ...result,
                sourceLanguage: language
            }));
            
        } catch (error) {
            this.loggingSystem.warn('MultilingualContentManager', `Search failed for language ${language}`, error);
            return [];
        }
    }

    /**
     * 検索結果の重複排除とソート
     * @param results - 検索結果配列
     * @returns 整理された検索結果
     */
    private deduplicateAndSortResults(results: any[]): any[] {
        const uniqueResults = new Map();
        
        results.forEach(result => {
            const key = result.id || result.title;
            if (!uniqueResults.has(key) || uniqueResults.get(key).score < result.score) {
                uniqueResults.set(key, result);
            }
        });
        
        return Array.from(uniqueResults.values())
            .sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    /**
     * コンテンツIDの存在確認
     * @param content - コンテンツ
     * @param contentId - コンテンツID
     * @returns 存在フラグ
     */
    private hasContentId(content: any, contentId: string): boolean {
        if (!content || !contentId) return false;
        
        if (content.id === contentId) return true;
        
        if (content.sections && Array.isArray(content.sections)) {
            return content.sections.some((section: any) => section.id === contentId);
        }
        
        return false;
    }

    /**
     * チュートリアルIDの存在確認
     * @param tutorials - チュートリアル配列
     * @param tutorialId - チュートリアルID
     * @returns 存在フラグ
     */
    private hasTutorialId(tutorials: any[], tutorialId: string): boolean {
        if (!Array.isArray(tutorials) || !tutorialId) return false;
        return tutorials.some(tutorial => tutorial.id === tutorialId);
    }

    /**
     * FAQ IDの存在確認
     * @param faqs - FAQ配列
     * @param faqId - FAQ ID
     * @returns 存在フラグ
     */
    private hasFAQId(faqs: any[], faqId: string): boolean {
        if (!Array.isArray(faqs) || !faqId) return false;
        return faqs.some(faq => faq.id === faqId);
    }

    /**
     * IDによるコンテンツ抽出
     * @param content - コンテンツ
     * @param itemId - アイテムID
     * @param contentType - コンテンツタイプ
     * @returns 抽出されたコンテンツ
     */
    private extractItemById(content: any, itemId: string, contentType: string): any {
        switch (contentType) {
            case 'help':
                return this.extractContentById(content, itemId);
            case 'tutorial':
                return this.extractTutorialById(content, itemId);
            case 'faq':
                return this.extractFAQById(content, itemId);
            default:
                return null;
        }
    }

    /**
     * IDによるヘルプコンテンツ抽出
     * @param content - ヘルプコンテンツ
     * @param contentId - コンテンツID
     * @returns 抽出されたコンテンツ
     */
    private extractContentById(content: any, contentId: string): any {
        if (content.id === contentId) return content;
        
        if (content.sections && Array.isArray(content.sections)) {
            return content.sections.find((section: any) => section.id === contentId);
        }
        
        return null;
    }

    /**
     * IDによるチュートリアル抽出
     * @param tutorials - チュートリアル配列
     * @param tutorialId - チュートリアルID
     * @returns 抽出されたチュートリアル
     */
    private extractTutorialById(tutorials: any[], tutorialId: string): any {
        if (!Array.isArray(tutorials)) return null;
        return tutorials.find(tutorial => tutorial.id === tutorialId);
    }

    /**
     * IDによるFAQ抽出
     * @param faqs - FAQ配列
     * @param faqId - FAQ ID
     * @returns 抽出されたFAQ
     */
    private extractFAQById(faqs: any[], faqId: string): any {
        if (!Array.isArray(faqs)) return null;
        return faqs.find(faq => faq.id === faqId);
    }

    /**
     * コンテンツ可用性チェック
     * @param language - 言語コード
     * @param contentType - コンテンツタイプ
     * @returns 可用性Promise
     */
    private async checkContentAvailability(language: string, contentType: string): Promise<void> {
        switch (contentType) {
            case 'help':
                await this.contentLoader.loadHelpContent(language);
                break;
            case 'tutorial':
                await this.contentLoader.loadTutorialData(language);
                break;
            case 'faq':
                await this.contentLoader.loadFAQData(language);
                break;
            default:
                throw new Error(`Unknown content type: ${contentType}`);
        }
    }

    /**
     * コンテンツタイプの同期
     * @param language - 言語コード
     * @param contentType - コンテンツタイプ
     */
    private async syncContentType(language: string, contentType: string): Promise<void> {
        const content = await this.checkContentAvailability(language, contentType);
        this.setCachedContent(language, contentType, content);
    }

    /**
     * フォールバック使用の記録
     * @param language - 元の言語
     */
    private recordFallbackUsage(language: string): void {
        const current = this.languageStats.fallbackUsage.get(language) || 0;
        this.languageStats.fallbackUsage.set(language, current + 1);
    }

    /**
     * 言語変更リスナーの設定
     */
    private setupLanguageChangeListeners(): void {
        try {
            if (this.localizationManager.on) {
                this.localizationManager.on('languageChanged', async (newLanguage: string) => {
                    await this.loadLanguageContent(newLanguage);
                    this.loggingSystem.info('MultilingualContentManager', `Content loaded for new language: ${newLanguage}`);
                });
            }
        } catch (error) {
            this.loggingSystem.warn('MultilingualContentManager', 'Failed to setup language change listeners', error);
        }
    }

    /**
     * リソースのクリーンアップ
     */
    destroy(): void {
        try {
            this.contentCache.clear();
            this.translationCache.clear();
            this.contentVersions.clear();
            this.syncQueue.clear();
            
            this.loggingSystem.info('MultilingualContentManager', 'Multilingual content manager destroyed');
        } catch (error) {
            this.loggingSystem.error('MultilingualContentManager', 'Failed to destroy multilingual content manager', error);
        }
    }
}

// シングルトンインスタンス管理
let multilingualContentManagerInstance: MultilingualContentManager | null = null;

/**
 * MultilingualContentManagerのシングルトンインスタンスを取得
 * @param localizationManager - ローカライゼーションマネージャー
 * @returns MultilingualContentManagerインスタンス
 */
export function getMultilingualContentManager(localizationManager?: LocalizationManager): MultilingualContentManager {
    if (!multilingualContentManagerInstance) {
        multilingualContentManagerInstance = new MultilingualContentManager(localizationManager || null);
    }
    return multilingualContentManagerInstance;
}

/**
 * MultilingualContentManagerインスタンスを再初期化
 * @param localizationManager - ローカライゼーションマネージャー
 * @returns 新しいMultilingualContentManagerインスタンス
 */
export function reinitializeMultilingualContentManager(localizationManager?: LocalizationManager): MultilingualContentManager {
    if (multilingualContentManagerInstance) {
        multilingualContentManagerInstance.destroy();
    }
    multilingualContentManagerInstance = new MultilingualContentManager(localizationManager || null);
    return multilingualContentManagerInstance;
}

export default MultilingualContentManager;