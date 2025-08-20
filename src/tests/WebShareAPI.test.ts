/**
 * Web Share API統合機能テスト
 */
import { jest } from '@jest/globals';
// Mock interfaces
interface MockStatisticsManager { recordSocialEvent: jest.Mock; }
}
interface MockAchievementManager { getAchievements: jest.Mock; }
}
interface MockLocalizationManager { getCurrentLanguage: jest.Mock<string>,
    translate: jest.Mock<string>; }
}
interface MockGameEngine { statisticsManager: MockStatisticsManager,
    achievementManager: MockAchievementManager,
    localizationManager: MockLocalizationManager,
    on: jest.Mock,
    off: jest.Mock,
    emit: jest.Mock,
    isDebugMode: jest.Mock<boolean>; }
}
interface MockLocalStorage { getItem: jest.Mock,
    setItem: jest.Mock,
    removeItem: jest.Mock; }
}
interface MockClipboard { writeText: jest.Mock<Promise<void>>; }
}
interface MockNavigator { onLine: boolean,
    userAgent: string,
    language: string,
    share?: jest.Mock<Promise<void>>;
    canShare?: jest.Mock<boolean>;
    clipboard: MockClipboard;
    }
}
interface ShareData { title?: string;
    text?: string;
    url?: string;
    type?: string;
    files?: any[]; }
}
interface ShareValidation { valid: boolean,
    errors: string[]; }
}
interface ShareResult { success: boolean,
    method: string,
    error?: string;
    message?: string; }
}
interface PerformanceStats { shareRequests: number,
    successfulShares: number,
    [key: string]: number, }
}
interface SocialSharingManagerInstance { isWebShareSupported(): boolean;
    detectPlatform(): string;
    validateShareData(data: ShareData): ShareValidation,
    sanitizeShareData(data: ShareData): ShareData,
    shareViaWebAPI(data: ShareData): Promise<ShareResult>,
    generateShareDialogHTML(data: ShareData): string,
    generateTwitterShareUrl(data: ShareData): string,
    generateFacebookShareUrl(data: ShareData): string,
    share(data: ShareData): Promise<ShareResult>,
    getPerformanceStats(): PerformanceStats;
    initialize(): Promise<void>;
    cleanup(): void; }
}'
interface SocialSharingManagerConstructor { ''
    new (gameEngine: MockGameEngine'): SocialSharingManagerInstance,
    }'
}''
describe('Web Share API Integration', () => {  let socialSharingManager: SocialSharingManagerInstance,
    let mockGameEngine: MockGameEngine,
    let mockNavigator: MockNavigator,
    beforeEach(async () => {
        // GameEngineのモック
        mockGameEngine = {
            statisticsManager: { }
                recordSocialEvent: jest.fn(); }
            },
        achievementManager: { getAchievements: jest.fn(); }
            },'
            localizationManager: { ''
                getCurrentLanguage: jest.fn<string>(').mockReturnValue('ja'),
                translate: jest.fn<string>().mockImplementation((key: string) => key); }
            },
            on: jest.fn(),
            off: jest.fn(),';
            emit: jest.fn(),'';
            isDebugMode: jest.fn<boolean>().mockReturnValue(false'),
        };
        ';
        // LocalStorageのモック''
        Object.defineProperty(window, 'localStorage', { )
            value: {),
                getItem: jest.fn(),
                setItem: jest.fn(),
        removeItem: jest.fn(); }'
            } as MockLocalStorage''
        }');
        // NavigatorのモックSetup'
        mockNavigator = { onLine: true,''
            userAgent: 'Mozilla/5.0 (Chrome/90.0')','';
            language: 'ja-JP',
            share: jest.fn<Promise<void>>(),
            canShare: jest.fn<boolean>(),
        clipboard: {'
                writeText: jest.fn<Promise<void>>(' }'
    }'),
            }
        };'
        '';
        Object.defineProperty(window, 'navigator', { value: mockNavigator,')'
            writable: true)'),';
        // performance.nowのモック''
        Object.defineProperty(window, 'performance', {)
            value: {),
                now: jest.fn().mockReturnValue(1000); }'
            }''
        }');''
        const { SocialSharingManager } = await import('../core/SocialSharingManager.js') as { SocialSharingManager: SocialSharingManagerConstructor };
        socialSharingManager = new SocialSharingManager(mockGameEngine);
        await socialSharingManager.initialize();
    });
    afterEach(() => {  if (socialSharingManager) { }
            socialSharingManager.cleanup(); }
        }'
        jest.clearAllMocks();''
    }');''
    describe('Web Share API対応状況検出', (') => {  ''
        test('Web Share APIがサポートされている場合', () => {
            mockNavigator.share = jest.fn<Promise<void>>();
            mockNavigator.canShare = jest.fn<boolean>();
            const isSupported = socialSharingManager.isWebShareSupported(); }'
            expect(isSupported).toBe(true);' }'
        }');''
        test('Web Share APIがサポートされていない場合', () => {  delete mockNavigator.share;
            delete mockNavigator.canShare;
            
            const isSupported = socialSharingManager.isWebShareSupported(); }'
            expect(isSupported).toBe(false);' }'
        }');''
        test('プラットフォーム検出でWeb Share API優先', () => {  mockNavigator.share = jest.fn<Promise<void>>();
            mockNavigator.canShare = jest.fn<boolean>();'
            const platform = socialSharingManager.detectPlatform();' }'
            expect(platform').toBe('web-share');' }'
        }');'
    }''
    describe('共有データ検証', (') => {  ''
        test('有効な共有データの検証', (') => {'
            const shareData: ShareData = {''
                title: 'テストタイトル','';
                text: 'テストメッセージ',' }'
                url: 'https://example.com' }
            },
            
            const validation = socialSharingManager.validateShareData(shareData);
            expect(validation.valid).toBe(true);'
            expect(validation.errors).toHaveLength(0);''
        }');''
        test('空の共有データでエラー', () => {  }
            const validation = socialSharingManager.validateShareData({});'
            expect(validation.valid).toBe(false);''
            expect(validation.errors').toContain('title、text、urlのいずれかが必要です');''
        }');''
        test('無効なURLでエラー', (') => {  const shareData: ShareData = {' }'
                url: 'invalid-url' }
            },
            
            const validation = socialSharingManager.validateShareData(shareData);'
            expect(validation.valid).toBe(false);''
            expect(validation.errors').toContain('無効なURL形式です');''
        }');''
        test('文字数制限チェック', (') => {  const shareData: ShareData = {''
                title: 'a'.repeat(201'), // 200文字制限を超過' }'
                text: 'テスト' }
            },
            
            const validation = socialSharingManager.validateShareData(shareData);'
            expect(validation.valid).toBe(false);''
            expect(validation.errors').toContain('タイトルが長すぎます（200文字以下）');''
        }');'
    }''
    describe('共有データサニタイゼーション', (') => {  ''
        test('HTMLタグの除去', (') => {'
            const shareData: ShareData = {''
                title: '<script>alert("xss"")</script>テスト',' }'
                text: '<b>太字</b>テキスト' }
            },
            ';
            const sanitized = socialSharingManager.sanitizeShareData(shareData);''
            expect(sanitized.title').toBe('テスト');''
            expect(sanitized.text').toBe('太字テキスト');''
        }');''
        test('危険なスクリプトの除去', (') => {  const shareData: ShareData = {' }'
                text: 'javascript:alert("xss"") onclick="evil(")" テスト' }
            },
            ';
            const sanitized = socialSharingManager.sanitizeShareData(shareData);''
            expect(sanitized.text').not.toContain('javascript: '),'';
            expect(sanitized.text').not.toContain('onclick=');''
        }');''
        test('URLサニタイゼーション', (') => {  const shareData: ShareData = {' }'
                url: 'https://example.com/page? param=value' }
            },
            ';
            const sanitized = socialSharingManager.sanitizeShareData(shareData); : undefined''
            expect(sanitized.url').toBe('https: //example.com/page? param=value'),'';
        }');''
        test('無効なプロトコルURLの除去', (') => {  : undefined'
            const shareData: ShareData = {' }'
                url: 'javascript:alert("xss"")' }
            },
            ';
            const sanitized = socialSharingManager.sanitizeShareData(shareData);''
            expect(sanitized.url').toBe('');''
        }');'
    }''
    describe('Web Share API実行', () => {  beforeEach(() => {
            mockNavigator.share = jest.fn<Promise<void>>(); }'
            mockNavigator.canShare = jest.fn<boolean>().mockReturnValue(true);' }'
        }');''
        test('正常な共有実行', async () => {  ''
            mockNavigator.share!.mockResolvedValue(''';
                title: 'テストタイトル','';
                text: 'テストメッセージ',' }'
                url: 'https://example.com' })
            })
            );
            const result = await socialSharingManager.shareViaWebAPI(shareData);'
            expect(result.success).toBe(true);''
            expect(result.method').toBe('web-share-api');''
            expect(mockNavigator.share').toHaveBeenCalledWith({ ''
                title: 'テストタイトル',')';
                text: 'テストメッセージ',')';
                url: 'https://example.com'),';
            // 統計の更新確認''
            expect(mockGameEngine.statisticsManager.recordSocialEvent').toHaveBeenCalledWith('';
                'webShareSuccess',
                expect.objectContaining({)
                    hasTitle: true);
                    hasText: true,);
                    hasUrl: true),';
            );' }'
        }');''
        test('ユーザーキャンセル処理', async (') => {  ''
            const abortError = new Error('User cancelled'');''
            abortError.name = 'AbortError';''
            mockNavigator.share!.mockRejectedValue(abortError');'
            const shareData: ShareData = {''
                title: 'テストタイトル',' }'
                text: 'テストメッセージ' }
            },
            
            const result = await socialSharingManager.shareViaWebAPI(shareData);'
            expect(result.success).toBe(false);''
            expect(result.error').toBe('user_cancelled');''
            expect(result.message').toBe('ユーザーによってキャンセルされました');'
            // キャンセル統計の記録確認''
            expect(mockGameEngine.statisticsManager.recordSocialEvent').toHaveBeenCalledWith(')';
                'webShareCancelled')';
                expect.objectContaining({ ')'
                    dataType: 'unknown'),';
            );' }'
        }');''
        test('Web Share API未サポート時のエラー', async (') => {  delete mockNavigator.share;
            ';
            const shareData: ShareData = {' }'
                title: 'テストタイトル' }
            },
            
            const result = await socialSharingManager.shareViaWebAPI(shareData);'
            expect(result.success).toBe(false);''
            expect(result.error').toContain('unknown');''
        }');''
        test('canShareによる事前チェック', async () => {  ''
            mockNavigator.canShare!.mockReturnValue(false');'
            const shareData: ShareData = {''
                title: 'テストタイトル',' }'
                files: ['invalid-file'] // サポートされていないデータ }
            },
            
            const result = await socialSharingManager.shareViaWebAPI(shareData);
            expect(result.success).toBe(false);'
            expect(mockNavigator.share).not.toHaveBeenCalled();''
        }');'
    }''
    describe('フォールバック共有ダイアログ', (') => {  ''
        test('ダイアログHTML生成', (') => {'
            const shareData: ShareData = {''
                title: 'テストタイトル','';
                text: 'テストメッセージ',' }'
                url: 'https://example.com' }
            },
            ';
            const html = socialSharingManager.generateShareDialogHTML(shareData);''
            expect(html').toContain('テストタイトル');''
            expect(html').toContain('テストメッセージ');''
            expect(html').toContain('social-share-dialog');''
            expect(html').toContain('copy-link-btn');''
            expect(html').toContain('twitter-share-btn');''
            expect(html').toContain('facebook-share-btn');''
        }');''
        test('多言語対応ダイアログ', (') => {  ' }'
            mockGameEngine.localizationManager.getCurrentLanguage.mockReturnValue('en'');' }'
            const shareData: ShareData = { title: 'Test Title' }'
            const html = socialSharingManager.generateShareDialogHTML(shareData);''
            expect(html').toContain('Share');''
            expect(html').toContain('Choose how to share');''
            expect(html').toContain('Copy Link');''
        }');''
        test('HTMLエスケープ処理', (') => {  const shareData: ShareData = {''
                title: '<script>alert("xss"")</script>',' }'
                text: '&lt;dangerous&gt;' }
            };
            ';
            const html = socialSharingManager.generateShareDialogHTML(shareData);''
            expect(html').not.toContain('<script>');''
            expect(html').toContain('&lt;script&gt;');''
        }');'
    }''
    describe('URL生成', (') => {  ''
        test('TwitterシェアURL生成', (') => {'
            const shareData: ShareData = {''
                text: 'テストメッセージ',' }'
                url: 'https://example.com' }
            },
            ';
            const url = socialSharingManager.generateTwitterShareUrl(shareData);''
            expect(url').toContain('https: //twitter.com/intent/tweet'),'';
            expect(url').toContain('text=テストメッセージ');''
            expect(url').toContain('url=https: //example.com'),'';
        }');''
        test('FacebookシェアURL生成', (') => {  const shareData: ShareData = {''
                title: 'テストタイトル',' }'
                url: 'https://example.com' }
            },
            ';
            const url = socialSharingManager.generateFacebookShareUrl(shareData);''
            expect(url').toContain('https: //www.facebook.com/sharer/sharer.php'),'';
            expect(url').toContain('u=https: //example.com'),'';
            expect(url').toContain('t=テストタイトル');''
        }');'
    }''
    describe('統合共有メソッド', (') => {  ''
        test('Web Share API優先実行', async () => {'
            mockNavigator.share = jest.fn<Promise<void>>().mockResolvedValue();''
            mockNavigator.canShare = jest.fn<boolean>().mockReturnValue(true');'
            const shareData: ShareData = {''
                title: 'テストタイトル',' }'
                text: 'テストメッセージ' }
            },
            
            const result = await socialSharingManager.share(shareData);'
            expect(result.success).toBe(true);''
            expect(result.method').toBe('web-share-api');'
            expect(mockNavigator.share).toHaveBeenCalled();''
        }');''
        test('Web Share API失敗時のフォールバック', async (') => {  delete mockNavigator.share; // Web Share API無効化
            ';
            // DOMのモック''
            const mockDialog = document.createElement('div'');''
            const mockContainer = document.createElement('div');''
            mockContainer.appendChild(mockDialog');' }'
            jest.spyOn(document, 'createElement').mockReturnValue(mockContainer');' }'
            jest.spyOn(document.body, 'appendChild').mockImplementation(() => {}');''
            jest.spyOn(document.body, 'removeChild').mockImplementation(() => {}');''
            jest.spyOn(document, 'getElementById').mockReturnValue(mockDialog');'
            const shareData: ShareData = { ''
                title: 'テストタイトル','';
                text: 'テストメッセージ' }
            },
            
            // フォールバックダイアログの即座クローズをシミュレート
            setTimeout(() => {  }'
                const closeBtn = { addEventListener: jest.fn() }''
                if(closeBtn.addEventListener.mock.calls.length > 0') {'
                    const [event, handler] = closeBtn.addEventListener.mock.calls[0];''
                    if (event === 'click') {
                }
                        handler(); }
                    }
                }
            }, 10);
            const result = await socialSharingManager.share(shareData);'
            // フォールバックが実行されることを確認''
            expect(result.method').toContain('fallback');''
        }');'
    }''
    describe('統計記録', (') => {  ''
        test('Web Share API成功時の統計記録', async () => {'
            mockNavigator.share = jest.fn<Promise<void>>().mockResolvedValue();''
            mockNavigator.canShare = jest.fn<boolean>().mockReturnValue(true');'
            const shareData: ShareData = {''
                title: 'テストタイトル',' }'
                type: 'score' }
            },
            ';
            await socialSharingManager.shareViaWebAPI(shareData);''
            expect(mockGameEngine.statisticsManager.recordSocialEvent').toHaveBeenCalledWith('';
                'webShareSuccess',';
                expect.objectContaining({ ')'
                    dataType: 'score');
                    hasTitle: true,);
        responseTime: expect.any(Number); }'
    };''
        }');''
        test('パフォーマンス統計の更新', async () => {  mockNavigator.share = jest.fn<Promise<void>>().mockResolvedValue();'
            mockNavigator.canShare = jest.fn<boolean>().mockReturnValue(true);' }'
            const initialStats = socialSharingManager.getPerformanceStats('' })'
            const shareData: ShareData = { title: 'テスト' })
            await socialSharingManager.shareViaWebAPI(shareData);
            const updatedStats = socialSharingManager.getPerformanceStats();
            expect(updatedStats.shareRequests).toBe(initialStats.shareRequests + 1);
            expect(updatedStats.successfulShares).toBe(initialStats.successfulShares + 1);
        });'
    }''
}');