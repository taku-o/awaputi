/**
 * SocialPlatformAdapters.ts
 * ソーシャルプラットフォーム対応機能
 * SocialSharingManagerから分離されたプラットフォーム固有処理
 */

// 型定義
interface PlatformConfig {
    [platform: string]: {
        maxTextLength?: number;
        hashtagLimit?: number;
        urlLength?: number;
        imageSupported?: boolean;
        hashtagSupported?: boolean;
        urlRequired?: boolean;
        supported?: boolean;
        filesSupported?: boolean;
        [key: string]: any;
    };
}

interface ShareData {
    title?: string;
    text?: string;
    url?: string;
    hashtags?: string[];
    files?: File[];
    image?: string;
    description?: string;
    [key: string]: any;
}

interface ShareResult {
    success: boolean;
    platform?: string;
    reason?: string;
    error?: string;
    url?: string;
}

interface ShareOptions {
    useDialog?: boolean;
    redirect_uri?: string;
    display?: string;
    width?: number;
    height?: number;
    [key: string]: any;
}

interface TwitterShareOptions extends ShareOptions {
    via?: string;
    related?: string[];
    in_reply_to?: string;
}

interface FacebookShareOptions extends ShareOptions {
    app_id?: string;
    quote?: string;
}

interface LineShareOptions extends ShareOptions {
    type?: 'text' | 'image';
}

type PlatformType = 'twitter' | 'facebook' | 'line' | 'android' | 'ios' | 'web' | 'unknown';

export class SocialPlatformAdapters {
    private platformConfig: PlatformConfig;

    constructor() {
        // プラットフォーム設定
        this.platformConfig = {
            twitter: {
                maxTextLength: 280,
                hashtagLimit: 3,
                urlLength: 23, // Twitter t.co短縮URL長
                imageSupported: true,
                hashtagSupported: true
            },
            facebook: {
                maxTextLength: 63206,
                hashtagSupported: false,
                urlRequired: true,
                imageSupported: true
            },
            line: {
                maxTextLength: 1000,
                imageSupported: true,
                hashtagSupported: false
            },
            webShare: {
                supported: this.isWebShareSupported(),
                filesSupported: this.isFileSharingSupported()
            }
        };
    }

