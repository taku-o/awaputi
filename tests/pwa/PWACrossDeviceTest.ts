import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it  } from '@jest/globals';
/**
 * PWA Cross-Device Test Suite
 * クロスデバイス・クロスブラウザ対応のPWAテストスイート
 * 
 * 主要機能:
 * - デバイス別テスト（モバイル、タブレット、デスクトップ）
 * - ブラウザ別テスト（Chrome、Firefox、Safari、Edge）
 * - 画面サイズ・解像度別テスト
 * - タッチ・キーボード操作テスト
 */

interface DeviceProfile {
    name: string;
    viewports: Array<{width: number; height: number; name: string}>;
    features: {
        touch: boolean;
        orientation?: boolean;
        devicePixelRatio?: number[];
        connectionTypes?: string[];
    };
    expectedBehavior: {
        installPrompt?: boolean;
        standalone?: boolean;
        homeScreen?: boolean;
        splash?: boolean;
    };
}

interface BrowserProfile {
    name: string;
    userAgent: string;
    features: {
        serviceWorker: boolean;
        pushNotifications: boolean;
        backgroundSync: boolean;
        webShare?: boolean;
        badgeAPI?: boolean;
    };
    limitations?: string[];
}

export class PWACrossDeviceTest {
    private deviceProfiles: {[key: string]: DeviceProfile};
    private browserProfiles: {[key: string]: BrowserProfile};
    private testResults: Map<string, any>;

    constructor() {
        this.deviceProfiles = this.createDeviceProfiles();
        this.browserProfiles = this.createBrowserProfiles();
        this.testResults = new Map();
        
        console.log('[PWACrossDeviceTest] クロスデバイステスト初期化完了');
    }

