/**
 * ソーシャル共有とスクリーンショット統合テスト (Task 5)
 */

import { jest } from '@jest/globals';

// Mock interfaces
interface MockCanvasContext {
    drawImage: jest.Mock;
    imageSmoothingEnabled: boolean;
}

interface MockCanvas {
    width: number;
    height: number;
    getContext: jest.Mock<MockCanvasContext>;
    toBlob: jest.Mock;
    remove: jest.Mock;
}

interface ScreenshotResult {
    data: ArrayBuffer;
    blob: Blob;
    url: string;
    format: string;
    size: number;
    width: number;
    height: number;
    filename: string;
    optimized: boolean;
}

interface CaptureOptions {
    format: string;
    quality: string;
    optimize?: boolean;
    maxWidth?: number;
    maxHeight?: number;
}

interface ScreenshotStats {
    captures: number;
    successes: number;
    errors: number;
    successRate: number;
}

interface MockScreenshotCapture {
    captureGameCanvas: jest.Mock<Promise<ScreenshotResult>>;
    captureRegion: jest.Mock<Promise<ScreenshotResult>>;
    generateFilename: jest.Mock<string>;
    getStats: jest.Mock<ScreenshotStats>;
    isWebPSupported: jest.Mock<boolean>;
    config: {
        maxWidth: number;
        maxHeight: number;
    };
}

interface MockStatisticsManager {
    recordSocialEvent: jest.Mock;
}

interface MockLocalizationManager {
    getCurrentLanguage: jest.Mock<string>;
    translate: jest.Mock<string>;
}

interface MockSeoMetaManager {
    updateOpenGraphTags: jest.Mock;
}

interface MockGameEngine {
    canvas: MockCanvas;
    statisticsManager: MockStatisticsManager;
    localizationManager: MockLocalizationManager;
    seoMetaManager: MockSeoMetaManager;
    on: jest.Mock;
    off: jest.Mock;
    emit: jest.Mock;
    isDebugMode: jest.Mock<boolean>;
}

interface ShareData {
    type: string;
    score?: number;
    text?: string;
    name?: string;
    screenshot?: {
        format?: string;
        size?: number;
        blob?: Blob;
    };
}

interface ShareOptions {
    imageFormat?: string;
    imageQuality?: string;
    maxWidth?: number;
    maxHeight?: number;
    platform?: string;
    fallback?: boolean;
}

interface ShareResult {
    success: boolean;
    screenshot?: ScreenshotResult;
    platform?: string;
    method?: string;
    hasScreenshot?: boolean;
    error?: string;
}

interface ScreenshotCapabilities {
    available: boolean;
    formats: string[];
    optimization: boolean;
    maxDimensions: {
        width: number;
        height: number;
    };
    webShareFiles: boolean;
}

interface PerformanceStats {
    screenshotShare?: number;
    [key: string]: number | undefined;
}

interface MockNavigator {
    share?: jest.Mock<Promise<void>>;
    canShare?: jest.Mock<boolean>;
    onLine: boolean;
    userAgent: string;
    language: string;
}

interface SocialSharingManagerInstance {
    screenshotCapture: MockScreenshotCapture | null;
    share?: jest.Mock<Promise<ShareResult>>;
    shareWithScreenshot(data: ShareData, options?: ShareOptions): Promise<ShareResult>;
    shareRegionScreenshot(x: number, y: number, width: number, height: number, data: ShareData): Promise<ShareResult>;
    shareScreenshotViaTwitter(data: ShareData): Promise<ShareResult>;
    shareScreenshotViaFacebook(data: ShareData): Promise<ShareResult>;
    shareScreenshotViaWebAPI(data: ShareData): Promise<ShareResult>;
    getScreenshotCapabilities(): ScreenshotCapabilities;
    getScreenshotStats(): ScreenshotStats;
    getPerformanceStats(): PerformanceStats;
    initialize(): Promise<void>;
    cleanup(): void;
}

interface SocialSharingManagerConstructor {
    new (gameEngine: MockGameEngine): SocialSharingManagerInstance;
}

