/**
 * 共有コンテンツ生成システム
 * メッセージテンプレート管理、多言語対応、プラットフォーム別最適化を行う
 */

import { ErrorHandler  } from '../utils/ErrorHandler.js';

export class ShareContentGenerator {
    constructor(localizationManager, socialI18nManager = null) {
        this.localizationManager = localizationManager;
        this.socialI18nManager = socialI18nManager;
        ';
        // メッセージテンプレート
        this.templates = this.initializeTemplates();
    }

        this.log('ShareContentGenerator初期化完了'; }'
    }
    
    /**
     * メッセージテンプレートの初期化'
     */''
    initializeTemplates() { return { score: { };

                twitter: {' }'

                    ja: "BubblePopで{score}点を達成！ あなたも挑戦してみませんか？ #BubblePop #ゲーム {url}",""
                    en: "I scored {score} points in BubblePop! Can you beat it? #BubblePop #Game {url}"; : undefined"", 'zh-CN': "我在BubblePop中获得了{score}分！你能超越吗？ #BubblePop #游戏 {url}","", 'zh-TW': "我在BubblePop中獲得了{score}分！你能超越嗎？ #BubblePop #遊戲 {url}",""
                    ko: "BubblePop에서 {score}점을 달성했습니다! 도전해보시겠어요? #BubblePop #게임 {url}"
                }, : undefined"
                facebook: { " }"
                    ja: "BubblePopで{score}点を達成しました！",""
                    en: "I scored {score} points in BubblePop!";"", 'zh-CN': "我在BubblePop中获得了{score}分！","", 'zh-TW': "我在BubblePop中獲得了{score}分！",""
                    ko: "BubblePop에서 {score}점을 달성했습니다!"
                },"
                generic: { " }"
                    ja: "BubblePopで{score}点を達成！",""
                    en: "Scored {score} points in BubblePop!";"", 'zh-CN': "BubblePop获得{score}分！","", 'zh-TW': "BubblePop獲得{score}分！",""
                    ko: "BubblePop {score}점 달성!"
                }
            },"
            achievement: { twitter: {" }"
                    ja: "BubblePopで実績「{name}」を解除！ {description} #BubblePop #実績 {url}",""
                    en: "Unlocked achievement '{name}' in BubblePop! {description} #BubblePop #Achievement {url}";"", 'zh-CN': "在BubblePop中解锁成就「{name}」！{description} #BubblePop #成就 {url}","", 'zh-TW': "在BubblePop中解鎖成就「{name}」！{description} #BubblePop #成就 {url}",""
                    ko: "BubblePop에서 업적 '{name}' 달성! {description} #BubblePop #업적 {url}"
                },"
                facebook: { ""
                    ja: "BubblePopで新しい実績を解除しました！",
                    en: "Unlocked a new achievement in BubblePop!",
                    'zh-CN': "在BubblePop中解锁了新成就！",
                    'zh-TW': "在BubblePop中解鎖了新成就！",
                    ko: "BubblePop에서 새로운 업적을 달성했습니다!" ,},"
                generic: { " }"
                    ja: "実績「{name}」を解除しました！",""
                    en: "Achievement '{name}' unlocked!";"", 'zh-CN': "解锁成就「{name}」！","", 'zh-TW': "解鎖成就「{name}」！",""
                    ko: "업적 '{name}' 달성!"
                }
            },"
            challenge: { twitter: {" }"
                    ja: "BubblePopのチャレンジ「{name}」をクリア！ {description} #BubblePop #チャレンジ {url}",""
                    en: "Completed challenge '{name}' in BubblePop! {description} #BubblePop #Challenge {url}";"", 'zh-CN': "完成BubblePop挑战「{name}」！{description} #BubblePop #挑战 {url}","", 'zh-TW': "完成BubblePop挑戰「{name}」！{description} #BubblePop #挑戰 {url}",""
                    ko: "BubblePop 챌린지 '{name}' 클리어! {description} #BubblePop #챌린지 {url}"
                },"
                facebook: { ""
                    ja: "BubblePopのチャレンジをクリアしました！",
                    en: "Completed a challenge in BubblePop!",
                    'zh-CN': "完成了BubblePop的挑战！",
                    'zh-TW': "完成了BubblePop的挑戰！",
                    ko: "BubblePop 챌린지를 완료했습니다!" ,},"
                generic: { " }"
                    ja: "チャレンジ「{name}」をクリア！",""
                    en: "Challenge '{name}' completed!";"", 'zh-CN': "完成挑战「{name}」！","", 'zh-TW': "完成挑戰「{name}」！",""
                    ko: "챌린지 '{name}' 완료!"
                }
}
    
    /**
     * スコア共有メッセージの生成"
     */""
    generateScoreMessage(scoreData, platform = 'generic', options = { ' {'
        try {'
            const startTime = performance.now()';
            if (!scoreData || typeof, scoreData.score !== 'number'') {'
    }

                throw new Error('不正なスコアデータ'; }'
            }
            
            // 言語とプラットフォームの決定
            const language = this.getCurrentLanguage();''
            const platformKey = this.normalizePlatform(platform);
            ';
            // テンプレートの取得
            const template = this.getTemplate('score', platformKey, language);
            if(!template) {
                
            }
                throw new Error(`テンプレートが見つかりません: score/${platformKey}/${language}`});
            }
            
            // データの準備
            const messageData = { ''
                score: this.formatScore(scoreData.score),
                stage: scoreData.stage || '',
                combo: scoreData.combo || '',
                accuracy: scoreData.accuracy ? Math.round(scoreData.accuracy * 100) + '%' : '',
    url: options.url || this.getGameUrl( ,};
            
            // メッセージの生成
            let message = this.interpolateTemplate(template, messageData);
            
            // プラットフォーム固有の最適化
            message = this.optimizeForPlatform(message, platformKey, options);
            
            // 統計の更新
            this.stats.generated++;
            
            const result = { text: message,
                message, // 後方互換性のため;
                platform: platformKey;
                language,
                url: messageData.url,
    metadata: {
                    originalScore: scoreData.score;
                    generationTime: performance.now() - startTime,
    truncated: message.length < template.length ,}
            };
            this.log(`スコアメッセージ生成完了`, result.metadata);
            return result;

        } catch (error) { this.stats.errors++;' }'

            this.handleError('SCORE_MESSAGE_GENERATION_FAILED', error, { scoreData, platform, options }';
            ';
            // フォールバック: シンプルなメッセージ
            return this.generateFallbackMessage('score', scoreData, platform';
    
    /**
     * 実績共有メッセージの生成'
     */''
    generateAchievementMessage(achievementData, platform = 'generic', options = { ) {
        try {
            const startTime = performance.now();
            ';
            // 入力データの検証
            if(!achievementData || !achievementData.name) {'
    }

                throw new Error('不正な実績データ'; }'
            }
            
            // 言語とプラットフォームの決定
            const language = this.getCurrentLanguage();''
            const platformKey = this.normalizePlatform(platform);
            ';
            // テンプレートの取得
            const template = this.getTemplate('achievement', platformKey, language);

            if (!template) { ' }'

                throw new Error(`テンプレートが見つかりません: achievement/${platformKey}/${language}`'}';
            }
            
            // データの準備
            const messageData = { name: achievementData.name,''
                description: achievementData.description || '';
                rarity: this.getAchievementRarity(achievementData),
    url: options.url || this.getGameUrl( ,};
            ';
            // メッセージの生成
            let message = this.interpolateTemplate(template, messageData);
            ';
            // レア実績の特別処理
            if(achievementData.rarity && achievementData.rarity === 'legendary) { message = this.addLegendaryEmojis(message, language); }'
            
            // プラットフォーム固有の最適化
            message = this.optimizeForPlatform(message, platformKey, options);
            
            // 統計の更新
            this.stats.generated++;
            
            const result = { text: message,
                message, // 後方互換性のため;
                platform: platformKey;
                language,
                url: messageData.url,
    metadata: {
                    achievementId: achievementData.id,
                    generationTime: performance.now(''',
    isRare: achievementData.rarity === 'legendary' ,}))
            );
            this.log(`実績メッセージ生成完了`, result.metadata);
            return result;

        } catch (error) { this.stats.errors++;' }'

            this.handleError('ACHIEVEMENT_MESSAGE_GENERATION_FAILED', error, { achievementData, platform, options }';
            ';
            // フォールバック: シンプルなメッセージ
            return this.generateFallbackMessage('achievement', achievementData, platform';
    
    /**
     * チャレンジ共有メッセージの生成'
     */''
    generateChallengeMessage(challengeData, platform = 'generic', options = { ) {
        try {
            const startTime = performance.now();
            ';
            // 入力データの検証
            if(!challengeData || !challengeData.name) {'
    }

                throw new Error('不正なチャレンジデータ'; }'
            }
            
            // 言語とプラットフォームの決定
            const language = this.getCurrentLanguage();''
            const platformKey = this.normalizePlatform(platform);
            ';
            // テンプレートの取得
            const template = this.getTemplate('challenge', platformKey, language);

            if (!template) { ' }'

                throw new Error(`テンプレートが見つかりません: challenge/${platformKey}/${language}`'}';
            }
            
            // データの準備
            const messageData = { name: challengeData.name,''
                description: challengeData.description || '',
                type: challengeData.type || 'daily',
    url: options.url || this.getGameUrl( ,};
            
            // メッセージの生成
            let message = this.interpolateTemplate(template, messageData);
            
            // プラットフォーム固有の最適化
            message = this.optimizeForPlatform(message, platformKey, options);
            
            // 統計の更新
            this.stats.generated++;
            
            const result = { message,
                platform: platformKey;
                language,
                metadata: {
                    challengeId: challengeData.id;
                    challengeType: challengeData.type,
    generationTime: performance.now() - startTime ,}
            };
            this.log(`チャレンジメッセージ生成完了`, result.metadata);
            return result;

        } catch (error) { this.stats.errors++;' }'

            this.handleError('CHALLENGE_MESSAGE_GENERATION_FAILED', error, { challengeData, platform, options }';
            ';
            // フォールバック: シンプルなメッセージ
            return this.generateFallbackMessage('challenge', challengeData, platform';
    
    /**
     * カスタムメッセージの生成'
     */''
    generateCustomMessage(type, data, customTemplate, platform = 'generic', options = { )' {
        try {
            // カスタムテンプレートの検証
            if(!customTemplate || typeof, customTemplate !== 'string'') {', ';

            }

                throw new Error('不正なカスタムテンプレート'; }'
            }
            ';
            // セキュリティチェック
            if(!this.validateTemplate(customTemplate)) { ''
                throw new Error('安全でないテンプレート'; }'
            
            const language = this.getCurrentLanguage();
            const platformKey = this.normalizePlatform(platform);
            
            // データの準備
            const messageData = { ...data,
                url: options.url || this.getGameUrl( ,};
            
            // メッセージの生成
            let message = this.interpolateTemplate(customTemplate, messageData);
            
            // プラットフォーム固有の最適化
            message = this.optimizeForPlatform(message, platformKey, options);
            
            // 統計の更新
            this.stats.generated++;
            
            return { message,
                platform: platformKey;
                language,
                metadata: {
                    isCustom: true, };
                    type }
} catch (error) { this.stats.errors++;' }'

            this.handleError('CUSTOM_MESSAGE_GENERATION_FAILED', error, { type, data, customTemplate, platform, options });
            
            // フォールバック: 標準メッセージ
            return this.generateFallbackMessage(type, data, platform);
    
    /**
     * テンプレートの補間
     */
    interpolateTemplate(template, data) {
        let result = template;
        
        // 基本的な変数置換
        Object.keys(data).forEach(key => { )
    }
            const value = data[key]);' }'

            if(value !== undefined && value !== null) {' }'

                const regex = new RegExp(`\\{${key}\\}`, 'g);
                result = result.replace(regex, String(value);
            }
        });
        ';
        // 未置換の変数を削除
        result = result.replace(/\{[^}]+\)/g, ''');
        ';
        // 余分な空白を削除
        result = result.replace(/\s+/g, ', ').trim();
        
        return result;
    }
    
    /**
     * プラットフォーム固有の最適化
     */
    optimizeForPlatform(message, platform, options = { ) {'
        const limits = this.platformLimits[platform] || this.platformLimits.generic;

        switch(platform) {''
            case 'twitter':'';
                return this.optimizeForTwitter(message, limits, options);''
            case 'facebook':;
                return this.optimizeForFacebook(message, limits, options);
            default:;
    ,}
                return this.optimizeGeneric(message, limits, options);
    
    /**
     * Twitter向け最適化
     */
    optimizeForTwitter(message, limits, options) {
        // URL短縮を考慮した文字数制限
        const urlCount = (message.match(/https?:\/\/[^\s]+/g) || []).length;
        const adjustedLimit = limits.maxLength - (urlCount * limits.urlLength);

        if(message.length > adjustedLimit) {'
            // 段階的な短縮戦略
            message = this.truncateMessage(message, adjustedLimit, '...);
            this.stats.truncated++; }
        }
        
        // ハッシュタグ数の制限
        const hashtags = message.match(/#\w+/g) || [];
        if(hashtags.length > limits.hashtagLimit) {
            const excessHashtags = hashtags.slice(limits.hashtagLimit);

        }

            excessHashtags.forEach(tag => { ');' }

                message = message.replace(tag, '');' }

            }');''
            message = message.replace(/\s+/g, ', ').trim();
        }
        
        return message;
    }
    
    /**
     * Facebook向け最適化
     */'
    optimizeForFacebook(message, limits, options) {'

        if(message.length > limits.maxLength) {''
            message = this.truncateMessage(message, limits.maxLength, '...);
            this.stats.truncated++; }
        }
        
        return message;
    }
    
    /**
     * 汎用最適化
     */
    optimizeGeneric(message, limits, options) {'

        if(message.length > limits.maxLength) {''
            message = this.truncateMessage(message, limits.maxLength, '...'');
            this.stats.truncated++; }
        }
        
        return message;
    }
    
    /**
     * メッセージの短縮'
     */''
    truncateMessage(message, maxLength, suffix = '...' {'
        if (message.length <= maxLength) {
    }
            return message;
        
        const truncateLength = maxLength - suffix.length;
        ';
        // 単語境界で切断を試行
        const words = message.slice(0, truncateLength).split(', ');

        if(words.length > 1) {'

            words.pop()';
            const truncated = words.join(', ');
            if (truncated.length > 0) {
        }
                return truncated + suffix;
        
        // 単語境界での切断が不可能な場合は文字単位で切断
        return message.slice(0, truncateLength) + suffix;
    }
    
    /**
     * テンプレートの取得'
     */''
    getTemplate(type, platform, language) {'
        return this.templates[type]?.[platform]?.[language] || '';
               this.templates[type]?.[platform]?.['ja] || '';
               this.templates[type]?.['generic]?.[language] ||';
    }

               this.templates[type]?.['generic]?.['ja']; }
    }
    
    /**
     * 現在の言語の取得
     */
    getCurrentLanguage() { '
        if (this.localizationManager && this.localizationManager.getCurrentLanguage) {''
            return this.localizationManager.getCurrentLanguage()';
        const browserLang = navigator.language || navigator.userLanguage || 'ja';' }

        return browserLang.split('-'[0]; // 言語コードのみ抽出 }'
    }
    
    /**
     * プラットフォーム名の正規化
     */
    normalizePlatform(platform) {
        const normalizedPlatform = platform.toLowerCase();
        // エイリアスの処理
        switch(normalizedPlatform) {''
            case 'x':'';
            case 'twitter-x':'';
                return 'twitter';
            case 'fb':'';
                return 'facebook';
            case 'web-share':'';
            case 'webshare':'';
                return 'generic';
            default:';
                // 有効なプラットフォームのリスト
                const validPlatforms = ['twitter', 'facebook', 'generic'];

    }

                return validPlatforms.includes(normalizedPlatform) ? normalizedPlatform: 'generic';
    
    /**
     * スコアのフォーマット
     */
    formatScore(score) {
        // 数値を3桁区切りでフォーマット
    }
        return score.toLocaleString();
    
    /**
     * 実績のレア度取得
     */''
    getAchievementRarity(achievementData) {'
        const rarities = {'', 'ja': ['コモン', 'レア', 'エピック', 'レジェンダリー],
            'en': ['Common', 'Rare', 'Epic', 'Legendary'],
            'zh-CN': ['普通', '稀有', '史诗', '传说],
            'zh-TW': ['普通', '稀有', '史詩', '傳說],
    }

            'ko': ['일반', '레어', '에픽', '레전더리] }
        };

        const language = this.getCurrentLanguage('''
        const, rarityIndex = achievementData.rarity === 'legendary' ? 3 : '';
                           achievementData.rarity === 'epic' ? 2 :'';
                           achievementData.rarity === 'rare' ? 1 : 0;

        return, rarities[language]?.[rarityIndex] || rarities['ja][rarityIndex];
    }
    
    /**
     * レジェンダリー実績の絵文字追加''
     */')'
    addLegendaryEmojis(message, language) {'

        const emojis = ['✨', '🎉', '👑', '🏆', '⭐];
    }
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]; }
        return `${randomEmoji} ${message} ${randomEmoji}`;
    }
    
    /**
     * ゲームURLの取得
     */
    getGameUrl() { return window.location.origin + window.location.pathname; }
    
    /**
     * テンプレートの安全性検証
     */
    validateTemplate(template) {
        // XSSやスクリプト注入の基本的なチェック
        const dangerousPatterns = [/<script/i, : undefined
            /javascript:/i,
            /on\w+\s*=/i,
            /<iframe/i,
            /<object/i];
            /<embed/i];
        ];
        
    }
        return !dangerousPatterns.some(pattern => pattern.test(template);
    
    /**
     * フォールバックメッセージの生成
     */
    generateFallbackMessage(type, data, platform) {
        ';

    }

        const language = this.getCurrentLanguage('' }

                'zh-CN': `得分：${data.score || 0}分`,'', 'zh-TW': `得分：${data.score || 0}分`,
                ko: `점수: ${data.score || 0}점`
            };
            achievement: { ' }'

                ja: `実績解除: ${data.name || '新しい実績'}`,''
                en: `Achievement, unlocked: ${data.name || 'New, achievement'}`;'', 'zh-CN': `成就解锁：${data.name || '新成就'}`,'', 'zh-TW': `成就解鎖：${data.name || '新成就'}`,''
                ko: `업적 달성: ${data.name || '새 업적'}`
            };
            challenge: { ' }'

                ja: `チャレンジクリア: ${data.name || '新しいチャレンジ'}`,''
                en: `Challenge, completed: ${data.name || 'New, challenge'}`;'', 'zh-CN': `挑战完成：${data.name || '新挑战'}`,'', 'zh-TW': `挑戰完成：${data.name || '新挑戰'}`,''
                ko: `챌린지 완료: ${data.name || '새 챌린지'}`
            })''
        const message = fallbackMessages[type]?.[language] || '';
                       fallbackMessages[type]?.['ja] || '';
                       'BubblePop - 新しい記録を達成しました！';
        ';

        return { message, : undefined')'
            platform: this.normalizePlatform(platform);
            language,
            metadata: {'
                isFallback: true,' };

                fallbackReason: 'Template generation failed' 
    }
    
    /**
     * 統計情報の取得
     */
    getStats() {
        return { ...this.stats,
            successRate: this.stats.generated > 0 ? undefined : undefined
                ((this.stats.generated - this.stats.errors) / this.stats.generated) * 100 : 0;
    ,}
            truncationRate: this.stats.generated > 0 ? undefined : undefined };
                (this.stats.truncated / this.stats.generated) * 100 : 0 
    },
    }
    
    /**
     * 統計のリセット'
     */''
    resetStats()';
        this.log('統計情報をリセットしました);
    }
    
    /**
     * エラーハンドリング
     */
    handleError(type, error, context = { ) {
        const errorInfo = {
            type,
            error: error.message || error;
            context,
    }
            timestamp: Date.now(); 
    };
        ';
        // ErrorHandlerユーティリティの使用
        if(ErrorHandler) {', ';

        }

            ErrorHandler.handleError(error, 'ShareContentGenerator', context'; }
        }
        ';
        // ローカルログの記録
        this.log('エラー発生', errorInfo, 'error'');
    }
    
    /**
     * ログ記録'
     */''
    log(message, data = null, level = 'info' {'
        const logEntry = {''
            timestamp: Date.now('''
        const, consoleMethod = level === 'error' ? 'error' : ';

    }''
                            level === 'warn' ? 'warn' : 'log';) }
        console[consoleMethod](`[ShareContentGenerator] ${message}`, data);
    }
    ';

    /**''
     * SocialI18nManagerを使用したメッセージ生成 (Task, 24')'
     */''
    generateI18nMessage(messageKey, data, platform = 'generic', options = { ) {
        try {
            if (!this.socialI18nManager) {
                // フォールバック: 既存のテンプレートシステムを使用
    }
                return this.generateLegacyMessage(messageKey, data, platform, options);
            
            const startTime = performance.now();
            const language = options.language || this.getCurrentLanguage();
            const platformKey = this.normalizePlatform(platform);
            // SocialI18nManagerからメッセージを取得
            let message = this.socialI18nManager.getMessage(messageKey, language, data);
            ';
            // プラットフォーム固有の最適化
            if(platformKey !== 'generic) { message = this.optimizeForPlatform(message, platformKey, options); }'
            
            // 統計の更新
            this.stats.generated++;
            
            const result = { message,
                platform: platformKey;
                language,
                metadata: {
                    messageKey;
                    i18nGenerated: true,
    generationTime: performance.now() - startTime ,}
            };
            this.log(`I18nメッセージ生成完了: ${messageKey}`, result.metadata});
            return result;

        } catch (error) { this.stats.errors++;' }'

            this.handleError('I18N_MESSAGE_GENERATION_FAILED', error, { messageKey, data, platform, options });
            
            // フォールバック
            return this.generateLegacyMessage(messageKey, data, platform, options);
    
    /**
     * 地域別プラットフォーム最適化メッセージ生成 (Task, 24)
     */
    generateRegionalMessage(messageKey, data, options = { ) {
        try {'
            if(!this.socialI18nManager) {'
    }

                return this.generateI18nMessage(messageKey, data, 'generic', options);
            
            const language = options.language || this.getCurrentLanguage();
            ';
            // 地域別プラットフォーム設定を取得
            const regionalPlatforms = this.socialI18nManager.getRegionalPlatforms(language);''
            const preferredPlatform = options.platform || regionalPlatforms[0] || 'generic';
            
            // 地域別ソーシャルホストを適用
            const socialHost = this.socialI18nManager.getSocialHost(preferredPlatform, language);
            
            // メッセージ生成
            const result = this.generateI18nMessage(messageKey, data, preferredPlatform, { ...options)
                language,);
                socialHost);
            
            // 地域固有の後処理
            if(this.socialI18nManager.isRTL(language) {
                result.message = this.applyRTLFormatting(result.message);
            }
                result.metadata.rtl = true; }
            }
            
            // 地域別メタデータを追加
            result.metadata.regional = { availablePlatforms: regionalPlatforms,
                preferredPlatform,
                socialHost,
                isRTL: this.socialI18nManager.isRTL(language ,}
            
            this.log(`地域別メッセージ生成完了: ${language}`, result.metadata.regional});
            return result;

        } catch (error) { }

            this.handleError('REGIONAL_MESSAGE_GENERATION_FAILED', error, { messageKey, data, options }';''
            return this.generateI18nMessage(messageKey, data, 'generic', options);
    
    /**
     * RTLフォーマットの適用 (Task, 24)
     */
    applyRTLFormatting(message) {
        // RTL言語に対応したフォーマット調整
        // 絵文字やハッシュタグの位置調整
        return message'';
            .replace(/^([🎮🏆🎖️✅🏅])\s+/, '$1 ') // 絵文字の間隔調整;
    }

            .replace(/\s+(#\w+)/g, ' $1'); // ハッシュタグの間隔調整 }
    }
    
    /**
     * 既存テンプレートシステムでのメッセージ生成 (フォールバック)
     */''
    generateLegacyMessage(messageKey, data, platform, options) {
        try {
            // 既存のgenerateメソッドマッピング
            const methodMap = {''
                shareScore: 'generateScoreMessage',
                highScore: 'generateScoreMessage',
                achievement: 'generateAchievementMessage',
                challengeComplete: 'generateChallengeMessage';
    ,}

                leaderboard: 'generateScoreMessage' 
    };
            ';

            const methodName = methodMap[messageKey];''
            if(methodName && typeof, this[methodName] === 'function) { return this[methodName](data, platform, options); }'
            
            // 基本フォールバック
            return this.generateFallbackMessage(messageKey, data, platform);

        } catch (error) { }

            this.handleError('LEGACY_MESSAGE_GENERATION_FAILED', error, { messageKey, data, platform, options });
            return this.generateFallbackMessage(messageKey, data, platform);
    
    /**
     * SocialI18nManagerの設定 (Task, 24)'
     */''
    setSocialI18nManager(socialI18nManager) {'
        this.socialI18nManager = socialI18nManager;

    }

        this.log('SocialI18nManager設定完了'; }'
    }
    
    /**
     * 多言語対応統計の取得 (Task, 24)
     */
    getI18nStats() {
        const baseStats = this.getStats();
        
        if (this.socialI18nManager) {
            const i18nStats = this.socialI18nManager.getStats();
            return { ...baseStats,
                i18n: i18nStats;
    ,}
                multiLanguageSupport: true, };
                supportedLanguages: this.socialI18nManager.getSupportedLanguages().length 
    }
        
        return { ...baseStats,
            multiLanguageSupport: false, };
            supportedLanguages: 0 
    }
    
    /**
     * URL短縮機能
     */
    shortenUrl(url, maxLength = 30) {
        if (url.length <= maxLength) {
    }
            return url;
        
        try { const urlObj = new URL(url);
            const domain = urlObj.hostname;
            const path = urlObj.pathname;
            
            // ドメインだけで最大長を超える場合
            if(domain.length >= maxLength - 3) {
                ';

            }

                return domain.substring(0, maxLength - 3) + '...';
            }
            ';
            // パス部分を調整
            const availableLength = maxLength - domain.length - 3; // '...'の分
            if(path.length > availableLength) {', ';

            }

                return domain + path.substring(0, availableLength) + '...';
            }
            ';

            return domain + path;''
        } catch (error) {
            this.log('URL短縮エラー:', error';''
            return url.substring(0, maxLength - 3) + '...';
    }
    
    /**
     * UTMパラメータの追加
     */
    addUTMParameters(baseUrl, utmParams = {}) {'
        try {'
            const url = new URL(baseUrl);
            
            // デフォルトUTMパラメータ
            const defaultParams = {''
                utm_source: 'social',
                utm_medium: 'share';
    ,}

                utm_campaign: 'bubblepop' 
    };
            // パラメータをマージ
            const params = { ...defaultParams, ...utmParams;
            
            // URLにパラメータを追加
            Object.entries(params).forEach(([key, value]) => {  if (value) { }
                    url.searchParams.set(key, value); }
});
            ';

            return url.toString();''
        } catch (error) {
            this.log('UTMパラメータ追加エラー:', error);
            return baseUrl;
    
    /**
     * 統計レポートの取得
     */
    getStatsReport() {
        const total = this.stats.generated + this.stats.errors;
        const successRate = total > 0 ? (this.stats.generated / total) * 100 : 0;
        
        return { generated: this.stats.generated,
            errors: this.stats.errors,
    truncated: this.stats.truncated;
            total,
    }
            successRate: parseFloat(successRate.toFixed(2), };
            errorRate: parseFloat(((this.stats.errors / total) * 100 || 0).toFixed(2); 
    }
    
    /**
     * 設定更新
     */
    updateConfig(newConfig) {
        // 設定検証
        if (newConfig.platformLimits) {
            // プラットフォーム制限の検証
            for(const [platform, limits] of Object.entries(newConfig.platformLimits)) {'
    }

                if(limits.maxLength && (typeof, limits.maxLength !== 'number' || limits.maxLength <= 0) { }
                    throw new Error(`無効なmaxLength設定: ${platform}`});
                }
            }
            Object.assign(this.platformLimits, newConfig.platformLimits);
        }
        
        if(newConfig.templates) {
        ';
            // テンプレートの検証
            for(const, template of, Object.values(newConfig.templates)) {''
                if (typeof, template !== 'object'') {'
        
        }

                    throw new Error('無効なテンプレート設定'; }'
}''
            Object.assign(this.templates, newConfig.templates);
        }

        this.log('設定を更新しました);
    }
    
    /**
     * デバッグ情報の取得
     */
    getDebugInfo() {
        return { templates: Object.keys(this.templates),
            platforms: Object.keys(this.platformLimits);
    ,}

            currentLanguage: this.getCurrentLanguage(),' };

            stats: this.getI18nStats() }')