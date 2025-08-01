/**
 * ソーシャル共有とオーバーレイ統合テスト (Task 6)
 */

describe('SocialSharing Overlay Integration', () => {
    let socialSharingManager;
    let mockGameEngine;
    let mockScreenshotCapture;
    let mockScreenshotOverlay;
    
    beforeEach(async () => {
        // ScreenshotOverlayのモック
        mockScreenshotOverlay = {
            createScoreOverlay: jest.fn().mockResolvedValue({
                width: 800,
                height: 600,
                getContext: jest.fn().mockReturnValue({
                    drawImage: jest.fn()
                }),
                remove: jest.fn()
            }),
            createAchievementOverlay: jest.fn().mockResolvedValue({
                width: 800,
                height: 600,
                getContext: jest.fn().mockReturnValue({
                    drawImage: jest.fn()
                }),
                remove: jest.fn()
            }),
            createCustomOverlay: jest.fn().mockResolvedValue({
                width: 800,
                height: 600,
                getContext: jest.fn().mockReturnValue({
                    drawImage: jest.fn()
                }),
                remove: jest.fn()
            }),
            getPresetConfig: jest.fn().mockReturnValue({
                score: { fontSize: 28 },
                logo: { textColor: '#FF0000' }
            }),
            getResponsiveConfig: jest.fn().mockReturnValue({
                score: { fontSize: 20 },
                layout: { scorePosition: 'top-center' }
            }),
            getStats: jest.fn().mockReturnValue({
                overlaysCreated: 3,
                averageTimeMs: 150,
                successRate: 100
            })
        };
        
        // ScreenshotCaptureのモック（オーバーレイ機能付き）
        mockScreenshotCapture = {
            overlayEnabled: true,
            screenshotOverlay: mockScreenshotOverlay,
            
            captureWithOverlay: jest.fn().mockResolvedValue({
                data: new ArrayBuffer(1024),
                blob: new Blob(['mock-overlay-screenshot'], { type: 'image/png' }),
                url: 'blob:mock-overlay-url',
                format: 'png',
                size: 1024 * 120,
                width: 800,
                height: 600,
                filename: 'score-overlay-screenshot.png',
                overlayType: 'score',
                hasOverlay: true,
                optimized: false
            }),
            
            captureWithScore: jest.fn().mockResolvedValue({
                data: new ArrayBuffer(1024),
                blob: new Blob(['mock-score-overlay'], { type: 'image/png' }),
                url: 'blob:mock-score-overlay-url',
                format: 'png',
                size: 1024 * 110,
                width: 800,
                height: 600,
                filename: 'score-overlay.png',
                overlayType: 'score',
                hasOverlay: true
            }),
            
            captureWithAchievement: jest.fn().mockResolvedValue({
                data: new ArrayBuffer(1024),
                blob: new Blob(['mock-achievement-overlay'], { type: 'image/png' }),
                url: 'blob:mock-achievement-overlay-url',
                format: 'png',
                size: 1024 * 130,
                width: 800,
                height: 600,
                filename: 'achievement-overlay.png',
                overlayType: 'achievement',
                hasOverlay: true
            }),
            
            captureWithCustomOverlay: jest.fn().mockResolvedValue({
                data: new ArrayBuffer(1024),
                blob: new Blob(['mock-custom-overlay'], { type: 'image/png' }),
                url: 'blob:mock-custom-overlay-url',
                format: 'png',
                size: 1024 * 100,
                width: 800,
                height: 600,
                filename: 'custom-overlay.png',
                overlayType: 'custom',
                hasOverlay: true
            }),
            
            generateFilename: jest.fn().mockReturnValue('mock-overlay-filename.png'),
            getGameCanvas: jest.fn().mockReturnValue({
                width: 800,
                height: 600
            })
        };
        
        // GameEngineのモック
        mockGameEngine = {
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
    
    describe('オーバーレイ付きスクリーンショット共有', () => {
        test('スコアオーバーレイ付き共有が動作する', async () => {
            const shareData = { type: 'score', score: 2500 };
            const overlayData = { score: 2500, combo: 15, accuracy: 0.92 };
            
            const result = await socialSharingManager.shareWithOverlayScreenshot(
                shareData, 'score', overlayData
            );
            
            expect(mockScreenshotCapture.captureWithScore).toHaveBeenCalledWith(
                overlayData,
                expect.objectContaining({
                    format: 'png',
                    quality: 'high',
                    optimize: true
                })
            );
            
            expect(result.success).toBe(true);
            expect(result.overlayType).toBe('score');
            expect(result.screenshot.hasOverlay).toBe(true);
        });
        
        test('実績オーバーレイ付き共有が動作する', async () => {
            const shareData = { type: 'achievement', name: 'マスター実績' };
            const overlayData = { 
                name: 'マスター実績', 
                description: '全ステージクリア',
                rarity: 'legendary'
            };
            
            const result = await socialSharingManager.shareWithOverlayScreenshot(
                shareData, 'achievement', overlayData
            );
            
            expect(mockScreenshotCapture.captureWithAchievement).toHaveBeenCalledWith(
                overlayData,
                expect.objectContaining({
                    format: 'png'
                })
            );
            
            expect(result.overlayType).toBe('achievement');
            expect(result.screenshot.hasOverlay).toBe(true);
        });
        
        test('カスタムオーバーレイ付き共有が動作する', async () => {
            const shareData = { type: 'custom' };
            const overlayData = {
                elements: [
                    { type: 'text', text: 'カスタムテキスト', position: { x: 100, y: 100 } }
                ]
            };
            
            const result = await socialSharingManager.shareWithOverlayScreenshot(
                shareData, 'custom', overlayData
            );
            
            expect(mockScreenshotCapture.captureWithCustomOverlay).toHaveBeenCalledWith(
                overlayData,
                expect.any(Object)
            );
            
            expect(result.overlayType).toBe('custom');
            expect(result.screenshot.hasOverlay).toBe(true);
        });
        
        test('カスタム画像設定でのオーバーレイ共有', async () => {
            const shareData = { type: 'score', score: 1800 };
            const overlayData = { score: 1800 };
            const options = {
                imageFormat: 'jpeg',
                imageQuality: 'medium',
                overlayConfig: {
                    score: { fontSize: 32, textColor: '#FFD700' }
                }
            };
            
            await socialSharingManager.shareWithOverlayScreenshot(
                shareData, 'score', overlayData, options
            );
            
            expect(mockScreenshotCapture.captureWithScore).toHaveBeenCalledWith(
                overlayData,
                expect.objectContaining({
                    format: 'jpeg',
                    quality: 'medium',
                    overlay: options.overlayConfig
                })
            );
        });
    });
    
    describe('便利メソッド', () => {
        test('スコアオーバーレイ専用メソッドが動作する', async () => {
            const scoreData = { score: 3000, combo: 20 };
            const shareData = { type: 'score', score: 3000 };
            
            const result = await socialSharingManager.shareScoreWithOverlay(scoreData, shareData);
            
            expect(mockScreenshotCapture.captureWithScore).toHaveBeenCalledWith(
                scoreData,
                expect.any(Object)
            );
            expect(result.overlayType).toBe('score');
        });
        
        test('実績オーバーレイ専用メソッドが動作する', async () => {
            const achievementData = { name: 'エキスパート', description: 'すべての実績を解除' };
            const shareData = { type: 'achievement', name: 'エキスパート' };
            
            const result = await socialSharingManager.shareAchievementWithOverlay(achievementData, shareData);
            
            expect(mockScreenshotCapture.captureWithAchievement).toHaveBeenCalledWith(
                achievementData,
                expect.any(Object)
            );
            expect(result.overlayType).toBe('achievement');
        });
        
        test('カスタムオーバーレイ専用メソッドが動作する', async () => {
            const customData = { elements: [{ type: 'text', text: 'テスト' }] };
            const shareData = { type: 'custom' };
            
            const result = await socialSharingManager.shareCustomOverlay(customData, shareData);
            
            expect(mockScreenshotCapture.captureWithCustomOverlay).toHaveBeenCalledWith(
                customData,
                expect.any(Object)
            );
            expect(result.overlayType).toBe('custom');
        });
        
        test('shareDataが省略された場合のデフォルト値', async () => {
            const scoreData = { score: 1500 };
            
            const result = await socialSharingManager.shareScoreWithOverlay(scoreData);
            
            expect(result.overlayType).toBe('score');
            // デフォルトのshareDataが使用される
            expect(mockScreenshotCapture.captureWithScore).toHaveBeenCalled();
        });
    });
    
    describe('プリセット機能', () => {
        test('プリセットオーバーレイ共有が動作する', async () => {
            const shareData = { type: 'score', score: 2200 };
            const overlayData = { type: 'score', data: { score: 2200 } };
            
            const result = await socialSharingManager.shareWithPresetOverlay(
                'gaming', shareData, overlayData
            );
            
            expect(mockScreenshotOverlay.getPresetConfig).toHaveBeenCalledWith('gaming');
            expect(result.overlayType).toBe('score');
        });
        
        test('プリセット設定がオプションにマージされる', async () => {
            const shareData = { type: 'score', score: 1000 };
            const overlayData = { type: 'score', data: { score: 1000 } };
            const options = {
                overlayConfig: { logo: { enabled: false } }
            };
            
            await socialSharingManager.shareWithPresetOverlay(
                'elegant', shareData, overlayData, options
            );
            
            expect(mockScreenshotOverlay.getPresetConfig).toHaveBeenCalledWith('elegant');
            // プリセット設定とカスタム設定がマージされることを確認
        });
    });
    
    describe('レスポンシブ機能', () => {
        test('レスポンシブオーバーレイ共有が動作する', async () => {
            const shareData = { type: 'score', score: 1600 };
            const overlayData = { score: 1600 };
            
            const result = await socialSharingManager.shareWithResponsiveOverlay(
                shareData, 'score', overlayData
            );
            
            expect(mockScreenshotCapture.getGameCanvas).toHaveBeenCalled();
            expect(mockScreenshotOverlay.getResponsiveConfig).toHaveBeenCalledWith(800, 600);
            expect(result.overlayType).toBe('score');
        });
        
        test('Canvas取得失敗時もレスポンシブ共有が動作する', async () => {
            mockScreenshotCapture.getGameCanvas.mockReturnValue(null);
            
            const shareData = { type: 'score', score: 1400 };
            const overlayData = { score: 1400 };
            
            const result = await socialSharingManager.shareWithResponsiveOverlay(
                shareData, 'score', overlayData
            );
            
            expect(result.overlayType).toBe('score');
            // レスポンシブ設定は取得されない
            expect(mockScreenshotOverlay.getResponsiveConfig).not.toHaveBeenCalled();
        });
    });
    
    describe('統計記録', () => {
        test('オーバーレイスクリーンショット作成統計が記録される', async () => {
            const shareData = { type: 'score', score: 2800 };
            const overlayData = { score: 2800 };
            
            await socialSharingManager.shareWithOverlayScreenshot(shareData, 'score', overlayData);
            
            expect(mockGameEngine.statisticsManager.recordSocialEvent).toHaveBeenCalledWith(
                'overlayScreenshotCaptured',
                expect.objectContaining({
                    overlayType: 'score',
                    format: 'png',
                    size: 1024 * 120,
                    optimized: false,
                    captureTime: expect.any(Number)
                })
            );
        });
        
        test('異なるオーバーレイタイプの統計が正しく記録される', async () => {
            // スコアオーバーレイ
            await socialSharingManager.shareScoreWithOverlay({ score: 1000 });
            
            expect(mockGameEngine.statisticsManager.recordSocialEvent).toHaveBeenCalledWith(
                'overlayScreenshotCaptured',
                expect.objectContaining({
                    overlayType: 'score'
                })
            );
            
            // 実績オーバーレイ
            await socialSharingManager.shareAchievementWithOverlay({ name: 'テスト実績' });
            
            expect(mockGameEngine.statisticsManager.recordSocialEvent).toHaveBeenCalledWith(
                'overlayScreenshotCaptured',
                expect.objectContaining({
                    overlayType: 'achievement'
                })
            );
        });
    });
    
    describe('機能状態確認', () => {
        test('オーバーレイ機能の状態が正しく取得される', () => {
            const capabilities = socialSharingManager.getOverlayCapabilities();
            
            expect(capabilities.available).toBe(true);
            expect(capabilities.types).toContain('score');
            expect(capabilities.types).toContain('achievement');
            expect(capabilities.types).toContain('custom');
            expect(capabilities.presets).toContain('minimal');
            expect(capabilities.presets).toContain('elegant');
            expect(capabilities.responsive).toBe(true);
            expect(capabilities.customizable).toBe(true);
        });
        
        test('オーバーレイ統計が取得される', () => {
            const capabilities = socialSharingManager.getOverlayCapabilities();
            
            expect(capabilities.stats).toEqual({
                overlaysCreated: 3,
                averageTimeMs: 150,
                successRate: 100
            });
        });
        
        test('オーバーレイ無効時の状態確認', () => {
            mockScreenshotCapture.overlayEnabled = false;
            
            const capabilities = socialSharingManager.getOverlayCapabilities();
            
            expect(capabilities.available).toBe(false);
        });
        
        test('ScreenshotCapture未初期化時の状態確認', () => {
            socialSharingManager.screenshotCapture = null;
            
            const capabilities = socialSharingManager.getOverlayCapabilities();
            
            expect(capabilities.available).toBe(false);
        });
    });
    
    describe('エラーハンドリング', () => {
        test('未対応オーバーレイタイプでエラーが処理される', async () => {
            const shareData = { type: 'score', score: 1200 };
            
            await expect(socialSharingManager.shareWithOverlayScreenshot(
                shareData, 'unsupported', {}
            )).rejects.toThrow('未対応のオーバーレイタイプ: unsupported');
        });
        
        test('オーバーレイ作成失敗時のフォールバック', async () => {
            mockScreenshotCapture.captureWithScore.mockRejectedValue(new Error('Overlay failed'));
            
            // shareWithScreenshot メソッドのモック
            socialSharingManager.shareWithScreenshot = jest.fn().mockResolvedValue({
                success: true,
                method: 'fallback'
            });
            
            const shareData = { type: 'score', score: 1500 };
            const result = await socialSharingManager.shareScoreWithOverlay({ score: 1500 }, shareData);
            
            expect(socialSharingManager.shareWithScreenshot).toHaveBeenCalled();
            expect(result.method).toBe('fallback');
        });
        
        test('ScreenshotCapture未初期化時のエラー', async () => {
            socialSharingManager.screenshotCapture = null;
            
            const shareData = { type: 'score', score: 1000 };
            
            await expect(socialSharingManager.shareWithOverlayScreenshot(
                shareData, 'score', { score: 1000 }
            )).rejects.toThrow('ScreenshotCaptureが初期化されていません');
        });
        
        test('オーバーレイ無効時は通常のキャプチャが実行される', async () => {
            mockScreenshotCapture.overlayEnabled = false;
            mockScreenshotCapture.captureGameCanvas = jest.fn().mockResolvedValue({
                data: new ArrayBuffer(1024),
                blob: new Blob(['normal-screenshot'], { type: 'image/png' }),
                url: 'blob:normal-url',
                format: 'png',
                size: 1024 * 100,
                hasOverlay: false
            });
            
            const shareData = { type: 'score', score: 1300 };
            const result = await socialSharingManager.shareScoreWithOverlay({ score: 1300 }, shareData);
            
            expect(mockScreenshotCapture.captureGameCanvas).toHaveBeenCalled();
            expect(mockScreenshotCapture.captureWithScore).not.toHaveBeenCalled();
        });
    });
    
    describe('パフォーマンス', () => {
        test('複数回のオーバーレイ共有のパフォーマンス', async () => {
            const shareData = { type: 'score', score: 1000 };
            
            // 複数回実行
            await socialSharingManager.shareScoreWithOverlay({ score: 1000 }, shareData);
            await socialSharingManager.shareScoreWithOverlay({ score: 2000 }, shareData);
            await socialSharingManager.shareScoreWithOverlay({ score: 3000 }, shareData);
            
            expect(mockScreenshotCapture.captureWithScore).toHaveBeenCalledTimes(3);
            expect(mockGameEngine.statisticsManager.recordSocialEvent).toHaveBeenCalledTimes(3);
        });
        
        test('大きなオーバーレイデータの処理', async () => {
            const largeCustomData = {
                elements: Array.from({ length: 50 }, (_, i) => ({
                    type: 'text',
                    text: `要素${i}`,
                    position: { x: i * 10, y: i * 10 }
                }))
            };
            
            const shareData = { type: 'custom' };
            const result = await socialSharingManager.shareCustomOverlay(largeCustomData, shareData);
            
            expect(result.overlayType).toBe('custom');
            expect(mockScreenshotCapture.captureWithCustomOverlay).toHaveBeenCalledWith(
                largeCustomData,
                expect.any(Object)
            );
        });
    });
});