/**
 * ブラウザ互換性とデバイス対応ユーティリティ
 */

// 型定義
interface BrowserInfo {
    name: string;
    version: string;
    engine: string;
}

interface ScreenInfo {
    width: number;
    height: number;
    availWidth: number;
    availHeight: number;
    pixelRatio: number;
}

interface DeviceInfo {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isTouchDevice: boolean;
    screenInfo: ScreenInfo;
    orientation: string;
}

interface Features {
    canvas: boolean;
    webAudio: boolean;
    localStorage: boolean;
    requestAnimationFrame: boolean;
    touchEvents: boolean;
    pointerEvents: boolean;
    webGL: boolean;
    offscreenCanvas: boolean;
    intersectionObserver: boolean;
    performanceObserver: boolean;
}

interface CanvasSize {
    displayWidth: number;
    displayHeight: number;
    actualWidth: number;
    actualHeight: number;
    pixelRatio: number;
}

interface CompatibilityReport {
    browser: BrowserInfo;
    device: DeviceInfo;
    features: Features;
    recommendations: string[];
    warnings: string[];
}

// グローバルオブジェクトの型拡張
declare global {
    interface Window {
        webkitAudioContext?: typeof AudioContext;
        webkitRequestAnimationFrame?: (callback: FrameRequestCallback) => number;
        mozRequestAnimationFrame?: (callback: FrameRequestCallback) => number;
        msRequestAnimationFrame?: (callback: FrameRequestCallback) => number;
        webkitCancelAnimationFrame?: (handle: number) => void;
        mozCancelAnimationFrame?: (handle: number) => void;
        msCancelAnimationFrame?: (handle: number) => void;
        msMaxTouchPoints?: number;
    }
}

export class BrowserCompatibility {
    private userAgent: string;
    private browserInfo: BrowserInfo;
    private deviceInfo: DeviceInfo;
    private features: Features;

    constructor() {
        this.userAgent = navigator.userAgent;
        this.browserInfo = this.detectBrowser();
        this.deviceInfo = this.detectDevice();
        this.features = this.detectFeatures();
        this.initializeCompatibilityFixes();
    }
    
    /**
     * ブラウザを検出
     */
    private detectBrowser(): BrowserInfo {
        const ua = this.userAgent;
        
        // Edge (Chromium-based)
        if (ua.includes('Edg/')) {
            return {
                name: 'edge',
                version: this.extractVersion(ua, 'Edg/'),
                engine: 'blink'
            };
        }

        // Chrome
        if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
            return {
                name: 'chrome',
                version: this.extractVersion(ua, 'Chrome/'),
                engine: 'blink'
            };
        }

        // Firefox
        if (ua.includes('Firefox/')) {
            return {
                name: 'firefox',
                version: this.extractVersion(ua, 'Firefox/'),
                engine: 'gecko'
            };
        }

