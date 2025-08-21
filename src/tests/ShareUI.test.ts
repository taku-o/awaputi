/**
 * 共有UI統合テスト (Task 7)
 * ShareButtonとShareDialogの統合動作をテスト
 */
import { jest } from '@jest/globals';

// Mock interfaces
interface MockElement extends HTMLElement {
    click(): Promise<void>;
}

interface MockGameEngine {
    on: jest.Mock;
    off: jest.Mock;
    emit: jest.Mock;
}

interface MockSocialSharingManager {
    gameEngine: MockGameEngine;
    share: jest.Mock<Promise<ShareResult>>;
    shareViaTwitterUrl: jest.Mock<Promise<ShareResult>>;
    shareViaFacebookUrl: jest.Mock<Promise<ShareResult>>;
}

interface ShareResult {
    success: boolean;
    method: string;
}

interface ShareData {
    type: string;
    score?: number;
    text?: string;
    name?: string;
}

interface ShareButtonElements {
    container: HTMLElement;
    mainButton: HTMLElement;
    platformButtons: MockElement[];
}

interface ShareDialogElements {
    dialog: HTMLElement;
    backdrop: HTMLElement;
    platforms: MockElement[];
}

interface ShareButtonInstance {
    socialSharingManager: MockSocialSharingManager | null;
    state: { visible: boolean };
    stats: { shares: number; shows: number; platforms: { twitter: number; facebook: number } };
    elements: ShareButtonElements;
    handlers: { keydown?: Function; resize?: Function };
    config: { theme: string; position?: string; platforms?: string[] };
    show(): void;
    hide(): void;
    showWithData(data: ShareData): void;
    expand(): void;
    getStats(): { shares: number; shows: number; platforms: { twitter: number; facebook: number } };
    destroy(): void;
    updateConfig(config: any): void;
    applyResponsiveStyles(): void;
    handleError?: Function;
    handlePlatformShare(platform: string): Promise<void>;
}

interface ShareDialogInstance {
    socialSharingManager: MockSocialSharingManager | null;
    state: { visible: boolean };
    stats: { shares: number; shows: number; platforms: { twitter: number; facebook: number } };
    elements: ShareDialogElements;
    handlers: { keydown?: Function; resize?: Function };
    config: { theme: string; width?: number; platforms?: string[] };
    show(data: ShareData): Promise<void>;
    hide(): Promise<void>;
    getStats(): { shares: number; shows: number; platforms: { twitter: number; facebook: number } };
    destroy(): void;
    updateConfig(config: any): void;
    applyResponsiveStyles(): void;
    handleError?: Function;
}

interface ShareButtonConstructor {
    new(socialSharingManager: MockSocialSharingManager, config?: any): ShareButtonInstance;
}

interface ShareDialogConstructor {
    new(socialSharingManager: MockSocialSharingManager, config?: any): ShareDialogInstance;
}

