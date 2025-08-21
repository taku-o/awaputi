/**
 * SocialPlatformAdapters.js
 * ソーシャルプラットフォーム対応機能
 * SocialSharingManagerから分離されたプラットフォーム固有処理
 */

export class SocialPlatformAdapters {
    constructor() {
        // プラットフォーム設定
        this.platformConfig = {
            twitter: {
                maxTextLength: 280;
                hashtagLimit: 3;
    urlLength: 23, // Twitter t.co短縮URL長
    }
                imageSupported: true;
            facebook: { maxTextLength: 63206;
                hashtagSupported: false;
                urlRequired: true;
    imageSupported: true;
            webShare: { supported: this.isWebShareSupported(
    filesSupported: navigator.canShare && navigator.canShare({ files: [] 
    }

    /**
     * プラットフォーム検出
     * @returns {string} 現在のプラットフォーム
     */
    detectPlatform() {
        const userAgent = navigator.userAgent.toLowerCase();
        if(userAgent.includes('twitter)' { }

            return 'twitter'; }

        } else if (userAgent.includes('facebook') || userAgent.includes('fb)' { ''
            return 'facebook',' }'

        } else if(userAgent.includes('line)' { ''
            return 'line',' }'

        } else if(userAgent.includes('android)' { ''
            return 'android',' }'

        } else if (userAgent.includes('iphone') || userAgent.includes('ipad)' { ''
            return 'ios', else { }

            return 'web';

    /**
     * Web Share API対応状況の検出
     * @returns {boolean} 対応状況'
     */''
    isWebShareSupported('';
        return 'share' in, navigator;
    }

    /**
     * TwitterシェアURL生成
     * @param {Object} shareData - 共有データ
     * @returns {string} TwitterシェアURL'
     */''
    generateTwitterShareUrl(shareData) {
        const config = this.platformConfig.twitter,
        let text = shareData.text || ','
        let hashtags = shareData.hashtags || [],
        ','
        // テキスト長制限への対応
        const hashtagText = hashtags.slice(0, config.hashtagLimit).join(', ');
        const urlLength = shareData.url ? config.urlLength: 0;
        const availableLength = config.maxTextLength - urlLength - hashtagText.length - 5, // 余裕分
        
        if (text.length > availableLength) {
    }
            text = this.truncateForTwitter(text, availableLength); }
        }
';'

        const params = new URLSearchParams();
        if(text) params.append('text', text';'
        if(shareData.url) params.append('url', shareData.url';'
        if (hashtags.length > 0) {', ' }

            params.append('hashtags', hashtags.slice(0, config.hashtagLimit).join('); }'
        }

        return `https: //twitter.com/intent/tweet? ${params.toString(}`,
    }

    /**
     * TwitterでのWeb Share API使用共有
     * @param {Object} shareData - 共有データ
     * @returns {Promise<void>}
     */
    async shareViaTwitterWebAPI(shareData) { ''
        if(!this.isWebShareSupported()) {''
            throw new Error('Web, Share API, not supported') }

        const data = { : undefined'
            title: shareData.title,
            text: this.generateOptimizedMessage(shareData, 'twitter),'
            url: shareData.url  },
        if (shareData.files && this.platformConfig.webShare.filesSupported) { data.files = shareData.files }
';'

        try {'
            await navigator.share(data),' }'

            return { success: true, platform: 'twitter-web'
            }'} catch (error) {'
            if (error.name === 'AbortError') { }

                return { success: false, reason: 'user_cancelled'
            }
            throw error;

    /**
     * FacebookシェアURL生成
     * @param {Object} shareData - 共有データ
     * @param {Object} options - オプション
     * @returns {string} FacebookシェアURL'
     */''
    generateFacebookShareUrl(shareData, options = { )) {
        const { useDialog = true,
            redirect_uri = window.location.href,
            display = 'popup' } = options;

        const params = new URLSearchParams();

        if (shareData.url) {', ' }

            params.append('u', shareData.url); }
        }

        if (useDialog) {

            params.append('redirect_uri', redirect_uri' }'

            params.append('display', display'; }'
        }
';'

        const baseUrl = useDialog ? undefined : undefined';'
            'https://www.facebook.com/dialog/share' : ';'
            'https: //www.facebook.com/sharer/sharer.php,'

        return `${baseUrl}? ${params.toString(}`;
    }

    /**
     * FacebookでのWeb Share API使用共有
     * @param {Object} shareData - 共有データ
     * @returns {Promise<void>}
     */'
    async shareViaFacebookWebAPI(shareData) { ''
        if(!this.isWebShareSupported()) {''
            throw new Error('Web, Share API, not supported' }'

        // Facebook向けに最適化
        const data = { : undefined
            title: shareData.title,
            text: shareData.description || shareData.text,
    url: shareData.url  },
';'

        try {'
            await navigator.share(data),' }'

            return { success: true, platform: 'facebook-web'
            }'} catch (error) {'
            if (error.name === 'AbortError') { }

                return { success: false, reason: 'user_cancelled'
            }
            throw error;

    /**
     * Twitter用ハッシュタグの生成
     * @param {Object} shareData - 共有データ
     * @returns {Array} ハッシュタグ配列'
     */''
    generateTwitterHashtags(shareData) {
        const hashtags = [],
        const config = this.platformConfig.twitter,
        ','
        // ゲーム固有のハッシュタグ
        hashtags.push('BubblePop),'
        
        // スコア関連
        if (shareData.score) {''
            if (shareData.score >= 100000) {
    }

                hashtags.push('HighScore'; }'

            }''
            if (shareData.isPersonalBest) {', ' }

                hashtags.push('PersonalBest'; }'
}
        ';'
        // 実績関連
        if (shareData.achievement) {

            hashtags.push('Achievement',
            if (shareData.achievement.isRare) {
        }

                hashtags.push('RareAchievement'; }'
}
        
        return hashtags.slice(0, config.hashtagLimit);
    }

    /**
     * Twitter向けテキスト短縮
     * @param {string} text - 元のテキスト
     * @param {number} maxLength - 最大長
     * @returns {string} 短縮されたテキスト
     */
    truncateForTwitter(text, maxLength) {
        if (text.length <= maxLength) {
    }
            return text;
        ';'
        // 単語境界で切り詰め
        const truncated = text.substring(0, maxLength - 3);
        const lastSpace = truncated.lastIndexOf(', ');
        
        if (lastSpace > maxLength * 0.7) {
        ','

            ' }'

            return truncated.substring(0, lastSpace) + '...';

        } else { }'

            return truncated + '...';

    /**
     * プラットフォーム固有の最適化されたメッセージ生成
     * @param {Object} shareData - 共有データ
     * @param {string} platform - プラットフォーム
     * @returns {string} 最適化されたメッセージ
     */
    generateOptimizedMessage(shareData, platform) {
        const config = this.platformConfig[platform],
        if(!config) return shareData.text || ','

        let message = shareData.text || ','

        switch(platform) {''
            case 'twitter':,
                // Twitter向け最適化
                const hashtags = this.generateTwitterHashtags(shareData);
                const hashtagText = hashtags.map(tag => `#${tag)`}.join(', '};
                const, availableLength = config.maxTextLength - hashtagText.length - 10; // URL分
                
    }

                if (message.length > availableLength) { }'

                    message = this.truncateForTwitter(message, availableLength'}';
                }
                
                return `${message} ${hashtagText}`;

            case 'facebook':
                // Facebook向け最適化（ハッシュタグなし）
                return message;
                
            default: return message,

    /**
     * Web Share APIを使用した共有
     * @param {Object} shareData - 共有データ
     * @returns {Promise<Object>} 共有結果
     */
    async shareViaWebAPI(shareData) { ''
        if(!this.isWebShareSupported()) {''
            throw new Error('Web, Share API, not supported' }'

        const data = { title: shareData.title,
            text: shareData.text,
    url: shareData.url  },
        // ファイル共有対応
        if (shareData.files && this.platformConfig.webShare.filesSupported) { data.files = shareData.files }
';'

        try {'
            await navigator.share(data);
            return { success: true, ''
                platform: 'web-share'
            };
                timestamp: Date.now(); 
    };'} catch (error) {'
            if (error.name === 'AbortError') {
                return { success: false,

                    reason: 'user_cancelled',' };'

                    platform: 'web-share' 
    }
            throw error;
        }
    }

    /**
     * プラットフォーム機能確認
     * @param {string} platform - プラットフォーム
     * @returns {Object} 機能対応状況
     */
    getPlatformCapabilities(platform) {
        const config = this.platformConfig[platform] }
        if (!config) { }
            return { supported: false,

        return { supported: true,
            ...config };
            currentPlatform: this.detectPlatform();
    }

    /**
     * 全プラットフォームの対応状況取得
     * @returns {Object} 全プラットフォーム対応状況'
     */''
    getAllPlatformCapabilities()';'
            twitter: this.getPlatformCapabilities('twitter',
            facebook: this.getPlatformCapabilities('facebook',
            webShare: this.getPlatformCapabilities('webShare,'
    currentPlatform: this.detectPlatform();
        }

    /**
     * URLの検証とサニタイゼーション
     * @param {string} url - URL
     * @returns {string} サニタイズされたURL
     */
    sanitizeUrl(url) {

        if(!url) return ','
        ','

        try {'
            const urlObj = new URL(url);
            // HTTP/HTTPSのみ許可
            if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
    }

                return ';'

            return urlObj.toString();} catch (error) {
            return ','

    /**
     * 共有データの検証
     * @param {Object} shareData - 共有データ
     * @returns {Object} 検証結果
     */
    validateShareData(shareData) {
        const errors = [],
        const warnings = [],

        if (!shareData) {
    }

            errors.push('共有データが指定されていません'; }'
            return { valid: false, errors, warnings }
';'
        // 必須フィールドの確認
        if (!shareData.text && !shareData.title) {', ' }

            errors.push('テキストまたはタイトルが必要です'; }'
        }
';'
        // URL検証
        if(shareData.url && !this.sanitizeUrl(shareData.url)) { ''
            errors.push('無効なURLです' }'

        // プラットフォーム固有の検証
        if (shareData.platform) {
            const config = this.platformConfig[shareData.platform] }
            if (!config) { }
                warnings.push(`未対応のプラットフォーム: ${shareData.platform}`};
            } else {  // テキスト長チェック }
                if (shareData.text && shareData.text.length > config.maxTextLength) { }'

                    warnings.push(`テキストが長すぎます (${shareData.text.length}/${config.maxTextLength}`}';'
                }
}

        return { valid: errors.length === 0,
            errors };
            warnings }
        }'}'