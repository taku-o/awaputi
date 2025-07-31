/**
 * MultilingualContentManager.js
 * 多言語コンテンツ管理システム
 * LocalizationManagerとの統合、言語フォールバック、コンテンツ同期を提供
 */

import { LocalizationManager } from '../LocalizationManager.js';
import { LoggingSystem } from '../LoggingSystem.js';
import { ErrorHandler } from '../../utils/ErrorHandler.js';
import { ContentLoader, getContentLoader } from './ContentLoader.js';
import { SearchEngine, getSearchEngine } from './SearchEngine.js';

/**
 * 多言語コンテンツ管理クラス
 */
export class MultilingualContentManager {
    constructor(localizationManager = null) {
        this.localizationManager = localizationManager || new LocalizationManager();
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        this.contentLoader = getContentLoader();
        this.searchEngine = getSearchEngine();
        
        // 言語設定
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
        this.contentCache = new Map(); // 言語別コンテンツキャッシュ
        this.translationCache = new Map(); // 翻訳キャッシュ
        this.contentVersions = new Map(); // 言語別バージョン管理
        this.syncQueue = new Set(); // 同期待ちコンテンツ
        
        // 言語統計
        this.languageStats = {
            contentCoverage: new Map(), // 言語別コンテンツカバレッジ
            translationQuality: new Map(), // 翻訳品質スコア
            userPreferences: new Map(), // ユーザー言語設定統計
            fallbackUsage: new Map() // フォールバック使用統計
        };
        
        this.initialize();
    }