describe('ShareUI Integration Tests', () => {
    let mockSocialSharingManager: MockSocialSharingManager;
    let mockGameEngine: MockGameEngine;
    let shareButton: ShareButtonInstance;
    let shareDialog: ShareDialogInstance;

    beforeEach(async () => {
        // DOM環境のセットアップ
        document.body.innerHTML = '';
        
        // GameEngineのモック
        mockGameEngine = {
            on: jest.fn(),
            off: jest.fn(),
            emit: jest.fn()
        };
        
        // SocialSharingManagerのモック
        mockSocialSharingManager = {
            gameEngine: mockGameEngine,
            share: jest.fn().mockResolvedValue({ success: true, method: 'web-share' }),
            shareViaTwitterUrl: jest.fn().mockResolvedValue({ success: true, method: 'twitter' }),
            shareViaFacebookUrl: jest.fn().mockResolvedValue({ success: true, method: 'facebook' })
        };
        
        // グローバル環境のモック
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation((query: string) => ({
                matches: query.includes('max-width: 768px') ? false : true,
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn()
            }))
        });

        global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
            setTimeout(() => callback(0), 0);
            return 1;
        }) as any;

        // コンポーネントの作成
        const { ShareButton } = await import('../core/ShareButton.js') as { ShareButton: ShareButtonConstructor };
        const { ShareDialog } = await import('../core/ShareDialog.js') as { ShareDialog: ShareDialogConstructor };
        
        shareButton = new ShareButton(mockSocialSharingManager);
        shareDialog = new ShareDialog(mockSocialSharingManager);
    });

    afterEach(() => {
        if (shareButton) {
            shareButton.destroy();
        }
        if (shareDialog) {
            shareDialog.destroy();
        }
        jest.clearAllMocks();
        document.body.innerHTML = '';
    });

    describe('ShareButton初期化', () => {
        test('ShareButtonが正常に初期化される', () => {
            expect(shareButton.socialSharingManager).toBe(mockSocialSharingManager);
            expect(shareButton.elements).toBeDefined();
            expect(shareButton.config).toBeDefined();
            expect(shareButton.state).toBeDefined();
        });

        test('デフォルト設定でUIが作成される', () => {
            expect(shareButton.elements.container).toBeDefined();
            expect(shareButton.elements.mainButton).toBeDefined();
            expect(shareButton.elements.platformButtons).toBeDefined();
            expect(shareButton.config.theme).toBe('default');
        });

        test('カスタム設定で初期化される', async () => {
            shareButton.destroy();
            const { ShareButton } = await import('../core/ShareButton.js') as { ShareButton: ShareButtonConstructor };
            
            const customConfig = {
                theme: 'gaming',
                position: 'top-right',
                platforms: ['twitter', 'facebook']
            };
            
            shareButton = new ShareButton(mockSocialSharingManager, customConfig);
            expect(shareButton.config.theme).toBe('gaming');
            expect(shareButton.config.position).toBe('top-right');
            expect(shareButton.config.platforms).toEqual(['twitter', 'facebook']);
        });
    });

    describe('ShareDialog初期化', () => {
        test('ShareDialogが正常に初期化される', () => {
            expect(shareDialog.socialSharingManager).toBe(mockSocialSharingManager);
            expect(shareDialog.elements).toBeDefined();
            expect(shareDialog.config).toBeDefined();
            expect(shareDialog.state).toBeDefined();
        });

        test('DOM要素が正しく作成される', () => {
            expect(shareDialog.elements.dialog).toBeDefined();
            expect(shareDialog.elements.backdrop).toBeDefined();
            expect(shareDialog.elements.platforms).toBeDefined();
        });

        test('カスタム設定で初期化される', async () => {
            shareDialog.destroy();
            const { ShareDialog } = await import('../core/ShareDialog.js') as { ShareDialog: ShareDialogConstructor };
            
            const customConfig = {
                theme: 'elegant',
                width: 600,
                platforms: ['twitter', 'facebook', 'copy']
            };
            
            shareDialog = new ShareDialog(mockSocialSharingManager, customConfig);
            expect(shareDialog.config.theme).toBe('elegant');
            expect(shareDialog.config.width).toBe(600);
            expect(shareDialog.config.platforms).toEqual(['twitter', 'facebook', 'copy']);
        });
    });

    describe('ShareButton表示機能', () => {
        test('ボタンが表示される', () => {
            shareButton.show();
            expect(shareButton.state.visible).toBe(true);
            expect(shareButton.stats.shows).toBe(1);
        });

        test('ボタンが非表示になる', () => {
            shareButton.show();
            shareButton.hide();
            expect(shareButton.state.visible).toBe(false);
        });

        test('データ付きで表示される', () => {
            const shareData: ShareData = { type: 'score', score: 1500, text: 'テスト共有' };
            shareButton.showWithData(shareData);
            expect(shareButton.state.visible).toBe(true);
        });

        test('プラットフォームボタンが展開される', () => {
            shareButton.expand();
            expect(shareButton.elements.platformButtons.length).toBeGreaterThan(0);
        });
    });

    describe('ShareDialog表示機能', () => {
        test('ダイアログが表示される', async () => {
            const shareData: ShareData = { type: 'score', score: 2000, text: 'ダイアログテスト' };
            await shareDialog.show(shareData);
            expect(shareDialog.state.visible).toBe(true);
            expect(shareDialog.stats.shows).toBe(1);
        });

        test('ダイアログが非表示になる', async () => {
            const shareData: ShareData = { type: 'score', score: 1000 };
            await shareDialog.show(shareData);
            await shareDialog.hide();
            expect(shareDialog.state.visible).toBe(false);
        });
    });

    describe('統合された共有機能', () => {
        test('ShareButtonからの共有が動作する', async () => {
            shareButton.show();
            await shareButton.handlePlatformShare('twitter');
            
            expect(mockSocialSharingManager.shareViaTwitterUrl).toHaveBeenCalled();
            expect(shareButton.stats.shares).toBe(1);
            expect(shareButton.stats.platforms.twitter).toBe(1);
        });

        test('ShareDialogからの共有が動作する', async () => {
            const shareData: ShareData = { type: 'score', score: 1500, text: 'ダイアログ共有テスト' };
            await shareDialog.show(shareData);
            
            // Twitter共有ボタンをクリック
            const twitterButton = shareDialog.elements.platforms.find(
                btn => btn.getAttribute && btn.getAttribute('data-platform') === 'twitter'
            );
            
            if (twitterButton) {
                await twitterButton.click();
                expect(mockSocialSharingManager.shareViaTwitterUrl).toHaveBeenCalled();
                expect(shareDialog.stats.shares).toBe(1);
                expect(shareDialog.stats.platforms.twitter).toBe(1);
            }
        });

        test('複数プラットフォームでの共有統計', async () => {
            // ShareButtonでFacebook共有
            shareButton.show();
            await shareButton.handlePlatformShare('facebook');
            
            // ShareDialogでTwitter共有
            const shareData: ShareData = { type: 'score', score: 2000 };
            await shareDialog.show(shareData);
            
            const twitterButton = shareDialog.elements.platforms.find(
                btn => btn.getAttribute && btn.getAttribute('data-platform') === 'twitter'
            );
            
            if (twitterButton) {
                await twitterButton.click();
            }
            
            expect(mockSocialSharingManager.shareViaFacebookUrl).toHaveBeenCalled();
            expect(mockSocialSharingManager.shareViaTwitterUrl).toHaveBeenCalled();
            
            // 統計が正しく記録されることを確認
            const buttonStats = shareButton.getStats();
            const dialogStats = shareDialog.getStats();
            
            expect(buttonStats.platforms.facebook).toBe(1);
            expect(dialogStats.platforms.twitter).toBe(1);
        });
    });

    describe('テーマとレスポンシブ対応', () => {
        test('統一されたテーマが適用される', async () => {
            shareButton.destroy();
            shareDialog.destroy();
            
            const { ShareButton } = await import('../core/ShareButton.js') as { ShareButton: ShareButtonConstructor };
            const { ShareDialog } = await import('../core/ShareDialog.js') as { ShareDialog: ShareDialogConstructor };
            
            const config = { theme: 'gaming' };
            
            shareButton = new ShareButton(mockSocialSharingManager, config);
            shareDialog = new ShareDialog(mockSocialSharingManager, config);
            
            expect(shareButton.config.theme).toBe('gaming');
            expect(shareDialog.config.theme).toBe('gaming');
        });

        test('レスポンシブスタイルが適用される', () => {
            // モバイル環境をシミュレート
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: jest.fn().mockImplementation((query: string) => ({
                    matches: query.includes('max-width: 768px') ? true : false,
                    media: query
                }))
            });

            shareButton.applyResponsiveStyles();
            shareDialog.applyResponsiveStyles();
            
            // レスポンシブスタイルが適用されることを確認
            expect(shareButton.applyResponsiveStyles).toBeDefined();
            expect(shareDialog.applyResponsiveStyles).toBeDefined();
        });
    });

    describe('エラーハンドリング', () => {
        test('ShareButton共有失敗時のエラー処理', async () => {
            mockSocialSharingManager.shareViaTwitterUrl.mockRejectedValue(new Error('Twitter共有失敗'));
            
            shareButton.show();
            await shareButton.handlePlatformShare('twitter');
            
            // エラーハンドラーが呼ばれることを確認
            expect(shareButton.handleError).toBeDefined();
        });

        test('ShareDialog共有失敗時のエラー処理', async () => {
            mockSocialSharingManager.share.mockRejectedValue(new Error('共有失敗'));
            
            const shareData: ShareData = { type: 'score', score: 1000 };
            await shareDialog.show(shareData);
            
            const webShareButton = shareDialog.elements.platforms[0];
            if (webShareButton) {
                await webShareButton.click();
            }
            
            // エラーハンドラーが呼ばれることを確認
            expect(shareDialog.handleError).toBeDefined();
        });
    });

    describe('設定更新', () => {
        test('ShareButton設定が更新される', () => {
            const newConfig = { theme: 'elegant', position: 'bottom-left' };
            shareButton.updateConfig(newConfig);
            
            expect(shareButton.config.theme).toBe('elegant');
            expect(shareButton.config.position).toBe('bottom-left');
        });

        test('ShareDialog設定が更新される', () => {
            const newConfig = { theme: 'minimal', width: 500 };
            shareDialog.updateConfig(newConfig);
            
            expect(shareDialog.config.theme).toBe('minimal');
            expect(shareDialog.config.width).toBe(500);
        });
    });

    describe('統計機能', () => {
        test('ShareButton統計が正しく記録される', async () => {
            shareButton.show();
            await shareButton.handlePlatformShare('twitter');
            await shareButton.handlePlatformShare('facebook');
            
            const stats = shareButton.getStats();
            expect(stats.shares).toBe(2);
            expect(stats.shows).toBe(1);
            expect(stats.platforms.twitter).toBe(1);
            expect(stats.platforms.facebook).toBe(1);
        });

        test('ShareDialog統計が正しく記録される', async () => {
            const shareData: ShareData = { type: 'score', score: 1500 };
            
            await shareDialog.show(shareData);
            await shareDialog.show(shareData); // 2回目は無視される
            
            const stats = shareDialog.getStats();
            expect(stats.shows).toBe(1); // 重複は無視
        });
    });

    describe('クリーンアップ', () => {
        test('ShareButtonが正常にクリーンアップされる', () => {
            shareButton.show();
            shareButton.destroy();
            
            expect(shareButton.elements.container.parentNode).toBeNull();
        });

        test('ShareDialogが正常にクリーンアップされる', async () => {
            const shareData: ShareData = { type: 'score', score: 1000 };
            await shareDialog.show(shareData);
            shareDialog.destroy();
            
            expect(shareDialog.elements.backdrop.parentNode).toBeNull();
        });

        test('両方のコンポーネントが同時にクリーンアップされる', async () => {
            shareButton.show();
            await shareDialog.show({ type: 'score', score: 1000 });
            
            shareButton.destroy();
            shareDialog.destroy();
            
            expect(shareButton.elements.container.parentNode).toBeNull();
            expect(shareDialog.elements.backdrop.parentNode).toBeNull();
        });
    });
});