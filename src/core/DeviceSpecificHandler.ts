// TypeScript conversion - basic types
interface BasicConfig { [key: string]: any;
/**
 * DeviceSpecificHandler - デバイス固有の最適化を提供するマネージャー
 * iOS、Android、Web各プラットフォーム固有の最適化を実装
 * ブラウザ固有の問題に対する対応策を提供
 * 高DPIディスプレイ対応を強化
 */

import { ErrorHandler  } from '../utils/ErrorHandler.js';

class DeviceSpecificHandler { constructor(gameEngine: any) {
        this.gameEngine = gameEngine;
        this.errorHandler = ErrorHandler.getInstance('''
            browser: 'unknown';
            version: 'unknown' }
            devicePixelRatio: window.devicePixelRatio || 1 
    };
        // iOS固有設定
        this.iosConfig = { webkitOptimizations: {''
                backfaceVisibility: 'hidden',
                perspective: 1000,
                transformStyle: 'preserve-3d',
                willChange: 'transform'
            };
            touchDelayFix: { fastClickEnabled: true,
                touchCalloutDisabled: true,
    touchDelayReduced: true,;
            metaTags: { webAppCapable: true,''
                statusBarStyle: 'black-translucent',
                viewportFit: 'cover'
            }
        };
        // Android固有設定
        this.androidConfig = { blinkOptimizations: {
                compositorThreaded: true,
                acceleratedCanvas: true,
    gpuRasterization: true,;
            performanceOptimizations: { reducedMotion: false,
                lowMemoryMode: false,
    powerSaveMode: false,;
            touchOptimizations: { ''
                touchAction: 'manipulation',
                passiveListeners: true,
    preventZoom: true,;
        // 高DPI対応設定
        this.highDPIConfig = { scaling: {
                autoScale: true,
    maxScale: 3.0,
                scalingMethod: 'nearest-neighbor'
            };
            rendering: { sharpText: true,
    crispEdges: true,
                antialiasing: 'subpixel'
            };
            performance: { optimizeForHighDPI: true,
                useNativeResolution: true,
    fallbackResolution: 1.0 }))
        );
        this.initialize();
    }
    
    /**
     * システム初期化
     */
    initialize() {
        try {
            this.detectPlatform(),
            this.applyPlatformOptimizations(),
            this.setupHighDPISupport(),

            this.setupBrowserSpecificFixes(),
            this.setupEventListeners() }

            console.log('[DeviceSpecificHandler] デバイス固有最適化初期化完了', this.platform'; }'

        } catch (error) {
            this.errorHandler.handleError(error, 'DeviceSpecificHandler.initialize' }'
    }
    
    /**
     * プラットフォーム検出
     */
    detectPlatform() {
        const userAgent = navigator.userAgent,
        const platform = navigator.platform,
        ','
        // iOS検出
        this.platform.isIOS = /iPad|iPhone|iPod/.test(userAgent) || ','
                             (platform === 'MacIntel' && navigator.maxTouchPoints > 1),
        
        // Android検出
        this.platform.isAndroid = /Android/.test(userAgent),
        
        // モバイル検出
        this.platform.isMobile = this.platform.isIOS || this.platform.isAndroid || ,
                                /Mobile|Tablet/.test(userAgent),
        
        // デスクトップ検出
        this.platform.isDesktop = !this.platform.isMobile,
        // ブラウザ検出
        if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
    }

            this.platform.browser = 'safari'; }

        } else if(/Chrome/.test(userAgent)) { ''
            this.platform.browser = 'chrome',' }'

        } else if(/Firefox/.test(userAgent)) { ''
            this.platform.browser = 'firefox',' }'

        } else if(/Edge/.test(userAgent)) { ''
            this.platform.browser = 'edge' }
        
        // バージョン検出
        this.detectBrowserVersion();
        
        // デバイス特性検出
        this.platform.devicePixelRatio = window.devicePixelRatio || 1;
        this.platform.hasNotch = this.detectNotch();
        this.platform.safeAreaSupport = this.detectSafeAreaSupport();
    }
    
    /**
     * ブラウザバージョン検出
     */''
    detectBrowserVersion()';'
        if(this.platform.browser === 'safari' {', ' }

            match = userAgent.match(/Version\/(\d+\.\d+)/');' }

        } else if(this.platform.browser === 'chrome' { ''
            match = userAgent.match(/Chrome\/(\d+\.\d+)/'),' }

        } else if(this.platform.browser === 'firefox' { ''
            match = userAgent.match(/Firefox\/(\d+\.\d+)/'),' }

        } else if(this.platform.browser === 'edge' { ''
            match = userAgent.match(/Edge\/(\d+\.\d+)/') }'

        this.platform.version = match ? match[1] : 'unknown';
    }
    
    /**
     * ノッチ検出'
     */''
    detectNotch()';'
        const testElement = document.createElement('div');
        testElement.style.position = 'fixed';
        testElement.style.top = '0';
        testElement.style.left = '0';
        testElement.style.paddingTop = 'env(safe-area-inset-top)';
        testElement.style.visibility = 'hidden';
        
        document.body.appendChild(testElement);
        const hasNotch = parseInt(getComputedStyle(testElement).paddingTop) > 0;
        document.body.removeChild(testElement);
        
        return hasNotch;
    }
    
    /**
     * セーフエリアサポート検出'
     */''
    detectSafeAreaSupport()';'
        return CSS.supports('padding-top: env(safe-area-inset-top)') ||';'
               CSS.supports('padding-top: constant(safe-area-inset-top) }'
    
    /**
     * プラットフォーム最適化適用
     */
    applyPlatformOptimizations() {
        if (this.platform.isIOS) {
    }
            this.applyIOSOptimizations(); }
        }
        
        if (this.platform.isAndroid) { this.applyAndroidOptimizations() }
        
        if (this.platform.isDesktop) { this.applyDesktopOptimizations() }
    }
    
    /**
     * iOS固有最適化
     */
    applyIOSOptimizations() {
        // WebKit最適化
        this.applyWebKitOptimizations(),
        
        // タッチ遅延対策
        this.applyIOSTouchDelayFix(),
        
        // iOS固有メタタグ設定
        this.applyIOSMetaTags(),
        // iOS Safari固有問題修正
        this.fixIOSSafariIssues() }

        console.log('[DeviceSpecificHandler] iOS最適化適用完了'); }'
    }
    
    /**
     * WebKit最適化適用'
     */''
    applyWebKitOptimizations()';'
        canvas.style.transform = 'translateZ(0)';
        canvas.style.webkitTransform = 'translateZ(0)';
        ';'
        // コンテナ最適化
        if (container) {

            container.style.webkitOverflowScrolling = 'touch' }

            container.style.webkitBackfaceVisibility = 'hidden'; }
}
    
    /**
     * iOSタッチ遅延修正
     */
    applyIOSTouchDelayFix() {
        // FastClick代替実装
        if (this.iosConfig.touchDelayFix.fastClickEnabled) {
    }
            this.setupFastClick(); }
        }
        ;
        // タッチコールアウト無効化
        if (this.iosConfig.touchDelayFix.touchCalloutDisabled) {

            document.body.style.webkitTouchCallout = 'none' }

            document.body.style.webkitUserSelect = 'none'; }
        }
        ';'
        // CSS touch-action設定
        if (this.iosConfig.touchDelayFix.touchDelayReduced) {', ' }

            this.gameEngine.canvas.style.touchAction = 'manipulation'; }
}
    
    /**
     * FastClick代替実装'
     */''
    setupFastClick()';'
        this.gameEngine.canvas.addEventListener('touchstart', (e) => {  touchStartTime = Date.now(),
            if (e.touches.length > 0) {
    
}
                touchStartPos.x = e.touches[0].clientX; }
                touchStartPos.y = e.touches[0].clientY; }

            }'}, { passive: true,');

        this.gameEngine.canvas.addEventListener('touchend', (e) => {  const touchEndTime = Date.now(),
            const duration = touchEndTime - touchStartTime,
            
            if (duration < 200 && e.changedTouches.length > 0) {
            
                const touchEndPos = {
    
}
                    x: e.changedTouches[0].clientX }
                    y: e.changedTouches[0].clientY 
    };
                const distance = Math.sqrt();
                    Math.pow(touchEndPos.x - touchStartPos.x, 2) +;
                    Math.pow(touchEndPos.y - touchStartPos.y, 2);

                if (distance < 10) {
                    // 即座にクリックイベントを発火
                    const clickEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true),
                        clientX: touchEndPos.x,
    clientY: touchEndPos.y) }
                    e.target.dispatchEvent(clickEvent); }
}
        }, { passive: true,);
    }
    
    /**
     * iOS固有メタタグ設定'
     */''
    applyIOSMetaTags('''
            { name: 'apple-mobile-web-app-capable', content: 'yes'
            },''
            { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent'
            },''
            { name: 'apple-touch-fullscreen', content: 'yes'
            },''
            { name: 'viewport', content: 'width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover' }
        ];