    /**
     * MultilingualContentManagerの初期化
     */
    async initialize() {
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
     * 指定言語のコンテンツ取得（フォールバック付き）
     * @param {string} contentType - コンテンツタイプ
     * @param {string} contentId - コンテンツID
     * @param {string} language - 言語
     * @param {Object} options - オプション
     * @returns {Promise<Object>} コンテンツ
     */
    async getContent(contentType, contentId, language = null, options = {}) {
        try {
            const targetLanguage = language || this.localizationManager.getCurrentLanguage();
            
            // キャッシュから確認
            const cached = this.getCachedContent(contentType, contentId, targetLanguage);
            if (cached && !options.forceReload) {
                this.updateLanguageStats('contentAccess', targetLanguage);
                return cached;
            }
            
            // メインコンテンツの読み込み試行
            let content = await this.tryLoadContent(contentType, contentId, targetLanguage);
            
            // フォールバック処理
            if (!content && this.config.fallbackChain[targetLanguage]) {
                content = await this.performFallback(contentType, contentId, targetLanguage);
            }
            
            // コンテンツが見つからない場合のエラーハンドリング
            if (!content) {
                const errorMessage = `Content not found: ${contentType}/${contentId} in ${targetLanguage}`;
                this.loggingSystem.warn('MultilingualContentManager', errorMessage);
                return this.createMissingContentPlaceholder(contentType, contentId, targetLanguage);
            }
            
            // キャッシュに保存
            this.setCachedContent(contentType, contentId, targetLanguage, content);
            
            // 統計更新
            this.updateLanguageStats('contentAccess', targetLanguage);
            
            return content;
            
        } catch (error) {
            this.loggingSystem.error('MultilingualContentManager', `Failed to get content: ${contentType}/${contentId}`, error);
            return this.createErrorContentPlaceholder(contentType, contentId, language, error);
        }
    }

    /**
     * 複数言語のコンテンツを一括取得
     * @param {string} contentType - コンテンツタイプ
     * @param {Array} languages - 言語配列
     * @param {Object} options - オプション
     * @returns {Promise<Map>} 言語別コンテンツマップ
     */
    async getMultilingualContent(contentType, languages = null, options = {}) {
        try {
            const targetLanguages = languages || this.config.supportedLanguages;
            const contentMap = new Map();
            
            // 並列でコンテンツを読み込み
            const loadPromises = targetLanguages.map(async (language) => {
                try {
                    const content = await this.loadLanguageContent(language, contentType, options);
                    contentMap.set(language, content);
                } catch (error) {
                    this.loggingSystem.warn('MultilingualContentManager', `Failed to load ${contentType} for ${language}`, error);
                    contentMap.set(language, []);
                }
            });
            
            await Promise.all(loadPromises);
            
            this.loggingSystem.info('MultilingualContentManager', `Multilingual content loaded: ${contentType} (${targetLanguages.length} languages)`);
            return contentMap;
            
        } catch (error) {
            this.loggingSystem.error('MultilingualContentManager', 'Failed to get multilingual content', error);
            return new Map();
        }
    }

    /**
     * コンテンツの同期状況チェック
     * @param {string} language - 対象言語
     * @returns {Promise<Object>} 同期状況
     */
    async checkContentSynchronization(language = null) {
        try {
            const targetLanguage = language || this.localizationManager.getCurrentLanguage();
            const baseLanguage = this.config.defaultLanguage;
            
            if (targetLanguage === baseLanguage) {
                return { isSynchronized: true, missingContent: [], outdatedContent: [] };
            }
            
            // ベース言語のコンテンツを取得
            const baseContent = await this.loadLanguageContent(baseLanguage);
            const targetContent = await this.loadLanguageContent(targetLanguage);
            
            // 同期状況を分析
            const syncStatus = this.analyzeSynchronizationStatus(baseContent, targetContent, baseLanguage, targetLanguage);
            
            this.loggingSystem.debug('MultilingualContentManager', `Sync status for ${targetLanguage}:`, syncStatus);
            return syncStatus;
            
        } catch (error) {
            this.loggingSystem.error('MultilingualContentManager', 'Failed to check content synchronization', error);
            return { error: error.message, isSynchronized: false };
        }
    }

    /**
     * 言語間のコンテンツギャップ分析
     * @returns {Promise<Object>} ギャップ分析結果
     */
    async analyzeContentGaps() {
        try {
            this.loggingSystem.info('MultilingualContentManager', 'Analyzing content gaps across languages...');
            
            const gapAnalysis = {
                coverageByLanguage: new Map(),
                missingTranslations: new Map(),
                qualityScores: new Map(),
                recommendations: []
            };
            
            const baseLanguage = this.config.defaultLanguage;
            const baseContent = await this.loadLanguageContent(baseLanguage);
            const baseIds = new Set(baseContent.map(item => item.id));
            
            // 各言語の分析
            for (const language of this.config.supportedLanguages) {
                if (language === baseLanguage) continue;
                
                const langContent = await this.loadLanguageContent(language);
                const langIds = new Set(langContent.map(item => item.id));
                
                // カバレッジ計算
                const coverage = (langIds.size / baseIds.size) * 100;
                gapAnalysis.coverageByLanguage.set(language, coverage);
                
                // 不足コンテンツの特定
                const missingIds = [...baseIds].filter(id => !langIds.has(id));
                gapAnalysis.missingTranslations.set(language, missingIds);
                
                // 品質スコア計算
                const qualityScore = this.calculateTranslationQuality(langContent);
                gapAnalysis.qualityScores.set(language, qualityScore);
                
                // 推奨事項の生成
                if (coverage < 80) {
                    gapAnalysis.recommendations.push({
                        type: 'coverage',
                        language,
                        message: `${language} has low content coverage (${coverage.toFixed(1)}%)`,
                        priority: 'high',
                        missingCount: missingIds.length
                    });
                }
                
                if (qualityScore < 0.7) {
                    gapAnalysis.recommendations.push({
                        type: 'quality',
                        language,
                        message: `${language} content quality needs improvement (score: ${qualityScore.toFixed(2)})`,
                        priority: 'medium'
                    });
                }
            }
            
            // 統計更新
            this.languageStats.contentCoverage = gapAnalysis.coverageByLanguage;
            this.languageStats.translationQuality = gapAnalysis.qualityScores;
            
            this.loggingSystem.info('MultilingualContentManager', 'Content gap analysis completed', {
                totalLanguages: this.config.supportedLanguages.length,
                recommendations: gapAnalysis.recommendations.length
            });
            
            return gapAnalysis;
            
        } catch (error) {
            this.loggingSystem.error('MultilingualContentManager', 'Failed to analyze content gaps', error);
            return { error: error.message };
        }
    }

    /**
     * 言語設定の更新
     * @param {string} newLanguage - 新しい言語
     * @returns {Promise<boolean>} 更新成功フラグ
     */
    async updateLanguage(newLanguage) {
        try {
            if (!this.config.supportedLanguages.includes(newLanguage)) {
                throw new Error(`Unsupported language: ${newLanguage}`);
            }
            
            const oldLanguage = this.localizationManager.getCurrentLanguage();
            
            // LocalizationManagerの言語を更新
            await this.localizationManager.setLanguage(newLanguage);
            
            // 新しい言語のコンテンツをプリロード
            await this.loadLanguageContent(newLanguage);
            
            // 検索インデックスを更新
            await this.updateSearchIndex(newLanguage);
            
            // 統計更新
            this.updateLanguageStats('languageChange', newLanguage, { from: oldLanguage });
            
            this.loggingSystem.info('MultilingualContentManager', `Language updated: ${oldLanguage} -> ${newLanguage}`);
            return true;
            
        } catch (error) {
            this.loggingSystem.error('MultilingualContentManager', `Failed to update language to ${newLanguage}`, error);
            return false;
        }
    }

    /**
     * 多言語統計の取得
     * @returns {Object} 統計情報
     */
    getLanguageStatistics() {
        return {
            supportedLanguages: this.config.supportedLanguages,
            currentLanguage: this.localizationManager.getCurrentLanguage(),
            contentCoverage: Object.fromEntries(this.languageStats.contentCoverage),
            translationQuality: Object.fromEntries(this.languageStats.translationQuality),
            fallbackUsage: Object.fromEntries(this.languageStats.fallbackUsage),
            cacheStatistics: {
                contentCacheSize: this.contentCache.size,
                translationCacheSize: this.translationCache.size,
                syncQueueSize: this.syncQueue.size
            },
            lastUpdated: Date.now()
        };
    }

    // ---- プライベートメソッド ----

    /**
     * 言語別コンテンツの読み込み
     * @param {string} language - 言語
     * @param {string} contentType - コンテンツタイプ
     * @param {Object} options - オプション
     * @returns {Promise<Array>} コンテンツ配列
     */
    async loadLanguageContent(language, contentType = 'all', options = {}) {
        try {
            const cacheKey = `${language}_${contentType}`;
            
            // キャッシュ確認
            if (!options.forceReload && this.contentCache.has(cacheKey)) {
                const cached = this.contentCache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.config.contentSyncInterval) {
                    return cached.content;
                }
            }
            
            let allContent = [];
            
            if (contentType === 'all') {
                // 全コンテンツタイプを読み込み
                const [helpContent, tutorials, faqs] = await Promise.all([
                    this.contentLoader.loadHelpContent(language, options),
                    this.contentLoader.loadTutorialData(language, options),
                    this.contentLoader.loadFAQData(language, options)
                ]);
                
                allContent = [
                    ...(helpContent ? [helpContent] : []),
                    ...tutorials,
                    ...faqs
                ];
            } else {
                // 特定のコンテンツタイプのみ
                switch (contentType) {
                    case 'help':
                        const helpContent = await this.contentLoader.loadHelpContent(language, options);
                        allContent = helpContent ? [helpContent] : [];
                        break;
                    case 'tutorials':
                        allContent = await this.contentLoader.loadTutorialData(language, options);
                        break;
                    case 'faq':
                        allContent = await this.contentLoader.loadFAQData(language, options);
                        break;
                }
            }
            
            // キャッシュに保存
            this.contentCache.set(cacheKey, {
                content: allContent,
                timestamp: Date.now(),
                language,
                contentType
            });
            
            return allContent;
            
        } catch (error) {
            this.loggingSystem.error('MultilingualContentManager', `Failed to load language content: ${language}/${contentType}`, error);
            return [];
        }
    }

