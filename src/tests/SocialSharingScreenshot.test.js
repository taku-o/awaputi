/**
 * ソーシャル共有とスクリーンショット統合テスト (Task 5)
 */

describe('SocialSharing Screenshot Integration', () => {
    let socialSharingManager;
    let mockGameEngine;
    let mockCanvas;
    let mockScreenshotCapture;
    
    beforeEach(async () => {
        // Canvas APIのモック
        mockCanvas = {
            width: 800,
            height: 600,
            getContext: jest.fn().mockReturnValue({
                drawImage: jest.fn(),
                imageSmoothingEnabled: true
            }),
            toBlob: jest.fn().mockImplementation((callback, type) => {
                const mockBlob = new Blob(['mock-image'], { type: type || 'image/png' });
                Object.defineProperty(mockBlob, 'size', { value: 1024 * 100 }); // 100KB
                callback(mockBlob);
            }),
            remove: jest.fn()
        };
        
        // ScreenshotCaptureのモック
        mockScreenshotCapture = {
            captureGameCanvas: jest.fn().mockResolvedValue({
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
            captureRegion: jest.fn().mockResolvedValue({
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
            generateFilename: jest.fn().mockReturnValue('mock-filename.png'),
            getStats: jest.fn().mockReturnValue({
                captures: 5,
                successes: 4,
                errors: 1,
                successRate: 80
            }),
            isWebPSupported: jest.fn().mockReturnValue(true),
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
                getCurrentLanguage: jest.fn().mockReturnValue('ja'),
                translate: jest.fn().mockImplementation((key) => key)
            },
            seoMetaManager: {
                updateOpenGraphTags: jest.fn()
            },
            on: jest.fn(),
            off: jest.fn(),
            emit: jest.fn(),
            isDebugMode: jest.fn().mockReturnValue(false)
        };
        
        // グローバルAPIのモック
        global.URL = {
            createObjectURL: jest.fn().mockReturnValue('blob:mock-url'),
            revokeObjectURL: jest.fn()
        };
        
        global.navigator = {
            share: jest.fn().mockResolvedValue(true),
            canShare: jest.fn().mockReturnValue(true),
            onLine: true,
            userAgent: 'Mozilla/5.0 (Chrome/90.0)',
            language: 'ja-JP'
        };
        
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
        });
        
        // SocialSharingManagerの作成
        const { SocialSharingManager } = await import('../core/SocialSharingManager.js');
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
            const shareData = {
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
            const shareData = { type: 'achievement', name: 'テスト実績' };
            const options = {
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
            const shareData = { type: 'score', score: 2000 };
            const options = { platform: 'twitter' };
            
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
            const shareData = { type: 'score', score: 3000 };
            const options = { platform: 'facebook' };
            
            const result = await socialSharingManager.shareWithScreenshot(shareData, options);
            
            expect(result.platform).toBe('facebook');
            expect(result.method).toBe('facebook-url');
            expect(result.hasScreenshot).toBe(true);
            expect(mockGameEngine.seoMetaManager.updateOpenGraphTags).toHaveBeenCalled();
        });
        
        test('Web Share API でのスクリーンショット共有', async () => {
            const shareData = { type: 'achievement', name: 'マスター' };
            const options = { platform: 'web-share' };
            
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
            const shareData = { type: 'score', score: 1200 };
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
            
            const shareData = { type: 'score', score: 1000 };
            
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
            socialSharingManager.share = jest.fn().mockResolvedValue({
                success: true,
                method: 'fallback',
                platform: 'web-share'
            });
            
            const shareData = { type: 'score', score: 1000 };
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
            
            const shareData = { type: 'score', score: 1000 };
            
            await expect(socialSharingManager.shareWithScreenshot(shareData))
                .rejects.toThrow('ScreenshotCaptureが初期化されていません');
        });
        
        test('ポップアップブロック時のエラー処理', async () => {
            window.open = jest.fn().mockReturnValue(null);
            
            const shareData = { type: 'score', score: 1500 };
            
            await expect(socialSharingManager.shareWithScreenshot(shareData, { platform: 'twitter' }))
                .rejects.toThrow('ポップアップがブロックされました');
        });
        
        test('Web Share API 使用不可時のフォールバック', async () => {
            navigator.share = undefined;
            
            const shareData = { type: 'score', score: 1200 };
            
            await expect(socialSharingManager.shareScreenshotViaWebAPI(shareData))
                .rejects.toThrow('Web Share APIがサポートされていません');
        });
        
        test('ユーザーキャンセル時の適切な処理', async () => {
            const abortError = new Error('User cancelled');
            abortError.name = 'AbortError';
            navigator.share = jest.fn().mockRejectedValue(abortError);
            
            const shareData = { type: 'score', score: 1000, screenshot: { blob: new Blob() } };
            const result = await socialSharingManager.shareScreenshotViaWebAPI(shareData);
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('ユーザーによってキャンセルされました');
        });
    });
    
    describe('統計記録機能', () => {
        test('スクリーンショット作成の統計記録', async () => {
            const shareData = { type: 'score', score: 1500 };
            
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
            const shareData = { type: 'score', score: 2000 };
            
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
            const shareData = { type: 'achievement', name: 'マスター' };
            
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
            const shareData = { 
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
            const shareData = { type: 'score', score: 1800 };
            
            await socialSharingManager.shareWithScreenshot(shareData);
            
            const stats = socialSharingManager.getPerformanceStats();
            expect(stats.screenshotShare).toBe(1);
        });
        
        test('複数回のスクリーンショット共有統計', async () => {
            const shareData = { type: 'score', score: 1500 };
            
            await socialSharingManager.shareWithScreenshot(shareData);
            await socialSharingManager.shareWithScreenshot(shareData);
            await socialSharingManager.shareWithScreenshot(shareData);
            
            const stats = socialSharingManager.getPerformanceStats();
            expect(stats.screenshotShare).toBe(3);
        });
    });
});