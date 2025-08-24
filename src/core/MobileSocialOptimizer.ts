/**
 * モバイル向けソーシャル機能最適化クラス
 * Issue #37 Task 22.1: タッチ操作対応の共有UI
 */

export interface DeviceCapabilities {
    isMobile: boolean;
    isTablet: boolean;
    isIOS: boolean;
    isAndroid: boolean;
    screenWidth: number;
    screenHeight: number;
    devicePixelRatio: number;
    touchSupport: boolean;
    multiTouchSupport: boolean;
    webShareSupport: boolean;
    canShare?: (data: any) => boolean;
    clipboardSupport: boolean;
    connectionType: string;
    memoryLimit: number;
    vibrationSupport: boolean;
    orientationSupport: boolean;
    fullscreenSupport: boolean;
}

export interface TouchOptimization {
    element: string;
    config: {
        minSize?: number;
        hapticFeedback?: boolean;
        preventDefaultTouch?: boolean;
        longPressAction?: string;
        swipeToClose?: boolean;
        dragThreshold?: number;
        gestureSupport?: boolean;
        rippleEffect?: boolean;
    };
    handlers: {
        tap?: (event: Event, data: any) => void;
        longPress?: (event: Event, data: any) => void;
        swipe?: (event: Event, data: any) => void;
        drag?: (event: Event, data: any) => void;
        hold?: (event: Event, data: any) => void;
        swipeUp?: (event: Event, data: any) => void;
        swipeDown?: (event: Event, data: any) => void;
    };
}

export class MobileSocialOptimizer {
    private socialSharingManager: any;
    private touchManager: any;
    private responsiveLayoutManager: any;
    private isInitialized: boolean;
    private deviceInfo: DeviceCapabilities | null;
    private touchOptimizations: Map<string, TouchOptimization>;
    private gestureHandlers: Map<string, any>;
    private config: any;
    private errorHandler: any;

    constructor(socialSharingManager: any, touchManager: any, responsiveLayoutManager: any) {
        this.socialSharingManager = socialSharingManager;
        this.touchManager = touchManager;
        this.responsiveLayoutManager = responsiveLayoutManager;
        
        this.isInitialized = false;
        this.deviceInfo = null;
        this.touchOptimizations = new Map();
        this.gestureHandlers = new Map();
        
        // モバイル最適化設定
        this.config = {
            touch: {
                minTouchTargetSize: 44, // iOS推奨最小サイズ (44x44 pt)
                tapTimeout: 300,
                longPressTimeout: 500,
                swipeThreshold: 50,
                preventDefaultOnTouch: true
            },
            ui: {
                expandedShareDialog: true,
                largerButtons: true,
                bottomSheetLayout: true,
                hapticFeedback: true
            },
            performance: {
                throttleUpdates: true,
                reduceAnimations: false,
                optimizeImages: true,
                lazyLoadContent: true
            }
        };

        // エラーハンドリング
        this.errorHandler = null;
    }

    /**
     * 初期化
     */
    async initialize(): Promise<void> {
        try {
            // デバイス情報を検出
            this.deviceInfo = await this.detectDeviceCapabilities();
            
            // タッチイベントハンドラーを設定
            this.setupTouchHandlers();
            // レスポンシブレイアウトとの連携を設定
            this.setupResponsiveIntegration();
            // モバイル最適化を有効化
            this.enableMobileOptimizations();
            this.isInitialized = true;
            console.log('MobileSocialOptimizer initialized successfully', this.deviceInfo);
        } catch (error) {
            console.error('Failed to initialize MobileSocialOptimizer:', error);
            if (this.errorHandler) {
                this.errorHandler.handleError('MOBILE_SOCIAL_INIT_FAILED', error);
            }
            throw error;
        }
    }