        // Safari
        if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
            return {
                name: 'safari',
                version: this.extractVersion(ua, 'Version/'),
                engine: 'webkit'
            };
        }

        // Internet Explorer
        if (ua.includes('MSIE') || ua.includes('Trident/')) {
            return {
                name: 'ie',
                version: ua.includes('MSIE') ? 
                    this.extractVersion(ua, 'MSIE ') : 
                    this.extractVersion(ua, 'rv:'),
                engine: 'trident'
            };
        }

        return {
            name: 'unknown',
            version: '0',
            engine: 'unknown'
        };
    }
    
    /**
     * デバイスタイプを検出
     */
    private detectDevice(): DeviceInfo {
        const ua = this.userAgent;
        
        // モバイルデバイス検出
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
        
        // タブレット検出
        const isTablet = /iPad|Android(?!.*Mobile)|Tablet/i.test(ua) || 
                         (isMobile && window.screen.width >= 768);
        
        // タッチデバイス検出
        const isTouchDevice = 'ontouchstart' in window || 
                             navigator.maxTouchPoints > 0 || 
                             (window.msMaxTouchPoints || 0) > 0;
        
        // 画面サイズ情報
        const screenInfo: ScreenInfo = {
            width: window.screen.width,
            height: window.screen.height,
            availWidth: window.screen.availWidth,
            availHeight: window.screen.availHeight,
            pixelRatio: window.devicePixelRatio || 1
        };

        return {
            isMobile,
            isTablet,
            isDesktop: !isMobile && !isTablet,
            isTouchDevice,
            screenInfo,
            orientation: this.getOrientation()
        };
    }
    
    /**
     * 画面の向きを取得
     */
    private getOrientation(): string {
        if ('orientation' in screen && screen.orientation && typeof screen.orientation === 'object' && 'type' in screen.orientation) {
            return (screen.orientation as ScreenOrientation).type;
        } else if ('orientation' in window && typeof (window as any).orientation === 'number') {
            return Math.abs((window as any).orientation) === 90 ? 'landscape' : 'portrait';
        } else {
            return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
        }
    }
    
    /**
     * ブラウザ機能を検出
     */
    private detectFeatures(): Features {
        return {
            canvas: this.supportsCanvas(),
            webAudio: this.supportsWebAudio(),
            localStorage: this.supportsLocalStorage(),
            requestAnimationFrame: this.supportsRequestAnimationFrame(),
            touchEvents: this.supportsTouchEvents(),
            pointerEvents: this.supportsPointerEvents(),
            webGL: this.supportsWebGL(),
            offscreenCanvas: this.supportsOffscreenCanvas(),
            intersectionObserver: this.supportsIntersectionObserver(),
            performanceObserver: this.supportsPerformanceObserver()
        };
    }
    
    /**
     * Canvas サポート確認
     */
    private supportsCanvas(): boolean {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext && canvas.getContext('2d'));
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Web Audio API サポート確認
     */
    private supportsWebAudio(): boolean {
        return !!(window.AudioContext || window.webkitAudioContext);
    }
    
    /**
     * LocalStorage サポート確認
     */
    private supportsLocalStorage(): boolean {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * requestAnimationFrame サポート確認
     */
    private supportsRequestAnimationFrame(): boolean {
        return !!(window.requestAnimationFrame || 
                 window.webkitRequestAnimationFrame || 
                 window.mozRequestAnimationFrame || 
                 window.msRequestAnimationFrame);
    }
    
    /**
     * タッチイベント サポート確認
     */
    private supportsTouchEvents(): boolean {
        return 'ontouchstart' in window;
    }
    
    /**
     * ポインターイベント サポート確認
     */
    private supportsPointerEvents(): boolean {
        return 'onpointerdown' in window;
    }
    
    /**
     * WebGL サポート確認
     */
    private supportsWebGL(): boolean {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    }
    
    /**
     * OffscreenCanvas サポート確認
     */
    private supportsOffscreenCanvas(): boolean {
        return typeof OffscreenCanvas !== 'undefined';
    }
    
    /**
     * IntersectionObserver サポート確認
     */
    private supportsIntersectionObserver(): boolean {
        return 'IntersectionObserver' in window;
    }
    
    /**
     * PerformanceObserver サポート確認
     */
    private supportsPerformanceObserver(): boolean {
        return 'PerformanceObserver' in window;
    }
    
    /**
     * バージョン番号を抽出
     */
    private extractVersion(ua: string, prefix: string): string {
        const index = ua.indexOf(prefix);
        if (index === -1) return '0';

        const version = ua.substring(index + prefix.length);
        const match = version.match(/^(\d+(?:\.\d+)*)/);
        return match ? match[1] : '0';
    }
    
    /**
     * 互換性修正を初期化
     */
    private initializeCompatibilityFixes(): void {
        this.setupRequestAnimationFramePolyfill();
        this.setupConsolePolyfill();
        this.setupPerformancePolyfill();
        this.setupTouchEventFixes();
    }
    
    /**
     * requestAnimationFrame ポリフィル
     */
    private setupRequestAnimationFramePolyfill(): void {
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = 
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function(callback: FrameRequestCallback): number {
                    return window.setTimeout(callback, 1000 / 60);
                };
        }
        
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = 
                window.webkitCancelAnimationFrame ||
                window.mozCancelAnimationFrame ||
                window.msCancelAnimationFrame ||
                function(id: number): void {
                    window.clearTimeout(id);
                };
        }
    }

    /**
     * Console ポリフィル
     */
    private setupConsolePolyfill(): void {
        if (!window.console) {
            (window as any).console = {
                log() {},
                error() {},
                warn() {},
                info() {}
            };
        }
    }
    
    /**
     * Performance ポリフィル
     */
    private setupPerformancePolyfill(): void {
        if (!window.performance) {
            (window as any).performance = {};
        }
        
        if (!window.performance.now) {
            window.performance.now = function(): number {
                return Date.now();
            };
        }
    }
    
    /**
     * タッチイベント修正
     */
    private setupTouchEventFixes(): void {
        if (this.browserInfo.name === 'safari' && this.deviceInfo.isMobile) {
            // パッシブリスナーの設定
            this.setupPassiveEventListeners();
        }
        
        if (this.browserInfo.name === 'chrome' && this.deviceInfo.isMobile) {
            this.setupTouchDelayFix();
        }
    }
    
    /**
     * パッシブイベントリスナーの設定
     */
    private setupPassiveEventListeners(): void {
        document.addEventListener('touchstart', function(e: TouchEvent) {
            // ゲームエリア内でのみデフォルト動作を防ぐ
            if ((e.target as HTMLElement).tagName === 'CANVAS') {
                e.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('touchmove', function(e: TouchEvent) {
            if ((e.target as HTMLElement).tagName === 'CANVAS') {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    /**
     * タッチ遅延修正
     */
    private setupTouchDelayFix(): void {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, user-scalable=no';

        const existingMeta = document.querySelector('meta[name="viewport"]');
        if (existingMeta && existingMeta.parentNode) {
            existingMeta.parentNode.replaceChild(meta, existingMeta);
        } else {
            document.head.appendChild(meta);
        }
    }
    
    /**
     * 最適なCanvas サイズを計算
     */
    calculateOptimalCanvasSize(): CanvasSize {
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        const devicePixelRatio = this.deviceInfo.screenInfo.pixelRatio;
        
        // デバイスタイプに応じたサイズ調整
        let canvasSize: { width: number; height: number };
        if (this.deviceInfo.isMobile) {
            // モバイル: 画面の90%を使用
            canvasSize = {
                width: Math.min(viewport.width * 0.9, 400),
                height: Math.min(viewport.height * 0.7, 300)
            };
        } else if (this.deviceInfo.isTablet) {
            // タブレット: 画面の80%を使用
            canvasSize = {
                width: Math.min(viewport.width * 0.8, 600),
                height: Math.min(viewport.height * 0.8, 450)
            };
        } else {
            // デスクトップ: 固定サイズまたは画面の70%
            canvasSize = {
                width: Math.min(viewport.width * 0.7, 800),
                height: Math.min(viewport.height * 0.7, 600)
            };
        }
        
        // アスペクト比を維持
        const aspectRatio = 4 / 3; // 800:600
        if (canvasSize.width / canvasSize.height > aspectRatio) {
            canvasSize.width = canvasSize.height * aspectRatio;
        } else {
            canvasSize.height = canvasSize.width / aspectRatio;
        }
        
        return {
            displayWidth: Math.floor(canvasSize.width),
            displayHeight: Math.floor(canvasSize.height),
            actualWidth: Math.floor(canvasSize.width * devicePixelRatio),
            actualHeight: Math.floor(canvasSize.height * devicePixelRatio),
            pixelRatio: devicePixelRatio
        };
    }
    
    /**
     * フォールバック UI を表示
     */
    showFallbackUI(): void {
        const fallbackDiv = document.createElement('div');
        fallbackDiv.id = 'fallback-ui';

        fallbackDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0,0,0,0.9);
                color: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                font-family: Arial, sans-serif;
                z-index: 1000;
            ">
                <h2>ブラウザ非対応</h2>
                <p>申し訳ございませんが、お使いのブラウザはこのゲームに対応していません。</p>
                <p>以下のブラウザでお試しください：</p>
                <ul style="text-align: left; display: inline-block;">
                    <li>Google Chrome (推奨)</li>
                    <li>Mozilla Firefox</li>
                    <li>Microsoft Edge</li>
                    <li>Safari (iOS/macOS)</li>
                </ul>
                <button onclick="this.parentElement.parentElement.remove()"
                        style="margin-top: 10px; padding: 10px 20px; font-size: 16px;">
                    閉じる
                </button>
            </div>
        `;
        
        document.body.appendChild(fallbackDiv);
    }
    
    /**
     * 互換性レポートを生成
     */
    generateCompatibilityReport(): CompatibilityReport {
        return {
            browser: this.browserInfo,
            device: this.deviceInfo,
            features: this.features,
            recommendations: this.getRecommendations(),
            warnings: this.getWarnings()
        };
    }
    
    /**
     * 推奨事項を取得
     */
    private getRecommendations(): string[] {
        const recommendations: string[] = [];

        if (!this.features.canvas) {
            recommendations.push('Canvas API が利用できません。ブラウザを更新してください。');
        }

        if (!this.features.webAudio) {
            recommendations.push('Web Audio API が利用できません。音声機能が制限されます。');
        }

        if (!this.features.localStorage) {
            recommendations.push('LocalStorage が利用できません。進行状況が保存されません。');
        }

        if (this.browserInfo.name === 'ie') {
            recommendations.push('Internet Explorer は非推奨です。モダンブラウザの使用を推奨します。');
        }

        if (this.deviceInfo.isMobile && this.deviceInfo.screenInfo.width < 375) {
            recommendations.push('画面が小さすぎる可能性があります。横向きでのプレイを推奨します。');
        }
        
        return recommendations;
    }
    
    /**
     * 警告を取得
     */
    private getWarnings(): string[] {
        const warnings: string[] = [];

        if (this.deviceInfo.screenInfo.pixelRatio > 2) {
            warnings.push('高解像度ディスプレイが検出されました。パフォーマンスに影響する可能性があります。');
        }

        if (this.deviceInfo.isMobile && !this.features.touchEvents) {
            warnings.push('タッチイベントが利用できません。操作に問題が生じる可能性があります。');
        }

        if (!this.features.requestAnimationFrame) {
            warnings.push('requestAnimationFrame が利用できません。アニメーションが滑らかでない可能性があります。');
        }
        
        return warnings;
    }
    
    /**
     * デバッグ情報を出力
     */
    logDebugInfo(): void {
        const report = this.generateCompatibilityReport();
        console.group('Browser Compatibility Report');
        console.log('Browser:', report.browser);
        console.log('Device:', report.device);
        console.log('Features:', report.features);
        console.log('Recommendations:', report.recommendations);
        console.log('Warnings:', report.warnings);
        console.groupEnd();
    }

    // Getters for external access
    getBrowserInfo(): BrowserInfo {
        return this.browserInfo;
    }

    getDeviceInfo(): DeviceInfo {
        return this.deviceInfo;
    }

    getFeatures(): Features {
        return this.features;
    }
}

// シングルトンインスタンス（遅延初期化）
let _browserCompatibility: BrowserCompatibility | null = null;

export function getBrowserCompatibility(): BrowserCompatibility {
    if (!_browserCompatibility) {
        _browserCompatibility = new BrowserCompatibility();
    }
    return _browserCompatibility;
}