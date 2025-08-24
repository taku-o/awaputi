/**
 * モバイルブラウザ向けWeb Share API対応ハンドラー
 * Issue #37 Task 22.2: モバイルブラウザでのWeb Share API対応
 */

export interface BrowserInfo {
    platform: string;
    browser: string;
    version: string;
    engine: string;
    mobile: boolean;
    standalone: boolean;
}

export interface ShareCapabilities {
    canShareText: boolean;
    canShareUrl: boolean;
    canShareFiles: boolean;
    maxFileSize: number;
    supportedMimeTypes: string[];
}

export interface PlatformConfig {
    supportedFromVersion: { [browser: string]: number };
    shareOptions: {
        title: boolean;
        text: boolean;
        url: boolean;
        files: boolean;
    };
}

export interface ShareData {
    title?: string;
    text?: string;
    url?: string;
    files?: File[];
}

export class MobileWebShareHandler {
    private isSupported: boolean;
    private browserInfo: BrowserInfo | null;
    private shareCapabilities: ShareCapabilities | null;
    private fallbackHandlers: Map<string, Function>;
    private platformConfigs: { [platform: string]: PlatformConfig };

    constructor() {
        this.isSupported = false;
        this.browserInfo = null;
        this.shareCapabilities = null;
        this.fallbackHandlers = new Map();
        
        // プラットフォーム固有の設定
        this.platformConfigs = {
            ios: {
                supportedFromVersion: {
                    safari: 14.0,
                    chrome: 89.0,
                    firefox: 93.0
                },
                shareOptions: {
                    title: true,
                    text: true,
                    url: true,
                    files: true // iOS 15+
                }
            },
            android: {
                supportedFromVersion: {
                    chrome: 75.0,
                    samsung: 12.0,
                    firefox: 79.0
                },
                shareOptions: {
                    title: true,
                    text: true,
                    url: true,
                    files: true // Android 10+
                }
            }
        };
    }

    /**
     * 初期化
     */
    async initialize(): Promise<void> {
        try {
            // ブラウザ情報を検出
            this.browserInfo = this.detectBrowserInfo();
            
            // Web Share API サポート状況を確認
            this.isSupported = await this.checkWebShareSupport();
            
            // 共有機能を分析
            this.shareCapabilities = await this.analyzeShareCapabilities();
            
            // フォールバック機能を設定
            this.setupFallbackHandlers();
            
            console.log('MobileWebShareHandler initialized:', {
                supported: this.isSupported,
                browser: this.browserInfo,
                capabilities: this.shareCapabilities
            });
        } catch (error) {
            console.error('Failed to initialize MobileWebShareHandler:', error);
        }
    }

    /**
     * ブラウザ情報の検出
     */
    detectBrowserInfo(): BrowserInfo {
        const userAgent = navigator.userAgent;
        
        const info: BrowserInfo = {
            platform: 'unknown',
            browser: 'unknown',
            version: '0.0',
            engine: 'unknown',
            mobile: false,
            standalone: false
        };

        // プラットフォーム検出
        if (/iPhone|iPad|iPod/i.test(userAgent)) {
            info.platform = 'ios';
            info.mobile = /iPhone|iPod/i.test(userAgent);
        } else if (/Android/i.test(userAgent)) {
            info.platform = 'android';
            info.mobile = true;
        }

        // ブラウザ検出
        if (/Chrome/i.test(userAgent) && !/Edge/i.test(userAgent)) {
            info.browser = 'chrome';
            const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
            info.version = match ? match[1] : '0.0';
        } else if (/Firefox/i.test(userAgent)) {
            info.browser = 'firefox';
            const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
            info.version = match ? match[1] : '0.0';
        } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
            info.browser = 'safari';
            const match = userAgent.match(/Version\/(\d+\.\d+)/);
            info.version = match ? match[1] : '0.0';
        } else if (/SamsungBrowser/i.test(userAgent)) {
            info.browser = 'samsung';
            const match = userAgent.match(/SamsungBrowser\/(\d+\.\d+)/);
            info.version = match ? match[1] : '0.0';
        }