    /**
     * デバイス機能の検出
     */
    async detectDeviceCapabilities(): Promise<DeviceCapabilities> {
        const capabilities: DeviceCapabilities = {
            // 基本デバイス情報
            isMobile: /iPhone|iPad|iPod|Android|BlackBerry|Opera Mini|IEMobile/i.test(navigator.userAgent),
            isTablet: /iPad|Android(?=.*Mobile)/i.test(navigator.userAgent),
            isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
            isAndroid: /Android/i.test(navigator.userAgent),
            
            // 画面情報
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            devicePixelRatio: window.devicePixelRatio || 1,
            
            // タッチ機能
            touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            multiTouchSupport: navigator.maxTouchPoints > 1,
            
            // ブラウザ機能
            webShareSupport: 'share' in navigator && typeof navigator.share === 'function',
            canShare: (navigator as any).canShare ? (navigator as any).canShare.bind(navigator) : () => false,
            clipboardSupport: 'clipboard' in navigator && 'writeText' in (navigator as any).clipboard,
            
            // パフォーマンス情報
            connectionType: (navigator as any).connection ? (navigator as any).connection.effectiveType : 'unknown',
            memoryLimit: (navigator as any).deviceMemory || 4, // GB
            
            // 追加機能
            vibrationSupport: 'vibrate' in navigator,
            orientationSupport: 'orientation' in window || 'onorientationchange' in window,
            fullscreenSupport: document.fullscreenEnabled || (document as any).webkitFullscreenEnabled
        };
        
        // デバイス固有の最適化設定を調整
        this.adjustConfigForDevice(capabilities);
        
        return capabilities;
    }

    /**
     * デバイス固有の設定調整
     */
    adjustConfigForDevice(capabilities: DeviceCapabilities): void {
        // iOSデバイス用調整
        if (capabilities.isIOS) {
            this.config.touch.minTouchTargetSize = 44; // iOS Human Interface Guidelines
            this.config.ui.hapticFeedback = true;
            this.config.performance.reduceAnimations = false;
        }
        
        // Androidデバイス用調整
        if (capabilities.isAndroid) {
            this.config.touch.minTouchTargetSize = 48; // Material Design Guidelines
            this.config.ui.hapticFeedback = capabilities.vibrationSupport;
        }
        
        // 低性能デバイス用調整
        if (capabilities.memoryLimit < 2) {
            this.config.performance.reduceAnimations = true;
            this.config.performance.optimizeImages = true;
            this.config.performance.lazyLoadContent = true;
        }
        
        // 低速回線用調整
        if (capabilities.connectionType === '2g' || capabilities.connectionType === 'slow-2g') {
            this.config.performance.optimizeImages = true;
            this.config.performance.lazyLoadContent = true;
            this.config.performance.throttleUpdates = true;
        }
    }

    /**
     * タッチハンドラーの設定
     */
    setupTouchHandlers(): void {
        this.addTouchOptimization('shareButton', {
            element: '.share-button',
            config: {
                minSize: this.config.touch.minTouchTargetSize,
                hapticFeedback: this.config.ui.hapticFeedback,
                preventDefaultTouch: true,
                longPressAction: 'customizeShare'
            },
            handlers: {
                tap: this.handleShareButtonTap.bind(this),
                longPress: this.handleShareButtonLongPress.bind(this),
                swipe: this.handleShareButtonSwipe.bind(this)
            }
        });

        // 共有ダイアログ用タッチハンドラー
        this.addTouchOptimization('shareDialog', {
            element: '.share-dialog',
            config: {
                swipeToClose: true,
                dragThreshold: 100,
                gestureSupport: true
            },
            handlers: {
                swipeUp: this.handleDialogSwipeUp.bind(this),
                swipeDown: this.handleDialogSwipeDown.bind(this),
                drag: this.handleDialogDrag.bind(this)
            }
        });

        // プラットフォーム選択ボタン用タッチハンドラー
        this.addTouchOptimization('platformButton', {
            element: '.platform-button',
            config: {
                minSize: Math.max(this.config.touch.minTouchTargetSize, 56), // より大きなサイズ
                rippleEffect: true,
                hapticFeedback: true
            },
            handlers: {
                tap: this.handlePlatformButtonTap.bind(this),
                hold: this.handlePlatformButtonHold.bind(this)
            }
        });
    }