        ')';
        metaTags.forEach(({ name, content )) => { }'

            let meta = document.querySelector(`meta[name="${name}"]`";"
            if (!meta) {"

                meta = document.createElement('meta),'
                meta.name = name }
                document.head.appendChild(meta); }
            }
            meta.content = content;
        });
    }
    
    /**
     * iOS Safari固有問題修正
     */
    fixIOSSafariIssues() {
        // 100vh問題修正
    }

        const updateViewportHeight = () => {  }'

            const vh = window.innerHeight * 0.01;' }'

            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        updateViewportHeight()';'
        window.addEventListener('resize', updateViewportHeight';'
        ';'
        // スクロール禁止
        document.body.addEventListener('touchmove', (e) => { e.preventDefault(),' }'

        }, { passive: false,');'
        
        // ダブルタップズーム防止
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {  const now = Date.now(),
            if (now - lastTouchEnd <= 300) { }
                e.preventDefault(); }
            }
            lastTouchEnd = now;
        }, false);
    }
    
    /**
     * Android固有最適化
     */
    applyAndroidOptimizations() {
        // Blink最適化
        this.applyBlinkOptimizations(),
        
        // Android固有パフォーマンス最適化
        this.applyAndroidPerformanceOptimizations(),
        // Android固有タッチ処理最適化
        this.applyAndroidTouchOptimizations() }

        console.log('[DeviceSpecificHandler] Android最適化適用完了'); }'
    }
    
    /**
     * Blink最適化適用
     */
    applyBlinkOptimizations() {
        const canvas = this.gameEngine.canvas,
        ','
        // コンポジター最適化
        if (this.androidConfig.blinkOptimizations.compositorThreaded) {''
            canvas.style.willChange = 'transform, opacity' }

            canvas.style.contain = 'layout style paint'; }
        }
        ';'
        // Canvas2D加速有効化
        if (this.androidConfig.blinkOptimizations.acceleratedCanvas) {

            const ctx = canvas.getContext('2d),'
            if (ctx.willReadFrequently !== undefined) {
        }
                ctx.willReadFrequently = false; }
}
        ';'
        // GPU ラスタライゼーション
        if (this.androidConfig.blinkOptimizations.gpuRasterization) {

            canvas.style.imageRendering = 'optimizeSpeed' }

            canvas.style.imageRendering = '-webkit-optimize-contrast'; }
}
    
    /**
     * Android パフォーマンス最適化'
     */''
    applyAndroidPerformanceOptimizations()';'
        if ('memory' in, performance && performance.memory) {
        const memoryRatio = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit,
            if (memoryRatio > 0.8) {
                this.androidConfig.performanceOptimizations.lowMemoryMode = true,
                this.enableLowMemoryMode()','
        if ('getBattery' in, navigator) {
            navigator.getBattery().then((battery) => { 
                if (battery.charging === false && battery.level < 0.2) {
    }
                    this.androidConfig.performanceOptimizations.powerSaveMode = true; }
                    this.enablePowerSaveMode(); }
});
        }
    }
    
    /**
     * 低メモリモード有効化
     */
    enableLowMemoryMode() {
        // ガベージコレクション強制実行
        if (window.gc) {
    }
            window.gc(); }
        }
        
        // パフォーマンス設定調整
        if (this.gameEngine.performanceOptimizer) { }

            this.gameEngine.performanceOptimizer.setLowMemoryMode(true); }
        }

        console.log('[DeviceSpecificHandler] 低メモリモード有効化);'
    }
    
    /**
     * 省電力モード有効化
     */
    enablePowerSaveMode() {
        // フレームレート削減
        if (this.gameEngine.performanceOptimizer) {
    }
            this.gameEngine.performanceOptimizer.setTargetFPS(30); }
        }
        
        // エフェクト削減
        if (this.gameEngine.effectsManager') { }'

            this.gameEngine.effectsManager.setQualityLevel(0.5); }
        }

        console.log('[DeviceSpecificHandler] 省電力モード有効化);'
    }
    
    /**
     * Android タッチ最適化
     */
    applyAndroidTouchOptimizations() {
        const canvas = this.gameEngine.canvas,
        
        // タッチアクション設定
        canvas.style.touchAction = this.androidConfig.touchOptimizations.touchAction,
        
        // パッシブリスナー使用
        if (this.androidConfig.touchOptimizations.passiveListeners) {
            // 既存のタッチイベントリスナーをパッシブに変更
    }
            this.setupPassiveTouchListeners(); }
        }
        
        // ズーム防止
        if (this.androidConfig.touchOptimizations.preventZoom) { this.preventZoom() }
    }
    
    /**
     * パッシブタッチリスナー設定
     */''
    setupPassiveTouchListeners()';'
        ['touchstart', 'touchmove].forEach(eventType => {  ),'
            canvas.addEventListener(eventType, (e) => { }
                // パッシブイベント処理 }
            }, passiveOptions);
        });
    }
    
    /**
     * ズーム防止
     */''
    preventZoom()';'
        this.gameEngine.canvas.addEventListener('touchend', (e) => {  const now = Date.now(),
            if (now - lastTouchEnd <= 300) { }
                e.preventDefault(); }
            }

            lastTouchEnd = now;'}');
        ';'
        // ピンチズーム防止
        this.gameEngine.canvas.addEventListener('gesturestart', (e) => { e.preventDefault() });
    }
    
    /**
     * デスクトップ最適化
     */
    applyDesktopOptimizations() {
        // マウスイベント最適化
        this.setupDesktopMouseOptimizations(),
        // キーボードショートカット強化
        this.setupDesktopKeyboardOptimizations() }

        console.log('[DeviceSpecificHandler] デスクトップ最適化適用完了'); }'
    }
    
    /**
     * デスクトップマウス最適化'
     */''
    setupDesktopMouseOptimizations()';'
        canvas.addEventListener('pointermove', (e) => {  ''
            if(e.pointerType === 'mouse' { }
                // 高精度マウス座標処理 }
                this.handleHighPrecisionMouse(e); }
            }'}');
        ';'
        // マウスホイール最適化
        canvas.addEventListener('wheel', (e) => {  // スムーズスクロール処理 }
            this.handleSmoothWheel(e); }
        }, { passive: false,);
    }
    
    /**
     * 高精度マウス処理
     */
    handleHighPrecisionMouse(e) {
        // サブピクセル精度での座標計算
        const rect = this.gameEngine.canvas.getBoundingClientRect(),
        const x = (e.clientX - rect.left) * this.platform.devicePixelRatio,
        const y = (e.clientY - rect.top) * this.platform.devicePixelRatio,
        
        // ゲームエンジンに高精度座標を渡す
        if (this.gameEngine.inputManager) {
    }
            this.gameEngine.inputManager.updateHighPrecisionMouse(x, y); }
}
    
    /**
     * スムーズホイール処理
     */
    handleSmoothWheel(e) {
        e.preventDefault(),
        
        // 慣性スクロール実装
        const delta = e.deltaY || e.deltaX,
        if (this.gameEngine.inputManager) {
    }
            this.gameEngine.inputManager.updateWheelInput(delta); }
}
    
    /**
     * デスクトップキーボード最適化
     */''
    setupDesktopKeyboardOptimizations()';'
        document.addEventListener('keydown', (e) => {  if (this.gameEngine.isGameActive() { }
                this.handleGameKeyboard(e); }
});
    }
    
    /**
     * ゲームキーボード処理
     */
    handleGameKeyboard(e) {

        // フルスクリーン切り替え (F11'),'
        if(e.key === 'F11' {'
            e.preventDefault() }
            this.toggleFullscreen(); }
        }

        // パフォーマンス情報表示 (Ctrl+Shift+P');'
        if(e.ctrlKey && e.shiftKey && e.key === 'P' {'
            e.preventDefault() }
            this.togglePerformanceInfo(); }
}
    
    /**
     * 高DPI対応設定
     */
    setupHighDPISupport() {
        this.optimizeCanvasForHighDPI(),
        this.setupDPIChangeDetection(),
        this.applyHighDPIStyles() }
        console.log(`[DeviceSpecificHandler] 高DPI対応設定完了 (DPR: ${this.platform.devicePixelRatio}`});
    }
    
    /**
     * Canvas高DPI最適化'
     */''
    optimizeCanvasForHighDPI()';'
        const ctx = canvas.getContext('2d);'
        
        if (this.highDPIConfig.scaling.autoScale) {
        
            const dpr = Math.min(this.platform.devicePixelRatio, this.highDPIConfig.scaling.maxScale),
            ','
            // Canvas内部解像度設定
            const rect = canvas.getBoundingClientRect('',
            canvas.style.width = rect.width + 'px',
            canvas.style.height = rect.height + 'px'),
            // コンテキストスケーリング)
            ctx.scale(dpr, dpr),
            // Canvas最適化プロパティ設定
            if (this.highDPIConfig.rendering.sharpText) {
    
}

                ctx.textRendering = 'optimizeSpeed'; }
            }
            
            console.log(`[DeviceSpecificHandler] Canvas高DPI最適化完了 (${canvas.width}x${canvas.height}`});
        }
    }
    
    /**
     * DPI変更検出
     */
    setupDPIChangeDetection() {
        let currentDPR = this.platform.devicePixelRatio,
        
        const checkDPRChange = () => { 
            const newDPR = window.devicePixelRatio,
            if (newDPR !== currentDPR) {
                currentDPR = newDPR,
                this.platform.devicePixelRatio = newDPR }
                this.optimizeCanvasForHighDPI(); }
                 }
                console.log(`[DeviceSpecificHandler] DPI変更検出 (新DPR: ${newDPR}`});
            }
        };
        
        // ResizeObserver使用
        if (window.ResizeObserver) {
            const observer = new ResizeObserver(checkDPRChange) }

            observer.observe(this.gameEngine.canvas); }

        } else {  // フォールバック' }'

            window.addEventListener('resize', checkDPRChange); }
}
    
    /**
     * 高DPIスタイル適用
     */
    applyHighDPIStyles() {
        const canvas = this.gameEngine.canvas,
        
        // 高DPI環境でのレンダリング最適化
        if (this.platform.devicePixelRatio > 1) {''
            if (this.highDPIConfig.rendering.crispEdges) {''
                canvas.style.imageRendering = 'crisp-edges' }

                canvas.style.imageRendering = '-webkit-optimize-contrast'; }
            }
            ';'
            // アンチエイリアシング設定
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = this.highDPIConfig.rendering.antialiasing !== 'none';
            
            if (ctx.imageSmoothingQuality) { ctx.imageSmoothingQuality = this.highDPIConfig.rendering.antialiasing }
}
    
    /**
     * ブラウザ固有修正
     */
    setupBrowserSpecificFixes() {

        switch(this.platform.browser) {''
            case 'safari':','
                this.applySafariFixes('''
            case 'chrome': ','
                this.applyChromeFixes('',
            case 'firefox':','
                this.applyFirefoxFixes()','
            case 'edge':),
                this.applyEdgeFixes() }
                break; }
}
    
    /**
     * Safari固有修正
     */
    applySafariFixes() {
        // Safariのメモリリーク対策
        this.setupSafariMemoryLeakFix(),
        // Safariの音声再生問題修正
        this.setupSafariAudioFix() }

        console.log('[DeviceSpecificHandler] Safari固有修正適用完了'); }'
    }
    
    /**
     * Safariメモリリーク修正
     */
    setupSafariMemoryLeakFix() {
        // Canvas2Dコンテキストリーク対策
        let frameCount = 0,
        const CLEANUP_INTERVAL = 1000,
        
        const originalRender = this.gameEngine.render,
        this.gameEngine.render = () => { 
            originalRender.call(this.gameEngine),
            
            frameCount++,
            if (frameCount % CLEANUP_INTERVAL === 0) {
                // 強制ガベージコレクション
    }
                if (window.gc) { }
                    window.gc(); }
}
        }
    
    /**
     * Safari音声修正
     */
    setupSafariAudioFix() {
        // AudioContextの自動再開
        if (this.gameEngine.audioManager && this.gameEngine.audioManager.audioContext) {
            const audioContext = this.gameEngine.audioManager.audioContext,

            const resumeAudio = () => { }

                if(audioContext.state === 'suspended' { }

                    audioContext.resume() }

            document.addEventListener('touchstart', resumeAudio, { once: true,';'
            document.addEventListener('click', resumeAudio, { once: true,
    
    /**
     * Chrome固有修正
     */
    applyChromeFixes() {
        // Chrome固有最適化
        this.setupChromeOptimizations() }
        console.log('[DeviceSpecificHandler] Chrome固有修正適用完了'); }'
    }
    
    /**
     * Chrome最適化'
     */''
    setupChromeOptimizations('';
        canvas.style.willChange = 'transform';
        canvas.style.contain = 'strict';
        
        // Chrome, V8最適化)
        this.setupV8Optimizations();
    }
    
    /**
     * V8最適化
     */
    setupV8Optimizations() {
        // ホットコード最適化のヒント
        const optimizeFunction = (func) => { 
            // 関数を事前に実行して最適化を促進
    }
            for (let, i = 0; i < 100; i++) { }
                func(); }
};
        
        // 重要な関数を最適化
        if (this.gameEngine.update) {
    
}
            optimizeFunction(() => {});
        }
    }
    
    /**
     * Firefox固有修正
     */
    applyFirefoxFixes() {
        // Firefox固有最適化
        this.setupFirefoxOptimizations() }

        console.log('[DeviceSpecificHandler] Firefox固有修正適用完了'); }'
    }
    
    /**
     * Firefox最適化'
     */''
    setupFirefoxOptimizations('';
        canvas.style.imageRendering = '-moz-crisp-edges';
        ';'
        // Quantum最適化
        canvas.style.willChange = 'transform, opacity';
    }
    
    /**
     * Edge固有修正
     */)
    applyEdgeFixes() {
        // Edge固有最適化
        this.setupEdgeOptimizations() }
        console.log('[DeviceSpecificHandler] Edge固有修正適用完了'); }'
    }
    
    /**
     * Edge最適化'
     */''
    setupEdgeOptimizations('';
        canvas.style.msInterpolationMode = 'nearest-neighbor';
    }
    
    /**
     * イベントリスナー設定'
     */''
    setupEventListeners()';'
        window.addEventListener('orientationchange', () => {  setTimeout(() => { }
                this.handleOrientationChange(); }

            }, 100);'}');
        ';'
        // ウィンドウサイズ変更
        window.addEventListener('resize', () => { this.handleResize(),' }'

        }');'
        ';'
        // 可視性変更
        document.addEventListener('visibilitychange', () => { this.handleVisibilityChange() });
    }
    
    /**
     * 画面向き変更処理
     */
    handleOrientationChange() {
        try {
            // レイアウト再計算
            this.optimizeCanvasForHighDPI(),
            
            // ゲームエンジンに通知
            if (this.gameEngine.handleOrientationChange) {''
                this.gameEngine.handleOrientationChange() }

            console.log('[DeviceSpecificHandler] 画面向き変更処理完了');' }'

        } catch (error) {
            this.errorHandler.handleError(error, 'DeviceSpecificHandler.handleOrientationChange' }'
    }
    
    /**
     * ウィンドウサイズ変更処理
     */
    handleResize() {
        try {
            // DPI再検出
            this.setupHighDPISupport(),
            
            // ゲームエンジンに通知
            if (this.gameEngine.handleResize) {
    }
                this.gameEngine.handleResize();' }'

            } catch (error) {
            this.errorHandler.handleError(error, 'DeviceSpecificHandler.handleResize' }'
    }
    
    /**
     * 可視性変更処理
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // バックグラウンドに移行
    }
            this.handleBackgroundTransition(); }
        } else {  // フォアグラウンドに復帰 }
            this.handleForegroundTransition(); }
}
    
    /**
     * バックグラウンド移行処理
     */
    handleBackgroundTransition() {
        // パフォーマンス最適化
        if (this.gameEngine.performanceOptimizer) {
    }

            this.gameEngine.performanceOptimizer.setBackgroundMode(true); }
        }

        console.log('[DeviceSpecificHandler] バックグラウンドモード有効化);'
    }
    
    /**
     * フォアグラウンド復帰処理
     */
    handleForegroundTransition() {
        // パフォーマンス復元
        if (this.gameEngine.performanceOptimizer) {
    }
            this.gameEngine.performanceOptimizer.setBackgroundMode(false); }
        }
        ;
        // DPI再確認
        this.setupHighDPISupport()';'
        console.log('[DeviceSpecificHandler] フォアグラウンドモード復帰);'
    }
    
    /**
     * フルスクリーン切り替え
     */
    toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
    }
                this.gameEngine.canvas.requestFullscreen(); }

            } else { document.exitFullscreen(),' }'

            } catch (error) {
            this.errorHandler.handleError(error, 'DeviceSpecificHandler.toggleFullscreen' }'
    }
    
    /**
     * パフォーマンス情報表示切り替え
     */
    togglePerformanceInfo() {
        if (this.gameEngine.performanceOptimizer) {
    }
            this.gameEngine.performanceOptimizer.toggleDebugInfo(); }
}
    
    /**
     * プラットフォーム情報取得
     */
    getPlatformInfo() {
    
}
        return { ...this.platform }
    
    /**
     * デバイス性能レポート生成
     */
    generatePerformanceReport() {
        return { platform: this.getPlatformInfo(
            capabilities: {
                webgl: !!window.WebGLRenderingContext,
                webgl2: !!window.WebGL2RenderingContext,
                offscreenCanvas: !!window.OffscreenCanvas,
    serviceWorker: !!navigator.serviceWorker }
                intersection: !!window.IntersectionObserver };
                resize: !!window.ResizeObserver 
    };
            memory: performance.memory ? { : undefined
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
    limit: performance.memory.jsHeapSizeLimit  } : null;
            timing: performance.timing ? { : undefined
                loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
    domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart  } : null)
            });
    /**
     * クリーンアップ'
     */''
    cleanup()';'
            window.removeEventListener('orientationchange', this.handleOrientationChange';'
            window.removeEventListener('resize', this.handleResize';'
            document.removeEventListener('visibilitychange', this.handleVisibilityChange';'

            console.log('[DeviceSpecificHandler] クリーンアップ完了');
        } catch (error) {
            this.errorHandler.handleError(error, 'DeviceSpecificHandler.cleanup' }'
}

// シングルトンインスタンス
let deviceSpecificHandlerInstance = null;
';'

export function getDeviceSpecificHandler(gameEngine = null) { if (!deviceSpecificHandlerInstance && gameEngine) {''
        deviceSpecificHandlerInstance = new DeviceSpecificHandler(gameEngine) }
    return deviceSpecificHandlerInstance;
}

export { DeviceSpecificHandler  };