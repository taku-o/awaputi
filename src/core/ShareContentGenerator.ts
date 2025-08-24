/**
 * 共有コンテンツ生成システム
 * メッセージテンプレート管理、多言語対応、プラットフォーム別最適化を行う
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';

interface ScoreData {
    score: number;
    level?: number;
    combo?: number;
    accuracy?: number;
    playTime?: number;
}

interface AchievementData {
    name: string;
    description?: string;
    category?: string;
    rarity?: string;
    unlockedAt?: Date;
}

interface ChallengeData {
    name: string;
    description?: string;
    difficulty?: string;
    completedAt?: Date;
    timeSpent?: number;
}

interface ShareOptions {
    includeUrl?: boolean;
    includeHashtags?: boolean;
    customMessage?: string;
    additionalData?: { [key: string]: any };
}

interface MessageTemplate {
    [platform: string]: {
        [language: string]: string;
    };
}

interface Templates {
    score: MessageTemplate;
    achievement: MessageTemplate;
    challenge: MessageTemplate;
    [key: string]: MessageTemplate;
}

export class ShareContentGenerator {
    private localizationManager: any;
    private socialI18nManager: any;
    private errorHandler: any;
    private templates: Templates;

    constructor(localizationManager: any, socialI18nManager: any = null) {
        this.localizationManager = localizationManager;
        this.socialI18nManager = socialI18nManager;
        this.errorHandler = ErrorHandler.getInstance();
        
        // メッセージテンプレート
        this.templates = this.initializeTemplates();
        this.log('ShareContentGenerator初期化完了');
    }
    
    /**
     * メッセージテンプレートの初期化
     */
    private initializeTemplates(): Templates {
        return {
            score: {
                twitter: {
                    ja: "BubblePopで{score}点を達成！ あなたも挑戦してみませんか？ #BubblePop #ゲーム {url}",
                    en: "I scored {score} points in BubblePop! Can you beat it? #BubblePop #Game {url}",
                    'zh-CN': "我在BubblePop中获得了{score}分！你能超越吗？ #BubblePop #游戏 {url}",
                    'zh-TW': "我在BubblePop中獲得了{score}分！你能超越嗎？ #BubblePop #遊戲 {url}",
                    ko: "BubblePop에서 {score}점을 달성했습니다! 도전해보시겠어요? #BubblePop #게임 {url}"
                },
                facebook: {
                    ja: "BubblePopで{score}点を達成しました！",
                    en: "I scored {score} points in BubblePop!",
                    'zh-CN': "我在BubblePop中获得了{score}分！",
                    'zh-TW': "我在BubblePop中獲得了{score}分！",
                    ko: "BubblePop에서 {score}점을 달성했습니다!"
                },
                generic: {
                    ja: "BubblePopで{score}点を達成！",
                    en: "Scored {score} points in BubblePop!",
                    'zh-CN': "BubblePop获得{score}分！",
                    'zh-TW': "BubblePop獲得{score}分！",
                    ko: "BubblePop {score}점 달성!"
                }
            },
            achievement: {
                twitter: {
                    ja: "BubblePopで実績「{name}」を解除！ {description} #BubblePop #実績 {url}",
                    en: "Unlocked achievement '{name}' in BubblePop! {description} #BubblePop #Achievement {url}",
                    'zh-CN': "在BubblePop中解锁成就「{name}」！{description} #BubblePop #成就 {url}",
                    'zh-TW': "在BubblePop中解鎖成就「{name}」！{description} #BubblePop #成就 {url}",
                    ko: "BubblePop에서 업적 '{name}' 달성! {description} #BubblePop #업적 {url}"
                },
                facebook: {
                    ja: "BubblePopで新しい実績を解除しました！",
                    en: "Unlocked a new achievement in BubblePop!",
                    'zh-CN': "在BubblePop中解锁了新成就！",
                    'zh-TW': "在BubblePop中解鎖了新成就！",
                    ko: "BubblePop에서 새로운 업적을 달성했습니다!"
                },
                generic: {
                    ja: "実績「{name}」を解除しました！",
                    en: "Achievement '{name}' unlocked!",
                    'zh-CN': "解锁成就「{name}」！",
                    'zh-TW': "解鎖成就「{name}」！",
                    ko: "업적 '{name}' 달성!"
                }
            },
            challenge: {
                twitter: {
                    ja: "BubblePopのチャレンジ「{name}」をクリア！ {description} #BubblePop #チャレンジ {url}",
                    en: "Completed challenge '{name}' in BubblePop! {description} #BubblePop #Challenge {url}",
                    'zh-CN': "完成BubblePop挑战「{name}」！{description} #BubblePop #挑战 {url}",
                    'zh-TW': "完成BubblePop挑戰「{name}」！{description} #BubblePop #挑戰 {url}",
                    ko: "BubblePop 챌린지 '{name}' 클리어! {description} #BubblePop #챌린지 {url}"
                },
                facebook: {
                    ja: "BubblePopのチャレンジをクリアしました！",
                    en: "Completed a challenge in BubblePop!",
                    'zh-CN': "完成了BubblePop的挑战！",
                    'zh-TW': "完成了BubblePop的挑戰！",
                    ko: "BubblePop 챌린지를 완료했습니다!"
                },
                generic: {
                    ja: "チャレンジ「{name}」をクリア！",
                    en: "Challenge '{name}' completed!",
                    'zh-CN': "完成挑战「{name}」！",
                    'zh-TW': "完成挑戰「{name}」！",
                    ko: "챌린지 '{name}' 완료!"
                }
            }
        };
    }
    
    /**
     * スコア共有メッセージの生成
     */
    public generateScoreMessage(scoreData: ScoreData, platform: string = 'generic', options: ShareOptions = {}): string {
        try {
            const startTime = performance.now();
            
            if (!scoreData || typeof scoreData.score !== 'number') {
                throw new Error('不正なスコアデータ');
            }
            
            // 言語とプラットフォームの決定
            const language = this.getCurrentLanguage();
            const platformKey = this.normalizePlatform(platform);
            
            // テンプレートの取得
            const template = this.getTemplate('score', platformKey, language);
            if (!template) {
                throw new Error(`テンプレートが見つかりません: score/${platformKey}/${language}`);
            }
            
            // メッセージの生成
            let message = this.interpolateTemplate(template, {
                score: this.formatNumber(scoreData.score),
                level: scoreData.level || '',
                combo: scoreData.combo || '',
                accuracy: scoreData.accuracy ? `${scoreData.accuracy.toFixed(1)}%` : '',
                playTime: scoreData.playTime ? this.formatPlayTime(scoreData.playTime) : '',
                url: options.includeUrl !== false ? this.generateGameUrl() : ''
            });
            
            // プラットフォーム固有の処理
            message = this.applyPlatformSpecificFormatting(message, platform);
            
            // カスタムメッセージの追加
            if (options.customMessage) {
                message = `${options.customMessage} ${message}`;
            }
            
            // 文字数制限の適用
            message = this.applyCharacterLimits(message, platform);
            
            const processingTime = performance.now() - startTime;
            this.log(`スコアメッセージ生成完了 (${processingTime.toFixed(2)}ms): ${message}`);
            
            return message.trim();
            
        } catch (error) {
            this.errorHandler.handleError(error, 'ShareContentGenerator.generateScoreMessage');
            return this.getFallbackMessage('score', platform);
        }
    }
    
    /**
     * 実績共有メッセージの生成
     */
    public generateAchievementMessage(achievementData: AchievementData, platform: string = 'generic', options: ShareOptions = {}): string {
        try {
            if (!achievementData || !achievementData.name) {
                throw new Error('不正な実績データ');
            }
            
            const language = this.getCurrentLanguage();
            const platformKey = this.normalizePlatform(platform);
            
            const template = this.getTemplate('achievement', platformKey, language);
            if (!template) {
                throw new Error(`テンプレートが見つかりません: achievement/${platformKey}/${language}`);
            }
            
            let message = this.interpolateTemplate(template, {
                name: achievementData.name,
                description: achievementData.description || '',
                category: achievementData.category || '',
                rarity: achievementData.rarity || '',
                url: options.includeUrl !== false ? this.generateGameUrl() : ''
            });
            
            message = this.applyPlatformSpecificFormatting(message, platform);
            
            if (options.customMessage) {
                message = `${options.customMessage} ${message}`;
            }
            
            message = this.applyCharacterLimits(message, platform);
            
            this.log(`実績メッセージ生成完了: ${message}`);
            return message.trim();
            
        } catch (error) {
            this.errorHandler.handleError(error, 'ShareContentGenerator.generateAchievementMessage');
            return this.getFallbackMessage('achievement', platform);
        }
    }
    
    /**
     * チャレンジ共有メッセージの生成
     */
    public generateChallengeMessage(challengeData: ChallengeData, platform: string = 'generic', options: ShareOptions = {}): string {
        try {
            if (!challengeData || !challengeData.name) {
                throw new Error('不正なチャレンジデータ');
            }
            
            const language = this.getCurrentLanguage();
            const platformKey = this.normalizePlatform(platform);
            
            const template = this.getTemplate('challenge', platformKey, language);
            if (!template) {
                throw new Error(`テンプレートが見つかりません: challenge/${platformKey}/${language}`);
            }
            
            let message = this.interpolateTemplate(template, {
                name: challengeData.name,
                description: challengeData.description || '',
                difficulty: challengeData.difficulty || '',
                timeSpent: challengeData.timeSpent ? this.formatPlayTime(challengeData.timeSpent) : '',
                url: options.includeUrl !== false ? this.generateGameUrl() : ''
            });
            
            message = this.applyPlatformSpecificFormatting(message, platform);
            
            if (options.customMessage) {
                message = `${options.customMessage} ${message}`;
            }
            
            message = this.applyCharacterLimits(message, platform);
            
            this.log(`チャレンジメッセージ生成完了: ${message}`);
            return message.trim();
            
        } catch (error) {
            this.errorHandler.handleError(error, 'ShareContentGenerator.generateChallengeMessage');
            return this.getFallbackMessage('challenge', platform);
        }
    }
    
    /**
     * カスタムメッセージの生成
     */
    public generateCustomMessage(messageType: string, data: any, platform: string = 'generic', options: ShareOptions = {}): string {
        try {
            // SocialI18nManagerが利用可能な場合はそれを使用
            if (this.socialI18nManager) {
                return this.socialI18nManager.generateSocialMessage(messageType, data, {
                    language: this.getCurrentLanguage(),
                    platform: platform,
                    ...options
                }).template;
            }
            
            // フォールバック処理
            const language = this.getCurrentLanguage();
            const platformKey = this.normalizePlatform(platform);
            
            const template = this.getTemplate(messageType, platformKey, language);
            if (!template) {
                return this.getFallbackMessage(messageType, platform);
            }
            
            let message = this.interpolateTemplate(template, {
                ...data,
                url: options.includeUrl !== false ? this.generateGameUrl() : ''
            });
            
            message = this.applyPlatformSpecificFormatting(message, platform);
            message = this.applyCharacterLimits(message, platform);
            
            return message.trim();
            
        } catch (error) {
            this.errorHandler.handleError(error, 'ShareContentGenerator.generateCustomMessage');
            return this.getFallbackMessage(messageType, platform);
        }
    }
    
    /**
     * 現在の言語を取得
     */
    private getCurrentLanguage(): string {
        try {
            if (this.localizationManager && typeof this.localizationManager.getCurrentLanguage === 'function') {
                return this.localizationManager.getCurrentLanguage();
            }
            return navigator.language || 'ja';
        } catch (error) {
            return 'ja';
        }
    }
    
    /**
     * プラットフォーム名の正規化
     */
    private normalizePlatform(platform: string): string {
        const normalized = platform.toLowerCase();
        
        const platformMap: { [key: string]: string } = {
            'twitter': 'twitter',
            'x': 'twitter',
            'facebook': 'facebook',
            'fb': 'facebook',
            'meta': 'facebook',
            'instagram': 'instagram',
            'ig': 'instagram',
            'line': 'line',
            'discord': 'discord',
            'reddit': 'reddit',
            'linkedin': 'linkedin',
            'pinterest': 'pinterest',
            'tumblr': 'tumblr',
            'copy': 'generic',
            'clipboard': 'generic'
        };
        
        return platformMap[normalized] || 'generic';
    }
    
    /**
     * テンプレートの取得
     */
    private getTemplate(messageType: string, platform: string, language: string): string | null {
        try {
            const messageTemplates = this.templates[messageType];
            if (!messageTemplates) return null;
            
            const platformTemplates = messageTemplates[platform];
            if (!platformTemplates) {
                // プラットフォームが見つからない場合はgenericを試行
                const genericTemplates = messageTemplates['generic'];
                if (!genericTemplates) return null;
                return genericTemplates[language] || genericTemplates['ja'] || genericTemplates['en'] || null;
            }
            
            // 言語別テンプレートの取得（フォールバック付き）
            return platformTemplates[language] || 
                   platformTemplates['ja'] || 
                   platformTemplates['en'] || 
                   null;
                   
        } catch (error) {
            this.errorHandler.handleError(error, 'ShareContentGenerator.getTemplate');
            return null;
        }
    }
    
    /**
     * テンプレートの補間
     */
    private interpolateTemplate(template: string, variables: { [key: string]: any }): string {
        let result = template;
        
        Object.entries(variables).forEach(([key, value]) => {
            const regex = new RegExp(`\\{${key}\\}`, 'g');
            result = result.replace(regex, String(value || ''));
        });
        
        // 空の置換を削除（連続する空白など）
        result = result.replace(/\s+/g, ' ');
        result = result.replace(/\{\w+\}/g, ''); // 未置換の変数を削除
        
        return result;
    }
    
    /**
     * 数値フォーマット
     */
    private formatNumber(num: number): string {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return num.toLocaleString();
    }
    
    /**
     * プレイ時間のフォーマット
     */
    private formatPlayTime(milliseconds: number): string {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}時間${minutes % 60}分`;
        } else if (minutes > 0) {
            return `${minutes}分${seconds % 60}秒`;
        } else {
            return `${seconds}秒`;
        }
    }
    
    /**
     * ゲームURLの生成
     */
    private generateGameUrl(): string {
        const baseUrl = 'https://bubblepop.game';
        const params = new URLSearchParams({
            source: 'share',
            lang: this.getCurrentLanguage()
        });
        
        return `${baseUrl}?${params.toString()}`;
    }
    
    /**
     * プラットフォーム固有のフォーマット適用
     */
    private applyPlatformSpecificFormatting(message: string, platform: string): string {
        const platformKey = this.normalizePlatform(platform);
        
        switch (platformKey) {
            case 'twitter':
                // Twitter固有の処理（ハッシュタグ最適化など）
                message = this.optimizeHashtags(message);
                break;
                
            case 'facebook':
                // Facebook固有の処理
                message = this.optimizeForFacebook(message);
                break;
                
            case 'instagram':
                // Instagram固有の処理
                message = this.optimizeForInstagram(message);
                break;
                
            default:
                // 汎用処理
                break;
        }
        
        return message;
    }
    
    /**
     * ハッシュタグの最適化
     */
    private optimizeHashtags(message: string): string {
        // ハッシュタグの重複を除去
        const hashtags = message.match(/#\w+/g) || [];
        const uniqueHashtags = [...new Set(hashtags)];
        
        if (hashtags.length !== uniqueHashtags.length) {
            // 重複を除去して再構築
            let cleanMessage = message;
            hashtags.forEach(hashtag => {
                cleanMessage = cleanMessage.replace(hashtag, '');
            });
            cleanMessage = `${cleanMessage.trim()} ${uniqueHashtags.join(' ')}`;
            return cleanMessage;
        }
        
        return message;
    }
    
    /**
     * Facebook用最適化
     */
    private optimizeForFacebook(message: string): string {
        // Facebookではハッシュタグが少ない方が良い
        return message.replace(/#\w+/g, '').replace(/\s+/g, ' ').trim();
    }
    
    /**
     * Instagram用最適化
     */
    private optimizeForInstagram(message: string): string {
        // Instagramではハッシュタグを文末にまとめる
        const hashtags = message.match(/#\w+/g) || [];
        const messageWithoutHashtags = message.replace(/#\w+/g, '').replace(/\s+/g, ' ').trim();
        
        if (hashtags.length > 0) {
            return `${messageWithoutHashtags}\n\n${hashtags.join(' ')}`;
        }
        
        return messageWithoutHashtags;
    }
    
    /**
     * 文字数制限の適用
     */
    private applyCharacterLimits(message: string, platform: string): string {
        const limits: { [key: string]: number } = {
            'twitter': 280,
            'facebook': 2000,
            'instagram': 2200,
            'line': 1000,
            'generic': 500
        };
        
        const platformKey = this.normalizePlatform(platform);
        const limit = limits[platformKey] || limits['generic'];
        
        if (message.length <= limit) {
            return message;
        }
        
        // 文字数制限を超える場合は省略
        const ellipsis = '...';
        const maxLength = limit - ellipsis.length;
        
        // 単語境界で切り捨て
        let truncated = message.substring(0, maxLength);
        const lastSpaceIndex = truncated.lastIndexOf(' ');
        
        if (lastSpaceIndex > maxLength * 0.8) {
            truncated = truncated.substring(0, lastSpaceIndex);
        }
        
        return `${truncated}${ellipsis}`;
    }
    
    /**
     * フォールバックメッセージの取得
     */
    private getFallbackMessage(messageType: string, platform: string): string {
        const fallbacks: { [key: string]: string } = {
            'score': 'BubblePopで新しいスコアを達成しました！',
            'achievement': 'BubblePopで新しい実績を解除しました！',
            'challenge': 'BubblePopでチャレンジをクリアしました！'
        };
        
        return fallbacks[messageType] || 'BubblePopをプレイ中です！';
    }
    
    /**
     * 利用可能なプラットフォーム一覧の取得
     */
    public getSupportedPlatforms(): string[] {
        return ['twitter', 'facebook', 'instagram', 'line', 'discord', 'reddit', 'generic'];
    }
    
    /**
     * 利用可能なメッセージタイプ一覧の取得
     */
    public getSupportedMessageTypes(): string[] {
        return Object.keys(this.templates);
    }
    
    /**
     * プラットフォーム別文字数制限の取得
     */
    public getCharacterLimits(): { [platform: string]: number } {
        return {
            'twitter': 280,
            'facebook': 2000,
            'instagram': 2200,
            'line': 1000,
            'discord': 2000,
            'reddit': 10000,
            'generic': 500
        };
    }
    
    /**
     * テンプレートの追加
     */
    public addTemplate(messageType: string, platform: string, language: string, template: string): void {
        try {
            if (!this.templates[messageType]) {
                this.templates[messageType] = {};
            }
            
            if (!this.templates[messageType][platform]) {
                this.templates[messageType][platform] = {};
            }
            
            this.templates[messageType][platform][language] = template;
            this.log(`テンプレート追加: ${messageType}/${platform}/${language}`);
            
        } catch (error) {
            this.errorHandler.handleError(error, 'ShareContentGenerator.addTemplate');
        }
    }
    
    /**
     * テンプレートの削除
     */
    public removeTemplate(messageType: string, platform?: string, language?: string): void {
        try {
            if (!platform) {
                delete this.templates[messageType];
                this.log(`テンプレート削除: ${messageType} (全体)`);
                return;
            }
            
            if (!language) {
                if (this.templates[messageType]) {
                    delete this.templates[messageType][platform];
                    this.log(`テンプレート削除: ${messageType}/${platform} (全言語)`);
                }
                return;
            }
            
            if (this.templates[messageType] && this.templates[messageType][platform]) {
                delete this.templates[messageType][platform][language];
                this.log(`テンプレート削除: ${messageType}/${platform}/${language}`);
            }
            
        } catch (error) {
            this.errorHandler.handleError(error, 'ShareContentGenerator.removeTemplate');
        }
    }
    
    /**
     * テンプレート一覧の取得
     */
    public getTemplateList(): any {
        return JSON.parse(JSON.stringify(this.templates));
    }
    
    /**
     * ログ出力
     */
    private log(message: string): void {
        if (console && console.log) {
            console.log(`[ShareContentGenerator] ${message}`);
        }
    }
    
    /**
     * 統計情報の取得
     */
    public getStatistics(): any {
        const stats = {
            messageTypes: Object.keys(this.templates).length,
            totalTemplates: 0,
            platformsPerType: {} as { [key: string]: number },
            languagesPerType: {} as { [key: string]: number }
        };
        
        Object.entries(this.templates).forEach(([messageType, platforms]) => {
            stats.platformsPerType[messageType] = Object.keys(platforms).length;
            stats.languagesPerType[messageType] = 0;
            
            Object.values(platforms).forEach(languages => {
                const languageCount = Object.keys(languages).length;
                stats.totalTemplates += languageCount;
                stats.languagesPerType[messageType] += languageCount;
            });
        });
        
        return stats;
    }
    
    /**
     * クリーンアップ
     */
    public dispose(): void {
        this.templates = {
            score: {},
            achievement: {},
            challenge: {}
        };
        this.log('ShareContentGenerator disposed');
    }
}