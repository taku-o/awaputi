/**
 * ソーシャル機能専用国際化マネージャー (Task 24)
 * 多言語メッセージテンプレート、地域別ソーシャルメディア対応を提供
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';

interface SocialI18nConfig {
    supportedLanguages: string[];
    regionalSettings: { [key: string]: RegionalSetting };
    cache: {
        enabled: boolean;
        maxSize: number;
        ttl: number;
    };
    fallback: {
        language: string;
        messageTemplate: string;
    };
    templates: {
        achievement: { [key: string]: string };
        score: { [key: string]: string };
        social: { [key: string]: string };
        game: { [key: string]: string };
    };
}

interface RegionalSetting {
    platforms: string[];
    dateFormat: string;
    numberFormat: string;
    currency: string;
    rtl: boolean;
    socialHosts: { [platform: string]: string };
}

interface SocialMessage {
    id: string;
    type: 'achievement' | 'score' | 'social' | 'game';
    language: string;
    template: string;
    variables: { [key: string]: any };
    metadata?: {
        platforms?: string[];
        tags?: string[];
        emoji?: string;
        url?: string;
    };
}

interface MessageTemplate {
    id: string;
    category: string;
    templates: { [language: string]: string };
    variables: string[];
    metadata: {
        description: string;
        platforms: string[];
        context: string;
    };
}

interface CacheEntry {
    key: string;
    message: string;
    timestamp: number;
    language: string;
    hitCount: number;
}

export class SocialI18nManager {
    private localizationManager: any;
    private errorHandler: any;
    private config: SocialI18nConfig;
    private messageTemplates: Map<string, MessageTemplate>;
    private messageCache: Map<string, CacheEntry>;
    private currentLanguage: string;
    private fallbackChain: string[];

    constructor(localizationManager: any, options: any = {}) {
        this.localizationManager = localizationManager;
        this.errorHandler = (ErrorHandler as any).getInstance();
        
        // 設定
        this.config = {
            // 対応言語（優先度順）
            supportedLanguages: [
                'ja', // 日本語（デフォルト）
                'en', // 英語
                'ko', // 韓国語
                'zh-CN', // 中国語（簡体字）
                'zh-TW', // 中国語（繁体字）
                'es', // スペイン語
                'fr', // フランス語
                'de', // ドイツ語
                'pt', // ポルトガル語
                'ru'  // ロシア語
            ],
            
            // 地域別設定
            regionalSettings: {
                'ja': {
                    platforms: ['twitter', 'line', 'facebook', 'copy'],
                    dateFormat: 'YYYY年MM月DD日',
                    numberFormat: '99,999',
                    currency: 'JPY',
                    rtl: false,
                    socialHosts: {
                        twitter: 'twitter.com',
                        facebook: 'facebook.com'
                    }
                },
                'en': {
                    platforms: ['twitter', 'facebook', 'reddit', 'copy'],
                    dateFormat: 'MM/DD/YYYY',
                    numberFormat: '99,999',
                    currency: 'USD',
                    rtl: false,
                    socialHosts: {
                        twitter: 'twitter.com',
                        facebook: 'facebook.com'
                    }
                },
                'ko': {
                    platforms: ['twitter', 'facebook', 'kakaotalk', 'copy'],
                    dateFormat: 'YYYY년 MM월 DD일',
                    numberFormat: '99,999',
                    currency: 'KRW',
                    rtl: false,
                    socialHosts: {
                        twitter: 'twitter.com',
                        facebook: 'facebook.com'
                    }
                },
                'zh-CN': {
                    platforms: ['weibo', 'wechat', 'qq', 'copy'],
                    dateFormat: 'YYYY年MM月DD日',
                    numberFormat: '99,999',
                    currency: 'CNY',
                    rtl: false,
                    socialHosts: {
                        weibo: 'weibo.com',
                        wechat: 'weixin.qq.com'
                    }
                },
                'zh-TW': {
                    platforms: ['facebook', 'line', 'twitter', 'copy'],
                    dateFormat: 'YYYY年MM月DD日',
                    numberFormat: '99,999',
                    currency: 'TWD',
                    rtl: false,
                    socialHosts: {
                        twitter: 'twitter.com',
                        facebook: 'facebook.com'
                    }
                },
                'ar': {
                    platforms: ['twitter', 'facebook', 'telegram', 'copy'],
                    dateFormat: 'DD/MM/YYYY',
                    numberFormat: '99,999',
                    currency: 'USD',
                    rtl: true,
                    socialHosts: {
                        twitter: 'twitter.com',
                        facebook: 'facebook.com'
                    }
                }
            },
            
            // キャッシュ設定
            cache: {
                enabled: options.cache !== false,
                maxSize: options.cacheSize || 1000,
                ttl: options.cacheTtl || 3600000 // 1時間
            },
            
            // フォールバック設定
            fallback: {
                language: 'en',
                messageTemplate: 'Check out my score in BubblePop! {{score}} points!'
            },
            
            // メッセージテンプレート
            templates: {
                achievement: {
                    'ja': '{{achievement}}を達成しました！BubblePopをプレイ中！',
                    'en': 'Just unlocked {{achievement}} in BubblePop!',
                    'ko': 'BubblePop에서 {{achievement}} 달성했어요!',
                    'zh-CN': '在BubblePop中获得了{{achievement}}！',
                    'zh-TW': '在BubblePop中獲得了{{achievement}}！'
                },
                score: {
                    'ja': 'BubblePopで{{score}}ポイントのスコアを達成！',
                    'en': 'Just scored {{score}} points in BubblePop!',
                    'ko': 'BubblePop에서 {{score}}점 달성!',
                    'zh-CN': '在BubblePop中获得{{score}}分！',
                    'zh-TW': '在BubblePop中獲得{{score}}分！'
                },
                social: {
                    'ja': 'BubblePopを一緒にプレイしませんか？',
                    'en': 'Want to play BubblePop together?',
                    'ko': 'BubblePop 함께 플레이해요!',
                    'zh-CN': '一起玩BubblePop吗？',
                    'zh-TW': '一起玩BubblePop嗎？'
                },
                game: {
                    'ja': 'BubblePopで楽しい時間を過ごしています！',
                    'en': 'Having a great time playing BubblePop!',
                    'ko': 'BubblePop로 즐거운 시간 보내고 있어요!',
                    'zh-CN': '正在BubblePop中享受快乐时光！',
                    'zh-TW': '正在BubblePop中享受快樂時光！'
                }
            }
        };

        // 初期化
        this.messageTemplates = new Map();
        this.messageCache = new Map();
        this.currentLanguage = this.detectLanguage();
        this.fallbackChain = this.buildFallbackChain(this.currentLanguage);

        this.initialize();
    }

    /**
     * システム初期化
     */
    private async initialize(): Promise<void> {
        try {
            // デフォルトテンプレートの登録
            this.registerDefaultTemplates();
            
            // カスタムテンプレートの読み込み
            await this.loadCustomTemplates();
            
            // キャッシュクリーンアップの設定
            this.setupCacheCleanup();
            
            console.log('[SocialI18nManager] 初期化完了');
            
        } catch (error) {
            this.errorHandler.handleError(error, 'SocialI18nManager.initialize');
            throw error;
        }
    }

    /**
     * 言語検出
     */
    private detectLanguage(): string {
        try {
            // LocalizationManagerから現在の言語を取得
            const currentLang = this.localizationManager?.getCurrentLanguage?.();
            if (currentLang && this.config.supportedLanguages.includes(currentLang)) {
                return currentLang;
            }

            // ブラウザの言語設定から検出
            const browserLang = navigator.language || 'en';
            const normalizedLang = this.normalizeLangCode(browserLang);
            
            if (this.config.supportedLanguages.includes(normalizedLang)) {
                return normalizedLang;
            }

            // ベース言語での再試行（zh-CN -> zh）
            const baseLang = normalizedLang.split('-')[0];
            const matchingLang = this.config.supportedLanguages.find(lang => 
                lang.startsWith(baseLang)
            );
            
            if (matchingLang) {
                return matchingLang;
            }

            // デフォルト言語
            return 'ja';
            
        } catch (error) {
            console.warn('[SocialI18nManager] Language detection failed:', error);
            return 'ja';
        }
    }

    /**
     * 言語コードの正規化
     */
    private normalizeLangCode(langCode: string): string {
        const normalized = langCode.toLowerCase().replace('_', '-');
        
        // 特殊ケースの処理
        const specialCases: { [key: string]: string } = {
            'zh-hans': 'zh-CN',
            'zh-hant': 'zh-TW',
            'zh-cn': 'zh-CN',
            'zh-tw': 'zh-TW'
        };
        
        return specialCases[normalized] || normalized;
    }

    /**
     * フォールバックチェーンの構築
     */
    private buildFallbackChain(primaryLang: string): string[] {
        const chain = [primaryLang];
        
        // 同系統言語のフォールバック
        if (primaryLang.startsWith('zh-')) {
            if (primaryLang !== 'zh-CN') chain.push('zh-CN');
            if (primaryLang !== 'zh-TW') chain.push('zh-TW');
        }
        
        // 英語フォールバック（既に含まれていない場合）
        if (primaryLang !== 'en') {
            chain.push('en');
        }
        
        // 日本語フォールバック（既に含まれていない場合）
        if (primaryLang !== 'ja') {
            chain.push('ja');
        }
        
        return chain;
    }

    /**
     * デフォルトテンプレートの登録
     */
    private registerDefaultTemplates(): void {
        // 実績関連テンプレート
        this.registerMessageTemplate({
            id: 'achievement_unlock',
            category: 'achievement',
            templates: this.config.templates.achievement,
            variables: ['achievement'],
            metadata: {
                description: '実績解除時のメッセージ',
                platforms: ['twitter', 'facebook', 'line'],
                context: 'achievement_earned'
            }
        });

        // スコア関連テンプレート
        this.registerMessageTemplate({
            id: 'high_score',
            category: 'score',
            templates: this.config.templates.score,
            variables: ['score'],
            metadata: {
                description: '高得点達成時のメッセージ',
                platforms: ['twitter', 'facebook', 'line'],
                context: 'score_achieved'
            }
        });

        // ソーシャル招待テンプレート
        this.registerMessageTemplate({
            id: 'social_invite',
            category: 'social',
            templates: this.config.templates.social,
            variables: [],
            metadata: {
                description: '友達招待メッセージ',
                platforms: ['twitter', 'facebook', 'line', 'kakaotalk'],
                context: 'friend_invite'
            }
        });

        // ゲーム体験共有テンプレート
        this.registerMessageTemplate({
            id: 'game_experience',
            category: 'game',
            templates: this.config.templates.game,
            variables: [],
            metadata: {
                description: 'ゲーム体験共有メッセージ',
                platforms: ['twitter', 'facebook', 'line'],
                context: 'game_sharing'
            }
        });
    }

    /**
     * カスタムテンプレートの読み込み
     */
    private async loadCustomTemplates(): Promise<void> {
        try {
            // 外部ファイルやAPIからカスタムテンプレートを読み込む処理
            // 現在はプレースホルダー実装
            console.log('[SocialI18nManager] カスタムテンプレート読み込み完了');
            
        } catch (error) {
            console.warn('[SocialI18nManager] カスタムテンプレート読み込み失敗:', error);
        }
    }

    /**
     * メッセージテンプレートの登録
     */
    private registerMessageTemplate(template: MessageTemplate): void {
        this.messageTemplates.set(template.id, template);
    }

    /**
     * キャッシュクリーンアップの設定
     */
    private setupCacheCleanup(): void {
        if (!this.config.cache.enabled) return;

        // 定期的なキャッシュクリーンアップ（5分毎）
        setInterval(() => {
            this.cleanupCache();
        }, 5 * 60 * 1000);
    }

    /**
     * キャッシュクリーンアップ
     */
    private cleanupCache(): void {
        const now = Date.now();
        const toDelete: string[] = [];

        this.messageCache.forEach((entry, key) => {
            if (now - entry.timestamp > this.config.cache.ttl) {
                toDelete.push(key);
            }
        });

        toDelete.forEach(key => this.messageCache.delete(key));

        // サイズ制限の確認
        if (this.messageCache.size > this.config.cache.maxSize) {
            const entries = Array.from(this.messageCache.entries());
            entries.sort((a, b) => a[1].hitCount - b[1].hitCount);
            
            const deleteCount = this.messageCache.size - this.config.cache.maxSize;
            entries.slice(0, deleteCount).forEach(([key]) => {
                this.messageCache.delete(key);
            });
        }
    }

    /**
     * ソーシャルメッセージの生成
     */
    public generateSocialMessage(templateId: string, variables: { [key: string]: any } = {}, options: any = {}): SocialMessage {
        try {
            const language = options.language || this.currentLanguage;
            const cacheKey = this.generateCacheKey(templateId, variables, language);

            // キャッシュからの取得
            if (this.config.cache.enabled) {
                const cached = this.getCachedMessage(cacheKey);
                if (cached) {
                    return {
                        id: templateId,
                        type: this.getMessageType(templateId),
                        language: language,
                        template: cached,
                        variables: variables,
                        metadata: options.metadata
                    };
                }
            }

            // テンプレートの取得
            const template = this.messageTemplates.get(templateId);
            if (!template) {
                throw new Error(`Template not found: ${templateId}`);
            }

            // メッセージの生成
            const message = this.interpolateMessage(template, language, variables);
            
            // キャッシュに保存
            if (this.config.cache.enabled) {
                this.cacheMessage(cacheKey, message, language);
            }

            return {
                id: templateId,
                type: this.getMessageType(templateId),
                language: language,
                template: message,
                variables: variables,
                metadata: this.buildMessageMetadata(template, language, options.metadata)
            };

        } catch (error) {
            this.errorHandler.handleError(error, 'SocialI18nManager.generateSocialMessage');
            
            // フォールバックメッセージ
            return {
                id: templateId,
                type: 'game',
                language: this.config.fallback.language,
                template: this.config.fallback.messageTemplate,
                variables: variables
            };
        }
    }

    /**
     * メッセージタイプの取得
     */
    private getMessageType(templateId: string): 'achievement' | 'score' | 'social' | 'game' {
        const template = this.messageTemplates.get(templateId);
        
        if (template) {
            return template.category as 'achievement' | 'score' | 'social' | 'game';
        }
        
        // フォールバック
        if (templateId.includes('achievement')) return 'achievement';
        if (templateId.includes('score')) return 'score';
        if (templateId.includes('social')) return 'social';
        return 'game';
    }

    /**
     * メッセージの補間
     */
    private interpolateMessage(template: MessageTemplate, language: string, variables: { [key: string]: any }): string {
        // フォールバックチェーンを使用してテンプレートを取得
        let messageTemplate: string | undefined;
        
        for (const lang of this.fallbackChain) {
            if (template.templates[lang]) {
                messageTemplate = template.templates[lang];
                break;
            }
        }

        if (!messageTemplate) {
            messageTemplate = this.config.fallback.messageTemplate;
        }

        // 変数の補間
        let interpolatedMessage = messageTemplate;
        
        Object.entries(variables).forEach(([key, value]) => {
            const placeholder = new RegExp(`{{${key}}}`, 'g');
            const formattedValue = this.formatValue(value, key, language);
            interpolatedMessage = interpolatedMessage.replace(placeholder, formattedValue);
        });

        // 地域固有の書式設定
        interpolatedMessage = this.applyRegionalFormatting(interpolatedMessage, language);

        return interpolatedMessage;
    }

    /**
     * 値のフォーマット
     */
    private formatValue(value: any, key: string, language: string): string {
        const regionalSetting = this.config.regionalSettings[language];
        
        if (!regionalSetting) {
            return String(value);
        }

        // 数値のフォーマット
        if (typeof value === 'number') {
            if (key === 'score' || key === 'points') {
                return this.formatNumber(value, regionalSetting.numberFormat);
            }
        }

        // 日付のフォーマット
        if (value instanceof Date) {
            return this.formatDate(value, regionalSetting.dateFormat);
        }

        return String(value);
    }

    /**
     * 数値フォーマット
     */
    private formatNumber(value: number, format: string): string {
        // 簡単な数値フォーマット実装
        if (format.includes(',')) {
            return value.toLocaleString();
        }
        return value.toString();
    }

    /**
     * 日付フォーマット
     */
    private formatDate(date: Date, format: string): string {
        // 簡単な日付フォーマット実装
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        return format
            .replace('YYYY', year.toString())
            .replace('MM', month.toString().padStart(2, '0'))
            .replace('DD', day.toString().padStart(2, '0'));
    }

    /**
     * 地域固有フォーマットの適用
     */
    private applyRegionalFormatting(message: string, language: string): string {
        const regionalSetting = this.config.regionalSettings[language];
        
        if (!regionalSetting) {
            return message;
        }

        // RTL（右から左）言語の処理
        if (regionalSetting.rtl) {
            // RTL用のフォーマット適用
            message = '\u202E' + message + '\u202C'; // RLE + message + PDF
        }

        return message;
    }

    /**
     * メッセージメタデータの構築
     */
    private buildMessageMetadata(template: MessageTemplate, language: string, customMetadata?: any): any {
        const regionalSetting = this.config.regionalSettings[language];
        
        return {
            platforms: regionalSetting?.platforms || template.metadata.platforms,
            tags: this.generateTags(template, language),
            emoji: this.getLanguageEmoji(language),
            url: this.generateGameUrl(language),
            ...customMetadata
        };
    }

    /**
     * タグの生成
     */
    private generateTags(template: MessageTemplate, _language: string): string[] {
        const baseTags = ['BubblePop', 'ゲーム', 'game'];
        
        // カテゴリ固有タグ
        const categoryTags: { [key: string]: string[] } = {
            achievement: ['実績', 'achievement', '達成'],
            score: ['スコア', 'score', 'ハイスコア'],
            social: ['友達', 'friends', 'social'],
            game: ['プレイ', 'play', 'gaming']
        };

        return [...baseTags, ...(categoryTags[template.category] || [])];
    }

    /**
     * 言語固有絵文字の取得
     */
    private getLanguageEmoji(language: string): string {
        const emojiMap: { [key: string]: string } = {
            'ja': '🎌',
            'en': '🇺🇸',
            'ko': '🇰🇷',
            'zh-CN': '🇨🇳',
            'zh-TW': '🇹🇼',
            'es': '🇪🇸',
            'fr': '🇫🇷',
            'de': '🇩🇪',
            'pt': '🇵🇹',
            'ru': '🇷🇺'
        };

        return emojiMap[language] || '🎮';
    }

    /**
     * ゲームURLの生成
     */
    private generateGameUrl(language: string): string {
        const baseUrl = 'https://bubblepop.game';
        return `${baseUrl}?lang=${language}`;
    }

    /**
     * キャッシュキーの生成
     */
    private generateCacheKey(templateId: string, variables: { [key: string]: any }, language: string): string {
        const variablesStr = JSON.stringify(variables);
        return `${templateId}:${language}:${variablesStr}`;
    }

    /**
     * キャッシュからメッセージを取得
     */
    private getCachedMessage(cacheKey: string): string | null {
        const entry = this.messageCache.get(cacheKey);
        
        if (!entry) return null as any;
        
        const now = Date.now();
        if (now - entry.timestamp > this.config.cache.ttl) {
            this.messageCache.delete(cacheKey);
            return null as any;
        }

        // ヒット回数を更新
        entry.hitCount++;
        
        return entry.message;
    }

    /**
     * メッセージをキャッシュに保存
     */
    private cacheMessage(cacheKey: string, message: string, language: string): void {
        this.messageCache.set(cacheKey, {
            key: cacheKey,
            message: message,
            timestamp: Date.now(),
            language: language,
            hitCount: 1
        });
    }

    /**
     * 地域設定の取得
     */
    public getRegionalSettings(language?: string): RegionalSetting | null {
        const lang = language || this.currentLanguage;
        return this.config.regionalSettings[lang] || null;
    }

    /**
     * 対応プラットフォームの取得
     */
    public getSupportedPlatforms(language?: string): string[] {
        const regionalSetting = this.getRegionalSettings(language);
        return regionalSetting?.platforms || ['twitter', 'facebook', 'copy'];
    }

    /**
     * ソーシャルホストの取得
     */
    public getSocialHost(platform: string, language?: string): string | null {
        const regionalSetting = this.getRegionalSettings(language);
        return regionalSetting?.socialHosts[platform] || null;
    }

    /**
     * 現在の言語を取得
     */
    public getCurrentLanguage(): string {
        return this.currentLanguage;
    }

    /**
     * 言語の変更
     */
    public setLanguage(language: string): void {
        if (this.config.supportedLanguages.includes(language)) {
            this.currentLanguage = language;
            this.fallbackChain = this.buildFallbackChain(language);
            console.log(`[SocialI18nManager] Language changed to: ${language}`);
        } else {
            console.warn(`[SocialI18nManager] Unsupported language: ${language}`);
        }
    }

    /**
     * 対応言語の取得
     */
    public getSupportedLanguages(): string[] {
        return [...this.config.supportedLanguages];
    }

    /**
     * テンプレート一覧の取得
     */
    public getAvailableTemplates(): string[] {
        return Array.from(this.messageTemplates.keys());
    }

    /**
     * テンプレート詳細の取得
     */
    public getTemplateInfo(templateId: string): MessageTemplate | null {
        return this.messageTemplates.get(templateId) || null;
    }

    /**
     * キャッシュ統計の取得
     */
    public getCacheStats(): any {
        return {
            enabled: this.config.cache.enabled,
            size: this.messageCache.size,
            maxSize: this.config.cache.maxSize,
            hitRate: this.calculateCacheHitRate(),
            ttl: this.config.cache.ttl
        };
    }

    /**
     * キャッシュヒット率の計算
     */
    private calculateCacheHitRate(): number {
        if (this.messageCache.size === 0) return 0;

        const totalHits = Array.from(this.messageCache.values())
            .reduce((sum, entry) => sum + entry.hitCount, 0);
            
        return totalHits / this.messageCache.size;
    }

    /**
     * キャッシュクリア
     */
    public clearCache(): void {
        this.messageCache.clear();
        console.log('[SocialI18nManager] キャッシュクリア完了');
    }

    /**
     * カスタムテンプレート追加
     */
    public addCustomTemplate(template: MessageTemplate): boolean {
        try {
            this.registerMessageTemplate(template);
            console.log(`[SocialI18nManager] カスタムテンプレート追加: ${template.id}`);
            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'SocialI18nManager.addCustomTemplate');
            return false;
        }
    }

    /**
     * 設定の更新
     */
    public updateConfig(newConfig: Partial<SocialI18nConfig>): void {
        this.config = { ...this.config, ...newConfig };
        
        // 言語変更の場合はフォールバックチェーンを再構築
        if (newConfig.supportedLanguages) {
            this.fallbackChain = this.buildFallbackChain(this.currentLanguage);
        }
        
        console.log('[SocialI18nManager] 設定更新完了');
    }

    /**
     * デバッグ情報の取得
     */
    public getDebugInfo(): any {
        return {
            currentLanguage: this.currentLanguage,
            fallbackChain: this.fallbackChain,
            templateCount: this.messageTemplates.size,
            cacheStats: this.getCacheStats(),
            supportedLanguages: this.config.supportedLanguages,
            regionalSettings: Object.keys(this.config.regionalSettings)
        };
    }

    /**
     * クリーンアップ
     */
    public dispose(): void {
        this.messageCache.clear();
        this.messageTemplates.clear();
        console.log('[SocialI18nManager] クリーンアップ完了');
    }
}