    /**
     * コンテンツ読み込み試行
     * @param {string} contentType - コンテンツタイプ
     * @param {string} contentId - コンテンツID
     * @param {string} language - 言語
     * @returns {Promise<Object|null>} コンテンツまたはnull
     */
    async tryLoadContent(contentType, contentId, language) {
        try {
            const allContent = await this.loadLanguageContent(language, contentType);
            return allContent.find(item => item.id === contentId) || null;
        } catch (error) {
            this.loggingSystem.debug('MultilingualContentManager', `Content load failed: ${contentType}/${contentId} in ${language}`, error);
            return null;
        }
    }

    /**
     * フォールバック処理
     * @param {string} contentType - コンテンツタイプ
     * @param {string} contentId - コンテンツID
     * @param {string} originalLanguage - 元の言語
     * @returns {Promise<Object|null>} フォールバックコンテンツ
     */
    async performFallback(contentType, contentId, originalLanguage) {
        const fallbackLanguages = this.config.fallbackChain[originalLanguage] || [this.config.defaultLanguage];
        
        for (const fallbackLang of fallbackLanguages) {
            try {
                const content = await this.tryLoadContent(contentType, contentId, fallbackLang);
                if (content) {
                    // フォールバック使用統計の更新
                    this.updateLanguageStats('fallbackUsage', originalLanguage, { fallbackTo: fallbackLang });
                    
                    this.loggingSystem.debug('MultilingualContentManager', `Fallback successful: ${originalLanguage} -> ${fallbackLang} for ${contentType}/${contentId}`);
                    
                    // フォールバックコンテンツであることを明示
                    return {
                        ...content,
                        _fallback: {
                            originalLanguage,
                            fallbackLanguage: fallbackLang,
                            timestamp: Date.now()
                        }
                    };
                }
            } catch (error) {
                this.loggingSystem.debug('MultilingualContentManager', `Fallback attempt failed: ${fallbackLang}`, error);
            }
        }
        
        return null;
    }

