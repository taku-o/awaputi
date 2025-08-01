/**
 * ソーシャルメディア個別対応テスト (Task 4)
 */

describe('Social Media Integration', () => {
    let socialSharingManager;
    let mockGameEngine;
    let mockNavigator;
    
    beforeEach(async () => {
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
        
        // NavigatorのモックSetup
        mockNavigator = {
            onLine: true,
            userAgent: 'Mozilla/5.0 (Chrome/90.0)',
            language: 'ja-JP'
        };
        
        Object.defineProperty(window, 'navigator', {
            value: mockNavigator,
            writable: true
        });
        
        // WindowのモックSetup
        Object.defineProperty(window, 'location', {
            value: {
                origin: 'https://test.example.com',
                pathname: '/game',
                href: 'https://test.example.com/game',
                search: ''
            },
            writable: true
        });
        
        // Window.openのモック
        window.open = jest.fn().mockReturnValue({
            closed: false,
            close: jest.fn()
        });
        
        const { SocialSharingManager } = await import('../core/SocialSharingManager.js');
        socialSharingManager = new SocialSharingManager(mockGameEngine);
        await socialSharingManager.initialize();
    });
    
    afterEach(() => {
        if (socialSharingManager) {
            socialSharingManager.cleanup();
        }
        jest.clearAllMocks();
    });
    
    describe('プラットフォーム検出の改善', () => {
        test('Twitter アプリ内ブラウザを検出', () => {
            mockNavigator.userAgent = 'Mozilla/5.0 Twitter for iPhone';
            const platform = socialSharingManager.detectPlatform();
            expect(platform).toBe('twitter');
        });
        
        test('Facebook アプリ内ブラウザを検出', () => {
            mockNavigator.userAgent = 'FBAN/FBIOS Mozilla/5.0';
            const platform = socialSharingManager.detectPlatform();
            expect(platform).toBe('facebook');
        });
        
        test('URLパラメータからプラットフォームを検出', () => {
            window.location.search = '?share_platform=twitter';
            const platform = socialSharingManager.detectPlatform();
            expect(platform).toBe('twitter');
        });
        
        test('リファラーからプラットフォームを検出', () => {
            Object.defineProperty(document, 'referrer', {
                value: 'https://twitter.com/share',
                configurable: true
            });
            
            mockNavigator.userAgent = 'Mozilla/5.0 (generic browser)';
            const platform = socialSharingManager.detectPlatform();
            expect(platform).toBe('twitter');
        });
    });
    
    describe('Twitter共有機能強化', () => {
        test('基本的なTwitter URL生成', () => {
            const shareData = {
                text: 'テストメッセージ',
                url: 'https://example.com',
                type: 'score'
            };
            
            const url = socialSharingManager.generateTwitterShareUrl(shareData);
            
            expect(url).toContain('https://twitter.com/intent/tweet');
            expect(url).toContain('text=');
            expect(url).toContain('url=https://example.com');
        });
        
        test('ハッシュタグが適切に生成される', () => {
            const shareData = {
                text: 'テストメッセージ',
                type: 'score',
                isHighScore: true
            };
            
            const hashtags = socialSharingManager.generateTwitterHashtags(shareData);
            
            expect(hashtags).toContain('#BubblePop');
            expect(hashtags).toContain('#Gaming');
            expect(hashtags.length).toBeLessThanOrEqual(2);
        });
        
        test('文字数制限が適用される', () => {
            const longText = 'A'.repeat(300);
            const shareData = {
                text: longText,
                url: 'https://example.com',
                type: 'score'
            };
            
            const url = socialSharingManager.generateTwitterShareUrl(shareData);
            const urlParams = new URLSearchParams(url.split('?')[1]);
            const text = urlParams.get('text');
            
            // URL短縮分(23文字)を考慮した制限
            expect(text.length).toBeLessThanOrEqual(280 - 23);
        });
        
        test('メンション機能が動作する', () => {
            const shareData = {
                text: 'テストメッセージ',
                mentions: ['user1', '@user2'],
                type: 'achievement'
            };
            
            const url = socialSharingManager.generateTwitterShareUrl(shareData);
            const urlParams = new URLSearchParams(url.split('?')[1]);
            const text = urlParams.get('text');
            
            expect(text).toContain('@user1');
            expect(text).toContain('@user2');
        });
        
        test('Twitter共有ウィンドウが開かれる', async () => {
            const shareData = {
                text: 'テストメッセージ',
                url: 'https://example.com',
                type: 'score'
            };
            
            const result = await socialSharingManager.shareViaTwitterUrl(shareData);
            
            expect(result.success).toBe(true);
            expect(result.method).toBe('twitter-url');
            expect(result.platform).toBe('twitter');
            expect(window.open).toHaveBeenCalledWith(
                expect.stringContaining('twitter.com/intent/tweet'),
                'twitter-share',
                expect.stringContaining('width=550')
            );
        });
    });
    
    describe('Facebook共有機能強化', () => {
        test('基本的なFacebook URL生成', () => {
            const shareData = {
                title: 'テストタイトル',
                url: 'https://example.com',
                type: 'score'
            };
            
            const url = socialSharingManager.generateFacebookShareUrl(shareData);
            
            expect(url).toContain('facebook.com/sharer/sharer.php');
            expect(url).toContain('u=https://example.com');
            expect(url).toContain('t=テストタイトル');
        });
        
        test('quote パラメータが設定される', () => {
            const shareData = {
                url: 'https://example.com',
                quote: 'カスタム引用テキスト',
                type: 'achievement'
            };
            
            const url = socialSharingManager.generateFacebookShareUrl(shareData);
            
            expect(url).toContain('quote=カスタム引用テキスト');
        });
        
        test('ハッシュタグが適切に設定される', () => {
            const shareData = {
                url: 'https://example.com',
                hashtag: '#CustomHashtag',
                type: 'score'
            };
            
            const url = socialSharingManager.generateFacebookShareUrl(shareData);
            
            expect(url).toContain('hashtag=CustomHashtag');
        });
        
        test('デフォルトハッシュタグが設定される', () => {
            const shareData = {
                url: 'https://example.com',
                type: 'achievement'
            };
            
            const url = socialSharingManager.generateFacebookShareUrl(shareData);
            
            expect(url).toContain('hashtag=BubblePopAchievement');
        });
        
        test('Facebook Dialog modeが動作する', () => {
            const shareData = {
                url: 'https://example.com',
                title: 'テスト'
            };
            
            const options = { mode: 'dialog', appId: 'test123' };
            const url = socialSharingManager.generateFacebookShareUrl(shareData, options);
            
            expect(url).toContain('facebook.com/dialog/share');
            expect(url).toContain('app_id=test123');
        });
        
        test('Facebook共有ウィンドウが開かれる', async () => {
            const shareData = {
                title: 'テストタイトル',
                url: 'https://example.com',
                type: 'score'
            };
            
            const result = await socialSharingManager.shareViaFacebookUrl(shareData);
            
            expect(result.success).toBe(true);
            expect(result.method).toBe('facebook-url');
            expect(result.platform).toBe('facebook');
            expect(window.open).toHaveBeenCalledWith(
                expect.stringContaining('facebook.com/sharer'),
                'facebook-share',
                expect.stringContaining('width=626')
            );
        });
    });
    
    describe('OGタグ動的更新', () => {
        test('スコア共有時のOGタグ更新', () => {
            const shareData = {
                type: 'score',
                score: 1500,
                title: 'テストタイトル',
                url: window.location.href
            };
            
            socialSharingManager.updateOGTagsForFacebook(shareData);
            
            expect(mockGameEngine.seoMetaManager.updateOpenGraphTags).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'BubblePop - 1,500点達成！',
                    description: expect.stringContaining('1,500点を達成'),
                    url: shareData.url,
                    type: 'website'
                })
            );
        });
        
        test('実績共有時のOGタグ更新', () => {
            const shareData = {
                type: 'achievement',
                name: 'テスト実績',
                title: 'テストタイトル',
                url: window.location.href
            };
            
            socialSharingManager.updateOGTagsForFacebook(shareData);
            
            expect(mockGameEngine.seoMetaManager.updateOpenGraphTags).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'BubblePop - 実績「テスト実績」解除！',
                    description: expect.stringContaining('テスト実績'),
                    url: shareData.url
                })
            );
        });
        
        test('SEOMetaManagerが無い場合のエラーハンドリング', () => {
            mockGameEngine.seoMetaManager = null;
            
            const shareData = { type: 'score', score: 1000 };
            
            // エラーが発生しないことを確認
            expect(() => {
                socialSharingManager.updateOGTagsForFacebook(shareData);
            }).not.toThrow();
        });
    });
    
    describe('最適化されたメッセージ生成', () => {
        test('ShareContentGeneratorとの統合', () => {
            const shareData = {
                type: 'score',
                score: 1500,
                stage: 'normal'
            };
            
            // ShareContentGeneratorのモック
            socialSharingManager.shareContentGenerator = {
                generateScoreMessage: jest.fn().mockReturnValue({
                    message: 'BubblePopで1,500点を達成！ #BubblePop #Gaming',
                    platform: 'twitter',
                    language: 'ja',
                    metadata: { optimized: true }
                })
            };
            
            const result = socialSharingManager.generateOptimizedMessage(shareData, 'twitter');
            
            expect(result.text).toBe('BubblePopで1,500点を達成！ #BubblePop #Gaming');
            expect(result.optimized).toBe(true);
            expect(socialSharingManager.shareContentGenerator.generateScoreMessage).toHaveBeenCalledWith(
                shareData,
                'twitter'
            );
        });
        
        test('ShareContentGeneratorが無い場合のフォールバック', () => {
            socialSharingManager.shareContentGenerator = null;
            
            const shareData = { type: 'score', score: 1000 };
            const result = socialSharingManager.generateOptimizedMessage(shareData, 'twitter');
            
            expect(result).toEqual(shareData);
        });
    });
    
    describe('統合共有メソッド強化', () => {
        test('プラットフォーム強制指定での共有', async () => {
            const shareData = {
                type: 'score',
                score: 1500,
                text: 'テストメッセージ'
            };
            
            const options = { platform: 'twitter', forceExternal: true };
            const result = await socialSharingManager.share(shareData, options);
            
            expect(result.method).toBe('twitter-url');
            expect(result.platform).toBe('twitter');
            expect(window.open).toHaveBeenCalled();
        });
        
        test('最適化フラグが正しく設定される', async () => {
            const shareData = { type: 'score', score: 1000 };
            
            // ShareContentGeneratorのモック
            socialSharingManager.shareContentGenerator = {
                generateScoreMessage: jest.fn().mockReturnValue({
                    message: '最適化されたメッセージ',
                    platform: 'generic',
                    language: 'ja',
                    metadata: { optimized: true }
                })
            };
            
            // Web Share APIを無効化してフォールバックを使用
            socialSharingManager.isWebShareSupported = jest.fn().mockReturnValue(false);
            
            const result = await socialSharingManager.share(shareData);
            
            expect(result.optimized).toBe(true);
        });
    });
    
    describe('統計記録機能', () => {
        test('Twitter共有統計が記録される', async () => {
            const shareData = {
                type: 'score',
                score: 1500,
                text: 'テストメッセージ'
            };
            
            await socialSharingManager.shareViaTwitterUrl(shareData);
            
            expect(mockGameEngine.statisticsManager.recordSocialEvent).toHaveBeenCalledWith(
                'twitterShareAttempt',
                expect.objectContaining({
                    hasText: true,
                    hasUrl: false,
                    dataType: 'score'
                })
            );
        });
        
        test('Facebook共有統計が記録される', async () => {
            const shareData = {
                type: 'achievement',
                title: 'テストタイトル',
                url: 'https://example.com'
            };
            
            await socialSharingManager.shareViaFacebookUrl(shareData);
            
            expect(mockGameEngine.statisticsManager.recordSocialEvent).toHaveBeenCalledWith(
                'facebookShareAttempt',
                expect.objectContaining({
                    hasUrl: true,
                    hasTitle: true,
                    dataType: 'achievement'
                })
            );
        });
        
        test('パフォーマンス統計が更新される', () => {
            socialSharingManager.updatePerformanceStats('testAction');
            
            const stats = socialSharingManager.getPerformanceStats();
            expect(stats.testAction).toBe(1);
            expect(stats.lastUpdate).toBeDefined();
        });
    });
    
    describe('エラーハンドリング', () => {
        test('Twitter URL生成エラー時のフォールバック', () => {
            // 不正なデータでエラーを発生させる
            const shareData = null;
            
            const url = socialSharingManager.generateTwitterShareUrl(shareData);
            
            // フォールバックURLが生成されることを確認
            expect(url).toContain('twitter.com/intent/tweet');
        });
        
        test('Facebook URL生成エラー時のフォールバック', () => {
            // 不正なデータでエラーを発生させる
            const shareData = null;
            
            const url = socialSharingManager.generateFacebookShareUrl(shareData);
            
            // フォールバックURLが生成されることを確認
            expect(url).toContain('facebook.com/sharer');
        });
        
        test('ポップアップブロック時のエラーハンドリング', async () => {
            // window.openがnullを返す場合をシミュレート
            window.open = jest.fn().mockReturnValue(null);
            
            const shareData = { type: 'score', score: 1000 };
            const result = await socialSharingManager.shareViaTwitterUrl(shareData);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('ポップアップがブロックされました');
        });
    });
});