    /**
     * タッチ最適化の追加
     */
    addTouchOptimization(name: string, optimization: TouchOptimization): void {
        this.touchOptimizations.set(name, optimization);

        // 要素が存在する場合は即座に適用
        document.addEventListener('DOMContentLoaded', () => {
            this.applyTouchOptimization(name, optimization);
        });
        
        // 動的に追加される要素への対応
        this.observeElementAddition(optimization.element, (element) => {
            this.applyTouchOptimizationToElement(element, optimization);
        });
    }

    /**
     * 要素へのタッチ最適化適用
     */
    applyTouchOptimization(name: string, optimization: TouchOptimization): void {
        const elements = document.querySelectorAll(optimization.element);
        elements.forEach(element => {
            this.applyTouchOptimizationToElement(element as HTMLElement, optimization);
        });
    }

    /**
     * 個別要素へのタッチ最適化適用
     */
    applyTouchOptimizationToElement(element: HTMLElement, optimization: TouchOptimization): void {
        const config = optimization.config;
        const handlers = optimization.handlers;

        // 最小タッチターゲットサイズの確保
        if (config.minSize) {
            const style = getComputedStyle(element);
            const currentWidth = parseInt(style.width) || 0;
            const currentHeight = parseInt(style.height) || 0;
            
            if (currentWidth < config.minSize || currentHeight < config.minSize) {
                element.style.minWidth = `${config.minSize}px`;
                element.style.minHeight = `${config.minSize}px`;
                element.style.padding = `${Math.max(0, (config.minSize - Math.min(currentWidth, currentHeight)) / 2)}px`;
            }
        }

        // ハプティックフィードバック対応
        if (config.hapticFeedback && this.deviceInfo?.vibrationSupport) {
            element.dataset.hapticFeedback = 'true';
        }

        // リップル効果
        if (config.rippleEffect) {
            element.classList.add('ripple-effect');
        }

        // タッチイベントハンドラーの設定
        if (handlers.tap) {
            this.addTouchHandler(element, 'tap', handlers.tap, config);
        }

        if (handlers.longPress) {
            this.addTouchHandler(element, 'longPress', handlers.longPress, config);
        }

        if (handlers.swipe) {
            this.addTouchHandler(element, 'swipe', handlers.swipe, config);
        }

        if (handlers.drag) {
            this.addTouchHandler(element, 'drag', handlers.drag, config);
        }
    }

    /**
     * タッチハンドラーの追加
     */
    addTouchHandler(element: HTMLElement, eventType: string, handler: Function, config: any): void {
        let touchStartTime = 0;
        let touchStartPos = { x: 0, y: 0 };
        let isDragging = false;
        let longPressTimer: number | null = null;

        const cleanup = () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            isDragging = false;
        };

        // タッチ開始
        element.addEventListener('touchstart', (e) => {
            if (config.preventDefaultTouch) {
                e.preventDefault();
            }

            touchStartTime = Date.now();
            const touch = e.touches[0];
            touchStartPos = { x: touch.clientX, y: touch.clientY };
            
            if (element.dataset.hapticFeedback === 'true') {
                this.triggerHapticFeedback('light');
            }

            // 長押し検出
            if (eventType === 'longPress') {
                longPressTimer = window.setTimeout(() => {
                    if (!isDragging) {
                        handler(e, { 
                            type: 'longPress', 
                            element, 
                            duration: Date.now() - touchStartTime 
                        });
                    }
                }, config.longPressTimeout || this.config.touch.longPressTimeout);
            }
        }, { passive: !config.preventDefaultTouch });