    /**
     * 同期状況の分析
     * @param {Array} baseContent - ベースコンテンツ
     * @param {Array} targetContent - 対象コンテンツ
     * @param {string} baseLanguage - ベース言語
     * @param {string} targetLanguage - 対象言語
     * @returns {Object} 同期状況
     */
    analyzeSynchronizationStatus(baseContent, targetContent, baseLanguage, targetLanguage) {
        const baseIds = new Set(baseContent.map(item => item.id));
        const targetIds = new Set(targetContent.map(item => item.id));
        const targetVersions = new Map(targetContent.map(item => [item.id, item.lastUpdated || 0]));
        
        const missingContent = [];
        const outdatedContent = [];
        
        for (const baseItem of baseContent) {
            if (!targetIds.has(baseItem.id)) {
                // 不足コンテンツ
                missingContent.push({
                    id: baseItem.id,
                    type: baseItem.type || 'unknown',
                    title: baseItem.title || baseItem.question || 'Untitled',
                    lastUpdated: baseItem.lastUpdated
                });
            } else {
                // バージョン比較
                const baseUpdated = baseItem.lastUpdated || 0;
                const targetUpdated = targetVersions.get(baseItem.id) || 0;
                
                if (baseUpdated > targetUpdated) {
                    outdatedContent.push({
                        id: baseItem.id,
                        type: baseItem.type || 'unknown',
                        title: baseItem.title || baseItem.question || 'Untitled',
                        baseUpdated,
                        targetUpdated,
                        daysBehind: Math.floor((baseUpdated - targetUpdated) / (24 * 60 * 60 * 1000))
                    });
                }
            }
        }
        
        const coverage = ((baseIds.size - missingContent.length) / baseIds.size) * 100;
        const isSynchronized = missingContent.length === 0 && outdatedContent.length === 0;
        
        return {
            isSynchronized,
            coverage,
            missingContent,
            outdatedContent,
            baseLanguage,
            targetLanguage,
            statistics: {
                baseContentCount: baseContent.length,
                targetContentCount: targetContent.length,
                missingCount: missingContent.length,
                outdatedCount: outdatedContent.length
            }
        };
    }

    /**
     * 翻訳品質スコアの計算
     * @param {Array} content - コンテンツ配列
     * @returns {number} 品質スコア（0-1）
     */
    calculateTranslationQuality(content) {
        if (!content || content.length === 0) return 0;
        
        let totalScore = 0;
        let scoredItems = 0;
        
        for (const item of content) {
            let itemScore = 1.0;
            
            // 基本的な品質チェック
            if (!item.title || item.title.length < 3) itemScore -= 0.2;
            if (!item.content && !item.answer) itemScore -= 0.3;
            if (item.language && item.language === 'ja') itemScore -= 0.1; // 機械翻訳の可能性
            
            // メタデータの完全性
            if (!item.lastUpdated) itemScore -= 0.1;
            if (!item.tags || item.tags.length === 0) itemScore -= 0.1;
            
            // フォールバックの使用履歴
            if (item._fallback) itemScore -= 0.2;
            
            totalScore += Math.max(0, itemScore);
            scoredItems++;
        }
        
        return scoredItems > 0 ? totalScore / scoredItems : 0;
    }

