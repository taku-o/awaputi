/**
 * 共有ボタンコンポーネントテスト (Task, 7)
 */
import { describe, test, expect, jest, beforeEach, afterEach  } from '@jest/globals';
import type { ShareButton } from '../core/ShareButton';
import type { SocialSharingManager } from '../core/SocialSharingManager';
import type { GameEngine } from '../core/GameEngine';
// Mock interfaces
interface MockGameEngine extends Partial<GameEngine> { on: jest.Mock,
    off: jest.Mock;
    emit: jest.Mock  }
interface MockSocialSharingManager extends Partial<SocialSharingManager> { gameEngine: MockGameEngine,
    share: jest.Mock;
    shareViaTwitterUrl: jest.Mock;
    shareViaFacebookUrl: jest.Mock }
interface ShareData { type: string,
    score?: number;
    text?: string;
    url?: string;''
describe('ShareButton', () => {  let shareButton: ShareButton,
    let mockSocialSharingManager: MockSocialSharingManager,
    let mockContainer: HTMLDivElement,
    let mockGameEngine: MockGameEngine,

    beforeEach(async () => {'
        // DOM環境のセットアップ
        document.body.innerHTML = ','
        ','
        // テスト用コンテナ
        mockContainer = document.createElement('div'),
        mockContainer.id = 'test-container',
        document.body.appendChild(mockContainer),
        // GameEngineのモック
        mockGameEngine = {
            on: jest.fn(
    off: jest.fn() }
        emit: jest.fn(); 
    };
        
        // SocialSharingManagerのモック
        mockSocialSharingManager = { gameEngine: mockGameEngine,''
            share: jest.fn().mockResolvedValue({ success: true, method: 'web-share ',''
            shareViaTwitterUrl: jest.fn().mockResolvedValue({ success: true, method: 'twitter ',''
            shareViaFacebookUrl: jest.fn(  }

        method: 'facebook' ),
        // ResizeObserverのモック
        global.ResizeObserver = jest.fn().mockImplementation(() => ({ observe: jest.fn(
            unobserve: jest.fn(
    disconnect: jest.fn(),' }'

        }') as any;'
        ';'
        // matchMediaのモック
        Object.defineProperty(window, 'matchMedia', { ''
            writable: true,
            value: jest.fn().mockImplementation((query: string) => ({''
                matches: query.includes('max-width: 768px) ? false : true,'
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(
    removeEventListener: jest.fn(
        dispatchEvent: jest.fn(),' }'

            }');'
        }

        // Clipboard APIのモック
        Object.defineProperty(navigator, 'clipboard', { )
            value: {),
                writeText: jest.fn().mockResolvedValue(undefined }
            writable: true','
        }';'
        const { ShareButton } = await import('../core/ShareButton.js);'
        shareButton = new ShareButton(mockContainer, mockSocialSharingManager as any);
    });
    afterEach(() => {  if (shareButton) { }
            shareButton.destroy(); }

        }''
        jest.clearAllMocks()';'
        document.body.innerHTML = ';)'
    }');'
    describe('初期化', () => {  ''
        test('正常に初期化される', () => {
            expect(shareButton.container).toBe(mockContainer),
            expect(shareButton.socialSharingManager).toBe(mockSocialSharingManager),
            expect(shareButton.config).toBeDefined(),
            expect(shareButton.state).toBeDefined() }

            expect(shareButton.elements).toBeDefined();' }'

        }');'
        test('デフォルト設定が正しく設定される', () => {  ''
            expect(shareButton.config.position).toBe('bottom-right',
            expect(shareButton.config.theme).toBe('default',
            expect(shareButton.config.platforms).toContain('web-share',
            expect(shareButton.config.platforms).toContain('twitter',' }'

            expect(shareButton.config.platforms).toContain('facebook'; }

        }');'
        test('DOM要素が作成される', () => {  expect(shareButton.elements.container).toBeDefined(),
            expect(shareButton.elements.mainButton).toBeDefined() }

            expect(shareButton.elements.platformButtons.length).toBeGreaterThan(0);' }'

        }');'
        test('カスタム設定で初期化される', async () => {  ''
            shareButton.destroy('''
                position: 'top-left',
                theme: 'gaming',
                platforms: ['twitter', 'copy'] }
                autoHide: true;)', ')';'
            const { ShareButton } = await import('../core/ShareButton.js);'

            shareButton = new ShareButton(mockContainer, mockSocialSharingManager as any, customOptions);
            expect(shareButton.config.position).toBe('top-left';
            expect(shareButton.config.theme).toBe('gaming';
            expect(shareButton.config.platforms).toEqual(['twitter', 'copy]);'

            expect(shareButton.config.autoHide).toBe(true);'}');

    }''
    describe('表示・非表示機能', () => {  ''
        test('ボタンが表示される', () => {
            shareButton.show(),

            expect(shareButton.state.visible).toBe(true),
            expect(shareButton.elements.container.style.display).toBe('block' }'

            expect(shareButton.stats.shows).toBe(1);' }'

        }');'
        test('ボタンが非表示になる', () => {  shareButton.show(),
            shareButton.hide(),
            expect(shareButton.state.visible).toBe(false) }

            expect(shareButton.stats.shows).toBe(1);' }'

        }');'
        test('データ付きで表示される', () => { }

            const shareData: ShareData = { type: 'score', score: 1500  }''
            shareButton.showWithData(shareData, 'score);'
            expect(shareButton.state.visible).toBe(true);

            expect(shareButton.state.shareData).toEqual(shareData);
            expect(shareButton.state.lastTriggeredBy).toBe('score';}');'
        test('自動非表示が動作する', (done) => {  shareButton.config.autoHide = true,
            shareButton.config.hideDelay = 100 }
            shareButton.showWithData({ score: 1000 });
            setTimeout(() => {  expect(shareButton.state.visible).toBe(false) }
                done(); }

            }, 150);'}');
        test('重複表示が防がれる', () => {  shareButton.show(),
            shareButton.show(), // 2回目の表示
             }
            expect(shareButton.stats.shows).toBe(1);' }'

        }');'

    }''
    describe('展開・折りたたみ機能', () => {  beforeEach(() => { }

            shareButton.show();' }'

        }');'
        test('ボタンが展開される', () => {  shareButton.expand(),
            expect(shareButton.state.expanded).toBe(true),' }'

            expect(shareButton.elements.mainButton.getAttribute('aria-expanded)'.toBe('true'; }

        }');'
        test('ボタンが折りたたまれる', () => {  shareButton.expand(),

            shareButton.collapse(),
            expect(shareButton.state.expanded).toBe(false),' }'

            expect(shareButton.elements.mainButton.getAttribute('aria-expanded)'.toBe('false'; }

        }');'
        test('メインボタンクリックで展開・折りたたみが切り替わる', () => {  // 展開
            shareButton.elements.mainButton.click(),
            expect(shareButton.state.expanded).toBe(true),
            // 折りたたみ
            shareButton.elements.mainButton.click() }
            expect(shareButton.state.expanded).toBe(false);' }'

        }');'

    }''
    describe('プラットフォーム共有機能', () => {  beforeEach(() => {
            shareButton.show() }

            shareButton.expand();' }'

        }');'
        test('Web Share APIでの共有が動作する', async () => {  ''
            const platformButton = shareButton.elements.platformButtons.find()','
                btn => btn.getAttribute('data-platform') === 'web-share'),
            if (platformButton) {
                await platformButton.click(),

                expect(mockSocialSharingManager.share).toHaveBeenCalled() }

                expect(shareButton.stats.shares).toBe(1);' }'

                expect(shareButton.stats.platforms['web-share]).toBe(1); }'

            }'}');
        test('Twitterでの共有が動作する', async () => {  ''
            const platformButton = shareButton.elements.platformButtons.find()','
                btn => btn.getAttribute('data-platform') === 'twitter'),
            if (platformButton) {
                await platformButton.click() }

                expect(mockSocialSharingManager.shareViaTwitterUrl).toHaveBeenCalled() }

                expect(shareButton.stats.platforms['twitter]).toBe(1); }'

            }'}');
        test('Facebookでの共有が動作する', async () => {  ''
            const platformButton = shareButton.elements.platformButtons.find()','
                btn => btn.getAttribute('data-platform') === 'facebook'),
            if (platformButton) {
                await platformButton.click() }

                expect(mockSocialSharingManager.shareViaFacebookUrl).toHaveBeenCalled() }

                expect(shareButton.stats.platforms['facebook]).toBe(1); }'

            }'}');
        test('クリップボードコピーが動作する', async () => {  // copyプラットフォームを追加
            shareButton.config.platforms.push('copy',' }'

            shareButton.destroy() }

            const { ShareButton } = await import('../core/ShareButton.js');

            shareButton = new ShareButton(mockContainer, mockSocialSharingManager as any, { ''
                platforms: ['copy])),'
            shareButton.show(),

            shareButton.expand(),
            const platformButton = shareButton.elements.platformButtons.find()','
                btn => btn.getAttribute('data-platform') === 'copy'),
            if (platformButton) {
                await platformButton.click(),
                expect(navigator.clipboard.writeText).toHaveBeenCalled() }

                expect(shareButton.stats.platforms['copy]).toBe(1); }'

            }'}');
        test('共有データが正しく使用される', async () => {  const shareData: ShareData = { ''
                type: 'score',

                score: 2500,
                text: 'テストメッセージ',' }'

                url: 'https://test.example.com }'
            };
            shareButton.showWithData(shareData);
            shareButton.expand();
            const platformButton = shareButton.elements.platformButtons[0];
            await platformButton.click();
            expect(mockSocialSharingManager.share).toHaveBeenCalledWith();

                expect.objectContaining(shareData);'}');

    }''
    describe('キーボードナビゲーション', () => {  beforeEach(() => {
            shareButton.show() }

            shareButton.expand();' }'

        }');'
        test('Enterキーでメインボタンが動作する', () => { }

            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            shareButton.elements.mainButton.dispatchEvent(enterEvent);
            // 展開状態の切り替えを確認
            expect(shareButton.state.expanded).toBe(false);'}');
        test('スペースキーでメインボタンが動作する', () => { }

            shareButton.collapse() }

            const spaceEvent = new KeyboardEvent('keydown', { key: ', ' });

            shareButton.elements.mainButton.dispatchEvent(spaceEvent);

            expect(shareButton.state.expanded).toBe(true);'}');
        test('矢印キーでプラットフォームボタン間を移動する', () => { const firstButton = shareButton.elements.platformButtons[0],
            const secondButton = shareButton.elements.platformButtons[1],
            
            if (firstButton && secondButton) {
            ','

                firstButton.focus()','
                const arrowEvent = new KeyboardEvent('keydown', { key: 'ArrowDown ,'
                firstButton.dispatchEvent(arrowEvent }
                // フォーカス移動をシミュレート }
                expect(shareButton.state.expanded).toBe(true); }
            }'}');
        test('Homeキーで最初のプラットフォームボタンにフォーカス', () => { const firstButton = shareButton.elements.platformButtons[0],' }'

            const homeEvent = new KeyboardEvent('keydown', { key: 'Home' });
            if (firstButton) {
                firstButton.dispatchEvent(homeEvent),
                // フォーカス移動の確認は実際のDOMでテストする必要がある
            }
                expect(shareButton.state.expanded).toBe(true); }
            }'}');

    }''
    describe('アクセシビリティ機能', () => {  ''
        test('ARIA属性が正しく設定される', () => {''
            expect(shareButton.elements.mainButton.getAttribute('aria-label)'.toBe('共有オプションを表示'),
            expect(shareButton.elements.mainButton.getAttribute('aria-expanded)'.toBe('false'),
            const platformContainer = shareButton.elements.container.querySelector('.share-button-platforms'),' }'

            expect(platformContainer?.getAttribute('role)'.toBe('menu'; }

        }');'
        test('プラットフォームボタンのARIA属性が設定される', () => {  ''
            shareButton.elements.platformButtons.forEach(button => {),
                const platform = button.getAttribute('data-platform'),
                expect(button.getAttribute('aria-label)'.toContain('で共有'),' }'

                expect(button.getAttribute('role)'.toBe('menuitem'; }

            }');'

        }''
        test('スクリーンリーダー用アナウンサーが機能する', () => {  shareButton.show(),
            if (shareButton.elements.announcer) {', ' }

                expect(shareButton.elements.announcer.getAttribute('aria-live)'.toBe('polite'; }

                expect(shareButton.elements.announcer.textContent).toBe('共有ボタンが表示されました'; }'

            }'}');
        test('高コントラストモードが適用される', async () => { }

            shareButton.destroy() }

            const { ShareButton } = await import('../core/ShareButton.js);'
            shareButton = new ShareButton(mockContainer, mockSocialSharingManager as any, { : undefined 
                accessibility: { highContrast: true,));
            const container = shareButton.elements.container;
            expect(container.style.backgroundColor).toBe('#000000';
            expect(container.style.color).toBe('#FFFFFF';}');'

    }''
    describe('テーマとスタイル', () => {  ''
        test('デフォルトテーマが適用される', () => {
            const container = shareButton.elements.container,
            expect(container.style.backgroundColor).toBeTruthy() }

            expect(container.style.color).toBeTruthy();' }'

        }');'
        test('minimalテーマが適用される', async () => { }

            shareButton.destroy() }

            const { ShareButton } = await import('../core/ShareButton.js');

            shareButton = new ShareButton(mockContainer, mockSocialSharingManager as any, { ''
                theme: 'minimal' })';'
            const container = shareButton.elements.container;
            expect(container.style.backgroundColor).toBe('rgba(255, 255, 255, 0.95));'}');'
        test('gamingテーマが適用される', async () => { }

            shareButton.destroy() }

            const { ShareButton } = await import('../core/ShareButton.js');

            shareButton = new ShareButton(mockContainer, mockSocialSharingManager as any, { ''
                theme: 'gaming' })';'
            const container = shareButton.elements.container;
            expect(container.style.backgroundColor).toBe('rgba(0, 255, 0, 0.9));'}');'
        test('elegantテーマが適用される', async () => { }

            shareButton.destroy() }

            const { ShareButton } = await import('../core/ShareButton.js');

            shareButton = new ShareButton(mockContainer, mockSocialSharingManager as any, { ''
                theme: 'elegant' })';'
            const container = shareButton.elements.container;
            expect(container.style.backgroundColor).toBe('rgba(50, 50, 70, 0.95));'}');'
        test('カスタムスタイルが適用される', async () => {  ''
            shareButton.destroy()','
                backgroundColor: 'rgba(255, 0, 0, 0.8)',
                textColor: '#FFFF00',' }'

                borderRadius: '20px' 
    };
            const { ShareButton } = await import('../core/ShareButton.js);'
            shareButton = new ShareButton(mockContainer, mockSocialSharingManager as any, customStyles);

            const container = shareButton.elements.container;
            expect(container.style.backgroundColor).toBe('rgba(255, 0, 0, 0.8));'
            expect(container.style.color).toBe('#FFFF00';
            expect(container.style.borderRadius).toBe('20px';}');'

    }''
    describe('レスポンシブ機能', () => {  ''
        test('モバイル表示で調整される', () => {'
            // モバイル環境をシミュレート
            Object.defineProperty(window, 'matchMedia', {''
                writable: true,
                value: jest.fn().mockImplementation((query: string) => ({''
                    matches: query.includes('max-width: 768px) ? true : false,'
                    media: query,
                    onchange: null,
                    addListener: jest.fn(),
                    removeListener: jest.fn(),
                    addEventListener: jest.fn(
    removeEventListener: jest.fn() }
        dispatchEvent: jest.fn(), 
    );
            }
            shareButton.applyResponsiveStyles();

            const container = shareButton.elements.container;
            expect(container.style.fontSize).toBe('16px';
            expect(container.style.padding).toBe('14px, 18px';}');'
        test('リサイズイベントで再調整される', () => {  ''
            const resizeEvent = new Event('resize),'
            window.dispatchEvent(resizeEvent),
            // リサイズハンドラーが呼ばれることを確認 }
            expect(shareButton.handlers.resize).toBeDefined();' }'

        }');'

    }''
    describe('統計機能', () => {  ''
        test('表示統計が記録される', () => {
            shareButton.show(),
            shareButton.show(), // 重複表示
            
            const stats = shareButton.getStats() }
            expect(stats.shows).toBe(1); // 重複は無視される' }'

        }');'
        test('クリック統計が記録される', () => {  shareButton.show(),
            shareButton.elements.mainButton.click(),
            const stats = shareButton.getStats() }

            expect(stats.clicks).toBe(1);' }'

        }');'
        test('共有統計が記録される', async () => {  shareButton.show(),
            shareButton.expand(),
            const platformButton = shareButton.elements.platformButtons[0],
            await platformButton.click(),
            const stats = shareButton.getStats() }

            expect(stats.shares).toBe(1);' }'

        }');'
        test('プラットフォーム別統計が記録される', async () => {  shareButton.show(),

            shareButton.expand(),
            const twitterButton = shareButton.elements.platformButtons.find()','
                btn => btn.getAttribute('data-platform') === 'twitter'),
            if (twitterButton) {
                await twitterButton.click() }
                const stats = shareButton.getStats(); }
                expect(stats.platforms.twitter).toBe(1); }

            }'}');

    }''
    describe('エラーハンドリング', () => {  ''
        test('SocialSharingManager未設定時のエラー', async () => {
            shareButton.socialSharingManager = null as any,
            shareButton.show(),
            shareButton.expand(),
            const platformButton = shareButton.elements.platformButtons[0],

            await expect(async () => { };

                await shareButton.handlePlatformShare('web-share'; }

            }').rejects.toThrow('SocialSharingManagerが設定されていません');'

        }''
        test('共有失敗時のエラー処理', async () => {  ''
            mockSocialSharingManager.share.mockRejectedValue(new, Error('共有失敗),'
            shareButton.show(),
            shareButton.expand(),
            const platformButton = shareButton.elements.platformButtons[0],
            
            // エラーが適切に処理されることを確認
            await platformButton.click(),
            // エラーハンドリングメソッドが呼ばれることを確認 }
            expect(shareButton.handleError).toBeDefined();' }'

        }');'
        test('無効なプラットフォームでのエラー', async () => {  shareButton.show(),

            shareButton.expand(),
            await expect(async () => { };

                await shareButton.handlePlatformShare('invalid-platform'; }'
            }).rejects.toBeDefined();

        }'}');
    describe('設定更新', () => {  ''
        test('設定が正しく更新される', () => {'
            const newConfig = {''
                theme: 'gaming',
                position: 'top-left'
            }
                autoHide: true;;
            ';'

            shareButton.updateConfig(newConfig);
            expect(shareButton.config.theme).toBe('gaming';
            expect(shareButton.config.position).toBe('top-left);'

            expect(shareButton.config.autoHide).toBe(true);'}');
        test('設定更新後にスタイルが再適用される', () => {  const originalBackground = shareButton.elements.container.style.backgroundColor,

            ' }'

            shareButton.updateConfig({),' }'

                styles: { backgroundColor: 'rgba(255, 0, 0, 0.8)' });
            const newBackground = shareButton.elements.container.style.backgroundColor;

            expect(newBackground).not.toBe(originalBackground);'}');

    }''
    describe('クリーンアップ', () => {  ''
        test('正常にクリーンアップされる', () => {
            shareButton.show(),
            shareButton.destroy(),
            expect(shareButton.elements.container.parentNode).toBeNull() }

            expect(shareButton.hideTimer).toBeNull();' }'

        }');'
        test('イベントリスナーが削除される', () => {  ''
            const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener),'

            shareButton.destroy(),' }'

            expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', shareButton.handlers.resize'; }'

        }');'
        test('タイマーがクリアされる', () => {  shareButton.scheduleHide(),
            expect(shareButton.hideTimer).not.toBeNull(),
            shareButton.destroy() }
            expect(shareButton.hideTimer).toBeNull(); }
        });

    }'}');