/**
 * ソーシャル機能のUIコンポーネント間連携統合テスト
 * Issue #37 Task 21.3: UIコンポーネント間連携テスト
 */
import { jest, describe, test, beforeAll, beforeEach, afterEach, expect  } from '@jest/globals';
// Type definitions
interface MockDialogElement extends HTMLElement { style: CSSStyleDeclaration
    }
interface BaseDialogInterface { isOpen: boolean,
    element: MockDialogElement,
    open(): void,
    close(): void,  }
interface DOMElements { canvas: HTMLCanvasElement,
    gameEndContainer: HTMLDivElement,
    settingsContainer: HTMLDivElement,
    userInfoContainer: HTMLDivElement
     }
interface MockGameEngine { canvas: HTMLCanvasElement,
    getCanvas(): HTMLCanvasElement
    }
    getCurrentScene(): { name: string }
interface MockStatisticsManager { getHighScore: jest.Mock<() => number>,
    getTotalScore: jest.Mock<() => number>,
    getGamesPlayed: jest.Mock<() => number>,
    getDetailedStatistics: jest.Mock<() => { 
        totalPlayTim,e: number,
    averageScore: number }
        bestCombo: number; 
    }>;
}
interface MockAchievementManager { getAchievements: jest.Mock<() => Array<{
        i,d: string,
        name: string,
        unlocked: boolean,
    rare: boolean 
    }>>;
    getUnlockedAchievements: jest.Mock<() => Array<{ id: string,
        name: string,
        unlocked: boolean,
    rare: boolean }>>;
    getSettings?: jest.Mock<() => {  shareSettings: {
            autoShare: boolean }
            shareHighScores: boolean; 
    }>;
}
interface ShareData { type: string,
    score?: number,
    stage?: string,
    isHighScore?: boolean,
    screenshot?: string,
    achievement?: {
        nam,e: string,
    description: string  }
interface GameEndData { score: number,
    isHighScore: boolean,
    stage: string,
    playTime?: number,
    combo?: number,  }
interface LeaderboardData { rank: number,
    playerName: string,
    score: number,
    stage: string  }
interface Challenge { id: string,
    name: string,
    description?: string,
    type: string,
    completed?: boolean,
    completedAt?: number }
    reward?: { ap: number }
    progress?: number;
    target?: number;
}
interface SocialSharingManager { initialize(): Promise<void>,
    handleGameEnd(gameEndData: GameEndData): Promise<void>,
    handleAchievementUnlocked(achievement: any): Promise<void>,
    handleChallengeCompleted(challenge: Challenge): Promise<void>,
    createShareDialog(shareData: ShareData): Promise<any>,
    createShareButton(shareData: ShareData): Promise<any> }
interface MockNavigator { share: jest.Mock<() => Promise<void>>,
    canShare: jest.Mock<() => boolean>,
    userAgent: string  }
}
interface MockLocalStorage { getItem: jest.Mock<(key: string) => string | null>,
    setItem: jest.Mock<(key: string, value: string) => void>,
    removeItem: jest.Mock<(key: string) => void>,
    clear: jest.Mock<() => void>  }
}
// UIコンポーネントのモック
class MockBaseDialog implements BaseDialogInterface { isOpen: boolean,
    element: MockDialogElement,
    constructor()',
        this.element = document.createElement('div') as MockDialogElement,
        this.element.className = 'dialog-container' }

    }''
    open('';
        this.element.style.display = 'block';)
        document.body.appendChild(this.element);

    }''
    close('';
        this.element.style.display = 'none';)
        if (this.element.parentNode) { this.element.parentNode.removeChild(this.element) }
}