    /**
     * 不足コンテンツのプレースホルダー作成
     * @param {string} contentType - コンテンツタイプ
     * @param {string} contentId - コンテンツID
     * @param {string} language - 言語
     * @returns {Object} プレースホルダーコンテンツ
     */
    createMissingContentPlaceholder(contentType, contentId, language) {
        const placeholder = this.localizationManager.get('help.errors.contentNotFound', {
            contentType,
            contentId,
            language
        });
        
        return {
            id: contentId,
            type: contentType,
            title: placeholder,
            content: placeholder,
            language,
            _placeholder: true,
            _missing: true,
            timestamp: Date.now()
        };
    }

    /**
     * エラーコンテンツのプレースホルダー作成
     * @param {string} contentType - コンテンツタイプ
     * @param {string} contentId - コンテンツID
     * @param {string} language - 言語
     * @param {Error} error - エラー
     * @returns {Object} エラープレースホルダー
     */
    createErrorContentPlaceholder(contentType, contentId, language, error) {
        const errorMessage = this.localizationManager.get('help.errors.contentLoadError', {
            error: error.message
        });
        
        return {
            id: contentId,
            type: contentType,
            title: errorMessage,
            content: errorMessage,
            language,
            _placeholder: true,
            _error: true,
            error: error.message,
            timestamp: Date.now()
        };
    }

    /**
     * キャッシュからコンテンツ取得
     * @param {string} contentType - コンテンツタイプ
     * @param {string} contentId - コンテンツID
     * @param {string} language - 言語
     * @returns {Object|null} キャッシュされたコンテンツ
     */
    getCachedContent(contentType, contentId, language) {
        const cacheKey = `${language}_${contentType}`;
        const cached = this.contentCache.get(cacheKey);
        
        if (!cached) return null;
        
        // タイムアウトチェック
        if (Date.now() - cached.timestamp > this.config.contentSyncInterval) {
            this.contentCache.delete(cacheKey);
            return null;
        }
        
        return cached.content.find(item => item.id === contentId) || null;
    }

    /**
     * キャッシュにコンテンツ保存
     * @param {string} contentType - コンテンツタイプ
     * @param {string} contentId - コンテンツID
     * @param {string} language - 言語
     * @param {Object} content - コンテンツ
     */
    setCachedContent(contentType, contentId, language, content) {
        const cacheKey = `${language}_${contentType}`;
        let cached = this.contentCache.get(cacheKey);
        
        if (!cached) {
            cached = {
                content: [],
                timestamp: Date.now(),
                language,
                contentType
            };
            this.contentCache.set(cacheKey, cached);
        }
        
        // 既存のコンテンツを更新または追加
        const existingIndex = cached.content.findIndex(item => item.id === contentId);
        if (existingIndex >= 0) {
            cached.content[existingIndex] = content;
        } else {
            cached.content.push(content);
        }
        
        cached.timestamp = Date.now();
    }

    /**
     * 検索インデックスの更新
     * @param {string} language - 言語
     */
    async updateSearchIndex(language) {
        try {
            const allContent = await this.loadLanguageContent(language);
            
            // 言語別にコンテンツをグループ化
            const contentByType = new Map();
            for (const content of allContent) {
                const type = content.type || 'help';
                if (!contentByType.has(type)) {
                    contentByType.set(type, []);
                }
                contentByType.get(type).push(content);
            }
            
            // 検索エンジンのインデックスを更新
            for (const [type, contents] of contentByType.entries()) {
                this.searchEngine.indexContent(contents, type);
            }
            
            this.loggingSystem.debug('MultilingualContentManager', `Search index updated for language: ${language}`);
        } catch (error) {
            this.loggingSystem.error('MultilingualContentManager', `Failed to update search index for ${language}`, error);
        }
    }