        // スタンドアロンモード検出（PWA）
        info.standalone = (window.navigator as any).standalone === true || 
                         window.matchMedia('(display-mode: standalone)').matches;

        // エンジン検出
        if (/WebKit/i.test(userAgent)) {
            info.engine = 'webkit';
        } else if (/Gecko/i.test(userAgent)) {
            info.engine = 'gecko';
        } else if (/Blink/i.test(userAgent)) {
            info.engine = 'blink';
        }

        return info;
    }

    /**
     * Web Share API サポート確認
     */
    async checkWebShareSupport(): Promise<boolean> {
        // 基本的なAPI存在確認
        if (!('share' in navigator) || typeof navigator.share !== 'function') {
            return false;
        }

        if (!this.browserInfo) {
            return false;
        }

        // プラットフォーム固有の要件確認
        const platformConfig = this.platformConfigs[this.browserInfo.platform];
        if (!platformConfig) {
            return false;
        }

        const minVersion = platformConfig.supportedFromVersion[this.browserInfo.browser];
        if (!minVersion) {
            return false;
        }

        const currentVersion = parseFloat(this.browserInfo.version);
        if (currentVersion < minVersion) {
            return false;
        }

        // 実際の共有テスト（簡単なデータで）
        try {
            if ('canShare' in navigator && typeof (navigator as any).canShare === 'function') {
                return (navigator as any).canShare({ title: 'Test' });
            }
            return true;
        } catch (error) {
            console.warn('Web Share API test failed:', error);
            return false;
        }
    }

    /**
     * 共有機能の分析
     */
    async analyzeShareCapabilities(): Promise<ShareCapabilities> {
        const capabilities: ShareCapabilities = {
            canShareText: false,
            canShareUrl: false,
            canShareFiles: false,
            maxFileSize: 0,
            supportedMimeTypes: []
        };

        if (!this.isSupported || !('canShare' in navigator)) {
            return capabilities;
        }

        const canShare = (navigator as any).canShare;

        // テキスト共有テスト
        try {
            capabilities.canShareText = canShare({ text: 'test' });
        } catch (error) {
            capabilities.canShareText = false;
        }

        // URL共有テスト
        try {
            capabilities.canShareUrl = canShare({ url: 'https://example.com' });
        } catch (error) {
            capabilities.canShareUrl = false;
        }

        // ファイル共有テスト
        try {
            const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
            capabilities.canShareFiles = canShare({ files: [testFile] });
            
            if (capabilities.canShareFiles) {
                // サポートされているMIMEタイプを確認
                const mimeTypes = ['text/plain', 'image/png', 'image/jpeg', 'image/gif', 'application/pdf'];
                for (const mimeType of mimeTypes) {
                    try {
                        const testFile = new File(['test'], `test.${this.getFileExtension(mimeType)}`, { type: mimeType });
                        if (canShare({ files: [testFile] })) {
                            capabilities.supportedMimeTypes.push(mimeType);
                        }
                    } catch (error) {
                        // このMIMEタイプはサポートされていない
                    }
                }
                
                // 最大ファイルサイズの推定
                capabilities.maxFileSize = this.estimateMaxFileSize();
            }
        } catch (error) {
            capabilities.canShareFiles = false;
        }

        return capabilities;
    }

    /**
     * フォールバックハンドラーの設定
     */
    setupFallbackHandlers(): void {
        // クリップボード共有
        this.fallbackHandlers.set('clipboard', async (data: ShareData) => {
            if (!navigator.clipboard || !navigator.clipboard.writeText) {
                throw new Error('Clipboard API not supported');
            }
            
            const textToShare = this.generateShareText(data);
            await navigator.clipboard.writeText(textToShare);
            return { success: true, method: 'clipboard' };
        });

        // メール共有
        this.fallbackHandlers.set('email', (data: ShareData) => {
            const subject = encodeURIComponent(data.title || 'Shared from BubblePop');
            const body = encodeURIComponent(this.generateShareText(data));
            const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
            
            window.location.href = mailtoUrl;
            return { success: true, method: 'email' };
        });

        // SMS共有（モバイルのみ）
        if (this.browserInfo?.mobile) {
            this.fallbackHandlers.set('sms', (data: ShareData) => {
                const textToShare = encodeURIComponent(this.generateShareText(data));
                const smsUrl = `sms:?body=${textToShare}`;
                
                window.location.href = smsUrl;
                return { success: true, method: 'sms' };
            });
        }

        // ソーシャルメディア直接共有
        this.setupSocialMediaHandlers();
    }

    /**
     * ソーシャルメディアハンドラーの設定
     */
    setupSocialMediaHandlers(): void {
        // Twitter共有
        this.fallbackHandlers.set('twitter', (data: ShareData) => {
            const text = encodeURIComponent(data.text || data.title || '');
            const url = encodeURIComponent(data.url || window.location.href);
            const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
            
            this.openShareWindow(twitterUrl, 'twitter');
            return { success: true, method: 'twitter' };
        });

        // Facebook共有
        this.fallbackHandlers.set('facebook', (data: ShareData) => {
            const url = encodeURIComponent(data.url || window.location.href);
            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            
            this.openShareWindow(facebookUrl, 'facebook');
            return { success: true, method: 'facebook' };
        });

        // LINE共有
        this.fallbackHandlers.set('line', (data: ShareData) => {
            const text = encodeURIComponent(this.generateShareText(data));
            const lineUrl = `https://line.me/R/msg/text/?${text}`;
            
            this.openShareWindow(lineUrl, 'line');
            return { success: true, method: 'line' };
        });
    }

    /**
     * 共有の実行
     */
    async share(data: ShareData): Promise<{ success: boolean; method: string; error?: any }> {
        try {
            // Web Share API を優先して試行
            if (this.isSupported && this.canShareData(data)) {
                await navigator.share(data);
                return { success: true, method: 'webshare' };
            }

            // フォールバック手段を試行
            return await this.tryFallbackShare(data);
        } catch (error) {
            console.error('Share failed:', error);
            return { success: false, method: 'none', error };
        }
    }

    /**
     * データが共有可能かチェック
     */
    canShareData(data: ShareData): boolean {
        if (!this.shareCapabilities) {
            return false;
        }

        if (data.text && !this.shareCapabilities.canShareText) {
            return false;
        }

        if (data.url && !this.shareCapabilities.canShareUrl) {
            return false;
        }

        if (data.files && data.files.length > 0) {
            if (!this.shareCapabilities.canShareFiles) {
                return false;
            }

            // ファイルサイズとMIMEタイプをチェック
            for (const file of data.files) {
                if (file.size > this.shareCapabilities.maxFileSize) {
                    return false;
                }

                if (!this.shareCapabilities.supportedMimeTypes.includes(file.type)) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * フォールバック共有の試行
     */
    async tryFallbackShare(data: ShareData): Promise<{ success: boolean; method: string; error?: any }> {
        // ファイル共有の場合は特別処理
        if (data.files && data.files.length > 0) {
            return await this.handleFileShare(data);
        }

        // 利用可能な手段を優先順位で試行
        const fallbackMethods = this.getFallbackMethods();
        
        for (const method of fallbackMethods) {
            const handler = this.fallbackHandlers.get(method);
            if (handler) {
                try {
                    const result = await handler(data);
                    if (result.success) {
                        return result;
                    }
                } catch (error) {
                    console.warn(`Fallback method ${method} failed:`, error);
                }
            }
        }

        throw new Error('No available share methods');
    }

    /**
     * ファイル共有の処理
     */
    async handleFileShare(data: ShareData): Promise<{ success: boolean; method: string; error?: any }> {
        // 画像ファイルの場合はBase64変換してクリップボードに
        if (data.files && data.files.length === 1 && data.files[0].type.startsWith('image/')) {
            try {
                const file = data.files[0];
                const dataUrl = await this.fileToDataUrl(file);
                
                if (navigator.clipboard && (navigator.clipboard as any).write) {
                    const clipboardItem = new ClipboardItem({
                        [file.type]: file
                    });
                    await (navigator.clipboard as any).write([clipboardItem]);
                    return { success: true, method: 'clipboard-image' };
                }
            } catch (error) {
                console.warn('Image clipboard share failed:', error);
            }
        }

        // ファイルのダウンロードリンクを生成
        if (data.files && data.files.length > 0) {
            for (const file of data.files) {
                const url = URL.createObjectURL(file);
                const a = document.createElement('a');
                a.href = url;
                a.download = file.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
            return { success: true, method: 'download' };
        }

        throw new Error('File share not supported');
    }

    /**
     * 利用可能なフォールバック手段を取得
     */
    getFallbackMethods(): string[] {
        const methods: string[] = [];

        // クリップボード
        if (navigator.clipboard && navigator.clipboard.writeText) {
            methods.push('clipboard');
        }

        // モバイルの場合
        if (this.browserInfo?.mobile) {
            methods.push('sms', 'line');
        }

        // ソーシャルメディア
        methods.push('twitter', 'facebook');

        // メール（最後の手段）
        methods.push('email');

        return methods;
    }

    /**
     * 共有ウィンドウを開く
     */
    openShareWindow(url: string, name: string): void {
        const width = 600;
        const height = 400;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        
        const features = `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`;
        window.open(url, `share_${name}`, features);
    }

    /**
     * 共有テキストを生成
     */
    generateShareText(data: ShareData): string {
        let text = '';
        
        if (data.title) {
            text += data.title;
        }
        
        if (data.text) {
            if (text) text += '\n\n';
            text += data.text;
        }
        
        if (data.url) {
            if (text) text += '\n\n';
            text += data.url;
        }
        
        return text;
    }

    /**
     * ファイルをData URLに変換
     */
    async fileToDataUrl(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * ファイル拡張子を取得
     */
    getFileExtension(mimeType: string): string {
        const extensions: { [key: string]: string } = {
            'text/plain': 'txt',
            'image/png': 'png',
            'image/jpeg': 'jpg',
            'image/gif': 'gif',
            'application/pdf': 'pdf'
        };
        
        return extensions[mimeType] || 'bin';
    }

    /**
     * 最大ファイルサイズを推定
     */
    estimateMaxFileSize(): number {
        // プラットフォーム別の推定値
        if (this.browserInfo?.platform === 'ios') {
            return 10 * 1024 * 1024; // 10MB
        } else if (this.browserInfo?.platform === 'android') {
            return 5 * 1024 * 1024; // 5MB
        } else {
            return 1 * 1024 * 1024; // 1MB
        }
    }

    /**
     * サポート状況を取得
     */
    getSupport(): { supported: boolean; capabilities: ShareCapabilities | null; browser: BrowserInfo | null } {
        return {
            supported: this.isSupported,
            capabilities: this.shareCapabilities,
            browser: this.browserInfo
        };
    }

    /**
     * 診断情報を取得
     */
    getDiagnostics(): any {
        return {
            isSupported: this.isSupported,
            browserInfo: this.browserInfo,
            shareCapabilities: this.shareCapabilities,
            availableFallbacks: Array.from(this.fallbackHandlers.keys()),
            webShareApiExists: 'share' in navigator,
            canShareApiExists: 'canShare' in navigator,
            clipboardApiExists: 'clipboard' in navigator && 'writeText' in (navigator as any).clipboard,
            userAgent: navigator.userAgent
        };
    }

    /**
     * クリーンアップ
     */
    cleanup(): void {
        this.fallbackHandlers.clear();
        this.isSupported = false;
        this.browserInfo = null;
        this.shareCapabilities = null;
    }
}