        // タッチ移動
        element.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const deltaX = touch.clientX - touchStartPos.x;
            const deltaY = touch.clientY - touchStartPos.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            if (distance > 10) {
                isDragging = true;
                cleanup();
                
                if (eventType === 'drag' && isDragging) {
                    handler(e, {
                        type: 'drag',
                        element,
                        delta: { x: deltaX, y: deltaY },
                        distance
                    });
                }

                // スワイプ検出
                if (eventType === 'swipe' && distance > (config.swipeThreshold || this.config.touch.swipeThreshold)) {
                    const direction = this.getSwipeDirection(deltaX, deltaY);
                    handler(e, {
                        type: 'swipe',
                        element,
                        direction,
                        distance,
                        delta: { x: deltaX, y: deltaY }
                    });
                    cleanup();
                }
            }
        }, { passive: !config.preventDefaultTouch });

        // タッチ終了
        element.addEventListener('touchend', (e) => {
            const touchDuration = Date.now() - touchStartTime;
            
            if (eventType === 'tap' && !isDragging && touchDuration < this.config.touch.tapTimeout) {
                handler(e, { 
                    type: 'tap', 
                    element, 
                    duration: touchDuration 
                });
            }

            cleanup();
        }, { passive: !config.preventDefaultTouch });

        // タッチキャンセル
        element.addEventListener('touchcancel', cleanup, { passive: true });
    }

    /**
     * スワイプ方向の判定
     */
    getSwipeDirection(deltaX: number, deltaY: number): string {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        if (absX > absY) {
            return deltaX > 0 ? 'right' : 'left';
        } else {
            return deltaY > 0 ? 'down' : 'up';
        }
    }

    /**
     * ハプティックフィードバックのトリガー
     */
    triggerHapticFeedback(type: string = 'light'): void {
        if (this.deviceInfo?.vibrationSupport) {
            switch(type) {
                case 'light':
                    navigator.vibrate(10);
                    break;
                case 'medium':
                    navigator.vibrate(20);
                    break;
                case 'heavy':
                    navigator.vibrate([10, 50, 10]);
                    break;
                case 'success':
                    navigator.vibrate([10, 20, 10]);
                    break;
                case 'error':
                    navigator.vibrate([50, 100, 50]);
                    break;
            }
        }
    }

    /**
     * 共有ボタンタップハンドラー
     */
    async handleShareButtonTap(event: Event, data: any): Promise<void> {
        try {
            this.triggerHapticFeedback('light');
            
            const shareData = this.extractShareDataFromElement(data.element);
            // モバイル最適化された共有フローを開始
            await this.startMobileOptimizedShareFlow(shareData);
        } catch (error) {
            this.triggerHapticFeedback('error');
            console.error('Share button tap failed:', error);
        }
    }

    /**
     * 共有ボタン長押しハンドラー
     */
    async handleShareButtonLongPress(event: Event, data: any): Promise<void> {
        this.triggerHapticFeedback('medium');
        
        // カスタマイズメニューを表示
        await this.showCustomizeMenu(data.element);
    }

    /**
     * 共有ボタンスワイプハンドラー
     */
    handleShareButtonSwipe(event: Event, data: any): void {
        // 右スワイプで即座にデフォルト共有
        if (data.direction === 'right') {
            this.triggerHapticFeedback('light');
            this.quickShare(data.element);
        }
        // 左スワイプでオプション表示
        else if (data.direction === 'left') {
            this.showShareOptions(data.element);
        }
    }

    /**
     * ダイアログスワイプハンドラー
     */
    handleDialogSwipeUp(event: Event, data: any): void {
        // Implementation for dialog swipe up
    }

    /**
     * ダイアログスワイプハンドラー
     */
    handleDialogSwipeDown(event: Event, data: any): void {
        // 下方向スワイプでダイアログを閉じる
        if (data.distance > 100) {
            this.triggerHapticFeedback('light');
            this.socialSharingManager.closeShareDialog();
        }
    }

    /**
     * ダイアログドラッグハンドラー
     */
    handleDialogDrag(event: Event, data: any): void {
        // Implementation for dialog drag
    }

    /**
     * プラットフォームボタンタップハンドラー
     */
    async handlePlatformButtonTap(event: Event, data: any): Promise<void> {
        this.triggerHapticFeedback('light');
        
        const platform = data.element.dataset.platform;
        const shareData = this.getCurrentShareData();
        await this.shareToMobilePlatform(platform, shareData);
    }

    /**
     * プラットフォームボタンホールドハンドラー
     */
    handlePlatformButtonHold(event: Event, data: any): void {
        // Implementation for platform button hold
    }

    /**
     * モバイル最適化共有フローの開始
     */
    async startMobileOptimizedShareFlow(shareData: any): Promise<any> {
        // Web Share API が利用可能な場合は優先使用
        if (this.deviceInfo?.webShareSupport && this.canUseWebShareAPI(shareData)) {
            return await this.shareViaWebShareAPI(shareData);
        }
        
        // モバイル最適化されたカスタムダイアログを表示
        return await this.showMobileOptimizedShareDialog(shareData);
    }

    /**
     * Web Share API使用可否判定
     */
    canUseWebShareAPI(shareData: any): boolean {
        if (!this.deviceInfo?.webShareSupport) {
            return false;
        }
        
        // 共有可能なデータかチェック
        const webShareData = this.convertToWebShareData(shareData);
        
        try {
            return this.deviceInfo.canShare ? this.deviceInfo.canShare(webShareData) : false;
        } catch (error) {
            return false;
        }
    }

    /**
     * Web Share APIデータ変換
     */
    convertToWebShareData(shareData: any): any {
        const webShareData = {
            title: this.generateShareTitle(shareData),
            text: this.generateShareText(shareData),
            url: this.generateShareURL(shareData)
        };
        
        // ファイル共有対応（スクリーンショット）
        if (shareData.screenshot && this.deviceInfo?.canShare && this.deviceInfo.canShare({ files: [] })) {
            // Blob変換は非同期で行う
            this.convertScreenshotToFile(shareData.screenshot).then(file => {
                if (file) {
                    (webShareData as any).files = [file];
                }
            });
        }
        
        return webShareData;
    }

    /**
     * レスポンシブ統合の設定
     */
    setupResponsiveIntegration(): void {
        window.addEventListener('resize', this.handleOrientationChange.bind(this));
        window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
        
        // ResponsiveCanvasManagerとの連携
        if (this.responsiveLayoutManager) {
            this.responsiveLayoutManager.addResponsiveHandler('social', {
                onBreakpointChange: this.handleBreakpointChange.bind(this),
                onOrientationChange: this.handleOrientationChange.bind(this)
            });
        }
    }

    /**
     * 画面向き変更時の処理
     */
    handleOrientationChange(): void {
        setTimeout(() => {
            // 共有ダイアログが開いている場合は位置を調整
            const shareDialog = document.querySelector('.share-dialog');
            
            if (shareDialog && (shareDialog as HTMLElement).style.display !== 'none') {
                this.adjustDialogForOrientation(shareDialog as HTMLElement);
            }
            
            // タッチターゲットサイズを再計算
            this.recalculateTouchTargets();
        }, 100); // 画面回転後の安定を待つ
    }

    /**
     * ブレークポイント変更時の処理
     */
    handleBreakpointChange(breakpoint: string): void {
        // ブレークポイントに応じた最適化を適用
        this.applyBreakpointOptimizations(breakpoint);
    }

    /**
     * モバイル最適化の有効化
     */
    enableMobileOptimizations(): void {
        document.body.classList.add('mobile-social-optimized');

        if (this.deviceInfo?.isIOS) {
            document.body.classList.add('ios-social-optimized');
        } else if (this.deviceInfo?.isAndroid) {
            document.body.classList.add('android-social-optimized');
        }
        
        // タッチ用スタイルの適用
        this.applyMobileTouchStyles();
        
        // パフォーマンス最適化の適用
        this.applyPerformanceOptimizations();
    }

    /**
     * モバイルタッチスタイルの適用
     */
    applyMobileTouchStyles(): void {
        const style = document.createElement('style');
        style.textContent = `
            .mobile-social-optimized .share-button {
                min-width: ${this.config.touch.minTouchTargetSize}px;
                min-height: ${this.config.touch.minTouchTargetSize}px;
                touch-action: manipulation;
                user-select: none;
                -webkit-user-select: none;
                -webkit-tap-highlight-color: transparent;
            }
            
            .mobile-social-optimized .share-dialog {
                touch-action: pan-y;
            }
            
            .mobile-social-optimized .platform-button {
                min-width: 56px;
                min-height: 56px;
                margin: 8px;
                touch-action: manipulation;
            }
            
            .ripple-effect {
                position: relative;
                overflow: hidden;
            }

            .ripple-effect::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                transform: translate(-50%, -50%);
                transition: width 0.3s, height 0.3s;
            }
            
            .ripple-effect:active::after {
                width: 200%;
                height: 200%;
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * パフォーマンス最適化の適用
     */
    applyPerformanceOptimizations(): void {
        if (this.config.performance.throttleUpdates) {
            // UI更新の間引き
            this.setupUpdateThrottling();
        }
        
        if (this.config.performance.optimizeImages) {
            // 画像最適化
            this.setupImageOptimization();
        }
        
        if (this.config.performance.lazyLoadContent) {
            // 遅延読み込み
            this.setupLazyLoading();
        }
    }

    /**
     * 要素追加の監視
     */
    observeElementAddition(selector: string, callback: (element: Element) => void): MutationObserver {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node as Element;
                        
                        if (element.matches && element.matches(selector)) {
                            callback(element);
                        }
                        
                        const matches = element.querySelectorAll && element.querySelectorAll(selector);
                        if (matches) {
                            matches.forEach(callback);
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        return observer;
    }

    /**
     * エラーハンドラーの設定
     */
    setErrorHandler(errorHandler: any): void {
        this.errorHandler = errorHandler;
    }

    /**
     * クリーンアップ
     */
    cleanup(): void {
        // イベントリスナーの削除
        this.touchOptimizations.clear();
        this.gestureHandlers.clear();
        document.body.classList.remove('mobile-social-optimized', 'ios-social-optimized', 'android-social-optimized');
        this.isInitialized = false;
    }

    // Helper methods (simplified implementations)
    private extractShareDataFromElement(element: HTMLElement): any {
        // Implementation for extracting share data
        return {};
    }

    private async showCustomizeMenu(element: HTMLElement): Promise<void> {
        // Implementation for showing customize menu
    }

    private quickShare(element: HTMLElement): void {
        // Implementation for quick share
    }

    private showShareOptions(element: HTMLElement): void {
        // Implementation for showing share options
    }

    private getCurrentShareData(): any {
        // Implementation for getting current share data
        return {};
    }

    private async shareToMobilePlatform(platform: string, shareData: any): Promise<void> {
        // Implementation for sharing to mobile platform
    }

    private async shareViaWebShareAPI(shareData: any): Promise<any> {
        // Implementation for Web Share API
    }

    private async showMobileOptimizedShareDialog(shareData: any): Promise<any> {
        // Implementation for mobile optimized share dialog
    }

    private generateShareTitle(shareData: any): string {
        // Implementation for generating share title
        return '';
    }

    private generateShareText(shareData: any): string {
        // Implementation for generating share text
        return '';
    }

    private generateShareURL(shareData: any): string {
        // Implementation for generating share URL
        return '';
    }

    private async convertScreenshotToFile(screenshot: any): Promise<File | null> {
        // Implementation for converting screenshot to file
        return null;
    }

    private adjustDialogForOrientation(dialog: HTMLElement): void {
        // Implementation for adjusting dialog for orientation
    }

    private recalculateTouchTargets(): void {
        // Implementation for recalculating touch targets
    }

    private applyBreakpointOptimizations(breakpoint: string): void {
        // Implementation for applying breakpoint optimizations
    }

    private setupUpdateThrottling(): void {
        // Implementation for update throttling
    }

    private setupImageOptimization(): void {
        // Implementation for image optimization
    }

    private setupLazyLoading(): void {
        // Implementation for lazy loading
    }
}