describe('SocialSharing Screenshot Integration', () => {
    let socialSharingManager: SocialSharingManagerInstance;
    let mockGameEngine: MockGameEngine;
    let mockCanvas: MockCanvas;
    let mockScreenshotCapture: MockScreenshotCapture;
    
    beforeEach(async () => {
        // Canvas APIのモック
        mockCanvas = {
            width: 800,
            height: 600,
            getContext: jest.fn<MockCanvasContext>().mockReturnValue({
                drawImage: jest.fn(),
                imageSmoothingEnabled: true
            }),
            toBlob: jest.fn().mockImplementation((callback: (blob: Blob | null) => void, type?: string) => {
                const mockBlob = new Blob(['mock-image'], { type: type || 'image/png' });
                Object.defineProperty(mockBlob, 'size', { value: 1024 * 100 }); // 100KB
                callback(mockBlob);
            }),
            remove: jest.fn()
        };
        
        // ScreenshotCaptureのモック
        mockScreenshotCapture = {
            captureGameCanvas: jest.fn<Promise<ScreenshotResult>>().mockResolvedValue({
                data: new ArrayBuffer(1024),
                blob: new Blob(['mock-screenshot'], { type: 'image/png' }),
                url: 'blob:mock-screenshot-url',
                format: 'png',
                size: 1024 * 100,
                width: 800,
                height: 600,
                filename: 'test-screenshot.png',
                optimized: false
            }),
            captureRegion: jest.fn<Promise<ScreenshotResult>>().mockResolvedValue({
                data: new ArrayBuffer(512),
                blob: new Blob(['mock-region'], { type: 'image/png' }),
                url: 'blob:mock-region-url',
                format: 'png',
                size: 1024 * 50,
                width: 200,
                height: 150,
                filename: 'test-region.png',
                optimized: false
            }),
            generateFilename: jest.fn<string>().mockReturnValue('mock-filename.png'),
            getStats: jest.fn<ScreenshotStats>().mockReturnValue({
                captures: 5,
                successes: 4,
                errors: 1,
                successRate: 80
            }),
            isWebPSupported: jest.fn<boolean>().mockReturnValue(true),
            config: {
                maxWidth: 1200,
                maxHeight: 630
            }
        };
        
        // GameEngineのモック
        mockGameEngine = {
            canvas: mockCanvas,
            statisticsManager: {
                recordSocialEvent: jest.fn()
            },
            localizationManager: {
                getCurrentLanguage: jest.fn<string>().mockReturnValue('ja'),
                translate: jest.fn<string>().mockImplementation((key: string) => key)
            },
            seoMetaManager: {
                updateOpenGraphTags: jest.fn()
            },
            on: jest.fn(),
            off: jest.fn(),
            emit: jest.fn(),
            isDebugMode: jest.fn<boolean>().mockReturnValue(false)
        };
        
        // グローバルAPIのモック
        (global as any).URL = {
            createObjectURL: jest.fn().mockReturnValue('blob:mock-url'),
            revokeObjectURL: jest.fn()
        };
        
        (global as any).navigator = {
            share: jest.fn().mockResolvedValue(true),
            canShare: jest.fn().mockReturnValue(true),
            onLine: true,
            userAgent: 'Mozilla/5.0 (Chrome/90.0)',
            language: 'ja-JP'
        } as MockNavigator;
        
        Object.defineProperty(window, 'location', {
            value: {
                origin: 'https://test.example.com',
                pathname: '/game',
                href: 'https://test.example.com/game'
            },
            writable: true
        });
        
        window.open = jest.fn().mockReturnValue({
            closed: false,
            close: jest.fn()
        }) as any;
        
        // SocialSharingManagerの作成
        const { SocialSharingManager } = await import('../core/SocialSharingManager.js') as { SocialSharingManager: SocialSharingManagerConstructor };
        socialSharingManager = new SocialSharingManager(mockGameEngine);
        
        // ScreenshotCaptureのモック注入
        socialSharingManager.screenshotCapture = mockScreenshotCapture;
        
        await socialSharingManager.initialize();
    });
    
    afterEach(() => {
        jest.clearAllMocks();
        socialSharingManager.cleanup();
    });
    
    describe('スクリーンショット付き共有機能', () => {
        test('基本的なスクリーンショット共有が動作する', async () => {
            const shareData: ShareData = {
                type: 'score',
                score: 1500,
                text: 'テストスコア共有'
            };
            
            const result = await socialSharingManager.shareWithScreenshot(shareData);
            
            expect(mockScreenshotCapture.captureGameCanvas).toHaveBeenCalledWith(
                expect.objectContaining({
                    format: 'png',
                    quality: 'high',
                    optimize: true
                })
            );
            
            expect(result.success).toBe(true);
            expect(result.screenshot).toHaveProperty('format', 'png');
            expect(result.screenshot).toHaveProperty('size', 1024 * 100);
        });
        
        test('カスタム画像設定でのスクリーンショット共有', async () => {
            const shareData: ShareData = { type: 'achievement', name: 'テスト実績' };
            const options: ShareOptions = {
                imageFormat: 'jpeg',
                imageQuality: 'medium',
                maxWidth: 800,
                maxHeight: 400
            };
            
            await socialSharingManager.shareWithScreenshot(shareData, options);
            
            expect(mockScreenshotCapture.captureGameCanvas).toHaveBeenCalledWith(
                expect.objectContaining({
                    format: 'jpeg',
                    quality: 'medium',
                    maxWidth: 800,
                    maxHeight: 400
                })
            );
        });
        
        test('プラットフォーム別スクリーンショット共有（Twitter）', async () => {
            const shareData: ShareData = { type: 'score', score: 2000 };
            const options: ShareOptions = { platform: 'twitter' };
            
            const result = await socialSharingManager.shareWithScreenshot(shareData, options);
            
            expect(result.platform).toBe('twitter');
            expect(result.method).toBe('twitter-url');
            expect(result.hasScreenshot).toBe(true);
            expect(window.open).toHaveBeenCalledWith(
                expect.stringContaining('twitter.com/intent/tweet'),
                'twitter-share',
                expect.any(String)
            );
        });
        
        test('プラットフォーム別スクリーンショット共有（Facebook）', async () => {
            const shareData: ShareData = { type: 'score', score: 3000 };
            const options: ShareOptions = { platform: 'facebook' };
            
            const result = await socialSharingManager.shareWithScreenshot(shareData, options);
            
            expect(result.platform).toBe('facebook');
            expect(result.method).toBe('facebook-url');
            expect(result.hasScreenshot).toBe(true);
            expect(mockGameEngine.seoMetaManager.updateOpenGraphTags).toHaveBeenCalled();
        });
        
        test('Web Share API でのスクリーンショット共有', async () => {
            const shareData: ShareData = { type: 'achievement', name: 'マスター' };
            const options: ShareOptions = { platform: 'web-share' };
            
            const result = await socialSharingManager.shareWithScreenshot(shareData, options);
            
            expect(result.platform).toBe('web-share');
            expect(result.method).toBe('web-share-api');
            expect(result.hasScreenshot).toBe(true);
            expect(navigator.share).toHaveBeenCalledWith(
                expect.objectContaining({
                    files: expect.arrayContaining([
                        expect.any(File)
                    ])
                })
            );
        });
    });
    
    describe('領域指定スクリーンショット共有', () => {
        test('カスタム領域のスクリーンショット共有', async () => {
            const shareData: ShareData = { type: 'score', score: 1200 };
            const result = await socialSharingManager.shareRegionScreenshot(
                100, 100, 200, 150, shareData
            );
            
            expect(mockScreenshotCapture.captureRegion).toHaveBeenCalledWith(
                100, 100, 200, 150,
                expect.objectContaining({
                    format: 'png',
                    quality: 'high'
                })
            );
            
            expect(result.success).toBe(true);
            expect(result.screenshot).toHaveProperty('format', 'png');
        });
        
        test('領域指定エラー時のフォールバック', async () => {
            mockScreenshotCapture.captureRegion.mockRejectedValue(new Error('Region capture failed'));
            
            const shareData: ShareData = { type: 'score', score: 1000 };
            
            await expect(socialSharingManager.shareRegionScreenshot(
                -10, -10, 0, 0, shareData
            )).rejects.toThrow('Region capture failed');
        });
    });
    
    describe('スクリーンショット機能の状態確認', () => {
        test('スクリーンショット機能の対応状況確認', () => {
            const capabilities = socialSharingManager.getScreenshotCapabilities();
            
            expect(capabilities.available).toBe(true);
            expect(capabilities.formats).toContain('png');
            expect(capabilities.formats).toContain('jpeg');
            expect(capabilities.optimization).toBe(true);
            expect(capabilities.maxDimensions).toHaveProperty('width', 1200);
            expect(capabilities.maxDimensions).toHaveProperty('height', 630);
        });
        
        test('WebPサポート確認', () => {
            const capabilities = socialSharingManager.getScreenshotCapabilities();
            
            expect(capabilities.formats).toContain('webp');
        });
        
        test('Web Share Files サポート確認', () => {
            const capabilities = socialSharingManager.getScreenshotCapabilities();
            
            expect(capabilities.webShareFiles).toBe(true);
        });
        
        test('スクリーンショット統計の取得', () => {
            const stats = socialSharingManager.getScreenshotStats();
            
            expect(stats).toEqual({
                captures: 5,
                successes: 4,
                errors: 1,
                successRate: 80
            });
        });
    });
    
    describe('エラーハンドリングとフォールバック', () => {
        test('スクリーンショット取得失敗時のフォールバック', async () => {
            mockScreenshotCapture.captureGameCanvas.mockRejectedValue(new Error('Capture failed'));
            
            // share メソッドのモック
            socialSharingManager.share = jest.fn<Promise<ShareResult>>().mockResolvedValue({
                success: true,
                method: 'fallback',
                platform: 'web-share'
            });
            
            const shareData: ShareData = { type: 'score', score: 1000 };
            const result = await socialSharingManager.shareWithScreenshot(shareData);
            
            expect(socialSharingManager.share).toHaveBeenCalledWith(
                shareData,
                expect.objectContaining({ fallback: true })
            );
            expect(result.success).toBe(true);
            expect(result.method).toBe('fallback');
        });
        
        test('ScreenshotCapture未初期化時のエラー', async () => {
            socialSharingManager.screenshotCapture = null;
            
            const shareData: ShareData = { type: 'score', score: 1000 };
            
            await expect(socialSharingManager.shareWithScreenshot(shareData))
                .rejects.toThrow('ScreenshotCaptureが初期化されていません');
        });
        
        test('ポップアップブロック時のエラー処理', async () => {
            window.open = jest.fn().mockReturnValue(null) as any;
            
            const shareData: ShareData = { type: 'score', score: 1500 };
            
            await expect(socialSharingManager.shareWithScreenshot(shareData, { platform: 'twitter' }))
                .rejects.toThrow('ポップアップがブロックされました');
        });
        
        test('Web Share API 使用不可時のフォールバック', async () => {
            (navigator as MockNavigator).share = undefined;
            
            const shareData: ShareData = { type: 'score', score: 1200 };
            
            await expect(socialSharingManager.shareScreenshotViaWebAPI(shareData))
                .rejects.toThrow('Web Share APIがサポートされていません');
        });
        
        test('ユーザーキャンセル時の適切な処理', async () => {
            const abortError = new Error('User cancelled');
            abortError.name = 'AbortError';
            (navigator as MockNavigator).share = jest.fn().mockRejectedValue(abortError);
            
            const shareData: ShareData = { type: 'score', score: 1000, screenshot: { blob: new Blob() } };
            const result = await socialSharingManager.shareScreenshotViaWebAPI(shareData);
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('ユーザーによってキャンセルされました');
        });
    });
    
    describe('統計記録機能', () => {
        test('スクリーンショット作成の統計記録', async () => {
            const shareData: ShareData = { type: 'score', score: 1500 };
            
            await socialSharingManager.shareWithScreenshot(shareData);
            
            expect(mockGameEngine.statisticsManager.recordSocialEvent).toHaveBeenCalledWith(
                'screenshotCaptured',
                expect.objectContaining({
                    format: 'png',
                    size: 1024 * 100,
                    optimized: false,
                    captureTime: expect.any(Number)
                })
            );
        });
        
        test('Twitter スクリーンショット共有統計', async () => {
            const shareData: ShareData = { type: 'score', score: 2000 };
            
            await socialSharingManager.shareScreenshotViaTwitter({
                ...shareData,
                screenshot: { format: 'png', size: 1024 * 100 }
            });
            
            expect(mockGameEngine.statisticsManager.recordSocialEvent).toHaveBeenCalledWith(
                'twitterScreenshotShare',
                expect.objectContaining({
                    hasScreenshot: true,
                    screenshotFormat: 'png',
                    screenshotSize: 1024 * 100
                })
            );
        });
        
        test('Facebook スクリーンショット共有統計', async () => {
            const shareData: ShareData = { type: 'achievement', name: 'マスター' };
            
            await socialSharingManager.shareScreenshotViaFacebook({
                ...shareData,
                screenshot: { format: 'jpeg', size: 1024 * 80 }
            });
            
            expect(mockGameEngine.statisticsManager.recordSocialEvent).toHaveBeenCalledWith(
                'facebookScreenshotShare',
                expect.objectContaining({
                    hasScreenshot: true,
                    screenshotFormat: 'jpeg',
                    screenshotSize: 1024 * 80
                })
            );
        });
        
        test('Web API スクリーンショット共有統計', async () => {
            const shareData: ShareData = { 
                type: 'challenge', 
                name: 'デイリー',
                screenshot: { format: 'webp', size: 1024 * 60, blob: new Blob() }
            };
            
            await socialSharingManager.shareScreenshotViaWebAPI(shareData);
            
            expect(mockGameEngine.statisticsManager.recordSocialEvent).toHaveBeenCalledWith(
                'webApiScreenshotShare',
                expect.objectContaining({
                    hasScreenshot: true,
                    screenshotFormat: 'webp',
                    screenshotSize: 1024 * 60
                })
            );
        });
    });
    
    describe('パフォーマンス監視', () => {
        test('スクリーンショット共有のパフォーマンス統計', async () => {
            const shareData: ShareData = { type: 'score', score: 1800 };
            
            await socialSharingManager.shareWithScreenshot(shareData);
            
            const stats = socialSharingManager.getPerformanceStats();
            expect(stats.screenshotShare).toBe(1);
        });
        
        test('複数回のスクリーンショット共有統計', async () => {
            const shareData: ShareData = { type: 'score', score: 1500 };
            
            await socialSharingManager.shareWithScreenshot(shareData);
            await socialSharingManager.shareWithScreenshot(shareData);
            await socialSharingManager.shareWithScreenshot(shareData);
            
            const stats = socialSharingManager.getPerformanceStats();
            expect(stats.screenshotShare).toBe(3);
        });
    });
});