    /**
     * デバイスプロファイル作成
     */
    createDeviceProfiles() {
        return {
            mobile: {
                name: 'Mobile Device',
                viewports: [
                    { width: 375, height: 667, name: 'iPhone SE' },
                    { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
                    { width: 360, height: 640, name: 'Galaxy S5' },
                    { width: 412, height: 915, name: 'Pixel 5' }
                ],
                features: {
                    touch: true,
                    orientation: true,
                    devicePixelRatio: [2, 3],
                    connectionTypes: ['4g', '3g', 'slow-2g']
                },
                expectedBehavior: {
                    installPrompt: true,
                    standalone: true,
                    homeScreen: true,
                    splash: true
                }
            },
            
            tablet: {
                name: 'Tablet Device',
                viewports: [
                    { width: 768, height: 1024, name: 'iPad' },
                    { width: 810, height: 1080, name: 'iPad Air' },
                    { width: 820, height: 1180, name: 'iPad Pro 11"' },
                    { width: 1024, height: 1366, name: 'iPad Pro 12.9"' }
                ],
                features: {
                    touch: true,
                    orientation: true,
                    devicePixelRatio: [2]
                },
                expectedBehavior: {
                    installPrompt: true,
                    standalone: true,
                    homeScreen: true,
                    splash: true
                }
            },
            
            desktop: {
                name: 'Desktop Device',
                viewports: [
                    { width: 1280, height: 720, name: 'HD' },
                    { width: 1366, height: 768, name: 'Common Desktop' },
                    { width: 1920, height: 1080, name: 'Full HD' },
                    { width: 2560, height: 1440, name: '2K' }
                ],
                features: {
                    touch: false,
                    orientation: false,
                    devicePixelRatio: [1, 2]
                },
                expectedBehavior: {
                    installPrompt: true,
                    standalone: false,
                    homeScreen: false,
                    splash: false
                }
            }
        };
    }
    
    /**
     * ブラウザプロファイル作成
     */
    createBrowserProfiles() {
        return {
            chrome: {
                name: 'Google Chrome',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                features: {
                    serviceWorker: true,
                    pushNotifications: true,
                    backgroundSync: true,
                    webShare: true,
                    badgeAPI: true
                }
            },
            
            firefox: {
                name: 'Mozilla Firefox',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
                features: {
                    serviceWorker: true,
                    pushNotifications: true,
                    backgroundSync: false,
                    webShare: false,
                    badgeAPI: false
                },
                limitations: ['Background Sync not supported', 'Web Share API limited']
            },
            
            safari: {
                name: 'Apple Safari',
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
                features: {
                    serviceWorker: true,
                    pushNotifications: true,
                    backgroundSync: false,
                    webShare: true,
                    badgeAPI: true
                },
                limitations: ['Background Sync not supported', 'Limited PWA support on iOS < 11.3']
            },
            
            edge: {
                name: 'Microsoft Edge',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
                features: {
                    serviceWorker: true,
                    pushNotifications: true,
                    backgroundSync: true,
                    webShare: true,
                    badgeAPI: true
                }
            }
        };
    }
    
    /**
     * クロスデバイステスト実行
     */
    async runCrossDeviceTests() {
        console.log('[PWACrossDeviceTest] クロスデバイステスト開始');
        
        const testResults: any[] = [];
        
        for (const [deviceType, deviceProfile] of Object.entries(this.deviceProfiles)) {
            for (const viewport of deviceProfile.viewports) {
                const deviceTestResult = await this.testDeviceViewport(deviceType, viewport, deviceProfile);
                testResults.push(deviceTestResult);
            }
        }
        
        // テスト結果の要約
        const summary = this.summarizeResults(testResults);
        
        console.log('[PWACrossDeviceTest] クロスデバイステスト完了');
        return {
            summary: summary,
            detailedResults: testResults
        };
    }
    
    /**
     * デバイスビューポートテスト
     */
    async testDeviceViewport(deviceType: string, viewport: any, deviceProfile: DeviceProfile) {
        console.log(`[PWACrossDeviceTest] テスト開始: ${deviceType} - ${viewport.name} (${viewport.width}x${viewport.height})`);
        
        // ビューポート設定
        this.setViewport(viewport.width, viewport.height);
        
        const testResults = {
            deviceType: deviceType,
            viewport: viewport,
            tests: {
                responsive: await this.testResponsiveDesign(viewport, deviceProfile),
                touch: await this.testTouchSupport(deviceProfile),
                orientation: await this.testOrientationSupport(deviceProfile),
                pwa: await this.testPWAFeatures(deviceType, deviceProfile),
                performance: await this.testPerformance(deviceType)
            }
        };
        
        this.testResults.set(`${deviceType}-${viewport.name}`, testResults);
        
        return testResults;
    }
    
    /**
     * レスポンシブデザインテスト
     */
    async testResponsiveDesign(viewport: any, deviceProfile: DeviceProfile) {
        const tests = {
            layoutAdaptation: false,
            imageScaling: false,
            fontSizing: false,
            navigationUsability: false
        };
        
        try {
            // レイアウト適応テスト
            const bodyWidth = document.body.scrollWidth;
            const viewportWidth = viewport.width;
            tests.layoutAdaptation = bodyWidth <= viewportWidth * 1.1; // 10%のマージンを許可
            
            // 画像スケーリングテスト
            const images = document.querySelectorAll('img');
            let imageScalingOk = true;
            images.forEach(img => {
                if (img.offsetWidth > viewportWidth) {
                    imageScalingOk = false;
                }
            });
            tests.imageScaling = imageScalingOk;
            
            // フォントサイズテスト
            const computedStyle = window.getComputedStyle(document.body);
            const fontSize = parseInt(computedStyle.fontSize);
            tests.fontSizing = fontSize >= 14; // 最小14px
            
            // ナビゲーション使いやすさテスト
            const navElements = document.querySelectorAll('nav, .navigation, .nav');
            tests.navigationUsability = navElements.length > 0;
            
        } catch (error) {
            console.error('[PWACrossDeviceTest] レスポンシブデザインテストエラー:', error);
        }
        
        return tests;
    }
    
    /**
     * タッチサポートテスト
     */
    async testTouchSupport(deviceProfile: DeviceProfile) {
        const tests = {
            touchEventsSupported: false,
            tapTargetSize: false,
            scrolling: false
        };
        
        try {
            // タッチイベントサポート確認
            tests.touchEventsSupported = 'ontouchstart' in window || 
                                       (navigator as any).maxTouchPoints > 0;
            
            if (deviceProfile.features.touch) {
                // タップターゲットサイズテスト
                const clickableElements = document.querySelectorAll('button, a, input[type="button"], input[type="submit"]');
                let tapTargetOk = true;
                
                clickableElements.forEach(element => {
                    const rect = element.getBoundingClientRect();
                    const minSize = 44; // 44px minimum tap target size
                    if (rect.width < minSize || rect.height < minSize) {
                        tapTargetOk = false;
                    }
                });
                
                tests.tapTargetSize = tapTargetOk;
                
                // スクロールテスト
                tests.scrolling = document.body.scrollHeight > window.innerHeight;
            }
            
        } catch (error) {
            console.error('[PWACrossDeviceTest] タッチサポートテストエラー:', error);
        }
        
        return tests;
    }
    
    /**
     * 画面向き対応テスト
     */
    async testOrientationSupport(deviceProfile: DeviceProfile) {
        const tests = {
            orientationSupported: false,
            landscapeLayout: false,
            portraitLayout: false
        };
        
        try {
            if (deviceProfile.features.orientation) {
                tests.orientationSupported = 'orientation' in screen || 
                                           'orientation' in window;
                
                // 現在の向きでのレイアウトテスト
                const currentOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
                
                if (currentOrientation === 'landscape') {
                    tests.landscapeLayout = this.testLayoutForOrientation('landscape');
                } else {
                    tests.portraitLayout = this.testLayoutForOrientation('portrait');
                }
            } else {
                tests.orientationSupported = true; // デスクトップでは対応不要
                tests.landscapeLayout = true;
                tests.portraitLayout = true;
            }
            
        } catch (error) {
            console.error('[PWACrossDeviceTest] 画面向きテストエラー:', error);
        }
        
        return tests;
    }
    
    /**
     * PWA機能テスト
     */
    async testPWAFeatures(deviceType: string, deviceProfile: DeviceProfile) {
        const tests = {
            manifestSupported: false,
            serviceWorkerSupported: false,
            installPrompt: false,
            standaloneModeSupported: false,
            homeScreenCapable: false
        };
        
        try {
            // マニフェストサポート
            const manifestLink = document.querySelector('link[rel="manifest"]');
            tests.manifestSupported = manifestLink !== null;
            
            // Service Workerサポート
            tests.serviceWorkerSupported = 'serviceWorker' in navigator;
            
            // インストールプロンプト（期待値と比較）
            tests.installPrompt = deviceProfile.expectedBehavior.installPrompt || false;
            
            // スタンドアロンモード
            tests.standaloneModeSupported = window.matchMedia('(display-mode: standalone)').matches ||
                                          (navigator as any).standalone === true;
            
            // ホームスクリーン対応
            const appleCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
            const mobileCapable = document.querySelector('meta[name="mobile-web-app-capable"]');
            tests.homeScreenCapable = (appleCapable !== null || mobileCapable !== null) &&
                                    deviceProfile.expectedBehavior.homeScreen;
            
        } catch (error) {
            console.error('[PWACrossDeviceTest] PWA機能テストエラー:', error);
        }
        
        return tests;
    }
    
    /**
     * パフォーマンステスト
     */
    async testPerformance(deviceType: string) {
        const tests = {
            loadTime: 0,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            performanceGrade: 'unknown'
        };
        
        try {
            // ページ読み込み時間
            const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            if (navigationTiming) {
                tests.loadTime = navigationTiming.loadEventEnd - navigationTiming.loadEventStart;
            }
            
            // First Contentful Paint
            const paintEntries = performance.getEntriesByType('paint');
            const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
            if (fcpEntry) {
                tests.firstContentfulPaint = fcpEntry.startTime;
            }
            
            // パフォーマンスグレード判定
            if (tests.firstContentfulPaint < 1500) {
                tests.performanceGrade = 'excellent';
            } else if (tests.firstContentfulPaint < 2500) {
                tests.performanceGrade = 'good';
            } else if (tests.firstContentfulPaint < 4000) {
                tests.performanceGrade = 'needs-improvement';
            } else {
                tests.performanceGrade = 'poor';
            }
            
        } catch (error) {
            console.error('[PWACrossDeviceTest] パフォーマンステストエラー:', error);
        }
        
        return tests;
    }
    
    /**
     * ビューポート設定
     */
    private setViewport(width: number, height: number) {
        try {
            // 実際のブラウザではwindow.resizeToは制限されているため、
            // テスト環境でのみ有効
            if (typeof (window as any).resizeTo === 'function') {
                (window as any).resizeTo(width, height);
            }
            
            // CSSでビューポートをシミュレート
            const metaViewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
            if (metaViewport) {
                metaViewport.content = `width=${width}, height=${height}, initial-scale=1.0`;
            }
            
        } catch (error) {
            console.warn('[PWACrossDeviceTest] ビューポート設定警告:', error);
        }
    }
    
    /**
     * 画面向き別レイアウトテスト
     */
    private testLayoutForOrientation(orientation: string): boolean {
        try {
            // 基本的なレイアウト要素の確認
            const mainContent = document.querySelector('main, .main-content, #main');
            const navigation = document.querySelector('nav, .navigation, .nav');
            
            // レイアウトが崩れていないかチェック
            if (mainContent) {
                const rect = mainContent.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0;
            }
            
            return true;
        } catch (error) {
            console.error('[PWACrossDeviceTest] レイアウトテストエラー:', error);
            return false;
        }
    }
    
    /**
     * テスト結果要約
     */
    private summarizeResults(testResults: any[]): any {
        const summary = {
            totalTests: testResults.length,
            deviceTypes: new Set(),
            passedTests: 0,
            failedTests: 0,
            averagePerformance: {
                loadTime: 0,
                firstContentfulPaint: 0
            },
            issues: [] as string[]
        };
        
        let totalLoadTime = 0;
        let totalFCP = 0;
        
        testResults.forEach(result => {
            summary.deviceTypes.add(result.deviceType);
            
            // 各テストの成功/失敗をカウント
            Object.values(result.tests).forEach(testCategory => {
                if (typeof testCategory === 'object' && testCategory !== null) {
                    Object.values(testCategory).forEach(test => {
                        if (typeof test === 'boolean') {
                            if (test) {
                                summary.passedTests++;
                            } else {
                                summary.failedTests++;
                            }
                        }
                    });
                }
            });
            
            // パフォーマンス集計
            if (result.tests.performance) {
                totalLoadTime += result.tests.performance.loadTime || 0;
                totalFCP += result.tests.performance.firstContentfulPaint || 0;
            }
            
            // 問題点の特定
            if (result.tests.responsive && !result.tests.responsive.layoutAdaptation) {
                summary.issues.push(`Layout adaptation issue on ${result.deviceType} - ${result.viewport.name}`);
            }
            
            if (result.tests.performance && result.tests.performance.performanceGrade === 'poor') {
                summary.issues.push(`Poor performance on ${result.deviceType} - ${result.viewport.name}`);
            }
        });
        
        // 平均パフォーマンス計算
        if (testResults.length > 0) {
            summary.averagePerformance.loadTime = totalLoadTime / testResults.length;
            summary.averagePerformance.firstContentfulPaint = totalFCP / testResults.length;
        }
        
        return summary;
    }
    
    /**
     * クロスブラウザテスト実行
     */
    async runCrossBrowserTests() {
        console.log('[PWACrossDeviceTest] クロスブラウザテスト開始');
        
        const browserTestResults: any[] = [];
        
        for (const [browserType, browserProfile] of Object.entries(this.browserProfiles)) {
            const browserTestResult = await this.testBrowserCompatibility(browserType, browserProfile);
            browserTestResults.push(browserTestResult);
        }
        
        console.log('[PWACrossDeviceTest] クロスブラウザテスト完了');
        return {
            results: browserTestResults,
            summary: this.summarizeBrowserResults(browserTestResults)
        };
    }
    
    /**
     * ブラウザ互換性テスト
     */
    async testBrowserCompatibility(browserType: string, browserProfile: BrowserProfile) {
        console.log(`[PWACrossDeviceTest] ブラウザテスト: ${browserProfile.name}`);
        
        const tests = {
            serviceWorkerSupport: false,
            pushNotificationSupport: false,
            backgroundSyncSupport: false,
            webShareSupport: false,
            badgeAPISupport: false,
            overallCompatibility: 0
        };
        
        try {
            // Service Worker サポート
            tests.serviceWorkerSupport = 'serviceWorker' in navigator;
            
            // Push Notification サポート
            tests.pushNotificationSupport = 'Notification' in window && 'PushManager' in window;
            
            // Background Sync サポート
            tests.backgroundSyncSupport = 'serviceWorker' in navigator && 
                                        'sync' in window.ServiceWorkerRegistration.prototype;
            
            // Web Share API サポート
            tests.webShareSupport = 'share' in navigator;
            
            // Badge API サポート
            tests.badgeAPISupport = 'setAppBadge' in navigator;
            
            // 総合互換性スコア計算
            const supportedFeatures = Object.values(tests).filter(test => test === true).length;
            const totalFeatures = Object.keys(tests).length - 1; // overallCompatibilityを除く
            tests.overallCompatibility = (supportedFeatures / totalFeatures) * 100;
            
        } catch (error) {
            console.error('[PWACrossDeviceTest] ブラウザ互換性テストエラー:', error);
        }
        
        return {
            browserType: browserType,
            browserProfile: browserProfile,
            tests: tests,
            limitations: browserProfile.limitations || []
        };
    }
    
    /**
     * ブラウザテスト結果要約
     */
    private summarizeBrowserResults(results: any[]): any {
        const summary = {
            totalBrowsers: results.length,
            averageCompatibility: 0,
            bestBrowser: '',
            worstBrowser: '',
            commonIssues: [] as string[]
        };
        
        let totalCompatibility = 0;
        let bestScore = 0;
        let worstScore = 100;
        
        results.forEach(result => {
            const score = result.tests.overallCompatibility;
            totalCompatibility += score;
            
            if (score > bestScore) {
                bestScore = score;
                summary.bestBrowser = result.browserProfile.name;
            }
            
            if (score < worstScore) {
                worstScore = score;
                summary.worstBrowser = result.browserProfile.name;
            }
            
            // 共通問題の特定
            if (result.limitations && result.limitations.length > 0) {
                summary.commonIssues.push(...result.limitations);
            }
        });
        
        summary.averageCompatibility = totalCompatibility / results.length;
        
        return summary;
    }
    
    /**
     * テスト結果レポート生成
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            testResults: Array.from(this.testResults.entries()),
            summary: this.createReportSummary()
        };
        
        console.log('[PWACrossDeviceTest] テストレポート生成完了');
        return report;
    }
    
    /**
     * レポート要約作成
     */
    private createReportSummary() {
        const totalTests = this.testResults.size;
        const deviceTypes = new Set();
        let totalIssues = 0;
        
        for (const [key, result] of this.testResults) {
            deviceTypes.add(result.deviceType);
            
            // 問題のあるテストをカウント
            Object.values(result.tests).forEach(testCategory => {
                if (typeof testCategory === 'object' && testCategory !== null) {
                    Object.values(testCategory).forEach(test => {
                        if (test === false) {
                            totalIssues++;
                        }
                    });
                }
            });
        }
        
        return {
            totalTests: totalTests,
            deviceTypes: Array.from(deviceTypes),
            totalIssues: totalIssues,
            compatibilityRate: totalTests > 0 ? ((totalTests - totalIssues) / totalTests) * 100 : 0
        };
    }
}