    /**
     * プラットフォーム検出
     * @returns 現在のプラットフォーム
     */
    detectPlatform(): PlatformType {
        const userAgent = navigator.userAgent.toLowerCase();
        
        if (userAgent.includes('twitter')) {
            return 'twitter';
        } else if (userAgent.includes('facebook') || userAgent.includes('fb')) {
            return 'facebook';
        } else if (userAgent.includes('line')) {
            return 'line';
        } else if (userAgent.includes('android')) {
            return 'android';
        } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
            return 'ios';
        } else {
            return 'web';
        }
    }

    /**
     * Web Share API対応状況の検出
     * @returns 対応状況
     */
    isWebShareSupported(): boolean {
        return 'share' in navigator;
    }

    /**
     * ファイル共有対応状況の検出
     * @returns 対応状況
     */
    isFileSharingSupported(): boolean {
        return !!(navigator.canShare && navigator.canShare({ files: [] }));
    }

    /**
     * TwitterシェアURL生成
     * @param shareData - 共有データ
     * @param options - オプション
     * @returns TwitterシェアURL
     */
    generateTwitterShareUrl(shareData: ShareData, options: TwitterShareOptions = {}): string {
        const config = this.platformConfig.twitter;
        let text = shareData.text || '';
        let hashtags = shareData.hashtags || [];

        // テキスト長制限への対応
        const hashtagText = hashtags.slice(0, config.hashtagLimit).join(' ');
        const urlLength = shareData.url ? config.urlLength! : 0;
        const availableLength = config.maxTextLength! - urlLength - hashtagText.length - 5; // 余裕分

        if (text.length > availableLength) {
            text = this.truncateForTwitter(text, availableLength);
        }

        const params = new URLSearchParams();
        if (text) params.append('text', text);
        if (shareData.url) params.append('url', shareData.url);
        if (hashtags.length > 0) {
            params.append('hashtags', hashtags.slice(0, config.hashtagLimit).join(','));
        }
        if (options.via) params.append('via', options.via);
        if (options.related && options.related.length > 0) {
            params.append('related', options.related.join(','));
        }
        if (options.in_reply_to) params.append('in_reply_to', options.in_reply_to);

        return `https://twitter.com/intent/tweet?${params.toString()}`;
    }

    /**
     * TwitterでのWeb Share API使用共有
     * @param shareData - 共有データ
     * @returns Promise<ShareResult>
     */
    async shareViaTwitterWebAPI(shareData: ShareData): Promise<ShareResult> {
        if (!this.isWebShareSupported()) {
            throw new Error('Web Share API not supported');
        }

        const data: any = {
            title: shareData.title,
            text: this.generateOptimizedMessage(shareData, 'twitter'),
            url: shareData.url
        };

        if (shareData.files && this.platformConfig.webShare.filesSupported) {
            data.files = shareData.files;
        }

        try {
            await navigator.share(data);
            return { success: true, platform: 'twitter-web' };
        } catch (error: any) {
            if (error.name === 'AbortError') {
                return { success: false, reason: 'user_cancelled' };
            }
            throw error;
        }
    }

    /**
     * FacebookシェアURL生成
     * @param shareData - 共有データ
     * @param options - オプション
     * @returns FacebookシェアURL
     */
    generateFacebookShareUrl(shareData: ShareData, options: FacebookShareOptions = {}): string {
        const {
            useDialog = true,
            redirect_uri = window.location.href,
            display = 'popup',
            app_id,
            quote
        } = options;

        const params = new URLSearchParams();

        if (shareData.url) {
            params.append('u', shareData.url);
        }

        if (useDialog) {
            params.append('redirect_uri', redirect_uri);
            params.append('display', display);
            if (app_id) params.append('app_id', app_id);
        }

        if (quote) {
            params.append('quote', quote);
        }

        const baseUrl = useDialog ?
            'https://www.facebook.com/dialog/share' :
            'https://www.facebook.com/sharer/sharer.php';

        return `${baseUrl}?${params.toString()}`;
    }

    /**
     * FacebookでのWeb Share API使用共有
     * @param shareData - 共有データ
     * @returns Promise<ShareResult>
     */
    async shareViaFacebookWebAPI(shareData: ShareData): Promise<ShareResult> {
        if (!this.isWebShareSupported()) {
            throw new Error('Web Share API not supported');
        }

        const data: any = {
            title: shareData.title,
            text: this.generateOptimizedMessage(shareData, 'facebook'),
            url: shareData.url
        };

        try {
            await navigator.share(data);
            return { success: true, platform: 'facebook-web' };
        } catch (error: any) {
            if (error.name === 'AbortError') {
                return { success: false, reason: 'user_cancelled' };
            }
            throw error;
        }
    }

    /**
     * LINEシェアURL生成
     * @param shareData - 共有データ
     * @param options - オプション
     * @returns LINEシェアURL
     */
    generateLineShareUrl(shareData: ShareData, options: LineShareOptions = {}): string {
        const config = this.platformConfig.line;
        const { type = 'text' } = options;

        let text = shareData.text || '';
        if (shareData.url) {
            text += (text ? '\n' : '') + shareData.url;
        }

        // テキスト長制限
        if (text.length > config.maxTextLength!) {
            text = text.substring(0, config.maxTextLength! - 3) + '...';
        }

        const params = new URLSearchParams();
        params.append('text', text);

        return `https://social-plugins.line.me/lineit/share?${params.toString()}`;
    }

    /**
     * 汎用的なWeb Share API使用
     * @param shareData - 共有データ
     * @returns Promise<ShareResult>
     */
    async shareViaWebAPI(shareData: ShareData): Promise<ShareResult> {
        if (!this.isWebShareSupported()) {
            return {
                success: false,
                reason: 'not_supported',
                error: 'Web Share API is not supported on this device'
            };
        }

        const data: any = {
            title: shareData.title,
            text: shareData.text,
            url: shareData.url
        };

        // ファイル共有対応チェック
        if (shareData.files && this.isFileSharingSupported()) {
            data.files = shareData.files;
        }

        try {
            await navigator.share(data);
            return { success: true, platform: 'web-share' };
        } catch (error: any) {
            if (error.name === 'AbortError') {
                return { success: false, reason: 'user_cancelled' };
            }
            return {
                success: false,
                reason: 'share_failed',
                error: error.message
            };
        }
    }

    /**
     * プラットフォーム最適化されたメッセージ生成
     * @param shareData - 共有データ
     * @param platform - プラットフォーム
     * @returns 最適化されたメッセージ
     */
    generateOptimizedMessage(shareData: ShareData, platform: PlatformType): string {
        const config = this.platformConfig[platform];
        if (!config || !config.maxTextLength) {
            return shareData.text || '';
        }

        let message = shareData.text || '';
        const maxLength = config.maxTextLength;

        // URL考慮（Twitterの場合）
        if (platform === 'twitter' && shareData.url) {
            maxLength! -= config.urlLength || 23;
        }

        // ハッシュタグ考慮
        if (shareData.hashtags && config.hashtagSupported) {
            const hashtags = shareData.hashtags.slice(0, config.hashtagLimit || 3);
            const hashtagText = hashtags.map(tag => `#${tag}`).join(' ');
            maxLength! -= hashtagText.length + 1; // スペース分
        }

        // テキスト切り詰め
        if (message.length > maxLength!) {
            message = this.truncateText(message, maxLength!);
        }

        // ハッシュタグ追加
        if (shareData.hashtags && config.hashtagSupported) {
            const hashtags = shareData.hashtags.slice(0, config.hashtagLimit || 3);
            if (hashtags.length > 0) {
                message += ' ' + hashtags.map(tag => `#${tag}`).join(' ');
            }
        }

        return message;
    }

    /**
     * Twitterでのテキスト切り詰め
     * @param text - テキスト
     * @param maxLength - 最大長
     * @returns 切り詰められたテキスト
     */
    private truncateForTwitter(text: string, maxLength: number): string {
        if (text.length <= maxLength) {
            return text;
        }

        // 単語境界で切り詰め
        let truncated = text.substring(0, maxLength - 3);
        const lastSpace = truncated.lastIndexOf(' ');
        
        if (lastSpace > 0 && lastSpace > maxLength * 0.8) {
            truncated = truncated.substring(0, lastSpace);
        }

        return truncated + '...';
    }

    /**
     * 汎用的なテキスト切り詰め
     * @param text - テキスト
     * @param maxLength - 最大長
     * @returns 切り詰められたテキスト
     */
    private truncateText(text: string, maxLength: number): string {
        if (text.length <= maxLength) {
            return text;
        }

        return text.substring(0, maxLength - 3) + '...';
    }

    /**
     * プラットフォーム別シェア処理
     * @param platform - プラットフォーム
     * @param shareData - 共有データ
     * @param options - オプション
     * @returns Promise<ShareResult>
     */
    async shareForPlatform(platform: PlatformType, shareData: ShareData, options: ShareOptions = {}): Promise<ShareResult> {
        try {
            switch (platform) {
                case 'twitter':
                    if (this.isWebShareSupported() && options.useWebAPI) {
                        return await this.shareViaTwitterWebAPI(shareData);
                    } else {
                        const url = this.generateTwitterShareUrl(shareData, options as TwitterShareOptions);
                        return await this.openShareWindow(url, 'twitter', options);
                    }

                case 'facebook':
                    if (this.isWebShareSupported() && options.useWebAPI) {
                        return await this.shareViaFacebookWebAPI(shareData);
                    } else {
                        const url = this.generateFacebookShareUrl(shareData, options as FacebookShareOptions);
                        return await this.openShareWindow(url, 'facebook', options);
                    }

                case 'line':
                    const lineUrl = this.generateLineShareUrl(shareData, options as LineShareOptions);
                    return await this.openShareWindow(lineUrl, 'line', options);

                case 'web':
                default:
                    return await this.shareViaWebAPI(shareData);
            }
        } catch (error: any) {
            return {
                success: false,
                platform,
                reason: 'error',
                error: error.message
            };
        }
    }

    /**
     * シェアウィンドウを開く
     * @param url - シェアURL
     * @param platform - プラットフォーム
     * @param options - オプション
     * @returns Promise<ShareResult>
     */
    private async openShareWindow(url: string, platform: string, options: ShareOptions = {}): Promise<ShareResult> {
        const {
            width = 600,
            height = 400,
            display = 'popup'
        } = options;

        if (display === 'popup') {
            const left = (screen.width - width) / 2;
            const top = (screen.height - height) / 2;
            const windowFeatures = `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`;

            const shareWindow = window.open(url, `share_${platform}`, windowFeatures);
            
            if (!shareWindow) {
                return {
                    success: false,
                    platform,
                    reason: 'popup_blocked',
                    error: 'Popup blocked or failed to open'
                };
            }

            // ポップアップが閉じられるまで待機
            return new Promise((resolve) => {
                const checkClosed = setInterval(() => {
                    if (shareWindow.closed) {
                        clearInterval(checkClosed);
                        resolve({
                            success: true,
                            platform,
                            url
                        });
                    }
                }, 1000);

                // 60秒でタイムアウト
                setTimeout(() => {
                    clearInterval(checkClosed);
                    if (!shareWindow.closed) {
                        shareWindow.close();
                    }
                    resolve({
                        success: true,
                        platform,
                        url
                    });
                }, 60000);
            });
        } else {
            // 新しいタブで開く
            window.open(url, '_blank');
            return {
                success: true,
                platform,
                url
            };
        }
    }

    /**
     * プラットフォーム対応状況チェック
     * @param platform - プラットフォーム
     * @param feature - 機能
     * @returns 対応状況
     */
    isPlatformFeatureSupported(platform: PlatformType, feature: string): boolean {
        const config = this.platformConfig[platform];
        if (!config) return false;

        switch (feature) {
            case 'hashtags':
                return config.hashtagSupported === true;
            case 'images':
                return config.imageSupported === true;
            case 'files':
                return config.filesSupported === true;
            default:
                return config[feature] === true;
        }
    }

    /**
     * プラットフォーム設定の取得
     * @param platform - プラットフォーム
     * @returns プラットフォーム設定
     */
    getPlatformConfig(platform: PlatformType): any {
        return { ...this.platformConfig[platform] } || {};
    }

    /**
     * サポート対象プラットフォーム一覧の取得
     * @returns サポート対象プラットフォーム
     */
    getSupportedPlatforms(): PlatformType[] {
        return ['twitter', 'facebook', 'line', 'web'];
    }

    /**
     * プラットフォーム設定の更新
     * @param platform - プラットフォーム
     * @param config - 新しい設定
     */
    updatePlatformConfig(platform: PlatformType, config: any): void {
        if (!this.platformConfig[platform]) {
            this.platformConfig[platform] = {};
        }
        Object.assign(this.platformConfig[platform], config);
    }

    /**
     * デバッグ情報の取得
     * @returns デバッグ情報
     */
    getDebugInfo(): any {
        return {
            platform: this.detectPlatform(),
            webShareSupported: this.isWebShareSupported(),
            fileSharingSupported: this.isFileSharingSupported(),
            userAgent: navigator.userAgent,
            platformConfig: this.platformConfig
        };
    }
}