// DOM環境のセットアップ
function setupDOMEnvironment()';
    const canvas = document.createElement('canvas');
    canvas.width = 800;

    canvas.height = 600;
    canvas.id = 'gameCanvas';
    ';
    // ゲーム終了画面のコンテナ
    const gameEndContainer = document.createElement('div');
    gameEndContainer.id = 'gameEndContainer';

    gameEndContainer.innerHTML = `';
        <div class="score-display">"";
            <h2 id="finalScore">0</h2>"";
            <p id="scoreMessage">ゲーム終了</p>";
        </div>"";
        <div class="action-buttons" id="actionButtons">;
            <!-- 共有ボタンがここに挿入される -->;
        </div>;
    `;"
    // 設定画面のコンテナ""
    const settingsContainer = document.createElement('div');
    settingsContainer.id = 'settingsContainer';

    settingsContainer.innerHTML = `';
        <div class="settings-panel">"";
            <div class="tab-container" id="settingsTabs">"";
                <button class="tab-button" data-tab="general">一般</button>"";
                <button class="tab-button" data-tab="social">ソーシャル</button>"";
                <button class="tab-button" data-tab="privacy">プライバシー</button>";
            </div>"";
            <div class="tab-content" id="settingsContent">;
                <!-- 設定内容がここに表示される -->;
            </div>;
        </div>;
    `;"
    // UserInfoScene用のコンテナ""
    const userInfoContainer = document.createElement('div');
    userInfoContainer.id = 'userInfoContainer';

    userInfoContainer.innerHTML = `';
        <div class="user-info-tabs">"";
            <button class="tab-button" data-tab="stats">統計</button>"";
            <button class="tab-button" data-tab="achievements">実績</button>"";
            <button class="tab-button" data-tab="leaderboard">ランキング</button>"";
            <button class="tab-button" data-tab="challenges">チャレンジ</button>";
        </div>"";
        <div class="tab-content" id="userInfoContent">;
            <!-- タブ内容がここに表示される -->;
        </div>;
    `;
    document.body.appendChild(canvas);
    document.body.appendChild(gameEndContainer);"
    document.body.appendChild(settingsContainer);""
    document.body.appendChild(userInfoContainer);
    return { canvas,
        gameEndContainer,
        settingsContainer };
        userInfoContainer }
    };"
}""
describe('SocialUIIntegration', () => {  let domElements: DOMElements,
    let socialManager: SocialSharingManager,
    let mockGameEngine: MockGameEngine,
    let mockStatisticsManager: MockStatisticsManager,
    let mockAchievementManager: MockAchievementManager,
    beforeAll(async () => {
        // DOM環境をセットアップ
        (global, as any).document = document,
        (global, as any).window = window,
        (global, as any).navigator = {
            share: jest.fn().mockResolvedValue(undefined,
            canShare: jest.fn().mockReturnValue(true),' }'

            userAgent: 'Mozilla/5.0(iPhone; CPU, iPhone OS, 14_0 like, Mac OS, X)' }
        } as MockNavigator;

        // CSS Transitionsのモック
        (global, as any).getComputedStyle = jest.fn()';
            transitionDuration: '0s',')';
            animationDuration: '0s');
    }
    beforeEach(async () => {  // DOM要素をセットアップ
        domElements = setupDOMEnvironment(),
        // モックオブジェクトを初期化
        mockGameEngine = { }
            canvas: domElements.canvas }
            getCanvas() { return this.canvas },''
            getCurrentScene: () => ({ name: 'GameScene' });
        mockStatisticsManager = { getHighScore: jest.fn().mockReturnValue(50000,
            getTotalScore: jest.fn().mockReturnValue(500000),
            getGamesPlayed: jest.fn().mockReturnValue(100,
    getDetailedStatistics: jest.fn().mockReturnValue({)
                totalPlayTime: 180000,
    averageScore: 5000),
                bestCombo: 25  };

        mockAchievementManager = { ''
            getAchievements: jest.fn( }

                { id: 'first_win', name: '初勝利', unlocked: true, rare: false  }'''
                { id: 'high_scorer', name: 'ハイスコアラー', unlocked: true, rare: true ']',
            getUnlockedAchievements: jest.fn('''
                { id: 'first_win', name: '初勝利', unlocked: true });
        rare: false
            });
            ]);
        // LocalStorageモック
        (global, as any).localStorage = { getItem: jest.fn(
            setItem: jest.fn(
    removeItem: jest.fn(
        clear: jest.fn()  } as MockLocalStorage;

        // SocialSharingManagerを初期化
        const module = await import('../../core/SocialSharingManager.js);
        const SocialSharingManagerClass = module.SocialSharingManager;
        socialManager = new SocialSharingManagerClass(;
            mockGameEngine,
            mockStatisticsManager,
            mockAchievementManager;
        ) as SocialSharingManager;
        await socialManager.initialize();

    });
    afterEach(() => {  // DOM をクリーンアップ
        document.body.innerHTML = ' }

        jest.clearAllMocks();' }'

    }');
    describe('ShareButton と ShareDialog の連携', () => {  ''
        test('共有ボタンクリックで共有ダイアログが開く', async () => { }

            // ShareButtonを動的にインポート' }'

            const { ShareButton } = await import('../../core/ShareButton.js');

            const shareData: ShareData = { ''
                type: 'score',
                score: 45000,
                stage: 'normal',
    isHighScore: true  };
            const shareButton = new ShareButton({ data: shareData,''
                theme: 'modern',',
                size: 'medium',
    socialManager: socialManager',
            ',
            shareButton.render(domElements.actionButtons),

            // ボタンクリックをシミュレート
            const buttonElement = domElements.actionButtons.querySelector('.share-button',
            expect(buttonElement).toBeTruthy()',
            const clickEvent = new Event('click),
            (buttonElement, as HTMLElement).dispatchEvent(clickEvent),

            // 少し待ってからダイアログの存在を確認
            await new Promise(resolve => setTimeout(resolve, 100)),
            const dialog = document.querySelector('.share-dialog),

            expect(dialog).toBeTruthy(),
            expect((dialog, as HTMLElement).style.display).not.toBe('none',' }

        }');
        test('共有ダイアログのプラットフォーム選択', async () => { }

            const { ShareDialog } = await import('../../core/ShareDialog.js');

            const shareData: ShareData = { ''
                type: 'score',
                score: 65000,
                stage: 'hard',
                screenshot: 'data:image/png,base64,iVBORw0KGgoAAAANS...',

            const shareDialog = new ShareDialog(shareData, socialManager),
            shareDialog.open()',
            const twitterButton = document.querySelector('[data-platform="twitter"]') as HTMLElement,
            const facebookButton = document.querySelector('[data-platform="facebook"]') as HTMLElement,
            const genericButton = document.querySelector('[data-platform="generic"]) as HTMLElement,
            expect(twitterButton).toBeTruthy(),

            expect(facebookButton).toBeTruthy(),
            expect(genericButton).toBeTruthy()',
            const clickEvent = new Event('click',
            twitterButton.dispatchEvent(clickEvent),

            // Twitter用のメッセージが表示されることを確認
            const messagePreview = document.querySelector('.message-preview' as HTMLElement,
            expect(messagePreview.textContent).toContain('65000'),
            expect((messagePreview.textContent || ').length).toBeLessThanOrEqual(280),'}');
        test('カスタムメッセージ編集機能', async () => { }

            const { ShareDialog } = await import('../../core/ShareDialog.js');

            const shareData: ShareData = { ''
                type: 'achievement',
                achievement: {''
                    name: 'パーフェクトマスター',
                    description: '完璧なプレイを達成'
            }
            };
            const shareDialog = new ShareDialog(shareData, socialManager);
            shareDialog.open()';
            const messageEditor = document.querySelector('.message-editor' as HTMLTextAreaElement;
            expect(messageEditor).toBeTruthy()';
            messageEditor.value = 'カスタマイズされたメッセージ #BubblePop';)'
            const inputEvent = new Event('input';
            messageEditor.dispatchEvent(inputEvent);

            // プレビューが更新されることを確認
            const messagePreview = document.querySelector('.message-preview' as HTMLElement;
            expect(messagePreview.textContent).toContain('カスタマイズされたメッセージ';}');

    }''
    describe('ゲーム終了画面との統合', () => {  ''
        test('ゲーム終了時の共有ボタン自動挿入', async () => {
            const gameEndData: GameEndData = {
                score: 75000,
                isHighScore: true,
                stage: 'expert',
    playTime: 420000 }
                combo: 28 
    };
            // ゲーム終了時の共有提案をシミュレート
            await socialManager.handleGameEnd(gameEndData);

            // 共有ボタンが挿入されることを確認
            const shareButton = domElements.actionButtons.querySelector('.share-button) as HTMLElement;

            expect(shareButton).toBeTruthy();
            expect(shareButton.textContent).toContain('共有');

            // ハイスコア時の特別表示を確認
            expect(shareButton.classList.contains('highlight).toBe(true);'}');
        test('設定による共有プロンプトの制御', async () => { // 自動共有を無効に設定
            mockAchievementManager.getSettings = jest.fn().mockReturnValue({
                shareSettings: {)
                    autoShare: false }
                    shareHighScores: false) 
    });'}');
            const gameEndData: GameEndData = { score: 85000,

                isHighScore: true,
                stage: 'normal'
            }

            };
            await socialManager.handleGameEnd(gameEndData);

            // 共有ボタンが表示されないことを確認
            const shareButton = domElements.actionButtons.querySelector('.share-button);

            expect(shareButton).toBeFalsy();'}');

    }''
    describe('実績システムとの統合', () => {  ''
        test('実績解除通知と共有の連携', async () => {'
            const newAchievement = {''
                id: 'combo_master',
                name: 'コンボマスター',
                description: '30コンボを達成',
    rare: true }
        unlockedAt: Date.now(); 
    };

            // 実績解除イベントをシミュレート
            await socialManager.handleAchievementUnlocked(newAchievement);

            // 実績通知が表示されることを確認
            const achievementNotification = document.querySelector('.achievement-notification) as HTMLElement;

            expect(achievementNotification).toBeTruthy();
            expect(achievementNotification.textContent).toContain('コンボマスター');

            // 共有ボタンが通知内に含まれることを確認
            const shareButton = achievementNotification.querySelector('.share-button) as HTMLElement;

            expect(shareButton).toBeTruthy();
            expect((shareButton, as any).dataset.type).toBe('achievement';}');
        test('希少実績の特別ハイライト', async () => {  const rareAchievement = {''
                id: 'legendary_player',
                name: '伝説のプレイヤー',
                description: '1000ゲーム達成',
                rare: true,' }'

                rarity: 'legendary' 
    };
            await socialManager.handleAchievementUnlocked(rareAchievement);
            const notification = document.querySelector('.achievement-notification') as HTMLElement;
            expect(notification.classList.contains('rare).toBe(true);
            expect(notification.classList.contains('legendary).toBe(true);

            // 特別なアニメーション効果が適用されることを確認
            const animationClass = notification.classList.contains('sparkle-animation);

            expect(animationClass).toBe(true);'}');

    }''
    describe('リーダーボードUIとの統合', () => { }

        test('リーダーボード表示と共有機能の統合', async () => { }

            const { LeaderboardUI } = await import('../../ui/components/LeaderboardUI.js');

            const mockLeaderboardData: LeaderboardData[] = [';
                { rank: 1, playerName: 'Player1', score: 95000, stage: 'expert'
            },''
                { rank: 2, playerName: 'Player2', score: 87000, stage: 'expert'
            },]'
                { rank: 3, playerName: 'Player3', score: 82000, stage: 'expert'
            }]
            ];
            const leaderboardUI = new LeaderboardUI({ data: mockLeaderboardData)
               , socialManager: socialManager',
            ',
            leaderboardUI.render(domElements.userInfoContent),

            // リーダーボード内の共有ボタンを確認
            const shareButtons = domElements.userInfoContent.querySelectorAll('.share-rank-button),
            expect(shareButtons.length).toBeGreaterThan(0),
            // 1位のスコア共有をシミュレート
            const firstPlaceShare = shareButtons[0] as HTMLElement,
            firstPlaceShare.click(),
            // 共有ダイアログが適切なデータで開くことを確認
            await new Promise(resolve => setTimeout(resolve, 100)),
            const dialog = document.querySelector('.share-dialog',
            expect(dialog).toBeTruthy()',
            const messagePreview = document.querySelector('.message-preview' as HTMLElement,
            expect(messagePreview.textContent).toContain('95000',
            expect(messagePreview.textContent).toContain('1位',' }

        }');
        test('期間別ランキング切り替えと共有の連携', async () => { }

            const { LeaderboardUI } = await import('../../ui/components/LeaderboardUI.js);
            const leaderboardUI = new LeaderboardUI({ socialManager: socialManager)
               , allowPeriodSwitch: true 
    });
            leaderboardUI.render(domElements.userInfoContent);

            // 期間切り替えボタンを確認
            const weeklyButton = domElements.userInfoContent.querySelector('[data-period="weekly"]) as HTMLElement;
            expect(weeklyButton).toBeTruthy();

            // 週間ランキングに切り替え
            weeklyButton.click()';
            const shareButton = domElements.userInfoContent.querySelector('.share-rank-button) as HTMLElement;

            shareButton.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            const messagePreview = document.querySelector('.message-preview' as HTMLElement;
            expect(messagePreview.textContent).toContain('週間';}');

    }''
    describe('チャレンジUIとの統合', () => {  ''
        test('チャレンジ完了時の共有機能', async () => {'
            const completedChallenge: Challenge = {''
                id: 'daily_score_challenge',
                name: '今日のハイスコア',
                description: '50000点以上を達成',
                type: 'daily',
    completed: true }
                completedAt: Date.now() }
                reward: { ap: 500 
    };
            await socialManager.handleChallengeCompleted(completedChallenge);

            // チャレンジ完了通知を確認
            const notification = document.querySelector('.challenge-notification) as HTMLElement;

            expect(notification).toBeTruthy();
            expect(notification.textContent).toContain('今日のハイスコア');

            // 完了実績の共有ボタンを確認
            const shareButton = notification.querySelector('.share-button) as HTMLElement;

            expect(shareButton).toBeTruthy();
            expect((shareButton, as any).dataset.type).toBe('challenge';}');
        test('チャレンジ進捗の視覚化と共有', async () => { }

            const { ChallengesTab } = await import('../../scenes/components/ChallengesTab.js');

            const mockChallenges: Challenge[] = [{ ''
                    id: 'weekly_combo',
                    name: '週間コンボチャレンジ',
    progress: 80,
                    target: 100,
                    type: 'weekly'
            }]
                }]
            ];
            const challengesTab = new ChallengesTab({ challenges: mockChallenges)
               , socialManager: socialManager',
            ',
            challengesTab.render(domElements.userInfoContent),

            // 進捗バーが表示されることを確認
            const progressBar = domElements.userInfoContent.querySelector('.progress-bar) as HTMLElement,

            expect(progressBar).toBeTruthy(),
            expect(progressBar.style.width).toBe('80%'),

            // 進捗共有ボタンを確認
            const shareProgressButton = domElements.userInfoContent.querySelector('.share-progress-button),

            expect(shareProgressButton).toBeTruthy(),' }'

        }');

    }''
    describe('レスポンシブ対応とモバイル統合', () => {  ''
        test('モバイルレイアウトでの共有UI調整', async () => {'
            // モバイル環境をシミュレート
            Object.defineProperty(window, 'innerWidth', {)
                writable: true,
    configurable: true) }

                value: 375',' }'

            }');
            Object.defineProperty(window, 'innerHeight', { writable: true', configurable: true,')',
                value: 667',
            const shareData: ShareData = {''
                type: 'score',
                score: 42000,
                stage: 'normal'
            };
            const shareDialog = await socialManager.createShareDialog(shareData);
            shareDialog.open()';
            const dialog = document.querySelector('.share-dialog') as HTMLElement;
            expect(dialog.classList.contains('mobile-layout).toBe(true);

            // タッチ用の大きなボタンサイズを確認
            const buttons = dialog.querySelectorAll('.platform-button);
            buttons.forEach(button => {  ),
                const styles = getComputedStyle(button, as Element) }

                expect(parseInt(styles.minHeight).toBeGreaterThanOrEqual(44); // iOS推奨サイズ' }'

            }');

        }''
        test('タッチジェスチャーによる共有操作', async () => { // タッチイベントのシミュレート
            const shareButton = document.createElement('button'),
            shareButton.className = 'share-button',
            domElements.actionButtons.appendChild(shareButton),

            // タッチスタート・エンドをシミュレート
            const touchStart = new TouchEvent('touchstart', {
                touches: [{
                    clientX: 100',
    clientY: 100  }]
                    target: shareButton }]'
                } as Touch]''
            ');
            const touchEnd = new TouchEvent('touchend', { changedTouches: [{
                    clientX: 100),
                    clientY: 100)],
    target: shareButton }]
                } as Touch]
            ),
            shareButton.dispatchEvent(touchStart);
            shareButton.dispatchEvent(touchEnd);

            // タッチイベントが適切に処理されることを確認
            expect(shareButton.classList.contains('touched).toBe(true);'}');

    }''
    describe('アクセシビリティ統合', () => {  ''
        test('スクリーンリーダー対応の共有ボタン', async () => {'
            const shareData: ShareData = {''
                type: 'achievement',
                achievement: {''
                    name: 'スピードマスター',' }

                    description: '2分以内でクリア' 
    };
            const shareButton = await socialManager.createShareButton(shareData);
            shareButton.render(domElements.actionButtons);
            const buttonElement = domElements.actionButtons.querySelector('.share-button') as HTMLElement;

            // ARIA属性が適切に設定されることを確認
            expect(buttonElement.getAttribute('aria-label)'.toContain('スピードマスター');
            expect(buttonElement.getAttribute('role)'.toBe('button');
            expect(buttonElement.getAttribute('tabindex)'.toBe('0';}');
        test('キーボードナビゲーション対応', async () => { const shareDialog = await socialManager.createShareDialog({)'
                type: 'score'
            }
                score: 35000) });
            shareDialog.open();

            // フォーカストラップが機能することを確認
            const focusableElements = document.querySelectorAll()';
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]"'';
            ');

            // TABキーでの移動をシミュレート
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab ',''
            document.dispatchEvent(tabEvent),

            // ESCキーでのクローズをシミュレート
            const escEvent = new KeyboardEvent('keydown', { key: 'Escape ',''
            document.dispatchEvent(escEvent),

            // ダイアログが閉じることを確認
            expect(document.querySelector('.share-dialog).toBeFalsy() });

    }'}');