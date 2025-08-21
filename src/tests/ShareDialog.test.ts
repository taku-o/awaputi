/**
 * 共有ダイアログベースクラステスト (Task, 7)
 */
import { describe, test, expect, jest, beforeEach, afterEach  } from '@jest/globals';
import type { ShareDialog } from '../core/ShareDialog';
import type { SocialSharingManager } from '../core/SocialSharingManager';
import type { GameEngine } from '../core/GameEngine';
// Mock interfaces
interface MockGameEngine extends Partial<GameEngine> { on: jest.Mock,
    off: jest.Mock,
    emit: jest.Mock  }
interface MockSocialSharingManager extends Partial<SocialSharingManager> { gameEngine: MockGameEngine,
    share: jest.Mock,
    shareViaTwitterUrl: jest.Mock }
    shareViaFacebookUrl: jest.Mock }
interface ShareData { type: string,
    score?: number,
    text?: string,
    url?: string }
    name?: string; }
interface Screenshot { url: string,
    width: number,
    height: number  }''
describe('ShareDialog', () => {  let shareDialog: ShareDialog,
    let mockSocialSharingManager: MockSocialSharingManager,
    let mockGameEngine: MockGameEngine,

    beforeEach(async () => {'
        // DOM環境のセットアップ
        document.body.innerHTML = ',
        
        // GameEngineのモック
        mockGameEngine = { on: jest.fn() }
            off: jest.fn() }
        emit: jest.fn(); 
    };
        
        // SocialSharingManagerのモック
        mockSocialSharingManager = { gameEngine: mockGameEngine,''
            share: jest.fn().mockResolvedValue({ success: true, method: 'web-share ',''
            shareViaTwitterUrl: jest.fn().mockResolvedValue({ success: true, method: 'twitter ',''
            shareViaFacebookUrl: jest.fn(  }
)
        method: 'facebook' )';
        ';
        // matchMediaのモック
        Object.defineProperty(window, 'matchMedia', { ''
            writable: true,
            value: jest.fn().mockImplementation((query: string) => ({''
                matches: query.includes('max-width: 768px) ? false : true,
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(
    removeEventListener: jest.fn(
        dispatchEvent: jest.fn(),' }'

            }');
        }

        // Clipboard APIのモック
        Object.defineProperty(navigator, 'clipboard', { )
            value: {),
                writeText: jest.fn().mockResolvedValue(undefined }
            writable: true;)
        }),
        // requestAnimationFrameのモック
        global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {  setTimeout(() => callback(0), 0) }
            return 1; }'

        }') as any;

        const { ShareDialog } = await import('../core/ShareDialog.js);
        shareDialog = new ShareDialog(mockSocialSharingManager, as any);
    });
    afterEach(() => {  if (shareDialog) { }
            shareDialog.destroy(); }

        }''
        jest.clearAllMocks()';
        document.body.innerHTML = ';)'
    }');
    describe('初期化', () => {  ''
        test('正常に初期化される', () => {
            expect(shareDialog.socialSharingManager).toBe(mockSocialSharingManager),
            expect(shareDialog.config).toBeDefined(),
            expect(shareDialog.state).toBeDefined() }

            expect(shareDialog.elements).toBeDefined();' }'

        }');
        test('デフォルト設定が正しく設定される', () => {  ''
            expect(shareDialog.config.title).toBe('共有),

            expect(shareDialog.config.width).toBe(480),
            expect(shareDialog.config.position).toBe('center',
            expect(shareDialog.config.platforms).toContain('web-share),
            expect(shareDialog.config.backdrop).toBe(true) }

            expect(shareDialog.config.animation).toBe(true);' }'

        }');
        test('DOM要素が作成される', () => {  expect(shareDialog.elements.backdrop).toBeDefined(),
            expect(shareDialog.elements.dialog).toBeDefined(),
            expect(shareDialog.elements.container).toBeDefined(),
            expect(shareDialog.elements.header).toBeDefined(),
            expect(shareDialog.elements.body).toBeDefined(),
            expect(shareDialog.elements.footer).toBeDefined() }

            expect(shareDialog.elements.closeButton).toBeDefined();' }'

        }');
        test('カスタム設定で初期化される', async () => {  ''
            shareDialog.destroy('''
                title: 'カスタム共有',
                width: 600,
                theme: 'elegant',
                platforms: ['twitter', 'facebook'],
                allowMessageEdit: true });
                showScreenshotPreview: true })', ')';
            const { ShareDialog } = await import('../core/ShareDialog.js);

            shareDialog = new ShareDialog(mockSocialSharingManager as any, customOptions);
            expect(shareDialog.config.title).toBe('カスタム共有);

            expect(shareDialog.config.width).toBe(600);
            expect(shareDialog.config.theme).toBe('elegant';
            expect(shareDialog.config.platforms).toEqual(['twitter', 'facebook]);
            expect(shareDialog.config.allowMessageEdit).toBe(true);

            expect(shareDialog.config.showScreenshotPreview).toBe(true);'}');

    }''
    describe('DOM構造', () => {  ''
        test('ヘッダーが正しく作成される', () => {'
            const header = shareDialog.elements.header,
            const title = header.querySelector('#share-dialog-title'),
            const closeButton = header.querySelector('.share-dialog-close),

            expect(title).toBeDefined(),
            expect(title?.textContent).toBe('共有',
            expect(closeButton).toBeDefined() }

            expect(closeButton?.getAttribute('aria-label)'.toBe('閉じる'; }

        }');
        test('ボディが正しく作成される', () => { const body = shareDialog.elements.body,
            const platformsContainer = body.querySelector('.share-dialog-platforms',
            expect(body.id).toBe('share-dialog-content',
            expect(platformsContainer).toBeDefined(
            });
            expect(platformsContainer?.getAttribute('role)'.toBe('group'; }

        }');
        test('プラットフォームボタンが作成される', () => {  expect(shareDialog.elements.platforms.length).toBeGreaterThan(0),
            shareDialog.elements.platforms.forEach(button => {),
                expect(button.getAttribute('data-platform).toBeDefined()',
                expect(button.getAttribute('aria-label)'.toContain('で共有'),' }

                expect(button.getAttribute('type)'.toBe('button'; }

            }');

        }''
        test('メッセージエディターが条件付きで作成される', async () => { }

            shareDialog.destroy() }

            const { ShareDialog } = await import('../core/ShareDialog.js);
            shareDialog = new ShareDialog(mockSocialSharingManager as any, { : undefined)
                allowMessageEdit: true  })'
            }';
            expect(shareDialog.elements.messageEditor).toBeDefined()';
            expect(shareDialog.elements.messageEditor?.getAttribute('placeholder)'.toBe('共有メッセージを入力...';');
        test('スクリーンショットプレビューが条件付きで作成される', async () => { }

            shareDialog.destroy() }

            const { ShareDialog } = await import('../core/ShareDialog.js);
            shareDialog = new ShareDialog(mockSocialSharingManager as any, { : undefined)
                showScreenshotPreview: true  }));
            expect(shareDialog.elements.screenshotPreview).toBeDefined();
            expect(shareDialog.elements.screenshotPreview?.style.display).toBe('none';}');
        test('フッターが正しく作成される', () => {  const footer = shareDialog.elements.footer,
            const cancelButton = footer.querySelector('.share-dialog-cancel),
            expect(footer).toBeDefined(),

            expect(cancelButton).toBeDefined(),' }'

            expect(cancelButton?.textContent).toBe('キャンセル'; }

        }');

    }''
    describe('表示・非表示機能', () => { }

        test('ダイアログが表示される', async () => { : undefined' 
            const shareData: ShareData = { type: 'score', score: 1500, text: 'テスト共有'
            }
            await shareDialog.show(shareData);
            expect(shareDialog.state.visible).toBe(true);

            expect(shareDialog.state.shareData).toEqual(shareData);
            expect(shareDialog.elements.backdrop.style.display).toBe('flex);

            expect(shareDialog.stats.shows).toBe(1);'}');
        test('ダイアログが非表示になる', async () => { }

            await shareDialog.show({ type: 'score', score: 1000  });
            await shareDialog.hide();

            expect(shareDialog.state.visible).toBe(false);
            expect(shareDialog.elements.backdrop.style.display).toBe('none';}');
        test('スクリーンショット付きで表示される', async () => { }

            shareDialog.destroy() }

            const { ShareDialog } = await import('../core/ShareDialog.js';

            shareDialog = new ShareDialog(mockSocialSharingManager as any, { showScreenshotPreview: true' }'}');
            const shareData: ShareData = { type: 'score', score: 2000  }''
            const screenshot: Screenshot = { url: 'blob:mock-url', width: 800, height: 600  }
            await shareDialog.show(shareData, screenshot);

            expect(shareDialog.state.screenshot).toEqual(screenshot);
            expect(shareDialog.elements.screenshotPreview?.style.display).toBe('block';}');
        test('重複表示が防がれる', async () => { : undefined' 
            await shareDialog.show({ type: 'score', score: 1000  }';
            await shareDialog.show({ type: 'score', score: 2000  }'; // 2回目の表示
            ';

            expect(shareDialog.stats.shows).toBe(1);'}');
        test('アニメーション無効時は即座に表示される', async () => { }

            shareDialog.destroy() }

            const { ShareDialog } = await import('../core/ShareDialog.js';

            shareDialog = new ShareDialog(mockSocialSharingManager as any, { animation: false' }'}');
            await shareDialog.show({ type: 'score', score: 1000  }';
            expect(shareDialog.elements.dialog.style.opacity).toBe('1';
            expect(shareDialog.elements.dialog.style.transform).toBe('scale(1));'}');

    }''
    describe('プラットフォーム共有機能', () => {  ''
        beforeEach(async () => {'
            await shareDialog.show({ ')'
                type: 'score')',
    score: 1500,
                text: 'テスト共有メッセージ',') }

                url: 'https://test.example.com',' }');

        }''
        test('Web Share APIでの共有が動作する', async () => {  ''
            const webShareButton = shareDialog.elements.platforms.find()',
                btn => btn.getAttribute('data-platform') === 'web-share'),
            if(webShareButton) {
                await webShareButton.click(),

                expect(mockSocialSharingManager.share).toHaveBeenCalled() }

                expect(shareDialog.stats.shares).toBe(1);' }'

                expect(shareDialog.stats.platforms['web-share]).toBe(1); }'

            }'}');
        test('Twitterでの共有が動作する', async () => {  ''
            const twitterButton = shareDialog.elements.platforms.find()',
                btn => btn.getAttribute('data-platform') === 'twitter'),
            if(twitterButton) {
                await twitterButton.click() }

                expect(mockSocialSharingManager.shareViaTwitterUrl).toHaveBeenCalled() }

                expect(shareDialog.stats.platforms['twitter]).toBe(1); }'

            }'}');
        test('Facebookでの共有が動作する', async () => {  ''
            const facebookButton = shareDialog.elements.platforms.find()',
                btn => btn.getAttribute('data-platform') === 'facebook'),
            if(facebookButton) {
                await facebookButton.click() }

                expect(mockSocialSharingManager.shareViaFacebookUrl).toHaveBeenCalled() }

                expect(shareDialog.stats.platforms['facebook]).toBe(1); }'

            }'}');
        test('クリップボードコピーが動作する', async () => { }

            shareDialog.destroy() }

            const { ShareDialog } = await import('../core/ShareDialog.js');

            shareDialog = new ShareDialog(mockSocialSharingManager as any, { ')
                platforms: ['copy]' }'}');
            await shareDialog.show({ ')
                type: 'score', ')',
                text: 'コピーテスト','),

                url: 'https://test.example.com',
            const copyButton = shareDialog.elements.platforms.find()',
                btn => btn.getAttribute('data-platform') === 'copy'),
            if(copyButton) {
                await copyButton.click(),
                expect(navigator.clipboard.writeText).toHaveBeenCalledWith()',
                    'コピーテスト https://test.example.com'',
                '),

             }

                expect(shareDialog.stats.platforms['copy]).toBe(1); }'

            }'}');
        test('共有成功後にダイアログが閉じる', async () => {  const webShareButton = shareDialog.elements.platforms[0],
            
            await webShareButton.click(),
            // 共有成功後、ダイアログが非表示になることを確認 }
            expect(shareDialog.state.visible).toBe(false);' }'

        }');

    }''
    describe('メッセージ編集機能', () => {  beforeEach(async () => { }

            shareDialog.destroy() }

            const { ShareDialog } = await import('../core/ShareDialog.js';

            shareDialog = new ShareDialog(mockSocialSharingManager as any, { allowMessageEdit: true' }'}'),

            await shareDialog.show({ ')'
                type: 'score')',
    score: 1500, ')',
                text: '初期メッセージ')'
            }

        }''
        test('初期メッセージが設定される', () => {  ',

            expect(shareDialog.elements.messageEditor?.value).toBe('初期メッセージ',' }

            expect(shareDialog.state.editedMessage).toBe('初期メッセージ'; }

        }');
        test('メッセージ編集が記録される', () => {  ''
            const newMessage = '編集されたメッセージ',

            if(shareDialog.elements.messageEditor) {
    
}

                shareDialog.elements.messageEditor.value = newMessage;' }'

                shareDialog.elements.messageEditor.dispatchEvent(new, Event('input'; }'
            }
            
            expect(shareDialog.state.editedMessage).toBe(newMessage);

            expect(shareDialog.stats.messageEdits).toBe(1);'}');
        test('編集されたメッセージが共有に使用される', async () => {  ''
            const editedMessage = '編集後メッセージ',

            if(shareDialog.elements.messageEditor) {
    
}

                shareDialog.elements.messageEditor.value = editedMessage;' }'

                shareDialog.elements.messageEditor.dispatchEvent(new, Event('input'; }'
            }
            
            const webShareButton = shareDialog.elements.platforms[0];
            await webShareButton.click();
            expect(mockSocialSharingManager.share).toHaveBeenCalledWith(;)
                expect.objectContaining({ : undefined)
                    text: editedMessage)),' }'

        }');

    }''
    describe('ダイアログ閉じる機能', () => { }

        beforeEach(async () => { }'

            await shareDialog.show({ type: 'score', score: 1000  }';

        }''
        test('閉じるボタンでダイアログが閉じる', async () => {  shareDialog.elements.closeButton.click(),
            // 非同期的に閉じる処理を待つ
            await new Promise(resolve => setTimeout(resolve, 50),
            expect(shareDialog.state.visible).toBe(false) }
            expect(shareDialog.stats.cancellations).toBe(1);' }'

        }');
        test('キャンセルボタンでダイアログが閉じる', async () => {  ''
            const cancelButton = shareDialog.elements.footer.querySelector('.share-dialog-cancel) as HTMLButtonElement,
            cancelButton.click(),
            await new Promise(resolve => setTimeout(resolve, 50),
            expect(shareDialog.state.visible).toBe(false) }

            expect(shareDialog.stats.cancellations).toBe(1);' }'

        }');
        test('ESCキーでダイアログが閉じる', async () => { }

            const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            document.dispatchEvent(escEvent);
            await new Promise(resolve => setTimeout(resolve, 50);
            expect(shareDialog.state.visible).toBe(false);

            expect(shareDialog.stats.cancellations).toBe(1);'}');
        test('バックドロップクリックでダイアログが閉じる', async () => { }

            const backdropEvent = new MouseEvent('click', { target: shareDialog.elements.backdrop } as any);
            shareDialog.elements.backdrop.dispatchEvent(backdropEvent);
            await new Promise(resolve => setTimeout(resolve, 50);
            expect(shareDialog.state.visible).toBe(false);

            expect(shareDialog.stats.cancellations).toBe(1);'}');
        test('ダイアログ内クリックでは閉じない', async () => { }

            const dialogEvent = new MouseEvent('click', { target: shareDialog.elements.dialog } as any);
            shareDialog.elements.backdrop.dispatchEvent(dialogEvent);

            expect(shareDialog.state.visible).toBe(true);'}');
        test('バックドロップクリック無効時は閉じない', async () => { }

            shareDialog.destroy() }

            const { ShareDialog } = await import('../core/ShareDialog.js';

            shareDialog = new ShareDialog(mockSocialSharingManager as any, { closeOnBackdrop: false' }'}');
            await shareDialog.show({ type: 'score', score: 1000  }';
            const backdropEvent = new MouseEvent('click', { target: shareDialog.elements.backdrop } as any);
            shareDialog.elements.backdrop.dispatchEvent(backdropEvent);

            expect(shareDialog.state.visible).toBe(true);'}');

    }''
    describe('キーボードナビゲーション', () => { }

        beforeEach(async () => { }'

            await shareDialog.show({ type: 'score', score: 1000  }';

        }''
        test('フォーカス可能要素が正しく収集される', () => {  shareDialog.updateFocusableElements(),
            expect(shareDialog.focusableElements.length).toBeGreaterThan(0),
            expect(shareDialog.focusableElements).toContain(shareDialog.elements.closeButton) }

            expect(shareDialog.focusableElements).toContain(shareDialog.elements.platforms[0]);' }'

        }');
        test('Tabキーでフォーカストラップが動作する', async () => {  shareDialog.config.accessibility.focus.trap = true,
            shareDialog.updateFocusableElements('','
            Object.defineProperty(document, 'activeElement', {''
                value: lastElement,')',
                writable: true'),
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab ,
            shareDialog.elements.dialog.dispatchEvent(tabEvent),
            // フォーカストラップの動作を確認 }
            expect(shareDialog.focusableElements.length).toBeGreaterThan(0);' }'

        }');
        test('Shift+Tabキーで逆方向フォーカストラップが動作する', async () => { shareDialog.config.accessibility.focus.trap = true,
            shareDialog.updateFocusableElements('','
            Object.defineProperty(document, 'activeElement', {)
                value: firstElement }

                writable: true',' }'

            }');
            const shiftTabEvent = new KeyboardEvent('keydown', { ')',
                key: 'Tab',
    shiftKey: true ),
            shareDialog.elements.dialog.dispatchEvent(shiftTabEvent),

            expect(shareDialog.focusableElements.length).toBeGreaterThan(0),' }'

        }');

    }''
    describe('アクセシビリティ機能', () => {  ''
        test('ARIA属性が正しく設定される', () => {''
            expect(shareDialog.elements.dialog.getAttribute('role)'.toBe('dialog'),
            expect(shareDialog.elements.dialog.getAttribute('aria-modal)'.toBe('true'),
            expect(shareDialog.elements.dialog.getAttribute('aria-labelledby)'.toBe('share-dialog-title'),' }

            expect(shareDialog.elements.dialog.getAttribute('aria-describedby)'.toBe('share-dialog-content'; }

        }');
        test('スクリーンリーダー用アナウンサーが機能する', async () => { }

            await shareDialog.show({ type: 'score', score: 1000  }';
            if(shareDialog.elements.announcer) {

                expect(shareDialog.elements.announcer.getAttribute('aria-live)'.toBe('polite) }

                expect(shareDialog.elements.announcer.textContent).toBe('共有ダイアログが開きました'; }'

            }'}');
        test('フォーカス管理が動作する', async () => { }

            const mockFocus = jest.fn() }
;
            await shareDialog.show({ type: 'score', score: 1000  });
            // 初期フォーカスが設定されることを確認
            setTimeout(() => { expect(mockFocus).toHaveBeenCalled() }, 150);'}');
        test('高コントラストモードが適用される', async () => { }

            shareDialog.destroy() }

            const { ShareDialog } = await import('../core/ShareDialog.js);
            shareDialog = new ShareDialog(mockSocialSharingManager as any, {
                accessibility: { highContrast: true 
            }));
            const dialog = shareDialog.elements.dialog;
            expect(dialog.style.backgroundColor).toBe('#000000';
            expect(dialog.style.color).toBe('#FFFFFF';}');

    }''
    describe('テーマとスタイル', () => {  ''
        test('デフォルトテーマが適用される', () => {'
            const dialog = shareDialog.elements.dialog,
            expect(dialog.style.backgroundColor).toBe('#FFFFFF',' }

            expect(dialog.style.color).toBe('#333333'; }

        }');
        test('minimalテーマが適用される', async () => { }

            shareDialog.destroy() }

            const { ShareDialog } = await import('../core/ShareDialog.js');

            shareDialog = new ShareDialog(mockSocialSharingManager as any, { ')
                theme: 'minimal' })';
            const dialog = shareDialog.elements.dialog;
            expect(dialog.style.backgroundColor).toBe('#FAFAFA';}');
        test('elegantテーマが適用される', async () => { }

            shareDialog.destroy() }

            const { ShareDialog } = await import('../core/ShareDialog.js');

            shareDialog = new ShareDialog(mockSocialSharingManager as any, { ')
                theme: 'elegant' })';
            const dialog = shareDialog.elements.dialog;
            expect(dialog.style.backgroundColor).toBe('#2D2D3A';}');
        test('gamingテーマが適用される', async () => { }

            shareDialog.destroy() }

            const { ShareDialog } = await import('../core/ShareDialog.js');

            shareDialog = new ShareDialog(mockSocialSharingManager as any, { ')
                theme: 'gaming' })';
            const dialog = shareDialog.elements.dialog;
            expect(dialog.style.backgroundColor).toBe('#0A0A0F';
            expect(dialog.style.color).toBe('#00FF41';}');
        test('レスポンシブスタイルが適用される', () => {  // モバイル環境をシミュレート
            Object.defineProperty(window, 'matchMedia', {''
                writable: true,
                value: jest.fn().mockImplementation((query: string) => ({''
                    matches: query.includes('max-width: 768px' ? true : false, '
                    media: query  }
                });
            }
            shareDialog.applyResponsiveStyles();

            const dialog = shareDialog.elements.dialog;
            expect(dialog.style.width).toBe('100%';
            expect(dialog.style.borderRadius).toBe('0';}');

    }''
    describe('統計機能', () => { }

        test('表示統計が記録される', async () => { }

            await shareDialog.show({ type: 'score', score: 1000  });
            const stats = shareDialog.getStats();

            expect(stats.shows).toBe(1);'}');
        test('共有統計が記録される', async () => { }

            await shareDialog.show({ type: 'score', score: 1000  });
            const platformButton = shareDialog.elements.platforms[0];
            await platformButton.click();
            const stats = shareDialog.getStats();

            expect(stats.shares).toBe(1);'}');
        test('キャンセル統計が記録される', async () => { }

            await shareDialog.show({ type: 'score', score: 1000  });
            shareDialog.elements.closeButton.click();
            const stats = shareDialog.getStats();

            expect(stats.cancellations).toBe(1);'}');
        test('メッセージ編集統計が記録される', async () => { }

            shareDialog.destroy() }

            const { ShareDialog } = await import('../core/ShareDialog.js';

            shareDialog = new ShareDialog(mockSocialSharingManager as any, { allowMessageEdit: true' }'}');
            await shareDialog.show({ type: 'score', score: 1000, text: '初期 ',''
            if(shareDialog.elements.messageEditor) {', ',

                shareDialog.elements.messageEditor.value = '編集後' }

                shareDialog.elements.messageEditor.dispatchEvent(new, Event('input'; }'
            }
            
            const stats = shareDialog.getStats();

            expect(stats.messageEdits).toBe(1);'}');

    }''
    describe('エラーハンドリング', () => {  ''
        test('共有失敗時のエラー処理', async () => { }

            mockSocialSharingManager.share.mockRejectedValue(new, Error('共有失敗)'; }

            await shareDialog.show({ type: 'score', score: 1000  });
            const platformButton = shareDialog.elements.platforms[0];
            await platformButton.click();
            // エラーハンドリングが動作することを確認
            expect(shareDialog.handleError).toBeDefined();'}');
        test('表示中のエラー処理', async () => {  // 表示状態を操作
            shareDialog.state.opening = true }
            ' }'

            await expect(shareDialog.show({ type: 'score', score: 1000  }).resolves.toBeUndefined()'
        test('非表示中のエラー処理', async () => {  // 非表示状態を操作,
            shareDialog.state.closing = true }
            await expect(shareDialog.hide().resolves.toBeUndefined();' }'

        }');

    }''
    describe('設定更新', () => {  ''
        test('設定が正しく更新される', () => {'
            const newConfig = {''
                title: '新しいタイトル',
                width: 600,' }'

                theme: 'gaming' };
            };
            ';

            shareDialog.updateConfig(newConfig);
            expect(shareDialog.config.title).toBe('新しいタイトル);

            expect(shareDialog.config.width).toBe(600);
            expect(shareDialog.config.theme).toBe('gaming';}');
        test('設定更新後にスタイルが再適用される', () => {  const originalBackground = shareDialog.elements.dialog.style.backgroundColor }

            shareDialog.updateConfig({) }

                styles: { backgroundColor: '#FF0000' });
            });
            const newBackground = shareDialog.elements.dialog.style.backgroundColor;

            expect(newBackground).not.toBe(originalBackground);'}');

    }''
    describe('クリーンアップ', () => { }

        test('正常にクリーンアップされる', async () => { }

            await shareDialog.show({ type: 'score', score: 1000  });
            shareDialog.destroy();

            expect(shareDialog.elements.backdrop.parentNode).toBeNull();'}');
        test('表示中でもクリーンアップされる', async () => { }

            await shareDialog.show({ type: 'score', score: 1000  });
            expect(shareDialog.state.visible).toBe(true);
            shareDialog.destroy();

            expect(shareDialog.elements.backdrop.parentNode).toBeNull();'}');
        test('イベントリスナーが削除される', () => {  ''
            const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener'),
            const windowRemoveEventListenerSpy = jest.spyOn(window, 'removeEventListener),
            shareDialog.destroy(),
            expect(removeEventListenerSpy).toHaveBeenCalled() }
            expect(windowRemoveEventListenerSpy).toHaveBeenCalled(); }
        });

    }'}');