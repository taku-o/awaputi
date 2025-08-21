/**
 * モバイルブラウザ向けWeb Share API対応ハンドラー
 * Issue #37 Task 22.2: モバイルブラウザでのWeb Share API対応
 */

export class MobileWebShareHandler {
    constructor() {
        this.isSupported = false;
        this.browserInfo = null;
        this.shareCapabilities = null;
        this.fallbackHandlers = new Map();
        
        // プラットフォーム固有の設定
        this.platformConfigs = {
            ios: {
                supportedFromVersion: {
                    safari: 14.0;
                   , chrome: 89.0;
    }
                    firefox: 93.0 }
                };
                shareOptions: { title: true;
                    text: true;
                    url: true;
                   , files: true // iOS 15+ }
            };
            android: { supportedFromVersion: {
                    chrome: 75.0;
                    samsung: 12.0;
                   , firefox: 79.0 };
                shareOptions: { title: true;
                    text: true;
                    url: true;
                   , files: true // Android 10+ }
}

    /**
     * 初期化
     */
    async initialize() { try {
            // ブラウザ情報を検出
            this.browserInfo = this.detectBrowserInfo();
            
            // Web Share API サポート状況を確認
            this.isSupported = await this.checkWebShareSupport();
            
            // 共有機能を分析
            this.shareCapabilities = await this.analyzeShareCapabilities();
            
            // フォールバック機能を設定
            this.setupFallbackHandlers();
            
            console.log('MobileWebShareHandler initialized:', {)
                supported: this.isSupported);
               , browser: this.browserInfo,);
                capabilities: this.shareCapabilities),
            ' }'

        } catch (error) { console.error('Failed to initialize MobileWebShareHandler:', error }
    }

    /**
     * ブラウザ情報の検出'
     */''
    detectBrowserInfo(''';
            platform: 'unknown',
            browser: 'unknown',
            version: '0.0',
            engine: 'unknown';
            mobile: false;
           , standalone: false);
        })'
        // プラットフォーム検出
        if(/iPhone|iPad|iPod/i.test(userAgent)) { ''
            info.platform = 'ios';

            info.mobile = /iPhone|iPod/i.test(userAgent);' }'

        } else if(/Android/i.test(userAgent)) { ''
            info.platform = 'android';
            info.mobile = true; }
';
        // ブラウザ検出
        if (/Chrome/i.test(userAgent) && !/Edge/i.test(userAgent)) { ''
            info.browser = 'chrome';''
            const match = userAgent.match(/Chrome\/(\d+\.\d+)/');''
            info.version = match ? match[1] : '0.0';' }

        } else if(/Firefox/i.test(userAgent)) { ''
            info.browser = 'firefox';''
            const match = userAgent.match(/Firefox\/(\d+\.\d+)/');''
            info.version = match ? match[1] : '0.0';' }

        } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) { ''
            info.browser = 'safari';''
            const match = userAgent.match(/Version\/(\d+\.\d+)/');''
            info.version = match ? match[1] : '0.0';' }

        } else if(/SamsungBrowser/i.test(userAgent)) { ''
            info.browser = 'samsung';''
            const match = userAgent.match(/SamsungBrowser\/(\d+\.\d+)/');''
            info.version = match ? match[1] : '0.0'; }

        // スタンドアロンモード検出（PWA）
        info.standalone = window.navigator.standalone === true || '';
                         window.matchMedia('(display-mode: standalone)).matches,
        // エンジン検出
        if(/WebKit/i.test(userAgent)) { ''
            info.engine = 'webkit';' }

        } else if(/Gecko/i.test(userAgent)) { ''
            info.engine = 'gecko'; }

        return info;
    }

    /**
     * Web Share API サポート確認'
     */''
    async checkWebShareSupport()';
        if(!('share' in, navigator) { return false; }

        // プラットフォーム固有のサポート確認
        const platformConfig = this.platformConfigs[this.browserInfo.platform];
        if (!platformConfig) { return false; }

        // ブラウザバージョンの確認
        const supportedVersions = platformConfig.supportedFromVersion;
        const requiredVersion = supportedVersions[this.browserInfo.browser];
        
        if(requiredVersion) {
        
            const currentVersion = parseFloat(this.browserInfo.version);
            const minVersion = parseFloat(requiredVersion);

            if(currentVersion < minVersion) {
        
        }
                return false;

        // 実際のAPIテスト
        try { }

            const testData = { title: 'Test', text: 'Test', url: window.location.href ,}
            const canShare = navigator.canShare ? navigator.canShare(testData) : true;
            return canShare;
        } catch (error) { return false;

    /**
     * 共有機能の分析
     */
    async analyzeShareCapabilities() { const capabilities = {
            basicShare: false;
            fileShare: false;
            maxFileSize: 0;
            supportedMimeTypes: [];
           , supportedFields: [] };
        if(!this.isSupported) { return capabilities; }

        // 基本共有機能のテスト
        try { }

            const basicData = { title: 'Test', text: 'Test', url: window.location.href ,}

            capabilities.basicShare = navigator.canShare ? navigator.canShare(basicData) : true;''
            if(capabilities.basicShare) {', ';

            }

                capabilities.supportedFields.push('title', 'text', 'url); }
            } catch (error) { // Ignore }

        // ファイル共有機能のテスト
        try {'
            if(navigator.canShare) {
                
            }

                // 小さなテストファイルを作成' }'

                const testBlob = new Blob(['test'], { type: 'text/plain' });''
                const testFile = new File([testBlob], 'test.txt', { type: 'text/plain ),

                capabilities.fileShare = navigator.canShare({ files: [testFile] ),''
                if(capabilities.fileShare) {'

                    capabilities.supportedFields.push('files);
                    
                    // サポートされているMIMEタイプの推定
                    await this.testSupportedMimeTypes(capabilities);
                    
                    // 最大ファイルサイズの推定
                }
                    capabilities.maxFileSize = await this.estimateMaxFileSize(); }
} catch (error) { capabilities.fileShare = false; }

        return capabilities;
    }

    /**
     * サポートされているMIMEタイプのテスト
     */''
    async testSupportedMimeTypes(capabilities) { const mimeTypesToTest = ['', 'text/plain',
            'image/png',
            'image/jpeg',
            'image/gif',
            'image/webp',
            'video/mp4',
            'video/webm',
            'audio/mp3',
            'audio/wav',]';
            'application/pdf'];
        ];

        for(const, mimeType of, mimeTypesToTest) {'
            try {
        }

                const testBlob = new Blob(['test'], { type: mimeType )),' }

                const testFile = new File([testBlob], `test.${mimeType.split('/'})[1]}`, { type: mimeType });
                
                if(navigator.canShare({ files: [testFile] )) {
                    capabilities.supportedMimeTypes.push(mimeType } catch (error) { // MIMEタイプがサポートされていない }

            // レート制限を避けるため少し待機
            await new Promise(resolve => setTimeout(resolve, 10);
        }
    }

    /**
     * 最大ファイルサイズの推定
     */
    async estimateMaxFileSize() { if (!this.shareCapabilities? .fileShare) {
            return 0; }

        // プラットフォームごとの既知の制限
        const knownLimits = { : undefined
            ios: {
                safari: 32 * 1024 * 1024, // 32MB;
                chrome: 50 * 1024 * 1024,  // 50MB;
                firefox: 25 * 1024 * 1024  // 25MB ,};
            android: { chrome: 100 * 1024 * 1024, // 100MB
                samsung: 50 * 1024 * 1024,  // 50MB;
                firefox: 25 * 1024 * 1024   // 25MB ,}
        };
        const platformLimits = knownLimits[this.browserInfo.platform];
        if (platformLimits && platformLimits[this.browserInfo.browser]) { return platformLimits[this.browserInfo.browser]; }

        // デフォルト値
        return 25 * 1024 * 1024; // 25MB
    }

    /**
     * フォールバック機能の設定
     */''
    setupFallbackHandlers()';
        if(this.browserInfo.platform === 'ios) {', ';

    }

            this.setupIOSFallbacks() }

        } else if(this.browserInfo.platform === 'android) { this.setupAndroidFallbacks(); }'

        // 汎用フォールバック
        this.setupGenericFallbacks();
    }

    /**
     * iOS用フォールバック設定
     */''
    setupIOSFallbacks()';
        this.fallbackHandlers.set('ios-safari', { ')'
            name: 'Safari Share Sheet'),
            condition: (') => this.browserInfo.browser === 'safari',
            handler: this.createSafariShareHandler(),' }'

        }');
';
        // iOS Chrome用のフォールバック
        this.fallbackHandlers.set('ios-chrome', { ')'
            name: 'Chrome Share Menu'),
            condition: (') => this.browserInfo.browser === 'chrome';
            handler: this.createIOSChromeShareHandler() ,}
        });
    }

    /**
     * Android用フォールバック設定'
     */''
    setupAndroidFallbacks()';
        this.fallbackHandlers.set('android-intent', { ')'
            name: 'Android Share Intent');
            condition: () => true;
            handler: this.createAndroidIntentHandler() }
        });
    }

    /**
     * 汎用フォールバック設定'
     */''
    setupGenericFallbacks()';
        this.fallbackHandlers.set('clipboard', { ')'
            name: 'Copy to Clipboard'),
            condition: (') => 'clipboard' in navigator && 'writeText' in navigator.clipboard,
            handler: this.createClipboardHandler(),' }'

        }');
';
        // URL生成・新しいタブで開く
        this.fallbackHandlers.set('url-open', { ')'
            name: 'Open Share URL');
            condition: () => true;
            handler: this.createURLOpenHandler() }
        });
    }

    /**
     * 共有実行
     */
    async share(shareData) { try {
            // Web Share API が利用可能な場合
            if(this.isSupported && this.canShareData(shareData) {
                
            }
                return await this.shareViaWebShareAPI(shareData);

            // フォールバック処理
            return await this.shareViaFallback(shareData);

        } catch (error) {
            console.error('Share failed:', error);
            
            // エラー時も フォールバックを試行
            return await this.shareViaFallback(shareData, true);

    /**
     * データ共有可否の確認
     */
    canShareData(shareData) {
        try {
            const webShareData = this.convertToWebShareData(shareData);
    }
            return navigator.canShare ? navigator.canShare(webShareData) : true; catch (error) { return false;

    /**
     * Web Share APIでの共有
     */
    async shareViaWebShareAPI(shareData) { const webShareData = this.convertToWebShareData(shareData);
        
        // ファイル共有の場合はサイズチェック
        if(webShareData.files && webShareData.files.length > 0) {
            const totalSize = webShareData.files.reduce((size, file) => size + file.size, 0);
        }
            if (totalSize > this.shareCapabilities.maxFileSize) { }
                throw new Error(`File, size too, large: ${totalSize} bytes`});
            }
        }

        await navigator.share(webShareData);
        ';

        return { success: true,''
            method: 'web-share-api';
           , platform: this.browserInfo.platform, };
            browser: this.browserInfo.browser }
        }

    /**
     * フォールバック共有
     */
    async shareViaFallback(shareData, isError = false) { // 利用可能なフォールバックを選択
        const availableFallbacks = Array.from(this.fallbackHandlers.entries();
            .filter(([key, handler]) => handler.condition();
            .sort((a, b) => this.getFallbackPriority(a[0]) - this.getFallbackPriority(b[0]);

        if(availableFallbacks.length === 0) {'
            ';

        }

            throw new Error('No, fallback handlers, available); }'
        }

        // 最優先のフォールバックを実行
        const [key, handler] = availableFallbacks[0];
        ';

        try {'
            const result = await handler.handler(shareData);

            return { success: true,''
                method: 'fallback';
                fallbackType: key;
               , fallbackName: handler.name, };
                ...result
            } catch (fallbackError) { // 複数のフォールバックを順次試行
            for(let, i = 1; i < availableFallbacks.length; i++) {
                const [fallbackKey, fallbackHandler] = availableFallbacks[i];
                try {'
                    const result = await fallbackHandler.handler(shareData);

                    return { success: true,''
                        method: 'fallback';
                        fallbackType: fallbackKey;
                       , fallbackName: fallbackHandler.name;
            ,}
                        previousErrors: [fallbackError.message], };
                        ...result

                    };''
                } catch (error) { // 次のフォールバックを試行 }
            }

            throw new Error('All, fallback methods, failed);
        }
    }

    /**
     * フォールバック優先度の取得'
     */''
    getFallbackPriority(fallbackKey) {'
        const priorities = {'', 'ios-safari': 1,
            'ios-chrome': 2,
            'android-intent': 1,
            'clipboard': 8,
    }

            'url-open': 9 }
        };
        
        return priorities[fallbackKey] || 10;
    }

    /**
     * Web Share API用データ変換
     */
    convertToWebShareData(shareData) {
        
    }
        const webShareData = {};

        // 基本フィールドの設定
        if (shareData.title) { webShareData.title = shareData.title; }
        
        if (shareData.text || shareData.message) { webShareData.text = shareData.text || shareData.message; }
        
        if (shareData.url) { webShareData.url = shareData.url; }

        // ファイル共有（スクリーンショット等）
        if (shareData.files && this.shareCapabilities.fileShare) { webShareData.files = shareData.files; } else if (shareData.screenshot && this.shareCapabilities.fileShare) { // スクリーンショットをファイルに変換
            const file = this.convertScreenshotToFile(shareData.screenshot);
            if(file) {
                
            }
                webShareData.files = [file]; }
}

        return webShareData;
    }

    /**
     * スクリーンショットのFile変換
     */''
    convertScreenshotToFile(screenshot) {
        try {
            // Data URLをBlobに変換
            const byteString = atob(screenshot.split(',)[1]');''
            const mimeString = screenshot.split(','')[0].split(':'')[1].split(';)[0];
            
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let, i = 0; i < byteString.length; i++) {
    }
                ia[i] = byteString.charCodeAt(i); }
            }

            const blob = new Blob([ab], { type: mimeString )),''
            const file = new File([blob], 'screenshot.png', { type: mimeString ),

            return file;' }'

        } catch (error) {
            console.error('Failed to convert screenshot to file:', error);
            return null;

    /**
     * Safari共有ハンドラーの作成
     */
    createSafariShareHandler() {
        return async (shareData) => { 
            // Safari の共有メニューは Web Share API 経由でのみ利用可能
    }
            // ここでは代替として URL ベースの共有を実装 }
            return await this.createURLOpenHandler()(shareData);
    }

    /**
     * iOS Chrome共有ハンドラーの作成
     */
    createIOSChromeShareHandler() {

        return async(shareData) => { '
            // Chrome on iOS の共有機能を活用
            const shareURL = this.buildShareURL(shareData, 'chrome-ios'');

    }

            window.open(shareURL, '_blank''); }

            ' }'

            return { method: 'ios-chrome-share' }

    /**
     * Android Intent ハンドラーの作成
     */
    createAndroidIntentHandler() {
        return async (shareData) => { '
            // Android Intent を使用した共有
            const intentURL = this.buildAndroidIntentURL(shareData);
            
    }
            try { }

                window.location.href = intentURL;' }'

                return { method: 'android-intent' }''
            } catch (error) { // フォールバック: 通常のURL開始
                window.open(this.buildShareURL(shareData, 'android''), '_blank'');' }

                return { method: 'android-browser-fallback' }
        }

    /**
     * クリップボードハンドラーの作成
     */
    createClipboardHandler() {', ';

    }

        return async(shareData) => {' }'

            const textToShare = `${shareData.title || ''}\n${shareData.text || shareData.message || ''}\n${shareData.url || ''}`.trim();
            
            await navigator.clipboard.writeText(textToShare);
            ';
            // ユーザーへの通知
            this.showCopyNotification(''';
            return { method: 'clipboard', copiedText: textToShare ,}

    /**
     * URL開始ハンドラーの作成)
     */)
    createURLOpenHandler() {'
        return async (shareData) => { ''
            const shareURL = this.buildShareURL(shareData);

    }

            window.open(shareURL, '_blank', 'width=550,height=420,scrollbars=yes,resizable=yes''); }

            ' }'

            return { method: 'url-open', url: shareURL ,}

    /**
     * 共有URL構築'
     */''
    buildShareURL(shareData, platform = 'generic'') {'

        const encodedTitle = encodeURIComponent(shareData.title || ''');''
        const encodedText = encodeURIComponent(shareData.text || shareData.message || ''');''
        const encodedURL = encodeURIComponent(shareData.url || '');
';
        // プラットフォーム固有のURL構築
        switch(platform) {'
    }

            case 'chrome-ios': }
                return `googlechrome://share? url=${encodedURL}&title=${encodedTitle}&text=${encodedText}`;
             : undefined'';
            case 'android':;
                return `intent://share? url=${encodedURL}&title=${encodedTitle}&text=${encodedText}#Intent;scheme=share;end`;
             : undefined
            default:;
                // Twitter を代替として使用
                return `https://twitter.com/intent/tweet? text=${encodedText}&url=${encodedURL}`,
        }
    }

    /**
     * Android Intent URL構築
     */''
    buildAndroidIntentURL(shareData) {'

        const title = shareData.title || '';''
        const text = shareData.text || shareData.message || '';''
        const url = shareData.url || '';
    }
        const shareText = `${title}\n${text}\n${url}`.trim();
        const encodedText = encodeURIComponent(shareText);
         : undefined
        return `intent:${encodedText}#Intent;action=android.intent.action.SEND;type=text/plain;end`;
    }

    /**
     * コピー通知の表示'
     */''
    showCopyNotification()';
        const notification = document.createElement('div'');''
        notification.textContent = 'クリップボードにコピーしました';
        notification.style.cssText = `;
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
           , padding: 12px 24px;
            border-radius: 8px,
            z-index: 10000,
            font-size: 14px,
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => { notification.remove(); }, 3000);
    }

    /**
     * サポート状況の取得'
     */''
    getSupportInfo(');