    /**
     * 言語変更イベントリスナーの設定
     */
    setupLanguageChangeListeners() {
        // LocalizationManagerの言語変更イベントを監視
        if (this.localizationManager && typeof this.localizationManager.on === 'function') {
            this.localizationManager.on('languageChanged', async (newLanguage, oldLanguage) => {
                try {
                    await this.loadLanguageContent(newLanguage);
                    await this.updateSearchIndex(newLanguage);
                    this.updateLanguageStats('languageChange', newLanguage, { from: oldLanguage });
                } catch (error) {
                    this.loggingSystem.error('MultilingualContentManager', 'Failed to handle language change', error);
                }
            });
        }
    }

    /**
     * コンテンツカバレッジの分析
     */
    async analyzeContentCoverage() {
        try {
            const baseLanguage = this.config.defaultLanguage;
            const baseContent = await this.loadLanguageContent(baseLanguage);
            const baseCount = baseContent.length;
            
            for (const language of this.config.supportedLanguages) {
                if (language === baseLanguage) {
                    this.languageStats.contentCoverage.set(language, 100);
                    continue;
                }
                
                const langContent = await this.loadLanguageContent(language);
                const coverage = baseCount > 0 ? (langContent.length / baseCount) * 100 : 0;
                this.languageStats.contentCoverage.set(language, coverage);
            }
        } catch (error) {
            this.loggingSystem.error('MultilingualContentManager', 'Failed to analyze content coverage', error);
        }
    }

    /**
     * 言語統計の更新
     * @param {string} type - 統計タイプ
     * @param {string} language - 言語
     * @param {Object} data - 追加データ
     */
    updateLanguageStats(type, language, data = {}) {
        try {
            switch (type) {
                case 'contentAccess':
                    // コンテンツアクセス統計
                    break;
                case 'languageChange':
                    // 言語変更統計
                    if (data.from) {
                        const changeKey = `${data.from}->${language}`;
                        const currentCount = this.languageStats.userPreferences.get(changeKey) || 0;
                        this.languageStats.userPreferences.set(changeKey, currentCount + 1);
                    }
                    break;
                case 'fallbackUsage':
                    // フォールバック使用統計
                    if (data.fallbackTo) {
                        const fallbackKey = `${language}->${data.fallbackTo}`;
                        const currentCount = this.languageStats.fallbackUsage.get(fallbackKey) || 0;
                        this.languageStats.fallbackUsage.set(fallbackKey, currentCount + 1);
                    }
                    break;
            }
        } catch (error) {
            this.loggingSystem.error('MultilingualContentManager', `Failed to update language stats: ${type}`, error);
        }
    }

    /**
     * リソースのクリーンアップ
     */
    destroy() {
        try {
            this.contentCache.clear();
            this.translationCache.clear();
            this.contentVersions.clear();
            this.syncQueue.clear();
            
            // 統計をクリア
            this.languageStats.contentCoverage.clear();
            this.languageStats.translationQuality.clear();
            this.languageStats.userPreferences.clear();
            this.languageStats.fallbackUsage.clear();
            
            this.loggingSystem.info('MultilingualContentManager', 'Multilingual content manager destroyed');
        } catch (error) {
            this.loggingSystem.error('MultilingualContentManager', 'Failed to destroy multilingual content manager', error);
        }
    }
}

// シングルトンインスタンス管理
let multilingualContentManagerInstance = null;

/**
 * MultilingualContentManagerのシングルトンインスタンスを取得
 * @param {LocalizationManager} localizationManager - ローカライゼーションマネージャー
 * @returns {MultilingualContentManager} MultilingualContentManagerインスタンス
 */
export function getMultilingualContentManager(localizationManager = null) {
    if (!multilingualContentManagerInstance) {
        multilingualContentManagerInstance = new MultilingualContentManager(localizationManager);
    }
    return multilingualContentManagerInstance;
}

/**
 * MultilingualContentManagerインスタンスを再初期化
 * @param {LocalizationManager} localizationManager - ローカライゼーションマネージャー
 * @returns {MultilingualContentManager} 新しいMultilingualContentManagerインスタンス
 */
export function reinitializeMultilingualContentManager(localizationManager = null) {
    if (multilingualContentManagerInstance) {
        multilingualContentManagerInstance.destroy();
    }
    multilingualContentManagerInstance = new MultilingualContentManager(localizationManager);
    return multilingualContentManagerInstance;
}