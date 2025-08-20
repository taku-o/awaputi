/**
 * SocialSharingManager 基盤テスト
 */
import { jest } from '@jest/globals';
// Mock interfaces
interface MockStatisticsManager { recordSocialEvent: jest.Mock; }
}
interface MockAchievementManager { getAchievements: jest.Mock; }
}
interface MockLocalizationManager { translate: jest.Mock<string>; }
}
interface MockGameEngine { statisticsManager: MockStatisticsManager,
    achievementManager: MockAchievementManager,
    localizationManager: MockLocalizationManager,
    on: jest.Mock,
    off: jest.Mock,
    emit: jest.Mock,
    isDebugMode: jest.Mock<boolean>; }
}
interface MockLocalStorage { getItem: jest.Mock<string | null>,
    setItem: jest.Mock,
    removeItem: jest.Mock; }
}
interface ShareSettings { enabled: boolean,
    autoPrompt: boolean,
    shareOnHighScore: boolean; }
}
interface PerformanceStats { shareRequests: number,
    successfulShares: number,
    failedShares: number; }
}
interface GameData { score: number,
    isHighScore: boolean,
    stage: string; }
}
interface ScoreData { score: number,
    stage: string; }
}
interface AchievementData { id: string,
    name: string,
    description?: string; }
}
interface ShareResult { type: string,
    content: {
        score?: number,
        message: string,
        achievement?: AchievementData;
    }
    };
    metadata: { platform?: string,
        language?: string;
        isFallback?: boolean; }
    };
}
interface DebugInfo { settings: ShareSettings,
    }
    performanceStats: PerformanceStats & { successRate?: number }
    systemIntegration: { gameEngine: boolean,
        statisticsManager: boolean,
        achievementManager: boolean,
        localizationManager: boolean }
    },
    platform: string,
    onlineStatus: boolean,
}
interface MockShareContentGenerator { generateScoreMessage?: jest.Mock;
    generateAchievementMessage?: jest.Mock; }
}
interface SocialSharingManagerInstance { gameEngine: MockGameEngine,
    settings: ShareSettings,
    performanceStats: PerformanceStats,
    statisticsManager?: MockStatisticsManager;
    achievementManager?: MockAchievementManager;
    localizationManager?: MockLocalizationManager;
    shareContentGenerator: MockShareContentGenerator | null,
    initialize(): Promise<void>;
    loadSettings(): Promise<void>;
    saveSettings(): Promise<void>;
    updateSettings(settings: Partial<ShareSettings>): void,
    onGameEnd(data: GameData): Promise<void>,
    onHighScore(data: ScoreData): Promise<ShareResult>,
    onAchievementUnlocked(data: AchievementData): Promise<ShareResult>,
    promptShareScore(data: ScoreData): Promise<ShareResult>,
    promptShareAchievement(data: AchievementData): Promise<ShareResult>,
    getShareUrl(data: ScoreData): string,
    detectPlatform(): string;
    handleError(code: string, error: Error): void, }
    getPerformanceStats(): PerformanceStats & { successRate: number }
    getDebugInfo(): DebugInfo;
    cleanup(): void;
}'
interface SocialSharingManagerConstructor { ''
    new (gameEngine: MockGameEngine'): SocialSharingManagerInstance,
    }'
}''
describe('SocialSharingManager', () => {  let gameEngine: MockGameEngine,
    let socialSharingManager: SocialSharingManagerInstance,
    beforeEach(() => {
        // モックGameEngineの作成
        gameEngine = {
            statisticsManager: { }
                recordSocialEvent: jest.fn(); }
            },
        achievementManager: { getAchievements: jest.fn(); }
            },'
            localizationManager: { ''
                translate: jest.fn<string>(').mockReturnValue('test message'); }
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
                getItem: jest.fn<string | null>(),
                setItem: jest.fn(),
        removeItem: jest.fn(); }'
            } as MockLocalStorage''
        }');'
        // Navigatorのモック''
        Object.defineProperty(navigator, 'onLine', { writable: true,')'
            value: true)');''
        Object.defineProperty(navigator, 'userAgent', {')'
            writable: true'),'';
            value: 'Mozilla/5.0 (Chrome/90.0')' }
        }),
    }
    afterEach(() => {  if (socialSharingManager) { }
            socialSharingManager.cleanup(); }
        }'
        jest.clearAllMocks();''
    }');''
    describe('初期化', (') => {  ' }'
        test('正常に初期化される', async (') => {' }'
            const { SocialSharingManager } = await import('../core/SocialSharingManager.js') as { SocialSharingManager: SocialSharingManagerConstructor };
            socialSharingManager = new SocialSharingManager(gameEngine);
            expect(socialSharingManager.gameEngine).toBe(gameEngine);
            expect(socialSharingManager.settings.enabled).toBe(true);'
            expect(socialSharingManager.performanceStats.shareRequests).toBe(0);''
        }');''
        test('既存システムとの連携が設定される', async (') => { ' }'
            const { SocialSharingManager } = await import('../core/SocialSharingManager.js') as { SocialSharingManager: SocialSharingManagerConstructor };
            socialSharingManager = new SocialSharingManager(gameEngine);
            await socialSharingManager.initialize();
            expect(socialSharingManager.statisticsManager).toBe(gameEngine.statisticsManager);
            expect(socialSharingManager.achievementManager).toBe(gameEngine.achievementManager);
            expect(socialSharingManager.localizationManager).toBe(gameEngine.localizationManager);'
            expect(socialSharingManager.shareContentGenerator).toBeDefined();''
        }');''
        test('GameEngineイベントリスナーが設定される', async (') => { ' }'
            const { SocialSharingManager } = await import('../core/SocialSharingManager.js') as { SocialSharingManager: SocialSharingManagerConstructor };
            socialSharingManager = new SocialSharingManager(gameEngine);'
            await socialSharingManager.initialize();''
            expect(gameEngine.on').toHaveBeenCalledWith('gameEnd', expect.any(Function);''
            expect(gameEngine.on').toHaveBeenCalledWith('highScore', expect.any(Function);''
            expect(gameEngine.on').toHaveBeenCalledWith('achievementUnlocked', expect.any(Function);''
        }');'
    }''
    describe('設定管理', () => {  ' }'
        beforeEach(async (') => {' }'
            const { SocialSharingManager } = await import('../core/SocialSharingManager.js') as { SocialSharingManager: SocialSharingManagerConstructor };'
            socialSharingManager = new SocialSharingManager(gameEngine);''
        }');''
        test('設定の読み込み', async () => {  }
            const savedSettings = JSON.stringify({ autoPrompt: false });
            (window.localStorage as unknown as MockLocalStorage).getItem.mockReturnValue(savedSettings);'
            await socialSharingManager.loadSettings();''
            expect(window.localStorage.getItem').toHaveBeenCalledWith('socialSharingSettings');'
            expect(socialSharingManager.settings.autoPrompt).toBe(false);''
        }');''
        test('設定の保存', async () => {  await socialSharingManager.saveSettings();''
            expect(window.localStorage.setItem').toHaveBeenCalledWith(')';
                'socialSharingSettings'); }'
                JSON.stringify(socialSharingManager.settings);' }'
        }');''
        test('設定の更新', () => {  }
            const newSettings: Partial<ShareSettings> = { shareOnHighScore: false }
            socialSharingManager.updateSettings(newSettings);'
            expect(socialSharingManager.settings.shareOnHighScore).toBe(false);''
        }');'
    }''
    describe('イベント処理', () => {  ' }'
        beforeEach(async (') => {' }'
            const { SocialSharingManager } = await import('../core/SocialSharingManager.js') as { SocialSharingManager: SocialSharingManagerConstructor };'
            socialSharingManager = new SocialSharingManager(gameEngine);''
        }');''
        test('ゲーム終了時の処理', async (') => {  const gameData: GameData = { 
                score: 1000, ';
                isHighScore: true,' }'
                stage: 'normal' }
            },
            
            await socialSharingManager.onGameEnd(gameData);'
            // 統計イベントの記録確認''
            expect(gameEngine.statisticsManager.recordSocialEvent').toHaveBeenCalledWith(')';
                'gameEnd');
                expect.objectContaining({ score: 1000,)
                    wasShared: false),';
            );' }'
        }');''
        test('ハイスコア達成時の処理', async () => {  ''
            await socialSharingManager.initialize('' }'
                stage: 'hard'  })
            })
            );
            const result = await socialSharingManager.onHighScore(scoreData);'
            expect(result).toBeDefined();''
            expect(result.type').toBe('score');'
            expect(result.content.score).toBe(2000);''
            expect(result.content.message').toContain('2,000');''
        }');''
        test('実績解除時の処理', async () => {  ''
            await socialSharingManager.initialize(''';
                id: 'first_100', ' }'
                name: '初回100点達成'  })
            })
            );
            const result = await socialSharingManager.onAchievementUnlocked(achievementData);'
            expect(result).toBeDefined();''
            expect(result.type').toBe('achievement');'
            expect(result.content.achievement).toBe(achievementData);''
            expect(result.content.message').toContain('初回100点達成');''
        }');'
    }''
    describe('ShareContentGenerator統合', () => {  ' }'
        beforeEach(async (') => {' }'
            const { SocialSharingManager } = await import('../core/SocialSharingManager.js') as { SocialSharingManager: SocialSharingManagerConstructor };
            socialSharingManager = new SocialSharingManager(gameEngine);'
            await socialSharingManager.initialize();''
        }');''
        test('スコアメッセージが正しく生成される', async (') => { ' }'
            const scoreData: ScoreData = { score: 1500, stage: 'normal' }'
            const result = await socialSharingManager.promptShareScore(scoreData);''
            expect(result.content.message').toContain('1,500');'
            expect(result.metadata.platform).toBeDefined();''
            expect(result.metadata.language').toBe('ja');''
        }');''
        test('実績メッセージが正しく生成される', async (') => {  const achievementData: AchievementData = { ''
                id: 'combo_master', '';
                name: 'コンボマスター',' }'
                description: '10連続コンボ達成' }
            },'
            const result = await socialSharingManager.promptShareAchievement(achievementData);''
            expect(result.content.message').toContain('コンボマスター');'
            expect(result.metadata.platform).toBeDefined();''
        }');''
        test('共有URLが正しく生成される', (') => { ' }'
            const scoreData: ScoreData = { score: 1000, stage: 'normal' }'
            const url = socialSharingManager.getShareUrl(scoreData);''
            expect(url').toContain('score=1000');''
            expect(url').toContain('stage=normal');''
            expect(url').toContain('utm_source=social_share');''
        }');''
        test('ShareContentGeneratorエラー時のフォールバック', async (') => {  // ShareContentGeneratorを無効化
            socialSharingManager.shareContentGenerator = null; }'
            ' }'
            const scoreData: ScoreData = { score: 1000, stage: 'normal' }
            const result = await socialSharingManager.promptShareScore(scoreData);'
            expect(result.metadata.isFallback).toBe(true);''
            expect(result.content.message').toContain('1000点');''
        }');'
    }''
    describe('プラットフォーム検出', () => {  ' }'
        beforeEach(async (') => {' }'
            const { SocialSharingManager } = await import('../core/SocialSharingManager.js') as { SocialSharingManager: SocialSharingManagerConstructor };'
            socialSharingManager = new SocialSharingManager(gameEngine);''
        }');''
        test('Web Share API対応ブラウザの検出', (') => {  ''
            Object.defineProperty(navigator, 'share', {);
                value: jest.fn(), }
                writable: true }
            }),'
            const platform = socialSharingManager.detectPlatform();''
            expect(platform').toBe('web-share');''
        }');''
        test('Twitter ブラウザの検出', (') => {  ''
            Object.defineProperty(navigator, 'userAgent', {)'
                writable: true,') }'
                value: 'Mozilla/5.0 Twitter'); }
            });'
            const platform = socialSharingManager.detectPlatform();''
            expect(platform').toBe('twitter');''
        }');''
        test('一般ブラウザの検出', () => {  const platform = socialSharingManager.detectPlatform();' }'
            expect(platform').toBe('generic');' }'
        }');'
    }''
    describe('エラーハンドリング', () => {  ' }'
        beforeEach(async (') => {' }'
            const { SocialSharingManager } = await import('../core/SocialSharingManager.js') as { SocialSharingManager: SocialSharingManagerConstructor };'
            socialSharingManager = new SocialSharingManager(gameEngine);''
        }');''
        test('エラー統計の更新', (') => {  ''
            const error = new Error('テストエラー'');''
            socialSharingManager.handleError('TEST_ERROR', error); }'
            expect(socialSharingManager.performanceStats.failedShares).toBe(1);' }'
        }');''
        test('設定読み込みエラーの処理', async () => {  ''
            (window.localStorage as unknown as MockLocalStorage).getItem.mockImplementation((') => {' }'
                throw new Error('Storage error'); }
            });
            // エラーが発生してもクラッシュしないことを確認'
            await expect(socialSharingManager.loadSettings().resolves.not.toThrow();''
        }');'
    }''
    describe('パフォーマンス統計', () => {  ' }'
        beforeEach(async (') => {' }'
            const { SocialSharingManager } = await import('../core/SocialSharingManager.js') as { SocialSharingManager: SocialSharingManagerConstructor };'
            socialSharingManager = new SocialSharingManager(gameEngine);''
        }');''
        test('統計情報の取得', () => {  socialSharingManager.performanceStats.shareRequests = 10;
            socialSharingManager.performanceStats.successfulShares = 8;
            
            const stats = socialSharingManager.getPerformanceStats();
            expect(stats.successRate).toBe(80);
            expect(stats.shareRequests).toBe(10); }'
            expect(stats.successfulShares).toBe(8);' }'
        }');'
    }''
    describe('デバッグ機能', () => {  ' }'
        beforeEach(async (') => {' }'
            const { SocialSharingManager } = await import('../core/SocialSharingManager.js') as { SocialSharingManager: SocialSharingManagerConstructor };'
            socialSharingManager = new SocialSharingManager(gameEngine);''
        }');''
        test('デバッグ情報の取得', () => {  const debugInfo = socialSharingManager.getDebugInfo();''
            expect(debugInfo').toHaveProperty('settings');''
            expect(debugInfo').toHaveProperty('performanceStats');''
            expect(debugInfo').toHaveProperty('systemIntegration');''
            expect(debugInfo').toHaveProperty('platform');' }'
            expect(debugInfo').toHaveProperty('onlineStatus');' }'
        }');''
        test('システム連携状態の確認', () => {  const debugInfo = socialSharingManager.getDebugInfo();
            expect(debugInfo.systemIntegration.gameEngine).toBe(true);
            expect(debugInfo.systemIntegration.statisticsManager).toBe(true);
            expect(debugInfo.systemIntegration.achievementManager).toBe(true); }'
            expect(debugInfo.systemIntegration.localizationManager).toBe(true);' }'
        }');'
    }''
    describe('クリーンアップ', () => {  ' }'
        beforeEach(async (') => {' }'
            const { SocialSharingManager } = await import('../core/SocialSharingManager.js') as { SocialSharingManager: SocialSharingManagerConstructor };'
            socialSharingManager = new SocialSharingManager(gameEngine);''
        }');''
        test('正常にクリーンアップされる', () => {  socialSharingManager.cleanup();''
            expect(gameEngine.off').toHaveBeenCalledWith('gameEnd', expect.any(Function);''
            expect(gameEngine.off').toHaveBeenCalledWith('highScore', expect.any(Function);' }'
            expect(gameEngine.off').toHaveBeenCalledWith('achievementUnlocked', expect.any(Function); }
        });'
    }''
}');