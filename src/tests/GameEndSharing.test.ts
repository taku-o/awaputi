/**
 * ゲーム終了時共有機能テスト (Task, 8)
 */
import { jest  } from '@jest/globals';
// モック用の型定義
interface MockSocialSharingManager {
    settings: { enable,d: boolean,
    onHighScore: jest.Mock,
    onGameEnd: jest.Mock,
}
interface MockStatisticsManager { getAccuracy: jest.Mock,
    getMaxCombo: jest.Mock;
    getBubblesPopped: jest.Mock  }
interface MockStageManager { getCurrentStage: jest.Mock }
interface MockPlayerData { currentScore: number,
    ap: number;
    tap: number;
    highScores: Record<string, number>;
    save: jest.Mock  }
interface MockGameEngine { isGameOver: boolean,
    playerData: MockPlayerData;
    stageManager: MockStageManager;
    statisticsManager: MockStatisticsManager | null;
    socialSharingManager: MockSocialSharingManager | null;
    errorHandler: {
        handleErro,r: jest.Mock };
    emit: jest.Mock;
    canvas: { width: number,, height: number,;
    timeRemaining: number,
    getGameTime?: jest.Mock;
}
interface GameEndData { score: number,
    isHighScore: boolean;
    stage?: string;
    stageType?: string;
    accuracy: number;
    combo: number;
    bubblesPopped: number;
    playTime: number;
    timestamp: number;
interface ShareSettings { shareOnHighScore: boolean,
    shareOnGameEnd: boolean;
    minScoreThreshold: number;
    shareInterval: number;
    lastShareTime: number;
    preferredPlatforms: string[];
    autoPrompt: boolean;
interface MockGameScene { gameEngine: MockGameEngine,
    floatingTextManager: {
        addAnimatedTex,t: jest.Mock };
    prepareGameEndData: (finalScore: number, isNewHighScore: boolean, currentStage: any) => GameEndData;
    triggerSharePrompt: (gameEndData: GameEndData) => Promise<void>;
    showHighScoreSharePrompt: (gameEndData: GameEndData, socialSharingManager: MockSocialSharingManager) => Promise<void>;
    showGameEndSharePrompt: (gameEndData: GameEndData, socialSharingManager: MockSocialSharingManager) => Promise<void>;
    generateHighScoreMessage: (gameEndData: GameEndData) => any;
    generateGameEndMessage: (gameEndData: GameEndData) => any;
    shouldShowSharePrompt: (gameEndData: GameEndData) => boolean;
    getShareSettings: jest.Mock<ShareSettings> | (() => ShareSettings};
    saveShareSettings: jest.Mock | ((settings: Partial<ShareSettings>) => void};
    updateLastShareTime: jest.Mock | (() => void;
    log: jest.Mock | ((message: string) => void};
    getGameTime: () => number;
}
// LocalStorageのモック型
interface MockLocalStorage { getItem: jest.Mock,
    setItem: jest.Mock;
    removeItem: jest.Mock;
    clear?: () => void }'
}
declare global { interface Window {
    localStorage: MockLocalStorage;''
describe('GameEndSharing', () => {  let gameScene: MockGameScene,
    let mockGameEngine: MockGameEngine,
    let mockSocialSharingManager: MockSocialSharingManager,
    beforeEach(async () => {
        // GameEngineのモック }
        mockSocialSharingManager = { }
            settings: { enabled: true,,''
            onHighScore: jest.fn<() => Promise<{ success: boolean,, method: string,>>().mockResolvedValue({ success: true, method: 'web-share'
            }',''
            onGameEnd: jest.fn<() => Promise<{ success: boolean,, method: string,>>().mockResolvedValue({ success: true, method: 'web-share'
            });
        
        mockGameEngine = { isGameOver: false,
            playerData: {
                currentScore: 1500,
                ap: 100,
    tap: 500 }
                highScores: {};
        save: jest.fn(),
            },

            stageManager: { ''
                getCurrentStage: jest.fn()','
    id: 'normal',')',
                    type: 'normal'
            };
            statisticsManager: { getAccuracy: jest.fn().mockReturnValue(85.5),
                getMaxCombo: jest.fn().mockReturnValue(15,
    getBubblesPopped: jest.fn().mockReturnValue(150 }
            socialSharingManager: mockSocialSharingManager,
    errorHandler: { handleError: jest.fn( };
            emit: jest.fn(
    canvas: { width: 800, height: 600  },

            timeRemaining: 240000, // 4分残り;
            getGameTime: jest.fn().mockReturnValue(60000) // 1分経過;
        },
        // GameSceneのモック（必要なメソッドのみ）
        const { GameScene } = await import('../scenes/GameScene.ts';
        // GameSceneの部分モック
        gameScene = { gameEngine: mockGameEngine,
        floatingTextManager: {''
                addAnimatedText: jest.fn()  };
            // 実際のメソッドを呼び出し
            prepareGameEndData: GameScene.prototype.prepareGameEndData,
            triggerSharePrompt: GameScene.prototype.triggerSharePrompt,
            showHighScoreSharePrompt: GameScene.prototype.showHighScoreSharePrompt,
            showGameEndSharePrompt: GameScene.prototype.showGameEndSharePrompt,
            generateHighScoreMessage: GameScene.prototype.generateHighScoreMessage,
            generateGameEndMessage: GameScene.prototype.generateGameEndMessage,
            shouldShowSharePrompt: GameScene.prototype.shouldShowSharePrompt,
            getShareSettings: GameScene.prototype.getShareSettings,
            saveShareSettings: GameScene.prototype.saveShareSettings,
            updateLastShareTime: GameScene.prototype.updateLastShareTime,
            log: GameScene.prototype.log,
    getGameTime: GameScene.prototype.getGameTime,
        },
        ;
        // LocalStorageのモック
        Object.defineProperty(window, 'localStorage', { )
            value: {),
                getItem: jest.fn(),
                setItem: jest.fn(
    removeItem: jest.fn( }
            writable: true,
        ),
        // console.logのモック
        global.console.log = jest.fn();
        global.console.error = jest.fn();
    );
    afterEach(() => {  jest.clearAllMocks() }
        (localStorage, as MockLocalStorage).clear?.();' }'

    }');'
    describe('prepareGameEndData', () => {  ''
        test('ゲーム終了データが正しく準備される', () => {
            const finalScore = 2500 }

            const isNewHighScore = true; : undefined', '
            const currentStage = { id: 'boss', type: 'boss'
            }

            const gameEndData = gameScene.prepareGameEndData(finalScore, isNewHighScore, currentStage);
            expect(gameEndData).toEqual({ score: 2500,

                isHighScore: true,
                stage: 'boss',
                stageType: 'boss',
                accuracy: 85.5,
                combo: 15),
                bubblesPopped: 150,
    playTime: 60000,','
        timestamp: expect.any(Number  }

            }'}';
        test('StatisticsManagerが無い場合のフォールバック', () => { mockGameEngine.statisticsManager = null,
            ','

            const gameEndData = gameScene.prepareGameEndData(1000, false, null),
            expect(gameEndData).toEqual({
                score: 1000,
                isHighScore: false,
                stage: 'unknown',
                stageType: 'normal',
                accuracy: 0,
                combo: 0),
                bubblesPopped: 0,
    playTime: 60000 }
        timestamp: expect.any(Number); 
    });

            }'}');

    }''
    describe('triggerSharePrompt', () => {  ''
        test('ハイスコア達成時に高スコア共有プロンプトが表示される', async () => {
            const gameEndData: GameEndData = {
                score: 3000,
                isHighScore: true,
                stage: 'normal',
                stageType: 'normal',
                accuracy: 85.5,
                combo: 15,
                bubblesPopped: 150,
    playTime: 60000 }
        timestamp: Date.now(); 
    };

            gameScene.getShareSettings = jest.fn<() => ShareSettings>().mockReturnValue({ shareOnHighScore: true,
                shareOnGameEnd: false,
                minScoreThreshold: 1000),
                shareInterval: 5 * 60 * 1000)','
    lastShareTime: 0,
                preferredPlatforms: ['web-share', 'twitter', 'facebook']),
                autoPrompt: true),
            gameScene.showHighScoreSharePrompt = jest.fn<() => Promise<void>>().mockResolvedValue(),
            await gameScene.triggerSharePrompt(gameEndData),
            expect(gameScene.showHighScoreSharePrompt).toHaveBeenCalledWith(
                gameEndData)','
                mockSocialSharingManager','
            }'

        }');'
        test('通常ゲーム終了時に共有プロンプトが表示される', async () => {  const gameEndData: GameEndData = {
                score: 1500,
                isHighScore: false,
                stage: 'normal',
                stageType: 'normal',
                accuracy: 85.5,
                combo: 15,
                bubblesPopped: 150,
    playTime: 60000 }
        timestamp: Date.now(); 
    };

            gameScene.getShareSettings = jest.fn<() => ShareSettings>().mockReturnValue({ shareOnHighScore: true,
                shareOnGameEnd: true,
                minScoreThreshold: 1000),
                shareInterval: 5 * 60 * 1000)','
    lastShareTime: 0,
                preferredPlatforms: ['web-share', 'twitter', 'facebook']),
                autoPrompt: true),
            gameScene.shouldShowSharePrompt = jest.fn<() => boolean>().mockReturnValue(true),
            gameScene.showGameEndSharePrompt = jest.fn<() => Promise<void>>().mockResolvedValue(),
            await gameScene.triggerSharePrompt(gameEndData),
            expect(gameScene.showGameEndSharePrompt).toHaveBeenCalledWith(
                gameEndData)','
                mockSocialSharingManager','
            }'

        }');'
        test('SocialSharingManagerが無効時は何もしない', async () => {  mockGameEngine.socialSharingManager = null,
            
            const gameEndData: GameEndData = {
                score: 1000,
                isHighScore: false,
                accuracy: 0,
                combo: 0,
                bubblesPopped: 0,
    playTime: 60000 }
        timestamp: Date.now(); 
    };
            gameScene.log = jest.fn();

            await gameScene.triggerSharePrompt(gameEndData);
            expect(gameScene.log).toHaveBeenCalledWith()';'
                'ソーシャル共有システムが無効、またはSocialSharingManagerが見つかりません');'}');
        test('エラー発生時の処理', async () => {  const gameEndData: GameEndData = {
                score: 1000,
                isHighScore: true,
                accuracy: 0,
                combo: 0,
    bubblesPopped: 0,
                playTime: 60000,
        timestamp: Date.now()','
            const testError = new Error('テストエラー),'
            gameScene.getShareSettings = jest.fn().mockImplementation(() => { }
                throw testError; }
            });

            await gameScene.triggerSharePrompt(gameEndData);
            expect(mockGameEngine.errorHandler.handleError).toHaveBeenCalledWith(';'
                testError,
                'GameScene',
                { ')'
                    context: 'triggerSharePrompt'),
                    gameEndData }

                }';}');

    }''
    describe('showHighScoreSharePrompt', () => {  ''
        test('ハイスコア共有プロンプトが正しく表示される', async () => {
            const gameEndData: GameEndData = {'
                score: 5000,
                stage: 'boss',
                accuracy: 90,
                combo: 20,
                isHighScore: true,
                bubblesPopped: 200,
    playTime: 120000 }
        timestamp: Date.now(); 
    };

            gameScene.generateHighScoreMessage = jest.fn('''
                title: '新記録達成！ BubblePop',';'
                text: '🎉 新記録達成！5,000点を記録しました！ステージ: boss',')';
                hashtags: ['BubblePop', 'NewRecord', 'HighScore', 'Gaming]);'
            gameScene.updateLastShareTime = jest.fn();
            gameScene.log = jest.fn();

            await gameScene.showHighScoreSharePrompt(gameEndData, mockSocialSharingManager);
            expect(mockSocialSharingManager.onHighScore).toHaveBeenCalledWith({ ...gameEndData,''
                title: '新記録達成！ BubblePop',
                text: '🎉 新記録達成！5,000点を記録しました！ステージ: boss',','
                hashtags: ['BubblePop', 'NewRecord', 'HighScore', 'Gaming']),
                url: window.location.href,
            expect(gameScene.updateLastShareTime).toHaveBeenCalled(),' }'

        }');'

    }''
    describe('showGameEndSharePrompt', () => {  ''
        test('ゲーム終了時共有プロンプトが正しく表示される', async () => {
            const gameEndData: GameEndData = {
                score: 2500,
                accuracy: 85,
                combo: 12,
                isHighScore: false,
                bubblesPopped: 150,
    playTime: 90000 }
        timestamp: Date.now(); 
    };

            gameScene.generateGameEndMessage = jest.fn('''
                title: 'BubblePop - 2,500点獲得',';'
                text: '🎮 BubblePopで2,500点を獲得！ 精度85%の素晴らしいプレイ！ 最大コンボ12連鎖達成！',')';
                hashtags: ['BubblePop', 'Gaming', 'Score]);'
            gameScene.updateLastShareTime = jest.fn();
            gameScene.log = jest.fn();

            await gameScene.showGameEndSharePrompt(gameEndData, mockSocialSharingManager);
            expect(mockSocialSharingManager.onGameEnd).toHaveBeenCalledWith({ ...gameEndData,''
                title: 'BubblePop - 2,500点獲得',
                text: '🎮 BubblePopで2,500点を獲得！ 精度85%の素晴らしいプレイ！ 最大コンボ12連鎖達成！',','
                hashtags: ['BubblePop', 'Gaming', 'Score']),
                url: window.location.href,
            expect(gameScene.updateLastShareTime).toHaveBeenCalled(),' }'

        }');'

    }''
    describe('メッセージ生成機能', () => {  ''
        test('ハイスコアメッセージが正しく生成される', () => {
            const gameEndData: GameEndData = {'
                score: 15000,
                stage: 'ultimate',
                isHighScore: true,
                accuracy: 95,
                combo: 30,
                bubblesPopped: 300,
    playTime: 180000 }
        timestamp: Date.now(); 
    };
            ';'

            const message = gameScene.generateHighScoreMessage(gameEndData);
            expect(message).toEqual({ ''
                title: '新記録達成！ BubblePop',','
                text: '🎉 新記録達成！15,000点を記録しました！ステージ: ultimate',')',
                hashtags: ['BubblePop', 'NewRecord', 'HighScore', 'Gaming]'}

        }''
        test('ゲーム終了メッセージ（高精度）が正しく生成される', () => {  const gameEndData: GameEndData = {
                score: 8500,
                accuracy: 92.5,
                combo: 25,
                isHighScore: false,
                bubblesPopped: 250,
    playTime: 150000 }
        timestamp: Date.now(); 
    };
            ';'

            const message = gameScene.generateGameEndMessage(gameEndData);
            expect(message.title).toBe('BubblePop - 8,500点獲得';
            expect(message.text).toContain('🎮 BubblePopで8,500点を獲得！';
            expect(message.text).toContain('精度93%の素晴らしいプレイ！'; // 四捨五入'
            expect(message.text).toContain('最大コンボ25連鎖達成！';
            expect(message.hashtags).toEqual(['BubblePop', 'Gaming', 'Score]';}');'
        test('ゲーム終了メッセージ（低精度・低コンボ）が正しく生成される', () => {  const gameEndData: GameEndData = {
                score: 1200,
                accuracy: 60,
                combo: 5,
                isHighScore: false,
                bubblesPopped: 50,
    playTime: 60000 }
        timestamp: Date.now(); 
    };
            ';'

            const message = gameScene.generateGameEndMessage(gameEndData);
            expect(message.text).toBe('🎮 BubblePopで1,200点を獲得！';
            expect(message.text).not.toContain('精度';
            expect(message.text).not.toContain('コンボ';}');'

    }''
    describe('shouldShowSharePrompt', () => {  ''
        test('最小スコア閾値を下回る場合はfalse', () => {''
            gameScene.getShareSettings = jest.fn<() => ShareSettings>().mockReturnValue({'
                shareOnHighScore: true,
                shareOnGameEnd: true,
                minScoreThreshold: 2000),
                shareInterval: 5 * 60 * 1000','
    lastShareTime: 0,
                preferredPlatforms: ['web-share', 'twitter', 'facebook']) }
                autoPrompt: true); 
    });
            const gameEndData: GameEndData = { score: 1500,
                isHighScore: false,
                accuracy: 70,
                combo: 10,
                bubblesPopped: 100,
                playTime: 60000,
    timestamp: Date.now(  };
            const result = gameScene.shouldShowSharePrompt(gameEndData);

            expect(result).toBe(false);'}');
        test('共有間隔が短すぎる場合はfalse', () => {  const now = Date.now(),
            const recentShareTime = now - (2 * 60 * 1000), // 2分前

            gameScene.getShareSettings = jest.fn<() => ShareSettings>().mockReturnValue({'
                shareOnHighScore: true,
                shareOnGameEnd: true),
                minScoreThreshold: 1000','
    shareInterval: 5 * 60 * 1000, // 5分間隔,
                lastShareTime: recentShareTime,
                preferredPlatforms: ['web-share', 'twitter', 'facebook']) }
                autoPrompt: true); 
    });
            const gameEndData: GameEndData = { score: 2000,
                isHighScore: false,
                accuracy: 80,
                combo: 15,
                bubblesPopped: 150,
                playTime: 90000,
    timestamp: Date.now(  };
            const result = gameScene.shouldShowSharePrompt(gameEndData);

            expect(result).toBe(false);'}');
        test('条件を満たす場合はtrue', () => {  const now = Date.now(),
            const oldShareTime = now - (10 * 60 * 1000), // 10分前

            gameScene.getShareSettings = jest.fn<() => ShareSettings>().mockReturnValue({'
                shareOnHighScore: true,
                shareOnGameEnd: true,
                minScoreThreshold: 1000),
                shareInterval: 5 * 60 * 1000','
    lastShareTime: oldShareTime,
                preferredPlatforms: ['web-share', 'twitter', 'facebook']) }
                autoPrompt: true); 
    });
            const gameEndData: GameEndData = { score: 2000,
                isHighScore: false,
                accuracy: 80,
                combo: 15,
                bubblesPopped: 150,
                playTime: 90000,
    timestamp: Date.now(  };
            const result = gameScene.shouldShowSharePrompt(gameEndData);

            expect(result).toBe(true);'}');

    }''
    describe('共有設定管理', () => {  ''
        test('デフォルト共有設定が返される', () => {
            (localStorage.getItem, as jest.Mock).mockReturnValue(null),

            const settings = gameScene.getShareSettings(),
            expect(settings).toEqual({
                shareOnHighScore: true,
                shareOnGameEnd: false,
                minScoreThreshold: 1000),
                shareInterval: 5 * 60 * 1000)','
    lastShareTime: 0,
                preferredPlatforms: ['web-share', 'twitter', 'facebook']) }

                autoPrompt: true',' }'

            }');'

        }''
        test('保存済み設定が正しく読み込まれる', () => {  const savedSettings: Partial<ShareSettings> = {
                shareOnHighScore: false,
    shareOnGameEnd: true,
                minScoreThreshold: 5000 
    };
            (localStorage.getItem, as jest.Mock).mockReturnValue(JSON.stringify(savedSettings);
            const settings = gameScene.getShareSettings();
            expect(settings.shareOnHighScore).toBe(false);
            expect(settings.shareOnGameEnd).toBe(true);
            expect(settings.minScoreThreshold).toBe(5000);
            // デフォルト値も含まれる
            expect(settings.shareInterval).toBe(5 * 60 * 1000);'}');
        test('設定が正しく保存される', () => {  const existingSettings: Partial<ShareSettings> = {
                shareOnHighScore: true,
                minScoreThreshold: 1000 
    };
            (localStorage.getItem, as jest.Mock).mockReturnValue(JSON.stringify(existingSettings);
            const newSettings: Partial<ShareSettings> = { shareOnGameEnd: true,
                minScoreThreshold: 2000  };
            gameScene.log = jest.fn();

            gameScene.saveShareSettings(newSettings);
            expect(localStorage.setItem).toHaveBeenCalledWith(';'
                'bubblepop_share_settings);'
                JSON.stringify({ shareOnHighScore: true)
                   , minScoreThreshold: 2000),
                    shareOnGameEnd: true),' }'

        }');'
        test('最終共有時刻が更新される', () => { const mockNow = 1640995200000, // 2022-01-01T00:00:00.000Z
            jest.spyOn(Date, 'now).mockReturnValue(mockNow),'
            gameScene.saveShareSettings = jest.fn(),
            gameScene.updateLastShareTime(),
            expect(gameScene.saveShareSettings).toHaveBeenCalledWith({)
                lastShareTime: mockNow,

            (Date.now, as jest.Mock).mockRestore();' }'

        }');'
        test('設定読み込みエラー時のフォールバック', () => {  ''
            (localStorage.getItem, as jest.Mock).mockImplementation(() => { }'

                throw new Error('Storage, error'; }'
            });

            const settings = gameScene.getShareSettings();
            expect(settings).toEqual({ shareOnHighScore: true,
                shareOnGameEnd: false,
                minScoreThreshold: 1000),
                shareInterval: 5 * 60 * 1000)','
    lastShareTime: 0,
                preferredPlatforms: ['web-share', 'twitter', 'facebook'],','
                autoPrompt: true',' }'

            }');'

        }''
        test('設定保存エラー時の処理', () => {  ''
            (localStorage.setItem, as jest.Mock).mockImplementation(() => { }'

                throw new Error('Storage, error'; }'
            });
            global.console.error = jest.fn();

            gameScene.saveShareSettings({ shareOnHighScore: false,);
            expect(console.error).toHaveBeenCalledWith()';'
                '共有設定の保存エラー:');

                expect.any(Error);'}');

    }''
    describe('getGameTime', () => {  ''
        test('GameEngineにgetGameTimeがある場合はそれを使用', () => {
            (mockGameEngine.getGameTime, as jest.Mock).mockReturnValue(120000),
            const gameTime = gameScene.getGameTime(),
            expect(gameTime).toBe(120000) }

            expect(mockGameEngine.getGameTime).toHaveBeenCalled();' }'

        }');'
        test('GameEngineにgetGameTimeがない場合は残り時間から逆算', () => {  delete mockGameEngine.getGameTime,
            mockGameEngine.timeRemaining = 180000, // 3分残り
            
            const gameTime = gameScene.getGameTime(),
            // 初期時間5分(300000ms) - 残り時間3分(180000ms) = 経過時間2分(120000ms) }
            expect(gameTime).toBe(120000);' }'

        }');'
        test('計算結果がマイナスの場合は0を返す', () => {  delete mockGameEngine.getGameTime,
            mockGameEngine.timeRemaining = 400000, // 残り時間が初期時間より多い（異常な状態）
            
            const gameTime = gameScene.getGameTime() }
            expect(gameTime).toBe(0); }
        });
    }'}');