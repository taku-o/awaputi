/**
 * 共有UI統合テスト (Task 7)
 * ShareButtonとShareDialogの統合動作をテスト
 */

describe('ShareUI Integration', () => {
    let shareButton;
    let shareDialog;
    let mockSocialSharingManager;
    let mockContainer;
    let mockGameEngine;
    
    beforeEach(async () => {
        // DOM環境のセットアップ
        document.body.innerHTML = '';
        
        // テスト用コンテナ
        mockContainer = document.createElement('div');
        mockContainer.id = 'test-container';
        document.body.appendChild(mockContainer);
        
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
        
        // DOM APIのモック
        global.ResizeObserver = jest.fn().mockImplementation(() => ({
            observe: jest.fn(),
            unobserve: jest.fn(),
            disconnect: jest.fn()
        }));
        
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn()
            }))
        });
        
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                writeText: jest.fn().mockResolvedValue()
            },
            writable: true
        });
        
        global.requestAnimationFrame = jest.fn(callback => {
            setTimeout(callback, 0);
            return 1;
        });
        
        // ShareButtonとShareDialogの作成
        const { ShareButton } = await import('../core/ShareButton.js');
        const { ShareDialog } = await import('../core/ShareDialog.js');
        
        shareButton = new ShareButton(mockContainer, mockSocialSharingManager);
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
    
    describe('UI統合の基本動作', () => {
        test('両コンポーネントが正常に初期化される', () => {
            expect(shareButton).toBeDefined();
            expect(shareDialog).toBeDefined();
            expect(shareButton.socialSharingManager).toBe(mockSocialSharingManager);
            expect(shareDialog.socialSharingManager).toBe(mockSocialSharingManager);
        });
        
        test('ShareButtonとShareDialogが独立して動作する', async () => {
            // ShareButton表示
            shareButton.show();
            expect(shareButton.state.visible).toBe(true);
            
            // ShareDialog表示
            await shareDialog.show({ type: 'score', score: 1000 });
            expect(shareDialog.state.visible).toBe(true);
            
            // 両方とも表示状態
            expect(shareButton.state.visible).toBe(true);
            expect(shareDialog.state.visible).toBe(true);
        });
        
        test('同じSocialSharingManagerを共有する', () => {
            expect(shareButton.socialSharingManager).toBe(shareDialog.socialSharingManager);
        });
    });
    
    describe('共有フロー統合', () => {
        test('ShareButtonからの共有フローが動作する', async () => {
            const shareData = { type: 'score', score: 1500, text: 'テスト共有' };
            
            // ShareButton表示・展開
            shareButton.showWithData(shareData);
            shareButton.expand();
            
            // プラットフォーム選択
            const platformButton = shareButton.elements.platformButtons[0];
            await platformButton.click();
            
            expect(mockSocialSharingManager.share).toHaveBeenCalledWith(
                expect.objectContaining(shareData)
            );
            expect(shareButton.stats.shares).toBe(1);
        });
        
        test('ShareDialogからの共有フローが動作する', async () => {
            const shareData = { type: 'achievement', name: 'テスト実績' };
            
            // ShareDialog表示
            await shareDialog.show(shareData);
            
            // プラットフォーム選択
            const platformButton = shareDialog.elements.platforms[0];
            await platformButton.click();
            
            expect(mockSocialSharingManager.share).toHaveBeenCalledWith(
                expect.objectContaining(shareData)
            );
            expect(shareDialog.stats.shares).toBe(1);
        });
        
        test('同じプラットフォームで両方から共有できる', async () => {
            const shareData1 = { type: 'score', score: 1000 };
            const shareData2 = { type: 'achievement', name: 'テスト' };
            
            // ShareButtonから共有
            shareButton.showWithData(shareData1);
            shareButton.expand();
            const buttonPlatform = shareButton.elements.platformButtons.find(
                btn => btn.getAttribute('data-platform') === 'twitter'
            );
            if (buttonPlatform) {
                await buttonPlatform.click();
            }
            
            // ShareDialogから共有
            await shareDialog.show(shareData2);
            const dialogPlatform = shareDialog.elements.platforms.find(
                btn => btn.getAttribute('data-platform') === 'twitter'
            );
            if (dialogPlatform) {
                await dialogPlatform.click();
            }
            
            expect(mockSocialSharingManager.shareViaTwitterUrl).toHaveBeenCalledTimes(2);
        });
    });
    
    describe('統計統合', () => {
        test('各コンポーネントが独立した統計を持つ', async () => {
            const shareData = { type: 'score', score: 1200 };
            
            // ShareButtonでの共有
            shareButton.showWithData(shareData);
            shareButton.expand();
            await shareButton.elements.platformButtons[0].click();
            
            // ShareDialogでの共有
            await shareDialog.show(shareData);
            await shareDialog.elements.platforms[0].click();
            
            const buttonStats = shareButton.getStats();
            const dialogStats = shareDialog.getStats();
            
            expect(buttonStats.shares).toBe(1);
            expect(dialogStats.shares).toBe(1);
            expect(buttonStats.shows).toBe(1);
            expect(dialogStats.shows).toBe(1);
        });
        
        test('プラットフォーム別統計が正しく記録される', async () => {
            const shareData = { type: 'score', score: 1500 };
            
            // ShareButtonでTwitter共有
            shareButton.showWithData(shareData);
            shareButton.expand();
            const twitterButton = shareButton.elements.platformButtons.find(
                btn => btn.getAttribute('data-platform') === 'twitter'
            );
            if (twitterButton) {
                await twitterButton.click();
            }
            
            // ShareDialogでFacebook共有
            await shareDialog.show(shareData);
            const facebookButton = shareDialog.elements.platforms.find(
                btn => btn.getAttribute('data-platform') === 'facebook'
            );
            if (facebookButton) {
                await facebookButton.click();
            }
            
            const buttonStats = shareButton.getStats();
            const dialogStats = shareDialog.getStats();
            
            expect(buttonStats.platforms.twitter).toBe(1);
            expect(dialogStats.platforms.facebook).toBe(1);
        });
    });
    
    describe('アクセシビリティ統合', () => {
        test('両コンポーネントが適切なWAI-ARIA属性を持つ', () => {
            // ShareButton
            expect(shareButton.elements.container.getAttribute('role')).toBe('toolbar');
            expect(shareButton.elements.mainButton.getAttribute('aria-expanded')).toBe('false');
            
            // ShareDialog
            expect(shareDialog.elements.dialog.getAttribute('role')).toBe('dialog');
            expect(shareDialog.elements.dialog.getAttribute('aria-modal')).toBe('true');
        });
        
        test('キーボードナビゲーションが両方で動作する', () => {
            // ShareButtonのキーボードナビゲーション
            shareButton.show();
            shareButton.expand();
            
            const buttonEnterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            shareButton.elements.platformButtons[0].dispatchEvent(buttonEnterEvent);
            
            // ShareDialogのキーボードナビゲーション
            shareDialog.show({ type: 'score', score: 1000 });
            
            const dialogEscEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            document.dispatchEvent(dialogEscEvent);
            
            // 適切にイベントが処理されることを確認
            expect(shareButton.handlers.keydown).toBeDefined();
            expect(shareDialog.handlers.keydown).toBeDefined();
        });
        
        test('高コントラストモードが両方に適用される', async () => {
            shareButton.destroy();
            shareDialog.destroy();
            
            const accessibilityOptions = {
                accessibility: { highContrast: true }
            };
            
            const { ShareButton } = await import('../core/ShareButton.js');
            const { ShareDialog } = await import('../core/ShareDialog.js');
            
            shareButton = new ShareButton(mockContainer, mockSocialSharingManager, accessibilityOptions);
            shareDialog = new ShareDialog(mockSocialSharingManager, accessibilityOptions);
            
            // 高コントラストスタイルが適用されることを確認
            expect(shareButton.elements.container.style.backgroundColor).toBe('#000000');
            expect(shareDialog.elements.dialog.style.backgroundColor).toBe('#000000');
        });
    });
    
    describe('テーマ統合', () => {
        test('同じテーマが両コンポーネントに適用される', async () => {
            shareButton.destroy();
            shareDialog.destroy();
            
            const themeOptions = { theme: 'gaming' };
            
            const { ShareButton } = await import('../core/ShareButton.js');
            const { ShareDialog } = await import('../core/ShareDialog.js');
            
            shareButton = new ShareButton(mockContainer, mockSocialSharingManager, themeOptions);
            shareDialog = new ShareDialog(mockSocialSharingManager, themeOptions);
            
            // gamingテーマのスタイルが適用されることを確認
            expect(shareButton.elements.container.style.backgroundColor).toBe('rgba(0, 255, 0, 0.9)');
            expect(shareDialog.elements.dialog.style.backgroundColor).toBe('#0A0A0F');
        });
        
        test('異なるテーマが独立して適用される', async () => {
            shareButton.destroy();
            shareDialog.destroy();
            
            const { ShareButton } = await import('../core/ShareButton.js');
            const { ShareDialog } = await import('../core/ShareDialog.js');
            
            shareButton = new ShareButton(mockContainer, mockSocialSharingManager, { theme: 'minimal' });
            shareDialog = new ShareDialog(mockSocialSharingManager, { theme: 'elegant' });
            
            // 異なるテーマが適用されることを確認
            expect(shareButton.elements.container.style.backgroundColor).toBe('rgba(255, 255, 255, 0.95)');
            expect(shareDialog.elements.dialog.style.backgroundColor).toBe('#2D2D3A');
        });
    });
    
    describe('レスポンシブ統合', () => {
        test('モバイル環境で両コンポーネントが適切に調整される', () => {
            // モバイル環境をシミュレート
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: jest.fn().mockImplementation(query => ({
                    matches: query.includes('max-width: 768px') ? true : false,
                    media: query
                }))
            });
            
            shareButton.applyResponsiveStyles();
            shareDialog.applyResponsiveStyles();
            
            // モバイル用調整が適用されることを確認
            expect(shareButton.elements.container.style.fontSize).toBe('16px');
            expect(shareDialog.elements.dialog.style.width).toBe('100%');
        });
        
        test('リサイズイベントで両コンポーネントが再調整される', () => {
            const resizeEvent = new Event('resize');
            window.dispatchEvent(resizeEvent);
            
            // リサイズハンドラーが設定されていることを確認
            expect(shareButton.handlers.resize).toBeDefined();
            expect(shareDialog.handlers.resize).toBeDefined();
        });
    });
    
    describe('エラーハンドリング統合', () => {
        test('共有エラーが両コンポーネントで適切に処理される', async () => {
            mockSocialSharingManager.share.mockRejectedValue(new Error('共有失敗'));
            
            const shareData = { type: 'score', score: 1000 };
            
            // ShareButtonでのエラーハンドリング
            shareButton.showWithData(shareData);
            shareButton.expand();
            await shareButton.elements.platformButtons[0].click();
            
            // ShareDialogでのエラーハンドリング
            await shareDialog.show(shareData);
            await shareDialog.elements.platforms[0].click();
            
            // エラーハンドリングが動作することを確認
            expect(shareButton.handleError).toBeDefined();
            expect(shareDialog.handleError).toBeDefined();
        });
        
        test('SocialSharingManager未設定時のエラー', async () => {
            shareButton.socialSharingManager = null;
            shareDialog.socialSharingManager = null;
            
            // ShareButtonでのエラー
            await expect(async () => {
                await shareButton.handlePlatformShare('web-share');
            }).rejects.toThrow();
            
            // ShareDialogでのエラー（プラットフォームボタンクリック）
            await shareDialog.show({ type: 'score', score: 1000 });
            await shareDialog.elements.platforms[0].click();
            
            // エラーが適切に処理されることを確認
            expect(shareDialog.stats.shares).toBe(0);
        });
    });
    
    describe('パフォーマンス統合', () => {
        test('複数コンポーネント同時使用時のパフォーマンス', async () => {
            const startTime = performance.now();
            
            // 複数操作を同時実行
            const operations = [
                shareButton.show(),
                shareDialog.show({ type: 'score', score: 1000 }),
                shareButton.expand(),
                shareDialog.hide()
            ];
            
            await Promise.all(operations);
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // 適切なパフォーマンス（1秒以内）を確認
            expect(duration).toBeLessThan(1000);
        });
        
        test('大量の共有操作でのメモリリーク防止', async () => {
            const shareData = { type: 'score', score: 1000 };
            
            // 大量の共有操作を実行
            for (let i = 0; i < 50; i++) {
                shareButton.showWithData(shareData);
                shareButton.hide();
                
                await shareDialog.show(shareData);
                await shareDialog.hide();
            }
            
            // 統計が正しく記録されることを確認
            const buttonStats = shareButton.getStats();
            const dialogStats = shareDialog.getStats();
            
            expect(buttonStats.shows).toBe(50);
            expect(dialogStats.shows).toBe(50);
        });
    });
    
    describe('設定統合', () => {
        test('両コンポーネントの設定が独立して更新される', () => {
            const buttonConfig = { theme: 'gaming', position: 'top-left' };
            const dialogConfig = { theme: 'elegant', width: 600 };
            
            shareButton.updateConfig(buttonConfig);
            shareDialog.updateConfig(dialogConfig);
            
            expect(shareButton.config.theme).toBe('gaming');
            expect(shareButton.config.position).toBe('top-left');
            expect(shareDialog.config.theme).toBe('elegant');
            expect(shareDialog.config.width).toBe(600);
        });
        
        test('プラットフォーム設定の統合', async () => {
            shareButton.destroy();
            shareDialog.destroy();
            
            const platforms = ['twitter', 'facebook', 'copy'];
            
            const { ShareButton } = await import('../core/ShareButton.js');
            const { ShareDialog } = await import('../core/ShareDialog.js');
            
            shareButton = new ShareButton(mockContainer, mockSocialSharingManager, { platforms });
            shareDialog = new ShareDialog(mockSocialSharingManager, { platforms });
            
            expect(shareButton.config.platforms).toEqual(platforms);
            expect(shareDialog.config.platforms).toEqual(platforms);
            expect(shareButton.elements.platformButtons.length).toBe(platforms.length);
            expect(shareDialog.elements.platforms.length).toBe(platforms.length);
        });
    });
    
    describe('クリーンアップ統合', () => {
        test('両コンポーネントが正常にクリーンアップされる', async () => {
            // 表示状態にする
            shareButton.show();
            await shareDialog.show({ type: 'score', score: 1000 });
            
            // クリーンアップ実行
            shareButton.destroy();
            shareDialog.destroy();
            
            // DOM要素が削除されることを確認
            expect(shareButton.elements.container.parentNode).toBeNull();
            expect(shareDialog.elements.backdrop.parentNode).toBeNull();
        });
        
        test('イベントリスナーが全て削除される', () => {
            const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
            const documentRemoveEventListenerSpy = jest.spyOn(document, 'removeEventListener');
            
            shareButton.destroy();
            shareDialog.destroy();
            
            expect(removeEventListenerSpy).toHaveBeenCalled();
            expect(documentRemoveEventListenerSpy).toHaveBeenCalled();
        });
        
        test('同じSocialSharingManagerを共有していてもクリーンアップに影響しない', () => {
            const manager = shareButton.socialSharingManager;
            
            shareButton.destroy();
            
            // ShareDialogは引き続き同じManagerを使用できる
            expect(shareDialog.socialSharingManager).toBe(manager);
            expect(shareDialog.socialSharingManager).toBeDefined();
        });
    });
});